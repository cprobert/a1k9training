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

<!-- Dated notes where the remit legitimately expanded mid-branch. -->

## Pulse log

<!-- Appended by kiss-branch-pulse. -->

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
