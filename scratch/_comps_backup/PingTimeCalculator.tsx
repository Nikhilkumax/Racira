"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import {
  BarChart as RBar,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

type MediumKey = "fiber" | "copper" | "microwave" | "leo" | "geo";
type AccessKey = "fiber-ftth" | "cable" | "dsl" | "5g" | "4g" | "wifi" | "none";

interface PingInputs {
  distanceKm: number;
  medium: MediumKey;
  access: AccessKey;
  // Tier 2A — route realism
  circuitousness: number;
  hopCount: number;
  perHopMs: number;
  // Tier 2A — serialization
  linkMbps: number;
  packetBytes: number;
  // Tier 2B — professional
  proMode: boolean;
  congestionQueueMs: number;
  serverProcessingMs: number;
}

interface MediumSpec {
  key: MediumKey;
  label: string;
  /** one-way propagation speed, km/ms */
  speedKmPerMs: number;
  /** fixed one-way path length added regardless of ground distance (satellite hops) */
  fixedPathKm: number;
  note: string;
}

interface AccessSpec {
  key: AccessKey;
  label: string;
  /** typical one-way last-mile access latency in ms */
  oneWayMs: number;
}

interface LegRow {
  rowId: string;
  label: string;
  ms: number;
  colour: string;
}

interface TableRow {
  rowId: string;
  label: string;
  value: string;
  key?: boolean;
  total?: boolean;
}

interface PingResult {
  rttMs: number;
  oneWayMs: number;
  effectivePathKm: number;
  propagationRttMs: number;
  serializationMs: number;
  hopMs: number;
  accessRttMs: number;
  queueMs: number;
  serverMs: number;
  theoreticalMinRttMs: number;
  overheadRatio: number;
  grade: "Excellent" | "Good" | "Fair" | "Poor";
  gradeColour: string;
  legs: LegRow[];
  gamingVerdict: string;
  callVerdict: string;
  tcpThroughputMbps: number;
}

const C_KM_PER_MS = 299.792458; // speed of light in vacuum

const MEDIA: MediumSpec[] = [
  {
    key: "fiber",
    label: "Fibre optic (long-haul)",
    // refractive index ~1.47 → 0.68c
    speedKmPerMs: C_KM_PER_MS / 1.47,
    fixedPathKm: 0,
    note: "Light travels at about 68% of vacuum speed inside glass, roughly 204 km per millisecond.",
  },
  {
    key: "copper",
    label: "Copper / coaxial",
    speedKmPerMs: C_KM_PER_MS * 0.66,
    fixedPathKm: 0,
    note: "Electrical signals on coax propagate at roughly 66% of vacuum speed.",
  },
  {
    key: "microwave",
    label: "Terrestrial microwave",
    speedKmPerMs: C_KM_PER_MS * 0.99,
    fixedPathKm: 0,
    note: "Radio through air is within 1% of vacuum speed, which is why HFT firms pay for microwave towers.",
  },
  {
    key: "leo",
    label: "LEO satellite (≈550 km)",
    speedKmPerMs: C_KM_PER_MS,
    // up + down to a 550 km shell, one way through the network
    fixedPathKm: 1100,
    note: "Adds an up-and-down hop to a 550 km orbit on top of the ground distance.",
  },
  {
    key: "geo",
    label: "Geostationary satellite (35,786 km)",
    speedKmPerMs: C_KM_PER_MS,
    fixedPathKm: 71572,
    note: "The 35,786 km climb dominates everything: one round trip is over 71,000 km of path before ground distance matters.",
  },
];

const ACCESS: AccessSpec[] = [
  { key: "fiber-ftth", label: "Fibre to the home", oneWayMs: 1.5 },
  { key: "cable", label: "Cable / DOCSIS", oneWayMs: 5 },
  { key: "dsl", label: "DSL / VDSL", oneWayMs: 9 },
  { key: "5g", label: "5G mobile", oneWayMs: 8 },
  { key: "4g", label: "4G LTE mobile", oneWayMs: 22 },
  { key: "wifi", label: "Wi-Fi + fibre", oneWayMs: 3.5 },
  { key: "none", label: "None (datacentre to datacentre)", oneWayMs: 0 },
];

