'use strict'

const { canvases } = require('./clients')

// Dashboard 2.0 plugin: clicks and page loads of an hmi canvas go to the canvas
// node itself (with the socket), never to the generic widget-action path
module.exports = function (RED) {
    RED.plugins.registerPlugin('node-red-dashboard-2-hmi', {
        type: 'node-red-dashboard-2',
        hooks: {
            onAction (conn, id, msg) {
                const c = canvases.get(id)
                if (!c) return msg
                try { c.action(conn, msg) } catch (e) { c.error(e) }
                return null
            },
            onLoad (conn, id, msg, state) {
                const c = canvases.get(id)
                if (!c) return msg
                try { return c.load(conn, msg) } catch (e) { c.error(e); return msg }
            }
        }
    })
}
