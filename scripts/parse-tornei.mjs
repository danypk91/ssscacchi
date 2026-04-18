import * as cheerio from 'cheerio';
import { readFileSync, writeFileSync, readdirSync, rmSync } from 'fs';
import { resolve } from 'path';

const INPUT_DIR = resolve('./scripts/scraped-tornei');
const OUTPUT_DIR = resolve('./src/content/tornei');

const MESI = {
  'gennaio': '01', 'febbraio': '02', 'marzo': '03', 'aprile': '04',
  'maggio': '05', 'giugno': '06', 'luglio': '07', 'agosto': '08',
  'settembre': '09', 'ottobre': '10', 'novembre': '11', 'dicembre': '12'
};

function parseDate(dateStr, year) {
  dateStr = dateStr.trim().toLowerCase();
  for (const [mese, num] of Object.entries(MESI)) {
    const re = new RegExp(`(\\d{1,2})\\s+${mese}(?:\\s+(\\d{4}))?`);
    const m = dateStr.match(re);
    if (m) {
      const y = m[2] || year;
      return `${y}-${num}-${m[1].padStart(2, '0')}`;
    }
  }
  return `${year}-01-01`;
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function escapeYaml(str) {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function parseYear(year) {
  const html = readFileSync(resolve(INPUT_DIR, `${year}.html`), 'utf8');
  const $ = cheerio.load(html);
  const body = $('div[itemprop="articleBody"]');
  const rows = body.find('table tbody tr');
  const tornei = [];

  rows.each((i, row) => {
    const cells = $(row).find('td');
    if (cells.length < 3) return;

    // Column 0: Tournament name (may have links)
    const nameCell = $(cells[0]);
    const titleLink = nameCell.find('a').first();
    const title = (titleLink.text() || nameCell.text()).trim();
    const torneoUrl = titleLink.attr('href') || '';

    // Column 1: Start date
    const dateStr = $(cells[1]).text().trim();
    const date = parseDate(dateStr, year);

    // Column 2: Rounds
    const turni = $(cells[2]).text().trim();

    // Column 3: Info/attachments (optional)
    const infoCell = cells.length >= 4 ? $(cells[3]) : null;
    const attachments = [];
    if (infoCell) {
      infoCell.find('a').each((j, a) => {
        const href = $(a).attr('href') || '';
        const label = $(a).text().trim();
        if (href && label) {
          let fullUrl = href;
          if (href.startsWith('/')) {
            fullUrl = 'https://santasabina.altervista.org' + href;
          }
          attachments.push({ label, url: fullUrl });
        }
      });
    }

    // Determine bando, classifica, vesus, fotoAlbum
    let bando = '';
    let classifica = '';
    let vesus = '';
    let fotoAlbum = '';
    const documenti = [];

    // Check torneo URL
    if (torneoUrl.includes('vesus.org')) {
      vesus = torneoUrl;
    } else if (torneoUrl.includes('standing.html') || torneoUrl.includes('classifica')) {
      classifica = torneoUrl.startsWith('/') ? 'https://santasabina.altervista.org' + torneoUrl : torneoUrl;
    }

    for (const att of attachments) {
      const lowerLabel = att.label.toLowerCase();
      if (lowerLabel.includes('bando') || lowerLabel.includes('regolamento')) {
        bando = att.url;
      } else if (lowerLabel.includes('classifica') || lowerLabel.includes('standing')) {
        classifica = att.url;
      } else if (lowerLabel.includes('fotograf')) {
        fotoAlbum = att.url;
      } else if (att.url.includes('vesus.org')) {
        vesus = att.url;
      } else {
        documenti.push({ label: att.label, file: att.url });
      }
    }

    if (!title) return;

    tornei.push({
      title,
      year,
      date,
      dateStr,
      turni,
      bando,
      classifica,
      vesus,
      fotoAlbum,
      documenti,
    });
  });

  return tornei;
}

// Remove existing tornei
const existing = readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.md'));
for (const f of existing) {
  rmSync(resolve(OUTPUT_DIR, f));
}
console.log(`Removed ${existing.length} existing files.`);

// Parse all years
const allTornei = [];
const years = readdirSync(INPUT_DIR).filter(f => f.endsWith('.html')).map(f => parseInt(f)).sort((a, b) => b - a);

for (const year of years) {
  const tornei = parseYear(year);
  console.log(`${year}: ${tornei.length} tornei`);
  allTornei.push(...tornei);
}

// Generate markdown files
const slugCounts = {};
for (const t of allTornei) {
  let slug = slugify(t.title);
  if (!slug) slug = `torneo-${t.year}`;

  // Ensure unique slug
  const key = slug;
  if (slugCounts[key]) {
    slugCounts[key]++;
    slug = `${slug}-${slugCounts[key]}`;
  } else {
    slugCounts[key] = 1;
  }

  let frontmatter = `---
title: "${escapeYaml(t.title)}"
year: ${t.year}
date: "${t.date}"
excerpt: "${escapeYaml(t.turni || t.title)}"`;

  if (t.bando) frontmatter += `\nbando: "${escapeYaml(t.bando)}"`;
  if (t.classifica) frontmatter += `\nclassifica: "${escapeYaml(t.classifica)}"`;
  if (t.vesus) frontmatter += `\nvesus: "${escapeYaml(t.vesus)}"`;
  if (t.fotoAlbum) frontmatter += `\nfotoAlbum: "${escapeYaml(t.fotoAlbum)}"`;
  if (t.documenti.length > 0) {
    frontmatter += `\ndocumenti:`;
    for (const d of t.documenti) {
      frontmatter += `\n  - label: "${escapeYaml(d.label)}"`;
      frontmatter += `\n    file: "${escapeYaml(d.file)}"`;
    }
  }

  frontmatter += `\n---`;

  let body = '';
  if (t.turni) {
    body += `\n${t.turni}`;
  }

  const md = frontmatter + '\n' + body + '\n';
  writeFileSync(resolve(OUTPUT_DIR, `${slug}.md`), md);
}

console.log(`\nGenerated ${allTornei.length} tournament files.`);