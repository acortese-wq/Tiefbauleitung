# Redesign und UX-Optimierung, November 2026

Auftrag: bestehende Webseite professioneller und besser bedienbar machen, ohne Farbwelt, Logo, Inhalte oder Funktionen
zu verändern. Sicherer Ausgangszustand: Zweig `checkpoint/vor-redesign-2026-11-07` (Commit 3296266) und lokaler Tag
`checkpoint-vor-redesign-2026-11-07`.

## 1. Ausgangszustand (Phase 1)

**Architektur**
- Astro 7.3.5, statische Ausgabe; Node-Adapter nur für Vorschau und Kontaktformular-Variante. TypeScript, keine
  UI-Bibliothek, Client-Skripte in reinem TypeScript, pdf.js nur in der Gesetzesprüfung (nachgeladen).
- Inhalte als Astro-Collections: 4 Kompetenzen, 13 Projekte, Artikel (Entwürfe), 38 Referenzen (JSON).
- Gestaltung: globale Tokens und Grundkomponenten in `src/styles/global.css`, Planzeichnungen in `src/styles/plan.css`,
  sonst komponentenbezogene Styles. Schriften lokal (Barlow Condensed, Source Sans 3, IBM Plex Mono).
- Sicherheit: CSP über Astro (Skripte und Styles mit Prüfsummen), HTTP-Header in `deploy/swizzonic/.htaccess`
  (HSTS, nosniff, X-Frame-Options, Referrer-, Permissions-Policy, COOP, CORP).
- Veröffentlichung über GitHub Actions auf GitHub Pages (Unterordner) und tiefbauleitung.com (Swizzonic, FTPS).
- Tests: 68 Unit-Tests (Vitest), rund 150 E2E-Tests je Gerät (Desktop, Pixel 7), Varianten-, Pages- und
  Swizzonic-Suiten, Barrierefreiheit mit axe (WCAG 2.2 AA) auf jeder Seite.

**Seiten (35 HTML-Seiten):** Start, Profil, Kompetenzen (Übersicht und 4 Felder), Projekte (Übersicht und 13
Fallstudien), KI-Labor (Übersicht, Werkbank, Gesetzesprüfung, Nutzenrechner, KI-Radar), Netzbau-Quiz, Wissen, Suche,
Kontakt, Impressum, Datenschutz, Seitenübersicht, 404.

**Komponenten (Auswahl):** Header mit Mobilmenü, Footer, Seitenkopf mit Brotkrumen, Leitmotiv, Planzeichnungen,
Kernaussage, Projekt- und Referenzkarten, Referenzliste mit Filter, Bildband, Werkzeugkasten, Bildzoom-Dialog, Quiz,
Quiz-Teaser, Werkbank, Gesetzesprüfung, Nutzenrechner, KI-Radar, Video mit Pause-Knopf.

## 2. Audit-Befunde

Gemessen lokal mit Playwright (Desktop 1440 px, Tablet 834 px, iPhone 13 und 320 px) und Lighthouse 13.5 (Handy,
simuliertes 4G). Was gut ist, steht am Schluss.

