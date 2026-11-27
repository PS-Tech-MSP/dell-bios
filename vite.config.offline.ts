import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

// Builds a copy that opens by double-clicking index.html (file://).
// Browsers block <script type="module"> and crossorigin requests on file://, so this emits a
// classic IIFE script with those attributes removed. Use vite.config.ts for the cPanel build.
const classicScript = (): Plugin => ({
  name: 'classic-script',
  enforce: 'post',
  transformIndexHtml(html) {
    const scripts: string[] = []
    const out = html
      .replace(/<script type="module" crossorigin src="([^"]+)"><\/script>\s*/g, (_m, src: string) => {
        scripts.push(`<script defer src="${src}"></script>`)
        return ''
      })
      .replace(/ crossorigin/g, '')
    return out.replace('</body>', `    ${scripts.join('\n    ')}\n  </body>`)
  },
})

export default defineConfig({
  base: './',
  plugins: [react(), classicScript()],
  build: {
    outDir: 'dist-offline',
    modulePreload: false,
    rollupOptions: { output: { format: 'iife', inlineDynamicImports: true } },
  },
})
