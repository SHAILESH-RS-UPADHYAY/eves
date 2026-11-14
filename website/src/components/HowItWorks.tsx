import { SectionTitle } from './SectionTitle'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Upload, Cpu, Sparkles } from 'lucide-react'

const steps = [
  { num: '01', icon: Upload, color: 'var(--accent)', title: 'Drop your recording', desc: 'Drag any audio file — MP3, WAV, M4A. Or sync directly from Google Drive.' },
  { num: '02', icon: Cpu, color: 'var(--accent)', title: 'AI processes and analyzes', desc: 'Deepgram transcribes with speaker diarization. Groq extracts intentions, actions, and sentiment.' },
  { num: '03', icon: Sparkles, color: 'var(--accent)', title: 'Review insights and export', desc: 'Interactive transcript, radar charts, action items. Export to Notion in one click.' }
]

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.step-item',
        { opacity: 0, x: -40 },
        {
          opacity: 1, x: 0, duration: 0.6, stagger: 0.2, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' }
        }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section id="how" ref={sectionRef} style={{ padding: '120px 32px', flexDirection: 'column' }}>
      <SectionTitle text="Three steps to clarity" accent="clarity" kicker="02 — Workflow" />
      <div style={{ display: 'flex', gap: '48px', maxWidth: '900px', width: '100%', alignItems: 'flex-start' }}>
        {steps.map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} className="step-item" style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
              <div style={{
                fontSize: '48px', fontWeight: 900,
                background: 'var(--gradient-text)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '16px'
              }}>{s.num}</div>
              <div style={{
                width: '56px', height: '56px', borderRadius: '16px',
                background: 'var(--accent-soft)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Icon size={28} style={{ color: s.color }} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>{s.title}</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s.desc}</p>
              {i < steps.length - 1 && (
                <div style={{
                  position: 'absolute',
                  right: '-24px',
                  top: '30px',
                  width: '48px',
                  height: '2px',
                  background: 'linear-gradient(90deg, var(--accent-soft), transparent)'
                }} />
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
