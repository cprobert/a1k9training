---
subject-hash: fbc571897bfcc428090c8ebda083cd5a6898c483
---

## What it does

The controller for `/faqs/`, the page that carries every FAQ on the site. It asks `src/controllers/faqLib.js` for the entries grouped into sections, and hands `src/pages/faqs.hbs` four things: `sections` (the accordion), `moreFaqs` (the long-tail entries, sorted by question, rendered as a closed-by-default "More answers" block), `faqCount` (the number in the standfirst — curated sections only, `moreFaqs` excluded) and `allFaqs` (`sections` + `moreFaqs` flattened, in that order, for the FAQPage JSON-LD — it has to cover everything the page can show, search included, even the entries the standfirst doesn't count).

## Why it is this way

The same answers appear on the course and consultation pages, but only this page marks them up as `FAQPage`. Google restricted FAQ rich results to well-known government and health sites in August 2023, so repeating the markup on seven pages earns nothing in search and splits the answer set an answer engine reads. One page, one machine-readable copy.

`allFaqs` is derived here rather than in the view because the JSON-LD and the visible accordion must list the same entries in the same order — deriving it twice is how they would drift.

## Gotchas

- The section order, and therefore the page order, is `GROUPS` in `src/controllers/faqLib.js`, not anything in this file. An entry whose `group` is not in that list fails the build rather than disappearing quietly.
- Adding an FAQ anywhere under `src/models/faqs` puts it on this page automatically. Nothing here needs editing to publish a new answer — that is the point of the hub.
- The page is registered with `noHero: true` so the questions start at the top of the document, which is what both a reader scanning and a crawler extracting want.
- `searchOnly: true` on an FAQ entry (`src/models/faqs/*.json`) is what routes it into `moreFaqs` instead of a section — `faqLib.js`'s `splitFaqs()` does the sorting, this controller just calls it via `moreFaqs()`. The entry still needs a `group` in `GROUPS`, even though `moreFaqs` doesn't group by it: `faqSections()` validates every entry's group, curated or not, so a typo there still fails the build.
