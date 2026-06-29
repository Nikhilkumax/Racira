import type { ToolDefinition } from "@/components/developers/tools/registry";
import { OptionsBar, OptRow } from "@/components/developers/tools/options-controls";
import { tryParseJSON } from "./helpers";

const sourceMapDecoder: ToolDefinition = {
  slug: "source-map-decoder",
  mode: "text",
  placeholder: "Paste a .map JSON (sourceMappingURL content)…",
  transform: ({ input }) => {
    const v = tryParseJSON(input) as Record<string, unknown>;
    if (!v.version || !v.sources || !v.mappings) throw new Error("Not a valid source map");
    const lines: string[] = [
      `Version: ${v.version}`,
      `File: ${v.file ?? "—"}`,
      `Sources: ${(v.sources as string[]).join(", ")}`,
      `Names: ${(v.names as string[]).length} identifiers`,
      `Mappings: ${(v.mappings as string).length} chars`,
    ];
    return { output: lines.join("\n"), info: "Source map structure (full decoding requires a library)" };
  },
};

const bundleSizeAnalyzer: ToolDefinition = {
  slug: "bundle-size-analyzer",
  mode: "text",
  placeholder: "Paste your bundle stats JSON or bundlephobia output…",
  transform: ({ input }) => {
    try {
      const v = tryParseJSON(input) as Record<string, unknown>[];
      const rows = Array.isArray(v) ? v : [v];
      const lines = rows.map((r) => {
        const name = r.name ?? r.id ?? "unknown";
        const size = r.size ?? r.gzip ?? 0;
        return `${(typeof name === "string" ? name : "").padEnd(40)} ${typeof size === "number" ? `${(size / 1024).toFixed(1)} KB` : String(size)}`;
      });
      return { output: lines.join("\n") || "No bundle data found" };
    } catch {
      // Fallback: just count lines/size
      const bytes = new TextEncoder().encode(input).length;
      return { output: `Input size: ${(bytes / 1024).toFixed(1)} KB\n\n(Paste a webpack-stats.json or bundlephobia JSON for analysis.)` };
    }
  },
};

const treeShakingAnalyzer: ToolDefinition = {
  slug: "tree-shaking-analyzer",
  mode: "text",
  placeholder: "Paste import/export statements (one per line)…",
  transform: ({ input }) => {
    const exports = input.split(/\r?\n/).filter((l) => /export\s/.test(l));
    const imports = input.split(/\r?\n/).filter((l) => /import\s/.test(l));
    const namedExports = exports.filter((l) => /export\s+(const|let|function|class)\s+(\w+)/.test(l));
    const defaultExports = exports.filter((l) => /export\s+default/.test(l));
    const lines: string[] = [
      `Export statements: ${exports.length}`,
      `Import statements: ${imports.length}`,
      `Named exports:    ${namedExports.length}`,
      `Default exports:  ${defaultExports.length}`,
      ``,
      `Tree-shaking tip: Use named exports (${namedExports.length} found) instead of default exports`,
      `to allow bundlers to eliminate unused code.`,
    ];
    return { output: lines.join("\n") };
  },
};

const npmPackageSizeChecker: ToolDefinition = {
  slug: "npm-package-size-checker",
  mode: "text",
  placeholder: "Enter npm package name…",
  transform: ({ input }) => {
    const name = input.trim();
    if (!name) return { output: "Enter an npm package name (e.g. lodash, react, express)." };
    return {
      output: `Package: ${name}\n\nNote: Real bundle size data requires fetching from bundlephobia.com or unpkg.com.\nThis tool runs 100% client-side and cannot make external HTTP requests.\n\nVisit: https://bundlephobia.com/package/${name}`,
      info: "(no network — visit bundlephobia.com for real data)",
    };
  },
};

const openApiToTsGenerator: ToolDefinition = {
  slug: "openapi-to-typescript-generator",
  mode: "text",
  transform: ({ input }) => {
    const v = tryParseJSON(input) as Record<string, unknown>;
    const endpoints = v.paths as Record<string, Record<string, Record<string, unknown>>> | undefined;
    if (!endpoints) throw new Error("No `paths` found in spec");
    const lines: string[] = ["export interface ApiClient {"];
    for (const [path, methods] of Object.entries(endpoints)) {
      for (const [method, spec] of Object.entries(methods)) {
        const name = `${method}${path.replace(/[{}\/]/g, (c) => c === "{" ? "By" : "").replace(/}/g, "")}`.replace(/[^a-zA-Z0-9]/g, "");
        lines.push(`  ${name}(params?: unknown): Promise<unknown>;`);
      }
    }
    lines.push("}");
    return { output: lines.join("\n") };
  },
};

const swaggerToPostmanCollection: ToolDefinition = {
  slug: "swagger-to-postman-collection",
  mode: "text",
  transform: ({ input }) => {
    const v = tryParseJSON(input) as Record<string, unknown>;
    const paths = v.paths as Record<string, Record<string, Record<string, unknown>>> | undefined;
    if (!paths) throw new Error("No `paths` found");
    const schemes = (v.schemes as string[] | undefined) ?? [];
    const host = (v.host as string | undefined) ?? "";
    const basePath = (v.basePath as string | undefined) ?? "";
    const base = host
      ? `https://${host}`
      : schemes[0]
        ? `${schemes[0]}://${host}`
        : "https://api.example.com";
    const baseUrl = base + basePath;
    const items: Record<string, unknown>[] = [];
    for (const [path, methods] of Object.entries(paths)) {
      for (const [method, spec] of Object.entries(methods)) {
        items.push({
          name: `${method.toUpperCase()} ${path}`,
          request: {
            method: method.toUpperCase(),
            url: `${baseUrl}${path}`,
            description: ((spec as Record<string, unknown>).summary as string) ?? "",
          },
        });
      }
    }
    const collection = {
      info: { name: (v.info as Record<string, string> | undefined)?.name ?? "Imported" },
      item: items,
    };
    return { output: JSON.stringify(collection, null, 2), info: `${items.length} requests` };
  },
};

export const buildTools: ToolDefinition[] = [
  sourceMapDecoder, bundleSizeAnalyzer, treeShakingAnalyzer, npmPackageSizeChecker,
  openApiToTsGenerator, swaggerToPostmanCollection,
];
