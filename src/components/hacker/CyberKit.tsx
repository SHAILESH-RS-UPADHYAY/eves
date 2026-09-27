import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Maximize2, X, Cpu, Wifi, HardDrive, Activity, Radio, Lock, Signal, Gauge, Sparkles, Brain } from 'lucide-react'
import { EvesLogo } from '../brand/EvesLogo'
import { CyberArt } from './CyberArt'
import { useSettingsStore } from '../../store/settings.store'
import { useUIStore } from '../../store/ui.store'
import { PROVIDERS, activeProvider } from '../../lib/providers'

const C = {
  cyan: '#22d3ee', green: '#7ee787', red: '#ff5370', yellow: '#ffcb6b',
  orange: '#f78c6c', blue: '#61afef', purple: '#c678dd', fg: '#abb2bf',
  mut: 'rgba(171,178,191,0.5)',
}
const mono = '"Courier New", Consolas, monospace'

/* ═══════════════ SECTION DIVIDER ═══════════════ */
export function SectionDivider({ label, color = C.green, right }: { label: string; color?: string; right?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0 16px' }}>
      <span style={{ fontSize: '11px', fontFamily: mono, color, fontWeight: 700, letterSpacing: '2px', textShadow: `0 0 10px ${color}55`, whiteSpace: 'nowrap' }}>
        ▌ {label}
      </span>
      <div className="neon-rule" style={{ flex: 1 }} />
      {right ?? <span style={{ fontSize: '9px', fontFamily: mono, color: C.mut, letterSpacing: '1px' }}>secure · local</span>}
    </div>
  )
}

