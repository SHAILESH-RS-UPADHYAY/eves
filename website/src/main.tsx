import { createRoot } from 'react-dom/client'
import { App } from './App'
import './styles/globals.css'

// Register GSAP ScrollTrigger
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

const container = document.getElementById('root')
if (!container) throw new Error('Root container not found')
const root = createRoot(container)
root.render(<App />)
