/**
 * Central tool registration — imports every module and wires slugs into
 * the global registry.  Import this file once at the app root (or in the
 * tool-shell component) so all tools are available before any page renders.
 *
 * Order matters only for duplicate slugs — last call wins.
 * Currently css.ts registers `clamp-calculator` and `css-specificity-calculator`
 * which are overwritten by visual.ts's richer versions.
 */
import { registerMany } from "@/components/developers/tools/registry";

// ── Core data & format ────────────────────────────────────────────
// json.ts exports both jsonTools and encodingTools (hex/base32/base58/etc).
// encoding.ts exports base64/url/url-parser (the three not covered in json.ts).
import { jsonTools } from "./json";
import { encodingTools as baseEncodingTools } from "./encoding";

// ── Security & crypto ───────────────────────────────────────────────
import { securityTools } from "./security";

// ── Regex ───────────────────────────────────────────────────────────
import { regexTools } from "./regex";

// ── Text / case ────────────────────────────────────────────────────
import { textTools } from "./text";

// ── Markdown ───────────────────────────────────────────────────────
import { markdownTools } from "./markdown";

// ── HTML ────────────────────────────────────────────────────────────
import { htmlTools } from "./html";

// ── CSS / frontend generators ──────────────────────────────────────
import { cssTools } from "./css";

// ── Visual / SVG / CSS playgrounds ──────────────────────────────────
import { visualTools } from "./visual";

// ── Date & time ───────────────────────────────────────────────────
import { datetimeTools } from "./datetime";

// ── JavaScript / TypeScript ───────────────────────────────────────
import { jsTools } from "./javascript";

// ── Database / SQL ────────────────────────────────────────────────
import { databaseTools } from "./database";

// ── Network / DevOps ───────────────────────────────────────────────
import { networkTools } from "./network";

// ── Web / SEO ──────────────────────────────────────────────────────
import { seoTools } from "./seo";

// ── Git & dev productivity ─────────────────────────────────────────
import { gitTools } from "./git";

// ── Config & infrastructure ────────────────────────────────────────
import { configTools } from "./config";

// ── Browser / storage ─────────────────────────────────────────────
import { browserTools } from "./browser";

// ── Build & bundle ────────────────────────────────────────────────
import { buildTools } from "./build";

// ── AI / modern dev utilities ──────────────────────────────────────
import { aiTools } from "./ai";

// ── Register all ─────────────────────────────────────────────────────

// encoding.ts has base64/url/url-parser — json.ts has everything else
// Register json.ts encoding tools first, then baseEncodingTools (no overlap,
// json.ts explicitly excludes base64/url/url-parser from its encodingTools).
// Actually they ARE separate — json.ts encodingTools are hex/base32/base58 etc,
// encoding.ts encodingTools are base64/url/url-parser. No overlap at all.
registerMany(jsonTools);
registerMany(baseEncodingTools);
registerMany(securityTools);
registerMany(regexTools);
registerMany(textTools);
registerMany(markdownTools);
registerMany(htmlTools);
registerMany(cssTools);       // clamp-calculator, css-specificity registered here
registerMany(visualTools);    // overrides clamp-calculator, css-specificity with richer versions
registerMany(datetimeTools);
registerMany(jsTools);
registerMany(databaseTools);
registerMany(networkTools);
registerMany(seoTools);
registerMany(gitTools);
registerMany(configTools);
registerMany(browserTools);
registerMany(buildTools);
registerMany(aiTools);
