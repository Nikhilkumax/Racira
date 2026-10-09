/**
 * Drift gate for the Racira Audio (/audio) SEO JSON pipeline.
 *
 * Usage: node scripts/audio-seo-drift-check.mjs
 *
 * Every `*.json` under src/domains/audio/seo/source is the authored source of
 * truth for the entries it contains. The generator (scripts/audio-json-to-seo.mjs)
 * writes the content module verbatim and scripts/apply-audio-seo-batch.mjs
 * splices revisions in, so the source and the committed module must stay
 * byte-identical — otherwise someone hand-edited generated content and the JSON
 * source no longer describes what the page renders.
 *
 * The check re-generates each source into a throwaway directory and hands every
 * generated module to `apply-audio-seo-batch.mjs --check` in one pass. Nothing
 * is written to the repository.
 *
 * Runs in `prebuild` after the source validator, so a drifted entry stops the
 * build instead of waiting for someone to remember --check.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const ROOT = process.cwd();
const SOURCE_DIR = path.join(ROOT, "src", "domains", "audio", "seo", "source");
const GENERATOR = path.join(ROOT, "scripts", "audio-json-to-seo.mjs");
const APPLIER = path.join(ROOT, "scripts", "apply-audio-seo-batch.mjs");

const fail = (msg) => {
  console.error(`\n\u2717 audio-seo-drift-check: ${msg}`);
  process.exit(1);
};

if (!fs.existsSync(SOURCE_DIR)) {
  console.log("\u2713 audio-seo-drift-check: no JSON source directory yet — nothing to check");
  process.exit(0);
}

const sources = fs
  .readdirSync(SOURCE_DIR)
  .filter((f) => f.toLowerCase().endsWith(".json"))
  .sort()
  .map((f) => path.join(SOURCE_DIR, f));

if (sources.length === 0) {
  console.log("\u2713 audio-seo-drift-check: no JSON sources yet — nothing to check");
  process.exit(0);
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "audio-seo-drift-"));
const generated = [];

try {
  for (const source of sources) {
    const out = path.join(tmpDir, `${path.basename(source, ".json")}.ts`);
    execFileSync(process.execPath, [GENERATOR, source, out], { stdio: "pipe" });
    generated.push(out);
  }

  // --check exits non-zero and names the drifted slugs when anything differs.
  execFileSync(process.execPath, [APPLIER, ...generated, "--check"], { stdio: "inherit" });
} catch (error) {
  fail(
    `generated content no longer matches the integrated batch files — ` +
      `re-run audio-json-to-seo.mjs for the source(s) listed above and commit the regenerated module, ` +
      `or fix the module back to the generated entry. (${error.message.split("\n")[0]})`,
  );
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
