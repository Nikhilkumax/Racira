import type { ToolDefinition } from "@/components/developers/tools/registry";
import { OptionsBar, OptRow, OptSwitch } from "@/components/developers/tools/options-controls";

const REGEX_FLAGS = ["g", "i", "m", "s", "u", "y"].map((f) => ({ value: f, label: f }));

function FlagsOptions({ options, setOptions }: { options: Record<string, unknown>; setOptions: (n: Record<string, unknown>) => void }) {
  const flags = String(options.flags ?? "g");
  const toggle = (f: string) => {
    const next = flags.includes(f) ? flags.replace(f, "") : flags + f;
    setOptions({ ...options, flags: next.split("").sort().join("") });
  };
  return (
    <OptionsBar>
      <OptRow label="Flags">
        <div className="flex gap-1">
          {REGEX_FLAGS.map((f) => (
            <button
              key={f.value}
              onClick={() => toggle(f.value)}
              className={`h-7 w-7 rounded text-xs font-mono border ${flags.includes(f.value) ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </OptRow>
    </OptionsBar>
  );
}

const regexTester: ToolDefinition = {
  slug: "regex-tester",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptRow label="Pattern">
        <input
          defaultValue={String(options.pattern ?? "")}
          onChange={(e) => setOptions({ ...options, pattern: e.target.value })}
          className="h-8 w-64 rounded-md border border-input bg-background px-2 font-mono text-sm"
          placeholder="\\d+"
        />
      </OptRow>
      <FlagsOptions options={options} setOptions={setOptions} />
    </OptionsBar>
  ),
  defaultOptions: { pattern: "", flags: "g" },
  transform: ({ input, options }) => {
    const pattern = String(options.pattern ?? "");
    const flags = String(options.flags ?? "g");
    if (!pattern) return { output: "Enter a pattern above.", info: "" };
    let re: RegExp;
    try {
      re = new RegExp(pattern, flags);
    } catch (e) {
      throw new Error(`Invalid regex: ${e instanceof Error ? e.message : String(e)}`);
    }
    const matches = [...input.matchAll(flags.includes("g") ? re : new RegExp(pattern, flags + "g"))];
    if (!matches.length) return { output: "No matches.", info: "0 matches" };
    const lines = matches.map((m, i) => {
      const groups = m.length > 1 ? `\n  groups: ${JSON.stringify(m.slice(1))}` : "";
      return `[${i}] "${m[0]}" at index ${m.index}${groups}`;
    });
    return { output: lines.join("\n"), info: `${matches.length} match(es)` };
  },
};

const regexExplainer: ToolDefinition = {
  slug: "regex-explainer",
  mode: "text",
  transform: ({ input }) => {
    const pattern = input.trim();
    if (!pattern) return { output: "Paste a regex to explain." };
    const lines: string[] = [];
    const tokens: [RegExp, string][] = [
      [/^\/|\/[gimsuy]*$/g, "Regex delimiters and flags"],
      [/\\\./g, "Escaped literal dot"],
      [/\\d/g, "Digit [0-9]"],
      [/\\D/g, "Non-digit"],
      [/\\w/g, "Word character [A-Za-z0-9_]"],
      [/\\W/g, "Non-word character"],
      [/\\s/g, "Whitespace"],
      [/\\S/g, "Non-whitespace"],
      [/\\b/g, "Word boundary"],
      [/\\B/g, "Non-word boundary"],
      [/\+/g, "One or more (quantifier)"],
      [/\*/g, "Zero or more (quantifier)"],
      [/\?/g, "Zero or one (optional)"],
      [/\./g, "Any character"],
      [/\^/g, "Start of string"],
      [/\$/g, "End of string"],
      [/\|/g, "Alternation (OR)"],
      [/\((\?:)?/g, "Capture or non-capture group"],
      [/\[\^?([^\]]+)\]/g, "Character class"],
      [/\{(\d+)(?:,(\d+))?\}/g, "Repetition quantifier"],
    ];
    lines.push(`Pattern: ${pattern}`);
    lines.push("");
    lines.push("Tokens found:");
    const found = new Set<string>();
    for (const [re, desc] of tokens) {
      if (re.test(pattern)) {
        found.add(`${desc}`);
        re.lastIndex = 0;
      }
    }
    if (!found.size) lines.push("  (no recognized special tokens — treated as literal)");
    else Array.from(found).forEach((f) => lines.push(`  • ${f}`));
    return { output: lines.join("\n") };
  },
};

const regexReplaceTester: ToolDefinition = {
  slug: "regex-replace-tester",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptRow label="Pattern">
        <input defaultValue={String(options.pattern ?? "")} onChange={(e) => setOptions({ ...options, pattern: e.target.value })} className="h-8 w-48 rounded-md border border-input bg-background px-2 font-mono text-sm" placeholder="pattern" />
      </OptRow>
      <OptRow label="Replace">
        <input defaultValue={String(options.replacement ?? "")} onChange={(e) => setOptions({ ...options, replacement: e.target.value })} className="h-8 w-48 rounded-md border border-input bg-background px-2 font-mono text-sm" placeholder="replacement" />
      </OptRow>
      <FlagsOptions options={options} setOptions={setOptions} />
    </OptionsBar>
  ),
  defaultOptions: { pattern: "", replacement: "", flags: "g" },
  transform: ({ input, options }) => {
    const re = new RegExp(String(options.pattern ?? ""), String(options.flags ?? "g"));
    const out = input.replace(re, String(options.replacement ?? ""));
    return { output: out, info: `${input.length} → ${out.length} chars` };
  },
};

const regexCheatsheet: ToolDefinition = {
  slug: "regex-cheatsheet",
  mode: "generator",
  hideInput: true,
  live: false,
  transform: () => {
    const sections: [string, [string, string][]][] = [
      ["Characters", [[".", "Any char"], ["\\d \\D", "Digit / non-digit"], ["\\w \\W", "Word / non-word"], ["\\s \\S", "Whitespace / non-ws"], ["\\b \\B", "Word boundary"], ["^ $", "Start / end"]]],
      ["Quantifiers", [["a?", "0 or 1"], ["a*", "0 or more"], ["a+", "1 or more"], ["a{3}", "exactly 3"], ["a{2,4}", "2 to 4"], ["a{2,}", "2 or more"]]],
      ["Groups", [["(...)", "Capture group"], ["(?:...)", "Non-capture"], ["(?<name>...)", "Named"], ["(?=...)", "Lookahead"], ["(?!...)", "Neg lookahead"]]],
      ["Classes", [["[abc]", "Any of"], ["[^abc]", "None of"], ["[a-z]", "Range"]]],
    ];
    const lines: string[] = ["REGEX CHEATSHEET", ""];
    for (const [title, rows] of sections) {
      lines.push(`## ${title}`);
      for (const [tok, desc] of rows) lines.push(`  ${tok.padEnd(14)} ${desc}`);
      lines.push("");
    }
    return { output: lines.join("\n") };
  },
};

const regexCheatsheetSearch: ToolDefinition = {
  slug: "regex-cheatsheet-search",
  mode: "text",
  transform: ({ input }) => {
    const q = input.toLowerCase().trim();
    const lib: [string, string][] = [["email", "[^@]+@[^@]+\\.[^@]+"], ["url", "https?://[^\\s]+"], ["ipv4", "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b"], ["phone", "\\+?\\d[\\d\\s\\-()]{7,}"], ["hex color", "#[0-9a-fA-F]{3,8}"], ["date iso", "\\d{4}-\\d{2}-\\d{2}"]];
    if (!q) return { output: lib.map(([n, r]) => `${n}\t${r}`).join("\n") };
    const matches = lib.filter(([n]) => n.includes(q));
    return { output: matches.length ? matches.map(([n, r]) => `${n}: ${r}`).join("\n") : "No recipes match." };
  },
};

const regexLibrary: ToolDefinition = { ...regexCheatsheetSearch, slug: "regex-library" };

const regexGenerator: ToolDefinition = {
  slug: "regex-generator",
  mode: "text",
  transform: ({ input }) => {
    const lines = input.split(/\n/).map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return { output: "Paste sample lines (one per line) to derive a regex." };
    const commonPrefix = longestCommon(lines.map((l) => l.replace(/[^a-zA-Z0-9]+.*$/, "")));
    const allDigits = lines.every((l) => /\d/.test(l));
    const parts: string[] = [];
    if (commonPrefix) parts.push(commonPrefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    if (allDigits) parts.push("\\d+");
    if (!parts.length) parts.push("[\\w\\s]+");
    return { output: parts.join(""), info: "Best-effort derived pattern — verify with the Regex Tester" };
  },
};

function longestCommon(arr: string[]): string {
  if (!arr.length) return "";
  let prefix = arr[0];
  for (const s of arr) {
    while (!s.startsWith(prefix)) prefix = prefix.slice(0, -1);
  }
  return prefix;
}

const regexVisualizer: ToolDefinition = {
  slug: "regex-visualizer",
  mode: "text",
  transform: ({ input }) => {
    try {
      new RegExp(input.trim());
    } catch (e) {
      throw new Error(`Invalid regex: ${e instanceof Error ? e.message : String(e)}`);
    }
    const tokens: string[] = [];
    for (const ch of input) {
      tokens.push(`${ch}\t${describeRegexChar(ch)}`);
    }
    return { output: `Pattern: ${input}\n\n${tokens.join("\n")}` };
  },
};

function describeRegexChar(ch: string): string {
  const map: Record<string, string> = { "^": "start of line", "$": "end of line", ".": "any char", "*": "0+ times", "+": "1+ times", "?": "optional", "|": "OR", "\\": "escape next" };
  return map[ch] ?? "literal";
}

const cronToRegex: ToolDefinition = {
  slug: "cron-to-regex",
  mode: "text",
  transform: ({ input }) => {
    const parts = input.trim().split(/\s+/);
    if (parts.length < 5) throw new Error("A cron expression has 5 fields: m h dom mon dow");
    const [min, hour, dom, mon, dow] = parts;
    const explain = [
      `Cron: ${input}`,
      `  minute:        ${min}`,
      `  hour:          ${hour}`,
      `  day-of-month:  ${dom}`,
      `  month:         ${mon}`,
      `  day-of-week:   ${dow}`,
      "",
      "(Cron fields are not regular — a true regex cannot express 'last Friday' style rules.",
      "Use this decoded breakdown to build a matching pattern for your specific use case.)",
    ];
    return { output: explain.join("\n") };
  },
};

export const regexTools: ToolDefinition[] = [
  regexTester, regexGenerator, regexCheatsheet, regexExplainer, regexReplaceTester,
  regexLibrary, regexVisualizer, regexCheatsheetSearch, cronToRegex,
];
