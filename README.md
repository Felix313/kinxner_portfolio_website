# KInxner Consulting — Website

Satirischer One-Pager einer KI-Beratung, die es nicht gibt: **KInxner Consulting**.
Kein Unternehmen, keine Leistungen, alle Cases und Kennzahlen erfunden.
Gehostet auf GitHub Pages unter [kinxner-consulting.de](https://kinxner-consulting.de/).

## Design-System

Die Seite ist als Blaupause einer Beratung gestaltet: Ultramarin auf Papier, Gold für die Krone und ihre Akzente, sichtbares Raster, bemaßte Krone.
Hintergründe und Entscheidungen stehen in `docs/redesign/`.

| Token | Wert | Rolle |
|---|---|---|
| `--blue` Ultramarin | `#1925AA` | Text, Linien, Flächen — die eine Farbe |
| `--paper` Porzellan | `#E8E6E0` | Grundfläche |
| `--paper-2` | `#DFDCD4` | Wechselsektionen (PowerPoint, Was soll das?) |
| `--gold` Kronen-Gold | `#C9971F` | Krone, Satire-Balken, Akzentlinien, vergoldete Hover-Zustände |
| `--gold-bright` | `#E8B84B` | Gold auf blauen Flächen (Manifest, Menü) |
| `--gold-deep` | `#A07010` | Gold für große Schrift auf Papier („Wörtlich.") |

- **KI-Signatur:** „KI" steht im Wort als invertiertes Kästchen (`<span class="ki">KI</span>`)
- **Typografie:** Geist (Display und Text) und Geist Mono (Beschriftung, Bemaßung), beide selbst gehostet (SIL OFL, `assets/fonts/`)
- **Raster:** 12 Spalten, als Haarlinien sichtbar
- **Krone:** `assets/img/crown.svg`; Konstruktion in `docs/redesign/crown.md`
- **Bewegung:** Die Krone zeichnet sich im Intro und fliegt ins Logo. Der Hero ist eine WebGL-Lupe auf Millimeterpapier. Alles respektiert `prefers-reduced-motion`.

## Struktur

```
index.html                  One-Pager: Hero, Leistungen, PowerPoint, Vorgehen, Manifest, Cases, FAQ, Was soll das?
datenschutz.html            Datenschutzerklärung
favicon.svg                 Favicon (PNG-Fallbacks in assets/img/)
assets/css/style.css        Tokens + Styles
assets/js/main.js           Intro, Menü, Reveals, Kennzahlen, Foliensatz, Cases-Loader, WebGL-Raster
assets/data/projects.json   Cases (Felder: metric, title, description, tags)
assets/fonts/               Geist, Geist Mono, Lizenz
assets/img/                 Krone, Favicons, OG-Bild
```

## Lokal starten

`fetch()` der Cases braucht HTTP (unter `file://` blockiert der Browser das JSON):

```bash
python -m http.server 8000
# → http://localhost:8000
```

## Deploy

GitHub Pages, Branch `main`, Root. Custom Domain via `CNAME`. Alles, was auf `main` landet, ist sofort live.

## Inhalte pflegen

- Cases: `assets/data/projects.json` („KI" in Titeln wird automatisch markiert)
- Farben/Typo: `:root`-Tokens in `assets/css/style.css`
- Alles andere: direkt in `index.html`
- Datenschutz: Die Seite setzt keine Cookies, nutzt keinen Web Storage und lädt nichts von Dritten. Das muss so bleiben, sonst stimmt `datenschutz.html` nicht mehr.
