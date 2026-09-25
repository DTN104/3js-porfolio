# build_islands.py — sinh bộ 5 đảo AST-03a..e cho 001-3d-world-portfolio
# Chạy trong Blender:  exec(open("<duong-dan>/build_islands.py").read())
# Rồi gọi:  build_all()  /  bake_one(name)  /  export_all()
import bpy, bmesh, math, random, os
from mathutils import Matrix

OUT_GLB = "/Users/td-macbook-07/Work/threejs-portfolio/prototype/public/models/islands"
OUT_SRC = "/Users/td-macbook-07/Work/threejs-portfolio/specs/001-3d-world-portfolio/assets-3d/islands"
SEG = 14

# ---- PALETTE mục 3.5 (asset-prompts.md) ----
PALETTE = [("AST03_Grass", "8CBE68"), ("AST03_GrassDark", "6B9A4C"),
           ("AST03_Earth", "6E6255"), ("AST03_Rock", "9E8E7C")]

def s2l(c):
    c /= 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def get_mats():
    out = []
    for n, h in PALETTE:
        m = bpy.data.materials.get(n) or bpy.data.materials.new(n)
        m.use_nodes = True
        b = next(x for x in m.node_tree.nodes if x.type == 'BSDF_PRINCIPLED')
        b.inputs['Base Color'].default_value = (s2l(int(h[0:2],16)), s2l(int(h[2:4],16)), s2l(int(h[4:6],16)), 1)
        b.inputs['Roughness'].default_value = 0.92
        b.inputs['Metallic'].default_value = 0.0
        out.append(m)
    return out

def sstep(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)

# ---- tham số 5 đảo ----
# base: [(rf, z_frac, jitter_r, jitter_z)] — z_frac âm, nhân với DEPTH; phần tử cuối là vành đáy
ISLANDS = [
 dict(key="a", name="AST03a_Island01_Intro", diam=18.0, ovaly=0.92, dratio=0.62, skew=0.00, seed=42,
      rfun=lambda a: 1.0,
      zfun=lambda x, y, R: -0.060*(x/R) + 0.030*math.sin(x*.55+1.3) + 0.025*math.cos(y*.62-.7),
      base=[(0.995,-0.04,.004,0),(0.975,-0.14,.02,.004),(0.930,-0.34,.05,.010),(0.860,-0.55,.07,.014),
            (0.720,-0.74,.09,.016),(0.500,-0.90,.11,.016),(0.300,-0.99,.13,.012)]),

 dict(key="b", name="AST03b_Island02_Skills", diam=16.0, ovaly=0.90, dratio=0.665, skew=0.62, seed=7,
      rfun=lambda a: 1.0 - 0.22*max(0.0, math.cos(a - math.pi))**2,
      zfun=lambda x, y, R: 0.10*sstep((y/R+0.15)/0.9) - 0.05 + 0.022*math.sin(x*.7),
      base=[(0.995,-0.05,.004,0),(0.900,-0.20,.03,.006),(0.640,-0.40,.06,.014),(0.440,-0.58,.09,.018),
            (0.330,-0.76,.11,.018),(0.230,-0.90,.13,.016),(0.110,-0.99,.15,.012)]),

 dict(key="c", name="AST03c_Island03_Projects", diam=19.0, ovaly=0.98, dratio=0.70, skew=0.00, seed=13,
      rfun=lambda a: 1.0 + 0.03*math.cos(3*a),
      zfun=lambda x, y, R: 0.09 - 0.14*sstep((math.hypot(x,y)/R - 0.42)/0.5),
      base=[(0.990,-0.05,.004,0),(0.930,-0.14,.02,.004),(0.915,-0.19,.02,.004),(0.700,-0.32,.05,.010),
            (0.685,-0.39,.05,.010),(0.460,-0.56,.08,.014),(0.445,-0.64,.08,.014),(0.240,-0.85,.11,.012),
            (0.110,-0.99,.13,.010)]),

 dict(key="d", name="AST03d_Island04_Experience", diam=16.0, ovaly=0.62, dratio=0.80, skew=0.00, seed=21,
      rfun=lambda a: 1.0 + 0.05*math.cos(2*a),
      zfun=lambda x, y, R: -0.11 + 0.11*sstep((x/R+0.55)/0.35) + 0.11*sstep((x/R-0.15)/0.35),
      base=[(0.990,-0.035,.004,0),(0.930,-0.10,.02,.004),(0.560,-0.23,.05,.010),(0.360,-0.34,.07,.012),
            (0.290,-0.50,.09,.014),(0.265,-0.68,.10,.014),(0.200,-0.85,.12,.012),(0.070,-0.99,.14,.008)]),

 dict(key="e", name="AST03e_Island05_Contact", diam=15.0, ovaly=0.97, dratio=0.60, skew=0.00, seed=33,
      rfun=lambda a: 1.0,
      zfun=lambda x, y, R: -0.06 + 0.17*math.exp(-(((x-0.42*R)**2 + (y-0.10*R)**2)/(0.18*R*R))),
      base=[(0.990,-0.06,.004,0),(0.960,-0.21,.02,.004),(0.900,-0.37,.04,.008),(0.800,-0.53,.06,.012),
            (0.660,-0.69,.08,.014),(0.500,-0.83,.10,.014),(0.320,-0.99,.12,.010)]),
]
NAMES = [d["name"] for d in ISLANDS]

