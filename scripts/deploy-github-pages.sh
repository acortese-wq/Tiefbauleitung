#!/usr/bin/env bash
# Baut die statische Seite für GitHub Pages und veröffentlicht sie im öffentlichen
# Repository acortese-wq.github.io (nur Build-Ergebnis, kein Quellcode, keine Historie).
#
# Voraussetzungen: Repository acortese-wq.github.io existiert (öffentlich, leer),
# Schreibrechte für Git. Aufruf: npm run deploy:pages
set -euo pipefail

ZIEL_REPO="${ZIEL_REPO:-https://github.com/acortese-wq/acortese-wq.github.io.git}"
QUELLE="$(git rev-parse --short HEAD)"

echo "→ Build für GitHub Pages"
rm -rf dist
npm run build:pages

echo "→ Prüfung des Builds"
test -f dist/index.html
test -f dist/.nojekyll
if grep -rl "ergänzen" dist --include=*.html >/dev/null; then
  echo "Abbruch: interne Platzhalter im Build gefunden." >&2
  exit 1
fi

echo "→ Veröffentlichen nach $ZIEL_REPO"
cd dist
git init -q -b main
git add -A
git -c user.name="Deploy" -c user.email="deploy@users.noreply.github.com" \
  commit -q -m "Webseite aus Quellstand $QUELLE"
git push -f "$ZIEL_REPO" main
echo "✓ Veröffentlicht. GitHub Pages aktualisiert die Seite in der Regel innert weniger Minuten."
