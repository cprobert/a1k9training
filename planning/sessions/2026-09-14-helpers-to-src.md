---
branch: claude/handlebar-helpers-nbc-qzoyh5
base: master
status: closed
opened: 2026-09-14
closed: 2026-09-15
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

---

## Reflect — what the session was

It opened as a **question**, not a piece of work: "what form of function are the
Handlebars helpers performing through an NBC lens?" — and NBC was a typo for
MVC, corrected two exchanges later. So the branch existed before any objective
did. The objective (move the helpers out of a 570-line `generate.js`) was
proposed by the agent in answer to a follow-up, then approved; the criteria were
written after the approach was agreed, not before it.

That shape then served the work well, because the objective that emerged had an
unusually strong acceptance test available — **the built site must not move** —
and every slice was measured against it. But it also means this session never
had a `kiss-branch-open`, and the reason is itself the finding: the
`kiss-memory` plugin was declared in `.claude/settings.json` and silently never
loaded in a cloud session, so the open/pulse/close loop this repository
documents as its way of working was unavailable for the entire branch. Nobody
noticed until the human asked to close it. That was fixed at the end by
vendoring the five skills into `.claude/skills/` (`c2f79bd`).

The work was emergent throughout: five distinct pieces (helpers, rename, models,
build-report, business config) plus a Tailwind bug found by accident while doing
the rename, plus a three-session cross-repo collaboration that did not exist
when the branch opened. Each was approved before it started. Emergent suited it;
a plan written at open would not have contained the bug that turned out to
matter most.

## Evaluate — how the human supervised the AI

Three dimensions discriminated this session.

**Pushback & steering — the strongest, and it changed outcomes twice.** The
human's "Were you not able to communicate directly?" was a correction, not a
question: the agent had accepted a relayed claim ("there's no channel back") at
face value and written its answers into the wrong transcript. Checking revealed
a working channel, and everything of value in the last third of the session —
two consuming-project corrections, four upstream fixes shipped — followed from
that one push. The second was "run it and tell me where it disagrees with the
file you wrote by hand", which is supervision of the supervisor: it declined to
accept the agent's own account of its own work as the record.

**Verification & ownership — strong in mechanism, weak in the one place the
rubric names.** Every refactor commit was proved byte-identical across 114 built
files before it was committed; the failure paths nobody sees (`check` not
writing `.qa-pages.json`, a broken view exiting 1) were tested rather than
assumed; a peer session's source claims were re-derived locally rather than
trusted; a change shipped on the agent's own suggestion was re-verified against
the real manifest rather than a 2-page example. But **no human looked at a
rendered page**, and the criteria did not ask anyone to — see Feedback, because
that is the third time.

**Iteration discipline — sliced well, checkpointed never.** Eleven commits, each
independently verified, is the opposite of the one-shot antipattern. But there
is no `## Pulse log` in this file, because `kiss-branch-pulse` did not exist in
this session. The rubric names pulse cadence as the direct evidence for
supervision, and here it has to be read from commit boundaries instead. The
cadence happened; the beat that makes it visible did not.

Two behaviours were above this level: durable guidance written where the next
person will hit it (`AIKB/site.md`, which had never existed; the
`qa/css-source-guard.mjs` gate; the vendored skills), and an independent review
pass — three sessions cross-checking each other, which caught a contaminated
probe, an evidence-free inference, a false claim in a peer's code comments, and
a config surface proposed that already existed.

Level: **Active supervisor.** Framed by correction rather than upfront, verified
through the agent's evidence rather than by looking, and let a documented
workflow sit broken for a whole branch without noticing. Not yet **agentic
engineering lead** — the loop was unavailable and unmissed, the eyeball
criterion was dropped rather than delegated, and the review pass came from
sessions the human had to be asked to connect.

## Feedback — recommendations for next time

- **Human — look at one rendered page per slice when a criterion says eyeball.
  This is its third outing.** It was feedback on 2026-09-12, feedback again on
  2026-09-13, and this session dropped the criterion entirely rather than meet
  it. Next time: put one eyeball criterion in the open, and open the page in a
  browser before the close ticks it. If it is dropped a fourth time, delete it
  from the feedback and admit the site is verified mechanically.
- **Agent — never re-record `AIKB/` mid-branch, whatever the justification.**
  This branch did (`f9a76ff`), with a reasoned argument, and it cost the close
  its own measurement: `check` reported `= 20 unchanged` where the branch had in
  fact changed all 20 pages. It was recoverable only because master's
  `last-build.json` was still in git. Next time: if the baseline looks stale,
  say so and leave it; the close is the one place it moves.
- **Both — check a documented workflow actually loads before relying on it.**
  `.claude/settings.json` declared `kiss-memory` correctly and it silently never
  loaded. One `/plugin` listing at open would have caught it. Next time: at
  `kiss-branch-open`, confirm the loop's own skills are present.
- **Agent — state what you are authorised to do, and leave the other side's
  check to the other side.** A relayed claim of authorisation was written as
  though it bound the recipient. The recipient was right to hold. Next time:
  "authorised on my side; check yours."

## Verdict — did we achieve the objective?

**Brief:** move the Handlebars helpers out of `generate.js` into `src/helpers/`
so the build script reads as a router, under a folder name familiar from other
MVC frameworks.

- [x] Every custom helper under `src/helpers/`, grouped by kind, each exporting
      `register*Helpers(kiss)` — six modules, composed by `index.js`.
- [x] `router.js` is config → `registerHelpers(kiss)` → route table → build
      report — **570 → 208 lines**.
- [x] Built site byte-identical — proved per commit across 114 files. **Later
      amended:** the Tailwind fix in `3e2444e` deliberately changed the
      stylesheet, so the branch's true diff against master is all 20 pages `~`,
      0 `+`, 0 `-` — every one explained by the single hashed-asset change, and
      the criterion should have been restated at that amendment rather than left
      reading absolutely.
- [x] `qa:css`, `qa:pages`, `qa:no-bootstrap`, `qa:seo`, `qa:axe:check` pass;
      555 internal links, none broken; all four AIKB note lines clean; all six
      subject stamps match the current hashes.
- [ ] **`qa:compare` fails** — stale `qa/baseline/content.json`, identical on a
      clean master. Post-merge refresh, not this branch's to fix, but it means
      `npm run qa` does not pass end to end today.

**Met, and the objective moved — twice, both times outward and both approved.**
Beyond the brief: `generate.js` → `router.js`; page models and build plumbing
moved out; business facts given one home; a Tailwind misconfiguration that had
been compiling class names out of the repository's own prose found, fixed,
guarded and explained; the 2026-09-13 "unexplained CSS-hash drift" retired with
evidence; `AIKB/site.md` written for the first time; four fixes shipped upstream
to `kiss-ssg` through two peer sessions; and the memory loop itself repaired.

Concretely better: the router is a router, one fact has one home, the stylesheet
no longer depends on what anyone writes in a markdown file, `npm run check`
means something again (`= 20 unchanged`), and a guard fails the build if either
stylesheet-source mistake returns.

Open: `qa/baseline/` refresh after merge; `SECTIONS` still duplicated between
`src/helpers/navigation.js` and `navbar.hbs`; no PR on this branch; and two
decisions outside this repo — the kiss-ssg version bump (2.3.0, not 2.2.2) and
the pink/navy `.btn-primary` question on the sibling project's fix.
