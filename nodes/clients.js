'use strict'

// Dashboard clicks on a canvas never go through the widget-action path of
// Dashboard 2.0 (that one also feeds beforeSend, so a page could fake values).
// The plugin in plugin.js hands them here with the socket, and each canvas
// node answers its own: canvas id -> { action(conn, msg), load(conn, msg) }
const canvases = new Map()

// who is on the other end of a socket: login from FlowFuse / multi-user plugins,
// or the user of HTTP basic auth (httpNodeAuth) in front of the dashboard
function clientOf (RED, conn) {
    let item = { _client: {} }
    try {
        for (const p of RED.plugins.getByType('node-red-dashboard-2')) {
            if (p.hooks && typeof p.hooks.onAddConnectionCredentials === 'function') item = p.hooks.onAddConnectionCredentials(conn, item) || item
        }
    } catch (e) {}
    const hs = (conn && conn.handshake) || {}
    const c = { ...(item._client || {}), socketId: conn && conn.id, socketIp: hs.address, clientId: hs.query && hs.query.clientId }
    if (!c.user) {
        const auth = String((hs.headers && hs.headers.authorization) || '')
        if (/^basic /i.test(auth)) {
            const plain = Buffer.from(auth.slice(6).trim(), 'base64').toString('utf8')
            const name = plain.slice(0, Math.max(0, plain.indexOf(':')))
            if (name) c.user = { username: name }
        }
    }
    return c
}

module.exports = { canvases, clientOf }
