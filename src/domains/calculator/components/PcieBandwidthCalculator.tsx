"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown, Cpu, Database, Zap, Printer } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type PcieVersion = "1_0" | "2_0" | "3_0" | "4_0" | "5_0" | "6_0" | "7_0";
type LinkWidth = 1 | 2 | 4 | 8 | 16;
type Direction = "tx" | "rx";

interface PcieInputs {
  version: PcieVersion;
  lanes: LinkWidth;
  proMode: boolean;
  maxPayload: number;
  readWriteMix: number;
  direction: Direction;
}

interface ChartPoint {
  name: string;
  gbps: number;
  isSubject: boolean;
}

interface TableRow {
  label: string;
  value: string;
  key?: boolean;
}

interface PcieResult {
  rawGbps: number;
  encodeOverhead: number;
  dataGbps: number;
  dataGBps: number;
  pcie2BytesPerSecond: number;
  tlpOverhead: number;
  effectiveGBps: number;
  effectiveGbps: number;
  efficiencyPercent: number;
  chartData: ChartPoint[];
  rows: TableRow[];
  maxReadIOps: number;
  maxWriteIOps: number;
  maxMixedIOps: number;
  readRttMicroseconds: number;
}

// Per-lane data rates in GT/s per direction and the encoding overhead that
// converts raw link speed to usable data rate.
const VERSIONS: { key: PcieVersion; label: string; gbpsPerLane: number; encoding: number }[] = [
  { key: "1_0", label: "PCIe 1.0/1.1", gbpsPerLane: 2.5, encoding: 8 / 10 },
  { key: "2_0", label: "PCIe 2.0/2.1", gbpsPerLane: 5.0, encoding: 8 / 10 },
  { key: "3_0", label: "PCIe 3.0/3.1", gbpsPerLane: 8.0, encoding: 128 / 130 },
  { key: "4_0", label: "PCIe 4.0", gbpsPerLane: 16.0, encoding: 128 / 130 },
  { key: "5_0", label: "PCIe 5.0", gbpsPerLane: 32.0, encoding: 128 / 130 },
  { key: "6_0", label: "PCIe 6.0", gbpsPerLane: 64.0, encoding: 242 / 256 },
  { key: "7_0", label: "PCIe 7.0 (in development)", gbpsPerLane: 128.0, encoding: 242 / 256 },
];

const DEFAULTS: PcieInputs = {
  version: "4_0",
  lanes: 16,
  proMode: false,
  maxPayload: 256,
  readWriteMix: 70,
  direction: "tx",
};

