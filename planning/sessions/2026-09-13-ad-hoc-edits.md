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

- **2026-09-13, edit 6 — Puppy/Junior age ranges, confirmed by Gaynor.** The
  `a1k9training-aa` session flagged the age-range inconsistency; the
  operator relayed Gaynor's answer directly: Puppy is up to 6 months,
  Junior is 6–12 months. The home page (`index.hbs`) already had this
  right, so nothing to fix there. Three places didn't:
  `junior-obedience.json`'s `description` and `junior/intro.md` both said
  "5 to 9 months" — corrected to "6 to 12 months" — and
  `puppy-socialisation.json`'s `nextLead` prompt said "5 months of age or
  over", inconsistent with Junior actually starting at 6 — corrected to
  "6 months". Deliberately left alone: `faqs/puppy.json`'s credit-answer
  (which names "the Bronze course" as where unused Puppy credit goes, when
  the natural next step is Junior) — that file is inside
  `a1k9training-aa`'s declared no-touch scope (`src/models/faqs/*.json`)
  while its Pass 4 drafts are still in progress, so flagging it rather than
  fixing it here to avoid a collision. Verified: `npx kiss-ssg check
  --summary generate.js` — `ok`, 19 pages, 0 failed; built the real site and
  read back both corrected strings.

- **2026-09-13, edit 7 — distilled Gaynor's Junior enquiry-reply email into
  the site.** Operator forwarded the email Gaynor actually sends people who
  ask about the Junior course. Cross-checked against the site first: price
  (£119.99), format (6 weeks, 1 hour) and next start (Sun 11 Oct, 2pm)
  already matched exactly (set in edit 1). What was genuinely new:
  - **Declined to publish, on purpose:** the email includes Gaynor's bank
    name, sort code and account number for bank-transfer payment. Not
    added to the site in any form — publishing real account details on a
    public page is a standing security anti-pattern (scraper/fraud
    exposure), independent of anything asked. No replacement wording added
    either, since none was requested.
  - **Non-refundable deposit** — confirmed with the operator this applies
    to all courses (not Junior-only), so `faqs/courses.json`, `gold.json`,
    `silver.json` and `platinum.json` all gained "non-refundable" on their
    £50-deposit answer.
  - **Curriculum gap on `junior/you-will-learn.html`** — the page covered
    4 of the 9 topics in Gaynor's own teaching list. Added the missing
    five, in the site's existing third-person voice (not the email's
    first-person "I will…"): Recall, Sit/down/stand, Stay, Examine your
    pup, and off-lead play worked into the closing callout alongside class
    size (~10 puppies/course) and the Junior-award outcome. Deliberately
    skipped the email's closing sales paragraph about trained dogs being
    welcome in hotels/kennels — judged as promotional flourish rather than
    course information, and out of step with the page's terser style.
  - Verified: `npx kiss-ssg check --summary generate.js` — `ok`, 19 pages,
    0 failed. Rendered pages read back visually in a real browser.

