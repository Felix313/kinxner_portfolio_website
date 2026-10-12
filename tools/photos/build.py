"""Produkt-, Hero-, Lookbook- und Atelierbilder aus Pexels-Fotos zuschneiden.

Lädt die Originale (2400 px breit) nach ./cache/ und schreibt WebP nach assets/img/shop/.
Benutzung (aus dem Repo-Wurzelverzeichnis):

    python3 tools/photos/build.py            # alle Bilder
    python3 tools/photos/build.py hero look-2
"""
import os
import sys
import urllib.request

import numpy as np
from PIL import Image, ImageEnhance

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, 'cache')
OUT = os.path.join(HERE, '..', '..', 'assets', 'img', 'shop')

# Pexels-ID -> Fotograf (Profil auf pexels.com/@…)
PHOTOS = {
    '20337705': 'Jaime Blanchart (@blanxybuilding)',
    '20337686': 'Jaime Blanchart (@blanxybuilding)',
    '20337690': 'Jaime Blanchart (@blanxybuilding)',
    '20559708': 'Jaime Blanchart (@blanxybuilding)',
    '20559705': 'Jaime Blanchart (@blanxybuilding)',
    '20559706': 'Jaime Blanchart (@blanxybuilding)',
    '20559702': 'Jaime Blanchart (@blanxybuilding)',
    '20559701': 'Jaime Blanchart (@blanxybuilding)',
    '5924440': 'shalender kumar (@shalenderkumar)',
    '5924478': 'shalender kumar (@shalenderkumar)',
    '5156489': 'emre keshavarz (@emrekeshavarz)',
    '5145182': 'emre keshavarz (@emrekeshavarz)',
    '17012444': 'Amit Bokde (@amit)',
    '17012535': 'Amit Bokde (@amit)',
    '17012459': 'Amit Bokde (@amit)',
    '15939317': 'Lokman Sevim (@lokmansevim)',
    '15939316': 'Lokman Sevim (@lokmansevim)',
    '14378602': 'Abhishek Shekhawat (@absoluteabhi)',
    '20400526': 'Abhishek Shekhawat (@absoluteabhi)',
    '20440142': 'Abhishek Shekhawat (@absoluteabhi)',
    '36807010': 'Wolf Art (@wolfart)',
    '21702288': 'Gursher Gill (@gursher-gill-63702010)',
    '3214788': 'Ralph Rabago (@ralph-rabago)',
}

P = 1.25  # 4:5
# Name -> (Pexels-ID, x0, y0, Breite, Höhe/Breite, Ausgabegröße); Koordinaten im 2400 px breiten Original
CROPS = {
    'atlas-kreide-1': ('20337705', 0, 250, 2400, P, (1000, 1250)),
    'atlas-kreide-2': ('20337705', 450, 1680, 1500, P, (1000, 1250)),
    'atlas-himmel-1': ('20337686', 0, 250, 2400, P, (1000, 1250)),
    'atlas-himmel-2': ('20337690', 500, 250, 1400, P, (1000, 1250)),
    'forum-streifen-1': ('20559708', 0, 450, 2400, P, (1000, 1250)),
    'forum-streifen-2': ('20559705', 200, 300, 2000, P, (1000, 1250)),
    'nocturne-schwarz-1': ('5924440', 0, 450, 2400, P, (1000, 1250)),
    'nocturne-schwarz-2': ('5924478', 0, 450, 2400, P, (1000, 1250)),
    'riviera-salbei-1': ('5156489', 0, 300, 2400, P, (1000, 1250)),
    'riviera-salbei-2': ('5145182', 200, 250, 2000, P, (1000, 1250)),
    'ridge-waldkaro-1': ('17012444', 0, 300, 2400, P, (1000, 1250)),
    'ridge-waldkaro-2': ('17012535', 980, 0, 1280, P, (1000, 1250)),
    'terra-camel-1': ('15939317', 200, 300, 2000, P, (1000, 1250)),
    'terra-camel-2': ('15939316', 200, 300, 2000, P, (1000, 1250)),
    'cove-marine-1': ('20559702', 0, 450, 2400, P, (1000, 1250)),
    'cove-marine-2': ('20559701', 0, 450, 2400, P, (1000, 1250)),
    'capo-marine-1': ('14378602', 0, 300, 2400, P, (1000, 1250)),
    'capo-marine-2': ('20400526', 0, 450, 2400, P, (1000, 1250)),
    'hero': ('20440142', 0, 500, 2400, P, (1200, 1500)),
    'look-1': ('36807010', 0, 300, 2400, P, (1000, 1250)),
    'look-2': ('20559706', 0, 1520, 2400, 11 / 16, (1600, 1100)),
    'look-3': ('17012459', 0, 300, 2400, P, (1000, 1250)),
    'look-4': ('21702288', 0, 300, 2400, P, (1000, 1250)),
    'atelier': ('3214788', 240, 0, 1920, P, (1000, 1250)),
}


def grade(im, seed):
    """Gemeinsamer Look für Fotos aus verschiedenen Quellen: etwas weniger Sättigung und Kontrast,
    angehobene Schatten, leicht warm (passend zum Knochenton der Seite), feines Korn."""
    im = ImageEnhance.Color(im).enhance(0.86)
    im = ImageEnhance.Contrast(im).enhance(0.94)
    a = np.asarray(im).astype(np.float32) / 255
    a = 0.045 + a * 0.91
    a[..., 0] *= 1.025
    a[..., 2] *= 0.965
    a += np.random.default_rng(seed).normal(0, 0.009, a.shape[:2])[..., None]
    return Image.fromarray((np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8))


def source(pid):
    path = os.path.join(CACHE, f'{pid}.jpg')
    if not os.path.exists(path):
        os.makedirs(CACHE, exist_ok=True)
        url = f'https://images.pexels.com/photos/{pid}/pexels-photo-{pid}.jpeg?auto=compress&cs=tinysrgb&w=2400'
        req = urllib.request.Request(url, headers={'User-Agent': 'BREIT-build/1.0 (tools/photos)'})
        with urllib.request.urlopen(req, timeout=120) as r, open(path, 'wb') as f:
            f.write(r.read())
    return Image.open(path).convert('RGB')


def build(name):
    pid, x0, y0, w, ratio, size = CROPS[name]
    im = source(pid)
    h = round(w * ratio)
    assert x0 + w <= im.width and y0 + h <= im.height, f'{name}: Ausschnitt größer als das Foto'
    out = im.crop((x0, y0, x0 + w, y0 + h)).resize(size, Image.LANCZOS)
    seed = sum(map(ord, name))
    small = grade(out.resize((600, 750), Image.LANCZOS), seed)
    out = grade(out, seed)
    out.save(os.path.join(OUT, f'{name}.webp'), 'WEBP', quality=78, method=6)
    # Produktbilder bekommen eine 600er-Variante für srcset
    if name not in ('hero', 'atelier') and not name.startswith('look-'):
        small.save(os.path.join(OUT, f'{name}-sm.webp'), 'WEBP', quality=75, method=6)
    print(f'{name:20} ← Pexels {pid}, {PHOTOS[pid]}')


if __name__ == '__main__':
    for n in sys.argv[1:] or CROPS:
        build(n)
