// Drag-and-drop screen editor. Plain DOM, no framework, so the same editor
// runs inside the Node-RED edit dialog and inside the dashboard page.
import { SYMBOLS, createSymbol, renderSymbol, injectStyles, linePoints } from '../symbols/index.js'

const GRID = 10
const CSS_ID = 'hmi-editor-style'
const clone = o => JSON.parse(JSON.stringify(o || []))
let clipboard = null // shared by every editor on the page

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
.hmi-ed-pal { cursor: grab; }
.hmi-ed-body { display: flex; min-height: 260px; flex: 1; overflow: hidden; }
.hmi-ed-stage { flex: 1; min-width: 0; padding: 8px; overflow: auto; outline: none; display: flex; align-items: flex-start; justify-content: center; }
.hmi-ed-stage svg { display: block; width: 100%; height: auto; box-shadow: 0 0 0 1px var(--hmi-ed-border); user-select: none; touch-action: none; }
.hmi-ed-full .hmi-ed-stage, .hmi-ed-fill .hmi-ed-stage { align-items: center; }
.hmi-ed-full .hmi-ed-stage svg, .hmi-ed-fill .hmi-ed-stage svg { width: 100%; height: 100%; box-shadow: none; }
.hmi-ed-stage .hmi-symbol { cursor: move; }
.hmi-ed-sel { fill: none; stroke: #1e88e5; stroke-width: 1.5; stroke-dasharray: 5 3; pointer-events: none; }
.hmi-ed-handle { fill: #1e88e5; stroke: #fff; stroke-width: 1; cursor: nwse-resize; }
.hmi-ed-grid { stroke: rgba(0, 0, 0, .08); stroke-width: 1; pointer-events: none; }
.hmi-theme-classic .hmi-ed-grid { stroke: rgba(255, 255, 255, .07); }
.hmi-ed-props { width: 230px; flex: none; padding: 8px 10px; border-left: 1px solid var(--hmi-ed-border); overflow: auto; background: var(--hmi-ed-panel); }
.hmi-ed-f { margin-bottom: 6px; }
.hmi-ed-f label { display: block; width: auto; margin: 0 0 2px 0; font-size: 12px; }
.hmi-ed-f input, .hmi-ed-f select { width: 100%; height: 30px; padding: 2px 6px; font: inherit; border: 1px solid var(--hmi-ed-border); border-radius: 4px; background: var(--hmi-ed-bg); color: var(--hmi-ed-text); margin: 0; }
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
    const ed = { symbols: clone(o.symbols), sel: null, drag: null, history: [], future: [] }
    ed.history.push(clone(ed.symbols))

    root.classList.add('hmi-ed')
    if (o.fill) root.classList.add('hmi-ed-fill')
    root.innerHTML = ''
    const toolbar = el('div', { class: 'hmi-ed-toolbar' })
    if (o.title) toolbar.appendChild(el('span', { class: 'hmi-ed-title' }, o.title))
    const palette = el('span', { class: 'hmi-ed-palette' })
    toolbar.appendChild(palette)
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
    const selected = () => ed.symbols.find(s => s.id === ed.sel)
    const changed = () => {
        ed.history.push(clone(ed.symbols))
        if (ed.history.length > 100) ed.history.shift()
        ed.future = []
        if (o.onChange) o.onChange(api)
    }
    function restore (list) {
        ed.symbols = clone(list)
        if (!selected()) ed.sel = null
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
        for (const s of ed.symbols) if (s.key && SYMBOLS[s.type] && !(s.key in previews)) previews[s.key] = s.key in live ? live[s.key] : SYMBOLS[s.type].preview
        const locale = o.getLocale && o.getLocale()
        const values = { ...live, ...previews }
        for (const s of ed.symbols) {
            const def = SYMBOLS[s.type]
            if (!def) continue
            const value = s.preview !== undefined ? s.preview : (s.key ? previews[s.key] : def.preview)
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
            out += '<g transform="translate(' + s.x + ',' + s.y + ')' + (rot ? ' rotate(' + rot + ',' + s.w / 2 + ',' + s.h / 2 + ')' : '') + '">' +
                '<rect class="hmi-ed-sel" x="-3" y="-3" width="' + (s.w + 6) + '" height="' + (s.h + 6) + '"/>' +
                '<rect class="hmi-ed-handle" data-handle="1" x="' + (s.w - 2) + '" y="' + (s.h - 2) + '" width="10" height="10"/></g>'
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
        } else {
            input = el('input', { type: type === 'number' ? 'number' : 'text' })
            input.value = value === undefined || value === null ? '' : value
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
        if (!s) {
            const h = el('div', { class: 'hmi-ed-hint' })
            h.innerHTML = 'Arraste um símbolo da barra de cima para a tela.<br><br>Clique num símbolo para editar. Arraste para mover e use o quadrado azul para redimensionar.<br><br>Teclas: Delete apaga, setas movem (Shift = 10), Ctrl+Z desfaz, Ctrl+C / Ctrl+V copiam, Ctrl+D duplica.'
            props.appendChild(h)
            return
        }
        const def = SYMBOLS[s.type]
        props.appendChild(el('h4', {}, def.label))
        const row = el('div', { class: 'hmi-ed-btnrow' })
        for (const [label, title, fn] of [['Duplicar', 'Ctrl+D', duplicate], ['Frente', 'Trazer para a frente', () => order(1)], ['Trás', 'Mandar para trás', () => order(-1)], ['Excluir', 'Delete', remove]]) {
            const b = el('button', { type: 'button', class: btnClass + ' hmi-ed-small', title }, label)
            b.addEventListener('click', fn)
            row.appendChild(b)
        }
        props.appendChild(row)
        props.appendChild(field('Chave do payload', s.key, 'text', v => { s.key = v.trim() }))
        props.appendChild(pair(field('X', s.x, 'number', v => { s.x = Number(v) || 0 }), field('Y', s.y, 'number', v => { s.y = Number(v) || 0 })))
        if (def.line) {
            props.appendChild(el('div', { class: 'hmi-ed-hint' }, 'Arraste os pontos brancos. Puxe o ponto azul do meio para criar uma curva; duplo clique num ponto apaga.'))
        } else {
            props.appendChild(pair(field('Largura', s.w, 'number', v => { s.w = Math.max(10, Number(v) || 10) }), field('Altura', s.h, 'number', v => { s.h = Math.max(10, Number(v) || 10) })))
            props.appendChild(field('Rotação', s.rot || 0, 'select', v => { s.rot = Number(v) }, [['0', '0°'], ['90', '90°'], ['180', '180°'], ['270', '270°']]))
        }
        for (const fd of def.fields) {
            props.appendChild(field(fd.label, s.props[fd.key], fd.type, v => { s.props[fd.key] = fd.type === 'number' && v !== '' ? Number(v) : v }, fd.options))
        }
        props.appendChild(field('Valor de teste (só no editor)', s.preview === undefined ? '' : String(s.preview), 'text', v => {
            const p = parsePreview(v)
            if (p === undefined) delete s.preview
            else s.preview = p
        }))
    }

    function refresh () { draw(); showProps() }

    function add (type, cx, cy) {
        const def = SYMBOLS[type]
        if (!def) return
        const s = createSymbol(type, snap(cx - def.w / 2), snap(cy - def.h / 2))
        ed.symbols.push(s)
        ed.sel = s.id
        refresh()
        changed()
    }

    function remove () {
        if (!ed.sel) return
        ed.symbols = ed.symbols.filter(s => s.id !== ed.sel)
        ed.sel = null
        refresh()
        changed()
    }

    function paste (src) {
        if (!src || !SYMBOLS[src.type]) return
        const c = createSymbol(src.type, src.x + 20, src.y + 20)
        Object.assign(c, clone(src), { id: c.id, x: src.x + 20, y: src.y + 20 })
        ed.symbols.push(c)
        ed.sel = c.id
        refresh()
        changed()
        return c
    }
    function duplicate () { paste(selected()) }
    function order (dir) {
        const i = ed.symbols.findIndex(s => s.id === ed.sel)
        if (i < 0) return
        const [s] = ed.symbols.splice(i, 1)
        if (dir > 0) ed.symbols.push(s)
        else ed.symbols.unshift(s)
        draw()
        changed()
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

    let lastGroup = null
    for (const [type, def] of Object.entries(SYMBOLS)) {
        if (def.group && def.group !== lastGroup) {
            palette.appendChild(el('span', { class: 'hmi-ed-palgroup' }, def.group))
            lastGroup = def.group
        }
        const b = el('button', { type: 'button', class: btnClass + ' hmi-ed-pal', draggable: 'true', title: 'Arraste para a tela ou clique' }, '+ ' + def.label)
        b.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', 'hmi:' + type) })
        b.addEventListener('click', () => { const v = view(); add(type, v.w / 2, v.h / 2) })
        palette.appendChild(b)
    }
    stage.addEventListener('dragover', e => { e.preventDefault() })
    stage.addEventListener('drop', e => {
        const data = e.dataTransfer.getData('text/plain') || ''
        if (!data.startsWith('hmi:')) return
        e.preventDefault()
        const p = toSvg(e)
        add(data.slice(4), p.x, p.y)
    })

    svg.addEventListener('pointerdown', e => {
        stage.focus()
        const p = toSvg(e)
        const pointEl = e.target.closest('[data-point], [data-mid]')
        if (pointEl && selected()) {
            const s = selected()
            let i = Number(pointEl.getAttribute('data-point'))
            if (pointEl.hasAttribute('data-mid')) {
                i = Number(pointEl.getAttribute('data-mid')) + 1
                const pts = linePoints(s)
                pts.splice(i, 0, [p.x - s.x, p.y - s.y])
                s.props.points = pts
            }
            if (e.detail === 2 && pointEl.hasAttribute('data-point') && linePoints(s).length > 2) {
                s.props.points = linePoints(s).filter((pt, k) => k !== i)
                normalizeLine(s)
                refresh()
                changed()
                return
            }
            ed.drag = { mode: 'point', i, start: p, moved: pointEl.hasAttribute('data-mid') }
        } else if (e.target.closest('[data-handle]')) {
            const s = selected()
            ed.drag = { mode: 'size', start: p, w: s.w, h: s.h }
        } else {
            const g = e.target.closest('.hmi-symbol')
            if (!g) { ed.sel = null; refresh(); return }
            ed.sel = g.getAttribute('data-id')
            const s = selected()
            ed.drag = { mode: 'move', start: p, x: s.x, y: s.y }
            refresh()
        }
        svg.setPointerCapture(e.pointerId)
        e.preventDefault()
    })
    svg.addEventListener('pointermove', e => {
        const d = ed.drag
        const s = selected()
        if (!d || !s) return
        const p = toSvg(e)
        if (d.mode === 'point') {
            const pts = linePoints(s)
            pts[d.i] = [snap(p.x) - s.x, snap(p.y) - s.y]
            s.props.points = pts
            s.w = Math.max(1, ...pts.map(q => q[0]))
            s.h = Math.max(1, ...pts.map(q => q[1]))
        } else if (d.mode === 'move') {
            s.x = snap(d.x + p.x - d.start.x)
            s.y = snap(d.y + p.y - d.start.y)
        } else {
            s.w = Math.max(20, snap(d.w + p.x - d.start.x))
            s.h = Math.max(20, snap(d.h + p.y - d.start.y))
        }
        d.moved = true
        draw()
    })
    const endDrag = () => {
        if (!ed.drag) return
        const moved = ed.drag.moved
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
            else if (k === 'c' && selected()) clipboard = clone(selected())
            else if (k === 'v' && clipboard) clipboard = paste(clipboard) || clipboard
            else if (k === 'd') duplicate()
            else return
            e.preventDefault()
            e.stopPropagation()
            return
        }
        const s = selected()
        if (!s) return
        const step = e.shiftKey ? 10 : 1
        const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
        if (e.key === 'Delete' || e.key === 'Backspace') remove()
        else if (moves[e.key]) { s.x += moves[e.key][0]; s.y += moves[e.key][1]; refresh(); changed() } else return
        e.preventDefault()
        e.stopPropagation()
    })
    gridBox.addEventListener('change', draw)

    Object.assign(api, {
        getSymbols: () => clone(ed.symbols),
        redraw: draw,
        setMessage: (text) => { msg.textContent = text || '' },
        toggleFull: () => { root.classList.toggle('hmi-ed-full'); draw() },
        destroy: () => { root.innerHTML = '' }
    })
    refresh()
    return api
}
