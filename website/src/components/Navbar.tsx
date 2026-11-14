import { useEffect, useState } from 'react'
import { INTRO_S, MARK_VIEWBOX, WAVE } from './Intro'
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
        <span className="eves-word" style={{ fontSize: '21px', color: 'var(--text-primary)', ['--ew-delay' as string]: `${INTRO_S * 1000 - 400}ms` }}>
          {'EVES'.split('').map((c, i) => <span key={i} className="ew" style={{ ['--i' as string]: i }}>{c}</span>)}
        </span>
      </a>
      <div style={{ display: 'flex', gap: 'clamp(12px, 2.4vw, 28px)', alignItems: 'center' }}>
        <NavPills />
        <ThemeToggle theme={theme} onChange={onTheme} />
        <a href="#download" className="btn btn-primary btn-sm">{MOBILE ? 'Get the app' : `Download for ${OS}`}</a>
      </div>
    </nav>
  )
}
