import type { ComponentType } from "react";
import type { ToolDefinition, CustomRendererProps } from "@/components/developers/tools/registry";
import { OptionsBar, OptSelect } from "@/components/developers/tools/options-controls";

const jsBeautifier: ToolDefinition = {
  slug: "javascript-beautifier",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptSelect value={String(options.lang ?? "babel")} onChange={(v) => setOptions({ ...options, lang: v })} options={[{ value: "babel", label: "JavaScript" }, { value: "typescript", label: "TypeScript" }]} />
    </OptionsBar>
  ),
  defaultOptions: { lang: "babel" },
  transform: async ({ input, options }) => {
    const { format } = await import("prettier/standalone");
    const babel = (await import("prettier/plugins/babel")).default;
    const estree = (await import("prettier/plugins/estree")).default;
    const tsPlugin = (await import("prettier/plugins/typescript")).default;
    const parser = options.lang === "typescript" ? "typescript" : "babel";
    const plugins = options.lang === "typescript" ? [tsPlugin] : [babel, estree];
    const out = await format(input, { parser, plugins: plugins as never });
    return { output: out };
  },
};

const jsMinifier: ToolDefinition = {
  slug: "javascript-minifier",
  mode: "text",
  transform: ({ input }) => {
    let out = input;
    out = out.replace(/\/\*[\s\S]*?\*\//g, ""); // block comments
    out = out.replace(/(^|[^:])\/\/.*$/gm, "$1"); // line comments
    out = out.replace(/\s+/g, " ");
    out = out.replace(/\s*([{}();,:=<>+\-*/%&|!?])\s*/g, "$1");
    out = out.replace(/;\s*}/g, "}");
    return { output: out.trim() };
  },
};

const tsToJs: ToolDefinition = {
  slug: "typescript-to-javascript",
  mode: "text",
  transform: async ({ input }) => {
    const { format } = await import("prettier/standalone");
    const babel = (await import("prettier/plugins/babel")).default;
    const estree = (await import("prettier/plugins/estree")).default;
    // Strip annotations with regexes (best-effort, no full TS parser in browser).
    let js = input;
    js = js.replace(/^\s*import\s+type\s+\{[^}]*\}\s+from\s+['"][^'"]+['"];?\s*$/gm, "");
    js = js.replace(/^\s*export\s+type\s+\w+\s*=[^;]+;\s*$/gm, "");
    js = js.replace(/^\s*(export\s+)?(interface|type)\s+\w+\s*(<[^>]*>)?\s*(=|extends|\{)[^}]*\}?\s*$/gm, "");
    js = js.replace(/:\s*[A-Za-z_$][\w$<>[\]{}|&',\s.]*(?=[=,);{\n])/g, ""); // type annotations
    js = js.replace(/<[\w, '"{}\[\]=|&\s]+>(?=\()/g, ""); // generics on calls
    js = js.replace(/\bas\s+[A-Za-z_$][\w$]*/g, "");
    js = js.replace(/!\s*(?=[=,);\n])/g, "");
    js = js.replace(/public\s+|private\s+|protected\s+|readonly\s+|abstract\s+/g, "");
    try {
      js = await format(js, { parser: "babel", plugins: [babel, estree] as never });
    } catch { /* keep raw if formatting fails */ }
    return { output: js };
  },
};

const jsConsolePlayground: ToolDefinition = {
  slug: "js-console-playground",
  mode: "custom",
  customRenderer: (JsConsoleComponent as unknown) as ComponentType<CustomRendererProps>,
};

function JsConsoleComponent({ input, setInput }: CustomRendererProps) {
  // Use a module-scoped React import via lazy require to avoid server/client mismatch.
  const React = require("react") as typeof import("react");
  const [out, setOut] = React.useState("");
  const run = () => {
    const logs: string[] = [];
    const sandbox = { console: { log: (...a: unknown[]) => logs.push(a.map(fmtVal).join(" ")), error: (...a: unknown[]) => logs.push("ERROR: " + a.map(fmtVal).join(" ")), warn: (...a: unknown[]) => logs.push("WARN: " + a.map(fmtVal).join(" ")) }, JSON, Math, Date, Array, Object, String, Number, Boolean, RegExp, parseInt, parseFloat, isNaN };
    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function(...Object.keys(sandbox), `"use strict";\n${input}`);
      const result = fn(...Object.values(sandbox));
      if (result !== undefined) logs.push("→ " + fmtVal(result));
      setOut(logs.join("\n") || "(no output)");
    } catch (e) {
      setOut(e instanceof Error ? `${e.name}: ${e.message}` : String(e));
    }
  };
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Code</div>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={"console.log(1 + 1)\n[1,2,3].map(x => x*2)"} className="w-full h-64 rounded-md border border-border bg-background p-2 font-mono text-sm" />
        <button onClick={run} className="mt-2 h-8 px-3 rounded-md bg-primary text-primary-foreground text-sm">Run ▶</button>
      </div>
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Output</div>
        <pre className="w-full h-64 overflow-auto rounded-md bg-background p-2 text-sm font-mono whitespace-pre-wrap">{out || "Output appears here."}</pre>
      </div>
    </div>
  );
}