| # | Bereich | Befund | Messung | Gewicht |
|---|---|---|---|---|
| B1 | Responsive | Profil ragt auf dem iPhone seitlich über den Bildschirm (Berufsprofil-Raster) | 28 px (390 px), 98 px (320 px) | hoch |
| B2 | Responsive | Startseite auf 320 px: Werkzeug-Chips brechen nicht um | 2 px Überlauf | mittel |
| B3 | Performance | Bis zu 7 CSS-Dateien blockieren das erste Anzeigen | Start: FCP 2,7 s, LCP 3,1 s (Ziel 2,5 s) | hoch |
| B4 | SEO | Meta-Beschreibungen zu lang, Google kürzt mitten im Satz | 15 Seiten über 160 Zeichen (bis 213) | mittel |
| B5 | SEO | Titel der Gesetzesprüfung zu lang | 80 Zeichen | niedrig |
| B6 | SEO | Strukturierte Brotkrumen (BreadcrumbList) fehlen auf KI-Labor, Quiz, Kontakt, Suche und Rechtlichem; sonst je Seite einzeln gepflegt und für GitHub Pages ohne Unterordner | 11 von 33 Unterseiten ohne | mittel |
| B7 | SEO | Link im Bildzoom-Dialog ohne Ziel, für Suchmaschinen nicht crawlbar | Lighthouse «crawlable-anchors» | niedrig |
| B8 | Performance | Porträt im Zitat lädt in voller Grösse für 48 px | rund 45 KiB zu viel | niedrig |
| B9 | Designsystem | Keine Abstands-, Radius-, Schatten- und Bewegungs-Tokens; Abstände frei gewählt (6, 8, 10, 12, 14, 16, 18, 22, 24 px …) | Durchsicht global.css | mittel |
| B10 | Designsystem | Buttons ohne Zustand «deaktiviert» und «lädt», keine kleine Variante; Hinweise nur in einer Farbe (kein Fehler-, Erfolgs-, Info-Zustand) | Durchsicht | mittel |
| B11 | Formulare | Eingabefelder ohne Hover-, Fehler- und Deaktiviert-Zustand; jede Komponente stylt Felder selbst | 5 Varianten | mittel |
| B12 | Navigation | Kein hervorgehobener Kontakt in der Kopfzeile; Mobilmenü-Knopf ohne Symbol | Durchsicht | mittel |
| B13 | Footer | Zwei Linklisten ohne Überschriften, ungleiche Gliederung | Durchsicht | niedrig |
| B14 | Informationsdichte | Startseite zeigt alle 9 Referenzfotos (wie die Projektseite), letzte Reihe mit einem Bild; «Foto: Alessandro Cortese» 9-mal wiederholt | Start rund 10’800 px hoch | mittel |
| B15 | Rückmeldung | Gesetzesprüfung: beim Lesen einer grossen PDF nur Textstatus, Ablagefläche bleibt bedienbar | Durchsicht | niedrig |
| B16 | Sicherheit | nodemailer 10.1.1 mit bekannter Schwachstelle (mittel); betrifft nur die Formular-Variante | npm audit | mittel |

**Bereits gut (bestätigt):** Barrierefreiheit (axe ohne Verstoss, Lighthouse 100 auf 5 Seiten), Tastaturbedienung mit
sichtbarem Fokus, keine Layoutverschiebung (CLS 0 bis 0,02), kein blockierendes JavaScript (TBT 0 ms),
Sicherheits-Header vollständig, Schriften und Video lokal, keine Cookies, kein Tracking, klare Brotkrumen, durchgängige
Planpapier-Gestaltung.

## 3. Redesign-Konzept (Phase 2)

Leitlinie: Die Identität «Planpapier bei Nacht» bleibt. Verbessert werden System, Zustände, Dichte und Tempo,
nicht die Marke.

| # | Massnahme | löst | Nutzen | Aufwand | Prio |
|---|---|---|---|---|---|
| M1 | Raster und Umbrüche reparieren (Profil, Chips) | B1, B2 | Handy ohne seitliches Scrollen | klein | 1 |
| M2 | CSS in die Seiten einbetten (Astro `inlineStylesheets: 'always'`, CSP-Prüfsummen automatisch) | B3 | keine blockierenden Anfragen, schnelleres erstes Bild | klein | 1 |
| M3 | Meta-Beschreibung zentral auf ≤ 160 Zeichen an Satz- oder Wortgrenze kürzen; Werkzeug-Titel straffen | B4, B5 | vollständige Snippets in Suchergebnissen | klein | 2 |
| M4 | BreadcrumbList als JSON-LD aus den vorhandenen Brotkrumen | B6 | Brotkrumen in Suchergebnissen | klein | 2 |
| M5 | Bildzoom-Link erst im Dialog erzeugen; kleines Porträt (96 px) für das Zitat | B7, B8 | sauberer Crawl, weniger Daten | klein | 3 |
| M6 | Designtokens: Abstände (4-px-Raster), Radien, Schatten, Bewegung, Fokus; Grundkomponenten darauf umstellen | B9 | konsistente Abstände, wartbar | mittel | 2 |
| M7 | Komponentenzustände: Buttons (deaktiviert, lädt, klein), Hinweise (Info, Erfolg, Warnung, Fehler mit Symbol), Felder (Hover, Fehler, deaktiviert) | B10, B11 | vorhersehbare Rückmeldung | mittel | 2 |
| M8 | Kopfzeile: «Kontakt» als Schaltfläche, Menü-Knopf mit Symbol, Navigation etwas grösser | B12 | klarere Handlungsaufforderung | klein | 2 |
| M9 | Footer mit drei beschrifteten Spalten (Seiten, KI-Labor, Rechtliches) | B13 | schnellere Orientierung | klein | 3 |
| M10 | Startseite: 4 Referenzfotos statt 9 (Rest auf der Projektseite), Fotonachweis einmal; Projektseite 3 × 3 | B14 | kürzere Startseite, ruhigeres Bild | klein | 2 |
| M11 | Gesetzesprüfung: Ablage zeigt «wird gelesen» mit Fortschritt und ist währenddessen gesperrt | B15 | klare Rückmeldung bei grossen PDFs | klein | 3 |
| M12 | nodemailer auf 10.1.7 | B16 | Schwachstelle geschlossen | klein | 1 |
| M13 | Designsystem dokumentieren (`docs/DESIGNSYSTEM.md`) | B9 | gleiche Regeln für spätere Änderungen | klein | 3 |

