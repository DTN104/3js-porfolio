# build_bridge.py — AST-12 cầu dây, dựng parametric theo từng cầu trong content.js
# exec(open("<duong-dan>/build_bridge.py").read())
# build_all_bridges()  ·  bake_bridges(size=512)  ·  export_bridges()
#
# Hệ trục: dựng dọc -Y (Blender) => +Z trong three.js; ngang = X; cao = Z.
# Gốc = điểm đầu cầu, mặt ván tại z=0 => đặt ở (from.x, fromY, from.z) quay rotation.y = yaw là khớp.
# Mặt ván võng theo z(t) = dy*t - SAG*4t(1-t); content.js phải nội suy đúng công thức này (bridgeY).
import bpy, bmesh, math, random, os
from mathutils import Vector

OUT_GLB = "/Users/td-macbook-07/Work/threejs-portfolio/prototype/public/models/bridges"
OUT_SRC = "/Users/td-macbook-07/Work/threejs-portfolio/specs/001-3d-world-portfolio/assets-3d/bridges"

SAG = 0.40            # võng mặt ván ở giữa (spec: "about half a meter" tính cả dây tay)
HAND = 0.95           # dây tay cao trên mặt ván
HAND_SAG = 0.12       # dây tay võng thêm so với mặt ván
HALF_W = 1.25         # nửa chiều rộng lọt lòng giữa hai dây (spec 2,5 m)
PLANK_W = 2.30
PLANK_D = 0.36
PLANK_T = 0.08
GAP = 0.06
POST_EVERY = 2.0

# 4 cầu — số lấy từ content.js (len = hypot(to-from), dy = toY - fromY)
BRIDGES = [("cau-0", 10.683, 2.20), ("cau-1", 10.183, -1.40),
           ("cau-2", 10.859, 2.20), ("cau-3", 10.461, -1.80)]

PAL = {"woodL": "A87A4F", "woodD": "7A5636", "rockL": "9E8E7C", "rockD": "6E6255"}
KEYS = list(PAL.keys())
IDX = {k: i for i, k in enumerate(KEYS)}

def s2l(c):
    c /= 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def get_mats():
    out = []
    for k in KEYS:
        h = PAL[k]; n = "B_" + k
        m = bpy.data.materials.get(n) or bpy.data.materials.new(n)
        m.use_nodes = True
        b = next(x for x in m.node_tree.nodes if x.type == 'BSDF_PRINCIPLED')
        b.inputs['Base Color'].default_value = (s2l(int(h[0:2],16)), s2l(int(h[2:4],16)), s2l(int(h[4:6],16)), 1)
        b.inputs['Roughness'].default_value = 0.92
        b.inputs['Metallic'].default_value = 0.0
        out.append(m)
    return out

# ---------- khung toạ độ dọc cầu ----------
def frame(t, L, dy, extra_sag=0.0):
    """Trả về (điểm trên mặt ván, tiếp tuyến đơn vị, pháp tuyến lên) trong mặt YZ."""
    sag = SAG + extra_sag
    y = -L * t
    z = dy * t - sag * 4 * t * (1 - t)
    dz = dy - sag * 4 * (1 - 2 * t)
    ty, tz = -L, dz
    n = math.hypot(ty, tz); ty /= n; tz /= n
    uy, uz = tz, -ty                        # T × X — huong LEN (X × T cho ra huong xuong vi T doc -Y)
    return Vector((0, y, z)), Vector((0, ty, tz)), Vector((0, uy, uz))

