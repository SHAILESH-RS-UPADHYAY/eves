import { AnimatePresence, motion } from 'framer-motion'
import { useHotkeys } from 'react-hotkeys-hook'
import { useUIStore } from '../../store/ui.store'

const shortcuts = [
  { keys: 'Alt + D', action: 'Toggle Dashboard Window' },
  { keys: 'Alt + L', action: 'Start / Stop Listening' },
  { keys: 'Alt + Backspace', action: 'Hide / Show Overlay' },
  { keys: 'Alt + O', action: 'Toggle Audio Source' },
  { keys: 'Alt + Space', action: 'Synthesize & Save Session' },
  { keys: 'Alt + Q', action: 'Quit EVES' },
  { keys: 'Ctrl/Cmd + K', action: 'Command Palette' },
  { keys: 'Ctrl/Cmd + U', action: 'Upload Recording' },
  { keys: 'Ctrl/Cmd + N', action: 'Export to Notion' },
  { keys: 'Space', action: 'Play / Pause Audio' },
  { keys: 'Escape', action: 'Close Modal' },
  { keys: '?', action: 'Show Shortcuts Modal' }
]

export function ShortcutsOverlay() {
  const isOpen = useUIStore((s) => s.isShortcutsOpen)
  const setOpen = useUIStore((s) => s.setShortcutsOpen)

  useHotkeys('?', () => setOpen(!isOpen))
  useHotkeys('escape', () => setOpen(false))

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            zIndex: 9997,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            className="glass-card"
            style={{ width: '560px', padding: '32px' }}
            initial={{ opacity: 0, scale: 0.94, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="gradient-text" style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>Keyboard Shortcuts</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
              {shortcuts.map((s) => (
                <div key={s.action} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{s.action}</span>
                  <span style={{
                    padding: '2px 8px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    fontFamily: 'monospace',
                    whiteSpace: 'nowrap'
                  }}>
                    {s.keys}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