**Bewusst nicht umgesetzt**
- Neue Farbwelt oder helles Gesamtdesign: widerspricht der Markenidentität.
- Framework- oder UI-Bibliothekswechsel: kein Nutzen, hohes Risiko.
- Neuer Startseitenaufbau: Einstieg, Kennzahlen und Handlungsaufforderungen funktionieren (Messung und Barrierefreiheit
  gut); die Länge wird über M10 reduziert, nicht über das Entfernen von Inhalten.
- Öffentliche Styleguide-Seite: Dokumentation im Repository genügt, keine zusätzliche Seite im Index.

## 4. Abschlussbericht (Phasen 3 bis 5)

### Umgesetzt

| # | Massnahme | Geänderte Dateien | Status |
|---|---|---|---|
| M1 | Raster Profil (`minmax(0, 1fr)`, Silbentrennung in Kacheln), Chips umbrechend | `profil.astro`, `index.astro` | umgesetzt, getestet |
| M2 | CSS eingebettet, CSP-Prüfsummen automatisch | `astro.config.mjs` | umgesetzt, getestet |
| M3 | `metaBeschreibung()` kürzt auf ≤ 160 Zeichen; Titel Gesetzesprüfung 80 → 60 Zeichen | `lib/seo.ts`, `Basis.astro`, `gesetzespruefung.astro` | umgesetzt, getestet |
| M4 | BreadcrumbList aus `Seitenkopf` (eine Quelle, mit Unterordner), doppelte Angaben in 7 Seiten entfernt | `Seitenkopf.astro`, `lib/seo.ts`, Seiten | umgesetzt, getestet |
| M5 | Bildzoom-Link erst beim Öffnen; Porträt 96 px (1,6 statt 17 KiB) | `Bildzoom.astro`, `Kernaussage.astro`, `public/bilder/portrait-96.*` | umgesetzt, getestet |
| M6 | Tokens für Abstände, Radien, Schatten, Bewegung, Fokus, Status; Buttons, Karten, Chips, Badges, Raster, Hinweise darauf umgestellt | `global.css` | umgesetzt, getestet |
| M7 | Button deaktiviert, lädt (`aria-busy`), klein; Hinweis Info, Erfolg, Fehler; Felder mit Hover, Fehler (`aria-invalid`), deaktiviert; Karten mit Schatten und Gedrückt-Zustand | `global.css` | umgesetzt; Zustände «deaktiviert» und «lädt» der Buttons sind vorbereitet, aktuell nutzt sie noch keine Seite |
| M8 | Kopfzeile: «Kontakt» als Schaltfläche, Menü-Symbol mit Wechsel zu ×, Menü blendet weich ein, Navigation 0.82 rem, Mobilmenü ab 960 px | `Header.astro` | umgesetzt, getestet |
| M9 | Fusszeile: Seiten, Ausprobieren, Rechtliches; LinkedIn als Schaltfläche; neu verlinkt: Gesetzesprüfung, Werkbank, Quiz | `Footer.astro` | umgesetzt, getestet |
| M10 | Startseite 4 Fotos (eine Reihe), Fotonachweis einmal, Spaltenzahl ohne Einzelbild in der letzten Reihe | `Referenzbilder.astro`, `index.astro` | umgesetzt, getestet |
| M11 | PDF-Ablage: `aria-busy`, gesperrt, «Wird gelesen: Seite x von n», Hinweis bei erneutem Ablegen | `Gesetzespruefung.astro` | umgesetzt, getestet |
| M12 | nodemailer 10.1.7: `npm audit --omit=dev` ohne Befund | `package.json` | umgesetzt, getestet |
| M13 | Designsystem dokumentiert | `docs/DESIGNSYSTEM.md` | umgesetzt |

