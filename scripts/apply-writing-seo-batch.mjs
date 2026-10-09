/**
 * Integration step for Racira Writing (/writing) SEO batches.
 *
 * Usage:
 *   node scripts/apply-writing-seo-batch.mjs <generated.ts> [more.ts ...] [--check|--write|--dry-run]
 *
 * Takes one or more modules produced by scripts/writing-json-to-seo.mjs and
 * splices each entry into the `b*.ts` file under
 * `src/domains/writing/registry/seo/` that already holds that slug, replacing
 * the old entry block in place — whether the old block is the legacy prose
 * shape or an earlier locked entry. The generated entry is used verbatim, so
 * the content that reaches the page is exactly the content that passed
 * scripts/validate-writing-seo-json.mjs — nothing is retyped by hand.
 *
 * Why splice instead of importing the generated module and spreading it last:
 * a spread would leave the old entry sitting in the batch file, silently
 * shadowed. A future edit there would then have no effect, which is exactly the
 * kind of stale-content trap this pipeline exists to avoid.
 *
 * `--check` verifies every entry in the generated module already matches its
 * batch file byte for byte, and exits non-zero if not. Use it to confirm a
 * batch is integrated, or to catch drift after someone edits generated content
 * by hand.
 *
 * Safety:
 *   - a slug must exist in exactly one batch file, otherwise nothing is written;
 *   - blocks are located with a brace-aware scan that ignores braces inside
 *     strings, so reordering or reformatting an entry cannot mis-slice it;
 *   - with --check, or when nothing changed, no file is touched.
 */
import fs from "node:fs";
import path from "node:path";

const SEO_DIR = path.join("src", "domains", "writing", "registry", "seo");

const args = process.argv.slice(2);
const check = args.includes("--check");
const write = args.includes("--write") || (!check && !args.includes("--dry-run"));
const inputs = args.filter((a) => !a.startsWith("--"));

if (inputs.length === 0) {
  console.error("usage: node scripts/apply-writing-seo-batch.mjs <generated.ts> [more.ts ...] [--check|--write|--dry-run]");
  process.exit(1);
}
for (const file of inputs) {
  if (!fs.existsSync(file)) {
    console.error(`\u2717 apply-writing-seo-batch: no such file: ${file}`);
    process.exit(1);
  }
}

/** Locates every `  "slug": {` block in a module, with a brace-aware scan. */
function extractBlocks(text) {
  const blocks = new Map();
  const keyRe = /^ {2}"([^"]+)": \{\r?$/gm;
  for (const match of text.matchAll(keyRe)) {
    const slug = match[1];
    const open = match.index + match[0].indexOf("{");
    let depth = 0;
    let inString = false;
    let escaped = false;
    let end = -1;
    for (let i = open; i < text.length; i++) {
      const ch = text[i];
      if (inString) {
        if (escaped) escaped = false;
        else if (ch === "\\") escaped = true;
        else if (ch === '"') inString = false;
        continue;
      }
      if (ch === '"') inString = true;
      else if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) {
          end = i + 1;
          break;
        }
      }
    }
    if (end === -1) {
      console.error(`\u2717 apply-writing-seo-batch: unbalanced entry for "${slug}" at ${match.index}`);
      process.exit(1);
    }
    let stop = end;
    if (text[stop] === ",") stop++;
    if (text[stop] === "\r") stop++;
    if (text[stop] === "\n") stop++;
    // Keep the leading newline of the original line out of the block.
    blocks.set(slug, { start: match.index, end: stop, block: text.slice(match.index, stop) });
  }
  return blocks;
}

const targetFiles = fs
  .readdirSync(SEO_DIR)
  .filter((f) => /^b\d+[a-z-]*\.ts$/.test(f))
  .map((f) => path.join(SEO_DIR, f));

if (targetFiles.length === 0) {
  console.error(`\u2717 apply-writing-seo-batch: no b*.ts files found in ${SEO_DIR}`);
  process.exit(1);
}

const sources = targetFiles.map((file) => ({ file, text: fs.readFileSync(file, "utf8") }));

const errors = [];
const plan = [];
let unchanged = 0;

for (const input of inputs) {
  const generated = fs.readFileSync(input, "utf8");
  const genBlocks = extractBlocks(generated);
  if (genBlocks.size === 0) {
    errors.push(`${input}: found no entries — is this a module from writing-json-to-seo.mjs?`);
    continue;
  }
  for (const [slug, gen] of genBlocks) {
    // A slug must live in exactly one batch file before it can be replaced.
    const holders = sources.filter((s) => extractBlocks(s.text).has(slug));
    if (holders.length === 0) {
      errors.push(`${slug}: no existing entry found in any batch file (add the tool to a batch first)`);
      continue;
    }
    if (holders.length > 1) {
      errors.push(`${slug}: found in ${holders.length} batch files (${holders.map((h) => h.file).join(", ")})`);
      continue;
    }
    const holder = holders[0];
    const old = extractBlocks(holder.text).get(slug);
    if (old.block === gen.block) {
      unchanged++;
      continue;
    }
    plan.push({ slug, file: holder.file, old, new: gen.block });
  }
}

if (errors.length) {
  console.error(`\n\u2717 apply-writing-seo-batch failed:`);
  for (const e of errors) console.error(`   - ${e}`);
  console.error("");
  process.exit(1);
}

if (check) {
  if (plan.length > 0) {
    console.error(`\n\u2717 apply-writing-seo-batch --check: ${plan.length} entry(ies) differ from the generated source:`);
    for (const p of plan) console.error(`   - ${p.slug} (${path.basename(p.file)})`);
    console.error("");
    process.exit(1);
  }
  console.log(`\u2713 apply-writing-seo-batch --check: all ${unchanged} entry(ies) match the generated source`);
  process.exit(0);
}

// Apply per file, back to front so earlier offsets stay valid.
const byFile = new Map();
for (const p of plan) {
  if (!byFile.has(p.file)) byFile.set(p.file, []);
  byFile.get(p.file).push(p);
}

for (const [file, entries] of byFile) {
  let text = fs.readFileSync(file, "utf8");
  entries.sort((a, b) => b.old.start - a.old.start);
  for (const e of entries) {
    text = text.slice(0, e.old.start) + e.new + text.slice(e.old.end);
  }
  if (write) {
    fs.writeFileSync(file, text, "utf8");
    console.log(`  ${file}: ${entries.length} entry(ies) replaced`);
  }
}

console.log(
  (write ? "\u2713 apply-writing-seo-batch: " : "\u2713 apply-writing-seo-batch (dry run): ") +
    `${plan.length} entry(ies) updated, ${unchanged} already current`,
);
