const nodemailer = require('nodemailer');

const BACKGROUNDS = {
  active: 'Active searcher',
  former: 'Former searcher or CEO',
  founder: 'Founder or entrepreneur',
  investor: 'Investor (PE, VC, family office)',
  advisor: 'Advisor or service provider in ETA',
  other: 'Other'
};
const CONTRIBUTE = {
  intro: 'An introductory conversation',
  qa: 'Q&A session',
  keynote: 'Keynote or speaker event',
  panel: 'Panel talk',
  case: 'Case study or workshop',
  visit: 'Company visit on site',
  roles: 'Internships or working-student roles'
};

// Best-effort rate limit (per warm instance): 5 requests / 10 min / IP
const hits = new Map();
function limited(ip) {
  const now = Date.now(), win = 10 * 60 * 1000;
  const list = (hits.get(ip) || []).filter(t => now - t < win);
  list.push(now);
  hits.set(ip, list);
  return list.length > 5;
}

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false });
  }

  const allowed = process.env.ALLOWED_ORIGIN;
  if (allowed && req.headers.origin && req.headers.origin !== allowed) {
    return res.status(403).json({ ok: false });
  }

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (limited(ip)) return res.status(429).json({ ok: false, error: 'rate_limited' });

  let b = req.body || {};
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = {}; } }

  // Honeypot: bots fill the hidden field – pretend success, send nothing
  if (str(b.website, 200)) return res.status(200).json({ ok: true });

  const d = {
    firstName: str(b.firstName, 100),
    lastName: str(b.lastName, 100),
    email: str(b.email, 200),
    company: str(b.company, 200),
    background: str(b.background, 20),
    backgroundOther: str(b.backgroundOther, 300),
    contribute: Array.isArray(b.contribute) ? b.contribute.filter(k => CONTRIBUTE[k]).slice(0, 10) : [],
    message: str(b.message, 5000),
    consent: b.consent === true
  };

  const emailOk = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(d.email);
  if (!d.firstName || !d.lastName || !emailOk || !BACKGROUNDS[d.background] || !d.consent ||
      (d.background === 'other' && !d.backgroundOther)) {
    return res.status(400).json({ ok: false, error: 'invalid' });
  }

  const bgLabel = BACKGROUNDS[d.background] + (d.background === 'other' ? ': ' + d.backgroundOther : '');
  const rows = [
    ['Name', d.firstName + ' ' + d.lastName],
    ['Email', d.email],
    ['Organisation', d.company || '–'],
    ['Background', bgLabel],
    ['Would like to contribute', d.contribute.map(k => CONTRIBUTE[k]).join(', ') || '–'],
    ['Message', d.message || '–'],
    ['Consent', 'Given (' + new Date().toISOString() + ')']
  ];
  const text = rows.map(([k, v]) => k + ':\n' + v).join('\n\n');
  const html = '<table cellpadding="6" style="font-family:Helvetica,Arial,sans-serif;font-size:14px;border-collapse:collapse">' +
    rows.map(([k, v]) => '<tr><td style="vertical-align:top;color:#6b7280;white-space:nowrap">' + esc(k) +
      '</td><td style="white-space:pre-wrap">' + esc(v) + '</td></tr>').join('') + '</table>';

  try {
    const port = Number(process.env.SMTP_PORT || 465);
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
    await transporter.sendMail({
      from: '"FS SearchFund Website" <' + (process.env.SMTP_FROM || process.env.SMTP_USER) + '>',
      to: process.env.MAIL_TO || 'Info@fs-searchfund.com',
      replyTo: '"' + (d.firstName + ' ' + d.lastName).replace(/"/g, '') + '" <' + d.email + '>',
      subject: 'Website enquiry: ' + d.firstName + ' ' + d.lastName + ' (' + BACKGROUNDS[d.background] + ')',
      text,
      html
    });
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('Mail error:', e && e.message);
    return res.status(500).json({ ok: false, error: 'mail_failed' });
  }
};
