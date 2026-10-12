import { resolve } from 'path'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// Dashboard widget: must match node-red-dashboard-2.widgets in package.json
export default defineConfig({
    plugins: [vue()],
    build: {
        lib: {
            entry: resolve(import.meta.dirname, 'ui/index.js'),
            name: 'ui-hmi-canvas',
            formats: ['umd'],
            fileName: () => 'ui-hmi-canvas.umd.js'
        },
        outDir: 'resources',
        emptyOutDir: false,
        cssCodeSplit: false,
        rollupOptions: {
            external: ['vue', 'vuex'],
            output: { globals: { vue: 'Vue', vuex: 'vuex' } }
        }
    }
})
