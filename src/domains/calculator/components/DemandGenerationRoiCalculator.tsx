"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  campaignSpend: string;
  leadsGenerated: string;
  leadToCustomerRate: string;
  avgDealValue: string;
  grossMargin: string;
  campaignMonths: string;
  creativeCosts: string;
  toolsCosts: string;
}

interface Result {
  customers: number;
  revenue: number;
  grossProfit: number;
  totalSpend: number;
  roi: number;
  roas: number;
  costPerCustomer: number;
  leadsPerMonth: number;
  customersPerMonth: number;
  monthlySpend: number;
}

const DEFAULTS: Inputs = {
  campaignSpend: "25000",
  leadsGenerated: "2000",
  leadToCustomerRate: "5",
  avgDealValue: "2500",
  grossMargin: "60",
  campaignMonths: "6",
  creativeCosts: "2000",
  toolsCosts: "500",
};

function calculate(inputs: Inputs): Result {
  const campaignSpend = Math.max(0, parseFloat(inputs.campaignSpend) || 0);
  const leadsGenerated = Math.max(0, parseFloat(inputs.leadsGenerated) || 0);
  const leadToCustomerRate = Math.min(100, Math.max(0, parseFloat(inputs.leadToCustomerRate) || 0));
  const avgDealValue = Math.max(0, parseFloat(inputs.avgDealValue) || 0);
  const grossMargin = Math.min(100, Math.max(0, parseFloat(inputs.grossMargin) || 0));
  const campaignMonths = Math.max(1, parseFloat(inputs.campaignMonths) || 1);
  const creativeCosts = Math.max(0, parseFloat(inputs.creativeCosts) || 0);
  const toolsCosts = Math.max(0, parseFloat(inputs.toolsCosts) || 0);

  const customers = leadsGenerated * (leadToCustomerRate / 100);
  const revenue = customers * avgDealValue;
  const grossProfit = revenue * (grossMargin / 100);
  const totalSpend = campaignSpend + creativeCosts + toolsCosts;
  const roi = totalSpend > 0 ? ((grossProfit - totalSpend) / totalSpend) * 100 : 0;
  const roas = totalSpend > 0 ? revenue / totalSpend : 0;
  const costPerCustomer = customers > 0 ? totalSpend / customers : 0;
  const leadsPerMonth = leadsGenerated / campaignMonths;
  const customersPerMonth = customers / campaignMonths;
  const monthlySpend = totalSpend / campaignMonths;

  return { customers, revenue, grossProfit, totalSpend, roi, roas, costPerCustomer, leadsPerMonth, customersPerMonth, monthlySpend };
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

export default function DemandGenerationRoiCalculator() {
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
    num(inputs.campaignSpend) < 0 ||
    num(inputs.leadsGenerated) < 0 ||
    num(inputs.leadToCustomerRate) < 0 || num(inputs.leadToCustomerRate) > 100 ||
    num(inputs.avgDealValue) < 0 ||
    num(inputs.grossMargin) < 0 || num(inputs.grossMargin) > 100 ||
    num(inputs.campaignMonths) <= 0 ||
    num(inputs.creativeCosts) < 0 ||
    num(inputs.toolsCosts) < 0;

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
    { label: "Campaign Spend", value: fmtMoney(num(inputs.campaignSpend)) },
    { label: "Content & Creative Costs", value: fmtMoney(num(inputs.creativeCosts)) },
    { label: "Tools & Automation", value: fmtMoney(num(inputs.toolsCosts)) },
    { label: "Total Spend", value: fmtMoney(result.totalSpend), total: true },
    { label: "Leads Generated", value: fmt(num(inputs.leadsGenerated)) },
    { label: `Lead-to-Customer Rate (${fmt(num(inputs.leadToCustomerRate))}%)`, value: fmt(result.customers, 1) + " customers" },
    { label: "Revenue", value: fmtMoney(result.revenue) },
    { label: "Gross Profit", value: fmtMoney(result.grossProfit) },
    { label: "Return on Investment", value: fmt(result.roi, 1) + "%", highlight: true },
    { label: "Cost per Customer", value: fmtMoney(result.costPerCustomer) },
  ];

  const summaryStats: { label: string; value: string; bold?: boolean }[] = [
    { label: "Campaign Spend", value: fmtMoney(num(inputs.campaignSpend)) },
    { label: "Leads Generated", value: fmt(num(inputs.leadsGenerated)) },
    { label: "Lead-to-Customer Rate", value: fmt(num(inputs.leadToCustomerRate)) + "%" },
    { label: "Average Deal Value", value: fmtMoney(num(inputs.avgDealValue)) },
    { label: "Customers Acquired", value: fmt(result.customers, 1) },
    { label: "Revenue", value: fmtMoney(result.revenue) },
    { label: "Gross Profit", value: fmtMoney(result.grossProfit) },
    { label: "Total Spend", value: fmtMoney(result.totalSpend) },
    { label: "ROI", value: fmt(result.roi, 1) + "%" },
    { label: "Cost per Customer", value: fmtMoney(result.costPerCustomer) },
    { label: "Revenue / $1 Spent", value: fmt(result.roas, 2) },
    { label: "Monthly Spend", value: fmtMoney(result.monthlySpend) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Demand Generation ROI Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Demand Generation ROI Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="dg-spend" label="Campaign Spend" value={inputs.campaignSpend} onChange={set("campaignSpend")} prefix="$" />
              <NumInput id="dg-leads" label="Leads Generated" value={inputs.leadsGenerated} onChange={set("leadsGenerated")} suffix="leads" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="dg-ltr" label="Lead-to-Customer Rate" value={inputs.leadToCustomerRate} onChange={set("leadToCustomerRate")} suffix="%" />
              <NumInput id="dg-deal" label="Average Deal Value" value={inputs.avgDealValue} onChange={set("avgDealValue")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="dg-margin" label="Gross Margin" value={inputs.grossMargin} onChange={set("grossMargin")} suffix="%" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Campaign Details</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="dg-months" label="Campaign Duration" value={inputs.campaignMonths} onChange={set("campaignMonths")} suffix="months" />
                    <NumInput id="dg-creative" label="Content & Creative Costs" value={inputs.creativeCosts} onChange={set("creativeCosts")} prefix="$" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="dg-tools" label="Tools & Automation" value={inputs.toolsCosts} onChange={set("toolsCosts")} prefix="$" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative; campaign duration must be greater than zero; rates and margin must be between 0 and 100%.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Demand Generation ROI</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(result.roi, 1)}%</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.grossProfit)} gross profit on {fmtMoney(result.totalSpend)} total spend</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Customers Acquired</span>
                <span className="font-extrabold text-emerald-600">{fmt(result.customers, 1)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost per Customer</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.costPerCustomer)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Revenue / $1 Spent</span>
                <span className="font-extrabold text-emerald-600">{fmt(result.roas, 2)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Campaign Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Demand Generation ROI Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A demand generation ROI calculator measures whether the money spent filling the top of the funnel actually turns into profit. Demand generation covers every activity that creates interest in your product — content, webinars, paid social, SEO, and events — and its return is only visible once those leads move through to customers. This calculator connects the whole chain in one view: campaign spend produces leads, a percentage of leads become customers, customers produce revenue at an average deal value, and the gross margin turns that revenue into profit. With the default inputs, a $25,000 campaign generating 2,000 leads at a 5% conversion rate produces 100 customers worth $2,500 each, or $250,000 in revenue, and $150,000 in gross profit at a 60% margin — a 500% return before considering the extra creative and tooling costs. That full-funnel view is what separates demand generation ROI from a simple ad-spend calculation.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The calculation multiplies the lead count by the lead-to-customer rate to find how many customers the campaign produced, then multiplies by the average deal value for revenue and by the gross margin for profit. Total spend is the campaign budget plus the content and creative costs and the marketing automation tools that support it. Return on investment is the gross profit minus total spend, divided by total spend — the classic (gain minus cost) over cost formula. With the defaults, the extra $2,500 of creative and tooling lifts total spend to $27,500, and the ROI lands at 445%, while revenue per dollar spent sits at 9.1. The campaign duration splits everything into a monthly run rate: how many leads arrive each month, how many convert, and what the program costs per month, which makes the math comparable to an ongoing always-on program rather than a one-off burst. The cost per customer figure divides total spend by customers, and it is the number to compare against customer lifetime value when deciding whether to scale the program up.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">A positive ROI means the campaign generated more gross profit than it cost; the size of the number tells you how aggressively you can scale. The cost per customer is the bridge to lifetime value — if a customer is worth $1,500 in lifetime profit and the campaign acquires them for $275, scaling spend is a rational choice. Watch the lead-to-customer rate closely: at a 5% rate the campaign returns 445%, but if the rate slips to 2%, ROI collapses to just over 118% even though everything else is identical, which is why demand generation teams obsess over lead quality and scoring rather than raw volume. The revenue per dollar spent is the demand-gen analog of ROAS and is useful for comparing programs with different spend levels. Re-run the calculation quarterly with actuals instead of estimates, and track whether the lead-to-customer rate and average deal value are holding as the campaign scales — the point where ROI starts to fall is the point where incremental spend should be redirected.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/demand-generation-roi-calculator" />
        </div>
      </div>
    </>
  );
}