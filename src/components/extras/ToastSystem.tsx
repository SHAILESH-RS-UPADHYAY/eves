import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, XCircle, Info, Loader2 } from 'lucide-react'
import { useUIStore } from '../../store/ui.store'

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  loading: Loader2
}

const borderColorMap = {
  success: 'var(--accent-cyan)',
  error: 'var(--accent-rose)',
  info: 'var(--accent-violet)',
  loading: 'var(--accent-amber)'
}

export function ToastSystem() {
  const toasts = useUIStore((s) => s.toasts)
  const removeToast = useUIStore((s) => s.removeToast)

  useEffect(() => {
    const timers = toasts.map((t) => {
      if (t.type === 'loading') return undefined
      return setTimeout(() => removeToast(t.id), t.duration ?? 4000)
    })
    return () => timers.forEach((t) => t && clearTimeout(t))
  }, [toasts, removeToast])

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9998, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = iconMap[toast.type]
          return (
            <motion.div
              key={toast.id}
              className="glass-card"
              style={{ width: '280px', padding: '12px 16px', borderLeft: `3px solid ${borderColorMap[toast.type]}` }}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Icon
                  size={18}
                  style={{ color: borderColorMap[toast.type], flexShrink: 0, marginTop: 1 }}
                  className={toast.type === 'loading' ? 'animate-spin' : ''}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{toast.title}</div>
                  {toast.message && (
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{toast.message}</div>
                  )}
                </div>
              </div>
              {toast.type !== 'loading' && (
                <motion.div
                  style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: borderColorMap[toast.type], borderRadius: '1px' }}
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: (toast.duration ?? 4000) / 1000, ease: 'linear' }}
                />
              )}
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
