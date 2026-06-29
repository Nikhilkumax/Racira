import type { ToolDefinition } from "@/components/developers/tools/registry";
import { countLines } from "./helpers";

const markdownPreviewer: ToolDefinition = {
  slug: "markdown-previewer",
  mode: "text",
  placeholder: "# Hello\n\nWrite **markdown** here…",
  transform: async ({ input }) => {
    const { marked } = await import("marked");
    const html = await marked.parse(input);
    return { output: html, html, info: `${countLines(input)} lines · rendered preview` };
  },
};

const markdownToHtml: ToolDefinition = {
  slug: "markdown-to-html",
  mode: "text",
  transform: async ({ input }) => {
    const { marked } = await import("marked");
    const html = await marked.parse(input);
    return { output: html };
  },
};

const htmlToMarkdown: ToolDefinition = {
  slug: "html-to-markdown",
  mode: "text",
  transform: ({ input }) => {
    if (typeof DOMParser === "undefined") throw new Error("DOMParser unavailable");
    const doc = new DOMParser().parseFromString(input, "text/html");
    const convert = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
      if (node.nodeType !== Node.ELEMENT_NODE) return "";
      const el = node as Element;
      const inner = Array.from(el.childNodes).map(convert).join("");
      switch (el.tagName.toLowerCase()) {
        case "h1": return `\n# ${inner}\n`;
        case "h2": return `\n## ${inner}\n`;
        case "h3": return `\n### ${inner}\n`;
        case "strong": case "b": return `**${inner}**`;
        case "em": case "i": return `*${inner}*`;
        case "code": return `\`${inner}\``;
        case "pre": return `\n\`\`\`\n${inner}\n\`\`\`\n`;
        case "a": return `[${inner}](${el.getAttribute("href") ?? ""})`;
        case "img": return `![${el.getAttribute("alt") ?? ""}](${el.getAttribute("src") ?? ""})`;
        case "li": return `- ${inner}\n`;
        case "ul": case "ol": return `\n${inner}\n`;
        case "br": return "\n";
        case "p": return `\n${inner}\n`;
        case "hr": return `\n---\n`;
        case "blockquote": return `\n> ${inner}\n`;
        default: return inner;
      }
    };
    return { output: convert(doc.body).replace(/\n{3,}/g, "\n\n").trim() };
  },
};

