"""BREIT garment renderer. Usage: python garment.py '<json cfg>'"""
import math, sys, json, os, time
import numpy as np
import bpy, bmesh
from mathutils import Vector, Matrix, noise
from mathutils.bvhtree import BVHTree

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import body
from scene import (reset, mesh_from, bm_of, voxel, hem_cutter, smooth, setup_render,
                   world, backdrop, area, camera)

C = bpy.context
D = bpy.data


def smoothstep(e0, e1, x):
    t = min(max((x - e0) / (e1 - e0), 0.0), 1.0)
    return t * t * (3 - 2 * t)


# ------------------------------------------------------------------ geometry

def arm_axis(s, side):
    sh = Vector((0.285 * s * side, 0.0, 0.64))
    el = Vector((0.345 * s * side, -0.012, 0.34))
    wr = Vector((0.395 * s * side, -0.040, 0.05))
    return sh, el, wr


def neck_plane(cfg):
    nf, nb = cfg.get("neck_front", 0.805), cfg.get("neck_back", 0.858)
    a = Vector((0, -0.09, nf)); b = Vector((0, 0.09, nb))
    t = (b - a).normalized(); n = t.cross(Vector((1, 0, 0))).normalized()
    if n.z < 0: n = -n
    return a, n


def base_shell(cfg):
    key = cfg.get("base", "long")
    cache = os.path.join(HERE, "cache_%s.npz" % key)
    if os.path.exists(cache):
        z = np.load(cache, allow_pickle=True)
        return mesh_from("garment", z["v"], list(z["f"]))
    v, f = body.build(cfg, offset=cfg.get("offset", 0.0))
    ob = mesh_from("garment", v, f)
    voxel(ob, cfg.get("voxel", 0.0055))
    bm = bm_of(ob)
    s = cfg.get("scale", 1.0)
    a, n = neck_plane(cfg)
    bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=a, plane_no=n, clear_outer=True)
    sl = cfg.get("sleeve", 1.0)
    for side in (-1, 1):
        sh, el, wr = arm_axis(s, side)
        if sl >= 0.99:
            co = wr + (el - wr).normalized() * cfg.get("cuff_back", 0.005); no = (wr - el).normalized()
        else:
            co = sh + (el - sh) * sl; no = (el - sh).normalized()
        bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=co, plane_no=no, dist=1e-6)
        kill = [v for v in bm.verts if (v.co - co).dot(no) > 1e-5 and abs(v.co.x) > 0.25 * s and (v.co - co).length < 0.75]
        bmesh.ops.delete(bm, geom=kill, context="VERTS")
    bm.to_mesh(ob.data); bm.free()
    hem_base = cfg.get("hem", 0.0); tail = cfg.get("tail", 0.06)
    cut = hem_cutter(hem_base, tail)
    mod = ob.modifiers.new("hem", "BOOLEAN"); mod.object = cut; mod.operation = "DIFFERENCE"; mod.solver = "EXACT"
    C.view_layer.objects.active = ob
    bpy.ops.object.modifier_apply(modifier="hem")
    D.objects.remove(cut)
    bm = bm_of(ob)
    kill = [fa for fa in bm.faces if abs(fa.normal.z) > 0.95 and fa.calc_center_median().z < hem_base + tail + 0.01]
    bmesh.ops.delete(bm, geom=kill, context="FACES")
    bm.to_mesh(ob.data); bm.free()
    smooth(ob, 3)
    if cfg.get("opening"):
        cut_opening(ob, cfg)
    v = np.array([x.co[:] for x in ob.data.vertices])
    f = np.array([tuple(p.vertices) for p in ob.data.polygons], dtype=object)
    np.savez(cache, v=v, f=f)
    return ob


def opening_w(z, cfg):
    zb = cfg.get("button_z", 0.40); zt = cfg.get("neck_front", 0.77)
    if z >= zb:
        return 0.004 + (z - zb) / (zt - zb) * cfg.get("open_top", 0.095)
    return 0.004 + ((zb - z) / 0.5) ** 1.5 * cfg.get("cutaway", 0.13)


def cut_opening(ob, cfg):
    """Front opening of a jacket: exact boolean with a prism that only reaches the front wall."""
    hem = cfg.get("hem", 0.0) - 0.08
    top = cfg.get("neck_front", 0.77) + 0.12
    zs = [hem + (top - hem) * i / 160 for i in range(161)]
    def w(z):
        zt = cfg.get("neck_front", 0.77)
        if z > zt:
            return opening_w(zt, cfg) + (z - zt) * 0.6
        return opening_w(z, cfg)
    poly = [(-w(z), z) for z in zs] + [(w(z), z) for z in reversed(zs)]
    y0, y1 = -0.6, -0.02
    verts = [(x, y0, z) for x, z in poly] + [(x, y1, z) for x, z in poly]
    n = len(poly)
    faces = [tuple(range(n))[::-1], tuple(range(n, 2 * n))]
    for i in range(n):
        j = (i + 1) % n
        faces.append((i, j, n + j, n + i))
    cut = mesh_from("opencut", verts, faces)
    bm = bm_of(cut); bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(cut.data); bm.free()
    mod = ob.modifiers.new("open", "BOOLEAN"); mod.object = cut; mod.operation = "DIFFERENCE"; mod.solver = "EXACT"
    C.view_layer.objects.active = ob
    bpy.ops.object.modifier_apply(modifier="open")
    D.objects.remove(cut)
    bm = bm_of(ob)
    kill = []
    for f in bm.faces:
        c = f.calc_center_median(); no = f.normal
        on_wall = abs(no.y) < 0.03 and abs(abs(c.x) - w(c.z)) < 0.004 and c.y > -0.3
        on_back = abs(c.y - y1) < 0.0015 and abs(no.y) > 0.98
        if on_wall or on_back:
            kill.append(f)
    bmesh.ops.delete(bm, geom=kill, context="FACES")
    loose = [v for v in bm.verts if not v.link_faces]
    bmesh.ops.delete(bm, geom=loose, context="VERTS")
    bm.to_mesh(ob.data); bm.free()


