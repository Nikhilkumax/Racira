"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  marketingSpend: string;
  salesSpend: string;
  newCustomers: string;
  annualRevenuePerCustomer: string;
  attributionRate: string;
  timePeriodMonths: string;
  grossMargin: string;
}

interface Result {
  totalSpend: number;
  cac: number;
  marketingCac: number;
  salesCac: number;
  attributedSpend: number;
  attributedCac: number;
  paybackMonths: number;
  monthlyProfitPerCustomer: number;
}

const DEFAULTS: Inputs = {
  marketingSpend: "10000",
  salesSpend: "5000",
  newCustomers: "150",
  annualRevenuePerCustomer: "1200",
  attributionRate: "80",
  timePeriodMonths: "12",
  grossMargin: "40",
};

function calculate(inputs: Inputs): Result {
  const marketingSpend = Math.max(0, parseFloat(inputs.marketingSpend) || 0);
  const salesSpend = Math.max(0, parseFloat(inputs.salesSpend) || 0);
  const newCustomers = Math.max(0, parseFloat(inputs.newCustomers) || 0);
  const annualRevenuePerCustomer = Math.max(0, parseFloat(inputs.annualRevenuePerCustomer) || 0);
  const attributionRate = Math.min(100, Math.max(0, parseFloat(inputs.attributionRate) || 0));
  const timePeriodMonths = Math.max(1, parseFloat(inputs.timePeriodMonths) || 1);
  const grossMargin = Math.min(100, Math.max(0, parseFloat(inputs.grossMargin) || 0));

  const totalSpend = marketingSpend + salesSpend;
  const cac = newCustomers > 0 ? totalSpend / newCustomers : 0;
  const marketingCac = newCustomers > 0 ? marketingSpend / newCustomers : 0;
  const salesCac = newCustomers > 0 ? salesSpend / newCustomers : 0;
  const attributedSpend = totalSpend * (attributionRate / 100);
  const attributedCac = newCustomers > 0 ? attributedSpend / newCustomers : 0;
  const monthlyProfitPerCustomer = (annualRevenuePerCustomer * (grossMargin / 100)) / timePeriodMonths;
  const paybackMonths = monthlyProfitPerCustomer > 0 ? cac / monthlyProfitPerCustomer : 0;

  return { totalSpend, cac, marketingCac, salesCac, attributedSpend, attributedCac, paybackMonths, monthlyProfitPerCustomer };
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

export default function CustomerAcquisitionCostCalculator() {
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
    num(inputs.marketingSpend) < 0 ||
    num(inputs.salesSpend) < 0 ||
    num(inputs.newCustomers) <= 0 ||
    num(inputs.annualRevenuePerCustomer) < 0 ||
    num(inputs.attributionRate) < 0 || num(inputs.attributionRate) > 100 ||
    num(inputs.timePeriodMonths) <= 0 ||
    num(inputs.grossMargin) < 0 || num(inputs.grossMargin) > 100;

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

  const rows: { label: string; value: string; total?: boolean; highlight?: boolean }[] = [
    { label: "Marketing Spend", value: fmtMoney(num(inputs.marketingSpend)) },
    { label: "Sales Spend", value: fmtMoney(num(inputs.salesSpend)) },
    { label: "Total Acquisition Spend", value: fmtMoney(result.totalSpend), total: true },
    { label: "New Customers Acquired", value: fmt(num(inputs.newCustomers)) },
    { label: "Marketing CAC", value: fmtMoney(result.marketingCac) },
    { label: "Sales CAC", value: fmtMoney(result.salesCac) },
    { label: "Blended CAC", value: fmtMoney(result.cac), highlight: true },
    { label: `Attributed Spend (${fmt(num(inputs.attributionRate))}%)`, value: fmtMoney(result.attributedSpend) },
    { label: "Attributed CAC", value: fmtMoney(result.attributedCac) },
    { label: "Payback Period", value: fmt(result.paybackMonths, 1) + " months" },
  ];

  const summaryStats: { label: string; value: string; bold?: boolean }[] = [
    { label: "Marketing Spend", value: fmtMoney(num(inputs.marketingSpend)) },
    { label: "Sales Spend", value: fmtMoney(num(inputs.salesSpend)) },
    { label: "Total Spend", value: fmtMoney(result.totalSpend) },
    { label: "New Customers", value: fmt(num(inputs.newCustomers)) },
    { label: "Blended CAC", value: fmtMoney(result.cac) },
    { label: "Marketing CAC", value: fmtMoney(result.marketingCac) },
    { label: "Sales CAC", value: fmtMoney(result.salesCac) },
    { label: "Attributed CAC", value: fmtMoney(result.attributedCac) },
    { label: "Payback Period", value: fmt(result.paybackMonths, 1) + " months" },
    { label: "Gross Margin", value: fmt(num(inputs.grossMargin)) + "%" },
    { label: "Time Period", value: fmt(num(inputs.timePeriodMonths)) + " months" },
    { label: "Attribution Rate", value: fmt(num(inputs.attributionRate)) + "%" },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Customer Acquisition Cost (CAC) Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Customer Acquisition Cost (CAC) Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="cac-marketing" label="Marketing Spend" value={inputs.marketingSpend} onChange={set("marketingSpend")} prefix="$" />
              <NumInput id="cac-sales" label="Sales Spend" value={inputs.salesSpend} onChange={set("salesSpend")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="cac-customers" label="New Customers Acquired" value={inputs.newCustomers} onChange={set("newCustomers")} suffix="customers" />
              <NumInput id="cac-revenue" label="Avg Annual Revenue per Customer" value={inputs.annualRevenuePerCustomer} onChange={set("annualRevenuePerCustomer")} prefix="$" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Attribution & Assumptions</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="cac-attribution" label="Attribution Rate" value={inputs.attributionRate} onChange={set("attributionRate")} suffix="%" />
                    <NumInput id="cac-period" label="Time Period" value={inputs.timePeriodMonths} onChange={set("timePeriodMonths")} suffix="months" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="cac-margin" label="Gross Margin" value={inputs.grossMargin} onChange={set("grossMargin")} suffix="%" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative; new customers and time period must be greater than zero; attribution rate and gross margin must be between 0 and 100%.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Customer Acquisition Cost</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.cac)}</div>
              <div className="text-sm text-muted-foreground font-medium">per customer across {fmt(num(inputs.newCustomers))} new customers</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Spend</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.totalSpend)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Marketing CAC</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.marketingCac)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Payback Period</span>
                <span className="font-extrabold text-emerald-600">{fmt(result.paybackMonths, 1)} mo</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">CAC Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Customer Acquisition Cost (CAC) Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A customer acquisition cost calculator measures how much a business pays, on average, to win a single new customer. CAC is the total of everything spent to attract and convert buyers — advertising, content, sales team salaries, and the software that supports them — divided by the number of customers those efforts produced. It is the single most important efficiency number for a growth organization, because it answers the question every founder and marketer eventually asks: are we paying too much to grow? In the default scenario, a company spending $15,000 across marketing and sales to win 150 customers is paying $100 per customer. Whether that is healthy depends entirely on how much each customer is worth, which is why this calculator pairs CAC with average revenue per customer and a payback period. Growth is only sustainable when the cost of acquiring a customer is recovered by their profit before the cash runs out, and this tool makes that relationship visible in seconds.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The blended CAC is the sum of marketing spend and sales spend divided by the number of new customers acquired over the period. Marketing CAC isolates the advertising, content, and campaign portion, while sales CAC isolates the salaries, commissions, and tools of the sales organization, so you can see which side of the funnel is driving cost. With the defaults, $10,000 of marketing spend produces a marketing CAC of $66.67, $5,000 of sales spend produces a sales CAC of $33.33, and the blended figure lands at $100. The attribution rate handles the reality that some marketing spend assists existing customers rather than acquiring new ones: at an 80% attribution rate, only $12,000 of the $15,000 counts toward acquisition, lifting the attributed CAC to $80 and giving a more honest view of new-customer economics. The payback period converts the CAC into months using the annual revenue per customer, gross margin, and the length of the measurement period — at the defaults, a $100 CAC against $40 of monthly profit means the customer pays for themselves in two and a half months. Shorter payback periods mean faster reinvestment and less working capital tied up in growth.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The blended CAC is the headline number, but the marketing CAC and sales CAC splits are where the insight lives. If marketing CAC is climbing while conversion rates hold steady, ad costs or creative fatigue are the culprits; if sales CAC is high, look at sales cycle length, demo-to-close rates, and quota attainment. The payback period is the number to compare against your cash runway and gross margin — a rule of thumb is that payback inside 12 months is strong, and inside 6 months is excellent for most businesses. Benchmarks vary by industry: subscription businesses often tolerate higher CAC because lifetime value is recurring, while low-margin retail needs very short payback. Track CAC quarterly against the same spend inputs, and pair it with the LTV to CAC ratio, where 3:1 is the widely cited healthy benchmark. If your payback is longer than the customer's likely lifespan, no amount of growth will fix the economics — reduce spend, tighten attribution, or raise prices before scaling.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/customer-acquisition-cost-cac-calculator" />
        </div>
      </div>
    </>
  );
}