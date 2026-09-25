# build_clouds.py — AST-21 lớp mây nền (4 biến thể) cho 001-3d-world-portfolio
# Chạy trong Blender:  exec(open("<duong-dan>/build_clouds.py").read())
# Rồi:  build_clouds()  ·  bake_clouds(size=128)  ·  export_clouds()
#
# Theo asset-prompts.md 4.21: 4 biến thể 8–20 m rộng, 2–4 m dày, vài múi tròn to chồng nhau,
# ĐÁY PHẲNG, khối đặc kín, không trong suốt; mặt trên #F6F9FB, múi dưới ngả #DCE6EE.
# Pipeline giống build_props.py: build -> UV smart project -> bake DIFFUSE color -> 1 atlas -> snap PALETTE.
import bpy, bmesh, math, random, os
from mathutils import Matrix, Vector

OUT_GLB = "/Users/td-macbook-07/Work/threejs-portfolio/prototype/public/models/clouds"
OUT_SRC = "/Users/td-macbook-07/Work/threejs-portfolio/specs/001-3d-world-portfolio/assets-3d/clouds"

PAL = {"cloud": "F6F9FB", "cloudS": "DCE6EE"}
KEYS = list(PAL.keys())
IDX = {k: i for i, k in enumerate(KEYS)}
SET = "AST21"

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
        b.inputs['Roughness'].default_value = 1.0
        b.inputs['Metallic'].default_value = 0.0
        out.append(m)
    return out

def _faces(verts):
    fs = set()
    for v in verts:
        fs.update(v.link_faces)
    return fs

def lobe(bm, rad, loc, squash, jit, useg=10, vseg=6):
    """Múi tròn: UV sphere thưa (≈100 tri) nhìn tròn hơn icosphere cấp 1 mà vẫn low-poly."""
    M = Matrix.Translation(loc)
    res = bmesh.ops.create_uvsphere(bm, u_segments=useg, v_segments=vseg, radius=rad, matrix=M, calc_uvs=False)
    for v in res['verts']:
        v.co.z = loc[2] + (v.co.z - loc[2]) * squash
        v.co.x += random.uniform(-jit, jit) * rad
        v.co.y += random.uniform(-jit, jit) * rad
    return res['verts']

# Bố cục múi cho từng biến thể: (rộng, dày, số múi, seed)
VARIANTS = [
    ("A",  8.0, 2.2, 4, 101),
    ("B", 12.0, 2.8, 6, 102),
    ("C", 16.0, 3.4, 8, 103),
    ("D", 20.0, 4.0, 10, 104),
]

def cloud(name, width, thick, n, seed, mats):
    random.seed(seed)
    bm = bmesh.new()
    depth = width * random.uniform(0.45, 0.62)          # mây dẹt theo hướng nhìn
    # múi giữa to nhất, các múi quanh nhỏ dần; tâm múi đặt sao cho đỉnh mây ≈ thick
    for i in range(n):
        t = i / max(1, n - 1)
        ang = random.uniform(0, math.pi * 2)
        rx = (width / 2) * (0.10 + 0.50 * random.random()) if i else 0.0
        ry = (depth / 2) * (0.10 + 0.50 * random.random()) if i else 0.0
        cx, cy = math.cos(ang) * rx, math.sin(ang) * ry
        edge = math.hypot(cx / (width / 2), cy / (depth / 2))          # 0 tâm .. 1 rìa
        rad = thick * random.uniform(0.95, 1.25) * (1.0 - 0.35 * edge)
        rad = max(rad, thick * 0.45)
        squash = random.uniform(0.62, 0.78)
        cz = rad * squash * 0.55                                       # ngập xuống dưới z=0 để cắt phẳng
        lobe(bm, rad, (cx, cy, cz), squash, jit=0.03)
    # ép trong khung rộng x sâu: co theo x/y để đúng width
    xs = [v.co.x for v in bm.verts]; ys = [v.co.y for v in bm.verts]
    sx = width / (max(xs) - min(xs)); sy = min(sx, depth / (max(ys) - min(ys)) * 1.0)
    cx0 = (max(xs) + min(xs)) / 2; cy0 = (max(ys) + min(ys)) / 2
    for v in bm.verts:
        v.co.x = (v.co.x - cx0) * sx
        v.co.y = (v.co.y - cy0) * sy
    # ĐÁY PHẲNG: cắt tại z=0, bỏ phần dưới, bịt lỗ (ràng buộc #2)
    geom = bm.verts[:] + bm.edges[:] + bm.faces[:]
    res = bmesh.ops.bisect_plane(bm, geom=geom, plane_co=(0, 0, 0), plane_no=(0, 0, -1),
                                 clear_outer=True, clear_inner=False)
    cut_edges = [e for e in res['geom_cut'] if isinstance(e, bmesh.types.BMEdge)]
    bmesh.ops.holes_fill(bm, edges=cut_edges, sides=64)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    # ép đỉnh mây đúng thick
    zs = [v.co.z for v in bm.verts]
    k = thick / max(zs)
    for v in bm.verts:
        v.co.z *= k
    # màu: mặt hướng xuống / múi thấp ngả xám-xanh (ràng buộc "underside lobes")
    for f in bm.faces:
        c = f.calc_center_median()
        n_ = f.normal
        f.material_index = IDX["cloudS"] if (n_.z < 0.15 or c.z < thick * 0.28) else IDX["cloud"]
    me = bpy.data.meshes.new(name)
    for m in mats:
        me.materials.append(m)
    bm.to_mesh(me); bm.free()
    me.update()
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    return ob

