'use strict'

const crypto = require('crypto')
const http = require('http')
const https = require('https')
const net = require('net')

// Edit sessions opened from the Node-RED editor: canvas id -> { key, until }
const editKeys = new Map()
const EDIT_TTL = 4 * 3600 * 1000

const RULE_OPS = ['on', 'off', 'eq', 'ne', 'gt', 'lt']
const RULE_EFFECTS = ['alarm', 'warn', 'info', 'ok', 'dim', 'blink', 'hide']
const ACTIONS = ['value', 'toggle', 'pulse', 'input', 'page', 'screen', 'faceplate']
const FACEPLATE_KEYS = ['modeKey', 'modeTexts', 'hoursKey', 'startsKey', 'valueKey', 'valueUnit', 'onTopic', 'onValue', 'offTopic', 'offValue', 'resetTopic', 'resetValue',
    // PID / regulator: process value, setpoint, output and auto/manual
    'pvKey', 'spKey', 'opKey', 'pidUnit', 'spTopic', 'spMin', 'spMax', 'opTopic', 'opMin', 'opMax', 'modeTopic', 'autoValue', 'manValue']

// screen names of a canvas: unique strings, at most 60 (phone versions count too)
function cleanScreens (list) {
    const out = []
    for (const n of Array.isArray(list) ? list : []) {
        const t = typeof n === 'string' ? n.trim().slice(0, 40) : ''
        if (t && !out.includes(t) && out.length < 60) out.push(t)
    }
    return out
}

function cleanSymbols (list) {
    if (!Array.isArray(list)) return null
    const out = []
    for (const s of list) {
        if (!s || typeof s !== 'object' || typeof s.id !== 'string' || typeof s.type !== 'string') return null
        const n = v => (isFinite(Number(v)) ? Number(v) : 0)
        const clean = {
            id: s.id.slice(0, 64),
            type: s.type.slice(0, 32),
            x: n(s.x),
            y: n(s.y),
            w: Math.max(10, n(s.w)),
            h: Math.max(10, n(s.h)),
            rot: n(s.rot),
            key: typeof s.key === 'string' ? s.key : '',
            props: s.props && typeof s.props === 'object' && !Array.isArray(s.props) ? s.props : {}
        }
        if (s.preview !== undefined && ['number', 'string', 'boolean'].includes(typeof s.preview)) clean.preview = s.preview
        const a = s.action
        if (typeof s.group === 'string' && s.group) clean.group = s.group.slice(0, 64)
        if (typeof s.name === 'string' && s.name) clean.name = s.name.slice(0, 80)
        if (typeof s.screen === 'string' && s.screen) clean.screen = s.screen.slice(0, 40)
        if (s.locked === true) clean.locked = true
        const sc = s.scale
        if (sc && typeof sc === 'object') clean.scale = { factor: String(sc.factor ?? ''), divisor: String(sc.divisor ?? ''), offset: String(sc.offset ?? '') }
        if (Array.isArray(s.rules)) {
            clean.rules = s.rules.slice(0, 20).filter(r => r && typeof r === 'object').map(r => ({
                key: String(r.key ?? '').slice(0, 200),
                op: RULE_OPS.includes(r.op) ? r.op : 'on',
                value: String(r.value ?? '').slice(0, 200),
                effect: RULE_EFFECTS.includes(r.effect) ? r.effect : 'alarm'
            }))
        }
        if (a && typeof a === 'object' && ACTIONS.includes(a.mode)) {
            clean.action = { mode: a.mode, value: String(a.value ?? ''), topic: String(a.topic ?? ''), confirm: a.confirm === 'yes' ? 'yes' : 'no', pin: a.pin === 'yes' ? 'yes' : 'no' }
            if (a.interlock) Object.assign(clean.action, { interlock: String(a.interlock).slice(0, 300), interlockText: String(a.interlockText ?? '').slice(0, 120) })
            if (a.mode === 'input') Object.assign(clean.action, { min: String(a.min ?? ''), max: String(a.max ?? ''), maxStep: String(a.maxStep ?? '') })
            if (a.mode === 'faceplate') for (const k of FACEPLATE_KEYS) clean.action[k] = String(a[k] ?? '').slice(0, 200)
        }
        out.push(clean)
    }
    return out
}

