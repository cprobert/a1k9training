// The course timetable as arithmetic instead of a typed-out date.
//
// "When does the next course start?" is the most-asked enquiry this site
// receives, and until now five course models answered it with a hand-typed
// `nextStart` string that went stale six weeks later. Gaynor's rule (interview,
// 2026-09-14) is simple enough to compute: courses run in six-week blocks back
// to back, so one anchor Sunday plus a whole number of blocks is every start
// date there will ever be. Puppy, Junior and Bronze share a start Sunday;
// Silver and Gold start the Saturday before it.
//
// Pure by design — no I/O, no `new Date()` in here. `today` is a parameter, so
// every case a page can be in is a unit test (qa/schedule.test.mjs) rather than
// something you can only see by waiting. src/controllers/course.js reads the
// clock once per build and passes it in.
//
// Dates are calendar dates, held at noon UTC. The site's readers are in
// Europe/London, where the clocks move twice a year, and doing week arithmetic
// on local Dates lands a start an hour out — which, added up across a year of
// six-week blocks, eventually moves a Sunday onto the Saturday. Noon UTC is far
// enough from either boundary that no offset can push a date across midnight.

const DAY_MS = 86400000
const WEEK_MS = 7 * DAY_MS
const NOON = 12

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

// Saturday courses run the day before the Sunday ones, so one anchor drives
// the whole timetable rather than two that could drift apart.
const DAY_OFFSETS = { sunday: 0, saturday: -1 }

/** A 'YYYY-MM-DD' calendar date as noon UTC. Throws rather than returning Invalid Date. */
function parseISODate(value, label) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? ''))
  if (!match) {
    throw new Error(
      `${label} must be a 'YYYY-MM-DD' calendar date, not ${JSON.stringify(value)}`,
    )
  }
  const [, year, month, day] = match
  const time = Date.UTC(Number(year), Number(month) - 1, Number(day), NOON)
  const date = new Date(time)
  if (
    date.getUTCMonth() !== Number(month) - 1 ||
    date.getUTCDate() !== Number(day)
  ) {
    throw new Error(`${label} is not a real date: ${value}`)
  }
  return date
}

/**
 * Whatever the caller has — a Date from the build clock, or an ISO string —
 * reduced to the calendar date it falls on, at noon UTC. The time of day is
 * deliberately discarded: a build at 23:50 must not report a course starting
 * today as already past.
 */
export function toCalendarDate(value, label = 'date') {
  if (typeof value === 'string') return parseISODate(value, label)
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new Error(`${label} must be a Date or a 'YYYY-MM-DD' string`)
  }
  return new Date(
    Date.UTC(
      value.getUTCFullYear(),
      value.getUTCMonth(),
      value.getUTCDate(),
      NOON,
    ),
  )
}

/**
 * The course starts either side of `today`.
 *
 * @param {object} options
 * @param {string} options.anchorSunday  One real start Sunday, 'YYYY-MM-DD'.
 * @param {number} options.blockWeeks    Weeks in a course block (six).
 * @param {'sunday'|'saturday'} options.day  Which day this course runs on.
 * @param {Date|string} options.today    The day the page is being built for.
 * @returns {{ next: Date, current: Date|null }}
 *   `next` is the first start on or after `today`. `current` is the start
 *   before it when `today` falls inside that course's first week — the window
 *   in which a newcomer can still join, at week two — and `null` otherwise.
 *   A start day itself is a `next`, never a `current`: a course you can join
 *   today has not "already started".
 */
export function nextStart({ anchorSunday, blockWeeks, day = 'sunday', today }) {
  const offsetDays = DAY_OFFSETS[String(day).toLowerCase()]
  if (offsetDays === undefined) {
    throw new Error(
      `startDay must be 'sunday' or 'saturday', not ${JSON.stringify(day)}`,
    )
  }
  if (!Number.isInteger(blockWeeks) || blockWeeks < 1) {
    throw new Error(
      `blockWeeks must be a positive whole number, not ${blockWeeks}`,
    )
  }

  const anchor = parseISODate(anchorSunday, 'anchorSunday')
  if (anchor.getUTCDay() !== 0) {
    throw new Error(
      `anchorSunday ${anchorSunday} is a ${WEEKDAYS[anchor.getUTCDay()]}, not a Sunday`,
    )
  }

  const blockMs = blockWeeks * WEEK_MS
  const first = anchor.getTime() + offsetDays * DAY_MS
  const now = toCalendarDate(today, 'today').getTime()
  const elapsed = now - first

  const next = new Date(first + Math.ceil(elapsed / blockMs) * blockMs)
  const previous = first + Math.floor(elapsed / blockMs) * blockMs
  const sincePrevious = now - previous
  const current =
    sincePrevious > 0 && sincePrevious < WEEK_MS ? new Date(previous) : null

  return { next, current }
}

/** A calendar date as the 'YYYY-MM-DD' string a data attribute carries. */
export function toISODate(date) {
  return toCalendarDate(date, 'date').toISOString().slice(0, 10)
}

/**
 * The next `count` start dates as ISO strings, beginning with the first on or
 * after `from` — the forward-facing timetable the built page carries in a data
 * attribute so that src/assets/js/site.js can pick the right one at load time.
 *
 * This site builds on push, not on a schedule, so without it a page deployed in
 * October would still be naming an October date in December. Twelve starts is
 * about sixteen months, which is longer than this site has ever gone between
 * deploys; past the end of the list the script leaves the build-time text
 * alone rather than inventing one.
 *
 * @param {{ anchorSunday: string, blockWeeks: number, day?: 'sunday'|'saturday', from: Date|string, count?: number }} options
 * @returns {string[]}
 */
export function upcomingStarts({
  anchorSunday,
  blockWeeks,
  day = 'sunday',
  from,
  count = 12,
}) {
  if (!Number.isInteger(count) || count < 1) {
    throw new Error(`count must be a positive whole number, not ${count}`)
  }
  const { next } = nextStart({ anchorSunday, blockWeeks, day, today: from })
  const blockMs = blockWeeks * WEEK_MS
  const starts = []
  for (let i = 0; i < count; i++) {
    starts.push(toISODate(new Date(next.getTime() + i * blockMs)))
  }
  return starts
}

/**
 * A start date in the house style the five course pages already used:
 * "Sunday 11 October, 3:00pm". The year is added only when it is not the year
 * `today` falls in, so a reader in October is not told the obvious and a
 * reader in December is not left guessing which January is meant.
 *
 * @param {Date} date
 * @param {{ time?: string, today?: Date|string }} [options]
 */
export function formatStart(date, { time, today } = {}) {
  const start = toCalendarDate(date, 'date')
  const parts = [
    WEEKDAYS[start.getUTCDay()],
    String(start.getUTCDate()),
    MONTHS[start.getUTCMonth()],
  ]
  const thisYear = today
    ? toCalendarDate(today, 'today').getUTCFullYear()
    : start.getUTCFullYear()
  if (start.getUTCFullYear() !== thisYear)
    parts.push(String(start.getUTCFullYear()))
  const written = parts.join(' ')
  return time ? `${written}, ${time}` : written
}
