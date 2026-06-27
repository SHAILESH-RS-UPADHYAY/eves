import { type ReactNode } from 'react'
import { CursorGlow } from '../extras/CursorGlow'
import { ToastSystem } from '../extras/ToastSystem'
import { ShortcutsOverlay } from '../extras/ShortcutsOverlay'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { CommandPalette } from '../command/CommandPalette'

const orbConfigs = [
  { size: 700, color: '#7C3AED', top: '-10%', left: '-5%', anim: 'floatOrb1 28s ease-in-out infinite', delay: '0s' },
  { size: 500, color: '#06B6D4', top: '-5%', right: '-8%', anim: 'floatOrb2 35s ease-in-out infinite', delay: '0s' },
  { size: 600, color: '#F43F5E', bottom: '-5%', left: '-10%', anim: 'floatOrb3 22s ease-in-out infinite', delay: '0s' },
  { size: 450, color: '#14B8A6', top: '30%', left: '35%', anim: 'floatOrb4 40s ease-in-out infinite', delay: '0s' },
  { size: 380, color: '#F59E0B', bottom: '-8%', right: '-5%', anim: 'floatOrb5 18s ease-in-out infinite', delay: '0s' },
  { size: 520, color: '#4C1D95', top: '10%', left: '20%', anim: 'floatOrb6 32s ease-in-out infinite', delay: '0s' }
]

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', overflow: 'hidden' }}>
      {/* Animated liquid background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {orbConfigs.map((orb, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: orb.size,
              height: orb.size,
              borderRadius: '50%',
              background: orb.color,
              filter: 'blur(100px)',
              opacity: 0.13,
              willChange: 'transform',
              top: orb.top,
              bottom: orb.bottom,
              left: orb.left,
              right: orb.right,
              animation: orb.anim
            }}
          />
        ))}
      </div>

      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
        <TopBar />
        <div style={{ flex: 1, overflow: 'auto' }} className="glass-scrollbar">
          {children}
        </div>
      </div>

      <CursorGlow />
      <ToastSystem />
      <ShortcutsOverlay />
      <CommandPalette />
    </div>
  )
}
