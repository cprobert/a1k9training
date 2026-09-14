import { HOME_HERO_IMAGE } from './format.js'

// schema.org JSON-LD builders: the same facts the page renders for a person,
// re-expressed for a machine. Each returns a plain object that the template
// serialises with {{{stringify ...}}}.

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

export function registerSchemaHelpers(kiss) {
  // LocalBusiness JSON-LD (src/partials/layout/header.hbs, every page). Built
  // as a helper rather than hand-typed JSON in the template so title/description
  // text and image paths go through JSON.stringify's own escaping instead of
  // Handlebars'. Only fields this repo actually sources are included — no
  // street address or opening hours live anywhere in it, so none are invented
  // here. The social links come from src/partials/layout/footer.hbs (tracking
  // query string dropped from Facebook's); the phone number is the site's
  // tel: link. `location` is the LOCATIONS pair above, sourced from
  // src/pages/contact.hbs.
  kiss.handlebars.registerHelper('localBusiness', function (model) {
    const siteUrl = kiss.config.siteUrl
    const image = (model && model.image) || HOME_HERO_IMAGE
    return {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'A1K9 Behaviour and Training Academy',
      alternateName: 'Gaynor Probert Dog Behaviour and Training',
      url: `${siteUrl}/`,
      telephone: '+447798500390',
      areaServed: 'South Wales',
      image: `${siteUrl}${image}`,
      sameAs: [
        'https://www.facebook.com/A1K9PDT',
        'https://www.youtube.com/channel/UCA0GMQkoz1lgjHvo41hqH2A',
        'https://www.linkedin.com/in/gaynor-probert-b869581a/',
      ],
      location: LOCATIONS,
    }
  })

  const BUSINESS_REF = {
    '@type': 'LocalBusiness',
    name: 'A1K9 Behaviour and Training Academy',
    url: `${kiss.config.siteUrl}/`,
  }

  // FAQPage JSON-LD, for src/partials/faqs.hbs — used on /courses/ and every
  // course page that carries a `faqs` field (see src/models/courses/*.json).
  // `this` inside faqs.hbs is already the plain [{q, a}] array the faqMapper/
  // course controllers load, so the helper just reshapes it.
  kiss.handlebars.registerHelper('faqPage', (faqs) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (faqs || []).map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  }))

  // Service JSON-LD for a course or consultation page — src/pages/courses/course.hbs
  // and src/pages/behavioural-consultations/{index,consultation}.hbs. `provider`
  // points back at the same LocalBusiness the header's JSON-LD describes.
  kiss.handlebars.registerHelper('serviceSchema', (name, description, url) => ({
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: name,
    name,
    description,
    provider: BUSINESS_REF,
    areaServed: 'South Wales',
    url,
  }))

  // Person JSON-LD for a team member's About page — src/pages/about.hbs, gated
  // on the model carrying a `person` object (only gaynor-probert.json and
  // sara-thomas.json do; Philosophy and Facilities don't get one). `credentials`
  // is an optional array of plain strings, e.g. accreditation names.
  kiss.handlebars.registerHelper(
    'personSchema',
    (name, jobTitle, description, image, url, credentials) => {
      const siteUrl = kiss.config.siteUrl
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name,
        jobTitle,
        description,
        image: `${siteUrl}${image}`,
        url,
        worksFor: BUSINESS_REF,
      }
      if (Array.isArray(credentials) && credentials.length) {
        schema.hasCredential = credentials.map((c) => ({
          '@type': 'EducationalOccupationalCredential',
          name: c,
        }))
      }
      return schema
    },
  )

  // BreadcrumbList JSON-LD, built from the trail the visual breadcrumb renders:
  // {{{stringify (breadcrumbList (breadcrumb))}}} in a page's head. Passing one
  // array to both is what keeps the markup describing a trail the visitor can
  // actually see.
  kiss.handlebars.registerHelper('breadcrumbList', (trail) => {
    const siteUrl = kiss.config.siteUrl
    const items = Array.isArray(trail) ? trail : []
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map(({ name, url }, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name,
        item: /^https?:\/\//.test(url) ? url : `${siteUrl}${url}`,
      })),
    }
  })
}
