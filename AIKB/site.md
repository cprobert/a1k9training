# A1K9 Training — the site as a whole

The one page to read before changing anything here. The map beside it
(`AIKB/site-map.md`) says what the site *is*; this says why it is that way.

## What this site is and who for

A static marketing site for Gaynor Probert, a dog behaviourist and trainer
working near Swansea in South Wales. Twenty pages: a home page, two service
sections (courses and behavioural consultations) that each fan out from a
folder of records, an About section, a contact page with two venue maps, an
FAQ hub, and the two pages nobody navigates to on purpose (`404`, the
post-form-submit thank-you).

Its readers are dog owners looking for local help, so the things that matter
most are: the phone number being correct and reachable everywhere, the local
SEO and structured data being truthful, and the pages loading fast on a phone
on rural mobile data. That ordering explains most of the decisions below.

It was migrated off Bootstrap 3 in place in September 2026, which is why `qa/`
is unusually thorough for a twenty-page brochure site — it exists to prove the
migration did not lose anything.

## How it is deployed

Netlify builds on every push to master: `npm run build`, publish directory
`docs/`. `docs/` is gitignored and emptied on every build; never edit it.

Three files in the build are generated rather than written: `docs/_redirects`
comes from each page's `aliases` (that is how the pre-2015 URLs stay alive),
`docs/sitemap.xml` and `docs/llms.txt` come from the same page registry. There
is no hand-written redirects file, and adding one would be the wrong fix for a
moved page — put the old path in that page's `aliases` instead.

Tailwind is not a separate build step. `router.js` declares it as a kiss asset
pipeline step, so it runs under `build`, `check` and `dev` alike.

## Conventions

- **`router.js` is only a router.** Config, `registerHelpers(kiss)`, the route
  table, the generated files, the build report. Helpers live in `src/helpers/`,
  page data in `src/models/`, shared business facts in `src/config/business.js`,
  build plumbing in `scripts/build-report.mjs`.
- **One fact, one home.** The phone number, the trading name and the social
  URLs are in `src/config/business.js` and reach both the markup and the
  JSON-LD from there. If you find yourself typing a fact a visitor can read
  *and* a search engine can parse, it belongs in that file.
- **Internal links go through `{{link}}` with `canonical=true`**, never a
  hand-written path. An id no page claims fails the build, which is the point.
- **Never overwrite an image or font in place.** They are cached for a year and
  not content-hashed, so a changed file needs a new name (`-v1` → `-v2`).
- **Verify by building, not by reading the diff.** The build is deterministic:
  a refactor that should change nothing should produce a byte-identical
  `docs/`, and that is a stronger check than any review.

## Standing gotchas

**Tailwind will compile class names out of your prose if you let it.**
`src/styles/site.css` must keep `source(none)` on its `@import 'tailwindcss'`
line. `@source` only *adds* to Tailwind's automatic walk of the repo root, so
without `source(none)` every markdown file in the project is a class-name
source. This was live in the repo for months: `.container`, `.fixed`,
`.outline` and `.resize` were in the shipped stylesheet, generated purely from
words in session notes and documentation — none of the four is used as a class
on any element of the site. (Narrowly: templates *do* use
`focus-visible:outline`, but that is a different selector,
`.focus-visible\:outline:focus-visible`, and it compiles identically before and
after — the focus ring was checked specifically.)

It matters more than four dead rules, because the stylesheet is content-hashed:
a word typed in a markdown file changes the stylesheet's filename, which changes
the `<link href>` on all 20 pages, which changes every page's recorded hash.
That is what made `npm run check` report every page as changed with nothing
unchanged, and it is almost certainly the "CSS-hash drift" that
`planning/sessions/2026-09-13-ad-hoc-edits.md` investigated at length and
closed as unexplained — it blamed untracked `node_modules` state, having
checked that nothing under `src/` had changed. Writing that session log was
itself enough to move the hash: it uses the word "fixed" on five lines and
"resize" on one.

`qa/css-source-guard.mjs` (`npm run qa:css`, and the first step of `npm run
qa`) now fails the build if `source(none)` goes missing, or if any `@source`
path stops resolving — the second being how a folder rename would otherwise
stop templates being scanned in silence.

**A descendant selector beats a single class.** Both layouts style everything
inside the hero caption box with selectors like `[&_a]:…`, which outrank
`.btn-secondary`. Markup added inside a hero needs the matching `:not()`
exclusion or it silently inherits the wrong colour. This has bitten real pages.

**An object model passed inline to `.page()` is replayed from a snapshot**, so
a controller that mutates one in place leaves the dev server drifting further
from a fresh build on every save. Page data belongs in `src/models/` as JSON,
which is re-resolved every build.

**`npm run qa:compare` needs a baseline from master.** It gates against a
snapshot of the last merged master build, so it reports noise until somebody
refreshes it after copy lands. A failure there is not automatically your change.

## Retired feedback

- *"The CSS hash drifts between builds and we cannot explain it — probably
  `node_modules`."* Retired: it was Tailwind scanning prose, above. The
  toolchain was deterministic all along, and the investigation was right that
  nothing under `src/` had changed. It was looking in the wrong tree.

  Attribution was verified by scanning one location at a time against the
  pre-branch copies: `planning/sessions/` alone produces `.container`,
  `.fixed` and `.resize`; `CLAUDE.md` and `README.md` produce `.outline` and
  `.resize`; `scripts/` produces none. What made it hard to catch is that it
  is intermittent by nature — a word only counts if it forms a clean candidate
  token (a trailing full stop is enough to stop it) and only shows up if it is
  not already a compiled utility. The hash moved on some documentation edits
  and not others, with no pattern a reader could see.
- *"An eslint config and a prettier config exist but eslint is not installed."*
  Retired: neither config file is in the repo at all. The committed JS is
  Prettier-formatted with `--no-semi --single-quote`, with two files that
  predate the convention and still fail it.
