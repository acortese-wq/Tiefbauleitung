// Wandelt Originalbilder aus quellbilder/<ordner>/ in Webformate für public/bilder/<ordner>/ um.
// Aufruf: npm run bilder            (alle Ordner)
//         npm run bilder -- kompetenzen
// Pro Bild entstehen <name>-800.webp, <name>-1600.webp und <name>.jpg (1200 px, Fallback).
// Zuschnitt 3:2 aus der Bildmitte; Metadaten (EXIF, GPS, Generator-Angaben) werden entfernt.
import { readdir, mkdir, stat } from 'node:fs/promises';
import { join, parse } from 'node:path';
import sharp from 'sharp';

const QUELLE = 'quellbilder';
const ZIEL = 'public/bilder';
const ENDUNGEN = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.tif', '.tiff']);
const VERHAELTNIS = 3 / 2;

const ordnerListe = process.argv.slice(2).length
  ? process.argv.slice(2)
  : (await readdir(QUELLE, { withFileTypes: true })).filter((e) => e.isDirectory()).map((e) => e.name);

let anzahl = 0;
for (const ordner of ordnerListe) {
  const dateien = (await readdir(join(QUELLE, ordner))).filter((d) => ENDUNGEN.has(parse(d).ext.toLowerCase()));
  await mkdir(join(ZIEL, ordner), { recursive: true });
  for (const datei of dateien) {
    const { name } = parse(datei);
    if (!/^[a-z0-9-]+$/.test(name)) {
      console.error(`✗ ${ordner}/${datei}: Dateiname nur mit Kleinbuchstaben, Ziffern und Bindestrichen`);
      process.exitCode = 1;
      continue;
    }
    const quelle = join(QUELLE, ordner, datei);
    const meta = await sharp(quelle).metadata();
    if ((meta.width ?? 0) < 1600) console.warn(`! ${ordner}/${datei}: nur ${meta.width} px breit, empfohlen mind. 2400 px`);
    const varianten = [
      { breite: 800, datei: `${name}-800.webp`, format: (s) => s.webp({ quality: 72 }), budget: 80 },
      { breite: 1600, datei: `${name}-1600.webp`, format: (s) => s.webp({ quality: 74 }) },
      { breite: 1200, datei: `${name}.jpg`, format: (s) => s.jpeg({ quality: 80, mozjpeg: true }) },
    ];
    const groessen = [];
    for (const v of varianten) {
      const ziel = join(ZIEL, ordner, v.datei);
      await v.format(
        sharp(quelle).rotate().resize({ width: v.breite, height: Math.round(v.breite / VERHAELTNIS), fit: 'cover', position: 'centre' }),
      ).toFile(ziel);
      const kib = Math.round((await stat(ziel)).size / 1024);
      groessen.push(`${v.datei} ${kib} KiB`);
      // Mobile Variante bestimmt die Ladezeit (LCP) auf dem Smartphone
      if (v.budget && kib > v.budget) console.warn(`! ${v.datei}: ${kib} KiB über Budget ${v.budget} KiB – Bild zu detailreich oder zu hell?`);
    }
    console.log(`✓ ${ordner}/${datei} → ${groessen.join(', ')}`);
    anzahl++;
  }
}
console.log(`${anzahl} Bild(er) umgewandelt.`);
