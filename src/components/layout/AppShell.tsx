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
    <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', overflow: 'hidden', background: '#030306' }}>
      {/* Boot sequence overlay */}
      {!booted && <BootSequence onComplete={() => setBooted(true)} />}

      {/* Hacker background layers */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {/* Grid pattern — denser, more visible */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(0, 245, 255, 0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 245, 255, 0.025) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }} />

        {/* Matrix rain */}
        <MatrixRain opacity={0.05} color="#00F5FF" speed={1.2} />

        {/* Subtle glow orbs — hacker colored */}
        <div style={{
          position: 'absolute', width: 500, height: 500, borderRadius: '50%',
          background: '#00F5FF', filter: 'blur(140px)', opacity: 0.04,
          top: '-10%', left: '-5%', animation: 'floatOrb1 28s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          background: '#FF006E', filter: 'blur(140px)', opacity: 0.025,
          bottom: '-10%', right: '-5%', animation: 'floatOrb2 35s ease-in-out infinite'
        }} />

        {/* EVES watermark */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '200px',
          fontWeight: 900,
          color: 'rgba(0, 245, 255, 0.012)',
          letterSpacing: '24px',
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
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.5) 100%)',
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
            <span style={{ color: '#22D68C' }}>●</span>
            <span>evessys@localhost</span>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>:</span>
            <span style={{ color: '#00F5FF' }}>~/eves</span>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>$</span>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>./eves --run</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: 'rgba(252, 211, 77, 0.5)' }}>ENC: AES-256</span>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
            <span style={{ color: 'rgba(0, 245, 255, 0.5)' }}>PID: 0x1A4F</span>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
            <span style={{ color: 'rgba(34, 214, 140, 0.5)' }}>MEM: 128MB</span>
          </div>
        </div>
      </div>

      {/* CRT scanlines over everything */}
      <Scanlines opacity={0.025} color="0, 245, 255" />

      <CursorGlow />
      <ToastSystem />
      <ShortcutsOverlay />
      <CommandPalette />
    </div>
  )
}
