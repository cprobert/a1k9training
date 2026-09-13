---
branch: content/ad-hoc-edits
base: master
status: open
opened: 2026-09-13
---

# Session — 2026-09-13: Ad hoc site edits, plus the AIKB CSS-hash drift found at open

## Intent (captured at kiss-branch-open)

**Objective:** Apply a series of small, ad hoc edits to the site that Gaynor
is requesting through this session as they come up (no fixed list at open —
they will be posted incrementally). Alongside that, close out the CSS-hash
drift discovered while opening this branch: every page's build hash differs
from the AIKB baseline recorded at the last close (`af57869`) even though no
source file changed and the toolchain is deterministic — document the finding
and re-record `AIKB/` once the current build is confirmed correct.

**Success criteria:**

- [ ] Each ad hoc edit Gaynor requests is applied to the named page(s) and
      logged as a dated Amendment below (what changed, which page(s)).
- [ ] After each edit, `npx kiss-ssg check --summary generate.js` stays `ok`,
      0 failed, no new `broken link:` line, no new `note …:` line.
- [ ] Eyeball: each changed page is looked at rendered, not just diffed —
      inherited feedback from the last session.
- [ ] The CSS-hash drift is written up in this file's Pulse log with the
      evidence chain (Tailwind CLI deterministic 3/3, source unchanged
      `af57869..HEAD`, current hash `75eecd87` matches an independent MD5 of
      a direct `@tailwindcss/cli` run, baseline was `8fdcf48c`) and the
      conclusion (untracked `node_modules` state at record time is the only
      unaccounted variable — not recoverable after the fact).
- [ ] `AIKB/` is re-recorded once the ad hoc edits are done, so
      `npx kiss-ssg check --summary generate.js` returns to reporting
      `= 19 unchanged` (or however many pages exist by then) for anything
      this branch did not touch.

**Non-goals / out of scope:**

- No CLAUDE.md or workflow change for the CSS-hash drift — decided at open:
  document and re-record only, no standing-gotcha note, no `npm ci` migration.
- No redesign, no new page/section, no controller refactor — this is small
  content-level edits unless Gaynor's requests say otherwise.
- Not fixing the CRLF/LF churn (inherited non-goal from the 2026-09-12 session).
- Not bisecting further into which npm package actually drifted at record
  time — accepted as unrecoverable given `node_modules` isn't versioned.

**Impact surface:** content — Gaynor's edits are expected to be page copy,
data and small visual tweaks. May extend into **templates & partials** if a
request needs a markup change, and touches **assets & deploy** for the AIKB
re-record at close. Scope will be confirmed per-request as they arrive.

**Expected shape:** emergent — no request list exists at open; each edit
arrives ad hoc through the conversation and is recorded as it lands.

**Inherited feedback:** from the 2026-09-12 session (first time surfaced,
none yet recurring across sessions):

- Refresh `qa/baseline/content.json` in the same PR that changes copy/URLs.
- Don't stage or edit in the working tree the agent is committing from.
- Look at one rendered page per slice when a criterion says eyeball.
- State a predicted diff in pages, derived from `AIKB/site-map.md`'s
  partial → pages table, before making the change.
- Say plainly what has and hasn't been built yet after a plan-only step.
- Backtick only full repository paths in AIKB notes.
- Write multi-file prose with the Write tool, not shell heredocs.

**Inherited at open:**

