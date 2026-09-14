"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  ordersPerMonth: string;
  avgOrderValue: string;
  inHousePerOrder: string;
  threePlPerOrder: string;
  inHouseFixed: string;
  threePlFixed: string;
  transitionCost: string;
}

interface Result {
  inHouseVariableMonthly: number;
  threePlVariableMonthly: number;
  inHouseAnnual: number;
  threePlAnnual: number;
  annualSavings: number;
  firstYearNet: number;
  paybackYears: number;
  savingsPerOrder: number;
  threePlShareOfSales: number;
}

const DEFAULTS: Inputs = {
  ordersPerMonth: "8000",
  avgOrderValue: "65",
  inHousePerOrder: "6.50",
  threePlPerOrder: "4.75",
  inHouseFixed: "15000",
  threePlFixed: "8000",
  transitionCost: "40000",
};

function calculate(inputs: Inputs): Result {
  const ordersPerMonth = Math.max(0, parseFloat(inputs.ordersPerMonth) || 0);
  const avgOrderValue = Math.max(0, parseFloat(inputs.avgOrderValue) || 0);
  const inHousePerOrder = Math.max(0, parseFloat(inputs.inHousePerOrder) || 0);
  const threePlPerOrder = Math.max(0, parseFloat(inputs.threePlPerOrder) || 0);
  const inHouseFixed = Math.max(0, parseFloat(inputs.inHouseFixed) || 0);
  const threePlFixed = Math.max(0, parseFloat(inputs.threePlFixed) || 0);
  const transitionCost = Math.max(0, parseFloat(inputs.transitionCost) || 0);

  const inHouseVariableMonthly = inHousePerOrder * ordersPerMonth;
  const threePlVariableMonthly = threePlPerOrder * ordersPerMonth;
  const inHouseAnnual = (inHouseVariableMonthly + inHouseFixed) * 12;
  const threePlAnnual = (threePlVariableMonthly + threePlFixed) * 12;
  const annualSavings = inHouseAnnual - threePlAnnual;
  const firstYearNet = annualSavings - transitionCost;
  const paybackYears = annualSavings > 0 ? transitionCost / annualSavings : 0;
  const savingsPerOrder = inHousePerOrder - threePlPerOrder;
  const threePlShareOfSales = ordersPerMonth > 0 && avgOrderValue > 0 ? (threePlPerOrder / avgOrderValue) * 100 : 0;

  return { inHouseVariableMonthly, threePlVariableMonthly, inHouseAnnual, threePlAnnual, annualSavings, firstYearNet, paybackYears, savingsPerOrder, threePlShareOfSales };
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

export default function ThreePlVsInHouseLogisticsCostCalculator() {
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
    num(inputs.ordersPerMonth) <= 0 ||
    num(inputs.avgOrderValue) < 0 ||
    num(inputs.inHousePerOrder) < 0 ||
    num(inputs.threePlPerOrder) < 0 ||
    num(inputs.inHouseFixed) < 0 ||
    num(inputs.threePlFixed) < 0 ||
    num(inputs.transitionCost) < 0;

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
    { label: "Orders per Month", value: fmt(num(inputs.ordersPerMonth)) },
    { label: "In-House Cost per Order", value: "$" + fmt(num(inputs.inHousePerOrder), 2) },
    { label: "3PL Cost per Order", value: "$" + fmt(num(inputs.threePlPerOrder), 2) },
    { label: "In-House Annual Cost", value: fmtMoney(result.inHouseAnnual) },
    { label: "3PL Annual Cost", value: fmtMoney(result.threePlAnnual) },
    { label: "Annual Savings with 3PL", value: fmtMoney(result.annualSavings), total: true },
    { label: "First-Year Net (after transition)", value: fmtMoney(result.firstYearNet), highlight: true },
    { label: "Payback Period", value: result.paybackYears.toFixed(1) + " years" },
    { label: "Savings per Order", value: "$" + fmt(result.savingsPerOrder, 2) },
    { label: "3PL Cost as % of Order Value", value: result.threePlShareOfSales.toFixed(1) + "%" },
  ];

  const summaryStats = [
    { label: "Orders per Month", value: fmt(num(inputs.ordersPerMonth)) },
    { label: "In-House Cost / Order", value: "$" + fmt(num(inputs.inHousePerOrder), 2) },
    { label: "3PL Cost / Order", value: "$" + fmt(num(inputs.threePlPerOrder), 2) },
    { label: "In-House Annual Cost", value: fmtMoney(result.inHouseAnnual) },
    { label: "3PL Annual Cost", value: fmtMoney(result.threePlAnnual) },
    { label: "Annual Savings", value: fmtMoney(result.annualSavings), bold: true },
    { label: "First-Year Net", value: fmtMoney(result.firstYearNet) },
    { label: "Payback Period", value: result.paybackYears.toFixed(1) + " yrs" },
    { label: "Savings per Order", value: "$" + fmt(result.savingsPerOrder, 2) },
    { label: "3PL % of Order Value", value: result.threePlShareOfSales.toFixed(1) + "%" },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "3PL vs In-House Logistics Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">3PL vs In-House Logistics Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="3pl-orders" label="Orders per Month" value={inputs.ordersPerMonth} onChange={set("ordersPerMonth")} suffix="orders" />
              <NumInput id="3pl-order-value" label="Average Order Value" value={inputs.avgOrderValue} onChange={set("avgOrderValue")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="3pl-inhouse" label="In-House Cost per Order" value={inputs.inHousePerOrder} onChange={set("inHousePerOrder")} prefix="$" />
              <NumInput id="3pl-cost" label="3PL Cost per Order" value={inputs.threePlPerOrder} onChange={set("threePlPerOrder")} prefix="$" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Fixed & Transition Costs</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="3pl-inhouse-fixed" label="In-House Fixed Overhead" value={inputs.inHouseFixed} onChange={set("inHouseFixed")} prefix="$" suffix="/mo" />
                    <NumInput id="3pl-fixed" label="3PL Fixed Fees" value={inputs.threePlFixed} onChange={set("threePlFixed")} prefix="$" suffix="/mo" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="3pl-transition" label="One-Time Transition Cost" value={inputs.transitionCost} onChange={set("transitionCost")} prefix="$" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                Orders per month must be greater than zero; all costs must be non-negative.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Annual Savings with 3PL</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.annualSavings)}</div>
              <div className="text-sm text-muted-foreground font-medium">{result.annualSavings >= 0 ? "3PL outsourcing is " + fmtMoney(result.annualSavings) + " cheaper per year" : "In-house fulfillment is " + fmtMoney(-result.annualSavings) + " cheaper per year"}</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">In-House Annual Cost</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.inHouseAnnual)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">3PL Annual Cost</span>
                <span className="font-extrabold text-emerald-600">{fmtMoney(result.threePlAnnual)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Payback Period</span>
                <span className="font-extrabold text-primary">{result.paybackYears.toFixed(1)} yrs</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Fulfillment Comparison</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is a 3PL vs In-House Logistics Cost Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A 3PL vs in-house logistics cost calculator compares the total annual cost of operating your own fulfillment and warehousing operation against the cost of handing those functions to a third-party logistics provider. Third-party logistics companies, or 3PLs, run warehouses, pick and pack orders, and manage shipping on behalf of other businesses, charging per order plus monthly fixed fees. In-house fulfillment means the business owns or leases the warehouse space, employs the staff, and manages the process itself. The decision between the two is one of the biggest operating choices a growing product business makes, because both options carry substantial fixed costs and the right answer changes as order volume scales. This tool builds complete annual cost models for both approaches from a handful of inputs, then shows the annual savings, the one-time transition cost, and how quickly the transition pays for itself, so the comparison is made on total cost rather than on sticker price per order alone.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The calculator takes five core inputs. Orders per month sets the volume both options must handle, and the average order value is used to express fulfillment cost as a percentage of each sale. The in-house cost per order covers the warehouse labor, supplies, and handling expense of processing one order internally, while the 3PL cost per order is the per-order fee the provider charges. Monthly variable cost for each option is the cost per order multiplied by the order volume, and the annual cost adds twelve months of the fixed overhead each approach carries: rent, utilities, management, and equipment depreciation for the in-house operation, and the provider's monthly platform and storage fees for the 3PL. The difference between the two annual totals is the annual savings, and it is this figure, not the per-order price, that should drive the decision.</p>
              <p className="text-muted-foreground leading-relaxed mt-4">The Advanced Options section captures the costs that happen only once. The one-time transition cost includes moving inventory, terminating or setting up leases, integration work, and the downtime during the switch. Subtracting it from the first year of savings gives the first-year net benefit, and dividing it by the annual savings gives the payback period in years. With the default inputs, a business shipping eight thousand orders a month at $6.50 per order in-house versus $4.75 through a 3PL, with $15,000 and $8,000 of monthly fixed cost respectively, saves roughly $252,000 a year by outsourcing and recovers the $40,000 transition cost in under two months. The breakdown table shows both annual totals and the savings per order, and every figure updates together when you press Calculate.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The primary result is the annual savings with the 3PL, and when it is positive, outsourcing is the cheaper way to run fulfillment at your current volume. Before signing, compare the savings per order against the level of service your customers expect, because a 3PL's error rate, cutoff times, and branded packaging all affect retention, and those quality factors are not priced into this model. Pay close attention to how the answer changes with volume: in-house operations get cheaper per order as volume rises because fixed costs spread thinner, while 3PL contracts often become negotiable at higher volumes, so re-run the calculator whenever order count moves materially. The payback period tells you how long the transition cost takes to recover, and anything under two years is generally a comfortable bet. Use this tool annually, because the correct answer between building your own fulfillment capability and renting someone else's shifts with every change in volume, wage rates, and warehouse rents.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/3pl-vs-in-house-logistics-cost-calculator" />
        </div>
      </div>
    </>
  );
}