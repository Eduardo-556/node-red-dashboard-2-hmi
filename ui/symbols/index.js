import { moreSymbols, MORE_CSS } from './more.js'

// Symbol library shared by the Node-RED editor (drag-and-drop preview) and the
// dashboard widget. Every symbol draws itself as SVG markup in its own box
// (0,0)-(w,h); the caller places the box on the canvas.

export const THEMES = {
    isa101: 'ISA-101',
    classic: 'Clássico'
}

const ON_FIELDS = [
    { key: 'onWhen', label: 'Ligado quando', type: 'select', options: [['nonzero', 'valor ≠ 0 / true'], ['gt', 'valor > limite']] },
    { key: 'threshold', label: 'Limite', type: 'number' },
    { key: 'invert', label: 'Inverter sinal', type: 'select', options: [['no', 'Não'], ['yes', 'Sim (lógica invertida / NF)']] }
]
const INVERT_FIELD = ON_FIELDS[2]
const COLOR_FIELD = { key: 'color', label: 'Cor quando ligado', type: 'select', options: [['auto', 'Do tema'], ['alarm', 'Alarme (vermelho)'], ['warn', 'Atenção (amarelo)'], ['info', 'Informação (azul)']] }
const BLINK_FIELD = { key: 'blink', label: 'Piscar quando ligado', type: 'select', options: [['no', 'Não'], ['yes', 'Sim']] }
// [shape, palette label, default w, default h, tone]
const SHAPES = [
    ['rect', 'Retângulo', 200, 140],
    ['round', 'Cantos redondos', 200, 140],
    ['chamfer', 'Chanfrado em cima', 240, 300],
    ['chamferAll', 'Chanfrado nos cantos', 200, 140],
    ['arcLeft', 'Curva à esquerda', 200, 200],
    ['arcRight', 'Curva à direita', 200, 200],
    ['archTop', 'Arco em cima', 160, 220],
    ['pill', 'Cápsula / tanque deitado', 260, 90],
    ['circle', 'Círculo / elipse', 140, 140],
    ['triangle', 'Triângulo', 160, 140],
    ['trapezoid', 'Trapézio', 220, 120],
    ['base', 'Base / pé', 260, 40],
    ['hopper', 'Funil', 160, 200],
    ['silo', 'Silo', 140, 260],
    ['hexagon', 'Hexágono', 180, 120],
    ['diamond', 'Losango', 120, 120],
    ['parallelogram', 'Paralelogramo', 200, 100],
    ['lShape', 'Em L', 200, 200],
    ['uShape', 'Em U', 240, 160],
    ['cabinet', 'Painel elétrico', 140, 220],
    ['rect', 'Proteção (tracejado)', 300, 200, 'guard'],
    ['rect', 'Fosso', 300, 80, 'pit'],
    ['chamfer', 'Corpo metal (slitter)', 240, 300, 'metal'],
    ['rect', 'Base aço (slitter)', 300, 60, 'steel'],
    ['rect', 'Fosso fundo (slitter)', 170, 140, 'pitDeep'],
    ['rect', 'Piso (slitter)', 600, 80, 'floor'],
    // structures: beams, supports and pedestals (palette category "Estruturas")
    ['beamSide', 'Viga (vista lateral)', 400, 30, '', 'Estruturas'],
    ['beamI', 'Viga I (perfil)', 80, 100, '', 'Estruturas'],
    ['channel', 'Perfil U (perfil)', 70, 100, '', 'Estruturas'],
    ['angle', 'Cantoneira (perfil)', 80, 80, '', 'Estruturas'],
    ['truss', 'Viga treliçada', 400, 60, '', 'Estruturas'],
    ['tube', 'Tubo / eixo', 300, 24, '', 'Estruturas'],
    ['column', 'Coluna com chapas', 40, 300, '', 'Estruturas'],
    ['pedestal', 'Pedestal', 120, 140, '', 'Estruturas'],
    ['bearing', 'Pedestal com mancal', 120, 160, '', 'Estruturas'],
    ['bracket', 'Mão-francesa', 120, 120, '', 'Estruturas'],
    ['aFrame', 'Cavalete', 200, 140, '', 'Estruturas'],
    ['stand', 'Suporte com pés', 240, 120, '', 'Estruturas'],
    ['basePlate', 'Chapa de base / sapata', 160, 24, '', 'Estruturas'],
    ['beamSide', 'Viga aço (slitter)', 400, 30, 'steel', 'Estruturas'],
    ['pedestal', 'Pedestal metal (slitter)', 120, 140, 'metal', 'Estruturas']
]
const TONES = [
    ['equip', 'Equipamento (tema)'], ['dark', 'Escuro (tema)'], ['pit', 'Fosso / vazio (tema)'], ['outline', 'Só contorno'], ['guard', 'Proteção (tracejado)'],
    ['metal', 'Metal (slitter)'], ['metalLight', 'Metal, borda clara (slitter)'], ['steel', 'Aço escuro (slitter)'], ['graphite', 'Grafite / rolo (slitter)'],
    ['pitDeep', 'Fosso fundo (slitter)'], ['wall', 'Parede (slitter)'], ['floor', 'Piso (slitter)'], ['floorDark', 'Piso escuro (slitter)'], ['sensorTone', 'Sensor (slitter)'],
    ['custom', 'Cor personalizada']
]
// fixed colours taken from the OP1475 slitter screen; [fill or gradient top..bottom, stroke]
const TONE_COLORS = {
    metal: [['#6a737d', '#4d555e'], '#8a939d'],
    metalLight: [['#6a737d', '#4d555e'], '#b5bfc8'],
    steel: ['#3a4148', '#7a838c'],
    graphite: ['#2f353b', '#a5b0ba'],
    pitDeep: [['#1d2126', '#15181b'], '#3a4148'],
    wall: ['#3a4148', '#5a626b'],
    floor: ['#24282e', 'none'],
    floorDark: ['#1f2328', 'none'],
    sensorTone: ['#59616b', '#8a939d']
}
const HEX = /^#[0-9a-fA-F]{3,8}$/
const FAULT_FIELD = { key: 'faultKey', label: 'Chave da falha (opcional)', type: 'text' }
const PRIORITY_FIELD = { key: 'priority', label: 'Prioridade do alarme', type: 'select', options: [['1', '1 (alta)'], ['2', '2 (média)'], ['3', '3 (baixa)']] }

const SCALE_FIELDS = [
    { key: 'title', label: 'Título', type: 'text' },
    { key: 'unit', label: 'Unidade', type: 'text' },
    { key: 'decimals', label: 'Casas decimais', type: 'number' },
    { key: 'min', label: 'Mínimo da escala', type: 'number' },
    { key: 'max', label: 'Máximo da escala', type: 'number' },
    { key: 'lo', label: 'Alarme abaixo de', type: 'number' },
    { key: 'hi', label: 'Alarme acima de', type: 'number' },
    PRIORITY_FIELD
]