- All 19 pages report `~` (changed) against `AIKB/last-build.json` even
  though the tree is clean and HEAD is exactly the commit (`6eb3fad`,
  squash of `af57869`..`6934bfc`) that wrote that record. Traced to the
  Tailwind-compiled CSS content hash (`site.8fdcf48c.css` in the record vs
  `site.75eecd87.css` now); nothing under `src/` or `generate.js` differs
  between the record commit `af57869` and `HEAD` (`git diff af57869 HEAD`
  touches only `package-lock.json`, `planning/sessions/…`,
  `qa/baseline/content.json`, `qa/snapshot.mjs`); three direct
  `@tailwindcss/cli` runs just now produced byte-identical output
  (`75eecd87`, matching `check`'s current hash exactly). This is inherited
  drift from the last branch, not caused by this one — carried as a
  criterion above rather than left silent.
- No `note missing/dead/stale/dangling` findings at open.
- No abandoned open sessions on other branches.

### Amendments

<!-- Dated notes where the remit legitimately expanded mid-branch. Good drift is
     recorded here and stays on this branch; a new branch is the operator's call. -->

- **2026-09-13, edit 1 — course pricing and next-start dates.** Gaynor sent
  the next course schedule and prices via the operator. Brainstormed as
  "bounded" (new data fields on an existing model/view pattern, not a new
  subsystem) before any code changed; two factual ambiguities in Gaynor's
  message (a schedule clash, and what "the six one hour long course" price
  covered) were resolved with the operator before publishing, not assumed.
  Decided: price + a hand-edited `nextStart` display string on each course
  model (`price`, `priceNote`, `nextStart`), rendered under the `<h1>` in
  `src/pages/courses/course.hbs`, guarded by `{{#if model.price}}`; no
  change to the `/courses/` index (no summary table), no change to
  One-to-one (stays enquiry-only). The A1K9 Group / personal-protection-dogs
  note the operator also raised was explicitly declined — "we don't want to
  promote protection work on this site" — so nothing was added anywhere for
  that.
  - `src/models/courses/gold-obedience.json`: price £129.99 (+£10 on the
    operator's instruction), next start Sat 10 Oct 1:00pm.
  - `src/models/courses/silver-obedience.json`: price £129.99 (+£10), next
    start Sat 10 Oct 2:00pm.
  - `src/models/courses/bronze-obedience.json`: price £119.99, next start
    Sun 11 Oct 1:00pm.
  - `src/models/courses/junior-obedience.json`: price £119.99, next start
    Sun 11 Oct 2:00pm.
  - `src/models/courses/puppy-socialisation.json`: price £59.99, next start
    Sun 11 Oct 3:00pm (6 classes, 30 minutes each, not the 6-week/1-hour
    format the other five use).
  - `src/models/courses/platinum-obedience.json`: price £129.99 (+£10), no
    `nextStart` — not in this batch of dates.
  - `src/pages/courses/course.hbs`: the price/next-start block.
  - Verified: `npx kiss-ssg check --summary generate.js` — `ok`, 19 pages,
    0 failed, 513 internal references none broken. Built the real site
    (`npm run build`) and eyeballed the rendered HTML for gold-obedience
    (price + note + next start all present), puppy-socialisation (same,
    with its own note text), platinum-obedience (price + note, correctly
    *no* next-start line), and one-to-one (correctly no price block at all).
  - Open: Junior/Bronze/Silver/Gold/Platinum's FAQ files still have the
    stale venue text and the deposit/business-name inconsistencies flagged
    earlier this session — not touched here, still waiting on Gaynor's
    answers to those three questions.

- **2026-09-13, edit 2 — apply the approved FAQ recommendations.** The
  operator approved the earlier FAQ recommendations ("remove covid, etc.").
  Before editing, resolved two of the three previously-open questions
  without needing to ask Gaynor, by reading the site's own sources of truth
  rather than guessing:
  - **Business name — not actually inconsistent, no fix needed.**
    `generate.js`'s LocalBusiness JSON-LD and `og:site_name` confirm
    "A1K9 Behaviour and Training Academy" is the business name and
    "A1K9 Training Grounds" is one of its two *venues* (the other being
    Llys Nini) — two different things, not a naming conflict.
  - **Venue text in `gold.json`/`platinum.json`/`silver.json` — updated.**
    Their "Where are the courses held?" and rain-day answers said "just
    outside Pontardulais" / "the training barn" — stale versus the current,
    three-way-corroborated wording in `courses.json`, `contact.hbs` and
    `footer.hbs` (two venues: A1K9 Training Grounds, and Llys Nini Animal
    Centre (RSPCA), Penllergaer, for indoor sessions). All three files'
    two answers rewritten to match `courses.json`'s wording exactly.
    Cosmetic: also trimmed trailing-space typos in two `q` strings
    (`gold.json`, `silver.json`) while in these files.
  - **`puppy.json` — Covid-19 line removed**, as asked. Rewritten to keep
    the substantive answer (booking is required) without the dead
    justification or a new claim about walk-ins, since the operator had
    not confirmed whether walk-ins are now allowed — deliberately the
    smallest edit that satisfies "remove covid" without inventing a policy.
  - **New finding, not fixed — flagged instead.** `About > Facilities`
    (`src/partials/about/facilities/facilities.hbs`) still describes an
    on-site "large training barn" (with its own photo) as the wet-weather
    fallback, contradicting the three sources above that all say sessions
    move to Llys Nini. Left alone — outside the FAQ files, and resolving
    it would mean guessing whether the on-site barn is still real.
  - Verified: `npx kiss-ssg check --summary generate.js` — `ok`, 19 pages,
    0 failed, 513 internal references none broken. Built the real site and
    read back the rendered FAQ text on puppy-socialisation, gold-obedience
    and silver-obedience to confirm the new wording renders as written.

- **2026-09-13, edit 3 — deposit policy, confirmed by the operator.** "All
  courses require a £50 deposit except for the puppy class" — so the
  deposit-policy question from edit 2 is resolved, not an oversight.
  `gold.json`, `platinum.json` and `silver.json`'s "Do we have to pay in
  advance…?" answers ("You pay for the course on the first week…", no
  deposit mentioned) rewritten to match `courses.json`'s wording ("A £50
  deposit by bank transfer secures your place. Any remaining balance is
  paid on the first week when you arrive."). Junior and Bronze have no own
  FAQ file — they're only covered by `courses.json`'s shared FAQ, which
  already stated this correctly, so nothing to change there. Verified:
  `npx kiss-ssg check --summary generate.js` — `ok`, 19 pages, 0 failed.

- **2026-09-13, edit 4 — the About > Facilities "training barn" finding,
  confirmed and fixed.** The operator confirmed: A1K9 Training no longer
  uses the on-site barn for wet-weather classes (the operator noted why —
  not published, per the standing "don't promote protection work on this
  site" decision from earlier — only the resulting fact is reflected on
  the page); wet-weather sessions go to Llys Nini, matching what
  `contact.hbs`/`footer.hbs`/`courses.json` already said.
  `src/partials/about/facilities/facilities.hbs`'s "Indoor Training" card
  rewritten to "Wet-Weather Sessions", reusing the existing
  `llys-nini-cafe-exterior-v1.webp` asset (already on `contact.hbs`, real
  dimensions 900×675 per `qa/images.json`) rather than the now-inaccurate
  barn photo. The old barn photo
  (`src/assets/images/about/facilities/indoor-training-v1.webp`) is no
  longer referenced anywhere in `src/` — left in place, not deleted (image
  lifecycle/cleanup wasn't asked for). Verified: `npx kiss-ssg check
  --summary generate.js` — `ok`, 19 pages, 0 failed, 513 links none broken;
  built the real site and read back the rendered card heading.

- **2026-09-13, edit 5 — external links open in a new tab with an icon.**
  Operator asked that every link to an external site open in a new tab with
  an appropriate `rel` and a small icon hooked on that `rel`. Surveyed the
  whole site first (`grep` across `src/pages`, `src/layouts`, `src/partials`,
  including `.md` partials for markdown-syntax links) rather than editing
  page by page — found every external link was already raw HTML with
  `target="_blank"`/`_new`/`fb` and `rel="noopener"`, no markdown-authored
  external links existed at all, so no Remarkable renderer changes were
  needed. Standardised all ~30 across four files (`contact.hbs`,
  `index.hbs`, `associations.hbs`, `vet-referrals.hbs`) to
  `target="_blank" rel="noopener external"` — the non-standard `target="_new"`
  (Google Maps) and `target="fb"` (Facebook) both silently reused a single
  named browsing context across every click, so every click after the first
  landed in the same stale tab; `_blank` fixes that as a side effect.
  Kept `noopener` without adding `noreferrer`, since these are Gaynor's own
  outbound links to her accreditation bodies and Facebook, who may value
  seeing that the traffic came from her site.
  Added one CSS rule to `src/styles/site.css`'s `@layer components`:
  `a[rel~='external']:not(:has(img))::after` with a `mask-image` (Heroicons'
  "arrow-top-right-on-square", MIT-licensed) on `background-color: currentColor`,
  so the glyph always matches the link's own colour rather than needing a
  colour per context. The `:not(:has(img))` exclusion is deliberate: an
  image-wrapped link (a logo, the Facebook icon) would otherwise get the mark
  floating stray on its own line beneath the full-width image.
  Verified: `npx kiss-ssg check --summary generate.js` — `ok`, 19 pages,
  0 failed; `node qa/no-bootstrap.mjs docs` — clean. Screenshotted the built
  home page in a real browser (Chrome via claude-in-chrome) — icon shows on
  the "Gaynor is…" text links, the "Website" buttons and "Open Page »", and
  is correctly absent on every internal link and the image-wrapped logo/
  Facebook-icon links.

## Pulse log

<!-- Appended by kiss-branch-pulse, one dated line per checkpoint: criteria status,
     the evidence, and the decision. Append-only — the Intent above is immutable,
     and the criteria are ticked only at close. -->

---

<!-- kiss-branch-close writes the reflection below and flips status: closed -->
