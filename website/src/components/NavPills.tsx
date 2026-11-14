import { useEffect, useRef, useState } from 'react'
import { REPO } from '../lib'

type Pill = {
  id: string; label: string; href: string; external?: boolean
  icon: JSX.Element; preview: { title: string; items: [string, string][] }
}

const PILLS: Pill[] = [
  { id: 'features', label: 'Features', href: '#features',
    icon: <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />,
    preview: { title: 'What EVES does', items: [['Transcription', 'nova-2 · speakers'], ['Intent', 'real goals'], ['Actions', 'owner + priority'], ['Sentinel', 'stays local'], ['Drive', 'import · write back'], ['Notion', 'one-click page']] } },
  { id: 'how', label: 'How it works', href: '#how',
    icon: <path d="M5 6h2M5 12h2M5 18h2M11 6h8M11 12h8M11 18h8" />,
    preview: { title: 'From call to clarity', items: [['01 Drop', 'MP3 · WAV · M4A · Drive'], ['02 Analyze', 'transcribe → understand'], ['03 Act', 'review · export · prompt']] } },
  { id: 'github', label: 'GitHub', href: REPO, external: true,
    icon: <path d="M9 19c-4 1.3-4-2-6-2.5M15 21v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1-.3-3.4 1.3a11.6 11.6 0 0 0-6 0C6.8 2.8 5.8 3.1 5.8 3.1a4.3 4.3 0 0 0-.1 3.2A4.6 4.6 0 0 0 4.4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />,
    preview: { title: 'SHAILESH-RS-UPADHYAY/eves-releases', items: [['Stack', 'Electron · React · TS'], ['Runs on', 'Windows · macOS'], ['Releases', 'installers ↗']] } },
]

/**
 * Pill group: a soft indicator glides (springy) to whichever pill you hover, otherwise rests on the
 * section you are reading. Hovering opens a detailed preview card that slides down under the pill.
 */
export function NavPills() {
  const wrap = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<string | null>(null)
  const [hover, setHover] = useState<string | null>(null)
  const [box, setBox] = useState<{ left: number; width: number } | null>(null)

  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) setActive(e.target.id) }),
      { rootMargin: '-45% 0px -45% 0px' },
    )
    for (const id of ['features', 'how']) { const el = document.getElementById(id); if (el) io.observe(el) }
    const top = () => { if (window.scrollY < 200) setActive(null) }
    window.addEventListener('scroll', top, { passive: true })
    return () => { io.disconnect(); window.removeEventListener('scroll', top) }
  }, [])

  const target = hover ?? active
  useEffect(() => {
    const el = target ? wrap.current?.querySelector<HTMLElement>(`[data-pill="${target}"]`) : null
    setBox(el ? { left: el.offsetLeft, width: el.offsetWidth } : null)
  }, [target])

  return (
    <div ref={wrap} className="pills nav-hide" onMouseLeave={() => setHover(null)}>
      <span className="pill-glider" style={box ? { transform: `translateX(${box.left}px)`, width: box.width, opacity: 1 } : { opacity: 0 }} />
      {PILLS.map((p) => (
        <div key={p.id} className="pill-slot" onMouseEnter={() => setHover(p.id)}>
          <a data-pill={p.id} href={p.href} className={`pill${target === p.id ? ' on' : ''}`}
            {...(p.external ? { target: '_blank', rel: 'noreferrer' } : {})}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{p.icon}</svg>
            <span className="pill-label">{p.label}</span>
          </a>
          <div className={`pill-card${hover === p.id ? ' open' : ''}`} role="presentation">
            <div className="pill-card-title">{p.preview.title}</div>
            <ul>
              {p.preview.items.map(([k, v], i) => (
                <li key={k} style={{ transitionDelay: hover === p.id ? `${60 + i * 35}ms` : '0ms' }}><b>{k}</b><span>{v}</span></li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  )
}
