// Trạng thái bàn phím ở mức module — đọc trong useFrame, không gây re-render.
// FR-013: nhiều phím cùng lúc; nhả hết khi cửa sổ mất tiêu điểm.

import { rotateCamera } from './camera'

const held = new Set()
let frozen = false
// Cần điều khiển cảm ứng (Touch.jsx): vector analog trong [-1, 1] — x: phải(+)/trái(−), y: tiến(+)/lùi(−)
const stick = { x: 0, y: 0 }
export function setStick(x, y) { stick.x = x; stick.y = y }

const MOVE = {
  KeyW: 'f', ArrowUp: 'f',
  KeyS: 'b', ArrowDown: 'b',
  KeyA: 'l', ArrowLeft: 'l',
  KeyD: 'r', ArrowRight: 'r'
}

export const input = {
  get forward() { return held.has('f') },
  get back()    { return held.has('b') },
  get left()    { return held.has('l') },
  get right()   { return held.has('r') },
  get running() { return held.has('shift') || Math.hypot(stick.x, stick.y) > 0.82 },   // đẩy cần gần biên = chạy
  get frozen()  { return frozen },
  // Vector di chuyển tổng hợp bàn phím + cần cảm ứng, kẹp độ dài ≤ 1 (FR-013: đi chéo không nhanh hơn).
  // y theo hướng "tiến" quy chiếu camera, x theo hướng "phải".
  move() {
    if (frozen) return { x: 0, y: 0 }
    let x = (held.has('r') ? 1 : 0) - (held.has('l') ? 1 : 0) + stick.x
    let y = (held.has('f') ? 1 : 0) - (held.has('b') ? 1 : 0) + stick.y
    const L = Math.hypot(x, y)
    if (L > 1) { x /= L; y /= L }
    return { x, y }
  },
  get moving()  { const m = input.move(); return Math.hypot(m.x, m.y) > 0.001 }
}

export function freezeInput(v) {
  frozen = v
  if (v) held.clear()          // EC-05: mở bảng khi đang giữ phím thì nhân vật dừng hẳn
}

export function attachInput({ onInteract, onEscape, onHelp }) {
  const down = (e) => {
    if (e.repeat) return
    if (e.code === 'Escape') { onEscape && onEscape(); return }
    if (e.key === '?') { onHelp && onHelp(); return }
    if (e.code === 'KeyE') { onInteract && onInteract(); return }
    if (e.code === 'KeyQ') { rotateCamera(-1); return }      // xoay góc nhìn
    if (e.code === 'KeyR') { rotateCamera(+1); return }
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') { held.add('shift'); return }
    const m = MOVE[e.code]
    if (m) { held.add(m); e.preventDefault() }
  }
  const up = (e) => {
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') { held.delete('shift'); return }
    const m = MOVE[e.code]
    if (m) held.delete(m)
  }
  const blur = () => held.clear()   // FR-013

  window.addEventListener('keydown', down)
  window.addEventListener('keyup', up)
  window.addEventListener('blur', blur)
  document.addEventListener('visibilitychange', blur)

  return () => {
    window.removeEventListener('keydown', down)
    window.removeEventListener('keyup', up)
    window.removeEventListener('blur', blur)
    document.removeEventListener('visibilitychange', blur)
    held.clear()
  }
}
