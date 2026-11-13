# NIUcost: passwortgeschützter Bereich auf Swizzonic

Das Werkzeug enthält Preise und Positionstexte eines Leistungsverzeichnisses. Es gehört deshalb **nicht** in dieses öffentliche
Repository und nicht in den Build (`dist/`). Die Fallstudie `src/content/projekte/niucost-kostenrechner.md` beschreibt es nur.

## Einrichtung (einmalig, bei Swizzonic)

1. FTP/Dateimanager: Ordner `public_html/app/niucost/` anlegen.
2. In der Hosting-Verwaltung (cPanel) **Verzeichnisschutz** (Passwortgeschützte Verzeichnisse) für diesen Ordner einschalten.
3. Pro Person ein eigener Benutzer mit eigenem, langem Passwort (so lässt sich einzeln sperren).
4. Die Release-Version des Werkzeugs als `index.html` in diesen Ordner laden. Erzeugung im Tool-Repository:
   `python3 build.py --release "Name Empfänger" --days 90` (personalisiert, befristet, minimiert).
5. Aufruf: https://tiefbauleitung.com/app/niucost/ (Anmeldefenster des Browsers). Nie ohne HTTPS verwenden.

## Warum der Deploy den Ordner nicht löscht

Der Workflow `swizzonic.yml` lädt mit `SamKirkland/FTP-Deploy-Action` hoch. Die Action vergleicht mit einer Zustandsdatei
(`.ftp-deploy-sync-state.json`) und löscht nur Dateien, die sie früher selbst hochgeladen hat. Der von Hand angelegte Ordner
`app/niucost/` mit seinem Verzeichnisschutz bleibt daher bestehen. **Nicht** `dangerous-clean-slate` einschalten.

## Nach jedem grösseren Deploy prüfen

- https://tiefbauleitung.com/app/niucost/ verlangt weiterhin ein Passwort (Browser im privaten Fenster).
- Ohne Anmeldung liefert die Adresse die Datei nicht aus (Status 401).

## Regeln

- Keine Passwörter, Passwortdateien oder Hashes ins Repository.
- Das Repository ist öffentlich: nichts Vertrauliches hineinlegen.
