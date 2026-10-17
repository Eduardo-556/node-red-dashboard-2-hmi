// "SVG com partes ligadas": a drawing made elsewhere (Inkscape, a P&ID, a machine
// outline) whose elements, picked by their id, follow payload keys:
//   motor1 = M1.run            the element turns "on" (darker / theme colour)
//   falha1 = M1.falha : alarme the element turns red while the key is on
//   tempTxt = # temperatura    a <text> shows the value
// The markup is cleaned in the browser (no scripts, no event handlers, no links
// out of the drawing) when the file is chosen and again every time it is drawn.

const ALLOWED = new Set(['svg', 'g', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'text', 'tspan', 'defs',
    'lineargradient', 'radialgradient', 'stop', 'clippath', 'mask', 'pattern', 'use', 'symbol', 'title', 'desc', 'marker'])
const ATTRS = new Set(['id', 'class', 'transform', 'd', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'rx', 'ry', 'width', 'height',
    'points', 'viewbox', 'fill', 'fill-opacity', 'fill-rule', 'stroke', 'stroke-width', 'stroke-opacity', 'stroke-linecap', 'stroke-linejoin',
    'stroke-dasharray', 'stroke-dashoffset', 'stroke-miterlimit', 'opacity', 'font-size', 'font-family', 'font-weight', 'text-anchor',
    'dominant-baseline', 'offset', 'stop-color', 'stop-opacity', 'gradientunits', 'gradienttransform', 'fx', 'fy', 'clip-path',
    'clip-rule', 'mask', 'patternunits', 'preserveaspectratio', 'style', 'href', 'xlink:href', 'marker-start', 'marker-mid', 'marker-end',
    'markerwidth', 'markerheight', 'refx', 'refy', 'orient', 'visibility', 'display', 'dx', 'dy', 'letter-spacing', 'vector-effect'])

const cache = new Map()

