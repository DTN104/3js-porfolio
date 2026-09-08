# Prompt dựng model 3D: 001-3d-world-portfolio

**Feature**: `001-3d-world-portfolio` · **Version**: 0.1 · **Ngày**: 2026-09-08
**Nguồn**: dẫn xuất từ `assets-3d.md` v0.1 · **Dùng cho**: công cụ text-to-3D (Meshy, Tripo, Rodin…) hoặc làm brief đặt hàng cho 3D artist

## 1. Cách dùng

- Mỗi prompt = **STYLE** + **nội dung riêng của asset** + **TECH**. Ba khối ghép lại thành một prompt hoàn chỉnh.
- Khối STYLE ở mục 2 là điểm duy nhất cần sửa nếu đổi hướng mỹ thuật — sửa một chỗ, toàn bộ prompt đổi theo, giữ được tính đồng bộ giữa các model.
- Prompt viết bằng tiếng Anh vì công cụ text-to-3D cho kết quả ổn định hơn nhiều so với tiếng Việt.
- **Hướng mỹ thuật hiện tại là tạm** — bám theo trải nghiệm tham chiếu, chờ chốt **OQ-06**.

## 2. Khối STYLE dùng chung (tạm — chờ OQ-06)

```
STYLE: stylized low-poly, soft rounded shapes with no sharp edges, cozy cartoon village
aesthetic, chunky exaggerated proportions, matte hand-painted flat textures with no
photoreal detail, warm muted palette of sand beige, terracotta, sage green and cream,
readable silhouette when viewed small from a high three-quarter isometric angle,
consistent with a friendly handcrafted miniature-diorama look.
```

## 3. Khối TECH dùng chung

```
TECH: game-ready single mesh, clean quad-dominant topology, under 5000 triangles,
non-overlapping UV unwrap, one 1024x1024 base color texture, PBR metallic-roughness
workflow, Y-up orientation, centered at origin with the base resting on the ground
plane at Y=0, real-world scale in meters, no baked shadows or lighting information in
the texture, no background, no ground plane included, exportable to glTF/GLB.
```

## 4. Prompt theo từng asset

### AST-01 — Nhân vật điều khiển được

```
A stylized low-poly cartoon character for a third-person web experience: a young adult
software developer with chunky chibi proportions, head about one third of total body
height, round glasses, short dark tousled hair, plain long-sleeve shirt tucked into
simple trousers, slip-on shoes, mitten hands with no separated fingers, minimal face
with two dot eyes and a small closed smile, fully symmetrical, standing in A-pose with
arms angled 45 degrees down and feet shoulder-width apart, humanoid proportions
suitable for automatic rigging, 1.6 meters tall.
+ STYLE + TECH
```

> Kiểm tra khi nhận model: đúng A-pose, đối xứng, tay tách khỏi thân (không dính), có đủ khối để auto-rig nhận diện được xương.

### AST-03 — Địa hình nền

```
A small stylized low-poly island terrain for a third-person web experience, about
60 by 60 meters, gently rolling grass surface with three flat plateaus connected by
shallow walkable ramps, a shallow stream crossing the middle from one edge to the
other, sandy shoreline fading outward into rounded rock, no buildings, no trees, no
props, no characters, terrain surface only.
+ STYLE + TECH (bỏ giới hạn 5000 triangles, cho phép tới 20000 cho địa hình)
```

> Đây là asset **khó sinh bằng text-to-3D nhất**. Xem cảnh báo ở mục 5.

### AST-04 — Ranh giới thế giới nhìn thấy được

```
A set of stylized low-poly world-boundary pieces for a cartoon island: a rounded rocky
cliff wall segment, a wooden picket fence segment, and a shoreline rock outcrop with
smooth weathered boulders, designed as separate modular pieces that tile seamlessly
end to end along a straight run and around a 90 degree corner, each piece 4 meters
wide and about 1.5 meters tall.
+ STYLE + TECH
```

### AST-06 — Vật thể tương tác: khu vực **giới thiệu**

```
A stylized low-poly cozy cottage for a cartoon village: a single-storey house with a
steep pitched roof of rounded clay tiles, cream plaster walls with exposed dark wooden
beams, a round-top wooden front door, two square windows with warm glowing interior
light, a small stone chimney, a short front porch with two wooden steps, and a blank
wooden signboard hanging beside the door, about 6 meters wide and 5 meters tall,
exterior only with no interior geometry.
+ STYLE + TECH
```

### AST-07 — Vật thể tương tác: khu vực **kỹ năng**

```
A stylized low-poly outdoor craft workbench station: a sturdy wooden table with a
pegboard panel standing behind it holding simple hand tools, a small metal anvil block
on the tabletop, jars of nails and a mug of brushes, a stack of wooden planks leaning
against one table leg, and a round wooden stool in front, arranged as one connected
scene about 3 meters wide and 2 meters tall.
+ STYLE + TECH
```

### AST-08 — Vật thể tương tác: khu vực **dự án**

```
A stylized low-poly open-air exhibition stand: a wooden pergola frame with a striped
fabric awning stretched over the top, three empty picture easels standing side by side
underneath, and a low wooden display counter in front of them, all display surfaces
left flat and blank so images can be applied as textures later, about 5 meters wide
and 3 meters tall.
+ STYLE + TECH
```

> Yêu cầu ràng buộc: các mặt trưng bày phải **phẳng và trống**, để số lượng dự án thay đổi mà không phải dựng lại model (BO-05, FR-059). Số lượng vật thể của khu vực này còn treo ở **OQ-19**.

### AST-09 — Vật thể tương tác: khu vực **kinh nghiệm**