def add_folds(ob, cfg):
    """Procedural drape: vertical folds below the chest, ripples at elbow and cuff."""
    amp = cfg.get("folds", 1.0)
    if amp <= 0: return
    s = cfg.get("scale", 1.0)
    me = ob.data
    me.update()
    seed = Vector((cfg.get("seed", 3.1), 1.7, 0.3))
    axes = [arm_axis(s, k) for k in (-1, 1)]
    for v in me.vertices:
        p = v.co
        n = v.normal
        d = 0.0
        # life everywhere
        d += 0.0012 * noise.noise(p * 9 + seed)
        on_arm = abs(p.x) > 0.27 * s and p.z < 0.66
        if not on_arm:
            # torso drape: elongated vertical noise, ridged
            q = Vector((p.x * 16, p.y * 16, p.z * 3.2)) + seed
            r = 1 - abs(noise.noise(q))
            m = smoothstep(0.50, 0.18, p.z) * (0.6 + 0.4 * smoothstep(0.0, 0.12, abs(p.x)))
            d += amp * 0.009 * m * (r * r - 0.45)
            # armpit pull folds (diagonal)
            for k in (-1, 1):
                ax = p.x * k
                if ax > 0.12:
                    u = (ax - 0.12) * 1.0 + (0.62 - p.z) * 0.8
                    w = smoothstep(0.30, 0.0, abs(p.z - 0.56 + (ax - 0.2) * 0.6)) * smoothstep(0.12, 0.22, ax)
                    d += amp * 0.0035 * w * math.sin(u * 70 + noise.noise(q) * 2)
        else:
            side = 1 if p.x > 0 else -1
            sh, el, wr = axes[0 if side < 0 else 1]
            # param along arm
            ua = (p - sh).dot((wr - sh).normalized()) / (wr - sh).length
            perp = (p - sh) - (wr - sh).normalized() * (p - sh).dot((wr - sh).normalized())
            q = Vector((perp.x * 6, perp.y * 6, ua * 26)) + seed
            r = 1 - abs(noise.noise(q))
            m = 0.35 + 0.65 * (smoothstep(0.35, 0.5, ua) * smoothstep(0.68, 0.52, ua)) + 1.2 * smoothstep(0.82, 0.97, ua)
            m *= smoothstep(0.08, 0.2, ua)
            d += amp * 0.0045 * m * (r * r - 0.45)
        v.co = p + n * d
    me.update()


def pattern_u(co, s=1.0):
    """Horizontal pattern coordinate (m): arc length around the body, or around the arm beyond the armhole seam."""
    side = 1 if co.x >= 0 else -1
    nrm = Vector((side * 0.93, 0.0, -0.36)).normalized()
    p0 = Vector((0.252 * s * side, 0, 0.66))
    prof = ((-0.06, 0.205), (0.10, 0.198), (0.24, 0.205), (0.36, 0.228), (0.46, 0.250), (0.55, 0.262), (0.62, 0.258))
    zc = min(max(co.z, prof[0][0]), prof[-1][0])
    for (z0, a0), (z1, a1) in zip(prof, prof[1:]):
        if z0 <= zc <= z1:
            half = (a0 + (a1 - a0) * (zc - z0) / (z1 - z0)) * s
            break
    beyond_torso = abs(co.x) > half + 0.014 or co.z > 0.58
    if (co - p0).dot(nrm) > 0 and co.z < 0.72 and beyond_torso:
        sh, el, wr = arm_axis(s, side)
        ax = (wr - sh).normalized()
        d = co - sh
        perp = d - ax * d.dot(ax)
        out = Vector((side, 0, 0)); out = (out - ax * out.dot(ax)).normalized()
        fwd = ax.cross(out).normalized()
        if fwd.y > 0: fwd = -fwd
        a = math.atan2(perp.dot(fwd), perp.dot(out))
        return side * 0.40 + a * 0.075 * side
    return math.atan2(co.x, -co.y) * 0.22


def tag_pattern(ob, s=1.0):
    me = ob.data
    if "pu" in me.attributes:
        me.attributes.remove(me.attributes["pu"])
    at = me.attributes.new("pu", "FLOAT", "POINT")
    vals = [pattern_u(v.co, s) for v in me.vertices]
    at.data.foreach_set("value", vals)


