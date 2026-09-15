import { HOME_HERO_IMAGE } from './format.js'

// schema.org JSON-LD builders: the same facts the page renders for a person,
// re-expressed for a machine. Each returns a plain object that the template
// serialises with {{{stringify ...}}}.

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
  const business = kiss.config.business

  kiss.handlebars.registerHelper('localBusiness', function (model) {
    const siteUrl = kiss.config.siteUrl
    const image = (model && model.image) || HOME_HERO_IMAGE
    return {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: business.name,
      alternateName: business.alternateName,
      url: `${siteUrl}/`,
      telephone: business.telephone,
      areaServed: business.areaServed,
      image: `${siteUrl}${image}`,
      sameAs: [
        business.social.facebook,
        business.social.youtube,
        business.social.linkedin,
      ],
      location: business.locations,
    }
  })

  const BUSINESS_REF = {
    '@type': 'LocalBusiness',
    name: business.name,
    url: `${kiss.config.siteUrl}/`,
  }

  // FAQPage JSON-LD. Used by src/pages/faqs.hbs and nowhere else: since #26
  // the markup is centralised on /faqs/, one authoritative copy of all 32
  // answers, rather than repeated on every page that renders the inline FAQ
  // accordion. (It was called from src/partials/faqs.hbs before that, which
  // is why it once appeared on the course and consultation pages.)
  // The argument is the plain [{q, a}] array faqLib.js resolves, so the
  // helper only reshapes it; `a` may contain markup, which is fine in an
  // acceptedAnswer's text.
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
    areaServed: business.areaServed,
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
