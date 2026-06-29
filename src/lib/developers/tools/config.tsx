import type { ToolDefinition } from "@/components/developers/tools/registry";
import { OptionsBar, OptRow } from "@/components/developers/tools/options-controls";
import { tryParseJSON } from "./helpers";

async function loadYaml() {
  return (await import("js-yaml")).default;
}

const dockerComposeValidator: ToolDefinition = {
  slug: "docker-compose-validator",
  mode: "text",
  transform: async ({ input }) => {
    const yaml = await loadYaml();
    let v: unknown;
    try { v = yaml.load(input); } catch (e) { throw new Error(`YAML error: ${e instanceof Error ? e.message : String(e)}`); }
    const issues: string[] = [];
    const doc = v as Record<string, unknown>;
    if (!doc.services) issues.push("✗ Missing top-level `services` key");
    if (doc.services && typeof doc.services === "object") {
      for (const [name, svc] of Object.entries(doc.services as Record<string, Record<string, unknown>>)) {
        if (!svc.image && !svc.build) issues.push(`⚠ Service "${name}" has no image or build`);
      }
    }
    if (doc.version) issues.push("ℹ `version` is deprecated in modern compose");
    return { output: issues.length ? issues.join("\n") : "✓ Compose file looks valid", info: `${Object.keys(doc.services ?? {}).length} services` };
  },
};

const kubernetesValidator: ToolDefinition = {
  slug: "kubernetes-yaml-validator",
  mode: "text",
  transform: async ({ input }) => {
    const yaml = await loadYaml();
    const docs = input.split(/^---\s*$/m).filter((d) => d.trim());
    const issues: string[] = [];
    for (let i = 0; i < docs.length; i++) {
      let v: unknown;
      try { v = yaml.load(docs[i]); } catch (e) { issues.push(`✗ Doc ${i + 1}: ${e instanceof Error ? e.message : String(e)}`); continue; }
      const d = v as Record<string, unknown>;
      if (!d?.apiVersion) issues.push(`⚠ Doc ${i + 1}: missing apiVersion`);
      if (!d?.kind) issues.push(`⚠ Doc ${i + 1}: missing kind`);
      if (!d?.metadata) issues.push(`⚠ Doc ${i + 1}: missing metadata`);
    }
    return { output: issues.length ? issues.join("\n") : `✓ ${docs.length} manifest(s) valid`, info: `${docs.length} docs` };
  },
};

const githubActionsValidator: ToolDefinition = {
  slug: "github-actions-yaml-validator",
  mode: "text",
  transform: async ({ input }) => {
    const yaml = await loadYaml();
    let v: unknown;
    try { v = yaml.load(input); } catch (e) { throw new Error(`YAML error: ${e instanceof Error ? e.message : String(e)}`); }
    const doc = v as Record<string, unknown>;
    const issues: string[] = [];
    if (!doc.name) issues.push("ℹ Missing workflow `name`");
    if (!doc.on && !("true" in doc)) issues.push("✗ Missing `on:` trigger");
    if (!doc.jobs) issues.push("✗ Missing `jobs`");
    return { output: issues.length ? issues.join("\n") : "✓ Workflow looks valid", info: `${Object.keys(doc.jobs ?? {}).length} jobs` };
  },
};

const terraformFormatter: ToolDefinition = {
  slug: "terraform-hcl-formatter",
  mode: "text",
  transform: ({ input }) => {
    let out = input.replace(/\s*([={})\[\]])\s*/g, "$1");
    out = out.replace(/([{}])/g, " $1 ");
    out = out.replace(/\s+/g, " ");
    out = out.replace(/{\s*/g, "{\n  ").replace(/\s*}/g, "\n}");
    out = out.replace(/;\s*/g, "\n  ");
    let depth = 0;
    const lines = out.split("\n").map((line) => {
      const t = line.trim();
      if (!t) return "";
      if (t === "}") depth = Math.max(0, depth - 1);
      const r = "  ".repeat(depth) + t;
      if (t.endsWith("{")) depth++;
      return r;
    });
    return { output: lines.filter(Boolean).join("\n"), info: "Approximate HCL formatting" };
  },
};