function fmtVal(v: unknown): string {
  if (typeof v === "string") return v;
  try { return JSON.stringify(v, null, 0); } catch { return String(v); }
}

const jsRegexBuilder: ToolDefinition = {
  slug: "js-regex-builder",
  mode: "text",
  transform: ({ input, options }) => {
    const flags = String(options.flags ?? "g");
    try {
      const re = new RegExp(input.trim(), flags);
      return { output: `const re = ${re.toString()};\n\n// Test it:\n// re.test("your string")\n// "your string".match(re)`, info: `/${input.trim()}/${flags}` };
    } catch (e) {
      throw new Error(`Invalid regex: ${e instanceof Error ? e.message : String(e)}`);
    }
  },
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptSelect value={String(options.flags ?? "g")} onChange={(v) => setOptions({ ...options, flags: v })} options={[{ value: "g", label: "g" }, { value: "gi", label: "gi" }, { value: "gm", label: "gm" }, { value: "gim", label: "gim" }]} />
    </OptionsBar>
  ),
  defaultOptions: { flags: "g" },
};

const importSorter: ToolDefinition = {
  slug: "import-sorter",
  mode: "text",
  transform: ({ input }) => {
    const importRe = /^import\s.+$/gm;
    const imports = (input.match(importRe) ?? []).sort((a, b) => {
      const ma = /from\s+['"]([^'"]+)['"]/.exec(a)?.[1] ?? "";
      const mb = /from\s+['"]([^'"]+)['"]/.exec(b)?.[1] ?? "";
      const aLocal = ma.startsWith(".") || ma.startsWith("/");
      const bLocal = mb.startsWith(".") || mb.startsWith("/");
      if (aLocal !== bLocal) return aLocal ? 1 : -1;
      return ma.localeCompare(mb);
    });
    let out = input.replace(importRe, "");
    out = imports.join("\n") + "\n\n" + out.replace(/\n{3,}/g, "\n\n").trimStart();
    return { output: out };
  },
};

const lodashToNativeConverter: ToolDefinition = {
  slug: "lodash-to-native-converter",
  mode: "text",
  transform: ({ input }) => {
    const map: [RegExp, string][] = [
      [/_\.map\(([^,]+),\s*([^)]+)\)/g, "$1.map($2)"],
      [/_\.filter\(([^,]+),\s*([^)]+)\)/g, "$1.filter($2)"],
      [/_\.reduce\(([^,]+),\s*([^,]+),\s*([^)]+)\)/g, "$1.reduce($2, $3)"],
      [/_\.find\(([^,]+),\s*([^)]+)\)/g, "$1.find($2)"],
      [/_\.forEach\(([^,]+),\s*([^)]+)\)/g, "$1.forEach($2)"],
      [/_\.some\(([^,]+),\s*([^)]+)\)/g, "$1.some($2)"],
      [/_\.every\(([^,]+),\s*([^)]+)\)/g, "$1.every($2)"],
      [/_\.flatten\(([^)]+)\)/g, "$1.flat()"],
      [/_\.uniq\(([^)]+)\)/g, "[...new Set($1)]"],
      [/_\.sortBy\(([^)]+)\)/g, "$1.slice().sort()"],
      [/_\.cloneDeep\(([^)]+)\)/g, "structuredClone($1)"],
      [/_\.keys\(([^)]+)\)/g, "Object.keys($1)"],
      [/_\.values\(([^)]+)\)/g, "Object.values($1)"],
      [/_\.assign\(([^)]+)\)/g, "Object.assign($1)"],
    ];
    let out = input;
    for (const [re, repl] of map) out = out.replace(re, repl);
    return { output: out, info: "Common Lodash calls replaced with native ES" };
  },
};

