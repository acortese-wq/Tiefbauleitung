# Einschränkungen und nächste Schritte

## Bekannte Einschränkungen

1. **Eigene Domain fehlt.** Veröffentlichung vorerst unter https://acortese-wq.github.io/Tiefbauleitung/ (GitHub Pages).
2. **Kontaktformular aus.** Kontakt nur über LinkedIn, bis eine geschäftliche E-Mail und SMTP bestehen.
3. **Rechtstexte unvollständig.** Postanschrift, Log-Aufbewahrung und Stand fehlen. Juristische Prüfung ausstehend.
4. **Fachbeiträge sind Entwürfe.** Sie müssen inhaltlich geprüft und freigegeben werden.
5. **HSO-Abschlussjahr unbekannt.** Auf der Profilseite als «Jahr offen» markiert.
6. **Erst drei Fotos von Referenzobjekten** (Rheinbrücke Fläsch, Lehnenbrücke Nasstobel, Plessurbrücke Litzirüti). Bildnachweise sind zu bestätigen; weitere eigene Fotos ergänzen (docs/INHALTE.md).
7. **Ratenbegrenzung nur im Arbeitsspeicher** (eine Instanz).
8. **Keine Mehrsprachigkeit.** Nur Deutsch.
9. **Admin nur lokal.** Inhalte pflegen braucht Node.js auf dem eigenen Rechner. Alternative siehe unten.

## Offene Fragen an Alessandro Cortese

- Welche Domain? (z. B. `cortese.ch`, `alessandro-cortese.ch`)
- Postanschrift für Impressum und Datenschutz, oder Impressumspflicht verneinen lassen?
- Freigabe des Arbeitgebers für Webseite, Werkzeugbeschreibungen und Fachbeiträge?
- Jahr des Abschlusses HSO KI-Professional?
- Stimmen die ergänzten Normenbezüge (SIA 205, 262, 269, 405, VSS)?
- App-Name «Rechnen mit Pokémon» beibehalten oder für die Webseite umbenennen?
- Schachtassistent: Darf er mit Namen und Urheberschaft genannt werden, obwohl er im beruflichen Umfeld eingesetzt wird?

Optimierungsrunde Oktober 2026: siehe [OPTIMIERUNG-2026-10.md](OPTIMIERUNG-2026-10.md).

## Nächste Schritte (priorisiert)

| Prio | Schritt | Aufwand |
|---|---|---|
| 1 | Domain festlegen, `SITE_URL` setzen, Deployment bei Infomaniak gemäss BETRIEB.md | 1–2 h |
| 1 | Offene Rechtsangaben ergänzen, Datenschutzerklärung prüfen lassen | extern |
| 1 | Drei Fachbeiträge prüfen und freigeben | 1–2 h |
| 2 | Geschäftliche E-Mail einrichten, Formular aktivieren, `npm run test:varianten` | 1 h |
| 2 | Echte Fotos (Baustellen, Porträt in Arbeitsumgebung) mit Bildrechten ergänzen | offen |
| 3 | Keystatic im GitHub-Modus mit Login, damit Inhalte im Browser gepflegt werden können | 2 h |
| 3 | Datenschutzfreundliche Statistik (z. B. selbst gehostet, ohne Cookies) nur falls nötig, mit Anpassung der Datenschutzerklärung | 2 h |
| 3 | Englisch und Italienisch (Astro i18n), zuerst Startseite und Profil | 1–2 Tage |
| 4 | Interaktiver Demonstrator «Prüf-Agent» mit fiktiven Beispieldaten | 2–3 Tage |
| 4 | KI-Wissensassistent auf Basis ausschliesslich freigegebener Seiteninhalte, mit Quellenangaben und klaren Grenzen | Konzept nötig |

Für einen KI-Assistenten gelten: keine vertraulichen Daten, Antworten nur aus freigegebenen Inhalten mit Quellenangabe,
klarer Hinweis auf Grenzen, Datenschutzprüfung des KI-Anbieters (Datenstandort, Auftragsbearbeitung).
