'use strict'

const { mergeValues, actionMessage } = require('./values')
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

        const evts = {
            onAction: true,
            beforeSend: function (msg) {
                // a click on the dashboard: goes out of the node, not into the screen
                if (msg && msg._hmiAction) return actionMessage(config.symbols, values, msg)
                if (!mergeValues(values, msg)) {
                    node.warn('Nothing to show: send an object in msg.payload, or msg.topic with a value')
                }
                // the dashboard always gets the full set of values
                return { ...msg, payload: { ...values }, _hmiTs: Date.now() }
            },
            onInput: function (msg) {
                base.stores.data.save(base, node, msg)
                const n = Object.keys(values).length
                node.status({ fill: 'green', shape: 'dot', text: n + (n === 1 ? ' value' : ' values') })
            }
        }

        if (group) group.register(node, config, evts)
        else page.register(null, node, { ...config, group: '' }, evts)
    }

    RED.nodes.registerType('ui-hmi-canvas', UIHmiCanvasNode)
    setupAdmin(RED)
}
