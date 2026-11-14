import { useEffect, useState } from 'react'
import { MARK_VIEWBOX, WAVE } from './Intro'
import { ThemeToggle } from './ThemeToggle'
import { NavPills } from './NavPills'
import { MOBILE, OS, type Theme } from '../lib'

export function Navbar({ theme, onTheme }: { theme: Theme; onTheme: (t: Theme) => void }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`nav${scrolled ? ' scrolled' : ''}`} style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '14px clamp(16px, 4vw, 32px)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }} aria-label="EVES home">
        <svg id="nav-mark" className="nav-mark" width="30" height="30" viewBox={MARK_VIEWBOX} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path className="nm-wave" pathLength={1} strokeWidth="2.1" d={WAVE} />
          <rect className="nm-cursor" x="17.2" y="6.5" width="3.2" height="11" rx="0.5" fill="currentColor" stroke="none" />
        </svg>
        <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>EVES</span>
      </a>
      <div style={{ display: 'flex', gap: 'clamp(12px, 2.4vw, 28px)', alignItems: 'center' }}>
        <NavPills />
        <ThemeToggle theme={theme} onChange={onTheme} />
        <a href="#download" className="btn btn-primary btn-sm">{MOBILE ? 'Get the app' : `Download for ${OS}`}</a>
      </div>
    </nav>
  )
}
