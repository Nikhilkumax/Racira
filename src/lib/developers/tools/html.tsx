import type { ToolDefinition } from "@/components/developers/tools/registry";
import { OptionsBar, OptRow, OptSelect } from "@/components/developers/tools/options-controls";

const htmlFormatter: ToolDefinition = {
  slug: "html-formatter",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptSelect value={String(options.indent ?? "2")} onChange={(v) => setOptions({ ...options, indent: v })} options={[{ value: "2", label: "2 spaces" }, { value: "4", label: "4 spaces" }, { value: "tab", label: "Tabs" }]} />
    </OptionsBar>
  ),
  defaultOptions: { indent: "2" },
  transform: ({ input, options }) => {
    const tab = options.indent === "tab" ? "\t" : " ".repeat(Number(options.indent));
    let out = "";
    let depth = 0;
    const tokens = input.replace(/></g, ">\n<").split("\n");
    for (let raw of tokens) {
      const line = raw.trim();
      if (!line) continue;
      const isClose = /^<\//.test(line);
      const isSelf = /\/>$/.test(line) || /^(<\?xml|<!|<meta|<link|<br|<hr|<img|<input)/i.test(line);
      const isOpen = /^<[^/!?]/.test(line) && !isSelf && !/<\/[^>]+>/.test(line) && !line.includes("</");
      if (isClose) depth = Math.max(0, depth - 1);
      out += tab.repeat(depth) + line + "\n";
      if (isOpen) depth++;
    }
    return { output: out.trim() };
  },
};

const htmlMinifier: ToolDefinition = {
  slug: "html-minifier",
  mode: "text",
  transform: ({ input }) => ({
    output: input
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/\s+/g, " ")
      .replace(/>\s+</g, "><")
      .replace(/\s+>/g, ">")
      .replace(/<\s+/g, "<")
      .trim(),
  }),
};

const htmlPreview: ToolDefinition = {
  slug: "html-preview",
  mode: "text",
  placeholder: "<h1>Hello</h1>\n<p>Live preview →</p>",
  transform: ({ input }) => ({ output: input, html: `<div class="prose">${input}</div>`, info: "Rendered live below" }),
};

const htmlToJsx: ToolDefinition = {
  slug: "html-to-jsx",
  mode: "text",
  transform: ({ input }) => {
    let jsx = input
      .replace(/\sclass=/g, " className=")
      .replace(/\sfor=/g, " htmlFor=")
      .replace(/\sreadonly/g, " readOnly")
      .replace(/\smaxlength=/g, " maxLength=")
      .replace(/\stabindex=/g, " tabIndex=")
      .replace(/<(img|input|br|hr|meta|link|source|area|base|col|embed|param|track|wbr)\b([^>]*?)(?<!\/)>/gi, "<$1$2 />")
      .replace(/style="([^"]*)"/g, (_m, css: string) => {
        const obj = css.split(";").filter(Boolean).map((decl) => {
          const [k, v] = decl.split(":").map((s) => s.trim());
          const key = k.replace(/-([a-z])/g, (_x: string, c: string) => c.toUpperCase());
          return `${key}: ${/^\d+$/.test(v) ? v : `"${v}"`}`;
        }).join(", ");
        return `style={{ ${obj} }}`;
      });
    return { output: `const Component = () => (\n  ${jsx.trim()}\n);` };
  },
};

const htmlToPug: ToolDefinition = {
  slug: "html-to-pug",
  mode: "text",
  transform: ({ input }) => {
    if (typeof DOMParser === "undefined") throw new Error("DOMParser unavailable");
    const doc = new DOMParser().parseFromString(input, "text/html");
    const walk = (el: Element, depth: number): string => {
      const pad = "  ".repeat(depth);
      const attrs = Array.from(el.attributes).map((a) => a.name === "class" ? `.${a.value.split(" ").join(".")}` : a.name === "id" ? `#${a.value}` : `${a.name}="${a.value}"`).join("");
      const attrStr = attrs ? `(${attrs})` : "";
      let line = `${pad}${el.tagName.toLowerCase()}${attrStr}`;
      const children = Array.from(el.children);
      if (children.length === 0) {
        const text = (el.textContent ?? "").trim();
        if (text) line += ` ${text}`;
      }
      const childLines = children.map((c) => walk(c, depth + 1));
      return [line, ...childLines].join("\n");
    };
    return { output: walk(doc.body, 0) };
  },
};

