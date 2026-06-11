/**
 * ============================================================
 *  DoorLoop Training — Shared Progress Tracking
 * ============================================================
 *  Manages video completion state in localStorage and syncs
 *  between the Training Hub and Help Widget via:
 *    - `storage` event (cross-tab)
 *    - `doorloop:progressChanged` CustomEvent (same-page)
 *
 *  USAGE:
 *    <script src="../shared/progress.js"></script>
 *    // Then use window.DoorLoopProgress.*
 *
 *  API:
 *    DoorLoopProgress.getWatchedSet()       → Set of completed video IDs
 *    DoorLoopProgress.isWatched(videoId)     → boolean
 *    DoorLoopProgress.markWatched(videoId, source)  → void (saves + dispatches event)
 *    DoorLoopProgress.unmark(videoId, source)       → void (removes + dispatches event)
 *    DoorLoopProgress.getAll()              → Array of completed video IDs
 *    DoorLoopProgress.load()                → Set (reads from localStorage)
 *    DoorLoopProgress.save(set, source)     → void (writes + dispatches)
 *    DoorLoopProgress.onUpdate(callback)    → void (registers listener for any change)
 *    DoorLoopProgress.setStorageKey(key)    → void (override the localStorage key)
 *    DoorLoopProgress.STORAGE_KEY           → current key (read-only getter)
 * ============================================================
 */
(function () {
  'use strict';

  var _storageKey = 'doorloop_training_progress';
  var _listeners = [];

  /* ---------- Core read/write ---------- */

  function getWatchedSet() {
    try {
      var saved = localStorage.getItem(_storageKey);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      return new Set();
    }
  }

  function saveSet(set, source) {
    try {
      localStorage.setItem(_storageKey, JSON.stringify(Array.from(set)));
    } catch (e) { /* quota or private browsing — silent */ }

    // Dispatch same-page event so hub ↔ widget can react without polling
    window.dispatchEvent(new CustomEvent('doorloop:progressChanged', {
      detail: {
        completedVideoIds: Array.from(set),
        source: source || 'unknown',
      },
    }));
  }

  /* ---------- Convenience helpers ---------- */

  function isWatched(videoId) {
    return getWatchedSet().has(videoId);
  }

  function markWatched(videoId, source) {
    var set = getWatchedSet();
    if (set.has(videoId)) return;
    set.add(videoId);
    saveSet(set, source);
    _notifyListeners();
  }

  function unmark(videoId, source) {
    var set = getWatchedSet();
    if (!set.has(videoId)) return;
    set.delete(videoId);
    saveSet(set, source);
    _notifyListeners();
  }

  function getAll() {
    return Array.from(getWatchedSet());
  }

  /* ---------- Change listeners ---------- */

  function onUpdate(callback) {
    if (typeof callback === 'function') _listeners.push(callback);
  }

  function _notifyListeners() {
    var set = getWatchedSet();
    _listeners.forEach(function (fn) {
      try { fn(set); } catch (e) { /* silent */ }
    });
  }

  /* ---------- Cross-tab sync ---------- */

  window.addEventListener('storage', function (e) {
    if (e.key === _storageKey) {
      _notifyListeners();
    }
  });

  /* ---------- Same-page sync (from the other component) ---------- */
  // Listeners registered via onUpdate() will fire from the saveSet() call,
  // but cross-component listeners (hub listening to widget or vice versa)
  // need to subscribe with their own `doorloop:progressChanged` handler
  // and filter by source !== their own name.

  /* ---------- Public API ---------- */

  window.DoorLoopProgress = {
    getWatchedSet: getWatchedSet,
    isWatched: isWatched,
    markWatched: markWatched,
    unmark: unmark,
    getAll: getAll,
    load: getWatchedSet,
    save: saveSet,
    onUpdate: onUpdate,
    setStorageKey: function (key) { _storageKey = key; },
    get STORAGE_KEY() { return _storageKey; },
  };
})();
