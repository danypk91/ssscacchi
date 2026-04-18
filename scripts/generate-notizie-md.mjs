import { readFileSync, writeFileSync, readdirSync, rmSync } from 'fs';
import { resolve } from 'path';

const RAW_DIR = resolve('./scripts/scraped-raw');
const OUT_DIR = resolve('./src/content/notizie');

// Italian month names to numbers
const MESI = {
  'gennaio': '01', 'febbraio': '02', 'marzo': '03', 'aprile': '04',
  'maggio': '05', 'giugno': '06', 'luglio': '07', 'agosto': '08',
  'settembre': '09', 'ottobre': '10', 'novembre': '11', 'dicembre': '12'
};

function extractYear(slug) {
  // Try to find year in slug
  const m = slug.match(/(20\d{2})/);
  return m ? parseInt(m[1]) : null;
}

function parseDate(body, slug, id) {
  const year = extractYear(slug);

  // Try patterns like "31 marzo 2026", "28 aprile 2022"
  for (const [mese, num] of Object.entries(MESI)) {
    const re = new RegExp(`(\\d{1,2})\\s+${mese}\\s+(20\\d{2})`, 'i');
    const m = body.match(re);
    if (m) {
      return `${m[2]}-${num}-${m[1].padStart(2, '0')}`;
    }
  }

  // Try "giorno mese" without year (use slug year)
  if (year) {
    for (const [mese, num] of Object.entries(MESI)) {
      // Match patterns like "31 marzo", "venerdì 14 dicembre", "Martedì 31 marzo"
      const re = new RegExp(`(\\d{1,2})\\s+${mese}(?!\\s+20)`, 'i');
      const m = body.match(re);
      if (m) {
        return `${year}-${num}-${m[1].padStart(2, '0')}`;
      }
    }

    // Try "mese giorno" patterns like "marzo 31"
    for (const [mese, num] of Object.entries(MESI)) {
      const re = new RegExp(`${mese}\\s+(\\d{1,2})`, 'i');
      const m = body.match(re);
      if (m) {
        return `${year}-${num}-${m[1].padStart(2, '0')}`;
      }
    }
  }

  // Try DD/MM/YYYY or DD-MM-YYYY
  {
    const m = body.match(/(\d{2})[\/\-](\d{2})[\/\-](20\d{2})/);
    if (m) {
      return `${m[3]}-${m[2]}-${m[1]}`;
    }
  }

  // Try YYYY-MM-DD
  {
    const m = body.match(/(20\d{2})-(\d{2})-(\d{2})/);
    if (m) {
      return `${m[1]}-${m[2]}-${m[3]}`;
    }
  }

  // Try date from slug patterns like 20220916
  {
    const m = slug.match(/(20\d{2})(\d{2})(\d{2})/);
    if (m) {
      return `${m[1]}-${m[2]}-${m[3]}`;
    }
  }

  // Fallback: use year from slug + approximate month based on content hints
  if (year) {
    // Try to find just a month mention
    for (const [mese, num] of Object.entries(MESI)) {
      if (body.toLowerCase().includes(mese)) {
        return `${year}-${num}-15`; // mid-month approximation
      }
    }
    return `${year}-01-01`; // fallback to Jan 1
  }

  // Last resort: try to guess year from ID ranges
  // IDs roughly: 2-44=2013, 45-75=2014, 78-108=2015, 103-160=2016, 161-199=2017, 202-230=2018, 232-270=2019, 271-297=2020-2021, 298-328=2022, 329-372=2023, 373-418=2024, 419-460=2025, 462-480=2026
  let guessYear;
  if (id <= 44) guessYear = 2013;
  else if (id <= 77) guessYear = 2014;
  else if (id <= 108) guessYear = 2015;
  else if (id <= 160) guessYear = 2016;
  else if (id <= 201) guessYear = 2017;
  else if (id <= 231) guessYear = 2018;
  else if (id <= 270) guessYear = 2019;
  else if (id <= 297) guessYear = 2020;
  else if (id <= 300) guessYear = 2021;
  else if (id <= 328) guessYear = 2022;
  else if (id <= 372) guessYear = 2023;
  else if (id <= 418) guessYear = 2024;
  else if (id <= 461) guessYear = 2025;
  else guessYear = 2026;

  return `${guessYear}-06-01`;
}

function makeExcerpt(body) {
  // Remove markdown formatting for excerpt
  let text = body
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n+/g, ' ')
    .trim();

  if (text.length > 200) {
    text = text.substring(0, 197) + '...';
  }
  return text;
}

function makeSlug(id, originalSlug) {
  // Clean up slug - remove numeric prefix if any, keep it readable
  return `${id}-${originalSlug}`;
}

function escapeYaml(str) {
  // Escape for YAML double-quoted string
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

// Read all scraped files
const files = readdirSync(RAW_DIR).filter(f => f.endsWith('.json') && !f.startsWith('_'));

console.log(`Processing ${files.length} files...`);

// First remove existing notizie
const existing = readdirSync(OUT_DIR).filter(f => f.endsWith('.md'));
for (const f of existing) {
  rmSync(resolve(OUT_DIR, f));
  console.log(`Removed old: ${f}`);
}

let count = 0;
const dateIssues = [];

for (const file of files) {
  const data = JSON.parse(readFileSync(resolve(RAW_DIR, file), 'utf8'));
  const date = parseDate(data.body, data.slug, data.id);
  const excerpt = makeExcerpt(data.body);
  const slug = makeSlug(data.id, data.slug);

  const md = `---
title: "${escapeYaml(data.title)}"
date: "${date}"
excerpt: "${escapeYaml(excerpt)}"
---

${data.body}
`;

  writeFileSync(resolve(OUT_DIR, `${slug}.md`), md);
  count++;

  // Track date issues
  if (date.endsWith('-01-01') || date.endsWith('-06-01') || date.endsWith('-15')) {
    dateIssues.push({ slug, date, title: data.title });
  }
}

console.log(`\nGenerated ${count} markdown files.`);
console.log(`\n${dateIssues.length} articles with approximate dates.`);
if (dateIssues.length > 0) {
  console.log('First 10:');
  dateIssues.slice(0, 10).forEach(d => console.log(`  ${d.slug}: ${d.date} - ${d.title}`));
}