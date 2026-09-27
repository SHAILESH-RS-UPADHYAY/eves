import { createRoot } from 'react-dom/client'
import { App } from './App'
import './styles/globals.css'
import './styles/animations.css'

const container = document.getElementById('root')
if (!container) throw new Error('Root container not found')

createRoot(container).render(<App />)
