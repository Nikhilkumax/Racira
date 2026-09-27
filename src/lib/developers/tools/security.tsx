import type { ToolDefinition, ToolResult } from "@/components/developers/tools/registry";
import { OptionsBar, OptRow, OptNumber, OptSelect } from "@/components/developers/tools/options-controls";
import { bufToHex, b64Decode, b64Encode, byteLength } from "./helpers";
import {
  PASSPHRASE_WORDS,
  generatePassphrase,
  generateMemorablePassword,
  generatePin,
  passwordEntropy,
  analyzePasswordPattern,
  isCommonPassword,
  estimateCrackTime,
  caesarShift,
  vigenere,
  xorCipher,
  railFence,
  zeroWidthEncode,
  validateJwt,
  verifyHmacJwt,
  aesEncrypt,
  aesDecrypt,
  generateRsaKeypair,
  generateEcKeypair,
  sriHash,
  validateCsp,
  detectApiKeyFormat,
} from "./security-algorithms";

async function digest(algorithm: string, input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest(algorithm, data);
  return bufToHex(buf);
}

const hashGenerator: ToolDefinition = {
  slug: "hash-generator",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptSelect
        value={String(options.algo ?? "SHA-256")}
        onChange={(v) => setOptions({ ...options, algo: v })}
        options={["SHA-1", "SHA-256", "SHA-384", "SHA-512"].map((a) => ({ value: a, label: a }))}
      />
    </OptionsBar>
  ),
  defaultOptions: { algo: "SHA-256" },
  transform: async ({ input, options }) => {
    const out = await digest(String(options.algo ?? "SHA-256"), input);
    return { output: out, info: `${options.algo} · ${byteLength(input)} bytes input` };
  },
};

const sha1: ToolDefinition = { slug: "sha-1-generator", mode: "text", transform: async ({ input }) => ({ output: await digest("SHA-1", input) }) };
const sha256: ToolDefinition = { slug: "sha-256-generator", mode: "text", transform: async ({ input }) => ({ output: await digest("SHA-256", input) }) };
const sha512: ToolDefinition = { slug: "sha-512-generator", mode: "text", transform: async ({ input }) => ({ output: await digest("SHA-512", input) }) };

// MD5 — not in WebCrypto, implement minimal.
function md5(str: string): string {
  const toBytes = (s: string) => {
    const bytes: number[] = [];
    for (let i = 0; i < s.length; i++) {
      const c = s.charCodeAt(i);
      if (c < 128) bytes.push(c);
      else if (c < 2048) bytes.push(192 | (c >> 6), 128 | (c & 63));
      else bytes.push(224 | (c >> 12), 128 | ((c >> 6) & 63), 128 | (c & 63));
    }
    return bytes;
  };
  const bytes = toBytes(str);
  const len = bytes.length;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  const bits = len * 8;
  for (let i = 0; i < 8; i++) bytes.push((bits >>> (8 * i)) & 0xff);

  const s = [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21];
  const K = [0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501, 0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821, 0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8, 0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a, 0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70, 0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665, 0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1, 0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391];

  const rotate = (x: number, c: number) => (x << c) | (x >>> (32 - c));
  const add32 = (a: number, b: number) => (a + b) & 0xffffffff;

  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
  for (let off = 0; off < bytes.length; off += 64) {
    const M: number[] = [];
    for (let j = 0; j < 16; j++) M[j] = bytes[off + j * 4] | (bytes[off + j * 4 + 1] << 8) | (bytes[off + j * 4 + 2] << 16) | (bytes[off + j * 4 + 3] << 24);
    let A = a0, B = b0, C = c0, D = d0;
    for (let i = 0; i < 64; i++) {
      let F: number; let g: number;
      if (i < 16) { F = (B & C) | (~B & D); g = i; }
      else if (i < 32) { F = (D & B) | (~D & C); g = (5 * i + 1) % 16; }
      else if (i < 48) { F = B ^ C ^ D; g = (3 * i + 5) % 16; }
      else { F = C ^ (B | ~D); g = (7 * i) % 16; }
      F = add32(add32(add32(F, A), K[i] >>> 0), M[g] >>> 0);
      A = D; D = C; C = B; B = add32(B, rotate(F >>> 0, s[i]));
    }
    a0 = add32(a0, A); b0 = add32(b0, B); c0 = add32(c0, C); d0 = add32(d0, D);
  }
  const toHex = (n: number) => {
    let h = "";
    for (let i = 0; i < 4; i++) h += ((n >>> (i * 8)) & 0xff).toString(16).padStart(2, "0");
    return h;
  };
  return toHex(a0) + toHex(b0) + toHex(c0) + toHex(d0);
}

const md5Generator: ToolDefinition = { slug: "md5-generator", mode: "text", transform: ({ input }) => ({ output: md5(input) }) };

