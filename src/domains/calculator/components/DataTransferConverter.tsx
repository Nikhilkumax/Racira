"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface TransferResult {
  sizeGb: number;
  speedMbps: number;
  speedMBs: number;
  seconds: number;
  minutes: number;
  formatted: string;
  gbPerMin: number;
  hours: number;
}

function calcTransfer(sizeGb: number, speedMbps: number): TransferResult {
  const speedMBs = speedMbps / 8;
  const seconds = speedMBs > 0 ? (sizeGb * 1024) / speedMBs : 0;
  const minutes = seconds / 60;
  const hours = minutes / 60;
  const fmt = () => {
    if (hours >= 1) {
      const h = Math.floor(hours);
      const m = Math.round((hours - h) * 60);
      return `${h} h ${m} min`;
    }
    if (minutes >= 1) {
      const m = Math.floor(minutes);
      const s = Math.round((minutes - m) * 60);
      return `${m} min ${s} s`;
    }
    return `${seconds.toFixed(1)} s`;
  };
  return { sizeGb, speedMbps, speedMBs, seconds, minutes, formatted: fmt(), gbPerMin: speedMBs * 60 / 1024, hours };
}

const DEFAULTS = { size: "2", speed: "100" };

const faqs = [
  { question: "Why is the time less than size ÷ speed?", answer: "Because of bits vs bytes: network speeds are quoted in megabits per second (Mbps) but file sizes in bytes. 1 byte = 8 bits, so a 100 Mbps connection moves 12.5 MB/s — the formula divides by 8." },
  { question: "What speed should I expect?", answer: "Advertised speeds are theoretical maximums. Over Wi-Fi expect 40–70% of the plan speed; over Ethernet often 85–95%. Your real speed is limited by the server's upload as well." },
  { question: "Why do transfers slow down?", answer: "TCP overhead, distance and latency, congestion, and throttling all reduce throughput. The calculator assumes the ideal full speed — real downloads almost always take longer." },
];

export default function DataTransferConverter() {
  const [size, setSize] = useState(DEFAULTS.size);
  const [speed, setSpeed] = useState(DEFAULTS.speed);
  const [result, setResult] = useState<TransferResult>(() => calcTransfer(2, 100));

  useEffect(() => {
    const s = parseFloat(size);
    const p = parseFloat(speed);
    if (!isNaN(s) && !isNaN(p) && s >= 0 && p > 0) setResult(calcTransfer(s, p));
  }, [size, speed]);

  const reset = () => { setSize(DEFAULTS.size); setSpeed(DEFAULTS.speed); };
  const invalid = isNaN(parseFloat(size)) || isNaN(parseFloat(speed)) || parseFloat(size) < 0 || parseFloat(speed) <= 0;

  const breakdown = [
    { label: "File Size", value: `${result.sizeGb.toFixed(2)} GB (${(result.sizeGb * 1024).toFixed(0)} MB)` },
    { label: "Connection Speed", value: `${result.speedMbps.toFixed(0)} Mbps` },
    { label: "Real Throughput", value: `${result.speedMBs.toFixed(2)} MB/s` },
    { label: "Transfer Time", value: result.formatted, highlight: true },
    { label: "Transfer Time (seconds)", value: `${result.seconds.toFixed(1)} s` },
    { label: "Throughput per Minute", value: `${result.gbPerMin.toFixed(2)} GB/min` },
  ];

  const summaryStats = [
    { label: "Transfer Time", value: result.formatted },
    { label: "Throughput", value: `${result.speedMBs.toFixed(2)} MB/s` },
    { label: "File Size", value: `${result.sizeGb.toFixed(2)} GB` },
    { label: "Speed", value: `${result.speedMbps.toFixed(0)} Mbps` },
    { label: "Per Minute", value: `${result.gbPerMin.toFixed(2)} GB` },
    { label: "Per Hour", value: `${(result.gbPerMin * 60).toFixed(1)} GB` },
  ];

  const chartData = [
    { name: "File Size", value: result.sizeGb },
    { name: "Transferred in 1 min", value: Number(result.gbPerMin.toFixed(2)) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Data Transfer Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Data Transfer Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div>
              <label htmlFor="dt-size" className="block text-sm font-medium mb-1 text-foreground">File Size (GB)</label>
              <input id="dt-size" type="number" min="0" step="0.1" value={size} onChange={(e) => setSize(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label htmlFor="dt-speed" className="block text-sm font-medium mb-1 text-foreground">Connection Speed (Mbps)</label>
              <input id="dt-speed" type="number" min="0.1" value={speed} onChange={(e) => setSpeed(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <p className="text-xs text-muted-foreground mt-1">Typical: 50–100 Mbps home · 300–1000 Mbps fiber</p>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Download className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter a non-negative file size and a positive speed.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Estimated Transfer Time</div>
              <div className="text-4xl font-extrabold text-primary">{result.formatted}</div>
              <div className="text-sm text-muted-foreground mt-1">{result.sizeGb.toFixed(2)} GB at {result.speedMbps.toFixed(0)} Mbps ({result.speedMBs.toFixed(2)} MB/s)</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Throughput</div>
                <div className="text-lg font-bold text-primary">{result.speedMBs.toFixed(2)} MB/s</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Per Minute</div>
                <div className="text-lg font-bold text-primary">{result.gbPerMin.toFixed(2)} GB</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">In Seconds</div>
                <div className="text-lg font-bold text-primary">{result.seconds.toFixed(0)} s</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Metric</th>
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
              <h3 className="text-base font-bold mb-3">File Size vs One Minute of Transfer</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v.toFixed(2)} GB`, ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
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
            <h2 className="text-2xl font-bold mb-3">About the Data Transfer Calculator</h2>
            <p>Transfer time = file size ÷ real throughput. The critical conversion: 1 byte = 8 bits, so a 100 Mbps connection delivers 12.5 MB/s. A 2 GB file therefore takes 2,048 MB ÷ 12.5 MB/s ≈ 164 seconds, or about 2 minutes 44 seconds.</p>
            <h3>Why Real Speeds Differ</h3>
            <p>Advertised plans quote the line's maximum. TCP/IP overhead, Wi-Fi interference, server upload limits, and network congestion all reduce achievable throughput — expect 40–70% of plan speed over Wi-Fi, so budget extra time for large transfers.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/data-transfer-converter" />
          <PopularCalculators exclude="/calculator/data-transfer-converter" />
        </div>
      </div>
    </>
  );
}
