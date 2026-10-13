// Symbol library shared by the Node-RED editor (drag-and-drop preview) and the
// dashboard widget. Every symbol draws itself as SVG markup in its own box
// (0,0)-(w,h); the caller places the box on the canvas.

export const THEMES = {
    isa101: 'ISA-101',
    classic: 'Clássico'
}

const ON_FIELDS = [
    { key: 'onWhen', label: 'Ligado quando', type: 'select', options: [['nonzero', 'valor ≠ 0 / true'], ['gt', 'valor > limite']] },
    { key: 'threshold', label: 'Limite', type: 'number' }
]
const COLOR_FIELD = { key: 'color', label: 'Cor quando ligado', type: 'select', options: [['auto', 'Do tema'], ['alarm', 'Alarme (vermelho)'], ['warn', 'Atenção (amarelo)'], ['info', 'Informação (azul)']] }
const BLINK_FIELD = { key: 'blink', label: 'Piscar quando ligado', type: 'select', options: [['no', 'Não'], ['yes', 'Sim']] }
const PRIORITY_FIELD = { key: 'priority', label: 'Prioridade do alarme', type: 'select', options: [['1', '1 (alta)'], ['2', '2 (média)'], ['3', '3 (baixa)']] }

export const SYMBOLS = {
    reel: {
        label: 'Bobina',
        group: 'Equipamentos',
        w: 160,
        h: 160,
        preview: 1450,
        defaults: { label: '', onWhen: 'nonzero', threshold: 0 },
        fields: [{ key: 'label', label: 'Legenda', type: 'text' }, ...ON_FIELDS],
        render: renderReel
    },
    roller: {
        label: 'Rolo',
        group: 'Equipamentos',
        w: 24,
        h: 24,
        preview: 1,
        defaults: { onWhen: 'nonzero', threshold: 0, dir: 'cw' },
        fields: [...ON_FIELDS, { key: 'dir', label: 'Sentido', type: 'select', options: [['cw', 'Horário'], ['ccw', 'Anti-horário']] }],
        render: renderRoller
    },
    motor: {
        label: 'Motor',
        group: 'Equipamentos',
        w: 70,
        h: 70,
        preview: 1,
        defaults: { label: '', onWhen: 'nonzero', threshold: 0, faultKey: '', priority: '1' },
        fields: [{ key: 'label', label: 'Legenda', type: 'text' }, ...ON_FIELDS, { key: 'faultKey', label: 'Chave da falha (opcional)', type: 'text' }, PRIORITY_FIELD],
        render: renderMotor
    },
    frame: {
        label: 'Corpo',
        group: 'Equipamentos',
        w: 240,
        h: 300,
        preview: undefined,
        defaults: { shape: 'chamfer', tone: 'equip', label: '' },
        fields: [
            { key: 'shape', label: 'Forma', type: 'select', options: [['rect', 'Retângulo'], ['round', 'Cantos redondos'], ['chamfer', 'Chanfrado em cima'], ['arcLeft', 'Curva à esquerda'], ['arcRight', 'Curva à direita'], ['circle', 'Círculo']] },
            { key: 'tone', label: 'Tom', type: 'select', options: [['equip', 'Equipamento'], ['dark', 'Escuro'], ['pit', 'Fosso / vazio']] },
            { key: 'label', label: 'Legenda', type: 'text' }
        ],
        render: renderFrame
    },
    line: {
        label: 'Linha',
        group: 'Equipamentos',
        w: 200,
        h: 1,
        preview: 1,
        line: true,
        defaults: { style: 'strip', onWhen: 'nonzero', threshold: 0, flow: 'auto', points: [[0, 0], [200, 0]] },
        fields: [
            { key: 'style', label: 'Tipo', type: 'select', options: [['strip', 'Chapa / material'], ['pipe', 'Tubulação'], ['conveyor', 'Esteira'], ['signal', 'Sinal / ligação']] },
            ...ON_FIELDS,
            { key: 'flow', label: 'Animar fluxo', type: 'select', options: [['auto', 'Só no tema Clássico'], ['always', 'Sempre'], ['never', 'Nunca']] }
        ],
        render: renderLine
    },
    tag: {
        label: 'Tag',
        group: 'Valores',
        w: 160,
        h: 64,
        preview: 42.5,
        defaults: { title: 'TAG', unit: '', decimals: 1, min: '', max: '', lo: '', hi: '', priority: '2' },
        fields: [
            { key: 'title', label: 'Título', type: 'text' },
            { key: 'unit', label: 'Unidade', type: 'text' },
            { key: 'decimals', label: 'Casas decimais', type: 'number' },
            { key: 'min', label: 'Escala mín.', type: 'number' },
            { key: 'max', label: 'Escala máx.', type: 'number' },
            { key: 'lo', label: 'Normal de', type: 'number' },
            { key: 'hi', label: 'Normal até', type: 'number' },
            PRIORITY_FIELD
        ],
        render: renderTag
    },
    kpi: {
        label: 'KPI',
        group: 'Valores',
        w: 300,
        h: 140,
        preview: 7,
        defaults: { title: 'BOBINAS PRONTAS', unit: '', decimals: 0, subtitle: '' },
        fields: [
            { key: 'title', label: 'Título', type: 'text' },
            { key: 'unit', label: 'Unidade', type: 'text' },
            { key: 'decimals', label: 'Casas decimais', type: 'number' },
            { key: 'subtitle', label: 'Subtítulo', type: 'text' }
        ],
        render: renderKpi
    },
    text: {
        label: 'Texto',
        group: 'Valores',
        w: 220,
        h: 30,
        preview: undefined,
        defaults: { text: 'Texto', size: 16, align: 'middle', bold: 'no', tone: 'normal', unit: '', decimals: '' },
        fields: [
            { key: 'text', label: 'Texto (antes do valor, se tiver chave)', type: 'text' },
            { key: 'size', label: 'Tamanho', type: 'number' },
            { key: 'align', label: 'Alinhamento', type: 'select', options: [['start', 'Esquerda'], ['middle', 'Centro'], ['end', 'Direita']] },
            { key: 'bold', label: 'Negrito', type: 'select', options: [['no', 'Não'], ['yes', 'Sim']] },
            { key: 'tone', label: 'Cor', type: 'select', options: [['normal', 'Normal'], ['dim', 'Discreta']] },
            { key: 'unit', label: 'Unidade', type: 'text' },
            { key: 'decimals', label: 'Casas decimais', type: 'number' }
        ],
        render: renderText
    },
    led: {
        label: 'LED',
        group: 'Estados',
        w: 28,
        h: 28,
        preview: true,
        defaults: { label: '', onWhen: 'nonzero', threshold: 0, color: 'auto', blink: 'no' },
        fields: [{ key: 'label', label: 'Legenda', type: 'text' }, ...ON_FIELDS, COLOR_FIELD, BLINK_FIELD],
        render: renderLed
    },
    chip: {
        label: 'Status',
        group: 'Estados',
        w: 180,
        h: 34,
        preview: true,
        defaults: { textOn: 'LIGADO', textOff: 'DESLIGADO', onWhen: 'nonzero', threshold: 0, color: 'auto', blink: 'no' },
        fields: [{ key: 'textOn', label: 'Texto ligado', type: 'text' }, { key: 'textOff', label: 'Texto desligado', type: 'text' }, ...ON_FIELDS, COLOR_FIELD, BLINK_FIELD],
        render: renderChip
    },
    alarm: {
        label: 'Alarme',
        group: 'Estados',
        w: 600,
        h: 96,
        preview: true,
        defaults: { text: 'EMERGÊNCIA ACIONADA', sub: '', onWhen: 'nonzero', threshold: 0, priority: '1', blink: 'yes' },
        fields: [{ key: 'text', label: 'Texto', type: 'text' }, { key: 'sub', label: 'Texto menor', type: 'text' }, ...ON_FIELDS, PRIORITY_FIELD, BLINK_FIELD],
        render: renderAlarm
    }
}

