import { forwardRef, type CSSProperties, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

interface GlassPanelProps {
  children: ReactNode
  className?: string
  title?: string
  style?: CSSProperties
}

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ children, className, title, style }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={clsx('glass-card', className)}
        style={{ padding: '24px', ...style }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        {title && (
          <h3
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: '16px',
              letterSpacing: '0.3px'
            }}
          >
            {title}
          </h3>
        )}
        {children}
      </motion.div>
    )
  }
)

GlassPanel.displayName = 'GlassPanel'
