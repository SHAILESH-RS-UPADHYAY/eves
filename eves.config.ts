import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'core/main.ts'),
        output: { entryFileNames: 'index.js' }
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'core/preload.ts'),
        output: { entryFileNames: 'index.js' }
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    root: resolve(__dirname),
    build: {
      rollupOptions: {
        // popup is a second entry — without it the packaged app has no popup
        input: {
          index: resolve(__dirname, 'index.html'),
          popup: resolve(__dirname, 'popup/index.html')
        }
      }
    },
    plugins: [react()]
  }
})
