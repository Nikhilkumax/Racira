"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown, HardDrive, Files, Gauge } from "lucide-react";
import { BarChart as RBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Cell } from "recharts";

/* ============================================================
   Storage Converter
   Converts a capacity across bits / B / KB / MB / GB / TB / PB
   using both the binary (1024) standard that Windows reports and
   the decimal (1000) standard drive manufacturers advertise.
   ============================================================ */

type StorageUnit = "B" | "KB" | "MB" | "GB" | "TB" | "PB";

const MULTIPLIER: Record<StorageUnit, number> = {
  B: 1,
  KB: 1024,
  MB: 1024 ** 2,
  GB: 1024 ** 3,
  TB: 1024 ** 4,
  PB: 1024 ** 5,
};

const DECIMAL_POW: Record<StorageUnit, number> = {
  B: 0,
  KB: 1,
  MB: 2,
  GB: 3,
  TB: 4,
  PB: 5,
};

const UNIT_LABEL: Record<StorageUnit, string> = {
  B: "Bytes (B)",
  KB: "Kilobytes (KB / KiB)",
  MB: "Megabytes (MB / MiB)",
  GB: "Gigabytes (GB / GiB)",
  TB: "Terabytes (TB / TiB)",
  PB: "Petabytes (PB / PiB)",
};

const ALL_UNITS: StorageUnit[] = ["B", "KB", "MB", "GB", "TB", "PB"];

interface StorageInputs {
  value: string;
  unit: StorageUnit;
  avgFileSize: string;
  avgFileUnit: StorageUnit;
  overheadPct: string;
  reservedGb: string;
  proMode: boolean;
  transferSpeedMbps: string;
  backupCopies: string;
}

interface ConversionRow {
  label: string;
  binaryValue: string;
  decimalValue: string;
  isSource: boolean;
}

interface StorageResult {
  valid: boolean;
  inputValue: number;
  inputUnit: StorageUnit;
  bytes: number;
  bits: number;
  rows: ConversionRow[];
  /* Manufacturer-vs-Windows framing */
  advertisedShows: number;
  shortfallPct: number;
  /* Advanced */
  usableBytes: number;
  usablePct: number;
  fileCount: number;
  /* Professional */
  transferMinutes: number;
  backupTotalBytes: number;
  chartData: { name: string; value: number; fill: string }[];
}

const DEFAULTS: StorageInputs = {
  value: "500",
  unit: "GB",
  avgFileSize: "4",
  avgFileUnit: "MB",
  overheadPct: "0.5",
  reservedGb: "0",
  proMode: false,
  transferSpeedMbps: "120",
  backupCopies: "2",
};

