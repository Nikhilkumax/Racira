import type { ToolDefinition } from "@/components/developers/tools/registry";
import { OptionsBar, OptSelect, OptRow } from "@/components/developers/tools/options-controls";
import { byteLength, countLines } from "./helpers";

const CASES: Record<string, (s: string) => string> = {
  camel: (s) => s.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()).replace(/^./, (c) => c.toLowerCase()),
  pascal: (s) => {
    const c = s.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, x) => x.toUpperCase());
    return c.charAt(0).toUpperCase() + c.slice(1);
  },
  snake: (s) => s.trim().replace(/([a-z])([A-Z])/g, "$1_$2").replace(/[^a-zA-Z0-9]+/g, "_").toLowerCase().replace(/^_|_$/g, ""),
  kebab: (s) => s.trim().replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase().replace(/^-|-$/g, ""),
  constant: (s) => s.trim().replace(/([a-z])([A-Z])/g, "$1_$2").replace(/[^a-zA-Z0-9]+/g, "_").toUpperCase().replace(/^_|_$/g, ""),
  lower: (s) => s.toLowerCase(),
  upper: (s) => s.toUpperCase(),
  title: (s) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
  sentence: (s) => (s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()),
};

const caseConverter: ToolDefinition = {
  slug: "case-converter",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptSelect value={String(options.to ?? "camel")} onChange={(v) => setOptions({ ...options, to: v })} options={Object.keys(CASES).map((c) => ({ value: c, label: c }))} />
    </OptionsBar>
  ),
  defaultOptions: { to: "camel" },
  transform: ({ input, options }) => ({ output: (CASES[String(options.to ?? "camel")] || CASES.camel)(input) }),
};

const lineSorter: ToolDefinition = {
  slug: "line-sorter",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptSelect value={String(options.order ?? "asc")} onChange={(v) => setOptions({ ...options, order: v })} options={[{ value: "asc", label: "A→Z" }, { value: "desc", label: "Z→A" }]} />
    </OptionsBar>
  ),
  defaultOptions: { order: "asc" },
  transform: ({ input, options }) => {
    const lines = input.split(/\r?\n/);
    lines.sort((a, b) => options.order === "desc" ? b.localeCompare(a) : a.localeCompare(b));
    return { output: lines.join("\n") };
  },
};

const duplicateLineRemover: ToolDefinition = {
  slug: "duplicate-line-remover",
  mode: "text",
  transform: ({ input }) => {
    const seen = new Set<string>();
    const out = input.split(/\r?\n/).filter((l) => (seen.has(l) ? false : (seen.add(l), true)));
    return { output: out.join("\n"), info: `${countLines(input)} → ${out.length} lines` };
  },
};

const tabsSpacesConverter: ToolDefinition = {
  slug: "tabs-spaces-converter",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptSelect value={String(options.dir ?? "to-spaces")} onChange={(v) => setOptions({ ...options, dir: v })} options={[{ value: "to-spaces", label: "Tabs → Spaces" }, { value: "to-tabs", label: "Spaces → Tabs" }]} />
      <OptRow label="Tab size"><input type="number" defaultValue={Number(options.size ?? 2)} min={1} max={8} onChange={(e) => setOptions({ ...options, size: Number(e.target.value) })} className="h-8 w-16 rounded-md border border-input bg-background px-2 text-sm" /></OptRow>
    </OptionsBar>
  ),
  defaultOptions: { dir: "to-spaces", size: 2 },
  transform: ({ input, options }) => {
    const size = Number(options.size ?? 2);
    const pad = " ".repeat(size);
    return { output: options.dir === "to-spaces" ? input.replace(/\t/g, pad) : input.replace(new RegExp(pad, "g"), "\t") };
  },
};