// Calls this Node-RED's own admin API (GET/POST /flows) with the caller's credentials.
async function adminRequest (RED, req, method, body) {
    let tls = RED.settings.https
    if (typeof tls === 'function') tls = await tls()
    const lib = tls ? https : http
    // always this machine: an address of its own (uiHost) or loopback, never a host
    // name, so the user's credentials cannot be sent anywhere else
    const h = RED.settings.uiHost
    const host = (!h || h === '0.0.0.0' || h === '::' || !net.isIP(h)) ? '127.0.0.1' : h
    const root = typeof RED.settings.httpAdminRoot === 'string' ? RED.settings.httpAdminRoot : '/'
    const headers = { 'Node-RED-API-Version': 'v2', Accept: 'application/json' }
    if (req.headers.authorization) headers.authorization = req.headers.authorization
    if (req.headers.cookie) headers.cookie = req.headers.cookie
    let data
    if (body) {
        data = Buffer.from(JSON.stringify(body))
        headers['Content-Type'] = 'application/json'
        headers['Content-Length'] = data.length
        headers['Node-RED-Deployment-Type'] = 'nodes'
    }
    return new Promise((resolve, reject) => {
        const r = lib.request({
            host,
            port: RED.settings.uiPort || 1880,
            path: ('/' + root + '/flows').replace(/\/+/g, '/'),
            method,
            headers,
            // our own address: its certificate is not issued for it
            rejectUnauthorized: false,
            ...(tls && typeof tls === 'object' ? { ca: tls.ca, cert: tls.cert, key: tls.key } : {})
        }, res => {
            let text = ''
            res.on('data', c => { text += c })
            res.on('end', () => {
                let json = null
                try { json = text ? JSON.parse(text) : null } catch (e) {}
                resolve({ status: res.statusCode, json, text })
            })
        })
        r.on('error', reject)
        if (data) r.write(data)
        r.end()
    })
}

module.exports = function setupAdmin (RED) {
    const canWrite = RED.auth.needsPermission('flows.write')

    // Start editing a deployed canvas from the dashboard page
    RED.httpAdmin.patch('/hmi-canvas/:id/edit', canWrite, function (req, res) {
        const node = RED.nodes.getNode(req.params.id)
        if (!node || node.type !== 'ui-hmi-canvas') {
            return res.status(404).json({ error: 'Canvas not deployed', code: 'NOT_DEPLOYED' })
        }
        const key = crypto.randomBytes(16).toString('hex')
        editKeys.set(req.params.id, { key, until: Date.now() + EDIT_TTL })
        res.json({ key })
    })

    // Save the symbols edited on the dashboard page and deploy only this node
    RED.httpAdmin.post('/hmi-canvas/:id/symbols', canWrite, async function (req, res) {
        const id = req.params.id
        const body = req.body || {}
        const open = editKeys.get(id)
        if (open && open.until < Date.now()) editKeys.delete(id)
        if (!body.key || !open || open.key !== body.key || open.until < Date.now()) {
            return res.status(403).json({ error: 'Edit session expired, open the editor again from Node-RED', code: 'BAD_KEY' })
        }
        const symbols = cleanSymbols(body.symbols)
        if (!symbols) return res.status(400).json({ error: 'Invalid symbols', code: 'BAD_SYMBOLS' })
        try {
            const current = await adminRequest(RED, req, 'GET')
            if (current.status !== 200 || !current.json) {
                return res.status(current.status || 500).json({ error: 'Could not read flows', code: 'GET_FAILED' })
            }
            const flows = current.json.flows
            const target = flows.find(n => n.id === id && n.type === 'ui-hmi-canvas')
            if (!target) return res.status(404).json({ error: 'Canvas not found', code: 'NOT_FOUND' })
            target.symbols = symbols
            if (body.screens !== undefined) target.screens = cleanScreens(body.screens)
            const saved = await adminRequest(RED, req, 'POST', { flows, rev: current.json.rev })
            if (saved.status !== 200) {
                return res.status(saved.status).json({ error: (saved.json && saved.json.message) || 'Deploy failed', code: 'POST_FAILED' })
            }
            editKeys.delete(id)
            res.json({ ok: true, rev: saved.json && saved.json.rev })
        } catch (err) {
            res.status(500).json({ error: err.message, code: 'ERROR' })
        }
    })
}

module.exports.cleanSymbols = cleanSymbols
module.exports.cleanScreens = cleanScreens
