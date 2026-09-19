// node --test qa/schedule.test.mjs
//
// src/helpers/schedule.js turns one anchor Sunday into every course start
// after it, so the "Next course starts" row on five course pages stops being
// a hand-typed string that goes stale every six weeks. The dates it produces
// are the answer to the single most-asked enquiry on this site, so the cases
// that matter are the awkward ones: the week the visitor can still join, the
// two Sundays a year the clocks move, and the turn of the year.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  nextStart,
  formatStart,
  upcomingStarts,
} from '../src/helpers/schedule.js'

// The timetable src/config/business.js carries.
const TIMETABLE = { anchorSunday: '2026-10-11', blockWeeks: 6 }

// Block starts from that anchor: 2026-10-11, 2026-11-22, 2027-01-03,
// 2027-02-14, 2027-03-28, 2027-05-09 (Saturday courses, one day earlier).
const on = (isoDate) => new Date(`${isoDate}T12:00:00Z`)
const iso = (date) => (date === null ? null : date.toISOString().slice(0, 10))

const sunday = (today) => nextStart({ ...TIMETABLE, day: 'sunday', today })
const saturday = (today) => nextStart({ ...TIMETABLE, day: 'saturday', today })

test('before the anchor, the anchor itself is the next start', () => {
  const { next, current } = sunday(on('2026-09-15'))
  assert.equal(iso(next), '2026-10-11')
  assert.equal(current, null)
})

test('on the anchor, the course starts today and nothing is running yet', () => {
  // A start day is a "next", never a "current": the page must not say a
  // course you can join today has already started.
  const { next, current } = sunday(on('2026-10-11'))
  assert.equal(iso(next), '2026-10-11')
  assert.equal(current, null)
})

test('in week one, the started course and the next one are both reported', () => {
  const { next, current } = sunday(on('2026-10-14'))
  assert.equal(iso(current), '2026-10-11')
  assert.equal(iso(next), '2026-11-22')
})

test('the last day of week one still counts as joinable', () => {
  const { current } = sunday(on('2026-10-17'))
  assert.equal(iso(current), '2026-10-11')
})

test('from week two on, only the next start is reported', () => {
  // Seven days after the start is the second class; a newcomer joining then
  // is joining week two, which is as late as Gaynor takes anyone — the row
  // stops advertising the running course.
  for (const today of ['2026-10-18', '2026-10-25', '2026-11-21']) {
    const { next, current } = sunday(on(today))
    assert.equal(current, null, `expected no current course on ${today}`)
    assert.equal(iso(next), '2026-11-22')
  }
})

test('Saturday courses start the day before the shared Sunday', () => {
  const { next, current } = saturday(on('2026-09-15'))
  assert.equal(iso(next), '2026-10-10')
  assert.equal(current, null)
})

test('a Saturday course is in week one on the Sunday courses start', () => {
  const { next, current } = saturday(on('2026-10-11'))
  assert.equal(iso(current), '2026-10-10')
  assert.equal(iso(next), '2026-11-21')
})

test('many blocks after the anchor the arithmetic still lands on a Sunday', () => {
  const { next, current } = sunday(on('2028-03-10'))
  assert.equal(next.getUTCDay(), 0)
  // 2026-10-11 plus thirteen six-week blocks, ten DST changes later.
  assert.equal(iso(next), '2028-04-09')
  assert.equal(current, null)
})

test('the clocks going back in October do not shift a start date', () => {
  // BST ends 2026-10-25, between the 11 October and 22 November starts. Doing
  // the arithmetic on local Dates would land 2026-11-22 an hour out and, on a
  // machine east of UTC, on the Saturday.
  const { next } = sunday(on('2026-10-26'))
  assert.equal(iso(next), '2026-11-22')
  assert.equal(next.getUTCDay(), 0)
})

test('the clocks going forward in March do not shift a start date', () => {
  // BST begins 2027-03-28, which is itself a start Sunday.
  const { next, current } = sunday(on('2027-03-27'))
  assert.equal(iso(next), '2027-03-28')
  assert.equal(current, null)
  assert.equal(iso(sunday(on('2027-03-29')).current), '2027-03-28')
})

test('today is read as a calendar date, whatever time of day it is', () => {
  // The build runs whenever it runs; a start must not appear to have passed
  // because the clock happened to read 23:50.
  const early = nextStart({
    ...TIMETABLE,
    day: 'sunday',
    today: new Date('2026-10-11T00:05:00Z'),
  })
  const late = nextStart({
    ...TIMETABLE,
    day: 'sunday',
    today: new Date('2026-10-11T23:50:00Z'),
  })
  assert.equal(iso(early.next), '2026-10-11')
  assert.equal(iso(late.next), '2026-10-11')
})

