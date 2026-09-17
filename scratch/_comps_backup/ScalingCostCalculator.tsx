"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  currentUsers: string;
  targetUsers: string;
  currentCost: string;
  scaleFactor: string;
  infraGrowth: string;
  supportCost: string;
  marketingCost: string;
}

interface Result {
  growthPct: number;
  newCost: number;
  incrementalCost: number;
  costPerNewUser: number;
  infraCost: number;
  supportTotal: number;
}

const DEFAULTS: Inputs = {
  currentUsers: "10000",
  targetUsers: "50000",
  currentCost: "25000",
  scaleFactor: "1.4",
  infraGrowth: "15",
  supportCost: "18000",
  marketingCost: "120000",
};

function calculate(inputs: Inputs): Result {
  const currentUsers = Math.max(1, parseFloat(inputs.currentUsers) || 1);
  const targetUsers = Math.max(0, parseFloat(inputs.targetUsers) || 0);
  const currentCost = Math.max(0, parseFloat(inputs.currentCost) || 0);
  const scaleFactor = Math.max(0, parseFloat(inputs.scaleFactor) || 0);
  const infraGrowth = Math.min(200, Math.max(0, parseFloat(inputs.infraGrowth) || 0));
  const supportCost = Math.max(0, parseFloat(inputs.supportCost) || 0);
  const marketingCost = Math.max(0, parseFloat(inputs.marketingCost) || 0);

  const growthPct = (targetUsers - currentUsers) / currentUsers;
  const newCost = currentCost * (1 + growthPct * scaleFactor);
  const incrementalCost = newCost - currentCost;
  const infraCost = currentCost * (infraGrowth / 100);
  const supportTotal = supportCost * (1 + growthPct * scaleFactor);
  const costPerNewUser = targetUsers > currentUsers ? incrementalCost / (targetUsers - currentUsers) : 0;

  return { growthPct, newCost, incrementalCost, costPerNewUser, infraCost, supportTotal };
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

export default function ScalingCostCalculator() {
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
    num(inputs.currentUsers) <= 0 ||
    num(inputs.targetUsers) < 0 ||
    num(inputs.currentCost) < 0 ||
    num(inputs.scaleFactor) < 0 ||
    num(inputs.infraGrowth) < 0 || num(inputs.infraGrowth) > 200 ||
    num(inputs.supportCost) < 0 ||
    num(inputs.marketingCost) < 0;

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
    { label: "Current Users", value: fmt(num(inputs.currentUsers)) },
    { label: "Target Users", value: fmt(num(inputs.targetUsers)) },
    { label: `User Growth (${fmt(result.growthPct * 100, 1)}%)`, value: fmt(num(inputs.targetUsers) - num(inputs.currentUsers)) + " users" },
    { label: `Current Monthly Operating Cost`, value: fmtMoney(num(inputs.currentCost)) },
    { label: `Projected Cost at Scale (${fmt(num(inputs.scaleFactor), 1)}× elasticity)`, value: fmtMoney(result.newCost) },
    { label: `Infrastructure Upgrades (${fmt(num(inputs.infraGrowth), 1)}%)`, value: fmtMoney(result.infraCost) },
    { label: `Support at Scale (${fmtMoney(num(inputs.supportCost))}/mo)`, value: fmtMoney(result.supportTotal) },
    { label: "Marketing & Acquisition", value: fmtMoney(num(inputs.marketingCost)) },
    { label: "Total Incremental Cost", value: fmtMoney(result.incrementalCost + result.infraCost + (result.supportTotal - num(inputs.supportCost)) + num(inputs.marketingCost)), total: true },
    { label: "Cost per New User", value: fmtMoney(result.costPerNewUser), highlight: true },
  ];

  const summaryStats = [
    { label: "Current Users", value: fmt(num(inputs.currentUsers)) },
    { label: "Target Users", value: fmt(num(inputs.targetUsers)) },
    { label: "User Growth", value: fmt(result.growthPct * 100, 1) + "%" },
    { label: "Current Monthly Cost", value: fmtMoney(num(inputs.currentCost)) },
    { label: "Projected Monthly Cost", value: fmtMoney(result.newCost) },
    { label: "Incremental Monthly Cost", value: fmtMoney(result.incrementalCost) },
    { label: "Elasticity Factor", value: fmt(num(inputs.scaleFactor), 1) + "×" },
    { label: "Infrastructure Upgrades", value: fmtMoney(result.infraCost) },
    { label: "Support at Scale", value: fmtMoney(result.supportTotal) },
    { label: "Marketing & Acquisition", value: fmtMoney(num(inputs.marketingCost)) },
    { label: "Cost per New User", value: fmtMoney(result.costPerNewUser), bold: true },
    { label: "Total Incremental Cost", value: fmtMoney(result.incrementalCost + result.infraCost + (result.supportTotal - num(inputs.supportCost)) + num(inputs.marketingCost)) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Scaling Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Scaling Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="sc-current" label="Current Users" value={inputs.currentUsers} onChange={set("currentUsers")} suffix="users" />
              <NumInput id="sc-target" label="Target Users" value={inputs.targetUsers} onChange={set("targetUsers")} suffix="users" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="sc-cost" label="Current Monthly Operating Cost" value={inputs.currentCost} onChange={set("currentCost")} prefix="$" suffix="/mo" />
              <NumInput id="sc-factor" label="Cost Elasticity Factor" value={inputs.scaleFactor} onChange={set("scaleFactor")} suffix="× growth" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Scale-Up Investments</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="sc-infra" label="Infrastructure Upgrade" value={inputs.infraGrowth} onChange={set("infraGrowth")} suffix="%" />
                    <NumInput id="sc-support" label="Current Support Cost" value={inputs.supportCost} onChange={set("supportCost")} prefix="$" suffix="/mo" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="sc-marketing" label="Marketing & Acquisition" value={inputs.marketingCost} onChange={set("marketingCost")} prefix="$" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                Current users must be greater than zero; all amounts non-negative; infrastructure growth between 0 and 200.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Projected Monthly Operating Cost</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.newCost)}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.incrementalCost)}/mo incremental — {fmtMoney(result.costPerNewUser)} per new user</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">User Growth</span>
                <span className="font-extrabold text-green-600">{fmt(result.growthPct * 100, 1)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Incremental Cost</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.incrementalCost)}/mo</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost / New User</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.costPerNewUser)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Scaling Cost Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Scaling Cost Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A scaling cost calculator estimates what it costs to grow a product or business from its current user base to a target size. The naive assumption is that costs scale linearly with users, but real scaling is different: infrastructure can often absorb some growth cheaply, support and operations costs rise with users, and one-time investments such as architecture upgrades, security hardening, and marketing campaigns are required at specific thresholds. This calculator models the operating cost at the target user count using a cost elasticity factor, adds the infrastructure upgrade and the support cost at scale, and includes the marketing and acquisition spend needed to win the new users, producing a projected monthly operating cost, the incremental cost of scaling, and the cost per new user that belongs in unit economics.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The cost elasticity factor is the model's core assumption, and it captures how operating costs respond to user growth: a factor of one means costs scale linearly with users, a factor below one means the business enjoys economies of scale through shared infrastructure, and a factor above one flags cost pools that grow faster than users, such as support headcount, compliance, and per-user processing fees. The infrastructure upgrade percentage is entered as a one-time investment because scaling frequently requires architecture changes, database sharding, security hardening, and load-balancing upgrades that are lump-sum rather than per-user. The support cost scales with the same elasticity as operations, which reflects the reality that support tickets grow with the user base even when infrastructure costs do not. The cost per new user output is the unit-economics number to compare against the revenue per user, and it tells you whether each additional user is profitable at the margin or whether scaling is technically possible but commercially dilutive.</p>
              <p className="text-muted-foreground leading-relaxed">The four core inputs are the current user count, the target user count, the current monthly operating cost, and the cost elasticity factor. The user growth percentage divides the difference between target and current users by the current count, and the projected operating cost applies the growth to the current cost multiplied by the elasticity factor: with the default inputs, growing from 10,000 to 50,000 users is a 400% increase, and at a 1.4 elasticity factor the $25,000 monthly cost grows to $165,000. The advanced options add the infrastructure upgrade percentage, applied to the current cost as a one-time investment; the current support cost, which scales with the same elasticity as operations; and the marketing and acquisition budget. The incremental cost subtracts the current cost from the projected cost, the cost per new user divides the incremental cost by the new user count, and the total incremental cost sums the operating increase, the infrastructure upgrade, the support increase, and the marketing spend.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The projected monthly operating cost is the planning number for cash-flow projections, and the cost per new user is the unit-economics figure to compare against the lifetime value each user generates. An elasticity factor below one means the business enjoys economies of scale, while a factor above one flags costs that grow faster than users, typically support and compliance burdens. The infrastructure upgrade is the number to negotiate hardest, since it is a lump-sum cost that architecture choices can delay or avoid. Re-run the calculator across target sizes to find the threshold where marginal costs spike, and remember that scaling costs are a portfolio: deferring infrastructure or support investment does not save money, it simply moves the cost into reliability incidents and churn later.</p>
            </div>
          </section>
          <PopularCalculators currentSlug="scaling-cost-calculator" />
        </div>
      </div>
    </>
  );
}