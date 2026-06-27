import { motion } from 'framer-motion'
import { GlassButton } from '../glass/GlassButton'

interface EmptyStateProps {
  message: string
  subtext?: string
  onAction?: () => void
  actionLabel?: string
}

export function EmptyState({ message, subtext, onAction, actionLabel }: EmptyStateProps) {
  return (
    <motion.div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: '24px' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Ghost card with waveform animation */}
      <motion.div
        style={{
          width: '200px',
          height: '120px',
          border: '2px dashed rgba(255,255,255,0.08)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          padding: '20px'
        }}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        {[0.7, 0.5, 0.8].map((w, i) => (
          <motion.div
            key={i}
            style={{
              width: `${w * 100}%`,
              height: '6px',
              borderRadius: '3px',
              background: i === 1 ? 'rgba(6,182,212,0.3)' : 'rgba(124,58,237,0.3)',
              transformOrigin: 'center'
            }}
            animate={{ scaleX: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
          />
        ))}
      </motion.div>

      <div style={{ textAlign: 'center' }}>
        <p className="gradient-text" style={{ fontSize: '18px', fontWeight: 600 }}>{message}</p>
        {subtext && <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>{subtext}</p>}
      </div>

      {onAction && actionLabel && (
        <GlassButton variant="primary" onClick={onAction}>{actionLabel}</GlassButton>
      )}
    </motion.div>
  )
}
