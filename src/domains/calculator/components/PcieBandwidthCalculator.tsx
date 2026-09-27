"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface PcieInputs {
  version: string;
  lanes: number;
  direction: string;
  maxPayload: number;
  readWriteMix: number;
  decimals: number;
}

// Per-lane signalling rates in GT/s per direction and the encoding overhead that
// converts raw link speed into usable data rate.
const VERSIONS: { key: string; label: string; gbpsPerLane: number; encoding: number }[] = [
  { key: "1_0", label: "PCIe 1.0 / 1.1", gbpsPerLane: 2.5, encoding: 8 / 10 },
  { key: "2_0", label: "PCIe 2.0 / 2.1", gbpsPerLane: 5.0, encoding: 8 / 10 },
  { key: "3_0", label: "PCIe 3.0 / 3.1", gbpsPerLane: 8.0, encoding: 128 / 130 },
  { key: "4_0", label: "PCIe 4.0", gbpsPerLane: 16.0, encoding: 128 / 130 },
  { key: "5_0", label: "PCIe 5.0", gbpsPerLane: 32.0, encoding: 128 / 130 },
  { key: "6_0", label: "PCIe 6.0", gbpsPerLane: 64.0, encoding: 242 / 256 },
  { key: "7_0", label: "PCIe 7.0 (in development)", gbpsPerLane: 128.0, encoding: 242 / 256 },
];

const LANE_WIDTHS = [1, 2, 4, 8, 16];

const TLP_OVERHEAD = 0.11;

const DEFAULTS: PcieInputs = {
  version: "4_0",
  lanes: 16,
  direction: "tx",
  maxPayload: 256,
  readWriteMix: 70,
  decimals: 2,
};

const fmt = (v: number, d = 0) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface BreakdownRow {
  label: string;
  value: string;
  highlight?: boolean;
}

interface PcieResult {
  valid: boolean;
  errorMsg: string;
  versionLabel: string;
  rawGbps: number;
  rawGBps: number;
  encoding: number;
  dataGbps: number;
  dataGBps: number;
  effectiveGBps: number;
  effectiveGbps: number;
  efficiencyPercent: number;
  legacyGen2GBps: number;
  payload: number;
  payloadKiB: number;
  maxReadIOps: number;
  maxWriteIOps: number;
  maxMixedIOps: number;
  readRttMicroseconds: number;
  writeRttMicroseconds: number;
  generationRows: { label: string; rawGbps: number; dataGBps: number; effectiveGBps: number }[];
  verdict: string;
  verdictColor: string;
  breakdown: BreakdownRow[];
}

