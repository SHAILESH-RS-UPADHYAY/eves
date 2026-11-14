import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { SectionTitle } from './SectionTitle'

/* Hand-made line icons on a 24 grid, one stroke weight. Every path with class "fi-draw" is drawn on reveal;
   "fi-live" parts carry the small hover motion (see globals.css). */
const ICONS: Record<string, JSX.Element> = {
  transcribe: (<>
    {[5, 8, 11, 14].map((x, i) => <path key={i} className="fi-draw fi-live fi-bar" style={{ animationDelay: `${i * 0.12}s` }} d={`M${x} ${[10, 7, 9, 11][i]}V${[14, 17, 15, 13][i]}`} />)}
    <path className="fi-draw" d="M17.5 8.5h3M17.5 12h3M17.5 15.5h2" />
  </>),
  intent: (<>
    <circle className="fi-draw" cx="12" cy="12" r="8" />
    <circle className="fi-draw fi-live fi-pulse" cx="12" cy="12" r="4.2" />
    <path className="fi-draw" d="M12 2.5V6M12 18v3.5M2.5 12H6M18 12h3.5" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
  </>),
  actions: (<>
    <rect className="fi-draw" x="3.5" y="4" width="17" height="16" rx="3" />
    <path className="fi-draw fi-live fi-tick" d="M7 10l1.8 1.8L12 8.6" />
    <path className="fi-draw" d="M14 10.2h3M7 15.5h10" />
  </>),
  sentinel: (<>
    <path className="fi-draw" d="M12 3l7 2.8v5.4c0 4.4-3 7.8-7 9-4-1.2-7-4.6-7-9V5.8z" />
    <circle className="fi-draw" cx="12" cy="10.8" r="1.9" />
    <path className="fi-draw fi-live fi-key" d="M12 12.7v3.3" />
  </>),
  drive: (<>
    <path className="fi-draw" d="M7.5 18.5h9a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 6.6 11.1 3.7 3.7 0 0 0 7.5 18.5z" />
    <g className="fi-live fi-spin"><path className="fi-draw" d="M10 14.8a2.2 2.2 0 0 1 3.9-1.4M14 14.2a2.2 2.2 0 0 1-3.9 1.4" /></g>
  </>),
  notion: (<>
    <path className="fi-draw" d="M6 3.5h8.5L18 7v13.5H6z" />
    <path className="fi-draw" d="M14.5 3.5V7H18" />
    <path className="fi-draw fi-live fi-out" d="M9 13.5h5.5M12.5 11l2.2 2.5-2.2 2.5" />
  </>),
}

const features = [
  { icon: 'transcribe', title: 'AI Transcription', desc: 'Deepgram nova-2 turns every recording into a clean transcript, split by speaker so you always know who said what.',
    points: ['95%+ word accuracy', 'Speaker diarization', 'Hindi + English mixed calls'], spec: 'deepgram · nova-2' },
  { icon: 'intent', title: 'Intent Detection', desc: 'Groq reads between the lines: the goal behind the agenda, the decisions that were really made, and what nobody said out loud.',
    points: ['Stated vs. real goal', 'Open questions & concerns', 'Decisions flagged'], spec: 'groq · llm' },
  { icon: 'actions', title: 'Action Extraction', desc: 'Every commitment caught mid-sentence becomes a task with an owner and a priority, ready to hand to your coding agent.',
    points: ['Owner + priority', 'Prompt pills for Codex · Claude Code · Cursor', 'One-click copy'], spec: 'tasks · prompts' },
  { icon: 'sentinel', title: 'Sentinel Mode', desc: 'A local-first vault. Audio, transcripts and API keys live on your machine — nothing is uploaded unless you send it.',
    points: ['Per-meeting storage on disk', 'Keys never leave the device', 'No account required'], spec: 'local · private' },
  { icon: 'drive', title: 'Drive Sync', desc: 'Browse your Google Drive from inside EVES, pull recordings straight in, and push finished summaries back.',
    points: ['Folder browser', 'Direct audio import', 'Summaries written back'], spec: 'google drive' },
  { icon: 'notion', title: 'Notion Export', desc: 'Send a structured meeting page to Notion in one click — summary, decisions and action items as real checkboxes.',
    points: ['Structured page layout', 'Checkbox action items', 'Speaker profiles'], spec: 'notion · mcp' },
]

export function FeaturesGrid() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.feature-card').forEach((card, i) => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 88%', once: true }, delay: (i % 3) * 0.12 })
        tl.fromTo(card, { opacity: 0, y: 40, clipPath: 'inset(18% 0 0 0 round 18px)' },
                        { opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0 round 18px)', duration: 0.7, ease: 'power3.out' })
          .fromTo(card.querySelectorAll('.fi-draw'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.6, stagger: 0.06, ease: 'power2.inOut' }, '-=0.4')
          .fromTo(card.querySelectorAll('.fc-point'), { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.35, stagger: 0.07 }, '-=0.4')
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section id="features" ref={sectionRef} style={{ padding: '120px 24px', flexDirection: 'column' }}>
      <SectionTitle text="Intelligence in every interaction" accent="interaction" kicker="01 — Capabilities" />
      <div className="features">
        {features.map((f, i) => (
          <article key={f.title} className="feature-card">
            <div className="fc-head">
              <div className="fc-icon">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  {ICONS[f.icon]}
                </svg>
              </div>
              <span className="fc-num">{String(i + 1).padStart(2, '0')}</span>
            </div>
            <h3 className="fc-title">{f.title}</h3>
            <p className="fc-desc">{f.desc}</p>
            <ul className="fc-points">
              {f.points.map((p) => <li key={p} className="fc-point">{p}</li>)}
            </ul>
            <div className="fc-spec">{f.spec}</div>
          </article>
        ))}
      </div>
    </section>
  )
}
