---
subject-hash: ddfc88d9646cf01dc4b9e886b2bc9accda5baff0
---

## What it does

The controller for `/faqs/`, the page that carries every FAQ on the site. It asks `src/controllers/faqLib.js` for the entries grouped into sections, and hands `src/pages/faqs.hbs` three things: `sections` (the accordion), `faqCount` (the number in the standfirst) and `allFaqs` (a flat list, in page order, for the FAQPage JSON-LD).

## Why it is this way

The same answers appear on the course and consultation pages, but only this page marks them up as `FAQPage`. Google restricted FAQ rich results to well-known government and health sites in August 2023, so repeating the markup on seven pages earns nothing in search and splits the answer set an answer engine reads. One page, one machine-readable copy.

`allFaqs` is derived here rather than in the view because the JSON-LD and the visible accordion must list the same entries in the same order — deriving it twice is how they would drift.

## Gotchas

- The section order, and therefore the page order, is `GROUPS` in `src/controllers/faqLib.js`, not anything in this file. An entry whose `group` is not in that list fails the build rather than disappearing quietly.
- Adding an FAQ anywhere under `src/models/faqs` puts it on this page automatically. Nothing here needs editing to publish a new answer — that is the point of the hub.
- The page is registered with `noHero: true` so the questions start at the top of the document, which is what both a reader scanning and a crawler extracting want.
