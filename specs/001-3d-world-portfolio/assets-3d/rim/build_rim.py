# build_rim.py — AST-04 mép đảo, bộ modular cho 001-3d-world-portfolio
# exec(open("<duong-dan>/build_rim.py").read())
# build_all_rim()  ·  bake_rim(size=256)  ·  check_tiling(r)  ·  test_ring(r, n)  ·  export_rim()
#
# Ghi chú thiết kế: đoạn được uốn cong theo cung bán kính R0 = 8.5 m — điểm giữa của
# khoảng 7,5–9,5 m mà nghiệm thu #1 yêu cầu. Đoạn thẳng 3 m lệch khỏi cung tới 13–15 cm
# ở hai đầu khoảng; uốn theo 8.5 thì sai lệch còn khoảng ±3 cm ở cả hai biên.
import bpy, bmesh, math, random, os
from mathutils import Matrix

OUT_GLB = "/Users/td-macbook-07/Work/threejs-portfolio/prototype/public/models/rim"
OUT_SRC = "/Users/td-macbook-07/Work/threejs-portfolio/specs/001-3d-world-portfolio/assets-3d/rim"

R0 = 8.5            # bán kính uốn tham chiếu
SEGLEN = 3.0        # chiều dài mỗi đoạn theo spec
ANG = SEGLEN / R0   # góc mở của một đoạn
SKIRT = -0.18       # đáy thụt xuống dưới Y=0 để không bao giờ hở chân (nghiệm thu #3)

PAL = {"woodD": "7A5636", "woodL": "A87A4F", "rockL": "9E8E7C", "rockD": "6E6255",
       "grassL": "8CBE68", "grassD": "6B9A4C", "flower": "F6F9FB"}
KEYS = list(PAL.keys())
IDX = {k: i for i, k in enumerate(KEYS)}

def s2l(c):
    c /= 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def get_mats():
    out = []
    for k in KEYS:
        h = PAL[k]; n = "R_" + k
        m = bpy.data.materials.get(n) or bpy.data.materials.new(n)
        m.use_nodes = True
        b = next(x for x in m.node_tree.nodes if x.type == 'BSDF_PRINCIPLED')
        b.inputs['Base Color'].default_value = (s2l(int(h[0:2],16)), s2l(int(h[2:4],16)), s2l(int(h[4:6],16)), 1)
        b.inputs['Roughness'].default_value = 0.92
        b.inputs['Metallic'].default_value = 0.0
        out.append(m)
    return out

# ---------- toạ độ trên cung ----------
def arc_xy(t, dr=0.0):
    """t in [-0.5, 0.5] dọc đoạn; dr là độ lệch hướng bán kính (ra ngoài là +)."""
    a = t * ANG
    R = R0 + dr
    return (R * math.sin(a), R * math.cos(a) - R0)

END_P = arc_xy(+0.5)
END_M = arc_xy(-0.5)

def _faces(vs):
    fs = set()
    for v in vs:
        fs.update(v.link_faces)
    return fs

def sweep(bm, profile, mi, steps=5, t0=-0.5, t1=0.5, cap=True):
    """Quét một mặt cắt (dr, dz) dọc cung."""
    rings = []
    for i in range(steps + 1):
        t = t0 + (t1 - t0) * i / steps
        ring = []
        for dr, dz in profile:
            x, y = arc_xy(t, dr)
            ring.append(bm.verts.new((x, y, dz)))
        rings.append(ring)
    n = len(profile)
    fs = []
    for A, B in zip(rings[:-1], rings[1:]):
        for k in range(n):
            k2 = (k + 1) % n
            fs.append(bm.faces.new((A[k], A[k2], B[k2], B[k])))
    if cap:
        fs.append(bm.faces.new(list(reversed(rings[0]))))
        fs.append(bm.faces.new(rings[-1]))
    for f in fs:
        f.material_index = mi
    return fs

