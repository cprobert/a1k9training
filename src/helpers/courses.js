import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { utils } from 'kiss-ssg'
import { makeLinkTo } from './link.js'

export function registerCourseHelpers(kiss) {
  const linkTo = makeLinkTo(kiss)

  // The course progression, read from the course models themselves so that adding
  // or reordering a course means editing its own .json and nothing else.
  //
  // Junior -> Bronze -> Silver -> Gold -> Platinum is a strict chain: each course
  // is the prerequisite for the next, and a model's `level` is its place in it.
  // Puppy Socialisation is NOT rung zero — it is a standalone socialisation class
  // that feeds into Junior without being required first, which is what `onramp`
  // marks and what the dashed connector says in the rendered track. One to One is
  // a private format rather than a stage, carries neither field, and so gets no
  // track at all.
  const COURSE_MODELS = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    '../models/courses',
  )
  // No `url` here: the steps are built as the helpers are registered, before any
  // page is, so the URL is resolved per step at render time (`withUrl` in the
  // courseLadder helper) where {{link}} can vouch for it.
  const ladderStep = (m) => ({
    slug: m.slug,
    rung: m.rung,
    name: m.crumb,
  })
  const courseModels = fs
    .readdirSync(COURSE_MODELS)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(`${COURSE_MODELS}/${f}`, 'utf8')))

  const LADDER = courseModels
    .filter((m) => typeof m.level === 'number')
    .sort((a, b) => a.level - b.level)
    .map(ladderStep)
  const ONRAMP = courseModels.filter((m) => m.onramp).map(ladderStep)[0] ?? null

  // The track for the course page being rendered: every step in order, the one
  // the visitor is on flagged, and the next course up. Returns null for any page
  // that is not a course on the ladder (One to One, the courses index, everything
  // outside /courses/), and the partial renders nothing for a null.
  kiss.handlebars.registerHelper('courseLadder', function (options) {
    const [section, slug] = utils
      .toURLKey(options?.data?.root?.pageURL ?? '')
      .split('/')
    if (section !== 'courses' || !slug) return null

    const rung = LADDER.findIndex((s) => s.slug === slug)
    const isOnramp = ONRAMP?.slug === slug
    if (rung === -1 && !isOnramp) return null

    const withUrl = (s) =>
      s ? { ...s, url: linkTo('courses/course', s.slug) } : null
    const steps = []
    if (ONRAMP)
      steps.push({ ...withUrl(ONRAMP), current: isOnramp, optional: true })
    LADDER.forEach((s, i) =>
      steps.push({
        ...withUrl(s),
        current: s.slug === slug,
        // the only dashed connector is the optional one from the on-ramp into
        // the first rung; every other step follows its predecessor strictly
        dashedIn: i === 0 && Boolean(ONRAMP),
      }),
    )

    return {
      steps,
      current: steps.find((s) => s.current),
      next: withUrl(isOnramp ? LADDER[0] : LADDER[rung + 1]),
      isOnramp,
    }
  })
}
