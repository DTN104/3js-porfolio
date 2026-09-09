// Trạng thái bàn phím ở mức module — đọc trong useFrame, không gây re-render.
// FR-013: nhiều phím cùng lúc; nhả hết khi cửa sổ mất tiêu điểm.

const held = new Set()
let frozen = false

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
  get running() { return held.has('shift') },
  get moving()  { return !frozen && (held.has('f') || held.has('b') || held.has('l') || held.has('r')) },
  get frozen()  { return frozen }
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
