/**
 * ============================================================
 *  DoorLoop Training — Shared Intercom Helpers
 * ============================================================
 *  Centralised functions for Intercom product tours, articles,
 *  and messenger so both the Training Hub and Help Widget call
 *  the same code.
 *
 *  USAGE:
 *    <script src="../shared/intercom.js"></script>
 *    // Then use window.DoorLoopIntercom.*
 *
 *  API:
 *    DoorLoopIntercom.showArticle(url)              → void
 *    DoorLoopIntercom.startTour(tourId, appPath)    → void
 *    DoorLoopIntercom.openMessenger()               → void
 *    DoorLoopIntercom.hideLauncher()                → void
 * ============================================================
 */
(function () {
  'use strict';

  /**
   * Show a help center article via Intercom's in-app viewer.
   * Extracts the numeric article ID from the URL.
   * Falls back to opening in a new tab if Intercom isn't loaded.
   *
   * @param {string} url — e.g. "https://support.doorloop.com/en/articles/6301613-get-started"
   */
  function showArticle(url) {
    var match = url.match(/\/articles\/(\d+)/);
    if (match && typeof window.Intercom === 'function') {
      window.Intercom('showArticle', parseInt(match[1], 10));
    } else if (match && window.parent !== window) {
      // Embedded in iframe — ask parent to show article
      window.parent.postMessage({
        type: 'doorloop:showArticle',
        articleId: parseInt(match[1], 10),
      }, '*');
    } else {
      window.open(url, '_blank');
    }
  }

  /**
   * Start an Intercom product tour with three-tier context handling.
   *
   * Tier 1 — Standalone training hub (any domain other than app.doorloop.com):
   *   Open a new tab at https://app.doorloop.com{appPath}?product_tour_id={tourId}.
   *   app.doorloop.com reads the query param on load and fires the tour.
   *
   * Tier 2 — Inside app.doorloop.com, already on the correct page
   *   (or tour has no appPath requirement):
   *   Fire window.Intercom('startTour', N) directly — no navigation.
   *
   * Tier 3 — Inside app.doorloop.com, on a different page:
   *   Navigate to {appPath}?product_tour_id={tourId}. app.doorloop.com's
   *   page-load handler fires the tour on arrival. This is a full page
   *   reload today; upgrade path is a window.__doorloopNavigate(path) hook
   *   on the app so the widget can use SPA routing instead.
   *
   * @param {string} tourId  — Intercom tour ID (numeric string)
   * @param {string|null} appPath — In-app path where the tour begins
   */
  function startTour(tourId, appPath) {
    if (!tourId) return;

    var isStandaloneHub = window.location.hostname !== 'app.doorloop.com';

    // Tier 1: Standalone training hub → new tab on app.doorloop.com
    if (isStandaloneHub) {
      if (appPath) {
        window.open('https://app.doorloop.com' + appPath + '?product_tour_id=' + tourId, '_blank');
      } else {
        console.warn('[DoorLoop] Tour launch failed: missing appPath on training hub. Tour ID:', tourId);
      }
      return;
    }

    // Tier 2: Inside the app, already on the right page → fire in-place
    if (!appPath || window.location.pathname === appPath) {
      if (typeof window.Intercom === 'function') {
        window.Intercom('startTour', parseInt(tourId, 10));
      } else {
        console.warn('[DoorLoop] Intercom not available. Tour ID:', tourId);
      }
      return;
    }

    // Tier 3: Inside the app, on a different page → navigate with query param,
    // let app.doorloop.com's page-load handler fire the tour on arrival.
    window.location.href = appPath + '?product_tour_id=' + tourId;
  }

  /**
   * Open the Intercom messenger in new-message mode.
   * Falls back to the support site if Intercom isn't loaded
   * (e.g. standalone GitHub Pages deployment).
   */
  function openMessenger() {
    if (typeof window.Intercom === 'function') {
      window.Intercom('showNewMessage');
    } else if (window.parent !== window) {
      // Embedded in iframe — ask parent to open Intercom
      window.parent.postMessage({ type: 'doorloop:openMessenger' }, '*');
    } else {
      // Intercom not available — open support site as fallback
      window.open('https://support.doorloop.com', '_blank');
    }
  }

  /**
   * Hide the default Intercom launcher bubble.
   * Uses both CSS injection and the Intercom API.
   */
  function hideLauncher() {
    // CSS approach
    if (!document.getElementById('dlhw-hide-intercom')) {
      var s = document.createElement('style');
      s.id = 'dlhw-hide-intercom';
      s.textContent =
        '.intercom-lightweight-app-launcher,' +
        '.intercom-launcher-frame,' +
        '.intercom-launcher,' +
        'iframe[name="intercom-launcher-frame"]{' +
        'display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}';
      document.head.appendChild(s);
    }
    // API approach
    if (typeof window.Intercom === 'function') {
      try { window.Intercom('update', { hide_default_launcher: true }); } catch (e) { /* */ }
    }
  }

  /* ---------- Public API ---------- */

  window.DoorLoopIntercom = {
    showArticle: showArticle,
    startTour: startTour,
    openMessenger: openMessenger,
    hideLauncher: hideLauncher,
  };
})();
