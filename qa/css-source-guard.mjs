#!/usr/bin/env node
// qa/css-source-guard.mjs [stylesheet]
//
// Guards the two ways src/styles/site.css can silently scan the wrong files.
// It reads the SOURCE stylesheet, not the build, so it needs nothing built.
//
// 1. `source(none)` must still be on the `@import 'tailwindcss'` line.
//    Without it Tailwind ADDS the @source globs to an automatic walk of the
//    repo root, which makes every prose file — CLAUDE.md, README.md,
//    planning/, AIKB/ — a class-name source. That is not hypothetical: the
//    words "container", "fixed", "outline" and "resize", written in session
//    notes and documentation, each compiled a real rule into the shipped
//    stylesheet. Because the stylesheet is content-hashed, that changes its
//    filename, which changes the <link href> on every page, which makes
//    `npm run check` report all 20 pages as changed with 0 unchanged. A
//    session lost a day to that and closed it as unexplained.
//
// 2. Every `@source` path must exist. Tailwind does not complain about a glob
//    that matches nothing, so a renamed or moved template folder stops being
//    scanned in silence and its classes stop compiling. (generate.js ->
//    router.js was exactly this shape of change.)

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const DEFAULT_STYLESHEET = path.join(ROOT, 'src/styles/site.css')

/** Every `@source '<path>'` in the stylesheet, excluding the `@source not` exclusions. */
export function sourceGlobs(css) {
  return [...css.matchAll(/^@source\s+(?!not\b)'([^']+)'/gm)].map((m) => m[1])
}

export function hasSourceNone(css) {
  return /@import\s+'tailwindcss'\s+source\(none\)\s*;/.test(css)
}

async function main() {
  const stylesheet = process.argv[2]
    ? path.resolve(process.argv[2])
    : DEFAULT_STYLESHEET
  const css = await fs.readFile(stylesheet, 'utf8')
  const rel = path.relative(ROOT, stylesheet)
  const failures = []

  if (!hasSourceNone(css)) {
    failures.push(
      `${rel}: @import 'tailwindcss' has lost its source(none) — the whole ` +
        `repo, prose included, is being scanned for class names.`,
    )
  }

  const globs = sourceGlobs(css)
  if (globs.length === 0) {
    failures.push(`${rel}: no @source globs — nothing would be scanned at all.`)
  }
  for (const glob of globs) {
    const target = path.resolve(path.dirname(stylesheet), glob)
    try {
      await fs.stat(target)
    } catch {
      failures.push(
        `${rel}: @source '${glob}' resolves to nothing (${path.relative(ROOT, target)}) — ` +
          `Tailwind scans it silently and its classes will not compile.`,
      )
    }
  }

  if (failures.length) {
    for (const f of failures) console.error(f)
    console.error(`\n${failures.length} stylesheet source problem(s).`)
    process.exit(1)
  }
  console.log(
    `Stylesheet sources ok: source(none) set, ${globs.length} @source path(s) all resolve.`,
  )
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
