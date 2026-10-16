// Wandelt Originalbilder aus quellbilder/<ordner>/ in Webformate für public/bilder/<ordner>/ um.
// Aufruf: npm run bilder            (alle Ordner)
//         npm run bilder -- kompetenzen
// Pro Bild entstehen <name>-<breite>.webp und <name>.jpg (Fallback) gemäss Profil des Ordners.
// Nie hochskalieren; Metadaten (EXIF, GPS, Generator-Angaben) werden entfernt.
import { readdir, mkdir, stat } from 'node:fs/promises';
import { join, parse } from 'node:path';
import sharp from 'sharp';

const QUELLE = 'quellbilder';
const ZIEL = 'public/bilder';
const ENDUNGEN = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.tif', '.tiff']);
// verhaeltnis: Zuschnitt aus der Bildmitte (null = Originalformat behalten)
const PROFILE = {
  kompetenzen: { verhaeltnis: 3 / 2, webp: [800, 1600], jpg: 1200 },
  startseite: { verhaeltnis: null, webp: [800, 1400], jpg: 1200 },
};

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
    const profil = PROFILE[ordner] ?? PROFILE.kompetenzen;
    const meta = await sharp(quelle).metadata();
    const groesste = Math.max(...profil.webp);
    if ((meta.width ?? 0) < groesste) console.warn(`! ${ordner}/${datei}: nur ${meta.width} px breit, empfohlen mind. ${groesste} px`);
    const varianten = [
      ...profil.webp.map((b, i) => ({
        breite: b, datei: `${name}-${b}.webp`,
        format: (s) => s.webp({ quality: i === 0 ? 72 : 74 }), budget: i === 0 ? 80 : undefined,
      })),
      { breite: profil.jpg, datei: `${name}.jpg`, format: (s) => s.jpeg({ quality: 80, mozjpeg: true }) },
    ];
    const groessen = [];
    for (const v of varianten) {
      const ziel = join(ZIEL, ordner, v.datei);
      await v.format(
        sharp(quelle).rotate().resize({
          width: v.breite,
          height: profil.verhaeltnis ? Math.round(v.breite / profil.verhaeltnis) : undefined,
          fit: 'cover', position: 'centre', withoutEnlargement: true,
        }),
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
