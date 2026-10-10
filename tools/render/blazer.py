"""Layered outfit: shirt + unstructured blazer."""
import math, sys, json, os
import bpy, bmesh
from mathutils import Vector
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import garment as G
from garment import C, D, make_bvh, grid_mesh, solidify, make_button, project_front, opening_w, smoothstep

BLAZER = {
    "base": "blazer", "offset": -0.016, "bottom": -0.16, "hem": -0.13, "tail": 0.0,
    "neck_front": 0.83, "neck_back": 0.84, "cuff_back": 0.03, "opening": True,
    "button_z": 0.37, "open_top": 0.086, "cutaway": 0.075,
    "collar": "none", "placket": False, "pocket": False, "cuffs": False,
    "folds": 0.7, "thick": 0.004,
}


def polyline(pts, t):
    L = [0.0]
    for a, b in zip(pts, pts[1:]):
        L.append(L[-1] + (Vector(b) - Vector(a)).length)
    d = t * L[-1]
    for i in range(len(pts) - 1):
        if d <= L[i + 1] or i == len(pts) - 2:
            u = 0 if L[i + 1] == L[i] else (d - L[i]) / (L[i + 1] - L[i])
            return Vector(pts[i]).lerp(Vector(pts[i + 1]), min(max(u, 0), 1))


def lapels(bvh, cfg):
    zb = cfg["button_z"]; zt = cfg["neck_front"]
    out = []
    for side in (-1, 1):
        inner = [(opening_w(zb + (zt - 0.02 - zb) * k / 20, cfg), zb + (zt - 0.02 - zb) * k / 20) for k in range(21)]
        outer = [(0.004, zb), (0.19, 0.64), (0.17, 0.668), (0.152, 0.661), (0.114, 0.79), (inner[-1][0] + 0.004, zt - 0.02)]
        rows = []
        NT, NU = 60, 10
        for j in range(NT + 1):
            t = j / NT
            a = polyline(inner, t); b = polyline(outer, t)
            row = []
            for i in range(NU + 1):
                u = i / NU
                p = a.lerp(b, u)
                x, z = p.x * side, p.y
                off = 0.0035 + 0.010 * (1 - u) ** 2 * smoothstep(0.0, 0.25, t)
                co, no = project_front(bvh, x, z, off)
                if co is None:
                    co = Vector((x, -0.16, z))
                row.append(co)
            rows.append(row if side > 0 else row[::-1])
        lp = grid_mesh("lapel%d" % side, rows)
        solidify(lp, 0.0025, 0.0)
        out.append(lp)
    return out


def jacket_collar(bvh, cfg, ring):
    c = dict(cfg)
    c.update({"collar": "jacket", "stand_back": 0.026, "stand_front": 0.018, "leaf_back": 0.042,
              "leaf_front": 0.034, "spread_back": 0.024, "spread_front": 0.026, "point_spread": 0.5,
              "collar_gap": 0.95, "ps0": 0.95, "ps1": 0.93})
    objs, rows = G.make_collar(bvh, c, ring)
    return objs


def flap(bvh, cx, cz, w=0.155, h=0.052, off=0.003, name="flap"):
    rows = []
    for j in range(8):
        t = j / 7
        z = cz - h * t
        row = []
        for i in range(17):
            u = i / 16
            x = cx - w / 2 + w * u
            co, no = project_front(bvh, x, z, off + 0.0015 * (1 - t))
            row.append(co if co is not None else Vector((x, -0.16, z)))
        rows.append(row)
    f = grid_mesh(name, rows)
    solidify(f, 0.0025, 0.0)
    return f


def build_blazer(cfg):
    bc = dict(BLAZER); bc.update(cfg)
    ob = G.base_shell(bc)
    G.add_folds(ob, bc)
    for p in ob.data.polygons: p.use_smooth = True
    solidify(ob, bc["thick"], -1.0, sub=1)
    bvh = make_bvh(ob)
    mat = G.fabric_material("jacket", bc)
    ob.data.materials.clear()
    ob.data.materials.append(mat)
    parts = [ob]
    ring = G.boundary_ring(ob, lambda c: c.z > bc["neck_front"] - 0.03 and abs(c.x) < 0.16)
    parts += jacket_collar(bvh, bc, ring)
    parts += lapels(bvh, bc)
    for k in (-1, 1):
        parts.append(flap(bvh, 0.128 * k, 0.14, w=0.135))
    # breast welt
    parts.append(flap(bvh, 0.165, 0.555, w=0.105, h=0.022, name="welt"))
    btn = G.button_material({"button_color": bc.get("button_color", (0.08, 0.06, 0.05))})
    for z in (bc["button_z"] - 0.005, bc["button_z"] - 0.105):
        co, no = project_front(bvh, 0.0, z, 0.003)
        if co is not None:
            parts.append(make_button("bj", co, no, 0.0095, btn))
    for p in parts:
        if p.type == "MESH" and not p.data.materials and not p.name.startswith("b"):
            p.data.materials.append(mat)
        if p.type == "MESH" and not p.name.startswith("b"):
            G.tag_pattern(p)
    return parts


if __name__ == "__main__":
    cfg = json.loads(sys.argv[-1])
    G.reset()
    shirt = dict(cfg.get("shirt", {}))
    shirt.setdefault("pocket", False)
    G.build_garment(shirt)
    build_blazer(cfg.get("blazer", {}))
    G.render_views(cfg)
    print("DONE", flush=True)
