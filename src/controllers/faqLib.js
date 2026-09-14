import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// The one place FAQ content is loaded. Every page that shows FAQs — the hub at
// /faqs/, each course page, the consultation pages — resolves entries from here
// by id, so an answer exists once and is edited once.
//
// This is a plain module, not a page controller: kiss never loads it directly.

const HERE = path.dirname(fileURLToPath(import.meta.url))
const FAQ_DIR = path.join(HERE, '..', 'models', 'faqs')
const COURSE_DIR = path.join(HERE, '..', 'models', 'courses')

// Hub section order. A group with no entries is simply not rendered.
export const GROUPS = [
  { key: 'booking', title: 'Booking, prices and payment' },
  { key: 'choosing', title: 'Choosing the right course or service' },
  { key: 'practical', title: 'On the day: venue, weather and what to bring' },
  { key: 'puppy', title: 'Puppy Socialisation' },
  { key: 'junior', title: 'Junior' },
  { key: 'bronze', title: 'Bronze' },
  { key: 'advanced', title: 'Silver, Gold and Platinum' },
  { key: 'one-to-one', title: 'One-to-one training' },
  { key: 'consultations', title: 'Behaviour consultations' },
]

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'))

// "Puppy Socialisation is £59.99, Junior and Bronze are £119.99, and Silver,
// Gold and Platinum are £129.99" — built from the course records themselves, so
// a price change on a course page cannot leave the FAQ answering last month's
// figure. Courses with no price (One-to-one) are left out.
function coursePriceSentence() {
  const courses = readdirSync(COURSE_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => readJson(path.join(COURSE_DIR, f)))
    .filter((c) => c.price)
    // Puppy Socialisation carries no `level` — it is standalone rather than a
    // rung on the ladder — so it sorts first, which is also how it reads.
    .sort((a, b) => (a.level ?? -1) - (b.level ?? -1))

  const runs = []
  for (const course of courses) {
    const name = course.rung === 'Puppy' ? 'Puppy Socialisation' : course.rung
    const last = runs[runs.length - 1]
    if (last && last.price === course.price) last.names.push(name)
    else runs.push({ price: course.price, names: [name] })
  }

  const list = (names) =>
    names.length > 1
      ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
      : names[0]

  const parts = runs.map(
    (run) => `${list(run.names)} ${run.names.length > 1 ? 'are' : 'is'} ${run.price}`,
  )
  return parts.length > 1
    ? `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`
    : parts[0]
}

let index = null

/** Every FAQ entry, keyed by id. Built once per build. */
export function faqIndex() {
  if (index) return index
  const prices = coursePriceSentence()
  index = new Map()
  for (const file of readdirSync(FAQ_DIR).filter((f) => f.endsWith('.json'))) {
    const { faqs } = readJson(path.join(FAQ_DIR, file))
    for (const entry of faqs ?? []) {
      if (!entry.id) throw new Error(`FAQ with no id in ${file}: "${entry.q}"`)
      if (index.has(entry.id))
        throw new Error(`Duplicate FAQ id "${entry.id}" (${file})`)
      index.set(entry.id, {
        ...entry,
        source: file,
        a: entry.a.replace('[PRICES]', prices),
      })
    }
  }
  return index
}

/**
 * The entries a page shows inline, in the order the page asked for them.
 * An unknown id fails the build rather than rendering a gap.
 */
export function faqsByIds(ids, where = 'a page') {
  const all = faqIndex()
  return (ids ?? []).map((id) => {
    const entry = all.get(id)
    if (!entry)
      throw new Error(
        `Unknown FAQ id "${id}" requested by ${where}. Ids live in src/models/faqs/*.json.`,
      )
    return entry
  })
}

/** Every entry, grouped for the hub page, in GROUPS order. */
export function faqSections() {
  const all = [...faqIndex().values()]
  const ungrouped = all.filter((e) => !GROUPS.some((g) => g.key === e.group))
  if (ungrouped.length)
    throw new Error(
      `FAQ group not in GROUPS: ${[...new Set(ungrouped.map((e) => e.group))].join(', ')}`,
    )
  return GROUPS.map((group) => ({
    ...group,
    faqs: all.filter((entry) => entry.group === group.key),
  })).filter((section) => section.faqs.length)
}