- **2026-09-13, edit 8 — the Puppy course video.** Operator supplied
  https://youtu.be/B9IWqEXo2eA. Added `videoId`/`videoTitle` to
  `puppy-socialisation.json` and a responsive `youtube-nocookie.com` iframe
  block in `course.hbs`, guarded by `{{#if model.videoId}}` so every other
  course page is unaffected — a normal clickable player (no autoplay/mute
  facade; that pattern is `layout-video.hbs`'s home-page hero, a different
  use case per the brainstorm). Verified by loading the built page in a
  real browser: thumbnail and title ("Puppy class: Having fun with the
  pup" — Gaynor Probert, Canine Behaviour Training Academy) confirm it's
  the right video and the embed is live.

- **2026-09-13, edit 9 — the two `a1k9training-aa`-tracked FAQ items,
  resolved by Gaynor.** Gaynor answered both directly: "No credit moved to
  next course on any courses now including puppy" (not a Bronze→Junior
  rename as first assumed — there's no credit mechanism at all any more),
  and on vet referrals, they're optional — "they can just come to me...
  it's rare I use a vet referral", needed only to claim via pet insurance
  (longer consultation, full report, costs more up front, reimbursed by
  the insurer). `a1k9training-aa` reviewed both and recommended fixing
  directly rather than waiting for its Pass 4 draft, since these are
  confirmed factual errors and its own deliverable is a report, not repo
  edits; it will re-read this branch before drafting. Fixed:
  - `faqs/puppy.json` — the question itself rested on the old, wrong "5
    months" move-up age; reworded to "What if we miss some of the puppy
    classes?" / "Classes can't be carried over or credited to another
    course, including Junior."
  - `faqs/consultations.json` — "Do I need a referral from my vet?" now
    answers plainly: no, come straight to Gaynor, a referral only matters
    for an insurance claim.
  - `behavioural-consultations/dog-on-dog-aggression/details.md` and
    `.../dog-on-person-aggression/details.md` — both had "With a referral
    from your vet, you are able to come to her…", which reads as a
    requirement; corrected in both to state no referral is needed.
  - Left `behavioural-consultations/shared/vet-referrals.hbs` alone — it
    already says "if you're referred", not "you must be referred", so it
    was accurate already.
  Verified: `npx kiss-ssg check --summary generate.js` — `ok`, 19 pages,
  0 failed; built the real site and read back all three corrected strings.

- **2026-09-13, edit 10 — video was too dominant on desktop, moved into the
  content column.** Operator reported the puppy video's balance was off on
  desktop. Root cause: edit 8 placed the embed full-width, above the
  `grid lg:grid-cols-3` row that holds the details/testimonial split — so
  on wide screens it spanned the entire page width while the text below it
  sat in a ~66%-wide column, out of proportion with everything else on the
  page. Fix: moved the video inside `.prose-site.lg:col-span-2`, the same
  column the "You Will Learn" text and its images already live in — on
  desktop it's now naturally sized to that column instead of the full
  page, and below `lg` it still stacks full-width exactly as before, since
  that's the same grid behaviour every other element in that column
  already relies on. Added `not-prose` so the typography plugin's image/
  spacing rules (meant for `<img>`/text) don't apply to the iframe wrapper.
  Verified: `npx kiss-ssg check --summary generate.js` — `ok`, 19 pages,
  0 failed; built the site and confirmed the new proportion visually in a
  real browser (desktop width) — video now roughly matches the testimonial
  card's width instead of spanning edge to edge.

- **2026-09-13, edit 11 — FAQ improvements from the contact-log report that
  need nothing from Gaynor.** `a1k9training-aa` published its finished
  analysis (private artifact) of 4 years of contact-form enquiries: 66 draft
  FAQs across 7 sections, 53 needing a placeholder answer only Gaynor can
  give. The operator asked what could be added now, before her replies come
  back. Pulled the drafts marked `new`/`covered`/`improve` with no
  `needsGaynor` flag — complete answers already, using facts already true
  on the site — plus one structural fix the report's "Beyond the FAQs"
  section flagged that needed no new fact either:
  - **Two pages gained an actual gap-closer.** Bronze and Junior had zero
    FAQ files at all (`bronze-obedience.json`/`junior-obedience.json`
    carried no `faqs` field, so `course.hbs`'s FAQ block never rendered on
    either page) — new `faqs/bronze.json` and `faqs/junior.json`, wired in.
    Same gap on One-to-one: new `faqs/one-to-one.json`, wired in.
  - **`faqs/courses.json`** (renders on `/courses/`) — added "How much do
    the courses cost, and do the later courses cost the same?" (uses the
    prices added in edit 1), "Which course should my dog start on?" (the
    age bands already on the home page) and a triage FAQ, "Do I need a
    group course, a one to one, or a behavioural consultation?" — the
    report's own three-way split of what each service is for.
  - **`faqs/puppy.json`** — added "Is puppy class just play, or training
    too?" and "Will it help with nipping and play biting?"
  - **`faqs/consultations.json`** — added "We've tried other trainers and
    nothing has worked — is it too late?", chosen specifically because the
    report's tone finding was that the most distressed enquirers blame
    themselves; this answers that directly with warmth, using only the
    site's own existing "dogs have a far greater ability to change than
    people do" register.
  - **`faqs/platinum.json`** — added "What comes after Platinum?" (one to
    one, per the existing enquiry pattern already answered elsewhere).
  - **`faqs/silver.json`** — added a Silver-vs-Gold "which one fits my
    dog" FAQ, on Silver rather than duplicated onto Gold, to avoid the
    same two paragraphs drifting apart over time.
  - **`junior/you-will-learn.html`** — the existing "Follow me" section
    already taught loose-lead walking but never used that phrase; the
    report found it's the single most common reason 6–12-month owners
    write in (35 of them), yet the page was unfindable on that exact term.
    Heading changed to "Follow me — walking on a loose lead"; no change to
    what it teaches.
  - **Deliberately left alone**, as agreed at the plan stage: the
    consultation-page tone rewrite and the "findability in owners' own
    words" heading changes (both editorial-voice calls flagged for a
    separate check-in rather than bundled in), and every one of the 53
    placeholder drafts still waiting on Gaynor.
  Verified: `npx kiss-ssg check --summary generate.js` — `ok`, 19 pages,
  0 failed, 513 links none broken; `node qa/no-bootstrap.mjs docs` clean;
  built the site and read back all eleven additions rendering on their
  correct pages, including confirming Bronze/Junior/One-to-one now render
  an FAQ section (and its FAQPage JSON-LD) for the first time.

