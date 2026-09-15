import { registerFormatHelpers } from './format.js'
import { registerSchemaHelpers } from './schema.js'
import { registerNavigationHelpers } from './navigation.js'
import { registerCourseHelpers } from './courses.js'

// Every Handlebars helper this site adds to the ones kiss ships. Called from
// router.js on the instance, because kiss gives each Kiss its own Handlebars
// environment (Handlebars.create()) — a helper registered on the global module
// is not seen by these templates.
//
// Order within this function does not matter; when it is called does. Helpers
// must be registered before anything renders, and partials render at
// construction, so this runs immediately after new Kiss().
export function registerHelpers(kiss) {
  registerFormatHelpers(kiss)
  registerSchemaHelpers(kiss)
  registerNavigationHelpers(kiss)
  registerCourseHelpers(kiss)
  return kiss
}
