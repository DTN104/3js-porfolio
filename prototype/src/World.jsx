import { useRef, useMemo, useLayoutEffect } from 'react'
import { useFrame, useThree, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
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

/* ---------------------------------------------------------------- bầu trời AST-14 */
// Panorama 360° equirectangular render từ Blender (specs/.../assets-3d/sky/build_sky.py): gradient
// #DCEEF6 -> #6FA8CF, mây AST-21 ở tầm giữa, quầng nắng 30° — không có mặt đất, nhìn xuống vẫn là trời.
export function Sky() {
  const tex = useLoader(THREE.TextureLoader, '/models/sky/AST14_sky.jpg')
  useMemo(() => { tex.colorSpace = THREE.SRGBColorSpace }, [tex])
  return (
    <mesh scale={[-1, 1, 1]} rotation={[0, Math.PI, 0]}>
      <sphereGeometry args={[220, 32, 24]} />
      <meshBasicMaterial map={tex} side={THREE.BackSide} depthWrite={false} fog={false} />
    </mesh>
  )
}

/* ----------------------------------------------------------------- mây AST-21 */
// 4 biến thể dựng bằng specs/.../assets-3d/clouds/build_clouds.py: khối đặc, đáy phẳng, KHÔNG trong suốt
// (nghiệm thu 4.21 #1). Mỗi biến thể một InstancedMesh, trôi chậm bằng cách cập nhật ma trận từng khung.
const CLOUD_NAMES = ['AST21_Cloud_A', 'AST21_Cloud_B', 'AST21_Cloud_C', 'AST21_Cloud_D']

export function Clouds() {
  const kit = useKit('/models/clouds/AST21.glb')
  const refs = useRef([])
  const puffs = useMemo(() => {
    const r = rng(90210)
    const out = CLOUD_NAMES.map(() => [])
    const put = (p, drift) => out[Math.floor(r() * CLOUD_NAMES.length)].push({ p, rotY: r() * Math.PI * 2, drift, phase: r() * Math.PI * 2, scale: 0.8 + r() * 0.5 })
    // biển mây dưới các đảo
    for (let i = 0; i < 46; i++) {
      const ang = r() * Math.PI * 2, rad = 22 + r() * 78
      put([Math.cos(ang) * rad + 7, -9 - r() * 26, Math.sin(ang) * rad + 4], 0.12 + r() * 0.25)
    }
    // vài đám ngang tầm đảo, xa hơn, cho có lớp
    for (let i = 0; i < 10; i++) {
      const ang = r() * Math.PI * 2, rad = 48 + r() * 44
      put([Math.cos(ang) * rad + 7, 4 + r() * 12, Math.sin(ang) * rad + 4], 0.08 + r() * 0.18)
    }
    return out
  }, [])

  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), q: new THREE.Quaternion(), p: new THREE.Vector3(), s: new THREE.Vector3(), up: new THREE.Vector3(0, 1, 0) }), [])
  useFrame((state) => {
    const t = state.clock.elapsedTime
    puffs.forEach((list, k) => {
      const mesh = refs.current[k]
      if (!mesh) return
      list.forEach((c, i) => {
        tmp.p.set(c.p[0] + Math.sin(t * c.drift * 0.25 + c.phase) * 3.5, c.p[1] + Math.sin(t * c.drift * 0.5 + c.phase) * 0.5, c.p[2])
        tmp.q.setFromAxisAngle(tmp.up, c.rotY)
        tmp.s.setScalar(c.scale)
        tmp.m.compose(tmp.p, tmp.q, tmp.s)
        mesh.setMatrixAt(i, tmp.m)
      })
      mesh.instanceMatrix.needsUpdate = true
    })
  })

  return CLOUD_NAMES.map((name, k) => {
    const part = kit[name]
    if (!part || !puffs[k].length) return null
    return (
      <instancedMesh key={name} ref={(el) => { refs.current[k] = el }}
                     args={[part.geometry, part.material, puffs[k].length]} frustumCulled={false} renderOrder={-1} />
    )
  })
}

/* --------------------------------------------------------------- một hòn đảo */

// AST-06…AST-10 — vật thể tương tác, model dựng bằng specs/.../assets-3d/zones/build_zones.py.
// Mỗi .glb có mesh chính + các node RIÊNG cho mặt phẳng trống (Signboard, Panel_*, Easel_*, Plaque,
// Arrow_*, StoneFace, Board): nội dung áp bằng texture vào đúng node, không dựng lại model (BO-05, FR-059).
const ZONE_FILE = { house: 'AST06', workshop: 'AST07', gallery: 'AST08', monument: 'AST09', mailbox: 'AST10' }

