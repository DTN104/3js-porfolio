import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { input } from './input'
import { islands, bridges, obstacles, surfaceAt, SPAWN } from './content'

const WALK = 4.6
const RUN = 9.2

// Camera cố định góc 45°, nên hướng đi quy chiếu theo camera (FR-010).
const FWD = new THREE.Vector3(-1, 0, -1).normalize()
const RGT = new THREE.Vector3(1, 0, -1).normalize()

// Ngẫu nhiên tất định — cùng một hạt giống luôn cho cùng một bố cục cây cối.
function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

/* ---------------------------------------------------------------- bầu trời */

export function Sky() {
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 4; c.height = 256
    const g = c.getContext('2d')
    const grd = g.createLinearGradient(0, 0, 0, 256)
    grd.addColorStop(0.00, '#4E8CBA')
    grd.addColorStop(0.45, '#6FA8CF')
    grd.addColorStop(0.78, '#B9DAEC')
    grd.addColorStop(1.00, '#DCEEF6')
    g.fillStyle = grd
    g.fillRect(0, 0, 4, 256)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])
  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[220, 24, 24]} />
      <meshBasicMaterial map={tex} side={THREE.BackSide} depthWrite={false} fog={false} />
    </mesh>
  )
}

/* ----------------------------------------------------------------- mây AST-21 */