const markdownFormatter: ToolDefinition = {
  slug: "markdown-formatter",
  mode: "text",
  transform: ({ input }) => {
    let out = input.replace(/\r\n/g, "\n");
    out = out.replace(/[ \t]+$/gm, ""); // trailing ws
    out = out.replace(/\n{3,}/g, "\n\n"); // collapse blank lines
    // ensure space after heading hashes
    out = out.replace(/^(#{1,6})([^\s#])/gm, "$1 $2");
    // list spacing
    return { output: out, info: `${countLines(input)} → ${countLines(out)} lines` };
  },
};

const markdownTocGenerator: ToolDefinition = {
  slug: "markdown-toc-generator",
  mode: "text",
  transform: ({ input }) => {
    const lines = input.split(/\r?\n/);
    const toc: string[] = [];
    const seen = new Map<string, number>();
    for (const line of lines) {
      const m = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
      if (!m) continue;
      const level = m[1].length;
      const text = m[2].replace(/[/*`_]/g, "");
      const anchor = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
      let id = anchor;
      if (seen.has(anchor)) {
        const n = seen.get(anchor)! + 1;
        seen.set(anchor, n);
        id = `${anchor}-${n}`;
      } else seen.set(anchor, 1);
      toc.push(`${"  ".repeat(level - 1)}- [${text}](#${id})`);
    }
    return { output: toc.join("\n") || "No headings found.", info: `${toc.length} headings` };
  },
};

const markdownWordCounter: ToolDefinition = {
  slug: "markdown-word-counter",
  mode: "text",
  transform: ({ input }) => {
    const text = input.replace(/[#*`>\-_=\[\]()!]/g, " ").replace(/\s+/g, " ").trim();
    const words = text ? text.split(" ").length : 0;
    const chars = input.length;
    const lines = countLines(input);
    const readMins = Math.ceil(words / 200);
    return { output: `Words: ${words}\nCharacters: ${chars}\nLines: ${lines}\nReading time: ~${readMins} min` };
  },
};

const markdownLinkChecker: ToolDefinition = {
  slug: "markdown-link-checker",
  mode: "text",
  transform: ({ input }) => {
    const re = /\[([^\]]*)\]\(([^)]+)\)/g;
    const links: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(input)) !== null) links.push(`${m[1]} → ${m[2]}`);
    return { output: links.length ? links.join("\n") : "No markdown links found.", info: `${links.length} links` };
  },
};

const markdownImageEmbedder: ToolDefinition = {
  slug: "markdown-image-embedder",
  mode: "custom",
  customRenderer: ({ input, setInput }) => (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex gap-2 mb-3">
        <label className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-sm flex items-center cursor-pointer">
          Embed images
          <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            Promise.all(files.map((f) => new Promise<string>((res) => {
              const r = new FileReader();
              r.onload = () => res(String(r.result));
              r.readAsDataURL(f);
            }))).then((uris) => {
              const md = uris.map((u, i) => `![image-${i}](${u})`).join("\n\n");
              setInput(input ? input + "\n\n" + md : md);
            });
          }} />
        </label>
      </div>
      <textarea value={input} onChange={(e) => setInput(e.target.value)} className="w-full h-64 rounded-md border border-border bg-background p-2 font-mono text-sm" placeholder="Markdown with embedded images…" />
    </div>
  ),
};

const markdownDiffViewer: ToolDefinition = {
  slug: "markdown-diff-viewer",
  mode: "dual",
  transform: ({ input, secondInput }) => {
    const a = input.split(/\r?\n/);
    const b = (secondInput ?? "").split(/\r?\n/);
    const out: string[] = [];
    const max = Math.max(a.length, b.length);
    for (let i = 0; i < max; i++) {
      if (a[i] === b[i]) out.push(`  ${a[i] ?? ""}`);
      else {
        if (a[i] !== undefined) out.push(`- ${a[i]}`);
        if (b[i] !== undefined) out.push(`+ ${b[i]}`);
      }
    }
    return { output: out.join("\n") };
  },
};

const markdownTableFormatter: ToolDefinition = {
  slug: "markdown-table-formatter",
  mode: "text",
  transform: ({ input }) => {
    const lines = input.trim().split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) return { output: "Paste a markdown table (header, separator, rows)." };
    const parseRow = (l: string) => l.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
    const headers = parseRow(lines[0]);
    const cols = headers.length;
    const widths = Array.from({ length: cols }, (_, i) => headers[i].length);
    const rows: string[][] = [];
    for (const line of lines.slice(2)) {
      const cells = parseRow(line);
      rows.push(cells);
      cells.forEach((c, i) => { if (widths[i] !== undefined) widths[i] = Math.max(widths[i], c.length); });
    }
    const fmt = (cells: string[]) => "| " + cells.map((c, i) => (c ?? "").padEnd(widths[i] ?? 0)).join(" | ") + " |";
    const sep = "| " + widths.map((w) => "-".repeat(w)).join(" | ") + " |";
    return { output: [fmt(headers), sep, ...rows.map(fmt)].join("\n") };
  },
};

const markdownCheatsheet: ToolDefinition = {
  slug: "markdown-cheatsheet",
  mode: "generator",
  hideInput: true,
  live: false,
  transform: () => ({
    output: [
      "MARKDOWN CHEATSHEET", "",
      "# H1   ## H2   ### H3",
      "**bold**   *italic*   `code`",
      "[link](https://example.com)",
      "![image](img.png)",
      "- item\n- item",
      "1. ordered\n2. list",
      "> quote",
      "```js\ncode block\n```",
      "| Col | Col |\n| --- | --- |\n| a   | b   |",
      "---  (horizontal rule)",
    ].join("\n"),
  }),
};

export const markdownTools: ToolDefinition[] = [
  markdownPreviewer, markdownToHtml, markdownFormatter, markdownTocGenerator, htmlToMarkdown,
  markdownCheatsheet, markdownWordCounter, markdownLinkChecker, markdownImageEmbedder,
  markdownDiffViewer, markdownTableFormatter,
];
