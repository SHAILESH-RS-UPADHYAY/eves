import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Mic, FileText, Link2, Settings } from 'lucide-react'
import { useUIStore } from '../../store/ui.store'
import type { NavPage } from '../../types'

const navItems: { page: NavPage; icon: typeof LayoutDashboard; label: string; cmd: string }[] = [
  { page: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', cmd: 'main.sh' },
  { page: 'meetings', icon: Mic, label: 'Meetings', cmd: 'logs.sh' },
  { page: 'transcripts', icon: FileText, label: 'Transcripts', cmd: 'cat.sh' },
  { page: 'integrations', icon: Link2, label: 'Integrations', cmd: 'sync.sh' },
  { page: 'settings', icon: Settings, label: 'Settings', cmd: 'cfg.sh' }
]

export function Sidebar() {
  const [hovered, setHovered] = useState(false)
  const currentPage = useUIStore((s) => s.currentPage)
  const setPage = useUIStore((s) => s.setPage)
  const setSettingsOpen = useUIStore((s) => s.setSettingsOpen)

  return (
    <motion.div
      style={{
        width: hovered ? 220 : 72,
        background: 'rgba(3, 3, 6, 0.9)',
        backdropFilter: 'blur(16px)',
        borderRight: '1px solid rgba(0, 245, 255, 0.08)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 0',
        zIndex: 10,
        flexShrink: 0,
        overflow: 'hidden',
        fontFamily: '"Courier New", monospace',
        position: 'relative'
      }}
      animate={{ width: hovered ? 220 : 72 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top corner bracket */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: '12px', height: '12px', borderTop: '2px solid rgba(0,245,255,0.3)', borderRight: '2px solid rgba(0,245,255,0.3)' }} />

      {/* Logo */}
      <div style={{ padding: '0 16px 20px', height: '48px', display: 'flex', alignItems: 'center' }}>
        <AnimatePresence>
          {hovered && (
            <motion.span
              style={{ fontSize: '16px', fontWeight: 800, marginLeft: '8px', color: '#00F5FF', textShadow: '0 0 12px rgba(0,245,255,0.5)', letterSpacing: '3px' }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              ▌EVES
            </motion.span>
          )}
        </AnimatePresence>
        {!hovered && (
          <span style={{ fontSize: '18px', fontWeight: 800, textAlign: 'center', width: '100%', color: '#00F5FF', textShadow: '0 0 12px rgba(0,245,255,0.5)' }}>◈</span>
        )}
      </div>

      {/* Section label */}
      {hovered && (
        <div style={{ padding: '0 20px 8px', fontSize: '8px', color: 'rgba(0,245,255,0.4)', letterSpacing: '1px', textTransform: 'uppercase' }}>
          ▸ NAVIGATION
        </div>
      )}

      {/* Nav items */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', padding: '0 8px' }}>
        {navItems.map((item) => {
          const isActive = currentPage === item.page
          const Icon = item.icon
          return (
            <motion.button
              key={item.page}
              onClick={() => {
                if (item.page === 'settings') setSettingsOpen(true)
                else setPage(item.page)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '6px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: isActive ? '#00F5FF' : 'rgba(255,255,255,0.5)',
                position: 'relative',
                textAlign: 'left',
                fontFamily: '"Courier New", monospace',
                textShadow: isActive ? '0 0 8px rgba(0,245,255,0.3)' : 'none'
              }}
              whileHover={{ backgroundColor: 'rgba(0,245,255,0.04)' }}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-pill"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,245,255,0.06)',
                    borderRadius: '6px',
                    borderLeft: '2px solid #00F5FF',
                    boxShadow: '0 0 16px rgba(0,245,255,0.08)'
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon size={18} style={{ flexShrink: 0, position: 'relative', zIndex: 1 }} />
              <AnimatePresence>
                {hovered && (
                  <motion.span
                    style={{ fontSize: '11px', fontWeight: 600, position: 'relative', zIndex: 1, whiteSpace: 'nowrap', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    {item.label}
                    <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.2)' }}>{item.cmd}</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )
        })}
      </div>

      {/* Bottom section */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(0,245,255,0.04)', marginTop: '8px' }}>
        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', fontFamily: '"Courier New", monospace', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {hovered ? (
            <>
              <span style={{ color: 'rgba(0,245,255,0.5)' }}>{'>'} eves v2.1.0</span>
              <span style={{ color: 'rgba(34,214,140,0.4)', fontSize: '8px' }}>● SYS_OK</span>
            </>
          ) : (
            <span style={{ color: 'rgba(0,245,255,0.4)' }}>{'>'} v2.1</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
