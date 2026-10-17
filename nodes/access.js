'use strict'

// Who may do what on a canvas. Each list is typed in the node:
//   empty  -> everybody
//   "-"    -> nobody (view only)
//   names  -> only these users, separated by commas (user name, login or e-mail)
// The user comes from the dashboard login (FlowFuse / multi-user plugins or basic auth),
// so these checks run in Node-RED and a page cannot get around them.
const ROLES = ['cmd', 'ack', 'shelve']

function parseList (text) {
    const t = String(text || '').trim()
    if (!t) return null
    if (t === '-') return []
    return t.split(/[,;\n]/).map(s => s.trim().toLowerCase()).filter(Boolean)
}

function namesOf (user) {
    if (!user) return []
    if (typeof user === 'string') return [user.toLowerCase()]
    return ['name', 'username', 'email', 'userId', 'id', 'login']
        .map(k => user[k]).filter(v => typeof v === 'string' && v).map(v => v.toLowerCase())
}

function createAccess (config) {
    const lists = {
        cmd: parseList(config.cmdUsers),
        ack: parseList(config.ackUsers),
        // shelving needs the same people as acknowledging when it has no list of its own
        shelve: parseList(config.shelveUsers !== undefined && String(config.shelveUsers).trim() !== '' ? config.shelveUsers : config.ackUsers)
    }
    const can = (role, client) => {
        const list = lists[role]
        if (list === null || list === undefined) return true
        const names = namesOf(client && client._client ? client._client.user : client && client.user)
        return names.some(n => list.includes(n))
    }
    return {
        can,
        // what a page may show as enabled for this client
        of (client) {
            const out = {}
            for (const r of ROLES) out[r] = can(r, client)
            return out
        }
    }
}

// Wrong passwords: after 5 tries in 5 minutes the address waits 1 minute.
function createPinGuard ({ tries = 5, windowMs = 5 * 60000, lockMs = 60000 } = {}) {
    const fails = new Map()
    return {
        locked (who, now) {
            const f = fails.get(who)
            return !!(f && f.until && f.until > now)
        },
        fail (who, now) {
            const f = fails.get(who) || { list: [], until: 0 }
            f.list = f.list.filter(t => t > now - windowMs)
            f.list.push(now)
            if (f.list.length >= tries) { f.until = now + lockMs; f.list = [] }
            fails.set(who, f)
            return f.until > now
        },
        ok (who) { fails.delete(who) }
    }
}

module.exports = { createAccess, createPinGuard, parseList }
