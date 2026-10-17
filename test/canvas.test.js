'use strict'

const test = require('node:test')
const assert = require('node:assert')
const { mergeValues } = require('../nodes/values')

test('object payload is merged with earlier values', () => {
    const v = {}
    assert.strictEqual(mergeValues(v, { payload: { rpm: 1450, velocidade: 42.5 } }), true)
    assert.strictEqual(mergeValues(v, { payload: { rpm: 0 } }), true)
    assert.deepStrictEqual(v, { rpm: 0, velocidade: 42.5 })
})

test('single value goes under msg.topic', () => {
    const v = { a: 1 }
    assert.strictEqual(mergeValues(v, { topic: 'temp', payload: 21.5 }), true)
    assert.deepStrictEqual(v, { a: 1, temp: 21.5 })
})

test('nothing usable is reported', () => {
    const v = {}
    assert.strictEqual(mergeValues(v, { payload: 5 }), false)
    assert.strictEqual(mergeValues(v, { payload: [1, 2] }), false)
    assert.deepStrictEqual(v, {})
})

test('symbols saved from the dashboard are cleaned', () => {
    const { cleanSymbols } = require('../nodes/admin')
    assert.strictEqual(cleanSymbols('x'), null)
    assert.strictEqual(cleanSymbols([{ type: 'tag' }]), null)
    const [s] = cleanSymbols([{ id: 'a', type: 'tag', x: '10', y: 'oops', w: 1, h: 64, key: 'rpm', props: { title: 'RPM' }, preview: { bad: 1 }, extra: 1 }])
    assert.deepStrictEqual(s, { id: 'a', type: 'tag', x: 10, y: 0, w: 10, h: 64, rot: 0, key: 'rpm', props: { title: 'RPM' } })
    const [l] = cleanSymbols([{ id: 'b', type: 'frame', x: 0, y: 0, w: 10, h: 10, name: 'Fundo', locked: true }, { id: 'c', type: 'frame', locked: 'yes' }].slice(0, 1))
    assert.strictEqual(l.name, 'Fundo')
    assert.strictEqual(l.locked, true)
    assert.ok(!('locked' in cleanSymbols([{ id: 'c', type: 'frame', locked: 'yes' }])[0]))
})

test('click actions build the output from the node config', () => {
    const { actionMessage } = require('../nodes/values')
    const syms = [
        { id: 'b', type: 'button', key: 'start', action: { mode: 'pulse', topic: '' } },
        { id: 't', type: 'motor', key: 'run', action: { mode: 'toggle', topic: 'cmdRun' } },
        { id: 'v', type: 'text', key: 'sp', action: { mode: 'value', value: '42,5', confirm: 'yes' } },
        { id: 'n', type: 'led', key: 'x' }
    ]
    const noAudit = o => { if (o) delete o.audit; return o }
    const act = (id, phase, values = {}) => noAudit(actionMessage(syms, values, { _hmiAction: { id, phase }, _client: { socketId: 'a' } }))
    assert.deepStrictEqual(act('b', 'down'), { topic: 'start', payload: 1, symbol: { id: 'b', type: 'button', key: 'start' }, _client: { socketId: 'a' } })
    assert.strictEqual(act('b', 'up').payload, 0)
    assert.strictEqual(act('b', 'up', { start: true }).payload, false)
    assert.strictEqual(act('b', 'click'), null)
    assert.strictEqual(act('t', 'click', { run: 1 }).payload, 0)
    assert.strictEqual(act('t', 'click', { run: 0 }).payload, 1)
    assert.strictEqual(act('t', 'click', { run: false }).payload, true)
    assert.strictEqual(act('t', 'click').topic, 'cmdRun')
    assert.strictEqual(act('v', 'click').payload, 42.5)
    assert.strictEqual(act('n', 'click'), null)
    assert.strictEqual(act('zzz', 'click'), null)
})

test('click actions survive saving from the dashboard', () => {
    const { cleanSymbols } = require('../nodes/admin')
    const [s] = cleanSymbols([{ id: 'b', type: 'button', action: { mode: 'pulse', value: 3, topic: 't', confirm: 'yes', extra: 1 } }])
    assert.deepStrictEqual(s.action, { mode: 'pulse', value: '3', topic: 't', confirm: 'yes', pin: 'no' })
    const [n] = cleanSymbols([{ id: 'b', type: 'button', action: { mode: 'rm -rf' } }])
    assert.strictEqual(n.action, undefined)
})

