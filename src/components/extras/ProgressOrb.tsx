import { motion } from 'framer-motion'

interface ProgressOrbProps {
  progress: number
  size?: number
  label?: string
}

export function ProgressOrb({ progress, size = 80, label }: ProgressOrbProps) {
  const strokeWidth = 6
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const dashoffset = circumference * (1 - progress / 100)
  const isComplete = progress >= 100

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
        <defs>
          <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(124,58,237,0.2)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progress-gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          animate={{ rotate: !isComplete ? 360 : 0 }}
          transition={{ rotate: { duration: 2, repeat: !isComplete ? Infinity : 0, ease: 'linear' }, strokeDashoffset: { duration: 0.5, ease: 'ease' } }}
          style={{ transformOrigin: 'center' }}
        />
      </svg>
      <div style={{ position: 'relative', textAlign: 'center' }}>
        <span style={{ fontSize: size < 60 ? '12px' : '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
          {Math.round(progress)}%
        </span>
        {label && (
          <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>{label}</div>
        )}
      </div>
    </div>
  )
}
