import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Terminal, Shield, Mic2, Brain, Zap, FileText, Key } from 'lucide-react'
import { StatsRow } from './StatsRow'
import { MeetingFeed } from './MeetingFeed'
import { RecentInsights } from './RecentInsights'
import { useMeetingsStore } from '../../store/meetings.store'
import { useUIStore } from '../../store/ui.store'
import { MatrixRain } from '../hacker/MatrixRain'
import { GlitchText } from '../hacker/GlitchText'
import { SystemStatus } from '../hacker/SystemStatus'
import { LiveLogFeed } from '../hacker/LiveLogFeed'
import { RadarSweep } from '../hacker/RadarSweep'
import { HackerImage } from '../hacker/HackerImage'
import type { CyberVariant } from '../hacker/CyberArt'
import { PacketSniffer, PortScan, ThreatMap, CipherStream, DataTicker, AsciiBanner } from '../hacker/HackerPanels'

const features: {
  icon: typeof Brain
  color: string
  title: string
  desc: string
  variant: CyberVariant
  topLabel: string
}[] = [
  {
    icon: Brain,
    color: '#22d3ee',
    title: 'AI TRANSCRIPTION',
    desc: 'Deepgram nova-3 engine. Multilingual code-switching. Real-time streaming with speaker diarization.',
    variant: 'neural',
    topLabel: '> MODULE_01.DLL'
  },
  {
    icon: Shield,
    color: '#7ee787',
    title: 'SENTINEL MODE',
    desc: 'Local-first vault. Keys, audio and transcripts never leave this machine. Zero cloud footprint.',
    variant: 'sentinel',
    topLabel: '> MODULE_02.DLL'
  },
  {
    icon: Mic2,
    color: '#ffcb6b',
    title: 'AUDIO CAPTURE',
    desc: 'Internal loopback (system audio) + external microphone. Runtime source toggle. 16kHz PCM.',
    variant: 'waveform',
    topLabel: '> MODULE_03.DLL'
  },
  {
    icon: Zap,
    color: '#f78c6c',
    title: 'AI SUMMARIZATION',
    desc: 'Groq · Gemini · OpenAI brain. Summary + main goal + action items. Prompt pills for Codex / Claude / Cursor.',
    variant: 'circuit',
    topLabel: '> MODULE_04.DLL'
  },
]

const hotkeys = [
  { keys: 'Alt+L', action: 'Start / Stop Listening', color: '#00F5FF' },
  { keys: 'Alt+Backspace', action: 'Hide / Show EVES Popup', color: '#A78BFA' },
  { keys: 'Alt+O', action: 'Cycle Audio Source', color: '#FCD34D' },
  { keys: 'Alt+T', action: 'Toggle Click-Through', color: '#22D68C' },
  { keys: 'Alt+D', action: 'Show / Hide Dashboard', color: '#00F5FF' },
  { keys: 'Alt+Space', action: 'Stop + Save Session', color: '#FF006E' },
  { keys: 'Alt+Q', action: 'Quit EVES', color: '#FF006E' },
]

