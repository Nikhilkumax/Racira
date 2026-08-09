"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";
import { LazyView } from "@/components/ui/LazyView";
import { FileText, Hash, ScanText, AlertCircle, CheckCircle2, Info, Printer } from "lucide-react";

const DEFAULTS = {
  encodedInput: "SGVsbG8gV29ybGQh",
  outputFormat: "plain" as "plain" | "hex",
  showHex: false,
  showUtf8Analysis: false,
  showAdvanced: false,
};

interface Base64DecoderResult {
  decodedText: string;
  hexView: string;
  byteCount: number;
  charCount: number;
  lineCount: number;
  wordCount: number;
  encoding: string;
  hasPadding: boolean;
  paddingCount: number;
  chartData: { char: string; count: number; isAlphanumeric: boolean }[];
  byteBreakdown: { byte: number; char: string; type: string }[];
  uniqueChars: number;
  isUrlSafe: boolean;
  originalLength: number;
  isValid: boolean;
  error?: string;
  entropy: number;
  compressionRatio: number;
  printableRatio: number;
  asciiOnly: boolean;
  maxCharFrequency: number;
  controlCharCount: number;
  nullByteCount: number;
  highBytesCount: number;
}

function isBase64Char(c: string): boolean {
  return /^[A-Za-z0-9+/=]$/.test(c);
}

function isUrlSafeBase64Char(c: string): boolean {
  return /^[A-Za-z0-9\-_]$/.test(c);
}

function calculateEntropy(text: string): number {
  if (text.length === 0) return 0;
  const freq: Record<string, number> = {};
  for (const ch of text) {
    freq[ch] = (freq[ch] || 0) + 1;
  }
  let entropy = 0;
  const len = text.length;
  for (const count of Object.values(freq)) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  return Math.round(entropy * 100) / 100;
}

function safeParseBase64(input: string): { data: string; isValid: boolean; error?: string; isUrlSafe: boolean; hasPadding: boolean; paddingCount: number } {
  const trimmed = input.trim();
  if (trimmed === "") return { data: "", isValid: false, error: "Input is empty", isUrlSafe: false, hasPadding: false, paddingCount: 0 };

  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  const urlSafeRegex = /^[A-Za-z0-9\-_]*={0,2}$/;

  const isUrlSafe = urlSafeRegex.test(trimmed) && !base64Regex.test(trimmed.replace(/=/g, "").replace(/-/g, "+").replace(/_/g, "/"));
  const isStandard = base64Regex.test(trimmed);

  if (!isStandard && !isUrlSafe) {
    return { data: "", isValid: false, error: "Invalid Base64 characters detected", isUrlSafe: false, hasPadding: false, paddingCount: 0 };
  }

  try {
    let normalized = trimmed;
    if (isUrlSafe) {
      normalized = normalized.replace(/-/g, "+").replace(/_/g, "/");
    }

    const paddingNeeded = (4 - (normalized.length % 4)) % 4;
    normalized += "=".repeat(paddingNeeded);
    const hasPadding = trimmed.includes("=") || paddingNeeded > 0;
    const paddingCount = (trimmed.match(/=/g) || []).length + paddingNeeded;

    const decoded = atob(normalized);
    return { data: decoded, isValid: true, isUrlSafe, hasPadding, paddingCount };
  } catch {
    return { data: "", isValid: false, error: "Failed to decode Base64 string", isUrlSafe: false, hasPadding: false, paddingCount: 0 };
  }
}

