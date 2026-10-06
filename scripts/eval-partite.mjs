#!/usr/bin/env node
// Analizza con Stockfish tutte le posizioni delle partite dell'archivio e
// scrive le valutazioni in src/data/evals.json (solo numeri: nessun codice
// del motore finisce nel sito).
//
// USO:
//   brew install stockfish            (una volta sola, solo sul Mac)
//   node scripts/eval-partite.mjs     (analizza solo le posizioni nuove)
//   node scripts/eval-partite.mjs --force   (rianalizza tutto)
//
// Le valutazioni sono sempre dal punto di vista del BIANCO:
//   { c: 150 }  -> Bianco avanti di 1,5 pedoni
//   { m: 3 }    -> il Bianco da' matto in 3;  { m: -2 } -> il Nero da' matto in 2
//   { m: 0, w: 'w'|'b' } -> posizione di matto, ha vinto w

import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { Chess } from 'chess.js';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(DIR, '..');
const GAMES_DIR = path.join(ROOT, 'src', 'content', 'partite');
const OUT = path.join(ROOT, 'src', 'data', 'evals.json');

const DEPTH = 20;
// Tetto di tempo per posizione: nelle posizioni con lunghe sequenze di matto
// (es. la caccia al re in Averbakh-Kotov) la profondita' 20 puo' richiedere
// minuti. Si ferma a DEPTH oppure dopo MAX_MS, quello che arriva prima.
const MAX_MS = 4000;
const THREADS = 12;
const HASH_MB = 512;
const FORCE = process.argv.includes('--force');
const ENGINE = process.env.STOCKFISH || 'stockfish';

// Chiave di posizione: pezzi, tratto, arrocchi, en passant (senza contatori).
export const posKey = (fen) => fen.split(' ').slice(0, 4).join(' ');

// --- legge i PGN dai file .md dell'archivio ---
function readGames() {
  return fs
    .readdirSync(GAMES_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const txt = fs.readFileSync(path.join(GAMES_DIR, f), 'utf8');
      const m = txt.match(/^pgn:\s*"([^"]+)"/m);
      if (!m) throw new Error(`PGN non trovato in ${f}`);
      return { file: f, pgn: m[1] };
    });
}

// --- motore UCI ---
function startEngine() {
  const proc = spawn(ENGINE, [], { stdio: ['pipe', 'pipe', 'inherit'] });
  let buf = '';
  let waiter = null;
  proc.stdout.on('data', (d) => {
    buf += d.toString();
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);
      if (waiter) waiter(line);
    }
  });
  const send = (cmd) => proc.stdin.write(cmd + '\n');
  // invia un comando e attende la riga che soddisfa `until`, raccogliendo le altre
  const ask = (cmd, until) =>
    new Promise((resolve) => {
      const lines = [];
      waiter = (line) => {
        lines.push(line);
        if (until(line)) { waiter = null; resolve(lines); }
      };
      send(cmd);
    });
  return { proc, send, ask };
}

async function main() {
  const games = readGames();

  // posizioni uniche da valutare (le trasposizioni si valutano una volta sola)
  const positions = new Map(); // key -> fen completa
  for (const g of games) {
    const c = new Chess();
    c.loadPgn(g.pgn);
    const moves = c.history();
    const r = new Chess();
    positions.set(posKey(r.fen()), r.fen());
    for (const mv of moves) {
      r.move(mv);
      positions.set(posKey(r.fen()), r.fen());
    }
  }

  const old = !FORCE && fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : null;
  const evals = old && old.depth >= DEPTH ? old.positions : {};
  const todo = [...positions].filter(([k]) => !(k in evals));
  console.log(`${games.length} partite, ${positions.size} posizioni uniche, da analizzare: ${todo.length}`);

  if (todo.length) {
    const eng = startEngine();
    const idLines = await eng.ask('uci', (l) => l === 'uciok');
    const engineName = (idLines.find((l) => l.startsWith('id name')) || '').replace('id name ', '');
    eng.send(`setoption name Threads value ${THREADS}`);
    eng.send(`setoption name Hash value ${HASH_MB}`);
    await eng.ask('isready', (l) => l === 'readyok');
    console.log(`Motore: ${engineName}, profondita' ${DEPTH}`);

    const t0 = Date.now();
    let n = 0;
    for (const [key, fen] of todo) {
      const chess = new Chess(fen);
      // posizioni finali: niente motore
      if (chess.isCheckmate()) {
        evals[key] = { m: 0, w: chess.turn() === 'w' ? 'b' : 'w' };
      } else if (chess.isDraw() || chess.isStalemate()) {
        evals[key] = { c: 0 };
      } else {
        eng.send(`position fen ${fen}`);
        const tPos = Date.now();
        // sicurezza: se il motore non risponde, si ferma la ricerca
        const watchdog = setTimeout(() => {
          console.error(`\n  [watchdog] stop forzato: ${fen}`);
          eng.send('stop');
        }, MAX_MS + 10000);
        const lines = await eng.ask(`go depth ${DEPTH} movetime ${MAX_MS}`, (l) => l.startsWith('bestmove'));
        clearTimeout(watchdog);
        if (process.env.EVAL_LOG) {
          fs.appendFileSync(process.env.EVAL_LOG, `${n + 1}\t${Date.now() - tPos}ms\t${fen}\n`);
        }
        // ultima riga info con un punteggio (multipv 1)
        const info = lines.filter((l) => l.startsWith('info') && / score (cp|mate) /.test(l)).pop();
        const mt = info.match(/ score (cp|mate) (-?\d+)/);
        const sign = chess.turn() === 'w' ? 1 : -1; // il motore valuta per chi muove
        const v = parseInt(mt[2], 10) * sign;
        evals[key] = mt[1] === 'cp' ? { c: v } : { m: v };
      }
      n++;
      if (n % 10 === 0 || n === todo.length) {
        const s = ((Date.now() - t0) / 1000).toFixed(0);
        process.stdout.write(`\r  ${n}/${todo.length}  (${s}s)   `);
        // salvataggio intermedio: se si interrompe, si riparte da qui
        save(evals, engineName);
      }
    }
    process.stdout.write('\n');
    eng.send('quit');
    save(evals, engineName);
  } else {
    console.log('Nulla da fare: tutte le posizioni sono gia\' valutate.');
  }

  // rimuove le posizioni non piu' usate da nessuna partita
  const used = new Set(positions.keys());
  let removed = 0;
  for (const k of Object.keys(evals)) if (!used.has(k)) { delete evals[k]; removed++; }
  if (removed) { save(evals, old?.engine); console.log(`Rimosse ${removed} posizioni non piu' usate.`); }
}

function save(evals, engine) {
  const sorted = Object.fromEntries(Object.keys(evals).sort().map((k) => [k, evals[k]]));
  const data = { engine: engine || 'Stockfish', depth: DEPTH, positions: sorted };
  fs.writeFileSync(OUT, JSON.stringify(data) + '\n');
}

main().catch((e) => { console.error(e); process.exit(1); });
