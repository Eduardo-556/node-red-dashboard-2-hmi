// Production charts: bar chart, donut and OEE. Like more.js, index.js passes
// its helpers in, so this file imports nothing.

// "turno1:Turno 1, turno2:Turno 2" -> [{ key: 'turno1', label: 'Turno 1' }, ...]
export function parseSeries (text) {
    return String(text || '').split(/[,;\n]/).map(t => t.trim()).filter(Boolean).slice(0, 12).map(t => {
        const i = t.indexOf(':')
        const key = (i < 0 ? t : t.slice(0, i)).trim()
        const label = (i < 0 ? key : t.slice(i + 1)).trim()
        return { key, label: label || key }
    }).filter(s => s.key)
}

// OEE = disponibilidade × performance × qualidade. Values in % (0-100) or as a fraction (0-1).
export function oeeOf (a, p, q) {
    const parts = [a, p, q].map(v => (v === null || v === undefined || v === '' || !isFinite(Number(v)) ? null : Number(v)))
    if (parts.some(v => v === null)) return null
    const frac = parts.every(v => v <= 1.0001)
    const k = parts.map(v => Math.max(0, frac ? v : v / 100))
    return Math.round(k[0] * k[1] * k[2] * 1000) / 10
}

export function chartSymbols (H) {
    const { f, num, escapeXml, formatValue } = H

    const TITLE = { key: 'title', label: 'Título', type: 'text' }
    const UNIT = { key: 'unit', label: 'Unidade', type: 'text' }
    const DEC = { key: 'decimals', label: 'Casas decimais', type: 'number' }
    const SERIES = { key: 'series', label: 'Chaves (chave:Rótulo, separadas por vírgula)', type: 'text' }
    const SAMPLE = [62, 85, 48, 74, 90, 55]

    // values of the series; in the editor, keys without data get sample values
    function seriesValues (sym, value, opts) {
        const p = sym.props || {}
        let list = parseSeries(p.series)
        const vals = (opts && opts.values) || {}
        if (!list.length && Array.isArray(value)) {
            const labels = String(p.labels || '').split(',').map(t => t.trim())
            // a list of numbers, or of objects such as [{ h: '05', q: 3 }] (labelField h, valueField q)
            const lf = p.labelField || 'label'
            const vf = p.valueField || 'value'
            list = value.slice(0, 31).map((v, i) => v !== null && typeof v === 'object'
                ? { key: '', label: v[lf] === undefined || v[lf] === null ? String(i + 1) : String(v[lf]), value: num(v[vf]) }
                : { key: '', label: labels[i] || String(i + 1), value: num(v) })
        } else {
            list = list.map(s => ({ ...s, value: num(vals[s.key]) }))
        }
        if (opts && opts.editor) {
            if (!list.length) list = ['A', 'B', 'C', 'D'].map(l => ({ key: '', label: l }))
            list = list.map((s, i) => (s.value === null || s.value === undefined ? { ...s, value: SAMPLE[i % SAMPLE.length] } : s))
        }
        return list
    }
    const card = (w, h) => `<rect class="hmi-kpi-card" x="0.5" y="0.5" width="${f(w - 1)}" height="${f(h - 1)}" rx="6"/>`
    const title = (p, w) => p.title ? `<text class="hmi-ch-title" x="10" y="16">${escapeXml(p.title)}</text>` : ''
    const txt = (cls, x, y, t, size, anchor) => `<text class="${cls}" x="${f(x)}" y="${f(y)}" font-size="${f(size)}"${anchor ? ` style="text-anchor:${anchor}"` : ''}>${escapeXml(t)}</text>`

    function renderBarChart (sym, value, opts) {
        const p = sym.props || {}
        const { w, h } = sym
        const list = seriesValues(sym, value, opts)
        const top = p.title ? 28 : 10
        const bottom = 22
        const left = 10
        const right = 10
        const pw = w - left - right
        const ph = h - top - bottom - 14
        const goal = num(p.goal)
        let max = num(p.max)
        if (max === null || max <= 0) max = Math.max(1, goal || 0, ...list.map(s => s.value || 0)) * 1.1
        const n = Math.max(1, list.length)
        const slot = pw / n
        const bw = Math.min(slot * 0.62, 80)
        const size = Math.max(9, Math.min(13, slot * 0.22))
        let out = `<g class="hmi-chart hmi-barchart">${card(w, h)}${title(p, w)}`
        out += `<path class="hmi-ch-axis" d="M${f(left)} ${f(top + 14 + ph)}H${f(w - right)}"/>`
        list.forEach((s, i) => {
            const v = s.value
            const k = v === null ? 0 : Math.max(0, Math.min(1, v / max))
            const bh = ph * k
            const x = left + slot * i + (slot - bw) / 2
            const y = top + 14 + ph - bh
            const low = goal !== null && v !== null && v < goal
            out += `<rect class="hmi-ch-bar hmi-ch-0${low && p.lowColor === 'warn' ? ' hmi-ch-low' : ''}" x="${f(x)}" y="${f(y)}" width="${f(bw)}" height="${f(bh)}"/>`
            out += txt('hmi-ch-value', x + bw / 2, y - 5, v === null ? '—' : formatValue(v, p.decimals, opts.locale) + (p.unit ? ' ' + p.unit : ''), size, 'middle')
            out += txt('hmi-ch-label', x + bw / 2, h - 8, s.label, size, 'middle')
        })
        if (goal !== null && goal <= max) {
            const gy = top + 14 + ph - ph * goal / max
            out += `<path class="hmi-ch-goal" d="M${f(left)} ${f(gy)}H${f(w - right)}"/>` + txt('hmi-ch-goal-text', w - right, gy - 4, 'Meta ' + formatValue(goal, p.decimals, opts.locale), size, 'end')
        }
        return out + '</g>'
    }

    function renderDonut (sym, value, opts) {
        const p = sym.props || {}
        const { w, h } = sym
        let list = seriesValues(sym, value, opts).filter(s => s.value !== null && s.value > 0)
        // six colours: from the seventh slice on, the smallest ones join in "Outros"
        if (list.length > 6) {
            const sorted = [...list].sort((a, b) => b.value - a.value)
            list = [...sorted.slice(0, 5), { key: '', label: 'Outros', value: sorted.slice(5).reduce((a, s) => a + s.value, 0) }]
        }
        const total = list.reduce((a, s) => a + s.value, 0)
        const top = p.title ? 26 : 6
        const legendW = p.legend === 'no' ? 0 : Math.min(w * 0.45, Math.max(170, w * 0.4))
        const r = Math.max(10, Math.min((w - legendW - 16) / 2, (h - top - 8) / 2))
        const cx = 8 + r
        const cy = top + (h - top) / 2
        const t = r * 0.38
        let out = `<g class="hmi-chart hmi-donut">${card(w, h)}${title(p, w)}`
        out += `<circle class="hmi-ch-track" cx="${f(cx)}" cy="${f(cy)}" r="${f(r - t / 2)}" stroke-width="${f(t)}"/>`
        let a0 = -Math.PI / 2
        list.forEach((s, i) => {
            const a1 = a0 + 2 * Math.PI * s.value / total
            const rr = r - t / 2
            const large = a1 - a0 > Math.PI ? 1 : 0
            const d = list.length === 1
                ? `M${f(cx)} ${f(cy - rr)}A${f(rr)} ${f(rr)} 0 1 1 ${f(cx - 0.01)} ${f(cy - rr)}`
                : `M${f(cx + rr * Math.cos(a0))} ${f(cy + rr * Math.sin(a0))}A${f(rr)} ${f(rr)} 0 ${large} 1 ${f(cx + rr * Math.cos(a1))} ${f(cy + rr * Math.sin(a1))}`
            out += `<path class="hmi-ch-arc hmi-ch-${i % 6}" d="${d}" stroke-width="${f(t)}"/>`
            a0 = a1
        })
        const center = p.center === 'none' ? '' : (total ? formatValue(total, p.decimals, opts.locale) + (p.unit ? ' ' + p.unit : '') : '—')
        if (center) out += txt('hmi-ch-center', cx, cy, center, Math.max(10, Math.min(r * 0.36, (r * 1.2) / Math.max(3, center.length) * 1.7)), 'middle')
        if (legendW) {
            const size = Math.max(9, Math.min(13, (h - top) / Math.max(4, list.length) * 0.5))
            list.forEach((s, i) => {
                const y = top + 8 + i * size * 1.7
                const pct = Math.round(s.value / total * 1000) / 10
                const tail = '  ' + formatValue(pct, 1, opts.locale) + '%'
                const room = Math.max(3, Math.floor((legendW - size * 1.5 - 6) / (size * 0.58)) - tail.length)
                const name = s.label.length > room ? s.label.slice(0, Math.max(1, room - 1)) + '…' : s.label
                out += `<rect class="hmi-ch-dot hmi-ch-${i % 6}" x="${f(w - legendW)}" y="${f(y)}" width="${f(size)}" height="${f(size)}" rx="2"/>` +
                    txt('hmi-ch-label', w - legendW + size * 1.5, y + size * 0.5, name + tail, size)
            })
        }
        return out + '</g>'
    }

    function renderOee (sym, value, opts) {
        const p = sym.props || {}
        const { w, h } = sym
        const vals = (opts && opts.values) || {}
        const sample = opts && opts.editor
        const pick = (k, s) => { const v = num(vals[p[k]]); return v === null && sample ? s : v }
        const a = pick('availKey', 92)
        const pf = pick('perfKey', 88)
        const q = pick('qualKey', 97)
        const direct = p.oeeKey ? num(vals[p.oeeKey]) : null
        const frac = [a, pf, q].every(v => v === null || v <= 1.0001)
        let oee = direct !== null ? (direct <= 1.0001 ? direct * 100 : direct) : oeeOf(a, pf, q)
        if (oee !== null) oee = Math.round(oee * 10) / 10
        const goal = num(p.goal) === null ? 85 : num(p.goal)
        const low = num(p.low) === null ? 60 : num(p.low)
        const cls = oee === null ? 'hmi-unknown' : (oee < low ? 'hmi-oee-alarm' : (oee < goal ? 'hmi-oee-warn' : 'hmi-oee-ok'))
        const top = p.title ? 26 : 8
        const r = Math.max(14, Math.min(w * 0.22, (h - top - 10) / 2))
        const cx = 12 + r
        const cy = top + (h - top) / 2
        const t = r * 0.26
        const rr = r - t / 2
        const k = oee === null ? 0 : Math.max(0, Math.min(1, oee / 100))
        const a1 = -Math.PI / 2 + 2 * Math.PI * Math.min(k, 0.9999)
        let out = `<g class="hmi-chart hmi-oee ${cls}">${card(w, h)}${title(p, w)}`
        out += `<circle class="hmi-ch-track" cx="${f(cx)}" cy="${f(cy)}" r="${f(rr)}" stroke-width="${f(t)}"/>`
        if (k > 0) out += `<path class="hmi-oee-arc" d="M${f(cx)} ${f(cy - rr)}A${f(rr)} ${f(rr)} 0 ${k > 0.5 ? 1 : 0} 1 ${f(cx + rr * Math.cos(a1))} ${f(cy + rr * Math.sin(a1))}" stroke-width="${f(t)}"/>`
        out += txt('hmi-ch-center', cx, cy - r * 0.1, oee === null ? '—' : formatValue(oee, 1, opts.locale) + '%', Math.max(10, r * 0.4), 'middle')
        out += txt('hmi-ch-label', cx, cy + r * 0.32, 'OEE', Math.max(8, r * 0.2), 'middle')
        // three bars: A, P, Q
        const bx = cx + r + 18
        const bw = w - bx - 12
        const rowH = (h - top - 12) / 3
        const size = Math.max(9, Math.min(13, rowH * 0.3))
        ;[['Disponibilidade', a], ['Performance', pf], ['Qualidade', q]].forEach(([label, v], i) => {
            const y = top + 6 + rowH * i
            const pct = v === null ? null : (frac ? v * 100 : v)
            const kk = pct === null ? 0 : Math.max(0, Math.min(1, pct / 100))
            out += txt('hmi-ch-label', bx, y + size, label, size) +
                txt('hmi-ch-value', bx + bw, y + size, pct === null ? '—' : formatValue(Math.round(pct * 10) / 10, 1, opts.locale) + '%', size, 'end') +
                `<rect class="hmi-ch-track-bar" x="${f(bx)}" y="${f(y + size * 1.5)}" width="${f(Math.max(0, bw))}" height="${f(Math.max(3, rowH * 0.22))}" rx="2"/>` +
                `<rect class="hmi-ch-bar hmi-ch-${i}" x="${f(bx)}" y="${f(y + size * 1.5)}" width="${f(Math.max(0, bw * kk))}" height="${f(Math.max(3, rowH * 0.22))}" rx="2"/>`
        })
        return out + '</g>'
    }

    return {
        barChart: {
            label: 'Gráfico de barras',
            group: 'Gráficos',
            w: 360,
            h: 200,
            preview: undefined,
            defaults: { title: 'PRODUÇÃO POR TURNO', series: 'turno1:Turno 1, turno2:Turno 2, turno3:Turno 3', labels: '', labelField: '', valueField: '', unit: '', decimals: 0, max: '', goal: '', lowColor: 'no' },
            fields: [
                TITLE, SERIES,
                { key: 'labels', label: 'Rótulos (se a chave do símbolo for uma lista)', type: 'text' },
                { key: 'labelField', label: 'Lista de objetos: campo do rótulo', type: 'text' },
                { key: 'valueField', label: 'Lista de objetos: campo do valor', type: 'text' },
                UNIT, DEC,
                { key: 'max', label: 'Máximo (vazio = automático)', type: 'number' },
                { key: 'goal', label: 'Meta (linha)', type: 'number' },
                { key: 'lowColor', label: 'Abaixo da meta', type: 'select', options: [['no', 'Mesma cor'], ['warn', 'Amarelo']] }
            ],
            render: renderBarChart
        },
        donut: {
            label: 'Rosca (donut)',
            group: 'Gráficos',
            w: 320,
            h: 180,
            preview: undefined,
            defaults: { title: 'TEMPO DA MÁQUINA', series: 'produzindo:Produzindo, parada:Parada, setup:Setup', labels: '', unit: 'min', decimals: 0, legend: 'yes', center: 'total' },
            fields: [
                TITLE, SERIES,
                { key: 'labels', label: 'Rótulos (se a chave do símbolo for uma lista)', type: 'text' },
                UNIT, DEC,
                { key: 'center', label: 'No meio', type: 'select', options: [['total', 'Total'], ['none', 'Nada']] },
                { key: 'legend', label: 'Legenda', type: 'select', options: [['yes', 'Sim'], ['no', 'Não']] }
            ],
            render: renderDonut
        },
        oee: {
            label: 'OEE',
            group: 'Gráficos',
            w: 360,
            h: 160,
            preview: undefined,
            defaults: { title: 'OEE', availKey: 'disponibilidade', perfKey: 'performance', qualKey: 'qualidade', oeeKey: '', goal: 85, low: 60 },
            fields: [
                TITLE,
                { key: 'availKey', label: 'Chave da disponibilidade', type: 'text' },
                { key: 'perfKey', label: 'Chave da performance', type: 'text' },
                { key: 'qualKey', label: 'Chave da qualidade', type: 'text' },
                { key: 'oeeKey', label: 'Chave do OEE pronto (opcional)', type: 'text' },
                { key: 'goal', label: 'Meta (%)', type: 'number' },
                { key: 'low', label: 'Vermelho abaixo de (%)', type: 'number' }
            ],
            render: renderOee
        }
    }
}