let counter = 0
export function createSymbol (type, x, y) {
    const def = SYMBOLS[type]
    if (!def) throw new Error('Unknown symbol type: ' + type)
    counter = (counter + 1) % 1e6
    return {
        id: 's' + Date.now().toString(36) + counter.toString(36),
        type,
        x: Math.round(x),
        y: Math.round(y),
        w: def.w,
        h: def.h,
        rot: 0,
        key: '',
        props: JSON.parse(JSON.stringify(def.defaults))
    }
}

// Value the symbol shows: from the values object by key, or the editor preview.
export function valueFor (sym, values) {
    if (!values || !sym.key) return undefined
    return values[sym.key]
}

export function isOn (value, rule, threshold) {
    if (value === undefined || value === null || value === '') return null
    if (rule === 'gt') return Number(value) > Number(threshold)
    if (typeof value === 'boolean') return value
    if (typeof value === 'string' && isNaN(Number(value))) return value.length > 0
    return Number(value) !== 0
}

export function formatValue (value, decimals, locale) {
    if (value === undefined || value === null || value === '') return '—'
    if (typeof value === 'boolean') return value ? 'ON' : 'OFF'
    const n = typeof value === 'number' ? value : (typeof value === 'string' && value.trim() !== '' ? Number(value) : NaN)
    if (!isFinite(n)) return String(value)
    const d = decimals === '' || decimals === undefined || decimals === null ? undefined : Math.max(0, Math.min(10, Number(decimals) || 0))
    try {
        return n.toLocaleString(locale || 'pt-BR', d === undefined ? undefined : { minimumFractionDigits: d, maximumFractionDigits: d })
    } catch (e) {
        return d === undefined ? String(n) : n.toFixed(d)
    }
}

const num = v => (v === '' || v === undefined || v === null || !isFinite(Number(v))) ? null : Number(v)

