#!/usr/bin/env node
/**
 * run-visual-qa-ci.mjs — CI entry point for the multi-domain visual QA sweep.
 *
 * Runs the full three-viewport overflow sweep against a PRODUCTION build
 * (dev-server cold compiles are far too slow for ~1545 route×viewport combos):
 *
 *   1. next build
 *   2. next start -p <port>
 *   3. visual-qa.mjs for cad + pdf (one pass each) and developers (2 shards per
 *      viewport), exiting non-zero if ANY run reports overflow/geometry bugs
 *
 * Usage:
 *   node _scripts/run-visual-qa-ci.mjs            # full sweep (~30-40 min)
 *   node _scripts/run-visual-qa-ci.mjs --quick    # cad + pdf only (~10 min)
 *
 * Set BASE_URL to reuse an already-running server and skip build/start
 * (e.g. `BASE_URL=http://localhost:3002 node _scripts/run-visual-qa-ci.mjs`).
 */
import { spawnSync, spawn } from "child_process";
import { existsSync } from "fs";
import { resolve } from "path";

const ROOT = resolve(import.meta.dirname, "..");
const isWin = process.platform === "win32";
const quick = process.argv.includes("--quick");
const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3002}`;

const run = (cmd, args, opts = {}) => {
  const r = spawnSync(cmd, args, { cwd: ROOT, stdio: "inherit", ...opts });
  if (r.error) {
    console.error(`failed to spawn ${cmd}: ${r.error.message}`);
    process.exit(1);
  }
  return r.status ?? 1;
};

const poll = async (url, tries = 40) => {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url);
      if (res.status === 200) return true;
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 1500));
  }
  return false;
};

const scanner = (args) => run(process.execPath, [resolve(ROOT, "_scripts/visual-qa.mjs"), ...args]);
const scanArgs = (...extra) => ["--json", "--vw=375", "--vw=768", "--vw=1440", ...extra];

let server = null;
if (!process.env.BASE_URL) {
  const build = run(isWin ? "npm.cmd" : "npm", ["run", "build"], { timeout: 900000 });
  if (build !== 0) { console.error("❌ next build failed"); process.exit(1); }
  server = spawn(isWin ? "npx.cmd" : "npx", ["next", "start", "-p", String(new URL(baseUrl).port)], {
    cwd: ROOT, stdio: "ignore", detached: false, shell: isWin,
  });
  if (!(await poll(baseUrl))) { console.error("❌ next start did not answer"); process.exit(1); }
}

let failures = 0;
const check = (label, status) => {
  if (status !== 0) { failures++; console.error(`❌ ${label} failed (exit ${status})`); }
  else console.log(`✓ ${label}`);
};

// cad: all 70 routes × 3 viewports in one pass (~5 min)
check("cad @375/768/1440", scanner(scanArgs("--domain=cad")));

// pdf: 110 routes × 3 viewports (~3 min/viewport)
for (const vw of ["375", "768", "1440"]) {
  check(`pdf @${vw}`, scanner(["--json", "--vw=" + vw, "--domain=pdf"]));
}

if (!quick) {
  // developers: 335 routes × 3 viewports, sharded to keep each run < ~10 min
  for (const vw of ["375", "768", "1440"]) {
    for (const shard of ["0", "1"]) {
      check(`developers @${vw} shard ${shard}`, scanner(["--json", "--vw=" + vw, "--domain=developers", "--shards=2", "--shard=" + shard]));
    }
  }
}

if (server) server.kill();
process.exit(failures ? 1 : 0);
