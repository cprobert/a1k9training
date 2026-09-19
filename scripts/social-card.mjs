// Renders planning/design/social-card.html to the Open Graph image a shared
// link shows, at exactly business.socialCard's size (1200x630).
//
// A script rather than a build step on purpose: the card changes when the
// photograph or the wording does, a handful of times in the site's life, and a
// headless browser on every Netlify build to re-cut a byte-identical JPEG would
// be time spent on nothing. Run it, look at the result, commit it.
//
// Usage: node scripts/social-card.mjs
//   Uses the repo's own playwright devDependency. On Windows, point it at
//   Playwright's downloaded Chromium the way the QA scripts are:
//   CHROME_PATH=".../ms-playwright/chromium-<rev>/chrome-win64/chrome.exe"
//
// Images are cached for a year and never overwritten in place (CLAUDE.md), so
// a re-cut card is a new file: bump the -vN in business.socialCard.path first.

import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { chromium } from 'playwright'
import { business } from '../src/config/business.js'

const CARD = 'planning/design/social-card.html'
// The path and the size both come from business.js, which is also what the
// og:image tags read, so the shot and the tags cannot disagree.
const OUT = `src/assets/${business.socialCard.path}`
const { width: WIDTH, height: HEIGHT } = business.socialCard

// The card asks for /fonts/… and /images/… exactly as the site writes those
// paths; serving src/assets is what makes both resolve.
const MIME = {
  '.html': 'text/html',
  '.woff2': 'font/woff2',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
}
const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0])
  const file =
    url === '/' ? CARD : path.join('src/assets', url.replace(/^\//, ''))
  if (!fs.existsSync(file)) {
    res.writeHead(404)
    return res.end()
  }
  res.writeHead(200, {
    'content-type': MIME[path.extname(file)] ?? 'application/octet-stream',
  })
  fs.createReadStream(file).pipe(res)
})
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const base = `http://127.0.0.1:${server.address().port}`

const executablePath =
  process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)
    ? process.env.CHROME_PATH
    : undefined
const browser = await chromium.launch({ executablePath })
// deviceScaleFactor 1: the card is consumed at 1200x630, and a 2x shot is four
// times the bytes for a size nothing displays.
const page = await browser.newPage({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 1,
})
const problems = []
page.on('requestfailed', (r) => problems.push(`${r.url()} failed`))
page.on('response', (r) => {
  if (r.status() >= 400) problems.push(`${r.url()} -> ${r.status()}`)
})
await page.goto(base + '/', { waitUntil: 'load' })
// Buenard is font-display: block, so a shot taken before it arrives would
// silently ship the fallback serif. Waiting on the font set is the check.
await page.evaluate(() => document.fonts.ready)

fs.mkdirSync(path.dirname(OUT), { recursive: true })
await page.screenshot({ path: OUT, type: 'jpeg', quality: 84 })
await browser.close()
server.close()

if (problems.length) {
  console.error('the card did not load cleanly:')
  for (const p of problems) console.error('  ' + p)
  process.exit(1)
}
const kb = Math.round(fs.statSync(OUT).size / 1024)
console.log(`wrote ${OUT}: ${WIDTH}x${HEIGHT}, ${kb}KB`)
