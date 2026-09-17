"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  boothCost: string;
  travelCost: string;
  promoCost: string;
  leadsGenerated: string;
  leadToCustomerRate: string;
  avgDealValue: string;
  grossMargin: string;
  followupCost: string;
  otherCosts: string;
}

interface Result {
  customers: number;
  revenue: number;
  grossProfit: number;
  totalCost: number;
  roi: number;
  costPerLead: number;
  costPerCustomer: number;
  revenuePerLead: number;
}

const DEFAULTS: Inputs = {
  boothCost: "12000",
  travelCost: "5000",
  promoCost: "2000",
  leadsGenerated: "400",
  leadToCustomerRate: "10",
  avgDealValue: "3000",
  grossMargin: "50",
  followupCost: "1000",
  otherCosts: "1500",
};

function calculate(inputs: Inputs): Result {
  const boothCost = Math.max(0, parseFloat(inputs.boothCost) || 0);
  const travelCost = Math.max(0, parseFloat(inputs.travelCost) || 0);
  const promoCost = Math.max(0, parseFloat(inputs.promoCost) || 0);
  const leadsGenerated = Math.max(0, parseFloat(inputs.leadsGenerated) || 0);
  const leadToCustomerRate = Math.min(100, Math.max(0, parseFloat(inputs.leadToCustomerRate) || 0));
  const avgDealValue = Math.max(0, parseFloat(inputs.avgDealValue) || 0);
  const grossMargin = Math.min(100, Math.max(0, parseFloat(inputs.grossMargin) || 0));
  const followupCost = Math.max(0, parseFloat(inputs.followupCost) || 0);
  const otherCosts = Math.max(0, parseFloat(inputs.otherCosts) || 0);

  const customers = leadsGenerated * (leadToCustomerRate / 100);
  const revenue = customers * avgDealValue;
  const grossProfit = revenue * (grossMargin / 100);
  const totalCost = boothCost + travelCost + promoCost + followupCost + otherCosts;
  const roi = totalCost > 0 ? ((grossProfit - totalCost) / totalCost) * 100 : 0;
  const costPerLead = leadsGenerated > 0 ? totalCost / leadsGenerated : 0;
  const costPerCustomer = customers > 0 ? totalCost / customers : 0;
  const revenuePerLead = leadsGenerated > 0 ? revenue / leadsGenerated : 0;

  return { customers, revenue, grossProfit, totalCost, roi, costPerLead, costPerCustomer, revenuePerLead };
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

export default function TradeShowRoiCalculator() {
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
    num(inputs.boothCost) < 0 ||
    num(inputs.travelCost) < 0 ||
    num(inputs.promoCost) < 0 ||
    num(inputs.leadsGenerated) < 0 ||
    num(inputs.leadToCustomerRate) < 0 || num(inputs.leadToCustomerRate) > 100 ||
    num(inputs.avgDealValue) < 0 ||
    num(inputs.grossMargin) < 0 || num(inputs.grossMargin) > 100 ||
    num(inputs.followupCost) < 0 ||
    num(inputs.otherCosts) < 0;

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
    { label: "Booth & Space Cost", value: fmtMoney(num(inputs.boothCost)) },
    { label: "Travel & Accommodation", value: fmtMoney(num(inputs.travelCost)) },
    { label: "Promo Materials & Giveaways", value: fmtMoney(num(inputs.promoCost)) },
    { label: "Post-Show Follow-up", value: fmtMoney(num(inputs.followupCost)) },
    { label: "Other Event Costs", value: fmtMoney(num(inputs.otherCosts)) },
    { label: "Total Cost", value: fmtMoney(result.totalCost), total: true },
    { label: "Leads Generated", value: fmt(num(inputs.leadsGenerated)) },
    { label: `Lead-to-Customer Rate (${fmt(num(inputs.leadToCustomerRate))}%)`, value: fmt(result.customers, 1) + " customers" },
    { label: "Revenue", value: fmtMoney(result.revenue) },
    { label: "Gross Profit", value: fmtMoney(result.grossProfit) },
    { label: "Return on Investment", value: fmt(result.roi, 1) + "%", highlight: true },
  ];

  const summaryStats: { label: string; value: string; bold?: boolean }[] = [
    { label: "Booth & Space", value: fmtMoney(num(inputs.boothCost)) },
    { label: "Travel & Accommodation", value: fmtMoney(num(inputs.travelCost)) },
    { label: "Promo & Giveaways", value: fmtMoney(num(inputs.promoCost)) },
    { label: "Total Cost", value: fmtMoney(result.totalCost) },
    { label: "Leads Generated", value: fmt(num(inputs.leadsGenerated)) },
    { label: "Lead-to-Customer Rate", value: fmt(num(inputs.leadToCustomerRate)) + "%" },
    { label: "Customers Acquired", value: fmt(result.customers, 1) },
    { label: "Revenue", value: fmtMoney(result.revenue) },
    { label: "Gross Profit", value: fmtMoney(result.grossProfit) },
    { label: "ROI", value: fmt(result.roi, 1) + "%" },
    { label: "Cost per Lead", value: fmtMoney(result.costPerLead) },
    { label: "Cost per Customer", value: fmtMoney(result.costPerCustomer) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Trade Show ROI Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Trade Show ROI Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="ts-booth" label="Booth & Space Cost" value={inputs.boothCost} onChange={set("boothCost")} prefix="$" />
              <NumInput id="ts-travel" label="Travel & Accommodation" value={inputs.travelCost} onChange={set("travelCost")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="ts-promo" label="Promo Materials & Giveaways" value={inputs.promoCost} onChange={set("promoCost")} prefix="$" />
              <NumInput id="ts-leads" label="Leads Generated" value={inputs.leadsGenerated} onChange={set("leadsGenerated")} suffix="leads" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="ts-ltr" label="Lead-to-Customer Rate" value={inputs.leadToCustomerRate} onChange={set("leadToCustomerRate")} suffix="%" />
              <NumInput id="ts-deal" label="Average Deal Value" value={inputs.avgDealValue} onChange={set("avgDealValue")} prefix="$" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Event Details</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="ts-margin" label="Gross Margin" value={inputs.grossMargin} onChange={set("grossMargin")} suffix="%" />
                    <NumInput id="ts-followup" label="Post-Show Follow-up Cost" value={inputs.followupCost} onChange={set("followupCost")} prefix="$" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="ts-other" label="Other Event Costs" value={inputs.otherCosts} onChange={set("otherCosts")} prefix="$" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative; rates and margin must be between 0 and 100%.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Trade Show ROI</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(result.roi, 1)}%</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.grossProfit)} gross profit on {fmtMoney(result.totalCost)} total cost</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Cost</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.totalCost)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost per Lead</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.costPerLead)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost per Customer</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.costPerCustomer)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Event Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Trade Show ROI Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A trade show ROI calculator measures whether exhibiting at an event earns back its total cost. The bill for a trade show is far larger than the booth rental: travel and accommodation for the team, promotional materials and giveaways, the follow-up effort to convert the leads collected, and the miscellaneous costs that every event seems to generate. On the return side, the show produces leads, a percentage of which close into customers at an average deal value. With the default inputs, a show costing $21,500 — $12,000 for the booth, $5,000 for travel, $2,000 in promo, plus follow-up and incidentals — produces 400 leads, 40 customers at a 10% close rate, $120,000 of revenue, and $60,000 of gross profit at a 50% margin, a return of 179%. Trade shows are often the most expensive marketing channel per lead, so the discipline of counting every cost is what separates profitable exhibiting from expensive boondoggles.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The customer count multiplies the leads generated by the lead-to-customer rate, which should reflect your real historical close rate for trade show leads rather than your overall sales close rate, since event leads convert differently. Revenue multiplies customers by the average deal value, and gross profit applies the margin. Total cost is the sum of every line — booth and space, travel and accommodation, promotional materials, post-show follow-up, and other event costs. Return on investment divides gross profit minus total cost by total cost, using the standard gain-over-cost formula. Cost per lead divides total cost by leads, and cost per customer divides it by customers, giving the two benchmarks that let you compare the show against paid channels and against other events. With the defaults, the cost per lead is $53.75 and the cost per customer is $537.50 — compare those figures against your CAC from other channels before renewing the booth for next year.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">A positive ROI means the show produced more gross profit than it cost; a negative one means it was a branding exercise, which is sometimes a legitimate choice but should be a decision rather than an accident. The lead-to-customer rate is the most consequential assumption — trade show leads that are not followed up within days rarely close, so if your follow-up process is weak, the calculator will punish it honestly. Track cost per lead and cost per customer against other events and other channels to build a portfolio view, and remember that deal size varies by show: an industry-specific show with fewer but higher-value leads can beat a large general show on ROI despite lower lead counts. Re-run the calculation three, six, and twelve months after the event, because enterprise deals from shows can take a year to close, and a show that looked marginal in month one can look excellent by month twelve.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/trade-show-roi-calculator" />
        </div>
      </div>
    </>
  );
}