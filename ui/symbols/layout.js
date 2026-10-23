// Phone layout: a screen drawn for a wide window is rearranged into a narrow
// column, without drawing a second screen.
//
// - A rectangle (frame rect/round) with symbols inside is a block: its symbols
//   move with it.
// - Blocks and loose symbols are read like text: rows from top to bottom,
//   and in each row the columns from left to right (gaps in the drawing
//   split them). Columns that do not fit side by side go one under the other.
// - Values, charts, tables and buttons take the width they get. Drawings
//   (machines, tanks, motors) keep their shape and shrink to fit.
// - A block narrower than the screen stays exactly as drawn.
// - Symbols that touch each other with no gap (a machine made of parts,
//   pipes between equipment) stay together and shrink as one picture.

// symbols that can be drawn at any width
const FLUID = new Set(['tag', 'kpi', 'text', 'chip', 'alarm', 'button', 'trend', 'alarmList', 'alarmSummary', 'counter', 'mode',
    'interlock', 'barChart', 'donut', 'oee', 'stateChip', 'table', 'timeline', 'setpoint', 'frame'])
const BOX_SHAPES = ['rect', 'round']
// overlap still counted as a gap (rows drawn a few px over each other)
const TOL = 4
const PAD = 12
const GAP = 12

const num = v => Number(v) || 0
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

// width of a text line, estimated (no browser needed); {key} counts as 6 characters
export function textWidth (s, size) {
    const p = s.props || {}
    let t = String(p.text || '').replace(/\{[^}]*\}/g, '000000')
    if (s.key) t += (t ? ' ' : '') + '00000' + (p.unit ? ' ' + p.unit : '')
    return t.length * size * (p.bold === 'yes' ? 0.6 : 0.55)
}

const textSize = s => Math.max(6, num((s.props || {}).size) || 16)

// the area a symbol really covers (a text box is often much wider than its text)
function boxOf (s) {
    let x = num(s.x)
    let y = num(s.y)
    let w = num(s.w)
    let h = num(s.h)
    const pts = s.props && Array.isArray(s.props.points) ? s.props.points : null
    if (pts && pts.length && (s.type === 'line' || s.type === 'shape')) {
        const xs = pts.map(p => num(p[0]))
        const ys = pts.map(p => num(p[1]))
        x += Math.min(...xs); y += Math.min(...ys)
        w = Math.max(...xs) - Math.min(...xs); h = Math.max(...ys) - Math.min(...ys)
    } else if (s.type === 'text' && !num(s.rot)) {
        const tw = Math.min(w, textWidth(s, textSize(s)) + 4)
        const a = (s.props || {}).align
        if (a === 'end') x += w - tw
        else if (a !== 'start') x += (w - tw) / 2
        w = tw
    }
    // the caption (props.label) is written under the symbol
    const label = s.props && s.props.label
    let below = 0
    if (label && !LABEL_INSIDE.has(s.type) && !num(s.rot)) {
        below = 24
        h += below
    }
    return { x, y, w: Math.max(1, w), h: Math.max(1, h), below }
}

// the only symbol that writes props.label inside itself
const LABEL_INSIDE = new Set(['timeline'])

const isBox = s => s.type === 'frame' && BOX_SHAPES.includes((s.props || {}).shape) && !num(s.rot)
const inside = (a, b) => a.x >= b.x - 1 && a.y >= b.y - 1 && a.x + a.w <= b.x + b.w + 1 && a.y + a.h <= b.y + b.h + 1

// tree of blocks: every symbol goes into the smallest rectangle that holds it
function buildTree (symbols) {
    const nodes = symbols.map((s, i) => ({ s, i, box: boxOf(s), kids: [] }))
    const boxes = nodes.filter(n => isBox(n.s))
    const top = []
    for (const n of nodes) {
        let parent = null
        for (const b of boxes) {
            if (b === n) continue
            const area = b.box.w * b.box.h
            const own = n.box.w * n.box.h
            // same size: the one drawn first holds the other
            if (area < own || (area === own && b.i > n.i)) continue
            if (!inside(n.box, b.box)) continue
            if (!parent || area < parent.box.w * parent.box.h) parent = b
        }
        if (parent) parent.kids.push(n)
        else top.push(n)
    }
    // a rectangle holding its own holder would make a loop: keep it on top
    return top
}

// split by gaps along one axis: groups in order
function cut (nodes, axis) {
    const a = axis === 'y' ? 'y' : 'x'
    const len = axis === 'y' ? 'h' : 'w'
    const list = [...nodes].sort((p, q) => p.box[a] - q.box[a])
    const groups = []
    let end = 0
    for (const n of list) {
        if (!groups.length || n.box[a] > end - TOL) {
            groups.push([n])
            end = n.box[a] + n.box[len]
        } else {
            groups[groups.length - 1].push(n)
            end = Math.max(end, n.box[a] + n.box[len])
        }
    }
    return groups
}