const indentationFormatter: ToolDefinition = {
  slug: "indentation-formatter",
  mode: "text",
  transform: ({ input }) => {
    let depth = 0;
    const out: string[] = [];
    for (const line of input.split(/\r?\n/)) {
      const t = line.trim();
      if (t.startsWith("}") || t.startsWith("]") || t.startsWith(")") || t.startsWith("</")) depth = Math.max(0, depth - 1);
      out.push("  ".repeat(depth) + t);
      const inc = (t.endsWith("{") || t.endsWith("[") || t.endsWith("(") || /<[^/!?][^>]*>\s*$/.test(t)) ? 1 : 0;
      const dec = (t.endsWith("}") || t.endsWith("]") || t.endsWith(")") || t.endsWith(">")) ? 1 : 0;
      depth = Math.max(0, depth + inc);
      depth = Math.max(0, depth); // avoid double-decrement
      void dec;
    }
    return { output: out.join("\n") };
  },
};

const textHashCompare: ToolDefinition = {
  slug: "text-hash-compare",
  mode: "dual",
  transform: async ({ input, secondInput }) => {
    const a = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
    const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secondInput));
    const hex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf)).map((x) => x.toString(16).padStart(2, "0")).join("");
    const ha = hex(a), hb = hex(b);
    return { output: ha === hb ? "✓ Both texts have the same SHA-256." : "✗ SHA-256 hashes differ.", info: `Left:  ${ha.slice(0, 16)}…\nRight: ${hb.slice(0, 16)}…` };
  },
};

const textColumnFormatter: ToolDefinition = {
  slug: "text-column-formatter",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptRow label="Columns"><input type="number" defaultValue={Number(options.cols ?? 3)} min={1} max={12} onChange={(e) => setOptions({ ...options, cols: Number(e.target.value) })} className="h-8 w-16 rounded-md border border-input bg-background px-2 text-sm" /></OptRow>
      <OptRow label="Separator"><input defaultValue={String(options.sep ?? " | ")} onChange={(e) => setOptions({ ...options, sep: e.target.value })} className="h-8 w-20 rounded-md border border-input bg-background px-2 text-sm" /></OptRow>
    </OptionsBar>
  ),
  defaultOptions: { cols: 3, sep: " | " },
  transform: ({ input, options }) => {
    const items = input.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const cols = Number(options.cols ?? 3);
    const sep = String(options.sep ?? " | ");
    const maxLen = Math.max(...items.map((i) => i.length), 0);
    const rows: string[] = [];
    for (let i = 0; i < items.length; i += cols) {
      rows.push(items.slice(i, i + cols).map((it) => it.padEnd(maxLen)).join(sep));
    }
    return { output: rows.join("\n") };
  },
};

const unicodeNormalizer: ToolDefinition = {
  slug: "unicode-normalizer",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptSelect value={String(options.form ?? "NFC")} onChange={(v) => setOptions({ ...options, form: v })} options={["NFC", "NFD", "NFKC", "NFKD"].map((f) => ({ value: f, label: f }))} />
    </OptionsBar>
  ),
  defaultOptions: { form: "NFC" },
  transform: ({ input, options }) => ({ output: input.normalize(String(options.form ?? "NFC") as "NFC") }),
};

const smartPasteCleaner: ToolDefinition = {
  slug: "smart-paste-cleaner",
  mode: "text",
  transform: ({ input }) => {
    let out = input
      .replace(/\r\n/g, "\n")
      .replace(/\u00a0/g, " ")
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201c\u201d]/g, '"')
      .replace(/\u2013|\u2014/g, "-")
      .replace(/\u2026/g, "...")
      .replace(/\t+/g, "  ")
      .replace(/[ \t]+$/gm, "")
      .replace(/\n{3,}/g, "\n\n");
    return { output: out, info: `${input.length} → ${out.length} chars` };
  },
};