const promiseVisualizer: ToolDefinition = {
  slug: "promise-visualizer",
  mode: "text",
  transform: ({ input }) => {
    const hasThen = /\.then\(/.test(input);
    const hasCatch = /\.catch\(/.test(input);
    const hasFinally = /\.finally\(/.test(input);
    const hasAsync = /\basync\b/.test(input);
    const hasAwait = /\bawait\b/.test(input);
    const lines: string[] = ["Promise structure:", `  .then()  ${hasThen ? "✓" : "—"}`, `  .catch() ${hasCatch ? "✓" : "—"}`, `  .finally() ${hasFinally ? "✓" : "—"}`, `  async/await ${hasAsync && hasAwait ? "✓" : "—"}`, ""];
    if (!hasCatch && !hasAwait) lines.push("⚠ No error handling (.catch) detected.");
    return { output: lines.join("\n") };
  },
};

const es6ToEs5Converter: ToolDefinition = {
  slug: "es6-to-es5-converter",
  mode: "text",
  transform: ({ input }) => {
    let out = input;
    out = out.replace(/\bconst\s+/g, "var ");
    out = out.replace(/\blet\s+/g, "var ");
    out = out.replace(/=>/g, "function");
    out = out.replace(/`([^`]*)`/g, (_, s) => '"' + s.replace(/"/g, '\\"').replace(/\$\{([^}]+)\}/g, '" + ($1) + "') + '"');
    out = out.replace(/\bclass\s+(\w+)/g, "function $1");
    return { output: out, info: "Approximate ES5 transform — no full transpilation" };
  },
};

const asyncAwaitConverter: ToolDefinition = {
  slug: "async-await-converter",
  mode: "text",
  transform: ({ input }) => {
    // Convert .then chains to async/await (best-effort, simple chains)
    let out = input.replace(/await\s+/g, "");
    if (/\.then\s*\(\s*(?:async\s+)?\(?([^)]*)\)?\s*=>/.test(input) && !/\bawait\b/.test(input)) {
      out = input.replace(/\.then\s*\(\s*(?:async\s+)?\(?([^)]*)\)?\s*=>\s*{?/g, (match) => {
        return match.replace(/\.then\s*\(/, "; /* chain → await */ (");
      });
      return { output: out, info: "Detected .then chain. Manual conversion to async/await is recommended for correctness." };
    }
    return { output: out };
  },
};

const debounceThrottleGenerator: ToolDefinition = {
  slug: "debounce-throttle-generator",
  mode: "generator",
  hideInput: true,
  live: false,
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptSelect value={String(options.kind ?? "debounce")} onChange={(v) => setOptions({ ...options, kind: v })} options={[{ value: "debounce", label: "Debounce" }, { value: "throttle", label: "Throttle" }]} />
    </OptionsBar>
  ),
  defaultOptions: { kind: "debounce", ms: 300 },
  transform: ({ options }) => {
    const kind = String(options.kind ?? "debounce");
    if (kind === "debounce") {
      return { output: `function debounce(fn, delay = ${options.ms ?? 300}) {\n  let t;\n  return (...args) => {\n    clearTimeout(t);\n    t = setTimeout(() => fn(...args), delay);\n  };\n}` };
    }
    return { output: `function throttle(fn, delay = ${options.ms ?? 300}) {\n  let last = 0;\n  return (...args) => {\n    const now = Date.now();\n    if (now - last >= delay) {\n      last = now;\n      fn(...args);\n    }\n  };\n}` };
  },
};

const jsArrayFormatter: ToolDefinition = {
  slug: "js-array-formatter",
  mode: "text",
  transform: ({ input }) => {
    const trimmed = input.trim();
    let v: unknown;
    try {
      v = JSON.parse(trimmed);
    } catch {
      try {
        // eslint-disable-next-line no-new-func
        v = Function(`"use strict";return (${trimmed});`)();
      } catch (e) {
        throw new Error(`Not a valid array: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    if (!Array.isArray(v)) throw new Error("Input is not an array");
    return { output: JSON.stringify(v, null, 2), info: `${v.length} elements` };
  },
};

const stackTraceBeautifier: ToolDefinition = {
  slug: "stack-trace-beautifier",
  mode: "text",
  transform: ({ input }) => {
    const lines = input.split(/\r?\n/).map((l) => {
      if (l.trim().startsWith("at ")) return "  → " + l.trim();
      return l;
    });
    return { output: lines.join("\n") };
  },
};

const errorDecoder: ToolDefinition = {
  slug: "error-decoder",
  mode: "text",
  transform: ({ input }) => {
    const lookup: [RegExp, string][] = [
      [/cannot read propert(?:y|ies) of (?:undefined|null)/i, "Trying to access a property on null/undefined. Check the object before reading from it."],
      [/is not (?:a )?function/i, "Calling something that isn't a function. Verify the import and the value's type."],
      [/is not defined/i, "Reference to an undeclared variable. Check spelling, import, or scope."],
      [/unexpected token/i, "Syntax error. Often a missing bracket, paren, or comma."],
      [/networkerror|failed to fetch|cors/i, "Network/CORS issue. Check the URL, method, and CORS headers."],
      [/maximum call stack/i, "Infinite recursion. Add a base case to your recursive function."],
    ];
    const matches: string[] = [];
    for (const [re, desc] of lookup) if (re.test(input)) matches.push(desc);
    return { output: matches.length ? matches.map((m, i) => `${i + 1}. ${m}`).join("\n") : "No common error pattern matched. Paste the full error message.", info: `${matches.length} hint(s)` };
  },
};

const graphqlQueryFormatter: ToolDefinition = {
  slug: "graphql-query-formatter",
  mode: "text",
  transform: ({ input }) => {
    let out = input.replace(/\s+/g, " ").trim();
    out = out.replace(/\s*([{}()])/g, "$1");
    out = out.replace(/([{}])/g, "\n$1\n");
    out = out.replace(/\)\s*\{/g, ") {\n");
    out = out.replace(/\}/g, "\n}");
    let depth = 0;
    const lines = out.split("\n").map((l) => {
      const t = l.trim();
      if (!t) return "";
      if (t === "}") depth = Math.max(0, depth - 1);
      const pad = "  ".repeat(depth);
      if (t === "{") { const r = pad + "{"; depth++; return r; }
      return pad + t;
    });
    return { output: lines.filter(Boolean).join("\n") };
  },
};

const graphqlSchemaValidator: ToolDefinition = {
  slug: "graphql-schema-validator",
  mode: "text",
  transform: ({ input }) => {
    const types = (input.match(/\btype\s+\w+/g) ?? []).length;
    const inputs = (input.match(/\binput\s+\w+/g) ?? []).length;
    const hasQuery = /\btype\s+Query\b/.test(input);
    const hasMutation = /\btype\s+Mutation\b/.test(input);
    const issues: string[] = [];
    if (!types && !inputs) issues.push("⚠ No `type` or `input` declarations found");
    if (!hasQuery) issues.push("ℹ No root Query type — read entry points unclear");
    const open = (input.match(/{/g) ?? []).length;
    const close = (input.match(/}/g) ?? []).length;
    if (open !== close) issues.push(`✗ Brace mismatch: ${open} { vs ${close} }`);
    return { output: issues.length ? issues.join("\n") : "✓ Schema looks well-formed", info: `${types} types, ${inputs} inputs` };
  },
};

const openApiValidator: ToolDefinition = {
  slug: "openapi-swagger-validator",
  mode: "text",
  transform: ({ input }) => {
    let spec: Record<string, unknown>;
    try { spec = JSON.parse(input); } catch {
      throw new Error("OpenAPI spec must be valid JSON (paste a JSON swagger document)");
    }
    const issues: string[] = [];
    if (!spec.openapi && !spec.swagger) issues.push("✗ Missing `openapi` or `swagger` version");
    if (!spec.info) issues.push("⚠ Missing `info` block");
    if (!spec.paths || Object.keys(spec.paths as object).length === 0) issues.push("⚠ No `paths` defined");
    return { output: issues.length ? issues.join("\n") : "✓ Valid OpenAPI structure", info: `${Object.keys(spec.paths ?? {}).length} paths` };
  },
};

const esmCommonjsConverter: ToolDefinition = {
  slug: "esm-commonjs-converter",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptSelect value={String(options.dir ?? "to-cjs")} onChange={(v) => setOptions({ ...options, dir: v })} options={[{ value: "to-cjs", label: "ESM → CommonJS" }, { value: "to-esm", label: "CommonJS → ESM" }]} />
    </OptionsBar>
  ),
  defaultOptions: { dir: "to-cjs" },
  transform: ({ input, options }) => {
    if (options.dir === "to-cjs") {
      let out = input.replace(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g, "const $1 = require('$2');");
      out = out.replace(/import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g, "const { $1 } = require('$2');");
      out = out.replace(/import\s+['"]([^'"]+)['"]/g, "require('$1');");
      out = out.replace(/export\s+default\s+/g, "module.exports = ");
      out = out.replace(/export\s+(?:const|let|var|function)\s+(\w+)/g, "const $1 = ");
      return { output: out };
    }
    let out = input.replace(/const\s+\{([^}]+)\}\s*=\s*require\(['"]([^'"]+)['"]\)/g, "import { $1 } from '$2'");
    out = out.replace(/const\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\)/g, "import $1 from '$2'");
    out = out.replace(/require\(['"]([^'"]+)['"]\)/g, "import '$1'");
    out = out.replace(/module\.exports\s*=\s*/g, "export default ");
    return { output: out };
  },
};

