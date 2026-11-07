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
| B6 | SEO | Keine strukturierten Brotkrumen (BreadcrumbList), obwohl sichtbar vorhanden | 0 von 33 Unterseiten | mittel |
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

## 4. Umsetzung, Tests und Ergebnisse

Wird nach der Umsetzung ergänzt.
