// Nutzenrechner im KI-Labor. Methode wie im Business-Case-Template «FTE-Methode + Simple Payback» (HSO KI-Professional).

export const WOCHEN_PRO_MONAT = 52 / 12; // ≈ 4.33
export const STUNDEN_PRO_FTE = 1800; // produktive Stunden pro Jahr

export interface Teamkosten {
  stundenMonat: number;
  kostenMonat: number;
  einsparungMonat: number;
  einsparungJahr: number;
}

/** Was wiederkehrende manuelle Arbeit ein Team kostet und was eine Einsparquote bringt. */
export function teamkosten(personen: number, stundenWoche: number, satz: number, quoteProzent: number): Teamkosten {
  const stundenMonat = personen * stundenWoche * WOCHEN_PRO_MONAT;
  const kostenMonat = stundenMonat * satz;
  const einsparungMonat = kostenMonat * (quoteProzent / 100);
  return { stundenMonat, kostenMonat, einsparungMonat, einsparungJahr: einsparungMonat * 12 };
}

export type Bewertung = 'sehr-attraktiv' | 'solide' | 'pruefen' | 'kein-payback';

export interface Payback {
  stundenWoche: number;
  stundenJahr: number;
  fte: number;
  nutzenJahr: number;
  kostenJahr1: number;
  paybackMonate: number | null;
  nettoAbJahr2: number;
  bewertung: Bewertung;
}

export function payback(p: {
  minutenProVorgang: number;
  vorgaengeProWoche: number;
  automatisierungProzent: number;
  satz: number;
  investition: number;
  laufendMonat: number;
}): Payback {
  const stundenWoche = (p.minutenProVorgang / 60) * p.vorgaengeProWoche * (p.automatisierungProzent / 100);
  const stundenJahr = stundenWoche * 52;
  const fte = Math.round((stundenJahr / STUNDEN_PRO_FTE) * 100) / 100;
  const nutzenJahr = stundenJahr * p.satz;
  const kostenJahr1 = p.investition + p.laufendMonat * 12;
  const nettoMonat = nutzenJahr / 12 - p.laufendMonat;
  const paybackMonate = nettoMonat > 0 ? p.investition / nettoMonat : null;
  const bewertung: Bewertung =
    paybackMonate == null ? 'kein-payback' : paybackMonate <= 12 ? 'sehr-attraktiv' : paybackMonate <= 24 ? 'solide' : 'pruefen';
  return { stundenWoche, stundenJahr, fte, nutzenJahr, kostenJahr1, paybackMonate, nettoAbJahr2: nutzenJahr - p.laufendMonat * 12, bewertung };
}

export const chf = (n: number) => `CHF ${Math.round(n).toLocaleString('de-CH')}`;
export const zahl = (n: number, stellen = 0) => n.toLocaleString('de-CH', { minimumFractionDigits: stellen, maximumFractionDigits: stellen });
