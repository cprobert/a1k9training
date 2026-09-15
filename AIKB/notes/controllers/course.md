---
subject-hash: c5f5d03fea003ca386cb43a2fec3651650bd90ed
---

## What it does

Runs once per record in `src/models/courses` for the `/courses/*` fan-out registered in `router.js`. It resolves the record's `faqIds` into FAQ entries through `src/controllers/faqLib.js`, derives that course's `schedule` — the next start date, and the running one a newcomer can still join — then returns `slug`, `title` and `description` for the page and the whole record as `model` for `src/pages/courses/course.hbs`. Nothing else is derived here: the course ladder, the breadcrumb and `aliases` are read straight off the record by helpers in `router.js` and by kiss itself.

## Why it is this way

A record used to name a whole FAQ file by path and the controller swapped the path for its contents. Each course page therefore owned a file, and the shared answers — deposit, venue, what to bring, missed weeks — were duplicated across five of them and drifted apart. A record now names ids instead (`src/models/courses/bronze-obedience.json`), the answers live once under `src/models/faqs`, and the same entry is rendered inline here and on `/faqs/`.

The controller returns a new model rather than mutating the record in place, which also removes the old in-place `model.faqs` mutation noted in earlier versions of this file.

The `schedule` half is newer and has the same cause. "When does the next course start?" is the single most-asked enquiry this site receives — 544 of them over four years — and five records answered it with a hand-typed `nextStart` string that was wrong again six weeks later. Gaynor's rule is arithmetic (six-week blocks, back to back, Puppy/Junior/Bronze on a shared Sunday and Silver/Gold on the Saturday before it), so the timetable is one anchor in `src/config/business.js` and `src/helpers/schedule.js` computes the rest. This controller is the only place the two meet: it reads the clock **once**, at module scope, so all five dated pages agree even across a midnight build, and hands that `today` to the pure module rather than letting it read a clock of its own.

A build-time date is still only right on the day it was built, and this site builds on push rather than on a schedule — a page deployed in October would name an October date all through December. Rather than add a cron the operator did not want, `schedule` carries the timetable **forward**: `upcoming` is the next twelve starts as ISO dates and `time` is the class time, `src/partials/at-a-glance.hbs` puts both in `data-schedule-starts` / `data-schedule-time` on the row, and `src/assets/js/site.js` re-picks the right one on load. The build-time text stays in the markup as the default, so a crawler and a reader without JavaScript still see a real date, and the two agree on the day of the deploy.



## Gotchas

- An unknown id throws, naming the id and the course record — a typo fails the build instead of shipping a course page with a silently missing answer.
- `faqIds` order is the order on the page; the first entries should be what that course's own enquirers ask most.
- `src/controllers/behavioural-consultations.js` is the same controller for the consultation records; change both or neither — except for `schedule`, which is a course idea and deliberately does not exist there.
- A record opts into the rolling date by carrying `startDay` (`"sunday"`/`"saturday"`) and `startTime`; a record with neither gets no `schedule` at all. Platinum is the one such course — its dates are agreed with the group at Gold graduation, so it keeps `startNote`.
- **A literal `nextStart` on a record still wins.** A record carrying one is given no `schedule` at all, so it beats the rolling date in the markup *and* gets no data attributes for the script to overwrite. That is the manual override for a block that is cancelled or moved: type the real date onto the one record, and delete it again when the timetable is back on the anchor. The better fix for a whole-timetable slip is to move `courses.anchorSunday` instead.
- The horizon is twelve starts, about sixteen months. Past the end of that list the script stops and leaves the build-time text, which will by then be a date in the past — so the anchor still wants a look every year or so, just not every six weeks. Deploying anything at all re-stamps a fresh twelve.
- The client-side half is ~40 lines in `src/assets/js/site.js` under "Rolling course start dates". It compares UTC midnights, like the helper, so neither DST Sunday can move a date; it is the only place the `,` separator is parsed, and `src/helpers/format.js`'s `join` helper is the only place it is written.
- Keep each course page's inline list short (four to six). The full set is on `/faqs/`, linked from the bottom of every inline block by `src/partials/faqs.hbs`.
