import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useLang, UI } from './i18n'

const chapters = [UI.problem, UI.contribution, UI.result]
const fields = ['problem', 'contribution', 'result']
const short = (value, max) => value.length > max ? value.slice(0, value.lastIndexOf(' ', max)) + '…' : value
const beamVector = new THREE.Vector3(2.1, 1.05, -1.35)
const beamRotation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), beamVector.clone().normalize())

function screenGlow() {
  const canvas = document.createElement('canvas')
  canvas.width = 512; canvas.height = 320
  const ctx = canvas.getContext('2d')
  ctx.shadowColor = '#ffd58a'; ctx.shadowBlur = 28; ctx.fillStyle = '#ffe3a4'
  ctx.fillRect(42, 35, 428, 250)
  ctx.shadowBlur = 0; ctx.globalCompositeOperation = 'destination-out'; ctx.fillRect(43, 36, 426, 248)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function lines(ctx, value, x, y, width, step, max = 6) {
  const words = value.split(/\s+/)
  let line = '', count = 0
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width > width && line) {
      ctx.fillText(line, x, y + count++ * step)
      if (count >= max) return
      line = word
    } else line = next
  }
  if (line) ctx.fillText(line, x, y + count * step)
}

function illustration(ctx, project) {
  ctx.fillStyle = '#fff'; ctx.fillRect(62, 144, 490, 434)
  if (project.tags.includes('Three.js')) {
    ctx.fillStyle = '#bed9ed'; ctx.fillRect(82, 166, 450, 390)
    const points = [[185, 275], [350, 225], [415, 380], [245, 450], [115, 390]]
    ctx.strokeStyle = '#a0693d'; ctx.lineWidth = 12
    ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke()
    points.forEach(([x, y], i) => {
      ctx.fillStyle = '#806a53'; ctx.beginPath(); ctx.ellipse(x, y + 15, 62, 26, 0, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = ['#84b776', '#92bd76', '#7eaa78'][i % 3]
      ctx.beginPath(); ctx.ellipse(x, y, 65, 35, 0, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#4f8c5a'; ctx.beginPath(); ctx.moveTo(x, y - 48); ctx.lineTo(x - 22, y - 8); ctx.lineTo(x + 22, y - 8); ctx.fill()
    })
  } else if (project.tags.includes('Remix')) {
    ctx.fillStyle = '#2a3c5f'; ctx.fillRect(62, 144, 142, 434)
    ctx.fillStyle = '#fff'; ctx.font = '700 30px system-ui'; ctx.fillText('✦', 105, 200)
    ctx.fillStyle = '#8296b2'
    for (let i = 0; i < 4; i++) ctx.fillRect(88, 248 + i * 57, 88, 10)
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = '#dce8f4'; ctx.fillRect(232, 184 + i * 90, 285, 63)
      ctx.fillStyle = ['#e8aa54', '#7bb8a0', '#8f9dd4', '#e8aa54'][i]
      ctx.fillRect(471, 205 + i * 90, 31, 20)
    }
  } else {
    ctx.fillStyle = '#dce8f4'; ctx.fillRect(82, 166, 450, 390)
    project.tags.slice(0, 3).forEach((tag, i) => {
      ctx.fillStyle = ['#89b7ca', '#e0ad70', '#8ead93'][i]
      ctx.beginPath(); ctx.roundRect(110 + i * 42, 235 + i * 80, 340 - i * 45, 64, 18); ctx.fill()
      ctx.fillStyle = '#183052'; ctx.font = '600 23px system-ui'; ctx.fillText(tag, 136 + i * 42, 276 + i * 80, 280)
    })
  }
}

function projection(project, index, total, detail, chapter, t) {
  const canvas = document.createElement('canvas')
  canvas.width = 1200; canvas.height = 720
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#f9fbff'; ctx.fillRect(0, 0, 1200, 720)
  ctx.fillStyle = '#e5eff7'; ctx.fillRect(28, 28, 1144, 664)
  ctx.fillStyle = '#183052'; ctx.fillRect(28, 28, 1144, 78)
  ctx.fillStyle = '#fff'; ctx.font = '700 34px system-ui'; ctx.fillText(t(project.title), 64, 80)
  ctx.textAlign = 'right'; ctx.font = '600 24px system-ui'
  ctx.fillText(detail ? `${String(chapter + 1).padStart(2, '0')} / 03` : `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`, 1132, 78)
  ctx.textAlign = 'left'

  illustration(ctx, project)
  ctx.fillStyle = '#7295b9'; ctx.font = '600 23px system-ui'
  ctx.fillText(project.tags.slice(0, 3).join('  ·  '), 64, 632)

  ctx.fillStyle = '#183052'
  ctx.font = '700 42px system-ui'
  ctx.fillText(detail ? t(chapters[chapter]) : t(project.role), 603, 213, 530)
  ctx.font = detail ? '29px system-ui' : '36px system-ui'
  ctx.fillStyle = '#405673'
  const copy = t(detail ? project.projection?.[chapter] || project[fields[chapter]] || project.summary : project.summary)
  lines(ctx, detail ? copy : short(copy, 106), 603, 282, 525, detail ? 45 : 53, detail ? 7 : 4)
  if (detail) {
    chapters.forEach((label, i) => {
      ctx.fillStyle = i === chapter ? '#d97732' : '#93a4b9'
      ctx.beginPath(); ctx.arc(695 + i * 155, 622, 9, 0, Math.PI * 2); ctx.fill()
      ctx.font = '600 18px system-ui'; ctx.textAlign = 'center'
      ctx.fillText(t(label), 695 + i * 155, 656, 150)
    })
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

export default function Projector({ project, index, total, detail, chapter, onOpen }) {
  const { t } = useLang()
  const screen = useRef(), surface = useRef(), lamp = useRef(), reels = useRef([])
  const reveal = useRef(1)
  const reducedMotion = useMemo(() => matchMedia('(prefers-reduced-motion: reduce)').matches, [])
  const glow = useMemo(screenGlow, [])
  const texture = useMemo(() => projection(project, index, total, detail, chapter, t), [project, index, total, detail, chapter, t])
  useLayoutEffect(() => {
    reveal.current = reducedMotion ? 1 : 0
    return () => texture.dispose()
  }, [texture, reducedMotion])
  useLayoutEffect(() => () => glow.dispose(), [glow])
  useFrame((state, delta) => {
    const step = Math.min(delta, 0.05)
    reveal.current = Math.min(1, reveal.current + step / 0.4)
    const brightness = 0.65 + 0.35 * (1 - (1 - reveal.current) ** 3)
    if (surface.current) surface.current.color.setScalar(brightness)
    if (screen.current) {
      const scale = detail ? 1.18 : 1
      screen.current.scale.setScalar(reducedMotion ? scale : THREE.MathUtils.damp(screen.current.scale.x, scale, 6, step))
      screen.current.position.y = reducedMotion ? (detail ? 2.95 : 2.55) : THREE.MathUtils.damp(screen.current.position.y, detail ? 2.95 : 2.55, 6, step)
    }
    if (!reducedMotion) {
      reels.current.forEach(reel => { if (reel) reel.rotation.z += step * 0.55 })
      if (lamp.current) lamp.current.intensity = 1.7 + Math.sin(state.clock.elapsedTime * 1.8) * 0.08
    }
  })
  return <group position={[10, 0.8, 10]} rotation={[0, Math.PI / 4, 0]}>
    {/* Existing striped pavilion stays in place; this light screen sits in front of it. */}
    <group ref={screen} position={[0, 2.55, 3.15]}>
    <mesh position={[0, 0, -0.1]}>
      <planeGeometry args={[6.8, 4.35]} />
      <meshBasicMaterial map={glow} transparent opacity={0.75} depthWrite={false} toneMapped={false} />
    </mesh>
    <mesh castShadow>
      <boxGeometry args={[5.65, 3.55, 0.12]} />
      <meshStandardMaterial color="#956738" emissive="#d7a45c" emissiveIntensity={0.25} roughness={0.6} metalness={0.15} />
    </mesh>
    <mesh position={[0, 0, 0.08]} onClick={e => { e.stopPropagation(); onOpen() }}>
      <planeGeometry args={[5.42, 3.34]} />
      <meshBasicMaterial ref={surface} map={texture} toneMapped={false} />
    </mesh>
    </group>
    <mesh position={[-3.1, 0.75, 4.15]} castShadow>
      <boxGeometry args={[0.72, 1.15, 0.76]} />
      <meshStandardMaterial color="#6c4227" roughness={0.75} />
    </mesh>
    <mesh position={[-3.1, 1.45, 4.58]} rotation={[Math.PI / 2, 0, 0]} castShadow>
      <cylinderGeometry args={[0.24, 0.24, 0.35, 12]} />
      <meshStandardMaterial color="#b9803c" metalness={0.35} roughness={0.4} />
    </mesh>
    {[-3.36, -2.65].map((x, i) => <group key={i} ref={el => { reels.current[i] = el }} position={[x, 1.9, 4.15]}>
      <mesh castShadow><torusGeometry args={[0.3, 0.055, 6, 16]} /><meshStandardMaterial color="#bd8847" metalness={0.4} roughness={0.4} /></mesh>
      {[0, 1, 2].map(spoke => <mesh key={spoke} rotation={[0, 0, spoke * Math.PI / 3]} castShadow><boxGeometry args={[0.57, 0.045, 0.055]} /><meshStandardMaterial color="#bd8847" metalness={0.4} roughness={0.4} /></mesh>)}
    </group>)}
    <mesh position={[-2.05, 2.025, 3.905]} quaternion={beamRotation}>
      <cylinderGeometry args={[0.95, 0.045, beamVector.length(), 20, 1, true]} />
      <shaderMaterial transparent depthWrite={false}
        vertexShader={'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}'}
        fragmentShader={'varying vec2 vUv; void main(){float alpha=0.07*pow(1.0-vUv.y,1.5);gl_FragColor=vec4(1.0,0.84,0.55,alpha);}'} />
    </mesh>
    <pointLight ref={lamp} position={[-3.1, 1.5, 4.5]} color="#ffd48a" intensity={1.7} distance={5} />
    <mesh position={[0, 0.38, 5.1]} castShadow>
      <boxGeometry args={[2.7, 0.65, 0.9]} />
      <meshStandardMaterial color="#805032" roughness={0.78} />
    </mesh>
  </group>
}
