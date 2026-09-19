// The business itself: the facts that appear both in the LocalBusiness JSON-LD
// and in the markup a visitor reads. They were written out twice — the phone
// number in seven templates and again in schema.js, the three social URLs in
// the footer and again in schema.js — so a changed number had to be found in
// two languages. Spread into new Kiss() by router.js, which puts it on
// `this.config` for every template (`{{config.business.telephone}}`) and on
// `kiss.config` for the helpers.

// The two venues named on src/pages/contact.hbs ("A1K9 Dog Training Academy
// now runs from two venues near Swansea"). Only fields this repo actually
// sources are included:
//  - A1K9 Training Grounds: locality + postcode come from that page's first
//    map embed's `pb=` query string ("Pontarddulais,+Swansea+SA4+8NP"); the
//    lat/long come from the same embed's `!2d…!3d…` pair (longitude then
//    latitude).
//  - Llys Nini Animal Centre (RSPCA): the page states its locality and
//    postcode directly in the heading text, but the repo holds no
//    coordinates for it (its map is a plain `?q=` search embed, not a
//    `pb=` embed with a lat/long pair) — so it gets an address and no `geo`,
//    rather than an invented one.
// No street address or opening hours are invented for either venue.
const LOCATIONS = [
  {
    '@type': 'Place',
    name: 'A1K9 Training Grounds',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Pontarddulais',
      addressRegion: 'West Glamorgan',
      postalCode: 'SA4 8NP',
      addressCountry: 'GB',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 51.7053036589514,
      longitude: -3.9974988901576323,
    },
  },
  {
    '@type': 'Place',
    name: 'Llys Nini Animal Centre (RSPCA)',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Penllergaer',
      addressRegion: 'West Glamorgan',
      postalCode: 'SA4 9WB',
      addressCountry: 'GB',
    },
  },
]

export const business = {
  name: 'A1K9 Behaviour and Training Academy',
  alternateName: 'Gaynor Probert Dog Behaviour and Training',
  // E.164 for the tel: href and the JSON-LD; the display form is what a reader
  // sees, and the two must not be derived from each other by hand.
  telephone: '+447798500390',
  telephoneDisplay: '07798 500390',
  areaServed: 'South Wales',
  // The footer links these; the JSON-LD lists the same three as `sameAs`. The
  // home page appends Facebook's legacy `?fref=ts` to its own links, which is
  // why the value here is the bare profile URL.
  social: {
    facebook: 'https://www.facebook.com/A1K9PDT',
    youtube: 'https://www.youtube.com/channel/UCA0GMQkoz1lgjHvo41hqH2A',
    linkedin: 'https://www.linkedin.com/in/gaynor-probert-b869581a/',
  },
  locations: LOCATIONS,
  // The card a shared link shows: og:image on every page. Not a page's hero
  // photo, which each platform centre-crops to whatever it likes, but a
  // purpose-made 1200x630 cut by scripts/social-card.mjs from
  // planning/design/social-card.html. Edit the design, re-run the script, look
  // at the result, commit it, and bump the -vN suffix: images are cached for a
  // year and never overwritten in place.
  //
  // The size lives here because two things must agree on it: the og:image
  // width/height tags (a scraper told the wrong size renders a blurred or
  // letterboxed card) and the viewport the script shoots at, which imports
  // this object.
  socialCard: {
    path: 'images/social-card-v1.jpg',
    width: 1200,
    height: 630, // 1.905:1, the ratio Facebook, LinkedIn and X all crop least
    alt: 'Gaynor Probert being kissed by a Labrador, beside her name: dog training classes and behaviour consultations in Swansea and South Wales',
  },
}
