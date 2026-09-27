"use client";

import { useState, useEffect, useRef } from "react";
import { RotateCcw, Printer, ChevronDown, ChevronUp } from "lucide-react";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";

interface OBPInputs {
  atBats: number;
  hits: number;
  walks: number;
  sacFlies: number;
  singles: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  hitByPitch: number;
  sacrificeHits: number;
}

interface OBPResult {
  obp: number;
  obpFormatted: string;
  slugging: number;
  sluggingFormatted: string;
  ops: number;
  opsFormatted: string;
  opsPlus: number;
  plateAppearances: number;
  timesOnBase: number;
  totalBases: number;
  classification: string;
}

const DEFAULTS: OBPInputs = {
  atBats: 450,
  hits: 120,
  walks: 55,
  sacFlies: 5,
  singles: 0,
  doubles: 0,
  triples: 0,
  homeRuns: 0,
  hitByPitch: 4,
  sacrificeHits: 3,
};

const calculateOBP = (inputs: OBPInputs): OBPResult => {
  let {
    atBats, hits, walks, sacFlies, singles, doubles, triples, homeRuns, hitByPitch, sacrificeHits,
  } = inputs;

  atBats = Math.max(0, atBats);
  hits = Math.max(0, hits);
  walks = Math.max(0, walks);
  sacFlies = Math.max(0, sacFlies);
  singles = Math.max(0, singles);
  doubles = Math.max(0, doubles);
  triples = Math.max(0, triples);
  homeRuns = Math.max(0, homeRuns);
  hitByPitch = Math.max(0, hitByPitch);
  sacrificeHits = Math.max(0, sacrificeHits);

  const advTotal = singles + doubles + triples + homeRuns;
  if (advTotal > 0) {
    hits = advTotal;
  }

  const denominator = atBats + walks + hitByPitch + sacFlies;
  const numerator = hits + walks + hitByPitch;
  const obp = denominator > 0 ? numerator / denominator : 0;

  const totalBases = singles + doubles * 2 + triples * 3 + homeRuns * 4;
  const slugging = atBats > 0 ? totalBases / atBats : 0;
  const ops = obp + slugging;
  const leagueOps = 0.740;
  const opsPlus = leagueOps > 0 ? (ops / leagueOps) * 100 : 100;

  const plateAppearances = atBats + walks + hitByPitch + sacFlies + sacrificeHits;
  const timesOnBase = hits + walks + hitByPitch;

  let classification = "Very Poor";
  if (obp >= 0.400) classification = "Elite";
  else if (obp >= 0.370) classification = "Great";
  else if (obp >= 0.340) classification = "Above Average";
  else if (obp >= 0.320) classification = "Average";
  else if (obp >= 0.300) classification = "Below Average";
  else if (obp >= 0.280) classification = "Poor";

  const formatStat = (val: number): string => {
    const fixed = val.toFixed(3);
    return fixed.startsWith("0") ? fixed.substring(1) : fixed;
  };

  return {
    obp,
    obpFormatted: formatStat(obp),
    slugging,
    sluggingFormatted: formatStat(slugging),
    ops,
    opsFormatted: formatStat(ops),
    opsPlus: Math.round(opsPlus),
    plateAppearances,
    timesOnBase,
    totalBases,
    classification,
  };
};

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });

