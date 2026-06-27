import { motion } from 'framer-motion'
import { GlassCard } from '../glass/GlassCard'
import type { TranscriptionResult } from '../../types'

const speakerColors = ['#7C3AED', '#06B6D4', '#F43F5E', '#F59E0B', '#14B8A6', '#6366F1']
const speakerNames = ['Speaker A', 'Speaker B', 'Speaker C', 'Speaker D', 'Speaker E', 'Speaker F']

interface SpeakerTimelineProps {
  transcription: TranscriptionResult
}

export function SpeakerTimeline({ transcription }: SpeakerTimelineProps) {
  const { utterances, duration } = transcription
  if (utterances.length === 0 || duration === 0) return null

  const speakers = Array.from(new Set(utterances.map((u) => u.speaker)))

  return (
    <GlassCard style={{ padding: '16px' }}>
      <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Speaker Timeline</h4>

      {/* Timeline rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {speakers.map((speaker) => {
          const color = speakerColors[speaker % speakerColors.length]
          const segments = utterances.filter((u) => u.speaker === speaker)
          const talkTime = segments.reduce((sum, u) => sum + (u.end - u.start), 0)
          const talkPct = (talkTime / duration) * 100

          return (
            <div key={speaker} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', width: '80px', flexShrink: 0 }}>{speakerNames[speaker] ?? `Speaker ${speaker}`}</span>
              <div style={{ flex: 1, height: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', position: 'relative', overflow: 'hidden' }}>
                {segments.map((seg, i) => {
                  const left = (seg.start / duration) * 100
                  const width = ((seg.end - seg.start) / duration) * 100
                  return (
                    <motion.div
                      key={i}
                      style={{
                        position: 'absolute',
                        left: `${left}%`,
                        width: `${width}%`,
                        top: 0,
                        bottom: 0,
                        background: color,
                        opacity: 0.6,
                        borderRadius: '3px'
                      }}
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 0.6, scaleX: 1 }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                      title={`${Math.round(talkPct)}% talk time`}
                    />
                  )
                })}
              </div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', width: '40px', textAlign: 'right', flexShrink: 0 }}>{Math.round(talkPct)}%</span>
            </div>
          )
        })}
      </div>
    </GlassCard>
  )
}
