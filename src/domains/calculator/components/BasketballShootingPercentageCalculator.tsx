"use client";

import { useState, useEffect, useRef } from "react";
import { RotateCcw, Printer, ChevronDown, ChevronUp } from "lucide-react";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";

interface BasketballInputs {
  fieldGoalsMade: number;
  fieldGoalsAttempted: number;
  freeThrowsMade: number;
  freeThrowsAttempted: number;
  threePointersMade: number;
  threePointersAttempted: number;
  leagueFg: number;
  league3p: number;
}

interface BasketballResult {
  fgPercent: number;
  threePPercent: number;
  ftPercent: number;
  efgPercent: number;
  tsPercent: number;
  fgm: number;
  fga: number;
  points: number;
  classification: string;
  fgVsLeague: string;
  threePvsLeague: string;
}

const DEFAULTS: BasketballInputs = {
  fieldGoalsMade: 8,
  fieldGoalsAttempted: 16,
  freeThrowsMade: 5,
  freeThrowsAttempted: 6,
  threePointersMade: 2,
  threePointersAttempted: 6,
  leagueFg: 45,
  league3p: 35,
};

const calculateShooting = (inputs: BasketballInputs): BasketballResult => {
  const fieldGoalsMade = Math.max(0, inputs.fieldGoalsMade || 0);
  const fieldGoalsAttempted = Math.max(0, inputs.fieldGoalsAttempted || 0);
  const freeThrowsMade = Math.max(0, inputs.freeThrowsMade || 0);
  const freeThrowsAttempted = Math.max(0, inputs.freeThrowsAttempted || 0);
  const threePointersMade = Math.max(0, inputs.threePointersMade || 0);
  const threePointersAttempted = Math.max(0, inputs.threePointersAttempted || 0);
  const leagueFg = inputs.leagueFg || 45.0;
  const league3p = inputs.league3p || 35.0;

  const fgPercent = fieldGoalsAttempted > 0 ? (fieldGoalsMade / fieldGoalsAttempted) * 100 : 0;
  const threePPercent = threePointersAttempted > 0 ? (threePointersMade / threePointersAttempted) * 100 : 0;
  const ftPercent = freeThrowsAttempted > 0 ? (freeThrowsMade / freeThrowsAttempted) * 100 : 0;
  const efgPercent = fieldGoalsAttempted > 0 ? ((fieldGoalsMade + 0.5 * threePointersMade) / fieldGoalsAttempted) * 100 : 0;
  const points = 2 * fieldGoalsMade + 3 * threePointersMade + freeThrowsMade;
  const tsDenominator = 2 * (fieldGoalsAttempted + 0.44 * freeThrowsAttempted);
  const tsPercent = tsDenominator > 0 ? (points / tsDenominator) * 100 : 0;

  let classification = "Poor";
  if (fgPercent >= 50) classification = "Elite";
  else if (fgPercent >= 47) classification = "Very Good";
  else if (fgPercent >= 44) classification = "Good";
  else if (fgPercent >= 40) classification = "Average";
  else if (fgPercent >= 36) classification = "Below Average";

  const fgVsLeague = fieldGoalsAttempted > 0
    ? (fgPercent >= leagueFg ? `+${(fgPercent - leagueFg).toFixed(1)}%` : `${(fgPercent - leagueFg).toFixed(1)}%`)
    : "—";
  const threePvsLeague = threePointersAttempted > 0
    ? (threePPercent >= league3p ? `+${(threePPercent - league3p).toFixed(1)}%` : `${(threePPercent - league3p).toFixed(1)}%`)
    : "—";

  return {
    fgPercent,
    threePPercent,
    ftPercent,
    efgPercent,
    tsPercent,
    fgm: fieldGoalsMade,
    fga: fieldGoalsAttempted,
    points,
    classification,
    fgVsLeague,
    threePvsLeague,
  };
};

const fmt = (n: number, dec = 1) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmt0 = (n: number) => Math.round(n).toLocaleString("en-US");

