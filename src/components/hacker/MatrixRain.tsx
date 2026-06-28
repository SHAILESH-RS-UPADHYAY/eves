import { useEffect, useRef } from 'react'

export function MatrixRain({ opacity = 0.06, color = '#00F5FF', speed = 1 }: {
  opacity?: number
  color?: string
  speed?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    let animationId: number
    let columns: number
    let drops: number[]
    const chars = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎ0123456789ABCDEF<>[]{}|/\\$@#%&'
    const fontSize = 14

    function resize() {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      columns = Math.floor(canvas.width / fontSize)
      drops = Array(columns).fill(0).map(() => Math.random() * -100)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    let frame = 0
    function draw() {
      frame++
      if (frame % Math.max(1, Math.floor(2 / speed)) !== 0) {
        animationId = requestAnimationFrame(draw)
        return
      }

      ctx.fillStyle = 'rgba(10, 10, 20, 0.06)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.font = `${fontSize}px 'Courier New', monospace`

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)]
        const x = i * fontSize
        const y = drops[i] * fontSize

        if (Math.random() > 0.97) {
          ctx.fillStyle = '#FFFFFF'
          ctx.shadowColor = color
          ctx.shadowBlur = 8
        } else {
          ctx.fillStyle = color
          ctx.shadowBlur = 0
        }
        ctx.fillText(char, x, y)

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i]++
      }

      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationId)
      ro.disconnect()
    }
  }, [color, speed])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        opacity,
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  )
}
