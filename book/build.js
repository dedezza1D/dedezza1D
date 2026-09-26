// Renders the profile README as a set of parchment "book pages" (SVG).
// Edit the text in PAGES below, then: node book/build.js
const fs = require('fs');
const path = require('path');

const WIDTHS = JSON.parse(fs.readFileSync(path.join(__dirname, 'widths.json'), 'utf8'));
const OUT = path.join(__dirname, '..', 'assets', 'pages');

// ---- page geometry & palette -------------------------------------------
const W = 900, PAD = 14;                 // PAD = transparent margin for the drop shadow
const LEFT = 104, RIGHT = 796, TW = RIGHT - LEFT;
const BODY = 17, LH = 27;
const INK = '#2b1d14', CRIMSON = '#7a1424', GOLD = '#9a7a45', BROWN = '#5a3e2b', FADED = '#7a6450';
const SERIF = "Georgia,'Times New Roman','Liberation Serif',serif";
const FRAKTUR = "'Cambria Math','STIX Two Math','Noto Sans Math','Segoe UI Symbol','DejaVu Sans',serif";

// ---- helpers -------------------------------------------------------------
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function fraktur(s) {
  return [...s].map(ch => {
    const c = ch.codePointAt(0);
    if (c >= 65 && c <= 90) return String.fromCodePoint(0x1D56C + c - 65);
    if (c >= 97 && c <= 122) return String.fromCodePoint(0x1D586 + c - 97);
    return ch;
  }).join('');
}

function width(text, size, style = 'normal') {
  const t = WIDTHS[style];
  let w = 0;
  for (const ch of text) w += (t[ch] ?? 0.55);
  return w * size;
}

// Greedy wrap; `widthFor(i)` gives the available width for line i.
function wrap(text, size, widthFor, style) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = [];
  for (const word of words) {
    const trial = [...cur, word].join(' ');
    if (cur.length && width(trial, size, style) > widthFor(lines.length)) {
      lines.push(cur);
      cur = [word];
    } else cur.push(word);
  }
  if (cur.length) lines.push(cur);
  return lines;
}

// One justified line: every word placed with its own x.
function lineSVG(words, x, y, avail, size, style, last) {
  const attrs = `font-family="${SERIF}" font-size="${size}" fill="${INK}"${style === 'italic' ? ' font-style="italic"' : ''}`;
  const natural = width(words.join(' '), size, style);
  const slack = avail - natural;
  if (last || words.length < 2 || slack > avail * 0.25) {
    return `<text x="${x}" y="${y}" ${attrs}>${esc(words.join(' '))}</text>`;
  }
  const gap = width(' ', size, style) + slack / (words.length - 1);
  let cx = x, spans = '';
  for (const w of words) {
    spans += `<tspan x="${cx.toFixed(1)}">${esc(w)}</tspan>`;
    cx += width(w, size, style) + gap;
  }
  return `<text y="${y}" ${attrs}>${spans}</text>`;
}

const diamond = (x, y, r, fill) =>
  `<path d="M${x} ${y - r} L${x + r} ${y} L${x} ${y + r} L${x - r} ${y} Z" fill="${fill}"/>`;

function fleuron(cx, y, half = 150) {
  return `<g stroke="${GOLD}" stroke-width="1" fill="none">
    <line x1="${cx - half}" y1="${y}" x2="${cx - 22}" y2="${y}"/>
    <line x1="${cx + 22}" y1="${y}" x2="${cx + half}" y2="${y}"/>
    <path d="M${cx - 22} ${y} Q${cx - 11} ${y - 9} ${cx} ${y} Q${cx + 11} ${y - 9} ${cx + 22} ${y}"/>
    <path d="M${cx - 22} ${y} Q${cx - 11} ${y + 9} ${cx} ${y} Q${cx + 11} ${y + 9} ${cx + 22} ${y}"/>
  </g>${diamond(cx, y, 4, CRIMSON)}${diamond(cx - half - 6, y, 2.5, GOLD)}${diamond(cx + half + 6, y, 2.5, GOLD)}`;
}

const smallCaps = (text, x, y, size, fill, anchor = 'middle', spacing = 4) =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${SERIF}" font-size="${size}" letter-spacing="${spacing}" fill="${fill}">${esc(text.toUpperCase())}</text>`;