def boundary_ring(ob, pred):
    bm = bm_of(ob)
    pts = [v.co.copy() for v in bm.verts if v.is_boundary and pred(v.co)]
    bm.free()
    return pts


def make_bvh(ob):
    dg = C.evaluated_depsgraph_get()
    return BVHTree.FromObject(ob, dg)


def project_front(bvh, x, z, off, ymin=-1.0):
    """Raycast from the front (-y) toward +y."""
    hit = bvh.ray_cast(Vector((x, ymin, z)), Vector((0, 1, 0)))
    if hit[0] is None: return None, None
    co, no = hit[0], hit[1]
    if no.y > 0: no = -no
    return co + no * off, no


def grid_mesh(name, rows):
    """rows: list of lists of Vector (same length). Builds a quad strip surface."""
    verts = [tuple(p) for r in rows for p in r]
    nu = len(rows[0])
    faces = []
    for j in range(len(rows) - 1):
        for i in range(nu - 1):
            a = j * nu + i
            faces.append((a, a + 1, a + nu + 1, a + nu))
    ob = mesh_from(name, verts, faces)
    for p in ob.data.polygons: p.use_smooth = True
    return ob


def solidify(ob, t, offset=0.0, sub=1):
    m = ob.modifiers.new("sol", "SOLIDIFY"); m.thickness = t; m.offset = offset
    m.use_even_offset = True
    if sub:
        ss = ob.modifiers.new("sub", "SUBSURF"); ss.levels = sub; ss.render_levels = sub


def make_placket(bvh, cfg, z_top, z_bot, half=0.0175):
    nx, nz = 8, 160
    rows = []
    for j in range(nz + 1):
        z = z_bot + (z_top - z_bot) * j / nz
        row = []
        for i in range(nx + 1):
            x = -half + 2 * half * i / nx
            co, no = project_front(bvh, x, z, 0.0008)
            row.append(co if co is not None else Vector((x, -0.15, z)))
        rows.append(row)
    ob = grid_mesh("placket", rows)
    solidify(ob, 0.0012, 1.0)
    return ob


def make_pocket(bvh, cfg, cx, cz, w=0.112, h=0.13, flap=False):
    nx, nz = 14, 18
    rows = []
    for j in range(nz + 1):
        t = j / nz
        z = cz - h / 2 + h * t
        row = []
        for i in range(nx + 1):
            u = i / nx
            x = cx - w / 2 + w * u
            # pointed bottom: corners sit higher than the centre point
            zb = cz - h / 2 + 0.014 * abs(u - 0.5) * 2
            zz = zb + (cz + h / 2 - zb) * t
            co, no = project_front(bvh, x, zz, 0.0007)
            row.append(co if co is not None else Vector((x, -0.15, zz)))
        rows.append(row)
    ob = grid_mesh("pocket", rows)
    solidify(ob, 0.0009, 1.0)
    obs = [ob]
    if flap:
        rows = []
        for j in range(7):
            t = j / 6
            z = cz + h / 2 + 0.012 - 0.05 * t
            row = []
            for i in range(nx + 1):
                u = i / nx
                x = cx - w / 2 - 0.003 + (w + 0.006) * u
                zz = z - t * 0.012 * (1 - abs(u - 0.5) * 2)
                co, no = project_front(bvh, x, zz, 0.0024)
                row.append(co if co is not None else Vector((x, -0.15, zz)))
            rows.append(row)
        fl = grid_mesh("flap", rows)
        solidify(fl, 0.0016, 1.0)
        obs.append(fl)
    return obs


def make_button(name, co, no, r=0.0058, mat=None):
    bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=r, depth=0.0022)
    b = C.object; b.name = name
    # rim: scale inner top face down a bit by bevel
    bv = b.modifiers.new("bev", "BEVEL"); bv.width = 0.0007; bv.segments = 3
    # four holes
    for k, (dx, dy) in enumerate(((1, 1), (-1, 1), (1, -1), (-1, -1))):
        bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=r * 0.13, depth=0.01, location=(dx * r * 0.27, dy * r * 0.27, 0))
        h = C.object
        m = b.modifiers.new("h%d" % k, "BOOLEAN"); m.object = h; m.operation = "DIFFERENCE"; m.solver = "EXACT"
        h.hide_render = True; h.hide_viewport = True
        h.parent = b
    b.modifiers.move(0, len(b.modifiers) - 1) if False else None
    b.location = co + no * 0.0011
    b.rotation_euler = no.to_track_quat("Z", "Y").to_euler()
    for p in b.data.polygons: p.use_smooth = True
    if mat: b.data.materials.append(mat)
    return b


