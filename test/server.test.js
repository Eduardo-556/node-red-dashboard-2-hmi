'use strict'

// The canvas node with a stub Node-RED and Dashboard: clicks arrive through the
// plugin hook like on a real dashboard.
const test = require('node:test')
const assert = require('node:assert')
const { EventEmitter } = require('events')

function setup (config, creds) {
    const types = {}
    const plugins = []
    const stores = {
        data: { d: {}, get (id) { return this.d[id] }, save (b, n, m) { this.d[n.id] = { ...this.d[n.id], ...m } } },
        state: { s: {}, getProperty (id, k) { return (this.s[id] || {})[k] }, set (b, n, m, k, v) { (this.s[n.id] = this.s[n.id] || {})[k] = v } }
    }
    let evts = null
    const page = { getBase: () => ({ stores }), register: (a, n, c, e) => { evts = e } }
    const RED = {
        nodes: {
            createNode (n) {
                const em = new EventEmitter()
                n.on = em.on.bind(em)
                n.emit = em.emit.bind(em)
                n.sent = []
                n.warns = []
                n.send = m => n.sent.push(m)
                n.warn = t => n.warns.push(t)
                n.error = t => { throw t instanceof Error ? t : new Error(t) }
                n.status = () => {}
                n.receive = m => {
                    const out = evts.beforeSend(m)
                    // Dashboard 2.0 keeps msg.enabled in its state store
                    if (out && out.enabled !== undefined) stores.state.set(null, n, out, 'enabled', out.enabled)
                    if (out) n.toPages.push(out)
                    evts.onInput(out)
                }
                n.toPages = []
                const c = {}
                n.context = () => ({ get: k => c[k], set: (k, v) => { c[k] = v } })
                n.credentials = creds || {}
            },
            getNode: () => page,
            registerType (t, fn) { types[t] = fn }
        },
        plugins: { registerPlugin (id, def) { plugins.push(def) }, getByType: () => plugins },
        auth: { needsPermission: () => (q, r, next) => next() },
        httpAdmin: { patch () {}, post () {} },
        settings: {}
    }
    require('../nodes/ui-hmi-canvas.js')(RED)
    require('../nodes/plugin.js')(RED)
    const node = { id: config.id || 'c1' }
    types['ui-hmi-canvas'].call(node, { page: 'p', symbols: [], ...config })
    const hook = plugins[0].hooks
    const conn = (user, id = 's1') => {
        const c = new EventEmitter()
        c.id = id
        c.handshake = { address: '10.0.0.' + id.length, query: {}, headers: user ? { authorization: 'Basic ' + Buffer.from(user + ':x').toString('base64') } : {} }
        c.got = []
        c.emit = (ev, m) => { if (ev === 'disconnect') EventEmitter.prototype.emit.call(c, ev); else c.got.push(m) }
        return c
    }
    const click = (c, msg) => assert.strictEqual(hook.onAction(c, node.id, msg), null)
    const close = () => node.emit('close', false, () => {})
    return { node, evts, hook, conn, click, close, stores }
}

const flush = () => new Promise(resolve => setImmediate(resolve))

test('a page cannot write values or send its own messages', () => {
    const t = setup({ symbols: [{ id: 'm', type: 'motor', key: 'run', props: { faultKey: 'flt' } }] })
    const c = t.conn()
    t.click(c, { topic: 'cmd', payload: { flt: 1 } })
    t.click(c, { _hmiAction: { id: 'm', phase: 'click' } })
    assert.deepStrictEqual(t.node.sent, [])
    // the flow still updates the screen
    t.node.receive({ payload: { run: 1 } })
    assert.strictEqual(t.node.toPages.at(-1).payload.run, 1)
    // other widgets are left alone by the plugin
    assert.deepStrictEqual(t.hook.onAction(c, 'other', { payload: 1 }), { payload: 1 })
    t.close()
})

