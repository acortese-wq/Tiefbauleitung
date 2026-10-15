// Build-Einstellungen. Werden beim Build aus Umgebungsvariablen gelesen.

/** 'github-pages' (statisch, öffentlich) oder 'infomaniak' (Node-Server). */
export const deployZiel = process.env.DEPLOY_ZIEL === 'github-pages' ? 'github-pages' : 'infomaniak';
export const githubPages = deployZiel === 'github-pages';

/** Interne Hinweise und Platzhalter («ergänzen») nur in Vorschau und Entwicklung zeigen, nie öffentlich. */
export const offenePunkteZeigen = !githubPages;
