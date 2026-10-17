import test from 'node:test'
import assert from 'node:assert'
import { CATEGORIES, paletteItems, SYMBOLS, createSymbol, isOn, formatValue, rangeState, renderSymbol, escapeXml, valueFor, scaleValue, unscaleValue, ruleEffects, safeImageSrc } from '../ui/symbols/index.js'

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
        if (['frame', 'shape', 'stack', 'image', 'svgImport', 'alarmList', 'alarmSummary', 'barChart', 'donut'].includes(type)) continue // static drawing, or several keys of its own
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

test('scale turns raw PLC values into screen units', () => {
    const s = createSymbol('tag', 0, 0)
    s.key = 'rpm'
    s.scale = { factor: '0.1', offset: '' }
    assert.strictEqual(valueFor(s, { rpm: 1450 }), 145)
    assert.strictEqual(scaleValue(s, true), true)
    assert.strictEqual(unscaleValue(s, 145), 1450)
    s.scale = { factor: '', divisor: '10', offset: '2' }
    assert.strictEqual(scaleValue(s, 1450), 147)
    assert.strictEqual(unscaleValue(s, 147), 1450)
    s.scale = { factor: '3', divisor: '0', offset: '' }
    assert.strictEqual(scaleValue(s, 2), 6)
    s.scale = { factor: '', offset: '' }
    assert.strictEqual(valueFor(s, { rpm: 1450 }), 1450)
})

test('rules hide or colour a symbol from a value', () => {
    const s = createSymbol('reel', 0, 0)
    s.key = 'rpm'
    s.rules = [{ key: 'temBobina', op: 'off', value: '', effect: 'hide' }, { key: '', op: 'gt', value: '1800', effect: 'alarm' }]
    assert.deepStrictEqual(ruleEffects(s, { temBobina: 1, rpm: 100 }), { hide: false, classes: [] })
    assert.deepStrictEqual(ruleEffects(s, { temBobina: 0, rpm: 1900 }), { hide: true, classes: ['hmi-rule-alarm'] })
    assert.strictEqual(renderSymbol(s, 1, { values: { temBobina: 0 } }), '')
    assert.ok(renderSymbol(s, 1, { values: { temBobina: 0 }, editor: true }).includes('hmi-rule-hidden'))
    assert.ok(renderSymbol(s, 1900, { values: { temBobina: 1, rpm: 1900 } }).startsWith('<g class="hmi-symbol hmi-rule-alarm"'))
    s.rules = [{ key: 'modo', op: 'eq', value: 'AUTO', effect: 'blink' }]
    assert.deepStrictEqual(ruleEffects(s, { modo: 'AUTO' }).classes, ['hmi-rule-blink'])
})

test('images only accept image data or plain addresses', () => {
    assert.ok(safeImageSrc('data:image/png;base64,iVBORw0KGgo='))
    assert.ok(safeImageSrc('data:image/svg+xml;base64,PHN2Zz48L3N2Zz4='))
    assert.ok(safeImageSrc('https://example.com/a.png'))
    assert.ok(safeImageSrc('/img/maquina.png'))
    assert.strictEqual(safeImageSrc('javascript:alert(1)'), '')
    assert.strictEqual(safeImageSrc('data:text/html;base64,PGI+'), '')
    assert.strictEqual(safeImageSrc('https://x.com/a.png" onload="x'), '')
    const s = createSymbol('image', 0, 0)
    s.props.src = 'https://example.com/a.png'
    assert.ok(renderSymbol(s, undefined).includes('<image href="https://example.com/a.png"'))
})

