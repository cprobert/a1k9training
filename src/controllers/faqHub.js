import { faqSections, moreFaqs } from './faqLib.js'

// The /faqs/ hub: every FAQ on the site, grouped for src/pages/faqs.hbs.
// This is the only page that carries FAQPage JSON-LD, so there is one
// machine-readable copy of each answer rather than one per course page.
export default ({ model }) => {
  const sections = faqSections()
  const more = moreFaqs()
  return {
    model: {
      ...model,
      sections,
      // The long-tail entries: findable by the page's search box, and in the
      // JSON-LD, but not part of the curated list or its count — see the
      // "More answers" block in src/pages/faqs.hbs.
      moreFaqs: more,
      faqCount: sections.reduce((n, section) => n + section.faqs.length, 0),
      // Flat list, curated + more, in that order, for the JSON-LD block —
      // it has to cover everything the page can show, search included.
      allFaqs: sections.flatMap((section) => section.faqs).concat(more),
    },
  }
}
