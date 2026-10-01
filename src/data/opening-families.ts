// Dizionario delle FAMIGLIE di apertura: nome inglese del dataset lichess ->
// nome italiano standard (quello usato nei libri e dalla FSI).
//
// Mappiamo solo la "famiglia" (la parte del nome prima dei due punti).
// Le varianti restano in inglese come nel dataset, per non introdurre
// traduzioni arbitrarie.
//
// Questa tabella e' rivedibile a mano: se una famiglia non e' presente,
// la funzione restituisce il nome inglese cosi' com'e'.

const FAMILY_IT: Record<string, string> = {
  // Aperture di re (1.e4 ...)
  'Sicilian Defense': 'Difesa Siciliana',
  'French Defense': 'Difesa Francese',
  'Caro-Kann Defense': 'Difesa Caro-Kann',
  'Ruy Lopez': 'Partita Spagnola',
  'Italian Game': 'Partita Italiana',
  'Scotch Game': 'Partita Scozzese',
  'Russian Game': 'Difesa Russa (Petroff)',
  'Petrov Defense': 'Difesa Russa (Petroff)',
  "Philidor Defense": 'Difesa Philidor',
  'Pirc Defense': 'Difesa Pirc',
  'Modern Defense': 'Difesa Moderna',
  'Scandinavian Defense': 'Difesa Scandinava',
  "Alekhine Defense": 'Difesa Alekhine',
  "King's Gambit": 'Gambetto di Re',
  "King's Gambit Accepted": 'Gambetto di Re accettato',
  "King's Gambit Declined": 'Gambetto di Re rifiutato',
  'Vienna Game': 'Partita Viennese',
  'Bishop\u0027s Opening': 'Apertura di Alfiere',
  "King's Pawn Game": 'Apertura di pedone di re',
  'Four Knights Game': 'Partita dei Quattro Cavalli',
  'Three Knights Opening': 'Partita dei Tre Cavalli',
  'Petrov': 'Difesa Russa (Petroff)',
  'Center Game': 'Partita di Centro',
  'Ponziani Opening': 'Apertura Ponziani',

  // Aperture di donna (1.d4 ...)
  "Queen's Gambit": 'Gambetto di Donna',
  "Queen's Gambit Accepted": 'Gambetto di Donna accettato',
  "Queen's Gambit Declined": 'Gambetto di Donna rifiutato',
  'Slav Defense': 'Difesa Slava',
  'Semi-Slav Defense': 'Difesa Semi-Slava',
  'Tarrasch Defense': 'Difesa Tarrasch',
  "Queen's Pawn Game": 'Apertura di pedone di donna',
  "Nimzo-Indian Defense": 'Difesa Nimzo-indiana',
  "Queen's Indian Defense": 'Difesa Ovest-indiana',
  "King's Indian Defense": 'Difesa Est-indiana',
  'Grunfeld Defense': 'Difesa Grünfeld',
  "Gr\u00fcnfeld Defense": 'Difesa Grünfeld',
  'Catalan Opening': 'Apertura Catalana',
  'Benoni Defense': 'Difesa Benoni',
  'Benko Gambit': 'Gambetto Benko',
  'Dutch Defense': 'Difesa Olandese',
  'Bogo-Indian Defense': 'Difesa Bogo-indiana',
  'Trompowsky Attack': 'Attacco Trompowsky',
  'London System': 'Sistema Londra',
  'Torre Attack': 'Attacco Torre',

  // Aperture di fianchetto / altro
  'English Opening': 'Apertura Inglese',
  'R\u00e9ti Opening': 'Apertura Réti',
  'Reti Opening': 'Apertura Réti',
  'King\u0027s Indian Attack': 'Attacco Indiano di Re',
  'Bird Opening': 'Apertura Bird',
  'Nimzo-Larsen Attack': 'Attacco Nimzo-Larsen',
  'Zukertort Opening': 'Apertura Zukertort',
};

/** Estrae la famiglia (prima dei due punti) e la traduce se nota. */
export function familyFromName(fullName: string): string {
  const base = fullName.split(':')[0].trim();
  return FAMILY_IT[base] ?? base;
}

/** Elenco ordinato dei nomi di famiglia italiani noti (per eventuali filtri statici). */
export const KNOWN_FAMILIES_IT = Array.from(new Set(Object.values(FAMILY_IT))).sort(
  (a, b) => a.localeCompare(b, 'it')
);
