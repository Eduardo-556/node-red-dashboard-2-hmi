<template>
    <div class="hmi-canvas-wrapper">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            :class="['hmi-root', 'hmi-theme-' + theme, { 'hmi-offline': offline, 'hmi-transparent': transparent }]"
            :style="svgStyle"
            :viewBox="'0 0 ' + viewW + ' ' + viewH"
            preserveAspectRatio="xMidYMid meet"
        >
            <rect class="hmi-bg" x="0" y="0" :width="viewW" :height="viewH" />
            <g
                v-for="s in symbols"
                :key="s.id"
                :class="{ 'hmi-clickable': clickable(s), 'hmi-pressed': pressed === s.id }"
                @click="click(s, $event)"
                @pointerdown="press(s, $event)"
                @pointerup="release(s)"
                @pointerleave="release(s)"
                @pointercancel="release(s)"
                v-html="draw(s)"
            />
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
                <div v-if="fp.alarms.length" class="hmi-fp-alarms">
                    <div class="hmi-fp-sub">Alarmes</div>
                    <div v-for="a in fp.alarms" :key="a.id" :class="['hmi-fp-alarm', 'hmi-fp-p' + a.priority, { 'hmi-fp-unacked': !a.acked }]">
                        <span>{{ a.text }}</span><small>{{ a.active ? (a.acked ? 'RECONHECIDO' : 'ATIVO') : 'NORMAL' }}</small>
                    </div>
                    <button v-if="fp.unacked" type="button" class="hmi-fp-btn" @click="ack('symbol:' + faceplate.id)">Reconhecer</button>
                </div>
                <div v-if="fp.buttons.length" class="hmi-fp-cmds">
                    <button v-for="b in fp.buttons" :key="b[0]" type="button" :class="['hmi-fp-btn', 'hmi-fp-' + b[0]]" @click="fpCommand(faceplate, b[0], b[1])">{{ b[1] }}</button>
                </div>
            </div>
        </div>
        <div v-if="pinAsk" :class="['hmi-fp-back', 'hmi-fp-' + theme]" @click.self="pinDone(null)">
            <form class="hmi-fp hmi-pin" @submit.prevent="pinDone(pinText)">
                <div class="hmi-fp-head"><span>{{ pinAsk.title }}</span></div>
                <label class="hmi-pin-label">Senha<input ref="pin" v-model="pinText" type="password" autocomplete="off"></label>
                <div class="hmi-fp-cmds">
                    <button type="button" class="hmi-fp-btn" @click="pinDone(null)">Cancelar</button>
                    <button type="submit" class="hmi-fp-btn hmi-fp-on">OK</button>
                </div>
            </form>
        </div>
        <div v-if="notice" class="hmi-notice">{{ notice }}</div>
    </div>
</template>

<script>
import { createEditor } from '../editor/index.js'
import { injectStyles, renderSymbol, valueFor, onState, formatValue, isOn } from '../symbols/index.js'

function authHeaders () {
    const headers = {}
    try {
        const t = JSON.parse(localStorage.getItem('auth-tokens') || 'null')
        if (t && t.access_token) headers.Authorization = (t.token_type || 'Bearer') + ' ' + t.access_token
    } catch (e) {}
    return headers
}

