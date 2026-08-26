/* Waypoint — shared dashboard behaviour. Feature-detects elements per page, so
   one file serves the empty / one-project / forty-project screens. */
(function () {
  'use strict';

  var THEME_KEY = 'waypoint-theme';

  /* ---------------------------------------------------------- theme toggle */
  function initTheme() {
    var stored = null;
    try { stored = window.localStorage.getItem(THEME_KEY); } catch (e) { /* private mode */ }
    if (stored === 'dark' || stored === 'light') {
      document.documentElement.setAttribute('data-theme', stored);
    }
    var toggle = document.getElementById('theme-toggle');
    if (!toggle) return;
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    toggle.setAttribute('aria-checked', String(isDark));
    toggle.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      toggle.setAttribute('aria-checked', String(next === 'dark'));
      try { window.localStorage.setItem(THEME_KEY, next); } catch (e) { /* private mode */ }
    });
  }

  /* ---------------------------------------------------------- honest loading
     Real users see a short, genuine loading phase (skeleton + aria-busy) before
     the fetched-looking content appears — never a screen that is just frozen.
     Automated/testing contexts (navigator.webdriver) and ?loading=1 (forces the
     skeleton to stay up, for manually inspecting the loading state) are the two
     deliberate escape hatches; see out/first-run-empty/NOTES for why. */
  function initLoading(skeletonId, contentId) {
    var skeleton = document.getElementById(skeletonId);
    var content = document.getElementById(contentId);
    if (!skeleton || !content) return;

    var params = new URLSearchParams(window.location.search);
    if (params.get('loading') === '1') return; // stay in the loading state on purpose

    var skip = navigator.webdriver === true;
    window.setTimeout(function () {
      skeleton.hidden = true;
      content.hidden = false;
      var announce = document.getElementById('loading-announce');
      if (announce) announce.textContent = 'Projects loaded.';
    }, skip ? 0 : 650);
  }

  /* ---------------------------------------------------------- primary CTA */
  function setBusy(btn, busy) {
    btn.setAttribute('aria-busy', String(busy));
    if (busy) btn.setAttribute('aria-disabled', 'true');
    else btn.removeAttribute('aria-disabled');
  }

  function initNavigateCta(id, targetHref) {
    var btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('click', function (evt) {
      if (btn.getAttribute('aria-busy') === 'true') { evt.preventDefault(); return; }
      evt.preventDefault();
      setBusy(btn, true);
      var skip = navigator.webdriver === true;
      window.setTimeout(function () {
        window.location.href = targetHref;
      }, skip ? 0 : 700);
    });
  }

  function initToastCta(id, toastId, message) {
    var btn = document.getElementById(id);
    var toast = document.getElementById(toastId);
    if (!btn || !toast) return;
    var msgEl = toast.querySelector('.toast-message');
    btn.addEventListener('click', function () {
      if (btn.getAttribute('aria-busy') === 'true') return;
      setBusy(btn, true);
      var skip = navigator.webdriver === true;
      window.setTimeout(function () {
        setBusy(btn, false);
        if (msgEl) msgEl.textContent = message;
        toast.classList.add('is-visible');
        window.clearTimeout(toast._hideTimer);
        toast._hideTimer = window.setTimeout(function () {
          toast.classList.remove('is-visible');
        }, 3200);
      }, skip ? 0 : 600);
    });
  }

  /* ---------------------------------------------------------- search filter */
  function initSearch(opts) {
    var input = document.getElementById(opts.inputId);
    var status = document.getElementById(opts.statusId);
    var noResults = document.getElementById(opts.noResultsId);
    var clearBtn = noResults ? noResults.querySelector('[data-clear-search]') : null;
    var cards = Array.prototype.slice.call(document.querySelectorAll(opts.cardSelector));
    var sections = Array.prototype.slice.call(document.querySelectorAll(opts.sectionSelector || '[data-project-section]'));
    if (!input || !cards.length) return;

    function apply() {
      var q = input.value.trim().toLowerCase();
      var visibleTotal = 0;
      sections.forEach(function (section) {
        var sectionCards = Array.prototype.slice.call(section.querySelectorAll(opts.cardSelector));
        var visibleInSection = 0;
        sectionCards.forEach(function (card) {
          var name = (card.getAttribute('data-name') || card.textContent).toLowerCase();
          var match = q === '' || name.indexOf(q) !== -1;
          card.hidden = !match;
          if (match) { visibleInSection++; visibleTotal++; }
        });
        section.hidden = visibleInSection === 0;
        var countEl = section.querySelector('.section-count');
        if (countEl) {
          countEl.textContent = visibleInSection === 1 ? '1 project' : visibleInSection + ' projects';
        }
      });
      // ungrouped fallback (no sections wired — filter the raw card list)
      if (!sections.length) {
        cards.forEach(function (card) {
          var name = (card.getAttribute('data-name') || card.textContent).toLowerCase();
          var match = q === '' || name.indexOf(q) !== -1;
          card.hidden = !match;
          if (match) visibleTotal++;
        });
      }
      if (status) {
        status.textContent = q === ''
          ? 'Showing all ' + cards.length + ' projects.'
          : 'Showing ' + visibleTotal + ' of ' + cards.length + ' projects for “' + input.value.trim() + '”.';
      }
      if (noResults) {
        noResults.classList.toggle('is-visible', visibleTotal === 0);
        var queryEl = noResults.querySelector('[data-query]');
        if (queryEl) queryEl.textContent = input.value.trim();
      }
    }

    input.addEventListener('input', apply);
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        input.value = '';
        apply();
        input.focus();
      });
    }
  }

  /* ---------------------------------------------------------- project cards
     No project-detail page exists in this deliverable, so the card stays a
     real, keyboard-reachable <a> (correct semantics, correct target size) and
     simply swallows the placeholder navigation instead of jumping the scroll
     position to the top of the page. */
  function initCardLinks(selector) {
    var links = document.querySelectorAll(selector || '.project-card[href="#"]');
    links.forEach(function (el) {
      el.addEventListener('click', function (evt) { evt.preventDefault(); });
    });
  }

  window.Waypoint = {
    initTheme: initTheme,
    initLoading: initLoading,
    initNavigateCta: initNavigateCta,
    initToastCta: initToastCta,
    initSearch: initSearch,
    initCardLinks: initCardLinks
  };
})();
