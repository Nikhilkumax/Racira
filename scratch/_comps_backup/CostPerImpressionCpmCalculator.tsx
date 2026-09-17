"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  spend: string;
  impressions: string;
  clicks: string;
  desiredImpressions: string;
}

interface Result {
  cpm: number;
  costPerImpression: number;
  ctrPct: number;
  costForDesired: number;
  impressionsPerDollar: number;
  cpcEquivalent: number;
}

const DEFAULTS: Inputs = {
  spend: "3000",
  impressions: "750000",
  clicks: "9000",
  desiredImpressions: "1000000",
};

function calculate(inputs: Inputs): Result {
  const spend = Math.max(0, parseFloat(inputs.spend) || 0);
  const impressions = Math.max(0, parseFloat(inputs.impressions) || 0);
  const clicks = Math.max(0, parseFloat(inputs.clicks) || 0);
  const desiredImpressions = Math.max(0, parseFloat(inputs.desiredImpressions) || 0);

  const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
  const costPerImpression = impressions > 0 ? spend / impressions : 0;
  const ctrPct = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const costForDesired = (cpm / 1000) * desiredImpressions;
  const impressionsPerDollar = cpm > 0 ? 1000 / cpm : 0;
  const cpcEquivalent = clicks > 0 ? spend / clicks : 0;

  return { cpm, costPerImpression, ctrPct, costForDesired, impressionsPerDollar, cpcEquivalent };
}

const NumInput = ({ id, label, value, onChange, prefix, suffix }: {
  id: string; label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input id={id} type="number" step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtMoney = (n: number, dec = 2) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });

export default function CostPerImpressionCpmCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResult(calculate(DEFAULTS));
  }, []);

  const set = (k: keyof Inputs) => (v: string) => setInputs((prev) => ({ ...prev, [k]: v }));
  const num = (v: string) => parseFloat(v) || 0;

  const hasErrors =
    num(inputs.spend) <= 0 ||
    num(inputs.impressions) <= 0 ||
    num(inputs.clicks) < 0 ||
    num(inputs.desiredImpressions) < 0;

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

  const handlePrint = () => window.print();

  const rows = [
    { label: "Total Spend", value: fmtMoney(num(inputs.spend), 0) },
    { label: "Impressions", value: fmt(num(inputs.impressions)) },
    { label: "CPM", value: fmtMoney(result.cpm), highlight: true },
    { label: "Cost per Impression", value: fmtMoney(result.costPerImpression, 4) },
    { label: "Impressions per Dollar", value: fmt(result.impressionsPerDollar) },
    { label: "Clicks", value: fmt(num(inputs.clicks)) },
    { label: "Click-Through Rate", value: result.ctrPct.toFixed(2) + "%" },
    { label: "Effective CPC", value: fmtMoney(result.cpcEquivalent, 2) },
    { label: `Budget for ${fmt(num(inputs.desiredImpressions))} Impressions`, value: fmtMoney(result.costForDesired, 0) },
  ];

  const summaryStats = [
    { label: "CPM", value: fmtMoney(result.cpm) },
    { label: "Cost / Impression", value: fmtMoney(result.costPerImpression, 4) },
    { label: "Impressions / $", value: fmt(result.impressionsPerDollar) },
    { label: "CTR", value: result.ctrPct.toFixed(2) + "%" },
    { label: "Effective CPC", value: fmtMoney(result.cpcEquivalent, 2) },
    { label: "Target Budget", value: fmtMoney(result.costForDesired, 0) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Cost Per Impression (CPM) Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Cost Per Impression (CPM) Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="cpm-spend" label="Total Spend" value={inputs.spend} onChange={set("spend")} prefix="$" />
              <NumInput id="cpm-impressions" label="Impressions" value={inputs.impressions} onChange={set("impressions")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="cpm-clicks" label="Clicks" value={inputs.clicks} onChange={set("clicks")} />
            </div>

            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1 focus:outline-none"
            >
              Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            </button>
            {showAdvanced && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1 animate-fade-in-up">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Budget Planning</div>
                  <NumInput id="cpm-desired" label="Desired Impressions" value={inputs.desiredImpressions} onChange={set("desiredImpressions")} />
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                Spend and impressions must be greater than zero; clicks and desired impressions must be non-negative.
              </p>
            )}

            <div className="flex gap-2.5 mt-1">
              <button type="button" onClick={handleCalculate} disabled={hasErrors} className={`flex-1 flex items-center justify-center gap-1.5 rounded-md font-bold h-10 text-base transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/90 text-primary-foreground active:scale-[0.98]"}`}>Calculate</button>
              <button type="button" onClick={handleReset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div ref={resultsRef} className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative">
              <div className="flex justify-end absolute top-3 right-3">
                <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none"><Printer className="h-3.5 w-3.5" /> Print</button>
              </div>
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">CPM</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.cpm)}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(num(inputs.spend), 0)} per {fmt(num(inputs.impressions))} impressions</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost / Impression</span>
                <span className="font-extrabold text-foreground">{fmtMoney(result.costPerImpression, 4)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Impressions / $</span>
                <span className="font-extrabold text-foreground">{fmt(result.impressionsPerDollar)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">CTR</span>
                <span className="font-extrabold text-foreground">{result.ctrPct.toFixed(2)}%</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Campaign Metrics</th>
                    <th className="py-2.5 pl-3 pr-4 text-right w-[160px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {rows.map((r) => (
                    <tr key={r.label} className={r.highlight ? "bg-amber-500/10" : ""}>
                      <td className={`py-2.5 pl-4 pr-3 text-base font-medium ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 pl-3 pr-4 text-right text-base font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-semibold mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {summaryStats.map((s) => (
                  <div key={s.label} className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">{s.label}</span>
                    <span className="text-sm font-extrabold text-foreground">{s.value}</span>
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
              <h2 className="text-2xl font-bold mb-3">What Is CPM?</h2>
              <p className="text-muted-foreground leading-relaxed">Cost per mille, abbreviated CPM, is the price an advertiser pays for one thousand ad impressions. The name comes from the Latin mille, meaning thousand. CPM is the standard pricing unit for brand advertising, display networks, programmatic buying, and most video pre-roll, where the goal is reach rather than immediate clicks. A $4.00 CPM means every thousand times an ad is shown costs $4.00. CPM is calculated by dividing total spend by impressions and multiplying by one thousand, and it lets advertisers compare the reach efficiency of completely different placements, formats, and networks on a single scale.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How to Use This Calculator</h2>
              <p className="text-muted-foreground leading-relaxed">Enter your total spend and the impressions delivered. The calculator returns CPM, the per-impression cost, and the impressions you receive per dollar. If you supply the number of clicks the campaign produced, it also derives the click-through rate and the effective CPC — the price you actually paid per click, which is often far higher than display benchmarks suggest. In the Advanced Options, enter the impression volume you want to buy to see the exact budget required at your current CPM. That forward projection is the practical use of CPM: planning media budgets before the campaign starts.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">CPM Benchmarks</h2>
              <p className="text-muted-foreground leading-relaxed">Display CPMs typically range from $2 to $10 for standard banners, while premium video placements can command $15–$30. Social platforms often quote CPMs between $5 and $15 depending on targeting and placement. Programmatic platforms frequently report effective CPMs in the single digits once inefficiencies are stripped out. Whatever the benchmark, judge CPM only against the value of the audience: a $20 CPM on a tightly targeted financial audience can be cheaper in practice than a $3 CPM on a broad consumer network, because the effective cost per engaged or converting user is what ultimately matters.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/cost-per-impression-cpm-calculator" />
        </div>
      </div>
    </>
  );
}