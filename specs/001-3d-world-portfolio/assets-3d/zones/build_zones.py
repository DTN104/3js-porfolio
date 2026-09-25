# build_zones.py — AST-06…AST-10, 5 vật thể tương tác (blockout đúng kích thước + màu spec)
# exec(open("<duong-dan>/build_zones.py").read())
# build_all_zones()  ·  bake_zones(size=512)  ·  export_zones()
#
# Mỗi zone = 1 .glb gồm: mesh chính (1 atlas) + các NODE RIÊNG cho mặt phẳng trống
# (biển hiệu, bảng, giá vẽ, bia, bảng tin) — để áp texture nội dung mà không dựng lại model.
# Hướng: mặt trước = -Y (Blender) = +Z (three). Đáy z=0.
import bpy, bmesh, math, os
from mathutils import Matrix, Vector

OUT_GLB = "/Users/td-macbook-07/Work/threejs-portfolio/prototype/public/models/zones"
OUT_SRC = "/Users/td-macbook-07/Work/threejs-portfolio/specs/001-3d-world-portfolio/assets-3d/zones"

# PALETTE mục 3.5 + màu bổ sung cho vật thể (không có trong PALETTE — xem OQ-30)
PAL = {"woodL": "A87A4F", "woodD": "7A5636", "rockL": "9E8E7C", "rockD": "6E6255",
       "grassD": "6B9A4C", "orange": "E08B45", "board": "F6F9FB",
       "terra": "A2563F", "cream": "EDE4D4", "glass": "B9DAEC", "flag": "C2334D",
       "cork": "C9A66B", "metal": "8794A1", "lamp": "FFE9B8"}
KEYS = list(PAL.keys()); IDX = {k: i for i, k in enumerate(KEYS)}

def s2l(c):
    c /= 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def get_mats():
    out = []
    for k in KEYS:
        h = PAL[k]; n = "Z_" + k
        m = bpy.data.materials.get(n) or bpy.data.materials.new(n)
        m.use_nodes = True
        b = next(x for x in m.node_tree.nodes if x.type == 'BSDF_PRINCIPLED')
        b.inputs['Base Color'].default_value = (s2l(int(h[0:2],16)), s2l(int(h[2:4],16)), s2l(int(h[4:6],16)), 1)
        b.inputs['Roughness'].default_value = 0.92
        b.inputs['Metallic'].default_value = 0.0
        out.append(m)
    return out

# ---------- kit primitive vào một bmesh ----------
class K:
    def __init__(self):
        self.bm = bmesh.new()
    def _set(self, verts, mi):
        fs = set()
        for v in verts:
            fs.update(v.link_faces)
        for f in fs:
            f.material_index = mi
    def box(self, size, center, mi, rot=None, bevel=0.0):
        M = Matrix.Translation(center) @ (rot if rot else Matrix()) @ Matrix.Diagonal((size[0], size[1], size[2], 1.0))
        res = bmesh.ops.create_cube(self.bm, size=1.0, matrix=M, calc_uvs=False)
        vs = res['verts']
        if bevel > 0:
            edges = set()
            for v in vs: edges.update(v.link_edges)
            r = bmesh.ops.bevel(self.bm, geom=list(edges), offset=bevel, segments=1, affect='EDGES', profile=0.7)
            fs = set(r['faces'])
            for v in r['verts']: fs.update(v.link_faces)
            for f in fs: f.material_index = mi
            return
        self._set(vs, mi)
    def cyl(self, r1, r2, h, center, mi, seg=8, rot=None):
        M = Matrix.Translation(center) @ (rot if rot else Matrix())
        try:
            res = bmesh.ops.create_cone(self.bm, cap_ends=True, cap_tris=False, segments=seg, radius1=r1, radius2=r2, depth=h, matrix=M, calc_uvs=False)
        except TypeError:
            res = bmesh.ops.create_cone(self.bm, cap_ends=True, cap_tris=False, segments=seg, diameter1=r1, diameter2=r2, depth=h, matrix=M, calc_uvs=False)
        self._set(res['verts'], mi)
    def prism(self, w, d, h, center, mi, ridge_frac=1.0):
        """Lăng trụ tam giác dọc X (mái nhà): đáy w×d, đỉnh cao h, sống mái dọc X."""
        cx, cy, cz = center
        v = self.bm.verts
        a = [v.new((cx - w/2, cy - d/2, cz)), v.new((cx + w/2, cy - d/2, cz)),
             v.new((cx + w/2, cy + d/2, cz)), v.new((cx - w/2, cy + d/2, cz)),
             v.new((cx - w/2 * ridge_frac, cy, cz + h)), v.new((cx + w/2 * ridge_frac, cy, cz + h))]
        fs = [self.bm.faces.new((a[0], a[3], a[2], a[1])), self.bm.faces.new((a[0], a[1], a[5], a[4])),
              self.bm.faces.new((a[3], a[4], a[5], a[2])), self.bm.faces.new((a[0], a[4], a[3])),
              self.bm.faces.new((a[1], a[2], a[5]))]
        for f in fs: f.material_index = mi
    def halfcyl_top(self, r, d, center, mi, seg=8):
        """Vòm nửa trụ trên đỉnh cửa/hòm thư: trục dọc Y, chỉ nửa trên."""
        cx, cy, cz = center
        v = self.bm.verts
        front, back = [], []
        for i in range(seg + 1):
            a = math.pi * i / seg
            front.append(v.new((cx + r * math.cos(a), cy - d/2, cz + r * math.sin(a))))
            back.append(v.new((cx + r * math.cos(a), cy + d/2, cz + r * math.sin(a))))
        fs = []
        for i in range(seg):
            fs.append(self.bm.faces.new((front[i], front[i+1], back[i+1], back[i])))
        fs.append(self.bm.faces.new(list(reversed(front))))
        fs.append(self.bm.faces.new(back))
        for f in fs: f.material_index = mi
    def finish(self, name, mats):
        bmesh.ops.recalc_face_normals(self.bm, faces=self.bm.faces[:])
        me = bpy.data.meshes.new(name)
        for m in mats: me.materials.append(m)
        self.bm.to_mesh(me); self.bm.free()
        ob = bpy.data.objects.new(name, me)
        bpy.context.collection.objects.link(ob)
        return ob