function HackerHeader() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 20px',
      borderBottom: '1px solid rgba(0, 245, 255, 0.1)',
      fontFamily: '"Courier New", monospace',
      marginBottom: '16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '14px', color: '#00F5FF', fontWeight: 700, letterSpacing: '1px', textShadow: '0 0 12px rgba(0,245,255,0.5)' }}>
          ▌ EVES
        </span>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>::</span>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.5px' }}>
          MEETING INTELLIGENCE SYSTEM
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: '#22D68C', boxShadow: '0 0 10px #22D68C',
            animation: 'pulseDot 1.5s ease-in-out infinite'
          }} />
          <span style={{ fontSize: '10px', color: '#22D68C', fontWeight: 700, letterSpacing: '0.5px', textShadow: '0 0 6px rgba(34,214,140,0.3)' }}>ONLINE</span>
        </div>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontVariantNumeric: 'tabular-nums' }}>
          {time.toTimeString().split(' ')[0]}
        </span>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const meetings = useMeetingsStore((s) => s.meetings)
  const setPage = useUIStore((s) => s.setPage)
  const setSettingsOpen = useUIStore((s) => s.setSettingsOpen)

  const totalMeetings = meetings.length
  const audioHours = meetings.reduce((sum, m) => sum + m.duration, 0) / 3600
  const pendingActions = meetings
    .filter((m) => m.analysis)
    .reduce((sum, m) => sum + m.analysis!.actionItems.filter((a) => !a.completed).length, 0)
  const speakers = new Set(
    meetings.filter((m) => m.analysis).flatMap((m) => m.analysis!.speakerProfiles.map((s) => s.name))
  ).size

  const handleLaunchEves = () => window.eves?.launchPopup()

  // The cyber landing page IS the dashboard — it renders whether or not meetings
  // exist. Saved sessions appear in the archive section at the bottom, so having
  // history never costs you the look.
  return (
    <motion.div
      style={{ padding: '0 24px 40px', height: '100%', overflow: 'auto' }}
      className="glass-scrollbar"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
        {/* Matrix rain inside the page content */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
          <MatrixRain opacity={0.03} color="#00F5FF" speed={2} />
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <HackerHeader />

          {/* ═══ TOP ROW: 3 columns — SystemStatus / Hero / LogFeed ═══ */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '240px 1fr 300px',
            gap: '16px',
            marginBottom: '16px'
          }}>
            {/* Left: System Status */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <SystemStatus />
            </motion.div>

            {/* Center: Hero — taller, more dramatic */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <div style={{
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid rgba(0, 245, 255, 0.15)',
                height: '460px',
                background: 'rgba(0, 0, 0, 0.7)'
              }}>
                {/* Hero background — live network graph (self-contained, always renders) */}
                <HackerImage
                  variant="network"
                  accent="#22d3ee"
                  height="460px"
                />

                {/* Overlay content */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 10,
                  padding: '40px'
                }}>
                  {/* Terminal prompt line */}
                  <div style={{
                    fontSize: '11px',
                    fontFamily: '"Courier New", monospace',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    padding: '6px 16px',
                    borderRadius: '4px',
                    border: '1px solid rgba(0, 245, 255, 0.15)'
                  }}>
                    <span style={{ color: '#22D68C' }}>evessys@localhost</span>
                    <span style={{ color: 'rgba(255,255,255,0.2)' }}>:</span>
                    <span style={{ color: '#00F5FF' }}>~/eves</span>
                    <span style={{ color: 'rgba(255,255,255,0.2)' }}>$</span>
                    <span style={{ color: 'rgba(252, 211, 77, 0.7)' }}>./eves --init</span>
                    <span style={{ color: '#00F5FF', animation: 'cursorBlink 1s step-end infinite' }}>▊</span>
                  </div>

                  {/* Version badge */}
                  <div style={{
                    fontSize: '10px',
                    fontFamily: '"Courier New", monospace',
                    color: 'rgba(0, 245, 255, 0.6)',
                    letterSpacing: '2px',
                    marginBottom: '16px',
                    textShadow: '0 0 6px rgba(0, 245, 255, 0.4)'
                  }}>
                    [ MEETING INTELLIGENCE SYSTEM v2.1.0 ]
                  </div>

                  <GlitchText text="YOUR MEETINGS." size="42px" color="#00F5FF" />
                  <div style={{ height: '8px' }} />
                  <GlitchText text="HACKED." size="42px" color="#22D68C" />

                  <p style={{
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.6)',
                    maxWidth: '440px',
                    textAlign: 'center',
                    margin: '20px 0 28px',
                    lineHeight: 1.7,
                    fontFamily: '"Courier New", monospace'
                  }}>
                    <span style={{ color: '#00F5FF' }}>EVES</span> listens,{' '}
                    <span style={{ color: '#22D68C' }}>transcribes</span>, and extracts{' '}
                    <span style={{ color: '#FCD34D' }}>intelligence</span> from every conversation.
                    Private. Local. <span style={{ color: '#FF006E' }}>Devastatingly</span> accurate.
                  </p>

                  {/* Launch buttons */}
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={handleLaunchEves}
                      style={{
                        padding: '12px 28px',
                        background: 'rgba(0, 245, 255, 0.1)',
                        border: '1px solid rgba(0, 245, 255, 0.4)',
                        borderRadius: '6px',
                        color: '#00F5FF',
                        fontFamily: '"Courier New", monospace',
                        fontSize: '13px',
                        fontWeight: 700,
                        letterSpacing: '1px',
                        cursor: 'pointer',
                        textShadow: '0 0 8px rgba(0, 245, 255, 0.5)',
                        boxShadow: '0 0 24px rgba(0, 245, 255, 0.1), inset 0 0 12px rgba(0, 245, 255, 0.05)',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(0, 245, 255, 0.2)'
                        e.currentTarget.style.boxShadow = '0 0 32px rgba(0, 245, 255, 0.3), inset 0 0 12px rgba(0, 245, 255, 0.1)'
                        e.currentTarget.style.borderColor = 'rgba(0, 245, 255, 0.8)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(0, 245, 255, 0.1)'
                        e.currentTarget.style.boxShadow = '0 0 24px rgba(0, 245, 255, 0.1), inset 0 0 12px rgba(0, 245, 255, 0.05)'
                        e.currentTarget.style.borderColor = 'rgba(0, 245, 255, 0.4)'
                      }}
                    >
                      <Terminal size={16} /> ./launch_eves
                    </button>

                    <button
                      onClick={() => setPage('meetings')}
                      style={{
                        padding: '12px 24px',
                        background: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px',
                        color: 'rgba(255,255,255,0.7)',
                        fontFamily: '"Courier New", monospace',
                        fontSize: '13px',
                        fontWeight: 600,
                        letterSpacing: '1px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'
                        e.currentTarget.style.color = 'rgba(255,255,255,0.9)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                        e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
                      }}
                    >
                      <FileText size={16} /> history.log
                    </button>

                    <button
                      onClick={() => setSettingsOpen(true)}
                      style={{
                        padding: '12px 20px',
                        background: 'rgba(252, 211, 77, 0.08)',
                        border: '1px solid rgba(252, 211, 77, 0.25)',
                        borderRadius: '6px',
                        color: '#FCD34D',
                        fontFamily: '"Courier New", monospace',
                        fontSize: '12px',
                        fontWeight: 600,
                        letterSpacing: '1px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        textShadow: '0 0 6px rgba(252, 211, 77, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(252, 211, 77, 0.15)'
                        e.currentTarget.style.borderColor = 'rgba(252, 211, 77, 0.5)'
                        e.currentTarget.style.boxShadow = '0 0 16px rgba(252, 211, 77, 0.1)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(252, 211, 77, 0.08)'
                        e.currentTarget.style.borderColor = 'rgba(252, 211, 77, 0.25)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <Key size={14} /> api_keys
                    </button>
                  </div>

                  {/* Terminal output below buttons */}
                  <div style={{
                    marginTop: '24px',
                    width: '100%',
                    maxWidth: '500px',
                    background: 'rgba(0, 0, 0, 0.6)',
                    border: '1px solid rgba(0, 245, 255, 0.08)',
                    borderRadius: '6px',
                    padding: '12px 16px',
                    fontFamily: '"Courier New", monospace',
                    fontSize: '10px',
                    lineHeight: 1.8,
                    textAlign: 'left'
                  }}>
                    <div><span style={{ color: '#22D68C' }}>[OK]</span> <span style={{ color: 'rgba(255,255,255,0.5)' }}>Neural core initialized</span></div>
                    <div><span style={{ color: '#22D68C' }}>[OK]</span> <span style={{ color: 'rgba(255,255,255,0.5)' }}>Deepgram nova-2 WebSocket ready</span></div>
                    <div><span style={{ color: '#22D68C' }}>[OK]</span> <span style={{ color: 'rgba(255,255,255,0.5)' }}>Sentinel layer active (local vault sealed)</span></div>
                    <div><span style={{ color: '#FCD34D' }}>[WARN]</span> <span style={{ color: 'rgba(255,255,255,0.5)' }}>No API keys configured — press </span><span style={{ color: '#FCD34D' }}>api_keys</span></div>
                    <div><span style={{ color: '#00F5FF' }}>[INFO]</span> <span style={{ color: 'rgba(255,255,255,0.5)' }}>Press </span><span style={{ color: '#00F5FF' }}>Alt+L</span><span style={{ color: 'rgba(255,255,255,0.5)' }}> to start listening</span><span style={{ color: '#00F5FF', animation: 'cursorBlink 1s step-end infinite' }}>▊</span></div>
                  </div>
                </div>

                {/* Corner brackets */}
                {['tl', 'tr', 'bl', 'br'].map(pos => (
                  <div key={pos} style={{
                    position: 'absolute',
                    width: '16px',
                    height: '16px',
                    borderColor: 'rgba(0, 245, 255, 0.6)',
                    zIndex: 20,
                    ...(pos.includes('t') ? { top: '6px' } : { bottom: '6px' }),
                    ...(pos.includes('l') ? {
                      left: '6px',
                      borderTop: pos.includes('t') ? '2px solid' : 'none',
                      borderBottom: pos.includes('b') ? '2px solid' : 'none',
                      borderLeft: '2px solid'
                    } : {
                      right: '6px',
                      borderTop: pos.includes('t') ? '2px solid' : 'none',
                      borderBottom: pos.includes('b') ? '2px solid' : 'none',
                      borderRight: '2px solid'
                    }),
                  }} />
                ))}
              </div>
            </motion.div>

            {/* Right: Log Feed */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <LiveLogFeed />
            </motion.div>
          </div>

          {/* ═══ FEATURE CARDS ROW ═══ */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            marginBottom: '16px'
          }}>
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                >
                  <div style={{
                    position: 'relative',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid rgba(0, 245, 255, 0.1)',
                    transition: 'border-color 0.3s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${f.color}44` }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(0, 245, 255, 0.1)' }}
                  >
                    <HackerImage
                      variant={f.variant}
                      accent={f.color}
                      label={f.title}
                      topLabel={f.topLabel}
                      height="150px"
                    />
                    <div style={{
                      padding: '12px 14px',
                      background: 'linear-gradient(150deg, rgba(40,44,52,0.66), rgba(22,24,29,0.74))',
                      backdropFilter: 'blur(10px)',
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '6px'
                      }}>
                        <Icon size={12} style={{ color: f.color }} />
                        <span style={{
                          fontSize: '10px',
                          fontFamily: '"Courier New", monospace',
                          color: f.color,
                          fontWeight: 700,
                          letterSpacing: '0.5px',
                          textShadow: `0 0 6px ${f.color}40`
                        }}>{f.title}</span>
                      </div>
                      <p style={{
                        fontSize: '10px',
                        color: 'rgba(255,255,255,0.6)',
                        lineHeight: 1.5,
                        fontFamily: '"Courier New", monospace'
                      }}>{f.desc}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* ═══ BOTTOM ROW: QuickStart + Hotkeys + Radar ═══ */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 240px',
            gap: '16px',
            marginBottom: '16px'
          }}>
            {/* Quick Start — terminal output style */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <div style={{
                background: 'linear-gradient(150deg, rgba(40,44,52,0.6), rgba(26,29,35,0.72))',
                border: '1px solid rgba(0, 245, 255, 0.1)',
                borderRadius: '8px',
                padding: '16px',
                fontFamily: '"Courier New", monospace',
                backdropFilter: 'blur(12px)',
                position: 'relative'
              }}>
                <div style={{
                  fontSize: '10px',
                  color: '#00F5FF',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  marginBottom: '12px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid rgba(0, 245, 255, 0.08)',
                  textShadow: '0 0 6px rgba(0,245,255,0.2)'
                }}>
                  ▌ QUICK_START.sh
                </div>

                {[
                  { step: '$', text: './launch_eves --secure', color: '#00F5FF' },
                  { step: '>', text: 'Press Alt+L to start listening', color: 'rgba(255,255,255,0.6)' },
                  { step: '>', text: 'Toggle audio source with Alt+O', color: 'rgba(255,255,255,0.6)' },
                  { step: '>', text: 'Save session with Ctrl+Space', color: 'rgba(255,255,255,0.6)' },
                  { step: '>', text: 'Review transcripts in dashboard history', color: 'rgba(255,255,255,0.6)' },
                ].map((s, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '6px',
                    fontSize: '11px',
                    fontFamily: '"Courier New", monospace',
                  }}>
                    <span style={{ color: s.step === '$' ? '#22D68C' : 'rgba(255,255,255,0.3)', fontWeight: 700, flexShrink: 0 }}>{s.step}</span>
                    <span style={{ color: s.color }}>{s.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Hotkeys */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              <div style={{
                background: 'linear-gradient(150deg, rgba(40,44,52,0.6), rgba(26,29,35,0.72))',
                border: '1px solid rgba(0, 245, 255, 0.1)',
                borderRadius: '8px',
                padding: '16px',
                fontFamily: '"Courier New", monospace',
                backdropFilter: 'blur(12px)',
              }}>
                <div style={{
                  fontSize: '10px',
                  color: '#00F5FF',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  marginBottom: '12px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid rgba(0, 245, 255, 0.08)',
                  textShadow: '0 0 6px rgba(0,245,255,0.2)'
                }}>
                  ▌ KEY_BINDINGS.cfg
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {hotkeys.map((h) => (
                    <div key={h.keys} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '10px',
                    }}>
                      <span style={{ color: 'rgba(255,255,255,0.6)' }}>{h.action}</span>
                      <span style={{
                        padding: '2px 8px',
                        background: `${h.color}11`,
                        border: `1px solid ${h.color}33`,
                        borderRadius: '4px',
                        fontSize: '9px',
                        fontWeight: 600,
                        color: h.color,
                        fontFamily: '"Courier New", monospace',
                        textShadow: `0 0 4px ${h.color}30`
                      }}>
                        {h.keys}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Radar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.8 }}
            >
              <RadarSweep />
            </motion.div>
          </div>

          {/* ═══ SYSTEM DIAGNOSTICS STRIP — new hacking element ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.85 }}
          >
            <div style={{
              background: 'linear-gradient(150deg, rgba(40,44,52,0.52), rgba(26,29,35,0.64))',
              border: '1px solid rgba(0, 245, 255, 0.08)',
              borderRadius: '8px',
              padding: '14px 20px',
              fontFamily: '"Courier New", monospace',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              {[
                { label: 'NEURAL_CORE', value: 'ONLINE', color: '#22D68C' },
                { label: 'AUDIO_PIPELINE', value: '16kHz PCM', color: '#00F5FF' },
                { label: 'SENTINEL_LAYER', value: 'ACTIVE', color: '#22D68C' },
                { label: 'ENCRYPTION', value: 'AES-256', color: '#FCD34D' },
                { label: 'AI_ENGINE', value: 'LLaMA-3.1', color: '#A78BFA' },
                { label: 'STATUS', value: 'READY', color: '#00F5FF' },
              ].map((d, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.5px' }}>{d.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: d.color, boxShadow: `0 0 6px ${d.color}` }} />
                    <span style={{ fontSize: '10px', color: d.color, fontWeight: 700, letterSpacing: '0.5px', textShadow: `0 0 4px ${d.color}30` }}>{d.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ═══ ABOUT EVES — colorful checklist ═══ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.9 }}
          >
            <div style={{
              background: 'linear-gradient(150deg, rgba(40,44,52,0.52), rgba(26,29,35,0.64))',
              border: '1px solid rgba(0, 245, 255, 0.08)',
              borderRadius: '8px',
              padding: '20px 24px',
              fontFamily: '"Courier New", monospace',
              backdropFilter: 'blur(12px)',
              position: 'relative'
            }}>
              <div style={{
                fontSize: '12px',
                color: '#00F5FF',
                fontWeight: 700,
                letterSpacing: '1px',
                marginBottom: '14px',
                textShadow: '0 0 8px rgba(0, 245, 255, 0.3)'
              }}>
                ▌ WHAT IS EVES?
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
                {[
                  { text: 'EVES listens to your meetings in real time — both online and in-person', color: '#00F5FF' },
                  { text: 'Works invisibly — no one can see it on screen share or screenshots', color: '#22D68C' },
                  { text: 'Transcribes internal audio (system) or external audio (microphone)', color: '#FCD34D' },
                  { text: 'Saves session history automatically with full transcript + AI summary', color: '#FF006E' },
                  { text: 'Summarizes conversations and extracts key intent using Groq AI', color: '#A78BFA' },
                  { text: 'Powered by Deepgram (transcription) + Groq (AI processing)', color: '#F59E0B' },
                ].map((point, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    gap: '8px',
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.7)',
                    lineHeight: 1.5
                  }}>
                    <span style={{ color: point.color, fontWeight: 700, flexShrink: 0, textShadow: `0 0 4px ${point.color}40` }}>[✓]</span>
                    <span>{point.text}</span>
                  </div>
                ))}
              </div>

              {/* Terminal footer */}
              <div style={{
                marginTop: '16px',
                paddingTop: '12px',
                borderTop: '1px solid rgba(0, 245, 255, 0.06)',
                fontSize: '9px',
                color: 'rgba(255,255,255,0.25)',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span><span style={{ color: '#22D68C' }}>evessys@localhost</span>:<span style={{ color: '#00F5FF' }}>~/eves</span>$ <span style={{ color: 'rgba(255,255,255,0.4)' }}>./eves --version</span></span>
                <span style={{ color: '#00F5FF' }}>v2.1.0 — Personal Edition</span>
              </div>
            </div>
          </motion.div>

          {/* ═══ CYBER-OPS SECTION DIVIDER ═══ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.95 }}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0 16px' }}
          >
            <span style={{ fontSize: '11px', fontFamily: '"Courier New", monospace', color: '#7ee787', fontWeight: 700, letterSpacing: '2px', textShadow: '0 0 10px rgba(126,231,135,0.4)', whiteSpace: 'nowrap' }}>
              ▌ CYBER_OPS // LIVE FEED
            </span>
            <div className="neon-rule" style={{ flex: 1 }} />
            <span style={{ fontSize: '9px', fontFamily: '"Courier New", monospace', color: 'rgba(171,178,191,0.4)', letterSpacing: '1px' }}>
              realtime · 0 telemetry
            </span>
          </motion.div>

          {/* ═══ ASCII BANNER ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 1.0 }}
            style={{ marginBottom: '16px' }}
          >
            <AsciiBanner />
          </motion.div>

          {/* ═══ THREAT MAP + PACKET SNIFFER ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 1.05 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '16px', marginBottom: '16px' }}
          >
            <ThreatMap />
            <PacketSniffer />
          </motion.div>

          {/* ═══ PORT SCAN + CIPHER STREAM ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 1.1 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}
          >
            <PortScan />
            <CipherStream />
          </motion.div>

          {/* ═══ DATA TICKER ═══ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.15 }}
          >
            <DataTicker />
          </motion.div>

          {/* ═══ MEETING ARCHIVE — only once there is something to show ═══ */}
          {totalMeetings > 0 && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 1.2 }}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0 16px' }}
              >
                <span style={{ fontSize: '11px', fontFamily: '"Courier New", monospace', color: '#22d3ee', fontWeight: 700, letterSpacing: '2px', textShadow: '0 0 10px rgba(34,211,238,0.4)', whiteSpace: 'nowrap' }}>
                  ▌ MEETING_ARCHIVE // RECORDED SESSIONS
                </span>
                <div className="neon-rule" style={{ flex: 1 }} />
                <span style={{ fontSize: '9px', fontFamily: '"Courier New", monospace', color: 'rgba(171,178,191,0.4)', letterSpacing: '1px' }}>
                  {totalMeetings} archived · local only
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 1.25 }}
              >
                <StatsRow totalMeetings={totalMeetings} audioHours={Math.round(audioHours * 10) / 10} pendingActions={pendingActions} speakers={speakers} />
                <div style={{ display: 'flex', gap: '20px', height: '520px' }}>
                  <div style={{ flex: 1 }}>
                    <MeetingFeed />
                  </div>
                  <RecentInsights />
                </div>
              </motion.div>
            </>
          )}
        </div>
      </motion.div>
  )
}
