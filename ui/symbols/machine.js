// Machine parts and extra geometric shapes for the "Corpo" (frame) symbol.
// index.js passes its helpers in, so this file imports nothing.

// [shape, label, w, h, tone, palette category]
export const MACHINE_SHAPES = [
    ['gear', 'Engrenagem', 120, 120, '', 'Mecânica'],
    ['sprocket', 'Coroa / pinhão de corrente', 120, 120, '', 'Mecânica'],
    ['pulley', 'Polia', 120, 120, '', 'Mecânica'],
    ['wheel', 'Roda', 120, 120, '', 'Mecânica'],
    ['beltDrive', 'Transmissão por correia', 320, 120, '', 'Mecânica'],
    ['chainDrive', 'Transmissão por corrente', 320, 120, '', 'Mecânica'],
    ['gearbox', 'Redutor', 180, 120, '', 'Mecânica'],
    ['coupling', 'Acoplamento', 200, 70, '', 'Mecânica'],
    ['spring', 'Mola', 200, 50, '', 'Mecânica'],
    ['screw', 'Fuso', 320, 40, '', 'Mecânica'],
    ['linearGuide', 'Guia linear com carro', 320, 60, '', 'Mecânica'],
    ['rack', 'Cremalheira', 320, 40, '', 'Mecânica'],
    ['link', 'Braço / elo', 220, 50, '', 'Mecânica'],
    ['pivot', 'Pino / articulação', 40, 40, '', 'Mecânica'],
    ['nozzle', 'Bico', 60, 100, '', 'Mecânica'],
    ['drum', 'Tambor / cilindro deitado', 260, 100, '', 'Mecânica'],
    ['cylinder3d', 'Cilindro em pé', 120, 180, '', 'Mecânica'],
    ['cone', 'Cone', 140, 140, '', 'Mecânica'],
    ['box3d', 'Caixa 3D', 180, 140, '', 'Mecânica'],
    ['plateHoles', 'Chapa com furos', 200, 120, '', 'Mecânica'],
    ['slot', 'Rasgo / oblongo', 200, 70, '', 'Mecânica'],
    ['mesh', 'Grade / tela de proteção', 240, 160, '', 'Mecânica'],
    ['door', 'Porta', 120, 200, '', 'Mecânica'],
    ['window', 'Visor / janela', 160, 110, '', 'Mecânica'],
    ['ring', 'Anel', 140, 140],
    ['semicircle', 'Meio círculo', 200, 100],
    ['quarter', 'Quarto de círculo', 140, 140],
    ['pentagon', 'Pentágono', 140, 134],
    ['octagon', 'Octógono', 140, 140],
    ['star', 'Estrela', 140, 134],
    ['cross', 'Cruz', 140, 140],
    ['chevron', 'Seta larga', 200, 100]
]

// shapes drawn as a circle that can turn while the key is on
export const ROUND_SHAPES = ['gear', 'sprocket', 'pulley', 'wheel']
// belt and chain drives: the wheels turn inside the drawing and the belt runs
export const DRIVE_SHAPES = ['beltDrive', 'chainDrive']

