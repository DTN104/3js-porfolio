# build_sky.py — AST-14 bầu trời: panorama 360° equirectangular render từ Blender
# exec(open("<duong-dan>/build_sky.py").read())  ·  build_sky_scene()  ·  render_sky(2048)
#
# Theo asset-prompts.md 4.14: gradient dọc từ xanh băng nhạt (#DCEEF6, chân trời) lên xanh vừa (#6FA8CF,
# đỉnh); vài đám mây cumulus chắc, đáy phẳng ở tầm giữa; một quầng nắng ấm ~30° trên chân trời một bên;
# KHÔNG mặt đất, KHÔNG đường chân trời rắn — nhìn xuống vẫn là trời và mây. Mây lấy đúng model AST-21.
import bpy, math, random, os
from mathutils import Vector

OUT_DIR = "/Users/td-macbook-07/Work/threejs-portfolio/prototype/public/models/sky"
CLOUD_BLEND = "/Users/td-macbook-07/Work/threejs-portfolio/specs/001-3d-world-portfolio/assets-3d/clouds/AST21-clouds.blend"
SKY_TOP, SKY_HOR = "6FA8CF", "DCEEF6"
SUN_AZ, SUN_EL = 35.0, 30.0          # phương vị / cao độ mặt trời (độ) — nắng bên phải-trước

def s2l(c):
    c /= 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
def rgb(h): return (s2l(int(h[0:2],16)), s2l(int(h[2:4],16)), s2l(int(h[4:6],16)), 1.0)

def build_world():
    w = bpy.context.scene.world or bpy.data.worlds.new("SkyWorld")
    bpy.context.scene.world = w
    w.use_nodes = True
    nt = w.node_tree
    nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputWorld')
    bg = nt.nodes.new('ShaderNodeBackground'); bg.inputs['Strength'].default_value = 1.0
    tex = nt.nodes.new('ShaderNodeTexCoord')
    sep = nt.nodes.new('ShaderNodeSeparateXYZ')
    # cao độ: |z| của hướng nhìn -> 0 ở chân trời, 1 ở đỉnh/đáy (đối xứng: nhìn xuống vẫn là trời)
    absz = nt.nodes.new('ShaderNodeMath'); absz.operation = 'ABSOLUTE'
    pw = nt.nodes.new('ShaderNodeMath'); pw.operation = 'MULTIPLY'; pw.inputs[1].default_value = 1.0
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.interpolation = 'EASE'
    ramp.color_ramp.elements[0].position = 0.0; ramp.color_ramp.elements[0].color = rgb(SKY_HOR)
    ramp.color_ramp.elements[1].position = 0.62; ramp.color_ramp.elements[1].color = rgb(SKY_TOP)
    # quầng nắng: dot(hướng nhìn, hướng mặt trời) -> mềm, ấm
    sun = Vector((math.cos(math.radians(SUN_EL)) * math.sin(math.radians(SUN_AZ)),
                  math.cos(math.radians(SUN_EL)) * math.cos(math.radians(SUN_AZ)),
                  math.sin(math.radians(SUN_EL)))).normalized()
    dot = nt.nodes.new('ShaderNodeVectorMath'); dot.operation = 'DOT_PRODUCT'; dot.inputs[1].default_value = sun
    glow = nt.nodes.new('ShaderNodeMath'); glow.operation = 'POWER'; glow.inputs[1].default_value = 60.0
    halo = nt.nodes.new('ShaderNodeMath'); halo.operation = 'POWER'; halo.inputs[1].default_value = 5.0
    halo_m = nt.nodes.new('ShaderNodeMath'); halo_m.operation = 'MULTIPLY'; halo_m.inputs[1].default_value = 0.22
    add = nt.nodes.new('ShaderNodeMath'); add.operation = 'ADD'
    clamp = nt.nodes.new('ShaderNodeClamp')
    mul = nt.nodes.new('ShaderNodeMath'); mul.operation = 'MULTIPLY'; mul.inputs[1].default_value = 0.55
    mix = nt.nodes.new('ShaderNodeMix'); mix.data_type = 'RGBA'; mix.blend_type = 'ADD'
    mix.inputs['B'].default_value = (1.0, 0.86, 0.62, 1.0)
    L = nt.links
    L.new(tex.outputs['Generated'], sep.inputs['Vector'])
    L.new(sep.outputs['Z'], absz.inputs[0]); L.new(absz.outputs[0], pw.inputs[0]); L.new(pw.outputs[0], ramp.inputs['Fac'])
    L.new(tex.outputs['Generated'], dot.inputs[0]); L.new(dot.outputs['Value'], clamp.inputs['Value'])
    L.new(clamp.outputs[0], glow.inputs[0]); L.new(clamp.outputs[0], halo.inputs[0]); L.new(halo.outputs[0], halo_m.inputs[0])
    L.new(glow.outputs[0], add.inputs[0]); L.new(halo_m.outputs[0], add.inputs[1]); L.new(add.outputs[0], mul.inputs[0])
    L.new(ramp.outputs['Color'], mix.inputs['A']); L.new(mul.outputs[0], mix.inputs['Factor'])
    L.new(mix.outputs['Result'], bg.inputs['Color']); L.new(bg.outputs['Background'], out.inputs['Surface'])
    return sun