function ZoneObject({ island }) {
  const gltf = useLoader(GLTFLoader, `/models/zones/${ZONE_FILE[island.kind] || 'AST10'}.glb`)
  const scene = useMemo(() => {
    const s = gltf.scene.clone(true)
    s.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true } })
    return s
  }, [gltf])
  return <primitive object={scene} />
}

/* --------------------------------------------------------------- kit model dựng bằng Blender */
// Một .glb chứa nhiều prop; trả về map tên node -> { geometry, material, r }.
// r = bán kính chiếm chỗ trên mặt đất (m), đo từ bounding box của geometry — dùng để rải không đè nhau.
// useLoader cache theo url, gọi nhiều nơi không nạp lại. Nguồn: specs/.../assets-3d/{props,rim}/build_*.py
function useKit(url) {
  const gltf = useLoader(GLTFLoader, url)
  return useMemo(() => {
    const kit = {}
    gltf.scene.traverse((o) => {
      if (!o.isMesh) return
      o.geometry.computeBoundingBox()
      const b = o.geometry.boundingBox
      kit[o.name] = { geometry: o.geometry, material: o.material, r: Math.max(b.max.x - b.min.x, b.max.z - b.min.z) / 2 }
    })
    return kit
  }, [gltf])
}

// Một InstancedMesh cho mỗi loại prop trên TOÀN thế giới: 5 đảo x ~30 prop = ~150 mesh -> ~20 draw call.
function Instanced({ part, list }) {
  const ref = useRef()
  useLayoutEffect(() => {
    const m = ref.current
    if (!m) return
    const mat = new THREE.Matrix4(), q = new THREE.Quaternion(), pos = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1)
    const up = new THREE.Vector3(0, 1, 0)
    list.forEach((it, i) => {
      q.setFromAxisAngle(up, it.rotY)
      pos.set(it.x, it.y, it.z)
      mat.compose(pos, q, one)
      m.setMatrixAt(i, mat)
    })
    m.instanceMatrix.needsUpdate = true
    m.computeBoundingSphere()
  }, [list])
  return (
    <instancedMesh ref={ref} args={[part.geometry, part.material, list.length]} castShadow receiveShadow />
  )
}

// AST-13a/b — tên node trong kit
const KIT_TREES = ['AST13a_Conifer_S', 'AST13a_Conifer_M', 'AST13a_Conifer_L', 'AST13a_Bush_S', 'AST13a_Bush_M', 'AST13a_Shrub_Flower']
const KIT_ROCKS = ['AST13b_Boulder_XS', 'AST13b_Boulder_S', 'AST13b_Boulder_M']
const KIT_TUFTS = ['AST13b_GrassTuft_S', 'AST13b_GrassTuft_M', 'AST13b_GrassTuft_L', 'AST13b_CloverPatch', 'AST13b_Pebbles_A']

// AST-04 — đi dọc VIỀN BẦU DỤC của đảo theo chiều dài cung, mỗi ~3 m một mảnh, chia đều để khép kín.
// Đảo không tròn (AST-03a là 18 x 16,14 m) nên không xếp theo bán kính cố định được — OQ-27.
// halfX, halfZ = nửa trục mặt cỏ, đọc từ bounding box của model đảo.
function rimSlots(halfX, halfZ, inset = 0.85, seglen = 3.0, samples = 1200) {
  const A = halfX - inset, B = halfZ - inset
  const pts = []
  for (let i = 0; i <= samples; i++) { const t = 2 * Math.PI * i / samples; pts.push([A * Math.sin(t), B * Math.cos(t)]) }
  const cum = [0]
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]))
  const total = cum[cum.length - 1]
  const n = Math.max(3, Math.round(total / seglen))
  const step = total / n
  const out = []
  let j = 0
  for (let k = 0; k < n; k++) {
    const sLen = k * step
    while (j < samples && cum[j + 1] < sLen) j++
    const [x, z] = pts[j]
    let nx = x / (A * A), nz = z / (B * B)
    const L = Math.hypot(nx, nz); nx /= L; nz /= L
    // mặt "ngoài" của mảnh là local -Z (Blender +Y). Quay quanh Y sao cho -Z trùng pháp tuyến hướng ra.
    out.push({ x, z, rotY: Math.atan2(-nx, -nz) })
  }
  return out
}

