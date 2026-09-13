import { faqSections } from './faqLib.js'

// The /faqs/ hub: every FAQ on the site, grouped for src/pages/faqs.hbs.
// This is the only page that carries FAQPage JSON-LD, so there is one
// machine-readable copy of each answer rather than one per course page.
export default ({ model }) => {
  const sections = faqSections()
  return {
    model: {
      ...model,
      sections,
      faqCount: sections.reduce((n, section) => n + section.faqs.length, 0),
      // Flat list, in the same order as the page, for the JSON-LD block.
      allFaqs: sections.flatMap((section) => section.faqs),
    },
  }
}
