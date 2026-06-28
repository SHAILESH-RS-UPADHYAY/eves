import { motion } from 'framer-motion'
import { Minus, Square, X, Shield } from 'lucide-react'
import { useUIStore } from '../../store/ui.store'
import { useStealth } from '../../hooks/useStealth'

const pageTitles: Record<string, string> = {
  dashboard: 'MAIN_INTERFACE',
  meetings: 'SESSION_LOGS',
  transcripts: 'TRANSCRIPT_DB',
  integrations: 'EXT_SERVICES',
  settings: 'CONFIG'
}

export function TopBar() {
  const currentPage = useUIStore((s) => s.currentPage)
  const { isStealthActive, toggleStealth } = useStealth()

  const platform = typeof window !== 'undefined' && (window as any).eves?.platform
  const isWin = platform === 'win32'

  return (
    <div
      style={{
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        background: 'rgba(6, 8, 14, 0.7)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 245, 255, 0.06)',
        WebkitAppRegion: 'drag' as any,
        flexShrink: 0,
        zIndex: 10,
        fontFamily: '"Courier New", monospace'
      }}
    >
      {/* Left: logo */}
      <span style={{ fontSize: '13px', fontWeight: 800, color: '#00F5FF', textShadow: '0 0 8px rgba(0,245,255,0.3)', letterSpacing: '2px' }}>
        ▌EVES
      </span>

      {/* Center: page title */}
      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: '1px' }}>
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
            padding: '4px 10px',
            borderRadius: '6px',
            background: isStealthActive ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)',
            border: isStealthActive ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.06)',
            color: isStealthActive ? '#10B981' : 'rgba(255,255,255,0.2)',
            fontSize: '10px',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: '"Courier New", monospace',
            letterSpacing: '0.5px',
            textShadow: isStealthActive ? '0 0 6px rgba(16,185,129,0.3)' : 'none'
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
        >
          {isStealthActive && (
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#10B981',
                boxShadow: '0 0 6px #10B981',
                animation: 'pulseDot 1.5s ease-in-out infinite'
              }}
            />
          )}
          <Shield size={12} />
          <span>STEALTH</span>
        </motion.button>

        {isWin && (
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => (window as any).eves?.minimize()}
              style={winBtnStyle}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,245,255,0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <Minus size={13} />
            </button>
            <button
              onClick={() => (window as any).eves?.maximize()}
              style={winBtnStyle}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,245,255,0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <Square size={11} />
            </button>
            <button
              onClick={() => (window as any).eves?.close()}
              style={winBtnStyle}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,0,110,0.2)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <X size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const winBtnStyle: React.CSSProperties = {
  width: '26px',
  height: '26px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  background: 'transparent',
  color: 'rgba(255,255,255,0.4)',
  cursor: 'pointer',
  borderRadius: '4px',
  transition: 'background 0.2s'
}
