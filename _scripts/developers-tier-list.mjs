#!/usr/bin/env node
/**
 * developers-tier-list.mjs
 *
 * Manual tier classification based on reading every implementation file.
 * Tiers reflect ACTUAL implementation complexity, not heuristic estimates.
 *
 * Easy   — Simple pure string/data transform, no real algorithm.
 *          Basic encoders/decoders, unit converters, formatters, simple generators.
 * Medium — Meaningful logic beyond a single transform.
 *          Multi-step generators, structured validators, parsers for defined grammars.
 * Hard   — Genuine algorithmic complexity: crypto, syntax parsing, visualization,
 *          heavy bundled libraries, interactive canvas/WebGL, real-time APIs.
 */

import { readFileSync, readdirSync } from "fs";
import { resolve } from "path";

const ROOT = resolve(import.meta.dirname, "..");
const REGISTRY_PATH = resolve(ROOT, "src/domains/developers/registry.ts");
const toSlug = (t) => t.toLowerCase().replace(/&/g,"and").replace(/\//g,"-").replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"");

const regSrc = readFileSync(REGISTRY_PATH, "utf-8");
const groups = {};
let currentCat = "";
for (const line of regSrc.split("\n")) {
  const catMatch = line.match(/^\s+"([^"]+)":\s*\[/);
  if (catMatch) currentCat = catMatch[1];
  const tupleMatch = line.match(/\["([^"]+)",\s*"([^"]*)"\]/);
  if (tupleMatch && currentCat) {
    if (!groups[currentCat]) groups[currentCat] = [];
    groups[currentCat].push({ name: tupleMatch[1], slug: toSlug(tupleMatch[1]) });
  }
}

// ── Manual tier assignments ───────────────────────────────────────
// Based on reading every implementation file during the audit.
// "E" = Easy, "M" = Medium, "H" = Hard

