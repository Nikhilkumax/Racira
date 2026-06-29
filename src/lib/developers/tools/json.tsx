import type { ToolDefinition, ToolResult } from "@/components/developers/tools/registry";
import { OptionsBar, OptRow, OptSelect, OptSwitch, OptNumber } from "@/components/developers/tools/options-controls";
import { b64Decode, b64Encode, byteLength, hexToBuf, bufToHex, stableStringify, tryParseJSON } from "./helpers";

const INDENT_OPTS = [
  { value: "2", label: "2 spaces" },
  { value: "4", label: "4 spaces" },
  { value: "tab", label: "Tabs" },
  { value: "0", label: "Minified" },
];

function indentSize(opt: string): string | number {
  if (opt === "tab") return "\t";
  return Number(opt);
}

function jsonInfo(v: unknown): string {
  const bytes = byteLength(stableStringify(v));
  let nodes = 0;
  let keys = 0;
  const walk = (x: unknown) => {
    nodes++;
    if (Array.isArray(x)) x.forEach(walk);
    else if (x && typeof x === "object") {
      for (const k of Object.keys(x)) {
        keys++;
        walk((x as Record<string, unknown>)[k]);
      }
    }
  };
  walk(v);
  return `Valid JSON · ${nodes} values · ${keys} keys · ${bytes} bytes`;
}

// ---- JSON Formatter / Validator / Minifier share formatting logic ----

function IndentOptions({ options, setOptions }: { options: Record<string, unknown>; setOptions: (n: Record<string, unknown>) => void }) {
  return (
    <OptionsBar>
      <OptSelect value={String(options.indent ?? "2")} onChange={(v) => setOptions({ ...options, indent: v })} options={INDENT_OPTS} />
    </OptionsBar>
  );
}

const jsonFormatter: ToolDefinition = {
  slug: "json-formatter",
  mode: "text",
  options: IndentOptions,
  defaultOptions: { indent: "2" },
  placeholder: '{ "hello": "world" }',
  transform: ({ input, options }) => {
    const v = tryParseJSON(input);
    const out = JSON.stringify(v, null, indentSize(String(options.indent ?? "2")));
    return { output: out, info: jsonInfo(v) };
  },
};

const jsonValidator: ToolDefinition = {
  slug: "json-validator",
  mode: "text",
  live: true,
  placeholder: "Paste JSON to validate…",
  transform: ({ input }) => {
    const v = tryParseJSON(input);
    return { output: JSON.stringify(v, null, 2), info: `✓ Valid JSON — ${jsonInfo(v)}` };
  },
};

const jsonMinifier: ToolDefinition = {
  slug: "json-minifier",
  mode: "text",
  placeholder: "Paste JSON to minify…",
  transform: ({ input }) => {
    const v = tryParseJSON(input);
    const out = JSON.stringify(v);
    return { output: out, info: `${byteLength(input)} → ${byteLength(out)} bytes` };
  },
};

const jsonEscapeUnescape: ToolDefinition = {
  slug: "json-escape-unescape",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptSelect
        value={String(options.mode ?? "escape")}
        onChange={(v) => setOptions({ ...options, mode: v })}
        options={[
          { value: "escape", label: "Escape" },
          { value: "unescape", label: "Unescape" },
        ]}
      />
    </OptionsBar>
  ),
  defaultOptions: { mode: "escape" },
  transform: ({ input, options }) => {
    const mode = String(options.mode ?? "escape");
    if (mode === "escape") {
      // Wrap as JSON string value, strip surrounding quotes.
      const out = JSON.stringify(input);
      return { output: out.slice(1, -1) };
    }
    // Unescape: re-wrap with quotes and parse.
    try {
      const v = JSON.parse(`"${input}"`);
      return { output: String(v) };
    } catch {
      throw new Error("Not a valid escaped JSON string");
    }
  },
};

const jsonSortKeys: ToolDefinition = {
  slug: "json-sort-keys",
  mode: "text",
  options: IndentOptions,
  defaultOptions: { indent: "2", desc: false },
  transform: ({ input, options }) => {
    const v = tryParseJSON(input);
    const desc = Boolean(options.desc);
    const sort = (x: unknown): unknown => {
      if (Array.isArray(x)) return x.map(sort);
      if (x && typeof x === "object") {
        const keys = Object.keys(x).sort();
        if (desc) keys.reverse();
        const o: Record<string, unknown> = {};
        for (const k of keys) o[k] = sort((x as Record<string, unknown>)[k]);
        return o;
      }
      return x;
    };
    const out = JSON.stringify(sort(v), null, indentSize(String(options.indent ?? "2")));
    return { output: out };
  },
};

const jsonFlattener: ToolDefinition = {
  slug: "json-flattener",
  mode: "text",
  options: IndentOptions,
  defaultOptions: { indent: "2", sep: "." },
  transform: ({ input, options }) => {
    const v = tryParseJSON(input);
    const sep = String(options.sep ?? ".");
    const out: Record<string, unknown> = {};
    const walk = (x: unknown, prefix: string) => {
      if (x && typeof x === "object" && !Array.isArray(x)) {
        for (const k of Object.keys(x)) walk((x as Record<string, unknown>)[k], prefix ? `${prefix}${sep}${k}` : k);
      } else if (Array.isArray(x)) {
        x.forEach((item, i) => walk(item, `${prefix}${sep}${i}`));
      } else {
        out[prefix] = x;
      }
    };
    walk(v, "");
    return { output: JSON.stringify(out, null, indentSize(String(options.indent ?? "2"))) };
  },
};

