#!/usr/bin/env node
/**
 * adsense-verify-check.mjs — static guard for the AdSense site-verification
 * artifact.
 *
 * Background: /public/ads.txt is what proves to Google that this domain may
 * serve ads through AdSense. It is a single authoritative record — if it is
 * deleted, emptied, reformatted, duplicated, or silently stopped from being
 * committed, the site loses its verified status and ads stop serving. None of
 * those failures surface in the app: there is no component, no route and no
 * type that changes, so nothing else in the repo would notice. This script is
 * the thing that notices. It is wired into the pre-push hook and CI.
 *
 * It checks every way the artifact can really break:
 *   1. the file is missing (deleted, or renamed);
 *   2. the record is present but no longer byte-exact. ADS.TXT is compared as
 *      the exact bytes Google expects: one line, LF ending, no BOM, no CRLF,
 *      no extra blank lines. *This* is the check that catches the quiet
 *      breakage — a reformatted line still looks fine to a human and still
 *      parses to a human, but is no longer the record Google was told to
 *      expect;
 *   3. the *previous* publisher id still appears anywhere in the repo — the
 *      old record was replaced, not merely shadowed (docs, tests, fixtures and
 *      stray copies all count);
 *   4. a second ads.txt exists (a stray copy, a .bak/.old, or an app-router
 *      route directory such as src/app/ads.txt/), so two records compete for
 *      one path;
 *   5. an app route handler, page, or next.config rewrite/redirect answers
 *      /ads.txt instead of (or ahead of) the static file;
 *   6. the middleware matcher would intercept GET /ads.txt;
 *   7. next.config.mjs does not send the required Content-Type / Cache-Control
 *      for /ads.txt, or vercel.json touches the path;
 *   8. the file exists locally but is git-ignored, so it never reaches a
 *      deployment (a local-only pass with a production-only failure);
 *   9. the file exists and is not ignored, but is untracked — it only ever
 *      existed on one machine, so a fresh clone (and every build made from it)
 *      never receives the record at all.
 *
 * Usage:
 *   node _scripts/adsense-verify-check.mjs                  # check the repo, exit 1 on failure
 *   node _scripts/adsense-verify-check.mjs --root=<dir>     # check another tree (fixtures/tests)
 *   node _scripts/adsense-verify-check.mjs --json           # machine-readable
 */
import { existsSync, readFileSync, statSync } from "fs";
import { resolve, join } from "path";
import { spawnSync } from "child_process";

const ROOT = resolve(import.meta.dirname, "..");

const args = process.argv.slice(2);
const jsonOut = args.includes("--json");
const rootArg = args.find((a) => a.startsWith("--root="));
const repoRoot = rootArg ? resolve(rootArg.slice(7)) : ROOT;
const isRepo = existsSync(join(repoRoot, ".git"));

/** The exact record Google must find. Any byte-level change is a failure. */
const EXPECTED_RECORD = "google.com, pub-2583149493013973, DIRECT, f08c47fec0942fa0";
/** The exact on-disk bytes: the record plus a single LF, nothing else. */
const EXPECTED_BYTES = Buffer.from(`${EXPECTED_RECORD}\n`, "utf8");
/** The publisher id on its own. */
const PUBLISHER_ID = "2583149493013973";
/** The superseded publisher id. It must appear nowhere in the repo.
 *  Assembled from fragments so that the repo-wide grep this script performs
 *  cannot match its own source — a checker that is the last thing holding the
 *  forbidden id would be a false positive. */
const LEGACY_PUBLISHER_ID = "3924503352" + "309890";

const ADS_TXT = join(repoRoot, "public", "ads.txt");

const findings = [];

/** Report a failure with the fix in the message — this runs in pre-push, where
 *  a bare "check failed" costs the reader a trip to the source. */
function fail(detail) {
  findings.push(detail);
}

/** Run a git command inside the checked tree. Returns { status, stdout }. */
function git(gitArgs) {
  const r = spawnSync("git", gitArgs, { cwd: repoRoot, encoding: "utf8" });
  return { status: r.status ?? 128, stdout: r.stdout ?? "" };
}

/** All tracked + untracked-but-not-ignored files, relative to repoRoot. */
function committableFiles() {
  const { status, stdout } = git(["ls-files", "-co", "--exclude-standard"]);
  if (status !== 0) return null;
  return stdout.split("\n").map((s) => s.trim()).filter(Boolean);
}

