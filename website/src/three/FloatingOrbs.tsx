import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const sphereConfigs = [
  { color: '#7C3AED', size: 0.4, pos: [-1.5, 0.5, 0] as [number, number, number], phase: 0 },
  { color: '#06B6D4', size: 0.6, pos: [1.2, -0.8, -1] as [number, number, number], phase: 1.5 },
  { color: '#F43F5E', size: 0.35, pos: [0.8, 1.2, -0.5] as [number, number, number], phase: 2.8 },
  { color: '#F59E0B', size: 0.5, pos: [-1.2, -0.5, -0.8] as [number, number, number], phase: 4.2 },
  { color: '#14B8A6', size: 0.45, pos: [0.2, -1.5, 0.5] as [number, number, number], phase: 5.7 }
]

export function FloatingOrbs() {
  return (
    <>
      {sphereConfigs.map((cfg, i) => (
        <GlassSphere key={i} {...cfg} />
      ))}
    </>
  )
}

function GlassSphere({ color, size, pos, phase }: { color: string; size: number; pos: [number, number, number]; phase: number }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime + phase
    meshRef.current.position.y = pos[1] + Math.sin(t * 0.5) * 0.3
    meshRef.current.position.x = pos[0] + Math.cos(t * 0.3) * 0.1
    meshRef.current.rotation.x = t * 0.2
    meshRef.current.rotation.y = t * 0.15
  })

  return (
    <mesh ref={meshRef} position={pos}>
      <sphereGeometry args={[size, 64, 64]} />
      <meshPhysicalMaterial
        color={color}
        transmission={0.95}
        roughness={0.05}
        metalness={0.1}
        thickness={0.5}
        envMapIntensity={1}
        transparent
        opacity={0.8}
      />
    </mesh>
  )
}
