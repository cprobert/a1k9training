import { faqsByIds } from './faqLib.js'
import { business } from '../config/business.js'
import { nextStart, formatStart } from '../helpers/schedule.js'

// The clock, read once per build so that all five dated course pages agree
// even if the build straddles midnight. This is the only impure thing in here;
// the arithmetic itself lives in src/helpers/schedule.js, which takes `today`
// as an argument and is unit-tested (qa/schedule.test.mjs).
const TODAY = new Date()

// The start dates for one course record, already written the way the page says
// them. A record opts in by carrying `startDay` ("sunday"/"saturday") and
// `startTime`; Platinum has neither, because its dates are agreed with the
// group at Gold graduation, and it keeps its `startNote` instead.
//
// A record may still carry a literal `nextStart` string, which the template
// prefers over anything computed here — the manual override for a block that
// is cancelled or moved. Nothing is computed for such a record either way.
const scheduleFor = (model) => {
  if (!model.startDay || !model.startTime) return undefined
  const { anchorSunday, blockWeeks } = business.courses
  const { next, current } = nextStart({
    anchorSunday,
    blockWeeks,
    day: model.startDay,
    today: TODAY,
  })
  return {
    next: formatStart(next, { time: model.startTime, today: TODAY }),
    current: current
      ? formatStart(current, { time: model.startTime, today: TODAY })
      : null,
  }
}

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
    schedule: scheduleFor(model),
  },
})
