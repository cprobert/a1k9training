// The same id → served-path resolution templates get from {{link}}, for the
// helpers below that assemble a breadcrumb trail or a course track in JS rather
// than in markup. `canonical` gives the pretty form Netlify serves without a
// redirect (`/courses/`, `/courses/bronze-obedience`), the same string the
// page's own <link rel="canonical"> and its sitemap <loc> carry. Render-time
// only: the registry it reads is filled by the .page()/.pages() calls further
// down, so nothing may call it at module load — an unknown id throws, which is
// the point (a dead link fails the build instead of shipping).
//
// Bound to an instance rather than imported ready-made, so that building the
// binding stays free of any resolution: makeLinkTo(kiss) may run at module load,
// the linkTo it returns may not.
export const makeLinkTo = (kiss) => (id, slug) =>
  kiss.handlebars.helpers.link(id, { hash: { canonical: true, slug } })
