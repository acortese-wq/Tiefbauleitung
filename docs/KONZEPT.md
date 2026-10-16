# Konzept

## 1. Analyse

### Ziel
Eine persönliche Expertenwebseite, die innert Sekunden zeigt, wer Alessandro Cortese ist, welche Fragen er im Tiefbau,
Netzbau und beim Einsatz von KI bearbeiten kann und warum ein fachlicher Austausch sinnvoll ist.

### Belegte Quellen
- Lebenslauf und Bewerbungsunterlagen (November 2024)
- Arbeitszeugnisse Tiefbauamt Graubünden (2003, 2005, 2022), Casutt Wyrsch Zwicky AG (2013), Straub AG (2007, 2008)
- LinkedIn-Profil (Abschnitt Erfahrung, Stand Oktober 2026)
- Angaben im Gespräch (HSO KI-Professional, Kinder-Apps, Werkzeuge)

### Wichtige Feststellungen
1. **Berufsbezeichnung «Bauingenieur»** auf ausdrücklichen Wunsch von Alessandro Cortese (16.10.2026). Das
   Bauingenieurstudium an der HTW Chur (2002–2005) erscheint ohne Abschlussangabe. Ein Diplomtitel («dipl.», «FH»,
   «Ing. FH») wird nirgends verwendet. Rechtliche Einschätzung siehe DATENSCHUTZ-SICHERHEIT.md.
2. **Arbeitgeber nur allgemein.** Auf Wunsch keine internen Projekte, Namen oder Werkzeugdetails aus dem
   aktuellen Arbeitsverhältnis. Projekte bei Swisscom erscheinen nicht in den Referenzen.
3. **Kontakt über LinkedIn.** Es gibt keine freigegebene E-Mail-Adresse. Das Kontaktformular ist vollständig gebaut,
   aber deaktiviert, bis eine geschäftliche Adresse und ein SMTP-Konto bestehen.
4. **Fachbeiträge als Entwürfe.** Drei Beiträge sind geschrieben, aber nicht freigegeben. Sie erscheinen nur in der
   Vorschau (`SHOW_DRAFTS=true`) und tragen dort `noindex`.

### Annahmen (nicht kritisch, dokumentiert)
- Zielsprache Deutsch (Schweiz), Mehrsprachigkeit später.
- Domain noch offen, Platzhalter `www.example.ch`. Solange er aktiv ist, verbietet `robots.txt` die Indexierung.
- Hosting bei Infomaniak mit Node.js.

## 2. Positionierung

**Kernaussage:** «Tiefbau verstehen. KI richtig einsetzen.»

Praxisorientierter Bauingenieur, der Infrastrukturwissen in Werkzeuge und KI-Agenten übersetzt. Kein KI-Guru:
Die Seite benennt Grenzen offen und trennt klar zwischen beruflicher Erfahrung, persönlichen Projekten und Konzepten.

**Zielgruppen:** Entscheidungsträger aus Bau und Infrastruktur, Telekommunikation und Netzbau, Bauherren und
Ingenieurbüros, Führungskräfte mit Interesse an praktischer KI.

## 3. Sitemap

```
/                               Startseite
/profil/                        Profil, Werdegang, Aus- und Weiterbildung, Zeugnisse
/kompetenzen/                   Übersicht
  /tiefbau-infrastruktur/
  /netzinfrastruktur-leitungsbau/
  /digitalisierung-prozesse/
  /ki-agenten/
/projekte/                      Fallstudien und 39 Referenzprojekte (filterbar)
  /bm-trainer/                  Persönliches Projekt
  /rechnen-mit-pokemon/         Persönliches Projekt
  /konzept-pruefagent-abrechnung/  Konzept
/wissen/                        Fachbeiträge
  /<beitrag>/
  /kategorie/<kategorie>/
  /schlagwort/<schlagwort>/
/suche/                         Volltextsuche
/kontakt/                       Kontakt (serverseitig gerendert)
/impressum/  /datenschutz/
/robots.txt  /sitemap-index.xml
/keystatic/                     Admin, nur lokal
```

## 4. Designsystem «Engineering meets Intelligence»

**Leitidee:** Planpapier bei Nacht. Dunkle, ruhige Fläche wie ein Plan im Leuchtkasten, eisblaue Linien für Netze
und Daten, helle Bänder für ruhiges Lesen. Strukturelemente stammen aus der Planungspraxis: Positionsnummern wie
im Leistungsverzeichnis, Koten, Masslinien, Planraster.

**Leitmotiv:** Querprofil eines Leitungsgrabens. Eine Glasfaser führt vom Rohrblock zum Hausanschluss und weiter in
ein Datennetz mit einem KI-Agenten. Infrastruktur unten, Intelligenz oben, verbunden durch eine Leitung.