const jsonUnflattener: ToolDefinition = {
  slug: "json-unflattener",
  mode: "text",
  options: IndentOptions,
  defaultOptions: { indent: "2", sep: "." },
  transform: ({ input, options }) => {
    const v = tryParseJSON(input);
    if (!v || typeof v !== "object" || Array.isArray(v)) throw new Error("Expected a flat JSON object");
    const sep = String(options.sep ?? ".");
    const out: Record<string, unknown> = {};
    for (const flatKey of Object.keys(v)) {
      const parts = flatKey.split(sep);
      let cur = out;
      for (let i = 0; i < parts.length - 1; i++) {
        const k = parts[i];
        cur[k] = (cur[k] as Record<string, unknown>) || {};
        cur = cur[k] as Record<string, unknown>;
      }
      cur[parts[parts.length - 1]] = (v as Record<string, unknown>)[flatKey];
    }
    return { output: JSON.stringify(out, null, indentSize(String(options.indent ?? "2"))) };
  },
};

const jsonKeyExtractor: ToolDefinition = {
  slug: "json-key-extractor",
  mode: "text",
  transform: ({ input }) => {
    const v = tryParseJSON(input);
    const keys = new Set<string>();
    const walk = (x: unknown) => {
      if (Array.isArray(x)) x.forEach(walk);
      else if (x && typeof x === "object") {
        for (const k of Object.keys(x)) {
          keys.add(k);
          walk((x as Record<string, unknown>)[k]);
        }
      }
    };
    walk(v);
    return { output: Array.from(keys).sort().join("\n"), info: `${keys.size} unique keys` };
  },
};

const jsonToTypescript: ToolDefinition = {
  slug: "json-to-typescript",
  mode: "text",
  transform: ({ input, options }) => {
    const v = tryParseJSON(input);
    const rootName = String(options.rootName ?? "Root");
    const interfaces = new Map<string, string>();
    const seen = new Map<string, string>();

    const typeOf = (x: unknown, name: string): string => {
      if (x === null) return "null";
      if (Array.isArray(x)) {
        if (x.length === 0) return "unknown[]";
        const elemTypes = Array.from(new Set(x.map((e) => typeOf(e, name))));
        return `${elemTypes.join(" | ")}[]`;
      }
      switch (typeof x) {
        case "string": return "string";
        case "number": return Number.isInteger(x) ? "number" : "number";
        case "boolean": return "boolean";
        case "object": {
          const sig = stableStringify(x).slice(0, 200);
          if (seen.has(sig)) return seen.get(sig)!;
          const safeName = name;
          seen.set(sig, safeName);
          const obj = x as Record<string, unknown>;
          const fields = Object.keys(obj).map((k) => `  ${quoteKey(k)}: ${typeOf(obj[k], capitalize(singularize(k)))};`);
          interfaces.set(safeName, `export interface ${safeName} {\n${fields.join("\n")}\n}`);
          return safeName;
        }
        default: return "unknown";
      }
    };

    const root = typeOf(v, rootName);
    const body = Array.from(interfaces.values()).join("\n\n");
    return { output: `${body}\n` , info: `Root type: ${root}` };
  },
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptRow label="Root name">
        <input defaultValue={String(options.rootName ?? "Root")} onBlur={(e) => setOptions({ ...options, rootName: e.target.value })} className="h-8 w-32 rounded-md border border-input bg-background px-2 text-sm" />
      </OptRow>
    </OptionsBar>
  ),
  defaultOptions: { rootName: "Root" },
};

const jsonToGoStruct: ToolDefinition = {
  slug: "json-to-go-struct",
  mode: "text",
  transform: ({ input }) => {
    const v = tryParseJSON(input);
    const structs: string[] = [];
    const build = (x: unknown, name: string): string => {
      if (Array.isArray(x)) return build(x[0] ?? "", name);
      if (!x || typeof x !== "object") return goType(x);
      const obj = x as Record<string, unknown>;
      const fields = Object.keys(obj).map((k) => {
        const t = build(obj[k], capitalize(k));
        return `\t${capitalize(k)} ${t} \`json:"${k}"\``;
      });
      const s = `type ${name} struct {\n${fields.join("\n")}\n}`;
      structs.push(s);
      return name;
    };
    build(v, "AutoGenerated");
    return { output: structs.join("\n\n") + "\n", info: `package main` };
  },
};

function goType(x: unknown): string {
  if (x === null || x === undefined) return "interface{}";
  switch (typeof x) {
    case "string": return "string";
    case "number": return Number.isInteger(x) ? "int" : "float64";
    case "boolean": return "bool";
    case "object":
      if (Array.isArray(x)) return `[]${goType(x[0])}`;
      return "interface{}";
    default: return "interface{}";
  }
}

const jsonToCsv: ToolDefinition = {
  slug: "json-to-csv",
  mode: "text",
  transform: ({ input }) => {
    const v = tryParseJSON(input);
    const rows: Record<string, unknown>[] = Array.isArray(v) ? (v as Record<string, unknown>[]) : [v as Record<string, unknown>];
    if (!rows.length) return { output: "" };
    const cols = new Set<string>();
    rows.forEach((r) => Object.keys(r).forEach((k) => cols.add(k)));
    const headers = Array.from(cols);
    const escape = (val: unknown) => {
      const s = val === null || val === undefined ? "" : typeof val === "object" ? JSON.stringify(val) : String(val);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [headers.join(",")];
    for (const r of rows) lines.push(headers.map((h) => escape(r[h])).join(","));
    return { output: lines.join("\n"), info: `${rows.length} rows · ${headers.length} columns` };
  },
};

const csvToJson: ToolDefinition = {
  slug: "csv-to-json",
  mode: "text",
  transform: ({ input }) => {
    const lines = input.split(/\r?\n/).filter((l) => l.trim() !== "");
    if (lines.length < 1) throw new Error("CSV needs a header row");
    const parse = (line: string): string[] => {
      const out: string[] = [];
      let cur = "";
      let inQ = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (inQ) {
          if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
          else if (ch === '"') inQ = false;
          else cur += ch;
        } else if (ch === '"') inQ = true;
        else if (ch === ",") { out.push(cur); cur = ""; }
        else cur += ch;
      }
      out.push(cur);
      return out;
    };
    const headers = parse(lines[0]);
    const rows = lines.slice(1).map((line) => {
      const cells = parse(line);
      const obj: Record<string, unknown> = {};
      headers.forEach((h, i) => { obj[h] = tryCoerce(cells[i]); });
      return obj;
    });
    return { output: JSON.stringify(rows, null, 2), info: `${rows.length} rows parsed` };
  },
};

