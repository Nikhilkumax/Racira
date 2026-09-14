"use client";

import { useState, useEffect, useRef } from "react";
import { RotateCcw, Printer, ChevronDown, ChevronUp } from "lucide-react";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";

interface Inputs {
  contractors: string;
  billRate: string;
  hoursPerWeek: string;
  weeks: string;
  onboardingCost: string;
  mgmtHoursPerWeek: string;
  mgmtRate: string;
  turnoverRate: string;
  replacementCost: string;
  toolingCost: string;
}

interface Result {
  billingCost: number;
  onboardingCost: number;
  mgmtCost: number;
  replacementCost: number;
  toolingCost: number;
  totalCost: number;
  costPerContractor: number;
  blendedHourlyRate: number;
}

const DEFAULTS: Inputs = {
  contractors: "4",
  billRate: "95",
  hoursPerWeek: "40",
  weeks: "12",
  onboardingCost: "4500",
  mgmtHoursPerWeek: "6",
  mgmtRate: "110",
  turnoverRate: "15",
  replacementCost: "8000",
  toolingCost: "2500",
};

function calculate(inputs: Inputs): Result {
  const contractors = Math.max(0, parseFloat(inputs.contractors) || 0);
  const billRate = Math.max(0, parseFloat(inputs.billRate) || 0);
  const hoursPerWeek = Math.max(0, parseFloat(inputs.hoursPerWeek) || 0);
  const weeks = Math.max(0, parseFloat(inputs.weeks) || 0);
  const onboardingCost = Math.max(0, parseFloat(inputs.onboardingCost) || 0);
  const mgmtHoursPerWeek = Math.max(0, parseFloat(inputs.mgmtHoursPerWeek) || 0);
  const mgmtRate = Math.max(0, parseFloat(inputs.mgmtRate) || 0);
  const turnoverRate = Math.min(100, Math.max(0, parseFloat(inputs.turnoverRate) || 0));
  const replacementCost = Math.max(0, parseFloat(inputs.replacementCost) || 0);
  const toolingCost = Math.max(0, parseFloat(inputs.toolingCost) || 0);

  const billingCost = contractors * billRate * hoursPerWeek * weeks;
  const mgmtCost = mgmtHoursPerWeek * mgmtRate * weeks;
  const expectedTurnover = contractors * (turnoverRate / 100);
  const replacementCostTotal = expectedTurnover * replacementCost;
  const totalCost = billingCost + onboardingCost + mgmtCost + replacementCostTotal + toolingCost;
  const costPerContractor = contractors > 0 ? totalCost / contractors : 0;
  const totalHours = contractors * hoursPerWeek * weeks;
  const blendedHourlyRate = totalHours > 0 ? totalCost / totalHours : 0;

  return { billingCost, onboardingCost, mgmtCost, replacementCost: replacementCostTotal, toolingCost, totalCost, costPerContractor, blendedHourlyRate };
}

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtMoney = (n: number) => "$" + fmt(Math.round(n));
const fmt2 = (n: number) => "$" + fmt(n, 2);

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

