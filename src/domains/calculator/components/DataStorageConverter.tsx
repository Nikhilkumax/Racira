"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface StorageResult {
  value: number;
  fromUnit: string;
  toUnit: string;
  base: number;
  converted: number;
  equivalents: { unit: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

const UNITS = ["B", "KB", "MB", "GB", "TB", "PB", "EB"];
const BASE_LABEL: Record<number, string> = { 1024: "Binary (1024)", 1000: "Decimal (1000)" };

function fmtUnit(v: number): string {
  if (v >= 1e15) return `${(v / 1e15).toFixed(2)} PB`;
  if (v >= 1e12) return `${(v / 1e12).toFixed(2)} TB`;
  if (v >= 1e9) return `${(v / 1e9).toFixed(2)} GB`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(2)} MB`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(2)} KB`;
  return `${v.toFixed(0)} B`;
}

function calcStorage(value: number, fromUnit: string, toUnit: string, base: number): StorageResult {
  const fromIdx = UNITS.indexOf(fromUnit);
  const toIdx = UNITS.indexOf(toUnit);
  const bytes = value * Math.pow(base, fromIdx);
  const converted = bytes / Math.pow(base, toIdx);
  const equivalents = UNITS.map(u => ({ unit: u, value: bytes / Math.pow(base, UNITS.indexOf(u)) }));
  const smart = (v: number, u: string) => `${parseFloat(v.toPrecision(6))} ${u}`;

  const breakdown = [
    { label: `Original (${value} ${fromUnit})`, value: smart(value, fromUnit) },
    { label: `Converted (${toUnit})`, value: smart(converted, toUnit) },
    { label: "Bytes Equivalent", value: fmtUnit(bytes) },
    { label: "Base System", value: BASE_LABEL[base] },
    ...equivalents.map(e => ({ label: `In ${e.unit}`, value: smart(e.value, e.unit) })),
  ];
  const summaryStats = [
    { label: "Converted", value: smart(converted, toUnit) },
    { label: "Bytes", value: fmtUnit(bytes) },
    { label: "Base", value: BASE_LABEL[base] },
    { label: `From`, value: `${value} ${fromUnit}` },
    { label: "To", value: toUnit },
    ...equivalents.slice(0, 4).map(e => ({ label: e.unit, value: smart(e.value, e.unit) })),
  ];
  const chartData = [
    { name: `${value} ${fromUnit}`, value: Math.round(converted), fill: "hsl(var(--primary))" },
    { name: toUnit, value: Math.round(converted), fill: "#10b981" },
  ];
  return { value, fromUnit, toUnit, base, converted, equivalents, breakdown, summaryStats, chartData };
}

const DEFAULTS = { value: "1", from: "GB", to: "MB", base: "1024" };