export function Clouds() {
  const group = useRef()
  const puffs = useMemo(() => {
    const r = rng(90210)
    const out = []
    for (let i = 0; i < 46; i++) {
      const ang = r() * Math.PI * 2
      const rad = 22 + r() * 78
      out.push({
        p: [Math.cos(ang) * rad + 7, -8 - r() * 26, Math.sin(ang) * rad + 4],
        s: [5 + r() * 9, 1.6 + r() * 1.8, 4 + r() * 8],
        drift: 0.12 + r() * 0.25,
        phase: r() * Math.PI * 2
      })
    }
    // vài đám mây cao ngang tầm đảo cho có lớp
    for (let i = 0; i < 10; i++) {
      const ang = r() * Math.PI * 2
      const rad = 44 + r() * 44
      out.push({
        p: [Math.cos(ang) * rad + 7, 4 + r() * 12, Math.sin(ang) * rad + 4],
        s: [6 + r() * 8, 1.5 + r() * 1.4, 5 + r() * 6],
        drift: 0.08 + r() * 0.18,
        phase: r() * Math.PI * 2
      })
    }
    return out
  }, [])

  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.elapsedTime
    group.current.children.forEach((m, i) => {
      const c = puffs[i]
      m.position.x = c.p[0] + Math.sin(t * c.drift * 0.25 + c.phase) * 3.5
      m.position.y = c.p[1] + Math.sin(t * c.drift * 0.5 + c.phase) * 0.5
    })
  })

  return (
    <group ref={group}>
      {puffs.map((c, i) => (
        <mesh key={i} position={c.p} scale={c.s} renderOrder={-1}>
          <sphereGeometry args={[1, 12, 8]} />
          <meshStandardMaterial color="#F6F9FB" transparent opacity={0.86} roughness={1} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

/* --------------------------------------------------------------- một hòn đảo */

function Tree({ p, s }) {
  return (
    <group position={p} scale={s}>
      <mesh position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.11, 0.15, 0.85, 6]} />
        <meshStandardMaterial color="#7A5636" />
      </mesh>
      <mesh position={[0, 1.5, 0]} castShadow>
        <coneGeometry args={[0.82, 1.7, 7]} />
        <meshStandardMaterial color="#43703A" />
      </mesh>
      <mesh position={[0, 2.25, 0]} castShadow>
        <coneGeometry args={[0.58, 1.2, 7]} />
        <meshStandardMaterial color="#5E9448" />
      </mesh>
    </group>
  )
}

function ZoneObject({ island }) {
  const k = island.kind
  if (k === 'house') return (
    <group>
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.8, 1.8, 2.4]} />
        <meshStandardMaterial color="#EDE4D4" />
      </mesh>
      <mesh position={[0, 2.25, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[2.3, 1.3, 4]} />
        <meshStandardMaterial color="#A2563F" />
      </mesh>
      <mesh position={[0, 0.58, 1.22]}>
        <boxGeometry args={[0.75, 1.15, 0.08]} />
        <meshStandardMaterial color="#7A5636" />
      </mesh>
      <mesh position={[-0.85, 1.2, 1.22]}>
        <boxGeometry args={[0.6, 0.6, 0.06]} />
        <meshStandardMaterial color="#B9DAEC" emissive="#6FA8CF" emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
  if (k === 'workshop') return (
    <group>
      <mesh position={[0, 0.95, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.22, 1.5]} />
        <meshStandardMaterial color="#A87A4F" />
      </mesh>
      {[-1.4, 1.4].map((x, i) => (
        <mesh key={i} position={[x, 0.45, 0]} castShadow>
          <boxGeometry args={[0.22, 0.9, 1.3]} />
          <meshStandardMaterial color="#7A5636" />
        </mesh>
      ))}
      {[-0.9, 0, 0.9].map((x, i) => (
        <mesh key={i} position={[x, 1.35, -0.2]} rotation={[0, i * 0.4 - 0.4, 0]} castShadow>
          <boxGeometry args={[0.55, 0.62, 0.08]} />
          <meshStandardMaterial color="#FBFCFD" />
        </mesh>
      ))}
      <mesh position={[0, 2.3, -0.9]} castShadow>
        <boxGeometry args={[3.4, 0.12, 1.4]} />
        <meshStandardMaterial color="#3E7BA8" />
      </mesh>
      {[-1.5, 1.5].map((x, i) => (
        <mesh key={i} position={[x, 1.6, -0.9]}>
          <cylinderGeometry args={[0.08, 0.08, 1.4, 6]} />
          <meshStandardMaterial color="#7A5636" />
        </mesh>
      ))}
    </group>
  )
  if (k === 'gallery') return (
    <group>
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.6, 2.8, 0.6, 16]} />
        <meshStandardMaterial color="#D5DEE7" />
      </mesh>
      {[-1.5, 0, 1.5].map((x, i) => (
        <group key={i} position={[x, 0, -0.3]}>
          <mesh position={[0, 1.55, 0]} castShadow>
            <boxGeometry args={[1.15, 1.5, 0.12]} />
            <meshStandardMaterial color="#FBFCFD" />
          </mesh>
          <mesh position={[0, 1.55, 0.08]}>
            <boxGeometry args={[0.9, 1.2, 0.02]} />
            <meshStandardMaterial color="#6FA8CF" />
          </mesh>
          <mesh position={[0, 0.75, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 1.0, 6]} />
            <meshStandardMaterial color="#8794A1" />
          </mesh>
        </group>
      ))}
    </group>
  )
  if (k === 'monument') return (
    <group>
      {[0, 1, 2, 3].map((i) => {
        const h = 0.9 + i * 0.55
        const a = (i / 4) * Math.PI * 1.5 - 0.5
        return (
          <mesh key={i} position={[Math.cos(a) * 1.3, h / 2, Math.sin(a) * 1.3]} castShadow>
            <boxGeometry args={[0.65, h, 0.65]} />
            <meshStandardMaterial color={i % 2 ? '#9E8E7C' : '#6E6255'} />
          </mesh>
        )
      })}
      <mesh position={[0, 1.9, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 3.8, 8]} />
        <meshStandardMaterial color="#7A5636" />
      </mesh>
      <mesh position={[0.75, 3.4, 0]}>
        <boxGeometry args={[1.4, 0.85, 0.06]} />
        <meshStandardMaterial color="#E08B45" />
      </mesh>
    </group>
  )
  return (
    <group>
      <mesh position={[0, 0.65, 0]} castShadow>
        <cylinderGeometry args={[0.11, 0.11, 1.3, 8]} />
        <meshStandardMaterial color="#7A5636" />
      </mesh>
      <mesh position={[0, 1.45, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[0.36, 0.6, 4, 12]} />
        <meshStandardMaterial color="#E08B45" />
      </mesh>
      <mesh position={[0.4, 1.62, 0]}>
        <boxGeometry args={[0.06, 0.38, 0.22]} />
        <meshStandardMaterial color="#C2334D" />
      </mesh>
      <mesh position={[-1.15, 1.0, 0]} rotation={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[1.3, 0.95, 0.08]} />
        <meshStandardMaterial color="#FBFCFD" />
      </mesh>
    </group>
  )
}

export function Island({ island, active, onOpen }) {
  const ring = useRef()
  const [x, z] = island.pos
  const r = island.r

  const props = useMemo(() => {
    const rand = rng(island.id.length * 7919 + Math.round(x * 31 + z * 17))
    const trees = []
    const rocks = []
    const n = 4 + Math.floor(rand() * 3)
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2
      const d = island.or + 1.6 + rand() * (r - island.or - 3.0)
      trees.push({ p: [Math.cos(a) * d, 0, Math.sin(a) * d], s: 0.75 + rand() * 0.5 })
    }
    for (let i = 0; i < 5; i++) {
      const a = rand() * Math.PI * 2
      const d = island.or + 1.2 + rand() * (r - island.or - 2.2)
      rocks.push({ p: [Math.cos(a) * d, 0.12, Math.sin(a) * d], s: 0.25 + rand() * 0.35 })
    }
    return { trees, rocks }
  }, [island, r, x, z])

  useFrame((state) => {
    if (ring.current) {
      const t = state.clock.elapsedTime
      ring.current.scale.setScalar(active ? 1 + Math.sin(t * 3) * 0.05 : 1)
      ring.current.material.opacity = active ? 0.9 : 0.16
    }
  })

  return (
    <group position={[x, island.y, z]}>
      {/* AST-03 mặt cỏ */}
      <mesh position={[0, -0.35, 0]} receiveShadow>
        <cylinderGeometry args={[r, r * 0.97, 0.7, 48]} />
        <meshStandardMaterial color={island.grass} />
      </mesh>
      {/* lớp đất ngay dưới cỏ */}
      <mesh position={[0, -0.95, 0]}>
        <cylinderGeometry args={[r * 0.97, r * 0.86, 0.6, 48]} />
        <meshStandardMaterial color="#6E6255" />
      </mesh>
      {/* AST-03 chân đảo */}
      <mesh position={[0, -1.25 - r * 0.62, 0]} castShadow>
        <coneGeometry args={[r * 0.86, r * 1.24, 12]} />
        <meshStandardMaterial color={island.rock} flatShading />
      </mesh>
      {/* AST-04 viền mép — để mắt đọc được ranh giới, không dùng tường vô hình (FR-015) */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[r - 0.95, r - 0.55, 48]} />
        <meshStandardMaterial color="#6B9A4C" />
      </mesh>

      {props.rocks.map((s, i) => (
        <mesh key={'r' + i} position={s.p} scale={s.s} castShadow>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#9E8E7C" flatShading />
        </mesh>
      ))}
      {props.trees.map((t, i) => <Tree key={'t' + i} p={t.p} s={t.s} />)}

      {/* FR-017: chỉ dấu vùng tương tác */}
      <group onClick={(e) => { e.stopPropagation(); onOpen(island.id) }}>
        <mesh ref={ring} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[island.ir - 0.22, island.ir, 48]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.16} />
        </mesh>
        <ZoneObject island={island} />
      </group>
    </group>
  )
}

