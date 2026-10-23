// Production-floor symbols: the coil winder, a multi-state status, a table and
// a timeline of states. Like more.js, index.js passes its helpers in, so this
// file imports nothing.

const COLORS = ['ok', 'alarm', 'warn', 'info', 'low', 'off', 'c0', 'c1', 'c2', 'c3', 'c4', 'c5']
const HEX = /^#[0-9a-fA-F]{3,8}$/

// "GIRANDO=Girando:ok, PARADA=Parada:alarm" -> [{ value: 'GIRANDO', text: 'Girando', color: 'ok' }, ...]
// the colour is a theme colour (ok, alarm, warn, info, low, off, c0..c5) or #hex
export function parseStates (text) {
    return String(text || '').split(/[,;\n]/).map(t => t.trim()).filter(Boolean).slice(0, 24).map(t => {
        const i = t.indexOf('=')
        const value = (i < 0 ? t : t.slice(0, i)).trim()
        let rest = i < 0 ? value : t.slice(i + 1).trim()
        let color = ''
        const j = rest.lastIndexOf(':')
        if (j >= 0) { color = rest.slice(j + 1).trim(); rest = rest.slice(0, j).trim() }
        if (!COLORS.includes(color) && !HEX.test(color)) color = 'off'
        return { value, text: rest || value, color }
    }).filter(s => s.value !== '')
}

// the state of a value: exact text first, then the same number (1 = "1.0"), true = "1"
export function stateOf (list, value) {
    if (value === undefined || value === null || value === '') return null
    const v = typeof value === 'boolean' ? (value ? '1' : '0') : String(value)
    return list.find(s => s.value === v) ||
        list.find(s => s.value.toLowerCase() === v.toLowerCase()) ||
        list.find(s => s.value !== '' && isFinite(Number(s.value)) && isFinite(Number(v)) && Number(s.value) === Number(v)) || null
}

// "campo:Rótulo:alinhamento:largura" -> [{ field, label, align, weight }]
export function parseColumns (text) {
    return String(text || '').split(/[,;\n]/).map(t => t.trim()).filter(Boolean).slice(0, 12).map(t => {
        const [field, label, align, weight] = t.split(':').map(x => (x || '').trim())
        return {
            field,
            label: label || field,
            align: ({ l: 'start', c: 'middle', r: 'end', d: 'end' })[String(align).charAt(0).toLowerCase()] || 'start',
            weight: Number(weight) > 0 ? Number(weight) : 1
        }
    }).filter(c => c.field)
}

// a date: epoch ms (or seconds), Date or text ("2026-10-21 08:30" is local time)
export function timeOf (v) {
    if (v === undefined || v === null || v === '') return null
    if (v instanceof Date) return isFinite(v.getTime()) ? v.getTime() : null
    if (typeof v === 'number') return isFinite(v) ? (Math.abs(v) < 1e11 ? v * 1000 : v) : null
    const s = String(v).trim()
    if (/^-?\d+(\.\d+)?$/.test(s)) return timeOf(Number(s))
    const t = Date.parse(/^\d{4}-\d\d-\d\d \d/.test(s) ? s.replace(' ', 'T') : s)
    return isFinite(t) ? t : null
}

// window of the timeline: the production day (from dayStart o'clock) or the last N hours
export function timelineWindow (p, now) {
    if (p.window === 'hours') {
        const hours = Math.max(1, Math.min(24 * 14, Number(p.hours) || 8))
        return { start: now - hours * 3600e3, end: now }
    }
    const start = new Date(now)
    const ds = Math.max(0, Math.min(23, Math.round(Number(p.dayStart) || 0)))
    start.setHours(ds, 0, 0, 0)
    if (start.getTime() > now) start.setDate(start.getDate() - 1)
    const end = new Date(start)
    end.setDate(end.getDate() + 1)
    return { start: start.getTime(), end: end.getTime() }
}

// 135 -> "2h 15", 40 -> "40 min"
export function durText (min) {
    const m = Math.max(0, Math.round(min))
    if (m < 60) return m + ' min'
    return Math.floor(m / 60) + 'h ' + String(m % 60).padStart(2, '0')
}

// Visible pieces of a timeline: a later segment is drawn over the earlier ones
// (e.g. the stops over the "not spinning" time), so each moment has one state.
// Returns [{ a, b, value, text, color }] cut to the window, in time order.
export function timelinePieces (segs, states, field, win, now) {
    const list = []
    ;(Array.isArray(segs) ? segs : []).forEach((sg, i) => {
        if (!sg || typeof sg !== 'object') return
        const a = timeOf(sg.ini !== undefined ? sg.ini : sg.start)
        let b = timeOf(sg.fim !== undefined ? sg.fim : sg.end)
        if (a === null) return
        if (b === null) b = Math.max(now, a)
        const ia = Math.max(a, win.start)
        const ib = Math.min(b, win.end)
        if (ib > ia) list.push({ a: ia, b: ib, i, value: sg[field] })
    })
    const cuts = [...new Set(list.flatMap(s => [s.a, s.b]))].sort((x, y) => x - y)
    const out = []
    for (let k = 0; k + 1 < cuts.length; k++) {
        const a = cuts[k]
        const b = cuts[k + 1]
        let top = null
        for (const s of list) if (s.a <= a && s.b >= b && (!top || s.i > top.i)) top = s
        if (!top) continue
        const last = out[out.length - 1]
        if (last && last.b === a && last.value === top.value) { last.b = b; continue }
        const st = stateOf(states, top.value)
        out.push({ a, b, value: top.value, text: st ? st.text : String(top.value === undefined || top.value === null ? '' : top.value), color: st ? st.color : 'off' })
    }
    return out
}

