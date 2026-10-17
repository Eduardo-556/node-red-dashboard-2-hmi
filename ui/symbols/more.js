// Second batch of symbols (process, factory, electrical, ISA-101 indicators,
// pipe fittings and arrows). index.js passes its helpers in, so this file
// imports nothing and there is no import cycle.

export function moreSymbols (H) {
    const { f, num, escapeXml, isOn, onState, formatValue, rangeState, alarmIndicator, stateClass, labelBelow, faultOf, faultMark, faultClass, scaleOf, ON_FIELDS, INVERT_FIELD, FAULT_FIELD, PRIORITY_FIELD } = H

    const LABEL = { key: 'label', label: 'Legenda', type: 'text' }
    const TITLE = { key: 'title', label: 'Título', type: 'text' }
    const UNIT = { key: 'unit', label: 'Unidade', type: 'text' }
    const DEC = { key: 'decimals', label: 'Casas decimais', type: 'number' }
    const LO = { key: 'lo', label: 'Alarme abaixo de', type: 'number' }
    const HI = { key: 'hi', label: 'Alarme acima de', type: 'number' }
    const MIN = { key: 'min', label: 'Mínimo', type: 'number' }
    const MAX = { key: 'max', label: 'Máximo', type: 'number' }
    const DIR = { key: 'dir', label: 'Sentido', type: 'select', options: [['cw', 'Horário'], ['ccw', 'Anti-horário']] }
    const EQ_DEFAULTS = { label: '', onWhen: 'nonzero', threshold: 0, invert: 'no', faultKey: '', priority: '1' }
    const EQ_FIELDS = [LABEL, ...ON_FIELDS, FAULT_FIELD, PRIORITY_FIELD]
    const key = (k, label) => ({ key: k, label, type: 'text' })

    // value of another payload key, and its on/off state
    const raw = (opts, k) => (k && opts && opts.values ? opts.values[k] : undefined)
    const keyOn = (opts, k) => (k ? isOn(raw(opts, k), 'nonzero') : null)
    const valueText = (v, p, opts) => formatValue(v, p.decimals, opts.locale) + (p.unit ? ' ' + p.unit : '')
    const alarmCls = st => (st === null ? 'hmi-unknown' : (st === 'alarm' ? 'hmi-on hmi-alarm' : 'hmi-on hmi-normal'))
    const rect = (cls, x, y, w, h, rx) => `<rect class="${cls}" x="${f(x)}" y="${f(y)}" width="${f(Math.max(0, w))}" height="${f(Math.max(0, h))}"${rx ? ` rx="${f(rx)}"` : ''}/>`
    const circle = (cls, cx, cy, r) => `<circle class="${cls}" cx="${f(cx)}" cy="${f(cy)}" r="${f(Math.max(0, r))}"/>`
    const path = (cls, d) => `<path class="${cls}" d="${d}"/>`
    const poly = (cls, pts) => `<polygon class="${cls}" points="${pts.map(q => f(q[0]) + ',' + f(q[1])).join(' ')}"/>`
    // small display window with a value in it
    const disp = (x, y, w, h, text, size) => rect('hmi-disp', x, y, w, h, 2) +
        `<text class="hmi-disp-text" x="${f(x + w / 2)}" y="${f(y + h / 2)}" font-size="${f(size || Math.max(9, Math.min(h * 0.62, (w - 4) / Math.max(4, String(text).length) * 1.55)))}">${escapeXml(text)}</text>`
    // spinning part drawn around 0,0 and moved to (cx,cy)
    const spin = (cx, cy, inner, dir) => `<g transform="translate(${f(cx)},${f(cy)})"><g class="hmi-spin${dir === 'ccw' ? ' hmi-ccw' : ''}">${inner}</g></g>`
    const blades = (r, n) => Array.from({ length: n }, (x, i) => {
        const a = i * 2 * Math.PI / n
        return `M0 0L${f(Math.cos(a) * r)} ${f(Math.sin(a) * r)}`
    }).join('')
    // wrapper shared by every equipment: state, fault mark and label
    const eq = (name, on, p, opts, w, h, body, extra) =>
        `<g class="hmi-eq hmi-${name} ${stateClass(on)}${faultClass(p, opts)}${extra || ''}">${body}${faultMark(p, opts, w)}${labelBelow(p, w, h)}</g>`

    // ---------- Elétrica ----------

    function renderVfd (sym, value, opts) {
        const p = sym.props || {}
        const { w, h } = sym
        const v = num(value)
        const run = p.runKey ? keyOn(opts, p.runKey) : (v === null ? null : v !== 0)
        const rev = p.dirKey ? keyOn(opts, p.dirKey) === true : (v !== null && v < 0)
        const text = v === null ? '—' : valueText(p.dirKey ? v : Math.abs(v), p, opts)
        const ay = h * 0.62
        const as = Math.min(w * 0.12, 9)
        const d = rev ? -1 : 1
        const keys = [0, 1, 2].map(i => rect('hmi-key', w * (0.16 + i * 0.25), h * 0.78, w * 0.18, h * 0.08, 1.5)).join('')
        return eq('vfd', run, p, opts, w, h,
            rect('hmi-body', 1, 1, w - 2, h - 2, 4) +
            disp(w * 0.12, h * 0.1, w * 0.76, h * 0.26, text) +
            circle('hmi-led', w * 0.22, ay, Math.min(w, h) * 0.055) +
            path('hmi-arrowhead', `M${f(w * 0.62 - as * d)} ${f(ay - as)}L${f(w * 0.62 + as * d)} ${f(ay)}L${f(w * 0.62 - as * d)} ${f(ay + as)}Z`) +
            keys)
    }

    function renderBreaker (sym, value, opts) {
        const p = sym.props || {}
        const { w, h } = sym
        const on = onState(value, p)
        const trip = keyOn(opts, p.tripKey) === true
        const s = Math.min(w * 0.7, h * 0.4)
        const cx = w / 2
        const y0 = (h - s) / 2
        return eq('breaker', on, p, opts, w, h,
            path('hmi-wire', `M${f(cx)} 0V${f(y0)}M${f(cx)} ${f(y0 + s)}V${f(h)}`) +
            rect('hmi-body', cx - s / 2, y0, s, s, 2) +
            (on === false ? path('hmi-wire hmi-open-mark', `M${f(cx - s * 0.3)} ${f(y0 + s * 0.3)}L${f(cx + s * 0.3)} ${f(y0 + s * 0.7)}`) : '') +
            (trip ? alarmIndicator(w - 4, 6, p.priority) : ''), trip ? ' hmi-fault' : '')
    }

    function renderContactor (sym, value, opts) {
        const p = sym.props || {}
        const { w, h } = sym
        const on = onState(value, p)
        const cx = w * 0.62
        const y1 = h * 0.3
        const y2 = h * 0.7
        const end = on ? [cx, y2] : [cx + w * 0.26, y2 - h * 0.06]
        return eq('contactor', on, p, opts, w, h,
            path('hmi-wire', `M${f(cx)} 0V${f(y1)}M${f(cx)} ${f(y2)}V${f(h)}`) +
            circle('hmi-terminal', cx, y1, 2.5) + circle('hmi-terminal', cx, y2, 2.5) +
            path('hmi-blade-line', `M${f(cx)} ${f(y1)}L${f(end[0])} ${f(end[1])}`) +
            path('hmi-link', `M${f(w * 0.38)} ${f(h / 2)}H${f(cx + (on ? 0 : w * 0.13))}`) +
            rect('hmi-body', 1, h / 2 - h * 0.14, w * 0.38, h * 0.28, 2) +
            `<text class="hmi-glyph" x="${f(1 + w * 0.19)}" y="${f(h / 2)}" font-size="${f(Math.min(w * 0.26, h * 0.2))}">K</text>`)
    }

    function renderTransformer (sym, value, opts) {
        const p = sym.props || {}
        const { w, h } = sym
        const on = onState(value, p)
        const r = Math.min(w / 2 - 2, h * 0.24)
        const cx = w / 2
        const c1 = h / 2 - r * 0.62
        const c2 = h / 2 + r * 0.62
        const rating = p.rating ? `<text class="hmi-sub-label" x="${f(w / 2)}" y="${f(h + (p.label ? 34 : 18))}">${escapeXml(p.rating)}</text>` : ''
        return eq('transformer', on, p, opts, w, h,
            path('hmi-wire', `M${f(cx)} 0V${f(c1 - r)}M${f(cx)} ${f(c2 + r)}V${f(h)}`) +
            circle('hmi-body hmi-coil1', cx, c1, r) + circle('hmi-body hmi-coil2', cx, c2, r) + rating)
    }

    function renderGenerator (sym, value, opts) {
        const p = sym.props || {}
        const { w, h } = sym
        const on = onState(value, p)
        const r = Math.min(w / 2 - 2, (h - 12) / 2)
        const cx = w / 2
        const cy = h - r - 2
        return eq('generator', on, p, opts, w, h,
            path('hmi-wire', `M${f(cx)} 0V${f(cy - r)}`) +
            circle('hmi-body', cx, cy, r) +
            `<text class="hmi-glyph" x="${f(cx)}" y="${f(cy - r * 0.12)}" font-size="${f(r * 0.8)}">G</text>` +
            path('hmi-wave', `M${f(cx - r * 0.4)} ${f(cy + r * 0.5)}q${f(r * 0.2)} ${f(-r * 0.28)} ${f(r * 0.4)} 0t${f(r * 0.4)} 0`))
    }

    function renderEnergyMeter (sym, value, opts) {
        const p = sym.props || {}
        const { w, h } = sym
        const e = raw(opts, p.energyKey)
        const kw = valueText(value, p, opts)
        const kwh = formatValue(e, p.energyDecimals, opts.locale) + (p.energyUnit ? ' ' + p.energyUnit : '')
        const unknown = value === undefined || value === null
        return `<g class="hmi-eq hmi-meter ${unknown ? 'hmi-unknown' : 'hmi-on'}">` +
            rect('hmi-tag-box', 0.5, 0.5, w - 1, h - 1, 4) +
            `<text class="hmi-tag-title hmi-left" x="8" y="${f(Math.min(16, h * 0.2))}" font-size="${f(Math.max(9, Math.min(12, h * 0.15)))}">${escapeXml(p.title || sym.key || '')}</text>` +
            disp(6, h * 0.3, w - 12, h * 0.32, kw) +
            (p.energyKey ? `<text class="hmi-tag-value hmi-right" x="${f(w - 8)}" y="${f(h * 0.84)}" font-size="${f(Math.max(9, Math.min(14, h * 0.17)))}">${escapeXml(kwh)}</text>` : '') +
            labelBelow(p, w, h) + '</g>'
    }

    // ---------- Processo ----------

    function renderCompressor (sym, value, opts) {
        const p = sym.props || {}
        const { w, h } = sym
        const on = onState(value, p)
        const r = Math.max(6, Math.min(w, h * 0.9) / 2 - 2)
        const cx = w / 2
        const cy = r + 2
        return eq('compressor', on, p, opts, w, h,
            path('hmi-foot', `M${f(cx - r * 0.75)} ${f(h - 1)}L${f(cx - r * 0.45)} ${f(cy + r * 0.7)}H${f(cx + r * 0.45)}L${f(cx + r * 0.75)} ${f(h - 1)}Z`) +
            circle('hmi-body', cx, cy, r) +
            path('hmi-inner', `M${f(cx - r * 0.72)} ${f(cy - r * 0.68)}L${f(cx + r * 0.78)} ${f(cy - r * 0.34)}M${f(cx - r * 0.72)} ${f(cy + r * 0.68)}L${f(cx + r * 0.78)} ${f(cy + r * 0.34)}`))
    }

    function renderBlower (sym, value, opts) {
        const p = sym.props || {}
        const { w, h } = sym
        const on = onState(value, p)
        const r = Math.max(6, Math.min(w * 0.8, h) / 2 - 2)
        const cx = r + 2
        const cy = h - r - 2
        return eq('blower', on, p, opts, w, h,
            rect('hmi-body', cx, cy - r, Math.min(w - cx - 1, r * 1.35), r * 0.62, 1) +
            circle('hmi-body', cx, cy, r) +
            spin(cx, cy, path('hmi-inner', blades(r * 0.72, 6)) + circle('hmi-hub', 0, 0, r * 0.18), p.dir))
    }

    function renderBagFilter (sym, value, opts) {
        const p = sym.props || {}
        const { w, h } = sym
        const st = rangeState(value, p.lo, p.hi)
        const top = h * 0.62
        const n = Math.max(2, Math.min(8, Math.round(w / 22)))
        let bags = ''
        for (let i = 0; i < n; i++) {
            const bw = (w - 16) / n
            bags += rect('hmi-bag', 8 + i * bw + bw * 0.2, h * 0.3, bw * 0.6, top - h * 0.34, bw * 0.3)
        }
        const text = value === undefined || value === null ? 'ΔP —' : 'ΔP ' + valueText(value, p, opts)
        let out = `<g class="hmi-eq hmi-bagfilter ${alarmCls(st)}">` +
            poly('hmi-body', [[1, 1], [w - 1, 1], [w - 1, top], [w * 0.6, h * 0.9], [w * 0.4, h * 0.9], [1, top]]) +
            rect('hmi-part', w * 0.4, h * 0.9, w * 0.2, h * 0.1 - 1, 1) +
            bags + disp(w * 0.08, h * 0.06, w * 0.84, h * 0.16, text)
        if (st === 'alarm') out += alarmIndicator(w - 6, h * 0.06 + 2, p.priority)
        return out + labelBelow(p, w, h) + '</g>'
    }

    function renderControlValve (sym, value, opts) {
        const p = sym.props || {}
        const { w, h } = sym
        const v = num(value)
        const sc = scaleOf(p)
        const fr = v === null ? null : sc.frac(v)
        const top = h * 0.5
        const cy = (top + h - 1) / 2
        const cx = w / 2
        const text = v === null ? '—' : formatValue(fr * 100, 0, opts.locale) + ' %'
        return eq('cvalve', fr === null ? null : fr > 0.005, p, opts, w, h,
            path('hmi-stem', `M${f(cx)} ${f(cy)}V${f(h * 0.34)}`) +
            (fr !== null ? rect('hmi-stroke-pos', cx - 1.5, h * 0.34, 3, (cy - h * 0.34) * fr) : '') +
            disp(w * 0.06, 1, w * 0.88, h * 0.32, text) +
            path('hmi-body', `M1.5 ${f(top)}L${f(cx)} ${f(cy)}L1.5 ${f(h - 1)}ZM${f(w - 1.5)} ${f(top)}L${f(cx)} ${f(cy)}L${f(w - 1.5)} ${f(h - 1)}Z`))
    }

    function renderValve3 (sym, value, opts) {
        const p = sym.props || {}
        const { w, h } = sym
        const on = onState(value, p)
        const cx = w / 2
        const cy = h * 0.42
        const a = Math.min(cx - 1.5, cy * 0.9)
        const open = port => on === null ? '' : ((port === 'b' ? on : (port === 'c' ? !on : true)) ? ' hmi-open' : '')
        return eq('valve3', on, p, opts, w, h,
            path('hmi-stem', `M${f(cx)} ${f(cy)}V${f(cy - a * 0.9)}`) +
            rect('hmi-actuator', cx - a * 0.45, cy - a * 0.9 - 6, a * 0.9, 6, 1) +
            poly('hmi-body hmi-port' + open('a'), [[1.5, cy - a * 0.6], [cx, cy], [1.5, cy + a * 0.6]]) +
            poly('hmi-body hmi-port' + open('c'), [[w - 1.5, cy - a * 0.6], [cx, cy], [w - 1.5, cy + a * 0.6]]) +
            poly('hmi-body hmi-port' + open('b'), [[cx - a * 0.6, h - 1.5], [cx, cy], [cx + a * 0.6, h - 1.5]]))
    }

    function renderDamper (sym, value, opts) {
        const p = sym.props || {}
        const { w, h } = sym
        const v = num(value)
        const fr = v === null ? null : scaleOf(p).frac(v)
        const ang = (fr === null ? 0.5 : fr) * Math.PI / 2
        const L = (h - 8) / 2
        const cx = w / 2
        const cy = h / 2
        const dx = Math.sin(ang) * L
        const dy = Math.cos(ang) * L
        return eq('damper', fr === null ? null : fr > 0.005, p, opts, w, h,
            rect('hmi-body', 1, 1, w - 2, h - 2, 1) +
            path('hmi-damper-blade', `M${f(cx - dx)} ${f(cy + dy)}L${f(cx + dx)} ${f(cy - dy)}`) +
            circle('hmi-hub', cx, cy, 3) +
            (w >= 80 ? `<text class="hmi-sub-value hmi-right" x="${f(w - 6)}" y="${f(h - 7)}">${fr === null ? '—' : escapeXml(formatValue(fr * 100, 0, opts.locale) + ' %')}</text>` : ''))
    }

    function renderMixer (sym, value, opts) {
        const p = sym.props || {}
        const { w, h } = sym
        const on = onState(value, p)
        const mh = h * 0.16
        const vy = h * 0.22
        const cx = w / 2
        const iy = h * 0.8
        const bw = w * 0.28
        return eq('mixer', on, p, opts, w, h,
            rect('hmi-body hmi-vessel', 1, vy, w - 2, h - vy - 1, Math.min(w * 0.16, 18)) +
            path('hmi-shaft', `M${f(cx)} ${f(mh)}V${f(iy)}`) +
            `<g transform="translate(${f(cx)},${f(iy)})"><g class="hmi-stir">${poly('hmi-part', [[-bw, -h * 0.03], [0, 0], [-bw, h * 0.03]])}${poly('hmi-part', [[bw, -h * 0.03], [0, 0], [bw, h * 0.03]])}</g></g>` +
            rect('hmi-body hmi-drive', cx - w * 0.16, 1, w * 0.32, mh, 2) +
            `<text class="hmi-glyph" x="${f(cx)}" y="${f(1 + mh / 2)}" font-size="${f(Math.min(mh * 0.6, w * 0.16))}">M</text>`)
    }

    function renderHeatExchanger (sym, value, opts) {
        const p = sym.props || {}
        const { w, h } = sym
        const on = onState(value, p)
        const y0 = h * 0.22
        const y1 = h * 0.78
        const hw = Math.min(w * 0.08, 16)
        const nz = Math.min(w * 0.07, 12)
        const tubes = [0.38, 0.5, 0.62].map(t => `M${f(hw + 6)} ${f(h * t)}H${f(w - hw - 6)}`).join('')
        return eq('exchanger', on, p, opts, w, h,
            rect('hmi-part', w * 0.22, 1, nz, y0, 1) + rect('hmi-part', w * 0.78 - nz, y1, nz, h - y1 - 1, 1) +
            rect('hmi-body', hw, y0, w - 2 * hw, y1 - y0, 3) +
            rect('hmi-part', 1, y0 + 3, hw, y1 - y0 - 6, 2) + rect('hmi-part', w - hw - 1, y0 + 3, hw, y1 - y0 - 6, 2) +
            path('hmi-detail', tubes))
    }

    function renderBoiler (sym, value, opts) {
        const p = sym.props || {}
        const { w, h } = sym
        const on = onState(value, p)
        const cx = w / 2
        const sw = w * 0.18
        const fy = h * 0.82
        const flame = `M${f(cx)} ${f(fy - h * 0.22)}C${f(cx + w * 0.22)} ${f(fy - h * 0.1)} ${f(cx + w * 0.16)} ${f(fy)} ${f(cx)} ${f(fy)}C${f(cx - w * 0.16)} ${f(fy)} ${f(cx - w * 0.22)} ${f(fy - h * 0.1)} ${f(cx)} ${f(fy - h * 0.22)}Z`
        return eq('boiler', on, p, opts, w, h,
            rect('hmi-part', w * 0.62, 1, sw, h * 0.14, 1) +
            rect('hmi-body', 1, h * 0.12, w - 2, h * 0.88 - 1, Math.min(w * 0.3, 26)) +
            rect('hmi-part', 1, fy + 2, w * 0.3, h - fy - 4, 2) +
            (on ? path('hmi-flame', flame) : ''))
    }

    function renderCoolingTower (sym, value, opts) {
        const p = sym.props || {}
        const { w, h } = sym
        const on = onState(value, p)
        const top = h * 0.16
        const base = h * 0.9
        const cx = w / 2
        const fr = Math.min(w * 0.3, top * 2)
        return eq('tower', on, p, opts, w, h,
            path('hmi-body', `M${f(w * 0.22)} ${f(top)}H${f(w * 0.78)}Q${f(w * 0.68)} ${f(h * 0.5)} ${f(w - 4)} ${f(base)}H4Q${f(w * 0.32)} ${f(h * 0.5)} ${f(w * 0.22)} ${f(top)}Z`) +
            rect('hmi-part', 1, base, w - 2, h - base - 1, 2) +
            path('hmi-detail', `M${f(w * 0.2)} ${f(h * 0.62)}H${f(w * 0.8)}M${f(w * 0.16)} ${f(h * 0.72)}H${f(w * 0.84)}`) +
            `<g transform="translate(${f(cx)},${f(top - 2)})"><g transform="scale(1,0.32)"><g class="hmi-spin">${circle('hmi-light', 0, 0, fr)}${path('hmi-inner', blades(fr, 4))}</g></g></g>`)
    }

    function renderChiller (sym, value, opts) {
        const p = sym.props || {}
        const { w, h } = sym
        const on = onState(value, p)
        const r = Math.min(w * 0.16, h * 0.28)
        const fans = [0.3, 0.7].map(x => circle('hmi-light', w * x, r + 3, r) + spin(w * x, r + 3, path('hmi-inner', blades(r * 0.85, 3)))).join('')
        const s = Math.min(w, h) * 0.13
        const sx = w * 0.22
        const sy = h * 0.72
        const flake = [0, 60, 120].map(a => {
            const rad = a * Math.PI / 180
            return `M${f(sx - Math.cos(rad) * s)} ${f(sy - Math.sin(rad) * s)}L${f(sx + Math.cos(rad) * s)} ${f(sy + Math.sin(rad) * s)}`
        }).join('')
        return eq('chiller', on, p, opts, w, h,
            rect('hmi-body', 1, r * 2 + 6, w - 2, h - r * 2 - 7, 3) + fans +
            path('hmi-inner', flake) +
            path('hmi-detail', `M${f(w * 0.45)} ${f(h * 0.62)}H${f(w * 0.9)}M${f(w * 0.45)} ${f(h * 0.74)}H${f(w * 0.9)}M${f(w * 0.45)} ${f(h * 0.86)}H${f(w * 0.9)}`))
    }

    function renderCyclone (sym, value, opts) {
        const p = sym.props || {}
        const { w, h } = sym
        const on = onState(value, p)
        const y0 = h * 0.1
        const y1 = h * 0.45
        const y2 = h * 0.88
        return eq('cyclone', on, p, opts, w, h,
            rect('hmi-part', w * 0.38, 1, w * 0.24, y0 + 4, 1) +
            rect('hmi-part', 1, y0 + 4, w * 0.2, h * 0.12, 1) +
            path('hmi-body', `M${f(w * 0.12)} ${f(y0)}H${f(w * 0.88)}V${f(y1)}L${f(w * 0.58)} ${f(y2)}H${f(w * 0.42)}L${f(w * 0.12)} ${f(y1)}Z`) +
            rect('hmi-part', w * 0.42, y2, w * 0.16, h - y2 - 1, 1) +
            path('hmi-detail hmi-dashed', `M${f(w * 0.2)} ${f(h * 0.2)}Q${f(w * 0.5)} ${f(h * 0.3)} ${f(w * 0.8)} ${f(h * 0.24)}M${f(w * 0.24)} ${f(h * 0.4)}Q${f(w * 0.5)} ${f(h * 0.5)} ${f(w * 0.74)} ${f(h * 0.44)}M${f(w * 0.36)} ${f(h * 0.62)}Q${f(w * 0.5)} ${f(h * 0.68)} ${f(w * 0.64)} ${f(h * 0.63)}`))
    }

    function renderFlowmeter (sym, value, opts) {
        const p = sym.props || {}
        const { w, h } = sym
        const st = rangeState(value, p.lo, p.hi)
        const py = h * 0.66
        const ph = h * 0.26
        const r = Math.min(h * 0.3, w * 0.2)
        const cx = r + 4
        const cy = r + 2
        let out = `<g class="hmi-eq hmi-flowmeter ${alarmCls(st)}">` +
            rect('hmi-pipe-body', 1, py, w - 2, ph, 1) +
            rect('hmi-part', cx - r * 0.9, py - 3, r * 1.8, ph + 6, 2) +
            path('hmi-stem', `M${f(cx)} ${f(cy + r)}V${f(py - 3)}`) +
            circle('hmi-body', cx, cy, r) +
            `<text class="hmi-glyph" x="${f(cx)}" y="${f(cy)}" font-size="${f(r * 0.7)}">${escapeXml(p.tagText || 'FT')}</text>`
        if (w > cx + r + 30) out += disp(cx + r + 6, cy - Math.min(r, 12), w - cx - r - 8, Math.min(2 * r, 24), valueText(value, p, opts))
        if (st === 'alarm') out += alarmIndicator(w - 6, 6, p.priority)
        return out + labelBelow(p, w, h) + '</g>'
    }

    function renderInstrument (sym, value, opts) {
        const p = sym.props || {}
        const { w, h } = sym
        const st = rangeState(value, p.lo, p.hi)
        const r = Math.max(8, Math.min(w, h) / 2 - 2)
        const cx = w / 2
        const cy = h / 2
        const loc = ['panel', 'behind', 'dcs'].includes(p.location) ? p.location : 'field'
        const fs = Math.max(8, r * 0.48)
        let out = `<g class="hmi-eq hmi-instrument ${alarmCls(st)} hmi-loc-${loc}">` +
            (loc === 'dcs' ? rect('hmi-part hmi-dcs', cx - r, cy - r, 2 * r, 2 * r, 1) : '') +
            circle('hmi-body', cx, cy, r) +
            (loc === 'panel' || loc === 'behind' ? path('hmi-inner' + (loc === 'behind' ? ' hmi-dashed' : ''), `M${f(cx - r)} ${f(cy)}H${f(cx + r)}`) : '') +
            `<text class="hmi-glyph" x="${f(cx)}" y="${f(cy - r * 0.36)}" font-size="${f(fs)}">${escapeXml(p.letters || '')}</text>` +
            `<text class="hmi-glyph hmi-thin" x="${f(cx)}" y="${f(cy + r * 0.4)}" font-size="${f(fs * 0.9)}">${escapeXml(p.number || '')}</text>`
        let y = h + 16
        if (p.showValue !== 'no' && sym.key) {
            out += `<text class="hmi-tag-value" x="${f(cx)}" y="${f(y)}" font-size="13">${escapeXml(valueText(value, p, opts))}</text>`
            y += 18
        }
        if (st === 'alarm') out += alarmIndicator(cx + r * 0.8, cy - r * 0.8, p.priority)
        if (p.label) out += `<text class="hmi-label" x="${f(cx)}" y="${f(y)}">${escapeXml(p.label)}</text>`
        return out + '</g>'
    }

    // ---------- Fábrica ----------

    function renderCrane (sym, value, opts) {
        const p = sym.props || {}
        const { w, h } = sym
        const hoist = p.kind === 'hoist'
        const v = num(value)
        const bh = Math.max(10, h * 0.08)
        const tw = Math.min(w * 0.18, 70)
        const th = Math.max(12, h * 0.1)
        const x = hoist ? (w - tw) / 2 : (v === null ? (w - tw) / 2 : 6 + scaleOf(p).frac(v) * (w - tw - 12))
        let hf
        if (hoist) hf = v === null ? 0.5 : scaleOf(p).frac(v)
        else {
            const hv = num(raw(opts, p.hookKey))
            hf = hv === null ? 0.5 : scaleOf({ min: p.hookMin, max: p.hookMax }).frac(hv)
        }
        const top = bh + th
        const hookY = top + 10 + (1 - hf) * (h - top - 40)
        const cx = x + tw / 2
        const load = keyOn(opts, p.loadKey) === true
        const out = (hoist ? rect('hmi-part', w * 0.3, 1, w * 0.4, bh, 1) : rect('hmi-part', 1, 1, w - 2, bh, 1) + rect('hmi-part', 1, 1, 10, bh + 6, 1) + rect('hmi-part', w - 11, 1, 10, bh + 6, 1)) +
            rect('hmi-body', x, bh + 1, tw, th, 2) +
            path('hmi-cable', `M${f(cx - 3)} ${f(top + 1)}V${f(hookY)}M${f(cx + 3)} ${f(top + 1)}V${f(hookY)}`) +
            rect('hmi-part', cx - 8, hookY, 16, 8, 2) +
            path('hmi-hook', `M${f(cx)} ${f(hookY + 8)}v8a5 5 0 1 1 -8 -3`) +
            (load ? rect('hmi-load', cx - tw * 0.55, hookY + 22, tw * 1.1, Math.min(30, h - hookY - 22), 2) : '')
        return eq('crane', v !== null ? true : null, p, opts, w, h, out)
    }

    function renderRobot (sym, value, opts) {
        const p = sym.props || {}
        const { w, h } = sym
        const on = onState(value, p)
        const weld = keyOn(opts, p.weldKey) === true
        const sx = w * 0.32
        const sy = h * 0.72
        const t = Math.max(6, Math.min(w, h) * 0.09)
        const ex = w * 0.5
        const ey = h * 0.2
        const tx = w * 0.88
        const ty = h * 0.42
        const seg = (x1, y1, x2, y2) => {
            const len = Math.hypot(x2 - x1, y2 - y1) || 1
            const nx = -(y2 - y1) / len * t / 2
            const ny = (x2 - x1) / len * t / 2
            return poly('hmi-body', [[x1 + nx, y1 + ny], [x2 + nx, y2 + ny], [x2 - nx, y2 - ny], [x1 - nx, y1 - ny]])
        }
        const star = Array.from({ length: 8 }, (x, i) => {
            const a = i * Math.PI / 4
            const r = i % 2 ? 4 : 10
            return [tx + 4 + Math.cos(a) * r, ty + 10 + Math.sin(a) * r]
        })
        return eq('robot', on, p, opts, w, h,
            rect('hmi-part', w * 0.1, h - h * 0.1, w * 0.44, h * 0.1 - 1, 2) +
            rect('hmi-part', sx - w * 0.12, sy, w * 0.24, h * 0.18, 2) +
            `<g transform="translate(${f(sx)},${f(sy)})"><g class="hmi-arm"><g transform="translate(${f(-sx)},${f(-sy)})">` +
            seg(sx, sy, ex, ey) + seg(ex, ey, tx, ty) +
            circle('hmi-joint', ex, ey, t * 0.7) +
            path('hmi-stem', `M${f(tx)} ${f(ty)}l4 10`) +
            (weld ? poly('hmi-spark', star) : '') + '</g></g></g>' +
            circle('hmi-joint', sx, sy, t * 0.8))
    }

    function renderWelder (sym, value, opts) {
        const p = sym.props || {}
        const { w, h } = sym
        const v = num(value)
        const arc = p.arcKey ? keyOn(opts, p.arcKey) : (v === null ? null : v > 0)
        return eq('welder', arc, p, opts, w, h,
            rect('hmi-body', 1, 1, w - 2, h - 2, 4) +
            disp(w * 0.12, h * 0.1, w * 0.76, h * 0.26, valueText(value, p, opts)) +
            circle('hmi-led hmi-led-arc', w * 0.25, h * 0.54, Math.min(w, h) * 0.06) +
            `<text class="hmi-sub-value hmi-left" x="${f(w * 0.36)}" y="${f(h * 0.54)}">ARCO</text>` +
            circle('hmi-terminal-big', w * 0.32, h * 0.8, Math.min(w, h) * 0.07) + circle('hmi-terminal-big', w * 0.68, h * 0.8, Math.min(w, h) * 0.07))
    }

    function renderOven (sym, value, opts) {
        const p = sym.props || {}
        const { w, h } = sym
        const st = rangeState(value, p.lo, p.hi)
        const open = keyOn(opts, p.doorKey) === true
        const heat = keyOn(opts, p.heatKey) === true
        const dx = w * 0.62
        const waves = [0.2, 0.33, 0.46].map(x => `M${f(w * x)} ${f(h * 0.82)}q${f(w * 0.03)} ${f(-h * 0.06)} 0 ${f(-h * 0.12)}t0 ${f(-h * 0.12)}`).join('')
        let out = `<g class="hmi-eq hmi-oven ${alarmCls(st)}${heat ? ' hmi-heating' : ''}${open ? ' hmi-door-open' : ''}">` +
            rect('hmi-body', 1, 1, w - 2, h - 2, 3) +
            disp(w * 0.08, h * 0.08, w * 0.48, h * 0.2, valueText(value, p, opts)) +
            path('hmi-heat', waves) +
            (open
                ? poly('hmi-door', [[dx, h * 0.08], [w - 1 + w * 0.12, h * 0.16], [w - 1 + w * 0.12, h * 0.84], [dx, h * 0.92]]) + rect('hmi-opening', dx, h * 0.08, w - dx - 6, h * 0.84, 1)
                : rect('hmi-door', dx, h * 0.08, w - dx - 6, h * 0.84, 2) + rect('hmi-part', dx + 6, h * 0.45, 4, h * 0.12, 1))
        if (st === 'alarm') out += alarmIndicator(w - 8, 8, p.priority)
        return out + labelBelow(p, w, h) + '</g>'
    }

    function renderPaintBooth (sym, value, opts) {
        const p = sym.props || {}
        const { w, h } = sym
        const on = onState(value, p)
        const top = h * 0.2
        const r = Math.min(top * 0.7, w * 0.08)
        const gx = w * 0.18
        const gy = h * 0.55
        return eq('booth', on, p, opts, w, h,
            rect('hmi-part', w * 0.74, 1, r * 2.4, top, 1) +
            spin(w * 0.74 + r * 1.2, top / 2 + 1, circle('hmi-light', 0, 0, r) + path('hmi-inner', blades(r * 0.9, 3))) +
            rect('hmi-body', 1, top, w - 2, h - top - 1, 2) +
            path('hmi-detail', `M1 ${f(h - 8)}H${f(w - 1)}`) +
            rect('hmi-part', gx - w * 0.07, gy - 5, w * 0.1, 10, 2) +
            rect('hmi-part', gx - w * 0.05, gy + 4, 5, h * 0.12, 1) +
            path('hmi-spray', `M${f(gx + w * 0.03)} ${f(gy)}L${f(w * 0.6)} ${f(gy - h * 0.18)}V${f(gy + h * 0.18)}Z`) +
            rect('hmi-part', w * 0.62, h * 0.32, w * 0.2, h * 0.44, 2))
    }

    function renderCalender (sym, value, opts) {
        const p = sym.props || {}
        const { w, h } = sym
        const on = onState(value, p)
        const r = Math.min(w * 0.16, h * 0.2)
        const cx = w / 2
        const d = r * 2.1
        const ty = r + 4
        const by = ty + r * 1.95
        const roll = (x, y, dir) => spin(x, y, circle('hmi-body', 0, 0, r) + path('hmi-mark', `M0 ${f(-r * 0.7)}V${f(r * 0.7)}`), dir)
        const back = p.dir === 'ccw' ? 'cw' : 'ccw'
        return eq('calender', on, p, opts, w, h,
            rect('hmi-part hmi-frame-back', cx - d - r - 6, 1, (d + r + 6) * 2, h - 2, 4) +
            path('hmi-plate', `M2 ${f(by - r - 3)}Q${f(cx)} ${f(ty + r + 6)} ${f(w - 2)} ${f(by - r - 3)}`) +
            roll(cx, ty, p.dir) + roll(cx - d, by, back) + roll(cx + d, by, back))
    }

    function renderPress (sym, value, opts) {
        const p = sym.props || {}
        const { w, h } = sym
        let fr = null
        const v = num(value)
        if (v !== null) fr = scaleOf(p).frac(v)
        else if (typeof value === 'boolean') fr = value ? 1 : 0
        const crown = h * 0.16
        const bed = h * 0.8
        const cw = w * 0.12
        const rh = h * 0.14
        const travel = bed - crown - rh - h * 0.08
        const ry = crown + (fr === null ? 0 : fr) * travel
        return eq('press', fr === null ? null : fr > 0.02, p, opts, w, h,
            rect('hmi-part', 1, 1, cw, h - 2, 1) + rect('hmi-part', w - cw - 1, 1, cw, h - 2, 1) +
            rect('hmi-body', 1, 1, w - 2, crown, 2) +
            rect('hmi-stem-rect', w / 2 - w * 0.05, crown, w * 0.1, ry - crown) +
            rect('hmi-body hmi-ram', cw + 3, ry, w - 2 * cw - 6, rh, 2) +
            rect('hmi-body', cw + 3, bed, w - 2 * cw - 6, h * 0.08, 1) +
            rect('hmi-part', 1, h - h * 0.1, w - 2, h * 0.1 - 1, 2))
    }

    function renderScale (sym, value, opts) {
        const p = sym.props || {}
        const { w, h } = sym
        const st = rangeState(value, p.lo, p.hi)
        const py = h * 0.72
        let out = `<g class="hmi-eq hmi-scale ${alarmCls(st)}">` +
            rect('hmi-body', 1, py, w - 2, h * 0.16, 2) +
            rect('hmi-part', 6, py + h * 0.16, 10, h - py - h * 0.16 - 1, 1) + rect('hmi-part', w - 16, py + h * 0.16, 10, h - py - h * 0.16 - 1, 1) +
            path('hmi-stem', `M${f(w / 2)} ${f(py)}V${f(h * 0.5)}`) +
            disp(w * 0.18, 2, w * 0.64, h * 0.46, valueText(value, p, opts))
        if (st === 'alarm') out += alarmIndicator(w - 6, 8, p.priority)
        return out + labelBelow(p, w, h) + '</g>'
    }

    function renderVehicle (sym, value, opts) {
        const p = sym.props || {}
        const { w, h } = sym
        const kind = ['agv', 'forklift'].includes(p.kind) ? p.kind : 'cart'
        const moves = p.move === 'pos'
        const v = num(value)
        const rail = kind === 'cart'
        const vh = rail ? h - 8 : h
        const vw = Math.min(w, vh * 1.7)
        const x = moves ? (v === null ? (w - vw) / 2 : scaleOf(p).frac(v) * (w - vw)) : (w - vw) / 2
        const on = moves ? (v === null ? null : true) : onState(value, p)
        const wr = Math.max(3, vh * 0.12)
        const wy = vh - wr - 1
        let body
        if (kind === 'forklift') {
            body = rect('hmi-part', x + vw * 0.08, 1, vw * 0.05, vh * 0.8, 1) +
                rect('hmi-part', x, vh * 0.68, vw * 0.3, vh * 0.06, 1) +
                rect('hmi-body', x + vw * 0.16, vh * 0.3, vw * 0.8, vh * 0.48, 4) +
                path('hmi-detail', `M${f(x + vw * 0.4)} ${f(vh * 0.3)}V${f(vh * 0.06)}H${f(x + vw * 0.8)}V${f(vh * 0.3)}`)
        } else if (kind === 'agv') {
            body = rect('hmi-body', x + 1, vh * 0.2, vw - 2, vh * 0.58, 4) +
                rect('hmi-led-rect', x + vw * 0.1, vh * 0.32, vw * 0.8, vh * 0.08, 2) +
                path('hmi-arrowhead', `M${f(x + vw * 0.45)} ${f(vh * 0.48)}l${f(vw * 0.1)} ${f(vh * 0.1)}l${f(-vw * 0.1)} ${f(vh * 0.1)}Z`)
        } else {
            body = rect('hmi-body', x + 1, vh * 0.3, vw - 2, vh * 0.48, 3) +
                rect('hmi-load', x + vw * 0.15, vh * 0.05, vw * 0.7, vh * 0.25, 2)
        }
        const wheels = circle('hmi-wheel', x + vw * 0.22, wy, wr) + circle('hmi-wheel', x + vw * 0.78, wy, wr)
        return eq('vehicle hmi-' + kind, on, p, opts, w, h,
            (rail ? rect('hmi-part', 1, h - 6, w - 2, 5, 1) : '') + body + wheels)
    }

    function renderRollerTable (sym, value, opts) {
        const p = sym.props || {}
        const { w, h } = sym
        const on = onState(value, p)
        const r = Math.max(4, Math.min(h * 0.32, 16))
        const n = Math.max(2, Math.floor((w - 4) / (r * 2.6)))
        let rolls = ''
        for (let i = 0; i < n; i++) {
            const x = 2 + r + (w - 4 - 2 * r) * i / (n - 1)
            rolls += spin(x, r + 2, circle('hmi-body', 0, 0, r) + path('hmi-mark', `M0 ${f(-r * 0.7)}V${f(r * 0.7)}`), p.dir)
        }
        return eq('rolltable', on, p, opts, w, h,
            rect('hmi-part', 1, r + 2, w - 2, h - r - 3, 2) + rolls)
    }

    // ---------- Valores / Estados ----------

    function renderIsaBar (sym, value, opts) {
        const p = sym.props || {}
        const { w, h } = sym
        const vert = h >= w
        const sc = scaleOf(p)
        const v = num(value)
        const lolo = num(p.lolo)
        const lo = num(p.lo)
        const hi = num(p.hi)
        const hihi = num(p.hihi)
        let level = v === null ? null : 'normal'
        if (v !== null) {
            if ((lolo !== null && v < lolo) || (hihi !== null && v > hihi)) level = 'alarm'
            else if ((lo !== null && v < lo) || (hi !== null && v > hi)) level = 'warn'
        }
        const t = vert ? Math.max(8, Math.min(18, w * 0.24)) : Math.max(8, Math.min(18, h * 0.2))
        const A0 = vert ? h - 24 : 10
        const A1 = vert ? 22 : w - 10
        const c0 = vert ? (w - t) / 2 : 26
        const along = val => A0 + sc.frac(val) * (A1 - A0)
        const band = (a, b, cls) => {
            const s = Math.min(along(a), along(b))
            const len = Math.abs(along(b) - along(a))
            return vert ? rect(cls, c0, s, t, len) : rect(cls, s, c0, len, t)
        }
        const P = (a, c) => (vert ? [c, a] : [a, c])
        const tri = (a, c, dir, cls) => poly(cls, [P(a, c), P(a - 6, c + dir * 10), P(a + 6, c + dir * 10)])
        let out = `<g class="hmi-isabar hmi-${level === null ? 'unknown' : level}">` +
            band(sc.min, sc.max, 'hmi-isa-track')
        if (lolo !== null) out += band(sc.min, lolo, 'hmi-isa-ll')
        if (hihi !== null) out += band(hihi, sc.max, 'hmi-isa-ll')
        if (lo !== null || hi !== null) out += band(lo === null ? sc.min : lo, hi === null ? sc.max : hi, 'hmi-isa-normal')
        const sp = num(raw(opts, p.spKey))
        if (sp !== null) out += tri(along(Math.max(sc.min, Math.min(sc.max, sp))), c0 + t + 1, 1, 'hmi-isa-sp')
        if (v !== null) out += tri(along(Math.max(sc.min, Math.min(sc.max, v))), c0 - 1, -1, 'hmi-isa-ptr')
        const text = valueText(value, p, opts)
        const title = escapeXml(p.title || sym.key || '')
        if (vert) {
            out += `<text class="hmi-tag-title" x="${f(w / 2)}" y="12" font-size="${f(Math.max(9, Math.min(12, w * 0.18)))}">${title}</text>` +
                `<text class="hmi-tag-value" x="${f(w / 2)}" y="${f(h - 6)}" font-size="${f(Math.max(9, Math.min(15, w * 0.2)))}">${escapeXml(text)}</text>`
        } else {
            out += `<text class="hmi-tag-title hmi-left" x="10" y="11" font-size="11">${title}</text>` +
                `<text class="hmi-tag-value hmi-right" x="${f(w - 10)}" y="11" font-size="12">${escapeXml(text)}</text>`
        }
        if (level === 'alarm' || level === 'warn') {
            const pr = level === 'alarm' ? '1' : (p.priority || '2')
            out += vert ? alarmIndicator(w - 9, 30, pr) : alarmIndicator(w - 10, c0 + t + 18, pr)
        }
        return out + '</g>'
    }

    function renderCounter (sym, value, opts) {
        const p = sym.props || {}
        const { w, h } = sym
        const v = num(value)
        let text
        if (v === null) text = '—'
        else if (p.kind === 'hours' && (p.src === 's' || p.src === 'min')) {
            const totalMin = Math.floor(p.src === 's' ? v / 60 : v)
            text = formatValue(Math.floor(totalMin / 60), 0, opts.locale) + ' h ' + String(totalMin % 60).padStart(2, '0') + ' min'
        } else text = formatValue(v, p.kind === 'hours' ? p.decimals : 0, opts.locale) + (p.kind === 'hours' ? ' h' : (p.unit ? ' ' + p.unit : ''))
        const ir = Math.min(h * 0.28, 16)
        const ix = ir + 8
        const iy = h * 0.58
        const icon = p.kind === 'hours'
            ? circle('hmi-icon', ix, iy, ir) + path('hmi-icon-hand', `M${f(ix)} ${f(iy)}V${f(iy - ir * 0.65)}M${f(ix)} ${f(iy)}L${f(ix + ir * 0.5)} ${f(iy + ir * 0.2)}`)
            : rect('hmi-icon', ix - ir, iy - ir * 0.7, ir * 2, ir * 1.4, 2) + `<text class="hmi-glyph" x="${f(ix)}" y="${f(iy)}" font-size="${f(ir)}">#</text>`
        return `<g class="hmi-counter ${v === null ? 'hmi-unknown' : 'hmi-normal'}">` +
            rect('hmi-tag-box', 0.5, 0.5, w - 1, h - 1, 4) +
            `<text class="hmi-tag-title hmi-left" x="8" y="${f(Math.min(15, h * 0.25))}" font-size="${f(Math.max(8, Math.min(12, h * 0.18, (w - 16) / Math.max(4, String(p.title || sym.key || '').length) * 1.6)))}">${escapeXml(p.title || sym.key || '')}</text>` +
            icon +
            `<text class="hmi-tag-value hmi-right" x="${f(w - 8)}" y="${f(iy + 1)}" font-size="${f(Math.max(10, Math.min(h * 0.32, (w - ix - ir - 16) / Math.max(4, text.length) * 1.55)))}" dominant-baseline="central">${escapeXml(text)}</text>` +
            labelBelow(p, w, h) + '</g>'
    }

    // "0=MAN,1=AUTO" -> { '0': 'MAN', '1': 'AUTO' }
    function modeTexts (s) {
        const out = {}
        for (const part of String(s || '').split(',')) {
            const i = part.indexOf('=')
            if (i > 0) out[part.slice(0, i).trim()] = part.slice(i + 1).trim()
        }
        return out
    }

    function renderMode (sym, value, opts) {
        const p = sym.props || {}
        const { w, h } = sym
        const texts = modeTexts(p.texts)
        let k = value
        if (typeof k === 'boolean') k = k ? 1 : 0
        const known = k !== undefined && k !== null && k !== ''
        const text = known ? (texts[String(k)] !== undefined ? texts[String(k)] : String(k)) : '—'
        const abnormal = known && p.normal !== undefined && p.normal !== '' && String(k) !== String(p.normal)
        const cls = !known ? 'hmi-unknown' : (abnormal ? 'hmi-abnormal' : 'hmi-normal')
        const title = p.title ? `<text class="hmi-tag-title hmi-left" x="8" y="${f(h / 2)}" font-size="${f(Math.max(9, Math.min(12, h * 0.34)))}" dominant-baseline="central">${escapeXml(p.title)}</text>` : ''
        return `<g class="hmi-mode ${cls}">` +
            rect('hmi-mode-box', 1, 1, w - 2, h - 2, 4) + title +
            `<text class="hmi-mode-text${p.title ? ' hmi-right' : ''}" x="${f(p.title ? w - 8 : w / 2)}" y="${f(h / 2)}" font-size="${f(Math.max(10, Math.min(h * 0.46, 18)))}">${escapeXml(text)}</text>` +
            labelBelow(p, w, h) + '</g>'
    }

    function renderInterlock (sym, value, opts) {
        const p = sym.props || {}
        const { w, h } = sym
        const on = onState(value, p)
        const s = Math.min(w, h)
        const cx = w / 2
        if (p.kind === 'perm') {
            const r = s / 2 - 2
            const cy = h / 2
            const mark = on === false
                ? `M${f(cx - r * 0.4)} ${f(cy - r * 0.4)}L${f(cx + r * 0.4)} ${f(cy + r * 0.4)}M${f(cx + r * 0.4)} ${f(cy - r * 0.4)}L${f(cx - r * 0.4)} ${f(cy + r * 0.4)}`
                : `M${f(cx - r * 0.45)} ${f(cy)}L${f(cx - r * 0.1)} ${f(cy + r * 0.38)}L${f(cx + r * 0.48)} ${f(cy - r * 0.35)}`
            return `<g class="hmi-perm ${stateClass(on)}">${circle('hmi-perm-ring', cx, cy, r)}${path('hmi-perm-mark', mark)}${labelBelow(p, w, h)}</g>`
        }
        const bw = s * 0.7
        const bh = s * 0.5
        const by = h - bh - 2
        const sr = bw * 0.3
        const lift = on ? 0 : sr * 0.8
        return `<g class="hmi-lock ${stateClass(on)}">` +
            path('hmi-shackle', `M${f(cx - sr)} ${f(by)}V${f(by - sr - lift)}a${f(sr)} ${f(sr)} 0 0 1 ${f(sr * 2)} 0V${f(by - (on ? 0 : lift * 0.2))}`) +
            rect('hmi-lock-body', cx - bw / 2, by, bw, bh, 3) +
            circle('hmi-keyhole', cx, by + bh * 0.45, Math.max(1.5, bh * 0.12)) +
            labelBelow(p, w, h) + '</g>'
    }

    // ---------- Linhas: conexões e setas ----------

    function renderFitting (sym, value, opts) {
        const p = sym.props || {}
        const { w, h } = sym
        const on = p.onWhen && sym.key ? onState(value, p) : null
        const t = Math.max(2, Number(p.thick) || 8)
        const cx = w / 2
        const cy = h / 2
        let d = ''
        let extra = ''
        switch (p.kind) {
        case 'tee': d = `M0 ${f(cy)}H${f(w)}M${f(cx)} ${f(cy)}V${f(h)}`; break
        case 'cross': d = `M0 ${f(cy)}H${f(w)}M${f(cx)} 0V${f(h)}`; break
        case 'flange':
            d = `M0 ${f(cy)}H${f(w)}`
            extra = rect('hmi-flange', cx - t * 0.9, cy - t * 1.4, t * 0.7, t * 2.8, 1) + rect('hmi-flange', cx + t * 0.2, cy - t * 1.4, t * 0.7, t * 2.8, 1)
            break
        case 'reducer':
            extra = poly('hmi-fit-fill', [[0, cy - t * 0.9], [w * 0.35, cy - t * 0.9], [w * 0.65, cy - t / 2], [w, cy - t / 2], [w, cy + t / 2], [w * 0.65, cy + t / 2], [w * 0.35, cy + t * 0.9], [0, cy + t * 0.9]])
            break
        case 'cap':
            d = `M0 ${f(cy)}H${f(w - t)}`
            extra = path('hmi-fit-fill', `M${f(w - t * 1.2)} ${f(cy - t * 0.75)}h${f(t * 0.4)}a${f(t * 0.75)} ${f(t * 0.75)} 0 0 1 0 ${f(t * 1.5)}h${f(-t * 0.4)}Z`)
            break
        default: d = `M0 ${f(cy)}H${f(cx)}V${f(h)}` // elbow
        }
        const sw = ` style="stroke-width:${f(t)}px"`
        return `<g class="hmi-fitting ${stateClass(on)}">` +
            (d ? `<path class="hmi-hit" d="${d}"/><path class="hmi-fit-pipe" d="${d}"${sw}/>` : '') + extra + '</g>'
    }

    function renderArrow (sym, value, opts) {
        const p = sym.props || {}
        const { w, h } = sym
        const on = sym.key ? onState(value, p) : true
        const color = ['info', 'warn', 'alarm', 'ok'].includes(p.color) ? p.color : 'auto'
        const t = h * 0.36
        const hl = Math.min(w * 0.4, h * 0.9)
        let shape
        if (p.kind === 'double') {
            shape = poly('hmi-arrow-body', [[0, h / 2], [hl, 0], [hl, h / 2 - t / 2], [w - hl, h / 2 - t / 2], [w - hl, 0], [w, h / 2], [w - hl, h], [w - hl, h / 2 + t / 2], [hl, h / 2 + t / 2], [hl, h]])
        } else if (p.kind === 'chevron') {
            const n = Math.max(1, Math.round(w / (h * 0.9)))
            const step = w / n
            shape = Array.from({ length: n }, (x, i) => {
                const x0 = i * step
                const k = step * 0.45
                return poly('hmi-arrow-body', [[x0, 0], [x0 + k, 0], [x0 + step * 0.9, h / 2], [x0 + k, h], [x0, h], [x0 + step * 0.9 - k, h / 2]])
            }).join('')
        } else {
            shape = poly('hmi-arrow-body', [[0, h / 2 - t / 2], [w - hl, h / 2 - t / 2], [w - hl, 0], [w, h / 2], [w - hl, h], [w - hl, h / 2 + t / 2], [0, h / 2 + t / 2]])
        }
        return `<g class="hmi-arrow hmi-c-${color} ${stateClass(on)}">${shape}${labelBelow(p, w, h)}</g>`
    }

    // ---------- Alarmes ----------

    const EVENT_TEXT = { ATIVO: 'ATIVO', NORMAL: 'NORMAL', RECONHECIDO: 'RECONHECIDO', SUPRIMIDO: 'SUPRIMIDO', LIBERADO: 'LIBERADO' }
    const when = (ts, locale) => {
        try {
            return new Date(ts).toLocaleString(locale || 'pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
        } catch (e) { return new Date(ts).toISOString().slice(5, 19).replace('T', ' ') }
    }
    const clip = (t, px, size) => {
        const max = Math.max(3, Math.floor(px / (size * 0.56)))
        t = String(t || '')
        return t.length > max ? t.slice(0, max - 1) + '…' : t
    }
    // the list shown in the editor, where there are no real alarms
    const SAMPLE = {
        active: [
            { id: 'ex1', text: 'Motor M1 em falha (exemplo)', priority: '1', active: true, acked: false, since: Date.UTC(2026, 9, 17, 11, 2, 5) },
            { id: 'ex2', text: 'Temperatura estufa alto (exemplo)', priority: '2', active: true, acked: true, since: Date.UTC(2026, 9, 17, 10, 41, 30) },
            { id: 'ex3', text: 'Nível tanque baixo (exemplo)', priority: '3', active: false, acked: false, since: Date.UTC(2026, 9, 17, 9, 15, 0) }
        ],
        history: [
            { ts: Date.UTC(2026, 9, 17, 11, 2, 5), text: 'Motor M1 em falha (exemplo)', priority: '1', event: 'ATIVO' },
            { ts: Date.UTC(2026, 9, 17, 10, 50, 0), text: 'Temperatura estufa alto (exemplo)', priority: '2', event: 'RECONHECIDO', user: 'operador' }
        ]
    }

    function renderAlarmList (sym, value, opts) {
        const p = sym.props || {}
        const { w, h } = sym
        const data = opts.alarms || (opts.editor ? SAMPLE : { active: [], history: [] })
        const tab = (opts.ui && opts.ui.tab) || p.tab || 'active'
        const rowH = Math.max(18, Number(p.rowHeight) || 26)
        const fs = Math.max(10, Math.min(14, rowH * 0.5))
        const head = 34
        const rows = Math.max(1, Math.floor((h - head - 4) / rowH))
        const active = Array.isArray(data.active) ? data.active : []
        const unacked = active.filter(a => !a.acked).length
        const shelvedList = Array.isArray(data.shelved) ? data.shelved : []
        // the node tells each page what its user may do
        const perm = opts.perm || {}
        const canAck = perm.ack !== false
        const canShelve = p.shelve !== 'no' && perm.shelve !== false
        const tx0 = Math.max(150, Math.min(w * 0.32, w - 152 - 340))
        const btn = (x, y, bw, bh, label, action, cls) => `<g class="hmi-al-btn${cls ? ' ' + cls : ''}" data-hmi="${escapeXml(action)}">${rect('hmi-al-btn-box', x, y, bw, bh, 4)}<text x="${f(x + bw / 2)}" y="${f(y + bh / 2)}" font-size="12">${escapeXml(label)}</text></g>`
        let out = `<g class="hmi-alarmlist">` + rect('hmi-tag-box', 0.5, 0.5, w - 1, h - 1, 4) +
            `<text class="hmi-tag-title hmi-left" x="10" y="21" font-size="13">${escapeXml((p.title || 'ALARMES') + ' (' + active.length + ')')}</text>` +
            btn(tx0, 6, 78, 22, 'Ativos', 'tab:active', tab === 'active' ? 'hmi-al-sel' : '') +
            btn(tx0 + 84, 6, 84, 22, 'Histórico', 'tab:history', tab === 'history' ? 'hmi-al-sel' : '') +
            (p.shelve !== 'no' ? btn(tx0 + 174, 6, 112, 22, 'Suprimidos (' + shelvedList.length + ')', 'tab:shelved', tab === 'shelved' ? 'hmi-al-sel' : '') : '') +
            (unacked && canAck ? btn(w - 152, 6, 144, 22, 'Reconhecer todos', 'ack:all', 'hmi-al-ackall') : '') +
            (opts.sound && opts.sound !== 'off' ? btn(w - 190, 6, 32, 22, opts.muted ? '🔕' : '🔔', 'mute', 'hmi-al-shelve') : '') +
            path('hmi-al-line', `M1 ${head}H${f(w - 1)}`)
        const tx = 48
        const tw = w - tx - 10
        const timeW = Math.min(150, tw * 0.3)
        const list = tab === 'history' ? (Array.isArray(data.history) ? data.history : []) : (tab === 'shelved' ? shelvedList : active)
        if (!list.length) out += `<text class="hmi-al-empty" x="${f(w / 2)}" y="${f(head + rowH)}" font-size="${f(fs)}">${tab === 'history' ? 'Sem eventos' : (tab === 'shelved' ? 'Nenhum alarme suprimido' : 'Nenhum alarme')}</text>`
        list.slice(0, rows).forEach((a, i) => {
            const y = head + 2 + i * rowH
            const cy = y + rowH / 2
            const pr = ['1', '2', '3'].includes(String(a.priority)) ? String(a.priority) : '2'
            let state
            let cls
            if (tab === 'history') {
                state = (EVENT_TEXT[a.event] || a.event || '') + (a.user ? ' · ' + a.user : '')
                cls = 'hmi-al-hist'
            } else if (tab === 'shelved') {
                state = 'ATÉ ' + when(a.until, opts.locale).slice(-8, -3) + (a.by ? ' · ' + a.by : '')
                cls = 'hmi-al-hist'
            } else {
                state = a.active ? (a.acked ? 'RECONHECIDO' : 'ATIVO') : 'NORMAL'
                cls = a.active ? (a.acked ? 'hmi-al-acked' : 'hmi-al-unacked') : 'hmi-al-rtn'
            }
            const stateW = tab === 'active' ? 118 : Math.min(200, tw * 0.3)
            const ackW = tab === 'active' && !a.acked && canAck ? 34 : 0
            const shW = (tab === 'active' && canShelve) || (tab === 'shelved' && perm.shelve !== false) ? 34 : 0
            const textW = tw - timeW - stateW - ackW - shW - 16
            // a click on the row shows the symbol on the screen
            out += `<g class="hmi-al-row ${cls}"${a.symbolId ? ` data-hmi="goto:${escapeXml(a.symbolId)}"` : ''}>` + rect('hmi-al-hit', 1, y, w - 2, rowH) + (i % 2 ? rect('hmi-al-stripe', 1, y, w - 2, rowH) : '') +
                `<g class="${cls === 'hmi-al-unacked' ? 'hmi-blink' : ''}">${alarmIndicator(24, cy, pr)}</g>` +
                `<text class="hmi-al-time hmi-left" x="${tx}" y="${f(cy)}" font-size="${f(fs * 0.92)}">${escapeXml(tab === 'shelved' ? 'suprimido' : when(a.since || a.ts, opts.locale))}</text>` +
                `<text class="hmi-al-text hmi-left" x="${f(tx + timeW + 8)}" y="${f(cy)}" font-size="${f(fs)}">${escapeXml(clip(a.text, textW, fs))}</text>` +
                `<text class="hmi-al-state hmi-left" x="${f(w - 10 - ackW - shW - stateW)}" y="${f(cy)}" font-size="${f(fs * 0.85)}">${escapeXml(clip(state, stateW, fs * 0.85))}</text>` +
                (shW ? btn(w - 10 - ackW - shW + 4, cy - 10, shW - 4, 20, tab === 'shelved' ? '▶' : 'II', (tab === 'shelved' ? 'unshelve:' : 'shelve:') + a.id, 'hmi-al-shelve') : '') +
                (ackW ? btn(w - 10 - ackW + 4, cy - 10, ackW - 4, 20, '✓', 'ack:' + a.id, 'hmi-al-ack') : '') + '</g>'
        })
        if (list.length > rows) out += `<text class="hmi-al-more hmi-right" x="${f(w - 10)}" y="${f(h - 4)}" font-size="10">+${list.length - rows}</text>`
        return out + '</g>'
    }

    function renderAlarmSummary (sym, value, opts) {
        const p = sym.props || {}
        const { w, h } = sym
        const data = opts.alarms || (opts.editor ? SAMPLE : { active: [] })
        const active = Array.isArray(data.active) ? data.active : []
        const unacked = active.filter(a => !a.acked)
        const top = (unacked.length ? unacked : active).reduce((m, a) => Math.min(m, Number(a.priority) || 3), 9)
        const s = Math.min(h * 0.7, 28)
        const bx = 8 + s / 2
        const bell = `M${f(bx - s * 0.36)} ${f(h / 2 + s * 0.22)}c0 -${f(s * 0.1)} ${f(s * 0.08)} -${f(s * 0.1)} ${f(s * 0.08)} -${f(s * 0.3)}v-${f(s * 0.16)}a${f(s * 0.28)} ${f(s * 0.28)} 0 0 1 ${f(s * 0.56)} 0v${f(s * 0.16)}c0 ${f(s * 0.2)} ${f(s * 0.08)} ${f(s * 0.2)} ${f(s * 0.08)} ${f(s * 0.3)}z`
        const txt = active.length ? active.length + (active.length === 1 ? ' ALARME' : ' ALARMES') : 'SEM ALARMES'
        return `<g class="hmi-alsum ${active.length ? 'hmi-p' + top : 'hmi-al-none'}${unacked.length ? ' hmi-al-new' : ''}">` +
            rect('hmi-alsum-box', 1, 1, w - 2, h - 2, 6) +
            `<g class="${unacked.length ? 'hmi-blink' : ''}">${path('hmi-bell', bell)}${circle('hmi-bell', bx, h / 2 + s * 0.32, s * 0.08)}</g>` +
            `<text class="hmi-alsum-text hmi-left" x="${f(bx + s * 0.6)}" y="${f(h / 2)}" font-size="${f(Math.max(10, Math.min(h * 0.4, 16)))}">${escapeXml(txt)}${unacked.length ? escapeXml(' · ' + unacked.length + ' novo' + (unacked.length === 1 ? '' : 's')) : ''}</text>` +
            labelBelow(p, w, h) + '</g>'
    }

    const symbols = {
        alarmList: {
            label: 'Lista de alarmes',
            group: 'Estados',
            w: 640,
            h: 220,
            preview: undefined,
            alarms: true,
            defaults: { title: 'ALARMES', rowHeight: 26, tab: 'active', shelve: 'yes', shelveMinutes: 30 },
            fields: [TITLE, { key: 'rowHeight', label: 'Altura da linha', type: 'number' }, { key: 'tab', label: 'Abre em', type: 'select', options: [['active', 'Ativos'], ['history', 'Histórico'], ['shelved', 'Suprimidos']] },
                { key: 'shelve', label: 'Permitir suprimir (II)', type: 'select', options: [['yes', 'Sim'], ['no', 'Não']], refresh: true },
                { key: 'shelveMinutes', label: 'Suprimir por (minutos)', type: 'number', when: p => p.shelve !== 'no' }],
            render: renderAlarmList
        },
        alarmSummary: {
            label: 'Resumo de alarmes',
            group: 'Estados',
            w: 220,
            h: 40,
            preview: undefined,
            alarms: true,
            defaults: { label: '' },
            fields: [LABEL],
            render: renderAlarmSummary
        },
        // Elétrica
        vfd: {
            label: 'Inversor de frequência',
            group: 'Elétrica',
            w: 90,
            h: 130,
            preview: 42.5,
            defaults: { label: '', unit: 'Hz', decimals: 1, runKey: '', dirKey: '', faultKey: '', priority: '1' },
            fields: [LABEL, UNIT, DEC, key('runKey', 'Chave rodando (vazio = valor ≠ 0)'), key('dirKey', 'Chave reverso (vazio = valor negativo)'), FAULT_FIELD, PRIORITY_FIELD],
            render: renderVfd
        },
        breaker: {
            label: 'Disjuntor',
            group: 'Elétrica',
            w: 50,
            h: 90,
            preview: 1,
            defaults: { label: '', onWhen: 'nonzero', threshold: 0, invert: 'no', tripKey: '', priority: '1' },
            fields: [LABEL, { ...ON_FIELDS[0], label: 'Fechado quando' }, ON_FIELDS[1], INVERT_FIELD, key('tripKey', 'Chave disparado (opcional)'), PRIORITY_FIELD],
            render: renderBreaker
        },
        contactor: {
            label: 'Contator',
            group: 'Elétrica',
            w: 60,
            h: 90,
            preview: 1,
            defaults: { ...EQ_DEFAULTS },
            fields: [LABEL, { ...ON_FIELDS[0], label: 'Fechado quando' }, ON_FIELDS[1], INVERT_FIELD, FAULT_FIELD, PRIORITY_FIELD],
            render: renderContactor
        },
        transformer: {
            label: 'Transformador',
            group: 'Elétrica',
            w: 80,
            h: 120,
            preview: 1,
            defaults: { ...EQ_DEFAULTS, rating: '13,8 / 0,38 kV' },
            fields: [LABEL, { key: 'rating', label: 'Texto embaixo (tensão, potência)', type: 'text' }, { ...ON_FIELDS[0], label: 'Energizado quando' }, ON_FIELDS[1], INVERT_FIELD, { ...FAULT_FIELD, label: 'Chave de alarme (temperatura, Buchholz)' }, PRIORITY_FIELD],
            render: renderTransformer
        },
        generator: {
            label: 'Gerador',
            group: 'Elétrica',
            w: 70,
            h: 90,
            preview: 1,
            defaults: { ...EQ_DEFAULTS },
            fields: EQ_FIELDS,
            render: renderGenerator
        },
        energyMeter: {
            label: 'Medidor de energia',
            group: 'Elétrica',
            w: 150,
            h: 90,
            preview: 37.4,
            defaults: { title: 'POTÊNCIA', label: '', unit: 'kW', decimals: 1, energyKey: '', energyUnit: 'kWh', energyDecimals: 0 },
            fields: [TITLE, LABEL, UNIT, DEC, key('energyKey', 'Chave da energia (kWh)'), { key: 'energyUnit', label: 'Unidade da energia', type: 'text' }, { key: 'energyDecimals', label: 'Casas da energia', type: 'number' }],
            render: renderEnergyMeter
        },
        // Processo
        compressor: { label: 'Compressor', group: 'Processo', w: 70, h: 76, preview: 1, defaults: { ...EQ_DEFAULTS }, fields: EQ_FIELDS, render: renderCompressor },
        blower: { label: 'Soprador (blower)', group: 'Processo', w: 90, h: 70, preview: 1, defaults: { ...EQ_DEFAULTS, dir: 'cw' }, fields: [...EQ_FIELDS, DIR], render: renderBlower },
        bagFilter: {
            label: 'Filtro de mangas',
            group: 'Processo',
            w: 110,
            h: 180,
            preview: 85,
            defaults: { label: '', unit: 'mmca', decimals: 0, lo: '', hi: 150, priority: '2' },
            fields: [LABEL, UNIT, DEC, LO, HI, PRIORITY_FIELD],
            render: renderBagFilter
        },
        controlValve: {
            label: 'Válvula de controle',
            group: 'Processo',
            w: 70,
            h: 90,
            preview: 45,
            defaults: { label: '', min: 0, max: 100, faultKey: '', priority: '1' },
            fields: [LABEL, { ...MIN, label: 'Valor fechada' }, { ...MAX, label: 'Valor aberta' }, FAULT_FIELD, PRIORITY_FIELD],
            render: renderControlValve
        },
        valve3: {
            label: 'Válvula 3 vias',
            group: 'Processo',
            w: 70,
            h: 70,
            preview: 1,
            defaults: { ...EQ_DEFAULTS },
            fields: [LABEL, { ...ON_FIELDS[0], label: 'Saída de baixo quando' }, ON_FIELDS[1], INVERT_FIELD, FAULT_FIELD, PRIORITY_FIELD],
            render: renderValve3
        },
        damper: {
            label: 'Damper (registro de duto)',
            group: 'Processo',
            w: 120,
            h: 50,
            preview: 60,
            defaults: { label: '', min: 0, max: 100, faultKey: '', priority: '1' },
            fields: [LABEL, { ...MIN, label: 'Valor fechado' }, { ...MAX, label: 'Valor aberto' }, FAULT_FIELD, PRIORITY_FIELD],
            render: renderDamper
        },
        mixer: { label: 'Misturador / agitador', group: 'Processo', w: 100, h: 160, preview: 1, defaults: { ...EQ_DEFAULTS }, fields: EQ_FIELDS, render: renderMixer },
        heatExchanger: { label: 'Trocador de calor', group: 'Processo', w: 190, h: 80, preview: 1, defaults: { ...EQ_DEFAULTS }, fields: EQ_FIELDS, render: renderHeatExchanger },
        boiler: { label: 'Caldeira', group: 'Processo', w: 100, h: 170, preview: 1, defaults: { ...EQ_DEFAULTS }, fields: [LABEL, { ...ON_FIELDS[0], label: 'Queimador ligado quando' }, ON_FIELDS[1], INVERT_FIELD, FAULT_FIELD, PRIORITY_FIELD], render: renderBoiler },
        coolingTower: { label: 'Torre de resfriamento', group: 'Processo', w: 130, h: 160, preview: 1, defaults: { ...EQ_DEFAULTS }, fields: EQ_FIELDS, render: renderCoolingTower },
        chiller: { label: 'Chiller', group: 'Processo', w: 160, h: 100, preview: 1, defaults: { ...EQ_DEFAULTS }, fields: EQ_FIELDS, render: renderChiller },
        cyclone: { label: 'Ciclone', group: 'Processo', w: 80, h: 170, preview: 1, defaults: { ...EQ_DEFAULTS }, fields: EQ_FIELDS, render: renderCyclone },
        flowmeter: {
            label: 'Medidor de vazão',
            group: 'Processo',
            w: 150,
            h: 64,
            preview: 12.6,
            defaults: { label: '', tagText: 'FT', unit: 'm³/h', decimals: 1, lo: '', hi: '', priority: '2' },
            fields: [LABEL, { key: 'tagText', label: 'Letras no círculo', type: 'text' }, UNIT, DEC, LO, HI, PRIORITY_FIELD],
            render: renderFlowmeter
        },
        instrument: {
            label: 'Instrumento ISA (bolha)',
            group: 'Processo',
            w: 64,
            h: 64,
            preview: 6.2,
            defaults: { letters: 'PT', number: '101', location: 'field', showValue: 'yes', label: '', unit: 'bar', decimals: 1, lo: '', hi: '', priority: '2' },
            fields: [
                { key: 'letters', label: 'Letras (ex. PT, TT, FIC)', type: 'text' },
                { key: 'number', label: 'Número da malha', type: 'text' },
                { key: 'location', label: 'Montagem', type: 'select', options: [['field', 'Campo (sem traço)'], ['panel', 'Painel (traço)'], ['behind', 'Atrás do painel (tracejado)'], ['dcs', 'Supervisório / CLP (quadrado)']] },
                { key: 'showValue', label: 'Mostrar valor', type: 'select', options: [['yes', 'Sim'], ['no', 'Não']] },
                LABEL, UNIT, DEC, LO, HI, PRIORITY_FIELD
            ],
            render: renderInstrument
        },
        // Fábrica
        crane: {
            label: 'Ponte rolante / talha',
            group: 'Fábrica',
            variants: [
                { label: 'Ponte rolante', w: 420, h: 220, props: { kind: 'crane' } },
                { label: 'Talha', w: 140, h: 200, props: { kind: 'hoist' } }
            ],
            w: 420,
            h: 220,
            preview: 40,
            defaults: { kind: 'crane', label: '', min: 0, max: 100, hookKey: '', hookMin: 0, hookMax: 100, loadKey: '', faultKey: '', priority: '1' },
            fields: [
                { key: 'kind', label: 'Tipo', type: 'select', options: [['crane', 'Ponte rolante (chave = posição do carro)'], ['hoist', 'Talha (chave = altura do gancho)']], refresh: true },
                LABEL,
                { ...MIN, label: 'Valor mín. (esquerda / embaixo)' },
                { ...MAX, label: 'Valor máx. (direita / em cima)' },
                { ...key('hookKey', 'Chave da altura do gancho'), when: p => p.kind !== 'hoist' },
                { key: 'hookMin', label: 'Gancho embaixo', type: 'number', when: p => p.kind !== 'hoist' },
                { key: 'hookMax', label: 'Gancho em cima', type: 'number', when: p => p.kind !== 'hoist' },
                key('loadKey', 'Chave com carga (opcional)'),
                FAULT_FIELD, PRIORITY_FIELD
            ],
            render: renderCrane
        },
        robot: {
            label: 'Robô (braço)',
            group: 'Fábrica',
            w: 110,
            h: 120,
            preview: 1,
            defaults: { ...EQ_DEFAULTS, weldKey: '' },
            fields: [...EQ_FIELDS, key('weldKey', 'Chave soldando (faísca)')],
            render: renderRobot
        },
        welder: {
            label: 'Fonte de solda',
            group: 'Fábrica',
            w: 80,
            h: 110,
            preview: 180,
            defaults: { label: '', unit: 'A', decimals: 0, arcKey: '', faultKey: '', priority: '1' },
            fields: [LABEL, UNIT, DEC, key('arcKey', 'Chave arco aberto (vazio = valor > 0)'), FAULT_FIELD, PRIORITY_FIELD],
            render: renderWelder
        },
        oven: {
            label: 'Estufa / forno',
            group: 'Fábrica',
            w: 170,
            h: 130,
            preview: 180,
            defaults: { label: '', unit: '°C', decimals: 0, lo: '', hi: 220, priority: '2', doorKey: '', heatKey: '' },
            fields: [LABEL, UNIT, DEC, LO, HI, PRIORITY_FIELD, key('doorKey', 'Chave porta aberta'), key('heatKey', 'Chave aquecendo')],
            render: renderOven
        },
        paintBooth: { label: 'Cabine de pintura', group: 'Fábrica', w: 190, h: 130, preview: 1, defaults: { ...EQ_DEFAULTS }, fields: EQ_FIELDS, render: renderPaintBooth },
        calender: { label: 'Calandra (3 rolos)', group: 'Fábrica', w: 160, h: 120, preview: 1, defaults: { ...EQ_DEFAULTS, dir: 'cw' }, fields: [...EQ_FIELDS, DIR], render: renderCalender },
        press: {
            label: 'Prensa / dobradeira',
            group: 'Fábrica',
            w: 120,
            h: 160,
            preview: 30,
            defaults: { label: '', min: 0, max: 100, faultKey: '', priority: '1' },
            fields: [LABEL, { ...MIN, label: 'Valor em cima' }, { ...MAX, label: 'Valor embaixo' }, FAULT_FIELD, PRIORITY_FIELD],
            render: renderPress
        },
        scale: {
            label: 'Balança',
            group: 'Fábrica',
            w: 150,
            h: 80,
            preview: 1250,
            defaults: { label: '', unit: 'kg', decimals: 1, lo: '', hi: '', priority: '2' },
            fields: [LABEL, UNIT, DEC, LO, HI, PRIORITY_FIELD],
            render: renderScale
        },
        vehicle: {
            label: 'Veículo',
            group: 'Fábrica',
            variants: [
                { label: 'Carrinho de transferência', w: 320, h: 70, props: { kind: 'cart', move: 'pos' } },
                { label: 'AGV', w: 90, h: 50, props: { kind: 'agv', move: 'fixed' } },
                { label: 'Empilhadeira', w: 110, h: 80, props: { kind: 'forklift', move: 'fixed' } }
            ],
            w: 320,
            h: 70,
            preview: 50,
            defaults: { kind: 'cart', move: 'pos', label: '', min: 0, max: 100, onWhen: 'nonzero', threshold: 0, invert: 'no', faultKey: '', priority: '1' },
            fields: [
                { key: 'kind', label: 'Tipo', type: 'select', options: [['cart', 'Carrinho no trilho'], ['agv', 'AGV'], ['forklift', 'Empilhadeira']] },
                { key: 'move', label: 'A chave é', type: 'select', options: [['pos', 'Posição (anda na largura)'], ['fixed', 'Ligado / desligado']], refresh: true },
                LABEL,
                { ...MIN, label: 'Posição esquerda', when: p => p.move === 'pos' },
                { ...MAX, label: 'Posição direita', when: p => p.move === 'pos' },
                { ...ON_FIELDS[0], when: p => p.move !== 'pos' },
                { ...ON_FIELDS[1], when: p => p.move !== 'pos' },
                { ...INVERT_FIELD, when: p => p.move !== 'pos' },
                FAULT_FIELD, PRIORITY_FIELD
            ],
            render: renderVehicle
        },
        rollerTable: { label: 'Mesa de rolos', group: 'Fábrica', w: 260, h: 44, preview: 1, defaults: { ...EQ_DEFAULTS, dir: 'cw' }, fields: [...EQ_FIELDS, DIR], render: renderRollerTable },
        // Valores / Estados
        isaBar: {
            label: 'Barra ISA-101',
            group: 'Valores',
            variants: [
                { label: 'Barra ISA-101 (vertical)', w: 80, h: 220 },
                { label: 'Barra ISA-101 (horizontal)', w: 260, h: 80 }
            ],
            w: 80,
            h: 220,
            preview: 62,
            defaults: { title: 'TEMPERATURA', unit: '°C', decimals: 0, min: 0, max: 100, lolo: 10, lo: 30, hi: 80, hihi: 90, spKey: '', priority: '2' },
            fields: [
                TITLE, UNIT, DEC, MIN, MAX,
                { key: 'lolo', label: 'Alarme muito baixo (LL)', type: 'number' },
                { key: 'lo', label: 'Faixa normal de (L)', type: 'number' },
                { key: 'hi', label: 'Faixa normal até (H)', type: 'number' },
                { key: 'hihi', label: 'Alarme muito alto (HH)', type: 'number' },
                key('spKey', 'Chave do setpoint (opcional)'),
                { ...PRIORITY_FIELD, label: 'Prioridade fora de L/H' }
            ],
            render: renderIsaBar
        },
        counter: {
            label: 'Contador',
            group: 'Valores',
            variants: [
                { label: 'Horas de funcionamento', w: 170, h: 64, props: { kind: 'hours', title: 'HORAS DE FUNCIONAMENTO' } },
                { label: 'Contador de partidas', w: 170, h: 64, props: { kind: 'count', title: 'PARTIDAS', unit: '' } }
            ],
            w: 170,
            h: 64,
            preview: 1234,
            defaults: { kind: 'hours', title: 'HORAS', src: 'h', decimals: 0, unit: '', label: '' },
            fields: [
                { key: 'kind', label: 'Tipo', type: 'select', options: [['hours', 'Horas'], ['count', 'Contagem']], refresh: true },
                TITLE,
                { key: 'src', label: 'O CLP manda em', type: 'select', options: [['h', 'Horas'], ['min', 'Minutos'], ['s', 'Segundos']], when: p => p.kind === 'hours' },
                { ...DEC, when: p => p.kind === 'hours' },
                { ...UNIT, when: p => p.kind !== 'hours' },
                LABEL
            ],
            render: renderCounter
        },
        mode: {
            label: 'Modo (MAN / AUTO)',
            group: 'Estados',
            w: 150,
            h: 36,
            preview: 1,
            defaults: { title: 'MODO', texts: '0=MANUAL,1=AUTO,2=LOCAL,3=REMOTO', normal: '1', label: '' },
            fields: [
                TITLE,
                { key: 'texts', label: 'Textos (valor=texto, separados por vírgula)', type: 'text' },
                { key: 'normal', label: 'Valor normal (os outros ficam destacados)', type: 'text' },
                LABEL
            ],
            render: renderMode
        },
        interlock: {
            label: 'Intertravamento',
            group: 'Estados',
            variants: [
                { label: 'Intertravamento (cadeado)', w: 40, h: 46, props: { kind: 'lock' } },
                { label: 'Permissivo (OK)', w: 40, h: 40, props: { kind: 'perm' } }
            ],
            w: 40,
            h: 46,
            preview: 1,
            defaults: { kind: 'lock', label: '', onWhen: 'nonzero', threshold: 0, invert: 'no' },
            fields: [
                { key: 'kind', label: 'Tipo', type: 'select', options: [['lock', 'Intertravamento (ligado = bloqueado)'], ['perm', 'Permissivo (ligado = OK)']] },
                LABEL, ...ON_FIELDS
            ],
            render: renderInterlock
        },
        // Linhas
        fitting: {
            label: 'Conexão de tubo',
            group: 'Linhas',
            variants: [
                { label: 'Cotovelo', w: 50, h: 50, props: { kind: 'elbow' } },
                { label: 'Tê', w: 80, h: 50, props: { kind: 'tee' } },
                { label: 'Cruzeta', w: 60, h: 60, props: { kind: 'cross' } },
                { label: 'Flange', w: 50, h: 40, props: { kind: 'flange' } },
                { label: 'Redução', w: 70, h: 30, props: { kind: 'reducer' } },
                { label: 'Tampão', w: 40, h: 30, props: { kind: 'cap' } }
            ],
            w: 50,
            h: 50,
            preview: undefined,
            defaults: { kind: 'elbow', thick: 8, onWhen: 'nonzero', threshold: 0, invert: 'no' },
            fields: [
                { key: 'kind', label: 'Tipo', type: 'select', options: [['elbow', 'Cotovelo'], ['tee', 'Tê'], ['cross', 'Cruzeta'], ['flange', 'Flange'], ['reducer', 'Redução'], ['cap', 'Tampão']] },
                { key: 'thick', label: 'Espessura (8 = tubulação)', type: 'number' },
                ...ON_FIELDS
            ],
            render: renderFitting
        },
        arrow: {
            label: 'Seta',
            group: 'Linhas',
            variants: [
                { label: 'Seta', w: 90, h: 30, props: { kind: 'single' } },
                { label: 'Seta dupla', w: 110, h: 30, props: { kind: 'double' } },
                { label: 'Seta de sentido (>>>)', w: 90, h: 26, props: { kind: 'chevron' } }
            ],
            w: 90,
            h: 30,
            preview: undefined,
            defaults: { kind: 'single', color: 'auto', label: '', onWhen: 'nonzero', threshold: 0, invert: 'no' },
            fields: [
                { key: 'kind', label: 'Tipo', type: 'select', options: [['single', 'Seta'], ['double', 'Seta dupla'], ['chevron', 'Sentido (>>>)']] },
                { key: 'color', label: 'Cor', type: 'select', options: [['auto', 'Do tema'], ['info', 'Azul'], ['ok', 'Verde'], ['warn', 'Amarelo'], ['alarm', 'Vermelho']] },
                LABEL,
                { ...ON_FIELDS[0], label: 'Com chave: acesa quando' }, ON_FIELDS[1], INVERT_FIELD
            ],
            render: renderArrow
        }
    }
    return symbols
}

export const MORE_CSS = `
.hmi-root .hmi-eq .hmi-body { fill: var(--hmi-equip); stroke: var(--hmi-stroke); stroke-width: 1.5; stroke-linejoin: round; }
.hmi-root .hmi-eq.hmi-on .hmi-body { fill: var(--hmi-equip-on); }
.hmi-root .hmi-eq.hmi-unknown .hmi-body { stroke-dasharray: 5 3; }
.hmi-root .hmi-eq .hmi-part, .hmi-root .hmi-eq .hmi-foot { fill: var(--hmi-dark); stroke: var(--hmi-stroke); stroke-width: 1; }
.hmi-root .hmi-eq .hmi-light { fill: var(--hmi-tag-bg); stroke: var(--hmi-stroke); stroke-width: 1.2; }
.hmi-root .hmi-eq .hmi-inner, .hmi-root .hmi-eq .hmi-mark { fill: none; stroke: var(--hmi-stroke); stroke-width: 1.5; stroke-linecap: round; }
.hmi-root .hmi-eq.hmi-on .hmi-inner { stroke: var(--hmi-tag-bg); }
.hmi-root .hmi-eq .hmi-light ~ .hmi-inner, .hmi-root .hmi-eq .hmi-spin .hmi-inner { stroke: var(--hmi-stroke); }
.hmi-root .hmi-eq .hmi-hub { fill: var(--hmi-dark); stroke: var(--hmi-stroke); stroke-width: 1; }
.hmi-root .hmi-eq .hmi-dashed { stroke-dasharray: 4 3; }
.hmi-root .hmi-eq .hmi-glyph, .hmi-root .hmi-counter .hmi-glyph { fill: var(--hmi-text); font-weight: 700; dominant-baseline: central; }
.hmi-root .hmi-eq.hmi-on:not(.hmi-instrument):not(.hmi-flowmeter) .hmi-glyph { fill: var(--hmi-tag-bg); }
.hmi-root .hmi-eq .hmi-glyph.hmi-thin { font-weight: 500; }
.hmi-root .hmi-disp { fill: var(--hmi-tag-bg); stroke: var(--hmi-line); stroke-width: 1; }
.hmi-root .hmi-disp-text { fill: var(--hmi-text); font-family: Consolas, "Roboto Mono", monospace; font-weight: 700; dominant-baseline: central; }
.hmi-root .hmi-alarm .hmi-disp { stroke: var(--hmi-alarm); stroke-width: 2; }
.hmi-root .hmi-alarm .hmi-disp-text { fill: var(--hmi-alarm); }
.hmi-root .hmi-alarm.hmi-eq .hmi-body { stroke: var(--hmi-alarm); stroke-width: 2.5; }
.hmi-root .hmi-sub-label { fill: var(--hmi-text-dim); font-size: 12px; font-weight: 600; }
.hmi-root .hmi-sub-value { fill: var(--hmi-text); font-size: 11px; font-weight: 700; dominant-baseline: central; }
.hmi-root .hmi-eq .hmi-spin, .hmi-root .hmi-eq .hmi-stir, .hmi-root .hmi-eq .hmi-arm { transform-box: view-box; transform-origin: 0 0; }
.hmi-root.hmi-theme-classic .hmi-eq.hmi-on .hmi-spin { animation: hmi-spin 1.4s linear infinite; }
.hmi-root.hmi-theme-classic .hmi-eq.hmi-on .hmi-spin.hmi-ccw { animation: hmi-spin-ccw 1.4s linear infinite; }
.hmi-root.hmi-theme-classic .hmi-eq.hmi-on .hmi-stir { animation: hmi-stir .8s ease-in-out infinite alternate; }
.hmi-root.hmi-theme-classic .hmi-robot.hmi-on .hmi-arm { animation: hmi-arm 2.4s ease-in-out infinite alternate; }
.hmi-root .hmi-eq .hmi-led, .hmi-root .hmi-eq .hmi-led-rect { fill: var(--hmi-tag-bg); stroke: var(--hmi-stroke); stroke-width: 1; }
.hmi-root .hmi-eq.hmi-on .hmi-led, .hmi-root .hmi-eq.hmi-on .hmi-led-rect { fill: var(--hmi-ok); }
.hmi-root.hmi-theme-classic .hmi-eq.hmi-on .hmi-led-arc { fill: var(--hmi-warn); }
.hmi-root .hmi-eq.hmi-fault .hmi-led { fill: var(--hmi-alarm); }
.hmi-root .hmi-eq .hmi-key { fill: var(--hmi-dark); stroke: var(--hmi-stroke); stroke-width: .8; }
.hmi-root .hmi-eq .hmi-arrowhead { fill: var(--hmi-tag-bg); stroke: var(--hmi-stroke); stroke-width: 1; }
.hmi-root .hmi-eq .hmi-wire, .hmi-root .hmi-eq .hmi-blade-line { fill: none; stroke: var(--hmi-stroke); stroke-width: 2.5; stroke-linecap: round; }
.hmi-root .hmi-eq .hmi-link { fill: none; stroke: var(--hmi-stroke); stroke-width: 1.2; stroke-dasharray: 3 3; }
.hmi-root .hmi-eq .hmi-terminal { fill: var(--hmi-stroke); }
.hmi-root .hmi-eq .hmi-terminal-big { fill: var(--hmi-dark); stroke: var(--hmi-stroke); stroke-width: 1.2; }
.hmi-root .hmi-eq .hmi-wave { fill: none; stroke: var(--hmi-text); stroke-width: 1.8; }
.hmi-root .hmi-eq.hmi-on .hmi-wave { stroke: var(--hmi-tag-bg); }
.hmi-root .hmi-transformer .hmi-coil2 { fill-opacity: .75; }
.hmi-root .hmi-eq .hmi-stem { fill: none; stroke: var(--hmi-stroke); stroke-width: 2; }
.hmi-root .hmi-eq .hmi-stroke-pos { fill: var(--hmi-text); }
.hmi-root .hmi-eq .hmi-actuator { fill: var(--hmi-dark); stroke: var(--hmi-stroke); stroke-width: 1.2; }
.hmi-root .hmi-valve3 .hmi-port { fill: var(--hmi-tag-bg); }
.hmi-root .hmi-valve3 .hmi-port.hmi-open { fill: var(--hmi-equip-on); }
.hmi-root.hmi-theme-classic .hmi-valve3 .hmi-port.hmi-open { fill: var(--hmi-ok); }
.hmi-root .hmi-damper-blade { stroke: var(--hmi-text); stroke-width: 3; stroke-linecap: round; }
.hmi-root .hmi-damper.hmi-on .hmi-body { fill: var(--hmi-equip); }
.hmi-root .hmi-bag { fill: var(--hmi-tag-bg); stroke: var(--hmi-stroke); stroke-width: .8; }
.hmi-root .hmi-bagfilter.hmi-on .hmi-body, .hmi-root .hmi-oven.hmi-on .hmi-body, .hmi-root .hmi-scale.hmi-on .hmi-body, .hmi-root .hmi-flowmeter.hmi-on .hmi-body, .hmi-root .hmi-instrument.hmi-on .hmi-body { fill: var(--hmi-equip); }
.hmi-root .hmi-instrument .hmi-body { fill: var(--hmi-tag-bg); }
.hmi-root .hmi-instrument.hmi-on .hmi-body { fill: var(--hmi-tag-bg); }
.hmi-root .hmi-instrument .hmi-dcs { fill: none; }
.hmi-root .hmi-instrument.hmi-alarm .hmi-body { stroke: var(--hmi-alarm); stroke-width: 2.5; }
.hmi-root .hmi-pipe-body { fill: var(--hmi-line); stroke: var(--hmi-stroke); stroke-width: .8; }
.hmi-root .hmi-mixer .hmi-vessel { fill: var(--hmi-equip) !important; }
.hmi-root .hmi-mixer .hmi-shaft { stroke: var(--hmi-stroke); stroke-width: 2.5; }
.hmi-root .hmi-flame { fill: var(--hmi-equip-on); stroke: var(--hmi-stroke); stroke-width: 1; }
.hmi-root.hmi-theme-classic .hmi-flame { fill: var(--hmi-warn); stroke: #e8590c; }
.hmi-root .hmi-boiler.hmi-on .hmi-body { fill: var(--hmi-equip); }
.hmi-root .hmi-cable { stroke: var(--hmi-stroke); stroke-width: 1.2; }
.hmi-root .hmi-hook { fill: none; stroke: var(--hmi-stroke); stroke-width: 2.5; stroke-linecap: round; }
.hmi-root .hmi-load { fill: var(--hmi-material); stroke: var(--hmi-stroke); stroke-width: 1; opacity: .85; }
.hmi-root .hmi-joint { fill: var(--hmi-dark); stroke: var(--hmi-stroke); stroke-width: 1.2; }
.hmi-root .hmi-spark { fill: var(--hmi-warn); stroke: #a15c00; stroke-width: .8; }
.hmi-root .hmi-heat { fill: none; stroke: var(--hmi-line); stroke-width: 1.8; stroke-linecap: round; }
.hmi-root .hmi-oven.hmi-heating .hmi-heat { stroke: var(--hmi-text); }
.hmi-root.hmi-theme-classic .hmi-oven.hmi-heating .hmi-heat { stroke: var(--hmi-warn); }
.hmi-root .hmi-door { fill: var(--hmi-equip); stroke: var(--hmi-stroke); stroke-width: 1.5; }
.hmi-root .hmi-opening { fill: var(--hmi-pit); stroke: var(--hmi-warn); stroke-width: 2; }
.hmi-root .hmi-spray { fill: var(--hmi-tag-bg); stroke: var(--hmi-line); stroke-width: 1; stroke-dasharray: 3 3; opacity: .3; }
.hmi-root .hmi-booth.hmi-on .hmi-spray { opacity: .9; stroke-dasharray: none; }
.hmi-root .hmi-booth.hmi-on .hmi-body { fill: var(--hmi-equip); }
.hmi-root .hmi-plate { fill: none; stroke: var(--hmi-material); stroke-width: 4; }
.hmi-root .hmi-calender .hmi-body, .hmi-root .hmi-rolltable .hmi-body { fill: var(--hmi-tag-bg); }
.hmi-root .hmi-calender.hmi-on .hmi-body, .hmi-root .hmi-rolltable.hmi-on .hmi-body { fill: var(--hmi-equip-on); }
.hmi-root .hmi-stem-rect { fill: var(--hmi-tag-bg); stroke: var(--hmi-stroke); stroke-width: 1; }
.hmi-root .hmi-wheel { fill: var(--hmi-text-dim); stroke: var(--hmi-stroke); stroke-width: 1; }
.hmi-root .hmi-crane.hmi-on .hmi-body, .hmi-root .hmi-vehicle.hmi-cart.hmi-on .hmi-body { fill: var(--hmi-equip); }
.hmi-root .hmi-meter.hmi-on .hmi-body { fill: var(--hmi-equip); }
.hmi-root .hmi-isa-track { fill: var(--hmi-tag-bg); stroke: var(--hmi-line); stroke-width: 1; }
.hmi-root .hmi-isa-ll { fill: var(--hmi-dark); opacity: .55; }
.hmi-root .hmi-isa-normal { fill: var(--hmi-line); opacity: .55; }
.hmi-root .hmi-isa-ptr { fill: var(--hmi-text); }
.hmi-root .hmi-isa-sp { fill: none; stroke: var(--hmi-info); stroke-width: 2; }
.hmi-root .hmi-isabar.hmi-warn .hmi-isa-ptr { fill: var(--hmi-warn); stroke: #000; stroke-width: 1; }
.hmi-root .hmi-isabar.hmi-alarm .hmi-isa-ptr { fill: var(--hmi-alarm); stroke: #000; stroke-width: 1; }
.hmi-root .hmi-isabar.hmi-alarm .hmi-tag-value { fill: var(--hmi-alarm); }
.hmi-root .hmi-counter .hmi-icon { fill: var(--hmi-bg); stroke: var(--hmi-stroke); stroke-width: 1.5; }
.hmi-root .hmi-counter .hmi-icon-hand { stroke: var(--hmi-text); stroke-width: 1.8; stroke-linecap: round; }
.hmi-root .hmi-mode-box { fill: var(--hmi-tag-bg); stroke: var(--hmi-line); stroke-width: 1; }
.hmi-root .hmi-mode-text { fill: var(--hmi-text); font-weight: 800; letter-spacing: .5px; dominant-baseline: central; }
.hmi-root .hmi-mode.hmi-abnormal .hmi-mode-box { fill: var(--hmi-warn); stroke: #000; stroke-width: 1.5; }
.hmi-root .hmi-mode.hmi-abnormal .hmi-mode-text, .hmi-root .hmi-mode.hmi-abnormal .hmi-tag-title { fill: #000; }
.hmi-root .hmi-mode.hmi-unknown .hmi-mode-box { stroke-dasharray: 4 3; }
.hmi-root .hmi-lock-body { fill: var(--hmi-tag-bg); stroke: var(--hmi-stroke); stroke-width: 1.5; }
.hmi-root .hmi-shackle { fill: none; stroke: var(--hmi-stroke); stroke-width: 3; stroke-linecap: round; }
.hmi-root .hmi-keyhole { fill: var(--hmi-stroke); }
.hmi-root .hmi-lock.hmi-on .hmi-lock-body { fill: var(--hmi-warn); stroke: #000; }
.hmi-root .hmi-lock.hmi-unknown .hmi-lock-body { stroke-dasharray: 3 2; }
.hmi-root .hmi-perm-ring { fill: var(--hmi-tag-bg); stroke: var(--hmi-stroke); stroke-width: 1.5; }
.hmi-root .hmi-perm-mark { fill: none; stroke: var(--hmi-text); stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
.hmi-root .hmi-perm.hmi-off .hmi-perm-ring { fill: var(--hmi-warn); stroke: #000; }
.hmi-root .hmi-perm.hmi-unknown .hmi-perm-ring { stroke-dasharray: 3 2; }
.hmi-root .hmi-fitting .hmi-hit { fill: none; stroke: transparent; stroke-width: 16; }
.hmi-root .hmi-fit-pipe { fill: none; stroke: var(--hmi-line); stroke-linecap: butt; stroke-linejoin: round; }
.hmi-root .hmi-fit-fill, .hmi-root .hmi-flange { fill: var(--hmi-line); stroke: var(--hmi-stroke); stroke-width: .8; }
.hmi-root .hmi-fitting.hmi-on .hmi-fit-pipe { stroke: var(--hmi-equip-on); }
.hmi-root .hmi-fitting.hmi-on .hmi-fit-fill { fill: var(--hmi-equip-on); }
.hmi-root .hmi-arrow-body { fill: var(--hmi-line); stroke: var(--hmi-stroke); stroke-width: 1; }
.hmi-root .hmi-arrow.hmi-c-info .hmi-arrow-body { fill: var(--hmi-info); }
.hmi-root .hmi-arrow.hmi-c-ok .hmi-arrow-body { fill: #2e9d4f; }
.hmi-root .hmi-arrow.hmi-c-warn .hmi-arrow-body { fill: var(--hmi-warn); }
.hmi-root .hmi-arrow.hmi-c-alarm .hmi-arrow-body { fill: var(--hmi-alarm); }
.hmi-root .hmi-arrow.hmi-off .hmi-arrow-body { opacity: .25; }
.hmi-root .hmi-alarmlist text { dominant-baseline: central; }
.hmi-root .hmi-al-line { stroke: var(--hmi-line); stroke-width: 1; }
.hmi-root .hmi-al-stripe { fill: var(--hmi-bg); opacity: .5; }
.hmi-root .hmi-al-time { fill: var(--hmi-text-dim); font-family: Consolas, "Roboto Mono", monospace; }
.hmi-root .hmi-al-text { fill: var(--hmi-text); font-weight: 600; }
.hmi-root .hmi-al-state { fill: var(--hmi-text-dim); font-weight: 700; letter-spacing: .3px; }
.hmi-root .hmi-al-unacked .hmi-al-text, .hmi-root .hmi-al-unacked .hmi-al-state { font-weight: 800; fill: var(--hmi-text); }
.hmi-root .hmi-al-rtn .hmi-al-text { fill: var(--hmi-text-dim); font-weight: 500; }
.hmi-root .hmi-al-empty, .hmi-root .hmi-al-more { fill: var(--hmi-text-dim); }
.hmi-root .hmi-al-btn { cursor: pointer; }
.hmi-root .hmi-al-btn-box { fill: var(--hmi-bg); stroke: var(--hmi-line); stroke-width: 1; }
.hmi-root .hmi-al-btn text { fill: var(--hmi-text); font-weight: 700; dominant-baseline: central; }
.hmi-root .hmi-al-sel .hmi-al-btn-box { fill: var(--hmi-equip-on); }
.hmi-root .hmi-al-sel text { fill: var(--hmi-tag-bg); }
.hmi-root.hmi-theme-classic .hmi-al-sel text { fill: var(--hmi-text); }
.hmi-root .hmi-al-ackall .hmi-al-btn-box, .hmi-root .hmi-al-ack .hmi-al-btn-box, .hmi-root .hmi-al-shelve .hmi-al-btn-box { fill: var(--hmi-tag-bg); stroke: var(--hmi-stroke); stroke-width: 1.5; }
.hmi-root .hmi-al-btn:hover .hmi-al-btn-box { filter: brightness(.9); }
.hmi-root .hmi-alsum-box { fill: var(--hmi-tag-bg); stroke: var(--hmi-line); stroke-width: 1; }
.hmi-root .hmi-alsum-text { fill: var(--hmi-text); font-weight: 800; dominant-baseline: central; }
.hmi-root .hmi-bell { fill: var(--hmi-text-dim); }
.hmi-root .hmi-alsum.hmi-p1 .hmi-alsum-box { fill: var(--hmi-alarm); stroke: #000; }
.hmi-root .hmi-alsum.hmi-p1 .hmi-alsum-text, .hmi-root .hmi-alsum.hmi-p1 .hmi-bell { fill: #fff; }
.hmi-root .hmi-alsum.hmi-p2 .hmi-alsum-box { fill: var(--hmi-warn); stroke: #000; }
.hmi-root .hmi-alsum.hmi-p2 .hmi-alsum-text, .hmi-root .hmi-alsum.hmi-p2 .hmi-bell { fill: #000; }
.hmi-root .hmi-alsum.hmi-p3 .hmi-alsum-box { fill: var(--hmi-low); stroke: #000; }
.hmi-root .hmi-al-hit { fill: transparent; }
.hmi-fp-back { position: fixed; inset: 0; z-index: 3000; background: rgba(0, 0, 0, .35); display: flex; align-items: center; justify-content: center; font-family: "Segoe UI", Roboto, Arial, sans-serif; }
.hmi-fp { --fp-bg: #e6e7e8; --fp-text: #1f2328; --fp-dim: #55595e; --fp-line: #a9acaf; --fp-btn: #d9dadb; min-width: 300px; max-width: min(440px, calc(100vw - 32px)); background: var(--fp-bg); color: var(--fp-text); border: 1px solid var(--fp-line); border-radius: 8px; box-shadow: 0 10px 40px rgba(0, 0, 0, .35); padding: 0 0 14px; }
.hmi-fp-classic .hmi-fp { --fp-bg: #1c2025; --fp-text: #e8edf1; --fp-dim: #9aa4ae; --fp-line: #3a4148; --fp-btn: #2a2f36; }
.hmi-fp-head { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-bottom: 1px solid var(--fp-line); font-weight: 800; font-size: 16px; letter-spacing: .3px; }
.hmi-fp-x { background: none; border: 0; color: var(--fp-dim); font-size: 24px; line-height: 1; cursor: pointer; padding: 0 4px; }
.hmi-fp-rows { padding: 8px 14px; }
.hmi-fp-row { display: flex; justify-content: space-between; gap: 16px; padding: 5px 0; border-bottom: 1px dashed var(--fp-line); font-size: 14px; }
.hmi-fp-row span { color: var(--fp-dim); }
.hmi-fp-row b { font-family: Consolas, "Roboto Mono", monospace; }
.hmi-fp-st-fault { color: #d71920; }
.hmi-fp-sub { color: var(--fp-dim); font-size: 12px; font-weight: 700; letter-spacing: .5px; margin: 6px 0 4px; }
.hmi-fp-alarms { padding: 0 14px 6px; }
.hmi-fp-alarm { display: flex; justify-content: space-between; gap: 10px; padding: 5px 8px; margin-bottom: 4px; border-left: 6px solid #f2b705; background: var(--fp-btn); font-size: 13px; }
.hmi-fp-alarm.hmi-fp-p1 { border-left-color: #d71920; }
.hmi-fp-alarm.hmi-fp-p3 { border-left-color: #c46ad1; }
.hmi-fp-unacked { font-weight: 800; }
.hmi-fp-cmds { display: flex; flex-wrap: wrap; gap: 8px; padding: 8px 14px 0; justify-content: flex-end; }
.hmi-fp-btn { min-width: 92px; padding: 9px 14px; font-size: 14px; font-weight: 700; border-radius: 6px; border: 1px solid var(--fp-line); background: var(--fp-btn); color: var(--fp-text); cursor: pointer; }
.hmi-fp-btn:hover { filter: brightness(.94); }
.hmi-fp-on { background: #4d5156; color: #fff; }
.hmi-pin-label { display: flex; flex-direction: column; gap: 6px; padding: 12px 14px 4px; font-size: 13px; color: var(--fp-dim); }
.hmi-pin-label input { font-size: 18px; padding: 8px; border-radius: 4px; border: 1px solid var(--fp-line); background: #fff; color: #111; }
.hmi-fp-pid { padding: 4px 14px 8px; }
.hmi-fp-bar { position: relative; height: 16px; background: var(--fp-btn); border: 1px solid var(--fp-line); border-radius: 3px; overflow: visible; }
.hmi-fp-bar-pv { position: absolute; left: 0; top: 0; bottom: 0; background: #808489; border-radius: 2px; }
.hmi-fp-bar-sp { position: absolute; top: -5px; width: 0; height: 0; margin-left: -6px; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #2f6fb3; }
.hmi-fp-scale { display: flex; justify-content: space-between; font-size: 11px; color: var(--fp-dim); padding-top: 2px; }
.hmi-fp-blocked { margin: 8px 14px 0; padding: 6px 10px; border-left: 6px solid #f2b705; background: var(--fp-btn); font-size: 13px; font-weight: 700; }
.hmi-kp { width: min(320px, calc(100vw - 32px)); min-width: 0; }
.hmi-kp-hint { padding: 8px 14px 0; font-size: 13px; color: var(--fp-dim); }
.hmi-kp-display { display: block; box-sizing: border-box; width: calc(100% - 28px); margin: 8px 14px; font-size: 26px; padding: 8px 10px; text-align: right; border-radius: 4px; border: 1px solid var(--fp-line); background: #fff; color: #111; font-family: Consolas, "Roboto Mono", monospace; }
.hmi-kp-keys { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 0 14px 4px; }
.hmi-kp-key { min-height: 52px; font-size: 22px; font-weight: 700; border-radius: 6px; border: 1px solid var(--fp-line); background: var(--fp-btn); color: var(--fp-text); cursor: pointer; touch-action: manipulation; }
.hmi-kp-key:active { filter: brightness(.85); }
.hmi-kp-fn { font-size: 18px; color: var(--fp-dim); }
.hmi-notice { position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%); z-index: 3100; background: #d71920; color: #fff; font-weight: 700; padding: 10px 18px; border-radius: 6px; box-shadow: 0 6px 20px rgba(0, 0, 0, .3); font-family: "Segoe UI", Roboto, Arial, sans-serif; }
@keyframes hmi-stir { from { transform: scaleX(1); } to { transform: scaleX(-1); } }
@keyframes hmi-arm { from { transform: rotate(-6deg); } to { transform: rotate(5deg); } }
`
