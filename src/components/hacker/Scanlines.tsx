export function Scanlines({ opacity = 0.025, color = '0, 245, 255' }: {
  opacity?: number
  color?: string
}) {
  return (
    <>
      {/* Horizontal scanlines */}
      <div style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9998,
        background: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(${color}, ${opacity}) 2px,
          rgba(${color}, ${opacity}) 3px
        )`
      }} />
      {/* Moving scan beam */}
      <div style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9997,
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: '120px',
          background: `linear-gradient(180deg,
            transparent 0%,
            rgba(${color}, ${opacity * 2}) 40%,
            rgba(${color}, ${opacity * 4}) 50%,
            rgba(${color}, ${opacity * 2}) 60%,
            transparent 100%)`,
          animation: 'scanBeamMove 8s linear infinite'
        }} />
      </div>
      {/* Vignette */}
      <div style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9996,
        background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)'
      }} />
    </>
  )
}
