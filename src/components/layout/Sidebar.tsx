import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Mic, FileText, Link2, Settings } from 'lucide-react'
import { useUIStore } from '../../store/ui.store'
import type { NavPage } from '../../types'

const navItems: { page: NavPage; icon: typeof LayoutDashboard; label: string }[] = [
  { page: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { page: 'meetings', icon: Mic, label: 'Meetings' },
  { page: 'transcripts', icon: FileText, label: 'Transcripts' },
  { page: 'integrations', icon: Link2, label: 'Integrations' },
  { page: 'settings', icon: Settings, label: 'Settings' }
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
        background: 'rgba(5,5,8,0.8)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 0',
        zIndex: 10,
        flexShrink: 0,
        overflow: 'hidden'
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
              className="gradient-text"
              style={{ fontSize: '18px', fontWeight: 700, marginLeft: '8px' }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              EVES
            </motion.span>
          )}
        </AnimatePresence>
        {!hovered && (
          <span className="gradient-text" style={{ fontSize: '18px', fontWeight: 700, textAlign: 'center', width: '100%' }}>◈</span>
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
                borderRadius: '10px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: isActive ? 'var(--accent-violet-mid)' : 'var(--text-secondary)',
                position: 'relative',
                textAlign: 'left'
              }}
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-pill"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(124,58,237,0.15)',
                    borderRadius: '10px',
                    borderLeft: '2px solid var(--accent-violet)'
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon size={22} style={{ flexShrink: 0, position: 'relative', zIndex: 1 }} />
              <AnimatePresence>
                {hovered && (
                  <motion.span
                    style={{ fontSize: '13px', fontWeight: 500, position: 'relative', zIndex: 1, whiteSpace: 'nowrap' }}
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
      <div style={{ padding: '12px 16px', fontSize: '10px', color: 'var(--text-muted)' }}>
        {hovered ? 'EVES v1.0.0' : 'v1'}
      </div>
    </motion.div>
  )
}
