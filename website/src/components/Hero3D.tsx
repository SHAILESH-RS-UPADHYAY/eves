import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Scene } from '../three/Scene'
import { INTRO_S } from './Intro'
import { DownloadButtons } from './DownloadButtons'
import type { Theme } from '../lib'

export function Hero3D({ theme }: { theme: Theme }) {
  const badgeRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tl = gsap.timeline({ delay: INTRO_S })
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
      <Scene key={theme} theme={theme} />

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
          background: 'var(--accent-soft)',
          border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
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
          fontSize: 'clamp(44px, 8vw, 80px)',
          fontWeight: 800,
          textAlign: 'center',
          lineHeight: 1.1,
          maxWidth: '800px'
        }}>
          <span className="word gradient-text">Your</span>{' '}
          <span className="word gradient-text">meetings.</span>{' '}
          <span className="word accent-word">Understood.</span>
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

        <div ref={ctaRef} style={{ display: 'flex', gap: '12px', marginTop: '36px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <DownloadButtons />
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
