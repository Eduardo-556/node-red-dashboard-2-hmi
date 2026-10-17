// Marks drawn on top of a symbol on the dashboard (never in the editor):
// - alarm: border in the priority colour, blinking while unacknowledged (ISA-101)
// - quality: value bad (×), uncertain (?) or stale (clock), and the symbol dimmed
// - pending: command sent, waiting for the PLC to read it back (dashed), or no answer (!)
// - interlock: padlock when a command is blocked right now
// - flash: the symbol picked in the alarm list

const f = n => Math.round(n * 10) / 10

const truthy = v => v === true || (v !== false && v !== null && v !== undefined && v !== '' && v !== 'false' && Number(v) !== 0)

// same rule as nodes/values.js: "permissivo, !emergencia"
export function interlockOf (act, values) {
    const list = String((act && act.interlock) || '').split(',').map(t => t.trim()).filter(Boolean)
    for (const item of list) {
        const not = item.startsWith('!')
        const key = not ? item.slice(1).trim() : item
        if (!key) continue
        const on = truthy((values || {})[key])
        if (not ? on : !on) return String(act.interlockText || '').trim() || (not ? key + ' ligado' : key + ' desligado')
    }
    return ''
}

function badge (x, y, cls, inner) {
    return `<g class="hmi-ov-badge ${cls}" transform="translate(${f(x)},${f(y)})"><circle r="9"/>${inner}</g>`
}

export function renderOverlay (sym, st) {
    if (!st) return ''
    const w = sym.w
    const h = sym.h
    const rot = Number(sym.rot) || 0
    const tf = `translate(${f(sym.x)},${f(sym.y)})` + (rot ? ` rotate(${f(rot)},${f(w / 2)},${f(h / 2)})` : '')
    let out = ''
    const box = (cls, pad) => `<rect class="${cls}" x="${f(-pad)}" y="${f(-pad)}" width="${f(w + pad * 2)}" height="${f(h + pad * 2)}" rx="4"/>`
    if (st.flash) out += box('hmi-ov-flash hmi-blink', 8)
    if (st.alarm) out += box('hmi-ov-alarm hmi-ov-p' + st.alarm.priority + (st.alarm.unacked ? ' hmi-blink' : ''), 4)
    if (st.pending === 'wait') out += box('hmi-ov-wait', 2)
    if (st.pending === 'fail') out += box('hmi-ov-fail', 2) + badge(w, h, 'hmi-ov-b-fail', '<path d="M0 -5v6M0 3.5v1.5"/>')
    if (st.quality === 'bad') out += badge(0, 0, 'hmi-ov-b-bad', '<path d="M-4 -4l8 8M4 -4l-8 8"/>')
    else if (st.quality === 'uncertain') out += badge(0, 0, 'hmi-ov-b-unc', '<path d="M-3 -3a3 3 0 1 1 3 3v2M0 5v1"/>')
    else if (st.quality === 'stale') out += badge(0, 0, 'hmi-ov-b-stale', '<circle class="hmi-ov-clock" r="5"/><path d="M0 -3v3l2.5 1.5"/>')
    if (st.locked) out += badge(w, 0, 'hmi-ov-b-lock', '<rect x="-4" y="-1" width="8" height="6" rx="1"/><path d="M-2.5 -1v-2a2.5 2.5 0 0 1 5 0v2"/>')
    return out ? `<g class="hmi-overlay" data-for="${String(sym.id).replace(/[^\w-]/g, '')}" transform="${tf}">${out}</g>` : ''
}

export const OVERLAY_CSS = `
.hmi-root .hmi-overlay { pointer-events: none; }
.hmi-root .hmi-overlay rect, .hmi-root .hmi-overlay path { fill: none; }
.hmi-root .hmi-ov-alarm { stroke-width: 3; }
.hmi-root .hmi-ov-p1 { stroke: var(--hmi-alarm); }
.hmi-root .hmi-ov-p2 { stroke: var(--hmi-warn); }
.hmi-root .hmi-ov-p3 { stroke: var(--hmi-low); }
.hmi-root .hmi-ov-flash { stroke: var(--hmi-info); stroke-width: 4; }
.hmi-root .hmi-ov-wait { stroke: var(--hmi-info); stroke-width: 2; stroke-dasharray: 5 4; animation: hmi-flow 1s linear infinite; }
.hmi-root .hmi-ov-fail { stroke: var(--hmi-alarm); stroke-width: 2; stroke-dasharray: 5 4; }
.hmi-root .hmi-ov-badge circle { stroke-width: 1.5; }
.hmi-root .hmi-ov-badge path, .hmi-root .hmi-ov-badge .hmi-ov-clock { stroke-width: 1.8; stroke-linecap: round; fill: none; }
.hmi-root .hmi-ov-b-bad circle { fill: var(--hmi-alarm); stroke: #fff; }
.hmi-root .hmi-ov-b-bad path, .hmi-root .hmi-ov-b-fail path { stroke: #fff; }
.hmi-root .hmi-ov-b-fail circle { fill: var(--hmi-alarm); stroke: #fff; }
.hmi-root .hmi-ov-b-unc circle { fill: var(--hmi-warn); stroke: #000; }
.hmi-root .hmi-ov-b-unc path { stroke: #000; }
.hmi-root .hmi-ov-b-stale circle { fill: var(--hmi-tag-bg); stroke: var(--hmi-text-dim); }
.hmi-root .hmi-ov-b-stale path, .hmi-root .hmi-ov-b-stale .hmi-ov-clock { stroke: var(--hmi-text-dim); }
.hmi-root .hmi-ov-b-stale .hmi-ov-clock { stroke-width: 1.2; }
.hmi-root .hmi-ov-b-lock circle { fill: var(--hmi-tag-bg); stroke: var(--hmi-text); }
.hmi-root .hmi-ov-b-lock rect { fill: var(--hmi-text); }
.hmi-root .hmi-ov-b-lock path { stroke: var(--hmi-text); stroke-width: 1.5; }
.hmi-root .hmi-q-bad > .hmi-symbol, .hmi-root .hmi-q-stale > .hmi-symbol { opacity: .5; }
.hmi-root .hmi-q-uncertain > .hmi-symbol { opacity: .75; }
.hmi-root .hmi-disabled .hmi-clickable { cursor: not-allowed; }
.hmi-root.hmi-bg-dashboard { background: rgb(var(--v-theme-background, 238, 238, 238)); }
.hmi-root.hmi-bg-dashboard .hmi-bg { fill: rgb(var(--v-theme-background, 238, 238, 238)); }
`
