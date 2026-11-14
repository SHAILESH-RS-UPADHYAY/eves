import { flushSync } from 'react-dom'
import type { Theme } from '../lib'

/**
 * Sun ⇄ moon morph. The switch itself: the new theme spills out of the button as a growing circle
 * (View Transitions) with a glowing shockwave ring riding its edge. Falls back to an instant swap.
 */
export function ThemeToggle({ theme, onChange }: { theme: Theme; onChange: (t: Theme) => void }) {
  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    const apply = () => {
      flushSync(() => onChange(next))
      document.documentElement.dataset.theme = next
      try { localStorage.setItem('eves-theme', next) } catch { /* private mode */ }
    }
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } }
    if (!doc.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return apply()

    const b = e.currentTarget.getBoundingClientRect()
    const x = b.left + b.width / 2, y = b.top + b.height / 2
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
    const ease = 'cubic-bezier(.7,0,.2,1)', duration = 750
    doc.startViewTransition(apply).ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration, easing: ease, pseudoElement: '::view-transition-new(root)' },
      )
      const ring = document.createElement('div')
      ring.className = 'theme-ring'
      Object.assign(ring.style, { left: `${x}px`, top: `${y}px` })
      document.body.appendChild(ring)
      ring.animate(
        [{ width: '0px', height: '0px', opacity: 1 }, { width: `${r * 2}px`, height: `${r * 2}px`, opacity: 0.15 }],
        { duration, easing: ease },
      ).finished.then(() => ring.remove())
    })
  }

  return (
    <button className="theme-toggle" onClick={toggle} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title="Toggle theme">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <mask id="tt-mask">
          <rect width="24" height="24" fill="#fff" />
          <circle className="tt-bite" cx="30" cy="0" r="6" fill="#000" />
        </mask>
        <circle className="tt-core" cx="12" cy="12" r="4.5" fill="currentColor" stroke="none" mask="url(#tt-mask)" />
        <g className="tt-rays">
          {Array.from({ length: 8 }, (_, i) => <path key={i} d="M12 2.5v2" transform={`rotate(${i * 45} 12 12)`} />)}
        </g>
      </svg>
    </button>
  )
}
