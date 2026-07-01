import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Rocket, Terminal, Shield, Mic2, Brain, Zap, FileText, Activity, Cpu, Wifi, Key } from 'lucide-react'
import { StatsRow } from './StatsRow'
import { MeetingFeed } from './MeetingFeed'
import { RecentInsights } from './RecentInsights'
import { EmptyState } from '../extras/EmptyState'
import { GlassButton } from '../glass/GlassButton'
import { useMeetingsStore } from '../../store/meetings.store'
import { useUIStore } from '../../store/ui.store'
import { MatrixRain } from '../hacker/MatrixRain'
import { GlitchText } from '../hacker/GlitchText'
import { SystemStatus } from '../hacker/SystemStatus'
import { LiveLogFeed } from '../hacker/LiveLogFeed'
import { RadarSweep } from '../hacker/RadarSweep'
import { HackerImage } from '../hacker/HackerImage'

const features = [
  {
    icon: Brain,
    color: '#00F5FF',
    title: 'AI TRANSCRIPTION',
    desc: 'Deepgram nova-2 engine. 95%+ accuracy. Real-time streaming with speaker diarization.',
    img: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&q=80&auto=format',
    topLabel: '> MODULE_01.DLL'
  },
  {
    icon: Shield,
    color: '#10B981',
    title: 'STEALTH MODE',
    desc: 'Invisible to screen share, OBS, screenshots. WDA_EXCLUDEFROMCAPTURE active. Zero footprint.',
    img: 'https://images.unsplash.com/photo-1526374965328-7f182d8093eb?w=600&q=80&auto=format',
    topLabel: '> MODULE_02.DLL'
  },
  {
    icon: Mic2,
    color: '#F59E0B',
    title: 'AUDIO CAPTURE',
    desc: 'Internal loopback (system audio) + external microphone. Runtime source toggle. 16kHz PCM.',
    img: 'https://images.unsplash.com/photo-1451187580459-9546f01094cf?w=600&q=80&auto=format',
    topLabel: '> MODULE_03.DLL'
  },
  {
    icon: Zap,
    color: '#F43F5E',
    title: 'AI SUMMARIZATION',
    desc: 'Groq LLaMA-3 70B inference. Summary + intent extraction + action items. One-click export.',
    img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80&auto=format',
    topLabel: '> MODULE_04.DLL'
  },
]

