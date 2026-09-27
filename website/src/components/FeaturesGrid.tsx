import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Mic2, Brain, CheckSquare, ShieldOff, HardDrive, FileText } from 'lucide-react'

const features = [
  { icon: Mic2, color: '#7C3AED', title: 'AI Transcription', desc: 'Deepgram nova-2 transcribes with 95%+ accuracy. Speaker diarization identifies who said what.' },
  { icon: Brain, color: '#06B6D4', title: 'Intent Detection', desc: 'Groq analyzes hidden agendas, actual goals, and what wasn\'t said.' },
  { icon: CheckSquare, color: '#F43F5E', title: 'Action Extraction', desc: 'Every commitment and task auto-extracted with owner and priority.' },
  { icon: ShieldOff, color: '#F59E0B', title: 'Sentinel Mode', desc: 'Local-first vault. Audio, keys and transcripts stay on your machine.' },
  { icon: HardDrive, color: '#14B8A6', title: 'Drive Sync', desc: 'Fetch recordings directly from Google Drive. Upload summaries back automatically.' },
  { icon: FileText, color: '#A78BFA', title: 'Notion Export', desc: 'Export structured meeting pages to Notion with one click.' }
]

export function FeaturesGrid() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.feature-card',
        { opacity: 0, y: 60 },
        {
          opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' }
        }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section id="features" ref={sectionRef} style={{ padding: '120px 32px', flexDirection: 'column' }}>
      <h2 className="gradient-text" style={{ fontSize: '42px', fontWeight: 800, textAlign: 'center', marginBottom: '60px' }}>
        Intelligence in every interaction
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '24px',
        maxWidth: '1000px',
        width: '100%'
      }}>
        {features.map((f, i) => {
          const Icon = f.icon
          return (
            <div key={i} className="feature-card glass-card" style={{ padding: '28px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: `${f.color}22`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <Icon size={24} style={{ color: f.color }} />
              </div>
              <h3 className="gradient-text" style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>{f.title}</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
