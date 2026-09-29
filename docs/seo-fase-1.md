# SEO – Fase 1: fondamenta tecniche

Specifica operativa. Applicare i passi **nell'ordine**, senza reinterpretare.
Dove c'è codice, usarlo così com'è. Al termine eseguire la checklist di verifica (§12).

Contesto: sito Astro 6 statico su Vercel. Dominio canonico: **`https://www.santasabinascacchi.it`**
(l'apex `santasabinascacchi.it` e `santasabina.vercel.app` devono puntare lì).
Link interni del sito: sempre **senza slash finale** (`/chi-siamo`, non `/chi-siamo/`).

## 0. Decisioni già prese (non cambiarle)

| Tema | Decisione |
|---|---|
| Dominio canonico | `https://www.santasabinascacchi.it` |
| Slash finale | mai (`trailingSlash: 'never'`) |
| Suffisso titoli | ` \| Circolo Scacchi Santa Sabina Genova` |
| Titolo home | `Circolo Scacchi Santa Sabina Genova – Corsi e Tornei` (senza suffisso) |
| Coordinate sede | lat `44.40818`, lon `8.96629` (OpenStreetMap, Via Donghi 8) |
| CAP | `16143` (confermato da Google Maps; sostituisce il vecchio 16132 presente in `/contatti`) |
| Telefono | non ancora disponibile – **non inventarlo**, non aggiungere `telephone` al JSON-LD |
| Orari ufficiali | Mar 21:15–23:30 · Ven 15:00–17:30 · Sab 10:00–11:30 (giovani). Ven 21:15–23:00 solo eventi specifici (nota, non orario regolare) |
| Immagine social di default | `/images/og-default.jpg` 1200×630 |

---

## 1. Installare la sitemap

```bash
npm install @astrojs/sitemap
```

(Non usare `npx astro add`: modifica il config in modo diverso da quanto previsto al §2.)

## 2. `astro.config.mjs` – sostituire l'intero file

```js
// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.santasabinascacchi.it',
  trailingSlash: 'never',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
    }),
  ],
});
```

## 3. `public/robots.txt` – nuovo file

```
User-agent: *
Allow: /

Sitemap: https://www.santasabinascacchi.it/sitemap-index.xml
```

## 4. `vercel.json` – nuovo file nella root

Redirect permanenti: slash finale → senza slash; host `santasabina.vercel.app` → dominio canonico.

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "trailingSlash": false,
  "redirects": [
    {
      "source": "/:path*",
      "has": [{ "type": "host", "value": "santasabina.vercel.app" }],
      "destination": "https://www.santasabinascacchi.it/:path*",
      "permanent": true
    },
    {
      "source": "/index.html",
      "destination": "/",
      "permanent": true
    }
  ]
}
```

## 5. Immagine social di default

Generare una volta `public/images/og-default.jpg` (1200×630, sfondo `#1a1410`, logo oro centrato)
con `sharp` (già presente in `node_modules`). Eseguire dalla root del progetto:

```bash
node -e "
const sharp = require('sharp');
(async () => {
  const logo = await sharp('public/images/logo-gold.png').resize({ height: 420 }).toBuffer();
  await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#1a1410' } })
    .composite([{ input: logo, gravity: 'center' }])
    .jpeg({ quality: 85 })
    .toFile('public/images/og-default.jpg');
})();
"
```

Verificare che il file esista e pesi < 150 KB. (Se in futuro l'utente fornisce una foto
del circolo, sostituire il file mantenendo nome e dimensioni.)

## 6. `src/data/club.ts` – nuovo file (unica fonte per nome, indirizzo, orari, JSON-LD)

