import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { useLang, UI } from './i18n'

const chapters = [UI.problem, UI.contribution, UI.result]
const fields = ['problem', 'contribution', 'result']
const beamVector = new THREE.Vector3(2.4, 1.43, -0.9)
const beamRotation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), beamVector.clone().normalize())

function round(ctx, x, y, w, h, r, color) {
  ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill()
}
function lines(ctx, value, x, y, width, step, max = 6) {
  let line = '', count = 0
  for (const word of value.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width > width && line) {
      ctx.fillText(line, x, y + count++ * step)
      if (count >= max) return
      line = word
    } else line = next
  }
  if (line) ctx.fillText(line, x, y + count * step)
}
function illustration(ctx, project, image, t) {
  round(ctx, 56, 158, 618, 478, 28, '#e4edf0')
  ctx.save(); ctx.beginPath(); ctx.roundRect(56, 158, 618, 478, 28); ctx.clip()
  if (project.tags.includes('Three.js')) {
    // Crop out the existing cover's obsolete identity footer.
    ctx.drawImage(image, 0, 0, image.width, image.height * 0.64, 56, 158, 618, 478)
  } else {
    round(ctx, 82, 182, 566, 400, 18, '#fff')
    round(ctx, 82, 182, 112, 400, 18, '#263d4c')
    ctx.fillStyle = '#ffe5a6'; ctx.font = '700 21px system-ui'; ctx.fillText('TH', 111, 229)
    for (let i = 0; i < 4; i++) round(ctx, 101, 274 + i * 51, 70, 7, 3, i ? '#779299' : '#ecc88b')
    ctx.fillStyle = '#263d4c'; ctx.font = '700 25px system-ui'; ctx.fillText('Ticket Hub', 216, 231)
    round(ctx, 215, 253, 260, 23, 7, '#edf2f3')
    const labels = [t({ vi: 'Tiếp nhận yêu cầu', en: 'New request' }), t({ vi: 'Phân công xử lý', en: 'Assignment' }), t({ vi: 'Trao đổi & đính kèm', en: 'Conversation & files' })]
    labels.forEach((label, i) => {
      round(ctx, 214, 294 + i * 75, 410, 62, 10, '#f0f5f5')
      round(ctx, 230, 309 + i * 75, 30, 30, 9, ['#d9a76a', '#7dac9a', '#899dbc'][i])
      ctx.fillStyle = '#354e5a'; ctx.font = '600 19px system-ui'; ctx.fillText(label, 274, 334 + i * 75)
    })
    round(ctx, 520, 198, 108, 33, 8, '#edf2e9')
    ctx.fillStyle = '#49635e'; ctx.font = '600 17px system-ui'; ctx.fillText(t({ vi: 'Minh họa', en: 'Illustration' }), 532, 220)
  }
  ctx.restore()
  project.tags.slice(0, 3).forEach((tag, i) => {
    const x = 79 + i * 186, y = 590 + (i === 1 ? -15 : 0)
    ctx.shadowColor = '#263d4c22'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6
    round(ctx, x, y, 173, 65, 14, '#fffaf0')
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0
    ctx.fillStyle = '#516664'; ctx.font = '700 20px system-ui'; ctx.fillText(tag, x + 15, y + 40, 145)
  })
  ctx.fillStyle = '#84918a'; ctx.font = '18px system-ui'
  ctx.fillText(t(project.tags.includes('Remix') ? { vi: 'Minh họa luồng xử lý · không phải ảnh sản phẩm', en: 'Workflow illustration · not a product screenshot' } : { vi: 'Thế giới portfolio tương tác', en: 'Interactive portfolio world' }), 68, 700)
}
function projection(project, index, total, detail, chapter, t, image) {
  const canvas = document.createElement('canvas')
  canvas.width = 1440; canvas.height = 864
  const ctx = canvas.getContext('2d')
  round(ctx, 0, 0, 1440, 864, 38, '#fffaf0')
  const wash = ctx.createLinearGradient(0, 0, 1440, 864)
  wash.addColorStop(0, '#f9eedb'); wash.addColorStop(1, '#edf5f3')
  round(ctx, 12, 12, 1416, 840, 30, wash)
  ctx.fillStyle = '#967d51'; ctx.font = '600 18px system-ui'
  ctx.fillText(t(detail ? { vi: 'DỰ ÁN / CÂU CHUYỆN', en: 'PROJECT / STORY' } : { vi: 'DỰ ÁN TIÊU BIỂU', en: 'SELECTED WORK' }), 60, 55)
  ctx.fillStyle = '#253f47'; ctx.font = '700 36px system-ui'; ctx.fillText(t(project.title), 60, 108)
  ctx.textAlign = 'right'; ctx.fillStyle = '#927d58'; ctx.font = '600 24px system-ui'
  ctx.fillText(detail ? `${String(chapter + 1).padStart(2, '0')} / 03` : `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`, 1380, 98)
  ctx.textAlign = 'left'
  ctx.strokeStyle = '#d9ded3'; ctx.beginPath(); ctx.moveTo(60, 131); ctx.lineTo(1380, 131); ctx.stroke()
  illustration(ctx, project, image, t)
  ctx.fillStyle = '#253f47'; ctx.font = '700 42px system-ui'
  lines(ctx, detail ? t(chapters[chapter]) : t(project.role), 730, 205, 640, 51, 2)
  if (detail && chapter === 1 && project.contributionCards) {
    project.contributionCards.forEach((card, i) => {
      const y = 250 + i * 203
      round(ctx, 726, y, 650, 184, 20, '#ffffffc9')
      round(ctx, 748, y + 24, 5, 130, 2, i ? '#8caba0' : '#c7a572')
      ctx.fillStyle = '#314a51'; ctx.font = '700 27px system-ui'; ctx.fillText(t(card.title), 776, y + 48, 570)
      ctx.fillStyle = '#52676c'; ctx.font = '24px system-ui'; lines(ctx, t(card.body), 776, y + 88, 560, 36, 3)
    })
  } else {
    ctx.fillStyle = '#52676c'; ctx.font = '31px system-ui'
    lines(ctx, t(detail ? project.projection?.[chapter] || project[fields[chapter]] : project.summary), 734, detail ? 288 : 330, 627, 47, 7)
  }
  if (detail) {
    chapters.forEach((label, i) => {
      round(ctx, 734 + i * 216, 716, 198, 6, 3, i === chapter ? '#ba945c' : '#d4dfd9')
      ctx.fillStyle = i === chapter ? '#725b38' : '#6e8586'; ctx.font = '600 20px system-ui'; ctx.fillText(t(label), 734 + i * 216, 756, 198)
    })
  } else {
    round(ctx, 734, 709, 627, 57, 14, '#e1eae3')
    ctx.fillStyle = '#49635e'; ctx.font = '600 23px system-ui'; ctx.fillText(t(UI.viewProject), 757, 746)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4
  return texture
}
function roundedScreen() {
  const shape = new THREE.Shape(), w = 6.6, h = 3.96, r = 0.18
  shape.moveTo(-w / 2 + r, -h / 2)
  shape.lineTo(w / 2 - r, -h / 2); shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r)
  shape.lineTo(w / 2, h / 2 - r); shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2)
  shape.lineTo(-w / 2 + r, h / 2); shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r)
  shape.lineTo(-w / 2, -h / 2 + r); shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2)
  const geometry = new THREE.ShapeGeometry(shape), positions = geometry.attributes.position, uv = geometry.attributes.uv
  for (let i = 0; i < uv.count; i++) uv.setXY(i, positions.getX(i) / w + 0.5, positions.getY(i) / h + 0.5)
  return geometry
}
export default function Projector({ project, index, total, detail, chapter, onOpen }) {
  const { t } = useLang()
  const screen = useRef(), surface = useRef(), lamp = useRef(), reels = useRef([]), reveal = useRef(1)
  const reducedMotion = useMemo(() => matchMedia('(prefers-reduced-motion: reduce)').matches, [])
  const cover = useLoader(THREE.TextureLoader, '/og.jpg')
  const geometry = useMemo(roundedScreen, [])
  const texture = useMemo(() => projection(project, index, total, detail, chapter, t, cover.image), [project, index, total, detail, chapter, t, cover])
  useLayoutEffect(() => { reveal.current = reducedMotion ? 1 : 0; return () => texture.dispose() }, [texture, reducedMotion])
  useLayoutEffect(() => () => geometry.dispose(), [geometry])
  useFrame((state, delta) => {
    const step = Math.min(delta, 0.05)
    reveal.current = Math.min(1, reveal.current + step / 0.45)
    if (surface.current) surface.current.color.setScalar(0.8 + 0.2 * (1 - (1 - reveal.current) ** 3))
    if (screen.current) {
      const scale = detail ? 1.08 : 1
      screen.current.scale.setScalar(reducedMotion ? scale : THREE.MathUtils.damp(screen.current.scale.x, scale, 6, step))
    }
    if (!reducedMotion) {
      reels.current.forEach((reel, i) => { if (reel) reel.rotation.z += step * (i ? -0.3 : 0.22) })
      if (lamp.current) lamp.current.intensity = 1.8 + Math.sin(state.clock.elapsedTime * 1.8) * 0.06
    }
  })
  return <group position={[10, 0.8, 10]} rotation={[0, Math.PI / 4, 0]}>
    {/* A single pavilion frames the projector instead of stacking a screen over the old easels. */}
    <mesh position={[0, 0.08, 3]} scale={[1, 1, 0.7]} receiveShadow><cylinderGeometry args={[5, 5.05, 0.16, 16]} /><meshStandardMaterial color="#b8ad93" roughness={0.9} /></mesh>
    {[-4.4, 4.4].flatMap(x => [1.1, 4.5].map(z => <group key={`${x}-${z}`} position={[x, 0, z]}>
      <mesh position={[0, 2.76, 0]} castShadow><boxGeometry args={[0.13, 5.4, 0.13]} /><meshStandardMaterial color="#68533c" /></mesh>
      <mesh position={[0, 0.22, 0]} castShadow><boxGeometry args={[0.35, 0.3, 0.35]} /><meshStandardMaterial color="#d3c6a9" /></mesh>
    </group>))}
    {Array.from({ length: 11 }, (_, i) => <group key={i} position={[-4.15 + i * 0.83, 5.6, 2.8]} rotation={[0.18, 0, 0]}>
      <mesh castShadow><boxGeometry args={[0.83, 0.065, 3.65]} /><meshStandardMaterial color={i % 2 ? '#c39765' : '#fff0d0'} roughness={0.85} /></mesh>
      <mesh position={[0, -0.1, 1.81]} castShadow><boxGeometry args={[0.83, 0.23, 0.06]} /><meshStandardMaterial color={i % 2 ? '#c39765' : '#fff0d0'} /></mesh>
    </group>)}
    {[1.03, 4.56].map(z => <mesh key={z} position={[0, z < 2 ? 5.78 : 5.25, z]} castShadow><boxGeometry args={[9.1, 0.14, 0.12]} /><meshStandardMaterial color="#68533c" /></mesh>)}
    <group ref={screen} position={[0.65, 2.9, 3.15]}>
      <mesh geometry={geometry} scale={[1.055, 1.085, 1]} position={[0, 0, -0.04]}><meshBasicMaterial color="#ffe4ab" transparent opacity={0.12} depthWrite={false} toneMapped={false} /></mesh>
      <mesh geometry={geometry} scale={[1.025, 1.04, 1]} position={[0, 0, -0.02]}><meshBasicMaterial color="#ebd2a1" toneMapped={false} /></mesh>
      <mesh geometry={geometry} position={[0, 0, 0.01]} onClick={e => { e.stopPropagation(); onOpen() }}><meshBasicMaterial ref={surface} map={texture} toneMapped={false} /></mesh>
      {[-2.7, 2.7].map(x => <mesh key={x} position={[x, -2.36, -0.08]} castShadow><cylinderGeometry args={[0.035, 0.045, 0.8, 8]} /><meshStandardMaterial color="#b99b65" metalness={0.55} roughness={0.4} /></mesh>)}
    </group>
    <group position={[-3.7, 0, 4.05]}>
      <mesh position={[0, 0.42, 0]} castShadow><boxGeometry args={[1.4, 0.84, 1.2]} /><meshStandardMaterial color="#9b7347" roughness={0.8} /></mesh>
      {[-0.42, 0.42].map(x => <mesh key={x} position={[x, 0.42, 0.61]} castShadow><boxGeometry args={[0.08, 0.76, 0.035]} /><meshStandardMaterial color="#664b32" /></mesh>)}
      <mesh position={[0, 1.28, 0]} castShadow><boxGeometry args={[1.16, 0.84, 0.72]} /><meshStandardMaterial color="#35474a" metalness={0.45} roughness={0.38} /></mesh>
      <mesh position={[0, 1.28, 0.375]} castShadow><boxGeometry args={[1.05, 0.73, 0.055]} /><meshStandardMaterial color="#bc965b" metalness={0.5} roughness={0.4} /></mesh>
      {Array.from({ length: 6 }, (_, i) => <mesh key={i} position={[-0.36 + i * 0.12, 1.25, 0.414]}><boxGeometry args={[0.04, 0.26, 0.018]} /><meshStandardMaterial color="#35474a" /></mesh>)}
      {[-0.44, 0.44].flatMap(x => [1, 1.56].map(y => <mesh key={`${x}-${y}`} position={[x, y, 0.417]}><sphereGeometry args={[0.028, 8, 6]} /><meshStandardMaterial color="#ead3a1" metalness={0.7} roughness={0.3} /></mesh>))}
      <mesh position={[0.67, 1.37, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow><cylinderGeometry args={[0.19, 0.25, 0.48, 16]} /><meshStandardMaterial color="#b68d50" metalness={0.6} roughness={0.35} /></mesh>
      <mesh position={[0.92, 1.37, 0]} rotation={[0, 0, -Math.PI / 2]}><cylinderGeometry args={[0.145, 0.145, 0.015, 24]} /><meshBasicMaterial color="#fff0b0" toneMapped={false} /></mesh>
      {[[-0.42, 2.08, 0.48], [0.47, 1.95, 0.38]].map(([x, y, radius], i) => <group key={i} ref={el => { reels.current[i] = el }} position={[x, y, 0.15]}>
        <mesh castShadow><torusGeometry args={[radius, 0.057, 8, 24]} /><meshStandardMaterial color="#bf9a60" metalness={0.6} roughness={0.36} /></mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.09, 0.09, 0.11, 12]} /><meshStandardMaterial color="#bf9a60" metalness={0.6} roughness={0.36} /></mesh>
        {[0, 1, 2].map(spoke => <mesh key={spoke} rotation={[0, 0, spoke * Math.PI / 3]} castShadow><boxGeometry args={[radius * 1.85, 0.045, 0.06]} /><meshStandardMaterial color="#bf9a60" metalness={0.6} roughness={0.36} /></mesh>)}
      </group>)}
    </group>
    <mesh position={[-1.58, 2.085, 3.6]} quaternion={beamRotation}>
      <cylinderGeometry args={[0.8, 0.09, beamVector.length(), 24, 1, true]} />
      <shaderMaterial transparent depthWrite={false} side={THREE.DoubleSide}
        vertexShader={'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}'}
        fragmentShader={'varying vec2 vUv; void main(){gl_FragColor=vec4(1.0,0.88,0.64,0.035*(1.0-vUv.y));}'} />
    </mesh>
    <pointLight ref={lamp} position={[-2.8, 1.4, 4]} color="#ffe1a1" intensity={1.8} distance={5} />
    <mesh position={[0.65, 0.29, 4.5]} castShadow><boxGeometry args={[3.5, 0.48, 0.85]} /><meshStandardMaterial color="#987044" roughness={0.65} /></mesh>
    {[-0.65, 1.95].map(x => <mesh key={x} position={[x, 0.55, 4.52]}><cylinderGeometry args={[0.18, 0.2, 0.07, 24]} /><meshStandardMaterial color="#d5b47e" metalness={0.5} roughness={0.4} /></mesh>)}
  </group>
}
