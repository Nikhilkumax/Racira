"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown, Network, GitBranch, Router } from "lucide-react";
import { BarChart as RBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";

/* ============================================================
   BGP Path Selection Score Calculator
   Runs two candidate paths through the standard BGP best-path
   decision process and reports which attribute decided the
   winner, plus a lexicographically-consistent composite score.

   Each step carries weight 2^(n-i), so winning any step
   outweighs the sum of every less-significant step combined —
   the score ordering therefore matches the router's own
   tie-break ordering exactly.
   ============================================================ */

type Origin = "igp" | "egp" | "incomplete";
type PeerType = "ebgp" | "ibgp";

interface PathAttributes {
  weight: string;
  localPref: string;
  locallyOriginated: boolean;
  asPath: string;
  origin: Origin;
  med: string;
  peerType: PeerType;
  igpMetric: string;
  ageMinutes: string;
  routerId: string;
  clusterListLength: string;
  neighborIp: string;
}

interface BgpInputs {
  pathA: PathAttributes;
  pathB: PathAttributes;
  alwaysCompareMed: boolean;
  deterministicMed: boolean;
  proMode: boolean;
  maxPaths: string;
  relaxMultipathAsPath: boolean;
}

/* Origin codes rank IGP (0) best, then EGP (1), then Incomplete (2) */
const ORIGIN_RANK: Record<Origin, number> = { igp: 0, egp: 1, incomplete: 2 };
const ORIGIN_LABEL: Record<Origin, string> = { igp: "IGP (i)", egp: "EGP (e)", incomplete: "Incomplete (?)" };

interface StepResult {
  step: number;
  label: string;
  valueA: string;
  valueB: string;
  winner: "A" | "B" | "tie";
  decided: boolean;
  weight: number;
  vendorSpecific: boolean;
}

interface BgpResult {
  valid: boolean;
  error: string;
  winner: "A" | "B" | "tie";
  decidingStep: string;
  decidingStepNumber: number;
  scoreA: number;
  scoreB: number;
  marginPct: number;
  stepsCompared: number;
  steps: StepResult[];
  chartData: { name: string; delta: number; fill: string }[];
  multipathEligible: boolean;
  multipathReason: string;
  ecmpPaths: number;
}

const DEFAULT_PATH_A: PathAttributes = {
  weight: "0",
  localPref: "100",
  locallyOriginated: false,
  asPath: "65001 65010 65020",
  origin: "igp",
  med: "50",
  peerType: "ebgp",
  igpMetric: "20",
  ageMinutes: "1440",
  routerId: "10.0.0.1",
  clusterListLength: "0",
  neighborIp: "192.0.2.1",
};

const DEFAULT_PATH_B: PathAttributes = {
  weight: "0",
  localPref: "100",
  locallyOriginated: false,
  asPath: "65002 65030",
  origin: "igp",
  med: "80",
  peerType: "ebgp",
  igpMetric: "10",
  ageMinutes: "300",
  routerId: "10.0.0.2",
  clusterListLength: "0",
  neighborIp: "192.0.2.5",
};

const DEFAULTS: BgpInputs = {
  pathA: DEFAULT_PATH_A,
  pathB: DEFAULT_PATH_B,
  alwaysCompareMed: false,
  deterministicMed: true,
  proMode: false,
  maxPaths: "4",
  relaxMultipathAsPath: false,
};

/* AS_PATH length counts ASNs; AS_SET counts as 1, confederation
   segments are excluded — we approximate with whitespace tokens */
const asPathLength = (raw: string): number => {
  const trimmed = raw.trim();
  if (!trimmed) return 0;
  return trimmed.split(/[\s,]+/).filter(Boolean).length;
};

const firstAsn = (raw: string): string => {
  const parts = raw.trim().split(/[\s,]+/).filter(Boolean);
  return parts.length ? parts[0] : "—";
};

const ipToInt = (ip: string): number | null => {
  const parts = ip.trim().split(".");
  if (parts.length !== 4) return null;
  let total = 0;
  for (const p of parts) {
    if (!/^\d+$/.test(p)) return null;
    const n = parseInt(p, 10);
    if (n < 0 || n > 255) return null;
    total = total * 256 + n;
  }
  return total;
};

const numOr = (raw: string, fallback: number): number => {
  const n = parseFloat(raw);
  return isNaN(n) ? fallback : n;
};

const calculateBgp = (inputs: BgpInputs): BgpResult => {
  const A = inputs.pathA;
  const B = inputs.pathB;

  const empty: BgpResult = {
    valid: false,
    error: "",
    winner: "tie",
    decidingStep: "",
    decidingStepNumber: 0,
    scoreA: 0,
    scoreB: 0,
    marginPct: 0,
    stepsCompared: 0,
    steps: [],
    chartData: [],
    multipathEligible: false,
    multipathReason: "",
    ecmpPaths: 0,
  };

  const ipA = ipToInt(A.neighborIp);
  const ipB = ipToInt(B.neighborIp);
  if (ipA === null || ipB === null) {
    return { ...empty, error: "Neighbor addresses must be valid dotted-quad IPv4 addresses, for example 192.0.2.1." };
  }
  const ridA = ipToInt(A.routerId);
  const ridB = ipToInt(B.routerId);
  if (ridA === null || ridB === null) {
    return { ...empty, error: "Router IDs must be valid dotted-quad IPv4 addresses, for example 10.0.0.1." };
  }

  const lenA = asPathLength(A.asPath);
  const lenB = asPathLength(B.asPath);

  /* MED is only compared when the first (neighboring) AS matches,
     unless bgp always-compare-med is configured */
  const sameNeighborAs = firstAsn(A.asPath) === firstAsn(B.asPath);
  const medComparable = inputs.alwaysCompareMed || sameNeighborAs;

  /* Each comparator: higher-is-better returns positive when A wins */
  const cmpHigh = (a: number, b: number) => (a > b ? 1 : a < b ? -1 : 0);
  const cmpLow = (a: number, b: number) => (a < b ? 1 : a > b ? -1 : 0);
  const cmpBool = (a: boolean, b: boolean) => (a === b ? 0 : a ? 1 : -1);

  interface RawStep {
    label: string;
    a: string;
    b: string;
    cmp: number;
    vendorSpecific?: boolean;
  }

  const raw: RawStep[] = [
    {
      label: "Highest Weight",
      a: String(numOr(A.weight, 0)),
      b: String(numOr(B.weight, 0)),
      cmp: cmpHigh(numOr(A.weight, 0), numOr(B.weight, 0)),
      vendorSpecific: true,
    },
    {
      label: "Highest Local Preference",
      a: String(numOr(A.localPref, 100)),
      b: String(numOr(B.localPref, 100)),
      cmp: cmpHigh(numOr(A.localPref, 100), numOr(B.localPref, 100)),
    },
    {
      label: "Locally Originated",
      a: A.locallyOriginated ? "Yes" : "No",
      b: B.locallyOriginated ? "Yes" : "No",
      cmp: cmpBool(A.locallyOriginated, B.locallyOriginated),
    },
    {
      label: "Shortest AS_PATH",
      a: `${lenA} hop${lenA === 1 ? "" : "s"}`,
      b: `${lenB} hop${lenB === 1 ? "" : "s"}`,
      cmp: cmpLow(lenA, lenB),
    },
    {
      label: "Lowest Origin Code",
      a: ORIGIN_LABEL[A.origin],
      b: ORIGIN_LABEL[B.origin],
      cmp: cmpLow(ORIGIN_RANK[A.origin], ORIGIN_RANK[B.origin]),
    },
    {
      label: "Lowest MED",
      a: medComparable ? String(numOr(A.med, 0)) : "not compared",
      b: medComparable ? String(numOr(B.med, 0)) : "not compared",
      cmp: medComparable ? cmpLow(numOr(A.med, 0), numOr(B.med, 0)) : 0,
    },
    {
      label: "eBGP over iBGP",
      a: A.peerType === "ebgp" ? "eBGP" : "iBGP",
      b: B.peerType === "ebgp" ? "eBGP" : "iBGP",
      cmp: cmpBool(A.peerType === "ebgp", B.peerType === "ebgp"),
    },
    {
      label: "Lowest IGP Metric to Next Hop",
      a: String(numOr(A.igpMetric, 0)),
      b: String(numOr(B.igpMetric, 0)),
      cmp: cmpLow(numOr(A.igpMetric, 0), numOr(B.igpMetric, 0)),
    },
    {
      label: "Oldest eBGP Path",
      a: `${numOr(A.ageMinutes, 0)} min`,
      b: `${numOr(B.ageMinutes, 0)} min`,
      cmp:
        A.peerType === "ebgp" && B.peerType === "ebgp"
          ? cmpHigh(numOr(A.ageMinutes, 0), numOr(B.ageMinutes, 0))
          : 0,
    },
    {
      label: "Lowest Router ID",
      a: A.routerId,
      b: B.routerId,
      cmp: cmpLow(ridA, ridB),
    },
    {
      label: "Shortest Cluster List",
      a: String(numOr(A.clusterListLength, 0)),
      b: String(numOr(B.clusterListLength, 0)),
      cmp: cmpLow(numOr(A.clusterListLength, 0), numOr(B.clusterListLength, 0)),
    },
    {
      label: "Lowest Neighbor Address",
      a: A.neighborIp,
      b: B.neighborIp,
      cmp: cmpLow(ipA, ipB),
    },
  ];

  const n = raw.length;
  let decidedAt = -1;
  let scoreA = 0;
  let scoreB = 0;
  const totalWeight = Math.pow(2, n) - 1;

  const steps: StepResult[] = raw.map((r, i) => {
    const weight = Math.pow(2, n - 1 - i);
    const winner: "A" | "B" | "tie" = r.cmp > 0 ? "A" : r.cmp < 0 ? "B" : "tie";
    if (winner === "A") scoreA += weight;
    else if (winner === "B") scoreB += weight;
    else {
      scoreA += weight / 2;
      scoreB += weight / 2;
    }
    if (decidedAt === -1 && winner !== "tie") decidedAt = i;
    return {
      step: i + 1,
      label: r.label,
      valueA: r.a,
      valueB: r.b,
      winner,
      decided: false,
      weight,
      vendorSpecific: Boolean(r.vendorSpecific),
    };
  });

  if (decidedAt >= 0) steps[decidedAt].decided = true;

  const scoreAPct = (scoreA / totalWeight) * 100;
  const scoreBPct = (scoreB / totalWeight) * 100;
  const winner: "A" | "B" | "tie" = decidedAt === -1 ? "tie" : steps[decidedAt].winner;

  const chartData = steps.slice(0, 8).map((s) => ({
    name: `${s.step}`,
    delta: s.winner === "A" ? 1 : s.winner === "B" ? -1 : 0,
    fill: s.decided ? "hsl(217 91% 60%)" : s.winner === "tie" ? "hsl(215 16% 65%)" : "hsl(215 20% 45%)",
  }));

  /* Professional — BGP multipath eligibility. Paths must tie on every
     attribute through IGP metric; AS_PATH must be identical unless
     relaxed by as-path multipath-relax */
  const tiedThroughIgp = steps.slice(0, 8).every((s) => s.winner === "tie");
  const asPathIdentical = A.asPath.trim() === B.asPath.trim();
  const asPathOk = inputs.relaxMultipathAsPath ? lenA === lenB : asPathIdentical;
  const multipathEligible = tiedThroughIgp && asPathOk;

  let multipathReason: string;
  if (multipathEligible) {
    multipathReason = inputs.relaxMultipathAsPath
      ? "Both paths tie through the IGP metric and share an equal AS_PATH length under as-path multipath-relax."
      : "Both paths tie through the IGP metric and carry an identical AS_PATH.";
  } else if (!tiedThroughIgp) {
    const firstDiff = steps.slice(0, 8).find((s) => s.winner !== "tie");
    multipathReason = `Paths diverge at step ${firstDiff ? firstDiff.step : 1} (${firstDiff ? firstDiff.label : ""}), so only the best path is installed.`;
  } else {
    multipathReason = "Attributes tie through the IGP metric, but the AS_PATH values differ. Enable as-path multipath-relax to allow equal-length paths from different neighbours.";
  }

  const maxPaths = Math.max(1, Math.floor(numOr(inputs.maxPaths, 1)));
  const ecmpPaths = multipathEligible ? Math.min(2, maxPaths) : 1;

  return {
    valid: true,
    error: "",
    winner,
    decidingStep: decidedAt === -1 ? "No attribute differs" : steps[decidedAt].label,
    decidingStepNumber: decidedAt === -1 ? 0 : decidedAt + 1,
    scoreA: scoreAPct,
    scoreB: scoreBPct,
    marginPct: Math.abs(scoreAPct - scoreBPct),
    stepsCompared: decidedAt === -1 ? n : decidedAt + 1,
    steps,
    chartData,
    multipathEligible,
    multipathReason,
    ecmpPaths,
  };
};

const num = (n: number, d = 2) => n.toLocaleString("en-US", { maximumFractionDigits: d });

const inp = "w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20";
const lbl = "text-sm font-medium text-foreground mb-1 block";
const groupLabel = "text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold flex items-center gap-1.5";

const FAQS = [
  {
    question: "What is the BGP best path selection process?",
    answer:
      "BGP frequently learns several routes to the same prefix but installs only one in the forwarding table. To choose, it walks an ordered list of attributes and stops at the first one where the candidates differ. Weight comes first, then local preference, locally-originated status, AS_PATH length, origin code, MED, eBGP versus iBGP, IGP metric to the next hop, path age, router ID, cluster list length, and finally the neighbour address. Because the comparison is strictly ordered, a path winning an early step wins outright no matter how poor it looks on every later attribute.",
  },
  {
    question: "What is the difference between weight and local preference?",
    answer:
      "Weight is a Cisco-proprietary attribute that never leaves the router that sets it, making it the tool for influencing outbound decisions on a single box. Local preference is a standard, well-known discretionary attribute advertised to all iBGP peers within an autonomous system, so it steers the whole AS toward a preferred exit consistently. Higher is better for both. Use weight for local overrides and local preference for AS-wide egress policy.",
  },
  {
    question: "Why is my MED being ignored?",
    answer:
      "By default BGP only compares MED between paths learned from the same neighbouring autonomous system, because the value is set by that neighbour and comparing values from different providers is meaningless. If your candidate paths come from different upstream ASes, the MED step is skipped entirely and selection falls through to the next tiebreak. The bgp always-compare-med command removes that restriction, and this calculator exposes it as a toggle so you can see the effect.",
  },
  {
    question: "Does a shorter AS_PATH always win?",
    answer:
      "No, and this is the most common misconception in BGP troubleshooting. AS_PATH is only the fourth tiebreak. If one path carries a higher weight or a higher local preference, it wins before AS_PATH is ever examined, even if its path is far longer. This is precisely why AS_PATH prepending sometimes appears to do nothing: the receiving network has a local preference policy that decides the outcome three steps earlier.",
  },
  {
    question: "What does the composite score in this calculator represent?",
    answer:
      "Each step is assigned a weight of two raised to the power of its position from the end, so any single step outweighs the combined total of every less significant step below it. That construction makes the numeric ordering identical to the router's own lexicographic tiebreak: the path with the higher score is always the path the router selects. The score is a readability aid that shows how decisive the win was, not an attribute BGP itself computes.",
  },
  {
    question: "When can BGP install more than one path?",
    answer:
      "BGP multipath requires the candidates to tie on every attribute through the IGP metric, and by default to carry an identical AS_PATH, not merely one of equal length. The maximum-paths command then controls how many are installed for load sharing. Cisco's bgp bestpath as-path multipath-relax relaxes the identity requirement to equal length, which allows load balancing across two different upstream providers. Professional Mode evaluates both conditions against your inputs.",
  },
  {
    question: "Why does the oldest path win a tie?",
    answer:
      "Preferring the older eBGP path is a stability mechanism. If two paths are otherwise equal, keeping the established one avoids needless route flapping every time a session bounces or a new peer appears. The trade-off is non-determinism: the winner depends on the order in which sessions came up rather than on configuration alone. Some operators disable this step with bgp bestpath compare-routerid so selection is reproducible after a reload.",
  },
  {
    question: "How do route reflectors affect path selection?",
    answer:
      "Route reflectors add two attributes to the process. ORIGINATOR_ID prevents loops by letting a router discard a route it originally advertised, and CLUSTER_LIST records each reflection cluster the update has traversed. A shorter cluster list is preferred, which sits at step eleven and effectively favours paths that took fewer reflection hops. In a well-designed hierarchy this rarely decides anything, but in a layered reflector topology it becomes the practical tiebreak.",
  },
];

const ORIGIN_OPTIONS: { value: Origin; label: string }[] = [
  { value: "igp", label: "IGP (i) — best" },
  { value: "egp", label: "EGP (e)" },
  { value: "incomplete", label: "Incomplete (?) — worst" },
];

export default function BgpPathSelectionScoreCalculator() {
  const [inputs, setInputs] = useState<BgpInputs>(DEFAULTS);
  const [result, setResult] = useState<BgpResult>(calculateBgp(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculateBgp(inputs));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setPath = <K extends keyof PathAttributes>(which: "pathA" | "pathB", key: K, val: PathAttributes[K]) =>
    setInputs((prev) => ({ ...prev, [which]: { ...prev[which], [key]: val } }));

  const setTop = <K extends keyof BgpInputs>(key: K, val: BgpInputs[K]) =>
    setInputs((prev) => ({ ...prev, [key]: val }));

  const handleCalculate = () => setResult(calculateBgp(inputs));

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculateBgp(DEFAULTS));
    setShowAdvanced(false);
  };

  const winnerLabel = result.winner === "tie" ? "Tie" : `Path ${result.winner}`;

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Technology", href: "/calculator#technology" },
          { label: "BGP Path Selection Score Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          BGP Path Selection Score Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* ───────── INPUT PANEL ───────── */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div>
              <div className={groupLabel}>
                <Router className="h-3.5 w-3.5" /> Local Preference
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={lbl} htmlFor="bgp-lp-a">Path A</label>
                  <input
                    id="bgp-lp-a"
                    type="number"
                    step="1"
                    value={inputs.pathA.localPref}
                    onChange={(e) => setPath("pathA", "localPref", e.target.value)}
                    className={inp}
                  />
                </div>
                <div>
                  <label className={lbl} htmlFor="bgp-lp-b">Path B</label>
                  <input
                    id="bgp-lp-b"
                    type="number"
                    step="1"
                    value={inputs.pathB.localPref}
                    onChange={(e) => setPath("pathB", "localPref", e.target.value)}
                    className={inp}
                  />
                </div>
              </div>
            </div>

            <div>
              <div className={groupLabel}>
                <GitBranch className="h-3.5 w-3.5" /> AS_PATH (space separated)
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={lbl} htmlFor="bgp-as-a">Path A</label>
                  <input
                    id="bgp-as-a"
                    type="text"
                    value={inputs.pathA.asPath}
                    onChange={(e) => setPath("pathA", "asPath", e.target.value)}
                    className={inp}
                  />
                </div>
                <div>
                  <label className={lbl} htmlFor="bgp-as-b">Path B</label>
                  <input
                    id="bgp-as-b"
                    type="text"
                    value={inputs.pathB.asPath}
                    onChange={(e) => setPath("pathB", "asPath", e.target.value)}
                    className={inp}
                  />
                </div>
              </div>
            </div>

            <div>
              <div className={groupLabel}>
                <Network className="h-3.5 w-3.5" /> MED (Multi-Exit Discriminator)
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={lbl} htmlFor="bgp-med-a">Path A</label>
                  <input
                    id="bgp-med-a"
                    type="number"
                    step="1"
                    value={inputs.pathA.med}
                    onChange={(e) => setPath("pathA", "med", e.target.value)}
                    className={inp}
                  />
                </div>
                <div>
                  <label className={lbl} htmlFor="bgp-med-b">Path B</label>
                  <input
                    id="bgp-med-b"
                    type="number"
                    step="1"
                    value={inputs.pathB.med}
                    onChange={(e) => setPath("pathB", "med", e.target.value)}
                    className={inp}
                  />
                </div>
              </div>
            </div>

            <div>
              <div className={groupLabel}>
                <Network className="h-3.5 w-3.5" /> IGP Metric to Next Hop
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={lbl} htmlFor="bgp-igp-a">Path A</label>
                  <input
                    id="bgp-igp-a"
                    type="number"
                    step="1"
                    value={inputs.pathA.igpMetric}
                    onChange={(e) => setPath("pathA", "igpMetric", e.target.value)}
                    className={inp}
                  />
                </div>
                <div>
                  <label className={lbl} htmlFor="bgp-igp-b">Path B</label>
                  <input
                    id="bgp-igp-b"
                    type="number"
                    step="1"
                    value={inputs.pathB.igpMetric}
                    onChange={(e) => setPath("pathB", "igpMetric", e.target.value)}
                    className={inp}
                  />
                </div>
              </div>
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
                    <Router className="h-3.5 w-3.5" /> Weight (Cisco-specific)
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={lbl} htmlFor="bgp-w-a">Path A</label>
                      <input
                        id="bgp-w-a"
                        type="number"
                        step="1"
                        value={inputs.pathA.weight}
                        onChange={(e) => setPath("pathA", "weight", e.target.value)}
                        className={inp}
                      />
                    </div>
                    <div>
                      <label className={lbl} htmlFor="bgp-w-b">Path B</label>
                      <input
                        id="bgp-w-b"
                        type="number"
                        step="1"
                        value={inputs.pathB.weight}
                        onChange={(e) => setPath("pathB", "weight", e.target.value)}
                        className={inp}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className={groupLabel}>
                    <GitBranch className="h-3.5 w-3.5" /> Origin Code
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={lbl} htmlFor="bgp-o-a">Path A</label>
                      <select
                        id="bgp-o-a"
                        value={inputs.pathA.origin}
                        onChange={(e) => setPath("pathA", "origin", e.target.value as Origin)}
                        className={inp}
                      >
                        {ORIGIN_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={lbl} htmlFor="bgp-o-b">Path B</label>
                      <select
                        id="bgp-o-b"
                        value={inputs.pathB.origin}
                        onChange={(e) => setPath("pathB", "origin", e.target.value as Origin)}
                        className={inp}
                      >
                        {ORIGIN_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <div className={groupLabel}>
                    <Network className="h-3.5 w-3.5" /> Peer Type
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={lbl} htmlFor="bgp-pt-a">Path A</label>
                      <select
                        id="bgp-pt-a"
                        value={inputs.pathA.peerType}
                        onChange={(e) => setPath("pathA", "peerType", e.target.value as PeerType)}
                        className={inp}
                      >
                        <option value="ebgp">eBGP</option>
                        <option value="ibgp">iBGP</option>
                      </select>
                    </div>
                    <div>
                      <label className={lbl} htmlFor="bgp-pt-b">Path B</label>
                      <select
                        id="bgp-pt-b"
                        value={inputs.pathB.peerType}
                        onChange={(e) => setPath("pathB", "peerType", e.target.value as PeerType)}
                        className={inp}
                      >
                        <option value="ebgp">eBGP</option>
                        <option value="ibgp">iBGP</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <div className={groupLabel}>
                    <Router className="h-3.5 w-3.5" /> Tiebreak Identity
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={lbl} htmlFor="bgp-rid-a">Router ID A</label>
                      <input
                        id="bgp-rid-a"
                        type="text"
                        value={inputs.pathA.routerId}
                        onChange={(e) => setPath("pathA", "routerId", e.target.value)}
                        className={inp}
                      />
                    </div>
                    <div>
                      <label className={lbl} htmlFor="bgp-rid-b">Router ID B</label>
                      <input
                        id="bgp-rid-b"
                        type="text"
                        value={inputs.pathB.routerId}
                        onChange={(e) => setPath("pathB", "routerId", e.target.value)}
                        className={inp}
                      />
                    </div>
                    <div>
                      <label className={lbl} htmlFor="bgp-nip-a">Neighbor IP A</label>
                      <input
                        id="bgp-nip-a"
                        type="text"
                        value={inputs.pathA.neighborIp}
                        onChange={(e) => setPath("pathA", "neighborIp", e.target.value)}
                        className={inp}
                      />
                    </div>
                    <div>
                      <label className={lbl} htmlFor="bgp-nip-b">Neighbor IP B</label>
                      <input
                        id="bgp-nip-b"
                        type="text"
                        value={inputs.pathB.neighborIp}
                        onChange={(e) => setPath("pathB", "neighborIp", e.target.value)}
                        className={inp}
                      />
                    </div>
                    <div>
                      <label className={lbl} htmlFor="bgp-age-a">Path Age A (min)</label>
                      <input
                        id="bgp-age-a"
                        type="number"
                        step="1"
                        value={inputs.pathA.ageMinutes}
                        onChange={(e) => setPath("pathA", "ageMinutes", e.target.value)}
                        className={inp}
                      />
                    </div>
                    <div>
                      <label className={lbl} htmlFor="bgp-age-b">Path Age B (min)</label>
                      <input
                        id="bgp-age-b"
                        type="number"
                        step="1"
                        value={inputs.pathB.ageMinutes}
                        onChange={(e) => setPath("pathB", "ageMinutes", e.target.value)}
                        className={inp}
                      />
                    </div>
                    <div>
                      <label className={lbl} htmlFor="bgp-cl-a">Cluster List A</label>
                      <input
                        id="bgp-cl-a"
                        type="number"
                        step="1"
                        min="0"
                        value={inputs.pathA.clusterListLength}
                        onChange={(e) => setPath("pathA", "clusterListLength", e.target.value)}
                        className={inp}
                      />
                    </div>
                    <div>
                      <label className={lbl} htmlFor="bgp-cl-b">Cluster List B</label>
                      <input
                        id="bgp-cl-b"
                        type="number"
                        step="1"
                        min="0"
                        value={inputs.pathB.clusterListLength}
                        onChange={(e) => setPath("pathB", "clusterListLength", e.target.value)}
                        className={inp}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className={groupLabel}>
                    <Network className="h-3.5 w-3.5" /> Selection Behaviour
                  </div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inputs.pathA.locallyOriginated}
                      onChange={(e) => setPath("pathA", "locallyOriginated", e.target.checked)}
                      className="h-4 w-4 rounded border-input accent-primary"
                    />
                    Path A is locally originated
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inputs.pathB.locallyOriginated}
                      onChange={(e) => setPath("pathB", "locallyOriginated", e.target.checked)}
                      className="h-4 w-4 rounded border-input accent-primary"
                    />
                    Path B is locally originated
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inputs.alwaysCompareMed}
                      onChange={(e) => setTop("alwaysCompareMed", e.target.checked)}
                      className="h-4 w-4 rounded border-input accent-primary"
                    />
                    bgp always-compare-med
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inputs.deterministicMed}
                      onChange={(e) => setTop("deterministicMed", e.target.checked)}
                      className="h-4 w-4 rounded border-input accent-primary"
                    />
                    bgp deterministic-med
                  </label>
                </div>

                <div>
                  <div className={groupLabel}>
                    <GitBranch className="h-3.5 w-3.5" /> Professional Mode
                  </div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inputs.proMode}
                      onChange={(e) => setTop("proMode", e.target.checked)}
                      className="h-4 w-4 rounded border-input accent-primary"
                    />
                    Evaluate multipath / ECMP eligibility
                  </label>
                </div>

                {inputs.proMode && (
                  <>
                    <div>
                      <label className={lbl} htmlFor="bgp-maxpaths">maximum-paths</label>
                      <input
                        id="bgp-maxpaths"
                        type="number"
                        min="1"
                        step="1"
                        value={inputs.maxPaths}
                        onChange={(e) => setTop("maxPaths", e.target.value)}
                        className={inp}
                      />
                    </div>
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inputs.relaxMultipathAsPath}
                        onChange={(e) => setTop("relaxMultipathAsPath", e.target.checked)}
                        className="h-4 w-4 rounded border-input accent-primary"
                      />
                      bgp bestpath as-path multipath-relax
                    </label>
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
                <div className="text-base font-medium text-foreground">{result.error}</div>
              </div>
            ) : (
              <>
                {/* 1 — PRIMARY CARD */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    Best Path Selected
                  </div>
                  <div className="text-4xl font-bold text-primary tracking-tight mb-2">{winnerLabel}</div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {result.winner === "tie" ? (
                      <>All twelve attributes are identical — no deterministic winner</>
                    ) : (
                      <>
                        Decided at step {result.decidingStepNumber}:{" "}
                        <span className="font-bold text-foreground">{result.decidingStep}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* 2 — 3-STAT BAR */}
                <div className="grid grid-cols-3 border border-border rounded-lg overflow-hidden bg-card">
                  <div className="p-4 text-center">
                    <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-1">Path A Score</div>
                    <div
                      className={`text-base font-bold ${
                        result.winner === "A" ? "text-emerald-600 dark:text-emerald-500" : "text-muted-foreground"
                      }`}
                    >
                      {num(result.scoreA, 1)}%
                    </div>
                  </div>
                  <div className="p-4 text-center border-l border-border">
                    <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-1">Path B Score</div>
                    <div
                      className={`text-base font-bold ${
                        result.winner === "B" ? "text-emerald-600 dark:text-emerald-500" : "text-muted-foreground"
                      }`}
                    >
                      {num(result.scoreB, 1)}%
                    </div>
                  </div>
                  <div className="p-4 text-center border-l border-border">
                    <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-1">Steps Compared</div>
                    <div
                      className={`text-base font-bold ${
                        result.stepsCompared <= 4
                          ? "text-emerald-600 dark:text-emerald-500"
                          : result.stepsCompared <= 8
                          ? "text-orange-600 dark:text-orange-500"
                          : "text-red-600 dark:text-red-500"
                      }`}
                    >
                      {result.stepsCompared} of 12
                    </div>
                  </div>
                </div>

                {/* 3 — BREAKDOWN TABLE */}
                <div className="card-calculator !p-0 border border-border bg-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-secondary/40 border-b border-border">
                        <tr>
                          <th className="text-xs font-bold uppercase text-muted-foreground tracking-wider py-2.5 px-3">Step</th>
                          <th className="text-xs font-bold uppercase text-muted-foreground tracking-wider py-2.5 px-3">Path A</th>
                          <th className="text-xs font-bold uppercase text-muted-foreground tracking-wider py-2.5 px-3">Path B</th>
                          <th className="text-xs font-bold uppercase text-muted-foreground tracking-wider py-2.5 px-3 text-right">Winner</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {result.steps.map((s) => (
                          <tr key={s.step} className={s.decided ? "bg-primary/10 font-bold" : ""}>
                            <td className="text-base py-2.5 px-3">
                              {s.step}. {s.label}
                              {s.vendorSpecific && (
                                <span className="ml-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">Cisco</span>
                              )}
                            </td>
                            <td className="text-base py-2.5 px-3 font-mono">{s.valueA}</td>
                            <td className="text-base py-2.5 px-3 font-mono">{s.valueB}</td>
                            <td className="text-base py-2.5 px-3 text-right">
                              {s.winner === "tie" ? (
                                <span className="text-muted-foreground">tie</span>
                              ) : (
                                <span className={s.decided ? "text-primary" : "text-foreground"}>{s.winner}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                        <tr className="border-t-2 border-border font-bold bg-secondary/20">
                          <td className="text-base py-2.5 px-3">Composite Score</td>
                          <td className="text-base py-2.5 px-3 font-mono">{num(result.scoreA, 1)}%</td>
                          <td className="text-base py-2.5 px-3 font-mono">{num(result.scoreB, 1)}%</td>
                          <td className="text-base py-2.5 px-3 text-right text-primary">{winnerLabel}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4 — CHART */}
                <div className="card-calculator !p-4 border border-border bg-card">
                  <div className="text-sm font-bold text-foreground mb-1">Attribute Comparison by Step</div>
                  <div className="text-xs text-muted-foreground mb-3">
                    Bars above the line favour Path A, below favour Path B — the first non-zero bar decides
                  </div>
                  {mounted ? (
                    <div style={{ width: "100%", height: 250 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RBar data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                          <YAxis
                            domain={[-1.2, 1.2]}
                            ticks={[-1, 0, 1]}
                            tick={{ fontSize: 11 }}
                            stroke="hsl(var(--muted-foreground))"
                            tickFormatter={(v: number) => (v > 0 ? "A" : v < 0 ? "B" : "tie")}
                          />
                          <RTooltip
                            formatter={(v: number | string) => [
                              Number(v) > 0 ? "Path A wins" : Number(v) < 0 ? "Path B wins" : "Tie",
                              "Result",
                            ]}
                            contentStyle={{ fontSize: 12, borderRadius: 8 }}
                          />
                          <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" />
                          <Bar dataKey="delta" name="Step outcome" radius={[3, 3, 0, 0]}>
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
                      Deciding step
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "hsl(215 20% 45%)" }} />
                      Non-deciding difference
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "hsl(215 16% 65%)" }} />
                      Tie
                    </span>
                  </div>
                </div>

                {/* TIER 2B — PROFESSIONAL MODE RESULTS */}
                {inputs.proMode && (
                  <div className="card-calculator !p-5 border border-border bg-card">
                    <div className={groupLabel}>
                      <GitBranch className="h-3.5 w-3.5" /> Multipath / ECMP Analysis
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5">Multipath Eligible</div>
                        <div
                          className={`text-lg font-bold ${
                            result.multipathEligible
                              ? "text-emerald-600 dark:text-emerald-500"
                              : "text-orange-600 dark:text-orange-500"
                          }`}
                        >
                          {result.multipathEligible ? "Yes" : "No"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5">Paths Installed</div>
                        <div className="text-lg font-bold text-foreground">{result.ecmpPaths}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5">maximum-paths</div>
                        <div className="text-lg font-bold text-foreground">{inputs.maxPaths}</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-3">{result.multipathReason}</div>
                  </div>
                )}

                {/* 5 — SUMMARY STATISTICS (mirrors the breakdown table) */}
                <div className="bg-muted/30 rounded-lg p-5">
                  <div className={groupLabel}>
                    <Network className="h-3.5 w-3.5" /> Summary Statistics
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                    {result.steps.map((s) => (
                      <div key={s.step} className="flex items-baseline justify-between gap-3 text-sm">
                        <span className={s.decided ? "font-bold text-foreground" : "text-muted-foreground"}>
                          {s.step}. {s.label}
                        </span>
                        <span className={`font-mono ${s.decided ? "font-bold text-primary" : "text-foreground"}`}>
                          {s.winner === "tie" ? "tie" : `Path ${s.winner}`}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-baseline justify-between gap-3 text-sm border-t-2 border-border pt-2 sm:col-span-2 mt-1">
                      <span className="font-bold text-foreground">Composite Score</span>
                      <span className="font-mono font-bold text-foreground">
                        A {num(result.scoreA, 1)}% · B {num(result.scoreB, 1)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-3">
                    Margin of {num(result.marginPct, 1)} percentage points. Selection stopped after{" "}
                    {result.stepsCompared} of 12 steps.
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
            <h2 className="text-2xl font-bold mb-3">How BGP Chooses Between Competing Routes</h2>
            <p>
              A border router on a moderately connected network will often hold several valid routes to the same
              destination prefix, learned from different peers with different attributes. Only one can be installed
              in the forwarding table, so BGP applies a fixed sequence of comparisons and stops at the first
              attribute where the candidates differ. That first difference decides everything; nothing below it is
              even examined.
            </p>
            <p>
              This ordering is what makes BGP troubleshooting counter-intuitive. Engineers frequently prepend AS
              numbers to make a path look worse, then find traffic unchanged, because a local preference policy
              three steps earlier had already settled the outcome. This calculator makes that visible: it runs both
              candidate paths through all twelve steps, names the exact attribute that decided the winner, and shows
              which later attributes were never consulted.
            </p>

            <h2 className="text-2xl font-bold mb-3">The Attributes in Order of Precedence</h2>
            <p>
              Weight comes first and is Cisco-proprietary. It never leaves the router that sets it, which makes it
              ideal for a local override and useless for AS-wide policy. Local preference is second and is the
              standard tool for that wider job, since it propagates to every iBGP peer and steers the entire
              autonomous system toward a chosen exit. Both prefer higher values, which trips up engineers used to
              metrics where lower wins.
            </p>
            <p>
              Locally originated routes win third, then the shortest AS_PATH, then the lowest origin code where IGP
              beats EGP beats Incomplete. MED sits sixth and is the most misunderstood: it is only compared between
              paths from the same neighbouring AS, because a value set by one provider means nothing next to a value
              set by another. Below MED come the preference for eBGP over iBGP, the lowest IGP metric to the next
              hop, the oldest path, the lowest router ID, the shortest cluster list, and finally the lowest neighbour
              address as an absolute last resort.
            </p>

            <h2 className="text-2xl font-bold mb-3">Reading the Composite Score</h2>
            <p>
              The percentage scores shown here compress twelve ordered comparisons into a single number. Each step
              carries a weight of two raised to the power of its distance from the end of the list, so winning any
              step is worth more than winning every less significant step combined. That construction guarantees the
              numeric ordering matches the router's lexicographic decision exactly — the higher score always belongs
              to the path the router installs.
            </p>
            <p>
              The margin between the two scores tells you how robust the decision is. A wide margin means the winner
              prevailed on an early, high-weight attribute and small configuration changes will not flip it. A
              narrow margin means the paths tied through most of the process and the outcome hinged on something
              incidental, such as router ID or session age — the kind of decision that can reverse unexpectedly after
              a maintenance window. BGP itself computes no such score; it is a readability aid layered over the
              standard process.
            </p>

            <h2 className="text-2xl font-bold mb-3">Multipath, Stability, and Practical Policy</h2>
            <p>
              When two paths tie all the way through the IGP metric, BGP can install both and load share across
              them, but the conditions are stricter than most operators expect. The AS_PATH must be identical by
              default, not merely equal in length, which rules out balancing across two different upstream providers
              until the as-path multipath-relax option is enabled. The maximum-paths setting then caps how many
              entries are actually programmed.
            </p>
            <p>
              Two steps exist purely for stability rather than optimality. Preferring the oldest eBGP path avoids
              churn when sessions bounce, at the cost of making selection depend on startup order rather than
              configuration — which is why some operators disable it with bgp bestpath compare-routerid to keep
              behaviour reproducible. Deterministic MED similarly ensures that the comparison order of received
              updates cannot change the result. For policy that behaves predictably, set local preference for inbound
              traffic engineering, use AS_PATH prepending and MED for outbound influence with the understanding that
              neighbours may ignore both, and verify the outcome rather than assuming it.
            </p>
          </section>
          <FAQSection faqs={FAQS} pageUrl="https://racira.com/calculator/bgp-path-selection-score-calculator" />
          <PopularCalculators exclude="/calculator/bgp-path-selection-score-calculator" />
        </div>
      </div>
    </>
  );
}
