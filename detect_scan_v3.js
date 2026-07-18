// RACIRA Detect Scan v3.0
const fs = require("fs");
const path = require("path");

const COMPONENTS_DIR = path.join(__dirname, "src", "domains", "calculator", "components");
const REGISTRY_DIR = path.join(__dirname, "src", "domains", "calculator", "registry");
const APPROVED_JSON = path.join(COMPONENTS_DIR, "_approved.json");
const DB_FINAL = path.join(__dirname, "Calculator_Database_Final.json");
const DB_DIR = path.join(__dirname, "calculator-database");

function listTsxFiles(dir) {
    return fs.readdirSync(dir).filter(f => f.endsWith(".tsx")).map(f => f.replace(/\.tsx$/, ""));
}

function readApproved() {
    try {
        const raw = fs.readFileSync(APPROVED_JSON, "utf8");
        const j = JSON.parse(raw);
        return new Set(j.approved || []);
    } catch (e) { return new Set(); }
}

function readRegistry() {
    const map = new Map();
    const files = fs.readdirSync(REGISTRY_DIR).filter(f => f.endsWith(".ts"));
    for (const f of files) {
        const content = fs.readFileSync(path.join(REGISTRY_DIR, f), "utf8");
        const re = /\{\s*slug:\s*"([^"]+)"[^}]*?name:\s*"([^"]+)"[^}]*?status:\s*"(live|soon)"/g;
        let m;
        while ((m = re.exec(content)) !== null) {
            const slug = m[1], name = m[2], status = m[3];
            const catMatch = content.slice(Math.max(0, m.index - 2000), m.index + 2000).match(/category:\s*"([^"]+)"/);
            const category = catMatch ? catMatch[1] : "UNKNOWN";
            map.set(slug, { slug, name, status, category });
        }
    }
    return map;
}

function readDatabase() {
    const entries = [];
    function addFromCategory(raw, defaultCategory) {
        const category = raw.category || defaultCategory || "UNKNOWN";
        if (raw.subcategories && typeof raw.subcategories === "object") {
            for (const [subName, subObj] of Object.entries(raw.subcategories)) {
                const calcs = subObj && (subObj.calculators || subObj.items || []);
                for (const e of calcs) {
                    if (e && e.slug) {
                        entries.push({
                            slug: e.slug,
                            name: e.name || e.slug,
                            category,
                            subcategory: subName,
                            isBuilt: e.isBuilt === true,
                            tier: e.tier || "",
                            priorityScore: e.priorityScore
                        });
                    }
                }
            }
        }
        const arr = Array.isArray(raw) ? raw : (raw.calculators || raw.entries || []);
        for (const e of arr) {
            if (e && e.slug) {
                entries.push({
                    slug: e.slug,
                    name: e.name || e.slug,
                    category: e.category || category,
                    subcategory: e.subcategory || "",
                    isBuilt: e.isBuilt === true,
                    tier: e.tier || "",
                    priorityScore: e.priorityScore
                });
            }
        }
    }
    if (fs.existsSync(DB_DIR)) {
        for (const f of fs.readdirSync(DB_DIR).filter(f => f.endsWith(".json"))) {
            try {
                const raw = JSON.parse(fs.readFileSync(path.join(DB_DIR, f), "utf8"));
                addFromCategory(raw, path.basename(f, ".json").toUpperCase());
            } catch (e) { }
        }
    }
    if (fs.existsSync(DB_FINAL)) {
        try {
            const raw = JSON.parse(fs.readFileSync(DB_FINAL, "utf8"));
            addFromCategory(raw, "UNKNOWN");
        } catch (e) { }
    }
    const seen = new Set();
    const out = [];
    for (const e of entries) {
        if (!seen.has(e.slug)) { seen.add(e.slug); out.push(e); }
    }
    return out;
}