export function calculatePcie(i: PcieInputs): PcieResult {
  const spec = VERSIONS.find((v) => v.key === i.version) ?? VERSIONS[3];
  const lanes = i.lanes;

  // Raw bidirectional link rate. In the PCIe standard, the raw bit rate is
  // symmetric: each direction gets the full lane count.
  const rawGbps = spec.gbpsPerLane * lanes;
  const dataGbps = rawGbps * spec.encoding;
  const dataGBps = dataGbps / 8;

  // PCIe 2.x defined the legacy "PCIe 2.0 bandwidth" figure of 500 MB/s per
  // lane per direction, which is the 8b/10b data rate rounded to a round number.
  const pcie2BytesPerSecond = i.version === "1_0" ? (lanes * 250) / 1000 : (lanes * 500) / 1000;

  // TLP overhead: each transaction layer packet carries a 12-16 byte header plus
  // up to 4 bytes of CRC (end-to-end CRC added in 3.0+), so real-world efficiency
  // sits around 86-92%. Using the midpoint of the typical range.
  const tlpOverhead = 0.11;
  const effectiveGBps = dataGBps * (1 - tlpOverhead);
  const effectiveGbps = effectiveGBps * 8;
  const efficiencyPercent = (effectiveGbps / rawGbps) * 100;

  const chartData: ChartPoint[] = [
    { name: `${spec.label} x${lanes}`, gbps: Math.round(rawGbps), isSubject: true },
    ...VERSIONS.filter((v) => v.key !== i.version).map((v) => ({
      name: `${v.label} x${lanes}`,
      gbps: Math.round(v.gbpsPerLane * lanes),
      isSubject: false,
    })),
  ];

  // IOPS model: a 4 KiB transaction takes one round trip plus transfer time.
  // RTT at 4.0 x16 is roughly 1-2 microseconds with modern root complexes.
  // Reads pay the full round trip before data returns; posted writes are
  // fire-and-forget, so the transmit direction sees the lower latency penalty.
  const payload = Math.max(128, i.maxPayload);
  const bytesPerPayload = payload / 1024; // KiB
  const dataKiBs = (dataGBps * 1_048_576) / bytesPerPayload; // transactions/s theoretical
  const readRttSeconds = i.direction === "tx" ? 1.5e-6 : 2.0e-6;
  const writeRttSeconds = i.direction === "tx" ? 0.5e-6 : 0.8e-6;
  const maxReadIOps = Math.floor(dataKiBs / (1 + readRttSeconds * dataKiBs));
  const maxWriteIOps = Math.floor(dataKiBs / (1 + writeRttSeconds * dataKiBs));
  const mix = Math.min(100, Math.max(0, i.readWriteMix)) / 100;
  const maxMixedIOps =
    maxReadIOps > 0 && maxWriteIOps > 0
      ? Math.floor(1 / (mix / maxReadIOps + (1 - mix) / maxWriteIOps))
      : 0;

  const num = (v: number, d = 1) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

  const rows: TableRow[] = [
    { label: "PCIe Version", value: spec.label },
    { label: "Link Width", value: `x${lanes}` },
    { label: "Raw Link Rate", value: `${num(rawGbps, 0)} Gb/s (${num(rawGbps / 8, 0)} GB/s)` },
    { label: `Encoding Overhead (${(1 - spec.encoding) * 100}%)`, value: `${num(dataGbps, 0)} Gb/s after 8b/10b or 128b/130b` },
    { label: "Data Rate (each direction)", value: `${num(dataGBps, 1)} GB/s`, key: true },
    { label: "TLP/Packet Overhead (est.)", value: `${num(tlpOverhead * 100, 0)}%` },
    { label: "Typical Effective Throughput", value: `${num(effectiveGBps, 2)} GB/s` },
    { label: "Raw Efficiency", value: `${num(efficiencyPercent, 1)}%` },
    { label: "Payload Size", value: `${payload} B` },
    { label: `Max Read IOPS (${payload >= 1024 ? `${payload / 1024} KiB` : `${payload} B`})`, value: `${maxReadIOps.toLocaleString("en-US")}` },
    { label: `Max Write IOPS (${payload >= 1024 ? `${payload / 1024} KiB` : `${payload} B`})`, value: `${maxWriteIOps.toLocaleString("en-US")}` },
    { label: `Mixed R/W IOPS (${Math.round(mix * 100)}/${100 - Math.round(mix * 100)})`, value: `${maxMixedIOps.toLocaleString("en-US")}` },
  ];

  return {
    rawGbps,
    encodeOverhead: spec.encoding,
    dataGbps,
    dataGBps,
    pcie2BytesPerSecond,
    tlpOverhead,
    effectiveGBps,
    effectiveGbps,
    efficiencyPercent,
    chartData,
    rows,
    maxReadIOps,
    maxWriteIOps,
    maxMixedIOps,
    readRttMicroseconds: readRttSeconds * 1e6,
  };
}

const inp =
  "w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20";
const lbl = "text-sm font-medium text-foreground mb-1 block";
const groupLabel =
  "text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold flex items-center gap-1.5";

