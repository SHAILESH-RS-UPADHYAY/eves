import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'electron/main.ts'),
        output: {
          entryFileNames: 'index.js'
        }
      }
    },
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: { '@': resolve(__dirname, 'electron') }
    }
  },
  preload: {
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'electron/preload.ts'),
        output: {
          entryFileNames: 'index.js'
        }
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    root: resolve(__dirname),
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'index.html')
      }
    },
    resolve: {
      alias: { '@': resolve(__dirname, 'src') }
    },
    plugins: [react()],
    server: {
      middlewareMode: false
    }
  }
})
