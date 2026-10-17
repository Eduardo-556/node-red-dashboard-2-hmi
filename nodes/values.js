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

const num = v => (v === '' || v === undefined || v === null || typeof v === 'boolean' || !isFinite(Number(v))) ? null : Number(v)

// raw PLC value -> value on screen (raw × factor ÷ divisor + offset), and back
function scaleOf (sym) {
    const sc = sym.scale || {}
    const d = num(sc.divisor)
    const k = (num(sc.factor) === null ? 1 : num(sc.factor)) / (d === null || d === 0 ? 1 : d)
    const o = num(sc.offset) === null ? 0 : num(sc.offset)
    return { k, o }
}
const toScreen = (sym, raw) => { const n = num(raw); if (n === null) return null; const { k, o } = scaleOf(sym); return Math.round((n * k + o) * 1e9) / 1e9 }
const toRaw = (sym, shown) => { const { k, o } = scaleOf(sym); return k !== 0 && (k !== 1 || o !== 0) ? Math.round(((shown - o) / k) * 1e9) / 1e9 : shown }

// Interlocks of an action: "permissivo, !emergencia" -> every key must be on
// (or off with "!"). Returns the reason when the command is blocked, else ''.
function interlockOf (act, values) {
    const list = String((act && act.interlock) || '').split(',').map(t => t.trim()).filter(Boolean)
    for (const item of list) {
        const not = item.startsWith('!')
        const key = not ? item.slice(1).trim() : item
        if (!key) continue
        const on = truthy(values[key])
        if (not ? on : !on) return String(act.interlockText || '').trim() || ((not ? key + ' ligado' : key + ' desligado'))
    }
    return ''
}

function inRange (n, min, max) {
    const lo = num(min)
    const hi = num(max)
    return !((lo !== null && n < lo) || (hi !== null && n > hi))
}
const rangeText = (min, max) => num(min) !== null && num(max) !== null ? ' (' + num(min) + ' a ' + num(max) + ')' : ''

// Builds the output msg for a click on a symbol. The dashboard only says which
// symbol and which phase (click, down, up, input...); what is sent comes from the
// node's own config, so a page cannot make the node send arbitrary values.
// Returns null when nothing should be sent, or { denied | blocked | rejected | armed }.
// opts.pin: the canvas password (node credential); actions marked "pedir senha" need it.
// opts.armed: a pulse whose password was already given (phase "arm").
function actionMessage (symbols, values, msg, pinOrOpts) {
    const opts = pinOrOpts && typeof pinOrOpts === 'object' ? pinOrOpts : { pin: pinOrOpts }
    const pin = opts.pin
    const a = (msg && msg._hmiAction) || {}
    const sym = (Array.isArray(symbols) ? symbols : []).find(s => s && s.id === a.id)
    const act = sym && sym.action
    if (!act) return null
    const needPin = act.pin === 'yes'
    const pinOk = () => !!pin && String(a.pin || '') === String(pin)
    if (a.phase === 'arm') {
        if (act.mode !== 'pulse' || !needPin) return null
        return pinOk() ? { armed: true } : { denied: true }
    }
    // releasing a pulse is always allowed: it only sends the 0
    const release = act.mode === 'pulse' && a.phase === 'up'
    if (needPin && !release && !(act.mode === 'pulse' && opts.armed) && !pinOk()) return { denied: true }
    if (!release) {
        const why = interlockOf(act, values)
        if (why) return { blocked: why }
    }
    const cur = sym.key ? values[sym.key] : undefined
    const asBool = typeof cur === 'boolean'
    let payload
    let topic = act.topic || sym.key || ''
    const fp = act.mode === 'faceplate' ? String(a.phase || '') : ''
    if (fp === 'fp-on' || fp === 'fp-off' || fp === 'fp-reset' || fp === 'fp-auto' || fp === 'fp-man') {
        // faceplate buttons: topic and value come from the symbol's config
        const k = fp.slice(3)
        const tk = k === 'auto' || k === 'man' ? 'modeTopic' : k + 'Topic'
        if (!act[tk]) return null
        topic = act[tk]
        payload = parseValue(act[k + 'Value'])
        if (payload === undefined) payload = k === 'man' ? 0 : (k === 'auto' ? 1 : true)
    } else if (fp === 'fp-sp' || fp === 'fp-op') {
        // faceplate setpoint / manual output typed on screen
        const k = fp.slice(3)
        if (!act[k + 'Topic']) return null
        topic = act[k + 'Topic']
        payload = Number(String(a.value).replace(',', '.'))
        if (String(a.value ?? '').trim() === '' || !isFinite(payload)) return null
        const min = act[k + 'Min'] ?? (k === 'op' ? '0' : '')
        const max = act[k + 'Max'] ?? (k === 'op' ? '100' : '')
        if (!inRange(payload, min, max)) return { rejected: 'Valor fora da faixa' + rangeText(min, max) }
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
        if (String(a.value ?? '').trim() === '' || !isFinite(payload)) return null
        if (!inRange(payload, act.min, act.max)) return { rejected: 'Valor fora da faixa' + rangeText(act.min, act.max) }
        // biggest change in one step, in the units shown on screen
        const step = num(act.maxStep)
        const shown = sym.key ? toScreen(sym, cur) : null
        if (step !== null && step > 0 && shown !== null && Math.abs(payload - shown) > step) return { rejected: 'Mudança maior que ' + step + ' de uma vez' }
        // limits are in the units shown on screen; the PLC gets the raw value
        payload = toRaw(sym, payload)
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

// What the PLC should echo back on the symbol's key after a command (for the
// "waiting for the PLC" mark), or undefined when it cannot be told.
function expectedEcho (sym, out, phase) {
    if (!sym || !sym.key || !out || !sym.action) return undefined
    const m = sym.action.mode
    if (m === 'toggle' || m === 'input') return out.payload
    if (m === 'value' && (!sym.action.topic || sym.action.topic === sym.key)) return out.payload
    if (m === 'faceplate' && (phase === 'fp-on' || phase === 'fp-off')) return phase === 'fp-on'
    return undefined
}

// does the value read back match what was written? (1 == true, "5" == 5)
function sameValue (a, b) {
    if (typeof b === 'boolean' || typeof a === 'boolean') return truthy(a) === truthy(b)
    const x = num(a)
    const y = num(b)
    if (x !== null && y !== null) return Math.abs(x - y) < 1e-9 * Math.max(1, Math.abs(y))
    return String(a) === String(b)
}

// user name from the dashboard connection (FlowFuse / multi-user plugins), if any
function userOf (msg) {
    const u = msg && msg._client && msg._client.user
    if (!u) return ''
    if (typeof u === 'string') return u
    return String(u.name || u.username || u.email || u.userId || u.id || '')
}

module.exports = { mergeValues, parseValue, actionMessage, userOf, interlockOf, expectedEcho, sameValue, truthy }
