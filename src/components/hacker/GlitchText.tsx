import { motion } from 'framer-motion'

export function GlitchText({ text, size = '42px', color = '#00F5FF', as = 'h1' }: {
  text: string
  size?: string
  color?: string
  as?: 'h1' | 'h2' | 'h3' | 'span' | 'div'
}) {
  const Tag = motion[as] || motion.h1

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <Tag
        style={{
          fontSize: size,
          fontWeight: 800,
          color,
          textShadow: `0 0 20px ${color}66, 0 0 40px ${color}33`,
          fontFamily: '"Courier New", "Consolas", monospace',
          letterSpacing: '2px',
          position: 'relative',
          zIndex: 2
        }}
      >
        {text}
      </Tag>
      {/* RGB split layers */}
      <Tag
        aria-hidden
        style={{
          fontSize: size,
          fontWeight: 800,
          color: '#FF006E',
          fontFamily: '"Courier New", "Consolas", monospace',
          letterSpacing: '2px',
          position: 'absolute',
          top: 0,
          left: 0,
          opacity: 0.7,
          mixBlendMode: 'screen',
          animation: 'glitchShift1 3s infinite linear alternate',
          pointerEvents: 'none',
          zIndex: 1
        }}
      >
        {text}
      </Tag>
      <Tag
        aria-hidden
        style={{
          fontSize: size,
          fontWeight: 800,
          color: '#00FF88',
          fontFamily: '"Courier New", "Consolas", monospace',
          letterSpacing: '2px',
          position: 'absolute',
          top: 0,
          left: 0,
          opacity: 0.7,
          mixBlendMode: 'screen',
          animation: 'glitchShift2 2.5s infinite linear alternate',
          pointerEvents: 'none',
          zIndex: 1
        }}
      >
        {text}
      </Tag>
    </div>
  )
}