test('typed setpoints are checked against the configured range', () => {
    const { actionMessage } = require('../nodes/values')
    const syms = [{ id: 's', type: 'setpoint', key: 'vel', action: { mode: 'input', topic: 'velAlvo', min: '0', max: '200' } }]
    const act = value => { const o = actionMessage(syms, {}, { _hmiAction: { id: 's', phase: 'input', value } }); if (o) delete o.audit; return o }
    assert.deepStrictEqual(act('150,5'), { topic: 'velAlvo', payload: 150.5, symbol: { id: 's', type: 'setpoint', key: 'vel' } })
    assert.deepStrictEqual(act('250'), { rejected: 'Valor fora da faixa (0 a 200)' })
    assert.ok(act('-1').rejected)
    assert.strictEqual(act('abc'), null)
    assert.strictEqual(act(''), null)
    assert.strictEqual(actionMessage(syms, {}, { _hmiAction: { id: 's', phase: 'click' } }), null)
})

test('typed setpoints go out in PLC units when the symbol is scaled', () => {
    const { actionMessage } = require('../nodes/values')
    const syms = [{ id: 's', type: 'setpoint', key: 'vel', scale: { factor: '0.1', offset: '' }, action: { mode: 'input', min: '0', max: '200' } }]
    assert.strictEqual(actionMessage(syms, {}, { _hmiAction: { id: 's', phase: 'input', value: '150' } }).payload, 1500)
    syms[0].scale = { factor: '', divisor: '10', offset: '' }
    assert.strictEqual(actionMessage(syms, {}, { _hmiAction: { id: 's', phase: 'input', value: '150' } }).payload, 1500)
    const page = [{ id: 'p', type: 'button', action: { mode: 'page', value: '/linha2' } }]
    assert.strictEqual(actionMessage(page, {}, { _hmiAction: { id: 'p', phase: 'click' } }), null)
})

test('rules, scale and page actions survive saving from the dashboard', () => {
    const { cleanSymbols } = require('../nodes/admin')
    const [s] = cleanSymbols([{ id: 'a', type: 'reel', scale: { factor: 0.1 }, rules: [{ key: 'k', op: 'gt', value: 5, effect: 'hide' }, { op: 'bad', effect: 'bad' }], action: { mode: 'page', value: '/linha2' } }])
    assert.deepStrictEqual(s.scale, { factor: '0.1', divisor: '', offset: '' })
    assert.deepStrictEqual(s.rules, [{ key: 'k', op: 'gt', value: '5', effect: 'hide' }, { key: '', op: 'on', value: '', effect: 'alarm' }])
    assert.strictEqual(s.action.mode, 'page')
    assert.strictEqual(s.action.value, '/linha2')
})

test('groups survive saving from the dashboard', () => {
    const { cleanSymbols } = require('../nodes/admin')
    const [a, b] = cleanSymbols([{ id: 'a', type: 'reel', group: 'g1' }, { id: 'b', type: 'reel', group: 5 }])
    assert.strictEqual(a.group, 'g1')
    assert.strictEqual(b.group, undefined)
})

test('alarm list: activation, return to normal and acknowledgement (ISA-18.2)', () => {
    const { createAlarms } = require('../nodes/alarms')
    const syms = [
        { id: 'm', type: 'motor', key: 'run', props: { label: 'M1', faultKey: 'falha', priority: '1' } },
        { id: 't', type: 'tank', key: 'nivel', scale: { divisor: '10' }, props: { label: 'Tanque', lo: 20, hi: 90, priority: '2' } },
        { id: 'a', type: 'alarm', key: 'emerg', props: { text: 'EMERGÊNCIA', onWhen: 'nonzero', priority: '1' } },
        { id: 'b', type: 'isaBar', key: 'temp', props: { title: 'Temp', lolo: 10, lo: 20, hi: 80, hihi: 90, priority: '2' } }
    ]
    const al = createAlarms(syms)
    assert.strictEqual(al.evaluate({ falha: 0, nivel: 500, emerg: 0, temp: 50 }, 1).length, 0)
    const ev = al.evaluate({ falha: 1, nivel: 150, emerg: 1, temp: 95 }, 2)
    assert.deepStrictEqual(ev.map(e => e.text).sort(), ['EMERGÊNCIA', 'M1 em falha', 'Tanque baixo', 'Temp muito alto'])
    assert.strictEqual(al.snapshot().unacked, 4)
    // back to normal but not acknowledged: stays in the list
    al.evaluate({ falha: 0, nivel: 500, emerg: 1, temp: 85 }, 3)
    let snap = al.snapshot()
    assert.ok(snap.active.find(a => a.id === 'm:fault' && !a.active && !a.acked))
    assert.ok(snap.active.find(a => a.id === 'b:hi' && a.active))
    al.ack('m:fault', 4, 'ana')
    snap = al.snapshot()
    assert.ok(!snap.active.find(a => a.id === 'm:fault'))
    assert.strictEqual(snap.history[0].event, 'RECONHECIDO')
    assert.strictEqual(snap.history[0].user, 'ana')
    al.ack('all', 5)
    assert.strictEqual(al.snapshot().unacked, 0)
    assert.ok(al.snapshot().active.length > 0)
    // survives a restart through save()
    const again = createAlarms(syms, JSON.parse(JSON.stringify(al.save())))
    assert.strictEqual(again.snapshot().active.length, al.snapshot().active.length)
})

