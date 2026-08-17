/* Runtime verification of the 22 ported security tools.
 * Loads the compiled devs tool module (scratch/out) and runs each transform
 * with test inputs, asserting outputs. Also checks the registry state. */
const path = require("path");
const Module = require("module");
const nodeCrypto = require("crypto");
const http = require("http");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "scratch", "out");

const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  if (request.startsWith("@/")) return path.join(OUT, request.slice(2) + ".js");
  return origResolve.call(this, request, ...args);
};

const { securityTools } = require(path.join(OUT, "lib/developers/tools/security.js"));
const { PASSPHRASE_WORDS } = require(path.join(OUT, "lib/developers/tools/security-algorithms.js"));

const bySlug = new Map(securityTools.map((t) => [t.slug, t]));

const NEW_SLUGS = [
  "passphrase-generator", "password-entropy-calculator", "password-pattern-analyzer",
  "common-password-checker", "password-length-estimator", "pin-generator",
  "memorable-password-generator", "password-comparison-tool", "aes-encryption-decryption-tool",
  "rsa-key-generator", "elliptic-curve-key-generator", "caesar-cipher-tool", "vigenre-cipher-tool",
  "xor-cipher-tool", "rail-fence-cipher-tool", "zero-width-character-inserter", "jwt-validator",
  "hash-comparison-tool", "csp-validator", "subresource-integrity-generator",
  "api-key-format-detector", "jwt-hs256-verifier",
];

const results = [];
function check(name, ok, detail) {
  results.push({ name, ok: !!ok, detail });
}

const run = async (slug, input, secondInput, options) => {
  const def = bySlug.get(slug);
  if (!def) throw new Error(`no definition for ${slug}`);
  const res = await def.transform({ input, secondInput, options: { ...(def.defaultOptions ?? {}), ...options } });
  return res;
};

// ---------- helpers ----------
const b64url = (s) => Buffer.from(s).toString("base64url");
function signHS256(header, payload, secret) {
  const data = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`;
  const sig = nodeCrypto.createHmac("sha256", secret).update(data).digest("base64url");
  return `${data}.${sig}`;
}
function zwDecodeSecret(s) {
  const ZW = ["\u200B", "\u200C", "\u200D", "\u2060"];
  const map = {};
  ZW.forEach((c, i) => (map[c] = i));
  const zwChars = [...s].filter((c) => map[c] !== undefined);
  let bits = "";
  for (const c of zwChars) bits += map[c].toString(2).padStart(2, "0");
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes).toString("utf8");
}
async function importSpkiPem(pem, algo, usages) {
  const b64 = pem.split("\n").filter((l) => !l.startsWith("-----")).join("");
  const der = Buffer.from(b64, "base64");
  return globalThis.crypto.subtle.importKey("spki", der, algo, false, usages);
}
function fmtCrackTime(seconds) {
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)}h`;
  if (seconds < 31536000) return `${(seconds / 86400).toFixed(1)}d`;
  return `${(seconds / 31536000).toExponential(2)} years`;
}

// ---------- registration checks ----------
check("all 22 slugs registered in securityTools", NEW_SLUGS.every((s) => bySlug.has(s)),
  `found ${NEW_SLUGS.filter((s) => bySlug.has(s)).length}/22`);
const dupSlugs = [...new Set(securityTools.map((t) => t.slug).filter((s, i, a) => a.indexOf(s) !== i))];
check("no duplicate slugs in securityTools", dupSlugs.length === 0, JSON.stringify(dupSlugs));
check("word list identical to security domain (501 words)", PASSPHRASE_WORDS.length === 501,
  `${PASSPHRASE_WORDS.length} words`);

