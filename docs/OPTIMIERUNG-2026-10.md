# Optimierung Oktober 2026

Analyse und Optimierung der bestehenden Webseite https://acortese-wq.github.io/Tiefbauleitung/.
Ausgangsstand: Commit `d92a9f4`. Alle Messwerte stammen aus tatsächlich ausgeführten Läufen in der
Entwicklungsumgebung; die Live-Seite war aus der Umgebung nicht erreichbar (Proxy) und konnte nicht direkt geprüft
werden.

Legende: **B** bestätigtes Problem · **W** wahrscheinliches Problem · **V** Verbesserungspotenzial ·
**N** nicht überprüfbar

## 1. Bestandsaufnahme

| Bereich | Note | Begründung |
|---|---|---|
| Design | 8 | Eigenständige Bildsprache (Grabenquerschnitt → Faser → KI-Netz), konsistente Farb- und Schriftwelt. V: echte Objektfotos kamen nur auf Unterseiten vor. |
| UX | 7 | Klare Navigation, Suche, Filter. B: «Wissen» führte von 6 Stellen auf eine leere Seite. B: Referenzliste nicht chronologisch. W: mobiles Menü schloss nicht mit Escape oder Klick ausserhalb. |
| Positionierung | 7 | Starke Kernbotschaft «Tiefbau verstehen. KI richtig einsetzen.» B: keine ausdrückliche Zielgruppe. |
| Conversion | 6 | Zwei klare Handlungsaufrufe, Kontakt nur über LinkedIn (bewusst gewählt). V: Belege (Fotos) näher an den Aufruf bringen. |
| Performance | 10 | Lighthouse mobil 99–100, LCP 1,4–1,6 s, CLS ≤ 0,03, unter 140 KiB pro Seite. Rest: drei kleine CSS-Dateien blockieren das Rendern, Cache-Dauer bestimmt GitHub. |
| SEO | 8 | Lighthouse SEO 100, eindeutige Titel und Beschreibungen, Sitemap, strukturierte Daten. V: interne Links auf leere Seite. N: Ranking, Indexierung (Search Console fehlt). |
| Technik | 8 | Astro 7.3.5 statisch, typgeprüft, 28 Unit- und über 170 E2E-Tests. B: GitHubs Legacy-Jekyll-Build schlägt bei jedem Push fehl (Pages-Quelle falsch eingestellt). |
| Sicherheit | 7 | CSP per Meta mit Hashes, keine Drittanbieter, 0 bekannte Schwachstellen. W: GitHub Pages erlaubt keine eigenen HTTP-Header (HSTS, Frame-Schutz). V: keine Referrer-Policy, kein Dependabot. |
| Datenschutz | 7 | Kein Tracking, keine Cookies, Schriften selbst gehostet. B: öffentliche Altdatei `cortese-cv.html` nennt interne Werkzeugnamen (widerspricht «Arbeitgeber nur allgemein»). N: rechtliche Prüfung der Datenschutzerklärung. |
| Barrierefreiheit | 9 | axe WCAG 2.2 AA: 0 Verstösse, Lighthouse 100. V: Lizenzlink öffnet neues Fenster ohne Hinweis. |
| Mobile | 8 | Kein horizontales Scrollen, Touch-Ziele ≥ 44 px. W: Menüverhalten (siehe UX). |
| Betrieb | 6 | Automatisches Deployment mit Tests. B: kein Prüflauf für Pull Requests, keine automatischen Updates, veraltete Roadmap. |

## 2. Optimierungsplan

