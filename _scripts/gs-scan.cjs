// Gold Standard target scanner: maps requested slugs -> registry status,
// lazyComponents route, component file, approval, deficits.
// Usage: node _scripts/gs-scan.cjs
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const CD = path.join(ROOT, "src/domains/calculator/components");
const LAZY = path.join(ROOT, "src/app/calculator/lazyComponents.tsx");
const APPR = path.join(CD, "_approved.json");

const SLUGS = [
  "radiator-size-calculator",
  "mechanical-seal-pressure-calculator",
  "shipping-insurance-cost-calculator",
  "angel-investment-return-calculator",
  "age-difference-calculator",
  "fraction-calculator",
  "concrete-weight-calculator",
  "density-calculator",
  "pipe-flow-calculator",
  "fuel-consumption-calculator",
  "torque-calculator",
  "reynolds-number-calculator",
  "bmi-calculator",
  "bmr-calculator",
  "body-fat-percentage-calculator",
  "calorie-calculator",
  "calorie-intake-calculator",
  "pregnancy-calculator",
  "pregnancy-due-date-calculator",
  "mortgage-calculator",
  "loan-calculator",
  "compound-interest-calculator",
  "investment-calculator",
  "retirement-calculator",
  "percentage-calculator",
  "discount-calculator",
  "sales-tax-calculator",
  "tip-calculator",
  "gpa-calculator",
  "grade-calculator",
  "time-calculator",
  "date-calculator",
  "age-calculator",
  "scientific-calculator",
  "statistics-calculator",
  "probability-calculator",
  "standard-deviation-calculator",
  "mean-median-mode-calculator",
  "quadratic-formula-calculator",
];

function readEntries() {
  const dir = path.join(ROOT, "src/domains/calculator/registry");
  const out = [];
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".ts"))) {
    const text = fs.readFileSync(path.join(dir, f), "utf8");
    for (const line of text.split(/\r?\n/)) {
      const s = /slug:\s*"([^"]+)"/.exec(line);
      if (!s) continue;
      out.push({
        file: f,
        slug: s[1],
        name: (/name:\s*"([^"]+)"/.exec(line) || [])[1] || "",
        cat: (/category:\s*"([^"]+)"/.exec(line) || [])[1] || "",
        sub: (/subcategory:\s*"([^"]+)"/.exec(line) || [])[1] || "",
        status: (/status:\s*"([^"]+)"/.exec(line) || [])[1] || "",
      });
    }
  }
  return out;
}

const pascal = (s) =>
  s
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");

function main() {
  const entries = readEntries();
  const bySlug = Object.fromEntries(entries.map((e) => [e.slug, e]));
  const lazy = fs.readFileSync(LAZY, "utf8");
  const approved = JSON.parse(fs.readFileSync(APPR, "utf8"));
  const apprSet = new Set([...(approved.approved || []), ...(approved.slugs || [])]);

  const rows = [];
  for (const slug of SLUGS) {
    const entry = bySlug[slug] || null;
    const routeRe = new RegExp('"' + slug + '":\\s*\\(\\)\\s*=>\\s*import\\("([^"]+)"\\)');
    const m = routeRe.exec(lazy);
    const routeComp = m ? m[1].split("/").pop() : "";

    let file = routeComp ? routeComp + ".tsx" : "";
    if (!file || !fs.existsSync(path.join(CD, file))) {
      file = "";
      const p = pascal(slug);
      for (const c of [p, p + "Calculator", p + "Calc", p + "Full"]) {
        if (fs.existsSync(path.join(CD, c + ".tsx"))) {
          file = c + ".tsx";
          break;
        }
      }
    }
    const name = file.replace(/\.tsx$/, "");
    rows.push({
      slug,
      registry: entry ? entry.status : "NOT_IN_REGISTRY",
      file: entry ? entry.file : "",
      cat: entry ? entry.cat : "",
      sub: entry ? entry.sub : "",
      wired: !!m,
      component: file || "",
      exists: !!file,
      approved: file ? apprSet.has(name) : false,
    });
  }

  fs.writeFileSync(path.join(ROOT, "_gs_targets.json"), JSON.stringify(rows, null, 1));
  const pad = (s, n) => String(s).padEnd(n);
  console.log(pad("slug", 40) + pad("reg", 16) + pad("wired", 7) + pad("component", 44) + "approved");
  for (const r of rows) {
    console.log(
      pad(r.slug, 40) + pad(r.registry, 16) + pad(r.wired ? "yes" : "no", 7) + pad(r.component || "—", 44) + (r.exists ? (r.approved ? "yes" : "NO") : "n/a"),
    );
  }
  const summary = {
    total: rows.length,
    live: rows.filter((r) => r.registry === "live").length,
    soon: rows.filter((r) => r.registry === "soon").length,
    missing: rows.filter((r) => r.registry === "NOT_IN_REGISTRY").length,
    withComponent: rows.filter((r) => r.exists).length,
    wired: rows.filter((r) => r.wired).length,
  };
  console.log("\n" + JSON.stringify(summary, null, 1));
}

main();
