#!/usr/bin/env node
// qa/axe.mjs <siteDir> <label>
//
// Runs an axe-core accessibility scan (via @axe-core/playwright) against
// every page at 375 and 1440 wide. Violations are grouped by impact
// (critical/serious/moderate/minor). Writes qa/out/<label>/axe.json (and,
// for label === 'baseline', a copy to qa/baseline/axe.json).
//
// The scan is scoped to markup this repo produces. @axe-core/playwright
// injects axe into *every* frame Playwright exposes, cross-origin ones
// included, so an embedded third-party player or map is scanned as if it
// were ours and its vendor's accessibility bugs are reported against our
// pages. That is what happened here: YouTube's own player markup on
// /courses/puppy-socialisation contributed two critical and one serious
// violation (aria-allowed-attr on .ytmVideoInfoVideoTitle,
// aria-prohibited-attr on #movie_player, button-name on
// .ytmVideoInfoChannelAvatar) at both viewports. Nothing in this
// repository can fix those, and a vendor's next deploy would move the
// gate under us either way — the site has three such embeds today (one
// youtube-nocookie.com, two google.com/maps).
//
// So findings inside a cross-origin frame are moved to a `thirdParty`
// list per page, out of `counts` (which is what qa/check-axe.mjs gates
// on) but still written to the report so they are visible rather than
// lost. Everything in the host document is unaffected, the <iframe>
// elements themselves included: frame-title still applies to our markup,
// because it is the iframe element that carries the title, not its
// contents.

import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { serve } from './serve.mjs'
import { listPages } from './pages.mjs'

const CHROME_PATH =
  process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'

const WIDTHS = [375, 1440]
const IMPACTS = ['critical', 'serious', 'moderate', 'minor']

function groupByImpact(violations) {
  const groups = { critical: [], serious: [], moderate: [], minor: [] }
  for (const v of violations) {
    const impact = IMPACTS.includes(v.impact) ? v.impact : 'minor'
    groups[impact].push({
      id: v.id,
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        html: n.html,
        failureSummary: n.failureSummary,
      })),
    })
  }
  return groups
}

/**
 * Split axe violations into those in the page's own document and those
 * inside a cross-origin frame.
 *
 * axe reports a node inside a frame with a multi-part `target`: the
 * selector of the <iframe> in the host document, then the selector within
 * it. So any node with `target.length > 1` is framed, and resolving
 * `target[0]` against the page gives the frame's src to compare origins.
 * A same-origin frame stays in scope — it would be our markup.
 *
 * @param {import('playwright').Page} page
 * @param {any[]} violations
 * @returns {Promise<{ own: any[], thirdParty: any[] }>}
 */
export async function splitByOrigin(page, violations) {
  const pageOrigin = new URL(page.url()).origin
  const isCrossOrigin = new Map()

  /** @param {string} selector */
  async function crossOrigin(selector) {
    if (isCrossOrigin.has(selector)) return isCrossOrigin.get(selector)
    let verdict = false
    try {
      const src = await page.$eval(selector, (el) => el.getAttribute('src'))
      // A frame with no src (srcdoc, about:blank) inherits our origin.
      verdict = src ? new URL(src, page.url()).origin !== pageOrigin : false
    } catch {
      // Selector no longer resolves: treat it as ours rather than hide it.
      verdict = false
    }
    isCrossOrigin.set(selector, verdict)
    return verdict
  }

  const own = []
  const thirdParty = []
  for (const v of violations) {
    const ownNodes = []
    const framedNodes = []
    for (const n of v.nodes) {
      const target = Array.isArray(n.target) ? n.target : [n.target]
      // eslint-disable-next-line no-await-in-loop
      const framed = target.length > 1 && (await crossOrigin(String(target[0])))
      ;(framed ? framedNodes : ownNodes).push(n)
    }
    if (ownNodes.length) own.push({ ...v, nodes: ownNodes })
    if (framedNodes.length) thirdParty.push({ ...v, nodes: framedNodes })
  }
  return { own, thirdParty }
}

function countsOf(groups) {
  return Object.fromEntries(IMPACTS.map((impact) => [impact, groups[impact].length]))
}

/**
 * Run the full axe pass for a built site.
 * @param {string} siteDir
 * @param {string} label
 */
export async function runAxe(siteDir, label) {
  const pages = await listPages(siteDir)
  const handle = await serve(siteDir, 0)
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--headless=new', '--no-sandbox', '--disable-gpu'],
  })

  const summary = { label, generated: new Date().toISOString(), pages: {} }

  try {
    for (const urlPath of pages) {
      summary.pages[urlPath] = {}
      for (const width of WIDTHS) {
        console.log(`[axe] ${urlPath} @ ${width}`)
        const context = await browser.newContext({ viewport: { width, height: 900 } })
        const page = await context.newPage()
        // eslint-disable-next-line no-await-in-loop
        await page.goto(handle.url + urlPath, { waitUntil: 'networkidle', timeout: 30000 })
        // eslint-disable-next-line no-await-in-loop
        const results = await new AxeBuilder({ page }).analyze()
        // eslint-disable-next-line no-await-in-loop
        const { own, thirdParty } = await splitByOrigin(page, results.violations)
        const groups = groupByImpact(own)
        summary.pages[urlPath][width] = {
          counts: countsOf(groups),
          violations: groups,
          thirdParty: groupByImpact(thirdParty),
        }
        if (thirdParty.length) {
          console.log(
            `[axe] ${urlPath} @ ${width}: ${thirdParty.length} finding(s) inside a cross-origin frame, not gated`
          )
        }
        // eslint-disable-next-line no-await-in-loop
        await context.close()
      }
    }
  } finally {
    await browser.close()
    await handle.close()
  }

  const outDir = path.resolve('qa/out', label)
  await fs.mkdir(outDir, { recursive: true })
  const outFile = path.join(outDir, 'axe.json')
  await fs.writeFile(outFile, JSON.stringify(summary, null, 2))
  console.log(`Wrote ${outFile}`)

  if (label === 'baseline') {
    const baselineDir = path.resolve('qa/baseline')
    await fs.mkdir(baselineDir, { recursive: true })
    await fs.copyFile(outFile, path.join(baselineDir, 'axe.json'))
    console.log(`Copied to ${path.join(baselineDir, 'axe.json')}`)
  }

  return summary
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url)
if (isMain) {
  const [siteDir, label] = process.argv.slice(2)
  if (!siteDir || !label) {
    console.error('Usage: node qa/axe.mjs <siteDir> <label>')
    process.exit(1)
  }
  await runAxe(siteDir, label)
}
