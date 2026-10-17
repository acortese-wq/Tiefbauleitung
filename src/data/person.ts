// Belegte Angaben aus Lebenslauf (2024), Arbeitszeugnissen und LinkedIn-Profil.
// Stelle seit 2025: allgemeine Aufgaben zusätzlich aus der Rollenbeschreibung des Arbeitgebers (intern, nicht
// veröffentlicht; keine internen Bezeichnungen, Stufen oder Namen übernehmen).
// Neue Angaben nur mit Quelle ergänzen. Nichts erfinden.

export const person = {
  name: 'Alessandro Cortese',
  vorname: 'Alessandro',
  beruf: 'Bauingenieur',
  rolle: 'Bauherrenvertreter Tiefbau und Access Project Manager',
  arbeitgeber: 'Swisscom AG',
  ort: 'Chur',
  region: 'Graubünden',
  linkedin: 'https://www.linkedin.com/in/alessandro-cortese-1846b5bb',
  linkedinLabel: 'linkedin.com/in/alessandro-cortese-1846b5bb',
  portrait: '/bilder/portrait.jpg',
};

export const kennzahlen = [
  { wert: '30+', label: 'Jahre im Tiefbau', quelle: 'Lehre als Tiefbauzeichner ab 1994' },
  { wert: '17', label: 'Jahre beim Tiefbauamt Graubünden', quelle: '2000–2005 und 2013–2025' },
  { wert: '2', label: 'Seiten im Netzbau', quelle: 'Strasseneigentümer 2021–2025 · Netzbetreiber seit 2025' },
];

export type Station = {
  von: string;
  bis: string;
  titel: string;
  organisation: string;
  punkte: string[];
};

export const werdegang: Station[] = [
  {
    von: 'Apr. 2025',
    bis: 'heute',
    titel: 'Access Project Manager / Bauherrenvertreter Tiefbau',
    organisation: 'Swisscom AG, Ostschweiz',
    punkte: [
      'Leitung und Steuerung von Projekten im Glasfaserausbau (FTTH) im Sinne der Bauherrschaft: Kosten, Qualität und Termine von Anfang bis Ende',
      'Bauüberwachung mit Generalunternehmer und Ausführungspartnern, Zwischen- und Endkontrollen, Verantwortung für die Ausbauqualität',
      'Ansprechstelle für die Anspruchsgruppen und deren Projektleitungen, Vertretung der Interessen des Netzbetreibers',
      'Vergabe-, Vertrags- und Nachtragsmanagement auf Basis SIA 118, NPK und Vergaberecht (IVöB/BöB)',
      'Baukostencontrolling sowie Rechnungs- und Abrechnungsprüfung',
      'Klärung von Kostenaufteilungen und Schnittstellen mit kantonalen und kommunalen Werkeigentümern',
      'Entwicklung eigener KI-Agenten zur Effizienzsteigerung',
    ],
  },
  {
    von: 'Okt. 2021',
    bis: 'Apr. 2025',
    titel: 'Leiter Projektierung / Bau',
    organisation: 'Tiefbauamt Graubünden, Bezirk 1 Chur',
    punkte: [
      'Fachliche und personelle Führung des Teams Projektierung und Bau mit vier Bauleitern',
      'Neu- und Ausbau von Verbindungsstrassen inkl. Mehrjahresplanung, baulicher Unterhalt der Kantonsstrassen',
      'Verantwortung für das Submissionswesen und Auftragsmanagement im Bezirk',
      'Prüfung der Schlussabrechnungen (Ausmass, Nachtragspreise, Teuerung)',
      'Pikett- und Lawinendienst',
    ],
  },
  {
    von: 'März 2013',
    bis: 'Sept. 2021',
    titel: 'Projektleiter / Bauleiter',
    organisation: 'Tiefbauamt Graubünden, Bezirk 1 Chur',
    punkte: [
      'Örtliche Bauleitung von Strassen-, Brücken- und Instandsetzungsprojekten',
      'Qualitätssicherung, Materialprüfungen und Koordination der Unternehmer',
      'Submissionsunterlagen, Offertprüfung, Kostenvoranschläge, Ausmass und Abrechnung',
    ],
  },
  {
    von: 'Jan. 2009',
    bis: 'Feb. 2013',
    titel: 'Konstrukteur / Bauleiter, Projektleiter Stv.',
    organisation: 'Casutt Wyrsch Zwicky AG, Chur',
    punkte: [
      'Sach- und Bauleitung im Verkehrswegebau (Strasse und Bahn) für Tiefbauamt GR, ASTRA und Rhätische Bahn',
      'Stellvertretende Projektleitung, Trassierung, Auflage- und Ausführungsprojekte',
    ],
  },
  {
    von: 'Jan. 2006',
    bis: 'Dez. 2008',
    titel: 'Projektleiter / Konstrukteur / Bauleiter',
    organisation: 'Straub AG, Chur / Ilanz',
    punkte: [
      'Projektierung, Submission und Bauleitung: Nationalstrassen, Haupt- und Verbindungsstrassen, Wasserversorgungen, Siedlungsentwässerungen',
      'Führung der Tiefbauabteilung am Standort Ilanz',
    ],
  },
  {
    von: 'Nov. 2000',
    bis: 'Dez. 2005',
    titel: 'Zeichner / Konstrukteur',
    organisation: 'Tiefbauamt Graubünden, Projektierung Hauptstrassen',
    punkte: [
      'Hauptstrassenprojekte mit AutoCAD von der Studie bis zum Auflageprojekt',
      'Planprüfung privater Ingenieurbüros, Bauwerksdokumentation, Unterstützung bei der Kostenüberwachung',
      'Betreuung und Ausbildung der Lernenden',
    ],
  },
];

