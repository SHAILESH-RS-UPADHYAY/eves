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
        // overlay is a second entry — without it the packaged app has no overlay
        input: {
          index: resolve(__dirname, 'index.html'),
          overlay: resolve(__dirname, 'overlay/index.html')
        }
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