def build_one(spec, mats):
    random.seed(spec["seed"])
    diam, ovaly, skew = spec["diam"], spec["ovaly"], spec["skew"]
    R, DEPTH = diam / 2.0, diam * spec["dratio"]
    rfun, zfun = spec["rfun"], spec["zfun"]
    bm = bmesh.new()

    def ring(rf, zf=None, jr=0.0, jz=0.0):
        vs = []
        p = 0.0 if zf is None else -zf
        dx = skew * R * (p ** 1.35)
        for i in range(SEG):
            a = 2 * math.pi * i / SEG
            out = 1.0 + (rfun(a) - 1.0) * rf
            k = 1.0 + (random.uniform(-jr, jr) if jr else 0.0)
            x = math.cos(a) * R * rf * out * k + dx
            y = math.sin(a) * R * ovaly * rf * out * k
            z = zfun(x - dx, y, R) if zf is None else zf * DEPTH + (random.uniform(-jz, jz) * DEPTH if jz else 0.0)
            vs.append(bm.verts.new((x, y, z)))
        return vs

    top = [ring(rf) for rf in (0.30, 0.60, 0.85, 1.0)]
    fg = [bm.faces.new(top[0])]
    for a, b in zip(top[:-1], top[1:]):
        fg += [bm.faces.new((a[i], a[(i+1)%SEG], b[(i+1)%SEG], b[i])) for i in range(SEG)]
    f_rim, f_grass = fg[-SEG:], fg[:-SEG]

    rings = [top[-1]] + [ring(rf, zf, jr, jz) for rf, zf, jr, jz in spec["base"]]
    bands = [[bm.faces.new((a[i], a[(i+1)%SEG], b[(i+1)%SEG], b[i])) for i in range(SEG)]
             for a, b in zip(rings[:-1], rings[1:])]
    f_earth, f_rock = bands[0], [f for bd in bands[1:] for f in bd]
    f_rock.append(bm.faces.new(list(reversed(rings[-1]))))

    tipx = skew * R
    for dxr, dyr, dzr, rr in [(0.55,0.45,-1.09,0.050),(-0.95,-0.65,-1.18,0.035),(1.35,-1.05,-1.25,0.025)]:
        rad = rr * diam
        M = Matrix.Translation((dxr + tipx, dyr, dzr * DEPTH))
        try:
            res = bmesh.ops.create_icosphere(bm, subdivisions=1, radius=rad, matrix=M, calc_uvs=False)
        except TypeError:
            res = bmesh.ops.create_icosphere(bm, subdivisions=1, diameter=rad, matrix=M, calc_uvs=False)
        fs = set()
        for v in res['verts']:
            v.co.x += random.uniform(-.18,.18)*rad
            v.co.y += random.uniform(-.18,.18)*rad
            v.co.z += random.uniform(-.14,.14)*rad
            fs.update(v.link_faces)
        f_rock += list(fs)

    me = bpy.data.meshes.new(spec["name"])
    for m in mats:
        me.materials.append(m)
    for f in f_grass: f.material_index = 0
    for f in f_rim:   f.material_index = 1
    for f in f_earth: f.material_index = 2
    for f in f_rock:  f.material_index = 3
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    bm.to_mesh(me); bm.free()

    ob = bpy.data.objects.new(spec["name"], me)
    bpy.context.collection.objects.link(ob)
    xs = [v.co.x for v in me.vertices]; ys = [v.co.y for v in me.vertices]
    k = diam / max(max(xs)-min(xs), max(ys)-min(ys))
    for v in me.vertices:
        v.co *= k
    me.update()
    return ob

def build_all():
    for o in list(bpy.data.objects):
        if o.type == 'MESH':
            bpy.data.objects.remove(o, do_unlink=True)
    mats = get_mats()
    rows = []
    for spec in ISLANDS:
        ob = build_one(spec, mats)
        me = ob.data
        xs=[v.co.x for v in me.vertices]; ys=[v.co.y for v in me.vertices]
        body_bottom = _body_bottom(me)
        top = [v.co.z for v in me.vertices if v.co.z > -0.35]
        rows.append("%-28s %5.2f x %5.2f | sau %5.2f (%.3fD) | nhapnho %.3f | tris %3d"
                    % (spec["name"], max(xs)-min(xs), max(ys)-min(ys), -body_bottom,
                       -body_bottom/spec["diam"], max(top)-min(top),
                       sum(len(p.vertices)-2 for p in me.polygons)))
    return "\n".join(rows)

