"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

type BarType = "Olympic" | "Standard" | "Technique" | "SafetySquat";

interface Inputs {
  targetWeight: string;
  barType: BarType;
  availablePlates: string;
  collarWeight: string;
  allowLess: string;
}

interface PlateCount {
  weight: number;
  eachSide: number;
  total: number;
  fill: string;
}

interface Result {
  valid: boolean;
  error?: string;
  targetWeight: number;
  barType: BarType;
  barWeight: number;
  collarWeight: number;
  barPlusCollars: number;
  loadWeight: number;
  loadPerSide: number;
  plates: PlateCount[];
  totalPlateWeightUsed: number;
  accuracy: number;
  feasible: boolean;
  setupText: string;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { weight: string; count: number; fill: string }[];
  maxReachable: number;
}

const BAR_WEIGHTS: Record<BarType, number> = {
  Olympic: 45,
  Standard: 45,
  Technique: 15,
  SafetySquat: 65,
};

const PLATE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#ec4899", "#84cc16"];

const STANDARD_PLATES = [45, 35, 25, 10, 5, 2.5, 1.25];

function parsePlates(raw: string): number[] {
  if (!raw || !raw.trim()) return [...STANDARD_PLATES];
  const parts = raw
    .split(",")
    .map((p) => parseFloat(p.trim()))
    .filter((n) => Number.isFinite(n) && n > 0)
    .sort((a, b) => b - a);
  if (parts.length === 0) return [...STANDARD_PLATES];
  return parts;
}

function safeNum(raw: string, fallback = 0): number {
  const n = parseFloat(raw);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return n;
}

function calculate(inputs: Inputs): Result {
  const targetWeight = safeNum(inputs.targetWeight, 0);
  const barType = inputs.barType || "Olympic";
  const barWeight = BAR_WEIGHTS[barType] ?? 45;
  const collarWeight = safeNum(inputs.collarWeight, 0);
  const allowLess = inputs.allowLess === "yes";
  const plates = parsePlates(inputs.availablePlates);

  const barPlusCollars = barWeight + collarWeight;
  const loadWeight = Math.max(0, targetWeight - barPlusCollars);
  const loadPerSide = loadWeight / 2;

  const result: Result = {
    valid: true,
    targetWeight,
    barType,
    barWeight,
    collarWeight,
    barPlusCollars,
    loadWeight,
    loadPerSide,
    plates: [],
    totalPlateWeightUsed: 0,
    accuracy: 100,
    feasible: true,
    setupText: "",
    breakdown: [],
    summaryStats: [],
    chartData: [],
    maxReachable: barPlusCollars,
  };

  if (targetWeight <= 0) {
    result.valid = false;
    result.error = "Enter a target weight greater than zero to plan your plates.";
    result.breakdown = buildBreakdown(result);
    result.summaryStats = buildSummary(result);
    return result;
  }

  if (targetWeight < barPlusCollars) {
    result.valid = false;
    result.error = `Target weight is below the bar + collar weight (${barPlusCollars.toFixed(2)} lbs). Use just the bar, or raise the target.`;
    result.breakdown = buildBreakdown(result);
    result.summaryStats = buildSummary(result);
    return result;
  }

  const perSide = [...plates];
  const counts: Record<number, number> = {};
  let remaining = loadPerSide;
  const EPS = 1e-6;

  for (const plate of perSide) {
    counts[plate] = 0;
    while (remaining >= plate - EPS && remaining > EPS) {
      counts[plate] += 1;
      remaining -= plate;
    }
  }

  const roundedRemaining = Math.round(remaining * 100) / 100;
  const feasible = roundedRemaining < 0.05;

  const usedPlates = perSide.filter((p) => counts[p] > 0);

  const plateCounts: PlateCount[] = usedPlates.map((p, i) => ({
    weight: p,
    eachSide: counts[p],
    total: counts[p] * 2,
    fill: PLATE_COLORS[i % PLATE_COLORS.length],
  }));

  const totalPlateWeightUsed = plateCounts.reduce((s, p) => s + p.weight * p.total, 0);
  const achieved = barPlusCollars + totalPlateWeightUsed;
  const accuracy = targetWeight > 0 ? (achieved / targetWeight) * 100 : 0;

  result.plates = plateCounts;
  result.totalPlateWeightUsed = totalPlateWeightUsed;
  result.accuracy = accuracy;
  result.feasible = feasible;

  const maxLoadPerSide = perSide.reduce((s, p) => s + p, 0);
  result.maxReachable = barPlusCollars + maxLoadPerSide * 2;

  let setup: string;
  if (plateCounts.length === 0) {
    setup = `Empty bar: ${barWeight} lb bar${collarWeight > 0 ? ` + ${collarWeight} lb collars` : ""}`;
  } else if (!feasible) {
    setup = plateCounts
      .map((p) => `${p.eachSide} × ${p.weight} lb`)
      .join(", ");
    setup += ` per side (closest: ${achieved.toFixed(2)} lb, off by ${roundedRemaining.toFixed(2)} lb/side)`;
  } else {
    setup = plateCounts
      .map((p) => `${p.eachSide} × ${p.weight} lb`)
      .join(", ");
    setup += " per side";
  }
  result.setupText = setup;

  result.breakdown = buildBreakdown(result);
  result.summaryStats = buildSummary(result);
  result.chartData = plateCounts.map((p) => ({
    weight: `${p.weight} lb`,
    count: p.total,
    fill: p.fill,
  }));

  if (!feasible && !allowLess) {
    result.error = `Exact ${targetWeight} lb is not possible with the available plates. Closest reachable is ${achieved.toFixed(2)} lb. Enable "Use nearest achievable weight" to accept it.`;
  }

  return result;
}

