"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, HardDrive } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

type Unit = "B" | "KB" | "MB" | "GB" | "TB" | "PB";

const units: { key: Unit; label: string; bytes: number }[] = [
  { key: "B", label: "Bytes (B)", bytes: 1 },
  { key: "KB", label: "Kilobytes (KB)", bytes: 1024 },
  { key: "MB", label: "Megabytes (MB)", bytes: 1024 ** 2 },
  { key: "GB", label: "Gigabytes (GB)", bytes: 1024 ** 3 },
  { key: "TB", label: "Terabytes (TB)", bytes: 1024 ** 4 },
  { key: "PB", label: "Petabytes (PB)", bytes: 1024 ** 5 },
];

const fmtBytes = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });

const faqs = [
  { question: "Is KB 1000 or 1024 bytes?", answer: "Storage devices often use decimal prefixes (1 KB = 1000 B, 1 GB = 1 billion bytes), while operating systems and this calculator use binary (1 KiB = 1024 B, 1 GiB = 1,073,741,824 B). The difference explains why a 1 TB drive shows ~931 GB on your computer." },
  { question: "How do I convert between units?", answer: "Every conversion passes through bytes: value × from-unit size ÷ to-unit size. This guarantees exact, reversible results in binary units." },
  { question: "What is the difference between a bit and a byte?", answer: "A byte is 8 bits. Network speeds are quoted in bits (Mbps), file sizes in bytes (MB) — so a 100 Mbps connection transfers at most 12.5 MB per second." },
];

export default function DataSizeConverter() {
  const [value, setValue] = useState("1024");
  const [from, setFrom] = useState<Unit>("MB");
  const [to, setTo] = useState<Unit>("GB");
  const [result, setResult] = useState<{ bytes: number; converted: number; toLabel: string }>(() => {
    const bytes = 1024 * 1024 ** 2;
    return { bytes, converted: bytes / 1024 ** 3, toLabel: "GB" };
  });

  useEffect(() => {
    const v = parseFloat(value);
    if (!isNaN(v) && v >= 0) {
      const bytes = v * units.find(u => u.key === from)!.bytes;
      const converted = bytes / units.find(u => u.key === to)!.bytes;
      setResult({ bytes, converted, toLabel: units.find(u => u.key === to)!.label });
    }
  }, [value, from, to]);

  const reset = () => { setValue("1024"); setFrom("MB"); setTo("GB"); };
  const invalid = isNaN(parseFloat(value)) || parseFloat(value) < 0;

  const allUnits = units.map(u => ({ label: u.key, value: result.bytes / u.bytes }));

  const breakdown = [
    { label: "Input", value: `${parseFloat(value) || 0} ${from}` },
    { label: "In Bytes", value: `${fmtBytes(result.bytes)} B` },
    { label: "Converted Value", value: `${result.converted.toLocaleString("en-US", { maximumFractionDigits: 4 })} ${to}`, highlight: true },
    { label: "Bits", value: `${fmtBytes(result.bytes * 8)} bits` },
    { label: "Base", value: "Binary (1 KB = 1024 B)" },
  ];

  const summaryStats = [
    { label: "Bytes", value: fmtBytes(result.bytes) },
    { label: "Kilobytes", value: (result.bytes / 1024).toLocaleString("en-US", { maximumFractionDigits: 2 }) },
    { label: "Megabytes", value: (result.bytes / 1024 ** 2).toLocaleString("en-US", { maximumFractionDigits: 2 }) },
    { label: "Gigabytes", value: (result.bytes / 1024 ** 3).toLocaleString("en-US", { maximumFractionDigits: 2 }) },
    { label: "Terabytes", value: (result.bytes / 1024 ** 4).toLocaleString("en-US", { maximumFractionDigits: 4 }) },
    { label: "Bits", value: fmtBytes(result.bytes * 8) },
  ];

  const chartData = [
    { name: "Bytes", value: result.bytes },
    { name: "Bits (×8)", value: result.bytes * 8 },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Data Size Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Data Size Converter</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div>
              <label htmlFor="ds-value" className="block text-sm font-medium mb-1 text-foreground">Value</label>
              <input id="ds-value" type="number" min="0" value={value} onChange={(e) => setValue(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ds-from" className="block text-sm font-medium mb-1 text-foreground">From</label>
                <select id="ds-from" value={from} onChange={(e) => setFrom(e.target.value as Unit)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20">
                  {units.map(u => <option key={u.key} value={u.key}>{u.label}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="ds-to" className="block text-sm font-medium mb-1 text-foreground">To</label>
                <select id="ds-to" value={to} onChange={(e) => setTo(e.target.value as Unit)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20">
                  {units.map(u => <option key={u.key} value={u.key}>{u.label}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <HardDrive className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter a valid non-negative value.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Converted Value</div>
              <div className="text-4xl font-extrabold text-primary">{result.converted.toLocaleString("en-US", { maximumFractionDigits: 4 })} <span className="text-xl font-bold">{to}</span></div>
              <div className="text-sm text-muted-foreground mt-1">{fmtBytes(result.bytes)} bytes total</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">In Bytes</div>
                <div className="text-lg font-bold text-primary">{fmtBytes(result.bytes)}</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">In Bits</div>
                <div className="text-lg font-bold text-primary">{fmtBytes(result.bytes * 8)}</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Input</div>
                <div className="text-lg font-bold text-primary">{parseFloat(value) || 0} {from}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Detail</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdown.map((row) => (
                    <tr key={row.label} className={row.highlight ? "bg-primary/10 font-bold" : ""}>
                      <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Equivalent in Every Unit</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {allUnits.map(u => (
                  <span key={u.label} className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">{u.label}: {u.value.toLocaleString("en-US", { maximumFractionDigits: 2 })}</span>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [fmtBytes(v), ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={70} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {summaryStats.map((s) => (
                  <div key={s.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the Data Size Converter</h2>
            <p>This converter works in binary units: 1 KB = 1024 B, 1 MB = 1024 KB, and so on up to petabytes. Every value is first normalized to bytes, then divided by the target unit's size — a reversible, exact conversion chain.</p>
            <h3>Binary vs Decimal</h3>
            <p>Hard drive and SSD manufacturers quote decimal capacities (1 GB = 1,000,000,000 bytes), while operating systems report binary units (1 GiB = 1,073,741,824 bytes). That 7% discrepancy is why a "1 TB" drive formats to about 931 GiB.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/data-size-converter" />
          <PopularCalculators exclude="/calculator/data-size-converter" />
        </div>
      </div>
    </>
  );
}