| Token | Wert | Verwendung |
|---|---|---|
| `--nacht` | #0a0f14 | Seitenhintergrund |
| `--tiefe` / `--panel` | #0f1720 / #142029 | Karten, Flächen |
| `--text` / `--text-ruhig` | #e8eef3 / #a3b3c0 | Text |
| `--eis` | #8fd3ff | Akzent, Netze, Links, Primärknopf |
| `--signal` | #f2a65a | Koten, Hinweise, offene Angaben (sparsam) |
| `--papier` / `--papier-akzent` | #eef3f6 / #0a62a3 | Helle Bänder |

**Schriften** (lokal eingebunden, keine Übermittlung an Google): Barlow Condensed (Überschriften),
Source Sans 3 (Text), IBM Plex Mono (Labels, Koten).

**Bewegung:** Einmalige Zeichenanimation des Leitmotivs, kurzes Einblenden der Überschriften, begrenzte
Wiederholungen. Bei «Bewegung reduzieren» ist alles statisch.

**Barrierefreiheit:** Ziel WCAG 2.2 AA. Kontraste geprüft (axe), Skip-Link, sichtbarer Fokus, semantische
Überschriften, Mobil-Menü ohne JavaScript (`<details>`), Touch-Ziele ab 44 px.

## 5. Architekturentscheide

| # | Entscheid | Begründung | Verworfen |
|---|---|---|---|
| A1 | **Astro 7, statisch generiert** | Schnell, sicher, wenig Angriffsfläche. Inhalte ohne JavaScript lesbar. | Next.js + PostgreSQL: mehr Betrieb und Kosten ohne Mehrwert für eine persönliche Seite |
| A2 | **Node-Adapter, nur Kontaktseite serverseitig** | Formular-Token, Validierung, Ratenbegrenzung brauchen Server. Alles andere bleibt statisch. | Externe Formulardienste: Datenübermittlung an Dritte |
| A3 | **Inhalte als Markdown im Git** | Versioniert, prüfbar, einfaches Backup, kein Datenbankbetrieb | Headless-CMS als SaaS: Abhängigkeit, Datenstandort |
| A4 | **Keystatic im lokalen Modus** | Admin mit Formularen und Vorschau, aber nicht öffentlich erreichbar. Veröffentlichung per Git. | Öffentliche Admin-Route: Login und Angriffsfläche |
| A5 | **Pagefind** | Volltextsuche ohne Server und ohne Drittanbieter | Algolia: Datenübermittlung ins Ausland |
| A6 | **CSP mit Hashes (Astro) plus Sicherheits-Header (server.mjs)** | Kein `unsafe-inline`, Schutz vor XSS und Clickjacking | — |
| A7 | **Keine Analyse standardmässig** | Datenschutz und Einfachheit. Option dokumentiert in ROADMAP. | Google Analytics |
| A8 | **Pinned Versionen** | Astro 7.3.5, Node-Adapter 11.1.6 (bekannte Lücken bis 7.2.7 / 11.1.2 behoben), Release älter als zwei Wochen | Neueste Version am Tag des Builds |

## 6. Datenmodell

Definiert in `src/content.config.ts`, validiert beim Build mit Zod.

**artikel** (`src/content/artikel/*.md`): `title`, `description` (50–170 Zeichen), `datum`, `aktualisiert?`,
`kategorie` (Auswahl), `schlagwoerter[]`, `status` (`entwurf` | `veroeffentlicht`), Inhalt Markdown.

**projekte** (`src/content/projekte/*.md`): `title`, `kurz`, `art` (`beruflich` | `persoenlich` | `demonstrator` |
`konzept`), `zeitraum`, `rolle`, `technologie[]`, `kompetenzen[]` (IDs), `bild?`, `bildAlt?`, `reihenfolge`, `status`.

**kompetenzen** (`src/content/kompetenzen/*.md`): `title`, `kurz`, `bereich`, `reihenfolge`, `seit`,
`grundlagen[]`, `referenzFilter?`.

**referenzen** (`src/data/referenzen.json`): `id`, `name`, `arbeitgeber`, `bauherr?`, `zeitraum`, `rolle`,
`fachgebiete[]` (`kunstbauten` | `strasse` | `bahn` | `wasser` | `netz`).

Personendaten, Werdegang, Ausbildung und Zeugnisauszüge: `src/data/person.ts` (mit Quellenhinweis).

## 7. Schnittstellen

| Route | Methode | Beschreibung |
|---|---|---|
| `/kontakt/` | GET | Kontaktseite. Bei aktivem Formular mit signiertem Zeitstempel-Token. |
| `/kontakt/` | POST | `application/x-www-form-urlencoded`: `token`, `website` (Honeypot), `anliegen`, `name`, `email`, `firma?`, `nachricht`, `einwilligung=ja`. Antworten: 200 (gesendet), 422 (Validierung), 429 (Ratenlimit, mit `Retry-After`), 502 (Versandfehler), 503 (Formular deaktiviert), 403 (fremde Herkunft) |
| `/robots.txt` | GET | Indexierungsregeln, Sitemap-Verweis |
| `/sitemap-index.xml` | GET | Sitemap |
| `/pagefind/*` | GET | Suchindex (statisch) |