test('commands, acknowledgement and shelving follow the user lists', async () => {
    const t = setup({
        cmdUsers: 'ana, Bruno',
        ackUsers: 'ana',
        symbols: [{ id: 'b', type: 'button', key: 'start', action: { mode: 'value', value: '1', topic: 'go' } }, { id: 'a', type: 'alarm', key: 'emerg', props: { text: 'EMERG' } }]
    })
    t.node.receive({ payload: { emerg: 1 } })
    const bruno = t.conn('bruno')
    const ze = t.conn('ze', 's2')
    t.click(ze, { _hmiAction: { id: 'b', phase: 'click' } })
    assert.strictEqual(t.node.sent.length, 0)
    assert.match(ze.got[0]._hmiPrivate.notice, /Sem permissão/)
    t.click(bruno, { _hmiAction: { id: 'b', phase: 'click' } })
    assert.strictEqual(t.node.sent.length, 1)
    assert.strictEqual(t.node.sent[0].audit.user, 'bruno')
    // bruno may command but not acknowledge
    t.click(bruno, { _hmiAck: 'all' })
    t.click(bruno, { _hmiShelve: { id: 'a:on', minutes: 30 } })
    await flush()
    assert.strictEqual(t.node.toPages.at(-1).alarms.unacked, 1)
    const ana = t.conn('ana', 's3')
    t.click(ana, { _hmiAck: 'all' })
    await flush()
    assert.strictEqual(t.node.toPages.at(-1).alarms.unacked, 0)
    // what the page is told when it opens
    const loaded = t.hook.onLoad(bruno, t.node.id, {}, {})
    assert.deepStrictEqual(loaded._hmiPrivate.perm, { cmd: true, ack: false, shelve: false })
    assert.strictEqual(loaded._hmiPrivate.user, 'bruno')
    t.close()
})

test('wrong passwords lock the address and only that page is told', () => {
    const t = setup({ symbols: [{ id: 'b', type: 'button', key: 'x', action: { mode: 'value', value: '1', pin: 'yes' } }] }, { pin: '1234' })
    const c = t.conn()
    for (let i = 0; i < 5; i++) t.click(c, { _hmiAction: { id: 'b', phase: 'click', pin: '0000' } })
    assert.match(c.got.at(-1)._hmiPrivate.notice, /espere/)
    t.click(c, { _hmiAction: { id: 'b', phase: 'click', pin: '1234' } })
    assert.strictEqual(t.node.sent.length, 0)
    // no broadcast to every screen for a wrong password
    assert.strictEqual(t.node.toPages.length, 0)
    t.close()
})

test('a held pulse is released when the page stops answering or closes', async () => {
    const t = setup({ symbols: [{ id: 'p', type: 'button', key: 'jog', action: { mode: 'pulse' } }] })
    const c = t.conn()
    t.click(c, { _hmiAction: { id: 'p', phase: 'down' } })
    assert.deepStrictEqual(t.node.sent.map(m => m.payload), [1])
    c.emit('disconnect')
    assert.deepStrictEqual(t.node.sent.map(m => m.payload), [1, 0])
    assert.strictEqual(t.node.sent[1].audit.action, 'disconnect')
    // an "up" without a press sends nothing
    t.click(c, { _hmiAction: { id: 'p', phase: 'up' } })
    assert.strictEqual(t.node.sent.length, 2)
    // no heartbeat: the watchdog lets go
    const c2 = t.conn(null, 's9')
    t.click(c2, { _hmiAction: { id: 'p', phase: 'down' } })
    await new Promise(resolve => setTimeout(resolve, 1700))
    assert.deepStrictEqual(t.node.sent.map(m => m.payload), [1, 0, 1, 0])
    assert.strictEqual(t.node.sent[3].audit.action, 'watchdog')
    t.close()
})

test('a pulse with password is armed first, then held without asking again', () => {
    const t = setup({ symbols: [{ id: 'p', type: 'button', key: 'jog', action: { mode: 'pulse', pin: 'yes' } }] }, { pin: '42' })
    const c = t.conn()
    t.click(c, { _hmiAction: { id: 'p', phase: 'down' } })
    assert.strictEqual(t.node.sent.length, 0)
    t.click(c, { _hmiAction: { id: 'p', phase: 'arm', pin: '42' } })
    assert.strictEqual(c.got.at(-1)._hmiPrivate.armed.id, 'p')
    t.click(c, { _hmiAction: { id: 'p', phase: 'down' } })
    t.click(c, { _hmiAction: { id: 'p', phase: 'up' } })
    assert.deepStrictEqual(t.node.sent.map(m => m.payload), [1, 0])
    t.close()
})

