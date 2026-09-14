#!/usr/bin/env node
/**
 * cad-visual-qa.mjs — thin wrapper; the generalized scanner lives in
 * visual-qa.mjs (node _scripts/visual-qa.mjs --domain=cad). Kept for
 * back-compat with any scripts that invoke this file directly.
 */
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

const here = fileURLToPath(new URL(".", import.meta.url));
const args = process.argv.slice(2);
const r = spawnSync(
  process.execPath,
  [here + "visual-qa.mjs", "--domain=cad", ...args],
  { stdio: "inherit" }
);
process.exit(r.status ?? 1);