export const SYMBOLS = {
    reel: {
        label: 'Bobina',
        group: 'Equipamentos',
        w: 160,
        h: 160,
        preview: 1450,
        defaults: { label: '', onWhen: 'nonzero', threshold: 0 },
        fields: [{ key: 'label', label: 'Legenda', type: 'text' }, ...ON_FIELDS],
        render: renderReel
    },
    roller: {
        label: 'Rolo',
        group: 'Equipamentos',
        w: 24,
        h: 24,
        preview: 1,
        defaults: { onWhen: 'nonzero', threshold: 0, dir: 'cw' },
        fields: [...ON_FIELDS, { key: 'dir', label: 'Sentido', type: 'select', options: [['cw', 'Horário'], ['ccw', 'Anti-horário']] }],
        render: renderRoller
    },
    motor: {
        label: 'Motor',
        group: 'Equipamentos',
        w: 70,
        h: 70,
        preview: 1,
        defaults: { label: '', onWhen: 'nonzero', threshold: 0, faultKey: '', priority: '1' },
        fields: [{ key: 'label', label: 'Legenda', type: 'text' }, ...ON_FIELDS, { key: 'faultKey', label: 'Chave da falha (opcional)', type: 'text' }, PRIORITY_FIELD],
        render: renderMotor
    },
    valve: {
        label: 'Válvula',
        group: 'Equipamentos',
        w: 60,
        h: 50,
        preview: 1,
        defaults: { label: '', onWhen: 'nonzero', threshold: 0, faultKey: '', priority: '1' },
        fields: [{ key: 'label', label: 'Legenda', type: 'text' }, ...ON_FIELDS, { key: 'faultKey', label: 'Chave da falha (opcional)', type: 'text' }, PRIORITY_FIELD],
        render: renderValve
    },
    pump: {
        label: 'Bomba',
        group: 'Equipamentos',
        w: 60,
        h: 60,
        preview: 1,
        defaults: { label: '', onWhen: 'nonzero', threshold: 0, faultKey: '', priority: '1' },
        fields: [{ key: 'label', label: 'Legenda', type: 'text' }, ...ON_FIELDS, { key: 'faultKey', label: 'Chave da falha (opcional)', type: 'text' }, PRIORITY_FIELD],
        render: renderPump
    },
    tank: {
        label: 'Tanque',
        group: 'Equipamentos',
        w: 100,
        h: 160,
        preview: 65,
        defaults: { label: '', unit: '%', decimals: 0, min: 0, max: 100, lo: '', hi: '', priority: '2' },
        fields: [
            { key: 'label', label: 'Legenda', type: 'text' },
            { key: 'unit', label: 'Unidade', type: 'text' },
            { key: 'decimals', label: 'Casas decimais', type: 'number' },
            { key: 'min', label: 'Vazio (mín.)', type: 'number' },
            { key: 'max', label: 'Cheio (máx.)', type: 'number' },
            { key: 'lo', label: 'Alarme abaixo de', type: 'number' },
            { key: 'hi', label: 'Alarme acima de', type: 'number' },
            PRIORITY_FIELD
        ],
        render: renderTank
    },
    frame: {
        label: 'Corpo',
        group: 'Formas',
        w: 240,
        h: 300,
        preview: undefined,
        defaults: { shape: 'chamfer', tone: 'equip', label: '' },
        fields: [
            { key: 'shape', label: 'Forma', type: 'select', options: SHAPES.filter(([k], i) => SHAPES.findIndex(x => x[0] === k) === i).map(([k, l]) => [k, l]) },
            { key: 'tone', label: 'Tom', type: 'select', options: TONES, refresh: true },
            { key: 'fill', label: 'Cor de preenchimento', type: 'color', when: p => p.tone === 'custom' },
            { key: 'stroke', label: 'Cor da borda', type: 'color', when: p => p.tone === 'custom' },
            { key: 'label', label: 'Legenda', type: 'text' }
        ],
        variants: SHAPES.map(([shape, label, w, h, tone, group]) => ({ label, w, h, category: group, props: { shape, tone: tone || 'equip' } })),
        render: renderFrame
    },
    line: {
        label: 'Linha',
        group: 'Linhas',
        variants: [
            { label: 'Material / chapa', props: { style: 'strip' } },
            { label: 'Tubulação', props: { style: 'pipe' } },
            { label: 'Esteira', props: { style: 'conveyor' } },
            { label: 'Sinal / ligação', props: { style: 'signal' } }
        ],
        w: 200,
        h: 1,
        preview: 1,
        line: true,
        defaults: { style: 'strip', onWhen: 'nonzero', threshold: 0, flow: 'auto', points: [[0, 0], [200, 0]] },
        fields: [
            { key: 'style', label: 'Tipo', type: 'select', options: [['strip', 'Chapa / material'], ['pipe', 'Tubulação'], ['conveyor', 'Esteira'], ['signal', 'Sinal / ligação']] },
            ...ON_FIELDS,
            { key: 'flow', label: 'Animar fluxo', type: 'select', options: [['auto', 'Só no tema Clássico'], ['always', 'Sempre'], ['never', 'Nunca']] }
        ],
        render: renderLine
    },
    tag: {
        label: 'Tag',
        group: 'Valores',
        w: 160,
        h: 64,
        preview: 42.5,
        defaults: { title: 'TAG', unit: '', decimals: 1, min: '', max: '', lo: '', hi: '', priority: '2' },
        fields: [
            { key: 'title', label: 'Título', type: 'text' },
            { key: 'unit', label: 'Unidade', type: 'text' },
            { key: 'decimals', label: 'Casas decimais', type: 'number' },
            { key: 'min', label: 'Escala mín.', type: 'number' },
            { key: 'max', label: 'Escala máx.', type: 'number' },
            { key: 'lo', label: 'Normal de', type: 'number' },
            { key: 'hi', label: 'Normal até', type: 'number' },
            PRIORITY_FIELD
        ],
        render: renderTag
    },
    kpi: {
        label: 'KPI',
        group: 'Valores',
        w: 300,
        h: 140,
        preview: 7,
        defaults: { title: 'BOBINAS PRONTAS', unit: '', decimals: 0, subtitle: '' },
        fields: [
            { key: 'title', label: 'Título', type: 'text' },
            { key: 'unit', label: 'Unidade', type: 'text' },
            { key: 'decimals', label: 'Casas decimais', type: 'number' },
            { key: 'subtitle', label: 'Subtítulo', type: 'text' }
        ],
        render: renderKpi
    },
    text: {
        label: 'Texto',
        group: 'Valores',
        w: 220,
        h: 30,
        preview: undefined,
        defaults: { text: 'Texto', size: 16, align: 'middle', bold: 'no', tone: 'normal', unit: '', decimals: '' },
        fields: [
            { key: 'text', label: 'Texto (antes do valor, se tiver chave)', type: 'text' },
            { key: 'size', label: 'Tamanho', type: 'number' },
            { key: 'align', label: 'Alinhamento', type: 'select', options: [['start', 'Esquerda'], ['middle', 'Centro'], ['end', 'Direita']] },
            { key: 'bold', label: 'Negrito', type: 'select', options: [['no', 'Não'], ['yes', 'Sim']] },
            { key: 'tone', label: 'Cor', type: 'select', options: [['normal', 'Normal'], ['dim', 'Discreta']] },
            { key: 'unit', label: 'Unidade', type: 'text' },
            { key: 'decimals', label: 'Casas decimais', type: 'number' }
        ],
        render: renderText
    },
    led: {
        label: 'LED',
        group: 'Estados',
        w: 28,
        h: 28,
        preview: true,
        defaults: { label: '', onWhen: 'nonzero', threshold: 0, color: 'auto', blink: 'no' },
        fields: [{ key: 'label', label: 'Legenda', type: 'text' }, ...ON_FIELDS, COLOR_FIELD, BLINK_FIELD],
        render: renderLed
    },
    chip: {
        label: 'Status',
        group: 'Estados',
        w: 180,
        h: 34,
        preview: true,
        defaults: { textOn: 'LIGADO', textOff: 'DESLIGADO', onWhen: 'nonzero', threshold: 0, color: 'auto', blink: 'no' },
        fields: [{ key: 'textOn', label: 'Texto ligado', type: 'text' }, { key: 'textOff', label: 'Texto desligado', type: 'text' }, ...ON_FIELDS, COLOR_FIELD, BLINK_FIELD],
        render: renderChip
    },
    alarm: {
        label: 'Alarme',
        group: 'Estados',
        w: 600,
        h: 96,
        preview: true,
        defaults: { text: 'EMERGÊNCIA ACIONADA', sub: '', onWhen: 'nonzero', threshold: 0, priority: '1', blink: 'yes' },
        fields: [{ key: 'text', label: 'Texto', type: 'text' }, { key: 'sub', label: 'Texto menor', type: 'text' }, ...ON_FIELDS, PRIORITY_FIELD, BLINK_FIELD],
        render: renderAlarm
    },
    button: {
        label: 'Botão',
        group: 'Comandos',
        w: 140,
        h: 44,
        preview: 0,
        defaults: { text: 'LIGAR', textOn: '', onWhen: 'nonzero', threshold: 0 },
        action: { mode: 'pulse', value: '', topic: '', confirm: 'no' },
        fields: [
            { key: 'text', label: 'Texto', type: 'text' },
            { key: 'textOn', label: 'Texto quando ligado (opcional)', type: 'text' },
            ...ON_FIELDS
        ],
        render: renderButton
    },
    image: {
        label: 'Imagem (SVG / PNG)',
        group: 'Formas',
        w: 160,
        h: 120,
        preview: undefined,
        image: true,
        defaults: { src: '', srcOn: '', fit: 'meet', onWhen: 'nonzero', threshold: 0, label: '' },
        fields: [
            { key: 'fit', label: 'Ajuste', type: 'select', options: [['meet', 'Caber inteira'], ['slice', 'Preencher (corta)'], ['stretch', 'Esticar']] },
            { key: 'label', label: 'Legenda', type: 'text' },
            ...ON_FIELDS
        ],
        render: renderImage
    },
    conveyor: {
        label: 'Esteira',
        group: 'Equipamentos',
        w: 240,
        h: 50,
        preview: 1,
        defaults: { label: '', onWhen: 'nonzero', threshold: 0, dir: 'fwd', faultKey: '', priority: '1' },
        fields: [{ key: 'label', label: 'Legenda', type: 'text' }, ...ON_FIELDS, { key: 'dir', label: 'Sentido', type: 'select', options: [['fwd', 'Para a direita'], ['rev', 'Para a esquerda']] }, FAULT_FIELD, PRIORITY_FIELD],
        render: renderConveyor
    },
    cylinder: {
        label: 'Cilindro',
        group: 'Equipamentos',
        w: 160,
        h: 40,
        preview: 1,
        defaults: { label: '', onWhen: 'nonzero', threshold: 0 },
        fields: [{ key: 'label', label: 'Legenda', type: 'text' }, { key: 'onWhen', label: 'Avançado quando', type: 'select', options: ON_FIELDS[0].options }, ON_FIELDS[1], INVERT_FIELD],
        render: renderCylinder
    },
    fan: {
        label: 'Ventilador',
        group: 'Equipamentos',
        w: 70,
        h: 70,
        preview: 1,
        defaults: { label: '', onWhen: 'nonzero', threshold: 0, faultKey: '', priority: '1' },
        fields: [{ key: 'label', label: 'Legenda', type: 'text' }, ...ON_FIELDS, FAULT_FIELD, PRIORITY_FIELD],
        render: renderFan
    },
    knife: {
        label: 'Faca circular',
        group: 'Equipamentos',
        w: 60,
        h: 60,
        preview: 1,
        defaults: { label: '', onWhen: 'nonzero', threshold: 0 },
        fields: [{ key: 'label', label: 'Legenda', type: 'text' }, ...ON_FIELDS],
        render: renderKnife
    },
    heater: {
        label: 'Resistência',
        group: 'Equipamentos',
        w: 90,
        h: 44,
        preview: 1,
        defaults: { label: '', onWhen: 'nonzero', threshold: 0, faultKey: '', priority: '1' },
        fields: [{ key: 'label', label: 'Legenda', type: 'text' }, ...ON_FIELDS, FAULT_FIELD, PRIORITY_FIELD],
        render: renderHeater
    },
    sensor: {
        label: 'Sensor',
        group: 'Equipamentos',
        w: 44,
        h: 44,
        preview: 1,
        defaults: { label: '', kind: 'photo', onWhen: 'nonzero', threshold: 0 },
        fields: [{ key: 'label', label: 'Legenda', type: 'text' }, { key: 'kind', label: 'Tipo', type: 'select', options: [['photo', 'Fotoelétrico'], ['prox', 'Indutivo / proximidade'], ['limit', 'Fim de curso']] }, { key: 'onWhen', label: 'Detectando quando', type: 'select', options: ON_FIELDS[0].options }, ON_FIELDS[1], { ...INVERT_FIELD, label: 'Inverter sinal (sensor NF)' }],
        render: renderSensor
    },
    gauge: {
        label: 'Medidor',
        group: 'Valores',
        w: 150,
        h: 120,
        preview: 62,
        defaults: { title: 'PRESSÃO', unit: 'bar', decimals: 1, min: 0, max: 100, lo: '', hi: 85, priority: '2' },
        fields: SCALE_FIELDS,
        render: renderGauge
    },
    bar: {
        label: 'Barra',
        group: 'Valores',
        w: 60,
        h: 180,
        preview: 62,
        defaults: { title: 'NÍVEL', unit: '%', decimals: 0, min: 0, max: 100, lo: '', hi: '', priority: '2' },
        fields: SCALE_FIELDS,
        render: renderBar
    },
    trend: {
        label: 'Tendência',
        group: 'Valores',
        w: 300,
        h: 120,
        preview: 42,
        defaults: { title: 'VELOCIDADE', unit: 'm/min', decimals: 1, min: '', max: '', window: 60 },
        fields: [
            { key: 'title', label: 'Título', type: 'text' },
            { key: 'unit', label: 'Unidade', type: 'text' },
            { key: 'decimals', label: 'Casas decimais', type: 'number' },
            { key: 'min', label: 'Mínimo (vazio = automático)', type: 'number' },
            { key: 'max', label: 'Máximo (vazio = automático)', type: 'number' },
            { key: 'window', label: 'Janela (segundos)', type: 'number' }
        ],
        render: renderTrend
    },
    stack: {
        label: 'Torre de sinalização',
        group: 'Estados',
        w: 36,
        h: 130,
        preview: undefined,
        defaults: { label: '', keyRed: '', keyYellow: '', keyGreen: '', keyBlue: '', blink: 'no' },
        fields: [
            { key: 'label', label: 'Legenda', type: 'text' },
            { key: 'keyRed', label: 'Chave vermelho', type: 'text' },
            { key: 'keyYellow', label: 'Chave amarelo', type: 'text' },
            { key: 'keyGreen', label: 'Chave verde', type: 'text' },
            { key: 'keyBlue', label: 'Chave azul (opcional)', type: 'text' },
            BLINK_FIELD
        ],
        render: renderStack
    },
    switch: {
        label: 'Chave seletora',
        group: 'Comandos',
        w: 110,
        h: 44,
        preview: 1,
        defaults: { textOn: 'AUTO', textOff: 'MANUAL', onWhen: 'nonzero', threshold: 0 },
        action: { mode: 'toggle', value: '', topic: '', confirm: 'no' },
        fields: [{ key: 'textOff', label: 'Texto desligado', type: 'text' }, { key: 'textOn', label: 'Texto ligado', type: 'text' }, ...ON_FIELDS],
        render: renderSwitch
    },
    setpoint: {
        label: 'Ajuste (setpoint)',
        group: 'Comandos',
        w: 170,
        h: 64,
        preview: 120,
        defaults: { title: 'VELOCIDADE ALVO', unit: 'm/min', decimals: 0 },
        action: { mode: 'input', value: '', topic: '', confirm: 'no', min: '', max: '' },
        fields: [{ key: 'title', label: 'Título', type: 'text' }, { key: 'unit', label: 'Unidade', type: 'text' }, { key: 'decimals', label: 'Casas decimais', type: 'number' }],
        render: renderSetpoint
    }
}

// Palette: categories in the order they appear in the editor. Symbols with
// variants show one entry per variant (e.g. every frame shape).
export const CATEGORIES = ['Formas', 'Estruturas', 'Equipamentos', 'Processo', 'Fábrica', 'Elétrica', 'Linhas', 'Valores', 'Estados', 'Comandos']
export function paletteItems (category) {
    const out = []
    for (const [type, def] of Object.entries(SYMBOLS)) {
        if (def.variants) def.variants.forEach((v, i) => { if ((v.category || def.group) === category) out.push({ type, variant: i, label: v.label }) })
        else if (def.group === category) out.push({ type, variant: -1, label: def.label })
    }
    return out
}

let counter = 0
export function createSymbol (type, x, y, variant) {
    const def = SYMBOLS[type]
    if (!def) throw new Error('Unknown symbol type: ' + type)
    const v = def.variants && variant >= 0 ? def.variants[variant] : null
    counter = (counter + 1) % 1e6
    return {
        id: 's' + Date.now().toString(36) + counter.toString(36),
        type,
        x: Math.round(x),
        y: Math.round(y),
        w: (v && v.w) || def.w,
        h: (v && v.h) || def.h,
        rot: 0,
        key: '',
        props: { ...JSON.parse(JSON.stringify(def.defaults)), ...(v && v.props ? JSON.parse(JSON.stringify(v.props)) : {}) },
        ...(def.action ? { action: { ...def.action } } : {})
    }
}

// Value the symbol shows: from the values object by key, or the editor preview.
export function valueFor (sym, values) {
    if (!values || !sym.key) return undefined
    return scaleValue(sym, values[sym.key])
}

// Optional per-symbol scaling of numeric values: shown = raw * factor + offset
function scaleOf2 (sym) {
    const sc = sym && sym.scale
    if (!sc) return null
    const k = num(sc.factor)
    const o = num(sc.offset)
    const d = num(sc.divisor)
    const factor = (k === null ? 1 : k) / (d === null || d === 0 ? 1 : d)
    const offset = o === null ? 0 : o
    return factor === 1 && offset === 0 ? null : { factor, offset }
}
const tidy = n => Math.round(n * 1e9) / 1e9
export function scaleValue (sym, raw) {
    const sc = scaleOf2(sym)
    if (!sc || typeof raw === 'boolean') return raw
    const n = num(raw)
    return n === null ? raw : tidy(n * sc.factor + sc.offset)
}
export function unscaleValue (sym, shown) {
    const sc = scaleOf2(sym)
    if (!sc || sc.factor === 0) return shown
    return tidy((shown - sc.offset) / sc.factor)
}

// Rules: change how any symbol looks from a value, e.g. hide it or paint it red.
export const RULE_OPS = [['on', 'ligado (≠ 0 / true)'], ['off', 'desligado (0 / false)'], ['eq', 'igual a'], ['ne', 'diferente de'], ['gt', 'maior que'], ['lt', 'menor que']]
export const RULE_EFFECTS = [['alarm', 'Vermelho (alarme)'], ['warn', 'Amarelo (atenção)'], ['info', 'Azul'], ['ok', 'Verde'], ['dim', 'Apagado'], ['blink', 'Piscar'], ['hide', 'Esconder']]
export function ruleMatch (rule, values, sym) {
    const key = rule.key || sym.key
    const v = key && values ? values[key] : undefined
    if (v === undefined || v === null) return false
    const a = num(v)
    const b = num(rule.value)
    switch (rule.op) {
    case 'off': return isOn(v, 'nonzero') === false
    case 'eq':
    case 'ne': {
        const eq = a !== null && b !== null ? a === b : String(v) === String(rule.value === undefined ? '' : rule.value)
        return rule.op === 'eq' ? eq : !eq
    }
    case 'gt': return a !== null && b !== null && a > b
    case 'lt': return a !== null && b !== null && a < b
    default: return isOn(v, 'nonzero') === true
    }
}
export function ruleEffects (sym, values) {
    const out = { hide: false, classes: [] }
    for (const r of Array.isArray(sym.rules) ? sym.rules : []) {
        if (!r || !ruleMatch(r, values, sym)) continue
        if (r.effect === 'hide') out.hide = true
        else if (RULE_EFFECTS.some(e => e[0] === r.effect) && !out.classes.includes('hmi-rule-' + r.effect)) out.classes.push('hmi-rule-' + r.effect)
    }
    return out
}

export function isOn (value, rule, threshold) {
    if (value === undefined || value === null || value === '') return null
    if (rule === 'gt') return Number(value) > Number(threshold)
    if (typeof value === 'boolean') return value
    if (typeof value === 'string' && isNaN(Number(value))) return value.length > 0
    return Number(value) !== 0
}

