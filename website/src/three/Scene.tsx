import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { ParticleField } from './ParticleField'
import { FloatingOrbs } from './FloatingOrbs'

import type { Theme } from '../lib'

export function Scene({ theme }: { theme: Theme }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 60 }}
      gl={{ alpha: true, antialias: true }}
      style={{ position: 'absolute', inset: 0 }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[-2, 2, 2]} intensity={2} color="#22d3ee" />
      <pointLight position={[2, -2, -2]} intensity={1.5} color="#7ee787" />
      <pointLight position={[0, 0, -4]} intensity={1} color="#0b7285" />

      {/* Scene elements */}
      <ParticleField light={theme === 'light'} />
      <FloatingOrbs />

      <OrbitControls
        autoRotate
        autoRotateSpeed={0.3}
        enableZoom={false}
        enablePan={false}
        dampingFactor={0.05}
      />
    </Canvas>
  )
}
