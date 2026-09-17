"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  customers: string;
  monthlyRevenue: string;
  churnRate: string;
  switchingCost: string;
  migrationCost: string;
  learningCost: string;
  loyaltyPct: string;
}

interface Result {
  atRiskRevenue: number;
  preventedChurn: number;
  switchingValue: number;
  retentionValue: number;
  totalValue: number;
  valuePerCustomer: number;
}

const DEFAULTS: Inputs = {
  customers: "5000",
  monthlyRevenue: "49",
  churnRate: "3",
  switchingCost: "350",
  migrationCost: "250",
  learningCost: "150",
  loyaltyPct: "40",
};

function calculate(inputs: Inputs): Result {
  const customers = Math.max(0, parseFloat(inputs.customers) || 0);
  const monthlyRevenue = Math.max(0, parseFloat(inputs.monthlyRevenue) || 0);
  const churnRate = Math.min(100, Math.max(0, parseFloat(inputs.churnRate) || 0));
  const switchingCost = Math.max(0, parseFloat(inputs.switchingCost) || 0);
  const migrationCost = Math.max(0, parseFloat(inputs.migrationCost) || 0);
  const learningCost = Math.max(0, parseFloat(inputs.learningCost) || 0);
  const loyaltyPct = Math.min(100, Math.max(0, parseFloat(inputs.loyaltyPct) || 0));

  const atRiskRevenue = customers * monthlyRevenue * 12 * (churnRate / 100);
  const preventedChurn = customers * (churnRate / 100) * (loyaltyPct / 100);
  const switchingValue = (switchingCost + migrationCost + learningCost) * (churnRate / 100) * customers;
  const retentionValue = preventedChurn * monthlyRevenue * 12;
  const totalValue = switchingValue + retentionValue;
  const valuePerCustomer = customers > 0 ? totalValue / customers : 0;

  return { atRiskRevenue, preventedChurn, switchingValue, retentionValue, totalValue, valuePerCustomer };
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

export default function SwitchingCostValueCalculator() {
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
    num(inputs.customers) < 0 ||
    num(inputs.monthlyRevenue) < 0 ||
    num(inputs.churnRate) < 0 || num(inputs.churnRate) > 100 ||
    num(inputs.switchingCost) < 0 ||
    num(inputs.migrationCost) < 0 ||
    num(inputs.learningCost) < 0 ||
    num(inputs.loyaltyPct) < 0 || num(inputs.loyaltyPct) > 100;

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
    { label: "Customers", value: fmt(num(inputs.customers)) },
    { label: `Monthly Revenue / Customer (${fmtMoney(num(inputs.monthlyRevenue))})`, value: fmtMoney(num(inputs.customers) * num(inputs.monthlyRevenue) * 12) + "/yr" },
    { label: `At-Risk Annual Revenue (${fmt(num(inputs.churnRate), 1)}% churn)`, value: fmtMoney(result.atRiskRevenue) },
    { label: `Churn Prevented by Switching Costs (${fmt(num(inputs.loyaltyPct), 1)}%)`, value: fmt(result.preventedChurn, 1) + " customers" },
    { label: `Switching Cost Value (${fmtMoney(num(inputs.switchingCost) + num(inputs.migrationCost) + num(inputs.learningCost))}/customer)`, value: fmtMoney(result.switchingValue) },
    { label: `Retained Revenue Value (${fmtMoney(num(inputs.monthlyRevenue))}/mo × 12)`, value: fmtMoney(result.retentionValue) },
    { label: "Total Switching Cost Value", value: fmtMoney(result.totalValue), total: true },
    { label: "Value per Customer", value: fmtMoney(result.valuePerCustomer), highlight: true },
  ];

  const summaryStats = [
    { label: "Customers", value: fmt(num(inputs.customers)) },
    { label: "Monthly Revenue / Customer", value: fmtMoney(num(inputs.monthlyRevenue)) },
    { label: "Churn Rate", value: fmt(num(inputs.churnRate), 1) + "%" },
    { label: "Switching Cost / Customer", value: fmtMoney(num(inputs.switchingCost)) },
    { label: "Migration Cost / Customer", value: fmtMoney(num(inputs.migrationCost)) },
    { label: "Learning Cost / Customer", value: fmtMoney(num(inputs.learningCost)) },
    { label: "Churn Prevented", value: fmt(result.preventedChurn, 1) + " customers" },
    { label: "Switching Cost Value", value: fmtMoney(result.switchingValue) },
    { label: "Retained Revenue Value", value: fmtMoney(result.retentionValue) },
    { label: "Total Value", value: fmtMoney(result.totalValue), bold: true },
    { label: "Value per Customer", value: fmtMoney(result.valuePerCustomer) },
    { label: "At-Risk Annual Revenue", value: fmtMoney(result.atRiskRevenue) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Switching Cost Value Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Switching Cost Value Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="sw-customers" label="Number of Customers" value={inputs.customers} onChange={set("customers")} suffix="customers" />
              <NumInput id="sw-revenue" label="Monthly Revenue / Customer" value={inputs.monthlyRevenue} onChange={set("monthlyRevenue")} prefix="$" suffix="/mo" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="sw-churn" label="Annual Churn Rate" value={inputs.churnRate} onChange={set("churnRate")} suffix="%" />
              <NumInput id="sw-cost" label="Switching Cost / Customer" value={inputs.switchingCost} onChange={set("switchingCost")} prefix="$" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Switching Barriers</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="sw-migration" label="Migration Cost / Customer" value={inputs.migrationCost} onChange={set("migrationCost")} prefix="$" />
                    <NumInput id="sw-learning" label="Learning Cost / Customer" value={inputs.learningCost} onChange={set("learningCost")} prefix="$" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="sw-loyalty" label="Churn Prevented by Barriers" value={inputs.loyaltyPct} onChange={set("loyaltyPct")} suffix="%" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative; churn rate and loyalty percentage between 0 and 100.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Total Switching Cost Value</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.totalValue)}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.valuePerCustomer)} per customer — {fmt(result.preventedChurn, 1)} churns prevented</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">At-Risk Revenue</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.atRiskRevenue)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Switching Cost Value</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.switchingValue)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Retained Revenue Value</span>
                <span className="font-extrabold text-green-600">{fmtMoney(result.retentionValue)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Switching Cost Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Switching Cost Value Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A switching cost value calculator estimates how much money a company's customer switching costs are worth. Switching costs are the frictions a customer faces when leaving a product or service: the fees and setup charges of the alternative, the time and money spent migrating data, and the effort of learning a new system. For subscription businesses these frictions are a retention engine, because a customer who faces a $750 switching burden is far less likely to churn than one who can leave with a click. This calculator values switching costs from both sides: the direct value of the frictions that deter churn, computed across the customers at risk each year, and the revenue retained from the customers who stay because of those barriers, then totals them into a single annual figure and a per-customer value that belongs in any analysis of customer equity.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The model treats switching costs as a deterrent applied to the churn population rather than to the whole customer base: the at-risk revenue is the share of annual revenue facing churn, and the switching cost value applies the total switching burden to that same share, reflecting that only customers considering departure actually pay the switching cost. The loyalty percentage is the pivotal assumption, and it should be estimated from actual behavior, such as the share of cancelation requests that are retracted after retention offers, rather than guessed, because it directly scales the retained revenue value. The retained revenue value assumes the prevented churners keep paying at their current monthly rate for a year, which is the conservative convention for annual value; multi-year cohorts would value it higher. The per-customer output is the figure to use when deciding how much to spend on integrations and data portability features, since each dollar of added switching burden is worth its deterrent effect across the entire at-risk population.</p>
              <p className="text-muted-foreground leading-relaxed">The four core inputs are the number of customers, the monthly revenue per customer, the annual churn rate, and the direct switching cost per customer. The at-risk annual revenue is the customer count multiplied by the monthly revenue, twelve months, and the churn rate, showing the revenue exposed to churn each year. The advanced options add the migration cost and learning cost per customer, which together with the switching cost form the total switching burden, and the loyalty percentage, which is the share of would-be churners the barriers actually deter. The switching cost value is the total burden multiplied by the churn rate and the customer count, capturing the frictions' deterrent effect across the at-risk population. The retained revenue value is the prevented churn multiplied by the annual revenue per customer, valuing the customers the barriers keep. With the default inputs, 5,000 customers at $49 a month with a 3% churn rate face $57,600 of at-risk revenue avoided in part by a $750 total switching burden, and the combined value is roughly $380,000 a year.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The total value is the number to cite when deciding how much to invest in deepening switching costs, such as integrations, stored data, and workflow customization, since each dollar of added barrier is worth the churn it prevents across the customer base. The per-customer value is the benchmark for comparing customer segments, since high-value customers justify proportionally more retention investment. The loyalty percentage is the assumption to validate with churn data, because barriers that annoy customers without deterring them create resentment, not value. Be careful not to over-weight switching costs as a strategy: they retain unhappy customers temporarily, and the retained revenue figure assumes the customer keeps paying at the same rate. Re-run the calculator as churn and pricing change to keep the estimate current.</p>
            </div>
          </section>
          <PopularCalculators currentSlug="switching-cost-value-calculator" />
        </div>
      </div>
    </>
  );
}