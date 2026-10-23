// Drag-and-drop screen editor. Plain DOM, no framework, so the same editor
// runs inside the Node-RED edit dialog and inside the dashboard page.
import { readyBlocks } from './readyblocks.js'
import { SYMBOLS, CATEGORIES, paletteItems, createSymbol, renderSymbol, injectStyles, linePoints, scaleValue, RULE_OPS, RULE_EFFECTS, cleanSvg, parseSvg } from '../symbols/index.js'

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
    ungroup: '<rect x="1" y="1" width="6" height="6"/><rect x="9" y="9" width="6" height="6"/>',
    zoomin: '<circle cx="7" cy="7" r="5"/><path d="M11 11l4 4M4.5 7h5M7 4.5v5"/>',
    zoomout: '<circle cx="7" cy="7" r="5"/><path d="M11 11l4 4M4.5 7h5"/>'
}
const ACTIONS = [['none', 'Nada'], ['value', 'Enviar um valor'], ['toggle', 'Inverter (liga / desliga)'], ['pulse', 'Pulso (1 ao apertar, 0 ao soltar)'], ['input', 'Digitar um valor (ajuste)'], ['page', 'Ir para outra página'], ['screen', 'Ir para outra tela (deste canvas)'], ['faceplate', 'Abrir faceplate (detalhes e comandos)']]
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

