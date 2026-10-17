'use strict'

// Recent samples of every key shown in a trend symbol: key -> [[time ms, value], ...]
const MAX_POINTS = 3000

function createTrendHistory (symbols) {
    const windows = {}
    for (const s of Array.isArray(symbols) ? symbols : []) {
        if (!s || s.type !== 'trend' || !s.key) continue
        const win = Math.max(5, Math.min(3600, Number(s.props && s.props.window) || 60)) * 1000
        windows[s.key] = Math.max(windows[s.key] || 0, win)
    }
    const hist = {}
    return {
        size: Object.keys(windows).length,
        record (values, now) {
            for (const k of Object.keys(windows)) {
                const list = (hist[k] || []).filter(q => q[0] >= now - windows[k])
                const raw = values ? values[k] : undefined
                const v = Number(raw)
                if (raw !== undefined && raw !== null && raw !== '' && typeof raw !== 'boolean' && isFinite(v)) list.push([now, v])
                hist[k] = list.length > MAX_POINTS ? list.slice(-MAX_POINTS) : list
            }
        },
        snapshot () {
            const out = {}
            for (const k of Object.keys(hist)) out[k] = hist[k].slice()
            return out
        }
    }
}

module.exports = { createTrendHistory }