export function productionSymbols (H) {
    const { f, escapeXml, onState, formatValue, stateClass, labelBelow, faultMark, faultClass, fillKeys, ON_FIELDS, FAULT_FIELD, PRIORITY_FIELD } = H

    const LABEL = { key: 'label', label: 'Legenda', type: 'text' }
    const TITLE = { key: 'title', label: 'Título', type: 'text' }
    const STATES = { key: 'states', label: 'Estados (valor=Texto:cor). Cores: ok, alarm, warn, info, low, off, c0..c5 ou #hex', type: 'text' }
    const rect = (cls, x, y, w, h, rx, extra) => `<rect class="${cls}" x="${f(x)}" y="${f(y)}" width="${f(Math.max(0, w))}" height="${f(Math.max(0, h))}"${rx ? ` rx="${f(rx)}"` : ''}${extra || ''}/>`
    const circle = (cls, cx, cy, r) => `<circle class="${cls}" cx="${f(cx)}" cy="${f(cy)}" r="${f(Math.max(0, r))}"/>`
    const path = (cls, d) => `<path class="${cls}" d="${d}"/>`
    const txt = (cls, x, y, t, size, anchor) => `<text class="${cls}" x="${f(x)}" y="${f(y)}" font-size="${f(size)}"${anchor ? ` style="text-anchor:${anchor}"` : ''}>${escapeXml(t)}</text>`
    // colour of a state: a class for theme colours, an inline style for #hex
    const fillOf = c => HEX.test(c) ? { cls: '', style: ` style="fill:${c}"` } : { cls: ' hmi-st-' + c, style: '' }
    const strokeOf = c => HEX.test(c) ? { cls: '', style: `stroke:${c};` } : { cls: ' hmi-stb-' + c, style: '' }
    // cut a text to about n characters
    const fit = (t, n) => { const s = String(t); return s.length > n ? s.slice(0, Math.max(1, n - 1)) + '…' : s }

    // ---------- Bobinadeira (front view, as the BT winders) ----------
    // cabinet with the HMI centred on a post (e-stop and potentiometer under the
    // screen), spindle with the coil, pneumatic tailstock and, in front, the wire
    // spreader that runs left and right along its rail while the machine winds
    function renderWinder (sym, value, opts) {
        const p = sym.props || {}
        const { w, h } = sym
        const on = onState(value, p)
        const s = Math.min(w, h)
        const gid = 'hmi-wd-' + String(sym.id || 'x').replace(/[^\w-]/g, '')
        const tone = ['theme', 'machine'].includes(p.tone) ? p.tone : 'slitter'
        const metal = tone === 'slitter' ? `url(#${gid}-m)` : ''
        const ay = h * 0.42
        const cx0 = w * 0.43
        const cx1 = w * 0.71
        const ch = h * 0.24
        const turns = []
        const step = Math.max(4, (cx1 - cx0) / Math.max(6, Math.round((cx1 - cx0) / 7)))
        for (let x = cx0 + step / 2; x < cx1; x += step) turns.push(`M${f(x)} ${f(ay - ch / 2 + 1)}V${f(ay + ch / 2 - 1)}`)
        const fillM = metal ? ` style="fill:${metal}"` : ''
        const R = (cls, x, y, ww, hh, rx) => rect(cls, x, y, ww, hh, rx, cls.includes('hmi-wd-metal') ? fillM : '')
        // HMI box centred over the cabinet
        const cabX = w * 0.02
        const cabW = w * 0.28
        const cx = cabX + cabW / 2
        const hw = w * 0.19
        const hx = cx - hw / 2
        const hy = h * 0.015
        const hh = h * 0.27
        const ix = s * 0.045
        const hmi =
            R('hmi-wd-dark', cx - w * 0.012, hy + hh, w * 0.024, h * 0.3 - hy - hh) +
            R('hmi-wd-box', hx, hy, hw, hh, 3) +
            rect('hmi-wd-screen', hx + hw * 0.1, hy + hh * 0.08, hw * 0.8, hh * 0.46, 1.5) +
            // e-stop (yellow ring, red mushroom) and potentiometer, under the screen
            circle('hmi-wd-ering', hx + hw * 0.3, hy + hh * 0.78, ix * 1.15) +
            circle('hmi-wd-estop', hx + hw * 0.3, hy + hh * 0.78, ix * 0.78) +
            circle('hmi-wd-pot', hx + hw * 0.7, hy + hh * 0.78, ix * 0.55) +
            path('hmi-wd-potmark', `M${f(hx + hw * 0.7)} ${f(hy + hh * 0.78)}L${f(hx + hw * 0.7 + ix * 0.36)} ${f(hy + hh * 0.78 - ix * 0.36)}`) +
            path('hmi-wd-scale', `M${f(hx + hw * 0.7 - ix * 0.72)} ${f(hy + hh * 0.78 + ix * 0.55)}A${f(ix * 0.9)} ${f(ix * 0.9)} 0 1 1 ${f(hx + hw * 0.7 + ix * 0.72)} ${f(hy + hh * 0.78 + ix * 0.55)}`)
        // spreader: carriage on a rail in front, wire up to the coil; it travels across the coil
        const railY = h * 0.8
        const sw = w * 0.07
        const travel = Math.max(0, cx1 - cx0 - sw)
        const spreader = p.wire === 'no' ? '' :
            R('hmi-wd-dark', w * 0.34, railY, w * 0.6, h * 0.035, 1) +
            rect('hmi-wd-stop', w * 0.34, railY - h * 0.02, w * 0.012, h * 0.075) + rect('hmi-wd-stop', w * 0.928, railY - h * 0.02, w * 0.012, h * 0.075) +
            `<g class="hmi-wd-spread" style="--wd-travel:${f(travel)}px"><g transform="translate(${f(cx0)},0)">` +
            path('hmi-wd-wire', `M${f(sw / 2)} ${f(railY - h * 0.07)}L${f(sw / 2)} ${f(ay + ch / 2)}`) +
            rect('hmi-wd-carriage', 0, railY - h * 0.08, sw, h * 0.09, 2) +
            circle('hmi-wd-guide', sw / 2, railY - h * 0.065, Math.max(1.5, s * 0.014)) +
            '</g></g>'
        const defs = metal ? `<defs><linearGradient id="${gid}-m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6a737d"/><stop offset="1" stop-color="#4d555e"/></linearGradient>` +
            `<linearGradient id="${gid}-c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d08a4e"/><stop offset=".5" stop-color="#b87333"/><stop offset="1" stop-color="#7c4a20"/></linearGradient></defs>` : ''
        const coilFill = metal ? ` style="fill:url(#${gid}-c)"` : ''
        const body = defs +
            // cabinet (headstock): panel seams and vents
            R('hmi-wd-metal hmi-wd-cab', cabX, h * 0.3, cabW, h * 0.66, 2) +
            path('hmi-wd-seam', `M${f(cabX + cabW * 0.08)} ${f(h * 0.36)}H${f(cabX + cabW * 0.92)}V${f(h * 0.9)}H${f(cabX + cabW * 0.08)}Z`) +
            path('hmi-wd-vent', [0, 1, 2, 3].map(i => `M${f(cabX + cabW * 0.3)} ${f(h * (0.74 + i * 0.035))}H${f(cabX + cabW * 0.7)}`).join('')) +
            hmi +
            // bed, legs and lower beam
            R('hmi-wd-metal', w * 0.32, h * 0.66, w * 0.035, h * 0.3) +
            R('hmi-wd-metal', w * 0.9, h * 0.66, w * 0.035, h * 0.3) +
            R('hmi-wd-metal', w * 0.3, h * 0.9, w * 0.66, h * 0.05) +
            R('hmi-wd-dark', w * 0.3, h * 0.6, w * 0.66, h * 0.06, 1) +
            // tailstock: plate on a post, pneumatic cylinder and its hose
            R('hmi-wd-metal', w * 0.865, h * 0.52, w * 0.03, h * 0.08) +
            R('hmi-wd-metal hmi-wd-tail', w * 0.84, h * 0.22, w * 0.08, h * 0.32, 2) +
            R('hmi-wd-dark', w * 0.92, h * 0.36, w * 0.06, h * 0.07, 1) +
            rect('hmi-wd-rod', w * 0.98, h * 0.385, w * 0.015, h * 0.02) +
            path('hmi-wd-hose', `M${f(w * 0.95)} ${f(h * 0.43)}Q${f(w * 0.96)} ${f(h * 0.58)} ${f(w * 0.9)} ${f(h * 0.58)}`) +
            // spindle: shaft, chuck, mandrel, coil with its turns, live centre
            R('hmi-wd-dark', w * 0.3, ay - h * 0.018, w * 0.54, h * 0.036) +
            R('hmi-wd-dark hmi-wd-chuck', w * 0.3, ay - h * 0.08, w * 0.055, h * 0.16, 2) +
            path('hmi-wd-jaw', `M${f(w * 0.315)} ${f(ay - h * 0.08)}V${f(ay + h * 0.08)}M${f(w * 0.34)} ${f(ay - h * 0.08)}V${f(ay + h * 0.08)}`) +
            rect('hmi-wd-mandrel', w * 0.355, ay - h * 0.045, w * 0.45, h * 0.09, 2) +
            `<rect class="hmi-wd-coil" x="${f(cx0)}" y="${f(ay - ch / 2)}" width="${f(cx1 - cx0)}" height="${f(ch)}" rx="3"${coilFill}/>` +
            `<g class="hmi-wd-turns-g${p.dir === 'ccw' ? ' hmi-ccw' : ''}">${path('hmi-wd-turns', turns.join(''))}</g>` +
            rect('hmi-wd-flange', cx0 - w * 0.008, ay - ch / 2 - h * 0.02, w * 0.008, ch + h * 0.04) +
            rect('hmi-wd-flange', cx1, ay - ch / 2 - h * 0.02, w * 0.008, ch + h * 0.04) +
            path('hmi-wd-centre', `M${f(w * 0.805)} ${f(ay - h * 0.04)}L${f(w * 0.84)} ${f(ay)}L${f(w * 0.805)} ${f(ay + h * 0.04)}Z`) +
            spreader
        return `<g class="hmi-eq hmi-winder hmi-tone-${tone} ${stateClass(on)}${faultClass(p, opts)}">${body}${faultMark(p, opts, w)}${labelBelow(p, w, h)}</g>`
    }

    // ---------- Status with several states ----------
    function renderStateChip (sym, value, opts) {
        const p = sym.props || {}
        const { w, h } = sym
        const list = parseStates(p.states)
        let st = stateOf(list, value)
        if (!st && opts && opts.editor && (value === undefined || value === null)) st = list[0] || null
        const known = value !== undefined && value !== null && value !== ''
        const text = st ? st.text : (known ? (p.other ? p.other : String(value)) : (p.unknown || '—'))
        const color = st ? st.color : 'off'
        const fl = fillOf(color)
        const sk = strokeOf(color)
        const solid = p.look === 'solid'
        const sub = p.sub ? fillKeys(p.sub, opts) : ''
        const size = Math.max(9, Math.min(h * (sub ? 0.34 : 0.46), 22))
        const r = Math.min(h * 0.18, 8)
        const blink = st && p.blink && p.blink !== 'no' && (p.blink === 'all' || p.blink === color) ? ' hmi-blink' : ''
        return `<g class="hmi-statechip${solid ? ' hmi-solid' : ''}${known ? '' : ' hmi-unknown'}${blink}">` +
            `<rect class="hmi-sc-box${solid ? fl.cls : sk.cls}" x="1" y="1" width="${f(w - 2)}" height="${f(h - 2)}" rx="${f(Math.min(h / 2, 6))}"` +
            `${solid ? fl.style : (sk.style ? ` style="${sk.style}"` : '')}/>` +
            (solid ? '' : `<circle class="hmi-sc-dot${fl.cls}" cx="${f(h * 0.42)}" cy="${f(h / 2)}" r="${f(r)}"${fl.style}/>`) +
            txt('hmi-sc-text', solid ? w / 2 : h * 0.42 + r + 8, sub ? h * 0.36 : h / 2, text, size, solid ? 'middle' : 'start') +
            (sub ? txt('hmi-sc-sub', solid ? w / 2 : h * 0.42 + r + 8, h * 0.72, sub, Math.max(8, size * 0.62), solid ? 'middle' : 'start') : '') +
            labelBelow(p, w, h) + '</g>'
    }

    // ---------- Table (rows from a list) ----------
    const SAMPLE_ROWS = [
        { hora: '07:42', operador: 'Ana', espiras: 412, camadas: 8 },
        { hora: '07:05', operador: 'Ana', espiras: 410, camadas: 8 },
        { hora: '06:21', operador: 'João', espiras: 398, camadas: 7 }
    ]
    function cellText (v, col, p, opts) {
        if (v === undefined || v === null || v === '') return '—'
        if (typeof v === 'boolean') return v ? 'Sim' : 'Não'
        if (typeof v === 'number') return formatValue(v, p.decimals, opts.locale)
        return String(v)
    }
    function renderTable (sym, value, opts) {
        const p = sym.props || {}
        const { w, h } = sym
        let rows = Array.isArray(value) ? value : []
        let cols = parseColumns(p.columns)
        if (!cols.length && rows.length && rows[0] && typeof rows[0] === 'object') {
            cols = Object.keys(Array.isArray(rows[0]) ? rows[0].map((x, i) => i) : rows[0]).slice(0, 8).map(k => ({ field: String(k), label: String(k), align: 'start', weight: 1 }))
        }
        if (opts && opts.editor && !rows.length) rows = SAMPLE_ROWS
        if (!cols.length) cols = [{ field: 'hora', label: 'Hora', align: 'start', weight: 1 }, { field: 'operador', label: 'Operador', align: 'start', weight: 2 }, { field: 'espiras', label: 'Espiras', align: 'end', weight: 1 }]
        const states = parseStates(p.states)
        const rowH = Math.max(14, Number(p.rowH) || 26)
        const top = p.title ? 26 : 4
        const headH = p.header === 'no' ? 0 : Math.max(16, rowH * 0.8)
        const fits = Math.max(0, Math.floor((h - top - headH - 4) / rowH))
        const max = Number(p.rows) > 0 ? Math.min(fits, Number(p.rows)) : fits
        const shown = rows.slice(0, max)
        const pad = 8
        const mark = states.length && p.colorField ? Math.min(12, rowH * 0.4) : 0
        const total = cols.reduce((a, c) => a + c.weight, 0)
        const xs = []
        let x = pad + (mark ? mark + 6 : 0)
        const inner = w - x - pad
        cols.forEach(c => { const cw = inner * c.weight / total; xs.push({ x, w: cw }); x += cw })
        const size = Math.max(9, Math.min(15, rowH * 0.5))
        let out = `<g class="hmi-table">${rect('hmi-kpi-card', 0.5, 0.5, w - 1, h - 1, 6)}`
        if (p.title) out += txt('hmi-ch-title', 10, 16, p.title, 12)
        if (headH) {
            cols.forEach((c, i) => {
                const ax = c.align === 'end' ? xs[i].x + xs[i].w - 4 : (c.align === 'middle' ? xs[i].x + xs[i].w / 2 : xs[i].x)
                out += txt('hmi-tb-head', ax, top + headH / 2, fit(c.label.toUpperCase(), Math.floor(xs[i].w / (size * 0.62))), Math.max(8, size * 0.8), c.align)
            })
            out += path('hmi-ch-axis', `M${f(pad)} ${f(top + headH)}H${f(w - pad)}`)
        }
        shown.forEach((row, r) => {
            const y = top + headH + r * rowH
            if (r % 2 === 1) out += rect('hmi-tb-zebra', 2, y, w - 4, rowH)
            const get = k => (row && typeof row === 'object' ? row[Array.isArray(row) ? Number(k) : k] : (k === cols[0].field ? row : undefined))
            const st = mark ? stateOf(states, get(p.colorField)) : null
            if (mark) {
                const fl = fillOf(st ? st.color : 'off')
                out += `<rect class="hmi-tb-mark${fl.cls}" x="${f(pad)}" y="${f(y + (rowH - mark) / 2)}" width="${f(mark)}" height="${f(mark)}" rx="2"${fl.style}/>`
            }
            cols.forEach((c, i) => {
                const raw = get(c.field)
                let t = cellText(raw, c, p, opts)
                if (st && c.field === p.colorField) t = st.text
                const ax = c.align === 'end' ? xs[i].x + xs[i].w - 4 : (c.align === 'middle' ? xs[i].x + xs[i].w / 2 : xs[i].x)
                out += txt('hmi-tb-cell' + (st && c.field === p.colorField ? fillOf(st.color).cls : ''), ax, y + rowH / 2, fit(t, Math.max(2, Math.floor(xs[i].w / (size * 0.56)))), size, c.align)
            })
        })
        if (!shown.length) out += txt('hmi-tb-empty', w / 2, top + headH + Math.min(rowH, (h - top - headH) / 2), p.empty || 'Nenhum registro', size, 'middle')
        else if (rows.length > shown.length && p.more !== 'no') out += txt('hmi-tb-empty', w - pad, h - 6, '+' + (rows.length - shown.length), Math.max(8, size * 0.75), 'end')
        return out + '</g>'
    }

    // ---------- Timeline of states ----------
    function sampleSegments (win, now) {
        const out = []
        const states = ['GIRANDO', 'PARADA', 'GIRANDO', 'ALMOCO', 'GIRANDO', 'INTERVALO_15MIN', 'GIRANDO']
        const span = Math.min(now, win.end) - win.start
        let t = win.start + span * 0.05
        states.forEach((e, i) => {
            const len = span * [0.22, 0.06, 0.18, 0.08, 0.2, 0.03, 0.18][i]
            out.push({ ini: t, fim: t + len, estado: e })
            t += len
        })
        return out
    }
    function renderTimeline (sym, value, opts) {
        const p = sym.props || {}
        const { w, h } = sym
        const now = (opts && opts.now) || Date.now()
        const win = timelineWindow(p, now)
        const span = win.end - win.start
        const states = parseStates(p.states)
        const sf = p.stateField || 'estado'
        let segs = Array.isArray(value) ? value : []
        if (opts && opts.editor && !segs.length) segs = sampleSegments(win, now)
        const labelW = p.label ? Math.max(30, Number(p.labelW) || Math.min(110, w * 0.16)) : 0
        const legend = p.legend === 'no' ? '' : p.legend
        const top = p.title ? 24 : (legend ? 22 : 4)
        const axis = p.axis !== 'no'
        const bottom = axis ? 18 : 4
        const x0 = 6 + labelW
        const x1 = w - 8
        const bh = Math.max(4, h - top - bottom)
        const X = t => x0 + (Math.max(win.start, Math.min(win.end, t)) - win.start) / span * (x1 - x0)
        const totals = {}
        let out = `<g class="hmi-timeline">`
        if (p.card !== 'no') out += rect('hmi-kpi-card', 0.5, 0.5, w - 1, h - 1, 6)
        if (p.title) out += txt('hmi-ch-title', 10, 16, p.title, 12)
        if (labelW) out += txt('hmi-tl-label', 8, top + bh / 2, fit(fillKeys(p.label, opts), Math.floor(labelW / 7.5)), Math.max(9, Math.min(15, bh * 0.5)), 'start')
        out += rect('hmi-tl-track', x0, top, x1 - x0, bh, 2)
        for (const pc of timelinePieces(segs, states, sf, win, now)) {
            const name = pc.text
            if (pc.b > pc.a) totals[name] = { color: pc.color, min: ((totals[name] && totals[name].min) || 0) + (Math.min(pc.b, now) - pc.a) / 60000 }
            const fl = fillOf(pc.color)
            const xa = X(pc.a)
            const xb = X(pc.b)
            out += `<rect class="hmi-tl-seg${fl.cls}" x="${f(xa)}" y="${f(top)}" width="${f(Math.max(0.8, xb - xa))}" height="${f(bh)}"${fl.style}><title>${escapeXml(name + ' · ' + durText((pc.b - pc.a) / 60000))}</title></rect>`
        }
        if (now > win.start && now < win.end) {
            out += rect('hmi-tl-future', X(now), top, x1 - X(now), bh)
            if (p.nowMark !== 'no') out += path('hmi-tl-now', `M${f(X(now))} ${f(top - 3)}V${f(top + bh + 3)}`)
        }
        if (axis) {
            const hours = span / 3600e3
            const every = Math.max(1, Number(p.tick) || (hours <= 8 ? 1 : ((x1 - x0) / hours > 40 ? 2 : ((x1 - x0) / hours > 18 ? 4 : 6))))
            const first = new Date(win.start)
            first.setMinutes(0, 0, 0)
            if (first.getTime() < win.start) first.setHours(first.getHours() + 1)
            for (let t = first.getTime(), i = 0; t <= win.end && i < 400; t += 3600e3, i++) {
                const hr = new Date(t).getHours()
                if ((hr - new Date(win.start).getHours() + 48) % every) continue
                const x = X(t)
                out += path('hmi-tl-tick', `M${f(x)} ${f(top + bh)}V${f(top + bh + 3)}`) +
                    txt('hmi-tl-hour', Math.min(x1 - 8, Math.max(x0 + 8, x)), top + bh + 12, String(hr).padStart(2, '0') + 'h', 10, 'middle')
            }
        }
        if (legend) {
            const items = legend === 'totals' ? Object.entries(totals).map(([n, t]) => ({ text: n + ' ' + durText(t.min), color: t.color })) : states.map(s => ({ text: s.text, color: s.color }))
            let lx = x1
            for (const it of items.reverse()) {
                const tw = it.text.length * 6.2 + 18
                if (lx - tw < (p.title ? 10 + p.title.length * 7.5 : x0)) break
                lx -= tw
                const fl = fillOf(it.color)
                out += `<rect class="hmi-tl-dot${fl.cls}" x="${f(lx)}" y="${f(top / 2 - 5)}" width="10" height="10" rx="2"${fl.style}/>` + txt('hmi-tl-legend', lx + 14, top / 2, it.text, 11, 'start')
            }
        }
        return out + '</g>'
    }

    const WINDOW_FIELDS = [
        { key: 'window', label: 'Período', type: 'select', options: [['day', 'Dia de produção'], ['hours', 'Últimas horas']], refresh: true },
        { key: 'dayStart', label: 'O dia começa às (hora)', type: 'number', when: p => p.window !== 'hours' },
        { key: 'hours', label: 'Quantas horas', type: 'number', when: p => p.window === 'hours' }
    ]

    return {
        winder: {
            label: 'Bobinadeira',
            group: 'Fábrica',
            w: 360,
            h: 200,
            preview: 1,
            defaults: { label: '', onWhen: 'nonzero', threshold: 0, invert: 'no', faultKey: '', priority: '1', tone: 'slitter', wire: 'yes', dir: 'cw' },
            fields: [
                LABEL, ...ON_FIELDS,
                { key: 'tone', label: 'Cores', type: 'select', options: [['slitter', 'Metal'], ['machine', 'Da máquina (azul e vermelho)'], ['theme', 'Do tema']] },
                { key: 'wire', label: 'Espalhador do fio (corre de um lado para o outro girando)', type: 'select', options: [['yes', 'Sim'], ['no', 'Não']] },
                { key: 'dir', label: 'Sentido', type: 'select', options: [['cw', 'Horário'], ['ccw', 'Anti-horário']] },
                FAULT_FIELD, PRIORITY_FIELD
            ],
            render: renderWinder
        },
        stateChip: {
            label: 'Status (vários estados)',
            group: 'Estados',
            w: 220,
            h: 40,
            preview: 'GIRANDO',
            defaults: { states: 'GIRANDO=GIRANDO:ok, PARADA=PARADA:alarm, ALMOCO=ALMOÇO:info, INTERVALO_15MIN=15 MIN:warn, SEM_SINAL=SEM SINAL:off', other: '', unknown: 'SEM DADOS', sub: '', look: 'outline', blink: 'no', label: '' },
            fields: [
                STATES,
                { key: 'other', label: 'Texto para valor fora da lista (vazio = o próprio valor)', type: 'text' },
                { key: 'unknown', label: 'Texto sem valor', type: 'text' },
                { key: 'sub', label: 'Linha de baixo ({chave} mostra um valor)', type: 'text' },
                { key: 'look', label: 'Aparência', type: 'select', options: [['outline', 'Contorno com LED'], ['solid', 'Fundo colorido']] },
                { key: 'blink', label: 'Piscar', type: 'select', options: [['no', 'Não'], ['alarm', 'Nos estados vermelhos'], ['warn', 'Nos estados amarelos'], ['all', 'Sempre']] },
                LABEL
            ],
            render: renderStateChip
        },
        table: {
            label: 'Tabela (lista)',
            group: 'Valores',
            w: 420,
            h: 200,
            preview: undefined,
            defaults: { title: 'ÚLTIMAS BOBINAS', columns: 'hora:Hora, operador:Operador::2, espiras:Espiras:r, camadas:Camadas:r', rowH: 26, rows: '', decimals: '', header: 'yes', empty: 'Nenhum registro', colorField: '', states: '', more: 'yes' },
            fields: [
                TITLE,
                { key: 'columns', label: 'Colunas (campo:Rótulo:alinhamento l/c/r:largura)', type: 'text' },
                { key: 'rowH', label: 'Altura da linha', type: 'number' },
                { key: 'rows', label: 'Máximo de linhas (vazio = as que couberem)', type: 'number' },
                { key: 'decimals', label: 'Casas decimais', type: 'number' },
                { key: 'header', label: 'Cabeçalho', type: 'select', options: [['yes', 'Sim'], ['no', 'Não']] },
                { key: 'empty', label: 'Texto sem linhas', type: 'text' },
                { key: 'colorField', label: 'Campo que dá a cor da linha (opcional)', type: 'text' },
                { ...STATES, when: p => !!p.colorField },
                { key: 'more', label: 'Mostrar quantas linhas ficaram de fora', type: 'select', options: [['yes', 'Sim'], ['no', 'Não']] }
            ],
            render: renderTable
        },
        timeline: {
            label: 'Linha do tempo de estados',
            group: 'Gráficos',
            w: 640,
            h: 70,
            preview: undefined,
            defaults: { title: '', label: '', labelW: '', states: 'GIRANDO=Girando:ok, PARADA=Parada:alarm, ALMOCO=Almoço:info, INTERVALO_15MIN=15 min:warn, OCIOSA=Sem giro:off', stateField: 'estado', window: 'day', dayStart: 5, hours: 8, tick: '', axis: 'yes', legend: 'states', nowMark: 'yes', card: 'yes' },
            fields: [
                TITLE,
                { key: 'label', label: 'Nome à esquerda ({chave} mostra um valor)', type: 'text' },
                { key: 'labelW', label: 'Largura do nome', type: 'number' },
                STATES,
                { key: 'stateField', label: 'Campo do estado em cada trecho', type: 'text' },
                ...WINDOW_FIELDS,
                { key: 'tick', label: 'Marca a cada (horas, vazio = automático)', type: 'number' },
                { key: 'axis', label: 'Horas embaixo', type: 'select', options: [['yes', 'Sim'], ['no', 'Não']] },
                { key: 'legend', label: 'Legenda', type: 'select', options: [['states', 'Estados'], ['totals', 'Estados com o tempo de cada um'], ['no', 'Não']] },
                { key: 'nowMark', label: 'Marca de agora', type: 'select', options: [['yes', 'Sim'], ['no', 'Não']] },
                { key: 'card', label: 'Fundo de cartão', type: 'select', options: [['yes', 'Sim'], ['no', 'Não']] }
            ],
            render: renderTimeline
        }
    }
}

