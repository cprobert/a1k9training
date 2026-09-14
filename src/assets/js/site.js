/* a1k9training — the site's only script. No build step, no dependencies. */
;(function () {
  'use strict'

  /* ---- Mobile navigation disclosure ------------------------------------ */
  var navToggle = document.querySelector('[data-nav-toggle]')
  var navPanel = document.querySelector('[data-nav-panel]')

  function setNav(open) {
    if (!navToggle || !navPanel) return
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false')
    navPanel.classList.toggle('hidden', !open)
    document.body.classList.toggle('overflow-hidden', open)
  }

  if (navToggle && navPanel) {
    navToggle.addEventListener('click', function () {
      setNav(navToggle.getAttribute('aria-expanded') !== 'true')
    })
  }

  /* ---- Desktop dropdowns ------------------------------------------------
   * CSS already opens a group on hover and on focus-within. This only keeps
   * aria-expanded honest, and lets the chevron button pin a group open. */
  var groups = document.querySelectorAll('[data-dropdown]')

  Array.prototype.forEach.call(groups, function (group) {
    var toggle = group.querySelector('[data-dropdown-toggle]')
    if (!toggle) return
    var set = function (open) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false')
    }
    toggle.addEventListener('click', function () {
      set(toggle.getAttribute('aria-expanded') !== 'true')
    })
    group.addEventListener('pointerenter', function () { set(true) })
    group.addEventListener('pointerleave', function () { set(false) })
    group.addEventListener('focusin', function () { set(true) })
    group.addEventListener('focusout', function (e) {
      if (!group.contains(e.relatedTarget)) set(false)
    })
  })

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return
    setNav(false)
    Array.prototype.forEach.call(groups, function (group) {
      var toggle = group.querySelector('[data-dropdown-toggle]')
      if (toggle) toggle.setAttribute('aria-expanded', 'false')
    })
    if (document.activeElement && document.activeElement.blur) {
      document.activeElement.blur()
    }
  })

  /* ---- Deferred hero video facade ---------------------------------------
   * The poster image is the hero. A YouTube iframe is injected behind the
   * overlay only on a wide viewport, only when motion and data are welcome,
   * and only after the first real interaction or a 6s idle window. Nothing
   * from youtube.com is requested before that moment. */
  var hero = document.querySelector('[data-hero-video]')
  var videoId = hero && hero.getAttribute('data-video-id')
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  var saveData = !!(navigator.connection && navigator.connection.saveData)

  if (hero && videoId && !reduceMotion && !saveData && window.innerWidth >= 1024) {
    var armed = true
    var events = ['pointermove', 'scroll', 'touchstart', 'keydown']

    var play = function () {
      if (!armed) return
      armed = false
      events.forEach(function (name) { window.removeEventListener(name, play) })

      var frame = document.createElement('iframe')
      frame.title = 'Background footage of A1K9 dog training'
      frame.tabIndex = -1
      frame.setAttribute('aria-hidden', 'true')
      frame.setAttribute('allow', 'autoplay; encrypted-media')
      frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin')
      // Inline styles on purpose: this file is not a Tailwind source, so no
      // utility class written here would ever be generated.
      frame.style.cssText =
        'position:absolute;top:50%;left:50%;z-index:-20;width:177.78vh;' +
        'min-width:100%;height:56.25vw;min-height:100%;border:0;' +
        'transform:translate(-50%,-50%);pointer-events:none;'
      frame.src =
        'https://www.youtube-nocookie.com/embed/' + videoId +
        '?autoplay=1&mute=1&loop=1&playlist=' + videoId +
        '&controls=0&playsinline=1&rel=0'
      hero.appendChild(frame)
    }

    events.forEach(function (name) {
      window.addEventListener(name, play, { once: true, passive: true })
    })
    var startTimer = function () { setTimeout(play, 6000) }
    if (document.readyState === 'complete') startTimer()
    else window.addEventListener('load', startTimer, { once: true })
  }

  /* ---- Enquiry subject line ---------------------------------------------
   * Netlify uses a field named `subject` as the notification email's subject.
   * The form ships with a static fallback ("Course enquiry: Bronze
   * Obedience"), which is enough to tell course enquiries apart from
   * consultation ones — but Gmail threads messages that share a subject, so a
   * static one would collapse every enquiry about the same course, from
   * different people, into a single conversation.
   *
   * Adding the sender's name makes each thread distinct. The name only exists
   * at submit time, so it cannot be baked in at build time like the course is.
   *
   * Progressive enhancement: with JavaScript off the static subject is posted
   * and the form works exactly as before — only the grouping is coarser. */
  var enquiryForms = document.querySelectorAll('form[data-enquiry]')

  Array.prototype.forEach.call(enquiryForms, function (form) {
    form.addEventListener('submit', function () {
      var subject = form.querySelector('input[name="subject"]')
      var name = form.querySelector('input[name="name"]')
      if (!subject || !name) return

      var who = (name.value || '').trim().replace(/\s+/g, ' ')
      if (!who) return // leave the static fallback in place

      var course = form.querySelector('input[name="course"]')
      var what = course ? course.value : ''
      subject.value = what
        ? 'Course enquiry: ' + who + ' — ' + what
        : 'Course enquiry: ' + who
    })
  })

  /* ---- FAQ search, /faqs/ only -----------------------------------------
   * Filters the questions already on the page — no index to fetch, no
   * network. The box is hidden in the markup and revealed here, so with
   * JavaScript off the page is still every answer in full, which is also
   * what a crawler reads. */
  var faqSearch = document.querySelector('[data-faq-search]')
  var faqInput = document.querySelector('[data-faq-input]')

  if (faqSearch && faqInput) {
    var faqs = Array.prototype.slice.call(document.querySelectorAll('[data-faq]'))
    var faqSections = Array.prototype.slice.call(
      document.querySelectorAll('[data-faq-section]'),
    )
    var faqCount = document.querySelector('[data-faq-count]')
    var faqEmpty = document.querySelector('[data-faq-empty]')
    var faqJump = document.querySelector('[data-faq-jump]')
    var faqJumpNav = faqJump ? faqJump.closest('nav') : null

    /* Question and answer text of each entry, lower-cased once up front. */
    var haystack = faqs.map(function (el) {
      return el.textContent.toLowerCase().replace(/\s+/g, ' ')
    })

    var filterFaqs = function (value) {
      var terms = value.toLowerCase().split(/\s+/).filter(Boolean)
      var searching = terms.length > 0
      var shown = 0

      faqs.forEach(function (el, i) {
        var hit =
          !searching ||
          terms.every(function (term) {
            return haystack[i].indexOf(term) !== -1
          })
        el.hidden = !hit
        /* Open what matched, so the answer is readable without a second
         * click; collapse everything again when the box is cleared. */
        el.open = searching && hit
        if (hit) shown++
      })

      faqSections.forEach(function (section) {
        section.hidden = !section.querySelector('[data-faq]:not([hidden])')
      })

      if (faqJumpNav) faqJumpNav.hidden = searching
      if (faqEmpty) faqEmpty.hidden = !(searching && shown === 0)
      if (faqCount) {
        faqCount.textContent = searching
          ? shown === 0
            ? 'No questions match “' + value.trim() + '”'
            : shown + ' of ' + faqs.length + ' questions match'
          : ''
      }
    }

    faqSearch.hidden = false
    faqInput.addEventListener('input', function () {
      filterFaqs(faqInput.value)
    })
    /* Escape clears the filter, the convention for a search field. */
    faqInput.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && faqInput.value) {
        faqInput.value = ''
        filterFaqs('')
      }
    })

    /* A link to one answer (/faqs/#q-course-prices) opens it on arrival. */
    var openFromHash = function () {
      if (!/^#q-/.test(location.hash)) return
      var target = document.getElementById(location.hash.slice(1))
      if (target && target.tagName === 'DETAILS') target.open = true
    }
    openFromHash()
    window.addEventListener('hashchange', openFromHash)
  }
})()
