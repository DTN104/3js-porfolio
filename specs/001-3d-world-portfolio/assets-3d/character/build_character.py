# build_character.py — AST-01 nhân vật + AST-02 ba clip (Idle / Walk / Run)
# exec(open("<duong-dan>/build_character.py").read())
# build_character()  ·  rig_and_animate()  ·  bake_character(size=1024)  ·  export_character()
#
# Hệ trục: nhân vật NHÌN VỀ -Y (Blender) = +Z trong three.js, khớp với Avatar đang quay
# rotation.y = atan2(mx, mz). Chân chạm z=0, đỉnh đầu z=1.60.
# Skin cứng: mỗi khối gắn 100% vào một xương — đúng kiểu chunky low-poly, không cần weight mềm.
import bpy, bmesh, math, os
from mathutils import Matrix, Vector

OUT_GLB = "/Users/td-macbook-07/Work/threejs-portfolio/prototype/public/models/character"
OUT_SRC = "/Users/td-macbook-07/Work/threejs-portfolio/specs/001-3d-world-portfolio/assets-3d/character"

# Màu: áo lấy cam nhấn #E08B45 đúng quy tắc mục 3.5 ("Cam nhấn — Nhân vật"). Quần lấy đá đậm, giày gỗ đậm.
# Da / tóc / kính KHÔNG có trong PALETTE — lấy theo prototype hiện tại, cần ghi vào bảng màu nếu duyệt.
PAL = {"shirt": "E08B45", "skin": "E9C9A8", "hair": "3B3230", "pants": "6E6255",
       "shoe": "7A5636", "dark": "2B2B2B"}
KEYS = list(PAL.keys()); IDX = {k: i for i, k in enumerate(KEYS)}

# id khối -> tên xương
PARTS = {1: "spine", 2: "head", 3: "upperarm.L", 4: "forearm.L", 5: "upperarm.R", 6: "forearm.R",
         7: "thigh.L", 8: "shin.L", 9: "thigh.R", 10: "shin.R"}

def s2l(c):
    c /= 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def get_mats():
    out = []
    for k in KEYS:
        h = PAL[k]; n = "C_" + k
        m = bpy.data.materials.get(n) or bpy.data.materials.new(n)
        m.use_nodes = True
        b = next(x for x in m.node_tree.nodes if x.type == 'BSDF_PRINCIPLED')
        b.inputs['Base Color'].default_value = (s2l(int(h[0:2],16)), s2l(int(h[2:4],16)), s2l(int(h[4:6],16)), 1)
        b.inputs['Roughness'].default_value = 0.9
        b.inputs['Metallic'].default_value = 0.0
        out.append(m)
    return out

