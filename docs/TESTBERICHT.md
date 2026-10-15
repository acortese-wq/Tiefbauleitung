# Testbericht

Stand: 15. Oktober 2026. Alle Werte stammen aus tatsächlich ausgeführten Läufen in der Entwicklungsumgebung
(Linux, Node 22.22, Chromium 141 über Playwright 1.56.1). Nicht getestete Punkte sind am Ende aufgeführt.

## Zusammenfassung

| Prüfung | Werkzeug | Ergebnis |
|---|---|---|
| Typprüfung | `astro check` (47 Dateien) | 0 Fehler, 0 Warnungen |
| Produktions-Build | `astro build` + Pagefind | erfolgreich, 17 Seiten + Kontakt (SSR), 7 Seiten im Suchindex |
| Unit-Tests | Vitest | **28 bestanden** |
| End-to-End | Playwright, Desktop Chrome + Pixel 7 | **123 bestanden**, 1 übersprungen (Skip-Link nur Desktop) |
| End-to-End Varianten | Formular aktiv, Entwürfe sichtbar, CSRF | **8 bestanden** |
| GitHub-Pages-Build | Playwright gegen statischen Dateiserver, Desktop + Mobil: Status, Konsole, axe, keine Platzhalter, Suche, Canonical, robots | **40 bestanden** |
| Barrierefreiheit | axe-core, Tags WCAG 2.0/2.1/2.2 A und AA, alle 16 Seiten, Desktop und Mobil | 0 Verstösse (nach Korrektur von 2 Kontrastfehlern) |
| Abhängigkeiten | `npm audit` | 0 bekannte Schwachstellen |
| Lighthouse Startseite (mobil, simuliert) | Lighthouse 12.8.2 | Leistung 97, Barrierefreiheit 100, Best Practices 100, SEO 100* |
| Lighthouse /kompetenzen/ki-agenten/ | Lighthouse 12.8.2 | Leistung 98, Barrierefreiheit 100, Best Practices 100, SEO 100* |

\* SEO 100 mit einer Test-Domain gemessen. Mit der Platzhalter-Domain `www.example.ch` ergibt sich SEO 69, weil
`robots.txt` die Indexierung absichtlich verbietet.

Core Web Vitals (Lighthouse, simuliertes mobiles Netz, lokaler Server): LCP 2,1 s (Start) bzw. 1,8 s, CLS 0,029 bzw.
0,024, TBT 0 ms. Gesamtgewicht der Startseite rund 182 KiB. Werte im echten Betrieb können abweichen.

## Was die End-to-End-Tests abdecken

- Jede Seite: Status 200, genau eine `h1`, Titel, Meta-Beschreibung über 50 Zeichen, Canonical, **keine Konsolen-,
  CSP- oder Netzwerkfehler**, kein horizontales Scrollen (Desktop und Mobil)
- Navigation Desktop und Mobil inkl. `aria-current`
- Crawler über alle internen Links ab der Startseite: keine defekten Links
- Filter der Referenzprojekte (39 Einträge, Filter Bahn ergibt 1)
- Volltextsuche mit Treffern und leerem Ergebnis
- 404-Seite mit Status 404
- Sicherheits-Header, CSP ohne `unsafe-inline`, Pfad-Traversal abgewiesen
- Formular deaktiviert: Kontaktseite statisch, POST wird nicht verarbeitet
- CSRF (Formular aktiv): POST mit fremder Herkunft → 403
- Formular aktiv: Barrierefreiheit, Fehlermeldungen mit erhaltenen Eingaben, Versandfehler (502) bei nicht
  erreichbarem Mailserver, Honeypot still verworfen, Ratenbegrenzung → 429
- Entwürfe: sichtbar nur in der Vorschau, mit Hinweis und `noindex`; Kategorie- und Schlagwortseiten
- `robots.txt` und Sitemap inkl. Kontaktseite

## Während der Prüfung gefundene und behobene Fehler

1. Kontrast der Platzhalter-Markierung auf hellen Flächen (1,65:1) → angepasst
2. Kontrast der dekorativen Bereichsnummern (1,78:1) → angepasst
3. Audit: kritische Lücken in Astro ≤ 7.2.7 und Node-Adapter ≤ 11.1.2 → auf 7.3.5 / 11.1.6 aktualisiert
4. Typkonflikt zwischen axe und Playwright → Version von `playwright-core` vereinheitlicht

## Nicht getestet / offen

- **Echter E-Mail-Versand**: kein SMTP-Konto vorhanden. Nur der Fehlerfall ist getestet.
- **Betrieb bei Infomaniak**: kein Zugang. Deployment, HTTPS, HSTS-Wirkung und Uptime-Monitoring ungetestet.
- **Andere Browser**: nur Chromium. Firefox und Safari (insbesondere iOS) nicht geprüft.
- **Manuelle Barrierefreiheit**: Screenreader-Test (VoiceOver, NVDA) nicht durchgeführt. axe deckt nur einen Teil
  von WCAG automatisch ab.
- **Keystatic**: Oberfläche lädt und listet die Inhalte. Anlegen und Speichern eines Eintrags nicht automatisiert getestet.
- **Lasttest**: nicht durchgeführt.
- **Backup und Wiederherstellung**: Ablauf dokumentiert, aber nicht geübt.
