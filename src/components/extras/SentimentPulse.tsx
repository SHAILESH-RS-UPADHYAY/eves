import { motion } from 'framer-motion'
import type { MoodType } from '../../types'

const moodColorMap: Record<MoodType, string> = {
  POSITIVE: '#10B981',
  TENSE: '#F43F5E',
  MIXED: '#F59E0B',
  PRODUCTIVE: '#06B6D4',
  NEUTRAL: '#6B7280'
}

interface SentimentPulseProps {
  mood: MoodType
}

export function SentimentPulse({ mood }: SentimentPulseProps) {
  const color = moodColorMap[mood]
  return (
    <motion.div
      style={{
        position: 'fixed',
        bottom: '80px',
        right: '24px',
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: color,
        zIndex: 100,
        cursor: 'pointer',
        animation: 'sentimentBreath 2s ease-in-out infinite alternate'
      }}
      title={mood}
    >
      <motion.div
        style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, opacity: 0.3, animation: 'sentimentBreath 2s ease-in-out infinite alternate' }}
      />
    </motion.div>
  )
}
