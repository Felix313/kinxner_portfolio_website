# BREIT — Konzeptstudie eines Online-Shops

Hemden und Business-Casual für Bodybuilder und breit gebaute Männer. Weit im Kreuz, weit am Oberarm, schmal an der Taille.
BREIT ist ein Designentwurf: Marke, Produkte, Preise und Texte sind erfunden, es gibt keine Kasse und keine Zahlung.
Der Shop funktioniert bis zum Warenkorb. Die Bilder sind lizenzfreie Fotos von Pexels (Nachweise im Footer und in `tools/photos/README.md`); die Kleidung darauf ist nicht von BREIT.

Gehostet auf GitHub Pages unter [kinxner-consulting.de](https://kinxner-consulting.de/).

> **Zurück zur KInxner-Consulting-Seite:** Die Satire-Seite steht vollständig in der Git-Historie (letzter Stand: Commit `fc2ded8`).
> Zurückholen mit `git revert <BREIT-Commits>` oder `git checkout fc2ded8 -- .` auf einem eigenen Branch, dann nach `main` mergen.

## Seiten

| Datei | Inhalt |
|---|---|
| `index.html` | Start: Intro, Hero mit Bemaßung, Schnittmuster-Vergleich, Kollektion, Passform-Konfigurator, Lookbook, Größenberater, Atelier, Service |
| `kollektion.html` | Alle Produkte, Filter nach Kategorie, Sortierung |
| `produkt.html?id=…` | Galerie mit Zoom, Farbe, Passform (Athletic/Power/Titan), Größe, Maßtabelle, „Dazu passt" |
| `warenkorb.html` | Mengen ändern, entfernen, Versand-Schwelle, Summe; „Zur Kasse" endet mit dem Konzept-Hinweis |
| `datenschutz.html` | Datenschutzerklärung (inkl. localStorage für den Warenkorb) |

## Design-System

Tinte auf Knochen, Messing als Maßband. Die Formensprache leitet sich aus der Awwwards-Referenz der Vorgängerseite ab (Duoton, architektonisches Raster, Blaupause, Logo-Intro, vertikales Menü); Details in `docs/breit/decisions.md`.

| Token | Wert | Rolle |
|---|---|---|
| `--ink` | `#16130F` | Text, dunkle Sektionen, Buttons |
| `--bone` | `#EEE9E1` | Grundfläche |
| `--bone-2` | `#E5DFD4` | Wechselsektion (Passform) |
| `--paper` | `#F6F3EE` | Drawer, Karten, Dialog |
| `--stone` | `#B1ACA4` | Platzhalter hinter Produktfotos, bis sie geladen sind |
| `--brass` / `--brass-lite` | `#94703C` / `#C9A467` | Maßlinien, Akzente (auf Knochen / auf Tinte) |

- **Schrift:** Archivo (variabel, Breite 62–125 %): breit gesetzt für Display, normal für Text. Instrument Serif kursiv als Akzent. Geist Mono für Maße und Labels. Alles selbst gehostet (SIL OFL, `assets/fonts/`).
- **Wortmarke:** „BREIT" in Archivo 125 % mit Maßlinie darunter. Im Intro wächst sie von 62 auf 125 % Breite und wandert in den Header.
- **Bewegung:** Reveals, Bildmasken, horizontales Lookbook beim Scrollen (Desktop), Schnittmuster zeichnet sich. Alles respektiert `prefers-reduced-motion`.

## Struktur

```
index.html, kollektion.html, produkt.html, warenkorb.html, datenschutz.html
assets/css/breit.css        Tokens und Styles
assets/js/data.js           Produkte, Passformen, Größentabelle, Größenempfehlung
assets/js/cart.js           Warenkorb (localStorage, mit Fallback im Arbeitsspeicher)
assets/js/app.js            Menü, Drawer, Toast, Reveals, Intro
assets/js/pages.js          Seitenlogik: Start, Kollektion, Produkt, Warenkorb
assets/img/shop/            Fotos (WebP), zugeschnitten mit tools/photos/build.py
tools/photos/               Zuschnitt-Skript und Bildnachweise
tools/render/               Frühere Blender-Pipeline (Renderings, nicht mehr im Einsatz)
docs/breit/decisions.md     Konzept und Entscheidungen
```

## Lokal starten

ES-Module brauchen HTTP:

```bash
python -m http.server 8000
# → http://localhost:8000
```

## Inhalte pflegen

- Produkte: `assets/js/data.js` (`img` verweist auf `assets/img/shop/<name>.webp`)
- Neue Bilder: `tools/photos/README.md` (Quelle, Ausschnitt, Nachweis im Footer aller fünf Seiten ergänzen)
- Farben/Typo: `:root`-Tokens in `assets/css/breit.css`

## Deploy

GitHub Pages, Branch `main`, Root. Custom Domain via `CNAME`. Alles, was auf `main` landet, ist sofort live.
Das `google-site-verification`-Tag im `<head>` von `index.html` muss bleiben (OAuth-App).
