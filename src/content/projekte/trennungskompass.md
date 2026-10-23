---
title: Trennungskompass
kurz: Abschlussarbeit HSO KI-Professional (KI-Agent), Gruppenarbeit. Ein kontrollierter Workflow-Agent für Erstanfragen im Familienrecht. Bewertet mit 91 von 100 Punkten, als stärkste Arbeit im Kurs.
art: demonstrator
zeitraum: 2026, Abschlussarbeit
rolle: Mitglied einer Vierergruppe
ergebnis: 91 von 100 Punkten, stärkste Arbeit im Kurs
technologie: [Workflow-Agent, Prompt-Engineering, n8n, Modellvergleich, Regressionstests]
kompetenzen: [ki-agenten]
bild: /bilder/trennungskompass
bildAlt: "Screenshot Trennungskompass: Startseite «Klarheit in einer schwierigen Zeit» zum Schweizer Scheidungs- und Familienrecht, Sprachwahl DE, FR, IT, EN, RU, Schaltflächen «Im Chat fragen» und «Mandatsanfrage ausfüllen»"
bildRahmen: tablet
reihenfolge: 0
---

> **Abschlussarbeit** im Zertifikatslehrgang KI-Professional (KI-Agent) der HSO Wirtschafts- und Informatikschule, 2026. **Gruppenarbeit** von vier Personen. Prototyp, nicht im produktiven Einsatz. Zahlen und Daten der beteiligten Kanzlei bleiben vertraulich.

## Ergebnis

Konzept 53 von 60, Präsentation 38 von 40, **total 91 von 100 Punkten**. Aus der Beurteilung der Kursleitung:

> «Herausragende Arbeit – die stärkste im Kurs.»

## Ausgangslage

Eine Anwaltskanzlei im Familienrecht erhält regelmässig Erstanfragen rund um Trennung und Scheidung. Ein grosser Teil davon wiederholt sich und bindet Zeit von Juristinnen und Juristen, die nicht verrechnet werden kann. Die Gruppe hat das Problem mit echten Daten der Kanzlei beziffert und mit der 5-Why-Methode geschärft.

## Lösung

Der Trennungskompass gibt Ratsuchenden eine verständliche Orientierung zu Scheidung, Unterhalt, Kindern und Vorsorge, gestützt auf Schweizer Rechtsquellen. Er ist als **kontrollierter Workflow-Agent** gebaut, nicht als autonomer Agent.

- **Chat in fünf Sprachen:** Deutsch, Französisch, Italienisch, Englisch und Russisch
- **Mandatsanfrage:** Wer anwaltliche Unterstützung braucht, gelangt direkt zum Anfrageformular der Kanzlei
- **Klare Rolle:** ausdrücklich eine Orientierungshilfe, keine Rechtsberatung und kein Ersatz für eine Anwältin oder einen Anwalt

## Architekturentscheide

- **Workflow statt Vollautonomie.** Im Rechtskontext wiegen Nachvollziehbarkeit und Haftungskontrolle schwerer als Flexibilität.
- **FAQ im System-Prompt statt RAG.** Die Wissensbasis passt ins Kontextfenster; eine Vektordatenbank hätte nur Komplexität ergänzt.
- **Bauen statt kaufen.** Eine Fertiglösung überzeugte im strukturierten Produkttest nicht.
- **Vorrangregeln im System-Prompt.** Acht Hierarchiestufen legen fest, welche Regel bei Konflikten gilt.
- **Eskalation bei Gefährdung.** Bei Hinweisen auf häusliche Gewalt leitet der Agent an die Opferhilfe weiter.
- **Prototyp mit n8n.** Die Anbindung an das CRM der Kanzlei ist im Prototyp als Excel-Export simuliert.

## Tests

Zwei Sprachmodelle (gpt-4.1-mini und GPT-5.5) wurden mit 18 Testfragen verglichen und iterativ verbessert. Ergebnis: Das kleinere Modell hielt Ausschlusskriterien ohne zusätzliche Prüfinstanz (Judge-Gate) nicht zuverlässig ein, bei der Quellentreue erreichte es 25 von 36 gegenüber 30 von 36 Punkten.

## Grenzen und offene Risiken

Von der Gruppe selbst benannt:

- Für einen Produktivbetrieb braucht es ein stärkeres Modell, einen Filter für Personendaten vor dem Modellaufruf und eine rechtlich geprüfte Vereinbarung zur Datenbearbeitung mit dem Anbieter.
- Der Datentransfer in die USA ist ein offenes Risiko.
- **Rechtsdrift:** Gesetzesänderungen machen die FAQ mit der Zeit falsch. Vorgesehen sind Regressionstests und eine monatliche Überprüfung durch Menschen; ob das reicht, muss sich in der Praxis zeigen.

## Übertragung auf den Tiefbau

Dieselben Prinzipien gelten für Agenten im Bauwesen: eine klar begrenzte Aufgabe, ein kontrollierter Ablauf, Vorrangregeln, Eskalation an die Fachperson, Tests mit festen Prüffragen und offen benannte Grenzen. Wie das bei Bauabrechnungen aussehen kann, zeigt die Fallstudie [Prüf-Agent für Bauabrechnungen](/projekte/konzept-pruefagent-abrechnung/).
