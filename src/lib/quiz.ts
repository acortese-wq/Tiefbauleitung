// Netzbau-Quiz: Rundenauswahl, Bewertung und Rechengenerator. Läuft vollständig im Browser, ohne Server.

export const STUFEN = [
  { id: 'anfaenger', titel: 'Anfänger', text: 'Begriffe und Grundlagen des Netzbaus', sekunden: 45 },
  { id: 'praktiker', titel: 'Praktiker', text: 'Ausführung, Bauleitung und Baustelle', sekunden: 60 },
  { id: 'experte', titel: 'Experte', text: 'Technik in der Tiefe: Messung, Bemessung, Details', sekunden: 75 },
  { id: 'bhv', titel: 'BHV', text: 'Bauherrenvertretung: Vertrag, Vergabe, Kosten, Recht', sekunden: 90 },
] as const;
export type Stufe = (typeof STUFEN)[number]['id'];

export const KATEGORIEN = {
  netzaufbau: 'Netzaufbau FTTH',
  graben: 'Graben und Kabelschutzrohre',
  schacht: 'Schächte und Hausanschluss',
  recht: 'Normen und Recht',
  werkleitungen: 'Werkleitungen und Koordination',
  vergabe: 'Ausschreibung und Vergabe',
  messtechnik: 'Messtechnik und Abnahme',
  sicherheit: 'Sicherheit und Umwelt',
  kosten: 'Kosten, Ausmass und Regie',
} as const;
export type Kategorie = keyof typeof KATEGORIEN;

/** «kosten» ist der Spezialbereich Kostenprüfung, Ausmassprüfung und Regiekontrolle. */
export type Bereich = 'alle' | 'kosten';
export type Schema = 'ftth' | 'schacht' | 'muffe' | 'graben' | 'hausanschluss';

export interface Antwort {
  text: string;
  richtig: boolean;
}

export interface Frage {
  id: string;
  kategorie: Kategorie;
  stufe: Stufe;
  typ: 'einfach' | 'mehrfach' | 'wahr-falsch';
  frage: string;
  antworten: Antwort[];
  erklaerung: string;
  /** Schema im Planstil, auf das sich die Frage bezieht */
  bild?: Schema;
  /** Norm oder Gesetz, nur wenn gesichert */
  quelle?: string;
  /** Eigener Hinweis zum KI-Potenzial, sonst gilt der Text der Kategorie */
  ki?: string;
  /** Vom Rechengenerator erzeugt */
  generiert?: boolean;
}

/** Wo KI in diesem Fachgebiet heute konkret hilft. Die Beurteilung bleibt immer bei der Fachperson. */
export const KI_POTENZIAL: Record<Kategorie, { text: string; href?: string }> = {
  netzaufbau: { text: 'Ein KI-Assistent prüft Netzpläne und Faserbelegungen gegen feste Regeln, etwa Reserven je Ausbauetappe, und meldet Abweichungen mit Fundstelle.' },
  graben: { text: 'KI ordnet datierte Baustellenfotos den Ausmasspositionen zu und zeigt vor dem Eindecken an, wo Nachweise fehlen.', href: '/ki-labor/werkbank/#ausmass' },
  schacht: { text: 'KI gleicht Schachtprotokolle und Fotos mit dem Plan ab und findet fehlende Angaben wie Deckelklasse, Rohrbelegung oder Kabelreserve.' },
  recht: { text: 'KI fasst Normen und Vertragsklauseln zusammen und nennt die Fundstelle. Die rechtliche Beurteilung bleibt bei der Fachperson.', href: '/ki-labor/werkbank/#dokument' },
  werkleitungen: { text: 'KI führt Werkleitungsauskünfte zusammen und markiert Konflikte und Querungen, bevor gegraben wird.', href: '/ki-labor/werkbank/#werkleitungen' },
  vergabe: { text: 'KI vergleicht Offerten Position für Position und markiert Ausreisser und Spekulationspreise.', href: '/ki-labor/werkbank/#offertvergleich' },
  messtechnik: { text: 'KI wertet Messprotokolle aus, vergleicht Dämpfungswerte mit den Vorgaben und listet Auffälligkeiten für die Abnahme.' },
  sicherheit: { text: 'KI erstellt aus Stichworten Gefährdungs- und Checklisten für die Baustelle. Die Verantwortung bleibt bei der Bauleitung.', href: '/ki-labor/werkbank/#risiken' },
  kosten: { text: 'Ein Prüf-Agent rechnet Rechnungen nach, gleicht Regierapporte mit dem Bautagebuch ab und findet Doppelverrechnungen.', href: '/projekte/konzept-pruefagent-abrechnung/' },
};

