'use strict'

const { mergeValues } = require('./values')

module.exports = function (RED) {
    function UIHmiCanvasNode (config) {
        RED.nodes.createNode(this, config)
        const node = this

        const group = RED.nodes.getNode(config.group)
        if (!group) {
            node.error('No group configured')
            return
        }
        const base = group.getBase()

        // Latest value of every key, so a page refresh shows the whole screen at once.
        const values = {}
        const last = base.stores.data.get(node.id)
        if (last && last.payload && typeof last.payload === 'object') Object.assign(values, last.payload)

        const evts = {
            beforeSend: function (msg) {
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

        group.register(node, config, evts)
    }

    RED.nodes.registerType('ui-hmi-canvas', UIHmiCanvasNode)
}
