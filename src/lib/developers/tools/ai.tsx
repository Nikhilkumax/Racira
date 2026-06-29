import type { ToolDefinition } from "@/components/developers/tools/registry";
import { OptionsBar, OptSelect } from "@/components/developers/tools/options-controls";

const aiPromptFormatter: ToolDefinition = {
  slug: "ai-prompt-formatter",
  mode: "text",
  live: true,
  placeholder: "Paste your AI prompt to clean and format…",
  transform: ({ input }) => {
    if (!input.trim()) return { output: "" };
    // Clean up the prompt: normalize whitespace, add structure
    let cleaned = input.trim();
    // Remove excessive blank lines
    cleaned = cleaned.replace(/\n{3,}/g, "\n\n");
    // Trim trailing spaces on each line
    cleaned = cleaned
      .split("\n")
      .map((l) => l.trimEnd())
      .join("\n");
    // Detect if it has sections already
    const hasRole = /^#\s*(?:system|role|context|instruction)/im.test(cleaned);
    const formatted: string[] = [];
    if (!hasRole && cleaned.length > 200) {
      formatted.push("# Context");
      formatted.push("");
    }
    formatted.push(cleaned);
    const output = formatted.join("\n");
    const wordCount = cleaned.split(/\s+/).length;
    return {
      output,
      info: `${wordCount} words, ${cleaned.length} characters`,
    };
  },
};

const logFormatter: ToolDefinition = {
  slug: "log-formatter",
  mode: "text",
  live: true,
  placeholder: "Paste log output to format and highlight…",
  defaultOptions: { format: "structured" },
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptSelect
        value={String(options.format ?? "structured")}
        onChange={(v) => setOptions({ ...options, format: v })}
        options={[
          { value: "structured", label: "Structured" },
          { value: "timeline", label: "Timeline" },
          { value: "errors-only", label: "Errors Only" },
        ]}
      />
    </OptionsBar>
  ),
  transform: ({ input, options }) => {
    if (!input.trim()) return { output: "" };
    const format = String(options.format ?? "structured");
    const lines = input.split("\n");
    let result = "";

    if (format === "errors-only") {
      const errors = lines.filter(
        (l) =>
          /\b(ERROR|ERR|FATAL|SEVERE|FAIL|Exception|Traceback|panic)\b/i.test(l),
      );
      result = errors.length ? errors.join("\n") : "No errors found in log.";
      return { output: result, info: `${errors.length} error lines found` };
    }

    if (format === "timeline") {
      result = lines
        .map((l) => {
          // Extract timestamps if present
          const ts = l.match(
            /(\d{4}[-/]\d{2}[-/]\d{2}[\sT]\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?)/,
          );
          const level = l.match(/\b(INFO|WARN|ERROR|DEBUG|TRACE)\b/i)?.[1];
          if (!ts && !level) return l;
          const tag = level ? `[${level.padEnd(5)}]` : "[     ]";
          return `${ts ? ts[1] : "—".repeat(23)} ${tag} ${l}`;
        })
        .join("\n");
    } else {
      // structured: clean up and align log levels
      result = lines
        .map((l) => {
          const cleaned = l.replace(/^\s*\[[\d.]+\]\s*/, "").replace(/^\s*/, "");
          const level = l.match(/\b(INFO|WARN(?:ING)?|ERROR|DEBUG|TRACE|FATAL)\b/i)?.[1];
          if (level) {
            const tag = level.toUpperCase().padEnd(7);
            return `[${tag}] ${cleaned}`;
          }
          return cleaned;
        })
        .join("\n");
    }

    const levelCounts: Record<string, number> = {};
    for (const l of lines) {
      const m = l.match(/\b(INFO|WARN|ERROR|DEBUG|TRACE|FATAL)\b/i);
      if (m) {
        const k = m[1].toUpperCase();
        levelCounts[k] = (levelCounts[k] ?? 0) + 1;
      }
    }
    const summary = Object.entries(levelCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
    return { output: result, info: summary || `${lines.length} log lines` };
  },
};

const apiResponseVisualizer: ToolDefinition = {
  slug: "api-response-visualizer",
  mode: "text",
  live: true,
  placeholder: "Paste a JSON API response to visualize…",
  transform: ({ input }) => {
    if (!input.trim()) return { output: "" };
    try {
      const parsed = JSON.parse(input);
      const pretty = JSON.stringify(parsed, null, 2);
      // Build a summary
      const summary: string[] = [];
      if (typeof parsed === "object" && parsed !== null) {
        if (Array.isArray(parsed)) {
          summary.push(`Array with ${parsed.length} items`);
          if (parsed.length > 0 && typeof parsed[0] === "object") {
            const keys = Object.keys(parsed[0]);
            summary.push(`First item keys: ${keys.join(", ")}`);
          }
        } else {
          const keys = Object.keys(parsed);
          summary.push(`Object with ${keys.length} keys`);
          summary.push(`Keys: ${keys.join(", ")}`);
          // Check for nested structures
          for (const key of keys.slice(0, 10)) {
            const val = parsed[key];
            if (Array.isArray(val)) summary.push(`  ${key}: Array[${val.length}]`);
            else if (typeof val === "object" && val !== null) summary.push(`  ${key}: Object{${Object.keys(val).length}}`);
            else summary.push(`  ${key}: ${typeof val}`);
          }
        }
      } else {
        summary.push(`Type: ${typeof parsed}`);
      }
      return {
        output: pretty,
        html: `<div style="font-family:monospace;font-size:13px;padding:12px;white-space:pre-wrap;color:#e2e8f0;background:#1e1e2e;border-radius:8px;min-height:200px;"><strong style="color:#89b4fa;">📊 Response Summary</strong>\n\n${summary.map(s => `<span style="color:#a6e3a1;">${s}</span>`).join("\n")}\n\n<strong style="color:#89b4fa;">📄 Full Response</strong>\n${pretty.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</div>`,
        info: summary.join(" | "),
      };
    } catch {
      // Not JSON — just show raw
      return {
        output: input,
        info: `${input.length} chars (not valid JSON)`,
      };
    }
  },
};

export const aiTools: ToolDefinition[] = [aiPromptFormatter, logFormatter, apiResponseVisualizer];
