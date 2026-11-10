# FS SearchFund – Website

Statisches HTML (Englisch + Deutsch) und eine Vercel-Funktion (`/api/contact`), die das Kontaktformular über die **Brevo-API** an `Info@fs-searchfund.com` schickt.

## Struktur
- `index.html`, `about.html`, … – englische Seiten (URLs ohne `.html`, z. B. `/about`)
- `de/` – deutsche Seiten unter denselben Namen (`/de/`, `/de/about`, …); Umschalter EN / DE oben im Header
- `assets/` – Schrift (lokal), Bilder, `contact.js` (Formular, sprachunabhängig)
- `api/contact.js` – Backend fürs Formular (Honeypot, Rate-Limit, Validierung, Versand über Brevo)
- `vercel.json` – saubere URLs, Region Frankfurt (`fra1`), Security-Header

## Umgebungsvariablen (Vercel → Settings → Environment Variables)
| Variable | Wert |
|---|---|
| `BREVO_API_KEY` | Brevo → Einstellungen → SMTP & API → „API- und MCP-Schlüssel“ (beginnt mit `xkeysib-`) |
| `MAIL_FROM` | in Brevo verifizierter Absender, z. B. `fssearchfund@gmail.com` |
| `MAIL_TO` | Empfänger, z. B. `Info@fs-searchfund.com` |
| `ALLOWED_ORIGIN` | `https://fs-searchfund.com` |

Die alten `SMTP_*`-Variablen werden nicht mehr gebraucht und können gelöscht werden.

**Wichtig in Brevo:** Einstellungen → Sicherheit → Autorisierte IPs → Sperre für API-Schlüssel **aus** (Vercel sendet von wechselnden IPs).

## Fehlersuche
Vercel → Logs → Eintrag `/api/contact`. Bei Problemen steht dort `Brevo error: <Status> <Antwort>`.
- `401` → API-Schlüssel falsch
- `400` mit „sender“ → `MAIL_FROM` ist in Brevo nicht als Absender verifiziert
- `403` / „unrecognised IP“ → IP-Sperre in Brevo ausschalten

## Texte ändern
Englische und deutsche Seiten sind getrennte Dateien – eine Textänderung bitte in beiden Versionen vornehmen.
