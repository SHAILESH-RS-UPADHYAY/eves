import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Scene } from '../three/Scene'

export function Hero3D() {
  const badgeRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tl = gsap.timeline()
    if (badgeRef.current) tl.fromTo(badgeRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 })
    if (titleRef.current) {
      const words = titleRef.current.querySelectorAll('.word')
      tl.fromTo(words, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.15 }, '-=0.2')
    }
    if (subRef.current) tl.fromTo(subRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 }, '-=0.2')
    if (ctaRef.current) tl.fromTo(ctaRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 }, '-=0.3')
  }, [])

  return (
    <section style={{ position: 'relative', overflow: 'hidden' }}>
      {/* 3D Canvas */}
      <Scene />

      {/* HTML overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        padding: '0 24px'
      }}>
        <div ref={badgeRef} style={{
          padding: '6px 16px',
          background: 'rgba(124,58,237,0.1)',
          border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: '999px',
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--accent-violet)',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '24px'
        }}>
          Personal Meeting AI
        </div>

        <h1 ref={titleRef} style={{
          fontSize: '72px',
          fontWeight: 800,
          textAlign: 'center',
          lineHeight: 1.1,
          maxWidth: '800px'
        }}>
          <span className="word gradient-text">Your</span>{' '}
          <span className="word gradient-text">meetings.</span>{' '}
          <span className="word gradient-text">Understood.</span>
        </h1>

        <p ref={subRef} style={{
          fontSize: '20px',
          color: 'var(--text-secondary)',
          maxWidth: '560px',
          textAlign: 'center',
          marginTop: '20px',
          lineHeight: 1.5
        }}>
          EVES transcribes, analyzes, and extracts intelligence from every recording. Private, local, and devastatingly accurate.
        </p>

        <div ref={ctaRef} style={{ display: 'flex', gap: '16px', marginTop: '36px' }}>
          <button style={{
            padding: '14px 28px',
            background: 'var(--gradient-brand)',
            border: 'none',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 0 40px rgba(124,58,237,0.3)'
          }}>
            Download for macOS
          </button>
          <button style={{
            padding: '14px 28px',
            background: 'var(--glass-2)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--glass-border)',
            borderRadius: '12px',
            color: 'var(--text-primary)',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer'
          }}>
            View on GitHub
          </button>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '20px',
          color: 'var(--text-muted)',
          animation: 'bounce 2s infinite'
        }}>
          ↓
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-10px); }
        }
      `}</style>
    </section>
  )
}
