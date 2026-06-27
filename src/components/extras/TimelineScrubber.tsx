import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import type { Meeting } from '../../types'

const topicColors = ['#7C3AED', '#06B6D4', '#F43F5E', '#F59E0B', '#14B8A6', '#4C1D95']

interface TimelineScrubberProps {
  meeting: Meeting
  duration: number
  currentTime: number
  onSeek: (time: number) => void
}

export function TimelineScrubber({ meeting, duration, currentTime, onSeek }: TimelineScrubberProps) {
  const analysis = meeting.analysis
  if (!analysis) return null

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    onSeek(pct * duration)
  }

  let accumulatedPct = 0

  return (
    <div
      className="glass-card"
      style={{ width: '100%', height: '48px', position: 'relative', cursor: 'pointer', overflow: 'hidden' }}
      onClick={handleClick}
    >
      {/* Layer 1: topic segments */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
        {analysis.mainTopics.map((topic, i) => {
          const color = topicColors[i % topicColors.length]
          const left = accumulatedPct
          accumulatedPct += topic.durationPercent
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${left}%`,
                width: `${topic.durationPercent}%`,
                top: 0,
                bottom: 0,
                background: color,
                opacity: 0.2
              }}
            />
          )
        })}
      </div>

      {/* Layer 2: sentiment gradient overlay */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
        {analysis.sentimentByMinute.map((point, i) => {
          const minutePct = duration > 0 ? (point.minute * 60) / duration * 100 : 0
          const color = point.score > 0.3 ? 'rgba(16,185,129,0.15)' : point.score < -0.3 ? 'rgba(244,63,94,0.15)' : 'transparent'
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${minutePct}%`,
                width: `${100 / analysis.sentimentByMinute.length}%`,
                top: 0,
                bottom: 0,
                background: color
              }}
            />
          )
        })}
      </div>

      {/* Layer 3: time cursor */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: '2px',
          background: 'var(--accent-violet)',
          left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
          zIndex: 5,
          boxShadow: '0 0 8px var(--accent-violet-glow)'
        }}
        transition={{ left: { duration: 0.1 } }}
      />

      {/* Key moment markers */}
      {analysis.sentimentByMinute
        .filter((p) => Math.abs(p.score) > 0.5)
        .map((p, i) => {
          const pct = duration > 0 ? (p.minute * 60) / duration * 100 : 0
          return (
            <Star
              key={i}
              size={10}
              style={{
                position: 'absolute',
                left: `${pct}%`,
                top: '4px',
                color: '#FCD34D',
                transform: 'translateX(-50%)',
                zIndex: 6
              }}
            />
          )
        })}
    </div>
  )
}
