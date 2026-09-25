import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import { DefaultLoadingManager } from 'three'

// OQ-04: mốc "tải xong nhóm tài nguyên bắt buộc" = lúc mọi .glb/.jpg đã nạp, tính từ khi mở trang
DefaultLoadingManager.onLoad = () => { if (!window.__loadMs) window.__loadMs = Math.round(performance.now()) }

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
