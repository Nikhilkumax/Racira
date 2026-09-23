/**
 * adsense-verification.test.ts — proves the AdSense site-verification file
 * reaches a visitor, not just the filesystem.
 *
 * Companion to _scripts/adsense-verify-check.mjs, which guards the file's
 * contents statically in pre-push/CI. That check cannot answer the question
 * that actually matters to Google: does GET /ads.txt on a running server return
 * this record? A file in public/ can fail to be served for reasons the static
 * check never sees — a route handler or rewrite shadowing the path, a stray
 * `export const dynamic`, the file ending up outside the deployed root, or a
 * redirect that turns the plain-text record into a login/404 page.
 *
 * So this test asserts the served response directly:
 *   1. /ads.txt responds 200 (not a redirect, not the app shell);
 *   2. the body is byte-identical to public/ads.txt on disk — if these ever
 *      disagree, something other than the file is answering;
 *   3. it still contains the exact required record, and is served as plain
 *      text so a parser reads it as ADS.TXT rather than HTML.
 *
 * The AdSense client id appears in ads.txt WITHOUT the "ca-" prefix — that is
 * the correct form for ADS.TXT and is deliberate, not a typo.
 */
import { test, expect } from "@playwright/test";
import { readFileSync } from "fs";
import { join } from "path";

const ADS_TXT_PATH = join(process.cwd(), "public", "ads.txt");
const EXPECTED_RECORD = "google.com, pub-7147460072564518, DIRECT, f08c47fec0942fa0";

test.describe("AdSense site verification", () => {
  test("public/ads.txt is present, byte-exact, and contains the required record", () => {
    const onDisk = readFileSync(ADS_TXT_PATH, "utf8");
    const lines = onDisk.split("\n").map((l) => (l.endsWith("\r") ? l.slice(0, -1) : l));
    expect(lines, "ads.txt must hold the AdSense record as its own exact line").toContain(
      EXPECTED_RECORD,
    );
  });

  test("GET /ads.txt serves that record as plain text", async ({ request }) => {
    const res = await request.get("/ads.txt");

    expect(res.status(), "the site root must serve the verification file").toBe(200);
    // A redirect means the record is not actually claimable at the canonical
    // path Google fetches.
    expect(res.url(), "requests for /ads.txt must not be redirected").toContain("/ads.txt");

    const served = (await res.body()).toString("utf8");
    const onDisk = readFileSync(ADS_TXT_PATH, "utf8");
    expect(
      served,
      "the served bytes must match public/ads.txt — otherwise something else is answering this path",
    ).toBe(onDisk);

    const lines = served.split("\n").map((l) => (l.endsWith("\r") ? l.slice(0, -1) : l));
    expect(lines).toContain(EXPECTED_RECORD);

    const contentType = res.headers()["content-type"] ?? "";
    expect(contentType, "ADS.TXT must be served as text, not as HTML").toMatch(/text\/plain/);
  });
});
