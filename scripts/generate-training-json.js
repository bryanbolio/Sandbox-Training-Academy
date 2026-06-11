"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const INPUT = path.join(__dirname, "..", "data", "training-data.js");
const OUTPUT = path.join(__dirname, "..", "data", "training-data.json");

const source = fs.readFileSync(INPUT, "utf8");
const context = { window: {} };
vm.createContext(context);

try {
  vm.runInContext(source, context);
} catch (e) {
  console.error(
    `PARSE ERROR: training-data.js could not be evaluated — ${e.message}`
  );
  process.exit(1);
}

const data = context.window.DOORLOOP_TRAINING_DATA;
if (!data) {
  console.error(
    "PARSE ERROR: window.DOORLOOP_TRAINING_DATA is undefined after evaluation"
  );
  process.exit(1);
}

fs.writeFileSync(OUTPUT, JSON.stringify(data, null, 2), "utf8");
console.log(`Generated ${OUTPUT}`);
