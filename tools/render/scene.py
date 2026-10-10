"""Szenen-Helfer fuer die BREIT-Renderings: Netze, Schnitte, Hohlkehle, Licht, Kamera."""
import math
import numpy as np
import bpy, bmesh
from mathutils import Vector

C = bpy.context
D = bpy.data


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)



def mesh_from(name, verts, faces):
    me = D.meshes.new(name)
    me.from_pydata([tuple(v) for v in verts], [], [tuple(f) for f in faces])
    me.update()
    ob = D.objects.new(name, me)
    C.scene.collection.objects.link(ob)
    return ob



def bm_of(ob):
    bm = bmesh.new(); bm.from_mesh(ob.data); return bm



def voxel(ob, size):
    ob.data.remesh_voxel_size = size
    C.view_layer.objects.active = ob
    with C.temp_override(active_object=ob, object=ob):
        bpy.ops.object.voxel_remesh()



def hem_cutter(base, tail):
    n = 120
    xs = np.linspace(-0.6, 0.6, n)
    ys = np.linspace(-0.4, 0.4, n // 2)
    verts = []
    for y in ys:
        for x in xs:
            ax = abs(x)
            t = np.clip((ax - 0.06) / (0.20 - 0.06), 0, 1)
            t = t * t * (3 - 2 * t)
            verts.append((x, y, base + tail * t))
    nx, ny = len(xs), len(ys)
    top = len(verts)
    for y in ys:
        for x in xs:
            verts.append((x, y, -0.5))
    faces = []
    for j in range(ny - 1):
        for i in range(nx - 1):
            a = j * nx + i
            faces.append((a, a + 1, a + nx + 1, a + nx))
            b = top + a
            faces.append((b, b + nx, b + nx + 1, b + 1))
    # sides
    def ring(idx):
        return idx
    border = [j * nx for j in range(ny)][::-1] + list(range(nx)) + [j * nx + nx - 1 for j in range(ny)] + [(ny - 1) * nx + i for i in range(nx)][::-1]
    # build side walls along each edge
    edges = []
    for i in range(nx - 1):
        edges.append((i, i + 1))
        edges.append(((ny - 1) * nx + i + 1, (ny - 1) * nx + i))
    for j in range(ny - 1):
        edges.append(((j + 1) * nx, j * nx))
        edges.append((j * nx + nx - 1, (j + 1) * nx + nx - 1))
    for a, b in edges:
        faces.append((b, a, a + top, b + top))
    ob = mesh_from("hemcut", verts, faces)
    bm = bm_of(ob); bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(ob.data); bm.free()
    return ob



def smooth(ob, iters=12):
    m = ob.modifiers.new("cs", "SMOOTH"); m.factor = 0.6; m.iterations = iters
    C.view_layer.objects.active = ob
    bpy.ops.object.modifier_apply(modifier="cs")



def setup_render(res=(900, 1125), samples=64):
    sc = C.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.cycles.samples = samples
    sc.cycles.use_denoising = True
    sc.render.resolution_x, sc.render.resolution_y = res
    sc.render.resolution_percentage = 100
    sc.view_settings.view_transform = "AgX"
    sc.view_settings.look = "AgX - Medium High Contrast"
    sc.render.image_settings.file_format = "PNG"
    sc.cycles.max_bounces = 6
    sc.render.threads_mode = "AUTO"



def world(color=(0.8, 0.78, 0.74), strength=0.08):
    w = D.worlds.new("w"); C.scene.world = w
    w.use_nodes = True
    bg = w.node_tree.nodes["Background"]
    bg.inputs[0].default_value = (*color, 1); bg.inputs[1].default_value = strength



def backdrop(color):
    """Hohlkehle: Boden geht in einem Bogen in die Rueckwand ueber."""
    verts = []; faces = []
    prof = []
    for i in range(30):
        y = -6 + i * (6 / 29)
        prof.append((y, -0.12))
    R = 1.2
    for i in range(1, 25):
        a = i / 24 * math.pi / 2
        prof.append((R * math.sin(a), -0.12 + R - R * math.cos(a)))
    for i in range(1, 10):
        prof.append((R, -0.12 + R + i * 0.5))
    W = 8
    for (y, z) in prof:
        verts.append((-W, y + 1.0, z)); verts.append((W, y + 1.0, z))
    for i in range(len(prof) - 1):
        a = 2 * i
        faces.append((a, a + 1, a + 3, a + 2))
    ob = mesh_from("backdrop", verts, faces)
    for poly in ob.data.polygons: poly.use_smooth = True
    mat = D.materials.new("bd"); mat.use_nodes = True
    bs = mat.node_tree.nodes["Principled BSDF"]
    bs.inputs["Base Color"].default_value = (*color, 1)
    bs.inputs["Roughness"].default_value = 0.95
    ob.data.materials.append(mat)
    return ob



def area(name, loc, target, size, energy, color=(1, 1, 1), shape="RECTANGLE", sy=None):
    l = D.lights.new(name, "AREA"); l.energy = energy; l.color = color
    l.shape = shape; l.size = size; l.size_y = sy or size
    ob = D.objects.new(name, l); C.scene.collection.objects.link(ob)
    ob.location = loc
    d = Vector(target) - Vector(loc)
    ob.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    return ob



def camera(loc, target, lens=90, ortho=None):
    cam = D.cameras.new("cam"); cam.lens = lens
    if ortho:
        cam.type = "ORTHO"; cam.ortho_scale = ortho
    ob = D.objects.new("cam", cam); C.scene.collection.objects.link(ob)
    ob.location = loc
    d = Vector(target) - Vector(loc)
    ob.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    C.scene.camera = ob
    cam.dof.use_dof = False
    return ob



def basic_mat(name, color, rough=0.8, sheen=0.4):
    m = D.materials.new(name); m.use_nodes = True
    bs = m.node_tree.nodes["Principled BSDF"]
    bs.inputs["Base Color"].default_value = (*color, 1)
    bs.inputs["Roughness"].default_value = rough
    bs.inputs["Sheen Weight"].default_value = sheen
    return m

