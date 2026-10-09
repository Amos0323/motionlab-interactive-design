import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei/core/OrbitControls.js'
import { Vector3 } from 'three'
import { Headphones } from './Headphones'
import { supportsWebGL } from './supportsWebGL'
import type { ViewerSettings } from './settings'
function Camera({
  azimuth,
  elevation,
  distance,
  reset,
  enabled,
}: ViewerSettings) {
  const camera = useThree((s) => s.camera)
  const invalidate = useThree((s) => s.invalidate)
  const goal = useRef<Vector3 | null>(null)
  useEffect(() => {
    goal.current = new Vector3(
      Math.sin(azimuth) * Math.cos(elevation) * distance,
      Math.sin(elevation) * distance,
      Math.cos(azimuth) * Math.cos(elevation) * distance,
    )
    invalidate()
  }, [azimuth, elevation, distance, reset, invalidate])
  useFrame((_, dt) => {
    if (!goal.current) return
    camera.position.lerp(
      goal.current,
      enabled ? 1 - Math.exp(-10 * Math.min(dt, 0.05)) : 1,
    )
    camera.lookAt(0, 0.25, 0)
    if (camera.position.distanceTo(goal.current) < 0.001) {
      camera.position.copy(goal.current)
      goal.current = null
    } else invalidate()
  })
  return null
}
function RenderWakeup({
  auto,
  enabled,
}: Pick<ViewerSettings, 'auto' | 'enabled'>) {
  const frameloop = useThree((state) => state.frameloop)
  const invalidate = useThree((state) => state.invalidate)
  useEffect(() => {
    // Switching out of 'never' needs a frame before OrbitControls can restart.
    // Subscribe to the renderer's applied mode, not just the parent's visibility.
    if (frameloop === 'demand') invalidate()
  }, [frameloop, auto, enabled, invalidate])
  useFrame(() => {
    // Autorotation is continuous work even when a damped control update falls
    // below OrbitControls' change-event threshold. Do not rely on that event.
    if (auto && enabled && frameloop === 'demand') invalidate()
  })
  return null
}
function Lifecycle({
  onFailure,
  onReady,
}: {
  onFailure: () => void
  onReady: () => void
}) {
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    const canvas = gl.domElement
    const lost = (event: Event) => {
      event.preventDefault()
      onFailure()
    }
    canvas.setAttribute(
      'aria-label',
      'Interactive 3D AURA headphones; use the labelled controls below',
    )
    canvas.setAttribute('role', 'img')
    canvas.addEventListener('webglcontextlost', lost)
    onReady()
    return () => canvas.removeEventListener('webglcontextlost', lost)
  }, [gl, onFailure, onReady])
  return null
}
export default function ProductScene({
  settings,
  onFailure,
  onReady,
}: {
  settings: ViewerSettings
  onFailure: () => void
  onReady: () => void
}) {
  const [supported] = useState(supportsWebGL)
  useEffect(() => {
    if (!supported) onFailure()
  }, [supported, onFailure])
  if (!supported) return null
  return (
    <div className="webgl-surface">
      <Canvas
        shadows
        onCreated={({ gl }) => {
          // Camera motion does not change world-space shadow geometry.
          gl.shadowMap.autoUpdate = false
          gl.shadowMap.needsUpdate = true
        }}
        dpr={[1, 1.5]}
        frameloop={settings.active ? 'demand' : 'never'}
        camera={{ position: [4, 2, 5], fov: 42, near: 0.1, far: 30 }}
        gl={{ antialias: true, powerPreference: 'low-power' }}
        fallback={
          <p>WebGL is unavailable. Select Static illustration below.</p>
        }
      >
        <RenderWakeup auto={settings.auto} enabled={settings.enabled} />
        <Lifecycle onFailure={onFailure} onReady={onReady} />
        <Camera {...settings} />
        <ambientLight intensity={0.65} />
        <hemisphereLight args={['#c5c9ff', '#292134', 1.6]} />
        <directionalLight
          castShadow
          position={[3, 6, 5]}
          intensity={settings.light * 3}
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-4}
          shadow-camera-right={4}
          shadow-camera-top={4}
          shadow-camera-bottom={-4}
          shadow-normalBias={0.025}
        />
        <directionalLight
          position={[-4, 2, -3]}
          color="#a38aff"
          intensity={settings.light * 3}
        />
        <directionalLight position={[0, 1, 5]} intensity={1.2} />
        <Headphones {...settings} />
        <mesh
          receiveShadow
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -1.15, 0]}
        >
          <planeGeometry args={[200, 200]} />
          <shadowMaterial transparent opacity={0.3} />
        </mesh>
        <OrbitControls
          makeDefault
          target={[0, 0.25, 0]}
          enablePan={false}
          enableZoom={false}
          minDistance={4.8}
          maxDistance={8}
          minPolarAngle={0.5}
          maxPolarAngle={2.1}
          enableDamping={settings.enabled}
          dampingFactor={0.09}
          autoRotate={settings.auto && settings.enabled && settings.active}
          autoRotateSpeed={0.65}
        />
      </Canvas>
    </div>
  )
}
