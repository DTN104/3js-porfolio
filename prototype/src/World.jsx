import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { input } from './input'
import { WORLD_RADIUS, zones, obstacles } from './content'

const WALK = 4.2
const RUN = 8.4
const R = WORLD_RADIUS

// Camera cố định góc 45°, nên hướng đi quy chiếu theo camera (FR-010).
const FWD = new THREE.Vector3(-1, 0, -1).normalize()
const RGT = new THREE.Vector3(1, 0, -1).normalize()

export function Ground() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[R, 72]} />
        <meshStandardMaterial color="#8fb072" />
      </mesh>
      {/* FR-015: ranh giới nhận biết được bằng mắt, không dùng tường vô hình */}
      <mesh position={[0, -0.55, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[R, R + 3.2, 72]} />
        <meshStandardMaterial color="#d8c9a3" />
      </mesh>
      <mesh position={[0, -0.9, 0]}>
        <cylinderGeometry args={[R + 3.2, R + 2.2, 1.4, 72]} />
        <meshStandardMaterial color="#7b8fa8" />
      </mesh>
      <Path />
    </group>
  )
}

// AST-12: lối dẫn giữa các khu vực
function Path() {
  const tiles = useMemo(() => {
    const out = []
    const stops = [[0, 0], ...zones.map(z => z.pos)]
    for (let i = 1; i < stops.length; i++) {
      const [ax, az] = stops[0], [bx, bz] = stops[i]
      const steps = 7
      for (let s = 1; s < steps; s++) {
        const t = s / steps
        out.push([ax + (bx - ax) * t, az + (bz - az) * t, (i * 37 + s * 13) % 90])
      }
    }
    return out
  }, [])
  return tiles.map(([x, z, rot], i) => (
    <mesh key={i} position={[x, 0.02, z]} rotation={[-Math.PI / 2, 0, (rot * Math.PI) / 180]}>
      <circleGeometry args={[0.62, 8]} />
      <meshStandardMaterial color="#c2b291" />
    </mesh>
  ))
}

export function Avatar({ bodyRef }) {
  const legPhase = useRef(0)
  const dir = useRef(0)

  useFrame((_, dt) => {
    const g = bodyRef.current
    if (!g) return
    const step = Math.min(dt, 0.05)

    let mx = 0, mz = 0
    if (!input.frozen) {
      if (input.forward) { mx += FWD.x; mz += FWD.z }
      if (input.back)    { mx -= FWD.x; mz -= FWD.z }
      if (input.right)   { mx += RGT.x; mz += RGT.z }
      if (input.left)    { mx -= RGT.x; mz -= RGT.z }
    }

    const len = Math.hypot(mx, mz)
    const moving = len > 0.001
    const speed = input.running ? RUN : WALK

    if (moving) {
      mx /= len; mz /= len                       // FR-013: đi chéo không nhanh hơn
      g.position.x += mx * speed * step
      g.position.z += mz * speed * step
      dir.current = Math.atan2(mx, mz)
      legPhase.current += step * (input.running ? 15 : 9)
    } else {
      legPhase.current += step * 1.6             // FR-009: trạng thái đứng yên
    }

    // FR-012: không đi xuyên vật thể đặc
    for (const o of obstacles) {
      const dx = g.position.x - o.pos[0]
      const dz = g.position.z - o.pos[1]
      const d = Math.hypot(dx, dz)
      const min = o.r + 0.5
      if (d < min && d > 0.0001) {
        g.position.x = o.pos[0] + (dx / d) * min
        g.position.z = o.pos[1] + (dz / d) * min
      }
    }

    // FR-012: không ra ngoài ranh giới thế giới
    const fromCenter = Math.hypot(g.position.x, g.position.z)
    if (fromCenter > R - 1.2) {
      const k = (R - 1.2) / fromCenter
      g.position.x *= k
      g.position.z *= k
    }

    // hook QA cho spike: đọc vị trí nhân vật từ bên ngoài (window.__avatar)
    window.__avatar = { x: +g.position.x.toFixed(2), z: +g.position.z.toFixed(2), moving, running: input.running, dt: +step.toFixed(4) }

    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, dir.current, 12, step)
    const bob = moving ? Math.sin(legPhase.current) * (input.running ? 0.16 : 0.09) : Math.sin(legPhase.current) * 0.03
    g.position.y = Math.abs(bob)
    g.rotation.z = moving && input.running ? 0.08 : 0
  })

  return (
    <group ref={bodyRef} position={[0, 0, 4]}>
      <mesh position={[0, 0.62, 0]} castShadow>
        <capsuleGeometry args={[0.34, 0.5, 6, 14]} />
        <meshStandardMaterial color="#4d6ea8" />
      </mesh>
      <mesh position={[0, 1.42, 0]} castShadow>
        <sphereGeometry args={[0.36, 20, 16]} />
        <meshStandardMaterial color="#e9c9a8" />
      </mesh>
      <mesh position={[0, 1.6, 0.02]}>
        <sphereGeometry args={[0.372, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.42]} />
        <meshStandardMaterial color="#3b3230" />
      </mesh>
      {/* hướng nhìn — để thấy nhân vật đang quay về đâu */}
      <mesh position={[0, 1.4, 0.34]}>
        <boxGeometry args={[0.42, 0.09, 0.06]} />
        <meshStandardMaterial color="#2b2b2b" />
      </mesh>
    </group>
  )
}

