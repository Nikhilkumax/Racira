"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ToolDefinition, ToolResult } from "@/components/developers/tools/registry";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Eraser,
  Download,
  Upload,
  Play,
  AlertTriangle,
  Check,
  ArrowLeft,
} from "lucide-react";
import { ToolCard } from "@/components/developers/tool-card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ToolShellProps {
  tool: ToolDefinition;
  toolMeta: { name: string; description: string; icon: React.ComponentType<{ className?: string }> };
  categoryName: string;
  relatedTools: { name: string; slug: string; description: string; category: string; icon: React.ComponentType<{ className?: string }> }[];
}

const EMPTY: ToolResult = { output: "" };

export function ToolShell({ tool, toolMeta, categoryName, relatedTools }: ToolShellProps) {
  const Icon = toolMeta.icon;
  const [input, setInput] = useState("");
  const [secondInput, setSecondInput] = useState("");
  const [options, setOptions] = useState<Record<string, unknown>>(
    tool.defaultOptions ?? {},
  );
  const [result, setResult] = useState<ToolResult>(EMPTY);
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const live = tool.live !== false;
  const isGenerator = tool.mode === "generator";
  const isCustom = tool.mode === "custom";

  const run = useCallback(async () => {
    if (!tool.transform) {
      setResult(EMPTY);
      return;
    }
    setRunning(true);
    try {
      const out = await tool.transform({ input, secondInput, options });
      setResult(out ?? EMPTY);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setResult({ output: "", error: message });
    } finally {
      setRunning(false);
    }
  }, [tool, input, secondInput, options]);

  // Live mode: debounce computation. Generators run once on mount.
  const firstRun = useRef(true);
  useEffect(() => {
    if (isGenerator) {
      if (firstRun.current) {
        firstRun.current = false;
        run();
      }
      return;
    }
    if (isCustom || !live) return;
    const t = setTimeout(run, 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, secondInput, options, live, isGenerator, isCustom]);

  const onRunClick = () => run();

  const copyOutput = async () => {
    const text = result.output ?? "";
    if (!text && !result.html) {
      toast.error("Nothing to copy");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy");
    }
  };

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setInput(String(reader.result ?? ""));
      toast.success(`Loaded ${file.name}`);
    };
    if (tool.readAs === "dataurl") reader.readAsDataURL(file);
    else reader.readAsText(file);
    e.target.value = "";
  };

  const download = () => {
    const text = result.output ?? "";
    if (!text && !result.html) {
      toast.error("Nothing to download");
      return;
    }
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tool.slug}-output.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const Options = tool.options;
  const CustomRenderer = tool.customRenderer;
  const showInput = !isGenerator && !tool.hideInput;
  const showSecondInput = tool.mode === "dual";
  const hasOutput = Boolean(result.output || result.html || result.data);
  const isTextOut = tool.mode === "text" || isGenerator || tool.mode === "dual";
  const isTableOut = tool.mode === "table" && Array.isArray(result.data);

  return (
    <div className="racira-page-container py-8 lg:py-12">
      <Link href="/developers" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> All tools
      </Link>

      <div className="mt-2 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{toolMeta.name}</h1>
          <p className="mt-1.5 text-muted-foreground max-w-2xl">{toolMeta.description}</p>
        </div>
      </div>

      {Options && (
        <div className="mt-6">
          <Options options={options} setOptions={setOptions} />
        </div>
      )}

      {isCustom && CustomRenderer ? (
        <div className="mt-8">
          <CustomRenderer
            input={input}
            setInput={setInput}
            options={options}
            setOptions={setOptions}
          />
        </div>
      ) : (
        <div
          className="mt-8 rounded-2xl border border-border bg-card overflow-hidden"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <div
            className={cn(
              "grid divide-y md:divide-y-0 divide-border",
              showSecondInput
                ? "md:grid-cols-3 md:divide-x"
                : showInput
                  ? "md:grid-cols-2 md:divide-x"
                  : "grid-cols-1",
            )}
          >
            {showInput && (
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {tool.inputLabel ?? "Input"}
                  </span>
                  <div className="flex items-center gap-1">
                    <label className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer" aria-label="Upload">
                      <Upload className="h-3.5 w-3.5" />
                      <input type="file" className="hidden" accept={tool.accept} onChange={onUpload} />
                    </label>
                    <button
                      onClick={() => { setInput(""); setResult(EMPTY); }}
                      className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent"
                      aria-label="Clear input"
                    >
                      <Eraser className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={tool.placeholder ?? `Paste your input for ${toolMeta.name} here…`}
                  className="w-full h-72 lg:h-96 resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-mono outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20 transition"
                />
              </div>
            )}

            {showSecondInput && (
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Second input
                  </span>
                  <button
                     onClick={() => setSecondInput("")}
                    className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent"
                    aria-label="Clear"
                  >
                    <Eraser className="h-3.5 w-3.5" />
                  </button>
                </div>
                <textarea
                  value={secondInput}
                  onChange={(e) => setSecondInput(e.target.value)}
                  placeholder="Paste the second input…"
                  className="w-full h-72 lg:h-96 resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-mono outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20 transition"
                />
              </div>
            )}

            <div className="p-4 sm:p-5 bg-muted/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {tool.outputLabel ?? "Output"}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={copyOutput}
                    className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent"
                    aria-label="Copy output"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={download}
                    className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent"
                    aria-label="Download"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <OutputPanel
                result={result}
                running={running}
                hasInput={Boolean(input)}
                isTextOut={isTextOut}
                isTableOut={isTableOut}
                outputLabel={toolMeta.name}
              />
            </div>
          </div>

          <div className="border-t border-border px-4 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-2 bg-muted/20">
            <div className="text-xs text-muted-foreground">
              Runs entirely in your browser. No data leaves your device.
            </div>
            <div className="flex items-center gap-2">
              {(showInput || showSecondInput) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setInput(""); setSecondInput(""); setResult(EMPTY); }}
                >
                  <Eraser className="h-4 w-4" />
                  Reset
                </Button>
              )}
              {isGenerator && (
                <Button size="sm" onClick={onRunClick} disabled={running}>
                  <Play className="h-4 w-4" />
                  Generate
                </Button>
              )}
              {!isGenerator && !live && (
                <Button size="sm" onClick={onRunClick} disabled={running}>
                  <Play className="h-4 w-4" />
                  Run
                </Button>
              )}
              {isGenerator && (
                <Button size="sm" variant="outline" onClick={onRunClick} disabled={running}>
                  <Play className="h-4 w-4" />
                  Regenerate
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {relatedTools.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-bold mb-4">More in {categoryName}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {relatedTools.map((t) => (
              <ToolCard key={t.slug} tool={t as never} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function OutputPanel({
  result,
  running,
  hasInput,
  isTextOut,
  isTableOut,
  outputLabel,
}: {
  result: ToolResult;
  running: boolean;
  hasInput: boolean;
  isTextOut: boolean;
  isTableOut: boolean;
  outputLabel: string;
}) {
  if (result.error) {
    return (
      <div className="w-full h-72 lg:h-96 rounded-xl border border-destructive/40 bg-destructive/5 px-3 py-2.5 overflow-auto text-sm font-mono text-destructive flex gap-2">
        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
        <pre className="whitespace-pre-wrap break-words">{result.error}</pre>
      </div>
    );
  }
  if (running) {
    return (
      <div className="w-full h-72 lg:h-96 rounded-xl border border-dashed border-border bg-background flex items-center justify-center text-sm text-muted-foreground">
        Computing…
      </div>
    );
  }
  if (isTextOut && result.html) {
    return (
      <div
        className="w-full h-72 lg:h-96 rounded-xl border border-border bg-background px-3 py-2.5 overflow-auto text-sm"
        dangerouslySetInnerHTML={{ __html: result.html }}
      />
    );
  }
  if (isTextOut && result.output) {
    return (
      <pre className="w-full h-72 lg:h-96 rounded-xl border border-border bg-background px-3 py-2.5 overflow-auto text-sm font-mono whitespace-pre-wrap break-words">
        {result.output}
      </pre>
    );
  }
  if (isTableOut) {
    return <TableOut data={result.data as Record<string, unknown>[]} />;
  }
  return (
    <div className="w-full h-72 lg:h-96 rounded-xl border border-dashed border-border bg-background flex items-center justify-center text-sm text-muted-foreground">
      {hasInput ? `Output for ${outputLabel} will appear here` : "Enter input to see results"}
    </div>
  );
}

function TableOut({ data }: { data: Record<string, unknown>[] }) {
  const columns = useMemo(() => {
    const set = new Set<string>();
    for (const row of data) Object.keys(row).forEach((k) => set.add(k));
    return Array.from(set);
  }, [data]);
  if (!data.length) return null;
  return (
    <div className="w-full h-72 lg:h-96 rounded-xl border border-border bg-background overflow-auto">
      <table className="w-full text-xs">
        <thead className="sticky top-0 bg-muted">
          <tr>
            {columns.map((c) => (
              <th key={c} className="text-left px-3 py-2 font-semibold border-b border-border whitespace-nowrap">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-accent/40">
              {columns.map((c) => (
                <td key={c} className="px-3 py-1.5 border-b border-border/50 align-top font-mono">
                  {formatCell(row[c])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatCell(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}
