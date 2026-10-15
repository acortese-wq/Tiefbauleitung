// Einfache Ratenbegrenzung im Arbeitsspeicher (Fenster pro Schlüssel).
// Für eine einzelne Node-Instanz ausreichend. Bei mehreren Instanzen braucht es
// einen gemeinsamen Speicher (siehe docs/BETRIEB.md).

export type RatenLimiter = {
  pruefe: (schluessel: string, jetzt?: number) => { erlaubt: boolean; rest: number; reset: number };
  groesse: () => number;
};

export function erstelleLimiter(maxAnfragen: number, fensterMs: number, maxSchluessel = 10_000): RatenLimiter {
  const eintraege = new Map<string, { anzahl: number; start: number }>();

  function aufraeumen(jetzt: number) {
    for (const [k, v] of eintraege) if (jetzt - v.start >= fensterMs) eintraege.delete(k);
  }

  return {
    pruefe(schluessel, jetzt = Date.now()) {
      if (eintraege.size >= maxSchluessel) aufraeumen(jetzt);
      let e = eintraege.get(schluessel);
      if (!e || jetzt - e.start >= fensterMs) {
        e = { anzahl: 0, start: jetzt };
        eintraege.set(schluessel, e);
      }
      e.anzahl += 1;
      const reset = e.start + fensterMs;
      return { erlaubt: e.anzahl <= maxAnfragen, rest: Math.max(0, maxAnfragen - e.anzahl), reset };
    },
    groesse: () => eintraege.size,
  };
}
