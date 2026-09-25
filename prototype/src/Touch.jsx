import { useEffect, useRef } from 'react'
import { setStick } from './input'

// Điều khiển cảm ứng cho điện thoại / máy tính bảng (Figma trang 03 — "điều khiển cảm ứng"):
// cần ảo bên trái (kéo để đi, đẩy gần hết biên để chạy), nút tương tác bên phải, véo hai ngón để zoom (FR-011).
// Chỉ hiện khi thiết bị có màn cảm ứng — xem isTouchDevice() trong App.jsx.

export function isTouchDevice() {
  return (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) || 'ontouchstart' in window
}

export function Joystick({ radius = 50 }) {
  const base = useRef(null)
  const knob = useRef(null)
  const st = useRef({ id: null, cx: 0, cy: 0 })

  useEffect(() => {
    const el = base.current
    if (!el) return
    const move = (e) => {
      if (e.pointerId !== st.current.id) return
      let dx = e.clientX - st.current.cx, dy = e.clientY - st.current.cy
      const L = Math.hypot(dx, dy)
      if (L > radius) { dx *= radius / L; dy *= radius / L }
      knob.current.style.transform = `translate(${dx}px, ${dy}px)`
      setStick(dx / radius, -dy / radius)              // màn hình: y xuống; thế giới: tiến = lên
      e.preventDefault()
    }
    const down = (e) => {
      if (st.current.id !== null) return
      const r = el.getBoundingClientRect()
      st.current = { id: e.pointerId, cx: r.left + r.width / 2, cy: r.top + r.height / 2 }
      el.setPointerCapture(e.pointerId)
      el.classList.add('active')
      move(e)
    }
    const up = (e) => {
      if (e.pointerId !== st.current.id) return
      st.current.id = null
      knob.current.style.transform = ''
      el.classList.remove('active')
      setStick(0, 0)
    }
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    el.addEventListener('lostpointercapture', up)
    return () => {
      el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up)
      el.removeEventListener('lostpointercapture', up)
      setStick(0, 0)
    }
  }, [radius])

  return (
    <div className="touch-ui joystick" ref={base} aria-label="Cần điều khiển di chuyển">
      <div className="knob" ref={knob} />
    </div>
  )
}

export function InteractButton({ active, onPress }) {
  return (
    <button
      className={'touch-ui interact' + (active ? ' ready' : '')}
      aria-label="Tương tác"
      onClick={(e) => { e.preventDefault(); onPress() }}   // click, không phải pointerdown: tránh bảng vừa mở đã nhận cú click đóng
    >✋</button>
  )
}

// Véo hai ngón trên vùng cảnh để phóng to / thu nhỏ — dùng chung zoomRef với con lăn chuột.
export function usePinchZoom(zoomRef, min = 0.55, max = 1.9) {
  useEffect(() => {
    const pts = new Map()
    let startDist = 0, startZoom = 1
    const skip = (e) => e.pointerType !== 'touch' || (e.target.closest && e.target.closest('.touch-ui, .panelwrap'))
    const down = (e) => {
      if (skip(e)) return
      pts.set(e.pointerId, [e.clientX, e.clientY])
      if (pts.size === 2) {
        const [a, b] = [...pts.values()]
        startDist = Math.hypot(a[0] - b[0], a[1] - b[1]) || 1
        startZoom = zoomRef.current
      }
    }
    const move = (e) => {
      if (!pts.has(e.pointerId)) return
      pts.set(e.pointerId, [e.clientX, e.clientY])
      if (pts.size === 2) {
        const [a, b] = [...pts.values()]
        const d = Math.hypot(a[0] - b[0], a[1] - b[1]) || 1
        zoomRef.current = Math.min(max, Math.max(min, startZoom * startDist / d))
        e.preventDefault()
      }
    }
    const up = (e) => { pts.delete(e.pointerId) }
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move, { passive: false })
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      window.removeEventListener('pointerdown', down); window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up)
    }
  }, [zoomRef, min, max])
}

// Góc đo hiệu năng (OQ-04 / OQ-20): fps, draw call, tam giác, thời gian tải asset, kích thước khung.
// Ẩn bằng ?nostats. Số cũng ghi ra window.__fps để tự động hoá đọc được.
export function Stats() {
  const ref = useRef(null)
  useEffect(() => {
    let frames = 0, last = performance.now(), raf = 0
    const fmt = (n) => n == null ? '–' : n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'k' : String(n)
    const tick = () => {
      frames++
      const now = performance.now()
      if (now - last >= 500) {
        const fps = Math.round(frames * 1000 / (now - last))
        frames = 0; last = now
        window.__fps = fps
        const r = window.__render || {}
        const c = document.querySelector('canvas')
        const load = window.__loadMs ? (window.__loadMs / 1000).toFixed(1) + ' s' : '…'
        if (ref.current) ref.current.textContent =
          `${fps} fps · ${r.calls ?? '–'} dc · ${fmt(r.triangles)} tri · tải ${load} · ${c ? c.width + '×' + c.height : ''}@${(window.devicePixelRatio || 1).toFixed(1)}`
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
  return <div className="stats" ref={ref} aria-live="off" />
}
