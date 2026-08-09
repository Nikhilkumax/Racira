"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, ChevronDown, Printer, Wifi, HardDrive, Clock, ArrowUpRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";
import { LazyView } from "@/components/ui/LazyView";

const DEFAULTS = {
  fileSize: "2",
  connectionSpeed: "100",
  showAdvanced: false,
  uploadSpeed: "10",
  overhead: "15",
  compression: "none",
};

interface BandwidthResult {
  downloadTimeSeconds: number;
  downloadTimeMinutes: number;
  uploadTimeSeconds: number;
  uploadTimeMinutes: number;
  effectiveSpeedMbps: number;
  fileSizeMB: number;
  fileSizeGB: number;
  compressionRatio: number;
  overheadLossPercent: number;
  chartData: { name: string; seconds: number; fill: string }[];
}

function safeParse(v: string): number {
  const n = parseFloat(v);
  return isNaN(n) || n < 0 ? 0 : n;
}

function calculate(inputs: typeof DEFAULTS): BandwidthResult {
  const fileSizeGB = safeParse(inputs.fileSize);
  const speedMbps = safeParse(inputs.connectionSpeed);
  const uploadSpeedMbps = safeParse(inputs.uploadSpeed);
  const overhead = safeParse(inputs.overhead);
  const compression = inputs.compression;

  const fileSizeMB = fileSizeGB * 1024;
  const fileSizeBits = fileSizeGB * 8589934592;
  const fileSizeMb = fileSizeBits / 1048576;

  let compressionRatio = 1;
  if (compression === "zip") compressionRatio = 0.5;
  else if (compression === "gzip") compressionRatio = 0.7;
  else if (compression === "rar") compressionRatio = 0.6;

  const effectiveSpeedMbps = speedMbps * (1 - overhead / 100);
  const downloadTimeSeconds = effectiveSpeedMbps > 0 ? (fileSizeMb * compressionRatio) / effectiveSpeedMbps : 0;
  const downloadTimeMinutes = downloadTimeSeconds / 60;

  const uploadTimeSeconds = uploadSpeedMbps > 0 ? (fileSizeMb * compressionRatio) / uploadSpeedMbps : 0;
  const uploadTimeMinutes = uploadTimeSeconds / 60;

  const overheadLossPercent = overhead;

  const chartSpeeds = [10, 25, 50, 100, 200, 500, 1000];
  const chartData = chartSpeeds.map((spd) => {
    const eff = spd * (1 - overhead / 100);
    const secs = eff > 0 ? (fileSizeMb * compressionRatio) / eff : 0;
    return {
      name: `${spd}`,
      seconds: Math.round(secs * 100) / 100,
      fill: spd === speedMbps ? "hsl(var(--primary))" : "#cbd5e1",
    };
  });

  return {
    downloadTimeSeconds: Math.round(downloadTimeSeconds * 100) / 100,
    downloadTimeMinutes: Math.round(downloadTimeMinutes * 100) / 100,
    uploadTimeSeconds: Math.round(uploadTimeSeconds * 100) / 100,
    uploadTimeMinutes: Math.round(uploadTimeMinutes * 100) / 100,
    effectiveSpeedMbps: Math.round(effectiveSpeedMbps * 100) / 100,
    fileSizeMB: Math.round(fileSizeMB * 100) / 100,
    fileSizeGB,
    compressionRatio,
    overheadLossPercent,
    chartData,
  };
}

const fmtTime = (secs: number): string => {
  if (secs <= 0) return "0s";
  if (secs < 60) return secs.toFixed(1) + "s";
  if (secs < 3600) {
    const m = Math.floor(secs / 60);
    const s = (secs % 60).toFixed(1);
    return `${m}m ${s}s`;
  }
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  return `${h}h ${m}m ${s}s`;
};

const CompactInput = ({ id, label, value, onChange, suffix }: { id: string; label: string; value: string; onChange: (val: string) => void; suffix?: string }) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1.5 text-foreground">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
      <input
        id={id}
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground"
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

