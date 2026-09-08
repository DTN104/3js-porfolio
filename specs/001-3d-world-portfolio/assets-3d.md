# Danh mục tài nguyên 3D & media: 001-3d-world-portfolio

**Feature**: `001-3d-world-portfolio` · **Version**: 0.1 · **Ngày**: 2026-09-08
**Nguồn**: dẫn xuất từ `spec.md` v0.3 · **Phục vụ**: DEP-01, DEP-02, DEP-03; đầu vào cho `speckit-plan`

## 1. Cách đọc danh mục này

- Danh mục liệt kê **theo chức năng**, không theo chủ đề mỹ thuật. Chủ đề và phong cách thế giới còn treo ở **OQ-06**, nên cột "Ví dụ" chỉ là minh họa theo hướng đảo/làng nhỏ của trải nghiệm tham chiếu — **chưa phải quyết định**.
- Cột "Truy vết" chỉ tới requirement trong `spec.md` làm phát sinh tài nguyên đó. Tài nguyên không truy vết được về requirement nào thì không thuộc phạm vi phiên bản đầu.
- Cột "Bắt buộc" = thiếu thì không đáp ứng được requirement đã chốt.
- Danh mục này **không** quyết định nguồn tài nguyên (tự dựng / mua pack / thuê ngoài) — xem OQ-07.
- Prompt dựng cho từng model nằm ở file riêng: `asset-prompts.md`.

## 2. Nhóm 1 — Bắt buộc: thiếu là thế giới không vận hành được

| Mã | Tài nguyên | Số lượng | Bắt buộc | Truy vết | Ví dụ / Ghi chú |
|----|-----------|----------|:--------:|----------|-----------------|
| AST-01 | Mô hình nhân vật điều khiển được (có rig) | 1 | Có | FR-007, FR-009 | Nhân vật duy nhất; không có tùy biến ngoại hình |
| AST-02 | Bộ hoạt ảnh nhân vật: đứng yên, đi, chạy | 3 clip | Có | FR-009 | Đúng 3 trạng thái spec yêu cầu; các clip khác là tùy chọn |
| AST-03 | Địa hình nền của thế giới | 1 | Có | FR-015 | Mặt đất/nền đảo liền mạch, kích thước hữu hạn |
| AST-04 | Ranh giới thế giới nhìn thấy được | 1 bộ | Có | FR-015, FR-012 | Bờ nước, vách đá, hàng rào. Spec yêu cầu ranh giới **nhận biết được bằng mắt**, không dùng tường vô hình |
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
| AST-12 | Đường đi / lối dẫn giữa các khu vực | 1 bộ | Có | FR-015, SC-002, SC-003 | Đây là thứ dẫn khách mới tới đúng vật thể; ảnh hưởng trực tiếp hai tiêu chí thành công về thời gian |
| AST-13 | Prop trang trí không tương tác | 15–30 model, dùng lặp lại | Không (chất lượng) | FR-015 | Cây, đá, cỏ, hàng rào, đèn, cầu, mặt nước… Tốn công nhất nhưng dễ mua pack nhất |
| AST-14 | Skybox / HDRI và thiết lập ánh sáng | 1 bộ | Có | FR-015, FR-053 | Quyết định phần lớn "chất" hình ảnh; ảnh hưởng ngân sách dung lượng ở FR-054 |

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

| Nhóm | Số model 3D | Ghi chú |
|------|-------------|---------|
| Model đặc thù phải dựng riêng | ~8 | AST-01, AST-03, AST-04, AST-06…AST-10 |
| Prop dùng lặp lại | 15–30 | AST-13 — có thể mua pack |
| Hình học phụ trợ | 2 | AST-05 (collision), AST-12 (đường đi) |
| **Tổng ước tính** | **~25–40 model** | Chưa tính biến thể mức chi tiết, phụ thuộc quyết định ở OQ-20 |

> Ngân sách dung lượng cho nhóm tài nguyên bắt buộc (FR-054) **chưa có giá trị cụ thể** — treo ở OQ-04. Chưa chốt con số này thì không đánh giá được danh mục trên có nằm trong ngân sách hay không.

## 7. Quyết định còn treo ảnh hưởng trực tiếp khối lượng dựng

Chi tiết ở `open-questions.md`:

| ID | Nội dung | Ảnh hưởng |
|----|----------|-----------|
| OQ-06 | Chủ đề và phong cách hình ảnh của thế giới | Quyết định toàn bộ cột "Ví dụ" ở trên |
| OQ-07 | Nguồn tài nguyên: tự dựng / mua pack / thuê ngoài | Chốt chung với OQ-06 vì mua pack sẽ giới hạn chủ đề theo pack có sẵn |
| OQ-19 | Khu vực dự án dùng **một** vật thể chung hay **mỗi dự án một** model riêng | Phương án "mỗi dự án một model" khiến việc thêm dự án mới phải dựng model, mâu thuẫn BO-05, FR-059 và SC-012 |
| OQ-20 | Chiến lược mức chi tiết (LOD) | Dựng nhiều biến thể cho mỗi model, hay làm low-poly một mức duy nhất |