function tryCoerce(s: string | undefined): unknown {
  if (s === undefined || s === "") return "";
  if (s === "true") return true;
  if (s === "false") return false;
  if (s === "null") return null;
  if (/^-?\d+$/.test(s)) return parseInt(s, 10);
  if (/^-?\d*\.\d+$/.test(s)) return parseFloat(s);
  return s;
}

const jsonToXml: ToolDefinition = {
  slug: "json-to-xml",
  mode: "text",
  transform: ({ input, options }) => {
    const v = tryParseJSON(input);
    const root = String(options.root ?? "root");
    const esc = (s: string) => s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]!));
    const toXml = (x: unknown, tag: string): string => {
      const safeTag = sanitizeTag(tag);
      if (x === null) return `<${safeTag}/>`;
      if (Array.isArray(x)) return x.map((e) => toXml(e, tag)).join("");
      if (typeof x === "object") {
        const obj = x as Record<string, unknown>;
        const inner = Object.keys(obj).map((k) => toXml(obj[k], k)).join("");
        return `<${safeTag}>${inner}</${safeTag}>`;
      }
      return `<${safeTag}>${esc(String(x))}</${safeTag}>`;
    };
    return { output: `<?xml version="1.0" encoding="UTF-8"?>\n${toXml(v, root)}` };
  },
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptRow label="Root tag">
        <input defaultValue={String(options.root ?? "root")} onBlur={(e) => setOptions({ ...options, root: e.target.value })} className="h-8 w-32 rounded-md border border-input bg-background px-2 text-sm" />
      </OptRow>
    </OptionsBar>
  ),
  defaultOptions: { root: "root" },
};

function sanitizeTag(s: string): string {
  let t = s.replace(/[^a-zA-Z0-9_:-]/g, "_");
  if (!/^[a-zA-Z_:]/.test(t)) t = "_" + t;
  return t || "_";
}

// XML -> JSON
const xmlToJson: ToolDefinition = {
  slug: "xml-to-json",
  mode: "text",
  transform: ({ input }) => {
    if (typeof DOMParser === "undefined") throw new Error("DOMParser not available");
    const doc = new DOMParser().parseFromString(input, "application/xml");
    const err = doc.querySelector("parsererror");
    if (err) throw new Error("Invalid XML: " + err.textContent?.slice(0, 120));
    const nodeToJson = (node: Element): unknown => {
      const obj: Record<string, unknown> = {};
      const children = Array.from(node.children);
      const grouped: Record<string, Element[]> = {};
      for (const c of children) (grouped[c.tagName] ||= []).push(c);
      for (const [tag, group] of Object.entries(grouped)) {
        obj[tag] = group.length > 1 ? group.map(nodeToJson) : nodeToJson(group[0]);
      }
      const text = node.textContent?.trim();
      if (Object.keys(obj).length === 0) return text ?? "";
      return obj;
    };
    const root = doc.documentElement;
    if (!root) throw new Error("No root element");
    const out: Record<string, unknown> = {};
    out[root.tagName] = nodeToJson(root);
    return { output: JSON.stringify(out, null, 2) };
  },
};

// JSON <-> YAML
const jsonToYaml: ToolDefinition = {
  slug: "json-to-yaml",
  mode: "text",
  transform: async ({ input }) => {
    const yaml = (await import("js-yaml")).default;
    const v = tryParseJSON(input);
    return { output: yaml.dump(v, { indent: 2, lineWidth: 100 }) };
  },
};

const yamlToJson: ToolDefinition = {
  slug: "yaml-to-json",
  mode: "text",
  transform: async ({ input }) => {
    const yaml = (await import("js-yaml")).default;
    const v = yaml.load(input);
    return { output: JSON.stringify(v, null, 2) };
  },
};

// TOML -> JSON (minimal parser for flat + one-level tables)
const tomlToJson: ToolDefinition = {
  slug: "toml-to-json",
  mode: "text",
  transform: ({ input }) => {
    const out: Record<string, unknown> = {};
    let current: Record<string, unknown> = out;
    for (const rawLine of input.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const table = /^\[([^\]]+)\]$/.exec(line);
      if (table) {
        const path = table[1].trim().split(".");
        let cur = out;
        for (const p of path) {
          cur[p] = (cur[p] as Record<string, unknown>) || {};
          cur = cur[p] as Record<string, unknown>;
        }
        current = cur;
        continue;
      }
      const m = /^([\w_-]+)\s*=\s*(.*)$/.exec(line);
      if (m) current[m[1]] = parseTomlValue(m[2]);
    }
    return { output: JSON.stringify(out, null, 2) };
  },
};

