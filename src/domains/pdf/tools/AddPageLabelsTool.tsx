"use client";

import { useState, useCallback } from "react";
import { Upload, Download, Loader2, Plus, Trash2 } from "lucide-react";
import { saveAs } from "file-saver";

const CPDF_CDN = 'https://cdn.jsdelivr.net/npm/coherentpdf@2.5.5/dist/';

type ToolState = "idle" | "config" | "processing" | "done" | "error";

type PageLabelStyle =
  | "DecimalArabic"
  | "LowercaseRoman"
  | "UppercaseRoman"
  | "LowercaseLetters"
  | "UppercaseLetters"
  | "NoLabelPrefixOnly";

interface LabelRule {
  id: string;
  pageRange: string;
  style: PageLabelStyle;
  prefix: string;
  startValue: number;
  progress: boolean;
}

const STYLE_OPTIONS: { value: PageLabelStyle; label: string }[] = [
  { value: "DecimalArabic", label: "Decimal Arabic (1, 2, 3)" },
  { value: "LowercaseRoman", label: "Lowercase Roman (i, ii, iii)" },
  { value: "UppercaseRoman", label: "Uppercase Roman (I, II, III)" },
  { value: "LowercaseLetters", label: "Lowercase Letters (a, b, c)" },
  { value: "UppercaseLetters", label: "Uppercase Letters (A, B, C)" },
  { value: "NoLabelPrefixOnly", label: "No Label — Prefix Only" },
];

let ruleCounter = 0;
function createRule(): LabelRule {
  ruleCounter += 1;
  return {
    id: `rule-${ruleCounter}`,
    pageRange: "",
    style: "DecimalArabic",
    prefix: "",
    startValue: 1,
    progress: false,
  };
}

export default function AddPageLabelsTool() {
  const [state, setState] = useState<ToolState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [rules, setRules] = useState<LabelRule[]>([createRule()]);
  const [removeExisting, setRemoveExisting] = useState(true);
  const [rawFile, setRawFile] = useState<File | null>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a PDF file.");
      setState("error");
      return;
    }
    setRawFile(file);
    setFileName(file.name);
    setFileSize(file.size);
    setError(null);
    setRules([createRule()]);
    setState("config");
  }, []);

  const updateRule = useCallback((id: string, field: keyof LabelRule, value: unknown) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  }, []);

  const removeRule = useCallback((id: string) => {
    setRules((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  }, []);

  const handleProcess = useCallback(async () => {
    if (!rawFile) return;
    setState("processing");

    try {
      const worker = new Worker("/workers/add-page-labels.worker.js");
      const result = await new Promise<ArrayBuffer>((resolve, reject) => {
        worker.onmessage = (e: MessageEvent) => {
          const data = e.data;
          if (data.status === "success") {
            resolve(data.pdfBytes);
          } else {
            reject(new Error(data.message || "Failed to add page labels"));
          }
          worker.terminate();
        };
        worker.onerror = (e) => {
          reject(new Error(e.message || "Worker error"));
          worker.terminate();
        };

        rawFile.arrayBuffer().then((buffer) => {
          worker.postMessage({
            cpdfUrl: CPDF_CDN + "coherentpdf.browser.min.js",
            command: "add-page-labels",
            pdfData: buffer,
            rules: rules.map((r) => ({
              pageRange: r.pageRange,
              style: r.style,
              prefix: r.prefix,
              startValue: r.startValue,
              progress: r.progress,
            })),
            removeExisting,
          });
        });
      });

      const blob = new Blob([result], { type: "application/pdf" });
      saveAs(blob, fileName || "labeled.pdf");
      setState("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add page labels");
      setState("error");
    }
  }, [rawFile, rules, removeExisting, fileName]);

  const handleReset = useCallback(() => {
    setRawFile(null);
    setFileName("");
    setFileSize(0);
    setRules([createRule()]);
    setRemoveExisting(true);
    setError(null);
    setState("idle");
  }, []);

  // ── Render ──────────────────────────────────────────────────

  if (state === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={handleReset} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">Try Again</button>
      </div>
    );
  }

  if (state === "done") {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-green-400 text-4xl mb-4">✓</div>
        <p className="text-green-300 mb-2">Page labels added successfully</p>
        <button onClick={handleReset} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">Process Another</button>
      </div>
    );
  }

  if (state === "processing") {
    return (
      <div data-state="processing" className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400 mb-4" />
        <p className="text-muted-foreground">Adding page labels…</p>
      </div>
    );
  }

  if (state === "config") {
    return (
      <div data-state="config" className="w-full max-w-2xl mx-auto py-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Add Page Labels</h2>
          <p className="text-sm text-muted-foreground">{fileName} · {(fileSize / 1024).toFixed(1)} KB</p>
        </div>

        <div className="space-y-4 bg-card border border-border rounded-lg p-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={removeExisting}
              onChange={(e) => setRemoveExisting(e.target.checked)}
              className="rounded"
            />
            Remove existing labels before adding
          </label>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">Label Rules</h3>
              <button
                onClick={() => setRules((prev) => [...prev, createRule()])}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-secondary hover:bg-secondary/80 rounded-lg"
              >
                <Plus className="h-3 w-3" /> Add Rule
              </button>
            </div>

            {rules.map((rule, index) => (
              <div key={rule.id} className="bg-background border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Rule {index + 1}</span>
                  {rules.length > 1 && (
                    <button
                      onClick={() => removeRule(rule.id)}
                      className="p-1 text-muted-foreground hover:text-red-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Page Range</label>
                    <input
                      type="text"
                      value={rule.pageRange}
                      onChange={(e) => updateRule(rule.id, "pageRange", e.target.value)}
                      placeholder="e.g. 1-5, 8 (empty = all)"
                      className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Style</label>
                    <select
                      value={rule.style}
                      onChange={(e) => updateRule(rule.id, "style", e.target.value)}
                      className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs"
                    >
                      {STYLE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Prefix</label>
                    <input
                      type="text"
                      value={rule.prefix}
                      onChange={(e) => updateRule(rule.id, "prefix", e.target.value)}
                      placeholder="e.g. Page "
                      className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Start Value</label>
                    <input
                      type="number"
                      value={rule.startValue}
                      onChange={(e) => updateRule(rule.id, "startValue", parseInt(e.target.value) || 1)}
                      min={0}
                      className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={rule.progress}
                    onChange={(e) => updateRule(rule.id, "progress", e.target.checked)}
                    className="rounded"
                  />
                  Continue numbering from previous rule
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handleReset} className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-sm rounded-lg">← Back</button>
          <button onClick={handleProcess} className="flex items-center gap-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg">
            <Download className="h-4 w-4" /> Apply Labels & Download
          </button>
        </div>
      </div>
    );
  }

  // idle
  return (
    <div data-state="idle" className="flex flex-col items-center justify-start py-8">
      <div className="bg-card rounded-xl shadow-xl px-6 py-8 max-w-2xl w-full border border-border">
        <h2 className="text-2xl font-bold text-foreground mb-2">Add Page Labels</h2>
        <p className="text-muted-foreground mb-6">Add custom page number labels to your PDF with flexible numbering styles.</p>
        <div
          className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-muted/50 transition-all"
          onDrop={(e) => { e.preventDefault(); if (e.dataTransfer?.files?.[0]) handleFile(e.dataTransfer.files[0]); }}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="mb-2 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Click to select a file</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">PDF file</p>
          </div>
          <input type="file" className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" accept=".pdf"
            onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
        </div>
      </div>
    </div>
  );
}