```ts
export const SITE_URL = 'https://www.santasabinascacchi.it';

export const club = {
  name: 'Circolo Scacchi Santa Sabina',
  alternateNames: ['Santa Sabina Scacchi', 'ASD U.S. ACLI Santa Sabina', 'U.S. ACLI S. Sabina'],
  legalName: 'ASD U.S. ACLI Santa Sabina',
  description:
    'Circolo di scacchi a Genova (San Fruttuoso – Marassi), affiliato FSI e CONI. Corsi per bambini e ragazzi con istruttori FSI, gioco libero, tornei amatoriali e omologati.',
  email: 'santasabinascacchi@gmail.com',
  foundingYear: 2010,
  address: {
    street: 'Via Donghi 8',
    postalCode: '16143',
    city: 'Genova',
    region: 'GE',
    country: 'IT',
    note: 'Presso la sede del Circolo ACLI Achille Grandi',
    hint: 'Entrata dal cancello alla destra della Chiesa di Santa Sabina',
  },
  geo: { lat: 44.40818, lon: 8.96629 },
  // Orari regolari (usati in footer, contatti, chi-siamo e JSON-LD)
  hours: [
    { day: 'Martedì', schemaDay: 'Tuesday', opens: '21:15', closes: '23:30', note: '' },
    { day: 'Venerdì', schemaDay: 'Friday', opens: '15:00', closes: '17:30', note: '' },
    { day: 'Sabato', schemaDay: 'Saturday', opens: '10:00', closes: '11:30', note: 'giovani' },
  ],
  // Aperture non regolari: mostrate solo in /contatti, NON nel JSON-LD
  extraHours: [
    { day: 'Venerdì', opens: '21:15', closes: '23:00', note: 'solo eventi specifici' },
  ],
  social: {
    facebook: 'https://www.facebook.com/profile.php?id=100090810611492',
    facebookAcli: 'https://www.facebook.com/santa.sabina.92',
    instagram: 'https://www.instagram.com/scacchi_santa_sabina/',
  },
  logo: '/images/logo-gold.png',
  ogImage: '/images/og-default.jpg',
} as const;

export const CLUB_ID = `${SITE_URL}/#club`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export const fullAddress = `${club.address.street}, ${club.address.postalCode} ${club.address.city}`;

export const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${club.name}, ${club.address.street}, ${club.address.city}`
)}`;

export const mapsEmbedUrl = `https://maps.google.com/maps?q=${club.geo.lat},${club.geo.lon}&z=17&hl=it&output=embed`;

export const clubPostalAddress = {
  '@type': 'PostalAddress',
  streetAddress: club.address.street,
  postalCode: club.address.postalCode,
  addressLocality: club.address.city,
  addressRegion: club.address.region,
  addressCountry: club.address.country,
};

export const clubPlace = {
  '@type': 'Place',
  name: `${club.name} – Circolo ACLI Achille Grandi`,
  address: clubPostalAddress,
  geo: { '@type': 'GeoCoordinates', latitude: club.geo.lat, longitude: club.geo.lon },
};

export const clubJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SportsClub',
  '@id': CLUB_ID,
  name: club.name,
  alternateName: club.alternateNames,
  legalName: club.legalName,
  description: club.description,
  url: SITE_URL,
  logo: `${SITE_URL}${club.logo}`,
  image: `${SITE_URL}${club.ogImage}`,
  email: club.email,
  foundingDate: String(club.foundingYear),
  sport: 'Scacchi',
  address: clubPostalAddress,
  geo: { '@type': 'GeoCoordinates', latitude: club.geo.lat, longitude: club.geo.lon },
  hasMap: mapsUrl,
  areaServed: { '@type': 'City', name: 'Genova' },
  openingHoursSpecification: club.hours.map((h) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: `https://schema.org/${h.schemaDay}`,
    opens: h.opens,
    closes: h.closes,
  })),
  memberOf: [
    { '@type': 'SportsOrganization', name: 'Federazione Scacchistica Italiana', url: 'https://www.federscacchi.it/' },
  ],
  sameAs: [club.social.facebook, club.social.instagram, club.social.facebookAcli],
};

export const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  url: SITE_URL,
  name: club.name,
  inLanguage: 'it-IT',
  publisher: { '@id': CLUB_ID },
};

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  };
}
```

## 7. `src/layouts/BaseLayout.astro` – sostituire il frontmatter e il `<head>`

Sostituire le righe 1–28 (frontmatter + `<head>`) con quanto segue. Il `<body>` resta invariato.

```astro
---
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import Analytics from '@vercel/analytics/astro';
import '../styles/global.css';
import { club, SITE_URL } from '../data/club';

interface Props {
  title: string;
  description?: string;
  /** Se true, usa `title` così com'è senza suffisso (solo home). */
  rawTitle?: boolean;
  /** Path assoluto (es. /images/x.jpg) o URL completo */
  image?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
  /** Uno o più oggetti JSON-LD già completi di @context */
  jsonLd?: object | object[];
  /** ISO date, solo per type=article */
  publishedTime?: string;
}

const {
  title,
  description = club.description,
  rawTitle = false,
  image = club.ogImage,
  type = 'website',
  noindex = false,
  jsonLd,
  publishedTime,
} = Astro.props;

