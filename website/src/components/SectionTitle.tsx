import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/**
 * Section heading: on scroll the words ink in one by one (muted → ink, slight rise, blur clears),
 * the accent word lands in the EVES cyan, and a hand-drawn wave — the mark's stroke — is drawn under it.
 */
export function SectionTitle({ text, accent, size = 42, kicker }: { text: string; accent: string; size?: number; kicker?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current!
    const words = el.querySelectorAll('.st-word')
    const wave = el.querySelector('.st-wave') as SVGPathElement
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 82%', once: true } })
    tl.fromTo(el.querySelector('.st-kicker'), { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.35 })
      .fromTo(words,
        { color: 'var(--text-muted)', opacity: 0.25, y: 18, filter: 'blur(6px)' },
        { color: (_i: number, w: Element) => (w.classList.contains('st-accent') ? 'var(--accent)' : 'var(--text-primary)'),
          opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.55, stagger: 0.07, ease: 'power3.out' }, '<0.1')
      .fromTo(wave, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.6, ease: 'power2.inOut' }, '-=0.25')
    return () => { tl.scrollTrigger?.kill(); tl.kill() }
  }, [])

  return (
    <div ref={ref} style={{ textAlign: 'center', marginBottom: '60px' }}>
      {kicker && <div className="st-kicker">{kicker}</div>}
      <h2 style={{ fontSize: `clamp(30px, 5vw, ${size}px)`, fontWeight: 800, lineHeight: 1.08 }}>
        {text.split(' ').map((w, i) => (
          <span key={i} className={`st-word${w === accent ? ' st-accent' : ''}`} style={{ display: 'inline-block', marginRight: '0.24em', position: 'relative' }}>
            {w}
            {w === accent && (
              <svg viewBox="0 0 120 12" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, bottom: '-0.22em', width: '100%', height: '0.28em', overflow: 'visible' }}>
                <path className="st-wave" pathLength={1} strokeDasharray="1" d="M2 7C14 1 22 1 32 7S50 12 60 7S76 3 86 7S104 9 118 6"
                  fill="none" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
            )}
          </span>
        ))}
      </h2>
    </div>
  )
}