def _body_bottom(me):
    bm = bmesh.new(); bm.from_mesh(me); bm.verts.ensure_lookup_table()
    seen, comps = set(), []
    for v in bm.verts:
        if v.index in seen: continue
        stack, comp = [v], []
        seen.add(v.index)
        while stack:
            u = stack.pop(); comp.append(u.co.z)
            for e in u.link_edges:
                w = e.other_vert(u)
                if w.index not in seen:
                    seen.add(w.index); stack.append(w)
        comps.append(comp)
    bm.free()
    return min(max(comps, key=len))

def layout_row(spacing=23.0, ortho=68.0):
    u = (math.cos(math.radians(45)), math.sin(math.radians(45)))
    for i, n in enumerate(NAMES):
        t = (i - 2) * spacing
        bpy.data.objects[n].location = (u[0]*t, u[1]*t, 0)
    cam = bpy.data.objects["Camera"]
    cam.location = (60, -60, 48)
    cam.rotation_euler = (math.radians(57.5), 0, math.radians(45))
    cam.data.type = 'ORTHO'; cam.data.ortho_scale = ortho
    for win in bpy.context.window_manager.windows:
        for area in win.screen.areas:
            if area.type == 'VIEW_3D':
                sp = area.spaces.active
                sp.region_3d.view_perspective = 'CAMERA'
                sp.shading.type = 'RENDERED'
                sp.overlay.show_overlays = False
                area.tag_redraw()

def layout_origin():
    for n in NAMES:
        bpy.data.objects[n].location = (0, 0, 0)


# ---------- bước 2: UV unwrap + bake 4 material -> 1 atlas 1024 (1 draw call) ----------
def bake_one(name, size=1024, save_png=True):
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
    sc.render.bake.use_pass_direct = False      # khong nuong bong
    sc.render.bake.use_pass_indirect = False    # khong nuong AO / GI
    sc.render.bake.use_pass_color = True
    sc.render.bake.margin = 4
    sc.render.bake.use_clear = True
    bpy.ops.object.bake(type='DIFFUSE')

    prev = bpy.data.materials.get(name + "_Atlas")
    if prev:
        bpy.data.materials.remove(prev)
    atlas = bpy.data.materials.new(name + "_Atlas")
    atlas.use_nodes = True
    nt = atlas.node_tree
    bsdf = next(x for x in nt.nodes if x.type == 'BSDF_PRINCIPLED')
    bsdf.inputs['Roughness'].default_value = 0.92
    bsdf.inputs['Metallic'].default_value = 0.0
    tex = nt.nodes.new('ShaderNodeTexImage')
    tex.image = img
    tex.interpolation = 'Closest'
    tex.location = (-400, 200)
    nt.links.new(bsdf.inputs['Base Color'], tex.outputs['Color'])

    me = ob.data
    me.materials.clear()
    me.materials.append(atlas)
    for p in me.polygons:
        p.material_index = 0
    me.update()

    if save_png:
        img.filepath_raw = os.path.join(OUT_SRC, name + "_BaseColor.png")
        img.file_format = 'PNG'
        img.save()
    return "%s: uv=%d layer, atlas %dx%d, mat=%d" % (
        name, len(me.uv_layers), size, size, len(me.materials))


def export_all():
    rows = []
    for n in NAMES:
        ob = bpy.data.objects[n]
        bpy.ops.object.select_all(action='DESELECT')
        ob.select_set(True)
        bpy.context.view_layer.objects.active = ob
        bpy.ops.export_scene.gltf(filepath=os.path.join(OUT_GLB, n + ".glb"),
                                  export_format='GLB', use_selection=True,
                                  export_apply=True, export_yup=True)
        rows.append(n)
    bpy.ops.object.select_all(action='DESELECT')
    return "exported: " + ", ".join(rows)


def snap_palette(name, save_png=True):
    """Bake ghi ra lech 1/255 do lam tron. Snap moi texel hien huu ve dung ma PALETTE."""
    import numpy as np
    img = bpy.data.images[name + "_BaseColor"]
    n = img.size[0] * img.size[1] * 4
    buf = np.empty(n, dtype=np.float32)
    img.pixels.foreach_get(buf)
    px = buf.reshape(-1, 4)
    rgb = px[:, :3]
    pal = np.array([[int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)] for _, h in PALETTE],
                   dtype=np.float32) / 255.0
    d = ((rgb[:, None, :] - pal[None, :, :]) ** 2).sum(-1)
    mask = rgb.sum(1) > 0.08                       # bo qua nen den chua dung toi
    px[mask, :3] = pal[d.argmin(1)[mask]]
    img.pixels.foreach_set(px.reshape(-1))
    img.update()
    if save_png:
        img.filepath_raw = os.path.join(OUT_SRC, name + "_BaseColor.png")
        img.file_format = 'PNG'
        img.save()
    uniq = set(tuple(v) for v in (px[mask, :3] * 255).round().astype(int))
    return "%s -> %d mau: %s" % (name, len(uniq),
                                 ["".join("%02X" % c for c in u) for u in sorted(uniq)])
