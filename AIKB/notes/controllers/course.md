---
subject-hash: 4313491a78e89aaa132165d00eea3cb2db73f406
---

## What it does

Runs once per record in `src/models/courses` for the `/courses/*` fan-out registered in `router.js`. It resolves the record's `faqIds` into FAQ entries through `src/controllers/faqLib.js`, derives that course's `schedule` — the next start date, and the running one a newcomer can still join — then returns `slug`, `title` and `description` for the page and the whole record as `model` for `src/pages/courses/course.hbs`. Nothing else is derived here: the course ladder, the breadcrumb and `aliases` are read straight off the record by helpers in `router.js` and by kiss itself.

## Why it is this way

A record used to name a whole FAQ file by path and the controller swapped the path for its contents. Each course page therefore owned a file, and the shared answers — deposit, venue, what to bring, missed weeks — were duplicated across five of them and drifted apart. A record now names ids instead (`src/models/courses/bronze-obedience.json`), the answers live once under `src/models/faqs`, and the same entry is rendered inline here and on `/faqs/`.

The controller returns a new model rather than mutating the record in place, which also removes the old in-place `model.faqs` mutation noted in earlier versions of this file.

The `schedule` half is newer and has the same cause. "When does the next course start?" is the single most-asked enquiry this site receives — 544 of them over four years — and five records answered it with a hand-typed `nextStart` string that was wrong again six weeks later. Gaynor's rule is arithmetic (six-week blocks, back to back, Puppy/Junior/Bronze on a shared Sunday and Silver/Gold on the Saturday before it), so the timetable is one anchor in `src/config/business.js` and `src/helpers/schedule.js` computes the rest. This controller is the only place the two meet: it reads the clock **once**, at module scope, so all five dated pages agree even across a midnight build, and hands that `today` to the pure module rather than letting it read a clock of its own.



## Gotchas

- An unknown id throws, naming the id and the course record — a typo fails the build instead of shipping a course page with a silently missing answer.
- `faqIds` order is the order on the page; the first entries should be what that course's own enquirers ask most.
- `src/controllers/behavioural-consultations.js` is the same controller for the consultation records; change both or neither — except for `schedule`, which is a course idea and deliberately does not exist there.
- A record opts into the rolling date by carrying `startDay` (`"sunday"`/`"saturday"`) and `startTime`; a record with neither gets no `schedule` at all. Platinum is the one such course — its dates are agreed with the group at Gold graduation, so it keeps `startNote`.
- **A literal `nextStart` on a record still wins**, in `src/partials/at-a-glance.hbs`, ahead of anything computed. That is the manual override for a block that is cancelled or moved: type the real date onto the one record, and delete it again when the timetable is back on the anchor. The better fix for a whole-timetable slip is to move `courses.anchorSunday` instead.
- The site is built on push, not on a schedule, so the date only advances when something is deployed. A long quiet spell will show a start that has already passed until the next build; if that starts to bite, the answer is a scheduled rebuild, not a date typed back onto the records.
- Keep each course page's inline list short (four to six). The full set is on `/faqs/`, linked from the bottom of every inline block by `src/partials/faqs.hbs`.
