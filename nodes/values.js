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
function actionMessage (symbols, values, msg) {
    const a = (msg && msg._hmiAction) || {}
    const sym = (Array.isArray(symbols) ? symbols : []).find(s => s && s.id === a.id)
    const act = sym && sym.action
    if (!act) return null
    const cur = sym.key ? values[sym.key] : undefined
    const asBool = typeof cur === 'boolean'
    let payload
    if (act.mode === 'value' && a.phase === 'click') {
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
    } else {
        return null
    }
    const out = { topic: act.topic || sym.key || '', payload, symbol: { id: sym.id, type: sym.type, key: sym.key || '' } }
    if (msg._client) out._client = msg._client
    return out
}

module.exports = { mergeValues, parseValue, actionMessage }
