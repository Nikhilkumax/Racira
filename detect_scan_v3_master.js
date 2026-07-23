/**
 * MASTER BUILD PROMPT v3.0 — RACIRA CALCULATOR DETECT SCAN
 * Runs Scan A (tsx files), Scan B (database + registry), Scan C (_approved.json)
 * Categorizes into 4 buckets: KEEP / POLISH / REBUILD / CREATE
 */
const fs = require('fs');
const path = require('path');

const ROOT = 'c:\\Racira\\racira-nextjs';
const COMPONENTS_DIR = path.join(ROOT, 'src', 'domains', 'calculator', 'components');
const REGISTRY_DIR = path.join(ROOT, 'src', 'domains', 'calculator', 'registry');
const DB_FILE = path.join(ROOT, 'Calculator_Database_Final.json');
const DB_DIR = path.join(ROOT, 'calculator-database');

// ---------- Helpers ----------
function readText(p) {
    try { return fs.readFileSync(p, 'utf8'); } catch { return null; }
}
function readJSON(p) {
    try { return JSON.parse(fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '')); } catch { return null; }
}
function toPascalCase(slug) {
    return slug
        .split(/[-/]+/)
        .filter(Boolean)
        .map(s => s.charAt(0).toUpperCase() + s.slice(1))
        .join('');
}
function titleCaseToPascal(name) {
    return name
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .split(/\s+/)
        .filter(Boolean)
        .map(s => s.charAt(0).toUpperCase() + s.slice(1))
        .join('');
}
function pascalToSlug(pascal) {
    return pascal
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

// ---------- Scan A: .tsx files in components ----------
const tsxFiles = new Set();
if (fs.existsSync(COMPONENTS_DIR)) {
    for (const f of fs.readdirSync(COMPONENTS_DIR)) {
        if (f.endsWith('.tsx')) tsxFiles.add(f);
    }
}

function findTsxForSlug(slug) {
    const pascal = toPascalCase(slug);
    const candidates = [
        `${pascal}Calculator.tsx`,
        `${pascal}.tsx`,
        `${titleCaseToPascal(slug)}Calculator.tsx`,
    ];
    for (const c of candidates) {
        if (tsxFiles.has(c)) return c;
    }
    for (const f of tsxFiles) {
        if (f.startsWith(pascal)) return f;
    }
    return null;
}

// ---------- Scan B: registry (isBuilt = status === "live") ----------
const registrySlugs = new Map();
const regFiles = fs.existsSync(REGISTRY_DIR) ? fs.readdirSync(REGISTRY_DIR).filter(f => f.endsWith('.ts')) : [];
for (const rf of regFiles) {
    const txt = readText(path.join(REGISTRY_DIR, rf)) || '';
    const re = /\{\s*slug:\s*"([^"]+)"[^}]*?status:\s*"(live|soon)"/g;
    let m;
    while ((m = re.exec(txt)) !== null) {
        const slug = m[1];
        const status = m[2];
        const nameMatch = m[0].match(/name:\s*"([^"]+)"/);
        const catMatch = m[0].match(/category:\s*"([^"]+)"/);
        const tierMatch = m[0].match(/tier:\s*"([^"]+)"/);
        registrySlugs.set(slug, {
            name: nameMatch ? nameMatch[1] : slug,
            category: catMatch ? catMatch[1] : '',
            status,
            tier: tierMatch ? tierMatch[1] : '',
            isBuilt: status === 'live',
        });
    }
}