// only references inside the drawing: url(#id), href="#id"
const safeRef = v => !/url\(\s*['"]?\s*(?!#)/i.test(v) && !/(javascript|expression|@import|behavior)/i.test(v)

// returns { viewBox, root (a clean <svg> element), ids } or null
export function parseSvg (text) {
    const src = String(text || '')
    if (!src || typeof DOMParser === 'undefined') return null
    if (cache.has(src)) return cache.get(src)
    let out = null
    try {
        const doc = new DOMParser().parseFromString(src, 'image/svg+xml')
        const root = doc.documentElement
        if (root && root.nodeName.toLowerCase() === 'svg' && !doc.getElementsByTagName('parsererror').length) {
            const ids = []
            const walk = el => {
                for (const child of [...el.children]) {
                    if (!ALLOWED.has(child.nodeName.toLowerCase())) { child.remove(); continue }
                    walk(child)
                }
                for (const a of [...el.attributes]) {
                    const n = a.name.toLowerCase()
                    const v = a.value
                    if (!ATTRS.has(n) || n.startsWith('on')) el.removeAttribute(a.name)
                    else if ((n === 'href' || n === 'xlink:href') && !v.trim().startsWith('#')) el.removeAttribute(a.name)
                    else if (!safeRef(v)) el.removeAttribute(a.name)
                }
                if (el.id && el !== root) ids.push(el.id)
            }
            walk(root)
            let vb = root.getAttribute('viewBox')
            if (!vb) {
                const w = parseFloat(root.getAttribute('width')) || 100
                const h = parseFloat(root.getAttribute('height')) || 100
                vb = '0 0 ' + w + ' ' + h
            }
            out = { viewBox: vb, root, ids }
        }
    } catch (e) { out = null }
    if (cache.size > 50) cache.clear()
    cache.set(src, out)
    return out
}

// the cleaned markup, to store in the symbol
export function cleanSvg (text) {
    const p = parseSvg(text)
    return p ? new XMLSerializer().serializeToString(p.root) : ''
}

// "id = key", "id = key : alarme", "id = # key"
export function parseBinds (text) {
    const out = []
    for (const line of String(text || '').split('\n')) {
        const i = line.indexOf('=')
        if (i < 1) continue
        const id = line.slice(0, i).trim()
        let rest = line.slice(i + 1).trim()
        let mode = 'on'
        if (rest.startsWith('#')) { mode = 'text'; rest = rest.slice(1).trim() }
        const j = rest.indexOf(':')
        if (j >= 0) {
            const m = rest.slice(j + 1).trim().toLowerCase()
            if (['alarme', 'alarm'].includes(m)) mode = 'alarm'
            else if (['atencao', 'atenção', 'warn'].includes(m)) mode = 'warn'
            else if (['esconder', 'hide'].includes(m)) mode = 'hide'
            rest = rest.slice(0, j).trim()
        }
        if (id && rest) out.push({ id, key: rest, mode })
    }
    return out
}

export function svgImportSymbol (h) {
    const { f, isOn, formatValue, labelBelow } = h
    function render (sym, value, opts) {
        const p = sym.props || {}
        const w = sym.w
        const ht = sym.h
        const parsed = parseSvg(p.svg)
        if (!parsed) {
            return `<g class="hmi-svgimp hmi-img-empty"><rect class="hmi-img-box" x="1" y="1" width="${f(w - 2)}" height="${f(ht - 2)}" rx="4"/>` +
                `<text class="hmi-svgimp-hint" x="${f(w / 2)}" y="${f(ht / 2)}" font-size="13">SVG</text>${labelBelow(p, w, ht)}</g>`
        }
        const root = parsed.root.cloneNode(true)
        const values = (opts && opts.values) || {}
        for (const b of parseBinds(p.binds)) {
            const el = root.querySelector('[id="' + b.id.replace(/["\\]/g, '') + '"]')
            if (!el) continue
            const v = values[b.key]
            if (b.mode === 'text') {
                el.textContent = v === undefined ? '—' : formatValue(v, p.decimals === '' || p.decimals === undefined ? undefined : Number(p.decimals), opts && opts.locale)
                continue
            }
            const on = isOn(v, 'nonzero') === true
            const cls = (el.getAttribute('class') || '') + ' hmi-svgb' + (b.mode === 'hide' ? (on ? ' hmi-svgb-hide' : '') : (on ? ' hmi-svgb-' + b.mode : ' hmi-svgb-off'))
            el.setAttribute('class', cls.trim())
        }
        root.setAttribute('x', '0')
        root.setAttribute('y', '0')
        root.setAttribute('width', f(w))
        root.setAttribute('height', f(ht))
        root.setAttribute('viewBox', parsed.viewBox)
        root.setAttribute('preserveAspectRatio', p.fit === 'stretch' ? 'none' : 'xMidYMid meet')
        root.removeAttribute('id')
        const markup = new XMLSerializer().serializeToString(root)
        return `<g class="hmi-svgimp"><rect class="hmi-hitbox" x="0" y="0" width="${f(w)}" height="${f(ht)}"/>${markup}${labelBelow(p, w, ht)}</g>`
    }
    return {
        svgImport: {
            label: 'SVG com partes ligadas',
            group: 'Formas',
            w: 240,
            h: 160,
            preview: undefined,
            svgImport: true,
            defaults: { svg: '', binds: '', fit: 'meet', decimals: '', label: '' },
            fields: [
                { key: 'fit', label: 'Ajuste', type: 'select', options: [['meet', 'Caber inteiro'], ['stretch', 'Esticar']] },
                { key: 'decimals', label: 'Casas decimais dos textos', type: 'number' },
                { key: 'label', label: 'Legenda', type: 'text' }
            ],
            render
        }
    }
}

export const SVGIMPORT_CSS = `
.hmi-root .hmi-svgimp-hint { fill: var(--hmi-line); font-weight: 700; dominant-baseline: central; }
.hmi-root .hmi-svgimp .hmi-svgb-on { fill: var(--hmi-equip-on) !important; }
.hmi-root .hmi-svgimp .hmi-svgb-alarm { fill: var(--hmi-alarm) !important; }
.hmi-root .hmi-svgimp .hmi-svgb-warn { fill: var(--hmi-warn) !important; }
.hmi-root .hmi-svgimp .hmi-svgb-hide { display: none; }
`