function calculate(inputs: typeof DEFAULTS): Base64DecoderResult {
  const encoded = inputs.encodedInput.trim();
  const { data: decodedText, isValid, error, isUrlSafe, hasPadding, paddingCount } = safeParseBase64(encoded);

  let byteCount = 0;
  let charCount = 0;
  let lineCount = 0;
  let wordCount = 0;
  let hexView = "";
  let chartData: { char: string; count: number; isAlphanumeric: boolean }[] = [];
  let byteBreakdown: { byte: number; char: string; type: string }[] = [];
  let uniqueChars = 0;
  let encoding = "UTF-8";
  let originalLength = encoded.length;
  let entropy = 0;
  let compressionRatio = 0;
  let printableRatio = 0;
  let asciiOnly = true;
  let maxCharFrequency = 0;
  let controlCharCount = 0;
  let nullByteCount = 0;
  let highBytesCount = 0;

  if (isValid && decodedText) {
    byteCount = decodedText.length;
    charCount = decodedText.length;
    lineCount = decodedText.split(/\r?\n/).length;
    wordCount = decodedText.trim() === "" ? 0 : decodedText.trim().split(/\s+/).length;

    const bytes = new Uint8Array(decodedText.length);
    for (let i = 0; i < decodedText.length; i++) {
      bytes[i] = decodedText.charCodeAt(i);
    }

    hexView = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0").toUpperCase())
      .join(" ");

    const freq: Record<string, number> = {};
    let printableCount = 0;
    for (const ch of decodedText) {
      freq[ch] = (freq[ch] || 0) + 1;
      if (/^[\x20-\x7E]$/.test(ch)) printableCount++;
    }
    uniqueChars = Object.keys(freq).length;
    maxCharFrequency = Math.max(...Object.values(freq));
    printableRatio = decodedText.length > 0 ? Math.round((printableCount / decodedText.length) * 1000) / 10 : 0;

    entropy = calculateEntropy(decodedText);
    compressionRatio = originalLength > 0 ? Math.round((decodedText.length / originalLength) * 100) / 100 : 0;

    const sortedChars = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 25);
    chartData = sortedChars.map(([char, count]) => ({
      char: char === " " ? "Space" : char === "\n" ? "Newline" : char === "\t" ? "Tab" : char === "\r" ? "CR" : char,
      count,
      isAlphanumeric: /^[A-Za-z0-9]$/.test(char),
    }));

    byteBreakdown = Array.from(bytes).map((b, i) => {
      let type = "Printable";
      if (b >= 32 && b <= 126) type = "Printable ASCII";
      else if (b >= 128) type = "Extended UTF-8";
      else if (b === 0) { type = "Null Byte"; nullByteCount++; }
      else if (b < 32) { type = "Control"; controlCharCount++; }
      if (b >= 128) { highBytesCount++; asciiOnly = false; }
      const displayChar = b >= 32 && b <= 126 ? String.fromCharCode(b) : `0x${b.toString(16).toUpperCase()}`;
      return { byte: b, char: displayChar, type };
    });
  }

  if (!isValid) {
    chartData = [];
    byteBreakdown = [];
    uniqueChars = 0;
    hexView = "";
  }

  return {
    decodedText: isValid ? decodedText : "",
    hexView,
    byteCount,
    charCount,
    lineCount,
    wordCount,
    encoding,
    hasPadding,
    paddingCount,
    chartData,
    byteBreakdown,
    uniqueChars,
    isUrlSafe,
    originalLength,
    isValid,
    error,
    entropy,
    compressionRatio,
    printableRatio,
    asciiOnly,
    maxCharFrequency,
    controlCharCount,
    nullByteCount,
    highBytesCount,
  };
}

const fmtBytes = (n: number): string => {
  if (n <= 0) return "0 B";
  if (n === 1) return "1 Byte";
  return `${n} Bytes`;
};

const CompactInput = ({ id, label, value, onChange, suffix }: { id: string; label: string; value: string; onChange: (val: string) => void; suffix?: string }) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1.5 text-foreground">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground font-mono"
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const SelectInput = ({ id, label, value, onChange, options }: { id: string; label: string; value: string; onChange: (val: string) => void; options: { value: string; label: string }[] }) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1.5 text-foreground">{label}</label>
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 px-3 text-base rounded-md border border-input bg-background shadow-sm outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </div>
);

const ToggleInput = ({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (val: boolean) => void }) => (
  <label htmlFor={id} className="flex items-center gap-3 cursor-pointer group">
    <div className="relative">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className="w-10 h-5 bg-muted peer-checked:bg-primary rounded-full transition-colors"></div>
      <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5"></div>
    </div>
    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{label}</span>
  </label>
);

