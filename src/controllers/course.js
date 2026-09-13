import { faqsByIds } from './faqLib.js'

// Runs once per record in src/models/courses for the /courses/* fan-out.
// A record names the FAQs its page shows inline as `faqIds`; the answers
// themselves live in src/models/faqs/*.json and are resolved by faqLib, so the
// same answer appears on the course page and on /faqs/ without being written
// twice. An id nothing defines fails the build.
export default ({ model }) => ({
  slug: model.slug,
  title: model.title,
  description: model.description,
  model: {
    ...model,
    faqs: faqsByIds(model.faqIds, `the ${model.slug} course record`),
  },
})
