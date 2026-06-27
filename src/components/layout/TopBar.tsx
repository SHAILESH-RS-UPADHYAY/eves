import { motion } from 'framer-motion'
import { Minus, Square, X, Shield } from 'lucide-react'
import { useUIStore } from '../../store/ui.store'
import { useStealth } from '../../hooks/useStealth'

const pageTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  meetings: 'Meetings',
  transcripts: 'Transcripts',
  integrations: 'Integrations',
  settings: 'Settings'
}

export function TopBar() {
  const currentPage = useUIStore((s) => s.currentPage)
  const { isStealthActive, toggleStealth } = useStealth()

  const platform = typeof window !== 'undefined' && (window as any).eves?.platform
  const isWin = platform === 'win32'

  return (
    <div
      style={{
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        background: 'rgba(5,5,8,0.6)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        WebkitAppRegion: 'drag' as any,
        flexShrink: 0,
        zIndex: 10
      }}
    >
      {/* Left: logo */}
      <span className="gradient-text" style={{ fontSize: '14px', fontWeight: 700 }}>EVES</span>

      {/* Center: page title */}
      <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
        {pageTitles[currentPage] ?? ''}
      </span>

      {/* Right: stealth + window controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', WebkitAppRegion: 'no-drag' as any }}>
        <motion.button
          onClick={toggleStealth}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '8px',
            background: isStealthActive ? 'rgba(6,182,212,0.1)' : 'var(--glass-2)',
            border: isStealthActive ? '1px solid rgba(6,182,212,0.3)' : 'var(--border-glass)',
            color: isStealthActive ? 'var(--text-cyan)' : 'var(--text-muted)',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            backdropFilter: 'blur(20px)'
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
        >
          {isStealthActive && (
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--accent-cyan)',
                animation: 'stealthPulse 2s cubic-bezier(0.4,0,0.6,1) infinite'
              }}
            />
          )}
          <Shield size={14} />
          <span>STEALTH</span>
        </motion.button>

        {isWin && (
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => (window as any).eves?.minimize()}
              style={winBtnStyle}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <Minus size={14} />
            </button>
            <button
              onClick={() => (window as any).eves?.maximize()}
              style={winBtnStyle}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <Square size={12} />
            </button>
            <button
              onClick={() => (window as any).eves?.close()}
              style={winBtnStyle}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(244,63,94,0.3)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const winBtnStyle: React.CSSProperties = {
  width: '28px',
  height: '28px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  background: 'transparent',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  borderRadius: '4px',
  transition: 'background 0.2s'
}
