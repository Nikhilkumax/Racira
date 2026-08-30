"use client";

import { useState, useCallback } from "react";
import { Upload, Loader2, ArrowLeftRight, FileText } from "lucide-react";

type ToolState = "idle" | "loading" | "comparing" | "done" | "error";

interface PageComparison {
  leftPage: number;
  rightPage: number;
  status: "match" | "changed" | "left-only" | "right-only";
  leftText: string;
  rightText: string;
  addedLines: string[];
  removedLines: string[];
}

interface ComparisonResult {
  leftName: string;
  rightName: string;
  leftPages: number;
  rightPages: number;
  matchedPairs: number;
  changedPairs: number;
  onlyInLeft: number;
  onlyInRight: number;
  comparisons: PageComparison[];
}

// Text normalization for comparison (from Bento's compare engine)
function normalizeText(text: string): string {
  return text
    .normalize("NFKC")
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, " ")
    .replace(/[\u{E000}-\u{F8FF}]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function textLines(text: string): string[] {
  return text.split("\n").filter((l) => l.trim().length > 0);
}

function diffLines(left: string[], right: string[]): { added: string[]; removed: string[] } {
  const leftSet = new Set(left);
  const rightSet = new Set(right);
  const added = right.filter((l) => !leftSet.has(l));
  const removed = left.filter((l) => !rightSet.has(l));
  return { added, removed };
}

async function extractText(
  file: File
): Promise<{ pages: string[]; pageCount: number }> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

  const buffer = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: buffer }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .filter((item: any) => typeof item.str === "string")
      .map((item: any) => item.str)
      .join(" ");
    pages.push(normalizeText(text));
  }

  return { pages, pageCount: doc.numPages };
}

function pairPages(
  leftPages: string[],
  rightPages: string[]
): { leftIdx: number; rightIdx: number; confidence: number }[] {
  // Simple positional pairing: match by index, handle different page counts
  const pairs: { leftIdx: number; rightIdx: number; confidence: number }[] = [];
  const maxLen = Math.max(leftPages.length, rightPages.length);

  for (let i = 0; i < maxLen; i++) {
    const leftIdx = i < leftPages.length ? i : -1;
    const rightIdx = i < rightPages.length ? i : -1;

    if (leftIdx >= 0 && rightIdx >= 0) {
      // Simple Jaccard similarity for confidence
      const leftTokens = new Set(leftPages[leftIdx].split(/\s+/));
      const rightTokens = new Set(rightPages[rightIdx].split(/\s+/));
      const union = new Set([...leftTokens, ...rightTokens]);
      let intersection = 0;
      leftTokens.forEach((t) => { if (rightTokens.has(t)) intersection++; });
      const confidence = union.size === 0 ? 1 : intersection / union.size;
      pairs.push({ leftIdx, rightIdx, confidence });
    } else if (leftIdx >= 0) {
      pairs.push({ leftIdx, rightIdx: -1, confidence: 0 });
    } else {
      pairs.push({ leftIdx: -1, rightIdx, confidence: 0 });
    }
  }

  return pairs;
}

