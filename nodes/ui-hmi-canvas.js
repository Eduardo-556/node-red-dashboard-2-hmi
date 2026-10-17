'use strict'

const { mergeValues, actionMessage, userOf } = require('./values')
const { createAlarms } = require('./alarms')
const { createTrendHistory } = require('./trend')
const setupAdmin = require('./admin')

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

        // Latest value of every key, so a page refresh shows the whole screen at once.
        const values = {}
        const last = base.stores.data.get(node.id)
        if (last && last.payload && typeof last.payload === 'object') Object.assign(values, last.payload)

        // alarm list: kept in the node context, so a persistent context store survives restarts
        const ctx = node.context()
        const alarms = config.alarms === 'off' ? null : createAlarms(config.symbols, ctx.get('hmiAlarms'))
        const alarmsOut = config.alarmsOut === 'yes'
        const alarmEvents = events => {
            if (!events.length) return
            ctx.set('hmiAlarms', alarms.save())
            if (alarmsOut) for (const ev of events) node.send({ topic: 'alarme', payload: ev })
        }
        if (alarms) alarmEvents(alarms.evaluate(values, Date.now()))
        // trend history kept here, so a page opened later already shows the last minutes
        const trends = createTrendHistory(config.symbols)
        // pushes the current values and alarms to every open dashboard
        const refresh = () => setImmediate(() => node.receive({ _hmiRefresh: true }))

        const evts = {
            onAction: true,
            beforeSend: function (msg) {
                // a click on the dashboard: goes out of the node, not into the screen
                if (msg && msg._hmiAck !== undefined) {
                    if (!alarms) return null
                    const ev = alarms.ack(String(msg._hmiAck), Date.now(), userOf(msg))
                    alarmEvents(ev)
                    if (ev.length) refresh()
                    return null
                }
                if (msg && msg._hmiShelve && typeof msg._hmiShelve === 'object') {
                    if (!alarms) return null
                    const sh = msg._hmiShelve
                    const ev = sh.off ? alarms.unshelve(String(sh.id), Date.now(), userOf(msg)) : alarms.shelve(String(sh.id), sh.minutes, Date.now(), userOf(msg))
                    alarmEvents(ev)
                    if (ev.length) refresh()
                    return null
                }
                if (msg && msg._hmiAction) {
                    const out = actionMessage(config.symbols, values, msg, node.credentials && node.credentials.pin)
                    if (out && out.denied) {
                        node.warn('Comando recusado: senha incorreta')
                        const socket = msg._client && msg._client.socketId
                        setImmediate(() => node.receive({ _hmiRefresh: true, _hmiNotice: { socketId: socket, text: 'Senha incorreta', ts: Date.now() } }))
                        return null
                    }
                    return out
                }
                if (!(msg && msg._hmiRefresh) && !mergeValues(values, msg)) {
                    node.warn('Nothing to show: send an object in msg.payload, or msg.topic with a value')
                }
                const out = { ...msg, payload: { ...values }, _hmiTs: Date.now() }
                trends.record(values, out._hmiTs)
                delete out._hmiRefresh
                if (msg && msg._hmiNotice) out.notice = msg._hmiNotice
                delete out._hmiNotice
                if (alarms) {
                    alarmEvents(alarms.evaluate(values, out._hmiTs))
                    out.alarms = alarms.snapshot()
                }
                // the dashboard always gets the full set of values
                return out
            },
            onInput: function (msg) {
                // the stored copy (what a newly opened page gets) also carries the trend history
                base.stores.data.save(base, node, trends.size ? { ...msg, trendHist: trends.snapshot() } : msg)
                const n = Object.keys(values).length
                const act = alarms ? alarms.snapshot(0).active.length : 0
                node.status({ fill: act ? 'red' : 'green', shape: 'dot', text: n + (n === 1 ? ' value' : ' values') + (act ? ' · ' + act + (act === 1 ? ' alarm' : ' alarms') : '') })
            }
        }

        // shelved alarms come back when their time is over
        const shelfTimer = alarms ? setInterval(() => {
            const ev = alarms.expire(Date.now())
            alarmEvents(ev)
            if (ev.length) refresh()
        }, 15000) : null
        node.on('close', () => { if (shelfTimer) clearInterval(shelfTimer) })

        if (group) group.register(node, config, evts)
        else page.register(null, node, { ...config, group: '' }, evts)
    }

    RED.nodes.registerType('ui-hmi-canvas', UIHmiCanvasNode, { credentials: { pin: { type: 'password' } } })
    setupAdmin(RED)
}
