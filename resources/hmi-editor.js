var HmiEditor = (function(exports) {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	//#region ui/symbols/index.js
	var THEMES = {
		isa101: "ISA-101",
		classic: "Clássico"
	};
	var ON_FIELDS = [{
		key: "onWhen",
		label: "Ligado quando",
		type: "select",
		options: [["nonzero", "valor ≠ 0 / true"], ["gt", "valor > limite"]]
	}, {
		key: "threshold",
		label: "Limite",
		type: "number"
	}];
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
		frame: {
			label: "Corpo",
			group: "Equipamentos",
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
					options: [
						["rect", "Retângulo"],
						["round", "Cantos redondos"],
						["chamfer", "Chanfrado em cima"],
						["arcLeft", "Curva à esquerda"],
						["arcRight", "Curva à direita"],
						["circle", "Círculo"]
					]
				},
				{
					key: "tone",
					label: "Tom",
					type: "select",
					options: [
						["equip", "Equipamento"],
						["dark", "Escuro"],
						["pit", "Fosso / vazio"]
					]
				},
				{
					key: "label",
					label: "Legenda",
					type: "text"
				}
			],
			render: renderFrame
		},
		line: {
			label: "Linha",
			group: "Equipamentos",
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
		}
	};
	var counter = 0;
	function createSymbol(type, x, y) {
		const def = SYMBOLS[type];
		if (!def) throw new Error("Unknown symbol type: " + type);
		counter = (counter + 1) % 1e6;
		return {
			id: "s" + Date.now().toString(36) + counter.toString(36),
			type,
			x: Math.round(x),
			y: Math.round(y),
			w: def.w,
			h: def.h,
			rot: 0,
			key: "",
			props: JSON.parse(JSON.stringify(def.defaults))
		};
	}
	function valueFor(sym, values) {
		if (!values || !sym.key) return void 0;
		return values[sym.key];
	}
	function isOn(value, rule, threshold) {
		if (value === void 0 || value === null || value === "") return null;
		if (rule === "gt") return Number(value) > Number(threshold);
		if (typeof value === "boolean") return value;
		if (typeof value === "string" && isNaN(Number(value))) return value.length > 0;
		return Number(value) !== 0;
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
		const cls = stateClass(isOn(value, p.onWhen, p.threshold));
		const spokes = [
			-90,
			30,
			150
		].map((a) => {
			const rad = a * Math.PI / 180;
			return `<line x1="${f(cx + Math.cos(rad) * r * .32)}" y1="${f(cy + Math.sin(rad) * r * .32)}" x2="${f(cx + Math.cos(rad) * r * .9)}" y2="${f(cy + Math.sin(rad) * r * .9)}"/>`;
		}).join("");
		const label = labelBelow(p, w, h);
		return `<g class="hmi-reel ${cls}"><circle class="hmi-body" cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}"/><g class="hmi-spin"><circle class="hmi-ring" cx="${f(cx)}" cy="${f(cy)}" r="${f(r * .78)}"/><circle class="hmi-ring" cx="${f(cx)}" cy="${f(cy)}" r="${f(r * .58)}"/><g class="hmi-spokes">${spokes}</g><circle class="hmi-hub" cx="${f(cx)}" cy="${f(cy)}" r="${f(r * .3)}"/></g><circle class="hmi-axle" cx="${f(cx)}" cy="${f(cy)}" r="${f(r * .09)}"/>` + label + "</g>";
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
		return `<g class="hmi-roller ${stateClass(isOn(value, p.onWhen, p.threshold))} hmi-${p.dir === "ccw" ? "ccw" : "cw"}"><g class="hmi-spin"><circle class="hmi-body" cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}"/><line class="hmi-mark" x1="${f(cx)}" y1="${f(cy - r * .7)}" x2="${f(cx)}" y2="${f(cy + r * .7)}"/></g></g>`;
	}
	function renderMotor(sym, value, opts) {
		const p = sym.props || {};
		const w = sym.w;
		const h = sym.h;
		const r = Math.max(6, Math.min(w, h * .86) / 2 - 2);
		const cx = w / 2;
		const cy = r + 2;
		const on = isOn(value, p.onWhen, p.threshold);
		const fault = p.faultKey && opts.values ? isOn(opts.values[p.faultKey], "nonzero") === true : false;
		let out = `<g class="hmi-motor ${stateClass(on)}${fault ? " hmi-fault" : ""}"><rect class="hmi-foot" x="${f(cx - r * .8)}" y="${f(cy + r - 2)}" width="${f(r * 1.6)}" height="${f(Math.max(4, h - cy - r + 2))}" rx="2"/><circle class="hmi-body" cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}"/><text class="hmi-motor-m" x="${f(cx)}" y="${f(cy)}" font-size="${f(r * .9)}">M</text>`;
		if (fault) out += alarmIndicator(w - 4, 6, p.priority);
		return out + labelBelow(p, w, h) + "</g>";
	}
	function framePath(shape, w, h) {
		const c = Math.min(w, h) * .15;
		const a = Math.min(w, h) * .3;
		switch (shape) {
			case "round": return `<rect class="hmi-body" x="0" y="0" width="${f(w)}" height="${f(h)}" rx="${f(Math.min(w, h) * .08)}"/>`;
			case "chamfer": return `<path class="hmi-body" d="M0 ${f(h)}V${f(c)}L${f(c)} 0H${f(w - c)}L${f(w)} ${f(c)}V${f(h)}Z"/>`;
			case "arcLeft": return `<path class="hmi-body" d="M0 ${f(h)}V${f(a)}A${f(a)} ${f(a)} 0 0 1 ${f(a)} 0H${f(w)}V${f(h)}Z"/>`;
			case "arcRight": return `<path class="hmi-body" d="M0 ${f(h)}V0H${f(w - a)}A${f(a)} ${f(a)} 0 0 1 ${f(w)} ${f(a)}V${f(h)}Z"/>`;
			case "circle": return `<ellipse class="hmi-body" cx="${f(w / 2)}" cy="${f(h / 2)}" rx="${f(w / 2)}" ry="${f(h / 2)}"/>`;
			default: return `<rect class="hmi-body" x="0" y="0" width="${f(w)}" height="${f(h)}"/>`;
		}
	}
	function renderFrame(sym) {
		const p = sym.props || {};
		const tone = ["dark", "pit"].includes(p.tone) ? p.tone : "equip";
		const label = p.label ? `<text class="hmi-label" x="${f(sym.w / 2)}" y="${f(sym.h + 18)}">${escapeXml(p.label)}</text>` : "";
		return `<g class="hmi-frame hmi-tone-${tone}">${framePath(p.shape, sym.w, sym.h)}${label}</g>`;
	}
	function linePoints(sym) {
		return (sym.props && Array.isArray(sym.props.points) ? sym.props.points : []).filter((pt) => Array.isArray(pt) && isFinite(pt[0]) && isFinite(pt[1])).map((pt) => [Number(pt[0]), Number(pt[1])]);
	}
	function renderLine(sym, value, opts) {
		const p = sym.props || {};
		const pts = linePoints(sym);
		if (pts.length < 2) return "";
		const d = "M" + pts.map((pt) => f(pt[0]) + " " + f(pt[1])).join("L");
		const on = isOn(value, p.onWhen, p.threshold);
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
		const on = isOn(value, p.onWhen, p.threshold);
		const r = Math.max(3, Math.min(sym.w, sym.h) / 2 - 1.5);
		return `<g class="hmi-led ${stateClass(on)} ${colorClass(p)}${blinkClass(p, on)}"><circle class="hmi-dot" cx="${f(sym.w / 2)}" cy="${f(sym.h / 2)}" r="${f(r)}"/>` + labelBelow(p, sym.w, sym.h) + "</g>";
	}
	function renderChip(sym, value, opts) {
		const p = sym.props || {};
		const w = sym.w;
		const h = sym.h;
		const on = isOn(value, p.onWhen, p.threshold);
		let text = on ? p.textOn : p.textOff;
		if (on === null) text = "—";
		else if (!text) text = formatValue(value, "", opts.locale);
		return `<g class="hmi-chip ${stateClass(on)} ${colorClass(p)}${blinkClass(p, on)}"><rect class="hmi-chip-box" x="0.5" y="0.5" width="${f(w - 1)}" height="${f(h - 1)}" rx="${f(h / 2)}"/><circle class="hmi-dot" cx="${f(h / 2)}" cy="${f(h / 2)}" r="${f(h * .19)}"/><text class="hmi-chip-text" x="${f(h * .95)}" y="${f(h / 2)}" font-size="${f(Math.max(9, h * .36))}">${escapeXml(text)}</text></g>`;
	}
	function renderAlarm(sym, value, opts) {
		const p = sym.props || {};
		const w = sym.w;
		const h = sym.h;
		const on = isOn(value, p.onWhen, p.threshold);
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
		const rot = Number(sym.rot) || 0;
		const tf = `translate(${f(sym.x)},${f(sym.y)})` + (rot ? ` rotate(${f(rot)},${f(sym.w / 2)},${f(sym.h / 2)})` : "");
		return `<g class="hmi-symbol" data-id="${escapeXml(sym.id)}" transform="${tf}">${def.render(sym, value, opts || {})}</g>`;
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
  --hmi-dark: #a9acaf; --hmi-pit: #b9bbbd; --hmi-material: #3d4146;
}
.hmi-root.hmi-theme-classic {
  --hmi-bg: #2a2f36; --hmi-equip: #59626c; --hmi-equip-on: #8794a0; --hmi-stroke: #aab6c1;
  --hmi-line: #7b8895; --hmi-text: #e8edf1; --hmi-text-dim: #9aa4ae; --hmi-tag-bg: #1c2025;
  --hmi-alarm: #ef4444; --hmi-warn: #f59e0b; --hmi-low: #c084fc; --hmi-ok: #22c55e; --hmi-info: #38bdf8;
  --hmi-dark: #3a4148; --hmi-pit: #1b1f23; --hmi-material: #c4d0db;
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
.hmi-root .hmi-reel .hmi-spin { transform-box: fill-box; transform-origin: center; }
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
.hmi-root .hmi-roller .hmi-spin { transform-box: fill-box; transform-origin: center; }
.hmi-root.hmi-theme-classic .hmi-roller.hmi-on.hmi-cw .hmi-spin { animation: hmi-spin .9s linear infinite; }
.hmi-root.hmi-theme-classic .hmi-roller.hmi-on.hmi-ccw .hmi-spin { animation: hmi-spin-ccw .9s linear infinite; }
.hmi-root .hmi-motor .hmi-body { fill: var(--hmi-equip); stroke: var(--hmi-stroke); stroke-width: 2; }
.hmi-root .hmi-motor .hmi-foot { fill: var(--hmi-dark); stroke: var(--hmi-stroke); stroke-width: 1; }
.hmi-root .hmi-motor.hmi-on .hmi-body { fill: var(--hmi-equip-on); }
.hmi-root .hmi-motor.hmi-unknown .hmi-body { stroke-dasharray: 5 3; }
.hmi-root .hmi-motor.hmi-fault .hmi-body { stroke: var(--hmi-alarm); stroke-width: 3; }
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
	var CSS_ID = "hmi-editor-style";
	var clone = (o) => JSON.parse(JSON.stringify(o || []));
	var clipboard = null;
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
.hmi-ed-pal { cursor: grab; }
.hmi-ed-body { display: flex; min-height: 260px; flex: 1; overflow: hidden; }
.hmi-ed-stage { flex: 1; min-width: 0; padding: 8px; overflow: auto; outline: none; display: flex; align-items: flex-start; justify-content: center; }
.hmi-ed-stage svg { display: block; width: 100%; height: auto; box-shadow: 0 0 0 1px var(--hmi-ed-border); user-select: none; touch-action: none; }
.hmi-ed-full .hmi-ed-stage, .hmi-ed-fill .hmi-ed-stage { align-items: center; }
.hmi-ed-full .hmi-ed-stage svg, .hmi-ed-fill .hmi-ed-stage svg { width: 100%; height: 100%; box-shadow: none; }
.hmi-ed-stage .hmi-symbol { cursor: move; }
.hmi-ed-sel { fill: none; stroke: #1e88e5; stroke-width: 1.5; stroke-dasharray: 5 3; pointer-events: none; }
.hmi-ed-handle { fill: #1e88e5; stroke: #fff; stroke-width: 1; cursor: nwse-resize; }
.hmi-ed-grid { stroke: rgba(0, 0, 0, .08); stroke-width: 1; pointer-events: none; }
.hmi-theme-classic .hmi-ed-grid { stroke: rgba(255, 255, 255, .07); }
.hmi-ed-props { width: 230px; flex: none; padding: 8px 10px; border-left: 1px solid var(--hmi-ed-border); overflow: auto; background: var(--hmi-ed-panel); }
.hmi-ed-f { margin-bottom: 6px; }
.hmi-ed-f label { display: block; width: auto; margin: 0 0 2px 0; font-size: 12px; }
.hmi-ed-f input, .hmi-ed-f select { width: 100%; height: 30px; padding: 2px 6px; font: inherit; border: 1px solid var(--hmi-ed-border); border-radius: 4px; background: var(--hmi-ed-bg); color: var(--hmi-ed-text); margin: 0; }
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
		const selected = () => ed.symbols.find((s) => s.id === ed.sel);
		const changed = () => {
			ed.history.push(clone(ed.symbols));
			if (ed.history.length > 100) ed.history.shift();
			ed.future = [];
			if (o.onChange) o.onChange(api);
		};
		function restore(list) {
			ed.symbols = clone(list);
			if (!selected()) ed.sel = null;
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
			for (const s of ed.symbols) if (s.key && SYMBOLS[s.type] && !(s.key in previews)) previews[s.key] = s.key in live ? live[s.key] : SYMBOLS[s.type].preview;
			const locale = o.getLocale && o.getLocale();
			const values = {
				...live,
				...previews
			};
			for (const s of ed.symbols) {
				const def = SYMBOLS[s.type];
				if (!def) continue;
				const value = s.preview !== void 0 ? s.preview : s.key ? previews[s.key] : def.preview;
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
				out += "<g transform=\"translate(" + s.x + "," + s.y + ")" + (rot ? " rotate(" + rot + "," + s.w / 2 + "," + s.h / 2 + ")" : "") + "\"><rect class=\"hmi-ed-sel\" x=\"-3\" y=\"-3\" width=\"" + (s.w + 6) + "\" height=\"" + (s.h + 6) + "\"/><rect class=\"hmi-ed-handle\" data-handle=\"1\" x=\"" + (s.w - 2) + "\" y=\"" + (s.h - 2) + "\" width=\"10\" height=\"10\"/></g>";
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
			} else {
				input = el("input", { type: type === "number" ? "number" : "text" });
				input.value = value === void 0 || value === null ? "" : value;
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
			if (!s) {
				const h = el("div", { class: "hmi-ed-hint" });
				h.innerHTML = "Arraste um símbolo da barra de cima para a tela.<br><br>Clique num símbolo para editar. Arraste para mover e use o quadrado azul para redimensionar.<br><br>Teclas: Delete apaga, setas movem (Shift = 10), Ctrl+Z desfaz, Ctrl+C / Ctrl+V copiam, Ctrl+D duplica.";
				props.appendChild(h);
				return;
			}
			const def = SYMBOLS[s.type];
			props.appendChild(el("h4", {}, def.label));
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
			]) {
				const b = el("button", {
					type: "button",
					class: btnClass + " hmi-ed-small",
					title
				}, label);
				b.addEventListener("click", fn);
				row.appendChild(b);
			}
			props.appendChild(row);
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
			for (const fd of def.fields) props.appendChild(field(fd.label, s.props[fd.key], fd.type, (v) => {
				s.props[fd.key] = fd.type === "number" && v !== "" ? Number(v) : v;
			}, fd.options));
			props.appendChild(field("Valor de teste (só no editor)", s.preview === void 0 ? "" : String(s.preview), "text", (v) => {
				const p = parsePreview(v);
				if (p === void 0) delete s.preview;
				else s.preview = p;
			}));
		}
		function refresh() {
			draw();
			showProps();
		}
		function add(type, cx, cy) {
			const def = SYMBOLS[type];
			if (!def) return;
			const s = createSymbol(type, snap(cx - def.w / 2), snap(cy - def.h / 2));
			ed.symbols.push(s);
			ed.sel = s.id;
			refresh();
			changed();
		}
		function remove() {
			if (!ed.sel) return;
			ed.symbols = ed.symbols.filter((s) => s.id !== ed.sel);
			ed.sel = null;
			refresh();
			changed();
		}
		function paste(src) {
			if (!src || !SYMBOLS[src.type]) return;
			const c = createSymbol(src.type, src.x + 20, src.y + 20);
			Object.assign(c, clone(src), {
				id: c.id,
				x: src.x + 20,
				y: src.y + 20
			});
			ed.symbols.push(c);
			ed.sel = c.id;
			refresh();
			changed();
			return c;
		}
		function duplicate() {
			paste(selected());
		}
		function order(dir) {
			const i = ed.symbols.findIndex((s) => s.id === ed.sel);
			if (i < 0) return;
			const [s] = ed.symbols.splice(i, 1);
			if (dir > 0) ed.symbols.push(s);
			else ed.symbols.unshift(s);
			draw();
			changed();
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
		let lastGroup = null;
		for (const [type, def] of Object.entries(SYMBOLS)) {
			if (def.group && def.group !== lastGroup) {
				palette.appendChild(el("span", { class: "hmi-ed-palgroup" }, def.group));
				lastGroup = def.group;
			}
			const b = el("button", {
				type: "button",
				class: btnClass + " hmi-ed-pal",
				draggable: "true",
				title: "Arraste para a tela ou clique"
			}, "+ " + def.label);
			b.addEventListener("dragstart", (e) => {
				e.dataTransfer.setData("text/plain", "hmi:" + type);
			});
			b.addEventListener("click", () => {
				const v = view();
				add(type, v.w / 2, v.h / 2);
			});
			palette.appendChild(b);
		}
		stage.addEventListener("dragover", (e) => {
			e.preventDefault();
		});
		stage.addEventListener("drop", (e) => {
			const data = e.dataTransfer.getData("text/plain") || "";
			if (!data.startsWith("hmi:")) return;
			e.preventDefault();
			const p = toSvg(e);
			add(data.slice(4), p.x, p.y);
		});
		svg.addEventListener("pointerdown", (e) => {
			stage.focus();
			const p = toSvg(e);
			const pointEl = e.target.closest("[data-point], [data-mid]");
			if (pointEl && selected()) {
				const s = selected();
				let i = Number(pointEl.getAttribute("data-point"));
				if (pointEl.hasAttribute("data-mid")) {
					i = Number(pointEl.getAttribute("data-mid")) + 1;
					const pts = linePoints(s);
					pts.splice(i, 0, [p.x - s.x, p.y - s.y]);
					s.props.points = pts;
				}
				if (e.detail === 2 && pointEl.hasAttribute("data-point") && linePoints(s).length > 2) {
					s.props.points = linePoints(s).filter((pt, k) => k !== i);
					normalizeLine(s);
					refresh();
					changed();
					return;
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
					start: p,
					w: s.w,
					h: s.h
				};
			} else {
				const g = e.target.closest(".hmi-symbol");
				if (!g) {
					ed.sel = null;
					refresh();
					return;
				}
				ed.sel = g.getAttribute("data-id");
				const s = selected();
				ed.drag = {
					mode: "move",
					start: p,
					x: s.x,
					y: s.y
				};
				refresh();
			}
			svg.setPointerCapture(e.pointerId);
			e.preventDefault();
		});
		svg.addEventListener("pointermove", (e) => {
			const d = ed.drag;
			const s = selected();
			if (!d || !s) return;
			const p = toSvg(e);
			if (d.mode === "point") {
				const pts = linePoints(s);
				pts[d.i] = [snap(p.x) - s.x, snap(p.y) - s.y];
				s.props.points = pts;
				s.w = Math.max(1, ...pts.map((q) => q[0]));
				s.h = Math.max(1, ...pts.map((q) => q[1]));
			} else if (d.mode === "move") {
				s.x = snap(d.x + p.x - d.start.x);
				s.y = snap(d.y + p.y - d.start.y);
			} else {
				s.w = Math.max(20, snap(d.w + p.x - d.start.x));
				s.h = Math.max(20, snap(d.h + p.y - d.start.y));
			}
			d.moved = true;
			draw();
		});
		const endDrag = () => {
			if (!ed.drag) return;
			const moved = ed.drag.moved;
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
				else if (k === "c" && selected()) clipboard = clone(selected());
				else if (k === "v" && clipboard) clipboard = paste(clipboard) || clipboard;
				else if (k === "d") duplicate();
				else return;
				e.preventDefault();
				e.stopPropagation();
				return;
			}
			const s = selected();
			if (!s) return;
			const step = e.shiftKey ? 10 : 1;
			const moves = {
				ArrowLeft: [-step, 0],
				ArrowRight: [step, 0],
				ArrowUp: [0, -step],
				ArrowDown: [0, step]
			};
			if (e.key === "Delete" || e.key === "Backspace") remove();
			else if (moves[e.key]) {
				s.x += moves[e.key][0];
				s.y += moves[e.key][1];
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
				root.innerHTML = "";
			}
		});
		refresh();
		return api;
	}
	//#endregion
	exports.CSS = CSS;
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
	exports.parsePreview = parsePreview;
	exports.rangeState = rangeState;
	exports.renderSymbol = renderSymbol;
	exports.valueFor = valueFor;
	return exports;
})({});
