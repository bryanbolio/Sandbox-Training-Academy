# AGENTS.md — DoorLoop Training Project

> Guide for AI agents and human contributors working on this codebase.

## Project Overview

This project provides two customer-facing training components for DoorLoop, hosted on GitHub Pages at **training.doorloop.com**:

1. **Training Hub** (`hub/`) — Full-page training academy with 9 modules, Wistia video embeds, progress tracking, Intercom product tours, and PostHog analytics.
2. **Help Widget** (`widget/`) — Floating top-left widget embeddable on any page, with auto-detection of the current app page and relevant video recommendations.

Both components read from a single data file (`data/training-data.js`), share progress state via `localStorage`, and sync in real-time across tabs.

---

## Folder Structure

```
doorloop-training/
├── AGENTS.md                ← You are here
├── README.md                ← Setup, deployment, and embedding guide
├── index.html               ← Root Training Hub page (app redirect on prod, HTTPS redirect, PostHog, Intercom, Wistia)
├── robots.txt               ← Disallow all crawlers
├── missing-data.csv         ← Audit of placeholder IDs needing real values
├── assets/                  ← Icon assets (currently empty — inline SVGs in data file)
├── data/
│   ├── training-data.js     ← Single source of truth: sections, videos, aliases, modules, config
│   └── README.md            ← Editing cheat sheet for non-developers
├── hub/
│   ├── index.html           ← Hub subdirectory page (same setup as root index.html)
│   ├── hub.css              ← Hub styles
│   └── hub.js               ← Hub logic (ES6) — modules, video player, progress, search
├── shared/
│   ├── analytics.js         ← PostHog tracking layer (18 events, training_hub_ prefix)
│   ├── intercom.js          ← Intercom helpers with 3-tier fallback chain
│   └── progress.js          ← localStorage progress tracking + cross-tab sync
└── widget/
    ├── widget.css            ← Widget styles (all classes prefixed .dlhw-)
    └── widget.js             ← Help Widget IIFE (ES5) — auto-detects page, shows relevant content
```

---

## Key Conventions

### Naming

- **Hub classes**: No prefix (e.g. `.module-header`, `.video-card`).
- **Widget classes**: Always prefixed `.dlhw-` to avoid host-page collisions.
- **Video IDs**: Format `v-{section}-{number}` (e.g. `v-dash-1`, `v-prop-3`).
- **Section keys**: Lowercase, no hyphens (e.g. `dashboard`, `properties`, `tenants`).
- **Module IDs**: Kebab-case (e.g. `getting-started`, `tenants-leases`, `ai-workflows`).

### Language Targets

- **Hub** (`hub.js`): ES6 — uses `const`, `let`, arrow functions, template literals, destructuring.
- **Widget** (`widget.js`): ES5 IIFE — must work in older browsers embedded in the DoorLoop app. No `const`/`let`, no arrow functions, no template literals.
- **Shared modules** (`shared/*.js`): ES5-compatible, since they're loaded by both hub and widget.

### Script Loading Order

Both `index.html` and `hub/index.html` load scripts in this exact order — **order matters**:

```html
<!-- Head -->
<script>/* App redirect — on training.doorloop.com only, sends visitors to app.doorloop.com/training-hub, preserving ?video=/?module= and hash */</script>
<script>/* HTTPS redirect */</script>
<script>/* PostHog snippet */</script>
<script src="data/training-data.js"></script>                      <!-- 1. Data -->
<script src="https://fast.wistia.com/assets/external/E-v1.js" async></script> <!-- 2. Wistia -->

<!-- Before </body> -->
<script>/* Intercom boot snippet (app_id: njbci459) */</script>
<script>/* PostHog auto-pageview */</script>
<script src="shared/progress.js"></script>                          <!-- 3. Progress -->
<script src="shared/intercom.js"></script>                          <!-- 4. Intercom helpers -->
<script src="shared/analytics.js"></script>                         <!-- 5. Analytics -->
<script src="hub/hub.js" defer></script>                            <!-- 6. Hub logic -->
<script src="widget/widget.js" defer></script>                      <!-- 7. Widget -->
```

---

## Data File Structure (training-data.js)

The data file assigns a single object to `window.DOORLOOP_TRAINING_DATA` with four top-level keys:

```
window.DOORLOOP_TRAINING_DATA = {
    config          → Global settings (URLs, storage key)
    sections        → 13 feature-area sections, each with label, icon, videos[]
    pageAliases     → URL path → section key mapping (73 aliases)
    trainingHub     → Hub page title, subtitle, and 9 module definitions
}
```

### Section Structure

Each section has three fields:

