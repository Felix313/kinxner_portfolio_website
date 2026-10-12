# BREIT — Konzept und Entscheidungen

## Auftrag

Die KInxner-Seite wird durch das Konzept eines Online-Shops ersetzt: **BREIT**, Hemden und moderne Mode für Bodybuilder und breit gebaute Männer.
Exklusiv und hochwertig im Auftritt, funktionsfähig bis zum Warenkorb, mit Bildern der Mode (Hemden und Casual Business).
Gestalterisch soll die Seite sich wieder an der Award-Website orientieren, die schon für die Vorgängerseite Vorlage war.

## Referenz

Vorlage bleibt Outsource Consultants, Inc. (Awwwards Site of the Day, März 2026). Wie beim letzten Redesign waren awwwards.com und die Referenz aus der Build-Umgebung nicht erreichbar (Proxy, HTTP 403).
Übernommen wurden deshalb die dokumentierten Merkmale, übersetzt in Mode:

| Merkmal der Referenz | Umsetzung bei BREIT |
|---|---|
| Strenges Duoton | Tinte `#16130F` und Knochen `#EEE9E1`; Messing nur für Maßlinien |
| Blaupausen und architektonische Layouts | Schnittmuster mit Bemaßung (Vorderteil Konfektion gegen BREIT), Maßlinien über dem Hero-Bild, sichtbares 12-Spalten-Raster im Hero, Passform-Silhouette auf Millimeterraster |
| Logo geht im Intro in die Navigation über | „BREIT" wird im Intro breit (Schriftbreite 62 → 125 %), darunter wächst die Maßlinie „Schulter 58 cm"; dann fliegt die Wortmarke in den Header (≤ 1,4 s, überspringbar, entfällt bei reduzierter Bewegung) |
| Vertikales Menü | Panel von links, nummeriert wie ein Inhaltsverzeichnis |
| WebGL-Bildeffekte | Ersetzt durch günstigere Effekte: Bildmasken beim Einblenden, Bildwechsel auf Produktkarten, Zoom auf der Produktseite. Das spart Gewicht für das, was ein Shop braucht: Bilder |

## Marke

- **Name als Typografie:** „BREIT" ist in Archivo bei 125 % Breite gesetzt. Die Wortmarke ist buchstäblich breit. Die Maßlinie darunter ist das Bildzeichen; im Favicon steht sie unter einem breiten B.
- **Ton:** sachlich und konkret, mit Zahlen statt Pointen. Die erste Fassung hatte in jedem Abschnitt dieselbe Formel (Slogan-Überschrift mit kursivem Akzentwort, nummerierte Abschnitte, Antithesen wie „nicht X, sondern Y", ein Witz am Ende jedes Produkttexts). Das wirkte generiert und ist rausgeflogen. Kursiv bleibt nur im Hero („breite") und im „&" von „Dominik & Felix".
- **Kernbegriff Drop:** Differenz zwischen Brust- und Taillenweite. Konfektion ≈ 8 cm, BREIT 16/22/28 cm (Athletic/Power/Titan). Er zieht sich durch Passform-Konfigurator, Größenberater, Produktseite und Maßtabelle.

## Bilder

**Jetzt: Fotos von Pexels.** Die ersten Entwürfe zeigten 3D-Renderings (siehe unten), weil Bildagenturen aus der Build-Umgebung nicht erreichbar waren. Seit die Freigabe da ist, zeigen Produktseiten, Hero, Lookbook und Atelier echte Fotos breit gebauter, muskulöser Männer in Hemd, Overshirt, Strick und Sakko.

- **Quelle:** Pexels (lizenzfrei, Bearbeitung erlaubt, Namensnennung freiwillig). Unsplash war nur über den Bild-CDN erreichbar; Suche und Seiten liegen hinter einer Bot-Sperre für Headless-Browser, die wir nicht umgehen. Pexels-Suche und Bild-CDN funktionierten.
- **Auswahl:** zuerst Statur (breites Kreuz, schwere Arme, schmale Taille), dann Farbe und Schnitt des Produkts. Wo möglich stammen beide Bilder eines Produkts aus derselben Serie. Ein Model aus einer Serie von Jaime Blanchart trägt Atlas Kreide, Atlas Himmel, Forum und Cove, ein Model von Abhishek Shekhawat Capo und das Hero-Bild.
- **Ehrlichkeit:** Die Kleidung auf den Fotos ist nicht von BREIT. Der Footer jeder Seite sagt das und nennt die Fotografen; die Tabelle mit allen Pexels-IDs steht in `tools/photos/README.md`.
- **Kompromisse:** Riviera zeigt ein Leinenhemd mit Kentkragen statt Stehkragen, Cove einen Strick mit Zip-Kragen statt eines Strick-Polos, das Terra-Model ist schlanker gebaut als die übrigen. Bessere Treffer gab es in der Suche nicht.
- **Einheitlicher Look:** Die Fotos stammen von neun Fotografen mit sehr unterschiedlicher Bearbeitung. `build.py` gleicht sie an: etwas weniger Sättigung und Kontrast, angehobene Schatten, leicht warm, feines Korn. Das nimmt vor allem den stark geglätteten Studiofotos den künstlichen Glanz.
- **Zuschnitt:** `tools/photos/build.py` (4:5 bzw. 16:11 für `look-2`, WebP, Produktbilder zusätzlich 600 px für `srcset`). Das zweite Produktbild ist teils ein Detail (Atlas Kreide: Knopfleiste).
- **Bemaßung im Hero:** Die Maßlinien liegen auf den Schulterpunkten des Sakkos und auf der Sakkokante in Knopfhöhe (`pages.js`, Konstante `d`). Die Schulterlinie sitzt unter den Schultern statt darüber, damit das Etikett nicht über dem Gesicht steht.
- **OG-Bild:** Wortmarke links unverändert, rechts ein Ausschnitt aus dem Hero-Foto.

**Vorher: Renderings.** Die erste Fassung war in Blender gerendert (`tools/render/`, nicht mehr im Einsatz): ein Oberkörper mit V-Form als „unsichtbare Büste", darauf Hemd und Sakko als Schalen mit Kragen, Knopfleiste, Taschen und Stoff-Shadern. Die Renderings stehen in der Git-Historie (bis Commit `f37851a`).

## Shop-Logik

- Statisch, ohne Build-Schritt, ES-Module. Daten in `assets/js/data.js`.
- Warenkorb in `localStorage` (`breit.cart.v1`), mit Fallback im Arbeitsspeicher, wenn der Speicher gesperrt ist. Tab-übergreifend synchron.
- Zeilen-Schlüssel `id|passform|größe`; Menge 1–9; Versand frei ab 150 €, sonst 7,90 €.
- „Zur Kasse" öffnet einen Dialog: Hier endet die Konzeptstudie. Es werden keine Adress- oder Zahlungsdaten abgefragt.

## Was bleibt

- `CNAME`, `canonical` auf kinxner-consulting.de, das `google-site-verification`-Tag samt Kommentar im `<head>` von `index.html`.
- Keine Drittanbieter, keine CDNs, keine Cookies. Neu ist nur `localStorage` für den Warenkorb und `sessionStorage` für das Intro; die Datenschutzerklärung nennt beides.

## Barrierefreiheit

Skip-Link, sichtbarer Fokus, Menü und Drawer mit Fokusfalle und Escape, Tabs mit Pfeiltasten, Formulare mit Labels, Live-Regionen für Warenkorb und Größenberater, `prefers-reduced-motion` überall.