def post(bm, t, dr, h, w, mi, taper=0.82):
    x, y = arc_xy(t, dr)
    M = Matrix.Translation((x, y, (h + SKIRT) / 2 + SKIRT / 2))
    try:
        res = bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=4,
                                    radius1=w, radius2=w * taper, depth=h - SKIRT, matrix=M, calc_uvs=False)
    except TypeError:
        res = bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=4,
                                    diameter1=w, diameter2=w * taper, depth=h - SKIRT, matrix=M, calc_uvs=False)
    for f in _faces(res['verts']):
        f.material_index = mi
    return res['verts']

def ball(bm, rad, loc, mi, sub=1, squash=1.0, jit=0.0, seed=None):
    if seed is not None:
        random.seed(seed)
    try:
        res = bmesh.ops.create_icosphere(bm, subdivisions=sub, radius=rad,
                                         matrix=Matrix.Translation(loc), calc_uvs=False)
    except TypeError:
        res = bmesh.ops.create_icosphere(bm, subdivisions=sub, diameter=rad,
                                         matrix=Matrix.Translation(loc), calc_uvs=False)
    for v in res['verts']:
        v.co.z = loc[2] + (v.co.z - loc[2]) * squash
        if jit:
            v.co.x += random.uniform(-jit, jit) * rad
            v.co.y += random.uniform(-jit, jit) * rad
    for f in _faces(res['verts']):
        f.material_index = mi
    return res['verts']

def finish(bm, name, mats):
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    me = bpy.data.meshes.new(name)
    for m in mats:
        me.materials.append(m)
    bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    return ob

# ---------- 4 mảnh ----------
def fence(name, mats):
    """Hàng rào cọc + dây. Cọc đặt ở t=-0.5 và t=0 — cọc t=+0.5 là của đoạn kế tiếp,
    nên ghép liên tiếp ra khoảng cách cọc đều, không bị hai cọc chồng lên nhau."""
    bm = bmesh.new()
    for t in (-0.5, 0.0):
        post(bm, t, 0.0, 0.72, 0.075, IDX["woodD"])
    for z, r in ((0.62, 0.030), (0.42, 0.026)):       # 2 sợi dây
        prof = [(-r, z - r), (r, z - r), (r, z + r), (-r, z + r)]
        sweep(bm, prof, IDX["woodL"], steps=6)
    return finish(bm, name, mats)

def kerb(name, mats):
    """Bờ đá thấp, mặt trên phủ một dải rêu."""
    bm = bmesh.new()
    prof = [(-0.24, SKIRT), (0.24, SKIRT), (0.17, 0.30), (-0.17, 0.30)]
    sweep(bm, prof, IDX["rockL"], steps=6)
    prof_moss = [(-0.155, 0.295), (0.155, 0.295), (0.125, 0.345), (-0.125, 0.345)]
    sweep(bm, prof_moss, IDX["grassD"], steps=6)
    random.seed(4)
    for t in (-0.34, -0.02, 0.30):
        x, y = arc_xy(t, random.uniform(-0.08, 0.08))
        ball(bm, 0.115, (x, y, 0.355), IDX["grassL"], sub=1, squash=0.62, jit=0.22, seed=int(t*100)+9)
    return finish(bm, name, mats)

def boulders(name, mats):
    """Cụm đá tròn xen bụi cỏ — dáng bất quy tắc nên mối ghép không lộ."""
    bm = bmesh.new()
    random.seed(17)
    plan = [(-0.45, 0.02, 0.40), (-0.20, -0.11, 0.31), (0.06, 0.10, 0.37), (0.30, -0.05, 0.28), (0.47, 0.08, 0.22)]
    for i, (t, dr, r) in enumerate(plan):
        x, y = arc_xy(t, dr)
        vs = ball(bm, r, (x, y, r * 0.62), IDX["rockL"] if i % 3 else IDX["rockD"],
                  sub=1, squash=0.80, jit=0.18, seed=17 + i)
        for v in vs:
            if v.co.z < SKIRT:
                v.co.z = SKIRT
    for t, dr in ((-0.32, 0.15), (-0.06, 0.17), (0.19, -0.16), (0.42, 0.14)):
        x, y = arc_xy(t, dr)
        for k in range(5):
            a = math.tau * k / 5
            M = Matrix.Translation((x + math.cos(a) * 0.04, y + math.sin(a) * 0.04, 0.10))
            try:
                res = bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=4,
                                            radius1=0.022, radius2=0.004, depth=0.26, matrix=M, calc_uvs=False)
            except TypeError:
                res = bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=4,
                                            diameter1=0.022, diameter2=0.004, depth=0.26, matrix=M, calc_uvs=False)
            for f in _faces(res['verts']):
                f.material_index = IDX["grassD"] if k % 2 else IDX["grassL"]
    return finish(bm, name, mats)

