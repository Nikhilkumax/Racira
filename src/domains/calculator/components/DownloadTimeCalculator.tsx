"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown, Wifi, Clock, Activity } from "lucide-react";
import { BarChart as RBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Cell } from "recharts";

/* ============================================================
   Download Time Calculator
   Converts a file size and a link speed into a realistic
   transfer time, accounting for protocol overhead, shared-line
   contention and per-connection throughput caps.
   ============================================================ */

type SizeUnit = "KB" | "MB" | "GB" | "TB";
type SpeedUnit = "Kbps" | "Mbps" | "Gbps" | "MBps";

const SIZE_BYTES: Record<SizeUnit, number> = {
  KB: 1024,
  MB: 1024 ** 2,
  GB: 1024 ** 3,
  TB: 1024 ** 4,
};

/* Bits per second for each speed unit (MBps is bytes, so x8) */
const SPEED_BPS: Record<SpeedUnit, number> = {
  Kbps: 1_000,
  Mbps: 1_000_000,
  Gbps: 1_000_000_000,
  MBps: 8_000_000,
};

/* Typical real-world efficiency by connection type - protocol
   overhead plus contention, as a usable share of sync speed */
interface ConnectionProfile {
  key: string;
  label: string;
  efficiency: number;
  note: string;
}

const CONNECTIONS: ConnectionProfile[] = [
  { key: "fiber", label: "Fiber (FTTH)", efficiency: 0.94, note: "Low overhead, symmetric, minimal contention" },
  { key: "cable", label: "Cable (DOCSIS)", efficiency: 0.85, note: "Shared neighborhood segment, evening slowdowns" },
  { key: "dsl", label: "DSL / VDSL", efficiency: 0.82, note: "Distance-sensitive, PPPoE encapsulation overhead" },
  { key: "wifi6", label: "Wi-Fi 6", efficiency: 0.75, note: "OFDMA improves airtime efficiency under load" },
  { key: "wifi5", label: "Wi-Fi 5", efficiency: 0.65, note: "Half-duplex airtime sharing, signal attenuation" },
  { key: "fiveg", label: "5G", efficiency: 0.78, note: "High peak rates, coverage-dependent" },
  { key: "lte", label: "4G LTE", efficiency: 0.7, note: "Cell load and signal quality dominate" },
  { key: "satellite", label: "Satellite", efficiency: 0.6, note: "High latency degrades TCP throughput" },
];

interface DownloadInputs {
  fileSize: string;
  sizeUnit: SizeUnit;
  speed: string;
  speedUnit: SpeedUnit;
  connection: string;
  overheadPct: string;
  concurrentUsers: string;
  proMode: boolean;
  perConnectionCapMbps: string;
  parallelStreams: string;
}

interface BreakdownRow {
  label: string;
  value: string;
  highlight?: boolean;
}

interface DownloadResult {
  valid: boolean;
  totalBytes: number;
  rawBps: number;
  effectiveBps: number;
  seconds: number;
  idealSeconds: number;
  overheadSeconds: number;
  effectiveMBps: number;
  efficiencyPct: number;
  profileLabel: string;
  profileNote: string;
  rows: BreakdownRow[];
  chartData: { name: string; seconds: number; fill: string }[];
  proParallelSeconds: number;
  proCappedMBps: number;
}

const DEFAULTS: DownloadInputs = {
  fileSize: "8",
  sizeUnit: "GB",
  speed: "300",
  speedUnit: "Mbps",
  connection: "cable",
  overheadPct: "0",
  concurrentUsers: "1",
  proMode: false,
  perConnectionCapMbps: "0",
  parallelStreams: "4",
};

const formatDuration = (totalSeconds: number): string => {
  if (!isFinite(totalSeconds) || totalSeconds <= 0) return "0s";
  if (totalSeconds < 1) return `${(totalSeconds * 1000).toFixed(0)} ms`;

  const d = Math.floor(totalSeconds / 86400);
  const h = Math.floor((totalSeconds % 86400) / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);

  const parts: string[] = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  if (s || parts.length === 0) parts.push(`${s}s`);
  return parts.slice(0, 3).join(" ");
};