### Tests (getestet und bestanden)

- Unit-Tests: 73 von 73 (neu: Meta-Beschreibung, Seitenadresse, Brotkrumen).
- E2E: 301 bestanden, 3 bewusst übersprungen (gerätespezifisch), auf Desktop und Pixel 7; neu: Kopfzeile und Fusszeile,
  kein Überlauf auf 320 px und iPad, Beschreibungslänge und Brotkrumen, PDF-Ablage im Ladezustand.
- Varianten (Formular, Entwürfe): 9 von 9. GitHub Pages (Unterordner): 56 von 56. Swizzonic: 42 von 42.
- Barrierefreiheit: axe (WCAG 2.2 AA) auf allen Seiten ohne Verstoss; Lighthouse Barrierefreiheit 100.
- Links: 1’705 interne Verweise und Sprungmarken auf 34 Seiten, 0 defekt.
- Responsive: alle 23 Hauptseiten auf 320 px, iPhone 13 und iPad ohne seitliches Scrollen.

### Messwerte

Lighthouse 13.5, Handy, simuliertes 4G. «Vorher/nachher» lokal ohne Komprimierung (gleiche Bedingungen),
«Betrieb» mit gzip wie bei Swizzonic und GitHub Pages.

| Seite | FCP vorher → nachher | LCP vorher → nachher | LCP Betrieb | CLS | TBT | Performance Betrieb |
|---|---|---|---|---|---|---|
| Start | 2,7 → 2,4 s | 3,1 → 2,8 s | **2,2 s** | 0 | 0 ms | 98 |
| Projekte | 2,3 → 1,8 s | 2,7 → 2,6 s | **1,7 s** | 0 | 0 ms | 100 |
| Profil | 1,7 → 1,7 s | 2,0 → 2,0 s | – | 0 | 0 ms | – |
| Gesetzesprüfung | 1,8 → 1,8 s | 2,0 → 2,1 s | – | 0,001 | 0 ms | – |
| Netzbau-Quiz | 2,3 → 2,2 s | 2,4 → 2,4 s | – | 0 | 0 ms | – |

Interaktion (INP-Näherung, Pixel 7, CPU vierfach gedrosselt): längste gemessene Interaktion 120 ms (Beispiel in der
Gesetzesprüfung), sonst 16 bis 80 ms. Startseite mit gzip: 35 KiB HTML inklusive CSS.

Höhe der Startseite: Desktop rund 840 px kürzer, Handy rund 2’200 px kürzer.

### Nicht getestet

- Echte Geräte (iOS Safari, Android Chrome), Screenreader (VoiceOver, NVDA): nur Chromium-Emulation und axe.
- Live-Seiten nach der Veröffentlichung: Messwerte stammen aus lokalen Builds.
- Kontaktformular mit echtem Mailversand (nur Variante mit Testserver, live ist das Formular abgeschaltet).

### Noch offen

- Lighthouse-SEO-Wert lokal 92: bleibt nur wegen der lokalen Vorschau (Indexierung dort gesperrt) und, bis zum
  ersten Öffnen eines Bildes, des Bildzoom-Links; auf der Live-Seite zu prüfen.
- Die Kartenvarianten (Projekt-, Kompetenz-, Werkzeug-, Referenzkarten) nutzen noch eigene Innenabstände; schrittweise
  auf `--raum-*` umstellen, wenn sie ohnehin angepasst werden.
- Formularfelder werden weiterhin je Komponente gestaltet; die globalen Zustände ergänzen sie. Eine gemeinsame
  Feldkomponente lohnt sich bei der nächsten grösseren Formularänderung.
- Werkzeugkasten auf dem Handy (11 Karten untereinander) ist lang; eine kompaktere Darstellung wäre der nächste Schritt.
- Ubuntu 24.04 in der CI ist eine Übergangslösung bis zu einem Playwright-Update.
