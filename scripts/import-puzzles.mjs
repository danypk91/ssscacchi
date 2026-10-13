#!/usr/bin/env node
// Import dei puzzle lichess (CC0) in un JSON curato per il sito.
//
// USO:
//   1) Scarica il database: https://database.lichess.org/#puzzles
//      (file lichess_db_puzzle.csv.zst, ~300 MB)
//   2) node scripts/import-puzzles.mjs /percorso/lichess_db_puzzle.csv.zst
//      (accetta anche il .csv gia' decompresso; per il .zst serve `zstd`)
//
// Estrae un CAMPIONE CASUALE da tutto l'archivio (non i primi del file),
// bilanciato per difficolta', solo puzzle molto giocati e apprezzati,
// e verifica ogni soluzione con chess.js. Scrive src/data/puzzles.json.
// Il campione e' riproducibile: stesso SEED -> stessi puzzle.

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { Chess } from 'chess.js';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(DIR, '..', 'src', 'data', 'puzzles.json');

const input = process.argv[2];
if (!input) {
  console.error('Uso: node scripts/import-puzzles.mjs <lichess_db_puzzle.csv[.zst]>');
  process.exit(1);
}

// --- Parametri di selezione (modificabili) ---
const SEED = 'santasabina-2026';
const MIN_POPULARITY = 90;   // 0..100
const MIN_PLAYS = 2000;      // puzzle ben testati
const MAX_SOL_MOVES = 8;     // mosse totali (avversario + utente): niente puzzle lunghissimi
// fasce coerenti con difficultyOf() in src/data/puzzle-themes.ts
const BANDS = [
  { name: 'facile', min: 600, max: 1299, quota: 120 },
  { name: 'medio', min: 1300, max: 1799, quota: 120 },
  { name: 'difficile', min: 1800, max: 2300, quota: 60 },
];

// punteggio pseudo-casuale ma deterministico per ogni puzzle
const score = (id) => createHash('sha1').update(SEED + id).digest().readUInt32BE(0);

// per ogni fascia teniamo i `quota * 3` candidati con punteggio piu' basso
// (margine per scartare quelli che non passano la verifica)
const pools = BANDS.map(() => []);
function offer(pool, item, keep) {
  if (pool.length < keep) { pool.push(item); pool.sort((a, b) => a.s - b.s); return; }
  if (item.s >= pool[pool.length - 1].s) return;
  pool[pool.length - 1] = item;
  pool.sort((a, b) => a.s - b.s);
}

const stream = input.endsWith('.zst')
  ? spawn('zstd', ['-dc', input], { stdio: ['ignore', 'pipe', 'inherit'] }).stdout
  : fs.createReadStream(input);
const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

let header = null;
let scanned = 0;
for await (const line of rl) {
  if (!header) { header = line.split(','); continue; }
  scanned++;
  if (scanned % 500000 === 0) process.stdout.write(`\r  letti ${scanned.toLocaleString('it')}...`);
  const f = line.split(',');
  const [id, fen, moves, ratingS, , popS, playsS, themes, url] = f;
  const rating = +ratingS, pop = +popS, plays = +playsS;
  if (!fen || !moves || pop < MIN_POPULARITY || plays < MIN_PLAYS) continue;
  if (moves.split(' ').length > MAX_SOL_MOVES) continue;
  const b = BANDS.findIndex((x) => rating >= x.min && rating <= x.max);
  if (b < 0) continue;
  offer(pools[b], { s: score(id), id, fen, moves, rating, themes, url }, BANDS[b].quota * 3);
}
process.stdout.write('\n');

// verifica con chess.js e taglio alla quota
const picked = [];
BANDS.forEach((band, i) => {
  let n = 0;
  for (const p of pools[i]) {
    if (n >= band.quota) break;
    const uci = p.moves.split(' ');
    const c = new Chess(p.fen);
    let ok = true;
    for (const m of uci) {
      try { c.move({ from: m.slice(0, 2), to: m.slice(2, 4), promotion: m.slice(4) || undefined }); }
      catch { ok = false; break; }
    }
    if (!ok) continue;
    picked.push({
      id: p.id,
      fen: p.fen,
      moves: uci, // la 1a mossa e' dell'avversario
      rating: p.rating,
      themes: (p.themes || '').split(' ').filter(Boolean),
      url: p.url || '',
    });
    n++;
  }
  console.log(`  ${band.name}: ${n}/${band.quota}`);
});

picked.sort((a, b) => a.rating - b.rating);
fs.writeFileSync(OUT, JSON.stringify(picked) + '\n');
console.log(`Letti ${scanned.toLocaleString('it')} puzzle, selezionati ${picked.length}.`);
console.log(`Scritto ${path.relative(process.cwd(), OUT)} (${Math.round(fs.statSync(OUT).size / 1024)} KB)`);
