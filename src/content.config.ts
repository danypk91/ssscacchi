import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { Chess } from 'chess.js';

const notizie = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notizie' }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    excerpt: z.string(),
  }),
});

const tornei = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tornei' }),
  schema: z.object({
    title: z.string(),
    year: z.number(),
    date: z.string(),
    excerpt: z.string(),
    bando: z.string().optional(),
    classifica: z.string().optional(),
    vesus: z.string().optional(),
    fotoAlbum: z.string().optional(),
    documenti: z.array(z.object({
      label: z.string(),
      file: z.string(),
    })).optional(),
    luogo: z.string().optional(),      // es. "Palazzo Reale"
    indirizzo: z.string().optional(),  // es. "Via Balbi 10, 16126 Genova"
  }),
});

// Archivio di partite famose (visualizzatore didattico).
// I dati storici (giocatori, luogo, fonte) sono inseriti a mano.
// L'apertura NON si mette qui: viene calcolata dal PGN in build.
const partite = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/partite' }),
  schema: z
    .object({
      white: z.string(),               // es. "Paul Morphy"
      black: z.string(),               // es. "Duca di Brunswick / Conte Isouard"
      result: z.enum(['1-0', '0-1', '1/2-1/2', '*']),
      year: z.number().int(),
      event: z.string().optional(),    // es. "Teatro dell'Opera"
      place: z.string().optional(),    // es. "Parigi"
      pgn: z.string(),                 // mosse SAN
      source: z.string().url(),        // link alla fonte che attesta la partita
      // Titolo/soprannome storico, se esiste (es. "Partita dell'Opera")
      nickname: z.string().optional(),
      // Commenti alle mosse: ply = semimossa (1 = 1a del Bianco). Vuoto per ora.
      comments: z
        .array(z.object({ ply: z.number().int().positive(), text: z.string() }))
        .optional(),
      // Bozza: se true, non pubblicata in produzione.
      draft: z.boolean().default(false),
    })
    .superRefine((data, ctx) => {
      // Valida il PGN: deve caricarsi senza errori.
      const chess = new Chess();
      let moveCount = 0;
      try {
        chess.loadPgn(data.pgn);
        moveCount = chess.history().length;
      } catch (e) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['pgn'],
          message: `PGN non valido: ${(e as Error).message}`,
        });
        return;
      }
      if (moveCount === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['pgn'],
          message: 'Il PGN non contiene mosse.',
        });
      }
      // Valida i ply dei commenti: devono puntare a una semimossa esistente.
      for (const c of data.comments ?? []) {
        if (c.ply > moveCount) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['comments'],
            message: `Commento alla semimossa ${c.ply}, ma la partita ha solo ${moveCount} semimosse.`,
          });
        }
      }
    }),
});

export const collections = { notizie, tornei, partite };
