"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  supportSpend: string;
  customers: string;
  tickets: string;
  avgRevenuePerCustomer: string;
  churnRate: string;
}

interface Result {
  costPerCustomer: number;
  costAsPctOfRevenue: number;
  ticketsPerCustomer: number;
  costPerTicket: number;
  revenueAtRisk: number;
  retainedRevenue: number;
  costPerRetainedCustomer: number;
}

const DEFAULTS: Inputs = {
  supportSpend: "300000",
  customers: "4500",
  tickets: "54000",
  avgRevenuePerCustomer: "1200",
  churnRate: "18",
};

function calculate(inputs: Inputs): Result {
  const supportSpend = Math.max(0, parseFloat(inputs.supportSpend) || 0);
  const customers = Math.max(0, parseFloat(inputs.customers) || 0);
  const tickets = Math.max(0, parseFloat(inputs.tickets) || 0);
  const avgRevenuePerCustomer = Math.max(0, parseFloat(inputs.avgRevenuePerCustomer) || 0);
  const churnRate = Math.min(100, Math.max(0, parseFloat(inputs.churnRate) || 0));

  const costPerCustomer = customers > 0 ? supportSpend / customers : 0;
  const totalRevenue = customers * avgRevenuePerCustomer;
  const costAsPctOfRevenue = totalRevenue > 0 ? (supportSpend / totalRevenue) * 100 : 0;
  const ticketsPerCustomer = customers > 0 ? tickets / customers : 0;
  const costPerTicket = tickets > 0 ? supportSpend / tickets : 0;
  const revenueAtRisk = totalRevenue * (churnRate / 100);
  const retainedRevenue = totalRevenue - revenueAtRisk;
  const costPerRetainedCustomer = retainedRevenue > 0 ? supportSpend / (customers * (1 - churnRate / 100)) : 0;

  return { costPerCustomer, costAsPctOfRevenue, ticketsPerCustomer, costPerTicket, revenueAtRisk, retainedRevenue, costPerRetainedCustomer };
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

export default function SupportCostPerCustomerCalculator() {
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
    num(inputs.supportSpend) <= 0 ||
    num(inputs.customers) <= 0 ||
    num(inputs.tickets) < 0 ||
    num(inputs.avgRevenuePerCustomer) < 0 ||
    num(inputs.churnRate) < 0 || num(inputs.churnRate) > 100;

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
    { label: "Annual Support Spend", value: fmtMoney(num(inputs.supportSpend), 0) },
    { label: "Active Customers", value: fmt(num(inputs.customers)) },
    { label: "Support Cost Per Customer", value: fmtMoney(result.costPerCustomer), highlight: true },
    { label: "Tickets Handled", value: fmt(num(inputs.tickets)) },
    { label: "Tickets Per Customer", value: fmt(result.ticketsPerCustomer, 2) },
    { label: "Cost Per Ticket", value: fmtMoney(result.costPerTicket) },
    { label: "Avg Revenue / Customer", value: fmtMoney(num(inputs.avgRevenuePerCustomer), 0) },
    { label: "Support Cost % of Revenue", value: result.costAsPctOfRevenue.toFixed(1) + "%" },
    { label: "Annual Churn Rate", value: num(inputs.churnRate).toFixed(1) + "%" },
    { label: "Revenue At Risk", value: fmtMoney(result.revenueAtRisk, 0) },
    { label: "Cost Per Retained Customer", value: fmtMoney(result.costPerRetainedCustomer), highlight: true },
  ];

  const summaryStats = [
    { label: "Cost / Customer", value: fmtMoney(result.costPerCustomer) },
    { label: "Cost % of Revenue", value: result.costAsPctOfRevenue.toFixed(1) + "%" },
    { label: "Tickets / Customer", value: fmt(result.ticketsPerCustomer, 2) },
    { label: "Cost / Ticket", value: fmtMoney(result.costPerTicket) },
    { label: "Revenue At Risk", value: fmtMoney(result.revenueAtRisk, 0) },
    { label: "Retained Revenue", value: fmtMoney(result.retainedRevenue, 0) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Support Cost Per Customer Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Support Cost Per Customer Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="spc-spend" label="Annual Support Spend" value={inputs.supportSpend} onChange={set("supportSpend")} prefix="$" />
              <NumInput id="spc-customers" label="Active Customers" value={inputs.customers} onChange={set("customers")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="spc-tickets" label="Tickets Handled" value={inputs.tickets} onChange={set("tickets")} />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Retention Context</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="spc-revenue" label="Avg Revenue / Customer" value={inputs.avgRevenuePerCustomer} onChange={set("avgRevenuePerCustomer")} prefix="$" />
                    <NumInput id="spc-churn" label="Annual Churn Rate" value={inputs.churnRate} onChange={set("churnRate")} suffix="%" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                Support spend and customers must be greater than zero; tickets must be non-negative; churn must be between 0 and 100.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Support Cost Per Customer</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.costPerCustomer)}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(num(inputs.supportSpend), 0)} across {fmt(num(inputs.customers))} customers</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost % of Revenue</span>
                <span className={`font-extrabold ${result.costAsPctOfRevenue <= 15 ? "text-emerald-600" : "text-amber-600"}`}>{result.costAsPctOfRevenue.toFixed(1)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Tickets / Customer</span>
                <span className="font-extrabold text-foreground">{fmt(result.ticketsPerCustomer, 2)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Revenue At Risk</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.revenueAtRisk, 0)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Support Unit Economics</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is Support Cost Per Customer?</h2>
              <p className="text-muted-foreground leading-relaxed">Support cost per customer is total customer-support spend divided by the active customer base. It is the normalized version of support spend that lets a business compare its service operation across quarters, segments, and cohorts without being misled by growth: as the customer base grows, total support spend naturally rises, but cost per customer reveals whether service efficiency is improving or eroding. The metric sits at the intersection of cost and retention — support is an expense on the income statement, but it is also the primary driver of the churn that determines whether recurring revenue compounds or leaks. That makes cost per customer a budgeting number with strategic weight.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How to Use This Calculator</h2>
              <p className="text-muted-foreground leading-relaxed">Enter your annual support spend and your average active customer count. The calculator returns cost per customer and, when you provide ticket volume, cost per ticket and tickets per customer — the two ratios that explain why cost per customer moves. The Advanced Options add the revenue context: average revenue per customer and churn rate. From those it derives support cost as a percentage of revenue and the revenue at risk from churn. Support cost as a percentage of revenue is the figure boards actually track: a healthy SaaS operation typically spends 10–20% of revenue on support, with high-touch enterprise models at the top of that range.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Interpreting the Trade-Offs</h2>
              <p className="text-muted-foreground leading-relaxed">The naive goal — minimize cost per customer — conflicts with the strategic goal of retention, because support quality is often the difference between a customer who renews and one who churns. The cost per retained customer line captures this: it divides support spend only across customers who stay, so an operation with high churn pays a hidden premium per surviving customer. Segmented analysis is essential: enterprise accounts may legitimately cost ten times more to support than SMB accounts while churning far less. Track cost per customer by segment, correlate it with churn by segment, and spend where the retention payoff is largest rather than where the cost is smallest.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/support-cost-per-customer-calculator" />
        </div>
      </div>
    </>
  );
}