```
A set of stylized low-poly timeline milestone markers for a cartoon village path: a
wooden signpost with two blank arrow-shaped boards, a small engraved stone marker, a
short lantern post with a warm glowing lamp, and a curved stone-slab path segment,
designed as separate modular pieces that can be repeated along a winding path, each
marker about 1.5 meters tall.
+ STYLE + TECH
```

### AST-10 — Vật thể tương tác: khu vực **liên hệ & CV**

```
A stylized low-poly mailbox and noticeboard pair: a rounded-top metal mailbox mounted
on a wooden post with a raised red flag on the side and a single envelope sticking out
of the slot, standing next to a two-legged wooden noticeboard with a blank cork panel
and a small pitched roof over it, both resting on a small patch of stone paving, about
2 meters wide and 1.8 meters tall in total.
+ STYLE + TECH
```

### AST-12 — Đường đi / lối dẫn hướng

```
A set of stylized low-poly modular path pieces for a cartoon island: a worn dirt path
with scattered flat stepping stones pressed into it and short grass tufts along the
edges, provided in straight, 90 degree corner, T-junction and rounded end-cap
variants, each piece exactly 4 by 4 meters and tiling seamlessly with the others.
+ STYLE + TECH
```

### AST-13 — Prop trang trí (chia 5 prompt)

**AST-13a — Cây và bụi**

```
A set of stylized low-poly cartoon trees and bushes: three tree variants with chunky
rounded canopies made of a few large soft blobs on short tapered trunks, ranging from
3 to 6 meters tall, plus two low rounded bushes and one flowering shrub with simple
petal shapes, each as a separate object.
+ STYLE + TECH
```

**AST-13b — Đá và cỏ**

```
A set of stylized low-poly cartoon ground details: four smooth weathered boulders of
different sizes from 0.3 to 1.5 meters, three grass tuft clusters, two small pebble
scatters, and a patch of clover, each as a separate object with a flat bottom that
sits cleanly on a ground plane.
+ STYLE + TECH
```

**AST-13c — Hàng rào và đèn**

```
A set of stylized low-poly village fixtures: a short wooden picket fence segment 2
meters wide, a matching corner post, a standing lantern post with a warm glowing lamp
box on top about 2.5 meters tall, and a small hanging paper lantern, each as a
separate modular object.
+ STYLE + TECH
```

**AST-13d — Nước và cầu**

```
A set of stylized low-poly water features for a cartoon island: a small stone-rimmed
pond basin with a flat surface plane left separate for a water shader, a short wooden
plank footbridge 4 meters long with simple rope railings, and three flat lily pads,
each as a separate object.
+ STYLE + TECH
```

**AST-13e — Đồ vật nhỏ lấp cảnh**

```
A set of stylized low-poly small cartoon props: a wooden crate, a barrel, a terracotta
flower pot with a small plant, a folded deck chair, a striped beach ball, and a picnic
basket, each as a separate object between 0.3 and 1 meter in size, all sharing one
consistent material palette.
+ STYLE + TECH
```

### AST-14 — Bầu trời / môi trường

```
A stylized cartoon sky panorama for a cozy low-poly game world: clear late-afternoon
sky with a soft vertical gradient from warm cream near the horizon to gentle desaturated
blue at the zenith, a handful of chunky rounded cumulus clouds scattered at mid height,
warm low sun glow near one side of the horizon, no ground, no terrain, no buildings,
seamless 360 degree equirectangular projection.
```

> Đây là ảnh panorama/HDRI, không phải model — dùng công cụ sinh skybox (ví dụ Blockade Labs Skybox AI) chứ không dùng text-to-3D. Khối TECH ở mục 3 **không áp dụng**.

## 5. Cảnh báo: asset không nên sinh bằng text-to-3D

| Mã | Vì sao | Cách nên làm |
|----|--------|--------------|
| AST-01 + AST-02 | Text-to-3D hiện sinh nhân vật **không rig**, và chất lượng rig tự động phụ thuộc mạnh vào tư thế/hình khối. Ba hoạt ảnh đi/chạy/đứng yên thì text-to-3D không tạo được | Sinh model bằng prompt ở trên rồi auto-rig + lấy animation từ thư viện chuyển động có sẵn; hoặc mua nhân vật đã rig kèm animation |
| AST-03 | Địa hình lớn 60×60m vượt khả năng của text-to-3D — kết quả thường méo tỉ lệ, topology không dùng được để đi lại và làm collision | Dựng tay bằng công cụ 3D, hoặc dùng terrain generator rồi phối prop lên trên |
| AST-05 | Là hình học va chạm, không có hình dạng thị giác để mô tả | Sinh từ AST-03 và các vật thể đặc bằng công cụ, không có prompt |
| AST-11 | Là hiệu ứng shader/sprite, không phải model | Làm bằng code |

## 6. Quy ước kiểm tra model nhận về

Mọi model đều phải qua các mục sau trước khi đưa vào dự án:

1. Đúng khối STYLE — đặt cạnh các model khác không bị lệch tông
2. Đúng khối TECH — số tam giác, texture, hướng trục, gốc tọa độ, tỉ lệ mét
3. Đáy model nằm đúng mặt phẳng Y=0, không lơ lửng, không chìm
4. Không có bóng đổ hay ánh sáng bị nướng sẵn vào texture (FR-053 cần hạ mức chi tiết linh hoạt)
5. Với model modular (AST-04, AST-09, AST-12, AST-13c): ghép liền mạch, không hở khe
6. Tổng dung lượng cộng dồn nằm trong ngân sách FR-054 — **giá trị ngân sách chưa chốt, treo ở OQ-04**