// HMAC via Web Crypto
const hmacGenerator: ToolDefinition = {
  slug: "hmac-generator",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptSelect value={String(options.algo ?? "SHA-256")} onChange={(v) => setOptions({ ...options, algo: v })} options={["SHA-1", "SHA-256", "SHA-384", "SHA-512"].map((a) => ({ value: a, label: a }))} />
      {/* transform requires options.key — the OptRow was missing, so every run
          threw "Enter a secret key in options" with nowhere to enter one. */}
      <OptRow label="Secret key">
        <input defaultValue={String(options.key ?? "")} onChange={(e) => setOptions({ ...options, key: e.target.value })} className="h-8 w-40 rounded-md border border-input bg-background px-2 text-sm" />
      </OptRow>
    </OptionsBar>
  ),
  defaultOptions: { algo: "SHA-256", key: "" },
  transform: async ({ input, options }) => {
    const key = String(options.key ?? "");
    if (!key) throw new Error("Enter a secret key in options");
    const algo = String(options.algo ?? "SHA-256");
    const cryptoKey = await crypto.subtle.importKey("raw", new TextEncoder().encode(key), { name: "HMAC", hash: algo }, false, ["sign"]);
    const sig = await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(input));
    return { output: bufToHex(sig) };
  },
};

// CRC32
function crc32(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let crc = 0xffffffff;
  for (const b of bytes) {
    crc ^= b;
    for (let i = 0; i < 8; i++) crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
  }
  return ((crc ^ 0xffffffff) >>> 0).toString(16).padStart(8, "0");
}
const crc32Tool: ToolDefinition = { slug: "crc32-calculator", mode: "text", transform: ({ input }) => ({ output: "0x" + crc32(input).toUpperCase(), info: `${byteLength(input)} bytes` }) };

// bcrypt
const bcryptGenerator: ToolDefinition = {
  slug: "bcrypt-generator",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptNumber label="Rounds" value={Number(options.rounds ?? 10)} min={4} max={12} onChange={(v) => setOptions({ ...options, rounds: v })} />
    </OptionsBar>
  ),
  defaultOptions: { rounds: 10 },
  transform: async ({ input, options }) => {
    const bcrypt = (await import("bcryptjs")).default;
    const rounds = Math.max(4, Math.min(12, Number(options.rounds ?? 10)));
    const salt = await bcrypt.genSalt(rounds);
    const hash = await bcrypt.hash(input, salt);
    return { output: hash };
  },
};

// htpasswd
const htpasswdGenerator: ToolDefinition = {
  slug: "htpasswd-generator",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptRow label="Username">
        <input defaultValue={String(options.user ?? "admin")} onChange={(e) => setOptions({ ...options, user: e.target.value })} className="h-8 w-40 rounded-md border border-input bg-background px-2 text-sm" />
      </OptRow>
    </OptionsBar>
  ),
  defaultOptions: { user: "admin" },
  transform: async ({ input, options }) => {
    const bcrypt = (await import("bcryptjs")).default;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(input, salt);
    return { output: `${options.user}:${hash}` };
  },
};

const basicAuthGenerator: ToolDefinition = {
  slug: "basic-auth-generator",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptRow label="Username">
        <input defaultValue={String(options.user ?? "user")} onChange={(e) => setOptions({ ...options, user: e.target.value })} className="h-8 w-32 rounded-md border border-input bg-background px-2 text-sm" />
      </OptRow>
      <OptRow label="Password">
        <input defaultValue={String(options.pass ?? "pass")} onChange={(e) => setOptions({ ...options, pass: e.target.value })} className="h-8 w-32 rounded-md border border-input bg-background px-2 text-sm" />
      </OptRow>
    </OptionsBar>
  ),
  defaultOptions: { user: "user", pass: "pass" },
  transform: ({ input, options }) => {
    const user = (options.user || input.split(":")[0] || "user") as string;
    const pass = (options.pass || input.split(":")[1] || "pass") as string;
    return { output: `Authorization: Basic ${b64Encode(`${user}:${pass}`)}` };
  },
};

// UUID + ULID generator
function uuidv4(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const h = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0"));
  return `${h.slice(0, 4).join("")}-${h.slice(4, 6).join("")}-${h.slice(6, 8).join("")}-${h.slice(8, 10).join("")}-${h.slice(10, 16).join("")}`;
}
function ulid(): string {
  const enc = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  const time = Date.now();
  let ts = "";
  for (let i = 9; i >= 0; i--) { ts = enc[(time >> (5 * i)) & 31] + ts; }
  const rand = new Uint8Array(16);
  crypto.getRandomValues(rand);
  let rs = "";
  for (let i = 0; i < 16; i++) rs += enc[(rand[i] >> 3) & 31] + enc[(rand[i] & 7) << 2];
  return ts + rs.toLowerCase();
}

