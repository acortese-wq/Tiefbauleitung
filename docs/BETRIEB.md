# Betrieb und Deployment

> Es wurde **keine Veröffentlichung durchgeführt**. Für Hosting und Domain liegen keine Zugänge vor.
> Diese Anleitung beschreibt die nötigen Schritte. Menüpunkte bei Infomaniak können sich ändern; massgebend ist
> die aktuelle Hilfe von Infomaniak.

## Umgebungen

| Umgebung | Zweck | Start |
|---|---|---|
| Entwicklung | Lokal schreiben und testen, Entwürfe sichtbar | `npm run dev` |
| Admin | Inhalte über Formulare pflegen | `npm run admin` → http://localhost:4321/keystatic |
| Vorschau | Produktions-Build mit Entwürfen, nicht öffentlich | `npm run build:vorschau && npm start` |
| Produktion | Öffentliche Seite | `npm run build && npm start` |

## Umgebungsvariablen

Vorlage: [`.env.example`](../.env.example). Nie echte Werte ins Repository.

| Variable | Pflicht | Zeitpunkt | Beschreibung |
|---|---|---|---|
| `SITE_URL` | ja | Build | Öffentliche Adresse, z. B. `https://www.cortese.ch`. Bestimmt Canonical, Sitemap, Open Graph und `robots.txt`. |
| `PORT`, `HOST` | nein | Laufzeit | Standard `8080`, `0.0.0.0` |
| `SHOW_DRAFTS` | nein | Build | `true` nur für Vorschau |
| `PUBLIC_CONTACT_FORM` | nein | Build | `true` zeigt das Formular. Nur mit vollständiger SMTP-Konfiguration. |
| `CONTACT_SECRET` | bei Formular | Laufzeit | Mindestens 32 zufällige Zeichen |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | bei Formular | Laufzeit | Mailversand |
| `CONTACT_TO`, `CONTACT_FROM` | bei Formular | Laufzeit | Empfänger (nie auf der Seite sichtbar), Absender |

Fehlt beim aktiven Formular eine Angabe, bleibt das Formular automatisch aus.

## Deployment auf GitHub Pages (aktuell gewählt)

Statische Variante ohne Server, direkt aus diesem Repository. Adresse:
**https://acortese-wq.github.io/Tiefbauleitung/**

**Einmalig in GitHub einstellen:**
1. GitHub Pages braucht ein **öffentliches Repository** (oder GitHub Pro für private Repositories):
   *Settings → General → Danger Zone → Change visibility*. Vorher die Git-Historie prüfen (siehe unten).
2. *Settings → Pages → Build and deployment → Source:* **GitHub Actions**.

**Danach automatisch:** Jeder Push auf `main` startet `.github/workflows/pages.yml`. Der Workflow prüft
Abhängigkeiten, Typen, Unit-Tests und den statischen Build im Unterordner (Playwright) und veröffentlicht nur,
wenn alles grün ist. Manuell: *Actions → GitHub Pages → Run workflow*.

**Lokal prüfen:** `npm run test:pages`

**Technische Besonderheiten:**
- Unterordner `/Tiefbauleitung`: Astro setzt `base`, eine Build-Erweiterung in `astro.config.mjs` ergänzt den
  Unterordner in allen internen Links, Sitemap, Canonical- und Open-Graph-Adressen. Die Suche erhält `baseUrl`.
- Kein Kontaktformular (kein Server). Kontakt über LinkedIn.
- Keine eigenen HTTP-Header. Die Content Security Policy wirkt über das `meta`-Element jeder Seite;
  `frame-ancestors`, `X-Frame-Options` und `Permissions-Policy` fehlen. HTTPS und HSTS stellt GitHub.
- Hosting in den USA (GitHub, Inc.). Die Datenschutzerklärung beschreibt das im Pages-Build automatisch.
- Interne Platzhalter und Prüfhinweise sind im Pages-Build ausgeblendet.
- Eigene Domain später: `public/CNAME` anlegen, `SITE_URL` setzen und `BASE_PATH=/` im Workflow ergänzen.

**Git-Historie vor dem Veröffentlichen:** Ältere Commits enthalten die frühere Einseiten-Version mit Porträt und in
einem Stand (Commit `96dc315`) eine private E-Mail-Adresse. Bei einem öffentlichen Repository ist die ganze Historie
sichtbar. Wer das vermeiden will, bereinigt die Historie vorher (z. B. mit `git filter-repo`) oder startet ein neues
Repository ohne Historie.

