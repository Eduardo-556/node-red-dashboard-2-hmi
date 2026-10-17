'use strict'

// Recent samples of every key shown in a trend symbol: key -> [[time ms, value], ...]
// A window holds at most POINTS samples spread over time: faster data is thinned
// (one sample per window / POINTS), so a 1 h trend really covers the hour.
// The page (UIHmiCanvas.vue) keeps its own samples the same way.
const POINTS = 1500

function windowsOf (symbols) {
    const windows = {}
    for (const s of Array.isArray(symbols) ? symbols : []) {
        if (!s || s.type !== 'trend' || !s.key) continue
        const win = Math.max(5, Math.min(3600, Number(s.props && s.props.window) || 60)) * 1000
        windows[s.key] = Math.max(windows[s.key] || 0, win)
    }
    return windows
}

// adds one sample to a list, dropping old ones; returns the new list
function addSample (list, now, value, win) {
    const out = list.filter(q => q[0] >= now - win)
    const step = win / POINTS
    const last = out[out.length - 1]
    if (last && now - last[0] < step && out.length > 1 && now - out[out.length - 2][0] < step) out[out.length - 1] = [now, value]
    else out.push([now, value])
    return out.length > POINTS + 2 ? out.slice(-(POINTS + 2)) : out
}

// saved: the history of the previous instance (kept across a deploy)
function createTrendHistory (symbols, saved) {
    const windows = windowsOf(symbols)
    const hist = {}
    if (saved && typeof saved === 'object') {
        for (const k of Object.keys(windows)) if (Array.isArray(saved[k])) hist[k] = saved[k].slice(-(POINTS + 2))
    }
    return {
        size: Object.keys(windows).length,
        record (values, now) {
            for (const k of Object.keys(windows)) {
                const raw = values ? values[k] : undefined
                const v = Number(raw)
                const ok = raw !== undefined && raw !== null && raw !== '' && typeof raw !== 'boolean' && isFinite(v)
                hist[k] = ok ? addSample(hist[k] || [], now, v, windows[k]) : (hist[k] || []).filter(q => q[0] >= now - windows[k])
            }
        },
        snapshot () {
            const out = {}
            for (const k of Object.keys(hist)) out[k] = hist[k].slice()
            return out
        }
    }
}

module.exports = { createTrendHistory, addSample, POINTS }