const uuidGenerator: ToolDefinition = {
  slug: "uuid-generator",
  mode: "generator",
  hideInput: true,
  live: false,
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptSelect value={String(options.kind ?? "v4")} onChange={(v) => setOptions({ ...options, kind: v })} options={[{ value: "v4", label: "UUID v4" }, { value: "ulid", label: "ULID" }]} />
      <OptNumber label="Count" value={Number(options.count ?? 1)} min={1} max={1000} onChange={(v) => setOptions({ ...options, count: v })} />
      <OptSelect value={String(options.case ?? "lower")} onChange={(v) => setOptions({ ...options, case: v })} options={[{ value: "lower", label: "lowercase" }, { value: "upper", label: "UPPERCASE" }]} />
    </OptionsBar>
  ),
  defaultOptions: { kind: "v4", count: 1, case: "lower" },
  transform: ({ options }) => {
    const count = Math.max(1, Math.min(1000, Number(options.count ?? 1)));
    const kind = String(options.kind ?? "v4");
    const upper = options.case === "upper";
    const out = Array.from({ length: count }, () => (kind === "ulid" ? ulid() : uuidv4()));
    const final = upper ? out.map((s) => s.toUpperCase()) : out;
    return { output: final.join("\n"), info: `${count} ${kind} generated` };
  },
};

// Password generators
function randomString(len: number, alphabet: string): string {
  const bytes = new Uint32Array(len);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < len; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

const randomPasswordGenerator: ToolDefinition = {
  slug: "random-password-generator",
  mode: "generator",
  hideInput: true,
  live: false,
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptNumber label="Length" value={Number(options.len ?? 20)} min={4} max={128} onChange={(v) => setOptions({ ...options, len: v })} />
      <label className="text-xs flex items-center gap-1.5"><input type="checkbox" defaultChecked={options.upper !== false} onChange={(e) => setOptions({ ...options, upper: e.target.checked })} /> A-Z</label>
      <label className="text-xs flex items-center gap-1.5"><input type="checkbox" defaultChecked={options.lower !== false} onChange={(e) => setOptions({ ...options, lower: e.target.checked })} /> a-z</label>
      <label className="text-xs flex items-center gap-1.5"><input type="checkbox" defaultChecked={options.digit !== false} onChange={(e) => setOptions({ ...options, digit: e.target.checked })} /> 0-9</label>
      <label className="text-xs flex items-center gap-1.5"><input type="checkbox" defaultChecked={options.sym !== false} onChange={(e) => setOptions({ ...options, sym: e.target.checked })} /> !@#$</label>
    </OptionsBar>
  ),
  defaultOptions: { len: 20, upper: true, lower: true, digit: true, sym: true },
  transform: ({ options }) => {
    let alphabet = "";
    if (options.upper) alphabet += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (options.lower) alphabet += "abcdefghijklmnopqrstuvwxyz";
    if (options.digit) alphabet += "0123456789";
    if (options.sym) alphabet += "!@#$%^&*()-_=+[]{}";
    if (!alphabet) throw new Error("Select at least one character set");
    const len = Math.max(4, Math.min(128, Number(options.len ?? 20)));
    return { output: randomString(len, alphabet), info: `${len} chars from ${alphabet.length}-char alphabet` };
  },
};

const randomApiKeyGenerator: ToolDefinition = {
  slug: "random-api-key-generator",
  mode: "generator",
  hideInput: true,
  live: false,
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptNumber label="Bytes" value={Number(options.bytes ?? 32)} min={8} max={256} onChange={(v) => setOptions({ ...options, bytes: v })} />
      <OptSelect value={String(options.enc ?? "hex")} onChange={(v) => setOptions({ ...options, enc: v })} options={[{ value: "hex", label: "Hex" }, { value: "base64", label: "Base64" }, { value: "base64url", label: "Base64URL" }]} />
    </OptionsBar>
  ),
  defaultOptions: { bytes: 32, enc: "hex" },
  transform: ({ options }) => {
    const n = Math.max(8, Math.min(256, Number(options.bytes ?? 32)));
    const bytes = new Uint8Array(n);
    crypto.getRandomValues(bytes);
    let out = "";
    if (options.enc === "base64") {
      let bin = "";
      for (const b of bytes) bin += String.fromCharCode(b);
      out = btoa(bin);
    } else if (options.enc === "base64url") {
      let bin = "";
      for (const b of bytes) bin += String.fromCharCode(b);
      out = btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    } else {
      out = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
    }
    return { output: out, info: `${n} random bytes` };
  },
};