# ---------- primitive ----------
class B:
    def __init__(self):
        self.bm = bmesh.new()
        self.lay = self.bm.verts.layers.int.new("part")
        self.pid = 0
    def box(self, size, center, mi, pid, bevel=0.0, rot=None):
        M = Matrix.Translation(center) @ (rot if rot else Matrix()) @ Matrix.Diagonal((size[0], size[1], size[2], 1.0))
        res = bmesh.ops.create_cube(self.bm, size=1.0, matrix=M, calc_uvs=False)
        if bevel > 0:
            edges = set()
            for v in res['verts']:
                edges.update(v.link_edges)
            # bevel thay the vert/face goc bang vert/face moi -> khong dung res['verts'] sau buoc nay
            bmesh.ops.bevel(self.bm, geom=list(edges), offset=bevel, segments=1, affect='EDGES', profile=0.7)
        faces = set()
        for v in self.bm.verts:
            if v[self.lay] == 0:          # vert chua co tag = vert cua khoi nay (ke ca vert moi do bevel)
                v[self.lay] = pid
                faces.update(v.link_faces)
        for f in faces:
            f.material_index = mi
        return faces
    def ball(self, rad, center, mi, pid, sub=1, squash=1.0):
        res = bmesh.ops.create_icosphere(self.bm, subdivisions=sub, radius=rad, matrix=Matrix.Translation(center), calc_uvs=False)
        faces = set()
        for v in res['verts']:
            v.co.z = center[2] + (v.co.z - center[2]) * squash
            v[self.lay] = pid
            faces.update(v.link_faces)
        for f in faces:
            f.material_index = mi
    def ring(self, rad, tube, center, mi, pid, seg=10):
        """Vòng kính: quét mặt cắt vuông nhỏ quanh đường tròn nằm trong mặt XZ (hướng -Y)."""
        rings = []
        for i in range(seg):
            a = 2 * math.pi * i / seg
            cx, cz = center[0] + rad * math.cos(a), center[2] + rad * math.sin(a)
            rdir = Vector((math.cos(a), 0, math.sin(a)))
            c = Vector((cx, center[1], cz))
            ring = [self.bm.verts.new(c + rdir * (-tube) + Vector((0, -tube, 0))),
                    self.bm.verts.new(c + rdir * tube + Vector((0, -tube, 0))),
                    self.bm.verts.new(c + rdir * tube + Vector((0, tube, 0))),
                    self.bm.verts.new(c + rdir * (-tube) + Vector((0, tube, 0)))]
            for v in ring:
                v[self.lay] = pid
            rings.append(ring)
        for i in range(seg):
            A, Bv = rings[i], rings[(i + 1) % seg]
            for k in range(4):
                f = self.bm.faces.new((A[k], A[(k+1)%4], Bv[(k+1)%4], Bv[k]))
                f.material_index = mi
    def arc(self, rad, tube, center, a0, a1, mi, pid, seg=5):
        """Nụ cười: cung tròn nhỏ trong mặt XZ."""
        rings = []
        for i in range(seg + 1):
            a = a0 + (a1 - a0) * i / seg
            c = Vector((center[0] + rad * math.cos(a), center[1], center[2] + rad * math.sin(a)))
            rdir = Vector((math.cos(a), 0, math.sin(a)))
            ring = [self.bm.verts.new(c + rdir * (-tube) + Vector((0, -tube, 0))),
                    self.bm.verts.new(c + rdir * tube + Vector((0, -tube, 0))),
                    self.bm.verts.new(c + rdir * tube + Vector((0, tube, 0))),
                    self.bm.verts.new(c + rdir * (-tube) + Vector((0, tube, 0)))]
            for v in ring:
                v[self.lay] = pid
            rings.append(ring)
        fs = []
        for A, Bv in zip(rings[:-1], rings[1:]):
            for k in range(4):
                fs.append(self.bm.faces.new((A[k], A[(k+1)%4], Bv[(k+1)%4], Bv[k])))
        fs.append(self.bm.faces.new(list(reversed(rings[0]))))
        fs.append(self.bm.faces.new(rings[-1]))
        for f in fs:
            f.material_index = mi

