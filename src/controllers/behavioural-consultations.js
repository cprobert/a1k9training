import { faqsByIds } from './faqLib.js'

// Runs once per record in src/models/behavioural-consultations. Mirrors
// src/controllers/course.js: the record names the FAQs its page shows inline as
// `faqIds`, and faqLib resolves them from src/models/faqs/*.json so each answer
// is written once and also appears on /faqs/.
export default ({ model }) => ({
  slug: model.slug,
  title: model.title,
  description: model.description,
  model: {
    ...model,
    faqs: faqsByIds(model.faqIds, `the ${model.slug} consultation record`),
  },
})
