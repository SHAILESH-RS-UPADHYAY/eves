import { motion } from 'framer-motion'
import clsx from 'clsx'
import type { ReactNode } from 'react'

interface GlassBadgeProps {
  children: ReactNode
  color?: 'violet' | 'cyan' | 'rose' | 'amber' | 'teal' | 'gray'
  size?: 'sm' | 'md'
  className?: string
}

const colorMap = {
  violet: { bg: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.3)', text: '#A78BFA' },
  cyan: { bg: 'rgba(6,182,212,0.15)', border: 'rgba(6,182,212,0.3)', text: '#67E8F9' },
  rose: { bg: 'rgba(244,63,94,0.15)', border: 'rgba(244,63,94,0.3)', text: '#FB7185' },
  amber: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', text: '#FCD34D' },
  teal: { bg: 'rgba(20,184,166,0.15)', border: 'rgba(20,184,166,0.3)', text: '#5EEAD4' },
  gray: { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', text: 'rgba(255,255,255,0.5)' }
} as const

export function GlassBadge({ children, color = 'gray', size = 'sm', className }: GlassBadgeProps) {
  const c = colorMap[color]
  return (
    <motion.span
      className={clsx(className)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: size === 'sm' ? '2px 10px' : '4px 14px',
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: '999px',
        color: c.text,
        fontSize: size === 'sm' ? '11px' : '12px',
        fontWeight: 500,
        letterSpacing: '0.3px',
        whiteSpace: 'nowrap'
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.span>
  )
}
