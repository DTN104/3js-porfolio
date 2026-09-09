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
