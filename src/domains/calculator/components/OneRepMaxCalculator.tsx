"use client";

import { useState, useEffect, useRef } from "react";
import { RotateCcw, Printer, ChevronDown, ChevronUp } from "lucide-react";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";

interface Inputs {
  weight: string;
  reps: string;
  method: string;
  units: string;
}

interface Result {
  epley: number;
  brzycki: number;
  lombardi: number;
  oconner: number;
  selected: number;
}

const DEFAULTS: Inputs = {
  weight: "185",
  reps: "5",
  method: "Epley",
  units: "lb",
};

function calculate(inputs: Inputs): Result {
  const w = Math.max(0, parseFloat(inputs.weight) || 0);
  const r = Math.min(100, Math.max(1, parseInt(inputs.reps) || 0));
  const epley = w * (1 + r / 30);
  const brzycki = r < 37 ? (w * 36) / (37 - r) : w;
  const lombardi = w * Math.pow(r, 0.1);
  const oconner = w * (1 + r / 40);
  const selected =
    inputs.method === "Brzycki" ? brzycki :
    inputs.method === "Lombardi" ? lombardi :
    inputs.method === "O'Conner" ? oconner : epley;
  return { epley, brzycki, lombardi, oconner, selected };
}

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmt1 = (n: number) => fmt(n, 1);

