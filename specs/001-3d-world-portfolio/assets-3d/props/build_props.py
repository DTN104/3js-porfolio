# build_props.py — AST-13a (cây & bụi) + AST-13b (đá & cỏ) cho 001-3d-world-portfolio
# Chạy trong Blender:  exec(open("<duong-dan>/build_props.py").read())
# Rồi:  build_all_props()  ·  bake_props(size=256)  ·  export_props()
#
# Ghi chú: file này tự chứa helper, không dùng chung với build_islands.py, để sửa
# một bên không làm hỏng bên kia.
import bpy, bmesh, math, random, os
from mathutils import Matrix

OUT_GLB = "/Users/td-macbook-07/Work/threejs-portfolio/prototype/public/models/props"
OUT_SRC = "/Users/td-macbook-07/Work/threejs-portfolio/specs/001-3d-world-portfolio/assets-3d/props"

# PALETTE mục 3.5 — cam nhấn #E08B45 CỐ Ý không có mặt (ràng buộc nghiệm thu AST-13 #3)
PAL = {
    "leafD": "43703A", "leafL": "5E9448",
    "woodD": "7A5636", "woodL": "A87A4F",
    "rockL": "9E8E7C", "rockD": "6E6255",
    "grassL": "8CBE68", "grassD": "6B9A4C",
    "flower": "F6F9FB",
}
KEYS = list(PAL.keys())
IDX = {k: i for i, k in enumerate(KEYS)}

def s2l(c):
    c /= 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def get_mats():
    out = []
    for k in KEYS:
        h = PAL[k]
        n = "P_" + k
        m = bpy.data.materials.get(n) or bpy.data.materials.new(n)
        m.use_nodes = True
        b = next(x for x in m.node_tree.nodes if x.type == 'BSDF_PRINCIPLED')
        b.inputs['Base Color'].default_value = (s2l(int(h[0:2],16)), s2l(int(h[2:4],16)), s2l(int(h[4:6],16)), 1)
        b.inputs['Roughness'].default_value = 0.92
        b.inputs['Metallic'].default_value = 0.0
        out.append(m)
    return out

# ---------- primitive helper ----------
def _faces(verts):
    fs = set()
    for v in verts:
        fs.update(v.link_faces)
    return fs

def cone(bm, r1, r2, depth, loc, seg, mi, rot=0.0):
    M = Matrix.Translation(loc) @ Matrix.Rotation(rot, 4, 'Z')
    try:
        res = bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=seg,
                                    radius1=r1, radius2=r2, depth=depth, matrix=M, calc_uvs=False)
    except TypeError:
        res = bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=seg,
                                    diameter1=r1, diameter2=r2, depth=depth, matrix=M, calc_uvs=False)
    for f in _faces(res['verts']):
        f.material_index = mi
    return res['verts']

def ball(bm, rad, loc, mi, sub=1, squash=1.0, jit=0.0, seed=None):
    if seed is not None:
        random.seed(seed)
    M = Matrix.Translation(loc)
    try:
        res = bmesh.ops.create_icosphere(bm, subdivisions=sub, radius=rad, matrix=M, calc_uvs=False)
    except TypeError:
        res = bmesh.ops.create_icosphere(bm, subdivisions=sub, diameter=rad, matrix=M, calc_uvs=False)
    for v in res['verts']:
        v.co.z = loc[2] + (v.co.z - loc[2]) * squash
        if jit:
            v.co.x += random.uniform(-jit, jit) * rad
            v.co.y += random.uniform(-jit, jit) * rad
            v.co.z += random.uniform(-jit, jit) * rad * 0.7
    for f in _faces(res['verts']):
        f.material_index = mi
    return res['verts']

def finish(bm, name, mats, flat_bottom=True):
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    me = bpy.data.meshes.new(name)
    for m in mats:
        me.materials.append(m)
    bm.to_mesh(me)
    bm.free()
    if flat_bottom:
        zs = [v.co.z for v in me.vertices]
        dz = min(zs)
        for v in me.vertices:
            v.co.z -= dz            # ràng buộc nghiệm thu #2: đáy phẳng, nằm đúng Y=0
        me.update()
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    return ob

def _scale_to(ob, target, mode='z'):
    """Chuẩn hoá về đúng kích thước spec: 'z' theo chiều cao, 'max' theo cạnh dài nhất."""
    me = ob.data
    xs = [v.co.x for v in me.vertices]; ys = [v.co.y for v in me.vertices]; zs = [v.co.z for v in me.vertices]
    cur = (max(zs) - min(zs)) if mode == 'z' else max(max(xs)-min(xs), max(ys)-min(ys), max(zs)-min(zs))
    if cur <= 0:
        return ob
    k = target / cur
    for v in me.vertices:
        v.co *= k
    dz = min(v.co.z for v in me.vertices)
    for v in me.vertices:
        v.co.z -= dz
    me.update()
    return ob

