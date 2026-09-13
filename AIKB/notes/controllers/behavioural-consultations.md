---
subject-hash: 36351b857c9d43e2b082cf919c3c61cfd6f09585
---

## What it does

Runs once per record in `src/models/behavioural-consultations` for the `/behavioural-consultations/*` fan-out. It resolves the record's `faqIds` into FAQ entries through `src/controllers/faqLib.js` and returns `slug`, `title`, `description` and the record as `model` for `src/pages/behavioural-consultations/consultation.hbs`.

## Why it is this way

It mirrors `src/controllers/course.js` exactly, and for the same reason: the answers used to be loaded as a whole file per page, so the two consultation pages and the index rendered one identical block and the shared answers drifted from the course ones. Ids let each page carry the answers its own visitors need — the dog-on-dog page leads with dog aggression, the dog-on-person page with aggression to people — while the wording lives once in `src/models/faqs/consultations.json`.

## Gotchas

- The two records deliberately differ only in their first id; the rest (what happens, referral, where, is it too late) are shared, and the index in `generate.js` carries its own list.
- An unknown id throws, naming the record.
- The consultation FAQs carry the analysis's finding that owners rarely use the word "consultation": the questions are phrased the way enquirers write them ("My dog growls, snaps or has bitten someone"), which is what they search for. Keep that voice when adding one.
