// qa/faq-parity.mjs — does a page's FAQPage JSON-LD describe what the page
// actually shows?
//
// Structured data that describes content the page does not render is the one
// failure a human review cannot catch: the page looks right, and the markup
// only disagrees with it in a machine's reading. So it is checked, not
// assumed — a controller dropping an FAQ id, or a template change hiding a
// section, fails instead of shipping.
//
// Pure functions, no I/O, so qa/preview.mjs can use them against a deployed
// page and a test can use them against a string. See qa/README.md.

function decodeEntities(text) {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&') // last: an entity may be double-encoded
}

/**
 * Reduce an HTML document to the text a reader actually sees.
 *
 * Script and style contents go first — the JSON-LD itself lives in a
 * <script>, and would otherwise match itself and make every check pass.
 * A collapsed <details> body counts as visible: it is in the DOM and
 * reachable, which is the standard this site's accordion relies on.
 *
 * @param {string} html
 * @returns {string}
 */
export function visibleTextOf(html) {
  const withoutCode = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  return decodeEntities(withoutCode.replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Normalise a JSON-LD string for comparison against visible text. An answer
 * carries markup of its own, so it is reduced the same way — otherwise every
 * answer containing a link would read as "not on the page" purely because
 * the tags differ.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function normaliseText(value) {
  if (typeof value !== 'string') return ''
  return decodeEntities(value.replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Every FAQPage entry whose question or answer is not rendered on the page.
 *
 * @param {string} html the page as served
 * @param {any} faqObject the parsed FAQPage JSON-LD object
 * @returns {{ total: number, unrendered: string[] }}
 */
export function faqEntriesNotRendered(html, faqObject) {
  const visible = visibleTextOf(html)
  const entities = Array.isArray(faqObject?.mainEntity) ? faqObject.mainEntity : []
  const unrendered = []
  for (const entity of entities) {
    const question = normaliseText(entity?.name ?? '')
    const answer = normaliseText(entity?.acceptedAnswer?.text ?? '')
    if (question && !visible.includes(question)) {
      unrendered.push(`question not on the page: "${truncate(question)}"`)
    } else if (answer && !visible.includes(answer)) {
      unrendered.push(`answer not on the page for: "${truncate(question)}"`)
    }
  }
  return { total: entities.length, unrendered }
}

export function truncate(text, max = 60) {
  return text.length > max ? `${text.slice(0, max)}…` : text
}
