# Open Questions: Website portfolio developer dạng thế giới 3D tương tác

**Feature**: `001-3d-world-portfolio` · **Spec version**: 0.3 · **Cập nhật**: 2026-09-25

> **Trạng thái: không còn câu hỏi chặn.** Spec đủ điều kiện chuyển sang `speckit-plan`.

## A. Đã chốt

| ID | Câu hỏi | Quyết định | Ngày | Ảnh hưởng tới spec |
|----|---------|-----------|------|--------------------|
| OQ-01 | Khách liên hệ với chủ portfolio bằng cách nào? | **Chỉ hiển thị địa chỉ thư điện tử và liên kết mạng xã hội công khai** — không có form gửi trên trang | 2026-09-08 | FR-035, FR-036; DEP-06; OOS-10 |
| OQ-02 | Khi thiết bị không hiển thị được thế giới 3D thì cung cấp gì? | **Chế độ 2D đầy đủ toàn bộ nội dung portfolio**, dùng chung nguồn nội dung với thế giới 3D | 2026-09-08 | FR-047; mục 3.15 (FR-073…FR-079); US-10; EC-01, EC-02, EC-19; SC-017; AS-13 |
| OQ-03 | Ngôn ngữ nội dung của phiên bản đầu? | **Song ngữ tiếng Việt và tiếng Anh** | 2026-09-08 | FR-031; mục 3.14 (FR-066…FR-072); US-13; EC-16…EC-18; SC-015, SC-016; AS-12; DEP-08; retire OOS-05; thêm OOS-11 |
| OQ-06 | Chủ đề và bối cảnh của thế giới? | **Đảo trôi trên mây** — 4–5 mảnh đảo lơ lửng nối bằng cầu, mỗi mảnh một khu vực nội dung | 2026-09-11 | Toàn bộ mục 2 và 3 của `assets-3d.md`; khối STYLE và các prompt AST-03, AST-04, AST-12 trong `asset-prompts.md`; thêm AST-21; mở OQ-21 |
| OQ-07 | Nguồn tài nguyên 3D? | ~~Pack CC0 làm nền + sinh riêng 5 vật thể (11/09, đề xuất mặc định)~~ → **Toàn bộ dựng bằng Blender qua MCP** (chủ portfolio chốt 2026-09-24) | 2026-09-24 | Cột "nguồn" và mục 6 `assets-3d.md`; bảng tra nhanh, mục 2.1, AST-01, AST-13 trong `asset-prompts.md`; AS-06 |
| OQ-22 | Gốc toạ độ của model đảo đặt ở đâu? | **Mặt cỏ tại Y=0**, khối đá nằm ở Y âm; code đặt đảo, nhân vật, cầu, prop đều ở y=0 (xem `OQ-22-minh-hoa.png`) | 2026-09-13 | Sửa nghiệm thu `asset-prompts.md` mục 6 #3 ("Đáy nằm đúng Y=0" → "Mặt cỏ nằm đúng Y=0"); giữ bảng SCALE 3.4; AST-03, AST-04, AST-12 không phải dựng lại |
| OQ-24 | Kích thước texture có tách ngưỡng theo loại model không? | **Có, tách 2 mức**: 1024×1024 cho model nhiều chi tiết (AST-03 đảo, AST-01 nhân vật); 256×256 cho model màu phẳng (AST-04 mép, AST-13 prop). Vật thể tương tác AST-06…10 dùng 512×512 | 2026-09-13 | `asset-prompts.md` mục 3.2 TECH (sửa câu "one 1024x1024"); OQ-04, OQ-20 |
| OQ-30 | Bảng màu cho vật thể tương tác chưa có trong PALETTE? | **Cho phép dùng thêm màu ngoài PALETTE** cho AST-06…10: terracotta `#A2563F`, cream `#EDE4D4`, kính `#B9DAEC`, cờ `#C2334D`, cork `#C9A66B`, kim loại `#8794A1`, đèn `#FFE9B8` | 2026-09-13 | Bổ sung nhóm "màu vật thể tương tác" vào `asset-prompts.md` mục 3.5; nghiệm thu mục 6 #5 so theo bảng đã mở rộng |
| OQ-31 | Hướng mặt trước của vật thể tương tác? | **Cố định quay về camera (+Z)** cho cả 5 vật thể, không quay theo cầu | 2026-09-13 | Sửa nghiệm thu AST-06 #2 ("hướng ra phía đường đi" → "hướng về camera"); AST-06…10; SC-002 |

