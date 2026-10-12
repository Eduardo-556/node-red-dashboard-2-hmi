import { resolve } from 'path'

import { defineConfig } from 'vite'

// The same symbol library, as a plain script for the Node-RED editor (window.HmiSymbols)
export default defineConfig({
    build: {
        lib: {
            entry: resolve(import.meta.dirname, 'ui/symbols/index.js'),
            name: 'HmiSymbols',
            formats: ['iife'],
            fileName: () => 'hmi-symbols.js'
        },
        outDir: 'resources',
        emptyOutDir: false,
        minify: false
    }
})
