import test from 'node:test'
import assert from 'node:assert'
import { CATEGORIES, paletteItems, SYMBOLS, createSymbol, isOn, formatValue, rangeState, renderSymbol, escapeXml } from '../ui/symbols/index.js'

test('on/off rules', () => {
    assert.strictEqual(isOn(1450, 'nonzero'), true)
    assert.strictEqual(isOn(0, 'nonzero'), false)
    assert.strictEqual(isOn(true, 'nonzero'), true)
    assert.strictEqual(isOn(false, 'nonzero'), false)
    assert.strictEqual(isOn(undefined, 'nonzero'), null)
    assert.strictEqual(isOn(5, 'gt', 10), false)
    assert.strictEqual(isOn(15, 'gt', 10), true)
})

test('numbers are formatted like the slitter panel', () => {
    assert.strictEqual(formatValue(1450, 0, 'pt-BR'), '1.450')
    assert.strictEqual(formatValue(42.5, 1, 'pt-BR'), '42,5')
    assert.strictEqual(formatValue(42.5, 1, 'en-US'), '42.5')
    assert.strictEqual(formatValue(undefined, 1), '—')
    assert.strictEqual(formatValue('BOB-77812A', 1), 'BOB-77812A')
    assert.strictEqual(formatValue(true), 'ON')
})

test('normal range and alarm', () => {
    assert.strictEqual(rangeState(1950, '', 1800), 'alarm')
    assert.strictEqual(rangeState(10, 20, ''), 'alarm')
    assert.strictEqual(rangeState(1500, 0, 1800), 'normal')
    assert.strictEqual(rangeState(undefined, 0, 1800), null)
})

test('every symbol renders in both states', () => {
    for (const type of Object.keys(SYMBOLS)) {
        const s = createSymbol(type, 10, 20)
        assert.strictEqual(s.w, SYMBOLS[type].w)
        assert.match(renderSymbol(s, SYMBOLS[type].preview), /^<g class="hmi-symbol" data-id="s[^"]+" transform="translate\(10,20\)">/)
        if (type === 'frame' || type === 'stack') continue // static drawing, or several keys of its own
        s.key = 'k'
        if (type === 'alarm') {
            // hidden when not active, shown as a ghost in the editor
            assert.ok(!renderSymbol(s, undefined).includes('hmi-alarm-banner'))
            assert.ok(renderSymbol(s, undefined, { editor: true }).length > 0)
            continue
        }
        assert.ok(renderSymbol(s, undefined).includes('hmi-unknown'), type)
    }
})

test('motor fault comes from its fault key', () => {
    const s = createSymbol('motor', 0, 0)
    s.key = 'run'
    s.props.faultKey = 'trip'
    assert.ok(!renderSymbol(s, 1, { values: { run: 1, trip: 0 } }).includes('hmi-p1'))
    assert.ok(renderSymbol(s, 1, { values: { run: 1, trip: 1 } }).includes('hmi-p1'))
})

test('line follows its points', () => {
    const s = createSymbol('line', 10, 10)
    s.props.points = [[0, 0], [100, 0], [100, 50]]
    assert.ok(renderSymbol(s, 1).includes('d="M0 0L100 0L100 50"'))
})

test('reel state classes', () => {
    const s = createSymbol('reel', 0, 0)
    assert.ok(renderSymbol(s, 1450).includes('hmi-reel hmi-on'))
    assert.ok(renderSymbol(s, 0).includes('hmi-reel hmi-off'))
})

test('tag shows the alarm indicator with its priority', () => {
    const s = createSymbol('tag', 0, 0)
    Object.assign(s.props, { title: 'RPM', unit: 'rpm', decimals: 0, hi: 1800, priority: '1' })
    const ok = renderSymbol(s, 1450, { locale: 'pt-BR' })
    assert.ok(ok.includes('1.450 rpm') && ok.includes('hmi-normal') && !ok.includes('hmi-alarm-ind'))
    const alarm = renderSymbol(s, 1950, { locale: 'pt-BR' })
    assert.ok(alarm.includes('hmi-tag hmi-alarm') && alarm.includes('hmi-alarm-ind hmi-p1'))
})

test('user text is escaped', () => {
    const s = createSymbol('tag', 0, 0)
    s.props.title = '<script>x</script>'
    assert.ok(!renderSymbol(s, 1).includes('<script>'))
    assert.strictEqual(escapeXml('a&"b'), 'a&amp;&quot;b')
})

test('rotation turns around the symbol centre', () => {
    const s = createSymbol('tag', 100, 50)
    s.rot = 90
    assert.ok(renderSymbol(s, 1).includes('transform="translate(100,50) rotate(90,80,32)"'))
})

test('palette lists every symbol and every shape', () => {
    const items = CATEGORIES.flatMap(c => paletteItems(c))
    for (const type of Object.keys(SYMBOLS)) assert.ok(items.some(i => i.type === type), type)
    for (const c of CATEGORIES) assert.ok(paletteItems(c).length > 0, c)
    for (const it of items) {
        const s = createSymbol(it.type, 0, 0, it.variant)
        assert.ok(renderSymbol(s, SYMBOLS[it.type].preview, { editor: true }).length > 40, it.label)
    }
    const silo = createSymbol('frame', 0, 0, paletteItems('Formas').find(i => i.label === 'Silo').variant)
    assert.strictEqual(silo.props.shape, 'silo')
    assert.strictEqual(silo.h, 260)
})

test('stack light reads its own keys', () => {
    const s = createSymbol('stack', 0, 0)
    s.props.keyRed = 'falha'
    assert.ok(renderSymbol(s, undefined, { values: { falha: 1 } }).includes('hmi-lamp-alarm hmi-on'))
    assert.ok(!renderSymbol(s, undefined, { values: { falha: 0 } }).includes('hmi-lamp-alarm hmi-on'))
})
