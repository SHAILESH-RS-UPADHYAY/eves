import { forwardRef, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

interface GlassButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'default' | 'primary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit'
}

const variantMap = {
  default: {
    background: 'var(--glass-2)',
    border: 'var(--border-glass)',
    color: 'var(--text-primary)'
  },
  primary: {
    background: 'var(--gradient-brand)',
    border: 'none',
    color: '#fff'
  },
  danger: {
    background: 'rgba(244,63,94,0.1)',
    border: '1px solid rgba(244,63,94,0.3)',
    color: '#FB7185'
  }
} as const

const sizeMap = {
  sm: { padding: '6px 14px', fontSize: '12px' },
  md: { padding: '10px 20px', fontSize: '13px' },
  lg: { padding: '14px 28px', fontSize: '15px' }
} as const

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ children, onClick, variant = 'default', size = 'md', className, disabled, type = 'button' }, ref) => {
    const v = variantMap[variant]
    const s = sizeMap[size]
    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={clsx(className)}
        style={{
          ...v,
          ...s,
          borderRadius: 'var(--radius-md)',
          fontWeight: 600,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.4 : 1,
          backdropFilter: variant === 'default' ? 'var(--blur-glass)' : undefined,
          transition: 'box-shadow 0.3s ease',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          border: v.border as any
        }}
        whileHover={!disabled ? { scale: 1.02, y: -1 } : undefined}
        whileTap={!disabled ? { scale: 0.96 } : undefined}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.button>
    )
  }
)

GlassButton.displayName = 'GlassButton'