// on/off state of a symbol from its props; "invert" flips it (NC contacts, active-low inputs)
export function onState (value, p) {
    const on = isOn(value, p && p.onWhen, p && p.threshold)
    return on !== null && p && p.invert === 'yes' ? !on : on
}

export function formatValue (value, decimals, locale) {
    if (value === undefined || value === null || value === '') return '—'
    if (typeof value === 'boolean') return value ? 'ON' : 'OFF'
    const n = typeof value === 'number' ? value : (typeof value === 'string' && value.trim() !== '' ? Number(value) : NaN)
    if (!isFinite(n)) return String(value)
    const d = decimals === '' || decimals === undefined || decimals === null ? undefined : Math.max(0, Math.min(10, Number(decimals) || 0))
    try {
        return n.toLocaleString(locale || 'pt-BR', d === undefined ? undefined : { minimumFractionDigits: d, maximumFractionDigits: d })
    } catch (e) {
        return d === undefined ? String(n) : n.toFixed(d)
    }
}

const num = v => (v === '' || v === undefined || v === null || !isFinite(Number(v))) ? null : Number(v)

// 'alarm' when the value is outside the normal range, 'normal' inside it, null when unknown.
export function rangeState (value, lo, hi) {
    const v = num(value)
    if (v === null) return null
    const l = num(lo)
    const h = num(hi)
    if (l !== null && v < l) return 'alarm'
    if (h !== null && v > h) return 'alarm'
    return 'normal'
}

