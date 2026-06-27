import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text3D, Float } from '@react-three/drei'
import * as THREE from 'three'

export function GlassText3D() {
  const ref = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
  })

  return (
    <group ref={ref} position={[0, 0.3, 0]}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <Text3D
          font="/fonts/helvetiker_regular.typeface.json"
          size={0.8}
          height={0.08}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.01}
          bevelSegments={5}
        >
          EVES
          <meshPhysicalMaterial
            color="#7C3AED"
            transmission={0.6}
            roughness={0.1}
            metalness={0.3}
            thickness={0.5}
            emissive="#7C3AED"
            emissiveIntensity={0.15}
          />
        </Text3D>
      </Float>
    </group>
  )
}
