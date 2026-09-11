# Prototype — thế giới 3D tương tác

Spike kiểm chứng **cảm giác điều khiển**, không phải bản dựng thật.
Stack ở đây (Vite + React Three Fiber) là lựa chọn tạm cho spike; stack chính thức
thuộc quyết định của bước `speckit-plan`.

## Chạy

```bash
npm install
npm run dev
```

## Điều khiển

| Thao tác | Phím |
|---|---|
| Di chuyển | `W A S D` hoặc phím mũi tên |
| Chạy | giữ `Shift` |
| Tương tác | `E` hoặc bấm chuột vào vật thể |
| Đóng bảng | `Esc` |
| Phóng to / thu nhỏ | con lăn chuột |
| Bảng hướng dẫn | `?` hoặc nút góc trên trái |

## Requirement đang được kiểm chứng

`FR-007` `FR-008` `FR-009` `FR-010` `FR-011` `FR-012` `FR-013` `FR-015`
`FR-016` `FR-017` `FR-018` `FR-019` `FR-020` `FR-021` `FR-022` `FR-037` `FR-038`

Mô hình đều là khối hình học cơ bản — **không dùng asset nào** (AST-01…AST-14 chưa chốt,
xem OQ-06 và OQ-07).

## Kết quả spike

**Chủ portfolio xác nhận 11/09/2026**: đã chạy trên máy, nhân vật di chuyển theo bàn phím được.

Kiểm chứng tự động (Playwright lái nhân vật trong trình duyệt thật, đo vị trí qua `window.__avatar`):

| Điểm kiểm | Kết quả |
|---|---|
| FR-008 — chạy nhanh hơn đi | 2,33× (thiết kế 4,2 → 8,4 m/s) |
| FR-016, FR-017 — chỉ dấu khi vào phạm vi | vòng sáng bật, hiện gợi ý thao tác |
| FR-018 — phím `E` mở đúng bảng | đạt |
| FR-020 — khoá di chuyển khi bảng mở | dịch chuyển 0,000 đơn vị |
| FR-021 — `Esc` đóng, chỉ dấu quay lại | đạt |
| FR-012 — va chạm vật thể đặc | dừng ở khoảng cách 2,37, không xuyên qua |
| Lỗi JS | không có |

### Ghi nhận cho bước plan

- Bundle **1,1 MB (300 kB gzip)** khi mới chỉ có `three` + `react`, **chưa có model nào** — mốc sàn cho ngân sách tài nguyên ở FR-054 và OQ-04.
- Khu dự án dựng theo phương án **một vật thể chung** (khuyến nghị ở OQ-19) để đánh giá sức nặng thị giác.
- Lỗi im lặng đặc trưng của R3F đã gặp: đặt `rotation` trên phần tử geometry thì bị lờ đi, phải đặt trên `<mesh>`.

---

## Bản 2 — thế giới đảo trôi (11/09/2026)

Thay mặt đất phẳng bằng chủ đề đã chốt ở **OQ-06**: 5 đảo lơ lửng nối bằng cầu dây.

| Đảo | Khu vực | Đường kính | Cao độ | Vật thể |
|-----|---------|:----------:|:------:|---------|
| 01 | Giới thiệu (xuất phát) | 18 m | 0 m | Căn nhà |
| 02 | Kỹ năng | 16 m | +2,2 m | Xưởng làm việc |
| 03 | Dự án | 19 m | +0,8 m | Khu trưng bày |
| 04 | Kinh nghiệm | 16 m | +3,0 m | Cụm cột mốc |
| 05 | Liên hệ & CV | 15 m | +1,2 m | Hòm thư |

4 cầu dây dài 10,2–10,9 m, là **lối đi duy nhất** giữa các đảo.

### Mô hình mặt sàn

`content.js` phơi `surfaceAt(x, z)` → `{ ok, y, on, id, edge }`:

- **Trên đảo** khi khoảng cách tới tâm ≤ `r − 0.9` (biên an toàn để không đứng chênh vênh ở viền)
- **Trên cầu** khi hình chiếu vuông góc lên đoạn cầu nằm trong `[0, 1]` và lệch ngang ≤ `1.25 m`
- Hai đầu cầu **thụt 1,8 m vào trong mặt đảo** để vùng đi được của cầu và của đảo chồng lên nhau — không có khe hở làm nhân vật kẹt
- Cao độ khi đứng trên cầu nội suy tuyến tính giữa hai đầu, nên đi qua cầu là lên/xuống dốc mượt

### OQ-21 — phương án đang chạy: chặn mềm

Mỗi khung hình, bước đi được thử trước. Nếu điểm đến là khoảng không thì bỏ bước đó,
rồi thử tách trục X và Z để nhân vật **trượt dọc mép** thay vì dừng cứng.
Không rơi, không tường vô hình, không hồi sinh.

Ba phương án còn lại chưa thử: cho rơi rồi hồi sinh, tường vô hình cứng, đẩy ngược lại.

### Kiểm chứng tự động bản 2

Playwright lái nhân vật theo waypoint qua cả chuỗi, đọc `window.__avatar`:

| Điểm kiểm | Kết quả |
|---|---|
| Đi hết 5 đảo qua 4 cầu | Đạt — vết đi `dao:gioi-thieu → cau-0 → dao:ky-nang → cau-1 → dao:du-an → cau-2 → dao:kinh-nghiem → cau-3 → dao:lien-he` |
| Cao độ đổi đúng khi sang đảo khác | Đạt — `y` đọc được 0 → 2,2 → 0,8 → 3,0 → 1,2 |
| Chạy hết tốc lực đâm vào mép đảo | Đạt — dừng đúng ở viền (`edge` về 0, cờ `blocked`), không lọt ra khoảng không |
| Lỗi console / lỗi trang | Không có |

### Phát hiện cần chốt trước khi dựng thật

1. **Không có chỉ dẫn hướng cầu.** Đứng giữa đảo, đi thẳng về phía đảo kế tiếp thì đâm
   vào mép chứ không trúng cầu. Ảnh hưởng trực tiếp **SC-002**. Ba cách: cột mốc có đèn
   ở hai đầu cầu, vệt đường mòn trên cỏ, hoặc mũi tên ở rìa màn hình.
2. **Tốc độ 4,6 / 9,2 m/s nhanh hơn nhiều so với clip đi/chạy chuẩn** (≈1,4 / 3,0 m/s).
   Không chỉnh thì chân trượt thấy rõ khi lắp AST-02.
3. **Chiều dài cầu thật là 10,2–10,9 m**, trong khi `assets-3d.md` ghi 6–9 m.
   Đề xuất sửa spec thành 9–11 m.