test('an ISO date string is accepted for today as well as a Date', () => {
  assert.equal(
    iso(nextStart({ ...TIMETABLE, day: 'sunday', today: '2026-09-15' }).next),
    '2026-10-11',
  )
})

test('a day that is neither sunday nor saturday is refused', () => {
  assert.throws(
    () => nextStart({ ...TIMETABLE, day: 'tuesday', today: on('2026-09-15') }),
    /tuesday/,
  )
})

test('an unparseable anchor is refused rather than silently producing Invalid Date', () => {
  assert.throws(
    () =>
      nextStart({
        anchorSunday: '11 October 2026',
        blockWeeks: 6,
        day: 'sunday',
        today: on('2026-09-15'),
      }),
    /anchorSunday/,
  )
})

test('an anchor that is not a Sunday is refused', () => {
  assert.throws(
    () =>
      nextStart({
        anchorSunday: '2026-10-12',
        blockWeeks: 6,
        day: 'sunday',
        today: on('2026-09-15'),
      }),
    /Sunday/,
  )
})

// upcomingStarts is what the built page carries in a data attribute so the
// browser can pick the right date weeks after the deploy. Its first entry must
// therefore be exactly what nextStart() rendered into the same page, or the
// text would change under the reader for no reason.

test('upcomingStarts begins at the next start and steps a block at a time', () => {
  const starts = upcomingStarts({
    ...TIMETABLE,
    day: 'sunday',
    from: on('2026-09-15'),
    count: 4,
  })
  assert.deepEqual(starts, [
    '2026-10-11',
    '2026-11-22',
    '2027-01-03',
    '2027-02-14',
  ])
})

test('upcomingStarts agrees with nextStart on its first entry', () => {
  for (const day of ['sunday', 'saturday']) {
    for (const today of [
      '2026-09-15',
      '2026-10-11',
      '2026-10-14',
      '2027-03-28',
    ]) {
      const { next } = nextStart({ ...TIMETABLE, day, today: on(today) })
      const [first] = upcomingStarts({ ...TIMETABLE, day, from: on(today) })
      assert.equal(first, iso(next), `${day} on ${today}`)
    }
  }
})

test('upcomingStarts defaults to twelve, about sixteen months ahead', () => {
  const starts = upcomingStarts({
    ...TIMETABLE,
    day: 'sunday',
    from: on('2026-09-15'),
  })
  assert.equal(starts.length, 12)
  assert.equal(starts[11], '2028-01-16')
  // Every entry is a real Sunday, DST changes and year ends included.
  for (const s of starts)
    assert.equal(new Date(`${s}T12:00:00Z`).getUTCDay(), 0)
})

test('upcomingStarts for a Saturday course lists Saturdays', () => {
  const starts = upcomingStarts({
    ...TIMETABLE,
    day: 'saturday',
    from: on('2026-09-15'),
    count: 3,
  })
  assert.deepEqual(starts, ['2026-10-10', '2026-11-21', '2027-01-02'])
  for (const s of starts)
    assert.equal(new Date(`${s}T12:00:00Z`).getUTCDay(), 6)
})

test('upcomingStarts refuses a count that would produce no timetable', () => {
  assert.throws(
    () =>
      upcomingStarts({
        ...TIMETABLE,
        day: 'sunday',
        from: on('2026-09-15'),
        count: 0,
      }),
    /count/,
  )
})

test('formatStart writes the site house style', () => {
  assert.equal(
    formatStart(on('2026-11-22'), { time: '3:00pm', today: on('2026-09-15') }),
    'Sunday 22 November, 3:00pm',
  )
  assert.equal(
    formatStart(on('2026-10-10'), { time: '1:00pm', today: on('2026-09-15') }),
    'Saturday 10 October, 1:00pm',
  )
})

test('formatStart adds the year only when it differs from today', () => {
  assert.equal(
    formatStart(on('2027-01-03'), { time: '2:00pm', today: on('2026-12-20') }),
    'Sunday 3 January 2027, 2:00pm',
  )
  assert.equal(
    formatStart(on('2027-01-03'), { time: '2:00pm', today: on('2027-01-01') }),
    'Sunday 3 January, 2:00pm',
  )
})

test('formatStart without a time gives the date alone', () => {
  assert.equal(
    formatStart(on('2026-10-11'), { today: on('2026-09-15') }),
    'Sunday 11 October',
  )
})
