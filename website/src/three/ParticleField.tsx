import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

export function ParticleField({ light = false }: { light?: boolean }) {
  const pointsRef = useRef<THREE.Points>(null)
  const { mouse } = useThree()
  const mouseRef = useRef({ x: 0, y: 0 })

  const positions = useMemo(() => {
    const count = 3000
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 8
      arr[i * 3] = (Math.random() - 0.5) * r * 2
      arr[i * 3 + 1] = (Math.random() - 0.5) * r * 2
      arr[i * 3 + 2] = (Math.random() - 0.5) * r * 2
    }
    return arr
  }, [])

  const colors = useMemo(() => {
    const count = 3000
    const arr = new Float32Array(count * 3)
    const palette = [
      new THREE.Color(light ? '#0b7285' : '#22d3ee'),
      new THREE.Color(light ? '#2f6f4f' : '#7ee787'),
      new THREE.Color(light ? '#15171b' : '#ffffff')
    ]
    for (let i = 0; i < count; i++) {
      const c = palette[Math.floor(Math.random() * palette.length)]
      arr[i * 3] = c.r
      arr[i * 3 + 1] = c.g
      arr[i * 3 + 2] = c.b
    }
    return arr
  }, [])

  useFrame((state) => {
    if (!pointsRef.current) return

    // Slow Y rotation
    pointsRef.current.rotation.y += 0.001

    // Mouse deflection
    mouseRef.current.x += (mouse.x - mouseRef.current.x) * 0.05
    mouseRef.current.y += (mouse.y - mouseRef.current.y) * 0.05

    const geom = pointsRef.current.geometry
    const posAttr = geom.attributes.position as THREE.BufferAttribute
    const original = positions

    for (let i = 0; i < posAttr.count; i++) {
      const px = original[i * 3]
      const py = original[i * 3 + 1]
      const pz = original[i * 3 + 2]

      const mx = mouseRef.current.x * 4
      const my = mouseRef.current.y * 4

      const dx = px - mx
      const dy = py - my
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < 1.5) {
        const force = (1.5 - dist) / 1.5
        posAttr.array[i * 3] = px + (dx / dist) * force * 0.3
        posAttr.array[i * 3 + 1] = py + (dy / dist) * force * 0.3
      } else {
        posAttr.array[i * 3] = THREE.MathUtils.lerp(posAttr.array[i * 3], px, 0.05)
        posAttr.array[i * 3 + 1] = THREE.MathUtils.lerp(posAttr.array[i * 3 + 1], py, 0.05)
      }
      posAttr.array[i * 3 + 2] = pz
    }
    posAttr.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={3000} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={3000} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.015} vertexColors transparent opacity={0.8} sizeAttenuation />
    </points>
  )
}
