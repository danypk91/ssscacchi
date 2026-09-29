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
