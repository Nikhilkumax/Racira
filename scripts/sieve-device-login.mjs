#!/usr/bin/env node
/**
 * One-time sieve device login.
 *
 *   node --experimental-strip-types --no-warnings scripts/sieve-device-login.mjs
 *   node --experimental-strip-types --no-warnings scripts/sieve-device-login.mjs --force
 *
 * Starts the device authorization flow, shows YOU the verification URL and
 * code, and polls until you approve it in the browser. On approval it writes
 * the key into .env.local as SIEVE_API_KEY — the same file Next.js already
 * loads — and prints only a masked fingerprint.
 *
 * This script deliberately does NOT open the link, sign in, or approve
 * anything on your behalf. Approval is your click on sieve's own page, which
 * shows where the code was requested from and warns that the tool name is
 * self-reported. Approve only a code you started yourself.
 *
 * The key is never printed, logged, or passed on the command line.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import process from "node:process";

import {
  DEVICE_LOGIN_SAFETY_TEXT,
  SieveDeviceLoginError,
  runDeviceLogin,
} from "../src/domains/seo/lib/sieve/device-login.ts";
import { maskSecret, parseEnvValue, upsertEnvVar } from "../src/domains/seo/lib/sieve/env-file.ts";

const KEY_NAME = "SIEVE_API_KEY";
const BASE_URL = (process.env.SIEVE_API_BASE_URL || "https://scrape.usesieve.com").replace(/\/+$/, "");
const CLIENT_NAME = process.env.SIEVE_DEVICE_CLIENT_NAME || "Racira Freebuff agent";

const args = process.argv.slice(2);
const force = args.includes("--force");
const envFileArg = args.find((arg) => arg.startsWith("--env-file="));
const envFile = envFileArg ? envFileArg.slice("--env-file=".length) : ".env.local";

function readEnvFile(path) {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function main() {
  const existing = parseEnvValue(readEnvFile(envFile), KEY_NAME);
  if (existing && !force) {
    console.log(`Already configured: ${KEY_NAME}=${maskSecret(existing)} in ${envFile}`);
    console.log("Re-run with --force to replace it, or create an extra key under");
    console.log("Settings → API keys in the sieve dashboard (scope: full account).");
    return 0;
  }

  console.log(`Sieve device login — ${BASE_URL}`);
  console.log(`  ${DEVICE_LOGIN_SAFETY_TEXT}`);
  console.log("");

  return runDeviceLogin({
    baseUrl: BASE_URL,
    clientName: CLIENT_NAME,
    onDeviceCode: (code) => {
      console.log("  Open this URL in your browser:");
      console.log(`    ${code.verification_uri_complete || code.verification_uri}`);
      console.log("");
      console.log(`  Confirm the code shown in the browser matches:  ${code.user_code}`);
      console.log(`  The code expires in ${Math.round(code.expires_in / 60)} minutes and works only once.`);
      console.log("");
      console.log("  Waiting for approval (this can stay open in the background)...");
    },
    onPending: () => {
      process.stdout.write(".");
    },
  })
    .then((result) => {
      process.stdout.write("\n");
      const updated = upsertEnvVar(readEnvFile(envFile), KEY_NAME, result.apiKey);
      writeFileSync(envFile, updated, { encoding: "utf8", mode: 0o600 });

      // Verify by reading the file back — never by printing the value.
      const stored = parseEnvValue(readEnvFile(envFile), KEY_NAME);
      if (stored !== result.apiKey) {
        console.error(`ERROR: ${KEY_NAME} did not land in ${envFile}. Not retrying the write.`);
        console.error("The key was issued; retrieve it from Settings → API keys if needed.");
        return 1;
      }
      console.log(`Wrote ${KEY_NAME}=${maskSecret(stored)} to ${envFile} (mode 0600).`);
      if (result.keyName) console.log(`Sieve key name: ${result.keyName}`);
      console.log("");
      console.log("Next: run the live smoke check (this spends a few credits):");
      console.log("  npx playwright test e2e/sieve-live-smoke.test.ts --grep @live");
      return 0;
    })
    .catch((error) => {
      process.stdout.write("\n");
      if (error instanceof SieveDeviceLoginError) {
        console.error(`Device login failed (${error.code}): ${error.message}`);
        if (error.status !== null) console.error(`  HTTP status: ${error.status}`);
        if (error.detail) console.error(`  response: ${error.detail}`);
        if (error.code === "access_denied") {
          console.error("You declined the request. Nothing was written.");
        } else if (error.code === "expired_token") {
          console.error("The code expired. Re-run this script to start a new one.");
        } else if (error.status === 401) {
          console.error("");
          console.error("The device endpoint answered 401 for an unauthenticated request.");
          console.error("If that persists, create a key in the sieve dashboard instead:");
          console.error("  Settings → API keys → create key, then add to " + envFile + ":");
          console.error(`  ${KEY_NAME}=dc_sk_...   (chmod 600; never commit it)`);
        }
      } else {
        console.error(`Device login failed: ${error?.message ?? error}`);
      }
      return 1;
    });
}

process.exitCode = await main();
