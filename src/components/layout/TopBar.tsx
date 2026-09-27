import { Minus, Square, X } from 'lucide-react'
import { useUIStore } from '../../store/ui.store'
import { EvesLogo } from '../brand/EvesLogo'

const pageTitles: Record<string, string> = {
  dashboard: 'MAIN_INTERFACE',
  meetings: 'SESSION_LOGS',
  transcripts: 'TRANSCRIPT_DB',
  brain: 'NEURAL_CORE',
  repo: 'REPO_SYNTHESIS',
  integrations: 'EXT_SERVICES',
  settings: 'CONFIG'
}

export function TopBar() {
  const currentPage = useUIStore((s) => s.currentPage)

  const isWin = window.eves?.platform === 'win32'

  return (
    <div
      style={{
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        background: 'rgba(3, 3, 6, 0.8)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(0, 245, 255, 0.08)',
        WebkitAppRegion: 'drag',
        flexShrink: 0,
        zIndex: 10,
        fontFamily: '"Courier New", monospace',
        position: 'relative'
      }}
    >
      {/* Corner brackets */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '10px', height: '10px', borderBottom: '2px solid rgba(0,245,255,0.3)', borderLeft: '2px solid rgba(0,245,255,0.3)' }} />

      {/* Left: terminal prompt + logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <EvesLogo size={22} showWordmark />
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', marginLeft: '4px' }}>::</span>
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', textShadow: '0 0 6px rgba(0,245,255,0.15)' }}>
          {pageTitles[currentPage] ?? ''}
        </span>
      </div>

      {/* Center: system status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '9px', color: 'rgba(34, 214, 140, 0.5)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22D68C', boxShadow: '0 0 6px #22D68C', animation: 'pulseDot 2s ease-in-out infinite' }} />
          ONLINE
        </span>
        <span style={{ fontSize: '9px', color: 'rgba(252, 211, 77, 0.4)' }}>CPU: 12%</span>
        <span style={{ fontSize: '9px', color: 'rgba(0, 245, 255, 0.4)' }}>NET: 16kHz</span>
      </div>

      {/* Right: window controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', WebkitAppRegion: 'no-drag' }}>
        {isWin && (
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => window.eves?.minimize()}
              style={winBtnStyle}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,245,255,0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <Minus size={12} />
            </button>
            <button
              onClick={() => window.eves?.maximize()}
              style={winBtnStyle}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,245,255,0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <Square size={10} />
            </button>
            <button
              onClick={() => window.eves?.close()}
              style={winBtnStyle}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,0,110,0.2)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <X size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Right corner bracket */}
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', borderBottom: '2px solid rgba(0,245,255,0.3)', borderRight: '2px solid rgba(0,245,255,0.3)' }} />
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
