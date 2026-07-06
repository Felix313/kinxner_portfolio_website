# KInxner Consulting — Website

Statische One-Pager-Website für die (fiktive) Boutique-Beratung **KInxner Consulting**:
Künstliche Intelligenz & Data Engineering, mit einem Augenzwinkern.
Gehostet auf GitHub Pages unter [kinxner-consulting.de](https://kinxner-consulting.de/).

## Design-System

| Token | Wert | Rolle |
|---|---|---|
| Tinte | `#101623` | Hero & Manifest-Band |
| Porzellan | `#F3F4F7` | Grundfläche |
| Kronen-Gold | `#C9971F` / `#E8B84B` | Brand-Akzent (Krone) |
| Ultramarin | `#2E45E6` | das „KI"-Signal |

- **Signature-Element**: das „KI" in Wörtern wird ultramarin markiert (*K**I**nxner*, „Wir schreiben KI groß. Wörtlich.")
- **Typografie**: Archivo (Display, breit), Inter (Body), IBM Plex Mono (Eyebrows/Kennzahlen)
- **Hero**: interaktives Entscheidungsnetz-Canvas (Gold-Knoten, Ultramarin-Kanten), reagiert auf den Pointer
- `prefers-reduced-motion` wird respektiert (statisches Canvas, keine Reveals)

## Struktur

```
index.html                  Ein-Seiten-Layout (Hero, Leistungen, Vorgehen, Manifest, Cases, Kontakt)
assets/css/style.css        Design-Tokens + Styles
assets/js/main.js           Canvas, Reveals, Count-ups, Nav, Projekt-Loader
assets/data/projects.json   Cases (Felder: metric, title, description, tags)
```

## Lokal starten

`fetch()` der Projekte braucht HTTP (unter `file://` blockiert CORS die JSON):

```bash
python -m http.server 8000
# → http://localhost:8000
```

## Deploy

GitHub Pages, Branch `main`, Root. Custom Domain via `CNAME`.

## Inhalte pflegen

- Cases: `assets/data/projects.json`
- Farben/Typo: `:root`-Tokens in `assets/css/style.css`
- Alles andere: direkt in `index.html`