const span = (nodes) => {
    const x = Math.min(...nodes.map(n => n.box.x))
    const y = Math.min(...nodes.map(n => n.box.y))
    return { x, y, w: Math.max(...nodes.map(n => n.box.x + n.box.w)) - x, h: Math.max(...nodes.map(n => n.box.y + n.box.h)) - y }
}

// every symbol of a node and below it
function flat (n, out) {
    out.push(n)
    for (const k of n.kids) flat(k, out)
    return out
}

// A laid-out piece: width, height and a function that writes the symbols at (ox, oy).

// keep as drawn, shrunk to fit
function rigid (nodes, avail) {
    const b = span(nodes)
    const k = Math.min(1, avail / b.w)
    return {
        w: b.w * k,
        h: b.h * k,
        fluid: false,
        put (ox, oy, out) {
            for (const top of nodes) {
                for (const n of flat(top, [])) {
                    out[n.i] = { x: ox + (num(n.s.x) - b.x) * k, y: oy + (num(n.s.y) - b.y) * k, k }
                }
            }
        }
    }
}

function leaf (n, avail, stretch) {
    if (avail <= 0) avail = 1
    const s = n.s
    if (!FLUID.has(s.type) || num(s.rot)) return rigid([n], avail)
    if (s.type === 'text') {
        const size = textSize(s)
        const tw = textWidth(s, size) + 4
        // smaller letters first (down to 80 %), then more lines (up to 3)
        const fs = clamp(avail / tw, 0.8, 1)
        const lines = Math.min(3, Math.ceil((tw * fs) / avail))
        const w = stretch ? avail : Math.min(avail, tw * fs)
        const h = Math.max(n.box.h, lines * size * fs * 1.25 + 4)
        return {
            w, h, fluid: true,
            put (ox, oy, out) { out[n.i] = { x: ox, y: oy, w, h, size: fs < 1 ? size * fs : 0, lines } }
        }
    }
    const w = stretch ? avail : Math.min(avail, n.box.below ? num(s.w) : n.box.w)
    const h = n.box.h - n.box.below
    return { w, h: n.box.h, fluid: true, put (ox, oy, out) { out[n.i] = { x: ox, y: oy, w, h } } }
}

// a rectangle with symbols inside
function block (n, avail) {
    // fits, or nearly (shrinks up to 20 %): as drawn
    if (n.box.w * 0.8 <= avail) return rigid([n], avail)
    const kids = n.kids
    const bx = n.box
    const inner = kids.filter(k => !edge(k, bx.w))
    const pad = clamp(inner.length ? Math.min(...inner.map(k => k.box.x - bx.x)) : 0, 0, PAD)
    const top = clamp(Math.min(...kids.map(k => k.box.y - bx.y)), 0, PAD)
    const bottom = clamp(Math.min(...kids.map(k => bx.y + bx.h - k.box.y - k.box.h)), 0, PAD)
    const body = group(kids, avail, pad, bx.w, true)
    const h = top + body.h + bottom
    return {
        w: avail,
        h,
        fluid: true,
        put (ox, oy, out) {
            out[n.i] = { x: ox, y: oy, w: avail, h }
            body.put(ox, oy + top, out)
        }
    }
}

const piece = (n, avail, stretch) => n.kids.length ? block(n, avail) : leaf(n, avail, stretch)

// a rectangle as wide as the block that holds it (a header bar) goes edge to edge
const edge = (n, fullW) => isBox(n.s) && n.box.w >= fullW * 0.95

