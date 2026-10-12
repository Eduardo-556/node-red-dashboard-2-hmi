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

module.exports = { mergeValues }
