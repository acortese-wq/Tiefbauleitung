# Designsystem «Planpapier bei Nacht»

Gilt für alle Seiten. Tokens und Grundkomponenten stehen in `src/styles/global.css`, Planzeichnungen in
`src/styles/plan.css`. Neue Komponenten verwenden diese Tokens statt freier Werte.

## Tokens

| Gruppe | Tokens | Verwendung |
|---|---|---|
| Flächen | `--nacht` #0a0f14 · `--tiefe` #0f1720 · `--panel` #142029 | Seite · Karten und Felder · Hover-Flächen |
| Linien | `--linie` #223240 · `--linie-hell` #2f4454 | Rahmen und Trennlinien |
| Text | `--text` #e8eef3 · `--text-ruhig` #a3b3c0 | Fliesstext · Nebeninformation (Kontrast über 4.5:1) |
| Akzente | `--eis` #8fd3ff · `--eis-stark` · `--eis-flaeche` · `--signal` #f2a65a | Links, Primärhandlung · Hover · aktive Fläche · Masslinien, Fokus |
| Status | `--erfolg` · `--fehler` · `--warnung` · `--info` | immer zusammen mit Text oder Symbol, nie Farbe allein |
| Helles Band | `--papier`, `--papier-text`, `--papier-ruhig`, `--papier-linie`, `--papier-akzent` | Abschnitte mit `.band-hell` |
| Abstände | `--raum-1` bis `--raum-9`: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 px | Innenabstand, Lücken, Abschnitte |
| Radien | `--radius-klein` 4 · `--radius` 6 · `--radius-gross` 10 · `--radius-rund` | Chips · Karten, Felder, Buttons · Dialoge · Pillen |
| Ebenen | `--schatten-1` · `--schatten-2` · `--schatten-3` | Linie · angehobene Karte · Menü, Dialog |
| Bewegung | `--dauer-kurz` 120 ms · `--dauer` 200 ms · `--dauer-lang` 320 ms · `--kurve` | Rückmeldung · Zustand · Einblenden |
| Fokus | `--fokus-farbe` (Signal) · `--fokus-abstand` 3 px | gilt global über `:focus-visible` |
| Schrift | `--f-display` Barlow Condensed · `--f-text` Source Sans 3 · `--f-mono` IBM Plex Mono | Titel · Text · Labels, Zahlen, Navigation |
| Grössen | `--s-0` 17 px · `--s-1` 20 px · `--s-2` bis `--s-4` fliessend | Text · Einleitung · Titel |

Zeilenlänge: Fliesstext höchstens 68 Zeichen (`main p`, `.prosa`). Zeilenhöhe Text 1.6, Titel 1.06.

## Komponenten und Zustände

| Komponente | Klassen | Zustände |
|---|---|---|
| Button | `.btn`, `.btn-ghost`, `.btn-klein` | Hover (hellere Fläche), Fokus (Signalrahmen), Gedrückt (`scale .97`), Deaktiviert (`:disabled` oder `aria-disabled`, 45 % Deckkraft), Lädt (`aria-busy="true"`, drehender Ring). Mindesthöhe 48 px, klein 40 px, auf Touch 44 px. Pro Bereich eine Primärhandlung. Eingesetzt: Kontaktformular (lädt und gesperrt beim Absenden), Gesetzesprüfung (Beispiel und Leeren gesperrt, solange eine PDF gelesen wird). |
| Karte | `.karte`, als Link `a.karte` | Hover hebt um 2 px an und zeigt `--schatten-2`, Gedrückt setzt zurück, Fokus mit Rahmen in Eisblau |
| Chip / Badge | `.chip`, `.chips`, `.badge-*` | Chip als Link mit Hover-Rahmen; Badges kennzeichnen Projektart mit Text |
| Hinweis | `.hinweis` (Warnung), `.hinweis-info`, `.hinweis-erfolg`, `.hinweis-fehler` | Art steht immer auch im Text, z. B. `<strong>Fehler:</strong>` |
| Eingabefeld | `.eingabe` an `input`, `select`, `textarea`; Fläche über `--eingabe-flaeche` (Standard `--nacht`, in dunklen Spalten `--tiefe`); Fehlertext `.feld-fehler` | 16 px Schrift, 44 px hoch, Hover-Rahmen, Fokus in Eisblau, Fehler (`aria-invalid="true"`, roter Rahmen plus Fehlertext mit `aria-describedby`), Deaktiviert (50 %). Beschriftungen bleiben komponentenspezifisch (Formular fett, Werkzeuge in Mono). |
| Navigation | Kopfzeile `.nav-gross`, Menü `.nav-klein` | aktive Seite `aria-current="page"` mit Eisfläche; «Kontakt» als einzige Schaltfläche; Menü unter 960 px, schliesst mit Esc, Klick daneben und Linkwahl |
| Brotkrumen | `Seitenkopf` mit `krumen` | sichtbar und als BreadcrumbList aus derselben Quelle |
| Dialog | Bildzoom | schliesst mit ×, Esc, Klick daneben; Fokus kehrt zum Auslöser zurück |
| Leer-, Lade-, Fehlerzustand | z. B. `.gp-leer`, `aria-busy` an der PDF-Ablage, `role="status"` | Leerzustand nennt den nächsten Schritt; Laden zeigt Fortschritt; Fehler nennen Ursache und Lösung |

## Regeln

- **Abstände** nur aus `--raum-*`; Abschnitte mit `.abschnitt` (fliessend 56 bis 104 px).
- **Raster** `.raster-2/3/4`; Spaltenzahl so wählen, dass keine Reihe mit einem einzelnen Element entsteht.
- **Bewegung** nur mit Zweck (Rückmeldung, Orientierung) und nur mit `prefers-reduced-motion: no-preference`;
  transformieren statt Grösse ändern; Seitenwechsel blenden weich über.
- **Klickflächen** mindestens 24 px (WCAG 2.2 AA), auf Touch 44 px; Textlinks bei Bedarf unsichtbar über `::after`
  vergrössern, damit der Fokusrahmen eng bleibt.
- **Bilder** mit Breite und Höhe, WebP mit JPG-Rückfall, `loading="lazy"` ausserhalb des ersten Bildschirms.
- **Sicherheit**: keine Inline-Styles im Markup (CSP), keine externen Schriften oder Skripte.
