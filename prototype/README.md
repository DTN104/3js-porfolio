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
