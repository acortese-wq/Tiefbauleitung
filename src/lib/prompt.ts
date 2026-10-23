// Füllt Prompt-Vorlagen im Browser und im Build. Syntax der Vorlagen:
//   {{name}}            Wert des Felds; leeres Pflichtfeld → «[FEHLT: Label]»
//   [[name| … ]]        Block nur, wenn das Feld einen Wert hat (Checkbox: angekreuzt)
// Mehrfachauswahl (typ 'checks') wird als Aufzählung mit «- » eingesetzt.

export type FeldTyp = 'text' | 'textarea' | 'select' | 'checks' | 'tabelle';

export interface Option {
  wert: string;
  label: string;
}

export interface Feld {
  name: string;
  label: string;
  typ: FeldTyp;
  beispiel?: string;
  hilfe?: string;
  pflicht?: boolean;
  optionen?: Option[];
  /** Vorauswahl bei select (wert) bzw. checks (Liste der werte) */
  vorgabe?: string | string[];
}

export type Werte = Record<string, string | string[]>;

export const FEHLT = (label: string) => `[FEHLT: ${label}]`;

function wertAlsText(feld: Feld, wert: string | string[] | undefined): string {
  if (feld.typ === 'checks') {
    const liste = Array.isArray(wert) ? wert : [];
    return liste
      .map((w) => feld.optionen?.find((o) => o.wert === w)?.wert ?? w)
      .map((w) => `- ${w}`)
      .join('\n');
  }
  return typeof wert === 'string' ? wert.trim() : '';
}

export function fuelle(vorlage: string, felder: Feld[], werte: Werte): string {
  const text = (name: string) => {
    const feld = felder.find((f) => f.name === name);
    if (!feld) return '';
    return wertAlsText(feld, werte[name]);
  };
  // Bedingte Blöcke zuerst, damit Platzhalter darin nur bei vorhandenem Wert erscheinen
  let aus = vorlage.replace(/\[\[(\w+)\|([\s\S]*?)\]\]/g, (_, name: string, inhalt: string) => (text(name) ? inhalt : ''));
  aus = aus.replace(/\{\{(\w+)\}\}/g, (_, name: string) => {
    const feld = felder.find((f) => f.name === name);
    const t = text(name);
    if (t) return t;
    return feld?.pflicht ? FEHLT(feld.label) : '';
  });
  // Mehr als eine Leerzeile zusammenziehen (entsteht durch weggelassene Blöcke)
  return aus.replace(/\n{3,}/g, '\n\n').trim();
}

/** Beispielwerte für die Vorschau ohne JavaScript und für «Beispiel laden». */
export function beispielWerte(felder: Feld[]): Werte {
  const w: Werte = {};
  for (const f of felder) {
    if (f.typ === 'checks') w[f.name] = Array.isArray(f.vorgabe) ? f.vorgabe : (f.optionen ?? []).map((o) => o.wert);
    else if (f.typ === 'select') w[f.name] = (typeof f.vorgabe === 'string' ? f.vorgabe : f.optionen?.[0]?.wert) ?? '';
    else w[f.name] = f.beispiel ?? '';
  }
  return w;
}

export function fehlendePflichtfelder(felder: Feld[], werte: Werte): Feld[] {
  return felder.filter((f) => {
    if (!f.pflicht) return false;
    const w = werte[f.name];
    return Array.isArray(w) ? w.length === 0 : !(w ?? '').trim();
  });
}
