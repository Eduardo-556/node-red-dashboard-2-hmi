'use strict'

// Merges an incoming msg into the canvas values.
// - object payload: every key is merged (e.g. the output of schneider read)
// - any other payload with msg.topic: stored under that topic
// Returns true when something changed.
function mergeValues (values, msg) {
    const p = msg && msg.payload
    if (p !== null && typeof p === 'object' && !Array.isArray(p) && !Buffer.isBuffer(p)) {
        Object.assign(values, p)
        return Object.keys(p).length > 0
    }
    if (msg && typeof msg.topic === 'string' && msg.topic !== '' && p !== undefined) {
        values[msg.topic] = p
        return true
    }
    return false
}

// Text typed in the editor -> number, boolean or string
function parseValue (text) {
    if (text === undefined || text === null || text === '') return undefined
    if (text === 'true') return true
    if (text === 'false') return false
    const n = Number(String(text).replace(',', '.'))
    return isFinite(n) ? n : String(text)
}

const truthy = v => v === true || (v !== false && v !== null && v !== undefined && v !== '' && v !== 'false' && Number(v) !== 0)

// Builds the output msg for a click on a symbol. The dashboard only says which
// symbol and which phase (click, down, up); what is sent comes from the node's
// own config, so a page cannot make the node send arbitrary values.
// Returns null when nothing should be sent.
// pin: the canvas password (node credential); actions marked "pedir senha" need it.
function actionMessage (symbols, values, msg, pin) {
    const a = (msg && msg._hmiAction) || {}
    const sym = (Array.isArray(symbols) ? symbols : []).find(s => s && s.id === a.id)
    const act = sym && sym.action
    if (!act) return null
    if (act.pin === 'yes' && (!pin || String(a.pin || '') !== String(pin))) return { denied: true }
    const cur = sym.key ? values[sym.key] : undefined
    const asBool = typeof cur === 'boolean'
    let payload
    let topic = act.topic || sym.key || ''
    if (act.mode === 'faceplate' && ['fp-on', 'fp-off', 'fp-reset'].includes(a.phase)) {
        // faceplate buttons: topic and value come from the symbol's config
        const k = a.phase.slice(3)
        if (!act[k + 'Topic']) return null
        topic = act[k + 'Topic']
        payload = parseValue(act[k + 'Value'])
        if (payload === undefined) payload = true
    } else if (act.mode === 'value' && a.phase === 'click') {
        payload = parseValue(act.value)
        if (payload === undefined) payload = true
    } else if (act.mode === 'toggle' && a.phase === 'click') {
        const on = truthy(cur)
        payload = asBool ? !on : (on ? 0 : 1)
    } else if (act.mode === 'pulse' && (a.phase === 'down' || a.phase === 'up')) {
        const down = a.phase === 'down'
        payload = asBool ? down : (down ? 1 : 0)
    } else if (act.mode === 'input' && a.phase === 'input') {
        payload = Number(String(a.value).replace(',', '.'))
        const min = act.min === '' || act.min === undefined ? null : Number(act.min)
        const max = act.max === '' || act.max === undefined ? null : Number(act.max)
        if (String(a.value).trim() === '' || !isFinite(payload)) return null
        if ((min !== null && isFinite(min) && payload < min) || (max !== null && isFinite(max) && payload > max)) return null
        // limits are in the units shown on screen; the PLC gets the raw value
        const d = sym.scale && sym.scale.divisor !== '' && sym.scale.divisor !== undefined && isFinite(Number(sym.scale.divisor)) && Number(sym.scale.divisor) !== 0 ? Number(sym.scale.divisor) : 1
        const k = (sym.scale && sym.scale.factor !== '' && sym.scale.factor !== undefined && isFinite(Number(sym.scale.factor)) ? Number(sym.scale.factor) : 1) / d
        const o = sym.scale && sym.scale.offset !== '' && isFinite(Number(sym.scale.offset)) ? Number(sym.scale.offset) : 0
        if (k !== 0 && (k !== 1 || o !== 0)) payload = Math.round(((payload - o) / k) * 1e9) / 1e9
    } else {
        return null
    }
    const p = sym.props || {}
    const name = String(p.label || p.title || p.text || sym.key || sym.type)
    const user = userOf(msg)
    // who sent what and when, for a command log (database, file...)
    const audit = { ts: new Date().toISOString(), symbol: name, action: a.phase === 'click' || a.phase === 'input' ? act.mode : a.phase, topic, value: payload }
    if (user) audit.user = user
    if (msg._client && msg._client.socketId) audit.socketId = msg._client.socketId
    const out = { topic, payload, symbol: { id: sym.id, type: sym.type, key: sym.key || '' }, audit }
    if (msg._client) out._client = msg._client
    return out
}

// user name from the dashboard connection (FlowFuse / multi-user plugins), if any
function userOf (msg) {
    const u = msg && msg._client && msg._client.user
    if (!u) return ''
    if (typeof u === 'string') return u
    return String(u.name || u.username || u.email || u.userId || u.id || '')
}

module.exports = { mergeValues, parseValue, actionMessage, userOf }