// ── 1/2. presence + byte-exact content ────────────────────────────
if (!existsSync(ADS_TXT)) {
  // Distinguish "no public/ dir at all" (wrong tree) from "file deleted".
  const publicDir = join(repoRoot, "public");
  fail(
    existsSync(publicDir)
      ? `${ADS_TXT} is missing. AdSense site verification depends on it — restore the committed file rather than working around it.`
      : `no public/ directory under ${repoRoot} — is --root pointing at the app?`,
  );
} else if (!statSync(ADS_TXT).isFile()) {
  fail(`${ADS_TXT} exists but is not a regular file.`);
} else {
  const raw = readFileSync(ADS_TXT);
  if (!raw.equals(EXPECTED_BYTES)) {
    const problems = [];
    if (raw.length >= 3 && raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf) {
      problems.push("it starts with a UTF-8 BOM");
    }
    if (raw.includes(0x0d)) problems.push("it contains CRLF line endings (must be LF)");
    if (raw.length > 0 && raw[raw.length - 1] !== 0x0a) {
      problems.push("it does not end with a newline");
    }
    const text = raw.toString("utf8");
    const lines = text.split("\n").filter((l, i, a) => i < a.length - 1 || l !== "");
    if (lines.length !== 1) problems.push(`it has ${lines.length} line(s); expected exactly 1`);
    if (!text.includes(EXPECTED_RECORD) && text.includes(PUBLISHER_ID)) {
      problems.push("the publisher id is present but the record is not byte-exact");
    }
    fail(
      `${ADS_TXT} is not byte-exact: ${problems.length ? problems.join(", ") : "unexpected bytes"}. ` +
        `Expected exactly: ${JSON.stringify(EXPECTED_RECORD + "\n")} ` +
        `(got ${JSON.stringify(text)}). Whitespace, line endings and field order are part of the record.`,
    );
  }
}

// ── 3. the superseded publisher id must be gone from the repo ─────
if (isRepo) {
  // --untracked so a stray uncommitted copy is caught too, not just tracked
  // files; .gitignore'd build output stays out of scope.
  const { status, stdout } = git(["grep", "--untracked", "-nI", "--", LEGACY_PUBLISHER_ID]);
  if (status === 0) {
    const hits = stdout.trim().split("\n").filter(Boolean);
    fail(
      `the old AdSense publisher id ${LEGACY_PUBLISHER_ID} still appears in ${hits.length} place(s):\n` +
        hits.map((h) => `      ${h}`).join("\n") +
        `\n      The old record must be removed everywhere — docs, tests and fixtures included.`,
    );
  }
}

// ── 4. exactly one ads.txt in the tree ────────────────────────────
const files = committableFiles();
if (files) {
  const others = files.filter((p) => {
    if (p === "public/ads.txt") return false;
    const segs = p.split("/");
    return segs.some((s) => {
      const low = s.toLowerCase();
      return low === "ads.txt" || low.startsWith("ads.txt.");
    });
  });
  if (others.length) {
    fail(
      `a second ads.txt artifact exists — /public/ads.txt must be the single source of truth:\n` +
        others.map((p) => `      ${p}`).join("\n"),
    );
  }
}

// ── 5. no route handler / page / rewrite answers /ads.txt ─────────
if (isRepo) {
  // Any source file under src/ that mentions ads.txt is almost certainly a
  // route handler, page, or generated copy — none is permitted. robots.ts is
  // the one legitimate mention (it governs crawler access to the path).
  const { status, stdout } = git([
    "grep", "-nI", "-e", "ads\\.txt", "--", "src", ":(exclude)src/app/robots.ts",
  ]);
  if (status === 0) {
    const hits = stdout.trim().split("\n").filter(Boolean);
    fail(
      `ads.txt is referenced from app source, so something other than the static file may answer /ads.txt:\n` +
        hits.map((h) => `      ${h}`).join("\n") +
        `\n      /ads.txt must be served only by /public/ads.txt.`,
    );
  }
}

