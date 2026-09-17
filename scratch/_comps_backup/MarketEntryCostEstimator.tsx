"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  legalCost: string;
  registrationCost: string;
  localOfficeCost: string;
  localHires: string;
  localSalary: string;
  marketResearch: string;
  localizationCost: string;
  distributionCost: string;
  launchBudget: string;
  workingCapital: string;
}

interface Result {
  hiringCost: number;
  totalCost: number;
  firstYearCost: number;
  costBreakdownPct: number;
  entryCostPerMonth: number;
}

const DEFAULTS: Inputs = {
  legalCost: "25000",
  registrationCost: "8000",
  localOfficeCost: "60000",
  localHires: "5",
  localSalary: "55000",
  marketResearch: "20000",
  localizationCost: "35000",
  distributionCost: "50000",
  launchBudget: "75000",
  workingCapital: "150000",
};

function calculate(inputs: Inputs): Result {
  const legalCost = Math.max(0, parseFloat(inputs.legalCost) || 0);
  const registrationCost = Math.max(0, parseFloat(inputs.registrationCost) || 0);
  const localOfficeCost = Math.max(0, parseFloat(inputs.localOfficeCost) || 0);
  const localHires = Math.max(0, parseFloat(inputs.localHires) || 0);
  const localSalary = Math.max(0, parseFloat(inputs.localSalary) || 0);
  const marketResearch = Math.max(0, parseFloat(inputs.marketResearch) || 0);
  const localizationCost = Math.max(0, parseFloat(inputs.localizationCost) || 0);
  const distributionCost = Math.max(0, parseFloat(inputs.distributionCost) || 0);
  const launchBudget = Math.max(0, parseFloat(inputs.launchBudget) || 0);
  const workingCapital = Math.max(0, parseFloat(inputs.workingCapital) || 0);

  const hiringCost = localHires * localSalary;
  const setupCost = legalCost + registrationCost + localOfficeCost + marketResearch + localizationCost + distributionCost + launchBudget;
  const totalCost = setupCost + hiringCost;
  const firstYearCost = totalCost + workingCapital;
  const costBreakdownPct = totalCost > 0 ? (setupCost / totalCost) * 100 : 0;
  const entryCostPerMonth = firstYearCost / 12;

  return { hiringCost, totalCost, firstYearCost, costBreakdownPct, entryCostPerMonth };
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

export default function MarketEntryCostEstimator() {
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
    num(inputs.legalCost) < 0 ||
    num(inputs.registrationCost) < 0 ||
    num(inputs.localOfficeCost) < 0 ||
    num(inputs.localHires) < 0 ||
    num(inputs.localSalary) < 0 ||
    num(inputs.marketResearch) < 0 ||
    num(inputs.localizationCost) < 0 ||
    num(inputs.distributionCost) < 0 ||
    num(inputs.launchBudget) < 0 ||
    num(inputs.workingCapital) < 0;

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
    { label: "Legal & Compliance Setup", value: fmtMoney(num(inputs.legalCost)) },
    { label: "Business Registration & Permits", value: fmtMoney(num(inputs.registrationCost)) },
    { label: "Local Office & Facilities", value: fmtMoney(num(inputs.localOfficeCost)) },
    { label: `Local Hiring (${fmt(num(inputs.localHires))} × ${fmtMoney(num(inputs.localSalary))})`, value: fmtMoney(result.hiringCost) },
    { label: "Market Research", value: fmtMoney(num(inputs.marketResearch)) },
    { label: "Localization", value: fmtMoney(num(inputs.localizationCost)) },
    { label: "Distribution & Logistics Setup", value: fmtMoney(num(inputs.distributionCost)) },
    { label: "Launch Marketing", value: fmtMoney(num(inputs.launchBudget)) },
    { label: "Total Entry Cost", value: fmtMoney(result.totalCost), total: true },
    { label: "First-Year Cost with Working Capital", value: fmtMoney(result.firstYearCost), highlight: true },
  ];

  const summaryStats = [
    { label: "Legal & Compliance", value: fmtMoney(num(inputs.legalCost)) },
    { label: "Registration & Permits", value: fmtMoney(num(inputs.registrationCost)) },
    { label: "Office & Facilities", value: fmtMoney(num(inputs.localOfficeCost)) },
    { label: "Local Hiring", value: fmtMoney(result.hiringCost) },
    { label: "Market Research", value: fmtMoney(num(inputs.marketResearch)) },
    { label: "Localization", value: fmtMoney(num(inputs.localizationCost)) },
    { label: "Distribution Setup", value: fmtMoney(num(inputs.distributionCost)) },
    { label: "Launch Marketing", value: fmtMoney(num(inputs.launchBudget)) },
    { label: "Total Entry Cost", value: fmtMoney(result.totalCost), bold: true },
    { label: "Working Capital", value: fmtMoney(num(inputs.workingCapital)) },
    { label: "First-Year Cost", value: fmtMoney(result.firstYearCost) },
    { label: "Monthly Entry Burn", value: fmtMoney(result.entryCostPerMonth) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Market Entry Cost Estimator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Market Entry Cost Estimator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="me-legal" label="Legal & Compliance Setup" value={inputs.legalCost} onChange={set("legalCost")} prefix="$" />
              <NumInput id="me-registration" label="Registration & Permits" value={inputs.registrationCost} onChange={set("registrationCost")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="me-office" label="Local Office & Facilities" value={inputs.localOfficeCost} onChange={set("localOfficeCost")} prefix="$" />
              <NumInput id="me-hires" label="Local Hires" value={inputs.localHires} onChange={set("localHires")} suffix="people" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Local Team & Research</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="me-salary" label="Avg Local Salary" value={inputs.localSalary} onChange={set("localSalary")} prefix="$" />
                    <NumInput id="me-research" label="Market Research" value={inputs.marketResearch} onChange={set("marketResearch")} prefix="$" />
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Operations & Launch</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="me-localization" label="Localization" value={inputs.localizationCost} onChange={set("localizationCost")} prefix="$" />
                    <NumInput id="me-distribution" label="Distribution & Logistics" value={inputs.distributionCost} onChange={set("distributionCost")} prefix="$" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="me-launch" label="Launch Marketing" value={inputs.launchBudget} onChange={set("launchBudget")} prefix="$" />
                    <NumInput id="me-working" label="Working Capital Reserve" value={inputs.workingCapital} onChange={set("workingCapital")} prefix="$" />
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Total Market Entry Cost</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.totalCost)}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.firstYearCost)} first-year cost with working capital — {fmtMoney(result.entryCostPerMonth)} monthly burn</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Setup Cost Share</span>
                <span className="font-extrabold text-amber-600">{fmt(result.costBreakdownPct, 1)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Local Hiring Cost</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.hiringCost)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">First-Year Cost</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.firstYearCost)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Entry Cost Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Market Entry Cost Estimator?</h2>
              <p className="text-muted-foreground leading-relaxed">A market entry cost estimator estimates the total investment required to enter a new geographic market, from legal setup to first-year operations. Entering a new country or region is a compounding stack of costs: legal and compliance setup for local entity formation, business registration and permits, office and facilities, hiring a local team, market research to understand the market, localization of the product and marketing, distribution and logistics setup, and the launch marketing that creates the first wave of customers. On top of the one-time entry costs sits working capital to fund the first year before revenue reaches breakeven. This calculator assembles every component, reports the total entry cost and the first-year cost including working capital, and converts the first-year figure into a monthly burn for runway planning.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The legal and registration lines are the entry costs that vary most by jurisdiction, since some markets require local entity formation, board composition rules, and permits that carry their own filing fees and annual renewal costs, so both the one-time setup and the recurring compliance burden should be quoted by local counsel before the estimate is finalized. The local office line covers facilities, which can be reduced substantially in the first year through serviced offices or remote-first structures, and the hiring line carries the payroll for the initial local team, which is the cost that recurs every year rather than ending at entry. The working capital reserve is the most important input for survival, because it funds operations before the market generates positive cash flow, and the monthly burn output converts the first-year total into the runway number that determines whether the entry can be sustained. Running the model in phases, such as a pilot with two hires and no office, shows the cheapest structure that still validates the market.</p>
              <p className="text-muted-foreground leading-relaxed">The four core inputs are the legal and compliance setup cost, the registration and permits cost, the local office and facilities cost, and the number of local hires. The hiring cost multiplies the hires by the average local salary, capturing the annual payroll for the initial team: with the default inputs, five hires at $55,000 each add $275,000 to the entry bill. The advanced options add the average local salary, the market research cost, the localization cost, the distribution and logistics setup cost, the launch marketing budget, and the working capital reserve. The total entry cost sums the setup costs and the hiring cost, and the first-year cost adds the working capital reserve, reflecting the cash needed before the market generates positive cash flow. The monthly burn divides the first-year cost by twelve, and the setup cost share shows what portion of the entry cost is one-time versus recurring team expense.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The first-year cost is the true funding requirement, because a market entry that exhausts its capital before revenue arrives fails regardless of its promise. The monthly burn is the number to compare against projected market revenue, and if the burn exceeds realistic early revenue, the entry needs a smaller initial team, a shared-office model, or a lighter launch. The working capital reserve is the safety margin, and cutting it to hit a budget number is how market entries die quietly. The setup cost share tells you whether the market is expensive to enter or expensive to operate: a high share favors a test-and-learn entry, while a high hiring share favors starting smaller. Re-run the estimator as quotes come in, since legal, office, and hiring costs are the ones that reliably exceed first estimates.</p>
            </div>
          </section>
          <PopularCalculators currentSlug="market-entry-cost-estimator" />
        </div>
      </div>
    </>
  );
}