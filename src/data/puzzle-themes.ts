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

  // aggiunti (presenti nel campione)
  kingsideAttack: 'Attacco sul lato di re',
  queensideAttack: 'Attacco sul lato di donna',
  advancedPawn: 'Pedone avanzato',
  exposedKing: 'Re esposto',
  discoveredCheck: 'Scacco di scoperta',
  attackingF2F7: 'Attacco a f2/f7',
  collinearMove: 'Mossa collineare',
  operaMate: "Matto dell'Opera",
  pillsburysMate: 'Matto di Pillsbury',
  cornerMate: "Matto nell'angolo",
  epauletteMate: 'Matto delle spalline',
  killBoxMate: 'Matto a scatola',
  triangleMate: 'Matto a triangolo',
  swallowstailMate: 'Matto a coda di rondine (Guéridon)',
  morphysMate: 'Matto di Morphy',
  vukovicMate: 'Matto di Vuković',
  balestraMate: 'Matto a balestra',
  blindSwineMate: 'Matto dei maiali ciechi',
};

export function themeIt(code: string): string {
  return THEME_IT[code] ?? code;
}

// Gruppi di temi mostrati nel menu "Argomento" (come la pagina temi di lichess).
// I temi di sola lunghezza/fonte (short, long, master...) non sono argomenti.
export const THEME_GROUPS: { label: string; themes: string[] }[] = [
  {
    label: 'Motivi tattici',
    themes: [
      'fork', 'pin', 'skewer', 'discoveredAttack', 'discoveredCheck', 'doubleCheck',
      'sacrifice', 'deflection', 'attraction', 'clearance', 'interference',
      'intermezzo', 'xRayAttack', 'capturingDefender', 'hangingPiece',
      'trappedPiece', 'quietMove', 'defensiveMove', 'zugzwang',
    ],
  },
  {
    label: 'Scacco matto',
    themes: [
      'mateIn1', 'mateIn2', 'mateIn3', 'mateIn4', 'mate', 'backRankMate',
      'smotheredMate', 'arabianMate', 'anastasiaMate', 'hookMate', 'bodenMate',
      'doubleBishopMate', 'operaMate', 'pillsburysMate', 'cornerMate',
      'epauletteMate', 'dovetailMate', 'swallowstailMate', 'killBoxMate',
      'triangleMate', 'morphysMate', 'vukovicMate', 'balestraMate', 'blindSwineMate',
    ],
  },
  {
    label: 'Attacco e pedoni',
    themes: [
      'kingsideAttack', 'queensideAttack', 'exposedKing', 'attackingF2F7',
      'advancedPawn', 'promotion', 'underPromotion', 'enPassant', 'castling',
    ],
  },
  {
    label: 'Fase di gioco',
    themes: [
      'opening', 'middlegame', 'endgame', 'rookEndgame', 'pawnEndgame',
      'queenEndgame', 'bishopEndgame', 'knightEndgame', 'queenRookEndgame',
    ],
  },
  {
    label: 'Obiettivo',
    themes: ['crushing', 'advantage', 'equality'],
  },
];
// sotto questa soglia un tema non compare nel menu (troppo pochi puzzle)
export const MIN_PUZZLES_PER_THEME = 3;

// Fasce di difficolta' in base al rating lichess.
export type Difficulty = 'facile' | 'medio' | 'difficile';
export function difficultyOf(rating: number): Difficulty {
  if (rating < 1300) return 'facile';
  if (rating < 1800) return 'medio';
  return 'difficile';
}
