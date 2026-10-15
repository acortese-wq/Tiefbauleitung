# Inhalte pflegen

## Mit der Admin-Oberfläche (empfohlen)

1. `npm run admin` starten und http://localhost:4321/keystatic öffnen.
2. Unter **Fachbeiträge** oder **Projekte und Fallstudien** einen Eintrag anlegen oder bearbeiten.
3. Status auf **Entwurf** lassen, bis der Text fertig ist. Vorschau: http://localhost:4321/wissen/
4. Zum Veröffentlichen Status auf **Veröffentlicht** setzen, dann:
   ```bash
   git add src/content && git commit -m "Beitrag veröffentlichen: <Titel>" && git push
   ```
5. Auf dem Server neu bauen (siehe BETRIEB.md).

Die Admin-Oberfläche schreibt Markdown-Dateien ins Repository. Sie ist bewusst nicht im Internet erreichbar.

## Direkt in Dateien

- Fachbeiträge: `src/content/artikel/<slug>.md`
- Fallstudien: `src/content/projekte/<slug>.md`
- Kompetenzfelder: `src/content/kompetenzen/<slug>.md`
- Referenzprojekte: `src/data/referenzen.json`
- Person, Werdegang, Zeugnisse: `src/data/person.ts`

Der Build prüft alle Felder. Fehlt etwas oder ist eine Beschreibung zu lang, bricht er mit einer verständlichen
Meldung ab.

## Regeln für Inhalte

- **Nur Belegtes.** Keine erfundenen Kennzahlen, Kunden oder Ergebnisse. Fehlendes als Platzhalter kennzeichnen.
- **Projektart korrekt wählen:** beruflich, persönlich, Demonstrator oder Konzept.
- **Keine internen Informationen** aus dem aktuellen Arbeitsverhältnis ohne Freigabe.
- **Schweizer Orthografie**, kein «ß» (wird von einem Test geprüft).
- **Bilder** in `public/bilder/` als `.jpg` und `.webp` mit gleichem Namen, immer mit Alt-Text.

## SEO- und Inhaltsstrategie

### Suchbegriffe (Ausgangspunkte, Relevanz mit Search Console prüfen)

| Thema | Begriffe | Zielseite |
|---|---|---|
| KI im Bauwesen | KI im Bauwesen, KI Tiefbau, KI Bauabrechnung | /kompetenzen/ki-agenten/, Fachbeiträge |
| KI-Agenten | KI-Agenten Ingenieurwesen, KI-Agent Abrechnungsprüfung | /kompetenzen/ki-agenten/, Fallstudie Prüf-Agent |
| Netzbau | FTTH Bauherrenvertretung, Glasfaserausbau Schnittstellen, Leitungsbau Graubünden | /kompetenzen/netzinfrastruktur-leitungsbau/ |
| Tiefbau | Bauherrenvertreter Tiefbau, Bauleitung Kantonsstrassen, Brückeninstandsetzung | /kompetenzen/tiefbau-infrastruktur/ |
| Digitalisierung | Offertprüfung digital, Digitalisierung Bauprozesse | /kompetenzen/digitalisierung-prozesse/ |

### Umgesetzt
- Eindeutige Titel und Beschreibungen pro Seite, kanonische URLs, Open Graph mit eigenem Bild
- Semantische Überschriften (genau eine `h1` pro Seite, durch Tests geprüft)
- Strukturierte Daten nur mit belegten Angaben: `Person`, `Article`, `BreadcrumbList`
- XML-Sitemap, `robots.txt` (blockiert Indexierung, solange die Platzhalter-Domain aktiv ist)
- Interne Verlinkung zwischen Kompetenzen, Fallstudien, Referenzen und Beiträgen
- Inhalte ohne JavaScript vollständig lesbar

### Redaktionsplan (Vorschlag)
1. Die drei Entwürfe prüfen, ergänzen und freigeben.
2. Danach etwa ein Beitrag pro Monat, idealerweise aus eigener Erfahrung: ein konkreter Fall, eine Lehre, eine Grenze.
