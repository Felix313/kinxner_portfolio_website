# Fotos für BREIT

Die Bilder in `assets/img/shop/` (außer `inhaber.webp`) sind Ausschnitte aus Fotos von [Pexels](https://www.pexels.com/).
Die [Pexels-Lizenz](https://www.pexels.com/license/) erlaubt die kostenlose Nutzung und Bearbeitung ohne Namensnennung; wir nennen die Fotografen trotzdem, im Footer jeder Seite und hier.
Die Kleidung auf den Fotos ist nicht von BREIT. Ausgewählt wurde nach Schnitt und Farbe des jeweiligen Produkts.

`build.py` lädt die Originale (2400 px breit) nach `cache/` (nicht versioniert), schneidet sie zu und schreibt WebP:

```bash
python3 tools/photos/build.py            # alle Bilder
python3 tools/photos/build.py hero       # nur einzelne
```

Produktbilder 1000 × 1250 plus 600 × 750 (`-sm`), Hero 1200 × 1500, Lookbook 1000 × 1250 bzw. 1600 × 1100 (`look-2`), Atelier 1000 × 1250.
Wer das Hero-Foto oder seinen Ausschnitt ändert, muss die Bemaßung in `assets/js/pages.js` (Konstante `d`, Koordinaten im 400 × 500-Raster) neu ablesen.

## Nachweise

| Bild | Motiv | Pexels-ID | Fotograf |
|---|---|---|---|
| `atlas-kreide-1`, `-2` | Weißes Hemd (2: Detail Knopfleiste) | [20337705](https://www.pexels.com/photo/20337705/) | Jaime Blanchart |
| `atlas-himmel-1` | Hellblaues Hemd | [20337686](https://www.pexels.com/photo/20337686/) | Jaime Blanchart |
| `atlas-himmel-2` | Hellblaues Hemd, Stadt | [20337690](https://www.pexels.com/photo/20337690/) | Jaime Blanchart |
| `forum-streifen-1` | Blau-weiß gestreiftes Hemd | [20559708](https://www.pexels.com/photo/20559708/) | Jaime Blanchart |
| `forum-streifen-2` | Blau-weiß gestreiftes Hemd | [20559705](https://www.pexels.com/photo/20559705/) | Jaime Blanchart |
| `cove-marine-1` | Marineblauer Strick, Kragen mit Zip | [20559702](https://www.pexels.com/photo/20559702/) | Jaime Blanchart |
| `cove-marine-2` | Marineblauer Strick, Kragen mit Zip | [20559701](https://www.pexels.com/photo/20559701/) | Jaime Blanchart |
| `look-2` | Gestreiftes Hemd, Oberkörper | [20559706](https://www.pexels.com/photo/20559706/) | Jaime Blanchart |
| `nocturne-schwarz-1` | Schwarzes Hemd, Arme verschränkt | [5924440](https://www.pexels.com/photo/5924440/) | shalender kumar |
| `nocturne-schwarz-2` | Schwarzes Hemd | [5924478](https://www.pexels.com/photo/5924478/) | shalender kumar |
| `riviera-salbei-1` | Salbeigrünes Leinenhemd | [5156489](https://www.pexels.com/photo/5156489/) | emre keshavarz |
| `riviera-salbei-2` | Salbeigrünes Leinenhemd | [5145182](https://www.pexels.com/photo/5145182/) | emre keshavarz |
| `ridge-waldkaro-1` | Braun-grünes Flanellkaro, Bar | [17012444](https://www.pexels.com/photo/17012444/) | Amit Bokde |
| `ridge-waldkaro-2` | Braun-grünes Flanellkaro | [17012535](https://www.pexels.com/photo/17012535/) | Amit Bokde |
| `look-3` | Braun-grünes Flanellkaro | [17012459](https://www.pexels.com/photo/17012459/) | Amit Bokde |
| `terra-camel-1` | Camelfarbenes Overshirt | [15939317](https://www.pexels.com/photo/15939317/) | Lokman Sevim |
| `terra-camel-2` | Camelfarbenes Overshirt | [15939316](https://www.pexels.com/photo/15939316/) | Lokman Sevim |
| `capo-marine-1` | Marineblaues, fein kariertes Sakko über hellblauem Hemd | [14378602](https://www.pexels.com/photo/14378602/) | Abhishek Shekhawat |
| `capo-marine-2` | Marineblaues, fein kariertes Sakko über hellblauem Hemd | [20400526](https://www.pexels.com/photo/20400526/) | Abhishek Shekhawat |
| `hero` | Marineblaues Sakko über weißem Hemd | [20440142](https://www.pexels.com/photo/20440142/) | Abhishek Shekhawat |
| `look-1` | Marineblaues Sakko über weißem Hemd | [36807010](https://www.pexels.com/photo/36807010/) | Wolf Art |
| `look-4` | Schwarzes Hemd, schwarz-weiß | [21702288](https://www.pexels.com/photo/21702288/) | Gursher Gill |
| `atelier` | Hände schließen den Kragenknopf eines weißen Hemds | [3214788](https://www.pexels.com/photo/3214788/) | Ralph Rabago |

`assets/img/og-image.png`: linke Hälfte (Wortmarke) unverändert, rechts ein Ausschnitt aus dem Hero-Foto.
