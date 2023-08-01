import {defineConfig} from 'vite'
import {svelte} from '@sveltejs/vite-plugin-svelte'
import {viteStaticCopy} from 'vite-plugin-static-copy'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [svelte({
        compilerOptions: {
            dev: true
        }
    })],
    build: {
        outDir: '../electron/dist/web',
        emptyOutDir: true
    }
})