export function machinePath (shape, w, h, H) {
    const { f, poly, box } = H
    const m = Math.min(w, h)
    const cx = w / 2
    const cy = h / 2
    const circle = (cls, x, y, r) => `<circle class="${cls}" cx="${f(x)}" cy="${f(y)}" r="${f(Math.max(0, r))}"/>`
    const ellipse = (cls, x, y, rx, ry) => `<ellipse class="${cls}" cx="${f(x)}" cy="${f(y)}" rx="${f(Math.max(0, rx))}" ry="${f(Math.max(0, ry))}"/>`
    const path = (cls, d, extra) => `<path class="${cls}" d="${d}"${extra || ''}/>`
    // closed circle as a path piece, for holes with evenodd
    const ring = (x, y, r) => `M${f(x + r)} ${f(y)}A${f(r)} ${f(r)} 0 1 0 ${f(x - r)} ${f(y)}A${f(r)} ${f(r)} 0 1 0 ${f(x + r)} ${f(y)}Z`
    const EO = ' fill-rule="evenodd"'
    // toothed wheel around (x,y): n teeth between radius r0 and r
    function teeth (x, y, r, n, depth, round) {
        const r0 = r * (1 - depth)
        let d = ''
        for (let i = 0; i < n; i++) {
            const a = i * 2 * Math.PI / n
            const s = Math.PI / n
            const pts = round
                ? [[r0, a - s * 0.5], [r, a - s * 0.25], [r, a + s * 0.25], [r0, a + s * 0.5], [r0, a + s * 1.5]]
                : [[r0, a - s * 0.55], [r, a - s * 0.32], [r, a + s * 0.32], [r0, a + s * 0.55], [r0, a + s * 1.45]]
            for (const [k, [rr, aa]] of pts.entries()) d += (i === 0 && k === 0 ? 'M' : 'L') + f(x + rr * Math.cos(aa)) + ' ' + f(y + rr * Math.sin(aa))
        }
        return d + 'Z'
    }
    function gear (x, y, r, round) {
        const n = Math.max(8, Math.min(40, Math.round(r / (round ? 4.5 : 6))))
        return path('hmi-body', teeth(x, y, r, n, round ? 0.14 : 0.18, round) + ring(x, y, r * 0.2), EO) +
            circle('hmi-detail', x, y, r * 0.55) + circle('hmi-detail', x, y, r * 0.32)
    }
    function pulley (x, y, r) {
        return circle('hmi-body', x, y, r) + circle('hmi-detail', x, y, r * 0.84) + path('hmi-body', ring(x, y, r * 0.34) + ring(x, y, r * 0.14), EO) +
            [0, 1, 2, 3].map(i => circle('hmi-detail', x + Math.cos(i * Math.PI / 2 + Math.PI / 4) * r * 0.58, y + Math.sin(i * Math.PI / 2 + Math.PI / 4) * r * 0.58, r * 0.1)).join('')
    }
    // belt or chain around two wheels side by side
    function drive (chain) {
        const bt = Math.max(3, h * 0.06)
        const R1 = h / 2 - bt / 2
        const R2 = R1 * 0.6
        const c1 = R1 + bt / 2
        const c2 = w - R2 - bt / 2
        const d = Math.max(1, c2 - c1)
        const a = Math.asin(Math.max(-1, Math.min(1, (R1 - R2) / d)))
        const s = Math.sin(a)
        const c = Math.cos(a)
        const p1t = [c1 + R1 * s, cy - R1 * c]
        const p2t = [c2 + R2 * s, cy - R2 * c]
        const p2b = [c2 + R2 * s, cy + R2 * c]
        const p1b = [c1 + R1 * s, cy + R1 * c]
        const belt = `M${f(p1t[0])} ${f(p1t[1])}L${f(p2t[0])} ${f(p2t[1])}A${f(R2)} ${f(R2)} 0 0 1 ${f(p2b[0])} ${f(p2b[1])}L${f(p1b[0])} ${f(p1b[1])}A${f(R1)} ${f(R1)} 0 1 1 ${f(p1t[0])} ${f(p1t[1])}Z`
        // each wheel turns around its own centre while the frame turns
        const turn = (x, body) => `<g transform="translate(${f(x)},${f(cy)})"><g class="hmi-spin"><g transform="translate(${f(-x)},${f(-cy)})">${body}</g></g></g>`
        const wheels = chain ? turn(c1, gear(c1, cy, R1 - bt * 0.2, true)) + turn(c2, gear(c2, cy, R2 - bt * 0.2, true)) : turn(c1, pulley(c1, cy, R1 - bt / 2)) + turn(c2, pulley(c2, cy, R2 - bt / 2))
        // the belt runs with marks on it; the chain's links are the marks
        // dash periods divide 16, the distance the hmi-belt animation moves, so the loop has no jump
        const period = 16 / Math.max(1, Math.round(16 / (bt * 1.35)))
        const marks = chain ? '' : path('hmi-belt-marks hmi-move', belt, ` style="stroke-width:${f(Math.max(1, bt * 0.35))};stroke-dasharray:4 12"`)
        return wheels + path('hmi-strap' + (chain ? ' hmi-move' : ''), belt, ` style="stroke-width:${f(bt)}${chain ? `;stroke-dasharray:${f(period * 0.67)} ${f(period * 0.33)};stroke-linecap:butt` : ''}"`) + marks
    }
    switch (shape) {
    case 'gear': return gear(cx, cy, m / 2, false)
    case 'sprocket': return gear(cx, cy, m / 2, true)
    case 'pulley': return pulley(cx, cy, m / 2)
    case 'wheel': {
        const r = m / 2
        let spokes = ''
        for (let i = 0; i < 5; i++) {
            const a = i * 2 * Math.PI / 5 - Math.PI / 2
            spokes += `M${f(cx + Math.cos(a) * r * 0.2)} ${f(cy + Math.sin(a) * r * 0.2)}L${f(cx + Math.cos(a) * r * 0.7)} ${f(cy + Math.sin(a) * r * 0.7)}`
        }
        return path('hmi-body', ring(cx, cy, r) + ring(cx, cy, r * 0.74), EO) + circle('hmi-detail', cx, cy, r * 0.7) + path('hmi-detail', spokes, ' style="stroke-width:3"') + circle('hmi-body', cx, cy, r * 0.2)
    }
    case 'beltDrive': return drive(false)
    case 'chainDrive': return drive(true)
    case 'gearbox': {
        const bx = w * 0.18
        const bw = w * 0.64
        const fins = Array.from({ length: 4 }, (x, i) => `M${f(bx + bw * (0.2 + i * 0.2))} ${f(h * 0.12)}V${f(h * 0.88)}`).join('')
        return box(0, h * 0.3, bx + 2, h * 0.16) + box(bx + bw - 2, h * 0.58, w - bx - bw + 2, h * 0.16) +
            `<rect class="hmi-body" x="${f(bx)}" y="0" width="${f(bw)}" height="${f(h)}" rx="${f(m * 0.08)}"/>` +
            path('hmi-detail', fins) + circle('hmi-detail', bx + bw * 0.2, h * 0.38, m * 0.08) + circle('hmi-detail', bx + bw * 0.8, h * 0.66, m * 0.08)
    }
    case 'coupling': {
        const hw = w * 0.16
        const bolts = [0.25, 0.5, 0.75].map(k => circle('hmi-detail', cx, h * k, Math.max(1.5, h * 0.05))).join('')
        return box(0, h * 0.38, w, h * 0.24) + box(cx - hw - 2, h * 0.08, hw, h * 0.84) + box(cx + 2, h * 0.08, hw, h * 0.84) +
            box(cx - hw * 1.6, h * 0.25, hw * 0.6, h * 0.5) + box(cx + hw + 2, h * 0.25, hw * 0.6, h * 0.5) + bolts
    }
    case 'spring': {
        const pw = Math.max(4, w * 0.04)
        const n = Math.max(4, Math.round((w - pw * 2) / Math.max(8, h * 0.4)))
        const step = (w - pw * 2) / n
        let d = `M${f(pw)} ${f(cy)}`
        for (let i = 0; i < n; i++) d += `L${f(pw + step * (i + 0.25))} ${f(h * 0.08)}L${f(pw + step * (i + 0.75))} ${f(h * 0.92)}`
        d += `L${f(w - pw)} ${f(cy)}`
        return path('hmi-strap hmi-coil', d, ` style="stroke-width:${f(Math.max(2, h * 0.08))}"`) + box(0, 0, pw, h) + box(w - pw, 0, pw, h)
    }
    case 'screw': {
        const e = Math.max(6, w * 0.05)
        const t = h * 0.36
        const pitch = Math.max(6, h * 0.35)
        let d = ''
        for (let x = e + pitch * 0.5; x < w - e; x += pitch) d += `M${f(x)} ${f(cy - t / 2)}L${f(x + pitch * 0.5)} ${f(cy + t / 2)}`
        return box(e, cy - t / 2, w - 2 * e, t) + path('hmi-detail', d) + box(0, h * 0.12, e, h * 0.76) + box(w - e, h * 0.12, e, h * 0.76)
    }
    case 'linearGuide': {
        const rh = h * 0.38
        const cw = Math.min(w * 0.3, h * 2.2)
        const x = (w - cw) / 2
        return box(0, h - rh, w, rh) + path('hmi-detail', `M0 ${f(h - rh * 0.5)}H${f(w)}`) +
            `<rect class="hmi-body" x="${f(x)}" y="0" width="${f(cw)}" height="${f(h - rh * 0.4)}" rx="3"/>` +
            [0.25, 0.75].map(k => circle('hmi-detail', x + cw * k, h * 0.25, Math.max(1.5, h * 0.07))).join('')
    }
    case 'rack': {
        const bh = h * 0.55
        const pitch = Math.max(6, h * 0.5)
        const pts = [[0, h], [0, h - bh]]
        for (let x = 0; x + pitch <= w + 0.01; x += pitch) pts.push([x + pitch * 0.2, h - bh], [x + pitch * 0.35, 0], [x + pitch * 0.65, 0], [x + pitch * 0.8, h - bh])
        pts.push([w, h - bh], [w, h])
        return poly(pts)
    }
    case 'link': {
        const r = h / 2
        const bar = `M${f(r)} ${f(cy - h * 0.25)}H${f(w - r)}V${f(cy + h * 0.25)}H${f(r)}Z`
        return path('hmi-body', ring(r, cy, r) + ring(w - r, cy, r), '') + path('hmi-body', bar) +
            path('hmi-body', ring(r, cy, r * 0.4) + ring(w - r, cy, r * 0.4), EO + ' style="fill:var(--hmi-bg)"')
    }
    case 'pivot': return circle('hmi-body', cx, cy, m / 2) + path('hmi-detail', `M${f(cx - m * 0.3)} ${f(cy)}H${f(cx + m * 0.3)}M${f(cx)} ${f(cy - m * 0.3)}V${f(cy + m * 0.3)}`)
    case 'nozzle': return poly([[0, 0], [w, 0], [w, h * 0.35], [w * 0.62, h * 0.85], [w * 0.62, h], [w * 0.38, h], [w * 0.38, h * 0.85], [0, h * 0.35]]) + path('hmi-detail', `M0 ${f(h * 0.15)}H${f(w)}`)
    case 'drum': {
        const e = Math.min(w * 0.12, h * 0.25)
        return path('hmi-body', `M${f(e)} 0H${f(w - e)}A${f(e)} ${f(h / 2)} 0 0 1 ${f(w - e)} ${f(h)}H${f(e)}A${f(e)} ${f(h / 2)} 0 0 1 ${f(e)} 0Z`) + ellipse('hmi-detail', w - e, cy, e, h / 2)
    }
    case 'cylinder3d': {
        const e = Math.min(h * 0.12, w * 0.25)
        return path('hmi-body', `M0 ${f(e)}V${f(h - e)}A${f(w / 2)} ${f(e)} 0 0 0 ${f(w)} ${f(h - e)}V${f(e)}A${f(w / 2)} ${f(e)} 0 0 0 0 ${f(e)}Z`) + ellipse('hmi-body hmi-shade', cx, e, w / 2, e)
    }
    case 'cone': {
        const e = Math.min(h * 0.12, w * 0.2)
        return path('hmi-body', `M${f(cx)} 0L${f(w)} ${f(h - e)}A${f(w / 2)} ${f(e)} 0 0 1 0 ${f(h - e)}Z`) + path('hmi-detail', `M0 ${f(h - e)}A${f(w / 2)} ${f(e)} 0 0 0 ${f(w)} ${f(h - e)}`)
    }
    case 'box3d': {
        const d = Math.min(w, h) * 0.25
        return poly([[0, d], [w - d, d], [w - d, h], [0, h]]) +
            `<polygon class="hmi-body hmi-shade" points="${f(0)},${f(d)} ${f(d)},0 ${f(w)},0 ${f(w - d)},${f(d)}"/>` +
            `<polygon class="hmi-body hmi-shade2" points="${f(w - d)},${f(d)} ${f(w)},0 ${f(w)},${f(h - d)} ${f(w - d)},${f(h)}"/>`
    }
    case 'plateHoles': {
        const r = Math.max(2, m * 0.07)
        const k = r * 2.4
        return path('hmi-body', `M0 0H${f(w)}V${f(h)}H0Z` + ring(k, k, r) + ring(w - k, k, r) + ring(k, h - k, r) + ring(w - k, h - k, r), EO)
    }
    case 'slot': {
        const r = h / 2
        const ri = r * 0.45
        return path('hmi-body', `M${f(r)} 0H${f(w - r)}A${f(r)} ${f(r)} 0 0 1 ${f(w - r)} ${f(h)}H${f(r)}A${f(r)} ${f(r)} 0 0 1 ${f(r)} 0Z` +
            `M${f(r)} ${f(cy - ri)}H${f(w - r)}A${f(ri)} ${f(ri)} 0 0 1 ${f(w - r)} ${f(cy + ri)}H${f(r)}A${f(ri)} ${f(ri)} 0 0 1 ${f(r)} ${f(cy - ri)}Z`, EO)
    }
    case 'mesh': {
        const s = Math.max(10, m / 8)
        let d = ''
        for (let x = s; x < w - 2; x += s) d += `M${f(x)} 4V${f(h - 4)}`
        for (let y = s; y < h - 2; y += s) d += `M4 ${f(y)}H${f(w - 4)}`
        return `<rect class="hmi-body hmi-hollow" x="0" y="0" width="${f(w)}" height="${f(h)}"/>` + path('hmi-detail hmi-thin', d) +
            `<rect class="hmi-body hmi-hollow" x="2" y="2" width="${f(w - 4)}" height="${f(h - 4)}" style="stroke-width:4"/>`
    }
    case 'door': {
        const hw = Math.max(4, w * 0.06)
        return box(0, 0, w, h) + box(-hw * 0.4, h * 0.12, hw, h * 0.1) + box(-hw * 0.4, h * 0.78, hw, h * 0.1) +
            `<rect class="hmi-detail" x="${f(w * 0.12)}" y="${f(h * 0.06)}" width="${f(w * 0.76)}" height="${f(h * 0.88)}"/>` +
            `<rect class="hmi-body" x="${f(w * 0.78)}" y="${f(h * 0.45)}" width="${f(Math.max(3, w * 0.06))}" height="${f(h * 0.12)}" rx="2"/>`
    }
    case 'window': {
        const p = Math.max(5, m * 0.1)
        return `<rect class="hmi-body" x="0" y="0" width="${f(w)}" height="${f(h)}" rx="${f(p * 0.6)}"/>` +
            `<rect class="hmi-glass" x="${f(p)}" y="${f(p)}" width="${f(w - 2 * p)}" height="${f(h - 2 * p)}" rx="${f(p * 0.3)}"/>` +
            path('hmi-detail hmi-thin', `M${f(p * 2)} ${f(h - p * 2)}L${f(w * 0.45)} ${f(p * 2)}M${f(w * 0.3)} ${f(h - p * 2)}L${f(w * 0.6)} ${f(p * 2)}`)
    }
    case 'ring': return path('hmi-body', `M${f(w)} ${f(cy)}A${f(w / 2)} ${f(h / 2)} 0 1 0 0 ${f(cy)}A${f(w / 2)} ${f(h / 2)} 0 1 0 ${f(w)} ${f(cy)}Z` +
        `M${f(cx + w * 0.3)} ${f(cy)}A${f(w * 0.3)} ${f(h * 0.3)} 0 1 0 ${f(cx - w * 0.3)} ${f(cy)}A${f(w * 0.3)} ${f(h * 0.3)} 0 1 0 ${f(cx + w * 0.3)} ${f(cy)}Z`, EO)
    case 'semicircle': return path('hmi-body', `M0 ${f(h)}A${f(w / 2)} ${f(h)} 0 0 1 ${f(w)} ${f(h)}Z`)
    case 'quarter': return path('hmi-body', `M0 ${f(h)}V0A${f(w)} ${f(h)} 0 0 1 ${f(w)} ${f(h)}Z`)
    case 'pentagon':
    case 'octagon':
    case 'star': {
        const n = shape === 'octagon' ? 8 : 5
        const pts = []
        const k = shape === 'star' ? 2 : 1
        for (let i = 0; i < n * k; i++) {
            const a = -Math.PI / 2 + i * Math.PI * 2 / (n * k) + (shape === 'octagon' ? Math.PI / 8 : 0)
            const r = shape === 'star' && i % 2 ? 0.4 : 1
            pts.push([cx + Math.cos(a) * w / 2 * r, cy + Math.sin(a) * h / 2 * r + (shape === 'octagon' ? 0 : h * 0.05)])
        }
        return poly(pts)
    }
    case 'cross': {
        const t = 0.32
        return poly([[w * (0.5 - t / 2), 0], [w * (0.5 + t / 2), 0], [w * (0.5 + t / 2), h * (0.5 - t / 2)], [w, h * (0.5 - t / 2)], [w, h * (0.5 + t / 2)], [w * (0.5 + t / 2), h * (0.5 + t / 2)], [w * (0.5 + t / 2), h], [w * (0.5 - t / 2), h], [w * (0.5 - t / 2), h * (0.5 + t / 2)], [0, h * (0.5 + t / 2)], [0, h * (0.5 - t / 2)], [w * (0.5 - t / 2), h * (0.5 - t / 2)]])
    }
    case 'chevron': return poly([[0, 0], [w * 0.7, 0], [w, h / 2], [w * 0.7, h], [0, h], [w * 0.3, h / 2]])
    default: return ''
    }
}

