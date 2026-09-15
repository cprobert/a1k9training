import { faqsByIds } from './faqLib.js'
import { business } from '../config/business.js'
import { nextStart, formatStart, upcomingStarts } from '../helpers/schedule.js'

// The clock, read once per build so that all five dated course pages agree
// even if the build straddles midnight. This is the only impure thing in here;
// the arithmetic itself lives in src/helpers/schedule.js, which takes `today`
// as an argument and is unit-tested (qa/schedule.test.mjs).
const TODAY = new Date()

// How many starts ahead the page carries. See `upcoming` below.
const HORIZON = 12

// The start dates for one course record, already written the way the page says
// them. A record opts in by carrying `startDay` ("sunday"/"saturday") and
// `startTime`; Platinum has neither, because its dates are agreed with the
// group at Gold graduation, and it keeps its `startNote` instead.
//
// A record carrying a literal `nextStart` string gets no schedule at all —
// that is the manual override for a block that is cancelled or moved, and it
// has to beat the rolling date in the browser as well as in the markup, not
// just win the template's first `{{#if}}`.
//
// `next` and `current` are the build-time answer: the text in the markup, which
// is what a crawler and a reader without JavaScript get. `upcoming` and `time`
// are the same timetable carried forward — src/partials/at-a-glance.hbs puts
// them in data attributes and src/assets/js/site.js re-picks the right date at
// load time, because this site builds on push and a page deployed in October
// would otherwise still be naming an October date in December.
const scheduleFor = (model) => {
  if (model.nextStart) return undefined
  if (!model.startDay || !model.startTime) return undefined
  const { anchorSunday, blockWeeks } = business.courses
  const timetable = { anchorSunday, blockWeeks, day: model.startDay }
  const { next, current } = nextStart({ ...timetable, today: TODAY })
  return {
    next: formatStart(next, { time: model.startTime, today: TODAY }),
    current: current
      ? formatStart(current, { time: model.startTime, today: TODAY })
      : null,
    upcoming: upcomingStarts({ ...timetable, from: TODAY, count: HORIZON }),
    time: model.startTime,
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
