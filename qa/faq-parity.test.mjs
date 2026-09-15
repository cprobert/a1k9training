// node --test qa/faq-parity.test.mjs
//
// The parity check exists to fail when markup and page disagree, so the
// cases that matter are the failing ones. A check that cannot fail is worth
// nothing, and this repo has shipped one before (a local axe run that could
// not reach the frame it was meant to scan).

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { faqEntriesNotRendered, visibleTextOf, normaliseText } from './faq-parity.mjs'

const faqOf = (...pairs) => ({
  '@type': 'FAQPage',
  mainEntity: pairs.map(([q, a]) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
})

test('passes when every question and answer is rendered', () => {
  const html = `<h1>FAQs</h1><details><summary>Do I need to book?</summary>
    <p>Yes, every course is booked in advance.</p></details>`
  const { total, unrendered } = faqEntriesNotRendered(
    html,
    faqOf(['Do I need to book?', '<p>Yes, every course is booked in advance.</p>']),
  )
  assert.equal(total, 1)
  assert.deepEqual(unrendered, [])
})

test('fails when a question is marked up but not rendered', () => {
  const html = `<h1>FAQs</h1><details><summary>Do I need to book?</summary>
    <p>Yes, every course is booked in advance.</p></details>`
  const { unrendered } = faqEntriesNotRendered(
    html,
    faqOf(
      ['Do I need to book?', '<p>Yes, every course is booked in advance.</p>'],
      ['What should I bring?', '<p>A lead and some treats.</p>'],
    ),
  )
  assert.equal(unrendered.length, 1)
  assert.match(unrendered[0], /question not on the page: "What should I bring\?"/)
})

test('fails when the question shows but the answer does not', () => {
  const html = `<details><summary>Do I need to book?</summary><p>Ask us.</p></details>`
  const { unrendered } = faqEntriesNotRendered(
    html,
    faqOf(['Do I need to book?', '<p>Yes, every course is booked in advance.</p>']),
  )
  assert.equal(unrendered.length, 1)
  assert.match(unrendered[0], /answer not on the page for: "Do I need to book\?"/)
})

test('the JSON-LD cannot satisfy itself', () => {
  // The whole check would be vacuous if the <script> holding the markup
  // counted as visible text — every entry would always match.
  const faq = faqOf(['Is this rendered?', '<p>No, it is only in the script.</p>'])
  const html = `<h1>FAQs</h1><script type="application/ld+json">${JSON.stringify(faq)}</script>`
  const { unrendered } = faqEntriesNotRendered(html, faq)
  assert.equal(unrendered.length, 1)
})

test('markup and entities in the answer do not cause false failures', () => {
  const html = `<details><summary>Where do you train?</summary>
    <p>At the <a href="/contact/">A1K9 grounds</a> &amp; Llys Nini.</p></details>`
  const { unrendered } = faqEntriesNotRendered(
    html,
    faqOf(['Where do you train?', '<p>At the <a href="/contact/">A1K9 grounds</a> &amp; Llys Nini.</p>']),
  )
  assert.deepEqual(unrendered, [])
})

test('a collapsed <details> counts as visible', () => {
  const html = `<details><summary>Q</summary><p>The answer body.</p></details>`
  assert.match(visibleTextOf(html), /The answer body\./)
})

test('normaliseText ignores non-strings rather than throwing', () => {
  assert.equal(normaliseText(undefined), '')
  assert.equal(normaliseText(null), '')
  assert.equal(normaliseText({ text: 'x' }), '')
})

test('an empty mainEntity is reported as zero, not as passing', () => {
  const { total, unrendered } = faqEntriesNotRendered('<h1>FAQs</h1>', { '@type': 'FAQPage' })
  assert.equal(total, 0)
  assert.deepEqual(unrendered, [])
})