const RIM_ORDER = ['AST04b_Kerb', 'AST04b_Kerb', 'AST04a_Fence', 'AST04a_Fence', 'AST04c_Boulders',
                   'AST04b_Kerb', 'AST04a_Fence', 'AST04d_MarkerPost', 'AST04b_Kerb', 'AST04c_Boulders']

// Hướng (đơn vị) từ tâm đảo tới từng đầu cầu đấu vào đảo đó — chừa lối đi cho viền mép và prop.
function bridgeDirs(island, idx) {
  const dirs = []
  for (const br of bridges) {
    const pt = br.a === idx ? br.from : br.b === idx ? br.to : null
    if (!pt) continue
    const dx = pt[0] - island.pos[0], dz = pt[1] - island.pos[1]
    const L = Math.hypot(dx, dz)
    dirs.push([dx / L, dz / L])
  }
  return dirs
}
const onPath = (x, z, dirs, half) => dirs.some(([ux, uz]) => (x * ux + z * uz) > 0 && Math.abs(x * uz - z * ux) < half)

// Rải prop trong BẦU DỤC mặt cỏ (không phải hình tròn r), tránh vật thể tương tác ở tâm, tránh lối lên cầu,
// và không đè lên nhau (khoảng cách tâm >= tổng bán kính chiếm chỗ + 0,25 m). Rải to trước, nhỏ sau.
function scatterIsland(island, halfX, halfZ, kitA, kitB, dirs) {
  const rand = rng(island.id.length * 7919 + Math.round(island.pos[0] * 31 + island.pos[1] * 17))
  const pick = (arr) => arr[Math.floor(rand() * arr.length)]
  const placed = []
  const put = (name, kit, tries = 40) => {
    const part = kit[name]; if (!part) return
    const r = part.r
    const A = halfX - 1.4 - r, B = halfZ - 1.4 - r        // lùi khỏi viền AST-04
    for (let t = 0; t < tries; t++) {
      const x = (rand() * 2 - 1) * A, z = (rand() * 2 - 1) * B
      if ((x * x) / (A * A) + (z * z) / (B * B) > 1) continue
      if (Math.hypot(x, z) < island.or + r + 0.7) continue  // vật thể tương tác + vòng chỉ dấu
      if (onPath(x, z, dirs, 2.0 + r)) continue
      if (placed.some(p => Math.hypot(p.x - x, p.z - z) < p.r + r + 0.25)) continue
      placed.push({ name, x, z, r, rotY: rand() * Math.PI * 2 })
      return
    }
  }
  const nTrees = 4 + Math.floor(rand() * 3)
  const trees = []; for (let i = 0; i < nTrees; i++) trees.push(pick(KIT_TREES))
  trees.sort((a, b) => kitA[b].r - kitA[a].r).forEach(n => put(n, kitA))
  for (let i = 0; i < 5; i++) put(pick(KIT_ROCKS), kitB)
  for (let i = 0; i < 7; i++) put(pick(KIT_TUFTS), kitB)
  return placed
}

// Toàn bộ prop + viền mép của 5 đảo, gom theo loại thành InstancedMesh (một draw call mỗi loại).
export function Scenery() {
  const kitA = useKit('/models/props/AST13a.glb')
  const kitB = useKit('/models/props/AST13b.glb')
  const kitRim = useKit('/models/rim/AST04.glb')
  const gltfs = useLoader(GLTFLoader, islands.map(i => i.model))

  const groups = useMemo(() => {
    const by = {}
    const add = (kit, name, x, y, z, rotY) => {
      if (!kit[name]) return
      ;(by[name] ||= { part: kit[name], list: [] }).list.push({ x, y, z, rotY })
    }
    islands.forEach((island, idx) => {
      const box = new THREE.Box3().setFromObject(gltfs[idx].scene)
      const halfX = (box.max.x - box.min.x) / 2, halfZ = (box.max.z - box.min.z) / 2
      const [ox, oz] = island.pos
      const dirs = bridgeDirs(island, idx)
      // AST-04 viền mép — chừa khe chỗ cầu (FR-015)
      rimSlots(halfX, halfZ).filter(sl => !onPath(sl.x, sl.z, dirs, 2.4))
        .forEach((sl, i) => add(kitRim, RIM_ORDER[i % RIM_ORDER.length], ox + sl.x, island.y, oz + sl.z, sl.rotY))
      // AST-13 prop trang trí
      scatterIsland(island, halfX, halfZ, kitA, kitB, dirs)
        .forEach(p => add(p.name.startsWith('AST13a') ? kitA : kitB, p.name, ox + p.x, island.y, oz + p.z, p.rotY))
    })
    return by
  }, [gltfs, kitA, kitB, kitRim])

  return Object.entries(groups).map(([name, g]) => <Instanced key={name} part={g.part} list={g.list} />)
}

