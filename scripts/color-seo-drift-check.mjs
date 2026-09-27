/**
 * Drift gate for the Color Tools SEO JSON pipeline.
 *
 * Usage: node scripts/color-seo-drift-check.mjs
 *
 * Every `*.json` under src/domains/colors/seo/source is the authored source of
 * truth for the entries it contains. The integration step
 * (scripts/apply-color-seo-batch.mjs) splices the generated entry into the
 * `batch*.ts` file verbatim, so the two must stay byte-identical — otherwise
 * someone hand-edited generated content and the JSON source no longer describes
 * what the page renders.
 *
 * The check re-generates each source with scripts/color-json-to-seo.mjs into a
 * throwaway directory and hands every generated module to
 * `apply-color-seo-batch.mjs --check` in one pass, which is the same comparison
 * a careful author would run by hand. Nothing is written to the repository.
 *
 * Runs in `prebuild` after the source validator, so a drifted entry stops the
 * build instead of waiting for someone to remember --check.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const ROOT = process.cwd();
const SOURCE_DIR = path.join(ROOT, "src", "domains", "colors", "seo", "source");
const GENERATOR = path.join(ROOT, "scripts", "color-json-to-seo.mjs");
const APPLIER = path.join(ROOT, "scripts", "apply-color-seo-batch.mjs");

const fail = (msg) => {
  console.error(`\n\u2717 color-seo-drift-check: ${msg}`);
  process.exit(1);
};

if (!fs.existsSync(SOURCE_DIR)) fail(`missing source directory: ${SOURCE_DIR}`);

const sources = fs
  .readdirSync(SOURCE_DIR)
  .filter((f) => f.toLowerCase().endsWith(".json"))
  .sort()
  .map((f) => path.join(SOURCE_DIR, f));

if (sources.length === 0) {
  console.log("\u2713 color-seo-drift-check: no JSON sources yet — nothing to check");
  process.exit(0);
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "color-seo-drift-"));
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
      `re-run apply-color-seo-batch.mjs --write for the source(s) listed above, ` +
      `or fix the batch file back to the generated entry. (${error.message.split("\n")[0]})`,
  );
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
