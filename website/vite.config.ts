import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  css: { postcss: {} }, // don't inherit the desktop app's tailwind config
  build: {
    outDir: 'dist'
  }
})