function calculatePcie(input: PcieInputs): PcieResult {
  const spec = VERSIONS.find((v) => v.key === input.version) || VERSIONS[3];
  const lanes = input.lanes;

  const blank = (errorMsg: string): PcieResult => ({
    valid: false,
    errorMsg,
    versionLabel: spec.label,
    rawGbps: 0,
    rawGBps: 0,
    encoding: spec.encoding,
    dataGbps: 0,
    dataGBps: 0,
    effectiveGBps: 0,
    effectiveGbps: 0,
    efficiencyPercent: 0,
    legacyGen2GBps: 0,
    payload: 0,
    payloadKiB: 0,
    maxReadIOps: 0,
    maxWriteIOps: 0,
    maxMixedIOps: 0,
    readRttMicroseconds: 0,
    writeRttMicroseconds: 0,
    generationRows: [],
    verdict: "",
    verdictColor: "text-muted-foreground",
    breakdown: [],
  });

  if (!Number.isFinite(lanes) || ![1, 2, 4, 8, 16].includes(lanes)) return blank("Link width must be 1, 2, 4, 8 or 16 lanes.");
  if (!Number.isFinite(input.maxPayload) || input.maxPayload < 128 || input.maxPayload > 4096) {
    return blank("Maximum payload size should be between 128 and 4,096 bytes.");
  }
  if (!Number.isFinite(input.readWriteMix) || input.readWriteMix < 0 || input.readWriteMix > 100) {
    return blank("The read share of the transaction mix should be between 0% and 100%.");
  }

  const d = Math.max(0, Math.min(2, input.decimals));

  // Raw rate is symmetric: each direction gets the full lane count.
  const rawGbps = spec.gbpsPerLane * lanes;
  const rawGBps = rawGbps / 8;
  const dataGbps = rawGbps * spec.encoding;
  const dataGBps = dataGbps / 8;

  // The legacy "PCIe 2.0 bandwidth" figure quoted in datasheets — 500 MB/s per lane
  // per direction, which is the 8b/10b data rate rounded to a round number.
  const legacyGen2GBps = (lanes * 500) / 1000;

  // Transaction layer overhead: each packet carries a 12–16 byte header plus up to
  // 4 bytes of CRC, so real efficiency sits around 88%.
  const effectiveGBps = dataGBps * (1 - TLP_OVERHEAD);
  const effectiveGbps = effectiveGBps * 8;
  const efficiencyPercent = (effectiveGbps / rawGbps) * 100;

  // IOPS model: a transaction costs one round trip plus its own transfer time.
  // Reads pay the full round trip before data returns; posted writes are
  // fire-and-forget, so they carry a much smaller latency penalty.
  const payload = Math.max(128, input.maxPayload);
  const payloadKiB = payload / 1024;
  const readRttSeconds = input.direction === "tx" ? 1.5e-6 : 2.0e-6;
  const writeRttSeconds = input.direction === "tx" ? 0.5e-6 : 0.8e-6;
  const theoreticalTransactionsPerSecond = effectiveGBps * 1_048_576 / payloadKiB;
  const maxReadIOps = Math.floor(theoreticalTransactionsPerSecond / (1 + readRttSeconds * theoreticalTransactionsPerSecond));
  const maxWriteIOps = Math.floor(theoreticalTransactionsPerSecond / (1 + writeRttSeconds * theoreticalTransactionsPerSecond));
  const mix = input.readWriteMix / 100;
  const maxMixedIOps =
    maxReadIOps > 0 && maxWriteIOps > 0 ? Math.floor(1 / (mix / maxReadIOps + (1 - mix) / maxWriteIOps)) : 0;

  const generationRows = VERSIONS.map((v) => ({
    label: v.label,
    rawGbps: v.gbpsPerLane * lanes,
    dataGBps: (v.gbpsPerLane * lanes * v.encoding) / 8,
    effectiveGBps: ((v.gbpsPerLane * lanes * v.encoding) / 8) * (1 - TLP_OVERHEAD),
  }));

  const verdict = `The link moves ${fmt(dataGBps, d)} GB/s per direction after encoding, and a realistic workload sees about ${fmt(
    effectiveGBps,
    d,
  )} GB/s — with ${fmt(payload, 0)} byte payloads and a ${fmt(
    input.readWriteMix,
    0,
  )}% read mix, throughput tops out near ${fmt(maxMixedIOps, 0)} IOPS`;
  const verdictColor = efficiencyPercent >= 85 ? "text-emerald-600" : "text-orange-600";

  const breakdown: BreakdownRow[] = [
    { label: "Generation", value: spec.label },
    { label: "Link width", value: `x${lanes}` },
    { label: `Signalling rate of ${fmt(spec.gbpsPerLane, 1)} GT/s per lane`, value: `${fmt(rawGbps, 0)} Gb/s raw · ${fmt(rawGBps, 1)} GB/s` },
    {
      label: `Encoding overhead ${fmt((1 - spec.encoding) * 100, 1)}% (${spec.encoding === 0.8 ? "8b/10b" : spec.encoding === 242 / 256 ? "FLIT, 242/256" : "128b/130b"})`,
      value: `${fmt(dataGbps, 0)} Gb/s after decoding`,
    },
    { label: "Data rate per direction", value: `${fmt(dataGBps, d)} GB/s`, highlight: true },
    { label: `Transaction layer overhead ${fmt(TLP_OVERHEAD * 100, 0)}% for headers and CRC`, value: `${fmt(effectiveGBps, d)} GB/s usable` },
    { label: "Delivered efficiency against the raw link", value: `${fmt(efficiencyPercent, 1)}%`, highlight: true },
    { label: "Legacy datasheet figure for this width", value: `${fmt(legacyGen2GBps, 1)} GB/s (PCIe 2.0 equivalent)` },
    { label: `Maximum payload size ${fmt(payload, 0)} bytes`, value: `${fmt(payloadKiB, 2)} KiB per transaction` },
    {
      label: `Read latency of ${fmt(readRttSeconds * 1e6, 1)} µs round trip`,
      value: `${fmt(maxReadIOps, 0)} read IOPS`,
    },
    {
      label: `Write latency of ${fmt(writeRttSeconds * 1e6, 1)} µs, posted`,
      value: `${fmt(maxWriteIOps, 0)} write IOPS`,
    },
    { label: `Mixed workload at ${fmt(input.readWriteMix, 0)}% reads`, value: `${fmt(maxMixedIOps, 0)} IOPS`, highlight: true },
    {
      label: "Bytes that must be in flight to cover the read round trip",
      value: `${fmt(effectiveGBps * 1e9 * readRttSeconds, 0)} bytes`, highlight: true,
    },
    ...generationRows.map((g) => ({
      label: `${g.label} at x${lanes}`,
      value: `${fmt(g.rawGbps, 0)} Gb/s raw · ${fmt(g.effectiveGBps, 2)} GB/s usable`,
    })),
  ];

  return {
    valid: true,
    errorMsg: "",
    versionLabel: spec.label,
    rawGbps,
    rawGBps,
    encoding: spec.encoding,
    dataGbps,
    dataGBps,
    effectiveGBps,
    effectiveGbps,
    efficiencyPercent,
    legacyGen2GBps,
    payload,
    payloadKiB,
    maxReadIOps,
    maxWriteIOps,
    maxMixedIOps,
    readRttMicroseconds: readRttSeconds * 1e6,
    writeRttMicroseconds: writeRttSeconds * 1e6,
    generationRows,
    verdict,
    verdictColor,
    breakdown,
  };
}

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  hint?: string;
  error?: string;
  type?: string;
  min?: string;
  max?: string;
  step?: string;
  suffix?: string;
  tooltip?: string;
}

