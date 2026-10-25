# Bildkonzept

Stand 16. Oktober 2026. Grundlage: Quellcode, Designsystem (`src/styles/global.css`) und Screenshots des lokal
gebauten GitHub-Pages-Builds bei 1440, 1920, 820 (Tablet) und 390 px (Smartphone). Die Live-Seite war aus der
Arbeitsumgebung nicht erreichbar; der Build ist mit ihr identisch (gleicher Commit, gleicher Workflow).

In der Arbeitsumgebung steht kein Bildgenerator zur Verfügung. Dieses Dokument enthält deshalb die Analyse, die
Prompts und die fertige technische Einbindung. Die Bilder selbst erzeugt Alessandro Cortese mit einem Generator
seiner Wahl; danach genügt `npm run bilder` und ein Eintrag im Frontmatter.

## Umgesetzt: Planzeichnungen in den Kopfbereichen

Da in der Arbeitsumgebung kein Bildgenerator verfügbar ist, haben die vier Kompetenzseiten seit 16. Oktober 2026
je eine technische Zeichnung in der Sprache des Leitmotivs (Vektorgrafik, `src/components/illustrationen/`):

| Seite | Zeichnung |
|---|---|
| Tiefbau und Infrastruktur | Brückenquerschnitt in Instandsetzung: Randbalken abgetragen, Bewehrung frei, Hängegerüst, Spur gesperrt, Verkehr läuft |
| Netzinfrastruktur und Leitungsbau | Situationsplan Dorfstrasse: bestehende Werkleitungen, neue FTTH-Trasse mit Schächten und Hausanschlüssen, Querung als Konfliktpunkt |
| Digitalisierung technischer Prozesse | LV mit NPK-Positionen → Prüfwerkzeug → Abweichung markiert → Ergebnis mit Fundstelle |
| KI-Agenten | Offerte, Ausmass, Rechnung → KI-Agent mit Wissensbasis (Normen, Vertrag) → Prüfbericht → Fachperson entscheidet |

Jede Zeichnung hat Titel und Beschreibung für Screenreader, respektiert «Bewegung reduzieren» und wiegt nur wenige
KiB. Sobald ein Foto (KI oder eigen) mit `bild:` im Frontmatter gesetzt ist, ersetzt es die Zeichnung automatisch.
Die Prompts unten bleiben für diesen späteren Schritt gültig.

## Umgesetzt: KI-Video «Vom Rechenzentrum bis ins Wohnzimmer» (Startseite, ab 25. Oktober 2026)

KI-Video von Alessandro Cortese (erstellt mit Grok, 15 s), direkt nach dem Einstieg der Startseite. Zweite Fassung
nach einem fachlich geschärften Prompt (eine durchgehende Kamerafahrt, Zeitplan pro Station). Ablauf:
Glasfaserverteiler mit gelben Patchkabeln und grünen APC-Steckern, Kabelkeller, Dorfstrasse mit Viadukt und
Röntgenblick in den Graben, Kabelschacht mit geöffneten Muffen und Spleisskassetten, Hausanschlusskasten mit
Steigrohr, Arvenstube mit Glasfaserdose, Patchkabel und Router.

- **Dateien:** `public/video/rechenzentrum-wohnzimmer-v2.webm` (VP9, 1.9 MB) und `-v2.mp4` (H.264, 2.4 MB), je
  1280 × 720, ohne Ton, leichte Entrauschung, zwei Durchgänge; Standbild `rechenzentrum-wohnzimmer-v2-poster.webp`
  (Glasfaserverteiler bei 1 s). Neuer Dateiname, weil Videos 30 Tage im Browser zwischengespeichert werden.
  Original 16.7 MB nicht im Repository.
- **Verhalten:** lädt erst, wenn es sichtbar wird, spielt stumm in Schleife, hält ausserhalb des Bildes an, eigener
  Knopf zum Anhalten (WCAG 2.2.2). Bei «Bewegung reduzieren» und Datensparmodus nur auf Knopfdruck.
- **Kennzeichnung:** «KI-generiertes Video, ohne Ton» in der Legende, Beschreibung des Ablaufs im Text.
- **Gegenüber der ersten Fassung behoben:** orange statt weisse Rohre, kein Felstunnel mehr, keine
  Pseudobeschriftungen im Netzplan, Licht läuft über Glasfaserdose und Patchkabel in den Router.