# ---------- AST-13a : cây và bụi ----------
def conifer(name, h, mats, seed):
    """Thông: thân thuôn + 3-4 tầng nón chồng. Vành đáy mỗi tầng phải NHÔ RA khỏi
    mặt nón dưới thì mới ra bậc, chồng trơn là nhìn thành một cái nón liền."""
    random.seed(seed)
    bm = bmesh.new()
    tr, th = h * 0.050, h * 0.30
    cone(bm, tr * 1.35, tr * 0.90, th, (0, 0, th / 2), 6, IDX["woodD"])
    # (z đáy tầng, bán kính, chiều cao) — đều tính theo h
    tiers = [(0.26, 0.255, 0.34), (0.48, 0.200, 0.32), (0.68, 0.145, 0.32)]
    if h >= 4.0:
        tiers = [(0.24, 0.260, 0.32), (0.44, 0.215, 0.30),
                 (0.62, 0.165, 0.30), (0.78, 0.110, 0.26)]
    for i, (zb, r, d) in enumerate(tiers):
        mi = IDX["leafL"] if i == len(tiers) - 1 else IDX["leafD"]
        cone(bm, h * r, h * r * 0.10, h * d, (0, 0, h * zb + h * d / 2), 7, mi,
             rot=random.uniform(0, 0.9))
    return _scale_to(finish(bm, name, mats), h, 'z')

def bush(name, w, mats, seed, flowers=False):
    random.seed(seed)
    bm = bmesh.new()
    lobes = [(0, 0, w * 0.50, w * 0.52), (w * 0.34, w * 0.14, w * 0.40, w * 0.40),
             (-w * 0.28, -w * 0.22, w * 0.36, w * 0.36), (w * 0.06, -w * 0.33, w * 0.30, w * 0.29)]
    for i, (x, y, z, r) in enumerate(lobes):
        ball(bm, r, (x, y, z), IDX["leafL"] if i == 0 else IDX["leafD"],
             sub=1, squash=0.92, jit=0.09, seed=seed + i)
    if flowers:
        for i in range(9):
            a2 = random.uniform(0, math.tau)
            d2 = random.uniform(0.12, 0.50) * w
            ball(bm, w * 0.085, (math.cos(a2) * d2, math.sin(a2) * d2,
                                 w * 0.66 + random.uniform(-0.10, 0.10) * w),
                 IDX["flower"], sub=1, squash=0.58, seed=seed + 90 + i)
    return finish(bm, name, mats)

# ---------- AST-13b : đá và cỏ ----------
def boulder(name, size, mats, seed):
    random.seed(seed)
    bm = bmesh.new()
    r = size / 2.0
    vs = ball(bm, r, (0, 0, r * 0.86), IDX["rockL"], sub=1, squash=0.86, jit=0.20, seed=seed)
    for v in vs:
        if v.co.z < r * 0.14:                      # bạt phẳng phần đáy cho tiếp đất gọn
            v.co.z = r * 0.14
    return _scale_to(finish(bm, name, mats), size, 'max')

def grass_tuft(name, h, mats, seed, blades=6):
    random.seed(seed)
    bm = bmesh.new()
    for i in range(blades):
        a = math.tau * i / blades + random.uniform(-0.25, 0.25)
        d = random.uniform(0.02, 0.10)
        hh = h * random.uniform(0.62, 1.0)
        lean = random.uniform(0.10, 0.26)
        mi = IDX["grassD"] if i % 2 else IDX["grassL"]
        cone(bm, h * 0.055, h * 0.008, hh,
             (math.cos(a) * d + math.cos(a) * lean * hh * 0.35,
              math.sin(a) * d + math.sin(a) * lean * hh * 0.35, hh / 2), 4, mi, rot=a)
    return finish(bm, name, mats)

def pebbles(name, spread, mats, seed, n=5):
    random.seed(seed)
    bm = bmesh.new()
    for i in range(n):
        a = random.uniform(0, math.tau)
        d = random.uniform(0.0, spread)
        r = random.uniform(0.035, 0.085)
        ball(bm, r, (math.cos(a) * d, math.sin(a) * d, r * 0.55),
             IDX["rockL"] if i % 3 else IDX["rockD"], sub=1, squash=0.6, jit=0.22, seed=seed + i)
    return finish(bm, name, mats)

def clover(name, spread, mats, seed, n=9):
    random.seed(seed)
    bm = bmesh.new()
    for i in range(n):
        a = random.uniform(0, math.tau)
        d = random.uniform(0.0, spread)
        r = random.uniform(0.055, 0.10)
        cx, cy = math.cos(a) * d, math.sin(a) * d
        for k in range(3):                          # 3 lá chụm thành một nhánh cỏ ba lá
            b = math.tau * k / 3 + a
            ball(bm, r, (cx + math.cos(b) * r * 0.85, cy + math.sin(b) * r * 0.85, 0.030),
                 IDX["grassD"] if i % 2 else IDX["grassL"], sub=1, squash=0.22, seed=seed + i * 7 + k)
    return finish(bm, name, mats)