const CompactInput = ({
  id,
  label,
  value,
  onChange,
  onEnter,
  hint,
  error,
  type = "number",
  min,
  max,
  step,
  suffix,
  tooltip,
}: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1" title={tooltip}>
      {label}
    </label>
    <div
      className={`relative w-full flex items-center rounded-md border bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all ${
        error ? "border-destructive" : "border-input"
      }`}
    >
      <input
        id={id}
        type={type}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onEnter) onEnter();
        }}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
      />
      {suffix && (
        <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>
      )}
    </div>
    {hint && !error && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
    {error && <p className="text-[11px] text-destructive mt-1">{error}</p>}
  </div>
);

const CompactSelect = ({
  id,
  label,
  value,
  onChange,
  options,
  tooltip,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  tooltip?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1" title={tooltip}>
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-background outline-none focus:outline-none border-none text-foreground"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">{title}</div>
    {children}
  </div>
);

export default function PcieBandwidthCalculator() {
  const [version, setVersion] = useState<string>(DEFAULTS.version);
  const [lanes, setLanes] = useState(String(DEFAULTS.lanes));
  const [direction, setDirection] = useState<string>(DEFAULTS.direction);
  const [maxPayload, setMaxPayload] = useState(String(DEFAULTS.maxPayload));
  const [readWriteMix, setReadWriteMix] = useState(String(DEFAULTS.readWriteMix));
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): PcieInputs => ({
    version,
    lanes: parseInt(lanes),
    direction,
    maxPayload: parseInt(maxPayload),
    readWriteMix: parseFloat(readWriteMix),
    decimals: parseFloat(decimals),
  });

  const [calcInputs, setCalcInputs] = useState<PcieInputs>(() => DEFAULTS);
  const [results, setResults] = useState<PcieResult>(() => calculatePcie(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculatePcie(inputs));
  };

  const reset = () => {
    setVersion(DEFAULTS.version);
    setLanes(String(DEFAULTS.lanes));
    setDirection(DEFAULTS.direction);
    setMaxPayload(String(DEFAULTS.maxPayload));
    setReadWriteMix(String(DEFAULTS.readWriteMix));
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(calculatePcie(DEFAULTS));
  };

  const lanesNum = parseInt(lanes);
  const payloadNum = parseInt(maxPayload);
  const mixNum = parseFloat(readWriteMix);

  const errors = {
    lanes: ![1, 2, 4, 8, 16].includes(lanesNum) ? "Choose 1, 2, 4, 8 or 16" : "",
    maxPayload: !Number.isFinite(payloadNum) || payloadNum < 128 || payloadNum > 4096 ? "Use 128–4,096 bytes" : "",
    readWriteMix: !Number.isFinite(mixNum) || mixNum < 0 || mixNum > 100 ? "Use 0–100%" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const faqs = [
    {
      question: "What is the difference between GT/s and GB/s in PCIe?",
      answer:
        "The per-lane figure the standard quotes — 16 GT/s for PCIe 4.0 — is a signalling rate in gigatransfers per second, not a data rate. Because each transfer carries a bit under 8b/10b encoding and slightly more under 128b/130b, the usable data rate is lower by the encoding overhead. Convert the transfer rate to bits per second, multiply by the encoding efficiency and divide by eight for bytes: PCIe 4.0 x16 at 16 GT/s per lane gives 256 Gb/s raw, about 252 Gb/s after 128b/130b decoding, and roughly 31.5 GB/s per direction before transaction overhead.",
    },
    {
      question: "Why is real throughput lower than the datasheet number?",
      answer:
        "Two layers of overhead sit between the link and your application. The physical layer loses a small fraction to line encoding and to the framing that keeps the receiver synchronised. The transaction layer is the larger cost: every packet carries a header of 12 to 16 bytes plus a link CRC, so a 1,024 byte payload spends around 2% on framing while a 128 byte payload spends closer to 12%. That is why maximum payload size is such an effective knob — raising it from 128 to 512 bytes can move effective throughput by several percent on the same link.",
    },
    {
      question: "When does bandwidth stop being the limit?",
      answer:
        "When latency and queue depth take over. Each transaction costs a round trip of a microsecond or two before the data moves, so throughput per stream is limited by how many transactions can be in flight at once. Doubling the link width doubles the bytes per second but leaves that latency untouched, which is why storage devices hit their IOPS ceiling long before they saturate a x16 link, and why NVMe queues are dozens deep rather than one. The calculator reports both: the bandwidth figure for large sequential transfers and the IOPS figure for the small random accesses that dominate real workloads.",
    },
    {
      question: "Does a narrower link hurt real applications?",
      answer:
        "It depends entirely on the access pattern. A graphics card writing textures or a network card streaming packets is bandwidth-bound, so a x8 card in a x16 slot gives up half its peak. A database doing 4 KiB random reads is latency-bound, so it often shows no measurable difference between x4 and x16 — the link has capacity to spare and the queue is the constraint. That is why x4 NVMe drives, which top out near 8 GB/s on PCIe 4.0, comfortably exceed what most consumer workloads can keep in flight.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Technology", href: "/calculator#technology" },
          { label: "PCIe Bandwidth Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">PCIe Bandwidth Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Link">
              <div className="grid grid-cols-2 gap-3">
                <CompactSelect
                  id="version"
                  label="PCIe Generation"
                  value={version}
                  onChange={setVersion}
                  options={VERSIONS.map((v) => ({ value: v.key, label: v.label }))}
                  tooltip="Sets the signalling rate per lane and the line encoding."
                />
                <CompactSelect
                  id="lanes"
                  label="Link Width"
                  value={lanes}
                  onChange={setLanes}
                  options={LANE_WIDTHS.map((n) => ({ value: String(n), label: `x${n}` }))}
                  tooltip="Number of lanes in each direction."
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <CompactSelect
                  id="direction"
                  label="Measured Direction"
                  value={direction}
                  onChange={setDirection}
                  options={[
                    { value: "tx", label: "Transmit from root complex" },
                    { value: "rx", label: "Receive into root complex" },
                  ]}
                  tooltip="Sets the round-trip latency used in the IOPS model."
                />
                <CompactInput
                  id="payload"
                  label="Max Payload Size"
                  value={maxPayload}
                  onChange={setMaxPayload}
                  onEnter={runCalculate}
                  min="128"
                  max="4096"
                  step="128"
                  suffix="bytes"
                  error={errors.maxPayload}
                  hint="128, 256, 512, 1024, 2048 or 4096."
                  tooltip="Transaction payload limit; larger payloads lower the per-packet overhead."
                />
              </div>
            </SubSection>

            <SubSection title="Workload">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="mix"
                  label="Read Share"
                  value={readWriteMix}
                  onChange={setReadWriteMix}
                  onEnter={runCalculate}
                  min="0"
                  max="100"
                  step="5"
                  suffix="%"
                  error={errors.readWriteMix}
                  hint="The rest is posted writes."
                  tooltip="Share of transactions that are reads, which pay the full round trip."
                />
                <CompactInput
                  id="decimals"
                  label="Decimals"
                  value={decimals}
                  onChange={setDecimals}
                  onEnter={runCalculate}
                  min="0"
                  max="2"
                  step="1"
                  tooltip="Decimal places used for the bandwidth figures."
                />
              </div>
            </SubSection>

            {/* ADVANCED OPTIONS */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdv(!showAdv)}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdv ? "rotate-180" : ""}`} />
              </button>

              {showAdv && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up !overflow-visible">
                  <SubSection title="Model Assumptions">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col justify-center">
                        <span className="text-[11px] text-muted-foreground">
                          Transaction overhead is fixed at {fmt(TLP_OVERHEAD * 100, 0)}% for headers and CRC, which is the midpoint of the
                          9–13% range seen with 256 to 512 byte payloads.
                        </span>
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="text-[11px] text-muted-foreground">
                          Read round trip {fmt(results.readRttMicroseconds, 1)} µs, posted write {fmt(results.writeRttMicroseconds, 1)} µs —
                          scale them with the direction selection.
                        </span>
                      </div>
                    </div>
                  </SubSection>
                </div>
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2.5 mt-2">
              <button
                type="button"
                onClick={runCalculate}
                disabled={hasErrors}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={reset}
                aria-label="Reset"
                className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start">
            {!results.valid && (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Check your inputs</div>
                <div className="text-base font-medium text-foreground">{results.errorMsg}</div>
              </div>
            )}

            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Data Rate Per Direction</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? `${fmt(results.dataGBps, calcInputs.decimals)} GB/s` : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${results.versionLabel} at x${fmt(calcInputs.lanes, 0)} — ${fmt(results.rawGbps, 0)} Gb/s raw link, ${fmt(
                      results.effectiveGBps,
                      calcInputs.decimals,
                    )} GB/s after transaction overhead`
                  : "Fix the highlighted inputs to size the link"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Raw Link</span>
                <span className="font-extrabold text-foreground">{results.valid ? `${fmt(results.rawGbps, 0)} Gb/s` : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Usable</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.effectiveGBps, calcInputs.decimals)} GB/s` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Mixed IOPS</span>
                <span className={`font-extrabold ${results.valid ? results.verdictColor : "text-muted-foreground"}`}>
                  {results.valid ? fmt(results.maxMixedIOps, 0) : "—"}
                </span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Link Item</th>
                    <th className="p-2.5 pr-3 text-right w-[240px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.valid ? (
                    results.breakdown.map((row) => (
                      <tr key={row.label} className={row.highlight ? "bg-secondary/20" : "hover:bg-secondary/20 transition-colors"}>
                        <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                        <td className="p-2.5 pr-3 text-right text-foreground">{row.value}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-2.5 pl-3 text-muted-foreground" colSpan={2}>
                        Pick a generation and width to size the link.
                      </td>
                    </tr>
                  )}
                  {results.valid && (
                    <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                      <td className="p-2.5 pl-3 text-foreground">Usable throughput</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">
                        {`${fmt(results.effectiveGBps, calcInputs.decimals)} GB/s · ${fmt(results.efficiencyPercent, 1)}% of raw`}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 4. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Generation</span>
                  <span className="text-base font-bold text-foreground">{results.versionLabel}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Link width</span>
                  <span className="text-base font-bold text-foreground">x{fmt(calcInputs.lanes, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Data rate per direction</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.dataGBps, 2)} GB/s` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Usable throughput</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.effectiveGBps, 2)} GB/s` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Read IOPS</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? fmt(results.maxReadIOps, 0) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Write IOPS</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? fmt(results.maxWriteIOps, 0) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Payload size</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.maxPayload, 0)} bytes</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Delivered efficiency</span>
                  <span className={`text-base font-bold ${results.verdictColor}`}>
                    {results.valid ? `${fmt(results.efficiencyPercent, 1)}%` : "—"}
                  </span>
                </div>
              </div>
              {results.valid && <p className={`text-[11px] mt-3 font-semibold ${results.verdictColor}`}>{results.verdict}.</p>}
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a PCIe Bandwidth Calculator?</h2>
            <p>
              A PCIe bandwidth calculator converts a generation and a link width into the throughput the link can actually deliver:
              raw signalling rate, the data rate after line encoding, the usable rate once transaction overhead is paid, and the IOPS
              ceiling for a given payload size and read/write mix. It is the difference between the number on the box — PCIe 5.0 x16 — and
              the number an application measures, which is why a card that looks starved on paper often turns out to be latency-bound
              rather than bandwidth-bound.
            </p>
            <p>
              Both figures matter because they answer different questions. Bandwidth decides how long a large sequential transfer takes;
              IOPS decides how many small random accesses a device can sustain, and in most real workloads the second number is the one
              that limits performance.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Each PCIe generation sets a signalling rate per lane — 2.5 GT/s for 1.0, 5 for 2.0, 8 for 3.0, 16 for 4.0, 32 for 5.0, 64
              for 6.0 — and the link carries that rate on every lane in both directions simultaneously. The transfer rate is not the data
              rate: 8b/10b encoding on the first two generations spends 20% of the bits on ensuring DC balance and clock recovery, while
              the 128b/130b scheme from 3.0 onwards spends under 2%, and PCIe 6.0 replaces it with a 242/256 FLIT encoding. PCIe 4.0 x16
              therefore carries 256 Gb/s of raw signalling but delivers about 252 Gb/s, or 31.5 GB/s, of decoded data per direction.
            </p>
            <p>
              The transaction layer takes its own share. Every packet carries a 12 to 16 byte header plus up to 4 bytes of CRC, so a 256
              byte payload spends roughly 11% of the link on framing while a 4,096 byte payload spends closer to 2%. That is why maximum
              payload size is worth configuring: moving from 128 to 512 bytes changes real throughput measurably on the same hardware.
            </p>
            <p>
              IOPS then follows from latency rather than bandwidth. A 4 KiB random read needs a round trip of one to two microseconds
              before its data returns, so a single queue cannot exceed a few hundred thousand IOPS no matter how wide the link is. Once
              the queue is deep enough to cover the round trip, the link's bytes per second becomes the limit again — which is why
              enterprise drives use queues dozens deep and why the two ceilings have to be computed separately.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card is the data rate per direction at the selected generation and width. The three-stat bar sets the raw link
              rate, the usable throughput after overhead and the mixed-workload IOPS side by side.
            </p>
            <p>
              The breakdown table walks from the per-lane signalling rate through encoding and transaction overhead to the effective rate,
              adds the legacy datasheet figure for that width, the read and write IOPS ceilings at your payload size and a comparison of
              every generation at the same link width, which is the quickest way to see what a generation upgrade buys. The summary panel
              repeats the headline numbers and prints the verdict line.
            </p>
            <p>
              Two cautions on use. The model applies a fixed 11% transaction overhead, which matches a 256 to 512 byte payload well but
              overstates the cost for 4 KiB payloads and understates it for 128 byte ones; adjust your expectation rather than the model
              if your traffic differs. And real systems rarely achieve these figures end to end: chipset-attached slots share uplink
              bandwidth, switches add their own latency, and the host's memory bandwidth and software stack impose their own ceilings.
              Use the numbers as the link's capability, not as a promise about your application.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/pcie-bandwidth-calculator" />
          <PopularCalculators exclude="/calculator/pcie-bandwidth-calculator" />
        </div>
      </div>
    </>
  );
}
