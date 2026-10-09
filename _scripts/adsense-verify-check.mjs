#!/usr/bin/env node
/**
 * adsense-verify-check.mjs — static guard for the AdSense site-verification
 * artifact.
 *
 * Background: /public/ads.txt is what proves to Google that this domain may
 * serve ads through AdSense. It is a single authoritative record — if it is
 * deleted, emptied, reformatted, or silently stopped from being committed, the
 * site loses its verified status and ads stop serving. None of those failures
 * surface in the app: there is no component, no route and no type that changes,
 * so nothing else in the repo would notice. This script is the thing that
 * notices.
 *
 * It checks five ways the artifact can really break:
 *   1. the file is missing (deleted, or renamed);
 *   2. the required record is absent (emptied, replaced with a comment);
 *   3. the record is present but no longer byte-exact — extra whitespace, a
 *      stray leading space, a different publisher id, a different certification
 *      authority id. *This* is the check that catches the quiet breakage: a
 *      reformatted line still looks fine to a human and still parses to a
 *      human, but is no longer the record Google was told to expect;
 *   4. the file exists locally but is git-ignored, so it never reaches a
 *      deployment (a local-only pass with a production-only failure);
 *   5. the file exists and is not ignored, but is untracked — it only ever
 *      existed on one machine, so a fresh clone (and every build made from it)
 *      never receives the record at all. Deleting it and recreating it by hand
 *      fails this check until it is added to the index again.
 *
 * Deliberately permissive about a *trailing* newline and CRLF line endings:
 * those are checkout/editor artifacts, not content errors, and ADS.TXT parsers
 * ignore them. Whitespace anywhere inside the line is NOT tolerated.
 *
 * Adding further ad-network records below the required one is allowed — the
 * required record must be present and exact, not the only line in the file.
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

/** The exact record Google must find. Any byte-level change is a failure. */
const EXPECTED_RECORD = "google.com, pub-7147460072564518, DIRECT, f08c47fec0942fa0";
/** The publisher id on its own, used to recognise a *mangled* required record
 *  (so it is reported as "changed" rather than "missing"). */
const PUBLISHER_ID = "7147460072564518";

const ADS_TXT = join(repoRoot, "public", "ads.txt");

const findings = [];

/** Report a failure with the fix in the message — this runs in pre-push, where
 *  a bare "check failed" costs the reader a trip to the source. */
function fail(detail) {
  findings.push(detail);
}

// ── 1. presence ───────────────────────────────────────────────────
if (!existsSync(ADS_TXT)) {
  // Distinguish "no public/ dir at all" (wrong tree) from "file deleted".
  const publicDir = join(repoRoot, "public");
  fail(
    existsSync(publicDir)
      ? `${ADS_TXT} is missing. AdSense site verification depends on it — restore the file (it is committed) rather than working around it.`
      : `no public/ directory under ${repoRoot} — is --root pointing at the app?`,
  );
} else if (!statSync(ADS_TXT).isFile()) {
  fail(`${ADS_TXT} exists but is not a regular file.`);
} else {
  // ── 2/3. content ────────────────────────────────────────────────
  const raw = readFileSync(ADS_TXT, "utf8");
  // Split on \n only, and strip a single trailing \r, so CRLF checkouts (Windows
  // + no .gitattributes normalization) do not read as content errors while every
  // other whitespace difference still does.
  const lines = raw.split("\n").map((l) => (l.endsWith("\r") ? l.slice(0, -1) : l));

  const hasExactRecord = lines.some((l) => l === EXPECTED_RECORD);
  const mentionsPublisher = lines.some((l) => l.includes(PUBLISHER_ID));
  // A google.com record that is not the required one (different ids, extra
  // spacing, wrong relationship) silently overrides what Google expects.
  const conflicting = lines
    .map((l, i) => ({ l, i: i + 1 }))
    .filter(({ l }) => /^\s*google\.com\s*,/i.test(l) && l !== EXPECTED_RECORD);

  // Lines already explained by the finding below, so a mangled record is
  // reported once rather than twice (as "changed" and as "conflicting").
  const alreadyReported = new Set();

  if (!hasExactRecord) {
    if (mentionsPublisher) {
      const idx = lines.findIndex((l) => l.includes(PUBLISHER_ID)) + 1;
      alreadyReported.add(idx);
      fail(
        `${ADS_TXT}:${idx} carries the AdSense publisher id but is not byte-exact. ` +
          `Expected line ${idx}: "${EXPECTED_RECORD}" — whitespace and ` +
          `field order are part of the record, so a reformatted line still fails verification.`,
      );
    } else if (conflicting.length) {
      alreadyReported.add(conflicting[0].i);
      fail(
        `${ADS_TXT}:${conflicting[0].i} replaces the required AdSense record with "${conflicting[0].l.trim()}". ` +
          `Expected exactly: "${EXPECTED_RECORD}".`,
      );
    } else {
      fail(
        `${ADS_TXT} does not contain the required AdSense record "${EXPECTED_RECORD}" ` +
          `(file has ${lines.filter((l) => l.trim()).length} non-empty line(s)).`,
      );
    }
  }

  // Any *other* google.com record is a real problem even when the required one
  // is present: two relationships for one publisher is an ambiguous file, and
  // Google resolves it against whoever intends to serve.
  for (const { l, i } of conflicting) {
    if (alreadyReported.has(i)) continue;
    fail(
      `${ADS_TXT}:${i} declares a second, non-matching google.com relationship ("${l.trim()}"). ` +
        `Keep the required record exactly as written; append extra networks below it.`,
    );
  }

  // ── 4/5. is it actually committable? ────────────────────────────
  // A git-ignored ads.txt works on the machine that has it and 404s in the
  // deployed build. `git check-ignore` exits 0 when ignored, 1 when not, 128 on
  // error (no repo / no git) — only the 0 case is a finding.
  const ignore = spawnSync("git", ["check-ignore", "-q", ADS_TXT], {
    cwd: repoRoot,
    stdio: "ignore",
  });
  if (ignore.status === 0) {
    fail(
      `${ADS_TXT} is matched by .gitignore, so it would never be deployed. ` +
        `Un-ignore it (a verified ads.txt must ship with the site).`,
    );
  }

  // The other half of the same failure: present and not ignored, but never
  // added to the index. `git ls-files --error-unmatch` exits 0 when the path is
  // tracked, 1 when git does not know it, 128 on error (no repo / no git) — so
  // again only the one status that means "this file is not going to be
  // committed" is a finding. A recreated-by-hand file reads as correct on disk
  // and still never reaches a deployment; this is what catches that.
  const tracked = spawnSync("git", ["ls-files", "--error-unmatch", "public/ads.txt"], {
    cwd: repoRoot,
    stdio: "ignore",
  });
  if (tracked.status === 1) {
    fail(
      `public/ads.txt is not tracked by git, so it is not part of any commit and ` +
        `nothing will serve it. Add it (git add public/ads.txt) — do not recreate ` +
        `it per machine.`,
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
    console.log(`✓ /public/ads.txt present, byte-exact and tracked (${EXPECTED_RECORD})`);
  }
}

process.exit(findings.length ? 1 : 0);
