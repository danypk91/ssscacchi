// Mappatura dei temi tattici dei puzzle lichess (inglese) -> italiano.
// I temi sono quelli del dataset puzzle di lichess (CC0).
// Se un tema non e' mappato, si mostra il codice originale.

export const THEME_IT: Record<string, string> = {
  // tipi di vantaggio / esito
  mate: 'Scacco matto',
  mateIn1: 'Matto in 1',
  mateIn2: 'Matto in 2',
  mateIn3: 'Matto in 3',
  mateIn4: 'Matto in 4',
  mateIn5: 'Matto in 5',
  crushing: 'Vantaggio decisivo',
  advantage: 'Vantaggio',
  equality: 'Pareggio',

  // motivi tattici
  fork: 'Forchetta',
  pin: 'Inchiodatura',
  skewer: 'Infilata',
  discoveredAttack: 'Scoperta',
  doubleCheck: 'Doppio scacco',
  sacrifice: 'Sacrificio',
  deflection: 'Deviazione',
  attraction: 'Attrazione',
  clearance: 'Sgombero',
  interference: 'Interferenza',
  intermezzo: 'Intermezzo',
  xRayAttack: 'Attacco a raggi X',
  hangingPiece: 'Pezzo in presa',
  trappedPiece: 'Pezzo intrappolato',
  capturingDefender: 'Eliminazione del difensore',
  defensiveMove: 'Mossa difensiva',
  quietMove: 'Mossa tranquilla',
  zugzwang: 'Zugzwang',
  doubleBishopMate: 'Matto dei due alfieri',
  bodenMate: 'Matto di Boden',
  backRankMate: "Matto dell'ultima traversa",
  smotheredMate: 'Matto affogato',
  arabianMate: 'Matto arabo',
  anastasiaMate: 'Matto di Anastasia',
  hookMate: 'Matto a uncino',
  dovetailMate: 'Matto a coda di rondine',
  promotion: 'Promozione',
  underPromotion: 'Sottopromozione',
  enPassant: 'En passant',
  castling: 'Arrocco',

  // fasi di gioco
  opening: 'Apertura',
  middlegame: 'Mediogioco',
  endgame: 'Finale',
  rookEndgame: 'Finale di torri',
  pawnEndgame: 'Finale di pedoni',
  queenEndgame: 'Finale di donne',
  bishopEndgame: 'Finale di alfieri',
  knightEndgame: 'Finale di cavalli',
  queenRookEndgame: 'Finale donna e torre',

  // lunghezza
  oneMove: 'Una mossa',
  short: 'Corto',
  long: 'Lungo',
  veryLong: 'Molto lungo',

  // altri
  master: 'Partita di maestri',
  masterVsMaster: 'Maestro vs maestro',
  superGM: 'Super Gran Maestri',
};

export function themeIt(code: string): string {
  return THEME_IT[code] ?? code;
}

// Temi "utili" da esporre come filtri (i piu' comuni e didattici).
export const FILTER_THEMES: string[] = [
  'fork', 'pin', 'skewer', 'discoveredAttack', 'sacrifice',
  'backRankMate', 'mateIn1', 'mateIn2', 'hangingPiece', 'endgame',
];

// Fasce di difficolta' in base al rating lichess.
export type Difficulty = 'facile' | 'medio' | 'difficile';
export function difficultyOf(rating: number): Difficulty {
  if (rating < 1300) return 'facile';
  if (rating < 1800) return 'medio';
  return 'difficile';
}
