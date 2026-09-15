#!/usr/bin/env node
// qa/check-axe.mjs <label> — pass/fail gate over an axe.mjs report.
//
// qa/axe.mjs itself never fails on violations found — it only writes
// qa/out/<label>/axe.json (its one process.exit(1) is a CLI-usage guard,
// not a violation gate). This script is what turns that report into an
// actual gate: sum every critical/serious/moderate/minor violation across
// every page and viewport, and exit 1 if there are any.
//
// Every page axe.mjs scanned came from qa/pages.mjs's listPages(), which
// already excludes incidental static files (the Google Search Console
// site-verification stub, say) that were never a kiss-ssg page — no
// per-page exclusion needed here.
//
// `counts` holds the findings in the page's own document only. Findings
// inside a cross-origin frame (the YouTube player, the Google Maps
// embeds) are on `thirdParty` instead: reported below, never gated on,
// because no change in this repository can fix a vendor's markup. See
// the header of qa/axe.mjs.

import { readFile } from 'node:fs/promises'
import path from 'node:path'

const [label] = process.argv.slice(2)
if (!label) {
  console.error('Usage: node qa/check-axe.mjs <label>')
  process.exit(1)
}

const IMPACTS = ['critical', 'serious', 'moderate', 'minor']

const reportPath = path.resolve('qa/out', label, 'axe.json')
const report = JSON.parse(await readFile(reportPath, 'utf8'))

const sumOf = (groups) =>
  IMPACTS.reduce((n, impact) => n + (groups?.[impact]?.length ?? 0), 0)

let total = 0
const offenders = []
const thirdParty = []
for (const [pagePath, byViewport] of Object.entries(report.pages)) {
  for (const [viewport, result] of Object.entries(byViewport)) {
    const { critical, serious, moderate, minor } = result.counts
    const sum = critical + serious + moderate + minor
    if (sum > 0) {
      total += sum
      offenders.push(`  ${pagePath} @ ${viewport}: ${JSON.stringify(result.counts)}`)
    }
    // Pre-existing reports have no `thirdParty` key; treat that as none.
    const framed = sumOf(result.thirdParty)
    if (framed > 0) {
      const rules = IMPACTS.flatMap((impact) =>
        (result.thirdParty[impact] ?? []).map((v) => `${impact}/${v.id}`)
      )
      thirdParty.push(`  ${pagePath} @ ${viewport}: ${rules.join(', ')}`)
    }
  }
}

const pageCount = Object.keys(report.pages).length

if (thirdParty.length) {
  console.log('axe: findings inside cross-origin frames (not gated, not ours):')
  console.log(thirdParty.join('\n'))
}

if (total > 0) {
  console.error(`axe found ${total} accessibility violation(s):`)
  console.error(offenders.join('\n'))
  process.exit(1)
}

console.log(`axe: 0 violations across ${pageCount} page(s).`)