// Password strength checker
const passwordStrengthChecker: ToolDefinition = {
  slug: "password-strength-checker",
  mode: "text",
  transform: ({ input }) => {
    let score = 0;
    const feedback: string[] = [];
    if (input.length >= 8) score += 1; else feedback.push("Use at least 8 characters");
    if (input.length >= 12) score += 1;
    if (input.length >= 16) score += 1;
    if (/[a-z]/.test(input)) score += 1; else feedback.push("Add lowercase letters");
    if (/[A-Z]/.test(input)) score += 1; else feedback.push("Add uppercase letters");
    if (/[0-9]/.test(input)) score += 1; else feedback.push("Add numbers");
    if (/[^a-zA-Z0-9]/.test(input)) score += 1; else feedback.push("Add symbols");
    // entropy estimate
    let alphabet = 0;
    if (/[a-z]/.test(input)) alphabet += 26;
    if (/[A-Z]/.test(input)) alphabet += 26;
    if (/[0-9]/.test(input)) alphabet += 10;
    if (/[^a-zA-Z0-9]/.test(input)) alphabet += 32;
    const entropy = input.length * Math.log2(alphabet || 1);
    let label = "Very weak";
    if (entropy >= 35) label = "Weak";
    if (entropy >= 60) label = "Fair";
    if (entropy >= 80) label = "Strong";
    if (entropy >= 120) label = "Excellent";
    const report = [
      `Strength: ${label}`,
      `Entropy: ~${entropy.toFixed(1)} bits`,
      `Score: ${score}/7`,
      "",
      feedback.length ? "Suggestions:\n - " + feedback.join("\n - ") : "Great password!",
    ];
    return { output: report.join("\n"), info: `${input.length} chars · ${alphabet}-char alphabet` };
  },
};

// Token strength analyzer
const tokenStrengthAnalyzer: ToolDefinition = {
  slug: "token-strength-analyzer",
  mode: "text",
  transform: ({ input }) => {
    const bytes = byteLength(input);
    let distinct = new Set(input).size;
    const entropy = bytes * Math.log2(Math.max(distinct, 2));
    return { output: `Length: ${bytes} bytes\nDistinct symbols: ${distinct}\nEstimated entropy: ~${entropy.toFixed(1)} bits\n\n${entropy < 80 ? "⚠ Consider a longer or higher-entropy token." : "✓ Reasonable entropy."}` };
  },
};

// JWT
function b64urlDecode(s: string): string {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return b64Decode(s);
}
function b64urlEncodeObj(obj: unknown): string {
  return b64Encode(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const jwtDecoder: ToolDefinition = {
  slug: "jwt-decoder",
  mode: "text",
  transform: ({ input }) => {
    const parts = input.trim().split(".");
    if (parts.length < 2) throw new Error("A JWT must have at least header.payload");
    const header = JSON.parse(b64urlDecode(parts[0]));
    const payload = JSON.parse(b64urlDecode(parts[1]));
    const report = {
      header,
      payload,
      signature: parts[2] ? `${parts[2].slice(0, 16)}… (${parts[2].length} chars)` : "(unsigned)",
    };
    let info = `Algorithm: ${header.alg ?? "?"}`;
    if (payload.exp) {
      const exp = new Date(payload.exp * 1000);
      info += ` · exp ${exp.toISOString()} (${exp.getTime() < Date.now() ? "EXPIRED" : "valid"})`;
    }
    return { output: JSON.stringify(report, null, 2), info };
  },
};

const jwtVisualizer: ToolDefinition = {
  slug: "jwt-visualizer",
  mode: "text",
  transform: ({ input }) => {
    const parts = input.trim().split(".");
    if (parts.length < 2) throw new Error("Invalid JWT");
    const header = parts[0];
    const payload = parts[1];
    return { output: `HEADER  (${header.length} chars)\n${b64urlDecode(header)}\n\nPAYLOAD (${payload.length} chars)\n${b64urlDecode(payload)}\n\nSIGNATURE\n${parts[2] ?? "(none)"}` };
  },
};

const jwtExpiryChecker: ToolDefinition = {
  slug: "jwt-expiry-checker",
  mode: "text",
  transform: ({ input }) => {
    const parts = input.trim().split(".");
    if (parts.length < 2) throw new Error("Invalid JWT");
    const payload = JSON.parse(b64urlDecode(parts[1]));
    if (!payload.exp) return { output: "This JWT has no `exp` claim.", info: "No expiration set" };
    const exp = new Date(payload.exp * 1000);
    const now = new Date();
    const diff = exp.getTime() - now.getTime();
    const lines = [
      `Expires: ${exp.toISOString()}`,
      `Now:     ${now.toISOString()}`,
      ``,
      diff > 0 ? `Status: ✓ valid for ${humanDuration(diff)}` : `Status: ✗ expired ${humanDuration(-diff)} ago`,
    ];
    return { output: lines.join("\n") };
  },
};

function humanDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const parts: string[] = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  if (s) parts.push(`${s}s`);
  return parts.join(" ") || "0s";
}

const jwtGenerator: ToolDefinition = {
  slug: "jwt-generator",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptSelect value={String(options.algo ?? "HS256")} onChange={(v) => setOptions({ ...options, algo: v })} options={[{ value: "HS256", label: "HS256" }, { value: "none", label: "none" }]} />
      <OptRow label="Secret">
        <input defaultValue={String(options.secret ?? "secret")} onChange={(e) => setOptions({ ...options, secret: e.target.value })} className="h-8 w-40 rounded-md border border-input bg-background px-2 text-sm" />
      </OptRow>
    </OptionsBar>
  ),
  defaultOptions: { algo: "HS256", secret: "secret" },
  transform: async ({ input, options }) => {
    // input is treated as payload JSON
    let payload: Record<string, unknown> = {};
    if (input.trim()) {
      try { payload = JSON.parse(input); } catch { throw new Error("Payload must be valid JSON"); }
    }
    const algo = String(options.algo ?? "HS256");
    const header = { alg: algo, typ: "JWT" };
    const data = `${b64urlEncodeObj(header)}.${b64urlEncodeObj(payload)}`;
    if (algo === "none") return { output: `${data}.` };
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(String(options.secret ?? "secret")), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
    let sigB64 = b64Encode(String.fromCharCode(...new Uint8Array(sig)));
    sigB64 = sigB64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    return { output: `${data}.${sigB64}` };
  },
};

