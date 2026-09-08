# Open Questions: Website portfolio developer dạng thế giới 3D tương tác

**Feature**: `001-3d-world-portfolio` · **Spec version**: 0.2 · **Cập nhật**: 2026-09-08

> **Trạng thái: không còn câu hỏi chặn.** Spec đủ điều kiện chuyển sang `speckit-plan`.

## A. Đã chốt

| ID | Câu hỏi | Quyết định | Ngày | Ảnh hưởng tới spec |
|----|---------|-----------|------|--------------------|
| OQ-01 | Khách liên hệ với chủ portfolio bằng cách nào? | **Chỉ hiển thị địa chỉ thư điện tử và liên kết mạng xã hội công khai** — không có form gửi trên trang | 2026-09-08 | FR-035, FR-036; DEP-06; OOS-10 |
| OQ-02 | Khi thiết bị không hiển thị được thế giới 3D thì cung cấp gì? | **Chế độ 2D đầy đủ toàn bộ nội dung portfolio**, dùng chung nguồn nội dung với thế giới 3D | 2026-09-08 | FR-047; mục 3.15 (FR-073…FR-079); US-10; EC-01, EC-02, EC-19; SC-017; AS-13 |
| OQ-03 | Ngôn ngữ nội dung của phiên bản đầu? | **Song ngữ tiếng Việt và tiếng Anh** | 2026-09-08 | FR-031; mục 3.14 (FR-066…FR-072); US-13; EC-16…EC-18; SC-015, SC-016; AS-12; DEP-08; retire OOS-05; thêm OOS-11 |

## B. Câu hỏi cần xác nhận (non-blocking) — có thể vừa thiết kế vừa chốt

| ID | Câu hỏi | Liên quan |
|----|---------|-----------|
| OQ-04 | Giá trị cụ thể của các ngưỡng định lượng: thời gian tải tối đa chấp nhận được, nhịp hiển thị mục tiêu, dung lượng tối đa của nhóm tài nguyên bắt buộc, cấu hình thiết bị mục tiêu | AS-10, FR-052, FR-054, SC-001, SC-005 |
| OQ-05 | Danh sách khu vực nội dung cuối cùng — ngoài 5 khu vực ở AS-04, có thêm khu vực nào (chứng chỉ, bài viết, sở thích, lời chứng thực) không? | AS-04, FR-016 |
| OQ-06 | Chủ đề và bối cảnh của thế giới (đảo nhỏ, phòng làm việc, thị trấn…) và phong cách hình ảnh | FR-015, DEP-01 |
| OQ-07 | Nguồn tài nguyên 3D: tự dựng, mua bộ có sẵn, hay thuê ngoài? | DEP-01, AS-06 |
| OQ-08 | Số lượng dự án đưa lên và có dự án nào thuộc diện không được công bố (NDA) không? | FR-025, FR-026, DEP-03 |
| OQ-09 | Có sử dụng công cụ đo lường không, đo những chỉ số nào, công bố ra sao? | FR-064, DEP-07, SC-008…SC-010 |
| OQ-10 | Cách chủ portfolio cập nhật nội dung: sửa file cấu hình trong mã nguồn hay dùng một công cụ quản trị riêng? | AS-07, FR-059, FR-060, SC-012 |
| OQ-11 | Cơ chế rà soát liên kết ngoài của dự án bị hỏng (thủ công định kỳ hay tự động cảnh báo) | EC-12, FR-027 |
| OQ-12 | Có nhạc nền không, và trạng thái mặc định là bật hay tắt? | FR-040, FR-041, DEP-02 |
| OQ-13 | Danh sách trình duyệt và phiên bản tối thiểu được hỗ trợ chính thức | FR-005, EC-01 |
| OQ-14 | Ảnh xem trước khi chia sẻ: ảnh tĩnh thiết kế riêng hay ảnh chụp thế giới 3D? Có cần ảnh riêng cho từng ngôn ngữ không? | FR-056, FR-071, SC-013 |
| OQ-15 | Trạng thái "sẵn sàng nhận cơ hội" cập nhật theo tần suất nào và ai chịu trách nhiệm cập nhật? | FR-034 |
| OQ-16 | Ai dịch nội dung và quy trình cập nhật bản dịch khi thêm dự án mới (bắt buộc đủ 2 ngôn ngữ mới được xuất bản, hay cho phép xuất bản thiếu và hiển thị chỉ dấu)? | AS-12, FR-060, FR-070, DEP-08 |
| OQ-17 | Chế độ 2D dùng bố cục nào (một trang cuộn hay nhiều trang) và có bắt buộc khớp phong cách hình ảnh với thế giới 3D không? | FR-073, FR-077 |
| OQ-18 | Địa chỉ thư điện tử công khai có cần biện pháp hạn chế thu thập tự động không? | FR-035, FR-063 |

> OQ-04 không chặn thiết kế kiến trúc nhưng **chặn việc viết test case hiệu năng** cho SC-001 và SC-005.
> OQ-16 không chặn thiết kế nhưng **chặn việc chốt quy tắc xuất bản nội dung** ở FR-060.
