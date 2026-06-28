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
    <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', overflow: 'hidden' }}>
      {/* Boot sequence overlay */}
      {!booted && <BootSequence onComplete={() => setBooted(true)} />}

      {/* Hacker background: Matrix rain + grid */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {/* Grid pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(0, 245, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 245, 255, 0.02) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />

        {/* Matrix rain */}
        <MatrixRain opacity={0.04} color="#00F5FF" speed={1.5} />

        {/* Subtle glow orbs — now hacker colored */}
        <div style={{
          position: 'absolute', width: 600, height: 600, borderRadius: '50%',
          background: '#00F5FF', filter: 'blur(120px)', opacity: 0.06,
          top: '-10%', left: '-5%', animation: 'floatOrb1 28s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute', width: 500, height: 500, borderRadius: '50%',
          background: '#7C3AED', filter: 'blur(120px)', opacity: 0.05,
          bottom: '-10%', right: '-5%', animation: 'floatOrb2 35s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          background: '#10B981', filter: 'blur(100px)', opacity: 0.03,
          top: '40%', left: '30%', animation: 'floatOrb4 40s ease-in-out infinite'
        }} />

        {/* EVES watermark */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '180px',
          fontWeight: 900,
          color: 'rgba(0, 245, 255, 0.015)',
          letterSpacing: '20px',
          pointerEvents: 'none',
          userSelect: 'none',
          fontFamily: '"Courier New", monospace'
        }}>
          EVES
        </div>
      </div>

      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
        <TopBar />
        <div style={{ flex: 1, overflow: 'auto' }} className="glass-scrollbar">
          {children}
        </div>
      </div>

      {/* CRT scanlines over everything */}
      <Scanlines opacity={0.02} color="0, 245, 255" />

      <CursorGlow />
      <ToastSystem />
      <ShortcutsOverlay />
      <CommandPalette />
    </div>
  )
}