def panel(name, size, center, mats, mi="board", rot=None):
    """Mặt phẳng TRỐNG, node riêng — để áp texture nội dung sau."""
    k = K(); k.box(size, center, 0, rot=rot); return k.finish(name, [mats[IDX[mi]]])   # đúng 1 material

ROT_Y45 = Matrix.Rotation(math.radians(45), 4, 'Y')
RX = lambda d: Matrix.Rotation(math.radians(d), 4, 'X')
RY = lambda d: Matrix.Rotation(math.radians(d), 4, 'Y')
RZ = lambda d: Matrix.Rotation(math.radians(d), 4, 'Z')

def roof_tiles(k, w, d, h, center, mi, rows=6, lip=0.10):
    """Hàng ngói tròn trên hai mái dốc của prism(w, d, h): mỗi hàng một thanh mỏng nhô ra khỏi mặt mái."""
    cx, cy, cz = center
    ang = math.atan2(h, d / 2)                      # góc dốc mái
    L = math.hypot(h, d / 2)
    nz, ny = math.cos(ang), math.sin(ang)           # pháp tuyến mái (phía -Y): (0, -ny, nz)
    for sy in (-1, 1):
        for i in range(rows):
            t = (i + 0.5) / rows
            y = sy * (d / 2) * (1 - t); z = cz + h * t
            k.box((w + 0.06, 0.16, lip), (cx, y - sy * ny * 0.05, z + nz * 0.05), mi, rot=RX(-sy * math.degrees(ang)))

