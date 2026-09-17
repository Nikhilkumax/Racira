"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  monthlyVisitors: string;
  conversionRate: string;
  avgOrderValue: string;
  seoSpend: string;
  grossMargin: string;
  timePeriodMonths: string;
  trafficGrowth: string;
  contentInvestment: string;
}

interface Result {
  totalVisitors: number;
  totalOrders: number;
  totalRevenue: number;
  grossProfit: number;
  totalCost: number;
  roi: number;
  revenuePerVisitor: number;
  costPerOrder: number;
  avgMonthlyProfit: number;
}

const DEFAULTS: Inputs = {
  monthlyVisitors: "50000",
  conversionRate: "2",
  avgOrderValue: "75",
  seoSpend: "3000",
  grossMargin: "40",
  timePeriodMonths: "12",
  trafficGrowth: "5",
  contentInvestment: "2000",
};

function calculate(inputs: Inputs): Result {
  const monthlyVisitors = Math.max(0, parseFloat(inputs.monthlyVisitors) || 0);
  const conversionRate = Math.min(100, Math.max(0, parseFloat(inputs.conversionRate) || 0));
  const avgOrderValue = Math.max(0, parseFloat(inputs.avgOrderValue) || 0);
  const seoSpend = Math.max(0, parseFloat(inputs.seoSpend) || 0);
  const grossMargin = Math.min(100, Math.max(0, parseFloat(inputs.grossMargin) || 0));
  const timePeriodMonths = Math.max(1, Math.floor(parseFloat(inputs.timePeriodMonths) || 1));
  const trafficGrowth = Math.min(100, Math.max(0, parseFloat(inputs.trafficGrowth) || 0));
  const contentInvestment = Math.max(0, parseFloat(inputs.contentInvestment) || 0);

  let totalVisitors = 0;
  let totalOrders = 0;
  let totalRevenue = 0;
  for (let m = 0; m < timePeriodMonths; m++) {
    const visitors = monthlyVisitors * Math.pow(1 + trafficGrowth / 100, m);
    totalVisitors += visitors;
    const orders = visitors * (conversionRate / 100);
    totalOrders += orders;
    totalRevenue += orders * avgOrderValue;
  }

  const grossProfit = totalRevenue * (grossMargin / 100);
  const totalCost = seoSpend * timePeriodMonths + contentInvestment;
  const roi = totalCost > 0 ? ((grossProfit - totalCost) / totalCost) * 100 : 0;
  const revenuePerVisitor = totalVisitors > 0 ? totalRevenue / totalVisitors : 0;
  const costPerOrder = totalOrders > 0 ? totalCost / totalOrders : 0;
  const avgMonthlyProfit = grossProfit / timePeriodMonths;

  return { totalVisitors, totalOrders, totalRevenue, grossProfit, totalCost, roi, revenuePerVisitor, costPerOrder, avgMonthlyProfit };
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

export default function OrganicTrafficRoiCalculator() {
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
    num(inputs.monthlyVisitors) < 0 ||
    num(inputs.conversionRate) < 0 || num(inputs.conversionRate) > 100 ||
    num(inputs.avgOrderValue) < 0 ||
    num(inputs.seoSpend) < 0 ||
    num(inputs.grossMargin) < 0 || num(inputs.grossMargin) > 100 ||
    num(inputs.timePeriodMonths) <= 0 ||
    num(inputs.trafficGrowth) < 0 || num(inputs.trafficGrowth) > 100 ||
    num(inputs.contentInvestment) < 0;

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
    { label: `SEO Spend (${fmt(num(inputs.timePeriodMonths))} mo × ${fmtMoney(num(inputs.seoSpend))})`, value: fmtMoney(num(inputs.seoSpend) * num(inputs.timePeriodMonths)) },
    { label: "One-Time Content Investment", value: fmtMoney(num(inputs.contentInvestment)) },
    { label: "Total Cost", value: fmtMoney(result.totalCost), total: true },
    { label: "Monthly Visitors", value: fmt(Math.round(num(inputs.monthlyVisitors))) },
    { label: `Conversion Rate (${fmt(num(inputs.conversionRate))}%)`, value: fmt(result.totalOrders, 1) + " orders" },
    { label: "Total Visitors (with growth)", value: fmt(Math.round(result.totalVisitors)) },
    { label: "Total Revenue", value: fmtMoney(result.totalRevenue) },
    { label: "Gross Profit", value: fmtMoney(result.grossProfit) },
    { label: "Return on Investment", value: fmt(result.roi, 1) + "%", highlight: true },
    { label: "Cost per Order", value: fmtMoney(result.costPerOrder) },
  ];

  const summaryStats: { label: string; value: string; bold?: boolean }[] = [
    { label: "Monthly Visitors", value: fmt(Math.round(num(inputs.monthlyVisitors))) },
    { label: "Conversion Rate", value: fmt(num(inputs.conversionRate)) + "%" },
    { label: "Avg Order Value", value: fmtMoney(num(inputs.avgOrderValue)) },
    { label: "Monthly SEO Spend", value: fmtMoney(num(inputs.seoSpend)) },
    { label: "Time Period", value: fmt(num(inputs.timePeriodMonths)) + " months" },
    { label: "Total Visitors", value: fmt(Math.round(result.totalVisitors)) },
    { label: "Total Orders", value: fmt(Math.round(result.totalOrders)) },
    { label: "Total Revenue", value: fmtMoney(result.totalRevenue) },
    { label: "Gross Profit", value: fmtMoney(result.grossProfit) },
    { label: "Total Cost", value: fmtMoney(result.totalCost) },
    { label: "ROI", value: fmt(result.roi, 1) + "%" },
    { label: "Revenue per Visitor", value: fmtMoney(result.revenuePerVisitor) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Organic Traffic ROI Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Organic Traffic ROI Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="ot-visitors" label="Monthly Organic Visitors" value={inputs.monthlyVisitors} onChange={set("monthlyVisitors")} suffix="visitors" />
              <NumInput id="ot-cvr" label="Organic Conversion Rate" value={inputs.conversionRate} onChange={set("conversionRate")} suffix="%" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="ot-aov" label="Average Order Value" value={inputs.avgOrderValue} onChange={set("avgOrderValue")} prefix="$" />
              <NumInput id="ot-seo" label="Monthly SEO Spend" value={inputs.seoSpend} onChange={set("seoSpend")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="ot-margin" label="Gross Margin" value={inputs.grossMargin} onChange={set("grossMargin")} suffix="%" />
              <NumInput id="ot-period" label="Time Period" value={inputs.timePeriodMonths} onChange={set("timePeriodMonths")} suffix="months" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Traffic & Cost Details</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="ot-growth" label="Monthly Traffic Growth" value={inputs.trafficGrowth} onChange={set("trafficGrowth")} suffix="%" />
                    <NumInput id="ot-content" label="One-Time Content Investment" value={inputs.contentInvestment} onChange={set("contentInvestment")} prefix="$" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative; time period must be greater than zero; rates and margin must be between 0 and 100%.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Organic Traffic ROI</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(result.roi, 1)}%</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.grossProfit)} gross profit on {fmtMoney(result.totalCost)} total cost</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Revenue</span>
                <span className="font-extrabold text-emerald-600">{fmtMoney(result.totalRevenue)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Orders</span>
                <span className="font-extrabold text-amber-600">{fmt(Math.round(result.totalOrders))}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost per Order</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.costPerOrder)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Traffic Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is an Organic Traffic ROI Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">An organic traffic ROI calculator measures the return on search engine optimization investment over a period of months. Organic traffic is the visitors who arrive from search results without paying per click, and its return compounds because rankings improve with time, content, and links. The calculation takes the monthly visitor count, converts a share into orders, values those orders, applies the gross margin, and compares the resulting profit against the SEO spend plus any one-time content investment. With the default inputs, 50,000 monthly visitors converting at 2% generate 1,000 orders a month worth $75 each, or $75,000 of revenue and $30,000 of profit at a 40% margin — and at 5% monthly traffic growth, the compounded twelve-month revenue reaches more than $1.1 million against a total SEO cost of $38,000, a return above 1,150%. SEO's reputation as slow is accurate; its reputation as unmeasurable is not, provided the traffic, conversion, and spend figures are tracked honestly.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">Each month of the period is modeled with its own traffic level: the base monthly visitors are compounded by the monthly growth rate, so month twelve sees 50,000 visitors grown by 5% eleven times, reaching roughly 85,000. That month's visitors are multiplied by the conversion rate for orders, and orders by the average order value for revenue. Summing across the full period produces total visitors, total orders, and total revenue; the gross margin converts revenue into profit. Total cost is the monthly SEO spend multiplied by the number of months plus the one-time content investment. Return on investment divides gross profit minus total cost by total cost. With the defaults, total visitors reach roughly 796,000, total orders about 15,900, and total revenue $1.19 million, while the 12 months of SEO spend plus the $2,000 content investment total $38,000 — a return of about 1,157%. The revenue per visitor figure is the stable per-unit economics, while cost per order lets you compare organic against paid acquisition.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The ROI number is heavily influenced by the traffic growth assumption, so use a rate you can defend — 5% monthly is aggressive for mature markets and conservative for new sites with fresh content. If you run the model at 0% growth and it still returns well, the investment is robust; if it only works at high growth, the strategy depends on ranking improvements materializing. The conversion rate matters almost as much: organic visitors arrive with different intent than paid traffic, so measure it separately rather than reusing your site-wide number. The cost per order is the benchmark for the budget conversation — when it falls below paid-channel costs, the case for shifting budget to SEO writes itself. Re-run the calculation monthly with actual traffic data, and remember that the compounding works in reverse too: if rankings decay, the growth rate turns negative, and the model will show the real cost of pausing SEO investment.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/organic-traffic-roi-calculator" />
        </div>
      </div>
    </>
  );
}