# ---------- dựng cả bộ ----------
SET_A = "AST13a"
SET_B = "AST13b"

def build_all_props():
    for o in list(bpy.data.objects):
        if o.type == 'MESH' and (o.name.startswith(SET_A) or o.name.startswith(SET_B)):
            bpy.data.objects.remove(o, do_unlink=True)
    m = get_mats()
    rows = []
    made = []
    # AST-13a — 3 thông 2,5/3,6/5,0 m + 2 bụi + 1 bụi có hoa
    made += [conifer(SET_A + "_Conifer_S", 2.5, m, 11),
             conifer(SET_A + "_Conifer_M", 3.6, m, 12),
             conifer(SET_A + "_Conifer_L", 5.0, m, 13),
             bush(SET_A + "_Bush_S", 0.85, m, 21),
             bush(SET_A + "_Bush_M", 1.25, m, 22),
             bush(SET_A + "_Shrub_Flower", 1.10, m, 23, flowers=True)]
    # AST-13b — 4 tảng đá 0,3…1,5 m + 3 bụi cỏ + 2 cụm sỏi + 1 mảng cỏ ba lá
    made += [boulder(SET_B + "_Boulder_XS", 0.30, m, 31),
             boulder(SET_B + "_Boulder_S", 0.60, m, 32),
             boulder(SET_B + "_Boulder_M", 1.00, m, 33),
             boulder(SET_B + "_Boulder_L", 1.50, m, 34),
             grass_tuft(SET_B + "_GrassTuft_S", 0.30, m, 41, blades=5),
             grass_tuft(SET_B + "_GrassTuft_M", 0.45, m, 42, blades=7),
             grass_tuft(SET_B + "_GrassTuft_L", 0.62, m, 43, blades=9),
             pebbles(SET_B + "_Pebbles_A", 0.34, m, 51, n=5),
             pebbles(SET_B + "_Pebbles_B", 0.52, m, 52, n=7),
             clover(SET_B + "_CloverPatch", 0.55, m, 61, n=9)]
    for ob in made:
        me = ob.data
        zs = [v.co.z for v in me.vertices]
        rows.append("%-26s cao %.2fm  tris %3d  day z=%.3f"
                    % (ob.name, max(zs) - min(zs),
                       sum(len(p.vertices) - 2 for p in me.polygons), min(zs)))
    return "\n".join(rows)

def prop_names():
    return [o.name for o in bpy.data.objects
            if o.type == 'MESH' and (o.name.startswith(SET_A) or o.name.startswith(SET_B))]

# ---------- UV + bake + snap, y hệt pipeline của đảo ----------
def bake_prop(name, size=256, save_png=False):
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
        for n in nt.nodes:
            n.select = False
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

    snap_palette_img(img)
    if save_png:
        img.filepath_raw = os.path.join(OUT_SRC, name + "_BaseColor.png")
        img.file_format = 'PNG'
        img.save()
    return img

def snap_palette_img(img):
    """Bake ghi lệch 1/255 do làm tròn — snap mọi texel hiện hữu về đúng mã PALETTE."""
    import numpy as np
    n = img.size[0] * img.size[1] * 4
    buf = np.empty(n, dtype=np.float32)
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

def bake_props(size=256):
    out = []
    for n in prop_names():
        bake_prop(n, size=size)
        out.append(n)
    return "baked %d prop @ %dpx" % (len(out), size)

def export_props():
    """Mỗi bộ một .glb, từng prop là một node riêng có tên — app nạp 1 file rồi instance từng cái."""
    os.makedirs(OUT_GLB, exist_ok=True)
    rows = []
    for st in (SET_A, SET_B):
        names = [n for n in prop_names() if n.startswith(st)]
        bpy.ops.object.select_all(action='DESELECT')
        for n in names:
            bpy.data.objects[n].select_set(True)
        bpy.context.view_layer.objects.active = bpy.data.objects[names[0]]
        bpy.ops.export_scene.gltf(filepath=os.path.join(OUT_GLB, st + ".glb"),
                                  export_format='GLB', use_selection=True,
                                  export_apply=True, export_yup=True)
        rows.append("%s.glb <- %d object" % (st, len(names)))
    bpy.ops.object.select_all(action='DESELECT')
    return " | ".join(rows)

def layout_props(spacing=1.9):
    """Xếp thành 2 hàng để chụp ảnh nghiệm thu."""
    a = [n for n in prop_names() if n.startswith(SET_A)]
    b = [n for n in prop_names() if n.startswith(SET_B)]
    u = (math.cos(math.radians(45)), math.sin(math.radians(45)))
    v = (-u[1], u[0])
    for row, names, off in ((0, a, 1.6), (1, b, -1.6)):
        for i, n in enumerate(names):
            t = (i - (len(names) - 1) / 2) * spacing * (1.55 if row == 0 else 1.0)
            ob = bpy.data.objects[n]
            ob.location = (u[0] * t + v[0] * off * 1.9, u[1] * t + v[1] * off * 1.9, 0)
