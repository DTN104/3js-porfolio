# Prompt dựng model 3D & tài nguyên: 001-3d-world-portfolio

**Feature**: `001-3d-world-portfolio` · **Version**: 1.0 · **Ngày**: 2026-09-11
**Nguồn**: `assets-3d.md` v0.2, `spec.md` v0.3, chủ đề OQ-06, bảng màu từ file Figma `Portfolio 3D — Đảo trôi`
**Dùng cho**: công cụ text-to-3D (Meshy, Tripo, Rodin, Hyper3D…), công cụ sinh skybox, công cụ sinh nhạc, hoặc làm brief đặt hàng cho 3D artist

> **Bản này phủ toàn bộ AST-01…AST-21.** Bản v0.2 chỉ có 12 mục và không có prompt cho hoạt ảnh, va chạm, chỉ dấu, material, nhạc, ảnh chia sẻ. Bản cũ lưu tại `_asset-prompts-v0.2.bak`.

---

## 1. Cách dùng

- Mỗi prompt model 3D = **STYLE** + **nội dung riêng của asset** + **TECH** + **NEGATIVE**. Bốn khối ghép lại thành một prompt hoàn chỉnh.
- Bốn khối dùng chung ở mục 3 là **điểm duy nhất cần sửa nếu đổi hướng mỹ thuật** — sửa một chỗ, toàn bộ prompt đổi theo, giữ được tính đồng bộ.
- Prompt viết bằng tiếng Anh vì công cụ text-to-3D cho kết quả ổn định hơn nhiều so với tiếng Việt. Ghi chú và ràng buộc nghiệp vụ viết bằng tiếng Việt.
- Con số kích thước trong prompt là **mét thật**, khớp với toạ độ trong prototype (`prototype/src/content.js`). Không đổi số ở một nơi mà quên nơi kia.
- Ký hiệu trong tài liệu:
  - **Bắt buộc** — thiếu thì không đáp ứng được requirement đã chốt
  - **Giả định** — Claude tự đặt ra để prompt chạy được, chưa được chủ portfolio xác nhận
  - **Câu hỏi mở** — chưa quyết định, ảnh hưởng tới nội dung prompt
  - **Đề xuất thay đổi** — khác với `spec.md`/`assets-3d.md` hiện tại, cần chủ portfolio duyệt trước khi cập nhật ngược lại spec

---

## 2. Bảng tra nhanh — asset nào dùng công cụ nào

