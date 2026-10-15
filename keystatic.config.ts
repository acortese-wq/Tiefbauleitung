import { config, collection, fields } from '@keystatic/core';

// Admin-Oberfläche für Inhalte. Läuft lokal mit `npm run admin` unter /keystatic.
// Inhalte werden als Markdown-Dateien ins Repository geschrieben und per Git veröffentlicht.

const KATEGORIEN = ['KI im Bauwesen', 'KI-Agenten', 'Automatisierung', 'Netzinfrastruktur', 'Tiefbau', 'Datenschutz', 'Erfahrungen'];

export default config({
  storage: { kind: 'local' },
  ui: { brand: { name: 'Cortese · Inhalte' } },
  collections: {
    artikel: collection({
      label: 'Fachbeiträge',
      slugField: 'title',
      path: 'src/content/artikel/*',
      format: { contentField: 'inhalt' },
      entryLayout: 'content',
      columns: ['title', 'datum', 'status'],
      schema: {
        title: fields.slug({ name: { label: 'Titel', validation: { length: { min: 5, max: 110 } } } }),
        description: fields.text({ label: 'Kurzbeschreibung (SEO)', multiline: true, validation: { length: { min: 50, max: 170 } } }),
        datum: fields.date({ label: 'Datum', validation: { isRequired: true } }),
        aktualisiert: fields.date({ label: 'Aktualisiert am' }),
        kategorie: fields.select({
          label: 'Kategorie',
          options: KATEGORIEN.map((k) => ({ label: k, value: k })),
          defaultValue: 'KI im Bauwesen',
        }),
        schlagwoerter: fields.array(fields.text({ label: 'Schlagwort' }), { label: 'Schlagwörter', itemLabel: (p) => p.value }),
        status: fields.select({
          label: 'Status',
          options: [
            { label: 'Entwurf', value: 'entwurf' },
            { label: 'Veröffentlicht', value: 'veroeffentlicht' },
          ],
          defaultValue: 'entwurf',
        }),
        inhalt: fields.markdoc({ label: 'Inhalt', extension: 'md' }),
      },
    }),
    projekte: collection({
      label: 'Projekte und Fallstudien',
      slugField: 'title',
      path: 'src/content/projekte/*',
      format: { contentField: 'inhalt' },
      entryLayout: 'content',
      schema: {
        title: fields.slug({ name: { label: 'Titel' } }),
        kurz: fields.text({ label: 'Kurzbeschreibung', multiline: true, validation: { length: { max: 220 } } }),
        art: fields.select({
          label: 'Art',
          options: [
            { label: 'Berufliche Erfahrung', value: 'beruflich' },
            { label: 'Persönliches Projekt', value: 'persoenlich' },
            { label: 'Demonstrator', value: 'demonstrator' },
            { label: 'Konzept', value: 'konzept' },
          ],
          defaultValue: 'konzept',
        }),
        zeitraum: fields.text({ label: 'Zeitraum' }),
        rolle: fields.text({ label: 'Rolle' }),
        technologie: fields.array(fields.text({ label: 'Technologie' }), { label: 'Technologie', itemLabel: (p) => p.value }),
        kompetenzen: fields.array(fields.text({ label: 'Kompetenz-ID' }), { label: 'Kompetenzen', itemLabel: (p) => p.value }),
        bild: fields.text({ label: 'Bildpfad ohne Endung, z. B. /bilder/name' }),
        bildAlt: fields.text({ label: 'Bildbeschreibung (Alt-Text)' }),
        reihenfolge: fields.integer({ label: 'Reihenfolge', defaultValue: 100 }),
        status: fields.select({
          label: 'Status',
          options: [
            { label: 'Entwurf', value: 'entwurf' },
            { label: 'Veröffentlicht', value: 'veroeffentlicht' },
          ],
          defaultValue: 'entwurf',
        }),
        inhalt: fields.markdoc({ label: 'Inhalt', extension: 'md' }),
      },
    }),
  },
});