const calculateStorage = (inputs: StorageInputs): StorageResult => {
  const val = parseFloat(inputs.value);
  const unit = inputs.unit;

  const empty: StorageResult = {
    valid: false,
    inputValue: 0,
    inputUnit: unit,
    bytes: 0,
    bits: 0,
    rows: [],
    advertisedShows: 0,
    shortfallPct: 0,
    usableBytes: 0,
    usablePct: 0,
    fileCount: 0,
    transferMinutes: 0,
    backupTotalBytes: 0,
    chartData: [],
  };

  if (isNaN(val) || val < 0) return empty;

  const bytes = val * MULTIPLIER[unit];
  const bits = bytes * 8;

  const fmt = (n: number) =>
    n >= 1
      ? n.toLocaleString("en-US", { maximumFractionDigits: 4 })
      : n.toLocaleString("en-US", { maximumFractionDigits: 10 });

  const rows: ConversionRow[] = [
    {
      label: "Bits (b)",
      binaryValue: fmt(bits),
      decimalValue: fmt(bits),
      isSource: false,
    },
    ...ALL_UNITS.map((u) => ({
      label: UNIT_LABEL[u],
      binaryValue: fmt(bytes / MULTIPLIER[u]),
      decimalValue: fmt(bytes / Math.pow(1000, DECIMAL_POW[u])),
      isSource: u === unit,
    })),
  ];

  /* A drive advertised as `val unit` in decimal bytes, shown by Windows in binary */
  const advertisedBytes = val * Math.pow(1000, DECIMAL_POW[unit]);
  const advertisedShows = advertisedBytes / MULTIPLIER[unit];
  const shortfallPct = val > 0 ? (1 - advertisedShows / val) * 100 : 0;

  /* Advanced — usable capacity after filesystem overhead + reserved space */
  const overheadPct = Math.max(0, Math.min(99, parseFloat(inputs.overheadPct) || 0));
  const reservedBytes = Math.max(0, parseFloat(inputs.reservedGb) || 0) * MULTIPLIER.GB;
  const usableBytes = Math.max(0, bytes * (1 - overheadPct / 100) - reservedBytes);
  const usablePct = bytes > 0 ? (usableBytes / bytes) * 100 : 0;

  const avgFileBytes = Math.max(0, parseFloat(inputs.avgFileSize) || 0) * MULTIPLIER[inputs.avgFileUnit];
  const fileCount = avgFileBytes > 0 ? Math.floor(usableBytes / avgFileBytes) : 0;

  /* Professional — transfer time and multi-copy backup footprint */
  const speedBytesPerSec = Math.max(0, parseFloat(inputs.transferSpeedMbps) || 0) * MULTIPLIER.MB;
  const transferMinutes = speedBytesPerSec > 0 ? usableBytes / speedBytesPerSec / 60 : 0;
  const copies = Math.max(1, Math.floor(parseFloat(inputs.backupCopies) || 1));
  const backupTotalBytes = usableBytes * copies;

  const chartData = [
    { name: `Advertised`, value: val, fill: "hsl(217 91% 60%)" },
    { name: `Windows Shows`, value: advertisedShows, fill: "hsl(25 95% 53%)" },
    { name: `Usable`, value: usableBytes / MULTIPLIER[unit], fill: "hsl(142 71% 45%)" },
  ];

  return {
    valid: true,
    inputValue: val,
    inputUnit: unit,
    bytes,
    bits,
    rows,
    advertisedShows,
    shortfallPct,
    usableBytes,
    usablePct,
    fileCount,
    transferMinutes,
    backupTotalBytes,
    chartData,
  };
};

const humanBytes = (b: number): string => {
  if (b <= 0) return "0 B";
  const u: StorageUnit[] = ["B", "KB", "MB", "GB", "TB", "PB"];
  let i = 0;
  while (i < u.length - 1 && b >= MULTIPLIER[u[i + 1]]) i++;
  return `${(b / MULTIPLIER[u[i]]).toLocaleString("en-US", { maximumFractionDigits: 2 })} ${u[i]}`;
};

const num = (n: number, d = 2) => n.toLocaleString("en-US", { maximumFractionDigits: d });

const inp = "w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20";
const lbl = "text-sm font-medium text-foreground mb-1 block";
const groupLabel = "text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold flex items-center gap-1.5";

