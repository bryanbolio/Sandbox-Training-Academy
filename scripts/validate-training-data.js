'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const FILE = path.join(__dirname, '..', 'data', 'training-data.js');

// ─── Parse ───────────────────────────────────────────────────────────────────

let data;
try {
  const source = fs.readFileSync(FILE, 'utf8');
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(source, context);
  data = context.window.DOORLOOP_TRAINING_DATA;
  if (!data) throw new Error('window.DOORLOOP_TRAINING_DATA is undefined after evaluation');
} catch (e) {
  console.error(`PARSE ERROR: training-data.js could not be evaluated — ${e.message}`);
  process.exit(1);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const errors = [];

function err(fieldPath, msg) {
  errors.push(`SCHEMA ERROR: ${fieldPath} — ${msg}`);
}

function isString(v)       { return typeof v === 'string'; }
function isStringOrNull(v) { return typeof v === 'string' || v === null; }
function isObject(v)       { return v !== null && typeof v === 'object' && !Array.isArray(v); }

// ─── config ──────────────────────────────────────────────────────────────────

const CONFIG_FIELDS = ['helpCenterUrl', 'academyUrl', 'whatsNewUrl', 'scheduleUrl', 'storageKey'];

if (!isObject(data.config)) {
  err('config', `expected object, got ${typeof data.config}`);
} else {
  for (const field of CONFIG_FIELDS) {
    if (!isString(data.config[field])) {
      err(`config.${field}`, `expected string, got ${typeof data.config[field]}`);
    }
  }
}

// ─── sections ────────────────────────────────────────────────────────────────

const DURATION_RE = /^\d{1,2}:\d{2}$/;

if (!isObject(data.sections)) {
  err('sections', `expected object, got ${typeof data.sections}`);
} else {
  const sectionKeys = new Set(Object.keys(data.sections));
  const seenVideoIds = new Map(); // id → path string, for uniqueness check

  for (const sectionKey of sectionKeys) {
    const section = data.sections[sectionKey];
    const sp = `sections.${sectionKey}`;

    if (!isString(section.label)) err(`${sp}.label`, `expected string, got ${typeof section.label}`);
    if (!isString(section.icon))  err(`${sp}.icon`,  `expected string, got ${typeof section.icon}`);

    if (!Array.isArray(section.videos)) {
      err(`${sp}.videos`, 'expected array');
    } else {
      section.videos.forEach((video, i) => {
        const vp = `${sp}.videos[${i}]`;

        if (!isString(video.id))       err(`${vp}.id`,       `expected string, got ${typeof video.id}`);
        if (!isString(video.title))    err(`${vp}.title`,    `expected string, got ${typeof video.title}`);
        if (!isString(video.desc))     err(`${vp}.desc`,     `expected string, got ${typeof video.desc}`);
        if (!isString(video.wistiaId)) err(`${vp}.wistiaId`, `expected string, got ${typeof video.wistiaId}`);
        if (!isString(video.helpUrl))  err(`${vp}.helpUrl`,  `expected string, got ${typeof video.helpUrl}`);

        if (!isString(video.duration) || !DURATION_RE.test(video.duration)) {
          err(`${vp}.duration`, `expected string matching M:SS or MM:SS, got ${JSON.stringify(video.duration)}`);
        }

        if (!isStringOrNull(video.tourId))  err(`${vp}.tourId`,  `expected string or null, got ${typeof video.tourId}`);
        if (!isStringOrNull(video.appPath)) err(`${vp}.appPath`, `expected string or null, got ${typeof video.appPath}`);

        if ('isNew' in video && typeof video.isNew !== 'boolean') {
          err(`${vp}.isNew`, `expected boolean, got ${typeof video.isNew}`);
        }

        // Global video id uniqueness
        if (isString(video.id)) {
          if (seenVideoIds.has(video.id)) {
            err(`${vp}.id`, `duplicate id "${video.id}" (already seen at ${seenVideoIds.get(video.id)})`);
          } else {
            seenVideoIds.set(video.id, vp);
          }
        }
      });
    }
  }

  // ─── pageAliases ───────────────────────────────────────────────────────────

  if (!isObject(data.pageAliases)) {
    err('pageAliases', `expected object, got ${typeof data.pageAliases}`);
  } else {
    for (const [alias, target] of Object.entries(data.pageAliases)) {
      if (!isString(target)) {
        err(`pageAliases.${alias}`, `expected string, got ${typeof target}`);
      } else if (!sectionKeys.has(target)) {
        err(`pageAliases.${alias}`, `references unknown section key "${target}"`);
      }
    }
  }

  // ─── trainingHub ───────────────────────────────────────────────────────────

  const VALID_ICON_CLASSES = new Set(['blue', 'navy', 'pink', 'green', 'orange']);

  if (!isObject(data.trainingHub)) {
    err('trainingHub', `expected object, got ${typeof data.trainingHub}`);
  } else {
    if (!isString(data.trainingHub.title))    err('trainingHub.title',    `expected string, got ${typeof data.trainingHub.title}`);
    if (!isString(data.trainingHub.subtitle)) err('trainingHub.subtitle', `expected string, got ${typeof data.trainingHub.subtitle}`);

    if (!Array.isArray(data.trainingHub.modules)) {
      err('trainingHub.modules', 'expected array');
    } else {
      data.trainingHub.modules.forEach((mod, i) => {
        const mp = `trainingHub.modules[${i}]`;

        if (!isString(mod.id))       err(`${mp}.id`,       `expected string, got ${typeof mod.id}`);
        if (!isString(mod.title))    err(`${mp}.title`,    `expected string, got ${typeof mod.title}`);
        if (!isString(mod.subtitle)) err(`${mp}.subtitle`, `expected string, got ${typeof mod.subtitle}`);
        if (!isString(mod.icon))     err(`${mp}.icon`,     `expected string, got ${typeof mod.icon}`);

        if (!isString(mod.iconClass) || !VALID_ICON_CLASSES.has(mod.iconClass)) {
          err(`${mp}.iconClass`, `expected one of blue/navy/pink/green/orange, got ${JSON.stringify(mod.iconClass)}`);
        }

        if (!Array.isArray(mod.sections)) {
          err(`${mp}.sections`, 'expected array of strings');
        } else {
          mod.sections.forEach((ref, j) => {
            if (!isString(ref)) {
              err(`${mp}.sections[${j}]`, `expected string, got ${typeof ref}`);
            } else if (!sectionKeys.has(ref)) {
              err(`${mp}.sections[${j}]`, `references unknown section key "${ref}"`);
            }
          });
        }
      });
    }
  }
}

// ─── Report ──────────────────────────────────────────────────────────────────

if (errors.length > 0) {
  for (const e of errors) console.error(e);
  process.exit(1);
}

console.log('Validation passed.');