const NumInput = ({ id, label, value, onChange }: {
  id: string; label: string; value: number; onChange: (v: number) => void;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <input id={id} type="number" step="any" value={Number.isFinite(value) ? value : ""} onChange={(e) => onChange(parseFloat(e.target.value) || 0)} className="w-full h-10 px-3 text-base rounded-md border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
  </div>
);

const BaseballOBPCalculator = () => {
  const [inputs, setInputs] = useState<OBPInputs>(DEFAULTS);
  const [result, setResult] = useState<OBPResult>(calculateOBP(DEFAULTS));
  const [showAdv, setShowAdv] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResult(calculateOBP(DEFAULTS));
  }, []);

  const set = (k: keyof OBPInputs) => (v: number) => setInputs((prev) => ({ ...prev, [k]: v }));

  const hasErrors = Object.values(inputs).some((v) => v < 0);

  const handleCalculate = () => {
    if (hasErrors) return;
    setResult(calculateOBP(inputs));
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculateOBP(DEFAULTS));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCalculate();
  };

  const breakdown = [
    { label: "Plate Appearances", value: fmt(result.plateAppearances) },
    { label: "At Bats", value: fmt(inputs.atBats) },
    { label: "Hits", value: fmt(inputs.hits) },
    { label: "Walks", value: fmt(inputs.walks) },
    { label: "Hit By Pitch", value: fmt(inputs.hitByPitch) },
    { label: "Sacrifice Flies", value: fmt(inputs.sacFlies) },
    { label: "Total Bases", value: fmt(result.totalBases) },
    { label: "Times on Base", value: fmt(result.timesOnBase) },
  ];

  return (
    <div className="racira-page-container py-4" onKeyDown={handleKeyDown}>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
          <div className="grid grid-cols-2 gap-3">
            <NumInput id="at-bats" label="At Bats" value={inputs.atBats} onChange={set("atBats")} />
            <NumInput id="hits" label="Hits" value={inputs.hits} onChange={set("hits")} />
            <NumInput id="walks" label="Walks" value={inputs.walks} onChange={set("walks")} />
            <NumInput id="sac-flies" label="Sacrifice Flies" value={inputs.sacFlies} onChange={set("sacFlies")} />
          </div>

          <button type="button" onClick={() => setShowAdv((v) => !v)} className="flex items-center gap-1.5 text-sm text-primary font-medium self-start">
            Advanced Options {showAdv ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showAdv && (
            <div className="flex flex-col gap-3 p-3 rounded-lg border border-border bg-secondary/20 mt-1">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Hit Breakdown</div>
                <div className="grid grid-cols-2 gap-3">
                  <NumInput id="singles" label="Singles" value={inputs.singles} onChange={set("singles")} />
                  <NumInput id="doubles" label="Doubles" value={inputs.doubles} onChange={set("doubles")} />
                  <NumInput id="triples" label="Triples" value={inputs.triples} onChange={set("triples")} />
                  <NumInput id="home-runs" label="Home Runs" value={inputs.homeRuns} onChange={set("homeRuns")} />
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Plate Discipline</div>
                <div className="grid grid-cols-2 gap-3">
                  <NumInput id="hbp" label="Hit By Pitch" value={inputs.hitByPitch} onChange={set("hitByPitch")} />
                  <NumInput id="sac-hits" label="Sacrifice Hits" value={inputs.sacrificeHits} onChange={set("sacrificeHits")} />
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
            <div className="text-xs uppercase tracking-wide text-muted-foreground">On-Base Percentage</div>
            <div className="text-4xl font-bold text-primary">{result.obpFormatted}</div>
            <div className="text-sm text-muted-foreground mt-1">{result.classification} · {fmt(result.plateAppearances)} plate appearances</div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-border border border-border rounded-lg bg-card shadow-sm overflow-hidden">
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Slugging</div>
              <div className="text-lg font-bold mt-1">{result.sluggingFormatted}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">OPS</div>
              <div className="text-lg font-bold text-emerald-600 mt-1">{result.opsFormatted}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">OPS+</div>
              <div className="text-lg font-bold mt-1">{fmt(result.opsPlus)}</div>
            </div>
          </div>

          <div className="card-calculator !p-4 shadow-sm border border-border bg-card">
            <h3 className="text-base font-semibold mb-3">On-Base Breakdown</h3>
            <table className="w-full text-base">
              <tbody>
                {breakdown.map((r) => (
                  <tr key={r.label} className="border-b last:border-0">
                    <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                    <td className="py-2.5 px-3 text-right font-medium">{r.value}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-border">
                  <td className="py-2.5 px-3 font-semibold">OPS (OBP + SLG)</td>
                  <td className="py-2.5 px-3 text-right font-bold text-primary">{result.opsFormatted}</td>
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
                <div className="text-xs text-muted-foreground">OPS (OBP + SLG)</div>
                <div className="text-base font-bold text-primary">{result.opsFormatted}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1180px] mt-8">
        <AdPlaceholder className="mb-10" />
        <section className="mt-12 space-y-8 text-base text-foreground">
          <div>
            <h2 className="text-2xl font-bold mb-3">What Is On-Base Percentage?</h2>
            <p className="text-muted-foreground leading-relaxed">On-base percentage (OBP) measures how often a batter reaches base safely per plate appearance. It is calculated as hits plus walks plus hit by pitch, divided by at bats plus walks plus hit by pitch plus sacrifice flies. Sacrifice bunts are excluded from the denominator because they are not plate appearances in which the batter is trying to reach base. OBP is the most important component of offensive value for many analysts because it captures plate discipline — a player who draws walks at a high rate creates more scoring opportunities than one who swings at everything, and a walk is every bit as valuable as a single in the on-base sense. League average OBP typically sits around .310 to .320, elite hitters reach .380 or better, and .400 marks a historic season — only a handful of players have ever finished a season at that level. Because OBP rewards patience, it correlates more strongly with run scoring than batting average does, which is why modern front offices treat it as the foundation of offensive evaluation.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">How OBP and OPS Are Calculated</h2>
            <p className="text-muted-foreground leading-relaxed">The calculator starts with your at bats, hits, walks, and sacrifice flies, then optionally takes your full hit breakdown — singles, doubles, triples, and home runs — to compute slugging percentage as total bases divided by at bats. On-base percentage divides times on base by plate appearances, where times on base counts hits, walks, and hit by pitch. Adding the two gives OPS, a combined measure of getting on base and hitting for power; the resulting figure is the standard shorthand scouts and fans use to rank hitters. The OPS+ figure scales the result to a league-average baseline of 100, using a fixed league OPS of .740; a value of 115 means the hitter is 15 percent better than the average player. Plate appearances add sacrifice hits on top of the OBP denominator for the full counting picture, so the totals column of the results table reconciles exactly with a traditional box score. When you enter the advanced hit breakdown, the calculator uses the sum of singles, doubles, triples, and home runs as the hit total so slugging and on-base stay internally consistent.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p className="text-muted-foreground leading-relaxed">An OBP of .340 or better is above average and indicates a productive top-of-lineup hitter, while .280 or below signals a contact problem that no amount of power can fully offset. Compare OPS against your league's typical range: around .700 is average, .800 is very good, and .900 approaches MVP-level production. The classification bands in the results give a quick read: .400 is elite, .370 is great, .340 is above average, .320 is average, and .300 is below average. If you enter the advanced hit breakdown, the calculator uses those counts for slugging and overrides the aggregate hits field to keep the numbers internally consistent. Use the tool at season checkpoints to track whether a slump is driven by missing the ball or by bad luck on batted balls, and whether your walk rate is keeping your OBP healthy when the batting average dips — a falling average with a stable OBP is a far less alarming sign than the reverse.</p>
          </div>
        </section>
        <PopularCalculators exclude="/calculator/baseball-on-base-percentage-calculator" />
      </div>
    </div>
  );
};

export default BaseballOBPCalculator;