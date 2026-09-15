---
branch: content/faq-and-positioning-refresh
base: master
status: open
opened: 2026-09-15
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