def marker(name, mats):
    """Cột mốc 1,6 m + hộp đèn. Kính đèn dùng #F6F9FB, KHÔNG dùng cam #E08B45 —
    màu cam là màu nhấn dành riêng cho vật tương tác được (quy tắc mục 3.5)."""
    bm = bmesh.new()
    post(bm, 0.0, 0.0, 1.42, 0.085, IDX["woodD"], taper=0.80)
    x, y = arc_xy(0.0)
    for dz, r, mi in ((1.46, 0.115, IDX["woodD"]), (1.56, 0.095, IDX["flower"]), (1.66, 0.125, IDX["woodD"])):
        M = Matrix.Translation((x, y, dz))
        try:
            res = bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=4,
                                        radius1=r, radius2=r * (0.6 if dz > 1.6 else 1.0),
                                        depth=0.10 if dz != 1.56 else 0.13, matrix=M, calc_uvs=False)
        except TypeError:
            res = bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=4,
                                        diameter1=r, diameter2=r * (0.6 if dz > 1.6 else 1.0),
                                        depth=0.10 if dz != 1.56 else 0.13, matrix=M, calc_uvs=False)
        for f in _faces(res['verts']):
            f.material_index = mi
    ob = finish(bm, name, mats)
    me = ob.data
    k = 1.60 / max(v.co.z for v in me.vertices)    # spec chot cot moc dung 1,6 m
    for v in me.vertices:
        v.co *= k
    me.update()
    return ob

PIECES = [("AST04a_Fence", fence), ("AST04b_Kerb", kerb),
          ("AST04c_Boulders", boulders), ("AST04d_MarkerPost", marker)]
NAMES = [n for n, _ in PIECES]

def build_all_rim():
    for o in list(bpy.data.objects):
        if o.type == 'MESH' and (o.name.startswith("AST04") or "_rimshot" in o.name):
            bpy.data.objects.remove(o, do_unlink=True)
    mats = get_mats()
    rows = []
    for n, fn in PIECES:
        ob = fn(n, mats)
        me = ob.data
        zs = [v.co.z for v in me.vertices]
        xs = [v.co.x for v in me.vertices]
        rows.append("%-20s cao tren mat dat %.2fm | chan thut %.2fm | rong %.2fm | tris %3d"
                    % (n, max(zs), -min(zs), max(xs) - min(xs),
                       sum(len(p.vertices) - 2 for p in me.polygons)))
    return "\n".join(rows)

# ---------- kiểm ghép: đo khe thật giữa hai đoạn liên tiếp ----------
def place(ob, r, theta):
    ob.location = (r * math.sin(theta), r * math.cos(theta), 0.0)
    ob.rotation_euler = (0.0, 0.0, -theta)

def _world(lx, ly, r, theta):
    c, s = math.cos(theta), math.sin(theta)
    return (lx * c + ly * s + r * s, -lx * s + ly * c + r * c)

def check_tiling(r, n=6):
    """Bước góc = chiều dài đoạn / r. Đo khoảng cách giữa đầu (+) của đoạn k và
    đầu (-) của đoạn k+1 — đó chính là khe hở thật."""
    step = SEGLEN / r
    worst = 0.0
    for k in range(n - 1):
        a = _world(END_P[0], END_P[1], r, k * step)
        b = _world(END_M[0], END_M[1], r, (k + 1) * step)
        worst = max(worst, math.hypot(a[0] - b[0], a[1] - b[1]))
    return "r=%.1fm  buoc %.1f deg  khe lon nhat giua 2 doan: %.1f mm" % (r, math.degrees(step), worst * 1000)

