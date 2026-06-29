import type { ToolDefinition } from "@/components/developers/tools/registry";
import { OptionsBar, OptRow, OptSelect } from "@/components/developers/tools/options-controls";

const gitignoreGenerator: ToolDefinition = {
  slug: "gitignore-generator",
  mode: "custom",
  customRenderer: ({ options, setOptions }) => {
    const stacks = ["Node", "Python", "Go", "Rust", "Java", "macOS", "Windows", "Linux", "VSCode", "JetBrains", "Next.js", "React"];
    const selected = (options.stacks as string[]) ?? ["Node"];
    const toggle = (s: string) => setOptions({ ...options, stacks: selected.includes(s) ? selected.filter((x) => x !== s) : [...selected, s] });
    const templates: Record<string, string[]> = {
      Node: ["node_modules/", "npm-debug.log*", "yarn-error.log", "dist/", "build/", ".env"],
      Python: ["__pycache__/", "*.pyc", "*.pyo", ".venv/", "venv/", "*.egg-info/", ".pytest_cache/"],
      Go: ["*.exe", "*.exe~", "*.dll", "*.so", "*.dylib", "*.test", "*.out", "vendor/"],
      Rust: ["/target", "**/*.rs.bk", "Cargo.lock"],
      Java: ["*.class", "*.jar", "target/", ".gradle/", "build/"],
      macOS: [".DS_Store", ".AppleDouble", ".LSOverride", "._*"],
      Windows: ["Thumbs.db", "ehthumbs.db", "Desktop.ini", "$RECYCLE.BIN/"],
      Linux: ["*~", ".fuse_hidden*", ".directory", ".Trash-*"],
      VSCode: [".vscode/*", "!.vscode/settings.json", "!.vscode/tasks.json"],
      JetBrains: [".idea/", "*.iml", "*.iws"],
      "Next.js": [".next/", "out/", "build/", "node_modules/"],
      React: ["node_modules/", "dist/", "build/", ".cache/"],
    };
    const out: string[] = [];
    for (const s of selected) out.push(`# ${s}\n${(templates[s] ?? []).join("\n")}`);
    return (
      <div>
        <div className="flex flex-wrap gap-2 mb-4">
          {stacks.map((s) => (
            <button key={s} onClick={() => toggle(s)} className={`px-3 py-1 rounded-full text-xs border ${selected.includes(s) ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}>{s}</button>
          ))}
        </div>
        <pre className="rounded-md border border-border bg-background p-4 text-xs font-mono whitespace-pre-wrap min-h-48">{out.join("\n\n")}</pre>
      </div>
    );
  },
};

const commitMessageFormatter: ToolDefinition = {
  slug: "commit-message-formatter",
  mode: "text",
  transform: ({ input }) => {
    const subject = input.split(/\n/)[0].trim();
    const limited = subject.length > 50 ? subject.slice(0, 50) + "…" : subject;
    const body = input.split(/\n/).slice(1).join("\n").trim();
    const wrapped = body ? "\n\n" + body.replace(/(.{1,72})(?:\s|$)/g, "$1\n").trim() : "";
    return { output: limited + wrapped, info: `Subject: ${limited.length}/50 chars` };
  },
};

const semanticVersionGenerator: ToolDefinition = {
  slug: "semantic-version-generator",
  mode: "custom",
  customRenderer: ({ options, setOptions }) => {
    const v = String(options.version ?? "1.0.0");
    const [maj, min, pat] = v.split(".").map(Number);
    const bump = (kind: string) => {
      if (kind === "major") setOptions({ ...options, version: `${maj + 1}.0.0` });
      if (kind === "minor") setOptions({ ...options, version: `${maj}.${min + 1}.0` });
      if (kind === "patch") setOptions({ ...options, version: `${maj}.${min}.${pat + 1}` });
    };
    return (
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <div className="flex gap-2 items-center">
          <input defaultValue={v} onChange={(e) => setOptions({ ...options, version: e.target.value })} className="h-8 w-32 rounded-md border border-input bg-background px-2 text-sm font-mono" />
          <span className="text-xs text-muted-foreground">current</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => bump("major")} className="h-8 px-3 rounded-md bg-destructive/10 text-destructive text-xs">major → {maj + 1}.0.0</button>
          <button onClick={() => bump("minor")} className="h-8 px-3 rounded-md bg-primary/10 text-primary text-xs">minor → {maj}.{min + 1}.0</button>
          <button onClick={() => bump("patch")} className="h-8 px-3 rounded-md bg-secondary text-xs">patch → {maj}.{min}.{pat + 1}</button>
        </div>
        <pre className="text-sm font-mono bg-background p-3 rounded-md">{String(options.version ?? "1.0.0")}</pre>
      </div>
    );
  },
};

const envFormatter: ToolDefinition = {
  slug: "env-formatter",
  mode: "text",
  transform: ({ input }) => {
    const lines = input.split(/\r?\n/);
    const vars: [string, string, string][] = [];
    for (const line of lines) {
      const m = /^\s*(?:export\s+)?([A-Z_][A-Z0-9_]*)=(.*)$/i.exec(line);
      if (m) vars.push([m[1], m[2].replace(/^["']|["']$/g, ""), ""]);
    }
    if (!vars.length) return { output: input.trim() };
    const maxKey = Math.max(...vars.map((v) => v[0].length), 8);
    const out = vars.map(([k, v]) => `${k.padEnd(maxKey)}=${v}`);
    return { output: out.join("\n"), info: `${vars.length} variables` };
  },
};

const branchNameGenerator: ToolDefinition = {
  slug: "branch-name-generator",
  mode: "text",
  placeholder: "Describe your change… e.g. fix login bug 1234",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptSelect value={String(options.style ?? "kebab")} onChange={(v) => setOptions({ ...options, style: v })} options={[{ value: "kebab", label: "feature/kebab-case" }, { value: "slash", label: "type/issue" }]} />
    </OptionsBar>
  ),
  defaultOptions: { style: "kebab" },
  transform: ({ input, options }) => {
    const slug = input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return { output: options.style === "slash" ? `feature/${slug}` : slug, info: "Suggested branch name" };
  },
};

const conventionalCommitBuilder: ToolDefinition = {
  slug: "conventional-commit-builder",
  mode: "custom",
  customRenderer: ({ options, setOptions }) => {
    const o = options as Record<string, string>;
    const type = o.type ?? "feat";
    const scope = o.scope ?? "";
    const breaking = o.breaking === "true" ? "!" : "";
    const desc = o.desc ?? "";
    const commit = `${type}${scope ? `(${scope})` : ""}${breaking}: ${desc}`;
    return (
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
          <OptSelect value={type} onChange={(v) => setOptions({ ...options, type: v })} options={["feat", "fix", "docs", "style", "refactor", "perf", "test", "chore", "ci"].map((t) => ({ value: t, label: t }))} />
          <input defaultValue={scope} onChange={(e) => setOptions({ ...options, scope: e.target.value })} placeholder="scope (optional)" className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm" />
          <input defaultValue={desc} onChange={(e) => setOptions({ ...options, desc: e.target.value })} placeholder="short description" className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm" />
          <label className="text-xs flex items-center gap-1"><input type="checkbox" checked={o.breaking === "true"} onChange={(e) => setOptions({ ...options, breaking: String(e.target.checked) })} /> breaking change</label>
        </div>
        <pre className="rounded-2xl border border-border bg-background p-4 text-sm font-mono">{commit}</pre>
      </div>
    );
  },
};

const changelogGenerator: ToolDefinition = {
  slug: "changelog-generator",
  mode: "text",
  placeholder: "Paste commit messages (one per line)…",
  transform: ({ input }) => {
    const commits = input.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const groups: Record<string, string[]> = { feat: [], fix: [], perf: [], refactor: [], docs: [], chore: [], other: [] };
    for (const c of commits) {
      const m = /^(\w+)(?:\([^)]*\))?!?:\s*(.+)$/.exec(c);
      if (m) {
        const type = (m[1] in groups ? m[1] : "other") as keyof typeof groups;
        groups[type].push(`- ${m[2]}${c.includes("!") ? " (**BREAKING**)" : ""}`);
      } else {
        groups.other.push(`- ${c}`);
      }
    }
    const labels: Record<string, string> = { feat: "Added", fix: "Fixed", perf: "Performance", refactor: "Changed", docs: "Documentation", chore: "Maintenance", other: "Other" };
    const out = [`## [${new Date().toISOString().slice(0, 10)}]`, ""];
    for (const [k, items] of Object.entries(groups)) if (items.length) out.push(`### ${labels[k]}`, items.join("\n"), "");
    return { output: out.join("\n") };
  },
};

const licensePicker: ToolDefinition = {
  slug: "license-picker",
  mode: "custom",
  customRenderer: ({ options, setOptions }) => {
    const license = String(options.license ?? "MIT");
    const year = new Date().getFullYear();
    const author = String(options.author ?? "Your Name");
    const texts: Record<string, string> = {
      MIT: `MIT License\n\nCopyright (c) ${year} ${author}\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...`,
      Apache: `Apache License 2.0\n\nCopyright ${year} ${author}\n\nLicensed under the Apache License, Version 2.0...`,
      GPL: `GNU General Public License v3.0\n\nCopyright (C) ${year} ${author}\n\nThis program is free software: you can redistribute it and/or modify...`,
      BSD: `BSD 3-Clause License\n\nCopyright (c) ${year} ${author}\nAll rights reserved...`,
      Unlicense: `This is free and unencumbered software released into the public domain.\n\nAnyone is free to copy, modify, publish, use, compile, sell, or distribute this software...`,
    };
    return (
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
          <OptSelect value={license} onChange={(v) => setOptions({ ...options, license: v })} options={["MIT", "Apache", "GPL", "BSD", "Unlicense"].map((l) => ({ value: l, label: l }))} />
          <input defaultValue={author} onChange={(e) => setOptions({ ...options, author: e.target.value })} placeholder="Copyright holder" className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm" />
        </div>
        <pre className="rounded-2xl border border-border bg-background p-4 text-xs font-mono whitespace-pre-wrap overflow-auto max-h-80">{texts[license]}</pre>
      </div>
    );
  },
};

const readmeGenerator: ToolDefinition = {
  slug: "readme-generator",
  mode: "custom",
  customRenderer: ({ options, setOptions }) => {
    const o = options as Record<string, string>;
    const md = `# ${o.name ?? "Project Name"}\n\n${o.desc ?? "A short description."}\n\n## Features\n\n- \n- \n\n## Installation\n\n\`\`\`bash\nnpm install ${o.name?.toLowerCase() ?? "project"}\n\`\`\`\n\n## Usage\n\n\`\`\`js\nimport { } from '${o.name?.toLowerCase() ?? "project"}';\n\`\`\`\n\n## License\n\n${o.license ?? "MIT"} © ${new Date().getFullYear()} ${o.author ?? "Your Name"}\n`;
    return (
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
          <input defaultValue={o.name ?? ""} onChange={(e) => setOptions({ ...options, name: e.target.value })} placeholder="Project name" className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm" />
          <input defaultValue={o.desc ?? ""} onChange={(e) => setOptions({ ...options, desc: e.target.value })} placeholder="Description" className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm" />
          <input defaultValue={o.author ?? ""} onChange={(e) => setOptions({ ...options, author: e.target.value })} placeholder="Author" className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm" />
        </div>
        <pre className="rounded-2xl border border-border bg-background p-4 text-xs font-mono whitespace-pre-wrap overflow-auto max-h-80">{md}</pre>
      </div>
    );
  },
};

const badgeGenerator: ToolDefinition = {
  slug: "badge-generator",
  mode: "custom",
  customRenderer: ({ options, setOptions }) => {
    const o = options as Record<string, string>;
    const label = o.label ?? "build";
    const status = o.status ?? "passing";
    const color = o.color ?? "brightgreen";
    const url = `https://img.shields.io/badge/${encodeURIComponent(label)}-${encodeURIComponent(status)}-${color}`;
    return (
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <div className="grid sm:grid-cols-3 gap-2">
          <input defaultValue={label} onChange={(e) => setOptions({ ...options, label: e.target.value })} placeholder="label" className="h-8 rounded-md border border-input bg-background px-2 text-sm" />
          <input defaultValue={status} onChange={(e) => setOptions({ ...options, status: e.target.value })} placeholder="status" className="h-8 rounded-md border border-input bg-background px-2 text-sm" />
          <input defaultValue={color} onChange={(e) => setOptions({ ...options, color: e.target.value })} placeholder="color" className="h-8 rounded-md border border-input bg-background px-2 text-sm" />
        </div>
        <img src={url} alt={label} className="h-6" />
        <pre className="text-xs font-mono bg-background p-2 rounded-md">{`![${label}](${url})`}</pre>
      </div>
    );
  },
};

const packageNameChecker: ToolDefinition = {
  slug: "package-name-checker",
  mode: "text",
  placeholder: "npm package name…",
  transform: ({ input }) => {
    const name = input.trim();
    const issues: string[] = [];
    if (!/^[a-z0-9][a-z0-9._-]*$/i.test(name)) issues.push("✗ Invalid characters (use lowercase, digits, . _ -)");
    if (name.length > 214) issues.push("✗ Longer than 214 chars");
    if (name.startsWith(".") || name.startsWith("_")) issues.push("⚠ Cannot start with . or _");
    if (/[A-Z]/.test(name)) issues.push("ℹ Contains uppercase — npm names are lowercase by convention");
    return { output: issues.length ? issues.join("\n") : "✓ Name looks valid", info: "(client-side rules only; check npmjs.com for availability)" };
  },
};

const diffChecker: ToolDefinition = {
  slug: "diff-checker",
  mode: "dual",
  transform: ({ input, secondInput }) => diffLines(input.split(/\r?\n/), (secondInput ?? "").split(/\r?\n/)),
};

const codeCompareTool: ToolDefinition = { ...diffChecker, slug: "code-compare-tool" };

function diffLines(a: string[], b: string[]) {
  const out: string[] = [];
  const max = Math.max(a.length, b.length);
  for (let i = 0; i < max; i++) {
    if (a[i] === b[i]) out.push(`  ${a[i] ?? ""}`);
    else {
      if (a[i] !== undefined) out.push(`- ${a[i]}`);
      if (b[i] !== undefined) out.push(`+ ${b[i]}`);
    }
  }
  return { output: out.join("\n"), info: `${a.length} ↔ ${b.length} lines` };
}

const wordDiffTool: ToolDefinition = {
  slug: "word-diff-tool",
  mode: "dual",
  transform: ({ input, secondInput }) => {
    const aw = input.split(/\s+/);
    const bw = (secondInput ?? "").split(/\s+/);
    const max = Math.max(aw.length, bw.length);
    const out: string[] = [];
    for (let i = 0; i < max; i++) {
      if (aw[i] === bw[i]) out.push(aw[i] ?? "");
      else {
        if (aw[i]) out.push(`[-${aw[i]}-]`);
        if (bw[i]) out.push(`{+${bw[i]}+}`);
      }
    }
    return { output: out.join(" ") };
  },
};

const diffMergeTool: ToolDefinition = {
  slug: "diff-merge-tool",
  mode: "dual",
  transform: ({ input, secondInput }) => {
    const a = new Set(input.split(/\r?\n/));
    const b = (secondInput ?? "").split(/\r?\n/);
    const merged = [...input.split(/\r?\n/), ...b.filter((l) => !a.has(l))];
    return { output: merged.join("\n"), info: "Lines from both inputs, deduplicated" };
  },
};

export const gitTools: ToolDefinition[] = [
  gitignoreGenerator, commitMessageFormatter, semanticVersionGenerator, envFormatter,
  branchNameGenerator, conventionalCommitBuilder, changelogGenerator, licensePicker,
  readmeGenerator, badgeGenerator, packageNameChecker, diffChecker, codeCompareTool,
  wordDiffTool, diffMergeTool,
];