/* --------------------------------------------------------------- AST-12 cầu dây */

export function Bridge({ bridge }) {
  const planks = useMemo(() => {
    const n = Math.max(6, Math.round(bridge.len / 0.62))
    const out = []
    for (let i = 0; i < n; i++) out.push((i + 0.5) / n)
    return out
  }, [bridge])

  const [ax, az] = bridge.from
  const [bx, bz] = bridge.to
  const dx = bx - ax, dz = bz - az
  const dy = bridge.toY - bridge.fromY
  const yaw = Math.atan2(dx, dz)

  return (
    <group>
      {planks.map((t, i) => {
        const sag = -Math.sin(t * Math.PI) * 0.42   // võng nhẹ cho ra dáng cầu dây
        return (
          <mesh
            key={i}
            position={[ax + dx * t, bridge.fromY + dy * t - 0.12 + sag, az + dz * t]}
            rotation={[0, yaw, 0]}
            castShadow receiveShadow
          >
            <boxGeometry args={[2.3, 0.1, 0.4]} />
            <meshStandardMaterial color={i % 3 === 0 ? '#7A5636' : '#A87A4F'} />
          </mesh>
        )
      })}
      {[-1.05, 1.05].map((side, s) => (
        <group key={s}>
          {planks.filter((_, i) => i % 2 === 0).map((t, i) => {
            const sag = -Math.sin(t * Math.PI) * 0.42
            return (
              <mesh
                key={i}
                position={[
                  ax + dx * t + Math.cos(yaw) * side,
                  bridge.fromY + dy * t + 0.42 + sag * 0.75,
                  az + dz * t - Math.sin(yaw) * side
                ]}
                rotation={[0, yaw, 0]}
              >
                <boxGeometry args={[0.07, 0.07, 0.72]} />
                <meshStandardMaterial color="#7A5636" />
              </mesh>
            )
          })}
        </group>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------- nhân vật */

export function Avatar({ bodyRef }) {
  const legPhase = useRef(0)
  const dir = useRef(0)
  const surfY = useRef(SPAWN[1])

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
    let blocked = false

    if (moving) {
      mx /= len; mz /= len                       // FR-013: đi chéo không nhanh hơn
      const nx = g.position.x + mx * speed * step
      const nz = g.position.z + mz * speed * step

      // OQ-21 — chặn mềm ở mép: bước nào ra khoảng không thì bỏ, còn thử trượt theo mép
      let s = surfaceAt(nx, nz)
      if (s.ok) {
        g.position.x = nx; g.position.z = nz
      } else {
        const sx = surfaceAt(nx, g.position.z)
        const sz = surfaceAt(g.position.x, nz)
        if (sx.ok)      { g.position.x = nx; s = sx }
        else if (sz.ok) { g.position.z = nz; s = sz }
        else            { s = surfaceAt(g.position.x, g.position.z); blocked = true }
      }
      if (s.ok) surfY.current = s.y

      dir.current = Math.atan2(mx, mz)
      legPhase.current += step * (input.running ? 15 : 9)
    } else {
      legPhase.current += step * 1.6             // FR-009: trạng thái đứng yên
    }

    // FR-012: không đi xuyên vật thể đặc
    for (const o of obstacles) {
      const ox = g.position.x - o.pos[0]
      const oz = g.position.z - o.pos[1]
      const d = Math.hypot(ox, oz)
      const min = o.r + 0.55
      if (d < min && d > 0.0001) {
        g.position.x = o.pos[0] + (ox / d) * min
        g.position.z = o.pos[1] + (oz / d) * min
      }
    }

    const here = surfaceAt(g.position.x, g.position.z)
    if (here.ok) surfY.current = here.y

    // hook QA cho spike
    window.__avatar = {
      x: +g.position.x.toFixed(2), z: +g.position.z.toFixed(2),
      y: +surfY.current.toFixed(2),
      on: here.ok ? here.on : 'khong-khi', where: here.id || null,
      edge: here.ok ? +here.edge.toFixed(2) : null,
      moving, running: input.running, blocked, dt: +step.toFixed(4)
    }

    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, dir.current, 12, step)
    const bob = moving ? Math.sin(legPhase.current) * (input.running ? 0.16 : 0.09) : Math.sin(legPhase.current) * 0.03
    const wantY = surfY.current + Math.abs(bob)
    g.position.y = THREE.MathUtils.damp(g.position.y, wantY, 14, step)
    g.rotation.z = moving && input.running ? 0.08 : 0
  })

  return (
    <group ref={bodyRef} position={SPAWN}>
      <mesh position={[0, 0.62, 0]} castShadow>
        <capsuleGeometry args={[0.34, 0.5, 6, 14]} />
        <meshStandardMaterial color="#E08B45" />
      </mesh>
      <mesh position={[0, 1.42, 0]} castShadow>
        <sphereGeometry args={[0.36, 20, 16]} />
        <meshStandardMaterial color="#E9C9A8" />
      </mesh>
      <mesh position={[0, 1.6, 0.02]}>
        <sphereGeometry args={[0.372, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.42]} />
        <meshStandardMaterial color="#3B3230" />
      </mesh>
      <mesh position={[0, 1.4, 0.34]}>
        <boxGeometry args={[0.42, 0.09, 0.06]} />
        <meshStandardMaterial color="#2B2B2B" />
      </mesh>
    </group>
  )
}

/* --------------------------------------------------------------------- camera */

export function CameraRig({ target, zoomRef }) {
  const { camera } = useThree()
  const look = useRef(new THREE.Vector3())

  useFrame((_, dt) => {
    const t = target.current
    if (!t) return
    const step = Math.min(dt, 0.05)
    const z = zoomRef.current
    camera.position.x = THREE.MathUtils.damp(camera.position.x, t.position.x + 14 * z, 6, step)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, t.position.y + 14 * z, 6, step)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, t.position.z + 14 * z, 6, step)
    look.current.set(t.position.x, t.position.y + 0.9, t.position.z)
    camera.lookAt(look.current)
  })
  return null
}

export { islands, bridges }
