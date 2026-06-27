import { ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { App } from './App'
import './styles/globals.css'
import './styles/animations.css'

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } }
})

const container = document.getElementById('root')
if (!container) throw new Error('Root container not found')
const root = createRoot(container)

root.render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
)
