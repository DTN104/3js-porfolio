// Chủ đề thế giới: Đảo trôi trên mây (OQ-06 đã chốt).
// Toạ độ [x, z] tính bằng mét. y = cao độ mặt cỏ của đảo.
// AST-03: đường kính đảo 15–19 m → r = 7,5…9,5. AST-12: cầu dây 10,2–10,9 m là lối đi duy nhất.
// or = bán kính vật cản của vật thể tương tác, theo kích thước spec AST-06…10 (nhà 6 m -> 3,3; khu trưng bày 5,5 m -> 3,1).

export const EDGE_MARGIN = 0.9   // OQ-21 — phương án đề xuất: chặn mềm ở mép, không cho rơi
export const BRIDGE_HALF = 1.25  // nửa chiều rộng mặt cầu
// AST-12: mặt ván võng theo parabol. PHẢI khớp SAG trong specs/.../assets-3d/bridges/build_bridge.py,
// nếu không nhân vật lơ lửng trên ván (hoặc chìm) ở giữa cầu.
export const BRIDGE_SAG = 0.4
export function bridgeY(b, t) {
  return b.fromY + (b.toY - b.fromY) * t - BRIDGE_SAG * 4 * t * (1 - t)
}

export const islands = [
  {
    id: 'gioi-thieu', model: '/models/islands/AST03a_Island01_Intro.glb', label: 'Giới thiệu', hint: 'Căn nhà',
    pos: [-24, 12], r: 9, y: 0,
    kind: 'house', ir: 4.2, or: 3.3,
    grass: '#8CBE68', rock: '#9E8E7C',
    title: 'Giới thiệu',
    body: [
      'Khu vực mở đầu: tên, vai trò nghề nghiệp và mô tả ngắn.',
      'Đây là đảo xuất phát — nhân vật luôn khởi tạo tại đây (FR-008).'
    ],
    meta: [['Vật thể', 'AST-06'], ['Đảo', 'AST-03'], ['Requirement', 'FR-016, FR-023']]
  },
  {
    id: 'ky-nang', model: '/models/islands/AST03b_Island02_Skills.glb', label: 'Kỹ năng', hint: 'Xưởng làm việc',
    pos: [-8, -6], r: 8, y: 2.2,
    kind: 'workshop', ir: 4.0, or: 2.0,
    grass: '#8CBE68', rock: '#9E8E7C',
    title: 'Kỹ năng',
    body: [
      'Nhóm kỹ năng theo lĩnh vực, mỗi nhóm là một hạng mục nội dung.',
      'Số lượng nhóm đổi được mà không phải dựng lại model — dùng chung nguồn với chế độ 2D (FR-078).'
    ],
    meta: [['Vật thể', 'AST-07'], ['Đảo', 'AST-03'], ['Requirement', 'FR-024']]
  },
  {
    id: 'du-an', model: '/models/islands/AST03c_Island03_Projects.glb', label: 'Dự án', hint: 'Khu trưng bày',
    pos: [10, 10], r: 9.5, y: 0.8,
    kind: 'gallery', ir: 4.6, or: 3.1,
    grass: '#8CBE68', rock: '#9E8E7C',
    title: 'Dự án',
    body: [
      'Một vật thể chung cho toàn bộ danh sách dự án — mặt trưng bày để trống, số dự án đổi mà không phải dựng lại model.',
      'Đây là phương án đang khuyến nghị ở OQ-19.'
    ],
    meta: [['Vật thể', 'AST-08'], ['Câu hỏi', 'OQ-19'], ['Requirement', 'FR-025, FR-059']]
  },
  {
    id: 'kinh-nghiem', model: '/models/islands/AST03d_Island04_Experience.glb', label: 'Kinh nghiệm', hint: 'Cột mốc',
    pos: [27, -8], r: 8, y: 3.0,
    kind: 'monument', ir: 4.0, or: 2.3,
    grass: '#8CBE68', rock: '#9E8E7C',
    title: 'Kinh nghiệm',
    body: [
      'Dòng thời gian nghề nghiệp, mỗi cột mốc là một giai đoạn.',
      'Thứ tự các đảo chính là thứ tự tường thuật: giới thiệu → kỹ năng → dự án → kinh nghiệm → liên hệ.'
    ],
    meta: [['Vật thể', 'AST-09'], ['Đảo', 'AST-03'], ['Requirement', 'FR-026']]
  },
  {
    id: 'lien-he', model: '/models/islands/AST03e_Island05_Contact.glb', label: 'Liên hệ & CV', hint: 'Hòm thư',
    pos: [37, 12], r: 7.5, y: 1.2,
    kind: 'mailbox', ir: 3.8, or: 1.5,
    grass: '#8CBE68', rock: '#9E8E7C',
    title: 'Liên hệ & CV',
    body: [
      'Thư điện tử, liên kết mạng xã hội và nút tải CV.',
      'Không có form gửi trên trang — đã chốt ở OQ-01.'
    ],
    meta: [['Vật thể', 'AST-10'], ['Đảo', 'AST-03'], ['Requirement', 'FR-032, FR-033, FR-035']]
  }
]

