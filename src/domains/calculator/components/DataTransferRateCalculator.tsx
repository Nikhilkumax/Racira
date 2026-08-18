"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface RateResult {
  value: number;
  fromUnit: string;
  toUnit: string;
  bitsPerSec: number;
  converted: number;
  fileSizeBytes: number;
  transferSeconds: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

const UNITS: Record<string, number> = { bps: 1, kbps: 1e3, Mbps: 1e6, Gbps: 1e9, kBps: 8e3, MBps: 8e6, GBps: 8e9 };
const UNIT_LABELS: Record<string, string> = { bps: "Bits/s (bps)", kbps: "Kilobits/s (kbps)", Mbps: "Megabits/s (Mbps)", Gbps: "Gigabits/s (Gbps)", kBps: "Kilobytes/s (kB/s)", MBps: "Megabytes/s (MB/s)", GBps: "Gigabytes/s (GB/s)" };

function fmtSeconds(sec: number): string {
  if (sec < 60) return `${sec.toFixed(1)} seconds`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ${(sec % 60).toFixed(0)}s`;
  return `${(sec / 3600).toFixed(2)} hours`;
}

function fmtBytes(v: number): string {
  if (v >= 1e15) return `${(v / 1e15).toFixed(2)} PB`;
  if (v >= 1e12) return `${(v / 1e12).toFixed(2)} TB`;
  if (v >= 1e9) return `${(v / 1e9).toFixed(2)} GB`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(2)} MB`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)} KB`;
  return `${v.toFixed(0)} B`;
}

function calcRate(value: number, fromUnit: string, toUnit: string, fileSizeGB: number): RateResult {
  const bitsPerSec = value * UNITS[fromUnit];
  const converted = bitsPerSec / UNITS[toUnit];
  const fileSizeBytes = fileSizeGB * 1e9;
  const transferSeconds = bitsPerSec > 0 ? fileSizeBytes * 8 / bitsPerSec : Infinity;

  const breakdown = [
    { label: `Rate (${UNIT_LABELS[fromUnit]})`, value: `${value}` },
    { label: `Converted (${UNIT_LABELS[toUnit]})`, value: `${parseFloat(converted.toPrecision(6))}` },
    { label: "Bytes per Second", value: fmtBytes(bitsPerSec / 8) },
    { label: "File Size", value: `${fileSizeGB} GB` },
    { label: "Transfer Time", value: isFinite(transferSeconds) ? fmtSeconds(transferSeconds) : "—" },
    { label: "Per Minute", value: fmtBytes((bitsPerSec / 8) * 60) },
    { label: "Per Hour", value: fmtBytes((bitsPerSec / 8) * 3600) },
  ];
  const summaryStats = [
    { label: "Converted Rate", value: `${parseFloat(converted.toPrecision(6))} ${toUnit}` },
    { label: "Bytes/s", value: fmtBytes(bitsPerSec / 8) },
    { label: "File Size", value: `${fileSizeGB} GB` },
    { label: "Transfer Time", value: isFinite(transferSeconds) ? fmtSeconds(transferSeconds) : "—" },
    { label: "Per Minute", value: fmtBytes((bitsPerSec / 8) * 60) },
    { label: "Per Hour", value: fmtBytes((bitsPerSec / 8) * 3600) },
    { label: "Base Unit", value: "1 byte = 8 bits" },
    { label: "From", value: `${value} ${fromUnit}` },
  ];
  const chartData = [
    { name: `${value} ${fromUnit}`, value: Math.round(converted), fill: "hsl(var(--primary))" },
    { name: toUnit, value: Math.round(converted), fill: "#10b981" },
  ];
  return { value, fromUnit, toUnit, bitsPerSec, converted, fileSizeBytes, transferSeconds, breakdown, summaryStats, chartData };
}

const DEFAULTS = { value: "100", from: "Mbps", to: "MBps", fileSize: "5" };

export default function DataTransferRateCalculator() {
  const [value, setValue] = useState(DEFAULTS.value);
  const [fromUnit, setFromUnit] = useState(DEFAULTS.from);
  const [toUnit, setToUnit] = useState(DEFAULTS.to);
  const [fileSize, setFileSize] = useState(DEFAULTS.fileSize);
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<RateResult | null>(null);

  const v = parseFloat(value) || 0;
  const f = parseFloat(fileSize) || 0;
  const errs: string[] = [];
  if (v <= 0) errs.push("Transfer rate must be greater than 0.");
  if (f <= 0) errs.push("File size must be greater than 0.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcRate(v, fromUnit, toUnit, f)); };
  const reset = () => {
    setValue(DEFAULTS.value); setFromUnit(DEFAULTS.from); setToUnit(DEFAULTS.to); setFileSize(DEFAULTS.fileSize);
    setResult(calcRate(100, "Mbps", "MBps", 5));
  };
  useEffect(() => { setResult(calcRate(100, "Mbps", "MBps", 5)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is the difference between Mbps and MB/s?", answer: "Mbps is megabits per second; MB/s is megabytes per second. One byte equals 8 bits, so MB/s = Mbps ÷ 8. A 100 Mbps connection transfers about 12.5 MB/s. Network plans are quoted in bits; file downloads are measured in bytes — the most common conversion in networking." },
    { question: "Why does my download not match the advertised speed?", answer: "Advertised speeds are theoretical maximums. Real throughput is lower due to Wi-Fi interference, distance from the router, server capacity, network congestion, and overhead. Also, if the plan says 100 Mbps, the max download rate is ~12.5 MB/s — not 100 MB/s." },
    { question: "What is a good internet speed?", answer: "For one person: 25 Mbps for HD streaming, 50 Mbps for 4K, 100 Mbps for multiple users. A 5 GB game download at 100 Mbps takes about 6.7 minutes; at 1 Gbps, about 40 seconds. Upload speed matters for video calls and cloud backups." },
    { question: "How is transfer time calculated?", answer: "Transfer time = File size (bits) ÷ Transfer rate (bps). A 5 GB file is 40 billion bits. At 100 Mbps (100 million bps), that is 400 seconds ≈ 6.7 minutes. Real transfers run slower due to protocol overhead — expect 80–95% of the raw rate." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Technology", href: "/calculator#technology" }, { label: "Data Transfer Rate Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Data Transfer Rate Calculator</h1>
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
                  {Object.entries(UNIT_LABELS).map(([u, l]) => <option key={u} value={u}>{l}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={lbl}>To Unit</label>
              <select value={toUnit} onChange={e => setToUnit(e.target.value)} className={sel}>
                {Object.entries(UNIT_LABELS).map(([u, l]) => <option key={u} value={u}>{l}</option>)}
              </select>
            </div>
            <button
              type="button"
              onClick={() => setShowAdv(o => !o)}
              className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1 self-start"
            >
              Advanced Options
              <span className={`transition-transform ${showAdv ? "rotate-180" : ""}`}>▼</span>
            </button>
            {showAdv && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Transfer Time</div>
                  <div>
                    <label className={lbl}>File Size to Transfer</label>
                    <div className={inp}><input type="number" value={fileSize} onChange={e => setFileSize(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">GB</span></div>
                  </div>
                </div>
              </div>
            )}
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Converted Rate</div>
                <div className="text-4xl font-extrabold tracking-tight">{parseFloat(result.converted.toPrecision(6))} <span className="text-2xl text-muted-foreground">{toUnit}</span></div>
                <div className="text-sm text-muted-foreground mt-1">{result.value} {fromUnit} · {fmtBytes(result.bitsPerSec / 8)}/s</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Bytes/s", `${fmtBytes(result.bitsPerSec / 8)}`], ["Transfer Time", isFinite(result.transferSeconds) ? fmtSeconds(result.transferSeconds) : "—"], ["Per Hour", fmtBytes((result.bitsPerSec / 8) * 3600)]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Rate Breakdown</h3>
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
                <h3 className="text-base font-bold mb-4">Rate Comparison</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: number) => [`${v.toFixed(2)} ${toUnit}`, ""]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
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
            <h2 className="text-2xl font-bold mb-3">Bits vs Bytes</h2>
            <p>Data transfer rates are quoted in bits per second (bps) — 100 Mbps, 1 Gbps — while file sizes are quoted in bytes (MB, GB). Because 1 byte = 8 bits, divide by 8 to convert: 100 Mbps = 12.5 MB/s. This <strong>data transfer rate calculator</strong> converts between every common unit and estimates transfer time for real files.</p>
            <h2 className="text-2xl font-bold mb-3">Estimating Transfer Time</h2>
            <p>Time = File size in bits ÷ Rate in bps. A 5 GB file at 100 Mbps takes 400 seconds. In practice, TCP/IP overhead, Wi-Fi retransmissions, and server limits cut throughput by 5–20%, so budget extra time for large transfers and cloud syncs.</p>
            <h2 className="text-2xl font-bold mb-3">Choosing a Connection</h2>
            <p>Streaming HD needs ~5 Mbps, 4K needs ~25 Mbps per stream. Video calls use 2–4 Mbps. Cloud backups of 100 GB at 100 Mbps take over 2 hours; at 1 Gbps, under 15 minutes. Match your plan to simultaneous users, resolution, and upload needs — not just the headline download number.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/data-transfer-rate-calculator" />
          <PopularCalculators exclude="/calculator/data-transfer-rate-calculator" />
        </div>
      </div>
    </>
  );
}
