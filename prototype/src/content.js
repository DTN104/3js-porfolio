// Nội dung tạm cho spike. Bản thật nạp từ nguồn cấu hình tách rời (AS-07, FR-059).
// Toạ độ [x, z] trên mặt phẳng thế giới; r = bán kính vùng kích hoạt (FR-016, FR-017).

export const WORLD_RADIUS = 26

export const zones = [
  {
    id: 'gioi-thieu',
    label: 'Giới thiệu',
    hint: 'Căn nhà',
    pos: [-9, -7],
    r: 3.6,
    color: '#c9d3e8',
    roof: '#a2563f',
    kind: 'house',
    title: 'Giới thiệu',
    body: [
      'Đây là khu vực giới thiệu bản thân — tên, vai trò nghề nghiệp và mô tả ngắn.',
      'Nội dung trong prototype là văn bản tạm. Bản thật lấy từ nguồn cấu hình, cùng nguồn với chế độ 2D (FR-078).'
    ],
    meta: [['Vật thể', 'AST-06'], ['Requirement', 'FR-016, FR-023']]
  },
  {
    id: 'du-an',
    label: 'Dự án',
    hint: 'Khu trưng bày',
    pos: [10, -4],
    r: 3.8,
    color: '#b9c4a8',
    roof: '#7d8a63',
    kind: 'gallery',
    title: 'Dự án',
    body: [
      'Một vật thể chung cho toàn bộ danh sách dự án — mặt trưng bày để trống, số lượng dự án đổi mà không phải dựng lại model.',
      'Đây chính là phương án đang khuyến nghị ở OQ-19; prototype dựng theo hướng này để thấy nó có đủ sức nặng thị giác không.'
    ],
    meta: [['Vật thể', 'AST-08'], ['Câu hỏi', 'OQ-19'], ['Requirement', 'FR-025, FR-059']]
  },
  {
    id: 'lien-he',
    label: 'Liên hệ & CV',
    hint: 'Hòm thư',
    pos: [2, 9],
    r: 3.2,
    color: '#cbb89a',
    roof: '#8d6f4a',
    kind: 'mailbox',
    title: 'Liên hệ & CV',
    body: [
      'Hiển thị thư điện tử và liên kết mạng xã hội, kèm nút tải CV.',
      'Không có form gửi trên trang — đã chốt ở OQ-01.'
    ],
    meta: [['Vật thể', 'AST-10'], ['Requirement', 'FR-032, FR-033, FR-035']]
  }
]

// Vật cản đặc (FR-012). Vùng kích hoạt rộng hơn thân vật thể để còn chỗ đứng.
export const obstacles = zones.map(z => ({ pos: z.pos, r: z.r * 0.42 }))