- **Fachlich zu beachten (2. Fassung):**
  - Kabelkeller (3–4 s): Stahltür mit Bullauge wie ein Schott, der Impuls zieht kurz frei durch die Luft.
  - Graben (5–8 s): kein Warnband sichtbar, stattdessen ein Brett quer über den Rohren; Rohre liegen teils auf
    Kies statt ganz im Sandbett, dazu quer liegende Rohrstücke; Belagsschichten nur als Glasplatte angedeutet;
    der Impuls läuft streckenweise auf statt im Rohr.
  - Kabelschacht (8–11 s): Spleisskassetten liegen am Boden, der Impuls läuft als Strahl durch die Luft zu einem
    Fenster in der Schachtwand, das es real nicht gibt.
  - Wohnzimmer (13–15 s): die Glasfaserdose sieht aus wie eine Steckdose.
  - Für eine dritte Fassung den Graben (5–8 s) und den Schacht (8–11 s) gezielt neu erzeugen.

## Früher: KI-Bild «Vom Graben zum Rechenzentrum» (Startseite, bis 25. Oktober 2026)

KI-Bild von Alessandro Cortese, eingebunden am 16. Oktober 2026 als breites Bildband direkt nach dem Einstieg der
Startseite. Zweigeteilt: links Leitungsgraben mit Rohrbündel vor Bergkulisse, rechts Leitung unter der Strasse bis
zum Rechenzentrum. Es zeigt die Kernaussage der Seite (Infrastruktur trägt Digitalisierung und KI).

- **Retusche:** Das Schild rechts trug eine typische KI-Fehlschrift («Grisokes Rechneentrum – Batenpluss»). Der Text
  wurde entfernt, das Schild ist jetzt leer. Sonst unverändert.
- **Dateien:** Original 1408 × 768 in `quellbilder/startseite/graben-rechenzentrum.jpg`, Webfassungen 800 und
  1400 px WebP (42 und 117 KiB) und JPG-Fallback, Originalformat ohne Zuschnitt, Metadaten entfernt.
- **Kennzeichnung:** «KI-generierte Illustration» in der Bildlegende.
- **Messung (Lighthouse mobil, 3 Läufe):** Leistung 98–100, LCP 1,4–2,0 s, CLS ≤ 0,012, Gewicht 187 KiB (vorher
  144 KiB). Barrierefreiheit, Best Practices, SEO 100.
- **Fachlich zu beachten:** Die leuchtenden Rohre und Lichtlinien sind bewusst symbolisch, keine reale Bauweise.
  Für ein späteres Update eine Fassung mit mind. 2400 px Breite verwenden (aktuell 1408 px, auf grossen
  Bildschirmen leicht weich).

## 1. Visuelle Identität der Webseite

| Merkmal | Bestand |
|---|---|
| Grundton | Sehr dunkel: `--nacht #0a0f14`, Flächen `--tiefe #0f1720`, `--panel #142029` |
| Akzente | Eisblau `--eis #8fd3ff` (Links, Hervorhebungen), sparsam Signalorange `--signal #f2a65a` (Kote, Masslinie) |
| Helle Bänder | `--papier #eef3f6` für Abschnitte «Aus der Praxis» und Fachbeiträge |
| Schrift | Barlow Condensed (Titel, Versalien), Source Sans 3 (Text), IBM Plex Mono (Positionsnummern, Bildhinweise) |
| Bildsprache | Technische Linienzeichnung: Grabenquerschnitt → Faser → KI-Netz, Rasterlinien wie auf Plänen, «Pos.»-Nummern wie im Leistungsverzeichnis |
| Fotos | Echte Fotos von drei Referenzobjekten (Brücken), App-Screenshots, Porträt |

Kernwirkung: nüchtern, präzise, ingenieurmässig. Ein Bild muss sich wie ein Planausschnitt im Nachtmodus anfühlen,
nicht wie Werbung.

## 2. Bildpositionen und Entscheid

Gemessene Darstellungsgrössen in CSS-Pixeln (Desktop 1440 px / Smartphone 390 px).

