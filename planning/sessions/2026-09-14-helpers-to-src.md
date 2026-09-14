---
branch: claude/handlebar-helpers-nbc-qzoyh5
base: master
status: closed
opened: 2026-09-14
closed: 2026-09-14
---

# Session — 2026-09-14: Move the Handlebars helpers out of `generate.js` into `src/helpers/`

## Intent

**Objective:** `generate.js` had grown to 570 lines, of which 310 (54%) were
Handlebars helpers and the data they close over. Move them into `src/helpers/`
so the build script reads as what it is — a router — and so the helper layer
sits beside `src/models/`, `src/controllers/`, `src/pages/` under a name other
developers already know from Rails, Ember and Express.

**Success criteria:**

- [x] Every custom helper lives under `src/helpers/`, grouped by what kind of
      thing it is, each module exporting `register*Helpers(kiss)`.
- [x] `generate.js` is config → `registerHelpers(kiss)` → route table →
      build report, and nothing else.
- [x] The built site is **byte-identical** to the pre-refactor build.
- [x] `qa:pages`, `qa:no-bootstrap`, `qa:seo`, `qa:axe`/`qa:axe:check` pass.

**Non-goals / out of scope:**

- Moving `SECTIONS`/`LOCATIONS` into a `src/config/`. They are data rather
  than helpers and there is a case for it — `SECTIONS`' labels are already
  duplicated in `navbar.hbs` — but bundling it here would have cost the
  byte-identical-output guarantee that made this refactor verifiable.
- Any change to controllers. Touching one changes its hash and obliges a
  restamp of its AIKB note; this branch deliberately left them alone.

## What moved

| New module | Helpers | Kind |
| --- | --- | --- |
| `src/helpers/format.js` | `eq`, `imageVariant`, `heroImage` | pure transformations |
| `src/helpers/schema.js` | `localBusiness`, `faqPage`, `serviceSchema`, `personSchema`, `breadcrumbList` | schema.org JSON-LD |
| `src/helpers/navigation.js` | `breadcrumb` | derived from the page being rendered |
| `src/helpers/courses.js` | `courseLadder` | derived from the course models |
| `src/helpers/link.js` | — | `makeLinkTo(kiss)`, shared by the two above |
| `src/helpers/index.js` | — | composes the four into `registerHelpers(kiss)` |

`generate.js`: 570 → 263 lines.

Three things changed rather than merely moved:

1. **`linkTo` became `makeLinkTo(kiss)`** (`src/helpers/link.js`). Two modules
   need it, and a factory keeps the invariant the original comment states: the
   binding may be built at registration, the `linkTo` it returns may only be
   called at render time, once `.page()`/`.pages()` have filled the registry.
2. **The course-model folder is resolved from `import.meta.url`** rather than
   the cwd-relative `'./src/models/courses'`. The old path worked only because
   `generate.js` sat at the repo root and npm scripts run from there.
3. **`kiss.remarkable.set({ breaks: false })` + `kiss.registerPartials()` were
   deleted**, and the intent moved into the constructor as
   `markdown: { breaks: false }`. `breaks: false` is kiss 2.2.1's own default
   (`lib/config.js:165`, where the engine documents it as deliberate), so the
   pair was a no-op — and it was the one place where source order in
   `generate.js` was load-bearing.

`src/styles/site.css` gained `@source '../helpers'`. No helper emits a class
name today, but the glob list is explicit and `generate.js` was already listed
defensively; the replacement should be too.

## Verification

The refactor's own test is that the site does not move:

- **114 of 115 built files byte-identical** (sha256, whole-tree) to the build
  taken immediately before the first edit. The 115th is `sitemap.xml`, whose
  only diff is 36 `<lastmod>` build timestamps.
- `qa:pages` 20 pages · `qa:no-bootstrap` clean · `qa:seo` 0 failed 0 warned ·
  `qa:axe:check` 0 violations across 20 pages · `Links: 555 internal
  references, none broken`.

Two gates report failures that are **pre-existing on `master`**, confirmed by
stashing this branch and re-running each on a clean tree:

- `npm run check` reports all 20 pages `~` / `= 0 unchanged`. The clean tree
  does the same: `AIKB/last-build.json` is stale relative to `master`.
- `npm run qa:compare` fails (`/faqs/` extra, `/googleab62e0ee5f306664`
  missing, text-similarity issues on 9 pages). The clean tree produces the
  identical table. Diffing the two `content.json` snapshots shows only the
  `generated` timestamp and JSON key *ordering* in the resource-size maps —
  same keys, same byte values, no text, link, heading or form differences.

**`AIKB/` was deliberately not re-recorded at close.** The baseline was
already stale before this branch opened; re-recording here would silently
absorb that drift into a refactor whose whole claim is that nothing changed.
Re-record it, and refresh `qa/baseline/`, as its own piece of work against
master.

## Amendments (same branch, after the criteria above were met)

The branch went on past its original objective at the user's direction. Each
landed as its own commit, each verified the same way — the built site must not
move.