const jsObfuscator: ToolDefinition = {
  slug: "js-obfuscator",
  mode: "text",
  live: false,
  placeholder: "Paste JavaScript code to obfuscate…",
  transform: ({ input }) => {
    if (!input.trim()) return { output: "" };
    // Best-effort client-side obfuscation: string escaping, hex encoding, dead code injection
    const hexStr = (s: string) =>
      s
        .split("")
        .map((c) => "\\x" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("");
    const vars: string[] = [];
    let out = input;
    // Replace string literals with hex-encoded eval
    out = out.replace(
      /(["'])([^"']{4,})\1/g,
      (_, q, s) => {
        const v = "_0x" + Math.random().toString(36).slice(2, 8);
        vars.push(`var ${v} = "${hexStr(s)}";`);
        return `eval(${v})`;
      },
    );
    // Add dead code
    const deadVars = Array.from({ length: 3 }, () => {
      const v = "_0x" + Math.random().toString(36).slice(2, 8);
      return `var ${v} = "${hexStr(Math.random().toString(36))}";`;
    });
    const header = deadVars.join("\n") + "\n" + vars.join("\n") + "\n";
    return {
      output: header + out,
      info: "⚠ Client-side obfuscation — basic variable renaming & string encoding. For production use dedicated tools like javascript-obfuscator.",
    };
  },
};

export const jsTools: ToolDefinition[] = [
  jsBeautifier, jsMinifier, tsToJs, jsConsolePlayground, jsArrayFormatter,
  jsRegexBuilder, lodashToNativeConverter, promiseVisualizer, es6ToEs5Converter,
  asyncAwaitConverter, debounceThrottleGenerator, stackTraceBeautifier,
  errorDecoder, graphqlQueryFormatter, graphqlSchemaValidator, openApiValidator,
  esmCommonjsConverter, jsObfuscator, importSorter,
];