```js
"dashboard": {
    "label":  "Dashboard",                    // Display name
    "icon":   "<svg .../>",                   // Inline SVG (leave as-is)
    "videos": [                               // Array of video objects
        {
            "id":       "v-dash-1",           // Unique ID: v-{section}-{number}
            "title":    "Welcome to DoorLoop",
            "desc":     "Quick overview...",
            "wistiaId": "WISTIA_ID_welcome",  // Wistia video hash
            "duration": "3:45",               // Display string M:SS
            "helpUrl":  "https://support...", // Help center article URL
            "tourId":   null,                 // Intercom tour ID or null
            "appPath":  null,                 // In-app path for tour or null
            "isNew":    true                  // Optional: show NEW badge
        }
    ]
}
```

**Important**: `tourId` and `helpUrl` live on each video object. There are no standalone `tours` or `articles` arrays on sections — those were removed as dead code.

### Page Aliases

Maps URL path segments to section keys so the widget auto-detects context:

```js
"pageAliases": {
    "rentals":     "properties",   // user on /rentals → widget shows Properties section
    "leasing":     "leases",
    "tasks":       "maintenance",
    ...
}
```

### Training Hub Modules

Each module groups one or more sections into an accordion panel:

```js
{
    "id":        "tenants-leases",
    "title":     "Tenants & Leases",
    "subtitle":  "Manage tenants, leases, and move-ins",
    "icon":      "👥",
    "iconClass": "pink",              // "blue", "navy", "pink", "green", "orange"
    "sections":  ["tenants", "leases"]  // Pulls videos from these sections
}
```

### Current Sections (13)

| Key | Label | Videos |
|-----|-------|--------|
| `dashboard` | Dashboard | 3 |
| `properties` | Properties & Units | 4 |
| `tenants` | Tenants | 4 |
| `leases` | Leases | 3 |
| `accounting` | Accounting | 5 |
| `payments` | Payments | 3 |
| `maintenance` | Maintenance | 3 |
| `communications` | Communications | 3 |
| `reports` | Reports | 2 |
| `ai` | AI Assistant | 2 |
| `workflows` | Workflows | 1 |
| `inspections` | Inspections | 1 |
| `signatures` | E-Signatures | 0 (placeholder) |

**Total**: 34 video slots across 13 sections, organized into 9 hub modules.

---

## Progress Sync Architecture

```
┌─────────────┐    localStorage     ┌─────────────┐
│  Training    │ ←──── storage ────→ │    Help      │
│    Hub       │      event          │   Widget     │
│  (hub.js)    │                     │ (widget.js)  │
└──────┬───────┘                     └──────┬───────┘
       │                                     │
       │  doorloop:progressChanged           │
       │  (CustomEvent, source='hub')        │
       │ ◄──────────────────────────────────►│
       │         (source='widget')           │
       │                                     │
       └──────────┬──────────────────────────┘
                  │
          shared/progress.js
          (DoorLoopProgress API)
```

- **Cross-tab**: `window.addEventListener('storage', ...)` fires when another tab writes to localStorage.
- **Same-page**: `CustomEvent('doorloop:progressChanged')` with `detail.source` to prevent circular updates.
- **Source filtering**: Hub listens for `source !== 'hub'`, widget listens for `source !== 'widget'`.
- **Storage key**: `doorloop_training_progress` (defined in `config.storageKey`)

---

## Shared Module APIs

### `window.DoorLoopProgress` (from `shared/progress.js`)

| Method | Returns | Description |
|--------|---------|-------------|
| `getWatchedSet()` | `Set` | Current set of completed video IDs |
| `isWatched(videoId)` | `boolean` | Check if a video is completed |
| `markWatched(videoId, source)` | `void` | Mark video complete, save + dispatch |
| `unmark(videoId, source)` | `void` | Remove completion, save + dispatch |
| `getAll()` | `Array` | Array of completed video IDs |
| `save(set, source)` | `void` | Write set to localStorage + dispatch |
| `onUpdate(callback)` | `void` | Register listener for any change |
| `setStorageKey(key)` | `void` | Override the localStorage key |
| `STORAGE_KEY` | `string` | Current key (read-only getter) |

### `window.DoorLoopIntercom` (from `shared/intercom.js`)

| Method | Description |
|--------|-------------|
| `showArticle(url)` | Show Intercom article by URL (extracts ID from `/articles/\d+`) |
| `startTour(tourId, appPath)` | Start product tour, optionally navigate to appPath first |
| `openMessenger()` | Open the Intercom chat messenger |
| `hideLauncher()` | Hide the default Intercom launcher bubble |

Fallback chain (3 tiers): Intercom JS API → `postMessage` (for iframe contexts) → `window.open` (new tab).

### `window.DoorLoopAnalytics` (from `shared/analytics.js`)

