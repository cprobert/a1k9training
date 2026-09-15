import { utils } from 'kiss-ssg'
import { makeLinkTo } from './link.js'

// Where the visitor is: the breadcrumb trail, derived from the page being
// rendered rather than declared page by page.

// The site's four sections — one entry per top-level folder: the label used for
// it wherever it is named, the page id of its index, and the fan-out id its
// child pages hang off (`{{link child slug=…}}`; null where a section has no
// children). The navbar still carries its own copy of these labels in markup,
// so renaming a section means editing src/partials/layout/navbar.hbs too.
const SECTIONS = {
  'behavioural-consultations': {
    label: 'Consultations',
    id: 'behavioural-consultations/index',
    child: 'behavioural-consultations/consultation',
  },
  courses: { label: 'Courses', id: 'courses/index', child: 'courses/course' },
  about: { label: 'About Us', id: 'about/index', child: 'about' },
  contact: { label: 'Contact', id: 'contact', child: null },
  faqs: { label: 'FAQs', id: 'faqs', child: null },
}

export function registerNavigationHelpers(kiss) {
  const linkTo = makeLinkTo(kiss)

  // The breadcrumb trail for the page being rendered, derived from that page's own
  // URL rather than declared page by page — so the visual trail
  // (src/partials/layout/breadcrumb.hbs) and the BreadcrumbList JSON-LD below are
  // always the same list, which is what Google asks for and what stops the two
  // drifting as pages are added.
  //
  // This site is exactly two levels deep: a page URL is either a section index
  // ('courses') or one child of it ('courses/bronze-obedience'). A child's own
  // crumb comes from `model.crumb`, a short label matching the navbar — NOT
  // `model.heading`, which on this site is a marketing headline ("Solid
  // Foundation Training", "Congratulations! You have a new puppy.") and made a
  // nonsense of the trail while it was being used for this.
  //
  // Returns [] for the home page: it is the root, and gets no trail.
  kiss.handlebars.registerHelper('breadcrumb', function (options) {
    const key = utils.toURLKey(options?.data?.root?.pageURL ?? '')
    if (!key) return []

    const [sectionSlug, childSlug] = key.split('/')
    const section = SECTIONS[sectionSlug]
    if (!section) return []

    const trail = [{ name: 'Home', url: linkTo('index') }]
    if (!childSlug) {
      trail.push({
        name: section.label,
        url: linkTo(section.id),
        current: true,
      })
      return trail
    }

    trail.push({ name: section.label, url: linkTo(section.id) })
    const model = options?.data?.root?.model
    trail.push({
      name: model?.crumb || model?.heading || childSlug,
      url: linkTo(section.child, childSlug),
      current: true,
    })
    return trail
  })
}
