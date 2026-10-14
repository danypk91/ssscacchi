// Classificatore di aperture: dato un PGN, trova il codice ECO e il nome
// dell'apertura usando il dataset pubblico di lichess (CC0).
//
// Metodo (lo stesso di lichess): si ripercorrono le mosse della partita e si
// cerca, tra tutte le posizioni toccate, quella piu' profonda presente nel
// dataset. Nessuna interpretazione: e' una semplice ricerca in tabella.
//
// Uso solo a build-time (legge i .tsv da filesystem).

import { Chess } from 'chess.js';
import { familyFromName } from '../data/opening-families';

// Import dei dataset come testo (bundlati da Vite): niente accesso a filesystem,
// cosi' funziona anche nella build di produzione.
import tsvA from '../data/openings/a.tsv?raw';
import tsvB from '../data/openings/b.tsv?raw';
import tsvC from '../data/openings/c.tsv?raw';
import tsvD from '../data/openings/d.tsv?raw';
import tsvE from '../data/openings/e.tsv?raw';

export interface OpeningInfo {
  eco: string;
  name: string;      // nome completo dal dataset (inglese), es. "Sicilian Defense: Najdorf Variation"
  family: string;    // famiglia in italiano, es. "Difesa Siciliana"
  variation: string; // parte dopo i ":" del nome, se presente
}

const TSV_FILES = [tsvA, tsvB, tsvC, tsvD, tsvE];

// Chiave posizione = primi 4 campi della FEN (pezzi, tratto, arrocchi, en passant).
// Ignora i contatori di mossa, cosi' le trasposizioni combaciano.
function positionKey(fen: string): string {
  return fen.split(' ').slice(0, 4).join(' ');
}

let _table: Map<string, { eco: string; name: string }> | null = null;

function loadTable(): Map<string, { eco: string; name: string }> {
  if (_table) return _table;
  const table = new Map<string, { eco: string; name: string }>();

  for (const text of TSV_FILES) {
    const lines = text.split('\n');
    // prima riga = intestazione
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      const [eco, name, pgn] = line.split('\t');
      if (!eco || !name || !pgn) continue;
      const chess = new Chess();
      try {
        chess.loadPgn(pgn);
      } catch {
        continue;
      }
      const key = positionKey(chess.fen());
      // Se due righe toccano la stessa posizione, teniamo la prima (nome piu' corto
      // per convenzione del dataset).
      if (!table.has(key)) table.set(key, { eco, name });
    }
  }

  _table = table;
  return table;
}

/**
 * Classifica una partita (array di mosse SAN o PGN gia' caricato).
 * Ritorna l'apertura piu' profonda riconosciuta, o null.
 */
export function classifyOpening(sanMoves: string[]): OpeningInfo | null {
  const table = loadTable();
  const chess = new Chess();
  let best: { eco: string; name: string } | null = null;

  // posizione iniziale inclusa (improbabile ma coerente)
  const startKey = positionKey(chess.fen());
  if (table.has(startKey)) best = table.get(startKey)!;

  // Limitiamo la ricerca all'apertura: le aperture nel dataset arrivano
  // raramente oltre la ~15a mossa. Scorriamo comunque fino a 30 semimosse.
  const maxPly = Math.min(sanMoves.length, 30);
  for (let i = 0; i < maxPly; i++) {
    const mv = chess.move(sanMoves[i]);
    if (!mv) break;
    const key = positionKey(chess.fen());
    const hit = table.get(key);
    if (hit) best = hit; // la piu' profonda vince
  }

  if (!best) return null;

  const colonIdx = best.name.indexOf(':');
  const family = familyFromName(best.name);
  const variation = colonIdx >= 0 ? best.name.slice(colonIdx + 1).trim() : '';

  return { eco: best.eco, name: best.name, family, variation };
}

/** Comodità: classifica direttamente da una stringa PGN. */
export function classifyPgn(pgn: string): OpeningInfo | null {
  const chess = new Chess();
  try {
    chess.loadPgn(pgn);
  } catch {
    return null;
  }
  return classifyOpening(chess.history());
}