// Siblings: rows, then columns, else one picture. The result is placed in a
// space `avail` wide; w is how wide it really is. pad is the side margin,
// fullW the width the siblings were drawn in.
function group (nodes, avail, pad, fullW, stretch) {
    if (nodes.length === 1) {
        const n = nodes[0]
        if (edge(n, fullW)) {
            const p = piece(n, avail, stretch)
            return { w: p.w, h: p.h, fluid: p.fluid, put: p.put }
        }
        const p = piece(n, avail - pad * 2, stretch)
        const x = pad + (p.fluid ? 0 : Math.max(0, avail - pad * 2 - p.w) / 2)
        return { w: p.w + pad * 2, h: p.h, fluid: p.fluid, put (ox, oy, out) { p.put(ox + x, oy, out) } }
    }
    const rows = cut(nodes, 'y')
    if (rows.length > 1) {
        const parts = rows.map(r => group(r, avail, pad, fullW, stretch))
        const gaps = rows.map((r, i) => i ? clamp(span(r).y - (span(rows[i - 1]).y + span(rows[i - 1]).h), 4, GAP) : 0)
        const h = parts.reduce((t, p, i) => t + p.h + gaps[i], 0)
        return {
            w: Math.max(...parts.map(p => p.w)),
            h,
            fluid: parts.some(p => p.fluid),
            put (ox, oy, out) {
                let y = oy
                parts.forEach((p, i) => { y += gaps[i]; p.put(ox, y, out); y += p.h })
            }
        }
    }
    const cols = cut(nodes, 'x')
    if (cols.length > 1) return columns(cols, avail, pad, stretch)
    // symbols touching with no gap: one picture
    const p = rigid(nodes, avail - pad * 2)
    const x = pad + Math.max(0, avail - pad * 2 - p.w) / 2
    return { w: p.w + pad * 2, h: p.h, fluid: false, put (ox, oy, out) { p.put(ox + x, oy, out) } }
}

// columns side by side while they fit, the rest on the next lines; a line with
// values or charts fills the width, a line of drawings is centred
function columns (cols, avail, pad, stretch) {
    const inner = avail - pad * 2
    const natural = cols.map(c => group(c, inner, 0, Infinity, false))
    const lines = []
    let line = []
    let used = 0
    // values and charts may get up to 25 % narrower to stay side by side
    const least = p => p.fluid ? p.w * 0.75 : p.w
    natural.forEach((p, i) => {
        if (line.length && used + GAP + least(p) > inner) { lines.push(line); line = []; used = 0 }
        used += (line.length ? GAP : 0) + least(p)
        line.push(i)
    })
    if (line.length) lines.push(line)
    const laid = lines.map(idx => {
        const sum = idx.reduce((t, i) => t + natural[i].w, 0) || 1
        const free = inner - sum - GAP * (idx.length - 1)
        const grow = (stretch || free < 0) && idx.some(i => natural[i].fluid)
        // the space left over (or missing) goes to the values and charts of the line
        const flex = idx.reduce((t, i) => t + (natural[i].fluid ? natural[i].w : 0), 0) || 1
        const widths = idx.map(i => grow && natural[i].fluid ? natural[i].w + free * natural[i].w / flex : natural[i].w)
        const parts = idx.map((i, j) => group(cols[i], widths[j], 0, Infinity, stretch))
        const width = widths.reduce((t, w) => t + w, 0) + GAP * (idx.length - 1)
        return { parts, widths, h: Math.max(...parts.map(p => p.h)), x0: grow ? 0 : Math.max(0, inner - width) / 2, width }
    })
    const h = laid.reduce((t, l) => t + l.h, 0) + GAP * (laid.length - 1)
    return {
        w: Math.max(...laid.map(l => l.width)) + pad * 2,
        h,
        fluid: natural.some(p => p.fluid),
        put (ox, oy, out) {
            let y = oy
            for (const l of laid) {
                let x = ox + pad + l.x0
                l.parts.forEach((p, j) => { p.put(x, y, out); x += l.widths[j] + GAP })
                y += l.h + GAP
            }
        }
    }
}

// symbols of one screen drawn viewW wide, rearranged for a screen `width` wide.
// Returns { symbols, height }; the symbols are copies (x, y, w, h changed, _k = scale).
export function phoneLayout (symbols, width, viewW) {
    const list = Array.isArray(symbols) ? symbols : []
    const W = Math.max(120, num(width))
    const top = buildTree(list)
    if (!top.length) return { symbols: [], height: 100 }
    // the screen itself is the outer block
    const fullW = Math.max(num(viewW), span(top).x + span(top).w)
    const inner = top.filter(k => !edge(k, fullW))
    const pad = clamp(inner.length ? Math.min(...inner.map(k => k.box.x)) : 0, 0, PAD)
    const topPad = clamp(span(top).y, 0, PAD)
    const body = group(top, W, pad, fullW, true)
    const out = []
    body.put(0, topPad, out)
    const res = list.map((s, i) => {
        const o = out[i]
        if (!o) return s
        const c = { ...s, x: o.x, y: o.y }
        if (o.w !== undefined) { c.w = o.w; c.h = o.h }
        if (o.k !== undefined && o.k < 0.999) c._k = o.k
        if (o.lines > 1) c._lines = o.lines
        if (o.size) c.props = { ...s.props, size: o.size }
        return c
    })
    return { symbols: res, height: Math.ceil(topPad + body.h + PAD) }
}