// ---------- Scan B2: Calculator_Database_Final.json + per-category db files ----------
// Database structure: { CATEGORY: { SUBCATEGORY: [ "Calc Name 1", "Calc Name 2", ... ] } }
const dbSlugs = new Set();
const dbNames = new Set();
function collectDbNames(obj) {
    if (Array.isArray(obj)) {
        for (const e of obj) {
            if (typeof e === 'string') { dbNames.add(e); dbSlugs.add(titleCaseToPascal(e) + 'Calculator'); }
            else if (e && typeof e === 'object') {
                if (e.slug) dbSlugs.add(e.slug);
                if (e.name) dbNames.add(e.name);
                if (e.id) dbSlugs.add(e.id);
            }
        }
    } else if (obj && typeof obj === 'object') {
        for (const k of Object.keys(obj)) {
            if (Array.isArray(obj[k])) {
                collectDbNames(obj[k]);
            } else if (obj[k] && typeof obj[k] === 'object') {
                collectDbNames(obj[k]);
            }
        }
    }
}
const dbFinal = readJSON(DB_FILE);
if (dbFinal) collectDbNames(dbFinal);
if (fs.existsSync(DB_DIR)) {
    for (const f of fs.readdirSync(DB_DIR)) {
        if (!f.endsWith('.json')) continue;
        const j = readJSON(path.join(DB_DIR, f));
        if (j) collectDbNames(j);
    }
}

// ---------- Scan C: _approved.json ----------
const approvedSlugs = new Set();
const approvedCandidates = [
    path.join(ROOT, 'src', 'domains', 'calculator', 'components', '_approved.json'),
    path.join(ROOT, 'src', 'calculators', '_approved.json'),
    path.join(ROOT, 'src', 'domains', 'calculator', '_approved.json'),
    path.join(ROOT, '_approved.json'),
    path.join(ROOT, 'src', '_approved.json'),
];
let approvedPath = null;
for (const p of approvedCandidates) {
    if (fs.existsSync(p)) { approvedPath = p; break; }
}
if (approvedPath) {
    const aj = readJSON(approvedPath);
    const addApproved = (e) => {
        if (typeof e === 'string') {
            // _approved.json stores PascalCase component names (e.g. "AutoLeaseCalculator")
            // Convert to slug form (e.g. "auto-lease-calculator") for matching
            if (/^[A-Z]/.test(e) && /[a-z]/.test(e) && !e.includes('-')) {
                approvedSlugs.add(pascalToSlug(e));
            } else {
                approvedSlugs.add(e);
            }
        } else if (e && e.slug) {
            approvedSlugs.add(e.slug);
        }
    };
    if (Array.isArray(aj)) {
        for (const e of aj) addApproved(e);
    } else if (aj && typeof aj === 'object') {
        // Handle { "approved": [...] } structure
        if (Array.isArray(aj.approved)) {
            for (const e of aj.approved) addApproved(e);
        }
        // Also check other array properties (skip non-array meta fields)
        for (const k of Object.keys(aj)) {
            if (k === 'approved') continue;
            if (Array.isArray(aj[k])) {
                for (const e of aj[k]) addApproved(e);
            }
        }
    }
}