# ---------- AST-06 nhà ----------
def zone_house(mats):
    k = K(); W, D = IDX["woodD"], IDX["woodL"]
    k.box((5.2, 4.4, 3.0), (0, 0, 1.5), IDX["cream"])                         # tường
    k.box((5.5, 4.7, 0.22), (0, 0, 0.11), IDX["rockD"])                        # móng đá
    for sx in (-1, 1):
        for sy in (-1, 1):
            k.box((0.18, 0.18, 3.0), (sx * 2.55, sy * 2.15, 1.5), W)          # dầm góc
    for sy in (-1, 1):                                                         # dầm ngang trước/sau
        k.box((5.3, 0.14, 0.16), (0, sy * 2.22, 2.05), W); k.box((5.3, 0.14, 0.16), (0, sy * 2.22, 0.95), W)
        k.box((5.3, 0.14, 0.16), (0, sy * 2.22, 2.95), W)
    for sx in (-1, 1):                                                         # dầm ngang hông + chống chéo
        k.box((0.14, 4.5, 0.16), (sx * 2.62, 0, 2.05), W); k.box((0.14, 4.5, 0.16), (sx * 2.62, 0, 0.95), W)
        k.box((0.14, 0.14, 3.0), (sx * 2.62, 0, 1.5), W)
        for sy in (-1, 1):
            k.box((0.10, 1.35, 0.10), (sx * 2.63, sy * 1.05, 1.5), W, rot=RX(sy * 40))
    for x in (-1.3, 1.3):
        k.box((0.14, 0.14, 3.0), (x, -2.22, 1.5), W)
    for x in (-0.65, 0.65):                                                    # chống chéo mặt sau
        k.box((1.2, 0.10, 0.10), (x, 2.23, 1.5), W, rot=RZ(0) @ RY(-45 if x < 0 else 45))
    k.prism(6.2, 5.3, 2.0, (0, 0, 3.0), IDX["terra"])                          # mái dốc
    roof_tiles(k, 6.2, 5.3, 2.0, (0, 0, 3.0), IDX["terra"], rows=6)
    k.box((6.3, 0.22, 0.22), (0, 0, 5.0), IDX["rockD"])                        # sống mái đá
    for sx in (-1, 1):                                                         # ván diềm đầu hồi
        for sy in (-1, 1):
            k.box((0.12, 3.35, 0.14), (sx * 3.12, sy * 1.33, 4.0), W, rot=RX(-sy * math.degrees(math.atan2(2.0, 2.65))))
    for i in range(4):                                                         # ống khói đá xếp
        k.box((0.72 - i * 0.02, 0.72 - i * 0.02, 0.42), (1.9, 0.9, 3.4 + i * 0.42), IDX["rockL"] if i % 2 else IDX["rockD"], rot=RZ(i * 7))
    k.box((0.9, 0.9, 0.18), (1.9, 0.9, 5.15), IDX["rockD"])
    k.box((0.5, 0.5, 0.16), (1.9, 0.9, 5.3), IDX["rockD"])
    # cửa vòm có ván
    k.box((1.1, 0.14, 1.85), (0, -2.24, 0.925), W)
    k.halfcyl_top(0.55, 0.14, (0, -2.24, 1.85), W)
    for x in (-0.3, 0.0, 0.3):
        k.box((0.22, 0.05, 1.6), (x, -2.32, 0.85), D)
    k.halfcyl_top(0.42, 0.05, (0, -2.32, 1.65), D)
    k.box((0.9, 0.05, 0.08), (0, -2.33, 1.15), W)
    k.cyl(0.05, 0.05, 0.06, (0.32, -2.36, 1.0), IDX["orange"], seg=6, rot=RX(90))   # tay nắm
    for x in (-1.75, 1.75):                                                    # cửa sổ + cánh chớp + bệ + hộp hoa
        k.box((0.85, 0.06, 0.85), (x, -2.23, 1.6), W)
        k.box((0.68, 0.05, 0.68), (x, -2.245, 1.6), IDX["glass"])
        k.box((0.06, 0.06, 0.70), (x, -2.26, 1.6), W); k.box((0.70, 0.06, 0.06), (x, -2.26, 1.6), W)
        for sx in (-1, 1):
            k.box((0.30, 0.06, 0.85), (x + sx * 0.60, -2.25, 1.6), D)
        k.box((1.0, 0.16, 0.06), (x, -2.30, 1.15), W)
        k.box((0.8, 0.22, 0.2), (x, -2.36, 1.02), W)
        k.box((0.72, 0.16, 0.10), (x, -2.36, 1.14), IDX["grassD"])
    for sx in (-1, 1):                                                         # cửa sổ hông
        k.box((0.06, 0.75, 0.75), (sx * 2.63, 0.6, 1.7), W)
        k.box((0.05, 0.6, 0.6), (sx * 2.645, 0.6, 1.7), IDX["glass"])
        k.box((0.06, 0.06, 0.62), (sx * 2.66, 0.6, 1.7), W); k.box((0.06, 0.62, 0.06), (sx * 2.66, 0.6, 1.7), W)
    # hiên + 2 bậc + lan can có song
    k.box((2.8, 1.4, 0.26), (0, -2.9, 0.25), D)
    for i in range(6):
        k.box((0.42, 1.4, 0.03), (-1.15 + i * 0.46, -2.9, 0.395), W)
    k.box((2.8, 0.5, 0.12), (0, -3.85, 0.06), D); k.box((2.8, 0.5, 0.12), (0, -3.40, 0.18), D)
    for x in (-1.3, 1.3):
        k.box((0.12, 0.12, 0.95), (x, -3.55, 0.85), W); k.box((0.12, 0.12, 0.95), (x, -2.30, 0.85), W)
        k.box((0.08, 1.3, 0.08), (x, -2.92, 1.28), W)
        for j in range(4):
            k.box((0.04, 0.04, 0.85), (x, -3.45 + j * 0.3, 0.8), D)
    k.box((0.08, 0.55, 0.08), (1.05, -2.5, 2.35), W)                           # tay đỡ biển hiệu
    k.box((0.06, 0.06, 0.34), (1.05, -2.40, 2.50), W, rot=RX(45))            # chống chéo phía trên, không cắt qua biển
    for sx in (-1, 1):                                                         # đèn treo hai bên cửa
        k.box((0.06, 0.12, 0.06), (sx * 0.85, -2.30, 2.35), W)
        k.box((0.16, 0.16, 0.2), (sx * 0.85, -2.36, 2.22), W)
        k.box((0.11, 0.11, 0.14), (sx * 0.85, -2.36, 2.22), IDX["lamp"])
    main = k.finish("AST06_Cottage", mats)
    sign = panel("AST06_Signboard", (0.95, 0.05, 0.62), (1.05, -2.62, 2.0), mats)   # biển hiệu trống
    return [main, sign]

