"""Render all BREIT images sequentially. Usage: python3 batch.py [name ...]"""
import json, subprocess, sys, os, time
R = os.path.dirname(os.path.abspath(__file__))
F = os.path.join(R, "final")
PY = os.path.join(R, "..", "venv", "bin", "python")
RES = [1000, 1250]
S = 64

def views(name, extra_front=None, extra_three=None, tz=0.40):
    v = [dict(view="front", out=f"{F}/{name}-1.png", tz=tz, **(extra_front or {})),
         dict(view="three", out=f"{F}/{name}-2.png", tz=tz, **(extra_three or {}))]
    return v

JOBS = {
  "atlas-kreide": ("garment", dict(collar="buttondown", color=[0.80, 0.78, 0.72], heather=0.14,
                  views=views("atlas-kreide") + [dict(view="macro", out=f"{F}/atelier.png")])),
  "atlas-himmel": ("garment", dict(collar="buttondown", color=[0.33, 0.52, 0.80], heather=0.18, views=views("atlas-himmel"))),
  "forum-streifen": ("garment", dict(collar="spread", pocket=False, pattern="stripe", color=[0.86, 0.86, 0.84], color2=[0.06, 0.11, 0.30],
                  stripe_w=0.0062, views=views("forum-streifen") + [dict(view="collar", dark=True, out=f"{F}/look-2.png", res=[1600, 1100],
                  cam=[[-0.42, -0.95, 0.92], [0.0, -0.06, 0.70], 70])])),
  "nocturne-schwarz": ("garment", dict(collar="spread", pocket=False, color=[0.016, 0.016, 0.02], rough=0.42, sheen=0.25,
                  button_color=[0.025, 0.022, 0.02], views=views("nocturne-schwarz") + [dict(view="three", dark=True, angle=28, out=f"{F}/look-4.png")])),
  "riviera-salbei": ("garment", dict(collar="band", stand_back=0.03, stand_front=0.026, pocket=False, color=[0.30, 0.36, 0.24],
                  heather=0.35, slub_scale=60, weave=150, folds=1.6, views=views("riviera-salbei"))),
  "ridge-waldkaro": ("garment", dict(pattern="tartan", color=[0.20, 0.22, 0.15], color2=[0.13, 0.11, 0.08], color3=[0.06, 0.05, 0.04],
                  accent=[0.40, 0.30, 0.14], pocket=False, pockets2=True, thick=0.004, weave=150, heather=0.3, sheen=0.8,
                  button_color=[0.2, 0.15, 0.1], views=views("ridge-waldkaro") + [dict(view="three", dark=True, angle=-40, out=f"{F}/look-3.png")])),
  "terra-camel": ("garment", dict(color=[0.42, 0.25, 0.11], rough=0.9, sheen=0.9, weave=120, bump=0.3, heather=0.2, pocket=False,
                  pockets2=True, thick=0.0045, button_color=[0.12, 0.08, 0.05], views=views("terra-camel"))),
  "cove-marine": ("garment", dict(base="short55", sleeve=0.56, collar="polo", stand_back=0.02, stand_front=0.016, leaf_back=0.038,
                  leaf_front=0.062, placket_bottom=0.6, buttons=2, first_button=0.035, button_step=0.07, pocket=False, knit=True,
                  tail=0.012, cuff_len=0.026, color=[0.012, 0.018, 0.045], heather=0.22, sheen=0.3, thick=0.003, folds=0.6,
                  button_color=[0.03, 0.04, 0.08], views=views("cove-marine"))),
  "capo-marine": ("blazer", dict(shirt=dict(collar="spread", color=[0.33, 0.52, 0.80], heather=0.18),
                  blazer=dict(color=[0.018, 0.025, 0.06], knit=True, knit_scale=300, heather=0.25, sheen=0.35),
                  views=views("capo-marine", tz=0.36) + [
                      dict(view="three", dark=True, angle=-26, tz=0.38, out=f"{F}/hero.png", res=[1200, 1500], samples=96, dist=3.1),
                      dict(view="three", dark=True, angle=32, tz=0.42, out=f"{F}/look-1.png", dist=2.9)])),
}

def run(name):
    kind, cfg = JOBS[name]
    cfg = dict(cfg)
    cfg.setdefault("res", RES); cfg.setdefault("samples", S); cfg["out"] = f"{F}/{name}.png"
    script = "garment.py" if kind == "garment" else "blazer.py"
    t = time.time()
    with open(f"{F}/{name}.log", "w") as lg:
        r = subprocess.run([PY, script, json.dumps(cfg)], cwd=R, stdout=lg, stderr=subprocess.STDOUT)
    print(name, "exit", r.returncode, round(time.time() - t), "s", flush=True)

names = sys.argv[1:] or list(JOBS)
for n in names:
    run(n)
print("ALL DONE", flush=True)
