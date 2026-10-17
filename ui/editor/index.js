// Drag-and-drop screen editor. Plain DOM, no framework, so the same editor
// runs inside the Node-RED edit dialog and inside the dashboard page.
import { SYMBOLS, CATEGORIES, paletteItems, createSymbol, renderSymbol, injectStyles, linePoints, scaleValue, RULE_OPS, RULE_EFFECTS } from '../symbols/index.js'

const GRID = 10
// resize handles: direction and position as a fraction of the box
const HANDLES = [['nw', 0, 0], ['n', 0.5, 0], ['ne', 1, 0], ['e', 1, 0.5], ['se', 1, 1], ['s', 0.5, 1], ['sw', 0, 1], ['w', 0, 0.5]]
const CURSORS = ['ns-resize', 'nesw-resize', 'ew-resize', 'nwse-resize']
function handleCursor (dir, rot) {
    const base = { n: 0, ne: 1, e: 2, se: 3, s: 0, sw: 1, w: 2, nw: 3 }[dir]
    return CURSORS[(base + Math.round((((Number(rot) || 0) % 180) + 180) % 180 / 45)) % 4]
}
const CSS_ID = 'hmi-editor-style'
const ICONS = {
    left: '<path d="M2 1v14"/><rect x="4" y="3" width="10" height="3"/><rect x="4" y="10" width="6" height="3"/>',
    hcenter: '<path d="M8 1v14"/><rect x="2" y="3" width="12" height="3"/><rect x="4.5" y="10" width="7" height="3"/>',
    right: '<path d="M14 1v14"/><rect x="2" y="3" width="10" height="3"/><rect x="6" y="10" width="6" height="3"/>',
    top: '<path d="M1 2h14"/><rect x="3" y="4" width="3" height="10"/><rect x="10" y="4" width="3" height="6"/>',
    vcenter: '<path d="M1 8h14"/><rect x="3" y="2" width="3" height="12"/><rect x="10" y="4.5" width="3" height="7"/>',
    bottom: '<path d="M1 14h14"/><rect x="3" y="2" width="3" height="10"/><rect x="10" y="6" width="3" height="6"/>',
    hdist: '<path d="M1 1v14M15 1v14"/><rect x="3" y="4" width="3" height="8"/><rect x="10" y="4" width="3" height="8"/>',
    vdist: '<path d="M1 1h14M1 15h14"/><rect x="4" y="3" width="8" height="3"/><rect x="4" y="10" width="8" height="3"/>',
    samew: '<rect x="2" y="2" width="12" height="4"/><rect x="2" y="10" width="12" height="4"/>',
    sameh: '<rect x="2" y="2" width="4" height="12"/><rect x="10" y="2" width="4" height="12"/>',
    same: '<rect x="1.5" y="4" width="6" height="8"/><rect x="8.5" y="4" width="6" height="8"/>',
    group: '<rect x="1" y="1" width="14" height="14" stroke-dasharray="2 2"/><rect x="3.5" y="3.5" width="5" height="5"/><rect x="7.5" y="7.5" width="5" height="5"/>',
    ungroup: '<rect x="1" y="1" width="6" height="6"/><rect x="9" y="9" width="6" height="6"/>'
}
const ACTIONS = [['none', 'Nada'], ['value', 'Enviar um valor'], ['toggle', 'Inverter (liga / desliga)'], ['pulse', 'Pulso (1 ao apertar, 0 ao soltar)'], ['input', 'Digitar um valor (ajuste)'], ['page', 'Ir para outra página']]
const clone = o => JSON.parse(JSON.stringify(o || []))
let clipboard = null // shared by every editor on the page
// copied rules; kept in localStorage too, so they reach the dashboard tab from the Node-RED editor
const RULES_STORE = 'hmi-editor-rules'
let ruleClipboard = null
function copyRules (rules) {
    ruleClipboard = clone(rules)
    try { localStorage.setItem(RULES_STORE, JSON.stringify(ruleClipboard)) } catch (e) {}
}
function copiedRules () {
    try {
        const saved = JSON.parse(localStorage.getItem(RULES_STORE) || 'null')
        if (Array.isArray(saved)) ruleClipboard = saved
    } catch (e) {}
    return Array.isArray(ruleClipboard) ? ruleClipboard.filter(r => r && typeof r === 'object') : []
}