test('slitter tones and custom colours on shapes', () => {
    const s = createSymbol('frame', 0, 0)
    s.props.tone = 'metal'
    const out = renderSymbol(s)
    assert.ok(out.includes('<linearGradient id="hmi-grad-' + s.id + '"'))
    assert.ok(out.includes('--hmi-tone-stroke:#8a939d'))
    s.props.tone = 'custom'
    s.props.fill = '#ff0000'
    s.props.stroke = 'red;}<script>'
    const c = renderSymbol(s)
    assert.ok(c.includes('--hmi-tone-fill:#ff0000;--hmi-tone-stroke:#8a939d'))
    assert.ok(!c.includes('<script>'))
})

test('inverted signal flips sensors and other on/off symbols', () => {
    const s = createSymbol('sensor', 0, 0)
    assert.ok(renderSymbol(s, 1).includes('hmi-on'))
    s.props.invert = 'yes'
    assert.ok(!renderSymbol(s, 1).includes('hmi-on'))
    assert.ok(renderSymbol(s, 0).includes('hmi-on'))
    assert.ok(renderSymbol(s, undefined).includes('hmi-unknown'))
    const m = createSymbol('motor', 0, 0)
    m.props.invert = 'yes'
    assert.ok(renderSymbol(m, false).includes('hmi-on'))
})

test('beams, supports and pedestals have their own palette menu', () => {
    const items = paletteItems('Estruturas')
    assert.ok(items.length >= 13)
    assert.ok(!paletteItems('Formas').some(i => i.label.startsWith('Viga')))
    for (const it of items) {
        const s = createSymbol(it.type, 0, 0, it.variant)
        assert.ok(!('category' in s))
        const out = renderSymbol(s)
        assert.ok(out.includes('hmi-body'), it.label)
        assert.ok(!/NaN|undefined/.test(out), it.label)
    }
})

test('process, factory and electrical symbols render in every state', () => {
    for (const cat of ['Processo', 'Fábrica', 'Elétrica']) assert.ok(paletteItems(cat).length >= 6, cat)
    for (const c of CATEGORIES) {
        for (const it of paletteItems(c)) {
            const s = createSymbol(it.type, 0, 0, it.variant)
            for (const v of [undefined, 0, 1, 55, -20, true, 'texto']) {
                const out = renderSymbol(s, v, { values: { a: 1 }, locale: 'pt-BR' })
                assert.ok(!/NaN|undefined|Infinity/.test(out), it.label + ' ' + v)
            }
        }
    }
})

test('ISA-101 bar, mode, VFD and crane read their values', () => {
    const b = createSymbol('isaBar', 0, 0, 0)
    assert.ok(renderSymbol(b, 50).includes('hmi-isabar hmi-normal'))
    assert.ok(renderSymbol(b, 85).includes('hmi-isabar hmi-warn'))
    assert.ok(renderSymbol(b, 95).includes('hmi-isabar hmi-alarm'))
    b.props.spKey = 'sp'
    assert.ok(renderSymbol(b, 50, { values: { sp: 40 } }).includes('hmi-isa-sp'))
    const m = createSymbol('mode', 0, 0)
    assert.ok(renderSymbol(m, 1).includes('hmi-normal') && renderSymbol(m, 1).includes('>AUTO<'))
    assert.ok(renderSymbol(m, 0).includes('hmi-abnormal') && renderSymbol(m, 0).includes('>MANUAL<'))
    const v = createSymbol('vfd', 0, 0)
    assert.ok(renderSymbol(v, 0).includes('hmi-off'))
    assert.ok(renderSymbol(v, 42.5, { locale: 'pt-BR' }).includes('42,5 Hz'))
    v.props.runKey = 'run'
    assert.ok(renderSymbol(v, 42.5, { values: { run: 0 } }).includes('hmi-off'))
    const c = createSymbol('crane', 0, 0, 0)
    const left = renderSymbol(c, 0).match(/class="hmi-body" x="([\d.]+)"/)[1]
    const right = renderSymbol(c, 100).match(/class="hmi-body" x="([\d.]+)"/)[1]
    assert.ok(Number(right) > Number(left) + 200)
    const h = createSymbol('counter', 0, 0, 0)
    h.props.src = 's'
    assert.ok(renderSymbol(h, 7380).includes('2 h 03 min'))
})

