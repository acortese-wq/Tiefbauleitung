---
title: NIUcost – Kostenrechner Tiefbau
kurz: Planungs- und Kostenwerkzeug für Kostenvoranschläge im Leitungsbau. Leitungen und Schächte werden auf der Karte gezeichnet, die Kosten daraus nachvollziehbar nach Leistungsverzeichnis gerechnet.
art: demonstrator
zeitraum: 2026, laufend
rolle: Konzept, Fachlogik und Entwicklung mit Claude Code
technologie: [Claude Code, HTML, JavaScript, Leaflet, NPK]
kompetenzen: [tiefbau-infrastruktur, netzinfrastruktur-leitungsbau, digitalisierung-prozesse]
reihenfolge: 3
---

> Das Werkzeug ist **passwortgeschützt**. Es enthält Preise und Positionstexte eines Leistungsverzeichnisses, die nicht öffentlich sind. Zugang für ausgewählte Personen auf [Anfrage](/kontakt/).

## Ausgangslage

Ein Kostenvoranschlag im Leitungsbau entsteht oft aus Plänen, Tabellen und Erfahrungswerten. Menge, Tiefe, Oberfläche und Schächte hängen zusammen: Ändert sich ein Wert, ändert sich mehr als eine Position. Von Hand geht dabei leicht etwas verloren.

## Zielsetzung

Die Kosten sollen aus dem gezeichneten Projekt entstehen und bei jeder Änderung sofort neu gerechnet werden. Jede Zahl muss auf ihre Position, Menge und Regel zurückführbar sein.

## Vorgehensweise

Die Fachlogik ist deterministisch: Preise werden nicht geschätzt, sondern aus dem Leistungsverzeichnis übernommen. Fehlt für eine Leistung eine Position, erscheint sie als offene Position und wird nicht stillschweigend ergänzt. Das Werkzeug läuft vollständig im Browser, eine Projektdatei lässt sich sichern und wieder laden.

## Funktionen

- Leitungen, Schächte, Werklöcher und Sondagen auf Karte oder Plan zeichnen
- Schächte nach Bauart in echter Grösse, Grabenband und Aushubgruben als gestrichelte Linien
- Aushub, Verfüllung, Belag, Wiese und Pflästerung folgen der gewählten Oberfläche
- Mindestüberdeckung wird automatisch eingehalten und gemeldet
- Offene Positionen mit Preisvorschlag und Ampel für die Sicherheit
- Kostenvoranschlag, Projektbericht und Excel-Export in vier Sprachen
- Bedienung am Computer und am Smartphone, getestet auf Barrierefreiheit

## Erkenntnisse und Grenzen

Das Werkzeug ersetzt keine Fachbeurteilung. Es rechnet, was im Projekt eingetragen ist, und weist auf Lücken hin. Die Genauigkeit eines Kostenvoranschlags hängt von den Annahmen ab, die die Fachperson trifft. Zahlreiche automatische Tests prüfen die Rechenlogik gegen Referenzprojekte.
