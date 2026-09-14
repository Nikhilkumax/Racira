"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  devTeamSize: string;
  devRate: string;
  pivotMonths: string;
  productRework: string;
  teamRetraining: string;
  marketingCost: string;
  lostRevenue: string;
  severanceCost: string;
}

interface Result {
  devCost: number;
  totalCost: number;
  monthlyBurn: number;
  opportunityCost: number;
  costAsPctRevenue: number;
}

const DEFAULTS: Inputs = {
  devTeamSize: "6",
  devRate: "9500",
  pivotMonths: "4",
  productRework: "120000",
  teamRetraining: "35000",
  marketingCost: "50000",
  lostRevenue: "180000",
  severanceCost: "25000",
};

function calculate(inputs: Inputs): Result {
  const devTeamSize = Math.max(0, parseFloat(inputs.devTeamSize) || 0);
  const devRate = Math.max(0, parseFloat(inputs.devRate) || 0);
  const pivotMonths = Math.max(0, parseFloat(inputs.pivotMonths) || 0);
  const productRework = Math.max(0, parseFloat(inputs.productRework) || 0);
  const teamRetraining = Math.max(0, parseFloat(inputs.teamRetraining) || 0);
  const marketingCost = Math.max(0, parseFloat(inputs.marketingCost) || 0);
  const lostRevenue = Math.max(0, parseFloat(inputs.lostRevenue) || 0);
  const severanceCost = Math.max(0, parseFloat(inputs.severanceCost) || 0);

  const devCost = devTeamSize * devRate * pivotMonths;
  const totalCost = devCost + productRework + teamRetraining + marketingCost + lostRevenue + severanceCost;
  const monthlyBurn = totalCost / Math.max(1, pivotMonths);
  const opportunityCost = devCost * 0.3;
  const costAsPctRevenue = totalCost > 0 ? (lostRevenue / totalCost) * 100 : 0;

  return { devCost, totalCost, monthlyBurn, opportunityCost, costAsPctRevenue };
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
const fmtMoney = (n: number) => "$" + fmt(Math.round(n));

export default function PivotCostEstimator() {
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
    num(inputs.devTeamSize) < 0 ||
    num(inputs.devRate) < 0 ||
    num(inputs.pivotMonths) < 0 ||
    num(inputs.productRework) < 0 ||
    num(inputs.teamRetraining) < 0 ||
    num(inputs.marketingCost) < 0 ||
    num(inputs.lostRevenue) < 0 ||
    num(inputs.severanceCost) < 0;

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
    { label: `Development Team (${fmt(num(inputs.devTeamSize))} × ${fmtMoney(num(inputs.devRate))}/mo × ${fmt(num(inputs.pivotMonths))} mo)`, value: fmtMoney(result.devCost) },
    { label: "Product Rework & Rewrite", value: fmtMoney(num(inputs.productRework)) },
    { label: "Team Retraining", value: fmtMoney(num(inputs.teamRetraining)) },
    { label: "Marketing & Rebranding", value: fmtMoney(num(inputs.marketingCost)) },
    { label: "Lost Revenue During Transition", value: fmtMoney(num(inputs.lostRevenue)) },
    { label: "Severance & Offboarding", value: fmtMoney(num(inputs.severanceCost)) },
    { label: "Total Pivot Cost", value: fmtMoney(result.totalCost), total: true },
    { label: "Monthly Burn During Pivot", value: fmtMoney(result.monthlyBurn), highlight: true },
  ];

  const summaryStats = [
    { label: "Dev Team Size", value: fmt(num(inputs.devTeamSize)) },
    { label: "Dev Rate / Month", value: fmtMoney(num(inputs.devRate)) },
    { label: "Pivot Duration", value: fmt(num(inputs.pivotMonths)) + " months" },
    { label: "Development Cost", value: fmtMoney(result.devCost) },
    { label: "Product Rework", value: fmtMoney(num(inputs.productRework)) },
    { label: "Team Retraining", value: fmtMoney(num(inputs.teamRetraining)) },
    { label: "Marketing & Rebranding", value: fmtMoney(num(inputs.marketingCost)) },
    { label: "Lost Revenue", value: fmtMoney(num(inputs.lostRevenue)) },
    { label: "Severance & Offboarding", value: fmtMoney(num(inputs.severanceCost)) },
    { label: "Total Pivot Cost", value: fmtMoney(result.totalCost), bold: true },
    { label: "Monthly Burn", value: fmtMoney(result.monthlyBurn) },
    { label: "Lost Revenue Share", value: fmt(result.costAsPctRevenue, 1) + "% of total" },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Pivot Cost Estimator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Pivot Cost Estimator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="pc-dev-size" label="Development Team Size" value={inputs.devTeamSize} onChange={set("devTeamSize")} suffix="people" />
              <NumInput id="pc-dev-rate" label="Cost per Dev / Month" value={inputs.devRate} onChange={set("devRate")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="pc-months" label="Pivot Duration" value={inputs.pivotMonths} onChange={set("pivotMonths")} suffix="months" />
              <NumInput id="pc-rework" label="Product Rework & Rewrite" value={inputs.productRework} onChange={set("productRework")} prefix="$" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Transition Costs</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="pc-retraining" label="Team Retraining" value={inputs.teamRetraining} onChange={set("teamRetraining")} prefix="$" />
                    <NumInput id="pc-marketing" label="Marketing & Rebranding" value={inputs.marketingCost} onChange={set("marketingCost")} prefix="$" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="pc-lost" label="Lost Revenue During Transition" value={inputs.lostRevenue} onChange={set("lostRevenue")} prefix="$" />
                    <NumInput id="pc-severance" label="Severance & Offboarding" value={inputs.severanceCost} onChange={set("severanceCost")} prefix="$" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Total Pivot Cost</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.totalCost)}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.monthlyBurn)} monthly burn over {fmt(num(inputs.pivotMonths))} months</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Development Cost</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.devCost)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Lost Revenue</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(num(inputs.lostRevenue))}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Monthly Burn</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.monthlyBurn)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Pivot Cost Breakdown</th>
                    <th className="py-2.5 pl-3 pr-4 text-right w-[180px]">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {rows.map((r) => (
                    <tr key={r.label} className={`${r.total ? "border-t-2 font-bold bg-secondary/30" : ""} ${r.highlight ? "bg-amber-500/10" : ""}`}>
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
                    <span className={`text-sm font-extrabold ${s.bold ? "text-primary" : "text-foreground"}`}>{s.value}</span>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Pivot Cost Estimator?</h2>
              <p className="text-muted-foreground leading-relaxed">A pivot cost estimator estimates the total expense of changing a company's product direction, target market, or business model. Pivots are the highest-stakes strategic moves a startup or established company makes, and their true cost is almost always underestimated because the visible engineering work is only part of the bill. A complete estimate includes the development team's time during the pivot, the rework or rewrite of the product, retraining the team on the new direction, marketing and rebranding for the new positioning, the revenue lost while the transition happens, and severance for roles that no longer fit. This calculator assembles all six components and reports the total pivot cost and the monthly burn rate, giving founders and executives the figure they need to decide whether the pivot is affordable and how much runway it consumes.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The development cost assumes the full team works at full cost for the entire pivot duration, which is the realistic case during a pivot since the team is rebuilding rather than shipping, and it is deliberately separate from the rework line, which captures the one-time cost of redoing completed work such as re-platforming, data migration, or scrapped modules. The lost revenue line is the opportunity cost of the transition, and it should reflect the revenue the current product would have generated during the pivot months rather than the new product's projected revenue, which has not started yet. The monthly burn figure is the runway-critical output, since a pivot that takes longer than the cash runway lasts fails regardless of how promising the destination is. The estimator is designed for scenario comparison: run it with a smaller team and a shorter timeline to see the cheapest viable pivot path before committing.</p>
              <p className="text-muted-foreground leading-relaxed">The four core inputs are the development team size, the monthly cost per developer, the pivot duration in months, and the product rework and rewrite cost. The development cost multiplies the team size by the monthly rate and the duration: with the default inputs, a six-person team at $9,500 a month for four months carries $228,000 of development cost. The advanced options add the team retraining cost, the marketing and rebranding cost, the revenue lost during the transition, and the severance and offboarding cost. With the default settings, the total pivot cost is about $638,000, of which development is the largest single line at roughly 36%. The monthly burn divides the total by the pivot duration, showing the cash consumed each month, which is the number to compare against runway, and the lost revenue share shows what fraction of the total is the opportunity cost of the transition itself.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The total pivot cost is the budget number, but the monthly burn is the one that matters for survival, because a pivot that outlasts the runway is a failure regardless of its destination. If the development cost dominates, consider scoping the pivot to reuse more of the existing product; if lost revenue dominates, plan the transition to overlap the old and new offerings where possible. The estimate assumes the pivot runs at full team cost for the stated duration, so compress the timeline wherever the new direction can be validated before full build-out. Re-run the estimator with different team sizes and durations to find the fastest affordable path, and remember that the cost of not pivoting, which this tool does not measure, can be larger still.</p>
            </div>
          </section>
          <PopularCalculators currentSlug="pivot-cost-estimator" />
        </div>
      </div>
    </>
  );
}