const calculateDownload = (inputs: DownloadInputs): DownloadResult => {
  const size = parseFloat(inputs.fileSize);
  const speed = parseFloat(inputs.speed);

  const profile = CONNECTIONS.find((c) => c.key === inputs.connection) ?? CONNECTIONS[0];

  const empty: DownloadResult = {
    valid: false,
    totalBytes: 0,
    rawBps: 0,
    effectiveBps: 0,
    seconds: 0,
    idealSeconds: 0,
    overheadSeconds: 0,
    effectiveMBps: 0,
    efficiencyPct: 0,
    profileLabel: profile.label,
    profileNote: profile.note,
    rows: [],
    chartData: [],
    proParallelSeconds: 0,
    proCappedMBps: 0,
  };

  if (isNaN(size) || size <= 0 || isNaN(speed) || speed <= 0) return empty;

  const totalBytes = size * SIZE_BYTES[inputs.sizeUnit];
  const totalBits = totalBytes * 8;
  const rawBps = speed * SPEED_BPS[inputs.speedUnit];

  const extraOverhead = Math.max(0, Math.min(95, parseFloat(inputs.overheadPct) || 0)) / 100;
  const users = Math.max(1, Math.floor(parseFloat(inputs.concurrentUsers) || 1));

  const efficiency = profile.efficiency * (1 - extraOverhead);
  let effectiveBps = (rawBps * efficiency) / users;

  /* Professional - a per-connection cap throttles a single stream;
     parallel streams recover throughput up to the shared line rate */
  const cap = Math.max(0, parseFloat(inputs.perConnectionCapMbps) || 0) * SPEED_BPS.Mbps;
  const streams = Math.max(1, Math.floor(parseFloat(inputs.parallelStreams) || 1));
  let proParallelSeconds = 0;
  if (inputs.proMode && cap > 0) {
    const singleStream = Math.min(cap, effectiveBps);
    const parallel = Math.min(cap * streams, effectiveBps);
    effectiveBps = singleStream;
    proParallelSeconds = parallel > 0 ? totalBits / parallel : 0;
  }

  const seconds = effectiveBps > 0 ? totalBits / effectiveBps : 0;
  const idealSeconds = rawBps > 0 ? totalBits / rawBps : 0;
  const overheadSeconds = Math.max(0, seconds - idealSeconds);
  const effectiveMBps = effectiveBps / 8 / SIZE_BYTES.MB;
  const efficiencyPct = rawBps > 0 ? (effectiveBps / rawBps) * 100 : 0;

  const rows: BreakdownRow[] = [
    { label: "File size", value: `${size.toLocaleString("en-US", { maximumFractionDigits: 2 })} ${inputs.sizeUnit}` },
    { label: "File size in bits", value: totalBits.toLocaleString("en-US", { maximumFractionDigits: 0 }) },
    { label: "Advertised line speed", value: `${speed.toLocaleString("en-US")} ${inputs.speedUnit}` },
    { label: "Connection type", value: profile.label },
    { label: "Protocol efficiency", value: `${(profile.efficiency * 100).toFixed(0)}%` },
    { label: "Extra overhead applied", value: `${(extraOverhead * 100).toFixed(1)}%` },
    { label: "Devices sharing the line", value: `${users}` },
    { label: "Effective throughput", value: `${effectiveMBps.toLocaleString("en-US", { maximumFractionDigits: 2 })} MB/s` },
    { label: "Best-case time (full line rate)", value: formatDuration(idealSeconds) },
    { label: "Time lost to overhead", value: formatDuration(overheadSeconds) },
    { label: "Realistic download time", value: formatDuration(seconds), highlight: true },
  ];

  const chartData = CONNECTIONS.map((c) => {
    const bps = (rawBps * c.efficiency * (1 - extraOverhead)) / users;
    return {
      name: c.label.split(" ")[0],
      seconds: bps > 0 ? totalBits / bps : 0,
      fill: c.key === profile.key ? "hsl(217 91% 60%)" : "hsl(215 16% 65%)",
    };
  });

  return {
    valid: true,
    totalBytes,
    rawBps,
    effectiveBps,
    seconds,
    idealSeconds,
    overheadSeconds,
    effectiveMBps,
    efficiencyPct,
    profileLabel: profile.label,
    profileNote: profile.note,
    rows,
    chartData,
    proParallelSeconds,
    proCappedMBps: cap / 8 / SIZE_BYTES.MB,
  };
};

