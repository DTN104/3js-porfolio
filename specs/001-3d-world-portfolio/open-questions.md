# Open Questions: Website portfolio developer dạng thế giới 3D tương tác

**Feature**: `001-3d-world-portfolio` · **Spec version**: 0.1 · **Cập nhật**: 2026-09-08

> **Trạng thái: còn 3 câu hỏi chặn (OQ-01, OQ-02, OQ-03).** Cần chốt trước khi chuyển sang `speckit-plan`.

## A. Câu hỏi chặn — phải chốt trước khi thiết kế

| ID | Câu hỏi | Phương án | Ảnh hưởng | Liên quan |
|----|---------|-----------|-----------|-----------|
| OQ-01 | Khách liên hệ với chủ portfolio bằng cách nào? | (a) Chỉ hiển thị thư điện tử và liên kết mạng xã hội; (b) Có form nhập và gửi trực tiếp trên trang | (a) phạm vi nhỏ nhất, không phát sinh xử lý dữ liệu cá nhân, không cần dịch vụ phía sau. (b) tăng tỷ lệ liên hệ nhưng kéo theo dịch vụ nhận thư, chống spam, thông báo kết quả gửi và nghĩa vụ xử lý dữ liệu cá nhân | FR-035, FR-036, FR-063, FR-065, DEP-06, SC-010 |
| OQ-02 | Khi thiết bị không hiển thị được thế giới 3D thì cung cấp gì? | (a) Một phiên bản 2D đầy đủ toàn bộ nội dung portfolio; (b) Chỉ thông báo kèm liên kết tải CV và kênh liên hệ | (a) bảo vệ được BO-03, BO-04 và SC-007 với mọi nhóm khách, nhưng nhân đôi bề mặt nội dung phải xây và bảo trì. (b) chi phí thấp, chấp nhận mất phần lớn giá trị với nhóm khách thiết bị yếu | FR-047, FR-057, SC-006, SC-007, EC-01 |
| OQ-03 | Ngôn ngữ nội dung của phiên bản đầu? | (a) Tiếng Anh; (b) Tiếng Việt | (a) hướng tới nhà tuyển dụng và khách hàng quốc tế. (b) hướng tới thị trường trong nước. Chọn cả hai đồng nghĩa với việc đưa đa ngôn ngữ ra khỏi Out of Scope (OOS-05), làm tăng phạm vi nội dung và kiểm thử | FR-031, OOS-05 |

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
| OQ-14 | Ảnh xem trước khi chia sẻ: ảnh tĩnh thiết kế riêng hay ảnh chụp thế giới 3D? | FR-056, SC-013 |
| OQ-15 | Trạng thái "sẵn sàng nhận cơ hội" cập nhật theo tần suất nào và ai chịu trách nhiệm cập nhật? | FR-034 |
