import fs from 'node:fs'
import path from 'node:path'
import 'colors'
import Kiss, { utils } from 'kiss-ssg'
import { registerHelpers } from './src/helpers/index.js'

const args = process.argv.slice(2)

const d = new Date()
const year = d.getFullYear()

const kiss = new Kiss({
  dev: args.length > 0,
  verbose: true,
  folders: { build: './docs' },
  siteUrl: 'https://www.a1k9training.co.uk',
  // Every emitted .css/.js is renamed to carry a hash of its own bytes, so the
  // host can cache them for ever. Templates keep asking for the plain name via
  // the {{asset}} helper — see src/layouts/*.hbs.
  assets: {
    hash: true,
    // Tailwind runs as a kiss asset pipeline step: `run` compiles the
    // stylesheet into src/assets/css before the asset copy (production and
    // `kiss-ssg check` alike), and in dev mode `watch` keeps it compiling as
    // templates change. Output is gitignored; kiss copies and hashes it.
    pipeline: [
      {
        name: 'tailwind',
        run: 'npx @tailwindcss/cli -i src/styles/site.css -o src/assets/css/site.css --minify',
        watch:
          'npx @tailwindcss/cli -i src/styles/site.css -o src/assets/css/site.css --minify --watch=always',
      },
    ],
  },
  // Hard-wrapped prose in src/partials/**/*.md must not gain a <br /> per source
  // line. This is also kiss 2.2.1's default — stated here so the intent survives
  // a change of default, and so nothing has to re-register partials to apply it.
  markdown: { breaks: false },
  year: year,
})

// Every custom Handlebars helper — see src/helpers/. Registered before anything
// renders: partials are compiled at construction, and {{breadcrumb}} and
// {{courseLadder}} resolve their links against the page registry the .page()
// and .pages() calls below fill, at render time rather than now.
registerHelpers(kiss)

kiss
  .page({
    view: 'index.hbs',
    title: 'Dog Behaviour and Trainer South Wales | A1K9 Training',
    description:
      'Gaynor Probert K9 Behaviour and Training - Improving relationships between dogs and their owners',
    sitemapPriority: '1.00',
    sitemapChangefreq: 'monthly',
  })

  .page({
    view: 'behavioural-consultations/index.hbs',
    model: {
      image: '/images/consultations/consultations-v1.webp',
      caption: 'right',
      // The handful of answers this page shows inline; every answer, including
      // these, is on /faqs/. Ids live in src/models/faqs/*.json.
      faqIds: [
        'cons-too-late',
        'cons-what-happens',
        'cons-referral',
        'cons-after',
        'cons-where',
      ],
    },
    controller: 'faqMapper.js',
    title: 'Dog Behavioural Consultations in South Wales by Gaynor Probert',
    description:
      'Professional behavioural consultations for dog aggression in South Wales. Expert help from Gaynor Probert to rehabilitate your dog.',
    sitemapPriority: '0.80',
    sitemapChangefreq: 'monthly',
  })
  .pages({
    view: 'behavioural-consultations/consultation.hbs',
    model: 'behavioural-consultations',
    controller: 'behavioural-consultations.js',
    path: 'behavioural-consultations',
    sitemapPriority: '0.60',
    sitemapChangefreq: 'monthly',
  })

  .page({
    view: 'courses/index.hbs',
    model: {
      image: '/images/courses/classes-v1.1.webp',
      caption: 'left',
      faqIds: [
        'course-prices',
        'which-course',
        'service-triage',
        'booking-required',
        'venue',
        'vaccinations',
      ],
    },
    controller: 'faqMapper.js',
    title: 'Dog Training Classes in South Wales with Gaynor Probert',
    description:
      'Dog training courses every weekend at A1K9 Academy near Swansea. Group classes for all abilities help dogs learn and socialise.',
    sitemapPriority: '0.80',
    sitemapChangefreq: 'monthly',
  })
  .pages({
    view: 'courses/course.hbs',
    model: 'courses',
    controller: 'course.js',
    path: 'courses',
    sitemapPriority: '0.60',
    sitemapChangefreq: 'monthly',
  })

  .pages({
    view: 'about.hbs',
    model: 'about',
    controller: 'about.js',
    // The about/gaynor-probert/about-facilities/about-sara-thomas fan-out
    // shares one options object, so it can't give its own "about/" index a
    // higher priority than its siblings without a controller change — and
    // src/controllers/about.js is out of scope while another agent is mid-
    // migration on it. 0.60 for the whole section is the sensible default
    // until that lands.
    sitemapPriority: '0.60',
    sitemapChangefreq: 'monthly',
  })

  .page({
    view: 'contact.hbs',
    model: {
      image: '/images/about/horse-sit-v1.webp',
      caption: 'right',
      captionOffset: true,
    },
    title: 'Contact A1K9 Training',
    description:
      'Contact A1K9 Dog Training Academy near Swansea in South Wales to book dog training courses or a behavioural consultation, and find us on the map.',
    path: 'contact',
    slug: 'index',
    // The contact page moved from /find-us/ to /contact/ (the label the navbar
    // and breadcrumb already used). Unlike the pre-2015 paths the course,
    // consultation and about records carry as their own `aliases`, this URL
    // was live and indexed until the rename, so the 301 is what carries its
    // ranking. kiss writes every alias into docs/_redirects.
    aliases: ['/find-us/'],
    sitemapPriority: '0.80',
    sitemapChangefreq: 'monthly',
  })

  // Where Netlify sends a visitor after a successful form post (the forms'
  // `action`). Like the 404 it is a real page but not a destination — kept out
  // of sitemap.xml and llms.txt, and given `noHero` so the confirmation is the
  // first thing on screen.
  .page({
    view: 'thanks.hbs',
    model: { noHero: true },
    title: 'Thank you | A1K9 Training',
    description:
      'Your enquiry has been sent to Gaynor Probert at A1K9 Training. She will get back to you shortly.',
    path: 'thanks',
    slug: 'index',
    ignoreSitemap: true,
    ignoreLlms: true,
  })

  // Netlify serves docs/404.html for any unmatched path. It is a real page in
  // the build but not a destination: kept out of sitemap.xml and llms.txt so
  // neither search engines nor answer engines offer it as a result, and given
  // `noHero` so the routes back sit above the fold instead of below a 60vh photo.
  .page({
    view: '404.hbs',
    model: { noHero: true },
    title: 'Page not found | A1K9 Training',
    description:
      'That page could not be found. Find dog training courses, behavioural consultations and contact details for A1K9 Training near Swansea.',
    slug: '404',
    ignoreSitemap: true,
    ignoreLlms: true,
  })

  // Every FAQ on the site, on one page. The course and consultation pages each
  // show the few answers their own visitors ask for, but this is where the full
  // set lives — one URL for a person to search, and the only page carrying
  // FAQPage JSON-LD, so an answer is marked up once rather than seven times.
  .page({
    view: 'faqs.hbs',
    model: { noHero: true },
    controller: 'faqHub.js',
    title: 'Dog Training FAQs | A1K9 Training near Swansea',
    description:
      'Answers about dog training courses and behavioural consultations with Gaynor Probert near Swansea: prices, start dates, which course suits your dog, vaccinations and what to bring.',
    path: 'faqs',
    slug: 'index',
    sitemapPriority: '0.70',
    sitemapChangefreq: 'monthly',
  })

  .generate()
  .sitemap()
  // llms.txt (llmstxt.org): the index answer engines read first. kiss derives
  // every entry from the page registry — the same titles, descriptions and
  // canonical URLs as the sitemap — so it cannot drift; the two things only a
  // human can write live in src/llms/.
  .llms({
    title: 'A1K9 Behaviour and Training Academy',
    summary: 'src/llms/summary.md',
    notes: 'src/llms/notes.md',
    sections: {
      root: 'Home and contact',
      courses: 'Dog training courses',
      'behavioural-consultations': 'Behavioural consultations',
      about: 'About',
      contact: 'Home and contact',
      faqs: 'Frequently asked questions',
    },
  })

