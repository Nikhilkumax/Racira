// Probe: full analyzeFile output for the 28 needs-rebuild slugs
const fs = require("fs");
const path = require("path");

const componentsDir = "src/domains/calculator/components";
const registryDir = "src/domains/calculator/registry";

const slugs = [
  "step-down-loan-payment-calculator",
  "student-loan-burden-as-of-income-calculator",
  "credit-card-rewards-value-calculator",
  "credit-card-break-even-calculator",
  "mortgage-to-rent-ratio-calculator",
  "ultra-processed-food-percentage-calculator",
  "sports-drink-carb-concentration-calculator",
  "weightlifting-percentage-calculator",
  "twin-pregnancy-weight-gain-calculator",
  "walk-vs-run-calorie-comparison-calculator",
  "yoga-calorie-calculator",
  "steps-to-calories-calculator",
  "weightlifting-session-calorie-calculator",
  "tabata-calorie-calculator",
  "step-count-to-calorie-burn-calculator",
  "stair-climbing-calorie-calculator",
  "water-aerobics-calorie-calculator",
  "sport-specific-calorie-calculator",
  "sedentary-time-cost-calculator",
  "sleep-investment-roi-calculator",
  "vicarious-trauma-risk-calculator",
  "tennis-first-serve-percentage-calculator",
  "waist-to-height-ratio-calculator",
  "skewness-calculator",
  "scientific-calculator",
  "transformer-calculator",
  "tidal-prediction-calculator",
  "ssl-certificate-cost-calculator",
];

// load registry entries with status
const registryFiles = fs.readdirSync(registryDir).filter((f) => f.endsWith(".ts"));
const entries = [];
for (const rf of registryFiles) {
  const content = fs.readFileSync(path.join(registryDir, rf), "utf8");
  const re = /\{\s*slug:\s*"([^"]+)"[\s\S]*?status:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    entries.push({ slug: m[1], status: m[2] });
  }
}
const statusMap = Object.fromEntries(entries.map((e) => [e.slug, e.status]));