# ---------- AST-07 xưởng ----------
def zone_workshop(mats):
    k = K(); W, D, M = IDX["woodD"], IDX["woodL"], IDX["metal"]
    k.box((3.0, 1.1, 0.10), (0, 0, 0.91), D, bevel=0.02)                       # mặt bàn
    k.box((2.9, 1.0, 0.16), (0, 0, 0.78), W)                                   # tạp dề
    k.box((0.8, 0.04, 0.12), (-0.55, -0.52, 0.78), D); k.cyl(0.03, 0.03, 0.03, (-0.55, -0.55, 0.78), M, seg=6, rot=RX(90))   # ngăn kéo
    for sx in (-1, 1):
        for sy in (-1, 1):
            k.box((0.14, 0.14, 0.86), (sx * 1.35, sy * 0.42, 0.43), W)
        k.box((0.10, 0.9, 0.08), (sx * 1.35, 0, 0.30), W)                     # thanh giằng chân
    k.box((3.0, 0.08, 1.3), (0, 0.62, 1.55), D)                                # pegboard
    k.box((3.04, 0.10, 0.08), (0, 0.62, 2.2), W); k.box((3.04, 0.10, 0.08), (0, 0.62, 0.92), W)
    for r in range(4):                                                         # lỗ chốt
        for c in range(5):
            k.cyl(0.018, 0.018, 0.02, (0.85 + c * 0.14, 0.575, 1.35 + r * 0.19), W, seg=6, rot=RX(90))
    k.box((0.05, 0.06, 0.34), (1.15, 0.55, 1.78), W); k.box((0.2, 0.08, 0.09), (1.15, 0.55, 1.98), M)   # búa
    k.box((0.05, 0.05, 0.30), (0.95, 0.55, 1.95), M); k.box((0.10, 0.05, 0.08), (0.95, 0.55, 2.12), M)   # cờ lê
    k.box((0.28, 0.04, 0.09), (1.35, 0.55, 1.60), M); k.box((0.10, 0.05, 0.06), (1.52, 0.55, 1.66), W)   # cưa
    k.box((0.05, 0.05, 0.18), (1.35, 0.55, 1.95), M); k.box((0.05, 0.05, 0.18), (1.40, 0.55, 1.95), M, rot=RY(18))   # kìm
    # đe: đế gỗ + thân + sừng
    k.box((0.40, 0.26, 0.10), (-0.9, 0.05, 1.01), W)
    k.box((0.30, 0.16, 0.16), (-0.9, 0.05, 1.14), M)
    k.box((0.42, 0.20, 0.10), (-0.9, 0.05, 1.27), M, bevel=0.015)
    k.cyl(0.075, 0.0, 0.26, (-1.22, 0.05, 1.27), M, seg=6, rot=RY(-90))
    k.cyl(0.09, 0.09, 0.18, (0.35, 0.15, 1.05), IDX["glass"], seg=8)           # lọ đinh
    for i in range(4):
        k.box((0.012, 0.012, 0.16), (0.35 + math.cos(i * 1.7) * 0.05, 0.15 + math.sin(i * 1.7) * 0.05, 1.20), M, rot=RY(12 * (i - 2)))
    k.cyl(0.08, 0.08, 0.16, (0.85, -0.15, 1.04), IDX["cream"], seg=8)          # ca cọ
    for i in range(4):
        k.box((0.03, 0.02, 0.24), (0.85 + i * 0.03 - 0.045, -0.15, 1.22), W)
        k.box((0.03, 0.02, 0.05), (0.85 + i * 0.03 - 0.045, -0.15, 1.36), IDX["flag"] if i % 2 else M)
    k.cyl(0.13, 0.11, 0.24, (1.2, 0.3, 1.08), M, seg=8)                        # thùng sơn nhỏ
    for i in range(3):                                                         # ván dựa chân bàn
        k.box((0.22, 0.04, 1.1), (1.62 + i * 0.045, -0.3, 0.52), D, rot=RY(-14))
    k.cyl(0.24, 0.24, 0.06, (0, -1.05, 0.55), D, seg=8)                        # ghế đẩu
    for i in range(3):
        a = math.tau * i / 3
        k.cyl(0.04, 0.04, 0.52, (math.cos(a) * 0.16, -1.05 + math.sin(a) * 0.16, 0.26), W, seg=6)
    k.cyl(0.17, 0.15, 0.28, (-1.55, -0.65, 0.14), M, seg=8)                    # xô kim loại
    k.cyl(0.02, 0.02, 0.34, (-1.55, -0.65, 0.36), M, seg=6, rot=RY(90))
    for x in (-1.6, 1.6):                                                      # cột + mái bạt
        k.cyl(0.07, 0.07, 2.4, (x, -0.95, 1.2), W, seg=6)
        k.box((0.08, 0.9, 0.08), (x, -0.5, 2.38), W, rot=RX(-8))
    k.box((3.4, 2.1, 0.06), (0, 0.0, 2.52), IDX["cream"], rot=RX(6))
    for i in range(8):                                                         # diềm bạt răng cưa
        k.box((0.40, 0.05, 0.18), (-1.5 + i * 0.43, -1.02, 2.33), IDX["terra"] if i % 2 else IDX["cream"])
    k.box((3.45, 0.08, 0.12), (0, 0.98, 2.62), W)
    main = k.finish("AST07_Workbench", mats)
    panels = [panel("AST07_Panel_%d" % (i+1), (0.62, 0.03, 0.72), (x, 0.57, 1.55), mats) for i, x in enumerate((-1.1, -0.4, 0.3))]
    return [main] + panels

