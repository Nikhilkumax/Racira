#!/usr/bin/env node
/**
 * grid-min-w0-check.mjs — static guard for the CSS Grid `min-width: auto` trap.
 *
 * Background: a grid item defaults to `min-width: auto`, so its track can be
 * forced wider than the viewport by any unbreakable child content (wide
 * tables, <pre> output, long unbroken strings). Combined with the site-wide
 * `overflow-x: hidden`, the overflow is silently clipped and unreachable on
 * mobile. The fix is `min-w-0` (or `[&>*]:min-w-0`) on the grid, or a
 * scrollable wrapper around the offending content.
 *
 * What this check does: for every JSX element whose className builds a
 * multi-column grid (`grid-cols-*`), it inspects the element's subtree for
 * content that can force a track wider than the viewport — <table>/<pre>/
 * <textarea>, or a className carrying `overflow-x-auto`/`whitespace-pre`.
 * If such content exists and the grid element itself carries no protection
 * (min-w-0, [&>*]:min-w-0, or an overflow-x wrapper), it reports a finding.
 *
 * This is a heuristic, not an AST: it is tuned to have ZERO findings on the
 * current tree (so it can gate pre-push without noise) while catching new
 * risky grid usage. Findings are printed per file; exit code is 1 when any
 * finding exists (pass --json for CI-friendly output).
 *
 * Usage:
 *   node _scripts/grid-min-w0-check.mjs                  # scan defaults, exit 1 on findings
 *   node _scripts/grid-min-w0-check.mjs --dirs=a,b       # explicit dirs
 *   node _scripts/grid-min-w0-check.mjs --json           # machine-readable
 *
 * NOTE (Git Bash): arguments that begin with a slash get rewritten to Windows
 * paths by MSYS — use full domain paths or the --dirs= form.
 */
import { readFileSync, readdirSync, statSync } from "fs";
import { resolve, join, extname, sep } from "path";

const ROOT = resolve(import.meta.dirname, "..");

const DEFAULT_DIRS = [
  "src/domains/cad/components/tools",
  "src/components/developers",
  "src/lib/developers/tools",
  "src/domains/pdf/components/tool",
];

const args = process.argv.slice(2);
const jsonOut = args.includes("--json");
const dirsArg = args.find((a) => a.startsWith("--dirs="));
const scanDirs = dirsArg
  ? dirsArg.slice(7).split(",").map((d) => resolve(ROOT, d))
  : DEFAULT_DIRS.map((d) => resolve(ROOT, d));

// ── file walk ─────────────────────────────────────────────────────
function collectTsx(dir, acc = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) collectTsx(p, acc);
    else if (extname(e.name) === ".tsx") acc.push(p);
  }
  return acc;
}

