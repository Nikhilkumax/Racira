"use client";

import { useState, useEffect, useRef } from "react";
import { RotateCcw, Printer, ChevronDown, ChevronUp } from "lucide-react";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";

interface Inputs {
  annualRevenue: string;
  preventionCost: string;
  appraisalCost: string;
  internalFailure: string;
  externalFailure: string;
}

interface Result {
  preventionCost: number;
  appraisalCost: number;
  internalFailure: number;
  externalFailure: number;
  totalCoQ: number;
  totalCoQAsPct: number;
  failureCost: number;
  failureShare: number;
}

const DEFAULTS: Inputs = {
  annualRevenue: "5000000",
  preventionCost: "45000",
  appraisalCost: "60000",
  internalFailure: "90000",
  externalFailure: "160000",
};

function calculate(inputs: Inputs): Result {
  const annualRevenue = Math.max(0, parseFloat(inputs.annualRevenue) || 0);
  const preventionCost = Math.max(0, parseFloat(inputs.preventionCost) || 0);
  const appraisalCost = Math.max(0, parseFloat(inputs.appraisalCost) || 0);
  const internalFailure = Math.max(0, parseFloat(inputs.internalFailure) || 0);
  const externalFailure = Math.max(0, parseFloat(inputs.externalFailure) || 0);

  const totalCoQ = preventionCost + appraisalCost + internalFailure + externalFailure;
  const totalCoQAsPct = annualRevenue > 0 ? (totalCoQ / annualRevenue) * 100 : 0;
  const failureCost = internalFailure + externalFailure;
  const failureShare = totalCoQ > 0 ? (failureCost / totalCoQ) * 100 : 0;

  return { preventionCost, appraisalCost, internalFailure, externalFailure, totalCoQ, totalCoQAsPct, failureCost, failureShare };
}

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtMoney = (n: number) => "$" + fmt(Math.round(n));