const NumInput = ({ id, label, value, onChange, suffix }: {
  id: string; label: string; value: string; onChange: (v: string) => void; suffix?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input id={id} type="number" step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const SelectInput = ({ id, label, value, onChange, options }: {
  id: string; label: string; value: string; onChange: (v: string) => void; options: string[];
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground shadow-sm focus-within:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none">
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const OneRepMaxCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(calculate(DEFAULTS));
  const [showAdv, setShowAdv] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResult(calculate(DEFAULTS));
  }, []);

  const set = (k: keyof Inputs) => (v: string) => setInputs((prev) => ({ ...prev, [k]: v }));
  const num = (v: string) => parseFloat(v) || 0;
  const reps = () => Math.max(1, parseInt(inputs.reps) || 0);

  const hasErrors =
    num(inputs.weight) <= 0 ||
    num(inputs.reps) <= 0 || num(inputs.reps) > 100;

  const handleCalculate = () => {
    if (hasErrors) return;
    setResult(calculate(inputs));
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCalculate();
  };

  const zones = [
    { label: "95% — Strength (1-2 reps)", pct: 95 },
    { label: "90% — Strength (2-4 reps)", pct: 90 },
    { label: "85% — Hypertrophy/Power (4-6 reps)", pct: 85 },
    { label: "80% — Hypertrophy (6-8 reps)", pct: 80 },
    { label: "75% — Hypertrophy (8-10 reps)", pct: 75 },
    { label: "70% — Endurance (10-12 reps)", pct: 70 },
    { label: "65% — Endurance (12-15 reps)", pct: 65 },
    { label: "60% — Endurance (15+ reps)", pct: 60 },
    { label: "50% — Warm-up / Technique", pct: 50 },
  ];

  const methodRows = [
    { label: "Epley — w × (1 + reps/30)", value: result.epley, isSelected: inputs.method === "Epley" },
    { label: "Brzycki — w × 36/(37 − reps)", value: result.brzycki, isSelected: inputs.method === "Brzycki" },
    { label: "Lombardi — w × reps^0.10", value: result.lombardi, isSelected: inputs.method === "Lombardi" },
    { label: "O'Conner — w × (1 + reps/40)", value: result.oconner, isSelected: inputs.method === "O'Conner" },
  ];

  return (
    <div className="racira-page-container py-4" onKeyDown={handleKeyDown}>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
          <div className="grid grid-cols-2 gap-3">
            <NumInput id="weight" label="Weight Lifted" value={inputs.weight} onChange={set("weight")} suffix={inputs.units} />
            <NumInput id="reps" label="Reps Performed" value={inputs.reps} onChange={set("reps")} suffix="reps" />
          </div>

          <button type="button" onClick={() => setShowAdv((v) => !v)} className="flex items-center gap-1.5 text-sm text-primary font-medium self-start">
            Advanced Options {showAdv ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showAdv && (
            <div className="flex flex-col gap-3 p-3 rounded-lg border border-border bg-secondary/20 mt-1">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Estimation Settings</div>
                <div className="grid grid-cols-2 gap-3">
                  <SelectInput id="method" label="Estimation Method" value={inputs.method} onChange={set("method")} options={["Epley", "Brzycki", "Lombardi", "O'Conner"]} />
                  <SelectInput id="units" label="Units" value={inputs.units} onChange={set("units")} options={["lb", "kg"]} />
                </div>
              </div>
            </div>
          )}

          {hasErrors && (
            <p className="text-sm text-red-600">Enter valid values — weight must be positive and reps between 1 and 100.</p>
          )}

          <div className="flex gap-2.5 mt-2.5">
            <button type="button" onClick={handleCalculate} className="h-10 flex-1 flex items-center justify-center rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-base transition-all active:scale-[0.98] shadow-sm">
              Calculate
            </button>
            <button type="button" onClick={handleReset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 focus:outline-none" aria-label="Reset">
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div ref={resultsRef} className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start print-section">
          <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
            <button type="button" onClick={() => window.print()} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors" aria-label="Print">
              <Printer className="h-4 w-4" />
            </button>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Estimated 1-Rep Max</div>
            <div className="text-4xl font-bold text-primary">{fmt1(result.selected)} {inputs.units}</div>
            <div className="text-sm text-muted-foreground mt-1">{inputs.method} method from {fmt(num(inputs.weight), 0)} {inputs.units} × {reps()} reps</div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-border border border-border rounded-lg bg-card shadow-sm overflow-hidden">
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Epley</div>
              <div className="text-lg font-bold mt-1">{fmt1(result.epley)}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Brzycki</div>
              <div className="text-lg font-bold mt-1">{fmt1(result.brzycki)}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Lombardi</div>
              <div className="text-lg font-bold mt-1">{fmt1(result.lombardi)}</div>
            </div>
          </div>

          <div className="card-calculator !p-4 shadow-sm border border-border bg-card">
            <h3 className="text-base font-semibold mb-3">Estimates by Formula</h3>
            <table className="w-full text-base">
              <tbody>
                {methodRows.map((r) => (
                  <tr key={r.label} className={`border-b last:border-0 ${r.isSelected ? "bg-primary/5" : ""}`}>
                    <td className="py-2.5 px-3 text-muted-foreground">{r.label}{r.isSelected && <span className="ml-2 text-xs font-semibold text-primary">SELECTED</span>}</td>
                    <td className="py-2.5 px-3 text-right font-medium">{fmt1(r.value)} {inputs.units}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-border">
                  <td className="py-2.5 px-3 font-semibold">Selected 1RM ({inputs.method})</td>
                  <td className="py-2.5 px-3 text-right font-bold text-primary">{fmt1(result.selected)} {inputs.units}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="card-calculator !p-4 shadow-sm border border-border bg-card">
            <h3 className="text-base font-semibold mb-3">Training Zones ({inputs.method} 1RM)</h3>
            <table className="w-full text-base">
              <tbody>
                {zones.map((z) => (
                  <tr key={z.label} className="border-b last:border-0">
                    <td className="py-2.5 px-3 text-muted-foreground">{z.label}</td>
                    <td className="py-2.5 px-3 text-right font-medium">{fmt1(result.selected * z.pct / 100)} {inputs.units}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-border">
                  <td className="py-2.5 px-3 font-semibold">Selected 1RM ({inputs.method})</td>
                  <td className="py-2.5 px-3 text-right font-bold text-primary">{fmt1(result.selected)} {inputs.units}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-muted/30 rounded-lg p-5">
            <h3 className="text-sm font-semibold mb-3">Summary Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              {methodRows.map((r) => (
                <div key={r.label}>
                  <div className="text-xs text-muted-foreground">{r.label.split(" — ")[0]}</div>
                  <div className="text-base font-bold">{fmt1(r.value)} {inputs.units}</div>
                </div>
              ))}
              {zones.map((z) => (
                <div key={z.label}>
                  <div className="text-xs text-muted-foreground">{z.label}</div>
                  <div className="text-base font-bold">{fmt1(result.selected * z.pct / 100)} {inputs.units}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1180px] mt-8">
        <AdPlaceholder className="mb-10" />
        <section className="mt-12 space-y-8 text-base text-foreground">
          <div>
            <h2 className="text-2xl font-bold mb-3">What Is a One-Rep Max?</h2>
            <p className="text-muted-foreground leading-relaxed">A one-rep max, or 1RM, is the heaviest weight you can lift for a single repetition with proper form. It is the classic yardstick of maximal strength, used by powerlifters, strength coaches, and recreational lifters to set training loads and measure progress over time. Testing a true 1RM is demanding — it requires a spotter, a thorough warm-up, and heavy loads that carry real injury risk — which is why estimation formulas exist. Every estimation method in this calculator takes a submaximal set you have already completed — a weight and the number of clean reps — and projects the weight you could lift for exactly one rep. The four formulas here are the most widely published and validated: Epley, Brzycki, Lombardi, and O'Conner. They differ in how aggressively they extrapolate from high-rep sets, which is why the calculator shows all four side by side: when they agree closely, the estimate is trustworthy; when they diverge, the truth usually sits somewhere in the middle and the spread itself is informative.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">How 1RM Estimates Are Calculated</h2>
            <p className="text-muted-foreground leading-relaxed">Each formula takes the lifted weight and the number of reps and applies a published multiplier. The Epley formula adds 2.5 percent of the weight for every rep performed — mathematically, weight times one plus reps over 30 — so 185 pounds for 5 reps estimates 185 times 1.1667, or about 216 pounds. The Brzycki formula uses weight times 36 divided by 37 minus reps, which gives 208 pounds for the same set and is generally considered the most conservative. The Lombardi formula raises the rep count to the 0.10 power, weight times reps to the 0.10, yielding roughly 217 pounds, while the O'Conner formula adds 2.5 percent per rep up to a limit of ten reps, weight times one plus reps over 40, landing near 208 pounds. The formulas were each validated against different populations — Epley on experienced lifters, Brzycki on collegiate athletes — and they converge for sets of one to five reps while spreading apart as reps climb into the double digits, because extrapolating ten or fifteen reps to a single rep stretches any curve. That is why the recommended practice is to estimate from sets of ten reps or fewer and why this calculator caps the rep input at 100 while flagging nothing — the four-way spread shows you the uncertainty for free. Training zones then scale the selected 1RM down to the standard percentage targets: 90 percent for heavy strength work, 75 to 85 percent for hypertrophy, and 50 to 70 percent for endurance and technique, each with its characteristic rep range.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p className="text-muted-foreground leading-relaxed">Look first at the spread across the four formulas. A tight cluster — within a few pounds — means the estimate is stable and you can plan around the headline number with confidence. A wide spread, which typically appears when the set had many reps, means the true 1RM is uncertain; the honest reading is the range, not any single value, and the fix is to retest with a heavier weight and fewer reps. The selected method drives the training zone table below, so switching methods re-derives every zone weight in one click — the zones are the practical output, giving you exact loads for each rep range of your program. When programming, remember the zones are starting points, not ceilings: the 90 percent zone for sets of two to four reps, the 75 to 85 percent zone for eight to ten reps of hypertrophy work, and the sub-70 percent zone for higher-rep endurance sets and warm-ups. Because 1RM estimates drift with fatigue, hydration, and technique, re-estimate every four to six weeks or whenever the formula spread tightens after a strength block, and always prefer clean reps over heavy but sloppy ones — a misgrooved rep inflates the estimate and sends next week's loads too high. The calculator is deliberately conservative in its default method, and the honest takeaway is that no formula replaces an actual heavy single performed with a spotter; use the estimates to plan the work, and let the platform or the bar verify the number.</p>
          </div>
        </section>
        <PopularCalculators exclude="/calculator/1-rep-max-1rm-calculator" />
      </div>
    </div>
  );
};

export default OneRepMaxCalculator;