function parseTomlValue(raw: string): unknown {
  const v = raw.trim().replace(/#.*$/, "").trim();
  if (v === "true") return true;
  if (v === "false") return false;
  if (/^".*"$/.test(v) || /^'.*'$/.test(v)) return v.slice(1, -1);
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  return v;
}

const tsvToJson: ToolDefinition = {
  slug: "tsv-to-json",
  mode: "text",
  transform: ({ input }) => {
    const lines = input.split(/\r?\n/).filter((l) => l !== "");
    if (!lines.length) throw new Error("TSV needs a header");
    const headers = lines[0].split("\t");
    const rows = lines.slice(1).map((line) => {
      const cells = line.split("\t");
      const o: Record<string, unknown> = {};
      headers.forEach((h, i) => (o[h] = tryCoerce(cells[i])));
      return o;
    });
    return { output: JSON.stringify(rows, null, 2) };
  },
};

// XML Formatter / Validator
function xmlFormatOptions({ options, setOptions }: { options: Record<string, unknown>; setOptions: (n: Record<string, unknown>) => void }) {
  return (
    <OptionsBar>
      <OptSelect value={String(options.indent ?? "2")} onChange={(v) => setOptions({ ...options, indent: v })} options={INDENT_OPTS} />
    </OptionsBar>
  );
}

function formatXml(xml: string, indent: string): string {
  const PAD = indent === "tab" ? "\t" : " ".repeat(Number(indent) || 2);
  let out = "";
  let depth = 0;
  const reg = /(<[^>]+>)([^<]*)/g;
  let m: RegExpExecArray | null;
  const tokens: string[] = [];
  // Tokenize using DOM to be robust.
  while ((m = reg.exec(xml)) !== null) {
    tokens.push(m[1]);
    if (m[2].trim()) tokens.push(m[2].trim());
  }
  for (const t of tokens) {
    if (/^<\/[^>]+>$/.test(t)) {
      depth = Math.max(0, depth - 1);
      out += PAD.repeat(depth) + t + "\n";
    } else if (/^<[^/][^>]*[^/]>$/.test(t) && !/<!\[CDATA/.test(t)) {
      out += PAD.repeat(depth) + t + "\n";
      depth++;
    } else {
      out += PAD.repeat(depth) + t + "\n";
    }
  }
  return out.trim();
}

const xmlFormatter: ToolDefinition = {
  slug: "xml-formatter",
  mode: "text",
  options: xmlFormatOptions,
  defaultOptions: { indent: "2" },
  transform: ({ input, options }) => ({ output: formatXml(input, String(options.indent ?? "2")) }),
};

const xmlValidator: ToolDefinition = {
  slug: "xml-validator",
  mode: "text",
  transform: ({ input }) => {
    if (typeof DOMParser === "undefined") throw new Error("DOMParser unavailable");
    const doc = new DOMParser().parseFromString(input, "application/xml");
    const err = doc.querySelector("parsererror");
    if (err) throw new Error("Invalid XML: " + (err.textContent ?? "").slice(0, 200));
    return { output: "✓ Valid XML", info: `Root: <${doc.documentElement?.tagName ?? "—"}>` };
  },
};

const yamlValidator: ToolDefinition = {
  slug: "yaml-validator",
  mode: "text",
  transform: async ({ input }) => {
    const yaml = (await import("js-yaml")).default;
    try {
      yaml.load(input);
      return { output: "✓ Valid YAML" };
    } catch (e) {
      throw new Error(`Invalid YAML: ${e instanceof Error ? e.message : String(e)}`);
    }
  },
};

// CSV Formatter / Viewer (table mode)
const csvFormatter: ToolDefinition = {
  slug: "csv-formatter",
  mode: "text",
  transform: async ({ input }) => {
    const Papa = (await import("papaparse")).default;
    const parsed = Papa.parse<Record<string, unknown>>(input.trim(), { header: true, skipEmptyLines: true });
    const out = Papa.unparse(parsed.data);
    return { output: out, info: `${parsed.data.length} rows` };
  },
};

const csvViewer: ToolDefinition = {
  slug: "csv-viewer",
  mode: "table",
  transform: async ({ input }) => {
    const Papa = (await import("papaparse")).default;
    const parsed = Papa.parse<Record<string, unknown>>(input.trim(), { header: true, skipEmptyLines: true });
    if (parsed.errors.length) throw new Error(parsed.errors[0].message);
    return { output: "", data: parsed.data, info: `${parsed.data.length} rows` };
  },
};

// JSON Diff (dual input)
const jsonDiff: ToolDefinition = {
  slug: "json-diff",
  mode: "dual",
  transform: ({ input, secondInput }) => {
    const a = tryParseJSON(input);
    const b = tryParseJSON(secondInput ?? "");
    const diffs: string[] = [];
    const compare = (x: unknown, y: unknown, path: string) => {
      if (stableStringify(x) === stableStringify(y)) return;
      if (typeof x !== typeof y || Array.isArray(x) !== Array.isArray(y)) {
        diffs.push(`${path}: types differ — ${typeName(x)} vs ${typeName(y)}`);
        return;
      }
      if (Array.isArray(x) && Array.isArray(y)) {
        const max = Math.max(x.length, y.length);
        for (let i = 0; i < max; i++) {
          if (i >= x.length) diffs.push(`${path}[${i}]: added`);
          else if (i >= y.length) diffs.push(`${path}[${i}]: removed`);
          else compare(x[i], y[i], `${path}[${i}]`);
        }
        return;
      }
      if (x && y && typeof x === "object" && typeof y === "object") {
        const ox = x as Record<string, unknown>;
        const oy = y as Record<string, unknown>;
        const keys = new Set([...Object.keys(ox), ...Object.keys(oy)]);
        for (const k of keys) {
          if (!(k in ox)) diffs.push(`${path}.${k}: added`);
          else if (!(k in oy)) diffs.push(`${path}.${k}: removed`);
          else compare(ox[k], oy[k], `${path}.${k}`);
        }
        return;
      }
      diffs.push(`${path}: ${JSON.stringify(x)} → ${JSON.stringify(y)}`);
    };
    compare(a, b, "$");
    return {
      output: diffs.length ? diffs.join("\n") : "✓ Identical JSON",
      info: diffs.length ? `${diffs.length} differences` : "No differences",
    };
  },
};

function typeName(x: unknown): string {
  if (x === null) return "null";
  if (Array.isArray(x)) return "array";
  return typeof x;
}

// JSON Path Finder (uses JSONPath-ish dot/bracket; lightweight)
const jsonPathFinder: ToolDefinition = {
  slug: "json-path-finder",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptRow label="Search value">
        <input defaultValue={String(options.q ?? "")} onChange={(e) => setOptions({ ...options, q: e.target.value })} className="h-8 w-48 rounded-md border border-input bg-background px-2 text-sm" placeholder="value to find" />
      </OptRow>
    </OptionsBar>
  ),
  defaultOptions: { q: "" },
  transform: ({ input, options }) => {
    const v = tryParseJSON(input);
    const q = String(options.q ?? "").trim();
    if (!q) return { output: "Enter a search value above.", info: "" };
    const paths: string[] = [];
    const walk = (x: unknown, path: string) => {
      if (String(x) === q) paths.push(path || "$");
      if (Array.isArray(x)) x.forEach((e, i) => walk(e, `${path}[${i}]`));
      else if (x && typeof x === "object") for (const k of Object.keys(x)) walk((x as Record<string, unknown>)[k], path ? `${path}.${k}` : k);
    };
    walk(v, "$");
    return { output: paths.length ? paths.join("\n") : "No matches", info: `${paths.length} matches` };
  },
};

const jsonTreeViewer: ToolDefinition = {
  slug: "json-tree-viewer",
  mode: "text",
  transform: ({ input }) => {
    const v = tryParseJSON(input);
    return { output: JSON.stringify(v, null, 2), info: "Use the formatted output as a tree" };
  },
};

const jsonRepairTool: ToolDefinition = {
  slug: "json-repair-tool",
  mode: "text",
  transform: ({ input }) => {
    let s = input.trim();
    // Strip JS comments.
    s = s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
    // Strip trailing commas.
    s = s.replace(/,\s*([}\]])/g, "$1");
    // Wrap unquoted keys.
    s = s.replace(/([{,]\s*)([A-Za-z_$][\w$]*)\s*:/g, '$1"$2":');
    // Convert single quotes to double.
    s = s.replace(/'([^']*)'/g, '"$1"');
    try {
      const v = JSON.parse(s);
      return { output: JSON.stringify(v, null, 2), info: "Repaired common issues (comments, trailing commas, unquoted keys)" };
    } catch (e) {
      throw new Error(`Could not auto-repair: ${e instanceof Error ? e.message : String(e)}`);
    }
  },
};