export function escapeXml (s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

const f = n => Math.round(n * 100) / 100

// ISA-101 alarm indicator: shape and number change with priority, colour is not the only cue.
export function alarmIndicator (cx, cy, priority) {
    const p = String(priority || '2')
    const s = 9
    let shape
    if (p === '1') shape = `<rect x="${f(cx - s)}" y="${f(cy - s)}" width="${2 * s}" height="${2 * s}"/>`
    else if (p === '3') shape = `<polygon points="${f(cx)},${f(cy - s - 2)} ${f(cx + s + 2)},${f(cy)} ${f(cx)},${f(cy + s + 2)} ${f(cx - s - 2)},${f(cy)}"/>`
    else shape = `<polygon points="${f(cx - s - 1)},${f(cy - s + 1)} ${f(cx + s + 1)},${f(cy - s + 1)} ${f(cx)},${f(cy + s + 3)}"/>`
    return `<g class="hmi-alarm-ind hmi-p${escapeXml(p)}">${shape}<text x="${f(cx)}" y="${f(cy + (p === '2' ? -1 : 0.5))}">${escapeXml(p)}</text></g>`
}

function renderReel (sym, value) {
    const p = sym.props || {}
    const w = sym.w
    const h = sym.h
    const cx = w / 2
    const cy = h / 2
    const r = Math.max(4, Math.min(w, h) / 2 - 2)
    const cls = stateClass(onState(value, p))
    // the spinning part is drawn around 0,0 and moved to the centre, so it turns on its own axis
    const spokes = [-90, 30, 150].map(a => {
        const rad = a * Math.PI / 180
        return `<line x1="${f(Math.cos(rad) * r * 0.32)}" y1="${f(Math.sin(rad) * r * 0.32)}" x2="${f(Math.cos(rad) * r * 0.9)}" y2="${f(Math.sin(rad) * r * 0.9)}"/>`
    }).join('')
    const label = labelBelow(p, w, h)
    return `<g class="hmi-reel ${cls}">` +
        `<circle class="hmi-body" cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}"/>` +
        `<g transform="translate(${f(cx)},${f(cy)})"><g class="hmi-spin"><circle class="hmi-ring" r="${f(r * 0.78)}"/>` +
        `<circle class="hmi-ring" r="${f(r * 0.58)}"/>` +
        `<g class="hmi-spokes">${spokes}</g>` +
        `<circle class="hmi-hub" r="${f(r * 0.3)}"/></g></g>` +
        `<circle class="hmi-axle" cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.09)}"/>` +
        label + '</g>'
}

const stateClass = on => on === null ? 'hmi-unknown' : (on ? 'hmi-on' : 'hmi-off')
const colorClass = p => 'hmi-c-' + (['alarm', 'warn', 'info'].includes(p.color) ? p.color : 'auto')
const blinkClass = (p, on) => (on && p.blink === 'yes') ? ' hmi-blink' : ''
const labelBelow = (p, w, h) => p.label ? `<text class="hmi-label" x="${f(w / 2)}" y="${f(h + 18)}">${escapeXml(p.label)}</text>` : ''

function renderRoller (sym, value) {
    const p = sym.props || {}
    const cx = sym.w / 2
    const cy = sym.h / 2
    const r = Math.max(3, Math.min(sym.w, sym.h) / 2 - 1)
    const on = onState(value, p)
    return `<g class="hmi-roller ${stateClass(on)} hmi-${p.dir === 'ccw' ? 'ccw' : 'cw'}"><g transform="translate(${f(cx)},${f(cy)})"><g class="hmi-spin">` +
        `<circle class="hmi-body" r="${f(r)}"/>` +
        `<line class="hmi-mark" x1="0" y1="${f(-r * 0.7)}" x2="0" y2="${f(r * 0.7)}"/></g></g></g>`
}

function renderMotor (sym, value, opts) {
    const p = sym.props || {}
    const w = sym.w
    const h = sym.h
    const r = Math.max(6, Math.min(w, h * 0.86) / 2 - 2)
    const cx = w / 2
    const cy = r + 2
    const on = onState(value, p)
    const fault = faultOf(p, opts)
    let out = `<g class="hmi-motor ${stateClass(on)}${fault ? ' hmi-fault' : ''}">` +
        `<rect class="hmi-foot" x="${f(cx - r * 0.8)}" y="${f(cy + r - 2)}" width="${f(r * 1.6)}" height="${f(Math.max(4, h - cy - r + 2))}" rx="2"/>` +
        `<circle class="hmi-body" cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}"/>` +
        `<text class="hmi-motor-m" x="${f(cx)}" y="${f(cy)}" font-size="${f(r * 0.9)}">M</text>`
    if (fault) out += alarmIndicator(w - 4, 6, p.priority)
    return out + labelBelow(p, w, h) + '</g>'
}

// fault from a second key, shared by motor, valve and pump
function faultOf (p, opts) {
    return p.faultKey && opts.values ? isOn(opts.values[p.faultKey], 'nonzero') === true : false
}

function renderValve (sym, value, opts) {
    const p = sym.props || {}
    const w = sym.w
    const h = sym.h
    const on = onState(value, p)
    const fault = faultOf(p, opts)
    const top = h * 0.36
    const cy = (top + h - 1) / 2
    const cx = w / 2
    const a = Math.min(w * 0.22, top * 0.9)
    let out = `<g class="hmi-valve ${stateClass(on)}${fault ? ' hmi-fault' : ''}">` +
        `<line class="hmi-stem" x1="${f(cx)}" y1="${f(cy)}" x2="${f(cx)}" y2="${f(top * 0.55)}"/>` +
        `<path class="hmi-actuator" d="M${f(cx - a)} ${f(top * 0.55)}A${f(a)} ${f(a)} 0 0 1 ${f(cx + a)} ${f(top * 0.55)}Z"/>` +
        `<path class="hmi-body" d="M1.5 ${f(top)}L${f(cx)} ${f(cy)}L1.5 ${f(h - 1)}ZM${f(w - 1.5)} ${f(top)}L${f(cx)} ${f(cy)}L${f(w - 1.5)} ${f(h - 1)}Z"/>`
    if (fault) out += alarmIndicator(w - 4, 6, p.priority)
    return out + labelBelow(p, w, h) + '</g>'
}

function renderPump (sym, value, opts) {
    const p = sym.props || {}
    const w = sym.w
    const h = sym.h
    const on = onState(value, p)
    const fault = faultOf(p, opts)
    const r = Math.max(6, Math.min(w, h * 0.9) / 2 - 2)
    const cx = w / 2
    const cy = r + 2
    const t = r * 0.55
    let out = `<g class="hmi-pump ${stateClass(on)}${fault ? ' hmi-fault' : ''}">` +
        `<path class="hmi-foot" d="M${f(cx - r * 0.75)} ${f(h - 1)}L${f(cx - r * 0.45)} ${f(cy + r * 0.7)}H${f(cx + r * 0.45)}L${f(cx + r * 0.75)} ${f(h - 1)}Z"/>` +
        `<circle class="hmi-body" cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}"/>` +
        `<path class="hmi-pump-arrow" d="M${f(cx - t * 0.6)} ${f(cy - t)}L${f(cx + t)} ${f(cy)}L${f(cx - t * 0.6)} ${f(cy + t)}Z"/>`
    if (fault) out += alarmIndicator(w - 4, 6, p.priority)
    return out + labelBelow(p, w, h) + '</g>'
}

function renderTank (sym, value, opts) {
    const p = sym.props || {}
    const w = sym.w
    const h = sym.h
    const v = num(value)
    let min = num(p.min)
    let max = num(p.max)
    if (min === null) min = 0
    if (max === null || max <= min) max = min + 100
    const state = rangeState(value, p.lo, p.hi)
    const cls = state === null ? 'hmi-unknown' : (state === 'alarm' ? 'hmi-alarm' : 'hmi-normal')
    const rx = Math.min(w * 0.18, 20)
    const pad = 5
    const inner = h - pad * 2
    const level = v === null ? 0 : Math.max(0, Math.min(1, (v - min) / (max - min)))
    const lh = inner * level
    const text = v === null ? '—' : formatValue(v, p.decimals, opts.locale) + (p.unit ? ' ' + p.unit : '')
    let out = `<g class="hmi-tank ${cls}">` +
        `<rect class="hmi-body" x="1" y="1" width="${f(w - 2)}" height="${f(h - 2)}" rx="${f(rx)}"/>` +
        (lh > 0 ? `<rect class="hmi-level" x="${pad}" y="${f(pad + inner - lh)}" width="${f(w - pad * 2)}" height="${f(lh)}" rx="${f(Math.max(0, Math.min(rx - pad, lh / 2)))}"/>` : '') +
        `<rect class="hmi-tank-tag" x="${f(w * 0.12)}" y="${f(h / 2 - 13)}" width="${f(w * 0.76)}" height="26" rx="3"/>` +
        `<text class="hmi-tank-value" x="${f(w / 2)}" y="${f(h / 2)}" font-size="${f(Math.max(10, Math.min(16, w * 0.15)))}">${escapeXml(text)}</text>`
    if (state === 'alarm') out += alarmIndicator(w - 6, 8, p.priority)
    return out + labelBelow(p, w, h) + '</g>'
}

function renderButton (sym, value, opts) {
    const p = sym.props || {}
    const w = sym.w
    const h = sym.h
    const on = onState(value, p)
    const text = on && p.textOn ? p.textOn : (p.text || '')
    return `<g class="hmi-button ${stateClass(on)}">` +
        `<rect class="hmi-button-box" x="1" y="1" width="${f(w - 2)}" height="${f(h - 2)}" rx="6"/>` +
        `<text class="hmi-button-text" x="${f(w / 2)}" y="${f(h / 2)}" font-size="${f(Math.max(10, Math.min(h * 0.38, w / Math.max(4, text.length) * 1.5)))}">${escapeXml(text)}</text></g>`
}

function poly (pts) {
    return `<polygon class="hmi-body" points="${pts.map(p => f(p[0]) + ',' + f(p[1])).join(' ')}"/>`
}

function box (x, y, w, h) {
    return `<rect class="hmi-body" x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}"/>`
}

// a straight bar of thickness t from (x1,y1) to (x2,y2): struts, legs, braces
function strut (x1, y1, x2, y2, t) {
    const len = Math.hypot(x2 - x1, y2 - y1) || 1
    const nx = -(y2 - y1) / len * t / 2
    const ny = (x2 - x1) / len * t / 2
    return poly([[x1 + nx, y1 + ny], [x2 + nx, y2 + ny], [x2 - nx, y2 - ny], [x1 - nx, y1 - ny]])
}

function bolts (y, w, r, n) {
    let out = ''
    for (let i = 0; i < n; i++) out += `<circle class="hmi-detail" cx="${f(w * (i + 0.5) / n)}" cy="${f(y)}" r="${f(r)}"/>`
    return out
}

// beams, supports and pedestals; horizontal by default, rotate for other positions
function structurePath (shape, w, h) {
    const m = Math.min(w, h)
    switch (shape) {
    case 'beamSide': return box(0, 0, w, h) + `<path class="hmi-detail" d="M0 ${f(h * 0.2)}H${f(w)}M0 ${f(h * 0.8)}H${f(w)}"/>`
    case 'beamI': {
        const tf = h * 0.14
        const tw = w * 0.16
        return poly([[0, 0], [w, 0], [w, tf], [(w + tw) / 2, tf], [(w + tw) / 2, h - tf], [w, h - tf], [w, h], [0, h], [0, h - tf], [(w - tw) / 2, h - tf], [(w - tw) / 2, tf], [0, tf]])
    }
    case 'channel': {
        const tf = h * 0.14
        const tw = w * 0.22
        return poly([[0, 0], [w, 0], [w, tf], [tw, tf], [tw, h - tf], [w, h - tf], [w, h], [0, h]])
    }
    case 'angle': {
        const t = m * 0.18
        return poly([[0, 0], [t, 0], [t, h - t], [w, h - t], [w, h], [0, h]])
    }
    case 'truss': {
        const t = Math.max(3, h * 0.16)
        const n = Math.max(2, Math.round(w / Math.max(h, 1)))
        const step = w / n
        let out = ''
        for (let i = 0; i < n; i++) {
            const x = i * step
            out += strut(x + t / 2, h - t, x + step / 2, t, t * 0.7) + strut(x + step / 2, t, x + step - t / 2, h - t, t * 0.7)
        }
        return out + box(0, 0, w, t) + box(0, h - t, w, t)
    }
    case 'tube': return `<rect class="hmi-body" x="0" y="0" width="${f(w)}" height="${f(h)}" rx="${f(Math.min(h * 0.2, 4))}"/>` +
        `<path class="hmi-detail" d="M${f(Math.min(w * 0.03, 6))} ${f(h * 0.3)}H${f(w - Math.min(w * 0.03, 6))}"/>`
    case 'column': {
        const p = Math.max(4, h * 0.035)
        const s = w * 0.25
        return box(s, p, w - 2 * s, h - 2 * p) + box(0, 0, w, p) + box(0, h - p, w, p)
    }
    case 'pedestal': {
        const top = h * 0.1
        const base = h * 0.12
        return poly([[w * 0.15, 0], [w * 0.85, 0], [w * 0.85, top], [w * 0.72, top], [w * 0.8, h - base], [w, h - base], [w, h], [0, h], [0, h - base], [w * 0.2, h - base], [w * 0.28, top], [w * 0.15, top]]) +
            bolts(h - base / 2, w, Math.max(1.5, base * 0.22), 2)
    }
    case 'bearing': {
        const r = Math.min(w * 0.36, h * 0.24)
        const cy = r + 1
        const base = h * 0.1
        return poly([[w * 0.5 - r, cy], [w * 0.5 + r, cy], [w * 0.78, h - base], [w, h - base], [w, h], [0, h], [0, h - base], [w * 0.22, h - base]]) +
            `<circle class="hmi-body" cx="${f(w / 2)}" cy="${f(cy)}" r="${f(r)}"/>` +
            `<circle class="hmi-detail" cx="${f(w / 2)}" cy="${f(cy)}" r="${f(r * 0.45)}"/>` +
            bolts(h - base / 2, w, Math.max(1.5, base * 0.22), 2)
    }
    case 'bracket': {
        const t = Math.max(4, m * 0.1)
        return box(0, 0, t, h) + box(0, 0, w, t) + strut(t / 2, h * 0.85, w * 0.85, t / 2, t * 0.8)
    }
    case 'aFrame': {
        const t = Math.max(4, Math.min(w, h) * 0.08)
        return strut(w * 0.35, t, t, h - t / 2, t) + strut(w * 0.65, t, w - t, h - t / 2, t) +
            box(w * 0.22, h * 0.6, w * 0.56, t * 0.7) + box(w * 0.25, 0, w * 0.5, t * 1.4)
    }
    case 'stand': {
        const top = Math.max(4, h * 0.12)
        const t = Math.max(4, w * 0.05)
        const foot = Math.max(3, h * 0.06)
        return box(w * 0.04, top, t, h - top - foot) + box(w * 0.96 - t, top, t, h - top - foot) +
            box(w * 0.04, h * 0.66, w * 0.92, t * 0.7) + box(0, 0, w, top) +
            box(0, h - foot, w * 0.04 * 2 + t, foot) + box(w - (w * 0.04 * 2 + t), h - foot, w * 0.04 * 2 + t, foot)
    }
    case 'basePlate': return box(0, 0, w, h) + bolts(h / 2, w, Math.max(1.5, h * 0.18), Math.max(2, Math.round(w / Math.max(h * 3, 1))))
    }
    return null
}

// only images (data URLs or http/relative addresses); never javascript: or markup
export function safeImageSrc (src) {
    const s = String(src || '').trim()
    if (/^data:image\/(png|jpe?g|gif|webp|svg\+xml);base64,[A-Za-z0-9+/=]+$/.test(s)) return s
    if (/^(https?:\/\/|\/)[^\s"'<>`]*$/.test(s)) return s
    return ''
}

function renderImage (sym, value) {
    const p = sym.props || {}
    const w = sym.w
    const h = sym.h
    const on = onState(value, p)
    const src = safeImageSrc(on === true && p.srcOn ? p.srcOn : p.src)
    const label = labelBelow(p, w, h)
    if (!src) {
        const m = Math.min(w, h)
        return `<g class="hmi-image hmi-img-empty"><rect class="hmi-img-box" x="1" y="1" width="${f(w - 2)}" height="${f(h - 2)}" rx="4"/>` +
            `<path class="hmi-img-icon" d="M${f(w / 2 - m * 0.25)} ${f(h / 2 + m * 0.18)}l${f(m * 0.17)} ${f(-m * 0.24)} ${f(m * 0.1)} ${f(m * 0.12)} ${f(m * 0.08)} ${f(-m * 0.07)} ${f(m * 0.15)} ${f(m * 0.19)}z"/>` +
            `<circle class="hmi-img-icon" cx="${f(w / 2 + m * 0.12)}" cy="${f(h / 2 - m * 0.14)}" r="${f(m * 0.05)}"/>${label}</g>`
    }
    const par = p.fit === 'stretch' ? 'none' : (p.fit === 'slice' ? 'xMidYMid slice' : 'xMidYMid meet')
    return `<g class="hmi-image"><rect class="hmi-hitbox" x="0" y="0" width="${f(w)}" height="${f(h)}"/>` +
        `<image href="${escapeXml(src)}" x="0" y="0" width="${f(w)}" height="${f(h)}" preserveAspectRatio="${par}"/>${label}</g>`
}

function faultMark (p, opts, w) {
    return faultOf(p, opts) ? alarmIndicator(w - 4, 6, p.priority) : ''
}
const faultClass = (p, opts) => faultOf(p, opts) ? ' hmi-fault' : ''

function renderConveyor (sym, value, opts) {
    const p = sym.props || {}
    const w = sym.w
    const h = sym.h
    const on = onState(value, p)
    const r = Math.max(4, h / 2 - 1)
    const pr = r * 0.72
    let idlers = ''
    const n = Math.max(0, Math.floor((w - 4 * r) / 40))
    for (let i = 1; i <= n; i++) {
        const x = 2 * r + (w - 4 * r) * i / (n + 1)
        idlers += `<circle class="hmi-idler" cx="${f(x)}" cy="${f(h / 2)}" r="${f(r * 0.3)}"/>`
    }
    const dir = p.dir === 'rev' ? -1 : 1
    const ax = w / 2
    const ay = h / 2
    const as = Math.min(r * 0.5, 9)
    return `<g class="hmi-conveyor ${stateClass(on)} hmi-${p.dir === 'rev' ? 'rev' : 'fwd'}${faultClass(p, opts)}">` +
        `<rect class="hmi-body" x="1" y="1" width="${f(w - 2)}" height="${f(h - 2)}" rx="${f(r)}"/>` +
        `<path class="hmi-belt" d="M${f(r + 1)} 2.5H${f(w - r - 1)}"/>` +
        `<circle class="hmi-pulley" cx="${f(r + 1)}" cy="${f(h / 2)}" r="${f(pr)}"/>` +
        `<circle class="hmi-pulley" cx="${f(w - r - 1)}" cy="${f(h / 2)}" r="${f(pr)}"/>` + idlers +
        `<path class="hmi-dir" d="M${f(ax - as * dir)} ${f(ay - as)}L${f(ax + as * dir)} ${f(ay)}L${f(ax - as * dir)} ${f(ay + as)}Z"/>` +
        faultMark(p, opts, w) + labelBelow(p, w, h) + '</g>'
}

function renderCylinder (sym, value) {
    const p = sym.props || {}
    const w = sym.w
    const h = sym.h
    const on = onState(value, p)
    const bx = w * 0.55
    const rodY = h / 2 - h * 0.09
    const rodEnd = on ? w - 8 : w * 0.66
    return `<g class="hmi-cylinder ${stateClass(on)}">` +
        `<rect class="hmi-rod" x="${f(bx - 4)}" y="${f(rodY)}" width="${f(rodEnd - bx + 4)}" height="${f(h * 0.18)}"/>` +
        `<rect class="hmi-rod-end" x="${f(rodEnd)}" y="${f(h * 0.22)}" width="8" height="${f(h * 0.56)}" rx="1"/>` +
        `<rect class="hmi-body" x="1" y="${f(h * 0.12)}" width="${f(bx - 1)}" height="${f(h * 0.76)}" rx="2"/>` +
        `<path class="hmi-detail" d="M${f(bx * 0.12)} ${f(h * 0.12)}V${f(h * 0.88)}M${f(bx * 0.88)} ${f(h * 0.12)}V${f(h * 0.88)}"/>` +
        labelBelow(p, w, h) + '</g>'
}

function renderFan (sym, value, opts) {
    const p = sym.props || {}
    const w = sym.w
    const h = sym.h
    const on = onState(value, p)
    const r = Math.max(6, Math.min(w, h) / 2 - 2)
    const blades = [0, 120, 240].map(a => `<ellipse class="hmi-blade" cx="0" cy="${f(-r * 0.45)}" rx="${f(r * 0.2)}" ry="${f(r * 0.4)}" transform="rotate(${a})"/>`).join('')
    return `<g class="hmi-fan ${stateClass(on)}${faultClass(p, opts)}">` +
        `<circle class="hmi-body" cx="${f(w / 2)}" cy="${f(h / 2)}" r="${f(r)}"/>` +
        `<g transform="translate(${f(w / 2)},${f(h / 2)})"><g class="hmi-spin">${blades}<circle class="hmi-hub" r="${f(r * 0.14)}"/></g></g>` +
        faultMark(p, opts, w) + labelBelow(p, w, h) + '</g>'
}

function renderKnife (sym, value) {
    const p = sym.props || {}
    const w = sym.w
    const h = sym.h
    const on = onState(value, p)
    const r = Math.max(6, Math.min(w, h) / 2 - 2)
    const marks = [0, 60, 120, 180, 240, 300].map(a => {
        const rad = a * Math.PI / 180
        return `M${f(Math.cos(rad) * r * 0.45)} ${f(Math.sin(rad) * r * 0.45)}L${f(Math.cos(rad) * r * 0.78)} ${f(Math.sin(rad) * r * 0.78)}`
    }).join('')
    return `<g class="hmi-knife ${stateClass(on)}">` +
        `<g transform="translate(${f(w / 2)},${f(h / 2)})"><g class="hmi-spin">` +
        `<circle class="hmi-body" r="${f(r)}"/><circle class="hmi-edge" r="${f(r * 0.86)}"/>` +
        `<path class="hmi-detail" d="${marks}"/><circle class="hmi-hub" r="${f(r * 0.3)}"/></g></g>` +
        labelBelow(p, w, h) + '</g>'
}

function renderHeater (sym, value, opts) {
    const p = sym.props || {}
    const w = sym.w
    const h = sym.h
    const on = onState(value, p)
    const n = Math.max(3, Math.round(w / 14))
    let d = `M6 ${f(h / 2)}`
    for (let i = 0; i < n; i++) {
        const x = 6 + (w - 12) * (i + 0.5) / n
        d += `L${f(x)} ${f(i % 2 ? h * 0.75 : h * 0.25)}`
    }
    d += `L${f(w - 6)} ${f(h / 2)}`
    return `<g class="hmi-heater ${stateClass(on)}${faultClass(p, opts)}">` +
        `<rect class="hmi-body" x="1" y="1" width="${f(w - 2)}" height="${f(h - 2)}" rx="4"/>` +
        `<path class="hmi-coil" d="${d}"/>` + faultMark(p, opts, w) + labelBelow(p, w, h) + '</g>'
}

function renderSensor (sym, value) {
    const p = sym.props || {}
    const w = sym.w
    const h = sym.h
    const on = onState(value, p)
    const kind = ['prox', 'limit'].includes(p.kind) ? p.kind : 'photo'
    let body
    if (kind === 'photo') {
        body = `<path class="hmi-beam" d="M${f(w * 0.5)} ${f(h / 2)}H${f(w - 1)}"/>` +
            `<rect class="hmi-body" x="1" y="${f(h * 0.2)}" width="${f(w * 0.5)}" height="${f(h * 0.6)}" rx="3"/>` +
            `<circle class="hmi-lens" cx="${f(w * 0.5)}" cy="${f(h / 2)}" r="${f(h * 0.12)}"/>`
    } else if (kind === 'prox') {
        body = `<rect class="hmi-body" x="1" y="${f(h * 0.25)}" width="${f(w * 0.75)}" height="${f(h * 0.5)}" rx="2"/>` +
            `<rect class="hmi-lens" x="${f(w * 0.75)}" y="${f(h * 0.25)}" width="${f(w * 0.2)}" height="${f(h * 0.5)}" rx="2"/>`
    } else {
        const a = on ? 0.42 : 0.12
        body = `<path class="hmi-lever" d="M${f(w * 0.5)} ${f(h * 0.5)}L${f(w * 0.5 + Math.cos(-Math.PI / 2 + a) * h * 0.45)} ${f(h * 0.5 + Math.sin(-Math.PI / 2 + a) * h * 0.45)}"/>` +
            `<rect class="hmi-body" x="${f(w * 0.2)}" y="${f(h * 0.5)}" width="${f(w * 0.6)}" height="${f(h * 0.45)}" rx="2"/>` +
            `<circle class="hmi-lens" cx="${f(w * 0.5 + Math.cos(-Math.PI / 2 + a) * h * 0.45)}" cy="${f(h * 0.5 + Math.sin(-Math.PI / 2 + a) * h * 0.45)}" r="${f(h * 0.08)}"/>`
    }
    return `<g class="hmi-sensor hmi-sensor-${kind} ${stateClass(on)}">${body}${labelBelow(p, w, h)}</g>`
}

function scaleOf (p) {
    let min = num(p.min)
    let max = num(p.max)
    if (min === null) min = 0
    if (max === null || max <= min) max = min + 100
    return { min, max, frac: v => Math.max(0, Math.min(1, (v - min) / (max - min))) }
}

function arcPath (cx, cy, r, a0, a1) {
    const pt = a => [cx + r * Math.cos(a * Math.PI / 180), cy + r * Math.sin(a * Math.PI / 180)]
    const [x0, y0] = pt(a0)
    const [x1, y1] = pt(a1)
    return `M${f(x0)} ${f(y0)}A${f(r)} ${f(r)} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${f(x1)} ${f(y1)}`
}

function renderGauge (sym, value, opts) {
    const p = sym.props || {}
    const w = sym.w
    const h = sym.h
    const sc = scaleOf(p)
    const v = num(value)
    const state = rangeState(value, p.lo, p.hi)
    const cls = state === null ? 'hmi-unknown' : (state === 'alarm' ? 'hmi-alarm' : 'hmi-normal')
    const titleY = Math.max(12, Math.min(16, h * 0.12))
    const cx = w / 2
    const r = Math.max(10, Math.min(w / 2 - 10, (h - titleY - 34) / 1.5))
    const cy = titleY + 8 + r
    const A = fr => 150 + 240 * fr
    let out = `<g class="hmi-gauge ${cls}">` +
        `<rect class="hmi-tag-box" x="0.5" y="0.5" width="${f(w - 1)}" height="${f(h - 1)}" rx="4"/>` +
        `<path class="hmi-gauge-track" d="${arcPath(cx, cy, r, A(0), A(1))}"/>`
    const lo = num(p.lo)
    const hi = num(p.hi)
    if (lo !== null || hi !== null) {
        out += `<path class="hmi-gauge-normal" d="${arcPath(cx, cy, r, A(sc.frac(lo === null ? sc.min : lo)), A(sc.frac(hi === null ? sc.max : hi)))}"/>`
    }
    if (v !== null) {
        const a = A(sc.frac(v)) * Math.PI / 180
        out += `<path class="hmi-needle" d="M${f(cx)} ${f(cy)}L${f(cx + Math.cos(a) * r * 0.92)} ${f(cy + Math.sin(a) * r * 0.92)}"/>`
    }
    const text = formatValue(value, p.decimals, opts.locale) + (p.unit ? ' ' + p.unit : '')
    out += `<circle class="hmi-gauge-hub" cx="${f(cx)}" cy="${f(cy)}" r="4"/>` +
        `<text class="hmi-tag-title" x="${f(cx)}" y="${f(titleY)}" font-size="${f(Math.max(9, Math.min(13, w * 0.08)))}">${escapeXml(p.title || sym.key || '')}</text>` +
        `<text class="hmi-tag-value" x="${f(cx)}" y="${f(h - 10)}" font-size="${f(Math.max(10, Math.min(20, w * 0.12)))}">${escapeXml(text)}</text>`
    if (state === 'alarm') out += alarmIndicator(w - 10, 10, p.priority)
    return out + '</g>'
}

function renderBar (sym, value, opts) {
    const p = sym.props || {}
    const w = sym.w
    const h = sym.h
    const sc = scaleOf(p)
    const v = num(value)
    const state = rangeState(value, p.lo, p.hi)
    const cls = state === null ? 'hmi-unknown' : (state === 'alarm' ? 'hmi-alarm' : 'hmi-normal')
    const top = 20
    const bottom = h - 22
    const tw = Math.max(8, w * 0.4)
    const tx = (w - tw) / 2
    const Y = val => bottom - sc.frac(val) * (bottom - top)
    let out = `<g class="hmi-vbar ${cls}">` +
        `<text class="hmi-tag-title" x="${f(w / 2)}" y="12" font-size="${f(Math.max(9, Math.min(12, w * 0.2)))}">${escapeXml(p.title || sym.key || '')}</text>` +
        `<rect class="hmi-vbar-track" x="${f(tx)}" y="${f(top)}" width="${f(tw)}" height="${f(bottom - top)}"/>`
    if (v !== null) out += `<rect class="hmi-vbar-fill" x="${f(tx)}" y="${f(Y(v))}" width="${f(tw)}" height="${f(bottom - Y(v))}"/>`
    for (const lim of [num(p.lo), num(p.hi)]) {
        if (lim !== null) out += `<path class="hmi-vbar-limit" d="M${f(tx - 5)} ${f(Y(lim))}H${f(tx + tw + 5)}"/>`
    }
    const text = formatValue(value, p.decimals, opts.locale) + (p.unit ? ' ' + p.unit : '')
    out += `<text class="hmi-tag-value" x="${f(w / 2)}" y="${f(h - 6)}" font-size="${f(Math.max(9, Math.min(16, w * 0.22)))}">${escapeXml(text)}</text>`
    if (state === 'alarm') out += alarmIndicator(w - 8, top + 8, p.priority)
    return out + '</g>'
}

function renderTrend (sym, value, opts) {
    const p = sym.props || {}
    const w = sym.w
    const h = sym.h
    const win = Math.max(5, Math.min(3600, Number(p.window) || 60)) * 1000
    const now = opts.now || Date.now()
    let pts = (opts.history && sym.key && opts.history[sym.key]) || null
    if (!pts && opts.editor) {
        const base = num(value) === null ? 50 : num(value)
        pts = Array.from({ length: 40 }, (x, i) => [now - win + win * i / 39, base * (1 + 0.08 * Math.sin(i / 4))])
    }
    pts = (pts || []).filter(q => q[0] >= now - win)
    if (pts.length && pts[pts.length - 1][0] < now) pts.push([now, pts[pts.length - 1][1]]) // last value holds until now
    const x0 = 8
    const x1 = w - 8
    const narrow = w < 240
    const y0 = narrow ? 44 : 28
    const y1 = h - 8
    let lo = num(p.min)
    let hi = num(p.max)
    if (pts.length && (lo === null || hi === null)) {
        const vs = pts.map(q => q[1])
        const pad = (Math.max(...vs) - Math.min(...vs)) * 0.1 || Math.abs(vs[0]) * 0.1 || 1
        if (lo === null) lo = Math.min(...vs) - pad
        if (hi === null) hi = Math.max(...vs) + pad
    }
    if (lo === null) lo = 0
    if (hi === null || hi <= lo) hi = lo + 1
    const X = t => x0 + (t - (now - win)) / win * (x1 - x0)
    const Y = v => y1 - (Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo) * (y1 - y0)
    const text = formatValue(value, p.decimals, opts.locale) + (p.unit ? ' ' + p.unit : '')
    let out = `<g class="hmi-trend ${value === undefined || value === null ? 'hmi-unknown' : 'hmi-normal'}">` +
        `<rect class="hmi-tag-box" x="0.5" y="0.5" width="${f(w - 1)}" height="${f(h - 1)}" rx="4"/>` +
        `<text class="hmi-tag-title hmi-left" x="10" y="17" font-size="12">${escapeXml(p.title || sym.key || '')}</text>` +
        (narrow
            ? `<text class="hmi-tag-value hmi-left" x="10" y="35" font-size="14">${escapeXml(text)}</text>`
            : `<text class="hmi-tag-value hmi-right" x="${f(w - 10)}" y="18" font-size="15">${escapeXml(text)}</text>`) +
        `<path class="hmi-trend-grid" d="M${x0} ${f(y0)}H${f(x1)}M${x0} ${f((y0 + y1) / 2)}H${f(x1)}M${x0} ${f(y1)}H${f(x1)}"/>`
    if (pts.length > 1) out += `<path class="hmi-trend-line" d="M${pts.map(q => f(X(q[0])) + ' ' + f(Y(q[1]))).join('L')}"/>`
    return out + '</g>'
}

function renderStack (sym, value, opts) {
    const p = sym.props || {}
    const w = sym.w
    const h = sym.h
    const vals = opts.values || {}
    const lamps = [['keyRed', 'alarm'], ['keyYellow', 'warn'], ['keyGreen', 'ok'], ['keyBlue', 'info']].filter(([k], i) => i < 3 || p.keyBlue)
    const none = lamps.every(([k]) => !p[k] || vals[p[k]] === undefined)
    const segH = (h - 18) / lamps.length
    let out = `<g class="hmi-stack">`
    lamps.forEach(([k, color], i) => {
        const on = p[k] ? isOn(vals[p[k]], 'nonzero') === true : (opts.editor && none && color === 'ok')
        out += `<rect class="hmi-lamp hmi-lamp-${color}${on ? ' hmi-on' : ''}${on && p.blink === 'yes' ? ' hmi-blink' : ''}" x="1" y="${f(1 + i * segH)}" width="${f(w - 2)}" height="${f(segH - 2)}" rx="3"/>`
    })
    out += `<rect class="hmi-stack-pole" x="${f(w * 0.35)}" y="${f(h - 18)}" width="${f(w * 0.3)}" height="12"/>` +
        `<rect class="hmi-stack-base" x="1" y="${f(h - 7)}" width="${f(w - 2)}" height="6" rx="2"/>`
    return out + labelBelow(p, w, h) + '</g>'
}

function renderSwitch (sym, value) {
    const p = sym.props || {}
    const w = sym.w
    const h = sym.h
    const on = onState(value, p)
    const r = h / 2 - 3
    const kx = on ? w - r - 3 : r + 3
    const text = on ? p.textOn : p.textOff
    const tx = on ? (w - 2 * r - 6) / 2 + 2 : (w + 2 * r + 6) / 2
    return `<g class="hmi-switch ${stateClass(on)}">` +
        `<rect class="hmi-switch-track" x="1" y="1" width="${f(w - 2)}" height="${f(h - 2)}" rx="${f(h / 2 - 1)}"/>` +
        `<circle class="hmi-switch-knob" cx="${f(kx)}" cy="${f(h / 2)}" r="${f(r)}"/>` +
        `<text class="hmi-switch-text" x="${f(tx)}" y="${f(h / 2)}" font-size="${f(Math.max(9, Math.min(h * 0.32, (w - 2 * r) / Math.max(3, (text || '').length) * 1.5)))}">${escapeXml(on === null ? '—' : (text || ''))}</text></g>`
}

function renderSetpoint (sym, value, opts) {
    const p = sym.props || {}
    const w = sym.w
    const h = sym.h
    const text = formatValue(value, p.decimals, opts.locale) + (p.unit ? ' ' + p.unit : '')
    const unknown = value === undefined || value === null ? ' hmi-unknown' : ''
    const px = w - 18
    const py = 10
    return `<g class="hmi-setpoint${unknown}">` +
        `<rect class="hmi-setpoint-box" x="0.5" y="0.5" width="${f(w - 1)}" height="${f(h - 1)}" rx="4"/>` +
        `<text class="hmi-tag-title" x="${f(w / 2)}" y="${f(h * 0.28)}" font-size="${f(Math.max(9, Math.min(13, h * 0.2)))}">${escapeXml(p.title || sym.key || '')}</text>` +
        `<text class="hmi-tag-value" x="${f(w / 2)}" y="${f(h * 0.72)}" font-size="${f(Math.max(11, Math.min(26, h * 0.34)))}">${escapeXml(text)}</text>` +
        `<path class="hmi-pencil" d="M${px} ${py + 9}l2 -5 7 -7 3 3 -7 7z"/></g>`
}

function framePath (shape, w, h) {
    const st = structurePath(shape, w, h)
    if (st) return st
    const m = Math.min(w, h)
    const c = m * 0.15
    const a = m * 0.3
    switch (shape) {
    case 'round': return `<rect class="hmi-body" x="0" y="0" width="${f(w)}" height="${f(h)}" rx="${f(m * 0.08)}"/>`
    case 'chamfer': return poly([[0, h], [0, c], [c, 0], [w - c, 0], [w, c], [w, h]])
    case 'chamferAll': return poly([[0, h - c], [0, c], [c, 0], [w - c, 0], [w, c], [w, h - c], [w - c, h], [c, h]])
    case 'arcLeft': return `<path class="hmi-body" d="M0 ${f(h)}V${f(a)}A${f(a)} ${f(a)} 0 0 1 ${f(a)} 0H${f(w)}V${f(h)}Z"/>`
    case 'arcRight': return `<path class="hmi-body" d="M0 ${f(h)}V0H${f(w - a)}A${f(a)} ${f(a)} 0 0 1 ${f(w)} ${f(a)}V${f(h)}Z"/>`
    case 'archTop': {
        const ry = Math.min(h * 0.45, w / 2)
        return `<path class="hmi-body" d="M0 ${f(h)}V${f(ry)}A${f(w / 2)} ${f(ry)} 0 0 1 ${f(w)} ${f(ry)}V${f(h)}Z"/>`
    }
    case 'pill': return `<rect class="hmi-body" x="0" y="0" width="${f(w)}" height="${f(h)}" rx="${f(m / 2)}"/>`
    case 'circle': return `<ellipse class="hmi-body" cx="${f(w / 2)}" cy="${f(h / 2)}" rx="${f(w / 2)}" ry="${f(h / 2)}"/>`
    case 'triangle': return poly([[w / 2, 0], [w, h], [0, h]])
    case 'trapezoid': return poly([[w * 0.2, 0], [w * 0.8, 0], [w, h], [0, h]])
    case 'base': return poly([[w * 0.08, 0], [w * 0.92, 0], [w, h], [0, h]])
    case 'hopper': return poly([[0, 0], [w, 0], [w, h * 0.45], [w * 0.62, h], [w * 0.38, h], [0, h * 0.45]])
    case 'silo': return `<path class="hmi-body" d="M0 ${f(h * 0.1)}Q${f(w / 2)} ${f(-h * 0.06)} ${f(w)} ${f(h * 0.1)}V${f(h * 0.72)}L${f(w * 0.62)} ${f(h)}H${f(w * 0.38)}L0 ${f(h * 0.72)}Z"/>`
    case 'hexagon': {
        const k = Math.min(w * 0.25, h * 0.29)
        return poly([[k, 0], [w - k, 0], [w, h / 2], [w - k, h], [k, h], [0, h / 2]])
    }
    case 'diamond': return poly([[w / 2, 0], [w, h / 2], [w / 2, h], [0, h / 2]])
    case 'parallelogram': return poly([[w * 0.2, 0], [w, 0], [w * 0.8, h], [0, h]])
    case 'lShape': {
        const t = m * 0.4
        return poly([[0, 0], [t, 0], [t, h - t], [w, h - t], [w, h], [0, h]])
    }
    case 'uShape': {
        const t = m * 0.3
        return poly([[0, 0], [t, 0], [t, h - t], [w - t, h - t], [w - t, 0], [w, 0], [w, h], [0, h]])
    }
    case 'cabinet': {
        const hw = Math.max(3, w * 0.04)
        return `<rect class="hmi-body" x="0" y="0" width="${f(w)}" height="${f(h)}" rx="3"/>` +
            `<path class="hmi-detail" d="M${f(w / 2)} 4V${f(h - 4)}"/>` +
            `<rect class="hmi-detail" x="${f(w / 2 - hw * 2.5)}" y="${f(h / 2 - 12)}" width="${f(hw)}" height="24" rx="1"/>` +
            `<rect class="hmi-detail" x="${f(w / 2 + hw * 1.5)}" y="${f(h / 2 - 12)}" width="${f(hw)}" height="24" rx="1"/>`
    }
    default: return `<rect class="hmi-body" x="0" y="0" width="${f(w)}" height="${f(h)}"/>`
    }
}

function renderFrame (sym) {
    const p = sym.props || {}
    const tone = TONES.some(t => t[0] === p.tone) ? p.tone : 'equip'
    const label = p.label ? `<text class="hmi-label" x="${f(sym.w / 2)}" y="${f(sym.h + 18)}">${escapeXml(p.label)}</text>` : ''
    let defs = ''
    let style = ''
    let fixed = TONE_COLORS[tone]
    if (tone === 'custom') fixed = [HEX.test(p.fill) ? p.fill : '#6a737d', HEX.test(p.stroke) ? p.stroke : '#8a939d']
    if (fixed) {
        let fill = fixed[0]
        if (Array.isArray(fill)) {
            // gradient per symbol, so the drawing needs nothing outside itself
            const id = 'hmi-grad-' + String(sym.id).replace(/[^\w-]/g, '')
            defs = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${fill[0]}"/><stop offset="1" stop-color="${fill[1]}"/></linearGradient></defs>`
            fill = `url(#${id})`
        }
        style = ` style="--hmi-tone-fill:${fill};--hmi-tone-stroke:${fixed[1]}"`
    }
    return `<g class="hmi-frame hmi-tone-${fixed ? 'fixed' : tone}"${style}>${defs}${framePath(p.shape, sym.w, sym.h)}${label}</g>`
}

export function linePoints (sym) {
    const pts = sym.props && Array.isArray(sym.props.points) ? sym.props.points : []
    return pts.filter(pt => Array.isArray(pt) && isFinite(pt[0]) && isFinite(pt[1])).map(pt => [Number(pt[0]), Number(pt[1])])
}

function renderLine (sym, value, opts) {
    const p = sym.props || {}
    const pts = linePoints(sym)
    if (pts.length < 2) return ''
    const d = 'M' + pts.map(pt => f(pt[0]) + ' ' + f(pt[1])).join('L')
    const on = onState(value, p)
    const style = ['pipe', 'conveyor', 'signal'].includes(p.style) ? p.style : 'strip'
    const flow = ['always', 'never'].includes(p.flow) ? p.flow : 'auto'
    return `<g class="hmi-line hmi-ls-${style} ${stateClass(on)} hmi-flow-${flow}">` +
        `<path class="hmi-hit" d="${d}"/><path class="hmi-path" d="${d}"/><path class="hmi-flowpath" d="${d}"/></g>`
}

function renderKpi (sym, value, opts) {
    const p = sym.props || {}
    const w = sym.w
    const h = sym.h
    const text = formatValue(value, p.decimals, opts.locale) + (p.unit ? ' ' + p.unit : '')
    const big = f(Math.max(12, Math.min(h * 0.3, (w - 30) / Math.max(4, text.length) * 1.7)))
    return `<g class="hmi-kpi ${value === undefined || value === null ? 'hmi-unknown' : 'hmi-normal'}">` +
        `<rect class="hmi-kpi-card" x="0.5" y="0.5" width="${f(w - 1)}" height="${f(h - 1)}" rx="8"/>` +
        `<text class="hmi-kpi-title" x="${f(w * 0.066)}" y="${f(h * 0.23)}" font-size="${f(Math.max(9, h * 0.1))}">${escapeXml(p.title || sym.key || '')}</text>` +
        `<text class="hmi-kpi-value" x="${f(w * 0.066)}" y="${f(h * 0.6)}" font-size="${big}">${escapeXml(text)}</text>` +
        (p.subtitle ? `<text class="hmi-kpi-sub" x="${f(w * 0.066)}" y="${f(h * 0.84)}" font-size="${f(Math.max(9, h * 0.1))}">${escapeXml(p.subtitle)}</text>` : '') +
        '</g>'
}

function renderText (sym, value, opts) {
    const p = sym.props || {}
    const align = ['start', 'end'].includes(p.align) ? p.align : 'middle'
    const x = align === 'start' ? 0 : (align === 'end' ? sym.w : sym.w / 2)
    let text = p.text || ''
    if (sym.key) text = (text ? text + ' ' : '') + formatValue(value, p.decimals, opts.locale) + (p.unit ? ' ' + p.unit : '')
    const size = Math.max(6, Number(p.size) || 16)
    const unknown = sym.key && (value === undefined || value === null) ? ' hmi-unknown' : ''
    return `<g class="hmi-text hmi-tone-${p.tone === 'dim' ? 'dim' : 'normal'}${unknown}"><rect class="hmi-hitbox" x="0" y="0" width="${f(sym.w)}" height="${f(sym.h)}"/>` +
        `<text x="${f(x)}" y="${f(sym.h / 2)}" font-size="${f(size)}" style="text-anchor:${align}" font-weight="${p.bold === 'yes' ? 700 : 400}">${escapeXml(text)}</text></g>`
}

function renderLed (sym, value) {
    const p = sym.props || {}
    const on = onState(value, p)
    const r = Math.max(3, Math.min(sym.w, sym.h) / 2 - 1.5)
    return `<g class="hmi-led ${stateClass(on)} ${colorClass(p)}${blinkClass(p, on)}">` +
        `<circle class="hmi-dot" cx="${f(sym.w / 2)}" cy="${f(sym.h / 2)}" r="${f(r)}"/>` + labelBelow(p, sym.w, sym.h) + '</g>'
}

function renderChip (sym, value, opts) {
    const p = sym.props || {}
    const w = sym.w
    const h = sym.h
    const on = onState(value, p)
    let text = on ? p.textOn : p.textOff
    if (on === null) text = '—'
    else if (!text) text = formatValue(value, '', opts.locale)
    return `<g class="hmi-chip ${stateClass(on)} ${colorClass(p)}${blinkClass(p, on)}">` +
        `<rect class="hmi-chip-box" x="0.5" y="0.5" width="${f(w - 1)}" height="${f(h - 1)}" rx="${f(h / 2)}"/>` +
        `<circle class="hmi-dot" cx="${f(h / 2)}" cy="${f(h / 2)}" r="${f(h * 0.19)}"/>` +
        `<text class="hmi-chip-text" x="${f(h * 0.95)}" y="${f(h / 2)}" font-size="${f(Math.max(9, h * 0.36))}">${escapeXml(text)}</text></g>`
}

function renderAlarm (sym, value, opts) {
    const p = sym.props || {}
    const w = sym.w
    const h = sym.h
    const on = onState(value, p)
    if (!on && !opts.editor) return ''
    const pr = ['1', '2', '3'].includes(String(p.priority)) ? String(p.priority) : '1'
    // text sits right of the priority indicator and shrinks to fit the box
    const ix = Math.min(h * 0.45, 40)
    const left = ix * 2
    const avail = Math.max(20, w - left - 12)
    const tx = left + avail / 2
    const size = Math.max(9, Math.min(h * 0.32, avail / (Math.max(4, (p.text || '').length) * 0.68)))
    const subSize = Math.max(8, Math.min(size * 0.5, avail / (Math.max(4, (p.sub || '').length) * 0.56)))
    return `<g class="hmi-alarm-banner hmi-p${pr} ${on ? 'hmi-on' : 'hmi-off hmi-ghost'}${blinkClass(p, on)}">` +
        `<rect class="hmi-alarm-box" x="1" y="1" width="${f(w - 2)}" height="${f(h - 2)}" rx="10"/>` +
        alarmIndicator(ix, h / 2, pr) +
        `<text class="hmi-alarm-text" x="${f(tx)}" y="${f(p.sub ? h * 0.44 : h / 2)}" font-size="${f(size)}">${escapeXml(p.text || '')}</text>` +
        (p.sub ? `<text class="hmi-alarm-sub" x="${f(tx)}" y="${f(h * 0.76)}" font-size="${f(subSize)}">${escapeXml(p.sub)}</text>` : '') + '</g>'
}

function renderTag (sym, value, opts) {
    const p = sym.props || {}
    const w = sym.w
    const h = sym.h
    const min = num(p.min)
    const max = num(p.max)
    const bar = min !== null && max !== null && max > min
    const state = rangeState(value, p.lo, p.hi)
    const cls = state === null ? 'hmi-unknown' : (state === 'alarm' ? 'hmi-alarm' : 'hmi-normal')
    const titleSize = f(Math.max(9, Math.min(14, h * 0.2)))
    const valueSize = f(Math.max(11, Math.min(32, h * (bar ? 0.3 : 0.36))))
    const text = formatValue(value, p.decimals, opts && opts.locale) + (p.unit ? ' ' + p.unit : '')
    let out = `<g class="hmi-tag ${cls}">` +
        `<rect class="hmi-tag-box" x="0.5" y="0.5" width="${f(w - 1)}" height="${f(h - 1)}" rx="3"/>` +
        `<text class="hmi-tag-title" x="${f(w / 2)}" y="${f(h * 0.3)}" font-size="${titleSize}">${escapeXml(p.title || sym.key || '')}</text>` +
        `<text class="hmi-tag-value" x="${f(w / 2)}" y="${f(h * (bar ? 0.66 : 0.76))}" font-size="${valueSize}">${escapeXml(text)}</text>`
    if (bar) {
        const x0 = 8
        const x1 = w - 8
        const y = h - 10
        const X = v => f(x0 + (Math.max(min, Math.min(max, v)) - min) / (max - min) * (x1 - x0))
        out += `<rect class="hmi-bar-track" x="${x0}" y="${f(y)}" width="${f(x1 - x0)}" height="4"/>`
        const lo = num(p.lo)
        const hi = num(p.hi)
        if (lo !== null || hi !== null) {
            const a = X(lo === null ? min : lo)
            const b = X(hi === null ? max : hi)
            out += `<rect class="hmi-bar-normal" x="${a}" y="${f(y)}" width="${f(Math.max(0, b - a))}" height="4"/>`
        }
        const v = num(value)
        if (v !== null) out += `<polygon class="hmi-bar-ptr" points="${X(v)},${f(y - 1)} ${f(X(v) - 4)},${f(y - 7)} ${f(Number(X(v)) + 4)},${f(y - 7)}"/>`
    }
    if (state === 'alarm') out += alarmIndicator(w - 2, 2, p.priority)
    return out + '</g>'
}

// Inner SVG markup of one symbol, already placed at its x/y with its rotation.
export function renderSymbol (sym, value, opts) {
    const def = SYMBOLS[sym.type]
    if (!def) return ''
    const o = opts || {}
    const fx = ruleEffects(sym, o.values || {})
    if (fx.hide && !o.editor) return ''
    const cls = 'hmi-symbol' + fx.classes.map(c => ' ' + c).join('') + (fx.hide ? ' hmi-rule-hidden' : '')
    const rot = Number(sym.rot) || 0
    const tf = `translate(${f(sym.x)},${f(sym.y)})` + (rot ? ` rotate(${f(rot)},${f(sym.w / 2)},${f(sym.h / 2)})` : '')
    return `<g class="${cls}" data-id="${escapeXml(sym.id)}" transform="${tf}">${def.render(sym, value, o)}</g>`
}

export const STYLE_ID = 'hmi-symbols-style'

export const CSS = `
.hmi-canvas-wrapper { width: 100%; }
.hmi-canvas-wrapper > svg { display: block; width: 100%; height: auto; }
.hmi-root { font-family: "Segoe UI", Roboto, Arial, sans-serif; }
.hmi-root.hmi-theme-isa101 {
  --hmi-bg: #d9dadb; --hmi-equip: #c9cbcd; --hmi-equip-on: #808489; --hmi-stroke: #5f6368;
  --hmi-line: #8a8e93; --hmi-text: #1f2328; --hmi-text-dim: #55595e; --hmi-tag-bg: #e6e7e8;
  --hmi-alarm: #d71920; --hmi-warn: #f2b705; --hmi-low: #c46ad1; --hmi-ok: #4d5156; --hmi-info: #2f6fb3;
  --hmi-dark: #a9acaf; --hmi-pit: #b9bbbd; --hmi-material: #3d4146; --hmi-level: #8ea2b7;
}
.hmi-root.hmi-theme-classic {
  --hmi-bg: #2a2f36; --hmi-equip: #59626c; --hmi-equip-on: #8794a0; --hmi-stroke: #aab6c1;
  --hmi-line: #7b8895; --hmi-text: #e8edf1; --hmi-text-dim: #9aa4ae; --hmi-tag-bg: #1c2025;
  --hmi-alarm: #ef4444; --hmi-warn: #f59e0b; --hmi-low: #c084fc; --hmi-ok: #22c55e; --hmi-info: #38bdf8;
  --hmi-dark: #3a4148; --hmi-pit: #1b1f23; --hmi-material: #c4d0db; --hmi-level: #2f80c8;
}
.hmi-root { background: var(--hmi-bg); }
.hmi-root .hmi-bg { fill: var(--hmi-bg); }
.hmi-root text { text-anchor: middle; }
.hmi-root .hmi-label { fill: var(--hmi-text); font-size: 14px; font-weight: 600; }
.hmi-root .hmi-reel .hmi-body { fill: var(--hmi-equip); stroke: var(--hmi-stroke); stroke-width: 2; }
.hmi-root .hmi-reel.hmi-on .hmi-body { fill: var(--hmi-equip-on); }
.hmi-root .hmi-reel.hmi-unknown .hmi-body { stroke-dasharray: 6 4; }
.hmi-root .hmi-reel .hmi-ring { fill: none; stroke: var(--hmi-line); stroke-width: 1; }
.hmi-root .hmi-reel .hmi-spokes line { stroke: var(--hmi-line); stroke-width: 1.5; }
.hmi-root .hmi-reel .hmi-hub { fill: var(--hmi-tag-bg); stroke: var(--hmi-stroke); stroke-width: 2; }
.hmi-root .hmi-reel .hmi-axle { fill: var(--hmi-stroke); }
.hmi-root .hmi-reel .hmi-spin, .hmi-root .hmi-roller .hmi-spin { transform-box: view-box; transform-origin: 0 0; }
.hmi-root.hmi-theme-classic .hmi-reel.hmi-on .hmi-spin { animation: hmi-spin 2.4s linear infinite; }
.hmi-root.hmi-theme-classic .hmi-reel.hmi-on .hmi-axle { fill: var(--hmi-ok); }
.hmi-root .hmi-tag-box { fill: var(--hmi-tag-bg); stroke: var(--hmi-line); stroke-width: 1; }
.hmi-root .hmi-tag-title { fill: var(--hmi-text-dim); font-weight: 600; letter-spacing: .5px; }
.hmi-root .hmi-tag-value { fill: var(--hmi-text); font-family: Consolas, "Roboto Mono", monospace; font-weight: 700; }
.hmi-root .hmi-tag.hmi-alarm .hmi-tag-box { stroke: var(--hmi-alarm); stroke-width: 2; }
.hmi-root .hmi-tag.hmi-alarm .hmi-tag-value { fill: var(--hmi-alarm); }
.hmi-root .hmi-bar-track { fill: var(--hmi-bg); stroke: var(--hmi-line); stroke-width: .5; }
.hmi-root .hmi-bar-normal { fill: var(--hmi-line); }
.hmi-root .hmi-bar-ptr { fill: var(--hmi-text); }
.hmi-root .hmi-alarm-ind text { fill: #000; font-size: 11px; font-weight: 800; dominant-baseline: middle; }
.hmi-root .hmi-alarm-ind.hmi-p1 > rect { fill: var(--hmi-alarm); stroke: #000; stroke-width: 1; }
.hmi-root .hmi-alarm-ind.hmi-p1 text { fill: #fff; }
.hmi-root .hmi-alarm-ind.hmi-p2 > polygon { fill: var(--hmi-warn); stroke: #000; stroke-width: 1; }
.hmi-root .hmi-alarm-ind.hmi-p3 > polygon { fill: var(--hmi-low); stroke: #000; stroke-width: 1; }
.hmi-root .hmi-offline-banner { display: none; }
.hmi-root.hmi-offline .hmi-symbol { opacity: .45; }
.hmi-root.hmi-offline .hmi-offline-banner { display: inline; }
.hmi-root .hmi-offline-banner rect { fill: var(--hmi-tag-bg); stroke: var(--hmi-alarm); stroke-width: 2; }
.hmi-root .hmi-offline-banner text { fill: var(--hmi-text); font-size: 16px; font-weight: 700; dominant-baseline: middle; }
.hmi-root.hmi-transparent, .hmi-root.hmi-transparent .hmi-bg { background: none; fill: none; }
.hmi-root .hmi-blink { animation: hmi-blink 1s steps(2) infinite; }
.hmi-root .hmi-roller .hmi-body { fill: var(--hmi-tag-bg); stroke: var(--hmi-stroke); stroke-width: 1.5; }
.hmi-root .hmi-roller .hmi-mark { stroke: var(--hmi-stroke); stroke-width: 1.5; }
.hmi-root .hmi-roller.hmi-on .hmi-body { fill: var(--hmi-equip-on); }
.hmi-root.hmi-theme-classic .hmi-roller.hmi-on.hmi-cw .hmi-spin { animation: hmi-spin .9s linear infinite; }
.hmi-root.hmi-theme-classic .hmi-roller.hmi-on.hmi-ccw .hmi-spin { animation: hmi-spin-ccw .9s linear infinite; }
.hmi-root .hmi-motor .hmi-body { fill: var(--hmi-equip); stroke: var(--hmi-stroke); stroke-width: 2; }
.hmi-root .hmi-motor .hmi-foot { fill: var(--hmi-dark); stroke: var(--hmi-stroke); stroke-width: 1; }
.hmi-root .hmi-motor.hmi-on .hmi-body { fill: var(--hmi-equip-on); }
.hmi-root .hmi-motor.hmi-unknown .hmi-body { stroke-dasharray: 5 3; }
.hmi-root .hmi-motor.hmi-fault .hmi-body { stroke: var(--hmi-alarm); stroke-width: 3; }
.hmi-root .hmi-valve .hmi-body, .hmi-root .hmi-pump .hmi-body { fill: var(--hmi-equip); stroke: var(--hmi-stroke); stroke-width: 2; stroke-linejoin: round; }
.hmi-root .hmi-valve.hmi-on .hmi-body, .hmi-root .hmi-pump.hmi-on .hmi-body { fill: var(--hmi-equip-on); }
.hmi-root .hmi-valve.hmi-unknown .hmi-body, .hmi-root .hmi-pump.hmi-unknown .hmi-body { stroke-dasharray: 5 3; }
.hmi-root .hmi-valve.hmi-fault .hmi-body, .hmi-root .hmi-pump.hmi-fault .hmi-body { stroke: var(--hmi-alarm); stroke-width: 3; }
.hmi-root .hmi-valve .hmi-stem { stroke: var(--hmi-stroke); stroke-width: 2; }
.hmi-root .hmi-valve .hmi-actuator { fill: var(--hmi-dark); stroke: var(--hmi-stroke); stroke-width: 1.5; }
.hmi-root .hmi-pump .hmi-foot { fill: var(--hmi-dark); stroke: var(--hmi-stroke); stroke-width: 1; }
.hmi-root .hmi-pump-arrow { fill: var(--hmi-tag-bg); stroke: var(--hmi-stroke); stroke-width: 1; }
.hmi-root.hmi-theme-classic .hmi-pump.hmi-on .hmi-pump-arrow { fill: var(--hmi-ok); }
.hmi-root.hmi-theme-classic .hmi-valve.hmi-on .hmi-body { fill: var(--hmi-ok); }
.hmi-root .hmi-tank .hmi-body { fill: var(--hmi-equip); stroke: var(--hmi-stroke); stroke-width: 2; }
.hmi-root .hmi-tank.hmi-alarm .hmi-body { stroke: var(--hmi-alarm); stroke-width: 3; }
.hmi-root .hmi-tank.hmi-unknown .hmi-body { stroke-dasharray: 6 4; }
.hmi-root .hmi-level { fill: var(--hmi-level); }
.hmi-root .hmi-tank-tag { fill: var(--hmi-tag-bg); stroke: var(--hmi-line); stroke-width: 1; opacity: .92; }
.hmi-root .hmi-tank-value { fill: var(--hmi-text); font-family: Consolas, "Roboto Mono", monospace; font-weight: 700; dominant-baseline: central; }
.hmi-root .hmi-tank.hmi-alarm .hmi-tank-value { fill: var(--hmi-alarm); }
.hmi-root .hmi-button-box { fill: var(--hmi-tag-bg); stroke: var(--hmi-stroke); stroke-width: 1.5; }
.hmi-root .hmi-button.hmi-on .hmi-button-box { fill: var(--hmi-equip-on); }
.hmi-root .hmi-button-text { fill: var(--hmi-text); font-weight: 700; letter-spacing: .5px; dominant-baseline: central; }
.hmi-root .hmi-button.hmi-on .hmi-button-text { fill: var(--hmi-tag-bg); }
.hmi-root.hmi-theme-classic .hmi-button.hmi-on .hmi-button-text { fill: var(--hmi-text); }
.hmi-root .hmi-detail { fill: none; stroke: var(--hmi-stroke); stroke-width: 1.5; }
.hmi-root .hmi-frame.hmi-tone-outline .hmi-body { fill: none; }
.hmi-root .hmi-frame.hmi-tone-fixed .hmi-body { fill: var(--hmi-tone-fill); stroke: var(--hmi-tone-stroke); }
.hmi-root .hmi-frame.hmi-tone-fixed .hmi-detail { stroke: var(--hmi-tone-stroke); }
.hmi-root .hmi-frame.hmi-tone-guard .hmi-body { fill: none; stroke-dasharray: 8 5; stroke-width: 2; }
.hmi-root .hmi-left { text-anchor: start; }
.hmi-root .hmi-right { text-anchor: end; }
.hmi-root .hmi-conveyor .hmi-body, .hmi-root .hmi-cylinder .hmi-body, .hmi-root .hmi-heater .hmi-body, .hmi-root .hmi-sensor .hmi-body { fill: var(--hmi-equip); stroke: var(--hmi-stroke); stroke-width: 1.5; }
.hmi-root .hmi-on.hmi-conveyor .hmi-body, .hmi-root .hmi-on.hmi-cylinder .hmi-body, .hmi-root .hmi-on.hmi-heater .hmi-body, .hmi-root .hmi-on.hmi-sensor .hmi-body { fill: var(--hmi-equip-on); }
.hmi-root .hmi-unknown.hmi-conveyor .hmi-body, .hmi-root .hmi-unknown.hmi-cylinder .hmi-body, .hmi-root .hmi-unknown.hmi-heater .hmi-body, .hmi-root .hmi-unknown.hmi-sensor .hmi-body, .hmi-root .hmi-unknown.hmi-fan .hmi-body, .hmi-root .hmi-unknown.hmi-knife .hmi-body { stroke-dasharray: 5 3; }
.hmi-root .hmi-fault .hmi-body { stroke: var(--hmi-alarm) !important; stroke-width: 3 !important; }
.hmi-root .hmi-pulley { fill: var(--hmi-tag-bg); stroke: var(--hmi-stroke); stroke-width: 1.5; }
.hmi-root .hmi-idler { fill: var(--hmi-dark); stroke: var(--hmi-stroke); stroke-width: 1; }
.hmi-root .hmi-belt { fill: none; stroke: var(--hmi-material); stroke-width: 2; stroke-dasharray: 10 6; }
.hmi-root .hmi-dir { fill: var(--hmi-tag-bg); stroke: var(--hmi-stroke); stroke-width: 1; }
.hmi-root.hmi-theme-classic .hmi-conveyor.hmi-on.hmi-fwd .hmi-belt { animation: hmi-belt 0.8s linear infinite; }
.hmi-root.hmi-theme-classic .hmi-conveyor.hmi-on.hmi-rev .hmi-belt { animation: hmi-belt 0.8s linear infinite reverse; }
.hmi-root .hmi-rod { fill: var(--hmi-tag-bg); stroke: var(--hmi-stroke); stroke-width: 1; }
.hmi-root .hmi-rod-end { fill: var(--hmi-dark); stroke: var(--hmi-stroke); stroke-width: 1; }
.hmi-root .hmi-fan .hmi-body { fill: var(--hmi-tag-bg); stroke: var(--hmi-stroke); stroke-width: 2; }
.hmi-root .hmi-fan .hmi-blade { fill: var(--hmi-equip); stroke: var(--hmi-stroke); stroke-width: 1; }
.hmi-root .hmi-fan.hmi-on .hmi-blade { fill: var(--hmi-equip-on); }
.hmi-root .hmi-fan .hmi-hub, .hmi-root .hmi-knife .hmi-hub { fill: var(--hmi-dark); stroke: var(--hmi-stroke); stroke-width: 1; }
.hmi-root .hmi-knife .hmi-body { fill: var(--hmi-equip); stroke: var(--hmi-stroke); stroke-width: 1.5; }
.hmi-root .hmi-knife.hmi-on .hmi-body { fill: var(--hmi-equip-on); }
.hmi-root .hmi-knife .hmi-edge { fill: none; stroke: var(--hmi-tag-bg); stroke-width: 1.5; }
.hmi-root .hmi-fan .hmi-spin, .hmi-root .hmi-knife .hmi-spin { transform-box: view-box; transform-origin: 0 0; }
.hmi-root.hmi-theme-classic .hmi-fan.hmi-on .hmi-spin { animation: hmi-spin 0.9s linear infinite; }
.hmi-root.hmi-theme-classic .hmi-knife.hmi-on .hmi-spin { animation: hmi-spin 0.5s linear infinite; }
.hmi-root .hmi-coil { fill: none; stroke: var(--hmi-stroke); stroke-width: 2; stroke-linejoin: round; }
.hmi-root .hmi-heater.hmi-on .hmi-coil { stroke: var(--hmi-tag-bg); }
.hmi-root.hmi-theme-classic .hmi-heater.hmi-on .hmi-coil { stroke: var(--hmi-warn); }
.hmi-root .hmi-lens { fill: var(--hmi-tag-bg); stroke: var(--hmi-stroke); stroke-width: 1; }
.hmi-root .hmi-beam { fill: none; stroke: var(--hmi-line); stroke-width: 1.5; stroke-dasharray: 3 3; }
.hmi-root .hmi-sensor.hmi-on .hmi-beam { stroke: var(--hmi-equip-on); stroke-dasharray: none; stroke-width: 2.5; }
.hmi-root.hmi-theme-classic .hmi-sensor.hmi-on .hmi-lens { fill: var(--hmi-ok); }
.hmi-root .hmi-lever { stroke: var(--hmi-stroke); stroke-width: 2.5; stroke-linecap: round; }
.hmi-root .hmi-gauge-track { fill: none; stroke: var(--hmi-bg); stroke-width: 8; }
.hmi-root .hmi-gauge-normal { fill: none; stroke: var(--hmi-line); stroke-width: 8; }
.hmi-root .hmi-needle { stroke: var(--hmi-text); stroke-width: 2.5; stroke-linecap: round; }
.hmi-root .hmi-gauge.hmi-alarm .hmi-needle { stroke: var(--hmi-alarm); }
.hmi-root .hmi-gauge.hmi-alarm .hmi-tag-box, .hmi-root .hmi-trend.hmi-alarm .hmi-tag-box { stroke: var(--hmi-alarm); stroke-width: 2; }
.hmi-root .hmi-gauge.hmi-alarm .hmi-tag-value, .hmi-root .hmi-vbar.hmi-alarm .hmi-tag-value { fill: var(--hmi-alarm); }
.hmi-root .hmi-gauge-hub { fill: var(--hmi-text); }
.hmi-root .hmi-vbar-track { fill: var(--hmi-tag-bg); stroke: var(--hmi-line); stroke-width: 1; }
.hmi-root .hmi-vbar-fill { fill: var(--hmi-level); }
.hmi-root .hmi-vbar.hmi-alarm .hmi-vbar-fill { fill: var(--hmi-alarm); }
.hmi-root .hmi-vbar-limit { stroke: var(--hmi-text-dim); stroke-width: 1.5; }
.hmi-root .hmi-trend-grid { stroke: var(--hmi-bg); stroke-width: 1; }
.hmi-root .hmi-trend-line { fill: none; stroke: var(--hmi-info); stroke-width: 2; stroke-linejoin: round; }
.hmi-root .hmi-lamp { fill: var(--hmi-tag-bg); stroke: var(--hmi-stroke); stroke-width: 1; opacity: .9; }
.hmi-root .hmi-lamp-alarm.hmi-on { fill: var(--hmi-alarm); }
.hmi-root .hmi-lamp-warn.hmi-on { fill: var(--hmi-warn); }
.hmi-root .hmi-lamp-ok.hmi-on { fill: #2e9d4f; }
.hmi-root .hmi-lamp-info.hmi-on { fill: var(--hmi-info); }
.hmi-root .hmi-stack-pole, .hmi-root .hmi-stack-base { fill: var(--hmi-dark); stroke: var(--hmi-stroke); stroke-width: 1; }
.hmi-root .hmi-switch-track { fill: var(--hmi-tag-bg); stroke: var(--hmi-stroke); stroke-width: 1.5; }
.hmi-root .hmi-switch.hmi-on .hmi-switch-track { fill: var(--hmi-equip-on); }
.hmi-root .hmi-switch-knob { fill: var(--hmi-equip); stroke: var(--hmi-stroke); stroke-width: 1.5; }
.hmi-root .hmi-switch-text { fill: var(--hmi-text); font-weight: 700; dominant-baseline: central; }
.hmi-root .hmi-switch.hmi-on .hmi-switch-text { fill: var(--hmi-tag-bg); }
.hmi-root.hmi-theme-classic .hmi-switch.hmi-on .hmi-switch-text { fill: var(--hmi-text); }
.hmi-root .hmi-setpoint-box { fill: var(--hmi-tag-bg); stroke: var(--hmi-info); stroke-width: 1.5; }
.hmi-root .hmi-pencil { fill: var(--hmi-info); }
.hmi-root .hmi-img-box { fill: none; stroke: var(--hmi-line); stroke-width: 1.5; stroke-dasharray: 6 4; }
.hmi-root .hmi-img-icon { fill: var(--hmi-line); }
.hmi-root .hmi-rule-hidden { opacity: .25; }
.hmi-root .hmi-rule-blink { animation: hmi-blink 1s steps(2) infinite; }
.hmi-root .hmi-rule-dim { opacity: .35; }
.hmi-root .hmi-rule-alarm :is(.hmi-body, .hmi-tag-box, .hmi-chip-box, .hmi-button-box, .hmi-setpoint-box, .hmi-switch-track, .hmi-kpi-card, .hmi-blade, .hmi-dot, .hmi-level, .hmi-vbar-fill, .hmi-mode-box, .hmi-lock-body, .hmi-perm-ring, .hmi-arrow-body, .hmi-fit-fill) { fill: var(--hmi-alarm) !important; }
.hmi-root .hmi-rule-warn :is(.hmi-body, .hmi-tag-box, .hmi-chip-box, .hmi-button-box, .hmi-setpoint-box, .hmi-switch-track, .hmi-kpi-card, .hmi-blade, .hmi-dot, .hmi-level, .hmi-vbar-fill, .hmi-mode-box, .hmi-lock-body, .hmi-perm-ring, .hmi-arrow-body, .hmi-fit-fill) { fill: var(--hmi-warn) !important; }
.hmi-root .hmi-rule-info :is(.hmi-body, .hmi-tag-box, .hmi-chip-box, .hmi-button-box, .hmi-setpoint-box, .hmi-switch-track, .hmi-kpi-card, .hmi-blade, .hmi-dot, .hmi-level, .hmi-vbar-fill, .hmi-mode-box, .hmi-lock-body, .hmi-perm-ring, .hmi-arrow-body, .hmi-fit-fill) { fill: var(--hmi-info) !important; }
.hmi-root .hmi-rule-ok :is(.hmi-body, .hmi-tag-box, .hmi-chip-box, .hmi-button-box, .hmi-setpoint-box, .hmi-switch-track, .hmi-kpi-card, .hmi-blade, .hmi-dot, .hmi-level, .hmi-vbar-fill, .hmi-mode-box, .hmi-lock-body, .hmi-perm-ring, .hmi-arrow-body, .hmi-fit-fill) { fill: #2e9d4f !important; }
.hmi-root .hmi-rule-alarm :is(.hmi-path, .hmi-fit-pipe) { stroke: var(--hmi-alarm) !important; }
.hmi-root .hmi-rule-warn :is(.hmi-path, .hmi-fit-pipe) { stroke: var(--hmi-warn) !important; }
.hmi-root .hmi-rule-info :is(.hmi-path, .hmi-fit-pipe) { stroke: var(--hmi-info) !important; }
.hmi-root .hmi-rule-ok :is(.hmi-path, .hmi-fit-pipe) { stroke: #2e9d4f !important; }
.hmi-root .hmi-rule-alarm .hmi-text text { fill: var(--hmi-alarm); }
.hmi-root .hmi-rule-warn .hmi-text text { fill: var(--hmi-warn); }
.hmi-root .hmi-rule-info .hmi-text text { fill: var(--hmi-info); }
.hmi-root .hmi-rule-ok .hmi-text text { fill: #2e9d4f; }
.hmi-root .hmi-clickable { cursor: pointer; touch-action: none; }
.hmi-root .hmi-clickable:active .hmi-button-box { filter: brightness(.85); }
.hmi-root .hmi-pressed .hmi-button-box { filter: brightness(.8); }
.hmi-root .hmi-motor-m { fill: var(--hmi-text); font-weight: 700; dominant-baseline: central; }
.hmi-root .hmi-motor.hmi-on .hmi-motor-m { fill: var(--hmi-tag-bg); }
.hmi-root.hmi-theme-classic .hmi-motor.hmi-on .hmi-motor-m { fill: var(--hmi-ok); }
.hmi-root .hmi-frame .hmi-body { fill: var(--hmi-equip); stroke: var(--hmi-stroke); stroke-width: 1.5; }
.hmi-root .hmi-frame.hmi-tone-dark .hmi-body { fill: var(--hmi-dark); }
.hmi-root .hmi-frame.hmi-tone-pit .hmi-body { fill: var(--hmi-pit); }
.hmi-root .hmi-line path { fill: none; stroke-linecap: round; stroke-linejoin: round; }
.hmi-root .hmi-line .hmi-hit { stroke: transparent; stroke-width: 16; }
.hmi-root .hmi-line .hmi-path { stroke: var(--hmi-material); stroke-width: 3.5; }
.hmi-root .hmi-line.hmi-ls-pipe .hmi-path { stroke: var(--hmi-line); stroke-width: 8; }
.hmi-root .hmi-line.hmi-ls-conveyor .hmi-path { stroke: var(--hmi-stroke); stroke-width: 6; stroke-dasharray: 2 6; stroke-linecap: butt; }
.hmi-root .hmi-line.hmi-ls-signal .hmi-path { stroke: var(--hmi-line); stroke-width: 1.5; stroke-dasharray: 6 4; }
.hmi-root .hmi-line.hmi-ls-pipe.hmi-on .hmi-path { stroke: var(--hmi-equip-on); }
.hmi-root .hmi-line .hmi-flowpath { stroke: var(--hmi-bg); stroke-width: 1.6; stroke-dasharray: 3 21; opacity: 0; }
.hmi-root.hmi-theme-classic .hmi-line.hmi-on.hmi-flow-auto .hmi-flowpath, .hmi-root .hmi-line.hmi-on.hmi-flow-always .hmi-flowpath { opacity: .85; animation: hmi-flow .8s linear infinite; }
.hmi-root .hmi-kpi-card { fill: var(--hmi-tag-bg); stroke: var(--hmi-line); stroke-width: 1; }
.hmi-root .hmi-kpi text { text-anchor: start; }
.hmi-root .hmi-kpi-title { fill: var(--hmi-text-dim); font-weight: 700; letter-spacing: .5px; }
.hmi-root .hmi-kpi-value { fill: var(--hmi-text); font-weight: 800; font-family: Consolas, "Roboto Mono", monospace; dominant-baseline: central; }
.hmi-root .hmi-kpi-sub { fill: var(--hmi-text-dim); }
.hmi-root .hmi-text text { fill: var(--hmi-text); dominant-baseline: central; }
.hmi-root .hmi-text.hmi-tone-dim text { fill: var(--hmi-text-dim); }
.hmi-root .hmi-hitbox { fill: transparent; }
.hmi-root .hmi-dot { fill: var(--hmi-tag-bg); stroke: var(--hmi-stroke); stroke-width: 1.5; }
.hmi-root .hmi-on.hmi-c-auto .hmi-dot { fill: var(--hmi-ok); }
.hmi-root .hmi-on.hmi-c-alarm .hmi-dot { fill: var(--hmi-alarm); }
.hmi-root .hmi-on.hmi-c-warn .hmi-dot { fill: var(--hmi-warn); }
.hmi-root .hmi-on.hmi-c-info .hmi-dot { fill: var(--hmi-info); }
.hmi-root .hmi-unknown .hmi-dot { stroke-dasharray: 3 2; }
.hmi-root .hmi-chip-box { fill: var(--hmi-tag-bg); stroke: var(--hmi-line); stroke-width: 1; }
.hmi-root .hmi-chip.hmi-on.hmi-c-alarm .hmi-chip-box { stroke: var(--hmi-alarm); stroke-width: 2; }
.hmi-root .hmi-chip-text { fill: var(--hmi-text); font-weight: 700; text-anchor: start; dominant-baseline: central; }
.hmi-root .hmi-alarm-box { stroke-width: 3; }
.hmi-root .hmi-alarm-banner.hmi-p1 .hmi-alarm-box { fill: var(--hmi-alarm); stroke: #000; }
.hmi-root .hmi-alarm-banner.hmi-p2 .hmi-alarm-box { fill: var(--hmi-warn); stroke: #000; }
.hmi-root .hmi-alarm-banner.hmi-p3 .hmi-alarm-box { fill: var(--hmi-low); stroke: #000; }
.hmi-root .hmi-alarm-banner .hmi-alarm-ind > rect, .hmi-root .hmi-alarm-banner .hmi-alarm-ind > polygon { stroke: #fff; stroke-width: 2; }
.hmi-root .hmi-alarm-text { fill: #fff; font-weight: 800; dominant-baseline: central; }
.hmi-root .hmi-alarm-banner.hmi-p2 .hmi-alarm-text, .hmi-root .hmi-alarm-banner.hmi-p2 .hmi-alarm-sub { fill: #000; }
.hmi-root .hmi-alarm-sub { fill: #fff; font-weight: 600; dominant-baseline: central; }
.hmi-root .hmi-ghost { opacity: .25; }
.hmi-root .hmi-ghost .hmi-alarm-box { stroke-dasharray: 8 6; }
@keyframes hmi-belt { to { stroke-dashoffset: -16; } }
@keyframes hmi-spin { to { transform: rotate(360deg); } }
@keyframes hmi-spin-ccw { to { transform: rotate(-360deg); } }
@keyframes hmi-flow { to { stroke-dashoffset: -24; } }
@keyframes hmi-blink { 50% { opacity: .35; } }
` + MORE_CSS

// second batch of symbols, built from the helpers above
Object.assign(SYMBOLS, moreSymbols({ f, num, escapeXml, isOn, onState, formatValue, rangeState, alarmIndicator, stateClass, labelBelow, faultOf, faultMark, faultClass, scaleOf, ON_FIELDS, INVERT_FIELD, FAULT_FIELD, PRIORITY_FIELD }))

export function injectStyles (doc) {
    const d = doc || (typeof document !== 'undefined' ? document : null)
    if (!d || d.getElementById(STYLE_ID)) return
    const el = d.createElement('style')
    el.id = STYLE_ID
    el.textContent = CSS
    d.head.appendChild(el)
}