const jwtRs256Verifier: ToolDefinition = {
  slug: "jwt-rs256-verifier",
  mode: "text",
  transform: async ({ input, options }) => {
    const token = input.trim();
    const parts = token.split(".");
    if (parts.length !== 3) throw new Error("JWT needs 3 parts");
    const [h, p, s] = parts;
    const header = JSON.parse(b64urlDecode(h));
    if (header.alg !== "RS256") return { output: `Algorithm is ${header.alg}, not RS256`, info: "Signature verification requires a public key" };
    return { output: `Header:\n${JSON.stringify(header, null, 2)}\n\nPayload:\n${JSON.stringify(JSON.parse(b64urlDecode(p)), null, 2)}\n\nSignature (b64url):\n${s}\n\nNote: RS256 verification requires the matching public key, paste it to verify.`, info: "Decoded structure" };
  },
};

const sessionTokenDecoder: ToolDefinition = {
  slug: "session-token-decoder",
  mode: "text",
  transform: ({ input }) => {
    const t = input.trim();
    if (t.includes(".") && t.split(".").length >= 2) {
      try {
        return jwtDecoder.transform!({ input: t, secondInput: "", options: {} });
      } catch { /* fallthrough */ }
    }
    // Try base64
    try {
      const dec = b64Decode(t);
      return { output: dec, info: "Decoded as base64" };
    } catch {
      return { output: `Token length: ${t.length}\nCharacters: ${new Set(t).size}\nNot a recognizable JWT or base64 payload.` };
    }
  },
};

const fileHashChecker: ToolDefinition = {
  slug: "file-hash-checker",
  mode: "text",
  accept: "*",
  readAs: "text",
  placeholder: "Upload a file to compute its hashes…",
  transform: async ({ input, options }) => {
    // input is the file contents as text; for binary fidelity we re-encode.
    const bytes = new TextEncoder().encode(input);
    const buf = bytes.buffer.slice(0, bytes.byteLength);
    const algos = ["SHA-1", "SHA-256", "SHA-512"] as const;
    const out: string[] = [];
    for (const a of algos) {
      const h = await crypto.subtle.digest(a, buf);
      out.push(`${a}: ${bufToHex(h)}`);
    }
    return { output: out.join("\n"), info: `${bytes.length} bytes` };
  },
};

const apiKeyFormatter: ToolDefinition = {
  slug: "api-key-formatter",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptSelect value={String(options.sep ?? "-")} onChange={(v) => setOptions({ ...options, sep: v })} options={[{ value: "-", label: "Dash -" }, { value: "_", label: "Underscore _" }, { value: " ", label: "Space" }, { value: "", label: "None" }]} />
      <OptNumber label="Group size" value={Number(options.size ?? 4)} min={2} max={16} onChange={(v) => setOptions({ ...options, size: v })} />
    </OptionsBar>
  ),
  defaultOptions: { sep: "-", size: 4 },
  transform: ({ input, options }) => {
    const clean = input.replace(/[^a-zA-Z0-9]/g, "");
    const size = Number(options.size ?? 4);
    const sep = String(options.sep ?? "-");
    const groups: string[] = [];
    for (let i = 0; i < clean.length; i += size) groups.push(clean.slice(i, i + size));
    return { output: groups.join(sep) };
  },
};

// PKCE generator
const pkceGenerator: ToolDefinition = {
  slug: "pkce-generator",
  mode: "generator",
  hideInput: true,
  live: false,
  transform: async () => {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    let bin = "";
    for (const b of bytes) bin += String.fromCharCode(b);
    const verifier = btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
    const challenge = btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    return { output: `code_verifier=${verifier}\ncode_challenge=${challenge}\ncode_challenge_method=S256` };
  },
};