- **2026-09-13, edit 12 — social links in the footer.** Operator asked to
  add social links to the footer; a Facebook link already existed
  (homepage only) and a YouTube channel URL was supplied
  (`UCA0GMQkoz1lgjHvo41hqH2A`). No LinkedIn link existed anywhere on the
  site despite the operator's belief there was one already — asked rather
  than guessed or searched for a URL, and the operator supplied it. Added
  a `.social-links` icon row (inline SVG, `currentColor`, `icon-link`
  class) to the footer's bottom bar next to the copyright line — the
  3-column grid above it was already full, so the bottom bar avoided a
  layout change. Extended the external-link CSS rule from edit 5 with a
  `.icon-link` exclusion: an icon-only brand link doesn't need the arrow
  marker stacked on top of it the way a text link does. Also added the
  YouTube and LinkedIn URLs to `generate.js`'s `localBusiness` helper's
  `sameAs` array, alongside the existing Facebook entry, so the
  LocalBusiness structured data on every page matches the footer.
  Verified: `npx kiss-ssg check --summary generate.js` — `ok`, 19 pages,
  0 failed; `node qa/no-bootstrap.mjs docs` clean; built the site and
  confirmed in a real browser — three distinct brand icons render
  correctly in the site's green, no double arrow-icon clutter, and the
  build's own internal-link checker doesn't need to touch them since
  they're external.
  **Coordination note:** `a1k9training-aa` claimed a set of files
  (`src/models/faqs/*`, `src/models/courses/*`, `course.hbs`,
  `src/pages/faqs.hbs`, `src/partials/faqs.hbs`, `generate.js`'s page
  registration/SECTIONS/llms sections, `faqMapper.js`) to build a
  dedicated `/faqs/` hub page with search. This edit's `generate.js`
  change is to the `localBusiness` helper, a different part of the same
  file — committed promptly specifically to land before the peer's claim
  takes effect, to avoid a merge conflict on a shared file.

- **2026-09-13, edit 13 — Facebook page check (no useful info retrievable),
  and cleanup from `a1k9training-aa`'s /faqs/ hub.** The operator asked
  whether the A1K9 Pet Dog Training Facebook page held anything useful for
  the site. It's fully login-gated — only the page name and follower count
  (5.3K followers, 19 following) are visible to a signed-out visitor; no
  posts, About section or photos. Not logged in (would require entering
  credentials), so nothing further was retrievable.
  Meanwhile `a1k9training-aa` finished its claimed work (commit `a4f0e4f`,
  "Add a /faqs/ hub with search, and write each answer once") and released
  the file claim from edit 12: `src/models/faqs/courses.json` became
  `common.json` (61 near-duplicates merged to 32 distinct answers), every
  FAQ entry now needs `id`/`group`/`q`/`a`, pages reference entries by
  `faqIds` resolved through the new `src/controllers/faqLib.js`, and a new
  `/faqs/` page (20th page) carries client-side search and the FAQPage
  JSON-LD moved off every course page onto that one hub. `npx kiss-ssg
  check` confirms clean: 20 pages, 0 failed.
  It left two things, both actioned:
  - **The Junior heading from edit 5, reconsidered.** It pointed out
    "Follow me — walking on a loose lead" over-claims: Bronze is where
    loose-lead heel work is actually taught, and the site's own new Junior
    FAQ already says so ("Follow me... is the foundation for... loose-lead
    walking", "Loose-lead heel work... is then Bronze's main subject").
    Agreed and changed to "Follow me — the foundation for loose-lead
    walking" — accurate rather than over-promising, at the cost of one
    search-term-exact word.
  - **A link to `/faqs/`.** Added to the footer's existing "Explore" list
    (matching Courses/Consultations/About) rather than the primary navbar
    — the navbar's own comment states its five destinations are deliberate
    ("the same five destinations... the Bootstrap 3 navbar carried"), so
    expanding it felt like a bigger call than what was asked; the footer
    was the lower-risk, equally-discoverable choice, and every page
    already reaches `/faqs/` via breadcrumbs per the peer's SECTIONS entry.
  Verified: `npx kiss-ssg check --summary generate.js` — `ok`, 20 pages,
  0 failed, 555 internal references (up from 546 — the new footer link on
  every page) none broken; `node qa/no-bootstrap.mjs docs` clean; built
  and read back both changes rendering correctly.

- **2026-09-13, edit 14 — the `/faqs/` hub and its navbar link supersede
  this branch's "no controller refactor" non-goal; logged as good drift,
  not silently absorbed.** The open's non-goals said "no redesign, no new
  page/section, no controller refactor — this is small content-level
  edits unless Gaynor's requests say otherwise." The operator explicitly
  directed a larger piece of work mid-branch — "I have opus critiquing our
  work. Its moving the FAQs to a searchable page" — which
  `a1k9training-aa` built (commit `1c8e305`): a new page (`/faqs/`), a new
  controller (`faqHub.js`) and a new non-page module (`faqLib.js`), plus
  edits to the existing `course.js`, `behavioural-consultations.js` and
  `faqMapper.js` controllers. A separate agent session (Claude Opus 5,
  co-authoring directly as the operator, commit `5553bca`) then added
  FAQs to the top navigation after finding the footer-only link
  insufficient ("the operator could not find the page"). Both are real,
  deliberate scope expansion — not scope creep — done at the operator's
  explicit direction outside this conversation, and both are captured
  here because this file is this branch's one record even for work this
  session didn't perform.

## Pulse log

<!-- Appended by kiss-branch-pulse, one dated line per checkpoint: criteria status,
     the evidence, and the decision. Append-only — the Intent above is immutable,
     and the criteria are ticked only at close. -->

---

<!-- kiss-branch-close writes the reflection below and flips status: closed -->
