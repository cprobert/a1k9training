// Presentation helpers: pure transformations of a value the template already
// has. No page context, no registry — arguments in, string out.

// The page's hero image path used as a fallback wherever a model carries none;
// exported because the LocalBusiness JSON-LD in schema.js needs the same one.
export const HOME_HERO_IMAGE = '/images/gaynor-probert-home-v1.1.webp'

export function registerFormatHelpers(kiss) {
  // Equality test for template conditionals — the hero uses it to place the
  // caption: {{#if (eq model.caption "right")}}. Handlebars ships no such helper.
  kiss.handlebars.registerHelper('eq', (a, b) => a === b)

  // The image pipeline (scripts/optimise-images.mjs) writes a 960px-wide sibling
  // beside every hero — `foo.webp` → `foo-960w.webp` — so a phone never downloads
  // the 1920px file. {{imageVariant model.image '960w'}} names that sibling.
  kiss.handlebars.registerHelper('imageVariant', (src, suffix) =>
    typeof src === 'string'
      ? src.replace(/(\.[a-z0-9]+)$/i, `-${suffix}$1`)
      : '',
  )

  // The page's hero image, for og:image and the LocalBusiness JSON-LD in
  // src/partials/layout/header.hbs. Every inner page's model carries its own
  // `image` (see the *.json under src/models/); the one page that doesn't is
  // the home page, which renders through layout-video.hbs with its hero image
  // hardcoded there rather than in a model — so that same path is the fallback
  // here, kept in sync with layout-video.hbs by hand.
  kiss.handlebars.registerHelper(
    'heroImage',
    (model) => (model && model.image) || HOME_HERO_IMAGE,
  )
}
