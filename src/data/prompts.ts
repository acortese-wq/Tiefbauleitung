// Prompt-Vorlagen für das KI-Labor. Platzhalter in {{geschweiften Klammern}} werden im Browser durch die Eingaben ersetzt.
// Grundsatz: Die Vorlagen verlangen immer eine fachliche Prüfung und enthalten keine internen Daten.

export type Kategorie = 'vergabe' | 'ausfuehrung' | 'abrechnung' | 'netzbau' | 'kommunikation';

export const kategorieLabels: Record<Kategorie, string> = {
  vergabe: 'Ausschreibung und Vergabe',
  ausfuehrung: 'Bauleitung',
  abrechnung: 'Nachträge und Abrechnung',
  netzbau: 'Netzbau und Werkleitungen',
  kommunikation: 'Kommunikation',
};

export interface Feld {
  name: string;
  label: string;
  beispiel: string;
}

export interface PromptVorlage {
  id: string;
  titel: string;
  kategorie: Kategorie;
  zweck: string;
  felder: Feld[];
  vorlage: string;
  pruefen: string;
}

export const prompts: PromptVorlage[] = [
  {
    id: 'offertvergleich',
    titel: 'Offerten vergleichen und auffällige Preise finden',
    kategorie: 'vergabe',
    zweck: 'Bereitet den Preisvergleich mehrerer Unternehmerangebote vor, bevor die eigentliche Prüfung beginnt.',
    felder: [
      { name: 'projekt', label: 'Projekt', beispiel: 'Strassenkorrektion mit Werkleitungen, rund 400 m' },
      { name: 'anzahl', label: 'Anzahl Offerten', beispiel: '4' },
      { name: 'schwerpunkt', label: 'Worauf besonders achten?', beispiel: 'Aushub, Belag, Baustelleneinrichtung' },
    ],
    vorlage: `Du bist erfahrener Bauherrenvertreter im Schweizer Tiefbau und prüfst Offerten nach NPK.

Kontext: {{projekt}}. Mir liegen {{anzahl}} Offerten als Tabelle vor (NPK-Position, Text, Menge, Einheit, Einheitspreis je Anbieter).

Aufgabe:
1. Rechne Menge × Einheitspreis nach und melde Rechenfehler.
2. Markiere Einheitspreise, die mehr als 30 % vom Median abweichen, getrennt nach zu hoch und zu tief.
3. Suche Hinweise auf spekulative Preise: sehr tiefe Preise bei Positionen mit absehbaren Mehrmengen, hohe Preise bei Positionen mit absehbaren Mindermengen.
4. Liste fehlende oder unvollständig ausgefüllte Positionen.
5. Achte besonders auf: {{schwerpunkt}}.

Format: eine Tabelle pro Prüfpunkt, danach höchstens fünf Fragen, die ich den Anbietern stellen sollte.

Wichtig: Triff keinen Vergabeentscheid und bewerte keine Zuschlagskriterien. Das bleibt beim Bauherrn und folgt dem Vergaberecht.`,
    pruefen: 'Abweichungen sind Hinweise, keine Beweise. Vor einer Rückfrage die Ausschreibungsunterlagen und Vorbemerkungen selbst prüfen.',
  },
  {
    id: 'nachtrag',
    titel: 'Nachtrag eines Unternehmers prüfen',
    kategorie: 'abrechnung',
    zweck: 'Strukturiert die Prüfung, ob ein Nachtrag berechtigt ist und ob der Preis nachvollziehbar gebildet wurde.',
    felder: [
      { name: 'leistung', label: 'Nachgetragene Leistung', beispiel: 'Zusätzlicher Belagsabbruch, Belag bis 20 cm statt 10 cm' },
      { name: 'begruendung', label: 'Begründung des Unternehmers', beispiel: 'Belagsstärke im Bestand grösser als in der Ausschreibung angegeben' },
      { name: 'vertrag', label: 'Vertragsgrundlage', beispiel: 'Werkvertrag nach SIA 118, Einheitspreise nach NPK' },
    ],
    vorlage: `Du unterstützt eine örtliche Bauleitung bei der Prüfung eines Nachtrags im Schweizer Tiefbau.

Nachtrag: {{leistung}}
Begründung des Unternehmers: {{begruendung}}
Vertragsgrundlage: {{vertrag}}

Prüfe in dieser Reihenfolge:
1. Ist die Leistung bereits mit einer bestehenden Position oder den Vorbemerkungen abgegolten?
2. Handelt es sich um eine Mehrmenge einer bestehenden Position oder um eine neue Leistung?
3. Falls neue Leistung: Welche Unterlagen braucht es für eine nachvollziehbare Preisbildung (Preisanalyse, Bezug zu Vertragspreisen, Regieansätze)?
4. Welche Fakten muss die Bauleitung festhalten (Fotos, Ausmass, Datum, Protokolleintrag)?

Format: kurze Einschätzung pro Punkt, danach eine Checkliste der fehlenden Unterlagen.

Wichtig: Gib keine abschliessende Rechtsauskunft. Weise auf Stellen hin, an denen der Vertrag oder die Norm im Original nachzulesen ist.`,
    pruefen: 'Vertrag, Vorbemerkungen und SIA 118 im Original lesen. Die KI kennt deinen Werkvertrag nicht.',
  },
  {
    id: 'protokoll',
    titel: 'Bausitzungsprotokoll aus Stichworten',
    kategorie: 'ausfuehrung',
    zweck: 'Macht aus Notizen einer Bausitzung ein sauber gegliedertes Protokoll mit Pendenzen.',
    felder: [
      { name: 'projekt', label: 'Projekt', beispiel: 'Instandsetzung Brücke, Baumeister- und Belagsarbeiten' },
      { name: 'datum', label: 'Sitzungsdatum', beispiel: '17. Mai 2017' },
      { name: 'notizen', label: 'Stichworte aus der Sitzung', beispiel: 'Platte 1. Etappe betoniert; Lager eingebaut; Belag dicker als erwartet; Werkleitungsplan fehlt' },
    ],
    vorlage: `Du bist Protokollführer einer Bausitzung im Schweizer Tiefbau.

Projekt: {{projekt}}, Sitzung vom {{datum}}.
Stichworte: {{notizen}}

Erstelle ein Protokoll mit diesen Traktanden:
1. Genehmigung Protokoll der letzten Sitzung
2. Mitteilungen
3. Stand der Arbeiten, Bauprogramm, Termine, Planlieferung
4. Technische Belange, Qualität, Arbeitssicherheit
5. Administrative und finanzielle Belange (Unvorhergesehenes, Nachträge, Regie, Rechnungswesen)
6. Pendenzen
7. Nächste Sitzung

Regeln: sachlich, kurze Sätze, Schweizer Rechtschreibung ohne ß. Jede Pendenz mit Zuständigkeit (Kürzel) und Termin. Erfinde keine Inhalte; fehlt etwas, schreibe «offen».`,
    pruefen: 'Vor dem Versand selbst gegenlesen. Ein Protokoll hat Vertragswirkung, wenn niemand widerspricht.',
  },
  {
    id: 'ausmass',
    titel: 'Ausmass und Rechnung plausibilisieren',
    kategorie: 'abrechnung',
    zweck: 'Findet Unstimmigkeiten zwischen Ausmass, Vertragsmengen und Rechnung, bevor freigegeben wird.',
    felder: [
      { name: 'positionen', label: 'Welche Positionen?', beispiel: 'Aushub, Fundationsschicht, Belag AC T 16' },
      { name: 'vergleich', label: 'Womit vergleichen?', beispiel: 'Vertragsmengen und Planmasse' },
    ],
    vorlage: `Du prüfst als Bauleitung eine Teilrechnung im Schweizer Tiefbau.

Ich gebe dir das Ausmass und die Rechnung als Tabelle. Prüfe die Positionen {{positionen}} und vergleiche mit {{vergleich}}.

Aufgabe:
1. Stimmen Mengen und Preise zwischen Ausmass, Rechnung und Vertrag überein?
2. Welche Mengen weichen mehr als 10 % von der Vertragsmenge ab?
3. Passen zusammengehörige Mengen zueinander (z. B. Aushubvolumen zu Fläche und Tiefe, Belagsfläche zu Fundationsfläche)?
4. Gibt es doppelt abgerechnete Leistungen?

Format: Tabelle mit Position, Befund, Rückfrage an den Unternehmer.`,
    pruefen: 'Rechnungen nur mit anonymisierten Daten oder in einer vom Arbeitgeber freigegebenen KI prüfen.',
  },
  {
    id: 'werkleitungen',
    titel: 'Werkleitungen koordinieren',
    kategorie: 'netzbau',
    zweck: 'Bereitet eine Koordinationssitzung mit Werkeigentümern vor: Wer muss was, wann und auf wessen Kosten tun?',
    felder: [
      { name: 'projekt', label: 'Bauvorhaben', beispiel: 'Ersatzneubau einer Brücke mit Hilfsbrücke' },
      { name: 'werke', label: 'Betroffene Leitungen', beispiel: 'Wasser, Kanalisation, Strom, Telekommunikation, Glasfaser' },
      { name: 'phasen', label: 'Bauphasen', beispiel: 'Provisorium auf Hilfsbrücke, Abbruch, Neubau, definitive Lage' },
    ],
    vorlage: `Du bist erfahren in der Werkleitungskoordination bei Strassen- und Brückenbauten in der Schweiz.

Bauvorhaben: {{projekt}}
Betroffene Leitungen: {{werke}}
Bauphasen: {{phasen}}

Erstelle:
1. Eine Matrix Leitung × Bauphase: bleibt, wird geschützt, wird provisorisch umgelegt, wird definitiv verlegt.
2. Pro Werkeigentümer die Fragen für die Koordinationssitzung (Lage, Ausserbetriebnahme, Provisorium, Erweiterungsabsichten, Termine).
3. Eine Übersicht, welche Kostenfragen zu klären sind (Anpassung der Leitung, Schutz während der Bauzeit, Mitbenützung von Gräben), ohne selbst einen Kostenteiler festzulegen.
4. Risiken, die das Bauprogramm gefährden können.

Format: Tabellen, danach eine Pendenzenliste.`,
    pruefen: 'Wer welche Kosten trägt, regeln Bewilligungen, Verträge und das kantonale Recht im Einzelfall. Nicht aus der KI-Antwort übernehmen.',
  },
  {
    id: 'trasse',
    titel: 'Glasfasertrasse vorprüfen',
    kategorie: 'netzbau',
    zweck: 'Sammelt vor einem Leitungsgesuch die Punkte, die Strasseneigentümer und Bewilligungsbehörde erfahrungsgemäss prüfen.',
    felder: [
      { name: 'trasse', label: 'Trasse', beispiel: 'Erschliessung eines Weilers, 1.2 km entlang einer Kantonsstrasse' },
      { name: 'querungen', label: 'Besondere Stellen', beispiel: 'Bachquerung, Brücke, zwei Strassenquerungen, Rebmauern' },
    ],
    vorlage: `Du unterstützt eine Projektleitung im Glasfaserausbau (FTTH) in der Schweiz.

Trasse: {{trasse}}
Besondere Stellen: {{querungen}}

Erstelle eine Vorprüfung:
1. Welche Bewilligungen und Zustimmungen sind voraussichtlich nötig (Strasseneigentümer, Gewässer, Bahn, Natur- und Ortsbildschutz)?
2. Welche technischen Fragen stellt der Strasseneigentümer erfahrungsgemäss (Lage im Strassenkörper, Überdeckung, Querungsart, Wiederherstellung des Belags)?
3. Wo lohnt sich die Abstimmung mit anderen Werken oder geplanten Strassenprojekten?
4. Welche Unterlagen gehören ins Gesuch?

Format: Checkliste mit Spalten «Punkt», «zuständig», «Unterlage».`,
    pruefen: 'Anforderungen unterscheiden sich je nach Kanton und Gemeinde. Die zuständige Stelle früh anfragen.',
  },
  {
    id: 'anwohner',
    titel: 'Information an Anwohnende',
    kategorie: 'kommunikation',
    zweck: 'Schreibt eine verständliche, freundliche Baustelleninformation ohne Fachjargon.',
    felder: [
      { name: 'massnahme', label: 'Was wird gebaut?', beispiel: 'Erneuerung der Pflästerung im Dorfkern' },
      { name: 'zeitraum', label: 'Wann?', beispiel: '19. April bis 14. Juli, in zwei Etappen' },
      { name: 'einschraenkungen', label: 'Einschränkungen', beispiel: 'Strasse gesperrt, Umleitung, Bushaltestelle verlegt, Zugang zu Fuss jederzeit möglich' },
    ],
    vorlage: `Schreibe eine Baustelleninformation für Anwohnende und Gewerbe.

Massnahme: {{massnahme}}
Zeitraum: {{zeitraum}}
Einschränkungen: {{einschraenkungen}}

Regeln: höchstens 200 Wörter, einfache Sprache, Schweizer Rechtschreibung ohne ß, keine Abkürzungen. Zuerst was und wann, dann was das für die Leserin oder den Leser bedeutet, dann ein Dank für das Verständnis. Platzhalter für Kontaktangaben in eckigen Klammern lassen, nichts erfinden.`,
    pruefen: 'Termine, Umleitungen und Kontaktangaben selbst einsetzen und mit Polizei und Gemeinde abstimmen.',
  },
  {
    id: 'risiken',
    titel: 'Risiken vor Baubeginn',
    kategorie: 'ausfuehrung',
    zweck: 'Sammelt vor der Startsitzung die Risiken eines Bauvorhabens und mögliche Massnahmen.',
    felder: [
      { name: 'bauwerk', label: 'Bauwerk', beispiel: 'Lehnenbrücke an steilem Waldhang, Ersatz unter Verkehr' },
      { name: 'randbedingungen', label: 'Randbedingungen', beispiel: 'Rutschgebiet, einzige Zufahrt, Winterbeginn, Steinschlag' },
    ],
    vorlage: `Du bist erfahrener Bauleiter im Schweizer Kunst- und Strassenbau.

Bauwerk: {{bauwerk}}
Randbedingungen: {{randbedingungen}}

Erstelle eine Risikoliste für die Startsitzung:
1. Technische Risiken (Baugrund, Bestand, Bauverfahren)
2. Termin- und Witterungsrisiken
3. Risiken für Verkehr, Anstösser und Umwelt
4. Schnittstellen zu Dritten (Werke, Bahn, Behörden)

Pro Risiko: Auslöser, Auswirkung, frühes Warnzeichen, Massnahme, wer sie trägt. Format: Tabelle, sortiert nach Bedeutung.`,
    pruefen: 'Die Liste ersetzt keine Gefährdungsermittlung und kein Sicherheitskonzept. Mit Projektverfasser und Unternehmer durchgehen.',
  },
];