(async () => {
  // 1. passphrase-generator
  {
    const out1 = (await run("passphrase-generator", "", "", { count: 5, sep: "-" })).output;
    const words1 = out1.split("-");
    const okShape = words1.length === 5 && words1.every((w) => PASSPHRASE_WORDS.includes(w));
    const out2 = (await run("passphrase-generator", "", "", { count: 4, sep: "_" })).output;
    const okShape2 = out2.split("_").length === 4 && out2.split("_").every((w) => PASSPHRASE_WORDS.includes(w));
    check("passphrase-generator: 5 words joined by '-'", okShape, out1);
    check("passphrase-generator: respects count/separator", okShape2, out2);
  }

  // 2. password-entropy-calculator
  {
    const r = await run("password-entropy-calculator", "password", "", {});
    const exp = (8 * Math.log2(26)).toFixed(1);
    check("password-entropy-calculator: 'password' → 8 chars, pool 26, " + exp + " bits",
      r.output.includes("Length: 8") && r.output.includes("Character pool: 26") && r.output.includes(`${exp} bits`),
      JSON.stringify(r.output));
  }

  // 3. password-pattern-analyzer
  {
    const r = await run("password-pattern-analyzer", "Password123!", "", {});
    check("password-pattern-analyzer: detects common sequence",
      r.output.includes("Common sequence detected") && !r.output.includes("Length below 10"),
      JSON.stringify(r.output));
    const r2 = await run("password-pattern-analyzer", "aaa", "", {});
    check("password-pattern-analyzer: flags short/repeated", r2.output.includes("Repeated characters (3+)") && r2.output.includes("Length below 10"), JSON.stringify(r2.output));
  }

  // 4. common-password-checker
  {
    const r = await run("common-password-checker", "PASSWORD", "", {});
    const r2 = await run("common-password-checker", "Xk9!correctHorse", "", {});
    check("common-password-checker: case-insensitive hit", r.output.includes("Found in common password list"), r.output);
    check("common-password-checker: non-common miss", r2.output.includes("Not in built-in common list"), r2.output);
  }

  // 5. password-length-estimator
  {
    const r = await run("password-length-estimator", "", "", { len: 12, pool: 94 });
    const exp = fmtCrackTime(Math.pow(94, 12) / 1e10);
    check("password-length-estimator: len12/pool94 → " + exp, r.output.includes(exp), r.output);
  }

  // 6. pin-generator
  {
    const outs = [];
    for (let i = 0; i < 3; i++) outs.push((await run("pin-generator", "", "", { len: 8 })).output);
    check("pin-generator: 8-digit numeric ×3", outs.every((o) => /^\d{8}$/.test(o)), outs.join(","));
  }

  // 7. memorable-password-generator
  {
    const outs = [];
    for (let i = 0; i < 5; i++) outs.push((await run("memorable-password-generator", "", "", {})).output);
    const shapeOk = outs.every((o) => /^[A-Z][a-z]+-[a-z]+\d{2}[!@#$%&?]$/.test(o));
    check("memorable-password-generator: Word-Word##sym shape ×5", shapeOk, outs.join(" | "));
  }

  // 8. password-comparison-tool
  {
    const same = (await run("password-comparison-tool", "abc", "abc", {})).output;
    const diff = (await run("password-comparison-tool", "abc", "abd", {})).output;
    check("password-comparison-tool: identical → Identical", same === "✓ Identical", same);
    check("password-comparison-tool: different → Different", diff === "✗ Different", diff);
  }

  // 9. aes-encryption-decryption-tool
  {
    const ct = (await run("aes-encryption-decryption-tool", "hello secret", "", { mode: "encrypt", password: "p@ss" })).output;
    const pt = (await run("aes-encryption-decryption-tool", ct, "", { mode: "decrypt", password: "p@ss" })).output;
    check("aes-encryption-decryption-tool: roundtrip", pt === "hello secret", `ct=${ct.slice(0, 24)}… → ${JSON.stringify(pt)}`);
    let threw = false;
    try {
      await run("aes-encryption-decryption-tool", ct, "", { mode: "decrypt", password: "WRONG" });
    } catch (e) {
      threw = e.message.includes("Decryption failed");
    }
    check("aes-encryption-decryption-tool: wrong password fails", threw, "threw as expected");
  }

  // 10. rsa-key-generator
  {
    const r = (await run("rsa-key-generator", "", "", {})).output;
    const pubOk = r.includes("-----BEGIN PUBLIC KEY-----") && r.includes("-----END PUBLIC KEY-----");
    const prvOk = r.includes("-----BEGIN PRIVATE KEY-----") && r.includes("-----END PRIVATE KEY-----");
    let importOk = false;
    try {
      const pubPem = r.split("\n\n")[0];
      await importSpkiPem(pubPem, { name: "RSA-OAEP", hash: "SHA-256" }, ["encrypt"]);
      importOk = true;
    } catch (e) {
      importOk = false;
    }
    check("rsa-key-generator: PEM blocks present", pubOk && prvOk, `pub=${pubOk} prv=${prvOk}`);
    check("rsa-key-generator: public key imports as RSA-OAEP SPKI", importOk, "WebCrypto importKey ok");
  }

  // 11. elliptic-curve-key-generator
  {
    const r = (await run("elliptic-curve-key-generator", "", "", {})).output;
    const pubOk = r.includes("-----BEGIN PUBLIC KEY-----") && r.includes("-----END PUBLIC KEY-----");
    let importOk = false;
    try {
      const pubPem = r.split("\n\n")[0];
      await importSpkiPem(pubPem, { name: "ECDSA", namedCurve: "P-256" }, ["verify"]);
      importOk = true;
    } catch (e) {
      importOk = false;
    }
    check("elliptic-curve-key-generator: PEM blocks present", pubOk, "pub=" + pubOk);
    check("elliptic-curve-key-generator: public key imports as ECDSA P-256 SPKI", importOk, "WebCrypto importKey ok");
  }

  // 12. caesar-cipher-tool
  {
    const r = (await run("caesar-cipher-tool", "HELLO World!", "", { shift: 3 })).output;
    check("caesar-cipher-tool: shift 3 → 'KHOOR Zruog!'", r === "KHOOR Zruog!", r);
    const back = (await run("caesar-cipher-tool", r, "", { shift: -3 })).output;
    check("caesar-cipher-tool: shift -3 roundtrip", back === "HELLO World!", back);
  }

  // 13. vigenre-cipher-tool
  {
    const enc = (await run("vigenre-cipher-tool", "HELLO", "", { key: "KEY", mode: "enc" })).output;
    const dec = (await run("vigenre-cipher-tool", enc, "", { key: "KEY", mode: "dec" })).output;
    check("vigenre-cipher-tool: HELLO/KEY → RIJVS", enc === "RIJVS", enc);
    check("vigenre-cipher-tool: decrypt roundtrip", dec === "HELLO", dec);
  }

  // 14. xor-cipher-tool
  {
    const r = (await run("xor-cipher-tool", "abc", "", { key: "k" })).output;
    check("xor-cipher-tool: abc^k → base64 of [10,9,8] = 'CgkI'", r === "CgkI", r);
    const r2 = (await run("xor-cipher-tool", "hello", "", { key: "xyz" })).output;
    const exp2 = Buffer.from([...Buffer.from("hello")].map((b, i) => b ^ "xyz".charCodeAt(i % 3))).toString("base64");
    check("xor-cipher-tool: matches reference XOR", r2 === exp2, `${r2} vs ${exp2}`);
  }

  // 15. rail-fence-cipher-tool
  {
    const enc = (await run("rail-fence-cipher-tool", "WEAREDISCOVEREDFLEEATONCE", "", { rails: 3, mode: "enc" })).output;
    check("rail-fence-cipher-tool: classic 3-rail vector", enc === "WECRLTEERDSOEEFEAOCAIVDEN", enc);
    const dec = (await run("rail-fence-cipher-tool", enc, "", { rails: 3, mode: "dec" })).output;
    check("rail-fence-cipher-tool: decrypt roundtrip", dec === "WEAREDISCOVEREDFLEEATONCE", dec);
  }

  // 16. zero-width-character-inserter
  {
    const r = (await run("zero-width-character-inserter", "cover text here", "", { secret: "hi" })).output;
    const hostOk = r.startsWith("cover text here") && r.length > "cover text here".length;
    const decoded = zwDecodeSecret(r);
    check("zero-width-character-inserter: host + invisible chars", hostOk, `len=${r.length}`);
    check("zero-width-character-inserter: secret decodes to 'hi'", decoded === "hi", JSON.stringify(decoded));
  }

  // 17. jwt-validator
  {
    const now = Math.floor(Date.now() / 1000);
    const good = signHS256({ alg: "HS256", typ: "JWT" }, { iss: "racira", sub: "123", exp: now + 3600 }, "secret");
    const expired = signHS256({ alg: "HS256", typ: "JWT" }, { iss: "racira", sub: "123", exp: now - 3600 }, "secret");
    const noClaims = signHS256({ alg: "HS256", typ: "JWT" }, { exp: now + 3600 }, "secret");
    const ok = (await run("jwt-validator", good, "", {})).output;
    const expOut = (await run("jwt-validator", expired, "", {})).output;
    const missOut = (await run("jwt-validator", noClaims, "", {})).output;
    const malOut = (await run("jwt-validator", "abc", "", {})).output;
    check("jwt-validator: valid token passes", ok === "✓ Structure valid, no temporal issues.", ok);
    check("jwt-validator: expired flagged", expOut.includes("Expired (exp="), expOut);
    check("jwt-validator: missing iss/sub flagged", missOut.includes("Missing iss claim") && missOut.includes("Missing sub claim"), missOut);
    check("jwt-validator: malformed flagged", malOut.includes("3 dot-separated parts"), malOut);
  }

  // 18. hash-comparison-tool
  {
    const same = (await run("hash-comparison-tool", "ABC123", "abc123", {})).output;
    const diff = (await run("hash-comparison-tool", "abc", "abd", {})).output;
    check("hash-comparison-tool: case-insensitive match", same === "✓ Match", same);
    check("hash-comparison-tool: different → Different", diff === "✗ Different", diff);
  }

  // 19. csp-validator
  {
    const bad = (await run("csp-validator", "default-src 'self'; script-src 'self' 'unsafe-inline'", "", {})).output;
    const clean = (await run("csp-validator", "default-src 'self'; frame-ancestors 'none'", "", {})).output;
    check("csp-validator: flags unsafe-inline + missing frame-ancestors",
      bad.includes("unsafe-inline") && bad.includes("frame-ancestors"), JSON.stringify(bad));
    check("csp-validator: clean CSP passes", clean === "✓ No common issues detected.", clean);
  }

  // 20. subresource-integrity-generator (fetch is mocked; no network needed)
  {
    const realFetch = globalThis.fetch;
    const body = Buffer.from("hello", "utf8");
    globalThis.fetch = async () => new Response(body);
    try {
      const r = (await run("subresource-integrity-generator", "https://cdn.example.com/app.js", "", { algo: "SHA-256" })).output;
      const exp = `sha256-${nodeCrypto.createHash("sha256").update(body).digest("base64")}`;
      check("subresource-integrity-generator: matches sha256 of served asset", r === exp, `${r} vs ${exp}`);
      const r384 = (await run("subresource-integrity-generator", "https://cdn.example.com/app.js", "", { algo: "SHA-384" })).output;
      const exp384 = `sha384-${nodeCrypto.createHash("sha384").update(body).digest("base64")}`;
      check("subresource-integrity-generator: SHA-384 variant", r384 === exp384, `${r384.slice(0, 16)}… vs ${exp384.slice(0, 16)}…`);
    } finally {
      globalThis.fetch = realFetch;
    }
    globalThis.fetch = async () => {
      throw new Error("network unreachable");
    };
    let threw = false;
    try {
      await run("subresource-integrity-generator", "https://cdn.example.com/none.js", "", { algo: "SHA-256" });
    } catch (e) {
      threw = e.message.includes("Fetch failed");
    }
    globalThis.fetch = realFetch;
    check("subresource-integrity-generator: bad URL throws", threw, "threw as expected");
  }

  // 21. api-key-format-detector
  {
    const stripe = (await run("api-key-format-detector", "sk_live_abcdefghijklmnopqrstuvwxyz12", "", {})).output;
    const gh = (await run("api-key-format-detector", "ghp_abcdefghijklmnopqrstuvwxyzABCDEFGHIJ", "", {})).output;
    const none = (await run("api-key-format-detector", "randomvalue", "", {})).output;
    check("api-key-format-detector: detects Stripe live secret", stripe === "✓ Matches: Stripe Live Secret", stripe);
    check("api-key-format-detector: detects GitHub PAT", gh.includes("GitHub PAT (classic)"), gh);
    check("api-key-format-detector: unknown → no match", none === "No known format matched.", none);
  }

  // 22. jwt-hs256-verifier
  {
    const token = signHS256({ alg: "HS256", typ: "JWT" }, { sub: "123" }, "s3cret");
    const ok = (await run("jwt-hs256-verifier", token, "", { secret: "s3cret" })).output;
    const bad = (await run("jwt-hs256-verifier", token, "", { secret: "wrong" })).output;
    check("jwt-hs256-verifier: correct secret verifies", ok === "✓ Signature valid (HS256)", ok);
    check("jwt-hs256-verifier: wrong secret rejected", bad === "✗ Signature does NOT match", bad);
  }

  // ---------- registry state checks ----------
  const reg = fs.readFileSync(path.join(ROOT, "src/domains/developers/registry.ts"), "utf8");
  const pairs = [...reg.matchAll(/\[\"([^\"]+)\", \"([^\"]+)\"\]/g)];
  check("registry: 316 tools", pairs.length === 316, `${pairs.length}`);
  const names = pairs.map((m) => m[1]);
  const newNames = ["Passphrase Generator", "Password Entropy Calculator", "Password Pattern Analyzer", "Common Password Checker", "Password Length Estimator", "PIN Generator", "Memorable Password Generator", "Password Comparison Tool", "AES Encryption/Decryption Tool", "RSA Key Generator", "Elliptic Curve Key Generator", "Caesar Cipher Tool", "Vigenère Cipher Tool", "XOR Cipher Tool", "Rail Fence Cipher Tool", "Zero-Width Character Inserter", "JWT Validator", "Hash Comparison Tool", "CSP Validator", "Subresource Integrity Generator", "API Key Format Detector", "JWT HS256 Verifier"];
  check("registry: all 22 new names present", newNames.every((n) => names.includes(n)),
    `missing: ${JSON.stringify(newNames.filter((n) => !names.includes(n)))}`);
  const builtMatch = reg.match(/const built = new Set\(\[([^\]]*)\]/);
  const builtSlugs = builtMatch ? builtMatch[1].split(",").map((s) => s.replace(/"/g, "").trim()).filter(Boolean) : [];
  const all51 = [
    "hash-generator", "bcrypt-generator", "uuid-generator", "password-strength-checker", "jwt-decoder",
    "jwt-generator", "jwt-expiry-checker", "jwt-visualizer", "jwt-rs256-verifier", "token-strength-analyzer",
    "random-password-generator", "random-api-key-generator", "sha-512-generator", "sha-256-generator",
    "sha-1-generator", "md5-generator", "hmac-generator", "crc32-calculator", "htpasswd-generator",
    "basic-auth-generator", "pkce-generator", "oauth-url-generator", "session-token-decoder",
    "file-hash-checker", "api-key-formatter", "qr-code-generator", "qr-code-decoder", "barcode-generator",
    "barcode-decoder", "passphrase-generator", "password-entropy-calculator", "password-pattern-analyzer",
    "common-password-checker", "password-length-estimator", "pin-generator", "memorable-password-generator",
    "password-comparison-tool", "aes-encryption-decryption-tool", "rsa-key-generator",
    "elliptic-curve-key-generator", "caesar-cipher-tool", "vigenre-cipher-tool", "xor-cipher-tool",
    "rail-fence-cipher-tool", "zero-width-character-inserter", "jwt-validator", "hash-comparison-tool",
    "csp-validator", "subresource-integrity-generator", "api-key-format-detector", "jwt-hs256-verifier",
  ];
  check("registry: all 51 security slugs in built set", all51.every((s) => builtSlugs.includes(s)),
    `missing from built: ${JSON.stringify(all51.filter((s) => !builtSlugs.includes(s)))}`);
  const page = fs.readFileSync(path.join(ROOT, "src/app/developers/page.tsx"), "utf8");
  check("developers page count updated to 316", page.includes("316 Free Developer Tools") && page.includes("Search 316 developer tools"),
    "page.tsx contains 316");
  check("registry: no duplicate slugs", new Set(pairs.map((m) => m[1].toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-"))).size === pairs.length, `${pairs.length} unique`);

  // ---------- summary ----------
  const failed = results.filter((r) => !r.ok);
  console.log("\n=================== RESULTS ===================");
  for (const r of results) {
    console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}`);
    if (!r.ok) console.log(`      detail: ${r.detail}`);
    else if (r.detail) console.log(`      ${r.detail}`);
  }
  console.log("==============================================");
  console.log(`TOTAL: ${results.length} checks, ${failed.length} failed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => {
  console.error("HARNESS ERROR:", e);
  process.exit(2);
});