def test_ring(r=9.0, n=9):
    for o in list(bpy.data.objects):
        if "_rimshot" in o.name:
            bpy.data.objects.remove(o, do_unlink=True)
    step = SEGLEN / r
    order = ["AST04a_Fence", "AST04a_Fence", "AST04b_Kerb", "AST04b_Kerb",
             "AST04c_Boulders", "AST04b_Kerb", "AST04a_Fence", "AST04d_MarkerPost", "AST04b_Kerb"]
    for k in range(n):
        src = bpy.data.objects[order[k % len(order)]]
        o = src.copy(); o.data = src.data
        o.name = "%s_rimshot%02d" % (src.name, k)
        bpy.context.collection.objects.link(o)
        place(o, r, (k - (n - 1) / 2) * step)
        o.hide_render = False; o.hide_viewport = False
    for n_ in NAMES:
        bpy.data.objects[n_].hide_render = True
        bpy.data.objects[n_].hide_viewport = True
    return "da xep %d doan tren cung r=%.1fm" % (n, r)

# ---------- bake + export, cùng pipeline với đảo và prop ----------
def bake_rim(size=256):
    for name in NAMES:
        ob = bpy.data.objects[name]
        bpy.ops.object.select_all(action='DESELECT')
        ob.select_set(True)
        bpy.context.view_layer.objects.active = ob
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.uv.smart_project(angle_limit=1.15, island_margin=0.06)
        bpy.ops.object.mode_set(mode='OBJECT')
        old = bpy.data.images.get(name + "_BaseColor")
        if old:
            bpy.data.images.remove(old)
        img = bpy.data.images.new(name + "_BaseColor", size, size, alpha=False)
        for slot in ob.material_slots:
            nt = slot.material.node_tree
            tex = nt.nodes.get("BAKE_TARGET")
            if tex is None:
                tex = nt.nodes.new('ShaderNodeTexImage')
                tex.name = "BAKE_TARGET"
                tex.location = (-700, 400)
            tex.image = img
            for x in nt.nodes:
                x.select = False
            tex.select = True
            nt.nodes.active = tex
        sc = bpy.context.scene
        sc.render.engine = 'CYCLES'
        sc.cycles.samples = 1
        sc.render.bake.use_pass_direct = False
        sc.render.bake.use_pass_indirect = False
        sc.render.bake.use_pass_color = True
        sc.render.bake.margin = 4
        sc.render.bake.use_clear = True
        bpy.ops.object.bake(type='DIFFUSE')
        prev = bpy.data.materials.get(name + "_Atlas")
        if prev:
            bpy.data.materials.remove(prev)
        at = bpy.data.materials.new(name + "_Atlas")
        at.use_nodes = True
        nt = at.node_tree
        bsdf = next(x for x in nt.nodes if x.type == 'BSDF_PRINCIPLED')
        bsdf.inputs['Roughness'].default_value = 0.92
        bsdf.inputs['Metallic'].default_value = 0.0
        tex = nt.nodes.new('ShaderNodeTexImage')
        tex.image = img
        tex.interpolation = 'Closest'
        nt.links.new(bsdf.inputs['Base Color'], tex.outputs['Color'])
        me = ob.data
        me.materials.clear()
        me.materials.append(at)
        for p in me.polygons:
            p.material_index = 0
        me.update()
        _snap(img)
    return "baked %d manh @ %dpx" % (len(NAMES), size)

def _snap(img):
    import numpy as np
    buf = np.empty(img.size[0] * img.size[1] * 4, dtype=np.float32)
    img.pixels.foreach_get(buf)
    px = buf.reshape(-1, 4)
    rgb = px[:, :3]
    pal = np.array([[int(PAL[k][0:2],16), int(PAL[k][2:4],16), int(PAL[k][4:6],16)] for k in KEYS],
                   dtype=np.float32) / 255.0
    d = ((rgb[:, None, :] - pal[None, :, :]) ** 2).sum(-1)
    mask = rgb.sum(1) > 0.08
    px[mask, :3] = pal[d.argmin(1)[mask]]
    img.pixels.foreach_set(px.reshape(-1))
    img.update()

