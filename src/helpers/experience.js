// "Over N years" of experience, worked out at build time from the one year in
// src/config/business.js (`experienceSince`), so the About and aggression
// pages move forward on their own instead of saying "15 years" for a decade.

// Whole years from `since` to `today`, rounded down to a multiple of `step`.
// Rounding down keeps "over N" true: 2006 → 20 in 2026, and still 20 (not 25)
// until 2031. The pure half, unit-tested by qa/experience.test.mjs.
export function yearsOver(since, { today = new Date(), step = 5 } = {}) {
  if (!Number.isInteger(since)) {
    throw new TypeError(`experienceSince must be a year, got ${since}`)
  }
  const years = today.getUTCFullYear() - since
  if (years < step) {
    throw new RangeError(
      `experienceSince ${since} is under ${step} years ago; "over N years" would be meaningless`,
    )
  }
  return Math.floor(years / step) * step
}

// The clock, read once per build like src/controllers/course.js's, so every
// page in one build states the same figure.
const TODAY = new Date()

export function registerExperienceHelpers(kiss) {
  // {{experienceYears}} → "over 20 years". Throws (failing the build) if the
  // config year is missing or implausible rather than printing "over NaN".
  kiss.handlebars.registerHelper(
    'experienceYears',
    () =>
      `over ${yearsOver(kiss.config.business?.experienceSince, { today: TODAY })} years`,
  )
}
