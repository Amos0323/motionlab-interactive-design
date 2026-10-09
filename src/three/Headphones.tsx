import { useEffect, useRef, type ReactNode } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Group, MathUtils } from 'three'
import type { ViewerSettings } from './settings'
function Part({
  target,
  animate,
  children,
  name,
}: {
  target: [number, number, number]
  animate: boolean
  children: ReactNode
  name: string
}) {
  const ref = useRef<Group>(null)
  const invalidate = useThree((state) => state.invalidate)
  const [x, y, z] = target
  useEffect(() => {
    invalidate()
  }, [x, y, z, animate, invalidate])
  useFrame(({ invalidate, gl }, dt) => {
    const group = ref.current
    if (!group) return
    // Rebuild the shadow map only when an assembly part actually moves.
    if (
      group.position.x !== x ||
      group.position.y !== y ||
      group.position.z !== z
    )
      gl.shadowMap.needsUpdate = true
    const alpha = animate ? 1 - Math.exp(-9 * Math.min(dt, 0.05)) : 1
    group.position.x = MathUtils.lerp(group.position.x, target[0], alpha)
    group.position.y = MathUtils.lerp(group.position.y, target[1], alpha)
    group.position.z = MathUtils.lerp(group.position.z, target[2], alpha)
    if (
      Math.abs(group.position.x - target[0]) +
        Math.abs(group.position.y - target[1]) +
        Math.abs(group.position.z - target[2]) >
      0.001
    )
      invalidate()
    else group.position.set(...target)
  })
  return (
    <group ref={ref} name={name}>
      {children}
    </group>
  )
}
export function Headphones({
  colour,
  roughness,
  exploded,
  enabled,
}: ViewerSettings) {
  const gap = exploded ? 0.62 : 0
  return (
    <group name="AURA procedural headphones" position={[0, 0.15, 0]}>
      <Part name="Headband" target={[0, gap * 0.65, 0]} animate={enabled}>
        <mesh castShadow position={[0, 0.5, 0]} scale={[1, 1, 0.65]}>
          <torusGeometry args={[1.12, 0.115, 12, 64, Math.PI]} />
          <meshStandardMaterial
            color={colour.shell}
            roughness={roughness}
            metalness={0.25}
          />
        </mesh>
        <mesh castShadow position={[0, 0.5, 0]} scale={[1, 1, 0.8]}>
          <torusGeometry args={[1.01, 0.06, 10, 64, Math.PI]} />
          <meshStandardMaterial color={colour.cushion} roughness={0.95} />
        </mesh>
      </Part>
      {([-1, 1] as const).map((side) => (
        <group key={side}>
          <Part
            name={`${side < 0 ? 'Left' : 'Right'} connecting arm`}
            target={[side * gap * 0.5, 0, 0]}
            animate={enabled}
          >
            <mesh castShadow position={[side * 1.1, 0.23, 0]}>
              <boxGeometry args={[0.12, 0.65, 0.16]} />
              <meshStandardMaterial
                color={colour.metal}
                metalness={0.85}
                roughness={0.25}
              />
            </mesh>
          </Part>
          <Part
            name={`${side < 0 ? 'Left' : 'Right'} ear cup`}
            target={[side * gap, -gap * 0.2, 0]}
            animate={enabled}
          >
            <group
              position={[side * 1.08, -0.45, 0]}
              rotation={[0, 0, side * -0.12]}
            >
              <mesh
                castShadow
                rotation={[0, 0, Math.PI / 2]}
                scale={[1, 1, 0.82]}
              >
                <cylinderGeometry args={[0.64, 0.64, 0.32, 48]} />
                <meshStandardMaterial
                  color={colour.shell}
                  roughness={roughness}
                  metalness={0.3}
                />
              </mesh>
              <mesh
                castShadow
                position={[side * 0.18, 0, 0]}
                rotation={[0, Math.PI / 2, 0]}
                scale={[0.82, 1, 1]}
              >
                <torusGeometry args={[0.59, 0.025, 8, 48]} />
                <meshStandardMaterial
                  color={colour.metal}
                  metalness={0.9}
                  roughness={0.2}
                />
              </mesh>
              <mesh
                position={[side * 0.17, 0, 0]}
                rotation={[0, 0, Math.PI / 2]}
              >
                <cylinderGeometry args={[0.17, 0.17, 0.02, 32]} />
                <meshStandardMaterial
                  color={colour.metal}
                  metalness={0.7}
                  roughness={0.35}
                />
              </mesh>
              {[0, 1, 2].map((i) => (
                <mesh key={i} position={[side * 0.19, -0.3 + i * 0.07, 0]}>
                  <boxGeometry args={[0.02, 0.015, 0.15]} />
                  <meshStandardMaterial color={colour.cushion} />
                </mesh>
              ))}
            </group>
          </Part>
          <Part
            name={`${side < 0 ? 'Left' : 'Right'} cushion`}
            target={[side * gap * 0.25, -gap * 0.2, gap * 1.3]}
            animate={enabled}
          >
            <group
              position={[side * 0.85, -0.45, 0]}
              rotation={[0, 0, side * -0.12]}
            >
              <mesh
                castShadow
                rotation={[0, Math.PI / 2, 0]}
                scale={[0.82, 1, 1]}
              >
                <torusGeometry args={[0.47, 0.13, 16, 48]} />
                <meshStandardMaterial color={colour.cushion} roughness={0.95} />
              </mesh>
              <mesh rotation={[0, Math.PI / 2, 0]} scale={[0.82, 1, 1]}>
                <circleGeometry args={[0.43, 40]} />
                <meshStandardMaterial
                  color={colour.cushion}
                  roughness={1}
                  side={2}
                />
              </mesh>
            </group>
          </Part>
        </group>
      ))}
    </group>
  )
}