def build_character():
    for n in ("AST01_Avatar", "AST01_Rig"):
        o = bpy.data.objects.get(n)
        if o:
            bpy.data.objects.remove(o, do_unlink=True)
    for a in list(bpy.data.actions):
        if a.name in ("Idle", "Walk", "Run"):
            bpy.data.actions.remove(a)
    mats = get_mats()
    b = B()
    S, K, H, P, SH, D = (IDX[k] for k in ("shirt", "skin", "hair", "pants", "shoe", "dark"))

    # ---- thân + cổ (spine) ----
    b.box((0.40, 0.26, 0.42), (0, 0, 0.81), S, 1, bevel=0.045)
    b.box((0.13, 0.13, 0.10), (0, 0, 1.055), K, 1, bevel=0.03)
    # ---- đầu (head): đầu ≈ 1/3 chiều cao ----
    b.box((0.46, 0.44, 0.50), (0, 0, 1.35), K, 2, bevel=0.07)
    b.box((0.49, 0.45, 0.19), (0, 0.025, 1.515), H, 2, bevel=0.05)          # mũ tóc
    b.box((0.42, 0.10, 0.13), (0, -0.19, 1.535), H, 2, bevel=0.035)         # mái
    for dx, dz, sz in ((-0.14, 1.62, 0.07), (0.05, 1.64, 0.08), (0.17, 1.60, 0.06)):   # tóc rối
        b.box((sz, sz * 0.9, sz), (dx, 0.0, dz), H, 2, bevel=0.02)
    for sx in (-1, 1):
        b.ball(0.028, (sx * 0.095, -0.228, 1.375), D, 2, sub=1)               # mắt chấm
        b.ring(0.078, 0.011, (sx * 0.10, -0.236, 1.37), D, 2)                  # kính tròn
        b.box((0.012, 0.20, 0.012), (sx * 0.178, -0.13, 1.375), D, 2)          # gọng
    b.box((0.05, 0.012, 0.012), (0, -0.236, 1.37), D, 2)                      # cầu kính
    b.arc(0.05, 0.009, (0, -0.226, 1.25), math.radians(205), math.radians(335), D, 2)   # cười
    # ---- tay: A-pose 45° chếch xuống-ra, KHÔNG dính thân (nghiệm thu #1) ----
    for sx, pid_u, pid_f in ((-1, 3, 4), (1, 5, 6)):
        rot = Matrix.Rotation(sx * math.radians(-45), 4, 'Y')
        sh = Vector((sx * 0.245, 0, 0.975))                                    # vai
        d = Vector((sx * math.sin(math.radians(45)), 0, -math.cos(math.radians(45))))
        b.box((0.13, 0.13, 0.19), sh + d * 0.095, S, pid_u, bevel=0.03, rot=rot)
        el = sh + d * 0.19                                                     # khuỷu
        b.box((0.12, 0.12, 0.16), el + d * 0.08, S, pid_f, bevel=0.03, rot=rot)
        b.box((0.125, 0.11, 0.11), el + d * 0.215, K, pid_f, bevel=0.04, rot=rot)   # bàn tay bao
    # ---- chân: rộng bằng vai, đầu gối có khối ----
    for sx, pid_t, pid_s in ((-1, 7, 8), (1, 9, 10)):
        b.box((0.16, 0.17, 0.30), (sx * 0.10, 0, 0.45), P, pid_t, bevel=0.03)
        b.box((0.14, 0.15, 0.22), (sx * 0.10, 0, 0.19), P, pid_s, bevel=0.025)
        b.box((0.16, 0.26, 0.085), (sx * 0.10, -0.035, 0.0425), SH, pid_s, bevel=0.03)   # giày, mũi về -Y

    bmesh.ops.recalc_face_normals(b.bm, faces=b.bm.faces[:])
    me = bpy.data.meshes.new("AST01_Avatar")
    for m in mats:
        me.materials.append(m)
    b.bm.to_mesh(me); b.bm.free()
    # chuẩn hoá: chân z=0, đỉnh đúng 1.60 (nghiệm thu #4)
    zs = [v.co.z for v in me.vertices]
    z0, z1 = min(zs), max(zs)
    k = 1.60 / (z1 - z0)
    for v in me.vertices:
        v.co.z = (v.co.z - z0) * k
        v.co.x *= k; v.co.y *= k
    me.update()
    ob = bpy.data.objects.new("AST01_Avatar", me)
    bpy.context.collection.objects.link(ob)
    # vertex group theo khối
    attr = me.attributes.get("part")
    for pid, bone in PARTS.items():
        vg = ob.vertex_groups.new(name=bone)
        idx = [i for i, a in enumerate(attr.data) if a.value == pid]
        vg.add(idx, 1.0, 'REPLACE')
    xs = [v.co.x for v in me.vertices]
    return "avatar: cao %.3f m | rong %.2f m | tris %d | %d khoi" % (
        max(v.co.z for v in me.vertices), max(xs) - min(xs),
        sum(len(p.vertices)-2 for p in me.polygons), len(PARTS))