// 'alarm' when the value is outside the normal range, 'normal' inside it, null when unknown.
export function rangeState (value, lo, hi) {
    const v = num(value)
    if (v === null) return null
    const l = num(lo)
    const h = num(hi)
    if (l !== null && v < l) return 'alarm'
    if (h !== null && v > h) return 'alarm'
    return 'normal'
}

export function escapeXml (s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

const f = n => Math.round(n * 100) / 100

// ISA-101 alarm indicator: shape and number change with priority, colour is not the only cue.
export function alarmIndicator (cx, cy, priority) {
    const p = String(priority || '2')
    const s = 9
    let shape
    if (p === '1') shape = `<rect x="${f(cx - s)}" y="${f(cy - s)}" width="${2 * s}" height="${2 * s}"/>`
    else if (p === '3') shape = `<polygon points="${f(cx)},${f(cy - s - 2)} ${f(cx + s + 2)},${f(cy)} ${f(cx)},${f(cy + s + 2)} ${f(cx - s - 2)},${f(cy)}"/>`
    else shape = `<polygon points="${f(cx - s - 1)},${f(cy - s + 1)} ${f(cx + s + 1)},${f(cy - s + 1)} ${f(cx)},${f(cy + s + 3)}"/>`
    return `<g class="hmi-alarm-ind hmi-p${escapeXml(p)}">${shape}<text x="${f(cx)}" y="${f(cy + (p === '2' ? -1 : 0.5))}">${escapeXml(p)}</text></g>`
}

function renderReel (sym, value) {
    const p = sym.props || {}
    const w = sym.w
    const h = sym.h
    const cx = w / 2
    const cy = h / 2
    const r = Math.max(4, Math.min(w, h) / 2 - 2)
    const cls = stateClass(isOn(value, p.onWhen, p.threshold))
    // the spinning part is drawn around 0,0 and moved to the centre, so it turns on its own axis
    const spokes = [-90, 30, 150].map(a => {
        const rad = a * Math.PI / 180
        return `<line x1="${f(Math.cos(rad) * r * 0.32)}" y1="${f(Math.sin(rad) * r * 0.32)}" x2="${f(Math.cos(rad) * r * 0.9)}" y2="${f(Math.sin(rad) * r * 0.9)}"/>`
    }).join('')
    const label = labelBelow(p, w, h)
    return `<g class="hmi-reel ${cls}">` +
        `<circle class="hmi-body" cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}"/>` +
        `<g transform="translate(${f(cx)},${f(cy)})"><g class="hmi-spin"><circle class="hmi-ring" r="${f(r * 0.78)}"/>` +
        `<circle class="hmi-ring" r="${f(r * 0.58)}"/>` +
        `<g class="hmi-spokes">${spokes}</g>` +
        `<circle class="hmi-hub" r="${f(r * 0.3)}"/></g></g>` +
        `<circle class="hmi-axle" cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.09)}"/>` +
        label + '</g>'
}

const stateClass = on => on === null ? 'hmi-unknown' : (on ? 'hmi-on' : 'hmi-off')
const colorClass = p => 'hmi-c-' + (['alarm', 'warn', 'info'].includes(p.color) ? p.color : 'auto')
const blinkClass = (p, on) => (on && p.blink === 'yes') ? ' hmi-blink' : ''
const labelBelow = (p, w, h) => p.label ? `<text class="hmi-label" x="${f(w / 2)}" y="${f(h + 18)}">${escapeXml(p.label)}</text>` : ''

function renderRoller (sym, value) {
    const p = sym.props || {}
    const cx = sym.w / 2
    const cy = sym.h / 2
    const r = Math.max(3, Math.min(sym.w, sym.h) / 2 - 1)
    const on = isOn(value, p.onWhen, p.threshold)
    return `<g class="hmi-roller ${stateClass(on)} hmi-${p.dir === 'ccw' ? 'ccw' : 'cw'}"><g transform="translate(${f(cx)},${f(cy)})"><g class="hmi-spin">` +
        `<circle class="hmi-body" r="${f(r)}"/>` +
        `<line class="hmi-mark" x1="0" y1="${f(-r * 0.7)}" x2="0" y2="${f(r * 0.7)}"/></g></g></g>`
}

function renderMotor (sym, value, opts) {
    const p = sym.props || {}
    const w = sym.w
    const h = sym.h
    const r = Math.max(6, Math.min(w, h * 0.86) / 2 - 2)
    const cx = w / 2
    const cy = r + 2
    const on = isOn(value, p.onWhen, p.threshold)
    const fault = p.faultKey && opts.values ? isOn(opts.values[p.faultKey], 'nonzero') === true : false
    let out = `<g class="hmi-motor ${stateClass(on)}${fault ? ' hmi-fault' : ''}">` +
        `<rect class="hmi-foot" x="${f(cx - r * 0.8)}" y="${f(cy + r - 2)}" width="${f(r * 1.6)}" height="${f(Math.max(4, h - cy - r + 2))}" rx="2"/>` +
        `<circle class="hmi-body" cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}"/>` +
        `<text class="hmi-motor-m" x="${f(cx)}" y="${f(cy)}" font-size="${f(r * 0.9)}">M</text>`
    if (fault) out += alarmIndicator(w - 4, 6, p.priority)
    return out + labelBelow(p, w, h) + '</g>'
}

function framePath (shape, w, h) {
    const c = Math.min(w, h) * 0.15
    const a = Math.min(w, h) * 0.3
    switch (shape) {
    case 'round': return `<rect class="hmi-body" x="0" y="0" width="${f(w)}" height="${f(h)}" rx="${f(Math.min(w, h) * 0.08)}"/>`
    case 'chamfer': return `<path class="hmi-body" d="M0 ${f(h)}V${f(c)}L${f(c)} 0H${f(w - c)}L${f(w)} ${f(c)}V${f(h)}Z"/>`
    case 'arcLeft': return `<path class="hmi-body" d="M0 ${f(h)}V${f(a)}A${f(a)} ${f(a)} 0 0 1 ${f(a)} 0H${f(w)}V${f(h)}Z"/>`
    case 'arcRight': return `<path class="hmi-body" d="M0 ${f(h)}V0H${f(w - a)}A${f(a)} ${f(a)} 0 0 1 ${f(w)} ${f(a)}V${f(h)}Z"/>`
    case 'circle': return `<ellipse class="hmi-body" cx="${f(w / 2)}" cy="${f(h / 2)}" rx="${f(w / 2)}" ry="${f(h / 2)}"/>`
    default: return `<rect class="hmi-body" x="0" y="0" width="${f(w)}" height="${f(h)}"/>`
    }
}

function renderFrame (sym) {
    const p = sym.props || {}
    const tone = ['dark', 'pit'].includes(p.tone) ? p.tone : 'equip'
    const label = p.label ? `<text class="hmi-label" x="${f(sym.w / 2)}" y="${f(sym.h + 18)}">${escapeXml(p.label)}</text>` : ''
    return `<g class="hmi-frame hmi-tone-${tone}">${framePath(p.shape, sym.w, sym.h)}${label}</g>`
}

export function linePoints (sym) {
    const pts = sym.props && Array.isArray(sym.props.points) ? sym.props.points : []
    return pts.filter(pt => Array.isArray(pt) && isFinite(pt[0]) && isFinite(pt[1])).map(pt => [Number(pt[0]), Number(pt[1])])
}

function renderLine (sym, value, opts) {
    const p = sym.props || {}
    const pts = linePoints(sym)
    if (pts.length < 2) return ''
    const d = 'M' + pts.map(pt => f(pt[0]) + ' ' + f(pt[1])).join('L')
    const on = isOn(value, p.onWhen, p.threshold)
    const style = ['pipe', 'conveyor', 'signal'].includes(p.style) ? p.style : 'strip'
    const flow = ['always', 'never'].includes(p.flow) ? p.flow : 'auto'
    return `<g class="hmi-line hmi-ls-${style} ${stateClass(on)} hmi-flow-${flow}">` +
        `<path class="hmi-hit" d="${d}"/><path class="hmi-path" d="${d}"/><path class="hmi-flowpath" d="${d}"/></g>`
}

function renderKpi (sym, value, opts) {
    const p = sym.props || {}
    const w = sym.w
    const h = sym.h
    const text = formatValue(value, p.decimals, opts.locale) + (p.unit ? ' ' + p.unit : '')
    const big = f(Math.max(12, Math.min(h * 0.3, (w - 30) / Math.max(4, text.length) * 1.7)))
    return `<g class="hmi-kpi ${value === undefined || value === null ? 'hmi-unknown' : 'hmi-normal'}">` +
        `<rect class="hmi-kpi-card" x="0.5" y="0.5" width="${f(w - 1)}" height="${f(h - 1)}" rx="8"/>` +
        `<text class="hmi-kpi-title" x="${f(w * 0.066)}" y="${f(h * 0.23)}" font-size="${f(Math.max(9, h * 0.1))}">${escapeXml(p.title || sym.key || '')}</text>` +
        `<text class="hmi-kpi-value" x="${f(w * 0.066)}" y="${f(h * 0.6)}" font-size="${big}">${escapeXml(text)}</text>` +
        (p.subtitle ? `<text class="hmi-kpi-sub" x="${f(w * 0.066)}" y="${f(h * 0.84)}" font-size="${f(Math.max(9, h * 0.1))}">${escapeXml(p.subtitle)}</text>` : '') +
        '</g>'
}

function renderText (sym, value, opts) {
    const p = sym.props || {}
    const align = ['start', 'end'].includes(p.align) ? p.align : 'middle'
    const x = align === 'start' ? 0 : (align === 'end' ? sym.w : sym.w / 2)
    let text = p.text || ''
    if (sym.key) text = (text ? text + ' ' : '') + formatValue(value, p.decimals, opts.locale) + (p.unit ? ' ' + p.unit : '')
    const size = Math.max(6, Number(p.size) || 16)
    const unknown = sym.key && (value === undefined || value === null) ? ' hmi-unknown' : ''
    return `<g class="hmi-text hmi-tone-${p.tone === 'dim' ? 'dim' : 'normal'}${unknown}"><rect class="hmi-hitbox" x="0" y="0" width="${f(sym.w)}" height="${f(sym.h)}"/>` +
        `<text x="${f(x)}" y="${f(sym.h / 2)}" font-size="${f(size)}" style="text-anchor:${align}" font-weight="${p.bold === 'yes' ? 700 : 400}">${escapeXml(text)}</text></g>`
}

function renderLed (sym, value) {
    const p = sym.props || {}
    const on = isOn(value, p.onWhen, p.threshold)
    const r = Math.max(3, Math.min(sym.w, sym.h) / 2 - 1.5)
    return `<g class="hmi-led ${stateClass(on)} ${colorClass(p)}${blinkClass(p, on)}">` +
        `<circle class="hmi-dot" cx="${f(sym.w / 2)}" cy="${f(sym.h / 2)}" r="${f(r)}"/>` + labelBelow(p, sym.w, sym.h) + '</g>'
}

function renderChip (sym, value, opts) {
    const p = sym.props || {}
    const w = sym.w
    const h = sym.h
    const on = isOn(value, p.onWhen, p.threshold)
    let text = on ? p.textOn : p.textOff
    if (on === null) text = '—'
    else if (!text) text = formatValue(value, '', opts.locale)
    return `<g class="hmi-chip ${stateClass(on)} ${colorClass(p)}${blinkClass(p, on)}">` +
        `<rect class="hmi-chip-box" x="0.5" y="0.5" width="${f(w - 1)}" height="${f(h - 1)}" rx="${f(h / 2)}"/>` +
        `<circle class="hmi-dot" cx="${f(h / 2)}" cy="${f(h / 2)}" r="${f(h * 0.19)}"/>` +
        `<text class="hmi-chip-text" x="${f(h * 0.95)}" y="${f(h / 2)}" font-size="${f(Math.max(9, h * 0.36))}">${escapeXml(text)}</text></g>`
}

function renderAlarm (sym, value, opts) {
    const p = sym.props || {}
    const w = sym.w
    const h = sym.h
    const on = isOn(value, p.onWhen, p.threshold)
    if (!on && !opts.editor) return ''
    const pr = ['1', '2', '3'].includes(String(p.priority)) ? String(p.priority) : '1'
    // text sits right of the priority indicator and shrinks to fit the box
    const ix = Math.min(h * 0.45, 40)
    const left = ix * 2
    const avail = Math.max(20, w - left - 12)
    const tx = left + avail / 2
    const size = Math.max(9, Math.min(h * 0.32, avail / (Math.max(4, (p.text || '').length) * 0.68)))
    const subSize = Math.max(8, Math.min(size * 0.5, avail / (Math.max(4, (p.sub || '').length) * 0.56)))
    return `<g class="hmi-alarm-banner hmi-p${pr} ${on ? 'hmi-on' : 'hmi-off hmi-ghost'}${blinkClass(p, on)}">` +
        `<rect class="hmi-alarm-box" x="1" y="1" width="${f(w - 2)}" height="${f(h - 2)}" rx="10"/>` +
        alarmIndicator(ix, h / 2, pr) +
        `<text class="hmi-alarm-text" x="${f(tx)}" y="${f(p.sub ? h * 0.44 : h / 2)}" font-size="${f(size)}">${escapeXml(p.text || '')}</text>` +
        (p.sub ? `<text class="hmi-alarm-sub" x="${f(tx)}" y="${f(h * 0.76)}" font-size="${f(subSize)}">${escapeXml(p.sub)}</text>` : '') + '</g>'
}

function renderTag (sym, value, opts) {
    const p = sym.props || {}
    const w = sym.w
    const h = sym.h
    const min = num(p.min)
    const max = num(p.max)
    const bar = min !== null && max !== null && max > min
    const state = rangeState(value, p.lo, p.hi)
    const cls = state === null ? 'hmi-unknown' : (state === 'alarm' ? 'hmi-alarm' : 'hmi-normal')
    const titleSize = f(Math.max(9, Math.min(14, h * 0.2)))
    const valueSize = f(Math.max(11, Math.min(32, h * (bar ? 0.3 : 0.36))))
    const text = formatValue(value, p.decimals, opts && opts.locale) + (p.unit ? ' ' + p.unit : '')
    let out = `<g class="hmi-tag ${cls}">` +
        `<rect class="hmi-tag-box" x="0.5" y="0.5" width="${f(w - 1)}" height="${f(h - 1)}" rx="3"/>` +
        `<text class="hmi-tag-title" x="${f(w / 2)}" y="${f(h * 0.3)}" font-size="${titleSize}">${escapeXml(p.title || sym.key || '')}</text>` +
        `<text class="hmi-tag-value" x="${f(w / 2)}" y="${f(h * (bar ? 0.66 : 0.76))}" font-size="${valueSize}">${escapeXml(text)}</text>`
    if (bar) {
        const x0 = 8
        const x1 = w - 8
        const y = h - 10
        const X = v => f(x0 + (Math.max(min, Math.min(max, v)) - min) / (max - min) * (x1 - x0))
        out += `<rect class="hmi-bar-track" x="${x0}" y="${f(y)}" width="${f(x1 - x0)}" height="4"/>`
        const lo = num(p.lo)
        const hi = num(p.hi)
        if (lo !== null || hi !== null) {
            const a = X(lo === null ? min : lo)
            const b = X(hi === null ? max : hi)
            out += `<rect class="hmi-bar-normal" x="${a}" y="${f(y)}" width="${f(Math.max(0, b - a))}" height="4"/>`
        }
        const v = num(value)
        if (v !== null) out += `<polygon class="hmi-bar-ptr" points="${X(v)},${f(y - 1)} ${f(X(v) - 4)},${f(y - 7)} ${f(Number(X(v)) + 4)},${f(y - 7)}"/>`
    }
    if (state === 'alarm') out += alarmIndicator(w - 2, 2, p.priority)
    return out + '</g>'
}

// Inner SVG markup of one symbol, already placed at its x/y with its rotation.
export function renderSymbol (sym, value, opts) {
    const def = SYMBOLS[sym.type]
    if (!def) return ''
    const rot = Number(sym.rot) || 0
    const tf = `translate(${f(sym.x)},${f(sym.y)})` + (rot ? ` rotate(${f(rot)},${f(sym.w / 2)},${f(sym.h / 2)})` : '')
    return `<g class="hmi-symbol" data-id="${escapeXml(sym.id)}" transform="${tf}">${def.render(sym, value, opts || {})}</g>`
}

export const STYLE_ID = 'hmi-symbols-style'

export const CSS = `
.hmi-canvas-wrapper { width: 100%; }
.hmi-canvas-wrapper > svg { display: block; width: 100%; height: auto; }
.hmi-root { font-family: "Segoe UI", Roboto, Arial, sans-serif; }
.hmi-root.hmi-theme-isa101 {
  --hmi-bg: #d9dadb; --hmi-equip: #c9cbcd; --hmi-equip-on: #808489; --hmi-stroke: #5f6368;
  --hmi-line: #8a8e93; --hmi-text: #1f2328; --hmi-text-dim: #55595e; --hmi-tag-bg: #e6e7e8;
  --hmi-alarm: #d71920; --hmi-warn: #f2b705; --hmi-low: #c46ad1; --hmi-ok: #4d5156; --hmi-info: #2f6fb3;
  --hmi-dark: #a9acaf; --hmi-pit: #b9bbbd; --hmi-material: #3d4146;
}
.hmi-root.hmi-theme-classic {
  --hmi-bg: #2a2f36; --hmi-equip: #59626c; --hmi-equip-on: #8794a0; --hmi-stroke: #aab6c1;
  --hmi-line: #7b8895; --hmi-text: #e8edf1; --hmi-text-dim: #9aa4ae; --hmi-tag-bg: #1c2025;
  --hmi-alarm: #ef4444; --hmi-warn: #f59e0b; --hmi-low: #c084fc; --hmi-ok: #22c55e; --hmi-info: #38bdf8;
  --hmi-dark: #3a4148; --hmi-pit: #1b1f23; --hmi-material: #c4d0db;
}
.hmi-root { background: var(--hmi-bg); }
.hmi-root .hmi-bg { fill: var(--hmi-bg); }
.hmi-root text { text-anchor: middle; }
.hmi-root .hmi-label { fill: var(--hmi-text); font-size: 14px; font-weight: 600; }
.hmi-root .hmi-reel .hmi-body { fill: var(--hmi-equip); stroke: var(--hmi-stroke); stroke-width: 2; }
.hmi-root .hmi-reel.hmi-on .hmi-body { fill: var(--hmi-equip-on); }
.hmi-root .hmi-reel.hmi-unknown .hmi-body { stroke-dasharray: 6 4; }
.hmi-root .hmi-reel .hmi-ring { fill: none; stroke: var(--hmi-line); stroke-width: 1; }
.hmi-root .hmi-reel .hmi-spokes line { stroke: var(--hmi-line); stroke-width: 1.5; }
.hmi-root .hmi-reel .hmi-hub { fill: var(--hmi-tag-bg); stroke: var(--hmi-stroke); stroke-width: 2; }
.hmi-root .hmi-reel .hmi-axle { fill: var(--hmi-stroke); }
.hmi-root .hmi-reel .hmi-spin, .hmi-root .hmi-roller .hmi-spin { transform-box: view-box; transform-origin: 0 0; }
.hmi-root.hmi-theme-classic .hmi-reel.hmi-on .hmi-spin { animation: hmi-spin 2.4s linear infinite; }
.hmi-root.hmi-theme-classic .hmi-reel.hmi-on .hmi-axle { fill: var(--hmi-ok); }
.hmi-root .hmi-tag-box { fill: var(--hmi-tag-bg); stroke: var(--hmi-line); stroke-width: 1; }
.hmi-root .hmi-tag-title { fill: var(--hmi-text-dim); font-weight: 600; letter-spacing: .5px; }
.hmi-root .hmi-tag-value { fill: var(--hmi-text); font-family: Consolas, "Roboto Mono", monospace; font-weight: 700; }
.hmi-root .hmi-tag.hmi-alarm .hmi-tag-box { stroke: var(--hmi-alarm); stroke-width: 2; }
.hmi-root .hmi-tag.hmi-alarm .hmi-tag-value { fill: var(--hmi-alarm); }
.hmi-root .hmi-bar-track { fill: var(--hmi-bg); stroke: var(--hmi-line); stroke-width: .5; }
.hmi-root .hmi-bar-normal { fill: var(--hmi-line); }
.hmi-root .hmi-bar-ptr { fill: var(--hmi-text); }
.hmi-root .hmi-alarm-ind text { fill: #000; font-size: 11px; font-weight: 800; dominant-baseline: middle; }
.hmi-root .hmi-alarm-ind.hmi-p1 > rect { fill: var(--hmi-alarm); stroke: #000; stroke-width: 1; }
.hmi-root .hmi-alarm-ind.hmi-p1 text { fill: #fff; }
.hmi-root .hmi-alarm-ind.hmi-p2 > polygon { fill: var(--hmi-warn); stroke: #000; stroke-width: 1; }
.hmi-root .hmi-alarm-ind.hmi-p3 > polygon { fill: var(--hmi-low); stroke: #000; stroke-width: 1; }
.hmi-root .hmi-offline-banner { display: none; }
.hmi-root.hmi-offline .hmi-symbol { opacity: .45; }
.hmi-root.hmi-offline .hmi-offline-banner { display: inline; }
.hmi-root .hmi-offline-banner rect { fill: var(--hmi-tag-bg); stroke: var(--hmi-alarm); stroke-width: 2; }
.hmi-root .hmi-offline-banner text { fill: var(--hmi-text); font-size: 16px; font-weight: 700; dominant-baseline: middle; }
.hmi-root.hmi-transparent, .hmi-root.hmi-transparent .hmi-bg { background: none; fill: none; }
.hmi-root .hmi-blink { animation: hmi-blink 1s steps(2) infinite; }
.hmi-root .hmi-roller .hmi-body { fill: var(--hmi-tag-bg); stroke: var(--hmi-stroke); stroke-width: 1.5; }
.hmi-root .hmi-roller .hmi-mark { stroke: var(--hmi-stroke); stroke-width: 1.5; }
.hmi-root .hmi-roller.hmi-on .hmi-body { fill: var(--hmi-equip-on); }
.hmi-root.hmi-theme-classic .hmi-roller.hmi-on.hmi-cw .hmi-spin { animation: hmi-spin .9s linear infinite; }
.hmi-root.hmi-theme-classic .hmi-roller.hmi-on.hmi-ccw .hmi-spin { animation: hmi-spin-ccw .9s linear infinite; }
.hmi-root .hmi-motor .hmi-body { fill: var(--hmi-equip); stroke: var(--hmi-stroke); stroke-width: 2; }
.hmi-root .hmi-motor .hmi-foot { fill: var(--hmi-dark); stroke: var(--hmi-stroke); stroke-width: 1; }
.hmi-root .hmi-motor.hmi-on .hmi-body { fill: var(--hmi-equip-on); }
.hmi-root .hmi-motor.hmi-unknown .hmi-body { stroke-dasharray: 5 3; }
.hmi-root .hmi-motor.hmi-fault .hmi-body { stroke: var(--hmi-alarm); stroke-width: 3; }
.hmi-root .hmi-motor-m { fill: var(--hmi-text); font-weight: 700; dominant-baseline: central; }
.hmi-root .hmi-motor.hmi-on .hmi-motor-m { fill: var(--hmi-tag-bg); }
.hmi-root.hmi-theme-classic .hmi-motor.hmi-on .hmi-motor-m { fill: var(--hmi-ok); }
.hmi-root .hmi-frame .hmi-body { fill: var(--hmi-equip); stroke: var(--hmi-stroke); stroke-width: 1.5; }
.hmi-root .hmi-frame.hmi-tone-dark .hmi-body { fill: var(--hmi-dark); }
.hmi-root .hmi-frame.hmi-tone-pit .hmi-body { fill: var(--hmi-pit); }
.hmi-root .hmi-line path { fill: none; stroke-linecap: round; stroke-linejoin: round; }
.hmi-root .hmi-line .hmi-hit { stroke: transparent; stroke-width: 16; }
.hmi-root .hmi-line .hmi-path { stroke: var(--hmi-material); stroke-width: 3.5; }
.hmi-root .hmi-line.hmi-ls-pipe .hmi-path { stroke: var(--hmi-line); stroke-width: 8; }
.hmi-root .hmi-line.hmi-ls-conveyor .hmi-path { stroke: var(--hmi-stroke); stroke-width: 6; stroke-dasharray: 2 6; stroke-linecap: butt; }
.hmi-root .hmi-line.hmi-ls-signal .hmi-path { stroke: var(--hmi-line); stroke-width: 1.5; stroke-dasharray: 6 4; }
.hmi-root .hmi-line.hmi-ls-pipe.hmi-on .hmi-path { stroke: var(--hmi-equip-on); }
.hmi-root .hmi-line .hmi-flowpath { stroke: var(--hmi-bg); stroke-width: 1.6; stroke-dasharray: 3 21; opacity: 0; }
.hmi-root.hmi-theme-classic .hmi-line.hmi-on.hmi-flow-auto .hmi-flowpath, .hmi-root .hmi-line.hmi-on.hmi-flow-always .hmi-flowpath { opacity: .85; animation: hmi-flow .8s linear infinite; }
.hmi-root .hmi-kpi-card { fill: var(--hmi-tag-bg); stroke: var(--hmi-line); stroke-width: 1; }
.hmi-root .hmi-kpi text { text-anchor: start; }
.hmi-root .hmi-kpi-title { fill: var(--hmi-text-dim); font-weight: 700; letter-spacing: .5px; }
.hmi-root .hmi-kpi-value { fill: var(--hmi-text); font-weight: 800; font-family: Consolas, "Roboto Mono", monospace; dominant-baseline: central; }
.hmi-root .hmi-kpi-sub { fill: var(--hmi-text-dim); }
.hmi-root .hmi-text text { fill: var(--hmi-text); dominant-baseline: central; }
.hmi-root .hmi-text.hmi-tone-dim text { fill: var(--hmi-text-dim); }
.hmi-root .hmi-hitbox { fill: transparent; }
.hmi-root .hmi-dot { fill: var(--hmi-tag-bg); stroke: var(--hmi-stroke); stroke-width: 1.5; }
.hmi-root .hmi-on.hmi-c-auto .hmi-dot { fill: var(--hmi-ok); }
.hmi-root .hmi-on.hmi-c-alarm .hmi-dot { fill: var(--hmi-alarm); }
.hmi-root .hmi-on.hmi-c-warn .hmi-dot { fill: var(--hmi-warn); }
.hmi-root .hmi-on.hmi-c-info .hmi-dot { fill: var(--hmi-info); }
.hmi-root .hmi-unknown .hmi-dot { stroke-dasharray: 3 2; }
.hmi-root .hmi-chip-box { fill: var(--hmi-tag-bg); stroke: var(--hmi-line); stroke-width: 1; }
.hmi-root .hmi-chip.hmi-on.hmi-c-alarm .hmi-chip-box { stroke: var(--hmi-alarm); stroke-width: 2; }
.hmi-root .hmi-chip-text { fill: var(--hmi-text); font-weight: 700; text-anchor: start; dominant-baseline: central; }
.hmi-root .hmi-alarm-box { stroke-width: 3; }
.hmi-root .hmi-alarm-banner.hmi-p1 .hmi-alarm-box { fill: var(--hmi-alarm); stroke: #000; }
.hmi-root .hmi-alarm-banner.hmi-p2 .hmi-alarm-box { fill: var(--hmi-warn); stroke: #000; }
.hmi-root .hmi-alarm-banner.hmi-p3 .hmi-alarm-box { fill: var(--hmi-low); stroke: #000; }
.hmi-root .hmi-alarm-banner .hmi-alarm-ind > rect, .hmi-root .hmi-alarm-banner .hmi-alarm-ind > polygon { stroke: #fff; stroke-width: 2; }
.hmi-root .hmi-alarm-text { fill: #fff; font-weight: 800; dominant-baseline: central; }
.hmi-root .hmi-alarm-banner.hmi-p2 .hmi-alarm-text, .hmi-root .hmi-alarm-banner.hmi-p2 .hmi-alarm-sub { fill: #000; }
.hmi-root .hmi-alarm-sub { fill: #fff; font-weight: 600; dominant-baseline: central; }
.hmi-root .hmi-ghost { opacity: .25; }
.hmi-root .hmi-ghost .hmi-alarm-box { stroke-dasharray: 8 6; }
@keyframes hmi-spin { to { transform: rotate(360deg); } }
@keyframes hmi-spin-ccw { to { transform: rotate(-360deg); } }
@keyframes hmi-flow { to { stroke-dashoffset: -24; } }
@keyframes hmi-blink { 50% { opacity: .35; } }
`

export function injectStyles (doc) {
    const d = doc || (typeof document !== 'undefined' ? document : null)
    if (!d || d.getElementById(STYLE_ID)) return
    const el = d.createElement('style')
    el.id = STYLE_ID
    el.textContent = CSS
    d.head.appendChild(el)
}