const brokenJsonFixer: ToolDefinition = {
  slug: "broken-json-fixer",
  mode: "text",
  transform: ({ input }) => {
    let s = input.trim();
    s = s.replace(/,\s*([}\]])/g, "$1");
    s = s.replace(/([{,]\s*)([A-Za-z_$][\w$]*)\s*:/g, '$1"$2":');
    try {
      const v = JSON.parse(s);
      return { output: JSON.stringify(v, null, 2) };
    } catch (e) {
      throw new Error(`Unfixable: ${e instanceof Error ? e.message : String(e)}`);
    }
  },
};

const largeJsonViewer: ToolDefinition = {
  slug: "large-json-viewer",
  mode: "text",
  transform: ({ input }) => {
    const v = tryParseJSON(input);
    return { output: JSON.stringify(v, null, 2), info: jsonInfo(v) };
  },
};

const jsonCompareViewer: ToolDefinition = {
  slug: "json-compare-viewer",
  mode: "dual",
  transform: ({ input, secondInput }) => {
    const a = tryParseJSON(input);
    const b = tryParseJSON(secondInput ?? "");
    const sa = stableStringify(a);
    const sb = stableStringify(b);
    if (sa === sb) return { output: "Left and Right are identical." };
    return {
      output: `=== LEFT ===\n${JSON.stringify(a, null, 2)}\n\n=== RIGHT ===\n${JSON.stringify(b, null, 2)}`,
      info: "Side-by-side normalized compare",
    };
  },
};

const jsonSchemaGenerator: ToolDefinition = {
  slug: "json-schema-generator",
  mode: "text",
  transform: ({ input }) => {
    const v = tryParseJSON(input);
    const infer = (x: unknown): Record<string, unknown> => {
      if (x === null) return { type: "null" };
      if (Array.isArray(x)) {
        if (!x.length) return { type: "array", items: {} };
        const elemTypes = Array.from(new Set(x.map((e) => JSON.stringify(infer(e)))));
        if (elemTypes.length === 1) return { type: "array", items: infer(x[0]) };
        return { type: "array", items: { anyOf: x.map((e) => infer(e)) } };
      }
      switch (typeof x) {
        case "string": return { type: "string" };
        case "number": return { type: Number.isInteger(x) ? "integer" : "number" };
        case "boolean": return { type: "boolean" };
        case "object": {
          const props: Record<string, unknown> = {};
          for (const k of Object.keys(x)) props[k] = infer((x as Record<string, unknown>)[k]);
          return { type: "object", properties: props, required: Object.keys(x) };
        }
        default: return {};
      }
    };
    const schema = { $schema: "http://json-schema.org/draft-07/schema#", ...infer(v) };
    return { output: JSON.stringify(schema, null, 2) };
  },
};

