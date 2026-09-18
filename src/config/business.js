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
  // The year Gaynor's experience is counted from, for the "over N years" the
  // About and aggression pages state ({{experienceYears}}, src/helpers/
  // experience.js). A floor, not a start date: Gaynor was dog training by
  // 2006 and is not sure how much earlier (2026-09-18), so the figure can
  // only understate. It was hand-typed "15 years" for over a decade.
  experienceSince: 2006,
  // The facts every course page states as furniture, rather than answering one
  // enquiry at a time. Data, not copy: short strings the partials frame into
  // sentences (src/partials/at-a-glance.hbs, src/partials/how-booking-works.hbs).
  // Sourced from the 2026-09-14 interview with Gaynor.
  courses: {
    cycleNote:
      'Courses run back to back in six-week blocks; the next starts the week after the last ends',
    // The timetable itself, as data rather than a date typed onto five models
    // and retyped every six weeks. `anchorSunday` is one real start Sunday;
    // every later start is that date plus a whole number of `blockWeeks`, and
    // the Saturday courses (Silver, Gold) start the day before the shared
    // Sunday. src/helpers/schedule.js does the arithmetic,
    // src/controllers/course.js formats it onto each course page.
    //
    // When the pattern actually breaks — a cancelled block, a week off over
    // Christmas — move this anchor to the next Sunday courses really do start,
    // or override one course with a literal `nextStart` on its model.
    blockWeeks: 6,
    anchorSunday: '2026-10-11',
    classSize: 'About ten dogs, never more than twelve',
    joinBy: 'You can join up to week two',
    deposit: '£50',
    depositNote: 'non-refundable, by bank transfer',
    balance: 'The balance to be paid on the first week of attending',
    venueNote:
      'Outdoors at the Training Grounds; indoors at Llys Nini when it is wet',
    bring: 'A collar, a lead and treats your dog likes',
    // Gaynor, 2026-09-18: the Facilities page "Shop" card went, but she wants
    // it known she sells leads and collars. Shown under `bring`, the one place
    // a reader is already thinking about what their dog wears to class.
    equipmentNote:
      'Gaynor sells high quality leads and collars if you need them',
    eligibilityNote:
      'For insurance reasons XL Bully dogs, and dogs legally required to be muzzled, cannot join a class',
  },
  // One-to-one sessions and behaviour consultations. `atA1K9` is read twice —
  // by the visitor in the at-a-glance block, and by the `offers` JSON-LD in
  // src/helpers/schema.js — which is why it lives here rather than in a model.
  sessions: {
    atA1K9: '£90',
    atHome: '£130',
    travelNote: 'plus travel if you are any distance away',
    length: 'One hour',
    lead: 'Usually within about a week',
    note: 'One session is normally enough. Two dogs from the same home can share it at no extra charge',
  },
}
