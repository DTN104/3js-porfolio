import { useEffect, useRef, useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { Ground, Avatar, Hotspot, CameraRig } from './World'
import { attachInput, freezeInput } from './input'
import { zones } from './content'

export default function App() {
  const body = useRef()
  const zoom = useRef(1)
  const [near, setNear] = useState(null)      // FR-019: vật thể gần nhất
  const [open, setOpen] = useState(null)      // FR-020: bảng nội dung đang mở
  const [help, setHelp] = useState(false)
  const [hint, setHint] = useState(true)      // FR-022

  const openRef = useRef(null)
  const nearRef = useRef(null)
  openRef.current = open
  nearRef.current = near

  const openZone = useCallback((id) => {
    if (!id) return
    setOpen(id); setHint(false)
  }, [])

  // FR-020: khoá di chuyển khi bảng đang mở
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
      zoom.current = Math.min(1.8, Math.max(0.55, zoom.current + Math.sign(e.deltaY) * 0.08))
    }
    window.addEventListener('wheel', onWheel, { passive: true })
    return () => window.removeEventListener('wheel', onWheel)
  }, [])

  // FR-016/FR-019: quét vật thể gần nhất
  useEffect(() => {
    const id = setInterval(() => {
      const g = body.current
      if (!g) return
      let best = null, bestD = Infinity
      for (const z of zones) {
        const d = Math.hypot(g.position.x - z.pos[0], g.position.z - z.pos[1])
        if (d < z.r && d < bestD) { best = z.id; bestD = d }
      }
      setNear(prev => (prev === best ? prev : best))
    }, 90)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setHint(false), 9000)
    return () => clearTimeout(t)
  }, [])

  const openedZone = zones.find(z => z.id === open)
  const nearZone = zones.find(z => z.id === near)

  return (
    <>
      <Canvas shadows dpr={[1, 2]} camera={{ fov: 38, position: [13, 13.5, 13] }}>
        <color attach="background" args={['#cfe3ee']} />
        <fog attach="fog" args={['#cfe3ee', 40, 78]} />
        <hemisphereLight args={['#dff0ff', '#6b7a55', 0.85]} />
        <directionalLight
          position={[12, 18, 8]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-30}
          shadow-camera-right={30}
          shadow-camera-top={30}
          shadow-camera-bottom={-30}
        />
        <Ground />
        {zones.map(z => (
          <Hotspot key={z.id} zone={z} active={near === z.id} onOpen={openZone} />
        ))}
        <Avatar bodyRef={body} />
        <CameraRig target={body} zoomRef={zoom} />
      </Canvas>

      <button className="iconbtn help" onClick={() => setHelp(true)} aria-label="Bảng hướng dẫn điều khiển">?</button>

      <div className="stamp">prototype · thế giới 3D · dữ liệu và model đều là bản tạm</div>

      {hint && !open && (
        <div className="hint">Dùng <b>W A S D</b> để đi. Giữ <b>Shift</b> để chạy.</div>
      )}

      {/* FR-017: chỉ dấu kèm chỉ dẫn thao tác */}
      {nearZone && !open && (
        <div className="prompt">
          <span className="key">E</span> {nearZone.hint} — mở <b>{nearZone.label}</b>
        </div>
      )}

      {openedZone && (
        <div className="panelwrap" onClick={() => setOpen(null)}>
          <section className="panel" onClick={e => e.stopPropagation()} role="dialog" aria-label={openedZone.title}>
            <header>
              <h2>{openedZone.title}</h2>
              {/* FR-021: đóng được bằng ít nhất hai cách */}
              <button onClick={() => setOpen(null)} aria-label="Đóng bảng nội dung">✕</button>
            </header>
            {openedZone.body.map((p, i) => <p key={i}>{p}</p>)}
            <dl>
              {openedZone.meta.map(([k, v]) => (
                <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
            <footer>Đóng bằng nút ✕ hoặc phím <b>Esc</b>.</footer>
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
              </tbody>
            </table>
            <footer>FR-037, FR-038 — bảng này gọi ra được bất kỳ lúc nào.</footer>
          </section>
        </div>
      )}
    </>
  )
}
