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
  }),
});

export const collections = { artikel, projekte, kompetenzen, referenzen };