function slugToPascal(slug) {
    return slug.split(/[-_/]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join("");
}

function findComponentFile(slug, pascalGuess, tsxSet) {
    if (tsxSet.has(pascalGuess)) return pascalGuess;
    const lower = pascalGuess.toLowerCase();
    for (const f of tsxSet) { if (f.toLowerCase() === lower) return f; }
    const compact = slug.replace(/[-_]/g, "");
    for (const f of tsxSet) {
        if (f.toLowerCase().replace(/calculator$/i, "") === compact.toLowerCase().replace(/calculator$/i, "")) return f;
    }
    return null;
}

function analyzeFile(filePath) {
    const result = { exists: false, size: 0, hasCalculate: false, hasChart: false, hasPrimaryResult: false, hasBreakdown: false, hasSummary: false, hasAdvancedOptions: false, hasTieredInputs: false, hasFetch: false, calcLabel: null, h2ClassOk: true, seoWords: 0 };
    try {
        const content = fs.readFileSync(filePath, "utf8");
        result.exists = true;
        result.size = content.length;
        result.hasCalculate = /<button[^>]*>\s*Calculate\s*<\/button>/i.test(content) || /onClick=\{[^}]*calculate/i.test(content);
        result.hasChart = /recharts/i.test(content) || /<(PieChart|BarChart|LineChart|AreaChart|Donut)/i.test(content);
        result.hasPrimaryResult = /text-4xl/i.test(content) && /font-bold/i.test(content);
        result.hasBreakdown = /breakdown|amortization|schedule/i.test(content);
        result.hasSummary = /summary|stat-bar|3-stat/i.test(content);
        result.hasAdvancedOptions = /advanced\s*options|Advanced Options/i.test(content);
        result.hasTieredInputs = result.hasAdvancedOptions;
        result.hasFetch = /\bfetch\s*\(|axios|import.*api/i.test(content);
        const btnMatch = content.match(/<button[^>]*>([^<]*Calculate[^<]*)<\/button>/i);
        result.calcLabel = btnMatch ? btnMatch[1].trim() : null;
        const h2Matches = content.match(/<h2[^>]*className="([^"]*)"/g) || [];
        for (const hm of h2Matches) { if (!/text-2xl font-bold mb-3/.test(hm)) { result.h2ClassOk = false; break; } }
        const seoMatch = content.match(/<section[^>]*mt-12[\s\S]*?<\/section>/);
        if (seoMatch) {
            const text = seoMatch[0].replace(/<[^>]+>/g, " ");
            result.seoWords = text.split(/\s+/).filter(w => w.length > 0).length;
        }
    } catch (e) { result.exists = false; }
    return result;
}

function main() {
    const tsxFiles = listTsxFiles(COMPONENTS_DIR);
    const tsxSet = new Set(tsxFiles);
    const approved = readApproved();
    const registry = readRegistry();
    const database = readDatabase();

    const keep = [], polish = [], rebuild = [], create = [];
    const dbSlugs = new Set();

    for (const db of database) {
        dbSlugs.add(db.slug);
        const reg = registry.get(db.slug);
        const pascal = slugToPascal(db.slug);
        const file = findComponentFile(db.slug, pascal, tsxSet);
        const isApproved = approved.has(pascal) || approved.has(db.slug);
        const isBuilt = reg ? reg.status === "live" : false;

        if (!file) {
            if (isApproved && isBuilt) { keep.push({ name: db.name, slug: db.slug, reason: "approved+live (no file but exempt)" }); }
            else { create.push({ name: db.name, slug: db.slug, category: db.category }); }
            continue;
        }

        const analysis = analyzeFile(path.join(COMPONENTS_DIR, file + ".tsx"));

        if (isApproved && isBuilt) { keep.push({ name: db.name, slug: db.slug, file, reason: "approved+live" }); continue; }

        const coreFails = [];
        if (!isBuilt) coreFails.push("isBuilt:false");
        if (analysis.size < 8000) coreFails.push("file<8KB");
        if (!analysis.hasChart) coreFails.push("no chart");
        if (!analysis.hasCalculate) coreFails.push("no Calculate button");
        if (analysis.hasFetch) coreFails.push("live API");
        if (!analysis.hasTieredInputs) coreFails.push("no tiered inputs");

        if (coreFails.length > 0) { rebuild.push({ name: db.name, slug: db.slug, file, issues: coreFails, category: db.category }); continue; }

        const polishIssues = [];
        if (analysis.seoWords > 0 && analysis.seoWords < 400) polishIssues.push("SEO<400 words");
        if (!analysis.h2ClassOk) polishIssues.push("H2 className");
        if (analysis.calcLabel && analysis.calcLabel !== "Calculate") polishIssues.push("button label");
        if (!analysis.hasAdvancedOptions) polishIssues.push("no Advanced Options");
        if (!analysis.hasSummary) polishIssues.push("no summary stats");

        if (polishIssues.length > 0 && isBuilt) { polish.push({ name: db.name, slug: db.slug, file, issues: polishIssues }); }
        else if (isBuilt) { keep.push({ name: db.name, slug: db.slug, file, reason: "passes all checks" }); }
        else { rebuild.push({ name: db.name, slug: db.slug, file, issues: ["isBuilt:false"], category: db.category }); }
    }

    for (const [slug, reg] of registry) {
        if (!dbSlugs.has(slug)) {
            const pascal = slugToPascal(slug);
            const file = findComponentFile(slug, pascal, tsxSet);
            if (file) {
                const isApproved = approved.has(pascal) || approved.has(slug);
                if (isApproved && reg.status === "live") { keep.push({ name: reg.name, slug, file, reason: "approved+live (orphan)" }); }
            }
        }
    }

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("RACIRA CALCULATOR — DETECT RESULTS");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Database entries total:          " + database.length.toLocaleString());
    console.log("Files in /src/calculators:        " + tsxFiles.length.toLocaleString());
    console.log("Approved (exempt):                " + approved.size.toLocaleString());
    console.log("─────────────────────────────────────────────────────");
    console.log("✅ Keep:     " + keep.length);
    console.log("🟠 Polish:   " + polish.length);
    console.log("🔴 Rebuild:  " + rebuild.length);
    console.log("🟡 Create:   " + create.length);
    console.log("─────────────────────────────────────────────────────");
    console.log("Total work:  " + (polish.length + rebuild.length + create.length));
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🟠 POLISH LIST:");
    for (const p of polish) { console.log("  • " + p.name + " — " + p.issues.join(", ")); }
    console.log("");
    console.log("🔴 REBUILD LIST (first 50):");
    for (const r of rebuild.slice(0, 50)) { console.log("  • " + r.name + " [" + (r.category || "?") + "] — " + r.issues.join(", ")); }
    console.log("");
    console.log("🟡 CREATE LIST (first 50):");
    for (const c of create.slice(0, 50)) { console.log("  • " + c.name + " [" + (c.category || "?") + "]"); }

    fs.writeFileSync("detect_results_v3.json", JSON.stringify({
        summary: { databaseTotal: database.length, filesTotal: tsxFiles.length, approved: approved.size, keep: keep.length, polish: polish.length, rebuild: rebuild.length, create: create.length },
        keep, polish, rebuild, create
    }, null, 2));
    console.log("\nFull results written to detect_results_v3.json");
}

main();