def cloud_names():
    return [o.name for o in bpy.data.objects if o.type == 'MESH' and o.name.startswith(SET)]

def build_clouds():
    for n in cloud_names():
        bpy.data.objects.remove(bpy.data.objects[n], do_unlink=True)
    mats = get_mats()
    rows = []
    for tag, w, th, n, seed in VARIANTS:
        ob = cloud("%s_Cloud_%s" % (SET, tag), w, th, n, seed, mats)
        me = ob.data
        xs = [v.co.x for v in me.vertices]; ys = [v.co.y for v in me.vertices]; zs = [v.co.z for v in me.vertices]
        rows.append("%-14s rong %.1f sau %.1f day %.2f  z_min %.3f  tris %d"
                    % (ob.name, max(xs)-min(xs), max(ys)-min(ys), max(zs)-min(zs), min(zs),
                       sum(len(p.vertices) - 2 for p in me.polygons)))
    return "\n".join(rows)

def layout_clouds(gap=3.0):
    x = 0.0
    for tag, w, th, n, seed in VARIANTS:
        ob = bpy.data.objects["%s_Cloud_%s" % (SET, tag)]
        ob.location = (x + w / 2, 0, 0)
        x += w + gap

# ---------- bake + snap + export (y hệt build_props.py) ----------
def bake_one(name, size=128):
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
            tex = nt.nodes.new('ShaderNodeTexImage'); tex.name = "BAKE_TARGET"; tex.location = (-700, 400)
        tex.image = img
        for n_ in nt.nodes:
            n_.select = False
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
    at = bpy.data.materials.new(name + "_Atlas"); at.use_nodes = True
    nt = at.node_tree
    bsdf = next(x for x in nt.nodes if x.type == 'BSDF_PRINCIPLED')
    bsdf.inputs['Roughness'].default_value = 1.0
    bsdf.inputs['Metallic'].default_value = 0.0
    tex = nt.nodes.new('ShaderNodeTexImage'); tex.image = img; tex.interpolation = 'Closest'
    nt.links.new(bsdf.inputs['Base Color'], tex.outputs['Color'])
    me = ob.data
    me.materials.clear(); me.materials.append(at)
    for p in me.polygons:
        p.material_index = 0
    me.update()
    snap_palette_img(img)
    return img

def snap_palette_img(img):
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
    img.pixels.foreach_set(px.reshape(-1)); img.update()

def bake_clouds(size=128):
    for n in cloud_names():
        bake_one(n, size)
    return "baked %d cloud @ %dpx" % (len(cloud_names()), size)

def export_clouds():
    os.makedirs(OUT_GLB, exist_ok=True)
    names = cloud_names()
    for n in names:
        bpy.data.objects[n].location = (0, 0, 0)
    bpy.ops.object.select_all(action='DESELECT')
    for n in names:
        bpy.data.objects[n].select_set(True)
    bpy.context.view_layer.objects.active = bpy.data.objects[names[0]]
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT_GLB, SET + ".glb"), export_format='GLB',
                              use_selection=True, export_apply=True, export_yup=True)
    bpy.ops.object.select_all(action='DESELECT')
    return "%s.glb <- %d object" % (SET, len(names))
