# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The site of Gaynor Probert, a dog behaviourist and trainer in South Wales
(`a1k9training.co.uk`). A static site built with
[kiss-ssg](https://www.npmjs.com/package/kiss-ssg) (Handlebars views +
Markdown partials, MVC-style: page → model → controller) and styled with
Tailwind CSS v4. It was migrated off Bootstrap 3 in place (PR #9, September
2026); `planning/sessions/` holds one record per piece of work, the completed
migration plan included, and `qa/` exists specifically to gate that migration
against regressions (see below).

**kiss-ssg API reference:**

@node_modules/kiss-ssg/llms.txt

The file above is imported automatically into context on every session —
it's the package's own cheat sheet for `.page()`/`.pages()`/`.generate()`/
`.watch()`, config, and every built-in Handlebars helper. Consult it before
making non-trivial `router.js` changes. Deeper per-topic notes live
alongside it in `node_modules/kiss-ssg/AIKB/`.

## Commands

```bash
npm run build            # production build: Tailwind compiles, then kiss-ssg generates docs/
npm run check             # dry-run the build via `kiss-ssg check`; prints a report, writes nothing
npm run dev                # kiss dev server with live reload; Tailwind keeps recompiling in the background
npm run images:optimise   # resize/convert a newly added source image to WebP (idempotent)
```

`npm run build` is the exact command Netlify runs on push; publish directory
is `docs/` (gitignored — never edit it by hand, it's emptied on every
build). Tailwind is not a separate build step: `router.js` declares it as
a kiss asset-pipeline step (`config.assets.pipeline`), so it runs before
kiss copies/hashes assets, under `build`, `check` and `dev` alike. Edit
`src/styles/site.css`; never `src/assets/css/site.css` (generated,
gitignored).

There is no lint script and no eslint/prettier config in the repo. The only
tests are `npm run qa:test` (`node --test qa/*.test.mjs`) — unit tests for
the pure helpers in the QA harness, not for the site, which is verified by
building and inspecting the output as below. The committed JS is nonetheless Prettier-formatted with
`--no-semi --single-quote` (verify with
`npx prettier@3 --no-semi --single-quote --check router.js 'src/**/*.js'`) —
with two files that predate the convention and still fail it:
`src/assets/js/site.js` and `src/controllers/faqLib.js`. Format what you
touch; reformatting `site.js` changes a hashed asset and so every page.
Correctness is verified by building (`npm run build`), serving `docs/`
(`npm run qa:serve -- docs <port>`), and checking the rendered page —
plus the QA harness below for anything beyond a one-off visual check.

### QA harness (`qa/`)

Playwright + Lighthouse + axe-core, driven by plain Node ESM scripts — full
detail in `qa/README.md`. Everything here inspects an **already-built**
directory (`docs/`, or `qa/.baseline-site`, a frozen build of the last merged master); the
harness itself never builds the site.

```bash
npm run qa                # build, then every gate: page count, no-Bootstrap, SEO, snapshot, compare, axe
npm run qa:lh              # Lighthouse mobile, median of 3 runs per page (slow)
npm run qa:serve -- docs 8123   # serve a built dir locally with Netlify's pretty-URL rules
npm run qa:preview -- <url>     # verify a DEPLOYED site: real headers, redirect-free URLs, _redirects rules, llms.txt, schema, Playwright
```

After opening a PR, run `/pr-verify` (`.claude/skills/pr-verify/SKILL.md`): it
finds the Netlify deploy preview and runs `qa:preview` against it.
`.github/workflows/preview-qa.yml` does the same automatically as the
`Preview QA` check, on every PR push.

**Netlify reports here as check runs, never as commit statuses or GitHub
deployments.** `commits/<sha>/status` is always empty on this repo, so the
preview URL comes from the `details_url` on one of Netlify's three check
runs (`Header rules - a1k9-training` and friends) — that is where the site
slug lives. The `Preview QA` workflow went unrun for months because it
triggered on `deployment_status`, an event nothing here ever emits.

- `qa/snapshot.mjs` + `qa/compare.mjs` gate against `qa/baseline/content.json`
  (a snapshot of the last merged master build; refresh it by building master
  into `qa/.baseline-site` and running `npm run qa:baseline` whenever copy
  changes land on master) on: lost text, lost internal links, form-field
  diffs, console errors, failed requests, horizontal overflow at 375px.
  `qa/baseline/pre-migration/` keeps the original Bootstrap-site records.
- `qa/no-bootstrap.mjs` fails if any Bootstrap 3 class/idiom shows up in the
  built output — the guard against regressing the migration.
