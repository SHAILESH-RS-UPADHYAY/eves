import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Cpu, TriangleAlert } from 'lucide-react'
import { Markdown, CopyButton } from './Markdown'
import { pillById } from './SpatialPills'
import type { ChatMessage } from '../../types'
import type { PendingReply } from '../../hooks/useBrainChat'

const mono = '"Courier New", Consolas, monospace'
const TOOL = { codex: 'CODEX', claude: 'CLAUDE CODE', cursor: 'CURSOR' } as const
const isTool = (p?: string): p is keyof typeof TOOL => !!p && p in TOOL
const time = (at: number) => new Date(at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

/** Coding-tool prompts are shown exactly as they will be pasted. */
function PromptCapsule({ text, pill, streaming }: { text: string; pill: keyof typeof TOOL; streaming?: boolean }) {
  const color = pillById(pill)!.color
  return (
    <div style={{ position: 'relative', borderRadius: '10px', padding: '1px', background: `linear-gradient(135deg, ${color}, rgba(34,211,238,0.15) 40%, ${color}55)` }}>
      <div style={{ borderRadius: '9px', background: '#05070a', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderBottom: `1px solid ${color}22`, background: `${color}0d` }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}`, animation: streaming ? 'pulseDot 1s ease-in-out infinite' : undefined }} />
          <span style={{ fontFamily: mono, fontSize: '10px', fontWeight: 800, letterSpacing: '1px', color }}>
            {streaming ? `WRITING ${TOOL[pill]} PROMPT…` : `READY TO PASTE INTO ${TOOL[pill]}`}
          </span>
          <span style={{ flex: 1 }} />
          {!streaming && <CopyButton text={text} label={`COPY FOR ${TOOL[pill]}`} color={color} />}
        </div>
        <pre className="glass-scrollbar" style={{ margin: 0, padding: '12px 14px', maxHeight: '520px', overflow: 'auto', fontFamily: mono, fontSize: '11px', lineHeight: 1.6, whiteSpace: 'pre-wrap', color: '#e6edf3', userSelect: 'text' }}>
          {text.split('\n').map((line, i) => (
            <div key={i} style={/^#{1,3}\s/.test(line) ? { color, fontWeight: 800, marginTop: i ? '8px' : 0 } : /^`.*`$/.test(line.trim()) ? { color: '#7ee787' } : undefined}>{line || ' '}</div>
          ))}
          {streaming && <span style={{ color, animation: 'cursorBlink 1s step-end infinite' }}>▊</span>}
        </pre>
      </div>
    </div>
  )
}

function Turn({ m, streaming, stage }: { m: ChatMessage; streaming?: boolean; stage?: string }) {
  const pill = pillById(m.pill)
  if (m.role === 'user') {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ alignSelf: 'flex-end', maxWidth: '82%', fontFamily: mono }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', fontSize: '9px', color: 'rgba(171,178,191,0.5)', marginBottom: '4px' }}>
          <span>{time(m.at)}</span><span style={{ color: '#22d3ee' }}>&gt; you</span>
        </div>
        {pill ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '999px', fontSize: '10.5px', fontWeight: 800, letterSpacing: '1px', color: pill.color, border: `1px solid ${pill.color}66`, background: `${pill.color}14`, boxShadow: `0 0 14px ${pill.color}22` }}>
            <pill.Icon size={11} />{pill.label}
          </span>
        ) : (
          <div style={{ padding: '9px 13px', borderRadius: '10px 10px 2px 10px', background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.22)', color: '#e6edf3', fontSize: '12.5px', lineHeight: 1.55, whiteSpace: 'pre-wrap', userSelect: 'text' }}>{m.text}</div>
        )}
      </motion.div>
    )
  }

  const color = m.error ? '#ff5370' : pill?.color ?? '#7ee787'
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ alignSelf: 'stretch', fontFamily: mono }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '9px', marginBottom: '6px' }}>
        <Cpu size={11} style={{ color }} />
        <span style={{ color, fontWeight: 700, letterSpacing: '0.5px' }}>eves@brain</span>
        {pill && <span style={{ color: pill.color, border: `1px solid ${pill.color}44`, borderRadius: '4px', padding: '0 5px' }}>{pill.label}</span>}
        {m.model && <span style={{ color: 'rgba(171,178,191,0.45)' }}>via {m.model}</span>}
        <span style={{ flex: 1 }} />
        {!streaming && !m.error && !isTool(m.pill) && <CopyButton text={m.text} />}
        {!streaming && <span style={{ color: 'rgba(171,178,191,0.4)' }}>{time(m.at)}</span>}
      </div>

      {m.error ? (
        <div style={{ display: 'flex', gap: '8px', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,83,112,0.35)', background: 'rgba(255,83,112,0.06)', color: '#ff8fa3', fontSize: '12px' }}>
          <TriangleAlert size={14} style={{ flexShrink: 0, marginTop: 2 }} />{m.text}
        </div>
      ) : streaming && !m.text ? (
        <div style={{ position: 'relative', overflow: 'hidden', padding: '12px 14px', borderRadius: '8px', border: `1px solid ${color}33`, background: 'rgba(13,17,23,0.7)', fontSize: '11px', color }}>
          <span style={{ letterSpacing: '1px' }}>▸ {stage ?? 'thinking'}</span>
          <span style={{ animation: 'cursorBlink 1s step-end infinite' }}>…</span>
          <div style={{ position: 'absolute', left: 0, bottom: 0, height: '2px', width: '35%', background: `linear-gradient(90deg, transparent, ${color}, transparent)`, animation: 'brainScan 1.6s ease-in-out infinite' }} />
        </div>
      ) : isTool(m.pill) ? (
        <PromptCapsule text={m.text} pill={m.pill} streaming={streaming} />
      ) : (
        <div style={{ padding: '12px 15px', borderRadius: '10px', border: `1px solid ${color}26`, background: 'rgba(13,17,23,0.72)', boxShadow: `inset 3px 0 0 ${color}` }}>
          <Markdown text={m.text} />
          {streaming && <span style={{ color, animation: 'cursorBlink 1s step-end infinite' }}>▊</span>}
        </div>
      )}
    </motion.div>
  )
}

export function ChatThread({ messages, pending, empty }: { messages: ChatMessage[]; pending: PendingReply | null; empty: React.ReactNode }) {
  const scroller = useRef<HTMLDivElement>(null)
  const pinned = useRef(true) // follow the stream unless the user scrolled up to read

  useEffect(() => {
    const el = scroller.current
    if (el && pinned.current) el.scrollTop = el.scrollHeight
  }, [messages.length, pending?.text, pending?.stage])

  return (
    <div
      ref={scroller}
      className="glass-scrollbar"
      onScroll={(e) => { const el = e.currentTarget; pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80 }}
      style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', padding: '4px 6px 12px 2px' }}
    >
      {!messages.length && !pending && empty}
      {messages.map((m) => <Turn key={m.id} m={m} />)}
      {pending && (
        <Turn streaming stage={pending.stage} m={{ id: pending.requestId, role: 'assistant', text: pending.text, pill: pending.pill, at: Date.now() }} />
      )}
    </div>
  )
}
