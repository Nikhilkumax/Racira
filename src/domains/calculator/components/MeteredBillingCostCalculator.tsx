"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  basePrice: string;
  includedUnits: string;
  overageRate: string;
  usage: string;
  customers: string;
  setupFee: string;
}

interface Result {
  includedUnits: number;
  overageUnits: number;
  overageCost: number;
  billPerCustomer: number;
  totalRevenue: number;
  averageRevenuePerCustomer: number;
  usageUtilizationPct: number;
  includedValue: number;
}

const DEFAULTS: Inputs = {
  basePrice: "49",
  includedUnits: "10000",
  overageRate: "0.005",
  usage: "14500",
  customers: "500",
  setupFee: "0",
};

function calculate(inputs: Inputs): Result {
  const basePrice = Math.max(0, parseFloat(inputs.basePrice) || 0);
  const includedUnits = Math.max(0, parseFloat(inputs.includedUnits) || 0);
  const overageRate = Math.max(0, parseFloat(inputs.overageRate) || 0);
  const usage = Math.max(0, parseFloat(inputs.usage) || 0);
  const customers = Math.max(0, parseFloat(inputs.customers) || 0);
  const setupFee = Math.max(0, parseFloat(inputs.setupFee) || 0);

  const overageUnits = Math.max(0, usage - includedUnits);
  const overageCost = overageUnits * overageRate;
  const billPerCustomer = basePrice + overageCost + setupFee;
  const totalRevenue = billPerCustomer * customers;
  const averageRevenuePerCustomer = billPerCustomer;
  const usageUtilizationPct = includedUnits > 0 ? (usage / includedUnits) * 100 : 0;
  const includedValue = includedUnits * overageRate;

  return { includedUnits, overageUnits, overageCost, billPerCustomer, totalRevenue, averageRevenuePerCustomer, usageUtilizationPct, includedValue };
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

export default function MeteredBillingCostCalculator() {
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
    num(inputs.basePrice) < 0 ||
    num(inputs.includedUnits) < 0 ||
    num(inputs.overageRate) < 0 ||
    num(inputs.usage) < 0 ||
    num(inputs.customers) <= 0 ||
    num(inputs.setupFee) < 0;

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
    { label: "Base Plan Price", value: fmtMoney(num(inputs.basePrice)) },
    { label: "Included Units", value: fmt(num(inputs.includedUnits)) },
    { label: "Actual Usage", value: fmt(num(inputs.usage)) },
    { label: "Utilization of Included Units", value: result.usageUtilizationPct.toFixed(1) + "%" },
    { label: "Overage Units", value: fmt(result.overageUnits) },
    { label: "Overage Rate", value: fmtMoney(num(inputs.overageRate), 4) + " / unit" },
    { label: "Overage Cost", value: fmtMoney(result.overageCost), highlight: true },
    { label: "Setup Fee", value: fmtMoney(num(inputs.setupFee), 0) },
    { label: "Total Bill Per Customer", value: fmtMoney(result.billPerCustomer) },
    { label: "Customers", value: fmt(num(inputs.customers)) },
    { label: "Total Monthly Revenue", value: fmtMoney(result.totalRevenue, 0), highlight: true },
  ];

  const summaryStats = [
    { label: "Bill / Customer", value: fmtMoney(result.billPerCustomer) },
    { label: "Overage Units", value: fmt(result.overageUnits) },
    { label: "Overage Cost", value: fmtMoney(result.overageCost) },
    { label: "Utilization", value: result.usageUtilizationPct.toFixed(1) + "%" },
    { label: "Total Revenue", value: fmtMoney(result.totalRevenue, 0) },
    { label: "Included Value", value: fmtMoney(result.includedValue) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Metered Billing Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Metered Billing Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="metered-base" label="Base Plan Price" value={inputs.basePrice} onChange={set("basePrice")} prefix="$" />
              <NumInput id="metered-included" label="Included Units" value={inputs.includedUnits} onChange={set("includedUnits")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="metered-rate" label="Overage Rate / Unit" value={inputs.overageRate} onChange={set("overageRate")} prefix="$" />
              <NumInput id="metered-usage" label="Actual Usage (Units)" value={inputs.usage} onChange={set("usage")} />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Revenue Scaling</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="metered-customers" label="Customers" value={inputs.customers} onChange={set("customers")} />
                    <NumInput id="metered-setup" label="One-Time Setup Fee" value={inputs.setupFee} onChange={set("setupFee")} prefix="$" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All values must be non-negative and customers must be greater than zero.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Bill Per Customer</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.billPerCustomer)}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(num(inputs.basePrice))} base + {fmtMoney(result.overageCost)} overage</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Overage Units</span>
                <span className={`font-extrabold ${result.overageUnits > 0 ? "text-amber-600" : "text-emerald-600"}`}>{fmt(result.overageUnits)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Utilization</span>
                <span className="font-extrabold text-foreground">{result.usageUtilizationPct.toFixed(1)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Monthly Revenue</span>
                <span className="font-extrabold text-emerald-600">{fmtMoney(result.totalRevenue, 0)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Metered Billing Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is Metered Billing?</h2>
              <p className="text-muted-foreground leading-relaxed">Metered billing, also called usage-based pricing, charges customers a base fee that includes a fixed allowance of units — API calls, gigabytes, compute hours, messages, or tokens — plus a per-unit rate for everything above the allowance. It is the pricing model behind cloud platforms like AWS and Azure, API providers like Stripe and Twilio, and the modern generation of AI and LLM products that bill per token. Metered billing aligns revenue with the value customers actually consume and lets small customers start cheaply while large customers pay more as they grow, which is why it has become the default for infrastructure and developer tools.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How to Use This Calculator</h2>
              <p className="text-muted-foreground leading-relaxed">Enter the base plan price, the units included in that price, the per-unit overage rate, and the customer's actual usage. The calculator subtracts the allowance to find overage units, multiplies by the rate to find the overage charge, and adds the base to produce the total bill. It also reports utilization — what share of the included allowance was used — which is the key planning number: utilization far below 100% means the plan tier is too generous, while heavy overage means customers are frequently crossing into the next bracket. In the Advanced Options, enter your customer count to project total monthly revenue at the current pricing.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Designing a Metered Pricing Structure</h2>
              <p className="text-muted-foreground leading-relaxed">The two levers are the allowance and the overage rate. A generous allowance with a low overage rate smooths bills and reduces churn risk but caps revenue growth; a tight allowance with a high rate maximizes revenue per heavy user but invites bill shock and support complaints. Well-designed metered plans keep typical customers below 80% of their allowance, giving headroom for growth while still producing overage revenue from the tail. When projecting revenue, remember that different customer segments have very different usage distributions — the average is rarely representative, so model a light user, a typical user, and a heavy user separately.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/metered-billing-cost-calculator" />
        </div>
      </div>
    </>
  );
}