def build_sky_scene(n_clouds=40, seed=7):
    bpy.ops.wm.read_homefile(use_empty=True)
    sc = bpy.context.scene
    sun = build_world()
    # camera panorama ở gốc
    cam_d = bpy.data.cameras.new("PanoCam"); cam = bpy.data.objects.new("PanoCam", cam_d)
    sc.collection.objects.link(cam); sc.camera = cam
    cam.location = (0, 0, 0); cam.rotation_euler = (math.radians(90), 0, 0)
    cam_d.type = 'PANO'
    try:
        cam_d.panorama_type = 'EQUIRECTANGULAR'
    except Exception:
        cam_d.cycles.panorama_type = 'EQUIRECTANGULAR'
    # đèn mặt trời khớp quầng nắng
    ld = bpy.data.lights.new("Sun", 'SUN'); ld.energy = 3.0; ld.angle = math.radians(6)
    lo = bpy.data.objects.new("Sun", ld); sc.collection.objects.link(lo)
    lo.rotation_euler = (-sun).to_track_quat('-Z', 'Y').to_euler()
    lo.rotation_euler = sun.to_track_quat('Z', 'Y').to_euler()
    # nạp 4 mây AST-21 rồi rải quanh camera ở tầm giữa (5–28°), xa 70–140 m
    with bpy.data.libraries.load(CLOUD_BLEND, link=False) as (src, dst):
        dst.objects = [n for n in src.objects if n.startswith("AST21_Cloud")]
    base = [o for o in dst.objects if o is not None]
    cm = bpy.data.materials.new("SkyCloud"); cm.use_nodes = True
    bs = next(x for x in cm.node_tree.nodes if x.type == 'BSDF_PRINCIPLED')
    bs.inputs['Base Color'].default_value = rgb("F6F9FB"); bs.inputs['Roughness'].default_value = 1.0
    for b in base:
        b.data.materials.clear(); b.data.materials.append(cm)
    random.seed(seed)
    for i in range(n_clouds):
        b = random.choice(base)
        o = b.copy(); o.data = b.data
        sc.collection.objects.link(o)
        az = random.uniform(0, math.tau); el = math.radians(random.uniform(4, 28)); d = random.uniform(90, 170)
        if random.random() < 0.35: el = -el * 0.7                    # vài đám dưới chân trời
        o.location = (math.cos(el) * math.sin(az) * d, math.cos(el) * math.cos(az) * d, math.sin(el) * d)
        s = random.uniform(1.0, 2.0); o.scale = (s, s, s)
        o.rotation_euler = (0, 0, random.uniform(0, math.tau))
    for b in base:
        b.hide_render = True; b.hide_viewport = True
    return "sky scene: %d clouds" % n_clouds

def render_sky(width=2048, samples=48):
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.samples = samples
    sc.cycles.use_denoising = True
    sc.render.resolution_x = width; sc.render.resolution_y = width // 2; sc.render.resolution_percentage = 100
    sc.render.image_settings.file_format = 'JPEG'; sc.render.image_settings.quality = 90
    sc.view_settings.view_transform = 'Standard'
    os.makedirs(OUT_DIR, exist_ok=True)
    sc.render.filepath = os.path.join(OUT_DIR, "AST14_sky.jpg")
    bpy.ops.render.render(write_still=True)
    return sc.render.filepath