const CSS = `
.hmi-ed { --hmi-ed-border: var(--red-ui-form-input-border-color, #c8ccd0); --hmi-ed-panel: var(--red-ui-secondary-background, #f3f4f5); --hmi-ed-bg: var(--red-ui-primary-background, #ffffff); --hmi-ed-text: var(--red-ui-primary-text-color, #222);
  border: 1px solid var(--hmi-ed-border); border-radius: 4px; background: var(--hmi-ed-panel); color: var(--hmi-ed-text); display: flex; flex-direction: column; font-family: "Helvetica Neue", Arial, Helvetica, sans-serif; font-size: 14px; box-sizing: border-box; }
.hmi-ed *, .hmi-ed *::before, .hmi-ed *::after { box-sizing: border-box; }
.hmi-ed.hmi-ed-full { position: fixed; inset: 0; z-index: 2000; border-radius: 0; border: 0; }
.hmi-ed-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; padding: 6px 8px; border-bottom: 1px solid var(--hmi-ed-border); background: var(--hmi-ed-bg); }
.hmi-ed-spacer { flex: 1; }
.hmi-ed-title { font-weight: 600; margin-right: 8px; }
.hmi-ed label.hmi-ed-check { display: inline-flex; align-items: center; gap: 4px; width: auto; margin: 0 6px 0 0; cursor: pointer; }
.hmi-ed label.hmi-ed-check input { width: auto; margin: 0; }
.hmi-ed-btn { font: inherit; padding: 4px 12px; min-height: 30px; border: 1px solid var(--hmi-ed-border); border-radius: 4px; background: var(--hmi-ed-bg); color: var(--hmi-ed-text); cursor: pointer; }
.hmi-ed-btn:hover { filter: brightness(.96); }
.hmi-ed-btn:disabled { opacity: .5; cursor: default; }
.hmi-ed-btn.hmi-ed-primary { background: #ad1625; border-color: #ad1625; color: #fff; }
.hmi-ed { position: relative; }
.hmi-ed-btn.hmi-ed-cat.hmi-ed-open { box-shadow: inset 0 -2px 0 #1e88e5; }
.hmi-ed-menu { position: absolute; z-index: 30; display: grid; grid-template-columns: repeat(auto-fill, 100px); gap: 4px; width: min(560px, calc(100% - 8px)); max-height: 60vh; overflow: auto; padding: 6px; background: var(--hmi-ed-bg); border: 1px solid var(--hmi-ed-border); border-radius: 6px; box-shadow: 0 6px 20px rgba(0, 0, 0, .2); }
.hmi-ed-item { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 6px 4px; border-radius: 4px; cursor: grab; font-size: 11px; line-height: 1.2; text-align: center; user-select: none; }
.hmi-ed-rule { border: 1px solid var(--hmi-ed-border); border-radius: 4px; padding: 6px 6px 0 6px; margin-bottom: 6px; background: var(--hmi-ed-bg); }
.hmi-ed-item:hover { background: var(--hmi-ed-panel); }
.hmi-ed-item svg { width: 72px; height: 44px; display: block; }
.hmi-ed-body { display: flex; min-height: 260px; flex: 1; overflow: hidden; }
.hmi-ed-stage { flex: 1; min-width: 0; padding: 8px; overflow: auto; outline: none; display: flex; align-items: flex-start; justify-content: center; }
.hmi-ed-stage svg { display: block; width: 100%; height: auto; box-shadow: 0 0 0 1px var(--hmi-ed-border); user-select: none; touch-action: none; }
.hmi-ed-full .hmi-ed-stage, .hmi-ed-fill .hmi-ed-stage { align-items: center; }
.hmi-ed-full .hmi-ed-stage svg, .hmi-ed-fill .hmi-ed-stage svg { width: 100%; height: 100%; box-shadow: none; }
.hmi-ed-stage .hmi-symbol { cursor: move; }
.hmi-ed-sel { fill: none; stroke: #1e88e5; stroke-width: 1.5; stroke-dasharray: 5 3; pointer-events: none; }
.hmi-ed-handle { fill: #fff; stroke: #1e88e5; stroke-width: 1.5; }
.hmi-ed-group { fill: none; stroke: #8e44ad; stroke-width: 1.5; stroke-dasharray: 8 3 2 3; pointer-events: none; }
.hmi-ed-tools { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 2px; margin-left: 6px; padding-left: 8px; border-left: 1px solid var(--hmi-ed-border); }
.hmi-ed-btn.hmi-ed-icon { padding: 3px 6px; min-height: 30px; line-height: 0; }
.hmi-ed-icon svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.3; }
.hmi-ed-sep { width: 1px; height: 20px; background: var(--hmi-ed-border); margin: 0 4px; }
.hmi-ed-f input[type=color] { padding: 1px 2px; height: 30px; }
.hmi-ed-grid { stroke: rgba(0, 0, 0, .08); stroke-width: 1; pointer-events: none; }
.hmi-theme-classic .hmi-ed-grid { stroke: rgba(255, 255, 255, .07); }
.hmi-ed-props { width: 230px; flex: none; padding: 8px 10px; border-left: 1px solid var(--hmi-ed-border); overflow: auto; background: var(--hmi-ed-panel); }
.hmi-ed-f { margin-bottom: 6px; }
.hmi-ed-f label { display: block; width: auto; margin: 0 0 2px 0; font-size: 12px; }
.hmi-ed .hmi-ed-f input, .hmi-ed .hmi-ed-f select { width: 100% !important; max-width: none; height: 30px; padding: 2px 6px; font: inherit; border: 1px solid var(--hmi-ed-border); border-radius: 4px; background: var(--hmi-ed-bg); color: var(--hmi-ed-text); margin: 0; }
.hmi-ed-pair { display: flex; gap: 6px; }
.hmi-ed-pair > div { flex: 1; min-width: 0; }
.hmi-ed-props h4 { margin: 4px 0 8px 0; font-size: 14px; }
.hmi-ed-hint { font-size: 12px; opacity: .75; line-height: 1.5; }
.hmi-ed-msg { font-size: 12px; }
.hmi-ed-palette { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; }
.hmi-ed-palgroup { font-size: 11px; opacity: .65; margin: 0 2px 0 6px; text-transform: uppercase; letter-spacing: .5px; }
.hmi-ed-palgroup:first-child { margin-left: 0; }
.hmi-ed-btn.hmi-ed-small { padding: 2px 8px; min-height: 26px; font-size: 12px; }
.hmi-ed-btnrow { display: flex; flex-wrap: wrap; gap: 4px; margin: 0 0 10px 0; }
.hmi-ed-point { fill: #fff; stroke: #1e88e5; stroke-width: 2; cursor: move; }
.hmi-ed-marquee { fill: rgba(30, 136, 229, .08); stroke: #1e88e5; stroke-width: 1; stroke-dasharray: 4 3; pointer-events: none; }
.hmi-ed-props h5 { margin: 14px 0 6px 0; font-size: 12px; text-transform: uppercase; letter-spacing: .5px; opacity: .7; }
.hmi-ed-align { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; margin-bottom: 10px; }
.hmi-ed-mid { fill: #1e88e5; fill-opacity: .25; stroke: #1e88e5; stroke-width: 1; cursor: copy; }
`

function el (tag, attrs, text) {
    const e = document.createElement(tag)
    for (const [k, v] of Object.entries(attrs || {})) {
        if (k === 'class') e.className = v
        else e.setAttribute(k, v)
    }
    if (text !== undefined) e.textContent = text
    return e
}

export function parsePreview (text) {
    if (text === undefined || text === null || text === '') return undefined
    if (text === 'true') return true
    if (text === 'false') return false
    const n = Number(String(text).replace(',', '.'))
    return isFinite(n) ? n : text
}

/**
 * opts: symbols, getView() -> {w,h}, getTheme(), getBackground(), getLocale(), buttonClass,
 *       getValues() -> live values shown instead of test values,
 *       actions: [{ label, title, primary, onClick(editor) }], title, fill, onChange()
 */
