import { faqsByIds } from './faqLib.js'

// For a page whose model names the FAQs it shows inline as a list of ids
// (`faqIds`) — the courses index and the consultations index. The entries
// themselves live in src/models/faqs/*.json and are resolved by faqLib, so the
// same answer can appear on a section page and on /faqs/ without being written
// twice.
export default ({ model }) => ({
  model: {
    ...model,
    faqs: faqsByIds(model.faqIds, 'a page using faqMapper.js'),
  },
})