const StatCard = ({ label, value, icon: Icon, color }: { label: string; value: string | number; icon?: any; color?: string }) => (
  <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
    {Icon && <Icon className={`h-4 w-4 mx-auto mb-1 ${color || "text-muted-foreground"}`} />}
    <div className="text-xs font-bold text-muted-foreground mb-1 uppercase">{label}</div>
    <div className="text-lg font-bold text-foreground">{typeof value === "number" ? value.toLocaleString() : value}</div>
  </div>
);

export default function Base64Decoder() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<Base64DecoderResult>(calculate(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculate(inputs));
  }, []);

  const handleCalculate = () => setResult(calculate(inputs));
  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };
  const updateVal = (key: keyof typeof DEFAULTS, val: string | boolean) =>
    setInputs((prev) => ({ ...prev, [key]: val }));

  const faqs = [
    { question: "What is Base64 encoding used for?", answer: "Base64 encoding converts binary data into an ASCII string format, making it safe for transmission over text-based protocols like email, JSON, and HTML. It is widely used in data URIs, email attachments, and web APIs." },
    { question: "Is Base64 encrypted?", answer: "No, Base64 is an encoding scheme, not encryption. Anyone can decode Base64 data; it simply transforms binary data into a readable text format. Use proper encryption if you need confidentiality." },
    { question: "Why does Base64 use padding characters?", answer: "Base64 encodes every 3 bytes (24 bits) into 4 ASCII characters. If the input length is not a multiple of 3, padding characters (=) are added to make the output length divisible by 4." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Base64 Decoder" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Base64 Decoder</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT - Inputs */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card rounded-xl">
            <CompactInput
              id="encodedInput"
              label="Encoded Input"
              value={inputs.encodedInput}
              onChange={(v) => updateVal("encodedInput", v)}
            />

            <SelectInput
              id="outputFormat"
              label="Output Format"
              value={inputs.outputFormat}
              onChange={(v) => updateVal("outputFormat", v)}
              options={[
                { value: "plain", label: "Plain Text" },
                { value: "hex", label: "Hexadecimal" },
              ]}
            />

            {/* Advanced Options */}
            <div>
              <button
                type="button"
                onClick={() => updateVal("showAdvanced", !(inputs as any).showAdvanced)}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mt-1 focus:outline-none"
              >
                Advanced Options
                <svg className={`h-3 w-3 transition-transform ${(inputs as any).showAdvanced ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>

              {(inputs as any).showAdvanced && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Output Options</div>
                  <ToggleInput
                    id="showHex"
                    label="Show Hex"
                    checked={inputs.showHex}
                    onChange={(v) => updateVal("showHex", v)}
                  />
                  <ToggleInput
                    id="showUtf8Analysis"
                    label="Show UTF-8 Analysis"
                    checked={inputs.showUtf8Analysis}
                    onChange={(v) => updateVal("showUtf8Analysis", v)}
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 mt-2.5">
              <button
                type="button"
                onClick={handleCalculate}
                className="h-10 w-full flex-1 flex items-center justify-center rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-base transition-all active:scale-[0.98] shadow-sm"
              >
                Calculate
              </button>
              <button
                onClick={handleReset}
                className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 focus:outline-none"
                aria-label="Reset"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
            </div>

            {/* Validation Status */}
            {!result.isValid && result.error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{result.error}</span>
              </div>
            )}
            {result.isValid && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Successfully decoded {result.byteCount} bytes</span>
              </div>
            )}
          </div>

          {/* RIGHT - Results */}
          <div className="flex flex-col gap-4">
            {/* Component 1: Primary Result Card */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
              <div className="flex justify-end absolute top-3 right-3">
                <button type="button" onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
              </div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" /> Decoded Output
              </div>
              <div className="text-3xl md:text-4xl font-bold text-primary my-1 break-all font-mono leading-tight">
                {result.decodedText ? (result.decodedText.length > 80 ? result.decodedText.slice(0, 80) + "..." : result.decodedText) : "—"}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {inputs.outputFormat === "hex" ? "Hex View" : "Plain Text"} output • {fmtBytes(result.byteCount)} • Entropy: {result.entropy.toFixed(2)} bits/char
              </div>
            </div>

            {/* Component 2: 3-Stat Bar */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Characters" value={result.charCount} />
              <StatCard label="Lines" value={result.lineCount} />
              <StatCard label="Words" value={result.wordCount} />
            </div>

            {/* Component 2B: Extended Stats Bar */}
            <div className="grid grid-cols-4 gap-3">
              <StatCard label="Bytes" value={result.byteCount} />
              <StatCard label="Unique" value={result.uniqueChars} />
              <StatCard label="Entropy" value={result.entropy.toFixed(2)} />
              <StatCard label="ASCII Only" value={result.asciiOnly ? "Yes" : "No"} />
            </div>

            {/* Component 3: Breakdown Table */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Property</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr>
                    <td className="text-base py-2.5 px-3 text-muted-foreground">Original Length</td>
                    <td className="text-base py-2.5 px-3 text-right font-medium text-foreground">{result.originalLength.toLocaleString()} chars</td>
                  </tr>
                  <tr>
                    <td className="text-base py-2.5 px-3 text-muted-foreground">Decoded Bytes</td>
                    <td className="text-base py-2.5 px-3 text-right font-medium text-foreground">{result.byteCount.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="text-base py-2.5 px-3 text-muted-foreground">Unique Characters</td>
                    <td className="text-base py-2.5 px-3 text-right font-medium text-foreground">{result.uniqueChars.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="text-base py-2.5 px-3 text-muted-foreground">Encoding</td>
                    <td className="text-base py-2.5 px-3 text-right font-medium text-foreground">{result.encoding}</td>
                  </tr>
                  <tr>
                    <td className="text-base py-2.5 px-3 text-muted-foreground">Padding</td>
                    <td className="text-base py-2.5 px-3 text-right font-medium text-foreground">{result.hasPadding ? `${result.paddingCount} '=' char(s)` : "None"}</td>
                  </tr>
                  <tr>
                    <td className="text-base py-2.5 px-3 text-muted-foreground">URL-Safe Alphabet</td>
                    <td className="text-base py-2.5 px-3 text-right font-medium text-foreground">{result.isUrlSafe ? "Yes" : "No"}</td>
                  </tr>
                  <tr>
                    <td className="text-base py-2.5 px-3 text-muted-foreground">Compression Ratio</td>
                    <td className="text-base py-2.5 px-3 text-right font-medium text-foreground">{result.compressionRatio}x</td>
                  </tr>
                  <tr>
                    <td className="text-base py-2.5 px-3 text-muted-foreground">Printable Ratio</td>
                    <td className="text-base py-2.5 px-3 text-right font-medium text-foreground">{result.printableRatio}%</td>
                  </tr>
                  <tr>
                    <td className="text-base py-2.5 px-3 text-muted-foreground">Control Characters</td>
                    <td className="text-base py-2.5 px-3 text-right font-medium text-foreground">{result.controlCharCount}</td>
                  </tr>
                  <tr>
                    <td className="text-base py-2.5 px-3 text-muted-foreground">High Bytes (&gt;=128)</td>
                    <td className="text-base py-2.5 px-3 text-right font-medium text-foreground">{result.highBytesCount}</td>
                  </tr>
                  {inputs.showHex && (
                    <tr>
                      <td className="text-base py-2.5 px-3 text-muted-foreground">Hex View</td>
                      <td className="text-base py-2.5 px-3 text-right font-medium text-foreground font-mono break-all max-w-[300px]">{result.hexView || "N/A"}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Component 4: Recharts BarChart */}
            {mounted && result.chartData.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground mb-4">Character Frequency Analysis</h3>
                <LazyView minHeight={250}>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="char" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                      <RechartsTooltip cursor={{ fill: "transparent" }} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} formatter={(v: any) => [`${v} occurrences`, "Count"]} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {result.chartData.map((entry, index) => (
                          <Cell key={index} fill={entry.isAlphanumeric ? "hsl(var(--primary))" : "#94a3b8"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </LazyView>
              </div>
            )}

            {/* Component 5: Summary Statistics */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Decoded Text</span>
                  <span className="text-base font-bold text-foreground break-all font-mono">{result.decodedText ? (result.decodedText.length > 30 ? result.decodedText.slice(0, 30) + "..." : result.decodedText) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Output Format</span>
                  <span className="text-base font-bold text-foreground">{inputs.outputFormat === "plain" ? "Plain Text" : "Hexadecimal"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Byte Count</span>
                  <span className="text-base font-bold text-foreground">{result.byteCount.toLocaleString()}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Character Count</span>
                  <span className="text-base font-bold text-foreground">{result.charCount.toLocaleString()}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Unique Characters</span>
                  <span className="text-base font-bold text-foreground">{result.uniqueChars.toLocaleString()}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Padding</span>
                  <span className="text-base font-bold text-foreground">{result.hasPadding ? `${result.paddingCount} '='` : "None"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">URL-Safe Base64</span>
                  <span className="text-base font-bold text-foreground">{result.isUrlSafe ? "Yes" : "No"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Lines / Words</span>
                  <span className="text-base font-bold text-foreground">{result.lineCount} / {result.wordCount}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Shannon Entropy</span>
                  <span className="text-base font-bold text-foreground">{result.entropy.toFixed(2)} bits/char</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Compression Ratio</span>
                  <span className="text-base font-bold text-foreground">{result.compressionRatio}x</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">ASCII Only</span>
                  <span className="text-base font-bold text-foreground">{result.asciiOnly ? "Yes" : "No"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Printable Ratio</span>
                  <span className="text-base font-bold text-foreground">{result.printableRatio}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SEO Article section */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding Base64 Encoding and Decoding</h2>
            <p>
              Base64 is a binary-to-text encoding scheme that represents binary data in an ASCII string format by translating it into a radix-64 representation. It is commonly used to embed binary data inside text-based formats such as HTML, CSS, JSON, and XML, and to encode attachments in email via MIME. The decoder processes input using the standard RFC 4648 alphabet, stripping padding characters and reconstructing the original byte sequence. Because Base64 expands data by approximately 33%, it is never a compression method — it is a transport encoding that ensures data integrity across systems that may corrupt raw binary bytes. Developers use it for data URIs in web development, API payloads, and authentication tokens, making it a foundational tool in modern software engineering.
            </p>

            <h2 className="text-2xl font-bold mb-3">How Base64 Handles Padding and Character Sets</h2>
            <p>
              Base64 encoding works by splitting input into 24-bit groups (three 8-bit bytes) and mapping each 6-bit segment to one of 64 characters. When the final group contains fewer than three bytes, padding characters (=) are appended so the output length is always a multiple of four. Standard Base64 uses the alphabet A–Z, a–z, 0–9, +, and /, while URL-safe variants replace + with - and / with _ to avoid escaping issues in web paths and query parameters. Our decoder automatically detects the character set, normalizes padding, and reconstructs the original UTF-8 byte stream. It also reports whether the input used URL-safe characters, how many padding bytes were present, and the total decoded byte count — giving developers full transparency into the encoding structure for debugging and security auditing.
            </p>

            <h2 className="text-2xl font-bold mb-3">Practical Uses in Data Encoding and Web Development</h2>
            <p>
              In web development, Base64 enables embedding images directly into CSS or HTML using data URIs, reducing HTTP requests for small icons and sprites. It also appears in JSON Web Tokens (JWT), where header and payload segments are Base64Url-encoded before signature computation. Debugging encoded payloads, validating API responses, and reverse-engineering obfuscated strings are everyday tasks where a reliable decoder saves time. This tool extends beyond simple decoding by showing the hex representation, character frequency breakdown, and UTF-8 byte analysis, helping developers verify that multi-byte characters such as emoji and non-Latin scripts survived the encoding process intact. Whether you are inspecting a data URI, decoding a secret token, or learning how encoding affects file size, this decoder provides the detailed output needed for accurate analysis.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/base64-decoder" />
          <PopularCalculators exclude="/calculator/base64-decoder" />
        </div>
      </div>
    </>
  );
}
