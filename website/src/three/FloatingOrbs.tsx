import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Kept to the edges and translucent so they never sit on the headline.
const sphereConfigs = [
  { color: '#22d3ee', size: 0.32, pos: [-3.1, 1.3, -1] as [number, number, number], phase: 0 },
  { color: '#0b7285', size: 0.5, pos: [3.0, -1.1, -1.5] as [number, number, number], phase: 1.5 },
  { color: '#7ee787', size: 0.22, pos: [2.5, 1.7, -0.8] as [number, number, number], phase: 2.8 },
  { color: '#9aa3ad', size: 0.38, pos: [-2.7, -1.6, -1.2] as [number, number, number], phase: 4.2 }
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
        opacity={0.35}
      />
    </mesh>
  )
}