/* --------------------------------------------------------------- AST-03 model đảo */
// Model dựng bằng Blender qua specs/001-3d-world-portfolio/assets-3d/islands/build_islands.py.
// Gốc toạ độ model: mặt cỏ tại y = 0, thân đảo chìm xuống âm (OQ-22), nên đặt thẳng tại island.y là khớp.
// Mỗi model 1 material + 1 atlas 1024 => 1 draw call.
function IslandModel({ url }) {
  const gltf = useLoader(GLTFLoader, url)
  const scene = useMemo(() => {
    const s = gltf.scene.clone(true)
    // Chỉ nhận bóng, KHÔNG đổ bóng: đảo liền khối vừa cast vừa receive thì tự đổ bóng lên chính nó
    // -> shadow acne kín mặt cỏ. Cây và vật thể vẫn đổ bóng xuống đảo bình thường.
    s.traverse((o) => {
      if (o.isMesh) { o.castShadow = false; o.receiveShadow = true }
    })
    return s
  }, [gltf])
  return <primitive object={scene} />
}

export function Island({ island, active, onOpen }) {
  const ring = useRef()
  const [x, z] = island.pos

  useFrame((state) => {
    if (ring.current) {
      const t = state.clock.elapsedTime
      ring.current.scale.setScalar(active ? 1 + Math.sin(t * 3) * 0.05 : 1)
      ring.current.material.opacity = active ? 0.9 : 0.16
    }
  })

  return (
    <group position={[x, island.y, z]}>
      <IslandModel url={island.model} />
      {/* FR-017: chỉ dấu vùng tương tác */}
      <group onClick={(e) => { e.stopPropagation(); onOpen(island.id) }}>
        <mesh ref={ring} position={[0, 0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
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
  // AST-12 — mỗi cầu một model dựng parametric đúng chiều dài + chênh cao từ content.js
  // (specs/.../assets-3d/bridges/build_bridge.py). Gốc model = đầu cầu, mặt ván tại y=0,
  // trục dọc cầu = +Z => đặt tại from, quay theo yaw là khớp. Độ võng khớp bridgeY() trong content.js.
  const gltf = useLoader(GLTFLoader, `/models/bridges/${bridge.id}.glb`)
  const scene = useMemo(() => {
    const s = gltf.scene.clone(true)
    s.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true } })
    return s
  }, [gltf])
  const [ax, az] = bridge.from
  const [bx, bz] = bridge.to
  const yaw = Math.atan2(bx - ax, bz - az)
  return <primitive object={scene} position={[ax, bridge.fromY, az]} rotation={[0, yaw, 0]} />
}

/* --------------------------------------------------------------- nhân vật */

export function Avatar({ bodyRef }) {
  const legPhase = useRef(0)
  const dir = useRef(0)
  const surfY = useRef(SPAWN[1])

  // AST-01 + AST-02: model có xương, 3 clip Idle / Walk / Run — dựng bằng
  // specs/.../assets-3d/character/build_character.py. Model nhìn về +Z, khớp rotation.y = atan2(mx, mz).
  const gltf = useLoader(GLTFLoader, '/models/character/AST01.glb')
  const mixer = useMemo(() => new THREE.AnimationMixer(gltf.scene), [gltf])
  const actions = useMemo(() => {
    const m = {}
    for (const clip of gltf.animations) m[clip.name] = mixer.clipAction(clip)
    // tốc độ phát: clip Walk 1 s/chu kỳ, Run 0,67 s — nhân lên cho hợp 4,6 / 9,2 m/s của prototype
    // (asset-prompts 4.2 đã ghi: tốc độ prototype cao hơn clip chuẩn, cần chốt — xem "Đề xuất thay đổi")
    if (m.Walk) m.Walk.timeScale = 1.7
    if (m.Run) m.Run.timeScale = 1.6
    return m
  }, [gltf, mixer])
  const clipNow = useRef(null)
  useMemo(() => {
    gltf.scene.traverse((o) => {
      if (o.isMesh) { o.castShadow = true; o.frustumCulled = false }   // skinned mesh: bbox không theo dáng
    })
  }, [gltf])

  useFrame((_, dt) => {
    const g = bodyRef.current
    if (!g) return
    const step = Math.min(dt, 0.05)

    // bàn phím + cần cảm ứng gộp trong input.move(); độ dài vector ≤ 1, cần đẩy nhẹ thì đi chậm
    const mv = input.move()
    let mx = FWD.x * mv.y + RGT.x * mv.x, mz = FWD.z * mv.y + RGT.z * mv.x

    const len = Math.hypot(mx, mz)
    const moving = len > 0.001
    const speed = (input.running ? RUN : WALK) * Math.min(1, len)
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
    // FR-009: dáng do clip lo, code không nhấp nhô / nghiêng nữa
    g.position.y = THREE.MathUtils.damp(g.position.y, surfY.current, 14, step)
    g.rotation.z = 0

    const want = moving ? (input.running ? 'Run' : 'Walk') : 'Idle'
    if (clipNow.current !== want) {
      const next = actions[want]
      const prev = clipNow.current ? actions[clipNow.current] : null
      if (next) next.reset().fadeIn(0.15).play()
      if (prev) prev.fadeOut(0.15)
      clipNow.current = want
    }
    mixer.update(step)
  })

  return (
    <group ref={bodyRef} position={SPAWN}>
      <primitive object={gltf.scene} />
    </group>
  )
}

