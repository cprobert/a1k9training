---
subject-hash: c00a59e9f8de4e8b1866d50203499f3480f6f691
---

## What it does

Runs once per record in `src/models/courses` for the `/courses/*` fan-out registered in `router.js`. It resolves the record's `faqIds` into FAQ entries through `src/controllers/faqLib.js`, then returns `slug`, `title` and `description` for the page and the whole record as `model` for `src/pages/courses/course.hbs`. Nothing else is derived here: the course ladder, the breadcrumb and `aliases` are read straight off the record by helpers in `router.js` and by kiss itself.

## Why it is this way

A record used to name an FAQ file by path (`../models/faqs/gold.json`) and the controller swapped the path for its contents. Each course page therefore owned a file, and the shared answers — deposit, venue, what to bring, missed weeks — were duplicated across five of them and drifted apart. A record now names ids instead (`src/models/courses/bronze-obedience.json`), the answers live once under `src/models/faqs`, and the same entry is rendered inline here and on `/faqs/`.

The controller returns a new model rather than mutating the record in place, which also removes the old in-place `model.faqs` mutation noted in earlier versions of this file.

## Gotchas

- An unknown id throws, naming the id and the course record — a typo fails the build instead of shipping a course page with a silently missing answer.
- `faqIds` order is the order on the page; the first entries should be what that course's own enquirers ask most.
- `src/controllers/behavioural-consultations.js` is the same controller for the consultation records; change both or neither.
- Keep each course page's inline list short (four to six). The full set is on `/faqs/`, linked from the bottom of every inline block by `src/partials/faqs.hbs`.
