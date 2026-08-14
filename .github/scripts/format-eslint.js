#!/usr/bin/env node
// Turns ESLint's JSON report into the markdown chunk that CI posts on a PR.
// Usage: node .github/scripts/format-eslint.js lint.json
//
// ESLint 9 removed the "unix" formatter from core, and the JSON formatter emits
// absolute paths, so the paths are made repo-relative here.

const fs = require("fs");
const path = require("path");

const MAX_FILES = 50;
const MAX_MESSAGES_PER_FILE = 10;

const reportPath = process.argv[2];
if (!reportPath) {
  console.error("usage: format-eslint.js <lint.json>");
  process.exit(1);
}

let results;
try {
  results = JSON.parse(fs.readFileSync(reportPath, "utf8"));
} catch (err) {
  console.log("Could not parse the ESLint report: " + err.message);
  process.exit(0);
}

const root = process.cwd();
const rel = (p) => path.relative(root, p) || p;

const withProblems = results.filter((r) => r.errorCount > 0 || r.warningCount > 0);

if (withProblems.length === 0) {
  console.log("ESLint failed but reported no file-level problems.");
  process.exit(0);
}

const totalErrors = withProblems.reduce((n, r) => n + r.errorCount, 0);
const totalWarnings = withProblems.reduce((n, r) => n + r.warningCount, 0);

console.log(
  `ESLint found ${totalErrors} error(s) and ${totalWarnings} warning(s) in ` +
    `${withProblems.length} file(s):`,
);
console.log();

for (const result of withProblems.slice(0, MAX_FILES)) {
  console.log(`**\`${rel(result.filePath)}\`**`);
  console.log();
  console.log("```");
  for (const m of result.messages.slice(0, MAX_MESSAGES_PER_FILE)) {
    const severity = m.severity === 2 ? "error" : "warning";
    const rule = m.ruleId ? `  (${m.ruleId})` : "";
    console.log(`${m.line}:${m.column}  ${severity}  ${m.message}${rule}`);
  }
  if (result.messages.length > MAX_MESSAGES_PER_FILE) {
    const more = result.messages.length - MAX_MESSAGES_PER_FILE;
    console.log(`... and ${more} more`);
  }
  console.log("```");
  console.log();
}

if (withProblems.length > MAX_FILES) {
  console.log(`... and ${withProblems.length - MAX_FILES} more file(s).`);
  console.log();
}