const jsonToJsObject: ToolDefinition = {
  slug: "json-to-js-object",
  mode: "text",
  transform: ({ input }) => {
    const v = tryParseJSON(input);
    const js = JSON.stringify(v, null, 2)
      .replace(/"([a-zA-Z_$][\w$]*)"\s*:/g, "$1:")
      .replace(/"/g, "'");
    return { output: `const obj = ${js};` };
  },
};

const jsObjectToJson: ToolDefinition = {
  slug: "js-object-to-json",
  mode: "text",
  transform: ({ input }) => {
    try {
      // eslint-disable-next-line no-new-func
      const v = Function(`"use strict";return (${input});`)();
      return { output: JSON.stringify(v, null, 2) };
    } catch (e) {
      throw new Error(`Not a valid JS object literal: ${e instanceof Error ? e.message : String(e)}`);
    }
  },
};

export const jsonTools: ToolDefinition[] = [
  jsonFormatter, jsonValidator, jsonMinifier, jsonDiff, jsonEscapeUnescape,
  jsonSortKeys, jsonFlattener, jsonUnflattener, jsonSchemaGenerator, jsonPathFinder,
  jsonTreeViewer, jsonRepairTool, brokenJsonFixer, largeJsonViewer, jsonCompareViewer,
  jsonKeyExtractor, jsonToTypescript, jsonToGoStruct, jsonToXml, jsonToYaml, jsonToCsv,
  csvToJson, xmlToJson, yamlToJson, tomlToJson, tsvToJson, xmlFormatter, xmlValidator,
  yamlValidator, csvFormatter, csvViewer, jsonToJsObject, jsObjectToJson,
];

// ---- helpers for codegen ----
function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }
function singularize(s: string) {
  return s.endsWith("s") && !s.endsWith("ss") ? s.slice(0, -1) : s;
}
function quoteKey(k: string): string {
  return /^[a-zA-Z_$][\w$]*$/.test(k) ? k : `"${k}"`;
}

// Hex encoder / decoder
const hexEncoder: ToolDefinition = {
  slug: "hex-encoder-decoder",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptSelect value={String(options.mode ?? "encode")} onChange={(v) => setOptions({ ...options, mode: v })} options={[{ value: "encode", label: "Encode" }, { value: "decode", label: "Decode" }]} />
      <OptSwitch checked={Boolean(options.space)} onChange={(c) => setOptions({ ...options, space: c })} label="Space-separated" />
    </OptionsBar>
  ),
  defaultOptions: { mode: "encode", space: false },
  transform: ({ input, options }) => {
    const mode = String(options.mode ?? "encode");
    if (mode === "encode") {
      const bytes = new TextEncoder().encode(input);
      let hex = bufToHex(bytes.buffer);
      if (options.space) hex = hex.match(/.{2}/g)!.join(" ");
      return { output: hex };
    }
    const bytes = hexToBuf(input);
    return { output: new TextDecoder().decode(bytes) };
  },
};

// Base32
const base32Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
function b32Encode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bits = 0, value = 0, out = "";
  for (const b of bytes) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5) {
      out += base32Chars[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += base32Chars[(value << (5 - bits)) & 31];
  while (out.length % 8) out += "=";
  return out;
}
function b32Decode(s: string): string {
  const clean = s.replace(/=+$/, "").toUpperCase().replace(/\s/g, "");
  let bits = 0, value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const idx = base32Chars.indexOf(ch);
    if (idx < 0) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return new TextDecoder().decode(new Uint8Array(out));
}
const base32Tool: ToolDefinition = {
  slug: "base32-encoder-decoder",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptSelect value={String(options.mode ?? "encode")} onChange={(v) => setOptions({ ...options, mode: v })} options={[{ value: "encode", label: "Encode" }, { value: "decode", label: "Decode" }]} />
    </OptionsBar>
  ),
  defaultOptions: { mode: "encode" },
  transform: ({ input, options }) => {
    const mode = String(options.mode ?? "encode");
    return { output: mode === "encode" ? b32Encode(input) : b32Decode(input) };
  },
};

// Base58
const base58Chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function b58Encode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let num = "";
  // Convert bytes to big integer via leading-zero handling
  const digits: number[] = [];
  for (const byte of bytes) {
    let carry = byte;
    for (let i = 0; i < digits.length; i++) {
      const x = digits[i] * 256 + carry;
      digits[i] = x % 58;
      carry = Math.floor(x / 58);
    }
    while (carry > 0) { digits.push(carry % 58); carry = Math.floor(carry / 58); }
  }
  for (const byte of bytes) {
    if (byte === 0) digits.push(0);
    else break;
  }
  return digits.reverse().map((d) => base58Chars[d]).join("");
}
function b58Decode(s: string): string {
  const bytes: number[] = [];
  for (const ch of s) {
    let carry = base58Chars.indexOf(ch);
    if (carry < 0) continue;
    for (let i = 0; i < bytes.length; i++) {
      const x = bytes[i] * 58 + carry;
      bytes[i] = x & 0xff;
      carry = x >> 8;
    }
    while (carry > 0) { bytes.push(carry & 0xff); carry >>= 8; }
  }
  for (const ch of s) {
    if (ch === "1") bytes.push(0);
    else break;
  }
  return new TextDecoder().decode(new Uint8Array(bytes.reverse()));
}
const base58Tool: ToolDefinition = {
  slug: "base58-encoder-decoder",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptSelect value={String(options.mode ?? "encode")} onChange={(v) => setOptions({ ...options, mode: v })} options={[{ value: "encode", label: "Encode" }, { value: "decode", label: "Decode" }]} />
    </OptionsBar>
  ),
  defaultOptions: { mode: "encode" },
  transform: ({ input, options }) => {
    const mode = String(options.mode ?? "encode");
    return { output: mode === "encode" ? b58Encode(input) : b58Decode(input) };
  },
};