test('text with {key} placeholders', () => {
    const t = createSymbol('text', 0, 0)
    t.props.text = 'Lote {lote} – {pecas} pç, {temp:1} °C'
    const out = renderSymbol(t, undefined, { locale: 'pt-BR', values: { lote: 'A12', pecas: 1450, temp: 82 } })
    assert.ok(out.includes('Lote A12 – 1.450 pç, 82,0 °C'), out)
    assert.ok(renderSymbol(t, undefined, { values: {} }).includes('Lote — –'))
    assert.ok(renderSymbol(t, undefined, { values: {}, editor: true }).includes('{lote}'))
})

test('any shape fills by value', () => {
    const s = createSymbol('frame', 0, 0)
    s.w = 100
    s.h = 200
    s.props.shape = 'silo'
    assert.ok(!renderSymbol(s, 50).includes('hmi-shape-level'))
    s.props.level = 'up'
    const out = renderSymbol(s, 25)
    assert.ok(out.includes('clipPath') && out.includes('y="150" width="100" height="50"'), out)
    assert.ok(out.includes('class="hmi-level"'))
    assert.ok(!renderSymbol(s, 0).includes('hmi-shape-level'))
    s.props.level = 'right'
    s.props.showValue = 'yes'
    assert.ok(renderSymbol(s, 40).includes('width="40" height="200"') && renderSymbol(s, 40).includes('40 %'))
})

test('bar chart, donut and OEE', async () => {
    const { parseSeries, oeeOf } = await import('../ui/symbols/charts.js')
    assert.deepStrictEqual(parseSeries('a:Turno A, b'), [{ key: 'a', label: 'Turno A' }, { key: 'b', label: 'b' }])
    assert.strictEqual(oeeOf(90, 95, 99), 84.6)
    assert.strictEqual(oeeOf(0.9, 0.95, 0.99), 84.6)
    assert.strictEqual(oeeOf(90, null, 99), null)
    const b = createSymbol('barChart', 0, 0)
    b.props.goal = 100
    b.props.lowColor = 'warn'
    const out = renderSymbol(b, undefined, { values: { turno1: 120, turno2: 80, turno3: 0 } })
    assert.strictEqual((out.match(/hmi-ch-bar/g) || []).length, 3)
    assert.strictEqual((out.match(/hmi-ch-low/g) || []).length, 2)
    assert.ok(out.includes('Meta 100'))
    b.props.series = ''
    b.props.labels = 'Seg,Ter'
    b.key = 'semana'
    assert.ok(renderSymbol(b, [5, 7], { values: {} }).includes('>Ter<'))
    const d = createSymbol('donut', 0, 0)
    const dout = renderSymbol(d, undefined, { values: { produzindo: 300, parada: 60, setup: 40 } })
    assert.strictEqual((dout.match(/hmi-ch-arc/g) || []).length, 3)
    assert.ok(dout.includes('400 min') && dout.includes('75,0%'))
    const o = createSymbol('oee', 0, 0)
    assert.ok(renderSymbol(o, undefined, { values: { disponibilidade: 90, performance: 95, qualidade: 99 } }).includes('84,6%'))
    assert.ok(renderSymbol(o, undefined, { values: { disponibilidade: 90, performance: 95, qualidade: 99 } }).includes('hmi-oee-warn'))
    assert.ok(renderSymbol(o, undefined, { values: { disponibilidade: 0.5, performance: 0.9, qualidade: 1 } }).includes('hmi-oee-alarm'))
    assert.ok(renderSymbol(o, undefined, { values: {} }).includes('hmi-unknown'))
})