const FAQS = [
  {
    question: "Why does my 500 GB hard drive only show 465 GB in Windows?",
    answer:
      "Drive manufacturers use decimal math: they define 1 GB as exactly 1,000,000,000 bytes, so a '500 GB' drive holds 500,000,000,000 bytes. Windows uses binary math and divides by 1,073,741,824 (1024³) to get gigabytes, which yields 465.66. No space is missing — the same number of bytes is simply being measured with a different ruler. The gap widens as capacity grows: it is about 2.4% at the kilobyte level, 7.4% at gigabytes, and 9.95% at terabytes.",
  },
  {
    question: "What is the difference between GB and GiB?",
    answer:
      "The International Electrotechnical Commission introduced binary prefixes in 1998 to end the ambiguity. GB (gigabyte) is meant to be the decimal unit of 1,000,000,000 bytes, while GiB (gibibyte) is the binary unit of 1,073,741,824 bytes. Linux distributions and macOS largely adopted the distinction. Windows did not: it computes in binary but still prints 'GB', which is why the confusion persists decades later.",
  },
  {
    question: "Which standard does this converter use?",
    answer:
      "Both, side by side. The breakdown table shows every unit computed with the binary 1024 multiplier (what your operating system reports) and with the decimal 1000 multiplier (what the box advertises). The headline figure uses binary, because when you are checking whether files will fit on a disk you are comparing against the size your OS displays.",
  },
  {
    question: "Why is my usable capacity lower than the raw capacity?",
    answer:
      "Formatting a drive consumes space for filesystem metadata — the allocation table, journal, inode structures and reserved blocks. NTFS and APFS typically absorb roughly 0.3% to 1%, and ext4 reserves 5% for root by default. The Advanced Options let you subtract a filesystem overhead percentage and any fixed reserved space, such as a recovery partition, to get a realistic usable figure.",
  },
  {
    question: "How many photos or songs fit in a gigabyte?",
    answer:
      "It depends entirely on the average file size, which is why this converter asks for it rather than assuming. As a rough guide, one gigabyte holds around 250 photos from a 12-megapixel phone at 4 MB each, about 200 songs at 5 MB, roughly 15 minutes of 4K video at 400 Mbps, or several thousand text documents. Enter your own average file size to get a count that matches your actual library.",
  },
  {
    question: "Are network speeds measured in the same units as file sizes?",
    answer:
      "No, and this is a second common source of confusion. Internet and network speeds are quoted in megabits per second (Mbps), while file sizes are in megabytes (MB). One byte is eight bits, so a 100 Mbps connection transfers roughly 12.5 MB per second at best. The transfer estimate in Professional Mode takes megabytes per second so you are comparing like with like.",
  },
  {
    question: "Is a terabyte the largest unit I need to worry about?",
    answer:
      "For consumer storage, largely yes, though petabyte-scale arrays are now routine in business. One petabyte is 1,024 terabytes in binary terms. Above that sit exabytes, zettabytes and yottabytes. This converter goes up to petabytes, which covers everything from a single file to a mid-sized data centre volume.",
  },
  {
    question: "Does this converter round the numbers?",
    answer:
      "Values of one or more are shown to four decimal places, and values below one to ten decimal places, so small conversions such as bytes-to-terabytes remain meaningful rather than collapsing to zero. Byte and bit counts are exact integers. The underlying arithmetic is performed at full double precision before any display rounding is applied.",
  },
];