export const PUNKTE_RICHTIG = 100;
export const BONUS_MAX = 50;
export const BESTANDEN_AB = 70;
export const FRAGEN_PRO_RUNDE = 10;

/** Reproduzierbarer Zufall (mulberry32), damit Tests und Generator nachvollziehbar sind. */
export function zufallsgenerator(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function mische<T>(liste: readonly T[], zufall: () => number): T[] {
  const kopie = [...liste];
  for (let i = kopie.length - 1; i > 0; i--) {
    const j = Math.floor(zufall() * (i + 1));
    [kopie[i], kopie[j]] = [kopie[j], kopie[i]];
  }
  return kopie;
}

/** Antworten mischen; bei Wahr/Falsch bleibt die gewohnte Reihenfolge. */
export function mischeAntworten(frage: Frage, zufall: () => number): Frage {
  return frage.typ === 'wahr-falsch' ? frage : { ...frage, antworten: mische(frage.antworten, zufall) };
}

/**
 * Stellt eine Runde zusammen: ausgewogen über die Kategorien der gewählten Stufe.
 * Im Spezialbereich Kosten kommen mindestens vier Rechenaufgaben aus dem Generator dazu,
 * in der gemischten Runde eine. Reicht der Pool nicht, füllt der Generator auf.
 */
export function waehleRunde(pool: readonly Frage[], stufe: Stufe, bereich: Bereich, zufall: () => number, anzahl = FRAGEN_PRO_RUNDE): Frage[] {
  const generiert = bereich === 'kosten' ? 4 : 1;
  const passend = pool.filter((f) => f.stufe === stufe && (bereich === 'alle' || f.kategorie === 'kosten'));
  const gruppen = new Map<Kategorie, Frage[]>();
  for (const f of mische(passend, zufall)) gruppen.set(f.kategorie, [...(gruppen.get(f.kategorie) ?? []), f]);
  const reihenfolge = mische([...gruppen.keys()], zufall);
  const auswahl: Frage[] = [];
  while (auswahl.length < anzahl - generiert && reihenfolge.some((k) => gruppen.get(k)?.length)) {
    for (const k of reihenfolge) {
      const f = gruppen.get(k)?.shift();
      if (f && auswahl.length < anzahl - generiert) auswahl.push(f);
    }
  }
  for (let nr = 0; auswahl.length < anzahl; nr++) auswahl.push(generiere(stufe, zufall, nr));
  return mische(auswahl, zufall).map((f) => mischeAntworten(f, zufall));
}

export function istRichtig(frage: Frage, gewaehlt: readonly number[]): boolean {
  const soll = frage.antworten.flatMap((a, i) => (a.richtig ? [i] : []));
  return soll.length === gewaehlt.length && soll.every((i) => gewaehlt.includes(i));
}

/** Sekunden je Frage im Prüfungsmodus; Rechenaufgaben erhalten 30 Sekunden mehr. */
export function zeitlimit(frage: Frage): number {
  const basis = STUFEN.find((s) => s.id === frage.stufe)?.sekunden ?? 60;
  return basis + (frage.generiert ? 30 : 0);
}

/** 100 Punkte je richtige Antwort, im Prüfungsmodus bis 50 Bonuspunkte für verbleibende Zeit (Anteil 0 bis 1). */
export function punkte(richtig: boolean, restzeitAnteil?: number): number {
  if (!richtig) return 0;
  const bonus = restzeitAnteil === undefined ? 0 : Math.round(BONUS_MAX * Math.min(1, Math.max(0, restzeitAnteil)));
  return PUNKTE_RICHTIG + bonus;
}

export interface Auswertung {
  richtig: number;
  gesamt: number;
  prozent: number;
  bestanden: boolean;
  urteil: string;
  jeKategorie: { kategorie: Kategorie; titel: string; richtig: number; gesamt: number }[];
}

export function auswerten(ergebnisse: readonly { frage: Frage; richtig: boolean }[]): Auswertung {
  const richtig = ergebnisse.filter((e) => e.richtig).length;
  const gesamt = ergebnisse.length;
  const prozent = gesamt ? Math.round((richtig / gesamt) * 100) : 0;
  const kat = new Map<Kategorie, { richtig: number; gesamt: number }>();
  for (const e of ergebnisse) {
    const k = kat.get(e.frage.kategorie) ?? { richtig: 0, gesamt: 0 };
    kat.set(e.frage.kategorie, { richtig: k.richtig + (e.richtig ? 1 : 0), gesamt: k.gesamt + 1 });
  }
  const urteil =
    prozent >= 90 ? 'Ausgezeichnet. Sie wissen, wovon auf der Baustelle die Rede ist.'
    : prozent >= BESTANDEN_AB ? 'Bestanden. Solides Fachwissen mit wenigen Lücken.'
    : prozent >= 50 ? 'Gute Grundlage, mit Luft nach oben. Die Erklärungen helfen beim nächsten Mal.'
    : 'Weiterüben lohnt sich. Jede Erklärung ist ein kleines Stück Praxiswissen.';
  return {
    richtig,
    gesamt,
    prozent,
    bestanden: prozent >= BESTANDEN_AB,
    urteil,
    jeKategorie: [...kat].map(([kategorie, w]) => ({ kategorie, titel: KATEGORIEN[kategorie], ...w })),
  };
}

// ---------------------------------------------------------------------------
// Rechengenerator: Aufgaben mit fiktiven Zahlen und exakt berechneter Lösung

/** Zahl im Schweizer Format, z. B. 2’318.40 */
export function zahl(n: number, stellen = 2): string {
  return n.toLocaleString('de-CH', { minimumFractionDigits: stellen, maximumFractionDigits: stellen });
}
export const chf = (n: number) => `CHF ${zahl(n)}`;

const runde = (n: number, stellen = 2) => Math.round(n * 10 ** stellen) / 10 ** stellen;
const zwischen = (zufall: () => number, min: number, max: number, schritt: number) =>
  runde(min + Math.floor(zufall() * (Math.round((max - min) / schritt) + 1)) * schritt, 2);

interface Rechnung {
  typ: string;
  frage: string;
  richtig: string;
  falsch: string[];
  erklaerung: string;
}

type Vorlage = (zufall: () => number) => Rechnung;

const HINWEIS = 'Fiktive Zahlen.';

const VORLAGEN: Record<string, Vorlage> = {
  rohrmeter: (z) => {
    const l = zwischen(z, 40, 260, 5);
    const n = [2, 3, 4, 6, 8][Math.floor(z() * 5)];
    const m = l * n;
    return {
      typ: 'rohrmeter',
      frage: `Eine Trasse ist ${zahl(l, 0)} m lang, im Rohrblock liegen ${n} Kabelschutzrohre. Wie viele Rohrmeter sind abzurechnen?`,
      richtig: `${zahl(m, 0)} m`,
      falsch: [`${zahl(l, 0)} m`, `${zahl(l * (n - 1), 0)} m`, `${zahl(m * 2, 0)} m`],
      erklaerung: `Rohrmeter = Trassenlänge × Anzahl Rohre = ${zahl(l, 0)} m × ${n} = ${zahl(m, 0)} m. ${HINWEIS}`,
    };
  },
  belag: (z) => {
    const l = zwischen(z, 20, 140, 0.5);
    const b = zwischen(z, 0.4, 0.8, 0.05);
    const u = [0.1, 0.15, 0.2][Math.floor(z() * 3)];
    const f = runde(l * (b + 2 * u));
    return {
      typ: 'belag',
      frage: `Ein Graben ist ${zahl(l, 1)} m lang und ${zahl(b)} m breit. Der Belag wird beidseitig je ${zahl(u * 100, 0)} cm über die Grabenbreite hinaus ersetzt. Welche Belagsfläche ergibt sich?`,
      richtig: `${zahl(f)} m²`,
      falsch: [`${zahl(runde(l * b))} m²`, `${zahl(runde(l * (b + u)))} m²`, `${zahl(runde(l * (b + 4 * u)))} m²`],
      erklaerung: `Fläche = Länge × (Grabenbreite + 2 × Überstand) = ${zahl(l, 1)} m × (${zahl(b)} m + 2 × ${zahl(u)} m) = ${zahl(f)} m². ${HINWEIS}`,
    };
  },
  aushub: (z) => {
    const l = zwischen(z, 20, 120, 0.5);
    const b = zwischen(z, 0.4, 0.8, 0.05);
    const t = zwischen(z, 0.6, 1.4, 0.05);
    const v = runde(l * b * t);
    return {
      typ: 'aushub',
      frage: `Graben: ${zahl(l, 1)} m lang, ${zahl(b)} m breit, ${zahl(t)} m tief. Laut Vertrag wird der Aushub nach theoretischem Profil in festem Zustand abgerechnet. Welche Menge gilt?`,
      richtig: `${zahl(v)} m³`,
      falsch: [`${zahl(runde(v * 1.25))} m³`, `${zahl(runde(l * b))} m³`, `${zahl(runde(l * t))} m³`],
      erklaerung: `Volumen fest = Länge × Breite × Tiefe = ${zahl(l, 1)} × ${zahl(b)} × ${zahl(t)} = ${zahl(v)} m³. Ein Auflockerungsfaktor betrifft das lose Volumen für den Abtransport, nicht das Ausmass in festem Zustand. ${HINWEIS}`,
    };
  },
  rechnung: (z) => {
    const m = zwischen(z, 60, 480, 0.5);
    const ep = zwischen(z, 11, 49, 0.05);
    const b = runde(m * ep);
    // Typische Fehler: Zahlendreher bei Hunderter und Zehner, Komma verschoben, Nachkommastelle der Menge vergessen
    const s = Math.floor(b).toString();
    const dreher = s.length >= 3 && s.at(-2) !== s.at(-3) ? Number(s.slice(0, -3) + s.at(-2) + s.at(-3) + s.at(-1)) + (b - Math.floor(b)) : b + 90;
    return {
      typ: 'rechnung',
      frage: `Rechnungsposition: ${zahl(m, 1)} m Kabelschutzrohr verlegen à ${chf(ep)} pro m. Welcher Betrag ist korrekt (ohne MWST)?`,
      richtig: chf(b),
      falsch: [chf(runde(dreher)), chf(runde(b / 10)), chf(runde(Math.floor(m) * ep))],
      erklaerung: `Betrag = Menge × Einheitspreis = ${zahl(m, 1)} × ${chf(ep)} = ${chf(b)}. Typische Fehler sind Zahlendreher, verschobene Kommas und gerundete Mengen. ${HINWEIS}`,
    };
  },
  regie: (z) => {
    const p = [2, 3, 4][Math.floor(z() * 3)];
    const h = zwischen(z, 3.5, 9, 0.5);
    const satz = zwischen(z, 68, 96, 1);
    const hm = zwischen(z, 2, 8, 0.5);
    const msatz = zwischen(z, 95, 180, 5);
    const total = runde(p * h * satz + hm * msatz);
    return {
      typ: 'regie',
      frage: `Regierapport: ${p} Personen je ${zahl(h, 1)} h à ${chf(satz)}, dazu Bagger ${zahl(hm, 1)} h à ${chf(msatz)}. Welcher Regiebetrag ist richtig?`,
      richtig: chf(total),
      falsch: [chf(runde(h * satz + hm * msatz)), chf(runde(p * h * satz + p * hm * msatz)), chf(runde(p * (h + hm) * satz))],
      erklaerung: `Personal ${p} × ${zahl(h, 1)} h × ${chf(satz)} = ${chf(p * h * satz)}, Bagger ${zahl(hm, 1)} h × ${chf(msatz)} = ${chf(hm * msatz)}, zusammen ${chf(total)}. Die Maschine wird nur einmal verrechnet, nicht pro Person. ${HINWEIS}`,
    };
  },
  mehrmenge: (z) => {
    const v = zwischen(z, 200, 900, 10);
    const faktor = [0.82, 0.88, 1.12, 1.18, 1.24, 1.31][Math.floor(z() * 6)];
    const a = runde(v * faktor, 0);
    const proz = runde(((a - v) / v) * 100, 1);
    const vorz = (n: number) => `${n > 0 ? '+' : ''}${zahl(n, 1)} %`;
    return {
      typ: 'mehrmenge',
      frage: `Im Leistungsverzeichnis stehen ${zahl(v, 0)} m Graben, das Ausmass ergibt ${zahl(a, 0)} m. Wie gross ist die Mengenabweichung bezogen auf das Leistungsverzeichnis?`,
      richtig: vorz(proz),
      falsch: [vorz(runde(((a - v) / a) * 100, 1)), vorz(runde(proz * 2, 1)), vorz(runde(-proz, 1))],
      erklaerung: `Abweichung = (Ausmass − Vorausmass) ÷ Vorausmass = (${zahl(a, 0)} − ${zahl(v, 0)}) ÷ ${zahl(v, 0)} = ${vorz(proz)}. Ob eine Abweichung Folgen für den Einheitspreis hat, regeln Werkvertrag und SIA 118. ${HINWEIS}`,
    };
  },
  fuellgrad: (z) => {
    const rohre = [
      { aussen: 32, wand: 2.9 },
      { aussen: 40, wand: 3.7 },
      { aussen: 50, wand: 4.6 },
      { aussen: 63, wand: 5.8 },
    ];
    const r = rohre[Math.floor(z() * rohre.length)];
    const innen = runde(r.aussen - 2 * r.wand, 1);
    const kabel = zwischen(z, 6, Math.min(20, innen * 0.6), 0.5);
    const fg = (d: number) => `${zahl(runde((kabel / d) ** 2 * 100, 1), 1)} %`;
    return {
      typ: 'fuellgrad',
      frage: `Ein Kabel mit ${zahl(kabel, 1)} mm Durchmesser soll in ein Rohr ${r.aussen} × ${zahl(r.wand, 1)} mm (Aussendurchmesser × Wandstärke). Wie gross ist der Füllgrad bezogen auf den Querschnitt?`,
      richtig: fg(innen),
      falsch: [fg(r.aussen), `${zahl(runde((kabel / innen) * 100, 1), 1)} %`, `${zahl(runde((kabel / r.aussen) * 100, 1), 1)} %`],
      erklaerung: `Massgebend ist der Innendurchmesser: ${r.aussen} − 2 × ${zahl(r.wand, 1)} = ${zahl(innen, 1)} mm. Füllgrad = (Kabel ÷ Innendurchmesser)² = (${zahl(kabel, 1)} ÷ ${zahl(innen, 1)})² = ${fg(innen)}. Das reine Durchmesserverhältnis ergäbe einen viel zu hohen Wert, mit dem Aussendurchmesser wird der Füllgrad zu klein. ${HINWEIS}`,
    };
  },
};

/** Welche Rechenaufgaben zu welcher Stufe passen */
export const GENERATOR_STUFEN: Record<Stufe, (keyof typeof VORLAGEN)[]> = {
  anfaenger: ['rohrmeter', 'belag'],
  praktiker: ['aushub', 'belag', 'regie'],
  experte: ['fuellgrad', 'aushub', 'rechnung'],
  bhv: ['rechnung', 'regie', 'mehrmenge'],
};

/** Erzeugt eine Rechenaufgabe eines bestimmten Typs. Bei zufällig gleichen Antworttexten wird neu gewürfelt. */
export function generiereTyp(typ: keyof typeof VORLAGEN, stufe: Stufe, zufall: () => number, nr = 0): Frage {
  let r = VORLAGEN[typ](zufall);
  for (let versuch = 0; new Set([r.richtig, ...r.falsch]).size < r.falsch.length + 1 && versuch < 20; versuch++) r = VORLAGEN[typ](zufall);
  return {
    id: `gen-${r.typ}-${nr}`,
    kategorie: 'kosten',
    stufe,
    typ: 'einfach',
    frage: r.frage,
    antworten: [{ text: r.richtig, richtig: true }, ...r.falsch.map((text) => ({ text, richtig: false }))],
    erklaerung: r.erklaerung,
    generiert: true,
  };
}

/** Erzeugt eine zur Stufe passende Rechenaufgabe. Gleiche Zufallszahlen ergeben dieselbe Aufgabe. */
export function generiere(stufe: Stufe, zufall: () => number, nr = 0): Frage {
  const typen = GENERATOR_STUFEN[stufe];
  return generiereTyp(typen[Math.floor(zufall() * typen.length)], stufe, zufall, nr);
}

export const GENERATOR_TYPEN = Object.keys(VORLAGEN) as (keyof typeof VORLAGEN)[];