| Position | Grösse | Bestand | Entscheid | Begründung |
|---|---|---|---|---|
| Startseite, Hero rechts | 545 × 418 / 358 × 275 | SVG-Leitmotiv Grabenquerschnitt → KI-Agent | **Beibehalten** | Eigenständigstes Element der Seite, transportiert die Positionierung exakt. Ein Foto würde mit der Titelzeile konkurrieren und die Marke austauschbarer machen. |
| Startseite, Kompetenzkarten (3) | 365 × 356 | nur Text | Vorerst beibehalten | Bilder hier würden die Startseite um ca. 150 KiB schwerer machen. Nach Vorliegen der Kopfbilder neu beurteilen (P2). |
| Kompetenzübersicht, Netzgrafik | 1128 × 490 | SVG-Netz der vier Felder | **Beibehalten** | Zeigt den Zusammenhang der Felder, passt zum Leitmotiv. |
| **Kompetenzseiten, Kopf rechts (4)** | 792 × 488 (1920 px: 1056 × 488) / 356 × 199 | war leer, jetzt Planzeichnung | **Zeichnung umgesetzt; optional später KI-Foto** | Grösste sichtbare Lücke: rechte Hälfte des Seitenkopfs ist auf allen vier Seiten leer. Höchster Nutzen pro Bild. |
| Fallstudien BM-Trainer, Rechnen mit Pokémon | 363 × 227 | echte App-Screenshots | **Beibehalten** | Authentischer Beleg, ein KI-Bild wäre schlechter. |
| Fallstudie Prüf-Agent (Konzept) | 363 × 227 | Schema Eingang → Prüfung → Prüfbericht | **Beibehalten** | Ehrlich als Konzept erkennbar. Ein fotorealistisches Bild würde ein fertiges Produkt suggerieren. |
| Referenzobjekte (3) | 268 × 201 / 356 × 267 | echte Fotos | **Beibehalten, nie durch KI ersetzen** | Belegte Referenzen. Rheinbrücke Fläsch nur 512 px breit: Original in höherer Auflösung nachliefern. |
| Profil, Porträt | 260 × 260 / 180 × 180 | 320 px, heller Hintergrund, Passfoto-Charakter | **Durch echtes Foto ersetzen, nicht KI** | Schwächstes Bild der Seite (geringe Auflösung, heller Hintergrund auf dunkler Seite). Ein KI-Porträt einer realen Person wäre irreführend. Briefing siehe Abschnitt 7. |
| Fachbeiträge (3, Entwürfe) | – | keine | Prompts bereit (P3) | Erst sinnvoll, wenn die Beiträge freigegeben sind. |
| Vorschaubild Social Media | 1200 × 630 | eigene Grafik | Beibehalten | Passt zum Designsystem. |

## 3. Bildregeln

1. **Low-Key, Blaue Stunde.** Schatten nahe `#0a0f14`, kühle Stahlblau-Farbkorrektur, Lichter Richtung Eisblau.
   Im Test lief ein helles Tageslichtfoto sichtbar gegen das Design; dieselbe Aufnahme abgedunkelt und kühl
   eingefärbt fügte sich nahtlos ein und war ausserdem 40 % kleiner.
2. **Genau ein warmer Akzent** in Signalorange (Warnleuchte, Arbeitslampe), wie die Kote im Leitmotiv.
3. **Technisch plausibel, Schweizer Kontext.** Graubündner Bergstrassen, Dörfer, Kunstbauten; korrekte Bauteile,
   keine erfundenen Konstruktionen.
4. **Komposition für das Layout:** Hauptmotiv rechts und in der vertikalen Mitte, linkes Drittel ruhig und dunkel
   (dort liegt auf dem Desktop die Ausblendung unter dem Text). Schablone: `docs/bilder/schablone-kopfbild-3x2.png`.
5. **Keine Schrift, keine Logos, keine Marken** (insbesondere kein Swisscom-Branding), keine Kennzeichen, keine
   erkennbaren Gesichter.
6. **Keine KI-Klischees:** keine Roboter, Gehirne, Hologramme, Neonwelten oder Partikel. KI wird höchstens mit sehr
   feinen eisblauen Linien angedeutet, wie im bestehenden Leitmotiv.
7. **Vier unterschiedliche Blickwinkel** (Landschaft, Blick in den Graben, Nahaufnahme, Aufsicht), damit die Seiten
   abwechslungsreich, aber als Serie erkennbar sind.
