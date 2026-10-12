import { resolve } from 'path'

import { defineConfig } from 'vite'

// Symbols and the drag-and-drop editor as a plain script for the Node-RED editor (window.HmiEditor)
export default defineConfig({
    build: {
        lib: {
            entry: resolve(import.meta.dirname, 'ui/editor/bundle.js'),
            name: 'HmiEditor',
            formats: ['iife'],
            fileName: () => 'hmi-editor.js'
        },
        outDir: 'resources',
        emptyOutDir: false,
        minify: false
    }
})