function buildBreakdown(r: Result): { label: string; value: string }[] {
  return [
    { label: "Target Weight", value: `${r.targetWeight.toFixed(2)} lbs` },
    { label: "Bar Type", value: r.barType },
    { label: "Bar Weight", value: `${r.barWeight.toFixed(2)} lbs` },
    { label: "Collar Weight", value: `${r.collarWeight.toFixed(2)} lbs` },
    { label: "Bar + Collars", value: `${r.barPlusCollars.toFixed(2)} lbs` },
    { label: "Plate Load (total)", value: `${r.loadWeight.toFixed(2)} lbs` },
    { label: "Plate Load (per side)", value: `${r.loadPerSide.toFixed(2)} lbs` },
    { label: "Total Plate Weight Used", value: `${r.totalPlateWeightUsed.toFixed(2)} lbs` },
    { label: "Accuracy", value: `${r.accuracy.toFixed(2)}%` },
    { label: "Feasible Exactly", value: r.valid ? (r.feasible ? "Yes" : "No") : "N/A" },
  ];
}

function buildSummary(r: Result): { label: string; value: string }[] {
  const sideCount = r.plates.length;
  const totalPlates = r.plates.reduce((s, p) => s + p.total, 0);
  return [
    { label: "Target Weight", value: `${r.targetWeight.toFixed(2)} lbs` },
    { label: "Bar + Collars", value: `${r.barPlusCollars.toFixed(2)} lbs` },
    { label: "Load Per Side", value: `${r.loadPerSide.toFixed(2)} lbs` },
    { label: "Distinct Plates", value: `${sideCount}` },
    { label: "Total Plates", value: `${totalPlates}` },
    { label: "Max Reachable", value: `${r.maxReachable.toFixed(2)} lbs` },
  ];
}

const DEFAULTS: Inputs = {
  targetWeight: "225",
  barType: "Olympic",
  availablePlates: "45,35,25,10,5,2.5",
  collarWeight: "0",
  allowLess: "no",
};

