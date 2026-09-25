import { Suspense, useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Sky, Clouds, Island, Scenery, Bridge, Avatar, CameraRig } from './World'
import { attachInput, freezeInput } from './input'
import { islands, bridges } from './content'
import { Joystick, InteractButton, Stats, usePinchZoom, isTouchDevice } from './Touch'

// Nhãn + biểu tượng theo loại vật thể (AST-06…10) cho đầu bảng nội dung
const KIND = {
  house:    { icon: '🏠', label: 'Căn nhà' },
  workshop: { icon: '🛠️', label: 'Xưởng làm việc' },
  gallery:  { icon: '🖼️', label: 'Khu trưng bày' },
  monument: { icon: '🏛️', label: 'Cột mốc' },
  mailbox:  { icon: '✉️', label: 'Hòm thư' }
}

export default function App() {
  const body = useRef()
  const zoom = useRef(1)
  const [near, setNear] = useState(null)      // FR-019: đảo đang trong tầm tương tác
  const [open, setOpen] = useState(null)      // FR-020: bảng nội dung đang mở
  const [help, setHelp] = useState(false)
  const [hint, setHint] = useState(true)      // FR-022

  const isTouch = useMemo(() => isTouchDevice(), [])
  const showStats = useMemo(() => !location.search.includes('nostats'), [])
  usePinchZoom(zoom)                          // FR-011 trên màn cảm ứng: véo hai ngón

  const openRef = useRef(null)
  const nearRef = useRef(null)
  openRef.current = open
  nearRef.current = near

  const openedAt = useRef(0)                   // chống cú click "xuyên" từ nút ✋ sang lớp nền vừa hiện ra
  const openZone = useCallback((id) => {
    if (!id) return
    openedAt.current = performance.now()
    setOpen(id); setHint(false)
  }, [])
  const closeIfSettled = useCallback(() => { if (performance.now() - openedAt.current > 400) setOpen(null) }, [])
  useEffect(() => { window.__open = openZone }, [openZone])   // hook QA

  // Camera bay tới nhìn cận vật thể khi bảng mở (bảng bên phải trên desktop, tấm trượt dưới trên điện thoại)
  const focus = useRef(null)
  useEffect(() => {
    const z = islands.find(i => i.id === open)
    focus.current = z ? { x: z.pos[0], y: z.y, z: z.pos[1], or: z.or, mode: isTouch ? 'sheet' : 'side' } : null
  }, [open, isTouch])

  // FR-020 + EC-05: khoá di chuyển khi bảng đang mở
  useEffect(() => { freezeInput(!!open || help) }, [open, help])

  useEffect(() => {
    return attachInput({
      onInteract: () => { if (!openRef.current && nearRef.current) openZone(nearRef.current) },
      onEscape:   () => { setHelp(h => (h ? false : h)); setOpen(o => (o ? null : o)) },
      onHelp:     () => setHelp(h => !h)
    })
  }, [openZone])

  // FR-011: phóng to / thu nhỏ trong khoảng giới hạn
  useEffect(() => {
    const onWheel = (e) => {
      zoom.current = Math.min(1.9, Math.max(0.55, zoom.current + Math.sign(e.deltaY) * 0.08))
    }
    window.addEventListener('wheel', onWheel, { passive: true })
    return () => window.removeEventListener('wheel', onWheel)
  }, [])

  // FR-016/FR-019: quét đảo gần nhất
  useEffect(() => {
    const id = setInterval(() => {
      const g = body.current
      if (!g) return
      let best = null, bestD = Infinity
      for (const z of islands) {
        const d = Math.hypot(g.position.x - z.pos[0], g.position.z - z.pos[1])
        if (d < z.ir && d < bestD) { best = z.id; bestD = d }
      }
      setNear(prev => (prev === best ? prev : best))
    }, 90)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setHint(false), 9000)
    return () => clearTimeout(t)
  }, [])

  const openedZone = islands.find(z => z.id === open)
  const nearZone = islands.find(z => z.id === near)

  return (
    <>
      <Canvas shadows dpr={[1, 2]} camera={{ fov: 38, position: [-6, 14, 26] }}>
        <fog attach="fog" args={['#BCDBEC', 70, 185]} />
        <hemisphereLight args={['#DCEEF6', '#6B9A4C', 0.95]} />
        <directionalLight
          position={[26, 34, 16]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0006}
          shadow-normalBias={0.45}
          shadow-camera-left={-60}
          shadow-camera-right={60}
          shadow-camera-top={60}
          shadow-camera-bottom={-60}
          shadow-camera-far={140}
        />
        <Suspense fallback={null}>
          <Sky />
          <Clouds />
          {bridges.map(b => <Bridge key={b.id} bridge={b} />)}
          {islands.map(z => (
            <Island key={z.id} island={z} active={near === z.id} onOpen={openZone} />
          ))}
          <Scenery />
          <Avatar bodyRef={body} />
        </Suspense>
        <CameraRig target={body} zoomRef={zoom} focusRef={focus} />
      </Canvas>

      <button className="iconbtn help" onClick={() => setHelp(true)} aria-label="Bảng hướng dẫn điều khiển">?</button>

      <div className="stamp">prototype · đảo trôi trên mây · model và nội dung đều là bản tạm</div>
      {showStats && <Stats />}
      {isTouch && !open && !help && (
        <>
          <Joystick />
          <InteractButton active={!!near} onPress={() => { if (nearRef.current) openZone(nearRef.current) }} />
        </>
      )}

      {hint && !open && (isTouch
        ? <div className="hint">Kéo <b>cần bên trái</b> để đi, đẩy mạnh để chạy. Chạm <b>✋</b> để tương tác.</div>
        : <div className="hint">Dùng <b>W A S D</b> để đi. Giữ <b>Shift</b> để chạy. Qua đảo khác bằng <b>cầu dây</b>.</div>
      )}

      {/* FR-017: chỉ dấu kèm chỉ dẫn thao tác */}
      {nearZone && !open && (
        <div className="prompt">
          {isTouch ? <span>✋</span> : <span className="key">E</span>} {nearZone.hint} — mở <b>{nearZone.label}</b>
        </div>
      )}

      {openedZone && (
        <div className={'scrim' + (isTouch ? ' sheet-mode' : '')} onClick={closeIfSettled}>
          <section className={'drawer ' + openedZone.kind} onClick={e => e.stopPropagation()} role="dialog" aria-label={openedZone.title}>
            <header className="dhead">
              {isTouch && <i className="grip" />}
              <div className="kindtag"><span>{KIND[openedZone.kind].icon}</span>{KIND[openedZone.kind].label} · đảo {islands.indexOf(openedZone) + 1}/{islands.length}</div>
              <h2>{openedZone.title}</h2>
              <div className="dots">{islands.map(z => <i key={z.id} className={z.id === openedZone.id ? 'on' : ''} />)}</div>
              {/* FR-021: đóng được bằng ít nhất hai cách */}
              <button className="close" onClick={() => setOpen(null)} aria-label="Đóng bảng nội dung">✕</button>
            </header>
            <div className="dbody">
              {openedZone.body.map((p, i) => <p key={i}>{p}</p>)}
              <div className="chips">
                {openedZone.meta.map(([k, v]) => <span key={k} className="chip"><b>{k}</b>{v}</span>)}
              </div>
            </div>
            <footer>{isTouch ? 'Chạm ra ngoài hoặc ✕ để đóng.' : <>Đóng bằng nút ✕ hoặc phím <b>Esc</b>.</>}</footer>
          </section>
        </div>
      )}

      {help && (
        <div className="panelwrap" onClick={() => setHelp(false)}>
          <section className="panel help-panel" onClick={e => e.stopPropagation()} role="dialog" aria-label="Điều khiển">
            <header>
              <h2>Điều khiển</h2>
              <button onClick={() => setHelp(false)} aria-label="Đóng bảng hướng dẫn">✕</button>
            </header>
            <table>
              <tbody>
                <tr><td>Di chuyển</td><td><span className="key">W</span><span className="key">A</span><span className="key">S</span><span className="key">D</span> hoặc phím mũi tên</td></tr>
                <tr><td>Chạy</td><td>giữ <span className="key">Shift</span></td></tr>
                <tr><td>Tương tác</td><td><span className="key">E</span> hoặc bấm chuột vào vật thể</td></tr>
                <tr><td>Đóng bảng</td><td><span className="key">Esc</span></td></tr>
                <tr><td>Phóng to / thu nhỏ</td><td>con lăn chuột</td></tr>
                <tr><td>Sang đảo khác</td><td>đi qua cầu dây — không nhảy, không rơi</td></tr>
                <tr><td>Màn cảm ứng</td><td>cần bên trái để đi (đẩy mạnh = chạy) · ✋ để tương tác · véo hai ngón để phóng to / thu nhỏ</td></tr>
              </tbody>
            </table>
            <footer>FR-037, FR-038 — bảng này gọi ra được bất kỳ lúc nào.</footer>
          </section>
        </div>
      )}
    </>
  )
}
