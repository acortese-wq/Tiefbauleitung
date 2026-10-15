# Datenschutz und Sicherheit

> Diese Übersicht ist eine technische Checkliste. Sie ist **keine rechtliche Beurteilung** und begründet keine
> Konformität mit dem DSG. Die markierten Punkte sind juristisch zu klären.

## Datenbearbeitungen (Stand Oktober 2026)

| Bearbeitung | Daten | Zweck | Ort | Aufbewahrung |
|---|---|---|---|---|
| Seitenaufruf | IP, Zeit, URL, Browserkennung | Betrieb, Sicherheit | Infomaniak, Schweiz | ⚠ gemäss Hostingvertrag, offen |
| Kontaktformular (derzeit aus) | Name, E-Mail, Firma, Anliegen, Nachricht | Beantwortung | E-Mail-Postfach | ⚠ Löschfrist festlegen |
| Ratenbegrenzung (nur bei Formular) | IP-Adresse | Missbrauchsschutz | Arbeitsspeicher | max. 1 Stunde |
| Cookies, Analyse, Tracking | – | – | – | nicht vorhanden |
| Schriften, Bilder | – | – | eigener Server | – |
| Externe Einbettungen | – | – | – | nicht vorhanden (nur Links) |

## Checkliste DSG

- [x] Datenminimierung: keine Konten, keine Cookies, keine Analyse
- [x] Keine Drittanbieter-Einbettungen, Schriften lokal
- [x] Transparente Datenschutzerklärung als Entwurf, offene Punkte markiert
- [x] Kontaktformular nur mit Einwilligungshinweis, Daten nur per E-Mail, keine Datenbank
- [x] Keine Personendaten in Server-Protokollen der Anwendung
- [x] Keine sensiblen Testdaten (nur fiktive Beispielwerte in Tests)
- [ ] ⚠ Verantwortliche Person mit Postanschrift in Impressum und Datenschutzerklärung ergänzen
- [ ] ⚠ Impressumspflicht prüfen (abhängig von kommerziellem Angebot, Art. 3 Abs. 1 lit. s UWG)
- [ ] ⚠ Hostingvertrag und Auftragsbearbeitung mit Infomaniak prüfen, Log-Aufbewahrung eintragen
- [ ] ⚠ Vor Aktivierung des Formulars: E-Mail-Anbieter, Speicherort, Löschfrist dokumentieren
- [ ] ⚠ Datenschutzerklärung durch Fachperson prüfen lassen, Stand-Datum setzen
- [ ] ⚠ Nebenbeschäftigung und Inhalte mit dem Arbeitgeber abklären (Webseite, Werkzeuge, Fachbeiträge)

## Weitere Rechtsfragen

- ⚠ **Markenrecht «Pokémon»:** Der App-Name «Rechnen mit Pokémon» verwendet eine geschützte Marke. Für eine private,
  nicht öffentlich verfügbare App unkritischer; auf einer öffentlichen Webseite trotzdem klären oder umbenennen.
- ⚠ **Bilder Dritter:** Die App-Screenshots enthalten Emoji-Grafiken des Betriebssystems. Nutzung prüfen.
- ⚠ **Zeugnisauszüge:** Wörtliche Zitate aus Arbeitszeugnissen ohne Namen der Unterzeichnenden. Veröffentlichung ist
  Sache der zeugnisberechtigten Person; Einverständnis der Aussteller ist nicht nötig, aber höflich.
- ⚠ **Normenbezüge:** SIA 205, SIA 262, SIA 269, SIA 405 und VSS-Normen wurden als Grundlagen der Kompetenzfelder
  ergänzt und sind nicht durch Unterlagen belegt. Bitte fachlich bestätigen.

## Technische Sicherheitsmassnahmen

| Massnahme | Umsetzung | Geprüft |
|---|---|---|
| Content Security Policy | Pro Seite mit SHA-256-Hashes (Astro), ohne `unsafe-inline`; zusätzlich `frame-ancestors 'none'` als Header | E2E-Test |
| Sicherheits-Header | HSTS, `nosniff`, `X-Frame-Options: DENY`, Referrer-Policy, Permissions-Policy, COOP, CORP in `server.mjs` | E2E-Test |
| CSRF | Astro `security.checkOrigin`: POST mit fremder Herkunft → 403 | E2E-Test |
| Serverseitige Validierung | Länge, Format, erlaubte Werte, Steuerzeichen, Zeilenumbrüche (Header-Injection) | Unit-Tests |
| Spamschutz | Honeypot-Feld, HMAC-signierter Zeitstempel (min. 4 s, max. 2 h), max. 3 Links | Unit- und E2E-Tests |
| Rate Limiting | 5 Absendungen pro IP und Stunde, 429 mit `Retry-After` | Unit- und E2E-Tests |
| Request-Grösse | Body-Limit 32 KB (Node-Adapter) | Konfiguration |
| XSS | Keine `set:html` mit Nutzereingaben; Suchauszüge nur Text und `<mark>`; JSON-LD maskiert | Unit-Test, Code-Review |
| Pfad-Traversal | Statische Auslieferung durch Astro mit Pfadprüfung | E2E-Test |
| Admin | Keystatic nur lokal, nicht im Produktions-Build | Build-Ausgabe |
| Geheimnisse | Nur Umgebungsvariablen, `.env` in `.gitignore`, `.env.example` ohne Werte | Review |
| Abhängigkeiten | `npm audit`: 0 bekannte Schwachstellen am 15.10.2026; Versionen gepinnt | `npm audit` |
| Passwörter | Keine Benutzerkonten, daher kein Passwort-Hashing nötig | – |
| SQL-Injection | Keine Datenbank | – |
