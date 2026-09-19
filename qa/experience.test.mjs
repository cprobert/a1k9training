// node --test qa/experience.test.mjs
//
// src/helpers/experience.js turns Gaynor's `experienceSince` year into the
// "over N years" the About and aggression pages state. The claim has to stay
// true as it ages, so the cases that matter are the step boundaries.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { yearsOver } from '../src/helpers/experience.js'

const on = (iso) => ({ today: new Date(`${iso}T12:00:00Z`) })

test('2006 is "over 20" in 2026', () => {
  assert.equal(yearsOver(2006, on('2026-09-18')), 20)
})

test('rounds down between steps, so the claim never overstates', () => {
  assert.equal(yearsOver(2006, on('2030-12-31')), 20)
  assert.equal(yearsOver(2006, on('2031-01-01')), 25)
})

test('step is configurable', () => {
  assert.equal(yearsOver(2006, { ...on('2029-06-01'), step: 1 }), 23)
})

test('a missing or non-integer year fails loudly', () => {
  assert.throws(() => yearsOver(undefined), TypeError)
  assert.throws(() => yearsOver('2006'), TypeError)
})

test('a year too recent to be "over" anything fails loudly', () => {
  assert.throws(() => yearsOver(2024, on('2026-09-18')), RangeError)
})