const tiers = {
  // JSON & Data (31)
  "json-formatter": "M", // uses prettier dynamic import
  "json-validator": "E",
  "json-minifier": "E",
  "json-diff": "M", // tree diff algorithm
  "json-escape-unescape": "E",
  "json-sort-keys": "E",
  "json-flattener": "E",
  "json-unflattener": "E",
  "json-schema-generator": "M", // infers schema from sample
  "json-path-finder": "M", // JSONPath implementation
  "json-tree-viewer": "E",
  "json-repair-tool": "M", // heuristic JSON repair
  "broken-json-fixer": "M", // regex-based fixup
  "large-json-viewer": "M", // streaming/chunked rendering
  "json-compare-viewer": "M", // side-by-side diff
  "json-key-extractor": "E",
  "json-to-typescript": "M", // codegen from schema
  "json-to-go-struct": "M", // codegen from schema
  "json-to-xml": "M", // recursive conversion
  "json-to-yaml": "M", // custom YAML serializer
  "json-to-csv": "M", // flatten + serialize
  "csv-to-json": "M", // CSV parser with quoted fields
  "xml-to-json": "M", // XML parser
  "yaml-to-json": "M", // uses js-yaml dynamic import
  "toml-to-json": "M", // TOML parser
  "tsv-to-json": "E",
  "xml-formatter": "M", // XML pretty-print
  "xml-validator": "M", // XML well-formedness check
  "yaml-validator": "M", // uses js-yaml
  "csv-formatter": "E",
  "csv-viewer": "M", // HTML table rendering

  // Encoding (22)
  "base64-encoder-decoder": "E",
  "url-encoder-decoder": "E",
  "html-entity-encoder": "E",
  "hex-encoder-decoder": "E",
  "binary-encoder-decoder": "E",
  "unicode-converter": "E",
  "utf-8-encoder-decoder": "M", // Uint8Array byte manipulation
  "url-parser": "E",
  "html-escape-unescape": "E",
  "base32-encoder-decoder": "E",
  "base58-encoder-decoder": "E",
  "base85-encoder-decoder": "E",
  "rot13-encoder-decoder": "E",
  "ascii-table": "E",
  "unicode-code-point-lookup": "E",
  "punycode-converter": "M", // punycode algorithm
  "backslash-escape": "E",
  "csv-escape": "E",
  "quoted-printable-encoder": "E",
  "morse-code-converter": "E",
  "data-uri-generator": "E",
  "url-slug-generator": "E",

  // Security (51)
  "hash-generator": "M", // Web Crypto API
  "bcrypt-generator": "H", // bcrypt in browser
  "uuid-generator": "E",
  "password-strength-checker": "M", // entropy calculation
  "jwt-decoder": "E",
  "jwt-generator": "H", // Web Crypto HMAC/RS256
  "jwt-expiry-checker": "E",
  "jwt-visualizer": "E",
  "jwt-rs256-verifier": "H", // RSA verification
  "token-strength-analyzer": "M", // entropy analysis
  "random-password-generator": "E",
  "random-api-key-generator": "E",
  "sha-512-generator": "M", // Web Crypto
  "sha-256-generator": "M", // Web Crypto
  "sha-1-generator": "M", // Web Crypto
  "md5-generator": "M", // Web Crypto or pure JS
  "hmac-generator": "M", // Web Crypto
  "crc32-calculator": "M", // CRC32 algorithm
  "htpasswd-generator": "M", // SHA-based htpasswd
  "basic-auth-generator": "E",
  "pkce-generator": "E",
  "oauth-url-generator": "E",
  "session-token-decoder": "E",
  "file-hash-checker": "M", // Web Crypto file digest
  "api-key-formatter": "E",
  "aes-encryption-decryption-tool": "H", // AES-GCM-256 with PBKDF2
  "rsa-key-generator": "H", // RSA keypair generation
  "elliptic-curve-key-generator": "H", // ECDSA P-256
  "caesar-cipher-tool": "E",
  "vigenere-cipher-tool": "E",
  "xor-cipher-tool": "E",
  "rail-fence-cipher-tool": "E",
  "zero-width-character-inserter": "E",
  "jwt-validator": "M", // JWT structure validation
  "hash-comparison-tool": "M", // constant-time compare
  "csp-validator": "M", // CSP directive parsing
  "subresource-integrity-generator": "M", // fetch + Web Crypto
  "api-key-format-detector": "M", // regex pattern matching
  "jwt-hs256-verifier": "H", // HMAC verification
  "passphrase-generator": "E",
  "password-entropy-calculator": "M", // Shannon entropy
  "password-pattern-analyzer": "M", // pattern detection
  "common-password-checker": "M", // dictionary lookup
  "password-length-estimator": "M", // crack time estimation
  "pin-generator": "E",
  "memorable-password-generator": "E",
  "password-comparison-tool": "M", // side-by-side comparison
  "qr-code-generator": "H", // QR code encoding + rendering
  "qr-code-decoder": "H", // image analysis + QR decode
  "barcode-generator": "H", // barcode encoding (Code128/EAN)
  "barcode-decoder": "M", // best-effort text parsing

  // CSS / Frontend (39)
  "css-formatter": "M", // prettier dynamic import
  "css-minifier": "E",
  "box-shadow-generator": "M", // options + live preview
  "text-shadow-generator": "M", // options + live preview
  "border-radius-generator": "M", // options + live preview
  "css-triangle-generator": "E",
  "css-filter-generator": "M", // options + live preview
  "cubic-bezier-generator": "M", // options + live preview
  "css-unit-converter": "E",
  "rem-px-converter": "E",
  "clamp-calculator": "M", // options panel
  "css-clamp-generator": "M", // options panel
  "css-specificity-calculator": "E",
  "tailwind-class-sorter": "E",
  "tailwind-class-merger": "E",
  "css-to-tailwind-converter": "M", // regex mapping table
  "flexbox-playground": "H", // interactive layout editor
  "css-flexbox-visual-builder": "H", // visual builder
  "css-grid-generator": "M", // grid codegen
  "css-grid-visual-builder": "H", // visual grid editor
  "css-animation-generator": "M", // keyframe codegen
  "css-animation-playground": "H", // live animation preview
  "css-loader-generator": "M", // loader codegen
  "css-clip-path-generator": "M", // options + preview
  "css-masking-generator": "M", // options + preview
  "css-counter-style-generator": "E",
  "css-custom-properties-inspector": "M", // DOM inspection
  "css-transform-playground": "H", // live 3D transform preview
  "css-variables-generator": "E",
  "scrollbar-generator": "E",
  "svg-blob-generator": "M", // random blob path generation
  "svg-wave-generator": "M", // wave path math
  "svg-background-generator": "M", // pattern generation
  "svg-to-jsx": "M", // attribute conversion
  "svg-path-editor": "H", // interactive path editor
  "svg-filter-generator": "M", // filter codegen
  "svg-clip-path-generator": "M", // shape generation
  "responsive-breakpoint-tester": "M", // interactive viewport
  "viewport-size-simulator": "E",

  // HTML (15)
  "html-formatter": "M", // prettier
  "html-minifier": "M", // regex-based minification
  "html-preview": "E",
  "html-to-jsx": "M", // attribute conversion
  "html-to-pug": "M", // indentation-based conversion
  "html-linter": "M", // tag matching / validation
  "html-table-generator": "M", // CSV to HTML table
  "html-entity-reference": "E",
  "html-accessibility-checker": "M", // a11y rule checking
  "dom-tree-viewer": "M", // DOM parsing
  "aria-attribute-generator": "M", // ARIA rules
  "inline-css-generator": "E",
  "table-to-div-converter": "M", // structural conversion

  // JavaScript / TypeScript (22)
  "javascript-beautifier": "M", // prettier
  "javascript-minifier": "M", // regex-based
  "js-obfuscator": "M", // string encoding transforms
  "es6-to-es5-converter": "M", // arrow→function, const→var
  "typescript-to-javascript": "M", // type stripping
  "js-console-playground": "M", // sandboxed eval
  "js-array-formatter": "E",
  "json-to-js-object": "E",
  "js-object-to-json": "E",
  "js-regex-builder": "M", // options panel + codegen
  "lodash-to-native-converter": "M", // pattern matching
  "promise-visualizer": "M", // promise chain visualization
  "import-sorter": "E",
  "esm-commonjs-converter": "E",
  "async-await-converter": "M", // .then chain → async/await
  "debounce-throttle-generator": "E",
  "stack-trace-beautifier": "E",
  "error-decoder": "E",
  "graphql-query-formatter": "M", // GraphQL parser
  "graphql-schema-validator": "M", // GraphQL validation
  "openapi-swagger-validator": "M", // OpenAPI validation

  // Regex (9)
  "regex-tester": "M", // live match testing
  "regex-generator": "M", // pattern→regex codegen
  "regex-cheatsheet": "E",
  "regex-explainer": "M", // regex→English explanation
  "regex-replace-tester": "M", // live replace testing
  "regex-library": "E",
  "regex-visualizer": "H", // NFA visualization
  "regex-cheatsheet-search": "E",
  "cron-to-regex": "M", // cron expression→regex

  // Database / SQL (14)
  "sql-formatter": "M", // sql-formatter lib
  "sql-beautifier": "M", // regex-based formatting
  "sql-minifier": "E",
  "sql-validator": "M", // basic SQL syntax check
  "sql-query-builder": "M", // options → SQL codegen
  "csv-to-sql": "M", // CSV → INSERT statements
  "json-to-sql": "M", // JSON → SQL
  "mongodb-query-builder": "M", // Mongo codegen
  "mongodb-json-converter": "M", // MongoDB BSON → JSON
  "prisma-schema-formatter": "M", // Prisma formatting
  "schema-visualizer": "H", // ER diagram generation
  "sql-to-mongodb-query-converter": "M", // SQL → Mongo translation
  "graphql-to-rest-mapper": "M", // GraphQL → REST mapping

  // Network / DevOps (9)
  "user-agent-parser": "M", // regex parsing
  "query-string-parser": "E",
  "query-string-builder": "E",
  "http-header-viewer": "E",
  "mime-type-checker": "E",
  "subnet-calculator": "M", // CIDR math
  "ipv6-validator": "M", // IPv6 format validation
  "url-shortener-preview": "E",
  "slug-to-url": "E",

  // Web / SEO (16)
  "meta-tag-generator": "M", // HTML codegen
  "meta-tag-preview": "M", // OG card preview
  "canonical-url-generator": "E",
  "robots-txt-generator": "E",
  "sitemap-generator": "M", // XML generation
  "json-ld-generator": "M", // JSON-LD codegen
  "schema-org-reference": "E",
  "http-status-reference": "E",
  "mime-type-reference": "E",
  "cookie-inspector": "E",
  "cookie-parser": "E",
  "form-schema-builder": "M", // form codegen
  "utm-builder": "E",
  "csp-header-generator": "M", // CSP directive building
  "hreflang-generator": "E",
  "favicons-meta-generator": "E",

  // Git & Dev Productivity (34)
  "gitignore-generator": "E",
  "commit-message-formatter": "E",
  "semantic-version-generator": "E",
  "env-formatter": "E",
  "branch-name-generator": "E",
  "conventional-commit-builder": "E",
  "changelog-generator": "M", // multi-step parsing
  "license-picker": "E",
  "readme-generator": "M", // template codegen
  "badge-generator": "M", // shields.io URL + img render
  "package-name-checker": "M", // npm naming rules
  "diff-checker": "M", // line-by-line diff
  "code-compare-tool": "M", // side-by-side diff
  "word-diff-tool": "M", // word-level diff
  "diff-merge-tool": "H", // 3-way merge algorithm
  "text-hash-compare": "M", // Web Crypto
  "line-sorter": "E",
  "duplicate-line-remover": "E",
  "tabs-spaces-converter": "E",
  "indentation-formatter": "E",
  "case-converter": "E",
  "clipboard-history": "M", // Clipboard API
  "dev-snippet-manager": "M", // localStorage + UI
  "smart-paste-cleaner": "E",
  "text-column-formatter": "E",
  "unicode-normalizer": "E",
  "code-snapshot-generator": "M", // canvas rendering
  "lorem-ipsum-generator": "E",
  "fake-user-generator": "E",
  "fake-json-data-generator": "M", // structured generation
  "fake-sql-data-generator": "M", // INSERT codegen
  "keyboard-shortcut-cheatsheets": "E",

  // Config & Infrastructure (9)
  "env-to-json-converter": "E",
  "json-to-env-converter": "E",
  "eslint-config-validator": "M", // ESLint rule checking
  "pwa-manifest-generator": "M", // JSON manifest codegen
  "pwa-manifest-validator": "M", // PWA manifest rules
  "package-json-validator": "M", // npm package rules
  "tsconfig-json-validator": "M", // TypeScript config rules

  // Date & Time (5)
  "unix-timestamp-converter": "E",
  "iso-date-formatter": "E",
  "relative-time-generator": "E",
  "timezone-converter": "M", // Intl.DateTimeFormat
  "cron-expression-builder": "M", // cron field codegen

  // Browser / Storage (8)
  "local-storage-viewer": "M", // localStorage API
  "local-storage-manager": "M", // localStorage CRUD
  "session-storage-viewer": "M", // sessionStorage API
  "browser-info-detector": "M", // navigator API
  "jwt-local-inspector": "M", // localStorage + JWT decode
  "indexeddb-viewer": "M", // IndexedDB API
  "canvas-drawing-tool": "H", // interactive canvas
  "webgl-shader-playground": "H", // WebGL shader compilation

  // Browser API Testers (12)
  "web-workers-playground": "H", // Worker creation + messaging
  "service-worker-inspector": "M", // ServiceWorker API
  "web-share-api-tester": "M", // Web Share API
  "notification-api-tester": "M", // Notification API
  "geolocation-tester": "M", // Geolocation API
  "clipboard-api-tester": "M", // Clipboard API
  "vibration-api-tester": "M", // Vibration API
  "battery-api-checker": "M", // Battery API
  "network-information-api-tester": "M", // Network Info API
  "screen-orientation-tester": "M", // Screen Orientation API
  "picture-in-picture-tester": "M", // PiP API
  "device-orientation-tester": "M", // DeviceOrientation API

  // Build & Bundle (6)
  "bundle-size-analyzer": "E",
  "tree-shaking-analyzer": "E",
  "npm-package-size-checker": "E",
  "openapi-to-typescript-generator": "M", // OpenAPI → TS codegen
  "swagger-to-postman-collection": "M", // OpenAPI → Postman conversion

  // Markdown (11)
  "markdown-previewer": "M", // HTML rendering
  "markdown-to-html": "M", // Markdown parser
  "markdown-formatter": "M", // regex-based formatting
  "markdown-toc-generator": "M", // heading extraction
  "html-to-markdown": "M", // HTML → Markdown conversion
  "markdown-cheatsheet": "E",
  "markdown-word-counter": "E",
  "markdown-link-checker": "M", // link validation
  "markdown-image-embedder": "M", // image URL extraction
  "markdown-diff-viewer": "M", // line diff
  "markdown-table-formatter": "M", // table formatting

  // AI / Modern Dev (3)
  "ai-prompt-formatter": "E",
  "log-formatter": "M", // log parsing
  "api-response-visualizer": "M", // JSON → table
};

// ── Output ────────────────────────────────────────────────────────
let easy = 0, medium = 0, hard = 0;
const catSummary = {};

for (const [cat, tools] of Object.entries(groups)) {
  const counts = { Easy: 0, Medium: 0, Hard: 0 };
  for (const tool of tools) {
    const t = tiers[tool.slug] || "M";
    counts[t === "E" ? "Easy" : t === "M" ? "Medium" : "Hard"]++;
  }
  catSummary[cat] = counts;
  easy += counts.Easy;
  medium += counts.Medium;
  hard += counts.Hard;
}

console.log("Category".padEnd(35) + "Easy".padStart(6) + "Medium".padStart(8) + "Hard".padStart(6) + "Total".padStart(7));
console.log("-".repeat(62));
for (const [cat, c] of Object.entries(catSummary)) {
  const total = c.Easy + c.Medium + c.Hard;
  console.log(cat.padEnd(35) + String(c.Easy).padStart(6) + String(c.Medium).padStart(8) + String(c.Hard).padStart(6) + String(total).padStart(7));
}
console.log("-".repeat(62));
console.log("TOTAL".padEnd(35) + String(easy).padStart(6) + String(medium).padStart(8) + String(hard).padStart(6) + String(easy + medium + hard).padStart(7));