export default function StorageConverter() {
  const [inputs, setInputs] = useState<StorageInputs>(DEFAULTS);
  const [result, setResult] = useState<StorageResult>(calculateStorage(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculateStorage(inputs));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = <K extends keyof StorageInputs>(key: K, val: StorageInputs[K]) =>
    setInputs((prev) => ({ ...prev, [key]: val }));

  const handleCalculate = () => setResult(calculateStorage(inputs));

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculateStorage(DEFAULTS));
    setShowAdvanced(false);
  };

  const u = result.inputUnit;

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Technology", href: "/calculator#technology" },
          { label: "Storage Converter" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Storage Converter</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* ───────── INPUT PANEL ───────── */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div>
              <label className={lbl} htmlFor="sc-value">Capacity or File Size</label>
              <div className="flex gap-2">
                <input
                  id="sc-value"
                  type="number"
                  min="0"
                  step="any"
                  value={inputs.value}
                  onChange={(e) => set("value", e.target.value)}
                  className={inp}
                />
                <select
                  aria-label="Source unit"
                  value={inputs.unit}
                  onChange={(e) => set("unit", e.target.value as StorageUnit)}
                  className={`${inp} w-32`}
                >
                  {ALL_UNITS.map((x) => (
                    <option key={x} value={x}>{x}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={lbl} htmlFor="sc-avg">Average File Size</label>
              <div className="flex gap-2">
                <input
                  id="sc-avg"
                  type="number"
                  min="0"
                  step="any"
                  value={inputs.avgFileSize}
                  onChange={(e) => set("avgFileSize", e.target.value)}
                  className={inp}
                />
                <select
                  aria-label="Average file size unit"
                  value={inputs.avgFileUnit}
                  onChange={(e) => set("avgFileUnit", e.target.value as StorageUnit)}
                  className={`${inp} w-32`}
                >
                  {ALL_UNITS.map((x) => (
                    <option key={x} value={x}>{x}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={lbl} htmlFor="sc-overhead">Filesystem Overhead (%)</label>
              <input
                id="sc-overhead"
                type="number"
                min="0"
                max="99"
                step="0.1"
                value={inputs.overheadPct}
                onChange={(e) => set("overheadPct", e.target.value)}
                className={inp}
              />
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
                    <HardDrive className="h-3.5 w-3.5" /> Reserved Space
                  </div>
                  <label className={lbl} htmlFor="sc-reserved">Reserved / Recovery Partition (GB)</label>
                  <input
                    id="sc-reserved"
                    type="number"
                    min="0"
                    step="any"
                    value={inputs.reservedGb}
                    onChange={(e) => set("reservedGb", e.target.value)}
                    className={inp}
                  />
                </div>

                <div>
                  <div className={groupLabel}>
                    <Gauge className="h-3.5 w-3.5" /> Professional Mode
                  </div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inputs.proMode}
                      onChange={(e) => set("proMode", e.target.checked)}
                      className="h-4 w-4 rounded border-input accent-primary"
                    />
                    Show transfer time &amp; backup footprint
                  </label>
                </div>

                {inputs.proMode && (
                  <>
                    <div>
                      <label className={lbl} htmlFor="sc-speed">Transfer Speed (MB/s)</label>
                      <input
                        id="sc-speed"
                        type="number"
                        min="0"
                        step="any"
                        value={inputs.transferSpeedMbps}
                        onChange={(e) => set("transferSpeedMbps", e.target.value)}
                        className={inp}
                      />
                    </div>
                    <div>
                      <label className={lbl} htmlFor="sc-copies">Backup Copies</label>
                      <input
                        id="sc-copies"
                        type="number"
                        min="1"
                        step="1"
                        value={inputs.backupCopies}
                        onChange={(e) => set("backupCopies", e.target.value)}
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
                  Enter a capacity of zero or greater to convert.
                </div>
              </div>
            ) : (
              <>
                {/* 1 — PRIMARY CARD */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    {num(result.inputValue, 4)} {u} equals
                  </div>
                  <div className="text-4xl font-bold text-primary tracking-tight mb-2">
                    {result.bytes.toLocaleString("en-US")} <span className="text-2xl">bytes</span>
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    A drive advertised as {num(result.inputValue, 2)} {u} shows as{" "}
                    <span className="font-bold text-foreground">{num(result.advertisedShows, 2)} {u}</span> in Windows
                    {result.shortfallPct > 0 && <> — {num(result.shortfallPct, 2)}% lower</>}
                  </div>
                </div>

                {/* 2 — 3-STAT BAR */}
                <div className="grid grid-cols-3 border border-border rounded-lg overflow-hidden bg-card">
                  <div className="p-4 text-center">
                    <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-1">Usable</div>
                    <div className="text-base font-bold text-emerald-600 dark:text-emerald-500">{humanBytes(result.usableBytes)}</div>
                  </div>
                  <div className="p-4 text-center border-l border-border">
                    <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-1">Overhead Loss</div>
                    <div className="text-base font-bold text-orange-600 dark:text-orange-500">{num(100 - result.usablePct, 2)}%</div>
                  </div>
                  <div className="p-4 text-center border-l border-border">
                    <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-1">Marketing Gap</div>
                    <div className="text-base font-bold text-red-600 dark:text-red-500">{num(result.shortfallPct, 2)}%</div>
                  </div>
                </div>

                {/* 3 — BREAKDOWN TABLE */}
                <div className="card-calculator !p-0 border border-border bg-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-secondary/40 border-b border-border">
                        <tr>
                          <th className="text-xs font-bold uppercase text-muted-foreground tracking-wider py-2.5 px-3">Unit</th>
                          <th className="text-xs font-bold uppercase text-muted-foreground tracking-wider py-2.5 px-3 text-right">Binary (1024)</th>
                          <th className="text-xs font-bold uppercase text-muted-foreground tracking-wider py-2.5 px-3 text-right">Decimal (1000)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {result.rows.map((row, i) => (
                          <tr key={i} className={row.isSource ? "bg-primary/10 font-bold" : ""}>
                            <td className="text-base py-2.5 px-3">{row.label}</td>
                            <td className={`text-base py-2.5 px-3 text-right font-mono ${row.isSource ? "text-primary" : "text-foreground"}`}>
                              {row.binaryValue}
                            </td>
                            <td className="text-base py-2.5 px-3 text-right font-mono text-muted-foreground">
                              {row.decimalValue}
                            </td>
                          </tr>
                        ))}
                        <tr className="border-t-2 border-border font-bold bg-secondary/20">
                          <td className="text-base py-2.5 px-3">Total Bytes</td>
                          <td className="text-base py-2.5 px-3 text-right font-mono" colSpan={2}>
                            {result.bytes.toLocaleString("en-US")}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4 — CHART */}
                <div className="card-calculator !p-4 border border-border bg-card">
                  <div className="text-sm font-bold text-foreground mb-1">Advertised vs Reported vs Usable ({u})</div>
                  <div className="text-xs text-muted-foreground mb-3">
                    How the number on the box shrinks by the time you can write files to it
                  </div>
                  {mounted ? (
                    <div style={{ width: "100%", height: 250 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RBar data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                          <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                          <RTooltip
                            formatter={(v: number | string) => [`${num(Number(v), 3)} ${u}`, "Capacity"]}
                            contentStyle={{ fontSize: 12, borderRadius: 8 }}
                          />
                          <Bar dataKey="value" name={`Capacity (${u})`} radius={[4, 4, 0, 0]}>
                            {result.chartData.map((d, i) => (
                              <Cell key={i} fill={d.fill} />
                            ))}
                          </Bar>
                        </RBar>
                      </ResponsiveContainer>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                    {result.chartData.map((d, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.fill }} />
                        {d.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* TIER 2B — PROFESSIONAL MODE RESULTS */}
                {inputs.proMode && (
                  <div className="card-calculator !p-5 border border-border bg-card">
                    <div className={groupLabel}>
                      <Gauge className="h-3.5 w-3.5" /> Professional Analysis
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5">Transfer Time</div>
                        <div className="text-lg font-bold text-foreground">
                          {result.transferMinutes >= 60
                            ? `${num(result.transferMinutes / 60, 1)} hr`
                            : `${num(result.transferMinutes, 1)} min`}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5">Backup Footprint</div>
                        <div className="text-lg font-bold text-foreground">{humanBytes(result.backupTotalBytes)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5">Files Stored</div>
                        <div className="text-lg font-bold text-foreground">{result.fileCount.toLocaleString("en-US")}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5 — SUMMARY STATISTICS (mirrors the breakdown table) */}
                <div className="bg-muted/30 rounded-lg p-5">
                  <div className={groupLabel}>
                    <Files className="h-3.5 w-3.5" /> Summary Statistics
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                    {result.rows.map((row, i) => (
                      <div key={i} className="flex items-baseline justify-between gap-3 text-sm">
                        <span className={row.isSource ? "font-bold text-foreground" : "text-muted-foreground"}>
                          {row.label}
                        </span>
                        <span className={`font-mono ${row.isSource ? "font-bold text-primary" : "text-foreground"}`}>
                          {row.binaryValue}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-baseline justify-between gap-3 text-sm border-t-2 border-border pt-2 sm:col-span-2 mt-1">
                      <span className="font-bold text-foreground">Total Bytes</span>
                      <span className="font-mono font-bold text-foreground">{result.bytes.toLocaleString("en-US")}</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-3">
                    Holds roughly <span className="font-bold text-foreground">{result.fileCount.toLocaleString("en-US")}</span> files at{" "}
                    {inputs.avgFileSize} {inputs.avgFileUnit} each, after {num(100 - result.usablePct, 2)}% overhead.
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ───────── SEO ───────── */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Why Storage Units Never Seem to Add Up</h2>
            <p>
              Every year millions of people buy a 1 terabyte drive, plug it in, and find that the computer reports
              931 gigabytes. Nothing has been lost and nothing was misadvertised in a legal sense — two different
              definitions of the same word are colliding. Drive manufacturers count in powers of ten, where a
              terabyte is 1,000,000,000,000 bytes. Operating systems count in powers of two, where a terabyte is
              1,099,511,627,776 bytes. The drive holds exactly the number of bytes printed on the box; Windows
              simply divides that count by a larger denominator, and the quotient looks smaller.
            </p>
            <p>
              This converter shows both columns at once so you never have to guess which convention a number came
              from. Enter any capacity in bits, bytes, kilobytes, megabytes, gigabytes, terabytes or petabytes and
              read across to every other unit under both standards, with the exact byte count as the anchor.
            </p>

            <h2 className="text-2xl font-bold mb-3">Binary and Decimal Prefixes Explained</h2>
            <p>
              Computers address memory in powers of two, so early programmers borrowed the metric prefix &quot;kilo&quot;
              for 1,024 bytes because it was close enough to a thousand. The approximation held up at small scales
              but compounds badly: the error is 2.4% at kilobytes, 4.9% at megabytes, 7.4% at gigabytes, 10.0% at
              terabytes and 12.6% at petabytes. That growing wedge is precisely the gap you see between the box and
              the drive properties dialog.
            </p>
            <p>
              In 1998 the International Electrotechnical Commission standardised separate names: kibibyte (KiB),
              mebibyte (MiB), gibibyte (GiB) and tebibyte (TiB) for the binary values, leaving KB, MB, GB and TB to
              the decimal ones. Linux tooling and macOS adopted the split, and macOS now reports a 1 TB drive as a
              full 1 TB. Windows kept binary arithmetic while continuing to print the decimal abbreviations, which
              is the single largest reason the confusion survives. RAM is always quoted in binary units regardless
              of platform, because memory chips really are manufactured in powers of two.
            </p>

            <h2 className="text-2xl font-bold mb-3">Raw Capacity Versus Usable Capacity</h2>
            <p>
              Unit conversion is only half the story. A freshly formatted volume gives back less than its raw size
              because the filesystem needs room for its own bookkeeping: the master file table or inode tables,
              journals, superblock copies, and allocation bitmaps. NTFS and APFS typically consume a few tenths of
              a percent up to about one percent, while ext4 reserves five percent for the root user by default so
              that a full disk does not lock an administrator out. Vendor recovery partitions take a further fixed
              slice, often 10 to 30 gigabytes on a prebuilt laptop.
            </p>
            <p>
              Small files pay an extra tax through internal fragmentation. Storage is allocated in clusters, so a
              2 kilobyte text file occupies a full 4 kilobyte cluster and wastes the remainder. A library of many
              tiny files therefore consumes noticeably more space than the sum of its file sizes suggests. The
              Advanced Options let you model overhead and reserved space so the usable figure reflects the disk you
              actually have rather than the one on the label.
            </p>

            <h2 className="text-2xl font-bold mb-3">Planning Transfers, Backups and Capacity</h2>
            <p>
              Once you know the usable capacity, two practical questions usually follow: how long will it take to
              move, and how much room do the copies need. Transfer time trips people up because network and
              interface speeds are quoted in bits per second while files are measured in bytes. Eight bits to the
              byte means a 100 Mbps link moves at best about 12.5 MB per second, and real throughput lands lower
              after protocol overhead. Professional Mode takes megabytes per second directly so the arithmetic
              stays honest.
            </p>
            <p>
              For backup planning, the widely used 3-2-1 rule calls for three copies of the data on two kinds of
              media with one kept offsite, which means budgeting roughly three times the source size before any
              deduplication or compression. Set the number of copies to see the full footprint. Between the unit
              table, the usable-capacity model and the transfer estimate, you can size a drive, a backup target or
              a migration window without converting anything by hand.
            </p>
          </section>
          <FAQSection faqs={FAQS} pageUrl="https://racira.com/calculator/storage-converter" />
          <PopularCalculators exclude="/calculator/storage-converter" />
        </div>
      </div>
    </>
  );
}
