/**
 * ============================================================
 *  DoorLoop Training — Shared PostHog Analytics
 * ============================================================
 *  Centralised tracking layer so both the Training Hub and
 *  Help Widget fire the same event schema to PostHog.
 *
 *  USAGE:
 *    <script src="shared/analytics.js"></script>
 *    // Then use window.DoorLoopAnalytics.*
 *
 *  All methods are safe to call even when PostHog hasn't loaded
 *  or failed to initialise — every public call is wrapped in a
 *  try/catch so it will never throw.
 *
 *  EVENT CATALOGUE (all prefixed "training_hub_"):
 *  ─────────────────────────────────────────────────────────
 *  training_hub_page_viewed           Page load / first paint
 *  training_hub_video_started         User opens a video player
 *  training_hub_video_completed       Video marked as watched
 *  training_hub_video_unmarked        User un-marks a completed video
 *  training_hub_module_started        First video started in a module
 *  training_hub_module_completed      All videos in a module watched
 *  training_hub_training_completed    100 % overall completion
 *  training_hub_widget_opened         Help widget panel opened
 *  training_hub_widget_closed         Help widget panel closed
 *  training_hub_tab_switched          For You ↔ Modules tab change
 *  training_hub_module_expanded       Accordion opened in Modules tab
 *  training_hub_search_performed      User types in the search bar
 *  training_hub_help_article_opened   "Read Article" CTA clicked
 *  training_hub_tour_started          "Try It Live" / tour CTA clicked
 *  training_hub_chat_opened           Chat with Us / Contact Support
 *  training_hub_schedule_training     Schedule Training quick action
 *  training_hub_help_center_opened    Help Center quick action / fallback
 *  training_hub_full_academy_opened   Full Academy link clicked
 *  ─────────────────────────────────────────────────────────
 *
 *  COMMON PROPERTIES ON EVERY EVENT:
 *    source    – "hub" or "widget" (which JS file fired it)
 *    component – "training_hub" or "help_widget" (friendly label)
 * ============================================================
 */
(function () {
  'use strict';

  /* ---------- internal helpers ---------- */

  /** Event name prefix applied to every event */
  var PREFIX = 'training_hub_';

  /** Map source shorthand → human-readable component name */
  var COMPONENT_MAP = {
    hub:    'training_hub',
    widget: 'help_widget',
  };

  function ph() {
    try { return window.posthog; } catch (e) { return null; }
  }

  function capture(event, props) {
    try {
      var p = ph();
      if (p && typeof p.capture === 'function') {
        p.capture(PREFIX + event, props || {});
      }
    } catch (e) {
      /* PostHog unavailable — silently ignore */
    }
  }

  /**
   * Build the common property bag that goes on every event.
   * Callers pass `source` ("hub" | "widget") and optional overrides.
   */
  function baseProps(source, overrides) {
    var props = {
      source: source || 'unknown',
      component: COMPONENT_MAP[source] || source || 'unknown',
    };
    if (overrides) {
      for (var k in overrides) {
        if (overrides.hasOwnProperty(k)) props[k] = overrides[k];
      }
    }
    return props;
  }

  /* ==========================================================
     PUBLIC API  —  every method is wrapped in try/catch so
     callers never need to worry about PostHog being absent.
     ========================================================== */

  var Analytics = {

    /* ---------- page-level ---------- */

    /** Fire once when the Training Hub page finishes loading. */
    trainingHubViewed: function (totalVideos, completedVideos) {
      try {
        capture('page_viewed', baseProps('hub', {
          total_videos: totalVideos,
          completed_videos: completedVideos,
          percent_complete: totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0,
        }));
      } catch (e) { /* safe */ }
    },

    /* ---------- video engagement ---------- */

    videoStarted: function (source, video, module, progress) {
      try {
        capture('video_started', baseProps(source, {
          video_id: video.id,
          video_title: video.title,
          module_id: module ? module.id : null,
          module_title: module ? module.title : null,
          percent_complete: progress || 0,
        }));
      } catch (e) { /* safe */ }
    },

    videoCompleted: function (source, video, module, progress) {
      try {
        capture('video_completed', baseProps(source, {
          video_id: video.id,
          video_title: video.title,
          module_id: module ? module.id : null,
          module_title: module ? module.title : null,
          percent_complete: progress || 0,
        }));
      } catch (e) { /* safe */ }
    },

    videoUnmarked: function (source, video, module, progress) {
      try {
        capture('video_unmarked', baseProps(source, {
          video_id: video.id,
          video_title: video.title,
          module_id: module ? module.id : null,
          module_title: module ? module.title : null,
          percent_complete: progress || 0,
        }));
      } catch (e) { /* safe */ }
    },

    /* ---------- module milestones ---------- */

    moduleStarted: function (source, module, progress) {
      try {
        capture('module_started', baseProps(source, {
          module_id: module.id,
          module_title: module.title,
          percent_complete: progress || 0,
        }));
      } catch (e) { /* safe */ }
    },

    moduleCompleted: function (source, module, progress) {
      try {
        capture('module_completed', baseProps(source, {
          module_id: module.id,
          module_title: module.title,
          percent_complete: progress || 0,
        }));
      } catch (e) { /* safe */ }
    },

    trainingCompleted: function (source, totalVideos) {
      try {
        capture('training_completed', baseProps(source, {
          total_videos: totalVideos,
        }));
      } catch (e) { /* safe */ }
    },

    /* ---------- widget interactions ---------- */

    widgetOpened: function () {
      try { capture('widget_opened', baseProps('widget')); } catch (e) { /* safe */ }
    },

    widgetClosed: function () {
      try { capture('widget_closed', baseProps('widget')); } catch (e) { /* safe */ }
    },

    tabSwitched: function (source, tabName) {
      try {
        capture('tab_switched', baseProps(source, {
          tab: tabName,
        }));
      } catch (e) { /* safe */ }
    },

    moduleExpanded: function (source, moduleId, moduleTitle) {
      try {
        capture('module_expanded', baseProps(source, {
          module_id: moduleId,
          module_title: moduleTitle,
        }));
      } catch (e) { /* safe */ }
    },

    /* ---------- search ---------- */

    searchPerformed: function (source, query, resultCount) {
      try {
        capture('search_performed', baseProps(source, {
          query: query,
          result_count: resultCount,
        }));
      } catch (e) { /* safe */ }
    },

    /* ---------- support & resource interactions ---------- */

    helpArticleOpened: function (source, articleUrl, videoTitle) {
      try {
        capture('help_article_opened', baseProps(source, {
          article_url: articleUrl,
          video_title: videoTitle || null,
        }));
      } catch (e) { /* safe */ }
    },

    tourStarted: function (source, tourId, appPath) {
      try {
        capture('tour_started', baseProps(source, {
          tour_id: tourId,
          app_path: appPath || null,
        }));
      } catch (e) { /* safe */ }
    },

    chatOpened: function (source) {
      try { capture('chat_opened', baseProps(source)); } catch (e) { /* safe */ }
    },

    scheduleTrainingClicked: function (source) {
      try { capture('schedule_training', baseProps(source)); } catch (e) { /* safe */ }
    },

    helpCenterOpened: function (source, query) {
      try {
        capture('help_center_opened', baseProps(source, {
          query: query || null,
        }));
      } catch (e) { /* safe */ }
    },

    fullAcademyOpened: function (source) {
      try { capture('full_academy_opened', baseProps(source)); } catch (e) { /* safe */ }
    },
  };

  /* ---------- Expose globally ---------- */
  window.DoorLoopAnalytics = Analytics;

})();
