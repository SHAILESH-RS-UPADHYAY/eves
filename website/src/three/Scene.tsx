import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { ParticleField } from './ParticleField'
import { FloatingOrbs } from './FloatingOrbs'
import { GlassText3D } from './GlassText3D'

export function Scene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 60 }}
      gl={{ alpha: true, antialias: true }}
      style={{ position: 'absolute', inset: 0 }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[-2, 2, 2]} intensity={2} color="#7C3AED" />
      <pointLight position={[2, -2, -2]} intensity={1.5} color="#06B6D4" />
      <pointLight position={[0, 0, -4]} intensity={1} color="#F43F5E" />

      {/* Scene elements */}
      <ParticleField />
      <FloatingOrbs />
      <GlassText3D />

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
