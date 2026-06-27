import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { GlassCard } from '../glass/GlassCard'
import type { SentimentPoint } from '../../types'

interface KeyMomentsProps {
  sentimentPoints: SentimentPoint[]
  duration?: number
}

export function KeyMoments({ sentimentPoints, duration }: KeyMomentsProps) {
  const keyMoments = sentimentPoints
    .filter((p) => Math.abs(p.score) > 0.5)
    .slice(0, 6)

  if (keyMoments.length === 0) return null

  return (
    <GlassCard style={{ padding: '16px' }}>
      <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Key Moments</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {keyMoments.map((moment, i) => {
          const isPositive = moment.score > 0
          const color = isPositive ? '#10B981' : '#F43F5E'
          return (
            <motion.div
              key={i}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', borderLeft: `2px solid ${color}` }}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Star size={14} style={{ color, flexShrink: 0 }} fill={color} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{moment.dominantEmotion}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>at {moment.minute} min</div>
              </div>
              <span style={{ fontSize: '10px', fontWeight: 600, color }}>
                {moment.score > 0 ? '+' : ''}{moment.score.toFixed(2)}
              </span>
            </motion.div>
          )
        })}
      </div>
    </GlassCard>
  )
}