// ---------- Content checks ----------
function analyzeTsx(filePath) {
    const txt = readText(filePath) || '';
    const size = txt.length;
    const hasCalculateButton = /\bCalculate\b/.test(txt);
    const hasRecharts = /recharts|<PieChart|<BarChart|<LineChart|<AreaChart|<DonutChart|ResponsiveContainer/.test(txt);
    const hasFetch = /\bfetch\s*\(|axios|\.get\s*\(|\.post\s*\(/.test(txt);
    const hasUseState = /useState/.test(txt);
    const hasResult = /result|Result/.test(txt);
    return { txt, size, hasCalculateButton, hasRecharts, hasFetch, hasUseState, hasResult };
}

// ---------- Categorize ----------
const keep = [];
const polish = [];
const rebuild = [];
const create = [];

for (const [slug, info] of registrySlugs) {
    const tsx = findTsxForSlug(slug);
    const inApproved = approvedSlugs.has(slug);
    const isBuilt = info.isBuilt;

    if (inApproved && isBuilt) {
        keep.push({ slug, name: info.name, category: info.category, reason: 'approved+isBuilt' });
        continue;
    }

    if (!tsx) {
        create.push({ slug, name: info.name, category: info.category, reason: 'no .tsx file' });
        continue;
    }

    const fp = path.join(COMPONENTS_DIR, tsx);
    const a = analyzeTsx(fp);

    const coreFails = [];
    if (!isBuilt) coreFails.push('isBuilt:false');
    if (a.size < 8000) coreFails.push(`file<8KB(${a.size})`);
    if (!a.hasCalculateButton) coreFails.push('no Calculate button');
    if (a.hasFetch) coreFails.push('live API call');
    if (!a.hasUseState) coreFails.push('no tiered input (useState)');
    if (!a.hasRecharts) coreFails.push('no Recharts chart');

    if (coreFails.length > 0) {
        rebuild.push({ slug, name: info.name, category: info.category, file: tsx, issues: coreFails.join(', ') });
        continue;
    }

    const polishIssues = [];
    if (!/text-2xl font-bold mb-3/.test(a.txt)) polishIssues.push('H2 className not text-2xl font-bold mb-3');
    if (!/>Calculate</.test(a.txt)) polishIssues.push('Calculate button label not exactly "Calculate"');
    if (/Advanced Options/i.test(a.txt) && !/uppercase tracking-wide/i.test(a.txt)) {
        polishIssues.push('Advanced Options not grouped into labeled sub-sections');
    }

    if (polishIssues.length > 0) {
        polish.push({ slug, name: info.name, category: info.category, file: tsx, issues: polishIssues.join('; ') });
    } else {
        keep.push({ slug, name: info.name, category: info.category, reason: 'passes all checks' });
    }
}

// ---------- Output ----------
const fmt = (n) => n.toLocaleString('en-US');
const total = keep.length + polish.length + rebuild.length + create.length;

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('RACIRA CALCULATOR — DETECT RESULTS');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`Database entries total:          ${fmt(dbNames.size)}`);
console.log(`Files in /src/calculators:        ${fmt(tsxFiles.size)}`);
console.log(`Registry slugs total:             ${fmt(registrySlugs.size)}`);
console.log(`Approved (exempt):                 ${fmt(approvedSlugs.size)}`);
console.log('─────────────────────────────────────────────────────');
console.log(`✅ Keep:     ${fmt(keep.length)}`);
console.log(`🟠 Polish:   ${fmt(polish.length)}`);
console.log(`🔴 Rebuild:  ${fmt(rebuild.length)}`);
console.log(`🟡 Create:   ${fmt(create.length)}`);
console.log('─────────────────────────────────────────────────────');
console.log(`Total work:  ${fmt(total)}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

if (polish.length > 0) {
    console.log('\n🟠 POLISH LIST:');
    for (const p of polish) console.log(`  • ${p.name} (${p.slug}) — ${p.issues}`);
}
if (rebuild.length > 0) {
    console.log('\n🔴 REBUILD LIST (first 50):');
    for (const r of rebuild.slice(0, 50)) console.log(`  • ${r.name} (${r.slug}) — ${r.issues}`);
    if (rebuild.length > 50) console.log(`  ... and ${rebuild.length - 50} more`);
}
if (create.length > 0) {
    console.log('\n🟡 CREATE LIST (first 50):');
    for (const c of create.slice(0, 50)) console.log(`  • ${c.name} (${c.slug}) — ${c.reason}`);
    if (create.length > 50) console.log(`  ... and ${create.length - 50} more`);
}

const report = {
    summary: {
        databaseEntries: dbSlugs.size,
        tsxFiles: tsxFiles.size,
        registrySlugs: registrySlugs.size,
        approved: approvedSlugs.size,
        keep: keep.length,
        polish: polish.length,
        rebuild: rebuild.length,
        create: create.length,
        totalWork: total,
    },
    approvedPath,
    keep, polish, rebuild, create,
};
fs.writeFileSync(path.join(ROOT, 'detect_results_v3_master.json'), JSON.stringify(report, null, 2));
console.log('\nReport written: detect_results_v3_master.json');