const NumInput = ({ id, label, value, onChange, prefix }: {
  id: string; label: string; value: string; onChange: (v: string) => void; prefix?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input id={id} type="number" step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
    </div>
  </div>
);

const QualityCostCalculatorCopq = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(calculate(DEFAULTS));
  const [showAdv, setShowAdv] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResult(calculate(DEFAULTS));
  }, []);

  const set = (k: keyof Inputs) => (v: string) => setInputs((prev) => ({ ...prev, [k]: v }));
  const num = (v: string) => parseFloat(v) || 0;

  const hasErrors =
    num(inputs.annualRevenue) < 0 || num(inputs.preventionCost) < 0 ||
    num(inputs.appraisalCost) < 0 || num(inputs.internalFailure) < 0 ||
    num(inputs.externalFailure) < 0;

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

  const breakdown = [
    { label: "Annual Revenue", value: fmtMoney(num(inputs.annualRevenue)) },
    { label: "Prevention Costs", value: fmtMoney(result.preventionCost) },
    { label: "Appraisal Costs", value: fmtMoney(result.appraisalCost) },
    { label: "Internal Failure Costs", value: fmtMoney(result.internalFailure) },
    { label: "External Failure Costs", value: fmtMoney(result.externalFailure) },
    { label: "Total Failure Costs", value: fmtMoney(result.failureCost) },
    { label: "Cost of Quality as % of Revenue", value: `${fmt(result.totalCoQAsPct, 1)}%` },
    { label: "Failure Share of CoQ", value: `${fmt(result.failureShare, 1)}%` },
  ];

  return (
    <div className="racira-page-container py-4" onKeyDown={handleKeyDown}>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
          <div className="grid grid-cols-2 gap-3">
            <NumInput id="annual-revenue" label="Annual Revenue" value={inputs.annualRevenue} onChange={set("annualRevenue")} prefix="$" />
            <NumInput id="prevention" label="Prevention Cost" value={inputs.preventionCost} onChange={set("preventionCost")} prefix="$" />
            <NumInput id="appraisal" label="Appraisal Cost" value={inputs.appraisalCost} onChange={set("appraisalCost")} prefix="$" />
            <NumInput id="internal-failure" label="Internal Failure Cost" value={inputs.internalFailure} onChange={set("internalFailure")} prefix="$" />
          </div>

          <button type="button" onClick={() => setShowAdv((v) => !v)} className="flex items-center gap-1.5 text-sm text-primary font-medium self-start">
            Advanced Options {showAdv ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showAdv && (
            <div className="flex flex-col gap-3 p-3 rounded-lg border border-border bg-secondary/20 mt-1">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">External Failure</div>
                <div className="grid grid-cols-2 gap-3">
                  <NumInput id="external-failure" label="External Failure Cost" value={inputs.externalFailure} onChange={set("externalFailure")} prefix="$" />
                </div>
              </div>
            </div>
          )}

          {hasErrors && (
            <p className="text-sm text-red-600">Enter non-negative values for all fields.</p>
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
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Total Cost of Quality</div>
            <div className="text-4xl font-bold text-primary">{fmtMoney(result.totalCoQ)}</div>
            <div className="text-sm text-muted-foreground mt-1">{fmt(result.totalCoQAsPct, 1)}% of annual revenue</div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-border border border-border rounded-lg bg-card shadow-sm overflow-hidden">
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">CoQ % of Revenue</div>
              <div className="text-lg font-bold mt-1">{fmt(result.totalCoQAsPct, 1)}%</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Failure Costs</div>
              <div className="text-lg font-bold text-red-600 mt-1">{fmtMoney(result.failureCost)}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Failure Share</div>
              <div className="text-lg font-bold text-amber-600 mt-1">{fmt(result.failureShare, 1)}%</div>
            </div>
          </div>

          <div className="card-calculator !p-4 shadow-sm border border-border bg-card">
            <h3 className="text-base font-semibold mb-3">Cost of Quality Breakdown</h3>
            <table className="w-full text-base">
              <tbody>
                {breakdown.map((r) => (
                  <tr key={r.label} className="border-b last:border-0">
                    <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                    <td className="py-2.5 px-3 text-right font-medium">{r.value}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-border">
                  <td className="py-2.5 px-3 font-semibold">Total Cost of Quality</td>
                  <td className="py-2.5 px-3 text-right font-bold text-primary">{fmtMoney(result.totalCoQ)}</td>
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
                <div className="text-xs text-muted-foreground">Total Cost of Quality</div>
                <div className="text-base font-bold text-primary">{fmtMoney(result.totalCoQ)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1180px] mt-8">
        <AdPlaceholder className="mb-10" />
        <section className="mt-12 space-y-8 text-base text-foreground">
          <div>
            <h2 className="text-2xl font-bold mb-3">What Is the Cost of Quality?</h2>
            <p className="text-muted-foreground leading-relaxed">The cost of quality is the total money a business spends on quality-related activities, divided into four classic categories. Prevention costs are spent before production to stop defects from happening — training, process design, supplier qualification, and quality planning. Appraisal costs are spent during production to catch defects — inspection, testing, and auditing. Internal failure costs arise when defects are caught before they ship — scrap, rework, and retesting. External failure costs arise when defects reach the customer — returns, warranty claims, recalls, and the hardest to quantify, lost future business. Quality thought leaders such as Juran and Crosby observed that the cost of quality typically runs between 15 and 25 percent of revenue, and that the vast majority of it is failure cost — money spent fixing problems that prevention could have avoided far more cheaply.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">How the Cost of Quality Is Calculated</h2>
            <p className="text-muted-foreground leading-relaxed">The calculator sums the four cost categories to produce the total cost of quality, then expresses it as a percentage of annual revenue so the burden can be compared across years and against the 15–25 percent industry benchmark. It also isolates the total failure cost — internal plus external — and reports the failure share, the percentage of the entire quality bill that is spent on defects rather than on preventing them. In a healthy quality program, failure share falls over time as prevention and appraisal investments pay off, even if the absolute CoQ percentage stays flat. The external failure input sits in the advanced tier because many organizations track scrap and rework reliably but estimate field failures from warranty data; when only warranty spend is available, that figure is a reasonable floor for the true external cost, which always includes the unquantified reputational damage.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p className="text-muted-foreground leading-relaxed">Start with the CoQ percentage against revenue — above 20 percent signals a quality program that is mostly paying for failure, while below 10 percent is unusually strong for most industries. Then read the failure share: if failures consume more than half of the quality budget, the fastest path to savings is usually shifting spend toward prevention, because every dollar invested in process and training typically saves several dollars of failure cost. Watch the internal-versus-external split closely — external failure costs five to ten times as much as the same defect caught internally, so a rising external share is a leading indicator of reputation damage that the financial figures understate. Track the trend quarterly: the goal is a falling CoQ percentage with a stable or rising prevention share, the signature of a quality program that is getting cheaper while getting better. When presenting the numbers to leadership, lead with the CoQ percentage against revenue and the failure share — those two figures translate a sprawling quality program into a one-line story about how much money is being spent on defects. Pair the calculation with a simple action register: for every major failure category, list the root cause, the prevention investment proposed, and the failure spend it would retire, so the case for quality funding rests on arithmetic rather than opinion.</p>
          </div>
        </section>
        <PopularCalculators exclude="/calculator/quality-cost-calculator-copq" />
      </div>
    </div>
  );
};

export default QualityCostCalculatorCopq;