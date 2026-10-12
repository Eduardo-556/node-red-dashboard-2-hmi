<template>
    <div class="hmi-canvas-wrapper">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            :class="['hmi-root', 'hmi-theme-' + theme, { 'hmi-offline': offline }]"
            :viewBox="'0 0 ' + viewW + ' ' + viewH"
            preserveAspectRatio="xMidYMid meet"
        >
            <rect class="hmi-bg" x="0" y="0" :width="viewW" :height="viewH" />
            <g v-for="s in symbols" :key="s.id" v-html="draw(s)" />
            <g class="hmi-offline-banner">
                <rect :x="viewW / 2 - 170" y="16" width="340" height="40" rx="6" />
                <text :x="viewW / 2" y="37">SEM COMUNICAÇÃO</text>
            </g>
        </svg>
    </div>
</template>

<script>
import { injectStyles, renderSymbol, valueFor } from '../symbols/index.js'

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
        return { values: {}, lastUpdate: 0, now: Date.now(), timer: null }
    },
    computed: {
        symbols () { return Array.isArray(this.props.symbols) ? this.props.symbols : [] },
        viewW () { return Number(this.props.viewW) || 1280 },
        viewH () { return Number(this.props.viewH) || 720 },
        theme () { return this.props.theme === 'classic' ? 'classic' : 'isa101' },
        offline () {
            const s = Number(this.props.offlineAfter) || 0
            return s > 0 && this.lastUpdate > 0 && (this.now - this.lastUpdate) > s * 1000
        }
    },
    created () {
        injectStyles()
        this.$dataTracker(this.id, this.onInput, this.onLoad)
    },
    mounted () {
        this.timer = setInterval(() => { this.now = Date.now() }, 1000)
    },
    unmounted () {
        clearInterval(this.timer)
    },
    methods: {
        apply (msg) {
            if (msg && msg.payload && typeof msg.payload === 'object') {
                this.values = { ...msg.payload }
                this.lastUpdate = Date.now()
            }
        },
        onInput (msg) { this.apply(msg) },
        onLoad (msg) { this.apply(msg) },
        draw (s) {
            return renderSymbol(s, valueFor(s, this.values), { locale: this.props.locale })
        }
    }
}
</script>

