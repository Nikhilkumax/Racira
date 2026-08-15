/**
 * Pure, browser-executable algorithms for the security tools.
 *
 * Ported 1:1 from the former security domain implementation
 * (now removed) so outputs are identical.
 * No React, no DOM — also runs under Node (v24 type stripping) for testing.
 */

function rand(max: number): number {
  return crypto.getRandomValues(new Uint32Array(1))[0] % max;
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function base64ToBytes(b64: string) {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

const enc = (s: string) => new TextEncoder().encode(s);

// ---------- passphrase / memorable passwords ----------

export const PASSPHRASE_WORDS: string[] =
  "able acid aged also area army away baby back ball band bank base bath bear beat been beer bell belt best bird blow blue boat body bone book boot born both bowl bulk burn bush busy cake call calm came camp card care case cash cast cell chat chip city club coal coat code cold come cook cool cope copy core corn cost crew crop dark data date dawn days dead deal dean dear debt deep deny desk dial diet disk dock does done door dose down draw drew drop drug drum dual duke dust duty each earn ease east easy edge else even ever evil exit face fact fail fair fall farm fast fate fear feed feel feet fell felt file fill film find fine fire firm fish five flat flow food foot ford form fort four free from fuel full fund gain game gate gave gear gene gift girl give glad goal goes gold golf gone good gray grew grow gulf hair half hall hand hang hard harm hate have head hear heat held hell help here hero high hill hire hold hole holy home hope host hour huge hung hunt hurt idea inch into iron item jack jane jean john join jump jury just keen keep kent kept kick kind king knee knew know lack lady laid lake land lane last late lead left less life lift like line link list live load loan lock logo long look lord lose loss lost loud love luck made mail main make male many mark mass matt mean meat meet menu mere mike mile milk mill mind mine miss mode mood moon more most move much must name navy near neck need news next nice nick nine none nose note okay once only onto open oral over pace pack page paid pain pair palm park part pass past path peak pick pink pipe plan play plot plug plus poll pool poor port post pull pure push race rail rain rank rare rate read real rear rely rent rest rice rich ride ring rise risk road rock role roll roof room root rose rule rush ruth safe said sake sale salt same sand save seat seed seek seem seen self sell send sent sept ship shop shot show shut sick side sign site size skin slip slow snap snow soft soil sold sole some song soon sort soul spot star stay step stop such suit sure take tale talk tall tank tape task team tech tell tend term test text than that them then they thin this thus tied time tiny tire told toll tone tony took tool tops tore tort tour town tree trip true tune turn twin type unit upon used user vary vast very vice view vote wage wait wake walk wall want ward warm wash wave ways weak wear week well went were west what when whom wide wife wild will wind wine wing wire wise wish with wood word wore work yard yeah year your zero zone".split(" ");

export function generatePassphrase(count: number, sep: string): string {
  const w: string[] = [];
  for (let i = 0; i < count; i++) w.push(PASSPHRASE_WORDS[rand(PASSPHRASE_WORDS.length)]);
  return w.join(sep);
}

export function generateMemorablePassword(): string {
  const w1 = PASSPHRASE_WORDS[rand(PASSPHRASE_WORDS.length)];
  const w2 = PASSPHRASE_WORDS[rand(PASSPHRASE_WORDS.length)];
  const n = String(rand(100)).padStart(2, "0");
  const sym = "!@#$%&?"[rand(7)];
  return `${w1[0].toUpperCase()}${w1.slice(1)}-${w2}${n}${sym}`;
}

export function generatePin(len: number): string {
  let s = "";
  for (let i = 0; i < len; i++) s += rand(10);
  return s;
}

// ---------- password analysis ----------

export function passwordEntropy(pw: string): { length: number; pool: number; entropy: number } {
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/[0-9]/.test(pw)) pool += 10;
  if (/[^A-Za-z0-9]/.test(pw)) pool += 32;
  const entropy = pw ? pw.length * Math.log2(Math.max(pool, 2)) : 0;
  return { length: pw.length, pool, entropy };
}

export function analyzePasswordPattern(pw: string): string[] {
  const issues: string[] = [];
  if (/(.)\1{2,}/.test(pw)) issues.push("Repeated characters (3+)");
  if (/(012|123|234|345|456|567|678|789|abc|qwerty|password)/i.test(pw)) issues.push("Common sequence detected");
  if (pw.length < 10) issues.push("Length below 10");
  if (!/[A-Z]/.test(pw)) issues.push("No uppercase");
  if (!/[0-9]/.test(pw)) issues.push("No digits");
  if (!/[^A-Za-z0-9]/.test(pw)) issues.push("No symbols");
  return issues;
}

export const COMMON_PASSWORDS: ReadonlySet<string> = new Set([
  "123456", "password", "123456789", "12345678", "12345", "qwerty", "abc123", "111111", "123123", "admin",
  "letmein", "welcome", "monkey", "1234", "dragon", "master", "login", "passw0rd", "starwars", "iloveyou",
  "000000", "696969", "mustang", "baseball", "football", "sunshine", "superman", "trustno1", "000000",
  "qwerty123", "1q2w3e4r",
]);

export function isCommonPassword(pw: string): boolean {
  return COMMON_PASSWORDS.has(pw.toLowerCase());
}

export function formatCrackTime(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)}h`;
  if (seconds < 31536000) return `${(seconds / 86400).toFixed(1)}d`;
  return `${(seconds / 31536000).toExponential(2)} years`;
}

export function estimateCrackTime(len: number, pool: number): string {
  const guesses = Math.pow(pool, len);
  const seconds = guesses / 1e10;
  return formatCrackTime(seconds);
}

// ---------- ciphers ----------

export function caesarShift(text: string, shift: number): string {
  return text
    .replace(/[a-z]/g, (c) => String.fromCharCode(((c.charCodeAt(0) - 97 + shift + 26) % 26) + 97))
    .replace(/[A-Z]/g, (c) => String.fromCharCode(((c.charCodeAt(0) - 65 + shift + 26) % 26) + 65));
}

export function vigenere(text: string, key: string, mode: "enc" | "dec"): string {
  const k = key.replace(/[^a-z]/gi, "");
  let ki = 0;
  if (!k) return "";
  return text.replace(/[a-z]/gi, (c) => {
    const upper = c === c.toUpperCase();
    const base = upper ? 65 : 97;
    const s = k[ki % k.length].toUpperCase().charCodeAt(0) - 65;
    ki++;
    const shift = mode === "enc" ? s : -s;
    return String.fromCharCode(((c.charCodeAt(0) - base + shift + 26) % 26) + base);
  });
}

export function xorCipher(text: string, key: string): string {
  if (!text || !key) return "";
  const bytes = enc(text);
  const kbytes = enc(key);
  const o = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) o[i] = bytes[i] ^ kbytes[i % kbytes.length];
  return bytesToBase64(o);
}

export function railFence(text: string, rails: number, mode: "enc" | "dec"): string {
  const encrypt = (s: string, r: number) => {
    if (r <= 1) return s;
    const arr: string[][] = Array.from({ length: r }, () => []);
    let row = 0;
    let dir = 1;
    for (const c of s) {
      arr[row].push(c);
      if (row === 0) dir = 1;
      else if (row === r - 1) dir = -1;
      row += dir;
    }
    return arr.flat().join("");
  };
  const decrypt = (s: string, r: number) => {
    if (r <= 1) return s;
    const pattern: number[] = [];
    let row = 0;
    let dir = 1;
    for (let i = 0; i < s.length; i++) {
      pattern.push(row);
      if (row === 0) dir = 1;
      else if (row === r - 1) dir = -1;
      row += dir;
    }
    const counts: number[] = new Array(r).fill(0);
    pattern.forEach((p) => counts[p]++);
    const rails_: string[][] = [];
    let idx = 0;
    for (let i = 0; i < r; i++) {
      rails_.push(s.slice(idx, idx + counts[i]).split(""));
      idx += counts[i];
    }
    const ptr: number[] = new Array(r).fill(0);
    return pattern.map((p) => rails_[p][ptr[p]++]).join("");
  };
  return mode === "enc" ? encrypt(text, rails) : decrypt(text, rails);
}

// ---------- steganography ----------

const ZW = ["\u200B", "\u200C", "\u200D", "\u2060"];

export function zeroWidthEncode(host: string, secret: string): string {
  if (!secret) return host;
  const bytes = enc(secret);
  let bits = "";
  for (const b of bytes) bits += b.toString(2).padStart(8, "0");
  let zw = "";
  for (let i = 0; i < bits.length; i += 2) zw += ZW[parseInt(bits.slice(i, i + 2).padEnd(2, "0"), 2)];
  return host + zw;
}

// ---------- JWT ----------

export function b64urlDecode(s: string): string {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return new TextDecoder().decode(base64ToBytes(s));
}

export function validateJwt(token: string): string[] {
  const parts = token.split(".");
  const issues: string[] = [];
  if (token) {
    if (parts.length !== 3) issues.push("Token must have 3 dot-separated parts");
    try {
      JSON.parse(b64urlDecode(parts[0] || ""));
    } catch {
      issues.push("Invalid header");
    }
    try {
      const p = JSON.parse(b64urlDecode(parts[1] || ""));
      const now = Math.floor(Date.now() / 1000);
      if (p.exp && p.exp < now) issues.push(`Expired (exp=${p.exp})`);
      if (p.nbf && p.nbf > now) issues.push(`Not yet valid (nbf=${p.nbf})`);
      if (!p.iss) issues.push("Missing iss claim");
      if (!p.sub) issues.push("Missing sub claim");
    } catch {
      issues.push("Invalid payload");
    }
  }
  return issues;
}

export async function verifyHmacJwt(token: string, secret: string): Promise<boolean> {
  const [h, p, s] = token.split(".");
  const key = await crypto.subtle.importKey(
    "raw",
    enc(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const sig = base64ToBytes(s.replace(/-/g, "+").replace(/_/g, "/") + "==".slice(0, (4 - (s.length % 4)) % 4));
  return crypto.subtle.verify("HMAC", key, sig, enc(`${h}.${p}`));
}

// ---------- AES (AES-GCM 256, PBKDF2-SHA256, 150k iterations) ----------

async function deriveAesKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey("raw", enc(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: 150000, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function aesEncrypt(text: string, password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveAesKey(password, salt);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc(text)));
  const combined = new Uint8Array(salt.length + iv.length + ct.length);
  combined.set(salt);
  combined.set(iv, salt.length);
  combined.set(ct, salt.length + iv.length);
  return bytesToBase64(combined);
}

export async function aesDecrypt(dataB64: string, password: string): Promise<string> {
  try {
    const data = base64ToBytes(dataB64);
    const salt = data.slice(0, 16);
    const iv = data.slice(16, 28);
    const ct = data.slice(28);
    const key = await deriveAesKey(password, salt);
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
    return new TextDecoder().decode(pt);
  } catch (e: unknown) {
    throw new Error(`Decryption failed: ${e instanceof Error ? e.message : String(e)}`);
  }
}

// ---------- key generation ----------

function toPem(label: string, bytes: Uint8Array): string {
  return `-----BEGIN ${label}-----\n${bytesToBase64(bytes).match(/.{1,64}/g)!.join("\n")}\n-----END ${label}-----`;
}

export async function generateRsaKeypair(): Promise<{ publicPem: string; privatePem: string }> {
  const { publicKey, privateKey } = await crypto.subtle.generateKey(
    { name: "RSA-OAEP", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
    true,
    ["encrypt", "decrypt"],
  );
  const pkc = new Uint8Array(await crypto.subtle.exportKey("spki", publicKey));
  const prc = new Uint8Array(await crypto.subtle.exportKey("pkcs8", privateKey));
  return { publicPem: toPem("PUBLIC KEY", pkc), privatePem: toPem("PRIVATE KEY", prc) };
}

export async function generateEcKeypair(): Promise<{ publicPem: string; privatePem: string }> {
  const { publicKey, privateKey } = await crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"],
  );
  const pkc = new Uint8Array(await crypto.subtle.exportKey("spki", publicKey));
  const prc = new Uint8Array(await crypto.subtle.exportKey("pkcs8", privateKey));
  return { publicPem: toPem("PUBLIC KEY", pkc), privatePem: toPem("PRIVATE KEY", prc) };
}

// ---------- Subresource Integrity ----------

export async function sriHash(url: string, algo: "SHA-256" | "SHA-384" | "SHA-512"): Promise<string> {
  try {
    const res = await fetch(url);
    const buf = await res.arrayBuffer();
    const h = new Uint8Array(await crypto.subtle.digest(algo, buf));
    const b = bytesToBase64(h);
    return `${algo.toLowerCase().replace("-", "")}-${b}`;
  } catch (e: unknown) {
    throw new Error(`Fetch failed (CORS or network): ${e instanceof Error ? e.message : String(e)}`);
  }
}

// ---------- CSP validation ----------

export function validateCsp(csp: string): string[] {
  const issues: string[] = [];
  if (!csp.includes("default-src")) issues.push("Missing default-src fallback");
  if (csp.includes("'unsafe-inline'")) issues.push("Uses 'unsafe-inline' (allows inline scripts)");
  if (csp.includes("'unsafe-eval'")) issues.push("Uses 'unsafe-eval'");
  if (csp.includes("*") && !csp.includes("data:")) issues.push("Contains wildcard '*' source");
  if (!csp.includes("frame-ancestors")) issues.push("Missing frame-ancestors (clickjacking)");
  return issues;
}

// ---------- API key format detection ----------

export const API_KEY_PATTERNS: { name: string; rx: RegExp }[] = [
  { name: "Stripe Live Secret", rx: /^sk_live_[A-Za-z0-9]{20,}$/ },
  { name: "Stripe Test Secret", rx: /^sk_test_[A-Za-z0-9]{20,}$/ },
  { name: "GitHub PAT (classic)", rx: /^ghp_[A-Za-z0-9]{36}$/ },
  { name: "GitHub Fine-grained", rx: /^github_pat_[A-Za-z0-9_]{60,}$/ },
  { name: "OpenAI", rx: /^sk-[A-Za-z0-9_-]{20,}$/ },
  { name: "Slack Bot Token", rx: /^xoxb-[A-Za-z0-9-]{20,}$/ },
  { name: "AWS Access Key", rx: /^AKIA[0-9A-Z]{16}$/ },
  { name: "JWT (3-part)", rx: /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*$/ },
  { name: "UUID", rx: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i },
  { name: "Hex (32+)", rx: /^[0-9a-f]{32,}$/i },
];

export function detectApiKeyFormat(key: string): string[] {
  return key ? API_KEY_PATTERNS.filter((p) => p.rx.test(key.trim())).map((p) => p.name) : [];
}