# ---------- AST-08 khu trưng bày ----------
def zone_gallery(mats):
    k = K(); W, D = IDX["woodD"], IDX["woodL"]
    k.cyl(2.85, 2.95, 0.25, (0, 0, 0.125), IDX["rockL"], seg=14)               # nền đá tròn
    for i in range(14):                                                        # phiến đá viền
        a = math.tau * i / 14
        k.box((0.72, 0.5, 0.04), (math.cos(a) * 2.55, math.sin(a) * 2.55, 0.26), IDX["rockD"] if i % 2 else IDX["rockL"], rot=RZ(math.degrees(a)))
    for i in range(8):                                                         # phiến đá trong
        a = math.tau * i / 8 + 0.3; r = 1.4
        k.box((0.55, 0.42, 0.03), (math.cos(a) * r, math.sin(a) * r, 0.26), IDX["rockD"], rot=RZ(math.degrees(a)))
    k.box((1.6, 0.5, 0.12), (0, -3.05, 0.06), IDX["rockD"])                    # bậc lên phía trước
    for sx in (-1, 1):
        for sy in (-1, 1):
            k.box((0.16, 0.16, 3.0), (sx * 2.5, sy * 1.25, 1.75), W)          # 4 cột pergola
            k.box((0.26, 0.26, 0.10), (sx * 2.5, sy * 1.25, 0.30), W)         # đế cột
            k.box((0.10, 0.10, 0.7), (sx * 2.5, sy * 1.25 - sy * 0.25, 2.85), D, rot=RX(sy * 40))   # chống chéo
    for sy in (-1, 1):
        k.box((5.5, 0.14, 0.16), (0, sy * 1.25, 3.1), W)
    for sx in (-1, 1):
        k.box((0.14, 2.9, 0.14), (sx * 2.5, 0, 3.1), W)
    for i in range(6):                                                         # rui mái
        k.box((0.10, 2.9, 0.10), (-2.0 + i * 0.8, 0, 3.22), D)
    for i in range(7):                                                         # bạt kẻ sọc, có võng
        x = -2.4 + i * 0.8
        k.box((0.8, 2.95, 0.05), (x, 0, 3.30), IDX["board"] if i % 2 == 0 else IDX["orange"])
        k.box((0.8, 0.06, 0.16), (x, -1.5, 3.22), IDX["board"] if i % 2 == 0 else IDX["orange"])   # diềm trước
    for i, x in enumerate((-1.6, 0.0, 1.6)):                                   # 3 giá vẽ chữ A
        for sx in (-1, 1):
            k.cyl(0.045, 0.045, 1.9, (x + sx * 0.42, 0.25, 0.95 + 0.25), W, seg=6, rot=RY(sx * -9))
        k.cyl(0.045, 0.045, 1.8, (x, 0.75, 0.9 + 0.25), W, seg=6, rot=RX(24))
        k.box((1.1, 0.06, 0.06), (x, 0.28, 0.9 + 0.25), W)
        k.box((1.2, 0.12, 0.05), (x, 0.24, 0.25 + 0.80), D)                    # gờ đỡ tranh
        k.box((0.9, 0.06, 0.06), (x, 0.52, 0.25 + 0.42), W)                    # thanh giằng
    k.box((4.0, 0.6, 0.8), (0, -1.6, 0.25 + 0.4), D)                           # quầy trưng bày thấp
    k.box((4.1, 0.7, 0.08), (0, -1.6, 0.25 + 0.84), W, bevel=0.015)
    for x in (-1.9, -0.6, 0.6, 1.9):
        k.box((0.06, 0.62, 0.72), (x, -1.6, 0.25 + 0.4), W)
    k.box((0.34, 0.24, 0.05), (-1.3, -1.6, 0.25 + 0.905), IDX["terra"])       # vài cuốn sách/tờ rơi trên quầy
    k.box((0.30, 0.22, 0.05), (-1.25, -1.62, 0.25 + 0.955), IDX["cream"])
    k.box((0.26, 0.34, 0.04), (1.1, -1.55, 0.25 + 0.90), IDX["board"], rot=RZ(12))
    k.cyl(0.12, 0.10, 0.18, (1.8, -1.6, 0.25 + 0.97), IDX["terra"], seg=8)     # chậu cây nhỏ
    k.cyl(0.16, 0.16, 0.2, (1.8, -1.6, 0.25 + 1.14), IDX["grassD"], seg=8)
    for sx in (-1, 1):                                                         # chậu cây hai góc trước
        k.cyl(0.26, 0.22, 0.36, (sx * 2.5, -1.65, 0.25 + 0.18), IDX["terra"], seg=8)
        k.cyl(0.34, 0.30, 0.40, (sx * 2.5, -1.65, 0.25 + 0.56), IDX["grassD"], seg=8)
    main = k.finish("AST08_Stand", mats)
    boards = [panel("AST08_Easel_%d" % (i+1), (1.15, 0.05, 1.5), (x, 0.30, 0.25 + 1.55), mats, rot=RX(6)) for i, x in enumerate((-1.6, 0.0, 1.6))]
    return [main] + boards