// OAuth URL generator
const oauthUrlGenerator: ToolDefinition = {
  slug: "oauth-url-generator",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptRow label="Auth URL"><input defaultValue={String(options.auth ?? "https://accounts.google.com/o/oauth2/v2/auth")} onChange={(e) => setOptions({ ...options, auth: e.target.value })} className="h-8 w-64 rounded-md border border-input bg-background px-2 text-sm" /></OptRow>
      <OptRow label="Client ID"><input defaultValue={String(options.cid ?? "")} onChange={(e) => setOptions({ ...options, cid: e.target.value })} className="h-8 w-48 rounded-md border border-input bg-background px-2 text-sm" /></OptRow>
      <OptRow label="Redirect"><input defaultValue={String(options.redir ?? "")} onChange={(e) => setOptions({ ...options, redir: e.target.value })} className="h-8 w-48 rounded-md border border-input bg-background px-2 text-sm" /></OptRow>
      <OptRow label="Scopes"><input defaultValue={String(options.scope ?? "openid email")} onChange={(e) => setOptions({ ...options, scope: e.target.value })} className="h-8 w-48 rounded-md border border-input bg-background px-2 text-sm" /></OptRow>
    </OptionsBar>
  ),
  defaultOptions: { auth: "https://accounts.google.com/o/oauth2/v2/auth", cid: "", redir: "", scope: "openid email" },
  transform: ({ options }) => {
    const params = new URLSearchParams({
      client_id: String(options.cid ?? ""),
      redirect_uri: String(options.redir ?? ""),
      response_type: "code",
      scope: String(options.scope ?? ""),
    });
    return { output: `${options.auth}?${params.toString()}` };
  },
};

// ── Ported from the security domain (net-new tools + renamed name collisions) ──

const passphraseGenerator: ToolDefinition = {
  slug: "passphrase-generator",
  mode: "generator",
  hideInput: true,
  live: false,
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptNumber label="Words" value={Number(options.count ?? 5)} min={3} max={10} onChange={(v) => setOptions({ ...options, count: v })} />
      <OptRow label="Separator">
        <input defaultValue={String(options.sep ?? "-")} onChange={(e) => setOptions({ ...options, sep: e.target.value })} className="h-8 w-16 rounded-md border border-input bg-background px-2 text-sm" />
      </OptRow>
    </OptionsBar>
  ),
  defaultOptions: { count: 5, sep: "-" },
  transform: ({ options }) => {
    const count = Math.max(3, Math.min(10, Number(options.count ?? 5)));
    const sep = String(options.sep ?? "-").slice(0, 3);
    return { output: generatePassphrase(count, sep), info: `${count} words from a ${PASSPHRASE_WORDS.length}-word list` };
  },
};

const passwordEntropyCalculator: ToolDefinition = {
  slug: "password-entropy-calculator",
  mode: "text",
  transform: ({ input }) => {
    const { length, pool, entropy } = passwordEntropy(input);
    return { output: `Length: ${length}\nCharacter pool: ${pool}\nEstimated entropy: ${entropy.toFixed(1)} bits` };
  },
};

const passwordPatternAnalyzer: ToolDefinition = {
  slug: "password-pattern-analyzer",
  mode: "text",
  transform: ({ input }) => {
    if (!input) return { output: "" };
    const issues = analyzePasswordPattern(input);
    return { output: issues.length ? issues.map((i) => `• ${i}`).join("\n") : "No common patterns detected." };
  },
};

const commonPasswordChecker: ToolDefinition = {
  slug: "common-password-checker",
  mode: "text",
  transform: ({ input }) => {
    if (!input) return { output: "" };
    return { output: isCommonPassword(input) ? "⚠ Found in common password list" : "✓ Not in built-in common list" };
  },
};

const passwordLengthEstimator: ToolDefinition = {
  slug: "password-length-estimator",
  mode: "generator",
  hideInput: true,
  live: false,
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptNumber label="Length" value={Number(options.len ?? 12)} min={4} max={32} onChange={(v) => setOptions({ ...options, len: v })} />
      <OptNumber label="Pool" value={Number(options.pool ?? 94)} min={10} max={128} onChange={(v) => setOptions({ ...options, pool: v })} />
    </OptionsBar>
  ),
  defaultOptions: { len: 12, pool: 94 },
  transform: ({ options }) => {
    const len = Math.max(4, Math.min(32, Number(options.len ?? 12)));
    const pool = Math.max(10, Math.min(128, Number(options.pool ?? 94)));
    return { output: `Estimated crack time @ 10B guesses/sec: ${estimateCrackTime(len, pool)}`, info: `${pool}^${len} combinations` };
  },
};

const pinGenerator: ToolDefinition = {
  slug: "pin-generator",
  mode: "generator",
  hideInput: true,
  live: false,
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptNumber label="Length" value={Number(options.len ?? 6)} min={3} max={12} onChange={(v) => setOptions({ ...options, len: v })} />
    </OptionsBar>
  ),
  defaultOptions: { len: 6 },
  transform: ({ options }) => {
    const len = Math.max(3, Math.min(12, Number(options.len ?? 6)));
    return { output: generatePin(len), info: `${len}-digit PIN` };
  },
};

const memorablePasswordGenerator: ToolDefinition = {
  slug: "memorable-password-generator",
  mode: "generator",
  hideInput: true,
  live: false,
  transform: () => ({ output: generateMemorablePassword() }),
};

