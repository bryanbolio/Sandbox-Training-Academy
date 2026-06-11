/**
 * ============================================================
 *  DoorLoop Help Widget — One-Line Loader
 * ============================================================
 *  Add this single script tag to your app:
 *
 *    <script src="https://YOUR-SANDBOX-DOMAIN-HERE/widget/loader.js" defer></script>
 *
 *  That's it. This loader will fetch everything it needs from
 *  YOUR-SANDBOX-DOMAIN-HERE automatically:
 *    1. widget.css        (styles)
 *    2. training-data.js  (content)
 *    3. progress.js       (watch tracking)
 *    4. intercom.js       (article/tour helpers)
 *    5. analytics.js      (PostHog events)
 *    6. widget.js         (the widget itself)
 * ============================================================
 */
(function () {
  'use strict';

  // Base URL — auto-detected from this script's src attribute
  var scriptEl = document.currentScript;
  var src = scriptEl ? scriptEl.src : '';
  var BASE = src.replace(/\/widget\/loader\.js(\?.*)?$/, '');

  // Prevent double-loading
  if (window.__doorloopWidgetLoaded) return;
  window.__doorloopWidgetLoaded = true;

  /* ---------- CSS ---------- */
  function loadCSS(href) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  /* ---------- JS (returns a Promise) ---------- */
  function loadJS(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = function () {
        console.error('[DoorLoop Widget] Failed to load: ' + src);
        reject(new Error('Failed to load ' + src));
      };
      document.head.appendChild(s);
    });
  }

  /* ---------- Boot sequence ---------- */
  function boot() {
    // 1. CSS (non-blocking)
    loadCSS(BASE + '/widget/widget.css');

    // 2. Scripts in dependency order
    loadJS(BASE + '/data/training-data.js')
      .then(function () {
        // Shared modules can load in parallel
        return Promise.all([
          loadJS(BASE + '/shared/progress.js'),
          loadJS(BASE + '/shared/intercom.js'),
          loadJS(BASE + '/shared/analytics.js'),
        ]);
      })
      .then(function () {
        // Widget depends on all of the above
        return loadJS(BASE + '/widget/widget.js');
      })
      .then(function () {
        console.log('[DoorLoop Widget] Ready.');
      })
      .catch(function (err) {
        console.error('[DoorLoop Widget] Load error:', err);
      });
  }

  // Wait for DOM if needed
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
