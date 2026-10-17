// More parts to build machines with the "Corpo" (frame) symbol: pneumatics and
// hydraulics, sensors and safety, motion and handling, production and packaging.
// Several follow the frame's key: a cylinder rod goes out, a gripper closes,
// a light beam is cut, a blade comes down, a screw conveyor turns...
// index.js passes its helpers in, so this file imports nothing.

// [shape, label, w, h, tone, palette category]
export const MACHINE2_SHAPES = [
    // pneumatics and hydraulics
    ['pneuCyl', 'Cilindro pneumático (haste sai com a chave)', 260, 70, '', 'Pneumática'],
    ['linActuator', 'Atuador linear elétrico', 300, 70, '', 'Pneumática'],
    ['valve52', 'Válvula 5/2 com solenoide', 200, 90, '', 'Pneumática'],
    ['frl', 'Unidade de conservação (FRL)', 200, 150, '', 'Pneumática'],
    ['vacuumCup', 'Ventosa', 80, 90, '', 'Pneumática'],
    ['gripper', 'Garra (fecha com a chave)', 120, 130, '', 'Pneumática'],
    ['hydUnit', 'Unidade hidráulica', 240, 170, '', 'Pneumática'],
    ['accumulator', 'Acumulador', 70, 170, '', 'Pneumática'],
    ['manometer', 'Manômetro', 90, 110, '', 'Pneumática'],
    ['solenoid', 'Solenoide / bobina', 90, 70, '', 'Pneumática'],
    ['muffler', 'Silenciador', 40, 90, '', 'Pneumática'],
    // sensors and safety
    ['photoEye', 'Sensor fotoelétrico (feixe corta com a chave)', 280, 60, '', 'Sensores'],
    ['proxSensor', 'Sensor indutivo / capacitivo', 140, 40, '', 'Sensores'],
    ['limitSwitch', 'Fim de curso', 90, 120, '', 'Sensores'],
    ['encoder', 'Encoder', 100, 100, '', 'Sensores'],
    ['lightCurtain', 'Cortina de luz', 260, 220, '', 'Sensores'],
    ['laserScanner', 'Scanner a laser', 120, 90, '', 'Sensores'],
    ['camera', 'Câmera de visão', 130, 90, '', 'Sensores'],
    ['barcode', 'Leitor de código', 110, 110, '', 'Sensores'],
    ['floatSwitch', 'Chave de nível (boia)', 60, 150, '', 'Sensores'],
    ['thermo', 'Termopar / PT100', 40, 170, '', 'Sensores'],
    ['estop', 'Botão de emergência', 90, 90, '', 'Sensores'],
    ['beacon', 'Sinalizador / sirene', 70, 120, '', 'Sensores'],
    ['safetySwitch', 'Chave de segurança da porta', 90, 110, '', 'Sensores'],
    // motion and handling
    ['servo', 'Servomotor', 220, 100, '', 'Manuseio'],
    ['gearmotor', 'Motorredutor', 260, 130, '', 'Manuseio'],
    ['rotaryTable', 'Mesa giratória / indexadora', 180, 180, '', 'Manuseio'],
    ['gantry', 'Pórtico X/Z (desce com a chave)', 360, 260, '', 'Manuseio'],
    ['scara', 'Robô SCARA', 240, 220, '', 'Manuseio'],
    ['delta', 'Robô delta', 200, 200, '', 'Manuseio'],
    ['scissorLift', 'Mesa elevatória (sobe com a chave)', 220, 200, '', 'Manuseio'],
    ['dancer', 'Braço dançarino (tensão)', 240, 170, '', 'Manuseio'],
    ['operator', 'Operador', 80, 200, '', 'Manuseio'],
    ['hmiPanel', 'Painel IHM / tela', 160, 130, '', 'Manuseio'],
    ['pushStation', 'Botoeira', 100, 170, '', 'Manuseio'],
    // production and packaging
    ['screwConveyor', 'Rosca transportadora', 380, 100, '', 'Produção'],
    ['bucketElevator', 'Elevador de canecas', 130, 340, '', 'Produção'],
    ['vibFeeder', 'Alimentador vibratório', 190, 170, '', 'Produção'],
    ['chute', 'Calha / rampa', 260, 120, '', 'Produção'],
    ['diverter', 'Desviador de esteira', 220, 130, '', 'Produção'],
    ['extruder', 'Extrusora', 440, 180, '', 'Produção'],
    ['injection', 'Injetora (fecha o molde com a chave)', 460, 200, '', 'Produção'],
    ['guillotine', 'Guilhotina (lâmina desce com a chave)', 220, 230, '', 'Produção'],
    ['saw', 'Serra circular', 150, 150, '', 'Produção'],
    ['spindle', 'Cabeçote de usinagem (spindle)', 120, 240, '', 'Produção'],
    ['drill', 'Furadeira de coluna', 180, 280, '', 'Produção'],
    ['punch', 'Puncionadeira / prensa C', 230, 260, '', 'Produção'],
    ['filler', 'Enchedora (bicos)', 300, 230, '', 'Produção'],
    ['capper', 'Tampadora', 160, 240, '', 'Produção'],
    ['labeler', 'Rotuladora', 240, 180, '', 'Produção'],
    ['wrapper', 'Envolvedora de palete (stretch)', 280, 280, '', 'Produção'],
    ['cardboard', 'Caixa de papelão', 120, 100, '', 'Produção'],
    ['bottle', 'Garrafa', 50, 140, '', 'Produção'],
    ['can', 'Lata / balde', 70, 100, '', 'Produção'],
    ['pallet', 'Palete', 220, 60, '', 'Produção']
]

// shapes that can turn around their centre while the key is on
export const MACHINE2_ROUND = ['encoder', 'rotaryTable', 'saw']

// shapes whose moving part can follow a number (0 % to 100 % of min..max) instead of on/off
export const MACHINE2_ANALOG = ['pneuCyl', 'linActuator', 'gripper', 'frl', 'manometer', 'limitSwitch', 'floatSwitch', 'gantry', 'scara', 'delta',
    'scissorLift', 'dancer', 'diverter', 'injection', 'guillotine', 'drill', 'punch', 'filler', 'capper', 'wrapper']

