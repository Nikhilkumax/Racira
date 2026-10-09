"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface RaidInputs {
  driveCount: number;
  driveSizeTb: number;
  raidLevel: string;
  driveType: string;
  spares: number;
  fsOverheadPct: number;
  stripeKb: number;
  rebuildMbps: number;
  afrPct: number;
  ureBits: number;
}

const DEFAULTS: RaidInputs = {
  driveCount: 8,
  driveSizeTb: 8,
  raidLevel: "6",
  driveType: "hdd",
  spares: 1,
  fsOverheadPct: 2,
  stripeKb: 256,
  rebuildMbps: 180,
  afrPct: 1,
  ureBits: 1e15,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const tb = (v: number) => (Number.isFinite(v) ? fmt(v, 2) + " TB" : "—");

// RAID geometry. Write penalty is the number of physical I/Os each random stripe
// write costs: RAID 5 needs two reads and two writes, RAID 6 three reads and three.
const LEVELS: {
  id: string;
  label: string;
  minDrives: number;
  parityDrives: (n: number) => number;
  usable: (n: number, s: number) => number;
  tolerance: (n: number) => number;
  writePenalty: number;
  survivesAny: (n: number) => boolean;
}[] = [
  {
    id: "0",
    label: "RAID 0 — striping",
    minDrives: 2,
    parityDrives: () => 0,
    usable: (n, s) => n * s,
    tolerance: () => 0,
    writePenalty: 1,
    survivesAny: () => false,
  },
  {
    id: "1",
    label: "RAID 1 — mirroring (pair)",
    minDrives: 2,
    parityDrives: (n) => Math.max(0, n - 1),
    usable: (n, s) => (n >= 2 ? s : 0),
    tolerance: (n) => (n >= 2 ? n - 1 : 0),
    writePenalty: 2,
    survivesAny: (n) => n >= 2,
  },
  {
    id: "10",
    label: "RAID 10 — mirror of stripes",
    minDrives: 4,
    parityDrives: (n) => n / 2,
    usable: (n, s) => (n >= 4 && n % 2 === 0 ? (n / 2) * s : 0),
    tolerance: (n) => (n >= 4 && n % 2 === 0 ? 1 : 0),
    writePenalty: 2,
    survivesAny: (n) => n >= 4 && n % 2 === 0,
  },
  {
    id: "5",
    label: "RAID 5 — single parity",
    minDrives: 3,
    parityDrives: () => 1,
    usable: (n, s) => (n >= 3 ? (n - 1) * s : 0),
    tolerance: (n) => (n >= 3 ? 1 : 0),
    writePenalty: 4,
    survivesAny: (n) => n >= 3,
  },
  {
    id: "6",
    label: "RAID 6 — double parity",
    minDrives: 4,
    parityDrives: () => 2,
    usable: (n, s) => (n >= 4 ? (n - 2) * s : 0),
    tolerance: (n) => (n >= 4 ? 2 : 0),
    writePenalty: 6,
    survivesAny: (n) => n >= 4,
  },
];

const DRIVE_TYPES: { key: string; label: string; iops: number; rebuildMbps: number }[] = [
  { key: "hdd", label: "HDD 7200 rpm — 150 IOPS", iops: 150, rebuildMbps: 180 },
  { key: "sata", label: "SATA SSD — 75,000 IOPS", iops: 75000, rebuildMbps: 450 },
  { key: "nvme", label: "NVMe SSD — 400,000 IOPS", iops: 400000, rebuildMbps: 2000 },
];

interface RaidResult {
  ok: boolean;
  driveCount: number;
  levelLabel: string;
  rawTb: number;
  parityDrives: number;
  usableTb: number;
  usableTib: number;
  fsOverheadTb: number;
  efficiency: number;
  tolerance: number;
  dataDrives: number;
  stripeWidthKb: number;
  writeIops: number;
  readIops: number;
  writePenalty: number;
  rebuildHours: number;
  ureExpected: number;
  ureProbPct: number;
  annualDriveFailurePct: number;
  doubleFailurePct: number;
  minDrives: number;
  perLevel: { label: string; usable: number; valid: boolean }[];
  breakdown: { label: string; value: string; highlight?: boolean }[];
}

function calculateRaid(i: RaidInputs): RaidResult {
  const blank = (): RaidResult => ({
    ok: false,
    driveCount: 0,
    levelLabel: "",
    rawTb: 0,
    parityDrives: 0,
    usableTb: 0,
    usableTib: 0,
    fsOverheadTb: 0,
    efficiency: 0,
    tolerance: 0,
    dataDrives: 0,
    stripeWidthKb: 0,
    writeIops: 0,
    readIops: 0,
    writePenalty: 0,
    rebuildHours: 0,
    ureExpected: 0,
    ureProbPct: 0,
    annualDriveFailurePct: 0,
    doubleFailurePct: 0,
    minDrives: 0,
    perLevel: [],
    breakdown: [],
  });

  const nums = [
    i.driveCount,
    i.driveSizeTb,
    i.spares,
    i.fsOverheadPct,
    i.stripeKb,
    i.rebuildMbps,
    i.afrPct,
    i.ureBits,
  ];
  if (!nums.every((v) => Number.isFinite(v))) return blank();
  if (i.driveCount < 1 || i.driveCount > 1000) return blank();
  if (i.driveSizeTb <= 0 || i.driveSizeTb > 100000) return blank();
  if (i.spares < 0 || i.spares >= i.driveCount) return blank();
  if (i.fsOverheadPct < 0 || i.fsOverheadPct > 50) return blank();
  if (i.stripeKb <= 0 || i.stripeKb > 4096) return blank();
  if (i.rebuildMbps <= 0) return blank();
  if (i.afrPct < 0 || i.afrPct > 100) return blank();
  if (i.ureBits <= 0) return blank();

  const level = LEVELS.find((l) => l.id === i.raidLevel) || LEVELS[4];
  const dtype = DRIVE_TYPES.find((d) => d.key === i.driveType) || DRIVE_TYPES[0];

  if (i.driveCount < level.minDrives) return blank();
  if (level.id === "10" && i.driveCount % 2 !== 0) return blank();

  const active = i.driveCount - i.spares;
  if (active < level.minDrives) return blank();

  const rawTb = i.driveCount * i.driveSizeTb;
  const usableBeforeFs = level.usable(active, i.driveSizeTb);
  const fsOverheadTb = usableBeforeFs * (i.fsOverheadPct / 100);
  const usableTb = usableBeforeFs - fsOverheadTb;
  const usableTib = (usableTb * 1e12) / Math.pow(1024, 4);
  const efficiency = rawTb > 0 ? (usableTb / rawTb) * 100 : 0;
  const parityDrives = level.parityDrives(active) + i.spares;
  const tolerance = level.tolerance(active);
  const dataDrives = Math.max(0, active - level.parityDrives(active));
  const stripeWidthKb = level.id === "1" ? i.stripeKb : dataDrives * i.stripeKb;

  const readIops = dtype.iops * active;
  const writeIops = readIops / level.writePenalty;

  // Rebuild reads one whole drive at the measured throughput.
  const rebuildSeconds = (i.driveSizeTb * 1e6) / i.rebuildMbps;
  const rebuildHours = rebuildSeconds / 3600;

  // Unrecoverable read error risk: the rebuild must read every bit of the failed
  // drive, so the expected number of UREs is bytes read divided by the rated error
  // rate, and the probability of at least one is 1 minus the exponential term.
  const bytesRead = i.driveSizeTb * 1e12;
  const ureBytes = i.ureBits / 8;
  const ureExpected = bytesRead / ureBytes;
  const ureProbPct = (1 - Math.exp(-ureExpected)) * 100;

  const aft = i.afrPct / 100;
  const annualDriveFailurePct = (1 - Math.pow(1 - aft, i.driveCount)) * 100;
  const doubleFailurePct = level.tolerance(active) >= 2 ? 0 : active * aft * (rebuildHours / 8760) * 100;

  const perLevel = LEVELS.map((l) => ({
    label: l.label.split(" — ")[0],
    usable: l.usable(active, i.driveSizeTb) * (1 - i.fsOverheadPct / 100),
    valid: active >= l.minDrives && (l.id !== "10" || active % 2 === 0),
  }));

  const breakdown = [
    { label: "Total drives (including hot spares)", value: fmt(i.driveCount, 0) },
    { label: `Active data + parity drives`, value: fmt(active, 0) },
    { label: "Raw capacity", value: tb(rawTb) },
    { label: `Parity and hot spare overhead`, value: fmt(rawTb - usableBeforeFs, 2) + " TB" },
    {
      label: `Filesystem reservation at ${fmt(i.fsOverheadPct, 1)}%`,
      value: fmt(fsOverheadTb, 2) + " TB",
    },
    { label: "Usable capacity (decimal)", value: tb(usableTb), highlight: true },
    { label: "Usable capacity (binary)", value: fmt(usableTib, 2) + " TiB" },
    { label: `Storage efficiency`, value: fmt(efficiency, 2) + "%" },
    { label: "Fault tolerance", value: tolerance === 0 ? "None" : fmt(tolerance, 0) + " drive(s)" },
    { label: "Stripe width", value: fmt(stripeWidthKb, 0) + " KB" },
    { label: "Write penalty", value: fmt(level.writePenalty, 0) + " physical I/Os per write" },
    { label: "Effective random read IOPS", value: fmt(readIops, 0) },
    { label: "Effective random write IOPS", value: fmt(writeIops, 0), highlight: true },
    { label: `Rebuild time at ${fmt(i.rebuildMbps, 0)} MB/s`, value: fmt(rebuildHours, 1) + " hours" },
    { label: `Risk of an unrecoverable read error during rebuild`, value: fmt(ureProbPct, 2) + "%" },
    { label: `Annual probability any drive fails`, value: fmt(annualDriveFailurePct, 2) + "%", highlight: true },
  ];

  return {
    ok: true,
    driveCount: i.driveCount,
    levelLabel: level.label,
    rawTb,
    parityDrives,
    usableTb,
    usableTib,
    fsOverheadTb,
    efficiency,
    tolerance,
    dataDrives,
    stripeWidthKb,
    writeIops,
    readIops,
    writePenalty: level.writePenalty,
    rebuildHours,
    ureExpected,
    ureProbPct,
    annualDriveFailurePct,
    doubleFailurePct,
    minDrives: level.minDrives,
    perLevel,
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

export default function RaidCalculator() {
  const [driveCount, setDriveCount] = useState(String(DEFAULTS.driveCount));
  const [driveSizeTb, setDriveSizeTb] = useState(String(DEFAULTS.driveSizeTb));
  const [raidLevel, setRaidLevel] = useState(DEFAULTS.raidLevel);
  const [driveType, setDriveType] = useState(DEFAULTS.driveType);
  const [spares, setSpares] = useState(String(DEFAULTS.spares));
  const [fsOverheadPct, setFsOverheadPct] = useState(String(DEFAULTS.fsOverheadPct));
  const [stripeKb, setStripeKb] = useState(String(DEFAULTS.stripeKb));
  const [rebuildMbps, setRebuildMbps] = useState(String(DEFAULTS.rebuildMbps));
  const [afrPct, setAfrPct] = useState(String(DEFAULTS.afrPct));
  const [ureBits, setUreBits] = useState(String(DEFAULTS.ureBits));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): RaidInputs => ({
    driveCount: parseFloat(driveCount) || 0,
    driveSizeTb: parseFloat(driveSizeTb) || 0,
    raidLevel,
    driveType,
    spares: parseFloat(spares) || 0,
    fsOverheadPct: parseFloat(fsOverheadPct) || 0,
    stripeKb: parseFloat(stripeKb) || 256,
    rebuildMbps: parseFloat(rebuildMbps) || 180,
    afrPct: parseFloat(afrPct) || 0,
    ureBits: parseFloat(ureBits) || 1e15,
  });

  const [calcInputs, setCalcInputs] = useState<RaidInputs>(() => DEFAULTS);
  const [results, setResults] = useState<RaidResult>(() => calculateRaid(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculateRaid(inputs));
  };

  const reset = () => {
    setDriveCount(String(DEFAULTS.driveCount));
    setDriveSizeTb(String(DEFAULTS.driveSizeTb));
    setRaidLevel(DEFAULTS.raidLevel);
    setDriveType(DEFAULTS.driveType);
    setSpares(String(DEFAULTS.spares));
    setFsOverheadPct(String(DEFAULTS.fsOverheadPct));
    setStripeKb(String(DEFAULTS.stripeKb));
    setRebuildMbps(String(DEFAULTS.rebuildMbps));
    setAfrPct(String(DEFAULTS.afrPct));
    setUreBits(String(DEFAULTS.ureBits));
    setCalcInputs(DEFAULTS);
    setResults(calculateRaid(DEFAULTS));
  };

  const countNum = parseFloat(driveCount);
  const sizeNum = parseFloat(driveSizeTb);

  const errors = {
    count:
      !Number.isFinite(countNum) || countNum < 1
        ? "Enter at least one drive"
        : results.ok
          ? ""
          : `This level needs at least ${LEVELS.find((l) => l.id === raidLevel)?.minDrives ?? 1} drives, with an even count for RAID 10`,
    size: !Number.isFinite(sizeNum) || sizeNum <= 0 ? "Enter a drive capacity above zero" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const faqs = [
    {
      question: "How much usable capacity does RAID 5 or RAID 6 give me?",
      answer:
        "RAID 5 gives up one drive's worth of capacity to parity, so n drives of size s yield (n minus 1) times s. RAID 6 gives up two drives, yielding (n minus 2) times s. On eight 8 TB drives with one held as a hot spare, seven drives are active: RAID 5 gives 48 TB usable and RAID 6 gives 40 TB before filesystem reservations. Once the two percent a modern copy-on-write filesystem typically reserves is deducted, those become 47.0 TB and 39.2 TB — and the operating system reports the RAID 6 pool as 35.7 TiB, because it divides by powers of 1024 rather than 1000. That gap between the number on the invoice and the number in the pool manager is why capacity planning should always start from the usable figure, not the raw one.",
    },
    {
      question: "What is write penalty and why does RAID matter for it?",
      answer:
        "Every random stripe write has to update parity, and the cost of that shows up as extra physical I/Os. RAID 5 requires two reads and two writes per stripe write, so it carries a penalty of four; RAID 6 needs three reads and three writes, a penalty of six; mirrored levels need only two because the data is simply written twice. Effective write IOPS is therefore raw device IOPS multiplied by the number of active drives and divided by the penalty. That is why a RAID 6 array of eight 150 IOPS hard drives delivers only about 200 random write IOPS — the same array read-only delivers 1,200. If your workload is write-heavy and random, mirrored levels or parity-free striping will outperform parity RAID on the same hardware.",
    },
    {
      question: "Why does rebuild time matter so much for parity RAID?",
      answer:
        "During a rebuild the array is running with one fewer drive than its fault-tolerance design, so a second failure means total data loss. Rebuild time is simply the drive capacity divided by the rebuild throughput, and at 180 MB/s a modern 8 TB drive takes roughly 12 hours of continuous reading. Large-capacity drives push that to a day or more, and the array serves production traffic at degraded speed the whole time. This calculator multiplies the annual failure rate of the remaining drives by the fraction of the year spent rebuilding to show the exposure window, because a 12-hour window on eight drives is not a small number once the array is a few years old.",
    },
    {
      question: "What is an unrecoverable read error and how risky is it during a rebuild?",
      answer:
        "A URE is a sector the drive cannot read at all, and the rating is expressed as one error per so many bits read — 1 in 10 to the 15th for enterprise drives, 1 in 10 to the 14th for consumer drives. A rebuild has to read every bit of the failed drive, so the expected number of UREs is the drive's byte count divided by the rated error interval. On a 1 in 10 to the 14th drive, an 8 TB member produces an expected 0.64 errors and roughly a 47 percent chance of at least one; the same drive rated 1 in 10 to the 15th drops that to about 6 percent. On RAID 5 a single URE during rebuild is unrecoverable, which is the main argument for RAID 6 at high capacities.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Technology", href: "/calculator#technology" },
          { label: "RAID Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">RAID Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Array Layout">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="count"
                  label="Drive Count"
                  value={driveCount}
                  onChange={setDriveCount}
                  onEnter={runCalculate}
                  min="1"
                  max="1000"
                  step="1"
                  error={errors.count}
                  hint="Total drives, spares included."
                  tooltip="Every drive in the array, including hot spares."
                />
                <CompactInput
                  id="size"
                  label="Drive Capacity"
                  value={driveSizeTb}
                  onChange={setDriveSizeTb}
                  onEnter={runCalculate}
                  min="0.1"
                  step="0.5"
                  suffix="TB"
                  error={errors.size}
                  tooltip="Advertised capacity of one drive in decimal terabytes."
                />
              </div>
            </SubSection>

            <SubSection title="Level & Hardware">
              <div className="grid grid-cols-2 gap-3">
                <CompactSelect
                  id="level"
                  label="RAID Level"
                  value={raidLevel}
                  onChange={setRaidLevel}
                  options={LEVELS.map((l) => ({ value: l.id, label: l.label }))}
                  tooltip="Parity levels cost write throughput but survive failures without halving capacity."
                />
                <CompactSelect
                  id="type"
                  label="Drive Type"
                  value={driveType}
                  onChange={(v) => {
                    const d = DRIVE_TYPES.find((x) => x.key === v);
                    setDriveType(v);
                    if (d) setRebuildMbps(String(d.rebuildMbps));
                  }}
                  options={DRIVE_TYPES.map((d) => ({ value: d.key, label: d.label }))}
                  tooltip="Sets the baseline random IOPS and the default rebuild throughput."
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
                  <SubSection title="Capacity Overhead">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="spares"
                        label="Hot Spares"
                        value={spares}
                        onChange={setSpares}
                        onEnter={runCalculate}
                        min="0"
                        step="1"
                        hint="Idle drives, leave 0 if none."
                        tooltip="Drives held in reserve that rebuild automatically without reducing array width."
                      />
                      <CompactInput
                        id="fs"
                        label="Filesystem Reservation"
                        value={fsOverheadPct}
                        onChange={setFsOverheadPct}
                        onEnter={runCalculate}
                        min="0"
                        max="50"
                        step="0.5"
                        suffix="%"
                        hint="ZFS and Btrfs often 2-5%."
                        tooltip="Percentage of pool capacity reserved for metadata, snapshots and copy-on-write slack."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Striping & Reliability">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="stripe"
                        label="Stripe Unit"
                        value={stripeKb}
                        onChange={setStripeKb}
                        onEnter={runCalculate}
                        min="4"
                        max="4096"
                        step="4"
                        suffix="KB"
                        tooltip="Chunk size written to each drive before moving to the next."
                      />
                      <CompactInput
                        id="rebuild"
                        label="Rebuild Speed"
                        value={rebuildMbps}
                        onChange={setRebuildMbps}
                        onEnter={runCalculate}
                        min="1"
                        step="10"
                        suffix="MB/s"
                        tooltip="Sustained sequential read rate available to the rebuild. Hard drives rarely exceed 200 MB/s."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <CompactInput
                        id="afr"
                        label="Annual Failure Rate"
                        value={afrPct}
                        onChange={setAfrPct}
                        onEnter={runCalculate}
                        min="0"
                        max="100"
                        step="0.1"
                        suffix="%"
                        hint="1% matches fleet data."
                        tooltip="Annualised drive failure rate. Large fleet reporting has run near 1% for hard drives in recent years."
                      />
                      <CompactSelect
                        id="ure"
                        label="URE Rating"
                        value={ureBits}
                        onChange={setUreBits}
                        options={[
                          { value: "100000000000000", label: "1 in 10¹⁴ — desktop drive" },
                          { value: "1000000000000000", label: "1 in 10¹⁵ — enterprise drive" },
                          { value: "10000000000000000", label: "1 in 10¹⁶ — SAS enterprise" },
                        ]}
                        tooltip="Unrecoverable read error rate from the drive datasheet, expressed as bits read per error."
                      />
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
            {!results.ok && (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Check your inputs</div>
                <div className="text-base font-medium text-foreground">
                  The chosen level cannot be built from that many drives. Check the drive count and level combination.
                </div>
              </div>
            )}

            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Usable Capacity</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.ok ? tb(results.usableTb) : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.ok
                  ? `${fmt(results.usableTib, 2)} TiB as reported by the OS · ${fmt(results.efficiency, 1)}% of ${tb(results.rawTb)} raw`
                  : "Enter a drive count and capacity that satisfy the RAID level minimums"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Fault Tolerance</span>
                <span className="font-extrabold text-foreground">
                  {results.ok ? (results.tolerance === 0 ? "None" : fmt(results.tolerance, 0) + " drive(s)") : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Write IOPS</span>
                <span className="font-extrabold text-foreground">{results.ok ? fmt(results.writeIops, 0) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Rebuild</span>
                <span className="font-extrabold text-foreground">
                  {results.ok ? fmt(results.rebuildHours, 1) + " h" : "—"}
                </span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Array Property</th>
                    <th className="p-2.5 pr-3 text-right w-[220px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.breakdown.map((row) => (
                    <tr key={row.label} className={row.highlight ? "bg-secondary/20" : "hover:bg-secondary/20 transition-colors"}>
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{row.value}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                    <td className="p-2.5 pl-3 text-foreground">Active level</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{results.ok ? results.levelLabel : "—"}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Raw capacity</span>
                  <span className="text-base font-bold text-foreground">{tb(results.rawTb)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Parity + spare drives</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.parityDrives, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Data drives</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.dataDrives, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Filesystem reservation</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.fsOverheadTb, 2)} TB</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Stripe width</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.stripeWidthKb, 0)} KB</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Write penalty</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.writePenalty, 0)}×</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Random read IOPS</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.readIops, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Rebuild time</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.rebuildHours, 1)} h</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">URE risk per rebuild</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.ureProbPct, 2)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Any-drive failure, per year</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.annualDriveFailurePct, 2)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a RAID Calculator?</h2>
            <p>
              A RAID calculator turns a set of drives and a RAID level into the numbers that decide whether an array is worth building:
              usable capacity, how many drives can fail before data is lost, effective random IOPS after the write penalty, rebuild time,
              and the odds of an unrecoverable read error during that rebuild. It is the same arithmetic a storage administrator does
              before buying drives, just collected in one place so the trade-offs are visible at a glance rather than discovered two years
              into production.
            </p>
            <p>
              The reason it is worth calculating rather than eyeballing is that the trade-offs move in opposite directions. Striping gives
              the best capacity and speed but no redundancy at all. Mirroring protects data at the cost of half the raw capacity. Parity
              levels recover the capacity but pay for it in writes and in a long, fragile rebuild window. Capacity alone is a poor guide:
              choosing RAID 0 on a backup target can destroy the backups it was meant to hold.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Usable capacity is a per-level formula applied to the active drive count. RAID 0 multiplies drive count by capacity; RAID 1
              mirrors and exposes only one drive's worth; RAID 5 reserves one drive for distributed parity; RAID 6 reserves two; RAID 10
              pairs drives and then stripes across the pairs, so it exposes half the raw capacity and needs an even drive count. Hot spares
              come out of the active count before any of this, and the filesystem reservation is then deducted from what remains, which is
              why ZFS pools look smaller than the arithmetic on paper.
            </p>
            <p>
              Performance follows from the write penalty. A random stripe write on RAID 5 costs two reads and two writes, on RAID 6 three
              and three, while mirroring costs two writes and striping costs one. Effective write IOPS is therefore the sum of the active
              drives' IOPS divided by that penalty, while read IOPS simply scale with the number of active drives. Rebuild time is the
              capacity of one drive divided by the throughput the controller can spare, so an 8 TB drive at 180 MB/s takes about 12 hours.
            </p>
            <p>
              Reliability is where the calculator earns its keep. The expected number of unrecoverable read errors during a rebuild is the
              number of bytes the rebuild must read divided by the drive's rated error interval, and the probability of at least one error
              is one minus the exponential of that figure. On enterprise drives rated 1 in 10 to the 15th bits, an 8 TB member carries
              roughly a 6 percent chance; on desktop drives rated a decade lower, the same rebuild faces roughly a 47 percent chance. On
              RAID 5 any such error is fatal, because there is no second parity block to reconstruct the missing stripe.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The headline is usable capacity in decimal terabytes with the binary figure underneath, since the operating system reports
              TiB. The three-stat bar carries the three practical decision points: fault tolerance in drives, effective write IOPS, and
              rebuild time. The breakdown table then shows the raw-to-usable bridge, the stripe width, the write penalty, and the two risk
              figures that most array builders ignore.
            </p>
            <p>
              Use the risk rows actively. If the rebuild probability is above 10 percent and the array has only single-fault tolerance,
              RAID 6 or a mirrored layout is the safer choice at that drive size, and adding a hot spare converts a failed drive into a
              background rebuild rather than a manual intervention. Fleet reporting has put large-scale hard drive failure rates near 1
              percent a year, so on an eight-drive array the annual chance that at least one drive fails is genuinely around 8 percent, and
              the array will spend meaningful time degraded at some point in its service life.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/raid-calculator" />
          <PopularCalculators exclude="/calculator/raid-calculator" />
        </div>
      </div>
    </>
  );
}
