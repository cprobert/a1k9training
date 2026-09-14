/**
 * What the router does once a build has settled — the two callbacks on
 * kiss's `complete()`/`catch()`, kept out of router.js so that file stays a
 * route table.
 *
 * Both are passed by reference (`.complete(onBuildComplete)`), and
 * `onBuildComplete` must stay a `function` rather than an arrow: kiss calls it
 * with `callback.call(this)`, so `this` is the Kiss instance and is where the
 * config and the build report come from.
 */

import fs from 'node:fs'
import path from 'node:path'
import 'colors'
import { utils } from 'kiss-ssg'

/**
 * v2 reports a page, controller or dev-server failure by rejecting complete().
 * Without the catch below a broken build still exits 0 and deploys a site with
 * pages missing. complete()'s own callback never runs for a failed build, so
 * 'Success' means the whole build was written.
 */
export function onBuildComplete() {
  console.log('Success'.rainbow)
  if (this.config.dev)
    console.log(`http://${this.config.devHost}:${this.config.port}`.yellow)
  // qa/pages.mjs's source of truth for "every page on this site": kiss's
  // own registry, not a directory walk that can't tell a rendered page
  // apart from an incidental static file copied straight from
  // src/assets (the Google site-verification stub was the case that
  // bit us — it lived in docs/ as a .html file, so a raw walk counted
  // it as a 21st page and both a hardcoded --assert=N in package.json
  // and a hand-maintained exclusion list in qa/check-axe.mjs had to be
  // kept in sync by hand). Written once per real (non-dev, non-check)
  // build, so it is never stale and nothing needs bumping when a page
  // is added. Skipped in dev and in `check` mode: this is a raw
  // fs.writeFileSync, not a kiss API call, so it is not staging-aware —
  // writing it during `check` (report.mode === 'check') would leave a
  // file behind in the real build folder despite check's "nothing is
  // written" guarantee.
  const report = this.report()
  if (!this.config.dev && report.mode !== 'check') {
    const pages = (report.pages || [])
      .filter((p) => p.ok)
      .map((p) => utils.posixPath(path.relative(report.buildDir, p.buildTo)))
    fs.writeFileSync(
      path.join(report.buildDir, '.qa-pages.json'),
      JSON.stringify(pages, null, 2),
    )
  }
}

/** Name every failed page, then make the build exit non-zero. */
export function onBuildFailure(err) {
  for (const failure of err.failures ?? [])
    console.error(
      `${failure.view} | ${failure.buildTo} | ${failure.error.message}`.red,
    )
  process.exitCode = 1
}
