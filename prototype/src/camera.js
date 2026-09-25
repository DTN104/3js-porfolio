// Trạng thái góc nhìn camera ở mức module — đọc trong useFrame, không gây re-render.
// Camera nhìn xuống 45° từ phương vị `yaw` quanh nhân vật; xoay theo bước 90° bằng nút ↶ ↷ hoặc phím Q / R.
// Hướng "tiến" của WASD / cần ảo luôn = hướng camera đang nhìn (FR-010), nên xoay camera thì hướng đi đổi theo.
import * as THREE from 'three'

export const STEP = Math.PI / 2
export const cam = {
  yawTarget: Math.PI / 4,      // góc mặc định: camera ở phía +X +Z nhìn về gốc (như bản đầu)
  yaw: Math.PI / 4             // giá trị đã làm mượt — CameraRig cập nhật mỗi khung
}

export function rotateCamera(dir) {           // dir = +1: ↷ (thế giới quay theo chiều kim đồng hồ), −1: ↶
  cam.yawTarget += STEP * Math.sign(dir)
}

export function resetCamera() {
  cam.yawTarget = Math.round(cam.yawTarget / STEP) * STEP   // giữ đúng bội số 90° gần nhất
}

const _f = new THREE.Vector3(), _r = new THREE.Vector3(), _h = new THREE.Vector3()
// Hướng ngang từ nhân vật ra camera
export function camHoriz() { return _h.set(Math.sin(cam.yaw), 0, Math.cos(cam.yaw)) }
// "Tiến" = đi ra xa camera theo mặt đất
export function camFwd() { return _f.set(-Math.sin(cam.yaw), 0, -Math.cos(cam.yaw)) }
// "Phải" của người xem
export function camRight() { return _r.set(Math.cos(cam.yaw), 0, -Math.sin(cam.yaw)) }