// ---- block renderers: each returns { svg, h } starting at y --------------
const blocks = {
  chapter({ num, title }, y) {
    const cx = W / 2;
    return {
      svg: smallCaps(`Chapter ${num}`, cx, y + 16, 13, CRIMSON, 'middle', 6) +
        `<text x="${cx}" y="${y + 70}" text-anchor="middle" font-family="${FRAKTUR}" font-size="44" fill="${INK}">${esc(fraktur(title))}</text>` +
        fleuron(cx, y + 96, 130),
      h: 130,
    };
  },

  meta({ text }, y) {
    return {
      svg: `<text x="${W / 2}" y="${y + 4}" text-anchor="middle" font-family="${SERIF}" font-style="italic" font-size="15" fill="${FADED}">${esc(text)}</text>`,
      h: 34,
    };
  },

  p({ text, dropcap }, y) {
    let svg = '', body = text;
    const BOX = 2 * LH + 14, IND = BOX + 12;
    if (dropcap) {
      const letter = text[0];
      body = text.slice(1);
      const top = y + LH - 13 - 1;
      svg += `<rect x="${LEFT}" y="${top}" width="${BOX}" height="${BOX}" fill="${CRIMSON}"/>
        <rect x="${LEFT + 3}" y="${top + 3}" width="${BOX - 6}" height="${BOX - 6}" fill="none" stroke="${GOLD}" stroke-width="1.2"/>
        <text x="${LEFT + BOX / 2}" y="${top + BOX * 0.74}" text-anchor="middle" font-family="${FRAKTUR}" font-size="${BOX * 0.72}" fill="#f1e4c6">${esc(fraktur(letter))}</text>`;
    }
    const widthFor = i => (dropcap && i < 3 ? TW - IND : TW);
    const lines = wrap(body, BODY, widthFor);
    lines.forEach((words, i) => {
      const x = dropcap && i < 3 ? LEFT + IND : LEFT;
      svg += lineSVG(words, x, y + LH * (i + 1), widthFor(i), BODY, 'normal', i === lines.length - 1);
    });
    const h = Math.max(lines.length, dropcap ? 3 : 0) * LH + 14;
    return { svg, h };
  },

  list({ items }, y) {
    let svg = '', cy = y;
    const IND = 26;
    for (const item of items) {
      const lines = wrap(item, BODY, () => TW - IND);
      svg += diamond(LEFT + 7, cy + LH - 6, 4, CRIMSON);
      lines.forEach((words, i) => {
        svg += lineSVG(words, LEFT + IND, cy + LH * (i + 1), TW - IND, BODY, 'normal', i === lines.length - 1);
      });
      cy += lines.length * LH + 8;
    }
    return { svg, h: cy - y + 8 };
  },

  quote({ text }, y) {
    const inset = 70, qw = TW - 2 * inset;
    const lines = wrap(text, 18, () => qw, 'italic');
    let svg = `<line x1="${LEFT + inset - 16}" y1="${y + 10}" x2="${LEFT + inset - 16}" y2="${y + lines.length * 28 + 10}" stroke="${CRIMSON}" stroke-width="2"/>`;
    lines.forEach((words, i) => {
      svg += `<text x="${LEFT + inset}" y="${y + 28 * (i + 1)}" font-family="${SERIF}" font-style="italic" font-size="18" fill="${BROWN}">${esc(words.join(' '))}</text>`;
    });
    return { svg, h: lines.length * 28 + 30 };
  },

  space({ h }) { return { svg: '', h }; },

  finis(_, y) {
    return { svg: fleuron(W / 2, y + 20, 90) + smallCaps('Finis', W / 2, y + 56, 12, CRIMSON, 'middle', 8), h: 70 };
  },

  // title page content
  title(_, y) {
    const cx = W / 2;
    const svg =
      fleuron(cx, y + 20, 170) +
      `<text x="${cx}" y="${y + 110}" text-anchor="middle" font-family="${FRAKTUR}" font-size="50" fill="${INK}">${esc(fraktur('Andrezza Medeiros Souza'))}</text>` +
      smallCaps('Backend Engineer', cx, y + 160, 15, CRIMSON, 'middle', 7) +
      `<text x="${cx}" y="${y + 190}" text-anchor="middle" font-family="${SERIF}" font-style="italic" font-size="17" fill="${BROWN}">Java &amp; Go · Security</text>` +
      `<line x1="${cx - 60}" y1="${y + 218}" x2="${cx + 60}" y2="${y + 218}" stroke="${GOLD}" stroke-width="1"/>` +
      `<text x="${cx}" y="${y + 262}" text-anchor="middle" font-family="${SERIF}" font-style="italic" font-size="18" fill="${INK}">“Java and Go day to day — increasingly focused</text>` +
      `<text x="${cx}" y="${y + 288}" text-anchor="middle" font-family="${SERIF}" font-style="italic" font-size="18" fill="${INK}">on the security side of both.”</text>` +
      fleuron(cx, y + 330, 110) +
      smallCaps('Leipzig', cx, y + 372, 12, FADED, 'middle', 6) +
      `<text x="${cx}" y="${y + 398}" text-anchor="middle" font-family="${SERIF}" font-size="14" letter-spacing="1" fill="${CRIMSON}">andrezzaammss@gmail.com</text>`;
    return { svg, h: 420 };
  },
};

