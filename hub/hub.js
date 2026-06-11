/* =================================================================
   DOORLOOP TRAINING HUB — Configuration & Engine
   =================================================================
   HOW TO CONFIGURE:
   1. Replace wistiaId values with your actual Wistia video IDs
   2. Replace helpUrl values with your support.doorloop.com article URLs
   3. Replace tourId values with your Intercom product tour IDs
   4. Replace appPath values with the in-app path for each feature
   5. The system handles everything else automatically

   DEPENDENCIES (load before this script):
     ../shared/progress.js   → window.DoorLoopProgress
     ../shared/intercom.js   → window.DoorLoopIntercom
     ../data/training-data.js OR training-data.json via fetch
   ================================================================= */

/* ========== SHARED MODULE REFERENCES ========== */
var Progress = window.DoorLoopProgress || null;
var IntercomHelper = window.DoorLoopIntercom || null;
var Analytics = window.DoorLoopAnalytics || null;

/* ========== DATA SOURCE ========== */
/**
 * Resolves the URL of the shared JSON data file.
 * Priority: 1) ?dataUrl= query param  2) window.DOORLOOP_DATA_URL  3) same-directory default
 */
function getDataUrl() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('dataUrl')) return params.get('dataUrl');
  if (window.DOORLOOP_DATA_URL) return window.DOORLOOP_DATA_URL;
  return 'doorloop-training-data.json';
}

let MODULES = [];
let DATA = null;

/* ========== WISTIA THUMBNAIL FETCHER ========== */
/**
 * Fetches the real thumbnail URL for a Wistia video via the oEmbed API.
 * Returns the thumbnail_url string, or null if the fetch fails or the ID
 * looks like a placeholder (not yet a real hash).
 */
async function fetchWistiaThumbnail(wistiaId) {
  if (!wistiaId || wistiaId.startsWith('WISTIA_ID')) return null;
  try {
    const url = `https://fast.wistia.com/oembed?url=https://home.wistia.com/medias/${encodeURIComponent(wistiaId)}&image_crop_resized=640x360`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data.thumbnail_url || null;
  } catch (e) {
    return null;
  }
}

/**
 * After a batch of video cards has been rendered into the DOM, asynchronously
 * populates each card's thumbnail with the real Wistia image.
 * Falls back silently to the existing gradient placeholder on any failure.
 */
function loadCardThumbnails(videos) {
  videos.forEach(v => {
    const card = document.querySelector(`.video-card[data-video-id="${v.id}"]`);
    if (!card) return;
    const thumbInner = card.querySelector('.video-thumb-inner');
    if (!thumbInner) return;
    fetchWistiaThumbnail(v.wistiaId).then(thumbnailUrl => {
      if (!thumbnailUrl) return;
      const img = document.createElement('img');
      img.src = thumbnailUrl;
      img.alt = v.title;
      img.className = 'video-thumb-img';
      img.loading = 'lazy';
      // Insert behind the play-btn overlay so the controls stay on top
      thumbInner.insertBefore(img, thumbInner.firstChild);
    });
  });
}

/* ========== SVG ICON TEMPLATES ========== */
const ICONS = {
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
  tour: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
};

/* ========== STATE ========== */
let watchedVideos = new Set();
let currentVideoIndex = -1;
let flatVideos = [];
let slugMap = {};  // slug → video id (built after data loads)

/* ========== DEEP-LINK SLUG HELPERS ========== */
/**
 * Converts a video title to a URL-safe slug.
 *   "Welcome to DoorLoop"           → "welcome-to-doorloop"
 *   "Company Information & Branding" → "company-information-branding"
 */
function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')   // non-alphanum → hyphens
    .replace(/^-+|-+$/g, '')        // trim leading/trailing hyphens
    .replace(/-{2,}/g, '-');        // collapse consecutive hyphens
}

/**
 * Builds slugMap (slug→videoId) and attaches a .slug property to each
 * video in flatVideos.  If two titles produce the same slug, appends the
 * parent section key as a suffix to disambiguate.
 */
function buildSlugMap() {
  slugMap = {};
  var seen = {};  // slug → array of video refs (for collision detection)

  flatVideos.forEach(function (v) {
    var base = slugify(v.title);
    if (!seen[base]) seen[base] = [];
    seen[base].push(v);
  });

  // Assign final slugs — disambiguate collisions with moduleId suffix
  Object.keys(seen).forEach(function (base) {
    var list = seen[base];
    if (list.length === 1) {
      list[0].slug = base;
      slugMap[base] = list[0].id;
    } else {
      list.forEach(function (v) {
        var disambiguated = base + '--' + v.moduleId;
        v.slug = disambiguated;
        slugMap[disambiguated] = v.id;
      });
    }
  });
}