- `qa/preview.mjs` checks `FAQPage` JSON-LD **both ways**: required on
  `/faqs/`, forbidden on the pages that render the inline FAQ accordion. The
  markup is centralised on that one URL by design; only the markup, though —
  the human-readable Q&A blocks elsewhere stay, and are not an SEO liability.
  It also checks that every question and answer in that JSON-LD is actually
  visible on the page (`qa/faq-parity.mjs`, unit-tested by `qa:test`), since
  markup describing content the page does not show is the one defect a human
  review cannot see.
- `qa/axe.mjs` scans every page at 375/1440px; group violations by impact.
  It does **not** catch non-text contrast (e.g. a `:focus-visible` ring) —
  that needs a manual WCAG ratio check against the actual token values in
  `@theme`. It gates on **first-party markup only**: axe is injected into
  every frame, so the site's three third-party embeds (a YouTube player, two
  Google Maps) would otherwise report their vendors' bugs as ours. Those
  findings are sorted into `thirdParty` in the report and printed, not
  gated. They also only appear where the browser has direct outbound
  access, so a clean local run is not evidence CI will be clean — see
  `qa/README.md`.
- All of the above expect a Chromium executable; on Windows, Playwright's
  own downloaded browser needs to be pointed at explicitly, e.g.
  `CHROME_PATH=".../ms-playwright/chromium-<rev>/chrome-win64/chrome.exe"`
  (the scripts default to a Linux CI path).

### Knowledge base and session loop (`AIKB/`, `planning/sessions/`)

### Where the kiss-memory skills come from

`.claude/skills/kiss-branch-open`, `-pulse`, `-close`, `kiss-site-brief` and
`kiss-memory-consolidate` are a **vendored copy** of the `kiss-memory` plugin at
version 2.2.1, committed here rather than installed.

`.claude/settings.json` already declares the plugin properly (`enabledPlugins`
plus the `cprobert/kiss-ssg` marketplace) and that is the right config — but a
cloud session never fetches a GitHub marketplace, so in Claude Code on the web
the plugin silently is not there while project `.claude/skills/` loads fine.
Vendoring is what makes the loop work in every session rather than only local
ones. Leave the plugin config in place: where plugins *do* load, it is the
better source.

The cost is that these five are pinned and no longer track the marketplace. To
re-sync after the plugin changes upstream:

```bash
git clone --depth 1 https://github.com/cprobert/kiss-ssg /tmp/kiss-ssg
cp -r /tmp/kiss-ssg/plugins/kiss-memory/skills/kiss-* .claude/skills/
```

Copy only the `kiss-*` directories — `.claude/skills/pr-verify/` is this
repository's own and is not part of the plugin.

`AIKB/` is kiss's recorded map of the site (`site-map.md` lists every page,
its id, view, model, controller and the partials it rendered) plus authored
notes under `AIKB/notes/` for each controller and pipeline step, stamped with
the subject's hash. It is committed source, written only by
`npx kiss-ssg aikb router.js`, and `npm run check` diffs every build
against `AIKB/last-build.json` and reports notes that are missing, stale,
dead or dangling. A piece of work on the site runs through the kiss-memory
plugin's loop: `kiss-branch-open` writes the intent to
`planning/sessions/<date>-<slug>.md` and creates the branch,
`kiss-branch-pulse` logs a checkpoint against the check diff after each
slice, and `kiss-branch-close` verifies the criteria, re-records `AIKB/`
and closes the file. Never re-record mid-branch: it moves the baseline and
empties the diff. Changing a controller obliges restamping its note.

## Architecture

### Page pipeline: `router.js` → model → controller → view

Every route is registered in `router.js` via kiss-ssg's `.page()` (one
page) or `.pages()` (fan out one page per item in an array/folder model).
For a fan-out page, e.g. `/courses/*`:

```
router.js:  .pages({ view: 'courses/course.hbs', model: 'courses', controller: 'course.js', path: 'courses' })
src/models/courses/bronze-obedience.json   → data for one page (slug, title, description, image, components: {...})
src/controllers/course.js                    → reshapes the model into { slug, title, description, model }
src/pages/courses/course.hbs                → the Handlebars view, extends a layout, renders model.components.*
```

A model's `components` object is a map of names → partial paths (e.g.
`"intro": "courses/bronze/intro"`), resolved by the view via
`{{> (lookup model.components 'intro')}}`. Controllers should return new
values rather than mutate the model in place — an object-model mutation
persists across dev-server rebuilds (see the imported cheat sheet for why).

`src/controllers/faqMapper.js`/`metaMapper.js` are small reusable
controllers; `about.js`/`course.js`/`behavioural-consultations.js` are
per-section.