const loremIpsumGenerator: ToolDefinition = {
  slug: "lorem-ipsum-generator",
  mode: "generator",
  hideInput: true,
  live: false,
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptSelect value={String(options.unit ?? "paragraphs")} onChange={(v) => setOptions({ ...options, unit: v })} options={[{ value: "paragraphs", label: "Paragraphs" }, { value: "sentences", label: "Sentences" }, { value: "words", label: "Words" }]} />
      <OptRow label="Count"><input type="number" defaultValue={Number(options.count ?? 3)} min={1} max={100} onChange={(e) => setOptions({ ...options, count: Number(e.target.value) })} className="h-8 w-16 rounded-md border border-input bg-background px-2 text-sm" /></OptRow>
    </OptionsBar>
  ),
  defaultOptions: { unit: "paragraphs", count: 3 },
  transform: ({ options }) => {
    const words = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum".split(" ");
    const rand = () => words[Math.floor(Math.random() * words.length)];
    const sentence = () => {
      const n = 8 + Math.floor(Math.random() * 8);
      const ws = Array.from({ length: n }, rand);
      ws[0] = ws[0].charAt(0).toUpperCase() + ws[0].slice(1);
      return ws.join(" ") + ".";
    };
    const paragraph = () => Array.from({ length: 4 + Math.floor(Math.random() * 3) }, sentence).join(" ");
    const count = Number(options.count ?? 3);
    let out = "";
    if (options.unit === "words") out = Array.from({ length: count }, rand).join(" ");
    else if (options.unit === "sentences") out = Array.from({ length: count }, sentence).join(" ");
    else out = Array.from({ length: count }, paragraph).join("\n\n");
    return { output: out };
  },
};

const fakeUserGenerator: ToolDefinition = {
  slug: "fake-user-generator",
  mode: "generator",
  hideInput: true,
  live: false,
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptRow label="Count"><input type="number" defaultValue={Number(options.count ?? 5)} min={1} max={100} onChange={(e) => setOptions({ ...options, count: Number(e.target.value) })} className="h-8 w-16 rounded-md border border-input bg-background px-2 text-sm" /></OptRow>
    </OptionsBar>
  ),
  defaultOptions: { count: 5 },
  transform: ({ options }) => {
    const first = ["Alex", "Sam", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Jamie", "Avery", "Quinn"];
    const last = ["Smith", "Doe", "Brown", "Garcia", "Lee", "Patel", "Nguyen", "Kim", "Davis", "Lopez"];
    const domains = ["example.com", "test.org", "mail.io", "demo.net"];
    const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
    const count = Number(options.count ?? 5);
    const users = Array.from({ length: count }, () => {
      const f = pick(first); const l = pick(last);
      return { name: `${f} ${l}`, email: `${f.toLowerCase()}.${l.toLowerCase()}@${pick(domains)}`, username: `${f[0].toLowerCase()}${l.toLowerCase()}${Math.floor(Math.random() * 100)}`, age: 18 + Math.floor(Math.random() * 60), phone: `+1-${Math.floor(200 + Math.random() * 800)}-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}` };
    });
    return { output: JSON.stringify(users, null, 2), data: users, info: `${count} fake users` };
  },
};

const fakeJsonDataGenerator: ToolDefinition = {
  slug: "fake-json-data-generator",
  mode: "text",
  transform: ({ input, options }) => {
    const count = Number(options.count ?? 5);
    let fields: [string, "string" | "number" | "boolean" | "date"][] = [["id", "number"], ["name", "string"], ["active", "boolean"]];
    if (input.trim()) {
      try {
        const parsed = JSON.parse(input);
        if (Array.isArray(parsed) && parsed.length) {
          const sample = parsed[0] as Record<string, unknown>;
          fields = Object.keys(sample).map((k) => [k, (typeof sample[k] === "number" ? "number" : typeof sample[k] === "boolean" ? "boolean" : "string") as "string" | "number" | "boolean" | "date"]);
        } else if (parsed && typeof parsed === "object") {
          fields = Object.keys(parsed).map((k) => [k, "string" as const]);
        }
      } catch { /* use defaults */ }
    }
    const out = Array.from({ length: count }, (_, i) => {
      const row: Record<string, unknown> = {};
      for (const [name, type] of fields) {
        if (type === "number") row[name] = i + 1;
        else if (type === "boolean") row[name] = Math.random() > 0.5;
        else if (type === "date") row[name] = new Date(Date.now() - Math.random() * 1e10).toISOString();
        else row[name] = Math.random().toString(36).slice(2, 10);
      }
      return row;
    });
    return { output: JSON.stringify(out, null, 2), data: out, info: `${count} rows from ${fields.length} fields` };
  },
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptRow label="Count"><input type="number" defaultValue={Number(options.count ?? 5)} min={1} max={1000} onChange={(e) => setOptions({ ...options, count: Number(e.target.value) })} className="h-8 w-16 rounded-md border border-input bg-background px-2 text-sm" /></OptRow>
    </OptionsBar>
  ),
  defaultOptions: { count: 5 },
  placeholder: "(optional) paste a sample row of JSON to seed the schema…",
};

