# Redesign 2026 — Entscheidungen

Grundlage: `prompts/redesign.md`. Hier steht kurz, was entschieden wurde und warum.

## Referenz

- **Vorlage:** Outsource Consultants, Inc. (Awwwards Site of the Day und Developer Award, März 2026, Buzzworthy Studio).
- **Einschränkung:** Aus der Build-Umgebung waren weder awwwards.com noch outsourceconsultants.com erreichbar (Netzwerk-Proxy, HTTP 403). Eine Vermessung mit Playwright war deshalb nicht möglich. Übernommen wurden die öffentlich beschriebenen Merkmale:
  - Duoton aus `#1925AA` und `#E8E6E0`
  - architektonische Layouts, Anspielungen auf Blaupausen
  - Intro, in dem das Logo in die Navigation übergeht
  - vertikales Menü
  - WebGL-Interaktion
- **Nicht übernommen:** Texte, Bilder, Logo, Code oder Schriften der Referenz. Die Referenz wird auf der Seite nirgends erwähnt.

## Gestaltung

| Thema | Entscheidung | Warum |
|---|---|---|
| Farbe | Ultramarin `#1925AA` auf Porzellan `#E8E6E0`, Abstufung `#DFDCD4` für Wechselsektionen | Duoton der Referenz; Ultramarin war schon das „KI"-Signal |
| Gold | Die Krone ist wieder ganz golden (Verlauf `#EDC25C` → `#C9971F` → `#A87A12`). Dazu kommen der Satire-Balken, eine Akzentlinie an jeder Sektion, „Wörtlich.", Gold auf Blau (Manifest, Menü, Hover) und vergoldete Hover-Zustände | Nach Feedback: Das Gold hat KInxner ausgemacht. Auf Papier steht Gold nur als Fläche, Linie oder große Schrift (`#A07010`, 3,5:1). Kleine Schrift auf Papier bleibt blau |
| KI-Signatur | „KI" als invertiertes Kästchen im Wort | In einem Duoton trägt Farbe allein nicht mehr; das Kästchen funktioniert auf Papier und auf Blau |
| Schrift | Geist + Geist Mono (SIL OFL), selbst gehostet | Die Schriften der Referenz sind unbekannt. Gesucht war eine sachliche Grotesk mit Mono-Schwester für die Bemaßung. Selbst gehostet heißt: keine Verbindung zu Google |
| Raster | 12 Spalten, als Haarlinien sichtbar; Hero als Millimeterpapier | Die Seite als Bauplan einer Beratung |
| Hero | Typo-Hero, Kronen-Blaupause mit satirischer Bemaßung, WebGL-Lupe auf dem Raster | Blaupausen-Motiv der Referenz, auf Beratung umgedeutet |
| Menü | Vertikales Panel von rechts, nummeriert wie ein Inhaltsverzeichnis | Vertikales Menü der Referenz |
| Intro | Krone zeichnet sich, füllt sich und fliegt ins Header-Logo (~1,7 s) | Logo-Übergang der Referenz; Bühne für die Krone |
| Neue Sektion | „Und ja: Wir können auch PowerPoint." mit klickbarem Foliensatz | Der beste Satz der alten Seite stand klein im Footer |
| Neue Sektion | FAQ mit vier Fragen | Das Beratungsgerüst der Referenz hat eine FAQ. Die Antworten sind kurz, damit keine Füllsektion entsteht |

## Harte Vorgaben

- Satire-Hinweis steht als `<aside>` vor allem anderen und liegt über dem Intro (z-index 200 vs. 150).
- `google-site-verification`, `canonical`, `title`, `description`, `lang` und `CNAME` sind unverändert.
- Datenschutz: nur Abschnitt 3 geändert (Schriften jetzt lokal statt Google Fonts). Keine Cookies, kein Web Storage, keine Drittanbieter-Anfragen, per Playwright geprüft.
- Anker `#services`, `#approach`, `#cases`, `#manifest` und `#was-soll-das` bestehen weiter. Neu hinzugekommen sind `#powerpoint` und `#faq`.
- Cases kommen weiter aus `assets/data/projects.json`.

## Technik

- Kein Build-Schritt, keine Bibliotheken. WebGL ist rohes WebGL 1 (ein Fragment-Shader) und startet erst bei der ersten Mausbewegung über dem Hero. Auf Touch-Geräten, bei `prefers-reduced-motion` und ohne WebGL bleibt das CSS-Raster.
- Das Intro entfällt bei `prefers-reduced-motion`, bei Aufruf mit Anker oder bereits gescrollter Seite. Klick oder Taste überspringt es.
- Gelöscht wurden ungenutzte Assets: `hero_img.png`, `contact_us.png`, `dashboard-viz.png`, beide Videos und `logo.png`. Keine Seite hat sie eingebunden, und sie bleiben in der Git-Historie. Die Videos ließen sich in Headless-Chromium nicht abspielen (H.264) und wurden deshalb nicht gesichtet.

## Prüfung (Stand der Abgabe)

- Lighthouse mobil, Startseite: Performance 100, Accessibility 100, Best Practices 100, SEO 100. Übertragen werden 127 KiB, LCP 1,7 s, TBT 0 ms.
- Lighthouse mobil, Datenschutz: 100 / 100 / 100 / 100.
- axe-core (WCAG 2.2 AA + Best Practices), 1440 und 390 px: 0 Verstöße.
- Ohne JavaScript ist alles lesbar; nur die Cases fehlen, dafür erscheint ein Hinweis.
- Kein horizontales Scrollen bei 390 px.