const mediumOf = (k: MediumKey): MediumSpec => MEDIA.find((m) => m.key === k) ?? MEDIA[0];
const accessOf = (k: AccessKey): AccessSpec => ACCESS.find((a) => a.key === k) ?? ACCESS[0];

const calculatePing = (inputs: PingInputs): PingResult => {
  const {
    distanceKm, medium, access, circuitousness, hopCount, perHopMs,
    linkMbps, packetBytes, proMode, congestionQueueMs, serverProcessingMs,
  } = inputs;

  const spec = mediumOf(medium);
  const acc = accessOf(access);

  const safeDistance = Math.max(0, distanceKm);
  const safeCircuit = Math.max(1, circuitousness);

  // Real fibre routes follow rights of way, not great circles
  const groundPathKm = safeDistance * safeCircuit;
  const effectivePathKm = groundPathKm + spec.fixedPathKm;

  // Propagation, round trip
  const propagationRttMs = (effectivePathKm / spec.speedKmPerMs) * 2;

  // Serialization: pushing the bits onto the wire, once per hop in each direction
  const bits = Math.max(1, packetBytes) * 8;
  const perHopSerialMs = bits / (Math.max(0.1, linkMbps) * 1000);
  const serializationMs = perHopSerialMs * Math.max(1, hopCount) * 2;

  // Router store-and-forward / lookup, both directions
  const hopMs = Math.max(0, hopCount) * Math.max(0, perHopMs) * 2;

  // Last mile at each end of the round trip
  const accessRttMs = acc.oneWayMs * 2;

  const queueMs = proMode ? Math.max(0, congestionQueueMs) : 0;
  const serverMs = proMode ? Math.max(0, serverProcessingMs) : 0;

  const rttMs = propagationRttMs + serializationMs + hopMs + accessRttMs + queueMs + serverMs;
  const oneWayMs = rttMs / 2;

  // Light in vacuum, straight line — the physical floor nothing can beat
  const theoreticalMinRttMs = ((safeDistance + spec.fixedPathKm) / C_KM_PER_MS) * 2;
  const overheadRatio = theoreticalMinRttMs > 0 ? rttMs / theoreticalMinRttMs : 0;

  let grade: PingResult["grade"];
  let gradeColour: string;
  if (rttMs < 30) { grade = "Excellent"; gradeColour = "hsl(142 71% 45%)"; }
  else if (rttMs < 60) { grade = "Good"; gradeColour = "hsl(142 71% 45%)"; }
  else if (rttMs < 120) { grade = "Fair"; gradeColour = "hsl(25 95% 53%)"; }
  else { grade = "Poor"; gradeColour = "hsl(0 84% 60%)"; }

  const gamingVerdict =
    rttMs < 30 ? "Competitive-ready. Hit registration feels immediate."
    : rttMs < 60 ? "Fine for most online games; you will lose close duels to lower-ping players."
    : rttMs < 120 ? "Noticeable lag compensation. Playable for slower-paced games only."
    : "Too high for real-time shooters or fighting games.";

  const callVerdict =
    oneWayMs < 150 ? "Within the ITU-T G.114 one-way target of 150 ms — conversation feels natural."
    : oneWayMs < 400 ? "Between 150 and 400 ms one way — usable but speakers will start talking over each other."
    : "Above the 400 ms ITU-T limit — expect walkie-talkie style turn taking.";

  // Single-stream TCP ceiling with a 64 KB receive window (RFC 1323 scaling off)
  const tcpThroughputMbps = rttMs > 0 ? (65535 * 8) / (rttMs / 1000) / 1_000_000 : 0;

  const legs: LegRow[] = [
    { rowId: "prop", label: "Propagation", ms: propagationRttMs, colour: "hsl(217 91% 60%)" },
    { rowId: "access", label: "Last mile", ms: accessRttMs, colour: "hsl(25 95% 53%)" },
    { rowId: "hops", label: "Router hops", ms: hopMs, colour: "hsl(142 71% 45%)" },
    { rowId: "serial", label: "Serialization", ms: serializationMs, colour: "hsl(215 16% 65%)" },
  ];
  if (proMode) {
    legs.push({ rowId: "queue", label: "Queuing", ms: queueMs, colour: "hsl(0 84% 60%)" });
    legs.push({ rowId: "server", label: "Server", ms: serverMs, colour: "hsl(280 65% 60%)" });
  }

  return {
    rttMs, oneWayMs, effectivePathKm, propagationRttMs, serializationMs, hopMs,
    accessRttMs, queueMs, serverMs, theoreticalMinRttMs, overheadRatio,
    grade, gradeColour, legs, gamingVerdict, callVerdict, tcpThroughputMbps,
  };
};

