import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export function Navbar() {
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!navRef.current) return
      if (window.scrollY > 50) {
        gsap.to(navRef.current, {
          background: 'rgba(8,11,18,0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          duration: 0.3
        })
      } else {
        gsap.to(navRef.current, {
          background: 'transparent',
          backdropFilter: 'blur(0px)',
          borderBottom: '1px solid transparent',
          duration: 0.3
        })
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      ref={navRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'background 0.3s'
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}><img src="/icon.svg" alt="" width={28} height={28} /><span className="gradient-text" style={{ fontSize: '20px', fontWeight: 800 }}>EVES</span></span>
      <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
        <a href="#features" style={navLinkStyle}>Features</a>
        <a href="#how" style={navLinkStyle}>How It Works</a>
        <a href="https://github.com" target="_blank" style={navLinkStyle}>GitHub</a>
        <button style={{
          padding: '8px 20px',
          background: 'var(--gradient-brand)',
          border: 'none',
          borderRadius: '10px',
          color: '#fff',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer'
        }}>
          Download
        </button>
      </div>
    </nav>
  )
}

const navLinkStyle: React.CSSProperties = {
  fontSize: '13px',
  color: 'var(--text-secondary)',
  textDecoration: 'none',
  fontWeight: 500,
  transition: 'color 0.2s'
}