// ── minimal JSX scanning helpers ──────────────────────────────────
// maskCommentsAndStrings replaces comments and string-literal CONTENTS with
// spaces of equal length so character indices stay aligned with the raw
// source. Kept separate from the class-detection pass because className
// strings are exactly where grid-cols lives — they must stay readable.
function maskCommentsAndStrings(src) {
  let out = src;
  out = out.replace(/\/\*[\s\S]*?\*\//g, (m) => " ".repeat(m.length));
  out = out.replace(/(^|[^:"'a-zA-Z0-9_])\/\/[^\n\r]*/g, (m) => m[0] + " ".repeat(m.length - 1));
  // template literals first (may contain ${} with quotes inside)
  out = out.replace(/`(?:[^`\\]|\\.)*`/g, (m) => " ".repeat(m.length));
  out = out.replace(/"(?:[^"\\\n]|\\.)*"/g, (m) => " ".repeat(m.length));
  out = out.replace(/'(?:[^'\\\n]|\\.)*'/g, (m) => " ".repeat(m.length));
  return out;
}

// JSX element tags that can carry unbreakable / track-widening content.
const UNCONSTRAINED_TAG = /<(table|pre|textarea)\b/;

/**
 * Scan one file. Returns findings: [{ file, line, tag, detail }]
 *
 * Two passes over aligned sources:
 *  - RAW:  find opening tags whose className builds a multi-column grid
 *          and read their own protection (min-w-0 / [&>*]:min-w-0 / overflow-x)
 *  - MASKED: walk nested JSX to locate the matching close tag without being
 *          fooled by < or > characters inside strings/comments
 *
 * The inner-content risk scan runs on the MASKED slice too, so only real
 * JSX <table>/<pre>/<textarea> elements count — not HTML-looking text that
 * happens to sit inside a string literal.
 */
function scanFile(filePath) {
  const raw = readFileSync(filePath, "utf8");
  const masked = maskCommentsAndStrings(raw);
  const findings = [];
  if (!/grid-cols-/.test(raw)) return findings;

  const lineOf = (idx) => raw.slice(0, idx).split("\n").length;

  // opening-tag scan runs on RAW source so className survives. The tag regex
  // consumes quoted attribute values as a unit so a `>` inside a className
  // (e.g. the arbitrary-variant `[&>*]:min-w-0`) cannot truncate the match.
  const tagRe = /<([A-Za-z][\w.]*)\b((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;
  let m;
  while ((m = tagRe.exec(raw)) !== null) {
    const tagName = m[1];
    const rest = m[2];
    const isGrid = /grid/.test(rest) && /grid-cols-/.test(rest);
    if (!isGrid) continue;
    if (m[0].trim().endsWith("/>")) continue; // self-closing can't hold children

    const gridOpenEnd = m.index + m[0].length;

    // find the matching close tag on MASKED source (strings can't confuse)
    let depth = 0;
    const closeRe = /<\/([A-Za-z][\w.]*)\s*>|<([A-Za-z][\w.]*)\b[^>]*\/?>/g;
    closeRe.lastIndex = gridOpenEnd;
    let innerEnd = -1;
    let cm;
    while ((cm = closeRe.exec(masked)) !== null) {
      if (cm[1]) {
        if (cm[1] === tagName) {
          if (depth === 0) {
            innerEnd = cm.index;
            break;
          }
          depth--;
        }
      } else if (cm[2] === tagName && !cm[0].trim().endsWith("/>")) {
        depth++;
      }
    }
    if (innerEnd === -1) continue; // unbalanced — skip (defensive)

    const rawInner = raw.slice(gridOpenEnd, innerEnd);
    const maskedInner = masked.slice(gridOpenEnd, innerEnd);

    // protection: min-w-0 on the grid itself, OR an overflow-x scroll wrapper
    // somewhere inside (scroll containers have a zero automatic min size, so a
    // table wrapped in one shrinks instead of blowing the track — the site's
    // RefTable pattern).
    const selfProtected =
      /min-w-0/.test(rest) ||
      /\[&>\*\]:min-w-0/.test(rest) ||
      /overflow-x-(auto|scroll)/.test(rest);
    const scrollWrapped = /overflow-x-(auto|scroll)/.test(rawInner);
    if (selfProtected || scrollWrapped) continue;

    // Read a full JSX opening tag (quote-aware) starting at `from` in `src`.
    const tagEnd = (src, from) => {
      const m = src.slice(from).match(/^<[^>]*?(("[^"]*"|'[^']*')[^>]*?)*>/);
      return m ? from + m[0].length : -1;
    };

    // Risk classes (masked inner = real JSX only, not string content):
    //  - <table> unwrapped in a grid: intrinsic min-width = widest cell content
    //  - <pre> whose tag carries no wrap/scroll escape: default white-space:pre
    //    keeps unbroken lines at full width (the overflow:visible spiller)
    //  - <textarea> is deliberately excluded: its automatic min size is bounded
    //    by the cols attribute, so it cannot blow a track like table/pre content
    let risky = false;
    let why = "";
    if (/<table\b/.test(maskedInner)) {
      risky = true;
      why = "a raw <table> not wrapped in a scroll container";
    } else {
      const preRe = /<pre\b/g;
      let pm;
      while ((pm = preRe.exec(maskedInner)) !== null) {
        const rel = pm.index;
        const abs = gridOpenEnd + rel;
        const end = tagEnd(raw, abs);
        const tagText = end === -1 ? raw.slice(abs) : raw.slice(abs, end);
        const safe =
          /whitespace-pre-wrap|break-words|overflow-x-(auto|scroll)|truncate|line-clamp/.test(tagText);
        if (!safe) {
          risky = true;
          why = "a raw <pre> without whitespace-pre-wrap / break-words / a scroll wrapper";
          break;
        }
      }
    }
    if (risky) {
      findings.push({
        file: filePath,
        line: lineOf(m.index),
        tag: tagName,
        detail: `multi-column grid <${tagName}> at line ${lineOf(m.index)} has no min-w-0 / [&>*]:min-w-0 / overflow-x protection and its subtree contains ${why} — wide content can blow the grid track and get clipped by the global overflow-x:hidden on mobile`,
      });
    }
  }
  return findings;
}

// ── run ───────────────────────────────────────────────────────────
const allFindings = [];
for (const dir of scanDirs) {
  for (const file of collectTsx(dir)) {
    allFindings.push(...scanFile(file));
  }
}

if (jsonOut) {
  console.log(
    JSON.stringify(
      { findings: allFindings.map((f) => ({ file: f.file, line: f.line, detail: f.detail })), count: allFindings.length },
      null,
      2
    )
  );
} else {
  for (const f of allFindings) {
    console.log(`⚠  ${f.file.replace(ROOT + sep, "")}:${f.line}`);
    console.log(`    ${f.detail}`);
  }
  console.log(`\n${allFindings.length} grid finding(s) across ${scanDirs.length} dir(s).`);
  if (allFindings.length === 0) console.log("✓ no unprotected multi-column grids with unconstrained content");
}

process.exit(allFindings.length ? 1 : 0);
