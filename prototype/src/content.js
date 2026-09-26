// Chủ đề thế giới: Đảo trôi trên mây (OQ-06 đã chốt).
// Toạ độ [x, z] tính bằng mét. y = cao độ mặt cỏ của đảo.
// AST-03: đường kính đảo 15–19 m → r = 7,5…9,5. AST-12: cầu dây là lối đi duy nhất.
// top = bán trục mặt cỏ đo từ GLB; đảo Kinh nghiệm hẹp hơn nhiều theo trục z.
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
    id: 'gioi-thieu', model: '/models/islands/AST03a_Island01_Intro.glb', label: { vi: 'Giới thiệu', en: 'About' }, hint: { vi: 'Căn nhà', en: 'The cottage' },
    pos: [-24, 12], r: 9, top: [9, 8.07], y: 0,
    kind: 'house', ir: 4.2, or: 3.3,
    grass: '#8CBE68', rock: '#9E8E7C',
    title: { vi: 'Giới thiệu', en: 'About me' }
  },
  {
    id: 'ky-nang', model: '/models/islands/AST03b_Island02_Skills.glb', label: { vi: 'Kỹ năng', en: 'Skills' }, hint: { vi: 'Xưởng làm việc', en: 'The workshop' },
    pos: [-8, -6], r: 8, top: [6.99, 7.87], y: 2.2,
    kind: 'workshop', ir: 4.0, or: 2.0,
    grass: '#8CBE68', rock: '#9E8E7C',
    title: { vi: 'Kỹ năng', en: 'Skills' }
  },
  {
    id: 'du-an', model: '/models/islands/AST03c_Island03_Projects.glb', label: { vi: 'Dự án', en: 'Projects' }, hint: { vi: 'Khu trưng bày', en: 'The gallery' },
    pos: [10, 10], r: 9.5, top: [9.22, 9.25], y: 0.8,
    kind: 'gallery', ir: 4.6, or: 3.1,
    grass: '#8CBE68', rock: '#9E8E7C',
    title: { vi: 'Dự án', en: 'Projects' }
  },
  {
    id: 'kinh-nghiem', model: '/models/islands/AST03d_Island04_Experience.glb', label: { vi: 'Kinh nghiệm', en: 'Experience' }, hint: { vi: 'Cột mốc', en: 'The milestones' },
    pos: [27, -8], r: 8, top: [8, 4.4], y: 3.0,
    kind: 'monument', ir: 4.0, or: 2.3,
    grass: '#8CBE68', rock: '#9E8E7C',
    title: { vi: 'Kinh nghiệm', en: 'Experience' }
  },
  {
    id: 'lien-he', model: '/models/islands/AST03e_Island05_Contact.glb', label: { vi: 'Liên hệ & CV', en: 'Contact & CV' }, hint: { vi: 'Hòm thư', en: 'The mailbox' },
    pos: [37, 12], r: 7.5, top: [7.5, 7.09], y: 1.2,
    kind: 'mailbox', ir: 3.8, or: 1.5,
    grass: '#8CBE68', rock: '#9E8E7C',
    title: { vi: 'Liên hệ & CV', en: 'Contact & CV' }
  }
]

// AST-12: cầu dây nối hai đảo liền kề theo thứ tự tường thuật.
// Điểm đầu thụt vào trong mặt cỏ để vùng đi được của cầu và của đảo chồng lên nhau,
// tránh khe hở làm nhân vật kẹt ở mép.
const INSET = 1.8
// Bán kính mặt cỏ theo hướng cầu; dùng kích thước top của GLB thay vì bán kính tròn danh nghĩa.
const topRadius = (island, ux, uz) => 1 / Math.hypot(ux / island.top[0], uz / island.top[1])