// ---- page frame -------------------------------------------------------------
function page({ file, folio, running, content }) {
  let y = running ? 128 : 96, body = '';
  for (const b of content) {
    const r = blocks[b.type](b, y);
    body += r.svg + '\n';
    y += r.h;
  }
  const H = y + 90;
  const x0 = PAD, y0 = PAD, pw = W - 2 * PAD, ph = H - 2 * PAD;

  const corner = (x, y) => `<g>${diamond(x, y, 6, CRIMSON)}<circle cx="${x}" cy="${y}" r="10" fill="none" stroke="${GOLD}" stroke-width="1"/></g>`;
  const ix = x0 + 22, iy = y0 + 22, iw = pw - 44, ih = ph - 44;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs>
  <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#f5ecd6"/><stop offset="0.55" stop-color="#efe2c4"/><stop offset="1" stop-color="#e4d2ab"/>
  </linearGradient>
  <radialGradient id="vignette" cx="50%" cy="45%" r="75%">
    <stop offset="0.6" stop-color="#8a5a2b" stop-opacity="0"/><stop offset="1" stop-color="#8a5a2b" stop-opacity="0.32"/>
  </radialGradient>
  <radialGradient id="foxing" cx="50%" cy="50%" r="50%">
    <stop offset="0" stop-color="#a0703a" stop-opacity="0.10"/><stop offset="1" stop-color="#a0703a" stop-opacity="0"/>
  </radialGradient>
  <filter id="grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="${folio.length * 7}" result="n"/>
    <feColorMatrix in="n" values="0 0 0 0 0.35  0 0 0 0 0.22  0 0 0 0 0.1  0 0 0 0.10 0"/>
  </filter>
  <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
    <feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="#000" flood-opacity="0.45"/>
  </filter>
</defs>
<rect x="${x0}" y="${y0}" width="${pw}" height="${ph}" fill="url(#paper)" filter="url(#shadow)"/>
<rect x="${x0}" y="${y0}" width="${pw}" height="${ph}" filter="url(#grain)"/>
<circle cx="${x0 + pw * 0.82}" cy="${y0 + ph * 0.18}" r="90" fill="url(#foxing)"/>
<circle cx="${x0 + pw * 0.12}" cy="${y0 + ph * 0.86}" r="70" fill="url(#foxing)"/>
<rect x="${x0}" y="${y0}" width="${pw}" height="${ph}" fill="url(#vignette)"/>
<rect x="${ix - 8}" y="${iy - 8}" width="${iw + 16}" height="${ih + 16}" fill="none" stroke="${BROWN}" stroke-width="1.6"/>
<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="none" stroke="${BROWN}" stroke-width="0.6"/>
<rect x="${ix + 5}" y="${iy + 5}" width="${iw - 10}" height="${ih - 10}" fill="none" stroke="${CRIMSON}" stroke-width="0.6"/>
${corner(ix, iy)}${corner(ix + iw, iy)}${corner(ix, iy + ih)}${corner(ix + iw, iy + ih)}
${running ? `${smallCaps('A. M. Souza', LEFT, 88, 10, FADED, 'start', 3)}${smallCaps(running, RIGHT, 88, 10, FADED, 'end', 3)}
<line x1="${LEFT}" y1="98" x2="${RIGHT}" y2="98" stroke="${GOLD}" stroke-width="0.6"/>` : ''}
${body}
<text x="${W / 2}" y="${H - 50}" text-anchor="middle" font-family="${SERIF}" font-style="italic" font-size="13" fill="${FADED}">· ${folio} ·</text>
</svg>
`;
  fs.writeFileSync(path.join(OUT, file), svg);
  return { file, H };
}

// ---- the book ---------------------------------------------------------------
const PAGES = [
  { file: '0-title.svg', folio: 'i', content: [{ type: 'title' }] },
  {
    file: '1-background.svg', folio: 'ii', running: 'Background',
    content: [
      { type: 'chapter', num: 'I', title: 'Background' },
      { type: 'p', dropcap: true, text: "Backend developer since 2020, in Brazil and then Germany. I've worked on financial reconciliation, Kafka consumers for stock exchange orders, and an encrypted email platform running on NATS JetStream with mTLS between tenants." },
      { type: 'p', text: 'A few things from that work that stuck with me:' },
      { type: 'list', items: [
        'Synchronous deletes on a 60 GB object store were blocking NATS and taking the service down for about two hours a day. Moving the deletes to an async queue made it go away.',
        "For an OTP replay bug, the quick fix was an in-memory cache of used codes. I pushed for storing them in the database instead, so a restart or a second instance couldn't reopen the hole.",
        "I've also fixed an XSS, a data leak through an API response and an antivirus bypass on file uploads.",
      ] },
      { type: 'quote', text: "The security bugs are the part I liked most, and it's where I want to keep going." },
    ],
  },
  {
    file: '2-taskflow.svg', folio: 'iii', running: 'TaskFlow',
    content: [
      { type: 'chapter', num: 'II', title: 'TaskFlow' },
      { type: 'meta', text: 'Go · React/TypeScript' },
      { type: 'p', dropcap: true, text: 'My first real Go project. It started as a task queue on NATS JetStream and Postgres, and I gave it a job to make it honest: you upload a PDF or a scan, it runs OCR (Tesseract), finds the personal data, writes a GDPR/LGPD report and deletes the original.' },
      { type: 'list', items: [
        'Messages can arrive twice, so handlers are idempotent. Failed tasks retry with backoff and end up in a DLQ.',
        'The task row doubles as an outbox. If the process dies between the Postgres commit and the NATS publish, it gets republished.',
        "Workers hold heartbeat leases, so a crashed worker's task gets picked up by someone else and never by two at once.",
        "A 16-digit number isn't a card number until it passes Luhn. Same idea for IBANs (mod-97) and CPF/CNPJ (mod-11).",
        'Document text and PII never go into logs, traces, error messages or the DLQ.',
        "Ships as a server behind nginx, and as a desktop app for people who don't want their documents leaving the machine.",
        'Observability via OpenTelemetry/Prometheus/Grafana/Loki, integration tests against real Postgres in CI.',
      ] },
    ],
  },
  {
    file: '3-paywallet.svg', folio: 'iv', running: 'PayWallet',
    content: [
      { type: 'chapter', num: 'III', title: 'PayWallet' },
      { type: 'meta', text: 'Java 21 · Spring Boot' },
      { type: 'p', dropcap: true, text: 'A wallet with transfers, Pix and merchant charges.' },
      { type: 'list', items: [
        "Double-entry ledger. A balance is never updated on its own: every transfer writes postings that sum to zero, and Postgres constraints reject anything that doesn't.",
        "The Kafka event is written to an outbox table in the same transaction as the transfer, so there's no transfer without an event or event without a transfer.",
        'Feed in MongoDB, idempotency keys and daily limits in Redis, KYC documents in a private S3 bucket.',
        "Access tokens are signed with RS256 and published on a JWKS endpoint. Reusing an old refresh token kills the whole session. Login runs BCrypt even for unknown emails, so response time doesn't tell you if an account exists.",
      ] },
    ],
  },
  {
    file: '4-open-source.svg', folio: 'v', running: 'Open Source',
    content: [
      { type: 'chapter', num: 'IV', title: 'Open Source' },
      { type: 'p', dropcap: true, text: "I have a contribution in Spring Boot Migrator and want more. I try to ship a small Go project most weeks, and I'm looking for messaging or security projects with open issues — reach out at andrezzaammss@gmail.com if you have one." },
      { type: 'space', h: 10 },
      { type: 'quote', text: 'Portuguese (native) · English (fluent, day-to-day work language) · German (B1) · Spanish (learning)' },
      { type: 'finis' },
    ],
  },
];

fs.mkdirSync(OUT, { recursive: true });
for (const p of PAGES) {
  const { file, H } = page(p);
  console.log(`${file}  ${W}x${H}`);
}