export default function DataStorageConverter() {
  const [value, setValue] = useState(DEFAULTS.value);
  const [fromUnit, setFromUnit] = useState(DEFAULTS.from);
  const [toUnit, setToUnit] = useState(DEFAULTS.to);
  const [base, setBase] = useState(DEFAULTS.base);
  const [result, setResult] = useState<StorageResult | null>(null);

  const v = parseFloat(value) || 0;
  const b = parseInt(base) || 1024;
  const errs: string[] = [];
  if (v < 0) errs.push("Value cannot be negative.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcStorage(v, fromUnit, toUnit, b)); };
  const reset = () => {
    setValue(DEFAULTS.value); setFromUnit(DEFAULTS.from); setToUnit(DEFAULTS.to); setBase(DEFAULTS.base);
    setResult(calcStorage(1, "GB", "MB", 1024));
  };
  useEffect(() => { setResult(calcStorage(1, "GB", "MB", 1024)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is the difference between binary and decimal storage units?", answer: "Decimal (SI) units use 1000: 1 GB = 1,000,000,000 bytes. Binary (IEC) units use 1024: 1 GiB = 1,073,741,824 bytes. Hard drive manufacturers advertise decimal GB, while operating systems report binary GiB — which is why a '1 TB' drive shows ~931 GB." },
    { question: "How many MB are in a GB?", answer: "In decimal: 1,000. In binary: 1,024. This calculator lets you switch bases so conversions match whichever convention your context uses — marketing specs (decimal) or filesystem reporting (binary)." },
    { question: "What is the difference between a bit and a byte?", answer: "A byte is 8 bits. Network speeds are quoted in bits per second (Mbps), while file sizes are quoted in bytes (MB, GB) — so a 100 Mbps connection transfers about 12.5 MB/s. This is the most common unit mix-up in computing." },
    { question: "How much is a terabyte?", answer: "One terabyte (decimal) is one trillion bytes. Roughly: 1 TB ≈ 250,000 MP3 songs, 200,000 photos, or 1,000 hours of HD video. A modern hard drive holds 2–20 TB; data centers operate at petabyte and exabyte scale." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Technology", href: "/calculator#technology" }, { label: "Data Storage Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Data Storage Converter</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Value</label>
                <div className={inp}><input type="number" value={value} onChange={e => setValue(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>From Unit</label>
                <select value={fromUnit} onChange={e => setFromUnit(e.target.value)} className={sel}>
                  {UNITS.map(u => <option key={u} value={u}>{u === "B" ? "Byte (B)" : u + "ibyte"}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>To Unit</label>
                <select value={toUnit} onChange={e => setToUnit(e.target.value)} className={sel}>
                  {UNITS.map(u => <option key={u} value={u}>{u === "B" ? "Byte (B)" : u + "ibyte"}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Base System</label>
                <select value={base} onChange={e => setBase(e.target.value)} className={sel}>
                  <option value="1024">Binary (1024)</option>
                  <option value="1000">Decimal (1000)</option>
                </select>
              </div>
            </div>
            {errs.length > 0 && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">{errs[0]}</div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} disabled={!valid} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${valid ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Converted Amount</div>
                <div className="text-4xl font-extrabold tracking-tight">{parseFloat(result.converted.toPrecision(6))} <span className="text-2xl text-muted-foreground">{toUnit}</span></div>
                <div className="text-sm text-muted-foreground mt-1">{result.value} {fromUnit} = {fmtUnit(result.converted * Math.pow(result.base, UNITS.indexOf(toUnit)))} · {BASE_LABEL[result.base]}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Bytes", fmtUnit(result.converted * Math.pow(result.base, UNITS.indexOf(toUnit)))], ["Base", BASE_LABEL[result.base]], ["From", `${result.value} ${fromUnit}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Storage Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 1 ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 ${i === 1 ? "text-amber-700 font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 1 ? "text-amber-700" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Unit Comparison</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.equivalents.slice(0, 6).map(e => ({ ...e, display: Math.log10(Math.max(1, e.value)) }))} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="unit" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `10^${v}`} />
                    <Tooltip formatter={(v: number, _: string, item: any) => [`${parseFloat(item.payload.value.toPrecision(6))} ${item.payload.unit}`, "Value"]} />
                    <Bar dataKey="display" radius={[4, 4, 0, 0]}>
                      {result.equivalents.slice(0, 6).map((_, i) => <Cell key={i} fill={i === UNITS.indexOf(toUnit) ? "hsl(var(--primary))" : "#10b981"} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Binary vs Decimal Storage</h2>
            <p>Storage units come in two flavors. Decimal (SI): 1 KB = 1,000 bytes. Binary (IEC): 1 KiB = 1,024 bytes. Drive manufacturers quote decimal capacities; operating systems display binary — the famous "missing" space on a new drive is simply this difference. This <strong>data storage converter</strong> supports both conventions.</p>
            <h2 className="text-2xl font-bold mb-3">The Byte Ladder</h2>
            <p>B → KB → MB → GB → TB → PB → EB. Each step multiplies by 1,000 (decimal) or 1,024 (binary). A 4.7 GB DVD holds 4.4 GiB. A 1 TB drive shows 931 GiB in Windows. Understanding which convention you are looking at prevents huge estimation errors when planning backups or storage purchases.</p>
            <h2 className="text-2xl font-bold mb-3">Practical Planning</h2>
            <p>Estimate photo libraries (~5 MB each), music (~10 MB per song), video (~1 GB per hour of HD, ~7 GB per hour of 4K), and operating-system overhead (~30–50 GB). Always buy storage with headroom for growth and periodic backups.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/data-storage-converter" />
          <PopularCalculators exclude="/calculator/data-storage-converter" />
        </div>
      </div>
    </>
  );
}