// Base85 (Ascii85)
function b85Encode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let out = "";
  for (let i = 0; i < bytes.length; i += 4) {
    const chunk = bytes.subarray(i, i + 4);
    let n = 0;
    for (let j = 0; j < 4; j++) n = n * 256 + (chunk[j] ?? 0);
    const seg: string[] = [];
    for (let j = 0; j < 5; j++) { seg.unshift(String.fromCharCode((n % 85) + 33)); n = Math.floor(n / 85); }
    out += seg.join("");
  }
  return `<~${out}~>`;
}
function b85Decode(s: string): string {
  const clean = s.replace(/^<~|~>$/g, "").replace(/\s/g, "");
  const bytes: number[] = [];
  for (let i = 0; i < clean.length; i += 5) {
    const seg = clean.slice(i, i + 5);
    let n = 0;
    for (const ch of seg) n = n * 85 + (ch.charCodeAt(0) - 33);
    const padded = seg.padEnd(5, "u");
    n = 0;
    for (const ch of padded) n = n * 85 + (ch.charCodeAt(0) - 33);
    const out: number[] = [];
    for (let j = 0; j < 4; j++) { out.unshift(n & 0xff); n = Math.floor(n / 256); }
    const take = seg.length - 1;
    bytes.push(...out.slice(0, take));
  }
  return new TextDecoder().decode(new Uint8Array(bytes));
}
const base85Tool: ToolDefinition = {
  slug: "base85-encoder-decoder",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptSelect value={String(options.mode ?? "encode")} onChange={(v) => setOptions({ ...options, mode: v })} options={[{ value: "encode", label: "Encode" }, { value: "decode", label: "Decode" }]} />
    </OptionsBar>
  ),
  defaultOptions: { mode: "encode" },
  transform: ({ input, options }) => {
    const mode = String(options.mode ?? "encode");
    return { output: mode === "encode" ? b85Encode(input) : b85Decode(input) };
  },
};

const binaryEncoder: ToolDefinition = {
  slug: "binary-encoder-decoder",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptSelect value={String(options.mode ?? "encode")} onChange={(v) => setOptions({ ...options, mode: v })} options={[{ value: "encode", label: "Encode" }, { value: "decode", label: "Decode" }]} />
      <OptSwitch checked={Boolean(options.space)} onChange={(c) => setOptions({ ...options, space: c })} label="Space between bytes" />
    </OptionsBar>
  ),
  defaultOptions: { mode: "encode", space: true },
  transform: ({ input, options }) => {
    const mode = String(options.mode ?? "encode");
    if (mode === "encode") {
      const bytes = new TextEncoder().encode(input);
      const bins = Array.from(bytes).map((b) => b.toString(2).padStart(8, "0"));
      return { output: options.space ? bins.join(" ") : bins.join("") };
    }
    const clean = input.replace(/[^01]/g, "");
    const bytes = new Uint8Array(Math.floor(clean.length / 8));
    for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(clean.substr(i * 8, 8), 2);
    return { output: new TextDecoder().decode(bytes) };
  },
};

const unicodeConverter: ToolDefinition = {
  slug: "unicode-converter",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptSelect value={String(options.mode ?? "name")} onChange={(v) => setOptions({ ...options, mode: v })} options={[
        { value: "name", label: "Code points (U+)" },
        { value: "dec", label: "Decimal" },
        { value: "escape", label: "\\u escapes" },
      ]} />
    </OptionsBar>
  ),
  defaultOptions: { mode: "name" },
  transform: ({ input, options }) => {
    const mode = String(options.mode ?? "name");
    const out = Array.from(input).map((ch) => {
      const cp = ch.codePointAt(0)!;
      if (mode === "name") return `U+${cp.toString(16).toUpperCase().padStart(4, "0")}`;
      if (mode === "dec") return String(cp);
      return `\\u${cp.toString(16).padStart(4, "0")}`;
    });
    return { output: out.join(" ") };
  },
};

const utf8Encoder: ToolDefinition = {
  slug: "utf-8-encoder-decoder",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptSelect value={String(options.mode ?? "encode")} onChange={(v) => setOptions({ ...options, mode: v })} options={[{ value: "encode", label: "Encode (bytes)" }, { value: "decode", label: "Decode" }]} />
    </OptionsBar>
  ),
  defaultOptions: { mode: "encode" },
  transform: ({ input, options }) => {
    const mode = String(options.mode ?? "encode");
    if (mode === "encode") {
      const bytes = new TextEncoder().encode(input);
      return { output: Array.from(bytes).join(" ") };
    }
    const parts = input.trim().split(/\s+/).map((n) => parseInt(n, 10));
    const bytes = new Uint8Array(parts);
    return { output: new TextDecoder().decode(bytes) };
  },
};

const htmlEscapeUnescape: ToolDefinition = {
  slug: "html-escape-unescape",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptSelect value={String(options.mode ?? "escape")} onChange={(v) => setOptions({ ...options, mode: v })} options={[{ value: "escape", label: "Escape" }, { value: "unescape", label: "Unescape" }]} />
    </OptionsBar>
  ),
  defaultOptions: { mode: "escape" },
  transform: ({ input, options }) => {
    const mode = String(options.mode ?? "escape");
    if (mode === "escape") {
      return {
        output: input.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" }[c]!)),
      };
    }
    return {
      output: input.replace(/&(lt|gt|amp|quot|#39|apos);/g, (_, e: string) => ({ lt: "<", gt: ">", amp: "&", quot: '"', "#39": "'", apos: "'" }[e]!)),
    };
  },
};

const htmlEntityEncoder: ToolDefinition = { ...htmlEscapeUnescape, slug: "html-entity-encoder" };

const asciiTable: ToolDefinition = {
  slug: "ascii-table",
  mode: "generator",
  hideInput: true,
  live: false,
  transform: () => {
    const rows: { Char: string; Dec: string; Hex: string; Description: string }[] = [];
    const names: Record<number, string> = { 0: "NUL", 9: "TAB", 10: "LF", 13: "CR", 32: "SPACE", 127: "DEL" };
    for (let i = 0; i < 128; i++) {
      rows.push({ Char: i < 32 || i === 127 ? `^${String.fromCharCode(i + 64)}` : String.fromCharCode(i), Dec: String(i), Hex: "0x" + i.toString(16).toUpperCase().padStart(2, "0"), Description: names[i] ?? "" });
    }
    return { output: rows.map((r) => `${r.Dec.padStart(3)}\t${r.Hex}\t${r.Char}\t${r.Description}`).join("\n"), data: rows, info: "0-127 standard ASCII" };
  },
};

const backslashEscape: ToolDefinition = {
  slug: "backslash-escape",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptSelect value={String(options.mode ?? "escape")} onChange={(v) => setOptions({ ...options, mode: v })} options={[{ value: "escape", label: "Escape" }, { value: "unescape", label: "Unescape" }]} />
    </OptionsBar>
  ),
  defaultOptions: { mode: "escape" },
  transform: ({ input, options }) => {
    if (options.mode === "unescape") {
      return { output: input.replace(/\\(.)/g, "$1") };
    }
    return { output: input.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/\t/g, "\\t").replace(/\r/g, "\\r") };
  },
};