export const bridges = [[0, 1], [1, 2], [2, 3], [3, 4]].map(([ia, ib], i) => {
  const A = islands[ia], B = islands[ib]
  const dx = B.pos[0] - A.pos[0]
  const dz = B.pos[1] - A.pos[1]
  const d = Math.hypot(dx, dz)
  const ux = dx / d, uz = dz / d
  const ar = topRadius(A, ux, uz) - INSET, br = topRadius(B, ux, uz) - INSET
  const from = [A.pos[0] + ux * ar, A.pos[1] + uz * ar]
  const to   = [B.pos[0] - ux * br, B.pos[1] - uz * br]
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
    const [rx, rz] = is.top
    const d = Math.hypot((x - is.pos[0]) / (rx - EDGE_MARGIN), (z - is.pos[1]) / (rz - EDGE_MARGIN))
    if (d <= 1) {
      return { ok: true, y: is.y, on: 'dao', id: is.id, edge: (1 - d) * Math.min(rx, rz) }
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

export function islandSpawn(island) {
  const distance = island.or + 1.2
  return [island.pos[0] + distance * 0.6, island.y, island.pos[1] + distance * 0.8]
}
export const SPAWN = islandSpawn(islands[0])

/* ============================================================================
   NỘI DUNG PORTFOLIO — nguồn dùng chung cho thế giới 3D và trang 2D (OQ-02, FR-078).
   *** MOCK *** — toàn bộ chữ dưới đây là dữ liệu giữ chỗ để dựng bố cục; chủ portfolio thay bằng nội dung thật.
   Song ngữ (OQ-03): chuỗi viết dạng { vi: '…', en: '…' }; chuỗi thường dùng chung cho cả hai ngôn ngữ.
   ============================================================================ */
const T = (vi, en) => ({ vi, en })

export const profile = {
  name: T('Dat Nguyen', 'Dat Nguyen'),
  role: T('Lập trình viên Frontend', 'Frontend Developer'),
  tagline: T('Tập trung vào frontend, có thêm kỹ năng phát triển backend.',
             'Focused on frontend development, with additional backend skills.'),
  location: T('TP. Hồ Chí Minh', 'Ho Chi Minh City'),
  available: true,                                  // FR-034: trạng thái "sẵn sàng nhận cơ hội"
  avatar: null,                                     // '/img/avatar.jpg' — chưa có thì hiện chữ cái đầu
  cv: null,                                    // FR-033: nút tải CV
  email: null,                         // FR-035: chỉ hiển thị, không có form (OQ-01)
  socials: [] // Add verified profile URLs here.
}

export const zones = {
  'gioi-thieu': {
    intro: [
      T('Tôi là lập trình viên frontend, tập trung vào xây dựng giao diện và trải nghiệm trên web.',
        'I am a frontend developer focused on building web interfaces and experiences.'),
      T('Bên cạnh frontend, tôi cũng có một số kỹ năng phát triển backend.',
        'Alongside frontend development, I also have some backend development skills.')
    ],
    facts: [
      [T('Vai trò chính', 'Primary role'), 'Frontend Developer'],
      [T('Kỹ năng bổ sung', 'Additional skills'), T('Phát triển backend', 'Backend development')]
    ]
  },
  'ky-nang': {
    groups: [
      { name: 'Frontend', items: [T('Phát triển giao diện web', 'Web interface development')] },
      { name: 'Backend', items: [T('Có thêm kỹ năng backend — công nghệ cụ thể sẽ được bổ sung', 'Additional backend skills — specific technologies to be added')] }
    ]
  },
  'du-an': {
    // Chỉ giữ dự án có trong repo; bổ sung dự án thực tế khi chủ portfolio cung cấp.
    projects: [
      { title: T('Portfolio thế giới 3D', '3D world portfolio'), year: '2026', role: 'Frontend',
        summary: T('Portfolio gồm năm hòn đảo tương tác, có nội dung song ngữ và chế độ đọc 2D.',
                   'A portfolio with five interactive islands, bilingual content and a 2D reading mode.'),
        problem: T('Giới thiệu năng lực phát triển web qua một trải nghiệm tương tác mà vẫn cho phép đọc nhanh nội dung.',
                   'Present web development through an interactive experience while keeping the content easy to read.'),
        contribution: T('Dùng React Three Fiber để dựng thế giới, điều khiển nhân vật và camera; dùng chung nội dung giữa 2D và 3D.',
                        'Use React Three Fiber for the world, character controls and camera, with shared content across 2D and 3D.'),
        result: T('Một prototype có năm đảo, hai ngôn ngữ và bản 2D. Chưa có số liệu sử dụng thực tế.',
                  'A working prototype with five islands, two languages and a 2D mode. No live usage metrics yet.'),
        tags: ['React', 'Three.js', 'React Three Fiber'], image: '/og.jpg', url: null, source: null }
    ]
  },
  'kinh-nghiem': {
    // Chưa có thông tin công ty hoặc thời gian làm việc được xác nhận.
    timeline: [
      { from: '…', to: '…', org: T('Thông tin sẽ được bổ sung', 'Details to be added'), title: 'Frontend Developer',
        bullets: [T('Lịch sử làm việc và các đóng góp cụ thể sẽ được cập nhật.',
                    'Work history and specific contributions will be added.')] }
    ]
  },
  'lien-he': {
    note: T('Muốn trao đổi về phát triển frontend hoặc một dự án web? Gửi email hoặc kết nối qua LinkedIn.',
            'Want to discuss frontend development or a web project? Send an email or connect on LinkedIn.')
  }
}

// Thẻ chia sẻ / SEO (AST-19, FR-056) — index.html dùng bản tĩnh; giữ ở đây để đồng bộ khi đổi nội dung
export const seo = {
  title: T('Dat Nguyen — Portfolio 3D', 'Dat Nguyen — 3D Portfolio'),
  description: T('Portfolio lập trình viên frontend dạng thế giới 3D: 5 hòn đảo trôi trên mây, mỗi đảo một chương — giới thiệu, kỹ năng, dự án, kinh nghiệm, liên hệ.',
                 'A frontend developer portfolio as a 3D world: five floating islands, one chapter each — about, skills, projects, experience, contact.')
}
