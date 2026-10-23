'use strict'

const { mergeValues, actionMessage, userOf, expectedEcho, sameValue } = require('./values')
const { createAlarms } = require('./alarms')
const { createTrendHistory } = require('./trend')
const { createAccess, createPinGuard } = require('./access')
const { canvases, clientOf } = require('./clients')
const setupAdmin = require('./admin')

// trend history of a canvas, kept while it is redeployed (canvas id -> samples)
const keptTrends = new Map()

// settings a flow may change with msg.ui_update
const DYNAMIC = ['theme', 'animate', 'screen', 'background', 'pageBg', 'viewW', 'viewH', 'phoneAt', 'phoneW', 'fit', 'locale', 'offlineAfter', 'staleAfter', 'alarmSound']
const QUALITY = ['bad', 'uncertain']
// hold-to-run: the page repeats "still pressed" every 400 ms; without it the 0 goes out
const PULSE_WATCHDOG = 1500
const ARMED_MS = 30000

module.exports = function (RED) {
    function UIHmiCanvasNode (config) {
        RED.nodes.createNode(this, config)
        const node = this

        // whole page (default) or inside a group; 0.0.1 flows only had a group
        const scope = config.scope || (config.group && !config.page ? 'group' : 'page')
        const group = scope === 'group' && config.group ? RED.nodes.getNode(config.group) : null
        const page = scope === 'page' && config.page ? RED.nodes.getNode(config.page) : null
        if (!group && !page) {
            node.error(scope === 'group' ? 'No group configured' : 'No page configured')
            return
        }
        const base = (group || page).getBase()
        const symbols = Array.isArray(config.symbols) ? config.symbols : []
        const byId = new Map(symbols.filter(s => s && s.id).map(s => [s.id, s]))
        const pin = () => node.credentials && node.credentials.pin
        const access = createAccess(config)
        const pins = createPinGuard()

        // Latest value of every key, so a page refresh shows the whole screen at once.
        const values = {}
        // when each key last changed (for "stale" marks) and keys flagged bad / uncertain
        const stamps = {}
        const quality = {}
        const staleOn = Number(config.staleAfter) > 0
        const last = base.stores.data.get(node.id)
        if (last && last.payload && typeof last.payload === 'object') Object.assign(values, last.payload)
        if (last && last.quality && typeof last.quality === 'object') Object.assign(quality, last.quality)
        const now0 = Date.now()
        if (staleOn) for (const k of Object.keys(values)) stamps[k] = (last && last.stamps && last.stamps[k]) || now0

        // commands waiting for the PLC to echo them: symbol id -> { key, expect, until, state }
        const confirmMs = Math.max(0, Number(config.confirmTimeout === undefined || config.confirmTimeout === '' ? 5 : config.confirmTimeout)) * 1000
        const pending = new Map()
        // pulses held down right now: symbol id -> { conn, out, timer, onDisc }
        const pulses = new Map()
        // pulses whose password was given: socket id + symbol id -> until
        const armed = new Map()

        // alarm list: kept in the node context, so a persistent context store survives restarts
        const ctx = node.context()
        const alarms = config.alarms === 'off' ? null : createAlarms(symbols, ctx.get('hmiAlarms'))
        const alarmsOut = config.alarmsOut === 'yes'
        const alarmEvents = events => {
            if (!events.length) return
            ctx.set('hmiAlarms', alarms.save())
            if (alarmsOut) for (const ev of events) node.send({ topic: 'alarme', payload: ev })
        }
        // alarms already on at start: sent once the flow is running
        if (alarms) {
            const first = alarms.evaluate(values, now0)
            if (first.length) setImmediate(() => alarmEvents(first))
        }
        // trend history kept here, so a page opened later already shows the last minutes
        const trends = createTrendHistory(symbols, keptTrends.get(node.id))
        keptTrends.delete(node.id)
        // pushes the current values and alarms to every open dashboard
        const refresh = () => setImmediate(() => node.receive({ _hmiRefresh: true }))

        // what every page gets: values, alarms, quality and pending commands
        let sentHistory = -1
        function screenMsg (full) {
            const out = { payload: { ...values }, _hmiTs: Date.now() }
            if (staleOn) out.stamps = { ...stamps }
            if (Object.keys(quality).length) out.quality = { ...quality }
            if (pending.size) {
                out.pending = {}
                for (const [id, p] of pending) out.pending[id] = p.state
            }
            if (alarms) {
                const snap = alarms.snapshot(0)
                out.alarms = { active: snap.active, unacked: snap.unacked, shelved: snap.shelved }
                // the history only goes out when it changed
                if (full || alarms.version !== sentHistory) {
                    out.alarmHist = alarms.snapshot(100).history
                    if (!full) sentHistory = alarms.version
                }
            }
            return out
        }

        // a message only for the page that clicked (notices, password accepted...)
        function tell (conn, data) {
            try { conn.emit('msg-input:' + node.id, { _hmiPrivate: data }) } catch (e) {}
        }

        // quiet: called while a msg is already on its way to the pages
        function alarmCommand (kind, raw, user, quiet) {
            if (!alarms) return
            const now = Date.now()
            let ev = []
            if (kind === 'ack') ev = alarms.ack(String(raw), now, user)
            else if (raw && typeof raw === 'object') {
                const id = String(raw.id || '')
                ev = raw.off ? alarms.unshelve(id, now, user) : alarms.shelve(id, raw.minutes, now, user)
            }
            alarmEvents(ev)
            if (ev.length && !quiet) refresh()
        }

        function sendUp (id, client, why) {
            const up = actionMessage(symbols, values, { _hmiAction: { id, phase: 'up' }, _client: client }, { pin: pin() })
            if (!up || !up.topic) return
            if (why !== 'up') {
                up.audit.action = why
                node.warn('Pulso solto pelo servidor (' + (why === 'disconnect' ? 'página fechada' : 'sem sinal da página') + '): ' + up.audit.symbol)
            }
            node.send(up)
        }

        function endPulse (id, why) {
            const p = pulses.get(id)
            if (!p) return
            pulses.delete(id)
            clearTimeout(p.timer)
            try { p.conn.off('disconnect', p.onDisc) } catch (e) {}
            sendUp(id, p.out._client, why)
        }

        function startPulse (id, conn, out) {
            const old = pulses.get(id)
            if (old) {
                clearTimeout(old.timer)
                try { old.conn.off('disconnect', old.onDisc) } catch (e) {}
            }
            const p = { conn, out, onDisc: () => endPulse(id, 'disconnect') }
            p.timer = setTimeout(() => endPulse(id, 'watchdog'), PULSE_WATCHDOG)
            conn.on('disconnect', p.onDisc)
            pulses.set(id, p)
            node.send(out)
        }

        // a click on the dashboard (through plugin.js, never through beforeSend)
        function clientAction (conn, raw) {
            if (!raw || typeof raw !== 'object') return
            const client = clientOf(RED, conn)
            const user = userOf({ _client: client })
            const say = text => tell(conn, { notice: text, ts: Date.now() })
            if (raw._hmiBeat !== undefined) {
                const p = pulses.get(String(raw._hmiBeat))
                if (p && p.conn === conn) {
                    clearTimeout(p.timer)
                    p.timer = setTimeout(() => endPulse(String(raw._hmiBeat), 'watchdog'), PULSE_WATCHDOG)
                }
                return
            }
            if (raw._hmiAck !== undefined) {
                if (!access.can('ack', client)) return say('Sem permissão para reconhecer alarmes')
                return alarmCommand('ack', raw._hmiAck, user)
            }
            if (raw._hmiShelve !== undefined) {
                if (!access.can('shelve', client)) return say('Sem permissão para suprimir alarmes')
                return alarmCommand('shelve', raw._hmiShelve, user)
            }
            const a = raw._hmiAction
            if (!a || typeof a !== 'object') return
            const id = String(a.id || '')
            const sym = byId.get(id)
            if (!sym || !sym.action) return
            const phase = String(a.phase || '')
            // letting go of a pulse always works
            if (sym.action.mode === 'pulse' && phase === 'up') return endPulse(id, 'up')
            if (base.stores.state.getProperty(node.id, 'enabled') === false) return say('Comandos desligados nesta tela')
            if (!access.can('cmd', client)) return say('Sem permissão para comandar')
            const now = Date.now()
            const who = client.socketIp || client.socketId
            const needPin = sym.action.pin === 'yes'
            const armKey = conn.id + ':' + id
            const isArmed = (armed.get(armKey) || 0) > now
            if (needPin && !isArmed && pins.locked(who, now)) return say('Muitas senhas erradas: espere 1 minuto')
            const out = actionMessage(symbols, values, { _hmiAction: { id, phase, value: a.value, pin: a.pin }, _client: client }, { pin: pin(), armed: isArmed })
            if (!out) return
            if (out.denied) {
                node.warn('Comando recusado: senha incorreta')
                return say(pins.fail(who, now) ? 'Muitas senhas erradas: espere 1 minuto' : 'Senha incorreta')
            }
            if (needPin && a.pin !== undefined) pins.ok(who)
            if (out.armed) {
                armed.set(armKey, now + ARMED_MS)
                return tell(conn, { notice: 'Senha aceita: segure o botão', armed: { id, ms: ARMED_MS }, ts: now })
            }
            if (out.blocked) return say('Bloqueado: ' + out.blocked)
            if (out.rejected) return say(out.rejected)
            if (sym.action.mode === 'pulse') return startPulse(id, conn, out)
            node.send(out)
            const expect = expectedEcho(sym, out, phase)
            if (confirmMs && expect !== undefined && !sameValue(values[sym.key], expect)) {
                pending.set(id, { key: sym.key, expect, until: now + confirmMs, state: 'wait', name: out.audit.symbol })
                refresh()
            }
        }

        // what a page gets when it opens (or reconnects): everything, built now
        function load (conn) {
            const client = clientOf(RED, conn)
            const out = screenMsg(true)
            if (trends.size) out.trendHist = trends.snapshot()
            out._hmiPrivate = { perm: access.of(client), user: userOf({ _client: client }) }
            return out
        }

        // pending commands time out, shelved alarms come back when their time is over
        const ticker = setInterval(() => {
            const now = Date.now()
            let changed = false
            for (const [id, p] of pending) {
                if (p.state === 'wait' && p.until <= now) {
                    p.state = 'fail'
                    p.until = now + 10000
                    node.warn('Sem confirmação do CLP: ' + p.name)
                    changed = true
                } else if (p.state === 'fail' && p.until <= now) {
                    pending.delete(id)
                    changed = true
                }
            }
            for (const [k, until] of armed) if (until <= now) armed.delete(k)
            if (alarms) {
                const ev = alarms.expire(now)
                alarmEvents(ev)
                if (ev.length) changed = true
            }
            if (changed) refresh()
        }, 1000)

        const evts = {
            // clicks come through plugin.js; the widget-action path stays closed
            onAction: false,
            beforeSend: function (msg) {
                if (!msg) return null
                const now = Date.now()
                let used = !!msg._hmiRefresh
                // alarm commands from the flow (always allowed: the flow is trusted);
                // _hmiAction only comes from pages, through plugin.js
                if (msg._hmiAck !== undefined) { alarmCommand('ack', msg._hmiAck, userOf(msg), true); used = true }
                if (msg._hmiShelve !== undefined) { alarmCommand('shelve', msg._hmiShelve, userOf(msg), true); used = true }
                if (msg._hmiAction) used = true
                else if (!msg._hmiRefresh) {
                    const p = msg.payload
                    const keys = p !== null && typeof p === 'object' && !Array.isArray(p) && !Buffer.isBuffer(p) ? Object.keys(p) : (typeof msg.topic === 'string' && msg.topic && p !== undefined ? [msg.topic] : [])
                    if (mergeValues(values, msg)) {
                        used = true
                        if (staleOn) for (const k of keys) stamps[k] = now
                    }
                    // msg.quality: { key: "bad" | "uncertain" | "good" }
                    if (msg.quality && typeof msg.quality === 'object') {
                        used = true
                        for (const [k, q] of Object.entries(msg.quality)) {
                            if (QUALITY.includes(q)) quality[k] = q
                            else delete quality[k]
                        }
                    }
                    // commands confirmed by the value read back
                    for (const [id, pd] of pending) {
                        if (pd.state === 'wait' && sameValue(values[pd.key], pd.expect)) pending.delete(id)
                    }
                }
                const out = screenMsg(false)
                trends.record(values, out._hmiTs)
                if (alarms) {
                    const ev = alarms.evaluate(values, out._hmiTs)
                    if (ev.length) {
                        alarmEvents(ev)
                        const snap = alarms.snapshot(0)
                        out.alarms = { active: snap.active, unacked: snap.unacked, shelved: snap.shelved }
                        out.alarmHist = alarms.snapshot(100).history
                        sentHistory = alarms.version
                    }
                }
                // standard dynamic properties stay on the msg for Dashboard 2.0
                for (const k of ['enabled', 'visible', 'class']) if (msg[k] !== undefined) { out[k] = msg[k]; used = true }
                if (msg.ui_update && typeof msg.ui_update === 'object') {
                    const upd = {}
                    for (const k of DYNAMIC) {
                        if (msg.ui_update[k] === undefined) continue
                        upd[k] = msg.ui_update[k]
                        base.stores.state.set(base, node, msg, k, msg.ui_update[k])
                    }
                    if (msg.ui_update.class !== undefined) upd.class = msg.ui_update.class
                    out.ui_update = upd
                    used = true
                }
                if (!used) node.warn('Nothing to show: send an object in msg.payload, or msg.topic with a value')
                // the dashboard always gets the full set of values
                return out
            },
            onInput: function (msg) {
                if (!msg) return
                base.stores.data.save(base, node, msg)
                const n = Object.keys(values).length
                const act = alarms ? alarms.snapshot(0).active.length : 0
                node.status({ fill: act ? 'red' : 'green', shape: 'dot', text: n + (n === 1 ? ' value' : ' values') + (act ? ' · ' + act + (act === 1 ? ' alarm' : ' alarms') : '') })
            }
        }

        const entry = { action: clientAction, load, error: e => node.error(e) }
        canvases.set(node.id, entry)
        node.on('close', (removed, done) => {
            clearInterval(ticker)
            // nothing stays pressed when the flow is redeployed or stopped
            for (const id of [...pulses.keys()]) endPulse(id, 'disconnect')
            if (canvases.get(node.id) === entry) canvases.delete(node.id)
            if (!removed && trends.size) keptTrends.set(node.id, trends.snapshot())
            done()
        })

        if (group) group.register(node, config, evts)
        else page.register(null, node, { ...config, group: '' }, evts)
    }

    RED.nodes.registerType('ui-hmi-canvas', UIHmiCanvasNode, { credentials: { pin: { type: 'password' } } })
    setupAdmin(RED)
}

module.exports.keptTrends = keptTrends
