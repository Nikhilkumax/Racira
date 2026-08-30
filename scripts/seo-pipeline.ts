/**
 * Combined SEO Pipeline
 *
 * Validates a JSON batch file, converts it to TypeScript, and optionally
 * injects it into tool-seo.ts.
 *
 * Usage:
 *   npx tsx scripts/seo-pipeline.ts scratch/seo-batch.json [--inject]
 *
 * Without --inject: validates and generates scratch/seo-batch-generated.ts
 * With --inject: also inserts into src/domains/pdf/registry/tool-seo.ts
 *
 * This replaces the manual write-TS → fix-FAQ-structure → apply cycle.
 */

import { readFileSync, writeFileSync } from "fs";

// Re-run validation inline
const inputFile = process.argv[2];
const doInject = process.argv.includes("--inject");

if (!inputFile) {
  console.error("Usage: npx tsx scripts/seo-pipeline.ts <input.json> [--inject]");
  process.exit(1);
}

// Step 1: Validate
console.log("Step 1: Validating JSON...");
const validateResult = require("child_process").execSync(
  `npx tsx scripts/validate-seo-json.ts ${inputFile}`,
  { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }
);
console.log(validateResult);

if (validateResult.includes("FAILED")) {
  console.error("Pipeline aborted — fix validation errors first");
  process.exit(1);
}

// Step 2: Convert
console.log("Step 2: Converting to TypeScript...");
const convertResult = require("child_process").execSync(
  `npx tsx scripts/json-to-seo.ts ${inputFile}`,
  { encoding: "utf8" }
);
console.log(convertResult);

const generatedPath = inputFile.replace(".json", "-generated.ts");
console.log("Generated: " + generatedPath);

// Step 3: Compile check
console.log("Step 3: TypeScript compilation check...");
try {
  require("child_process").execSync(
    `npx tsc --noEmit --strict --target ES2020 ${generatedPath} 2>&1 | grep -v node_modules | grep "error TS"`,
    { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }
  );
  console.log("Compilation: PASSED\n");
} catch (e: any) {
  const output = e.stdout || "";
  if (output.includes("error TS")) {
    console.error("Compilation FAILED:\n" + output);
    process.exit(1);
  }
  console.log("Compilation: PASSED (only non-critical warnings)\n");
}

if (!doInject) {
  console.log("Done. Run with --inject to insert into tool-seo.ts");
  process.exit(0);
}

// Step 4: Inject into tool-seo.ts
console.log("Step 4: Injecting into tool-seo.ts...");
const toolSeoPath = "src/domains/pdf/registry/tool-seo.ts";
const toolSeo = readFileSync(toolSeoPath, "utf8");
const generated = readFileSync(generatedPath, "utf8");

const marker = "const explicitSeo: Record<string, ToolSeo> = {";
const idx = toolSeo.indexOf(marker);
if (idx === -1) {
  console.error("Marker not found in tool-seo.ts");
  process.exit(1);
}

const result = toolSeo.slice(0, idx) + generated + "\n\n\n" + toolSeo.slice(idx);

// Deduplicate consecutive };
const lines = result.split("\n");
const deduped: string[] = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === "};" && i > 0 && lines[i - 1].trim() === "};") continue;
  deduped.push(lines[i]);
}

writeFileSync(toolSeoPath, deduped.join("\n"), "utf8");

// Step 5: Final compile check on the full file
console.log("Step 5: Final compilation check on tool-seo.ts...");
try {
  require("child_process").execSync(
    `npx tsc --noEmit src/domains/pdf/registry/tool-seo.ts 2>&1 | grep -v node_modules | grep "error TS"`,
    { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }
  );
  console.log("Final compilation: PASSED");
} catch (e: any) {
  const output = e.stdout || "";
  if (output.includes("error TS")) {
    console.error("Final compilation FAILED:\n" + output);
    console.error("Reverting...");
    writeFileSync(toolSeoPath, toolSeo, "utf8");
    process.exit(1);
  }
  console.log("Final compilation: PASSED");
}

console.log("\nPipeline complete. " + inputFile + " → tool-seo.ts");