export default function PcieBandwidthCalculator() {
  const [inputs, setInputs] = useState<PcieInputs>(DEFAULTS);
  const [result, setResult] = useState<PcieResult>(calculatePcie(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculatePcie(inputs));
  }, []);

  const calculate = () => setResult(calculatePcie(inputs));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculatePcie(DEFAULTS));
    setShowAdvanced(false);
  };

  const setNum = (key: keyof PcieInputs, raw: string) => {
    const parsed = parseFloat(raw);
    setInputs((prev) => ({ ...prev, [key]: isNaN(parsed) ? 0 : parsed }));
  };

  const num = (v: number, d = 1) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

  const faqs = [
    {
      question: "How is PCIe bandwidth calculated?",
      answer:
        "Multiply the per-lane data rate by the lane count, then apply the encoding overhead. A PCIe 4.0 x16 link runs 16 lanes at 16 GT/s each, giving 256 Gb/s raw; the 128b/130b encoding leaves 252.3 Gb/s, or 31.5 GB/s per direction. PCIe 3.0 and later use 128b/130b encoding (about 1.5% overhead) while PCIe 1.x and 2.x use 8b/10b (20% overhead), which is why the older generations look comparatively worse for the same raw rate.",
    },
    {
      question: "Is PCIe bandwidth bidirectional or one-way?",
      answer:
        "Both, depending on how you quote it. Each direction gets the full lane count and the full data rate, so a 4.0 x16 link delivers 31.5 GB/s simultaneously in each direction. The marketing figure you usually see — '32 GB/s' for PCIe 4.0 x16 — is the per-direction rate. Summing both directions gives roughly double, 64 GB/s aggregate, but that figure is misleading for workloads that mostly move data one way.",
    },
    {
      question: "Why is PCIe 5.0 exactly twice PCIe 4.0?",
      answer:
        "Because each generation doubles the per-lane transfer rate: 2.5, 5, 8, 16, 32, 64, then 128 GT/s for PCIe 7.0. The rate is measured in gigatransfers per second — one bit per lane per transfer — so raw bandwidth per lane doubles each generation. Note that the jump from 2.0 to 3.0 was only 60% (5 to 8 GT/s), and the efficiency gain from the better encoding made the practical improvement seem larger.",
    },
    {
      question: "What is 128b/130b encoding and why does it matter?",
      answer:
        "It is the line code PCIe 3.0 and later use to keep the receiver clocked from the data stream: every 130 transmitted bits carry 128 data bits. The 1.54% overhead is the price of the clocking scheme. PCIe 1.x and 2.x used 8b/10b, which wastes a full 20%. The encoding choice is why a 5 GT/s PCIe 2.0 lane moves 500 MB/s while an 8 GT/s PCIe 3.0 lane moves about 985 MB/s, not simply 60% more.",
    },
    {
      question: "Why don't real drives reach the theoretical number?",
      answer:
        "Theoretical bandwidth assumes ideal packets and no overhead. Real traffic pays transaction-layer overhead — each TLP carries a header, plus CRC in PCIe 3.0 and later — and NVMe controllers add command overhead, completion processing, and round-trip latency. Practical throughput typically lands at 85 to 92% of the data rate. The gap widens with small transfers, where headers consume a larger share of each packet.",
    },
    {
      question: "Does a PCIe 4.0 drive work in a PCIe 3.0 slot?",
      answer:
        "Yes, at the slower speed. PCIe is backward compatible: a 4.0 device in a 3.0 slot negotiates a 3.0 link, so the drive runs at roughly half its rated throughput. The reverse is also fine — a 3.0 device in a 4.0 slot runs at 3.0 speeds. For NVMe drives the practical difference depends on the workload; sequential transfers see the big gap, while random IOPS are often limited by the drive and controller rather than the link.",
    },
    {
      question: "How many lanes do GPUs, NVMe drives, and NICs need?",
      answer:
        "High-end GPUs use x16 and saturate it with modern workloads. NVMe drives commonly use x4, and a single x4 PCIe 4.0 link at about 7.9 GB/s exceeds most drives' capabilities. 100 Gb/s NICs use x16 on PCIe 4.0 or x8 on PCIe 5.0, since the link must carry more than the network rate. When the device's link is smaller than the CPU provides, the device caps the bandwidth regardless of slot size.",
    },
    {
      question: "What limits PCIe bandwidth in practice?",
      answer:
        "Beyond the raw rate, the effective limits are root-complex routing, shared link bandwidth (some chipsets share lanes among devices), and protocol overhead. PCIe switches divide bandwidth among their downstream ports, so four drives behind one switch share that switch's upstream link. For small random reads the round-trip latency dominates — a 4 KiB read cannot exceed roughly one transaction per round trip, which is why IOPS, not GB/s, is the honest metric for that workload.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Technology", href: "/calculator/technology" },
          { label: "PCIe Bandwidth Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">PCIe Bandwidth Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card rounded-xl">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="version" className={lbl}>PCIe Version</label>
                <select id="version" className={inp} value={inputs.version}
                  onChange={(e) => setInputs((p) => ({ ...p, version: e.target.value as PcieVersion }))}>
                  {VERSIONS.map((v) => (
                    <option key={v.key} value={v.key}>{v.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="lanes" className={lbl}>Link Width</label>
                <select id="lanes" className={inp} value={inputs.lanes}
                  onChange={(e) => setInputs((p) => ({ ...p, lanes: Number(e.target.value) as LinkWidth }))}>
                  {([1, 2, 4, 8, 16] as LinkWidth[]).map((l) => (
                    <option key={l} value={l}>x{l}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>

              {showAdvanced ? (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div>
                    <div className={groupLabel}>
                      <Database className="h-3.5 w-3.5" /> Transaction Model
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="maxPayload" className={lbl}>Max Payload Size (B)</label>
                        <select id="maxPayload" className={inp} value={inputs.maxPayload}
                          onChange={(e) => setNum("maxPayload", e.target.value)}>
                          <option value="128">128 B</option>
                          <option value="256">256 B</option>
                          <option value="512">512 B</option>
                          <option value="4096">4096 B (4 KiB)</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="readWriteMix" className={lbl}>Read Share (%)</label>
                        <input id="readWriteMix" type="number" min="0" max="100" step="5" className={inp}
                          value={inputs.readWriteMix} onChange={(e) => setNum("readWriteMix", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className={groupLabel}>
                      <Zap className="h-3.5 w-3.5" /> Professional Mode
                    </div>
                    <label htmlFor="proMode" className="flex items-center gap-2 text-sm font-medium text-foreground mb-3 cursor-pointer">
                      <input id="proMode" type="checkbox" className="h-4 w-4 accent-primary" checked={inputs.proMode}
                        onChange={(e) => setInputs((p) => ({ ...p, proMode: e.target.checked }))} />
                      Unlock IOPS and per-packet overhead estimates
                    </label>
                    {inputs.proMode ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="direction" className={lbl}>Direction</label>
                          <select id="direction" className={inp} value={inputs.direction}
                            onChange={(e) => setInputs((p) => ({ ...p, direction: e.target.value as Direction }))}>
                            <option value="tx">Transmit (device → CPU)</option>
                            <option value="rx">Receive (CPU → device)</option>
                          </select>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex gap-2.5 mt-2.5">
              <button type="button" onClick={calculate}
                className="h-10 w-full flex-1 flex items-center justify-center rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-base transition-all active:scale-[0.98] shadow-sm">
                Calculate
              </button>
              <button type="button" onClick={reset} aria-label="Reset"
                className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 focus:outline-none">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
              <div className="flex justify-end absolute top-3 right-3">
                <button type="button" onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
              </div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Data Rate (per direction)</div>
              <div className="text-4xl font-bold text-primary my-1">{num(result.dataGBps, 2)} GB/s</div>
              <div className="text-sm text-muted-foreground">
                {num(result.dataGbps, 1)} Gb/s after encoding — {num(result.rawGbps, 0)} Gb/s raw
              </div>
            </div>

            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              <div className="p-4 text-center">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Raw Rate</div>
                <div className="text-lg font-bold text-emerald-600">{num(result.rawGbps, 0)} Gb/s</div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Effective</div>
                <div className="text-lg font-bold text-amber-600">{num(result.effectiveGBps, 2)} GB/s</div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Efficiency</div>
                <div className="text-lg font-bold text-red-600">{num(result.efficiencyPercent, 1)}%</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Metric</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {result.rows.map((row) => (
                    <tr key={row.label} className={row.key ? "bg-primary/5" : ""}>
                      <td className={`text-base py-2.5 px-3 ${row.key ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{row.label}</td>
                      <td className={`text-base py-2.5 px-3 text-right font-medium ${row.key ? "text-primary font-bold" : "text-foreground"}`}>{row.value}</td>
                    </tr>
                  ))}
                  <tr className="font-bold border-t-2 border-border">
                    <td className="text-base py-2.5 px-3 text-foreground">Raw Link Rate</td>
                    <td className="text-base py-2.5 px-3 text-right text-primary">{num(result.rawGbps, 0)} Gb/s</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {mounted ? (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground mb-3">Raw Rate Across Versions (same lane width)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-35} textAnchor="end" height={70} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${v}`} />
                    <RTooltip formatter={(value: number) => `${value} Gb/s raw`}
                      contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                    <Bar dataKey="gbps" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((point) => (
                        <Cell key={point.name} fill={point.isSubject ? "#2563EB" : "#94A3B8"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#2563EB" }} /> Your link
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#94A3B8" }} /> Other versions
                  </div>
                </div>
              </div>
            ) : null}

            {inputs.proMode ? (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-bold text-foreground mb-3">IOPS &amp; Transaction Analysis</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                      Max Read IOPS ({inputs.maxPayload >= 1024 ? `${inputs.maxPayload / 1024} KiB` : `${inputs.maxPayload} B`})
                    </div>
                    <div className="text-base font-bold text-foreground">{result.maxReadIOps.toLocaleString("en-US")}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                      Max Write IOPS ({inputs.maxPayload >= 1024 ? `${inputs.maxPayload / 1024} KiB` : `${inputs.maxPayload} B`})
                    </div>
                    <div className="text-base font-bold text-foreground">{result.maxWriteIOps.toLocaleString("en-US")}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Mixed R/W IOPS ({inputs.readWriteMix}/{100 - inputs.readWriteMix})</div>
                    <div className="text-base font-bold text-foreground">{result.maxMixedIOps.toLocaleString("en-US")}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                      Assumed Read RTT ({inputs.direction === "tx" ? "transmit" : "receive"})
                    </div>
                    <div className="text-base font-bold text-foreground">{num(result.readRttMicroseconds, 1)} µs</div>
                  </div>
                  <div className="col-span-2 pt-1">
                    <div className="text-sm text-muted-foreground">
                      Small transfers are latency-bound, not bandwidth-bound: a 4 KiB read cannot exceed roughly one
                      transaction per round trip. These are modelling estimates — real controllers, drives, and root
                      complexes vary.
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="grid grid-cols-2 gap-4">
                {result.rows.map((row) => (
                  <div key={row.label} className="flex flex-col">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">{row.label}</span>
                    <span className={`text-base font-bold ${row.key ? "text-primary" : "text-foreground"}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">From GT/s to GB/s: What the Numbers Really Mean</h2>
            <p className="mb-4">
              PCIe bandwidth is quoted in gigatransfers per second per lane, and the arithmetic from there is
              multiplication and subtraction: per-lane rate times lane count gives the raw link rate, and subtracting the
              encoding overhead gives the usable data rate. A PCIe 4.0 x16 link therefore runs 256 Gb/s raw, 252.3 Gb/s
              after 128b/130b encoding, or 31.5 GB/s per direction. The headline '32 GB/s' figure is the per-direction
              rate. Summing both directions doubles it, but that aggregate number flatters workloads that mostly move data
              one way, and PCIe is genuinely full-duplex — both directions are available simultaneously.
            </p>

            <h2 className="text-2xl font-bold mb-3">Why the Encoding Overhead Skews the Generations</h2>
            <p className="mb-4">
              PCIe 1.x and 2.x use 8b/10b line encoding, which burns 20% of every byte in clock-recovery overhead. PCIe
              3.0 and later switched to 128b/130b, cutting the waste to 1.54%, and PCIe 6.0 moved to PAM4 signalling with
              242b/256b. This is why the 2.0-to-3.0 jump looked larger in practice than the raw numbers suggest: 5 GT/s at
              8b/10b delivers 500 MB/s per lane while 8 GT/s at 128b/130b delivers about 985 MB/s — nearly doubling usable
              bandwidth for a 60% raw increase. Each generation doubles the per-lane transfer rate, and the encoding
              choice determines how much of that survives to the data layer.
            </p>

            <h2 className="text-2xl font-bold mb-3">The Gap Between Theoretical and Real Throughput</h2>
            <p className="mb-4">
              Every transaction-layer packet carries a header — 12 to 16 bytes — plus CRC in PCIe 3.0 and later, so real
              workloads land at 85 to 92% of the data rate even before the device controller adds its own overhead. The
              gap widens sharply with small transfers, where fixed per-packet costs consume a larger share of each
              transaction. This is also why a PCIe 4.0 NVMe drive in a PCIe 3.0 slot loses roughly half its sequential
              throughput while its random IOPS may barely change — random performance is usually limited by the drive's
              controller and NAND latency, not the link.
            </p>

            <h2 className="text-2xl font-bold mb-3">Bandwidth Versus IOPS: Picking the Honest Metric</h2>
            <p>
              For large sequential transfers, bandwidth is the metric that matters and the encoding math above gives a
              solid ceiling. For small random reads, latency dominates: a 4 KiB read takes a round trip regardless of link
              speed, so maximum IOPS is bounded by one transaction per round trip, not by gigabytes per second. The
              Professional Mode model here estimates read, write, and mixed IOPS from payload size and an assumed round
              trip, which is a better predictor of NVMe random-read performance than any bandwidth figure. As with all
              estimates, treat the output as a planning tool rather than a specification — controllers, drives, switches,
              and root complexes all add their own behaviour between the spec sheet and the benchmark.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/pcie-bandwidth-calculator" />
          <PopularCalculators exclude="/calculator/pcie-bandwidth-calculator" />
        </div>
      </div>
    </>
  );
}
