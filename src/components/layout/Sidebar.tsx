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
        background: 'rgba(6, 8, 14, 0.85)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(0, 245, 255, 0.06)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 0',
        zIndex: 10,
        flexShrink: 0,
        overflow: 'hidden',
        fontFamily: '"Courier New", monospace'
      }}
      animate={{ width: hovered ? 220 : 72 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Logo */}
      <div style={{ padding: '0 16px 20px', height: '48px', display: 'flex', alignItems: 'center' }}>
        <AnimatePresence>
          {hovered && (
            <motion.span
              style={{ fontSize: '16px', fontWeight: 800, marginLeft: '8px', color: '#00F5FF', textShadow: '0 0 10px rgba(0,245,255,0.4)', letterSpacing: '2px' }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              EVES
            </motion.span>
          )}
        </AnimatePresence>
        {!hovered && (
          <span style={{ fontSize: '18px', fontWeight: 800, textAlign: 'center', width: '100%', color: '#00F5FF', textShadow: '0 0 10px rgba(0,245,255,0.4)' }}>◈</span>
        )}
      </div>

      {/* Nav items */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 8px' }}>
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
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: isActive ? '#00F5FF' : 'rgba(255,255,255,0.4)',
                position: 'relative',
                textAlign: 'left',
                fontFamily: '"Courier New", monospace'
              }}
              whileHover={{ backgroundColor: 'rgba(0,245,255,0.04)' }}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-pill"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,245,255,0.08)',
                    borderRadius: '8px',
                    borderLeft: '2px solid #00F5FF',
                    boxShadow: '0 0 12px rgba(0,245,255,0.1)'
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon size={20} style={{ flexShrink: 0, position: 'relative', zIndex: 1 }} />
              <AnimatePresence>
                {hovered && (
                  <motion.span
                    style={{ fontSize: '12px', fontWeight: 600, position: 'relative', zIndex: 1, whiteSpace: 'nowrap', letterSpacing: '0.5px' }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )
        })}
      </div>

      {/* Version */}
      <div style={{ padding: '12px 16px', fontSize: '9px', color: 'rgba(255,255,255,0.2)', fontFamily: '"Courier New", monospace' }}>
        {hovered ? '> eves v2.1.0' : '> v2.1'}
      </div>
    </motion.div>
  )
}