8. **Kennzeichnung:** Jedes KI-Bild trägt sichtbar «KI-generierte Illustration» (automatisch). KI-Bilder stehen nie
   bei Referenzobjekten.

## 4. Prompts – Kopfbilder Kompetenzseiten (P1)

Format **3:2, mindestens 2400 × 1600 px**. Die Prompts sind auf Englisch, weil die meisten Generatoren damit
präziser arbeiten. Stilblock und Ausschlüsse an jeden Prompt anhängen.

**Stilblock**

```
Documentary architectural photograph, canton of Graubünden in the Swiss Alps, blue hour shortly after sunset,
low-key exposure, deep blue-black shadows, cool steel-blue colour grading with highlights tending towards pale
ice blue, exactly one small warm amber light as the only warm accent, full-frame camera, 35 mm lens, f/5.6,
natural eye-level perspective, realistic materials and reflections, natural shadows, subtle film grain, calm
composition. Main subject in the right half of the frame and in the vertical middle; the left third of the frame
dark, calm and almost empty. Landscape format 3:2.
```

**Ausschlüsse** (bei Midjourney als `--no`, sonst als «Avoid: …»)

```
text, letters, numbers, signage, logos, brand names, watermarks, licence plates, recognisable faces, people in
the foreground, robots, glowing brains, holograms, neon, particles, lens flares, HDR look, oversaturated colours,
fisheye distortion, impossible or floating structures
```

### 4.1 Tiefbau und Infrastruktur

- **Datei:** `quellbilder/kompetenzen/tiefbau-infrastruktur.jpg`
- **Seite:** `/kompetenzen/tiefbau-infrastruktur/`, Seitenkopf
- **Aussage:** Instandsetzung im Bestand unter Verkehr, wie im Text beschrieben
- **Prompt:**
  ```
  Repair works on an existing reinforced-concrete road bridge on a cantonal mountain road. The edge beam of the
  deck is partly removed by hydrodemolition, exposing cleaned reinforcement bars, with new timber formwork in
  place; a light working platform hangs beneath the deck. One lane is closed with low barrier elements and a
  single amber warning beacon; traffic continues on the other lane, visible only as faint light trails. Forested
  slope and snow-covered peaks as dark silhouettes against the dusk sky. Three-quarter view from the valley side.
  ```
- **Alternativtext:** «Instandsetzung einer Betonbrücke an einer Bergstrasse in der Dämmerung: Randbalken mit
  freigelegter Bewehrung, Arbeitsgerüst und einspurige Verkehrsführung.»
- **Prüfen:** Bewehrung logisch (Längs- und Bügelbewehrung), Gerüst hängt sicher, keine schwebenden Bauteile.

### 4.2 Netzinfrastruktur und Leitungsbau

- **Datei:** `quellbilder/kompetenzen/netzinfrastruktur-leitungsbau.jpg`
- **Aussage:** Der Graben im Strassenraum, in dem sich Werkleitungen begegnen; greift den Querschnitt des Leitmotivs auf
- **Prompt:**
  ```
  Open utility trench about 1.2 m deep with clean vertical walls in the asphalt street of a Graubünden mountain
  village. On a sand bed at the bottom lies a neat bundle of six grey PE cable protection ducts next to a bundle
  of colour-coded microducts; an existing blue water pipe crosses the trench at right angles; a plain warning
  tape lies above the ducts. Saw-cut asphalt edges, steel road plates stacked beside the trench, one amber
  warning lamp on a barrier. Stone houses with a few lit windows softly out of focus in the background. Elevated
  three-quarter view looking into the trench.
  ```
- **Alternativtext:** «Offener Leitungsgraben in einer Dorfstrasse: Kabelschutzrohre und Mikrorohre im Sandbett,
  quer dazu eine bestehende Wasserleitung.»
- **Prüfen:** Rohre liegen geordnet im Sandbett, keine Rohre «aus dem Nichts», Grabentiefe plausibel.

### 4.3 Digitalisierung technischer Prozesse