const envToJsonConverter: ToolDefinition = {
  slug: "env-to-json-converter",
  mode: "text",
  transform: ({ input }) => {
    const obj: Record<string, string> = {};
    for (const line of input.split(/\r?\n/)) {
      const m = /^\s*(?:export\s+)?([A-Za-z_][\w]*)=(.*)$/.exec(line);
      if (m) obj[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
    return { output: JSON.stringify(obj, null, 2), info: `${Object.keys(obj).length} keys` };
  },
};

const jsonToEnvConverter: ToolDefinition = {
  slug: "json-to-env-converter",
  mode: "text",
  transform: ({ input }) => {
    const v = tryParseJSON(input);
    if (!v || typeof v !== "object") throw new Error("Expected a flat JSON object");
    const out = Object.entries(v as Record<string, unknown>).map(([k, val]) => {
      const s = typeof val === "string" ? val : JSON.stringify(val);
      return `${k.toUpperCase().replace(/[^A-Z0-9_]/g, "_")}=${s.includes(" ") ? `"${s}"` : s}`;
    });
    return { output: out.join("\n") };
  },
};

const eslintConfigValidator: ToolDefinition = {
  slug: "eslint-config-validator",
  mode: "text",
  transform: ({ input }) => {
    let v: unknown;
    try { v = JSON.parse(input); } catch (e) { throw new Error(`Not valid JSON: ${e instanceof Error ? e.message : String(e)}`); }
    const issues: string[] = [];
    const c = v as Record<string, unknown>;
    if (Array.isArray(c.extends) && c.extends.length === 0) issues.push("ℹ Empty `extends` array");
    if (!c.rules && !c.extends) issues.push("⚠ No `rules` or `extends` found");
    if (c.rules && typeof c.rules === "object") {
      const invalid = Object.entries(c.rules).filter(([, val]) => !["off", "warn", "error", 0, 1, 2].includes(val as never) && !Array.isArray(val));
      if (invalid.length) issues.push(`⚠ Rule values should be off/warn/error: ${invalid.map(([k]) => k).join(", ")}`);
    }
    return { output: issues.length ? issues.join("\n") : "✓ ESLint config structure OK" };
  },
};

const pwaManifestGenerator: ToolDefinition = {
  slug: "pwa-manifest-generator",
  mode: "custom",
  customRenderer: ({ options, setOptions }) => {
    const o = options as Record<string, string>;
    const manifest = {
      name: o.name ?? "My App",
      short_name: (o.shortName ?? "App"),
      description: o.description ?? "",
      start_url: "/",
      display: o.display ?? "standalone",
      background_color: o.bg ?? "#ffffff",
      theme_color: o.theme ?? "#000000",
      icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }, { src: "/icon-512.png", sizes: "512x512", type: "image/png" }],
    };
    return (
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
          <input defaultValue={o.name ?? ""} onChange={(e) => setOptions({ ...options, name: e.target.value })} placeholder="name" className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm" />
          <input defaultValue={o.shortName ?? ""} onChange={(e) => setOptions({ ...options, shortName: e.target.value })} placeholder="short_name" className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm" />
          <input defaultValue={o.theme ?? "#000000"} type="color" onChange={(e) => setOptions({ ...options, theme: e.target.value })} className="h-8 w-16 rounded" />
          <input defaultValue={o.bg ?? "#ffffff"} type="color" onChange={(e) => setOptions({ ...options, bg: e.target.value })} className="h-8 w-16 rounded" />
        </div>
        <pre className="rounded-2xl border border-border bg-background p-4 text-xs font-mono whitespace-pre-wrap overflow-auto">{JSON.stringify(manifest, null, 2)}</pre>
      </div>
    );
  },
};

