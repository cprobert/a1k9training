---
subject-hash: f814ebd8f081db04fe37611c6e48ec29c5e54bc2
---

## What it does

For the two section index pages — `/courses/` and `/behavioural-consultations/` — whose models are written inline in `generate.js`. The model names the FAQs that page shows inline as `faqIds`, a list of ids; this controller resolves them through `src/controllers/faqLib.js` and returns a new model with `faqs` set to the entries, which `src/partials/faqs.hbs` renders.

## Why it is this way

It used to load a whole FAQ JSON file named by path and swap it into the model in place. That made each page's FAQ block a file, which is why the same answers were copied into five files and why the deposit wording and the wet-weather venue each had to be corrected in four of them, separately, before they agreed.

Now an answer is written once in `src/models/faqs/common.json` (or a course file) with an id, and a page names the ids it wants. The controller also returns a new object rather than mutating `options.model`: these are plain-object models, replayed from a snapshot on every watch rebuild, so an in-place mutation would accumulate across a dev session.

## Gotchas

- An id nothing defines throws, naming the id and the page — deliberately, so a typo fails the build rather than rendering a page with a missing answer.
- The order of `faqIds` is the order on the page. Put the question that page's own visitors ask most first.
- `src/controllers/course.js` and `src/controllers/behavioural-consultations.js` do the same job for the fan-out records; the three must agree on the shape `src/partials/faqs.hbs` expects, which is `[{ id, group, q, a }]`.