**1. `generate.js` → `router.js`.** `git mv` plus every reference. The one that
was load-bearing rather than prose: `scripts/optimise-images.mjs` reads the
file by name (`ROUTER_JS`, six use sites) to discover image references, so a
docs-only find-and-replace would have quietly broken the image pipeline. The
four `AIKB/notes/*.md` cite it in backticks, which the knowledge base's
dangling-reference check resolves against the tree, so they were updated too.
`planning/` was left alone — those are dated records of what was true then.

**2. Tailwind was compiling class names out of the repo's prose.** Found while
doing the rename, and it starts with this branch: the word "invisible", written
in a sentence added to `CLAUDE.md` in the first commit, emitted a real
`.invisible` rule into `site.css`, changed its content hash, and so changed the
`<link href>` on all 20 pages. The first commit's "byte-identical" claim was
therefore wrong — the build was verified, then `CLAUDE.md` was written, then it
was committed without re-verifying.

The cause was bigger than the typo. `src/styles/site.css` listed explicit
`@source` globs under a comment claiming they replaced Tailwind's automatic
detection. They do not: `@source` only *adds* to the automatic walk of the repo
root, so `CLAUDE.md`, `README.md`, `planning/` and `AIKB/` were all class-name
sources for the production stylesheet. `.container`, `.fixed`, `.outline` and
`.resize` had been riding along the same way, predating this branch.
`@import 'tailwindcss' source(none)` makes the globs authoritative. Four dead
rules left the stylesheet and nothing else did; none of the four is used as a
class on any element in the built output.

**3. Content-bearing page models → `src/models/`.** The consultations index,
courses index and contact page carried their model inline as a JS object.
Each is now a `.json` file at the top of `src/models` — *not* inside the
matching fan-out folders, where it would build a spurious extra page. Besides
consistency this removes the object-model footgun kiss documents: a plain
object model is replayed from a shallow snapshot, so one a controller mutates
in place stays mutated on the next rebuild. The three `{ noHero: true }` models
stay inline; it is a layout flag, not page data.

**4. Post-build callbacks → `scripts/build-report.mjs`.** The success log, the
`.qa-pages.json` the QA harness reads, and the non-zero exit on failure are
build plumbing, not routing. `onBuildComplete` stays a `function` rather than
an arrow because kiss calls it as `callback.call(this)`. Verified past the
happy path, since two of its three behaviours never appear in a passing build:
`npm run check` still does not write `.qa-pages.json` into the real build
folder, and a build pointed at a missing view still exits 1.

**5. Business facts → `src/config/business.js`.** The phone number was written
out in seven templates and again in the JSON-LD; the social URLs in the footer
and again in the JSON-LD; the trading name twice inside `schema.js`. One module
now holds them, spread into `new Kiss()` as an arbitrary config key so
templates read `{{config.business.*}}` and helpers read `kiss.config.business`.
Proved by temporarily changing the number and the Facebook URL in that one
file: the rebuild moved 32 `tel:` hrefs, 29 visible phone strings, 20 JSON-LD
telephone entries, 43 Facebook hrefs and 40 JSON-LD `sameAs` entries, and left
zero copies of the old values in `docs/`.

`router.js` across the whole branch: **570 → 208 lines.**

Still outstanding, and still deliberately not done here: `AIKB/` is not
re-recorded and `qa/baseline/` is not refreshed. Both were already stale on
master before this branch opened, which is why `npm run check` reports all 20
pages `~` and `npm run qa:compare` fails on a clean tree as well as on this
one. `SECTIONS` also remains duplicated between `src/helpers/navigation.js` and
the hand-written markup in `navbar.hbs`.

## Close

**6. The 2026-09-13 CSS-hash drift is solved, guarded and written down.** That
session closed the drift as unexplained, blaming untracked `node_modules`. The
cause was the Tailwind prose-scanning bug in amendment 2: `.container`,
`.fixed`, `.outline` and `.resize` were in the shipped stylesheet with none of
the four used as a class anywhere on the site, and because the stylesheet is
content-hashed, a word typed into any markdown file renamed it and moved every
page's hash. The 09-13 log is self-evidencing — it uses "fixed" on five lines
and "resize" on one, so writing up the drift moved the hash again.

`AIKB/site.md` now exists (it never had, despite `AIKB/README.md` specifying
it) and carries the finding under Standing gotchas, plus two Retired feedback
entries. `qa/css-source-guard.mjs` fails the build if `source(none)` goes
missing or an `@source` path stops resolving; it runs first in `npm run qa`,
before the build is paid for, and was verified against both failure modes.

`AIKB/` re-recorded at close, deferred twice earlier on this branch for a
reason that no longer holds. `npm run check` now reports `= 20 unchanged`, with
no missing, dead, stale or dangling notes, and a second identical record leaves
the tree clean.

**Still open, deliberately:** `qa/baseline/content.json` is stale relative to
master, so `npm run qa:compare` fails on this branch and on a clean master
alike; the convention is to refresh it from a master build, so it is a
post-merge task. `SECTIONS` remains duplicated between
`src/helpers/navigation.js` and the hand-written markup in `navbar.hbs`.
Feedback for kiss-ssg was drafted separately and is not committed here, since
it targets another repository.
