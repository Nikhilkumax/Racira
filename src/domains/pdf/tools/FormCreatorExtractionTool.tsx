"use client";

import { useState, useCallback } from "react";
import { Upload, Loader2, FileText, Table2 } from "lucide-react";
import type { ExtractedField } from "@/lib/pdf/form-creator-extraction";

type ToolState = "idle" | "loading" | "loaded" | "error";

export default function FormCreatorExtractionTool() {
  const [state, setState] = useState<ToolState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [fields, setFields] = useState<ExtractedField[]>([]);
  const [fieldCount, setFieldCount] = useState(0);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a PDF file.");
      setState("error");
      return;
    }

    setFileName(file.name);
    setError(null);
    setState("loading");

    try {
      const { extractFormFields } = await import("@/lib/pdf/form-creator-extraction");
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const result = await extractFormFields(bytes);
      setFields(result.fields);
      setFieldCount(result.fields.length);
      setState("loaded");
    } catch (e) {
      console.error("Form field extraction failed:", e);
      setError(e instanceof Error ? e.message : "Failed to extract form fields");
      setState("error");
    }
  }, []);

  const handleReset = useCallback(() => {
    setFileName("");
    setFields([]);
    setFieldCount(0);
    setError(null);
    setState("idle");
  }, []);

  if (state === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={handleReset} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">Try Again</button>
      </div>
    );
  }

  if (state === "loading") {
    return (
      <div data-state="loading" className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400 mb-4" />
        <p className="text-muted-foreground">Extracting form fields…</p>
      </div>
    );
  }

  if (state === "loaded") {
    const fieldTypes = [...new Set(fields.map(f => f.type))];
    return (
      <div data-state="loaded" className="w-full max-w-4xl mx-auto py-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Form Field Extraction</h2>
            <p className="text-sm text-muted-foreground">{fileName} · {fieldCount} field{fieldCount !== 1 ? "s" : ""} found</p>
          </div>
          <div className="flex gap-2">
            {fieldTypes.map(t => (
              <span key={t} className="px-2 py-0.5 text-xs bg-indigo-900/30 text-indigo-300 rounded-full border border-indigo-800">
                {t}
              </span>
            ))}
          </div>
        </div>

        {fieldCount === 0 ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No interactive form fields found in this PDF.</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card border-b border-border">
                  <tr className="text-left text-muted-foreground">
                    <th className="px-4 py-2 font-medium">#</th>
                    <th className="px-4 py-2 font-medium">Name</th>
                    <th className="px-4 py-2 font-medium">Type</th>
                    <th className="px-4 py-2 font-medium">Page</th>
                    <th className="px-4 py-2 font-medium">Default</th>
                    <th className="px-4 py-2 font-medium">Required</th>
                    <th className="px-4 py-2 font-medium">Read-only</th>
                    <th className="px-4 py-2 font-medium">Tooltip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {fields.map((f, i) => (
                    <tr key={f.id} className="hover:bg-muted/50">
                      <td className="px-4 py-2 text-muted-foreground">{i + 1}</td>
                      <td className="px-4 py-2 font-mono text-xs">{f.name}</td>
                      <td className="px-4 py-2">
                        <span className="px-1.5 py-0.5 text-xs rounded bg-muted">{f.type}</span>
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">{f.pageIndex + 1}</td>
                      <td className="px-4 py-2 text-muted-foreground max-w-[120px] truncate">{f.defaultValue || "—"}</td>
                      <td className="px-4 py-2">{f.required ? "✓" : ""}</td>
                      <td className="px-4 py-2">{f.readOnly ? "✓" : ""}</td>
                      <td className="px-4 py-2 text-muted-foreground max-w-[120px] truncate">{f.tooltip || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={handleReset} className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-sm rounded-lg">← Start Over</button>
          <button
            onClick={() => {
              const json = JSON.stringify(fields, null, 2);
              const blob = new Blob([json], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = fileName.replace(/\.pdf$/i, "") + "-fields.json";
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg"
          >
            <Table2 className="h-4 w-4" /> Export as JSON
          </button>
        </div>
      </div>
    );
  }

  // idle
  return (
    <div data-state="idle" className="flex flex-col items-center justify-start py-8">
      <div className="bg-card rounded-xl shadow-xl px-6 py-8 max-w-2xl w-full border border-border">
        <h2 className="text-2xl font-bold text-foreground mb-2">Extract Form Fields</h2>
        <p className="text-muted-foreground mb-6">Extract all interactive form fields from your PDF and view them in a table.</p>
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
            <p className="text-xs text-muted-foreground">PDF with interactive form fields</p>
          </div>
          <input type="file" className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" accept=".pdf"
            onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
        </div>
      </div>
    </div>
  );
}
