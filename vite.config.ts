import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base './' keeps asset URLs relative so the output works from any cPanel folder or GitHub Pages path.
// outDir 'docs' lets GitHub Pages publish from main /docs.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'docs',
  },
})