import 'colors'
import Kiss from 'kiss-ssg'
import { registerHelpers } from './src/helpers/index.js'
import { business } from './src/config/business.js'
import { onBuildComplete, onBuildFailure } from './scripts/build-report.mjs'

const args = process.argv.slice(2)

const d = new Date()
const year = d.getFullYear()

const kiss = new Kiss({
  dev: args.length > 0,
  verbose: true,
  folders: { build: './docs' },
  siteUrl: 'https://www.a1k9training.co.uk',
  // The business's own facts — name, phone, socials, venues. An arbitrary
  // config key reaches both sides of the site: templates read it as
  // {{config.business.*}}, helpers as kiss.config.business.
  business,
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
    // Its `faqIds` are the handful of answers this page shows inline; every
    // answer, including these, is on /faqs/. Ids live in src/models/faqs/*.json.
    model: 'behavioural-consultations-index.json',
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
    model: 'courses-index.json',
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
    model: 'contact.json',
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

  // The three `{ noHero: true }` models below stay inline on purpose: noHero is
  // a layout flag rather than page data, and a .json file holding one boolean
  // would be a file to open rather than a fact to read.
  //
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

// Once the build has settled: the success log, the .qa-pages.json the QA
// harness reads, and the non-zero exit a failed build must have.
kiss.complete(onBuildComplete).catch(onBuildFailure)