export const ausbildung = [
  { zeit: '1994–1998', titel: 'Lehre als Tiefbauzeichner' },
  { zeit: '1998–1999', titel: 'Technische Berufsmatura' },
  { zeit: '2000–2001', titel: 'Grundlagen TS Informatik' },
  {
    zeit: '2002–2005',
    titel: 'Bauingenieurstudium HTW Chur',
    hinweis: 'Bau und Gestaltung, Vertiefung Ingenieurbau, berufsbegleitend',
  },
];

export const weiterbildung = [
  { zeit: '2008', titel: 'Lehrmeisterkurs' },
  { zeit: '2010', titel: 'Devisierungskurse' },
  { zeit: 'seit 2013', titel: 'Bauleiterausbildungen und Kurse Projektabwicklung' },
  { zeit: '2014', titel: 'Öffentliches Beschaffungswesen' },
  { zeit: '2016', titel: 'Arbeitstechnik und Zeitmanagement' },
  { zeit: '2022', titel: 'Beschaffung nach IVöB' },
  { zeit: '2022–2023', titel: 'Mitarbeiterführung Basis und Aufbau' },
  { zeit: '2022–2024', titel: 'Führungscoaching' },
  {
    zeit: '2026',
    titel: 'Zertifikatslehrgang KI-Professional (KI-Agent), HSO Wirtschafts- und Informatikschule',
    hinweis: 'Zertifikat Juli 2026 · Abschlussarbeit «Trennungskompass» (Gruppenarbeit), 91/100, stärkste Arbeit im Kurs',
  },
];

export const sprachen = [
  { sprache: 'Deutsch', niveau: 'Muttersprache' },
  { sprache: 'Italienisch', niveau: 'Sehr gute Kenntnisse in Wort und Schrift' },
  { sprache: 'Englisch', niveau: 'Kenntnisse in Wort und Schrift (First Certificate)' },
];

export const nebenamt = {
  titel: 'Prüfungsexperte Bauzeichner/in EFZ Ingenieurbau',
  seit: 'Juni 2000',
};

// Wörtliche Auszüge aus Arbeitszeugnissen. Nur Organisation und Jahr, keine Namen.
export const zeugnisse = [
  {
    text: 'Zusammengefasst erbringt Alessandro Cortese jederzeit gute Leistungen und erledigt die Aufgaben stets zu unserer vollsten Zufriedenheit.',
    quelle: 'Tiefbauamt Graubünden, Bezirk 1 Chur',
    art: 'Zwischenzeugnis 2022',
  },
  {
    text: 'Er bleibt auch in schwierigen Situationen sachlich und kooperativ. Darüber hinaus versucht er Lösungen zu finden, welche möglichst die Interessen aller Beteiligten berücksichtigen.',
    quelle: 'Tiefbauamt Graubünden, Bezirk 1 Chur',
    art: 'Zwischenzeugnis 2022',
  },
  {
    text: 'Wir würden Alessandro Cortese jederzeit wieder bei der CWZ AG herzlich willkommen heissen!',
    quelle: 'Casutt Wyrsch Zwicky AG',
    art: 'Arbeitszeugnis 2013',
  },
  {
    text: 'Seine Arbeitsweise ist sehr gewissenhaft, pflichtbewusst, genau und führte zu sehr guten Leistungen.',
    quelle: 'Straub AG',
    art: 'Arbeitszeugnis 2008',
  },
];

export const fachgebietLabels: Record<string, string> = {
  kunstbauten: 'Kunstbauten',
  strasse: 'Strasse',
  bahn: 'Bahn',
  wasser: 'Wasser',
  netz: 'Netzbau',
};