const pwaManifestValidator: ToolDefinition = {
  slug: "pwa-manifest-validator",
  mode: "text",
  transform: ({ input }) => {
    const v = tryParseJSON(input) as Record<string, unknown>;
    const issues: string[] = [];
    if (!v.name) issues.push("✗ Missing `name`");
    if (!v.short_name) issues.push("⚠ Missing `short_name`");
    if (!v.start_url) issues.push("⚠ Missing `start_url`");
    if (!v.display) issues.push("ℹ Missing `display` (defaults to browser)");
    if (!v.icons || !Array.isArray(v.icons) || v.icons.length === 0) issues.push("✗ No `icons`");
    return { output: issues.length ? issues.join("\n") : "✓ Valid PWA manifest" };
  },
};

const packageJsonValidator: ToolDefinition = {
  slug: "package-json-validator",
  mode: "text",
  transform: ({ input }) => {
    const v = tryParseJSON(input) as Record<string, unknown>;
    if (!v) return { output: "✗ Invalid JSON", error: "Input is not valid JSON" };
    const issues: string[] = [];
    if (!v.name) issues.push("✗ Missing `name`");
    if (!v.version) issues.push("✗ Missing `version`");
    if (v.name && !/^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(String(v.name))) issues.push("✗ Invalid `name` format");
    if (v.version && !/^\d+\.\d+\.\d+/.test(String(v.version))) issues.push("⚠ `version` should be semver (x.y.z)");
    if (v.dependencies && typeof v.dependencies !== "object") issues.push("✗ `dependencies` must be an object");
    if (v.devDependencies && typeof v.devDependencies !== "object") issues.push("✗ `devDependencies` must be an object");
    if (v.scripts && typeof v.scripts !== "object") issues.push("✗ `scripts` must be an object");
    if (v.license && v.license !== "UNLICENSED" && typeof v.license === "string" && !v.license.match(/^(MIT|Apache-2\.0|GPL|ISC|BSD)/i)) issues.push("ℹ `license` is non-standard");
    const depCount = v.dependencies ? Object.keys(v.dependencies).length : 0;
    const devDepCount = v.devDependencies ? Object.keys(v.devDependencies).length : 0;
    issues.push(`ℹ ${depCount} dependencies, ${devDepCount} devDependencies`);
    return { output: issues.join("\n") };
  },
};

const tsconfigValidator: ToolDefinition = {
  slug: "tsconfig-json-validator",
  mode: "text",
  transform: ({ input }) => {
    const v = tryParseJSON(input) as Record<string, unknown>;
    if (!v) return { output: "✗ Invalid JSON", error: "Input is not valid JSON" };
    const issues: string[] = [];
    if (!v.compilerOptions) issues.push("✗ Missing `compilerOptions`");
    if (!v.compilerOptions || typeof v.compilerOptions !== "object") {
      return { output: issues.join("\n") || "ℹ Basic structure looks OK" };
    }
    const co = v.compilerOptions as Record<string, unknown>;
    if (!co.target) issues.push("ℹ Missing `target` — defaults to ES3");
    if (!co.module) issues.push("ℹ Missing `module` — defaults to CommonJS");
    if (!co.outDir && !co.noEmit) issues.push("ℹ No `outDir` or `noEmit`");
    if (!co.strict && co.strict !== false) issues.push("ℹ Consider enabling `strict` mode");
    if (co.jsx && !["react", "preserve", "react-jsx", "react-jsxdev", "react-native"].includes(String(co.jsx))) issues.push("⚠ Invalid `jsx` option");
    const files = v.include ? (Array.isArray(v.include) ? v.include : []) : [];
    const excludes = v.exclude ? (Array.isArray(v.exclude) ? v.exclude : []) : [];
    issues.push(`ℹ ${files.length} include patterns, ${excludes.length} exclude patterns`);
    return { output: issues.join("\n") };
  },
};

export const configTools: ToolDefinition[] = [
  dockerComposeValidator, kubernetesValidator, githubActionsValidator, terraformFormatter,
  envToJsonConverter, jsonToEnvConverter, eslintConfigValidator, pwaManifestGenerator,
  pwaManifestValidator, packageJsonValidator, tsconfigValidator,
];