# ---------- xương + hoạt ảnh ----------
BONES = [  # (tên, cha, đầu, đuôi) — toạ độ trước chuẩn hoá xấp xỉ, tay/chân xương thẳng đứng cho dễ xoay
    ("hips", None, (0, 0, 0.60), (0, 0, 0.72)),
    ("spine", "hips", (0, 0, 0.72), (0, 0, 1.02)),
    ("head", "spine", (0, 0, 1.02), (0, 0, 1.60)),
    ("upperarm.L", "spine", (-0.245, 0, 0.975), (-0.245, 0, 0.80)),
    ("forearm.L", "upperarm.L", (-0.379, 0, 0.841), (-0.379, 0, 0.66)),
    ("upperarm.R", "spine", (0.245, 0, 0.975), (0.245, 0, 0.80)),
    ("forearm.R", "upperarm.R", (0.379, 0, 0.841), (0.379, 0, 0.66)),
    ("thigh.L", "hips", (-0.10, 0, 0.60), (-0.10, 0, 0.30)),
    ("shin.L", "thigh.L", (-0.10, 0, 0.30), (-0.10, 0, 0.06)),
    ("thigh.R", "hips", (0.10, 0, 0.60), (0.10, 0, 0.30)),
    ("shin.R", "thigh.R", (0.10, 0, 0.30), (0.10, 0, 0.06)),
]

def _all_fcurves(act):
    if hasattr(act, "fcurves"):
        try:
            return list(act.fcurves)
        except Exception:
            pass
    out = []
    for layer in getattr(act, "layers", []):
        for strip in layer.strips:
            for cb in strip.channelbags:
                out.extend(cb.fcurves)
    return out

