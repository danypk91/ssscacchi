---
title: "ESEMPIO - Gran Premio Lampo 2026"
year: 2026
date: "2026-12-31"
excerpt: "File di ESEMPIO per mostrare come collegare bando/documenti/foto da Cloudflare R2 (da cancellare)"
# ---------------------------------------------------------------------------
# COME COLLEGARE GLI ASSET DI CLOUDFLARE (metodo "non drastico")
#
# Nel bucket R2 "santasabina" il file e':
#     santasabina/tornei/2026/2026_gp_lampo_bando.pdf
#
# "santasabina" e' il NOME DEL BUCKET, NON fa parte dell'URL pubblico.
# Basta scrivere il path SENZA "santasabina/" e SENZA "http".
# Il sito, quando vede un path che non inizia per "http", ci mette
# davanti in automatico il CDN (PUBLIC_CDN_URL = https://assets.santasabinascacchi.it).
# Vedi src/pages/tornei/[slug].astro riga 17-20 (funzione resolveUrl).
#
# Risultato finale generato dal sito:
#     https://assets.santasabinascacchi.it/tornei/2026/2026_gp_lampo_bando.pdf
# ---------------------------------------------------------------------------
bando: "tornei/2026/2026_gp_lampo_bando.pdf"

# I "documenti" extra funzionano allo stesso modo: solo il path R2 relativo.
# Qui aggancio il PDF del tesseramento che sta in un'altra cartella del bucket:
#     santasabina/documenti/2026/2026_tesseramento_scacchi_s_sabina.pdf
documenti:
  - label: "Tesseramento"
    file: "documenti/2026/2026_tesseramento_scacchi_s_sabina.pdf"

# Per le FOTO e' diverso: l'album vive su R2 in foto/2026/Scacchi_al_Mercato_2026/
# ma NON serve linkarlo a mano, perche' il sito genera GIA' da solo una pagina
# galleria interna a /fotografie/2026/Scacchi_al_Mercato_2026/ (vedi
# src/pages/fotografie/[year]/[album].astro, che scansiona il bucket al build).
#
# ATTENZIONE: il campo "fotoAlbum" viene passato a resolveUrl, che antepone il
# CDN a qualsiasi valore che non inizi per "http". Quindi un path interno tipo
# "/fotografie/..." verrebbe rovinato in "https://assets.../fotografie/...".
# Percio' qui il link alla galleria interna va scritto come URL ASSOLUTO del
# sito (inizia per http, cosi' resolveUrl lo lascia intatto):
fotoAlbum: "https://www.santasabinascacchi.it/fotografie/2026/Scacchi_al_Mercato_2026/"
---

Questo e' un torneo di **ESEMPIO** (non va in produzione).

Serve solo a far vedere il metodo "pulito" per collegare gli asset di
Cloudflare R2 senza usare i link di produzione (www.santasabinascacchi.it/...)
ne' quelli del vecchio altervista:

- **Bando** e **documenti**: si scrive solo il path dentro il bucket, senza
  `santasabina/` davanti e senza `http`. Al resto pensa il sito, che antepone
  in automatico `https://assets.santasabinascacchi.it/`.
- **Fotografie**: l'album delle foto e' gia' su R2 e il sito genera da solo la
  pagina galleria a `/fotografie/{anno}/{album}/`. Nel campo `fotoAlbum` basta
  puntare a quella pagina interna (scritta come URL assoluto del sito).
