import { type ReactNode, useState } from 'react'
import { CursorGlow } from '../extras/CursorGlow'
import { ToastSystem } from '../extras/ToastSystem'
import { ShortcutsOverlay } from '../extras/ShortcutsOverlay'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { CommandPalette } from '../command/CommandPalette'
import { MatrixRain } from '../hacker/MatrixRain'
import { Scanlines } from '../hacker/Scanlines'
import { BootSequence } from '../hacker/BootSequence'

export function AppShell({ children }: { children: ReactNode }) {
  const [booted, setBooted] = useState(false)

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', position: 'relative', overflow: 'hidden',
      background: 'radial-gradient(circle at 50% -10%, #262b34 0%, #1b1f26 55%, #131519 100%)'
    }}>
      {/* Boot sequence overlay */}
      {!booted && <BootSequence onComplete={() => setBooted(true)} />}

      {/* Hacker background layers — Atom One Dark terminal */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {/* Charcoal base wash */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(160deg, rgba(40,44,52,0.55) 0%, rgba(22,24,29,0.2) 45%, rgba(19,21,25,0.6) 100%)'
        }} />

        {/* Scrolling grid — green + cyan terminal lattice */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(126, 231, 135, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.035) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          animation: 'gridScroll 9s linear infinite',
          maskImage: 'radial-gradient(ellipse at center, black 55%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 55%, transparent 100%)'
        }} />

        {/* Matrix rain — classic hacker green */}
        <MatrixRain opacity={0.06} color="#7ee787" speed={1.2} />

        {/* Diagonal circuit sheen */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.5,
          background: 'repeating-linear-gradient(115deg, transparent 0, transparent 78px, rgba(97,175,239,0.03) 78px, rgba(97,175,239,0.03) 79px)'
        }} />

        {/* Glow orbs — Atom cyan / green / purple */}
        <div style={{
          position: 'absolute', width: 520, height: 520, borderRadius: '50%',
          background: '#22d3ee', filter: 'blur(150px)', opacity: 0.05,
          top: '-12%', left: '-6%', animation: 'floatOrb1 28s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute', width: 440, height: 440, borderRadius: '50%',
          background: '#7ee787', filter: 'blur(150px)', opacity: 0.035,
          bottom: '-12%', right: '-6%', animation: 'floatOrb2 35s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute', width: 360, height: 360, borderRadius: '50%',
          background: '#c678dd', filter: 'blur(150px)', opacity: 0.03,
          top: '40%', right: '25%', animation: 'floatOrb3 32s ease-in-out infinite'
        }} />

        {/* EVES watermark */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '210px',
          fontWeight: 900,
          color: 'rgba(126, 231, 135, 0.014)',
          letterSpacing: '26px',
          pointerEvents: 'none',
          userSelect: 'none',
          fontFamily: '"Courier New", monospace'
        }}>
          EVES
        </div>

        {/* CRT vignette — darkening at edges */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 42%, rgba(0, 0, 0, 0.55) 100%)',
          pointerEvents: 'none'
        }} />
      </div>

      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
        <TopBar />
        <div style={{ flex: 1, overflow: 'auto' }} className="glass-scrollbar">
          {children}
        </div>

        {/* Bottom terminal status bar */}
        <div style={{
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          background: 'rgba(3, 3, 6, 0.8)',
          borderTop: '1px solid rgba(0, 245, 255, 0.06)',
          fontFamily: '"Courier New", monospace',
          fontSize: '9px',
          color: 'rgba(255, 255, 255, 0.3)',
          flexShrink: 0,
          zIndex: 10,
          letterSpacing: '0.5px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: '#7ee787' }}>●</span>
            <span>evessys@localhost</span>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>:</span>
            <span style={{ color: '#22d3ee' }}>~/eves</span>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>$</span>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>./eves --run</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: 'rgba(255, 203, 107, 0.6)' }}>ENC: AES-256</span>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
            <span style={{ color: 'rgba(34, 211, 238, 0.6)' }}>PID: 0x1A4F</span>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
            <span style={{ color: 'rgba(126, 231, 135, 0.6)' }}>MEM: 128MB</span>
          </div>
        </div>
      </div>

      {/* CRT scanlines over everything */}
      <Scanlines opacity={0.03} color="34, 211, 238" />

      <CursorGlow />
      <ToastSystem />
      <ShortcutsOverlay />
      <CommandPalette />
    </div>
  )
}
