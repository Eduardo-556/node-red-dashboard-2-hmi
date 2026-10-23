<template>
    <div class="hmi-canvas-wrapper">
        <div v-if="showNav" :class="['hmi-screen-nav', 'hmi-nav-' + theme]">
            <button v-for="n in tabScreens" :key="n" type="button" :class="['hmi-screen-tab', { 'hmi-screen-on': n === current }]" @click="openScreen(n)">{{ n }}</button>
        </div>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            :class="['hmi-root', 'hmi-theme-' + theme, 'hmi-anim-' + anim, { 'hmi-offline': offline, 'hmi-transparent': transparent, 'hmi-bg-dashboard': cfg('background') === 'dashboard', 'hmi-disabled': disabled }]"
            :style="svgStyle"
            :viewBox="'0 0 ' + viewW + ' ' + viewH"
            preserveAspectRatio="xMidYMid meet"
        >
            <rect class="hmi-bg" x="0" y="0" :width="viewW" :height="viewH" />
            <g
                v-for="s in shown"
                :key="s.id"
                :class="[{ 'hmi-clickable': clickable(s), 'hmi-pressed': pressed === s.id }, qualityClass(s)]"
                @click="click(s, $event)"
                @pointerdown="press(s, $event)"
                @pointerup="release(s)"
                @pointerleave="release(s)"
                @pointercancel="release(s)"
                @contextmenu.prevent="longPress(s)"
                v-html="draw(s)"
            />
            <g class="hmi-overlays" v-html="overlays" />
            <g class="hmi-offline-banner">
                <rect :x="viewW / 2 - 170" y="16" width="340" height="40" rx="6" />
                <text :x="viewW / 2" y="37">SEM COMUNICAÇÃO</text>
            </g>
        </svg>
        <div v-if="editing" ref="editor" class="hmi-ed-full" />
        <div v-if="faceplate" :class="['hmi-fp-back', 'hmi-fp-' + theme]" @click.self="faceplate = null">
            <div class="hmi-fp" role="dialog">
                <div class="hmi-fp-head">
                    <span>{{ fp.name }}</span>
                    <button type="button" class="hmi-fp-x" title="Fechar" @click="faceplate = null">×</button>
                </div>
                <div class="hmi-fp-rows">
                    <div class="hmi-fp-row"><span>Estado</span><b :class="'hmi-fp-st-' + fp.stateCls">{{ fp.state }}</b></div>
                    <div v-for="r in fp.rows" :key="r[0]" class="hmi-fp-row"><span>{{ r[0] }}</span><b>{{ r[1] }}</b></div>
                </div>
                <div v-if="fp.pid" class="hmi-fp-pid">
                    <div class="hmi-fp-bar">
                        <div class="hmi-fp-bar-pv" :style="{ width: fp.pid.pv + '%' }" />
                        <div v-if="fp.pid.sp !== null" class="hmi-fp-bar-sp" :style="{ left: fp.pid.sp + '%' }" />
                    </div>
                    <div class="hmi-fp-scale"><span>{{ fp.pid.min }}</span><span>{{ fp.pid.max }}</span></div>
                </div>
                <div v-if="fp.alarms.length" class="hmi-fp-alarms">
                    <div class="hmi-fp-sub">Alarmes</div>
                    <div v-for="a in fp.alarms" :key="a.id" :class="['hmi-fp-alarm', 'hmi-fp-p' + a.priority, { 'hmi-fp-unacked': !a.acked }]">
                        <span>{{ a.text }}</span><small>{{ a.active ? (a.acked ? 'RECONHECIDO' : 'ATIVO') : 'NORMAL' }}</small>
                    </div>
                    <button v-if="fp.unacked && perm.ack" type="button" class="hmi-fp-btn" @click="ack('symbol:' + faceplate.id)">Reconhecer</button>
                </div>
                <div v-if="fp.blocked" class="hmi-fp-blocked">Bloqueado: {{ fp.blocked }}</div>
                <div v-if="fp.buttons.length && canCommand" class="hmi-fp-cmds">
                    <button v-for="b in fp.buttons" :key="b[0]" type="button" :class="['hmi-fp-btn', 'hmi-fp-' + b[0]]" @click="fpCommand(faceplate, b[0], b[1])">{{ b[1] }}</button>
                </div>
                <div v-else-if="fp.buttons.length" class="hmi-fp-blocked">{{ disabled ? 'Comandos desligados nesta tela' : 'Sem permissão para comandar' }}</div>
            </div>
        </div>
        <div v-if="keypad" :class="['hmi-fp-back', 'hmi-fp-' + theme]" @click.self="keyDone(null)">
            <form class="hmi-fp hmi-kp" @submit.prevent="keyDone(keypad.text)">
                <div class="hmi-fp-head"><span>{{ keypad.title }}</span></div>
                <div v-if="keypad.hint" class="hmi-kp-hint">{{ keypad.hint }}</div>
                <input ref="kp" v-model="keypad.text" class="hmi-kp-display" :type="keypad.secret ? 'password' : 'text'" :inputmode="keypad.secret ? 'numeric' : 'decimal'" autocomplete="off">
                <div class="hmi-kp-keys">
                    <button v-for="k in keypadKeys" :key="k" type="button" :class="['hmi-kp-key', { 'hmi-kp-fn': isNaN(Number(k)) }]" @click="keyPress(k)">{{ k }}</button>
                </div>
                <div class="hmi-fp-cmds">
                    <button type="button" class="hmi-fp-btn" @click="keyDone(null)">Cancelar</button>
                    <button type="submit" class="hmi-fp-btn hmi-fp-on">OK</button>
                </div>
            </form>
        </div>
        <div v-if="notice" class="hmi-notice">{{ notice }}</div>
    </div>
