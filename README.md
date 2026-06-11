# DoorLoop Training Hub & Help Widget

Interactive training system for DoorLoop customers. Includes a full-page **Training Hub** and an embeddable **Help Widget**, both with Wistia video progress tracking, Intercom integration, PostHog analytics, and real-time sync.

**Live at**: [training.doorloop.com](https://training.doorloop.com)

## Quick Start

```bash
# Serve locally
cd doorloop-training
python3 -m http.server 8080

# Open the Training Hub
open http://localhost:8080/
```

Or open `index.html` directly in your browser — the JS data wrapper handles `file://` protocol.

## Project Structure

```
doorloop-training/
├── index.html              Root Training Hub page (app redirect on prod, HTTPS redirect, PostHog, Intercom, Wistia)
├── robots.txt              Disallow all crawlers (noindex)
├── data/
│   ├── training-data.js    All training content — videos, sections, modules, aliases, config
│   └── README.md           Editing cheat sheet for non-developers
├── hub/
│   ├── index.html          Hub subdirectory page (identical setup to root)
│   ├── hub.css             Hub styles
│   └── hub.js              Hub logic — renders modules, videos, progress, search
├── shared/
│   ├── analytics.js        PostHog tracking layer (18 event types, training_hub_ prefix)
│   ├── intercom.js         Intercom helpers — articles, tours, chat, 3-tier fallback
│   └── progress.js         localStorage progress tracking + cross-tab sync
├── widget/
│   ├── loader.js           One-line embed loader — loads all dependencies automatically
│   ├── widget.css          Widget styles (all classes prefixed .dlhw-)
│   └── widget.js           Help Widget IIFE — floating panel, auto-detects current page
├── assets/                 Icon assets (currently unused — inline SVGs in data file)
├── missing-data.csv        Audit of placeholder Wistia/Tour IDs still needing real values
├── AGENTS.md               AI/contributor architecture guide
└── README.md               This file
```

## Updating Training Content

All content lives in a single file: `data/training-data.js`. It's structured with one video per block, inline comments, and a searchable table of contents.

**For team members**: See `data/README.md` for copy-paste examples (add a video, link a tour, mark as NEW, add a section).

**Workflow**: Edit `training-data.js` → push to GitHub → changes are live on training.doorloop.com. No build step.

## Embedding the Widget

To add the Help Widget to the DoorLoop app, add **one line** to any page:

```html
<script src="https://training.doorloop.com/widget/loader.js" defer></script>
```

That's it. The loader automatically fetches the CSS, training data, shared modules, and widget JS from `training.doorloop.com` in the correct order. No other tags, no initialization code.

The widget auto-detects the current page via URL path matching (using `pageAliases` in the data file) and shows relevant training videos.

### How the loader works

`widget/loader.js` is a lightweight script (~60 lines) that dynamically injects:

1. `widget/widget.css` — widget styles (non-blocking)
2. `data/training-data.js` — all training content
3. `shared/progress.js` + `shared/intercom.js` + `shared/analytics.js` — loaded in parallel after data
4. `widget/widget.js` — the widget itself, loaded last

All files are pulled from `training.doorloop.com`. Updating content on the training site automatically updates every app page that embeds the widget — no app deploys needed.

### JavaScript API (optional)

Once loaded, you can control the widget programmatically:

```js
DoorLoopHelpWidget.open();      // open the panel
DoorLoopHelpWidget.close();     // close the panel
DoorLoopHelpWidget.toggle();    // toggle open/close
DoorLoopHelpWidget.setPage('accounting');  // force a section
```

## Third-Party Integrations

### PostHog Analytics
- **Project key**: `phc_HUjc1K4MXKGgoZ3Vr0CKpDFq61qk5O0zTdKM7fmEWoe`
- **API host**: `https://us.i.posthog.com`
- **Event prefix**: `training_hub_` (18 event types — see `shared/analytics.js` for full catalogue)
- Tracks: page views, video starts/completions, tour clicks, article opens, widget interactions, search, chat opens

### Intercom
- **App ID**: `njbci459`
- **API base**: `https://api-iam.intercom.io`
- Features: "Chat with Us" opens Intercom messenger, "Try It Live" triggers product tours, "Read Article" opens help center articles
- 3-tier fallback: Intercom API → postMessage (iframe) → window.open (new tab)

### Wistia
- Videos embedded via `wistia_async_HASH` class pattern
- E-v1.js loaded async in the HTML head

## Progress Tracking

Video completion stored in `localStorage` under key `doorloop_training_progress`. Syncs between Hub and Widget in real-time:
- **Cross-tab**: `storage` event listener
- **Same-page**: `CustomEvent('doorloop:progressChanged')` with source filtering

## SEO & Privacy

- `robots.txt` set to `Disallow: /` — no search engine indexing
- `<meta name="robots" content="noindex, nofollow">` on all HTML pages
- HTTPS enforced via JavaScript redirect

## Development

No build step. All files are vanilla HTML/CSS/JS (Hub uses ES6, Widget uses ES5 IIFE).

1. Clone the repo
2. Open `index.html` in a browser (or serve with any static server)
3. Edit files and refresh

For architecture details and contributor conventions, see `AGENTS.md`.