const passwordComparisonTool: ToolDefinition = {
  slug: "password-comparison-tool",
  mode: "dual",
  transform: ({ input, secondInput }) => {
    if (!input || !secondInput) return { output: "" };
    return { output: input === secondInput ? "✓ Identical" : "✗ Different" };
  },
};

const aesTool: ToolDefinition = {
  slug: "aes-encryption-decryption-tool",
  mode: "text",
  live: false,
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptSelect value={String(options.mode ?? "encrypt")} onChange={(v) => setOptions({ ...options, mode: v })} options={[{ value: "encrypt", label: "Encrypt" }, { value: "decrypt", label: "Decrypt" }]} />
      <OptRow label="Password">
        <input defaultValue={String(options.password ?? "")} onChange={(e) => setOptions({ ...options, password: e.target.value })} className="h-8 w-40 rounded-md border border-input bg-background px-2 text-sm" />
      </OptRow>
    </OptionsBar>
  ),
  defaultOptions: { mode: "encrypt", password: "" },
  transform: async ({ input, options }) => {
    const mode = String(options.mode ?? "encrypt");
    const password = String(options.password ?? "");
    if (!password) throw new Error("Enter a password in options");
    if (mode === "decrypt") return { output: await aesDecrypt(input, password) };
    return {
      output: await aesEncrypt(input, password),
      info: "AES-GCM 256 · PBKDF2-SHA256 · 150k iterations · salt(16) | iv(12) | ciphertext, Base64",
    };
  },
};

const rsaKeyGenerator: ToolDefinition = {
  slug: "rsa-key-generator",
  mode: "generator",
  hideInput: true,
  live: false,
  transform: async () => {
    const { publicPem, privatePem } = await generateRsaKeypair();
    return { output: `${publicPem}\n\n${privatePem}`, info: "RSA-OAEP 2048-bit · SHA-256" };
  },
};

const ecKeyGenerator: ToolDefinition = {
  slug: "elliptic-curve-key-generator",
  mode: "generator",
  hideInput: true,
  live: false,
  transform: async () => {
    const { publicPem, privatePem } = await generateEcKeypair();
    return { output: `${publicPem}\n\n${privatePem}`, info: "ECDSA P-256" };
  },
};

const caesarCipherTool: ToolDefinition = {
  slug: "caesar-cipher-tool",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptNumber label="Shift" value={Number(options.shift ?? 3)} min={-25} max={25} onChange={(v) => setOptions({ ...options, shift: v })} />
    </OptionsBar>
  ),
  defaultOptions: { shift: 3 },
  transform: ({ input, options }) => {
    const shift = Math.max(-25, Math.min(25, Number(options.shift ?? 3)));
    return { output: caesarShift(input, shift) };
  },
};

const vigenereCipherTool: ToolDefinition = {
  slug: "vigenere-cipher-tool",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptRow label="Key">
        <input defaultValue={String(options.key ?? "KEY")} onChange={(e) => setOptions({ ...options, key: e.target.value })} className="h-8 w-40 rounded-md border border-input bg-background px-2 text-sm" />
      </OptRow>
      <OptSelect value={String(options.mode ?? "enc")} onChange={(v) => setOptions({ ...options, mode: v })} options={[{ value: "enc", label: "Encrypt" }, { value: "dec", label: "Decrypt" }]} />
    </OptionsBar>
  ),
  defaultOptions: { key: "KEY", mode: "enc" },
  transform: ({ input, options }) => {
    const key = String(options.key ?? "KEY");
    const mode = String(options.mode ?? "enc") === "dec" ? "dec" : "enc";
    return { output: vigenere(input, key, mode) };
  },
};

const xorCipherTool: ToolDefinition = {
  slug: "xor-cipher-tool",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptRow label="Key">
        <input defaultValue={String(options.key ?? "key")} onChange={(e) => setOptions({ ...options, key: e.target.value })} className="h-8 w-40 rounded-md border border-input bg-background px-2 text-sm" />
      </OptRow>
    </OptionsBar>
  ),
  defaultOptions: { key: "key" },
  transform: ({ input, options }) => {
    const key = String(options.key ?? "key");
    return { output: xorCipher(input, key), info: "Output is Base64-encoded ciphertext" };
  },
};

const railFenceCipherTool: ToolDefinition = {
  slug: "rail-fence-cipher-tool",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptNumber label="Rails" value={Number(options.rails ?? 3)} min={2} max={10} onChange={(v) => setOptions({ ...options, rails: v })} />
      <OptSelect value={String(options.mode ?? "enc")} onChange={(v) => setOptions({ ...options, mode: v })} options={[{ value: "enc", label: "Encrypt" }, { value: "dec", label: "Decrypt" }]} />
    </OptionsBar>
  ),
  defaultOptions: { rails: 3, mode: "enc" },
  transform: ({ input, options }) => {
    const rails = Math.max(2, Math.min(10, Number(options.rails ?? 3)));
    const mode = String(options.mode ?? "enc") === "dec" ? "dec" : "enc";
    return { output: railFence(input, rails, mode) };
  },
};