// AST-12: cầu dây nối hai đảo liền kề theo thứ tự tường thuật.
// Điểm đầu thụt vào trong mặt cỏ để vùng đi được của cầu và của đảo chồng lên nhau,
// tránh khe hở làm nhân vật kẹt ở mép.
const INSET = 1.8

export const bridges = [[0, 1], [1, 2], [2, 3], [3, 4]].map(([ia, ib], i) => {
  const A = islands[ia], B = islands[ib]
  const dx = B.pos[0] - A.pos[0]
  const dz = B.pos[1] - A.pos[1]
  const d = Math.hypot(dx, dz)
  const ux = dx / d, uz = dz / d
  const from = [A.pos[0] + ux * (A.r - INSET), A.pos[1] + uz * (A.r - INSET)]
  const to   = [B.pos[0] - ux * (B.r - INSET), B.pos[1] - uz * (B.r - INSET)]
  return {
    id: 'cau-' + i, a: ia, b: ib,
    from, to, fromY: A.y, toY: B.y,
    len: Math.hypot(to[0] - from[0], to[1] - from[1]),
    ang: Math.atan2(to[0] - from[0], to[1] - from[1])
  }
})

// Vật cản đặc tại mỗi đảo: chính vật thể nội dung (FR-012).
export const obstacles = islands.map(z => ({ pos: z.pos, r: z.or }))

// FR-012 + OQ-21: mặt đi được của thế giới. Trả về cao độ mặt sàn nếu đứng được,
// ok:false nếu vị trí đó là khoảng không giữa hai đảo.
export function surfaceAt(x, z) {
  for (const is of islands) {
    const d = Math.hypot(x - is.pos[0], z - is.pos[1])
    if (d <= is.r - EDGE_MARGIN) {
      return { ok: true, y: is.y, on: 'dao', id: is.id, edge: (is.r - EDGE_MARGIN) - d }
    }
  }
  for (const b of bridges) {
    const dx = b.to[0] - b.from[0]
    const dz = b.to[1] - b.from[1]
    const L2 = dx * dx + dz * dz
    const t = ((x - b.from[0]) * dx + (z - b.from[1]) * dz) / L2
    if (t < 0 || t > 1) continue
    const px = b.from[0] + dx * t
    const pz = b.from[1] + dz * t
    const off = Math.hypot(x - px, z - pz)
    if (off <= BRIDGE_HALF) {
      return { ok: true, y: bridgeY(b, t), on: 'cau', id: b.id, edge: BRIDGE_HALF - off }
    }
  }
  return { ok: false }
}

export const SPAWN = [islands[0].pos[0] + 3.5, islands[0].y, islands[0].pos[1] + 4.5]