const fullTitle = rawTitle ? title : `${title} | Circolo Scacchi Santa Sabina Genova`;

// Canonical: sempre dominio www, senza slash finale (tranne la root)
let path = Astro.url.pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
if (path.length > 1) path = path.replace(/\/+$/, '');
const canonical = `${SITE_URL}${path}`;

const imageUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`;
const cleanDescription = description.replace(/\s*(\.\.\.|…)\s*$/, '').trim();
const ldList = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
---

<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{fullTitle}</title>
  <meta name="description" content={cleanDescription} />
  <link rel="canonical" href={canonical} />
  {noindex && <meta name="robots" content="noindex, follow" />}

  <!-- Open Graph -->
  <meta property="og:type" content={type} />
  <meta property="og:site_name" content={club.name} />
  <meta property="og:locale" content="it_IT" />
  <meta property="og:title" content={fullTitle} />
  <meta property="og:description" content={cleanDescription} />
  <meta property="og:url" content={canonical} />
  <meta property="og:image" content={imageUrl} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content={club.name} />
  {type === 'article' && publishedTime && <meta property="article:published_time" content={publishedTime} />}

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={fullTitle} />
  <meta name="twitter:description" content={cleanDescription} />
  <meta name="twitter:image" content={imageUrl} />

  <meta name="theme-color" content="#1a1410" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet" />
  <link rel="icon" href="/favicon.ico" sizes="32x32" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="icon" type="image/png" href="/favicon-256.png" />
  <link rel="apple-touch-icon" href="/favicon-256.png" />
  <link rel="sitemap" href="/sitemap-index.xml" />

  {ldList.map((ld) => (
    <script type="application/ld+json" set:html={JSON.stringify(ld)} />
  ))}
  <Analytics />
</head>
```