## Deployment auf Infomaniak (Node.js)

1. **Domain** bei Infomaniak registrieren oder übertragen. DNS auf das Hosting zeigen lassen.
2. **Hosting** mit Node.js-Unterstützung wählen und im Manager eine Node.js-Seite für die Domain anlegen.
3. **SSL/HTTPS**: Zertifikat (Let's Encrypt) im Manager aktivieren und Weiterleitung von HTTP auf HTTPS einschalten.
   Erst danach ist der HSTS-Header aus `server.mjs` sinnvoll.
4. **Code bereitstellen**, entweder per Git-Klon auf dem Hosting oder per Upload des Build-Ergebnisses:
   ```bash
   git clone <repository> && cd <repository>
   npm ci
   SITE_URL=https://www.ihre-domain.ch npm run build
   ```
5. **Startbefehl** im Manager: `node server.mjs`. Port gemäss Vorgabe von Infomaniak über `PORT` setzen.
6. **Umgebungsvariablen** im Manager hinterlegen (siehe Tabelle). Keine `.env`-Datei auf öffentlich lesbaren Pfaden.
7. **Prüfen**: Startseite, `/robots.txt` (darf nicht mehr `Disallow: /` zeigen), `/sitemap-index.xml`,
   Sicherheits-Header mit `curl -I https://www.ihre-domain.ch/`.
8. **Suchmaschinen**: Domain in der Google Search Console und in Bing Webmaster Tools bestätigen, Sitemap einreichen.

### Automatisierung (optional)
Ein Git-basierter Ablauf ist möglich: Push auf `main` → CI baut und testet (`npm run test:alle`) → bei Erfolg
Deployment per SSH (`git pull && npm ci && npm run build && Neustart`). Die SSH-Zugangsdaten gehören als Geheimnis in
die CI, nie ins Repository.

## Kontaktformular aktivieren

1. Geschäftliche E-Mail-Adresse einrichten (z. B. bei Infomaniak Mail, Datenhaltung Schweiz).
2. SMTP-Zugang und `CONTACT_SECRET` als Umgebungsvariablen setzen.
3. Mit `PUBLIC_CONTACT_FORM=true` neu bauen.
4. Datenschutzerklärung (Abschnitt Kontaktformular) vervollständigen und prüfen lassen.
5. `npm run test:varianten` lokal ausführen.

## Backup und Wiederherstellung

- **Inhalte und Code** liegen vollständig im Git-Repository (GitHub). Jede Änderung ist versioniert.
  Empfehlung: zusätzlich eine zweite Kopie des Repositorys an einem anderen Ort (z. B. Infomaniak kDrive), monatlich.
- **Keine Datenbank**, keine Nutzerdaten auf dem Server. Kontaktanfragen liegen nur im E-Mail-Postfach.
- **Geheimnisse** (SMTP, `CONTACT_SECRET`) separat in einem Passwortmanager sichern.
- **Wiederherstellung**: Repository klonen, `npm ci`, `npm run build`, Variablen setzen, `node server.mjs` starten.

## Rollback

1. Letzten funktionierenden Stand ermitteln: `git log --oneline`
2. Zurücksetzen auf dem Server: `git checkout <commit> && npm ci && npm run build`, Anwendung neu starten.
3. Ursache im Repository mit `git revert <commit>` beheben und regulär neu ausrollen.

## Protokollierung und Überwachung

- Der Server protokolliert nur Start und Fehler, keine Formularinhalte und keine IP-Adressen.
- Verfügbarkeit: externen Uptime-Monitor einrichten (z. B. Uptime-Funktion des Hosters oder ein Dienst mit Sitz in
  der Schweiz/EU), Prüfung von `/` alle 5 Minuten.
- Abhängigkeiten: monatlich `npm audit` und Updates prüfen. Sicherheitsupdates von Astro zeitnah einspielen.

## Ratenbegrenzung bei mehreren Instanzen

Die Begrenzung (5 Anfragen pro IP und Stunde) liegt im Arbeitsspeicher und gilt pro Prozess. Bei mehreren
Instanzen oder häufigen Neustarts braucht es einen gemeinsamen Speicher (z. B. Redis) oder die Begrenzung beim
Hoster/Proxy.