export default function BandwidthCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<BandwidthResult>(calculate(DEFAULTS));
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
    { question: "Why is my download speed slower than my plan?", answer: "ISPs advertise 'up to' speeds. Real-world throughput is reduced by network overhead, Wi-Fi interference, server congestion, and the number of devices sharing your connection. A 100 Mbps plan often delivers 70–90 Mbps in practice." },
    { question: "Does upload speed matter for downloading?", answer: "Download speed is determined by the server's upload capacity and your download bandwidth. However, if you are transferring files between two locations you control, both ends' upload speeds become the bottleneck." },
    { question: "What is a good internet speed for streaming?", answer: "For 4K streaming, aim for at least 25 Mbps download per stream. For HD streaming, 5–10 Mbps is sufficient. Online gaming and video calls are more sensitive to latency (ping) than raw bandwidth." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Technology", href: "/calculator#technology" }, { label: "Bandwidth Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Bandwidth Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT - Inputs */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card rounded-xl">
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="fileSize" label="File Size" value={inputs.fileSize} onChange={(v: string) => updateVal("fileSize", v)} suffix="GB" />
              <CompactInput id="connectionSpeed" label="Connection Speed" value={inputs.connectionSpeed} onChange={(v: string) => updateVal("connectionSpeed", v)} suffix="Mbps" />
            </div>

            {/* Advanced Options */}
            <div>
              <button
                type="button"
                onClick={() => updateVal("showAdvanced", !inputs.showAdvanced)}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mt-1 focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${inputs.showAdvanced ? "rotate-180" : ""}`} />
              </button>

              {inputs.showAdvanced && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold flex items-center gap-1.5">
                      <ArrowUpRight className="h-3.5 w-3.5" /> Network Factors
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput id="uploadSpeed" label="Upload Speed" value={inputs.uploadSpeed} onChange={(v: string) => updateVal("uploadSpeed", v)} suffix="Mbps" />
                      <CompactInput id="overhead" label="Overhead" value={inputs.overhead} onChange={(v: string) => updateVal("overhead", v)} suffix="%" />
                    </div>
                    <div className="mt-3">
                      <SelectInput
                        id="compression"
                        label="Compression"
                        value={inputs.compression}
                        onChange={(v: string) => updateVal("compression", v)}
                        options={[
                          { value: "none", label: "None" },
                          { value: "gzip", label: "GZIP (~30%)" },
                          { value: "zip", label: "ZIP (~50%)" },
                          { value: "rar", label: "RAR (~40%)" },
                        ]}
                      />
                    </div>
                  </div>
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
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
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
                <Clock className="h-3.5 w-3.5" /> Download Time
              </div>
              <div className="text-4xl font-bold text-primary my-1">{fmtTime(result.downloadTimeSeconds)}</div>
              <div className="text-sm text-muted-foreground">{result.downloadTimeMinutes.toFixed(2)} minutes at effective speed</div>
            </div>

            {/* Component 2: 3-Stat Bar */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                <div className="text-xs font-bold text-muted-foreground mb-1 uppercase">Upload Time</div>
                <div className="text-lg font-bold text-foreground">{fmtTime(result.uploadTimeSeconds)}</div>
              </div>
              <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                <div className="text-xs font-bold text-muted-foreground mb-1 uppercase">Effective Speed</div>
                <div className="text-lg font-bold text-foreground">{result.effectiveSpeedMbps.toFixed(1)} Mbps</div>
              </div>
              <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                <div className="text-xs font-bold text-muted-foreground mb-1 uppercase">Overhead</div>
                <div className="text-lg font-bold text-foreground">{result.overheadLossPercent.toFixed(0)}%</div>
              </div>
            </div>

            {/* Component 3: Breakdown Table */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Component</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr>
                    <td className="text-base py-2.5 px-3 text-muted-foreground">File Size</td>
                    <td className="text-base py-2.5 px-3 text-right font-medium text-foreground">{result.fileSizeGB.toFixed(2)} GB ({result.fileSizeMB.toFixed(2)} MB)</td>
                  </tr>
                  <tr>
                    <td className="text-base py-2.5 px-3 text-muted-foreground">Effective Speed</td>
                    <td className="text-base py-2.5 px-3 text-right font-medium text-foreground">{result.effectiveSpeedMbps.toFixed(2)} Mbps</td>
                  </tr>
                  <tr>
                    <td className="text-base py-2.5 px-3 text-muted-foreground">Download Time</td>
                    <td className="text-base py-2.5 px-3 text-right font-medium text-foreground">{fmtTime(result.downloadTimeSeconds)} ({result.downloadTimeMinutes.toFixed(2)} min)</td>
                  </tr>
                  <tr>
                    <td className="text-base py-2.5 px-3 text-muted-foreground">Upload Time</td>
                    <td className="text-base py-2.5 px-3 text-right font-medium text-foreground">{fmtTime(result.uploadTimeSeconds)} ({result.uploadTimeMinutes.toFixed(2)} min)</td>
                  </tr>
                  <tr>
                    <td className="text-base py-2.5 px-3 text-muted-foreground">Overhead Loss</td>
                    <td className="text-base py-2.5 px-3 text-right font-medium text-foreground">{result.overheadLossPercent.toFixed(0)}%</td>
                  </tr>
                  {inputs.compression !== "none" && (
                    <tr>
                      <td className="text-base py-2.5 px-3 text-muted-foreground">Compression Ratio</td>
                      <td className="text-base py-2.5 px-3 text-right font-medium text-foreground">{(1 / result.compressionRatio).toFixed(1)}× smaller</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Component 4: Recharts BarChart */}
            {mounted && (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground mb-4">Download Time at Different Speeds</h3>
                <LazyView minHeight={250}>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} label={{ value: "Speed (Mbps)", position: "insideBottom", offset: -5, fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${v}s`} />
                      <RechartsTooltip cursor={{ fill: "transparent" }} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} formatter={(v: any) => [`${v} seconds`, "Download Time"]} />
                      <Bar dataKey="seconds" radius={[4, 4, 0, 0]}>
                        {result.chartData.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </LazyView>
              </div>
            )}

            {/* Component 5: Summary Statistics */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">File Size</span>
                  <span className="text-base font-bold text-foreground">{result.fileSizeGB.toFixed(2)} GB</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Connection Speed</span>
                  <span className="text-base font-bold text-foreground">{inputs.connectionSpeed} Mbps</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Upload Speed</span>
                  <span className="text-base font-bold text-foreground">{inputs.uploadSpeed} Mbps</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Overhead</span>
                  <span className="text-base font-bold text-foreground">{inputs.overhead}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Compression</span>
                  <span className="text-base font-bold text-foreground">{inputs.compression === "none" ? "None" : inputs.compression.toUpperCase()}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Effective Speed</span>
                  <span className="text-base font-bold text-primary">{result.effectiveSpeedMbps.toFixed(2)} Mbps</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SEO Article section */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding Bandwidth and File Transfer Times</h2>
            <p>
              Bandwidth is the maximum rate at which data can travel across a network connection, measured in megabits per second (Mbps). Download and upload times are determined by dividing the total file size by your effective connection speed, but theoretical maximums rarely match real-world performance. A 100 Mbps plan can move 100 megabits each second under ideal conditions, yet protocol overhead, network congestion, and server bottlenecks typically reduce usable throughput to 70–90% of the advertised figure. Our calculator applies the standard binary definitions where 1 byte equals 8 bits, 1 kilobyte equals 1024 bytes, and 1 megabyte equals 1,048,576 bytes. This ensures accurate estimates whether you are timing a small software update or a multi-gigabyte video production project.
            </p>

            <h2 className="text-2xl font-bold mb-3">How Network Overhead Affects Real-World Speeds</h2>
            <p>
              TCP/IP overhead is the hidden tax on every network transfer. Every data packet carries headers containing routing information, sequence numbers, and error-checking data. A typical overhead of 15% means roughly 15% of your bandwidth is consumed by protocol traffic rather than actual file content. Compression further changes the equation by reducing the raw data volume before transmission. ZIP compression often shrinks text-heavy files by 50–60%, while GZIP provides about 30% reduction on web assets. By entering these values into the advanced options, you can see how overhead and compression interact to produce real transfer times that differ dramatically from simple division. This is especially important for backup schedules and content delivery planning.
            </p>

            <h2 className="text-2xl font-bold mb-3">Planning Your Network and Choosing the Right ISP</h2>
            <p>
              Choosing the right internet plan requires understanding both your download and upload needs. Streaming 4K video demands at least 25 Mbps download per stream, while video conferencing and cloud backups depend heavily on upload speed, which is often an afterthought in residential plans. Fiber optic connections offer symmetric speeds, making them ideal for remote workers and creators who regularly send large files. After calculating your transfer times, compare speed tiers to identify the minimum bandwidth that keeps workflows smooth without paying for excess capacity. A household streaming 4K content and working from home may need 200+ Mbps, while basic browsing and email may only require 25 Mbps. Use the results to justify plan upgrades or to identify whether your current bottleneck is the connection itself.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/bandwidth-calculator" />
          <PopularCalculators exclude="/calculator/bandwidth-calculator" />
        </div>
      </div>
    </>
  );
}