// saved blocks (templates): a set of symbols reused on any screen of this browser
const BLOCKS_STORE = 'hmi-editor-blocks'
function loadBlocks () {
    try {
        const list = JSON.parse(localStorage.getItem(BLOCKS_STORE) || '[]')
        return Array.isArray(list) ? list.filter(b => b && typeof b.name === 'string' && Array.isArray(b.symbols)) : []
    } catch (e) { return [] }
}
function saveBlocks (list) {
    try { localStorage.setItem(BLOCKS_STORE, JSON.stringify(list)); return true } catch (e) { return false }
}
// "Bomba" matches "bomba", "BOMBA" and "bômba"
const plain = t => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
export function searchPalette (text) {
    const q = plain(text).trim()
    if (!q) return []
    const words = q.split(/\s+/)
    const out = []
    for (const cat of CATEGORIES) {
        for (const it of paletteItems(cat)) {
            const hay = plain(it.label + ' ' + cat + ' ' + it.type + ' ' + ((SYMBOLS[it.type] && SYMBOLS[it.type].label) || ''))
            if (words.every(w => hay.includes(w))) out.push(it)
        }
    }
    return out.slice(0, 60)
}
// symbols moved so the block starts at 0,0. param: a piece of the keys and
// texts (e.g. "M1") that becomes {{tag}}, asked again when the block is placed
export function makeBlock (name, list, param) {
    let syms = clone(list)
    const x = Math.min(...syms.map(m => m.x))
    const y = Math.min(...syms.map(m => m.y))
    for (const m of syms) { m.x -= x; m.y -= y; delete m.locked }
    const p = String(param || '').trim()
    if (p) syms = replaceStrings(syms, s => s.split(p).join('{{tag}}'))
    return { name: String(name || 'Bloco').slice(0, 60), symbols: syms }
}
// every string inside a value (keys, topics, texts, rules...), changed by fn
function replaceStrings (v, fn) {
    // pictures (data: addresses) are left alone
    if (typeof v === 'string') return v.startsWith('data:') ? v : fn(v)
    if (Array.isArray(v)) return v.map(x => replaceStrings(x, fn))
    if (v && typeof v === 'object') {
        const out = {}
        for (const k of Object.keys(v)) out[k] = k === 'id' || k === 'type' || k === 'group' ? v[k] : replaceStrings(v[k], fn)
        return out
    }
    return v
}
// the {{name}} parameters of a block
export function blockParams (b) {
    const out = []
    const re = /\{\{(\w{1,30})\}\}/g
    let m
    const text = JSON.stringify(b.symbols)
    while ((m = re.exec(text))) if (!out.includes(m[1])) out.push(m[1])
    return out
}
// the block's symbols with every {{name}} replaced
export function fillBlock (b, values) {
    return replaceStrings(b.symbols, s => s.replace(/\{\{(\w{1,30})\}\}/g, (all, k) => values[k] !== undefined ? String(values[k]) : all))
}
// symbols from a block file or the browser storage: only what the editor can draw
export function cleanBlockSymbols (list) {
    const n = v => (isFinite(Number(v)) ? Number(v) : 0)
    return (Array.isArray(list) ? list : []).filter(m => m && typeof m === 'object' && typeof m.id === 'string' && typeof m.type === 'string' && SYMBOLS[m.type]).map(m => {
        const c = { ...m, x: n(m.x), y: n(m.y), w: Math.max(10, n(m.w) || SYMBOLS[m.type].w || 10), h: Math.max(1, n(m.h) || SYMBOLS[m.type].h || 10), rot: n(m.rot), key: typeof m.key === 'string' ? m.key : '' }
        c.props = m.props && typeof m.props === 'object' && !Array.isArray(m.props) ? m.props : {}
        if (m.action && (typeof m.action !== 'object' || Array.isArray(m.action))) delete c.action
        if (m.rules && !Array.isArray(m.rules)) delete c.rules
        if (m.scale && typeof m.scale !== 'object') delete c.scale
        if (typeof m.group !== 'string') delete c.group
        return c
    })
}
// screen names: unique, trimmed, at most 20
export function cleanScreens (list) {
    const out = []
    for (const n of Array.isArray(list) ? list : []) {
        const t = typeof n === 'string' ? n.trim().slice(0, 40) : ''
        if (t && !out.includes(t) && out.length < 20) out.push(t)
    }
    return out
}
export function layerName (s) {
    const p = (s && s.props) || {}
    const def = SYMBOLS[s && s.type]
    return String(s.name || p.label || p.title || p.text || (def && def.label) || s.type)
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
.hmi-ed-guide { stroke: #e91e63; stroke-width: 1; stroke-dasharray: 4 3; pointer-events: none; vector-effect: non-scaling-stroke; }
.hmi-ed-sel.hmi-ed-locked { stroke: #8a8e93; }
.hmi-ed-lockmark { fill: #8a8e93; pointer-events: none; }
.hmi-ed-zoom { min-width: 58px; }
.hmi-ed .hmi-ed-search { width: 150px; height: 30px; padding: 2px 8px; font: inherit; border: 1px solid var(--hmi-ed-border); border-radius: 4px; background: var(--hmi-ed-bg); color: var(--hmi-ed-text); margin: 0; }
.hmi-ed-tabs { display: flex; gap: 0; margin: -2px 0 10px 0; border-bottom: 1px solid var(--hmi-ed-border); }
.hmi-ed-tab { flex: 1; font: inherit; font-size: 12px; padding: 6px 4px; border: 0; background: none; color: var(--hmi-ed-text); cursor: pointer; opacity: .7; }
.hmi-ed-tab.hmi-ed-on { opacity: 1; font-weight: 700; box-shadow: inset 0 -2px 0 #1e88e5; }
.hmi-ed-layers { display: flex; flex-direction: column; gap: 1px; }
.hmi-ed-layer { display: flex; align-items: center; gap: 4px; padding: 3px 4px; border-radius: 3px; cursor: pointer; font-size: 12px; }
.hmi-ed-layer:hover { background: var(--hmi-ed-bg); }
.hmi-ed-layer.hmi-ed-on { background: rgba(30, 136, 229, .15); }
.hmi-ed-layer .hmi-ed-lname { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hmi-ed-layer .hmi-ed-lkey { opacity: .6; font-size: 11px; }
.hmi-ed-layer.hmi-ed-off .hmi-ed-lname { opacity: .45; text-decoration: line-through; }
.hmi-ed-lbtn { font: inherit; font-size: 12px; border: 0; background: none; padding: 0 3px; cursor: pointer; opacity: .35; color: inherit; line-height: 1; }
.hmi-ed-lbtn.hmi-ed-on { opacity: 1; }
.hmi-ed-menu .hmi-ed-menurow { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 4px; align-items: center; padding-bottom: 4px; border-bottom: 1px solid var(--hmi-ed-border); margin-bottom: 2px; }
.hmi-ed-menu .hmi-ed-menurow input { height: 26px; padding: 2px 6px; font: inherit; font-size: 12px; border: 1px solid var(--hmi-ed-border); border-radius: 4px; flex: 1; min-width: 120px; }
.hmi-ed-menu .hmi-ed-empty { grid-column: 1 / -1; font-size: 12px; opacity: .7; padding: 4px; }
.hmi-ed-screens { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; padding: 4px 8px; border-bottom: 1px solid var(--hmi-ed-border); background: var(--hmi-ed-bg); }
.hmi-ed-screens .hmi-ed-slabel { font-size: 12px; opacity: .7; margin-right: 2px; }
.hmi-ed-screens .hmi-ed-stab { flex: none; border: 1px solid var(--hmi-ed-border); border-radius: 4px; padding: 3px 10px; }
.hmi-ed-props .hmi-ed-nocolor { opacity: .35; }
.hmi-ed-menu .hmi-ed-head { font-weight: 700; opacity: .85; text-transform: uppercase; letter-spacing: .04em; }
.hmi-ed-item { position: relative; }
.hmi-ed-item .hmi-ed-del { position: absolute; top: 1px; right: 3px; border: 0; background: none; cursor: pointer; opacity: .5; font-size: 13px; color: inherit; }
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
    const ed = { symbols: clone(o.symbols), sel: null, multi: [], drag: null, history: [], future: [], zoom: 1, pan: { x: 0, y: 0 }, guides: [], hidden: new Set(), panel: 'props', filter: '' }
    ed.history.push(clone(ed.symbols))
    // screens of this canvas (names); none = one screen. A symbol without "screen" is on the first one
    ed.screens = cleanScreens(o.screens)
    ed.screen = ed.screens[0] || ''
    const here = s => !ed.screens.length || (s.screen || ed.screens[0]) === ed.screen
    const onScreen = () => ed.symbols.filter(here)

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
    sep()
    tool('zoomout', 'Diminuir zoom (Ctrl+roda do mouse)', () => zoomBy(1 / 1.25), () => ed.zoom > 1)
    const zoomBtn = el('button', { type: 'button', class: btnClass + ' hmi-ed-small hmi-ed-zoom', title: 'Ver a tela inteira (100%)' }, '100%')
    zoomBtn.addEventListener('click', () => { ed.zoom = 1; ed.pan = { x: 0, y: 0 }; draw(); stage.focus() })
    tools.appendChild(zoomBtn)
    tool('zoomin', 'Aumentar zoom (Ctrl+roda do mouse). Com zoom: roda ou botão do meio / Espaço+arrastar move a tela', () => zoomBy(1.25), () => ed.zoom < 8)
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
    const guideLabel = el('label', { class: 'hmi-ed-check', title: 'Ao arrastar, encaixa nas bordas e no centro dos outros símbolos' })
    const guideBox = el('input', { type: 'checkbox' })
    guideBox.checked = true
    guideLabel.appendChild(guideBox)
    guideLabel.appendChild(document.createTextNode('Guias'))
    toolbar.appendChild(guideLabel)
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
    const screenBar = el('div', { class: 'hmi-ed-screens' })
    root.appendChild(toolbar)
    root.appendChild(screenBar)
    root.appendChild(body)

    // screen tabs: + Tela, rename and delete the one open
    function showScreens () {
        screenBar.innerHTML = ''
        screenBar.appendChild(el('span', { class: 'hmi-ed-slabel' }, 'Telas:'))
        const names = ed.screens.length ? ed.screens : ['Principal']
        for (const n of names) {
            const b = el('button', { type: 'button', class: 'hmi-ed-tab hmi-ed-stab' + ((ed.screen || 'Principal') === n ? ' hmi-ed-on' : ''), title: 'Abrir esta tela. Duplo clique renomeia.' }, n)
            b.addEventListener('click', () => { if (ed.screens.length) { ed.screen = n; select([]); refresh() } })
            b.addEventListener('dblclick', () => renameScreen())
            screenBar.appendChild(b)
        }
        const mini = (label, title, fn) => {
            const b = el('button', { type: 'button', class: btnClass + ' hmi-ed-small', title }, label)
            b.addEventListener('click', fn)
            screenBar.appendChild(b)
        }
        mini('+ Tela', 'Criar outra tela neste canvas (vira uma aba no dashboard)', addScreen)
        if (ed.screens.length) {
            mini('Renomear', 'Renomear a tela aberta', renameScreen)
            if (ed.screens.length > 1) mini('Apagar tela', 'Apagar a tela aberta e os símbolos dela', deleteScreen)
        }
    }
    // gives every symbol its screen name, so renaming or deleting the first screen is safe
    function pinScreens () {
        for (const m of ed.symbols) if (!m.screen || !ed.screens.includes(m.screen)) m.screen = ed.screens[0]
    }
    function askName (text, value) {
        const raw = window.prompt(text, value || '')
        if (raw === null) return null
        const n = raw.trim().slice(0, 40)
        if (!n) return null
        if (ed.screens.includes(n) && n !== value) { msg.textContent = 'Já existe uma tela com esse nome.'; return null }
        return n
    }
    function addScreen () {
        if (!ed.screens.length) {
            const first = askName('Nome da tela que já existe (a primeira):', 'Principal')
            if (!first) return
            ed.screens = [first]
            pinScreens()
        }
        const n = askName('Nome da nova tela:', 'Tela ' + (ed.screens.length + 1))
        if (!n) { screensChanged(); return }
        ed.screens.push(n)
        ed.screen = n
        select([])
        screensChanged()
    }
    function renameScreen () {
        if (!ed.screens.length) return addScreen()
        const old = ed.screen
        const n = askName('Novo nome da tela "' + old + '":', old)
        if (!n || n === old) return
        pinScreens()
        ed.screens = ed.screens.map(x => x === old ? n : x)
        for (const m of ed.symbols) {
            if (m.screen === old) m.screen = n
            if (m.action && m.action.mode === 'screen' && m.action.value === old) m.action.value = n
        }
        ed.screen = n
        screensChanged()
    }
    function deleteScreen () {
        if (ed.screens.length < 2) return
        const n = ed.screen
        const count = onScreen().length
        if (!window.confirm('Apagar a tela "' + n + '"' + (count ? ' e os ' + count + ' símbolo(s) dela' : '') + '?')) return
        pinScreens()
        ed.symbols = ed.symbols.filter(m => m.screen !== n)
        ed.screens = ed.screens.filter(x => x !== n)
        ed.screen = ed.screens[0]
        select([])
        screensChanged()
    }
    function screensChanged () {
        showScreens()
        refresh()
        changed()
        if (o.onChange) o.onChange(api)
    }

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
        const vw = v.w / ed.zoom
        const vh = v.h / ed.zoom
        ed.pan.x = Math.max(0, Math.min(v.w - vw, ed.pan.x))
        ed.pan.y = Math.max(0, Math.min(v.h - vh, ed.pan.y))
        svg.setAttribute('viewBox', ed.pan.x + ' ' + ed.pan.y + ' ' + vw + ' ' + vh)
        zoomBtn.textContent = Math.round(ed.zoom * 100) + '%'
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
            if (!def || ed.hidden.has(s.id) || !here(s)) continue
            // live values go through the symbol's scale; typed test values are already in screen units
            let value = s.preview !== undefined ? s.preview : (s.key ? previews[s.key] : def.preview)
            if (s.preview === undefined && s.key && !typed.has(s.key) && s.key in live) value = scaleValue(s, value)
            out += renderSymbol(s, value, { locale, values, editor: true })
        }
        const s = selected()
        if (s && SYMBOLS[s.type] && SYMBOLS[s.type].line) {
            const pts = linePoints(s)
            out += '<g transform="translate(' + s.x + ',' + s.y + ')">'
            // a box with resize handles around lines and free shapes that have some width and height
            if (s.w > 10 && s.h > 10 && !s.locked) {
                const hs = Math.max(8, Math.min(12, view().w / 120)) / ed.zoom
                // the box sits a little outside, so its handles don't cover the points
                const pad = 12 / ed.zoom
                out += '<rect class="hmi-ed-sel" x="' + -pad + '" y="' + -pad + '" width="' + (s.w + pad * 2) + '" height="' + (s.h + pad * 2) + '"/>'
                for (const [dir, hx, hy] of HANDLES) out += '<rect class="hmi-ed-handle" data-handle="' + dir + '" style="cursor:' + handleCursor(dir, 0) + '" x="' + (hx * (s.w + pad * 2) - pad - hs / 2) + '" y="' + (hy * (s.h + pad * 2) - pad - hs / 2) + '" width="' + hs + '" height="' + hs + '"/>'
            }
            for (let i = 0; i < pts.length - 1; i++) {
                out += '<circle class="hmi-ed-mid" data-mid="' + i + '" cx="' + (pts[i][0] + pts[i + 1][0]) / 2 + '" cy="' + (pts[i][1] + pts[i + 1][1]) / 2 + '" r="5"/>'
            }
            pts.forEach((pt, i) => { out += '<circle class="hmi-ed-point" data-point="' + i + '" cx="' + pt[0] + '" cy="' + pt[1] + '" r="6"/>' })
            out += '</g>'
        } else if (s) {
            const rot = Number(s.rot) || 0
            const hs = Math.max(8, Math.min(12, view().w / 120)) / ed.zoom
            out += '<g transform="translate(' + s.x + ',' + s.y + ')' + (rot ? ' rotate(' + rot + ',' + s.w / 2 + ',' + s.h / 2 + ')' : '') + '">' +
                '<rect class="hmi-ed-sel' + (s.locked ? ' hmi-ed-locked' : '') + '" x="-3" y="-3" width="' + (s.w + 6) + '" height="' + (s.h + 6) + '"/>'
            if (s.locked) out += '<path class="hmi-ed-lockmark" transform="translate(' + (s.w - 4) + ',-14) scale(' + (1 / ed.zoom) + ')" d="M2 6V4a3 3 0 0 1 6 0v2h1v6H1V6Zm2 0h2V4a1 1 0 0 0-2 0Z"/>'
            for (const [dir, hx, hy] of s.locked ? [] : HANDLES) {
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
        for (const g of ed.guides) {
            out += g.x !== undefined
                ? '<path class="hmi-ed-guide" d="M' + g.x + ' 0V' + v.h + '"/>'
                : '<path class="hmi-ed-guide" d="M0 ' + g.y + 'H' + v.w + '"/>'
        }
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
        const tabs = el('div', { class: 'hmi-ed-tabs' })
        for (const [k, label] of [['props', 'Propriedades'], ['layers', 'Camadas (' + onScreen().length + ')']]) {
            const b = el('button', { type: 'button', class: 'hmi-ed-tab' + (ed.panel === k ? ' hmi-ed-on' : '') }, label)
            b.addEventListener('click', () => { ed.panel = k; showProps() })
            tabs.appendChild(b)
        }
        props.appendChild(tabs)
        if (ed.panel === 'layers') return showLayers()
        const editRow = () => {
            const row = el('div', { class: 'hmi-ed-btnrow' })
            const locked = selection().length && selection().every(m => m.locked)
            for (const [label, title, fn] of [['Duplicar', 'Ctrl+D', duplicate], ['Frente', 'Trazer para a frente', () => order(1)], ['Trás', 'Mandar para trás', () => order(-1)], ['Excluir', 'Delete', remove], [locked ? 'Destravar' : 'Travar', locked ? 'Deixar mover e editar na tela' : 'Não deixa mover nem selecionar clicando na tela (Ctrl+L). Destrave em Camadas.', () => setLocked(!locked)]]) smallBtn(row, label, title, fn)
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
        props.appendChild(field('Nome (em Camadas)', s.name || '', 'text', v => { if (v.trim()) s.name = v.trim(); else delete s.name }))
        props.appendChild(pair(field('X', s.x, 'number', v => { s.x = Number(v) || 0 }), field('Y', s.y, 'number', v => { s.y = Number(v) || 0 })))
        if (def.line) {
            // the free shape is resized by scaling its points
            const scalePts = (w, h) => {
                const k = [w / Math.max(1, s.w), h / Math.max(1, s.h)]
                s.props.points = linePoints(s).map(pt => [Math.round(pt[0] * k[0]), Math.round(pt[1] * k[1])])
                normalizeLine(s)
            }
            props.appendChild(pair(field('Largura', s.w, 'number', v => scalePts(Math.max(10, Number(v) || 10), s.h)), field('Altura', s.h, 'number', v => scalePts(s.w, Math.max(10, Number(v) || 10)))))
        }
        if (def.line) {
            const tr = el('div', { class: 'hmi-ed-btnrow' })
            for (const [label, title, fn] of [
                ['↻ 90°', 'Girar 90° no sentido horário', ([x, y], w, h) => [h - y, x]],
                ['↺ 90°', 'Girar 90° no sentido anti-horário', ([x, y], w, h) => [y, w - x]],
                ['↔', 'Espelhar na horizontal', ([x, y], w, h) => [w - x, y]],
                ['↕', 'Espelhar na vertical', ([x, y], w, h) => [x, h - y]]
            ]) smallBtn(tr, label, title, () => { turnPoints(s, fn); refresh(); changed() })
            props.appendChild(tr)
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
        // own colours for on / off (empty = the theme's)
        if ((def.defaults && 'onWhen' in def.defaults) || ['frame', 'shape'].includes(s.type)) {
            const colorField = (label, k) => {
                const f = field(label, s.props[k] || '#888888', 'color', v => { s.props[k] = v })
                const input = f.querySelector('input')
                if (!s.props[k]) input.classList.add('hmi-ed-nocolor')
                input.addEventListener('input', () => input.classList.remove('hmi-ed-nocolor'))
                const clear = el('button', { type: 'button', class: btnClass + ' hmi-ed-small', title: 'Voltar à cor do tema' }, 'Tema')
                clear.addEventListener('click', () => { delete s.props[k]; draw(); changed(); showProps() })
                f.appendChild(clear)
                return f
            }
            props.appendChild(pair(colorField('Cor ligado', 'colorOn'), colorField('Cor desligado', 'colorOff')))
        }
        if (def.defaults && 'priority' in def.defaults) {
            props.appendChild(field('Na lista de alarmes', s.props.alarmList === 'no' ? 'no' : 'yes', 'select', v => { s.props.alarmList = v }, [['yes', 'Sim'], ['no', 'Não']]))
        }
        props.appendChild(field('Valor de teste (só no editor)', s.preview === undefined ? '' : String(s.preview), 'text', v => {
            const p = parsePreview(v)
            if (p === undefined) delete s.preview
            else s.preview = p
        }))
        if (def.image) imageFields(s, smallBtn)
        if (def.svgImport) svgFields(s, smallBtn)
        if (!def.line && !def.image && !def.svgImport && !def.alarms && !['frame', 'stack'].includes(s.type)) {
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
        if (def.line || s.type === 'frame' || def.alarms) return
        props.appendChild(el('h5', {}, 'Ao clicar no dashboard'))
        const act = s.action || { mode: 'none' }
        const setAct = (k, v) => {
            s.action = { mode: 'none', value: '', topic: '', confirm: 'no', min: '', max: '', ...s.action, [k]: v }
            if (s.action.mode === 'none') delete s.action
        }
        props.appendChild(field('Ação', act.mode || 'none', 'select', v => { setAct('mode', v); setTimeout(showProps) }, ACTIONS))
        if (act.mode && act.mode !== 'none') {
            if (act.mode === 'value') props.appendChild(field('Valor enviado', act.value, 'text', v => setAct('value', v)))
            if (act.mode === 'input') {
                props.appendChild(pair(field('Mínimo', act.min, 'number', v => setAct('min', v)), field('Máximo', act.max, 'number', v => setAct('max', v))))
                props.appendChild(field('Maior mudança de uma vez (vazio = sem limite)', act.maxStep ?? '', 'number', v => setAct('maxStep', v)))
            }
            if (act.mode === 'faceplate') {
                props.appendChild(el('div', { class: 'hmi-ed-hint' }, 'Abre uma janela com estado, alarmes deste símbolo e os campos abaixo. Deixe vazio o que não usa.'))
                props.appendChild(pair(field('Chave de um valor', act.valueKey || '', 'text', v => setAct('valueKey', v.trim())), field('Unidade', act.valueUnit || '', 'text', v => setAct('valueUnit', v))))
                props.appendChild(pair(field('Chave do modo', act.modeKey || '', 'text', v => setAct('modeKey', v.trim())), field('Textos do modo', act.modeTexts || '0=MANUAL,1=AUTO', 'text', v => setAct('modeTexts', v))))
                props.appendChild(pair(field('Chave das horas', act.hoursKey || '', 'text', v => setAct('hoursKey', v.trim())), field('Chave das partidas', act.startsKey || '', 'text', v => setAct('startsKey', v.trim()))))
                for (const [k, label] of [['on', 'Ligar'], ['off', 'Desligar'], ['reset', 'Reset']]) {
                    props.appendChild(pair(field('Botão ' + label + ': tópico', act[k + 'Topic'] || '', 'text', v => setAct(k + 'Topic', v.trim())), field('valor', act[k + 'Value'] ?? '', 'text', v => setAct(k + 'Value', v))))
                }
                props.appendChild(el('h5', {}, 'Regulador (PID)'))
                props.appendChild(el('div', { class: 'hmi-ed-hint' }, 'Para malhas de controle: mostra PV, SP e saída, com botões Auto/Manual, Alterar SP e Saída manual.'))
                props.appendChild(pair(field('Chave do PV (medido)', act.pvKey || '', 'text', v => setAct('pvKey', v.trim())), field('Unidade', act.pidUnit || '', 'text', v => setAct('pidUnit', v))))
                props.appendChild(pair(field('Chave do SP', act.spKey || '', 'text', v => setAct('spKey', v.trim())), field('Chave da saída (%)', act.opKey || '', 'text', v => setAct('opKey', v.trim()))))
                props.appendChild(field('Alterar SP: tópico', act.spTopic || '', 'text', v => setAct('spTopic', v.trim())))
                props.appendChild(pair(field('SP mínimo', act.spMin ?? '', 'number', v => setAct('spMin', v)), field('SP máximo', act.spMax ?? '', 'number', v => setAct('spMax', v))))
                props.appendChild(field('Saída manual: tópico', act.opTopic || '', 'text', v => setAct('opTopic', v.trim())))
                props.appendChild(pair(field('Saída mínima', act.opMin ?? '0', 'number', v => setAct('opMin', v)), field('Saída máxima', act.opMax ?? '100', 'number', v => setAct('opMax', v))))
                props.appendChild(field('Auto/Manual: tópico', act.modeTopic || '', 'text', v => setAct('modeTopic', v.trim())))
                props.appendChild(pair(field('valor Auto', act.autoValue ?? '1', 'text', v => setAct('autoValue', v)), field('valor Manual', act.manValue ?? '0', 'text', v => setAct('manValue', v))))
            } else if (act.mode === 'screen') {
                const names = ed.screens.length ? ed.screens : ['Principal']
                props.appendChild(field('Tela', act.value, 'select', v => setAct('value', v), [['', '(escolha)'], ...names.map(n => [n, n])]))
                if (!ed.screens.length) props.appendChild(el('div', { class: 'hmi-ed-hint' }, 'Crie outras telas com "+ Tela", acima do desenho.'))
            } else if (act.mode === 'page') {
                const pages = (o.getPages && o.getPages()) || []
                const pf = pages.length
                    ? field('Página', act.value, 'select', v => setAct('value', v), [['', '(escolha)'], ...pages])
                    : field('Página (caminho, ex. /linha2)', act.value, 'text', v => setAct('value', v.trim()))
                props.appendChild(pf)
            }
            if (!['page', 'screen', 'faceplate'].includes(act.mode)) {
                const t = field('Tópico (vazio = chave do payload)', act.topic, 'text', v => setAct('topic', v))
                t.querySelector('input').placeholder = s.key || ''
                props.appendChild(t)
            }
            if (['value', 'toggle', 'page', 'screen', 'faceplate'].includes(act.mode)) props.appendChild(field('Pedir confirmação', act.confirm || 'no', 'select', v => setAct('confirm', v), [['no', 'Não'], ['yes', 'Sim']]))
            if (!['page', 'screen'].includes(act.mode)) props.appendChild(field('Pedir senha', act.pin || 'no', 'select', v => setAct('pin', v), [['no', 'Não'], ['yes', 'Sim (a senha do nó)']]))
            if (!['page', 'screen'].includes(act.mode)) {
                const il = field('Intertravamento: chaves que precisam estar ligadas', act.interlock || '', 'text', v => setAct('interlock', v.trim()))
                il.querySelector('input').placeholder = 'ex.: permissivo, !emergencia'
                props.appendChild(il)
                props.appendChild(field('Motivo mostrado quando bloqueado', act.interlockText || '', 'text', v => setAct('interlockText', v)))
                props.appendChild(el('div', { class: 'hmi-ed-hint' }, 'Separe por vírgula; "!" na frente exige a chave desligada. O Node-RED recusa o comando enquanto faltar alguma, e o símbolo mostra um cadeado.'))
            }
            if (!['page', 'screen'].includes(act.mode)) props.appendChild(el('div', { class: 'hmi-ed-hint' }, 'A mensagem sai pela saída do nó: msg.topic e msg.payload.'))
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

    // "SVG com partes ligadas": the file, and which of its elements follow which key
    function svgFields (s, smallBtn) {
        props.appendChild(el('h5', {}, 'Desenho SVG'))
        const input = el('input', { type: 'file', accept: '.svg,image/svg+xml', style: 'display:none' })
        const btns = el('div', { class: 'hmi-ed-btnrow' })
        smallBtn(btns, s.props.svg ? 'Trocar' : 'Escolher arquivo .svg', 'Um desenho do Inkscape, Illustrator, draw.io... até 300 KB', () => input.click())
        input.addEventListener('change', () => {
            const file = input.files && input.files[0]
            if (!file) return
            if (file.size > 300 * 1024) return api.setMessage('SVG grande demais (máx. 300 KB)')
            file.text().then(text => {
                const clean = cleanSvg(text)
                if (!clean) return api.setMessage('Não é um SVG válido')
                s.props.svg = clean
                const vb = String(parseSvg(clean).viewBox).split(/[\s,]+/).map(Number)
                if (vb.length === 4 && vb[2] > 0 && vb[3] > 0) s.h = Math.max(10, Math.round(s.w * vb[3] / vb[2]))
                refresh()
                changed()
            })
        })
        props.appendChild(btns)
        props.appendChild(input)
        const parsed = parseSvg(s.props.svg)
        const row = el('div', { class: 'hmi-ed-f' })
        row.appendChild(el('label', {}, 'Ligações (uma por linha)'))
        const ta = el('textarea', { rows: '5', style: 'width:100%;font-family:monospace;font-size:12px', placeholder: 'motor1 = M1.ligado\nfalha1 = M1.falha : alarme\ntempTxt = # temperatura' })
        ta.value = s.props.binds || ''
        ta.addEventListener('input', () => { s.props.binds = ta.value; draw(); changed() })
        ta.addEventListener('keydown', e => e.stopPropagation())
        row.appendChild(ta)
        props.appendChild(row)
        props.appendChild(el('div', { class: 'hmi-ed-hint' }, 'id = chave: o elemento fica escuro quando a chave liga. ": alarme" deixa vermelho, ": atencao" amarelo, ": esconder" some. "id = # chave" mostra o valor num texto.'))
        if (parsed && parsed.ids.length) props.appendChild(el('div', { class: 'hmi-ed-hint' }, 'Elementos com id neste desenho: ' + parsed.ids.slice(0, 40).join(', ') + (parsed.ids.length > 40 ? '…' : '')))
    }

    function refresh () { draw(); showProps() }

    // Layers: every symbol, top first. Click selects (also locked ones), padlock locks, eye hides in the editor.
    function showLayers () {
        const search = el('input', { type: 'search', class: 'hmi-ed-search', placeholder: 'Buscar por nome ou chave', style: 'width:100%;margin-bottom:6px' })
        search.value = ed.filter
        const list = el('div', { class: 'hmi-ed-layers' })
        const fill = () => {
            list.innerHTML = ''
            const q = plain(ed.filter).trim()
            const rows = onScreen().reverse().filter(m => !q || plain(layerName(m) + ' ' + m.key + ' ' + m.type).includes(q))
            if (!rows.length) list.appendChild(el('div', { class: 'hmi-ed-hint' }, onScreen().length ? 'Nada encontrado.' : 'A tela está vazia.'))
            for (const m of rows) {
                const row = el('div', { class: 'hmi-ed-layer' + (ed.multi.includes(m.id) ? ' hmi-ed-on' : '') + (ed.hidden.has(m.id) ? ' hmi-ed-off' : ''), 'data-layer': m.id })
                const eye = el('button', { type: 'button', class: 'hmi-ed-lbtn' + (ed.hidden.has(m.id) ? '' : ' hmi-ed-on'), title: 'Mostrar / esconder só no editor' }, '👁')
                eye.addEventListener('click', e => { e.stopPropagation(); if (ed.hidden.has(m.id)) ed.hidden.delete(m.id); else ed.hidden.add(m.id); draw(); fill() })
                const lock = el('button', { type: 'button', class: 'hmi-ed-lbtn' + (m.locked ? ' hmi-ed-on' : ''), title: m.locked ? 'Destravar' : 'Travar' }, m.locked ? '🔒' : '🔓')
                lock.addEventListener('click', e => { e.stopPropagation(); if (m.locked) delete m.locked; else m.locked = true; draw(); fill(); changed() })
                const name = el('span', { class: 'hmi-ed-lname', title: layerName(m) }, layerName(m))
                row.appendChild(eye)
                row.appendChild(lock)
                row.appendChild(name)
                if (m.key) row.appendChild(el('span', { class: 'hmi-ed-lkey' }, m.key))
                row.addEventListener('click', e => {
                    if (e.shiftKey || e.ctrlKey || e.metaKey) select(ed.multi.includes(m.id) ? ed.multi.filter(x => x !== m.id) : [...ed.multi, m.id], m.id)
                    else select([m.id])
                    draw()
                    fill()
                })
                row.addEventListener('dblclick', () => { select([m.id]); ed.panel = 'props'; refresh() })
                list.appendChild(row)
            }
        }
        search.addEventListener('input', () => { ed.filter = search.value; fill() })
        search.addEventListener('keydown', e => e.stopPropagation())
        props.appendChild(search)
        props.appendChild(list)
        props.appendChild(el('div', { class: 'hmi-ed-hint', style: 'margin-top:8px' }, 'Clique seleciona (Shift soma). Duplo clique abre as propriedades. 🔒 trava na tela; 👁 esconde só aqui no editor.'))
        fill()
    }

    function setLocked (on) {
        for (const m of selection()) { if (on) m.locked = true; else delete m.locked }
        refresh()
        changed()
    }

    function zoomBy (k, at) {
        const v = view()
        const z = Math.max(1, Math.min(8, ed.zoom * k))
        const c = at || { x: ed.pan.x + v.w / ed.zoom / 2, y: ed.pan.y + v.h / ed.zoom / 2 }
        // keep the point under the mouse (or the middle) where it is
        const fx = (c.x - ed.pan.x) / (v.w / ed.zoom)
        const fy = (c.y - ed.pan.y) / (v.h / ed.zoom)
        ed.zoom = z
        ed.pan = { x: c.x - fx * v.w / z, y: c.y - fy * v.h / z }
        draw()
    }
    // screen units per CSS pixel
    const unitsPerPx = () => (view().w / ed.zoom) / Math.max(1, svg.getBoundingClientRect().width)

    // smart guides: snap the moving box to the edges and centres of the other symbols and of the screen
    function guideSnap (b0, dx, dy, moving) {
        const v = view()
        const tol = 6 * unitsPerPx()
        const xs = [0, v.w / 2, v.w]
        const ys = [0, v.h / 2, v.h]
        for (const m of ed.symbols) {
            if (moving.has(m.id) || ed.hidden.has(m.id) || !here(m)) continue
            const b = box(m)
            xs.push(b.x, b.x + b.w / 2, b.x + b.w)
            ys.push(b.y, b.y + b.h / 2, b.y + b.h)
        }
        const best = (edges, targets, d) => {
            let hit = null
            for (const e of edges) for (const t of targets) {
                const diff = t - (e + d)
                if (Math.abs(diff) <= tol && (!hit || Math.abs(diff) < Math.abs(hit.diff))) hit = { diff, t }
            }
            return hit
        }
        const hx = best([b0.x, b0.x + b0.w / 2, b0.x + b0.w], xs, dx)
        const hy = best([b0.y, b0.y + b0.h / 2, b0.y + b0.h], ys, dy)
        const guides = []
        if (hx) { dx += hx.diff; guides.push({ x: hx.t }) }
        if (hy) { dy += hy.diff; guides.push({ y: hy.t }) }
        return { dx: Math.round(dx), dy: Math.round(dy), guides, hx: !!hx, hy: !!hy }
    }

    function add (type, cx, cy, variant) {
        if (!SYMBOLS[type]) return
        const s = createSymbol(type, 0, 0, isFinite(variant) ? variant : -1)
        s.x = snap(cx - s.w / 2)
        s.y = snap(cy - s.h / 2)
        if (ed.screens.length) s.screen = ed.screen
        ed.symbols.push(s)
        select([s.id])
        refresh()
        changed()
    }

    function remove () {
        if (!ed.multi.length) return
        const gone = ed.multi.filter(id => !(ed.symbols.find(m => m.id === id) || {}).locked)
        if (!gone.length) { msg.textContent = 'Símbolo travado: destrave para excluir.'; return }
        ed.symbols = ed.symbols.filter(s => !gone.includes(s.id))
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
            delete c.locked
            // copies form their own group, not join the original's
            if (x.group) c.group = groups[x.group] || (groups[x.group] = newGroupId())
            if (ed.screens.length) c.screen = ed.screen
            else delete c.screen
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
    // turns or mirrors the points of a line / free shape, keeping its centre in place
    function turnPoints (s, fn) {
        const cx = s.x + s.w / 2
        const cy = s.y + s.h / 2
        s.props.points = linePoints(s).map(q => fn(q, s.w, s.h))
        normalizeLine(s)
        s.x = Math.round(cx - s.w / 2)
        s.y = Math.round(cy - s.h / 2)
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
        const vb = def.line && sym.h <= 1 ? [-4, -20, sym.w + 8, 40] : [-4, -4, sym.w + 8, sym.h + 8]
        return '<svg xmlns="http://www.w3.org/2000/svg" class="hmi-root hmi-theme-' + theme + ' hmi-transparent" viewBox="' + vb.join(' ') + '" preserveAspectRatio="xMidYMid meet">' +
            renderSymbol(sym, def.preview, { editor: true, values: {} }) + '</svg>'
    }
    function placeMenu (btn) {
        root.appendChild(menu)
        const rb = root.getBoundingClientRect()
        const bb = btn.getBoundingClientRect()
        menu.style.left = Math.max(4, Math.min(bb.left - rb.left, rb.width - menu.offsetWidth - 4)) + 'px'
        menu.style.top = (bb.bottom - rb.top + 4) + 'px'
    }
    function openMenu (cat, btn, items) {
        menu = el('div', { class: 'hmi-ed-menu' })
        if (cat) btn.classList.add('hmi-ed-open')
        const list = items || paletteItems(cat)
        if (!list.length) menu.appendChild(el('div', { class: 'hmi-ed-empty' }, 'Nenhum símbolo com esse nome.'))
        for (const it of list) {
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
        placeMenu(btn)
    }

    // ---- blocks: save the selection, insert it on any screen, export / import as a file
    const blockIcon = b => {
        const theme = (o.getTheme && o.getTheme()) === 'classic' ? 'classic' : 'isa101'
        const w = Math.max(10, ...b.symbols.map(m => box(m).x + box(m).w))
        const h = Math.max(10, ...b.symbols.map(m => box(m).y + box(m).h))
        return '<svg xmlns="http://www.w3.org/2000/svg" class="hmi-root hmi-theme-' + theme + ' hmi-transparent" viewBox="-4 -4 ' + (w + 8) + ' ' + (h + 28) + '" preserveAspectRatio="xMidYMid meet">' +
            b.symbols.map(m => SYMBOLS[m.type] ? renderSymbol(m, m.preview !== undefined ? m.preview : SYMBOLS[m.type].preview, { editor: true, values: {} }) : '').join('') + '</svg>'
    }
    function insertBlock (b, cx, cy) {
        const base = cleanBlockSymbols(b.symbols)
        if (!base.length) return
        // a block with {{tag}}: one copy per value typed (M1, M2, M3 side by side)
        const params = blockParams({ symbols: base })
        const sets = [{}]
        for (const k of params) {
            const raw = window.prompt('Bloco "' + b.name + '": valor de {{' + k + '}}\nVários separados por vírgula colocam uma cópia para cada (ex.: M1, M2, M3)', '')
            if (raw === null) return
            const vals = raw.split(',').map(t => t.trim()).filter(Boolean)
            if (!vals.length) vals.push('')
            while (sets.length < vals.length) sets.push({ ...sets[0] })
            sets.forEach((st, i) => { st[k] = vals[Math.min(i, vals.length - 1)] })
        }
        const w = Math.max(...base.map(m => box(m).x + box(m).w))
        const h = Math.max(...base.map(m => box(m).y + box(m).h))
        const total = sets.length * w + (sets.length - 1) * 20
        const oy = snap(cy - h / 2) - 20
        sets.forEach((st, i) => {
            const syms = params.length ? fillBlock({ symbols: base }, st) : base
            const ox = snap(cx - total / 2 + i * (w + 20)) - 20
            const out = paste(syms.map(m => ({ ...clone(m), x: m.x + ox, y: m.y + oy })))
            // each copy lands as one group, so it moves as a piece; Ctrl+Shift+G breaks it up
            if (out && out.length > 1 && !out.some(m => m.group)) group()
        })
        if (sets.length > 1) msg.textContent = sets.length + ' cópias do bloco colocadas.'
    }
    function openBlocks (btn) {
        menu = el('div', { class: 'hmi-ed-menu' })
        btn.classList.add('hmi-ed-open')
        const blocks = loadBlocks()
        const row = el('div', { class: 'hmi-ed-menurow' })
        const name = el('input', { type: 'text', placeholder: 'Nome do bloco (ex.: Motor com tag)' })
        name.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') saveSel() })
        const param = el('input', { type: 'text', placeholder: 'Parte que muda (ex.: M1)', title: 'Opcional: o trecho das chaves e textos que muda de uma cópia para outra. Vira {{tag}} e é perguntado ao colocar o bloco.', style: 'width:150px' })
        param.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') saveSel() })
        const mini = (label, title, fn, disabled) => {
            const b = el('button', { type: 'button', class: btnClass + ' hmi-ed-small', title }, label)
            if (disabled) b.disabled = true
            b.addEventListener('click', fn)
            row.appendChild(b)
        }
        const saveSel = () => {
            const sel = selection()
            if (!sel.length) return
            blocks.push(makeBlock(name.value.trim() || ('Bloco ' + (blocks.length + 1)), sel, param.value))
            msg.textContent = saveBlocks(blocks) ? 'Bloco salvo.' : 'Não deu para salvar (memória do navegador cheia?).'
            closeMenu()
        }
        if (ed.multi.length) { row.appendChild(name); row.appendChild(param) }
        mini('Salvar seleção', ed.multi.length ? 'Guarda os símbolos selecionados como um bloco' : 'Selecione os símbolos primeiro', saveSel, !ed.multi.length)
        mini('Exportar', 'Baixa todos os blocos num arquivo .json', () => {
            const a = el('a', { download: 'blocos-ihm.json', href: URL.createObjectURL(new Blob([JSON.stringify({ hmiBlocks: blocks }, null, 1)], { type: 'application/json' })) })
            document.body.appendChild(a)
            a.click()
            a.remove()
        }, !blocks.length)
        const file = el('input', { type: 'file', accept: '.json,application/json', style: 'display:none' })
        file.addEventListener('change', () => {
            const f = file.files && file.files[0]
            if (!f) return
            f.text().then(t => {
                const data = JSON.parse(t)
                const got = (Array.isArray(data) ? data : data.hmiBlocks || []).filter(b => b && typeof b.name === 'string' && Array.isArray(b.symbols))
                    .map(b => ({ name: b.name.slice(0, 60), symbols: cleanBlockSymbols(b.symbols) })).filter(b => b.symbols.length)
                msg.textContent = saveBlocks([...loadBlocks(), ...got]) ? got.length + ' bloco(s) importado(s).' : 'Não deu para salvar.'
            }).catch(() => { msg.textContent = 'Arquivo de blocos inválido.' })
            closeMenu()
        })
        row.appendChild(file)
        mini('Importar', 'Lê um arquivo .json de blocos', () => file.click())
        menu.appendChild(row)
        // ready-made machine assemblies, always there and not deletable
        menu.appendChild(el('div', { class: 'hmi-ed-empty hmi-ed-head' }, 'Montagens prontas'))
        readyBlocks().forEach((b, i) => {
            const item = el('div', { class: 'hmi-ed-item hmi-ed-ready', draggable: 'true', title: 'Arraste para a tela ou clique. Pergunta o nome ({{tag}}) usado nas chaves.' })
            item.innerHTML = blockIcon(b)
            item.appendChild(el('span', {}, b.name))
            item.addEventListener('dragstart', e => {
                e.dataTransfer.setData('text/plain', 'hmi-ready:' + i)
                menu.style.opacity = '0'
            })
            item.addEventListener('dragend', closeMenu)
            item.addEventListener('click', () => { const v = view(); insertBlock(b, v.w / 2, v.h / 2); closeMenu() })
            menu.appendChild(item)
        })
        menu.appendChild(el('div', { class: 'hmi-ed-empty hmi-ed-head' }, 'Meus blocos'))
        if (!blocks.length) menu.appendChild(el('div', { class: 'hmi-ed-empty' }, 'Nenhum bloco salvo. Selecione símbolos e clique em Salvar seleção. Os blocos ficam neste navegador e servem em qualquer tela.'))
        blocks.forEach((b, i) => {
            const item = el('div', { class: 'hmi-ed-item', draggable: 'true', title: 'Arraste para a tela ou clique' })
            item.innerHTML = blockIcon(b)
            const ps = blockParams(b)
            item.appendChild(el('span', {}, b.name + (ps.length ? ' (' + ps.map(k => '{{' + k + '}}').join(' ') + ')' : '')))
            const del = el('button', { type: 'button', class: 'hmi-ed-del', title: 'Apagar o bloco' }, '×')
            del.addEventListener('click', e => {
                e.stopPropagation()
                const list = loadBlocks()
                list.splice(i, 1)
                saveBlocks(list)
                closeMenu()
                openBlocks(btn)
            })
            item.appendChild(del)
            item.addEventListener('dragstart', e => {
                e.dataTransfer.setData('text/plain', 'hmi-block:' + i)
                menu.style.opacity = '0'
            })
            item.addEventListener('dragend', closeMenu)
            item.addEventListener('click', () => { const v = view(); insertBlock(b, v.w / 2, v.h / 2); closeMenu() })
            menu.appendChild(item)
        })
        placeMenu(btn)
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
    const blocksBtn = el('button', { type: 'button', class: btnClass + ' hmi-ed-cat', title: 'Conjuntos de símbolos salvos para usar em outras telas' }, 'Blocos ▾')
    blocksBtn.addEventListener('click', e => {
        e.stopPropagation()
        const same = blocksBtn.classList.contains('hmi-ed-open')
        closeMenu()
        if (!same) openBlocks(blocksBtn)
    })
    palette.appendChild(blocksBtn)
    const search = el('input', { type: 'search', class: 'hmi-ed-search', placeholder: 'Buscar símbolo…', title: 'Busca pelo nome em todas as categorias. Enter coloca o primeiro.' })
    search.addEventListener('input', () => {
        closeMenu()
        if (search.value.trim()) openMenu(null, search, searchPalette(search.value))
    })
    search.addEventListener('keydown', e => {
        e.stopPropagation()
        if (e.key === 'Escape') { search.value = ''; closeMenu() }
        if (e.key === 'Enter') {
            const first = searchPalette(search.value)[0]
            if (first) { const v = view(); add(first.type, v.w / 2, v.h / 2, first.variant); closeMenu(); search.value = '' }
        }
    })
    palette.appendChild(search)
    const outside = e => { if (menu && !menu.contains(e.target) && !e.target.closest('.hmi-ed-cat, .hmi-ed-search')) closeMenu() }
    document.addEventListener('pointerdown', outside, true)
    stage.addEventListener('dragover', e => { e.preventDefault() })
    stage.addEventListener('drop', e => {
        const data = e.dataTransfer.getData('text/plain') || ''
        if (data.startsWith('hmi-ready:')) {
            e.preventDefault()
            const b = readyBlocks()[Number(data.slice(10))]
            const p = toSvg(e)
            if (b) insertBlock(b, p.x, p.y)
            return
        }
        if (data.startsWith('hmi-block:')) {
            e.preventDefault()
            const b = loadBlocks()[Number(data.slice(10))]
            const p = toSvg(e)
            if (b) insertBlock(b, p.x, p.y)
            return
        }
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
    let spaceDown = false
    svg.addEventListener('pointerdown', e => {
        stage.focus()
        const p = toSvg(e)
        // pan the zoomed screen: middle button, or Space + drag
        if (e.button === 1 || (spaceDown && e.button === 0)) {
            ed.drag = { mode: 'pan', cx: e.clientX, cy: e.clientY, pan: { ...ed.pan }, upp: unitsPerPx() }
            svg.setPointerCapture(e.pointerId)
            e.preventDefault()
            return
        }
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
            ed.drag = { mode: 'size', dir: e.target.closest('[data-handle]').getAttribute('data-handle'), start: p, x: s.x, y: s.y, w: s.w, h: s.h, pts: SYMBOLS[s.type].line ? linePoints(s) : null }
        } else {
            let g = e.target.closest('.hmi-symbol')
            // locked symbols are not picked on the screen (only in Camadas)
            if (g && (ed.symbols.find(m => m.id === g.getAttribute('data-id')) || {}).locked) g = null
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
                const orig = selection().filter(m => !m.locked).map(m => ({ m, x: m.x, y: m.y }))
                const bs = orig.map(q => box(q.m))
                const b0 = bs.length ? { x: Math.min(...bs.map(b => b.x)), y: Math.min(...bs.map(b => b.y)) } : null
                if (b0) { b0.w = Math.max(...bs.map(b => b.x + b.w)) - b0.x; b0.h = Math.max(...bs.map(b => b.y + b.h)) - b0.y }
                ed.drag = { mode: 'move', start: p, narrow, id, orig, b0, ids: new Set(orig.map(q => q.m.id)) }
                refresh()
            }
        }
        svg.setPointerCapture(e.pointerId)
        e.preventDefault()
    })
    svg.addEventListener('pointermove', e => {
        const d = ed.drag
        if (!d) return
        if (d.mode === 'pan') {
            ed.pan = { x: d.pan.x - (e.clientX - d.cx) * d.upp, y: d.pan.y - (e.clientY - d.cy) * d.upp }
            draw()
            return
        }
        const p = toSvg(e)
        if (d.mode === 'box') {
            d.cur = p
            const r = marquee(d)
            const hits = ed.symbols.filter(m => {
                if (m.locked || ed.hidden.has(m.id) || !here(m)) return false
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
            let dx = snap(lead.x + p.x - d.start.x) - lead.x
            let dy = snap(lead.y + p.y - d.start.y) - lead.y
            ed.guides = []
            if (guideBox.checked && d.b0 && !e.altKey) {
                // guides win over the grid on the axis where they hit (Alt turns them off while dragging)
                const g = guideSnap(d.b0, p.x - d.start.x, p.y - d.start.y, d.ids)
                if (g.hx) dx = g.dx
                if (g.hy) dy = g.dy
                ed.guides = g.guides
            }
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
            // lines and free shapes: scale the points into the new box
            if (d.pts) s.props.points = d.pts.map(q => [Math.round(q[0] * s.w / Math.max(1, d.w)), Math.round(q[1] * s.h / Math.max(1, d.h))])
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
        if ((ed.drag.mode === 'point' || (ed.drag.mode === 'size' && ed.drag.pts)) && s) normalizeLine(s)
        ed.drag = null
        ed.guides = []
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
            else if (k === 'a') { select(onScreen().map(m => m.id)); refresh() } else if (k === 'g' && e.shiftKey) ungroup()
            else if (k === 'g') group()
            else if (k === 'l' && ed.multi.length) setLocked(!selection().every(m => m.locked))
            else if (k === '0') { ed.zoom = 1; ed.pan = { x: 0, y: 0 }; draw() } else if (k === '=' || k === '+') zoomBy(1.25)
            else if (k === '-') zoomBy(1 / 1.25)
            else return
            e.preventDefault()
            e.stopPropagation()
            return
        }
        if (e.key === ' ') { spaceDown = true; stage.style.cursor = 'grab'; e.preventDefault(); return }
        const list = selection().filter(m => !m.locked)
        if (!list.length && e.key !== 'Escape') return
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
    stage.addEventListener('keyup', e => { if (e.key === ' ') { spaceDown = false; stage.style.cursor = '' } })
    stage.addEventListener('wheel', e => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            zoomBy(e.deltaY < 0 ? 1.15 : 1 / 1.15, toSvg(e))
        } else if (ed.zoom > 1) {
            e.preventDefault()
            const upp = unitsPerPx()
            ed.pan = { x: ed.pan.x + (e.shiftKey ? e.deltaY : e.deltaX) * upp, y: ed.pan.y + (e.shiftKey ? 0 : e.deltaY) * upp }
            draw()
        }
    }, { passive: false })
    gridBox.addEventListener('change', draw)

    Object.assign(api, {
        getSymbols: () => { if (ed.screens.length) pinScreens(); return clone(ed.symbols) },
        getScreens: () => [...ed.screens],
        redraw: draw,
        setMessage: (text) => { msg.textContent = text || '' },
        toggleFull: () => { root.classList.toggle('hmi-ed-full'); draw() },
        destroy: () => { document.removeEventListener('pointerdown', outside, true); root.innerHTML = '' }
    })
    showScreens()
    refresh()
    return api
}
