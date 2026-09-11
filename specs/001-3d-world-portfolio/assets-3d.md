# Danh mục tài nguyên 3D & media: 001-3d-world-portfolio

**Feature**: `001-3d-world-portfolio` · **Version**: 0.2 · **Ngày**: 2026-09-11
**Nguồn**: dẫn xuất từ `spec.md` v0.3, chủ đề theo OQ-06 · **Phục vụ**: DEP-01, DEP-02, DEP-03; đầu vào cho `speckit-plan`

## 1. Cách đọc danh mục này

- **Chủ đề đã chốt (OQ-06, 11/09/2026): đảo trôi trên mây.** Thế giới gồm 4–5 mảnh đảo lơ lửng, mỗi mảnh mang một khu vực nội dung, nối nhau bằng cầu. Cột "Ví dụ" giờ là mô tả thật, không còn là giả định.
- **Nguồn tài nguyên đã chốt (OQ-07): pack CC0 làm nền + sinh riêng 5 vật thể tương tác.** Cột "Nguồn" ghi rõ từng asset lấy từ đâu.
- Hai quyết định trên do Claude đề xuất và chốt mặc định vì chủ portfolio không nêu ưu tiên — xem ghi chú trong `open-questions.md`.
- Cột "Truy vết" chỉ tới requirement trong `spec.md` làm phát sinh tài nguyên đó. Tài nguyên không truy vết được về requirement nào thì không thuộc phạm vi phiên bản đầu.
- Cột "Bắt buộc" = thiếu thì không đáp ứng được requirement đã chốt.
- Danh mục này **không** quyết định nguồn tài nguyên (tự dựng / mua pack / thuê ngoài) — xem OQ-07.
- Prompt dựng cho từng model nằm ở file riêng: `asset-prompts.md`.

## 2. Nhóm 1 — Bắt buộc: thiếu là thế giới không vận hành được

| Mã | Tài nguyên | Số lượng | Bắt buộc | Truy vết | Ví dụ / Ghi chú |
|----|-----------|----------|:--------:|----------|-----------------|
| AST-01 | Mô hình nhân vật điều khiển được (có rig) | 1 | Có | FR-007, FR-009 | Nhân vật duy nhất; không có tùy biến ngoại hình |
| AST-02 | Bộ hoạt ảnh nhân vật: đứng yên, đi, chạy | 3 clip | Có | FR-009 | Đúng 3 trạng thái spec yêu cầu; các clip khác là tùy chọn |
| AST-03 | Mảnh đảo lơ lửng | 4–5 | Có | FR-015 | Mỗi mảnh 14–18 m, mặt trên phẳng đi được, đáy thuôn xuống thành khối đá. **Chủ đề đảo trôi bỏ được địa hình 60×60 m** — đây là phần nhẹ đi nhiều nhất so với phương án đảo liền. Nguồn: dựng riêng hoặc cắt từ nature pack |
| AST-04 | Mép đảo | 1 bộ | Có | FR-015, FR-012 | Với chủ đề đảo trôi, mép đảo **tự nó đã là ranh giới nhận biết được** — dưới là khoảng không. Cần thêm dấu hiệu vật lý (rào cọc thấp, bụi cây viền, gờ đá) để khách không vô tình bước hụt. **Cách xử lý khi chạm mép còn treo ở OQ-21** |
| AST-05 | Hình học va chạm (collision) cho địa hình và vật thể đặc | 1 bộ | Có | FR-012, FR-014 | Không hiển thị nhưng vẫn phải dựng, kiểm thử và bảo trì cùng với model |
| AST-06 | Vật thể tương tác — khu vực **giới thiệu** | 1 | Có | FR-016, FR-023 | Ví dụ: căn nhà, biển hiệu tên |
| AST-07 | Vật thể tương tác — khu vực **kỹ năng** | 1 | Có | FR-016, FR-024 | Ví dụ: bàn làm việc, xưởng, tủ đồ nghề |
| AST-08 | Vật thể tương tác — khu vực **dự án** | 1 (xem OQ-19) | Có | FR-016, FR-025 | Ví dụ: khu trưng bày. Số lượng phụ thuộc quyết định ở OQ-19 |
| AST-09 | Vật thể tương tác — khu vực **kinh nghiệm** | 1 | Có | FR-016, FR-029 | Ví dụ: con đường mốc thời gian, cụm cột mốc |
| AST-10 | Vật thể tương tác — khu vực **liên hệ & CV** | 1 | Có | FR-016, FR-032, FR-033 | Ví dụ: hòm thư, bảng tin |
| AST-11 | Chỉ dấu trực quan khi vào phạm vi tương tác | 1–2 | Có | FR-017 | Vòng sáng dưới chân vật thể, icon thao tác nổi. Làm bằng shader/sprite được, **không bắt buộc là model 3D** |

## 3. Nhóm 2 — Cần để thế giới không trống và dẫn được hướng người dùng

