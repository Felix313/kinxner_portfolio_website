# Render-Pipeline für die BREIT-Produktbilder

Die Bilder in `assets/img/shop/` sind keine Fotos, sondern Renderings aus Blender (Cycles), erzeugt mit diesen Skripten.

| Datei | Aufgabe |
|---|---|
| `body.py` | Breiter Oberkörper als Signed-Distance-Feld (V-Form, Deltamuskel, Arme), vernetzt mit Marching Cubes |
| `scene.py` | Hilfsfunktionen: Szene, Hohlkehle, Flächenlichter, Kamera, Hemdschwanz-Schnitt |
| `garment.py` | Hemd: Schnitte, Falten, Kragen, Knopfleiste, Knöpfe, Taschen, Manschetten, Stoff-Shader, Ansichten |
| `blazer.py` | Sakko als zweite Schale über dem Hemd: Frontöffnung, Revers, Kragen, Taschen |
| `batch.py` | Alle Produkt-, Lookbook- und Hero-Bilder in einem Lauf |

## Benutzung

```bash
python3 -m venv venv
./venv/bin/pip install bpy==5.1.2 scikit-image numpy pillow
python3 batch.py                 # alle Bilder nach ./final/
python3 batch.py atlas-kreide    # nur ein Produkt
```

Ein Lauf über alle Produkte dauert auf vier CPU-Kernen etwa eine Stunde. Die Grundformen landen beim ersten Lauf in `cache_*.npz`.
Danach die PNGs als WebP nach `assets/img/shop/` exportieren (1000 × 1250, Qualität ≈ 82).
