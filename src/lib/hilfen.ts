// Reine Hilfsfunktionen ohne Astro-Laufzeitabhängigkeit (testbar mit Vitest).

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function lesezeit(text: string): number {
  const woerter = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(woerter / 200));
}

const datumFormat = new Intl.DateTimeFormat('de-CH', { day: 'numeric', month: 'long', year: 'numeric' });
export function formatDatum(d: Date): string {
  return datumFormat.format(d);
}

export const projektArtLabel: Record<string, string> = {
  beruflich: 'Berufliche Erfahrung',
  persoenlich: 'Persönliches Projekt',
  demonstrator: 'Demonstrator',
  konzept: 'Konzept',
};