def export_rim():
    os.makedirs(OUT_GLB, exist_ok=True)
    bpy.ops.object.select_all(action='DESELECT')
    for n in NAMES:
        ob = bpy.data.objects[n]
        ob.hide_render = False; ob.hide_viewport = False
        ob.location = (0, 0, 0); ob.rotation_euler = (0, 0, 0)
        ob.select_set(True)
    bpy.context.view_layer.objects.active = bpy.data.objects[NAMES[0]]
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT_GLB, "AST04.glb"),
                              export_format='GLB', use_selection=True,
                              export_apply=True, export_yup=True)
    bpy.ops.object.select_all(action='DESELECT')
    return "AST04.glb <- %d manh" % len(NAMES)


# ---------- xếp mảnh theo viền BẦU DỤC của đảo, không phải cung tròn ----------
def fit_ellipse(a, b, inset=0.85, seglen=SEGLEN, samples=3000):
    """Đi dọc viền theo chiều dài cung, cứ mỗi seglen mét đặt một mảnh.
    Trả về [(x, y, rot_z)]. Bước cuối được chia đều lại để khép kín, không hở.

    Vì sao cần: nghiệm thu #1 nói 'cung tròn bán kính 7,5-9,5 m', nhưng không đảo nào
    tròn — AST-03a là 18,00 x 16,14 m. Xếp theo bán kính cố định thì chỗ trục ngắn
    mảnh lòi ra ngoài mặt cỏ."""
    A, B = a - inset, b - inset
    pts = [(A * math.sin(2*math.pi*i/samples), B * math.cos(2*math.pi*i/samples))
           for i in range(samples + 1)]
    cum = [0.0]
    for p, q in zip(pts[:-1], pts[1:]):
        cum.append(cum[-1] + math.hypot(q[0]-p[0], q[1]-p[1]))
    total = cum[-1]
    n = max(3, round(total / seglen))
    step = total / n                       # chia đều lại -> khép kín tuyệt đối
    out = []
    j = 0
    for k in range(n):
        s = k * step
        while j < samples and cum[j+1] < s:
            j += 1
        x, y = pts[j]
        nx, ny = x / (A*A), y / (B*B)      # pháp tuyến hướng ra ngoài
        L = math.hypot(nx, ny)
        nx, ny = nx/L, ny/L
        out.append((x, y, math.atan2(-nx, ny)))
    return out, step

def ring_on_island(a, b, inset=0.85, skip=(), order=None, prefix="rimshot"):
    for o in list(bpy.data.objects):
        if prefix in o.name:
            bpy.data.objects.remove(o, do_unlink=True)
    slots, step = fit_ellipse(a, b, inset)
    if order is None:
        order = ["AST04b_Kerb","AST04b_Kerb","AST04a_Fence","AST04a_Fence","AST04c_Boulders",
                 "AST04b_Kerb","AST04a_Fence","AST04d_MarkerPost","AST04b_Kerb","AST04c_Boulders"]
    for k, (x, y, rz) in enumerate(slots):
        if k in skip:
            continue
        src = bpy.data.objects[order[k % len(order)]]
        o = src.copy(); o.data = src.data
        o.name = "%s_%s%02d" % (src.name, prefix, k)
        bpy.context.collection.objects.link(o)
        o.location = (x, y, 0.0)
        o.rotation_euler = (0.0, 0.0, rz)
        o.hide_render = False; o.hide_viewport = False
    for n_ in NAMES:
        bpy.data.objects[n_].hide_render = True
        bpy.data.objects[n_].hide_viewport = True
    return "%d o, buoc %.3f m (spec 3.00), dat %d manh" % (len(slots), step, len(slots) - len(skip))