Nota: `og:image:width/height` sono corretti solo per l'immagine di default; lasciarli così
(oggi nessuna pagina passa un'immagine diversa).

## 8. Pagine – modifiche puntuali alle chiamate `<BaseLayout>`

### 8.1 `src/pages/index.astro` (riga ~74)

Aggiungere nel frontmatter: `import { clubJsonLd, websiteJsonLd } from '../data/club';`

Sostituire `<BaseLayout title="Home">` con:

```astro
<BaseLayout
  title="Circolo Scacchi Santa Sabina Genova – Corsi e Tornei"
  rawTitle
  description="Circolo di scacchi a Genova (San Fruttuoso – Marassi), affiliato FSI. Corsi per bambini e ragazzi, gioco libero, tornei omologati. Via Donghi 8."
  jsonLd={[websiteJsonLd, clubJsonLd]}
>
```

Inoltre, nella stessa pagina, i pulsanti degli eventi in evidenza (righe ~23 e ~36 dell'array eventi)
usano link relativi `notizie/...` con `target="_blank"`: trasformarli in link assoluti interni
`/notizie/...` e **rimuovere** `target="_blank"` solo per i link interni (lasciarlo per quelli esterni,
es. altervista/vesus). Cercare nel template dove l'array viene renderizzato e applicare
`target` solo se l'URL inizia con `http`.

### 8.2 `src/pages/chi-siamo.astro` (riga 5)

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { clubJsonLd } from '../data/club';
---
<BaseLayout
  title="Chi Siamo – Storia del circolo"
  description="Storia, consiglio direttivo, orari e quote del Circolo Scacchi Santa Sabina di Genova, affiliato FSI e CONI. Istruttori FSI per i più giovani."
  jsonLd={clubJsonLd}
>
```

(se il frontmatter ha già altri import, aggiungere solo la riga `import { clubJsonLd } ...`).

### 8.3 `src/pages/contatti.astro` (riga 5)

```astro
<BaseLayout
  title="Contatti e Orari"
  description="Dove giocare a scacchi a Genova: Circolo Scacchi Santa Sabina, Via Donghi 8 (San Fruttuoso). Orari di apertura, email, mappa e come arrivare."
  jsonLd={clubJsonLd}
>
```

### 8.4 `src/pages/tornei/index.astro` (riga 18)

```astro
<BaseLayout title="Tornei di scacchi a Genova" description="Archivio dei tornei di scacchi organizzati a Genova dal Circolo Santa Sabina dal 2010: tornei sociali, Grand Prix lampo, Weekend Valbisagno, tornei giovanili. Bandi e classifiche.">
```

### 8.5 `src/pages/notizie/index.astro` (riga 13)

```astro
<BaseLayout title="Notizie" description="Notizie, risultati e appuntamenti del Circolo Scacchi Santa Sabina di Genova: tornei, corsi, eventi scacchistici in città.">
```

### 8.6 `src/pages/notizie/[year].astro` (riga 23)

Lasciare titolo invariato. Aggiungere `noindex` **solo** per l'anno corrente (duplica `/notizie`):

```astro
<BaseLayout title={`Notizie ${year}`} description={`Notizie ${year} dal Circolo Scacchi Santa Sabina di Genova: tornei, risultati ed eventi.`} noindex={Number(year) === new Date().getFullYear()}>
```

(adattare il nome della variabile `year` a quello effettivamente usato nel file.)

### 8.7 `src/pages/fotografie.astro`, `fotografie/[year].astro`, `fotografie/[year]/[album].astro`, `biblioteca.astro`, `link.astro`

Nessuna modifica in Fase 1 (i titoli ereditano il nuovo suffisso automaticamente).

### 8.8 `src/pages/404.astro` (riga 5)

```astro
<BaseLayout title="Pagina non trovata" noindex>
```

## 9. Pagine di dettaglio: JSON-LD, breadcrumb, `<time datetime>`

### 9.1 `src/pages/notizie/[slug].astro`

Nel frontmatter, dopo `const { Content } = await render(entry);` aggiungere:

```ts
import { SITE_URL, CLUB_ID, club, breadcrumbJsonLd } from '../../data/club';
// (spostare l'import in cima insieme agli altri)

const url = `${SITE_URL}/notizie/${entry.id}`;
const articleLd = {
  '@context': 'https://schema.org',
  '@type': 'NewsArticle',
  headline: entry.data.title,
  description: entry.data.excerpt.replace(/\s*(\.\.\.|…)\s*$/, ''),
  datePublished: entry.data.date,
  inLanguage: 'it-IT',
  mainEntityOfPage: url,
  image: [`${SITE_URL}${club.ogImage}`],
  author: { '@type': 'Organization', '@id': CLUB_ID, name: club.name, url: SITE_URL },
  publisher: { '@id': CLUB_ID },
};
const crumbs = breadcrumbJsonLd([
  { name: 'Home', path: '/' },
  { name: 'Notizie', path: '/notizie' },
  { name: entry.data.title, path: `/notizie/${entry.id}` },
]);
```

Sostituire la riga `<BaseLayout ...>` con:

```astro
<BaseLayout title={entry.data.title} description={entry.data.excerpt} type="article" publishedTime={entry.data.date} jsonLd={[articleLd, crumbs]}>
```

Sostituire `<time>` (riga 25) con:

```astro
<time datetime={entry.data.date}>{new Date(entry.data.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</time>
```

### 9.2 `src/content.config.ts` – campi opzionali per il luogo dei tornei

Nello schema `tornei`, aggiungere dopo `documenti`:

```ts
    luogo: z.string().optional(),      // es. "Palazzo Reale"
    indirizzo: z.string().optional(),  // es. "Via Balbi 10, 16126 Genova"
```

Non valorizzarli nei file markdown (lo farà l'utente per i tornei fuori sede).

### 9.3 `src/pages/tornei/[slug].astro`

Nel frontmatter aggiungere l'import in cima:

```ts
import { SITE_URL, CLUB_ID, club, clubPlace, breadcrumbJsonLd } from '../../data/club';
```

e dopo il blocco `documenti` (riga ~29):

```ts
const url = `${SITE_URL}/tornei/${entry.id}`;
const metaDescription = `${entry.data.title}: torneo di scacchi a Genova organizzato dal Circolo Scacchi Santa Sabina. ${entry.data.excerpt}. Bando, classifica e foto.`;
const location = entry.data.luogo
  ? {
      '@type': 'Place',
      name: entry.data.luogo,
      address: entry.data.indirizzo ?? 'Genova',
    }
  : clubPlace;
const eventLd = {
  '@context': 'https://schema.org',
  '@type': 'SportsEvent',
  name: entry.data.title,
  description: metaDescription,
  sport: 'Scacchi',
  startDate: entry.data.date,
  eventStatus: 'https://schema.org/EventScheduled',
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  location,
  image: [`${SITE_URL}${club.ogImage}`],
  url,
  organizer: { '@type': 'SportsClub', '@id': CLUB_ID, name: club.name, url: SITE_URL },
  ...(entry.data.vesus && isCurrent
    ? { offers: { '@type': 'Offer', url: entry.data.vesus, availability: 'https://schema.org/InStock' } }
    : {}),
};
const crumbs = breadcrumbJsonLd([
  { name: 'Home', path: '/' },
  { name: 'Tornei', path: '/tornei' },
  { name: entry.data.title, path: `/tornei/${entry.id}` },
]);
```

Sostituire la riga `<BaseLayout ...>` (riga 32) con:

```astro
<BaseLayout title={entry.data.title} description={metaDescription} jsonLd={[eventLd, crumbs]}>
```

Sostituire `<time>` (riga 40) con la stessa forma di §9.1 (`datetime={entry.data.date}`).

Nel blocco link: il pulsante "Fotografie" (riga ~62) punta al sito stesso; rimuovere
`target="_blank" rel="noopener"` **se** `fotoAlbum` inizia con `https://www.santasabinascacchi.it`,
e trasformarlo in path relativo:

```ts
const fotoAlbum = resolveUrl(entry.data.fotoAlbum)?.replace('https://www.santasabinascacchi.it', '') ?? null;
```

e nel template:

```astro
{fotoAlbum && (
  <a href={fotoAlbum} class="btn btn-outline btn-sm" {...(fotoAlbum.startsWith('http') ? { target: '_blank', rel: 'noopener' } : {})}>
    Fotografie
  </a>
)}
```

## 10. Uniformare nome/indirizzo/orari (NAP)

### 10.1 `src/components/Footer.astro`

Nel frontmatter aggiungere `import { club, fullAddress } from '../data/club';`.

- Riga 12: `<strong>Santa Sabina Scacchi</strong>` → `<strong>{club.name}</strong>`
- Righe 24–27 (lista orari): sostituire le `<li>` con

```astro
{club.hours.map((h) => (
  <li><strong>{h.day}</strong> {h.opens} – {h.closes}{h.note && ` (${h.note})`}</li>
))}
```

- Riga 34: `<li>Via Donghi 8, Genova</li>` → `<li>{fullAddress}</li>`
- Righe 36, 39: usare `club.email` e `club.social.facebook`.
- Dopo il `<li>` di Facebook aggiungere:

```astro
<li><a href={club.social.instagram} target="_blank" rel="noopener">Instagram</a></li>
```

Non toccare lo stile né gli `<h4>` (Fase 4).

### 10.2 `src/pages/contatti.astro`

Frontmatter:

```ts
import BaseLayout from '../layouts/BaseLayout.astro';
import { club, clubJsonLd, fullAddress, mapsUrl, mapsEmbedUrl } from '../data/club';
```

- Riga 31: `Via Donghi 8, 16132 Genova` → `{fullAddress}` (il CAP diventa 16143); righe 32–33 → `{club.address.note}` / `{club.address.hint}`.
- Righe 46–66 (`<ul class="schedule">`): generare da dati, mantenendo le classi esistenti:

```astro
<ul class="schedule">
  {club.hours.map((h) => (
    <li>
      <span class="day">{h.day}</span>
      <span class="time">{h.opens} &ndash; {h.closes}</span>
      {h.note && <span class="badge">{h.note}</span>}
    </li>
  ))}
  {club.extraHours.map((h) => (
    <li>
      <span class="day">{h.day}</span>
      <span class="time">{h.opens} &ndash; {h.closes}</span>
      <span class="badge">{h.note}</span>
    </li>
  ))}
</ul>
```

- Riga 79 email e righe 92/94 social: usare `club.email`, `club.social.facebook`, `club.social.instagram`.
- Riga 104: `src="..."` dell'iframe → `src={mapsEmbedUrl}`.
- Riga 115: `href="https://maps.google.com/?q=Via+Donghi+8+Genova"` → `href={mapsUrl}`.
- Gli `<h3>` delle card (righe 30, 45, 78, 90) → `<h2>`. Verificare nel `<style>` della pagina
  se esistono selettori `h3` per quelle card e rinominarli in `h2` mantenendo le stesse regole
  (la resa visiva non deve cambiare).

### 10.3 `src/pages/chi-siamo.astro` (righe 86–99)

Sostituire le `<li>` degli orari con:

```astro
{club.hours.map((h) => (
  <li>
    <strong>{h.day}</strong>{h.note && <em>({h.note})</em>}
    <span>{h.opens} – {h.closes}</span>
  </li>
))}
```

e aggiungere `club` all'import di §8.2: `import { club, clubJsonLd } from '../data/club';`.

## 11. Fuori dal codice (azioni manuali dell'utente – NON eseguibili dall'agente)

Riportarle all'utente a fine lavoro, non tentare di farle:

1. **Vercel → Settings → Domains**: `www.santasabinascacchi.it` = Primary; `santasabinascacchi.it`
   → Redirect a www con **308 Permanent** (oggi è 307).
2. **Google Search Console**: aggiungere proprietà *Dominio* `santasabinascacchi.it` (verifica DNS),
   inviare `https://www.santasabinascacchi.it/sitemap-index.xml`.
3. **Bing Webmaster Tools**: importare da Search Console.
4. **Vecchio sito `santasabinascacchi.altervista.org`**: modificare il meta refresh in
   `https://www.santasabinascacchi.it/` (oggi punta a `santasabina.vercel.app/index.html`).
5. **Google Business Profile**: creare la scheda "Circolo Scacchi Santa Sabina", categoria
   *Club di scacchi*, con indirizzo, orari e sito identici a `src/data/club.ts`.
6. Comunicare il **numero di telefono** quando disponibile: andrà aggiunto come `telephone`
   in `src/data/club.ts`, nel JSON-LD, nel footer e in `/contatti` (formato `+39 ...`).
7. Per i tornei fuori sede (es. Trofeo CONI, Scacchi alla Berio, Scacchi al Mercato) compilare
   `luogo` e `indirizzo` nel frontmatter del torneo, almeno per 2025–2026.

## 12. Checklist di verifica (obbligatoria)

```bash
npm run build
```

Deve completare senza errori. Poi:

```bash
# 1. sitemap e robots
ls dist/sitemap-index.xml dist/sitemap-0.xml dist/robots.txt
grep -c "<loc>" dist/sitemap-0.xml                 # ~650 URL
grep -o "<loc>[^<]*</loc>" dist/sitemap-0.xml | head -5   # dominio www, nessuno slash finale (tranne root)
grep -c "404" dist/sitemap-0.xml                   # deve essere 0

# 2. head della home
grep -o '<title>[^<]*</title>' dist/index.html
grep -o '<link rel="canonical"[^>]*>' dist/index.html          # https://www.santasabinascacchi.it/
grep -c 'property="og:' dist/index.html                         # >= 9
grep -c 'application/ld+json' dist/index.html                   # 2

# 3. pagine interne
grep -o '<link rel="canonical"[^>]*>' dist/chi-siamo/index.html  # .../chi-siamo  (senza slash)
grep -o '<title>[^<]*</title>' dist/contatti/index.html
grep -c 'noindex' dist/404.html                                  # 1

# 4. JSON-LD valido (parse di tutti i blocchi)
node -e "
const fs=require('fs'),path=require('path');let n=0,bad=0;
(function walk(d){for(const f of fs.readdirSync(d)){const p=path.join(d,f);
if(fs.statSync(p).isDirectory())walk(p);else if(p.endsWith('.html')){
const h=fs.readFileSync(p,'utf8');for(const m of h.matchAll(/<script type=\"application\/ld\+json\">([\s\S]*?)<\/script>/g)){
n++;try{JSON.parse(m[1])}catch(e){bad++;console.log('BAD',p)}}}}})('dist');
console.log('json-ld blocks',n,'invalid',bad);"
```

Atteso: `invalid 0`; blocchi ≈ 2 (home) + 1 (chi-siamo) + 1 (contatti) + 2×notizie + 2×tornei.

Controllo visivo con `npm run preview`: home, `/contatti` (mappa centrata su Via Donghi,
orari uguali al footer), `/chi-siamo`, una notizia, un torneo. Nessuna differenza grafica
rispetto a prima a parte la mappa.

Se qualcosa non torna (es. sitemap con slash finali), **non** cambiare `trailingSlash`: aggiungere
all'integrazione `sitemap({ ..., serialize: (item) => ({ ...item, url: item.url.replace(/(?<!\.it)\/$/, '') }) })`.

Test manuali post-deploy (utente): <https://search.google.com/test/rich-results> su home,
una notizia, un torneo; <https://www.opengraph.xyz> sulla home.

## 13. Fuori scope in Fase 1

Non fare: nuove pagine (corsi, dove giocare), testi delle notizie/tornei, immagini gallery,
heading del footer, migrazione PDF altervista. Sono Fasi 3–4.
