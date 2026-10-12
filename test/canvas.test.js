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
