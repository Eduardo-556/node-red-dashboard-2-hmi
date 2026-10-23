var HmiEditor = (function(exports) {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	//#region ui/symbols/overlay.js
	var f$1 = (n) => Math.round(n * 10) / 10;
	var truthy = (v) => v === true || v !== false && v !== null && v !== void 0 && v !== "" && v !== "false" && Number(v) !== 0;
	function interlockOf(act, values) {
		const list = String(act && act.interlock || "").split(",").map((t) => t.trim()).filter(Boolean);
		for (const item of list) {
			const not = item.startsWith("!");
			const key = not ? item.slice(1).trim() : item;
			if (!key) continue;
			const on = truthy((values || {})[key]);
			if (not ? on : !on) return String(act.interlockText || "").trim() || (not ? key + " ligado" : key + " desligado");
		}
		return "";
	}
	function badge(x, y, cls, inner) {
		return `<g class="hmi-ov-badge ${cls}" transform="translate(${f$1(x)},${f$1(y)})"><circle r="9"/>${inner}</g>`;
	}
	function renderOverlay(sym, st) {
		if (!st) return "";
		const w = sym.w;
		const h = sym.h;
		const rot = Number(sym.rot) || 0;
		const tf = `translate(${f$1(sym.x)},${f$1(sym.y)})` + (rot ? ` rotate(${f$1(rot)},${f$1(w / 2)},${f$1(h / 2)})` : "");
		let out = "";
		const box = (cls, pad) => `<rect class="${cls}" x="${f$1(-pad)}" y="${f$1(-pad)}" width="${f$1(w + pad * 2)}" height="${f$1(h + pad * 2)}" rx="4"/>`;
		if (st.flash) out += box("hmi-ov-flash hmi-blink", 8);
		if (st.alarm) out += box("hmi-ov-alarm hmi-ov-p" + st.alarm.priority + (st.alarm.unacked ? " hmi-blink" : ""), 4);
		if (st.pending === "wait") out += box("hmi-ov-wait", 2);
		if (st.pending === "fail") out += box("hmi-ov-fail", 2) + badge(w, h, "hmi-ov-b-fail", "<path d=\"M0 -5v6M0 3.5v1.5\"/>");
		if (st.quality === "bad") out += badge(0, 0, "hmi-ov-b-bad", "<path d=\"M-4 -4l8 8M4 -4l-8 8\"/>");
		else if (st.quality === "uncertain") out += badge(0, 0, "hmi-ov-b-unc", "<path d=\"M-3 -3a3 3 0 1 1 3 3v2M0 5v1\"/>");
		else if (st.quality === "stale") out += badge(0, 0, "hmi-ov-b-stale", "<circle class=\"hmi-ov-clock\" r=\"5\"/><path d=\"M0 -3v3l2.5 1.5\"/>");
		if (st.locked) out += badge(w, 0, "hmi-ov-b-lock", "<rect x=\"-4\" y=\"-1\" width=\"8\" height=\"6\" rx=\"1\"/><path d=\"M-2.5 -1v-2a2.5 2.5 0 0 1 5 0v2\"/>");
		return out ? `<g class="hmi-overlay" data-for="${String(sym.id).replace(/[^\w-]/g, "")}" transform="${tf}">${out}</g>` : "";
	}
	var OVERLAY_CSS = `
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
`;
	//#endregion
	//#region ui/symbols/svgimport.js
	var ALLOWED = /* @__PURE__ */ new Set([
		"svg",
		"g",
		"path",
		"rect",
		"circle",
		"ellipse",
		"line",
		"polyline",
		"polygon",
		"text",
		"tspan",
		"defs",
		"lineargradient",
		"radialgradient",
		"stop",
		"clippath",
		"mask",
		"pattern",
		"use",
		"symbol",
		"title",
		"desc",
		"marker"
	]);
	var ATTRS = /* @__PURE__ */ new Set([
		"id",
		"class",
		"transform",
		"d",
		"x",
		"y",
		"x1",
		"y1",
		"x2",
		"y2",
		"cx",
		"cy",
		"r",
		"rx",
		"ry",
		"width",
		"height",
		"points",
		"viewbox",
		"fill",
		"fill-opacity",
		"fill-rule",
		"stroke",
		"stroke-width",
		"stroke-opacity",
		"stroke-linecap",
		"stroke-linejoin",
		"stroke-dasharray",
		"stroke-dashoffset",
		"stroke-miterlimit",
		"opacity",
		"font-size",
		"font-family",
		"font-weight",
		"text-anchor",
		"dominant-baseline",
		"offset",
		"stop-color",
		"stop-opacity",
		"gradientunits",
		"gradienttransform",
		"fx",
		"fy",
		"clip-path",
		"clip-rule",
		"mask",
		"patternunits",
		"preserveaspectratio",
		"style",
		"href",
		"xlink:href",
		"marker-start",
		"marker-mid",
		"marker-end",
		"markerwidth",
		"markerheight",
		"refx",
		"refy",
		"orient",
		"visibility",
		"display",
		"dx",
		"dy",
		"letter-spacing",
		"vector-effect"
	]);
	var cache = /* @__PURE__ */ new Map();
	var safeRef = (v) => !/url\(\s*['"]?\s*(?!#)/i.test(v) && !/(javascript|expression|@import|behavior)/i.test(v);
	function parseSvg(text) {
		const src = String(text || "");
		if (!src || typeof DOMParser === "undefined") return null;
		if (cache.has(src)) return cache.get(src);
		let out = null;
		try {
			const doc = new DOMParser().parseFromString(src, "image/svg+xml");
			const root = doc.documentElement;
			if (root && root.nodeName.toLowerCase() === "svg" && !doc.getElementsByTagName("parsererror").length) {
				const ids = [];
				const walk = (el) => {
					for (const child of [...el.children]) {
						if (!ALLOWED.has(child.nodeName.toLowerCase())) {
							child.remove();
							continue;
						}
						walk(child);
					}
					for (const a of [...el.attributes]) {
						const n = a.name.toLowerCase();
						const v = a.value;
						if (!ATTRS.has(n) || n.startsWith("on")) el.removeAttribute(a.name);
						else if ((n === "href" || n === "xlink:href") && !v.trim().startsWith("#")) el.removeAttribute(a.name);
						else if (!safeRef(v)) el.removeAttribute(a.name);
					}
					if (el.id && el !== root) ids.push(el.id);
				};
				walk(root);
				let vb = root.getAttribute("viewBox");
				if (!vb) {
					const w = parseFloat(root.getAttribute("width")) || 100;
					const h = parseFloat(root.getAttribute("height")) || 100;
					vb = "0 0 " + w + " " + h;
				}
				out = {
					viewBox: vb,
					root,
					ids
				};
			}
		} catch (e) {
			out = null;
		}
		if (cache.size > 50) cache.clear();
		cache.set(src, out);
		return out;
	}
	function cleanSvg(text) {
		const p = parseSvg(text);
		return p ? new XMLSerializer().serializeToString(p.root) : "";
	}
	function parseBinds(text) {
		const out = [];
		for (const line of String(text || "").split("\n")) {
			const i = line.indexOf("=");
			if (i < 1) continue;
			const id = line.slice(0, i).trim();
			let rest = line.slice(i + 1).trim();
			let mode = "on";
			if (rest.startsWith("#")) {
				mode = "text";
				rest = rest.slice(1).trim();
			}
			const j = rest.indexOf(":");
			if (j >= 0) {
				const m = rest.slice(j + 1).trim().toLowerCase();
				if (["alarme", "alarm"].includes(m)) mode = "alarm";
				else if ([
					"atencao",
					"atenção",
					"warn"
				].includes(m)) mode = "warn";
				else if (["esconder", "hide"].includes(m)) mode = "hide";
				rest = rest.slice(0, j).trim();
			}
			if (id && rest) out.push({
				id,
				key: rest,
				mode
			});
		}
		return out;
	}
	function svgImportSymbol(h) {
		const { f, isOn, formatValue, labelBelow } = h;
		function render(sym, value, opts) {
			const p = sym.props || {};
			const w = sym.w;
			const ht = sym.h;
			const parsed = parseSvg(p.svg);
			if (!parsed) return `<g class="hmi-svgimp hmi-img-empty"><rect class="hmi-img-box" x="1" y="1" width="${f(w - 2)}" height="${f(ht - 2)}" rx="4"/><text class="hmi-svgimp-hint" x="${f(w / 2)}" y="${f(ht / 2)}" font-size="13">SVG</text>${labelBelow(p, w, ht)}</g>`;
			const root = parsed.root.cloneNode(true);
			const values = opts && opts.values || {};
			for (const b of parseBinds(p.binds)) {
				const el = root.querySelector("[id=\"" + b.id.replace(/["\\]/g, "") + "\"]");
				if (!el) continue;
				const v = values[b.key];
				if (b.mode === "text") {
					el.textContent = v === void 0 ? "—" : formatValue(v, p.decimals === "" || p.decimals === void 0 ? void 0 : Number(p.decimals), opts && opts.locale);
					continue;
				}
				const on = isOn(v, "nonzero") === true;
				const cls = (el.getAttribute("class") || "") + " hmi-svgb" + (b.mode === "hide" ? on ? " hmi-svgb-hide" : "" : on ? " hmi-svgb-" + b.mode : " hmi-svgb-off");
				el.setAttribute("class", cls.trim());
			}
			root.setAttribute("x", "0");
			root.setAttribute("y", "0");
			root.setAttribute("width", f(w));
			root.setAttribute("height", f(ht));
			root.setAttribute("viewBox", parsed.viewBox);
			root.setAttribute("preserveAspectRatio", p.fit === "stretch" ? "none" : "xMidYMid meet");
			root.removeAttribute("id");
			const markup = new XMLSerializer().serializeToString(root);
			return `<g class="hmi-svgimp"><rect class="hmi-hitbox" x="0" y="0" width="${f(w)}" height="${f(ht)}"/>${markup}${labelBelow(p, w, ht)}</g>`;
		}
		return { svgImport: {
			label: "SVG com partes ligadas",
			group: "Formas",
			w: 240,
			h: 160,
			preview: void 0,
			svgImport: true,
			defaults: {
				svg: "",
				binds: "",
				fit: "meet",
				decimals: "",
				label: ""
			},
			fields: [
				{
					key: "fit",
					label: "Ajuste",
					type: "select",
					options: [["meet", "Caber inteiro"], ["stretch", "Esticar"]]
				},
				{
					key: "decimals",
					label: "Casas decimais dos textos",
					type: "number"
				},
				{
					key: "label",
					label: "Legenda",
					type: "text"
				}
			],
			render
		} };
	}
	var SVGIMPORT_CSS = `
.hmi-root .hmi-svgimp-hint { fill: var(--hmi-line); font-weight: 700; dominant-baseline: central; }
.hmi-root .hmi-svgimp .hmi-svgb-on { fill: var(--hmi-equip-on) !important; }
.hmi-root .hmi-svgimp .hmi-svgb-alarm { fill: var(--hmi-alarm) !important; }
.hmi-root .hmi-svgimp .hmi-svgb-warn { fill: var(--hmi-warn) !important; }
.hmi-root .hmi-svgimp .hmi-svgb-hide { display: none; }
`;
	//#endregion
	//#region ui/symbols/more.js
	function moreSymbols(H) {
		const { f, num, escapeXml, isOn, onState, formatValue, rangeState, alarmIndicator, stateClass, labelBelow, faultOf, faultMark, faultClass, scaleOf, ON_FIELDS, INVERT_FIELD, FAULT_FIELD, PRIORITY_FIELD } = H;
		const LABEL = {
			key: "label",
			label: "Legenda",
			type: "text"
		};
		const TITLE = {
			key: "title",
			label: "Título",
			type: "text"
		};
		const UNIT = {
			key: "unit",
			label: "Unidade",
			type: "text"
		};
		const DEC = {
			key: "decimals",
			label: "Casas decimais",
			type: "number"
		};
		const LO = {
			key: "lo",
			label: "Alarme abaixo de",
			type: "number"
		};
		const HI = {
			key: "hi",
			label: "Alarme acima de",
			type: "number"
		};
		const MIN = {
			key: "min",
			label: "Mínimo",
			type: "number"
		};
		const MAX = {
			key: "max",
			label: "Máximo",
			type: "number"
		};
		const DIR = {
			key: "dir",
			label: "Sentido",
			type: "select",
			options: [["cw", "Horário"], ["ccw", "Anti-horário"]]
		};
		const EQ_DEFAULTS = {
			label: "",
			onWhen: "nonzero",
			threshold: 0,
			invert: "no",
			faultKey: "",
			priority: "1"
		};
		const EQ_FIELDS = [
			LABEL,
			...ON_FIELDS,
			FAULT_FIELD,
			PRIORITY_FIELD
		];
		const key = (k, label) => ({
			key: k,
			label,
			type: "text"
		});
		const raw = (opts, k) => k && opts && opts.values ? opts.values[k] : void 0;
		const keyOn = (opts, k) => k ? isOn(raw(opts, k), "nonzero") : null;
		const valueText = (v, p, opts) => formatValue(v, p.decimals, opts.locale) + (p.unit ? " " + p.unit : "");
		const alarmCls = (st) => st === null ? "hmi-unknown" : st === "alarm" ? "hmi-on hmi-alarm" : "hmi-on hmi-normal";
		const rect = (cls, x, y, w, h, rx) => `<rect class="${cls}" x="${f(x)}" y="${f(y)}" width="${f(Math.max(0, w))}" height="${f(Math.max(0, h))}"${rx ? ` rx="${f(rx)}"` : ""}/>`;
		const circle = (cls, cx, cy, r) => `<circle class="${cls}" cx="${f(cx)}" cy="${f(cy)}" r="${f(Math.max(0, r))}"/>`;
		const path = (cls, d) => `<path class="${cls}" d="${d}"/>`;
		const poly = (cls, pts) => `<polygon class="${cls}" points="${pts.map((q) => f(q[0]) + "," + f(q[1])).join(" ")}"/>`;
		const disp = (x, y, w, h, text, size) => rect("hmi-disp", x, y, w, h, 2) + `<text class="hmi-disp-text" x="${f(x + w / 2)}" y="${f(y + h / 2)}" font-size="${f(size || Math.max(9, Math.min(h * .62, (w - 4) / Math.max(4, String(text).length) * 1.55)))}">${escapeXml(text)}</text>`;
		const spin = (cx, cy, inner, dir) => `<g transform="translate(${f(cx)},${f(cy)})"><g class="hmi-spin${dir === "ccw" ? " hmi-ccw" : ""}">${inner}</g></g>`;
		const blades = (r, n) => Array.from({ length: n }, (x, i) => {
			const a = i * 2 * Math.PI / n;
			return `M0 0L${f(Math.cos(a) * r)} ${f(Math.sin(a) * r)}`;
		}).join("");
		const eq = (name, on, p, opts, w, h, body, extra) => `<g class="hmi-eq hmi-${name} ${stateClass(on)}${faultClass(p, opts)}${extra || ""}">${body}${faultMark(p, opts, w)}${labelBelow(p, w, h)}</g>`;
		function renderVfd(sym, value, opts) {
			const p = sym.props || {};
			const { w, h } = sym;
			const v = num(value);
			const run = p.runKey ? keyOn(opts, p.runKey) : v === null ? null : v !== 0;
			const rev = p.dirKey ? keyOn(opts, p.dirKey) === true : v !== null && v < 0;
			const text = v === null ? "—" : valueText(p.dirKey ? v : Math.abs(v), p, opts);
			const ay = h * .62;
			const as = Math.min(w * .12, 9);
			const d = rev ? -1 : 1;
			const keys = [
				0,
				1,
				2
			].map((i) => rect("hmi-key", w * (.16 + i * .25), h * .78, w * .18, h * .08, 1.5)).join("");
			return eq("vfd", run, p, opts, w, h, rect("hmi-body", 1, 1, w - 2, h - 2, 4) + disp(w * .12, h * .1, w * .76, h * .26, text) + circle("hmi-led", w * .22, ay, Math.min(w, h) * .055) + path("hmi-arrowhead", `M${f(w * .62 - as * d)} ${f(ay - as)}L${f(w * .62 + as * d)} ${f(ay)}L${f(w * .62 - as * d)} ${f(ay + as)}Z`) + keys);
		}
		function renderBreaker(sym, value, opts) {
			const p = sym.props || {};
			const { w, h } = sym;
			const on = onState(value, p);
			const trip = keyOn(opts, p.tripKey) === true;
			const s = Math.min(w * .7, h * .4);
			const cx = w / 2;
			const y0 = (h - s) / 2;
			return eq("breaker", on, p, opts, w, h, path("hmi-wire", `M${f(cx)} 0V${f(y0)}M${f(cx)} ${f(y0 + s)}V${f(h)}`) + rect("hmi-body", cx - s / 2, y0, s, s, 2) + (on === false ? path("hmi-wire hmi-open-mark", `M${f(cx - s * .3)} ${f(y0 + s * .3)}L${f(cx + s * .3)} ${f(y0 + s * .7)}`) : "") + (trip ? alarmIndicator(w - 4, 6, p.priority) : ""), trip ? " hmi-fault" : "");
		}
		function renderContactor(sym, value, opts) {
			const p = sym.props || {};
			const { w, h } = sym;
			const on = onState(value, p);
			const cx = w * .62;
			const y1 = h * .3;
			const y2 = h * .7;
			const end = on ? [cx, y2] : [cx + w * .26, y2 - h * .06];
			return eq("contactor", on, p, opts, w, h, path("hmi-wire", `M${f(cx)} 0V${f(y1)}M${f(cx)} ${f(y2)}V${f(h)}`) + circle("hmi-terminal", cx, y1, 2.5) + circle("hmi-terminal", cx, y2, 2.5) + path("hmi-blade-line", `M${f(cx)} ${f(y1)}L${f(end[0])} ${f(end[1])}`) + path("hmi-link", `M${f(w * .38)} ${f(h / 2)}H${f(cx + (on ? 0 : w * .13))}`) + rect("hmi-body", 1, h / 2 - h * .14, w * .38, h * .28, 2) + `<text class="hmi-glyph" x="${f(1 + w * .19)}" y="${f(h / 2)}" font-size="${f(Math.min(w * .26, h * .2))}">K</text>`);
		}
		function renderTransformer(sym, value, opts) {
			const p = sym.props || {};
			const { w, h } = sym;
			const on = onState(value, p);
			const r = Math.min(w / 2 - 2, h * .24);
			const cx = w / 2;
			const c1 = h / 2 - r * .62;
			const c2 = h / 2 + r * .62;
			const rating = p.rating ? `<text class="hmi-sub-label" x="${f(w / 2)}" y="${f(h + (p.label ? 34 : 18))}">${escapeXml(p.rating)}</text>` : "";
			return eq("transformer", on, p, opts, w, h, path("hmi-wire", `M${f(cx)} 0V${f(c1 - r)}M${f(cx)} ${f(c2 + r)}V${f(h)}`) + circle("hmi-body hmi-coil1", cx, c1, r) + circle("hmi-body hmi-coil2", cx, c2, r) + rating);
		}
		function renderGenerator(sym, value, opts) {
			const p = sym.props || {};
			const { w, h } = sym;
			const on = onState(value, p);
			const r = Math.min(w / 2 - 2, (h - 12) / 2);
			const cx = w / 2;
			const cy = h - r - 2;
			return eq("generator", on, p, opts, w, h, path("hmi-wire", `M${f(cx)} 0V${f(cy - r)}`) + circle("hmi-body", cx, cy, r) + `<text class="hmi-glyph" x="${f(cx)}" y="${f(cy - r * .12)}" font-size="${f(r * .8)}">G</text>` + path("hmi-wave", `M${f(cx - r * .4)} ${f(cy + r * .5)}q${f(r * .2)} ${f(-r * .28)} ${f(r * .4)} 0t${f(r * .4)} 0`));
		}
		function renderEnergyMeter(sym, value, opts) {
			const p = sym.props || {};
			const { w, h } = sym;
			const e = raw(opts, p.energyKey);
			const kw = valueText(value, p, opts);
			const kwh = formatValue(e, p.energyDecimals, opts.locale) + (p.energyUnit ? " " + p.energyUnit : "");
			return `<g class="hmi-eq hmi-meter ${value === void 0 || value === null ? "hmi-unknown" : "hmi-on"}">` + rect("hmi-tag-box", .5, .5, w - 1, h - 1, 4) + `<text class="hmi-tag-title hmi-left" x="8" y="${f(Math.min(16, h * .2))}" font-size="${f(Math.max(9, Math.min(12, h * .15)))}">${escapeXml(p.title || sym.key || "")}</text>` + disp(6, h * .3, w - 12, h * .32, kw) + (p.energyKey ? `<text class="hmi-tag-value hmi-right" x="${f(w - 8)}" y="${f(h * .84)}" font-size="${f(Math.max(9, Math.min(14, h * .17)))}">${escapeXml(kwh)}</text>` : "") + labelBelow(p, w, h) + "</g>";
		}
		function renderCompressor(sym, value, opts) {
			const p = sym.props || {};
			const { w, h } = sym;
			const on = onState(value, p);
			const r = Math.max(6, Math.min(w, h * .9) / 2 - 2);
			const cx = w / 2;
			const cy = r + 2;
			return eq("compressor", on, p, opts, w, h, path("hmi-foot", `M${f(cx - r * .75)} ${f(h - 1)}L${f(cx - r * .45)} ${f(cy + r * .7)}H${f(cx + r * .45)}L${f(cx + r * .75)} ${f(h - 1)}Z`) + circle("hmi-body", cx, cy, r) + path("hmi-inner", `M${f(cx - r * .72)} ${f(cy - r * .68)}L${f(cx + r * .78)} ${f(cy - r * .34)}M${f(cx - r * .72)} ${f(cy + r * .68)}L${f(cx + r * .78)} ${f(cy + r * .34)}`));
		}
		function renderBlower(sym, value, opts) {
			const p = sym.props || {};
			const { w, h } = sym;
			const on = onState(value, p);
			const r = Math.max(6, Math.min(w * .8, h) / 2 - 2);
			const cx = r + 2;
			const cy = h - r - 2;
			return eq("blower", on, p, opts, w, h, rect("hmi-body", cx, cy - r, Math.min(w - cx - 1, r * 1.35), r * .62, 1) + circle("hmi-body", cx, cy, r) + spin(cx, cy, path("hmi-inner", blades(r * .72, 6)) + circle("hmi-hub", 0, 0, r * .18), p.dir));
		}
		function renderBagFilter(sym, value, opts) {
			const p = sym.props || {};
			const { w, h } = sym;
			const st = rangeState(value, p.lo, p.hi);
			const top = h * .62;
			const n = Math.max(2, Math.min(8, Math.round(w / 22)));
			let bags = "";
			for (let i = 0; i < n; i++) {
				const bw = (w - 16) / n;
				bags += rect("hmi-bag", 8 + i * bw + bw * .2, h * .3, bw * .6, top - h * .34, bw * .3);
			}
			const text = value === void 0 || value === null ? "ΔP —" : "ΔP " + valueText(value, p, opts);
			let out = `<g class="hmi-eq hmi-bagfilter ${alarmCls(st)}">` + poly("hmi-body", [
				[1, 1],
				[w - 1, 1],
				[w - 1, top],
				[w * .6, h * .9],
				[w * .4, h * .9],
				[1, top]
			]) + rect("hmi-part", w * .4, h * .9, w * .2, h * .1 - 1, 1) + bags + disp(w * .08, h * .06, w * .84, h * .16, text);
			if (st === "alarm") out += alarmIndicator(w - 6, h * .06 + 2, p.priority);
			return out + labelBelow(p, w, h) + "</g>";
		}
		function renderControlValve(sym, value, opts) {
			const p = sym.props || {};
			const { w, h } = sym;
			const v = num(value);
			const sc = scaleOf(p);
			const fr = v === null ? null : sc.frac(v);
			const top = h * .5;
			const cy = (top + h - 1) / 2;
			const cx = w / 2;
			const text = v === null ? "—" : formatValue(fr * 100, 0, opts.locale) + " %";
			return eq("cvalve", fr === null ? null : fr > .005, p, opts, w, h, path("hmi-stem", `M${f(cx)} ${f(cy)}V${f(h * .34)}`) + (fr !== null ? rect("hmi-stroke-pos", cx - 1.5, h * .34, 3, (cy - h * .34) * fr) : "") + disp(w * .06, 1, w * .88, h * .32, text) + path("hmi-body", `M1.5 ${f(top)}L${f(cx)} ${f(cy)}L1.5 ${f(h - 1)}ZM${f(w - 1.5)} ${f(top)}L${f(cx)} ${f(cy)}L${f(w - 1.5)} ${f(h - 1)}Z`));
		}
		function renderValve3(sym, value, opts) {
			const p = sym.props || {};
			const { w, h } = sym;
			const on = onState(value, p);
			const cx = w / 2;
			const cy = h * .42;
			const a = Math.min(cx - 1.5, cy * .9);
			const open = (port) => on === null ? "" : (port === "b" ? on : port === "c" ? !on : true) ? " hmi-open" : "";
			return eq("valve3", on, p, opts, w, h, path("hmi-stem", `M${f(cx)} ${f(cy)}V${f(cy - a * .9)}`) + rect("hmi-actuator", cx - a * .45, cy - a * .9 - 6, a * .9, 6, 1) + poly("hmi-body hmi-port" + open("a"), [
				[1.5, cy - a * .6],
				[cx, cy],
				[1.5, cy + a * .6]
			]) + poly("hmi-body hmi-port" + open("c"), [
				[w - 1.5, cy - a * .6],
				[cx, cy],
				[w - 1.5, cy + a * .6]
			]) + poly("hmi-body hmi-port" + open("b"), [
				[cx - a * .6, h - 1.5],
				[cx, cy],
				[cx + a * .6, h - 1.5]
			]));
		}
		function renderDamper(sym, value, opts) {
			const p = sym.props || {};
			const { w, h } = sym;
			const v = num(value);
			const fr = v === null ? null : scaleOf(p).frac(v);
			const ang = (fr === null ? .5 : fr) * Math.PI / 2;
			const L = (h - 8) / 2;
			const cx = w / 2;
			const cy = h / 2;
			const dx = Math.sin(ang) * L;
			const dy = Math.cos(ang) * L;
			return eq("damper", fr === null ? null : fr > .005, p, opts, w, h, rect("hmi-body", 1, 1, w - 2, h - 2, 1) + path("hmi-damper-blade", `M${f(cx - dx)} ${f(cy + dy)}L${f(cx + dx)} ${f(cy - dy)}`) + circle("hmi-hub", cx, cy, 3) + (w >= 80 ? `<text class="hmi-sub-value hmi-right" x="${f(w - 6)}" y="${f(h - 7)}">${fr === null ? "—" : escapeXml(formatValue(fr * 100, 0, opts.locale) + " %")}</text>` : ""));
		}
		function renderMixer(sym, value, opts) {
			const p = sym.props || {};
			const { w, h } = sym;
			const on = onState(value, p);
			const mh = h * .16;
			const vy = h * .22;
			const cx = w / 2;
			const iy = h * .8;
			const bw = w * .28;
			return eq("mixer", on, p, opts, w, h, rect("hmi-body hmi-vessel", 1, vy, w - 2, h - vy - 1, Math.min(w * .16, 18)) + path("hmi-shaft", `M${f(cx)} ${f(mh)}V${f(iy)}`) + `<g transform="translate(${f(cx)},${f(iy)})"><g class="hmi-stir">${poly("hmi-part", [
				[-bw, -h * .03],
				[0, 0],
				[-bw, h * .03]
			])}${poly("hmi-part", [
				[bw, -h * .03],
				[0, 0],
				[bw, h * .03]
			])}</g></g>` + rect("hmi-body hmi-drive", cx - w * .16, 1, w * .32, mh, 2) + `<text class="hmi-glyph" x="${f(cx)}" y="${f(1 + mh / 2)}" font-size="${f(Math.min(mh * .6, w * .16))}">M</text>`);
		}
		function renderHeatExchanger(sym, value, opts) {
			const p = sym.props || {};
			const { w, h } = sym;
			const on = onState(value, p);
			const y0 = h * .22;
			const y1 = h * .78;
			const hw = Math.min(w * .08, 16);
			const nz = Math.min(w * .07, 12);
			const tubes = [
				.38,
				.5,
				.62
			].map((t) => `M${f(hw + 6)} ${f(h * t)}H${f(w - hw - 6)}`).join("");
			return eq("exchanger", on, p, opts, w, h, rect("hmi-part", w * .22, 1, nz, y0, 1) + rect("hmi-part", w * .78 - nz, y1, nz, h - y1 - 1, 1) + rect("hmi-body", hw, y0, w - 2 * hw, y1 - y0, 3) + rect("hmi-part", 1, y0 + 3, hw, y1 - y0 - 6, 2) + rect("hmi-part", w - hw - 1, y0 + 3, hw, y1 - y0 - 6, 2) + path("hmi-detail", tubes));
		}
		function renderBoiler(sym, value, opts) {
			const p = sym.props || {};
			const { w, h } = sym;
			const on = onState(value, p);
			const cx = w / 2;
			const sw = w * .18;
			const fy = h * .82;
			const flame = `M${f(cx)} ${f(fy - h * .22)}C${f(cx + w * .22)} ${f(fy - h * .1)} ${f(cx + w * .16)} ${f(fy)} ${f(cx)} ${f(fy)}C${f(cx - w * .16)} ${f(fy)} ${f(cx - w * .22)} ${f(fy - h * .1)} ${f(cx)} ${f(fy - h * .22)}Z`;
			return eq("boiler", on, p, opts, w, h, rect("hmi-part", w * .62, 1, sw, h * .14, 1) + rect("hmi-body", 1, h * .12, w - 2, h * .88 - 1, Math.min(w * .3, 26)) + rect("hmi-part", 1, fy + 2, w * .3, h - fy - 4, 2) + (on ? path("hmi-flame", flame) : ""));
		}
		function renderCoolingTower(sym, value, opts) {
			const p = sym.props || {};
			const { w, h } = sym;
			const on = onState(value, p);
			const top = h * .16;
			const base = h * .9;
			const cx = w / 2;
			const fr = Math.min(w * .3, top * 2);
			return eq("tower", on, p, opts, w, h, path("hmi-body", `M${f(w * .22)} ${f(top)}H${f(w * .78)}Q${f(w * .68)} ${f(h * .5)} ${f(w - 4)} ${f(base)}H4Q${f(w * .32)} ${f(h * .5)} ${f(w * .22)} ${f(top)}Z`) + rect("hmi-part", 1, base, w - 2, h - base - 1, 2) + path("hmi-detail", `M${f(w * .2)} ${f(h * .62)}H${f(w * .8)}M${f(w * .16)} ${f(h * .72)}H${f(w * .84)}`) + `<g transform="translate(${f(cx)},${f(top - 2)})"><g transform="scale(1,0.32)"><g class="hmi-spin">${circle("hmi-light", 0, 0, fr)}${path("hmi-inner", blades(fr, 4))}</g></g></g>`);
		}
		function renderChiller(sym, value, opts) {
			const p = sym.props || {};
			const { w, h } = sym;
			const on = onState(value, p);
			const r = Math.min(w * .16, h * .28);
			const fans = [.3, .7].map((x) => circle("hmi-light", w * x, r + 3, r) + spin(w * x, r + 3, path("hmi-inner", blades(r * .85, 3)))).join("");
			const s = Math.min(w, h) * .13;
			const sx = w * .22;
			const sy = h * .72;
			const flake = [
				0,
				60,
				120
			].map((a) => {
				const rad = a * Math.PI / 180;
				return `M${f(sx - Math.cos(rad) * s)} ${f(sy - Math.sin(rad) * s)}L${f(sx + Math.cos(rad) * s)} ${f(sy + Math.sin(rad) * s)}`;
			}).join("");
			return eq("chiller", on, p, opts, w, h, rect("hmi-body", 1, r * 2 + 6, w - 2, h - r * 2 - 7, 3) + fans + path("hmi-inner", flake) + path("hmi-detail", `M${f(w * .45)} ${f(h * .62)}H${f(w * .9)}M${f(w * .45)} ${f(h * .74)}H${f(w * .9)}M${f(w * .45)} ${f(h * .86)}H${f(w * .9)}`));
		}
		function renderCyclone(sym, value, opts) {
			const p = sym.props || {};
			const { w, h } = sym;
			const on = onState(value, p);
			const y0 = h * .1;
			const y1 = h * .45;
			const y2 = h * .88;
			return eq("cyclone", on, p, opts, w, h, rect("hmi-part", w * .38, 1, w * .24, y0 + 4, 1) + rect("hmi-part", 1, y0 + 4, w * .2, h * .12, 1) + path("hmi-body", `M${f(w * .12)} ${f(y0)}H${f(w * .88)}V${f(y1)}L${f(w * .58)} ${f(y2)}H${f(w * .42)}L${f(w * .12)} ${f(y1)}Z`) + rect("hmi-part", w * .42, y2, w * .16, h - y2 - 1, 1) + path("hmi-detail hmi-dashed", `M${f(w * .2)} ${f(h * .2)}Q${f(w * .5)} ${f(h * .3)} ${f(w * .8)} ${f(h * .24)}M${f(w * .24)} ${f(h * .4)}Q${f(w * .5)} ${f(h * .5)} ${f(w * .74)} ${f(h * .44)}M${f(w * .36)} ${f(h * .62)}Q${f(w * .5)} ${f(h * .68)} ${f(w * .64)} ${f(h * .63)}`));
		}
		function renderFlowmeter(sym, value, opts) {
			const p = sym.props || {};
			const { w, h } = sym;
			const st = rangeState(value, p.lo, p.hi);
			const py = h * .66;
			const ph = h * .26;
			const r = Math.min(h * .3, w * .2);
			const cx = r + 4;
			const cy = r + 2;
			let out = `<g class="hmi-eq hmi-flowmeter ${alarmCls(st)}">` + rect("hmi-pipe-body", 1, py, w - 2, ph, 1) + rect("hmi-part", cx - r * .9, py - 3, r * 1.8, ph + 6, 2) + path("hmi-stem", `M${f(cx)} ${f(cy + r)}V${f(py - 3)}`) + circle("hmi-body", cx, cy, r) + `<text class="hmi-glyph" x="${f(cx)}" y="${f(cy)}" font-size="${f(r * .7)}">${escapeXml(p.tagText || "FT")}</text>`;
			if (w > cx + r + 30) out += disp(cx + r + 6, cy - Math.min(r, 12), w - cx - r - 8, Math.min(2 * r, 24), valueText(value, p, opts));
			if (st === "alarm") out += alarmIndicator(w - 6, 6, p.priority);
			return out + labelBelow(p, w, h) + "</g>";
		}
		function renderInstrument(sym, value, opts) {
			const p = sym.props || {};
			const { w, h } = sym;
			const st = rangeState(value, p.lo, p.hi);
			const r = Math.max(8, Math.min(w, h) / 2 - 2);
			const cx = w / 2;
			const cy = h / 2;
			const loc = [
				"panel",
				"behind",
				"dcs"
			].includes(p.location) ? p.location : "field";
			const fs = Math.max(8, r * .48);
			let out = `<g class="hmi-eq hmi-instrument ${alarmCls(st)} hmi-loc-${loc}">` + (loc === "dcs" ? rect("hmi-part hmi-dcs", cx - r, cy - r, 2 * r, 2 * r, 1) : "") + circle("hmi-body", cx, cy, r) + (loc === "panel" || loc === "behind" ? path("hmi-inner" + (loc === "behind" ? " hmi-dashed" : ""), `M${f(cx - r)} ${f(cy)}H${f(cx + r)}`) : "") + `<text class="hmi-glyph" x="${f(cx)}" y="${f(cy - r * .36)}" font-size="${f(fs)}">${escapeXml(p.letters || "")}</text><text class="hmi-glyph hmi-thin" x="${f(cx)}" y="${f(cy + r * .4)}" font-size="${f(fs * .9)}">${escapeXml(p.number || "")}</text>`;
			let y = h + 16;
			if (p.showValue !== "no" && sym.key) {
				out += `<text class="hmi-tag-value" x="${f(cx)}" y="${f(y)}" font-size="13">${escapeXml(valueText(value, p, opts))}</text>`;
				y += 18;
			}
			if (st === "alarm") out += alarmIndicator(cx + r * .8, cy - r * .8, p.priority);
			if (p.label) out += `<text class="hmi-label" x="${f(cx)}" y="${f(y)}">${escapeXml(p.label)}</text>`;
			return out + "</g>";
		}
		function renderCrane(sym, value, opts) {
			const p = sym.props || {};
			const { w, h } = sym;
			const hoist = p.kind === "hoist";
			const v = num(value);
			const bh = Math.max(10, h * .08);
			const tw = Math.min(w * .18, 70);
			const th = Math.max(12, h * .1);
			const x = hoist ? (w - tw) / 2 : v === null ? (w - tw) / 2 : 6 + scaleOf(p).frac(v) * (w - tw - 12);
			let hf;
			if (hoist) hf = v === null ? .5 : scaleOf(p).frac(v);
			else {
				const hv = num(raw(opts, p.hookKey));
				hf = hv === null ? .5 : scaleOf({
					min: p.hookMin,
					max: p.hookMax
				}).frac(hv);
			}
			const top = bh + th;
			const hookY = top + 10 + (1 - hf) * (h - top - 40);
			const cx = x + tw / 2;
			const load = keyOn(opts, p.loadKey) === true;
			const out = (hoist ? rect("hmi-part", w * .3, 1, w * .4, bh, 1) : rect("hmi-part", 1, 1, w - 2, bh, 1) + rect("hmi-part", 1, 1, 10, bh + 6, 1) + rect("hmi-part", w - 11, 1, 10, bh + 6, 1)) + rect("hmi-body", x, bh + 1, tw, th, 2) + path("hmi-cable", `M${f(cx - 3)} ${f(top + 1)}V${f(hookY)}M${f(cx + 3)} ${f(top + 1)}V${f(hookY)}`) + rect("hmi-part", cx - 8, hookY, 16, 8, 2) + path("hmi-hook", `M${f(cx)} ${f(hookY + 8)}v8a5 5 0 1 1 -8 -3`) + (load ? rect("hmi-load", cx - tw * .55, hookY + 22, tw * 1.1, Math.min(30, h - hookY - 22), 2) : "");
			return eq("crane", v !== null ? true : null, p, opts, w, h, out);
		}
		function renderRobot(sym, value, opts) {
			const p = sym.props || {};
			const { w, h } = sym;
			const on = onState(value, p);
			const weld = keyOn(opts, p.weldKey) === true;
			const sx = w * .32;
			const sy = h * .72;
			const t = Math.max(6, Math.min(w, h) * .09);
			const ex = w * .5;
			const ey = h * .2;
			const tx = w * .88;
			const ty = h * .42;
			const seg = (x1, y1, x2, y2) => {
				const len = Math.hypot(x2 - x1, y2 - y1) || 1;
				const nx = -(y2 - y1) / len * t / 2;
				const ny = (x2 - x1) / len * t / 2;
				return poly("hmi-body", [
					[x1 + nx, y1 + ny],
					[x2 + nx, y2 + ny],
					[x2 - nx, y2 - ny],
					[x1 - nx, y1 - ny]
				]);
			};
			const star = Array.from({ length: 8 }, (x, i) => {
				const a = i * Math.PI / 4;
				const r = i % 2 ? 4 : 10;
				return [tx + 4 + Math.cos(a) * r, ty + 10 + Math.sin(a) * r];
			});
			return eq("robot", on, p, opts, w, h, rect("hmi-part", w * .1, h - h * .1, w * .44, h * .1 - 1, 2) + rect("hmi-part", sx - w * .12, sy, w * .24, h * .18, 2) + `<g transform="translate(${f(sx)},${f(sy)})"><g class="hmi-arm"><g transform="translate(${f(-sx)},${f(-sy)})">` + seg(sx, sy, ex, ey) + seg(ex, ey, tx, ty) + circle("hmi-joint", ex, ey, t * .7) + path("hmi-stem", `M${f(tx)} ${f(ty)}l4 10`) + (weld ? poly("hmi-spark", star) : "") + "</g></g></g>" + circle("hmi-joint", sx, sy, t * .8));
		}
		function renderWelder(sym, value, opts) {
			const p = sym.props || {};
			const { w, h } = sym;
			const v = num(value);
			const arc = p.arcKey ? keyOn(opts, p.arcKey) : v === null ? null : v > 0;
			return eq("welder", arc, p, opts, w, h, rect("hmi-body", 1, 1, w - 2, h - 2, 4) + disp(w * .12, h * .1, w * .76, h * .26, valueText(value, p, opts)) + circle("hmi-led hmi-led-arc", w * .25, h * .54, Math.min(w, h) * .06) + `<text class="hmi-sub-value hmi-left" x="${f(w * .36)}" y="${f(h * .54)}">ARCO</text>` + circle("hmi-terminal-big", w * .32, h * .8, Math.min(w, h) * .07) + circle("hmi-terminal-big", w * .68, h * .8, Math.min(w, h) * .07));
		}
		function renderOven(sym, value, opts) {
			const p = sym.props || {};
			const { w, h } = sym;
			const st = rangeState(value, p.lo, p.hi);
			const open = keyOn(opts, p.doorKey) === true;
			const heat = keyOn(opts, p.heatKey) === true;
			const dx = w * .62;
			const waves = [
				.2,
				.33,
				.46
			].map((x) => `M${f(w * x)} ${f(h * .82)}q${f(w * .03)} ${f(-h * .06)} 0 ${f(-h * .12)}t0 ${f(-h * .12)}`).join("");
			let out = `<g class="hmi-eq hmi-oven ${alarmCls(st)}${heat ? " hmi-heating" : ""}${open ? " hmi-door-open" : ""}">` + rect("hmi-body", 1, 1, w - 2, h - 2, 3) + disp(w * .08, h * .08, w * .48, h * .2, valueText(value, p, opts)) + path("hmi-heat", waves) + (open ? poly("hmi-door", [
				[dx, h * .08],
				[w - 1 + w * .12, h * .16],
				[w - 1 + w * .12, h * .84],
				[dx, h * .92]
			]) + rect("hmi-opening", dx, h * .08, w - dx - 6, h * .84, 1) : rect("hmi-door", dx, h * .08, w - dx - 6, h * .84, 2) + rect("hmi-part", dx + 6, h * .45, 4, h * .12, 1));
			if (st === "alarm") out += alarmIndicator(w - 8, 8, p.priority);
			return out + labelBelow(p, w, h) + "</g>";
		}
		function renderPaintBooth(sym, value, opts) {
			const p = sym.props || {};
			const { w, h } = sym;
			const on = onState(value, p);
			const top = h * .2;
			const r = Math.min(top * .7, w * .08);
			const gx = w * .18;
			const gy = h * .55;
			return eq("booth", on, p, opts, w, h, rect("hmi-part", w * .74, 1, r * 2.4, top, 1) + spin(w * .74 + r * 1.2, top / 2 + 1, circle("hmi-light", 0, 0, r) + path("hmi-inner", blades(r * .9, 3))) + rect("hmi-body", 1, top, w - 2, h - top - 1, 2) + path("hmi-detail", `M1 ${f(h - 8)}H${f(w - 1)}`) + rect("hmi-part", gx - w * .07, gy - 5, w * .1, 10, 2) + rect("hmi-part", gx - w * .05, gy + 4, 5, h * .12, 1) + path("hmi-spray", `M${f(gx + w * .03)} ${f(gy)}L${f(w * .6)} ${f(gy - h * .18)}V${f(gy + h * .18)}Z`) + rect("hmi-part", w * .62, h * .32, w * .2, h * .44, 2));
		}
		function renderCalender(sym, value, opts) {
			const p = sym.props || {};
			const { w, h } = sym;
			const on = onState(value, p);
			const r = Math.min(w * .16, h * .2);
			const cx = w / 2;
			const d = r * 2.1;
			const ty = r + 4;
			const by = ty + r * 1.95;
			const roll = (x, y, dir) => spin(x, y, circle("hmi-body", 0, 0, r) + path("hmi-mark", `M0 ${f(-r * .7)}V${f(r * .7)}`), dir);
			const back = p.dir === "ccw" ? "cw" : "ccw";
			return eq("calender", on, p, opts, w, h, rect("hmi-part hmi-frame-back", cx - d - r - 6, 1, (d + r + 6) * 2, h - 2, 4) + path("hmi-plate", `M2 ${f(by - r - 3)}Q${f(cx)} ${f(ty + r + 6)} ${f(w - 2)} ${f(by - r - 3)}`) + roll(cx, ty, p.dir) + roll(cx - d, by, back) + roll(cx + d, by, back));
		}
		function renderPress(sym, value, opts) {
			const p = sym.props || {};
			const { w, h } = sym;
			let fr = null;
			const v = num(value);
			if (v !== null) fr = scaleOf(p).frac(v);
			else if (typeof value === "boolean") fr = value ? 1 : 0;
			const crown = h * .16;
			const bed = h * .8;
			const cw = w * .12;
			const rh = h * .14;
			const travel = bed - crown - rh - h * .08;
			const ry = crown + (fr === null ? 0 : fr) * travel;
			return eq("press", fr === null ? null : fr > .02, p, opts, w, h, rect("hmi-part", 1, 1, cw, h - 2, 1) + rect("hmi-part", w - cw - 1, 1, cw, h - 2, 1) + rect("hmi-body", 1, 1, w - 2, crown, 2) + rect("hmi-stem-rect", w / 2 - w * .05, crown, w * .1, ry - crown) + rect("hmi-body hmi-ram", cw + 3, ry, w - 2 * cw - 6, rh, 2) + rect("hmi-body", cw + 3, bed, w - 2 * cw - 6, h * .08, 1) + rect("hmi-part", 1, h - h * .1, w - 2, h * .1 - 1, 2));
		}
		function renderScale(sym, value, opts) {
			const p = sym.props || {};
			const { w, h } = sym;
			const st = rangeState(value, p.lo, p.hi);
			const py = h * .72;
			let out = `<g class="hmi-eq hmi-scale ${alarmCls(st)}">` + rect("hmi-body", 1, py, w - 2, h * .16, 2) + rect("hmi-part", 6, py + h * .16, 10, h - py - h * .16 - 1, 1) + rect("hmi-part", w - 16, py + h * .16, 10, h - py - h * .16 - 1, 1) + path("hmi-stem", `M${f(w / 2)} ${f(py)}V${f(h * .5)}`) + disp(w * .18, 2, w * .64, h * .46, valueText(value, p, opts));
			if (st === "alarm") out += alarmIndicator(w - 6, 8, p.priority);
			return out + labelBelow(p, w, h) + "</g>";
		}
		function renderVehicle(sym, value, opts) {
			const p = sym.props || {};
			const { w, h } = sym;
			const kind = ["agv", "forklift"].includes(p.kind) ? p.kind : "cart";
			const moves = p.move === "pos";
			const v = num(value);
			const rail = kind === "cart";
			const vh = rail ? h - 8 : h;
			const vw = Math.min(w, vh * 1.7);
			const x = moves ? v === null ? (w - vw) / 2 : scaleOf(p).frac(v) * (w - vw) : (w - vw) / 2;
			const on = moves ? v === null ? null : true : onState(value, p);
			const wr = Math.max(3, vh * .12);
			const wy = vh - wr - 1;
			let body;
			if (kind === "forklift") body = rect("hmi-part", x + vw * .08, 1, vw * .05, vh * .8, 1) + rect("hmi-part", x, vh * .68, vw * .3, vh * .06, 1) + rect("hmi-body", x + vw * .16, vh * .3, vw * .8, vh * .48, 4) + path("hmi-detail", `M${f(x + vw * .4)} ${f(vh * .3)}V${f(vh * .06)}H${f(x + vw * .8)}V${f(vh * .3)}`);
			else if (kind === "agv") body = rect("hmi-body", x + 1, vh * .2, vw - 2, vh * .58, 4) + rect("hmi-led-rect", x + vw * .1, vh * .32, vw * .8, vh * .08, 2) + path("hmi-arrowhead", `M${f(x + vw * .45)} ${f(vh * .48)}l${f(vw * .1)} ${f(vh * .1)}l${f(-vw * .1)} ${f(vh * .1)}Z`);
			else body = rect("hmi-body", x + 1, vh * .3, vw - 2, vh * .48, 3) + rect("hmi-load", x + vw * .15, vh * .05, vw * .7, vh * .25, 2);
			const wheels = circle("hmi-wheel", x + vw * .22, wy, wr) + circle("hmi-wheel", x + vw * .78, wy, wr);
			return eq("vehicle hmi-" + kind, on, p, opts, w, h, (rail ? rect("hmi-part", 1, h - 6, w - 2, 5, 1) : "") + body + wheels);
		}
		function renderRollerTable(sym, value, opts) {
			const p = sym.props || {};
			const { w, h } = sym;
			const on = onState(value, p);
			const r = Math.max(4, Math.min(h * .32, 16));
			const n = Math.max(2, Math.floor((w - 4) / (r * 2.6)));
			let rolls = "";
			for (let i = 0; i < n; i++) {
				const x = 2 + r + (w - 4 - 2 * r) * i / (n - 1);
				rolls += spin(x, r + 2, circle("hmi-body", 0, 0, r) + path("hmi-mark", `M0 ${f(-r * .7)}V${f(r * .7)}`), p.dir);
			}
			return eq("rolltable", on, p, opts, w, h, rect("hmi-part", 1, r + 2, w - 2, h - r - 3, 2) + rolls);
		}
		function renderIsaBar(sym, value, opts) {
			const p = sym.props || {};
			const { w, h } = sym;
			const vert = h >= w;
			const sc = scaleOf(p);
			const v = num(value);
			const lolo = num(p.lolo);
			const lo = num(p.lo);
			const hi = num(p.hi);
			const hihi = num(p.hihi);
			let level = v === null ? null : "normal";
			if (v !== null) {
				if (lolo !== null && v < lolo || hihi !== null && v > hihi) level = "alarm";
				else if (lo !== null && v < lo || hi !== null && v > hi) level = "warn";
			}
			const t = vert ? Math.max(8, Math.min(18, w * .24)) : Math.max(8, Math.min(18, h * .2));
			const A0 = vert ? h - 24 : 10;
			const A1 = vert ? 22 : w - 10;
			const c0 = vert ? (w - t) / 2 : 26;
			const along = (val) => A0 + sc.frac(val) * (A1 - A0);
			const band = (a, b, cls) => {
				const s = Math.min(along(a), along(b));
				const len = Math.abs(along(b) - along(a));
				return vert ? rect(cls, c0, s, t, len) : rect(cls, s, c0, len, t);
			};
			const P = (a, c) => vert ? [c, a] : [a, c];
			const tri = (a, c, dir, cls) => poly(cls, [
				P(a, c),
				P(a - 6, c + dir * 10),
				P(a + 6, c + dir * 10)
			]);
			let out = `<g class="hmi-isabar hmi-${level === null ? "unknown" : level}">` + band(sc.min, sc.max, "hmi-isa-track");
			if (lolo !== null) out += band(sc.min, lolo, "hmi-isa-ll");
			if (hihi !== null) out += band(hihi, sc.max, "hmi-isa-ll");
			if (lo !== null || hi !== null) out += band(lo === null ? sc.min : lo, hi === null ? sc.max : hi, "hmi-isa-normal");
			const sp = num(raw(opts, p.spKey));
			if (sp !== null) out += tri(along(Math.max(sc.min, Math.min(sc.max, sp))), c0 + t + 1, 1, "hmi-isa-sp");
			if (v !== null) out += tri(along(Math.max(sc.min, Math.min(sc.max, v))), c0 - 1, -1, "hmi-isa-ptr");
			const text = valueText(value, p, opts);
			const title = escapeXml(p.title || sym.key || "");
			if (vert) out += `<text class="hmi-tag-title" x="${f(w / 2)}" y="12" font-size="${f(Math.max(9, Math.min(12, w * .18)))}">${title}</text><text class="hmi-tag-value" x="${f(w / 2)}" y="${f(h - 6)}" font-size="${f(Math.max(9, Math.min(15, w * .2)))}">${escapeXml(text)}</text>`;
			else out += `<text class="hmi-tag-title hmi-left" x="10" y="11" font-size="11">${title}</text><text class="hmi-tag-value hmi-right" x="${f(w - 10)}" y="11" font-size="12">${escapeXml(text)}</text>`;
			if (level === "alarm" || level === "warn") {
				const pr = level === "alarm" ? "1" : p.priority || "2";
				out += vert ? alarmIndicator(w - 9, 30, pr) : alarmIndicator(w - 10, c0 + t + 18, pr);
			}
			return out + "</g>";
		}
		function renderCounter(sym, value, opts) {
			const p = sym.props || {};
			const { w, h } = sym;
			const v = num(value);
			let text;
			const vals = opts && opts.values || {};
			const part = (k) => {
				const x = k ? num(vals[k]) : null;
				return x === null ? 0 : Math.max(0, Math.floor(x));
			};
			if (v === null) text = "—";
			else if (p.kind === "hours" && p.src === "split") text = formatValue(Math.floor(v), 0, opts.locale) + " h " + String(part(p.minKey)).padStart(2, "0") + " min" + (p.secKey ? " " + String(part(p.secKey)).padStart(2, "0") + " s" : "");
			else if (p.kind === "hours" && (p.src === "s" || p.src === "min")) {
				const totalMin = Math.floor(p.src === "s" ? v / 60 : v);
				text = formatValue(Math.floor(totalMin / 60), 0, opts.locale) + " h " + String(totalMin % 60).padStart(2, "0") + " min";
			} else text = formatValue(v, p.kind === "hours" ? p.decimals : 0, opts.locale) + (p.kind === "hours" ? " h" : p.unit ? " " + p.unit : "");
			const ir = Math.min(h * .28, 16);
			const ix = ir + 8;
			const iy = h * .58;
			const icon = p.kind === "hours" ? circle("hmi-icon", ix, iy, ir) + path("hmi-icon-hand", `M${f(ix)} ${f(iy)}V${f(iy - ir * .65)}M${f(ix)} ${f(iy)}L${f(ix + ir * .5)} ${f(iy + ir * .2)}`) : rect("hmi-icon", ix - ir, iy - ir * .7, ir * 2, ir * 1.4, 2) + `<text class="hmi-glyph" x="${f(ix)}" y="${f(iy)}" font-size="${f(ir)}">#</text>`;
			return `<g class="hmi-counter ${v === null ? "hmi-unknown" : "hmi-normal"}">` + rect("hmi-tag-box", .5, .5, w - 1, h - 1, 4) + `<text class="hmi-tag-title hmi-left" x="8" y="${f(Math.min(15, h * .25))}" font-size="${f(Math.max(8, Math.min(12, h * .18, (w - 16) / Math.max(4, String(p.title || sym.key || "").length) * 1.6)))}">${escapeXml(p.title || sym.key || "")}</text>` + icon + `<text class="hmi-tag-value hmi-right" x="${f(w - 8)}" y="${f(iy + 1)}" font-size="${f(Math.max(10, Math.min(h * .32, (w - ix - ir - 16) / Math.max(4, text.length) * 1.55)))}" dominant-baseline="central">${escapeXml(text)}</text>` + labelBelow(p, w, h) + "</g>";
		}
		function modeTexts(s) {
			const out = {};
			for (const part of String(s || "").split(",")) {
				const i = part.indexOf("=");
				if (i > 0) out[part.slice(0, i).trim()] = part.slice(i + 1).trim();
			}
			return out;
		}
		function renderMode(sym, value, opts) {
			const p = sym.props || {};
			const { w, h } = sym;
			const texts = modeTexts(p.texts);
			let k = value;
			if (typeof k === "boolean") k = k ? 1 : 0;
			const known = k !== void 0 && k !== null && k !== "";
			const text = known ? texts[String(k)] !== void 0 ? texts[String(k)] : String(k) : "—";
			const abnormal = known && p.normal !== void 0 && p.normal !== "" && String(k) !== String(p.normal);
			const cls = !known ? "hmi-unknown" : abnormal ? "hmi-abnormal" : "hmi-normal";
			const title = p.title ? `<text class="hmi-tag-title hmi-left" x="8" y="${f(h / 2)}" font-size="${f(Math.max(9, Math.min(12, h * .34)))}" dominant-baseline="central">${escapeXml(p.title)}</text>` : "";
			return `<g class="hmi-mode ${cls}">` + rect("hmi-mode-box", 1, 1, w - 2, h - 2, 4) + title + `<text class="hmi-mode-text${p.title ? " hmi-right" : ""}" x="${f(p.title ? w - 8 : w / 2)}" y="${f(h / 2)}" font-size="${f(Math.max(10, Math.min(h * .46, 18)))}">${escapeXml(text)}</text>` + labelBelow(p, w, h) + "</g>";
		}
		function renderInterlock(sym, value, opts) {
			const p = sym.props || {};
			const { w, h } = sym;
			const on = onState(value, p);
			const s = Math.min(w, h);
			const cx = w / 2;
			if (p.kind === "perm") {
				const r = s / 2 - 2;
				const cy = h / 2;
				const mark = on === false ? `M${f(cx - r * .4)} ${f(cy - r * .4)}L${f(cx + r * .4)} ${f(cy + r * .4)}M${f(cx + r * .4)} ${f(cy - r * .4)}L${f(cx - r * .4)} ${f(cy + r * .4)}` : `M${f(cx - r * .45)} ${f(cy)}L${f(cx - r * .1)} ${f(cy + r * .38)}L${f(cx + r * .48)} ${f(cy - r * .35)}`;
				return `<g class="hmi-perm ${stateClass(on)}">${circle("hmi-perm-ring", cx, cy, r)}${path("hmi-perm-mark", mark)}${labelBelow(p, w, h)}</g>`;
			}
			const bw = s * .7;
			const bh = s * .5;
			const by = h - bh - 2;
			const sr = bw * .3;
			const lift = on ? 0 : sr * .8;
			return `<g class="hmi-lock ${stateClass(on)}">` + path("hmi-shackle", `M${f(cx - sr)} ${f(by)}V${f(by - sr - lift)}a${f(sr)} ${f(sr)} 0 0 1 ${f(sr * 2)} 0V${f(by - (on ? 0 : lift * .2))}`) + rect("hmi-lock-body", cx - bw / 2, by, bw, bh, 3) + circle("hmi-keyhole", cx, by + bh * .45, Math.max(1.5, bh * .12)) + labelBelow(p, w, h) + "</g>";
		}
		function renderFitting(sym, value, opts) {
			const p = sym.props || {};
			const { w, h } = sym;
			const on = p.onWhen && sym.key ? onState(value, p) : null;
			const t = Math.max(2, Number(p.thick) || 8);
			const cx = w / 2;
			const cy = h / 2;
			let d = "";
			let extra = "";
			switch (p.kind) {
				case "tee":
					d = `M0 ${f(cy)}H${f(w)}M${f(cx)} ${f(cy)}V${f(h)}`;
					break;
				case "cross":
					d = `M0 ${f(cy)}H${f(w)}M${f(cx)} 0V${f(h)}`;
					break;
				case "flange":
					d = `M0 ${f(cy)}H${f(w)}`;
					extra = rect("hmi-flange", cx - t * .9, cy - t * 1.4, t * .7, t * 2.8, 1) + rect("hmi-flange", cx + t * .2, cy - t * 1.4, t * .7, t * 2.8, 1);
					break;
				case "reducer":
					extra = poly("hmi-fit-fill", [
						[0, cy - t * .9],
						[w * .35, cy - t * .9],
						[w * .65, cy - t / 2],
						[w, cy - t / 2],
						[w, cy + t / 2],
						[w * .65, cy + t / 2],
						[w * .35, cy + t * .9],
						[0, cy + t * .9]
					]);
					break;
				case "cap":
					d = `M0 ${f(cy)}H${f(w - t)}`;
					extra = path("hmi-fit-fill", `M${f(w - t * 1.2)} ${f(cy - t * .75)}h${f(t * .4)}a${f(t * .75)} ${f(t * .75)} 0 0 1 0 ${f(t * 1.5)}h${f(-t * .4)}Z`);
					break;
				default: d = `M0 ${f(cy)}H${f(cx)}V${f(h)}`;
			}
			const sw = ` style="stroke-width:${f(t)}px"`;
			return `<g class="hmi-fitting ${stateClass(on)}">` + (d ? `<path class="hmi-hit" d="${d}"/><path class="hmi-fit-pipe" d="${d}"${sw}/>` : "") + extra + "</g>";
		}
		function renderArrow(sym, value, opts) {
			const p = sym.props || {};
			const { w, h } = sym;
			const on = sym.key ? onState(value, p) : true;
			const color = [
				"info",
				"warn",
				"alarm",
				"ok"
			].includes(p.color) ? p.color : "auto";
			const t = h * .36;
			const hl = Math.min(w * .4, h * .9);
			let shape;
			if (p.kind === "double") shape = poly("hmi-arrow-body", [
				[0, h / 2],
				[hl, 0],
				[hl, h / 2 - t / 2],
				[w - hl, h / 2 - t / 2],
				[w - hl, 0],
				[w, h / 2],
				[w - hl, h],
				[w - hl, h / 2 + t / 2],
				[hl, h / 2 + t / 2],
				[hl, h]
			]);
			else if (p.kind === "chevron") {
				const n = Math.max(1, Math.round(w / (h * .9)));
				const step = w / n;
				shape = Array.from({ length: n }, (x, i) => {
					const x0 = i * step;
					const k = step * .45;
					return poly("hmi-arrow-body", [
						[x0, 0],
						[x0 + k, 0],
						[x0 + step * .9, h / 2],
						[x0 + k, h],
						[x0, h],
						[x0 + step * .9 - k, h / 2]
					]);
				}).join("");
			} else shape = poly("hmi-arrow-body", [
				[0, h / 2 - t / 2],
				[w - hl, h / 2 - t / 2],
				[w - hl, 0],
				[w, h / 2],
				[w - hl, h],
				[w - hl, h / 2 + t / 2],
				[0, h / 2 + t / 2]
			]);
			return `<g class="hmi-arrow hmi-c-${color} ${stateClass(on)}">${shape}${labelBelow(p, w, h)}</g>`;
		}
		const EVENT_TEXT = {
			ATIVO: "ATIVO",
			NORMAL: "NORMAL",
			RECONHECIDO: "RECONHECIDO",
			SUPRIMIDO: "SUPRIMIDO",
			LIBERADO: "LIBERADO"
		};
		const when = (ts, locale) => {
			try {
				return new Date(ts).toLocaleString(locale || "pt-BR", {
					day: "2-digit",
					month: "2-digit",
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit"
				});
			} catch (e) {
				return new Date(ts).toISOString().slice(5, 19).replace("T", " ");
			}
		};
		const clip = (t, px, size) => {
			const max = Math.max(3, Math.floor(px / (size * .56)));
			t = String(t || "");
			return t.length > max ? t.slice(0, max - 1) + "…" : t;
		};
		const SAMPLE = {
			active: [
				{
					id: "ex1",
					text: "Motor M1 em falha (exemplo)",
					priority: "1",
					active: true,
					acked: false,
					since: Date.UTC(2026, 9, 17, 11, 2, 5)
				},
				{
					id: "ex2",
					text: "Temperatura estufa alto (exemplo)",
					priority: "2",
					active: true,
					acked: true,
					since: Date.UTC(2026, 9, 17, 10, 41, 30)
				},
				{
					id: "ex3",
					text: "Nível tanque baixo (exemplo)",
					priority: "3",
					active: false,
					acked: false,
					since: Date.UTC(2026, 9, 17, 9, 15, 0)
				}
			],
			history: [{
				ts: Date.UTC(2026, 9, 17, 11, 2, 5),
				text: "Motor M1 em falha (exemplo)",
				priority: "1",
				event: "ATIVO"
			}, {
				ts: Date.UTC(2026, 9, 17, 10, 50, 0),
				text: "Temperatura estufa alto (exemplo)",
				priority: "2",
				event: "RECONHECIDO",
				user: "operador"
			}]
		};
		function renderAlarmList(sym, value, opts) {
			const p = sym.props || {};
			const { w, h } = sym;
			const data = opts.alarms || (opts.editor ? SAMPLE : {
				active: [],
				history: []
			});
			const tab = opts.ui && opts.ui.tab || p.tab || "active";
			const rowH = Math.max(18, Number(p.rowHeight) || 26);
			const fs = Math.max(10, Math.min(14, rowH * .5));
			const head = 34;
			const rows = Math.max(1, Math.floor((h - head - 4) / rowH));
			const active = Array.isArray(data.active) ? data.active : [];
			const unacked = active.filter((a) => !a.acked).length;
			const shelvedList = Array.isArray(data.shelved) ? data.shelved : [];
			const perm = opts.perm || {};
			const canAck = perm.ack !== false;
			const canShelve = p.shelve !== "no" && perm.shelve !== false;
			const tx0 = Math.max(150, Math.min(w * .32, w - 152 - 340));
			const btn = (x, y, bw, bh, label, action, cls) => `<g class="hmi-al-btn${cls ? " " + cls : ""}" data-hmi="${escapeXml(action)}">${rect("hmi-al-btn-box", x, y, bw, bh, 4)}<text x="${f(x + bw / 2)}" y="${f(y + bh / 2)}" font-size="12">${escapeXml(label)}</text></g>`;
			let out = `<g class="hmi-alarmlist">` + rect("hmi-tag-box", .5, .5, w - 1, h - 1, 4) + `<text class="hmi-tag-title hmi-left" x="10" y="21" font-size="13">${escapeXml((p.title || "ALARMES") + " (" + active.length + ")")}</text>` + btn(tx0, 6, 78, 22, "Ativos", "tab:active", tab === "active" ? "hmi-al-sel" : "") + btn(tx0 + 84, 6, 84, 22, "Histórico", "tab:history", tab === "history" ? "hmi-al-sel" : "") + (p.shelve !== "no" ? btn(tx0 + 174, 6, 112, 22, "Suprimidos (" + shelvedList.length + ")", "tab:shelved", tab === "shelved" ? "hmi-al-sel" : "") : "") + (unacked && canAck ? btn(w - 152, 6, 144, 22, "Reconhecer todos", "ack:all", "hmi-al-ackall") : "") + (opts.sound && opts.sound !== "off" ? btn(w - 190, 6, 32, 22, opts.muted ? "🔕" : "🔔", "mute", "hmi-al-shelve") : "") + path("hmi-al-line", `M1 ${head}H${f(w - 1)}`);
			const tx = 48;
			const tw = w - tx - 10;
			const timeW = Math.min(150, tw * .3);
			const list = tab === "history" ? Array.isArray(data.history) ? data.history : [] : tab === "shelved" ? shelvedList : active;
			if (!list.length) out += `<text class="hmi-al-empty" x="${f(w / 2)}" y="${f(head + rowH)}" font-size="${f(fs)}">${tab === "history" ? "Sem eventos" : tab === "shelved" ? "Nenhum alarme suprimido" : "Nenhum alarme"}</text>`;
			list.slice(0, rows).forEach((a, i) => {
				const y = 36 + i * rowH;
				const cy = y + rowH / 2;
				const pr = [
					"1",
					"2",
					"3"
				].includes(String(a.priority)) ? String(a.priority) : "2";
				let state;
				let cls;
				if (tab === "history") {
					state = (EVENT_TEXT[a.event] || a.event || "") + (a.user ? " · " + a.user : "");
					cls = "hmi-al-hist";
				} else if (tab === "shelved") {
					state = "ATÉ " + when(a.until, opts.locale).slice(-8, -3) + (a.by ? " · " + a.by : "");
					cls = "hmi-al-hist";
				} else {
					state = a.active ? a.acked ? "RECONHECIDO" : "ATIVO" : "NORMAL";
					cls = a.active ? a.acked ? "hmi-al-acked" : "hmi-al-unacked" : "hmi-al-rtn";
				}
				const stateW = tab === "active" ? 118 : Math.min(200, tw * .3);
				const ackW = tab === "active" && !a.acked && canAck ? 34 : 0;
				const shW = tab === "active" && canShelve || tab === "shelved" && perm.shelve !== false ? 34 : 0;
				const textW = tw - timeW - stateW - ackW - shW - 16;
				out += `<g class="hmi-al-row ${cls}"${a.symbolId ? ` data-hmi="goto:${escapeXml(a.symbolId)}"` : ""}>` + rect("hmi-al-hit", 1, y, w - 2, rowH) + (i % 2 ? rect("hmi-al-stripe", 1, y, w - 2, rowH) : "") + `<g class="${cls === "hmi-al-unacked" ? "hmi-blink" : ""}">${alarmIndicator(24, cy, pr)}</g><text class="hmi-al-time hmi-left" x="${tx}" y="${f(cy)}" font-size="${f(fs * .92)}">${escapeXml(tab === "shelved" ? "suprimido" : when(a.since || a.ts, opts.locale))}</text><text class="hmi-al-text hmi-left" x="${f(tx + timeW + 8)}" y="${f(cy)}" font-size="${f(fs)}">${escapeXml(clip(a.text, textW, fs))}</text><text class="hmi-al-state hmi-left" x="${f(w - 10 - ackW - shW - stateW)}" y="${f(cy)}" font-size="${f(fs * .85)}">${escapeXml(clip(state, stateW, fs * .85))}</text>` + (shW ? btn(w - 10 - ackW - shW + 4, cy - 10, shW - 4, 20, tab === "shelved" ? "▶" : "II", (tab === "shelved" ? "unshelve:" : "shelve:") + a.id, "hmi-al-shelve") : "") + (ackW ? btn(w - 10 - ackW + 4, cy - 10, ackW - 4, 20, "✓", "ack:" + a.id, "hmi-al-ack") : "") + "</g>";
			});
			if (list.length > rows) out += `<text class="hmi-al-more hmi-right" x="${f(w - 10)}" y="${f(h - 4)}" font-size="10">+${list.length - rows}</text>`;
			return out + "</g>";
		}
		function renderAlarmSummary(sym, value, opts) {
			const p = sym.props || {};
			const { w, h } = sym;
			const data = opts.alarms || (opts.editor ? SAMPLE : { active: [] });
			const active = Array.isArray(data.active) ? data.active : [];
			const unacked = active.filter((a) => !a.acked);
			const top = (unacked.length ? unacked : active).reduce((m, a) => Math.min(m, Number(a.priority) || 3), 9);
			const s = Math.min(h * .7, 28);
			const bx = 8 + s / 2;
			const bell = `M${f(bx - s * .36)} ${f(h / 2 + s * .22)}c0 -${f(s * .1)} ${f(s * .08)} -${f(s * .1)} ${f(s * .08)} -${f(s * .3)}v-${f(s * .16)}a${f(s * .28)} ${f(s * .28)} 0 0 1 ${f(s * .56)} 0v${f(s * .16)}c0 ${f(s * .2)} ${f(s * .08)} ${f(s * .2)} ${f(s * .08)} ${f(s * .3)}z`;
			const txt = active.length ? active.length + (active.length === 1 ? " ALARME" : " ALARMES") : "SEM ALARMES";
			return `<g class="hmi-alsum ${active.length ? "hmi-p" + top : "hmi-al-none"}${unacked.length ? " hmi-al-new" : ""}">` + rect("hmi-alsum-box", 1, 1, w - 2, h - 2, 6) + `<g class="${unacked.length ? "hmi-blink" : ""}">${path("hmi-bell", bell)}${circle("hmi-bell", bx, h / 2 + s * .32, s * .08)}</g><text class="hmi-alsum-text hmi-left" x="${f(bx + s * .6)}" y="${f(h / 2)}" font-size="${f(Math.max(10, Math.min(h * .4, 16)))}">${escapeXml(txt)}${unacked.length ? escapeXml(" · " + unacked.length + " novo" + (unacked.length === 1 ? "" : "s")) : ""}</text>` + labelBelow(p, w, h) + "</g>";
		}
		return {
			alarmList: {
				label: "Lista de alarmes",
				group: "Estados",
				w: 640,
				h: 220,
				preview: void 0,
				alarms: true,
				defaults: {
					title: "ALARMES",
					rowHeight: 26,
					tab: "active",
					shelve: "yes",
					shelveMinutes: 30
				},
				fields: [
					TITLE,
					{
						key: "rowHeight",
						label: "Altura da linha",
						type: "number"
					},
					{
						key: "tab",
						label: "Abre em",
						type: "select",
						options: [
							["active", "Ativos"],
							["history", "Histórico"],
							["shelved", "Suprimidos"]
						]
					},
					{
						key: "shelve",
						label: "Permitir suprimir (II)",
						type: "select",
						options: [["yes", "Sim"], ["no", "Não"]],
						refresh: true
					},
					{
						key: "shelveMinutes",
						label: "Suprimir por (minutos)",
						type: "number",
						when: (p) => p.shelve !== "no"
					}
				],
				render: renderAlarmList
			},
			alarmSummary: {
				label: "Resumo de alarmes",
				group: "Estados",
				w: 220,
				h: 40,
				preview: void 0,
				alarms: true,
				defaults: { label: "" },
				fields: [LABEL],
				render: renderAlarmSummary
			},
			vfd: {
				label: "Inversor de frequência",
				group: "Elétrica",
				w: 90,
				h: 130,
				preview: 42.5,
				defaults: {
					label: "",
					unit: "Hz",
					decimals: 1,
					runKey: "",
					dirKey: "",
					faultKey: "",
					priority: "1"
				},
				fields: [
					LABEL,
					UNIT,
					DEC,
					key("runKey", "Chave rodando (vazio = valor ≠ 0)"),
					key("dirKey", "Chave reverso (vazio = valor negativo)"),
					FAULT_FIELD,
					PRIORITY_FIELD
				],
				render: renderVfd
			},
			breaker: {
				label: "Disjuntor",
				group: "Elétrica",
				w: 50,
				h: 90,
				preview: 1,
				defaults: {
					label: "",
					onWhen: "nonzero",
					threshold: 0,
					invert: "no",
					tripKey: "",
					priority: "1"
				},
				fields: [
					LABEL,
					{
						...ON_FIELDS[0],
						label: "Fechado quando"
					},
					ON_FIELDS[1],
					INVERT_FIELD,
					key("tripKey", "Chave disparado (opcional)"),
					PRIORITY_FIELD
				],
				render: renderBreaker
			},
			contactor: {
				label: "Contator",
				group: "Elétrica",
				w: 60,
				h: 90,
				preview: 1,
				defaults: { ...EQ_DEFAULTS },
				fields: [
					LABEL,
					{
						...ON_FIELDS[0],
						label: "Fechado quando"
					},
					ON_FIELDS[1],
					INVERT_FIELD,
					FAULT_FIELD,
					PRIORITY_FIELD
				],
				render: renderContactor
			},
			transformer: {
				label: "Transformador",
				group: "Elétrica",
				w: 80,
				h: 120,
				preview: 1,
				defaults: {
					...EQ_DEFAULTS,
					rating: "13,8 / 0,38 kV"
				},
				fields: [
					LABEL,
					{
						key: "rating",
						label: "Texto embaixo (tensão, potência)",
						type: "text"
					},
					{
						...ON_FIELDS[0],
						label: "Energizado quando"
					},
					ON_FIELDS[1],
					INVERT_FIELD,
					{
						...FAULT_FIELD,
						label: "Chave de alarme (temperatura, Buchholz)"
					},
					PRIORITY_FIELD
				],
				render: renderTransformer
			},
			generator: {
				label: "Gerador",
				group: "Elétrica",
				w: 70,
				h: 90,
				preview: 1,
				defaults: { ...EQ_DEFAULTS },
				fields: EQ_FIELDS,
				render: renderGenerator
			},
			energyMeter: {
				label: "Medidor de energia",
				group: "Elétrica",
				w: 150,
				h: 90,
				preview: 37.4,
				defaults: {
					title: "POTÊNCIA",
					label: "",
					unit: "kW",
					decimals: 1,
					energyKey: "",
					energyUnit: "kWh",
					energyDecimals: 0
				},
				fields: [
					TITLE,
					LABEL,
					UNIT,
					DEC,
					key("energyKey", "Chave da energia (kWh)"),
					{
						key: "energyUnit",
						label: "Unidade da energia",
						type: "text"
					},
					{
						key: "energyDecimals",
						label: "Casas da energia",
						type: "number"
					}
				],
				render: renderEnergyMeter
			},
			compressor: {
				label: "Compressor",
				group: "Processo",
				w: 70,
				h: 76,
				preview: 1,
				defaults: { ...EQ_DEFAULTS },
				fields: EQ_FIELDS,
				render: renderCompressor
			},
			blower: {
				label: "Soprador (blower)",
				group: "Processo",
				w: 90,
				h: 70,
				preview: 1,
				defaults: {
					...EQ_DEFAULTS,
					dir: "cw"
				},
				fields: [...EQ_FIELDS, DIR],
				render: renderBlower
			},
			bagFilter: {
				label: "Filtro de mangas",
				group: "Processo",
				w: 110,
				h: 180,
				preview: 85,
				defaults: {
					label: "",
					unit: "mmca",
					decimals: 0,
					lo: "",
					hi: 150,
					priority: "2"
				},
				fields: [
					LABEL,
					UNIT,
					DEC,
					LO,
					HI,
					PRIORITY_FIELD
				],
				render: renderBagFilter
			},
			controlValve: {
				label: "Válvula de controle",
				group: "Processo",
				w: 70,
				h: 90,
				preview: 45,
				defaults: {
					label: "",
					min: 0,
					max: 100,
					faultKey: "",
					priority: "1"
				},
				fields: [
					LABEL,
					{
						...MIN,
						label: "Valor fechada"
					},
					{
						...MAX,
						label: "Valor aberta"
					},
					FAULT_FIELD,
					PRIORITY_FIELD
				],
				render: renderControlValve
			},
			valve3: {
				label: "Válvula 3 vias",
				group: "Processo",
				w: 70,
				h: 70,
				preview: 1,
				defaults: { ...EQ_DEFAULTS },
				fields: [
					LABEL,
					{
						...ON_FIELDS[0],
						label: "Saída de baixo quando"
					},
					ON_FIELDS[1],
					INVERT_FIELD,
					FAULT_FIELD,
					PRIORITY_FIELD
				],
				render: renderValve3
			},
			damper: {
				label: "Damper (registro de duto)",
				group: "Processo",
				w: 120,
				h: 50,
				preview: 60,
				defaults: {
					label: "",
					min: 0,
					max: 100,
					faultKey: "",
					priority: "1"
				},
				fields: [
					LABEL,
					{
						...MIN,
						label: "Valor fechado"
					},
					{
						...MAX,
						label: "Valor aberto"
					},
					FAULT_FIELD,
					PRIORITY_FIELD
				],
				render: renderDamper
			},
			mixer: {
				label: "Misturador / agitador",
				group: "Processo",
				w: 100,
				h: 160,
				preview: 1,
				defaults: { ...EQ_DEFAULTS },
				fields: EQ_FIELDS,
				render: renderMixer
			},
			heatExchanger: {
				label: "Trocador de calor",
				group: "Processo",
				w: 190,
				h: 80,
				preview: 1,
				defaults: { ...EQ_DEFAULTS },
				fields: EQ_FIELDS,
				render: renderHeatExchanger
			},
			boiler: {
				label: "Caldeira",
				group: "Processo",
				w: 100,
				h: 170,
				preview: 1,
				defaults: { ...EQ_DEFAULTS },
				fields: [
					LABEL,
					{
						...ON_FIELDS[0],
						label: "Queimador ligado quando"
					},
					ON_FIELDS[1],
					INVERT_FIELD,
					FAULT_FIELD,
					PRIORITY_FIELD
				],
				render: renderBoiler
			},
			coolingTower: {
				label: "Torre de resfriamento",
				group: "Processo",
				w: 130,
				h: 160,
				preview: 1,
				defaults: { ...EQ_DEFAULTS },
				fields: EQ_FIELDS,
				render: renderCoolingTower
			},
			chiller: {
				label: "Chiller",
				group: "Processo",
				w: 160,
				h: 100,
				preview: 1,
				defaults: { ...EQ_DEFAULTS },
				fields: EQ_FIELDS,
				render: renderChiller
			},
			cyclone: {
				label: "Ciclone",
				group: "Processo",
				w: 80,
				h: 170,
				preview: 1,
				defaults: { ...EQ_DEFAULTS },
				fields: EQ_FIELDS,
				render: renderCyclone
			},
			flowmeter: {
				label: "Medidor de vazão",
				group: "Processo",
				w: 150,
				h: 64,
				preview: 12.6,
				defaults: {
					label: "",
					tagText: "FT",
					unit: "m³/h",
					decimals: 1,
					lo: "",
					hi: "",
					priority: "2"
				},
				fields: [
					LABEL,
					{
						key: "tagText",
						label: "Letras no círculo",
						type: "text"
					},
					UNIT,
					DEC,
					LO,
					HI,
					PRIORITY_FIELD
				],
				render: renderFlowmeter
			},
			instrument: {
				label: "Instrumento ISA (bolha)",
				group: "Processo",
				w: 64,
				h: 64,
				preview: 6.2,
				defaults: {
					letters: "PT",
					number: "101",
					location: "field",
					showValue: "yes",
					label: "",
					unit: "bar",
					decimals: 1,
					lo: "",
					hi: "",
					priority: "2"
				},
				fields: [
					{
						key: "letters",
						label: "Letras (ex. PT, TT, FIC)",
						type: "text"
					},
					{
						key: "number",
						label: "Número da malha",
						type: "text"
					},
					{
						key: "location",
						label: "Montagem",
						type: "select",
						options: [
							["field", "Campo (sem traço)"],
							["panel", "Painel (traço)"],
							["behind", "Atrás do painel (tracejado)"],
							["dcs", "Supervisório / CLP (quadrado)"]
						]
					},
					{
						key: "showValue",
						label: "Mostrar valor",
						type: "select",
						options: [["yes", "Sim"], ["no", "Não"]]
					},
					LABEL,
					UNIT,
					DEC,
					LO,
					HI,
					PRIORITY_FIELD
				],
				render: renderInstrument
			},
			crane: {
				label: "Ponte rolante / talha",
				group: "Fábrica",
				variants: [{
					label: "Ponte rolante",
					w: 420,
					h: 220,
					props: { kind: "crane" }
				}, {
					label: "Talha",
					w: 140,
					h: 200,
					props: { kind: "hoist" }
				}],
				w: 420,
				h: 220,
				preview: 40,
				defaults: {
					kind: "crane",
					label: "",
					min: 0,
					max: 100,
					hookKey: "",
					hookMin: 0,
					hookMax: 100,
					loadKey: "",
					faultKey: "",
					priority: "1"
				},
				fields: [
					{
						key: "kind",
						label: "Tipo",
						type: "select",
						options: [["crane", "Ponte rolante (chave = posição do carro)"], ["hoist", "Talha (chave = altura do gancho)"]],
						refresh: true
					},
					LABEL,
					{
						...MIN,
						label: "Valor mín. (esquerda / embaixo)"
					},
					{
						...MAX,
						label: "Valor máx. (direita / em cima)"
					},
					{
						...key("hookKey", "Chave da altura do gancho"),
						when: (p) => p.kind !== "hoist"
					},
					{
						key: "hookMin",
						label: "Gancho embaixo",
						type: "number",
						when: (p) => p.kind !== "hoist"
					},
					{
						key: "hookMax",
						label: "Gancho em cima",
						type: "number",
						when: (p) => p.kind !== "hoist"
					},
					key("loadKey", "Chave com carga (opcional)"),
					FAULT_FIELD,
					PRIORITY_FIELD
				],
				render: renderCrane
			},
			robot: {
				label: "Robô (braço)",
				group: "Fábrica",
				w: 110,
				h: 120,
				preview: 1,
				defaults: {
					...EQ_DEFAULTS,
					weldKey: ""
				},
				fields: [...EQ_FIELDS, key("weldKey", "Chave soldando (faísca)")],
				render: renderRobot
			},
			welder: {
				label: "Fonte de solda",
				group: "Fábrica",
				w: 80,
				h: 110,
				preview: 180,
				defaults: {
					label: "",
					unit: "A",
					decimals: 0,
					arcKey: "",
					faultKey: "",
					priority: "1"
				},
				fields: [
					LABEL,
					UNIT,
					DEC,
					key("arcKey", "Chave arco aberto (vazio = valor > 0)"),
					FAULT_FIELD,
					PRIORITY_FIELD
				],
				render: renderWelder
			},
			oven: {
				label: "Estufa / forno",
				group: "Fábrica",
				w: 170,
				h: 130,
				preview: 180,
				defaults: {
					label: "",
					unit: "°C",
					decimals: 0,
					lo: "",
					hi: 220,
					priority: "2",
					doorKey: "",
					heatKey: ""
				},
				fields: [
					LABEL,
					UNIT,
					DEC,
					LO,
					HI,
					PRIORITY_FIELD,
					key("doorKey", "Chave porta aberta"),
					key("heatKey", "Chave aquecendo")
				],
				render: renderOven
			},
			paintBooth: {
				label: "Cabine de pintura",
				group: "Fábrica",
				w: 190,
				h: 130,
				preview: 1,
				defaults: { ...EQ_DEFAULTS },
				fields: EQ_FIELDS,
				render: renderPaintBooth
			},
			calender: {
				label: "Calandra (3 rolos)",
				group: "Fábrica",
				w: 160,
				h: 120,
				preview: 1,
				defaults: {
					...EQ_DEFAULTS,
					dir: "cw"
				},
				fields: [...EQ_FIELDS, DIR],
				render: renderCalender
			},
			press: {
				label: "Prensa / dobradeira",
				group: "Fábrica",
				w: 120,
				h: 160,
				preview: 30,
				defaults: {
					label: "",
					min: 0,
					max: 100,
					faultKey: "",
					priority: "1"
				},
				fields: [
					LABEL,
					{
						...MIN,
						label: "Valor em cima"
					},
					{
						...MAX,
						label: "Valor embaixo"
					},
					FAULT_FIELD,
					PRIORITY_FIELD
				],
				render: renderPress
			},
			scale: {
				label: "Balança",
				group: "Fábrica",
				w: 150,
				h: 80,
				preview: 1250,
				defaults: {
					label: "",
					unit: "kg",
					decimals: 1,
					lo: "",
					hi: "",
					priority: "2"
				},
				fields: [
					LABEL,
					UNIT,
					DEC,
					LO,
					HI,
					PRIORITY_FIELD
				],
				render: renderScale
			},
			vehicle: {
				label: "Veículo",
				group: "Fábrica",
				variants: [
					{
						label: "Carrinho de transferência",
						w: 320,
						h: 70,
						props: {
							kind: "cart",
							move: "pos"
						}
					},
					{
						label: "AGV",
						w: 90,
						h: 50,
						props: {
							kind: "agv",
							move: "fixed"
						}
					},
					{
						label: "Empilhadeira",
						w: 110,
						h: 80,
						props: {
							kind: "forklift",
							move: "fixed"
						}
					}
				],
				w: 320,
				h: 70,
				preview: 50,
				defaults: {
					kind: "cart",
					move: "pos",
					label: "",
					min: 0,
					max: 100,
					onWhen: "nonzero",
					threshold: 0,
					invert: "no",
					faultKey: "",
					priority: "1"
				},
				fields: [
					{
						key: "kind",
						label: "Tipo",
						type: "select",
						options: [
							["cart", "Carrinho no trilho"],
							["agv", "AGV"],
							["forklift", "Empilhadeira"]
						]
					},
					{
						key: "move",
						label: "A chave é",
						type: "select",
						options: [["pos", "Posição (anda na largura)"], ["fixed", "Ligado / desligado"]],
						refresh: true
					},
					LABEL,
					{
						...MIN,
						label: "Posição esquerda",
						when: (p) => p.move === "pos"
					},
					{
						...MAX,
						label: "Posição direita",
						when: (p) => p.move === "pos"
					},
					{
						...ON_FIELDS[0],
						when: (p) => p.move !== "pos"
					},
					{
						...ON_FIELDS[1],
						when: (p) => p.move !== "pos"
					},
					{
						...INVERT_FIELD,
						when: (p) => p.move !== "pos"
					},
					FAULT_FIELD,
					PRIORITY_FIELD
				],
				render: renderVehicle
			},
			rollerTable: {
				label: "Mesa de rolos",
				group: "Fábrica",
				w: 260,
				h: 44,
				preview: 1,
				defaults: {
					...EQ_DEFAULTS,
					dir: "cw"
				},
				fields: [...EQ_FIELDS, DIR],
				render: renderRollerTable
			},
			isaBar: {
				label: "Barra ISA-101",
				group: "Valores",
				variants: [{
					label: "Barra ISA-101 (vertical)",
					w: 80,
					h: 220
				}, {
					label: "Barra ISA-101 (horizontal)",
					w: 260,
					h: 80
				}],
				w: 80,
				h: 220,
				preview: 62,
				defaults: {
					title: "TEMPERATURA",
					unit: "°C",
					decimals: 0,
					min: 0,
					max: 100,
					lolo: 10,
					lo: 30,
					hi: 80,
					hihi: 90,
					spKey: "",
					priority: "2"
				},
				fields: [
					TITLE,
					UNIT,
					DEC,
					MIN,
					MAX,
					{
						key: "lolo",
						label: "Alarme muito baixo (LL)",
						type: "number"
					},
					{
						key: "lo",
						label: "Faixa normal de (L)",
						type: "number"
					},
					{
						key: "hi",
						label: "Faixa normal até (H)",
						type: "number"
					},
					{
						key: "hihi",
						label: "Alarme muito alto (HH)",
						type: "number"
					},
					key("spKey", "Chave do setpoint (opcional)"),
					{
						...PRIORITY_FIELD,
						label: "Prioridade fora de L/H"
					}
				],
				render: renderIsaBar
			},
			counter: {
				label: "Contador",
				group: "Valores",
				variants: [{
					label: "Horas de funcionamento",
					w: 170,
					h: 64,
					props: {
						kind: "hours",
						title: "HORAS DE FUNCIONAMENTO"
					}
				}, {
					label: "Contador de partidas",
					w: 170,
					h: 64,
					props: {
						kind: "count",
						title: "PARTIDAS",
						unit: ""
					}
				}],
				w: 170,
				h: 64,
				preview: 1234,
				defaults: {
					kind: "hours",
					title: "HORAS",
					src: "h",
					decimals: 0,
					unit: "",
					label: ""
				},
				fields: [
					{
						key: "kind",
						label: "Tipo",
						type: "select",
						options: [["hours", "Horas"], ["count", "Contagem"]],
						refresh: true
					},
					TITLE,
					{
						key: "src",
						label: "O CLP manda em",
						type: "select",
						options: [
							["h", "Horas"],
							["min", "Minutos"],
							["s", "Segundos"],
							["split", "Horas, minutos e segundos separados"]
						],
						when: (p) => p.kind === "hours",
						refresh: true
					},
					{
						key: "minKey",
						label: "Chave dos minutos (a chave do símbolo é a das horas)",
						type: "text",
						when: (p) => p.kind === "hours" && p.src === "split"
					},
					{
						key: "secKey",
						label: "Chave dos segundos (vazio = não mostra)",
						type: "text",
						when: (p) => p.kind === "hours" && p.src === "split"
					},
					{
						...DEC,
						when: (p) => p.kind === "hours" && p.src !== "split"
					},
					{
						...UNIT,
						when: (p) => p.kind !== "hours"
					},
					LABEL
				],
				render: renderCounter
			},
			mode: {
				label: "Modo (MAN / AUTO)",
				group: "Estados",
				w: 150,
				h: 36,
				preview: 1,
				defaults: {
					title: "MODO",
					texts: "0=MANUAL,1=AUTO,2=LOCAL,3=REMOTO",
					normal: "1",
					label: ""
				},
				fields: [
					TITLE,
					{
						key: "texts",
						label: "Textos (valor=texto, separados por vírgula)",
						type: "text"
					},
					{
						key: "normal",
						label: "Valor normal (os outros ficam destacados)",
						type: "text"
					},
					LABEL
				],
				render: renderMode
			},
			interlock: {
				label: "Intertravamento",
				group: "Estados",
				variants: [{
					label: "Intertravamento (cadeado)",
					w: 40,
					h: 46,
					props: { kind: "lock" }
				}, {
					label: "Permissivo (OK)",
					w: 40,
					h: 40,
					props: { kind: "perm" }
				}],
				w: 40,
				h: 46,
				preview: 1,
				defaults: {
					kind: "lock",
					label: "",
					onWhen: "nonzero",
					threshold: 0,
					invert: "no"
				},
				fields: [
					{
						key: "kind",
						label: "Tipo",
						type: "select",
						options: [["lock", "Intertravamento (ligado = bloqueado)"], ["perm", "Permissivo (ligado = OK)"]]
					},
					LABEL,
					...ON_FIELDS
				],
				render: renderInterlock
			},
			fitting: {
				label: "Conexão de tubo",
				group: "Linhas",
				variants: [
					{
						label: "Cotovelo",
						w: 50,
						h: 50,
						props: { kind: "elbow" }
					},
					{
						label: "Tê",
						w: 80,
						h: 50,
						props: { kind: "tee" }
					},
					{
						label: "Cruzeta",
						w: 60,
						h: 60,
						props: { kind: "cross" }
					},
					{
						label: "Flange",
						w: 50,
						h: 40,
						props: { kind: "flange" }
					},
					{
						label: "Redução",
						w: 70,
						h: 30,
						props: { kind: "reducer" }
					},
					{
						label: "Tampão",
						w: 40,
						h: 30,
						props: { kind: "cap" }
					}
				],
				w: 50,
				h: 50,
				preview: void 0,
				defaults: {
					kind: "elbow",
					thick: 8,
					onWhen: "nonzero",
					threshold: 0,
					invert: "no"
				},
				fields: [
					{
						key: "kind",
						label: "Tipo",
						type: "select",
						options: [
							["elbow", "Cotovelo"],
							["tee", "Tê"],
							["cross", "Cruzeta"],
							["flange", "Flange"],
							["reducer", "Redução"],
							["cap", "Tampão"]
						]
					},
					{
						key: "thick",
						label: "Espessura (8 = tubulação)",
						type: "number"
					},
					...ON_FIELDS
				],
				render: renderFitting
			},
			arrow: {
				label: "Seta",
				group: "Linhas",
				variants: [
					{
						label: "Seta",
						w: 90,
						h: 30,
						props: { kind: "single" }
					},
					{
						label: "Seta dupla",
						w: 110,
						h: 30,
						props: { kind: "double" }
					},
					{
						label: "Seta de sentido (>>>)",
						w: 90,
						h: 26,
						props: { kind: "chevron" }
					}
				],
				w: 90,
				h: 30,
				preview: void 0,
				defaults: {
					kind: "single",
					color: "auto",
					label: "",
					onWhen: "nonzero",
					threshold: 0,
					invert: "no"
				},
				fields: [
					{
						key: "kind",
						label: "Tipo",
						type: "select",
						options: [
							["single", "Seta"],
							["double", "Seta dupla"],
							["chevron", "Sentido (>>>)"]
						]
					},
					{
						key: "color",
						label: "Cor",
						type: "select",
						options: [
							["auto", "Do tema"],
							["info", "Azul"],
							["ok", "Verde"],
							["warn", "Amarelo"],
							["alarm", "Vermelho"]
						]
					},
					LABEL,
					{
						...ON_FIELDS[0],
						label: "Com chave: acesa quando"
					},
					ON_FIELDS[1],
					INVERT_FIELD
				],
				render: renderArrow
			}
		};
	}
	var MORE_CSS = `
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
.hmi-root.hmi-theme-classic .hmi-eq.hmi-on .hmi-spin, .hmi-root.hmi-anim-always .hmi-eq.hmi-on .hmi-spin { animation: hmi-spin 1.4s linear infinite; }
.hmi-root.hmi-theme-classic .hmi-eq.hmi-on .hmi-spin.hmi-ccw, .hmi-root.hmi-anim-always .hmi-eq.hmi-on .hmi-spin.hmi-ccw { animation: hmi-spin-ccw 1.4s linear infinite; }
.hmi-root.hmi-theme-classic .hmi-eq.hmi-on .hmi-stir, .hmi-root.hmi-anim-always .hmi-eq.hmi-on .hmi-stir { animation: hmi-stir .8s ease-in-out infinite alternate; }
.hmi-root.hmi-theme-classic .hmi-robot.hmi-on .hmi-arm, .hmi-root.hmi-anim-always .hmi-robot.hmi-on .hmi-arm { animation: hmi-arm 2.4s ease-in-out infinite alternate; }
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
.hmi-screen-nav { display: flex; flex-wrap: wrap; gap: 4px; padding: 0 0 6px 0; font-family: "Segoe UI", Roboto, Arial, sans-serif; }
.hmi-screen-tab { font: inherit; font-size: 15px; font-weight: 600; padding: 8px 18px; min-height: 40px; border: 1px solid #8a939d; border-radius: 4px; background: #e6e8ea; color: #222; cursor: pointer; }
.hmi-screen-tab.hmi-screen-on { background: #5b6670; border-color: #5b6670; color: #fff; }
.hmi-nav-classic .hmi-screen-tab { background: #2b2f36; border-color: #4a515b; color: #dfe3e8; }
.hmi-nav-classic .hmi-screen-tab.hmi-screen-on { background: #1e88e5; border-color: #1e88e5; color: #fff; }
.hmi-notice { position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%); z-index: 3100; background: #d71920; color: #fff; font-weight: 700; padding: 10px 18px; border-radius: 6px; box-shadow: 0 6px 20px rgba(0, 0, 0, .3); font-family: "Segoe UI", Roboto, Arial, sans-serif; }
@keyframes hmi-stir { from { transform: scaleX(1); } to { transform: scaleX(-1); } }
@keyframes hmi-arm { from { transform: rotate(-6deg); } to { transform: rotate(5deg); } }
`;
	//#endregion
	//#region ui/symbols/charts.js
	function parseSeries(text) {
		return String(text || "").split(/[,;\n]/).map((t) => t.trim()).filter(Boolean).slice(0, 12).map((t) => {
			const i = t.indexOf(":");
			const key = (i < 0 ? t : t.slice(0, i)).trim();
			return {
				key,
				label: (i < 0 ? key : t.slice(i + 1)).trim() || key
			};
		}).filter((s) => s.key);
	}
	function oeeOf(a, p, q) {
		const parts = [
			a,
			p,
			q
		].map((v) => v === null || v === void 0 || v === "" || !isFinite(Number(v)) ? null : Number(v));
		if (parts.some((v) => v === null)) return null;
		const frac = parts.every((v) => v <= 1.0001);
		const k = parts.map((v) => Math.max(0, frac ? v : v / 100));
		return Math.round(k[0] * k[1] * k[2] * 1e3) / 10;
	}
	function chartSymbols(H) {
		const { f, num, escapeXml, formatValue } = H;
		const TITLE = {
			key: "title",
			label: "Título",
			type: "text"
		};
		const UNIT = {
			key: "unit",
			label: "Unidade",
			type: "text"
		};
		const DEC = {
			key: "decimals",
			label: "Casas decimais",
			type: "number"
		};
		const SERIES = {
			key: "series",
			label: "Chaves (chave:Rótulo, separadas por vírgula)",
			type: "text"
		};
		const SAMPLE = [
			62,
			85,
			48,
			74,
			90,
			55
		];
		function seriesValues(sym, value, opts) {
			const p = sym.props || {};
			let list = parseSeries(p.series);
			const vals = opts && opts.values || {};
			if (!list.length && Array.isArray(value)) {
				const labels = String(p.labels || "").split(",").map((t) => t.trim());
				const lf = p.labelField || "label";
				const vf = p.valueField || "value";
				list = value.slice(0, 31).map((v, i) => v !== null && typeof v === "object" ? {
					key: "",
					label: v[lf] === void 0 || v[lf] === null ? String(i + 1) : String(v[lf]),
					value: num(v[vf])
				} : {
					key: "",
					label: labels[i] || String(i + 1),
					value: num(v)
				});
			} else list = list.map((s) => ({
				...s,
				value: num(vals[s.key])
			}));
			if (opts && opts.editor) {
				if (!list.length) list = [
					"A",
					"B",
					"C",
					"D"
				].map((l) => ({
					key: "",
					label: l
				}));
				list = list.map((s, i) => s.value === null || s.value === void 0 ? {
					...s,
					value: SAMPLE[i % SAMPLE.length]
				} : s);
			}
			return list;
		}
		const card = (w, h) => `<rect class="hmi-kpi-card" x="0.5" y="0.5" width="${f(w - 1)}" height="${f(h - 1)}" rx="6"/>`;
		const title = (p, w) => p.title ? `<text class="hmi-ch-title" x="10" y="16">${escapeXml(p.title)}</text>` : "";
		const txt = (cls, x, y, t, size, anchor) => `<text class="${cls}" x="${f(x)}" y="${f(y)}" font-size="${f(size)}"${anchor ? ` style="text-anchor:${anchor}"` : ""}>${escapeXml(t)}</text>`;
		function renderBarChart(sym, value, opts) {
			const p = sym.props || {};
			const { w, h } = sym;
			const list = seriesValues(sym, value, opts);
			const top = p.title ? 28 : 10;
			const bottom = 22;
			const left = 10;
			const right = 10;
			const pw = w - left - right;
			const ph = h - top - bottom - 14;
			const goal = num(p.goal);
			let max = num(p.max);
			if (max === null || max <= 0) max = Math.max(1, goal || 0, ...list.map((s) => s.value || 0)) * 1.1;
			const slot = pw / Math.max(1, list.length);
			const bw = Math.min(slot * .62, 80);
			const size = Math.max(9, Math.min(13, slot * .22));
			let out = `<g class="hmi-chart hmi-barchart">${card(w, h)}${title(p, w)}`;
			out += `<path class="hmi-ch-axis" d="M${f(left)} ${f(top + 14 + ph)}H${f(w - right)}"/>`;
			list.forEach((s, i) => {
				const v = s.value;
				const k = v === null ? 0 : Math.max(0, Math.min(1, v / max));
				const bh = ph * k;
				const x = left + slot * i + (slot - bw) / 2;
				const y = top + 14 + ph - bh;
				out += `<rect class="hmi-ch-bar hmi-ch-0${goal !== null && v !== null && v < goal && p.lowColor === "warn" ? " hmi-ch-low" : ""}" x="${f(x)}" y="${f(y)}" width="${f(bw)}" height="${f(bh)}"/>`;
				out += txt("hmi-ch-value", x + bw / 2, y - 5, v === null ? "—" : formatValue(v, p.decimals, opts.locale) + (p.unit ? " " + p.unit : ""), size, "middle");
				out += txt("hmi-ch-label", x + bw / 2, h - 8, s.label, size, "middle");
			});
			if (goal !== null && goal <= max) {
				const gy = top + 14 + ph - ph * goal / max;
				out += `<path class="hmi-ch-goal" d="M${f(left)} ${f(gy)}H${f(w - right)}"/>` + txt("hmi-ch-goal-text", w - right, gy - 4, "Meta " + formatValue(goal, p.decimals, opts.locale), size, "end");
			}
			return out + "</g>";
		}
		function renderDonut(sym, value, opts) {
			const p = sym.props || {};
			const { w, h } = sym;
			let list = seriesValues(sym, value, opts).filter((s) => s.value !== null && s.value > 0);
			if (list.length > 6) {
				const sorted = [...list].sort((a, b) => b.value - a.value);
				list = [...sorted.slice(0, 5), {
					key: "",
					label: "Outros",
					value: sorted.slice(5).reduce((a, s) => a + s.value, 0)
				}];
			}
			const total = list.reduce((a, s) => a + s.value, 0);
			const top = p.title ? 26 : 6;
			const legendW = p.legend === "no" ? 0 : Math.min(w * .45, Math.max(170, w * .4));
			const r = Math.max(10, Math.min((w - legendW - 16) / 2, (h - top - 8) / 2));
			const cx = 8 + r;
			const cy = top + (h - top) / 2;
			const t = r * .38;
			let out = `<g class="hmi-chart hmi-donut">${card(w, h)}${title(p, w)}`;
			out += `<circle class="hmi-ch-track" cx="${f(cx)}" cy="${f(cy)}" r="${f(r - t / 2)}" stroke-width="${f(t)}"/>`;
			let a0 = -Math.PI / 2;
			list.forEach((s, i) => {
				const a1 = a0 + 2 * Math.PI * s.value / total;
				const rr = r - t / 2;
				const large = a1 - a0 > Math.PI ? 1 : 0;
				const d = list.length === 1 ? `M${f(cx)} ${f(cy - rr)}A${f(rr)} ${f(rr)} 0 1 1 ${f(cx - .01)} ${f(cy - rr)}` : `M${f(cx + rr * Math.cos(a0))} ${f(cy + rr * Math.sin(a0))}A${f(rr)} ${f(rr)} 0 ${large} 1 ${f(cx + rr * Math.cos(a1))} ${f(cy + rr * Math.sin(a1))}`;
				out += `<path class="hmi-ch-arc hmi-ch-${i % 6}" d="${d}" stroke-width="${f(t)}"/>`;
				a0 = a1;
			});
			const center = p.center === "none" ? "" : total ? formatValue(total, p.decimals, opts.locale) + (p.unit ? " " + p.unit : "") : "—";
			if (center) out += txt("hmi-ch-center", cx, cy, center, Math.max(10, Math.min(r * .36, r * 1.2 / Math.max(3, center.length) * 1.7)), "middle");
			if (legendW) {
				const size = Math.max(9, Math.min(13, (h - top) / Math.max(4, list.length) * .5));
				list.forEach((s, i) => {
					const y = top + 8 + i * size * 1.7;
					const pct = Math.round(s.value / total * 1e3) / 10;
					const tail = "  " + formatValue(pct, 1, opts.locale) + "%";
					const room = Math.max(3, Math.floor((legendW - size * 1.5 - 6) / (size * .58)) - tail.length);
					const name = s.label.length > room ? s.label.slice(0, Math.max(1, room - 1)) + "…" : s.label;
					out += `<rect class="hmi-ch-dot hmi-ch-${i % 6}" x="${f(w - legendW)}" y="${f(y)}" width="${f(size)}" height="${f(size)}" rx="2"/>` + txt("hmi-ch-label", w - legendW + size * 1.5, y + size * .5, name + tail, size);
				});
			}
			return out + "</g>";
		}
		function renderOee(sym, value, opts) {
			const p = sym.props || {};
			const { w, h } = sym;
			const vals = opts && opts.values || {};
			const sample = opts && opts.editor;
			const pick = (k, s) => {
				const v = num(vals[p[k]]);
				return v === null && sample ? s : v;
			};
			const a = pick("availKey", 92);
			const pf = pick("perfKey", 88);
			const q = pick("qualKey", 97);
			const direct = p.oeeKey ? num(vals[p.oeeKey]) : null;
			const frac = [
				a,
				pf,
				q
			].every((v) => v === null || v <= 1.0001);
			let oee = direct !== null ? direct <= 1.0001 ? direct * 100 : direct : oeeOf(a, pf, q);
			if (oee !== null) oee = Math.round(oee * 10) / 10;
			const goal = num(p.goal) === null ? 85 : num(p.goal);
			const low = num(p.low) === null ? 60 : num(p.low);
			const cls = oee === null ? "hmi-unknown" : oee < low ? "hmi-oee-alarm" : oee < goal ? "hmi-oee-warn" : "hmi-oee-ok";
			const top = p.title ? 26 : 8;
			const r = Math.max(14, Math.min(w * .22, (h - top - 10) / 2));
			const cx = 12 + r;
			const cy = top + (h - top) / 2;
			const t = r * .26;
			const rr = r - t / 2;
			const k = oee === null ? 0 : Math.max(0, Math.min(1, oee / 100));
			const a1 = -Math.PI / 2 + 2 * Math.PI * Math.min(k, .9999);
			let out = `<g class="hmi-chart hmi-oee ${cls}">${card(w, h)}${title(p, w)}`;
			out += `<circle class="hmi-ch-track" cx="${f(cx)}" cy="${f(cy)}" r="${f(rr)}" stroke-width="${f(t)}"/>`;
			if (k > 0) out += `<path class="hmi-oee-arc" d="M${f(cx)} ${f(cy - rr)}A${f(rr)} ${f(rr)} 0 ${k > .5 ? 1 : 0} 1 ${f(cx + rr * Math.cos(a1))} ${f(cy + rr * Math.sin(a1))}" stroke-width="${f(t)}"/>`;
			out += txt("hmi-ch-center", cx, cy - r * .1, oee === null ? "—" : formatValue(oee, 1, opts.locale) + "%", Math.max(10, r * .4), "middle");
			out += txt("hmi-ch-label", cx, cy + r * .32, "OEE", Math.max(8, r * .2), "middle");
			const bx = cx + r + 18;
			const bw = w - bx - 12;
			const rowH = (h - top - 12) / 3;
			const size = Math.max(9, Math.min(13, rowH * .3));
			[
				["Disponibilidade", a],
				["Performance", pf],
				["Qualidade", q]
			].forEach(([label, v], i) => {
				const y = top + 6 + rowH * i;
				const pct = v === null ? null : frac ? v * 100 : v;
				const kk = pct === null ? 0 : Math.max(0, Math.min(1, pct / 100));
				out += txt("hmi-ch-label", bx, y + size, label, size) + txt("hmi-ch-value", bx + bw, y + size, pct === null ? "—" : formatValue(Math.round(pct * 10) / 10, 1, opts.locale) + "%", size, "end") + `<rect class="hmi-ch-track-bar" x="${f(bx)}" y="${f(y + size * 1.5)}" width="${f(Math.max(0, bw))}" height="${f(Math.max(3, rowH * .22))}" rx="2"/><rect class="hmi-ch-bar hmi-ch-${i}" x="${f(bx)}" y="${f(y + size * 1.5)}" width="${f(Math.max(0, bw * kk))}" height="${f(Math.max(3, rowH * .22))}" rx="2"/>`;
			});
			return out + "</g>";
		}
		return {
			barChart: {
				label: "Gráfico de barras",
				group: "Gráficos",
				w: 360,
				h: 200,
				preview: void 0,
				defaults: {
					title: "PRODUÇÃO POR TURNO",
					series: "turno1:Turno 1, turno2:Turno 2, turno3:Turno 3",
					labels: "",
					labelField: "",
					valueField: "",
					unit: "",
					decimals: 0,
					max: "",
					goal: "",
					lowColor: "no"
				},
				fields: [
					TITLE,
					SERIES,
					{
						key: "labels",
						label: "Rótulos (se a chave do símbolo for uma lista)",
						type: "text"
					},
					{
						key: "labelField",
						label: "Lista de objetos: campo do rótulo",
						type: "text"
					},
					{
						key: "valueField",
						label: "Lista de objetos: campo do valor",
						type: "text"
					},
					UNIT,
					DEC,
					{
						key: "max",
						label: "Máximo (vazio = automático)",
						type: "number"
					},
					{
						key: "goal",
						label: "Meta (linha)",
						type: "number"
					},
					{
						key: "lowColor",
						label: "Abaixo da meta",
						type: "select",
						options: [["no", "Mesma cor"], ["warn", "Amarelo"]]
					}
				],
				render: renderBarChart
			},
			donut: {
				label: "Rosca (donut)",
				group: "Gráficos",
				w: 320,
				h: 180,
				preview: void 0,
				defaults: {
					title: "TEMPO DA MÁQUINA",
					series: "produzindo:Produzindo, parada:Parada, setup:Setup",
					labels: "",
					unit: "min",
					decimals: 0,
					legend: "yes",
					center: "total"
				},
				fields: [
					TITLE,
					SERIES,
					{
						key: "labels",
						label: "Rótulos (se a chave do símbolo for uma lista)",
						type: "text"
					},
					UNIT,
					DEC,
					{
						key: "center",
						label: "No meio",
						type: "select",
						options: [["total", "Total"], ["none", "Nada"]]
					},
					{
						key: "legend",
						label: "Legenda",
						type: "select",
						options: [["yes", "Sim"], ["no", "Não"]]
					}
				],
				render: renderDonut
			},
			oee: {
				label: "OEE",
				group: "Gráficos",
				w: 360,
				h: 160,
				preview: void 0,
				defaults: {
					title: "OEE",
					availKey: "disponibilidade",
					perfKey: "performance",
					qualKey: "qualidade",
					oeeKey: "",
					goal: 85,
					low: 60
				},
				fields: [
					TITLE,
					{
						key: "availKey",
						label: "Chave da disponibilidade",
						type: "text"
					},
					{
						key: "perfKey",
						label: "Chave da performance",
						type: "text"
					},
					{
						key: "qualKey",
						label: "Chave da qualidade",
						type: "text"
					},
					{
						key: "oeeKey",
						label: "Chave do OEE pronto (opcional)",
						type: "text"
					},
					{
						key: "goal",
						label: "Meta (%)",
						type: "number"
					},
					{
						key: "low",
						label: "Vermelho abaixo de (%)",
						type: "number"
					}
				],
				render: renderOee
			}
		};
	}
	var CHART_CSS = `
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
${[
		0,
		1,
		2,
		3,
		4,
		5
	].map((i) => `.hmi-root .hmi-ch-${i}.hmi-ch-bar, .hmi-root .hmi-ch-${i}.hmi-ch-dot { fill: var(--hmi-ch${i}); } .hmi-root .hmi-ch-${i}.hmi-ch-arc { stroke: var(--hmi-ch${i}); }`).join("\n")}
.hmi-root .hmi-ch-bar.hmi-ch-low { fill: var(--hmi-warn); }
.hmi-root .hmi-oee-arc { fill: none; stroke: var(--hmi-ch0); }
.hmi-root .hmi-oee-warn .hmi-oee-arc { stroke: var(--hmi-warn); }
.hmi-root .hmi-oee-alarm .hmi-oee-arc { stroke: var(--hmi-alarm); }
`;
	//#endregion
	//#region ui/symbols/production.js
	var COLORS = [
		"ok",
		"alarm",
		"warn",
		"info",
		"low",
		"off",
		"c0",
		"c1",
		"c2",
		"c3",
		"c4",
		"c5"
	];
	var HEX$1 = /^#[0-9a-fA-F]{3,8}$/;
	function parseStates(text) {
		return String(text || "").split(/[,;\n]/).map((t) => t.trim()).filter(Boolean).slice(0, 24).map((t) => {
			const i = t.indexOf("=");
			const value = (i < 0 ? t : t.slice(0, i)).trim();
			let rest = i < 0 ? value : t.slice(i + 1).trim();
			let color = "";
			const j = rest.lastIndexOf(":");
			if (j >= 0) {
				color = rest.slice(j + 1).trim();
				rest = rest.slice(0, j).trim();
			}
			if (!COLORS.includes(color) && !HEX$1.test(color)) color = "off";
			return {
				value,
				text: rest || value,
				color
			};
		}).filter((s) => s.value !== "");
	}
	function stateOf(list, value) {
		if (value === void 0 || value === null || value === "") return null;
		const v = typeof value === "boolean" ? value ? "1" : "0" : String(value);
		return list.find((s) => s.value === v) || list.find((s) => s.value.toLowerCase() === v.toLowerCase()) || list.find((s) => s.value !== "" && isFinite(Number(s.value)) && isFinite(Number(v)) && Number(s.value) === Number(v)) || null;
	}
	function parseColumns(text) {
		return String(text || "").split(/[,;\n]/).map((t) => t.trim()).filter(Boolean).slice(0, 12).map((t) => {
			const [field, label, align, weight] = t.split(":").map((x) => (x || "").trim());
			return {
				field,
				label: label || field,
				align: {
					l: "start",
					c: "middle",
					r: "end",
					d: "end"
				}[String(align).charAt(0).toLowerCase()] || "start",
				weight: Number(weight) > 0 ? Number(weight) : 1
			};
		}).filter((c) => c.field);
	}
	function timeOf(v) {
		if (v === void 0 || v === null || v === "") return null;
		if (v instanceof Date) return isFinite(v.getTime()) ? v.getTime() : null;
		if (typeof v === "number") return isFinite(v) ? Math.abs(v) < 1e11 ? v * 1e3 : v : null;
		const s = String(v).trim();
		if (/^-?\d+(\.\d+)?$/.test(s)) return timeOf(Number(s));
		const t = Date.parse(/^\d{4}-\d\d-\d\d \d/.test(s) ? s.replace(" ", "T") : s);
		return isFinite(t) ? t : null;
	}
	function timelineWindow(p, now) {
		if (p.window === "hours") return {
			start: now - Math.max(1, Math.min(336, Number(p.hours) || 8)) * 36e5,
			end: now
		};
		const start = new Date(now);
		const ds = Math.max(0, Math.min(23, Math.round(Number(p.dayStart) || 0)));
		start.setHours(ds, 0, 0, 0);
		if (start.getTime() > now) start.setDate(start.getDate() - 1);
		const end = new Date(start);
		end.setDate(end.getDate() + 1);
		return {
			start: start.getTime(),
			end: end.getTime()
		};
	}
	function durText(min) {
		const m = Math.max(0, Math.round(min));
		if (m < 60) return m + " min";
		return Math.floor(m / 60) + "h " + String(m % 60).padStart(2, "0");
	}
	function timelinePieces(segs, states, field, win, now) {
		const list = [];
		(Array.isArray(segs) ? segs : []).forEach((sg, i) => {
			if (!sg || typeof sg !== "object") return;
			const a = timeOf(sg.ini !== void 0 ? sg.ini : sg.start);
			let b = timeOf(sg.fim !== void 0 ? sg.fim : sg.end);
			if (a === null) return;
			if (b === null) b = Math.max(now, a);
			const ia = Math.max(a, win.start);
			const ib = Math.min(b, win.end);
			if (ib > ia) list.push({
				a: ia,
				b: ib,
				i,
				value: sg[field]
			});
		});
		const cuts = [...new Set(list.flatMap((s) => [s.a, s.b]))].sort((x, y) => x - y);
		const out = [];
		for (let k = 0; k + 1 < cuts.length; k++) {
			const a = cuts[k];
			const b = cuts[k + 1];
			let top = null;
			for (const s of list) if (s.a <= a && s.b >= b && (!top || s.i > top.i)) top = s;
			if (!top) continue;
			const last = out[out.length - 1];
			if (last && last.b === a && last.value === top.value) {
				last.b = b;
				continue;
			}
			const st = stateOf(states, top.value);
			out.push({
				a,
				b,
				value: top.value,
				text: st ? st.text : String(top.value === void 0 || top.value === null ? "" : top.value),
				color: st ? st.color : "off"
			});
		}
		return out;
	}
	function productionSymbols(H) {
		const { f, escapeXml, onState, formatValue, stateClass, labelBelow, faultMark, faultClass, fillKeys, ON_FIELDS, FAULT_FIELD, PRIORITY_FIELD } = H;
		const LABEL = {
			key: "label",
			label: "Legenda",
			type: "text"
		};
		const TITLE = {
			key: "title",
			label: "Título",
			type: "text"
		};
		const STATES = {
			key: "states",
			label: "Estados (valor=Texto:cor). Cores: ok, alarm, warn, info, low, off, c0..c5 ou #hex",
			type: "text"
		};
		const rect = (cls, x, y, w, h, rx, extra) => `<rect class="${cls}" x="${f(x)}" y="${f(y)}" width="${f(Math.max(0, w))}" height="${f(Math.max(0, h))}"${rx ? ` rx="${f(rx)}"` : ""}${extra || ""}/>`;
		const circle = (cls, cx, cy, r) => `<circle class="${cls}" cx="${f(cx)}" cy="${f(cy)}" r="${f(Math.max(0, r))}"/>`;
		const path = (cls, d) => `<path class="${cls}" d="${d}"/>`;
		const txt = (cls, x, y, t, size, anchor) => `<text class="${cls}" x="${f(x)}" y="${f(y)}" font-size="${f(size)}"${anchor ? ` style="text-anchor:${anchor}"` : ""}>${escapeXml(t)}</text>`;
		const fillOf = (c) => HEX$1.test(c) ? {
			cls: "",
			style: ` style="fill:${c}"`
		} : {
			cls: " hmi-st-" + c,
			style: ""
		};
		const strokeOf = (c) => HEX$1.test(c) ? {
			cls: "",
			style: `stroke:${c};`
		} : {
			cls: " hmi-stb-" + c,
			style: ""
		};
		const fit = (t, n) => {
			const s = String(t);
			return s.length > n ? s.slice(0, Math.max(1, n - 1)) + "…" : s;
		};
		function renderWinder(sym, value, opts) {
			const p = sym.props || {};
			const { w, h } = sym;
			const on = onState(value, p);
			const s = Math.min(w, h);
			const gid = "hmi-wd-" + String(sym.id || "x").replace(/[^\w-]/g, "");
			const tone = ["theme", "machine"].includes(p.tone) ? p.tone : "slitter";
			const metal = tone === "slitter" ? `url(#${gid}-m)` : "";
			const ay = h * .42;
			const cx0 = w * .43;
			const cx1 = w * .71;
			const ch = h * .24;
			const turns = [];
			const step = Math.max(4, (cx1 - cx0) / Math.max(6, Math.round((cx1 - cx0) / 7)));
			for (let x = cx0 + step / 2; x < cx1; x += step) turns.push(`M${f(x)} ${f(ay - ch / 2 + 1)}V${f(ay + ch / 2 - 1)}`);
			const fillM = metal ? ` style="fill:${metal}"` : "";
			const R = (cls, x, y, ww, hh, rx) => rect(cls, x, y, ww, hh, rx, cls.includes("hmi-wd-metal") ? fillM : "");
			const cabX = w * .02;
			const cabW = w * .28;
			const cx = cabX + cabW / 2;
			const hw = w * .19;
			const hx = cx - hw / 2;
			const hy = h * .015;
			const hh = h * .27;
			const ix = s * .045;
			const hmi = R("hmi-wd-dark", cx - w * .012, hy + hh, w * .024, h * .3 - hy - hh) + R("hmi-wd-box", hx, hy, hw, hh, 3) + rect("hmi-wd-screen", hx + hw * .1, hy + hh * .08, hw * .8, hh * .46, 1.5) + circle("hmi-wd-ering", hx + hw * .3, hy + hh * .78, ix * 1.15) + circle("hmi-wd-estop", hx + hw * .3, hy + hh * .78, ix * .78) + circle("hmi-wd-pot", hx + hw * .7, hy + hh * .78, ix * .55) + path("hmi-wd-potmark", `M${f(hx + hw * .7)} ${f(hy + hh * .78)}L${f(hx + hw * .7 + ix * .36)} ${f(hy + hh * .78 - ix * .36)}`) + path("hmi-wd-scale", `M${f(hx + hw * .7 - ix * .72)} ${f(hy + hh * .78 + ix * .55)}A${f(ix * .9)} ${f(ix * .9)} 0 1 1 ${f(hx + hw * .7 + ix * .72)} ${f(hy + hh * .78 + ix * .55)}`);
			const railY = h * .8;
			const sw = w * .07;
			const travel = Math.max(0, cx1 - cx0 - sw);
			const spreader = p.wire === "no" ? "" : R("hmi-wd-dark", w * .34, railY, w * .6, h * .035, 1) + rect("hmi-wd-stop", w * .34, railY - h * .02, w * .012, h * .075) + rect("hmi-wd-stop", w * .928, railY - h * .02, w * .012, h * .075) + `<g class="hmi-wd-spread" style="--wd-travel:${f(travel)}px"><g transform="translate(${f(cx0)},0)">` + path("hmi-wd-wire", `M${f(sw / 2)} ${f(railY - h * .07)}L${f(sw / 2)} ${f(ay + ch / 2)}`) + rect("hmi-wd-carriage", 0, railY - h * .08, sw, h * .09, 2) + circle("hmi-wd-guide", sw / 2, railY - h * .065, Math.max(1.5, s * .014)) + "</g></g>";
			const defs = metal ? `<defs><linearGradient id="${gid}-m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6a737d"/><stop offset="1" stop-color="#4d555e"/></linearGradient><linearGradient id="${gid}-c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d08a4e"/><stop offset=".5" stop-color="#b87333"/><stop offset="1" stop-color="#7c4a20"/></linearGradient></defs>` : "";
			const coilFill = metal ? ` style="fill:url(#${gid}-c)"` : "";
			const body = defs + R("hmi-wd-metal hmi-wd-cab", cabX, h * .3, cabW, h * .66, 2) + path("hmi-wd-seam", `M${f(cabX + cabW * .08)} ${f(h * .36)}H${f(cabX + cabW * .92)}V${f(h * .9)}H${f(cabX + cabW * .08)}Z`) + path("hmi-wd-vent", [
				0,
				1,
				2,
				3
			].map((i) => `M${f(cabX + cabW * .3)} ${f(h * (.74 + i * .035))}H${f(cabX + cabW * .7)}`).join("")) + hmi + R("hmi-wd-metal", w * .32, h * .66, w * .035, h * .3) + R("hmi-wd-metal", w * .9, h * .66, w * .035, h * .3) + R("hmi-wd-metal", w * .3, h * .9, w * .66, h * .05) + R("hmi-wd-dark", w * .3, h * .6, w * .66, h * .06, 1) + R("hmi-wd-metal", w * .865, h * .52, w * .03, h * .08) + R("hmi-wd-metal hmi-wd-tail", w * .84, h * .22, w * .08, h * .32, 2) + R("hmi-wd-dark", w * .92, h * .36, w * .06, h * .07, 1) + rect("hmi-wd-rod", w * .98, h * .385, w * .015, h * .02) + path("hmi-wd-hose", `M${f(w * .95)} ${f(h * .43)}Q${f(w * .96)} ${f(h * .58)} ${f(w * .9)} ${f(h * .58)}`) + R("hmi-wd-dark", w * .3, ay - h * .018, w * .54, h * .036) + R("hmi-wd-dark hmi-wd-chuck", w * .3, ay - h * .08, w * .055, h * .16, 2) + path("hmi-wd-jaw", `M${f(w * .315)} ${f(ay - h * .08)}V${f(ay + h * .08)}M${f(w * .34)} ${f(ay - h * .08)}V${f(ay + h * .08)}`) + rect("hmi-wd-mandrel", w * .355, ay - h * .045, w * .45, h * .09, 2) + `<rect class="hmi-wd-coil" x="${f(cx0)}" y="${f(ay - ch / 2)}" width="${f(cx1 - cx0)}" height="${f(ch)}" rx="3"${coilFill}/><g class="hmi-wd-turns-g${p.dir === "ccw" ? " hmi-ccw" : ""}">${path("hmi-wd-turns", turns.join(""))}</g>` + rect("hmi-wd-flange", cx0 - w * .008, ay - ch / 2 - h * .02, w * .008, ch + h * .04) + rect("hmi-wd-flange", cx1, ay - ch / 2 - h * .02, w * .008, ch + h * .04) + path("hmi-wd-centre", `M${f(w * .805)} ${f(ay - h * .04)}L${f(w * .84)} ${f(ay)}L${f(w * .805)} ${f(ay + h * .04)}Z`) + spreader;
			return `<g class="hmi-eq hmi-winder hmi-tone-${tone} ${stateClass(on)}${faultClass(p, opts)}">${body}${faultMark(p, opts, w)}${labelBelow(p, w, h)}</g>`;
		}
		function renderStateChip(sym, value, opts) {
			const p = sym.props || {};
			const { w, h } = sym;
			const list = parseStates(p.states);
			let st = stateOf(list, value);
			if (!st && opts && opts.editor && (value === void 0 || value === null)) st = list[0] || null;
			const known = value !== void 0 && value !== null && value !== "";
			const text = st ? st.text : known ? p.other ? p.other : String(value) : p.unknown || "—";
			const color = st ? st.color : "off";
			const fl = fillOf(color);
			const sk = strokeOf(color);
			const solid = p.look === "solid";
			const sub = p.sub ? fillKeys(p.sub, opts) : "";
			const size = Math.max(9, Math.min(h * (sub ? .34 : .46), 22));
			const r = Math.min(h * .18, 8);
			const blink = st && p.blink && p.blink !== "no" && (p.blink === "all" || p.blink === color) ? " hmi-blink" : "";
			return `<g class="hmi-statechip${solid ? " hmi-solid" : ""}${known ? "" : " hmi-unknown"}${blink}"><rect class="hmi-sc-box${solid ? fl.cls : sk.cls}" x="1" y="1" width="${f(w - 2)}" height="${f(h - 2)}" rx="${f(Math.min(h / 2, 6))}"${solid ? fl.style : sk.style ? ` style="${sk.style}"` : ""}/>` + (solid ? "" : `<circle class="hmi-sc-dot${fl.cls}" cx="${f(h * .42)}" cy="${f(h / 2)}" r="${f(r)}"${fl.style}/>`) + txt("hmi-sc-text", solid ? w / 2 : h * .42 + r + 8, sub ? h * .36 : h / 2, text, size, solid ? "middle" : "start") + (sub ? txt("hmi-sc-sub", solid ? w / 2 : h * .42 + r + 8, h * .72, sub, Math.max(8, size * .62), solid ? "middle" : "start") : "") + labelBelow(p, w, h) + "</g>";
		}
		const SAMPLE_ROWS = [
			{
				hora: "07:42",
				operador: "Ana",
				espiras: 412,
				camadas: 8
			},
			{
				hora: "07:05",
				operador: "Ana",
				espiras: 410,
				camadas: 8
			},
			{
				hora: "06:21",
				operador: "João",
				espiras: 398,
				camadas: 7
			}
		];
		function cellText(v, col, p, opts) {
			if (v === void 0 || v === null || v === "") return "—";
			if (typeof v === "boolean") return v ? "Sim" : "Não";
			if (typeof v === "number") return formatValue(v, p.decimals, opts.locale);
			return String(v);
		}
		function renderTable(sym, value, opts) {
			const p = sym.props || {};
			const { w, h } = sym;
			let rows = Array.isArray(value) ? value : [];
			let cols = parseColumns(p.columns);
			if (!cols.length && rows.length && rows[0] && typeof rows[0] === "object") cols = Object.keys(Array.isArray(rows[0]) ? rows[0].map((x, i) => i) : rows[0]).slice(0, 8).map((k) => ({
				field: String(k),
				label: String(k),
				align: "start",
				weight: 1
			}));
			if (opts && opts.editor && !rows.length) rows = SAMPLE_ROWS;
			if (!cols.length) cols = [
				{
					field: "hora",
					label: "Hora",
					align: "start",
					weight: 1
				},
				{
					field: "operador",
					label: "Operador",
					align: "start",
					weight: 2
				},
				{
					field: "espiras",
					label: "Espiras",
					align: "end",
					weight: 1
				}
			];
			const states = parseStates(p.states);
			const rowH = Math.max(14, Number(p.rowH) || 26);
			const top = p.title ? 26 : 4;
			const headH = p.header === "no" ? 0 : Math.max(16, rowH * .8);
			const fits = Math.max(0, Math.floor((h - top - headH - 4) / rowH));
			const max = Number(p.rows) > 0 ? Math.min(fits, Number(p.rows)) : fits;
			const shown = rows.slice(0, max);
			const pad = 8;
			const mark = states.length && p.colorField ? Math.min(12, rowH * .4) : 0;
			const total = cols.reduce((a, c) => a + c.weight, 0);
			const xs = [];
			let x = pad + (mark ? mark + 6 : 0);
			const inner = w - x - pad;
			cols.forEach((c) => {
				const cw = inner * c.weight / total;
				xs.push({
					x,
					w: cw
				});
				x += cw;
			});
			const size = Math.max(9, Math.min(15, rowH * .5));
			let out = `<g class="hmi-table">${rect("hmi-kpi-card", .5, .5, w - 1, h - 1, 6)}`;
			if (p.title) out += txt("hmi-ch-title", 10, 16, p.title, 12);
			if (headH) {
				cols.forEach((c, i) => {
					const ax = c.align === "end" ? xs[i].x + xs[i].w - 4 : c.align === "middle" ? xs[i].x + xs[i].w / 2 : xs[i].x;
					out += txt("hmi-tb-head", ax, top + headH / 2, fit(c.label.toUpperCase(), Math.floor(xs[i].w / (size * .62))), Math.max(8, size * .8), c.align);
				});
				out += path("hmi-ch-axis", `M${f(pad)} ${f(top + headH)}H${f(w - pad)}`);
			}
			shown.forEach((row, r) => {
				const y = top + headH + r * rowH;
				if (r % 2 === 1) out += rect("hmi-tb-zebra", 2, y, w - 4, rowH);
				const get = (k) => row && typeof row === "object" ? row[Array.isArray(row) ? Number(k) : k] : k === cols[0].field ? row : void 0;
				const st = mark ? stateOf(states, get(p.colorField)) : null;
				if (mark) {
					const fl = fillOf(st ? st.color : "off");
					out += `<rect class="hmi-tb-mark${fl.cls}" x="${f(pad)}" y="${f(y + (rowH - mark) / 2)}" width="${f(mark)}" height="${f(mark)}" rx="2"${fl.style}/>`;
				}
				cols.forEach((c, i) => {
					let t = cellText(get(c.field), c, p, opts);
					if (st && c.field === p.colorField) t = st.text;
					const ax = c.align === "end" ? xs[i].x + xs[i].w - 4 : c.align === "middle" ? xs[i].x + xs[i].w / 2 : xs[i].x;
					out += txt("hmi-tb-cell" + (st && c.field === p.colorField ? fillOf(st.color).cls : ""), ax, y + rowH / 2, fit(t, Math.max(2, Math.floor(xs[i].w / (size * .56)))), size, c.align);
				});
			});
			if (!shown.length) out += txt("hmi-tb-empty", w / 2, top + headH + Math.min(rowH, (h - top - headH) / 2), p.empty || "Nenhum registro", size, "middle");
			else if (rows.length > shown.length && p.more !== "no") out += txt("hmi-tb-empty", w - pad, h - 6, "+" + (rows.length - shown.length), Math.max(8, size * .75), "end");
			return out + "</g>";
		}
		function sampleSegments(win, now) {
			const out = [];
			const states = [
				"GIRANDO",
				"PARADA",
				"GIRANDO",
				"ALMOCO",
				"GIRANDO",
				"INTERVALO_15MIN",
				"GIRANDO"
			];
			const span = Math.min(now, win.end) - win.start;
			let t = win.start + span * .05;
			states.forEach((e, i) => {
				const len = span * [
					.22,
					.06,
					.18,
					.08,
					.2,
					.03,
					.18
				][i];
				out.push({
					ini: t,
					fim: t + len,
					estado: e
				});
				t += len;
			});
			return out;
		}
		function renderTimeline(sym, value, opts) {
			const p = sym.props || {};
			const { w, h } = sym;
			const now = opts && opts.now || Date.now();
			const win = timelineWindow(p, now);
			const span = win.end - win.start;
			const states = parseStates(p.states);
			const sf = p.stateField || "estado";
			let segs = Array.isArray(value) ? value : [];
			if (opts && opts.editor && !segs.length) segs = sampleSegments(win, now);
			const labelW = p.label ? Math.max(30, Number(p.labelW) || Math.min(110, w * .16)) : 0;
			const legend = p.legend === "no" ? "" : p.legend;
			const top = p.title ? 24 : legend ? 22 : 4;
			const axis = p.axis !== "no";
			const bottom = axis ? 18 : 4;
			const x0 = 6 + labelW;
			const x1 = w - 8;
			const bh = Math.max(4, h - top - bottom);
			const X = (t) => x0 + (Math.max(win.start, Math.min(win.end, t)) - win.start) / span * (x1 - x0);
			const totals = {};
			let out = `<g class="hmi-timeline">`;
			if (p.card !== "no") out += rect("hmi-kpi-card", .5, .5, w - 1, h - 1, 6);
			if (p.title) out += txt("hmi-ch-title", 10, 16, p.title, 12);
			if (labelW) out += txt("hmi-tl-label", 8, top + bh / 2, fit(fillKeys(p.label, opts), Math.floor(labelW / 7.5)), Math.max(9, Math.min(15, bh * .5)), "start");
			out += rect("hmi-tl-track", x0, top, x1 - x0, bh, 2);
			for (const pc of timelinePieces(segs, states, sf, win, now)) {
				const name = pc.text;
				if (pc.b > pc.a) totals[name] = {
					color: pc.color,
					min: (totals[name] && totals[name].min || 0) + (Math.min(pc.b, now) - pc.a) / 6e4
				};
				const fl = fillOf(pc.color);
				const xa = X(pc.a);
				const xb = X(pc.b);
				out += `<rect class="hmi-tl-seg${fl.cls}" x="${f(xa)}" y="${f(top)}" width="${f(Math.max(.8, xb - xa))}" height="${f(bh)}"${fl.style}><title>${escapeXml(name + " · " + durText((pc.b - pc.a) / 6e4))}</title></rect>`;
			}
			if (now > win.start && now < win.end) {
				out += rect("hmi-tl-future", X(now), top, x1 - X(now), bh);
				if (p.nowMark !== "no") out += path("hmi-tl-now", `M${f(X(now))} ${f(top - 3)}V${f(top + bh + 3)}`);
			}
			if (axis) {
				const hours = span / 36e5;
				const every = Math.max(1, Number(p.tick) || (hours <= 8 ? 1 : (x1 - x0) / hours > 40 ? 2 : (x1 - x0) / hours > 18 ? 4 : 6));
				const first = new Date(win.start);
				first.setMinutes(0, 0, 0);
				if (first.getTime() < win.start) first.setHours(first.getHours() + 1);
				for (let t = first.getTime(), i = 0; t <= win.end && i < 400; t += 36e5, i++) {
					const hr = new Date(t).getHours();
					if ((hr - new Date(win.start).getHours() + 48) % every) continue;
					const x = X(t);
					out += path("hmi-tl-tick", `M${f(x)} ${f(top + bh)}V${f(top + bh + 3)}`) + txt("hmi-tl-hour", Math.min(x1 - 8, Math.max(x0 + 8, x)), top + bh + 12, String(hr).padStart(2, "0") + "h", 10, "middle");
				}
			}
			if (legend) {
				const items = legend === "totals" ? Object.entries(totals).map(([n, t]) => ({
					text: n + " " + durText(t.min),
					color: t.color
				})) : states.map((s) => ({
					text: s.text,
					color: s.color
				}));
				let lx = x1;
				for (const it of items.reverse()) {
					const tw = it.text.length * 6.2 + 18;
					if (lx - tw < (p.title ? 10 + p.title.length * 7.5 : x0)) break;
					lx -= tw;
					const fl = fillOf(it.color);
					out += `<rect class="hmi-tl-dot${fl.cls}" x="${f(lx)}" y="${f(top / 2 - 5)}" width="10" height="10" rx="2"${fl.style}/>` + txt("hmi-tl-legend", lx + 14, top / 2, it.text, 11, "start");
				}
			}
			return out + "</g>";
		}
		const WINDOW_FIELDS = [
			{
				key: "window",
				label: "Período",
				type: "select",
				options: [["day", "Dia de produção"], ["hours", "Últimas horas"]],
				refresh: true
			},
			{
				key: "dayStart",
				label: "O dia começa às (hora)",
				type: "number",
				when: (p) => p.window !== "hours"
			},
			{
				key: "hours",
				label: "Quantas horas",
				type: "number",
				when: (p) => p.window === "hours"
			}
		];
		return {
			winder: {
				label: "Bobinadeira",
				group: "Fábrica",
				w: 360,
				h: 200,
				preview: 1,
				defaults: {
					label: "",
					onWhen: "nonzero",
					threshold: 0,
					invert: "no",
					faultKey: "",
					priority: "1",
					tone: "slitter",
					wire: "yes",
					dir: "cw"
				},
				fields: [
					LABEL,
					...ON_FIELDS,
					{
						key: "tone",
						label: "Cores",
						type: "select",
						options: [
							["slitter", "Metal"],
							["machine", "Da máquina (azul e vermelho)"],
							["theme", "Do tema"]
						]
					},
					{
						key: "wire",
						label: "Espalhador do fio (corre de um lado para o outro girando)",
						type: "select",
						options: [["yes", "Sim"], ["no", "Não"]]
					},
					{
						key: "dir",
						label: "Sentido",
						type: "select",
						options: [["cw", "Horário"], ["ccw", "Anti-horário"]]
					},
					FAULT_FIELD,
					PRIORITY_FIELD
				],
				render: renderWinder
			},
			stateChip: {
				label: "Status (vários estados)",
				group: "Estados",
				w: 220,
				h: 40,
				preview: "GIRANDO",
				defaults: {
					states: "GIRANDO=GIRANDO:ok, PARADA=PARADA:alarm, ALMOCO=ALMOÇO:info, INTERVALO_15MIN=15 MIN:warn, SEM_SINAL=SEM SINAL:off",
					other: "",
					unknown: "SEM DADOS",
					sub: "",
					look: "outline",
					blink: "no",
					label: ""
				},
				fields: [
					STATES,
					{
						key: "other",
						label: "Texto para valor fora da lista (vazio = o próprio valor)",
						type: "text"
					},
					{
						key: "unknown",
						label: "Texto sem valor",
						type: "text"
					},
					{
						key: "sub",
						label: "Linha de baixo ({chave} mostra um valor)",
						type: "text"
					},
					{
						key: "look",
						label: "Aparência",
						type: "select",
						options: [["outline", "Contorno com LED"], ["solid", "Fundo colorido"]]
					},
					{
						key: "blink",
						label: "Piscar",
						type: "select",
						options: [
							["no", "Não"],
							["alarm", "Nos estados vermelhos"],
							["warn", "Nos estados amarelos"],
							["all", "Sempre"]
						]
					},
					LABEL
				],
				render: renderStateChip
			},
			table: {
				label: "Tabela (lista)",
				group: "Valores",
				w: 420,
				h: 200,
				preview: void 0,
				defaults: {
					title: "ÚLTIMAS BOBINAS",
					columns: "hora:Hora, operador:Operador::2, espiras:Espiras:r, camadas:Camadas:r",
					rowH: 26,
					rows: "",
					decimals: "",
					header: "yes",
					empty: "Nenhum registro",
					colorField: "",
					states: "",
					more: "yes"
				},
				fields: [
					TITLE,
					{
						key: "columns",
						label: "Colunas (campo:Rótulo:alinhamento l/c/r:largura)",
						type: "text"
					},
					{
						key: "rowH",
						label: "Altura da linha",
						type: "number"
					},
					{
						key: "rows",
						label: "Máximo de linhas (vazio = as que couberem)",
						type: "number"
					},
					{
						key: "decimals",
						label: "Casas decimais",
						type: "number"
					},
					{
						key: "header",
						label: "Cabeçalho",
						type: "select",
						options: [["yes", "Sim"], ["no", "Não"]]
					},
					{
						key: "empty",
						label: "Texto sem linhas",
						type: "text"
					},
					{
						key: "colorField",
						label: "Campo que dá a cor da linha (opcional)",
						type: "text"
					},
					{
						...STATES,
						when: (p) => !!p.colorField
					},
					{
						key: "more",
						label: "Mostrar quantas linhas ficaram de fora",
						type: "select",
						options: [["yes", "Sim"], ["no", "Não"]]
					}
				],
				render: renderTable
			},
			timeline: {
				label: "Linha do tempo de estados",
				group: "Gráficos",
				w: 640,
				h: 70,
				preview: void 0,
				defaults: {
					title: "",
					label: "",
					labelW: "",
					states: "GIRANDO=Girando:ok, PARADA=Parada:alarm, ALMOCO=Almoço:info, INTERVALO_15MIN=15 min:warn, OCIOSA=Sem giro:off",
					stateField: "estado",
					window: "day",
					dayStart: 5,
					hours: 8,
					tick: "",
					axis: "yes",
					legend: "states",
					nowMark: "yes",
					card: "yes"
				},
				fields: [
					TITLE,
					{
						key: "label",
						label: "Nome à esquerda ({chave} mostra um valor)",
						type: "text"
					},
					{
						key: "labelW",
						label: "Largura do nome",
						type: "number"
					},
					STATES,
					{
						key: "stateField",
						label: "Campo do estado em cada trecho",
						type: "text"
					},
					...WINDOW_FIELDS,
					{
						key: "tick",
						label: "Marca a cada (horas, vazio = automático)",
						type: "number"
					},
					{
						key: "axis",
						label: "Horas embaixo",
						type: "select",
						options: [["yes", "Sim"], ["no", "Não"]]
					},
					{
						key: "legend",
						label: "Legenda",
						type: "select",
						options: [
							["states", "Estados"],
							["totals", "Estados com o tempo de cada um"],
							["no", "Não"]
						]
					},
					{
						key: "nowMark",
						label: "Marca de agora",
						type: "select",
						options: [["yes", "Sim"], ["no", "Não"]]
					},
					{
						key: "card",
						label: "Fundo de cartão",
						type: "select",
						options: [["yes", "Sim"], ["no", "Não"]]
					}
				],
				render: renderTimeline
			}
		};
	}
	var PRODUCTION_CSS = `
.hmi-root .hmi-statechip .hmi-sc-box { fill: var(--hmi-tag-bg); stroke: var(--hmi-line); stroke-width: 2; }
.hmi-root .hmi-statechip.hmi-unknown .hmi-sc-box { stroke-dasharray: 5 3; }
.hmi-root .hmi-sc-text { fill: var(--hmi-text); font-weight: 800; letter-spacing: .4px; dominant-baseline: central; }
.hmi-root .hmi-sc-sub { fill: var(--hmi-text-dim); font-weight: 600; dominant-baseline: central; }
.hmi-root .hmi-statechip.hmi-solid .hmi-sc-box { stroke: none; }
.hmi-root .hmi-statechip.hmi-solid .hmi-sc-box.hmi-st-off { fill: var(--hmi-tag-bg); stroke: var(--hmi-line); stroke-width: 1; }
.hmi-root .hmi-statechip.hmi-solid:not(:has(.hmi-st-off)) .hmi-sc-text, .hmi-root .hmi-statechip.hmi-solid:not(:has(.hmi-st-off)) .hmi-sc-sub { fill: #111; }
.hmi-root .hmi-tb-head { fill: var(--hmi-text-dim); font-weight: 700; letter-spacing: .5px; dominant-baseline: central; }
.hmi-root .hmi-tb-cell { fill: var(--hmi-text); dominant-baseline: central; }
.hmi-root .hmi-tb-cell[class*="hmi-st-"] { font-weight: 700; }
.hmi-root .hmi-tb-zebra { fill: var(--hmi-text); fill-opacity: .04; }
.hmi-root .hmi-tb-empty { fill: var(--hmi-text-dim); dominant-baseline: central; }
.hmi-root .hmi-tl-track { fill: var(--hmi-bg); stroke: var(--hmi-line); stroke-width: .8; }
.hmi-root .hmi-tl-future { fill: var(--hmi-bg); opacity: .55; }
.hmi-root .hmi-tl-now { stroke: var(--hmi-text); stroke-width: 1.5; }
.hmi-root .hmi-tl-tick { stroke: var(--hmi-line); stroke-width: 1; }
.hmi-root .hmi-tl-hour, .hmi-root .hmi-tl-legend { fill: var(--hmi-text-dim); dominant-baseline: central; }
.hmi-root .hmi-tl-label { fill: var(--hmi-text); font-weight: 700; dominant-baseline: central; }
.hmi-root .hmi-winder .hmi-wd-metal, .hmi-root .hmi-winder .hmi-wd-box { fill: var(--hmi-equip); stroke: var(--hmi-stroke); stroke-width: 1.2; }
.hmi-root .hmi-winder .hmi-wd-dark, .hmi-root .hmi-winder .hmi-wd-stop { fill: var(--hmi-dark); stroke: var(--hmi-stroke); stroke-width: 1; }
.hmi-root .hmi-winder .hmi-wd-screen { fill: #050607; stroke: #3a4148; stroke-width: .8; }
.hmi-root .hmi-winder .hmi-wd-ering { fill: #f2c200; stroke: #8a6d00; stroke-width: 1; }
.hmi-root .hmi-winder .hmi-wd-estop { fill: #d71920; stroke: #7f0d10; stroke-width: 1; }
.hmi-root .hmi-winder .hmi-wd-pot { fill: #1d2126; stroke: var(--hmi-stroke); stroke-width: 1; }
.hmi-root .hmi-winder .hmi-wd-potmark { fill: none; stroke: #e8edf1; stroke-width: 1.6; stroke-linecap: round; }
.hmi-root .hmi-winder .hmi-wd-scale { fill: none; stroke: var(--hmi-text-dim); stroke-width: 1; stroke-dasharray: 2 2; }
.hmi-root .hmi-winder .hmi-wd-seam { fill: none; stroke: var(--hmi-stroke); stroke-width: .8; opacity: .55; }
.hmi-root .hmi-winder .hmi-wd-vent { fill: none; stroke: var(--hmi-dark); stroke-width: 2; stroke-linecap: round; }
.hmi-root .hmi-winder .hmi-wd-jaw { fill: none; stroke: var(--hmi-stroke); stroke-width: 1; opacity: .7; }
.hmi-root .hmi-winder .hmi-wd-rod { fill: var(--hmi-stroke); }
.hmi-root .hmi-winder .hmi-wd-mandrel { fill: var(--hmi-tag-bg); stroke: var(--hmi-stroke); stroke-width: .8; }
.hmi-root .hmi-winder .hmi-wd-coil { fill: var(--hmi-material); stroke: var(--hmi-stroke); stroke-width: 1; }
.hmi-root .hmi-winder .hmi-wd-flange { fill: var(--hmi-dark); stroke: var(--hmi-stroke); stroke-width: .8; }
.hmi-root .hmi-winder .hmi-wd-turns { fill: none; stroke: var(--hmi-stroke); stroke-width: 1.6; stroke-dasharray: 6 10; opacity: .7; }
.hmi-root .hmi-winder .hmi-wd-centre { fill: var(--hmi-stroke); }
.hmi-root .hmi-winder .hmi-wd-hose { fill: none; stroke: var(--hmi-info); stroke-width: 2; }
.hmi-root .hmi-winder .hmi-wd-carriage { fill: var(--hmi-warn); stroke: var(--hmi-stroke); stroke-width: 1; }
.hmi-root .hmi-winder .hmi-wd-guide { fill: var(--hmi-dark); stroke: var(--hmi-stroke); stroke-width: 1; }
.hmi-root .hmi-winder .hmi-wd-wire { fill: none; stroke: var(--hmi-text); stroke-width: 1.4; stroke-dasharray: 8 4; opacity: .85; }
.hmi-root .hmi-winder.hmi-unknown .hmi-wd-cab { stroke-dasharray: 5 3; }
.hmi-root .hmi-winder.hmi-fault .hmi-wd-cab { stroke: var(--hmi-alarm); stroke-width: 2.5; }
.hmi-root .hmi-winder.hmi-tone-slitter .hmi-wd-metal { stroke: #8a939d; }
.hmi-root .hmi-winder.hmi-tone-slitter .hmi-wd-box { fill: #2a2f36; stroke: #b5bfc8; }
.hmi-root .hmi-winder.hmi-tone-slitter :is(.hmi-wd-dark, .hmi-wd-stop, .hmi-wd-flange) { fill: #3a4148; stroke: #7a838c; }
.hmi-root .hmi-winder.hmi-tone-slitter .hmi-wd-mandrel { fill: #c4d0db; stroke: #8a939d; }
.hmi-root .hmi-winder.hmi-tone-slitter .hmi-wd-coil { stroke: #6e4d2a; }
.hmi-root .hmi-winder.hmi-tone-slitter .hmi-wd-turns { stroke: #f0c79a; }
.hmi-root .hmi-winder.hmi-tone-slitter :is(.hmi-wd-centre, .hmi-wd-rod) { fill: #a5b0ba; }
.hmi-root .hmi-winder.hmi-tone-slitter .hmi-wd-seam { stroke: #a5b0ba; opacity: .35; }
.hmi-root .hmi-winder.hmi-tone-slitter .hmi-wd-vent { stroke: #2f353b; }
.hmi-root .hmi-winder.hmi-tone-slitter .hmi-wd-hose { stroke: #2f80c8; }
.hmi-root .hmi-winder.hmi-tone-slitter .hmi-wd-carriage { fill: #f59e0b; stroke: #8a5a00; }
.hmi-root .hmi-winder.hmi-tone-slitter .hmi-wd-wire { stroke: #e8b27a; }
.hmi-root .hmi-winder.hmi-tone-machine .hmi-wd-metal { fill: #1f5fbf; stroke: #123c7c; }
.hmi-root .hmi-winder.hmi-tone-machine .hmi-wd-tail { fill: #e2411d; stroke: #8f2410; }
.hmi-root .hmi-winder.hmi-tone-machine .hmi-wd-box { fill: #d8d0b0; stroke: #8f886d; }
.hmi-root .hmi-winder.hmi-tone-machine .hmi-wd-chuck { fill: #e2411d; stroke: #8f2410; }
.hmi-root .hmi-winder.hmi-tone-machine :is(.hmi-wd-dark, .hmi-wd-stop, .hmi-wd-flange) { fill: #3b4249; stroke: #1d2126; }
.hmi-root .hmi-winder.hmi-tone-machine .hmi-wd-mandrel { fill: #eef2f5; stroke: #8a939d; }
.hmi-root .hmi-winder.hmi-tone-machine .hmi-wd-coil { fill: #b98a55; stroke: #6e4d2a; }
.hmi-root .hmi-winder.hmi-tone-machine .hmi-wd-turns { stroke: #f3e2c6; }
.hmi-root .hmi-winder.hmi-tone-machine .hmi-wd-hose { stroke: #2f80c8; }
.hmi-root .hmi-winder.hmi-tone-machine .hmi-wd-carriage { fill: #e2411d; stroke: #8f2410; }
.hmi-root .hmi-winder.hmi-tone-machine .hmi-wd-wire { stroke: #d9dee3; }
.hmi-root .hmi-winder.hmi-off .hmi-wd-coil, .hmi-root .hmi-winder.hmi-unknown .hmi-wd-coil { filter: saturate(.55) brightness(.85); }
.hmi-root .hmi-winder .hmi-wd-spread { transform-box: view-box; }
.hmi-root.hmi-theme-classic .hmi-winder.hmi-on .hmi-wd-turns, .hmi-root.hmi-anim-always .hmi-winder.hmi-on .hmi-wd-turns { animation: hmi-belt .45s linear infinite; }
.hmi-root.hmi-theme-classic .hmi-winder.hmi-on .hmi-ccw .hmi-wd-turns, .hmi-root.hmi-anim-always .hmi-winder.hmi-on .hmi-ccw .hmi-wd-turns { animation-direction: reverse; }
.hmi-root.hmi-theme-classic .hmi-winder.hmi-on .hmi-wd-wire, .hmi-root.hmi-anim-always .hmi-winder.hmi-on .hmi-wd-wire { animation: hmi-flow .8s linear infinite; }
.hmi-root.hmi-theme-classic .hmi-winder.hmi-on .hmi-wd-spread, .hmi-root.hmi-anim-always .hmi-winder.hmi-on .hmi-wd-spread { animation: hmi-wd-traverse 2.6s ease-in-out infinite alternate; }
@keyframes hmi-wd-traverse { from { transform: translateX(0); } to { transform: translateX(var(--wd-travel, 0px)); } }
/* state colours last, so they win over the default fill of each part */
${Object.entries({
		ok: "--hmi-ok",
		alarm: "--hmi-alarm",
		warn: "--hmi-warn",
		info: "--hmi-info",
		low: "--hmi-low",
		off: "--hmi-equip",
		c0: "--hmi-ch0",
		c1: "--hmi-ch1",
		c2: "--hmi-ch2",
		c3: "--hmi-ch3",
		c4: "--hmi-ch4",
		c5: "--hmi-ch5"
	}).map(([k, v]) => `.hmi-root :is(.hmi-statechip, .hmi-table, .hmi-timeline) .hmi-st-${k} { fill: var(${v}); } .hmi-root :is(.hmi-statechip, .hmi-table, .hmi-timeline) .hmi-stb-${k} { stroke: var(${v}); }`).join("\n")}
`;
	//#endregion
	//#region ui/symbols/machine.js
	var MACHINE_SHAPES = [
		[
			"gear",
			"Engrenagem",
			120,
			120,
			"",
			"Mecânica"
		],
		[
			"sprocket",
			"Coroa / pinhão de corrente",
			120,
			120,
			"",
			"Mecânica"
		],
		[
			"pulley",
			"Polia",
			120,
			120,
			"",
			"Mecânica"
		],
		[
			"wheel",
			"Roda",
			120,
			120,
			"",
			"Mecânica"
		],
		[
			"beltDrive",
			"Transmissão por correia",
			320,
			120,
			"",
			"Mecânica"
		],
		[
			"chainDrive",
			"Transmissão por corrente",
			320,
			120,
			"",
			"Mecânica"
		],
		[
			"gearbox",
			"Redutor",
			180,
			120,
			"",
			"Mecânica"
		],
		[
			"coupling",
			"Acoplamento",
			200,
			70,
			"",
			"Mecânica"
		],
		[
			"spring",
			"Mola",
			200,
			50,
			"",
			"Mecânica"
		],
		[
			"screw",
			"Fuso",
			320,
			40,
			"",
			"Mecânica"
		],
		[
			"linearGuide",
			"Guia linear com carro",
			320,
			60,
			"",
			"Mecânica"
		],
		[
			"rack",
			"Cremalheira",
			320,
			40,
			"",
			"Mecânica"
		],
		[
			"link",
			"Braço / elo",
			220,
			50,
			"",
			"Mecânica"
		],
		[
			"pivot",
			"Pino / articulação",
			40,
			40,
			"",
			"Mecânica"
		],
		[
			"nozzle",
			"Bico",
			60,
			100,
			"",
			"Mecânica"
		],
		[
			"drum",
			"Tambor / cilindro deitado",
			260,
			100,
			"",
			"Mecânica"
		],
		[
			"cylinder3d",
			"Cilindro em pé",
			120,
			180,
			"",
			"Mecânica"
		],
		[
			"cone",
			"Cone",
			140,
			140,
			"",
			"Mecânica"
		],
		[
			"box3d",
			"Caixa 3D",
			180,
			140,
			"",
			"Mecânica"
		],
		[
			"plateHoles",
			"Chapa com furos",
			200,
			120,
			"",
			"Mecânica"
		],
		[
			"slot",
			"Rasgo / oblongo",
			200,
			70,
			"",
			"Mecânica"
		],
		[
			"mesh",
			"Grade / tela de proteção",
			240,
			160,
			"",
			"Mecânica"
		],
		[
			"door",
			"Porta",
			120,
			200,
			"",
			"Mecânica"
		],
		[
			"window",
			"Visor / janela",
			160,
			110,
			"",
			"Mecânica"
		],
		[
			"ring",
			"Anel",
			140,
			140
		],
		[
			"semicircle",
			"Meio círculo",
			200,
			100
		],
		[
			"quarter",
			"Quarto de círculo",
			140,
			140
		],
		[
			"pentagon",
			"Pentágono",
			140,
			134
		],
		[
			"octagon",
			"Octógono",
			140,
			140
		],
		[
			"star",
			"Estrela",
			140,
			134
		],
		[
			"cross",
			"Cruz",
			140,
			140
		],
		[
			"chevron",
			"Seta larga",
			200,
			100
		]
	];
	var ROUND_SHAPES = [
		"gear",
		"sprocket",
		"pulley",
		"wheel"
	];
	var DRIVE_SHAPES = ["beltDrive", "chainDrive"];
	function machinePath(shape, w, h, H) {
		const { f, poly, box } = H;
		const m = Math.min(w, h);
		const cx = w / 2;
		const cy = h / 2;
		const circle = (cls, x, y, r) => `<circle class="${cls}" cx="${f(x)}" cy="${f(y)}" r="${f(Math.max(0, r))}"/>`;
		const ellipse = (cls, x, y, rx, ry) => `<ellipse class="${cls}" cx="${f(x)}" cy="${f(y)}" rx="${f(Math.max(0, rx))}" ry="${f(Math.max(0, ry))}"/>`;
		const path = (cls, d, extra) => `<path class="${cls}" d="${d}"${extra || ""}/>`;
		const ring = (x, y, r) => `M${f(x + r)} ${f(y)}A${f(r)} ${f(r)} 0 1 0 ${f(x - r)} ${f(y)}A${f(r)} ${f(r)} 0 1 0 ${f(x + r)} ${f(y)}Z`;
		const EO = " fill-rule=\"evenodd\"";
		function teeth(x, y, r, n, depth, round) {
			const r0 = r * (1 - depth);
			let d = "";
			for (let i = 0; i < n; i++) {
				const a = i * 2 * Math.PI / n;
				const s = Math.PI / n;
				const pts = round ? [
					[r0, a - s * .5],
					[r, a - s * .25],
					[r, a + s * .25],
					[r0, a + s * .5],
					[r0, a + s * 1.5]
				] : [
					[r0, a - s * .55],
					[r, a - s * .32],
					[r, a + s * .32],
					[r0, a + s * .55],
					[r0, a + s * 1.45]
				];
				for (const [k, [rr, aa]] of pts.entries()) d += (i === 0 && k === 0 ? "M" : "L") + f(x + rr * Math.cos(aa)) + " " + f(y + rr * Math.sin(aa));
			}
			return d + "Z";
		}
		function gear(x, y, r, round) {
			const n = Math.max(8, Math.min(40, Math.round(r / (round ? 4.5 : 6))));
			return path("hmi-body", teeth(x, y, r, n, round ? .14 : .18, round) + ring(x, y, r * .2), EO) + circle("hmi-detail", x, y, r * .55) + circle("hmi-detail", x, y, r * .32);
		}
		function pulley(x, y, r) {
			return circle("hmi-body", x, y, r) + circle("hmi-detail", x, y, r * .84) + path("hmi-body", ring(x, y, r * .34) + ring(x, y, r * .14), EO) + [
				0,
				1,
				2,
				3
			].map((i) => circle("hmi-detail", x + Math.cos(i * Math.PI / 2 + Math.PI / 4) * r * .58, y + Math.sin(i * Math.PI / 2 + Math.PI / 4) * r * .58, r * .1)).join("");
		}
		function drive(chain) {
			const bt = Math.max(3, h * .06);
			const R1 = h / 2 - bt / 2;
			const R2 = R1 * .6;
			const c1 = R1 + bt / 2;
			const c2 = w - R2 - bt / 2;
			const d = Math.max(1, c2 - c1);
			const a = Math.asin(Math.max(-1, Math.min(1, (R1 - R2) / d)));
			const s = Math.sin(a);
			const c = Math.cos(a);
			const p1t = [c1 + R1 * s, cy - R1 * c];
			const p2t = [c2 + R2 * s, cy - R2 * c];
			const p2b = [c2 + R2 * s, cy + R2 * c];
			const p1b = [c1 + R1 * s, cy + R1 * c];
			const belt = `M${f(p1t[0])} ${f(p1t[1])}L${f(p2t[0])} ${f(p2t[1])}A${f(R2)} ${f(R2)} 0 0 1 ${f(p2b[0])} ${f(p2b[1])}L${f(p1b[0])} ${f(p1b[1])}A${f(R1)} ${f(R1)} 0 1 1 ${f(p1t[0])} ${f(p1t[1])}Z`;
			const turn = (x, body) => `<g transform="translate(${f(x)},${f(cy)})"><g class="hmi-spin"><g transform="translate(${f(-x)},${f(-cy)})">${body}</g></g></g>`;
			const wheels = chain ? turn(c1, gear(c1, cy, R1 - bt * .2, true)) + turn(c2, gear(c2, cy, R2 - bt * .2, true)) : turn(c1, pulley(c1, cy, R1 - bt / 2)) + turn(c2, pulley(c2, cy, R2 - bt / 2));
			const period = 16 / Math.max(1, Math.round(16 / (bt * 1.35)));
			const marks = chain ? "" : path("hmi-belt-marks hmi-move", belt, ` style="stroke-width:${f(Math.max(1, bt * .35))};stroke-dasharray:4 12"`);
			return wheels + path("hmi-strap" + (chain ? " hmi-move" : ""), belt, ` style="stroke-width:${f(bt)}${chain ? `;stroke-dasharray:${f(period * .67)} ${f(period * .33)};stroke-linecap:butt` : ""}"`) + marks;
		}
		switch (shape) {
			case "gear": return gear(cx, cy, m / 2, false);
			case "sprocket": return gear(cx, cy, m / 2, true);
			case "pulley": return pulley(cx, cy, m / 2);
			case "wheel": {
				const r = m / 2;
				let spokes = "";
				for (let i = 0; i < 5; i++) {
					const a = i * 2 * Math.PI / 5 - Math.PI / 2;
					spokes += `M${f(cx + Math.cos(a) * r * .2)} ${f(cy + Math.sin(a) * r * .2)}L${f(cx + Math.cos(a) * r * .7)} ${f(cy + Math.sin(a) * r * .7)}`;
				}
				return path("hmi-body", ring(cx, cy, r) + ring(cx, cy, r * .74), EO) + circle("hmi-detail", cx, cy, r * .7) + path("hmi-detail", spokes, " style=\"stroke-width:3\"") + circle("hmi-body", cx, cy, r * .2);
			}
			case "beltDrive": return drive(false);
			case "chainDrive": return drive(true);
			case "gearbox": {
				const bx = w * .18;
				const bw = w * .64;
				const fins = Array.from({ length: 4 }, (x, i) => `M${f(bx + bw * (.2 + i * .2))} ${f(h * .12)}V${f(h * .88)}`).join("");
				return box(0, h * .3, bx + 2, h * .16) + box(bx + bw - 2, h * .58, w - bx - bw + 2, h * .16) + `<rect class="hmi-body" x="${f(bx)}" y="0" width="${f(bw)}" height="${f(h)}" rx="${f(m * .08)}"/>` + path("hmi-detail", fins) + circle("hmi-detail", bx + bw * .2, h * .38, m * .08) + circle("hmi-detail", bx + bw * .8, h * .66, m * .08);
			}
			case "coupling": {
				const hw = w * .16;
				const bolts = [
					.25,
					.5,
					.75
				].map((k) => circle("hmi-detail", cx, h * k, Math.max(1.5, h * .05))).join("");
				return box(0, h * .38, w, h * .24) + box(cx - hw - 2, h * .08, hw, h * .84) + box(cx + 2, h * .08, hw, h * .84) + box(cx - hw * 1.6, h * .25, hw * .6, h * .5) + box(cx + hw + 2, h * .25, hw * .6, h * .5) + bolts;
			}
			case "spring": {
				const pw = Math.max(4, w * .04);
				const n = Math.max(4, Math.round((w - pw * 2) / Math.max(8, h * .4)));
				const step = (w - pw * 2) / n;
				let d = `M${f(pw)} ${f(cy)}`;
				for (let i = 0; i < n; i++) d += `L${f(pw + step * (i + .25))} ${f(h * .08)}L${f(pw + step * (i + .75))} ${f(h * .92)}`;
				d += `L${f(w - pw)} ${f(cy)}`;
				return path("hmi-strap hmi-coil", d, ` style="stroke-width:${f(Math.max(2, h * .08))}"`) + box(0, 0, pw, h) + box(w - pw, 0, pw, h);
			}
			case "screw": {
				const e = Math.max(6, w * .05);
				const t = h * .36;
				const pitch = Math.max(6, h * .35);
				let d = "";
				for (let x = e + pitch * .5; x < w - e; x += pitch) d += `M${f(x)} ${f(cy - t / 2)}L${f(x + pitch * .5)} ${f(cy + t / 2)}`;
				return box(e, cy - t / 2, w - 2 * e, t) + path("hmi-detail", d) + box(0, h * .12, e, h * .76) + box(w - e, h * .12, e, h * .76);
			}
			case "linearGuide": {
				const rh = h * .38;
				const cw = Math.min(w * .3, h * 2.2);
				const x = (w - cw) / 2;
				return box(0, h - rh, w, rh) + path("hmi-detail", `M0 ${f(h - rh * .5)}H${f(w)}`) + `<rect class="hmi-body" x="${f(x)}" y="0" width="${f(cw)}" height="${f(h - rh * .4)}" rx="3"/>` + [.25, .75].map((k) => circle("hmi-detail", x + cw * k, h * .25, Math.max(1.5, h * .07))).join("");
			}
			case "rack": {
				const bh = h * .55;
				const pitch = Math.max(6, h * .5);
				const pts = [[0, h], [0, h - bh]];
				for (let x = 0; x + pitch <= w + .01; x += pitch) pts.push([x + pitch * .2, h - bh], [x + pitch * .35, 0], [x + pitch * .65, 0], [x + pitch * .8, h - bh]);
				pts.push([w, h - bh], [w, h]);
				return poly(pts);
			}
			case "link": {
				const r = h / 2;
				const bar = `M${f(r)} ${f(cy - h * .25)}H${f(w - r)}V${f(cy + h * .25)}H${f(r)}Z`;
				return path("hmi-body", ring(r, cy, r) + ring(w - r, cy, r), "") + path("hmi-body", bar) + path("hmi-body", ring(r, cy, r * .4) + ring(w - r, cy, r * .4), EO + " style=\"fill:var(--hmi-bg)\"");
			}
			case "pivot": return circle("hmi-body", cx, cy, m / 2) + path("hmi-detail", `M${f(cx - m * .3)} ${f(cy)}H${f(cx + m * .3)}M${f(cx)} ${f(cy - m * .3)}V${f(cy + m * .3)}`);
			case "nozzle": return poly([
				[0, 0],
				[w, 0],
				[w, h * .35],
				[w * .62, h * .85],
				[w * .62, h],
				[w * .38, h],
				[w * .38, h * .85],
				[0, h * .35]
			]) + path("hmi-detail", `M0 ${f(h * .15)}H${f(w)}`);
			case "drum": {
				const e = Math.min(w * .12, h * .25);
				return path("hmi-body", `M${f(e)} 0H${f(w - e)}A${f(e)} ${f(h / 2)} 0 0 1 ${f(w - e)} ${f(h)}H${f(e)}A${f(e)} ${f(h / 2)} 0 0 1 ${f(e)} 0Z`) + ellipse("hmi-detail", w - e, cy, e, h / 2);
			}
			case "cylinder3d": {
				const e = Math.min(h * .12, w * .25);
				return path("hmi-body", `M0 ${f(e)}V${f(h - e)}A${f(w / 2)} ${f(e)} 0 0 0 ${f(w)} ${f(h - e)}V${f(e)}A${f(w / 2)} ${f(e)} 0 0 0 0 ${f(e)}Z`) + ellipse("hmi-body hmi-shade", cx, e, w / 2, e);
			}
			case "cone": {
				const e = Math.min(h * .12, w * .2);
				return path("hmi-body", `M${f(cx)} 0L${f(w)} ${f(h - e)}A${f(w / 2)} ${f(e)} 0 0 1 0 ${f(h - e)}Z`) + path("hmi-detail", `M0 ${f(h - e)}A${f(w / 2)} ${f(e)} 0 0 0 ${f(w)} ${f(h - e)}`);
			}
			case "box3d": {
				const d = Math.min(w, h) * .25;
				return poly([
					[0, d],
					[w - d, d],
					[w - d, h],
					[0, h]
				]) + `<polygon class="hmi-body hmi-shade" points="${f(0)},${f(d)} ${f(d)},0 ${f(w)},0 ${f(w - d)},${f(d)}"/><polygon class="hmi-body hmi-shade2" points="${f(w - d)},${f(d)} ${f(w)},0 ${f(w)},${f(h - d)} ${f(w - d)},${f(h)}"/>`;
			}
			case "plateHoles": {
				const r = Math.max(2, m * .07);
				const k = r * 2.4;
				return path("hmi-body", `M0 0H${f(w)}V${f(h)}H0Z` + ring(k, k, r) + ring(w - k, k, r) + ring(k, h - k, r) + ring(w - k, h - k, r), EO);
			}
			case "slot": {
				const r = h / 2;
				const ri = r * .45;
				return path("hmi-body", `M${f(r)} 0H${f(w - r)}A${f(r)} ${f(r)} 0 0 1 ${f(w - r)} ${f(h)}H${f(r)}A${f(r)} ${f(r)} 0 0 1 ${f(r)} 0ZM${f(r)} ${f(cy - ri)}H${f(w - r)}A${f(ri)} ${f(ri)} 0 0 1 ${f(w - r)} ${f(cy + ri)}H${f(r)}A${f(ri)} ${f(ri)} 0 0 1 ${f(r)} ${f(cy - ri)}Z`, EO);
			}
			case "mesh": {
				const s = Math.max(10, m / 8);
				let d = "";
				for (let x = s; x < w - 2; x += s) d += `M${f(x)} 4V${f(h - 4)}`;
				for (let y = s; y < h - 2; y += s) d += `M4 ${f(y)}H${f(w - 4)}`;
				return `<rect class="hmi-body hmi-hollow" x="0" y="0" width="${f(w)}" height="${f(h)}"/>` + path("hmi-detail hmi-thin", d) + `<rect class="hmi-body hmi-hollow" x="2" y="2" width="${f(w - 4)}" height="${f(h - 4)}" style="stroke-width:4"/>`;
			}
			case "door": {
				const hw = Math.max(4, w * .06);
				return box(0, 0, w, h) + box(-hw * .4, h * .12, hw, h * .1) + box(-hw * .4, h * .78, hw, h * .1) + `<rect class="hmi-detail" x="${f(w * .12)}" y="${f(h * .06)}" width="${f(w * .76)}" height="${f(h * .88)}"/><rect class="hmi-body" x="${f(w * .78)}" y="${f(h * .45)}" width="${f(Math.max(3, w * .06))}" height="${f(h * .12)}" rx="2"/>`;
			}
			case "window": {
				const p = Math.max(5, m * .1);
				return `<rect class="hmi-body" x="0" y="0" width="${f(w)}" height="${f(h)}" rx="${f(p * .6)}"/><rect class="hmi-glass" x="${f(p)}" y="${f(p)}" width="${f(w - 2 * p)}" height="${f(h - 2 * p)}" rx="${f(p * .3)}"/>` + path("hmi-detail hmi-thin", `M${f(p * 2)} ${f(h - p * 2)}L${f(w * .45)} ${f(p * 2)}M${f(w * .3)} ${f(h - p * 2)}L${f(w * .6)} ${f(p * 2)}`);
			}
			case "ring": return path("hmi-body", `M${f(w)} ${f(cy)}A${f(w / 2)} ${f(h / 2)} 0 1 0 0 ${f(cy)}A${f(w / 2)} ${f(h / 2)} 0 1 0 ${f(w)} ${f(cy)}ZM${f(cx + w * .3)} ${f(cy)}A${f(w * .3)} ${f(h * .3)} 0 1 0 ${f(cx - w * .3)} ${f(cy)}A${f(w * .3)} ${f(h * .3)} 0 1 0 ${f(cx + w * .3)} ${f(cy)}Z`, EO);
			case "semicircle": return path("hmi-body", `M0 ${f(h)}A${f(w / 2)} ${f(h)} 0 0 1 ${f(w)} ${f(h)}Z`);
			case "quarter": return path("hmi-body", `M0 ${f(h)}V0A${f(w)} ${f(h)} 0 0 1 ${f(w)} ${f(h)}Z`);
			case "pentagon":
			case "octagon":
			case "star": {
				const n = shape === "octagon" ? 8 : 5;
				const pts = [];
				const k = shape === "star" ? 2 : 1;
				for (let i = 0; i < n * k; i++) {
					const a = -Math.PI / 2 + i * Math.PI * 2 / (n * k) + (shape === "octagon" ? Math.PI / 8 : 0);
					const r = shape === "star" && i % 2 ? .4 : 1;
					pts.push([cx + Math.cos(a) * w / 2 * r, cy + Math.sin(a) * h / 2 * r + (shape === "octagon" ? 0 : h * .05)]);
				}
				return poly(pts);
			}
			case "cross": {
				const t = .32;
				return poly([
					[w * (.5 - t / 2), 0],
					[w * .66, 0],
					[w * .66, h * (.5 - t / 2)],
					[w, h * (.5 - t / 2)],
					[w, h * .66],
					[w * .66, h * .66],
					[w * .66, h],
					[w * (.5 - t / 2), h],
					[w * (.5 - t / 2), h * .66],
					[0, h * .66],
					[0, h * (.5 - t / 2)],
					[w * (.5 - t / 2), h * (.5 - t / 2)]
				]);
			}
			case "chevron": return poly([
				[0, 0],
				[w * .7, 0],
				[w, h / 2],
				[w * .7, h],
				[0, h],
				[w * .3, h / 2]
			]);
			default: return "";
		}
	}
	var MACHINE_CSS = `
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
`;
	//#endregion
	//#region ui/symbols/machine2.js
	var MACHINE2_SHAPES = [
		[
			"pneuCyl",
			"Cilindro pneumático (haste sai com a chave)",
			260,
			70,
			"",
			"Pneumática"
		],
		[
			"linActuator",
			"Atuador linear elétrico",
			300,
			70,
			"",
			"Pneumática"
		],
		[
			"valve52",
			"Válvula 5/2 com solenoide",
			200,
			90,
			"",
			"Pneumática"
		],
		[
			"frl",
			"Unidade de conservação (FRL)",
			200,
			150,
			"",
			"Pneumática"
		],
		[
			"vacuumCup",
			"Ventosa",
			80,
			90,
			"",
			"Pneumática"
		],
		[
			"gripper",
			"Garra (fecha com a chave)",
			120,
			130,
			"",
			"Pneumática"
		],
		[
			"hydUnit",
			"Unidade hidráulica",
			240,
			170,
			"",
			"Pneumática"
		],
		[
			"accumulator",
			"Acumulador",
			70,
			170,
			"",
			"Pneumática"
		],
		[
			"manometer",
			"Manômetro",
			90,
			110,
			"",
			"Pneumática"
		],
		[
			"solenoid",
			"Solenoide / bobina",
			90,
			70,
			"",
			"Pneumática"
		],
		[
			"muffler",
			"Silenciador",
			40,
			90,
			"",
			"Pneumática"
		],
		[
			"photoEye",
			"Sensor fotoelétrico (feixe corta com a chave)",
			280,
			60,
			"",
			"Sensores"
		],
		[
			"proxSensor",
			"Sensor indutivo / capacitivo",
			140,
			40,
			"",
			"Sensores"
		],
		[
			"limitSwitch",
			"Fim de curso",
			90,
			120,
			"",
			"Sensores"
		],
		[
			"encoder",
			"Encoder",
			100,
			100,
			"",
			"Sensores"
		],
		[
			"lightCurtain",
			"Cortina de luz",
			260,
			220,
			"",
			"Sensores"
		],
		[
			"laserScanner",
			"Scanner a laser",
			120,
			90,
			"",
			"Sensores"
		],
		[
			"camera",
			"Câmera de visão",
			130,
			90,
			"",
			"Sensores"
		],
		[
			"barcode",
			"Leitor de código",
			110,
			110,
			"",
			"Sensores"
		],
		[
			"floatSwitch",
			"Chave de nível (boia)",
			60,
			150,
			"",
			"Sensores"
		],
		[
			"thermo",
			"Termopar / PT100",
			40,
			170,
			"",
			"Sensores"
		],
		[
			"estop",
			"Botão de emergência",
			90,
			90,
			"",
			"Sensores"
		],
		[
			"beacon",
			"Sinalizador / sirene",
			70,
			120,
			"",
			"Sensores"
		],
		[
			"safetySwitch",
			"Chave de segurança da porta",
			90,
			110,
			"",
			"Sensores"
		],
		[
			"servo",
			"Servomotor",
			220,
			100,
			"",
			"Manuseio"
		],
		[
			"gearmotor",
			"Motorredutor",
			260,
			130,
			"",
			"Manuseio"
		],
		[
			"rotaryTable",
			"Mesa giratória / indexadora",
			180,
			180,
			"",
			"Manuseio"
		],
		[
			"gantry",
			"Pórtico X/Z (desce com a chave)",
			360,
			260,
			"",
			"Manuseio"
		],
		[
			"scara",
			"Robô SCARA",
			240,
			220,
			"",
			"Manuseio"
		],
		[
			"delta",
			"Robô delta",
			200,
			200,
			"",
			"Manuseio"
		],
		[
			"scissorLift",
			"Mesa elevatória (sobe com a chave)",
			220,
			200,
			"",
			"Manuseio"
		],
		[
			"dancer",
			"Braço dançarino (tensão)",
			240,
			170,
			"",
			"Manuseio"
		],
		[
			"operator",
			"Operador",
			80,
			200,
			"",
			"Manuseio"
		],
		[
			"hmiPanel",
			"Painel IHM / tela",
			160,
			130,
			"",
			"Manuseio"
		],
		[
			"pushStation",
			"Botoeira",
			100,
			170,
			"",
			"Manuseio"
		],
		[
			"screwConveyor",
			"Rosca transportadora",
			380,
			100,
			"",
			"Produção"
		],
		[
			"bucketElevator",
			"Elevador de canecas",
			130,
			340,
			"",
			"Produção"
		],
		[
			"vibFeeder",
			"Alimentador vibratório",
			190,
			170,
			"",
			"Produção"
		],
		[
			"chute",
			"Calha / rampa",
			260,
			120,
			"",
			"Produção"
		],
		[
			"diverter",
			"Desviador de esteira",
			220,
			130,
			"",
			"Produção"
		],
		[
			"extruder",
			"Extrusora",
			440,
			180,
			"",
			"Produção"
		],
		[
			"injection",
			"Injetora (fecha o molde com a chave)",
			460,
			200,
			"",
			"Produção"
		],
		[
			"guillotine",
			"Guilhotina (lâmina desce com a chave)",
			220,
			230,
			"",
			"Produção"
		],
		[
			"saw",
			"Serra circular",
			150,
			150,
			"",
			"Produção"
		],
		[
			"spindle",
			"Cabeçote de usinagem (spindle)",
			120,
			240,
			"",
			"Produção"
		],
		[
			"drill",
			"Furadeira de coluna",
			180,
			280,
			"",
			"Produção"
		],
		[
			"punch",
			"Puncionadeira / prensa C",
			230,
			260,
			"",
			"Produção"
		],
		[
			"filler",
			"Enchedora (bicos)",
			300,
			230,
			"",
			"Produção"
		],
		[
			"capper",
			"Tampadora",
			160,
			240,
			"",
			"Produção"
		],
		[
			"labeler",
			"Rotuladora",
			240,
			180,
			"",
			"Produção"
		],
		[
			"wrapper",
			"Envolvedora de palete (stretch)",
			280,
			280,
			"",
			"Produção"
		],
		[
			"cardboard",
			"Caixa de papelão",
			120,
			100,
			"",
			"Produção"
		],
		[
			"bottle",
			"Garrafa",
			50,
			140,
			"",
			"Produção"
		],
		[
			"can",
			"Lata / balde",
			70,
			100,
			"",
			"Produção"
		],
		[
			"pallet",
			"Palete",
			220,
			60,
			"",
			"Produção"
		]
	];
	var MACHINE2_ROUND = [
		"encoder",
		"rotaryTable",
		"saw"
	];
	var MACHINE2_ANALOG = [
		"pneuCyl",
		"linActuator",
		"gripper",
		"frl",
		"manometer",
		"limitSwitch",
		"floatSwitch",
		"gantry",
		"scara",
		"delta",
		"scissorLift",
		"dancer",
		"diverter",
		"injection",
		"guillotine",
		"drill",
		"punch",
		"filler",
		"capper",
		"wrapper"
	];
	function machine2Path(shape, w, h, H, on, pos) {
		const { f, poly, box } = H;
		const t = typeof pos === "number" ? pos : on ? 1 : 0;
		const L = (a, b) => a + (b - a) * t;
		const m = Math.min(w, h);
		const cx = w / 2;
		const cy = h / 2;
		const circle = (cls, x, y, r) => `<circle class="${cls}" cx="${f(x)}" cy="${f(y)}" r="${f(Math.max(0, r))}"/>`;
		const ellipse = (cls, x, y, rx, ry) => `<ellipse class="${cls}" cx="${f(x)}" cy="${f(y)}" rx="${f(Math.max(0, rx))}" ry="${f(Math.max(0, ry))}"/>`;
		const path = (cls, d, extra) => `<path class="${cls}" d="${d}"${extra || ""}/>`;
		const rrect = (cls, x, y, bw, bh, r) => `<rect class="${cls}" x="${f(x)}" y="${f(y)}" width="${f(Math.max(0, bw))}" height="${f(Math.max(0, bh))}" rx="${f(r || 0)}"/>`;
		const line = (x1, y1, x2, y2) => `M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}`;
		const bar = (x1, y1, x2, y2, t) => {
			const len = Math.hypot(x2 - x1, y2 - y1) || 1;
			const nx = -(y2 - y1) / len * t / 2;
			const ny = (x2 - x1) / len * t / 2;
			return poly([
				[x1 + nx, y1 + ny],
				[x2 + nx, y2 + ny],
				[x2 - nx, y2 - ny],
				[x1 - nx, y1 - ny]
			]);
		};
		const fins = (x, y, bw, bh, n) => path("hmi-detail", Array.from({ length: n }, (v, i) => line(x + bw * (i + 1) / (n + 1), y + bh * .12, x + bw * (i + 1) / (n + 1), y + bh * .88)).join(""));
		const ind = (x, y, r) => circle("hmi-ind", x, y, r);
		switch (shape) {
			case "pneuCyl": {
				const rodEnd = L(w * .8, w * .97);
				const px = L(w * .13, w * .58);
				return box(w * .69, h * .42, rodEnd - w * .69, h * .16) + circle("hmi-body", rodEnd - h * .04, cy, h * .12) + box(w * .07, h * .15, w * .57, h * .7) + box(0, h * .06, w * .08, h * .88) + box(w * .63, h * .06, w * .07, h * .88) + path("hmi-detail", line(px, h * .2, px, h * .8)) + box(w * .13, 0, w * .05, h * .07) + box(w * .53, 0, w * .05, h * .07);
			}
			case "linActuator": {
				const rodEnd = L(w * .82, w * .98);
				return box(w * .7, h * .4, rodEnd - w * .7, h * .2) + box(rodEnd - w * .04, h * .3, w * .04, h * .4) + box(w * .2, h * .24, w * .52, h * .52) + rrect("hmi-body", 0, h * .08, w * .21, h * .84, 4) + fins(0, h * .08, w * .21, h * .84, 4) + path("hmi-detail", line(w * .24, h * .36, w * .68, h * .36));
			}
			case "valve52": {
				const sq = w * .28;
				const y0 = h * .12;
				const sh = h * .6;
				const a = w * .2;
				const b = a + sq;
				const sqA = `<rect class="hmi-body${on ? " hmi-act" : ""}" x="${f(a)}" y="${f(y0)}" width="${f(sq)}" height="${f(sh)}"/>`;
				const sqB = `<rect class="hmi-body${on ? "" : " hmi-act"}" x="${f(b)}" y="${f(y0)}" width="${f(sq)}" height="${f(sh)}"/>`;
				const arr = (x1, y1, x2, y2) => line(x1, y1, x2, y2) + line(x2, y2, x2 - (x2 - x1) * .18 - (y2 - y1) * .12, y2 - (y2 - y1) * .18 + (x2 - x1) * .12) + line(x2, y2, x2 - (x2 - x1) * .18 + (y2 - y1) * .12, y2 - (y2 - y1) * .18 - (x2 - x1) * .12);
				const inA = arr(a + sq * .25, y0 + sh, a + sq * .75, y0) + arr(a + sq * .75, y0 + sh, a + sq * .25, y0);
				const inB = arr(b + sq * .25, y0 + sh, b + sq * .25, y0) + arr(b + sq * .75, y0, b + sq * .75, y0 + sh);
				let spring = `M${f(b + sq)} ${f(y0 + sh / 2)}`;
				for (let i = 0; i < 5; i++) spring += `L${f(b + sq + (i + .5) * w * .045)} ${f(y0 + sh / 2 + (i % 2 ? 1 : -1) * sh * .25)}`;
				spring += `L${f(w)} ${f(y0 + sh / 2)}`;
				return sqA + sqB + path("hmi-detail", inA + inB) + rrect("hmi-body", 0, y0 + sh * .15, a, sh * .7, 2) + path("hmi-detail", line(a * .2, y0 + sh * .85, a * .8, y0 + sh * .15)) + path("hmi-strap hmi-thin", spring) + path("hmi-detail", line(a + sq * .25, y0 + sh, a + sq * .25, h) + line(a + sq * .75, y0 + sh, a + sq * .75, h) + line(a + sq * .5, y0, a + sq * .5, 0));
			}
			case "frl": {
				const u = w / 3;
				const pipe = box(0, h * .14, w, h * .12);
				const unit = (i, kind) => {
					const x = u * i + u * .15;
					const bw = u * .7;
					let out = box(x, h * .06, bw, h * .28);
					if (kind === "reg") return out + box(x + bw * .3, 0, bw * .4, h * .06) + circle("hmi-body", x + bw / 2, h * .58, bw * .38) + circle("hmi-detail", x + bw / 2, h * .58, bw * .28) + path("hmi-strap hmi-thin", line(x + bw / 2, h * .58, x + bw / 2 + Math.cos(Math.PI * (.75 + 1.5 * (typeof pos === "number" ? t : .55))) * bw * .24, h * .58 + Math.sin(Math.PI * (.75 + 1.5 * (typeof pos === "number" ? t : .55))) * bw * .24));
					out += path("hmi-body", `M${f(x + bw * .1)} ${f(h * .34)}H${f(x + bw * .9)}V${f(h * .82)}Q${f(x + bw * .9)} ${f(h)} ${f(x + bw / 2)} ${f(h)}Q${f(x + bw * .1)} ${f(h)} ${f(x + bw * .1)} ${f(h * .82)}Z`);
					out += rrect("hmi-glass", x + bw * .25, h * .42, bw * .5, h * .4, bw * .2);
					if (kind === "lub") out += path("hmi-detail", `M${f(x + bw / 2)} ${f(h * .5)}q${f(-bw * .12)} ${f(h * .1)} 0 ${f(h * .14)}q${f(bw * .12)} ${f(-h * .04)} 0 ${f(-h * .14)}`);
					return out;
				};
				return pipe + unit(0, "filter") + unit(1, "reg") + unit(2, "lub");
			}
			case "vacuumCup": return box(cx - w * .08, 0, w * .16, h * .5) + box(cx - w * .18, h * .12, w * .36, h * .1) + poly([
				[w * .28, h * .5],
				[w * .72, h * .5],
				[w, h * .92],
				[w, h],
				[0, h],
				[0, h * .92]
			]);
			case "gripper": {
				const g = L(w * .2, w * .05);
				return box(w * .08, h * .36, w * .84, h * .1) + rrect("hmi-body", w * .22, 0, w * .56, h * .38, 3) + box(cx - w * .08, h * .04, w * .16, h * .08) + poly([
					[cx - g - w * .16, h * .46],
					[cx - g, h * .46],
					[cx - g, h],
					[cx - g - w * .06, h],
					[cx - g - w * .16, h * .7]
				]) + poly([
					[cx + g, h * .46],
					[cx + g + w * .16, h * .46],
					[cx + g + w * .16, h * .7],
					[cx + g + w * .06, h],
					[cx + g, h]
				]);
			}
			case "hydUnit": return box(0, h * .42, w, h * .58) + rrect("hmi-glass", w * .06, h * .55, w * .06, h * .3, 2) + circle("hmi-body", w * .82, h * .68, m * .1) + circle("hmi-detail", w * .82, h * .68, m * .07) + rrect("hmi-body", w * .06, h * .1, w * .36, h * .3, 4) + fins(w * .06, h * .1, w * .36, h * .3, 5) + box(w * .42, h * .14, w * .08, h * .22) + box(w * .5, h * .18, w * .13, h * .2) + rrect("hmi-body", w * .72, h * .04, w * .11, h * .36, w * .03) + box(w * .63, h * .24, w * .09, h * .05) + ind(w * .36, h * .5, m * .06);
			case "accumulator": return rrect("hmi-body", w * .08, 0, w * .84, h * .86, w * .42) + path("hmi-detail", line(w * .1, h * .45, w * .9, h * .45)) + box(cx - w * .12, h * .86, w * .24, h * .14) + box(cx - w * .06, 0, w * .12, h * .04);
			case "manometer": {
				const r = Math.min(w, h * .82) * .47;
				const gy = r + 1;
				let ticks = "";
				for (let i = 0; i <= 8; i++) {
					const a = Math.PI * (.75 + i * 1.5 / 8);
					ticks += line(cx + Math.cos(a) * r * .72, gy + Math.sin(a) * r * .72, cx + Math.cos(a) * r * .86, gy + Math.sin(a) * r * .86);
				}
				const na = Math.PI * (typeof pos === "number" ? .75 + 1.5 * t : on ? 1.95 : 1.25);
				return box(cx - w * .07, gy + r * .9, w * .14, h - gy - r * .9) + circle("hmi-body", cx, gy, r) + circle("hmi-glass", cx, gy, r * .88) + path("hmi-detail", ticks) + path("hmi-strap", line(cx, gy, cx + Math.cos(na) * r * .7, gy + Math.sin(na) * r * .7), " style=\"stroke-width:2\"") + circle("hmi-body", cx, gy, r * .08);
			}
			case "solenoid": {
				let coil = "";
				for (let i = 0; i < 6; i++) coil += line(w * (.24 + i * .1), h * .22, w * (.29 + i * .1), h * .78);
				return rrect("hmi-body", w * .1, h * .1, w * .8, h * .8, 4) + path("hmi-detail", coil) + box(w * .25, 0, w * .08, h * .12) + box(w * .67, 0, w * .08, h * .12) + ind(w * .8, h * .25, m * .06);
			}
			case "muffler": {
				let dots = "";
				for (let y = h * .4; y < h * .92; y += h * .09) for (const x of [
					.32,
					.5,
					.68
				]) dots += circle("hmi-detail", w * x, y, Math.max(.8, w * .04));
				return box(w * .3, 0, w * .4, h * .22) + path("hmi-detail", line(w * .3, h * .07, w * .7, h * .07) + line(w * .3, h * .14, w * .7, h * .14)) + box(w * .15, h * .22, w * .7, h * .08) + rrect("hmi-body", w * .15, h * .3, w * .7, h * .7, w * .3) + dots + (on ? path("hmi-rays hmi-air", line(0, h * .5, w * .1, h * .55) + line(0, h * .75, w * .1, h * .75) + line(w, h * .5, w * .9, h * .55) + line(w, h * .75, w * .9, h * .75)) : "");
			}
			case "photoEye": {
				const ew = Math.min(w * .14, h * .9);
				return (on ? path("hmi-beam hmi-beam-cut", line(ew, cy, cx, cy)) : path("hmi-beam", line(ew, cy, w - ew, cy))) + rrect("hmi-body", 0, h * .12, ew, h * .76, 3) + circle("hmi-glass", ew * .72, cy, h * .18) + rrect("hmi-body", w - ew, h * .12, ew, h * .76, 3) + circle("hmi-glass", w - ew * .72, cy, h * .18) + ind(ew * .3, h * .25, h * .07) + ind(w - ew * .3, h * .25, h * .07);
			}
			case "proxSensor": {
				let thread = "";
				for (let x = w * .08; x < w * .72; x += Math.max(4, h * .18)) thread += line(x, h * .22, x + h * .08, h * .78);
				return box(0, h * .22, w * .74, h * .56) + path("hmi-detail", thread) + box(w * .18, h * .06, w * .07, h * .88) + box(w * .5, h * .06, w * .07, h * .88) + rrect("hmi-body", w * .74, h * .26, w * .12, h * .48, 2) + box(w * .86, h * .4, w * .14, h * .2) + ind(w * .06, cy, h * .12);
			}
			case "limitSwitch": {
				const px = cx;
				const py = h * .3;
				const a = L(-65, -25) * Math.PI / 180;
				const len = Math.min(h * .3, w * .5);
				const ex = px + Math.cos(a) * len;
				const ey = py + Math.sin(a) * len;
				return bar(px, py, ex, ey, Math.max(3, w * .07)) + circle("hmi-body", ex, ey, Math.max(4, w * .1)) + rrect("hmi-body", w * .08, h * .38, w * .84, h * .62, 4) + box(cx - w * .18, h * .24, w * .36, h * .14) + circle("hmi-body", px, py, Math.max(3, w * .07)) + path("hmi-detail", line(w * .2, h * .55, w * .8, h * .55)) + ind(w * .25, h * .85, m * .06);
			}
			case "encoder": {
				const r = m * .46;
				let slots = "";
				for (let i = 0; i < 16; i++) {
					const an = i * Math.PI / 8;
					slots += line(cx + Math.cos(an) * r * .55, cy + Math.sin(an) * r * .55, cx + Math.cos(an) * r * .78, cy + Math.sin(an) * r * .78);
				}
				return circle("hmi-body", cx, cy, r) + circle("hmi-detail", cx, cy, r * .85) + path("hmi-detail", slots, " style=\"stroke-width:2.5\"") + circle("hmi-body", cx, cy, r * .22) + circle("hmi-detail", cx, cy, r * .08);
			}
			case "lightCurtain": {
				const pw = Math.max(10, w * .07);
				const n = Math.max(4, Math.round(h / 22));
				let beams = "";
				for (let i = 0; i < n; i++) {
					const y = h * .08 + h * .84 * (i + .5) / n;
					beams += line(pw, y, w - pw, y);
				}
				return path(on ? "hmi-beam hmi-beam-cut" : "hmi-beam", beams) + rrect("hmi-body", 0, 0, pw, h, 3) + rrect("hmi-body", w - pw, 0, pw, h, 3) + ind(pw / 2, h * .04, pw * .25) + ind(w - pw / 2, h * .04, pw * .25);
			}
			case "laserScanner": {
				const sx = cx;
				const sy = h * .62;
				const r = Math.min(w * .5, sy);
				const a1 = Math.PI * 1.08;
				const a2 = Math.PI * 1.92;
				const field = `M${f(sx)} ${f(sy)}L${f(sx + Math.cos(a1) * r)} ${f(sy + Math.sin(a1) * r)}A${f(r)} ${f(r)} 0 0 1 ${f(sx + Math.cos(a2) * r)} ${f(sy + Math.sin(a2) * r)}Z`;
				return path(on ? "hmi-field hmi-beam-cut" : "hmi-field", field) + rrect("hmi-body", cx - w * .22, sy - h * .12, w * .44, h * .5 - (sy - h * .62), 4) + path("hmi-body", `M${f(cx - w * .16)} ${f(sy - h * .1)}A${f(w * .16)} ${f(h * .14)} 0 0 1 ${f(cx + w * .16)} ${f(sy - h * .1)}Z`) + rrect("hmi-glass", cx - w * .14, sy - h * .04, w * .28, h * .08, 2) + ind(cx + w * .15, h * .88, m * .04);
			}
			case "camera": return rrect("hmi-body", 0, h * .18, w * .66, h * .58, 4) + box(w * .66, h * .27, w * .18, h * .4) + rrect("hmi-body", w * .84, h * .22, w * .16, h * .5, 2) + ellipse("hmi-glass", w * .92, h * .47, w * .05, h * .17) + box(w * .24, h * .76, w * .18, h * .24) + ind(w * .1, h * .3, m * .05) + path("hmi-detail", line(w * .06, h * .62, w * .5, h * .62));
			case "barcode": {
				let stripes = "";
				const bx = w * .18;
				const bw = w * .64;
				const ws = [
					2,
					1,
					3,
					1,
					1,
					2,
					1,
					3,
					2,
					1,
					1,
					2
				];
				const tot = ws.reduce((s, v) => s + v + 1, 0);
				let x = bx;
				for (const v of ws) {
					stripes += `<rect class="hmi-bars" x="${f(x)}" y="${f(h * .78)}" width="${f(bw * v / tot)}" height="${f(h * .2)}"/>`;
					x += bw * (v + 1) / tot;
				}
				return rrect("hmi-body", w * .1, 0, w * .8, h * .42, 5) + rrect("hmi-glass", w * .2, h * .3, w * .6, h * .08, 2) + ind(w * .8, h * .12, m * .05) + (on ? path("hmi-beam hmi-beam-cut", `M${f(cx)} ${f(h * .38)}L${f(bx)} ${f(h * .78)}H${f(bx + bw)}Z`) : path("hmi-beam", line(cx, h * .38, cx, h * .76))) + stripes;
			}
			case "floatSwitch": {
				const fy = L(h * .62, h * .32);
				return box(cx - w * .3, 0, w * .6, h * .07) + box(cx - w * .05, h * .07, w * .1, h * .8) + box(cx - w * .15, h * .85, w * .3, h * .05) + ellipse("hmi-body", cx, fy, w * .42, h * .1);
			}
			case "thermo": return rrect("hmi-body", 0, 0, w, h * .18, 4) + box(w * .28, h * .18, w * .44, h * .1) + path("hmi-detail", line(w * .28, h * .22, w * .72, h * .22)) + path("hmi-body", `M${f(w * .38)} ${f(h * .28)}H${f(w * .62)}V${f(h * .96)}Q${f(cx)} ${f(h)} ${f(w * .38)} ${f(h * .96)}Z`) + box(w * .1, h * .04, w * .12, h * .06);
			case "estop": {
				const r = m * (on ? .31 : .36);
				return rrect("hmi-body", 0, 0, w, h, m * .12) + rrect("hmi-yel", m * .04, m * .04, w - m * .08, h - m * .08, m * .1) + circle("hmi-detail", cx, cy, m * .42) + circle("hmi-red" + (on ? " hmi-red-on" : ""), cx, cy, r) + circle("hmi-red-ring", cx, cy, r * .7);
			}
			case "beacon": {
				const top = h * .05;
				const bh = h * .72;
				return (on ? path("hmi-rays", line(w * .05, top + bh * .3, w * .18, top + bh * .35) + line(w * .95, top + bh * .3, w * .82, top + bh * .35) + line(cx, 0, cx, top * .6)) : "") + path("hmi-ind hmi-dome", `M${f(w * .2)} ${f(top + bh)}V${f(top + w * .3)}A${f(w * .3)} ${f(w * .3)} 0 0 1 ${f(w * .8)} ${f(top + w * .3)}V${f(top + bh)}Z`) + path("hmi-detail", line(w * .2, top + bh * .55, w * .8, top + bh * .55)) + box(w * .1, top + bh, w * .8, h - top - bh);
			}
			case "safetySwitch": {
				const ty = on ? h * .08 : 0;
				return box(cx - w * .12, ty - h * .02, w * .24, h * .24) + box(cx - w * .3, ty - h * .02, w * .6, h * .08) + rrect("hmi-body", w * .1, h * .3, w * .8, h * .7, 4) + box(cx - w * .16, h * .26, w * .32, h * .06) + ind(w * .25, h * .85, m * .06) + path("hmi-detail", line(w * .2, h * .5, w * .8, h * .5));
			}
			case "servo": return box(0, h * .42, w * .12, h * .16) + box(w * .1, h * .06, w * .07, h * .88) + rrect("hmi-body", w * .17, 0, w * .62, h, 4) + fins(w * .17, 0, w * .62, h, 6) + rrect("hmi-body", w * .79, h * .14, w * .18, h * .72, 6) + box(w * .82, h * .02, w * .1, h * .12) + ind(w * .9, h * .5, m * .05);
			case "gearmotor": return box(0, h * .36, w * .12, h * .13) + rrect("hmi-body", w * .12, 0, w * .33, h * .84, 6) + circle("hmi-detail", w * .285, h * .42, m * .18) + box(w * .1, h * .84, w * .37, h * .16) + rrect("hmi-body", w * .45, h * .16, w * .42, h * .58, 4) + fins(w * .45, h * .16, w * .42, h * .58, 6) + rrect("hmi-body", w * .87, h * .2, w * .11, h * .5, 6) + box(w * .56, h * .02, w * .16, h * .14);
			case "rotaryTable": {
				const r = m * .47;
				let st = "";
				for (let i = 0; i < 6; i++) {
					const an = i * Math.PI / 3 - Math.PI / 2;
					st += rrect("hmi-detail", cx + Math.cos(an) * r * .66 - r * .13, cy + Math.sin(an) * r * .66 - r * .13, r * .26, r * .26, 2);
				}
				return circle("hmi-body", cx, cy, r) + circle("hmi-detail", cx, cy, r * .92) + st + circle("hmi-body", cx, cy, r * .25) + path("hmi-detail", line(cx, cy - r * .25, cx, cy - r * .12));
			}
			case "gantry": {
				const zy = L(h * .42, h * .66);
				const lw = w * .05;
				return box(0, h * .12, lw, h * .88) + box(w - lw, h * .12, lw, h * .88) + box(0, h * .08, w, h * .1) + path("hmi-detail", line(lw, h * .13, w - lw, h * .13)) + box(w * .42, h * .24, w * .05, zy - h * .24) + rrect("hmi-body", w * .38, h * .02, w * .13, h * .24, 3) + box(w * .4, zy, w * .09, h * .05) + box(w * .4, zy + h * .05, w * .025, h * .08) + box(w * .465, zy + h * .05, w * .025, h * .08) + box(0, h * .95, w, h * .05);
			}
			case "scara": {
				const j1 = [w * .2, h * .32];
				const j2 = [w * .62, h * .22];
				const j3 = [w * .88, h * .34];
				return box(w * .06, h * .82, w * .28, h * .18) + box(w * .12, h * .3, w * .16, h * .52) + bar(j1[0], j1[1], j2[0], j2[1], h * .12) + bar(j2[0], j2[1], j3[0], j3[1], h * .1) + circle("hmi-body", j1[0], j1[1], h * .08) + circle("hmi-body", j2[0], j2[1], h * .07) + box(j3[0] - w * .025, j3[1], w * .05, h * L(.36, .5)) + circle("hmi-body", j3[0], j3[1], h * .06);
			}
			case "delta": {
				const ey = L(h * .68, h * .85);
				const ex = cx;
				const tops = [
					[w * .18, h * .16],
					[cx, h * .16],
					[w * .82, h * .16]
				];
				const elb = [
					[w * .08, h * .42],
					[cx, h * .38],
					[w * .92, h * .42]
				];
				let arms = "";
				tops.forEach((t, i) => {
					arms += bar(t[0], t[1], elb[i][0], elb[i][1], w * .04) + bar(elb[i][0], elb[i][1], ex + (i - 1) * w * .06, ey, w * .025);
				});
				return box(w * .05, 0, w * .9, h * .12) + tops.map((t) => rrect("hmi-body", t[0] - w * .06, h * .1, w * .12, h * .1, 2)).join("") + arms + ellipse("hmi-body", ex, ey, w * .11, h * .035) + box(ex - w * .02, ey, w * .04, h * .08);
			}
			case "scissorLift": {
				const py = L(h * .5, h * .04);
				const t = Math.max(4, m * .05);
				return box(0, h * .92, w, h * .08) + bar(w * .12, h * .92, w * .88, py + h * .08, t) + bar(w * .12, py + h * .08, w * .88, h * .92, t) + circle("hmi-body", cx, (h * .92 + py + h * .08) / 2, t * .8) + box(0, py, w, h * .08) + box(w * .86, h * .86, w * .06, h * .06);
			}
			case "dancer": {
				const p = [w * .16, h * .72];
				const ry = L(h * .56, h * .3);
				const roll = [w * .78, ry];
				const r = m * .12;
				const g1 = [w * .08, h * .12];
				const g2 = [w * .94, h * .12];
				return path("hmi-strap hmi-thin", `M0 ${f(g1[1] - r * .7)}L${f(g1[0])} ${f(g1[1] - r * .7)}L${f(roll[0] - r)} ${f(roll[1])}A${f(r)} ${f(r)} 0 0 0 ${f(roll[0] + r)} ${f(roll[1])}L${f(g2[0])} ${f(g2[1] - r * .7)}L${f(w)} ${f(g2[1] - r * .7)}`) + bar(p[0], p[1], roll[0], roll[1], m * .07) + box(w * .42, (p[1] + roll[1]) / 2, w * .06, h * .95 - (p[1] + roll[1]) / 2) + circle("hmi-body", p[0], p[1], m * .06) + circle("hmi-body", roll[0], roll[1], r) + circle("hmi-detail", roll[0], roll[1], r * .3) + circle("hmi-body", g1[0], g1[1], r * .7) + circle("hmi-body", g2[0], g2[1], r * .7) + box(w * .08, h * .92, w * .5, h * .08);
			}
			case "operator": {
				const r = Math.min(w * .22, h * .09);
				return circle("hmi-body" + (on ? " hmi-act" : ""), cx, r + 1, r) + path("hmi-body" + (on ? " hmi-act" : ""), `M${f(cx - w * .38)} ${f(h * .55)}V${f(r * 2 + h * .1)}Q${f(cx - w * .38)} ${f(r * 2 + h * .03)} ${f(cx - w * .2)} ${f(r * 2 + h * .03)}H${f(cx + w * .2)}Q${f(cx + w * .38)} ${f(r * 2 + h * .03)} ${f(cx + w * .38)} ${f(r * 2 + h * .1)}V${f(h * .55)}H${f(cx + w * .26)}V${f(h)}H${f(cx + w * .03)}V${f(h * .62)}H${f(cx - w * .03)}V${f(h)}H${f(cx - w * .26)}V${f(h * .55)}Z`) + path("hmi-detail", line(cx - w * .26, h * .3, cx - w * .26, h * .55) + line(cx + w * .26, h * .3, cx + w * .26, h * .55));
			}
			case "hmiPanel": return rrect("hmi-body", 0, 0, w, h * .85, 5) + rrect(on ? "hmi-glass hmi-screen-on" : "hmi-glass", w * .07, h * .08, w * .86, h * .6, 2) + path("hmi-detail", line(w * .14, h * .5, w * .3, h * .35) + line(w * .3, h * .35, w * .48, h * .45) + line(w * .48, h * .45, w * .7, h * .2)) + [
				.25,
				.42,
				.59,
				.76
			].map((k) => circle("hmi-detail", w * k, h * .76, m * .035)).join("") + box(cx - w * .1, h * .85, w * .2, h * .15);
			case "pushStation": return rrect("hmi-body", 0, h * .06, w, h * .94, 5) + circle("hmi-red", cx, h * .06 + m * .05, m * .14) + circle("hmi-btn-g", cx, h * .45, m * .16) + circle("hmi-detail", cx, h * .45, m * .2) + circle("hmi-btn-r", cx, h * .72, m * .16) + circle("hmi-detail", cx, h * .72, m * .2) + box(cx - w * .08, h * .98 - 2, w * .16, 2);
			case "screwConveyor": {
				const ty = h * .28;
				const th = h * .44;
				const x0 = w * .05;
				const x1 = w * .88;
				const pitch = Math.max(10, th * .8);
				let helix = `M${f(x0)} ${f(ty + th / 2)}`;
				for (let x = x0; x < x1; x += pitch) helix += `Q${f(x + pitch * .25)} ${f(ty + 2)} ${f(x + pitch * .5)} ${f(ty + th / 2)}Q${f(x + pitch * .75)} ${f(ty + th - 2)} ${f(Math.min(x1, x + pitch))} ${f(ty + th / 2)}`;
				return box(x0 + w * .03, 0, w * .12, ty) + box(x1 - w * .12, ty + th, w * .1, h - ty - th) + rrect("hmi-body", x0, ty, x1 - x0, th, th * .3) + path("hmi-strap hmi-move", helix, ` style="stroke-width:${f(Math.max(2, th * .08))};stroke-dasharray:${f(pitch * .35)} ${f(pitch * .15)}"`) + path("hmi-detail", line(x0, ty + th / 2, x1, ty + th / 2)) + box(x1, h * .3, w * .03, h * .4) + rrect("hmi-body", x1 + w * .03, h * .22, w * .09, h * .56, 3);
			}
			case "bucketElevator": {
				const x0 = w * .22;
				const bw = w * .56;
				const top = h * .1;
				const bot = h * .88;
				const lx = x0 + bw * .28;
				const rx = x0 + bw * .72;
				const belt = `M${f(lx)} ${f(bot - bw * .2)}V${f(top + bw * .25)}A${f((rx - lx) / 2)} ${f((rx - lx) / 2)} 0 0 1 ${f(rx)} ${f(top + bw * .25)}V${f(bot - bw * .2)}A${f((rx - lx) / 2)} ${f((rx - lx) / 2)} 0 0 1 ${f(lx)} ${f(bot - bw * .2)}Z`;
				return box(0, bot - h * .12, x0, h * .06) + box(x0 + bw, top + h * .05, w - x0 - bw, h * .06) + path("hmi-body", `M${f(x0)} ${f(bot)}V${f(top + bw / 2)}A${f(bw / 2)} ${f(bw / 2)} 0 0 1 ${f(x0 + bw)} ${f(top + bw / 2)}V${f(bot)}Z`) + box(x0 - w * .04, bot, bw + w * .08, h - bot) + path("hmi-strap hmi-move", belt, ` style="stroke-width:${f(Math.max(3, bw * .12))};stroke-dasharray:${f(bw * .1)} ${f(bw * .18)};stroke-linecap:butt"`) + circle("hmi-detail", x0 + bw / 2, top + bw * .25, (rx - lx) / 2) + circle("hmi-detail", x0 + bw / 2, bot - bw * .2, (rx - lx) / 2);
			}
			case "vibFeeder": {
				const bw = w * .74;
				const bx = (w - bw) / 2 - w * .06;
				return `<g class="hmi-vib">` + path("hmi-body", `M${f(bx)} ${f(h * .18)}L${f(bx + bw * .12)} ${f(h * .58)}H${f(bx + bw * .88)}L${f(bx + bw)} ${f(h * .18)}Z`) + ellipse("hmi-body", bx + bw / 2, h * .18, bw / 2, h * .1) + ellipse("hmi-detail", bx + bw / 2, h * .18, bw * .3, h * .05) + path("hmi-detail", `M${f(bx + bw * .05)} ${f(h * .3)}Q${f(bx + bw / 2)} ${f(h * .4)} ${f(bx + bw * .95)} ${f(h * .3)}M${f(bx + bw * .08)} ${f(h * .44)}Q${f(bx + bw / 2)} ${f(h * .54)} ${f(bx + bw * .92)} ${f(h * .44)}`) + poly([
					[bx + bw * .95, h * .16],
					[w, h * .22],
					[w, h * .3],
					[bx + bw * .92, h * .26]
				]) + "</g>" + box(bx + bw * .2, h * .58, bw * .6, h * .24) + box(bx + bw * .05, h * .82, bw * .9, h * .18);
			}
			case "chute": return poly([
				[0, 0],
				[w * .1, 0],
				[w, h * .72],
				[w, h],
				[w * .92, h],
				[0, h * .22]
			]) + path("hmi-detail", line(w * .03, h * .12, w * .96, h * .84));
			case "diverter": {
				const by = h * .5;
				const bh = h * .24;
				let rollers = "";
				for (let x = w * .04; x < w; x += Math.max(10, bh * .6)) rollers += line(x, by + 2, x, by + bh - 2);
				const pv = [w * .3, by - h * .04];
				const len = w * .5;
				const tip = [L(pv[0] + len, pv[0] + Math.cos(.42) * len), L(pv[1], by + bh)];
				return box(0, by, w, bh) + path("hmi-detail", rollers) + box(w * .55, by + bh, w * .3, h - by - bh) + bar(pv[0], pv[1], tip[0], tip[1], h * .06) + circle("hmi-body", pv[0], pv[1], h * .06) + box(pv[0] - w * .12, pv[1] - h * .1, w * .1, h * .12);
			}
			case "extruder": {
				let bands = "";
				for (let i = 0; i < 5; i++) bands += box(w * (.26 + i * .1), h * .38, w * .06, h * .3);
				return box(0, h * .3, w * .12, h * .46) + fins(0, h * .3, w * .12, h * .46, 3) + rrect("hmi-body", w * .12, h * .26, w * .1, h * .54, 4) + box(w * .22, h * .42, w * .58, h * .22) + bands + poly([
					[w * .26, 0],
					[w * .38, 0],
					[w * .34, h * .3],
					[w * .3, h * .3]
				]) + box(w * .3, h * .3, w * .04, h * .12) + poly([
					[w * .8, h * .34],
					[w * .86, h * .4],
					[w * .86, h * .66],
					[w * .8, h * .72]
				]) + (on ? box(w * .86, h * .48, w * .14, h * .1) : "") + box(w * .04, h * .84, w * .8, h * .06) + box(w * .06, h * .9, w * .04, h * .1) + box(w * .76, h * .9, w * .04, h * .1) + box(w * .22, h * .8, w * .04, h * .04);
			}
			case "injection": {
				const mp = L(w * .15, w * .24);
				let bands = "";
				for (let i = 0; i < 4; i++) bands += box(w * (.46 + i * .07), h * .4, w * .04, h * .18);
				return box(0, h * .76, w, h * .24) + path("hmi-detail", line(w * .03, h * .28, w * .32, h * .28) + line(w * .03, h * .66, w * .32, h * .66)) + box(w * .02, h * .18, w * .04, h * .58) + box(mp, h * .22, w * .04, h * .5) + box(mp + w * .04, h * .32, w * .04, h * .3) + box(w * .28, h * .32, w * .03, h * .3) + box(w * .31, h * .18, w * .05, h * .58) + box(w * .06, h * .44, mp - w * .06, h * .06) + box(w * .36, h * .44, w * .08, h * .1) + box(w * .44, h * .42, w * .32, h * .14) + bands + poly([
					[w * .58, h * .08],
					[w * .68, h * .08],
					[w * .65, h * .42],
					[w * .61, h * .42]
				]) + rrect("hmi-body", w * .76, h * .3, w * .2, h * .4, 4) + fins(w * .76, h * .3, w * .2, h * .4, 4);
			}
			case "guillotine": {
				const by = L(h * .18, h * .46);
				return box(0, 0, w * .1, h * .95) + box(w * .9, 0, w * .1, h * .95) + box(0, 0, w, h * .13) + box(w * .1, by, w * .8, h * .12) + poly([
					[w * .1, by + h * .12],
					[w * .9, by + h * .12],
					[w * .9, by + h * .17],
					[w * .1, by + h * .21]
				]) + box(w * .04, h * .68, w * .92, h * .07) + box(0, h * .95, w * .2, h * .05) + box(w * .8, h * .95, w * .2, h * .05) + box(w * .4, h * .13, w * .2, by - h * .13);
			}
			case "saw": {
				const r = m * .48;
				const n = Math.max(16, Math.round(r / 2.6));
				let d = "";
				for (let i = 0; i < n; i++) {
					const a0 = i * 2 * Math.PI / n;
					const a1 = a0 + Math.PI / n * 1.6;
					d += (i ? "L" : "M") + f(cx + Math.cos(a0) * r * .9) + " " + f(cy + Math.sin(a0) * r * .9) + "L" + f(cx + Math.cos(a1) * r) + " " + f(cy + Math.sin(a1) * r);
				}
				return path("hmi-body", d + "Z") + circle("hmi-detail", cx, cy, r * .6) + circle("hmi-body", cx, cy, r * .2) + circle("hmi-detail", cx, cy, r * .07);
			}
			case "spindle": {
				let flutes = "";
				for (let y = h * .7; y < h * .98; y += Math.max(4, w * .06)) flutes += line(w * .44, y, w * .56, y + w * .05);
				return rrect("hmi-body", w * .08, 0, w * .84, h * .42, 4) + fins(w * .08, 0, w * .84, h * .42, 5) + poly([
					[w * .2, h * .42],
					[w * .8, h * .42],
					[w * .66, h * .55],
					[w * .34, h * .55]
				]) + box(w * .36, h * .55, w * .28, h * .12) + box(w * .44, h * .67, w * .12, h * .33) + path(on ? "hmi-detail hmi-move-v" : "hmi-detail", flutes);
			}
			case "drill": {
				const qy = L(h * .3, h * .4);
				return box(w * .14, h * .05, w * .1, h * .86) + box(0, h * .9, w * .72, h * .1) + rrect("hmi-body", w * .08, 0, w * .72, h * .25, 4) + box(w * .56, h * .25, w * .08, qy - h * .25 + h * .06) + poly([
					[w * .58, qy + h * .06],
					[w * .62, qy + h * .06],
					[w * .61, qy + h * .18],
					[w * .6, qy + h * .2],
					[w * .59, qy + h * .18]
				]) + box(w * .22, h * .62, w * .6, h * .05) + path("hmi-detail", line(w * .8, h * .18, w * .98, h * .3) + line(w * .8, h * .18, w * .96, h * .08)) + circle("hmi-body", w * .8, h * .18, m * .04);
			}
			case "punch": {
				const ry = L(h * .3, h * .42);
				return poly([
					[w * .1, 0],
					[w * .62, 0],
					[w * .62, h * .3],
					[w * .36, h * .3],
					[w * .36, h * .56],
					[w * .62, h * .56],
					[w * .62, h * .82],
					[w * .1, h * .82]
				]) + circle("hmi-body", w * .82, h * .16, m * .17) + circle("hmi-detail", w * .82, h * .16, m * .05) + box(w * .6, h * .12, w * .12, h * .06) + box(w * .42, h * .3 - 2, w * .14, ry - h * .3 + 2) + box(w * .46, ry, w * .06, h * .06) + box(w * .4, h * .5, w * .18, h * .06) + box(0, h * .82, w * .72, h * .18);
			}
			case "filler": {
				const n = 4;
				let out = rrect("hmi-body", w * .08, 0, w * .84, h * .2, 6) + box(w * .04, h * .2, w * .04, h * .62) + box(w * .92, h * .2, w * .04, h * .62);
				for (let i = 0; i < n; i++) {
					const x = w * (.2 + i * .2);
					out += box(x - w * .02, h * .2, w * .04, h * .18) + poly([
						[x - w * .035, h * .38],
						[x + w * .035, h * .38],
						[x + w * .012, h * .46],
						[x - w * .012, h * .46]
					]);
					out += path("hmi-stream", line(x, h * .46, x, h * .56), ` style="stroke-width:${f(Math.max(1.5, w * .01))}"`);
					out += path("hmi-body", `M${f(x - w * .012)} ${f(h * .56)}H${f(x + w * .012)}V${f(h * .6)}Q${f(x + w * .04)} ${f(h * .62)} ${f(x + w * .04)} ${f(h * .66)}V${f(h * .82)}H${f(x - w * .04)}V${f(h * .66)}Q${f(x - w * .04)} ${f(h * .62)} ${f(x - w * .012)} ${f(h * .6)}Z`);
					if (typeof pos === "number" && t > 0) out += `<rect class="hmi-fill" x="${f(x - w * .034)}" y="${f(h * .815 - h * .15 * t)}" width="${f(w * .068)}" height="${f(h * .15 * t)}"/>`;
				}
				return out + box(0, h * .82, w, h * .1) + box(w * .04, h * .92, w * .04, h * .08) + box(w * .92, h * .92, w * .04, h * .08);
			}
			case "capper": {
				const hy = L(h * .26, h * .36);
				return box(w * .08, 0, w * .12, h * .82) + box(w * .08, 0, w * .6, h * .12) + rrect("hmi-body", w * .36, h * .12, w * .3, hy - h * .12 + h * .06, 3) + box(w * .44, hy + h * .06, w * .14, h * .06) + path("hmi-body", `M${f(w * .46)} ${f(h * .5)}H${f(w * .56)}V${f(h * .54)}Q${f(w * .64)} ${f(h * .57)} ${f(w * .64)} ${f(h * .63)}V${f(h * .82)}H${f(w * .38)}V${f(h * .63)}Q${f(w * .38)} ${f(h * .57)} ${f(w * .46)} ${f(h * .54)}Z`) + box(0, h * .82, w, h * .08) + box(w * .05, h * .9, w * .05, h * .1) + box(w * .9, h * .9, w * .05, h * .1);
			}
			case "labeler": return box(w * .04, h * .05, w * .42, h * .6) + circle("hmi-body", w * .17, h * .24, m * .13) + circle("hmi-detail", w * .17, h * .24, m * .04) + circle("hmi-body", w * .33, h * .46, m * .09) + path("hmi-strap hmi-thin", line(w * .17, h * .24 + m * .13, w * .46, h * .58) + line(w * .33, h * .46 - m * .09, w * .46, h * .58)) + poly([
				[w * .46, h * .52],
				[w * .58, h * .58],
				[w * .46, h * .62]
			]) + path("hmi-body", `M${f(w * .66)} ${f(h * .4)}H${f(w * .74)}V${f(h * .46)}Q${f(w * .82)} ${f(h * .5)} ${f(w * .82)} ${f(h * .56)}V${f(h * .82)}H${f(w * .58)}V${f(h * .56)}Q${f(w * .58)} ${f(h * .5)} ${f(w * .66)} ${f(h * .46)}Z`) + rrect(on ? "hmi-label-on" : "hmi-detail", w * .59, h * .6, w * .22, h * .12, 1) + box(0, h * .82, w, h * .08) + box(w * .08, h * .65, w * .08, h * .17);
			case "wrapper": {
				const cy2 = L(h * .6, h * .32);
				return ellipse("hmi-body", w * .38, h * .9, w * .36, h * .07) + box(w * .1, h * .76, w * .56, h * .08) + box(w * .14, h * .3, w * .48, h * .46) + path("hmi-detail", line(w * .14, h * .45, w * .62, h * .45) + line(w * .14, h * .6, w * .62, h * .6) + line(w * .38, h * .3, w * .38, h * .76)) + box(w * .86, 0, w * .08, h * .95) + box(w * .8, h * .94, w * .2, h * .06) + rrect("hmi-body", w * .72, cy2, w * .14, h * .16, 3) + rrect("hmi-body", w * .68, cy2 + h * .02, w * .04, h * .12, 2) + path("hmi-strap hmi-thin", line(w * .68, cy2 + h * .08, w * .62, cy2 + h * .05));
			}
			case "cardboard": return poly([
				[0, h * .25],
				[w * .75, h * .25],
				[w * .75, h],
				[0, h]
			]) + poly([
				[0, h * .25],
				[w * .25, 0],
				[w, 0],
				[w * .75, h * .25]
			]) + poly([
				[w * .75, h * .25],
				[w, 0],
				[w, h * .75],
				[w * .75, h]
			]) + path("hmi-detail", line(w * .375, h * .25, w * .625, 0) + line(w * .3, h * .25, w * .3, h * .55) + line(w * .45, h * .25, w * .45, h * .55));
			case "bottle": return path("hmi-body", `M${f(w * .36)} ${f(h * .06)}H${f(w * .64)}V${f(h * .25)}Q${f(w)} ${f(h * .32)} ${f(w)} ${f(h * .45)}V${f(h)}H0V${f(h * .45)}Q0 ${f(h * .32)} ${f(w * .36)} ${f(h * .25)}Z`) + box(w * .32, 0, w * .36, h * .07) + rrect("hmi-detail", w * .08, h * .55, w * .84, h * .25, 1);
			case "can": return path("hmi-body", `M0 ${f(h * .1)}V${f(h * .9)}A${f(w / 2)} ${f(h * .1)} 0 0 0 ${f(w)} ${f(h * .9)}V${f(h * .1)}Z`) + ellipse("hmi-body", cx, h * .1, w / 2, h * .1) + ellipse("hmi-detail", cx, h * .1, w * .4, h * .07) + path("hmi-detail", `M0 ${f(h * .22)}A${f(w / 2)} ${f(h * .08)} 0 0 0 ${f(w)} ${f(h * .22)}`);
			case "pallet": {
				const tb = h * .22;
				let boards = "";
				const n = Math.max(3, Math.round(w / 40));
				for (let i = 0; i <= n; i++) boards += line(w * i / n, 0, w * i / n, tb);
				return box(0, 0, w, tb) + path("hmi-detail", boards) + [
					0,
					.45,
					.9
				].map((k) => box(w * k * (1 - .1 / .9), tb, w * .1, h * .5)).join("") + box(0, tb + h * .5, w, h - tb - h * .5);
			}
		}
		return null;
	}
	var MACHINE2_CSS = `
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
`;
	//#endregion
	//#region ui/symbols/layout.js
	var FLUID = /* @__PURE__ */ new Set([
		"tag",
		"kpi",
		"text",
		"chip",
		"alarm",
		"button",
		"trend",
		"alarmList",
		"alarmSummary",
		"counter",
		"mode",
		"interlock",
		"barChart",
		"donut",
		"oee",
		"stateChip",
		"table",
		"timeline",
		"setpoint",
		"frame"
	]);
	var BOX_SHAPES = ["rect", "round"];
	var TOL = 4;
	var PAD = 12;
	var GAP = 12;
	var num$1 = (v) => Number(v) || 0;
	var clamp = (v, a, b) => Math.max(a, Math.min(b, v));
	function textWidth(s, size) {
		const p = s.props || {};
		let t = String(p.text || "").replace(/\{[^}]*\}/g, "000000");
		if (s.key) t += (t ? " " : "") + "00000" + (p.unit ? " " + p.unit : "");
		return t.length * size * (p.bold === "yes" ? .6 : .55);
	}
	var textSize = (s) => Math.max(6, num$1((s.props || {}).size) || 16);
	function boxOf(s) {
		let x = num$1(s.x);
		let y = num$1(s.y);
		let w = num$1(s.w);
		let h = num$1(s.h);
		const pts = s.props && Array.isArray(s.props.points) ? s.props.points : null;
		if (pts && pts.length && (s.type === "line" || s.type === "shape")) {
			const xs = pts.map((p) => num$1(p[0]));
			const ys = pts.map((p) => num$1(p[1]));
			x += Math.min(...xs);
			y += Math.min(...ys);
			w = Math.max(...xs) - Math.min(...xs);
			h = Math.max(...ys) - Math.min(...ys);
		} else if (s.type === "text" && !num$1(s.rot)) {
			const tw = Math.min(w, textWidth(s, textSize(s)) + 4);
			const a = (s.props || {}).align;
			if (a === "end") x += w - tw;
			else if (a !== "start") x += (w - tw) / 2;
			w = tw;
		}
		return {
			x,
			y,
			w: Math.max(1, w),
			h: Math.max(1, h)
		};
	}
	var isBox = (s) => s.type === "frame" && BOX_SHAPES.includes((s.props || {}).shape) && !num$1(s.rot);
	var inside = (a, b) => a.x >= b.x - 1 && a.y >= b.y - 1 && a.x + a.w <= b.x + b.w + 1 && a.y + a.h <= b.y + b.h + 1;
	function buildTree(symbols) {
		const nodes = symbols.map((s, i) => ({
			s,
			i,
			box: boxOf(s),
			kids: []
		}));
		const boxes = nodes.filter((n) => isBox(n.s));
		const top = [];
		for (const n of nodes) {
			let parent = null;
			for (const b of boxes) {
				if (b === n) continue;
				const area = b.box.w * b.box.h;
				const own = n.box.w * n.box.h;
				if (area < own || area === own && b.i > n.i) continue;
				if (!inside(n.box, b.box)) continue;
				if (!parent || area < parent.box.w * parent.box.h) parent = b;
			}
			if (parent) parent.kids.push(n);
			else top.push(n);
		}
		return top;
	}
	function cut(nodes, axis) {
		const a = axis === "y" ? "y" : "x";
		const len = axis === "y" ? "h" : "w";
		const list = [...nodes].sort((p, q) => p.box[a] - q.box[a]);
		const groups = [];
		let end = 0;
		for (const n of list) if (!groups.length || n.box[a] > end - TOL) {
			groups.push([n]);
			end = n.box[a] + n.box[len];
		} else {
			groups[groups.length - 1].push(n);
			end = Math.max(end, n.box[a] + n.box[len]);
		}
		return groups;
	}
	var span = (nodes) => {
		const x = Math.min(...nodes.map((n) => n.box.x));
		const y = Math.min(...nodes.map((n) => n.box.y));
		return {
			x,
			y,
			w: Math.max(...nodes.map((n) => n.box.x + n.box.w)) - x,
			h: Math.max(...nodes.map((n) => n.box.y + n.box.h)) - y
		};
	};
	function flat(n, out) {
		out.push(n);
		for (const k of n.kids) flat(k, out);
		return out;
	}
	function rigid(nodes, avail) {
		const b = span(nodes);
		const k = Math.min(1, avail / b.w);
		return {
			w: b.w * k,
			h: b.h * k,
			fluid: false,
			put(ox, oy, out) {
				for (const top of nodes) for (const n of flat(top, [])) out[n.i] = {
					x: ox + (num$1(n.s.x) - b.x) * k,
					y: oy + (num$1(n.s.y) - b.y) * k,
					k
				};
			}
		};
	}
	function leaf(n, avail, stretch) {
		if (avail <= 0) avail = 1;
		const s = n.s;
		if (!FLUID.has(s.type) || num$1(s.rot)) return rigid([n], avail);
		if (s.type === "text") {
			const size = textSize(s);
			const tw = textWidth(s, size) + 4;
			const fs = clamp(avail / tw, .8, 1);
			const lines = Math.min(3, Math.ceil(tw * fs / avail));
			const w = stretch ? avail : Math.min(avail, tw * fs);
			const h = Math.max(n.box.h, lines * size * fs * 1.25 + 4);
			return {
				w,
				h,
				fluid: true,
				put(ox, oy, out) {
					out[n.i] = {
						x: ox,
						y: oy,
						w,
						h,
						size: fs < 1 ? size * fs : 0,
						lines
					};
				}
			};
		}
		const w = stretch ? avail : Math.min(avail, n.box.w);
		return {
			w,
			h: n.box.h,
			fluid: true,
			put(ox, oy, out) {
				out[n.i] = {
					x: ox,
					y: oy,
					w,
					h: n.box.h
				};
			}
		};
	}
	function block(n, avail) {
		if (n.box.w * .8 <= avail) return rigid([n], avail);
		const kids = n.kids;
		const bx = n.box;
		const inner = kids.filter((k) => !edge(k, bx.w));
		const pad = clamp(inner.length ? Math.min(...inner.map((k) => k.box.x - bx.x)) : 0, 0, PAD);
		const top = clamp(Math.min(...kids.map((k) => k.box.y - bx.y)), 0, PAD);
		const bottom = clamp(Math.min(...kids.map((k) => bx.y + bx.h - k.box.y - k.box.h)), 0, PAD);
		const body = group(kids, avail, pad, bx.w, true);
		const h = top + body.h + bottom;
		return {
			w: avail,
			h,
			fluid: true,
			put(ox, oy, out) {
				out[n.i] = {
					x: ox,
					y: oy,
					w: avail,
					h
				};
				body.put(ox, oy + top, out);
			}
		};
	}
	var piece = (n, avail, stretch) => n.kids.length ? block(n, avail) : leaf(n, avail, stretch);
	var edge = (n, fullW) => isBox(n.s) && n.box.w >= fullW * .95;
	function group(nodes, avail, pad, fullW, stretch) {
		if (nodes.length === 1) {
			const n = nodes[0];
			if (edge(n, fullW)) {
				const p = piece(n, avail, stretch);
				return {
					w: p.w,
					h: p.h,
					fluid: p.fluid,
					put: p.put
				};
			}
			const p = piece(n, avail - pad * 2, stretch);
			const x = pad + (p.fluid ? 0 : Math.max(0, avail - pad * 2 - p.w) / 2);
			return {
				w: p.w + pad * 2,
				h: p.h,
				fluid: p.fluid,
				put(ox, oy, out) {
					p.put(ox + x, oy, out);
				}
			};
		}
		const rows = cut(nodes, "y");
		if (rows.length > 1) {
			const parts = rows.map((r) => group(r, avail, pad, fullW, stretch));
			const gaps = rows.map((r, i) => i ? clamp(span(r).y - (span(rows[i - 1]).y + span(rows[i - 1]).h), 4, GAP) : 0);
			const h = parts.reduce((t, p, i) => t + p.h + gaps[i], 0);
			return {
				w: Math.max(...parts.map((p) => p.w)),
				h,
				fluid: parts.some((p) => p.fluid),
				put(ox, oy, out) {
					let y = oy;
					parts.forEach((p, i) => {
						y += gaps[i];
						p.put(ox, y, out);
						y += p.h;
					});
				}
			};
		}
		const cols = cut(nodes, "x");
		if (cols.length > 1) return columns(cols, avail, pad, stretch);
		const p = rigid(nodes, avail - pad * 2);
		const x = pad + Math.max(0, avail - pad * 2 - p.w) / 2;
		return {
			w: p.w + pad * 2,
			h: p.h,
			fluid: false,
			put(ox, oy, out) {
				p.put(ox + x, oy, out);
			}
		};
	}
	function columns(cols, avail, pad, stretch) {
		const inner = avail - pad * 2;
		const natural = cols.map((c) => group(c, inner, 0, Infinity, false));
		const lines = [];
		let line = [];
		let used = 0;
		const least = (p) => p.fluid ? p.w * .75 : p.w;
		natural.forEach((p, i) => {
			if (line.length && used + GAP + least(p) > inner) {
				lines.push(line);
				line = [];
				used = 0;
			}
			used += (line.length ? GAP : 0) + least(p);
			line.push(i);
		});
		if (line.length) lines.push(line);
		const laid = lines.map((idx) => {
			const sum = idx.reduce((t, i) => t + natural[i].w, 0) || 1;
			const free = inner - sum - GAP * (idx.length - 1);
			const grow = (stretch || free < 0) && idx.some((i) => natural[i].fluid);
			const flex = idx.reduce((t, i) => t + (natural[i].fluid ? natural[i].w : 0), 0) || 1;
			const widths = idx.map((i) => grow && natural[i].fluid ? natural[i].w + free * natural[i].w / flex : natural[i].w);
			const parts = idx.map((i, j) => group(cols[i], widths[j], 0, Infinity, stretch));
			const width = widths.reduce((t, w) => t + w, 0) + GAP * (idx.length - 1);
			return {
				parts,
				widths,
				h: Math.max(...parts.map((p) => p.h)),
				x0: grow ? 0 : Math.max(0, inner - width) / 2,
				width
			};
		});
		const h = laid.reduce((t, l) => t + l.h, 0) + GAP * (laid.length - 1);
		return {
			w: Math.max(...laid.map((l) => l.width)) + pad * 2,
			h,
			fluid: natural.some((p) => p.fluid),
			put(ox, oy, out) {
				let y = oy;
				for (const l of laid) {
					let x = ox + pad + l.x0;
					l.parts.forEach((p, j) => {
						p.put(x, y, out);
						x += l.widths[j] + GAP;
					});
					y += l.h + GAP;
				}
			}
		};
	}
	function phoneLayout(symbols, width, viewW) {
		const list = Array.isArray(symbols) ? symbols : [];
		const W = Math.max(120, num$1(width));
		const top = buildTree(list);
		if (!top.length) return {
			symbols: [],
			height: 100
		};
		const fullW = Math.max(num$1(viewW), span(top).x + span(top).w);
		const inner = top.filter((k) => !edge(k, fullW));
		const pad = clamp(inner.length ? Math.min(...inner.map((k) => k.box.x)) : 0, 0, PAD);
		const topPad = clamp(span(top).y, 0, PAD);
		const body = group(top, W, pad, fullW, true);
		const out = [];
		body.put(0, topPad, out);
		return {
			symbols: list.map((s, i) => {
				const o = out[i];
				if (!o) return s;
				const c = {
					...s,
					x: o.x,
					y: o.y
				};
				if (o.w !== void 0) {
					c.w = o.w;
					c.h = o.h;
				}
				if (o.k !== void 0 && o.k < .999) c._k = o.k;
				if (o.lines > 1) c._lines = o.lines;
				if (o.size) c.props = {
					...s.props,
					size: o.size
				};
				return c;
			}),
			height: Math.ceil(topPad + body.h + PAD)
		};
	}
	//#endregion
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
			"Corpo metal",
			240,
			300,
			"metal"
		],
		[
			"rect",
			"Base aço",
			300,
			60,
			"steel"
		],
		[
			"rect",
			"Fosso fundo",
			170,
			140,
			"pitDeep"
		],
		[
			"rect",
			"Piso",
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
			"Viga aço",
			400,
			30,
			"steel",
			"Estruturas"
		],
		[
			"pedestal",
			"Pedestal metal",
			120,
			140,
			"metal",
			"Estruturas"
		],
		...MACHINE_SHAPES,
		...MACHINE2_SHAPES
	];
	var SPIN_SHAPES = [
		...ROUND_SHAPES,
		...MACHINE2_ROUND,
		...DRIVE_SHAPES
	];
	var isMotion = (p) => p.motion === "value" && MACHINE2_ANALOG.includes(p.shape);
	var TONES = [
		["equip", "Equipamento (tema)"],
		["dark", "Escuro (tema)"],
		["pit", "Fosso / vazio (tema)"],
		["outline", "Só contorno"],
		["guard", "Proteção (tracejado)"],
		["metal", "Metal"],
		["metalLight", "Metal, borda clara"],
		["steel", "Aço escuro"],
		["graphite", "Grafite / rolo"],
		["pitDeep", "Fosso fundo"],
		["wall", "Parede"],
		["floor", "Piso"],
		["floorDark", "Piso escuro"],
		["sensorTone", "Cor de sensor"],
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
			preview: 60,
			defaults: {
				shape: "chamfer",
				tone: "equip",
				label: "",
				spin: "cw",
				level: "no",
				min: 0,
				max: 100,
				levelColor: "level",
				showValue: "no",
				unit: "%",
				decimals: 0
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
				},
				{
					key: "spin",
					label: "Girar / correr quando a chave ligar",
					type: "select",
					options: [
						["no", "Não"],
						["cw", "Sentido horário"],
						["ccw", "Anti-horário"]
					],
					when: (p) => SPIN_SHAPES.includes(p.shape)
				},
				{
					key: "reverse",
					label: "Quando a chave ligar a peça",
					type: "select",
					options: [["no", "Avança / desce / fecha"], ["yes", "Recua / sobe / abre"]],
					when: (p) => MACHINE2_ANALOG.includes(p.shape)
				},
				INVERT_FIELD,
				{
					key: "motion",
					label: "A peça se move",
					type: "select",
					options: [["onoff", "Liga/desliga pela chave"], ["value", "Pela posição: valor entre mín. e máx."]],
					when: (p) => MACHINE2_ANALOG.includes(p.shape),
					refresh: true
				},
				{
					key: "darken",
					label: "Escurecer quando a chave ligar",
					type: "select",
					options: [["no", "Não"], ["yes", "Sim"]]
				},
				{
					key: "presence",
					label: "Quando a chave desligar",
					type: "select",
					options: [["show", "Continuar igual"], ["ghost", "Ficar apagado (sem peça / sem produto)"]]
				},
				{
					key: "level",
					label: "Encher pelo valor da chave",
					type: "select",
					options: [
						["no", "Não"],
						["up", "De baixo para cima"],
						["down", "De cima para baixo"],
						["right", "Da esquerda para a direita"],
						["left", "Da direita para a esquerda"]
					],
					refresh: true
				},
				{
					key: "min",
					label: "Vazio / recuado (mín.)",
					type: "number",
					when: (p) => p.level && p.level !== "no" || isMotion(p)
				},
				{
					key: "max",
					label: "Cheio / avançado (máx.)",
					type: "number",
					when: (p) => p.level && p.level !== "no" || isMotion(p)
				},
				{
					key: "levelColor",
					label: "Cor do nível",
					type: "select",
					options: [
						["level", "Do tema (azul)"],
						["ok", "Verde"],
						["warn", "Amarelo"],
						["alarm", "Vermelho"],
						["material", "Material"]
					],
					when: (p) => p.level && p.level !== "no"
				},
				{
					key: "showValue",
					label: "Mostrar o valor",
					type: "select",
					options: [["no", "Não"], ["yes", "Sim"]],
					when: (p) => p.level && p.level !== "no",
					refresh: true
				},
				{
					key: "unit",
					label: "Unidade",
					type: "text",
					when: (p) => p.level && p.level !== "no" && p.showValue === "yes"
				},
				{
					key: "decimals",
					label: "Casas decimais",
					type: "number",
					when: (p) => p.level && p.level !== "no" && p.showValue === "yes"
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
		shape: {
			label: "Forma livre",
			group: "Formas",
			w: 160,
			h: 120,
			preview: 60,
			line: true,
			defaults: {
				tone: "equip",
				label: "",
				smooth: "no",
				points: [
					[40, 0],
					[160, 0],
					[160, 120],
					[0, 120],
					[0, 40]
				],
				level: "no",
				min: 0,
				max: 100,
				levelColor: "level",
				showValue: "no",
				unit: "%",
				decimals: 0
			},
			fields: [
				{
					key: "smooth",
					label: "Cantos",
					type: "select",
					options: [["no", "Retos"], ["yes", "Curvas suaves"]]
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
						["auto", "Como o canvas manda"],
						["always", "Sempre"],
						["never", "Nunca"]
					]
				},
				{
					key: "flowDir",
					label: "Sentido do fluxo",
					type: "select",
					options: [["fwd", "Do primeiro ao último ponto"], ["rev", "Invertido (do último ao primeiro)"]]
				},
				{
					key: "width",
					label: "Espessura da linha (px, vazio = padrão)",
					type: "number"
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
					label: "Subtítulo ({chave} mostra um valor)",
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
					label: "Texto (antes do valor, se tiver chave). {chave} mostra o valor de outra chave",
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
				threshold: 0,
				onDir: "advance"
			},
			fields: [
				{
					key: "label",
					label: "Legenda",
					type: "text"
				},
				{
					key: "onWhen",
					label: "Ativo quando",
					type: "select",
					options: ON_FIELDS[0].options
				},
				ON_FIELDS[1],
				INVERT_FIELD,
				{
					key: "onDir",
					label: "Quando ativo o pistão",
					type: "select",
					options: [["advance", "Avança"], ["retract", "Recua"]]
				}
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
		"Mecânica",
		"Pneumática",
		"Sensores",
		"Manuseio",
		"Produção",
		"Equipamentos",
		"Processo",
		"Fábrica",
		"Elétrica",
		"Linhas",
		"Valores",
		"Gráficos",
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
		const d = num(sc.divisor);
		const factor = (k === null ? 1 : k) / (d === null || d === 0 ? 1 : d);
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
		const out = p.onDir === "retract" ? on === false : on === true;
		const bx = w * .55;
		const rodY = h / 2 - h * .09;
		const rodEnd = out ? w - 8 : w * .66;
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
	function framePath(shape, w, h, on, pos) {
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
			default: return machinePath(shape, w, h, {
				f,
				poly,
				box
			}) || machine2Path(shape, w, h, {
				f,
				poly,
				box
			}, on, pos) || `<rect class="hmi-body" x="0" y="0" width="${f(w)}" height="${f(h)}"/>`;
		}
	}
	function frameLevel(sym, value, opts, body) {
		const p = sym.props || {};
		const dir = [
			"up",
			"down",
			"right",
			"left"
		].includes(p.level) ? p.level : null;
		if (!dir) return "";
		const w = sym.w;
		const h = sym.h;
		const v = num(value);
		let min = num(p.min);
		let max = num(p.max);
		if (min === null) min = 0;
		if (max === null || max <= min) max = min + 100;
		const k = v === null ? 0 : Math.max(0, Math.min(1, (v - min) / (max - min)));
		const id = "hmi-lvl-" + String(sym.id).replace(/[^\w-]/g, "");
		const r = dir === "up" ? [
			0,
			h * (1 - k),
			w,
			h * k
		] : dir === "down" ? [
			0,
			0,
			w,
			h * k
		] : dir === "right" ? [
			0,
			0,
			w * k,
			h
		] : [
			w * (1 - k),
			0,
			w * k,
			h
		];
		const color = [
			"ok",
			"warn",
			"alarm",
			"material"
		].includes(p.levelColor) ? p.levelColor : "level";
		let out = k > 0 ? `<clipPath id="${id}"><rect x="${f(r[0])}" y="${f(r[1])}" width="${f(r[2])}" height="${f(r[3])}"/></clipPath><g class="hmi-shape-level hmi-lc-${color}" clip-path="url(#${id})">${body.replace(/hmi-body|hmi-detail/g, "hmi-level")}</g>` : "";
		if (p.showValue === "yes") {
			const text = v === null ? "—" : formatValue(v, p.decimals, opts && opts.locale) + (p.unit ? " " + p.unit : "");
			out += `<text class="hmi-shape-value" x="${f(w / 2)}" y="${f(h / 2)}" font-size="${f(Math.max(10, Math.min(18, w * .14, h * .3)))}">${escapeXml(text)}</text>`;
		}
		return out;
	}
	function shapePath(sym) {
		const pts = linePoints(sym);
		if (pts.length < 3) return "";
		let d;
		if ((sym.props || {}).smooth === "yes") {
			const n = pts.length;
			const P = (i) => pts[(i + n) % n];
			d = "M" + f(P(0)[0]) + " " + f(P(0)[1]);
			for (let i = 0; i < n; i++) {
				const p0 = P(i - 1);
				const p1 = P(i);
				const p2 = P(i + 1);
				const p3 = P(i + 2);
				d += "C" + f(p1[0] + (p2[0] - p0[0]) / 6) + " " + f(p1[1] + (p2[1] - p0[1]) / 6) + " " + f(p2[0] - (p3[0] - p1[0]) / 6) + " " + f(p2[1] - (p3[1] - p1[1]) / 6) + " " + f(p2[0]) + " " + f(p2[1]);
			}
			d += "Z";
		} else d = "M" + pts.map((pt) => f(pt[0]) + " " + f(pt[1])).join("L") + "Z";
		return `<path class="hmi-body" d="${d}"/><path class="hmi-hit" d="${d}"/>`;
	}
	function renderFrame(sym, value, opts) {
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
		const free = sym.type === "shape";
		const on = onState(value, p);
		let pos = null;
		if (!free && isMotion(p)) {
			const v = num(value);
			let min = num(p.min);
			let max = num(p.max);
			if (min === null) min = 0;
			if (max === null || max <= min) max = min + 100;
			if (v !== null) pos = Math.max(0, Math.min(1, (v - min) / (max - min)));
		}
		const back = p.reverse === "yes" && MACHINE2_ANALOG.includes(p.shape);
		const moved = back && on !== null ? !on : on;
		if (back && pos !== null) pos = 1 - pos;
		let body = free ? shapePath(sym) : framePath(p.shape, sym.w, sym.h, moved, pos);
		const level = frameLevel(sym, value, opts, body);
		let turning = "";
		if (!free && DRIVE_SHAPES.includes(p.shape) && (p.spin === "cw" || p.spin === "ccw")) {
			if (on === true) turning = " hmi-turning" + (p.spin === "ccw" ? " hmi-ccw" : "");
		} else if (!free && SPIN_SHAPES.includes(p.shape) && (p.spin === "cw" || p.spin === "ccw")) {
			const cx = f(sym.w / 2);
			const cy = f(sym.h / 2);
			body = `<g transform="translate(${cx},${cy})"><g class="hmi-spin"><g transform="translate(-${cx},-${cy})">${body}</g></g></g>`;
			if (on === true) turning = " hmi-turning" + (p.spin === "ccw" ? " hmi-ccw" : "");
		}
		const own = on === true ? p.colorOn : p.colorOff;
		if (HEX.test(own)) style = (style ? style.slice(0, -1) + ";" : " style=\"") + `--hmi-own:${own}"`;
		return `<g class="hmi-frame${free ? " hmi-shape" : ""} hmi-tone-${fixed ? "fixed" : tone}${turning}${on === true ? " hmi-on" : ""}${p.darken === "yes" ? " hmi-darken" : ""}${p.presence === "ghost" && on === false ? " hmi-ghost" : ""}${HEX.test(own) ? " hmi-own" : ""}"${style}>${defs}${body}${level}${label}</g>`;
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
		const width = num(p.width);
		const wd = width !== null && width > 0 ? Math.min(80, width) : null;
		const own = on === true ? p.colorOn : p.colorOff;
		const pathStyle = (wd ? `stroke-width:${f(wd)};` : "") + (HEX.test(own) ? `stroke:${own};` : "");
		const flowStyle = wd ? ` style="stroke-width:${f(Math.max(1.6, wd * .25))}"` : "";
		const hitStyle = wd && wd > 8 ? ` style="stroke-width:${f(wd + 8)}"` : "";
		return `<g class="hmi-line hmi-ls-${style} ${stateClass(on)} hmi-flow-${flow}${p.flowDir === "rev" ? " hmi-flow-rev" : ""}"><path class="hmi-hit" d="${d}"${hitStyle}/><path class="hmi-path" d="${d}"${pathStyle ? ` style="${pathStyle}"` : ""}/><path class="hmi-flowpath" d="${d}"${flowStyle}/></g>`;
	}
	function renderKpi(sym, value, opts) {
		const p = sym.props || {};
		const w = sym.w;
		const h = sym.h;
		const text = formatValue(value, p.decimals, opts.locale) + (p.unit ? " " + p.unit : "");
		const big = f(Math.max(12, Math.min(h * .3, (w - 30) / Math.max(4, text.length) * 1.7)));
		return `<g class="hmi-kpi ${value === void 0 || value === null ? "hmi-unknown" : "hmi-normal"}"><rect class="hmi-kpi-card" x="0.5" y="0.5" width="${f(w - 1)}" height="${f(h - 1)}" rx="8"/><text class="hmi-kpi-title" x="${f(w * .066)}" y="${f(h * .23)}" font-size="${f(Math.max(9, h * .1))}">${escapeXml(p.title || sym.key || "")}</text><text class="hmi-kpi-value" x="${f(w * .066)}" y="${f(h * .6)}" font-size="${big}">${escapeXml(text)}</text>` + (p.subtitle ? `<text class="hmi-kpi-sub" x="${f(w * .066)}" y="${f(h * .84)}" font-size="${f(Math.max(9, h * .1))}">${escapeXml(fillKeys(p.subtitle, opts))}</text>` : "") + "</g>";
	}
	function fillKeys(str, opts) {
		const o = opts || {};
		return String(str || "").replace(/\{([^{}:]+)(?::(\d+|t))?\}/g, (m, k, d) => {
			const v = o.values ? o.values[k.trim()] : void 0;
			if ((v === void 0 || v === null) && o.editor) return m;
			if (d === "t") return v === void 0 || v === null || v === "" ? "—" : String(v);
			return formatValue(v, d === void 0 ? "" : d, o.locale);
		});
	}
	function textLines(text, sym, size, bold, x) {
		const n = Math.min(3, Number(sym._lines) || 1);
		if (n < 2) return escapeXml(text);
		const per = Math.max(4, Math.floor(sym.w / (size * (bold ? .6 : .55))));
		const lines = [];
		let cur = "";
		for (const word of String(text).split(" ")) if (cur && (cur + " " + word).length > per && lines.length < n - 1) {
			lines.push(cur);
			cur = word;
		} else cur = cur ? cur + " " + word : word;
		lines.push(cur);
		const lh = size * 1.2;
		return lines.map((l, i) => `<tspan x="${f(x)}" dy="${f(i ? lh : -(lines.length - 1) * lh / 2)}">${escapeXml(l)}</tspan>`).join("");
	}
	function renderText(sym, value, opts) {
		const p = sym.props || {};
		const align = ["start", "end"].includes(p.align) ? p.align : "middle";
		const x = align === "start" ? 0 : align === "end" ? sym.w : sym.w / 2;
		let text = fillKeys(p.text, opts);
		if (sym.key) text = (text ? text + " " : "") + formatValue(value, p.decimals, opts.locale) + (p.unit ? " " + p.unit : "");
		const size = Math.max(6, Number(p.size) || 16);
		const unknown = sym.key && (value === void 0 || value === null) ? " hmi-unknown" : "";
		return `<g class="hmi-text hmi-tone-${p.tone === "dim" ? "dim" : "normal"}${unknown}"><rect class="hmi-hitbox" x="0" y="0" width="${f(sym.w)}" height="${f(sym.h)}"/><text x="${f(x)}" y="${f(sym.h / 2)}" font-size="${f(size)}" style="text-anchor:${align}" font-weight="${p.bold === "yes" ? 700 : 400}">${textLines(text, sym, size, p.bold === "yes", x)}</text></g>`;
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
		const k = Number(sym._k);
		const tf = `translate(${f(sym.x)},${f(sym.y)})` + (k > 0 && k < 1 ? ` scale(${Math.round(k * 1e3) / 1e3})` : "") + (rot ? ` rotate(${f(rot)},${f(sym.w / 2)},${f(sym.h / 2)})` : "");
		const p = sym.props || {};
		let vars = "";
		if (!def.line && sym.type !== "frame" && sym.type !== "shape") {
			if (HEX.test(p.colorOn)) vars += `--hmi-equip-on:${p.colorOn};--hmi-ok:${p.colorOn};`;
			if (HEX.test(p.colorOff)) vars += `--hmi-equip:${p.colorOff};`;
		}
		return `<g class="${cls}" data-id="${escapeXml(sym.id)}" transform="${tf}"${vars ? ` style="${vars}"` : ""}>${def.render(sym, value, o)}</g>`;
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
.hmi-root text:where(:not(.hmi-svgimp *)) { text-anchor: middle; }
.hmi-root .hmi-label { fill: var(--hmi-text); font-size: 14px; font-weight: 600; }
.hmi-root .hmi-reel .hmi-body { fill: var(--hmi-equip); stroke: var(--hmi-stroke); stroke-width: 2; }
.hmi-root .hmi-reel.hmi-on .hmi-body { fill: var(--hmi-equip-on); }
.hmi-root .hmi-reel.hmi-unknown .hmi-body { stroke-dasharray: 6 4; }
.hmi-root .hmi-reel .hmi-ring { fill: none; stroke: var(--hmi-line); stroke-width: 1; }
.hmi-root .hmi-reel .hmi-spokes line { stroke: var(--hmi-line); stroke-width: 1.5; }
.hmi-root .hmi-reel .hmi-hub { fill: var(--hmi-tag-bg); stroke: var(--hmi-stroke); stroke-width: 2; }
.hmi-root .hmi-reel .hmi-axle { fill: var(--hmi-stroke); }
.hmi-root .hmi-reel .hmi-spin, .hmi-root .hmi-roller .hmi-spin { transform-box: view-box; transform-origin: 0 0; }
.hmi-root.hmi-theme-classic .hmi-reel.hmi-on .hmi-spin, .hmi-root.hmi-anim-always .hmi-reel.hmi-on .hmi-spin { animation: hmi-spin 2.4s linear infinite; }
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
.hmi-root.hmi-theme-classic .hmi-roller.hmi-on.hmi-cw .hmi-spin, .hmi-root.hmi-anim-always .hmi-roller.hmi-on.hmi-cw .hmi-spin { animation: hmi-spin .9s linear infinite; }
.hmi-root.hmi-theme-classic .hmi-roller.hmi-on.hmi-ccw .hmi-spin, .hmi-root.hmi-anim-always .hmi-roller.hmi-on.hmi-ccw .hmi-spin { animation: hmi-spin-ccw .9s linear infinite; }
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
.hmi-root .hmi-shape-level .hmi-level { stroke: none; }
.hmi-root .hmi-lc-ok .hmi-level { fill: #2e9d4f; }
.hmi-root .hmi-lc-warn .hmi-level { fill: var(--hmi-warn); }
.hmi-root .hmi-lc-alarm .hmi-level { fill: var(--hmi-alarm); }
.hmi-root .hmi-lc-material .hmi-level { fill: var(--hmi-material); }
.hmi-root .hmi-shape-value { fill: var(--hmi-text); text-anchor: middle; dominant-baseline: central; font-weight: 600; }
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
.hmi-root.hmi-theme-classic .hmi-conveyor.hmi-on.hmi-fwd .hmi-belt, .hmi-root.hmi-anim-always .hmi-conveyor.hmi-on.hmi-fwd .hmi-belt { animation: hmi-belt 0.8s linear infinite; }
.hmi-root.hmi-theme-classic .hmi-conveyor.hmi-on.hmi-rev .hmi-belt, .hmi-root.hmi-anim-always .hmi-conveyor.hmi-on.hmi-rev .hmi-belt { animation: hmi-belt 0.8s linear infinite reverse; }
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
.hmi-root.hmi-theme-classic .hmi-fan.hmi-on .hmi-spin, .hmi-root.hmi-anim-always .hmi-fan.hmi-on .hmi-spin { animation: hmi-spin 0.9s linear infinite; }
.hmi-root.hmi-theme-classic .hmi-knife.hmi-on .hmi-spin, .hmi-root.hmi-anim-always .hmi-knife.hmi-on .hmi-spin { animation: hmi-spin 0.5s linear infinite; }
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
.hmi-root .hmi-line.hmi-flow-rev .hmi-flowpath, .hmi-root .hmi-line.hmi-ls-conveyor.hmi-flow-rev .hmi-path { animation-direction: reverse !important; }
.hmi-root.hmi-theme-classic .hmi-line.hmi-ls-conveyor.hmi-on:not(.hmi-flow-never) .hmi-path, .hmi-root.hmi-anim-always .hmi-line.hmi-ls-conveyor.hmi-on:not(.hmi-flow-never) .hmi-path, .hmi-root .hmi-line.hmi-ls-conveyor.hmi-on.hmi-flow-always .hmi-path { animation: hmi-belt .8s linear infinite; }
.hmi-root .hmi-frame.hmi-own .hmi-body { fill: var(--hmi-own) !important; }
.hmi-root.hmi-anim-never *:not(.hmi-blink):not(.hmi-rule-blink):not(.hmi-ov-wait):not(.hmi-al-flash), .hmi-root.hmi-anim-classic.hmi-theme-isa101 *:not(.hmi-blink):not(.hmi-rule-blink):not(.hmi-ov-wait):not(.hmi-al-flash) { animation: none !important; }
.hmi-root.hmi-theme-classic .hmi-line.hmi-on.hmi-flow-auto .hmi-flowpath, .hmi-root .hmi-line.hmi-on.hmi-flow-always .hmi-flowpath, .hmi-root.hmi-anim-always .hmi-line.hmi-on.hmi-flow-auto .hmi-flowpath { opacity: .85; animation: hmi-flow .8s linear infinite; }
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
` + MORE_CSS + CHART_CSS + MACHINE_CSS + MACHINE2_CSS + OVERLAY_CSS + SVGIMPORT_CSS + PRODUCTION_CSS;
	Object.assign(SYMBOLS, moreSymbols({
		f,
		num,
		escapeXml,
		isOn,
		onState,
		formatValue,
		rangeState,
		alarmIndicator,
		stateClass,
		labelBelow,
		faultOf,
		faultMark,
		faultClass,
		scaleOf,
		ON_FIELDS,
		INVERT_FIELD,
		FAULT_FIELD,
		PRIORITY_FIELD
	}));
	Object.assign(SYMBOLS, chartSymbols({
		f,
		num,
		escapeXml,
		formatValue
	}));
	Object.assign(SYMBOLS, productionSymbols({
		f,
		escapeXml,
		onState,
		formatValue,
		stateClass,
		labelBelow,
		faultMark,
		faultClass,
		fillKeys,
		ON_FIELDS,
		FAULT_FIELD,
		PRIORITY_FIELD
	}));
	Object.assign(SYMBOLS, svgImportSymbol({
		f,
		isOn,
		formatValue,
		labelBelow
	}));
	SYMBOLS.shape.fields.push(...SYMBOLS.frame.fields.filter((fd) => [
		"level",
		"min",
		"max",
		"levelColor",
		"showValue",
		"unit",
		"decimals"
	].includes(fd.key)));
	function injectStyles(doc) {
		const d = doc || (typeof document !== "undefined" ? document : null);
		if (!d || d.getElementById("hmi-symbols-style")) return;
		const el = d.createElement("style");
		el.id = STYLE_ID;
		el.textContent = CSS;
		d.head.appendChild(el);
	}
	//#endregion
	//#region ui/editor/readyblocks.js
	var n = 0;
	function sym(type, x, y, key, props, size) {
		const s = createSymbol(type, x, y);
		s.id = "rb" + ++n;
		s.key = key || "";
		Object.assign(s.props, props || {});
		if (size) {
			s.w = size[0];
			s.h = size[1];
		}
		return s;
	}
	function part(shape, x, y, key, props, size) {
		const s = createSymbol("frame", x, y, SYMBOLS.frame.variants.findIndex((v) => v.props.shape === shape));
		s.id = "rb" + ++n;
		s.key = key || "";
		Object.assign(s.props, props || {});
		if (size) {
			s.w = size[0];
			s.h = size[1];
		}
		return s;
	}
	var text = (x, y, t, w) => sym("text", x, y, "", {
		text: t,
		size: 14,
		bold: "yes"
	}, [w || 200, 24]);
	function readyBlocks() {
		n = 0;
		return [
			{
				name: "Cilindro com válvula e fins de curso",
				symbols: [
					text(0, 0, "{{tag}}", 260),
					part("limitSwitch", 10, 30, "{{tag}}.recuado", { label: "Recuado" }, [50, 70]),
					part("limitSwitch", 200, 30, "{{tag}}.avancado", { label: "Avançado" }, [50, 70]),
					part("pneuCyl", 0, 130, "{{tag}}.avancado", { motion: "onoff" }, [260, 70]),
					part("valve52", 40, 230, "{{tag}}.solenoide", { label: "Válvula {{tag}}" }, [180, 80])
				]
			},
			{
				name: "Esteira com sensor e desviador",
				symbols: [
					text(0, 0, "{{tag}}", 420),
					part("photoEye", 60, 40, "{{tag}}.sensor", {}, [200, 40]),
					sym("conveyor", 0, 90, "{{tag}}.motor", { label: "" }, [300, 50]),
					part("diverter", 290, 60, "{{tag}}.desvia", { label: "Desvio" }, [140, 110]),
					sym("motor", 20, 160, "{{tag}}.motor", { label: "Motor" }, [60, 60]),
					sym("counter", 120, 160, "{{tag}}.contagem", {
						kind: "count",
						title: "PEÇAS"
					}, [150, 60])
				]
			},
			{
				name: "Estação de envase",
				symbols: [
					text(0, 0, "Envase {{tag}}", 640),
					part("filler", 0, 30, "{{tag}}.nivel", {
						motion: "value",
						min: 0,
						max: 100,
						label: "Enchedora"
					}, [260, 170]),
					part("capper", 280, 60, "{{tag}}.tampa", { label: "Tampadora" }, [150, 140]),
					part("labeler", 450, 60, "{{tag}}.rotulo", { label: "Rotuladora" }, [180, 140]),
					sym("conveyor", 0, 230, "{{tag}}.esteira", { label: "" }, [640, 40]),
					part("photoEye", 220, 280, "{{tag}}.garrafa", {}, [160, 30]),
					part("beacon", 600, 20, "{{tag}}.falha", {}, [36, 70]),
					sym("tag", 0, 330, "{{tag}}.nivel", {
						title: "NÍVEL",
						unit: "%",
						decimals: 0
					}, [140, 60]),
					sym("counter", 160, 330, "{{tag}}.garrafas", {
						kind: "count",
						title: "GARRAFAS"
					}, [160, 60])
				]
			},
			{
				name: "Prensa com cortina de luz e emergência",
				symbols: [
					text(0, 0, "Prensa {{tag}}", 340),
					part("punch", 60, 30, "{{tag}}.desce", { label: "Prensa" }, [200, 220]),
					part("lightCurtain", 0, 60, "{{tag}}.cortina", {}, [40, 160]),
					part("lightCurtain", 280, 60, "{{tag}}.cortina", {}, [40, 160]),
					part("estop", 0, 290, "{{tag}}.emergencia", { label: "Emergência" }, [60, 60]),
					part("pushStation", 100, 280, "{{tag}}.ciclo", { label: "Bimanual" }, [60, 80]),
					part("beacon", 220, 280, "{{tag}}.falha", {}, [36, 70])
				]
			},
			{
				name: "Bobinadeira com status e contadores",
				symbols: [
					text(0, 0, "{{tag}}", 150),
					sym("stateChip", 160, 0, "{{tag}}.estado", {}, [180, 34]),
					sym("winder", 10, 44, "{{tag}}.girando", {}, [320, 140]),
					sym("text", 0, 190, "", {
						text: "operador {{{tag}}.operador:t} · {{{tag}}.projeto}",
						size: 13,
						align: "start",
						tone: "dim"
					}, [340, 18]),
					sym("tag", 0, 216, "{{tag}}.bobinas", {
						title: "BOBINAS HOJE",
						decimals: 0
					}, [106, 54]),
					sym("tag", 117, 216, "{{tag}}.ocupacao", {
						title: "OCUPAÇÃO",
						unit: "%",
						decimals: 0
					}, [106, 54]),
					sym("tag", 234, 216, "{{tag}}.ultima", {
						title: "ÚLTIMA",
						decimals: 0
					}, [106, 54]),
					sym("timeline", 0, 284, "{{tag}}.linha_tempo", { legend: "no" }, [340, 52])
				]
			},
			{
				name: "Pórtico pega e coloca",
				symbols: [
					text(0, 0, "Pórtico {{tag}}", 340),
					part("gantry", 0, 30, "{{tag}}.z", {
						motion: "value",
						min: 0,
						max: 100,
						label: "Eixo Z"
					}, [340, 220]),
					part("gripper", 110, 280, "{{tag}}.garra", { label: "Garra" }, [80, 80]),
					sym("tag", 220, 280, "{{tag}}.z", {
						title: "Z",
						unit: "mm",
						decimals: 0
					}, [120, 60]),
					part("servo", 0, 280, "{{tag}}.servo", { label: "Servo" }, [100, 50])
				]
			}
		];
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
		ungroup: "<rect x=\"1\" y=\"1\" width=\"6\" height=\"6\"/><rect x=\"9\" y=\"9\" width=\"6\" height=\"6\"/>",
		zoomin: "<circle cx=\"7\" cy=\"7\" r=\"5\"/><path d=\"M11 11l4 4M4.5 7h5M7 4.5v5\"/>",
		zoomout: "<circle cx=\"7\" cy=\"7\" r=\"5\"/><path d=\"M11 11l4 4M4.5 7h5\"/>"
	};
	var ACTIONS = [
		["none", "Nada"],
		["value", "Enviar um valor"],
		["toggle", "Inverter (liga / desliga)"],
		["pulse", "Pulso (1 ao apertar, 0 ao soltar)"],
		["input", "Digitar um valor (ajuste)"],
		["page", "Ir para outra página"],
		["screen", "Ir para outra tela (deste canvas)"],
		["faceplate", "Abrir faceplate (detalhes e comandos)"]
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
	var BLOCKS_STORE = "hmi-editor-blocks";
	function loadBlocks() {
		try {
			const list = JSON.parse(localStorage.getItem(BLOCKS_STORE) || "[]");
			return Array.isArray(list) ? list.filter((b) => b && typeof b.name === "string" && Array.isArray(b.symbols)) : [];
		} catch (e) {
			return [];
		}
	}
	function saveBlocks(list) {
		try {
			localStorage.setItem(BLOCKS_STORE, JSON.stringify(list));
			return true;
		} catch (e) {
			return false;
		}
	}
	var plain = (t) => String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
	function searchPalette(text) {
		const q = plain(text).trim();
		if (!q) return [];
		const words = q.split(/\s+/);
		const out = [];
		for (const cat of CATEGORIES) for (const it of paletteItems(cat)) {
			const hay = plain(it.label + " " + cat + " " + it.type + " " + (SYMBOLS[it.type] && SYMBOLS[it.type].label || ""));
			if (words.every((w) => hay.includes(w))) out.push(it);
		}
		return out.slice(0, 60);
	}
	function makeBlock(name, list, param) {
		let syms = clone(list);
		const x = Math.min(...syms.map((m) => m.x));
		const y = Math.min(...syms.map((m) => m.y));
		for (const m of syms) {
			m.x -= x;
			m.y -= y;
			delete m.locked;
		}
		const p = String(param || "").trim();
		if (p) syms = replaceStrings(syms, (s) => s.split(p).join("{{tag}}"));
		return {
			name: String(name || "Bloco").slice(0, 60),
			symbols: syms
		};
	}
	function replaceStrings(v, fn) {
		if (typeof v === "string") return v.startsWith("data:") ? v : fn(v);
		if (Array.isArray(v)) return v.map((x) => replaceStrings(x, fn));
		if (v && typeof v === "object") {
			const out = {};
			for (const k of Object.keys(v)) out[k] = k === "id" || k === "type" || k === "group" ? v[k] : replaceStrings(v[k], fn);
			return out;
		}
		return v;
	}
	function blockParams(b) {
		const out = [];
		const re = /\{\{(\w{1,30})\}\}/g;
		let m;
		const text = JSON.stringify(b.symbols);
		while (m = re.exec(text)) if (!out.includes(m[1])) out.push(m[1]);
		return out;
	}
	function fillBlock(b, values) {
		return replaceStrings(b.symbols, (s) => s.replace(/\{\{(\w{1,30})\}\}/g, (all, k) => values[k] !== void 0 ? String(values[k]) : all));
	}
	function cleanBlockSymbols(list) {
		const n = (v) => isFinite(Number(v)) ? Number(v) : 0;
		return (Array.isArray(list) ? list : []).filter((m) => m && typeof m === "object" && typeof m.id === "string" && typeof m.type === "string" && SYMBOLS[m.type]).map((m) => {
			const c = {
				...m,
				x: n(m.x),
				y: n(m.y),
				w: Math.max(10, n(m.w) || SYMBOLS[m.type].w || 10),
				h: Math.max(1, n(m.h) || SYMBOLS[m.type].h || 10),
				rot: n(m.rot),
				key: typeof m.key === "string" ? m.key : ""
			};
			c.props = m.props && typeof m.props === "object" && !Array.isArray(m.props) ? m.props : {};
			if (m.action && (typeof m.action !== "object" || Array.isArray(m.action))) delete c.action;
			if (m.rules && !Array.isArray(m.rules)) delete c.rules;
			if (m.scale && typeof m.scale !== "object") delete c.scale;
			if (typeof m.group !== "string") delete c.group;
			return c;
		});
	}
	function cleanScreens(list) {
		const out = [];
		for (const n of Array.isArray(list) ? list : []) {
			const t = typeof n === "string" ? n.trim().slice(0, 40) : "";
			if (t && !out.includes(t) && out.length < 20) out.push(t);
		}
		return out;
	}
	function layerName(s) {
		const p = s && s.props || {};
		const def = SYMBOLS[s && s.type];
		return String(s.name || p.label || p.title || p.text || def && def.label || s.type);
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
.hmi-ed-guide { stroke: #e91e63; stroke-width: 1; stroke-dasharray: 4 3; pointer-events: none; vector-effect: non-scaling-stroke; }
.hmi-ed-sel.hmi-ed-locked { stroke: #8a8e93; }
.hmi-ed-lockmark { fill: #8a8e93; pointer-events: none; }
.hmi-ed-zoom { min-width: 58px; }
.hmi-ed .hmi-ed-search { width: 150px; height: 30px; padding: 2px 8px; font: inherit; border: 1px solid var(--hmi-ed-border); border-radius: 4px; background: var(--hmi-ed-bg); color: var(--hmi-ed-text); margin: 0; }
.hmi-ed-tabs { display: flex; gap: 0; margin: -2px 0 10px 0; border-bottom: 1px solid var(--hmi-ed-border); }
.hmi-ed-tab { flex: 1; font: inherit; font-size: 12px; padding: 6px 4px; border: 0; background: none; color: var(--hmi-ed-text); cursor: pointer; opacity: .7; }
.hmi-ed-tab.hmi-ed-on { opacity: 1; font-weight: 700; box-shadow: inset 0 -2px 0 #1e88e5; }
.hmi-ed-layers { display: flex; flex-direction: column; gap: 1px; }
.hmi-ed-layer { display: flex; align-items: center; gap: 4px; padding: 3px 4px; border-radius: 3px; cursor: pointer; font-size: 12px; }
.hmi-ed-layer:hover { background: var(--hmi-ed-bg); }
.hmi-ed-layer.hmi-ed-on { background: rgba(30, 136, 229, .15); }
.hmi-ed-layer .hmi-ed-lname { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hmi-ed-layer .hmi-ed-lkey { opacity: .6; font-size: 11px; }
.hmi-ed-layer.hmi-ed-off .hmi-ed-lname { opacity: .45; text-decoration: line-through; }
.hmi-ed-lbtn { font: inherit; font-size: 12px; border: 0; background: none; padding: 0 3px; cursor: pointer; opacity: .35; color: inherit; line-height: 1; }
.hmi-ed-lbtn.hmi-ed-on { opacity: 1; }
.hmi-ed-menu .hmi-ed-menurow { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 4px; align-items: center; padding-bottom: 4px; border-bottom: 1px solid var(--hmi-ed-border); margin-bottom: 2px; }
.hmi-ed-menu .hmi-ed-menurow input { height: 26px; padding: 2px 6px; font: inherit; font-size: 12px; border: 1px solid var(--hmi-ed-border); border-radius: 4px; flex: 1; min-width: 120px; }
.hmi-ed-menu .hmi-ed-empty { grid-column: 1 / -1; font-size: 12px; opacity: .7; padding: 4px; }
.hmi-ed-screens { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; padding: 4px 8px; border-bottom: 1px solid var(--hmi-ed-border); background: var(--hmi-ed-bg); }
.hmi-ed-screens .hmi-ed-slabel { font-size: 12px; opacity: .7; margin-right: 2px; }
.hmi-ed-screens .hmi-ed-stab { flex: none; border: 1px solid var(--hmi-ed-border); border-radius: 4px; padding: 3px 10px; }
.hmi-ed-props .hmi-ed-nocolor { opacity: .35; }
.hmi-ed-menu .hmi-ed-head { font-weight: 700; opacity: .85; text-transform: uppercase; letter-spacing: .04em; }
.hmi-ed-item { position: relative; }
.hmi-ed-item .hmi-ed-del { position: absolute; top: 1px; right: 3px; border: 0; background: none; cursor: pointer; opacity: .5; font-size: 13px; color: inherit; }
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
			future: [],
			zoom: 1,
			pan: {
				x: 0,
				y: 0
			},
			guides: [],
			hidden: /* @__PURE__ */ new Set(),
			panel: "props",
			filter: ""
		};
		ed.history.push(clone(ed.symbols));
		ed.screens = cleanScreens(o.screens);
		ed.screen = ed.screens[0] || "";
		const here = (s) => !ed.screens.length || (s.screen || ed.screens[0]) === ed.screen;
		const onScreen = () => ed.symbols.filter(here);
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
		sep();
		tool("zoomout", "Diminuir zoom (Ctrl+roda do mouse)", () => zoomBy(1 / 1.25), () => ed.zoom > 1);
		const zoomBtn = el("button", {
			type: "button",
			class: btnClass + " hmi-ed-small hmi-ed-zoom",
			title: "Ver a tela inteira (100%)"
		}, "100%");
		zoomBtn.addEventListener("click", () => {
			ed.zoom = 1;
			ed.pan = {
				x: 0,
				y: 0
			};
			draw();
			stage.focus();
		});
		tools.appendChild(zoomBtn);
		tool("zoomin", "Aumentar zoom (Ctrl+roda do mouse). Com zoom: roda ou botão do meio / Espaço+arrastar move a tela", () => zoomBy(1.25), () => ed.zoom < 8);
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
		const guideLabel = el("label", {
			class: "hmi-ed-check",
			title: "Ao arrastar, encaixa nas bordas e no centro dos outros símbolos"
		});
		const guideBox = el("input", { type: "checkbox" });
		guideBox.checked = true;
		guideLabel.appendChild(guideBox);
		guideLabel.appendChild(document.createTextNode("Guias"));
		toolbar.appendChild(guideLabel);
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
		const screenBar = el("div", { class: "hmi-ed-screens" });
		root.appendChild(toolbar);
		root.appendChild(screenBar);
		root.appendChild(body);
		function showScreens() {
			screenBar.innerHTML = "";
			screenBar.appendChild(el("span", { class: "hmi-ed-slabel" }, "Telas:"));
			const names = ed.screens.length ? ed.screens : ["Principal"];
			for (const n of names) {
				const b = el("button", {
					type: "button",
					class: "hmi-ed-tab hmi-ed-stab" + ((ed.screen || "Principal") === n ? " hmi-ed-on" : ""),
					title: "Abrir esta tela. Duplo clique renomeia."
				}, n);
				b.addEventListener("click", () => {
					if (ed.screens.length) {
						ed.screen = n;
						select([]);
						refresh();
					}
				});
				b.addEventListener("dblclick", () => renameScreen());
				screenBar.appendChild(b);
			}
			const mini = (label, title, fn) => {
				const b = el("button", {
					type: "button",
					class: btnClass + " hmi-ed-small",
					title
				}, label);
				b.addEventListener("click", fn);
				screenBar.appendChild(b);
			};
			mini("+ Tela", "Criar outra tela neste canvas (vira uma aba no dashboard)", addScreen);
			if (ed.screens.length) {
				mini("Renomear", "Renomear a tela aberta", renameScreen);
				if (ed.screens.length > 1) mini("Apagar tela", "Apagar a tela aberta e os símbolos dela", deleteScreen);
			}
		}
		function pinScreens() {
			for (const m of ed.symbols) if (!m.screen || !ed.screens.includes(m.screen)) m.screen = ed.screens[0];
		}
		function askName(text, value) {
			const raw = window.prompt(text, value || "");
			if (raw === null) return null;
			const n = raw.trim().slice(0, 40);
			if (!n) return null;
			if (ed.screens.includes(n) && n !== value) {
				msg.textContent = "Já existe uma tela com esse nome.";
				return null;
			}
			return n;
		}
		function addScreen() {
			if (!ed.screens.length) {
				const first = askName("Nome da tela que já existe (a primeira):", "Principal");
				if (!first) return;
				ed.screens = [first];
				pinScreens();
			}
			const n = askName("Nome da nova tela:", "Tela " + (ed.screens.length + 1));
			if (!n) {
				screensChanged();
				return;
			}
			ed.screens.push(n);
			ed.screen = n;
			select([]);
			screensChanged();
		}
		function renameScreen() {
			if (!ed.screens.length) return addScreen();
			const old = ed.screen;
			const n = askName("Novo nome da tela \"" + old + "\":", old);
			if (!n || n === old) return;
			pinScreens();
			ed.screens = ed.screens.map((x) => x === old ? n : x);
			for (const m of ed.symbols) {
				if (m.screen === old) m.screen = n;
				if (m.action && m.action.mode === "screen" && m.action.value === old) m.action.value = n;
			}
			ed.screen = n;
			screensChanged();
		}
		function deleteScreen() {
			if (ed.screens.length < 2) return;
			const n = ed.screen;
			const count = onScreen().length;
			if (!window.confirm("Apagar a tela \"" + n + "\"" + (count ? " e os " + count + " símbolo(s) dela" : "") + "?")) return;
			pinScreens();
			ed.symbols = ed.symbols.filter((m) => m.screen !== n);
			ed.screens = ed.screens.filter((x) => x !== n);
			ed.screen = ed.screens[0];
			select([]);
			screensChanged();
		}
		function screensChanged() {
			showScreens();
			refresh();
			changed();
			if (o.onChange) o.onChange(api);
		}
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
			const vw = v.w / ed.zoom;
			const vh = v.h / ed.zoom;
			ed.pan.x = Math.max(0, Math.min(v.w - vw, ed.pan.x));
			ed.pan.y = Math.max(0, Math.min(v.h - vh, ed.pan.y));
			svg.setAttribute("viewBox", ed.pan.x + " " + ed.pan.y + " " + vw + " " + vh);
			zoomBtn.textContent = Math.round(ed.zoom * 100) + "%";
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
				if (!def || ed.hidden.has(s.id) || !here(s)) continue;
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
				if (s.w > 10 && s.h > 10 && !s.locked) {
					const hs = Math.max(8, Math.min(12, view().w / 120)) / ed.zoom;
					const pad = 12 / ed.zoom;
					out += "<rect class=\"hmi-ed-sel\" x=\"" + -pad + "\" y=\"" + -pad + "\" width=\"" + (s.w + pad * 2) + "\" height=\"" + (s.h + pad * 2) + "\"/>";
					for (const [dir, hx, hy] of HANDLES) out += "<rect class=\"hmi-ed-handle\" data-handle=\"" + dir + "\" style=\"cursor:" + handleCursor(dir, 0) + "\" x=\"" + (hx * (s.w + pad * 2) - pad - hs / 2) + "\" y=\"" + (hy * (s.h + pad * 2) - pad - hs / 2) + "\" width=\"" + hs + "\" height=\"" + hs + "\"/>";
				}
				for (let i = 0; i < pts.length - 1; i++) out += "<circle class=\"hmi-ed-mid\" data-mid=\"" + i + "\" cx=\"" + (pts[i][0] + pts[i + 1][0]) / 2 + "\" cy=\"" + (pts[i][1] + pts[i + 1][1]) / 2 + "\" r=\"5\"/>";
				pts.forEach((pt, i) => {
					out += "<circle class=\"hmi-ed-point\" data-point=\"" + i + "\" cx=\"" + pt[0] + "\" cy=\"" + pt[1] + "\" r=\"6\"/>";
				});
				out += "</g>";
			} else if (s) {
				const rot = Number(s.rot) || 0;
				const hs = Math.max(8, Math.min(12, view().w / 120)) / ed.zoom;
				out += "<g transform=\"translate(" + s.x + "," + s.y + ")" + (rot ? " rotate(" + rot + "," + s.w / 2 + "," + s.h / 2 + ")" : "") + "\"><rect class=\"hmi-ed-sel" + (s.locked ? " hmi-ed-locked" : "") + "\" x=\"-3\" y=\"-3\" width=\"" + (s.w + 6) + "\" height=\"" + (s.h + 6) + "\"/>";
				if (s.locked) out += "<path class=\"hmi-ed-lockmark\" transform=\"translate(" + (s.w - 4) + ",-14) scale(" + 1 / ed.zoom + ")\" d=\"M2 6V4a3 3 0 0 1 6 0v2h1v6H1V6Zm2 0h2V4a1 1 0 0 0-2 0Z\"/>";
				for (const [dir, hx, hy] of s.locked ? [] : HANDLES) out += "<rect class=\"hmi-ed-handle\" data-handle=\"" + dir + "\" style=\"cursor:" + handleCursor(dir, rot) + "\" x=\"" + (hx * s.w - hs / 2) + "\" y=\"" + (hy * s.h - hs / 2) + "\" width=\"" + hs + "\" height=\"" + hs + "\"/>";
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
			for (const g of ed.guides) out += g.x !== void 0 ? "<path class=\"hmi-ed-guide\" d=\"M" + g.x + " 0V" + v.h + "\"/>" : "<path class=\"hmi-ed-guide\" d=\"M0 " + g.y + "H" + v.w + "\"/>";
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
			const tabs = el("div", { class: "hmi-ed-tabs" });
			for (const [k, label] of [["props", "Propriedades"], ["layers", "Camadas (" + onScreen().length + ")"]]) {
				const b = el("button", {
					type: "button",
					class: "hmi-ed-tab" + (ed.panel === k ? " hmi-ed-on" : "")
				}, label);
				b.addEventListener("click", () => {
					ed.panel = k;
					showProps();
				});
				tabs.appendChild(b);
			}
			props.appendChild(tabs);
			if (ed.panel === "layers") return showLayers();
			const editRow = () => {
				const row = el("div", { class: "hmi-ed-btnrow" });
				const locked = selection().length && selection().every((m) => m.locked);
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
					],
					[
						locked ? "Destravar" : "Travar",
						locked ? "Deixar mover e editar na tela" : "Não deixa mover nem selecionar clicando na tela (Ctrl+L). Destrave em Camadas.",
						() => setLocked(!locked)
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
			props.appendChild(field("Nome (em Camadas)", s.name || "", "text", (v) => {
				if (v.trim()) s.name = v.trim();
				else delete s.name;
			}));
			props.appendChild(pair(field("X", s.x, "number", (v) => {
				s.x = Number(v) || 0;
			}), field("Y", s.y, "number", (v) => {
				s.y = Number(v) || 0;
			})));
			if (def.line) {
				const scalePts = (w, h) => {
					const k = [w / Math.max(1, s.w), h / Math.max(1, s.h)];
					s.props.points = linePoints(s).map((pt) => [Math.round(pt[0] * k[0]), Math.round(pt[1] * k[1])]);
					normalizeLine(s);
				};
				props.appendChild(pair(field("Largura", s.w, "number", (v) => scalePts(Math.max(10, Number(v) || 10), s.h)), field("Altura", s.h, "number", (v) => scalePts(s.w, Math.max(10, Number(v) || 10)))));
			}
			if (def.line) {
				const tr = el("div", { class: "hmi-ed-btnrow" });
				for (const [label, title, fn] of [
					[
						"↻ 90°",
						"Girar 90° no sentido horário",
						([x, y], w, h) => [h - y, x]
					],
					[
						"↺ 90°",
						"Girar 90° no sentido anti-horário",
						([x, y], w, h) => [y, w - x]
					],
					[
						"↔",
						"Espelhar na horizontal",
						([x, y], w, h) => [w - x, y]
					],
					[
						"↕",
						"Espelhar na vertical",
						([x, y], w, h) => [x, h - y]
					]
				]) smallBtn(tr, label, title, () => {
					turnPoints(s, fn);
					refresh();
					changed();
				});
				props.appendChild(tr);
				props.appendChild(el("div", { class: "hmi-ed-hint" }, "Arraste os pontos brancos. Puxe o ponto azul do meio para criar uma curva; duplo clique num ponto apaga."));
			} else {
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
			if (def.defaults && "onWhen" in def.defaults || ["frame", "shape"].includes(s.type)) {
				const colorField = (label, k) => {
					const f = field(label, s.props[k] || "#888888", "color", (v) => {
						s.props[k] = v;
					});
					const input = f.querySelector("input");
					if (!s.props[k]) input.classList.add("hmi-ed-nocolor");
					input.addEventListener("input", () => input.classList.remove("hmi-ed-nocolor"));
					const clear = el("button", {
						type: "button",
						class: btnClass + " hmi-ed-small",
						title: "Voltar à cor do tema"
					}, "Tema");
					clear.addEventListener("click", () => {
						delete s.props[k];
						draw();
						changed();
						showProps();
					});
					f.appendChild(clear);
					return f;
				};
				props.appendChild(pair(colorField("Cor ligado", "colorOn"), colorField("Cor desligado", "colorOff")));
			}
			if (def.defaults && "priority" in def.defaults) props.appendChild(field("Na lista de alarmes", s.props.alarmList === "no" ? "no" : "yes", "select", (v) => {
				s.props.alarmList = v;
			}, [["yes", "Sim"], ["no", "Não"]]));
			props.appendChild(field("Valor de teste (só no editor)", s.preview === void 0 ? "" : String(s.preview), "text", (v) => {
				const p = parsePreview(v);
				if (p === void 0) delete s.preview;
				else s.preview = p;
			}));
			if (def.image) imageFields(s, smallBtn);
			if (def.svgImport) svgFields(s, smallBtn);
			if (!def.line && !def.image && !def.svgImport && !def.alarms && !["frame", "stack"].includes(s.type)) {
				props.appendChild(el("h5", {}, "Escala do valor"));
				const sc = s.scale || {};
				const setSc = (k, v) => {
					s.scale = {
						factor: "",
						divisor: "",
						offset: "",
						...s.scale,
						[k]: v
					};
					if (s.scale.factor === "" && !s.scale.divisor && s.scale.offset === "") delete s.scale;
				};
				const scField = (label, k) => field(label, sc[k] ?? "", "text", (v) => setSc(k, v.replace(",", ".").trim()));
				props.appendChild(pair(scField("Multiplicar por", "factor"), scField("Dividir por", "divisor")));
				props.appendChild(scField("Somar", "offset"));
				props.appendChild(el("div", { class: "hmi-ed-hint" }, "Mostra valor × multiplicar ÷ dividir + somar. Ex.: dividir por 10 para um CLP que manda 1450 e a tela mostra 145,0."));
			}
			ruleFields(s, smallBtn);
			if (def.line || s.type === "frame" || def.alarms) return;
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
				if (act.mode === "input") {
					props.appendChild(pair(field("Mínimo", act.min, "number", (v) => setAct("min", v)), field("Máximo", act.max, "number", (v) => setAct("max", v))));
					props.appendChild(field("Maior mudança de uma vez (vazio = sem limite)", act.maxStep ?? "", "number", (v) => setAct("maxStep", v)));
				}
				if (act.mode === "faceplate") {
					props.appendChild(el("div", { class: "hmi-ed-hint" }, "Abre uma janela com estado, alarmes deste símbolo e os campos abaixo. Deixe vazio o que não usa."));
					props.appendChild(pair(field("Chave de um valor", act.valueKey || "", "text", (v) => setAct("valueKey", v.trim())), field("Unidade", act.valueUnit || "", "text", (v) => setAct("valueUnit", v))));
					props.appendChild(pair(field("Chave do modo", act.modeKey || "", "text", (v) => setAct("modeKey", v.trim())), field("Textos do modo", act.modeTexts || "0=MANUAL,1=AUTO", "text", (v) => setAct("modeTexts", v))));
					props.appendChild(pair(field("Chave das horas", act.hoursKey || "", "text", (v) => setAct("hoursKey", v.trim())), field("Chave das partidas", act.startsKey || "", "text", (v) => setAct("startsKey", v.trim()))));
					for (const [k, label] of [
						["on", "Ligar"],
						["off", "Desligar"],
						["reset", "Reset"]
					]) props.appendChild(pair(field("Botão " + label + ": tópico", act[k + "Topic"] || "", "text", (v) => setAct(k + "Topic", v.trim())), field("valor", act[k + "Value"] ?? "", "text", (v) => setAct(k + "Value", v))));
					props.appendChild(el("h5", {}, "Regulador (PID)"));
					props.appendChild(el("div", { class: "hmi-ed-hint" }, "Para malhas de controle: mostra PV, SP e saída, com botões Auto/Manual, Alterar SP e Saída manual."));
					props.appendChild(pair(field("Chave do PV (medido)", act.pvKey || "", "text", (v) => setAct("pvKey", v.trim())), field("Unidade", act.pidUnit || "", "text", (v) => setAct("pidUnit", v))));
					props.appendChild(pair(field("Chave do SP", act.spKey || "", "text", (v) => setAct("spKey", v.trim())), field("Chave da saída (%)", act.opKey || "", "text", (v) => setAct("opKey", v.trim()))));
					props.appendChild(field("Alterar SP: tópico", act.spTopic || "", "text", (v) => setAct("spTopic", v.trim())));
					props.appendChild(pair(field("SP mínimo", act.spMin ?? "", "number", (v) => setAct("spMin", v)), field("SP máximo", act.spMax ?? "", "number", (v) => setAct("spMax", v))));
					props.appendChild(field("Saída manual: tópico", act.opTopic || "", "text", (v) => setAct("opTopic", v.trim())));
					props.appendChild(pair(field("Saída mínima", act.opMin ?? "0", "number", (v) => setAct("opMin", v)), field("Saída máxima", act.opMax ?? "100", "number", (v) => setAct("opMax", v))));
					props.appendChild(field("Auto/Manual: tópico", act.modeTopic || "", "text", (v) => setAct("modeTopic", v.trim())));
					props.appendChild(pair(field("valor Auto", act.autoValue ?? "1", "text", (v) => setAct("autoValue", v)), field("valor Manual", act.manValue ?? "0", "text", (v) => setAct("manValue", v))));
				} else if (act.mode === "screen") {
					const names = ed.screens.length ? ed.screens : ["Principal"];
					props.appendChild(field("Tela", act.value, "select", (v) => setAct("value", v), [["", "(escolha)"], ...names.map((n) => [n, n])]));
					if (!ed.screens.length) props.appendChild(el("div", { class: "hmi-ed-hint" }, "Crie outras telas com \"+ Tela\", acima do desenho."));
				} else if (act.mode === "page") {
					const pages = o.getPages && o.getPages() || [];
					const pf = pages.length ? field("Página", act.value, "select", (v) => setAct("value", v), [["", "(escolha)"], ...pages]) : field("Página (caminho, ex. /linha2)", act.value, "text", (v) => setAct("value", v.trim()));
					props.appendChild(pf);
				}
				if (![
					"page",
					"screen",
					"faceplate"
				].includes(act.mode)) {
					const t = field("Tópico (vazio = chave do payload)", act.topic, "text", (v) => setAct("topic", v));
					t.querySelector("input").placeholder = s.key || "";
					props.appendChild(t);
				}
				if ([
					"value",
					"toggle",
					"page",
					"screen",
					"faceplate"
				].includes(act.mode)) props.appendChild(field("Pedir confirmação", act.confirm || "no", "select", (v) => setAct("confirm", v), [["no", "Não"], ["yes", "Sim"]]));
				if (!["page", "screen"].includes(act.mode)) props.appendChild(field("Pedir senha", act.pin || "no", "select", (v) => setAct("pin", v), [["no", "Não"], ["yes", "Sim (a senha do nó)"]]));
				if (!["page", "screen"].includes(act.mode)) {
					const il = field("Intertravamento: chaves que precisam estar ligadas", act.interlock || "", "text", (v) => setAct("interlock", v.trim()));
					il.querySelector("input").placeholder = "ex.: permissivo, !emergencia";
					props.appendChild(il);
					props.appendChild(field("Motivo mostrado quando bloqueado", act.interlockText || "", "text", (v) => setAct("interlockText", v)));
					props.appendChild(el("div", { class: "hmi-ed-hint" }, "Separe por vírgula; \"!\" na frente exige a chave desligada. O Node-RED recusa o comando enquanto faltar alguma, e o símbolo mostra um cadeado."));
				}
				if (!["page", "screen"].includes(act.mode)) props.appendChild(el("div", { class: "hmi-ed-hint" }, "A mensagem sai pela saída do nó: msg.topic e msg.payload."));
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
		function svgFields(s, smallBtn) {
			props.appendChild(el("h5", {}, "Desenho SVG"));
			const input = el("input", {
				type: "file",
				accept: ".svg,image/svg+xml",
				style: "display:none"
			});
			const btns = el("div", { class: "hmi-ed-btnrow" });
			smallBtn(btns, s.props.svg ? "Trocar" : "Escolher arquivo .svg", "Um desenho do Inkscape, Illustrator, draw.io... até 300 KB", () => input.click());
			input.addEventListener("change", () => {
				const file = input.files && input.files[0];
				if (!file) return;
				if (file.size > 307200) return api.setMessage("SVG grande demais (máx. 300 KB)");
				file.text().then((text) => {
					const clean = cleanSvg(text);
					if (!clean) return api.setMessage("Não é um SVG válido");
					s.props.svg = clean;
					const vb = String(parseSvg(clean).viewBox).split(/[\s,]+/).map(Number);
					if (vb.length === 4 && vb[2] > 0 && vb[3] > 0) s.h = Math.max(10, Math.round(s.w * vb[3] / vb[2]));
					refresh();
					changed();
				});
			});
			props.appendChild(btns);
			props.appendChild(input);
			const parsed = parseSvg(s.props.svg);
			const row = el("div", { class: "hmi-ed-f" });
			row.appendChild(el("label", {}, "Ligações (uma por linha)"));
			const ta = el("textarea", {
				rows: "5",
				style: "width:100%;font-family:monospace;font-size:12px",
				placeholder: "motor1 = M1.ligado\nfalha1 = M1.falha : alarme\ntempTxt = # temperatura"
			});
			ta.value = s.props.binds || "";
			ta.addEventListener("input", () => {
				s.props.binds = ta.value;
				draw();
				changed();
			});
			ta.addEventListener("keydown", (e) => e.stopPropagation());
			row.appendChild(ta);
			props.appendChild(row);
			props.appendChild(el("div", { class: "hmi-ed-hint" }, "id = chave: o elemento fica escuro quando a chave liga. \": alarme\" deixa vermelho, \": atencao\" amarelo, \": esconder\" some. \"id = # chave\" mostra o valor num texto."));
			if (parsed && parsed.ids.length) props.appendChild(el("div", { class: "hmi-ed-hint" }, "Elementos com id neste desenho: " + parsed.ids.slice(0, 40).join(", ") + (parsed.ids.length > 40 ? "…" : "")));
		}
		function refresh() {
			draw();
			showProps();
		}
		function showLayers() {
			const search = el("input", {
				type: "search",
				class: "hmi-ed-search",
				placeholder: "Buscar por nome ou chave",
				style: "width:100%;margin-bottom:6px"
			});
			search.value = ed.filter;
			const list = el("div", { class: "hmi-ed-layers" });
			const fill = () => {
				list.innerHTML = "";
				const q = plain(ed.filter).trim();
				const rows = onScreen().reverse().filter((m) => !q || plain(layerName(m) + " " + m.key + " " + m.type).includes(q));
				if (!rows.length) list.appendChild(el("div", { class: "hmi-ed-hint" }, onScreen().length ? "Nada encontrado." : "A tela está vazia."));
				for (const m of rows) {
					const row = el("div", {
						class: "hmi-ed-layer" + (ed.multi.includes(m.id) ? " hmi-ed-on" : "") + (ed.hidden.has(m.id) ? " hmi-ed-off" : ""),
						"data-layer": m.id
					});
					const eye = el("button", {
						type: "button",
						class: "hmi-ed-lbtn" + (ed.hidden.has(m.id) ? "" : " hmi-ed-on"),
						title: "Mostrar / esconder só no editor"
					}, "👁");
					eye.addEventListener("click", (e) => {
						e.stopPropagation();
						if (ed.hidden.has(m.id)) ed.hidden.delete(m.id);
						else ed.hidden.add(m.id);
						draw();
						fill();
					});
					const lock = el("button", {
						type: "button",
						class: "hmi-ed-lbtn" + (m.locked ? " hmi-ed-on" : ""),
						title: m.locked ? "Destravar" : "Travar"
					}, m.locked ? "🔒" : "🔓");
					lock.addEventListener("click", (e) => {
						e.stopPropagation();
						if (m.locked) delete m.locked;
						else m.locked = true;
						draw();
						fill();
						changed();
					});
					const name = el("span", {
						class: "hmi-ed-lname",
						title: layerName(m)
					}, layerName(m));
					row.appendChild(eye);
					row.appendChild(lock);
					row.appendChild(name);
					if (m.key) row.appendChild(el("span", { class: "hmi-ed-lkey" }, m.key));
					row.addEventListener("click", (e) => {
						if (e.shiftKey || e.ctrlKey || e.metaKey) select(ed.multi.includes(m.id) ? ed.multi.filter((x) => x !== m.id) : [...ed.multi, m.id], m.id);
						else select([m.id]);
						draw();
						fill();
					});
					row.addEventListener("dblclick", () => {
						select([m.id]);
						ed.panel = "props";
						refresh();
					});
					list.appendChild(row);
				}
			};
			search.addEventListener("input", () => {
				ed.filter = search.value;
				fill();
			});
			search.addEventListener("keydown", (e) => e.stopPropagation());
			props.appendChild(search);
			props.appendChild(list);
			props.appendChild(el("div", {
				class: "hmi-ed-hint",
				style: "margin-top:8px"
			}, "Clique seleciona (Shift soma). Duplo clique abre as propriedades. 🔒 trava na tela; 👁 esconde só aqui no editor."));
			fill();
		}
		function setLocked(on) {
			for (const m of selection()) if (on) m.locked = true;
			else delete m.locked;
			refresh();
			changed();
		}
		function zoomBy(k, at) {
			const v = view();
			const z = Math.max(1, Math.min(8, ed.zoom * k));
			const c = at || {
				x: ed.pan.x + v.w / ed.zoom / 2,
				y: ed.pan.y + v.h / ed.zoom / 2
			};
			const fx = (c.x - ed.pan.x) / (v.w / ed.zoom);
			const fy = (c.y - ed.pan.y) / (v.h / ed.zoom);
			ed.zoom = z;
			ed.pan = {
				x: c.x - fx * v.w / z,
				y: c.y - fy * v.h / z
			};
			draw();
		}
		const unitsPerPx = () => view().w / ed.zoom / Math.max(1, svg.getBoundingClientRect().width);
		function guideSnap(b0, dx, dy, moving) {
			const v = view();
			const tol = 6 * unitsPerPx();
			const xs = [
				0,
				v.w / 2,
				v.w
			];
			const ys = [
				0,
				v.h / 2,
				v.h
			];
			for (const m of ed.symbols) {
				if (moving.has(m.id) || ed.hidden.has(m.id) || !here(m)) continue;
				const b = box(m);
				xs.push(b.x, b.x + b.w / 2, b.x + b.w);
				ys.push(b.y, b.y + b.h / 2, b.y + b.h);
			}
			const best = (edges, targets, d) => {
				let hit = null;
				for (const e of edges) for (const t of targets) {
					const diff = t - (e + d);
					if (Math.abs(diff) <= tol && (!hit || Math.abs(diff) < Math.abs(hit.diff))) hit = {
						diff,
						t
					};
				}
				return hit;
			};
			const hx = best([
				b0.x,
				b0.x + b0.w / 2,
				b0.x + b0.w
			], xs, dx);
			const hy = best([
				b0.y,
				b0.y + b0.h / 2,
				b0.y + b0.h
			], ys, dy);
			const guides = [];
			if (hx) {
				dx += hx.diff;
				guides.push({ x: hx.t });
			}
			if (hy) {
				dy += hy.diff;
				guides.push({ y: hy.t });
			}
			return {
				dx: Math.round(dx),
				dy: Math.round(dy),
				guides,
				hx: !!hx,
				hy: !!hy
			};
		}
		function add(type, cx, cy, variant) {
			if (!SYMBOLS[type]) return;
			const s = createSymbol(type, 0, 0, isFinite(variant) ? variant : -1);
			s.x = snap(cx - s.w / 2);
			s.y = snap(cy - s.h / 2);
			if (ed.screens.length) s.screen = ed.screen;
			ed.symbols.push(s);
			select([s.id]);
			refresh();
			changed();
		}
		function remove() {
			if (!ed.multi.length) return;
			const gone = ed.multi.filter((id) => !(ed.symbols.find((m) => m.id === id) || {}).locked);
			if (!gone.length) {
				msg.textContent = "Símbolo travado: destrave para excluir.";
				return;
			}
			ed.symbols = ed.symbols.filter((s) => !gone.includes(s.id));
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
				delete c.locked;
				if (x.group) c.group = groups[x.group] || (groups[x.group] = newGroupId());
				if (ed.screens.length) c.screen = ed.screen;
				else delete c.screen;
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
		function turnPoints(s, fn) {
			const cx = s.x + s.w / 2;
			const cy = s.y + s.h / 2;
			s.props.points = linePoints(s).map((q) => fn(q, s.w, s.h));
			normalizeLine(s);
			s.x = Math.round(cx - s.w / 2);
			s.y = Math.round(cy - s.h / 2);
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
			const vb = def.line && sym.h <= 1 ? [
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
		function placeMenu(btn) {
			root.appendChild(menu);
			const rb = root.getBoundingClientRect();
			const bb = btn.getBoundingClientRect();
			menu.style.left = Math.max(4, Math.min(bb.left - rb.left, rb.width - menu.offsetWidth - 4)) + "px";
			menu.style.top = bb.bottom - rb.top + 4 + "px";
		}
		function openMenu(cat, btn, items) {
			menu = el("div", { class: "hmi-ed-menu" });
			if (cat) btn.classList.add("hmi-ed-open");
			const list = items || paletteItems(cat);
			if (!list.length) menu.appendChild(el("div", { class: "hmi-ed-empty" }, "Nenhum símbolo com esse nome."));
			for (const it of list) {
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
			placeMenu(btn);
		}
		const blockIcon = (b) => {
			const theme = (o.getTheme && o.getTheme()) === "classic" ? "classic" : "isa101";
			const w = Math.max(10, ...b.symbols.map((m) => box(m).x + box(m).w));
			const h = Math.max(10, ...b.symbols.map((m) => box(m).y + box(m).h));
			return "<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"hmi-root hmi-theme-" + theme + " hmi-transparent\" viewBox=\"-4 -4 " + (w + 8) + " " + (h + 28) + "\" preserveAspectRatio=\"xMidYMid meet\">" + b.symbols.map((m) => SYMBOLS[m.type] ? renderSymbol(m, m.preview !== void 0 ? m.preview : SYMBOLS[m.type].preview, {
				editor: true,
				values: {}
			}) : "").join("") + "</svg>";
		};
		function insertBlock(b, cx, cy) {
			const base = cleanBlockSymbols(b.symbols);
			if (!base.length) return;
			const params = blockParams({ symbols: base });
			const sets = [{}];
			for (const k of params) {
				const raw = window.prompt("Bloco \"" + b.name + "\": valor de {{" + k + "}}\nVários separados por vírgula colocam uma cópia para cada (ex.: M1, M2, M3)", "");
				if (raw === null) return;
				const vals = raw.split(",").map((t) => t.trim()).filter(Boolean);
				if (!vals.length) vals.push("");
				while (sets.length < vals.length) sets.push({ ...sets[0] });
				sets.forEach((st, i) => {
					st[k] = vals[Math.min(i, vals.length - 1)];
				});
			}
			const w = Math.max(...base.map((m) => box(m).x + box(m).w));
			const h = Math.max(...base.map((m) => box(m).y + box(m).h));
			const total = sets.length * w + (sets.length - 1) * 20;
			const oy = snap(cy - h / 2) - 20;
			sets.forEach((st, i) => {
				const syms = params.length ? fillBlock({ symbols: base }, st) : base;
				const ox = snap(cx - total / 2 + i * (w + 20)) - 20;
				const out = paste(syms.map((m) => ({
					...clone(m),
					x: m.x + ox,
					y: m.y + oy
				})));
				if (out && out.length > 1 && !out.some((m) => m.group)) group();
			});
			if (sets.length > 1) msg.textContent = sets.length + " cópias do bloco colocadas.";
		}
		function openBlocks(btn) {
			menu = el("div", { class: "hmi-ed-menu" });
			btn.classList.add("hmi-ed-open");
			const blocks = loadBlocks();
			const row = el("div", { class: "hmi-ed-menurow" });
			const name = el("input", {
				type: "text",
				placeholder: "Nome do bloco (ex.: Motor com tag)"
			});
			name.addEventListener("keydown", (e) => {
				e.stopPropagation();
				if (e.key === "Enter") saveSel();
			});
			const param = el("input", {
				type: "text",
				placeholder: "Parte que muda (ex.: M1)",
				title: "Opcional: o trecho das chaves e textos que muda de uma cópia para outra. Vira {{tag}} e é perguntado ao colocar o bloco.",
				style: "width:150px"
			});
			param.addEventListener("keydown", (e) => {
				e.stopPropagation();
				if (e.key === "Enter") saveSel();
			});
			const mini = (label, title, fn, disabled) => {
				const b = el("button", {
					type: "button",
					class: btnClass + " hmi-ed-small",
					title
				}, label);
				if (disabled) b.disabled = true;
				b.addEventListener("click", fn);
				row.appendChild(b);
			};
			const saveSel = () => {
				const sel = selection();
				if (!sel.length) return;
				blocks.push(makeBlock(name.value.trim() || "Bloco " + (blocks.length + 1), sel, param.value));
				msg.textContent = saveBlocks(blocks) ? "Bloco salvo." : "Não deu para salvar (memória do navegador cheia?).";
				closeMenu();
			};
			if (ed.multi.length) {
				row.appendChild(name);
				row.appendChild(param);
			}
			mini("Salvar seleção", ed.multi.length ? "Guarda os símbolos selecionados como um bloco" : "Selecione os símbolos primeiro", saveSel, !ed.multi.length);
			mini("Exportar", "Baixa todos os blocos num arquivo .json", () => {
				const a = el("a", {
					download: "blocos-ihm.json",
					href: URL.createObjectURL(new Blob([JSON.stringify({ hmiBlocks: blocks }, null, 1)], { type: "application/json" }))
				});
				document.body.appendChild(a);
				a.click();
				a.remove();
			}, !blocks.length);
			const file = el("input", {
				type: "file",
				accept: ".json,application/json",
				style: "display:none"
			});
			file.addEventListener("change", () => {
				const f = file.files && file.files[0];
				if (!f) return;
				f.text().then((t) => {
					const data = JSON.parse(t);
					const got = (Array.isArray(data) ? data : data.hmiBlocks || []).filter((b) => b && typeof b.name === "string" && Array.isArray(b.symbols)).map((b) => ({
						name: b.name.slice(0, 60),
						symbols: cleanBlockSymbols(b.symbols)
					})).filter((b) => b.symbols.length);
					msg.textContent = saveBlocks([...loadBlocks(), ...got]) ? got.length + " bloco(s) importado(s)." : "Não deu para salvar.";
				}).catch(() => {
					msg.textContent = "Arquivo de blocos inválido.";
				});
				closeMenu();
			});
			row.appendChild(file);
			mini("Importar", "Lê um arquivo .json de blocos", () => file.click());
			menu.appendChild(row);
			menu.appendChild(el("div", { class: "hmi-ed-empty hmi-ed-head" }, "Montagens prontas"));
			readyBlocks().forEach((b, i) => {
				const item = el("div", {
					class: "hmi-ed-item hmi-ed-ready",
					draggable: "true",
					title: "Arraste para a tela ou clique. Pergunta o nome ({{tag}}) usado nas chaves."
				});
				item.innerHTML = blockIcon(b);
				item.appendChild(el("span", {}, b.name));
				item.addEventListener("dragstart", (e) => {
					e.dataTransfer.setData("text/plain", "hmi-ready:" + i);
					menu.style.opacity = "0";
				});
				item.addEventListener("dragend", closeMenu);
				item.addEventListener("click", () => {
					const v = view();
					insertBlock(b, v.w / 2, v.h / 2);
					closeMenu();
				});
				menu.appendChild(item);
			});
			menu.appendChild(el("div", { class: "hmi-ed-empty hmi-ed-head" }, "Meus blocos"));
			if (!blocks.length) menu.appendChild(el("div", { class: "hmi-ed-empty" }, "Nenhum bloco salvo. Selecione símbolos e clique em Salvar seleção. Os blocos ficam neste navegador e servem em qualquer tela."));
			blocks.forEach((b, i) => {
				const item = el("div", {
					class: "hmi-ed-item",
					draggable: "true",
					title: "Arraste para a tela ou clique"
				});
				item.innerHTML = blockIcon(b);
				const ps = blockParams(b);
				item.appendChild(el("span", {}, b.name + (ps.length ? " (" + ps.map((k) => "{{" + k + "}}").join(" ") + ")" : "")));
				const del = el("button", {
					type: "button",
					class: "hmi-ed-del",
					title: "Apagar o bloco"
				}, "×");
				del.addEventListener("click", (e) => {
					e.stopPropagation();
					const list = loadBlocks();
					list.splice(i, 1);
					saveBlocks(list);
					closeMenu();
					openBlocks(btn);
				});
				item.appendChild(del);
				item.addEventListener("dragstart", (e) => {
					e.dataTransfer.setData("text/plain", "hmi-block:" + i);
					menu.style.opacity = "0";
				});
				item.addEventListener("dragend", closeMenu);
				item.addEventListener("click", () => {
					const v = view();
					insertBlock(b, v.w / 2, v.h / 2);
					closeMenu();
				});
				menu.appendChild(item);
			});
			placeMenu(btn);
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
		const blocksBtn = el("button", {
			type: "button",
			class: btnClass + " hmi-ed-cat",
			title: "Conjuntos de símbolos salvos para usar em outras telas"
		}, "Blocos ▾");
		blocksBtn.addEventListener("click", (e) => {
			e.stopPropagation();
			const same = blocksBtn.classList.contains("hmi-ed-open");
			closeMenu();
			if (!same) openBlocks(blocksBtn);
		});
		palette.appendChild(blocksBtn);
		const search = el("input", {
			type: "search",
			class: "hmi-ed-search",
			placeholder: "Buscar símbolo…",
			title: "Busca pelo nome em todas as categorias. Enter coloca o primeiro."
		});
		search.addEventListener("input", () => {
			closeMenu();
			if (search.value.trim()) openMenu(null, search, searchPalette(search.value));
		});
		search.addEventListener("keydown", (e) => {
			e.stopPropagation();
			if (e.key === "Escape") {
				search.value = "";
				closeMenu();
			}
			if (e.key === "Enter") {
				const first = searchPalette(search.value)[0];
				if (first) {
					const v = view();
					add(first.type, v.w / 2, v.h / 2, first.variant);
					closeMenu();
					search.value = "";
				}
			}
		});
		palette.appendChild(search);
		const outside = (e) => {
			if (menu && !menu.contains(e.target) && !e.target.closest(".hmi-ed-cat, .hmi-ed-search")) closeMenu();
		};
		document.addEventListener("pointerdown", outside, true);
		stage.addEventListener("dragover", (e) => {
			e.preventDefault();
		});
		stage.addEventListener("drop", (e) => {
			const data = e.dataTransfer.getData("text/plain") || "";
			if (data.startsWith("hmi-ready:")) {
				e.preventDefault();
				const b = readyBlocks()[Number(data.slice(10))];
				const p = toSvg(e);
				if (b) insertBlock(b, p.x, p.y);
				return;
			}
			if (data.startsWith("hmi-block:")) {
				e.preventDefault();
				const b = loadBlocks()[Number(data.slice(10))];
				const p = toSvg(e);
				if (b) insertBlock(b, p.x, p.y);
				return;
			}
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
		let spaceDown = false;
		svg.addEventListener("pointerdown", (e) => {
			stage.focus();
			const p = toSvg(e);
			if (e.button === 1 || spaceDown && e.button === 0) {
				ed.drag = {
					mode: "pan",
					cx: e.clientX,
					cy: e.clientY,
					pan: { ...ed.pan },
					upp: unitsPerPx()
				};
				svg.setPointerCapture(e.pointerId);
				e.preventDefault();
				return;
			}
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
					h: s.h,
					pts: SYMBOLS[s.type].line ? linePoints(s) : null
				};
			} else {
				let g = e.target.closest(".hmi-symbol");
				if (g && (ed.symbols.find((m) => m.id === g.getAttribute("data-id")) || {}).locked) g = null;
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
					const orig = selection().filter((m) => !m.locked).map((m) => ({
						m,
						x: m.x,
						y: m.y
					}));
					const bs = orig.map((q) => box(q.m));
					const b0 = bs.length ? {
						x: Math.min(...bs.map((b) => b.x)),
						y: Math.min(...bs.map((b) => b.y))
					} : null;
					if (b0) {
						b0.w = Math.max(...bs.map((b) => b.x + b.w)) - b0.x;
						b0.h = Math.max(...bs.map((b) => b.y + b.h)) - b0.y;
					}
					ed.drag = {
						mode: "move",
						start: p,
						narrow,
						id,
						orig,
						b0,
						ids: new Set(orig.map((q) => q.m.id))
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
			if (d.mode === "pan") {
				ed.pan = {
					x: d.pan.x - (e.clientX - d.cx) * d.upp,
					y: d.pan.y - (e.clientY - d.cy) * d.upp
				};
				draw();
				return;
			}
			const p = toSvg(e);
			if (d.mode === "box") {
				d.cur = p;
				const r = marquee(d);
				const hits = ed.symbols.filter((m) => {
					if (m.locked || ed.hidden.has(m.id) || !here(m)) return false;
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
				let dx = snap(lead.x + p.x - d.start.x) - lead.x;
				let dy = snap(lead.y + p.y - d.start.y) - lead.y;
				ed.guides = [];
				if (guideBox.checked && d.b0 && !e.altKey) {
					const g = guideSnap(d.b0, p.x - d.start.x, p.y - d.start.y, d.ids);
					if (g.hx) dx = g.dx;
					if (g.hy) dy = g.dy;
					ed.guides = g.guides;
				}
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
			} else {
				resize(s, d, p, e.shiftKey);
				if (d.pts) s.props.points = d.pts.map((q) => [Math.round(q[0] * s.w / Math.max(1, d.w)), Math.round(q[1] * s.h / Math.max(1, d.h))]);
			}
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
			if ((ed.drag.mode === "point" || ed.drag.mode === "size" && ed.drag.pts) && s) normalizeLine(s);
			ed.drag = null;
			ed.guides = [];
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
					select(onScreen().map((m) => m.id));
					refresh();
				} else if (k === "g" && e.shiftKey) ungroup();
				else if (k === "g") group();
				else if (k === "l" && ed.multi.length) setLocked(!selection().every((m) => m.locked));
				else if (k === "0") {
					ed.zoom = 1;
					ed.pan = {
						x: 0,
						y: 0
					};
					draw();
				} else if (k === "=" || k === "+") zoomBy(1.25);
				else if (k === "-") zoomBy(1 / 1.25);
				else return;
				e.preventDefault();
				e.stopPropagation();
				return;
			}
			if (e.key === " ") {
				spaceDown = true;
				stage.style.cursor = "grab";
				e.preventDefault();
				return;
			}
			const list = selection().filter((m) => !m.locked);
			if (!list.length && e.key !== "Escape") return;
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
		stage.addEventListener("keyup", (e) => {
			if (e.key === " ") {
				spaceDown = false;
				stage.style.cursor = "";
			}
		});
		stage.addEventListener("wheel", (e) => {
			if (e.ctrlKey || e.metaKey) {
				e.preventDefault();
				zoomBy(e.deltaY < 0 ? 1.15 : 1 / 1.15, toSvg(e));
			} else if (ed.zoom > 1) {
				e.preventDefault();
				const upp = unitsPerPx();
				ed.pan = {
					x: ed.pan.x + (e.shiftKey ? e.deltaY : e.deltaX) * upp,
					y: ed.pan.y + (e.shiftKey ? 0 : e.deltaY) * upp
				};
				draw();
			}
		}, { passive: false });
		gridBox.addEventListener("change", draw);
		Object.assign(api, {
			getSymbols: () => {
				if (ed.screens.length) pinScreens();
				return clone(ed.symbols);
			},
			getScreens: () => [...ed.screens],
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
		showScreens();
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
	exports.cleanSvg = cleanSvg;
	exports.createEditor = createEditor;
	exports.createSymbol = createSymbol;
	exports.durText = durText;
	exports.escapeXml = escapeXml;
	exports.fillKeys = fillKeys;
	exports.formatValue = formatValue;
	exports.injectStyles = injectStyles;
	exports.interlockOf = interlockOf;
	exports.isOn = isOn;
	exports.linePoints = linePoints;
	exports.onState = onState;
	exports.paletteItems = paletteItems;
	exports.parseBinds = parseBinds;
	exports.parseColumns = parseColumns;
	exports.parsePreview = parsePreview;
	exports.parseStates = parseStates;
	exports.parseSvg = parseSvg;
	exports.phoneLayout = phoneLayout;
	exports.rangeState = rangeState;
	exports.renderOverlay = renderOverlay;
	exports.renderSymbol = renderSymbol;
	exports.ruleEffects = ruleEffects;
	exports.ruleMatch = ruleMatch;
	exports.safeImageSrc = safeImageSrc;
	exports.scaleValue = scaleValue;
	exports.stateOf = stateOf;
	exports.timeOf = timeOf;
	exports.timelinePieces = timelinePieces;
	exports.timelineWindow = timelineWindow;
	exports.unscaleValue = unscaleValue;
	exports.valueFor = valueFor;
	return exports;
})({});