| Mã | Tài nguyên | Số lượng | Bắt buộc | Truy vết | Ghi chú |
|----|-----------|----------|:--------:|----------|---------|
| AST-12 | Cầu nối giữa các mảnh đảo | 3–4 | Có | FR-015, FR-012, SC-002, SC-003 | **Quan trọng hơn hẳn so với phương án đảo liền**: đây là lối đi *duy nhất* giữa các khu vực, nên vừa dẫn hướng vừa là nút thắt điều hướng. Cầu ván gỗ có tay vịn dây, 6–9 m mỗi cây |
| AST-13 | Prop trang trí không tương tác | 15–30 model, dùng lặp lại | Không (chất lượng) | FR-015 | Cây, đá, cỏ, hàng rào, đèn, cầu, mặt nước… Tốn công nhất nhưng dễ mua pack nhất |
| AST-14 | Skybox / HDRI và thiết lập ánh sáng | 1 bộ | Có | FR-015, FR-053 | Quyết định phần lớn "chất" hình ảnh; ảnh hưởng ngân sách dung lượng ở FR-054 |
| AST-21 | Lớp mây nền bên dưới các đảo | 1 bộ | Có | FR-015 | Phát sinh từ chủ đề đảo trôi: khoảng không giữa và dưới các đảo phải có thứ gì đó, nếu không thế giới trông như bị thủng. 3–5 khối mây tròn, trôi chậm |

## 4. Nhóm 3 — Tài nguyên đi kèm, không phải model 3D

| Mã | Tài nguyên | Số lượng | Bắt buộc | Truy vết | Ghi chú |
|----|-----------|----------|:--------:|----------|---------|
| AST-15 | Texture / material cho toàn bộ model | theo model | Có | FR-054 | Tính vào ngân sách dung lượng của nhóm tài nguyên bắt buộc |
| AST-16 | Ảnh minh họa dự án | ≥ 1 ảnh / dự án | Có | FR-026 | Do chủ portfolio cung cấp (DEP-03) |
| AST-17 | Nhạc nền | 1 track | Có | FR-040, DEP-02 | Trạng thái mặc định bật hay tắt còn treo ở OQ-12 |
| AST-18 | Hiệu ứng âm thanh tương tác | — | **Không** | — | Spec chưa yêu cầu; chỉ bổ sung nếu chủ portfolio quyết định thêm |
| AST-19 | Ảnh xem trước khi chia sẻ liên kết | 1–2 | Có | FR-056, FR-071 | Ảnh tĩnh riêng hay ảnh chụp thế giới, và có cần ảnh riêng cho từng ngôn ngữ — treo ở OQ-14 |
| AST-20 | Thiết kế UI 2D: bảng nội dung, nút, icon thao tác, bộ điều khiển cảm ứng | 1 bộ | Có | FR-021, FR-037, FR-039, FR-044, FR-067 | Là thiết kế giao diện, **không phải model 3D** |

## 5. Không thuộc phạm vi dựng model 3D

| Hạng mục | Lý do |
|----------|-------|
| Giao diện chế độ 2D (FR-073…FR-079) | Dùng chung nguồn nội dung với thế giới 3D (AS-13, FR-078); không cần tài nguyên 3D riêng |
| Mô hình cho từng nhân vật phụ / NPC | Spec không có NPC |
| Tài nguyên cho nhiều màn hoặc nhiều tầng | AS-08: thế giới là một không gian duy nhất |
| Tùy biến ngoại hình nhân vật | Không có requirement |

## 6. Tổng hợp khối lượng

| Nhóm | Số model 3D | Nguồn (OQ-07) |
|------|-------------|---------------|
| Vật thể tương tác đặc thù | 5 | **Sinh riêng** — AST-06…AST-10, đây là phần mang bản sắc |
| Nhân vật + hoạt ảnh | 1 + 3 clip | **Pack CC0** — Quaternius (nhân vật stylized + Universal Animation Library, CC0) |
| Mảnh đảo, mép đảo, cầu, mây | ~10 | **Dựng riêng** — hình khối đơn giản, không cần pack |
| Prop trang trí | 15–30, dùng lặp | **Pack CC0** — Quaternius Stylized Nature MegaKit, Kenney Nature Kit |
| Hình học va chạm | 1 bộ | Sinh từ hình học trên |
| **Tổng ước tính** | **~30–45 model**, trong đó **chỉ 5 cái thực sự phải làm riêng** | Chủ đề đảo trôi giảm phần địa hình nhưng thêm cầu và mây |

> Ngân sách dung lượng cho nhóm tài nguyên bắt buộc (FR-054) **chưa có giá trị cụ thể** — treo ở OQ-04. Chưa chốt con số này thì không đánh giá được danh mục trên có nằm trong ngân sách hay không.

## 7. Quyết định còn treo ảnh hưởng trực tiếp khối lượng dựng

Chi tiết ở `open-questions.md`:

| ID | Nội dung | Ảnh hưởng |
|----|----------|-----------|
| ~~OQ-06~~ | ~~Chủ đề thế giới~~ | **Đã chốt 11/09/2026**: đảo trôi trên mây |
| ~~OQ-07~~ | ~~Nguồn tài nguyên~~ | **Đã chốt 11/09/2026**: pack CC0 làm nền + sinh riêng 5 vật thể tương tác |
| OQ-21 | Xử lý khi nhân vật đi tới mép đảo | Phát sinh từ chủ đề mới: ranh giới giờ là vực thẳm chứ không phải bờ nước. Ảnh hưởng AST-04 và FR-012 |
| OQ-19 | Khu vực dự án dùng **một** vật thể chung hay **mỗi dự án một** model riêng | Phương án "mỗi dự án một model" khiến việc thêm dự án mới phải dựng model, mâu thuẫn BO-05, FR-059 và SC-012 |
| OQ-20 | Chiến lược mức chi tiết (LOD) | Dựng nhiều biến thể cho mỗi model, hay làm low-poly một mức duy nhất |
