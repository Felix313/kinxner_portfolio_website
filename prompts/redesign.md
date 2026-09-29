# Prompt: KInxner Consulting – Redesign von Grund auf

Zum Einfügen in eine neue Claude-Code-Session mit Zugriff auf `felix313/kinxner_portfolio_website`.
Die Session braucht Netzwerkzugriff auf `awwwards.com` und `outsourceconsultants.com`.

---

Du bist Senior Web Designer und Creative Developer auf Awwwards-Niveau. Deine Aufgabe: die Website in diesem Repository (live unter https://kinxner-consulting.de) von Grund auf neu gestalten und bauen. Nicht auffrischen, neu denken.

Du arbeitest unbeaufsichtigt. Halte nicht an, um Rückfragen zu stellen. Triff Entscheidungen, begründe sie in ein, zwei Sätzen in `docs/redesign/decisions.md` und mach weiter.

## 1. Worum es geht

KInxner Consulting ist Satire: die Website einer KI-Beratung, die es nicht gibt. Kein Unternehmen, keine Leistungen, keine Kunden, alle Cases und Zahlen erfunden. Der Witz steckt im Namen – „KI" in K**I**nxner – und in Beratungssprache, die ohne Beratung dahinter läuft. Geschrieben hat die Seite größtenteils eine KI: eine KI-Beratungsseite, verfasst von einer KI, die nichts berät.

Der Ton ist deadpan. Die Seite soll aussehen wie die teuerste Beratung der Stadt, und genau das macht sie komisch. Die Premium-Ästhetik transportiert die Pointe. Also kein Meme-Look, keine Comic-Elemente, kein Augenzwinkern im Design selbst: Der Humor steckt im Text und in wenigen, präzise gesetzten Details. Gleichzeitig darf niemand die Seite für eine echte Firma halten. Dafür sorgen der Satire-Hinweis und „Was soll das?" (siehe Abschnitt 4).

## 2. Die Referenz: Outsource Consultants, Inc.

Designvorlage ist ein Awwwards-Gewinner:

- **Outsource Consultants, Inc.**: Site of the Day und Developer Award (März 2026), gestaltet von Buzzworthy Studio
- Awwwards: https://www.awwwards.com/sites/outsource-consultants-inc
- Live: https://www.outsourceconsultants.com/

Warum diese Seite:

- **Echte Beratung, echtes Beratungsgerüst.** Leistungen, Projekte, Über uns, FAQ, Insights. Die Struktur passt eins zu eins auf eine Beratung, die es nicht gibt.
- **Strenges Duoton aus Ultramarin (`#1925AA`) und warmem Papierton (`#E8E6E0`).** KInxner markiert „KI" schon heute in Ultramarin. Die Referenz liefert also genau die Farbwelt, die die Marke bereits hat.
- **Architektonische Layouts mit Anspielungen auf Blaupausen.** Beratungen verkaufen „Frameworks" und „Zielarchitekturen". Bei uns wird die Blaupause zum Bauplan für Folien, Organigramme und die Krone.
- **Ein Intro, in dem das Logo in die Navigation übergeht**, dazu ein vertikales Menü und WebGL-Bildeffekte. Das Intro ist die Bühne für die Krone.
- **Branchenfremd** (Bauordnung und Genehmigungen in New York). Wir übernehmen eine Formensprache, nicht die Identität eines Wettbewerbers. Die Satire zielt auf das Genre Beratung, nicht auf eine echte KI-Firma.

Ausweichregel: Ist die Seite nicht erreichbar oder hat sie sich grundlegend geändert, wähle auf Awwwards die nächstbeste Seite einer echten Beratung (Kategorie Business & Corporate, Site of the Day oder Developer Award, möglichst 2025/26) und begründe den Wechsel in `decisions.md`. Erste Ausweichoption ist Subduxion – AI Consulting (https://www.awwwards.com/sites/subduxion-ai-consulting). Subduxion ist selbst eine KI-Beratung, deshalb gilt Abschnitt 3 dann doppelt streng.

## 3. Was „nach Vorlage" heißt, und was nicht

Übernimm die **Formensprache** so genau du kannst: Raster und Spaltenlogik, Typo-Skala und Hierarchie, Weißraum und Abstände, Rhythmus der Sektionen, Art der Navigation, Bewegungsprinzipien (Timing, Easing, was wann wie erscheint), Hover- und Scroll-Verhalten, Umgang mit Farbe. Wer die Referenz kennt, soll ihre DNA wiedererkennen.

Übernimm **nichts von Marke oder Material**: kein Logo, kein Name, keine Texte, keine Fotos oder Grafiken, keinen Quellcode, keine lizenzpflichtigen Schriften. Suche freie Schriften mit ähnlichem Charakter (etwa über Fontshare oder Google Fonts, Lizenz prüfen) und nenne Referenzschrift und Alternative in `decisions.md`. Die Referenz wird auf der Seite nirgends erwähnt.

Keine vorgetäuschten Referenzen: keine Kundenlogos, keine echten Firmennamen, keine Fotos von Menschen, auch keine KI-generierten „Berater"-Porträts. All das würde Kunden oder Mitarbeitende vortäuschen. Wo die Referenz Fotos einsetzt, baust du eigene Bildwelten aus Code: Folien, Diagramme, Blaupausen, Organigramme, Datenstrukturen, als SVG, Canvas oder WebGL.

## 4. Was bleiben muss

**Harte Vorgaben, nicht verhandelbar:**

1. **Satire-Hinweis zuerst.** Er steht vor allem anderen und ist beim Laden sofort sichtbar, auch bei 390 px Breite und auch während eines Intros. Die Gestaltung darf neu sein, die Aussage nicht: Satire, Spaßprojekt, kein Unternehmen, keine Leistungen, alles erfunden, Link zu „Was soll das?".
2. **Im `<head>` bleiben unverändert:** das `google-site-verification`-Meta-Tag samt Kommentar (ohne das Tag verliert eine OAuth-App ihre Authorized Domain), `canonical`, `lang="de"`, der satirische `title` und die `description`. Open-Graph- und Twitter-Tags bleiben, nur das Bild darf neu sein.
3. **`CNAME` bleibt unangetastet.**
4. **`datenschutz.html` bekommt das neue Design, der Rechtstext bleibt inhaltlich gleich.** Einzige erlaubte Änderung: Abschnitt 3 (Google Fonts), wenn du die Schriften selbst hostest.
5. **Was die Datenschutzerklärung verspricht, muss stimmen:** keine Cookies, kein Tracking, kein localStorage, sessionStorage oder IndexedDB, keine Drittanbieter. Also auch keine CDNs: Bibliotheken und Schriften liegen lokal im Repo.
6. **Die Anker `#services`, `#approach`, `#cases`, `#manifest` und `#was-soll-das` bleiben erhalten.** Die Seite bleibt ein One-Pager plus Datenschutz.
7. **Die Cases kommen weiter aus `assets/data/projects.json`** (Felder `metric`, `title`, `description`, `tags`), gerendert per JS, mit Fallback-Text, wenn das Laden scheitert.
8. **Kontakt nur über `contact@kinxner-consulting.de`**, mit dem Hinweis, dass es keine Angebote gibt, auch nicht auf Nachfrage.

**Der Witz bleibt.** Der Wortlaut darf feiner werden, die Pointe nicht:

- „Und ja: Wir können auch PowerPoint. Nur eben nicht für Geld." Gern prominenter als bisher (heute steht der Satz klein im Footer). Er gehört zu den besten Sätzen der Seite.
- „Wir schreiben KI groß. Wörtlich." und die Signatur: „KI" wird in Wörtern farbig markiert (KInxner, KI-Strategie, KI in Produktion).
- Die erfundenen Kennzahlen: 97,3 % weniger Bauchgefühl · 428 Folien pro Woche automatisiert · 0 Buzzwords ohne Definition · 1 Krone im Logo.
- Die sechs Leistungen; die fünf Vorgehensschritte („Keiner davon ist ein Workshop ohne Ergebnis."); das Manifest („Ein Modell ohne saubere Daten ist eine Meinung mit GPU."); „Vier Projekte, die es nie gegeben hat."; „Die NDA-Ordner sind ebenfalls erfunden."; „Kein Erstgespräch · 0 min · unverbindlich · existiert nicht"; der Text von „Was soll das?".
- Die Folie: Beratung heißt PowerPoint. Die Folie darf ein wiederkehrendes Motiv werden.

Neue Texte sind erlaubt, wo das Layout der Referenz Sektionen verlangt, die es noch nicht gibt, zum Beispiel eine FAQ („Können Sie uns ein Angebot machen?" – „Nein."). Bedingungen: Deutsch, derselbe trockene Ton, erkennbar erfunden, keine echten Namen, nichts, was als echte Leistung missverstanden werden kann. Lieber drei neue Sätze, die sitzen, als eine Sektion Füllmaterial.

## 5. Die Krone

Die Krone bleibt das Markenzeichen, und du darfst sie neu entwerfen. Heute gibt es zwei Versionen: `assets/img/logo.png` (goldene Krone, fünf Zacken mit Kugelspitzen, darunter der Schriftzug KINXNER) und eine stark vereinfachte SVG im Header. Beide sind nicht gut genug.

Anforderungen:

- Sofort als Krone lesbar, im Favicon bei 16 px genauso wie in Heldengröße.
- Eigene, auf einem Raster konstruierte Geometrie, als SVG mit sauberem `viewBox`. Dokumentiere die Konstruktion in `docs/redesign/crown.md`.
- Funktioniert einfarbig im Duoton. Gold, bisher der Markenakzent, darf als einzige dritte Farbe überleben, dann aber nur an der Krone. Entscheide und begründe.
- Harmoniert mit der Wortmarke und dem markierten „KI".

Richtungen, die du prüfen kannst, aber nicht musst: die Krone als Blaupause mit Bemaßung („Zackenhöhe: nicht verhandelbar"), was das Blueprint-Motiv der Referenz aufgreift; die Krone aus den fünf Balken eines Balkendiagramms, das zufällig königlich ausfällt; die Krone, die aus einer Folienvorlage entsteht. Skizziere mindestens drei Varianten als SVG, vergleiche sie bei 16, 32 und 400 px und wähle eine.

Einsatz:

- **Intro:** Die Krone zeichnet sich (zum Beispiel als Blaupausenlinie) und wandert dann in die Navigation, analog zum Logo-Übergang der Referenz. Höchstens etwa 1,5 s, per Klick oder Taste überspringbar. Sie verdeckt weder Inhalt noch Satire-Hinweis und entfällt bei `prefers-reduced-motion`.
- **Lieferumfang:** `assets/img/crown.svg`, `favicon.svg`, PNG-Fallbacks (32 px und 180 px Apple Touch Icon) und ein neues OG-Bild in 1200×630 mit Krone und Satire-Kennzeichnung. Die PNGs renderst du aus dem SVG, etwa mit Playwright.

## 6. Technik

- **Statisch, GitHub Pages, ohne Build-Schritt:** HTML, CSS, Vanilla-JS (ES-Module erlaubt). Bibliotheken nur, wenn sie ihr Gewicht wert sind (etwa GSAP, Lenis, OGL oder Three.js für den WebGL-Effekt), lokal unter `assets/vendor/` mit Lizenzdatei.
- **Budget Startseite:** höchstens 1 MB beim ersten Laden, JS höchstens 150 KB gzip, LCP unter 2,5 s bei mobiler Drosselung. WebGL ist Kür: Ohne WebGL, ohne JS und bei reduzierter Bewegung muss alles vollständig lesbar und bedienbar sein.
- **Barrierefreiheit nach WCAG 2.2 AA:** Kontraste, sichtbarer Fokus, Tastaturbedienung (auch das Menü, Escape schließt es), Skip-Link, saubere Überschriftenhierarchie, `prefers-reduced-motion` überall.
- **Responsiv von 360 bis 2560 px**, ohne horizontales Scrollen.
- **Aufräumen:** Ungenutzte Assets (etwa `hero_img.png` oder alte Videos) darfst du löschen, sobald nichts mehr darauf verweist. Sieh dir `assets/vid/Kinxner_vid.mp4` an, bevor du darüber entscheidest.
- **`README.md` aktualisieren:** Design-System-Tabelle, Struktur, Hinweise zur Pflege.

## 7. Ablauf

Arbeite in diesen Stufen; jede endet mit einer Ergebnisdatei. Screenshots und Mitschnitte der Referenz legst du in `.redesign/` ab und trägst den Ordner in `.gitignore` ein: Fremdes Bildmaterial kommt nicht ins öffentliche Repo.

1. **Bestand.** Lies das Repo vollständig. Halte fest, was nach Abschnitt 4 bleiben muss → `docs/redesign/00-bestand.md`.
2. **Referenz vermessen.** Öffne die Referenz mit Playwright (Chromium ist vorinstalliert) bei 1440×900 und 390×844. Mach Ganzseiten-Screenshots, Screenshots in Scroll-Schritten, Hover-Zustände und das Intro als Einzelbilder. Lies computed styles aus: Schriftgrößen, Zeilenhöhen, Laufweiten, Spaltenraster, Abstände, Farben, Übergangsdauern, Easings. Ergebnis → `docs/redesign/01-referenz.md`, mit Zahlen statt Adjektiven.
3. **Konzept.** Zuordnungstabelle Referenz-Muster → KInxner-Sektion, Design-Tokens (Farben, Typo-Skala, Abstände, Radien, Bewegung), Kronen-Entwurf → `docs/redesign/02-konzept.md` und `docs/redesign/crown.md`.
4. **Bauen.** Erst `index.html`, `assets/css/` und `assets/js/`, danach `datenschutz.html`.
5. **Vergleichen und nachschärfen.** Screenshots deines Builds bei denselben Viewports, Sektion für Sektion neben die Referenz gelegt (Vergleichsbilder in `.redesign/compare/`). Frag bei jedem Paar: Stimmen Raster, Typo-Hierarchie, Weißraum und Bewegungsgefühl? Wirkt es teuer? Sitzt die Pointe? Mindestens drei Runden; notiere pro Runde, was du geändert hast → `docs/redesign/03-iterationen.md`.
6. **Gate.** Fertig erst, wenn alles erfüllt ist:
   - [ ] Satire-Hinweis beim Laden sichtbar, bei 1440 und 390 px, auch während des Intros
   - [ ] `google-site-verification` exakt wie vorher im `<head>` von `index.html`
   - [ ] Playwright-Netzwerkmitschnitt: keine Anfrage an fremde Domains, keine Cookies, kein Web Storage
   - [ ] Lighthouse mobil für Startseite und Datenschutz: Performance ≥ 90, Accessibility 100, Best Practices ≥ 95, SEO 100
   - [ ] axe-core: 0 Verstöße
   - [ ] keine Konsolenfehler; mit deaktiviertem JS vollständig lesbar
   - [ ] alle fünf Anker funktionieren; die Cases laden aus `projects.json`
   - [ ] „Wir können auch PowerPoint" ist drin
   - [ ] das Favicon ist bei 16 px noch als Krone erkennbar
   - [ ] kein Text, Bild, Logo oder Code der Referenz im Repo
7. **Abgeben.** Auf einem eigenen Branch committen und pushen, niemals auf `main`: GitHub Pages schaltet `main` sofort live. Öffne einen Pull Request mit Vorher/Nachher-Screenshots der eigenen Seite (Desktop und Mobil) und dem Ergebnis des Gates.

Das Ziel ist eine Seite, die sich selbst als Site of the Day bewerben könnte und dabei keine Sekunde vergisst, dass sie nichts verkauft.
