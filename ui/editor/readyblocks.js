// Ready-made machine assemblies for the "Blocos" menu. They are built from the
// symbol library, so each part is an ordinary symbol after it is placed; keys
// carry {{tag}}, asked when the block is dropped (e.g. Y1, Y2 for two cylinders).
import { SYMBOLS, createSymbol } from '../symbols/index.js'

let n = 0
function sym (type, x, y, key, props, size) {
    const s = createSymbol(type, x, y)
    s.id = 'rb' + (++n)
    s.key = key || ''
    Object.assign(s.props, props || {})
    if (size) { s.w = size[0]; s.h = size[1] }
    return s
}
// a frame part by its shape, e.g. part('pneuCyl', 0, 0, '{{tag}}.avanca')
function part (shape, x, y, key, props, size) {
    const i = SYMBOLS.frame.variants.findIndex(v => v.props.shape === shape)
    const s = createSymbol('frame', x, y, i)
    s.id = 'rb' + (++n)
    s.key = key || ''
    Object.assign(s.props, props || {})
    if (size) { s.w = size[0]; s.h = size[1] }
    return s
}
const text = (x, y, t, w) => sym('text', x, y, '', { text: t, size: 14, bold: 'yes' }, [w || 200, 24])

export function readyBlocks () {
    n = 0
    return [
        {
            name: 'Cilindro com válvula e fins de curso',
            symbols: [
                text(0, 0, '{{tag}}', 260),
                part('limitSwitch', 10, 30, '{{tag}}.recuado', { label: 'Recuado' }, [50, 70]),
                part('limitSwitch', 200, 30, '{{tag}}.avancado', { label: 'Avançado' }, [50, 70]),
                part('pneuCyl', 0, 130, '{{tag}}.avancado', { motion: 'onoff' }, [260, 70]),
                part('valve52', 40, 230, '{{tag}}.solenoide', { label: 'Válvula {{tag}}' }, [180, 80])
            ]
        },
        {
            name: 'Esteira com sensor e desviador',
            symbols: [
                text(0, 0, '{{tag}}', 420),
                part('photoEye', 60, 40, '{{tag}}.sensor', {}, [200, 40]),
                sym('conveyor', 0, 90, '{{tag}}.motor', { label: '' }, [300, 50]),
                part('diverter', 290, 60, '{{tag}}.desvia', { label: 'Desvio' }, [140, 110]),
                sym('motor', 20, 160, '{{tag}}.motor', { label: 'Motor' }, [60, 60]),
                sym('counter', 120, 160, '{{tag}}.contagem', { kind: 'count', title: 'PEÇAS' }, [150, 60])
            ]
        },
        {
            name: 'Estação de envase',
            symbols: [
                text(0, 0, 'Envase {{tag}}', 640),
                part('filler', 0, 30, '{{tag}}.nivel', { motion: 'value', min: 0, max: 100, label: 'Enchedora' }, [260, 170]),
                part('capper', 280, 60, '{{tag}}.tampa', { label: 'Tampadora' }, [150, 140]),
                part('labeler', 450, 60, '{{tag}}.rotulo', { label: 'Rotuladora' }, [180, 140]),
                sym('conveyor', 0, 230, '{{tag}}.esteira', { label: '' }, [640, 40]),
                part('photoEye', 220, 280, '{{tag}}.garrafa', {}, [160, 30]),
                part('beacon', 600, 20, '{{tag}}.falha', {}, [36, 70]),
                sym('tag', 0, 330, '{{tag}}.nivel', { title: 'NÍVEL', unit: '%', decimals: 0 }, [140, 60]),
                sym('counter', 160, 330, '{{tag}}.garrafas', { kind: 'count', title: 'GARRAFAS' }, [160, 60])
            ]
        },
        {
            name: 'Prensa com cortina de luz e emergência',
            symbols: [
                text(0, 0, 'Prensa {{tag}}', 340),
                part('punch', 60, 30, '{{tag}}.desce', { label: 'Prensa' }, [200, 220]),
                part('lightCurtain', 0, 60, '{{tag}}.cortina', {}, [40, 160]),
                part('lightCurtain', 280, 60, '{{tag}}.cortina', {}, [40, 160]),
                part('estop', 0, 290, '{{tag}}.emergencia', { label: 'Emergência' }, [60, 60]),
                part('pushStation', 100, 280, '{{tag}}.ciclo', { label: 'Bimanual' }, [60, 80]),
                part('beacon', 220, 280, '{{tag}}.falha', {}, [36, 70])
            ]
        },
        {
            name: 'Bobinadeira com status e contadores',
            symbols: [
                text(0, 0, '{{tag}}', 150),
                sym('stateChip', 160, 0, '{{tag}}.estado', {}, [180, 34]),
                sym('winder', 10, 44, '{{tag}}.girando', {}, [320, 140]),
                sym('text', 0, 190, '', { text: 'operador {{{tag}}.operador:t} · {{{tag}}.projeto}', size: 13, align: 'start', tone: 'dim' }, [340, 18]),
                sym('tag', 0, 216, '{{tag}}.bobinas', { title: 'BOBINAS HOJE', decimals: 0 }, [106, 54]),
                sym('tag', 117, 216, '{{tag}}.ocupacao', { title: 'OCUPAÇÃO', unit: '%', decimals: 0 }, [106, 54]),
                sym('tag', 234, 216, '{{tag}}.ultima', { title: 'ÚLTIMA', decimals: 0 }, [106, 54]),
                sym('timeline', 0, 284, '{{tag}}.linha_tempo', { legend: 'no' }, [340, 52])
            ]
        },
        {
            name: 'Pórtico pega e coloca',
            symbols: [
                text(0, 0, 'Pórtico {{tag}}', 340),
                part('gantry', 0, 30, '{{tag}}.z', { motion: 'value', min: 0, max: 100, label: 'Eixo Z' }, [340, 220]),
                part('gripper', 110, 280, '{{tag}}.garra', { label: 'Garra' }, [80, 80]),
                sym('tag', 220, 280, '{{tag}}.z', { title: 'Z', unit: 'mm', decimals: 0 }, [120, 60]),
                part('servo', 0, 280, '{{tag}}.servo', { label: 'Servo' }, [100, 50])
            ]
        }
    ]
}
