import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Mic, MicOff, Send, Square, Trash2, Zap, PlayCircle, Loader2, Radio } from 'lucide-react'
import { SectionDivider } from '../hacker/CyberKit'
import { CyberArt } from '../hacker/CyberArt'
import { RepoSlot } from '../repo/RepoSlot'
import { SpatialPills, pillFromSpeech } from './SpatialPills'
import { ChatThread } from './ChatThread'
import { useMeetingsStore } from '../../store/meetings.store'
import { useUIStore } from '../../store/ui.store'
import { useSettingsStore } from '../../store/settings.store'
import { useAnalyze } from '../../hooks/useAnalyze'
import { useBrainChat } from '../../hooks/useBrainChat'
import { useVoiceInput } from '../../hooks/useVoiceInput'
import { PROVIDERS, activeProvider } from '../../lib/providers'
import { formatClock } from '../meeting/AudioPlayer'
import type { Meeting } from '../../types'

const mono = '"Courier New", Consolas, monospace'
const C = { cyan: '#22d3ee', green: '#7ee787', yellow: '#ffcb6b', red: '#ff5370', purple: '#c678dd', mut: 'rgba(171,178,191,0.55)' }

function Toggle<T extends string>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div style={{ display: 'inline-flex', padding: '2px', gap: '2px', borderRadius: '6px', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(34,211,238,0.12)' }}>
      {options.map(([v, label]) => (
        <button key={v} onClick={() => onChange(v)} style={{ padding: '3px 8px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontFamily: mono, fontSize: '9px', fontWeight: 700, letterSpacing: '0.5px', background: value === v ? 'rgba(34,211,238,0.16)' : 'transparent', color: value === v ? C.cyan : C.mut }}>
          {label}
        </button>
      ))}
    </div>
  )
}

function MeetingLink({ meeting, meetings, stage, onPick, onAnalyze }: { meeting: Meeting; meetings: Meeting[]; stage: string; onPick: (id: string) => void; onAnalyze: () => void }) {
  const setPage = useUIStore((s) => s.setPage)
  const t = meeting.transcription!
  const words = t.transcript.split(/\s+/).filter(Boolean).length
  return (
    <div className="atom-glass atom-glass-hover" style={{ padding: '13px 15px', fontFamily: mono }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '9px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: C.green, letterSpacing: '1px', textShadow: `0 0 8px ${C.green}55` }}>▌ MEETING_LINK</span>
        <span style={{ fontSize: '8px', color: C.green, border: `1px solid ${C.green}44`, borderRadius: '4px', padding: '2px 6px' }}>{meetings.length} with transcript</span>
      </div>
      <select
        value={meeting.id}
        onChange={(e) => onPick(e.target.value)}
        style={{ width: '100%', padding: '7px 9px', borderRadius: '6px', background: 'rgba(3,3,6,0.8)', border: `1px solid ${C.green}40`, color: C.green, fontFamily: mono, fontSize: '11px', outline: 'none', cursor: 'pointer' }}
      >
        {meetings.map((m) => (
          <option key={m.id} value={m.id} style={{ background: '#0d1117', color: '#fff' }}>
            {m.title} · {new Date(m.date).toLocaleDateString()} · {formatClock(m.duration)}
          </option>
        ))}
      </select>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', margin: '10px 0' }}>
        {[['LENGTH', formatClock(meeting.duration)], ['SPEAKERS', String(t.speakers)], ['WORDS', words.toLocaleString()]].map(([k, v]) => (
          <div key={k} style={{ padding: '6px 8px', borderRadius: '6px', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(171,178,191,0.08)' }}>
            <div style={{ fontSize: '8px', color: C.mut, letterSpacing: '1px' }}>{k}</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          onClick={onAnalyze}
          disabled={meeting.isAnalyzing}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '7px', borderRadius: '6px', cursor: meeting.isAnalyzing ? 'wait' : 'pointer', fontFamily: mono, fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px', color: C.yellow, background: 'rgba(255,203,107,0.08)', border: '1px solid rgba(255,203,107,0.35)' }}
        >
          {meeting.isAnalyzing ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
          {meeting.isAnalyzing ? (stage || 'ANALYZING…') : meeting.analysis ? 'RE-ANALYZE' : 'ANALYZE'}
        </button>
        <button
          onClick={() => { useUIStore.getState().setActiveMeeting(meeting.id); setPage('meetings') }}
          title="Open the recording player (any speed)"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 10px', borderRadius: '6px', cursor: 'pointer', fontFamily: mono, fontSize: '10px', fontWeight: 700, color: C.cyan, background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.3)' }}
        >
          <PlayCircle size={12} /> LISTEN
        </button>
      </div>
    </div>
  )
}

function MissionBrief({ meeting }: { meeting: Meeting }) {
  const a = meeting.analysis
  if (!a) {
    return (
      <div style={{ padding: '12px 16px', borderRadius: '10px', border: '1px dashed rgba(255,203,107,0.35)', background: 'rgba(255,203,107,0.04)', fontFamily: mono, fontSize: '11px', color: C.mut }}>
        <span style={{ color: C.yellow, fontWeight: 700 }}>▸ NO MISSION BRIEF YET</span> — hit <span style={{ color: C.yellow }}>ANALYZE</span> for the summary and main goal, or just ask below: EVES reads the transcript either way.
      </div>
    )
  }
  const chips: [string, number, string][] = [
    ['decisions', a.keyDecisions.length, C.cyan],
    ['action items', a.actionItems.length, C.green],
    ['open questions', a.openQuestions.length, C.yellow],
    ['concerns', a.concerns.length, C.red]
  ]
  return (
    <motion.div
      key={meeting.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ position: 'relative', overflow: 'hidden', padding: '14px 18px', borderRadius: '10px', background: 'rgba(13,17,23,0.85)', border: '1px solid rgba(126,231,135,0.28)', boxShadow: '0 0 22px rgba(126,231,135,0.07)', fontFamily: mono }}
    >
      <div style={{ position: 'absolute', inset: 0, opacity: 0.18, pointerEvents: 'none' }}><CyberArt variant="neural" accent={C.green} /></div>
      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: '9px', color: C.green, fontWeight: 700, letterSpacing: '1.5px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: C.green, boxShadow: `0 0 8px ${C.green}` }} />
          MISSION BRIEF // MAIN GOAL
        </div>
        <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff', lineHeight: 1.4, textShadow: '0 0 10px rgba(126,231,135,0.3)', marginBottom: '6px' }}>
          {a.mainGoal || a.tldr}
        </div>
        {a.mainGoal && <div style={{ fontSize: '11px', color: 'rgba(214,221,232,0.7)', lineHeight: 1.5, marginBottom: '8px' }}>{a.tldr}</div>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {chips.map(([label, n, color]) => (
            <span key={label} style={{ fontSize: '9.5px', padding: '2px 8px', borderRadius: '999px', color, border: `1px solid ${color}40`, background: `${color}10` }}>{n} {label}</span>
          ))}
          <span style={{ fontSize: '9.5px', padding: '2px 8px', borderRadius: '999px', color: C.purple, border: `1px solid ${C.purple}40`, background: `${C.purple}10` }}>{a.meetingType.toLowerCase().replace('_', ' ')} · {a.overallMood.toLowerCase()}</span>
        </div>
      </div>
    </motion.div>
  )
}

export function BrainPage() {
  const meetings = useMeetingsStore((s) => s.meetings)
  const activeId = useUIStore((s) => s.activeMeetingId)
  const setActiveMeeting = useUIStore((s) => s.setActiveMeeting)
  const setSettingsOpen = useUIStore((s) => s.setSettingsOpen)
  const { settings, updateSettings } = useSettingsStore()
  const analyze = useAnalyze()

  const usable = meetings.filter((m) => m.transcription?.utterances.length || m.transcription?.transcript.trim())
  const meeting = usable.find((m) => m.id === activeId) ?? usable[0]
  const chat = useBrainChat(meeting)
  const [draft, setDraft] = useState('')
  const [stage, setStage] = useState('')
  const brain = activeProvider(settings)

  useEffect(() => window.eves?.onAiProgress((p) => { if (p.key === meeting?.id) setStage(p.stage) }), [meeting?.id])

  // speak a pill ("codex prompt", "main goal") or a whole question
  const voice = useVoiceInput((text) => {
    const pill = pillFromSpeech(text)
    if (pill) chat.send('', pill)
    else chat.send(text)
  })

  const submit = () => {
    if (!draft.trim()) return
    chat.send(draft)
    setDraft('')
  }

  const busy = !!chat.pending
  const blocked = !brain

  return (
    <motion.div
      style={{ padding: '18px 28px 22px', height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <SectionDivider
        label="EVES_BRAIN // MEETING → MISSION"
        color={C.cyan}
        right={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: mono }}>
            <button
              onClick={() => setSettingsOpen(true)}
              title="Change provider / model in Settings → Brain"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 9px', borderRadius: '6px', cursor: 'pointer', fontFamily: mono, fontSize: '9px', fontWeight: 700, letterSpacing: '0.5px', color: brain ? PROVIDERS[brain].color : C.red, background: 'rgba(0,0,0,0.35)', border: `1px solid ${brain ? PROVIDERS[brain].color : C.red}44` }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: brain ? C.green : C.red, boxShadow: `0 0 6px ${brain ? C.green : C.red}`, animation: 'pulseDot 1.6s ease-in-out infinite' }} />
              {brain ? `${PROVIDERS[brain].label} · ${settings.aiModels[brain]}` : 'NO AI KEY — OPEN SETTINGS'}
            </button>
            <Toggle value={settings.promptPathStyle} options={[['wsl', 'WSL'], ['windows', 'WIN']]} onChange={(v) => updateSettings({ promptPathStyle: v })} />
          </div>
        }
      />

      {!meeting ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: 'min(640px, 100%)', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(34,211,238,0.18)', fontFamily: mono }}>
            <div style={{ height: '200px', position: 'relative' }}><CyberArt variant="neural" accent={C.cyan} /></div>
            <div style={{ padding: '22px 26px 26px', textAlign: 'center', background: 'rgba(13,17,23,0.85)' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: C.cyan, letterSpacing: '1px', marginBottom: '8px' }}>NO TRANSCRIPT TO THINK WITH</div>
              <p style={{ fontSize: '11px', color: C.mut, lineHeight: 1.7, marginBottom: '16px' }}>
                Record a meeting with the EVES popup (<span style={{ color: C.green }}>Alt+L</span>) or upload a recording — the brain unlocks as soon as a transcript exists.
              </p>
              <button onClick={() => window.eves?.launchPopup()} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 18px', borderRadius: '6px', cursor: 'pointer', fontFamily: mono, fontSize: '11px', fontWeight: 800, letterSpacing: '1px', color: C.green, background: 'rgba(126,231,135,0.1)', border: '1px solid rgba(126,231,135,0.4)' }}>
                <Radio size={13} /> ./launch_eves
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '330px 1fr', gap: '18px' }}>
          {/* ─── Context dock ─── */}
          <div className="glass-scrollbar" style={{ minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' }}>
            <MeetingLink meeting={meeting} meetings={usable} stage={stage} onPick={setActiveMeeting} onAnalyze={() => analyze(meeting.id)} />
            <RepoSlot role="company" />
            <RepoSlot role="vault" />
          </div>

          {/* ─── Neural console ─── */}
          <div style={{ minHeight: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <MissionBrief meeting={meeting} />
            <SpatialPills running={chat.pending?.pill} disabled={busy || blocked} onRun={(p) => chat.send('', p)} />

            <ChatThread
              messages={chat.messages}
              pending={chat.pending}
              empty={
                <div style={{ margin: 'auto', maxWidth: '520px', textAlign: 'center', fontFamily: mono, color: C.mut, fontSize: '11px', lineHeight: 1.8 }}>
                  <div style={{ color: C.cyan, fontWeight: 700, letterSpacing: '1px', marginBottom: '6px' }}>▸ NEURAL LINK READY</div>
                  Ask anything about this meeting — EVES answers from the transcript, your company repo and your skill vault.<br />
                  Try <span style={{ color: C.yellow }}>“what is the main goal?”</span> · <span style={{ color: C.green }}>“which files change?”</span> · or tap / say a pill like <span style={{ color: C.cyan }}>“codex prompt”</span>.
                </div>
              }
            />

            {/* ─── Composer ─── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
              {voice.listening && (
                <div style={{ fontFamily: mono, fontSize: '11px', color: C.red, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: C.red, boxShadow: `0 0 8px ${C.red}`, animation: 'pulseDot 0.9s ease-in-out infinite' }} />
                  listening… <span style={{ color: '#e6edf3' }}>{voice.interim || 'speak — tap the mic again when done'}</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', padding: '8px', borderRadius: '10px', background: 'rgba(13,17,23,0.85)', border: `1px solid ${voice.listening ? 'rgba(255,83,112,0.5)' : 'rgba(34,211,238,0.2)'}`, boxShadow: voice.listening ? '0 0 18px rgba(255,83,112,0.15)' : '0 0 18px rgba(34,211,238,0.05)' }}>
                <span style={{ fontFamily: mono, color: C.green, fontSize: '13px', padding: '6px 2px' }}>&gt;</span>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }}
                  placeholder={blocked ? 'Add a Groq, Gemini or OpenAI key in Settings to wake the brain…' : 'Ask EVES anything about this meeting. Enter to send, Shift+Enter for a new line'}
                  disabled={blocked}
                  rows={1}
                  style={{ flex: 1, resize: 'none', minHeight: '32px', maxHeight: '140px', padding: '7px 4px', background: 'transparent', border: 'none', outline: 'none', color: '#e6edf3', fontFamily: mono, fontSize: '12.5px', lineHeight: 1.5, userSelect: 'text' }}
                />
                <button
                  onClick={voice.toggle}
                  disabled={blocked || busy}
                  title={voice.listening ? 'Stop and send' : 'Speak a question or a pill ("codex prompt")'}
                  style={iconBtn(voice.listening ? C.red : C.purple)}
                >
                  {voice.listening ? <MicOff size={15} /> : <Mic size={15} />}
                </button>
                {busy ? (
                  <button onClick={chat.stop} title="Stop the answer" style={iconBtn(C.red)}><Square size={13} /></button>
                ) : (
                  <button onClick={submit} disabled={blocked || !draft.trim()} title="Send" style={iconBtn(C.cyan)}><Send size={14} /></button>
                )}
                {chat.messages.length > 0 && !busy && (
                  <button onClick={chat.clear} title="Clear this conversation" style={iconBtn('#abb2bf')}><Trash2 size={13} /></button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

function iconBtn(color: string): React.CSSProperties {
  return { width: '34px', height: '34px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', cursor: 'pointer', color, background: `${color}14`, border: `1px solid ${color}44` }
}