const DEFAULTS: PingInputs = {
  distanceKm: 5570,
  medium: "fiber",
  access: "fiber-ftth",
  circuitousness: 1.4,
  hopCount: 12,
  perHopMs: 0.25,
  linkMbps: 1000,
  packetBytes: 64,
  proMode: false,
  congestionQueueMs: 8,
  serverProcessingMs: 2,
};

const FAQS = [
  {
    question: "Why is my real ping higher than the distance alone suggests?",
    answer:
      "Because distance only sets the floor. A packet also has to be clocked onto each link one bit at a time, get looked up and forwarded by every router along the way, cross your last-mile access network twice, and wait in whatever queues it finds. On a typical intercontinental path, propagation is roughly two thirds of the total and everything else makes up the rest. Short paths are the opposite: over 50 km, the fixed per-hop and last-mile costs completely dominate and distance barely registers.",
  },
  {
    question: "How fast does a signal actually travel through fibre?",
    answer:
      "About 204 kilometres per millisecond. Light moves at 299,792 km/s in a vacuum, but the glass core of a single-mode fibre has a refractive index of roughly 1.47, so light inside it travels at about 68% of that. Coaxial copper is similar at around 66% of vacuum speed. Terrestrial microwave through air is within 1% of full vacuum speed, which is the entire reason high-frequency trading firms build microwave tower chains between Chicago and New Jersey rather than leasing fibre.",
  },
  {
    question: "Why do you multiply distance by 1.4?",
    answer:
      "Fibre follows railway corridors, road easements, and seabed cable routes — not great circles. The ratio of actual fibre path length to straight-line distance is called circuitousness, and measured values on real backbone routes typically land between 1.2 and 1.6, with 1.4 a common planning default. Undersea routes between well-connected city pairs can be close to 1.1; paths that have to detour around mountains or political borders can exceed 2.0.",
  },
  {
    question: "What ping do I need for competitive gaming?",
    answer:
      "Under 30 ms round trip feels immediate and is what competitive players target. Between 30 and 60 ms is fine for almost every game, though you will lose peeker's-advantage duels to opponents with lower ping. Above 60 ms, server-side lag compensation starts producing visible oddities like being shot around a corner. Above 120 ms, fast shooters and fighting games become genuinely unfair. Note that jitter — variation in ping — often ruins gameplay more than a steady high ping does.",
  },
  {
    question: "Why is satellite internet ping so high?",
    answer:
      "Geostationary satellites orbit 35,786 km above the equator. Even at full vacuum light speed, one round trip up and back down is over 71,000 km of path, which is about 478 ms of pure propagation before any equipment or ground distance is counted. Low Earth orbit constellations sit at roughly 550 km instead, cutting that fixed penalty to about 7 ms round trip, which is why LEO service can deliver 25 to 50 ms pings that are usable for gaming and video calls.",
  },
  {
    question: "Does a faster internet plan lower my ping?",
    answer:
      "Only slightly, and only through the serialization term. Upgrading from 100 Mbps to 1 Gbps cuts the time to clock a 64-byte packet onto the wire from 5.1 microseconds to 0.5 microseconds — a change you cannot perceive. What a faster plan does help with is queuing: a congested uplink builds a backlog that can add tens or hundreds of milliseconds, and more headroom means less backlog. If your ping spikes when someone else in the house starts an upload, the fix is smart queue management such as fq_codel or CAKE, not more bandwidth.",
  },
  {
    question: "What is the difference between ping, latency, and jitter?",
    answer:
      "Latency is the general term for delay. Ping is a specific measurement of round-trip latency made with ICMP echo request and reply packets, and it is what the ping command reports. One-way delay is roughly half the round trip on symmetric paths, but real routes are often asymmetric so the halves are not always equal. Jitter is the standard deviation of successive latency measurements — how much your ping wobbles — and is what causes stuttering in voice and video even when average ping looks acceptable.",
  },
  {
    question: "How does latency limit my download speed?",
    answer:
      "A single TCP connection cannot have more data in flight than the receive window allows, so its throughput ceiling is window size divided by round-trip time. With a classic 64 KB window, a 100 ms path caps one stream at about 5.2 Mbps no matter how fast the link is. This is the bandwidth-delay product problem, and it is why long-distance transfers feel slow on fast connections. Modern stacks use RFC 7323 window scaling to raise the ceiling, and download managers open parallel connections for the same reason.",
  },
];