const num = (n: number, d = 2) => n.toLocaleString("en-US", { maximumFractionDigits: d });

const inp = "w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20";
const lbl = "text-sm font-medium text-foreground mb-1 block";
const groupLabel = "text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold flex items-center gap-1.5";

const FAQS = [
  {
    question: "Why is my download slower than the speed I pay for?",
    answer:
      "The number on your bill is the sync rate of the line, not the rate at which file data lands on your disk. Roughly 3 to 8 percent disappears into TCP/IP, Ethernet and (on DSL) PPPoE headers before anything else happens. On top of that sit shared-medium contention, Wi-Fi airtime overhead, server-side throttling and disk write speed. A 300 Mbps cable plan realistically delivers around 32 MB/s of file throughput rather than the 37.5 MB/s the arithmetic alone suggests.",
  },
  {
    question: "What is the difference between Mbps and MB/s?",
    answer:
      "Mbps is megabits per second and MB/s is megabytes per second. There are eight bits in a byte, so you divide by eight to convert: a 100 Mbps connection tops out near 12.5 MB/s. Internet providers advertise in bits because the number is eight times larger and sounds better, while operating systems report progress in bytes because that is how files are measured. Mixing the two is the single most common reason a download appears eight times slower than expected.",
  },
  {
    question: "Does Wi-Fi really cut my speed that much?",
    answer:
      "It can. Wi-Fi is half-duplex, so a radio cannot transmit and receive at the same instant, and every device on the channel takes turns. Wi-Fi 5 commonly delivers 60 to 70 percent of the wired rate at a good signal level and far less through walls. Wi-Fi 6 adds OFDMA and improved scheduling, lifting typical efficiency to about 75 percent and holding up much better when many devices are active. A wired connection remains the reliable choice for large transfers.",
  },
  {
    question: "Why does a download start fast and then slow down?",
    answer:
      "Two effects usually overlap. TCP slow-start ramps the transfer window up over the first few seconds, so the opening burst can look faster than the sustained rate. Meanwhile many drives and NAS devices have a fast write cache — SSD SLC cache or a RAM buffer — that fills after a few gigabytes, after which writes fall back to the slower native speed. If the download stalls at a steady lower rate, storage rather than the network is often the limit.",
  },
  {
    question: "How do multiple devices on the same connection affect download time?",
    answer:
      "Bandwidth is shared, so a 500 Mbps line supporting four simultaneous heavy users gives each roughly 125 Mbps under fair queuing. Streaming video, cloud backups and game updates are the usual culprits. Setting the concurrent-devices field models an even split, which is a reasonable approximation for a household router using fair queuing. Quality-of-service rules can weight the split deliberately.",
  },
  {
    question: "Will parallel connections make a download faster?",
    answer:
      "Only when a per-connection limit is what constrains you. Many servers and CDNs cap a single stream to keep one client from monopolizing capacity. Splitting the file across several streams — what download managers and BitTorrent do — bypasses that per-stream cap and can multiply throughput up to your line rate. If your own line is already saturated, extra streams simply divide the same bandwidth and add overhead. Professional Mode models both cases.",
  },
  {
    question: "Does latency matter for download speed?",
    answer:
      "Yes, especially over long distances and on satellite. TCP throughput is bounded by the window size divided by the round-trip time, so high latency limits how much data can be in flight regardless of raw bandwidth. A satellite link with 600 ms of round-trip delay struggles to fill its capacity with a single stream even when the advertised speed is high. This is why the satellite profile carries a lower efficiency and why parallel streams help so much on those links.",
  },
  {
    question: "How accurate is this estimate?",
    answer:
      "It gives a realistic planning range rather than a guarantee. The efficiency figures reflect typical measured performance for each connection type in good conditions. Actual results move with server capacity, time of day, route congestion, Wi-Fi signal, and the write speed of the destination drive. Treat the result as a sound estimate for scheduling a large transfer, and use the extra-overhead field to model a congested network.",
  },
];