// on: the key state (true/false/null); pos: 0..1 when the part follows a value
export function machine2Path (shape, w, h, H, on, pos) {
    const { f, poly, box } = H
    const t = typeof pos === 'number' ? pos : (on ? 1 : 0)
    const L = (a, b) => a + (b - a) * t
    const m = Math.min(w, h)
    const cx = w / 2
    const cy = h / 2
    const circle = (cls, x, y, r) => `<circle class="${cls}" cx="${f(x)}" cy="${f(y)}" r="${f(Math.max(0, r))}"/>`
    const ellipse = (cls, x, y, rx, ry) => `<ellipse class="${cls}" cx="${f(x)}" cy="${f(y)}" rx="${f(Math.max(0, rx))}" ry="${f(Math.max(0, ry))}"/>`
    const path = (cls, d, extra) => `<path class="${cls}" d="${d}"${extra || ''}/>`
    const rrect = (cls, x, y, bw, bh, r) => `<rect class="${cls}" x="${f(x)}" y="${f(y)}" width="${f(Math.max(0, bw))}" height="${f(Math.max(0, bh))}" rx="${f(r || 0)}"/>`
    const line = (x1, y1, x2, y2) => `M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}`
    // a bar of thickness t between two points (arms, links, scissors)
    const bar = (x1, y1, x2, y2, t) => {
        const len = Math.hypot(x2 - x1, y2 - y1) || 1
        const nx = -(y2 - y1) / len * t / 2
        const ny = (x2 - x1) / len * t / 2
        return poly([[x1 + nx, y1 + ny], [x2 + nx, y2 + ny], [x2 - nx, y2 - ny], [x1 - nx, y1 - ny]])
    }
    // cooling fins of a motor body
    const fins = (x, y, bw, bh, n) => path('hmi-detail', Array.from({ length: n }, (v, i) => line(x + bw * (i + 1) / (n + 1), y + bh * 0.12, x + bw * (i + 1) / (n + 1), y + bh * 0.88)).join(''))
    const ind = (x, y, r) => circle('hmi-ind', x, y, r)
    switch (shape) {
    case 'pneuCyl': {
        const rodEnd = L(w * 0.8, w * 0.97)
        const px = L(w * 0.13, w * 0.58)
        return box(w * 0.69, h * 0.42, rodEnd - w * 0.69, h * 0.16) + circle('hmi-body', rodEnd - h * 0.04, cy, h * 0.12) +
            box(w * 0.07, h * 0.15, w * 0.57, h * 0.7) + box(0, h * 0.06, w * 0.08, h * 0.88) + box(w * 0.63, h * 0.06, w * 0.07, h * 0.88) +
            path('hmi-detail', line(px, h * 0.2, px, h * 0.8)) + box(w * 0.13, 0, w * 0.05, h * 0.07) + box(w * 0.53, 0, w * 0.05, h * 0.07)
    }
    case 'linActuator': {
        const rodEnd = L(w * 0.82, w * 0.98)
        return box(w * 0.7, h * 0.4, rodEnd - w * 0.7, h * 0.2) + box(rodEnd - w * 0.04, h * 0.3, w * 0.04, h * 0.4) +
            box(w * 0.2, h * 0.24, w * 0.52, h * 0.52) + rrect('hmi-body', 0, h * 0.08, w * 0.21, h * 0.84, 4) + fins(0, h * 0.08, w * 0.21, h * 0.84, 4) +
            path('hmi-detail', line(w * 0.24, h * 0.36, w * 0.68, h * 0.36))
    }
    case 'valve52': {
        const sq = w * 0.28
        const y0 = h * 0.12
        const sh = h * 0.6
        const a = w * 0.2
        const b = a + sq
        // energised: the solenoid side square is the one connected
        const sqA = `<rect class="hmi-body${on ? ' hmi-act' : ''}" x="${f(a)}" y="${f(y0)}" width="${f(sq)}" height="${f(sh)}"/>`
        const sqB = `<rect class="hmi-body${on ? '' : ' hmi-act'}" x="${f(b)}" y="${f(y0)}" width="${f(sq)}" height="${f(sh)}"/>`
        const arr = (x1, y1, x2, y2) => line(x1, y1, x2, y2) + line(x2, y2, x2 - (x2 - x1) * 0.18 - (y2 - y1) * 0.12, y2 - (y2 - y1) * 0.18 + (x2 - x1) * 0.12) + line(x2, y2, x2 - (x2 - x1) * 0.18 + (y2 - y1) * 0.12, y2 - (y2 - y1) * 0.18 - (x2 - x1) * 0.12)
        const inA = arr(a + sq * 0.25, y0 + sh, a + sq * 0.75, y0) + arr(a + sq * 0.75, y0 + sh, a + sq * 0.25, y0)
        const inB = arr(b + sq * 0.25, y0 + sh, b + sq * 0.25, y0) + arr(b + sq * 0.75, y0, b + sq * 0.75, y0 + sh)
        let spring = `M${f(b + sq)} ${f(y0 + sh / 2)}`
        for (let i = 0; i < 5; i++) spring += `L${f(b + sq + (i + 0.5) * w * 0.045)} ${f(y0 + sh / 2 + (i % 2 ? 1 : -1) * sh * 0.25)}`
        spring += `L${f(w)} ${f(y0 + sh / 2)}`
        return sqA + sqB + path('hmi-detail', inA + inB) + rrect('hmi-body', 0, y0 + sh * 0.15, a, sh * 0.7, 2) + path('hmi-detail', line(a * 0.2, y0 + sh * 0.85, a * 0.8, y0 + sh * 0.15)) +
            path('hmi-strap hmi-thin', spring) + path('hmi-detail', line(a + sq * 0.25, y0 + sh, a + sq * 0.25, h) + line(a + sq * 0.75, y0 + sh, a + sq * 0.75, h) + line(a + sq * 0.5, y0, a + sq * 0.5, 0))
    }
    case 'frl': {
        const u = w / 3
        const pipe = box(0, h * 0.14, w, h * 0.12)
        const unit = (i, kind) => {
            const x = u * i + u * 0.15
            const bw = u * 0.7
            let out = box(x, h * 0.06, bw, h * 0.28)
            if (kind === 'reg') return out + box(x + bw * 0.3, 0, bw * 0.4, h * 0.06) + circle('hmi-body', x + bw / 2, h * 0.58, bw * 0.38) + circle('hmi-detail', x + bw / 2, h * 0.58, bw * 0.28) + path('hmi-strap hmi-thin', line(x + bw / 2, h * 0.58, x + bw / 2 + Math.cos(Math.PI * (0.75 + 1.5 * (typeof pos === 'number' ? t : 0.55))) * bw * 0.24, h * 0.58 + Math.sin(Math.PI * (0.75 + 1.5 * (typeof pos === 'number' ? t : 0.55))) * bw * 0.24))
            out += path('hmi-body', `M${f(x + bw * 0.1)} ${f(h * 0.34)}H${f(x + bw * 0.9)}V${f(h * 0.82)}Q${f(x + bw * 0.9)} ${f(h)} ${f(x + bw / 2)} ${f(h)}Q${f(x + bw * 0.1)} ${f(h)} ${f(x + bw * 0.1)} ${f(h * 0.82)}Z`)
            out += rrect('hmi-glass', x + bw * 0.25, h * 0.42, bw * 0.5, h * 0.4, bw * 0.2)
            if (kind === 'lub') out += path('hmi-detail', `M${f(x + bw / 2)} ${f(h * 0.5)}q${f(-bw * 0.12)} ${f(h * 0.1)} 0 ${f(h * 0.14)}q${f(bw * 0.12)} ${f(-h * 0.04)} 0 ${f(-h * 0.14)}`)
            return out
        }
        return pipe + unit(0, 'filter') + unit(1, 'reg') + unit(2, 'lub')
    }
    case 'vacuumCup': return box(cx - w * 0.08, 0, w * 0.16, h * 0.5) + box(cx - w * 0.18, h * 0.12, w * 0.36, h * 0.1) + poly([[w * 0.28, h * 0.5], [w * 0.72, h * 0.5], [w, h * 0.92], [w, h], [0, h], [0, h * 0.92]])
    case 'gripper': {
        const g = L(w * 0.2, w * 0.05)
        return box(w * 0.08, h * 0.36, w * 0.84, h * 0.1) + rrect('hmi-body', w * 0.22, 0, w * 0.56, h * 0.38, 3) + box(cx - w * 0.08, h * 0.04, w * 0.16, h * 0.08) +
            poly([[cx - g - w * 0.16, h * 0.46], [cx - g, h * 0.46], [cx - g, h], [cx - g - w * 0.06, h], [cx - g - w * 0.16, h * 0.7]]) +
            poly([[cx + g, h * 0.46], [cx + g + w * 0.16, h * 0.46], [cx + g + w * 0.16, h * 0.7], [cx + g + w * 0.06, h], [cx + g, h]])
    }
    case 'hydUnit':
        return box(0, h * 0.42, w, h * 0.58) + rrect('hmi-glass', w * 0.06, h * 0.55, w * 0.06, h * 0.3, 2) + circle('hmi-body', w * 0.82, h * 0.68, m * 0.1) + circle('hmi-detail', w * 0.82, h * 0.68, m * 0.07) +
            rrect('hmi-body', w * 0.06, h * 0.1, w * 0.36, h * 0.3, 4) + fins(w * 0.06, h * 0.1, w * 0.36, h * 0.3, 5) + box(w * 0.42, h * 0.14, w * 0.08, h * 0.22) +
            box(w * 0.5, h * 0.18, w * 0.13, h * 0.2) + rrect('hmi-body', w * 0.72, h * 0.04, w * 0.11, h * 0.36, w * 0.03) + box(w * 0.63, h * 0.24, w * 0.09, h * 0.05) + ind(w * 0.36, h * 0.5, m * 0.06)
    case 'accumulator':
        return rrect('hmi-body', w * 0.08, 0, w * 0.84, h * 0.86, w * 0.42) + path('hmi-detail', line(w * 0.1, h * 0.45, w * 0.9, h * 0.45)) + box(cx - w * 0.12, h * 0.86, w * 0.24, h * 0.14) + box(cx - w * 0.06, 0, w * 0.12, h * 0.04)
    case 'manometer': {
        const r = Math.min(w, h * 0.82) * 0.47
        const gy = r + 1
        let ticks = ''
        for (let i = 0; i <= 8; i++) {
            const a = Math.PI * (0.75 + i * 1.5 / 8)
            ticks += line(cx + Math.cos(a) * r * 0.72, gy + Math.sin(a) * r * 0.72, cx + Math.cos(a) * r * 0.86, gy + Math.sin(a) * r * 0.86)
        }
        const na = Math.PI * (typeof pos === 'number' ? 0.75 + 1.5 * t : (on ? 1.95 : 1.25))
        return box(cx - w * 0.07, gy + r * 0.9, w * 0.14, h - gy - r * 0.9) + circle('hmi-body', cx, gy, r) + circle('hmi-glass', cx, gy, r * 0.88) + path('hmi-detail', ticks) +
            path('hmi-strap', line(cx, gy, cx + Math.cos(na) * r * 0.7, gy + Math.sin(na) * r * 0.7), ' style="stroke-width:2"') + circle('hmi-body', cx, gy, r * 0.08)
    }
    case 'solenoid': {
        let coil = ''
        for (let i = 0; i < 6; i++) coil += line(w * (0.24 + i * 0.1), h * 0.22, w * (0.29 + i * 0.1), h * 0.78)
        return rrect('hmi-body', w * 0.1, h * 0.1, w * 0.8, h * 0.8, 4) + path('hmi-detail', coil) + box(w * 0.25, 0, w * 0.08, h * 0.12) + box(w * 0.67, 0, w * 0.08, h * 0.12) + ind(w * 0.8, h * 0.25, m * 0.06)
    }
    case 'muffler': {
        let dots = ''
        for (let y = h * 0.4; y < h * 0.92; y += h * 0.09) for (const x of [0.32, 0.5, 0.68]) dots += circle('hmi-detail', w * x, y, Math.max(0.8, w * 0.04))
        return box(w * 0.3, 0, w * 0.4, h * 0.22) + path('hmi-detail', line(w * 0.3, h * 0.07, w * 0.7, h * 0.07) + line(w * 0.3, h * 0.14, w * 0.7, h * 0.14)) + box(w * 0.15, h * 0.22, w * 0.7, h * 0.08) + rrect('hmi-body', w * 0.15, h * 0.3, w * 0.7, h * 0.7, w * 0.3) + dots +
            (on ? path('hmi-rays hmi-air', line(0, h * 0.5, w * 0.1, h * 0.55) + line(0, h * 0.75, w * 0.1, h * 0.75) + line(w, h * 0.5, w * 0.9, h * 0.55) + line(w, h * 0.75, w * 0.9, h * 0.75)) : '')
    }
    case 'photoEye': {
        const ew = Math.min(w * 0.14, h * 0.9)
        const beam = on ? path('hmi-beam hmi-beam-cut', line(ew, cy, cx, cy)) : path('hmi-beam', line(ew, cy, w - ew, cy))
        return beam + rrect('hmi-body', 0, h * 0.12, ew, h * 0.76, 3) + circle('hmi-glass', ew * 0.72, cy, h * 0.18) + rrect('hmi-body', w - ew, h * 0.12, ew, h * 0.76, 3) + circle('hmi-glass', w - ew * 0.72, cy, h * 0.18) +
            ind(ew * 0.3, h * 0.25, h * 0.07) + ind(w - ew * 0.3, h * 0.25, h * 0.07)
    }
    case 'proxSensor': {
        let thread = ''
        for (let x = w * 0.08; x < w * 0.72; x += Math.max(4, h * 0.18)) thread += line(x, h * 0.22, x + h * 0.08, h * 0.78)
        return box(0, h * 0.22, w * 0.74, h * 0.56) + path('hmi-detail', thread) + box(w * 0.18, h * 0.06, w * 0.07, h * 0.88) + box(w * 0.5, h * 0.06, w * 0.07, h * 0.88) +
            rrect('hmi-body', w * 0.74, h * 0.26, w * 0.12, h * 0.48, 2) + box(w * 0.86, h * 0.4, w * 0.14, h * 0.2) + ind(w * 0.06, cy, h * 0.12)
    }
    case 'limitSwitch': {
        const px = cx
        const py = h * 0.3
        const a = L(-65, -25) * Math.PI / 180
        const len = Math.min(h * 0.3, w * 0.5)
        const ex = px + Math.cos(a) * len
        const ey = py + Math.sin(a) * len
        return bar(px, py, ex, ey, Math.max(3, w * 0.07)) + circle('hmi-body', ex, ey, Math.max(4, w * 0.1)) + rrect('hmi-body', w * 0.08, h * 0.38, w * 0.84, h * 0.62, 4) +
            box(cx - w * 0.18, h * 0.24, w * 0.36, h * 0.14) + circle('hmi-body', px, py, Math.max(3, w * 0.07)) + path('hmi-detail', line(w * 0.2, h * 0.55, w * 0.8, h * 0.55)) + ind(w * 0.25, h * 0.85, m * 0.06)
    }
    case 'encoder': {
        const r = m * 0.46
        let slots = ''
        for (let i = 0; i < 16; i++) {
            const an = i * Math.PI / 8
            slots += line(cx + Math.cos(an) * r * 0.55, cy + Math.sin(an) * r * 0.55, cx + Math.cos(an) * r * 0.78, cy + Math.sin(an) * r * 0.78)
        }
        return circle('hmi-body', cx, cy, r) + circle('hmi-detail', cx, cy, r * 0.85) + path('hmi-detail', slots, ' style="stroke-width:2.5"') + circle('hmi-body', cx, cy, r * 0.22) + circle('hmi-detail', cx, cy, r * 0.08)
    }
    case 'lightCurtain': {
        const pw = Math.max(10, w * 0.07)
        const n = Math.max(4, Math.round(h / 22))
        let beams = ''
        for (let i = 0; i < n; i++) {
            const y = h * 0.08 + (h * 0.84) * (i + 0.5) / n
            beams += line(pw, y, w - pw, y)
        }
        return path(on ? 'hmi-beam hmi-beam-cut' : 'hmi-beam', beams) + rrect('hmi-body', 0, 0, pw, h, 3) + rrect('hmi-body', w - pw, 0, pw, h, 3) +
            ind(pw / 2, h * 0.04, pw * 0.25) + ind(w - pw / 2, h * 0.04, pw * 0.25)
    }
    case 'laserScanner': {
        const sx = cx
        const sy = h * 0.62
        const r = Math.min(w * 0.5, sy)
        const a1 = Math.PI * 1.08
        const a2 = Math.PI * 1.92
        const field = `M${f(sx)} ${f(sy)}L${f(sx + Math.cos(a1) * r)} ${f(sy + Math.sin(a1) * r)}A${f(r)} ${f(r)} 0 0 1 ${f(sx + Math.cos(a2) * r)} ${f(sy + Math.sin(a2) * r)}Z`
        return path(on ? 'hmi-field hmi-beam-cut' : 'hmi-field', field) + rrect('hmi-body', cx - w * 0.22, sy - h * 0.12, w * 0.44, h * 0.5 - (sy - h * 0.62), 4) +
            path('hmi-body', `M${f(cx - w * 0.16)} ${f(sy - h * 0.1)}A${f(w * 0.16)} ${f(h * 0.14)} 0 0 1 ${f(cx + w * 0.16)} ${f(sy - h * 0.1)}Z`) + rrect('hmi-glass', cx - w * 0.14, sy - h * 0.04, w * 0.28, h * 0.08, 2) + ind(cx + w * 0.15, h * 0.88, m * 0.04)
    }
    case 'camera':
        return rrect('hmi-body', 0, h * 0.18, w * 0.66, h * 0.58, 4) + box(w * 0.66, h * 0.27, w * 0.18, h * 0.4) + rrect('hmi-body', w * 0.84, h * 0.22, w * 0.16, h * 0.5, 2) +
            ellipse('hmi-glass', w * 0.92, h * 0.47, w * 0.05, h * 0.17) + box(w * 0.24, h * 0.76, w * 0.18, h * 0.24) + ind(w * 0.1, h * 0.3, m * 0.05) + path('hmi-detail', line(w * 0.06, h * 0.62, w * 0.5, h * 0.62))
    case 'barcode': {
        let stripes = ''
        const bx = w * 0.18
        const bw = w * 0.64
        const ws = [2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2]
        const tot = ws.reduce((s, v) => s + v + 1, 0)
        let x = bx
        for (const v of ws) { stripes += `<rect class="hmi-bars" x="${f(x)}" y="${f(h * 0.78)}" width="${f(bw * v / tot)}" height="${f(h * 0.2)}"/>`; x += bw * (v + 1) / tot }
        return rrect('hmi-body', w * 0.1, 0, w * 0.8, h * 0.42, 5) + rrect('hmi-glass', w * 0.2, h * 0.3, w * 0.6, h * 0.08, 2) + ind(w * 0.8, h * 0.12, m * 0.05) +
            (on ? path('hmi-beam hmi-beam-cut', `M${f(cx)} ${f(h * 0.38)}L${f(bx)} ${f(h * 0.78)}H${f(bx + bw)}Z`) : path('hmi-beam', line(cx, h * 0.38, cx, h * 0.76))) + stripes
    }
    case 'floatSwitch': {
        const fy = L(h * 0.62, h * 0.32)
        return box(cx - w * 0.3, 0, w * 0.6, h * 0.07) + box(cx - w * 0.05, h * 0.07, w * 0.1, h * 0.8) + box(cx - w * 0.15, h * 0.85, w * 0.3, h * 0.05) + ellipse('hmi-body', cx, fy, w * 0.42, h * 0.1)
    }
    case 'thermo':
        return rrect('hmi-body', 0, 0, w, h * 0.18, 4) + box(w * 0.28, h * 0.18, w * 0.44, h * 0.1) + path('hmi-detail', line(w * 0.28, h * 0.22, w * 0.72, h * 0.22)) +
            path('hmi-body', `M${f(w * 0.38)} ${f(h * 0.28)}H${f(w * 0.62)}V${f(h * 0.96)}Q${f(cx)} ${f(h)} ${f(w * 0.38)} ${f(h * 0.96)}Z`) + box(w * 0.1, h * 0.04, w * 0.12, h * 0.06)
    case 'estop': {
        const r = m * (on ? 0.31 : 0.36)
        return rrect('hmi-body', 0, 0, w, h, m * 0.12) + rrect('hmi-yel', m * 0.04, m * 0.04, w - m * 0.08, h - m * 0.08, m * 0.1) + circle('hmi-detail', cx, cy, m * 0.42) + circle('hmi-red' + (on ? ' hmi-red-on' : ''), cx, cy, r) + circle('hmi-red-ring', cx, cy, r * 0.7)
    }
    case 'beacon': {
        const top = h * 0.05
        const bh = h * 0.72
        const rays = on ? path('hmi-rays', line(w * 0.05, top + bh * 0.3, w * 0.18, top + bh * 0.35) + line(w * 0.95, top + bh * 0.3, w * 0.82, top + bh * 0.35) + line(cx, 0, cx, top * 0.6)) : ''
        return rays + path('hmi-ind hmi-dome', `M${f(w * 0.2)} ${f(top + bh)}V${f(top + w * 0.3)}A${f(w * 0.3)} ${f(w * 0.3)} 0 0 1 ${f(w * 0.8)} ${f(top + w * 0.3)}V${f(top + bh)}Z`) +
            path('hmi-detail', line(w * 0.2, top + bh * 0.55, w * 0.8, top + bh * 0.55)) + box(w * 0.1, top + bh, w * 0.8, h - top - bh)
    }
    case 'safetySwitch': {
        const ty = on ? h * 0.08 : 0
        return box(cx - w * 0.12, ty - h * 0.02, w * 0.24, h * 0.24) + box(cx - w * 0.3, ty - h * 0.02, w * 0.6, h * 0.08) + rrect('hmi-body', w * 0.1, h * 0.3, w * 0.8, h * 0.7, 4) +
            box(cx - w * 0.16, h * 0.26, w * 0.32, h * 0.06) + ind(w * 0.25, h * 0.85, m * 0.06) + path('hmi-detail', line(w * 0.2, h * 0.5, w * 0.8, h * 0.5))
    }
    case 'servo':
        return box(0, h * 0.42, w * 0.12, h * 0.16) + box(w * 0.1, h * 0.06, w * 0.07, h * 0.88) + rrect('hmi-body', w * 0.17, 0, w * 0.62, h, 4) + fins(w * 0.17, 0, w * 0.62, h, 6) +
            rrect('hmi-body', w * 0.79, h * 0.14, w * 0.18, h * 0.72, 6) + box(w * 0.82, h * 0.02, w * 0.1, h * 0.12) + ind(w * 0.9, h * 0.5, m * 0.05)
    case 'gearmotor':
        return box(0, h * 0.36, w * 0.12, h * 0.13) + rrect('hmi-body', w * 0.12, 0, w * 0.33, h * 0.84, 6) + circle('hmi-detail', w * 0.285, h * 0.42, m * 0.18) + box(w * 0.1, h * 0.84, w * 0.37, h * 0.16) +
            rrect('hmi-body', w * 0.45, h * 0.16, w * 0.42, h * 0.58, 4) + fins(w * 0.45, h * 0.16, w * 0.42, h * 0.58, 6) + rrect('hmi-body', w * 0.87, h * 0.2, w * 0.11, h * 0.5, 6) + box(w * 0.56, h * 0.02, w * 0.16, h * 0.14)
    case 'rotaryTable': {
        const r = m * 0.47
        let st = ''
        for (let i = 0; i < 6; i++) {
            const an = i * Math.PI / 3 - Math.PI / 2
            st += rrect('hmi-detail', cx + Math.cos(an) * r * 0.66 - r * 0.13, cy + Math.sin(an) * r * 0.66 - r * 0.13, r * 0.26, r * 0.26, 2)
        }
        return circle('hmi-body', cx, cy, r) + circle('hmi-detail', cx, cy, r * 0.92) + st + circle('hmi-body', cx, cy, r * 0.25) + path('hmi-detail', line(cx, cy - r * 0.25, cx, cy - r * 0.12))
    }
    case 'gantry': {
        const zy = L(h * 0.42, h * 0.66)
        const lw = w * 0.05
        return box(0, h * 0.12, lw, h * 0.88) + box(w - lw, h * 0.12, lw, h * 0.88) + box(0, h * 0.08, w, h * 0.1) + path('hmi-detail', line(lw, h * 0.13, w - lw, h * 0.13)) +
            box(w * 0.42, h * 0.24, w * 0.05, zy - h * 0.24) + rrect('hmi-body', w * 0.38, h * 0.02, w * 0.13, h * 0.24, 3) + box(w * 0.4, zy, w * 0.09, h * 0.05) +
            box(w * 0.4, zy + h * 0.05, w * 0.025, h * 0.08) + box(w * 0.465, zy + h * 0.05, w * 0.025, h * 0.08) + box(0, h * 0.95, w, h * 0.05)
    }
    case 'scara': {
        const j1 = [w * 0.2, h * 0.32]
        const j2 = [w * 0.62, h * 0.22]
        const j3 = [w * 0.88, h * 0.34]
        return box(w * 0.06, h * 0.82, w * 0.28, h * 0.18) + box(w * 0.12, h * 0.3, w * 0.16, h * 0.52) + bar(j1[0], j1[1], j2[0], j2[1], h * 0.12) + bar(j2[0], j2[1], j3[0], j3[1], h * 0.1) +
            circle('hmi-body', j1[0], j1[1], h * 0.08) + circle('hmi-body', j2[0], j2[1], h * 0.07) + box(j3[0] - w * 0.025, j3[1], w * 0.05, h * L(0.36, 0.5)) + circle('hmi-body', j3[0], j3[1], h * 0.06)
    }
    case 'delta': {
        const ey = L(h * 0.68, h * 0.85)
        const ex = cx
        const tops = [[w * 0.18, h * 0.16], [cx, h * 0.16], [w * 0.82, h * 0.16]]
        const elb = [[w * 0.08, h * 0.42], [cx, h * 0.38], [w * 0.92, h * 0.42]]
        let arms = ''
        tops.forEach((t, i) => { arms += bar(t[0], t[1], elb[i][0], elb[i][1], w * 0.04) + bar(elb[i][0], elb[i][1], ex + (i - 1) * w * 0.06, ey, w * 0.025) })
        return box(w * 0.05, 0, w * 0.9, h * 0.12) + tops.map(t => rrect('hmi-body', t[0] - w * 0.06, h * 0.1, w * 0.12, h * 0.1, 2)).join('') + arms + ellipse('hmi-body', ex, ey, w * 0.11, h * 0.035) + box(ex - w * 0.02, ey, w * 0.04, h * 0.08)
    }
    case 'scissorLift': {
        const py = L(h * 0.5, h * 0.04)
        const t = Math.max(4, m * 0.05)
        return box(0, h * 0.92, w, h * 0.08) + bar(w * 0.12, h * 0.92, w * 0.88, py + h * 0.08, t) + bar(w * 0.12, py + h * 0.08, w * 0.88, h * 0.92, t) +
            circle('hmi-body', cx, (h * 0.92 + py + h * 0.08) / 2, t * 0.8) + box(0, py, w, h * 0.08) + box(w * 0.86, h * 0.86, w * 0.06, h * 0.06)
    }
    case 'dancer': {
        const p = [w * 0.16, h * 0.72]
        const ry = L(h * 0.56, h * 0.3)
        const roll = [w * 0.78, ry]
        const r = m * 0.12
        const g1 = [w * 0.08, h * 0.12]
        const g2 = [w * 0.94, h * 0.12]
        return path('hmi-strap hmi-thin', `M0 ${f(g1[1] - r * 0.7)}L${f(g1[0])} ${f(g1[1] - r * 0.7)}L${f(roll[0] - r)} ${f(roll[1])}A${f(r)} ${f(r)} 0 0 0 ${f(roll[0] + r)} ${f(roll[1])}L${f(g2[0])} ${f(g2[1] - r * 0.7)}L${f(w)} ${f(g2[1] - r * 0.7)}`) +
            bar(p[0], p[1], roll[0], roll[1], m * 0.07) + box(w * 0.42, (p[1] + roll[1]) / 2, w * 0.06, h * 0.95 - (p[1] + roll[1]) / 2) + circle('hmi-body', p[0], p[1], m * 0.06) +
            circle('hmi-body', roll[0], roll[1], r) + circle('hmi-detail', roll[0], roll[1], r * 0.3) + circle('hmi-body', g1[0], g1[1], r * 0.7) + circle('hmi-body', g2[0], g2[1], r * 0.7) + box(w * 0.08, h * 0.92, w * 0.5, h * 0.08)
    }
    case 'operator': {
        const r = Math.min(w * 0.22, h * 0.09)
        // on: the operator is there / logged in
        return circle('hmi-body' + (on ? ' hmi-act' : ''), cx, r + 1, r) + path('hmi-body' + (on ? ' hmi-act' : ''), `M${f(cx - w * 0.38)} ${f(h * 0.55)}V${f(r * 2 + h * 0.1)}Q${f(cx - w * 0.38)} ${f(r * 2 + h * 0.03)} ${f(cx - w * 0.2)} ${f(r * 2 + h * 0.03)}H${f(cx + w * 0.2)}Q${f(cx + w * 0.38)} ${f(r * 2 + h * 0.03)} ${f(cx + w * 0.38)} ${f(r * 2 + h * 0.1)}V${f(h * 0.55)}H${f(cx + w * 0.26)}V${f(h)}H${f(cx + w * 0.03)}V${f(h * 0.62)}H${f(cx - w * 0.03)}V${f(h)}H${f(cx - w * 0.26)}V${f(h * 0.55)}Z`) +
            path('hmi-detail', line(cx - w * 0.26, h * 0.3, cx - w * 0.26, h * 0.55) + line(cx + w * 0.26, h * 0.3, cx + w * 0.26, h * 0.55))
    }
    case 'hmiPanel':
        return rrect('hmi-body', 0, 0, w, h * 0.85, 5) + rrect(on ? 'hmi-glass hmi-screen-on' : 'hmi-glass', w * 0.07, h * 0.08, w * 0.86, h * 0.6, 2) + path('hmi-detail', line(w * 0.14, h * 0.5, w * 0.3, h * 0.35) + line(w * 0.3, h * 0.35, w * 0.48, h * 0.45) + line(w * 0.48, h * 0.45, w * 0.7, h * 0.2)) +
            [0.25, 0.42, 0.59, 0.76].map(k => circle('hmi-detail', w * k, h * 0.76, m * 0.035)).join('') + box(cx - w * 0.1, h * 0.85, w * 0.2, h * 0.15)
    case 'pushStation':
        return rrect('hmi-body', 0, h * 0.06, w, h * 0.94, 5) + circle('hmi-red', cx, h * 0.06 + m * 0.05, m * 0.14) + circle('hmi-btn-g', cx, h * 0.45, m * 0.16) + circle('hmi-detail', cx, h * 0.45, m * 0.2) +
            circle('hmi-btn-r', cx, h * 0.72, m * 0.16) + circle('hmi-detail', cx, h * 0.72, m * 0.2) + box(cx - w * 0.08, h * 0.98 - 2, w * 0.16, 2)
    case 'screwConveyor': {
        const ty = h * 0.28
        const th = h * 0.44
        const x0 = w * 0.05
        const x1 = w * 0.88
        const pitch = Math.max(10, th * 0.8)
        let helix = `M${f(x0)} ${f(ty + th / 2)}`
        for (let x = x0; x < x1; x += pitch) helix += `Q${f(x + pitch * 0.25)} ${f(ty + 2)} ${f(x + pitch * 0.5)} ${f(ty + th / 2)}Q${f(x + pitch * 0.75)} ${f(ty + th - 2)} ${f(Math.min(x1, x + pitch))} ${f(ty + th / 2)}`
        return box(x0 + w * 0.03, 0, w * 0.12, ty) + box(x1 - w * 0.12, ty + th, w * 0.1, h - ty - th) + rrect('hmi-body', x0, ty, x1 - x0, th, th * 0.3) +
            path('hmi-strap hmi-move', helix, ` style="stroke-width:${f(Math.max(2, th * 0.08))};stroke-dasharray:${f(pitch * 0.35)} ${f(pitch * 0.15)}"`) +
            path('hmi-detail', line(x0, ty + th / 2, x1, ty + th / 2)) + box(x1, h * 0.3, w * 0.03, h * 0.4) + rrect('hmi-body', x1 + w * 0.03, h * 0.22, w * 0.09, h * 0.56, 3)
    }
    case 'bucketElevator': {
        const x0 = w * 0.22
        const bw = w * 0.56
        const top = h * 0.1
        const bot = h * 0.88
        const lx = x0 + bw * 0.28
        const rx = x0 + bw * 0.72
        const belt = `M${f(lx)} ${f(bot - bw * 0.2)}V${f(top + bw * 0.25)}A${f((rx - lx) / 2)} ${f((rx - lx) / 2)} 0 0 1 ${f(rx)} ${f(top + bw * 0.25)}V${f(bot - bw * 0.2)}A${f((rx - lx) / 2)} ${f((rx - lx) / 2)} 0 0 1 ${f(lx)} ${f(bot - bw * 0.2)}Z`
        return box(0, bot - h * 0.12, x0, h * 0.06) + box(x0 + bw, top + h * 0.05, w - x0 - bw, h * 0.06) +
            path('hmi-body', `M${f(x0)} ${f(bot)}V${f(top + bw / 2)}A${f(bw / 2)} ${f(bw / 2)} 0 0 1 ${f(x0 + bw)} ${f(top + bw / 2)}V${f(bot)}Z`) + box(x0 - w * 0.04, bot, bw + w * 0.08, h - bot) +
            path('hmi-strap hmi-move', belt, ` style="stroke-width:${f(Math.max(3, bw * 0.12))};stroke-dasharray:${f(bw * 0.1)} ${f(bw * 0.18)};stroke-linecap:butt"`) +
            circle('hmi-detail', x0 + bw / 2, top + bw * 0.25, (rx - lx) / 2) + circle('hmi-detail', x0 + bw / 2, bot - bw * 0.2, (rx - lx) / 2)
    }
    case 'vibFeeder': {
        const bw = w * 0.74
        const bx = (w - bw) / 2 - w * 0.06
        return `<g class="hmi-vib">` + path('hmi-body', `M${f(bx)} ${f(h * 0.18)}L${f(bx + bw * 0.12)} ${f(h * 0.58)}H${f(bx + bw * 0.88)}L${f(bx + bw)} ${f(h * 0.18)}Z`) +
            ellipse('hmi-body', bx + bw / 2, h * 0.18, bw / 2, h * 0.1) + ellipse('hmi-detail', bx + bw / 2, h * 0.18, bw * 0.3, h * 0.05) + path('hmi-detail', `M${f(bx + bw * 0.05)} ${f(h * 0.3)}Q${f(bx + bw / 2)} ${f(h * 0.4)} ${f(bx + bw * 0.95)} ${f(h * 0.3)}M${f(bx + bw * 0.08)} ${f(h * 0.44)}Q${f(bx + bw / 2)} ${f(h * 0.54)} ${f(bx + bw * 0.92)} ${f(h * 0.44)}`) +
            poly([[bx + bw * 0.95, h * 0.16], [w, h * 0.22], [w, h * 0.3], [bx + bw * 0.92, h * 0.26]]) + '</g>' + box(bx + bw * 0.2, h * 0.58, bw * 0.6, h * 0.24) + box(bx + bw * 0.05, h * 0.82, bw * 0.9, h * 0.18)
    }
    case 'chute': return poly([[0, 0], [w * 0.1, 0], [w, h * 0.72], [w, h], [w * 0.92, h], [0, h * 0.22]]) + path('hmi-detail', line(w * 0.03, h * 0.12, w * 0.96, h * 0.84))
    case 'diverter': {
        const by = h * 0.5
        const bh = h * 0.24
        let rollers = ''
        for (let x = w * 0.04; x < w; x += Math.max(10, bh * 0.6)) rollers += line(x, by + 2, x, by + bh - 2)
        const pv = [w * 0.3, by - h * 0.04]
        const len = w * 0.5
        // the flap swings from along the belt down onto it
        const tip = [L(pv[0] + len, pv[0] + Math.cos(0.42) * len), L(pv[1], by + bh)]
        return box(0, by, w, bh) + path('hmi-detail', rollers) + box(w * 0.55, by + bh, w * 0.3, h - by - bh) + bar(pv[0], pv[1], tip[0], tip[1], h * 0.06) +
            circle('hmi-body', pv[0], pv[1], h * 0.06) + box(pv[0] - w * 0.12, pv[1] - h * 0.1, w * 0.1, h * 0.12)
    }
    case 'extruder': {
        let bands = ''
        for (let i = 0; i < 5; i++) bands += box(w * (0.26 + i * 0.1), h * 0.38, w * 0.06, h * 0.3)
        return box(0, h * 0.3, w * 0.12, h * 0.46) + fins(0, h * 0.3, w * 0.12, h * 0.46, 3) + rrect('hmi-body', w * 0.12, h * 0.26, w * 0.1, h * 0.54, 4) +
            box(w * 0.22, h * 0.42, w * 0.58, h * 0.22) + bands + poly([[w * 0.26, 0], [w * 0.38, 0], [w * 0.34, h * 0.3], [w * 0.3, h * 0.3]]) + box(w * 0.3, h * 0.3, w * 0.04, h * 0.12) +
            poly([[w * 0.8, h * 0.34], [w * 0.86, h * 0.4], [w * 0.86, h * 0.66], [w * 0.8, h * 0.72]]) + (on ? box(w * 0.86, h * 0.48, w * 0.14, h * 0.1) : '') +
            box(w * 0.04, h * 0.84, w * 0.8, h * 0.06) + box(w * 0.06, h * 0.9, w * 0.04, h * 0.1) + box(w * 0.76, h * 0.9, w * 0.04, h * 0.1) + box(w * 0.22, h * 0.8, w * 0.04, h * 0.04)
    }
    case 'injection': {
        const mp = L(w * 0.15, w * 0.24)
        let bands = ''
        for (let i = 0; i < 4; i++) bands += box(w * (0.46 + i * 0.07), h * 0.4, w * 0.04, h * 0.18)
        return box(0, h * 0.76, w, h * 0.24) + path('hmi-detail', line(w * 0.03, h * 0.28, w * 0.32, h * 0.28) + line(w * 0.03, h * 0.66, w * 0.32, h * 0.66)) +
            box(w * 0.02, h * 0.18, w * 0.04, h * 0.58) + box(mp, h * 0.22, w * 0.04, h * 0.5) + box(mp + w * 0.04, h * 0.32, w * 0.04, h * 0.3) +
            box(w * 0.28, h * 0.32, w * 0.03, h * 0.3) + box(w * 0.31, h * 0.18, w * 0.05, h * 0.58) + box(w * 0.06, h * 0.44, mp - w * 0.06, h * 0.06) +
            box(w * 0.36, h * 0.44, w * 0.08, h * 0.1) + box(w * 0.44, h * 0.42, w * 0.32, h * 0.14) + bands + poly([[w * 0.58, h * 0.08], [w * 0.68, h * 0.08], [w * 0.65, h * 0.42], [w * 0.61, h * 0.42]]) +
            rrect('hmi-body', w * 0.76, h * 0.3, w * 0.2, h * 0.4, 4) + fins(w * 0.76, h * 0.3, w * 0.2, h * 0.4, 4)
    }
    case 'guillotine': {
        const by = L(h * 0.18, h * 0.46)
        return box(0, 0, w * 0.1, h * 0.95) + box(w * 0.9, 0, w * 0.1, h * 0.95) + box(0, 0, w, h * 0.13) + box(w * 0.1, by, w * 0.8, h * 0.12) +
            poly([[w * 0.1, by + h * 0.12], [w * 0.9, by + h * 0.12], [w * 0.9, by + h * 0.17], [w * 0.1, by + h * 0.21]]) + box(w * 0.04, h * 0.68, w * 0.92, h * 0.07) +
            box(0, h * 0.95, w * 0.2, h * 0.05) + box(w * 0.8, h * 0.95, w * 0.2, h * 0.05) + box(w * 0.4, h * 0.13, w * 0.2, by - h * 0.13)
    }
    case 'saw': {
        const r = m * 0.48
        const n = Math.max(16, Math.round(r / 2.6))
        let d = ''
        for (let i = 0; i < n; i++) {
            const a0 = i * 2 * Math.PI / n
            const a1 = a0 + Math.PI / n * 1.6
            d += (i ? 'L' : 'M') + f(cx + Math.cos(a0) * r * 0.9) + ' ' + f(cy + Math.sin(a0) * r * 0.9) + 'L' + f(cx + Math.cos(a1) * r) + ' ' + f(cy + Math.sin(a1) * r)
        }
        return path('hmi-body', d + 'Z') + circle('hmi-detail', cx, cy, r * 0.6) + circle('hmi-body', cx, cy, r * 0.2) + circle('hmi-detail', cx, cy, r * 0.07)
    }
    case 'spindle': {
        let flutes = ''
        for (let y = h * 0.7; y < h * 0.98; y += Math.max(4, w * 0.06)) flutes += line(w * 0.44, y, w * 0.56, y + w * 0.05)
        return rrect('hmi-body', w * 0.08, 0, w * 0.84, h * 0.42, 4) + fins(w * 0.08, 0, w * 0.84, h * 0.42, 5) + poly([[w * 0.2, h * 0.42], [w * 0.8, h * 0.42], [w * 0.66, h * 0.55], [w * 0.34, h * 0.55]]) +
            box(w * 0.36, h * 0.55, w * 0.28, h * 0.12) + box(w * 0.44, h * 0.67, w * 0.12, h * 0.33) + path(on ? 'hmi-detail hmi-move-v' : 'hmi-detail', flutes)
    }
    case 'drill': {
        const qy = L(h * 0.3, h * 0.4)
        return box(w * 0.14, h * 0.05, w * 0.1, h * 0.86) + box(0, h * 0.9, w * 0.72, h * 0.1) + rrect('hmi-body', w * 0.08, 0, w * 0.72, h * 0.25, 4) +
            box(w * 0.56, h * 0.25, w * 0.08, qy - h * 0.25 + h * 0.06) + poly([[w * 0.58, qy + h * 0.06], [w * 0.62, qy + h * 0.06], [w * 0.61, qy + h * 0.18], [w * 0.6, qy + h * 0.2], [w * 0.59, qy + h * 0.18]]) +
            box(w * 0.22, h * 0.62, w * 0.6, h * 0.05) + path('hmi-detail', line(w * 0.8, h * 0.18, w * 0.98, h * 0.3) + line(w * 0.8, h * 0.18, w * 0.96, h * 0.08)) + circle('hmi-body', w * 0.8, h * 0.18, m * 0.04)
    }
    case 'punch': {
        const ry = L(h * 0.3, h * 0.42)
        return poly([[w * 0.1, 0], [w * 0.62, 0], [w * 0.62, h * 0.3], [w * 0.36, h * 0.3], [w * 0.36, h * 0.56], [w * 0.62, h * 0.56], [w * 0.62, h * 0.82], [w * 0.1, h * 0.82]]) +
            circle('hmi-body', w * 0.82, h * 0.16, m * 0.17) + circle('hmi-detail', w * 0.82, h * 0.16, m * 0.05) + box(w * 0.6, h * 0.12, w * 0.12, h * 0.06) +
            box(w * 0.42, h * 0.3 - 2, w * 0.14, ry - h * 0.3 + 2) + box(w * 0.46, ry, w * 0.06, h * 0.06) + box(w * 0.4, h * 0.5, w * 0.18, h * 0.06) + box(0, h * 0.82, w * 0.72, h * 0.18)
    }
    case 'filler': {
        const n = 4
        let out = rrect('hmi-body', w * 0.08, 0, w * 0.84, h * 0.2, 6) + box(w * 0.04, h * 0.2, w * 0.04, h * 0.62) + box(w * 0.92, h * 0.2, w * 0.04, h * 0.62)
        for (let i = 0; i < n; i++) {
            const x = w * (0.2 + i * 0.2)
            out += box(x - w * 0.02, h * 0.2, w * 0.04, h * 0.18) + poly([[x - w * 0.035, h * 0.38], [x + w * 0.035, h * 0.38], [x + w * 0.012, h * 0.46], [x - w * 0.012, h * 0.46]])
            out += path('hmi-stream', line(x, h * 0.46, x, h * 0.56), ` style="stroke-width:${f(Math.max(1.5, w * 0.01))}"`)
            out += path('hmi-body', `M${f(x - w * 0.012)} ${f(h * 0.56)}H${f(x + w * 0.012)}V${f(h * 0.6)}Q${f(x + w * 0.04)} ${f(h * 0.62)} ${f(x + w * 0.04)} ${f(h * 0.66)}V${f(h * 0.82)}H${f(x - w * 0.04)}V${f(h * 0.66)}Q${f(x - w * 0.04)} ${f(h * 0.62)} ${f(x - w * 0.012)} ${f(h * 0.6)}Z`)
            if (typeof pos === 'number' && t > 0) out += `<rect class="hmi-fill" x="${f(x - w * 0.034)}" y="${f(h * 0.815 - h * 0.15 * t)}" width="${f(w * 0.068)}" height="${f(h * 0.15 * t)}"/>`
        }
        return out + box(0, h * 0.82, w, h * 0.1) + box(w * 0.04, h * 0.92, w * 0.04, h * 0.08) + box(w * 0.92, h * 0.92, w * 0.04, h * 0.08)
    }
    case 'capper': {
        const hy = L(h * 0.26, h * 0.36)
        return box(w * 0.08, 0, w * 0.12, h * 0.82) + box(w * 0.08, 0, w * 0.6, h * 0.12) + rrect('hmi-body', w * 0.36, h * 0.12, w * 0.3, hy - h * 0.12 + h * 0.06, 3) +
            box(w * 0.44, hy + h * 0.06, w * 0.14, h * 0.06) + path('hmi-body', `M${f(w * 0.46)} ${f(h * 0.5)}H${f(w * 0.56)}V${f(h * 0.54)}Q${f(w * 0.64)} ${f(h * 0.57)} ${f(w * 0.64)} ${f(h * 0.63)}V${f(h * 0.82)}H${f(w * 0.38)}V${f(h * 0.63)}Q${f(w * 0.38)} ${f(h * 0.57)} ${f(w * 0.46)} ${f(h * 0.54)}Z`) +
            box(0, h * 0.82, w, h * 0.08) + box(w * 0.05, h * 0.9, w * 0.05, h * 0.1) + box(w * 0.9, h * 0.9, w * 0.05, h * 0.1)
    }
    case 'labeler':
        return box(w * 0.04, h * 0.05, w * 0.42, h * 0.6) + circle('hmi-body', w * 0.17, h * 0.24, m * 0.13) + circle('hmi-detail', w * 0.17, h * 0.24, m * 0.04) + circle('hmi-body', w * 0.33, h * 0.46, m * 0.09) +
            path('hmi-strap hmi-thin', line(w * 0.17, h * 0.24 + m * 0.13, w * 0.46, h * 0.58) + line(w * 0.33, h * 0.46 - m * 0.09, w * 0.46, h * 0.58)) + poly([[w * 0.46, h * 0.52], [w * 0.58, h * 0.58], [w * 0.46, h * 0.62]]) +
            path('hmi-body', `M${f(w * 0.66)} ${f(h * 0.4)}H${f(w * 0.74)}V${f(h * 0.46)}Q${f(w * 0.82)} ${f(h * 0.5)} ${f(w * 0.82)} ${f(h * 0.56)}V${f(h * 0.82)}H${f(w * 0.58)}V${f(h * 0.56)}Q${f(w * 0.58)} ${f(h * 0.5)} ${f(w * 0.66)} ${f(h * 0.46)}Z`) +
            rrect(on ? 'hmi-label-on' : 'hmi-detail', w * 0.59, h * 0.6, w * 0.22, h * 0.12, 1) + box(0, h * 0.82, w, h * 0.08) + box(w * 0.08, h * 0.65, w * 0.08, h * 0.17)
    case 'wrapper': {
        const cy2 = L(h * 0.6, h * 0.32)
        return ellipse('hmi-body', w * 0.38, h * 0.9, w * 0.36, h * 0.07) + box(w * 0.1, h * 0.76, w * 0.56, h * 0.08) + box(w * 0.14, h * 0.3, w * 0.48, h * 0.46) +
            path('hmi-detail', line(w * 0.14, h * 0.45, w * 0.62, h * 0.45) + line(w * 0.14, h * 0.6, w * 0.62, h * 0.6) + line(w * 0.38, h * 0.3, w * 0.38, h * 0.76)) +
            box(w * 0.86, 0, w * 0.08, h * 0.95) + box(w * 0.8, h * 0.94, w * 0.2, h * 0.06) + rrect('hmi-body', w * 0.72, cy2, w * 0.14, h * 0.16, 3) + rrect('hmi-body', w * 0.68, cy2 + h * 0.02, w * 0.04, h * 0.12, 2) +
            path('hmi-strap hmi-thin', line(w * 0.68, cy2 + h * 0.08, w * 0.62, cy2 + h * 0.05))
    }
    case 'cardboard':
        return poly([[0, h * 0.25], [w * 0.75, h * 0.25], [w * 0.75, h], [0, h]]) + poly([[0, h * 0.25], [w * 0.25, 0], [w, 0], [w * 0.75, h * 0.25]]) + poly([[w * 0.75, h * 0.25], [w, 0], [w, h * 0.75], [w * 0.75, h]]) +
            path('hmi-detail', line(w * 0.375, h * 0.25, w * 0.625, 0) + line(w * 0.3, h * 0.25, w * 0.3, h * 0.55) + line(w * 0.45, h * 0.25, w * 0.45, h * 0.55))
    case 'bottle':
        return path('hmi-body', `M${f(w * 0.36)} ${f(h * 0.06)}H${f(w * 0.64)}V${f(h * 0.25)}Q${f(w)} ${f(h * 0.32)} ${f(w)} ${f(h * 0.45)}V${f(h)}H0V${f(h * 0.45)}Q0 ${f(h * 0.32)} ${f(w * 0.36)} ${f(h * 0.25)}Z`) +
            box(w * 0.32, 0, w * 0.36, h * 0.07) + rrect('hmi-detail', w * 0.08, h * 0.55, w * 0.84, h * 0.25, 1)
    case 'can':
        return path('hmi-body', `M0 ${f(h * 0.1)}V${f(h * 0.9)}A${f(w / 2)} ${f(h * 0.1)} 0 0 0 ${f(w)} ${f(h * 0.9)}V${f(h * 0.1)}Z`) + ellipse('hmi-body', cx, h * 0.1, w / 2, h * 0.1) + ellipse('hmi-detail', cx, h * 0.1, w * 0.4, h * 0.07) +
            path('hmi-detail', `M0 ${f(h * 0.22)}A${f(w / 2)} ${f(h * 0.08)} 0 0 0 ${f(w)} ${f(h * 0.22)}`)
    case 'pallet': {
        const tb = h * 0.22
        let boards = ''
        const n = Math.max(3, Math.round(w / 40))
        for (let i = 0; i <= n; i++) boards += line(w * i / n, 0, w * i / n, tb)
        return box(0, 0, w, tb) + path('hmi-detail', boards) + [0, 0.45, 0.9].map(k => box(w * k * (1 - 0.1 / 0.9), tb, w * 0.1, h * 0.5)).join('') + box(0, tb + h * 0.5, w, h - tb - h * 0.5)
    }
    }
    return null
}

