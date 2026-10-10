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
- **Ton:** sachlich, selbstbewusst, mit einem trockenen Satz pro Abschnitt („Ein Sakko ohne Polster. Die Schultern bringen Sie mit.").
- **Kernbegriff Drop:** Differenz zwischen Brust- und Taillenweite. Konfektion ≈ 8 cm, BREIT 16/22/28 cm (Athletic/Power/Titan). Er zieht sich durch Passform-Konfigurator, Größenberater, Produktseite und Maßtabelle.

## Bilder

Fotos aus Bildagenturen waren aus der Umgebung nicht erreichbar (Unsplash, Pexels: Proxy 403). Fotos echter Menschen hätten außerdem Models vorgetäuscht.
Die Mode ist deshalb in Blender gerendert (`tools/render/`):

- Oberkörper als Signed-Distance-Feld mit V-Form (Schulter, Deltamuskel, Latissimus, schmale Taille), per Marching Cubes und Voxel-Remesh vernetzt. Das ist die „unsichtbare Büste" der Ghost-Mannequin-Fotografie.
- Hemd als Schale darauf: Hals-, Saum- (Hemdschwanz) und Ärmelschnitte, prozedurale Falten, Kragen (Kent, Haifisch, Button-down, Stehkragen, Polo) als parametrische Flächen, Knopfleiste, Knöpfe mit vier Löchern, Taschen, Manschetten.
- Stoffe als Shader: Oxford- und Popeline-Bindung als Bump, Bengal-Streifen, Flanell-Karo, Strick, Leinen-Slub, Moleskin.
- Sakko als zweite, größere Schale mit Frontöffnung, Revers, Kragen, Pattentaschen und Brustleiste über dem Hemd.
- Produktbilder auf Steingrund (Front und Dreiviertel), Lookbook und Hero auf dunklem Grund mit Streiflicht.

Auf der Seite steht offen, dass es Renderings sind (Footer, Datenschutz).

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