// v2 reports a page, controller or dev-server failure by rejecting complete().
// Without this catch a broken build still exits 0 and deploys a site with
// pages missing. complete()'s own callback never runs for a failed build, so
// 'Success' means the whole build was written.
kiss
  .complete(function () {
    console.log('Success'.rainbow)
    if (this.config.dev)
      console.log(`http://${this.config.devHost}:${this.config.port}`.yellow)
    // qa/pages.mjs's source of truth for "every page on this site": kiss's
    // own registry, not a directory walk that can't tell a rendered page
    // apart from an incidental static file copied straight from
    // src/assets (the Google site-verification stub was the case that
    // bit us — it lived in docs/ as a .html file, so a raw walk counted
    // it as a 21st page and both a hardcoded --assert=N in package.json
    // and a hand-maintained exclusion list in qa/check-axe.mjs had to be
    // kept in sync by hand). Written once per real (non-dev, non-check)
    // build, so it is never stale and nothing needs bumping when a page
    // is added. Skipped in dev and in `check` mode: this is a raw
    // fs.writeFileSync, not a kiss API call, so it is not staging-aware —
    // writing it during `check` (report.mode === 'check') would leave a
    // file behind in the real build folder despite check's "nothing is
    // written" guarantee.
    const report = this.report()
    if (!this.config.dev && report.mode !== 'check') {
      const pages = (report.pages || [])
        .filter((p) => p.ok)
        .map((p) => utils.posixPath(path.relative(report.buildDir, p.buildTo)))
      fs.writeFileSync(
        path.join(report.buildDir, '.qa-pages.json'),
        JSON.stringify(pages, null, 2),
      )
    }
  })
  .catch((err) => {
    for (const failure of err.failures ?? [])
      console.error(
        `${failure.view} | ${failure.buildTo} | ${failure.error.message}`.red,
      )
    process.exitCode = 1
  })