> **Ghi chú về OQ-06**: chủ portfolio nêu rõ không có ưu tiên; câu này do Claude đề xuất và chốt mặc định để công việc đi tiếp — lật lại lúc nào cũng được. OQ-07 ban đầu cũng là mặc định của Claude, đến 2026-09-24 chủ portfolio đã duyệt phương án Blender.

## B. Câu hỏi cần xác nhận (non-blocking) — có thể vừa thiết kế vừa chốt

| ID | Câu hỏi | Liên quan |
|----|---------|-----------|
| OQ-04 | Giá trị cụ thể của các ngưỡng định lượng: thời gian tải tối đa chấp nhận được, nhịp hiển thị mục tiêu, dung lượng tối đa của nhóm tài nguyên bắt buộc, cấu hình thiết bị mục tiêu **Số đo 2026-09-25** (Xiaomi 13 — máy cấu hình cao, chưa đại diện tầm trung; Chrome, khung 785×1450 @2x, Wi‑Fi LAN, Vite dev): **61 fps · 78 draw call · 205k tam giác · tải asset 0,4 s**; toàn bộ .glb + panorama ≈ 2,3 MB. **Khuyến nghị ngưỡng** (chưa duyệt): FPS ≥ 30 trên điện thoại tầm trung, tải nhóm bắt buộc ≤ 3 s trên 4G (2,3 MB ≈ 2 s ở 10 Mbps), ngân sách dung lượng ≤ 5 MB, thiết bị mục tiêu = điện thoại Android/iPhone 3–4 năm tuổi. Chưa đo trên 4G và trên bản build production | AS-10, FR-052, FR-054, SC-001, SC-005 |
| OQ-05 | Danh sách khu vực nội dung cuối cùng — ngoài 5 khu vực ở AS-04, có thêm khu vực nào (chứng chỉ, bài viết, sở thích, lời chứng thực) không? | AS-04, FR-016 |
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
| OQ-19 | Khu vực dự án dùng **một** vật thể tương tác chung, hay **mỗi dự án một** model riêng trong thế giới? | FR-016, FR-025, FR-059, BO-05, SC-012, AST-08 |
| OQ-20 | Chiến lược mức chi tiết (LOD): dựng nhiều biến thể cho mỗi model, hay làm low-poly một mức duy nhất đủ nhẹ? | FR-053, FR-054, AST-13, AST-14 |
| OQ-21 | Nhân vật đi tới mép đảo thì xử lý thế nào — rào chắn thấp ở mép, đẩy nhân vật lại, hay cho rơi rồi đưa về vị trí cũ? Chủ đề đảo trôi làm ranh giới thế giới trở thành vực thẳm chứ không còn là bờ nước | FR-012, FR-014, FR-015, AST-04, EC-07 |
| OQ-23 | **Nghiệm thu màu so ở đâu** — trên texture hay trên màn hình khi chạy? Mục 6 #5 chỉ ghi *"so mã màu, không chấp nhận màu tự pha"*. Bộ AST-03 có texture đúng chính xác 4 mã PALETTE nhưng lên prototype chân đá đọc ra nâu ô-liu, do `hemisphereLight` đang lấy ground color `#6B9A4C` hắt xanh lên mọi mặt hướng xuống | `asset-prompts.md` mục 3.5, mục 6 #5; AST-03, AST-15 |
| OQ-25 | **Phân biệt 5 đảo bằng gì?** Mục 4.3 muốn mỗi đảo một dáng riêng để khách nhận ra vị trí, nhưng 4/5 đặc điểm mô tả (raised shoulder, flat plateau, two terraces, rounded knoll) đều nằm ở độ nổi mặt trên — mà ràng buộc nghiệm thu #1 khoá độ nổi ở 0,25 m, tức 1,4% đường kính, mắt không thấy. Bản dựng hiện tại chuyển việc phân biệt xuống **khối đá dưới đáy** (không ai đi lên nên không dính trần); cần xác nhận hướng này hoặc nới trần cho vùng ngoài lối đi | `asset-prompts.md` mục 4.3, mục 6 #1 và #8; AST-03, FR-015 |
| OQ-26 | **Viền mép đảo do model hay do code vẽ?** Model AST-03 đã bake sẵn một vành cỏ đậm `#6B9A4C` ở rìa mặt trên; prototype lại vẽ thêm một `ringGeometry` cùng màu cho AST-04. Hai thứ đang làm cùng một việc — giữ cái nào | AST-03, AST-04; FR-015; OQ-21 |
| OQ-27 | **Viền mép đi theo cung tròn hay theo viền bầu dục của đảo?** Nghiệm thu #1 của AST-04 ghi *"ghép nối tiếp nhau không hở khe trên cung tròn bán kính 7,5–9,5 m"*, nhưng không đảo nào tròn — AST-03a là 18,00 × 16,14 m, bán kính cong thực chạy từ 7,2 m ở đầu trục dài tới 10,0 m ở đầu trục ngắn. Xếp theo bán kính cố định thì chỗ trục ngắn mảnh mép lòi hẳn ra khỏi mặt cỏ. Bản dựng hiện tại đi theo viền bầu dục và chia đều lại bước để khép kín (bước thực 3,02 m thay vì đúng 3,00 m) | `asset-prompts.md` mục 4.4 nghiệm thu #1; AST-03, AST-04; FR-015 |
| OQ-28 | **Màu nhân vật ngoài PALETTE và danh tính nhân vật.** Bản dựng AST-01 dùng áo `#E08B45` đúng quy tắc mục 3.5, quần `#6E6255`, giày `#7A5636` — nhưng **da `#E9C9A8`, tóc `#3B3230`, kính `#2B2B2B` không có trong bảng màu**, đang lấy theo prototype cũ. Cần bổ sung vào mục 3.5 nếu duyệt. Kèm câu hỏi đã nêu inline ở 4.1: nhân vật có cần giống chủ portfolio không, hay ẩn danh — quyết định này đổi cả kiểu tóc/kính/trang phục | `asset-prompts.md` mục 3.5, 4.1; AST-01; FR-007 |
| OQ-29 | **Tốc độ di chuyển vs tốc độ clip.** Prototype đi 4,6 m/s, chạy 9,2 m/s; clip Walk/Run dựng theo 4.2 phải phát nhanh ×1,7 / ×1,6 mới không trượt chân rõ. Mục 4.2 đã ghi "Đề xuất thay đổi" nhưng chưa có OQ để chốt: hạ tốc độ prototype, hay chấp nhận phát nhanh clip | `asset-prompts.md` mục 4.2; AST-02; FR-009, FR-013 |

> OQ-04 không chặn thiết kế kiến trúc nhưng **chặn việc viết test case hiệu năng** cho SC-001 và SC-005.
> OQ-16 không chặn thiết kế nhưng **chặn việc chốt quy tắc xuất bản nội dung** ở FR-060.
> OQ-19 không chặn kiến trúc nhưng **chặn việc chốt khối lượng dựng model** ở `assets-3d.md`; khuyến nghị chọn một vật thể chung để giữ được BO-05.

> **Nguồn của OQ-22…OQ-31**: phát hiện trong lúc dựng thật bộ 5 đảo AST-03, bộ prop AST-13, bộ mép AST-04, 4 cầu AST-12, nhân vật AST-01/02 và blockout 5 vật thể AST-06…10 bằng Blender, rồi nối `.glb` vào prototype (2026-09-12). Đây là các chỗ **tài liệu tự mâu thuẫn hoặc chưa đủ rõ để nghiệm thu**, không phải đề xuất đổi phạm vi. Không cái nào chặn việc dựng tiếp asset; OQ-24, OQ-30, OQ-31 đã chốt ngày 2026-09-13 (chuyển lên mục A). OQ-22 chốt cùng ngày (phương án mặt cỏ tại Y=0).