| Method | Description |
|--------|-------------|
| `trackPageView(props)` | `training_hub_page_viewed` |
| `trackVideoStarted(video, source)` | `training_hub_video_started` |
| `trackVideoCompleted(video, source)` | `training_hub_video_completed` |
| `trackVideoUnmarked(video, source)` | `training_hub_video_unmarked` |
| `trackModuleStarted(module, source)` | `training_hub_module_started` |
| `trackModuleCompleted(module, source)` | `training_hub_module_completed` |
| `trackTrainingCompleted(source)` | `training_hub_training_completed` |
| `trackWidgetOpened()` | `training_hub_widget_opened` |
| `trackWidgetClosed()` | `training_hub_widget_closed` |
| `trackTabSwitched(tab)` | `training_hub_tab_switched` |
| `trackModuleExpanded(module)` | `training_hub_module_expanded` |
| `trackSearch(query, results)` | `training_hub_search_performed` |
| `trackHelpArticle(video, source)` | `training_hub_help_article_opened` |
| `trackTourStarted(video, source)` | `training_hub_tour_started` |
| `trackChatOpened(source)` | `training_hub_chat_opened` |
| `trackScheduleTraining(source)` | `training_hub_schedule_training` |
| `trackHelpCenter(source)` | `training_hub_help_center_opened` |
| `trackFullAcademy(source)` | `training_hub_full_academy_opened` |

All methods are safe to call even when PostHog hasn't loaded — every call is wrapped in try/catch.

Common properties on every event: `source` ("hub" or "widget"), `component` ("training_hub" or "help_widget").

---

## Third-Party Configuration

### PostHog
- **Project key**: `phc_HUjc1K4MXKGgoZ3Vr0CKpDFq61qk5O0zTdKM7fmEWoe`
- **API host**: `https://us.i.posthog.com`
- **Snippet**: Inline in `<head>` of both HTML files
- **Auto pageview**: Disabled in snippet (`autocapture: false`), fired manually via `DoorLoopAnalytics.trackPageView()`

### Intercom
- **App ID**: `njbci459`
- **API base**: `https://api-iam.intercom.io`
- **Snippet**: Inline before `</body>` in both HTML files
- **Launcher**: Hidden by default (`hide_default_launcher: true`) since the widget replaces it

### Wistia
- **Script**: `https://fast.wistia.com/assets/external/E-v1.js` loaded `async`
- **Embed pattern**: `<div class="wistia_embed wistia_async_HASH">`
- **API binding**: Uses `setTimeout(1000)` delay to wait for async initialization

---

## Gotchas & Known Issues

1. **`file://` protocol CORS** — `fetch()` doesn't work from `file://`. That's why `training-data.js` uses `window.DOORLOOP_TRAINING_DATA = {...}` as a global. The hub tries the global first, then falls back to fetch.

2. **Widget null guards** — When removing or hiding UI elements in the widget, always null-check `els.*` references. A previous crash occurred when `els.ctxPage.textContent` was called on a removed element.

3. **Intercom availability** — `window.Intercom` is only available after the boot snippet loads. All Intercom calls have 3-tier fallbacks so they never throw.

4. **Widget z-index** — Toggle button: `10001`, Panel: `10000`, Overlay: `9999`. If the host page has high z-index elements, adjust in `widget.css`.

5. **`defer` attribute** — Both `hub.js` and `widget.js` use `defer`, so they execute after DOM parsing. Don't add `DOMContentLoaded` wrappers — they're unnecessary and can cause double-init.

6. **Wistia async** — E-v1.js loads `async`. Video API binding happens in a `setTimeout(1000)` to give the embed time to initialize.

7. **No build step** — This is a static site on GitHub Pages. Edit → push → live. No webpack, no npm, no compilation.

8. **ES5 in widget** — The widget IIFE must stay ES5-compatible for the DoorLoop app's browser support. No `const`, `let`, arrow functions, or template literals in `widget.js`.

9. **Duplicate HTML files** — `index.html` (root) and `hub/index.html` are nearly identical. Both exist so the hub works at both `/` and `/hub/`. When editing one, update the other too (only difference is relative paths to shared scripts: `shared/` vs `../shared/`).

---

## Brand & Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| Primary Blue | `#1665d8` | Buttons, links, progress fills |
| Navy | `#2f3e83` | Hub hero gradient, dark accents |
| Pink | `#ff4998` | DoorLoop brand accent, CTA highlights |
| Success Green | `#10b981` | Completion states, badges |
| Warning Amber | `#f59e0b` | Confetti, attention states |
| Text Dark | `#1e293b` | Primary text |
| Text Muted | `#64748b` | Secondary text, descriptions |
| Border | `#e2e8f0` | Cards, dividers |
| Background | `#f8fafc` | Page background |

---

## Testing Locally

```bash
# Option A: Python
cd doorloop-training && python3 -m http.server 8080
# Open http://localhost:8080/

# Option B: Node
npx serve doorloop-training
# Open http://localhost:3000/

# Option C: Direct file
# Open index.html directly (uses training-data.js global, no fetch needed)
```

### Quick syntax check for data file:
```bash
node -e "var window = {}; eval(require('fs').readFileSync('./data/training-data.js', 'utf8')); console.log('OK — ' + Object.keys(window.DOORLOOP_TRAINING_DATA.sections).length + ' sections loaded')"
```