export default {
    name: 'UIHmiCanvas',
    inject: ['$socket', '$dataTracker'],
    props: {
        /* do not remove entries from this - Dashboard's Layout Manager's will pass this data to your component */
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) },
        state: { type: Object, default: () => ({ enabled: false, visible: false }) }
    },
    data () {
        return { values: {}, alarms: null, ui: {}, faceplate: null, pinAsk: null, pinText: '', notice: '', noticeTimer: null, lastUpdate: 0, now: Date.now(), timer: null, fitHeight: 0, edit: null, editor: null, pressed: null, history: {} }
    },
    computed: {
        symbols () { return Array.isArray(this.props.symbols) ? this.props.symbols : [] },
        viewW () { return Number(this.props.viewW) || 1280 },
        viewH () { return Number(this.props.viewH) || 720 },
        theme () { return this.props.theme === 'classic' ? 'classic' : 'isa101' },
        transparent () { return this.props.background === 'transparent' },
        editing () { return !!this.edit },
        // keys drawn by trend symbols and the longest window they need, in ms
        trendKeys () {
            const out = {}
            for (const s of this.symbols) {
                if (s.type === 'trend' && s.key) out[s.key] = Math.max(out[s.key] || 0, Math.min(3600, Number(s.props && s.props.window) || 60) * 1000)
            }
            return out
        },
        offline () {
            const s = Number(this.props.offlineAfter) || 0
            return s > 0 && this.lastUpdate > 0 && (this.now - this.lastUpdate) > s * 1000
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
            const fmt = (x, unit) => formatValue(x, undefined, this.props.locale) + (unit ? ' ' + unit : '')
            const rows = []
            if (s.key && on === null && raw !== undefined) rows.push(['Valor', fmt(raw, p.unit)])
            if (a.valueKey) rows.push(['Valor', fmt(v[a.valueKey], a.valueUnit)])
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
            return {
                name: p.label || p.title || p.text || s.key || s.type,
                state: fault ? 'FALHA' : (on === null ? '—' : (on ? 'LIGADO' : 'DESLIGADO')),
                stateCls: fault ? 'fault' : (on ? 'on' : 'off'),
                rows,
                alarms,
                unacked: alarms.some(x => !x.acked),
                buttons
            }
        },
        svgStyle () {
            return this.props.fit === 'screen' && this.fitHeight > 0 ? { height: this.fitHeight + 'px' } : {}
        }
    },
    created () {
        injectStyles()
        this.$dataTracker(this.id, this.onInput, this.onLoad)
        const q = new URLSearchParams(window.location.search)
        if (q.get('hmi-canvas') === this.id && q.get('hmi-edit')) {
            this.edit = { key: q.get('hmi-edit'), admin: q.get('hmi-admin') || '/hmi-canvas/' }
        }
    },
    mounted () {
        this.timer = setInterval(() => { this.now = Date.now() }, 1000)
        window.addEventListener('resize', this.fit)
        this.$nextTick(this.fit)
        if (this.editing) this.$nextTick(this.openEditor)
    },
    unmounted () {
        clearInterval(this.timer)
        window.removeEventListener('resize', this.fit)
        if (this.editor) this.editor.destroy()
    },
    methods: {
        fit () {
            if (this.props.fit !== 'screen' || !this.$el || !this.$el.getBoundingClientRect) return
            const top = this.$el.getBoundingClientRect().top + window.scrollY
            this.fitHeight = Math.max(200, window.innerHeight - top - 12)
        },
        apply (msg) {
            if (msg && msg.payload && typeof msg.payload === 'object') {
                this.values = { ...msg.payload }
                if (msg.alarms) this.alarms = msg.alarms
                if (msg.notice && msg.notice.socketId && this.$socket && msg.notice.socketId === this.$socket.id && Date.now() - (msg.notice.ts || 0) < 10000) this.showNotice(msg.notice.text)
                this.lastUpdate = Date.now()
                this.record(this.lastUpdate)
                if (this.editor) this.editor.redraw()
            }
        },
        record (t) {
            const keys = this.trendKeys
            const next = {}
            for (const k of Object.keys(keys)) {
                const list = (this.history[k] || []).filter(q => q[0] >= t - keys[k])
                const v = Number(this.values[k])
                if (this.values[k] !== undefined && this.values[k] !== null && isFinite(v)) list.push([t, v])
                next[k] = list.slice(-2000)
            }
            this.history = next
        },
        onInput (msg) { this.apply(msg) },
        onLoad (msg) { this.apply(msg) },
        draw (s) {
            return renderSymbol(s, valueFor(s, this.values), { locale: this.props.locale, values: this.values, history: this.history, now: s.type === 'trend' ? this.now : 0, alarms: this.alarms || { active: [], history: [] }, ui: this.ui[s.id] })
        },
        clickable (s) {
            if (this.editing) return false
            if (s.type === 'alarmList') return true
            return !!(s.action && ['value', 'toggle', 'pulse', 'input', 'page', 'faceplate'].includes(s.action.mode))
        },
        async sendAction (s, phase, value) {
            const a = { id: s.id, phase }
            if (value !== undefined) a.value = value
            if (s.action && s.action.pin === 'yes') {
                const pin = await this.askPin((s.props && (s.props.label || s.props.text || s.props.title)) || s.key || 'Comando')
                if (pin === null) return
                a.pin = pin
            }
            this.$socket.emit('widget-action', this.id, { _hmiAction: a })
        },
        ack (which) {
            this.$socket.emit('widget-action', this.id, { _hmiAck: which })
        },
        click (s, e) {
            if (s.type === 'alarmList') {
                const t = e && e.target && e.target.closest ? e.target.closest('[data-hmi]') : null
                const cmd = t ? t.getAttribute('data-hmi') : ''
                if (cmd.startsWith('tab:')) this.ui = { ...this.ui, [s.id]: { tab: cmd.slice(4) } }
                else if (cmd.startsWith('ack:')) this.ack(cmd.slice(4))
                return
            }
            if (!this.clickable(s) || !s.action || s.action.mode === 'pulse') return
            const name = (s.props && (s.props.text || s.props.label || s.props.title)) || s.key || ''
            if (s.action.mode === 'faceplate') { this.faceplate = s; return }
            if (s.action.mode === 'input') return this.askValue(s, name)
            if (s.action.confirm === 'yes' && !window.confirm('Confirmar' + (name ? ': ' + name : '') + '?')) return
            if (s.action.mode === 'page') return this.goTo(s.action.value)
            this.sendAction(s, 'click')
        },
        fpCommand (s, k, label) {
            if (s.action.confirm === 'yes' && !window.confirm(label + ': ' + this.fp.name + '?')) return
            this.sendAction(s, 'fp-' + k)
        },
        askPin (title) {
            return new Promise(resolve => {
                this.pinText = ''
                this.pinAsk = { title, resolve }
                this.$nextTick(() => this.$refs.pin && this.$refs.pin.focus())
            })
        },
        pinDone (value) {
            const ask = this.pinAsk
            this.pinAsk = null
            this.pinText = ''
            if (ask) ask.resolve(value === null ? null : String(value))
        },
        showNotice (text) {
            this.notice = text
            clearTimeout(this.noticeTimer)
            this.noticeTimer = setTimeout(() => { this.notice = '' }, 4000)
        },
        // another dashboard page (its path, e.g. /linha2) or a full address
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
        askValue (s, name) {
            const { min, max } = s.action
            const range = min !== '' && max !== '' && min !== undefined && max !== undefined ? ' (' + min + ' a ' + max + ')' : ''
            const cur = s.key && this.values[s.key] !== undefined ? String(valueFor(s, this.values)) : ''
            const raw = window.prompt((name ? name + '\n' : '') + 'Novo valor' + range + ':', cur)
            if (raw === null || raw.trim() === '') return
            const n = Number(raw.replace(',', '.'))
            const bad = !isFinite(n) || (min !== '' && min !== undefined && n < Number(min)) || (max !== '' && max !== undefined && n > Number(max))
            if (bad) return window.alert('Valor inválido' + range)
            this.sendAction(s, 'input', String(n))
        },
        // pulse: 1 while pressed, 0 on release (also when the pointer leaves)
        press (s, e) {
            if (!this.clickable(s) || !s.action || s.action.mode !== 'pulse') return
            e.preventDefault()
            this.pressed = s.id
            this.sendAction(s, 'down')
        },
        release (s) {
            if (this.pressed !== s.id) return
            this.pressed = null
            this.sendAction(s, 'up')
        },
        openEditor () {
            const vm = this
            this.editor = createEditor(this.$refs.editor, {
                title: 'Editando: ' + (this.props.name || 'hmi canvas'),
                symbols: this.symbols,
                getValues: () => vm.values,
                fill: true,
                getView: () => ({ w: vm.viewW, h: vm.viewH }),
                getTheme: () => vm.theme,
                getBackground: () => vm.props.background,
                getLocale: () => vm.props.locale,
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
                    body: JSON.stringify({ key: this.edit.key, symbols: ed.getSymbols() })
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
