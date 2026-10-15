# Expertenwebseite Alessandro Cortese

Persönliche Expertenwebseite zu Tiefbau, Netzinfrastruktur, Digitalisierung und KI-Agenten.
Gebaut mit [Astro](https://astro.build) (statisch generiert, Node-Server für Kontaktseite),
Inhaltspflege mit [Keystatic](https://keystatic.com), Volltextsuche mit [Pagefind](https://pagefind.app).

## Schnellstart

Voraussetzung: Node.js 22 (siehe `.nvmrc`).

```bash
npm ci                 # Abhängigkeiten installieren
npm run dev            # Entwicklungsserver auf http://localhost:4321
npm run admin          # Entwicklungsserver mit Admin-Oberfläche unter /keystatic
npm run build          # Typprüfung, Produktions-Build, Suchindex
npm start              # Produktionsserver (nach dem Build), Port über PORT
npm run build:pages    # statischer Build für GitHub Pages (Ordner dist/)
npm run deploy:pages   # nach acortese-wq.github.io veröffentlichen
```

## Tests

```bash
npm test               # Unit-Tests (Vitest)
npm run test:e2e       # End-to-End inkl. Barrierefreiheit (Playwright + axe), nach npm run build
npm run test:varianten # Kontaktformular aktiv und Entwurfsvorschau
npm run test:pages     # statischer GitHub-Pages-Build
npm run test:alle      # alles nacheinander (Server-Variante)
```

## Projektstruktur

```
src/
  content/            Inhalte als Markdown (Artikel, Projekte, Kompetenzen)
  content.config.ts   Inhaltsmodelle mit Validierung
  data/               Belegte Personendaten und Referenzprojekte
  components/         Wiederverwendbare UI-Komponenten
  layouts/Basis.astro Grundlayout mit SEO-Metadaten
  lib/                Logik (Validierung, Spamschutz, Ratenbegrenzung, Versand, SEO)
  pages/              Seiten und Routen
  styles/global.css   Designsystem (Tokens, Typografie, Komponenten)
public/               Bilder, Favicon, Open-Graph-Bild
server.mjs            Produktionsserver mit Sicherheits-Headern
keystatic.config.ts   Admin-Oberfläche
tests/                Unit- und End-to-End-Tests
docs/                 Konzept, Betrieb, Datenschutz, Inhalte, Testbericht, Roadmap
```

## Dokumentation

| Dokument | Inhalt |
|---|---|
| [docs/KONZEPT.md](docs/KONZEPT.md) | Analyse, Positionierung, Sitemap, Designsystem, Architekturentscheide, Datenmodell |
| [docs/BETRIEB.md](docs/BETRIEB.md) | Umgebungen, Variablen, Deployment auf Infomaniak, Backup, Rollback, Monitoring |
| [docs/DATENSCHUTZ-SICHERHEIT.md](docs/DATENSCHUTZ-SICHERHEIT.md) | DSG-Checkliste, Sicherheitsmassnahmen, offene juristische Punkte |
| [docs/INHALTE.md](docs/INHALTE.md) | Inhaltspflege mit Keystatic, Freigabeprozess, SEO- und Inhaltsstrategie |
| [docs/TESTBERICHT.md](docs/TESTBERICHT.md) | Tatsächlich durchgeführte Tests und Ergebnisse |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Bekannte Einschränkungen und nächste Schritte |

## Hinweis

`cortese-cv.html` ist die frühere einseitige Version und wird nicht mehr gepflegt.