export const CHART_CSS = `
.hmi-root.hmi-theme-isa101 { --hmi-ch0: #5b6f86; --hmi-ch1: #8ea2b7; --hmi-ch2: #3d4146; --hmi-ch3: #a9acaf; --hmi-ch4: #6f7d6b; --hmi-ch5: #b59a6a; }
.hmi-root.hmi-theme-classic { --hmi-ch0: #38bdf8; --hmi-ch1: #22c55e; --hmi-ch2: #f59e0b; --hmi-ch3: #c084fc; --hmi-ch4: #f472b6; --hmi-ch5: #94a3b8; }
.hmi-root .hmi-ch-title { fill: var(--hmi-text-dim); font-size: 12px; font-weight: 700; letter-spacing: .5px; text-anchor: start; dominant-baseline: auto; }
.hmi-root .hmi-ch-label { fill: var(--hmi-text-dim); dominant-baseline: central; text-anchor: start; }
.hmi-root .hmi-ch-value { fill: var(--hmi-text); font-weight: 700; text-anchor: start; dominant-baseline: auto; }
.hmi-root .hmi-ch-goal-text { text-anchor: end; dominant-baseline: auto; }
.hmi-root .hmi-ch-center { fill: var(--hmi-text); font-weight: 800; dominant-baseline: central; }
.hmi-root .hmi-ch-axis { stroke: var(--hmi-line); stroke-width: 1; }
.hmi-root .hmi-ch-goal { stroke: var(--hmi-text); stroke-width: 1.5; stroke-dasharray: 6 4; }
.hmi-root .hmi-ch-goal-text { fill: var(--hmi-text); font-weight: 600; }
.hmi-root .hmi-ch-track { fill: none; stroke: var(--hmi-bg); }
.hmi-root .hmi-ch-track-bar { fill: var(--hmi-bg); }
.hmi-root .hmi-ch-arc { fill: none; }
${[0, 1, 2, 3, 4, 5].map(i => `.hmi-root .hmi-ch-${i}.hmi-ch-bar, .hmi-root .hmi-ch-${i}.hmi-ch-dot { fill: var(--hmi-ch${i}); } .hmi-root .hmi-ch-${i}.hmi-ch-arc { stroke: var(--hmi-ch${i}); }`).join('\n')}
.hmi-root .hmi-ch-bar.hmi-ch-low { fill: var(--hmi-warn); }
.hmi-root .hmi-oee-arc { fill: none; stroke: var(--hmi-ch0); }
.hmi-root .hmi-oee-warn .hmi-oee-arc { stroke: var(--hmi-warn); }
.hmi-root .hmi-oee-alarm .hmi-oee-arc { stroke: var(--hmi-alarm); }
`