def make_collar(bvh, cfg, ring_pts):
    """Collar stand + fall, built around the neck opening."""
    a, n = neck_plane(cfg)
    ctr = sum(ring_pts, Vector()) / len(ring_pts)
    # local frame: n = up axis of neck, f = front direction (-y projected)
    f = Vector((0, -1, 0)); f = (f - n * f.dot(n)).normalized()
    rgt = n.cross(f).normalized()  # +x-ish

    def ang(p):
        q = p - ctr
        return math.atan2(q.dot(rgt), q.dot(f))  # 0 at front, +- pi at back

    pts = sorted(ring_pts, key=ang)
    angs = [ang(p) for p in pts]

    def ring_at(phi):
        # interpolate radius of ring at angle phi
        phi = (phi + math.pi) % (2 * math.pi) - math.pi
        i = np.searchsorted(angs, phi)
        p0 = pts[(i - 1) % len(pts)]; p1 = pts[i % len(pts)]
        a0 = angs[(i - 1) % len(pts)]; a1 = angs[i % len(pts)]
        if a1 < a0: a1 += 2 * math.pi
        if phi < a0: phi += 2 * math.pi
        t = 0 if a1 == a0 else (phi - a0) / (a1 - a0)
        return p0.lerp(p1, t)

    style = cfg.get("collar", "spread")
    hs_back, hs_front = cfg.get("stand_back", 0.034), cfg.get("stand_front", 0.027)
    gap = cfg.get("collar_gap", 0.022)
    nu = 120
    stand_rows = []
    for j in range(7):
        t = j / 6
        row = []
        for i in range(nu + 1):
            phi = -math.pi + (2 * math.pi) * i / nu
            # map to gap-limited range: from +gap (left of front) around back to -gap
            phi = gap + (2 * math.pi - 2 * gap) * i / nu
            p = ring_at(phi)
            hs = hs_front + (hs_back - hs_front) * (1 - math.cos(phi)) / 2
            rad = (p - ctr); rad = rad - n * rad.dot(n)
            q = p + n * (hs * t) - rad.normalized() * (0.004 * t) + rad.normalized() * 0.0015
            row.append(q)
        stand_rows.append(row)
    stand = grid_mesh("stand", stand_rows)
    solidify(stand, 0.0016, 1.0)
    objs = [stand]
    if style == "band":
        return objs, stand_rows

    # fall (leaf)
    rows = []
    NS = 16
    for j in range(NS + 1):
        s_ = j / NS
        row = []
        if style == "buttondown":
            ps0, ps1 = 0.07, 0.38
        elif style == "polo":
            ps0, ps1 = 0.04, 0.30
        else:
            ps0, ps1 = 0.07, 0.56
        ps0, ps1 = cfg.get("ps0", ps0), cfg.get("ps1", ps1)
        pstart = ps0 + (ps1 - ps0) * (s_ ** 1.2)
        for i in range(nu + 1):
            phi = pstart + (2 * math.pi - 2 * pstart) * i / nu
            p = ring_at(phi)
            back = (1 - math.cos(phi)) / 2  # 1 at back, 0 front
            hs = hs_front + (hs_back - hs_front) * back
            rad = (p - ctr); rad = rad - n * rad.dot(n); rad.normalize()
            top = p + n * (hs + 0.0025) - rad * 0.004
            dphi = min(phi, 2 * math.pi - phi)
            fc = math.exp(-(dphi / cfg.get("point_spread", 0.8)) ** 2)
            Hl = cfg.get("leaf_back", 0.044) + (cfg.get("leaf_front", 0.088) - cfg.get("leaf_back", 0.044)) * fc
            # fold: first rows curl over the top of the stand
            if s_ < 0.18:
                th = s_ / 0.18 * math.pi * 0.5
                q = top + rad * (0.006 * math.sin(th) + 0.0) + n * (0.003 * math.cos(th))
            else:
                u = (s_ - 0.18) / 0.82
                out = 0.006 + u * (cfg.get("spread_back", 0.018) + (cfg.get("spread_front", 0.040) - cfg.get("spread_back", 0.018)) * fc)
                q = top + rad * out - n * (Hl * u)
            # keep outside the shirt body
            loc, nor, idx, dist = bvh.find_nearest(q)
            if loc is not None:
                w = q - loc
                if nor.dot(w) < 0.006:
                    q = loc + nor * 0.006
            row.append(q)
        rows.append(row)
    for _ in range(3):
        for j in range(1, len(rows)):
            r = rows[j]
            rows[j] = [r[0]] + [(r[i - 1] + r[i] * 2 + r[i + 1]) / 4 for i in range(1, len(r) - 1)] + [r[-1]]
    leaf = grid_mesh("leaf", rows)
    solidify(leaf, 0.0016, 1.0)
    objs.append(leaf)
    return objs, rows