const hotkeys = [
  { keys: 'Ctrl+Shift+L', action: 'Start / Stop Listening', color: '#00F5FF' },
  { keys: 'Ctrl+Shift+H', action: 'Hide Overlay (keeps listening)', color: '#A78BFA' },
  { keys: 'Ctrl+Shift+O', action: 'Toggle Audio Source', color: '#F59E0B' },
  { keys: 'Ctrl+Shift+T', action: 'Toggle Click-Through', color: '#10B981' },
  { keys: 'Ctrl+Shift+D', action: 'Show / Hide Dashboard', color: '#00F5FF' },
  { keys: 'Ctrl+Space', action: 'Save Session to History', color: '#F43F5E' },
  { keys: 'Ctrl+Shift+S', action: 'Toggle Stealth Mode', color: '#10B981' },
  { keys: 'Ctrl+Shift+X', action: 'Quit EVES', color: '#F43F5E' },
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
        <span style={{ fontSize: '14px', color: '#00F5FF', fontWeight: 700, letterSpacing: '1px', textShadow: '0 0 10px rgba(0,245,255,0.4)' }}>
          ▌ EVES
        </span>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>::</span>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px' }}>
          MEETING INTELLIGENCE SYSTEM
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: '#10B981', boxShadow: '0 0 8px #10B981',
            animation: 'pulseDot 1.5s ease-in-out infinite'
          }} />
          <span style={{ fontSize: '10px', color: '#10B981', fontWeight: 700, letterSpacing: '0.5px' }}>ONLINE</span>
        </div>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontVariantNumeric: 'tabular-nums' }}>
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

  const handleLaunchEves = () => {
    if (typeof window !== 'undefined' && (window as any).eves?.launchOverlay) {
      ;(window as any).eves.launchOverlay()
    }
  }

  if (totalMeetings === 0) {
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

          {/* Top section: 3 columns */}
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

            {/* Center: Hero */}
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
                height: '380px',
                background: 'rgba(0, 0, 0, 0.6)'
              }}>
                {/* Hero background image */}
                <HackerImage
                  src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80&auto=format"
                  alt="Cyberpunk circuit board"
                  height="380px"
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
                  padding: '32px'
                }}>
                  <div style={{
                    fontSize: '10px',
                    fontFamily: '"Courier New", monospace',
                    color: 'rgba(0, 245, 255, 0.6)',
                    letterSpacing: '2px',
                    marginBottom: '12px',
                    textShadow: '0 0 6px rgba(0, 245, 255, 0.4)'
                  }}>
                    [ MEETING INTELLIGENCE SYSTEM v2.1.0 ]
                  </div>

                  <GlitchText text="YOUR MEETINGS." size="36px" color="#00F5FF" />
                  <div style={{ height: '6px' }} />
                  <GlitchText text="HACKED." size="36px" color="#10B981" />

                  <p style={{
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.5)',
                    maxWidth: '420px',
                    textAlign: 'center',
                    margin: '16px 0 24px',
                    lineHeight: 1.6,
                    fontFamily: '"Courier New", monospace'
                  }}>
                    EVES listens, transcribes, and extracts intelligence from every conversation.
                    Private. Local. Devastatingly accurate. They'll never know.
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
                        color: 'rgba(255,255,255,0.5)',
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
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                        e.currentTarget.style.color = 'rgba(255,255,255,0.8)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                        e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
                      }}
                    >
                      <FileText size={16} /> history.log
                    </button>

                    <button
                      onClick={() => setSettingsOpen(true)}
                      style={{
                        padding: '12px 20px',
                        background: 'rgba(245, 158, 11, 0.08)',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                        borderRadius: '6px',
                        color: '#F59E0B',
                        fontFamily: '"Courier New", monospace',
                        fontSize: '12px',
                        fontWeight: 600,
                        letterSpacing: '1px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        textShadow: '0 0 6px rgba(245, 158, 11, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(245, 158, 11, 0.15)'
                        e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.5)'
                        e.currentTarget.style.boxShadow = '0 0 16px rgba(245, 158, 11, 0.1)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(245, 158, 11, 0.08)'
                        e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.25)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <Key size={14} /> api_keys
                    </button>
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

          {/* Feature image cards row */}
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
                      src={f.img}
                      alt={f.title}
                      label={f.title}
                      topLabel={f.topLabel}
                      height="140px"
                    />
                    <div style={{
                      padding: '10px 12px',
                      background: 'rgba(0, 0, 0, 0.6)',
                      backdropFilter: 'blur(10px)',
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '4px'
                      }}>
                        <Icon size={12} style={{ color: f.color }} />
                        <span style={{
                          fontSize: '10px',
                          fontFamily: '"Courier New", monospace',
                          color: f.color,
                          fontWeight: 700,
                          letterSpacing: '0.5px'
                        }}>{f.title}</span>
                      </div>
                      <p style={{
                        fontSize: '10px',
                        color: 'rgba(255,255,255,0.4)',
                        lineHeight: 1.4,
                        fontFamily: '"Courier New", monospace'
                      }}>{f.desc}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Bottom row: Quick start + Hotkeys + Radar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 240px',
            gap: '16px'
          }}>
            {/* Quick Start */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <div style={{
                background: 'rgba(0, 0, 0, 0.5)',
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
                  borderBottom: '1px solid rgba(0, 245, 255, 0.08)'
                }}>
                  ▌ QUICK_START.sh
                </div>

                {[
                  { step: '$', text: './launch_eves --stealth', highlight: true, color: '#00F5FF' },
                  { step: '>', text: 'Press Ctrl+Shift+L to start listening', highlight: false, color: 'rgba(255,255,255,0.5)' },
                  { step: '>', text: 'Toggle audio source with Ctrl+Shift+O', highlight: false, color: 'rgba(255,255,255,0.5)' },
                  { step: '>', text: 'Save session with Ctrl+Space', highlight: false, color: 'rgba(255,255,255,0.5)' },
                  { step: '>', text: 'Review transcripts in dashboard history', highlight: false, color: 'rgba(255,255,255,0.5)' },
                ].map((s, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '6px',
                    fontSize: '11px',
                    fontFamily: '"Courier New", monospace',
                  }}>
                    <span style={{ color: s.highlight ? s.color : 'rgba(255,255,255,0.25)', fontWeight: 700, flexShrink: 0 }}>{s.step}</span>
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
                background: 'rgba(0, 0, 0, 0.5)',
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
                  borderBottom: '1px solid rgba(0, 245, 255, 0.08)'
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
                      <span style={{ color: 'rgba(255,255,255,0.4)' }}>{h.action}</span>
                      <span style={{
                        padding: '2px 8px',
                        background: `${h.color}11`,
                        border: `1px solid ${h.color}33`,
                        borderRadius: '4px',
                        fontSize: '9px',
                        fontWeight: 600,
                        color: h.color,
                        fontFamily: '"Courier New", monospace',
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

          {/* About EVES section */}
          <motion.div
            style={{ marginTop: '16px' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.9 }}
          >
            <div style={{
              background: 'rgba(0, 0, 0, 0.4)',
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
                {[
                  'EVES listens to your meetings in real time — both online and in-person',
                  'Works invisibly — no one can see it on screen share or screenshots',
                  'Transcribes internal audio (system) or external audio (microphone)',
                  'Saves session history automatically with full transcript + AI summary',
                  'Summarizes conversations and extracts key intent using Groq AI',
                  'Powered by Deepgram (transcription) + Groq (AI processing)',
                ].map((point, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    gap: '8px',
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.5)',
                    lineHeight: 1.5
                  }}>
                    <span style={{ color: '#10B981', fontWeight: 700, flexShrink: 0 }}>[✓]</span>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  // Normal dashboard with stats when meetings exist
  return (
    <motion.div
      style={{ padding: '0 24px 32px', height: '100%' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <HackerHeader />

      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleLaunchEves}
          style={{
            padding: '10px 20px',
            background: 'rgba(0, 245, 255, 0.1)',
            border: '1px solid rgba(0, 245, 255, 0.4)',
            borderRadius: '6px',
            color: '#00F5FF',
            fontFamily: '"Courier New", monospace',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.5px',
            cursor: 'pointer',
            textShadow: '0 0 8px rgba(0, 245, 255, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 245, 255, 0.2)'
            e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 245, 255, 0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 245, 255, 0.1)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <Rocket size={14} /> ./launch_overlay
        </button>
      </div>

      <StatsRow totalMeetings={totalMeetings} audioHours={Math.round(audioHours * 10) / 10} pendingActions={pendingActions} speakers={speakers} />
      <div style={{ display: 'flex', gap: '20px', height: 'calc(100% - 180px)' }}>
        <div style={{ flex: 1 }}>
          <MeetingFeed />
        </div>
        <RecentInsights />
      </div>
    </motion.div>
  )
}
