import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

export const KATEGORIEN = [
  'KI im Bauwesen',
  'KI-Agenten',
  'Automatisierung',
  'Netzinfrastruktur',
  'Tiefbau',
  'Datenschutz',
  'Erfahrungen',
] as const;

export const PROJEKTARTEN = ['beruflich', 'persoenlich', 'demonstrator', 'konzept'] as const;

const artikel = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/artikel' }),
  schema: z.object({
    title: z.string().min(5).max(110),
    description: z.string().min(50).max(170),
    datum: z.coerce.date(),
    aktualisiert: z.coerce.date().optional(),
    kategorie: z.enum(KATEGORIEN),
    schlagwoerter: z.array(z.string()).default([]),
    status: z.enum(['entwurf', 'veroeffentlicht']).default('entwurf'),
  }),
});

const projekte = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projekte' }),
  schema: z.object({
    title: z.string(),
    kurz: z.string().max(220),
    art: z.enum(PROJEKTARTEN),
    zeitraum: z.string(),
    rolle: z.string(),
    technologie: z.array(z.string()).default([]),
    kompetenzen: z.array(z.string()).default([]),
    bild: z.string().optional(),
    bildAlt: z.string().optional(),
    // Rahmen auf der Fallstudienseite: Smartphone (Standard) oder Tablet
    bildRahmen: z.enum(['telefon', 'tablet']).default('telefon'),
    reihenfolge: z.number().default(100),
    status: z.enum(['entwurf', 'veroeffentlicht']).default('veroeffentlicht'),
  }),
});

const kompetenzen = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/kompetenzen' }),
  schema: z.object({
    title: z.string(),
    kurz: z.string().max(220),
    bereich: z.enum(['Infrastruktur', 'Digitalisierung', 'Künstliche Intelligenz']),
    reihenfolge: z.number(),
    seit: z.string(),
    grundlagen: z.array(z.string()).default([]),
    referenzFilter: z.string().optional(),
    // Kopfbild: public/bilder/kompetenzen/<bild>-800.webp, -1600.webp und .jpg (erzeugt mit npm run bilder)
    bild: z.string().regex(/^[a-z0-9-]+$/).optional(),
    bildAlt: z.string().optional(),
    // Sichtbarer Hinweis unter dem Bild; KI-Bilder immer als solche kennzeichnen
    bildHinweis: z.string().default('KI-generierte Illustration'),
  }).refine((k) => !k.bild || k.bildAlt, {
    message: 'Zu jedem Kopfbild gehört bildAlt (Bildbeschreibung).',
  }),
});

const referenzen = defineCollection({
  loader: file('src/data/referenzen.json'),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    arbeitgeber: z.string(),
    bauherr: z.string().optional(),
    zeitraum: z.string(),
    rolle: z.string(),
    fachgebiete: z.array(z.enum(['kunstbauten', 'strasse', 'bahn', 'wasser', 'netz'])),
    // Foto: Dateien public/bilder/referenzen/<bild>.jpg und .webp. Nachweis ist Pflicht, sobald ein Bild gesetzt ist.
    bild: z.string().regex(/^[a-z0-9-]+$/).optional(),
    bildAlt: z.string().optional(),
    bildNachweis: z.string().optional(),
    // Link zur Lizenz bei fremden Fotos (z. B. Creative Commons)
    bildLizenz: z.url().optional(),
  }).refine((r) => !r.bild || (r.bildAlt && r.bildNachweis), {
    message: 'Zu jedem Foto gehören bildAlt (Bildbeschreibung) und bildNachweis (Urheber/Lizenz).',
  }),
});

export const collections = { artikel, projekte, kompetenzen, referenzen };