const fakeSqlDataGenerator: ToolDefinition = {
  slug: "fake-sql-data-generator",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptRow label="Table"><input defaultValue={String(options.table ?? "users")} onChange={(e) => setOptions({ ...options, table: e.target.value })} className="h-8 w-32 rounded-md border border-input bg-background px-2 text-sm" /></OptRow>
      <OptRow label="Rows"><input type="number" defaultValue={Number(options.count ?? 5)} min={1} max={500} onChange={(e) => setOptions({ ...options, count: Number(e.target.value) })} className="h-8 w-16 rounded-md border border-input bg-background px-2 text-sm" /></OptRow>
    </OptionsBar>
  ),
  defaultOptions: { table: "users", count: 5 },
  transform: ({ options }) => {
    const count = Number(options.count ?? 5);
    const table = String(options.table ?? "users");
    const rows = Array.from({ length: count }, (_, i) => `INSERT INTO ${table} (id, name, email, created_at) VALUES (${i + 1}, '${randomWord()}', 'user${i + 1}@example.com', NOW());`);
    return { output: rows.join("\n"), info: `${count} inserts` };
  },
};

function randomWord(): string {
  return Math.random().toString(36).slice(2, 10);
}

const clipboardHistory: ToolDefinition = {
  slug: "clipboard-history",
  mode: "custom",
  customRenderer: ({ input, setInput }) => (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <button onClick={async () => { try { const t = await navigator.clipboard.readText(); setInput(input ? t + "\n---\n" + input : t); } catch { alert("Clipboard read needs permission"); } }} className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-sm">Capture clipboard</button>
        <button onClick={() => setInput("")} className="h-8 px-3 rounded-md border border-border text-sm">Clear</button>
      </div>
      <pre className="whitespace-pre-wrap text-sm font-mono min-h-64">{input || "Captured items will appear here, separated by ---."}</pre>
    </div>
  ),
};

