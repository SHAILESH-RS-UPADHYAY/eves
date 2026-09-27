import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion'
import { Target, Route, Terminal, Sparkles, MousePointer2, LayoutTemplate, ListChecks, ShieldAlert, type LucideIcon } from 'lucide-react'
import type { PillId } from '../../types'

export interface PillSpec {
  id: PillId
  label: string
  hint: string
  color: string
  Icon: LucideIcon
  /** spoken phrases (English / Hinglish) that trigger this pill */
  voice: RegExp
}

export const PILLS: PillSpec[] = [
  { id: 'goal', label: 'MAIN GOAL', hint: 'what the meeting really wants', color: '#ffcb6b', Icon: Target, voice: /main goal|goal kya|mission|(krna|karna) kya/ },
  { id: 'how', label: 'HOW TO BUILD', hint: 'exact files, steps, checks', color: '#7ee787', Icon: Route, voice: /kaise (kare|karu|banaye|banau|karna)|how (to|do i) (build|do|implement)|implement/ },
  { id: 'codex', label: 'CODEX PROMPT', hint: 'paste-ready for Codex', color: '#22d3ee', Icon: Terminal, voice: /\bcodex\b/ },
  { id: 'claude', label: 'CLAUDE CODE PROMPT', hint: 'paste-ready for Claude Code', color: '#f78c6c', Icon: Sparkles, voice: /\bclaude\b|cloud code/ },
  { id: 'cursor', label: 'CURSOR PROMPT', hint: 'paste-ready for Cursor', color: '#61afef', Icon: MousePointer2, voice: /\bcursor\b/ },
  { id: 'frontend', label: 'FRONTEND PREVIEW', hint: 'what the screen will look like', color: '#c678dd', Icon: LayoutTemplate, voice: /front ?end|kaisa dikh|kaise dikh|preview|screen/ },
  { id: 'actions', label: 'ACTION PLAN', hint: 'who does what, by when', color: '#ff79c6', Icon: ListChecks, voice: /action (items?|plan)|tasks? kya|to ?do/ },
  { id: 'risks', label: 'RISKS & QUESTIONS', hint: 'what to clarify before building', color: '#ff5370', Icon: ShieldAlert, voice: /risk|doubt|questions? (kya|to ask)/ }
]

export const pillById = (id?: PillId) => PILLS.find((p) => p.id === id)

/** A short spoken command maps to a pill; anything longer is a question for the chat. */
export function pillFromSpeech(text: string): PillId | null {
  const t = text.toLowerCase().trim()
  if (!t || t.split(/\s+/).length > 8) return null
  return PILLS.find((p) => p.voice.test(t))?.id ?? null
}

const mono = '"Courier New", Consolas, monospace'

function Pill({ pill, index, running, disabled, onRun }: { pill: PillSpec; index: number; running: boolean; disabled: boolean; onRun: () => void }) {
  // cursor position over the pill (-0.5..0.5) drives tilt and the specular highlight
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [14, -14]), { stiffness: 260, damping: 18 })
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-16, 16]), { stiffness: 260, damping: 18 })
  const glareX = useTransform(mx, [-0.5, 0.5], ['10%', '90%'])
  const glareY = useTransform(my, [-0.5, 0.5], ['0%', '100%'])
  const glare = useMotionTemplate`radial-gradient(120px circle at ${glareX} ${glareY}, rgba(255,255,255,0.22), transparent 60%)`
  const { Icon, color } = pill

  return (
    <motion.button
      onClick={onRun}
      disabled={disabled}
      title={pill.hint}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        mx.set((e.clientX - r.left) / r.width - 0.5)
        my.set((e.clientY - r.top) / r.height - 0.5)
      }}
      onPointerLeave={() => { mx.set(0); my.set(0) }}
      initial={{ opacity: 0, y: 14, scale: 0.9 }}
      animate={{ opacity: disabled && !running ? 0.35 : 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.045, type: 'spring', stiffness: 320, damping: 24 }}
      whileHover={disabled ? undefined : { scale: 1.06, y: -3 }}
      whileTap={disabled ? undefined : { scale: 0.95 }}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 600,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '9px 16px 9px 12px',
        borderRadius: '999px',
        border: `1px solid ${color}66`,
        background: `linear-gradient(135deg, ${color}26, rgba(8, 10, 16, 0.78) 70%)`,
        backdropFilter: 'blur(10px)',
        boxShadow: running
          ? `0 0 26px ${color}88, inset 0 1px 0 rgba(255,255,255,0.12)`
          : `0 6px 18px rgba(0,0,0,0.45), 0 0 14px ${color}33, inset 0 1px 0 rgba(255,255,255,0.08)`,
        color,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: mono,
        fontSize: '10.5px',
        fontWeight: 800,
        letterSpacing: '1px',
        textShadow: `0 0 8px ${color}77`,
        overflow: 'hidden',
        whiteSpace: 'nowrap'
      }}
    >
      {/* moving specular highlight — the "spatial" glass */}
      <motion.span aria-hidden style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', background: glare, pointerEvents: 'none' }} />
      {/* orbit ring while this pill's answer is streaming */}
      {running && (
        <span aria-hidden style={{ position: 'absolute', inset: '-1px', borderRadius: 'inherit', padding: '1px', background: `conic-gradient(from 0deg, transparent 0 65%, ${color} 85%, transparent)`, WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude', animation: 'spin 1.4s linear infinite' }} />
      )}
      <span style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', background: `${color}22`, boxShadow: `0 0 10px ${color}44` }}>
        <Icon size={11} />
      </span>
      <span style={{ position: 'relative' }}>{pill.label}</span>
    </motion.button>
  )
}

export function SpatialPills({ running, disabled, onRun }: { running?: PillId; disabled: boolean; onRun: (id: PillId) => void }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', perspective: '800px' }}>
      {PILLS.map((p, i) => (
        <Pill key={p.id} pill={p} index={i} running={running === p.id} disabled={disabled} onRun={() => onRun(p.id)} />
      ))}
    </div>
  )
}
