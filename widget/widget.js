/**
 * ============================================================
 *  DoorLoop In-App Help Widget v3.0
 * ============================================================
 *  A standalone help sidebar for the DoorLoop app.
 *  Two tabs: "For You" (smart recommendations) and "Modules"
 *  (browse all content with inline article/tour CTAs per video).
 *
 *  INSTALLATION (two tags):
 *    <link rel="stylesheet" href="widget/widget.css">
 *    <script src="widget/widget.js" defer></script>
 *
 *  PREREQUISITES (loaded before this script):
 *    - data/training-data.js   (window.DOORLOOP_TRAINING_DATA)
 *    - shared/progress.js      (window.DoorLoopProgress)
 *    - shared/intercom.js      (window.DoorLoopIntercom)
 *
 *  DATA SOURCE OVERRIDE:
 *    <script src="widget.js" data-url="https://cdn.example.com/data.json" defer></script>
 *    — or —  window.DOORLOOP_DATA_URL = 'https://...';
 * ============================================================
 */
(function () {
  'use strict';

  /* -------------------------------------------------------
     1. DATA & STATE
     ------------------------------------------------------- */
  var CONTENT = {};
  var PAGE_ALIASES = {};
  var MODULES = [];
  var DATA_LOADED = false;

  var Progress = window.DoorLoopProgress || null;
  var IntercomHelper = window.DoorLoopIntercom || null;
  var Analytics = window.DoorLoopAnalytics || null;

  /* -------------------------------------------------------
     WISTIA THUMBNAIL CACHE
     In-memory cache so each wistiaId is fetched at most once
     per page session across all renderContent / filter cycles.
     ------------------------------------------------------- */
  var _thumbCache = {};  // wistiaId → thumbnail URL (or null on failure)

  /**
   * Returns a promise that resolves to a thumbnail URL string or null.
   * Caches the result so subsequent calls for the same ID are instant.
   */
  function fetchWidgetThumb(wistiaId) {
    if (!wistiaId || wistiaId.indexOf('WISTIA_ID') === 0) {
      return Promise.resolve(null);
    }
    if (_thumbCache.hasOwnProperty(wistiaId)) {
      return Promise.resolve(_thumbCache[wistiaId]);
    }
    var url = 'https://fast.wistia.com/oembed?url=https://home.wistia.com/medias/' +
      encodeURIComponent(wistiaId) + '&image_crop_resized=320x180';
    return fetch(url)
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) {
        var thumb = (data && data.thumbnail_url) || null;
        _thumbCache[wistiaId] = thumb;
        return thumb;
      })
      .catch(function () {
        _thumbCache[wistiaId] = null;
        return null;
      });
  }

  /**
   * Populates thumbnail images on all visible .dlhw-card elements that
   * have a data-wistia attribute.  Skips cards whose image is already set.
   */
  function loadWidgetThumbnails() {
    var cards = document.querySelectorAll('.dlhw-card[data-wistia]');
    cards.forEach(function (card) {
      var wid = card.getAttribute('data-wistia');
      if (!wid) return;
      var img = card.querySelector('.dlhw-thumb-img');
      if (!img) return;
      if (img.src) return;  // already populated
      fetchWidgetThumb(wid).then(function (thumbUrl) {
        if (!thumbUrl) return;
        img.src = thumbUrl;
        img.classList.add('dlhw-thumb-loaded');
      });
    });
  }

  /* -------------------------------------------------------
     PROGRESS HELPERS (delegate to shared module)
     ------------------------------------------------------- */
  function getWatchedSet() {
    return Progress ? Progress.getWatchedSet() : new Set();
  }

  function isVideoWatched(videoId) {
    return Progress ? Progress.isWatched(videoId) : false;
  }

  function markVideoWatched(videoId) {
    if (Progress) {
      Progress.markWatched(videoId, 'widget');
    }

    // Analytics: video completed + milestone checks
    if (Analytics) {
      var video = null;
      var parentMod = null;
      for (var mi = 0; mi < MODULES.length; mi++) {
        for (var vi = 0; vi < MODULES[mi].videos.length; vi++) {
          if (MODULES[mi].videos[vi].id === videoId) {
            video = MODULES[mi].videos[vi];
            parentMod = MODULES[mi];
            break;
          }
        }
        if (video) break;
      }
      if (video) {
        var watched = getWatchedSet();
        var totalVideos = 0;
        MODULES.forEach(function (m) { totalVideos += m.videos.length; });
        var pct = totalVideos > 0 ? Math.round((watched.size / totalVideos) * 100) : 0;
        Analytics.videoCompleted('widget', video, parentMod, pct);
        // Module completed?
        if (parentMod) {
          var allDone = parentMod.videos.every(function (v) { return watched.has(v.id); });
          if (allDone) Analytics.moduleCompleted('widget', parentMod, pct);
        }
        // All training completed?
        if (watched.size === totalVideos) {
          Analytics.trainingCompleted('widget', totalVideos);
        }
      }
    }

    renderContent();
  }

  /** Find current module (first not fully watched) and build recommendations */
  function getRecommendations() {
    var watched = getWatchedSet();
    var currentIdx = 0;
    for (var i = 0; i < MODULES.length; i++) {
      var allDone = MODULES[i].videos.length > 0 &&
        MODULES[i].videos.every(function (v) { return watched.has(v.id); });
      if (!allDone) { currentIdx = i; break; }
      if (i === MODULES.length - 1) currentIdx = i;
    }
    var cur = MODULES[currentIdx] || null;
    var nxt = MODULES[currentIdx + 1] || null;
    var curUnwatched = cur ? cur.videos.filter(function (v) { return !watched.has(v.id); }) : [];
    var curWatched = cur ? cur.videos.filter(function (v) { return watched.has(v.id); }).length : 0;
    var totalVideos = 0;
    MODULES.forEach(function (m) { totalVideos += m.videos.length; });
    return {
      currentModule: cur,
      currentIndex: currentIdx,
      nextModule: nxt,
      unwatched: curUnwatched,
      moduleWatched: curWatched,
      moduleTotal: cur ? cur.videos.length : 0,
      overallWatched: watched.size,
      overallTotal: totalVideos,
      allComplete: curUnwatched.length === 0 && currentIdx === MODULES.length - 1,
    };
  }

  /** Detect if widget is loaded inside the Training Hub page */
  function isInsideHub() {
    return !!document.getElementById('modulesContainer');
  }

  /**
   * Resolve the URL for the shared JSON data file.
   */
  function getDataUrl() {
    var scriptEl = document.querySelector('script[src*="widget"]');
    if (scriptEl && scriptEl.getAttribute('data-url')) return scriptEl.getAttribute('data-url');
    if (window.DOORLOOP_DATA_URL) return window.DOORLOOP_DATA_URL;
    return 'doorloop-training-data.json';
  }

  /**
   * Fetch the shared JSON and populate CONTENT, PAGE_ALIASES, MODULES, and CONFIG URLs.
   */
  async function loadSharedData() {
    try {
      var data;
      if (window.DOORLOOP_TRAINING_DATA) {
        data = window.DOORLOOP_TRAINING_DATA;
      } else {
        var res = await fetch(getDataUrl());
        if (!res.ok) throw new Error('HTTP ' + res.status);
        data = await res.json();
      }

      // Build CONTENT from sections (keep full video data including helpUrl/tourId)
      CONTENT = {};
      for (var key in data.sections) {
        if (!data.sections.hasOwnProperty(key)) continue;
        var section = data.sections[key];
        CONTENT[key] = {
          label: section.label,
          icon: section.icon,
          videos: (section.videos || []).map(function (v) {
            return {
              id: v.id, title: v.title, desc: v.desc,
              wistiaId: v.wistiaId, duration: v.duration,
              helpUrl: v.helpUrl || null,
              tourId: v.tourId || null,
              appPath: v.appPath || null,
              isNew: v.isNew || false,
            };
          }),
        };
      }

      // Build MODULES from trainingHub config (include helpUrl/tourId per video)
      if (data.trainingHub && data.trainingHub.modules) {
        MODULES = data.trainingHub.modules.map(function (mod) {
          var videos = [];
          (mod.sections || []).forEach(function (sKey) {
            var s = data.sections[sKey];
            if (!s) return;
            (s.videos || []).forEach(function (v) {
              videos.push({
                id: v.id, title: v.title, desc: v.desc,
                wistiaId: v.wistiaId, duration: v.duration,
                helpUrl: v.helpUrl || null,
                tourId: v.tourId || null,
                appPath: v.appPath || null,
                isNew: v.isNew || false,
              });
            });
          });
          return { id: mod.id, title: mod.title, subtitle: mod.subtitle, icon: mod.icon, videos: videos };
        });
      }

      PAGE_ALIASES = data.pageAliases || {};

      // Override CONFIG URLs from JSON config
      if (data.config) {
        if (data.config.helpCenterUrl) CONFIG.helpCenterUrl = data.config.helpCenterUrl;
        if (data.config.academyUrl)    CONFIG.academyUrl = data.config.academyUrl;
        if (data.config.scheduleUrl)   CONFIG.scheduleUrl = data.config.scheduleUrl;
        if (data.config.storageKey && Progress) Progress.setStorageKey(data.config.storageKey);
      }

      DATA_LOADED = true;
      console.log('[DoorLoop Help Widget] Data loaded successfully.');
    } catch (err) {
      console.error('[DoorLoop Help Widget] Failed to load data:', err);
    }
  }


  /* -------------------------------------------------------
     2. CONFIGURATION
     ------------------------------------------------------- */
  var CONFIG = {
    hideIntercomLauncher: true,
    panelWidth: 380,
    keyboardShortcut: true,
    showPulse: true,
    zBase: 9999,
    helpCenterUrl: 'https://support.doorloop.com/en/',
    academyUrl: 'https://YOUR-SANDBOX-DOMAIN-HERE',
    scheduleUrl: 'https://calendly.com/doorloop-training',
  };


  /* -------------------------------------------------------
     3. HTML TEMPLATE
     ------------------------------------------------------- */
  function buildHTML() {
    return '<button class="dlhw-toggle" id="dlhw-toggle" aria-label="Help &amp; Resources">' +
      (CONFIG.showPulse ? '<span class="dlhw-pulse"></span>' : '') +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' +
    '</button>' +
    '<div class="dlhw-overlay" id="dlhw-overlay"></div>' +
    '<div class="dlhw-panel" id="dlhw-panel">' +
      '<div class="dlhw-hdr">' +
        '<div class="dlhw-hdr-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>' +
        '<div class="dlhw-hdr-txt"><h3>Help &amp; Resources</h3><p id="dlhw-ctx-sub">Loading…</p></div>' +
        '<button class="dlhw-close" id="dlhw-close" aria-label="Close help panel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg></button>' +
      '</div>' +
      '<div class="dlhw-search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input type="text" placeholder="Search training videos…" id="dlhw-search-input"></div>' +
      '<div class="dlhw-search-status" id="dlhw-search-status"></div>' +
      '<div class="dlhw-tabs">' +
        '<button class="dlhw-tab dlhw-active" data-tab="suggested"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> For You</button>' +
        '<button class="dlhw-tab" data-tab="modules"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5"/></svg> Modules</button>' +
      '</div>' +
      '<div class="dlhw-body" id="dlhw-body">' +
        '<div class="dlhw-tcont dlhw-active" id="dlhw-tab-suggested"></div>' +
        '<div class="dlhw-tcont" id="dlhw-tab-modules"></div>' +
      '</div>' +
      '<div class="dlhw-hc-fallback" id="dlhw-hc-fallback"><p>Can\'t find what you\'re looking for?</p><button class="dlhw-hc-btn" id="dlhw-hc-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg> Search Help Center</button></div>' +
      '<div class="dlhw-player" id="dlhw-player">' +
        '<div class="dlhw-phdr"><button class="dlhw-pback" id="dlhw-pback"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg></button><span class="dlhw-ptitle" id="dlhw-ptitle"></span></div>' +
        '<div class="dlhw-pvid" id="dlhw-pvid"></div>' +
        '<div class="dlhw-pdesc" id="dlhw-pdesc"></div>' +
      '</div>' +
      '<div class="dlhw-ftr">' +
        '<a class="dlhw-fbtn dlhw-academy-btn" id="dlhw-academy-btn" href="' + CONFIG.academyUrl + '" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5"/></svg> Training Hub</a>' +
        '<button class="dlhw-fbtn dlhw-primary" id="dlhw-contact"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> Contact Support</button>' +
      '</div>' +
    '</div>';
  }


  /* -------------------------------------------------------
     4. ENGINE
     ------------------------------------------------------- */
  var currentPage = 'dashboard';
  var panelOpen = false;
  var els = {};
  var _suggestedInSearchMode = false;

  function detectPage() {
    var path = window.location.pathname.toLowerCase();
    var segments = path.split('/').filter(Boolean);
    for (var i = segments.length - 1; i >= 0; i--) {
      var seg = segments[i].replace(/[^a-z-]/g, '');
      if (PAGE_ALIASES[seg]) return PAGE_ALIASES[seg];
    }
    var hash = window.location.hash.replace('#', '').replace(/\//g, '').toLowerCase();
    if (PAGE_ALIASES[hash]) return PAGE_ALIASES[hash];
    return 'dashboard';
  }

  /* ---------- SVG icons for inline CTAs ---------- */
  var CTA_ICONS = {
    article: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
    tour: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
  };

  /** Render a video card with inline article/tour CTAs */
  function videoCardHTML(v) {
    var watched = isVideoWatched(v.id);
    var hasArticle = !!v.helpUrl;
    var hasTour = !!v.tourId;

    var html = '<div class="dlhw-card' + (watched ? ' dlhw-watched' : '') + '" onclick="window._dlhwPlayVideo(\'' + v.id + '\')" data-search="' + (v.title + ' ' + v.desc).toLowerCase() + '" data-id="' + v.id + '"' + (v.wistiaId ? ' data-wistia="' + v.wistiaId + '"' : '') + '>' +
      '<div class="dlhw-thumb dlhw-tv">' +
        (v.wistiaId ? '<img class="dlhw-thumb-img" alt="" loading="lazy">' : '') +
        (watched
          ? '<svg class="dlhw-check" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M5 13l4 4L19 7"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="white"><polygon points="8,5 20,12 8,19"/></svg>') +
        (v.duration ? '<span class="dlhw-dur">' + v.duration + '</span>' : '') +
      '</div>' +
      '<div class="dlhw-cinfo">' +
        '<div class="dlhw-ctitle">' + v.title + '</div>' +
        '<div class="dlhw-cdesc">' + v.desc + '</div>' +
        '<div class="dlhw-cmeta">' +
          (watched ? '<span class="dlhw-tag" style="background:#d1fae5;color:#059669">Watched</span>' : '') +
          (v.isNew && !watched ? '<span class="dlhw-tag dlhw-tag-n">New</span>' : '') +
        '</div>';

    // Inline CTAs (article + tour)
    if (hasArticle || hasTour) {
      html += '<div class="dlhw-card-actions">';
      if (hasArticle) {
        html += '<a class="dlhw-card-action" href="#" onclick="event.preventDefault();event.stopPropagation();window._dlhwShowArticle(\'' + v.helpUrl + '\')">' + CTA_ICONS.article + ' Read Article</a>';
      }
      if (hasTour) {
        html += '<a class="dlhw-card-action dlhw-card-action-tour" href="#" onclick="event.preventDefault();event.stopPropagation();window._dlhwStartTour(\'' + v.tourId + '\',\'' + (v.appPath || '') + '\')">' + CTA_ICONS.tour + ' Try It Live</a>';
      }
      html += '</div>';
    }

    html += '</div></div>';
    return html;
  }

  /** Build a collapsible module group header */
  function moduleGroupHTML(mod, openByDefault) {
    if (!mod.videos.length) return '';
    var cls = openByDefault ? ' dlhw-mod-open' : '';
    var watched = getWatchedSet();
    var done = mod.videos.filter(function (v) { return watched.has(v.id); }).length;
    var total = mod.videos.length;
    var allDone = done === total;
    var countBadge = allDone
      ? '<span style="color:#059669">\u2713 ' + done + '/' + total + '</span>'
      : (done > 0 ? done + '/' + total : '' + total);

    return '<div class="dlhw-mod' + cls + '" data-mod="' + mod.id + '">' +
      '<div class="dlhw-mod-hdr" onclick="window._dlhwToggleMod(this)">' +
        '<span class="dlhw-mod-icon">' + (mod.icon || '') + '</span>' +
        '<div class="dlhw-mod-info">' +
          '<div class="dlhw-mod-title">' + mod.title + '</div>' +
          '<div class="dlhw-mod-sub">' + (mod.subtitle || '') + '</div>' +
        '</div>' +
        '<span class="dlhw-mod-count">' + countBadge + '</span>' +
        '<svg class="dlhw-mod-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>' +
      '</div>' +
      '<div class="dlhw-mod-body"><div class="dlhw-mod-body-inner">';
  }

  window._dlhwToggleMod = function (hdr) {
    var mod = hdr.closest('.dlhw-mod');
    if (mod) {
      var wasOpen = mod.classList.contains('dlhw-mod-open');
      mod.classList.toggle('dlhw-mod-open');
      if (!wasOpen && Analytics) {
        Analytics.moduleExpanded('widget', mod.getAttribute('data-mod'), hdr.querySelector('.dlhw-mod-title') ? hdr.querySelector('.dlhw-mod-title').textContent : '');
      }
    }
  };

  /** Render all panel content */
  function renderContent() {
    if (!DATA_LOADED) return;

    if (els.ctxSub) els.ctxSub.textContent = 'Help & Training';

    var inHub = isInsideHub();

    // ---------- "For You" tab ----------
    var sugHTML = '<div class="dlhw-sec"><div class="dlhw-sec-t">Quick Actions</div>' +
      '<div class="dlhw-qa">' +
        '<div class="dlhw-qa-btn" onclick="window._dlhwOpenIntercom()">' +
          '<div class="dlhw-qa-icon" style="background:#ede9fe;color:#7c3aed"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></div><span>Chat with Us</span>' +
        '</div>' +
        '<div class="dlhw-qa-btn" onclick="if(window.DoorLoopAnalytics)window.DoorLoopAnalytics.helpCenterOpened(\'widget\');window.open(\'' + CONFIG.helpCenterUrl + '\',\'_blank\')">' +
          '<div class="dlhw-qa-icon" style="background:#e8f0fe;color:#1665d8"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg></div><span>Help Center</span>' +
        '</div>';

    // Only show Training Hub in quick actions if NOT inside the hub
    if (!inHub) {
      sugHTML +=
        '<div class="dlhw-qa-btn" onclick="if(window.DoorLoopAnalytics)window.DoorLoopAnalytics.fullAcademyOpened(\'widget\');window.open(\'' + CONFIG.academyUrl + '\',\'_blank\')">' +
          '<div class="dlhw-qa-icon" style="background:#d1fae5;color:#10b981"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5"/></svg></div><span>Training Hub</span>' +
        '</div>';
    }

    sugHTML += '</div></div>';

    // Smart "For You" based on progress
    var rec = getRecommendations();
    if (rec.allComplete && rec.overallTotal > 0) {
      sugHTML += '<div class="dlhw-congrats"><div class="dlhw-congrats-icon">\uD83C\uDF89</div><div class="dlhw-congrats-title">All Training Complete!</div><div class="dlhw-congrats-sub">You\'ve watched all ' + rec.overallTotal + ' videos. Great job!</div></div>';
    } else if (rec.currentModule) {
      var overallPct = rec.overallTotal > 0 ? Math.round((rec.overallWatched / rec.overallTotal) * 100) : 0;
      sugHTML += '<div class="dlhw-prog">' +
        '<div class="dlhw-prog-heading">Your Learning Progress</div>' +
        '<div class="dlhw-prog-bar"><div class="dlhw-prog-fill" style="width:' + overallPct + '%"></div></div>' +
        '<div class="dlhw-prog-txt">' + rec.overallWatched + ' of ' + rec.overallTotal + ' videos completed (' + overallPct + '%)</div>' +
        '<div class="dlhw-prog-current">' +
          '<span class="dlhw-prog-icon">' + (rec.currentModule.icon || '\uD83D\uDCD8') + '</span>' +
          '<span>Current: <strong>' + rec.currentModule.title + '</strong> — ' + rec.moduleWatched + '/' + rec.moduleTotal + ' done</span>' +
        '</div>' +
        '<a class="dlhw-prog-link" href="#" onclick="event.preventDefault();window._dlhwViewAllModules()">View All Modules \u2192</a>' +
      '</div>';

      if (rec.unwatched.length) {
        sugHTML += '<div class="dlhw-sec"><div class="dlhw-sec-t">Continue: ' + rec.currentModule.title + '</div>';
        rec.unwatched.forEach(function (v) { sugHTML += videoCardHTML(v); });
        sugHTML += '</div>';
      }

      if (rec.nextModule && rec.nextModule.videos.length) {
        sugHTML += '<div class="dlhw-sec"><div class="dlhw-sec-t">Up Next: ' + rec.nextModule.title + '</div>';
        rec.nextModule.videos.slice(0, 3).forEach(function (v) { sugHTML += videoCardHTML(v); });
        if (rec.nextModule.videos.length > 3) {
          sugHTML += '<div class="dlhw-more-link"><a href="#" onclick="event.preventDefault();window._dlhwGoToModule(\'' + rec.nextModule.id + '\')">+' + (rec.nextModule.videos.length - 3) + ' more videos \u2192</a></div>';
        }
        sugHTML += '</div>';
      }
    }
    els.tabSuggested.innerHTML = sugHTML;

    // ---------- Modules tab ----------
    var mHTML = '';
    MODULES.forEach(function (mod, i) {
      if (!mod.videos.length) return;
      mHTML += moduleGroupHTML(mod, i === 0);
      mod.videos.forEach(function (v) { mHTML += videoCardHTML(v); });
      mHTML += '</div></div></div>';
    });
    if (!mHTML) mHTML = '<div class="dlhw-empty"><p>No training modules available yet.</p></div>';
    els.tabModules.innerHTML = mHTML;

    // Hide/show Training Hub footer button based on hub context
    if (els.academyBtn) {
      els.academyBtn.style.display = inHub ? 'none' : '';
    }

    // Async-populate Wistia thumbnails for all rendered cards
    loadWidgetThumbnails();
  }

  function toggle() {
    panelOpen = !panelOpen;
    els.panel.classList.toggle('dlhw-open', panelOpen);
    els.overlay.classList.toggle('dlhw-open', panelOpen);
    els.toggleBtn.classList.toggle('dlhw-hidden', panelOpen);
    if (panelOpen) {
      if (Analytics) Analytics.widgetOpened();
      var pulse = els.toggleBtn.querySelector('.dlhw-pulse');
      if (pulse) pulse.remove();
      var detected = detectPage();
      if (detected !== currentPage) { currentPage = detected; renderContent(); }
    } else {
      if (Analytics) Analytics.widgetClosed();
    }
    if (!panelOpen) closePlayer();
  }

  function switchTab(tabId) {
    document.querySelectorAll('.dlhw-tab').forEach(function (t) { t.classList.toggle('dlhw-active', t.dataset.tab === tabId); });
    document.querySelectorAll('.dlhw-tcont').forEach(function (c) { c.classList.toggle('dlhw-active', c.id === 'dlhw-tab-' + tabId); });
    if (Analytics) Analytics.tabSwitched('widget', tabId);
  }

  function filterContent() {
    var q = els.searchInput.value.toLowerCase().trim();
    var visibleCount = 0;

    // --- "For You" tab: replace with full-library search results when query is active ---
    if (q) {
      // Build a flat list of all matching videos from the full MODULES array
      var matchHTML = '';
      MODULES.forEach(function (mod) {
        mod.videos.forEach(function (v) {
          var text = (v.title + ' ' + v.desc).toLowerCase();
          if (text.includes(q)) {
            matchHTML += videoCardHTML(v);
          }
        });
      });
      els.tabSuggested.innerHTML = matchHTML
        ? '<div class="dlhw-sec dlhw-search-results">' + matchHTML + '</div>'
        : '<div class="dlhw-search-results"></div>';
      _suggestedInSearchMode = true;
      // Populate thumbnails for freshly-rendered search results
      loadWidgetThumbnails();
    } else if (_suggestedInSearchMode) {
      // Query cleared — restore the normal curated "For You" view
      renderContent();
      _suggestedInSearchMode = false;
    }

    // Filter individual cards (covers both tabs after any innerHTML replacement above)
    document.querySelectorAll('.dlhw-card').forEach(function (card) {
      var text = card.getAttribute('data-search') || '';
      var show = !q || text.includes(q);
      card.style.display = show ? '' : 'none';
      if (show) visibleCount++;
    });

    // Hide module accordions with no visible cards
    document.querySelectorAll('.dlhw-mod').forEach(function (mod) {
      var hasVisible = mod.querySelectorAll('.dlhw-card:not([style*="display: none"])').length > 0;
      mod.style.display = hasVisible ? '' : 'none';
      if (q && hasVisible) {
        mod.classList.add('dlhw-mod-open');
      } else if (!q) {
        var parent = mod.parentNode;
        var siblings = parent ? parent.querySelectorAll('.dlhw-mod') : [];
        var isFirst = false;
        for (var s = 0; s < siblings.length; s++) {
          if (siblings[s].style.display !== 'none') { isFirst = (siblings[s] === mod); break; }
        }
        if (isFirst) mod.classList.add('dlhw-mod-open');
        else mod.classList.remove('dlhw-mod-open');
      }
    });

    // Hide section wrappers (.dlhw-sec) that have no visible cards inside them
    document.querySelectorAll('.dlhw-sec').forEach(function (sec) {
      var hasVisible = sec.querySelectorAll('.dlhw-card:not([style*="display: none"])').length > 0;
      sec.style.display = (q && !hasVisible) ? 'none' : '';
    });

    // Hide progress card, quick actions, and non-card elements when searching
    document.querySelectorAll('.dlhw-prog, .dlhw-congrats, .dlhw-more-link').forEach(function (el) {
      el.style.display = q ? 'none' : '';
    });
    if (els.tabSuggested) {
      var qaEl = els.tabSuggested.querySelector('.dlhw-qa');
      if (qaEl) qaEl.style.display = q ? 'none' : '';
    }

    // Update inline search status near search bar
    if (els.searchStatus) {
      if (!q) {
        els.searchStatus.style.display = 'none';
        els.searchStatus.innerHTML = '';
      } else if (visibleCount === 0) {
        els.searchStatus.style.display = '';
        els.searchStatus.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg> No results for \u201c' + els.searchInput.value.trim() + '\u201d';
        els.searchStatus.className = 'dlhw-search-status dlhw-search-empty';
      } else {
        els.searchStatus.style.display = '';
        els.searchStatus.innerHTML = visibleCount + ' result' + (visibleCount !== 1 ? 's' : '') + ' found';
        els.searchStatus.className = 'dlhw-search-status dlhw-search-found';
      }
    }

    // Bottom fallback
    if (els.hcFallback) {
      els.hcFallback.classList.toggle('dlhw-no-results', q && visibleCount === 0);
    }

    // Analytics: search performed (debounced via the input event)
    if (q && Analytics) Analytics.searchPerformed('widget', q, visibleCount);
  }

  /* ---------- Video player ---------- */
  var _currentPlayingVideo = null;

  window._dlhwPlayVideo = function (videoId) {
    var video = null;
    var parentMod = null;
    for (var key in CONTENT) {
      if (!CONTENT.hasOwnProperty(key)) continue;
      video = CONTENT[key].videos.find(function (v) { return v.id === videoId; });
      if (video) break;
    }
    if (!video) return;

    // Find parent module for analytics
    for (var mi = 0; mi < MODULES.length; mi++) {
      if (MODULES[mi].videos.some(function (v) { return v.id === videoId; })) {
        parentMod = MODULES[mi];
        break;
      }
    }

    // Analytics: video started + module started
    if (Analytics) {
      var watched = getWatchedSet();
      var totalVideos = 0;
      MODULES.forEach(function (m) { totalVideos += m.videos.length; });
      var pct = totalVideos > 0 ? Math.round((watched.size / totalVideos) * 100) : 0;
      if (parentMod && !parentMod.videos.some(function (v) { return watched.has(v.id); })) {
        Analytics.moduleStarted('widget', parentMod, pct);
      }
      Analytics.videoStarted('widget', video, parentMod, pct);
    }

    _currentPlayingVideo = video;
    els.playerTitle.textContent = video.title;
    els.playerVid.innerHTML = '<iframe src="https://fast.wistia.net/embed/iframe/' + video.wistiaId + '?autoPlay=true&controlsVisibleOnLoad=true" allow="autoplay; fullscreen" allowfullscreen></iframe>';

    var alreadyWatched = isVideoWatched(videoId);

    // Build player description with inline CTAs
    var descHTML = '<h4>' + video.title + '</h4><p>' + video.desc + '</p>';
    descHTML += alreadyWatched
      ? '<div class="dlhw-mark-row"><span class="dlhw-mark-done">\u2713 Watched</span></div>'
      : '<div class="dlhw-mark-row"><button class="dlhw-mark-btn" onclick="window._dlhwMarkWatched()">\u2713 Mark as Watched</button></div>';

    // Show article/tour links in player too
    if (video.helpUrl || video.tourId) {
      descHTML += '<div class="dlhw-player-actions">';
      if (video.helpUrl) {
        descHTML += '<a class="dlhw-player-action" href="#" onclick="event.preventDefault();window._dlhwShowArticle(\'' + video.helpUrl + '\')">' + CTA_ICONS.article + ' Read Article</a>';
      }
      if (video.tourId) {
        descHTML += '<a class="dlhw-player-action dlhw-player-action-tour" href="#" onclick="event.preventDefault();window._dlhwStartTour(\'' + video.tourId + '\',\'' + (video.appPath || '') + '\')">' + CTA_ICONS.tour + ' Try It Live</a>';
      }
      descHTML += '</div>';
    }

    els.playerDesc.innerHTML = descHTML;
    els.player.classList.add('dlhw-active');
  };

  window._dlhwMarkWatched = function () {
    if (!_currentPlayingVideo) return;
    markVideoWatched(_currentPlayingVideo.id);
    var row = document.querySelector('.dlhw-mark-row');
    if (row) row.innerHTML = '<span class="dlhw-mark-done">\u2713 Watched</span>';
  };

  window._dlhwShowArticle = function (url) {
    if (Analytics) Analytics.helpArticleOpened('widget', url);
    if (IntercomHelper) {
      IntercomHelper.showArticle(url);
    } else {
      window.open(url, '_blank');
    }
  };

  window._dlhwStartTour = function (tourId, appPath) {
    if (Analytics) Analytics.tourStarted('widget', tourId, appPath || null);
    if (window.DoorLoopIntercom) {
      window.DoorLoopIntercom.startTour(tourId, appPath);
    } else {
      console.warn('[DoorLoop] Shared intercom helper not loaded.');
    }
  };

  /** Switch to Modules tab */
  window._dlhwViewAllModules = function () {
    switchTab('modules');
    if (els.body) els.body.scrollTop = 0;
  };

  /** Switch to Modules tab and open a specific module accordion */
  window._dlhwGoToModule = function (modId) {
    switchTab('modules');
    setTimeout(function () {
      var modEl = document.querySelector('.dlhw-mod[data-mod="' + modId + '"]');
      if (modEl) {
        modEl.classList.add('dlhw-mod-open');
        modEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  window._dlhwOpenIntercom = function () {
    if (Analytics) Analytics.chatOpened('widget');
    /* Close the widget panel first (if open) */
    if (panelOpen) {
      panelOpen = false;
      els.panel.classList.remove('dlhw-open');
      els.overlay.classList.remove('dlhw-open');
      els.toggleBtn.classList.remove('dlhw-hidden');
      closePlayer();
    }
    /* Open Intercom in new-message mode */
    if (IntercomHelper) {
      IntercomHelper.openMessenger();
    } else if (window.Intercom) {
      window.Intercom('showNewMessage');
    } else {
      window.open('https://support.doorloop.com', '_blank');
    }
  };

  function closePlayer() {
    els.player.classList.remove('dlhw-active');
    els.playerVid.innerHTML = '';
    _currentPlayingVideo = null;
  }


  /* -------------------------------------------------------
     5. INITIALIZATION
     ------------------------------------------------------- */
  async function init() {
    await loadSharedData();

    // Inject HTML
    var wrapper = document.createElement('div');
    wrapper.id = 'dlhw-root';
    wrapper.innerHTML = buildHTML();
    document.body.appendChild(wrapper);

    // Cache element references
    els = {
      toggleBtn: document.getElementById('dlhw-toggle'),
      overlay: document.getElementById('dlhw-overlay'),
      panel: document.getElementById('dlhw-panel'),
      closeBtn: document.getElementById('dlhw-close'),
      searchInput: document.getElementById('dlhw-search-input'),
      ctxSub: document.getElementById('dlhw-ctx-sub'),
      tabSuggested: document.getElementById('dlhw-tab-suggested'),
      tabModules: document.getElementById('dlhw-tab-modules'),
      player: document.getElementById('dlhw-player'),
      playerTitle: document.getElementById('dlhw-ptitle'),
      playerVid: document.getElementById('dlhw-pvid'),
      playerDesc: document.getElementById('dlhw-pdesc'),
      contactBtn: document.getElementById('dlhw-contact'),
      academyBtn: document.getElementById('dlhw-academy-btn'),
      hcFallback: document.getElementById('dlhw-hc-fallback'),
      hcBtn: document.getElementById('dlhw-hc-btn'),
      searchStatus: document.getElementById('dlhw-search-status'),
      body: document.getElementById('dlhw-body'),
    };

    renderContent();

    // Event listeners
    els.toggleBtn.addEventListener('click', toggle);
    els.closeBtn.addEventListener('click', toggle);
    els.overlay.addEventListener('click', toggle);
    els.searchInput.addEventListener('input', filterContent);
    els.contactBtn.addEventListener('click', function () { window._dlhwOpenIntercom(); });
    els.hcBtn.addEventListener('click', function () {
      var query = els.searchInput.value.trim();
      if (Analytics) Analytics.helpCenterOpened('widget', query);
      var url = 'https://support.doorloop.com/en/';
      if (query) url += '?q=' + encodeURIComponent(query);
      window.open(url, '_blank');
    });
    document.getElementById('dlhw-pback').addEventListener('click', closePlayer);
    if (els.academyBtn) {
      els.academyBtn.addEventListener('click', function () {
        if (Analytics) Analytics.fullAcademyOpened('widget');
      });
    }

    document.querySelectorAll('.dlhw-tab').forEach(function (tab) {
      tab.addEventListener('click', function () { switchTab(this.dataset.tab); });
    });

    // Keyboard shortcuts
    if (CONFIG.keyboardShortcut) {
      document.addEventListener('keydown', function (e) {
        if (e.key === '?' && !e.target.matches('input,textarea,select,[contenteditable]')) { e.preventDefault(); toggle(); }
        if (e.key === 'Escape' && panelOpen) toggle();
      });
    }

    // Cross-tab + same-page sync via shared progress module
    if (Progress) {
      Progress.onUpdate(function () { renderContent(); });
    }
    window.addEventListener('doorloop:progressChanged', function (e) {
      if (e.detail && e.detail.source !== 'widget') { renderContent(); }
    });

    // Hide Intercom launcher
    if (CONFIG.hideIntercomLauncher && IntercomHelper) {
      IntercomHelper.hideLauncher();
      var attempts = 0;
      var poll = setInterval(function () {
        IntercomHelper.hideLauncher();
        if (++attempts > 30) clearInterval(poll);
      }, 1000);
    }

    console.log('[DoorLoop Help Widget] Initialized. Press ? to toggle.');
  }


  /* -------------------------------------------------------
     6. PUBLIC API
     ------------------------------------------------------- */
  window.DoorLoopHelpWidget = {
    open: function () { if (!panelOpen) toggle(); },
    close: function () { if (panelOpen) toggle(); },
    toggle: toggle,
    setPage: function (pageKey) { if (CONTENT[pageKey]) { currentPage = pageKey; renderContent(); } },
    addContent: function (pageKey, type, items) {
      if (!CONTENT[pageKey] || !CONTENT[pageKey][type]) return;
      CONTENT[pageKey][type].push.apply(CONTENT[pageKey][type], items);
      renderContent();
    },
    refresh: function () { var p = detectPage(); if (p !== currentPage) { currentPage = p; renderContent(); } },
    reloadData: async function () { await loadSharedData(); renderContent(); },
  };


  /* -------------------------------------------------------
     7. BOOT
     ------------------------------------------------------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(); });
  } else {
    init();
  }

})();
