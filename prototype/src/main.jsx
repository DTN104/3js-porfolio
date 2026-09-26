import React, { useState, useCallback, useEffect, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
const App = lazy(() => import('./App'))
import Page2D from './Page2D'
import { LangProvider, useLang, UI } from './i18n'
import { seo } from './content'
import './styles.css'

// ---------- chọn chế độ hiển thị: 3D hay 2D (OQ-02, FR-005, FR-047) ----------
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

// Tiêu đề + mô tả theo ngôn ngữ đang chọn (FR-056 phần động; thẻ tĩnh nằm trong index.html)
function Head() {
  const { lang, t } = useLang()
  useEffect(() => {
    document.title = t(seo.title)
    const m = document.querySelector('meta[name="description"]')
    if (m) m.setAttribute('content', t(seo.description))
  }, [lang, t])
  return null
}

function Root() {
  const { t } = useLang()
  const [mode, setMode] = useState(() => (CAN_3D ? pickMode() : '2d'))
  const choose = useCallback((m) => {
    try { localStorage.setItem('mode', m) } catch {}
    const url = new URL(location.href); url.searchParams.delete('mode'); history.replaceState(null, '', url)
    setMode(m)
  }, [])

  if (mode === '2d') {
    return <Page2D canRun3D={CAN_3D} onSwitch3D={() => choose('3d')} notice={CAN_3D ? null : UI.noWebgl} />
  }
  return (
    <Guard fallback={<Page2D canRun3D={false} notice={UI.crashed} />}>
      <Suspense fallback={<div className="start"><div className="start-card"><p role="status">{t(UI.loading)}</p><button className="btn" onClick={() => choose('2d')}>{t(UI.view2d)}</button></div></div>}>
        <App onSwitch2D={() => choose('2d')} />
      </Suspense>
    </Guard>
  )
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LangProvider>
      <Head />
      <Root />
    </LangProvider>
  </React.StrictMode>
)
