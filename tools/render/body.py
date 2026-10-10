"""SDF-based broad athletic torso (the shirt shell), meshed with marching cubes."""
import numpy as np
from skimage import measure

H = 0.004  # grid step (m)


def smin(a, b, k):
    h = np.clip(0.5 + 0.5 * (b - a) / k, 0.0, 1.0)
    return b * (1 - h) + a * h - k * h * (1 - h)


def round_cone(P, a, b, r1, r2):
    """SDF of a capsule with linearly varying radius from a (r1) to b (r2)."""
    a = np.asarray(a, float); b = np.asarray(b, float)
    ba = b - a
    L2 = ba @ ba
    pa = P - a
    t = np.clip((pa @ ba) / L2, 0, 1)
    proj = a + t[..., None] * ba
    r = r1 + (r2 - r1) * t
    return np.linalg.norm(P - proj, axis=-1) - r


def ellipsoid(P, c, r):
    q = (P - np.asarray(c)) / np.asarray(r)
    k0 = np.linalg.norm(q, axis=-1)
    return (k0 - 1.0) * min(r)


def loft(P, prof):
    """Stack of superelliptic sections. prof: rows of (z, a, b, yc)."""
    prof = np.asarray(prof, float)
    z = P[..., 2]
    zc = np.clip(z, prof[0, 0], prof[-1, 0])
    a = np.interp(zc, prof[:, 0], prof[:, 1])
    b = np.interp(zc, prof[:, 0], prof[:, 2])
    yc = np.interp(zc, prof[:, 0], prof[:, 3])
    n = 2.6
    q = (np.abs(P[..., 0] / a) ** n + np.abs((P[..., 1] - yc) / b) ** n) ** (1 / n)
    d = (q - 1.0) * np.minimum(a, b)
    # cap top/bottom
    dz = np.maximum(prof[0, 0] - z, z - prof[-1, 0])
    return np.maximum(d, dz)


def body_sdf(P, cfg):
    s = cfg.get("scale", 1.0)  # global breadth
    w = cfg.get("waist", 1.0)
    bot = cfg.get("bottom", -0.06)
    prof = [
        (bot, (0.205 + 0.1 * max(0, -0.06 - bot)) * w, 0.138 + 0.06 * max(0, -0.06 - bot), 0.0),
        (0.10, 0.198 * w, 0.134, 0.0),
        (0.24, 0.205 * w, 0.137, -0.002),
        (0.36, 0.228 * s, 0.146, -0.006),
        (0.46, 0.250 * s, 0.155, -0.010),
        (0.55, 0.262 * s, 0.160, -0.012),
        (0.62, 0.258 * s, 0.152, -0.008),
        (0.67, 0.236 * s, 0.134, -0.002),
        (0.72, 0.185 * s, 0.112, 0.004),
        (0.77, 0.110, 0.085, 0.010),
    ]
    d = loft(P, prof)
    # trapezius / shoulder slope from neck base to shoulder point (both sides)
    sx = 0.272 * s
    for side in (-1, 1):
        d = smin(d, round_cone(P, (0.05 * side, 0.012, 0.78), (sx * side, 0.0, 0.705), 0.058, 0.08), 0.05)
        # deltoid
        d = smin(d, ellipsoid(P, (sx * side, -0.004, 0.665), (0.088, 0.088, 0.092)), 0.04)
        # sleeves: upper arm + forearm (arms angled out ~11 deg, slight forward bend)
        sh = np.array((0.285 * s * side, 0.0, 0.64))
        el = np.array((0.345 * s * side, -0.012, 0.34))
        wr = np.array((0.395 * s * side, -0.040, 0.05))
        d = smin(d, round_cone(P, sh, el, 0.080, 0.062), 0.05)
        d = smin(d, round_cone(P, el, wr, 0.060, 0.046), 0.02)
    # neck column
    d = smin(d, round_cone(P, (0, 0.010, 0.74), (0, 0.018, 0.95), 0.072, 0.068), 0.04)
    return d


def build(cfg, offset=0.0, h=H):
    xs = np.arange(-0.52, 0.52, h)
    ys = np.arange(-0.26, 0.26, h)
    zs = np.arange(min(-0.10, cfg.get("bottom", -0.06) - 0.06), 1.08, h)
    X, Y, Z = np.meshgrid(xs, ys, zs, indexing="ij")
    P = np.stack([X, Y, Z], axis=-1)
    D = body_sdf(P, cfg) + offset
    del P, X, Y, Z
    verts, faces, _, _ = measure.marching_cubes(D, 0.0, spacing=(h, h, h))
    verts += np.array([xs[0], ys[0], zs[0]])
    return verts, faces