test('faceplate buttons and password-protected commands', () => {
    const { actionMessage } = require('../nodes/values')
    const syms = [{ id: 'm', type: 'motor', key: 'run', props: { label: 'M1' }, action: { mode: 'faceplate', onTopic: 'cmd/m1', onValue: '1', offTopic: 'cmd/m1', offValue: '0', pin: 'yes' } }]
    assert.deepStrictEqual(actionMessage(syms, {}, { _hmiAction: { id: 'm', phase: 'fp-on', pin: 'x' } }, '1234'), { denied: true })
    const out = actionMessage(syms, {}, { _hmiAction: { id: 'm', phase: 'fp-off', pin: '1234' }, _client: { socketId: 's1', user: { name: 'Ana' } } }, '1234')
    assert.strictEqual(out.topic, 'cmd/m1')
    assert.strictEqual(out.payload, 0)
    assert.strictEqual(out.audit.user, 'Ana')
    assert.strictEqual(out.audit.symbol, 'M1')
    assert.strictEqual(actionMessage(syms, {}, { _hmiAction: { id: 'm', phase: 'fp-reset', pin: '1234' } }, '1234'), null)
    // no password configured on the node: protected commands are refused
    assert.deepStrictEqual(actionMessage(syms, {}, { _hmiAction: { id: 'm', phase: 'fp-on', pin: '' } }, ''), { denied: true })
})

test('alarm shelving hides an alarm for some minutes', () => {
    const { createAlarms } = require('../nodes/alarms')
    const syms = [{ id: 'm', type: 'motor', key: 'run', props: { label: 'M1', faultKey: 'f' } }]
    const a = createAlarms(syms)
    a.evaluate({ f: 1 }, 1000)
    assert.strictEqual(a.snapshot().unacked, 1)
    assert.strictEqual(a.shelve('nope', 10, 2000).length, 0)
    const ev = a.shelve('m:fault', 10, 2000, 'ana')
    assert.strictEqual(ev[0].event, 'SUPRIMIDO')
    let snap = a.snapshot()
    assert.strictEqual(snap.active.length, 0)
    assert.strictEqual(snap.unacked, 0)
    assert.strictEqual(snap.shelved[0].until, 2000 + 600000)
    assert.strictEqual(snap.shelved[0].by, 'ana')
    // survives a restart
    const b = createAlarms(syms, a.save())
    assert.strictEqual(b.snapshot().shelved.length, 1)
    assert.strictEqual(b.expire(5000).length, 0)
    assert.strictEqual(b.expire(2000 + 600000)[0].event, 'LIBERADO')
    snap = b.snapshot()
    assert.strictEqual(snap.shelved.length, 0)
    assert.strictEqual(snap.unacked, 1)
    assert.strictEqual(a.unshelve('m:fault', 3000, 'ana')[0].event, 'LIBERADO')
})

test('trend history is kept per trend key and window', () => {
    const { createTrendHistory } = require('../nodes/trend')
    const t = createTrendHistory([{ id: 't', type: 'trend', key: 'rpm', props: { window: 10 } }, { id: 'x', type: 'tag', key: 'temp' }])
    assert.strictEqual(t.size, 1)
    t.record({ rpm: 100, temp: 5 }, 1000)
    t.record({ rpm: 'x' }, 2000)
    t.record({ rpm: 120 }, 9000)
    assert.deepStrictEqual(t.snapshot(), { rpm: [[1000, 100], [9000, 120]] })
    t.record({ rpm: 130 }, 12000)
    assert.deepStrictEqual(t.snapshot().rpm, [[9000, 120], [12000, 130]])
    assert.strictEqual(createTrendHistory([]).size, 0)
})
