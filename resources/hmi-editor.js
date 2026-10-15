var HmiEditor = (function(exports) {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	//#region ui/symbols/index.js
	var THEMES = {
		isa101: "ISA-101",
		classic: "Clássico"
	};
	var ON_FIELDS = [
		{
			key: "onWhen",
			label: "Ligado quando",
			type: "select",
			options: [["nonzero", "valor ≠ 0 / true"], ["gt", "valor > limite"]]
		},
		{
			key: "threshold",
			label: "Limite",
			type: "number"
		},
		{
			key: "invert",
			label: "Inverter sinal",
			type: "select",
			options: [["no", "Não"], ["yes", "Sim (lógica invertida / NF)"]]
		}
	];
	var INVERT_FIELD = ON_FIELDS[2];
	var COLOR_FIELD = {
		key: "color",
		label: "Cor quando ligado",
		type: "select",
		options: [
			["auto", "Do tema"],
			["alarm", "Alarme (vermelho)"],
			["warn", "Atenção (amarelo)"],
			["info", "Informação (azul)"]
		]
	};
	var BLINK_FIELD = {
		key: "blink",
		label: "Piscar quando ligado",
		type: "select",
		options: [["no", "Não"], ["yes", "Sim"]]
	};
	var SHAPES = [
		[
			"rect",
			"Retângulo",
			200,
			140
		],
		[
			"round",
			"Cantos redondos",
			200,
			140
		],
		[
			"chamfer",
			"Chanfrado em cima",
			240,
			300
		],
		[
			"chamferAll",
			"Chanfrado nos cantos",
			200,
			140
		],
		[
			"arcLeft",
			"Curva à esquerda",
			200,
			200
		],
		[
			"arcRight",
			"Curva à direita",
			200,
			200
		],
		[
			"archTop",
			"Arco em cima",
			160,
			220
		],
		[
			"pill",
			"Cápsula / tanque deitado",
			260,
			90
		],
		[
			"circle",
			"Círculo / elipse",
			140,
			140
		],
		[
			"triangle",
			"Triângulo",
			160,
			140
		],
		[
			"trapezoid",
			"Trapézio",
			220,
			120
		],
		[
			"base",
			"Base / pé",
			260,
			40
		],
		[
			"hopper",
			"Funil",
			160,
			200
		],
		[
			"silo",
			"Silo",
			140,
			260
		],
		[
			"hexagon",
			"Hexágono",
			180,
			120
		],
		[
			"diamond",
			"Losango",
			120,
			120
		],
		[
			"parallelogram",
			"Paralelogramo",
			200,
			100
		],
		[
			"lShape",
			"Em L",
			200,
			200
		],
		[
			"uShape",
			"Em U",
			240,
			160
		],
		[
			"cabinet",
			"Painel elétrico",
			140,
			220
		],
		[
			"rect",
			"Proteção (tracejado)",
			300,
			200,
			"guard"
		],
		[
			"rect",
			"Fosso",
			300,
			80,
			"pit"
		],
		[
			"chamfer",
			"Corpo metal (slitter)",
			240,
			300,
			"metal"
		],
		[
			"rect",
			"Base aço (slitter)",
			300,
			60,
			"steel"
		],
		[
			"rect",
			"Fosso fundo (slitter)",
			170,
			140,
			"pitDeep"
		],
		[
			"rect",
			"Piso (slitter)",
			600,
			80,
			"floor"
		],
		[
			"beamSide",
			"Viga (vista lateral)",
			400,
			30,
			"",
			"Estruturas"
		],
		[
			"beamI",
			"Viga I (perfil)",
			80,
			100,
			"",
			"Estruturas"
		],
		[
			"channel",
			"Perfil U (perfil)",
			70,
			100,
			"",
			"Estruturas"
		],
		[
			"angle",
			"Cantoneira (perfil)",
			80,
			80,
			"",
			"Estruturas"
		],
		[
			"truss",
			"Viga treliçada",
			400,
			60,
			"",
			"Estruturas"
		],
		[
			"tube",
			"Tubo / eixo",
			300,
			24,
			"",
			"Estruturas"
		],
		[
			"column",
			"Coluna com chapas",
			40,
			300,
			"",
			"Estruturas"
		],
		[
			"pedestal",
			"Pedestal",
			120,
			140,
			"",
			"Estruturas"
		],
		[
			"bearing",
			"Pedestal com mancal",
			120,
			160,
			"",
			"Estruturas"
		],
		[
			"bracket",
			"Mão-francesa",
			120,
			120,
			"",
			"Estruturas"
		],
		[
			"aFrame",
			"Cavalete",
			200,
			140,
			"",
			"Estruturas"
		],
		[
			"stand",
			"Suporte com pés",
			240,
			120,
			"",
			"Estruturas"
		],
		[
			"basePlate",
			"Chapa de base / sapata",
			160,
			24,
			"",
			"Estruturas"
		],
		[
			"beamSide",
			"Viga aço (slitter)",
			400,
			30,
			"steel",
			"Estruturas"
		],
		[
			"pedestal",
			"Pedestal metal (slitter)",
			120,
			140,
			"metal",
			"Estruturas"
		]
	];
	var TONES = [
		["equip", "Equipamento (tema)"],
		["dark", "Escuro (tema)"],
		["pit", "Fosso / vazio (tema)"],
		["outline", "Só contorno"],
		["guard", "Proteção (tracejado)"],
		["metal", "Metal (slitter)"],
		["metalLight", "Metal, borda clara (slitter)"],
		["steel", "Aço escuro (slitter)"],
		["graphite", "Grafite / rolo (slitter)"],
		["pitDeep", "Fosso fundo (slitter)"],
		["wall", "Parede (slitter)"],
		["floor", "Piso (slitter)"],
		["floorDark", "Piso escuro (slitter)"],
		["sensorTone", "Sensor (slitter)"],
		["custom", "Cor personalizada"]
	];
	var TONE_COLORS = {
		metal: [["#6a737d", "#4d555e"], "#8a939d"],
		metalLight: [["#6a737d", "#4d555e"], "#b5bfc8"],
		steel: ["#3a4148", "#7a838c"],
		graphite: ["#2f353b", "#a5b0ba"],
		pitDeep: [["#1d2126", "#15181b"], "#3a4148"],
		wall: ["#3a4148", "#5a626b"],
		floor: ["#24282e", "none"],
		floorDark: ["#1f2328", "none"],
		sensorTone: ["#59616b", "#8a939d"]
	};
	var HEX = /^#[0-9a-fA-F]{3,8}$/;
	var FAULT_FIELD = {
		key: "faultKey",
		label: "Chave da falha (opcional)",
		type: "text"
	};
	var PRIORITY_FIELD = {
		key: "priority",
		label: "Prioridade do alarme",
		type: "select",
		options: [
			["1", "1 (alta)"],
			["2", "2 (média)"],
			["3", "3 (baixa)"]
		]
	};
	var SCALE_FIELDS = [
		{
			key: "title",
			label: "Título",
			type: "text"
		},
		{
			key: "unit",
			label: "Unidade",
			type: "text"
		},
		{
			key: "decimals",
			label: "Casas decimais",
			type: "number"
		},
		{
			key: "min",
			label: "Mínimo da escala",
			type: "number"
		},
		{
			key: "max",
			label: "Máximo da escala",
			type: "number"
		},
		{
			key: "lo",
			label: "Alarme abaixo de",
			type: "number"
		},
		{
			key: "hi",
			label: "Alarme acima de",
			type: "number"
		},
		PRIORITY_FIELD
	];
	var SYMBOLS = {
		reel: {
			label: "Bobina",
			group: "Equipamentos",
			w: 160,
			h: 160,
			preview: 1450,
			defaults: {
				label: "",
				onWhen: "nonzero",
				threshold: 0
			},
			fields: [{
				key: "label",
				label: "Legenda",
				type: "text"
			}, ...ON_FIELDS],
			render: renderReel
		},
		roller: {
			label: "Rolo",
			group: "Equipamentos",
			w: 24,
			h: 24,
			preview: 1,
			defaults: {
				onWhen: "nonzero",
				threshold: 0,
				dir: "cw"
			},
			fields: [...ON_FIELDS, {
				key: "dir",
				label: "Sentido",
				type: "select",
				options: [["cw", "Horário"], ["ccw", "Anti-horário"]]
			}],
			render: renderRoller
		},
		motor: {
			label: "Motor",
			group: "Equipamentos",
			w: 70,
			h: 70,
			preview: 1,
			defaults: {
				label: "",
				onWhen: "nonzero",
				threshold: 0,
				faultKey: "",
				priority: "1"
			},
			fields: [
				{
					key: "label",
					label: "Legenda",
					type: "text"
				},
				...ON_FIELDS,
				{
					key: "faultKey",
					label: "Chave da falha (opcional)",
					type: "text"
				},
				PRIORITY_FIELD
			],
			render: renderMotor
		},
		valve: {
			label: "Válvula",
			group: "Equipamentos",
			w: 60,
			h: 50,
			preview: 1,
			defaults: {
				label: "",
				onWhen: "nonzero",
				threshold: 0,
				faultKey: "",
				priority: "1"
			},
			fields: [
				{
					key: "label",
					label: "Legenda",
					type: "text"
				},
				...ON_FIELDS,
				{
					key: "faultKey",
					label: "Chave da falha (opcional)",
					type: "text"
				},
				PRIORITY_FIELD
			],
			render: renderValve
		},
		pump: {
			label: "Bomba",
			group: "Equipamentos",
			w: 60,
			h: 60,
			preview: 1,
			defaults: {
				label: "",
				onWhen: "nonzero",
				threshold: 0,
				faultKey: "",
				priority: "1"
			},
			fields: [
				{
					key: "label",
					label: "Legenda",
					type: "text"
				},
				...ON_FIELDS,
				{
					key: "faultKey",
					label: "Chave da falha (opcional)",
					type: "text"
				},
				PRIORITY_FIELD
			],
			render: renderPump
		},
		tank: {
			label: "Tanque",
			group: "Equipamentos",
			w: 100,
			h: 160,
			preview: 65,
			defaults: {
				label: "",
				unit: "%",
				decimals: 0,
				min: 0,
				max: 100,
				lo: "",
				hi: "",
				priority: "2"
			},
			fields: [
				{
					key: "label",
					label: "Legenda",
					type: "text"
				},
				{
					key: "unit",
					label: "Unidade",
					type: "text"
				},
				{
					key: "decimals",
					label: "Casas decimais",
					type: "number"
				},
				{
					key: "min",
					label: "Vazio (mín.)",
					type: "number"
				},
				{
					key: "max",
					label: "Cheio (máx.)",
					type: "number"
				},
				{
					key: "lo",
					label: "Alarme abaixo de",
					type: "number"
				},
				{
					key: "hi",
					label: "Alarme acima de",
					type: "number"
				},
				PRIORITY_FIELD
			],
			render: renderTank
		},
		frame: {
			label: "Corpo",
			group: "Formas",
			w: 240,
			h: 300,
			preview: void 0,
			defaults: {
				shape: "chamfer",
				tone: "equip",
				label: ""
			},
			fields: [
				{
					key: "shape",
					label: "Forma",
					type: "select",
					options: SHAPES.filter(([k], i) => SHAPES.findIndex((x) => x[0] === k) === i).map(([k, l]) => [k, l])
				},
				{
					key: "tone",
					label: "Tom",
					type: "select",
					options: TONES,
					refresh: true
				},
				{
					key: "fill",
					label: "Cor de preenchimento",
					type: "color",
					when: (p) => p.tone === "custom"
				},
				{
					key: "stroke",
					label: "Cor da borda",
					type: "color",
					when: (p) => p.tone === "custom"
				},
				{
					key: "label",
					label: "Legenda",
					type: "text"
				}
			],
			variants: SHAPES.map(([shape, label, w, h, tone, group]) => ({
				label,
				w,
				h,
				category: group,
				props: {
					shape,
					tone: tone || "equip"
				}
			})),
			render: renderFrame
		},
		line: {
			label: "Linha",
			group: "Linhas",
			variants: [
				{
					label: "Material / chapa",
					props: { style: "strip" }
				},
				{
					label: "Tubulação",
					props: { style: "pipe" }
				},
				{
					label: "Esteira",
					props: { style: "conveyor" }
				},
				{
					label: "Sinal / ligação",
					props: { style: "signal" }
				}
			],
			w: 200,
			h: 1,
			preview: 1,
			line: true,
			defaults: {
				style: "strip",
				onWhen: "nonzero",
				threshold: 0,
				flow: "auto",
				points: [[0, 0], [200, 0]]
			},
			fields: [
				{
					key: "style",
					label: "Tipo",
					type: "select",
					options: [
						["strip", "Chapa / material"],
						["pipe", "Tubulação"],
						["conveyor", "Esteira"],
						["signal", "Sinal / ligação"]
					]
				},
				...ON_FIELDS,
				{
					key: "flow",
					label: "Animar fluxo",
					type: "select",
					options: [
						["auto", "Só no tema Clássico"],
						["always", "Sempre"],
						["never", "Nunca"]
					]
				}
			],
			render: renderLine
		},
		tag: {
			label: "Tag",
			group: "Valores",
			w: 160,
			h: 64,
			preview: 42.5,
			defaults: {
				title: "TAG",
				unit: "",
				decimals: 1,
				min: "",
				max: "",
				lo: "",
				hi: "",
				priority: "2"
			},
			fields: [
				{
					key: "title",
					label: "Título",
					type: "text"
				},
				{
					key: "unit",
					label: "Unidade",
					type: "text"
				},
				{
					key: "decimals",
					label: "Casas decimais",
					type: "number"
				},
				{
					key: "min",
					label: "Escala mín.",
					type: "number"
				},
				{
					key: "max",
					label: "Escala máx.",
					type: "number"
				},
				{
					key: "lo",
					label: "Normal de",
					type: "number"
				},
				{
					key: "hi",
					label: "Normal até",
					type: "number"
				},
				PRIORITY_FIELD
			],
			render: renderTag
		},
		kpi: {
			label: "KPI",
			group: "Valores",
			w: 300,
			h: 140,
			preview: 7,
			defaults: {
				title: "BOBINAS PRONTAS",
				unit: "",
				decimals: 0,
				subtitle: ""
			},
			fields: [
				{
					key: "title",
					label: "Título",
					type: "text"
				},
				{
					key: "unit",
					label: "Unidade",
					type: "text"
				},
				{
					key: "decimals",
					label: "Casas decimais",
					type: "number"
				},
				{
					key: "subtitle",
					label: "Subtítulo",
					type: "text"
				}
			],
			render: renderKpi
		},
		text: {
			label: "Texto",
			group: "Valores",
			w: 220,
			h: 30,
			preview: void 0,
			defaults: {
				text: "Texto",
				size: 16,
				align: "middle",
				bold: "no",
				tone: "normal",
				unit: "",
				decimals: ""
			},
			fields: [
				{
					key: "text",
					label: "Texto (antes do valor, se tiver chave)",
					type: "text"
				},
				{
					key: "size",
					label: "Tamanho",
					type: "number"
				},
				{
					key: "align",
					label: "Alinhamento",
					type: "select",
					options: [
						["start", "Esquerda"],
						["middle", "Centro"],
						["end", "Direita"]
					]
				},
				{
					key: "bold",
					label: "Negrito",
					type: "select",
					options: [["no", "Não"], ["yes", "Sim"]]
				},
				{
					key: "tone",
					label: "Cor",
					type: "select",
					options: [["normal", "Normal"], ["dim", "Discreta"]]
				},
				{
					key: "unit",
					label: "Unidade",
					type: "text"
				},
				{
					key: "decimals",
					label: "Casas decimais",
					type: "number"
				}
			],
			render: renderText
		},
		led: {
			label: "LED",
			group: "Estados",
			w: 28,
			h: 28,
			preview: true,
			defaults: {
				label: "",
				onWhen: "nonzero",
				threshold: 0,
				color: "auto",
				blink: "no"
			},
			fields: [
				{
					key: "label",
					label: "Legenda",
					type: "text"
				},
				...ON_FIELDS,
				COLOR_FIELD,
				BLINK_FIELD
			],
			render: renderLed
		},
		chip: {
			label: "Status",
			group: "Estados",
			w: 180,
			h: 34,
			preview: true,
			defaults: {
				textOn: "LIGADO",
				textOff: "DESLIGADO",
				onWhen: "nonzero",
				threshold: 0,
				color: "auto",
				blink: "no"
			},
			fields: [
				{
					key: "textOn",
					label: "Texto ligado",
					type: "text"
				},
				{
					key: "textOff",
					label: "Texto desligado",
					type: "text"
				},
				...ON_FIELDS,
				COLOR_FIELD,
				BLINK_FIELD
			],
			render: renderChip
		},
		alarm: {
			label: "Alarme",
			group: "Estados",
			w: 600,
			h: 96,
			preview: true,
			defaults: {
				text: "EMERGÊNCIA ACIONADA",
				sub: "",
				onWhen: "nonzero",
				threshold: 0,
				priority: "1",
				blink: "yes"
			},
			fields: [
				{
					key: "text",
					label: "Texto",
					type: "text"
				},
				{
					key: "sub",
					label: "Texto menor",
					type: "text"
				},
				...ON_FIELDS,
				PRIORITY_FIELD,
				BLINK_FIELD
			],
			render: renderAlarm
		},
		button: {
			label: "Botão",
			group: "Comandos",
			w: 140,
			h: 44,
			preview: 0,
			defaults: {
				text: "LIGAR",
				textOn: "",
				onWhen: "nonzero",
				threshold: 0
			},
			action: {
				mode: "pulse",
				value: "",
				topic: "",
				confirm: "no"
			},
			fields: [
				{
					key: "text",
					label: "Texto",
					type: "text"
				},
				{
					key: "textOn",
					label: "Texto quando ligado (opcional)",
					type: "text"
				},
				...ON_FIELDS
			],
			render: renderButton
		},
		image: {
			label: "Imagem (SVG / PNG)",
			group: "Formas",
			w: 160,
			h: 120,
			preview: void 0,
			image: true,
			defaults: {
				src: "",
				srcOn: "",
				fit: "meet",
				onWhen: "nonzero",
				threshold: 0,
				label: ""
			},
			fields: [
				{
					key: "fit",
					label: "Ajuste",
					type: "select",
					options: [
						["meet", "Caber inteira"],
						["slice", "Preencher (corta)"],
						["stretch", "Esticar"]
					]
				},
				{
					key: "label",
					label: "Legenda",
					type: "text"
				},
				...ON_FIELDS
			],
			render: renderImage
		},
		conveyor: {
			label: "Esteira",
			group: "Equipamentos",
			w: 240,
			h: 50,
			preview: 1,
			defaults: {
				label: "",
				onWhen: "nonzero",
				threshold: 0,
				dir: "fwd",
				faultKey: "",
				priority: "1"
			},
			fields: [
				{
					key: "label",
					label: "Legenda",
					type: "text"
				},
				...ON_FIELDS,
				{
					key: "dir",
					label: "Sentido",
					type: "select",
					options: [["fwd", "Para a direita"], ["rev", "Para a esquerda"]]
				},
				FAULT_FIELD,
				PRIORITY_FIELD
			],
			render: renderConveyor
		},
		cylinder: {
			label: "Cilindro",
			group: "Equipamentos",
			w: 160,
			h: 40,
			preview: 1,
			defaults: {
				label: "",
				onWhen: "nonzero",
				threshold: 0
			},
			fields: [
				{
					key: "label",
					label: "Legenda",
					type: "text"
				},
				{
					key: "onWhen",
					label: "Avançado quando",
					type: "select",
					options: ON_FIELDS[0].options
				},
				ON_FIELDS[1],
				INVERT_FIELD
			],
			render: renderCylinder
		},
		fan: {
			label: "Ventilador",
			group: "Equipamentos",
			w: 70,
			h: 70,
			preview: 1,
			defaults: {
				label: "",
				onWhen: "nonzero",
				threshold: 0,
				faultKey: "",
				priority: "1"
			},
			fields: [
				{
					key: "label",
					label: "Legenda",
					type: "text"
				},
				...ON_FIELDS,
				FAULT_FIELD,
				PRIORITY_FIELD
			],
			render: renderFan
		},
		knife: {
			label: "Faca circular",
			group: "Equipamentos",
			w: 60,
			h: 60,
			preview: 1,
			defaults: {
				label: "",
				onWhen: "nonzero",
				threshold: 0
			},
			fields: [{
				key: "label",
				label: "Legenda",
				type: "text"
			}, ...ON_FIELDS],
			render: renderKnife
		},
		heater: {
			label: "Resistência",
			group: "Equipamentos",
			w: 90,
			h: 44,
			preview: 1,
			defaults: {
				label: "",
				onWhen: "nonzero",
				threshold: 0,
				faultKey: "",
				priority: "1"
			},
			fields: [
				{
					key: "label",
					label: "Legenda",
					type: "text"
				},
				...ON_FIELDS,
				FAULT_FIELD,
				PRIORITY_FIELD
			],
			render: renderHeater
		},
		sensor: {
			label: "Sensor",
			group: "Equipamentos",
			w: 44,
			h: 44,
			preview: 1,
			defaults: {
				label: "",
				kind: "photo",
				onWhen: "nonzero",
				threshold: 0
			},
			fields: [
				{
					key: "label",
					label: "Legenda",
					type: "text"
				},
				{
					key: "kind",
					label: "Tipo",
					type: "select",
					options: [
						["photo", "Fotoelétrico"],
						["prox", "Indutivo / proximidade"],
						["limit", "Fim de curso"]
					]
				},
				{
					key: "onWhen",
					label: "Detectando quando",
					type: "select",
					options: ON_FIELDS[0].options
				},
				ON_FIELDS[1],
				{
					...INVERT_FIELD,
					label: "Inverter sinal (sensor NF)"
				}
			],
			render: renderSensor
		},
		gauge: {
			label: "Medidor",
			group: "Valores",
			w: 150,
			h: 120,
			preview: 62,
			defaults: {
				title: "PRESSÃO",
				unit: "bar",
				decimals: 1,
				min: 0,
				max: 100,
				lo: "",
				hi: 85,
				priority: "2"
			},
			fields: SCALE_FIELDS,
			render: renderGauge
		},
		bar: {
			label: "Barra",
			group: "Valores",
			w: 60,
			h: 180,
			preview: 62,
			defaults: {
				title: "NÍVEL",
				unit: "%",
				decimals: 0,
				min: 0,
				max: 100,
				lo: "",
				hi: "",
				priority: "2"
			},
			fields: SCALE_FIELDS,
			render: renderBar
		},
		trend: {
			label: "Tendência",
			group: "Valores",
			w: 300,
			h: 120,
			preview: 42,
			defaults: {
				title: "VELOCIDADE",
				unit: "m/min",
				decimals: 1,
				min: "",
				max: "",
				window: 60
			},
			fields: [
				{
					key: "title",
					label: "Título",
					type: "text"
				},
				{
					key: "unit",
					label: "Unidade",
					type: "text"
				},
				{
					key: "decimals",
					label: "Casas decimais",
					type: "number"
				},
				{
					key: "min",
					label: "Mínimo (vazio = automático)",
					type: "number"
				},
				{
					key: "max",
					label: "Máximo (vazio = automático)",
					type: "number"
				},
				{
					key: "window",
					label: "Janela (segundos)",
					type: "number"
				}
			],
			render: renderTrend
		},
		stack: {
			label: "Torre de sinalização",
			group: "Estados",
			w: 36,
			h: 130,
			preview: void 0,
			defaults: {
				label: "",
				keyRed: "",
				keyYellow: "",
				keyGreen: "",
				keyBlue: "",
				blink: "no"
			},
			fields: [
				{
					key: "label",
					label: "Legenda",
					type: "text"
				},
				{
					key: "keyRed",
					label: "Chave vermelho",
					type: "text"
				},
				{
					key: "keyYellow",
					label: "Chave amarelo",
					type: "text"
				},
				{
					key: "keyGreen",
					label: "Chave verde",
					type: "text"
				},
				{
					key: "keyBlue",
					label: "Chave azul (opcional)",
					type: "text"
				},
				BLINK_FIELD
			],
			render: renderStack
		},
		switch: {
			label: "Chave seletora",
			group: "Comandos",
			w: 110,
			h: 44,
			preview: 1,
			defaults: {
				textOn: "AUTO",
				textOff: "MANUAL",
				onWhen: "nonzero",
				threshold: 0
			},
			action: {
				mode: "toggle",
				value: "",
				topic: "",
				confirm: "no"
			},
			fields: [
				{
					key: "textOff",
					label: "Texto desligado",
					type: "text"
				},
				{
					key: "textOn",
					label: "Texto ligado",
					type: "text"
				},
				...ON_FIELDS
			],
			render: renderSwitch
		},
		setpoint: {
			label: "Ajuste (setpoint)",
			group: "Comandos",
			w: 170,
			h: 64,
			preview: 120,
			defaults: {
				title: "VELOCIDADE ALVO",
				unit: "m/min",
				decimals: 0
			},
			action: {
				mode: "input",
				value: "",
				topic: "",
				confirm: "no",
				min: "",
				max: ""
			},
			fields: [
				{
					key: "title",
					label: "Título",
					type: "text"
				},
				{
					key: "unit",
					label: "Unidade",
					type: "text"
				},
				{
					key: "decimals",
					label: "Casas decimais",
					type: "number"
				}
			],
			render: renderSetpoint
		}
	};
	var CATEGORIES = [
		"Formas",
		"Estruturas",
		"Equipamentos",
		"Linhas",
		"Valores",
		"Estados",
		"Comandos"
	];
	function paletteItems(category) {
		const out = [];
		for (const [type, def] of Object.entries(SYMBOLS)) if (def.variants) def.variants.forEach((v, i) => {
			if ((v.category || def.group) === category) out.push({
				type,
				variant: i,
				label: v.label
			});
		});
		else if (def.group === category) out.push({
			type,
			variant: -1,
			label: def.label
		});
		return out;
	}
	var counter = 0;
	function createSymbol(type, x, y, variant) {
		const def = SYMBOLS[type];
		if (!def) throw new Error("Unknown symbol type: " + type);
		const v = def.variants && variant >= 0 ? def.variants[variant] : null;
		counter = (counter + 1) % 1e6;
		return {
			id: "s" + Date.now().toString(36) + counter.toString(36),
			type,
			x: Math.round(x),
			y: Math.round(y),
			w: v && v.w || def.w,
			h: v && v.h || def.h,
			rot: 0,
			key: "",
			props: {
				...JSON.parse(JSON.stringify(def.defaults)),
				...v && v.props ? JSON.parse(JSON.stringify(v.props)) : {}
			},
			...def.action ? { action: { ...def.action } } : {}
		};
	}
	function valueFor(sym, values) {
		if (!values || !sym.key) return void 0;
		return scaleValue(sym, values[sym.key]);
	}
	function scaleOf2(sym) {
		const sc = sym && sym.scale;
		if (!sc) return null;
		const k = num(sc.factor);
		const o = num(sc.offset);
		const factor = k === null ? 1 : k;
		const offset = o === null ? 0 : o;
		return factor === 1 && offset === 0 ? null : {
			factor,
			offset
		};
	}
	var tidy = (n) => Math.round(n * 1e9) / 1e9;
	function scaleValue(sym, raw) {
		const sc = scaleOf2(sym);
		if (!sc || typeof raw === "boolean") return raw;
		const n = num(raw);
		return n === null ? raw : tidy(n * sc.factor + sc.offset);
	}
	function unscaleValue(sym, shown) {
		const sc = scaleOf2(sym);
		if (!sc || sc.factor === 0) return shown;
		return tidy((shown - sc.offset) / sc.factor);
	}
	var RULE_OPS = [
		["on", "ligado (≠ 0 / true)"],
		["off", "desligado (0 / false)"],
		["eq", "igual a"],
		["ne", "diferente de"],
		["gt", "maior que"],
		["lt", "menor que"]
	];
	var RULE_EFFECTS = [
		["alarm", "Vermelho (alarme)"],
		["warn", "Amarelo (atenção)"],
		["info", "Azul"],
		["ok", "Verde"],
		["dim", "Apagado"],
		["blink", "Piscar"],
		["hide", "Esconder"]
	];
	function ruleMatch(rule, values, sym) {
		const key = rule.key || sym.key;
		const v = key && values ? values[key] : void 0;
		if (v === void 0 || v === null) return false;
		const a = num(v);
		const b = num(rule.value);
		switch (rule.op) {
			case "off": return isOn(v, "nonzero") === false;
			case "eq":
			case "ne": {
				const eq = a !== null && b !== null ? a === b : String(v) === String(rule.value === void 0 ? "" : rule.value);
				return rule.op === "eq" ? eq : !eq;
			}
			case "gt": return a !== null && b !== null && a > b;
			case "lt": return a !== null && b !== null && a < b;
			default: return isOn(v, "nonzero") === true;
		}
	}
	function ruleEffects(sym, values) {
		const out = {
			hide: false,
			classes: []
		};
		for (const r of Array.isArray(sym.rules) ? sym.rules : []) {
			if (!r || !ruleMatch(r, values, sym)) continue;
			if (r.effect === "hide") out.hide = true;
			else if (RULE_EFFECTS.some((e) => e[0] === r.effect) && !out.classes.includes("hmi-rule-" + r.effect)) out.classes.push("hmi-rule-" + r.effect);
		}
		return out;
	}
	function isOn(value, rule, threshold) {
		if (value === void 0 || value === null || value === "") return null;
		if (rule === "gt") return Number(value) > Number(threshold);
		if (typeof value === "boolean") return value;
		if (typeof value === "string" && isNaN(Number(value))) return value.length > 0;
		return Number(value) !== 0;
	}
	function onState(value, p) {
		const on = isOn(value, p && p.onWhen, p && p.threshold);
		return on !== null && p && p.invert === "yes" ? !on : on;
	}
	function formatValue(value, decimals, locale) {
		if (value === void 0 || value === null || value === "") return "—";
		if (typeof value === "boolean") return value ? "ON" : "OFF";
		const n = typeof value === "number" ? value : typeof value === "string" && value.trim() !== "" ? Number(value) : NaN;
		if (!isFinite(n)) return String(value);
		const d = decimals === "" || decimals === void 0 || decimals === null ? void 0 : Math.max(0, Math.min(10, Number(decimals) || 0));
		try {
			return n.toLocaleString(locale || "pt-BR", d === void 0 ? void 0 : {
				minimumFractionDigits: d,
				maximumFractionDigits: d
			});
		} catch (e) {
			return d === void 0 ? String(n) : n.toFixed(d);
		}
	}
	var num = (v) => v === "" || v === void 0 || v === null || !isFinite(Number(v)) ? null : Number(v);
	function rangeState(value, lo, hi) {
		const v = num(value);
		if (v === null) return null;
		const l = num(lo);
		const h = num(hi);
		if (l !== null && v < l) return "alarm";
		if (h !== null && v > h) return "alarm";
		return "normal";
	}
	function escapeXml(s) {
		return String(s).replace(/[&<>"']/g, (c) => ({
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			"\"": "&quot;",
			"'": "&#39;"
		})[c]);
	}
	var f = (n) => Math.round(n * 100) / 100;
	function alarmIndicator(cx, cy, priority) {
		const p = String(priority || "2");
		const s = 9;
		let shape;
		if (p === "1") shape = `<rect x="${f(cx - s)}" y="${f(cy - s)}" width="18" height="18"/>`;
		else if (p === "3") shape = `<polygon points="${f(cx)},${f(cy - s - 2)} ${f(cx + s + 2)},${f(cy)} ${f(cx)},${f(cy + s + 2)} ${f(cx - s - 2)},${f(cy)}"/>`;
		else shape = `<polygon points="${f(cx - s - 1)},${f(cy - s + 1)} ${f(cx + s + 1)},${f(cy - s + 1)} ${f(cx)},${f(cy + s + 3)}"/>`;
		return `<g class="hmi-alarm-ind hmi-p${escapeXml(p)}">${shape}<text x="${f(cx)}" y="${f(cy + (p === "2" ? -1 : .5))}">${escapeXml(p)}</text></g>`;
	}
	function renderReel(sym, value) {
		const p = sym.props || {};
		const w = sym.w;
		const h = sym.h;
		const cx = w / 2;
		const cy = h / 2;
		const r = Math.max(4, Math.min(w, h) / 2 - 2);
		const cls = stateClass(onState(value, p));
		const spokes = [
			-90,
			30,
			150
		].map((a) => {
			const rad = a * Math.PI / 180;
			return `<line x1="${f(Math.cos(rad) * r * .32)}" y1="${f(Math.sin(rad) * r * .32)}" x2="${f(Math.cos(rad) * r * .9)}" y2="${f(Math.sin(rad) * r * .9)}"/>`;
		}).join("");
		const label = labelBelow(p, w, h);
		return `<g class="hmi-reel ${cls}"><circle class="hmi-body" cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}"/><g transform="translate(${f(cx)},${f(cy)})"><g class="hmi-spin"><circle class="hmi-ring" r="${f(r * .78)}"/><circle class="hmi-ring" r="${f(r * .58)}"/><g class="hmi-spokes">${spokes}</g><circle class="hmi-hub" r="${f(r * .3)}"/></g></g><circle class="hmi-axle" cx="${f(cx)}" cy="${f(cy)}" r="${f(r * .09)}"/>` + label + "</g>";
	}
	var stateClass = (on) => on === null ? "hmi-unknown" : on ? "hmi-on" : "hmi-off";
	var colorClass = (p) => "hmi-c-" + ([
		"alarm",
		"warn",
		"info"
	].includes(p.color) ? p.color : "auto");
	var blinkClass = (p, on) => on && p.blink === "yes" ? " hmi-blink" : "";
	var labelBelow = (p, w, h) => p.label ? `<text class="hmi-label" x="${f(w / 2)}" y="${f(h + 18)}">${escapeXml(p.label)}</text>` : "";
	function renderRoller(sym, value) {
		const p = sym.props || {};
		const cx = sym.w / 2;
		const cy = sym.h / 2;
		const r = Math.max(3, Math.min(sym.w, sym.h) / 2 - 1);
		return `<g class="hmi-roller ${stateClass(onState(value, p))} hmi-${p.dir === "ccw" ? "ccw" : "cw"}"><g transform="translate(${f(cx)},${f(cy)})"><g class="hmi-spin"><circle class="hmi-body" r="${f(r)}"/><line class="hmi-mark" x1="0" y1="${f(-r * .7)}" x2="0" y2="${f(r * .7)}"/></g></g></g>`;
	}
	function renderMotor(sym, value, opts) {
		const p = sym.props || {};
		const w = sym.w;
		const h = sym.h;
		const r = Math.max(6, Math.min(w, h * .86) / 2 - 2);
		const cx = w / 2;
		const cy = r + 2;
		const on = onState(value, p);
		const fault = faultOf(p, opts);
		let out = `<g class="hmi-motor ${stateClass(on)}${fault ? " hmi-fault" : ""}"><rect class="hmi-foot" x="${f(cx - r * .8)}" y="${f(cy + r - 2)}" width="${f(r * 1.6)}" height="${f(Math.max(4, h - cy - r + 2))}" rx="2"/><circle class="hmi-body" cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}"/><text class="hmi-motor-m" x="${f(cx)}" y="${f(cy)}" font-size="${f(r * .9)}">M</text>`;
		if (fault) out += alarmIndicator(w - 4, 6, p.priority);
		return out + labelBelow(p, w, h) + "</g>";
	}
	function faultOf(p, opts) {
		return p.faultKey && opts.values ? isOn(opts.values[p.faultKey], "nonzero") === true : false;
	}
	function renderValve(sym, value, opts) {
		const p = sym.props || {};
		const w = sym.w;
		const h = sym.h;
		const on = onState(value, p);
		const fault = faultOf(p, opts);
		const top = h * .36;
		const cy = (top + h - 1) / 2;
		const cx = w / 2;
		const a = Math.min(w * .22, top * .9);
		let out = `<g class="hmi-valve ${stateClass(on)}${fault ? " hmi-fault" : ""}"><line class="hmi-stem" x1="${f(cx)}" y1="${f(cy)}" x2="${f(cx)}" y2="${f(top * .55)}"/><path class="hmi-actuator" d="M${f(cx - a)} ${f(top * .55)}A${f(a)} ${f(a)} 0 0 1 ${f(cx + a)} ${f(top * .55)}Z"/><path class="hmi-body" d="M1.5 ${f(top)}L${f(cx)} ${f(cy)}L1.5 ${f(h - 1)}ZM${f(w - 1.5)} ${f(top)}L${f(cx)} ${f(cy)}L${f(w - 1.5)} ${f(h - 1)}Z"/>`;
		if (fault) out += alarmIndicator(w - 4, 6, p.priority);
		return out + labelBelow(p, w, h) + "</g>";
	}
	function renderPump(sym, value, opts) {
		const p = sym.props || {};
		const w = sym.w;
		const h = sym.h;
		const on = onState(value, p);
		const fault = faultOf(p, opts);
		const r = Math.max(6, Math.min(w, h * .9) / 2 - 2);
		const cx = w / 2;
		const cy = r + 2;
		const t = r * .55;
		let out = `<g class="hmi-pump ${stateClass(on)}${fault ? " hmi-fault" : ""}"><path class="hmi-foot" d="M${f(cx - r * .75)} ${f(h - 1)}L${f(cx - r * .45)} ${f(cy + r * .7)}H${f(cx + r * .45)}L${f(cx + r * .75)} ${f(h - 1)}Z"/><circle class="hmi-body" cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}"/><path class="hmi-pump-arrow" d="M${f(cx - t * .6)} ${f(cy - t)}L${f(cx + t)} ${f(cy)}L${f(cx - t * .6)} ${f(cy + t)}Z"/>`;
		if (fault) out += alarmIndicator(w - 4, 6, p.priority);
		return out + labelBelow(p, w, h) + "</g>";
	}
	function renderTank(sym, value, opts) {
		const p = sym.props || {};
		const w = sym.w;
		const h = sym.h;
		const v = num(value);
		let min = num(p.min);
		let max = num(p.max);
		if (min === null) min = 0;
		if (max === null || max <= min) max = min + 100;
		const state = rangeState(value, p.lo, p.hi);
		const cls = state === null ? "hmi-unknown" : state === "alarm" ? "hmi-alarm" : "hmi-normal";
		const rx = Math.min(w * .18, 20);
		const pad = 5;
		const inner = h - 10;
		const lh = inner * (v === null ? 0 : Math.max(0, Math.min(1, (v - min) / (max - min))));
		const text = v === null ? "—" : formatValue(v, p.decimals, opts.locale) + (p.unit ? " " + p.unit : "");
		let out = `<g class="hmi-tank ${cls}"><rect class="hmi-body" x="1" y="1" width="${f(w - 2)}" height="${f(h - 2)}" rx="${f(rx)}"/>` + (lh > 0 ? `<rect class="hmi-level" x="${pad}" y="${f(pad + inner - lh)}" width="${f(w - 10)}" height="${f(lh)}" rx="${f(Math.max(0, Math.min(rx - pad, lh / 2)))}"/>` : "") + `<rect class="hmi-tank-tag" x="${f(w * .12)}" y="${f(h / 2 - 13)}" width="${f(w * .76)}" height="26" rx="3"/><text class="hmi-tank-value" x="${f(w / 2)}" y="${f(h / 2)}" font-size="${f(Math.max(10, Math.min(16, w * .15)))}">${escapeXml(text)}</text>`;
		if (state === "alarm") out += alarmIndicator(w - 6, 8, p.priority);
		return out + labelBelow(p, w, h) + "</g>";
	}
	function renderButton(sym, value, opts) {
		const p = sym.props || {};
		const w = sym.w;
		const h = sym.h;
		const on = onState(value, p);
		const text = on && p.textOn ? p.textOn : p.text || "";
		return `<g class="hmi-button ${stateClass(on)}"><rect class="hmi-button-box" x="1" y="1" width="${f(w - 2)}" height="${f(h - 2)}" rx="6"/><text class="hmi-button-text" x="${f(w / 2)}" y="${f(h / 2)}" font-size="${f(Math.max(10, Math.min(h * .38, w / Math.max(4, text.length) * 1.5)))}">${escapeXml(text)}</text></g>`;
	}
	function poly(pts) {
		return `<polygon class="hmi-body" points="${pts.map((p) => f(p[0]) + "," + f(p[1])).join(" ")}"/>`;
	}
	function box(x, y, w, h) {
		return `<rect class="hmi-body" x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}"/>`;
	}
	function strut(x1, y1, x2, y2, t) {
		const len = Math.hypot(x2 - x1, y2 - y1) || 1;
		const nx = -(y2 - y1) / len * t / 2;
		const ny = (x2 - x1) / len * t / 2;
		return poly([
			[x1 + nx, y1 + ny],
			[x2 + nx, y2 + ny],
			[x2 - nx, y2 - ny],
			[x1 - nx, y1 - ny]
		]);
	}
	function bolts(y, w, r, n) {
		let out = "";
		for (let i = 0; i < n; i++) out += `<circle class="hmi-detail" cx="${f(w * (i + .5) / n)}" cy="${f(y)}" r="${f(r)}"/>`;
		return out;
	}
	function structurePath(shape, w, h) {
		const m = Math.min(w, h);
		switch (shape) {
			case "beamSide": return box(0, 0, w, h) + `<path class="hmi-detail" d="M0 ${f(h * .2)}H${f(w)}M0 ${f(h * .8)}H${f(w)}"/>`;
			case "beamI": {
				const tf = h * .14;
				const tw = w * .16;
				return poly([
					[0, 0],
					[w, 0],
					[w, tf],
					[(w + tw) / 2, tf],
					[(w + tw) / 2, h - tf],
					[w, h - tf],
					[w, h],
					[0, h],
					[0, h - tf],
					[(w - tw) / 2, h - tf],
					[(w - tw) / 2, tf],
					[0, tf]
				]);
			}
			case "channel": {
				const tf = h * .14;
				const tw = w * .22;
				return poly([
					[0, 0],
					[w, 0],
					[w, tf],
					[tw, tf],
					[tw, h - tf],
					[w, h - tf],
					[w, h],
					[0, h]
				]);
			}
			case "angle": {
				const t = m * .18;
				return poly([
					[0, 0],
					[t, 0],
					[t, h - t],
					[w, h - t],
					[w, h],
					[0, h]
				]);
			}
			case "truss": {
				const t = Math.max(3, h * .16);
				const n = Math.max(2, Math.round(w / Math.max(h, 1)));
				const step = w / n;
				let out = "";
				for (let i = 0; i < n; i++) {
					const x = i * step;
					out += strut(x + t / 2, h - t, x + step / 2, t, t * .7) + strut(x + step / 2, t, x + step - t / 2, h - t, t * .7);
				}
				return out + box(0, 0, w, t) + box(0, h - t, w, t);
			}
			case "tube": return `<rect class="hmi-body" x="0" y="0" width="${f(w)}" height="${f(h)}" rx="${f(Math.min(h * .2, 4))}"/><path class="hmi-detail" d="M${f(Math.min(w * .03, 6))} ${f(h * .3)}H${f(w - Math.min(w * .03, 6))}"/>`;
			case "column": {
				const p = Math.max(4, h * .035);
				const s = w * .25;
				return box(s, p, w - 2 * s, h - 2 * p) + box(0, 0, w, p) + box(0, h - p, w, p);
			}
			case "pedestal": {
				const top = h * .1;
				const base = h * .12;
				return poly([
					[w * .15, 0],
					[w * .85, 0],
					[w * .85, top],
					[w * .72, top],
					[w * .8, h - base],
					[w, h - base],
					[w, h],
					[0, h],
					[0, h - base],
					[w * .2, h - base],
					[w * .28, top],
					[w * .15, top]
				]) + bolts(h - base / 2, w, Math.max(1.5, base * .22), 2);
			}
			case "bearing": {
				const r = Math.min(w * .36, h * .24);
				const cy = r + 1;
				const base = h * .1;
				return poly([
					[w * .5 - r, cy],
					[w * .5 + r, cy],
					[w * .78, h - base],
					[w, h - base],
					[w, h],
					[0, h],
					[0, h - base],
					[w * .22, h - base]
				]) + `<circle class="hmi-body" cx="${f(w / 2)}" cy="${f(cy)}" r="${f(r)}"/><circle class="hmi-detail" cx="${f(w / 2)}" cy="${f(cy)}" r="${f(r * .45)}"/>` + bolts(h - base / 2, w, Math.max(1.5, base * .22), 2);
			}
			case "bracket": {
				const t = Math.max(4, m * .1);
				return box(0, 0, t, h) + box(0, 0, w, t) + strut(t / 2, h * .85, w * .85, t / 2, t * .8);
			}
			case "aFrame": {
				const t = Math.max(4, Math.min(w, h) * .08);
				return strut(w * .35, t, t, h - t / 2, t) + strut(w * .65, t, w - t, h - t / 2, t) + box(w * .22, h * .6, w * .56, t * .7) + box(w * .25, 0, w * .5, t * 1.4);
			}
			case "stand": {
				const top = Math.max(4, h * .12);
				const t = Math.max(4, w * .05);
				const foot = Math.max(3, h * .06);
				return box(w * .04, top, t, h - top - foot) + box(w * .96 - t, top, t, h - top - foot) + box(w * .04, h * .66, w * .92, t * .7) + box(0, 0, w, top) + box(0, h - foot, w * .04 * 2 + t, foot) + box(w - (w * .04 * 2 + t), h - foot, w * .04 * 2 + t, foot);
			}
			case "basePlate": return box(0, 0, w, h) + bolts(h / 2, w, Math.max(1.5, h * .18), Math.max(2, Math.round(w / Math.max(h * 3, 1))));
		}
		return null;
	}
	function safeImageSrc(src) {
		const s = String(src || "").trim();
		if (/^data:image\/(png|jpe?g|gif|webp|svg\+xml);base64,[A-Za-z0-9+/=]+$/.test(s)) return s;
		if (/^(https?:\/\/|\/)[^\s"'<>`]*$/.test(s)) return s;
		return "";
	}
	function renderImage(sym, value) {
		const p = sym.props || {};
		const w = sym.w;
		const h = sym.h;
		const src = safeImageSrc(onState(value, p) === true && p.srcOn ? p.srcOn : p.src);
		const label = labelBelow(p, w, h);
		if (!src) {
			const m = Math.min(w, h);
			return `<g class="hmi-image hmi-img-empty"><rect class="hmi-img-box" x="1" y="1" width="${f(w - 2)}" height="${f(h - 2)}" rx="4"/><path class="hmi-img-icon" d="M${f(w / 2 - m * .25)} ${f(h / 2 + m * .18)}l${f(m * .17)} ${f(-m * .24)} ${f(m * .1)} ${f(m * .12)} ${f(m * .08)} ${f(-m * .07)} ${f(m * .15)} ${f(m * .19)}z"/><circle class="hmi-img-icon" cx="${f(w / 2 + m * .12)}" cy="${f(h / 2 - m * .14)}" r="${f(m * .05)}"/>${label}</g>`;
		}
		const par = p.fit === "stretch" ? "none" : p.fit === "slice" ? "xMidYMid slice" : "xMidYMid meet";
		return `<g class="hmi-image"><rect class="hmi-hitbox" x="0" y="0" width="${f(w)}" height="${f(h)}"/><image href="${escapeXml(src)}" x="0" y="0" width="${f(w)}" height="${f(h)}" preserveAspectRatio="${par}"/>${label}</g>`;
	}
	function faultMark(p, opts, w) {
		return faultOf(p, opts) ? alarmIndicator(w - 4, 6, p.priority) : "";
	}
	var faultClass = (p, opts) => faultOf(p, opts) ? " hmi-fault" : "";
	function renderConveyor(sym, value, opts) {
		const p = sym.props || {};
		const w = sym.w;
		const h = sym.h;
		const on = onState(value, p);
		const r = Math.max(4, h / 2 - 1);
		const pr = r * .72;
		let idlers = "";
		const n = Math.max(0, Math.floor((w - 4 * r) / 40));
		for (let i = 1; i <= n; i++) {
			const x = 2 * r + (w - 4 * r) * i / (n + 1);
			idlers += `<circle class="hmi-idler" cx="${f(x)}" cy="${f(h / 2)}" r="${f(r * .3)}"/>`;
		}
		const dir = p.dir === "rev" ? -1 : 1;
		const ax = w / 2;
		const ay = h / 2;
		const as = Math.min(r * .5, 9);
		return `<g class="hmi-conveyor ${stateClass(on)} hmi-${p.dir === "rev" ? "rev" : "fwd"}${faultClass(p, opts)}"><rect class="hmi-body" x="1" y="1" width="${f(w - 2)}" height="${f(h - 2)}" rx="${f(r)}"/><path class="hmi-belt" d="M${f(r + 1)} 2.5H${f(w - r - 1)}"/><circle class="hmi-pulley" cx="${f(r + 1)}" cy="${f(h / 2)}" r="${f(pr)}"/><circle class="hmi-pulley" cx="${f(w - r - 1)}" cy="${f(h / 2)}" r="${f(pr)}"/>` + idlers + `<path class="hmi-dir" d="M${f(ax - as * dir)} ${f(ay - as)}L${f(ax + as * dir)} ${f(ay)}L${f(ax - as * dir)} ${f(ay + as)}Z"/>` + faultMark(p, opts, w) + labelBelow(p, w, h) + "</g>";
	}
	function renderCylinder(sym, value) {
		const p = sym.props || {};
		const w = sym.w;
		const h = sym.h;
		const on = onState(value, p);
		const bx = w * .55;
		const rodY = h / 2 - h * .09;
		const rodEnd = on ? w - 8 : w * .66;
		return `<g class="hmi-cylinder ${stateClass(on)}"><rect class="hmi-rod" x="${f(bx - 4)}" y="${f(rodY)}" width="${f(rodEnd - bx + 4)}" height="${f(h * .18)}"/><rect class="hmi-rod-end" x="${f(rodEnd)}" y="${f(h * .22)}" width="8" height="${f(h * .56)}" rx="1"/><rect class="hmi-body" x="1" y="${f(h * .12)}" width="${f(bx - 1)}" height="${f(h * .76)}" rx="2"/><path class="hmi-detail" d="M${f(bx * .12)} ${f(h * .12)}V${f(h * .88)}M${f(bx * .88)} ${f(h * .12)}V${f(h * .88)}"/>` + labelBelow(p, w, h) + "</g>";
	}
	function renderFan(sym, value, opts) {
		const p = sym.props || {};
		const w = sym.w;
		const h = sym.h;
		const on = onState(value, p);
		const r = Math.max(6, Math.min(w, h) / 2 - 2);
		const blades = [
			0,
			120,
			240
		].map((a) => `<ellipse class="hmi-blade" cx="0" cy="${f(-r * .45)}" rx="${f(r * .2)}" ry="${f(r * .4)}" transform="rotate(${a})"/>`).join("");
		return `<g class="hmi-fan ${stateClass(on)}${faultClass(p, opts)}"><circle class="hmi-body" cx="${f(w / 2)}" cy="${f(h / 2)}" r="${f(r)}"/><g transform="translate(${f(w / 2)},${f(h / 2)})"><g class="hmi-spin">${blades}<circle class="hmi-hub" r="${f(r * .14)}"/></g></g>` + faultMark(p, opts, w) + labelBelow(p, w, h) + "</g>";
	}
	function renderKnife(sym, value) {
		const p = sym.props || {};
		const w = sym.w;
		const h = sym.h;
		const on = onState(value, p);
		const r = Math.max(6, Math.min(w, h) / 2 - 2);
		const marks = [
			0,
			60,
			120,
			180,
			240,
			300
		].map((a) => {
			const rad = a * Math.PI / 180;
			return `M${f(Math.cos(rad) * r * .45)} ${f(Math.sin(rad) * r * .45)}L${f(Math.cos(rad) * r * .78)} ${f(Math.sin(rad) * r * .78)}`;
		}).join("");
		return `<g class="hmi-knife ${stateClass(on)}"><g transform="translate(${f(w / 2)},${f(h / 2)})"><g class="hmi-spin"><circle class="hmi-body" r="${f(r)}"/><circle class="hmi-edge" r="${f(r * .86)}"/><path class="hmi-detail" d="${marks}"/><circle class="hmi-hub" r="${f(r * .3)}"/></g></g>` + labelBelow(p, w, h) + "</g>";
	}
	function renderHeater(sym, value, opts) {
		const p = sym.props || {};
		const w = sym.w;
		const h = sym.h;
		const on = onState(value, p);
		const n = Math.max(3, Math.round(w / 14));
		let d = `M6 ${f(h / 2)}`;
		for (let i = 0; i < n; i++) {
			const x = 6 + (w - 12) * (i + .5) / n;
			d += `L${f(x)} ${f(i % 2 ? h * .75 : h * .25)}`;
		}
		d += `L${f(w - 6)} ${f(h / 2)}`;
		return `<g class="hmi-heater ${stateClass(on)}${faultClass(p, opts)}"><rect class="hmi-body" x="1" y="1" width="${f(w - 2)}" height="${f(h - 2)}" rx="4"/><path class="hmi-coil" d="${d}"/>` + faultMark(p, opts, w) + labelBelow(p, w, h) + "</g>";
	}
	function renderSensor(sym, value) {
		const p = sym.props || {};
		const w = sym.w;
		const h = sym.h;
		const on = onState(value, p);
		const kind = ["prox", "limit"].includes(p.kind) ? p.kind : "photo";
		let body;
		if (kind === "photo") body = `<path class="hmi-beam" d="M${f(w * .5)} ${f(h / 2)}H${f(w - 1)}"/><rect class="hmi-body" x="1" y="${f(h * .2)}" width="${f(w * .5)}" height="${f(h * .6)}" rx="3"/><circle class="hmi-lens" cx="${f(w * .5)}" cy="${f(h / 2)}" r="${f(h * .12)}"/>`;
		else if (kind === "prox") body = `<rect class="hmi-body" x="1" y="${f(h * .25)}" width="${f(w * .75)}" height="${f(h * .5)}" rx="2"/><rect class="hmi-lens" x="${f(w * .75)}" y="${f(h * .25)}" width="${f(w * .2)}" height="${f(h * .5)}" rx="2"/>`;
		else {
			const a = on ? .42 : .12;
			body = `<path class="hmi-lever" d="M${f(w * .5)} ${f(h * .5)}L${f(w * .5 + Math.cos(-Math.PI / 2 + a) * h * .45)} ${f(h * .5 + Math.sin(-Math.PI / 2 + a) * h * .45)}"/><rect class="hmi-body" x="${f(w * .2)}" y="${f(h * .5)}" width="${f(w * .6)}" height="${f(h * .45)}" rx="2"/><circle class="hmi-lens" cx="${f(w * .5 + Math.cos(-Math.PI / 2 + a) * h * .45)}" cy="${f(h * .5 + Math.sin(-Math.PI / 2 + a) * h * .45)}" r="${f(h * .08)}"/>`;
		}
		return `<g class="hmi-sensor hmi-sensor-${kind} ${stateClass(on)}">${body}${labelBelow(p, w, h)}</g>`;
	}
	function scaleOf(p) {
		let min = num(p.min);
		let max = num(p.max);
		if (min === null) min = 0;
		if (max === null || max <= min) max = min + 100;
		return {
			min,
			max,
			frac: (v) => Math.max(0, Math.min(1, (v - min) / (max - min)))
		};
	}
	function arcPath(cx, cy, r, a0, a1) {
		const pt = (a) => [cx + r * Math.cos(a * Math.PI / 180), cy + r * Math.sin(a * Math.PI / 180)];
		const [x0, y0] = pt(a0);
		const [x1, y1] = pt(a1);
		return `M${f(x0)} ${f(y0)}A${f(r)} ${f(r)} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${f(x1)} ${f(y1)}`;
	}
	function renderGauge(sym, value, opts) {
		const p = sym.props || {};
		const w = sym.w;
		const h = sym.h;
		const sc = scaleOf(p);
		const v = num(value);
		const state = rangeState(value, p.lo, p.hi);
		const cls = state === null ? "hmi-unknown" : state === "alarm" ? "hmi-alarm" : "hmi-normal";
		const titleY = Math.max(12, Math.min(16, h * .12));
		const cx = w / 2;
		const r = Math.max(10, Math.min(w / 2 - 10, (h - titleY - 34) / 1.5));
		const cy = titleY + 8 + r;
		const A = (fr) => 150 + 240 * fr;
		let out = `<g class="hmi-gauge ${cls}"><rect class="hmi-tag-box" x="0.5" y="0.5" width="${f(w - 1)}" height="${f(h - 1)}" rx="4"/><path class="hmi-gauge-track" d="${arcPath(cx, cy, r, A(0), A(1))}"/>`;
		const lo = num(p.lo);
		const hi = num(p.hi);
		if (lo !== null || hi !== null) out += `<path class="hmi-gauge-normal" d="${arcPath(cx, cy, r, A(sc.frac(lo === null ? sc.min : lo)), A(sc.frac(hi === null ? sc.max : hi)))}"/>`;
		if (v !== null) {
			const a = A(sc.frac(v)) * Math.PI / 180;
			out += `<path class="hmi-needle" d="M${f(cx)} ${f(cy)}L${f(cx + Math.cos(a) * r * .92)} ${f(cy + Math.sin(a) * r * .92)}"/>`;
		}
		const text = formatValue(value, p.decimals, opts.locale) + (p.unit ? " " + p.unit : "");
		out += `<circle class="hmi-gauge-hub" cx="${f(cx)}" cy="${f(cy)}" r="4"/><text class="hmi-tag-title" x="${f(cx)}" y="${f(titleY)}" font-size="${f(Math.max(9, Math.min(13, w * .08)))}">${escapeXml(p.title || sym.key || "")}</text><text class="hmi-tag-value" x="${f(cx)}" y="${f(h - 10)}" font-size="${f(Math.max(10, Math.min(20, w * .12)))}">${escapeXml(text)}</text>`;
		if (state === "alarm") out += alarmIndicator(w - 10, 10, p.priority);
		return out + "</g>";
	}
	function renderBar(sym, value, opts) {
		const p = sym.props || {};
		const w = sym.w;
		const h = sym.h;
		const sc = scaleOf(p);
		const v = num(value);
		const state = rangeState(value, p.lo, p.hi);
		const cls = state === null ? "hmi-unknown" : state === "alarm" ? "hmi-alarm" : "hmi-normal";
		const top = 20;
		const bottom = h - 22;
		const tw = Math.max(8, w * .4);
		const tx = (w - tw) / 2;
		const Y = (val) => bottom - sc.frac(val) * (bottom - top);
		let out = `<g class="hmi-vbar ${cls}"><text class="hmi-tag-title" x="${f(w / 2)}" y="12" font-size="${f(Math.max(9, Math.min(12, w * .2)))}">${escapeXml(p.title || sym.key || "")}</text><rect class="hmi-vbar-track" x="${f(tx)}" y="${f(top)}" width="${f(tw)}" height="${f(bottom - top)}"/>`;
		if (v !== null) out += `<rect class="hmi-vbar-fill" x="${f(tx)}" y="${f(Y(v))}" width="${f(tw)}" height="${f(bottom - Y(v))}"/>`;
		for (const lim of [num(p.lo), num(p.hi)]) if (lim !== null) out += `<path class="hmi-vbar-limit" d="M${f(tx - 5)} ${f(Y(lim))}H${f(tx + tw + 5)}"/>`;
		const text = formatValue(value, p.decimals, opts.locale) + (p.unit ? " " + p.unit : "");
		out += `<text class="hmi-tag-value" x="${f(w / 2)}" y="${f(h - 6)}" font-size="${f(Math.max(9, Math.min(16, w * .22)))}">${escapeXml(text)}</text>`;
		if (state === "alarm") out += alarmIndicator(w - 8, 28, p.priority);
		return out + "</g>";
	}
	function renderTrend(sym, value, opts) {
		const p = sym.props || {};
		const w = sym.w;
		const h = sym.h;
		const win = Math.max(5, Math.min(3600, Number(p.window) || 60)) * 1e3;
		const now = opts.now || Date.now();
		let pts = opts.history && sym.key && opts.history[sym.key] || null;
		if (!pts && opts.editor) {
			const base = num(value) === null ? 50 : num(value);
			pts = Array.from({ length: 40 }, (x, i) => [now - win + win * i / 39, base * (1 + .08 * Math.sin(i / 4))]);
		}
		pts = (pts || []).filter((q) => q[0] >= now - win);
		if (pts.length && pts[pts.length - 1][0] < now) pts.push([now, pts[pts.length - 1][1]]);
		const x0 = 8;
		const x1 = w - 8;
		const narrow = w < 240;
		const y0 = narrow ? 44 : 28;
		const y1 = h - 8;
		let lo = num(p.min);
		let hi = num(p.max);
		if (pts.length && (lo === null || hi === null)) {
			const vs = pts.map((q) => q[1]);
			const pad = (Math.max(...vs) - Math.min(...vs)) * .1 || Math.abs(vs[0]) * .1 || 1;
			if (lo === null) lo = Math.min(...vs) - pad;
			if (hi === null) hi = Math.max(...vs) + pad;
		}
		if (lo === null) lo = 0;
		if (hi === null || hi <= lo) hi = lo + 1;
		const X = (t) => x0 + (t - (now - win)) / win * (x1 - x0);
		const Y = (v) => y1 - (Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo) * (y1 - y0);
		const text = formatValue(value, p.decimals, opts.locale) + (p.unit ? " " + p.unit : "");
		let out = `<g class="hmi-trend ${value === void 0 || value === null ? "hmi-unknown" : "hmi-normal"}"><rect class="hmi-tag-box" x="0.5" y="0.5" width="${f(w - 1)}" height="${f(h - 1)}" rx="4"/><text class="hmi-tag-title hmi-left" x="10" y="17" font-size="12">${escapeXml(p.title || sym.key || "")}</text>` + (narrow ? `<text class="hmi-tag-value hmi-left" x="10" y="35" font-size="14">${escapeXml(text)}</text>` : `<text class="hmi-tag-value hmi-right" x="${f(w - 10)}" y="18" font-size="15">${escapeXml(text)}</text>`) + `<path class="hmi-trend-grid" d="M${x0} ${f(y0)}H${f(x1)}M${x0} ${f((y0 + y1) / 2)}H${f(x1)}M${x0} ${f(y1)}H${f(x1)}"/>`;
		if (pts.length > 1) out += `<path class="hmi-trend-line" d="M${pts.map((q) => f(X(q[0])) + " " + f(Y(q[1]))).join("L")}"/>`;
		return out + "</g>";
	}
	function renderStack(sym, value, opts) {
		const p = sym.props || {};
		const w = sym.w;
		const h = sym.h;
		const vals = opts.values || {};
		const lamps = [
			["keyRed", "alarm"],
			["keyYellow", "warn"],
			["keyGreen", "ok"],
			["keyBlue", "info"]
		].filter(([k], i) => i < 3 || p.keyBlue);
		const none = lamps.every(([k]) => !p[k] || vals[p[k]] === void 0);
		const segH = (h - 18) / lamps.length;
		let out = `<g class="hmi-stack">`;
		lamps.forEach(([k, color], i) => {
			const on = p[k] ? isOn(vals[p[k]], "nonzero") === true : opts.editor && none && color === "ok";
			out += `<rect class="hmi-lamp hmi-lamp-${color}${on ? " hmi-on" : ""}${on && p.blink === "yes" ? " hmi-blink" : ""}" x="1" y="${f(1 + i * segH)}" width="${f(w - 2)}" height="${f(segH - 2)}" rx="3"/>`;
		});
		out += `<rect class="hmi-stack-pole" x="${f(w * .35)}" y="${f(h - 18)}" width="${f(w * .3)}" height="12"/><rect class="hmi-stack-base" x="1" y="${f(h - 7)}" width="${f(w - 2)}" height="6" rx="2"/>`;
		return out + labelBelow(p, w, h) + "</g>";
	}
	function renderSwitch(sym, value) {
		const p = sym.props || {};
		const w = sym.w;
		const h = sym.h;
		const on = onState(value, p);
		const r = h / 2 - 3;
		const kx = on ? w - r - 3 : r + 3;
		const text = on ? p.textOn : p.textOff;
		const tx = on ? (w - 2 * r - 6) / 2 + 2 : (w + 2 * r + 6) / 2;
		return `<g class="hmi-switch ${stateClass(on)}"><rect class="hmi-switch-track" x="1" y="1" width="${f(w - 2)}" height="${f(h - 2)}" rx="${f(h / 2 - 1)}"/><circle class="hmi-switch-knob" cx="${f(kx)}" cy="${f(h / 2)}" r="${f(r)}"/><text class="hmi-switch-text" x="${f(tx)}" y="${f(h / 2)}" font-size="${f(Math.max(9, Math.min(h * .32, (w - 2 * r) / Math.max(3, (text || "").length) * 1.5)))}">${escapeXml(on === null ? "—" : text || "")}</text></g>`;
	}
	function renderSetpoint(sym, value, opts) {
		const p = sym.props || {};
		const w = sym.w;
		const h = sym.h;
		const text = formatValue(value, p.decimals, opts.locale) + (p.unit ? " " + p.unit : "");
		const unknown = value === void 0 || value === null ? " hmi-unknown" : "";
		const px = w - 18;
		return `<g class="hmi-setpoint${unknown}"><rect class="hmi-setpoint-box" x="0.5" y="0.5" width="${f(w - 1)}" height="${f(h - 1)}" rx="4"/><text class="hmi-tag-title" x="${f(w / 2)}" y="${f(h * .28)}" font-size="${f(Math.max(9, Math.min(13, h * .2)))}">${escapeXml(p.title || sym.key || "")}</text><text class="hmi-tag-value" x="${f(w / 2)}" y="${f(h * .72)}" font-size="${f(Math.max(11, Math.min(26, h * .34)))}">${escapeXml(text)}</text><path class="hmi-pencil" d="M${px} 19l2 -5 7 -7 3 3 -7 7z"/></g>`;
	}
	function framePath(shape, w, h) {
		const st = structurePath(shape, w, h);
		if (st) return st;
		const m = Math.min(w, h);
		const c = m * .15;
		const a = m * .3;
		switch (shape) {
			case "round": return `<rect class="hmi-body" x="0" y="0" width="${f(w)}" height="${f(h)}" rx="${f(m * .08)}"/>`;
			case "chamfer": return poly([
				[0, h],
				[0, c],
				[c, 0],
				[w - c, 0],
				[w, c],
				[w, h]
			]);
			case "chamferAll": return poly([
				[0, h - c],
				[0, c],
				[c, 0],
				[w - c, 0],
				[w, c],
				[w, h - c],
				[w - c, h],
				[c, h]
			]);
			case "arcLeft": return `<path class="hmi-body" d="M0 ${f(h)}V${f(a)}A${f(a)} ${f(a)} 0 0 1 ${f(a)} 0H${f(w)}V${f(h)}Z"/>`;
			case "arcRight": return `<path class="hmi-body" d="M0 ${f(h)}V0H${f(w - a)}A${f(a)} ${f(a)} 0 0 1 ${f(w)} ${f(a)}V${f(h)}Z"/>`;
			case "archTop": {
				const ry = Math.min(h * .45, w / 2);
				return `<path class="hmi-body" d="M0 ${f(h)}V${f(ry)}A${f(w / 2)} ${f(ry)} 0 0 1 ${f(w)} ${f(ry)}V${f(h)}Z"/>`;
			}
			case "pill": return `<rect class="hmi-body" x="0" y="0" width="${f(w)}" height="${f(h)}" rx="${f(m / 2)}"/>`;
			case "circle": return `<ellipse class="hmi-body" cx="${f(w / 2)}" cy="${f(h / 2)}" rx="${f(w / 2)}" ry="${f(h / 2)}"/>`;
			case "triangle": return poly([
				[w / 2, 0],
				[w, h],
				[0, h]
			]);
			case "trapezoid": return poly([
				[w * .2, 0],
				[w * .8, 0],
				[w, h],
				[0, h]
			]);
			case "base": return poly([
				[w * .08, 0],
				[w * .92, 0],
				[w, h],
				[0, h]
			]);
			case "hopper": return poly([
				[0, 0],
				[w, 0],
				[w, h * .45],
				[w * .62, h],
				[w * .38, h],
				[0, h * .45]
			]);
			case "silo": return `<path class="hmi-body" d="M0 ${f(h * .1)}Q${f(w / 2)} ${f(-h * .06)} ${f(w)} ${f(h * .1)}V${f(h * .72)}L${f(w * .62)} ${f(h)}H${f(w * .38)}L0 ${f(h * .72)}Z"/>`;
			case "hexagon": {
				const k = Math.min(w * .25, h * .29);
				return poly([
					[k, 0],
					[w - k, 0],
					[w, h / 2],
					[w - k, h],
					[k, h],
					[0, h / 2]
				]);
			}
			case "diamond": return poly([
				[w / 2, 0],
				[w, h / 2],
				[w / 2, h],
				[0, h / 2]
			]);
			case "parallelogram": return poly([
				[w * .2, 0],
				[w, 0],
				[w * .8, h],
				[0, h]
			]);
			case "lShape": {
				const t = m * .4;
				return poly([
					[0, 0],
					[t, 0],
					[t, h - t],
					[w, h - t],
					[w, h],
					[0, h]
				]);
			}
			case "uShape": {
				const t = m * .3;
				return poly([
					[0, 0],
					[t, 0],
					[t, h - t],
					[w - t, h - t],
					[w - t, 0],
					[w, 0],
					[w, h],
					[0, h]
				]);
			}
			case "cabinet": {
				const hw = Math.max(3, w * .04);
				return `<rect class="hmi-body" x="0" y="0" width="${f(w)}" height="${f(h)}" rx="3"/><path class="hmi-detail" d="M${f(w / 2)} 4V${f(h - 4)}"/><rect class="hmi-detail" x="${f(w / 2 - hw * 2.5)}" y="${f(h / 2 - 12)}" width="${f(hw)}" height="24" rx="1"/><rect class="hmi-detail" x="${f(w / 2 + hw * 1.5)}" y="${f(h / 2 - 12)}" width="${f(hw)}" height="24" rx="1"/>`;
			}
			default: return `<rect class="hmi-body" x="0" y="0" width="${f(w)}" height="${f(h)}"/>`;
		}
	}
	function renderFrame(sym) {
		const p = sym.props || {};
		const tone = TONES.some((t) => t[0] === p.tone) ? p.tone : "equip";
		const label = p.label ? `<text class="hmi-label" x="${f(sym.w / 2)}" y="${f(sym.h + 18)}">${escapeXml(p.label)}</text>` : "";
		let defs = "";
		let style = "";
		let fixed = TONE_COLORS[tone];
		if (tone === "custom") fixed = [HEX.test(p.fill) ? p.fill : "#6a737d", HEX.test(p.stroke) ? p.stroke : "#8a939d"];
		if (fixed) {
			let fill = fixed[0];
			if (Array.isArray(fill)) {
				const id = "hmi-grad-" + String(sym.id).replace(/[^\w-]/g, "");
				defs = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${fill[0]}"/><stop offset="1" stop-color="${fill[1]}"/></linearGradient></defs>`;
				fill = `url(#${id})`;
			}
			style = ` style="--hmi-tone-fill:${fill};--hmi-tone-stroke:${fixed[1]}"`;
		}
		return `<g class="hmi-frame hmi-tone-${fixed ? "fixed" : tone}"${style}>${defs}${framePath(p.shape, sym.w, sym.h)}${label}</g>`;
	}
	function linePoints(sym) {
		return (sym.props && Array.isArray(sym.props.points) ? sym.props.points : []).filter((pt) => Array.isArray(pt) && isFinite(pt[0]) && isFinite(pt[1])).map((pt) => [Number(pt[0]), Number(pt[1])]);
	}
	function renderLine(sym, value, opts) {
		const p = sym.props || {};
		const pts = linePoints(sym);
		if (pts.length < 2) return "";
		const d = "M" + pts.map((pt) => f(pt[0]) + " " + f(pt[1])).join("L");
		const on = onState(value, p);
		const style = [
			"pipe",
			"conveyor",
			"signal"
		].includes(p.style) ? p.style : "strip";
		const flow = ["always", "never"].includes(p.flow) ? p.flow : "auto";
		return `<g class="hmi-line hmi-ls-${style} ${stateClass(on)} hmi-flow-${flow}"><path class="hmi-hit" d="${d}"/><path class="hmi-path" d="${d}"/><path class="hmi-flowpath" d="${d}"/></g>`;
	}
	function renderKpi(sym, value, opts) {
		const p = sym.props || {};
		const w = sym.w;
		const h = sym.h;
		const text = formatValue(value, p.decimals, opts.locale) + (p.unit ? " " + p.unit : "");
		const big = f(Math.max(12, Math.min(h * .3, (w - 30) / Math.max(4, text.length) * 1.7)));
		return `<g class="hmi-kpi ${value === void 0 || value === null ? "hmi-unknown" : "hmi-normal"}"><rect class="hmi-kpi-card" x="0.5" y="0.5" width="${f(w - 1)}" height="${f(h - 1)}" rx="8"/><text class="hmi-kpi-title" x="${f(w * .066)}" y="${f(h * .23)}" font-size="${f(Math.max(9, h * .1))}">${escapeXml(p.title || sym.key || "")}</text><text class="hmi-kpi-value" x="${f(w * .066)}" y="${f(h * .6)}" font-size="${big}">${escapeXml(text)}</text>` + (p.subtitle ? `<text class="hmi-kpi-sub" x="${f(w * .066)}" y="${f(h * .84)}" font-size="${f(Math.max(9, h * .1))}">${escapeXml(p.subtitle)}</text>` : "") + "</g>";
	}
	function renderText(sym, value, opts) {
		const p = sym.props || {};
		const align = ["start", "end"].includes(p.align) ? p.align : "middle";
		const x = align === "start" ? 0 : align === "end" ? sym.w : sym.w / 2;
		let text = p.text || "";
		if (sym.key) text = (text ? text + " " : "") + formatValue(value, p.decimals, opts.locale) + (p.unit ? " " + p.unit : "");
		const size = Math.max(6, Number(p.size) || 16);
		const unknown = sym.key && (value === void 0 || value === null) ? " hmi-unknown" : "";
		return `<g class="hmi-text hmi-tone-${p.tone === "dim" ? "dim" : "normal"}${unknown}"><rect class="hmi-hitbox" x="0" y="0" width="${f(sym.w)}" height="${f(sym.h)}"/><text x="${f(x)}" y="${f(sym.h / 2)}" font-size="${f(size)}" style="text-anchor:${align}" font-weight="${p.bold === "yes" ? 700 : 400}">${escapeXml(text)}</text></g>`;
	}
	function renderLed(sym, value) {
		const p = sym.props || {};
		const on = onState(value, p);
		const r = Math.max(3, Math.min(sym.w, sym.h) / 2 - 1.5);
		return `<g class="hmi-led ${stateClass(on)} ${colorClass(p)}${blinkClass(p, on)}"><circle class="hmi-dot" cx="${f(sym.w / 2)}" cy="${f(sym.h / 2)}" r="${f(r)}"/>` + labelBelow(p, sym.w, sym.h) + "</g>";
	}
	function renderChip(sym, value, opts) {
		const p = sym.props || {};
		const w = sym.w;
		const h = sym.h;
		const on = onState(value, p);
		let text = on ? p.textOn : p.textOff;
		if (on === null) text = "—";
		else if (!text) text = formatValue(value, "", opts.locale);
		return `<g class="hmi-chip ${stateClass(on)} ${colorClass(p)}${blinkClass(p, on)}"><rect class="hmi-chip-box" x="0.5" y="0.5" width="${f(w - 1)}" height="${f(h - 1)}" rx="${f(h / 2)}"/><circle class="hmi-dot" cx="${f(h / 2)}" cy="${f(h / 2)}" r="${f(h * .19)}"/><text class="hmi-chip-text" x="${f(h * .95)}" y="${f(h / 2)}" font-size="${f(Math.max(9, h * .36))}">${escapeXml(text)}</text></g>`;
	}
	function renderAlarm(sym, value, opts) {
		const p = sym.props || {};
		const w = sym.w;
		const h = sym.h;
		const on = onState(value, p);
		if (!on && !opts.editor) return "";
		const pr = [
			"1",
			"2",
			"3"
		].includes(String(p.priority)) ? String(p.priority) : "1";
		const ix = Math.min(h * .45, 40);
		const left = ix * 2;
		const avail = Math.max(20, w - left - 12);
		const tx = left + avail / 2;
		const size = Math.max(9, Math.min(h * .32, avail / (Math.max(4, (p.text || "").length) * .68)));
		const subSize = Math.max(8, Math.min(size * .5, avail / (Math.max(4, (p.sub || "").length) * .56)));
		return `<g class="hmi-alarm-banner hmi-p${pr} ${on ? "hmi-on" : "hmi-off hmi-ghost"}${blinkClass(p, on)}"><rect class="hmi-alarm-box" x="1" y="1" width="${f(w - 2)}" height="${f(h - 2)}" rx="10"/>` + alarmIndicator(ix, h / 2, pr) + `<text class="hmi-alarm-text" x="${f(tx)}" y="${f(p.sub ? h * .44 : h / 2)}" font-size="${f(size)}">${escapeXml(p.text || "")}</text>` + (p.sub ? `<text class="hmi-alarm-sub" x="${f(tx)}" y="${f(h * .76)}" font-size="${f(subSize)}">${escapeXml(p.sub)}</text>` : "") + "</g>";
	}
	function renderTag(sym, value, opts) {
		const p = sym.props || {};
		const w = sym.w;
		const h = sym.h;
		const min = num(p.min);
		const max = num(p.max);
		const bar = min !== null && max !== null && max > min;
		const state = rangeState(value, p.lo, p.hi);
		const cls = state === null ? "hmi-unknown" : state === "alarm" ? "hmi-alarm" : "hmi-normal";
		const titleSize = f(Math.max(9, Math.min(14, h * .2)));
		const valueSize = f(Math.max(11, Math.min(32, h * (bar ? .3 : .36))));
		const text = formatValue(value, p.decimals, opts && opts.locale) + (p.unit ? " " + p.unit : "");
		let out = `<g class="hmi-tag ${cls}"><rect class="hmi-tag-box" x="0.5" y="0.5" width="${f(w - 1)}" height="${f(h - 1)}" rx="3"/><text class="hmi-tag-title" x="${f(w / 2)}" y="${f(h * .3)}" font-size="${titleSize}">${escapeXml(p.title || sym.key || "")}</text><text class="hmi-tag-value" x="${f(w / 2)}" y="${f(h * (bar ? .66 : .76))}" font-size="${valueSize}">${escapeXml(text)}</text>`;
		if (bar) {
			const x0 = 8;
			const x1 = w - 8;
			const y = h - 10;
			const X = (v) => f(x0 + (Math.max(min, Math.min(max, v)) - min) / (max - min) * (x1 - x0));
			out += `<rect class="hmi-bar-track" x="${x0}" y="${f(y)}" width="${f(x1 - x0)}" height="4"/>`;
			const lo = num(p.lo);
			const hi = num(p.hi);
			if (lo !== null || hi !== null) {
				const a = X(lo === null ? min : lo);
				const b = X(hi === null ? max : hi);
				out += `<rect class="hmi-bar-normal" x="${a}" y="${f(y)}" width="${f(Math.max(0, b - a))}" height="4"/>`;
			}
			const v = num(value);
			if (v !== null) out += `<polygon class="hmi-bar-ptr" points="${X(v)},${f(y - 1)} ${f(X(v) - 4)},${f(y - 7)} ${f(Number(X(v)) + 4)},${f(y - 7)}"/>`;
		}
		if (state === "alarm") out += alarmIndicator(w - 2, 2, p.priority);
		return out + "</g>";
	}
	function renderSymbol(sym, value, opts) {
		const def = SYMBOLS[sym.type];
		if (!def) return "";
		const o = opts || {};
		const fx = ruleEffects(sym, o.values || {});
		if (fx.hide && !o.editor) return "";
		const cls = "hmi-symbol" + fx.classes.map((c) => " " + c).join("") + (fx.hide ? " hmi-rule-hidden" : "");
		const rot = Number(sym.rot) || 0;
		const tf = `translate(${f(sym.x)},${f(sym.y)})` + (rot ? ` rotate(${f(rot)},${f(sym.w / 2)},${f(sym.h / 2)})` : "");
		return `<g class="${cls}" data-id="${escapeXml(sym.id)}" transform="${tf}">${def.render(sym, value, o)}</g>`;
	}
	var STYLE_ID = "hmi-symbols-style";
	var CSS = `
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
.hmi-root .hmi-rule-alarm :is(.hmi-body, .hmi-tag-box, .hmi-chip-box, .hmi-button-box, .hmi-setpoint-box, .hmi-switch-track, .hmi-kpi-card, .hmi-blade, .hmi-dot, .hmi-level, .hmi-vbar-fill) { fill: var(--hmi-alarm) !important; }
.hmi-root .hmi-rule-warn :is(.hmi-body, .hmi-tag-box, .hmi-chip-box, .hmi-button-box, .hmi-setpoint-box, .hmi-switch-track, .hmi-kpi-card, .hmi-blade, .hmi-dot, .hmi-level, .hmi-vbar-fill) { fill: var(--hmi-warn) !important; }
.hmi-root .hmi-rule-info :is(.hmi-body, .hmi-tag-box, .hmi-chip-box, .hmi-button-box, .hmi-setpoint-box, .hmi-switch-track, .hmi-kpi-card, .hmi-blade, .hmi-dot, .hmi-level, .hmi-vbar-fill) { fill: var(--hmi-info) !important; }
.hmi-root .hmi-rule-ok :is(.hmi-body, .hmi-tag-box, .hmi-chip-box, .hmi-button-box, .hmi-setpoint-box, .hmi-switch-track, .hmi-kpi-card, .hmi-blade, .hmi-dot, .hmi-level, .hmi-vbar-fill) { fill: #2e9d4f !important; }
.hmi-root .hmi-rule-alarm .hmi-path { stroke: var(--hmi-alarm) !important; }
.hmi-root .hmi-rule-warn .hmi-path { stroke: var(--hmi-warn) !important; }
.hmi-root .hmi-rule-info .hmi-path { stroke: var(--hmi-info) !important; }
.hmi-root .hmi-rule-ok .hmi-path { stroke: #2e9d4f !important; }
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
`;
	function injectStyles(doc) {
		const d = doc || (typeof document !== "undefined" ? document : null);
		if (!d || d.getElementById("hmi-symbols-style")) return;
		const el = d.createElement("style");
		el.id = STYLE_ID;
		el.textContent = CSS;
		d.head.appendChild(el);
	}
	//#endregion
	//#region ui/editor/index.js
	var GRID = 10;
	var HANDLES = [
		[
			"nw",
			0,
			0
		],
		[
			"n",
			.5,
			0
		],
		[
			"ne",
			1,
			0
		],
		[
			"e",
			1,
			.5
		],
		[
			"se",
			1,
			1
		],
		[
			"s",
			.5,
			1
		],
		[
			"sw",
			0,
			1
		],
		[
			"w",
			0,
			.5
		]
	];
	var CURSORS = [
		"ns-resize",
		"nesw-resize",
		"ew-resize",
		"nwse-resize"
	];
	function handleCursor(dir, rot) {
		return CURSORS[({
			n: 0,
			ne: 1,
			e: 2,
			se: 3,
			s: 0,
			sw: 1,
			w: 2,
			nw: 3
		}[dir] + Math.round(((Number(rot) || 0) % 180 + 180) % 180 / 45)) % 4];
	}
	var CSS_ID = "hmi-editor-style";
	var ICONS = {
		left: "<path d=\"M2 1v14\"/><rect x=\"4\" y=\"3\" width=\"10\" height=\"3\"/><rect x=\"4\" y=\"10\" width=\"6\" height=\"3\"/>",
		hcenter: "<path d=\"M8 1v14\"/><rect x=\"2\" y=\"3\" width=\"12\" height=\"3\"/><rect x=\"4.5\" y=\"10\" width=\"7\" height=\"3\"/>",
		right: "<path d=\"M14 1v14\"/><rect x=\"2\" y=\"3\" width=\"10\" height=\"3\"/><rect x=\"6\" y=\"10\" width=\"6\" height=\"3\"/>",
		top: "<path d=\"M1 2h14\"/><rect x=\"3\" y=\"4\" width=\"3\" height=\"10\"/><rect x=\"10\" y=\"4\" width=\"3\" height=\"6\"/>",
		vcenter: "<path d=\"M1 8h14\"/><rect x=\"3\" y=\"2\" width=\"3\" height=\"12\"/><rect x=\"10\" y=\"4.5\" width=\"3\" height=\"7\"/>",
		bottom: "<path d=\"M1 14h14\"/><rect x=\"3\" y=\"2\" width=\"3\" height=\"10\"/><rect x=\"10\" y=\"6\" width=\"3\" height=\"6\"/>",
		hdist: "<path d=\"M1 1v14M15 1v14\"/><rect x=\"3\" y=\"4\" width=\"3\" height=\"8\"/><rect x=\"10\" y=\"4\" width=\"3\" height=\"8\"/>",
		vdist: "<path d=\"M1 1h14M1 15h14\"/><rect x=\"4\" y=\"3\" width=\"8\" height=\"3\"/><rect x=\"4\" y=\"10\" width=\"8\" height=\"3\"/>",
		samew: "<rect x=\"2\" y=\"2\" width=\"12\" height=\"4\"/><rect x=\"2\" y=\"10\" width=\"12\" height=\"4\"/>",
		sameh: "<rect x=\"2\" y=\"2\" width=\"4\" height=\"12\"/><rect x=\"10\" y=\"2\" width=\"4\" height=\"12\"/>",
		same: "<rect x=\"1.5\" y=\"4\" width=\"6\" height=\"8\"/><rect x=\"8.5\" y=\"4\" width=\"6\" height=\"8\"/>",
		group: "<rect x=\"1\" y=\"1\" width=\"14\" height=\"14\" stroke-dasharray=\"2 2\"/><rect x=\"3.5\" y=\"3.5\" width=\"5\" height=\"5\"/><rect x=\"7.5\" y=\"7.5\" width=\"5\" height=\"5\"/>",
		ungroup: "<rect x=\"1\" y=\"1\" width=\"6\" height=\"6\"/><rect x=\"9\" y=\"9\" width=\"6\" height=\"6\"/>"
	};
	var ACTIONS = [
		["none", "Nada"],
		["value", "Enviar um valor"],
		["toggle", "Inverter (liga / desliga)"],
		["pulse", "Pulso (1 ao apertar, 0 ao soltar)"],
		["input", "Digitar um valor (ajuste)"],
		["page", "Ir para outra página"]
	];
	var clone = (o) => JSON.parse(JSON.stringify(o || []));
	var clipboard = null;
	var RULES_STORE = "hmi-editor-rules";
	var ruleClipboard = null;
	function copyRules(rules) {
		ruleClipboard = clone(rules);
		try {
			localStorage.setItem(RULES_STORE, JSON.stringify(ruleClipboard));
		} catch (e) {}
	}
	function copiedRules() {
		try {
			const saved = JSON.parse(localStorage.getItem(RULES_STORE) || "null");
			if (Array.isArray(saved)) ruleClipboard = saved;
		} catch (e) {}
		return Array.isArray(ruleClipboard) ? ruleClipboard.filter((r) => r && typeof r === "object") : [];
	}
	var CSS$1 = `
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
.hmi-ed { position: relative; }
.hmi-ed-btn.hmi-ed-cat.hmi-ed-open { box-shadow: inset 0 -2px 0 #1e88e5; }
.hmi-ed-menu { position: absolute; z-index: 30; display: grid; grid-template-columns: repeat(auto-fill, 100px); gap: 4px; width: min(560px, calc(100% - 8px)); max-height: 60vh; overflow: auto; padding: 6px; background: var(--hmi-ed-bg); border: 1px solid var(--hmi-ed-border); border-radius: 6px; box-shadow: 0 6px 20px rgba(0, 0, 0, .2); }
.hmi-ed-item { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 6px 4px; border-radius: 4px; cursor: grab; font-size: 11px; line-height: 1.2; text-align: center; user-select: none; }
.hmi-ed-rule { border: 1px solid var(--hmi-ed-border); border-radius: 4px; padding: 6px 6px 0 6px; margin-bottom: 6px; background: var(--hmi-ed-bg); }
.hmi-ed-item:hover { background: var(--hmi-ed-panel); }
.hmi-ed-item svg { width: 72px; height: 44px; display: block; }
.hmi-ed-body { display: flex; min-height: 260px; flex: 1; overflow: hidden; }
.hmi-ed-stage { flex: 1; min-width: 0; padding: 8px; overflow: auto; outline: none; display: flex; align-items: flex-start; justify-content: center; }
.hmi-ed-stage svg { display: block; width: 100%; height: auto; box-shadow: 0 0 0 1px var(--hmi-ed-border); user-select: none; touch-action: none; }
.hmi-ed-full .hmi-ed-stage, .hmi-ed-fill .hmi-ed-stage { align-items: center; }
.hmi-ed-full .hmi-ed-stage svg, .hmi-ed-fill .hmi-ed-stage svg { width: 100%; height: 100%; box-shadow: none; }
.hmi-ed-stage .hmi-symbol { cursor: move; }
.hmi-ed-sel { fill: none; stroke: #1e88e5; stroke-width: 1.5; stroke-dasharray: 5 3; pointer-events: none; }
.hmi-ed-handle { fill: #fff; stroke: #1e88e5; stroke-width: 1.5; }
.hmi-ed-group { fill: none; stroke: #8e44ad; stroke-width: 1.5; stroke-dasharray: 8 3 2 3; pointer-events: none; }
.hmi-ed-tools { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 2px; margin-left: 6px; padding-left: 8px; border-left: 1px solid var(--hmi-ed-border); }
.hmi-ed-btn.hmi-ed-icon { padding: 3px 6px; min-height: 30px; line-height: 0; }
.hmi-ed-icon svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.3; }
.hmi-ed-sep { width: 1px; height: 20px; background: var(--hmi-ed-border); margin: 0 4px; }
.hmi-ed-f input[type=color] { padding: 1px 2px; height: 30px; }
.hmi-ed-grid { stroke: rgba(0, 0, 0, .08); stroke-width: 1; pointer-events: none; }
.hmi-theme-classic .hmi-ed-grid { stroke: rgba(255, 255, 255, .07); }
.hmi-ed-props { width: 230px; flex: none; padding: 8px 10px; border-left: 1px solid var(--hmi-ed-border); overflow: auto; background: var(--hmi-ed-panel); }
.hmi-ed-f { margin-bottom: 6px; }
.hmi-ed-f label { display: block; width: auto; margin: 0 0 2px 0; font-size: 12px; }
.hmi-ed .hmi-ed-f input, .hmi-ed .hmi-ed-f select { width: 100% !important; max-width: none; height: 30px; padding: 2px 6px; font: inherit; border: 1px solid var(--hmi-ed-border); border-radius: 4px; background: var(--hmi-ed-bg); color: var(--hmi-ed-text); margin: 0; }
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
.hmi-ed-marquee { fill: rgba(30, 136, 229, .08); stroke: #1e88e5; stroke-width: 1; stroke-dasharray: 4 3; pointer-events: none; }
.hmi-ed-props h5 { margin: 14px 0 6px 0; font-size: 12px; text-transform: uppercase; letter-spacing: .5px; opacity: .7; }
.hmi-ed-align { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; margin-bottom: 10px; }
.hmi-ed-mid { fill: #1e88e5; fill-opacity: .25; stroke: #1e88e5; stroke-width: 1; cursor: copy; }
`;
	function el(tag, attrs, text) {
		const e = document.createElement(tag);
		for (const [k, v] of Object.entries(attrs || {})) if (k === "class") e.className = v;
		else e.setAttribute(k, v);
		if (text !== void 0) e.textContent = text;
		return e;
	}
	function parsePreview(text) {
		if (text === void 0 || text === null || text === "") return void 0;
		if (text === "true") return true;
		if (text === "false") return false;
		const n = Number(String(text).replace(",", "."));
		return isFinite(n) ? n : text;
	}
	/**
	* opts: symbols, getView() -> {w,h}, getTheme(), getBackground(), getLocale(), buttonClass,
	*       getValues() -> live values shown instead of test values,
	*       actions: [{ label, title, primary, onClick(editor) }], title, fill, onChange()
	*/
	function createEditor(root, opts) {
		injectStyles(document);
		if (!document.getElementById(CSS_ID)) {
			const st = el("style", { id: CSS_ID });
			st.textContent = CSS$1;
			document.head.appendChild(st);
		}
		const o = opts || {};
		const btnClass = "hmi-ed-btn " + (o.buttonClass || "");
		const ed = {
			symbols: clone(o.symbols),
			sel: null,
			multi: [],
			drag: null,
			history: [],
			future: []
		};
		ed.history.push(clone(ed.symbols));
		root.classList.add("hmi-ed");
		if (o.fill) root.classList.add("hmi-ed-fill");
		root.innerHTML = "";
		const toolbar = el("div", { class: "hmi-ed-toolbar" });
		if (o.title) toolbar.appendChild(el("span", { class: "hmi-ed-title" }, o.title));
		const palette = el("span", { class: "hmi-ed-palette" });
		toolbar.appendChild(palette);
		const tools = el("span", { class: "hmi-ed-tools" });
		const toolBtns = [];
		const tool = (icon, title, fn, enabled) => {
			const b = el("button", {
				type: "button",
				class: btnClass + " hmi-ed-icon",
				title
			});
			b.innerHTML = "<svg viewBox=\"0 0 16 16\">" + ICONS[icon] + "</svg>";
			b.addEventListener("click", () => {
				fn();
				stage.focus();
			});
			tools.appendChild(b);
			toolBtns.push([b, enabled]);
		};
		const sep = () => tools.appendChild(el("span", { class: "hmi-ed-sep" }));
		const anySel = () => ed.multi.length > 0;
		tool("left", "Alinhar à esquerda (um só: na tela)", () => align("left"), anySel);
		tool("hcenter", "Centralizar na horizontal (um só: na tela)", () => align("hcenter"), anySel);
		tool("right", "Alinhar à direita (um só: na tela)", () => align("right"), anySel);
		tool("top", "Alinhar no topo (um só: na tela)", () => align("top"), anySel);
		tool("vcenter", "Centralizar na vertical (um só: na tela)", () => align("vcenter"), anySel);
		tool("bottom", "Alinhar na base (um só: na tela)", () => align("bottom"), anySel);
		sep();
		tool("hdist", "Distribuir na horizontal (3 ou mais)", () => align("hdist"), () => units(selection()).length >= 3);
		tool("vdist", "Distribuir na vertical (3 ou mais)", () => align("vdist"), () => units(selection()).length >= 3);
		sep();
		tool("samew", "Mesma largura do último clicado", () => sameSize(true, false), () => sizable().length >= 2);
		tool("sameh", "Mesma altura do último clicado", () => sameSize(false, true), () => sizable().length >= 2);
		tool("same", "Mesmo tamanho do último clicado", () => sameSize(true, true), () => sizable().length >= 2);
		sep();
		tool("group", "Agrupar (Ctrl+G)", () => group(), () => units(selection()).length >= 2);
		tool("ungroup", "Desagrupar (Ctrl+Shift+G)", () => ungroup(), () => selection().some((m) => m.group));
		toolbar.appendChild(tools);
		toolbar.appendChild(el("span", { class: "hmi-ed-spacer" }));
		const msg = el("span", { class: "hmi-ed-msg" });
		toolbar.appendChild(msg);
		const gridLabel = el("label", { class: "hmi-ed-check" });
		const gridBox = el("input", { type: "checkbox" });
		gridBox.checked = true;
		gridLabel.appendChild(gridBox);
		gridLabel.appendChild(document.createTextNode("Grade"));
		toolbar.appendChild(gridLabel);
		const btn = (label, title, onClick, primary) => {
			const b = el("button", {
				type: "button",
				class: btnClass + (primary ? " hmi-ed-primary" : ""),
				title: title || label
			}, label);
			b.addEventListener("click", onClick);
			toolbar.appendChild(b);
			return b;
		};
		btn("↶", "Desfazer (Ctrl+Z)", () => undo());
		btn("↷", "Refazer (Ctrl+Y)", () => redo());
		const api = {};
		for (const a of o.actions || []) a.button = btn(a.label, a.title, () => a.onClick(api), a.primary);
		const body = el("div", { class: "hmi-ed-body" });
		const stage = el("div", {
			class: "hmi-ed-stage",
			tabindex: "0"
		});
		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
		stage.appendChild(svg);
		const props = el("div", { class: "hmi-ed-props" });
		body.appendChild(stage);
		body.appendChild(props);
		root.appendChild(toolbar);
		root.appendChild(body);
		const view = () => {
			const v = o.getView && o.getView() || {};
			return {
				w: Math.max(100, Number(v.w) || 1280),
				h: Math.max(100, Number(v.h) || 720)
			};
		};
		const snap = (v) => gridBox.checked ? Math.round(v / GRID) * GRID : Math.round(v);
		const selected = () => ed.multi.length === 1 ? ed.symbols.find((s) => s.id === ed.sel) : void 0;
		const selection = () => ed.symbols.filter((s) => ed.multi.includes(s.id));
		function select(ids, primary) {
			ed.multi = ids.filter((id, i) => ids.indexOf(id) === i);
			ed.sel = primary !== void 0 && ed.multi.includes(primary) ? primary : ed.multi[ed.multi.length - 1] || null;
		}
		const groupOf = (id) => {
			const s = ed.symbols.find((m) => m.id === id);
			return s && s.group ? ed.symbols.filter((m) => m.group === s.group).map((m) => m.id) : [id];
		};
		function units(list) {
			const out = [];
			const seen = {};
			for (const m of list) if (m.group) {
				if (seen[m.group]) {
					seen[m.group].members.push(m);
					continue;
				}
				seen[m.group] = { members: [m] };
				out.push(seen[m.group]);
			} else out.push({ members: [m] });
			for (const u of out) {
				const bs = u.members.map(box);
				const x = Math.min(...bs.map((b) => b.x));
				const y = Math.min(...bs.map((b) => b.y));
				u.box = {
					x,
					y,
					w: Math.max(...bs.map((b) => b.x + b.w)) - x,
					h: Math.max(...bs.map((b) => b.y + b.h)) - y
				};
			}
			return out;
		}
		const sizable = () => selection().filter((m) => !(SYMBOLS[m.type] && SYMBOLS[m.type].line));
		function box(s) {
			if (((Number(s.rot) || 0) % 180 + 180) % 180 === 90) return {
				x: s.x + s.w / 2 - s.h / 2,
				y: s.y + s.h / 2 - s.w / 2,
				w: s.h,
				h: s.w
			};
			return {
				x: s.x,
				y: s.y,
				w: s.w,
				h: s.h
			};
		}
		const changed = () => {
			const cur = JSON.stringify(ed.symbols);
			if (cur === JSON.stringify(ed.history[ed.history.length - 1])) {
				if (o.onChange) o.onChange(api);
				return;
			}
			ed.history.push(JSON.parse(cur));
			if (ed.history.length > 100) ed.history.shift();
			ed.future = [];
			if (o.onChange) o.onChange(api);
		};
		function restore(list) {
			ed.symbols = clone(list);
			select(ed.multi.filter((id) => ed.symbols.some((s) => s.id === id)), ed.sel);
			refresh();
			if (o.onChange) o.onChange(api);
		}
		function undo() {
			if (ed.history.length < 2) return;
			ed.future.push(ed.history.pop());
			restore(ed.history[ed.history.length - 1]);
		}
		function redo() {
			if (!ed.future.length) return;
			const next = ed.future.pop();
			ed.history.push(next);
			restore(next);
		}
		function toSvg(e) {
			const pt = svg.createSVGPoint();
			pt.x = e.clientX;
			pt.y = e.clientY;
			return pt.matrixTransform(svg.getScreenCTM().inverse());
		}
		function draw() {
			const v = view();
			const theme = (o.getTheme && o.getTheme()) === "classic" ? "classic" : "isa101";
			svg.setAttribute("viewBox", "0 0 " + v.w + " " + v.h);
			svg.setAttribute("class", "hmi-root hmi-theme-" + theme + ((o.getBackground && o.getBackground()) === "transparent" ? " hmi-transparent" : ""));
			let out = "<rect class=\"hmi-bg\" x=\"0\" y=\"0\" width=\"" + v.w + "\" height=\"" + v.h + "\"/>";
			if (gridBox.checked) {
				let g = "";
				for (let x = 50; x < v.w; x += 50) g += "M" + x + " 0V" + v.h;
				for (let y = 50; y < v.h; y += 50) g += "M0 " + y + "H" + v.w;
				out += "<path class=\"hmi-ed-grid\" d=\"" + g + "\"/>";
			}
			const live = o.getValues && o.getValues() || {};
			const previews = {};
			for (const s of ed.symbols) if (s.key && s.preview !== void 0 && !(s.key in previews)) previews[s.key] = s.preview;
			const typed = new Set(Object.keys(previews));
			for (const s of ed.symbols) if (s.key && SYMBOLS[s.type] && !(s.key in previews)) previews[s.key] = s.key in live ? live[s.key] : SYMBOLS[s.type].preview;
			const locale = o.getLocale && o.getLocale();
			const values = {
				...live,
				...previews
			};
			for (const s of ed.symbols) {
				const def = SYMBOLS[s.type];
				if (!def) continue;
				let value = s.preview !== void 0 ? s.preview : s.key ? previews[s.key] : def.preview;
				if (s.preview === void 0 && s.key && !typed.has(s.key) && s.key in live) value = scaleValue(s, value);
				out += renderSymbol(s, value, {
					locale,
					values,
					editor: true
				});
			}
			const s = selected();
			if (s && SYMBOLS[s.type] && SYMBOLS[s.type].line) {
				const pts = linePoints(s);
				out += "<g transform=\"translate(" + s.x + "," + s.y + ")\">";
				for (let i = 0; i < pts.length - 1; i++) out += "<circle class=\"hmi-ed-mid\" data-mid=\"" + i + "\" cx=\"" + (pts[i][0] + pts[i + 1][0]) / 2 + "\" cy=\"" + (pts[i][1] + pts[i + 1][1]) / 2 + "\" r=\"5\"/>";
				pts.forEach((pt, i) => {
					out += "<circle class=\"hmi-ed-point\" data-point=\"" + i + "\" cx=\"" + pt[0] + "\" cy=\"" + pt[1] + "\" r=\"6\"/>";
				});
				out += "</g>";
			} else if (s) {
				const rot = Number(s.rot) || 0;
				const hs = Math.max(8, Math.min(12, view().w / 120));
				out += "<g transform=\"translate(" + s.x + "," + s.y + ")" + (rot ? " rotate(" + rot + "," + s.w / 2 + "," + s.h / 2 + ")" : "") + "\"><rect class=\"hmi-ed-sel\" x=\"-3\" y=\"-3\" width=\"" + (s.w + 6) + "\" height=\"" + (s.h + 6) + "\"/>";
				for (const [dir, hx, hy] of HANDLES) out += "<rect class=\"hmi-ed-handle\" data-handle=\"" + dir + "\" style=\"cursor:" + handleCursor(dir, rot) + "\" x=\"" + (hx * s.w - hs / 2) + "\" y=\"" + (hy * s.h - hs / 2) + "\" width=\"" + hs + "\" height=\"" + hs + "\"/>";
				out += "</g>";
				if (s.group) {
					const u = units(ed.symbols.filter((m) => m.group === s.group))[0];
					out += "<rect class=\"hmi-ed-group\" x=\"" + (u.box.x - 6) + "\" y=\"" + (u.box.y - 6) + "\" width=\"" + (u.box.w + 12) + "\" height=\"" + (u.box.h + 12) + "\"/>";
				}
			} else for (const u of units(selection())) {
				const b = u.box;
				const g = u.members.length > 1 || u.members[0].group;
				out += "<rect class=\"" + (g ? "hmi-ed-group" : "hmi-ed-sel") + "\" x=\"" + (b.x - 3) + "\" y=\"" + (b.y - 3) + "\" width=\"" + (b.w + 6) + "\" height=\"" + (b.h + 6) + "\"/>";
			}
			for (const [b, enabled] of toolBtns) b.disabled = !enabled();
			if (ed.drag && ed.drag.mode === "box") {
				const r = marquee(ed.drag);
				out += "<rect class=\"hmi-ed-marquee\" x=\"" + r.x + "\" y=\"" + r.y + "\" width=\"" + r.w + "\" height=\"" + r.h + "\"/>";
			}
			svg.innerHTML = out;
		}
		function field(label, value, type, onChange, options) {
			const f = el("div", { class: "hmi-ed-f" });
			f.appendChild(el("label", {}, label));
			let input;
			if (type === "select") {
				input = el("select");
				for (const [val, text] of options) input.appendChild(el("option", { value: val }, text));
				input.value = String(value === void 0 ? "" : value);
				if (input.selectedIndex < 0 && options.length) input.value = options[0][0];
			} else {
				input = el("input", { type: ["number", "color"].includes(type) ? type : "text" });
				input.value = value === void 0 || value === null ? type === "color" ? "#000000" : "" : value;
			}
			const handler = () => {
				onChange(input.value);
				draw();
				changed();
			};
			input.addEventListener("input", handler);
			input.addEventListener("change", handler);
			input.addEventListener("keydown", (e) => e.stopPropagation());
			f.appendChild(input);
			return f;
		}
		const pair = (a, b) => {
			const p = el("div", { class: "hmi-ed-pair" });
			const d1 = el("div");
			const d2 = el("div");
			d1.appendChild(a);
			d2.appendChild(b);
			p.appendChild(d1);
			p.appendChild(d2);
			return p;
		};
		function showProps() {
			props.innerHTML = "";
			const s = selected();
			const smallBtn = (parent, label, title, fn) => {
				const b = el("button", {
					type: "button",
					class: btnClass + " hmi-ed-small",
					title
				}, label);
				b.addEventListener("click", fn);
				parent.appendChild(b);
			};
			const editRow = () => {
				const row = el("div", { class: "hmi-ed-btnrow" });
				for (const [label, title, fn] of [
					[
						"Duplicar",
						"Ctrl+D",
						duplicate
					],
					[
						"Frente",
						"Trazer para a frente",
						() => order(1)
					],
					[
						"Trás",
						"Mandar para trás",
						() => order(-1)
					],
					[
						"Excluir",
						"Delete",
						remove
					]
				]) smallBtn(row, label, title, fn);
				props.appendChild(row);
			};
			if (ed.multi.length > 1) {
				const us = units(selection());
				props.appendChild(el("h4", {}, us.length === 1 ? "Grupo (" + ed.multi.length + " símbolos)" : ed.multi.length + " símbolos"));
				editRow();
				const grow = el("div", { class: "hmi-ed-btnrow" });
				if (us.length > 1) smallBtn(grow, "Agrupar", "Ctrl+G", group);
				if (selection().some((m) => m.group)) smallBtn(grow, "Desagrupar", "Ctrl+Shift+G", ungroup);
				props.appendChild(grow);
				if (us.length === 1) props.appendChild(el("div", { class: "hmi-ed-hint" }, "Clique move o grupo inteiro. Duplo clique num símbolo edita só ele."));
				const ss = el("div", { class: "hmi-ed-btnrow" });
				if (sizable().length >= 2) {
					props.appendChild(el("h5", {}, "Tamanho (igual ao último clicado)"));
					smallBtn(ss, "Largura", "Mesma largura", () => sameSize(true, false));
					smallBtn(ss, "Altura", "Mesma altura", () => sameSize(false, true));
					smallBtn(ss, "Os dois", "Mesmo tamanho", () => sameSize(true, true));
					props.appendChild(ss);
				}
				props.appendChild(el("h5", {}, "Alinhar"));
				const grid = el("div", { class: "hmi-ed-align" });
				for (const [label, title, kind] of [
					[
						"Esquerda",
						"Alinhar à esquerda",
						"left"
					],
					[
						"Centro",
						"Centralizar na horizontal",
						"hcenter"
					],
					[
						"Direita",
						"Alinhar à direita",
						"right"
					],
					[
						"Topo",
						"Alinhar no topo",
						"top"
					],
					[
						"Meio",
						"Centralizar na vertical",
						"vcenter"
					],
					[
						"Base",
						"Alinhar na base",
						"bottom"
					]
				]) smallBtn(grid, label, title, () => align(kind));
				props.appendChild(grid);
				if (copiedRules().length) {
					props.appendChild(el("h5", {}, "Regras"));
					const rr = el("div", { class: "hmi-ed-btnrow" });
					pasteRulesButton(rr, smallBtn, selection());
					props.appendChild(rr);
				}
				props.appendChild(el("h5", {}, "Distribuir (3 ou mais)"));
				const dist = el("div", { class: "hmi-ed-btnrow" });
				smallBtn(dist, "Na horizontal", "Mesmo espaço entre os símbolos, da esquerda para a direita", () => align("hdist"));
				smallBtn(dist, "Na vertical", "Mesmo espaço entre os símbolos, de cima para baixo", () => align("vdist"));
				props.appendChild(dist);
				props.appendChild(el("div", { class: "hmi-ed-hint" }, "Arraste qualquer um para mover todos. Shift+clique adiciona ou tira da seleção."));
				return;
			}
			if (!s) {
				const h = el("div", { class: "hmi-ed-hint" });
				h.innerHTML = "Arraste um símbolo da barra de cima para a tela.<br><br>Clique num símbolo para editar. Arraste para mover e use o quadrado azul para redimensionar.<br><br>Vários símbolos: Shift+clique, ou arraste numa área vazia para fazer um retângulo de seleção.<br><br>Teclas: Delete apaga, setas movem (Shift = 10), Ctrl+Z desfaz, Ctrl+C / Ctrl+V copiam, Ctrl+D duplica, Ctrl+A seleciona tudo, Ctrl+G agrupa.<br><br>Os quadrados brancos em volta do símbolo mudam o tamanho por qualquer lado (Shift nos cantos mantém a proporção).";
				props.appendChild(h);
				return;
			}
			const def = SYMBOLS[s.type];
			props.appendChild(el("h4", {}, def.label));
			editRow();
			props.appendChild(field("Chave do payload", s.key, "text", (v) => {
				s.key = v.trim();
			}));
			props.appendChild(pair(field("X", s.x, "number", (v) => {
				s.x = Number(v) || 0;
			}), field("Y", s.y, "number", (v) => {
				s.y = Number(v) || 0;
			})));
			if (def.line) props.appendChild(el("div", { class: "hmi-ed-hint" }, "Arraste os pontos brancos. Puxe o ponto azul do meio para criar uma curva; duplo clique num ponto apaga."));
			else {
				props.appendChild(pair(field("Largura", s.w, "number", (v) => {
					s.w = Math.max(10, Number(v) || 10);
				}), field("Altura", s.h, "number", (v) => {
					s.h = Math.max(10, Number(v) || 10);
				})));
				props.appendChild(field("Rotação", s.rot || 0, "select", (v) => {
					s.rot = Number(v);
				}, [
					["0", "0°"],
					["90", "90°"],
					["180", "180°"],
					["270", "270°"]
				]));
			}
			for (const fd of def.fields) {
				if (fd.when && !fd.when(s.props)) continue;
				props.appendChild(field(fd.label, s.props[fd.key], fd.type, (v) => {
					s.props[fd.key] = fd.type === "number" && v !== "" ? Number(v) : v;
					if (fd.refresh) setTimeout(showProps);
				}, fd.options));
			}
			props.appendChild(field("Valor de teste (só no editor)", s.preview === void 0 ? "" : String(s.preview), "text", (v) => {
				const p = parsePreview(v);
				if (p === void 0) delete s.preview;
				else s.preview = p;
			}));
			if (def.image) imageFields(s, smallBtn);
			if (!def.line && !def.image && !["frame", "stack"].includes(s.type)) {
				props.appendChild(el("h5", {}, "Escala do valor"));
				const sc = s.scale || {};
				const setSc = (k, v) => {
					s.scale = {
						factor: "",
						offset: "",
						...s.scale,
						[k]: v
					};
					if (s.scale.factor === "" && s.scale.offset === "") delete s.scale;
				};
				props.appendChild(pair(field("Multiplicar por", sc.factor ?? "", "text", (v) => setSc("factor", v.replace(",", ".").trim())), field("Somar", sc.offset ?? "", "text", (v) => setSc("offset", v.replace(",", ".").trim()))));
				props.appendChild(el("div", { class: "hmi-ed-hint" }, "Mostra valor × multiplicar + somar. Ex.: 0,1 para um CLP que manda 1450 e a tela mostra 145,0."));
			}
			ruleFields(s, smallBtn);
			if (def.line || s.type === "frame") return;
			props.appendChild(el("h5", {}, "Ao clicar no dashboard"));
			const act = s.action || { mode: "none" };
			const setAct = (k, v) => {
				s.action = {
					mode: "none",
					value: "",
					topic: "",
					confirm: "no",
					min: "",
					max: "",
					...s.action,
					[k]: v
				};
				if (s.action.mode === "none") delete s.action;
			};
			props.appendChild(field("Ação", act.mode || "none", "select", (v) => {
				setAct("mode", v);
				setTimeout(showProps);
			}, ACTIONS));
			if (act.mode && act.mode !== "none") {
				if (act.mode === "value") props.appendChild(field("Valor enviado", act.value, "text", (v) => setAct("value", v)));
				if (act.mode === "input") props.appendChild(pair(field("Mínimo", act.min, "number", (v) => setAct("min", v)), field("Máximo", act.max, "number", (v) => setAct("max", v))));
				if (act.mode === "page") {
					const pages = o.getPages && o.getPages() || [];
					const pf = pages.length ? field("Página", act.value, "select", (v) => setAct("value", v), [["", "(escolha)"], ...pages]) : field("Página (caminho, ex. /linha2)", act.value, "text", (v) => setAct("value", v.trim()));
					props.appendChild(pf);
				} else {
					const t = field("Tópico (vazio = chave do payload)", act.topic, "text", (v) => setAct("topic", v));
					t.querySelector("input").placeholder = s.key || "";
					props.appendChild(t);
				}
				if ([
					"value",
					"toggle",
					"page"
				].includes(act.mode)) props.appendChild(field("Pedir confirmação", act.confirm || "no", "select", (v) => setAct("confirm", v), [["no", "Não"], ["yes", "Sim"]]));
				if (act.mode !== "page") props.appendChild(el("div", { class: "hmi-ed-hint" }, "A mensagem sai pela saída do nó: msg.topic e msg.payload."));
			}
		}
		function ruleFields(s, smallBtn) {
			props.appendChild(el("h5", {}, "Regras"));
			const rules = Array.isArray(s.rules) ? s.rules : [];
			rules.forEach((r, i) => {
				const card = el("div", { class: "hmi-ed-rule" });
				const kf = field("Chave (vazio = a do símbolo)", r.key, "text", (v) => {
					r.key = v.trim();
				});
				kf.querySelector("input").placeholder = s.key || "";
				card.appendChild(kf);
				card.appendChild(pair(field("Quando", r.op || "on", "select", (v) => {
					r.op = v;
				}, RULE_OPS), field("Valor", r.value ?? "", "text", (v) => {
					r.value = v;
				})));
				card.appendChild(field("Efeito", r.effect || "alarm", "select", (v) => {
					r.effect = v;
				}, RULE_EFFECTS));
				const btns = el("div", { class: "hmi-ed-btnrow" });
				smallBtn(btns, "Copiar", "Copiar esta regra para colar em outro símbolo", () => {
					copyRules([r]);
					refresh();
				});
				smallBtn(btns, "Remover", "Apagar esta regra", () => {
					s.rules = rules.filter((x, k) => k !== i);
					if (!s.rules.length) delete s.rules;
					refresh();
					changed();
				});
				card.appendChild(btns);
				props.appendChild(card);
			});
			const row = el("div", { class: "hmi-ed-btnrow" });
			smallBtn(row, "+ Regra", "Mudar cor, piscar ou esconder conforme um valor", () => {
				s.rules = [...rules, {
					key: "",
					op: "on",
					value: "",
					effect: "alarm"
				}];
				refresh();
				changed();
			});
			if (rules.length > 1) smallBtn(row, "Copiar todas", "Copiar as " + rules.length + " regras", () => {
				copyRules(rules);
				refresh();
			});
			pasteRulesButton(row, smallBtn, [s]);
			props.appendChild(row);
			if (!rules.length) props.appendChild(el("div", { class: "hmi-ed-hint" }, "Ex.: esconder a bobina quando \"temBobina\" estiver desligado, ou deixar o corpo vermelho quando \"falha\" ligar. Usa o valor do CLP, sem escala."));
		}
		function pasteRulesButton(row, smallBtn, targets) {
			const copied = copiedRules();
			if (!copied.length) return;
			const n = copied.length;
			smallBtn(row, n === 1 ? "Colar regra" : "Colar " + n + " regras", targets.length > 1 ? "Colar nas " + targets.length + " seleções" : "Adicionar as regras copiadas", () => {
				for (const t of targets) t.rules = [...Array.isArray(t.rules) ? t.rules : [], ...clone(copied)];
				refresh();
				changed();
			});
		}
		function imageFields(s, smallBtn) {
			props.appendChild(el("h5", {}, "Arquivo"));
			for (const [k, label] of [["src", "Imagem"], ["srcOn", "Imagem quando ligado (opcional)"]]) {
				const row = el("div", { class: "hmi-ed-f" });
				row.appendChild(el("label", {}, label));
				const input = el("input", {
					type: "file",
					accept: "image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
				});
				input.style.display = "none";
				const btns = el("div", { class: "hmi-ed-btnrow" });
				smallBtn(btns, s.props[k] ? "Trocar" : "Escolher arquivo", "SVG, PNG, JPG, GIF ou WEBP até 400 KB", () => input.click());
				if (s.props[k]) smallBtn(btns, "Remover", "", () => {
					s.props[k] = "";
					refresh();
					changed();
				});
				input.addEventListener("change", () => {
					const file = input.files && input.files[0];
					if (!file) return;
					if (file.size > 409600) return api.setMessage("Imagem grande demais (máx. 400 KB)");
					const reader = new FileReader();
					reader.onload = () => {
						s.props[k] = String(reader.result);
						const img = new Image();
						img.onload = () => {
							if (k === "src" && img.naturalWidth > 0 && img.naturalHeight > 0) s.h = Math.max(10, Math.round(s.w * img.naturalHeight / img.naturalWidth));
							refresh();
							changed();
						};
						img.onerror = () => {
							refresh();
							changed();
						};
						img.src = s.props[k];
					};
					reader.readAsDataURL(file);
				});
				row.appendChild(btns);
				row.appendChild(input);
				props.appendChild(row);
			}
			const url = field("ou endereço da imagem (URL)", String(s.props.src || "").startsWith("data:") ? "" : s.props.src, "text", (v) => {
				s.props.src = v.trim();
			});
			url.querySelector("input").placeholder = "https://... ou /imagens/maquina.png";
			props.appendChild(url);
		}
		function refresh() {
			draw();
			showProps();
		}
		function add(type, cx, cy, variant) {
			if (!SYMBOLS[type]) return;
			const s = createSymbol(type, 0, 0, isFinite(variant) ? variant : -1);
			s.x = snap(cx - s.w / 2);
			s.y = snap(cy - s.h / 2);
			ed.symbols.push(s);
			select([s.id]);
			refresh();
			changed();
		}
		function remove() {
			if (!ed.multi.length) return;
			ed.symbols = ed.symbols.filter((s) => !ed.multi.includes(s.id));
			select([]);
			refresh();
			changed();
		}
		function paste(src) {
			const list = (Array.isArray(src) ? src : [src]).filter((x) => x && SYMBOLS[x.type]);
			if (!list.length) return;
			const groups = {};
			const out = list.map((x) => {
				const c = createSymbol(x.type, x.x + 20, x.y + 20);
				Object.assign(c, clone(x), {
					id: c.id,
					x: x.x + 20,
					y: x.y + 20
				});
				if (x.group) c.group = groups[x.group] || (groups[x.group] = newGroupId());
				return c;
			});
			ed.symbols.push(...out);
			select(out.map((c) => c.id));
			refresh();
			changed();
			return clone(out);
		}
		function duplicate() {
			paste(selection());
		}
		function order(dir) {
			const picked = selection();
			if (!picked.length) return;
			const rest = ed.symbols.filter((s) => !ed.multi.includes(s.id));
			ed.symbols = dir > 0 ? [...rest, ...picked] : [...picked, ...rest];
			draw();
			changed();
		}
		function align(kind) {
			const us = units(selection());
			if (!us.length) return;
			const shift = (u, dx, dy) => {
				for (const m of u.members) {
					m.x = Math.round(m.x + dx);
					m.y = Math.round(m.y + dy);
				}
			};
			const bs = us.map((u) => u.box);
			let L = Math.min(...bs.map((b) => b.x));
			let R = Math.max(...bs.map((b) => b.x + b.w));
			let T = Math.min(...bs.map((b) => b.y));
			let B = Math.max(...bs.map((b) => b.y + b.h));
			if (us.length === 1) {
				const v = view();
				L = 0;
				T = 0;
				R = v.w;
				B = v.h;
			}
			if (kind === "hdist" || kind === "vdist") {
				if (us.length < 3) return api.setMessage("Selecione 3 ou mais para distribuir");
				const hz = kind === "hdist";
				const idx = us.map((u, i) => i).sort((a, b) => hz ? bs[a].x - bs[b].x : bs[a].y - bs[b].y);
				const total = idx.reduce((t, i) => t + (hz ? bs[i].w : bs[i].h), 0);
				const gap = ((hz ? R - L : B - T) - total) / (us.length - 1);
				let pos = hz ? L : T;
				for (const i of idx) {
					if (hz) shift(us[i], pos - bs[i].x, 0);
					else shift(us[i], 0, pos - bs[i].y);
					pos += (hz ? bs[i].w : bs[i].h) + gap;
				}
			} else us.forEach((u, i) => {
				const b = bs[i];
				const dx = {
					left: L - b.x,
					hcenter: (L + R) / 2 - (b.x + b.w / 2),
					right: R - (b.x + b.w)
				}[kind] || 0;
				const dy = {
					top: T - b.y,
					vcenter: (T + B) / 2 - (b.y + b.h / 2),
					bottom: B - (b.y + b.h)
				}[kind] || 0;
				shift(u, dx, dy);
			});
			refresh();
			changed();
		}
		function sameSize(w, h) {
			const list = sizable();
			const ref = list.find((m) => m.id === ed.sel) || list[list.length - 1];
			if (!ref || list.length < 2) return api.setMessage("Selecione 2 ou mais");
			for (const m of list) {
				if (w) m.w = ref.w;
				if (h) m.h = ref.h;
			}
			refresh();
			changed();
		}
		const newGroupId = () => "g" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
		function group() {
			const list = selection();
			if (units(list).length < 2) return;
			const id = newGroupId();
			for (const m of list) m.group = id;
			refresh();
			changed();
		}
		function ungroup() {
			const list = selection();
			if (!list.some((m) => m.group)) return;
			for (const m of list) delete m.group;
			refresh();
			changed();
		}
		function marquee(d) {
			return {
				x: Math.min(d.start.x, d.cur.x),
				y: Math.min(d.start.y, d.cur.y),
				w: Math.abs(d.cur.x - d.start.x),
				h: Math.abs(d.cur.y - d.start.y)
			};
		}
		function normalizeLine(s) {
			const pts = linePoints(s);
			if (!pts.length) return;
			const minX = Math.min(...pts.map((p) => p[0]));
			const minY = Math.min(...pts.map((p) => p[1]));
			s.x += minX;
			s.y += minY;
			s.props.points = pts.map((p) => [p[0] - minX, p[1] - minY]);
			s.w = Math.max(1, Math.max(...s.props.points.map((p) => p[0])));
			s.h = Math.max(1, Math.max(...s.props.points.map((p) => p[1])));
		}
		let menu = null;
		const closeMenu = () => {
			if (!menu) return;
			menu.remove();
			menu = null;
			palette.querySelectorAll(".hmi-ed-open").forEach((b) => b.classList.remove("hmi-ed-open"));
		};
		const icon = (it) => {
			const sym = createSymbol(it.type, 0, 0, it.variant);
			const def = SYMBOLS[it.type];
			const theme = (o.getTheme && o.getTheme()) === "classic" ? "classic" : "isa101";
			const vb = def.line ? [
				-4,
				-20,
				sym.w + 8,
				40
			] : [
				-4,
				-4,
				sym.w + 8,
				sym.h + 8
			];
			return "<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"hmi-root hmi-theme-" + theme + " hmi-transparent\" viewBox=\"" + vb.join(" ") + "\" preserveAspectRatio=\"xMidYMid meet\">" + renderSymbol(sym, def.preview, {
				editor: true,
				values: {}
			}) + "</svg>";
		};
		function openMenu(cat, btn) {
			menu = el("div", { class: "hmi-ed-menu" });
			btn.classList.add("hmi-ed-open");
			for (const it of paletteItems(cat)) {
				const item = el("div", {
					class: "hmi-ed-item",
					draggable: "true",
					title: "Arraste para a tela ou clique"
				});
				item.innerHTML = icon(it);
				item.appendChild(el("span", {}, it.label));
				item.addEventListener("dragstart", (e) => {
					e.dataTransfer.setData("text/plain", "hmi:" + it.type + ":" + it.variant);
					menu.style.opacity = "0";
				});
				item.addEventListener("dragend", closeMenu);
				item.addEventListener("click", () => {
					const v = view();
					add(it.type, v.w / 2, v.h / 2, it.variant);
					closeMenu();
				});
				menu.appendChild(item);
			}
			root.appendChild(menu);
			const rb = root.getBoundingClientRect();
			const bb = btn.getBoundingClientRect();
			menu.style.left = Math.max(4, Math.min(bb.left - rb.left, rb.width - menu.offsetWidth - 4)) + "px";
			menu.style.top = bb.bottom - rb.top + 4 + "px";
		}
		for (const cat of CATEGORIES) {
			if (!paletteItems(cat).length) continue;
			const b = el("button", {
				type: "button",
				class: btnClass + " hmi-ed-cat"
			}, cat + " ▾");
			b.addEventListener("click", (e) => {
				e.stopPropagation();
				const same = b.classList.contains("hmi-ed-open");
				closeMenu();
				if (!same) openMenu(cat, b);
			});
			palette.appendChild(b);
		}
		const outside = (e) => {
			if (menu && !menu.contains(e.target) && !e.target.closest(".hmi-ed-cat")) closeMenu();
		};
		document.addEventListener("pointerdown", outside, true);
		stage.addEventListener("dragover", (e) => {
			e.preventDefault();
		});
		stage.addEventListener("drop", (e) => {
			const data = e.dataTransfer.getData("text/plain") || "";
			if (!data.startsWith("hmi:")) return;
			e.preventDefault();
			const p = toSvg(e);
			const [, type, variant] = data.split(":");
			add(type, p.x, p.y, Number(variant));
		});
		let lastDown = {
			what: null,
			t: 0
		};
		const isDouble = (what) => {
			const now = Date.now();
			const dbl = lastDown.what === what && now - lastDown.t < 450;
			lastDown = {
				what: dbl ? null : what,
				t: now
			};
			return dbl;
		};
		svg.addEventListener("pointerdown", (e) => {
			stage.focus();
			const p = toSvg(e);
			const pointEl = e.target.closest("[data-point], [data-mid]");
			if (pointEl && pointEl.hasAttribute("data-point") && isDouble("pt" + pointEl.getAttribute("data-point"))) {
				const s = selected();
				const i = Number(pointEl.getAttribute("data-point"));
				if (s && linePoints(s).length > 2) {
					s.props.points = linePoints(s).filter((pt, k) => k !== i);
					normalizeLine(s);
					refresh();
					changed();
				}
				e.preventDefault();
				return;
			}
			if (pointEl && selected()) {
				const s = selected();
				let i = Number(pointEl.getAttribute("data-point"));
				if (pointEl.hasAttribute("data-mid")) {
					i = Number(pointEl.getAttribute("data-mid")) + 1;
					const pts = linePoints(s);
					pts.splice(i, 0, [p.x - s.x, p.y - s.y]);
					s.props.points = pts;
				}
				ed.drag = {
					mode: "point",
					i,
					start: p,
					moved: pointEl.hasAttribute("data-mid")
				};
			} else if (e.target.closest("[data-handle]")) {
				const s = selected();
				ed.drag = {
					mode: "size",
					dir: e.target.closest("[data-handle]").getAttribute("data-handle"),
					start: p,
					x: s.x,
					y: s.y,
					w: s.w,
					h: s.h
				};
			} else {
				const g = e.target.closest(".hmi-symbol");
				const adding = e.shiftKey || e.ctrlKey || e.metaKey;
				if (!g) {
					if (!adding) select([]);
					ed.drag = {
						mode: "box",
						start: p,
						cur: p,
						base: [...ed.multi]
					};
					refresh();
				} else {
					const id = g.getAttribute("data-id");
					const mates = isDouble(id) && !adding ? [id] : groupOf(id);
					if (mates.length === 1 && ed.multi.length > 1 && groupOf(id).length > 1) select([id]);
					if (adding) {
						if (ed.multi.includes(id)) select(ed.multi.filter((x) => !mates.includes(x)));
						else select([...ed.multi, ...mates], id);
						refresh();
						e.preventDefault();
						return;
					}
					let narrow = null;
					if (ed.multi.includes(id)) {
						ed.sel = id;
						if (ed.multi.length > mates.length) narrow = mates;
					} else select(mates, id);
					ed.drag = {
						mode: "move",
						start: p,
						narrow,
						id,
						orig: selection().map((m) => ({
							m,
							x: m.x,
							y: m.y
						}))
					};
					refresh();
				}
			}
			svg.setPointerCapture(e.pointerId);
			e.preventDefault();
		});
		svg.addEventListener("pointermove", (e) => {
			const d = ed.drag;
			if (!d) return;
			const p = toSvg(e);
			if (d.mode === "box") {
				d.cur = p;
				const r = marquee(d);
				const hits = ed.symbols.filter((m) => {
					const b = box(m);
					return b.x < r.x + r.w && b.x + b.w > r.x && b.y < r.y + r.h && b.y + b.h > r.y;
				}).flatMap((m) => groupOf(m.id));
				select([...d.base, ...hits]);
				draw();
				return;
			}
			if (d.mode === "move") {
				const lead = d.orig.find((o) => o.m.id === ed.sel) || d.orig[0];
				if (!lead) return;
				const dx = snap(lead.x + p.x - d.start.x) - lead.x;
				const dy = snap(lead.y + p.y - d.start.y) - lead.y;
				for (const o of d.orig) {
					o.m.x = o.x + dx;
					o.m.y = o.y + dy;
				}
				d.moved = true;
				draw();
				return;
			}
			const s = selected();
			if (!s) return;
			if (d.mode === "point") {
				const pts = linePoints(s);
				pts[d.i] = [snap(p.x) - s.x, snap(p.y) - s.y];
				s.props.points = pts;
				s.w = Math.max(1, ...pts.map((q) => q[0]));
				s.h = Math.max(1, ...pts.map((q) => q[1]));
			} else resize(s, d, p, e.shiftKey);
			d.moved = true;
			draw();
		});
		function resize(s, d, p, keepRatio) {
			const rot = (Number(d.rot !== void 0 ? d.rot : s.rot) || 0) * Math.PI / 180;
			const cos = Math.cos(rot);
			const sin = Math.sin(rot);
			const wx = p.x - d.start.x;
			const wy = p.y - d.start.y;
			const lx = wx * cos + wy * sin;
			const ly = -wx * sin + wy * cos;
			let l = 0;
			let t = 0;
			let r = d.w;
			let b = d.h;
			const has = (c) => d.dir.includes(c);
			if (has("e")) r += lx;
			if (has("w")) l += lx;
			if (has("s")) b += ly;
			if (has("n")) t += ly;
			if (!rot) {
				if (has("e")) r = snap(d.x + r) - d.x;
				if (has("w")) l = snap(d.x + l) - d.x;
				if (has("s")) b = snap(d.y + b) - d.y;
				if (has("n")) t = snap(d.y + t) - d.y;
			}
			if (keepRatio && d.dir.length === 2 && d.w > 0 && d.h > 0) {
				const k = Math.max((r - l) / d.w, (b - t) / d.h);
				const nw = d.w * k;
				const nh = d.h * k;
				if (has("e")) r = l + nw;
				else l = r - nw;
				if (has("s")) b = t + nh;
				else t = b - nh;
			}
			const MIN = 10;
			if (r - l < MIN) {
				if (has("w")) l = r - MIN;
				else r = l + MIN;
			}
			if (b - t < MIN) {
				if (has("n")) t = b - MIN;
				else b = t + MIN;
			}
			const nw = r - l;
			const nh = b - t;
			const dcx = (l + r) / 2 - d.w / 2;
			const dcy = (t + b) / 2 - d.h / 2;
			const cx = d.x + d.w / 2 + dcx * cos - dcy * sin;
			const cy = d.y + d.h / 2 + dcx * sin + dcy * cos;
			s.w = Math.round(nw);
			s.h = Math.round(nh);
			s.x = Math.round(cx - nw / 2);
			s.y = Math.round(cy - nh / 2);
		}
		const endDrag = () => {
			if (!ed.drag) return;
			const moved = ed.drag.moved;
			if (ed.drag.mode === "move" && !moved && ed.drag.narrow) select(ed.drag.narrow, ed.drag.id);
			const s = selected();
			if (ed.drag.mode === "point" && s) normalizeLine(s);
			ed.drag = null;
			draw();
			showProps();
			if (moved) changed();
		};
		svg.addEventListener("pointerup", endDrag);
		svg.addEventListener("pointercancel", endDrag);
		stage.addEventListener("keydown", (e) => {
			const k = e.key.toLowerCase();
			if (e.ctrlKey || e.metaKey) {
				if (k === "z" && !e.shiftKey) undo();
				else if (k === "y" || k === "z" && e.shiftKey) redo();
				else if (k === "c" && ed.multi.length) clipboard = clone(selection());
				else if (k === "v" && clipboard) clipboard = paste(clipboard) || clipboard;
				else if (k === "d") duplicate();
				else if (k === "a") {
					select(ed.symbols.map((m) => m.id));
					refresh();
				} else if (k === "g" && e.shiftKey) ungroup();
				else if (k === "g") group();
				else return;
				e.preventDefault();
				e.stopPropagation();
				return;
			}
			const list = selection();
			if (!list.length) return;
			const step = e.shiftKey ? 10 : 1;
			const moves = {
				ArrowLeft: [-step, 0],
				ArrowRight: [step, 0],
				ArrowUp: [0, -step],
				ArrowDown: [0, step]
			};
			if (e.key === "Delete" || e.key === "Backspace") remove();
			else if (e.key === "Escape") {
				select([]);
				refresh();
			} else if (moves[e.key]) {
				for (const m of list) {
					m.x += moves[e.key][0];
					m.y += moves[e.key][1];
				}
				refresh();
				changed();
			} else return;
			e.preventDefault();
			e.stopPropagation();
		});
		gridBox.addEventListener("change", draw);
		Object.assign(api, {
			getSymbols: () => clone(ed.symbols),
			redraw: draw,
			setMessage: (text) => {
				msg.textContent = text || "";
			},
			toggleFull: () => {
				root.classList.toggle("hmi-ed-full");
				draw();
			},
			destroy: () => {
				document.removeEventListener("pointerdown", outside, true);
				root.innerHTML = "";
			}
		});
		refresh();
		return api;
	}
	//#endregion
	exports.CATEGORIES = CATEGORIES;
	exports.CSS = CSS;
	exports.RULE_EFFECTS = RULE_EFFECTS;
	exports.RULE_OPS = RULE_OPS;
	exports.STYLE_ID = STYLE_ID;
	exports.SYMBOLS = SYMBOLS;
	exports.THEMES = THEMES;
	exports.alarmIndicator = alarmIndicator;
	exports.createEditor = createEditor;
	exports.createSymbol = createSymbol;
	exports.escapeXml = escapeXml;
	exports.formatValue = formatValue;
	exports.injectStyles = injectStyles;
	exports.isOn = isOn;
	exports.linePoints = linePoints;
	exports.onState = onState;
	exports.paletteItems = paletteItems;
	exports.parsePreview = parsePreview;
	exports.rangeState = rangeState;
	exports.renderSymbol = renderSymbol;
	exports.ruleEffects = ruleEffects;
	exports.ruleMatch = ruleMatch;
	exports.safeImageSrc = safeImageSrc;
	exports.scaleValue = scaleValue;
	exports.unscaleValue = unscaleValue;
	exports.valueFor = valueFor;
	return exports;
})({});
