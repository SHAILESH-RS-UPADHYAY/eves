import { useState, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { GlassCard } from '../glass/GlassCard'
import { SpeakerAvatar } from '../extras/SpeakerAvatar'
import type { TranscriptionResult } from '../../types'

const speakerNames = ['Speaker A', 'Speaker B', 'Speaker C', 'Speaker D', 'Speaker E', 'Speaker F']

interface TranscriptViewProps {
  transcription: TranscriptionResult
  onWordClick?: (startTime: number) => void
  standalone?: boolean
}

export function TranscriptView({ transcription, onWordClick, standalone }: TranscriptViewProps) {
  const [query, setQuery] = useState('')
  const [activeSpeaker, setActiveSpeaker] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const filteredUtterances = useMemo(() => {
    let utterances = transcription.utterances
    if (activeSpeaker !== null) {
      utterances = utterances.filter((u) => u.speaker === activeSpeaker)
    }
    if (query) {
      utterances = utterances.filter((u) =>
        u.transcript.toLowerCase().includes(query.toLowerCase())
      )
    }
    return utterances
  }, [transcription.utterances, query, activeSpeaker])

  const speakers = Array.from(new Set(transcription.utterances.map((u) => u.speaker)))

  return (
    <GlassCard style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {/* Search bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search transcript..."
            style={{ width: '100%', padding: '8px 12px 8px 32px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '12px', outline: 'none' }}
          />
        </div>
      </div>

      {/* Speaker filter chips */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveSpeaker(null)}
          style={{ ...chipStyle, background: activeSpeaker === null ? 'rgba(124,58,237,0.15)' : 'transparent', color: activeSpeaker === null ? 'var(--accent-violet-mid)' : 'var(--text-muted)' }}
        >
          All
        </button>
        {speakers.map((s) => (
          <button
            key={s}
            onClick={() => setActiveSpeaker(s)}
            style={{ ...chipStyle, background: activeSpeaker === s ? 'rgba(124,58,237,0.15)' : 'transparent', color: activeSpeaker === s ? 'var(--accent-violet-mid)' : 'var(--text-muted)' }}
          >
            {speakerNames[s] ?? `Speaker ${s}`}
          </button>
        ))}
      </div>

      {/* Transcript body */}
      <div ref={scrollRef} style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }} className="glass-scrollbar">
        {filteredUtterances.map((u, i) => (
          <motion.div
            key={i}
            style={{ display: 'flex', gap: '10px', padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
          >
            <SpeakerAvatar name={speakerNames[u.speaker] ?? `Speaker ${u.speaker}`} size={32} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>{speakerNames[u.speaker] ?? `Speaker ${u.speaker}`}</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{Math.floor(u.start / 60)}:{Math.floor(u.start % 60).toString().padStart(2, '0')}</span>
              </div>
              <div style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                {u.words.map((w, wi) => (
                  <span
                    key={wi}
                    onClick={() => onWordClick?.(w.start)}
                    style={{ cursor: 'pointer', borderRadius: '2px', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(124,58,237,0.1)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {w.punctuated_word ?? w.word}{' '}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  )
}

const chipStyle: React.CSSProperties = {
  padding: '4px 10px',
  borderRadius: '6px',
  border: '1px solid rgba(255,255,255,0.07)',
  fontSize: '11px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s'
}
