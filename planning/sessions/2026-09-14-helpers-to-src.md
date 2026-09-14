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
