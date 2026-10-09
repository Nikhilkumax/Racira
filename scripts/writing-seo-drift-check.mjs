/**
 * Drift gate for the Racira Writing (/writing) SEO JSON pipeline.
 *
 * Usage: node scripts/writing-seo-drift-check.mjs
 *
 * Every `*.json` under src/domains/writing/registry/seo/source is the authored
 * source of truth for the entries it contains. The integration step
 * (scripts/apply-writing-seo-batch.mjs) splices the generated entry into the
 * `b*.ts` file verbatim, so the two must stay byte-identical — otherwise
 * someone hand-edited generated content and the JSON source no longer describes
 * what the page renders.
 *
 * The check re-generates each source with scripts/writing-json-to-seo.mjs into
 * a throwaway directory and hands every generated module to
 * `apply-writing-seo-batch.mjs --check` in one pass, which is the same
 * comparison a careful author would run by hand. Nothing is written to the
 * repository.
 *
 * Before the first writing batch lands there are no JSON sources; the gate then
 * reports nothing to check and exits 0, so prebuild stays green during the
 * legacy-to-JSON migration.
 *
 * Runs in `prebuild` after the source validator, so a drifted entry stops the
 * build instead of waiting for someone to remember --check.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const ROOT = process.cwd();
const SOURCE_DIR = path.join(ROOT, "src", "domains", "writing", "registry", "seo", "source");
const GENERATOR = path.join(ROOT, "scripts", "writing-json-to-seo.mjs");
const APPLIER = path.join(ROOT, "scripts", "apply-writing-seo-batch.mjs");

const fail = (msg) => {
  console.error(`\n\u2717 writing-seo-drift-check: ${msg}`);
  process.exit(1);
};

const sources = fs.existsSync(SOURCE_DIR)
  ? fs
      .readdirSync(SOURCE_DIR)
      .filter((f) => f.toLowerCase().endsWith(".json"))
      .sort()
      .map((f) => path.join(SOURCE_DIR, f))
  : [];

if (sources.length === 0) {
  console.log("\u2713 writing-seo-drift-check: no JSON sources yet — nothing to check");
  process.exit(0);
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "writing-seo-drift-"));
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
      `re-run apply-writing-seo-batch.mjs --write for the source(s) listed above, ` +
      `or fix the batch file back to the generated entry. (${error.message.split("\n")[0]})`,
  );
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