/* --------------------------------------------------------------- camera */

// focusRef: null = bám nhân vật; { x, y, z, dist, dx, dy } = bay tới nhìn cận vật thể tương tác khi bảng nội dung mở.
// dx dịch điểm nhìn sang phải (chừa chỗ cho bảng bên phải trên desktop), dy dịch xuống (chừa chỗ cho tấm trượt dưới trên điện thoại).
export function CameraRig({ target, zoomRef, focusRef }) {
  const { camera, gl, size } = useThree()
  const look = useRef(new THREE.Vector3())
  const aim = useRef(new THREE.Vector3())

  useFrame((_, dt) => {
    // hook QA cho spike: số draw call / tam giác của khung hình vừa vẽ (OQ-04, OQ-20)
    window.__render = { calls: gl.info.render.calls, triangles: gl.info.render.triangles, geometries: gl.info.memory.geometries, textures: gl.info.memory.textures }
    const t = target.current
    if (!t) return
    const step = Math.min(dt, 0.05)
    const f = focusRef && focusRef.current
    let px, py, pz, rate
    if (f) {
      // Khoảng cách sao cho vật thể (đường chéo mặt bằng ≈ 2,8·or, nhìn xiên) chiếm ~55% bề ngang phần màn còn trống;
      // màn dọc tự lùi xa hơn vì fov ngang hẹp.
      const aspect = size.width / size.height
      const tanH = Math.tan(camera.fov * Math.PI / 360)
      const D = Math.max(8, (f.or * 2.8) / (0.55 * 2 * tanH * Math.min(aspect, 1.2)))
      const k = D / 1.687                                  // hướng camera (1, 0.92, 1) có độ dài 1.687
      px = f.x + k; py = f.y + k * 0.92; pz = f.z + k
      // 'side': bảng che 28% bên phải -> dịch điểm nhìn sang phải để vật thể vào giữa phần trống
      // 'sheet': tấm trượt che 58% dưới -> dịch điểm nhìn xuống để vật thể nằm giữa phần trên
      const dx = f.mode === 'side' ? 0.14 * 2 * D * tanH * aspect : 0
      const dy = f.mode === 'sheet' ? -0.29 * 2 * D * tanH : 0
      aim.current.set(f.x + RGT.x * dx, f.y + 0.5 + f.or * 0.35 + dy, f.z + RGT.z * dx)
      rate = 3.2                                   // bay tới chậm, có cảm giác "điện ảnh"
    } else {
      const z = zoomRef.current
      px = t.position.x + 14 * z; py = t.position.y + 14 * z; pz = t.position.z + 14 * z
      aim.current.set(t.position.x, t.position.y + 0.9, t.position.z)
      rate = 6
    }
    camera.position.x = THREE.MathUtils.damp(camera.position.x, px, rate, step)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, py, rate, step)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, pz, rate, step)
    look.current.x = THREE.MathUtils.damp(look.current.x, aim.current.x, rate, step)
    look.current.y = THREE.MathUtils.damp(look.current.y, aim.current.y, rate, step)
    look.current.z = THREE.MathUtils.damp(look.current.z, aim.current.z, rate, step)
    camera.lookAt(look.current)
  })
  return null
}

export { islands, bridges }