export default function ComparePdfsTool() {
  const [state, setState] = useState<ToolState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [leftFile, setLeftFile] = useState<File | null>(null);
  const [rightFile, setRightFile] = useState<File | null>(null);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [selectedPair, setSelectedPair] = useState<number>(0);

  const handleCompare = useCallback(async () => {
    if (!leftFile || !rightFile) return;
    setState("comparing");

    try {
      const [leftData, rightData] = await Promise.all([
        extractText(leftFile),
        extractText(rightFile),
      ]);

      const pairs = pairPages(leftData.pages, rightData.pages);
      const comparisons: PageComparison[] = pairs.map((pair) => {
        const leftText = pair.leftIdx >= 0 ? leftData.pages[pair.leftIdx] : "";
        const rightText = pair.rightIdx >= 0 ? rightData.pages[pair.rightIdx] : "";

        if (pair.leftIdx < 0) {
          return {
            leftPage: 0,
            rightPage: pair.rightIdx + 1,
            status: "right-only",
            leftText: "",
            rightText,
            addedLines: textLines(rightText),
            removedLines: [],
          };
        }
        if (pair.rightIdx < 0) {
          return {
            leftPage: pair.leftIdx + 1,
            rightPage: 0,
            status: "left-only",
            leftText,
            rightText: "",
            addedLines: [],
            removedLines: textLines(leftText),
          };
        }

        const leftLines = textLines(leftText);
        const rightLines = textLines(rightText);
        const { added, removed } = diffLines(leftLines, rightLines);

        let status: "match" | "changed" = "match";
        if (added.length > 0 || removed.length > 0) status = "changed";

        return {
          leftPage: pair.leftIdx + 1,
          rightPage: pair.rightIdx + 1,
          status,
          leftText,
          rightText,
          addedLines: added,
          removedLines: removed,
        };
      });

      const matchedPairs = comparisons.filter((c) => c.status === "match").length;
      const changedPairs = comparisons.filter((c) => c.status === "changed").length;
      const onlyInLeft = comparisons.filter((c) => c.status === "left-only").length;
      const onlyInRight = comparisons.filter((c) => c.status === "right-only").length;

      setResult({
        leftName: leftFile.name,
        rightName: rightFile.name,
        leftPages: leftData.pageCount,
        rightPages: rightData.pageCount,
        matchedPairs,
        changedPairs,
        onlyInLeft,
        onlyInRight,
        comparisons,
      });
      setState("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Comparison failed");
      setState("error");
    }
  }, [leftFile, rightFile]);

  const handleReset = useCallback(() => {
    setLeftFile(null);
    setRightFile(null);
    setResult(null);
    setError(null);
    setSelectedPair(0);
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

  if (state === "comparing") {
    return (
      <div data-state="comparing" className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400 mb-4" />
        <p className="text-muted-foreground">Comparing PDFs…</p>
      </div>
    );
  }

  if (state === "done" && result) {
    const currentComp = result.comparisons[selectedPair];
    return (
      <div data-state="done" className="w-full max-w-4xl mx-auto py-6 space-y-6">
        {/* Summary */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="text-lg font-semibold text-foreground mb-2">Comparison Results</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{result.matchedPairs}</div>
              <div className="text-muted-foreground">Unchanged</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">{result.changedPairs}</div>
              <div className="text-muted-foreground">Changed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{result.onlyInRight}</div>
              <div className="text-muted-foreground">Added</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{result.onlyInLeft}</div>
              <div className="text-muted-foreground">Removed</div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {result.leftName} ({result.leftPages} pages) vs {result.rightName} ({result.rightPages} pages)
          </p>
        </div>

        {/* Page navigator */}
        <div className="flex gap-2 flex-wrap">
          {result.comparisons.map((comp, i) => {
            const color =
              comp.status === "match" ? "bg-green-600" :
              comp.status === "changed" ? "bg-amber-600" :
              comp.status === "right-only" ? "bg-blue-600" :
              "bg-red-600";
            return (
              <button
                key={i}
                onClick={() => setSelectedPair(i)}
                className={`w-8 h-8 rounded text-xs font-medium text-white ${color} ${
                  i === selectedPair ? "ring-2 ring-white" : "opacity-70 hover:opacity-100"
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        {/* Side-by-side diff */}
        {currentComp && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-sm font-medium text-foreground mb-2">
                {currentComp.leftPage > 0 ? `Page ${currentComp.leftPage}` : "—"}
                <span className="text-muted-foreground ml-2">({result.leftName})</span>
              </h3>
              <div className="text-xs font-mono overflow-auto max-h-96 space-y-0.5">
                {currentComp.leftText ? (
                  textLines(currentComp.leftText).map((line, i) => {
                    const isRemoved = currentComp.removedLines.includes(line);
                    return (
                      <div key={i} className={isRemoved ? "bg-red-900/30 text-red-300 px-1" : "text-muted-foreground px-1"}>
                        {line}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-muted-foreground italic">Page not in left document</div>
                )}
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-sm font-medium text-foreground mb-2">
                {currentComp.rightPage > 0 ? `Page ${currentComp.rightPage}` : "—"}
                <span className="text-muted-foreground ml-2">({result.rightName})</span>
              </h3>
              <div className="text-xs font-mono overflow-auto max-h-96 space-y-0.5">
                {currentComp.rightText ? (
                  textLines(currentComp.rightText).map((line, i) => {
                    const isAdded = currentComp.addedLines.includes(line);
                    return (
                      <div key={i} className={isAdded ? "bg-green-900/30 text-green-300 px-1" : "text-muted-foreground px-1"}>
                        {line}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-muted-foreground italic">Page not in right document</div>
                )}
              </div>
            </div>
          </div>
        )}

        <button onClick={handleReset} className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-sm rounded-lg">← Compare Another Pair</button>
      </div>
    );
  }

  // idle
  return (
    <div data-state="idle" className="flex flex-col items-center justify-start py-8">
      <div className="bg-card rounded-xl shadow-xl px-6 py-8 max-w-2xl w-full border border-border">
        <h2 className="text-2xl font-bold text-foreground mb-2">Compare PDFs</h2>
        <p className="text-muted-foreground mb-6">Upload two PDFs to compare their text content side by side.</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Left file */}
          <div
            className={`relative flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
              leftFile ? "border-green-500 bg-green-500/5" : "border-border hover:border-indigo-500 hover:bg-muted/50"
            }`}
            onDrop={(e) => { e.preventDefault(); if (e.dataTransfer?.files?.[0]) setLeftFile(e.dataTransfer.files[0]); }}
            onDragOver={(e) => e.preventDefault()}
          >
            {leftFile ? (
              <div className="text-center px-2">
                <FileText className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground truncate">{leftFile.name}</p>
                <p className="text-xs text-muted-foreground">{(leftFile.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="h-8 w-8 text-muted-foreground mb-2 mx-auto" />
                <p className="text-xs text-muted-foreground">Original PDF</p>
              </div>
            )}
            <input
              type="file"
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              accept=".pdf"
              onChange={(e) => { if (e.target.files?.[0]) setLeftFile(e.target.files[0]); }}
            />
          </div>

          {/* Right file */}
          <div
            className={`relative flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
              rightFile ? "border-green-500 bg-green-500/5" : "border-border hover:border-indigo-500 hover:bg-muted/50"
            }`}
            onDrop={(e) => { e.preventDefault(); if (e.dataTransfer?.files?.[0]) setRightFile(e.dataTransfer.files[0]); }}
            onDragOver={(e) => e.preventDefault()}
          >
            {rightFile ? (
              <div className="text-center px-2">
                <FileText className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground truncate">{rightFile.name}</p>
                <p className="text-xs text-muted-foreground">{(rightFile.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="h-8 w-8 text-muted-foreground mb-2 mx-auto" />
                <p className="text-xs text-muted-foreground">Modified PDF</p>
              </div>
            )}
            <input
              type="file"
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              accept=".pdf"
              onChange={(e) => { if (e.target.files?.[0]) setRightFile(e.target.files[0]); }}
            />
          </div>
        </div>

        <button
          onClick={handleCompare}
          disabled={!leftFile || !rightFile}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-muted disabled:text-muted-foreground text-white rounded-lg font-medium transition-colors"
        >
          <ArrowLeftRight className="h-4 w-4" /> Compare PDFs
        </button>
      </div>
    </div>
  );
}
