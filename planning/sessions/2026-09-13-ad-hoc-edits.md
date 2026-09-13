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

## Pulse log

<!-- Appended by kiss-branch-pulse, one dated line per checkpoint: criteria status,
     the evidence, and the decision. Append-only — the Intent above is immutable,
     and the criteria are ticked only at close. -->

---

<!-- kiss-branch-close writes the reflection below and flips status: closed -->