`router.js` is only the router: config, one `registerHelpers(kiss)` call,
the `.page()`/`.pages()` table, then `.generate()`/`.sitemap()`/`.llms()` and
the build report. Nothing else belongs in it.

### Handlebars helpers (`src/helpers/`)

Every custom helper, one module per kind, each exporting a
`register*Helpers(kiss)` that `src/helpers/index.js` composes into the single
`registerHelpers(kiss)` that `router.js` calls:

| Module | Helpers | What kind of thing it is |
| --- | --- | --- |
| `format.js` | `eq`, `imageVariant`, `heroImage` | pure transformations; arguments in, string out |
| `schema.js` | `localBusiness`, `faqPage`, `serviceSchema`, `personSchema`, `breadcrumbList` | schema.org JSON-LD, serialised by `{{{stringify ...}}}` |
| `navigation.js` | `breadcrumb` | derives the trail from the page being rendered |
| `courses.js` | `courseLadder` | reads `src/models/courses/*.json` to build the progression |
| `link.js` | — | `makeLinkTo(kiss)`, shared by the two above |

Register on `kiss.handlebars`, never the global `handlebars` module: kiss
gives each instance its own `Handlebars.create()`, so a globally registered
helper is invisible to these templates. **`registerHelpers(kiss)` must stay
immediately after `new Kiss()`** — partials are compiled at construction, and
a helper registered later is not there when they render.

A helper that resolves a link must do so at *render* time: the page registry
it reads is filled by the `.page()`/`.pages()` calls, so `makeLinkTo(kiss)`
may run at registration but the `linkTo` it returns may not. This is why
`courses.js` builds its ladder steps without a `url` and adds one per step
inside the helper.

Helper files are not AIKB subjects (only controllers, URL models and pipeline
steps are), so adding one obliges no note. Do add the folder to the `@source`
list in `src/styles/site.css` if a helper ever emits a class name.

### Site facts (`src/config/`)

`src/config/business.js` holds the business's own facts — name, phone (E.164
plus the display form), the three social URLs, and the two venues as
schema.org `Place` records. `router.js` spreads it into `new Kiss()` as an
arbitrary config key, which is what puts it on **both** sides of the site:
templates read `{{config.business.telephone}}`, helpers read
`kiss.config.business`. Change a fact here and it reaches the markup and the
JSON-LD together — before this existed the phone number was written out in
seven templates and again in `src/helpers/schema.js`.

Page *data* still belongs in `src/models/`; this is for facts the shell and
the structured data share. Note `SECTIONS` in `src/helpers/navigation.js` is
**not** here yet: `navbar.hbs` still carries its own copy of those labels in
hand-written markup (see the comment on `SECTIONS`), so renaming a section
means editing both.

### Templates: layouts, pages, partials

- `src/layouts/layout.hbs` — the general-purpose layout: a model-driven
  photo hero (`model.image`, `model.caption` left/right, optional
  `model.captionOffset`) with a `{{#block "intro"}}` caption box, then
  `{{#block "main"}}`.
- `src/layouts/layout-video.hbs` — home page only: the same hero shape but
  with a muted, lazy-loaded YouTube background (`data-video-id`, driven by
  `src/assets/js/site.js`).
- Both layouts style every element inside the hero caption box with
  arbitrary-variant selectors, e.g. `[&_p]:mb-6`, `[&_a:not(.btn):not(.crumb)]:text-accent-300`.
  **A descendant selector like `[&_a]:...` beats a single class like
  `.btn-secondary` on specificity** — any `.btn` or breadcrumb link placed
  inside hero content needs the matching `:not()` exclusion already applied
  to `a`/similar rules, or it silently inherits the wrong color/underline.
  This has bitten real pages before; check for it when adding markup inside
  a hero block, and keep the two layouts' rules identical.
- `src/pages/*.hbs` extend a layout (`{{#extend "layout"}}`) and fill its
  named blocks (`{{#content "intro"}}` / `{{#content "main"}}`).
- `src/partials/` holds `.md` and `.hbs`/`.html` fragments referenced by
  model `components` maps or included directly; `layout/` inside it holds
  the shell (navbar, footer, header `<head>` partial with SEO/JSON-LD).
- Tailwind's preflight zeroes all margins, including `<p>`. A paragraph
  followed by another block (a CTA button, a card) needs an explicit margin
  utility (this repo's convention: `mb-6` on the paragraph, or `mt-8` on the
  wrapper that follows) — nothing restores it by default.
