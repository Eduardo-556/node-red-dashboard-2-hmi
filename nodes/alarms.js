'use strict'

// Alarm list for one canvas (ISA-18.2 style): every alarm the symbols can show
// (fault key, limits, alarm banners, tripped breakers) is tracked with its
// activation time and acknowledgement. An alarm leaves the active list only when
// it is back to normal AND acknowledged; every change goes to the history.

const HISTORY_MAX = 500

const num = v => (v === '' || v === undefined || v === null || typeof v === 'boolean' || !isFinite(Number(v))) ? null : Number(v)

function isOn (value, rule, threshold) {
    if (value === undefined || value === null || value === '') return null
    if (rule === 'gt') return Number(value) > Number(threshold)
    if (typeof value === 'boolean') return value
    if (typeof value === 'string' && isNaN(Number(value))) return value.length > 0
    return Number(value) !== 0
}

function onState (value, p) {
    const on = isOn(value, p && p.onWhen, p && p.threshold)
    return on !== null && p && p.invert === 'yes' ? !on : on
}

// same as scaleValue in ui/symbols: raw × factor ÷ divisor + offset
function scaled (sym, raw) {
    const sc = sym.scale
    const n = num(raw)
    if (n === null || !sc) return n
    const k = num(sc.factor)
    const d = num(sc.divisor)
    const o = num(sc.offset)
    return Math.round((n * (k === null ? 1 : k) / (d === null || d === 0 ? 1 : d) + (o === null ? 0 : o)) * 1e9) / 1e9
}

function nameOf (sym) {
    const p = sym.props || {}
    return String(p.label || p.title || p.text || sym.key || sym.type)
}

const RANGE_TYPES = ['tank', 'gauge', 'bar', 'tag', 'bagFilter', 'oven', 'flowmeter', 'instrument', 'scale', 'isaBar']

// Every alarm the canvas can raise: { id, symbolId, text, priority, active(values) }
function alarmDefs (symbols) {
    const out = []
    for (const s of Array.isArray(symbols) ? symbols : []) {
        if (!s || typeof s !== 'object') continue
        const p = s.props || {}
        if (p.alarmList === 'no') continue
        const name = nameOf(s)
        const prio = String(p.priority || '2')
        if (p.faultKey) {
            out.push({ id: s.id + ':fault', symbolId: s.id, text: name + ' em falha', priority: String(p.priority || '1'), active: v => isOn(v[p.faultKey], 'nonzero') === true })
        }
        if (s.type === 'breaker' && p.tripKey) {
            out.push({ id: s.id + ':trip', symbolId: s.id, text: name + ' disparado', priority: String(p.priority || '1'), active: v => isOn(v[p.tripKey], 'nonzero') === true })
        }
        if (s.type === 'alarm' && s.key) {
            out.push({ id: s.id + ':on', symbolId: s.id, text: String(p.text || name), priority: String(p.priority || '1'), active: v => onState(v[s.key], p) === true })
        }
        if (s.key && RANGE_TYPES.includes(s.type)) {
            const val = v => scaled(s, v[s.key])
            const lim = (k, label, pr, test) => {
                const l = num(p[k])
                if (l !== null) out.push({ id: s.id + ':' + k, symbolId: s.id, text: name + ' ' + label, priority: pr, active: v => { const x = val(v); return x !== null && test(x, l) } })
            }
            if (s.type === 'isaBar') {
                lim('lolo', 'muito baixo', '1', (x, l) => x < l)
                lim('lo', 'baixo', prio, (x, l) => x < l && !(num(p.lolo) !== null && x < num(p.lolo)))
                lim('hi', 'alto', prio, (x, l) => x > l && !(num(p.hihi) !== null && x > num(p.hihi)))
                lim('hihi', 'muito alto', '1', (x, l) => x > l)
            } else {
                lim('lo', 'baixo', prio, (x, l) => x < l)
                lim('hi', 'alto', prio, (x, l) => x > l)
            }
        }
    }
    return out
}

function createAlarms (symbols, saved) {
    const defs = alarmDefs(symbols)
    const known = new Set(defs.map(d => d.id))
    // id -> { id, symbolId, text, priority, active, acked, since, cleared, ackBy }
    const list = new Map()
    let history = []
    if (saved && typeof saved === 'object') {
        for (const a of Array.isArray(saved.active) ? saved.active : []) if (a && known.has(a.id)) list.set(a.id, { ...a })
        if (Array.isArray(saved.history)) history = saved.history.slice(0, HISTORY_MAX)
    }
    const log = (a, event, now, user) => {
        history.unshift({ ts: now, id: a.id, symbolId: a.symbolId, text: a.text, priority: a.priority, event, ...(user ? { user } : {}) })
        if (history.length > HISTORY_MAX) history.length = HISTORY_MAX
        return { event, id: a.id, symbolId: a.symbolId, text: a.text, priority: a.priority, ts: now, ...(user ? { user } : {}) }
    }

    return {
        count: defs.length,
        // checks every alarm against the values; returns the events (ATIVO, NORMAL)
        evaluate (values, now) {
            const events = []
            for (const d of defs) {
                let on
                try { on = d.active(values || {}) } catch (e) { on = false }
                const cur = list.get(d.id)
                if (on && (!cur || !cur.active)) {
                    const a = { id: d.id, symbolId: d.symbolId, text: d.text, priority: d.priority, active: true, acked: false, since: now }
                    list.set(d.id, a)
                    events.push(log(a, 'ATIVO', now))
                } else if (!on && cur && cur.active) {
                    cur.active = false
                    cur.cleared = now
                    events.push(log(cur, 'NORMAL', now))
                    if (cur.acked) list.delete(d.id)
                }
            }
            return events
        },
        // acknowledges one alarm (by id), all alarms of a symbol (symbol:<id>) or every alarm ('all')
        ack (which, now, user) {
            const events = []
            for (const a of [...list.values()]) {
                const match = which === 'all' || a.id === which || (typeof which === 'string' && which.startsWith('symbol:') && a.symbolId === which.slice(7))
                if (!match || a.acked) continue
                a.acked = true
                a.ackTs = now
                if (user) a.ackBy = user
                events.push(log(a, 'RECONHECIDO', now, user))
                if (!a.active) list.delete(a.id)
            }
            return events
        },
        snapshot (historyRows) {
            const order = { 1: 0, 2: 1, 3: 2 }
            const active = [...list.values()].sort((a, b) => (a.acked - b.acked) || ((order[a.priority] ?? 3) - (order[b.priority] ?? 3)) || (b.since - a.since))
            return { active, history: history.slice(0, historyRows === undefined ? 100 : historyRows), unacked: active.filter(a => !a.acked).length }
        },
        save () {
            return { active: [...list.values()], history }
        }
    }
}

module.exports = { alarmDefs, createAlarms, onState }