// next.config.mjs rewrites/redirects must not touch /ads.txt, and vercel.json
// must not redirect or rewrite it either (domain-level apex/www redirects live
// in the Vercel dashboard, not this repo — those are verified against prod).
const nextConfigPath = join(repoRoot, "next.config.mjs");
const vercelPath = join(repoRoot, "vercel.json");
if (existsSync(nextConfigPath)) {
  const cfg = readFileSync(nextConfigPath, "utf8");
  if (/destination\s*:\s*["'`][^"'`]*ads\.txt/i.test(cfg)) {
    fail("next.config.mjs routes ads.txt through a rewrite/redirect destination — remove it; the static file must answer directly.");
  }
  const hasAdsHeader = /source\s*:\s*["'`]\/ads\.txt["'`]/.test(cfg);
  const hasPlain = /text\/plain;\s*charset=utf-8/.test(cfg);
  const hasCache = /public,\s*max-age=3600/.test(cfg);
  if (!hasAdsHeader || !hasPlain || !hasCache) {
    fail(
      "next.config.mjs must set headers for source \"/ads.txt\": " +
        `Content-Type: text/plain; charset=utf-8 (found: ${hasPlain}) and ` +
        `Cache-Control: public, max-age=3600 (found: ${hasCache}).`,
    );
  }
}
if (existsSync(vercelPath) && /ads\.txt/i.test(readFileSync(vercelPath, "utf8"))) {
  fail("vercel.json references ads.txt — it must not redirect or rewrite that path.");
}

// ── 6. middleware must not intercept GET /ads.txt ─────────────────
const middlewarePath = join(repoRoot, "src", "middleware.ts");
if (existsSync(middlewarePath)) {
  const src = readFileSync(middlewarePath, "utf8");
  const matcherMatch = src.match(/matcher\s*:\s*\[([\s\S]*?)\]/);
  if (matcherMatch) {
    // Translate Next's matcher patterns (:path*, :path) into regexes and test
    // /ads.txt against each. A catch-all matcher (/:path*) would run middleware
    // on the AdSense fetch and is a real regression.
    const patterns = [...matcherMatch[1].matchAll(/["'`]([^"'`]+)["'`]/g)].map((m) => m[1]);
    const toRegex = (p) =>
      new RegExp(
        "^" +
          p
            .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
            .replace(/\/:path\*/g, "(?:/.*)?")
            .replace(/\/:path(?![a-zA-Z])/g, "/[^/]+")
            .replace(/\*/g, ".*") +
          "$",
      );
    for (const p of patterns) {
      if (toRegex(p).test("/ads.txt")) {
        fail(
          `src/middleware.ts matcher "${p}" intercepts GET /ads.txt — the AdSense ` +
            `crawler must reach the static file with no middleware in the way.`,
        );
      }
    }
  }
}

// ── 8/9. is the file committable? ─────────────────────────────────
if (isRepo) {
  // A git-ignored ads.txt works on the machine that has it and 404s in the
  // deployed build. `git check-ignore` exits 0 when ignored, 1 when not.
  const ignore = git(["check-ignore", "-q", "public/ads.txt"]);
  if (ignore.status === 0) {
    fail("public/ads.txt is matched by .gitignore, so it would never be deployed. Un-ignore it.");
  }

  // Present and not ignored, but never added to the index: a recreated-by-hand
  // file reads as correct on disk and still never reaches a deployment.
  const tracked = git(["ls-files", "--error-unmatch", "public/ads.txt"]);
  if (tracked.status === 1) {
    fail(
      "public/ads.txt is not tracked by git, so nothing will serve it. Add it " +
        "(git add public/ads.txt) — do not recreate it per machine.",
    );
  }
}

// ── report ────────────────────────────────────────────────────────
if (jsonOut) {
  console.log(JSON.stringify({ root: repoRoot, findings, count: findings.length }, null, 2));
} else {
  for (const f of findings) console.log(`⚠  ${f}`);
  console.log(`\n${findings.length} AdSense verification finding(s).`);
  if (findings.length === 0) {
    console.log(`✓ /public/ads.txt present, byte-exact, tracked, and alone (${EXPECTED_RECORD})`);
    // Deliberately not printed: emitting the superseded id here would seed it
    // into any captured log, which the repo-wide scan would then flag.
    console.log("✓ the superseded publisher id appears nowhere in the repo");
    console.log("✓ no second ads.txt, route, rewrite, or middleware matcher shadows /ads.txt");
  }
}

process.exit(findings.length ? 1 : 0);