def make_cuff(ob, cfg, side, length=0.068):
    s = cfg.get("scale", 1.0)
    sh, el, wr = arm_axis(s, side)
    sl = cfg.get("sleeve", 1.0)
    if sl >= 0.99:
        ax = (wr - el).normalized()
        end = wr + (el - wr).normalized() * cfg.get("cuff_back", 0.005)
    else:
        ax = (el - sh).normalized()
        end = sh + (el - sh) * sl
    ring = boundary_ring(ob, lambda c: (c - end).length < 0.12 and c.x * side > 0.27 * s and abs((c - end).dot(ax)) < 0.01)
    if not ring: return None
    ctr = sum(ring, Vector()) / len(ring)
    rads = sorted(((p - ctr) - ax * (p - ctr).dot(ax)).length for p in ring)
    rmax = rads[len(rads) // 2] + 0.002
    u = ax.orthogonal().normalized(); v = ax.cross(u).normalized()
    rows = []
    nu = 48
    for j in range(9):
        t = j / 8
        row = []
        for i in range(nu + 1):
            a = 2 * math.pi * i / nu
            r = rmax + 0.0035
            q = ctr - ax * (length * t - 0.003) + (u * math.cos(a) + v * math.sin(a) * 0.92) * r
            row.append(q)
        rows.append(row)
    cf = grid_mesh("cuff%d" % side, rows)
    solidify(cf, 0.0018, 0.0)
    return cf, ctr, ax, u, v, rmax


# ------------------------------------------------------------------ materials

def fabric_material(name, cfg):
    m = D.materials.new(name); m.use_nodes = True
    nt = m.node_tree; N = nt.nodes; L = nt.links
    bs = N["Principled BSDF"]
    tex = N.new("ShaderNodeTexCoord")
    mapping = N.new("ShaderNodeMapping")
    L.new(tex.outputs["Object"], mapping.inputs["Vector"])
    sep = N.new("ShaderNodeSeparateXYZ"); L.new(mapping.outputs["Vector"], sep.inputs[0])
    # horizontal pattern coordinate per vertex (see pattern_u): stripes follow body and sleeves
    ucoord = N.new("ShaderNodeAttribute"); ucoord.attribute_name = "pu"; ucoord.attribute_type = "GEOMETRY"

    def axis_out(axis):
        return ucoord.outputs["Fac"] if axis == "X" else sep.outputs[axis]
    c1 = cfg.get("color", (0.85, 0.85, 0.83))
    c2 = cfg.get("color2", c1)
    pattern = cfg.get("pattern", "solid")

    def rgb(c):
        n = N.new("ShaderNodeRGB"); n.outputs[0].default_value = (*c, 1); return n

    col_out = None
    if pattern == "stripe":
        # vertical bengal stripes along x
        mth = N.new("ShaderNodeMath"); mth.operation = "MULTIPLY"; mth.inputs[1].default_value = 1 / cfg.get("stripe_w", 0.007)
        L.new(axis_out("X"), mth.inputs[0])
        fr = N.new("ShaderNodeMath"); fr.operation = "PINGPONG"; fr.inputs[1].default_value = 1.0
        L.new(mth.outputs[0], fr.inputs[0])
        st = N.new("ShaderNodeMath"); st.operation = "GREATER_THAN"; st.inputs[1].default_value = 0.5
        L.new(fr.outputs[0], st.inputs[0])
        mix = N.new("ShaderNodeMix"); mix.data_type = "RGBA"
        L.new(st.outputs[0], mix.inputs["Factor"])
        L.new(rgb(c1).outputs[0], mix.inputs[6]); L.new(rgb(c2).outputs[0], mix.inputs[7])
        col_out = mix.outputs[2]
    elif pattern == "tartan":
        w = cfg.get("check_w", 0.085)
        def band(axis, phase, lo, hi):
            mth = N.new("ShaderNodeMath"); mth.operation = "MULTIPLY"; mth.inputs[1].default_value = 2 * math.pi / w
            L.new(axis_out(axis), mth.inputs[0])
            ph = N.new("ShaderNodeMath"); ph.operation = "ADD"; ph.inputs[1].default_value = phase
            L.new(mth.outputs[0], ph.inputs[0])
            sn = N.new("ShaderNodeMath"); sn.operation = "SINE"; L.new(ph.outputs[0], sn.inputs[0])
            mr = N.new("ShaderNodeMapRange"); mr.interpolation_type = "SMOOTHSTEP"
            mr.inputs["From Min"].default_value = lo; mr.inputs["From Max"].default_value = hi
            L.new(sn.outputs[0], mr.inputs["Value"])
            return mr.outputs["Result"]
        bx = band("X", 0.0, 0.15, 0.45); bz = band("Z", 0.0, 0.15, 0.45)
        tx = band("X", 1.9, 0.975, 0.995); tz = band("Z", 1.9, 0.975, 0.995)
        # base -> darker where bands, darkest at cross
        add = N.new("ShaderNodeMath"); add.operation = "ADD"
        L.new(bx, add.inputs[0]); L.new(bz, add.inputs[1])
        mr = N.new("ShaderNodeMapRange"); mr.inputs["From Max"].default_value = 2.0
        L.new(add.outputs[0], mr.inputs["Value"])
        ramp = N.new("ShaderNodeValToRGB"); cr = ramp.color_ramp
        cr.elements[0].color = (*c1, 1); cr.elements[1].color = (*cfg.get("color3", c2), 1)
        e = cr.elements.new(0.5); e.color = (*c2, 1)
        L.new(mr.outputs["Result"], ramp.inputs["Fac"])
        thin = N.new("ShaderNodeMath"); thin.operation = "MAXIMUM"
        L.new(tx, thin.inputs[0]); L.new(tz, thin.inputs[1])
        mix = N.new("ShaderNodeMix"); mix.data_type = "RGBA"
        L.new(thin.outputs[0], mix.inputs["Factor"])
        L.new(ramp.outputs[0], mix.inputs[6]); L.new(rgb(cfg.get("accent", c2)).outputs[0], mix.inputs[7])
        col_out = mix.outputs[2]
    elif pattern == "check":
        def bands(axis, w, thr):
            mth = N.new("ShaderNodeMath"); mth.operation = "MULTIPLY"; mth.inputs[1].default_value = 1 / w
            L.new(axis_out(axis), mth.inputs[0])
            fr = N.new("ShaderNodeMath"); fr.operation = "FRACT"; L.new(mth.outputs[0], fr.inputs[0])
            st = N.new("ShaderNodeMath"); st.operation = "LESS_THAN"; st.inputs[1].default_value = thr
            L.new(fr.outputs[0], st.inputs[0])
            return st
        w = cfg.get("check_w", 0.05)
        bx = bands("X", w, 0.42); bz = bands("Z", w, 0.42)
        bx2 = bands("X", w, 0.06); bz2 = bands("Z", w, 0.06)
        add = N.new("ShaderNodeMath"); add.operation = "ADD"
        L.new(bx.outputs[0], add.inputs[0]); L.new(bz.outputs[0], add.inputs[1])
        # 0 = base, 1 = one band, 2 = cross
        mr = N.new("ShaderNodeMapRange"); mr.inputs["From Max"].default_value = 2.0
        L.new(add.outputs[0], mr.inputs["Value"])
        ramp = N.new("ShaderNodeValToRGB")
        cr = ramp.color_ramp; cr.interpolation = "CONSTANT"
        cr.elements[0].color = (*c1, 1); cr.elements[1].position = 0.75; cr.elements[1].color = (*cfg.get("color3", c2), 1)
        e = cr.elements.new(0.4); e.color = (*c2, 1)
        L.new(mr.outputs["Result"], ramp.inputs["Fac"])
        # thin accent lines
        thin = N.new("ShaderNodeMath"); thin.operation = "MAXIMUM"
        L.new(bx2.outputs[0], thin.inputs[0]); L.new(bz2.outputs[0], thin.inputs[1])
        mix = N.new("ShaderNodeMix"); mix.data_type = "RGBA"
        L.new(thin.outputs[0], mix.inputs["Factor"])
        L.new(ramp.outputs[0], mix.inputs[6]); L.new(rgb(cfg.get("accent", c2)).outputs[0], mix.inputs[7])
        col_out = mix.outputs[2]
    else:
        col_out = rgb(c1).outputs[0]

    # heather / slub variation
    nz = N.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = cfg.get("slub_scale", 160.0); nz.inputs["Detail"].default_value = 4
    L.new(mapping.outputs["Vector"], nz.inputs["Vector"])
    if cfg.get("slub_stretch"):
        mapping.inputs["Scale"].default_value = (1, 1, 1)
    br = N.new("ShaderNodeMix"); br.data_type = "RGBA"; br.blend_type = "MULTIPLY"
    br.inputs["Factor"].default_value = cfg.get("heather", 0.12)
    L.new(col_out, br.inputs[6])
    gm = N.new("ShaderNodeMapRange"); gm.inputs["From Min"].default_value = 0.3; gm.inputs["From Max"].default_value = 0.7
    gm.inputs["To Min"].default_value = 0.85; gm.inputs["To Max"].default_value = 1.1
    L.new(nz.outputs["Fac"], gm.inputs["Value"])
    cmb = N.new("ShaderNodeCombineColor")
    L.new(gm.outputs[0], cmb.inputs[0]); L.new(gm.outputs[0], cmb.inputs[1]); L.new(gm.outputs[0], cmb.inputs[2])
    L.new(cmb.outputs[0], br.inputs[7])
    L.new(br.outputs[2], bs.inputs["Base Color"])

    bs.inputs["Roughness"].default_value = cfg.get("rough", 0.78)
    bs.inputs["Sheen Weight"].default_value = cfg.get("sheen", 0.5)
    bs.inputs["Sheen Roughness"].default_value = 0.4
    bs.inputs["Sheen Tint"].default_value = (*[min(1, x * 1.2 + 0.1) for x in c1], 1)
    if cfg.get("sss", 0):
        bs.inputs["Subsurface Weight"].default_value = cfg["sss"]
        bs.inputs["Subsurface Radius"].default_value = (0.002, 0.002, 0.002)

    # weave bump: two perpendicular waves (twill/oxford) + fine noise
    wscale = cfg.get("weave", 380.0)
    w1 = N.new("ShaderNodeTexWave"); w1.wave_type = "BANDS"; w1.bands_direction = "X"
    w1.inputs["Scale"].default_value = wscale; w1.inputs["Distortion"].default_value = 1.5
    w2 = N.new("ShaderNodeTexWave"); w2.wave_type = "BANDS"; w2.bands_direction = "Z"
    w2.inputs["Scale"].default_value = wscale; w2.inputs["Distortion"].default_value = 1.5
    L.new(mapping.outputs["Vector"], w1.inputs["Vector"]); L.new(mapping.outputs["Vector"], w2.inputs["Vector"])
    mx = N.new("ShaderNodeMath"); mx.operation = "MULTIPLY"
    L.new(w1.outputs["Fac"], mx.inputs[0]); L.new(w2.outputs["Fac"], mx.inputs[1])
    if cfg.get("knit"):
        w1.inputs["Scale"].default_value = cfg.get("knit_scale", 160.0)
        w1.inputs["Distortion"].default_value = 0.3
        w2.inputs["Scale"].default_value = cfg.get("knit_scale", 160.0) * 3
        w2.wave_profile = "SAW"
        mx.operation = "ADD"
    fn = N.new("ShaderNodeTexNoise"); fn.inputs["Scale"].default_value = 900; fn.inputs["Detail"].default_value = 2
    L.new(mapping.outputs["Vector"], fn.inputs["Vector"])
    ad = N.new("ShaderNodeMath"); ad.operation = "ADD"
    L.new(mx.outputs[0], ad.inputs[0]); L.new(fn.outputs["Fac"], ad.inputs[1])

    # seams: grooves at distance-to-plane (armholes, shoulder) + hem stitch
    height = ad.outputs[0]
    seams = cfg.get("seams_list", [])
    for (pn, pd, width, depth) in seams:
        dp = N.new("ShaderNodeVectorMath"); dp.operation = "DOT_PRODUCT"
        dp.inputs[1].default_value = pn
        L.new(tex.outputs["Object"], dp.inputs[0])
        sb = N.new("ShaderNodeMath"); sb.operation = "SUBTRACT"; sb.inputs[1].default_value = pd
        L.new(dp.outputs["Value"], sb.inputs[0])
        ab = N.new("ShaderNodeMath"); ab.operation = "ABSOLUTE"; L.new(sb.outputs[0], ab.inputs[0])
        mr = N.new("ShaderNodeMapRange"); mr.inputs["From Min"].default_value = 0; mr.inputs["From Max"].default_value = width
        mr.inputs["To Min"].default_value = -depth; mr.inputs["To Max"].default_value = 0
        L.new(ab.outputs[0], mr.inputs["Value"])
        ad2 = N.new("ShaderNodeMath"); ad2.operation = "ADD"
        L.new(height, ad2.inputs[0]); L.new(mr.outputs["Result"], ad2.inputs[1])
        height = ad2.outputs[0]
    bump = N.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = cfg.get("bump", 0.6)
    bump.inputs["Distance"].default_value = cfg.get("bump_dist", 0.0008)
    L.new(height, bump.inputs["Height"])
    L.new(bump.outputs["Normal"], bs.inputs["Normal"])
    return m


def button_material(cfg):
    m = D.materials.new("btn"); m.use_nodes = True
    bs = m.node_tree.nodes["Principled BSDF"]
    bs.inputs["Base Color"].default_value = (*cfg.get("button_color", (0.93, 0.92, 0.88)), 1)
    bs.inputs["Roughness"].default_value = 0.22
    bs.inputs["Coat Weight"].default_value = 0.6
    bs.inputs["Subsurface Weight"].default_value = 0.3
    return m


# ------------------------------------------------------------------ build

LEAF_ROWS = []


def build_garment(cfg):
    t0 = time.time()
    s = cfg.get("scale", 1.0)
    ob = base_shell(cfg)
    add_folds(ob, cfg)
    for p in ob.data.polygons: p.use_smooth = True
    solidify(ob, cfg.get("thick", 0.0022), -1.0, sub=1)
    bvh = make_bvh(ob)
    print("shell", time.time() - t0, flush=True)

    # seams for shader: armhole planes, shoulder, hem stitch
    seams = []
    for side in (-1, 1):
        sh, el, wr = arm_axis(s, side)
        nrm = Vector((side * 0.93, 0.0, -0.36)).normalized()
        p0 = Vector((0.252 * s * side, 0, 0.66))
        seams.append((tuple(nrm), nrm.dot(p0), 0.0011, 1.0))
    cfg["seams_list"] = seams
    fab = fabric_material("fabric", cfg)
    ob.data.materials.clear()
    for poly in ob.data.polygons: poly.material_index = 0
    ob.data.materials.append(fab)
    parts = [ob]

    ring = boundary_ring(ob, lambda c: c.z > 0.74 and abs(c.x) < 0.12)
    if cfg.get("collar", "spread") != "none" and ring:
        objs, rows = make_collar(bvh, cfg, ring)
        LEAF_ROWS[:] = rows
        parts += objs
    btn = button_material(cfg)
    a, n = neck_plane(cfg)
    neck_front_z = a.z + 0.004
    if cfg.get("placket", True):
        zbot = cfg.get("placket_bottom", cfg.get("hem", 0.0) + 0.002)
        pk = make_placket(bvh, cfg, neck_front_z - 0.003, zbot, cfg.get("placket_half", 0.0175))
        parts.append(pk)
        pk_bvh = make_bvh(pk)
        if cfg.get("collar", "spread") in ("spread", "buttondown", "band"):
            sb = make_bvh(parts[1])
            hit = sb.ray_cast(Vector((0.009, -1.0, neck_front_z + 0.016)), Vector((0, 1, 0)))
            if hit[0] is not None:
                no = hit[1] if hit[1].y < 0 else -hit[1]
                parts.append(make_button("bc", hit[0], no, 0.005, btn))
        if cfg.get("collar") == "buttondown" and LEAF_ROWS:
            r = LEAF_ROWS[-3]
            for tip in (r[2], r[-3]):
                loc, nor, _, _ = bvh.find_nearest(tip)
                parts.append(make_button("bd", tip + nor * 0.0028, nor, 0.0042, btn))
        nb = cfg.get("buttons", 7)
        step = cfg.get("button_step", 0.092)
        z = neck_front_z - cfg.get("first_button", 0.05)
        for i in range(nb):
            co, no = project_front(pk_bvh, 0, z, 0.0)
            if co is not None:
                parts.append(make_button("b%d" % i, co, no, cfg.get("button_r", 0.0058), btn))
            z -= step
    if cfg.get("pocket", True):
        parts += make_pocket(bvh, cfg, 0.112 * s, 0.53, flap=False)
    if cfg.get("pockets2", False):
        for k in (-1, 1):
            parts += make_pocket(bvh, cfg, 0.115 * s * k, 0.515, w=0.128, h=0.15, flap=True)
            co, no = project_front(bvh, 0.115 * s * k, 0.515 + 0.075 - 0.044, 0.006)
            if co is not None: parts.append(make_button("pb%d" % k, co, no, 0.0065, btn))
    if cfg.get("cuffs", True):
        for side in (-1, 1):
            r = make_cuff(ob, cfg, side, cfg.get("cuff_len", 0.068))
            if r:
                cf, ctr, ax, u, v, rmax = r
                parts.append(cf)
    for p in parts:
        if p.type == "MESH" and not p.data.materials and not p.name.startswith("b"):
            p.data.materials.append(fab)
        if p.type == "MESH" and not p.name.startswith("b"):
            tag_pattern(p, s)
    print("parts", time.time() - t0, flush=True)
    return ob, parts


STAGE = []


def clear_stage():
    for ob in list(STAGE):
        try:
            D.objects.remove(ob, do_unlink=True)
        except Exception:
            pass
    STAGE.clear()


def stage(cfg):
    """Backdrop, lights and camera for one view. Removes the previous stage first."""
    clear_stage()
    before = set(D.objects)
    view = cfg.get("view", "front")
    dark = cfg.get("dark", False)
    bgc = cfg.get("bg", (0.045, 0.04, 0.035) if dark else (0.50, 0.46, 0.41))
    setup_render(res=tuple(cfg.get("res", (900, 1125))), samples=cfg.get("samples", 64))
    world(color=(0.9, 0.88, 0.85), strength=cfg.get("world", 0.012 if dark else 0.05))
    backdrop(bgc)
    k = cfg.get("light", 1.0)
    if dark:
        area("key", (-2.4, -0.9, 1.5), (0, 0, 0.45), 0.9, 140 * k)
        area("fill", (2.6, -2.4, 0.6), (0, 0, 0.45), 3.0, 4 * k)
        area("rim", (1.6, 1.2, 1.6), (0, 0, 0.5), 0.6, 120 * k)
        area("rim2", (-1.4, 1.4, 1.2), (0, 0, 0.5), 0.5, 50 * k)
    else:
        area("key", (-2.6, -1.5, 1.6), (0, 0, 0.45), 1.3, 110 * k)
        area("fill", (2.6, -2.2, 0.8), (0, 0, 0.45), 3.0, 8 * k)
        area("rim", (1.2, 1.6, 1.8), (0, 0, 0.5), 0.8, 45 * k)
        area("top", (0, -0.4, 2.8), (0, 0, 0.5), 1.0, 10 * k)
    tz = cfg.get("tz", 0.40)
    dist = cfg.get("dist", 3.25)
    if view == "front":
        camera((0, -dist, tz + 0.02), (0, 0, tz), lens=cfg.get("lens", 80))
    elif view == "three":
        a = math.radians(cfg.get("angle", -34))
        camera((dist * math.sin(a), -dist * math.cos(a), tz + 0.12), (0, 0, tz), lens=cfg.get("lens", 80))
    elif view == "collar":
        camera((-0.35, -1.1, 0.95), (0.0, -0.05, 0.70), lens=cfg.get("lens", 85))
    elif view == "macro":
        camera((-0.12, -0.55, 0.86), (0.02, -0.08, 0.72), lens=cfg.get("lens", 100))
    elif view == "chest":
        camera((-0.25, -1.3, 0.70), (0.03, -0.1, 0.58), lens=cfg.get("lens", 85))
    elif view == "cuff":
        camera((0.2, -1.0, 0.25), (0.39, -0.05, 0.1), lens=cfg.get("lens", 85))
    if cfg.get("cam"):
        c = cfg["cam"]
        camera(tuple(c[0]), tuple(c[1]), lens=c[2])
    STAGE.extend(set(D.objects) - before)


def render_views(cfg):
    for v in cfg.get("views", [{}]):
        vc = dict(cfg); vc.update(v)
        stage(vc)
        C.scene.render.filepath = vc["out"]
        t = time.time()
        bpy.ops.render.render(write_still=True)
        print("RENDERED", vc["out"], round(time.time() - t), flush=True)


if __name__ == "__main__":
    cfg = json.loads(sys.argv[-1])
    reset()
    build_garment(cfg)
    if cfg.get("dry"):
        sys.exit(0)
    render_views(cfg)
    print("DONE", flush=True)