const NumInput = ({ id, label, value, onChange, suffix }: {
  id: string; label: string; value: number; onChange: (v: number) => void; suffix?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input id={id} type="number" step="any" value={Number.isFinite(value) ? value : ""} onChange={(e) => onChange(parseFloat(e.target.value) || 0)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const BasketballShootingPercentageCalculator = () => {
  const [inputs, setInputs] = useState<BasketballInputs>(DEFAULTS);
  const [result, setResult] = useState<BasketballResult>(calculateShooting(DEFAULTS));
  const [showAdv, setShowAdv] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResult(calculateShooting(DEFAULTS));
  }, []);

  const set = (k: keyof BasketballInputs) => (v: number) => setInputs((prev) => ({ ...prev, [k]: v }));

  const hasErrors = Object.values(inputs).some((v) => v < 0);

  const handleCalculate = () => {
    if (hasErrors) return;
    setResult(calculateShooting(inputs));
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculateShooting(DEFAULTS));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCalculate();
  };

  const breakdown = [
    { label: "Field Goals Made", value: fmt0(result.fgm) },
    { label: "Field Goals Attempted", value: fmt0(result.fga) },
    { label: "Free Throws Made", value: fmt0(inputs.freeThrowsMade) },
    { label: "Free Throws Attempted", value: fmt0(inputs.freeThrowsAttempted) },
    { label: "Three-Pointers Made", value: fmt0(inputs.threePointersMade) },
    { label: "Three-Pointers Attempted", value: fmt0(inputs.threePointersAttempted) },
    { label: "Total Points", value: fmt0(result.points) },
    { label: "FG vs League", value: result.fgVsLeague },
    { label: "3P vs League", value: result.threePvsLeague },
  ];

  return (
    <div className="racira-page-container py-4" onKeyDown={handleKeyDown}>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
          <div className="grid grid-cols-2 gap-3">
            <NumInput id="fgm" label="Field Goals Made" value={inputs.fieldGoalsMade} onChange={set("fieldGoalsMade")} />
            <NumInput id="fga" label="Field Goals Attempted" value={inputs.fieldGoalsAttempted} onChange={set("fieldGoalsAttempted")} />
            <NumInput id="ftm" label="Free Throws Made" value={inputs.freeThrowsMade} onChange={set("freeThrowsMade")} />
            <NumInput id="fta" label="Free Throws Attempted" value={inputs.freeThrowsAttempted} onChange={set("freeThrowsAttempted")} />
          </div>

          <button type="button" onClick={() => setShowAdv((v) => !v)} className="flex items-center gap-1.5 text-sm text-primary font-medium self-start">
            Advanced Options {showAdv ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showAdv && (
            <div className="flex flex-col gap-3 p-3 rounded-lg border border-border bg-secondary/20 mt-1">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Three-Point Shooting</div>
                <div className="grid grid-cols-2 gap-3">
                  <NumInput id="3pm" label="Three-Pointers Made" value={inputs.threePointersMade} onChange={set("threePointersMade")} />
                  <NumInput id="3pa" label="Three-Pointers Attempted" value={inputs.threePointersAttempted} onChange={set("threePointersAttempted")} />
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">League Benchmarks</div>
                <div className="grid grid-cols-2 gap-3">
                  <NumInput id="league-fg" label="League FG%" value={inputs.leagueFg} onChange={set("leagueFg")} suffix="%" />
                  <NumInput id="league-3p" label="League 3P%" value={inputs.league3p} onChange={set("league3p")} suffix="%" />
                </div>
              </div>
            </div>
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
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Field Goal Percentage</div>
            <div className="text-4xl font-bold text-primary">{fmt(result.fgPercent, 1)}%</div>
            <div className="text-sm text-muted-foreground mt-1">{result.classification} · {result.fgVsLeague} vs. league</div>
          </div>

          <div className="grid grid-cols-4 divide-x divide-border border border-border rounded-lg bg-card shadow-sm overflow-hidden">
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">3P%</div>
              <div className="text-lg font-bold mt-1">{fmt(result.threePPercent, 1)}%</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">FT%</div>
              <div className="text-lg font-bold mt-1">{fmt(result.ftPercent, 1)}%</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">eFG%</div>
              <div className="text-lg font-bold text-emerald-600 mt-1">{fmt(result.efgPercent, 1)}%</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">TS%</div>
              <div className="text-lg font-bold mt-1">{fmt(result.tsPercent, 1)}%</div>
            </div>
          </div>

          <div className="card-calculator !p-4 shadow-sm border border-border bg-card">
            <h3 className="text-base font-semibold mb-3">Shooting Breakdown</h3>
            <table className="w-full text-base">
              <tbody>
                {breakdown.map((r) => (
                  <tr key={r.label} className="border-b last:border-0">
                    <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                    <td className="py-2.5 px-3 text-right font-medium">{r.value}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-border">
                  <td className="py-2.5 px-3 font-semibold">True Shooting %</td>
                  <td className="py-2.5 px-3 text-right font-bold text-primary">{fmt(result.tsPercent, 1)}%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-muted/30 rounded-lg p-5">
            <h3 className="text-sm font-semibold mb-3">Summary Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              {breakdown.map((r) => (
                <div key={r.label}>
                  <div className="text-xs text-muted-foreground">{r.label}</div>
                  <div className="text-base font-bold">{r.value}</div>
                </div>
              ))}
              <div>
                <div className="text-xs text-muted-foreground">True Shooting %</div>
                <div className="text-base font-bold text-primary">{fmt(result.tsPercent, 1)}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1180px] mt-8">
        <AdPlaceholder className="mb-10" />
        <section className="mt-12 space-y-8 text-base text-foreground">
          <div>
            <h2 className="text-2xl font-bold mb-3">What Is Shooting Percentage in Basketball?</h2>
            <p className="text-muted-foreground leading-relaxed">Shooting percentage answers a simple question in basketball: of the shots you take, how many go in? Field goal percentage divides made field goals by attempted field goals, and it is the headline efficiency stat for any scorer. Because not all shots are equal, analysts layer in three specialized rates: three-point percentage for shots behind the arc, free throw percentage at the line, and effective field goal percentage, which weights three-pointers at 1.5 times since they are worth one extra point. Together these rates describe how efficiently a player converts their attempts, separate from how many attempts they take — efficiency and volume are independent, and the most valuable scorers combine both. A player who shoots 45 percent on 20 attempts scores more than one who shoots 50 percent on 10, which is why front offices read shooting rates together with usage rather than in isolation.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">How the Shooting Metrics Are Calculated</h2>
            <p className="text-muted-foreground leading-relaxed">Field goal percentage is field goals made divided by field goals attempted, multiplied by 100. Three-point and free throw percentages follow the same pattern for their own attempts. Effective field goal percentage (eFG%) gives three-pointers a half-shot bonus: field goals made plus 0.5 times three-pointers made, divided by field goals attempted. The logic is simple — a three-pointer is worth 1.5 field goals, so a player who shoots 40 percent from deep is as efficient as one who shoots 60 percent inside the arc. True shooting percentage (TS%) goes further and accounts for free throws too, dividing total points by twice the sum of field goal attempts plus 0.44 times free throw attempts. The 0.44 factor is an estimate of how often a free throw attempt comes from a trip that would not otherwise count as a field-goal-attempt possession, and it is the standard approximation used across the league. League comparison lines in the results show how your FG% and 3P% stack against NBA-style baselines of 45 and 35 percent, so you can see at a glance whether a good-looking raw percentage is actually above or below the competition you are measured against.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p className="text-muted-foreground leading-relaxed">A field goal percentage at or above 50 percent is elite for a volume shooter, while 44 to 47 percent is solid and below 40 indicates inefficiency that volume cannot hide. Watch eFG% and TS% more than raw FG% when threes are part of your game: a player shooting 40 percent from three is roughly as efficient as one shooting 60 percent on twos, and TS% is the single best summary of scoring efficiency because it includes free throws. If your TS% runs well below your eFG%, free throw volume or accuracy is dragging you down — a correctable skill, unlike raw shooting touch. Use the league benchmarks to see whether your shooting profile fits a starter's role or needs a shot-selection adjustment: a below-average 3P% with a high attempt count is a red flag, while an above-average 3P% with few attempts often signals a player who should be shooting more.</p>
          </div>
        </section>
        <PopularCalculators exclude="/calculator/basketball-shooting-percentage-calculator" />
      </div>
    </div>
  );
};

export default BasketballShootingPercentageCalculator;