const PingTimeCalculator = () => {
  const [inputs, setInputs] = useState<PingInputs>(DEFAULTS);
  const [result, setResult] = useState<PingResult>(calculatePing(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculatePing(inputs));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = <K extends keyof PingInputs>(key: K, val: PingInputs[K]) =>
    setInputs((prev) => ({ ...prev, [key]: val }));

  const handleCalculate = () => setResult(calculatePing(inputs));

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculatePing(DEFAULTS));
    setShowAdvanced(false);
  };

  const spec = mediumOf(inputs.medium);
  const acc = accessOf(inputs.access);

  const fmt = (n: number, d = 1) =>
    n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });

  const tableRows: TableRow[] = [
    { rowId: "distance", label: "Straight-line distance", value: `${inputs.distanceKm.toLocaleString()} km` },
    { rowId: "path", label: `Actual signal path (×${inputs.circuitousness} route factor${spec.fixedPathKm > 0 ? " + orbit" : ""})`, value: `${Math.round(result.effectivePathKm).toLocaleString()} km` },
    { rowId: "speed", label: "Propagation speed in medium", value: `${fmt(spec.speedKmPerMs, 0)} km/ms` },
    { rowId: "prop", label: "Propagation delay (round trip)", value: `${fmt(result.propagationRttMs)} ms` },
    { rowId: "access", label: `Last mile — ${acc.label} (both ends)`, value: `${fmt(result.accessRttMs)} ms` },
    { rowId: "hops", label: `Router hops — ${inputs.hopCount} × ${inputs.perHopMs} ms × 2`, value: `${fmt(result.hopMs)} ms` },
    { rowId: "serial", label: `Serialization — ${inputs.packetBytes} B at ${inputs.linkMbps.toLocaleString()} Mbps`, value: `${fmt(result.serializationMs, 3)} ms` },
    ...(inputs.proMode
      ? [
          { rowId: "queue", label: "Queuing delay under congestion", value: `${fmt(result.queueMs)} ms` },
          { rowId: "server", label: "Server processing / echo turnaround", value: `${fmt(result.serverMs)} ms` },
        ]
      : []),
    { rowId: "oneway", label: "One-way delay", value: `${fmt(result.oneWayMs)} ms` },
    { rowId: "floor", label: "Physical floor (vacuum, straight line)", value: `${fmt(result.theoreticalMinRttMs)} ms` },
    { rowId: "rtt", label: "Round-trip time (ping)", value: `${fmt(result.rttMs)} ms`, key: true, total: true },
  ];

  const chartData = result.legs.map((l) => ({
    id: l.rowId,
    name: l.label,
    ms: Math.round(l.ms * 100) / 100,
    colour: l.colour,
  }));

  const wrap =
    "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel =
    "w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground shadow-sm outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium text-foreground mb-1";

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Technology", href: "/calculator#technology" },
          { label: "Ping Time Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Ping Time Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="flex flex-col">
              <label className={lbl}>Distance to Server</label>
              <div className={wrap}>
                <input
                  type="number"
                  value={inputs.distanceKm}
                  onChange={(e) => set("distanceKm", parseFloat(e.target.value) || 0)}
                  className={ci}
                  min={0}
                  step={10}
                />
                <span className="pr-3 text-sm text-muted-foreground select-none">km</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Straight-line (great-circle) distance. London–New York is about 5,570 km; London–Sydney about 16,990 km.
              </p>
            </div>

            <div className="flex flex-col">
              <label className={lbl}>Transmission Medium</label>
              <select
                value={inputs.medium}
                onChange={(e) => set("medium", e.target.value as MediumKey)}
                className={sel}
              >
                {MEDIA.map((m) => (
                  <option key={m.key} value={m.key}>
                    {m.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">{spec.note}</p>
            </div>

            <div className="flex flex-col">
              <label className={lbl}>Your Connection Type</label>
              <select
                value={inputs.access}
                onChange={(e) => set("access", e.target.value as AccessKey)}
                className={sel}
              >
                {ACCESS.map((a) => (
                  <option key={a.key} value={a.key}>
                    {a.label} (+{a.oneWayMs} ms each way)
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className="text-sm font-semibold text-primary hover:underline text-left mt-1"
            >
              {showAdvanced ? "− Hide" : "+ Show"} Advanced Options
            </button>

            {showAdvanced && (
              <div className="flex flex-col gap-4 border-t border-border pt-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Route Realism</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col">
                      <label className={lbl}>Route Factor</label>
                      <div className={wrap}>
                        <input
                          type="number"
                          value={inputs.circuitousness}
                          onChange={(e) => set("circuitousness", parseFloat(e.target.value) || 1)}
                          className={ci}
                          min={1}
                          step={0.05}
                        />
                        <span className="pr-3 text-sm text-muted-foreground select-none">×</span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <label className={lbl}>Router Hops</label>
                      <div className={wrap}>
                        <input
                          type="number"
                          value={inputs.hopCount}
                          onChange={(e) => set("hopCount", parseInt(e.target.value, 10) || 0)}
                          className={ci}
                          min={0}
                          step={1}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col mt-3">
                    <label className={lbl}>Delay Per Hop</label>
                    <div className={wrap}>
                      <input
                        type="number"
                        value={inputs.perHopMs}
                        onChange={(e) => set("perHopMs", parseFloat(e.target.value) || 0)}
                        className={ci}
                        min={0}
                        step={0.05}
                      />
                      <span className="pr-3 text-sm text-muted-foreground select-none">ms</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Packet &amp; Link</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col">
                      <label className={lbl}>Packet Size</label>
                      <div className={wrap}>
                        <input
                          type="number"
                          value={inputs.packetBytes}
                          onChange={(e) => set("packetBytes", parseInt(e.target.value, 10) || 1)}
                          className={ci}
                          min={1}
                          step={8}
                        />
                        <span className="pr-3 text-sm text-muted-foreground select-none">B</span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <label className={lbl}>Link Speed</label>
                      <div className={wrap}>
                        <input
                          type="number"
                          value={inputs.linkMbps}
                          onChange={(e) => set("linkMbps", parseFloat(e.target.value) || 1)}
                          className={ci}
                          min={0.1}
                          step={10}
                        />
                        <span className="pr-3 text-sm text-muted-foreground select-none">Mbps</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inputs.proMode}
                      onChange={(e) => set("proMode", e.target.checked)}
                      className="h-4 w-4 accent-primary"
                    />
                    <span className="text-sm font-semibold text-foreground">Professional Mode</span>
                  </label>
                  <p className="text-xs text-muted-foreground mt-1 mb-3">
                    Adds queuing and server turnaround to the budget, plus TCP throughput and application verdicts.
                  </p>
                  {inputs.proMode && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col">
                        <label className={lbl}>Queuing Delay</label>
                        <div className={wrap}>
                          <input
                            type="number"
                            value={inputs.congestionQueueMs}
                            onChange={(e) => set("congestionQueueMs", parseFloat(e.target.value) || 0)}
                            className={ci}
                            min={0}
                            step={1}
                          />
                          <span className="pr-3 text-sm text-muted-foreground select-none">ms</span>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <label className={lbl}>Server Turnaround</label>
                        <div className={wrap}>
                          <input
                            type="number"
                            value={inputs.serverProcessingMs}
                            onChange={(e) => set("serverProcessingMs", parseFloat(e.target.value) || 0)}
                            className={ci}
                            min={0}
                            step={0.5}
                          />
                          <span className="pr-3 text-sm text-muted-foreground select-none">ms</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={handleCalculate}
                className="flex-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-10 transition-colors flex items-center justify-center font-bold text-base"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center"
                aria-label="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RESULTS */}
          <div className="flex flex-col gap-4">
            {/* 1. Primary */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-sm font-bold uppercase tracking-wider text-primary mb-1">Estimated Round-Trip Ping</div>
              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-bold text-primary tracking-tight">{fmt(result.rttMs)}</div>
                <div className="text-lg font-semibold text-muted-foreground">ms</div>
              </div>
              <div className="text-sm font-medium text-muted-foreground mt-2">
                {fmt(result.oneWayMs)} ms one way &middot;{" "}
                <span className="font-semibold" style={{ color: result.gradeColour }}>
                  {result.grade}
                </span>{" "}
                &middot; {fmt(result.overheadRatio, 2)}× the physical minimum
              </div>
            </div>

            {/* 2. Three-stat bar */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card shadow-sm">
              <div className="p-4 text-center">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Propagation</div>
                <div className="text-2xl font-bold" style={{ color: "hsl(217 91% 60%)" }}>{fmt(result.propagationRttMs)} ms</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {result.rttMs > 0 ? Math.round((result.propagationRttMs / result.rttMs) * 100) : 0}% of total
                </div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Equipment</div>
                <div className="text-2xl font-bold" style={{ color: "hsl(25 95% 53%)" }}>
                  {fmt(result.accessRttMs + result.hopMs + result.serializationMs + result.queueMs + result.serverMs)} ms
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">last mile, hops, queues</div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Grade</div>
                <div className="text-2xl font-bold" style={{ color: result.gradeColour }}>{result.grade}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {result.rttMs < 30 ? "< 30 ms" : result.rttMs < 60 ? "30–60 ms" : result.rttMs < 120 ? "60–120 ms" : "> 120 ms"}
                </div>
              </div>
            </div>

            {/* 3. Breakdown table */}
            <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
              <h3 className="text-base font-bold text-foreground mb-3">Latency Budget</h3>
              <table className="w-full text-base border-collapse">
                <tbody>
                  {tableRows.map((r) => (
                    <tr
                      key={r.rowId}
                      className={`border-b border-border/60 last:border-0 ${r.key ? "bg-primary/10" : ""} ${r.total ? "border-t-2 border-t-border font-bold" : ""}`}
                    >
                      <td className={`py-2.5 px-3 ${r.key ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 px-3 text-right tabular-nums ${r.key ? "font-bold text-primary" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. Chart */}
            <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
              <h3 className="text-base font-bold text-foreground mb-1">Where the Milliseconds Go</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Round-trip contribution of each component. The dashed line marks the {fmt(result.theoreticalMinRttMs)} ms vacuum floor for this distance.
              </p>
              <div style={{ height: 250 }}>
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RBar data={chartData} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 16% 65% / 0.25)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(215 16% 65%)" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(215 16% 65%)" width={52} unit=" ms" />
                      <RTooltip formatter={(v: number) => [`${v} ms`, "Round-trip cost"]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <ReferenceLine
                        y={Math.round(result.theoreticalMinRttMs * 100) / 100}
                        stroke="hsl(0 84% 60%)"
                        strokeDasharray="4 4"
                        label={{ value: "vacuum floor", fontSize: 10, position: "insideTopRight" }}
                      />
                      <Bar dataKey="ms" name="Round-trip milliseconds" radius={[4, 4, 0, 0]}>
                        {chartData.map((d) => (
                          <Cell key={d.id} fill={d.colour} />
                        ))}
                      </Bar>
                    </RBar>
                  </ResponsiveContainer>
                ) : null}
              </div>
            </div>

            {/* Pro-mode extra section */}
            {inputs.proMode && (
              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-3">Application Impact</h3>
                <div className="flex flex-col gap-3">
                  <div className="bg-secondary/20 border border-border rounded-lg p-3">
                    <div className="text-sm font-semibold text-foreground mb-0.5">Online gaming</div>
                    <div className="text-sm text-muted-foreground">{result.gamingVerdict}</div>
                  </div>
                  <div className="bg-secondary/20 border border-border rounded-lg p-3">
                    <div className="text-sm font-semibold text-foreground mb-0.5">Voice &amp; video calls</div>
                    <div className="text-sm text-muted-foreground">{result.callVerdict}</div>
                  </div>
                  <div className="bg-secondary/20 border border-border rounded-lg p-3">
                    <div className="text-sm font-semibold text-foreground mb-0.5">Single-stream TCP ceiling</div>
                    <div className="text-sm text-muted-foreground">
                      With an unscaled 64 KB receive window, one TCP connection over this path tops out near{" "}
                      <strong className="text-foreground">{fmt(result.tcpThroughputMbps)} Mbps</strong> regardless of link capacity. Window
                      scaling or parallel connections are required to exceed it.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Summary statistics */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold text-foreground mb-3">Summary Statistics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                {tableRows.map((r) => (
                  <div key={r.rowId} className="flex justify-between gap-3 text-sm border-b border-border/40 py-1.5 last:border-0">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className={`tabular-nums ${r.key ? "font-bold text-primary" : "font-medium text-foreground"}`}>{r.value}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                This is a physics-and-equipment model, not a live measurement — it tells you what ping a path of this length
                <em>should</em> deliver. If your measured ping is well above the figure here, the extra delay is coming from
                congestion, a bufferbloated uplink, Wi-Fi retransmissions, or routing that detours far from the direct path.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Ping Time Actually Measures</h2>
            <p>
              Ping is the round-trip time for a small packet to reach a remote host and come back. The classic <code>ping</code>{" "}
              utility sends an ICMP echo request and waits for the echo reply, reporting the elapsed time in milliseconds. That
              single number bundles together four physically distinct delays, and separating them is the difference between
              diagnosing a problem and guessing at one.
            </p>
            <p>
              <strong>Propagation delay</strong> is the time the signal spends in transit. It is set by distance and by the speed of
              the signal in its medium, and no amount of money can reduce it below the speed of light. <strong>Serialization
              delay</strong> is the time to clock the packet's bits onto the wire, which is packet size divided by link rate.{" "}
              <strong>Processing delay</strong> is what each router spends parsing headers and making a forwarding decision.{" "}
              <strong>Queuing delay</strong> is time spent waiting behind other packets in a buffer, and it is the only one of the
              four that varies wildly from moment to moment. Propagation and serialization are computable from first principles.
              Processing is a small, fairly stable per-hop constant. Queuing is the wildcard, and it is where nearly all
              troubleshooting effort belongs.
            </p>

            <h2 className="text-2xl font-bold mb-3">Why Distance Sets a Floor You Cannot Argue With</h2>
            <p>
              Light in a vacuum covers 299,792 kilometres per second, or about 300 km per millisecond. Inside a single-mode fibre
              the glass core has a refractive index near 1.47, so light slows to roughly 204 km per millisecond. That figure is the
              single most useful number in network latency work. It means a signal needs about 4.9 milliseconds per 1,000
              kilometres of fibre one way, or 9.8 milliseconds per 1,000 kilometres round trip.
            </p>
            <p>
              London to New York is 5,570 km in a straight line. At fibre speed, that alone is 27 ms one way and 55 ms round trip
              before a single router is involved — and real transatlantic cable routes are longer than the great circle, so
              measured values sit closer to 70 ms. This is why content delivery networks exist. No protocol optimisation,
              hardware upgrade, or premium ISP plan can beat physics; the only way to reduce propagation delay is to move the
              content closer to the user. A CDN edge node 50 km away delivers a 1 ms propagation delay that a perfectly tuned
              connection to a server 5,000 km away can never approach.
            </p>

            <h2 className="text-2xl font-bold mb-3">Route Circuitousness: The 40% You Forget</h2>
            <p>
              Fibre does not travel in straight lines. It follows railway rights of way, motorway easements, existing conduit, and
              seabed routes chosen to avoid trawler damage and geological hazards. The ratio between actual cable length and
              straight-line distance is called circuitousness, and on real backbone routes it typically measures between 1.2 and
              1.6. Using 1.4 as a default is a reasonable planning assumption for continental paths.
            </p>
            <p>
              This factor matters more than most people expect. A 1.4× route penalty on a 5,000 km path adds 2,000 km of glass,
              which is nearly 20 ms of round-trip delay. It is also why certain city pairs have surprisingly good or bad latency
              relative to their map distance: two cities on a major submarine cable landing route can beat two closer cities whose
              traffic has to detour through a distant exchange point. Peering geography, not physical geography, often determines
              the path.
            </p>

            <h2 className="text-2xl font-bold mb-3">Reading Your Own Ping Against This Estimate</h2>
            <p>
              Use this calculator to establish what your path <em>should</em> cost, then compare it to what <code>ping</code> or your
              game client reports. If the two agree within 10 or 20 percent, your connection is behaving normally and the latency
              you see is structural — the only fix is a closer server. If your measured ping runs far above the estimate, the
              surplus is diagnosable.
            </p>
            <p>
              Ping that is fine when idle but spikes when anyone uploads is bufferbloat: an oversized queue on your uplink filling
              with data. The fix is a modern queue discipline such as fq_codel or CAKE on your router, not a faster plan. Ping that
              is consistently high and jittery on Wi-Fi but clean on Ethernet points at radio retransmissions, channel congestion,
              or distance from the access point. Ping that is stable but far above the estimate usually means the route is not
              taking the path you assumed — <code>traceroute</code> or <code>mtr</code> will show you where it actually goes, and the
              answer is often a detour through an exchange in another country. Finally, remember that ICMP is sometimes
              rate-limited or deprioritised by routers, so a high ping to a device that forwards traffic perfectly well is not
              always a real problem.
            </p>
          </section>
          <FAQSection faqs={FAQS} pageUrl="https://racira.com/calculator/ping-time-calculator" />
          <PopularCalculators exclude="/calculator/ping-time-calculator" />
        </div>
      </div>
    </>
  );
};

export default PingTimeCalculator;