const zeroWidthInserter: ToolDefinition = {
  slug: "zero-width-character-inserter",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptRow label="Secret">
        <input defaultValue={String(options.secret ?? "hi")} onChange={(e) => setOptions({ ...options, secret: e.target.value })} className="h-8 w-40 rounded-md border border-input bg-background px-2 text-sm" />
      </OptRow>
    </OptionsBar>
  ),
  defaultOptions: { secret: "hi" },
  transform: ({ input, options }) => {
    const secret = String(options.secret ?? "hi");
    return { output: zeroWidthEncode(input, secret), info: "Invisible zero-width chars are appended after the cover text" };
  },
};

const jwtValidator: ToolDefinition = {
  slug: "jwt-validator",
  mode: "text",
  transform: ({ input }) => {
    if (!input) return { output: "" };
    const issues = validateJwt(input);
    return { output: issues.length ? issues.map((i) => `• ${i}`).join("\n") : "✓ Structure valid, no temporal issues." };
  },
};

const hashComparisonTool: ToolDefinition = {
  slug: "hash-comparison-tool",
  mode: "dual",
  transform: ({ input, secondInput }) => {
    if (!input || !secondInput) return { output: "" };
    const eq = input.trim().toLowerCase() === secondInput.trim().toLowerCase();
    return { output: eq ? "✓ Match" : "✗ Different" };
  },
};

const cspValidator: ToolDefinition = {
  slug: "csp-validator",
  mode: "text",
  transform: ({ input }) => {
    if (!input) return { output: "" };
    const issues = validateCsp(input);
    return { output: issues.length ? issues.map((i) => `• ${i}`).join("\n") : "✓ No common issues detected." };
  },
};

const sriGenerator: ToolDefinition = {
  slug: "subresource-integrity-generator",
  mode: "text",
  live: false,
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptSelect value={String(options.algo ?? "SHA-384")} onChange={(v) => setOptions({ ...options, algo: v })} options={[{ value: "SHA-256", label: "SHA-256" }, { value: "SHA-384", label: "SHA-384" }, { value: "SHA-512", label: "SHA-512" }]} />
    </OptionsBar>
  ),
  defaultOptions: { algo: "SHA-384" },
  transform: async ({ input, options }) => {
    const url = input.trim();
    if (!url) throw new Error("Enter an asset URL");
    const algo = String(options.algo ?? "SHA-384") as "SHA-256" | "SHA-384" | "SHA-512";
    const sri = await sriHash(url, algo);
    return { output: sri, info: `Use: <script integrity="${sri}" crossorigin="anonymous" ...>` };
  },
};

const apiKeyFormatDetector: ToolDefinition = {
  slug: "api-key-format-detector",
  mode: "text",
  transform: ({ input }) => {
    if (!input) return { output: "" };
    const matches = detectApiKeyFormat(input);
    return { output: matches.length ? matches.map((m) => `✓ Matches: ${m}`).join("\n") : "No known format matched." };
  },
};

const jwtHs256Verifier: ToolDefinition = {
  slug: "jwt-hs256-verifier",
  mode: "text",
  live: false,
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptRow label="Secret">
        <input defaultValue={String(options.secret ?? "")} onChange={(e) => setOptions({ ...options, secret: e.target.value })} className="h-8 w-40 rounded-md border border-input bg-background px-2 text-sm" />
      </OptRow>
    </OptionsBar>
  ),
  defaultOptions: { secret: "" },
  transform: async ({ input, options }) => {
    const secret = String(options.secret ?? "");
    if (!secret) throw new Error("Enter the HS256 secret in options");
    const ok = await verifyHmacJwt(input, secret);
    return { output: ok ? "✓ Signature valid (HS256)" : "✗ Signature does NOT match" };
  },
};

export const securityTools: ToolDefinition[] = [
  hashGenerator, bcryptGenerator, uuidGenerator, passwordStrengthChecker, jwtDecoder,
  jwtGenerator, jwtExpiryChecker, jwtVisualizer, jwtRs256Verifier, tokenStrengthAnalyzer,
  randomPasswordGenerator, randomApiKeyGenerator, sha512, sha256, sha1, md5Generator,
  hmacGenerator, crc32Tool, htpasswdGenerator, basicAuthGenerator, pkceGenerator,
  oauthUrlGenerator, sessionTokenDecoder, fileHashChecker, apiKeyFormatter,
  passphraseGenerator, passwordEntropyCalculator, passwordPatternAnalyzer, commonPasswordChecker,
  passwordLengthEstimator, pinGenerator, memorablePasswordGenerator, passwordComparisonTool,
  aesTool, rsaKeyGenerator, ecKeyGenerator, caesarCipherTool, vigenereCipherTool, xorCipherTool,
  railFenceCipherTool, zeroWidthInserter, jwtValidator, hashComparisonTool, cspValidator,
  sriGenerator, apiKeyFormatDetector, jwtHs256Verifier,
];

// QR / barcode handled in visual.ts (canvas-based).
export type { ToolResult };
