/**
 * sieve-live-smoke.test.ts — the one live call against the real API.
 *
 * SKIPPED unless SIEVE_LIVE_SMOKE=1 and a key is available, because it spends
 * credits. Get a key with:
 *   node --experimental-strip-types --no-warnings scripts/sieve-device-login.mjs
 *
 * then run:
 *   SIEVE_LIVE_SMOKE=1 npx playwright test e2e/sieve-live-smoke.test.ts --grep @live
 *
 * It uses the real client with the real 5s→30s polling schedule and no short
 * timeout, so it can take several minutes. The key is read from the process
 * env or .env.local and is never printed.
 *
 * This is a live check, not production verification: it proves the wire
 * contract against the real service once, nothing more.
 */

import { test } from "@playwright/test";
import assert from "node:assert/strict";
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";

import { createSieveClient } from "../src/domains/seo/lib/sieve/client.server";
import { conformanceVerdict } from "../src/domains/seo/lib/sieve/request";
import { parseEnvValue } from "../src/domains/seo/lib/sieve/env-file";

function apiKey(): string | null {
  const fromEnv = process.env.SIEVE_API_KEY?.trim();
  if (fromEnv) return fromEnv;
  if (!existsSync(".env.local")) return null;
  return parseEnvValue(readFileSync(".env.local", "utf8"), "SIEVE_API_KEY")?.trim() || null;
}

const key = apiKey();
const live = process.env.SIEVE_LIVE_SMOKE === "1" && Boolean(key);

test.describe("sieve live smoke @live", () => {
  test.skip(!live, "set SIEVE_LIVE_SMOKE=1 with SIEVE_API_KEY in .env.local; this spends a few credits");
  test.describe.configure({ timeout: 20 * 60 * 1000, retries: 0 });

  test("quotes.toscrape.com: 202 → poll to done → download the delivered file", async () => {
    const client = createSieveClient({ apiKey: key as string });

    const started = await client.startRun({
      instruction: "Extract the text and author of each quote",
      target_urls: ["https://quotes.toscrape.com/"],
      fields: ["quote", "author"],
      table_shape: "long",
    });
    // The procedure's required evidence, printed so the run can be audited.
    console.log(`sieve session_id: ${started.sessionId}`);
    console.log(`poll path: ${started.poll}`);
    assert.ok(started.sessionId, "202 must carry a session_id");

    // Same durability rule as the app: persist the session_id the instant the
    // 202 arrives, so a killed process resumes this run instead of paying for a
    // duplicate. .freebuff/ is gitignored and holds no secret.
    mkdirSync(".freebuff", { recursive: true });
    appendFileSync(".freebuff/sieve-live-sessions.txt", `${new Date().toISOString()} ${started.sessionId}\n`);

    const snapshots: string[] = [];
    const snapshot = await client.waitForRun(started.sessionId, {
      // No short deadline: runs take minutes. onSnapshot keeps the transcript
      // honest about how long it actually took.
      onSnapshot: (s) => void snapshots.push(String(s.status)),
    });
    console.log(`status: ${snapshot.status} after ${snapshots.length} polls (${snapshots.join(" → ")})`);

    if (snapshot.status === "refused") {
      console.log(`refused: ${JSON.stringify(snapshot.refusal)}`);
      assert.fail(`the live run was refused (${snapshot.refusal?.code ?? "unknown"})`);
    }

    const verdict = conformanceVerdict(snapshot.schema_conformance);
    console.log(`schema_conformance: ${verdict.status} — ${verdict.message}`);
    // No output_schema was requested, so nothing checkable is expected — and a
    // "fail" must never be reported as clean data either way.
    if (snapshot.schema_conformance) {
      assert.notEqual(snapshot.schema_conformance.status, undefined);
    }

    assert.ok(snapshot.files && snapshot.files.length > 0, "a delivered file is expected");
    const file = snapshot.files[0];
    console.log(`file: ${file.name} (${file.size} bytes, .${file.ext})`);
    const bytes = await client.downloadFile(file);
    assert.ok(bytes.byteLength > 0, `downloaded ${file.name} with content`);
    if (file.size > 0) {
      assert.equal(
        bytes.byteLength,
        file.size,
        `downloaded size matches the reported size for ${file.name}`,
      );
    }
    console.log(`downloaded ${bytes.byteLength} bytes`);
  });
});
