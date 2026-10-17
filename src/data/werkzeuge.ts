// Werkzeugkasten: selbst entwickelte Werkzeuge (mit KI-Unterstützung, Claude).
// Freigabe Alessandro Cortese vom 17.10.2026: Name und neutraler Zweck, ohne Preisanalyse Kanton.
// Keine Arbeitgeber-, Kunden- oder Projektdaten, keine Kennzahlen. Markennamen Dritter werden nicht verwendet.

export type Werkzeuggruppe = 'Offerte, Kosten, Abrechnung' | 'Fachrechner' | 'Assistenten und Chatbots';

export interface Werkzeug {
  name: string;
  gruppe: Werkzeuggruppe;
  zweck: string;
  /** Kurze sachliche Zusatzangabe, z. B. Sprachen oder Urheberschaft */
  zusatz?: string;
  privat?: boolean;
  /** Hervorgehobene Auszeichnung (Badge auf der Karte) */
  auszeichnung?: string;
  /** Interner Link auf eine Fallstudie */
  link?: { href: string; label: string };
  kompetenzen: string[];
}

export const werkzeuggruppen: Werkzeuggruppe[] = ['Offerte, Kosten, Abrechnung', 'Fachrechner', 'Assistenten und Chatbots'];

export const werkzeuge: Werkzeug[] = [
  {
    name: 'OffertIQ',
    gruppe: 'Offerte, Kosten, Abrechnung',
    zweck: 'Prüft Offerten strukturiert und hebt auffällige Positionen hervor. Die Beurteilung bleibt bei der Fachperson.',
    kompetenzen: ['digitalisierung-prozesse', 'ki-agenten'],
  },
  {
    name: 'CO-quit',
    gruppe: 'Offerte, Kosten, Abrechnung',
    zweck: 'Kostenschätzung für Tiefbauvorhaben, nachvollziehbar aufgebaut statt aus dem Bauch.',
    kompetenzen: ['digitalisierung-prozesse', 'tiefbau-infrastruktur'],
  },
  {
    name: 'NPK_WISP_TB-KoPa',
    gruppe: 'Offerte, Kosten, Abrechnung',
    zweck: 'Excel-Werkzeug auf Basis der NPK-Struktur für Tiefbauarbeiten im Netzbau.',
    kompetenzen: ['digitalisierung-prozesse', 'netzinfrastruktur-leitungsbau'],
  },
  {
    name: 'Prüf-Agent Projektabschluss',
    gruppe: 'Offerte, Kosten, Abrechnung',
    zweck: 'KI-Agent, der Unterlagen für den Projektabschluss gegen Vertrag und Ausmass prüft und Abweichungen mit Fundstelle meldet.',
    link: { href: '/projekte/konzept-pruefagent-abrechnung/', label: 'Zur Fallstudie' },
    kompetenzen: ['ki-agenten', 'digitalisierung-prozesse'],
  },
  {
    name: 'SIA-103 Honorar-Assistent',
    gruppe: 'Fachrechner',
    zweck: 'Plausibilisiert Ingenieurhonorare nach SIA 103.',
    kompetenzen: ['digitalisierung-prozesse', 'tiefbau-infrastruktur'],
  },
  {
    name: 'Füllrate-Rechner',
    gruppe: 'Fachrechner',
    zweck: 'Berechnet Füllraten von Rohranlagen.',
    kompetenzen: ['digitalisierung-prozesse', 'netzinfrastruktur-leitungsbau'],
  },
  {
    name: 'DLV-Entschädigungsrechner',
    gruppe: 'Fachrechner',
    zweck: 'Berechnet Entschädigungen nach DLV.',
    zusatz: 'Deutsch, Italienisch, Französisch',
    kompetenzen: ['netzinfrastruktur-leitungsbau', 'digitalisierung-prozesse'],
  },
  {
    name: 'Initialaufwand EBBE / Altlasten',
    gruppe: 'Fachrechner',
    zweck: 'Berechnet den Honoraraufwand für die Initialisierung von EBBE- und Altlasten-Projekten, auch wenn das Projekt danach nicht ausgeführt wird.',
    kompetenzen: ['tiefbau-infrastruktur', 'digitalisierung-prozesse'],
  },
  {
    name: 'Schachtassistent',
    gruppe: 'Assistenten und Chatbots',
    zweck: 'Digitaler Assistent rund um Schächte im Leitungs- und Netzbau.',
    zusatz: 'Version 4.6 · mehrsprachig · Urheber: Alessandro Cortese',
    kompetenzen: ['ki-agenten', 'netzinfrastruktur-leitungsbau'],
  },
  {
    name: 'Juristischer Chatbot',
    gruppe: 'Assistenten und Chatbots',
    zweck: 'Beantwortet Fragen zu Vergabe- und Baurecht aus dem Projektalltag auf Basis einer hinterlegten Wissensbasis.',
    kompetenzen: ['ki-agenten'],
  },
  {
    name: 'Trennungskompass',
    gruppe: 'Assistenten und Chatbots',
    zweck: 'Kontrollierter Workflow-Agent für Erstanfragen im Familienrecht, mit Eskalation an die Opferhilfe bei Hinweisen auf häusliche Gewalt.',
    zusatz: 'Abschlussarbeit HSO KI-Professional (KI-Agent) · Gruppenarbeit · 91/100 · fünf Sprachen',
    auszeichnung: 'Stärkste Arbeit im Kurs',
    link: { href: '/projekte/trennungskompass/', label: 'Zur Fallstudie' },
    kompetenzen: ['ki-agenten'],
  },
];
