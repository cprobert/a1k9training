---
branch: content/faq-and-positioning-refresh
base: master
status: closed
opened: 2026-09-15
closed: 2026-09-15
---

# Session — 2026-09-15: FAQ correction and positioning refresh from Gaynor interview

## Intent (captured at kiss-branch-open)

**Objective:** Rewrite and extend the FAQ content (and the course/consultation
pages and About positioning copy that share facts with it) using the source
recording "09-14 A1K9 Canine Trainer: Course and Consultation Policies"
(Plaud file id `of_43e5f43e808d061b75c3950bd0f244c2`, recorded 2026-09-14
18:43, after PR #26's FAQ hub shipped) — a structured Q&A interview between
Courtenay and Gaynor covering puppy socialisation, obedience course logistics,
special-case dog handling, course philosophy/progression, and one-to-one /
behavioural consultation pricing. The interview both fills real gaps (exact
class times, class-size caps, late-entry rules, vet-card policy, one-to-one
and home-visit pricing) and **contradicts one existing FAQ answer** —
`src/models/faqs/common.json`'s `vaccinations` entry currently says "a puppy
needs all its vaccinations before it can attend," while Gaynor's own words
are that timing is vet-dependent (some vets clear after one vaccination plus
a week, others want two) and only a vet card at the first class is required,
no proof in advance.

**Success criteria:**

- [ ] `src/models/faqs/*.json` corrected and extended from the interview:
      puppy socialisation (Sunday 15:00, ~10 dogs/max 12, second-week-only
      late entry, vet-card-not-proof, prep tips: collar/lead/name/eye
      contact), general obedience (rolling 6-week cycle, Junior/Bronze
      Sunday PM, Silver/Gold Saturday PM, Platinum by invitation only,
      catchment area, two-dogs-one-household guidance, cash balance on week
      one, no instalments), special cases (aggression → consultation first,
      season/XL Bully/muzzle-order exclusions), progression/assessment
      (rosette vs achievement rosette, restart-at-Bronze-after-a-gap), and
      one-to-one/consultation (£90/hr at A1K9, £130 home visit + travel, no
      packages, two dogs same household in one session). The `vaccinations`
      FAQ corrected to match Gaynor's actual policy.
- [ ] `~ docs/faqs/index.html` and every course/consultation page that
      renders one of the touched `faqIds` — an eyeball pass on the deploy
      preview confirms the accordion text reads correctly and nothing looks
      truncated (this is the criterion that has gone unmet three sessions
      running; do it this time).
- [ ] `~ docs/courses/one-to-one.html` — `enquiryLead`/pricing reflects the
      real £90 / £130 figures instead of "prices on enquiry".
      `docs/behavioural-consultations/*.html` similarly, if those pages
      carry the same vague pricing line.
- [ ] `~ docs/about/gaynor-probert.html` and/or `docs/index.html` /
      `docs/contact/index.html` — catchment area named explicitly (Swansea,
      Neath, Port Talbot, Ammanford, towards Carmarthen and Cross Hands;
      Caerphilly/Cardiff clients travel in) somewhere positioning currently
      just says "South Wales" — exact page(s) TBD once the copy is drafted.
- [ ] No page added or removed; no template, partial structure, controller
      or build-script change — this is a content/data-only branch.
- [ ] `npx kiss-ssg check --summary router.js` stays green (0 failed, no new
      broken links, no new AIKB note findings) after the changes.

**Non-goals / out of scope:** Changing `src/config/business.js`'s
`areaServed` field or any site-wide schema (that would ripple into every
page's JSON-LD and is a bigger, separate decision); refreshing
`qa/baseline/content.json` (pre-existing gap, not this branch's to fix);
fixing the inherited CRLF/asset-hash drift found below; running
`kiss-memory-consolidate`; anything on booking-form mechanics, video
selection or location-page redesign (the interview's other action items,
left for a separate piece of work).

**Impact surface:** content & data — `src/models/faqs/*.json`,
`src/models/courses/one-to-one.json`, `src/models/about/*.json` and any
consultation model carrying pricing text. No `.hbs`/controller changes are
expected; if one turns out to be needed (e.g. a course model needs a
`price`/`priceNote` pair the view doesn't already render), that's an
Amendment, not silent scope creep.

**Expected shape:** between — the *source* is fixed (the interview
transcript), but which exact pages the positioning copy lands on (About vs
home vs Contact) is emergent, to be decided while drafting against the
recorded content.

**Inherited feedback:**

- **Eyeball criterion, 3rd recurrence.** Feedback on 2026-09-12, again on
  2026-09-13, and dropped outright on 2026-09-14. This branch has an
  explicit eyeball criterion above (deploy preview, FAQ accordion) — it must
  be opened in a browser before close ticks it, or the item gets retired as
  "the site is verified mechanically" per the 09-14 feedback's own
  instruction. Recommending `kiss-memory-consolidate` was declined at open
  (see below); this is now the 4th chance.
- **Keep sending/quoting verbatim source text rather than paraphrasing**
  (2026-09-13). The FAQ copy in this branch should be drafted against the
  Plaud recording's own transcript (`get_transcript` on
  `of_43e5f43e808d061b75c3950bd0f244c2`), not just the AI summary already
  pulled at open, for exact wording on anything that matters (e.g.
  "non-refundable", specific rosette names).
- **Keep asking before guessing a business fact or policy rather than
  inferring it** (2026-09-13). Anywhere the interview is ambiguous or silent
  (e.g. exact wording for the About page positioning copy), ask rather than
  invent.
- **Never re-record `AIKB/` mid-branch** (2026-09-14, this branch's
  baseline already exists from PR #28 — see below).

### Amendments

- **2026-09-15 — scope widened from "FAQ + copy" to "presentation first, FAQ
  second".** After reading the full interview transcript alongside the 4-year
  enquiry analysis ("What People Ask Gaynor", 1,094 enquiries: booking/next
  start 544, cost 298, days/times 163, puppy vaccination timing 170…), the
  operator directed that the facts be put on the pages as furniture so the
  questions stop arriving, and the FAQ hub shrink to the ~15–18 judgement
  questions a facts table cannot answer. That flips two lines of the Intent:
  - **Impact surface** is now *templates & partials + data* (was content
    only): new `src/partials/at-a-glance.hbs` and `how-booking-works.hbs`, a
    facts block on every course and consultation page, the enquiry form on the
    consultation pages, two new form fields, `offers` in the service JSON-LD.
    No controller changes (facts live in `src/config/business.js` as new
    `courses`/`sessions` blocks — `areaServed` stays untouched, as ruled).
    `src/assets/js/site.js` gets a one-line edit, so every page's HTML changes
    via the hashed asset — expected.
  - **Criterion 1** changes direction: the FAQ set is *reduced* (32 → ≤18),
    not extended; the retired entries become page furniture.
  - **Non-goal reversed**: `qa/baseline/content.json` **is** refreshed in this
    PR, as the last commit, per the 2026-09-12 feedback.
  Approved plan: `C:\Users\cprob\.claude\plans\i-want-you-to-tender-wilkes.md`
  (facts table with transcript segment numbers, delegation Opus/Sonnet/Sonnet/
  Haiku, QA bar). Operator decisions at the plan stage: hub ~15–18 sectioned;
  catchment in copy only; enquiry form on consultation pages; honest venue
  access note published on contact + facilities.
- **2026-09-15 — wave 2, same branch (operator: one PR, verified by Gaynor
  as a completed product; no second PR).** After the QA presentation the
  operator asked for the follow-ups to land here. Criteria added:
  - **Rolling next-start dates.** The 544-person "when does the next course
    start" answer must not depend on five hand-typed `nextStart` strings.
    Anchor Sunday + six-week blocks in `src/config/business.js`; a pure,
    unit-tested `src/helpers/schedule.js`; Sunday courses (Puppy/Junior/
    Bronze) and Saturday courses (Silver/Gold) derive their date; a model
    `nextStart` remains as a manual override (cancelled course); within the
    first week after a start the block says "started … you can still join
    on week two; next course …". Platinum unchanged (invitation).
    Controller `course.js` changes → `AIKB/notes/controllers/course.md`
    restamped. Weekly scheduled rebuild: operator decision pending.
  - **Yellow brick road.** Amber (`btn-accent`) is the most-wanted response
    only: the hero jump-to-form, "Send enquiry", the phone. Every other
    `btn-primary` that is navigation ("Read more", "Next:", "Website",
    "Find out more") becomes `btn-secondary`. Consistent on all 20 pages.
  - **Flow.** "How booking works" folds into the enquiry form section's
    header (part of the act, not a doubt); FAQs stay immediately above the
    form; order identical on course and consultation pages.
  - **Mobile nav.** Top-level items only below `lg` (Home, Consultations,
    Courses, About, FAQs, Contact, phone); the panel scrolls
    (`max-h-[calc(100dvh-…)] overflow-y-auto`) as belt and braces.
  - **Contact page.** Remove the booking steps; replace the separate
    `a1k9-contact-consultation` Netlify form with the same enquiry partial
    (one form, one inbox, one field set); keep "already spoken to Gaynor",
    venues, access, catchment. Baseline refreshed again at the end.
  - **Long-tail FAQs.** `searchOnly: true` entries (PAT/therapy dogs,
    wheelchair/access, prong collars, residential/board-and-train,
    toilet/crate/chewing) exist in the hub's search index and under a
    collapsed "More answers" section, not in the curated list; hub count
    stays the curated number. `faqHub.js` changes → note restamped.
    Junior/Bronze inline order: `reactive-in-class` before `over-excited`.
  - **The bible.** `AIKB/knowledge/gaynor-policies.md` — every policy in
    Gaynor's words, dated, with its transcript segment and the site
    statements it retired; `planning/sources/2026-09-14-gaynor-interview.md`
    (the transcript); a convention in `AIKB/site.md` ("a business fact is
    stated on the site only if it is in the policies file"); the same facts
    in `src/llms/notes.md` for answer engines.

## Pulse log

<!-- Appended by kiss-branch-pulse. -->

- **2026-09-15 (after slice 1, commits `666424b`..`e1c57c0`)** — check `ok`,
  20 pages, 0 failed, 557 links none broken, no note findings; diff `~` on all
  20 pages, 0 unchanged — expected, since `site.js` (hashed asset) changed and
  every page links it, on top of the inherited CRLF drift recorded at open.
  Against the amended criteria: facts-on-the-page **met** (at-a-glance on 9
  pages, booking steps on 10, enquiry form on the 2 consultation pages,
  `offers` 119.99/90 in JSON-LD) — verified in Chrome at 1440 and by
  Playwright at 375 (scrollWidth 375 on bronze, puppy, consultation, contact;
  the Chrome extension's window resize did not take effect, so the mobile
  check is Playwright's, not the extension's). FAQ reduction **not yet**
  (slice 2 in flight); copy **not yet** (slice 3 in flight); baseline
  refresh **not yet** (slice 4). Nothing in the diff outside the criteria.
  Surface moved from content to templates + data — recorded in the
  Amendment, no controller touched so no note restamp owed. Two QA findings:
  Puppy's step 4 repeated the cash line (fixed, `e1c57c0`); the enquiry
  form's fallback lead still promised "dates, prices" (handed to slice 3).
  Decision: **continue**.
- **2026-09-15 (after slices 2–4, through `5b65aac` + baseline re-refresh)** —
  check `ok`, 20 pages, 0 failed, no note findings (slice 2 reworded one
  historical path in `AIKB/notes/controllers/course.md` that had gone
  dangling when `faqs/gold.json` was deleted; controller untouched, stamp
  intact). Full `npm run qa` green end to end: css, 8/8 unit tests, 20
  pages, no Bootstrap, SEO 20/0/0, snapshot, compare OK, axe 0 first-party.
  Criteria: FAQ set **met** — 32 → 18, every answer traced to its transcript
  segment by the QA pass, `vaccinations` misstatement gone; copy **met** —
  retired strings 0 in `docs/`, catchment / access / approach / A1K9
  distinction present, verified in Chrome on home, contact, bronze hero,
  consultation, `/faqs/`; baseline refresh **met** (twice: once by slice 4,
  once after the QA's own three copy fixes). QA findings fixed on the
  branch: "most owners" → "one of the most common reasons" (`9da6da4`); hub
  standfirst/search hint still described page facts, and the stay-safe
  paragraph had been inserted mid-sequence in the what-to-expect card
  (`2c6cba2`). Eyeball notes for the operator: the Bronze/Junior hero
  caption is a paragraph taller now; the consultations index page carries
  no `offers` (it is not a single service). Not verifiable locally: Netlify
  keeping the `vet-date`/`reply-by` fields — needs one test submission on
  the deploy preview. Decision: **ready to close**.
- **2026-09-15 (wave 2, `cb1f830`..HEAD)** — check `ok`, 20 pages, 0 failed,
  558 links none broken, no note findings (`course.md` restamped twice,
  `faqhub.md` once); full `npm run qa` green end to end (35/35 unit tests,
  SEO 20/0/0, axe 0 first-party, compare OK after the baseline refresh).
  Wave-2 criteria all **met**: rolling dates (helper + 23 tests; forward
  schedule stamped into the page, client-side pick verified by Playwright
  with a mocked clock across week one, year boundary and past-horizon; no
  cron — operator's call); amber = MWR only (4 amber, ≤1 green per page);
  booking steps inside the form section; contact on the one form, one inbox;
  mobile nav 7 links incl. phone, panel scrolls, desktop unchanged; 6
  `searchOnly` long-tail FAQs (hub still "18 answers", JSON-LD 24, search
  opens "More answers"); the bible (`AIKB/knowledge/gaynor-policies.md`, 48
  sourced entries) + transcript in `planning/sources/` + `llms.txt` notes +
  a `site.md` convention, zero dangling. QA findings fixed on the branch:
  Platinum's "Saturday afternoons" was an assumption the interview never
  made (`b4b001f`); contact heading wording (`9cb791a`); the collar answer
  invented a slip-collar policy (`8007e5d`); the sweep committed the interim
  "after" snapshot as the baseline (corrected). Open questions for Gaynor
  are listed in the bible: Platinum's day, the £50 deposit figure (pre-dates
  the interview), the wet-weather switch, catchment radius, Bronze minimum
  age wording. Still not verifiable locally: Netlify keeping the three new
  form fields — one test submission on the deploy preview. Decision:
  **ready to close**.

---

## Baseline notes (captured at open, not this branch's doing)

- `AIKB/site-map.json` already exists (recorded in PR #28,
  `267cb4a`) — not re-recorded here, per the rule.
- `npx kiss-ssg check --summary router.js` at open: **ok**, 20 pages, 0
  failed, 91 assets, 555 internal links checked/none broken, no AIKB note
  findings (missing/dead/stale/dangling all clean).
- **Inherited drift, unexplained by this branch:** the check's diff against
  the recorded baseline showed all 20 pages `~` (0 unchanged) *before any
  edit*. Traced to `js/site.js` emitting a different content hash
  (`03d87911` recorded vs `e575f042` now) even though the file is unchanged
  since commit `94a2455` and has no working-tree diff; `css/site.css`'s hash
  matched fine. Likely cause: `core.autocrlf=true` on this checkout with no
  `.gitattributes` to pin line endings — `site.js` currently reads with CRLF
  line terminators, so the same tracked bytes can hash differently between
  an environment that checked it out as LF (wherever PR #28's AIKB record
  was built) and this one. Not this branch's problem to fix, but worth a
  standing-gotcha note in `AIKB/site.md` at the next consolidation.
- **kiss-memory-consolidate recommendation declined at open**: the "eyeball"
  feedback item has recurred in 3 of the last 3 sessions (threshold met);
  only 4 sessions exist total and 0 are marked consolidated (5-unconsolidated
  threshold not met). Operator chose to open this branch directly rather
  than consolidate first — noted above as the 4th chance for that item.
- No other open/abandoned session files found on other branches.

## Reflection (written at kiss-branch-close, 2026-09-15)

### Reflect — what the session was

Opened as a narrow content fix: correct the FAQs from a Plaud interview
with Gaynor and sharpen the positioning copy. Within an hour the operator
reframed it — "cut the questions off at source": put the facts on the pages
as furniture, keep FAQs for judgement, rank by the four-year enquiry counts —
and asked for a planned, delegated, QA'd build. Plan mode produced an
approved plan with a facts table cited to transcript segments; four
implementation slices ran on it. After the QA presentation the operator
declined a second PR and directed a second wave onto the same branch
(rolling dates, the amber most-wanted-response rule, flow, mobile nav, one
form, long-tail `searchOnly` FAQs, the policies bible), then asked for an
expand-all control to review the folded answers. **Planned inside each wave,
emergent across them**, and the shape served it: both expansions are dated
Amendments, and nothing landed that a criterion did not name.

### Evaluate — how the human supervised the AI

Three dimensions discriminated this session.

**Pushback & steering — the strongest.** Every turn of the operator's
changed the work's shape for the better: the reframe from "fix the FAQ" to
"presentation first"; "am I overcomplicating this?" (which turned a
knowledge-base system into a `searchOnly` flag); "no second PR — Gaynor
verifies a completed product"; "JSON-based, a forward-facing schedule" in
place of a CI cron; "is there a back door so I can verify the hidden
answers?". None of these were prompted by the agent.

**Harness leverage — deliberately designed.** The operator specified the
workflow: orchestrator plans, delegates by model tier (Opus for
cross-cutting templates, Sonnet for copy against a verbatim source, Haiku
for the sweep), and is accountable for QA. Plan mode, three Explore agents
and a Plan agent fed the plan; nine implementation agents ran it; Chrome
and Playwright did the looking; the kiss loop (open → pulse ×3 → close)
held the record. This is the rubric's "reproducible human–AI workflow".

**Verification & ownership — delegated, and that delegation was tested.**
The operator did not read diffs; the orchestrator did, and the
trust-but-verify pass found eight findings across nine agent reports
(a duplicated cash line; "what most owners write about"; two stale hub
blurbs; a paragraph inserted mid-sequence; Platinum's invented Saturday;
an invented slip-collar policy; a baseline committed from the interim
copy). Each was fixed on the branch, not waved through. The one thing the
delegation cannot substitute for is the operator's own eyes: the eyeball
criterion — on its fourth outing — was met by the agent in a real browser
and by Playwright at 375px, but the operator has not yet looked at the
deploy preview, and the Netlify form-field question can only be answered by
a real submission there.

**Competency level: Agentic engineering lead** — earned by the workflow
design and the system improvements (the bible as canonical knowledge, the
forward schedule, the amber rule as a convention), with the caveat above
on personal verification.

### Feedback — recommendations for next time

- **Human — look at the deploy preview before merging, specifically
  `/faqs/?all`, one course page at phone width, and a test submission of
  the form.** The agent's eyeball is evidence; yours is the criterion. This
  is the fourth session carrying the item; it is half-met now, which is
  progress — finish it at the PR.
- **Human — type the decisions.** "beest the FAW", "Jason best for the time
  being" each cost a clarifying round trip; a typed one-liner does not.
- **Agent — treat every sub-agent report as a claim.** Eight findings in
  nine reports, all in the direction of overstatement (a wording stronger
  than the source, a step "done" that was half-done). Next time hand each
  agent a short "claims you may not make" list (no policy the transcript
  does not state; no "committed" without `git log` proof) and keep the
  read-the-diff pass regardless.
- **Agent — one writer of the baseline, last.** Two agents refreshing
  `qa/baseline/content.json` at different moments produced a stale commit
  and an interim-copy commit. Next time the sweep is the only writer, runs
  after the QA fixes, and the orchestrator's `npm run qa` is the proof.
- **Both — fix the CRLF checkout once.** `core.autocrlf=true` with no
  `.gitattributes` made Prettier report thirteen false failures, moved the
  `site.js` asset hash between environments, and made every `git commit`
  warn. Next time: a one-line `.gitattributes` (`* text=auto eol=lf`) as
  its own tiny PR before any content work.
- **Both — take the five open questions to Gaynor with the preview link**,
  in the bible's "Open questions": Platinum's day, the £50 deposit figure,
  the wet-weather switch, catchment radius, the Bronze minimum-age wording.

### Verdict — did we achieve the objective?

**Brief (as amended):** put the facts people ask for on the pages so the
questions stop arriving; keep FAQs for judgement, ranked by enquiry count;
correct the interview's contradictions; make the site's positioning
concrete; then rolling dates, amber = MWR, flow, mobile nav, one form,
long-tail FAQs and a canonical policies file — all on one branch, one PR.

- [x] FAQ set corrected and reduced: 32 → 18 curated + 6 `searchOnly`;
      every answer cited to a transcript segment; the wrong vaccination
      answer gone (`09799bc`, `3d6cf03`, `8007e5d`).
- [ ] **Eyeball on the deploy preview** — agent-verified in Chrome (1440)
      and Playwright (375, scrollWidth 375 on every changed page); the
      operator's look at the preview is outstanding, so this stays open by
      the rule that a human ticks eyeball criteria.
- [x] One-to-one and consultation pricing on the page: £90 / £130 + travel,
      `offers` in JSON-LD (`8dd3d8f`).
- [x] Catchment named on home, contact and in `llms.txt`; access notes on
      contact and facilities (`74379a7`, `5dfc4e3`).
- [x] No page added or removed (20 → 20 in the record); the "no template or
      controller change" line was superseded by the first Amendment.
- [x] `npx kiss-ssg check` ok, 0 failed, 558 links none broken, all four
      note lines clean; full `npm run qa` green.
- [x] Wave 2: rolling dates with a forward schedule (`cb1f830`..`aa28430`,
      23 tests); amber only on the four enquiry actions (`9dba95e`);
      booking steps inside the form (`163ddf5`); contact on the one form
      (`ded7050`); mobile nav 7 links + scrolling panel (`3d6cf03`);
      `searchOnly` long tail + "Expand all" + `?all` (`e929bf5`, `4b39dbd`);
      the bible, transcript and `site.md` convention (`30d2b6d`).

**Met, and the objective moved — twice, both times outward, both
recorded, both the operator's call.** Concretely better: a course page
answers price, day, next date, venue, class size, what to bring and the
XL Bully rule before anyone asks; the next-start date maintains itself;
one amber button means one thing; one form feeds one inbox; the FAQ hub is
a reviewed list of 18 with a searchable long tail; and the site now has a
canonical, sourced statement of every policy it makes.

Open: the operator's eyeball on the preview; a Netlify form test
(`reply-by`, `vet-date`); Gaynor's five open questions; the CRLF
`.gitattributes` fix; a `kiss-memory-consolidate` sweep (five sessions
unconsolidated).