export const MACHINE2_CSS = `
.hmi-root .hmi-frame .hmi-ind { fill: var(--hmi-tag-bg); stroke: var(--hmi-stroke); stroke-width: 1; }
.hmi-root .hmi-frame.hmi-on .hmi-ind { fill: var(--hmi-ok); }
.hmi-root .hmi-frame.hmi-on .hmi-ind.hmi-dome { fill: var(--hmi-warn); }
.hmi-root .hmi-frame .hmi-rays { fill: none; stroke: var(--hmi-warn); stroke-width: 3; stroke-linecap: round; }
.hmi-root .hmi-frame .hmi-act { fill: var(--hmi-equip-on); }
.hmi-root .hmi-frame .hmi-beam { fill: none; stroke: var(--hmi-info); stroke-width: 1.5; stroke-dasharray: 6 4; }
.hmi-root .hmi-frame .hmi-field { fill: var(--hmi-info); fill-opacity: .12; stroke: var(--hmi-info); stroke-width: 1; stroke-dasharray: 5 4; }
.hmi-root .hmi-frame .hmi-beam-cut { stroke: var(--hmi-alarm); fill-opacity: .18; }
.hmi-root .hmi-frame .hmi-field.hmi-beam-cut { fill: var(--hmi-alarm); }
.hmi-root .hmi-frame .hmi-yel { fill: #f2b705; stroke: #5f4a00; stroke-width: 1.5; }
.hmi-root .hmi-frame .hmi-red { fill: #d71920; stroke: #6d0b0f; stroke-width: 1.5; }
.hmi-root .hmi-frame .hmi-red-on { fill: #a50f15; }
.hmi-root .hmi-frame .hmi-red-ring { fill: none; stroke: #ff6a70; stroke-width: 1.5; opacity: .7; }
.hmi-root .hmi-frame .hmi-btn-g { fill: #2e9d4f; stroke: var(--hmi-stroke); stroke-width: 1.5; }
.hmi-root .hmi-frame .hmi-btn-r { fill: #d71920; stroke: var(--hmi-stroke); stroke-width: 1.5; }
.hmi-root .hmi-frame .hmi-bars { fill: var(--hmi-text); stroke: none; }
.hmi-root .hmi-frame .hmi-stream { fill: none; stroke: var(--hmi-level); stroke-linecap: round; opacity: 0; }
.hmi-root .hmi-frame.hmi-on .hmi-stream { opacity: 1; }
.hmi-root .hmi-frame .hmi-label-on { fill: var(--hmi-info); stroke: var(--hmi-stroke); stroke-width: 1; }
.hmi-root .hmi-frame.hmi-on .hmi-move { animation: hmi-belt .6s linear infinite; }
.hmi-root .hmi-frame.hmi-on .hmi-move-v { stroke-dasharray: 3 3; animation: hmi-belt .3s linear infinite; }
.hmi-root .hmi-frame.hmi-on .hmi-vib { animation: hmi-vib .12s linear infinite alternate; }
.hmi-root .hmi-frame.hmi-on.hmi-darken .hmi-body { fill: var(--hmi-equip-on); }
.hmi-root .hmi-frame .hmi-fill { fill: var(--hmi-level); opacity: .85; }
.hmi-root .hmi-frame .hmi-screen-on { fill: var(--hmi-info); fill-opacity: .35; }
.hmi-root .hmi-frame .hmi-air { stroke: var(--hmi-info); stroke-width: 2; stroke-dasharray: 3 3; }
.hmi-root .hmi-frame.hmi-ghost { opacity: .18; }
.hmi-root .hmi-frame.hmi-ghost .hmi-body { stroke-dasharray: 5 4; }
@keyframes hmi-vib { from { transform: translate(-1px, 0); } to { transform: translate(1px, .5px); } }
`
