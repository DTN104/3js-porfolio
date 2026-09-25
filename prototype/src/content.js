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
    id: 'gioi-thieu', model: '/models/islands/AST03a_Island01_Intro.glb', label: { vi: 'Giới thiệu', en: 'About' }, hint: { vi: 'Căn nhà', en: 'The cottage' },
    pos: [-24, 12], r: 9, y: 0,
    kind: 'house', ir: 4.2, or: 3.3,
    grass: '#8CBE68', rock: '#9E8E7C',
    title: { vi: 'Giới thiệu', en: 'About me' }
  },
  {
    id: 'ky-nang', model: '/models/islands/AST03b_Island02_Skills.glb', label: { vi: 'Kỹ năng', en: 'Skills' }, hint: { vi: 'Xưởng làm việc', en: 'The workshop' },
    pos: [-8, -6], r: 8, y: 2.2,
    kind: 'workshop', ir: 4.0, or: 2.0,
    grass: '#8CBE68', rock: '#9E8E7C',
    title: { vi: 'Kỹ năng', en: 'Skills' }
  },
  {
    id: 'du-an', model: '/models/islands/AST03c_Island03_Projects.glb', label: { vi: 'Dự án', en: 'Projects' }, hint: { vi: 'Khu trưng bày', en: 'The gallery' },
    pos: [10, 10], r: 9.5, y: 0.8,
    kind: 'gallery', ir: 4.6, or: 3.1,
    grass: '#8CBE68', rock: '#9E8E7C',
    title: { vi: 'Dự án', en: 'Projects' }
  },
  {
    id: 'kinh-nghiem', model: '/models/islands/AST03d_Island04_Experience.glb', label: { vi: 'Kinh nghiệm', en: 'Experience' }, hint: { vi: 'Cột mốc', en: 'The milestones' },
    pos: [27, -8], r: 8, y: 3.0,
    kind: 'monument', ir: 4.0, or: 2.3,
    grass: '#8CBE68', rock: '#9E8E7C',
    title: { vi: 'Kinh nghiệm', en: 'Experience' }
  },
  {
    id: 'lien-he', model: '/models/islands/AST03e_Island05_Contact.glb', label: { vi: 'Liên hệ & CV', en: 'Contact & CV' }, hint: { vi: 'Hòm thư', en: 'The mailbox' },
    pos: [37, 12], r: 7.5, y: 1.2,
    kind: 'mailbox', ir: 3.8, or: 1.5,
    grass: '#8CBE68', rock: '#9E8E7C',
    title: { vi: 'Liên hệ & CV', en: 'Contact & CV' }
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

/* ============================================================================
   NỘI DUNG PORTFOLIO — nguồn dùng chung cho thế giới 3D và trang 2D (OQ-02, FR-078).
   *** MOCK *** — toàn bộ chữ dưới đây là dữ liệu giữ chỗ để dựng bố cục; chủ portfolio thay bằng nội dung thật.
   Song ngữ (OQ-03): chuỗi viết dạng { vi: '…', en: '…' }; chuỗi thường dùng chung cho cả hai ngôn ngữ.
   ============================================================================ */
const T = (vi, en) => ({ vi, en })

export const profile = {
  name: T('Tên Của Bạn', 'Your Name'),
  role: T('Business Analyst · Fintech & Chứng khoán', 'Business Analyst · Fintech & Securities'),
  tagline: T('Biến yêu cầu nghiệp vụ thành sản phẩm số dùng được — từ BRD tới bàn giao và kiểm thử.',
             'Turning business needs into working digital products — from BRD to hand-off and testing.'),
  location: T('TP. Hồ Chí Minh', 'Ho Chi Minh City'),
  available: true,                                  // FR-034: trạng thái "sẵn sàng nhận cơ hội"
  avatar: null,                                     // '/img/avatar.jpg' — chưa có thì hiện chữ cái đầu
  cv: '/cv.pdf',                                    // FR-033: nút tải CV
  email: 'you@example.com',                         // FR-035: chỉ hiển thị, không có form (OQ-01)
  socials: [                                        // FR-036
    { label: 'LinkedIn', url: 'https://linkedin.com/in/your-handle' },
    { label: 'GitHub', url: 'https://github.com/your-handle' }
  ]
}

export const zones = {
  'gioi-thieu': {
    intro: [
      T('Tôi là Business Analyst với nhiều năm làm việc trong ngành chứng khoán, đứng giữa đội nghiệp vụ, đội phát triển và hạ tầng để đưa yêu cầu đi từ ý tưởng tới tính năng chạy thật.',
        'I am a Business Analyst with years in the securities industry, sitting between business, engineering and infrastructure teams to take requirements from idea to a feature that actually ships.'),
      T('Thế mạnh của tôi là mô hình hoá quy trình, viết tài liệu yêu cầu rõ ràng và theo sát tới lúc kiểm thử — gần đây tập trung vào các sản phẩm ứng dụng AI cho phân tích đầu tư.',
        'My strengths are process modelling, clear requirement documents and staying with a feature through testing — lately focused on AI products for investment research.')
    ],
    facts: [
      [T('Kinh nghiệm', 'Experience'), T('7+ năm', '7+ years')],
      [T('Lĩnh vực', 'Domain'), T('Chứng khoán · Fintech', 'Securities · Fintech')],
      [T('Vai trò', 'Roles'), 'BA · Product'],
      [T('Ngôn ngữ', 'Languages'), T('Tiếng Việt · English', 'Vietnamese · English')]
    ]
  },
  'ky-nang': {
    groups: [
      { name: T('Phân tích nghiệp vụ', 'Business analysis'), items: ['BRD / SRS', T('User Story & AC', 'User stories & AC'), 'BPMN', 'Sequence diagram', 'Traceability matrix'] },
      { name: T('Sản phẩm & dữ liệu', 'Product & data'), items: ['SQL', 'BigQuery', T('Python (cơ bản)', 'Python (basic)'), 'Dashboard', T('Kiểm thử UAT', 'UAT')] },
      { name: T('AI ứng dụng', 'Applied AI'), items: ['Prompt design', T('Đánh giá chatbot', 'Chatbot evaluation'), T('Pipeline sinh báo cáo', 'Report-generation pipeline'), 'MCP / tool use'] },
      { name: T('Nghiệp vụ chứng khoán', 'Securities domain'), items: [T('Giao dịch & lưu ký', 'Trading & custody'), 'Corporate action', T('KYC / tuân thủ', 'KYC / compliance'), T('Vận hành hệ thống', 'System operations')] }
    ]
  },
  'du-an': {
    // FR-026/027: image = '/img/xxx.jpg' (chưa có thì hiện năm); url = bản chạy thử, source = mã nguồn — null thì không hiển thị
    projects: [
      { title: T('Cổng thông báo quyền cổ đông tự động', 'Automated corporate-action notifications'), year: '2025', role: T('BA chính', 'Lead BA'),
        summary: T('Hệ thống gửi email + cổng web thông báo corporate action cho khách hàng tổ chức, thay quy trình thủ công.',
                   'Email + web portal notifying institutional clients of corporate actions, replacing a manual process.'),
        tags: ['BRD', 'BPMN', 'Email automation'], image: null, url: null, source: null },
      { title: T('Trợ lý AI sinh báo cáo phân tích cổ phiếu', 'AI assistant for equity research reports'), year: '2025', role: 'BA · Prompt design',
        summary: T('Pipeline lấy dữ liệu tài chính, sinh báo cáo theo mẫu và đánh giá chất lượng đầu ra.',
                   'Pipeline that pulls financial data, generates templated reports and scores output quality.'),
        tags: ['AI', 'BigQuery', T('Đánh giá chất lượng', 'Quality evaluation')], image: null, url: null, source: null },
      { title: T('Giao dịch thoả thuận trên ứng dụng di động', 'Negotiated trading on the mobile app'), year: '2024', role: 'BA',
        summary: T('Bổ sung luồng đặt lệnh thoả thuận cho app: yêu cầu, quy tắc nghiệp vụ, thiết kế cùng UX, test case.',
                   'Added a negotiated-order flow to the app: requirements, business rules, design with UX, test cases.'),
        tags: ['Mobile', 'User Story', 'UAT'], image: null, url: null, source: null }
    ]
  },
  'kinh-nghiem': {
    timeline: [
      { from: '2023', to: T('nay', 'now'), org: T('Công ty Chứng khoán A', 'Securities Company A'), title: T('Business Analyst · Khối CNTT', 'Business Analyst · IT Division'),
        bullets: [T('Chủ trì yêu cầu cho các sản phẩm khách hàng tổ chức và AI', 'Owned requirements for institutional-client and AI products'),
                  T('Điều phối nghiệp vụ – phát triển – hạ tầng', 'Coordinated business, engineering and infrastructure')] },
      { from: '2019', to: '2023', org: T('Sở Giao dịch Chứng khoán B', 'Stock Exchange B'), title: T('Chuyên viên vận hành hệ thống giao dịch', 'Trading-system operations specialist'),
        bullets: [T('Vận hành, điều phối UAT hệ thống giao dịch', 'Operated the trading system and coordinated UAT'),
                  T('Xử lý dữ liệu sau giao dịch', 'Post-trade data processing')] },
      { from: '2017', to: '2019', org: T('Công ty C', 'Company C'), title: T('Chuyên viên phân tích', 'Analyst'),
        bullets: [T('Bắt đầu với phân tích quy trình và báo cáo', 'Started with process analysis and reporting')] }
    ]
  },
  'lien-he': {
    note: T('Muốn trao đổi về BA, sản phẩm fintech hay ứng dụng AI trong đầu tư? Gửi email hoặc kết nối qua LinkedIn.',
            'Want to talk BA, fintech products or AI in investing? Send an email or connect on LinkedIn.')
  }
}

// Thẻ chia sẻ / SEO (AST-19, FR-056) — index.html dùng bản tĩnh; giữ ở đây để đồng bộ khi đổi nội dung
export const seo = {
  title: T('Tên Của Bạn — Portfolio 3D', 'Your Name — 3D Portfolio'),
  description: T('Portfolio Business Analyst dạng thế giới 3D: 5 hòn đảo trôi trên mây, mỗi đảo một chương — giới thiệu, kỹ năng, dự án, kinh nghiệm, liên hệ.',
                 'A Business Analyst portfolio as a 3D world: five floating islands, one chapter each — about, skills, projects, experience, contact.')
}