def box_on_curve(bm, xc, t, w, depth, thick, up_off, mi, L, dy, extra_sag=0.0):
    p, T, U = frame(t, L, dy, extra_sag)
    c = p + Vector((xc, 0, 0)) + U * up_off
    X = Vector((1, 0, 0))
    vs = []
    for sx in (-1, 1):
        for st in (-1, 1):
            for su in (-1, 1):
                vs.append(bm.verts.new(c + X * (sx * w / 2) + T * (st * depth / 2) + U * (su * thick / 2)))
    # vs index: sx,st,su -> ((sx+1)//2)*4 + ((st+1)//2)*2 + (su+1)//2
    def V(sx, st, su): return vs[((sx+1)//2)*4 + ((st+1)//2)*2 + (su+1)//2]
    fs = [bm.faces.new((V(-1,-1,-1), V(1,-1,-1), V(1,1,-1), V(-1,1,-1))),
          bm.faces.new((V(-1,-1,1), V(-1,1,1), V(1,1,1), V(1,-1,1))),
          bm.faces.new((V(-1,-1,-1), V(-1,-1,1), V(1,-1,1), V(1,-1,-1))),
          bm.faces.new((V(-1,1,-1), V(1,1,-1), V(1,1,1), V(-1,1,1))),
          bm.faces.new((V(-1,-1,-1), V(-1,1,-1), V(-1,1,1), V(-1,-1,1))),
          bm.faces.new((V(1,-1,-1), V(1,-1,1), V(1,1,1), V(1,1,-1)))]
    for f in fs:
        f.material_index = mi
    return fs

def rope(bm, xc, up_off, rad, mi, L, dy, extra_sag=0.0, steps=16, t0=0.0, t1=1.0):
    """Quét một mặt cắt vuông nhỏ dọc cầu = sợi dây."""
    rings = []
    for i in range(steps + 1):
        t = t0 + (t1 - t0) * i / steps
        p, T, U = frame(t, L, dy, extra_sag)
        c = p + Vector((xc, 0, 0)) + U * up_off
        X = Vector((1, 0, 0))
        ring = [bm.verts.new(c + X * (-rad) + U * (-rad)), bm.verts.new(c + X * rad + U * (-rad)),
                bm.verts.new(c + X * rad + U * rad), bm.verts.new(c + X * (-rad) + U * rad)]
        rings.append(ring)
    fs = []
    for A, B in zip(rings[:-1], rings[1:]):
        for k in range(4):
            fs.append(bm.faces.new((A[k], A[(k+1)%4], B[(k+1)%4], B[k])))
    fs.append(bm.faces.new(list(reversed(rings[0]))))
    fs.append(bm.faces.new(rings[-1]))
    for f in fs:
        f.material_index = mi
    return fs

def post(bm, xc, t, height, w, mi, L, dy, base_off=-0.04):
    """Cọc đứng thẳng (theo trục Z thế giới, không nghiêng theo mặt ván)."""
    p, T, U = frame(t, L, dy)
    base = p + Vector((xc, 0, base_off))
    vs = []
    for sx in (-1, 1):
        for sy in (-1, 1):
            for sz in (0, 1):
                vs.append(bm.verts.new(base + Vector((sx * w / 2, sy * w / 2, sz * height))))
    def V(sx, sy, sz): return vs[((sx+1)//2)*4 + ((sy+1)//2)*2 + sz]
    fs = [bm.faces.new((V(-1,-1,0), V(1,-1,0), V(1,1,0), V(-1,1,0))),
          bm.faces.new((V(-1,-1,1), V(-1,1,1), V(1,1,1), V(1,-1,1))),
          bm.faces.new((V(-1,-1,0), V(-1,-1,1), V(1,-1,1), V(1,-1,0))),
          bm.faces.new((V(-1,1,0), V(1,1,0), V(1,1,1), V(-1,1,1))),
          bm.faces.new((V(-1,-1,0), V(-1,1,0), V(-1,1,1), V(-1,-1,1))),
          bm.faces.new((V(1,-1,0), V(1,-1,1), V(1,1,1), V(1,1,0)))]
    for f in fs:
        f.material_index = mi
    return fs

def build_bridge(name, L, dy, mats):
    bm = bmesh.new()
    # ván: bước = ván + khe, ván xen kẽ đậm hơn (mỗi ván thứ 3)
    pitch = PLANK_D + GAP
    n = int(L // pitch)
    margin = (L - n * pitch) / 2
    for i in range(n):
        s = margin + (i + 0.5) * pitch
        t = s / L
        mi = IDX["woodD"] if i % 3 == 0 else IDX["woodL"]
        box_on_curve(bm, 0.0, t, PLANK_W, PLANK_D, PLANK_T, -PLANK_T / 2, mi, L, dy)
    # 2 dây chịu lực DƯỚI ván — cái đang thiếu trong prototype, làm ván "lơ lửng"
    for xc in (-1.05, 1.05):
        rope(bm, xc, -PLANK_T - 0.055, 0.05, IDX["woodD"], L, dy, steps=18)
    # 2 dây tay, võng thêm một chút
    for xc in (-HALF_W, HALF_W):
        rope(bm, xc, HAND, 0.04, IDX["woodD"], L, dy, extra_sag=HAND_SAG, steps=18)
    # cọc mỗi 2 m, nối mặt ván lên dây tay
    k = 1
    while k * POST_EVERY < L - 0.8:
        t = k * POST_EVERY / L
        p, T, U = frame(t, L, dy)
        ph, _, _ = frame(t, L, dy, HAND_SAG)
        h = (ph.z + HAND) - (p.z - 0.04) + 0.05
        for xc in (-HALF_W, HALF_W):
            post(bm, xc, t, h, 0.09, IDX["woodD"], L, dy)
        k += 1
    # khối neo hai đầu: đá + cọc gỗ to, đặt hai bên lối đi, KHÔNG chắn mặt ván
    for t_end, sgn in ((0.0, 1), (1.0, -1)):
        p, T, U = frame(t_end, L, dy)
        for xc in (-1.50, 1.50):
            base = p + Vector((xc, sgn * 0.10, -0.06))
            # đá
            vs = []
            for sx in (-1, 1):
                for sy in (-1, 1):
                    for sz in (0, 1):
                        vs.append(bm.verts.new(base + Vector((sx * 0.30, sy * 0.42, sz * 0.46))))
            def V(sx, sy, sz): return vs[((sx+1)//2)*4 + ((sy+1)//2)*2 + sz]
            fs = [bm.faces.new((V(-1,-1,0), V(1,-1,0), V(1,1,0), V(-1,1,0))),
                  bm.faces.new((V(-1,-1,1), V(-1,1,1), V(1,1,1), V(1,-1,1))),
                  bm.faces.new((V(-1,-1,0), V(-1,-1,1), V(1,-1,1), V(1,-1,0))),
                  bm.faces.new((V(-1,1,0), V(1,1,0), V(1,1,1), V(-1,1,1))),
                  bm.faces.new((V(-1,-1,0), V(-1,1,0), V(-1,1,1), V(-1,-1,1))),
                  bm.faces.new((V(1,-1,0), V(1,-1,1), V(1,1,1), V(1,1,0)))]
            for f in fs:
                f.material_index = IDX["rockL"]
            # cọc gỗ to trên khối đá, dây tay neo vào đây
            post(bm, xc * (HALF_W / 1.50), t_end, HAND + 0.30, 0.16, IDX["woodD"], L, dy, base_off=-0.05)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    me = bpy.data.meshes.new(name)
    for m in mats:
        me.materials.append(m)
    bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    return ob

NAMES = [b[0] for b in BRIDGES]

def build_all_bridges():
    for o in list(bpy.data.objects):
        if o.type == 'MESH' and o.name.startswith("cau-"):
            bpy.data.objects.remove(o, do_unlink=True)
    mats = get_mats()
    rows = []
    for name, L, dy in BRIDGES:
        ob = build_bridge(name, L, dy, mats)
        me = ob.data
        ys = [v.co.y for v in me.vertices]
        rows.append("%-6s dai %.2f m | dy %+.2f | tris %4d | vong giua %.2f m"
                    % (name, max(ys) - min(ys), dy, sum(len(p.vertices)-2 for p in me.polygons), SAG))
    return "\n".join(rows)

def bake_bridges(size=512):
    import numpy as np
    for name in NAMES:
        ob = bpy.data.objects[name]
        bpy.ops.object.select_all(action='DESELECT')
        ob.select_set(True)
        bpy.context.view_layer.objects.active = ob
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.uv.smart_project(angle_limit=1.15, island_margin=0.03)
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
            for x in nt.nodes: x.select = False
            tex.select = True; nt.nodes.active = tex
        sc = bpy.context.scene
        sc.render.engine = 'CYCLES'; sc.cycles.samples = 1
        sc.render.bake.use_pass_direct = False; sc.render.bake.use_pass_indirect = False
        sc.render.bake.use_pass_color = True; sc.render.bake.margin = 3; sc.render.bake.use_clear = True
        bpy.ops.object.bake(type='DIFFUSE')
        prev = bpy.data.materials.get(name + "_Atlas")
        if prev:
            bpy.data.materials.remove(prev)
        at = bpy.data.materials.new(name + "_Atlas"); at.use_nodes = True
        nt = at.node_tree
        bsdf = next(x for x in nt.nodes if x.type == 'BSDF_PRINCIPLED')
        bsdf.inputs['Roughness'].default_value = 0.92; bsdf.inputs['Metallic'].default_value = 0.0
        tex = nt.nodes.new('ShaderNodeTexImage'); tex.image = img; tex.interpolation = 'Closest'
        nt.links.new(bsdf.inputs['Base Color'], tex.outputs['Color'])
        me = ob.data
        me.materials.clear(); me.materials.append(at)
        for p in me.polygons: p.material_index = 0
        me.update()
        # snap về đúng PALETTE
        buf = np.empty(img.size[0] * img.size[1] * 4, dtype=np.float32)
        img.pixels.foreach_get(buf)
        px = buf.reshape(-1, 4); rgb = px[:, :3]
        pal = np.array([[int(PAL[k][0:2],16), int(PAL[k][2:4],16), int(PAL[k][4:6],16)] for k in KEYS], dtype=np.float32) / 255.0
        d = ((rgb[:, None, :] - pal[None, :, :]) ** 2).sum(-1)
        mask = rgb.sum(1) > 0.08
        px[mask, :3] = pal[d.argmin(1)[mask]]
        img.pixels.foreach_set(px.reshape(-1)); img.update()
    return "baked %d cau @ %dpx" % (len(NAMES), size)

def export_bridges():
    os.makedirs(OUT_GLB, exist_ok=True)
    for name in NAMES:
        ob = bpy.data.objects[name]
        ob.location = (0, 0, 0); ob.rotation_euler = (0, 0, 0)
        bpy.ops.object.select_all(action='DESELECT')
        ob.select_set(True)
        bpy.context.view_layer.objects.active = ob
        bpy.ops.export_scene.gltf(filepath=os.path.join(OUT_GLB, name + ".glb"),
                                  export_format='GLB', use_selection=True,
                                  export_apply=True, export_yup=True)
    bpy.ops.object.select_all(action='DESELECT')
    return "exported " + ", ".join(n + ".glb" for n in NAMES)

def layout_bridges(gap=4.5):
    for i, n in enumerate(NAMES):
        ob = bpy.data.objects[n]
        ob.hide_render = False; ob.hide_viewport = False
        ob.location = ((i - 1.5) * gap, 0, 0); ob.rotation_euler = (0, 0, 0)
