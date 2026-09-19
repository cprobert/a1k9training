// node --test qa/faqlib.test.mjs
//
// splitFaqs is the pure piece of src/controllers/faqLib.js's searchOnly
// handling: no filesystem, so it's testable directly rather than only
// indirectly through a full build.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { splitFaqs } from '../src/controllers/faqLib.js'

test('curated entries keep their input order; searchOnly entries move to more, sorted by q', () => {
  const entries = [
    { id: 'a', q: 'Zebra question', group: 'choosing' },
    { id: 'b', q: 'Apple question', group: 'choosing', searchOnly: true },
    { id: 'c', q: 'Mango question', group: 'choosing' },
    { id: 'd', q: 'Banana question', group: 'choosing', searchOnly: true },
  ]
  const { curated, more } = splitFaqs(entries)
  assert.deepEqual(
    curated.map((e) => e.id),
    ['a', 'c'],
  )
  assert.deepEqual(
    more.map((e) => e.id),
    ['b', 'd'], // Apple before Banana
  )
})

test('an entry with no searchOnly flag is curated by default', () => {
  const { curated, more } = splitFaqs([{ id: 'x', q: 'Q', group: 'choosing' }])
  assert.deepEqual(
    curated.map((e) => e.id),
    ['x'],
  )
  assert.deepEqual(more, [])
})

test('searchOnly: false is curated, not more', () => {
  const { curated, more } = splitFaqs([
    { id: 'x', q: 'Q', group: 'choosing', searchOnly: false },
  ])
  assert.deepEqual(
    curated.map((e) => e.id),
    ['x'],
  )
  assert.deepEqual(more, [])
})

test('an empty or missing list splits into two empty lists', () => {
  assert.deepEqual(splitFaqs([]), { curated: [], more: [] })
  assert.deepEqual(splitFaqs(undefined), { curated: [], more: [] })
})