| Mã | Tài nguyên | Số prompt | Công cụ phù hợp | Mục |
|----|-----------|:---------:|-----------------|-----|
| AST-01 | Nhân vật điều khiển được | 1 | Text-to-3D → auto-rig | [4.1](#41-ast-01--nhân-vật-điều-khiển-được) |
| AST-02 | Hoạt ảnh đứng yên / đi / chạy | 3 mô tả | **Không** dùng text-to-3D — thư viện chuyển động | [4.2](#42-ast-02--bộ-hoạt-ảnh-nhân-vật) |
| AST-03 | Mảnh đảo lơ lửng | 1 gốc + 5 biến thể | Text-to-3D | [4.3](#43-ast-03--mảnh-đảo-lơ-lửng) |
| AST-04 | Mép đảo | 1 | Text-to-3D | [4.4](#44-ast-04--mép-đảo) |
| AST-05 | Hình học va chạm | — | Sinh từ hình học, không có prompt | [4.5](#45-ast-05--hình-học-va-chạm) |
| AST-06 | Vật thể — giới thiệu | 1 | Text-to-3D | [4.6](#46-ast-06--vật-thể-tương-tác-khu-vực-giới-thiệu) |
| AST-07 | Vật thể — kỹ năng | 1 | Text-to-3D | [4.7](#47-ast-07--vật-thể-tương-tác-khu-vực-kỹ-năng) |
| AST-08 | Vật thể — dự án | 1 | Text-to-3D | [4.8](#48-ast-08--vật-thể-tương-tác-khu-vực-dự-án) |
| AST-09 | Vật thể — kinh nghiệm | 1 | Text-to-3D | [4.9](#49-ast-09--vật-thể-tương-tác-khu-vực-kinh-nghiệm) |
| AST-10 | Vật thể — liên hệ & CV | 1 | Text-to-3D | [4.10](#410-ast-10--vật-thể-tương-tác-khu-vực-liên-hệ--cv) |
| AST-11 | Chỉ dấu vùng tương tác | — | Shader/sprite, viết bằng code | [4.11](#411-ast-11--chỉ-dấu-vùng-tương-tác) |
| AST-12 | Cầu dây | 1 | Text-to-3D | [4.12](#412-ast-12--cầu-dây-nối-đảo) |
| AST-13 | Prop trang trí | 5 | Text-to-3D hoặc pack CC0 | [4.13](#413-ast-13--prop-trang-trí) |
| AST-14 | Bầu trời / HDRI | 1 | Sinh skybox (Blockade Labs…) | [4.14](#414-ast-14--bầu-trời--hdri) |
| AST-15 | Texture / material | 1 bộ quy ước | Không phải prompt — quy ước kỹ thuật | [4.15](#415-ast-15--texture--material) |
| AST-16 | Ảnh minh họa dự án | 1 (ảnh tạm) | Chủ portfolio cung cấp (DEP-03) | [4.16](#416-ast-16--ảnh-minh-họa-dự-án) |
| AST-17 | Nhạc nền | 1 | Sinh nhạc (Suno, Udio…) hoặc thư viện CC0 | [4.17](#417-ast-17--nhạc-nền) |
| AST-18 | Hiệu ứng âm thanh | — | Ngoài phạm vi bản đầu | [4.18](#418-ast-18--hiệu-ứng-âm-thanh) |
| AST-19 | Ảnh xem trước khi chia sẻ | 1 | Key art trong Figma, hoặc sinh ảnh 2D | [4.19](#419-ast-19--ảnh-xem-trước-khi-chia-sẻ) |
| AST-20 | Thiết kế UI 2D | — | **Đã có** — file Figma trang 03 & 04 | [4.20](#420-ast-20--thiết-kế-ui-2d) |
| AST-21 | Lớp mây nền | 1 | Text-to-3D | [4.21](#421-ast-21--lớp-mây-nền) |

---

## 3. Bốn khối dùng chung

### 3.1 STYLE

```
STYLE: stylized low-poly with soft rounded shapes and no sharp edges, cozy handcrafted
miniature-diorama look, chunky exaggerated proportions, matte flat-shaded surfaces with
no photoreal detail and no surface noise, palette limited to fresh grass green, deep
forest green, warm sand-grey stone, mid-brown timber and a single warm orange accent,
clean readable silhouette when viewed small from a high three-quarter isometric angle,
belonging to a bright daytime floating sky-island world seen from above, friendly and
uncluttered.
```

> **Thay đổi so với v0.2**: bảng màu cũ ghi "sand beige, terracotta, sage green and cream" — đó là bảng màu trước khi chốt chủ đề đảo trôi. Bảng màu mới khớp với collection `Tokens` trong Figma và với prototype.

### 3.2 TECH

```
TECH: game-ready single mesh, clean quad-dominant topology, under 5000 triangles,
non-overlapping UV unwrap, one 1024x1024 base color texture, PBR metallic-roughness
workflow, Y-up orientation, centered at origin with the base resting on the ground
plane at Y=0, real-world scale in meters, no baked shadows or lighting information in
the texture, no background, no ground plane included, exportable to glTF/GLB.
```

### 3.3 NEGATIVE

```
NEGATIVE: photorealistic, realistic textures, high-frequency detail, noise, grunge,
rust, scratches, dirt, sharp hard edges, thin fragile geometry, floating disconnected
parts, text, letters, numbers, logos, watermarks, human characters, baked shadows,
baked ambient occlusion, ground plane, background scenery, dark or desaturated colors,
horror, ruins, decay.
```

### 3.4 SCALE — khung tỉ lệ tham chiếu

Mọi model phải đọc được ở cùng một tỉ lệ. Dùng nhân vật cao 1,6 m làm chuẩn.

| Vật | Kích thước chốt | Ghi chú |
|-----|-----------------|---------|
| Nhân vật | cao **1,6 m** | Chuẩn tham chiếu của cả thế giới |
| Đảo 01 · Giới thiệu | đường kính **18 m**, cao độ mặt cỏ 0 m | Đảo xuất phát |
| Đảo 02 · Kỹ năng | đường kính **16 m**, cao độ +2,2 m | |
| Đảo 03 · Dự án | đường kính **19 m**, cao độ +0,8 m | Đảo lớn nhất |
| Đảo 04 · Kinh nghiệm | đường kính **16 m**, cao độ +3,0 m | Đảo cao nhất |
| Đảo 05 · Liên hệ & CV | đường kính **15 m**, cao độ +1,2 m | Đảo nhỏ nhất |
| Chân đảo (khối đá dưới) | sâu bằng **0,6 – 0,8 × đường kính đảo** | Nhìn từ góc isometric mới thấy được độ dày |
| Cầu dây | dài **10 – 11 m**, rộng lọt lòng **2,5 m** | *Đề xuất thay đổi* — xem [4.12](#412-ast-12--cầu-dây-nối-đảo) |
| Cây | cao **2,5 – 5 m** | ≈ 1/6 đường kính đảo |
| Nhà (AST-06) | rộng 6 m, cao 5 m | ≈ 1/3 đường kính đảo |
| Mép đảo (AST-04) | cao **≤ 0,8 m** | Thấy được ranh giới mà không che khoảng không bên dưới |
| Khối mây | rộng 8 – 20 m, dày 2 – 4 m | |

### 3.5 PALETTE — mã màu chốt

Lấy từ collection `Tokens` trong file Figma. Đưa bảng này cho 3D artist cùng với prompt.

| Vai trò | Mã | Dùng ở |
|---------|-----|--------|
| Cỏ mặt đảo | `#8CBE68` | AST-03 |
| Cỏ đậm (viền mép, bóng) | `#6B9A4C` | AST-03, AST-04 |
| Đá sáng | `#9E8E7C` | AST-03 chân đảo, AST-13b |
| Đá đậm | `#6E6255` | AST-03 lớp đất, AST-09 |
| Gỗ sáng | `#A87A4F` | AST-12 ván cầu, AST-07 |
| Gỗ đậm | `#7A5636` | AST-12 cọc, thân cây |
| Tán cây đậm | `#43703A` | AST-13a |
| Tán cây sáng | `#5E9448` | AST-13a |
| Trời đỉnh | `#6FA8CF` | AST-14 |
| Trời chân | `#DCEEF6` | AST-14 |
| Mây | `#F6F9FB` | AST-21 |
| Mây bóng | `#DCE6EE` | AST-21 |
| Cam nhấn | `#E08B45` | Nhân vật, AST-10, điểm nhấn duy nhất |
| Xanh tiêu điểm | `#3E7BA8` | AST-11 chỉ dấu tương tác |

> **Quy tắc**: cam `#E08B45` là màu nhấn **duy nhất** trong thế giới. Vật nào mang màu này thì mắt người xem hiểu là "tương tác được hoặc quan trọng". Đừng dùng nó cho prop trang trí.

---

## 4. Prompt theo từng asset

### 4.1 AST-01 — Nhân vật điều khiển được

**Bắt buộc** · Truy vết: FR-007, FR-009 · Số lượng: 1 · Nguồn đã chốt (OQ-07): pack CC0 (Quaternius) — prompt dưới đây dùng khi muốn nhân vật riêng

```
A stylized low-poly cartoon character for a third-person web experience: a young adult
office professional with chunky chibi proportions, head about one third of total body
height, round glasses, short dark tousled hair, a plain warm-orange long-sleeve shirt
tucked into simple dark trousers, slip-on shoes, mitten hands with no separated
fingers, a minimal face with two dot eyes and a small closed smile, fully symmetrical,
standing in a clean A-pose with arms angled 45 degrees down and away from the torso and
feet shoulder-width apart, limbs clearly separated from the body with no intersecting
geometry, humanoid proportions suitable for automatic rigging, exactly 1.6 meters tall.
+ STYLE + TECH + NEGATIVE
```

**Ràng buộc nghiệm thu**
1. Đúng A-pose, hai tay **không dính vào thân** — dính là auto-rig hỏng
2. Đối xứng trái/phải
3. Có cổ, khuỷu, gối đủ khối để auto-rig nhận diện xương
4. Cao đúng 1,6 m, chân chạm Y=0

> **Giả định** — áo màu cam nhấn `#E08B45` để nhân vật luôn nổi trên nền cỏ xanh và trời xanh, ở mọi mức thu phóng (FR-011). Chưa xác nhận với chủ portfolio.
> **Câu hỏi mở** — nhân vật có cần giống chủ portfolio không, hay là nhân vật ẩn danh?

---

### 4.2 AST-02 — Bộ hoạt ảnh nhân vật

**Bắt buộc** · Truy vết: FR-009 · Số lượng: 3 clip · **Không sinh bằng text-to-3D**

Text-to-3D hiện không sinh được hoạt ảnh. Ba clip lấy từ thư viện chuyển động có sẵn (Mixamo, Quaternius Universal Animation Library — CC0) rồi retarget lên bộ xương của AST-01.

| Clip | Tên chuẩn trong thư viện | Yêu cầu |
|------|--------------------------|---------|
| Đứng yên | `Idle` / `Breathing Idle` | Lặp liền mạch, biên độ nhỏ, không lắc đầu quá đà |
| Đi | `Walking` | Lặp liền mạch, tốc độ gốc ≈ **1,4 m/s**, chân không trượt trên mặt sàn |
| Chạy | `Running` | Lặp liền mạch, tốc độ gốc ≈ **3,0 m/s**, chân không trượt |

**Ràng buộc nghiệm thu**
1. Cả ba clip dùng **chung một bộ xương**, chuyển qua lại không giật
2. Khung đầu và khung cuối của mỗi clip trùng nhau (loop seamless)
3. Không có root motion — vị trí do code điều khiển, hoạt ảnh chỉ lo dáng

> **Đề xuất thay đổi** — prototype đang chạy ở **4,6 m/s đi** và **9,2 m/s chạy**, nhanh hơn nhiều so với tốc độ gốc của clip. Hoặc chỉnh tốc độ phát clip theo vận tốc thật, hoặc hạ tốc độ di chuyển xuống. Cần chốt trước khi làm hoạt ảnh, vì sai thì chân trượt thấy rõ.

---

### 4.3 AST-03 — Mảnh đảo lơ lửng

**Bắt buộc** · Truy vết: FR-015 · Số lượng: 5

#### Prompt gốc (dùng khi chỉ cần một mẫu rồi biến đổi tỉ lệ)

```
A stylized low-poly floating sky island for a third-person web experience, seen as one
solid object: a flat gently undulating fresh-green grass top surface that is fully
walkable, a thin band of darker earth just below the grass rim, soft rounded warm
sand-grey rocky sides, and an underside that tapers downward into a blunt irregular
rock point about two thirds as deep as the island is wide, with three small rocks
drifting just beneath the tip, a clean grass-to-rock transition around the rim, about
16 meters across, no buildings, no trees, no props, no characters, island body only.
+ STYLE + TECH + NEGATIVE
```

#### Năm biến thể — mỗi đảo một dáng riêng để khách nhận ra mình đang ở đâu

| Mã | Khu vực | Đường kính | Câu thêm vào prompt gốc |
|----|---------|:----------:|--------------------------|
| AST-03a | Giới thiệu | 18 m | `The island is a wide even oval with the flattest top of the set and a broad gentle slope on one side, the calmest and most welcoming shape.` |
| AST-03b | Kỹ năng | 16 m | `The island is slightly kidney-shaped with one raised grassy shoulder along the back edge, giving it a sheltered feel.` |
| AST-03c | Dự án | 19 m | `The island is the largest and most circular of the set, with a shallow flat plateau in the middle that reads as a natural stage.` |
| AST-03d | Kinh nghiệm | 16 m | `The island is long and narrow with a stepped top surface that rises in two low terraces from one end to the other.` |
| AST-03e | Liên hệ & CV | 15 m | `The island is the smallest and roundest of the set, with a single rounded knoll near one edge.` |

**Ràng buộc nghiệm thu**
1. Mặt trên **phẳng đủ để đi** — độ nhấp nhô không quá 0,25 m, nếu không nhân vật giật khi bước
2. Chân đảo sâu bằng 0,6 – 0,8 × đường kính; nhìn từ góc isometric phải thấy rõ khối đá
3. Không kèm cây, đá, nhà — những thứ đó là AST-13 và AST-06…AST-10, đặt riêng

> Chủ đề đảo trôi thay địa hình 60×60 m bằng 5 mảnh nhỏ. **Đây là thay đổi làm nhẹ khối lượng nhiều nhất** và cũng khiến asset này chuyển từ nhóm "không nên sinh bằng text-to-3D" sang nhóm sinh được bình thường.

---

### 4.4 AST-04 — Mép đảo

**Bắt buộc** · Truy vết: FR-015, FR-012 · Số lượng: 1 bộ modular

```
A set of stylized low-poly island-rim pieces for a floating sky island, designed as
separate modular segments that follow a gently curving rim and tile seamlessly end to
end: a short wooden post-and-rope fence segment, a low mossy stone kerb, a cluster of
rounded boulders with grass tufts, and a single taller wooden marker post with a small
lantern, each segment about 3 meters wide and no taller than 0.8 meters except the
marker post at 1.6 meters, low enough to mark the edge without blocking the view
outward and downward.
+ STYLE + TECH + NEGATIVE
```

**Ràng buộc nghiệm thu**
1. Ghép nối tiếp nhau **không hở khe** trên cung tròn bán kính 7,5 – 9,5 m
2. Cao ≤ 0,8 m (trừ cột mốc 1,6 m)
3. Đáy bám theo mặt cong của đảo, không lơ lửng

> Thấp dưới 0,8 m là có chủ ý: mép đảo phải **thấy được là ranh giới** (FR-015) nhưng không che mất khoảng không bên dưới — thứ tạo nên cảm giác lơ lửng.
>
> **Câu hỏi mở OQ-21** — xử lý khi nhân vật đi tới mép. Prototype đang làm **chặn mềm**: bước nào ra khoảng không thì bỏ, nhân vật trượt dọc mép, không rơi, không có tường vô hình. Đã kiểm thử tự động: nhân vật chạy hết tốc lực đâm vào mép thì dừng đúng ở viền, không lọt. Ba phương án còn lại: (a) cho rơi rồi hồi sinh tại đảo gần nhất, (b) tường vô hình cứng, (c) chặn mềm như hiện tại. **Cần chốt** — ảnh hưởng trực tiếp đến việc cột mốc ở AST-04 đặt dày hay thưa.

---

### 4.5 AST-05 — Hình học va chạm

**Bắt buộc** · Truy vết: FR-012, FR-014 · **Không có prompt** — sinh từ hình học đã có

| Loại | Cách sinh | Ghi chú |
|------|-----------|---------|
| Mặt đi được của đảo | Hình tròn bán kính = bán kính đảo **trừ 0,9 m** | Con số 0,9 m là biên an toàn để nhân vật không đứng chênh vênh ở viền |
| Mặt cầu | Hình chữ nhật dài theo trục cầu, nửa chiều rộng **1,25 m** | Hai đầu thụt **1,8 m** vào trong mặt đảo để vùng đi được của cầu và của đảo chồng lên nhau — không có khe hở làm nhân vật kẹt |
| Vật thể đặc | Hình trụ bao quanh, bán kính theo từng vật (1,4 – 2,4 m) | AST-06…AST-10 |
| Khoảng không | Mọi vị trí không thuộc ba loại trên | Xử lý theo OQ-21 |

**Ràng buộc nghiệm thu**
1. Không được có **khe hở** giữa vùng đi được của đảo và của cầu — kiểm bằng cách cho nhân vật đi hết chuỗi 5 đảo và ghi lại bề mặt đi qua
2. Hình va chạm luôn **đơn giản hơn** hình hiển thị; không dùng mesh hiển thị làm collider
3. Kiểm thử phải tự động hoá được — prototype đang phơi `window.__avatar` để script đọc vị trí và bề mặt

---

### 4.6 AST-06 — Vật thể tương tác: khu vực **giới thiệu**

**Bắt buộc** · Truy vết: FR-016, FR-023 · Số lượng: 1 · **Sinh riêng** (OQ-07)

```
A stylized low-poly cozy cottage for a cartoon sky village: a single-storey house with
a steep pitched roof of rounded clay tiles in muted terracotta, cream plaster walls
with exposed mid-brown wooden beams, a round-top wooden front door, two square windows
with warm glowing interior light, a small stone chimney on one side, a short front
porch with two wooden steps and a simple railing, and a blank wooden signboard hanging
from a bracket beside the door with its face left completely flat and empty, about 6
meters wide, 5 meters deep and 5 meters tall, exterior only with no interior geometry.
+ STYLE + TECH + NEGATIVE
```

**Ràng buộc nghiệm thu**
1. Mặt biển hiệu **phẳng và trống** — tên và chức danh áp lên bằng texture, đổi được mà không dựng lại model
2. Có cửa trước rõ ràng hướng ra phía đường đi, để khách hiểu đây là vật tương tác được
3. Không có nội thất — camera không bao giờ vào trong

---

### 4.7 AST-07 — Vật thể tương tác: khu vực **kỹ năng**

**Bắt buộc** · Truy vết: FR-016, FR-024 · Số lượng: 1 · **Sinh riêng** (OQ-07)

```
A stylized low-poly outdoor craft workbench station arranged as one connected scene: a
sturdy mid-brown wooden table, a pegboard panel standing behind it holding a few simple
hand tools, a small metal anvil block on the tabletop, a jar of nails and a mug of
brushes, a stack of wooden planks leaning against one table leg, a round wooden stool
in front, and a fabric awning on two posts stretched over the whole station, with three
blank flat panels pinned to the pegboard left completely empty, about 3.4 meters wide,
2 meters deep and 2.6 meters tall.
+ STYLE + TECH + NEGATIVE
```

**Ràng buộc nghiệm thu**
1. Ba tấm bảng trên pegboard **phẳng và trống** — nhóm kỹ năng áp lên bằng texture
2. Không quá cao: 2,6 m để không che tầm nhìn từ góc isometric
3. Đọc được là "nơi làm việc" ngay cả khi thu nhỏ hết cỡ

> **Câu hỏi mở** — số nhóm kỹ năng chưa chốt. Nếu nhiều hơn 3 nhóm thì hoặc tăng số bảng, hoặc bảng cuộn được trong bảng nội dung 2D. Khuyến nghị: **giữ 3 bảng trang trí, nội dung thật nằm hết trong bảng 2D** — như vậy số nhóm đổi không ảnh hưởng model.

---

### 4.8 AST-08 — Vật thể tương tác: khu vực **dự án**

**Bắt buộc** · Truy vết: FR-016, FR-025 · Số lượng: 1 (xem OQ-19) · **Sinh riêng** (OQ-07)

```
A stylized low-poly open-air exhibition stand: a mid-brown wooden pergola frame with a
striped fabric awning stretched over the top, three empty picture easels standing side
by side underneath, a low wooden display counter in front of them, and a round paved
stone platform underneath the whole stand, with every display surface left completely
flat and blank, about 5.5 meters wide, 3 meters deep and 3.2 meters tall.
+ STYLE + TECH + NEGATIVE
```

**Ràng buộc nghiệm thu**
1. Các mặt trưng bày phải **phẳng và trống** — số lượng dự án thay đổi mà không phải dựng lại model (BO-05, FR-059)
2. Ba giá vẽ có tỉ lệ khung giống nhau, để một bộ ảnh dự án dùng chung được
3. Nền đá tròn đủ rộng để nhân vật đứng lên

> **Câu hỏi mở OQ-19** — một vật thể chung cho cả danh sách dự án, hay mỗi dự án một model? Prompt này theo phương án **một vật thể chung** vì phương án kia khiến thêm dự án mới là phải dựng model, mâu thuẫn BO-05, FR-059 và SC-012.

---

### 4.9 AST-09 — Vật thể tương tác: khu vực **kinh nghiệm**

**Bắt buộc** · Truy vết: FR-016, FR-029 · Số lượng: 1 bộ modular · **Sinh riêng** (OQ-07)

```
A set of stylized low-poly timeline milestone markers for a cartoon sky island,
designed as separate modular pieces that can be repeated along a winding path: a
wooden signpost with two blank arrow-shaped boards, a small engraved stone marker with
a blank flat face, a short lantern post with a warm glowing lamp, a curved stone-slab
path segment 2 meters long, and one taller central pillar of stacked stone blocks with
a blank plaque, the markers about 1.5 meters tall and the central pillar about 3.8
meters tall.
+ STYLE + TECH + NEGATIVE
```

**Ràng buộc nghiệm thu**
1. Các đoạn đường đá ghép liền mạch trên cung cong
2. Mọi mặt biển và mặt bia **phẳng và trống** — mốc thời gian áp bằng texture
3. Số cột mốc đổi được mà không dựng lại model

---

### 4.10 AST-10 — Vật thể tương tác: khu vực **liên hệ & CV**

**Bắt buộc** · Truy vết: FR-016, FR-032, FR-033 · Số lượng: 1 · **Sinh riêng** (OQ-07)

```
A stylized low-poly mailbox and noticeboard pair: a rounded-top warm-orange metal
mailbox mounted on a mid-brown wooden post with a raised red flag on the side and a
single cream envelope sticking halfway out of the slot, standing next to a two-legged
wooden noticeboard with a blank cork panel and a small pitched roof over it, both
resting on a small patch of stone paving, about 2.4 meters wide and 1.9 meters tall in
total.
+ STYLE + TECH + NEGATIVE
```

**Ràng buộc nghiệm thu**
1. Mặt bảng tin **phẳng và trống** — thư điện tử và liên kết mạng xã hội áp bằng texture
2. Lá cờ đỏ dựng lên, phong thư thò ra — hai chi tiết này là tín hiệu "có gì đó cho bạn", đọc được cả khi thu nhỏ
3. Không có form gửi — đã chốt ở OQ-01, nên **không** dựng bàn viết, bút, giấy

---

### 4.11 AST-11 — Chỉ dấu vùng tương tác

**Bắt buộc** · Truy vết: FR-017 · **Không có prompt** — làm bằng shader/sprite trong code

| Thành phần | Đặc tả | Trạng thái |
|-----------|--------|-----------|
| Vòng dưới chân vật thể | Vòng tròn nét đứt, bán kính = bán kính vùng tương tác, màu `#3E7BA8`, dày 3 px màn hình | Ngoài tầm: độ mờ 0,16 · Trong tầm: 0,90 + thở nhẹ chu kỳ ≈ 2 s, biên độ tỉ lệ 5% |
| Chip gợi ý phím | Nền trắng `#FBFCFD`, bo 8 px, đổ bóng nhẹ, phím `E` trong khung `#EDF2F6`, chữ `#22303D` | Chỉ hiện khi trong tầm và bảng nội dung đang đóng |
| Nhãn khu vực | Viên thuốc nền trắng mờ 82%, chữ hoa nhỏ | Luôn hiện, đổi theo đảo đang đứng |

> Thiết kế chi tiết nằm ở **file Figma trang `03 · Giao diện trong thế giới 3D`**. Đây là hiệu ứng 2D vẽ trên canvas, **không phải model 3D**.

---

### 4.12 AST-12 — Cầu dây nối đảo

**Bắt buộc** · Truy vết: FR-015, FR-012, SC-002, SC-003 · Số lượng: 4

```
A stylized low-poly wooden rope bridge for a floating sky island world: horizontal
mid-brown timber planks with small visible gaps between them, alternating slightly
darker planks for rhythm, two thick guide ropes at hand height supported by simple
wooden posts every two meters, sagging gently in the middle by about half a meter,
sturdy stone-and-timber anchor blocks at both ends shaped to sit flush against a curved
island rim, 11 meters long and 2.5 meters wide between the ropes, the walkable plank
surface flat and even enough for a character to cross without stepping over anything.
+ STYLE + TECH + NEGATIVE
```

**Ràng buộc nghiệm thu**
1. Mặt ván **phẳng** — không có gờ nào cao quá 0,05 m
2. Hai khối neo ôm sát mặt cong của đảo, không hở
3. Đủ tương phản với nền trời để nhìn từ đảo này thấy được đường sang đảo kia

> **Đề xuất thay đổi** — `assets-3d.md` ghi cầu dài **6–9 m**. Bố cục thật trong prototype cho ra **10,2 – 10,9 m**. Prompt này lấy **11 m** rồi cắt ngắn khi lắp. Nếu muốn giữ 9 m thì phải kéo các đảo lại gần nhau, và khi đó khoảng cách giữa hai mép đảo chỉ còn ~7 m — nhìn từ trên xuống sẽ thấy chật. **Khuyến nghị: sửa `assets-3d.md` thành 9–11 m.**
>
> Ở chủ đề này cầu là **lối đi duy nhất** giữa các khu vực nội dung, nên nó vừa là đường vừa là chỉ dẫn — ảnh hưởng trực tiếp SC-002 và SC-003.
>
> **Câu hỏi mở mới (từ kiểm thử prototype)** — khi đứng ở giữa đảo, khách **không có chỉ dẫn nào cho biết cầu nằm ở hướng nào**. Kiểm thử tự động cho thấy đi thẳng về phía đảo kế tiếp thì đâm vào mép đảo chứ không trúng cầu. Ba cách xử lý: (a) đặt cột mốc AST-04 có đèn ngay hai đầu cầu, (b) vệt đường mòn trên cỏ dẫn ra cầu, (c) mũi tên ở rìa màn hình. **Cần chốt** — ảnh hưởng SC-002 (khách tìm thấy khu vực nội dung trong bao lâu).

---

### 4.13 AST-13 — Prop trang trí

Truy vết: FR-015 · Số lượng: 15–30 model dùng lặp · **Nguồn đã chốt (OQ-07): pack CC0** (Quaternius Stylized Nature MegaKit, Kenney Nature Kit). Prompt dưới đây dùng khi pack không đủ hoặc lệch tông.

**AST-13a — Cây và bụi**

```
A set of stylized low-poly cartoon trees and bushes: three conifer variants with
chunky stacked cone canopies in deep forest green with a lighter green upper cone, on
short tapered mid-brown trunks, ranging from 2.5 to 5 meters tall, plus two low
rounded bushes and one flowering shrub with simple petal shapes, each as a separate
object with a flat bottom.
+ STYLE + TECH + NEGATIVE
```

**AST-13b — Đá và cỏ**

```
A set of stylized low-poly cartoon ground details: four smooth weathered warm sand-grey
boulders of different sizes from 0.3 to 1.5 meters with flat faceted surfaces, three
grass tuft clusters, two small pebble scatters, and a patch of clover, each as a
separate object with a flat bottom that sits cleanly on a ground plane.
+ STYLE + TECH + NEGATIVE
```

**AST-13c — Hàng rào và đèn**

```
A set of stylized low-poly village fixtures: a short wooden picket fence segment 2
meters wide, a matching corner post, a standing lantern post with a warm glowing lamp
box on top about 2.5 meters tall, and a small hanging paper lantern, each as a separate
modular object that tiles end to end without gaps.
+ STYLE + TECH + NEGATIVE
```

**AST-13d — Nước và cầu nhỏ**

```
A set of stylized low-poly water features for a cartoon sky island: a small
stone-rimmed pond basin with the water surface left as a separate flat plane for a
shader, a short wooden plank footbridge 4 meters long with simple rope railings, and
three flat lily pads, each as a separate object.
+ STYLE + TECH + NEGATIVE
```

**AST-13e — Đồ vật nhỏ lấp cảnh**

```
A set of stylized low-poly small cartoon props: a wooden crate, a barrel, a terracotta
flower pot with a small plant, a folded deck chair, a rolled picnic blanket, and a
picnic basket, each as a separate object between 0.3 and 1 meter in size, all sharing
one consistent material palette.
+ STYLE + TECH + NEGATIVE
```

**Ràng buộc nghiệm thu cho cả nhóm**
1. Đặt cạnh AST-06…AST-10 **không lệch tông** — đây là lỗi hay gặp nhất khi trộn pack với model sinh riêng
2. Đáy phẳng, nằm đúng Y=0
3. Không mang màu cam nhấn `#E08B45` — màu đó dành riêng cho vật tương tác được

---

### 4.14 AST-14 — Bầu trời / HDRI

**Bắt buộc** · Truy vết: FR-015, FR-053 · **Không dùng text-to-3D** — dùng công cụ sinh skybox

```
A stylized cartoon sky panorama for a bright cozy low-poly game world: clear midday to
early-afternoon sky with a soft vertical gradient from pale ice blue near the horizon
to a clean mid blue at the zenith, a handful of chunky rounded cumulus clouds scattered
at mid height with flat bottoms and soft rounded tops, one warm soft sun glow about
thirty degrees above the horizon on one side, no ground, no terrain, no buildings, no
birds, seamless 360 degree equirectangular projection.
```

**Ràng buộc nghiệm thu**
1. Nối liền mạch 360° — không thấy đường ghép
2. Không có mặt đất hay đường chân trời rắn — thế giới lơ lửng, nhìn xuống phải là trời và mây
3. Xuất kèm bản HDRI để dùng làm ánh sáng môi trường

> Khối TECH ở mục 3.2 **không áp dụng** cho asset này — đây là ảnh panorama, không phải model.
>
> **Giả định** — ánh sáng ban ngày trong trẻo, không có hoàng hôn. Chọn vậy để nội dung chữ trên bảng 2D luôn đọc được. Chưa xác nhận với chủ portfolio.

---

### 4.15 AST-15 — Texture / material

**Bắt buộc** · Truy vết: FR-054 · **Không có prompt** — đây là quy ước kỹ thuật

| Hạng mục | Quy ước |
|----------|---------|
| Số material mỗi model | Tối đa **2** |
| Kích thước texture | 1024×1024 cho vật thể tương tác; 512×512 cho prop trang trí |
| Loại map | Chỉ base color. **Không** dùng normal, roughness, AO map riêng — phong cách phẳng không cần |
| Nén | KTX2 / Basis Universal |
| Atlas | Gom toàn bộ prop AST-13 vào **một atlas chung** để giảm số draw call |
| Màu | Lấy đúng mã ở bảng 3.5, không tự pha màu mới |

> **Câu hỏi mở OQ-04** — ngân sách dung lượng cho nhóm tài nguyên bắt buộc chưa có con số. Chưa chốt thì không đánh giá được bộ texture này có vừa ngân sách hay không.

---

### 4.16 AST-16 — Ảnh minh họa dự án

**Bắt buộc** · Truy vết: FR-026 · Nguồn: **chủ portfolio cung cấp** (DEP-03)

Đây không phải asset sinh bằng AI — là ảnh thật của dự án. Prompt dưới đây chỉ để **sinh ảnh tạm** cho giai đoạn dựng, tránh giá trưng bày trống trơn khi demo.

```
A flat vector illustration placeholder for a project card in a cozy low-poly sky-island
portfolio: a simple abstract composition of overlapping rounded rectangles and circles
suggesting a dashboard layout, in pale blue, cream and a single warm orange accent, no
text, no letters, no numbers, no logos, no user interface chrome, 4:3 aspect ratio,
flat matte colors with no gradients or shadows.
```

**Quy ước ảnh thật**
1. Tỉ lệ **4:3**, tối thiểu 1200×900
2. Cùng một tông sáng, không ảnh tối — nếu không sẽ chọi với thế giới
3. Không chứa dữ liệu thật của khách hàng, không chứa tên hệ thống nội bộ — **cần chủ portfolio rà trước khi đưa lên**

---

### 4.17 AST-17 — Nhạc nền

**Bắt buộc** · Truy vết: FR-040, DEP-02 · Số lượng: 1 track · Công cụ: sinh nhạc hoặc thư viện CC0

```
A gentle looping instrumental background track for a cozy exploration web experience:
soft acoustic guitar arpeggios and light marimba over a warm pad, slow tempo around 72
BPM, major key, calm and unhurried with no percussion build-ups, no vocals, no lyrics,
no sudden dynamic changes, designed to sit quietly under reading, seamless loop of
about 2 minutes.
```

**Ràng buộc nghiệm thu**
1. Lặp liền mạch — không nghe thấy điểm nối
2. Không có nhạc cụ nào đột ngột nổi lên; khách đang đọc nội dung
3. Mức âm chuẩn hoá về **−18 LUFS**, để không chói khi bật
4. Định dạng: `.ogg` + `.m4a` dự phòng

> **Câu hỏi mở OQ-12** — mặc định bật hay tắt khi mới vào? Khuyến nghị: **mặc định tắt**, có nút bật rõ ràng. Trình duyệt phần lớn chặn tự phát âm thanh, và nhạc tự bật trong môi trường văn phòng gây khó chịu.

---

### 4.18 AST-18 — Hiệu ứng âm thanh

**Không bắt buộc** · **Ngoài phạm vi bản đầu** — spec chưa có requirement nào yêu cầu.

Nếu sau này chủ portfolio quyết định thêm, danh sách tối thiểu sẽ là: tiếng bước chân trên cỏ, tiếng bước trên ván gỗ, tiếng mở bảng nội dung, tiếng đóng bảng. Chưa viết prompt vì chưa có quyết định.

---

### 4.19 AST-19 — Ảnh xem trước khi chia sẻ

**Bắt buộc** · Truy vết: FR-056, FR-071 · Số lượng: 1–2

**Đã có sẵn**: key art vector trong file Figma trang `05 · Key art`, kích thước 1600×900, cắt được về 1200×630 cho OG image.

Nếu muốn một bản khác hẳn, prompt sinh ảnh 2D:

```
A flat vector illustration for a website social preview card: a chain of five small
floating sky islands with grass tops and tapered rock undersides, connected by wooden
rope bridges, arranged in a gentle S-curve across the frame, a tiny orange-shirted
figure standing on the leftmost island, chunky rounded clouds in front and behind at
different depths, clear blue sky with a soft warm sun glow in the upper right, flat
matte colors with no gradients inside shapes, no text, no letters, no logos, 1200x630
landscape composition with generous empty sky in the upper left for a title overlay.
```

> **Câu hỏi mở OQ-14** — cần ảnh riêng cho từng ngôn ngữ hay không. Nếu tiêu đề nằm trong ảnh thì cần hai bản; nếu tiêu đề để trống trong ảnh và ghi ở thẻ meta thì một bản là đủ. **Khuyến nghị: một bản, để trống góc trên trái** — prompt trên đã theo hướng này.

---

### 4.20 AST-20 — Thiết kế UI 2D

**Bắt buộc** · Truy vết: FR-021, FR-037, FR-039, FR-044, FR-067 · **Đã hoàn thành**

Không phải model 3D. Đã dựng xong trong file Figma `Portfolio 3D — Đảo trôi`:

| Trang Figma | Nội dung |
|-------------|----------|
| `02 · Design tokens` | 21 biến màu + 11 text style — nguồn màu chuẩn cho cả 3D lẫn 2D |
| `03 · Giao diện trong thế giới 3D` | Bảng nội dung, chip gợi ý phím, bảng hướng dẫn, điều khiển cảm ứng, trạng thái tải, cảnh báo hiệu năng, nút chuyển 2D |
| `04 · Chế độ 2D` | Trang 2D đầy đủ, bản desktop và bản mobile |

> **Câu hỏi mở mới** — bảng nội dung nên là **panel bên phải** (đang vẽ) hay **modal giữa màn hình**? Panel giữ thấy được thế giới; modal dễ đọc hơn trên điện thoại. Cần chốt trước khi code.

---

### 4.21 AST-21 — Lớp mây nền

**Bắt buộc** · Truy vết: FR-015 · Số lượng: 1 bộ 4 biến thể

```
A set of stylized low-poly cartoon cloud shapes for a floating sky island world: four
cloud variants each built from a few large soft overlapping rounded lobes with flat
bottoms and domed tops, ranging from 8 to 20 meters wide and 2 to 4 meters thick, matte
off-white surface with a faint cool blue-grey tint on the underside lobes, no wispy
edges, no transparency, each as a separate closed solid object meant to drift slowly
far below and between the islands.
+ STYLE + TECH + NEGATIVE
```

**Ràng buộc nghiệm thu**
1. Là khối đặc kín, **không dùng trong suốt** — trong suốt gây sắp xếp chiều sâu sai khi nhiều mây chồng nhau
2. Đáy phẳng — nhìn từ trên xuống mới ra dáng biển mây
3. Số tam giác thấp hơn hẳn mức trần: mây xuất hiện 40–60 lần trong cảnh

> Phát sinh từ chủ đề đảo trôi: nếu khoảng dưới các đảo trống trơn thì thế giới trông như bị thủng chứ không như đang bay.

---
## 5. Asset không nên sinh bằng text-to-3D

| Mã | Vì sao | Cách nên làm |
|----|--------|--------------|
| AST-02 | Text-to-3D không sinh được hoạt ảnh, và chất lượng auto-rig phụ thuộc mạnh vào tư thế của model gốc | Sinh AST-01 bằng prompt ở 4.1 → auto-rig → lấy 3 clip từ thư viện chuyển động CC0 → retarget |
| AST-05 | Là hình học va chạm, không có hình dạng thị giác để mô tả | Sinh từ AST-03, AST-12 và các vật thể đặc bằng công cụ |
| AST-11 | Là hiệu ứng shader/sprite 2D vẽ trên canvas | Viết bằng code, theo thiết kế ở Figma trang 03 |
| AST-14 | Là ảnh panorama 360°, không phải model | Công cụ sinh skybox |
| AST-15 | Là quy ước kỹ thuật, không phải hình khối | Thiết lập trong công cụ dựng và pipeline nén |
| AST-16 | Là ảnh thật của dự án | Chủ portfolio cung cấp (DEP-03); prompt ở 4.16 chỉ để sinh ảnh tạm |
| AST-17 | Là âm thanh | Công cụ sinh nhạc hoặc thư viện CC0 |
| AST-19 | Là ảnh 2D | Key art Figma trang 05, hoặc công cụ sinh ảnh |
| AST-20 | Là thiết kế giao diện | Đã dựng trong Figma |
| ~~AST-03~~ | ~~Địa hình lớn 60×60 m~~ | **Không còn áp dụng** sau khi chốt OQ-06: mảnh đảo 15–19 m là vật thể đơn, sinh được bình thường |

---

## 6. Quy ước nghiệm thu model nhận về

Mọi model 3D đều phải qua đủ các mục sau trước khi đưa vào dự án:

| # | Mục kiểm | Cách kiểm |
|---|----------|-----------|
| 1 | Đúng khối STYLE | Đặt cạnh 3 model đã duyệt, chụp cùng một góc isometric — không được lệch tông |
| 2 | Đúng khối TECH | Đếm tam giác, kiểm UV chồng lấn, kiểm hướng trục, kiểm gốc toạ độ |
| 3 | Đáy nằm đúng Y=0 | Không lơ lửng, không chìm |
| 4 | Không có bóng/AO nướng sẵn vào texture | Cần hạ mức chi tiết linh hoạt (FR-053) |
| 5 | Đúng bảng màu mục 3.5 | So mã màu, không chấp nhận màu tự pha |
| 6 | Model modular ghép liền mạch | AST-04, AST-09, AST-12, AST-13c — ghép 5 đoạn liên tiếp, không hở khe |
| 7 | Mặt trưng bày phẳng và trống | AST-06, AST-07, AST-08, AST-09, AST-10 — điều kiện để nội dung đổi mà không dựng lại model |
| 8 | Đọc được khi thu nhỏ | Chụp ở mức zoom nhỏ nhất (FR-011), silhouette vẫn phân biệt được |
| 9 | Dung lượng cộng dồn trong ngân sách | **Giá trị ngân sách chưa chốt — treo ở OQ-04** |

---

## 7. Truy vết AST → requirement

| Mã | Requirement | Bắt buộc |
|----|-------------|:--------:|
| AST-01 | FR-007, FR-009 | Có |
| AST-02 | FR-009 | Có |
| AST-03 | FR-015 | Có |
| AST-04 | FR-015, FR-012 | Có |
| AST-05 | FR-012, FR-014 | Có |
| AST-06 | FR-016, FR-023 | Có |
| AST-07 | FR-016, FR-024 | Có |
| AST-08 | FR-016, FR-025 | Có |
| AST-09 | FR-016, FR-029 | Có |
| AST-10 | FR-016, FR-032, FR-033 | Có |
| AST-11 | FR-017 | Có |
| AST-12 | FR-015, FR-012, SC-002, SC-003 | Có |
| AST-13 | FR-015 | Không (chất lượng) |
| AST-14 | FR-015, FR-053 | Có |
| AST-15 | FR-054 | Có |
| AST-16 | FR-026 | Có |
| AST-17 | FR-040, DEP-02 | Có |
| AST-18 | — | Không |
| AST-19 | FR-056, FR-071 | Có |
| AST-20 | FR-021, FR-037, FR-039, FR-044, FR-067 | Có |
| AST-21 | FR-015 | Có |

---

## 8. Việc cần chủ portfolio quyết

Xếp theo mức chặn. Chưa chốt nhóm đầu thì không nên bắt đầu dựng model hàng loạt.

| # | Nội dung | Chặn cái gì | Khuyến nghị của Claude |
|---|----------|-------------|------------------------|
| 1 | **OQ-21** — xử lý khi nhân vật tới mép đảo | AST-04 (cột mốc dày hay thưa), FR-012 | Chặn mềm — prototype đang chạy và đã kiểm thử đạt |
| 2 | **Chỉ dẫn hướng cầu** (mới) | AST-04, AST-12, SC-002 | Cột mốc có đèn ở hai đầu cầu + vệt đường mòn trên cỏ |
| 3 | **Chiều dài cầu 9 m hay 11 m** | AST-12, bố cục đảo | Sửa `assets-3d.md` thành 9–11 m theo bố cục thật |
| 4 | **Tốc độ đi/chạy** | AST-02 (chân trượt nếu sai) | Hạ xuống 2,8 / 5,6 m/s cho khớp clip, hoặc chỉnh tốc độ phát clip |
| 5 | **OQ-19** — một vật thể chung hay mỗi dự án một model | AST-08 | Một vật thể chung |
| 6 | **Bảng nội dung: panel hay modal** | AST-20, code giao diện | Panel bên phải trên desktop, modal trên điện thoại |
| 7 | **OQ-12** — nhạc mặc định bật hay tắt | AST-17 | Mặc định tắt |
| 8 | **OQ-14** — ảnh chia sẻ riêng theo ngôn ngữ | AST-19 | Một bản, chừa chỗ trống cho tiêu đề |
| 9 | **OQ-04** — ngân sách dung lượng | AST-15, nghiệm thu mục 6 #9 | Chưa có cơ sở để Claude đề xuất — cần chủ portfolio hoặc đo trên thiết bị mục tiêu |
| 10 | **Nhân vật có giống chủ portfolio không** | AST-01 | Nhân vật ẩn danh, dễ thay |

---

## 9. Change log

| Version | Ngày | Thay đổi |
|---------|------|----------|
| 0.1 | 2026-09-09 | Bản đầu, 10 prompt, chủ đề chưa chốt |
| 0.2 | 2026-09-11 | Cập nhật theo OQ-06 (đảo trôi) và OQ-07 (pack CC0 + sinh riêng 5 vật thể); 12 mục |
| **1.0** | **2026-09-11** | **Phủ toàn bộ AST-01…AST-21.** Thêm khối NEGATIVE, bảng SCALE, bảng PALETTE lấy từ Figma. Thêm prompt/đặc tả cho AST-02, AST-05, AST-11, AST-15, AST-16, AST-17, AST-18, AST-19, AST-20. Tách AST-03 thành 5 biến thể theo từng đảo. Sửa bảng màu trong khối STYLE cho khớp token. Ghi nhận 2 câu hỏi mở mới phát sinh từ prototype (chỉ dẫn hướng cầu, tốc độ di chuyển vs hoạt ảnh) và 1 đề xuất thay đổi chiều dài cầu |