# ---------- AST-09 bộ cột mốc ----------
def zone_monument(mats):
    W, D, R, Rd = IDX["woodD"], IDX["woodL"], IDX["rockL"], IDX["rockD"]
    objs = []
    # cột trung tâm 3,8 m: đá xếp tầng có vát + đế + chóp
    k = K()
    k.cyl(1.25, 1.15, 0.22, (0, 0, 0.11), Rd, seg=10)
    z = 0.22
    for i, (w, h) in enumerate(((1.4, 0.5), (1.15, 0.55), (0.95, 0.6), (0.8, 0.7), (0.65, 0.75), (0.5, 0.48))):
        k.box((w, w, h), (0, 0, z + h / 2), R if i % 2 == 0 else Rd, rot=RZ(i * 10), bevel=0.04)
        z += h
    k.cyl(0.36, 0.0, 0.34, (0, 0, z + 0.17), Rd, seg=4, rot=RZ(45))            # chóp
    k.box((0.86, 0.10, 0.62), (0, -0.37, 2.55), Rd)                            # khung bia
    objs.append(k.finish("AST09_Pillar", mats))
    objs.append(panel("AST09_Plaque", (0.7, 0.04, 0.5), (0, -0.44, 2.55), mats))
    # đường đá cong 3 đoạn 2 m quanh cột (r = 2.4) + viền sỏi
    k = K()
    for j in range(3):
        a0 = math.radians(-150 + j * 55)
        for i in range(6):
            a = a0 + math.radians(9) * i
            k.box((0.58, 0.32, 0.06), (math.cos(a) * 2.4, math.sin(a) * 2.4, 0.03), R if i % 2 else Rd, rot=RZ(math.degrees(a) + 90))
            for rr in (2.16, 2.64):
                k.cyl(0.05, 0.04, 0.05, (math.cos(a + 0.04) * rr, math.sin(a + 0.04) * rr, 0.025), Rd if i % 2 else R, seg=5)
    objs.append(k.finish("AST09_Path", mats))
    # 3 mốc dọc đường: biển gỗ 2 mũi tên, bia đá, cột đèn (cao ~1,5 m)
    a = math.radians(-160); px, py = math.cos(a) * 3.1, math.sin(a) * 3.1
    k = K(); k.cyl(0.06, 0.06, 1.5, (px, py, 0.75), W, seg=6)
    k.cyl(0.09, 0.0, 0.12, (px, py, 1.56), W, seg=6)
    k.cyl(0.12, 0.10, 0.08, (px, py, 0.04), Rd, seg=6)
    # mũi tên: đầu nhọn gắn vào bảng (bảng vẫn là panel phẳng riêng)
    k.cyl(0.11, 0.0, 0.16, (px + 0.73, py, 1.32), D, seg=4, rot=RY(90) @ RZ(45))
    k.cyl(0.11, 0.0, 0.16, (px - 0.73, py, 1.05), D, seg=4, rot=RY(-90) @ RZ(45))
    objs.append(k.finish("AST09_Signpost", mats))
    objs.append(panel("AST09_Arrow_1", (0.7, 0.04, 0.22), (px + 0.3, py, 1.32), mats, mi="board"))
    objs.append(panel("AST09_Arrow_2", (0.7, 0.04, 0.22), (px - 0.3, py, 1.05), mats, mi="board"))
    a = math.radians(-100); px, py = math.cos(a) * 3.1, math.sin(a) * 3.1
    k = K(); rot = RZ(math.degrees(a) + 90)
    k.box((0.7, 0.4, 0.8), (px, py, 0.4), R, rot=rot)
    k.halfcyl_top(0.35, 0.4, (px, py, 0.8), R, seg=8) if abs(math.degrees(a) + 90) < 1 else None
    k.box((0.7, 0.4, 0.3), (px, py, 0.95), R, rot=rot, bevel=0.06)
    k.box((0.86, 0.56, 0.12), (px, py, 0.06), Rd, rot=rot)
    objs.append(k.finish("AST09_StoneMarker", mats))
    objs.append(panel("AST09_StoneFace", (0.5, 0.04, 0.6), (px - math.cos(a) * 0.22, py - math.sin(a) * 0.22, 0.55), mats, mi="board", rot=rot))
    a = math.radians(-40); px, py = math.cos(a) * 3.1, math.sin(a) * 3.1
    k = K(); k.cyl(0.06, 0.06, 1.3, (px, py, 0.65), W, seg=6)
    k.cyl(0.12, 0.10, 0.08, (px, py, 0.04), Rd, seg=6)
    k.box((0.26, 0.26, 0.04), (px, py, 1.32), W)                               # đáy lồng
    for sx in (-1, 1):
        for sy in (-1, 1):
            k.box((0.03, 0.03, 0.30), (px + sx * 0.115, py + sy * 0.115, 1.49), W)
    k.box((0.17, 0.17, 0.26), (px, py, 1.49), IDX["lamp"])
    k.cyl(0.20, 0.0, 0.16, (px, py, 1.72), W, seg=4, rot=RZ(45))               # chóp lồng
    k.cyl(0.02, 0.02, 0.08, (px, py, 1.84), IDX["metal"], seg=6)
    objs.append(k.finish("AST09_LanternPost", mats))
    return objs

