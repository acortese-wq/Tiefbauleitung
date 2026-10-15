import { getCollection, type CollectionEntry } from 'astro:content';

/** Entwürfe nur zeigen, wenn SHOW_DRAFTS=true (Vorschau) oder im Entwicklungsmodus. */
export function zeigeEntwuerfe(): boolean {
  return import.meta.env.DEV || process.env.SHOW_DRAFTS === 'true';
}

export function istSichtbar(status: 'entwurf' | 'veroeffentlicht'): boolean {
  return status === 'veroeffentlicht' || zeigeEntwuerfe();
}

export async function sichtbareArtikel(): Promise<CollectionEntry<'artikel'>[]> {
  const alle = await getCollection('artikel', ({ data }) => istSichtbar(data.status));
  return alle.sort((a, b) => b.data.datum.getTime() - a.data.datum.getTime());
}

export async function sichtbareProjekte(): Promise<CollectionEntry<'projekte'>[]> {
  const alle = await getCollection('projekte', ({ data }) => istSichtbar(data.status));
  return alle.sort((a, b) => a.data.reihenfolge - b.data.reihenfolge);
}

export async function alleKompetenzen(): Promise<CollectionEntry<'kompetenzen'>[]> {
  const alle = await getCollection('kompetenzen');
  return alle.sort((a, b) => a.data.reihenfolge - b.data.reihenfolge);
}

export { slugify, lesezeit, formatDatum, projektArtLabel } from './hilfen';
