import { Suspense, useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Sky, Clouds, Island, Scenery, Bridge, Avatar, CameraRig } from './World'
import { attachInput, freezeInput } from './input'
import { islands, bridges } from './content'
import { Joystick, InteractButton, Stats, usePinchZoom, isTouchDevice, CameraButtons } from './Touch'
import { useLang, UI, KIND_ICON, LangSwitch } from './i18n'
import { ZoneBody } from './ZoneContent'
import StartScreen from './Start'

const ZONE_IDS = new Set(islands.map(z => z.id))
const hashZone = () => { const h = decodeURIComponent(location.hash.slice(1)); return ZONE_IDS.has(h) ? h : null }

export default function App({ onSwitch2D }) {
  const { t } = useLang()
  const body = useRef()
  const zoom = useRef(1)
  const [near, setNear] = useState(null)      // FR-019: đảo đang trong tầm tương tác
  const [open, setOpen] = useState(null)      // FR-020: bảng nội dung đang mở
  const [help, setHelp] = useState(false)
  const [hint, setHint] = useState(true)      // FR-022
  // FR-001: 'start' = màn hình khởi động, 'leaving' = đang mờ dần, 'play' = trong thế giới. ?nostart bỏ qua (QA / chụp ảnh).
  const [phase, setPhase] = useState(() => (/[?&]nostart\b/.test(location.search) ? 'play' : 'start'))
  const playing = phase === 'play'

  const isTouch = useMemo(() => isTouchDevice(), [])
  const showStats = useMemo(() => /[?&]stats\b/.test(location.search), [])   // góc đo hiệu năng: thêm ?stats vào địa chỉ
  usePinchZoom(zoom)                          // FR-011 trên màn cảm ứng: véo hai ngón

  const openRef = useRef(null)
  const nearRef = useRef(null)
  openRef.current = open
  nearRef.current = near

  const openedAt = useRef(0)                   // chống cú click "xuyên" từ nút ✋ sang lớp nền vừa hiện ra
  const openZone = useCallback((id) => {
    if (!id || !ZONE_IDS.has(id)) return
    openedAt.current = performance.now()
    setOpen(id); setHint(false)
  }, [])
  const closeZone = useCallback(() => setOpen(null), [])
  const closeIfSettled = useCallback(() => { if (performance.now() - openedAt.current > 400) setOpen(null) }, [])

  const start = useCallback(() => {
    setPhase(p => (p === 'start' ? 'leaving' : p))
  }, [])
  useEffect(() => {
    if (phase !== 'leaving') return
    const tm = setTimeout(() => setPhase('play'), 450)
    return () => clearTimeout(tm)
  }, [phase])
  useEffect(() => { window.__open = openZone; window.__start = start }, [openZone, start])   // hook QA

  // FR-058: liên kết #<id đảo> mở đúng khu vực khi vào thế giới; mở/đóng bảng cập nhật lại địa chỉ để chia sẻ được
  useEffect(() => { if (playing) { const h = hashZone(); if (h) openZone(h) } }, [playing, openZone])
  useEffect(() => {
    if (!playing) return
    const url = new URL(location.href); url.hash = open ? open : ''
    history.replaceState(null, '', url)
  }, [open, playing])

  // Camera bay tới nhìn cận vật thể khi bảng mở (bảng bên phải trên desktop, tấm trượt dưới trên điện thoại)
  const focus = useRef(null)
  useEffect(() => {
    const z = islands.find(i => i.id === open)
    focus.current = z ? { x: z.pos[0], y: z.y, z: z.pos[1], or: z.or, mode: isTouch ? 'sheet' : 'side' } : null
  }, [open, isTouch])

  // FR-020 + EC-05: khoá di chuyển khi bảng đang mở, khi chưa bấm Bắt đầu
  useEffect(() => { freezeInput(!!open || help || !playing) }, [open, help, playing])

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

  // FR-022: gợi ý điều khiển tự ẩn sau 9 s kể từ lúc vào thế giới
  useEffect(() => {
    if (!playing) return
    const tm = setTimeout(() => setHint(false), 9000)
    return () => clearTimeout(tm)
  }, [playing])

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
            <Island key={z.id} island={z} active={near === z.id} onOpen={playing ? openZone : undefined} />
          ))}
          <Scenery />
          <Avatar bodyRef={body} />
        </Suspense>
        <CameraRig target={body} zoomRef={zoom} focusRef={focus} />
      </Canvas>

      {phase !== 'play' && (
        <StartScreen onStart={start} onSwitch2D={onSwitch2D} isTouch={isTouch} leaving={phase === 'leaving'} />
      )}

      <button className="iconbtn help" onClick={() => setHelp(true)} aria-label={t(UI.helpBtn)} title={t(UI.helpBtn)}>?</button>
      {/* FR-047: luôn có lối sang bản 2D đầy đủ nội dung */}
      {onSwitch2D && <button className="iconbtn mode2d" onClick={onSwitch2D} aria-label={t(UI.view2d)} title={t(UI.view2d)}>2D</button>}
      <LangSwitch className="topbar" />

      <div className="stamp">{t(UI.stamp)}</div>
      {showStats && <Stats />}
      {!help && <CameraButtons />}
      {isTouch && playing && !open && !help && (
        <>
          <Joystick />
          <InteractButton active={!!near} onPress={() => { if (nearRef.current) openZone(nearRef.current) }} />
        </>
      )}

      {playing && hint && !open && <div className="hint">{t(isTouch ? UI.hintTouch : UI.hintKeys)}</div>}

      {/* FR-017: chỉ dấu kèm chỉ dẫn thao tác */}
      {playing && nearZone && !open && (
        <div className="prompt">
          {isTouch ? <span>✋</span> : <span className="key">E</span>} {t(nearZone.hint)} — {t(UI.open)} <b>{t(nearZone.label)}</b>
        </div>
      )}

      {openedZone && (
        <div className={'scrim' + (isTouch ? ' sheet-mode' : '')} onClick={closeIfSettled}>
          <section className={'drawer ' + openedZone.kind} onClick={e => e.stopPropagation()} role="dialog" aria-label={t(openedZone.title)}>
            <header className="dhead">
              {isTouch && <i className="grip" />}
              <div className="kindtag"><span>{KIND_ICON[openedZone.kind]}</span>{t(UI.kinds[openedZone.kind])} · {t(UI.island)} {islands.indexOf(openedZone) + 1}/{islands.length}</div>
              <h2>{t(openedZone.title)}</h2>
              <div className="dots">{islands.map(z => <i key={z.id} className={z.id === openedZone.id ? 'on' : ''} />)}</div>
              {/* FR-021: đóng được bằng ít nhất hai cách */}
              <button className="close" onClick={closeZone} aria-label={t(UI.close)}>✕</button>
            </header>
            <div className="dbody">
              <ZoneBody island={openedZone} context="drawer" />
            </div>
            <footer>{t(isTouch ? UI.closeTouch : UI.closeKeys)}</footer>
          </section>
        </div>
      )}

      {help && (
        <div className="panelwrap" onClick={() => setHelp(false)}>
          <section className="panel help-panel" onClick={e => e.stopPropagation()} role="dialog" aria-label={t(UI.controls)}>
            <header>
              <h2>{t(UI.controls)}</h2>
              <button onClick={() => setHelp(false)} aria-label={t(UI.close)}>✕</button>
            </header>
            {/* FR-039: bộ thao tác theo loại thiết bị — cảm ứng thì không mô tả phím */}
            <table>
              <tbody>
                {isTouch ? (
                  <>
                    <tr><td>{t(UI.helpTouch.move[0])}</td><td>{t(UI.helpTouch.move[1])}</td></tr>
                    <tr><td>{t(UI.helpTouch.run[0])}</td><td>{t(UI.helpTouch.run[1])}</td></tr>
                    <tr><td>{t(UI.helpTouch.interact[0])}</td><td>{t(UI.helpTouch.interact[1])}</td></tr>
                    <tr><td>{t(UI.helpTouch.closeP[0])}</td><td>{t(UI.helpTouch.closeP[1])}</td></tr>
                    <tr><td>{t(UI.helpTouch.zoom[0])}</td><td>{t(UI.helpTouch.zoom[1])}</td></tr>
                    <tr><td>{t(UI.helpTouch.rotate[0])}</td><td>{t(UI.helpTouch.rotate[1])}</td></tr>
                    <tr><td>{t(UI.helpTouch.cross[0])}</td><td>{t(UI.helpTouch.cross[1])}</td></tr>
                    <tr><td>{t(UI.helpTouch.lang[0])}</td><td>{t(UI.helpTouch.lang[1])}</td></tr>
                    <tr><td>{t(UI.helpTouch.mode2d[0])}</td><td>{t(UI.helpTouch.mode2d[1])}</td></tr>
                  </>
                ) : (
                  <>
                    <tr><td>{t(UI.help.move[0])}</td><td><span className="key">W</span><span className="key">A</span><span className="key">S</span><span className="key">D</span> {t(UI.help.move[1])}</td></tr>
                    <tr><td>{t(UI.help.run[0])}</td><td>{t(UI.help.run[1])} <span className="key">Shift</span></td></tr>
                    <tr><td>{t(UI.help.interact[0])}</td><td><span className="key">E</span> {t(UI.help.interact[1])}</td></tr>
                    <tr><td>{t(UI.help.closeP[0])}</td><td><span className="key">Esc</span></td></tr>
                    <tr><td>{t(UI.help.zoom[0])}</td><td>{t(UI.help.zoom[1])}</td></tr>
                    <tr><td>{t(UI.help.rotate[0])}</td><td><span className="key">Q</span><span className="key">R</span> {t(UI.help.rotate[1])}</td></tr>
                    <tr><td>{t(UI.help.cross[0])}</td><td>{t(UI.help.cross[1])}</td></tr>
                    <tr><td>{t(UI.help.lang[0])}</td><td>{t(UI.help.lang[1])}</td></tr>
                    <tr><td>{t(UI.help.mode2d[0])}</td><td>{t(UI.help.mode2d[1])}</td></tr>
                  </>
                )}
              </tbody>
            </table>
            <footer>FR-037, FR-038</footer>
          </section>
        </div>
      )}
    </>
  )
}