# ---------- AST-10 hòm thư + bảng tin ----------
def zone_mailbox(mats):
    k = K(); W, D, O = IDX["woodD"], IDX["woodL"], IDX["orange"]
    k.box((2.5, 1.3, 0.12), (0, 0, 0.06), IDX["rockL"])                        # nền đá nhỏ
    for i in range(4):
        for j in range(2):
            k.box((0.5, 0.52, 0.03), (-0.9 + i * 0.6, -0.3 + j * 0.6, 0.13), IDX["rockD"] if (i + j) % 2 else IDX["rockL"])
    k.box((0.14, 0.14, 1.15), (-0.7, 0, 0.12 + 0.575), W)                      # cột hòm thư + chống chéo
    k.box((0.10, 0.10, 0.5), (-0.7, -0.17, 1.05), W, rot=RX(-40))
    k.box((0.56, 0.9, 0.36), (-0.7, 0, 1.45), O)                               # thân hòm thư
    k.halfcyl_top(0.28, 0.9, (-0.7, 0, 1.63), O)                               # nóc vòm
    k.box((0.60, 0.06, 0.40), (-0.7, -0.45, 1.45), O); k.halfcyl_top(0.30, 0.06, (-0.7, -0.45, 1.65), O)   # gờ cửa trước
    k.box((0.44, 0.03, 0.28), (-0.7, -0.485, 1.44), IDX["rockD"])              # cửa hòm (viền tối)
    k.box((0.40, 0.03, 0.24), (-0.7, -0.49, 1.44), O)
    k.box((0.36, 0.04, 0.06), (-0.7, -0.51, 1.55), IDX["rockD"])               # khe thư
    k.cyl(0.03, 0.03, 0.04, (-0.7, -0.52, 1.36), IDX["metal"], seg=6, rot=RX(90))   # tay nắm
    k.box((0.28, 0.16, 0.02), (-0.7, -0.58, 1.60), IDX["board"], rot=RX(25))   # phong thư thò ra
    k.box((0.10, 0.10, 0.005), (-0.62, -0.60, 1.66), IDX["flag"], rot=RX(25))  # tem
    k.cyl(0.035, 0.035, 0.08, (-0.40, 0.1, 1.55), IDX["metal"], seg=6, rot=RY(90))   # bản lề cờ
    k.box((0.05, 0.05, 0.42), (-0.40, 0.1, 1.76), IDX["flag"])                 # cờ đỏ dựng
    k.box((0.06, 0.24, 0.16), (-0.40, 0.1, 2.02), IDX["flag"])
    for x in (0.35, 1.05):                                                     # bảng tin 2 chân + giằng
        k.box((0.12, 0.12, 1.55), (x, 0, 0.12 + 0.775), W)
    k.box((0.8, 0.08, 0.08), (0.7, 0, 0.55), W)
    k.box((0.9, 0.1, 0.72), (0.7, 0, 1.32), W)                                 # khung bảng
    k.box((0.96, 0.12, 0.06), (0.7, 0, 0.95), D); k.box((0.96, 0.12, 0.06), (0.7, 0, 1.69), D)
    k.prism(1.15, 0.6, 0.24, (0.7, 0, 1.74), IDX["terra"])                     # mái nhỏ
    roof_tiles(k, 1.15, 0.6, 0.24, (0.7, 0, 1.74), IDX["terra"], rows=2, lip=0.05)
    k.box((1.2, 0.08, 0.06), (0.7, 0, 1.98), IDX["rockD"])
    main = k.finish("AST10_Mailbox", mats)
    board = panel("AST10_Board", (0.78, 0.03, 0.6), (0.7, -0.065, 1.32), mats, mi="cork")   # bảng tin cork trống
    return [main, board]

ZONES = [("AST06", "house", zone_house), ("AST07", "workshop", zone_workshop), ("AST08", "gallery", zone_gallery),
         ("AST09", "monument", zone_monument), ("AST10", "mailbox", zone_mailbox)]

def build_all_zones():
    for o in list(bpy.data.objects):
        if o.type == 'MESH' and o.name[:5] in ("AST06", "AST07", "AST08", "AST09", "AST10"):
            bpy.data.objects.remove(o, do_unlink=True)
    mats = get_mats()
    rows = []
    for code, kind, fn in ZONES:
        objs = fn(mats)
        xs, ys, zs, tris = [], [], [], 0
        for o in objs:
            for v in o.data.vertices:
                xs.append(v.co.x); ys.append(v.co.y); zs.append(v.co.z)
            tris += sum(len(p.vertices) - 2 for p in o.data.polygons)
        rows.append("%s %-9s %4.2f x %4.2f x cao %4.2f m | tris %4d | %d node (%s)" % (
            code, kind, max(xs)-min(xs), max(ys)-min(ys), max(zs), tris, len(objs),
            ", ".join(o.name.split("_", 1)[1] for o in objs[1:]) or "-"))
    return "\n".join(rows)

def zone_objects(code):
    return [o for o in bpy.data.objects if o.type == 'MESH' and o.name.startswith(code)]