/**
 * Updates the browser URL bar with the given video slug via replaceState.
 * Does not trigger a page reload.
 */
function setVideoUrlParam(slug) {
  var u = new URL(window.location);
  u.searchParams.set('video', slug);
  history.replaceState(null, '', u);
}

/**
 * Removes the ?video= param from the URL bar via replaceState.
 */
function clearVideoUrlParam() {
  var u = new URL(window.location);
  if (u.searchParams.has('video')) {
    u.searchParams.delete('video');
    history.replaceState(null, '', u.pathname + (u.search || ''));
  }
}

/* ========== MODULE DEEP-LINK HELPERS ========== */
/**
 * Finds the parent module for a given video ID.
 * Returns the module object, or null if not found.
 */
function findModuleForVideo(videoId) {
  return MODULES.find(function (m) {
    return m.videos.some(function (v) { return v.id === videoId; });
  }) || null;
}

/**
 * Updates the browser URL bar with the given module slug via replaceState.
 * Does not trigger a page reload.
 */
function setModuleUrlParam(moduleSlug) {
  var u = new URL(window.location);
  u.searchParams.set('module', moduleSlug);
  history.replaceState(null, '', u);
}

/**
 * Removes the ?module= param from the URL bar via replaceState.
 */
function clearModuleUrlParam() {
  var u = new URL(window.location);
  if (u.searchParams.has('module')) {
    u.searchParams.delete('module');
    history.replaceState(null, '', u.pathname + (u.search || ''));
  }
}

/* ========== INTERCOM HELPERS (delegate to shared module) ========== */
/**
 * Starts an Intercom product tour.
 * Delegates to DoorLoopIntercom.startTour() from shared/intercom.js.
 */
function startProductTour(tourId, appPath) {
  if (Analytics) Analytics.tourStarted('hub', tourId, appPath);
  if (IntercomHelper) {
    IntercomHelper.startTour(tourId, appPath);
  } else {
    console.warn('[TrainingHub] Intercom helper not loaded. Tour ID:', tourId);
  }
}

/**
 * Shows a help center article via Intercom's in-app article viewer.
 * Delegates to DoorLoopIntercom.showArticle() from shared/intercom.js.
 */
function showIntercomArticle(url) {
  if (Analytics) Analytics.helpArticleOpened('hub', url);
  if (IntercomHelper) {
    IntercomHelper.showArticle(url);
  } else {
    window.open(url, '_blank');
  }
}

/* ========== PERSISTENCE (delegates to shared progress module) ========== */
function loadProgress() {
  if (Progress) {
    watchedVideos = Progress.getWatchedSet();
  } else {
    // Fallback if shared module not loaded
    try {
      var saved = localStorage.getItem('doorloop_training_progress');
      if (saved) watchedVideos = new Set(JSON.parse(saved));
    } catch(e) { /* silent */ }
  }
}

