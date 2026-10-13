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
                @click="click(s)"
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
    </div>
</template>

<script>
import { createEditor } from '../editor/index.js'
import { injectStyles, renderSymbol, valueFor } from '../symbols/index.js'

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
        return { values: {}, lastUpdate: 0, now: Date.now(), timer: null, fitHeight: 0, edit: null, editor: null, pressed: null }
    },
    computed: {
        symbols () { return Array.isArray(this.props.symbols) ? this.props.symbols : [] },
        viewW () { return Number(this.props.viewW) || 1280 },
        viewH () { return Number(this.props.viewH) || 720 },
        theme () { return this.props.theme === 'classic' ? 'classic' : 'isa101' },
        transparent () { return this.props.background === 'transparent' },
        editing () { return !!this.edit },
        offline () {
            const s = Number(this.props.offlineAfter) || 0
            return s > 0 && this.lastUpdate > 0 && (this.now - this.lastUpdate) > s * 1000
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
                this.lastUpdate = Date.now()
                if (this.editor) this.editor.redraw()
            }
        },
        onInput (msg) { this.apply(msg) },
        onLoad (msg) { this.apply(msg) },
        draw (s) {
            return renderSymbol(s, valueFor(s, this.values), { locale: this.props.locale, values: this.values })
        },
        clickable (s) {
            return !this.editing && !!(s.action && ['value', 'toggle', 'pulse'].includes(s.action.mode))
        },
        sendAction (s, phase) {
            this.$socket.emit('widget-action', this.id, { _hmiAction: { id: s.id, phase } })
        },
        click (s) {
            if (!this.clickable(s) || s.action.mode === 'pulse') return
            if (s.action.confirm === 'yes') {
                const name = (s.props && (s.props.text || s.props.label || s.props.title)) || s.key || ''
                if (!window.confirm('Confirmar' + (name ? ': ' + name : '') + '?')) return
            }
            this.sendAction(s, 'click')
        },
        // pulse: 1 while pressed, 0 on release (also when the pointer leaves)
        press (s, e) {
            if (!this.clickable(s) || s.action.mode !== 'pulse') return
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
