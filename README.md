# FS SearchFund – Website

Statisches HTML + eine Vercel-Funktion (`/api/contact`), die das Kontaktformular als JSON annimmt und per SMTP (Gmail, kostenlos) an `Info@fs-searchfund.com` (Weiterleitung via ImprovMX Free) schickt.

## Struktur
- `index.html`, `about.html`, … – die Seiten (URLs ohne `.html`, z. B. `/about`)
- `assets/` – Schrift (lokal, kein Google-Server), Bilder, `contact.js`
- `api/contact.js` – Backend fürs Formular (Honeypot, Rate-Limit, Validierung)
- `vercel.json` – saubere URLs, Region Frankfurt (`fra1`), Security-Header

## Deployment
1. Inhalt dieses Ordners als Root ins GitHub-Repository hochladen.
2. Vercel → *Add New Project* → Repository wählen. Framework Preset: **Other**, Build Command leer lassen.
3. *Settings → Environment Variables* – Werte aus `.env.example` eintragen:
   - `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_USER`/`SMTP_FROM` = deine Gmail-Adresse, `SMTP_PASS` = Google-App-Passwort (myaccount.google.com/apppasswords, 2FA nötig)
   - `MAIL_TO` – Empfänger (Standard: Info@fs-searchfund.com)
   - `ALLOWED_ORIGIN` – `https://fs-searchfund.com`
4. Redeploy, dann *Settings → Domains* → `fs-searchfund.com` verbinden (DNS-Einträge beim Domain-Anbieter setzen, wie Vercel sie anzeigt).
5. Testen: Formular auf `/contact` absenden → Mail muss ankommen; „Antworten“ geht direkt an den Absender.

## Vor dem Launch
- c/o-Genehmigung der Frankfurt School liegt vor (Imprint/Privacy).
- Markennutzung „FS“ mit der Hochschule klären.
- Domain in `sitemap.xml`, `robots.txt` und den `canonical`-Tags prüfen, falls sie nicht `fs-searchfund.com` ist.