// lazyComponents slug -> file
const lazyContent = fs.readFileSync("src/app/calculator/lazyComponents.tsx", "utf8");
const slugToFile = {};
const lazyRe = /"([^"]+)"\s*:\s*\(\)\s*=>\s*import\("([^"]+)"\)/g;
let lm;
while ((lm = lazyRe.exec(lazyContent))) {
  let fname = lm[2].split("/").pop().replace(/["']$/, "");
  if (!fname.endsWith(".tsx")) fname += ".tsx";
  slugToFile[lm[1]] = fname;
}

function pascal(slug) {
  return slug
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join("");
}
function findFileByHeuristic(slug) {
  const cands = [pascal(slug) + "Calculator", pascal(slug) + "Calc", pascal(slug)];
  for (const c of cands) {
    if (fs.existsSync(path.join(componentsDir, c + ".tsx"))) return c + ".tsx";
  }
  return null;
}

// --- copied scan analysis functions ---
const STUB_RE = /Value A|Value B/;
const COMING_SOON_RE = /Coming Soon|This calculator is planned|Back to Calculators/;

function extractButtonTexts(content) {
  const out = [];
  const re = />\s*([^<>{}]{1,40}?)\s*<\/button>/g;
  let m;
  while ((m = re.exec(content)) !== null) out.push(m[1].trim());
  return out;
}
function hasSubtitleUnderH1(content) {
  const idx = content.indexOf("<h1");
  if (idx === -1) return false;
  const after = content.slice(idx, idx + 600);
  // subtitle = <p ...> directly after the h1 close, or a styled div with big text
  if (/<\/h1>\s*<p[^>]*>/.test(after)) return true;
  return false;
}
function extractUseEffects(content) {
  const out = [];
  const re = /useEffect\(\s*\(\s*\)\s*=>\s*\{([\s\S]*?)\}\s*,\s*(\[[^\]]*\])\s*\)/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    out.push({ callback: m[1], deps: m[2] });
  }
  return out;
}

function analyzeFile(content, status) {
  const sizeKB = Buffer.byteLength(content, "utf8") / 1024;
  const hasStub = STUB_RE.test(content);
  const hasComingSoon = COMING_SOON_RE.test(content);
  const hasPrimaryCard = /bg-primary\/10/.test(content) && /border-l-4/.test(content) && /\bborder-primary\b/.test(content);

  const btnTexts = extractButtonTexts(content);
  const calcButtons = btnTexts.filter((t) => /^calculat/i.test(t.trim()));
  const hasCalculate = calcButtons.length > 0;
  const calcLabelWrong = calcButtons.length > 0 && calcButtons.every((t) => t.trim() !== "Calculate");

  const issues = [];
  if (calcLabelWrong) issues.push("button label not exactly 'Calculate'");
  if (hasSubtitleUnderH1(content)) issues.push("subtitle under H1");

  const hasAdvUI = />\s*Advanced Options|Advanced Options\s*<|Advanced Options\s*\{|\{\/\*\s*Advanced Options/.test(content);
  const hasGroupLabel = (() => {
    const re = /className="([^"]*)"/g;
    let m;
    while ((m = re.exec(content)) !== null) {
      const c = m[1];
      if (c.includes("uppercase") && c.includes("tracking") && c.includes("text-muted-foreground") && c.includes("mb-2")) return true;
    }
    const re2 = /"([^"]*)"/g;
    while ((m = re2.exec(content)) !== null) {
      const c = m[1];
      if (c.includes("uppercase") && c.includes("tracking") && c.includes("text-muted-foreground") && c.includes("mb-2")) return true;
    }
    return false;
  })();
  if (hasAdvUI && !hasGroupLabel) issues.push("Advanced Options not grouped into labeled sub-sections");

  let badZero = false;
  const zeroStateRe = /const\s*\[\s*(\w+)[^\]]*\]\s*=\s*useState\(\s*["']?0["']?\s*\)/gi;
  let zm;
  while ((zm = zeroStateRe.exec(content)) !== null) {
    const name = zm[1];
    const optional =
      /^(extra|additional|optional|hoa|onet|annual|apprec|other|misc|grant|incentive|rebate|custom|tip|gift|deload|lump)/i.test(name) ||
      /(extra|additional|optional|fees?|costs?|savings?|incentives?|rebates?|grants?|other|misc)$/i.test(name);
    const isResultState = /(result|results|output|total|percent|data|points|breakdown|computed|calc|answer|error|value|states?|earnings?|balance|payment|premium|amount|savings?|cost|interest|display(ed)?|bmi|ffmi|mass|count|effective|difference|gain|loss|idx|index|page)/i.test(name);
    const isTimeField = /^(s|e|b)m$|^[sedh][0-9]+$|(min|mins|sec|secs|second|seconds|hour|hours|day|days)$/i.test(name);
    if (!optional && !isResultState && !isTimeField) badZero = true;
  }
  if (/defaultValue\s*=\s*["']0["']/.test(content) || /defaultValue\s*=\s*\{\s*0\s*\}/.test(content)) badZero = true;
  if (badZero) issues.push("minor default value (0 instead of realistic)");

  const inputCount = (content.match(/<input\b/g) || []).length + (content.match(/<select\b/g) || []).length;
  const hasAnyTwoCol = /lg:grid-cols-2\b|lg:grid-cols-\[\d+px_1fr\]|xl:grid-cols-\[\d+px_1fr\]|lg:grid-cols-12\b/.test(content);
  if (inputCount > 0 && !hasAnyTwoCol) issues.push("layout: single-column layout, no two-column grid with results (margin/padding mismatch risk)");

  const readonlyRe = /<(?:input|select|textarea)\b[^>]*(?<![A-Za-z0-9_{."'-])\b(?:readOnly|readonly|disabled)\b(?!\s*=\s*\{)[^>]*>/g;
  const readonlyInputs = content.match(readonlyRe);
  if (readonlyInputs && readonlyInputs.length > 0) issues.push("input field is read-only / disabled (non-interactive)");
  const onChangeCount = (content.match(/\bonChange\b/g) || []).length;
  if (inputCount > 0 && onChangeCount === 0) issues.push("inputs not wired to onChange (non-interactive)");

  const unwiredRadios = (content.match(/<input[^>]*type=["']radio["'][^>]*defaultChecked[^>]*>/g) || []).length;
  if (unwiredRadios > 0) issues.push("unwired radio controls (defaultChecked, no onChange — non-interactive)");

  const effects = extractUseEffects(content);
  const watched = effects.filter((e) => {
    const body = e.callback;
    const recalcs = /setResult\w*\s*\(|setOutput\w*\s*\(|calculate\w*\s*\(/.test(body);
    const depsNonEmpty = e.deps !== "" && e.deps.trim() !== "[]";
    return recalcs && depsNonEmpty;
  });
  if (watched.length > 0) issues.push("auto-recalculates on input change (useEffect watches inputs)");

  const failures = [];
  if (hasStub) failures.push("stub placeholder (Value A/Value B)");
  if (status !== "live") failures.push(`status "${status}" in registry`);
  if (sizeKB < 8) failures.push(`file < 8KB (${sizeKB.toFixed(1)}KB)`);
  if (!hasCalculate) failures.push("no Calculate button");
  if (hasComingSoon) failures.push("'Coming Soon' / planned / Back to Calculators text");
  if (!hasPrimaryCard) failures.push("missing primary result card pattern");

  return { sizeKB, failures, issues };
}

for (const slug of slugs) {
  let file = slugToFile[slug] || findFileByHeuristic(slug);
  if (!file) {
    console.log(`${slug} — NO FILE`);
    continue;
  }
  const content = fs.readFileSync(path.join(componentsDir, file), "utf8");
  const a = analyzeFile(content, statusMap[slug] || "?");
  console.log(`== ${slug} -> ${file} [status: ${statusMap[slug] || "?"}]`);
  if (a.failures.length) console.log(`   CORE: ${a.failures.join(" | ")}`);
  if (a.issues.length) console.log(`   ISSUES: ${a.issues.join(" | ")}`);
  if (!a.failures.length && !a.issues.length) console.log("   (clean)");
}