const devSnippetManager: ToolDefinition = {
  slug: "dev-snippet-manager",
  mode: "custom",
  customRenderer: ({ input, setInput, options, setOptions }) => {
    const snippets = (options.snippets as { name: string; code: string }[]) ?? [];
    const add = () => {
      const name = prompt("Snippet name?");
      if (!name) return;
      setOptions({ ...options, snippets: [{ name, code: input }, ...snippets] });
    };
    return (
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Editor</div>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} className="w-full h-64 rounded-md border border-border bg-background p-2 font-mono text-sm" placeholder="Write a snippet…" />
          <button onClick={add} className="mt-2 h-8 px-3 rounded-md bg-primary text-primary-foreground text-sm">Save snippet</button>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Saved ({snippets.length})</div>
          <div className="space-y-2 max-h-64 overflow-auto">
            {snippets.length === 0 && <div className="text-sm text-muted-foreground">No snippets yet.</div>}
            {snippets.map((s, i) => (
              <div key={i} className="border border-border rounded-md p-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{s.name}</span>
                  <div className="flex gap-1">
                    <button onClick={() => setInput(s.code)} className="text-xs px-2 py-0.5 rounded bg-accent">Load</button>
                    <button onClick={() => setOptions({ ...options, snippets: snippets.filter((_, j) => j !== i) })} className="text-xs px-2 py-0.5 rounded bg-destructive/10 text-destructive">Del</button>
                  </div>
                </div>
                <pre className="text-xs font-mono mt-1 opacity-70 line-clamp-2">{s.code}</pre>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
};

const codeSnapshotGenerator: ToolDefinition = {
  slug: "code-snapshot-generator",
  mode: "text",
  live: true,
  placeholder: "Paste code to generate a snapshot card…",
  transform: ({ input }) => {
    if (!input.trim()) return { output: "" };
    const lines = input.split("\n");
    const lang = lines[0]?.match(/^\/\/\s*(\w+)/)?.[1] || "code";
    const codeBlock = lines.join("\n");
    // Generate an SVG card that looks like a code screenshot
    const width = Math.min(600, Math.max(400, lines.reduce((a, l) => Math.max(a, l.length), 0) * 8 + 40));
    const height = Math.min(400, Math.max(100, lines.length * 18 + 60));
    const escaped = codeBlock.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#1e1e2e" rx="8"/>
  <rect x="12" y="8" width="8" height="8" rx="4" fill="#f38ba8"/>
  <rect x="24" y="8" width="8" height="8" rx="4" fill="#a6e3a1"/>
  <rect x="36" y="8" width="8" height="8" rx="4" fill="#f9e2af"/>
  <text x="16" y="34" fill="#89b4fa" font-family="monospace" font-size="12">${lang}</text>
  <text x="16" y="52" fill="#cdd6f4" font-family="monospace" font-size="11">${escaped.split("\n").slice(0, 15).join("</text>\n  <text x=\"16\" y=\"" + (52 + 16) + "\" fill=\"#cdd6f4\" font-family=\"monospace\" font-size=\"11\">")}</text>
</svg>`;
    return { output: svg, info: `${width}×${height}px SVG card` };
  },
};

const keyboardShortcutCheatsheet: ToolDefinition = {
  slug: "keyboard-shortcut-cheatsheets",
  mode: "text",
  live: false,
  hideInput: true,
  defaultOptions: { platform: "windows" },
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptSelect
        value={String(options.platform ?? "windows")}
        onChange={(v) => setOptions({ ...options, platform: v })}
        options={[
          { value: "windows", label: "Windows" },
          { value: "mac", label: "macOS" },
          { value: "linux", label: "Linux" },
        ]}
      />
    </OptionsBar>
  ),
  transform: ({ options }) => {
    const p = String(options.platform ?? "windows");
    const mod = p === "mac" ? "⌘" : p === "linux" ? "Ctrl" : "Ctrl";
    const alt = p === "mac" ? "⌥" : "Alt";
    const shortcuts = [
      ["General", [
        [`${mod}+C`, "Copy"],
        [`${mod}+V`, "Paste"],
        [`${mod}+X`, "Cut"],
        [`${mod}+Z`, "Undo"],
        [`${mod}+Shift+Z`, "Redo"],
        [`${mod}+A`, "Select all"],
        [`${mod}+S`, "Save"],
        [`${mod}+F`, "Find"],
        [`${mod}+H`, "Replace"],
        [`${mod}+P`, "Quick open"],
      ]],
      ["Editing", [
        ["Home / End", "Line start / end"],
        [`${mod}+← / →`, "Word left / right"],
        [`${mod}+↑ / ↓`, "Paragraph up / down"],
        [`${mod}+Shift+↑↓←→`, "Extend selection"],
        [`${mod}+D`, "Delete line (editors)"],
        [`${alt}+↑ / ↓`, "Move line up/down"],
        [`${mod}+ /`, "Toggle comment"],
      ]],
      ["Window", [
        [`${mod}+Tab`, "Switch windows"],
        [`${mod}+N`, "New window/tab"],
        [`${mod}+W`, "Close window/tab"],
        [`${mod}+Shift+N`, "New (incognito/private)"],
        [`${mod}+L`, "Focus address bar"],
        [`${mod}+Shift+I`, "DevTools"],
        [`${mod}+Shift+T`, "Reopen closed tab"],
        ["F11", "Fullscreen"],
      ]],
    ];
    const lines: string[] = [];
    for (const [group, items] of shortcuts) {
      lines.push(`\n── ${group} ──`);
      for (const [key, desc] of items) {
        lines.push(`  ${key.padEnd(24)} ${desc}`);
      }
    }
    return { output: lines.join("\n") };
  },
};

export const textTools: ToolDefinition[] = [
  caseConverter, lineSorter, duplicateLineRemover, tabsSpacesConverter, indentationFormatter,
  textHashCompare, textColumnFormatter, unicodeNormalizer, smartPasteCleaner,
  loremIpsumGenerator, fakeUserGenerator, fakeJsonDataGenerator, fakeSqlDataGenerator,
  clipboardHistory, devSnippetManager, codeSnapshotGenerator, keyboardShortcutCheatsheet,
];

export { byteLength, countLines };
