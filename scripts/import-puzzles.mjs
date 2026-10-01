#!/usr/bin/env node
// Import dei puzzle lichess (CC0) in un JSON curato per il sito.
//
// USO:
//   1) Scarica il database puzzle da https://database.lichess.org/#puzzles
//      (file lichess_db_puzzle.csv.zst) e decomprimilo:
//        zstd -d lichess_db_puzzle.csv.zst
//   2) Lancia:
//        node scripts/import-puzzles.mjs /percorso/lichess_db_puzzle.csv
//
// Seleziona un sottoinsieme didattico (difficolta' facile->media, molto popolari,
// temi utili) e scrive src/data/puzzles.json. Regola i parametri qui sotto.

import fs from 'node:fs';
import readline from 'node:readline';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(DIR, '..', 'src', 'data', 'puzzles.json');

const input = process.argv[2];
if (!input) {
  console.error('Uso: node scripts/import-puzzles.mjs <lichess_db_puzzle.csv>');
  process.exit(1);
}

// --- Parametri di selezione (modificabili) ---
const MAX_PUZZLES = 250;        // quanti puzzle tenere in totale
const MIN_RATING = 800;         // difficolta' minima
const MAX_RATING = 1700;        // difficolta' massima (facile->medio)
const MIN_POPULARITY = 90;      // 0..100: solo puzzle molto apprezzati
const MIN_PLAYS = 1000;         // solo puzzle ben testati
// bilanciamo per fascia di difficolta'
const QUOTA = { facile: 100, medio: 100, difficile: 50 };

function difficultyOf(rating) {
  if (rating < 1300) return 'facile';
  if (rating < 1800) return 'medio';
  return 'difficile';
}

const counts = { facile: 0, medio: 0, difficile: 0 };
const picked = [];

const rl = readline.createInterface({
  input: fs.createReadStream(input),
  crlfDelay: Infinity,
});

let isHeader = true;
let scanned = 0;

rl.on('line', (line) => {
  if (isHeader) { isHeader = false; return; }
  if (picked.length >= MAX_PUZZLES) { rl.close(); return; }
  scanned++;

  // CSV semplice: i campi puzzle lichess non contengono virgole nei valori usati
  const [puzzleId, fen, moves, ratingStr, , popStr, playsStr, themes, gameUrl] =
    line.split(',');

  const rating = parseInt(ratingStr, 10);
  const pop = parseInt(popStr, 10);
  const plays = parseInt(playsStr, 10);
  if (!fen || !moves || Number.isNaN(rating)) return;
  if (rating < MIN_RATING || rating > MAX_RATING) return;
  if (pop < MIN_POPULARITY || plays < MIN_PLAYS) return;

  const diff = difficultyOf(rating);
  if (counts[diff] >= QUOTA[diff]) return;

  counts[diff]++;
  picked.push({
    id: puzzleId,
    fen,
    moves: moves.split(' '),          // UCI; la 1a mossa e' quella dell'avversario
    rating,
    themes: (themes || '').split(' ').filter(Boolean),
    url: gameUrl || '',
  });
});

rl.on('close', () => {
  // mescola e ordina per difficolta' crescente
  picked.sort((a, b) => a.rating - b.rating);
  fs.writeFileSync(OUT, JSON.stringify(picked, null, 0));
  console.log(`Scansionate ${scanned} righe.`);
  console.log(`Selezionati ${picked.length} puzzle:`, counts);
  console.log(`Scritto ${OUT}`);
});