export default function DownloadTimeCalculator() {
  const [inputs, setInputs] = useState<DownloadInputs>(DEFAULTS);
  const [result, setResult] = useState<DownloadResult>(calculateDownload(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculateDownload(inputs));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = <K extends keyof DownloadInputs>(key: K, val: DownloadInputs[K]) =>
    setInputs((prev) => ({ ...prev, [key]: val }));

  const handleCalculate = () => setResult(calculateDownload(inputs));

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculateDownload(DEFAULTS));
    setShowAdvanced(false);
  };

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Technology", href: "/calculator#technology" },
          { label: "Download Time Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Download Time Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* ───────── INPUT PANEL ───────── */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div>
              <label className={lbl} htmlFor="dt-size">File Size</label>
              <div className="flex gap-2">
                <input
                  id="dt-size"
                  type="number"
                  min="0"
                  step="any"
                  value={inputs.fileSize}
                  onChange={(e) => set("fileSize", e.target.value)}
                  className={inp}
                />
                <select
                  aria-label="File size unit"
                  value={inputs.sizeUnit}
                  onChange={(e) => set("sizeUnit", e.target.value as SizeUnit)}
                  className={`${inp} w-28`}
                >
                  {(["KB", "MB", "GB", "TB"] as SizeUnit[]).map((x) => (
                    <option key={x} value={x}>{x}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={lbl} htmlFor="dt-speed">Connection Speed</label>
              <div className="flex gap-2">
                <input
                  id="dt-speed"
                  type="number"
                  min="0"
                  step="any"
                  value={inputs.speed}
                  onChange={(e) => set("speed", e.target.value)}
                  className={inp}
                />
                <select
                  aria-label="Speed unit"
                  value={inputs.speedUnit}
                  onChange={(e) => set("speedUnit", e.target.value as SpeedUnit)}
                  className={`${inp} w-28`}
                >
                  {(["Kbps", "Mbps", "Gbps", "MBps"] as SpeedUnit[]).map((x) => (
                    <option key={x} value={x}>{x}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={lbl} htmlFor="dt-conn">Connection Type</label>
              <select
                id="dt-conn"
                value={inputs.connection}
                onChange={(e) => set("connection", e.target.value)}
                className={inp}
              >
                {CONNECTIONS.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label} — {(c.efficiency * 100).toFixed(0)}% efficient
                  </option>
                ))}
              </select>
            </div>

            {/* ── TIER 2A: ADVANCED OPTIONS ── */}
            <button
              type="button"
              onClick={() => setShowAdvanced((s) => !s)}
              className="flex items-center justify-between w-full text-sm font-medium text-primary hover:text-primary/80 transition-colors pt-1"
            >
              <span>Advanced Options</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            </button>

            {showAdvanced && (
              <div className="flex flex-col gap-4 border-t border-border pt-4">
                <div>
                  <div className={groupLabel}>
                    <Activity className="h-3.5 w-3.5" /> Network Conditions
                  </div>
                  <label className={lbl} htmlFor="dt-overhead">Additional Congestion Overhead (%)</label>
                  <input
                    id="dt-overhead"
                    type="number"
                    min="0"
                    max="95"
                    step="1"
                    value={inputs.overheadPct}
                    onChange={(e) => set("overheadPct", e.target.value)}
                    className={inp}
                  />
                </div>

                <div>
                  <label className={lbl} htmlFor="dt-users">Devices Sharing the Connection</label>
                  <input
                    id="dt-users"
                    type="number"
                    min="1"
                    step="1"
                    value={inputs.concurrentUsers}
                    onChange={(e) => set("concurrentUsers", e.target.value)}
                    className={inp}
                  />
                </div>

                <div>
                  <div className={groupLabel}>
                    <Wifi className="h-3.5 w-3.5" /> Professional Mode
                  </div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inputs.proMode}
                      onChange={(e) => set("proMode", e.target.checked)}
                      className="h-4 w-4 rounded border-input accent-primary"
                    />
                    Model per-connection caps &amp; parallel streams
                  </label>
                </div>

                {inputs.proMode && (
                  <>
                    <div>
                      <label className={lbl} htmlFor="dt-cap">Server Per-Connection Cap (Mbps, 0 = none)</label>
                      <input
                        id="dt-cap"
                        type="number"
                        min="0"
                        step="any"
                        value={inputs.perConnectionCapMbps}
                        onChange={(e) => set("perConnectionCapMbps", e.target.value)}
                        className={inp}
                      />
                    </div>
                    <div>
                      <label className={lbl} htmlFor="dt-streams">Parallel Streams</label>
                      <input
                        id="dt-streams"
                        type="number"
                        min="1"
                        step="1"
                        value={inputs.parallelStreams}
                        onChange={(e) => set("parallelStreams", e.target.value)}
                        className={inp}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={handleCalculate}
                className="h-10 w-full rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base transition-colors active:scale-[0.99]"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={handleReset}
                aria-label="Reset"
                className="h-10 w-10 shrink-0 grid place-items-center rounded-md border border-input bg-background hover:bg-secondary/40 text-muted-foreground transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ───────── RESULTS PANEL ───────── */}
          <div className="flex flex-col gap-4">
            {!result.valid ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Input Error</div>
                <div className="text-base font-medium text-foreground">
                  Enter a file size and a connection speed greater than zero.
                </div>
              </div>
            ) : (
              <>
                {/* 1 — PRIMARY CARD */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    Estimated Download Time
                  </div>
                  <div className="text-4xl font-bold text-primary tracking-tight mb-2">
                    {formatDuration(result.seconds)}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {inputs.fileSize} {inputs.sizeUnit} over {result.profileLabel} at{" "}
                    <span className="font-bold text-foreground">{num(result.effectiveMBps)} MB/s</span> effective
                  </div>
                </div>

                {/* 2 — 3-STAT BAR */}
                <div className="grid grid-cols-3 border border-border rounded-lg overflow-hidden bg-card">
                  <div className="p-4 text-center">
                    <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-1">Best Case</div>
                    <div className="text-base font-bold text-emerald-600 dark:text-emerald-500">{formatDuration(result.idealSeconds)}</div>
                  </div>
                  <div className="p-4 text-center border-l border-border">
                    <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-1">Line Efficiency</div>
                    <div className="text-base font-bold text-orange-600 dark:text-orange-500">{num(result.efficiencyPct, 1)}%</div>
                  </div>
                  <div className="p-4 text-center border-l border-border">
                    <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-1">Lost to Overhead</div>
                    <div className="text-base font-bold text-red-600 dark:text-red-500">{formatDuration(result.overheadSeconds)}</div>
                  </div>
                </div>

                {/* 3 — BREAKDOWN TABLE */}
                <div className="card-calculator !p-0 border border-border bg-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-secondary/40 border-b border-border">
                        <tr>
                          <th className="text-xs font-bold uppercase text-muted-foreground tracking-wider py-2.5 px-3">Factor</th>
                          <th className="text-xs font-bold uppercase text-muted-foreground tracking-wider py-2.5 px-3 text-right">Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {result.rows.slice(0, -1).map((row, i) => (
                          <tr key={i} className={row.highlight ? "bg-primary/10 font-bold" : ""}>
                            <td className="text-base py-2.5 px-3">{row.label}</td>
                            <td className="text-base py-2.5 px-3 text-right">{row.value}</td>
                          </tr>
                        ))}
                        <tr className="border-t-2 border-border font-bold bg-secondary/20">
                          <td className="text-base py-2.5 px-3">{result.rows[result.rows.length - 1].label}</td>
                          <td className="text-base py-2.5 px-3 text-right text-primary">
                            {result.rows[result.rows.length - 1].value}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4 — CHART */}
                <div className="card-calculator !p-4 border border-border bg-card">
                  <div className="text-sm font-bold text-foreground mb-1">Download Time by Connection Type</div>
                  <div className="text-xs text-muted-foreground mb-3">
                    Same {inputs.fileSize} {inputs.sizeUnit} file and {inputs.speed} {inputs.speedUnit} line, different transports
                  </div>
                  {mounted ? (
                    <div style={{ width: "100%", height: 250 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RBar data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                          <YAxis
                            tick={{ fontSize: 11 }}
                            stroke="hsl(var(--muted-foreground))"
                            tickFormatter={(v: number) => (v >= 3600 ? `${(v / 3600).toFixed(1)}h` : `${Math.round(v / 60)}m`)}
                          />
                          <RTooltip
                            formatter={(v: number | string) => [formatDuration(Number(v)), "Download time"]}
                            contentStyle={{ fontSize: 12, borderRadius: 8 }}
                          />
                          <Bar dataKey="seconds" name="Download time" radius={[4, 4, 0, 0]}>
                            {result.chartData.map((d, i) => (
                              <Cell key={i} fill={d.fill} />
                            ))}
                          </Bar>
                        </RBar>
                      </ResponsiveContainer>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "hsl(217 91% 60%)" }} />
                      Your connection
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "hsl(215 16% 65%)" }} />
                      Other transports
                    </span>
                  </div>
                </div>

                {/* TIER 2B — PROFESSIONAL MODE RESULTS */}
                {inputs.proMode && (
                  <div className="card-calculator !p-5 border border-border bg-card">
                    <div className={groupLabel}>
                      <Clock className="h-3.5 w-3.5" /> Parallel Stream Analysis
                    </div>
                    {result.proCappedMBps > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <div className="text-xs text-muted-foreground mb-0.5">Single Stream Cap</div>
                          <div className="text-lg font-bold text-foreground">{num(result.proCappedMBps)} MB/s</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-0.5">
                            With {inputs.parallelStreams} Streams
                          </div>
                          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-500">
                            {formatDuration(result.proParallelSeconds)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-0.5">Time Saved</div>
                          <div className="text-lg font-bold text-foreground">
                            {formatDuration(Math.max(0, result.seconds - result.proParallelSeconds))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Set a per-connection cap above zero to see how parallel streams change the transfer time.
                      </div>
                    )}
                  </div>
                )}

                {/* 5 — SUMMARY STATISTICS (mirrors the breakdown table) */}
                <div className="bg-muted/30 rounded-lg p-5">
                  <div className={groupLabel}>
                    <Clock className="h-3.5 w-3.5" /> Summary Statistics
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                    {result.rows.map((row, i) => (
                      <div key={i} className="flex items-baseline justify-between gap-3 text-sm">
                        <span className={row.highlight ? "font-bold text-foreground" : "text-muted-foreground"}>
                          {row.label}
                        </span>
                        <span className={row.highlight ? "font-bold text-primary" : "text-foreground"}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground mt-3">{result.profileNote}.</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ───────── SEO ───────── */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Download Time Is Actually Calculated</h2>
            <p>
              The arithmetic underneath a download estimate is simple: total bits divided by bits per second gives
              seconds. The difficulty is that neither number means what it appears to. A file listed as 8 GB
              contains 8 × 1024³ bytes, or about 68.7 billion bits, because operating systems count in binary. A
              line sold as 300 Mbps carries 300 million bits per second, because networking counts in decimal. Divide
              one by the other and you get roughly 229 seconds — the theoretical floor, which no real transfer ever
              quite reaches.
            </p>
            <p>
              This calculator starts from that floor and then applies the losses that separate a laboratory figure
              from a Tuesday-evening download: protocol encapsulation, medium contention, the number of devices
              competing for the same pipe, and any server-side cap on a single connection. The result is a time you
              can plan around rather than a best case that only appears in marketing material.
            </p>

            <h2 className="text-2xl font-bold mb-3">Bits, Bytes, and Where the Speed Goes</h2>
            <p>
              The eight-to-one gap between bits and bytes explains most complaints about slow downloads. Providers
              quote megabits, browsers report megabytes, and the two differ by a factor of eight. Beyond that
              conversion, every layer of the stack takes a cut. Ethernet framing, IP headers and TCP headers together
              consume around 3 to 5 percent of raw capacity on a clean wired link. DSL adds PPPoE and ATM
              encapsulation, pushing the loss higher. Acknowledgement traffic flowing back upstream consumes a small
              slice of the return path as well.
            </p>
            <p>
              Physical medium matters more than protocol overhead. Fiber is point-to-point and symmetric, which is
              why it retains over 90 percent of its rated speed. Cable shares a coaxial segment with the
              neighborhood, so evening peaks visibly depress throughput. Wi-Fi is half-duplex and every device must
              wait its turn on the channel, which is why even an excellent Wi-Fi 6 link delivers about three quarters
              of what the same router provides over a cable. Satellite suffers less from bandwidth than from
              latency: with a round trip near 600 milliseconds, a single TCP stream cannot keep enough data in
              flight to fill the link.
            </p>

            <h2 className="text-2xl font-bold mb-3">Sharing, Throttling, and Parallel Streams</h2>
            <p>
              A household connection is a shared resource. Four devices pulling data simultaneously each receive
              roughly a quarter of the line under the fair queuing most consumer routers apply. A 4K stream consumes
              about 25 Mbps, a cloud backup will take everything it is given, and a game update can saturate a link
              on its own. Setting the concurrent-devices field models this even split and usually explains a download
              that seemed inexplicably slow at eight in the evening and fine at six in the morning.
            </p>
            <p>
              Server-side limits are the other common brake. Content providers frequently cap a single connection so
              that one client cannot monopolize a server, which is why a download can sit at exactly 10 MB/s on a
              gigabit line. Download managers and peer-to-peer clients defeat this by opening several streams at
              once, each subject to the cap individually. Professional Mode models both the single-stream ceiling and
              the aggregate rate across parallel streams, bounded by your own line speed — because once the line is
              saturated, additional streams only add overhead.
            </p>

            <h2 className="text-2xl font-bold mb-3">Getting the Fastest Realistic Transfer</h2>
            <p>
              For a large one-off transfer, the highest-value change is usually to plug in an Ethernet cable, which
              removes airtime contention and typically recovers 20 to 30 percent over Wi-Fi. Scheduling outside peak
              hours helps significantly on cable. Pausing other devices, or applying a quality-of-service rule that
              prioritizes the transfer, prevents the split modeled above. If the bottleneck is a per-connection cap,
              a download manager with parallel streams is the direct fix.
            </p>
            <p>
              Watch the destination drive as well. A transfer that begins quickly and settles at a lower steady rate
              has often exhausted an SSD write cache or is being written to a slow external disk or network share.
              In those cases the network was never the limit. Between the connection profiles, the sharing model and
              the parallel-stream analysis here, you can identify which constraint applies before spending money on
              a faster plan that would not change the outcome.
            </p>
          </section>
          <FAQSection faqs={FAQS} pageUrl="https://racira.com/calculator/download-time-calculator" />
          <PopularCalculators exclude="/calculator/download-time-calculator" />
        </div>
      </div>
    </>
  );
}
