---
branch: feat/social-share-card
base: master
status: open
opened: 2026-09-19
---

# Session — 2026-09-19: A purpose-made social share card

## Intent (captured at kiss-branch-open)

**Objective:** give every page one purpose-made 1200×630 Open Graph image —
Gaynor with the Labrador on the right, her name and "Dog training &
behaviour, Swansea · South Wales" on the brand-green left — so a link pasted
into Facebook, WhatsApp or LinkedIn previews as a deliberate card instead of
whatever crop the platform makes of each page's hero photo.

**Success criteria:**

- [ ] `src/assets/images/social-card-v1.jpg` exists, exactly 1200×630, JPEG,
      rendered by a committed script from a committed HTML design (the
      pro-plumbing pattern: `scripts/social-card.mjs` +
      `planning/design/social-card.html`).
- [ ] `business.socialCard` in `src/config/business.js` holds the path,
      width, height and alt; the script reads the same object, so the file and
      the tags cannot disagree.
- [ ] `~` every page (20): `og:image` is the absolute URL of the card, plus
      `og:image:width`, `og:image:height`, `og:image:alt`; `og:title`,
      `og:description`, `og:url` stay per page. Nothing else in any page
      changes.
- [ ] `npm run check` ok; no broken links; `qa:test` passes.
- [ ] Eyeball: the operator looks at the rendered card before it is
      committed, at full size and at thumbnail size.
- [ ] Eyeball, post-deploy: a pasted link previews with the card (Facebook
      Sharing Debugger, and a WhatsApp paste).

**Non-goals / out of scope:** per-page cards; changing the LocalBusiness
JSON-LD `image`; any copy change; re-cutting the hero photo itself; running
the card render as part of `npm run build` (it is a one-shot script, re-run
only when the design changes).

**Impact surface:** templates & partials, plus assets — the shared
`layout/header.hbs` partial changes all 20 pages; a new image asset and a
render script. No controller, URL model or pipeline step, so no AIKB note is
obliged.

**Expected shape:** planned — the pro-plumbing site is a working precedent.

**Inherited feedback:**

- *Eyeball criterion (4th recurrence: 09-12, 09-13, 09-14, 09-15).* This
  branch's eyeball is the card itself, shown to the operator before commit.
- *Refresh `qa/baseline/content.json` in the same PR, one writer, last.* The
  og tags are head-only, so the snapshot may not move; check, don't assume.
- *Write prose files with the file tool, not shell heredocs.*
- *CRLF: `core.autocrlf=true`, no `.gitattributes`.* Prettier reports
  line-ending false failures; compare with CR stripped.

**Inherited at open:** `npm run check` ok on master (`267cb4a`), 20 pages,
0 failed, no note findings. The diff against the recorded `AIKB/` shows all
20 pages `~` before this branch touched anything: drift carried from earlier
work, not this branch's. `kiss-memory-consolidate` is recommended (five
unconsolidated sessions; the eyeball item at four recurrences) and deferred
as its own beat. PR #29 (`content/faq-and-positioning-refresh`) is open and
also edits `src/config/business.js`, in a different block; expect a trivial
merge.

### Amendments

## Pulse log

- **2026-09-19, card committed (`8166127`), PR #30 open.** Criteria 1–4 met:
  `social-card-v1.jpg` 1200×630 JPEG, 96KB, from the committed script and
  design; `business.socialCard` read by both; all 20 pages carry the four
  `og:image*` tags (spot-checked home, FAQs, a course, One to One); check ok,
  20 pages, 0 failed, no broken links; `qa:test` passes. Eyeball (card) met:
  the operator saw three renders. The first, photo on the right, had Gaynor
  looking off the card's edge with her face outside a centred square crop,
  so the photo moved left. The operator then asked to "push the
  consultations and classes", was shown a list version and two mixes, and
  chose "Dog training classes & behaviour consultations". Open: the
  post-deploy share check. Decision: continue to the preview.

- **2026-09-19, preview.** QA compare against master's baseline: OK, no
  gating issues, 0 navigation errors, so no baseline refresh is needed (the
  tags are head-only). Netlify preview for #30 up; `preview-qa` passed. On the
  preview, `/images/social-card-v1.jpg` is 200 `image/jpeg`, 96KB,
  `max-age=31536000`, and pages carry all four `og:image*` tags. The
  `og:image` URL is on the production domain (siteUrl), so the share test only
  means anything after merge. Decision: ready to close once merged and the
  Sharing Debugger shows the card.

---