- **Datei:** `quellbilder/kompetenzen/digitalisierung-prozesse.jpg`
- **Aussage:** Prüf- und Rechenarbeit, die in Werkzeuge übersetzt wird; Plan und Tabelle nebeneinander
- **Prompt:**
  ```
  Close-up of an engineer's desk in a site office at dusk. A printed road cross-section drawing and a printed bill
  of quantities with several rows highlighted, a triangular scale ruler and a mechanical pencil. At the right
  edge a laptop shows an abstract spreadsheet grid; its cool screen light falls across the papers. One small warm
  desk lamp outside the frame casts a single amber highlight. Through the window behind, a mountain silhouette in
  the blue dusk. Shallow depth of field; all text and numbers blurred and unreadable.
  ```
- **Alternativtext:** «Arbeitsplatz mit Strassenquerschnitt, Leistungsverzeichnis mit markierten Positionen und
  Laptop mit Tabellenkalkulation in der Dämmerung.»
- **Prüfen:** Keine lesbaren Zahlen oder Firmennamen, Massstab sieht wie ein echter Dreikantmassstab aus.

### 4.4 KI-Agenten und praktische KI-Anwendungen

- **Datei:** `quellbilder/kompetenzen/ki-agenten.jpg`
- **Aussage:** KI prüft Belege, die Fachperson entscheidet; feine Linien wie im Leitmotiv statt Science-Fiction
- **Prompt:**
  ```
  Top-down view at a slight angle onto a dark desk: a printed bill of quantities and a printed trench
  cross-section plan lie side by side, three positions on the paper are marked with a pencil. A few very thin,
  precise ice-blue lines of light connect these three marks to a tablet lying next to the papers, like a subtle
  projected annotation: restrained, technical, sparse. The tablet shows an abstract checklist with a single check
  mark symbol. A pair of reading glasses and a pencil beside it. All text unreadable.
  ```
- **Variante ohne Lichtlinien** (falls zu verspielt): Linien weglassen, stattdessen «the tablet shows an abstract
  comparison of two columns with one row highlighted in ice blue».
- **Alternativtext:** «Leistungsverzeichnis und Grabenquerschnitt auf dem Tisch, markierte Positionen sind mit
  feinen Linien mit einem Tablet verbunden.»
- **Prüfen:** Linien dünn und wenige (höchstens fünf), keine Glüh- oder Partikeleffekte.

### Einbinden

1. Originale unter `quellbilder/kompetenzen/` ablegen (Dateiname = ID der Kompetenz, siehe oben).
2. `npm run bilder` ausführen. Ergebnis: `public/bilder/kompetenzen/<id>-800.webp`, `-1600.webp` und `.jpg`.
   Metadaten werden entfernt, der Zuschnitt auf 3:2 erfolgt aus der Bildmitte. Das Skript warnt, wenn die
   mobile Variante über 80 KiB liegt (dann ist das Bild zu hell oder zu detailreich).
3. Im Frontmatter der Kompetenz ergänzen:
   ```yaml
   bild: tiefbau-infrastruktur
   bildAlt: Instandsetzung einer Betonbrücke an einer Bergstrasse in der Dämmerung …
   ```
   Der Hinweis «KI-generierte Illustration» erscheint automatisch. Für ein eigenes Foto stattdessen
   `bildHinweis: Foto: Alessandro Cortese` setzen.
4. `npm run test:pages` und Sichtprüfung auf Desktop und Smartphone.

## 5. Prompts – Fachbeiträge (P3, nach Freigabe)

Format **16:9, mindestens 1920 × 1080 px**, Motiv mittig. Die Artikelkarten haben noch keinen Bildplatz; die
Einbindung folgt mit der Freigabe der Beiträge. Stilblock und Ausschlüsse wie oben, jedoch «Main subject centred».

| Datei | Beitrag | Motiv (Prompt-Kern) | Alternativtext |
|---|---|---|---|
| `artikel-ki-agenten-im-tiefbau.jpg` | KI-Agenten im Tiefbau | `Hands of a site engineer (no face visible) holding a tablet above an open trench at dusk, the tablet showing an abstract list with one highlighted row; trench with ducts slightly out of focus below; one amber warning lamp.` | «Hände halten ein Tablet über einen offenen Leitungsgraben.» |
| `artikel-schnittstellen-im-ftth-ausbau.jpg` | Schnittstellen im FTTH-Ausbau | `Open manhole in a village street seen from above at dusk: cable ducts enter from several directions, a fibre splice closure is mounted on the shaft wall, the fibre cable reserve is neatly coiled; the cast-iron cover lies beside the opening; a neighbouring water valve cover is visible in the asphalt.` | «Geöffneter Kabelschacht mit Rohreinführungen, Spleissmuffe und aufgerollter Glasfaserreserve.» |
| `artikel-ki-und-datenschutz-im-projektalltag.jpg` | KI und Datenschutz im Projektalltag | `Desk at dusk: a project document with several lines blacked out (redacted) in the foreground, behind it a closed ring binder and a laptop with its lid closed; cool light, one amber desk-lamp highlight. All text unreadable.` | «Projektdokument mit geschwärzten Zeilen vor einem geschlossenen Laptop.» |

