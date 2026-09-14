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

import { readFile } from 'node:fs/promises'
import path from 'node:path'

const [label] = process.argv.slice(2)
if (!label) {
  console.error('Usage: node qa/check-axe.mjs <label>')
  process.exit(1)
}

const reportPath = path.resolve('qa/out', label, 'axe.json')
const report = JSON.parse(await readFile(reportPath, 'utf8'))

let total = 0
const offenders = []
for (const [pagePath, byViewport] of Object.entries(report.pages)) {
  for (const [viewport, result] of Object.entries(byViewport)) {
    const { critical, serious, moderate, minor } = result.counts
    const sum = critical + serious + moderate + minor
    if (sum > 0) {
      total += sum
      offenders.push(`  ${pagePath} @ ${viewport}: ${JSON.stringify(result.counts)}`)
    }
  }
}

const pageCount = Object.keys(report.pages).length

if (total > 0) {
  console.error(`axe found ${total} accessibility violation(s):`)
  console.error(offenders.join('\n'))
  process.exit(1)
}

console.log(`axe: 0 violations across ${pageCount} page(s).`)
