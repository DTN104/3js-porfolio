// Tiến trình tải tài nguyên (FR-002, FR-004) — gom mọi loader của three (GLTF, texture) qua DefaultLoadingManager.
// Mốc "tải xong" = onLoad và không có mục mới nào bắt đầu trong 250 ms sau đó (GLTF nạp xong file rồi mới xin ảnh bên trong).
// OQ-04: window.__loadMs = lúc onLoad đầu tiên, tính từ khi mở trang.
import { DefaultLoadingManager } from 'three'
import { useSyncExternalStore } from 'react'

const state = { loaded: 0, total: 0, done: false, error: null }
let snap = { ...state }
const subs = new Set()
const emit = () => { snap = { ...state }; subs.forEach(f => f()) }
let settle = 0

DefaultLoadingManager.onStart = (url, loaded, total) => {
  clearTimeout(settle)
  state.loaded = loaded; state.total = total; state.done = false
  emit()
}
DefaultLoadingManager.onProgress = (url, loaded, total) => {
  state.loaded = loaded; state.total = total
  emit()
}
DefaultLoadingManager.onLoad = () => {
  if (!window.__loadMs) window.__loadMs = Math.round(performance.now())
  clearTimeout(settle)
  settle = setTimeout(() => { state.done = true; emit() }, 250)
}
DefaultLoadingManager.onError = (url) => {
  state.error = url
  emit()
}
// Không có gì để tải (tất cả đã trong cache / không dùng loader) -> sau 2,5 s coi như sẵn sàng
setTimeout(() => { if (state.total === 0 && !state.done) { state.done = true; emit() } }, 2500)

const subscribe = (f) => { subs.add(f); return () => subs.delete(f) }
export function useLoading() { return useSyncExternalStore(subscribe, () => snap) }
