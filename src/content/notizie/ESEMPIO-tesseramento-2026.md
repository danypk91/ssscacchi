---
title: "ESEMPIO - Tesseramento 2026"
date: "2026-12-31"
excerpt: "Notizia di ESEMPIO per mostrare come linkare un documento PDF da Cloudflare R2 nel testo (da cancellare)"
---

Questa e' una notizia di **ESEMPIO** (non va in produzione).

Le notizie non hanno i campi `bando`/`documenti` come i tornei: il link a un
documento di Cloudflare va messo **direttamente nel testo**, in Markdown.

Il PDF del tesseramento sta nel bucket R2 in:

    santasabina/documenti/2026/2026_tesseramento_scacchi_s_sabina.pdf

"santasabina" e' il nome del bucket, NON fa parte dell'URL. L'indirizzo
pubblico su Cloudflare e' quindi:

    https://assets.santasabinascacchi.it/documenti/2026/2026_tesseramento_scacchi_s_sabina.pdf

Ecco il link cliccabile (questo e' il metodo "pulito", niente altervista ne'
link di produzione):

[Scarica il modulo di tesseramento 2026](https://assets.santasabinascacchi.it/documenti/2026/2026_tesseramento_scacchi_s_sabina.pdf)

> Nota: qui, essendo Markdown normale dentro il corpo della notizia, l'URL del
> CDN va scritto per intero (`https://assets.santasabinascacchi.it/...`).
> L'auto-completamento del CDN dal solo path relativo funziona **solo** nei
> campi dei tornei (bando, classifica, documenti, fotoAlbum), non nel testo.
