"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  creationCost: string;
  distributionCost: string;
  monthlyTraffic: string;
  conversionRate: string;
  avgCustomerValue: string;
  lifespanMonths: string;
  maintenanceCost: string;
  grossMargin: string;
  trafficGrowth: string;
}

interface Result {
  customersAcquired: number;
  totalRevenue: number;
  grossProfit: number;
  totalCost: number;
  roi: number;
  costPerCustomer: number;
  avgMonthlyRevenue: number;
  totalVisitors: number;
}

const DEFAULTS: Inputs = {
  creationCost: "2500",
  distributionCost: "1000",
  monthlyTraffic: "3000",
  conversionRate: "2",
  avgCustomerValue: "150",
  lifespanMonths: "24",
  maintenanceCost: "100",
  grossMargin: "50",
  trafficGrowth: "3",
};

function calculate(inputs: Inputs): Result {
  const creationCost = Math.max(0, parseFloat(inputs.creationCost) || 0);
  const distributionCost = Math.max(0, parseFloat(inputs.distributionCost) || 0);
  const monthlyTraffic = Math.max(0, parseFloat(inputs.monthlyTraffic) || 0);
  const conversionRate = Math.min(100, Math.max(0, parseFloat(inputs.conversionRate) || 0));
  const avgCustomerValue = Math.max(0, parseFloat(inputs.avgCustomerValue) || 0);
  const lifespanMonths = Math.max(1, Math.floor(parseFloat(inputs.lifespanMonths) || 1));
  const maintenanceCost = Math.max(0, parseFloat(inputs.maintenanceCost) || 0);
  const grossMargin = Math.min(100, Math.max(0, parseFloat(inputs.grossMargin) || 0));
  const trafficGrowth = Math.min(100, Math.max(0, parseFloat(inputs.trafficGrowth) || 0));

  let totalVisitors = 0;
  let customersAcquired = 0;
  let totalRevenue = 0;
  for (let m = 0; m < lifespanMonths; m++) {
    const visitors = monthlyTraffic * Math.pow(1 + trafficGrowth / 100, m);
    totalVisitors += visitors;
    const customers = visitors * (conversionRate / 100);
    customersAcquired += customers;
    totalRevenue += customers * avgCustomerValue;
  }

  const grossProfit = totalRevenue * (grossMargin / 100);
  const totalCost = creationCost + distributionCost + maintenanceCost * lifespanMonths;
  const roi = totalCost > 0 ? ((grossProfit - totalCost) / totalCost) * 100 : 0;
  const costPerCustomer = customersAcquired > 0 ? totalCost / customersAcquired : 0;
  const avgMonthlyRevenue = totalRevenue / lifespanMonths;

  return { customersAcquired, totalRevenue, grossProfit, totalCost, roi, costPerCustomer, avgMonthlyRevenue, totalVisitors };
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

export default function ContentAssetRoiCalculator() {
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
    num(inputs.creationCost) < 0 ||
    num(inputs.distributionCost) < 0 ||
    num(inputs.monthlyTraffic) < 0 ||
    num(inputs.conversionRate) < 0 || num(inputs.conversionRate) > 100 ||
    num(inputs.avgCustomerValue) < 0 ||
    num(inputs.lifespanMonths) <= 0 ||
    num(inputs.maintenanceCost) < 0 ||
    num(inputs.grossMargin) < 0 || num(inputs.grossMargin) > 100 ||
    num(inputs.trafficGrowth) < 0 || num(inputs.trafficGrowth) > 100;

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
    { label: "Content Creation Cost", value: fmtMoney(num(inputs.creationCost)) },
    { label: "Distribution Cost", value: fmtMoney(num(inputs.distributionCost)) },
    { label: `Maintenance (${fmt(num(inputs.lifespanMonths))} mo × ${fmtMoney(num(inputs.maintenanceCost))})`, value: fmtMoney(num(inputs.maintenanceCost) * num(inputs.lifespanMonths)) },
    { label: "Total Cost", value: fmtMoney(result.totalCost), total: true },
    { label: "Monthly Visitors", value: fmt(Math.round(num(inputs.monthlyTraffic))) },
    { label: `Conversion Rate (${fmt(num(inputs.conversionRate))}%)`, value: fmt(result.customersAcquired, 1) + " customers" },
    { label: "Lifetime Revenue", value: fmtMoney(result.totalRevenue) },
    { label: "Gross Profit", value: fmtMoney(result.grossProfit) },
    { label: "Return on Investment", value: fmt(result.roi, 1) + "%", highlight: true },
    { label: "Cost per Customer", value: fmtMoney(result.costPerCustomer) },
  ];

  const summaryStats: { label: string; value: string; bold?: boolean }[] = [
    { label: "Creation Cost", value: fmtMoney(num(inputs.creationCost)) },
    { label: "Distribution Cost", value: fmtMoney(num(inputs.distributionCost)) },
    { label: "Monthly Traffic", value: fmt(Math.round(num(inputs.monthlyTraffic))) },
    { label: "Conversion Rate", value: fmt(num(inputs.conversionRate)) + "%" },
    { label: "Avg Customer Value", value: fmtMoney(num(inputs.avgCustomerValue)) },
    { label: "Asset Lifespan", value: fmt(num(inputs.lifespanMonths)) + " months" },
    { label: "Customers Acquired", value: fmt(result.customersAcquired, 1) },
    { label: "Lifetime Revenue", value: fmtMoney(result.totalRevenue) },
    { label: "Gross Profit", value: fmtMoney(result.grossProfit) },
    { label: "Total Cost", value: fmtMoney(result.totalCost) },
    { label: "ROI", value: fmt(result.roi, 1) + "%" },
    { label: "Cost per Customer", value: fmtMoney(result.costPerCustomer) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Content Asset ROI Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Content Asset ROI Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="ca-creation" label="Content Creation Cost" value={inputs.creationCost} onChange={set("creationCost")} prefix="$" />
              <NumInput id="ca-distribution" label="Distribution Cost" value={inputs.distributionCost} onChange={set("distributionCost")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="ca-traffic" label="Monthly Traffic from Asset" value={inputs.monthlyTraffic} onChange={set("monthlyTraffic")} suffix="visitors" />
              <NumInput id="ca-cvr" label="Conversion Rate" value={inputs.conversionRate} onChange={set("conversionRate")} suffix="%" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="ca-value" label="Avg Customer Value" value={inputs.avgCustomerValue} onChange={set("avgCustomerValue")} prefix="$" />
              <NumInput id="ca-lifespan" label="Asset Lifespan" value={inputs.lifespanMonths} onChange={set("lifespanMonths")} suffix="months" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Lifetime Assumptions</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="ca-maintenance" label="Monthly Maintenance Cost" value={inputs.maintenanceCost} onChange={set("maintenanceCost")} prefix="$" />
                    <NumInput id="ca-margin" label="Gross Margin" value={inputs.grossMargin} onChange={set("grossMargin")} suffix="%" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="ca-growth" label="Monthly Traffic Growth" value={inputs.trafficGrowth} onChange={set("trafficGrowth")} suffix="%" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative; asset lifespan must be greater than zero; rates and margin must be between 0 and 100%.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Content Asset ROI (Lifetime)</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(result.roi, 1)}%</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.grossProfit)} gross profit on {fmtMoney(result.totalCost)} total cost</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Lifetime Revenue</span>
                <span className="font-extrabold text-emerald-600">{fmtMoney(result.totalRevenue)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Customers Acquired</span>
                <span className="font-extrabold text-amber-600">{fmt(result.customersAcquired, 1)}</span>
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
                    <th className="py-2.5 pl-4 pr-3">Asset Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Content Asset ROI Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A content asset ROI calculator measures the lifetime return of a single piece of content — a blog post, video, guide, or tool — by tracking how much it cost to produce, how much traffic it earns month after month, and how much of that traffic converts into customers. Content is unusual among marketing investments because it compounds: unlike paid ads that stop when the budget stops, a well-positioned asset keeps attracting visitors for years, which is why its return must be measured over its whole lifespan rather than in the first month. The calculator compounds monthly traffic growth across the asset's useful life, values each conversion at the average customer value, and applies the gross margin to find true profit. In the default scenario, an asset that costs $5,900 to create, distribute, and maintain over 24 months drives roughly 103,000 visitors and 2,000 customers worth over $309,000 in revenue — a lifetime ROI above 2,500% — which is the case for keeping content investment alive even when month one looks modest.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">Each month of the asset's lifespan is modeled independently. The month's traffic starts at the base monthly traffic figure and grows by the traffic growth rate compounded month over month, reflecting the way search rankings, backlinks, and audience momentum accumulate. That month's visitors are multiplied by the conversion rate to find customers, and customers are multiplied by the average customer value for that month's revenue. Summing across all months gives lifetime revenue, which the gross margin converts into gross profit. Total cost is the one-time creation and distribution expense plus the monthly maintenance cost multiplied by the number of months. Return on investment divides the gross profit minus total cost by total cost. With the defaults, maintenance adds $2,400 across two years, so the full cost is $5,900, and the lifetime revenue of over $309,000 at a 50% margin yields more than $154,000 of profit against that $5,900 — the definition of an asset rather than an expense. The cost per customer divides total cost by customers acquired, which is the figure to compare against paid acquisition costs.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The lifetime ROI is the headline, but the cost per customer is the number that belongs in budget discussions — if a content asset acquires customers for a fraction of what paid channels charge, shifting budget toward content is mathematically justified. The traffic growth rate deserves scrutiny because it drives most of the compounding: at 3% monthly growth, traffic roughly doubles over two years, while at 0% the asset only earns its base level. If you are unsure, use a conservative growth rate and treat the result as a floor. Compare assets against each other using the same assumptions, and watch the decay curve — when an asset's monthly traffic starts to fall, its remaining ROI still compounds until the lifespan ends, so consider refreshing rather than replacing it. The gross margin assumption matters too: raising it from 50% to 70% changes profit far more than any plausible change in traffic, so use your real contribution margin, not your revenue markup.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/content-asset-roi-calculator" />
        </div>
      </div>
    </>
  );
}