/* ═══════════════ EXPANDABLE CARD (hover-lift + click to enlarge) ═══════════════ */
export function ExpandableCard({
  title, accent = C.cyan, subtitle, tag, minHeight = 180, children,
}: {
  title: string
  accent?: string
  subtitle?: string
  tag?: string
  minHeight?: number
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const Header = ({ big }: { big?: boolean }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '9px', borderBottom: '1px solid rgba(171,178,191,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', minWidth: 0 }}>
        <span style={{ fontSize: big ? '13px' : '11px', fontFamily: mono, color: accent, fontWeight: 700, letterSpacing: '1px', textShadow: `0 0 8px ${accent}55`, whiteSpace: 'nowrap' }}>
          ▌ {title}
        </span>
        {subtitle && <span style={{ fontSize: '9px', fontFamily: mono, color: C.mut, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subtitle}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {tag && <span style={{ fontSize: '8px', fontFamily: mono, color: accent, border: `1px solid ${accent}44`, borderRadius: '4px', padding: '2px 6px', letterSpacing: '0.5px' }}>{tag}</span>}
        {big ? (
          <button onClick={() => setOpen(false)} aria-label="close" style={iconBtn(C.red)}><X size={13} /></button>
        ) : (
          <button onClick={() => setOpen(true)} aria-label="expand" style={iconBtn(accent)}><Maximize2 size={12} /></button>
        )}
      </div>
    </div>
  )

  return (
    <>
      <div className="atom-glass atom-glass-hover" style={{ padding: '15px 17px', fontFamily: mono, minHeight, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(9,11,15,0.84)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}
          >
            <motion.div
              initial={{ scale: 0.94, y: 14, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="atom-glass glass-scrollbar"
              style={{ width: 'min(980px, 94vw)', maxHeight: '86vh', overflow: 'auto', padding: '22px 26px', fontFamily: mono, boxShadow: `0 24px 80px rgba(0,0,0,0.7), 0 0 60px ${accent}22` }}
            >
              <Header big />
              <div style={{ fontSize: '13px' }}>{children}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
function iconBtn(color: string): CSSProperties {
  return { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '20px', borderRadius: '5px', border: `1px solid ${color}33`, background: `${color}11`, color, cursor: 'pointer', transition: 'all 0.2s ease' }
}

/* ═══════════════ SYSTEM RECON — real laptop data ═══════════════ */
type KV = { k: string; v: string; c: string }
export function SystemRecon() {
  const [rows, setRows] = useState<KV[]>([])
  const [clock, setClock] = useState('')
  const [heap, setHeap] = useState('—')
  const [uptime, setUptime] = useState('00:00:00')
  const started = useRef(Date.now())

  useEffect(() => {
    const nav = navigator as any
    const gpu = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl') as WebGLRenderingContext | null
        const dbg = gl?.getExtension('WEBGL_debug_renderer_info')
        return dbg ? String(gl!.getParameter((dbg as any).UNMASKED_RENDERER_WEBGL)) : 'GPU/OK'
      } catch { return 'GPU/OK' }
    })()
    const base: KV[] = [
      { k: 'HOST', v: nav.userAgentData?.platform || navigator.platform || 'unknown', c: C.green },
      { k: 'CORES', v: `${navigator.hardwareConcurrency || '?'} threads`, c: C.cyan },
      { k: 'DEVICE_MEM', v: nav.deviceMemory ? `${nav.deviceMemory} GB` : 'restricted', c: C.yellow },
      { k: 'GPU', v: gpu.slice(0, 42), c: C.purple },
      { k: 'DISPLAY', v: `${screen.width}×${screen.height} @${window.devicePixelRatio}x`, c: C.blue },
      { k: 'COLOR', v: `${screen.colorDepth}-bit`, c: C.orange },
      { k: 'LANG', v: navigator.language, c: C.green },
      { k: 'TIMEZONE', v: Intl.DateTimeFormat().resolvedOptions().timeZone, c: C.cyan },
      { k: 'ONLINE', v: navigator.onLine ? 'CONNECTED' : 'OFFLINE', c: navigator.onLine ? C.green : C.red },
    ]
    const conn = nav.connection
    if (conn) base.push({ k: 'NET', v: `${conn.effectiveType || '?'} · ↓${conn.downlink || '?'}Mbps · ${conn.rtt || '?'}ms`, c: C.blue })
    setRows(base)

    if (nav.getBattery) nav.getBattery().then((b: any) => {
      setRows((r) => [...r, { k: 'BATTERY', v: `${Math.round(b.level * 100)}% ${b.charging ? '⚡ charging' : 'on battery'}`, c: b.charging ? C.green : C.yellow }])
    }).catch(() => {})
    if (navigator.storage?.estimate) navigator.storage.estimate().then((e: any) => {
      const used = (e.usage / 1e9).toFixed(2), quota = (e.quota / 1e9).toFixed(1)
      setRows((r) => [...r, { k: 'STORAGE', v: `${used} / ${quota} GB used`, c: C.cyan }])
    }).catch(() => {})

    const iv = setInterval(() => {
      const now = new Date()
      setClock(now.toLocaleTimeString('en-GB'))
      const up = Math.floor((Date.now() - started.current) / 1000)
      const mem = (performance as any).memory
      if (mem) setHeap(`${(mem.usedJSHeapSize / 1048576).toFixed(1)} / ${(mem.jsHeapSizeLimit / 1048576).toFixed(0)} MB`)
      setUptime(`${String(Math.floor(up / 3600)).padStart(2, '0')}:${String(Math.floor(up / 60) % 60).padStart(2, '0')}:${String(up % 60).padStart(2, '0')}`)
    }, 1000)
    return () => clearInterval(iv)
  }, [])

  return (
    <div style={{ fontFamily: mono }}>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <EvesLogo size={78} />
          <span style={{ fontSize: '9px', color: C.green, letterSpacing: '1px' }}>root@eves</span>
          <span style={{ fontSize: '8px', color: C.mut }}>neofetch --hacker</span>
        </div>
        <div style={{ flex: 1, minWidth: '220px', display: 'grid', gridTemplateColumns: '1fr', gap: '3px' }}>
          {rows.map((r) => (
            <div key={r.k} style={{ display: 'flex', gap: '10px', fontSize: '10.5px', alignItems: 'baseline', animation: 'logFadeIn 0.3s ease' }}>
              <span style={{ color: C.cyan, width: '92px', flexShrink: 0, fontWeight: 700 }}>{r.k}</span>
              <span style={{ color: C.mut }}>::</span>
              <span style={{ color: r.c, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.v}</span>
            </div>
          ))}
          <div style={{ display: 'flex', gap: '10px', fontSize: '10.5px', alignItems: 'baseline' }}>
            <span style={{ color: C.cyan, width: '92px', flexShrink: 0, fontWeight: 700 }}>JS_HEAP</span>
            <span style={{ color: C.mut }}>::</span>
            <span style={{ color: C.green }}>{heap}</span>
          </div>
          <div style={{ display: 'flex', gap: '10px', fontSize: '10.5px', alignItems: 'baseline' }}>
            <span style={{ color: C.cyan, width: '92px', flexShrink: 0, fontWeight: 700 }}>SESSION_UP</span>
            <span style={{ color: C.mut }}>::</span>
            <span style={{ color: C.yellow, fontVariantNumeric: 'tabular-nums' }}>{uptime}</span>
          </div>
          <div style={{ display: 'flex', gap: '10px', fontSize: '10.5px', alignItems: 'baseline' }}>
            <span style={{ color: C.cyan, width: '92px', flexShrink: 0, fontWeight: 700 }}>LOCAL_TIME</span>
            <span style={{ color: C.mut }}>::</span>
            <span style={{ color: C.orange, fontVariantNumeric: 'tabular-nums' }}>{clock}</span>
          </div>
        </div>
      </div>
      {/* activity meters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(171,178,191,0.1)' }}>
        <Activity size={12} style={{ color: C.green }} />
        <span style={{ fontSize: '9px', color: C.mut, letterSpacing: '0.5px' }}>SYS_ACTIVITY</span>
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '2px', height: '22px' }}>
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end' }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '1px', background: i % 7 === 0 ? C.green : i % 5 === 0 ? C.cyan : 'rgba(126,231,135,0.55)', transformBox: 'fill-box', transformOrigin: 'bottom', animation: `barEq ${0.7 + (i % 6) * 0.16}s ease-in-out ${i * 0.04}s infinite` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════ CONNECTION MATRIX — real config-driven ═══════════════ */
export function ConnectionMatrix() {
  const settings = useSettingsStore((s) => s.settings)
  const [ping, setPing] = useState<Record<string, number>>({})
  const links = [
    { name: 'DEEPGRAM', ep: 'wss://api.deepgram.com/v1/listen', on: !!settings.deepgramApiKey, note: 'nova-2 · transcription', c: C.cyan, Icon: Radio },
    { name: 'GROQ', ep: PROVIDERS.groq.base, on: !!settings.groqApiKey, note: settings.aiModels.groq, c: C.green, Icon: Cpu },
    { name: 'GEMINI', ep: PROVIDERS.gemini.base, on: !!settings.geminiApiKey, note: settings.aiModels.gemini, c: C.blue, Icon: Sparkles },
    { name: 'OPENAI', ep: PROVIDERS.openai.base, on: !!settings.openaiApiKey, note: settings.aiModels.openai, c: C.purple, Icon: Brain },
    { name: 'GOOGLE_DRIVE', ep: 'drive.googleapis.com/v3', on: false, note: 'audio archive sync', c: C.green, Icon: HardDrive },
    { name: 'NOTION', ep: 'api.notion.com/v1/pages', on: !!settings.notionDatabaseId, note: 'insight export', c: C.orange, Icon: Signal },
  ]
  const active = links.filter((l) => l.on).length
  useEffect(() => {
    const iv = setInterval(() => {
      const p: Record<string, number> = {}
      links.forEach((l) => { if (l.on) p[l.name] = 12 + Math.floor(Math.random() * 70) })
      setPing(p)
    }, 1200)
    return () => clearInterval(iv)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.deepgramApiKey, settings.groqApiKey, settings.geminiApiKey, settings.openaiApiKey, settings.notionDatabaseId])

  return (
    <div style={{ fontFamily: mono }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '9px', color: C.mut }}>
        <span>UPLINK STATUS</span>
        <span><span style={{ color: active ? C.green : C.red }}>{active}</span>/{links.length} CHANNELS ACTIVE</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {links.map((l) => {
          const status = l.on ? 'LINKED' : l.name === 'GOOGLE_DRIVE' ? 'STANDBY' : 'NO_KEY'
          const sc = l.on ? C.green : l.name === 'GOOGLE_DRIVE' ? C.yellow : C.red
          const ms = ping[l.name]
          return (
            <div key={l.name} style={{ border: '1px solid rgba(171,178,191,0.1)', borderRadius: '8px', padding: '9px 11px', background: 'rgba(22,24,29,0.4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <l.Icon size={13} style={{ color: l.c, flexShrink: 0 }} />
                <span style={{ fontSize: '11px', color: l.c, fontWeight: 700, letterSpacing: '0.5px' }}>{l.name}</span>
                <span style={{ flex: 1 }} />
                <span style={{ fontSize: '9px', color: sc, fontWeight: 700, textShadow: `0 0 6px ${sc}44`, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: sc, boxShadow: `0 0 6px ${sc}`, animation: l.on ? 'pulseDot 1.6s ease-in-out infinite' : undefined }} />
                  {status}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                <span style={{ fontSize: '8.5px', color: C.mut, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{l.ep} · {l.note}</span>
                {l.on && <span style={{ fontSize: '8.5px', color: C.green, fontVariantNumeric: 'tabular-nums' }}>{ms ?? '—'}ms</span>}
              </div>
              {/* latency bar */}
              <div style={{ height: '3px', borderRadius: '2px', background: 'rgba(171,178,191,0.08)', marginTop: '6px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: l.on ? `${Math.min(100, (ms ?? 30))}%` : '0%', background: `linear-gradient(90deg, ${sc}, transparent)`, transition: 'width 1s ease' }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ═══════════════ CONFIG CONSOLE — real settings as .conf ═══════════════ */
export function ConfigConsole() {
  const settings = useSettingsStore((s) => s.settings)
  const setSettingsOpen = useUIStore((s) => s.setSettingsOpen)
  const mask = (k: string) => (k ? `set · ****${k.slice(-4)}` : 'NOT_SET')
  const brain = activeProvider(settings)
  const line = (k: string, v: string, c: string) => (
    <div style={{ display: 'flex', fontSize: '10.5px', lineHeight: 1.9 }}>
      <span style={{ color: C.blue, width: '150px', flexShrink: 0 }}>{k}</span>
      <span style={{ color: C.mut }}>= </span>
      <span style={{ color: c, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={v}>{v}</span>
    </div>
  )
  const sec = (t: string) => <div style={{ color: C.purple, fontSize: '10px', marginTop: '10px', letterSpacing: '1px' }}>[{t}]</div>
  return (
    <div style={{ fontFamily: mono }}>
      <div style={{ color: C.mut, fontSize: '9px', marginBottom: '4px' }}># ~/.eves/config.toml · live</div>
      {sec('transcription')}
      {line('engine', 'deepgram/nova-2', C.green)}
      {line('language', settings.defaultLanguage, C.yellow)}
      {line('diarization', String(settings.enableDiarization), settings.enableDiarization ? C.green : C.red)}
      {line('auto_transcribe', String(settings.autoTranscribe), settings.autoTranscribe ? C.green : C.red)}
      {sec('brain')}
      {line('provider', brain ? PROVIDERS[brain].label : 'NO_KEY', brain ? C.cyan : C.red)}
      {line('model', brain ? settings.aiModels[brain] : '—', C.cyan)}
      {line('auto_analyze', String(settings.autoAnalyze), settings.autoAnalyze ? C.green : C.red)}
      {line('reply_language', settings.brainLanguage, C.yellow)}
      {sec('workspace')}
      {line('company_repo', settings.companyRepoPath || 'NOT_ATTACHED', settings.companyRepoPath ? C.green : C.yellow)}
      {line('skill_vault', settings.referenceRepoPath || 'NOT_ATTACHED', settings.referenceRepoPath ? C.green : C.yellow)}
      {line('prompt_paths', settings.promptPathStyle, C.purple)}
      {sec('security')}
      {line('deepgram_key', mask(settings.deepgramApiKey), settings.deepgramApiKey ? C.green : C.red)}
      {line('groq_key', mask(settings.groqApiKey), settings.groqApiKey ? C.green : C.red)}
      {line('gemini_key', mask(settings.geminiApiKey), settings.geminiApiKey ? C.green : C.red)}
      {line('openai_key', mask(settings.openaiApiKey), settings.openaiApiKey ? C.green : C.red)}
      <button onClick={() => setSettingsOpen(true)} style={{ marginTop: '14px', padding: '8px 16px', background: `${C.cyan}14`, border: `1px solid ${C.cyan}44`, borderRadius: '6px', color: C.cyan, fontFamily: mono, fontSize: '11px', fontWeight: 700, letterSpacing: '1px', cursor: 'pointer', textShadow: `0 0 8px ${C.cyan}55`, display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
        <Lock size={12} /> ▸ edit_config
      </button>
    </div>
  )
}

/* ═══════════════ DECRYPT STANDBY — empty transcript screen ═══════════════ */
const hx = () => Array.from({ length: 24 }).map(() => (Math.random() * 256 | 0).toString(16).padStart(2, '0')).join(' ')
export function DecryptStandby({ archived = 0 }: { archived?: number }) {
  const [lines, setLines] = useState<string[]>(() => Array.from({ length: 6 }).map(hx))
  useEffect(() => {
    const iv = setInterval(() => setLines((l) => [hx(), ...l].slice(0, 6)), 320)
    return () => clearInterval(iv)
  }, [])
  return (
    <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', minHeight: '420px', border: '1px solid rgba(171,178,191,0.12)', fontFamily: mono }}>
      <CyberArt variant="stealth" accent={C.green} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(19,21,25,0.35), rgba(15,17,20,0.82))' }} />
      <div style={{ position: 'relative', zIndex: 2, height: '100%', minHeight: '420px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', textAlign: 'center' }}>
        <div style={{ fontSize: '10px', color: C.green, letterSpacing: '3px', marginBottom: '10px', textShadow: `0 0 10px ${C.green}66` }}>
          ◈ SIGNAL_INTERCEPT
        </div>
        <div className="rgb-text" style={{ fontSize: '30px', fontWeight: 800, letterSpacing: '4px', marginBottom: '8px' }}>STANDBY</div>
        <div style={{ fontSize: '12px', color: C.mut, maxWidth: '440px', lineHeight: 1.7, marginBottom: '18px' }}>
          No transcript decrypted. Capture a live session to intercept audio and stream it through the neural core.
        </div>
        <div style={{ width: 'min(420px, 90%)', background: 'rgba(10,12,16,0.6)', border: '1px solid rgba(126,231,135,0.14)', borderRadius: '8px', padding: '12px 14px', textAlign: 'left', marginBottom: '18px' }}>
          {lines.map((l, i) => (
            <div key={`${i}-${l.slice(0, 4)}`} style={{ fontSize: '9px', letterSpacing: '0.5px', color: i === 0 ? C.green : `rgba(126,231,135,${0.6 - i * 0.09})`, animation: i === 0 ? 'logFadeIn 0.25s ease' : undefined }}>
              <span style={{ color: C.mut }}>{(i * 24).toString(16).padStart(4, '0')}:</span> {l}
            </div>
          ))}
          <div style={{ fontSize: '9px', color: C.cyan, marginTop: '4px' }}>decrypting<span style={{ animation: 'cursorBlink 1s step-end infinite' }}>...</span></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '10px', color: C.mut }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Gauge size={12} style={{ color: C.yellow }} /> archive: <span style={{ color: C.yellow }}>{archived} sessions</span></span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Wifi size={12} style={{ color: C.green }} /> press <span style={{ color: C.green }}>Alt+L</span> to intercept</span>
        </div>
      </div>
    </div>
  )
}