export default function BarbellPlateCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(calculate(DEFAULTS));
  const [showAdv, setShowAdv] = useState(false);

  useEffect(() => {
    setResult(calculate(inputs));
  }, []);

  const calculateFn = () => setResult(calculate(inputs));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const update = (patch: Partial<Inputs>) => setInputs((prev) => ({ ...prev, ...patch }));

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "How does a barbell plate calculator work?", answer: "It subtracts the bar weight (plus any collars) from your target weight, splits the remainder across two sides of the bar, then greedily selects the largest available plates first to reach that per-side load as closely as possible." },
    { question: "What is an Olympic barbell?", answer: "A standard men's Olympic barbell weighs 45 lbs (20 kg). Women's Olympic bars are 35 lbs (15 kg) and technique bars are often 15 lbs. The calculator lets you switch bar types so the math matches your equipment." },
    { question: "Why can't I hit my exact target weight?", answer: "Plates come in fixed denominations. If the remaining load per side cannot be made from your available plate sizes, the calculator reports the closest achievable weight and shows how far off you are." },
    { question: "Do bar collars add weight?", answer: "Yes. Collar clips and lock collars can weigh a few pounds. Including collar weight in the calc keeps your total accurate, especially for lighter lifts where collars are a meaningful fraction of the load." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Barbell Plate Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Barbell Plate Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Target Weight</label>
                <div className={inp}>
                  <input type="number" value={inputs.targetWeight} onChange={e => update({ targetWeight: e.target.value })} className={ci} placeholder="225" />
                  <span className="px-3 text-sm text-muted-foreground">lbs</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Bar Type</label>
                <div className={inp}>
                  <select value={inputs.barType} onChange={e => update({ barType: e.target.value as BarType })} className={ci}>
                    <option value="Olympic">Olympic (45 lbs)</option>
                    <option value="Standard">Standard (45 lbs)</option>
                    <option value="Technique">Technique (15 lbs)</option>
                    <option value="SafetySquat">Safety Squat (65 lbs)</option>
                  </select>
                </div>
              </div>
            </div>

            <button onClick={() => setShowAdv(!showAdv)} className="text-sm text-primary font-medium text-left">
              Advanced Options {showAdv ? "▲" : "▼"}
            </button>
            {showAdv && (
              <div className="border border-border rounded-lg p-4 space-y-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Equipment</div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Available Plates (lbs, comma-separated)</label>
                  <div className={inp}>
                    <input type="text" value={inputs.availablePlates} onChange={e => update({ availablePlates: e.target.value })} className={ci} placeholder="45,35,25,10,5,2.5" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Common US plates: 45, 35, 25, 10, 5, 2.5, 1.25</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Collar Weight</label>
                    <div className={inp}>
                      <input type="number" value={inputs.collarWeight} onChange={e => update({ collarWeight: e.target.value })} className={ci} placeholder="0" />
                      <span className="px-3 text-sm text-muted-foreground">lbs</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Nearest Achievable</label>
                    <div className={inp}>
                      <select value={inputs.allowLess} onChange={e => update({ allowLess: e.target.value })} className={ci}>
                        <option value="no">Exact only</option>
                        <option value="yes">Allow nearest</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-1">
              <button onClick={calculateFn} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {!result.valid ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-xs font-bold uppercase tracking-wider mb-1 text-destructive">Plate Setup</div>
                <div className="text-xl font-extrabold tracking-tight text-destructive">{result.error}</div>
              </div>
            ) : (
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Plate Setup</div>
                <div className="text-2xl font-extrabold tracking-tight text-primary">{result.setupText}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {result.feasible
                    ? `Exact ${result.targetWeight.toFixed(2)} lb achieved · ${result.accuracy.toFixed(2)}% accuracy`
                    : `Closest achievable with available plates`}
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Target", `${result.targetWeight.toFixed(2)} lbs`],
                ["Bar + Collars", `${result.barPlusCollars.toFixed(2)} lbs`],
                ["Per Side", `${result.loadPerSide.toFixed(2)} lbs`],
              ].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold">{v}</div>
                </div>
              ))}
            </div>

            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Plate Breakdown</h3>
              {result.plates.length === 0 ? (
                <p className="text-sm text-muted-foreground">No plates required — use the empty bar.</p>
              ) : (
                <table className="w-full text-base">
                  <thead>
                    <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="py-2 px-3 text-left font-semibold">Plate</th>
                      <th className="py-2 px-3 text-right font-semibold">Per Side</th>
                      <th className="py-2 px-3 text-right font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.plates.map((p, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 0 ? "bg-primary/5" : ""}`}>
                        <td className="py-2.5 px-3 font-semibold">{p.weight} lb</td>
                        <td className="py-2.5 px-3 text-right">{p.eachSide}</td>
                        <td className="py-2.5 px-3 text-right">{p.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Plate Distribution</h3>
              {result.chartData.length === 0 ? (
                <p className="text-sm text-muted-foreground">No plates to chart.</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="weight" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                    <Tooltip formatter={(v: number) => [v, "Plates"]} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="mt-12 space-y-8 text-base text-foreground">
            <div>
              <h2 className="text-2xl font-bold mb-3">What Is a Barbell Plate Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A barbell plate calculator figures out exactly which weight plates to load on each side of a barbell to hit a target total weight. It is an essential gym companion for anyone following a strength program, because loading the wrong plates wastes sets and can quietly stall your progress. The tool starts with your target weight, subtracts the bar weight (a men's Olympic bar is 45 lbs, while technique bars are often 15 lbs), splits the remaining load across the two sides of the bar, and then picks from the plates you actually own. Instead of mentally dividing numbers between sets, you get a clean per-side setup you can replicate every session. Whether you train in a commercial gym with a full rack of 45s or a home garage with only a few pairs, the calculator adapts to the equipment you have and tells you the most efficient combination to reach your working weight.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How the Plate Math Works</h2>
              <p className="text-muted-foreground leading-relaxed">The core formula is simple: plate load = target weight − (bar weight + collar weight), and then that plate load is divided by two for the per-side amount. From there the calculator uses a greedy approach, choosing the largest available plate first and repeating until the remaining per-side load is smaller than the next plate down. Standard US plate denominations are 45, 35, 25, 10, 5, 2.5, and 1.25 lbs, so a 225 lb lift on a 45 lb Olympic bar needs 90 lbs per side, which is two 45 lb plates on each side. Collar weight is optional but matters for lighter lifts because clips can add a pound or two per side. If your target cannot be matched exactly with the plates you selected, the calculator reports the closest achievable weight and how far off it is, so you can decide whether to round up, round down, or grab a fractional 1.25 lb pair to close the gap.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Planning Workouts and Setting Up Your Gym</h2>
              <p className="text-muted-foreground leading-relaxed">Beyond a single set, the calculator helps you plan entire training sessions and design a home gym kit. Knowing the per-side breakdown lets you pre-load plates before a circuit, rotate between squat, bench, and deadlift stations without recounting, and warm up with calculated jump sets (for example, 135, 185, 225, 275) by reusing the same logic at each step. If you are buying your first plate set, run a few target weights through the tool to see which denominations you actually need: most lifters get the most value from pairs of 45s, 25s, and 10s, then add 5s and 2.5s for fine tuning. The Advanced Options let you model non-standard bars, add collar weight, and restrict the plate inventory to match what is on your rack, so the plan you build is the plan you can load.</p>
            </div>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/barbell-plate-calculator" />
          <PopularCalculators exclude="/calculator/barbell-plate-calculator" />
        </div>
      </div>
    </>
  );
}