- **Internal links are `{{link "<id>" canonical=true}}`, never a hand-written
  path.** Ids are the view route without its extension (`index`, `contact`,
  `courses/index`, `about/index`) and, for a fan-out item, the registration's
  route plus the record's slug (`{{link "courses/course" slug="bronze-obedience"
  canonical=true}}`, `{{link "about" slug="facilities" canonical=true}}`,
  `{{link "behavioural-consultations/consultation" slug="…" canonical=true}}`);
  `AIKB/site-map.md` lists every id. An id no page claims fails the build.
  `canonical=true` is **mandatory**: this site is not `extensionLess`, so the
  bare helper renders `/courses/bronze-obedience.html`, which Netlify 301s
  back to the slashless form and `qa:preview`'s redirect-free check fails.
  The same rule applies to model data — the about records' `next` carries a
  page `id`, not a URL — and to `src/helpers/link.js`, whose `makeLinkTo()`
  wraps the helper for the breadcrumb and course-ladder helpers.

### Design system (`src/styles/site.css`)

Tailwind v4 entry point. `@import 'tailwindcss' source(none)` turns automatic
detection **off**, so the `@source` globs are the whole of what is scanned for
class names. Keep it that way: `@source` only *adds* to the automatic walk of
the repo root, and with the walk on, every prose file in the project —
`CLAUDE.md`, `README.md`, `planning/`, `AIKB/` — is a class-name source.
Writing the word "invisible" in a sentence emitted `.invisible` into the
stylesheet, changed its content hash and so changed every page that links it;
`.container`, `.fixed`, `.outline` and `.resize` had been riding along the same
way. **A new template location must be added to the glob list** or its classes
will not compile. Design tokens live in `@theme`: a green `brand`
ramp, a warm `sand` ground, a dark-slate `ink` text ramp, and an `accent`
amber reserved for calls to action — every text/background pairing in the
shell is WCAG AA. `:focus-visible` uses a two-layer ring (amber `outline` +
a dark `box-shadow` ring just outside it) specifically so the indicator
clears 3:1 contrast on both the site's light surfaces (white cards) and
dark ones (nav, hero) with one rule — see the comment above it before
changing either color.

`@layer components` holds a deliberately small set of classes —
`.btn`/`.btn-primary`/`.btn-secondary`/`.btn-accent`/`.btn-sm`/`.btn-lg`,
`.card`, `.callout`, `.page-header`, `.figure-left`/`.figure-right`,
`.badge`, `.prose-site` — for the Markdown and raw-HTML partials, which
can't carry a dozen utilities per element. Templates should reach for plain
Tailwind utilities everywhere else. `.prose-site` re-tunes the typography
plugin's default palette to the site's `ink`/`brand` tokens.

### Assets and caching

`src/assets/` is copied verbatim into `docs/` (images, fonts, `js/`,
generated `css/`). `assets: { hash: true }` in `router.js` renames every
emitted `.css`/`.js` with a content hash; templates always reference the
unhashed name through kiss's `{{asset}}` helper
(`href="/{{asset "css/site.css"}}"`) and the manifest resolves it.
`src/assets/_headers` sets long-lived immutable caching for hashed CSS/JS, a
year for images/fonts, and security headers. There is **no hand-written
`_redirects`**: kiss writes `docs/_redirects` at build time from each page's
`aliases` (the pre-2015 paths sit on the course, consultation and about
records in `src/models/`; `/find-us/` on the contact page in `router.js`),
one `<old> <new> 301` line per alias. To keep an old URL alive when a page
moves, add it to that page's `aliases`; `npm run check` reports a page
removed or moved without one.

**Cache busting is by URL, never by header.** CSS and JS bust themselves:
kiss renames them with a content hash on every change, so a changed file is
a new URL. Images and fonts are **not** hashed and are cached for a year, so
a browser that has one will not ask again until it expires — **never
overwrite an image or font in place.** Change the file, bump its version
suffix (`hero-v1.webp` → `hero-v2.webp`, the convention every image already
follows), and update the references; the old file can stay or go. The same
applies to the self-hosted font (`buenard-700-v1.woff2`).

**Adding an image:** drop the original into `src/assets/images/...`, run
`npm run images:optimise`, then reference the `.webp` it writes with the
`width`/`height` it records in `qa/images.json`.

### Deploy

Netlify builds on push (`npm run build`, publish dir `docs/`); it must
install devDependencies (Tailwind's CLI is one) on Node ≥ 22.12.
`kiss-ssg` is on the published `^2.2.1` release. Beyond the asset-pipeline
hook, the trailing-slash canonical fix and `.llms()` (the generated
`llms.txt`) from 2.1, this project relies on three 2.2 features: page
`aliases` (the source of the generated `docs/_redirects`), the `{{link}}`
helper (every internal href), and the recorded knowledge base under `AIKB/`
that `npm run check` diffs against.