const csvEscape: ToolDefinition = {
  slug: "csv-escape",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptSelect value={String(options.mode ?? "escape")} onChange={(v) => setOptions({ ...options, mode: v })} options={[{ value: "escape", label: "Escape" }, { value: "unescape", label: "Unescape" }]} />
    </OptionsBar>
  ),
  defaultOptions: { mode: "escape" },
  transform: ({ input, options }) => {
    const esc = (s: string) => /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    if (options.mode === "unescape") {
      return { output: input.replace(/^"(.*)"$/, "$1").replace(/""/g, '"') };
    }
    return { output: input.split(/\n/).map((line) => line.split(",").map(esc).join(",")).join("\n") };
  },
};

const quotedPrintableEncoder: ToolDefinition = {
  slug: "quoted-printable-encoder",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptSelect value={String(options.mode ?? "encode")} onChange={(v) => setOptions({ ...options, mode: v })} options={[{ value: "encode", label: "Encode" }, { value: "decode", label: "Decode" }]} />
    </OptionsBar>
  ),
  defaultOptions: { mode: "encode" },
  transform: ({ input, options }) => {
    if (options.mode === "decode") {
      return { output: input.replace(/=([0-9A-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16))).replace(/=\r?\n/g, "") };
    }
    const bytes = new TextEncoder().encode(input);
    return { output: Array.from(bytes).map((b) => (b >= 33 && b <= 126 && b !== 61) ? String.fromCharCode(b) : "=" + b.toString(16).toUpperCase().padStart(2, "0")).join("") };
  },
};

const morseCodeConverter: ToolDefinition = {
  slug: "morse-code-converter",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptSelect value={String(options.mode ?? "encode")} onChange={(v) => setOptions({ ...options, mode: v })} options={[{ value: "encode", label: "Text → Morse" }, { value: "decode", label: "Morse → Text" }]} />
    </OptionsBar>
  ),
  defaultOptions: { mode: "encode" },
  transform: ({ input, options }) => {
    const M: Record<string, string> = { A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....", I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..", "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-", "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----." };
    const inv: Record<string, string> = Object.fromEntries(Object.entries(M).map(([k, v]) => [v, k]));
    if (options.mode === "encode") {
      return {
        output: input.toUpperCase().split("").map((c) => (c === " " ? "/" : M[c] ?? "")).filter(Boolean).join(" "),
      };
    }
    return { output: input.trim().split(/\s+/).map((s) => (s === "/" ? " " : inv[s] ?? "?")).join("") };
  },
};

const dataUriGenerator: ToolDefinition = {
  slug: "data-uri-generator",
  mode: "text",
  readAs: "dataurl",
  accept: "*",
  placeholder: "Upload a file (use the Upload button) to get its data URI…",
  transform: ({ input }) => ({ output: input, info: `${byteLength(input)} bytes in data URI` }),
};

const urlSlugGenerator: ToolDefinition = {
  slug: "url-slug-generator",
  mode: "text",
  transform: ({ input }) => {
    const slug = input.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
    return { output: slug };
  },
};

const punycodeConverter: ToolDefinition = {
  slug: "punycode-converter",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptSelect value={String(options.mode ?? "encode")} onChange={(v) => setOptions({ ...options, mode: v })} options={[{ value: "encode", label: "Domain → ACE" }, { value: "decode", label: "ACE → Domain" }]} />
    </OptionsBar>
  ),
  defaultOptions: { mode: "encode" },
  transform: ({ input, options }) => {
    try {
      const url = new URL(options.mode === "encode" ? `http://${input}` : `http://${input}`);
      const host = url.hostname;
      return { output: options.mode === "encode" ? host : host, info: "Uses the browser's URL/Punycode handling" };
    } catch {
      throw new Error("Invalid domain");
    }
  },
};

const unicodeCodePointLookup: ToolDefinition = {
  slug: "unicode-code-point-lookup",
  mode: "text",
  transform: ({ input }) => {
    const chars = Array.from(input.trim());
    const rows = chars.map((ch) => {
      const cp = ch.codePointAt(0)!;
      return `${ch}\tU+${cp.toString(16).toUpperCase().padStart(4, "0")}\t${cp}`;
    });
    return { output: rows.join("\n") };
  },
};

export const encodingTools: ToolDefinition[] = [
  // base64 / url encoder defined in encoding.ts; re-exported there.
  hexEncoder, base32Tool, base58Tool, base85Tool, binaryEncoder, unicodeConverter,
  utf8Encoder, htmlEscapeUnescape, htmlEntityEncoder, backslashEscape, csvEscape,
  quotedPrintableEncoder, morseCodeConverter, dataUriGenerator, urlSlugGenerator,
  punycodeConverter, unicodeCodePointLookup, asciiTable,
];

// Re-export helpers consumed elsewhere
export { b64Decode, b64Encode, bufToHex, hexToBuf };
