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
})

test('click actions build the output from the node config', () => {
    const { actionMessage } = require('../nodes/values')
    const syms = [
        { id: 'b', type: 'button', key: 'start', action: { mode: 'pulse', topic: '' } },
        { id: 't', type: 'motor', key: 'run', action: { mode: 'toggle', topic: 'cmdRun' } },
        { id: 'v', type: 'text', key: 'sp', action: { mode: 'value', value: '42,5', confirm: 'yes' } },
        { id: 'n', type: 'led', key: 'x' }
    ]
    const act = (id, phase, values = {}) => actionMessage(syms, values, { _hmiAction: { id, phase }, _client: { socketId: 'a' } })
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
    assert.deepStrictEqual(s.action, { mode: 'pulse', value: '3', topic: 't', confirm: 'yes' })
    const [n] = cleanSymbols([{ id: 'b', type: 'button', action: { mode: 'rm -rf' } }])
    assert.strictEqual(n.action, undefined)
})

test('typed setpoints are checked against the configured range', () => {
    const { actionMessage } = require('../nodes/values')
    const syms = [{ id: 's', type: 'setpoint', key: 'vel', action: { mode: 'input', topic: 'velAlvo', min: '0', max: '200' } }]
    const act = value => actionMessage(syms, {}, { _hmiAction: { id: 's', phase: 'input', value } })
    assert.deepStrictEqual(act('150,5'), { topic: 'velAlvo', payload: 150.5, symbol: { id: 's', type: 'setpoint', key: 'vel' } })
    assert.strictEqual(act('250'), null)
    assert.strictEqual(act('-1'), null)
    assert.strictEqual(act('abc'), null)
    assert.strictEqual(act(''), null)
    assert.strictEqual(actionMessage(syms, {}, { _hmiAction: { id: 's', phase: 'click' } }), null)
})
