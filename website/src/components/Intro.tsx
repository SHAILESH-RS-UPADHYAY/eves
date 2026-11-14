import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'

// The EVES mark (same as shailesh-ai.codes): speech decays into a waiting cursor.
export const WAVE = 'M2.5 12C4 4.4 5.9 4.4 7.4 12C8.5 17.2 9.9 17.2 11 12C11.7 9.2 12.7 9.2 13.4 12H15.2'
export const MARK_VIEWBOX = '-1.1 0 24 24'

const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
/** Seconds the hero waits so its own entrance plays as the intro hands off. */
export const INTRO_S = reduce ? 0 : 2.5

/**
 * Opening sequence: someone draws the mark by hand, fast — pen nib on the tip, a boiling
 * (slightly shaky) line, quick strokes with tiny pauses at the peaks, the cursor outlined then
 * stamped, "EVES" written out — then the mark flies into the navbar. Click to skip.
 */
export function Intro() {
  const [done, setDone] = useState(reduce)
  const bg = useRef<HTMLDivElement>(null)
  const mark = useRef<SVGSVGElement>(null)
  const path = useRef<SVGPathElement>(null)
  const outline = useRef<SVGRectElement>(null)
  const fill = useRef<SVGRectElement>(null)
  const nib = useRef<SVGCircleElement>(null)
  const turb = useRef<SVGFETurbulenceElement>(null)
  const disp = useRef<SVGFEDisplacementMapElement>(null)
  const word = useRef<SVGSVGElement>(null)
  const label = useRef<HTMLSpanElement>(null)
  const tlRef = useRef<gsap.core.Timeline>()

  useLayoutEffect(() => {
    if (reduce) return
    const p = path.current!, len = p.getTotalLength()
    const pen = { v: 0 }
    p.style.strokeDasharray = `${len}`
    p.style.strokeDashoffset = `${len}`
    const move = () => {
      const pt = p.getPointAtLength(pen.v * len)
      nib.current!.setAttribute('cx', `${pt.x}`)
      nib.current!.setAttribute('cy', `${pt.y}`)
      p.style.strokeDashoffset = `${len * (1 - pen.v)}`
      label.current!.textContent = `drawing eves.mark  ${Math.round(pen.v * 82)}%`
    }
    // "boil": re-seed the noise so the line shivers like a hand-drawn frame
    const boil = setInterval(() => turb.current?.setAttribute('seed', `${(Math.random() * 999) | 0}`), 70)
    const letters = word.current!.querySelectorAll('text')

    const finish = () => {
      clearInterval(boil)
      document.documentElement.classList.remove('intro-playing')
      setDone(true)
    }
    const fly = () => {
      const target = document.getElementById('nav-mark')?.getBoundingClientRect()
      const from = mark.current!.getBoundingClientRect()
      if (!target) return
      gsap.to(mark.current, {
        x: target.left + target.width / 2 - (from.left + from.width / 2),
        y: target.top + target.height / 2 - (from.top + from.height / 2),
        scale: target.width / from.width,
        duration: 0.6, ease: 'power3.inOut',
      })
    }

    const tl = gsap.timeline({ onComplete: finish })
    tlRef.current = tl
    tl.from(nib.current, { opacity: 0, scale: 0, transformOrigin: 'center', duration: 0.12 })
      .to(pen, { v: 0.3, duration: 0.3, ease: 'power1.inOut', onUpdate: move })
      .to(pen, { v: 0.62, duration: 0.26, ease: 'power2.inOut', onUpdate: move }, '+=0.06')
      .to(pen, { v: 0.86, duration: 0.16, ease: 'power1.inOut', onUpdate: move }, '+=0.05')
      .to(pen, { v: 1, duration: 0.1, ease: 'power2.out', onUpdate: move })
      // pen hops to the cursor, outlines it, stamps it
      .to(nib.current, { attr: { cx: 18.8, cy: 6.5 }, duration: 0.08, ease: 'power2.in' })
      .fromTo(outline.current, { strokeDashoffset: 1, opacity: 1 }, { strokeDashoffset: 0, duration: 0.24, ease: 'power1.inOut' })
      .to(nib.current, { opacity: 0, duration: 0.1 })
      .to(fill.current, { opacity: 1, duration: 0.06 })
      .fromTo(mark.current, { scale: 1 }, { scale: 1.06, duration: 0.07, yoyo: true, repeat: 1, transformOrigin: 'center' }, '<')
      .call(() => { label.current!.textContent = 'drawing eves.mark  100%' })
      // write the wordmark
      .fromTo(letters, { strokeDashoffset: 60, fillOpacity: 0 }, { strokeDashoffset: 0, duration: 0.2, stagger: 0.07, ease: 'power1.inOut' }, '<')
      .to(letters, { fillOpacity: 1, duration: 0.15, stagger: 0.04 })
      .to(disp.current, { attr: { scale: 0 }, duration: 0.25 }, '<')
      .to({}, { duration: 0.15 })
      .add(fly)
      .to([word.current, label.current], { opacity: 0, y: 8, duration: 0.25 }, '<')
      .to(bg.current, { opacity: 0, duration: 0.45 }, '<0.15')
      .to({}, { duration: 0.2 })
    return () => { clearInterval(boil); tl.kill() }
  }, [])

  if (done) return null
  return (
    <div className="intro" onClick={() => tlRef.current?.progress(1)} aria-hidden>
      <div ref={bg} className="intro-bg" />
      <svg ref={mark} className="intro-mark" viewBox={MARK_VIEWBOX} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <defs>
          <filter id="rough" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence ref={turb} type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="1" />
            <feDisplacementMap ref={disp} in="SourceGraphic" scale="0.32" />
          </filter>
        </defs>
        <g filter="url(#rough)">
          <path ref={path} d={WAVE} stroke="var(--mark)" strokeWidth="2.1" />
          <rect ref={outline} x="17.2" y="6.5" width="3.2" height="11" rx="0.5" stroke="var(--mark)" strokeWidth="0.8" pathLength={1} strokeDasharray="1" opacity="0" />
          <rect ref={fill} x="17.2" y="6.5" width="3.2" height="11" rx="0.5" fill="var(--mark)" opacity="0" />
        </g>
        <circle ref={nib} cx="2.5" cy="12" r="0.9" fill="var(--text-primary)" />
      </svg>
      <svg ref={word} className="intro-word" viewBox="0 0 200 50">
        {'EVES'.split('').map((c, i) => (
          <text key={i} x={46 + i * 36} y="40" textAnchor="middle" strokeDasharray="60">{c}</text>
        ))}
      </svg>
      <span ref={label} className="intro-label">drawing eves.mark  0%</span>
    </div>
  )
}