const htmlLinter: ToolDefinition = {
  slug: "html-linter",
  mode: "text",
  transform: ({ input }) => {
    const issues: string[] = [];
    if (/<img(?![^>]*\salt=)/i.test(input)) issues.push("⚠ <img> without alt attribute");
    if (/<a(?![^>]*\srel=)/i.test(input) && /target=["']_blank["']/i.test(input)) issues.push('⚠ <a target="_blank"> without rel="noopener"');
    const openTags = (input.match(/<((?!\/)[a-z][a-z0-9]*)\b[^>]*[^/]>/gi) ?? []).map((t) => t.match(/<([a-z0-9]+)/i)?.[1].toLowerCase()).filter(Boolean);
    const closeTags = (input.match(/<\/([a-z][a-z0-9]*)>/gi) ?? []).map((t) => t.match(/<\/([a-z0-9]+)/i)?.[1].toLowerCase());
    const voids = new Set(["img", "br", "hr", "meta", "link", "input", "area", "base", "col", "embed", "param", "source", "track", "wbr"]);
    const counts: Record<string, number> = {};
    openTags.forEach((t) => { if (t && !voids.has(t)) counts[t] = (counts[t] ?? 0) + 1; });
    closeTags.forEach((t) => { if (t) counts[t] = (counts[t] ?? 0) - 1; });
    for (const [tag, n] of Object.entries(counts)) {
      if (n > 0) issues.push(`⚠ Unmatched opening <${tag}> (+${n})`);
      if (n < 0) issues.push(`⚠ Extra closing </${tag}> (${n})`);
    }
    if (!/<html/i.test(input)) issues.push("ℹ No <html> root detected");
    return { output: issues.length ? issues.join("\n") : "✓ No common HTML issues found", info: `${issues.length} issue(s)` };
  },
};

const htmlTableGenerator: ToolDefinition = {
  slug: "html-table-generator",
  mode: "custom",
  customRenderer: ({ options, setOptions }) => {
    const cols = Number(options.cols ?? 3);
    const rows = Number(options.rows ?? 3);
    const build = () => {
      const head = "  <thead>\n    <tr>" + Array.from({ length: cols }, (_, i) => `\n      <th>Column ${i + 1}</th>`).join("") + "\n    </tr>\n  </thead>";
      const body = "  <tbody>" + Array.from({ length: rows }, (_, r) => "\n    <tr>" + Array.from({ length: cols }, (_, c) => `\n      <td>Row ${r + 1} Col ${c + 1}</td>`).join("") + "\n    </tr>").join("") + "\n  </tbody>";
      return `<table>\n${head}\n${body}\n</table>`;
    };
    const html = build();
    return (
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex gap-3 mb-3">
            <label className="text-xs flex items-center gap-1">Cols <input type="number" min={1} max={10} defaultValue={cols} onChange={(e) => setOptions({ ...options, cols: Number(e.target.value) })} className="h-8 w-14 rounded-md border border-input bg-background px-2 text-sm" /></label>
            <label className="text-xs flex items-center gap-1">Rows <input type="number" min={1} max={50} defaultValue={rows} onChange={(e) => setOptions({ ...options, rows: Number(e.target.value) })} className="h-8 w-14 rounded-md border border-input bg-background px-2 text-sm" /></label>
          </div>
          <pre className="text-xs font-mono whitespace-pre-wrap bg-background p-2 rounded-md">{html}</pre>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    );
  },
};

const htmlEntityReference: ToolDefinition = {
  slug: "html-entity-reference",
  mode: "generator",
  hideInput: true,
  live: false,
  transform: () => {
    const ents: [string, string][] = [["&amp;", "&"], ["&lt;", "<"], ["&gt;", ">"], ["&quot;", '"'], ["&apos;", "'"], ["&nbsp;", " "], ["&copy;", "©"], ["&reg;", "®"], ["&trade;", "™"], ["&mdash;", "—"], ["&ndash;", "–"], ["&hellip;", "…"], ["&laquo;", "«"], ["&raquo;", "»"], ["&para;", "¶"], ["&sect;", "§"], ["&deg;", "°"], ["&euro;", "€"], ["&pound;", "£"], ["&yen;", "¥"], ["&cent;", "¢"], ["&times;", "×"], ["&divide;", "÷"]];
    return { output: ents.map(([e, c]) => `${e}\t${c}`).join("\n"), data: ents.map(([entity, symbol]) => ({ Entity: entity, Symbol: symbol })) };
  },
};

const htmlAccessibilityChecker: ToolDefinition = {
  slug: "html-accessibility-checker",
  mode: "text",
  transform: ({ input }) => {
    const issues: string[] = [];
    const imgs = input.match(/<img\b[^>]*>/gi) ?? [];
    for (const img of imgs) if (!/\salt=["']/.test(img)) issues.push(`✗ Image missing alt: ${img.slice(0, 60)}`);
    if (/<input\b[^>]*type=["']?text["']?[^>]*>/i.test(input) && !/<label\b/i.test(input)) issues.push("✗ Form input may be missing a <label>");
    if (/<button\b[^>]*>[^<]*<i\b/i.test(input)) issues.push("⚠ Icon-only button — add aria-label");
    if (/role=["']?presentation["']?/i.test(input)) issues.push("⚠ role=presentation can hide content from screen readers");
    const headings = (input.match(/<h[1-6]/gi) ?? []).length;
    if (headings > 0 && !/<h1\b/i.test(input)) issues.push("⚠ No <h1> found");
    if (input.toLowerCase().includes("onclick") && !input.toLowerCase().includes("keydown")) issues.push("ℹ onclick without keyboard handler");
    return { output: issues.length ? issues.join("\n") : "✓ No obvious accessibility issues", info: `${issues.length} checks flagged` };
  },
};

const domTreeViewer: ToolDefinition = {
  slug: "dom-tree-viewer",
  mode: "text",
  transform: ({ input }) => {
    if (typeof DOMParser === "undefined") throw new Error("DOMParser unavailable");
    const doc = new DOMParser().parseFromString(input, "text/html");
    const walk = (node: Element, depth: number): string => {
      const pad = "  ".repeat(depth);
      const tag = node.tagName.toLowerCase();
      const id = node.id ? `#${node.id}` : "";
      const cls = node.className && typeof node.className === "string" ? `.${node.className.split(" ").join(".")}` : "";
      const childCount = node.children.length;
      const lines = [`${pad}<${tag}${id}${cls}>${childCount ? ` (${childCount} children)` : ""}`];
      for (const c of Array.from(node.children)) lines.push(walk(c, depth + 1));
      return lines.join("\n");
    };
    return { output: walk(doc.body, 0) };
  },
};

const ariaAttributeGenerator: ToolDefinition = {
  slug: "aria-attribute-generator",
  mode: "custom",
  customRenderer: ({ options, setOptions }) => {
    const role = String(options.role ?? "button");
    const ariaMap: Record<string, [string, string][]> = {
      button: [["aria-label", "Descriptive label"], ["aria-disabled", "false"], ["aria-pressed", "false"]],
      alert: [["role", "alert"]],
      dialog: [["role", "dialog"], ["aria-modal", "true"], ["aria-labelledby", "title-id"]],
      navigation: [["role", "navigation"], ["aria-label", "Main"]],
      tab: [["role", "tab"], ["aria-selected", "false"], ["aria-controls", "panel-id"]],
    };
    const attrs = ariaMap[role] ?? ariaMap.button;
    const attrStr = attrs.map(([k, v]) => `${k}="${v}"`).join(" ");
    return (
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-3">
          <OptSelect value={role} onChange={(v) => setOptions({ ...options, role: v })} options={Object.keys(ariaMap).map((r) => ({ value: r, label: r }))} />
        </div>
        <pre className="text-sm font-mono bg-background p-3 rounded-md">{`<div ${attrStr}>…</div>`}</pre>
      </div>
    );
  },
};

const inlineCssGenerator: ToolDefinition = {
  slug: "inline-css-generator",
  mode: "custom",
  customRenderer: ({ input, setInput, options, setOptions }) => (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
      <div className="flex gap-3">
        <textarea defaultValue={String(options.css ?? "")} onChange={(e) => setOptions({ ...options, css: e.target.value })} placeholder="<style> or CSS rules" className="flex-1 h-24 rounded-md border border-border bg-background p-2 font-mono text-xs" />
      </div>
      <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="<html> to inline into…" className="w-full h-32 rounded-md border border-border bg-background p-2 font-mono text-xs" />
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Result</div>
      <pre className="text-xs font-mono bg-background p-2 rounded-md whitespace-pre-wrap">{input}</pre>
    </div>
  ),
};

const tableToDivConverter: ToolDefinition = {
  slug: "table-to-div-converter",
  mode: "text",
  transform: ({ input }) => {
    if (typeof DOMParser === "undefined") throw new Error("DOMParser unavailable");
    const doc = new DOMParser().parseFromString(input, "text/html");
    const table = doc.querySelector("table");
    if (!table) throw new Error("No <table> found");
    let out = '<div style="display: table;">';
    for (const row of Array.from(table.querySelectorAll("tr"))) {
      out += '<div style="display: table-row;">';
      for (const cell of Array.from(row.children)) {
        const isHead = cell.tagName.toLowerCase() === "th";
        out += `<div style="display: table-cell; padding: 4px;${isHead ? " font-weight: bold;" : ""}">${cell.innerHTML}</div>`;
      }
      out += "</div>";
    }
    out += "</div>";
    return { output: out };
  },
};

const openGraphPreview: ToolDefinition = {
  slug: "open-graph-preview",
  mode: "custom",
  customRenderer: ({ input, setInput }) => (
    <div className="grid md:grid-cols-2 gap-4">
      <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder='<meta property="og:title" content="My Page" />\n<meta property="og:description" content="Desc" />\n<meta property="og:image" content="https://…" />' className="h-64 rounded-md border border-border bg-background p-2 font-mono text-sm" />
      <div className="rounded-2xl border border-border bg-card p-4">
        <OgCard input={input} />
      </div>
    </div>
  ),
};

function OgCard({ input }: { input: string }) {
  const get = (prop: string) => {
    const m = new RegExp(`property=["']og:${prop}["']\\s+content=["']([^"']*)["']`).exec(input);
    return m?.[1] ?? "";
  };
  const title = get("title") || "Your title here";
  const desc = get("description") || "Your description here";
  const img = get("image");
  const url = get("url") || "example.com";
  return (
    <div className="max-w-sm border border-border rounded-lg overflow-hidden bg-background">
      {img && <img src={img} alt="" className="w-full h-40 object-cover" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />}
      <div className="p-3">
        <div className="text-xs text-muted-foreground uppercase">{url}</div>
        <div className="font-semibold text-sm mt-0.5 line-clamp-2">{title}</div>
        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{desc}</div>
      </div>
    </div>
  );
}

const twitterCardPreview: ToolDefinition = { ...openGraphPreview, slug: "twitter-card-preview" };

export const htmlTools: ToolDefinition[] = [
  htmlFormatter, htmlMinifier, htmlPreview, htmlToJsx, htmlToPug, htmlLinter,
  htmlTableGenerator, htmlEntityReference, htmlAccessibilityChecker, domTreeViewer,
  ariaAttributeGenerator, inlineCssGenerator, tableToDivConverter, openGraphPreview,
  twitterCardPreview,
];
