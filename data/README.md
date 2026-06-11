# Training Data — Editing Cheat Sheet

This file explains how to edit `training-data.js` so anyone on the team can add videos, update links, or manage sections — without breaking anything.

---

## Quick Rules

1. **Keep the quotes** — every key and value must be in `"double quotes"` (except `true`, `false`, and `null`).
2. **Keep the commas** — every item needs a comma after it, *except* the last one in a list.
3. **Test after editing** — open the Training Hub in your browser and press **F12** → Console. If you see red errors, you broke something (probably a missing comma or quote).
4. **Don't rename section keys** (like `"dashboard"`, `"properties"`) unless you also update `pageAliases` and the `modules` list at the bottom.

---

## How to find the right spot

The file has a **Table of Contents** at the top. Use **Ctrl+F** (or Cmd+F on Mac) and search for the bracketed tag, e.g. `[TENANTS]` or `[PAYMENTS]`, to jump straight to that section.

---

## Copy-Paste Examples

### Add a new video

Find the section you want (e.g. search for `[TENANTS]`), scroll to the `"videos"` array, and paste a new video block **before the closing `]`**. Add a comma after the previous video's closing `}`.

```js
        {
          "id":       "v-ten-5",
          "title":    "Bulk Tenant Updates",
          "desc":     "Update multiple tenants at once.",
          "wistiaId": "abc123xyz",
          "duration": "3:20",
          "helpUrl":  "https://support.doorloop.com/en/articles/XXXXXXX-your-article",
          "tourId":   null,
          "appPath":  null
        }
```

**Field-by-field:**

| Field | What it does | Example |
|-------|-------------|---------|
| `id` | Unique ID. Format: `v-{section}-{number}` | `"v-ten-5"` |
| `title` | Video title shown to users | `"Bulk Tenant Updates"` |
| `desc` | One-sentence description | `"Update multiple tenants at once."` |
| `wistiaId` | The hash from your Wistia video URL | `"abc123xyz"` |
| `duration` | Video length as `"M:SS"` | `"3:20"` |
| `helpUrl` | Link to the matching help center article | Full URL |
| `tourId` | Intercom tour ID, or `null` if no tour | `"12345"` or `null` |
| `appPath` | In-app path the tour starts on, or `null` | `"/people"` or `null` |
| `isNew` | *(optional)* Show a NEW badge | `true` or just leave it out |

---

### Change a video title or URL

Find the video by its `id` (Ctrl+F for `"v-dash-1"`) and edit the field:

```js
        // Change the title:
        "title":    "Your DoorLoop Welcome Tour",

        // Update the help article link:
        "helpUrl":  "https://support.doorloop.com/en/articles/NEW-ARTICLE-SLUG",
```

---

### Add or remove a tour from a video

**Add a tour** — change `tourId` from `null` to the Intercom tour ID, and set `appPath` to the page the tour should start on:

```js
          // Before (no tour):
          "tourId":   null,
          "appPath":  null

          // After (with tour):
          "tourId":   "67890",
          "appPath":  "/leasing"
```

**Remove a tour** — set both back to `null`:

```js
          "tourId":   null,
          "appPath":  null
```

---

### Mark a video as "NEW"

Add `"isNew": true` as the last field inside the video block:

```js
        {
          "id":       "v-pay-2",
          "title":    "Recording Manual Payments",
          ...
          "appPath":  "/accounting",
          "isNew":    true
        }
```

To remove the badge later, just delete the `"isNew": true` line (or set it to `false`).

---

### Add a brand new section

This is a bigger change — 3 steps:

**Step 1.** Add the section inside `"sections"` (search for `[SIGNATURES]` and paste above it):

```js
    "newsection": {
      "label": "My New Section",
      "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><circle cx=\"12\" cy=\"12\" r=\"10\"/></svg>",
      "videos": [

        {
          "id":       "v-new-1",
          "title":    "First Video",
          "desc":     "Description here.",
          "wistiaId": "WISTIA_HASH",
          "duration": "4:00",
          "helpUrl":  "https://support.doorloop.com/en/articles/XXXXXXX",
          "tourId":   null,
          "appPath":  null
        }

      ]
    },
```

**Step 2.** Add page aliases (search for `[PAGE ALIASES]`) so the Help Widget auto-detects it:

```js
    // My New Section
    "newsection":       "newsection",
    "my-new-page":      "newsection",
```

**Step 3.** Add a module (search for `[TRAINING HUB]`) so it shows up on the hub:

```js
      {
        "id":        "newsection",
        "title":     "My New Section",
        "subtitle":  "What this section covers",
        "icon":      "🆕",
        "iconClass": "blue",
        "sections":  ["newsection"]
      }
```

Available `iconClass` colors: `"blue"`, `"navy"`, `"pink"`, `"green"`, `"orange"`.

---

## Where to find IDs

| ID | Where to get it |
|----|----------------|
| **Wistia video hash** | Wistia dashboard → your video → the hash in the URL (e.g. `abc123xyz`) |
| **Intercom tour ID** | Intercom → Product Tours → click your tour → numeric ID in the URL |
| **Help article URL** | Copy the full URL from the DoorLoop help center |

---

## What NOT to change (unless you're a developer)

- The `"icon"` SVG strings — they're inline SVG code for the section icons
- The `"config"` block — these are global settings
- The `"storageKey"` — changing this resets everyone's progress
- Section key names (e.g. `"dashboard"`, `"tenants"`) — these are referenced everywhere