</template>

<script>
import { createEditor, isPhoneScreen, phoneScreenOf, contentHeight } from '../editor/index.js'
import { injectStyles, renderSymbol, renderOverlay, interlockOf, valueFor, onState, formatValue, isOn, scaleValue } from '../symbols/index.js'

// same as nodes/trend.js: at most this many samples per trend window
const TREND_POINTS = 1500

function authHeaders () {
    const headers = {}
    try {
        const t = JSON.parse(localStorage.getItem('auth-tokens') || 'null')
        if (t && t.access_token) headers.Authorization = (t.token_type || 'Bearer') + ' ' + t.access_token
    } catch (e) {}
    return headers
}

// the save address comes from the link the Node-RED editor opened: only a path
// on this same server, so a crafted link cannot send the editor token elsewhere
function adminPath (text) {
    const t = String(text || '')
    return /^\/(?!\/)[A-Za-z0-9_\-./]*$/.test(t) && !t.includes('..') ? t : '/hmi-canvas/'
}

export default {
    name: 'UIHmiCanvas',
    inject: ['$socket', '$dataTracker'],
    props: {
        /* do not remove entries from this - Dashboard's Layout Manager's will pass this data to your component */
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) },
        state: { type: Object, default: () => ({}) }
    },
    data () {
        return {
            values: {},
            alarms: null,
            alarmHist: [],
            quality: {},
            stamps: {},
            pending: {},
            srvOffset: 0,
            // what the node says this user may do, and settings changed with msg.ui_update
            perm: { cmd: true, ack: true, shelve: true },
            user: '',
            dyn: {},
            armed: {},
            flash: null,
            flashTimer: null,
            ui: {},
            faceplate: null,
            keypad: null,
            muted: false,
            audio: null,
            seenAlarms: null,
            lastBeep: 0,
            notice: '',
            noticeTimer: null,
            lastUpdate: 0,
            now: Date.now(),
            timer: null,
            beat: null,
            fitHeight: 0,
            winW: typeof window !== 'undefined' ? window.innerWidth : 1280,
            // page elements painted by pageBg, with their style before
            painted: [],
            // screen open on this page (several screens in one canvas)
            screen: '',
            edit: null,
            editor: null,
            pressed: null,
            history: {}
        }
    },
    computed: {
        symbols () { return Array.isArray(this.props.symbols) ? this.props.symbols : [] },
        screens () {
            const out = []
            for (const n of Array.isArray(this.props.screens) ? this.props.screens : []) if (typeof n === 'string' && n && !out.includes(n)) out.push(n)
            return out
        },
        // phone versions ("<name> · celular") are not tabs: they replace <name> on a narrow window
        tabScreens () { return this.screens.filter(n => !isPhoneScreen(n)) },
        current () {
            const s = isPhoneScreen(this.screen) ? this.screen.slice(0, -phoneScreenOf('').length) : this.screen
            return this.tabScreens.includes(s) ? s : (this.tabScreens[0] || '')
        },
        phone () { return !this.editing && this.winW <= (Number(this.cfg('phoneAt')) || 700) },
        // the screen drawn now: the phone version of the current one, when there is one
        displayed () {
            const p = phoneScreenOf(this.current)
            return this.phone && this.screens.includes(p) ? p : this.current
        },
        onPhone () { return isPhoneScreen(this.displayed) },
        // the symbols of the screen open now
        shown () {
            if (this.screens.length < 2) return this.symbols
            const first = this.screens[0]
            return this.symbols.filter(s => ((s.screen && this.screens.includes(s.screen)) ? s.screen : first) === this.displayed)
        },
        showNav () { return !this.editing && this.tabScreens.length > 1 && this.cfg('screenNav') !== 'none' },
        flowScreen () { return this.cfg('screen') },
        anim () { return ['classic', 'never'].includes(this.cfg('animate')) ? this.cfg('animate') : 'always' },
        viewW () { return this.onPhone ? (Number(this.cfg('phoneW')) || 400) : (Number(this.cfg('viewW')) || 1280) },
        // a phone screen is as tall as its symbols: it scrolls down
        viewH () { return this.onPhone ? Math.max(200, contentHeight(this.shown) + 12) : (Number(this.cfg('viewH')) || 720) },
        theme () { return this.cfg('theme') === 'classic' ? 'classic' : 'isa101' },
        transparent () { return this.cfg('background') === 'transparent' },
        // repaint the page when one of these changes
        pageBgKey () { return [this.cfg('pageBg'), this.cfg('background'), this.theme, this.cfg('scope')].join('|') },
        editing () { return !!this.edit },
        // msg.enabled = false from the flow turns the commands off
        disabled () { return !!(this.state && this.state.enabled === false) || this.dyn.enabled === false },
        canCommand () { return !this.disabled && this.perm.cmd !== false },
        keypadKeys () { return this.keypad && this.keypad.secret ? ['7', '8', '9', '4', '5', '6', '1', '2', '3', 'C', '0', '⌫'] : ['7', '8', '9', '4', '5', '6', '1', '2', '3', '±', '0', ',', 'C', '⌫'] },
        // keys drawn by trend symbols and the longest window they need, in ms
        trendKeys () {
            const out = {}
            for (const s of this.symbols) {
                if (s.type === 'trend' && s.key) out[s.key] = Math.max(out[s.key] || 0, Math.max(5, Math.min(3600, Number(s.props && s.props.window) || 60)) * 1000)
            }
            return out
        },
        offline () {
            const s = Number(this.cfg('offlineAfter')) || 0
            return s > 0 && this.lastUpdate > 0 && (this.now - this.lastUpdate) > s * 1000
        },
        // alarm, quality, pending and interlock marks on top of the symbols
        overlays () {
            if (this.editing) return ''
            const stale = (Number(this.cfg('staleAfter')) || 0) * 1000
            const srvNow = this.now - this.srvOffset
            const bySym = {}
            const order = { 1: 0, 2: 1, 3: 2 }
            for (const a of (this.alarms && this.alarms.active) || []) {
                const cur = bySym[a.symbolId]
                const pr = String(a.priority || '2')
                bySym[a.symbolId] = {
                    priority: !cur || (order[pr] ?? 3) < (order[cur.priority] ?? 3) ? pr : cur.priority,
                    unacked: (cur && cur.unacked) || !a.acked
                }
            }
            let out = ''
            for (const s of this.shown) {
                const st = {}
                let any = false
                if (bySym[s.id]) { st.alarm = bySym[s.id]; any = true }
                const q = this.qualityOf(s, stale, srvNow)
                if (q) { st.quality = q; any = true }
                if (this.pending[s.id]) { st.pending = this.pending[s.id]; any = true }
                if (s.action && s.action.interlock && interlockOf(s.action, this.values)) { st.locked = true; any = true }
                if (this.flash === s.id) { st.flash = true; any = true }
                if (any) out += renderOverlay(s, st)
            }
            return out
        },
        // what the faceplate window shows for the symbol it was opened on
        fp () {
            const s = this.faceplate
            if (!s) return null
            const p = s.props || {}
            const a = s.action || {}
            const v = this.values
            const raw = s.key ? valueFor(s, v) : undefined
            const on = s.key ? onState(raw, p) : null
            const fault = p.faultKey ? isOn(v[p.faultKey], 'nonzero') === true : false
            const fmt = (x, unit) => formatValue(x, undefined, this.cfg('locale')) + (unit ? ' ' + unit : '')
            const rows = []
            if (s.key && on === null && raw !== undefined) rows.push(['Valor', fmt(raw, p.unit)])
            if (a.valueKey) rows.push(['Valor', fmt(v[a.valueKey], a.valueUnit)])
            // regulator (PID): process value, setpoint and output
            let pid = null
            if (a.pvKey) rows.push(['PV (medido)', fmt(v[a.pvKey], a.pidUnit)])
            if (a.spKey) rows.push(['SP (desejado)', fmt(v[a.spKey], a.pidUnit)])
            if (a.opKey) rows.push(['Saída (MV)', fmt(v[a.opKey], '%')])
            if (a.pvKey) {
                const lo = Number(a.spMin) || 0
                const hi = a.spMax !== undefined && a.spMax !== '' && isFinite(Number(a.spMax)) ? Number(a.spMax) : 100
                const pct = x => { const n = Number(x); return isFinite(n) && hi > lo ? Math.max(0, Math.min(100, (n - lo) / (hi - lo) * 100)) : 0 }
                pid = { pv: pct(v[a.pvKey]), sp: a.spKey && isFinite(Number(v[a.spKey])) ? pct(v[a.spKey]) : null, min: lo, max: hi }
            }
            if (a.modeKey) {
                const texts = {}
                for (const part of String(a.modeTexts || '0=MANUAL,1=AUTO').split(',')) { const i = part.indexOf('='); if (i > 0) texts[part.slice(0, i).trim()] = part.slice(i + 1).trim() }
                const m = v[a.modeKey]
                const k = typeof m === 'boolean' ? (m ? '1' : '0') : String(m)
                rows.push(['Modo', m === undefined ? '—' : (texts[k] !== undefined ? texts[k] : k)])
            }
            if (a.hoursKey) rows.push(['Horas', fmt(v[a.hoursKey], 'h')])
            if (a.startsKey) rows.push(['Partidas', fmt(v[a.startsKey])])
            const alarms = ((this.alarms && this.alarms.active) || []).filter(x => x.symbolId === s.id)
            const buttons = [['on', 'Ligar'], ['off', 'Desligar'], ['reset', 'Reset']].filter(b => a[b[0] + 'Topic'])
            if (a.modeTopic) buttons.push(['auto', 'Auto'], ['man', 'Manual'])
            if (a.spTopic) buttons.push(['sp', 'Alterar SP'])
            if (a.opTopic) buttons.push(['op', 'Saída manual'])
            return {
                name: p.label || p.title || p.text || s.key || s.type,
                state: fault ? 'FALHA' : (on === null ? '—' : (on ? 'LIGADO' : 'DESLIGADO')),
                stateCls: fault ? 'fault' : (on ? 'on' : 'off'),
                rows,
                pid,
                alarms,
                unacked: alarms.some(x => !x.acked),
                blocked: interlockOf(a, v),
                buttons
            }
        },
        svgStyle () {
            return this.cfg('fit') === 'screen' && !this.onPhone && this.fitHeight > 0 ? { height: this.fitHeight + 'px' } : {}
        }
    },
    watch: {
        // the flow can open a screen: msg.ui_update = { screen: "Alarmes" }
        flowScreen (v) { if (typeof v === 'string' && v) this.screen = v },
        showNav () { this.$nextTick(this.fit) },
        onPhone () { this.$nextTick(this.fit) },
        pageBgKey () { this.$nextTick(this.paintPage) }
    },
    created () {
        if (typeof this.cfg('screen') === 'string') this.screen = this.cfg('screen')
        injectStyles()
        this.$dataTracker(this.id, this.onInput, this.onLoad)
        const q = new URLSearchParams(window.location.search)
        if (q.get('hmi-canvas') === this.id && q.get('hmi-edit')) {
            this.edit = { key: q.get('hmi-edit'), admin: adminPath(q.get('hmi-admin')) }
            // the key stays in memory only, not in the address bar or the browser history
            try { window.history.replaceState(window.history.state, '', window.location.pathname) } catch (e) {}
        }
    },
    mounted () {
        try { this.muted = localStorage.getItem('hmi-alarm-mute') === '1' } catch (e) {}
        this.timer = setInterval(() => {
            this.now = Date.now()
            if (this.cfg('alarmSound') === 'repeat' && this.alarms && this.alarms.unacked > 0 && this.now - this.lastBeep >= 10000) this.beep()
        }, 1000)
        // browsers only play sound after the page was touched once
        this.unlockAudio = () => {
            const snd = this.cfg('alarmSound')
            if (!snd || snd === 'off') return
            try {
                const C = window.AudioContext || window.webkitAudioContext
                this.audio = this.audio || new C()
                if (this.audio.state === 'suspended') this.audio.resume()
            } catch (e) {}
        }
        // a held button is let go when the page goes to the background
        this.letGo = () => { if (this.pressed) this.release({ id: this.pressed }) }
        this.onHide = () => { if (document.hidden) this.letGo() }
        window.addEventListener('pointerdown', this.unlockAudio)
        window.addEventListener('resize', this.fit)
        window.addEventListener('blur', this.letGo)
        document.addEventListener('visibilitychange', this.onHide)
        this.$nextTick(this.fit)
        this.$nextTick(this.paintPage)
        if (this.editing) this.$nextTick(this.openEditor)
    },
    unmounted () {
        this.letGo()
        this.unpaintPage()
        clearInterval(this.timer)
        clearInterval(this.beat)
        window.removeEventListener('resize', this.fit)
        window.removeEventListener('pointerdown', this.unlockAudio)
        window.removeEventListener('blur', this.letGo)
        document.removeEventListener('visibilitychange', this.onHide)
        if (this.editor) this.editor.destroy()
    },
    methods: {
        // a setting: changed by msg.ui_update, else the node's config
        cfg (k) {
            if (this.dyn[k] !== undefined) return this.dyn[k]
            if (this.state && this.state[k] !== undefined && !['enabled', 'visible', 'class'].includes(k)) return this.state[k]
            return this.props[k]
        },
        // Canvas on the whole page: paint the page behind it, so a site style
        // (white page, background image) does not show around the canvas.
        paintPage () {
            this.unpaintPage()
            const mode = this.cfg('pageBg')
            if (!mode || this.cfg('scope') === 'group' || !this.$el || !this.$el.closest || this.$el.closest('.nrdb-ui-group')) return
            let color = mode
            if (mode === 'canvas') {
                const bg = this.$el.querySelector('rect.hmi-bg')
                color = bg ? getComputedStyle(bg).fill : ''
                if (!color || color === 'none' || /rgba\(.*,\s*0\)$/.test(color) || color === 'transparent') return
            }
            if (!/^(#[0-9a-f]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)|[a-z]+)$/i.test(String(color).trim())) return
            const seen = new Set()
            this.painted = []
            for (const sel of ['.nrdb-ui-page', '.v-main', '.v-application']) {
                const el = this.$el.closest(sel)
                if (!el || seen.has(el)) continue
                seen.add(el)
                this.painted.push({ el, style: el.getAttribute('style') })
                el.style.setProperty('background-color', color, 'important')
                el.style.setProperty('background-image', 'none', 'important')
            }
        },
        unpaintPage () {
            for (const p of this.painted || []) {
                if (p.style === null) p.el.removeAttribute('style')
                else p.el.setAttribute('style', p.style)
            }
            this.painted = []
        },
        fit () {
            if (typeof window !== 'undefined') this.winW = window.innerWidth
            if (this.cfg('fit') !== 'screen' || !this.$el || !this.$el.getBoundingClientRect) return
            const svg = this.$el.querySelector('svg.hmi-root') || this.$el
            const top = svg.getBoundingClientRect().top + window.scrollY
            this.fitHeight = Math.max(200, window.innerHeight - top - 12)
        },
        apply (msg) {
            if (!msg || typeof msg !== 'object') return
            if (msg._hmiPrivate) this.privateMsg(msg._hmiPrivate)
            if (msg.ui_update && typeof msg.ui_update === 'object') this.dyn = { ...this.dyn, ...msg.ui_update }
            if (msg.enabled !== undefined) this.dyn = { ...this.dyn, enabled: msg.enabled }
            if (msg.payload && typeof msg.payload === 'object') {
                this.values = { ...msg.payload }
                if (Array.isArray(msg.alarmHist)) this.alarmHist = msg.alarmHist
                if (msg.alarms) { this.alarms = msg.alarms; this.alarmSound() }
                this.quality = msg.quality && typeof msg.quality === 'object' ? msg.quality : {}
                this.stamps = msg.stamps && typeof msg.stamps === 'object' ? msg.stamps : {}
                this.pending = msg.pending && typeof msg.pending === 'object' ? msg.pending : {}
                if (isFinite(msg._hmiTs)) this.srvOffset = Date.now() - msg._hmiTs
                if (msg.trendHist && typeof msg.trendHist === 'object') this.mergeHistory(msg.trendHist)
                this.lastUpdate = Date.now()
                this.record(this.lastUpdate)
                if (this.editor) this.editor.redraw()
            }
        },
        // only for this page: what its user may do, notices, password accepted
        privateMsg (p) {
            if (p.perm && typeof p.perm === 'object') this.perm = { cmd: p.perm.cmd !== false, ack: p.perm.ack !== false, shelve: p.perm.shelve !== false }
            if (typeof p.user === 'string') this.user = p.user
            if (p.armed && p.armed.id) this.armed = { ...this.armed, [p.armed.id]: Date.now() + (Number(p.armed.ms) || 30000) - 1000 }
            if (p.notice && Date.now() - (p.ts || 0) < 10000) this.showNotice(p.notice)
        },
        qualityOf (s, stale, srvNow) {
            if (!s.key) return ''
            const q = this.quality[s.key]
            if (q === 'bad' || q === 'uncertain') return q
            if (stale > 0 && this.stamps[s.key] && srvNow - this.stamps[s.key] > stale) return 'stale'
            return ''
        },
        qualityClass (s) {
            if (this.editing) return ''
            const q = this.qualityOf(s, (Number(this.cfg('staleAfter')) || 0) * 1000, this.now - this.srvOffset)
            return q ? 'hmi-q-' + q : ''
        },
        // history kept by the node (page opened late): server samples, then what this page saw after them
        mergeHistory (server) {
            const next = { ...this.history }
            for (const k of Object.keys(server)) {
                if (!Array.isArray(server[k])) continue
                const list = server[k].filter(q => Array.isArray(q) && isFinite(q[0]) && isFinite(q[1]))
                const end = list.length ? list[list.length - 1][0] : 0
                next[k] = list.concat((this.history[k] || []).filter(q => q[0] > end))
            }
            this.history = next
        },
        // beep for alarms that were not there before (or every 10 s while unacknowledged)
        alarmSound () {
            const ids = (this.alarms.active || []).filter(a => !a.acked).map(a => a.id)
            const fresh = this.seenAlarms !== null && ids.some(id => !this.seenAlarms.includes(id))
            this.seenAlarms = ids
            if (fresh) this.beep()
        },
        beep () {
            const snd = this.cfg('alarmSound')
            if (!snd || snd === 'off' || this.muted || this.editing) return
            this.lastBeep = Date.now()
            try {
                const ctx = this.audio
                if (!ctx) return // no click on the page yet: the browser would block the sound
                if (ctx.state === 'suspended') ctx.resume()
                for (const t of [0, 0.25]) {
                    const o = ctx.createOscillator()
                    const g = ctx.createGain()
                    o.frequency.value = 880
                    g.gain.value = 0.15
                    o.connect(g)
                    g.connect(ctx.destination)
                    o.start(ctx.currentTime + t)
                    o.stop(ctx.currentTime + t + 0.15)
                }
            } catch (e) {}
        },
        // samples of the trend keys, thinned like the node does (TREND_POINTS per window)
        record (t) {
            const keys = this.trendKeys
            const next = {}
            for (const k of Object.keys(keys)) {
                const win = keys[k]
                const list = (this.history[k] || []).filter(q => q[0] >= t - win)
                const v = Number(this.values[k])
                if (this.values[k] !== undefined && this.values[k] !== null && this.values[k] !== '' && typeof this.values[k] !== 'boolean' && isFinite(v)) {
                    const step = win / TREND_POINTS
                    const n = list.length
                    if (n > 1 && t - list[n - 1][0] < step && t - list[n - 2][0] < step) list[n - 1] = [t, v]
                    else list.push([t, v])
                }
                next[k] = list.slice(-(TREND_POINTS + 2))
            }
            this.history = next
        },
        onInput (msg) { this.apply(msg) },
        onLoad (msg) { this.apply(msg) },
        draw (s) {
            const alarms = this.alarms ? { ...this.alarms, history: this.alarmHist } : { active: [], history: this.alarmHist }
            return renderSymbol(s, valueFor(s, this.values), { locale: this.cfg('locale'), values: this.values, history: this.history, now: s.type === 'trend' ? this.now : 0, alarms, ui: this.ui[s.id], sound: this.cfg('alarmSound'), muted: this.muted, perm: this.perm })
        },
        clickable (s) {
            if (this.editing) return false
            if (s.type === 'alarmList') return true
            const m = s.action && s.action.mode
            // going to another page and looking at a faceplate work for everybody
            if (m === 'page' || m === 'screen' || m === 'faceplate') return true
            return this.canCommand && ['value', 'toggle', 'pulse', 'input'].includes(m)
        },
        emit (msg) {
            this.$socket.emit('widget-action', this.id, msg)
        },
        async sendAction (s, phase, value) {
            const a = { id: s.id, phase }
            if (value !== undefined) a.value = value
            if (s.action && s.action.pin === 'yes') {
                const pin = await this.askPin((s.props && (s.props.label || s.props.text || s.props.title)) || s.key || 'Comando')
                if (pin === null) return
                a.pin = pin
            }
            this.emit({ _hmiAction: a })
        },
        ack (which) {
            this.emit({ _hmiAck: which })
        },
        click (s, e) {
            if (s.type === 'alarmList') {
                const t = e && e.target && e.target.closest ? e.target.closest('[data-hmi]') : null
                const cmd = t ? t.getAttribute('data-hmi') : ''
                if (cmd === 'mute') {
                    this.muted = !this.muted
                    try { localStorage.setItem('hmi-alarm-mute', this.muted ? '1' : '') } catch (err) {}
                } else if (cmd.startsWith('tab:')) this.ui = { ...this.ui, [s.id]: { tab: cmd.slice(4) } }
                else if (cmd.startsWith('ack:')) this.ack(cmd.slice(4))
                else if (cmd.startsWith('goto:')) this.showSymbol(cmd.slice(5))
                else if (cmd.startsWith('shelve:')) {
                    const min = Math.max(1, Number(s.props && s.props.shelveMinutes) || 30)
                    if (window.confirm('Suprimir este alarme por ' + min + ' min?')) this.emit({ _hmiShelve: { id: cmd.slice(7), minutes: min } })
                } else if (cmd.startsWith('unshelve:')) this.emit({ _hmiShelve: { id: cmd.slice(9), off: true } })
                return
            }
            if (!this.clickable(s) || !s.action || s.action.mode === 'pulse') return
            const name = (s.props && (s.props.text || s.props.label || s.props.title)) || s.key || ''
            if (s.action.mode === 'faceplate') { this.faceplate = s; return }
            if (s.action.mode === 'screen') {
                if (s.action.confirm === 'yes' && !window.confirm('Confirmar' + (name ? ': ' + name : '') + '?')) return
                return this.openScreen(s.action.value)
            }
            if (s.action.mode === 'page') {
                if (s.action.confirm === 'yes' && !window.confirm('Confirmar' + (name ? ': ' + name : '') + '?')) return
                return this.goTo(s.action.value)
            }
            const why = interlockOf(s.action, this.values)
            if (why) return this.showNotice('Bloqueado: ' + why)
            if (s.action.mode === 'input') return this.askValue(s, name)
            if (s.action.confirm === 'yes' && !window.confirm('Confirmar' + (name ? ': ' + name : '') + '?')) return
            this.sendAction(s, 'click')
        },
        // right click / long press: the faceplate of a symbol that has one
        longPress (s) {
            if (!this.editing && s.action && s.action.mode === 'faceplate') this.faceplate = s
        },
        // the symbol picked in the alarm list blinks for a few seconds
        showSymbol (id) {
            if (!this.symbols.some(s => s.id === id)) return
            this.flash = id
            clearTimeout(this.flashTimer)
            this.flashTimer = setTimeout(() => { this.flash = null }, 4000)
            this.$nextTick(() => {
                const el = this.$el && this.$el.querySelector('.hmi-symbol[data-id="' + String(id).replace(/["\\]/g, '') + '"]')
                if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
            })
        },
        async fpCommand (s, k, label) {
            const a = s.action || {}
            if (k === 'sp' || k === 'op') {
                const min = a[k + 'Min'] ?? (k === 'op' ? '0' : '')
                const max = a[k + 'Max'] ?? (k === 'op' ? '100' : '')
                const curKey = k === 'sp' ? a.spKey : a.opKey
                const v = await this.askNumber(label + ': ' + this.fp.name, curKey ? this.values[curKey] : '', min, max)
                if (v === null) return
                return this.sendAction(s, 'fp-' + k, String(v))
            }
            if (a.confirm === 'yes' && !window.confirm(label + ': ' + this.fp.name + '?')) return
            this.sendAction(s, 'fp-' + k)
        },
        // the on-screen keypad (touch screens) also takes the keyboard
        openKeypad (opts) {
            return new Promise(resolve => {
                this.keypad = { title: opts.title, hint: opts.hint || '', text: opts.text === undefined || opts.text === null ? '' : String(opts.text), secret: !!opts.secret, resolve }
                this.$nextTick(() => this.$refs.kp && this.$refs.kp.focus())
            })
        },
        keyPress (k) {
            const kp = this.keypad
            if (!kp) return
            if (k === 'C') kp.text = ''
            else if (k === '⌫') kp.text = kp.text.slice(0, -1)
            else if (k === '±') kp.text = kp.text.startsWith('-') ? kp.text.slice(1) : '-' + kp.text
            else if (k === ',') { if (!/[.,]/.test(kp.text)) kp.text += ',' }
            else kp.text += k
        },
        keyDone (value) {
            const kp = this.keypad
            this.keypad = null
            if (kp) kp.resolve(value === null ? null : String(value))
        },
        askPin (title) {
            return this.openKeypad({ title, hint: 'Senha', secret: true })
        },
        // a number within min / max, typed on the keypad; null when cancelled
        async askNumber (title, current, min, max) {
            const has = x => x !== '' && x !== undefined && x !== null && isFinite(Number(x))
            const range = has(min) && has(max) ? min + ' a ' + max : (has(min) ? 'mínimo ' + min : (has(max) ? 'máximo ' + max : ''))
            let text = current === undefined || current === null ? '' : String(current).replace('.', ',')
            for (;;) {
                const raw = await this.openKeypad({ title, hint: range ? 'Faixa: ' + range : 'Novo valor', text })
                if (raw === null || raw.trim() === '') return null
                const n = Number(raw.replace(',', '.'))
                if (isFinite(n) && !(has(min) && n < Number(min)) && !(has(max) && n > Number(max))) return n
                this.showNotice('Valor inválido' + (range ? ' (' + range + ')' : ''))
                text = raw
            }
        },
        showNotice (text) {
            this.notice = text
            clearTimeout(this.noticeTimer)
            this.noticeTimer = setTimeout(() => { this.notice = '' }, 4000)
        },
        // another dashboard page (its path, e.g. /linha2) or a full address
        openScreen (name) {
            if (isPhoneScreen(name)) name = name.slice(0, -phoneScreenOf('').length)
            if (!this.screens.includes(name)) return
            this.letGo()
            this.faceplate = null
            this.screen = name
        },
        goTo (target) {
            const t = String(target || '').trim()
            if (!t) return
            if (/^https?:\/\//.test(t)) { window.location.href = t; return }
            const path = t.startsWith('/') ? t : '/' + t
            // dashboard routes carry the base path (/dashboard/linha2), the page config only its own (/linha2)
            const routes = this.$router ? this.$router.getRoutes().map(r => r.path).filter(r => r && !r.includes(':')) : []
            const route = routes.find(r => r === path) || routes.find(r => r.endsWith(path))
            if (route) this.$router.push(route).catch(() => {})
            else window.location.href = path
        },
        async askValue (s, name) {
            const { min, max } = s.action
            const cur = s.key && this.values[s.key] !== undefined ? scaleValue(s, this.values[s.key]) : ''
            const n = await this.askNumber((name ? name + ': ' : '') + 'novo valor', cur, min, max)
            if (n === null) return
            this.sendAction(s, 'input', String(n))
        },
        // pulse: 1 while pressed, 0 on release (also when the pointer leaves or the page hides);
        // the node lets go by itself when the "still pressed" beats stop
        async press (s, e) {
            if (!this.clickable(s) || !s.action || s.action.mode !== 'pulse') return
            e.preventDefault()
            const why = interlockOf(s.action, this.values)
            if (why) return this.showNotice('Bloqueado: ' + why)
            if (s.action.pin === 'yes' && !((this.armed[s.id] || 0) > Date.now())) {
                // the password first, then the button is held without asking again
                const pin = await this.askPin((s.props && (s.props.text || s.props.label)) || s.key || 'Comando')
                if (pin !== null) this.emit({ _hmiAction: { id: s.id, phase: 'arm', pin } })
                return
            }
            this.pressed = s.id
            this.emit({ _hmiAction: { id: s.id, phase: 'down' } })
            clearInterval(this.beat)
            this.beat = setInterval(() => this.emit({ _hmiBeat: s.id }), 400)
        },
        release (s) {
            if (this.pressed !== s.id) return
            this.pressed = null
            clearInterval(this.beat)
            this.beat = null
            this.emit({ _hmiAction: { id: s.id, phase: 'up' } })
        },
        openEditor () {
            const vm = this
            this.editor = createEditor(this.$refs.editor, {
                title: 'Editando: ' + (this.props.name || 'hmi canvas'),
                symbols: this.symbols,
                screens: this.screens,
                getValues: () => vm.values,
                fill: true,
                // a phone screen is edited at the phone width, with room to grow downwards
                getView: (scr, syms) => isPhoneScreen(scr)
                    ? { w: Number(vm.cfg('phoneW')) || 400, h: Math.max(800, contentHeight(syms) + 300) }
                    : { w: Number(vm.cfg('viewW')) || 1280, h: Number(vm.cfg('viewH')) || 720 },
                getTheme: () => vm.theme,
                getBackground: () => vm.cfg('background'),
                getLocale: () => vm.cfg('locale'),
                onChange: (ed) => ed.setMessage('Alterações não salvas'),
                actions: [
                    { label: 'Salvar e fazer Deploy', primary: true, onClick: (ed) => vm.save(ed) },
                    { label: 'Sair', onClick: () => vm.leave() }
                ]
            })
        },
        async save (ed) {
            ed.setMessage('Salvando...')
            try {
                const res = await fetch(this.edit.admin.replace(/\/?$/, '/') + encodeURIComponent(this.id) + '/symbols', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...authHeaders() },
                    body: JSON.stringify({ key: this.edit.key, symbols: ed.getSymbols(), screens: ed.getScreens() })
                })
                if (res.status === 401) return ed.setMessage('Sem permissão: entre no editor do Node-RED e abra de novo')
                const out = await res.json().catch(() => ({}))
                if (!res.ok) return ed.setMessage('Erro: ' + (out.error || res.status))
                ed.setMessage('Salvo e publicado')
                setTimeout(() => this.leave(), 800)
            } catch (err) {
                ed.setMessage('Erro: ' + err.message)
            }
        },
        leave () {
            window.location.replace(window.location.pathname)
        }
    }
}
</script>