export const MACHINE_CSS = `
.hmi-root .hmi-frame .hmi-strap { fill: none; stroke: var(--hmi-stroke); stroke-linejoin: round; stroke-linecap: round; }
.hmi-root .hmi-frame.hmi-tone-fixed .hmi-strap { stroke: var(--hmi-tone-stroke); }
.hmi-root .hmi-frame .hmi-shade { filter: brightness(1.12); }
.hmi-root .hmi-frame .hmi-shade2 { filter: brightness(.85); }
.hmi-root .hmi-frame .hmi-hollow { fill: none !important; }
.hmi-root .hmi-frame .hmi-thin { stroke-width: 1; }
.hmi-root .hmi-frame .hmi-glass { fill: var(--hmi-bg); stroke: var(--hmi-stroke); stroke-width: 1; opacity: .85; }
.hmi-root .hmi-frame .hmi-spin { transform-box: view-box; transform-origin: 0 0; }
.hmi-root .hmi-frame.hmi-turning .hmi-spin { animation: hmi-spin 3s linear infinite; }
.hmi-root .hmi-frame .hmi-belt-marks { fill: none; stroke: var(--hmi-bg); opacity: .7; }
.hmi-root .hmi-frame.hmi-on.hmi-ccw .hmi-move { animation-direction: reverse; }
.hmi-root .hmi-frame.hmi-turning.hmi-ccw .hmi-spin { animation-name: hmi-spin-ccw; }
.hmi-root .hmi-shape .hmi-hit { fill: none; stroke: transparent; stroke-width: 12; }
`