def rig_and_animate(fps=24):
    # dọn rig / action cũ nếu chạy lại
    old = bpy.data.objects.get("AST01_Rig")
    if old:
        bpy.data.objects.remove(old, do_unlink=True)
    for a in list(bpy.data.actions):
        if a.name in ("Idle", "Walk", "Run"):
            bpy.data.actions.remove(a)
    ob = bpy.data.objects["AST01_Avatar"]
    arm_data = bpy.data.armatures.new("AST01_Rig")
    arm = bpy.data.objects.new("AST01_Rig", arm_data)
    bpy.context.collection.objects.link(arm)
    bpy.ops.object.select_all(action='DESELECT')
    arm.select_set(True); bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode='EDIT')
    eb = {}
    for name, parent, h, t in BONES:
        e = arm_data.edit_bones.new(name)
        e.head, e.tail = Vector(h), Vector(t)
        e.roll = 0.0
        eb[name] = e
    for name, parent, h, t in BONES:
        if parent:
            eb[name].parent = eb[parent]
    bpy.ops.object.mode_set(mode='OBJECT')
    ob.parent = arm
    mod = ob.modifiers.new("Armature", 'ARMATURE'); mod.object = arm

    bpy.context.scene.render.fps = fps
    pb = arm.pose.bones
    for p in pb.values():
        p.rotation_mode = 'XYZ'

    def key(action, frame, rots=None, locs=None):
        for name, (rx, ry, rz) in (rots or {}).items():
            p = pb[name]; p.rotation_euler = (math.radians(rx), math.radians(ry), math.radians(rz))
            p.keyframe_insert("rotation_euler", frame=frame)
        for name, loc in (locs or {}).items():
            p = pb[name]; p.location = loc
            p.keyframe_insert("location", frame=frame)

    def make(name, length, keys):
        act = bpy.data.actions.new(name)
        arm.animation_data_create()
        arm.animation_data.action = act
        for p in pb.values():
            p.rotation_euler = (0, 0, 0); p.location = (0, 0, 0)
        for frame, rots, locs in keys:
            key(act, frame, rots, locs)
        # nội suy mượt + lặp. Blender 5.x: fcurves nằm trong layers/strips/channelbags
        for fc in _all_fcurves(act):
            for kp in fc.keyframe_points:
                kp.interpolation = 'BEZIER'; kp.easing = 'AUTO'
            try:
                fc.modifiers.new('CYCLES')
            except Exception:
                pass
        act.frame_range = (0, length)
        act.use_frame_range = True
        # đẩy vào NLA để exporter lấy đủ 3 clip
        tr = arm.animation_data.nla_tracks.new(); tr.name = name
        st = tr.strips.new(name, 0, act); st.action_frame_end = length
        tr.mute = True
        arm.animation_data.action = None
        return act

    A, Kb, A2 = 34, 40, 22      # đi: biên độ đùi, gập gối, tay
    R, Kr, R2 = 52, 62, 42      # chạy
    Z = (0, 0, 0)
    make("Idle", 48, [
        (0,  {"spine": (0,0,0), "head": (0,0,0), "upperarm.L": (0,0,0), "upperarm.R": (0,0,0)}, {"hips": (0,0,0)}),
        (24, {"spine": (2.2,0,0), "head": (-1.5,0,3), "upperarm.L": (0,0,-2.5), "upperarm.R": (0,0,2.5)}, {"hips": (0,0,-0.012)}),
        (48, {"spine": (0,0,0), "head": (0,0,0), "upperarm.L": (0,0,0), "upperarm.R": (0,0,0)}, {"hips": (0,0,0)}),
    ])
    make("Walk", 24, [
        (0,  {"thigh.L": (A,0,0), "thigh.R": (-A,0,0), "shin.L": (0,0,0), "shin.R": (-Kb,0,0),
              "upperarm.L": (-A2,0,0), "upperarm.R": (A2,0,0), "forearm.L": (-15,0,0), "forearm.R": (-15,0,0),
              "spine": (3,0,0), "head": (-2,0,0)}, {"hips": (0,0,0)}),
        (6,  {"thigh.L": (0,0,0), "thigh.R": (0,0,0), "shin.L": (-Kb*0.5,0,0), "shin.R": (-Kb*0.5,0,0),
              "upperarm.L": (0,0,0), "upperarm.R": (0,0,0), "forearm.L": (-15,0,0), "forearm.R": (-15,0,0),
              "spine": (3,0,0), "head": (-2,0,0)}, {"hips": (0,0,0.03)}),
        (12, {"thigh.L": (-A,0,0), "thigh.R": (A,0,0), "shin.L": (-Kb,0,0), "shin.R": (0,0,0),
              "upperarm.L": (A2,0,0), "upperarm.R": (-A2,0,0), "forearm.L": (-15,0,0), "forearm.R": (-15,0,0),
              "spine": (3,0,0), "head": (-2,0,0)}, {"hips": (0,0,0)}),
        (18, {"thigh.L": (0,0,0), "thigh.R": (0,0,0), "shin.L": (-Kb*0.5,0,0), "shin.R": (-Kb*0.5,0,0),
              "upperarm.L": (0,0,0), "upperarm.R": (0,0,0), "forearm.L": (-15,0,0), "forearm.R": (-15,0,0),
              "spine": (3,0,0), "head": (-2,0,0)}, {"hips": (0,0,0.03)}),
        (24, {"thigh.L": (A,0,0), "thigh.R": (-A,0,0), "shin.L": (0,0,0), "shin.R": (-Kb,0,0),
              "upperarm.L": (-A2,0,0), "upperarm.R": (A2,0,0), "forearm.L": (-15,0,0), "forearm.R": (-15,0,0),
              "spine": (3,0,0), "head": (-2,0,0)}, {"hips": (0,0,0)}),
    ])
    make("Run", 16, [
        (0,  {"thigh.L": (R,0,0), "thigh.R": (-R,0,0), "shin.L": (0,0,0), "shin.R": (-Kr,0,0),
              "upperarm.L": (-R2,0,0), "upperarm.R": (R2,0,0), "forearm.L": (-55,0,0), "forearm.R": (-55,0,0),
              "spine": (12,0,0), "head": (-6,0,0)}, {"hips": (0,0,0.02)}),
        (4,  {"thigh.L": (0,0,0), "thigh.R": (0,0,0), "shin.L": (-Kr*0.55,0,0), "shin.R": (-Kr*0.55,0,0),
              "upperarm.L": (0,0,0), "upperarm.R": (0,0,0), "forearm.L": (-55,0,0), "forearm.R": (-55,0,0),
              "spine": (12,0,0), "head": (-6,0,0)}, {"hips": (0,0,0.07)}),
        (8,  {"thigh.L": (-R,0,0), "thigh.R": (R,0,0), "shin.L": (-Kr,0,0), "shin.R": (0,0,0),
              "upperarm.L": (R2,0,0), "upperarm.R": (-R2,0,0), "forearm.L": (-55,0,0), "forearm.R": (-55,0,0),
              "spine": (12,0,0), "head": (-6,0,0)}, {"hips": (0,0,0.02)}),
        (12, {"thigh.L": (0,0,0), "thigh.R": (0,0,0), "shin.L": (-Kr*0.55,0,0), "shin.R": (-Kr*0.55,0,0),
              "upperarm.L": (0,0,0), "upperarm.R": (0,0,0), "forearm.L": (-55,0,0), "forearm.R": (-55,0,0),
              "spine": (12,0,0), "head": (-6,0,0)}, {"hips": (0,0,0.07)}),
        (16, {"thigh.L": (R,0,0), "thigh.R": (-R,0,0), "shin.L": (0,0,0), "shin.R": (-Kr,0,0),
              "upperarm.L": (-R2,0,0), "upperarm.R": (R2,0,0), "forearm.L": (-55,0,0), "forearm.R": (-55,0,0),
              "spine": (12,0,0), "head": (-6,0,0)}, {"hips": (0,0,0.02)}),
    ])
    return "rig: %d xuong | clip: Idle 48f, Walk 24f, Run 16f @ %dfps" % (len(BONES), fps)

