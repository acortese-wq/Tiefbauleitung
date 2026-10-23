// Build-Einstellungen. Werden beim Build aus Umgebungsvariablen gelesen.

/**
 * 'github-pages' (statisch, Unterordner /Tiefbauleitung), 'swizzonic' (statisch, tiefbauleitung.com)
 * oder 'infomaniak' (Node-Server, Vorschau und Entwicklung).
 */
const ziel = process.env.DEPLOY_ZIEL;
export const deployZiel = ziel === 'github-pages' || ziel === 'swizzonic' ? ziel : 'infomaniak';
export const githubPages = deployZiel === 'github-pages';
export const swizzonic = deployZiel === 'swizzonic';
/** Rein statische, öffentliche Auslieferung ohne Node-Server. */
export const statisch = githubPages || swizzonic;

/** Interne Hinweise und Platzhalter («ergänzen») nur in Vorschau und Entwicklung zeigen, nie öffentlich. */
export const offenePunkteZeigen = !statisch;
