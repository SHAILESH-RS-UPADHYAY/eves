import { forwardRef, type ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import clsx from 'clsx'

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  glow?: 'violet' | 'cyan' | 'rose' | 'none'
  interactive?: boolean
}

const glowMap = {
  violet: 'var(--shadow-glow-violet)',
  cyan: 'var(--shadow-glow-cyan)',
  rose: 'var(--shadow-glow-rose)',
  none: 'none'
} as const

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, glow = 'none', interactive = false, className, style, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={clsx('glass-card', className)}
        style={{ boxShadow: glow !== 'none' ? glowMap[glow] : undefined, ...style }}
        initial={interactive ? { opacity: 0, y: 20, scale: 0.97 } : false}
        animate={interactive ? { opacity: 1, y: 0, scale: 1 } : undefined}
        transition={interactive ? { duration: 0.45, ease: [0.16, 1, 0.3, 1] } : undefined}
        whileHover={interactive ? { y: -2 } : undefined}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

GlassCard.displayName = 'GlassCard'