export function createEditor (root, opts) {
    injectStyles(document)
    if (!document.getElementById(CSS_ID)) {
        const st = el('style', { id: CSS_ID })
        st.textContent = CSS
        document.head.appendChild(st)
    }
    const o = opts || {}
    const btnClass = 'hmi-ed-btn ' + (o.buttonClass || '')
    const ed = { symbols: clone(o.symbols), sel: null, multi: [], drag: null, history: [], future: [] }
    ed.history.push(clone(ed.symbols))

    root.classList.add('hmi-ed')
    if (o.fill) root.classList.add('hmi-ed-fill')
    root.innerHTML = ''
    const toolbar = el('div', { class: 'hmi-ed-toolbar' })
    if (o.title) toolbar.appendChild(el('span', { class: 'hmi-ed-title' }, o.title))
    const palette = el('span', { class: 'hmi-ed-palette' })
    toolbar.appendChild(palette)
    // arrange tools: align, distribute, same size, group
    const tools = el('span', { class: 'hmi-ed-tools' })
    const toolBtns = []
    const tool = (icon, title, fn, enabled) => {
        const b = el('button', { type: 'button', class: btnClass + ' hmi-ed-icon', title })
        b.innerHTML = '<svg viewBox="0 0 16 16">' + ICONS[icon] + '</svg>'
        b.addEventListener('click', () => { fn(); stage.focus() })
        tools.appendChild(b)
        toolBtns.push([b, enabled])
    }
    const sep = () => tools.appendChild(el('span', { class: 'hmi-ed-sep' }))
    const anySel = () => ed.multi.length > 0
    tool('left', 'Alinhar à esquerda (um só: na tela)', () => align('left'), anySel)
    tool('hcenter', 'Centralizar na horizontal (um só: na tela)', () => align('hcenter'), anySel)
    tool('right', 'Alinhar à direita (um só: na tela)', () => align('right'), anySel)
    tool('top', 'Alinhar no topo (um só: na tela)', () => align('top'), anySel)
    tool('vcenter', 'Centralizar na vertical (um só: na tela)', () => align('vcenter'), anySel)
    tool('bottom', 'Alinhar na base (um só: na tela)', () => align('bottom'), anySel)
    sep()
    tool('hdist', 'Distribuir na horizontal (3 ou mais)', () => align('hdist'), () => units(selection()).length >= 3)
    tool('vdist', 'Distribuir na vertical (3 ou mais)', () => align('vdist'), () => units(selection()).length >= 3)
    sep()
    tool('samew', 'Mesma largura do último clicado', () => sameSize(true, false), () => sizable().length >= 2)
    tool('sameh', 'Mesma altura do último clicado', () => sameSize(false, true), () => sizable().length >= 2)
    tool('same', 'Mesmo tamanho do último clicado', () => sameSize(true, true), () => sizable().length >= 2)
    sep()
    tool('group', 'Agrupar (Ctrl+G)', () => group(), () => units(selection()).length >= 2)
    tool('ungroup', 'Desagrupar (Ctrl+Shift+G)', () => ungroup(), () => selection().some(m => m.group))
    toolbar.appendChild(tools)
    toolbar.appendChild(el('span', { class: 'hmi-ed-spacer' }))
    const msg = el('span', { class: 'hmi-ed-msg' })
    toolbar.appendChild(msg)
    const gridLabel = el('label', { class: 'hmi-ed-check' })
    const gridBox = el('input', { type: 'checkbox' })
    gridBox.checked = true
    gridLabel.appendChild(gridBox)
    gridLabel.appendChild(document.createTextNode('Grade'))
    toolbar.appendChild(gridLabel)
    const btn = (label, title, onClick, primary) => {
        const b = el('button', { type: 'button', class: btnClass + (primary ? ' hmi-ed-primary' : ''), title: title || label }, label)
        b.addEventListener('click', onClick)
        toolbar.appendChild(b)
        return b
    }
    btn('↶', 'Desfazer (Ctrl+Z)', () => undo())
    btn('↷', 'Refazer (Ctrl+Y)', () => redo())
    const api = {}
    for (const a of (o.actions || [])) a.button = btn(a.label, a.title, () => a.onClick(api), a.primary)

    const body = el('div', { class: 'hmi-ed-body' })
    const stage = el('div', { class: 'hmi-ed-stage', tabindex: '0' })
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
    stage.appendChild(svg)
    const props = el('div', { class: 'hmi-ed-props' })
    body.appendChild(stage)
    body.appendChild(props)
    root.appendChild(toolbar)
    root.appendChild(body)

    const view = () => {
        const v = (o.getView && o.getView()) || {}
        return { w: Math.max(100, Number(v.w) || 1280), h: Math.max(100, Number(v.h) || 720) }
    }
    const snap = v => gridBox.checked ? Math.round(v / GRID) * GRID : Math.round(v)
    const selected = () => ed.multi.length === 1 ? ed.symbols.find(s => s.id === ed.sel) : undefined
    const selection = () => ed.symbols.filter(s => ed.multi.includes(s.id))
    function select (ids, primary) {
        ed.multi = ids.filter((id, i) => ids.indexOf(id) === i)
        ed.sel = primary !== undefined && ed.multi.includes(primary) ? primary : (ed.multi[ed.multi.length - 1] || null)
    }
    // box as drawn, so a symbol turned 90° aligns by what you see
    // a symbol's group mates (itself when not grouped)
    const groupOf = id => {
        const s = ed.symbols.find(m => m.id === id)
        return s && s.group ? ed.symbols.filter(m => m.group === s.group).map(m => m.id) : [id]
    }
    // what align/distribute move as one piece: whole groups, or single symbols
    function units (list) {
        const out = []
        const seen = {}
        for (const m of list) {
            if (m.group) {
                if (seen[m.group]) { seen[m.group].members.push(m); continue }
                seen[m.group] = { members: [m] }
                out.push(seen[m.group])
            } else out.push({ members: [m] })
        }
        for (const u of out) {
            const bs = u.members.map(box)
            const x = Math.min(...bs.map(b => b.x))
            const y = Math.min(...bs.map(b => b.y))
            u.box = { x, y, w: Math.max(...bs.map(b => b.x + b.w)) - x, h: Math.max(...bs.map(b => b.y + b.h)) - y }
        }
        return out
    }
    const sizable = () => selection().filter(m => !(SYMBOLS[m.type] && SYMBOLS[m.type].line))
    function box (s) {
        const r = (((Number(s.rot) || 0) % 180) + 180) % 180
        if (r === 90) return { x: s.x + s.w / 2 - s.h / 2, y: s.y + s.h / 2 - s.w / 2, w: s.h, h: s.w }
        return { x: s.x, y: s.y, w: s.w, h: s.h }
    }
    const changed = () => {
        const cur = JSON.stringify(ed.symbols)
        if (cur === JSON.stringify(ed.history[ed.history.length - 1])) { if (o.onChange) o.onChange(api); return }
        ed.history.push(JSON.parse(cur))
        if (ed.history.length > 100) ed.history.shift()
        ed.future = []
        if (o.onChange) o.onChange(api)
    }
    function restore (list) {
        ed.symbols = clone(list)
        select(ed.multi.filter(id => ed.symbols.some(s => s.id === id)), ed.sel)
        refresh()
        if (o.onChange) o.onChange(api)
    }
    function undo () {
        if (ed.history.length < 2) return
        ed.future.push(ed.history.pop())
        restore(ed.history[ed.history.length - 1])
    }
    function redo () {
        if (!ed.future.length) return
        const next = ed.future.pop()
        ed.history.push(next)
        restore(next)
    }

    function toSvg (e) {
        const pt = svg.createSVGPoint()
        pt.x = e.clientX
        pt.y = e.clientY
        return pt.matrixTransform(svg.getScreenCTM().inverse())
    }

    function draw () {
        const v = view()
        const theme = (o.getTheme && o.getTheme()) === 'classic' ? 'classic' : 'isa101'
        svg.setAttribute('viewBox', '0 0 ' + v.w + ' ' + v.h)
        svg.setAttribute('class', 'hmi-root hmi-theme-' + theme + ((o.getBackground && o.getBackground()) === 'transparent' ? ' hmi-transparent' : ''))
        let out = '<rect class="hmi-bg" x="0" y="0" width="' + v.w + '" height="' + v.h + '"/>'
        if (gridBox.checked) {
            let g = ''
            for (let x = 50; x < v.w; x += 50) g += 'M' + x + ' 0V' + v.h
            for (let y = 50; y < v.h; y += 50) g += 'M0 ' + y + 'H' + v.w
            out += '<path class="hmi-ed-grid" d="' + g + '"/>'
        }
        // symbols that share a key show the same test value
        const live = (o.getValues && o.getValues()) || {}
        const previews = {}
        for (const s of ed.symbols) if (s.key && s.preview !== undefined && !(s.key in previews)) previews[s.key] = s.preview
        const typed = new Set(Object.keys(previews))
        for (const s of ed.symbols) if (s.key && SYMBOLS[s.type] && !(s.key in previews)) previews[s.key] = s.key in live ? live[s.key] : SYMBOLS[s.type].preview
        const locale = o.getLocale && o.getLocale()
        const values = { ...live, ...previews }
        for (const s of ed.symbols) {
            const def = SYMBOLS[s.type]
            if (!def) continue
            // live values go through the symbol's scale; typed test values are already in screen units
            let value = s.preview !== undefined ? s.preview : (s.key ? previews[s.key] : def.preview)
            if (s.preview === undefined && s.key && !typed.has(s.key) && s.key in live) value = scaleValue(s, value)
            out += renderSymbol(s, value, { locale, values, editor: true })
        }
        const s = selected()
        if (s && SYMBOLS[s.type] && SYMBOLS[s.type].line) {
            const pts = linePoints(s)
            out += '<g transform="translate(' + s.x + ',' + s.y + ')">'
            for (let i = 0; i < pts.length - 1; i++) {
                out += '<circle class="hmi-ed-mid" data-mid="' + i + '" cx="' + (pts[i][0] + pts[i + 1][0]) / 2 + '" cy="' + (pts[i][1] + pts[i + 1][1]) / 2 + '" r="5"/>'
            }
            pts.forEach((pt, i) => { out += '<circle class="hmi-ed-point" data-point="' + i + '" cx="' + pt[0] + '" cy="' + pt[1] + '" r="6"/>' })
            out += '</g>'
        } else if (s) {
            const rot = Number(s.rot) || 0
            const hs = Math.max(8, Math.min(12, view().w / 120))
            out += '<g transform="translate(' + s.x + ',' + s.y + ')' + (rot ? ' rotate(' + rot + ',' + s.w / 2 + ',' + s.h / 2 + ')' : '') + '">' +
                '<rect class="hmi-ed-sel" x="-3" y="-3" width="' + (s.w + 6) + '" height="' + (s.h + 6) + '"/>'
            for (const [dir, hx, hy] of HANDLES) {
                out += '<rect class="hmi-ed-handle" data-handle="' + dir + '" style="cursor:' + handleCursor(dir, rot) + '" x="' + (hx * s.w - hs / 2) + '" y="' + (hy * s.h - hs / 2) + '" width="' + hs + '" height="' + hs + '"/>'
            }
            out += '</g>'
            if (s.group) {
                const u = units(ed.symbols.filter(m => m.group === s.group))[0]
                out += '<rect class="hmi-ed-group" x="' + (u.box.x - 6) + '" y="' + (u.box.y - 6) + '" width="' + (u.box.w + 12) + '" height="' + (u.box.h + 12) + '"/>'
            }
        } else {
            for (const u of units(selection())) {
                const b = u.box
                const g = u.members.length > 1 || u.members[0].group
                out += '<rect class="' + (g ? 'hmi-ed-group' : 'hmi-ed-sel') + '" x="' + (b.x - 3) + '" y="' + (b.y - 3) + '" width="' + (b.w + 6) + '" height="' + (b.h + 6) + '"/>'
            }
        }
        for (const [b, enabled] of toolBtns) b.disabled = !enabled()
        if (ed.drag && ed.drag.mode === 'box') {
            const r = marquee(ed.drag)
            out += '<rect class="hmi-ed-marquee" x="' + r.x + '" y="' + r.y + '" width="' + r.w + '" height="' + r.h + '"/>'
        }
        svg.innerHTML = out
    }

    function field (label, value, type, onChange, options) {
        const f = el('div', { class: 'hmi-ed-f' })
        f.appendChild(el('label', {}, label))
        let input
        if (type === 'select') {
            input = el('select')
            for (const [val, text] of options) input.appendChild(el('option', { value: val }, text))
            input.value = String(value === undefined ? '' : value)
            if (input.selectedIndex < 0 && options.length) input.value = options[0][0] // older symbols without this setting
        } else {
            input = el('input', { type: ['number', 'color'].includes(type) ? type : 'text' })
            input.value = value === undefined || value === null ? (type === 'color' ? '#000000' : '') : value
        }
        const handler = () => { onChange(input.value); draw(); changed() }
        input.addEventListener('input', handler)
        input.addEventListener('change', handler)
        input.addEventListener('keydown', e => e.stopPropagation())
        f.appendChild(input)
        return f
    }
    const pair = (a, b) => {
        const p = el('div', { class: 'hmi-ed-pair' })
        const d1 = el('div')
        const d2 = el('div')
        d1.appendChild(a)
        d2.appendChild(b)
        p.appendChild(d1)
        p.appendChild(d2)
        return p
    }

    function showProps () {
        props.innerHTML = ''
        const s = selected()
        const smallBtn = (parent, label, title, fn) => {
            const b = el('button', { type: 'button', class: btnClass + ' hmi-ed-small', title }, label)
            b.addEventListener('click', fn)
            parent.appendChild(b)
        }
        const editRow = () => {
            const row = el('div', { class: 'hmi-ed-btnrow' })
            for (const [label, title, fn] of [['Duplicar', 'Ctrl+D', duplicate], ['Frente', 'Trazer para a frente', () => order(1)], ['Trás', 'Mandar para trás', () => order(-1)], ['Excluir', 'Delete', remove]]) smallBtn(row, label, title, fn)
            props.appendChild(row)
        }
        if (ed.multi.length > 1) {
            const us = units(selection())
            props.appendChild(el('h4', {}, us.length === 1 ? 'Grupo (' + ed.multi.length + ' símbolos)' : ed.multi.length + ' símbolos'))
            editRow()
            const grow = el('div', { class: 'hmi-ed-btnrow' })
            if (us.length > 1) smallBtn(grow, 'Agrupar', 'Ctrl+G', group)
            if (selection().some(m => m.group)) smallBtn(grow, 'Desagrupar', 'Ctrl+Shift+G', ungroup)
            props.appendChild(grow)
            if (us.length === 1) props.appendChild(el('div', { class: 'hmi-ed-hint' }, 'Clique move o grupo inteiro. Duplo clique num símbolo edita só ele.'))
            const ss = el('div', { class: 'hmi-ed-btnrow' })
            if (sizable().length >= 2) {
                props.appendChild(el('h5', {}, 'Tamanho (igual ao último clicado)'))
                smallBtn(ss, 'Largura', 'Mesma largura', () => sameSize(true, false))
                smallBtn(ss, 'Altura', 'Mesma altura', () => sameSize(false, true))
                smallBtn(ss, 'Os dois', 'Mesmo tamanho', () => sameSize(true, true))
                props.appendChild(ss)
            }
            props.appendChild(el('h5', {}, 'Alinhar'))
            const grid = el('div', { class: 'hmi-ed-align' })
            for (const [label, title, kind] of [['Esquerda', 'Alinhar à esquerda', 'left'], ['Centro', 'Centralizar na horizontal', 'hcenter'], ['Direita', 'Alinhar à direita', 'right'], ['Topo', 'Alinhar no topo', 'top'], ['Meio', 'Centralizar na vertical', 'vcenter'], ['Base', 'Alinhar na base', 'bottom']]) smallBtn(grid, label, title, () => align(kind))
            props.appendChild(grid)
            if (copiedRules().length) {
                props.appendChild(el('h5', {}, 'Regras'))
                const rr = el('div', { class: 'hmi-ed-btnrow' })
                pasteRulesButton(rr, smallBtn, selection())
                props.appendChild(rr)
            }
            props.appendChild(el('h5', {}, 'Distribuir (3 ou mais)'))
            const dist = el('div', { class: 'hmi-ed-btnrow' })
            smallBtn(dist, 'Na horizontal', 'Mesmo espaço entre os símbolos, da esquerda para a direita', () => align('hdist'))
            smallBtn(dist, 'Na vertical', 'Mesmo espaço entre os símbolos, de cima para baixo', () => align('vdist'))
            props.appendChild(dist)
            props.appendChild(el('div', { class: 'hmi-ed-hint' }, 'Arraste qualquer um para mover todos. Shift+clique adiciona ou tira da seleção.'))
            return
        }
        if (!s) {
            const h = el('div', { class: 'hmi-ed-hint' })
            h.innerHTML = 'Arraste um símbolo da barra de cima para a tela.<br><br>Clique num símbolo para editar. Arraste para mover e use o quadrado azul para redimensionar.<br><br>Vários símbolos: Shift+clique, ou arraste numa área vazia para fazer um retângulo de seleção.<br><br>Teclas: Delete apaga, setas movem (Shift = 10), Ctrl+Z desfaz, Ctrl+C / Ctrl+V copiam, Ctrl+D duplica, Ctrl+A seleciona tudo, Ctrl+G agrupa.<br><br>Os quadrados brancos em volta do símbolo mudam o tamanho por qualquer lado (Shift nos cantos mantém a proporção).'
            props.appendChild(h)
            return
        }
        const def = SYMBOLS[s.type]
        props.appendChild(el('h4', {}, def.label))
        editRow()
        props.appendChild(field('Chave do payload', s.key, 'text', v => { s.key = v.trim() }))
        props.appendChild(pair(field('X', s.x, 'number', v => { s.x = Number(v) || 0 }), field('Y', s.y, 'number', v => { s.y = Number(v) || 0 })))
        if (def.line) {
            props.appendChild(el('div', { class: 'hmi-ed-hint' }, 'Arraste os pontos brancos. Puxe o ponto azul do meio para criar uma curva; duplo clique num ponto apaga.'))
        } else {
            props.appendChild(pair(field('Largura', s.w, 'number', v => { s.w = Math.max(10, Number(v) || 10) }), field('Altura', s.h, 'number', v => { s.h = Math.max(10, Number(v) || 10) })))
            props.appendChild(field('Rotação', s.rot || 0, 'select', v => { s.rot = Number(v) }, [['0', '0°'], ['90', '90°'], ['180', '180°'], ['270', '270°']]))
        }
        for (const fd of def.fields) {
            if (fd.when && !fd.when(s.props)) continue
            props.appendChild(field(fd.label, s.props[fd.key], fd.type, v => {
                s.props[fd.key] = fd.type === 'number' && v !== '' ? Number(v) : v
                if (fd.refresh) setTimeout(showProps)
            }, fd.options))
        }
        props.appendChild(field('Valor de teste (só no editor)', s.preview === undefined ? '' : String(s.preview), 'text', v => {
            const p = parsePreview(v)
            if (p === undefined) delete s.preview
            else s.preview = p
        }))
        if (def.image) imageFields(s, smallBtn)
        if (!def.line && !def.image && !['frame', 'stack'].includes(s.type)) {
            props.appendChild(el('h5', {}, 'Escala do valor'))
            const sc = s.scale || {}
            const setSc = (k, v) => {
                s.scale = { factor: '', divisor: '', offset: '', ...s.scale, [k]: v }
                if (s.scale.factor === '' && !s.scale.divisor && s.scale.offset === '') delete s.scale
            }
            const scField = (label, k) => field(label, sc[k] ?? '', 'text', v => setSc(k, v.replace(',', '.').trim()))
            props.appendChild(pair(scField('Multiplicar por', 'factor'), scField('Dividir por', 'divisor')))
            props.appendChild(scField('Somar', 'offset'))
            props.appendChild(el('div', { class: 'hmi-ed-hint' }, 'Mostra valor × multiplicar ÷ dividir + somar. Ex.: dividir por 10 para um CLP que manda 1450 e a tela mostra 145,0.'))
        }
        ruleFields(s, smallBtn)
        if (def.line || s.type === 'frame') return
        props.appendChild(el('h5', {}, 'Ao clicar no dashboard'))
        const act = s.action || { mode: 'none' }
        const setAct = (k, v) => {
            s.action = { mode: 'none', value: '', topic: '', confirm: 'no', min: '', max: '', ...s.action, [k]: v }
            if (s.action.mode === 'none') delete s.action
        }
        props.appendChild(field('Ação', act.mode || 'none', 'select', v => { setAct('mode', v); setTimeout(showProps) }, ACTIONS))
        if (act.mode && act.mode !== 'none') {
            if (act.mode === 'value') props.appendChild(field('Valor enviado', act.value, 'text', v => setAct('value', v)))
            if (act.mode === 'input') props.appendChild(pair(field('Mínimo', act.min, 'number', v => setAct('min', v)), field('Máximo', act.max, 'number', v => setAct('max', v))))
            if (act.mode === 'page') {
                const pages = (o.getPages && o.getPages()) || []
                const pf = pages.length
                    ? field('Página', act.value, 'select', v => setAct('value', v), [['', '(escolha)'], ...pages])
                    : field('Página (caminho, ex. /linha2)', act.value, 'text', v => setAct('value', v.trim()))
                props.appendChild(pf)
            } else {
                const t = field('Tópico (vazio = chave do payload)', act.topic, 'text', v => setAct('topic', v))
                t.querySelector('input').placeholder = s.key || ''
                props.appendChild(t)
            }
            if (['value', 'toggle', 'page'].includes(act.mode)) props.appendChild(field('Pedir confirmação', act.confirm || 'no', 'select', v => setAct('confirm', v), [['no', 'Não'], ['yes', 'Sim']]))
            if (act.mode !== 'page') props.appendChild(el('div', { class: 'hmi-ed-hint' }, 'A mensagem sai pela saída do nó: msg.topic e msg.payload.'))
        }
    }

    function ruleFields (s, smallBtn) {
        props.appendChild(el('h5', {}, 'Regras'))
        const rules = Array.isArray(s.rules) ? s.rules : []
        rules.forEach((r, i) => {
            const card = el('div', { class: 'hmi-ed-rule' })
            const kf = field('Chave (vazio = a do símbolo)', r.key, 'text', v => { r.key = v.trim() })
            kf.querySelector('input').placeholder = s.key || ''
            card.appendChild(kf)
            card.appendChild(pair(field('Quando', r.op || 'on', 'select', v => { r.op = v }, RULE_OPS), field('Valor', r.value ?? '', 'text', v => { r.value = v })))
            card.appendChild(field('Efeito', r.effect || 'alarm', 'select', v => { r.effect = v }, RULE_EFFECTS))
            const btns = el('div', { class: 'hmi-ed-btnrow' })
            smallBtn(btns, 'Copiar', 'Copiar esta regra para colar em outro símbolo', () => { copyRules([r]); refresh() })
            smallBtn(btns, 'Remover', 'Apagar esta regra', () => { s.rules = rules.filter((x, k) => k !== i); if (!s.rules.length) delete s.rules; refresh(); changed() })
            card.appendChild(btns)
            props.appendChild(card)
        })
        const row = el('div', { class: 'hmi-ed-btnrow' })
        smallBtn(row, '+ Regra', 'Mudar cor, piscar ou esconder conforme um valor', () => {
            s.rules = [...rules, { key: '', op: 'on', value: '', effect: 'alarm' }]
            refresh()
            changed()
        })
        if (rules.length > 1) smallBtn(row, 'Copiar todas', 'Copiar as ' + rules.length + ' regras', () => { copyRules(rules); refresh() })
        pasteRulesButton(row, smallBtn, [s])
        props.appendChild(row)
        if (!rules.length) props.appendChild(el('div', { class: 'hmi-ed-hint' }, 'Ex.: esconder a bobina quando "temBobina" estiver desligado, ou deixar o corpo vermelho quando "falha" ligar. Usa o valor do CLP, sem escala.'))
    }

    // "Colar regra(s)" appends the copied rules to every target symbol;
    // a rule with an empty key keeps following the key of the symbol it lands on
    function pasteRulesButton (row, smallBtn, targets) {
        const copied = copiedRules()
        if (!copied.length) return
        const n = copied.length
        smallBtn(row, n === 1 ? 'Colar regra' : 'Colar ' + n + ' regras', targets.length > 1 ? 'Colar nas ' + targets.length + ' seleções' : 'Adicionar as regras copiadas', () => {
            for (const t of targets) t.rules = [...(Array.isArray(t.rules) ? t.rules : []), ...clone(copied)]
            refresh()
            changed()
        })
    }

    function imageFields (s, smallBtn) {
        props.appendChild(el('h5', {}, 'Arquivo'))
        for (const [k, label] of [['src', 'Imagem'], ['srcOn', 'Imagem quando ligado (opcional)']]) {
            const row = el('div', { class: 'hmi-ed-f' })
            row.appendChild(el('label', {}, label))
            const input = el('input', { type: 'file', accept: 'image/png,image/jpeg,image/gif,image/webp,image/svg+xml' })
            input.style.display = 'none'
            const btns = el('div', { class: 'hmi-ed-btnrow' })
            smallBtn(btns, s.props[k] ? 'Trocar' : 'Escolher arquivo', 'SVG, PNG, JPG, GIF ou WEBP até 400 KB', () => input.click())
            if (s.props[k]) smallBtn(btns, 'Remover', '', () => { s.props[k] = ''; refresh(); changed() })
            input.addEventListener('change', () => {
                const file = input.files && input.files[0]
                if (!file) return
                if (file.size > 400 * 1024) return api.setMessage('Imagem grande demais (máx. 400 KB)')
                const reader = new FileReader()
                reader.onload = () => {
                    s.props[k] = String(reader.result)
                    // keep the picture's proportions on the first upload
                    const img = new Image()
                    img.onload = () => {
                        if (k === 'src' && img.naturalWidth > 0 && img.naturalHeight > 0) s.h = Math.max(10, Math.round(s.w * img.naturalHeight / img.naturalWidth))
                        refresh()
                        changed()
                    }
                    img.onerror = () => { refresh(); changed() }
                    img.src = s.props[k]
                }
                reader.readAsDataURL(file)
            })
            row.appendChild(btns)
            row.appendChild(input)
            props.appendChild(row)
        }
        const url = field('ou endereço da imagem (URL)', String(s.props.src || '').startsWith('data:') ? '' : s.props.src, 'text', v => { s.props.src = v.trim() })
        url.querySelector('input').placeholder = 'https://... ou /imagens/maquina.png'
        props.appendChild(url)
    }

    function refresh () { draw(); showProps() }

    function add (type, cx, cy, variant) {
        if (!SYMBOLS[type]) return
        const s = createSymbol(type, 0, 0, isFinite(variant) ? variant : -1)
        s.x = snap(cx - s.w / 2)
        s.y = snap(cy - s.h / 2)
        ed.symbols.push(s)
        select([s.id])
        refresh()
        changed()
    }

    function remove () {
        if (!ed.multi.length) return
        ed.symbols = ed.symbols.filter(s => !ed.multi.includes(s.id))
        select([])
        refresh()
        changed()
    }

    // pastes copies 20 px down-right and selects them; returns the copies
    function paste (src) {
        const list = (Array.isArray(src) ? src : [src]).filter(x => x && SYMBOLS[x.type])
        if (!list.length) return
        const groups = {}
        const out = list.map(x => {
            const c = createSymbol(x.type, x.x + 20, x.y + 20)
            Object.assign(c, clone(x), { id: c.id, x: x.x + 20, y: x.y + 20 })
            // copies form their own group, not join the original's
            if (x.group) c.group = groups[x.group] || (groups[x.group] = newGroupId())
            return c
        })
        ed.symbols.push(...out)
        select(out.map(c => c.id))
        refresh()
        changed()
        return clone(out)
    }
    function duplicate () { paste(selection()) }
    function order (dir) {
        const picked = selection()
        if (!picked.length) return
        const rest = ed.symbols.filter(s => !ed.multi.includes(s.id))
        ed.symbols = dir > 0 ? [...rest, ...picked] : [...picked, ...rest]
        draw()
        changed()
    }
    // Align or distribute the selection. Groups move as one piece; a single piece aligns to the screen.
    function align (kind) {
        const us = units(selection())
        if (!us.length) return
        const shift = (u, dx, dy) => { for (const m of u.members) { m.x = Math.round(m.x + dx); m.y = Math.round(m.y + dy) } }
        const bs = us.map(u => u.box)
        let L = Math.min(...bs.map(b => b.x))
        let R = Math.max(...bs.map(b => b.x + b.w))
        let T = Math.min(...bs.map(b => b.y))
        let B = Math.max(...bs.map(b => b.y + b.h))
        if (us.length === 1) {
            const v = view()
            L = 0
            T = 0
            R = v.w
            B = v.h
        }
        if (kind === 'hdist' || kind === 'vdist') {
            if (us.length < 3) return api.setMessage('Selecione 3 ou mais para distribuir')
            const hz = kind === 'hdist'
            const idx = us.map((u, i) => i).sort((a, b) => hz ? bs[a].x - bs[b].x : bs[a].y - bs[b].y)
            const total = idx.reduce((t, i) => t + (hz ? bs[i].w : bs[i].h), 0)
            const gap = ((hz ? R - L : B - T) - total) / (us.length - 1)
            let pos = hz ? L : T
            for (const i of idx) {
                if (hz) shift(us[i], pos - bs[i].x, 0)
                else shift(us[i], 0, pos - bs[i].y)
                pos += (hz ? bs[i].w : bs[i].h) + gap
            }
        } else {
            us.forEach((u, i) => {
                const b = bs[i]
                const dx = { left: L - b.x, hcenter: (L + R) / 2 - (b.x + b.w / 2), right: R - (b.x + b.w) }[kind] || 0
                const dy = { top: T - b.y, vcenter: (T + B) / 2 - (b.y + b.h / 2), bottom: B - (b.y + b.h) }[kind] || 0
                shift(u, dx, dy)
            })
        }
        refresh()
        changed()
    }
    // width and/or height of the last clicked symbol, keeping each symbol's top-left corner
    function sameSize (w, h) {
        const list = sizable()
        const ref = list.find(m => m.id === ed.sel) || list[list.length - 1]
        if (!ref || list.length < 2) return api.setMessage('Selecione 2 ou mais')
        for (const m of list) {
            if (w) m.w = ref.w
            if (h) m.h = ref.h
        }
        refresh()
        changed()
    }
    const newGroupId = () => 'g' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
    function group () {
        const list = selection()
        if (units(list).length < 2) return
        const id = newGroupId()
        for (const m of list) m.group = id
        refresh()
        changed()
    }
    function ungroup () {
        const list = selection()
        if (!list.some(m => m.group)) return
        for (const m of list) delete m.group
        refresh()
        changed()
    }
    function marquee (d) {
        return { x: Math.min(d.start.x, d.cur.x), y: Math.min(d.start.y, d.cur.y), w: Math.abs(d.cur.x - d.start.x), h: Math.abs(d.cur.y - d.start.y) }
    }
    function normalizeLine (s) {
        const pts = linePoints(s)
        if (!pts.length) return
        const minX = Math.min(...pts.map(p => p[0]))
        const minY = Math.min(...pts.map(p => p[1]))
        s.x += minX
        s.y += minY
        s.props.points = pts.map(p => [p[0] - minX, p[1] - minY])
        s.w = Math.max(1, Math.max(...s.props.points.map(p => p[0])))
        s.h = Math.max(1, Math.max(...s.props.points.map(p => p[1])))
    }

    // palette: one dropdown per category, each item with a small drawing of the symbol
    let menu = null
    const closeMenu = () => {
        if (!menu) return
        menu.remove()
        menu = null
        palette.querySelectorAll('.hmi-ed-open').forEach(b => b.classList.remove('hmi-ed-open'))
    }
    const icon = it => {
        const sym = createSymbol(it.type, 0, 0, it.variant)
        const def = SYMBOLS[it.type]
        const theme = (o.getTheme && o.getTheme()) === 'classic' ? 'classic' : 'isa101'
        const vb = def.line ? [-4, -20, sym.w + 8, 40] : [-4, -4, sym.w + 8, sym.h + 8]
        return '<svg xmlns="http://www.w3.org/2000/svg" class="hmi-root hmi-theme-' + theme + ' hmi-transparent" viewBox="' + vb.join(' ') + '" preserveAspectRatio="xMidYMid meet">' +
            renderSymbol(sym, def.preview, { editor: true, values: {} }) + '</svg>'
    }
    function openMenu (cat, btn) {
        menu = el('div', { class: 'hmi-ed-menu' })
        btn.classList.add('hmi-ed-open')
        for (const it of paletteItems(cat)) {
            const item = el('div', { class: 'hmi-ed-item', draggable: 'true', title: 'Arraste para a tela ou clique' })
            item.innerHTML = icon(it)
            item.appendChild(el('span', {}, it.label))
            item.addEventListener('dragstart', e => {
                e.dataTransfer.setData('text/plain', 'hmi:' + it.type + ':' + it.variant)
                menu.style.opacity = '0'
            })
            item.addEventListener('dragend', closeMenu)
            item.addEventListener('click', () => { const v = view(); add(it.type, v.w / 2, v.h / 2, it.variant); closeMenu() })
            menu.appendChild(item)
        }
        root.appendChild(menu)
        const rb = root.getBoundingClientRect()
        const bb = btn.getBoundingClientRect()
        menu.style.left = Math.max(4, Math.min(bb.left - rb.left, rb.width - menu.offsetWidth - 4)) + 'px'
        menu.style.top = (bb.bottom - rb.top + 4) + 'px'
    }
    for (const cat of CATEGORIES) {
        if (!paletteItems(cat).length) continue
        const b = el('button', { type: 'button', class: btnClass + ' hmi-ed-cat' }, cat + ' ▾')
        b.addEventListener('click', e => {
            e.stopPropagation()
            const same = b.classList.contains('hmi-ed-open')
            closeMenu()
            if (!same) openMenu(cat, b)
        })
        palette.appendChild(b)
    }
    const outside = e => { if (menu && !menu.contains(e.target) && !e.target.closest('.hmi-ed-cat')) closeMenu() }
    document.addEventListener('pointerdown', outside, true)
    stage.addEventListener('dragover', e => { e.preventDefault() })
    stage.addEventListener('drop', e => {
        const data = e.dataTransfer.getData('text/plain') || ''
        if (!data.startsWith('hmi:')) return
        e.preventDefault()
        const p = toSvg(e)
        const [, type, variant] = data.split(':')
        add(type, p.x, p.y, Number(variant))
    })

    // the svg is redrawn between clicks, so the browser's dblclick is unreliable: detect it here
    let lastDown = { what: null, t: 0 }
    const isDouble = what => {
        const now = Date.now()
        const dbl = lastDown.what === what && now - lastDown.t < 450
        lastDown = { what: dbl ? null : what, t: now }
        return dbl
    }
    svg.addEventListener('pointerdown', e => {
        stage.focus()
        const p = toSvg(e)
        const pointEl = e.target.closest('[data-point], [data-mid]')
        // double click on a line point deletes it
        if (pointEl && pointEl.hasAttribute('data-point') && isDouble('pt' + pointEl.getAttribute('data-point'))) {
            const s = selected()
            const i = Number(pointEl.getAttribute('data-point'))
            if (s && linePoints(s).length > 2) {
                s.props.points = linePoints(s).filter((pt, k) => k !== i)
                normalizeLine(s)
                refresh()
                changed()
            }
            e.preventDefault()
            return
        }
        if (pointEl && selected()) {
            const s = selected()
            let i = Number(pointEl.getAttribute('data-point'))
            if (pointEl.hasAttribute('data-mid')) {
                i = Number(pointEl.getAttribute('data-mid')) + 1
                const pts = linePoints(s)
                pts.splice(i, 0, [p.x - s.x, p.y - s.y])
                s.props.points = pts
            }
            ed.drag = { mode: 'point', i, start: p, moved: pointEl.hasAttribute('data-mid') }
        } else if (e.target.closest('[data-handle]')) {
            const s = selected()
            ed.drag = { mode: 'size', dir: e.target.closest('[data-handle]').getAttribute('data-handle'), start: p, x: s.x, y: s.y, w: s.w, h: s.h }
        } else {
            const g = e.target.closest('.hmi-symbol')
            const adding = e.shiftKey || e.ctrlKey || e.metaKey
            if (!g) {
                // rubber band selection
                if (!adding) select([])
                ed.drag = { mode: 'box', start: p, cur: p, base: [...ed.multi] }
                refresh()
            } else {
                const id = g.getAttribute('data-id')
                // double click on a grouped symbol picks just that member
                const mates = isDouble(id) && !adding ? [id] : groupOf(id)
                if (mates.length === 1 && ed.multi.length > 1 && groupOf(id).length > 1) select([id])
                if (adding) {
                    if (ed.multi.includes(id)) select(ed.multi.filter(x => !mates.includes(x)))
                    else select([...ed.multi, ...mates], id)
                    refresh()
                    e.preventDefault()
                    return
                }
                // pressing on a symbol that is already selected keeps the selection for dragging;
                // a plain click without moving narrows it back to that symbol (or its group)
                let narrow = null
                if (ed.multi.includes(id)) {
                    ed.sel = id
                    if (ed.multi.length > mates.length) narrow = mates
                } else select(mates, id)
                ed.drag = { mode: 'move', start: p, narrow, id, orig: selection().map(m => ({ m, x: m.x, y: m.y })) }
                refresh()
            }
        }
        svg.setPointerCapture(e.pointerId)
        e.preventDefault()
    })
    svg.addEventListener('pointermove', e => {
        const d = ed.drag
        if (!d) return
        const p = toSvg(e)
        if (d.mode === 'box') {
            d.cur = p
            const r = marquee(d)
            const hits = ed.symbols.filter(m => {
                const b = box(m)
                return b.x < r.x + r.w && b.x + b.w > r.x && b.y < r.y + r.h && b.y + b.h > r.y
            }).flatMap(m => groupOf(m.id))
            select([...d.base, ...hits])
            draw()
            return
        }
        if (d.mode === 'move') {
            const lead = d.orig.find(o => o.m.id === ed.sel) || d.orig[0]
            if (!lead) return
            const dx = snap(lead.x + p.x - d.start.x) - lead.x
            const dy = snap(lead.y + p.y - d.start.y) - lead.y
            for (const o of d.orig) { o.m.x = o.x + dx; o.m.y = o.y + dy }
            d.moved = true
            draw()
            return
        }
        const s = selected()
        if (!s) return
        if (d.mode === 'point') {
            const pts = linePoints(s)
            pts[d.i] = [snap(p.x) - s.x, snap(p.y) - s.y]
            s.props.points = pts
            s.w = Math.max(1, ...pts.map(q => q[0]))
            s.h = Math.max(1, ...pts.map(q => q[1]))
        } else {
            resize(s, d, p, e.shiftKey)
        }
        d.moved = true
        draw()
    })
    // Drag one of the 8 handles. Works in the symbol's own (rotated) frame and keeps the opposite side still.
    function resize (s, d, p, keepRatio) {
        const rot = (Number(d.rot !== undefined ? d.rot : s.rot) || 0) * Math.PI / 180
        const cos = Math.cos(rot)
        const sin = Math.sin(rot)
        const wx = p.x - d.start.x
        const wy = p.y - d.start.y
        const lx = wx * cos + wy * sin
        const ly = -wx * sin + wy * cos
        let l = 0
        let t = 0
        let r = d.w
        let b = d.h
        const has = c => d.dir.includes(c)
        if (has('e')) r += lx
        if (has('w')) l += lx
        if (has('s')) b += ly
        if (has('n')) t += ly
        if (!rot) {
            // snap the moving edges to the grid
            if (has('e')) r = snap(d.x + r) - d.x
            if (has('w')) l = snap(d.x + l) - d.x
            if (has('s')) b = snap(d.y + b) - d.y
            if (has('n')) t = snap(d.y + t) - d.y
        }
        if (keepRatio && d.dir.length === 2 && d.w > 0 && d.h > 0) {
            const k = Math.max((r - l) / d.w, (b - t) / d.h)
            const nw = d.w * k
            const nh = d.h * k
            if (has('e')) r = l + nw; else l = r - nw
            if (has('s')) b = t + nh; else t = b - nh
        }
        const MIN = 10
        if (r - l < MIN) { if (has('w')) l = r - MIN; else r = l + MIN }
        if (b - t < MIN) { if (has('n')) t = b - MIN; else b = t + MIN }
        const nw = r - l
        const nh = b - t
        // the box turns around its centre, so move the centre by the rotated shift
        const dcx = (l + r) / 2 - d.w / 2
        const dcy = (t + b) / 2 - d.h / 2
        const cx = d.x + d.w / 2 + dcx * cos - dcy * sin
        const cy = d.y + d.h / 2 + dcx * sin + dcy * cos
        s.w = Math.round(nw)
        s.h = Math.round(nh)
        s.x = Math.round(cx - nw / 2)
        s.y = Math.round(cy - nh / 2)
    }

    const endDrag = () => {
        if (!ed.drag) return
        const moved = ed.drag.moved
        if (ed.drag.mode === 'move' && !moved && ed.drag.narrow) select(ed.drag.narrow, ed.drag.id)
        const s = selected()
        if (ed.drag.mode === 'point' && s) normalizeLine(s)
        ed.drag = null
        draw()
        showProps()
        if (moved) changed()
    }
    svg.addEventListener('pointerup', endDrag)
    svg.addEventListener('pointercancel', endDrag)

    stage.addEventListener('keydown', e => {
        const k = e.key.toLowerCase()
        if (e.ctrlKey || e.metaKey) {
            if (k === 'z' && !e.shiftKey) undo()
            else if (k === 'y' || (k === 'z' && e.shiftKey)) redo()
            else if (k === 'c' && ed.multi.length) clipboard = clone(selection())
            else if (k === 'v' && clipboard) clipboard = paste(clipboard) || clipboard
            else if (k === 'd') duplicate()
            else if (k === 'a') { select(ed.symbols.map(m => m.id)); refresh() } else if (k === 'g' && e.shiftKey) ungroup()
            else if (k === 'g') group()
            else return
            e.preventDefault()
            e.stopPropagation()
            return
        }
        const list = selection()
        if (!list.length) return
        const step = e.shiftKey ? 10 : 1
        const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
        if (e.key === 'Delete' || e.key === 'Backspace') remove()
        else if (e.key === 'Escape') { select([]); refresh() } else if (moves[e.key]) {
            for (const m of list) { m.x += moves[e.key][0]; m.y += moves[e.key][1] }
            refresh()
            changed()
        } else return
        e.preventDefault()
        e.stopPropagation()
    })
    gridBox.addEventListener('change', draw)

    Object.assign(api, {
        getSymbols: () => clone(ed.symbols),
        redraw: draw,
        setMessage: (text) => { msg.textContent = text || '' },
        toggleFull: () => { root.classList.toggle('hmi-ed-full'); draw() },
        destroy: () => { document.removeEventListener('pointerdown', outside, true); root.innerHTML = '' }
    })
    refresh()
    return api
}