## 6. Qualitätsprüfung im Layout

Die Einbindung wurde am 16. Oktober 2026 mit einem Platzhalter (vorhandenes Brückenfoto, danach wieder entfernt)
im echten Layout geprüft:

| Prüfung | Ergebnis |
|---|---|
| Desktop 1440 px | Bild rechts 792 × 488, läuft nach links und unten in den Hintergrund aus; Titel, Lead und Normen-Chips frei lesbar |
| Desktop 1920 px | 1056 × 488, Variante 1600 px geladen |
| Tablet 820 px | Band 16:9 unter dem Text, 786 × 441 |
| Smartphone 390 px | Band 16:9 unter dem Text, 356 × 199, Variante 800 px geladen |
| Hinweis «KI-generierte Illustration» | auf allen Grössen lesbar (nicht von der Ausblendung erfasst) |
| Barrierefreiheit (axe, WCAG 2.2 AA) | 0 Verstösse |
| Lighthouse mobil, helles Foto 109 KiB | Leistung 98, LCP 2,3 s (Bild wird zum grössten Element) |
| Lighthouse mobil, Low-Key-Fassung 62 KiB | Leistung 99, LCP 2,0–2,1 s, CLS 0 (ohne Bild: 100, 1,4–1,5 s) |
| Lighthouse Desktop | Leistung 100, LCP 0,5 s |

Folge: Low-Key ist nicht nur gestalterisch, sondern auch technisch die richtige Wahl. Das Bild ist mit
`fetchpriority="high"` priorisiert und hat feste Abmessungen (kein Layoutsprung).

Bei der Prüfung fiel ein Fehler im GitHub-Pages-Build auf: Bei `srcset` mit mehreren Grössen erhielt nur die
erste Adresse den Unterordner `/Tiefbauleitung`. Behoben in `astro.config.mjs`; ein Test prüft nun jede Adresse.

Checkliste für jedes neue Bild:

- [ ] Hauptmotiv in der sicheren Zone der Schablone, linkes Drittel ruhig
- [ ] Wirkt auf Desktop und Smartphone (Screenshot prüfen)
- [ ] Farbwelt: dunkel, kühl, genau ein warmer Akzent
- [ ] Technisch plausibel (Fachblick: Bewehrung, Rohre, Gerüst, Schacht)
- [ ] Keine Schrift, Logos, Gesichter, Kennzeichen, KI-Artefakte (Hände, Geländer, Leitplanken prüfen)
- [ ] Mobile Variante unter 80 KiB
- [ ] Nutzungsrechte gemäss Bedingungen des Generators für kommerzielle Nutzung geklärt

## 7. Porträt: Briefing für ein echtes Foto

**Erledigt am 17. Oktober 2026:** neues Profilfoto von Alessandro Cortese eingebunden (600 × 600 px, JPG 40 KiB, WebP 16 KiB,
Metadaten entfernt). Das Briefing unten bleibt als Vorlage für weitere Aufnahmen.

Kein KI-Porträt. Empfehlung für eine Aufnahme durch eine Fotografin oder einen Fotografen:

- Ort: Baustelle oder Brücke in Graubünden, Blaue Stunde oder bedeckter Himmel
- Kleidung: dunkle Jacke, ohne Firmenlogo
- Bildausschnitt: Brustbild, Blick zur Kamera, Hintergrund unscharf und dunkel
- Format: quadratisch, mindestens 1200 × 1200 px, Kopf in der oberen Bildhälfte (Anzeige rund 260 × 260)
- Rechte: Nutzungsrecht für Webseite und Social Media schriftlich festhalten
