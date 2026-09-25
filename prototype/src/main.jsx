import React, { useState, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import Page2D from './Page2D'
import './styles.css'
import { DefaultLoadingManager } from 'three'

// OQ-04: mốc "tải xong nhóm tài nguyên bắt buộc" = lúc mọi .glb/.jpg đã nạp, tính từ khi mở trang
DefaultLoadingManager.onLoad = () => { if (!window.__loadMs) window.__loadMs = Math.round(performance.now()) }

// ---------- chọn chế độ hiển thị: 3D hay 2D (OQ-02, FR-047) ----------
function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch { return false }
}
const CAN_3D = hasWebGL()

function pickMode() {
  const q = new URLSearchParams(location.search).get('mode')      // ?mode=2d | 3d — link trực tiếp
  if (q === '2d' || q === '3d') return q
  let saved = null
  try { saved = localStorage.getItem('mode') } catch {}
  if (saved === '2d' || saved === '3d') return saved
  if (!CAN_3D) return '2d'
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return '2d'
  return '3d'
}

// EC-01/EC-02: thế giới 3D lỗi giữa chừng (mất WebGL context, nạp model hỏng) -> rơi về 2D, không màn hình trắng
class Guard extends React.Component {
  constructor(p) { super(p); this.state = { failed: false } }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(err) { console.error('3D lỗi, chuyển sang 2D:', err) }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

function Root() {
  const [mode, setMode] = useState(() => (CAN_3D ? pickMode() : '2d'))
  const choose = useCallback((m) => {
    try { localStorage.setItem('mode', m) } catch {}
    const url = new URL(location.href); url.searchParams.delete('mode'); history.replaceState(null, '', url)
    setMode(m)
  }, [])

  if (mode === '2d') {
    return <Page2D canRun3D={CAN_3D} onSwitch3D={() => choose('3d')}
                   notice={CAN_3D ? null : 'Thiết bị này không hiển thị được thế giới 3D — bạn đang xem bản 2D đầy đủ nội dung.'} />
  }
  return (
    <Guard fallback={<Page2D canRun3D={false} notice="Thế giới 3D gặp lỗi khi hiển thị — đây là bản 2D với đầy đủ nội dung." />}>
      <App onSwitch2D={() => choose('2d')} />
    </Guard>
  )
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