test('editor helpers: symbol search, blocks and layer names', async () => {
    const { searchPalette, makeBlock, layerName } = await import('../ui/editor/index.js')
    assert.ok(searchPalette('bomba').some(it => it.type === 'pump'))
    assert.ok(searchPalette('VIGA').length >= 2)
    assert.deepStrictEqual(searchPalette('  '), [])
    const b = makeBlock('Motor', [{ id: 'a', type: 'motor', x: 100, y: 50, w: 70, h: 70, locked: true }, { id: 'b', type: 'tag', x: 200, y: 80, w: 160, h: 64 }])
    assert.deepStrictEqual(b.symbols.map(m => [m.x, m.y]), [[0, 0], [100, 30]])
    assert.ok(!b.symbols[0].locked)
    assert.strictEqual(layerName({ type: 'tag', props: { title: 'RPM' } }), 'RPM')
    assert.strictEqual(layerName({ type: 'tag', name: 'Rolo 1', props: { title: 'RPM' } }), 'Rolo 1')
})

test('machine parts, free shape and turning wheels', () => {
    const shapes = SYMBOLS.frame.variants.filter(v => v.category === 'Mecânica').map(v => v.props.shape)
    assert.ok(shapes.length >= 20 && shapes.includes('gear') && shapes.includes('beltDrive'))
    assert.ok(paletteItems('Mecânica').length === shapes.length)
    for (const v of SYMBOLS.frame.variants) {
        const s = createSymbol('frame', 0, 0, SYMBOLS.frame.variants.indexOf(v))
        const out = renderSymbol(s, undefined)
        assert.ok(!/NaN|undefined/.test(out), v.label)
        assert.ok(out.includes('hmi-body'), v.label)
    }
    const g = createSymbol('frame', 0, 0, SYMBOLS.frame.variants.findIndex(v => v.props.shape === 'gear'))
    assert.ok(!renderSymbol(g, 1).includes('hmi-spin'))
    g.props.spin = 'ccw'
    assert.ok(renderSymbol(g, 1).includes('hmi-turning hmi-ccw'))
    assert.ok(renderSymbol(g, 0).includes('hmi-spin') && !renderSymbol(g, 0).includes('hmi-turning'))
    const f = createSymbol('shape', 0, 0)
    assert.ok(SYMBOLS.shape.line)
    assert.match(renderSymbol(f, undefined), /<path class="hmi-body" d="M40 0L160 0L160 120L0 120L0 40Z"/)
    f.props.smooth = 'yes'
    assert.ok(/d="M40 0C/.test(renderSymbol(f, undefined)))
    f.props.level = 'up'
    assert.ok(renderSymbol(f, 50).includes('hmi-shape-level'))
})

test('pneumatic, sensor, handling and production parts follow the key', () => {
    for (const cat of ['Pneumática', 'Sensores', 'Manuseio', 'Produção']) {
        assert.ok(CATEGORIES.includes(cat), cat)
        assert.ok(paletteItems(cat).length >= 10, cat)
    }
    const make = shape => createSymbol('frame', 0, 0, SYMBOLS.frame.variants.findIndex(v => v.props.shape === shape))
    for (const v of SYMBOLS.frame.variants) {
        const s = createSymbol('frame', 0, 0, SYMBOLS.frame.variants.indexOf(v))
        for (const val of [0, 1]) assert.ok(!/NaN|undefined/.test(renderSymbol(s, val)), v.label)
    }
    const cyl = make('pneuCyl')
    assert.notStrictEqual(renderSymbol(cyl, 1), renderSymbol(cyl, 0))
    assert.ok(renderSymbol(cyl, 1).includes('hmi-on') && !renderSymbol(cyl, 0).includes('hmi-on'))
    assert.ok(renderSymbol(make('photoEye'), 1).includes('hmi-beam-cut'))
    const enc = make('encoder')
    enc.props.spin = 'cw'
    assert.ok(renderSymbol(enc, 1).includes('hmi-turning'))
    cyl.props.darken = 'yes'
    assert.ok(renderSymbol(cyl, 1).includes('hmi-darken'))
})