const ST_VARS = { ok: '--hmi-ok', alarm: '--hmi-alarm', warn: '--hmi-warn', info: '--hmi-info', low: '--hmi-low', off: '--hmi-equip', c0: '--hmi-ch0', c1: '--hmi-ch1', c2: '--hmi-ch2', c3: '--hmi-ch3', c4: '--hmi-ch4', c5: '--hmi-ch5' }

export const PRODUCTION_CSS = `
.hmi-root .hmi-statechip .hmi-sc-box { fill: var(--hmi-tag-bg); stroke: var(--hmi-line); stroke-width: 2; }
.hmi-root .hmi-statechip.hmi-unknown .hmi-sc-box { stroke-dasharray: 5 3; }
.hmi-root .hmi-sc-text { fill: var(--hmi-text); font-weight: 800; letter-spacing: .4px; dominant-baseline: central; }
.hmi-root .hmi-sc-sub { fill: var(--hmi-text-dim); font-weight: 600; dominant-baseline: central; }
.hmi-root .hmi-statechip.hmi-solid .hmi-sc-box { stroke: none; }
.hmi-root .hmi-statechip.hmi-solid .hmi-sc-box.hmi-st-off { fill: var(--hmi-tag-bg); stroke: var(--hmi-line); stroke-width: 1; }
.hmi-root .hmi-statechip.hmi-solid:not(:has(.hmi-st-off)) .hmi-sc-text, .hmi-root .hmi-statechip.hmi-solid:not(:has(.hmi-st-off)) .hmi-sc-sub { fill: #111; }
.hmi-root .hmi-tb-head { fill: var(--hmi-text-dim); font-weight: 700; letter-spacing: .5px; dominant-baseline: central; }
.hmi-root .hmi-tb-cell { fill: var(--hmi-text); dominant-baseline: central; }
.hmi-root .hmi-tb-cell[class*="hmi-st-"] { font-weight: 700; }
.hmi-root .hmi-tb-zebra { fill: var(--hmi-text); fill-opacity: .04; }
.hmi-root .hmi-tb-empty { fill: var(--hmi-text-dim); dominant-baseline: central; }
.hmi-root .hmi-tl-track { fill: var(--hmi-bg); stroke: var(--hmi-line); stroke-width: .8; }
.hmi-root .hmi-tl-future { fill: var(--hmi-bg); opacity: .55; }
.hmi-root .hmi-tl-now { stroke: var(--hmi-text); stroke-width: 1.5; }
.hmi-root .hmi-tl-tick { stroke: var(--hmi-line); stroke-width: 1; }
.hmi-root .hmi-tl-hour, .hmi-root .hmi-tl-legend { fill: var(--hmi-text-dim); dominant-baseline: central; }
.hmi-root .hmi-tl-label { fill: var(--hmi-text); font-weight: 700; dominant-baseline: central; }
.hmi-root .hmi-winder .hmi-wd-metal, .hmi-root .hmi-winder .hmi-wd-box { fill: var(--hmi-equip); stroke: var(--hmi-stroke); stroke-width: 1.2; }
.hmi-root .hmi-winder .hmi-wd-dark, .hmi-root .hmi-winder .hmi-wd-stop { fill: var(--hmi-dark); stroke: var(--hmi-stroke); stroke-width: 1; }
.hmi-root .hmi-winder .hmi-wd-screen { fill: #050607; stroke: #3a4148; stroke-width: .8; }
.hmi-root .hmi-winder .hmi-wd-ering { fill: #f2c200; stroke: #8a6d00; stroke-width: 1; }
.hmi-root .hmi-winder .hmi-wd-estop { fill: #d71920; stroke: #7f0d10; stroke-width: 1; }
.hmi-root .hmi-winder .hmi-wd-pot { fill: #1d2126; stroke: var(--hmi-stroke); stroke-width: 1; }
.hmi-root .hmi-winder .hmi-wd-potmark { fill: none; stroke: #e8edf1; stroke-width: 1.6; stroke-linecap: round; }
.hmi-root .hmi-winder .hmi-wd-scale { fill: none; stroke: var(--hmi-text-dim); stroke-width: 1; stroke-dasharray: 2 2; }
.hmi-root .hmi-winder .hmi-wd-seam { fill: none; stroke: var(--hmi-stroke); stroke-width: .8; opacity: .55; }
.hmi-root .hmi-winder .hmi-wd-vent { fill: none; stroke: var(--hmi-dark); stroke-width: 2; stroke-linecap: round; }
.hmi-root .hmi-winder .hmi-wd-jaw { fill: none; stroke: var(--hmi-stroke); stroke-width: 1; opacity: .7; }
.hmi-root .hmi-winder .hmi-wd-rod { fill: var(--hmi-stroke); }
.hmi-root .hmi-winder .hmi-wd-mandrel { fill: var(--hmi-tag-bg); stroke: var(--hmi-stroke); stroke-width: .8; }
.hmi-root .hmi-winder .hmi-wd-coil { fill: var(--hmi-material); stroke: var(--hmi-stroke); stroke-width: 1; }
.hmi-root .hmi-winder .hmi-wd-flange { fill: var(--hmi-dark); stroke: var(--hmi-stroke); stroke-width: .8; }
.hmi-root .hmi-winder .hmi-wd-turns { fill: none; stroke: var(--hmi-stroke); stroke-width: 1.6; stroke-dasharray: 6 10; opacity: .7; }
.hmi-root .hmi-winder .hmi-wd-centre { fill: var(--hmi-stroke); }
.hmi-root .hmi-winder .hmi-wd-hose { fill: none; stroke: var(--hmi-info); stroke-width: 2; }
.hmi-root .hmi-winder .hmi-wd-carriage { fill: var(--hmi-warn); stroke: var(--hmi-stroke); stroke-width: 1; }
.hmi-root .hmi-winder .hmi-wd-guide { fill: var(--hmi-dark); stroke: var(--hmi-stroke); stroke-width: 1; }
.hmi-root .hmi-winder .hmi-wd-wire { fill: none; stroke: var(--hmi-text); stroke-width: 1.4; stroke-dasharray: 8 4; opacity: .85; }
.hmi-root .hmi-winder.hmi-unknown .hmi-wd-cab { stroke-dasharray: 5 3; }
.hmi-root .hmi-winder.hmi-fault .hmi-wd-cab { stroke: var(--hmi-alarm); stroke-width: 2.5; }
.hmi-root .hmi-winder.hmi-tone-slitter .hmi-wd-metal { stroke: #8a939d; }
.hmi-root .hmi-winder.hmi-tone-slitter .hmi-wd-box { fill: #2a2f36; stroke: #b5bfc8; }
.hmi-root .hmi-winder.hmi-tone-slitter :is(.hmi-wd-dark, .hmi-wd-stop, .hmi-wd-flange) { fill: #3a4148; stroke: #7a838c; }
.hmi-root .hmi-winder.hmi-tone-slitter .hmi-wd-mandrel { fill: #c4d0db; stroke: #8a939d; }
.hmi-root .hmi-winder.hmi-tone-slitter .hmi-wd-coil { stroke: #6e4d2a; }
.hmi-root .hmi-winder.hmi-tone-slitter .hmi-wd-turns { stroke: #f0c79a; }
.hmi-root .hmi-winder.hmi-tone-slitter :is(.hmi-wd-centre, .hmi-wd-rod) { fill: #a5b0ba; }
.hmi-root .hmi-winder.hmi-tone-slitter .hmi-wd-seam { stroke: #a5b0ba; opacity: .35; }
.hmi-root .hmi-winder.hmi-tone-slitter .hmi-wd-vent { stroke: #2f353b; }
.hmi-root .hmi-winder.hmi-tone-slitter .hmi-wd-hose { stroke: #2f80c8; }
.hmi-root .hmi-winder.hmi-tone-slitter .hmi-wd-carriage { fill: #f59e0b; stroke: #8a5a00; }
.hmi-root .hmi-winder.hmi-tone-slitter .hmi-wd-wire { stroke: #e8b27a; }
.hmi-root .hmi-winder.hmi-tone-machine .hmi-wd-metal { fill: #1f5fbf; stroke: #123c7c; }
.hmi-root .hmi-winder.hmi-tone-machine .hmi-wd-tail { fill: #e2411d; stroke: #8f2410; }
.hmi-root .hmi-winder.hmi-tone-machine .hmi-wd-box { fill: #d8d0b0; stroke: #8f886d; }
.hmi-root .hmi-winder.hmi-tone-machine .hmi-wd-chuck { fill: #e2411d; stroke: #8f2410; }
.hmi-root .hmi-winder.hmi-tone-machine :is(.hmi-wd-dark, .hmi-wd-stop, .hmi-wd-flange) { fill: #3b4249; stroke: #1d2126; }
.hmi-root .hmi-winder.hmi-tone-machine .hmi-wd-mandrel { fill: #eef2f5; stroke: #8a939d; }
.hmi-root .hmi-winder.hmi-tone-machine .hmi-wd-coil { fill: #b98a55; stroke: #6e4d2a; }
.hmi-root .hmi-winder.hmi-tone-machine .hmi-wd-turns { stroke: #f3e2c6; }
.hmi-root .hmi-winder.hmi-tone-machine .hmi-wd-hose { stroke: #2f80c8; }
.hmi-root .hmi-winder.hmi-tone-machine .hmi-wd-carriage { fill: #e2411d; stroke: #8f2410; }
.hmi-root .hmi-winder.hmi-tone-machine .hmi-wd-wire { stroke: #d9dee3; }
.hmi-root .hmi-winder.hmi-off .hmi-wd-coil, .hmi-root .hmi-winder.hmi-unknown .hmi-wd-coil { filter: saturate(.55) brightness(.85); }
.hmi-root .hmi-winder .hmi-wd-spread { transform-box: view-box; }
.hmi-root.hmi-theme-classic .hmi-winder.hmi-on .hmi-wd-turns, .hmi-root.hmi-anim-always .hmi-winder.hmi-on .hmi-wd-turns { animation: hmi-belt .45s linear infinite; }
.hmi-root.hmi-theme-classic .hmi-winder.hmi-on .hmi-ccw .hmi-wd-turns, .hmi-root.hmi-anim-always .hmi-winder.hmi-on .hmi-ccw .hmi-wd-turns { animation-direction: reverse; }
.hmi-root.hmi-theme-classic .hmi-winder.hmi-on .hmi-wd-wire, .hmi-root.hmi-anim-always .hmi-winder.hmi-on .hmi-wd-wire { animation: hmi-flow .8s linear infinite; }
.hmi-root.hmi-theme-classic .hmi-winder.hmi-on .hmi-wd-spread, .hmi-root.hmi-anim-always .hmi-winder.hmi-on .hmi-wd-spread { animation: hmi-wd-traverse 2.6s ease-in-out infinite alternate; }
@keyframes hmi-wd-traverse { from { transform: translateX(0); } to { transform: translateX(var(--wd-travel, 0px)); } }
/* state colours last, so they win over the default fill of each part */
${Object.entries(ST_VARS).map(([k, v]) => `.hmi-root :is(.hmi-statechip, .hmi-table, .hmi-timeline) .hmi-st-${k} { fill: var(${v}); } .hmi-root :is(.hmi-statechip, .hmi-table, .hmi-timeline) .hmi-stb-${k} { stroke: var(${v}); }`).join('\n')}
`
