// Zehn Einsatzfelder für KI in der Bauleitung, gestützt auf eigene Praxis, Vorlagen im KI-Labor und eigene Werkzeuge.
// Bewusst ohne Versprechen zu bestimmten Modellen: Die Felder gelten unabhängig vom Anbieter.

export interface Einsatzfeld {
  titel: string;
  text: string;
  tags: string[];
  link?: { href: string; label: string };
}

export const einsatzfelder: Einsatzfeld[] = [
  {
    titel: 'Leistungsverzeichnisse und Offerten prüfen',
    text: 'LV auf Vollständigkeit, Mengen und Einheiten prüfen; in Offerten Rechenfehler, Ausreisser und spekulative Einheitspreise finden.',
    tags: ['NPK', 'LV', 'Offertvergleich'],
    link: { href: '#lv-plausibilitaet', label: 'Zur Werkbank' },
  },
  {
    titel: 'Nachträge strukturiert beurteilen',
    text: 'Ist die Leistung schon abgegolten, eine Mehrmenge oder neu? Welche Unterlagen fehlen für einen nachvollziehbaren Preis?',
    tags: ['SIA 118', 'Nachtrag', 'Regie'],
    link: { href: '#nachtrag', label: 'Zur Werkbank' },
  },
  {
    titel: 'Protokolle aus Stichworten',
    text: 'Aus Notizen der Bausitzung ein gegliedertes Protokoll mit Pendenzen, Zuständigkeiten und Terminen machen.',
    tags: ['Bausitzung', 'Pendenzen', 'Traktanden'],
    link: { href: '#protokoll', label: 'Zur Werkbank' },
  },
  {
    titel: 'Ausmass und Rechnungen plausibilisieren',
    text: 'Mengen zwischen Ausmass, Vertrag und Rechnung abgleichen und auffällige Positionen markieren, als Vorprüfung für die Fachperson.',
    tags: ['Ausmass', 'Teilrechnung', 'Prüf-Agent'],
    link: { href: '#ausmass', label: 'Zur Werkbank' },
  },
  {
    titel: 'Werkleitungen koordinieren',
    text: 'Welche Leitung bleibt, wird geschützt, provisorisch umgelegt oder neu verlegt? Fragen an jeden Werkeigentümer vorbereiten.',
    tags: ['Werke', 'Bauphasen', 'Kostenfragen'],
    link: { href: '#werkleitungen', label: 'Zur Werkbank' },
  },
  {
    titel: 'Glasfaserausbau vorbereiten',
    text: 'Trassen vorprüfen: Bewilligungen, Querungen, Fragen des Strasseneigentümers und Unterlagen für das Leitungsgesuch.',
    tags: ['FTTH', 'Leitungsgesuch', 'Querungen'],
    link: { href: '#trasse', label: 'Zur Werkbank' },
  },
  {
    titel: 'Lange Dokumente erschliessen',
    text: 'Technische Berichte, Vorbemerkungen und Normtexte zusammenfassen, vergleichen und gezielt befragen, mit Quellenangabe zur Kontrolle.',
    tags: ['Technischer Bericht', 'Vorbemerkungen', 'Normen'],
    link: { href: '#dokument', label: 'Zur Werkbank' },
  },
  {
    titel: 'Verständlich kommunizieren',
    text: 'Baustelleninformationen für Anwohnende, Antworten an Behörden, Texte auf Deutsch und Italienisch, ohne Fachjargon.',
    tags: ['Anwohnende', 'Übersetzung', 'Tonalität'],
    link: { href: '#anwohner', label: 'Zur Werkbank' },
  },
  {
    titel: 'Risiken früh durchdenken',
    text: 'Vor der Startsitzung Baugrund, Termine, Verkehr, Umwelt und Schnittstellen systematisch abfragen und Massnahmen sammeln.',
    tags: ['Risiken', 'Bauprogramm', 'Startsitzung'],
    link: { href: '#risiken', label: 'Zur Werkbank' },
  },
  {
    titel: 'Eigene Assistenten bauen',
    text: 'Wiederkehrende Aufgaben in einen Assistenten oder ein Werkzeug fassen, mit klarer Aufgabe, festen Regeln und Tests.',
    tags: ['Agenten', 'Werkzeuge', 'Guardrails'],
    link: { href: '/projekte/#werkzeugkasten', label: 'Werkzeugkasten' },
  },
];