export function Hotspot({ zone, active, onOpen }) {
  const ring = useRef()
  const [x, z] = zone.pos

  useFrame((state) => {
    if (ring.current) {
      const t = state.clock.elapsedTime
      ring.current.scale.setScalar(active ? 1 + Math.sin(t * 3) * 0.06 : 1)
      ring.current.material.opacity = active ? 0.85 : 0.18
    }
  })

  return (
    <group position={[x, 0, z]} onClick={(e) => { e.stopPropagation(); onOpen(zone.id) }}>
      {/* FR-017: chỉ dấu trực quan khi vào phạm vi tương tác */}
      <mesh ref={ring} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[zone.r - 0.25, zone.r, 48]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.18} />
      </mesh>
      {zone.kind === 'house' && (
        <group>
          <mesh position={[0, 0.85, 0]} castShadow>
            <boxGeometry args={[2.6, 1.7, 2.2]} />
            <meshStandardMaterial color={zone.color} />
          </mesh>
          <mesh position={[0, 2.1, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[2.15, 1.2, 4]} />
            <meshStandardMaterial color={zone.roof} />
          </mesh>
          <mesh position={[0, 0.55, 1.12]}>
            <boxGeometry args={[0.7, 1.1, 0.08]} />
            <meshStandardMaterial color="#7a5a3c" />
          </mesh>
        </group>
      )}
      {zone.kind === 'gallery' && (
        <group>
          {[-1.1, 0, 1.1].map((ox, i) => (
            <mesh key={i} position={[ox, 1.05, 0]} rotation={[0, 0, 0.06]} castShadow>
              <boxGeometry args={[0.9, 1.3, 0.1]} />
              <meshStandardMaterial color="#f2efe6" />
            </mesh>
          ))}
          <mesh position={[0, 0.28, 0.55]} castShadow>
            <boxGeometry args={[3.4, 0.55, 0.8]} />
            <meshStandardMaterial color={zone.roof} />
          </mesh>
          {[-1.7, 1.7].map((ox, i) => (
            <mesh key={i} position={[ox, 1.1, -0.6]}>
              <cylinderGeometry args={[0.09, 0.09, 2.2, 8]} />
              <meshStandardMaterial color={zone.roof} />
            </mesh>
          ))}
          <mesh position={[0, 2.25, -0.6]}>
            <boxGeometry args={[3.8, 0.14, 1.5]} />
            <meshStandardMaterial color={zone.color} />
          </mesh>
        </group>
      )}
      {zone.kind === 'mailbox' && (
        <group>
          <mesh position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 1.2, 8]} />
            <meshStandardMaterial color="#7a5a3c" />
          </mesh>
          <mesh position={[0, 1.35, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <capsuleGeometry args={[0.32, 0.5, 4, 12]} />
            <meshStandardMaterial color={zone.color} />
          </mesh>
          <mesh position={[0.34, 1.5, 0]}>
            <boxGeometry args={[0.06, 0.34, 0.2]} />
            <meshStandardMaterial color="#c2334d" />
          </mesh>
          <mesh position={[-0.9, 0.9, 0]} castShadow>
            <boxGeometry args={[1.1, 0.8, 0.08]} />
            <meshStandardMaterial color="#e7dcc4" />
          </mesh>
        </group>
      )}
    </group>
  )
}

export function CameraRig({ target, zoomRef }) {
  const { camera } = useThree()
  const look = useRef(new THREE.Vector3())

  useFrame((_, dt) => {
    const t = target.current
    if (!t) return
    const step = Math.min(dt, 0.05)
    const z = zoomRef.current
    const wantX = t.position.x + 13 * z
    const wantY = 13.5 * z
    const wantZ = t.position.z + 13 * z
    camera.position.x = THREE.MathUtils.damp(camera.position.x, wantX, 6, step)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, wantY, 6, step)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, wantZ, 6, step)
    look.current.set(t.position.x, 0.9, t.position.z)
    camera.lookAt(look.current)
  })
  return null
}