test('interlocks, step limit and disabled widget block commands', () => {
    const t = setup({
        symbols: [
            { id: 'm', type: 'motor', key: 'run', action: { mode: 'toggle', interlock: 'permissivo, !emerg', interlockText: 'Porta aberta' } },
            { id: 's', type: 'setpoint', key: 'vel', action: { mode: 'input', min: '0', max: '200', maxStep: '20' } }
        ]
    })
    const c = t.conn()
    t.node.receive({ payload: { permissivo: 0, emerg: 0, run: 0, vel: 100 } })
    t.click(c, { _hmiAction: { id: 'm', phase: 'click' } })
    assert.strictEqual(c.got.at(-1)._hmiPrivate.notice, 'Bloqueado: Porta aberta')
    t.node.receive({ payload: { permissivo: 1 } })
    t.click(c, { _hmiAction: { id: 'm', phase: 'click' } })
    assert.strictEqual(t.node.sent.length, 1)
    t.click(c, { _hmiAction: { id: 's', phase: 'input', value: '150' } })
    assert.match(c.got.at(-1)._hmiPrivate.notice, /Mudança maior que 20/)
    t.click(c, { _hmiAction: { id: 's', phase: 'input', value: '115' } })
    assert.strictEqual(t.node.sent.length, 2)
    t.node.receive({ enabled: false })
    t.click(c, { _hmiAction: { id: 's', phase: 'input', value: '110' } })
    assert.strictEqual(t.node.sent.length, 2)
    t.close()
})

test('a command waits for the PLC echo, then times out', async () => {
    const t = setup({ confirmTimeout: 1, symbols: [{ id: 'm', type: 'motor', key: 'run', action: { mode: 'toggle' } }, { id: 'v', type: 'valve', key: 'open', action: { mode: 'toggle' } }] })
    const c = t.conn()
    t.node.receive({ payload: { run: 0, open: 0 } })
    t.click(c, { _hmiAction: { id: 'm', phase: 'click' } })
    t.click(c, { _hmiAction: { id: 'v', phase: 'click' } })
    await flush()
    assert.deepStrictEqual(t.node.toPages.at(-1).pending, { m: 'wait', v: 'wait' })
    t.node.receive({ payload: { run: 1 } })
    assert.deepStrictEqual(t.node.toPages.at(-1).pending, { v: 'wait' })
    await new Promise(resolve => setTimeout(resolve, 2100))
    assert.deepStrictEqual(t.node.toPages.at(-1).pending, { v: 'fail' })
    assert.ok(t.node.warns.some(w => /Sem confirmação/.test(w)))
    t.close()
})

test('flow messages: acknowledgement, quality, ui_update and lean output', async () => {
    const t = setup({ staleAfter: 5, symbols: [{ id: 'a', type: 'alarm', key: 'emerg', props: { text: 'EMERG' } }] })
    t.node.receive({ payload: { emerg: 1 }, buffer: Buffer.alloc(100) })
    let last = t.node.toPages.at(-1)
    assert.strictEqual(last.buffer, undefined)
    assert.strictEqual(last.alarmHist.length, 1)
    assert.ok(last.stamps.emerg > 0)
    t.node.receive({ payload: { emerg: 1 } })
    assert.strictEqual(t.node.toPages.at(-1).alarmHist, undefined)
    // acknowledging from the flow no longer throws
    t.node.receive({ _hmiAck: 'all', _client: { user: { name: 'scada' } } })
    last = t.node.toPages.at(-1)
    assert.strictEqual(last.alarms.unacked, 0)
    assert.strictEqual(last.alarmHist[0].user, 'scada')
    t.node.receive({ quality: { emerg: 'bad', x: 'good' } })
    assert.deepStrictEqual(t.node.toPages.at(-1).quality, { emerg: 'bad' })
    t.node.receive({ ui_update: { theme: 'classic', symbols: [] } })
    assert.deepStrictEqual(t.node.toPages.at(-1).ui_update, { theme: 'classic' })
    assert.strictEqual(t.stores.state.getProperty('c1', 'theme'), 'classic')
    t.close()
})
