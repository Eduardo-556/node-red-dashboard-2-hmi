'use strict'

const crypto = require('crypto')
const http = require('http')
const https = require('https')

// Edit sessions opened from the Node-RED editor: canvas id -> key
const editKeys = new Map()

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
        out.push(clean)
    }
    return out
}

// Calls this Node-RED's own admin API (GET/POST /flows) with the caller's credentials.
async function adminRequest (RED, req, method, body) {
    let tls = RED.settings.https
    if (typeof tls === 'function') tls = await tls()
    const lib = tls ? https : http
    const h = RED.settings.uiHost
    const host = (!h || h === '0.0.0.0' || h === '::') ? '127.0.0.1' : h
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
        editKeys.set(req.params.id, key)
        res.json({ key })
    })

    // Save the symbols edited on the dashboard page and deploy only this node
    RED.httpAdmin.post('/hmi-canvas/:id/symbols', canWrite, async function (req, res) {
        const id = req.params.id
        const body = req.body || {}
        if (!body.key || editKeys.get(id) !== body.key) {
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
            const saved = await adminRequest(RED, req, 'POST', { flows, rev: current.json.rev })
            if (saved.status !== 200) {
                return res.status(saved.status).json({ error: (saved.json && saved.json.message) || 'Deploy failed', code: 'POST_FAILED' })
            }
            res.json({ ok: true, rev: saved.json && saved.json.rev })
        } catch (err) {
            res.status(500).json({ error: err.message, code: 'ERROR' })
        }
    })
}

module.exports.cleanSymbols = cleanSymbols