const StaffAugmentationCostCalculator = () => {
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
    num(inputs.contractors) < 0 || num(inputs.billRate) < 0 ||
    num(inputs.hoursPerWeek) < 0 || num(inputs.weeks) < 0 ||
    num(inputs.onboardingCost) < 0 || num(inputs.mgmtHoursPerWeek) < 0 ||
    num(inputs.mgmtRate) < 0 || num(inputs.turnoverRate) < 0 || num(inputs.turnoverRate) > 100 ||
    num(inputs.replacementCost) < 0 || num(inputs.toolingCost) < 0;

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
    { label: "Contractors", value: fmt(num(inputs.contractors)) },
    { label: "Bill Rate", value: fmt2(num(inputs.billRate)) },
    { label: "Hours per Week", value: fmt(num(inputs.hoursPerWeek)) },
    { label: "Engagement Weeks", value: fmt(num(inputs.weeks)) },
    { label: "Billing Cost", value: fmtMoney(result.billingCost) },
    { label: "Onboarding Cost", value: fmtMoney(result.onboardingCost) },
    { label: "Management Cost", value: fmtMoney(result.mgmtCost) },
    { label: "Replacement Cost (Turnover)", value: fmtMoney(result.replacementCost) },
    { label: "Tooling Cost", value: fmtMoney(result.toolingCost) },
    { label: "Cost per Contractor", value: fmtMoney(result.costPerContractor) },
    { label: "Blended Hourly Rate", value: fmt2(result.blendedHourlyRate) },
  ];

  return (
    <div onKeyDown={handleKeyDown}>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
          <div className="grid grid-cols-2 gap-3">
            <NumInput id="contractors" label="Contractors" value={inputs.contractors} onChange={set("contractors")} />
            <NumInput id="bill-rate" label="Bill Rate" value={inputs.billRate} onChange={set("billRate")} prefix="$" suffix="/hr" />
            <NumInput id="hours-per-week" label="Hours per Week" value={inputs.hoursPerWeek} onChange={set("hoursPerWeek")} />
            <NumInput id="weeks" label="Weeks" value={inputs.weeks} onChange={set("weeks")} />
          </div>

          <button type="button" onClick={() => setShowAdv((v) => !v)} className="flex items-center gap-1.5 text-sm text-primary font-medium self-start">
            Advanced Options {showAdv ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showAdv && (
            <div className="flex flex-col gap-3 p-3 rounded-lg border border-border bg-secondary/20 mt-1">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Onboarding &amp; Tooling</div>
                <div className="grid grid-cols-2 gap-3">
                  <NumInput id="onboarding" label="Onboarding Cost" value={inputs.onboardingCost} onChange={set("onboardingCost")} prefix="$" />
                  <NumInput id="tooling" label="Tooling Cost" value={inputs.toolingCost} onChange={set("toolingCost")} prefix="$" />
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Management &amp; Turnover</div>
                <div className="grid grid-cols-2 gap-3">
                  <NumInput id="mgmt-hours" label="Mgmt Hours / Week" value={inputs.mgmtHoursPerWeek} onChange={set("mgmtHoursPerWeek")} />
                  <NumInput id="mgmt-rate" label="Mgmt Rate" value={inputs.mgmtRate} onChange={set("mgmtRate")} prefix="$" />
                  <NumInput id="turnover" label="Turnover Rate" value={inputs.turnoverRate} onChange={set("turnoverRate")} suffix="%" />
                  <NumInput id="replacement" label="Replacement Cost" value={inputs.replacementCost} onChange={set("replacementCost")} prefix="$" />
                </div>
              </div>
            </div>
          )}

          {hasErrors && (
            <p className="text-sm text-red-600">Enter valid values — turnover must be 0–100%.</p>
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
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Total Augmentation Cost</div>
            <div className="text-4xl font-bold text-primary">{fmtMoney(result.totalCost)}</div>
            <div className="text-sm text-muted-foreground mt-1">{fmt(num(inputs.contractors))} contractors · {fmt(num(inputs.weeks))} weeks</div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-border border border-border rounded-lg bg-card shadow-sm overflow-hidden">
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Cost per Contractor</div>
              <div className="text-lg font-bold mt-1">{fmtMoney(result.costPerContractor)}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Blended Hourly Rate</div>
              <div className="text-lg font-bold text-emerald-600 mt-1">{fmt2(result.blendedHourlyRate)}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Billing Cost</div>
              <div className="text-lg font-bold mt-1">{fmtMoney(result.billingCost)}</div>
            </div>
          </div>

          <div className="card-calculator !p-4 shadow-sm border border-border bg-card">
            <h3 className="text-base font-semibold mb-3">Augmentation Cost Breakdown</h3>
            <table className="w-full text-base">
              <tbody>
                {breakdown.map((r) => (
                  <tr key={r.label} className="border-b last:border-0">
                    <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                    <td className="py-2.5 px-3 text-right font-medium">{r.value}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-border">
                  <td className="py-2.5 px-3 font-semibold">Total Augmentation Cost</td>
                  <td className="py-2.5 px-3 text-right font-bold text-primary">{fmtMoney(result.totalCost)}</td>
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
                <div className="text-xs text-muted-foreground">Total Augmentation Cost</div>
                <div className="text-base font-bold text-primary">{fmtMoney(result.totalCost)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1180px] mt-8">
        <AdPlaceholder className="mb-10" />
        <section className="mt-12 space-y-8 text-base text-foreground">
          <div>
            <h2 className="text-2xl font-bold mb-3">What Is Staff Augmentation Cost?</h2>
            <p className="text-muted-foreground leading-relaxed">Staff augmentation cost is the full cost of bringing external contractors into a team to fill skill gaps or absorb workload, and it is almost always more than the invoice from the staffing firm. The visible cost is the billing — contractors times bill rate times hours per week times the engagement length. Around that core sits a ring of hidden costs: onboarding to get each contractor productive, management time spent directing and reviewing their work, tooling and access licenses, and the cost of replacing contractors who turn over before the engagement ends. When a finance team approves an augmentation request based on the billing line alone, it routinely understates the true spend by 10 to 20 percent, which is why the total-cost view matters for budgeting and for honest make-versus-buy decisions. Augmentation is also structurally different from hiring: contractors arrive quickly and leave when the work ends, which makes the model ideal for volatile workloads, but that flexibility carries a premium that only a full cost picture can quantify fairly against the alternatives.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">How the Augmentation Cost Is Calculated</h2>
            <p className="text-muted-foreground leading-relaxed">The calculator builds the total from five components. Billing cost is contractors times bill rate times hours per week times weeks — the direct invoice cost. Onboarding cost is the one-time expense of getting each new contractor set up, including background checks, training, and ramp-up time. Management cost multiplies the hours per week that internal managers spend overseeing the augmented team by the management rate across the engagement, capturing the hidden supervisory burden. Replacement cost applies the turnover rate to the contractor count and multiplies by the average cost of replacing one contractor, including re-recruitment and re-onboarding. Tooling cost covers licenses, equipment, and access that the contractors require. The total divided by the contractor count gives the cost per contractor, and the total divided by the billed hours gives the blended hourly rate — the single number that reveals how much the engagement truly costs per hour of delivered work.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p className="text-muted-foreground leading-relaxed">Compare the blended hourly rate against the contractor bill rate: the gap is the true premium of augmentation over the sticker price, and it should be weighed against the cost of hiring internally or building the capability in-house. If management cost is a large share of the total, the augmentation is consuming more internal leadership attention than the plan assumed — a common sign that the scope was under-specified. A turnover rate above 20 percent should trigger a review of the engagement terms, since replacement cost compounds quickly and each handoff also costs productivity while the new contractor ramps. Use the cost-per-contractor figure when comparing staffing vendors, and the blended rate when building the business case for the next engagement. It is also worth running the model twice — once with the current engagement terms and once with a longer duration — because onboarding and replacement costs amortize differently: extending a stable team by a few weeks is usually far cheaper per hour than the same weeks bought through a new procurement cycle. The model surfaces exactly that difference, which is the strongest argument for retention-oriented contracting.</p>
          </div>
        </section>
        <PopularCalculators exclude="/calculator/staff-augmentation-cost-calculator" />
      </div>
    </div>
  );
};

export default StaffAugmentationCostCalculator;