def bake_zones(size=512):
    """Bake mesh chính của từng zone; các panel trống giữ material phẳng (để áp texture sau)."""
    import numpy as np
    todo = [o for code, kind, fn in ZONES for o in zone_objects(code) if len(o.data.materials) > 1]
    for ob in todo:                                                            # mọi mesh nhiều material (panel chỉ có 1)
        bpy.ops.object.select_all(action='DESELECT')
        ob.select_set(True); bpy.context.view_layer.objects.active = ob
        bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.uv.smart_project(angle_limit=1.15, island_margin=0.02)
        bpy.ops.object.mode_set(mode='OBJECT')
        old = bpy.data.images.get(ob.name + "_BaseColor")
        if old: bpy.data.images.remove(old)
        img = bpy.data.images.new(ob.name + "_BaseColor", size, size, alpha=False)
        for slot in ob.material_slots:
            nt = slot.material.node_tree
            tex = nt.nodes.get("BAKE_TARGET")
            if tex is None:
                tex = nt.nodes.new('ShaderNodeTexImage'); tex.name = "BAKE_TARGET"; tex.location = (-700, 400)
            tex.image = img
            for x in nt.nodes: x.select = False
            tex.select = True; nt.nodes.active = tex
        sc = bpy.context.scene
        sc.render.engine = 'CYCLES'; sc.cycles.samples = 1
        sc.render.bake.use_pass_direct = False; sc.render.bake.use_pass_indirect = False
        sc.render.bake.use_pass_color = True; sc.render.bake.margin = 6; sc.render.bake.use_clear = True
        bpy.ops.object.bake(type='DIFFUSE')
        prev = bpy.data.materials.get(ob.name + "_Atlas")
        if prev: bpy.data.materials.remove(prev)
        at = bpy.data.materials.new(ob.name + "_Atlas"); at.use_nodes = True
        nt = at.node_tree
        bsdf = next(x for x in nt.nodes if x.type == 'BSDF_PRINCIPLED')
        bsdf.inputs['Roughness'].default_value = 0.92; bsdf.inputs['Metallic'].default_value = 0.0
        tex = nt.nodes.new('ShaderNodeTexImage'); tex.image = img; tex.interpolation = 'Closest'
        nt.links.new(bsdf.inputs['Base Color'], tex.outputs['Color'])
        me = ob.data
        me.materials.clear(); me.materials.append(at)
        for p in me.polygons: p.material_index = 0
        me.update()
        buf = np.empty(img.size[0] * img.size[1] * 4, dtype=np.float32)
        img.pixels.foreach_get(buf)
        px = buf.reshape(-1, 4); rgb = px[:, :3]
        pal = np.array([[int(PAL[k][0:2],16), int(PAL[k][2:4],16), int(PAL[k][4:6],16)] for k in KEYS], dtype=np.float32) / 255.0
        d = ((rgb[:, None, :] - pal[None, :, :]) ** 2).sum(-1)
        mask = rgb.sum(1) > 0.08
        px[mask, :3] = pal[d.argmin(1)[mask]]
        # chi tiết mảnh (song lan can 4 cm) chiếm chưa tới 1 texel -> bake bỏ trống (đen). Lấp texel trống
        # bằng màu texel đã bake gần nhất (dilate 8 lượt) để không lòi vệt đen.
        W_ = img.size[0]
        grid = px[:, :3].reshape(img.size[1], W_, 3)
        filled = mask.reshape(img.size[1], W_)
        for _ in range(8):
            if filled.all(): break
            g2 = grid.copy(); f2 = filled.copy()
            for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
                src_c = np.roll(grid, (dy, dx), axis=(0, 1)); src_f = np.roll(filled, (dy, dx), axis=(0, 1))
                take = (~f2) & src_f
                g2[take] = src_c[take]; f2 |= take
            grid, filled = g2, f2
        px[:, :3] = grid.reshape(-1, 3)
        img.pixels.foreach_set(px.reshape(-1)); img.update()
    return "baked %d mesh @ %dpx; panel giu 1 material phang" % (len(todo), size)

def export_zones():
    os.makedirs(OUT_GLB, exist_ok=True)
    out = []
    for code, kind, fn in ZONES:
        objs = zone_objects(code)
        bpy.ops.object.select_all(action='DESELECT')
        for o in objs:
            o.location = (0, 0, 0); o.rotation_euler = (0, 0, 0); o.hide_render = False; o.hide_viewport = False
            o.select_set(True)
        bpy.context.view_layer.objects.active = objs[0]
        bpy.ops.export_scene.gltf(filepath=os.path.join(OUT_GLB, code + ".glb"), export_format='GLB',
                                  use_selection=True, export_apply=True, export_yup=True)
        out.append("%s.glb <- %d node" % (code, len(objs)))
    bpy.ops.object.select_all(action='DESELECT')
    return " | ".join(out)

def layout_zones(gap=8.0):
    for i, (code, kind, fn) in enumerate(ZONES):
        for o in zone_objects(code):
            o.hide_render = False; o.hide_viewport = False
            o.location = ((i - 2) * gap, 0, 0)