def pose_frame(action_name, frame):
    """Xem thử một khung: bật đúng track NLA, tắt các track khác."""
    arm = bpy.data.objects["AST01_Rig"]
    for tr in arm.animation_data.nla_tracks:
        tr.mute = (tr.name != action_name)
    bpy.context.scene.frame_set(frame)

def bake_character(size=1024):
    import numpy as np
    ob = bpy.data.objects["AST01_Avatar"]
    bpy.ops.object.select_all(action='DESELECT')
    ob.select_set(True); bpy.context.view_layer.objects.active = ob
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=1.15, island_margin=0.02)
    bpy.ops.object.mode_set(mode='OBJECT')
    old = bpy.data.images.get("AST01_BaseColor")
    if old: bpy.data.images.remove(old)
    img = bpy.data.images.new("AST01_BaseColor", size, size, alpha=False)
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
    prev = bpy.data.materials.get("AST01_Atlas")
    if prev: bpy.data.materials.remove(prev)
    at = bpy.data.materials.new("AST01_Atlas"); at.use_nodes = True
    nt = at.node_tree
    bsdf = next(x for x in nt.nodes if x.type == 'BSDF_PRINCIPLED')
    bsdf.inputs['Roughness'].default_value = 0.9; bsdf.inputs['Metallic'].default_value = 0.0
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
    img.pixels.foreach_set(px.reshape(-1)); img.update()
    return "baked atlas %dx%d, 1 material" % (size, size)

def export_character():
    os.makedirs(OUT_GLB, exist_ok=True)
    ob = bpy.data.objects["AST01_Avatar"]; arm = bpy.data.objects["AST01_Rig"]
    for tr in arm.animation_data.nla_tracks:
        tr.mute = False
    bpy.context.scene.frame_set(0)
    bpy.ops.object.select_all(action='DESELECT')
    ob.select_set(True); arm.select_set(True)
    bpy.context.view_layer.objects.active = arm
    kw = dict(filepath=os.path.join(OUT_GLB, "AST01.glb"), export_format='GLB', use_selection=True,
              export_apply=False, export_yup=True, export_skins=True, export_animations=True,
              export_force_sampling=True, export_nla_strips=True)
    try:
        bpy.ops.export_scene.gltf(export_animation_mode='ACTIONS', **kw)
    except TypeError:
        bpy.ops.export_scene.gltf(**kw)
    for tr in arm.animation_data.nla_tracks:
        tr.mute = True
    bpy.ops.object.select_all(action='DESELECT')
    return "exported AST01.glb"