| Prio | Massnahme | Aufwand | Nutzen | Risiko | Status |
|---|---|---|---|---|---|
| P1 | Pages-Quelle auf «GitHub Actions» stellen | 1 min | Fehlerhafte Builds weg | keines | **offen, nur durch Inhaber möglich** |
| P1 | Altdatei `cortese-cv.html` entfernen | 1 min | keine internen Werkzeugnamen öffentlich | URL fällt weg | **wartet auf Freigabe** |
| P2 | «Wissen» nur verlinken, wenn Beiträge sichtbar sind (URL bleibt) | klein | keine Sackgasse | gering | umgesetzt |
| P2 | Fotos der Referenzobjekte auf der Startseite | klein | Belege sichtbar | gering | umgesetzt |
| P2 | Zielgruppe im Einstieg nennen | klein | schärfere Positionierung | keines | umgesetzt |
| P2 | Referenzliste neueste zuerst | klein | lesbarer Werdegang | keines | umgesetzt |
| P3 | Referrer-Policy per Meta | klein | weniger Datenabfluss an Fremdseiten | keines | umgesetzt |
| P3 | Mobiles Menü: Escape, Klick ausserhalb, Linkklick schliessen | klein | Bedienbarkeit | gering | umgesetzt |
| P3 | Hinweis «öffnet in neuem Fenster» am Lizenzlink | klein | Barrierefreiheit | keines | umgesetzt |
| P3 | Pull-Request-Prüflauf ohne Veröffentlichung, Dependabot | klein | sichere Updates | gering | umgesetzt |
| P4 | Eigene Domain mit Hosting, das Sicherheits-Header erlaubt | mittel | HSTS, Frame-Schutz | gering | offen |
| P4 | Fachbeiträge freigeben, dann «Wissen» automatisch sichtbar | Inhaber | Sichtbarkeit, SEO | keines | offen |
| P4 | Kritisches CSS einbetten | mittel | ~0,1–0,4 s geschätzt | CSP-Hashes | bewusst nicht umgesetzt: Nutzen bei Leistung 98–100 gering |

## 3. Umgesetzte Änderungen

- `src/lib/content.ts`: `hatSichtbareArtikel()`. Header, Footer, Startseite und 404-Seite zeigen «Wissen» nur, wenn
  sichtbare Beiträge existieren. `/wissen/` bleibt erreichbar. Die 404-Seite verlinkt neu «Projekte».
- Startseite: Zielgruppenzeile «Für Bauherren · Netzbetreiber · Ingenieurbüros · öffentliche Verwaltungen»;
  Fotogalerie «Referenzobjekte im Bild» im Projektabschnitt (Bilder werden verzögert geladen).
- `Referenzliste.astro`: Sortierung nach Beginnjahr absteigend, bei Gleichstand Reihenfolge aus `referenzen.json`.
- `Basis.astro`: `<meta name="referrer" content="strict-origin-when-cross-origin">`.
- `Header.astro`: kleines Skript schliesst das mobile Menü (Escape gibt den Fokus an «Menü» zurück).
- `Referenzbilder.astro`: unsichtbarer Hinweis «(öffnet in neuem Fenster)» für Screenreader.
- `.github/workflows/pages.yml`: Pull Requests werden gebaut und getestet, nicht veröffentlicht.
- `.github/dependabot.yml`: npm wöchentlich (gruppiert), GitHub Actions monatlich.
- Tests: 5 neue E2E-Tests, Navigationstest angepasst. Doku: TESTBERICHT, ROADMAP, BETRIEB.

Keine URL entfernt, keine Inhalte gelöscht, keine Historie verändert.

## 4. Vorher-nachher

Siehe [TESTBERICHT.md](TESTBERICHT.md), Abschnitt «Optimierungsrunde». Kurz: Leistung 98–100, alle anderen
Kategorien 100, vorher wie nachher; Startseite +2 KiB. Die Startseite-LCP streut über Wiederholungen zwischen 1,4 und
1,8 s – keine belastbare Veränderung.

## 5. Offene Punkte

- Pages-Quelle umstellen (P1) und Freigabe zum Löschen von `cortese-cv.html` (P1).
- Bildnachweise bestätigen: Rheinbrücke Fläsch und Lehnenbrücke Nasstobel als eigene Fotos? Plessurbrücke ist von
  jag9889 (CC BY-SA 4.0).
- Rechtliches unverändert offen: Impressum-Anschrift, Datenschutzerklärung prüfen lassen, Freigabe Arbeitgeber,
  Markenname «Pokémon», HSO-Jahr, Normenbezüge (SIA 205, 262, 269, 405, VSS).
- Fachbeiträge prüfen und freigeben.