function saveProgress() {
  if (Progress) {
    Progress.save(watchedVideos, 'hub');
  } else {
    // Fallback
    try {
      localStorage.setItem('doorloop_training_progress', JSON.stringify([...watchedVideos]));
    } catch(e) { /* silent */ }
    window.dispatchEvent(new CustomEvent('doorloop:progressChanged', {
      detail: { completedVideoIds: [...watchedVideos], source: 'hub' }
    }));
  }

  // API integration hook (hub-specific)
  if (typeof window.onTrainingProgress === 'function') {
    window.onTrainingProgress({
      completedVideoIds: [...watchedVideos],
      totalVideos: flatVideos.length,
      percentComplete: Math.round((watchedVideos.size / flatVideos.length) * 100),
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * API INTEGRATION HOOKS
 * =====================
 *   window.onTrainingProgress = function(data) {
 *     fetch('/api/training/progress', { method: 'POST', ... });
 *   };
 *   window.onVideoComplete = function(videoId, title) {
 *     analytics.track('training_video_completed', { videoId, title });
 *   };
 *
 * INTERCOM INTEGRATION (if this page is embedded inside app.doorloop.com):
 *   The parent page receives postMessage events:
 *     { type: 'doorloop:navigate', path: '/accounting' }
 *     { type: 'doorloop:startTour', tourId: 12345, appPath: '/accounting' }
 *
 *   Handle them in the parent:
 *     window.addEventListener('message', (e) => {
 *       if (e.data.type === 'doorloop:navigate') router.push(e.data.path);
 *       if (e.data.type === 'doorloop:startTour') {
 *         router.push(e.data.appPath);
 *         setTimeout(() => Intercom('startTour', e.data.tourId), 500);
 *       }
 *     });
 */

/* ========== RENDER ========== */
function renderModules() {
  const container = document.getElementById('modulesContainer');
  container.innerHTML = '';

  MODULES.forEach((mod, mi) => {
    const section = document.createElement('div');
    section.className = 'module-section' + (mi === 0 ? ' open' : '');
    section.id = 'mod-' + mod.id;

    const watchedInModule = mod.videos.filter(v => watchedVideos.has(v.id)).length;
    const total = mod.videos.length;
    const pct = total > 0 ? Math.round((watchedInModule / total) * 100) : 0;
    if (watchedInModule === total && total > 0) section.classList.add('completed');

    section.innerHTML = `
      <div class="module-header" onclick="toggleModule('${mod.id}')">
        <div class="module-icon ${mod.iconClass}">${mod.icon}</div>
        <div class="module-title-wrap">
          <div class="module-title">${mod.title}</div>
          <div class="module-subtitle">${mod.subtitle}</div>
        </div>
        <div class="module-completion-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><path d="M20 6 9 17l-5-5"/></svg>
          Complete
        </div>
        <div class="module-progress-mini">
          <div class="mini-bar"><div class="mini-fill" style="width:${pct}%"></div></div>
          <span class="mini-label">${watchedInModule}/${total}</span>
        </div>
        <svg class="module-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
      </div>
      <div class="module-content">
        <div class="video-grid">
          ${mod.videos.map(v => {
            const hasHelp = !!v.helpUrl;
            const hasTour = !!v.tourId;
            return `
            <div class="video-card ${watchedVideos.has(v.id) ? 'watched' : ''}" data-video-id="${v.id}">
              <div class="video-thumb" onclick="openVideo('${v.id}')">
                <div class="video-thumb-inner">
                  <div class="play-btn">
                    <svg viewBox="0 0 24 24" fill="white"><polygon points="8,5 20,12 8,19"/></svg>
                  </div>
                </div>
                <div class="video-duration">${v.duration}</div>
                <div class="video-check">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>
                </div>
              </div>
              <div class="video-info" onclick="openVideo('${v.id}')" style="cursor:pointer">
                <div class="video-title">${v.title}</div>
                <div class="video-desc">${v.desc}</div>
              </div>
              <div class="video-actions">
                ${hasHelp ? `<a class="video-action-link" href="#" onclick="event.preventDefault();event.stopPropagation();showIntercomArticle('${v.helpUrl}')">${ICONS.book} Read Article</a>` : ''}
                ${hasTour ? `<a class="video-action-link tour-link" href="#" onclick="event.preventDefault();event.stopPropagation();startProductTour('${v.tourId}', ${v.appPath ? "'" + v.appPath + "'" : 'null'})">${ICONS.tour} Try It Live</a>` : ''}
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
    `;
    container.appendChild(section);
  });

  updateOverallProgress();

  // Async-populate real Wistia thumbnails for every rendered card
  const allVideos = MODULES.flatMap(mod => mod.videos);
  loadCardThumbnails(allVideos);
}

function updateOverallProgress() {
  const total = flatVideos.length;
  const done = watchedVideos.size;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  document.getElementById('overallPct').textContent = pct + '%';
  document.getElementById('overallLabel').textContent = `${done} of ${total} videos completed`;
  document.getElementById('overallBar').style.width = pct + '%';
  document.getElementById('overallCount').textContent = done;

  const circumference = 2 * Math.PI * 30;
  const offset = circumference - (pct / 100) * circumference;
  document.getElementById('overallRing').style.strokeDashoffset = offset;
}

/* ========== MODULE TOGGLE ========== */
function toggleModule(id) {
  const el = document.getElementById('mod-' + id);
  const wasOpen = el.classList.contains('open');
  el.classList.toggle('open');

  // Update URL: set ?module= when opening, clear when closing
  if (!wasOpen) {
    setModuleUrlParam(slugify(id));
  } else {
    clearModuleUrlParam();
  }

  // Analytics: module expanded (only when opening)
  if (!wasOpen && Analytics) {
    const mod = MODULES.find(m => m.id === id);
    if (mod) Analytics.moduleExpanded('hub', mod.id, mod.title);
  }
}

/* ========== VIDEO MODAL ========== */
function openVideo(videoId) {
  currentVideoIndex = flatVideos.findIndex(v => v.id === videoId);
  if (currentVideoIndex === -1) return;

  // Analytics: video started
  if (Analytics) {
    const v = flatVideos[currentVideoIndex];
    const mod = MODULES.find(m => m.videos.some(mv => mv.id === videoId));
    const pct = flatVideos.length > 0 ? Math.round((watchedVideos.size / flatVideos.length) * 100) : 0;
    // If this is the first video opened in the module, track module_started
    if (mod && !mod.videos.some(mv => watchedVideos.has(mv.id))) {
      Analytics.moduleStarted('hub', mod, pct);
    }
    Analytics.videoStarted('hub', v, mod, pct);
  }

  // Deep-link: update URL so the address bar reflects the current video slug
  var v = flatVideos[currentVideoIndex];
  if (v && v.slug) setVideoUrlParam(v.slug);

  showModal();
}

function showModal() {
  const video = flatVideos[currentVideoIndex];
  const modal = document.getElementById('modal');
  document.getElementById('modalTitle').textContent = video.moduleTitle + ' → ' + video.title;

  // Wistia embed
  const wrap = document.getElementById('modalVideoWrap');
  wrap.innerHTML = `<div class="wistia_embed wistia_async_${video.wistiaId} autoPlay=true" style="position:absolute;inset:0;width:100%;height:100%;"></div>`;

  // Update resource bar links
  const helpLink = document.getElementById('modalHelpLink');
  const tourBtn = document.getElementById('modalTourBtn');

  if (video.helpUrl) {
    helpLink.href = '#';
    helpLink.onclick = (e) => {
      e.preventDefault();
      showIntercomArticle(video.helpUrl);
    };
    helpLink.style.display = 'inline-flex';
  } else {
    helpLink.onclick = null;
    helpLink.style.display = 'none';
  }

  if (video.tourId) {
    tourBtn.style.display = 'inline-flex';
    tourBtn.onclick = (e) => {
      e.preventDefault();
      closeModal();
      startProductTour(video.tourId, video.appPath);
    };
  } else {
    tourBtn.style.display = 'none';
  }

  // Hide resources bar entirely if neither link is present
  document.getElementById('modalResources').style.display =
    (video.helpUrl || video.tourId) ? 'flex' : 'none';

  // Try binding Wistia completion event
  setTimeout(() => {
    if (window.Wistia) {
      const wistiaEmbed = Wistia.api(video.wistiaId);
      if (wistiaEmbed) {
        wistiaEmbed.bind('end', () => {
          markVideoComplete(video.id);
        });
        wistiaEmbed.bind('percentwatchedchanged', (pct) => {
          if (pct >= 0.9 && !watchedVideos.has(video.id)) {
            markVideoComplete(video.id);
          }
        });
      }
    }
  }, 1000);

  updateMarkButton(video.id);
  document.getElementById('modalPrev').disabled = currentVideoIndex === 0;
  document.getElementById('modalNext').disabled = currentVideoIndex === flatVideos.length - 1;

  modal.classList.add('visible');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('modal');
  modal.classList.remove('visible');
  document.body.style.overflow = '';
  document.getElementById('modalVideoWrap').innerHTML = '';

  // Deep-link: replace ?video= with ?module= for the current video's parent
  var cv = flatVideos[currentVideoIndex];
  var parentMod = cv ? findModuleForVideo(cv.id) : null;

  // Build clean URL: drop ?video=, set ?module= if we have a parent module
  var u = new URL(window.location);
  u.searchParams.delete('video');
  if (parentMod) {
    u.searchParams.set('module', slugify(parentMod.id));
  }
  history.replaceState(null, '', u.pathname + (u.search || ''));

  // Ensure the parent module is expanded and scrolled into view
  if (parentMod) {
    var modEl = document.getElementById('mod-' + parentMod.id);
    if (modEl && !modEl.classList.contains('open')) {
      modEl.classList.add('open');
    }
    modEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function updateMarkButton(videoId) {
  const btn = document.getElementById('modalMark');
  const text = document.getElementById('modalMarkText');
  if (watchedVideos.has(videoId)) {
    btn.classList.add('completed');
    text.textContent = 'Completed ✓';
  } else {
    btn.classList.remove('completed');
    text.textContent = 'Mark as Complete';
  }
}

function markVideoComplete(videoId) {
  if (watchedVideos.has(videoId)) return;
  watchedVideos.add(videoId);
  saveProgress();
  renderModules();
  updateMarkButton(videoId);
  const v = flatVideos.find(x => x.id === videoId);
  const pct = flatVideos.length > 0 ? Math.round((watchedVideos.size / flatVideos.length) * 100) : 0;
  const mod = MODULES.find(m => m.videos.some(mv => mv.id === videoId));

  // Analytics: video completed
  if (Analytics && v) {
    Analytics.videoCompleted('hub', v, mod, pct);
  }

  if (typeof window.onVideoComplete === 'function' && v) {
    window.onVideoComplete(videoId, v.title);
  }
  showToast(`"${v ? v.title : 'Video'}" completed!`);
  if (mod) {
    const allDone = mod.videos.every(mv => watchedVideos.has(mv.id));
    if (allDone) {
      // Analytics: module completed
      if (Analytics) Analytics.moduleCompleted('hub', mod, pct);
      setTimeout(() => {
        showToast(`🎉 Module "${mod.title}" complete!`);
        fireConfetti();
      }, 800);
    }
  }
  if (watchedVideos.size === flatVideos.length) {
    // Analytics: all training completed
    if (Analytics) Analytics.trainingCompleted('hub', flatVideos.length);
    setTimeout(() => {
      showToast('🏆 All training complete! You\'re a DoorLoop pro!');
      fireConfetti();
    }, 1600);
  }
}

// Modal button handlers
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});
document.getElementById('modalPrev').addEventListener('click', () => {
  if (currentVideoIndex > 0) {
    var prevModuleId = flatVideos[currentVideoIndex].moduleId;
    currentVideoIndex--;
    showModal();
    var pv = flatVideos[currentVideoIndex];
    if (pv && pv.slug) setVideoUrlParam(pv.slug);
    // Update ?module= if we crossed into a different module
    if (pv && pv.moduleId !== prevModuleId) {
      setModuleUrlParam(slugify(pv.moduleId));
    }
  }
});
document.getElementById('modalNext').addEventListener('click', () => {
  if (currentVideoIndex < flatVideos.length - 1) {
    var prevModuleId = flatVideos[currentVideoIndex].moduleId;
    currentVideoIndex++;
    showModal();
    var nv = flatVideos[currentVideoIndex];
    if (nv && nv.slug) setVideoUrlParam(nv.slug);
    // Update ?module= if we crossed into a different module
    if (nv && nv.moduleId !== prevModuleId) {
      setModuleUrlParam(slugify(nv.moduleId));
    }
  }
});
document.getElementById('modalMark').addEventListener('click', () => {
  const video = flatVideos[currentVideoIndex];
  if (!video) return;
  if (watchedVideos.has(video.id)) {
    watchedVideos.delete(video.id);
    saveProgress();
    renderModules();
    updateMarkButton(video.id);
    // Analytics: video unmarked
    if (Analytics) {
      const mod = MODULES.find(m => m.videos.some(mv => mv.id === video.id));
      const pct = flatVideos.length > 0 ? Math.round((watchedVideos.size / flatVideos.length) * 100) : 0;
      Analytics.videoUnmarked('hub', video, mod, pct);
    }
  } else {
    markVideoComplete(video.id);
  }
});

/* ========== TOAST ========== */
function showToast(msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

/* ========== CONFETTI ========== */
function fireConfetti() {
  const container = document.getElementById('confetti');
  const colors = ['#1665d8', '#ff4998', '#10b981', '#f59e0b', '#2f3e83', '#ffffff'];
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = Math.random() * 0.8 + 's';
    piece.style.animationDuration = (2 + Math.random() * 1.5) + 's';
    piece.style.width = (6 + Math.random() * 8) + 'px';
    piece.style.height = (6 + Math.random() * 8) + 'px';
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    container.appendChild(piece);
  }
  setTimeout(() => { container.innerHTML = ''; }, 4000);
}

/* ========== ASYNC DATA LOADER ========== */
async function loadData() {
  const container = document.getElementById('modulesContainer');
  container.innerHTML = '<div class="loading-overlay"><div class="loading-spinner"></div><div class="loading-text">Loading training modules…</div></div>';

  try {
    // Try pre-loaded global first (works on file:// protocol), then fetch
    if (window.DOORLOOP_TRAINING_DATA) {
      DATA = window.DOORLOOP_TRAINING_DATA;
    } else {
      const res = await fetch(getDataUrl());
      if (!res.ok) throw new Error('HTTP ' + res.status);
      DATA = await res.json();
    }

    // Sync storage key from JSON config into the shared module
    if (DATA.config && DATA.config.storageKey && Progress) {
      Progress.setStorageKey(DATA.config.storageKey);
    }

    // Build MODULES from trainingHub config + sections data
    MODULES = DATA.trainingHub.modules.map(mod => ({
      id: mod.id,
      title: mod.title,
      subtitle: mod.subtitle,
      icon: mod.icon,
      iconClass: mod.iconClass,
      videos: mod.sections.flatMap(sKey => {
        const section = DATA.sections[sKey];
        if (!section) return [];
        return section.videos.map(v => ({
          id: v.id,
          title: v.title,
          desc: v.desc,
          wistiaId: v.wistiaId,
          duration: v.duration,
          helpUrl: v.helpUrl || null,
          tourId: v.tourId || null,
          appPath: v.appPath || null,
          isNew: v.isNew || false,
        }));
      }),
    }));

    // Flatten for navigation
    flatVideos = [];
    MODULES.forEach(mod => {
      mod.videos.forEach(v => {
        flatVideos.push({ ...v, moduleId: mod.id, moduleTitle: mod.title });
      });
    });

    // Build slug lookup map for deep-linking (must run after flatVideos is ready)
    buildSlugMap();

    // Update hero text from JSON
    const heroH1 = document.querySelector('.hero h1');
    const heroP = document.querySelector('.hero p');
    if (heroH1 && DATA.trainingHub.title) heroH1.textContent = DATA.trainingHub.title;
    if (heroP && DATA.trainingHub.subtitle) heroP.textContent = DATA.trainingHub.subtitle;

    // Set all schedule links from JSON config
    if (DATA.config && DATA.config.scheduleUrl) {
      document.querySelectorAll('.schedule-link').forEach(el => {
        el.href = DATA.config.scheduleUrl;
      });
    }

    loadProgress();
    renderModules();

    // Analytics: page view
    if (Analytics) Analytics.trainingHubViewed(flatVideos.length, watchedVideos.size);

    // Listen for progress changes from the widget (cross-tab + same-page)
    if (Progress) {
      // Cross-tab sync via shared module
      Progress.onUpdate(function () {
        loadProgress();
        renderModules();
      });
    }
    // Same-page event from widget (source filtering prevents loops)
    window.addEventListener('doorloop:progressChanged', function (e) {
      if (e.detail && e.detail.source !== 'hub') {
        loadProgress();
        renderModules();
      }
    });

    // Deep-link: handle ?video= and/or ?module= params on page load
    var dlParams = new URLSearchParams(window.location.search);
    var dlVideoSlug = dlParams.get('video');
    var dlModuleSlug = dlParams.get('module');

    if (dlVideoSlug) {
      // ?video= present: resolve slug, expand parent module, open modal
      var dlVideoId = slugMap[dlVideoSlug] || null;
      if (dlVideoId) {
        var dlMod = findModuleForVideo(dlVideoId);
        if (dlMod) {
          var dlModEl = document.getElementById('mod-' + dlMod.id);
          if (dlModEl && !dlModEl.classList.contains('open')) {
            dlModEl.classList.add('open');
          }
          // Set ?module= alongside ?video= so closing the modal lands correctly
          setModuleUrlParam(slugify(dlMod.id));
        }
        openVideo(dlVideoId);
      }
    } else if (dlModuleSlug) {
      // ?module= only (no video): find matching module, expand it, scroll to it
      var targetMod = MODULES.find(function (m) {
        return slugify(m.id) === dlModuleSlug;
      });
      if (targetMod) {
        var targetEl = document.getElementById('mod-' + targetMod.id);
        if (targetEl && !targetEl.classList.contains('open')) {
          targetEl.classList.add('open');
        }
        // Scroll after a brief tick so the DOM has settled
        setTimeout(function () {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }

  } catch (err) {
    console.error('[TrainingHub] Failed to load data:', err);
    container.innerHTML = '<div class="load-error">⚠️ Could not load training data. Make sure <code>doorloop-training-data.json</code> is in the same folder, or set <code>?dataUrl=URL</code>.</div>';
  }
}

/* ========== INIT ========== */
loadData();
