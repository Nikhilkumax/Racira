"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  shippingSpend: string;
  orders: string;
  avgWeight: string;
  fuelSurcharge: string;
  packagingCost: string;
  returns: string;
  otherFees: string;
}

interface Result {
  basePerOrder: number;
  fuelMonthly: number;
  packagingMonthly: number;
  returnsMonthly: number;
  totalMonthly: number;
  fullyLoadedPerOrder: number;
  costPerPound: number;
}

const DEFAULTS: Inputs = {
  shippingSpend: "45000",
  orders: "6000",
  avgWeight: "3.5",
  fuelSurcharge: "6",
  packagingCost: "1.20",
  returns: "450",
  otherFees: "3500",
};

function calculate(inputs: Inputs): Result {
  const shippingSpend = Math.max(0, parseFloat(inputs.shippingSpend) || 0);
  const orders = Math.max(0, parseFloat(inputs.orders) || 0);
  const avgWeight = Math.max(0, parseFloat(inputs.avgWeight) || 0);
  const fuelSurcharge = Math.max(0, parseFloat(inputs.fuelSurcharge) || 0);
  const packagingCost = Math.max(0, parseFloat(inputs.packagingCost) || 0);
  const returns = Math.max(0, parseFloat(inputs.returns) || 0);
  const otherFees = Math.max(0, parseFloat(inputs.otherFees) || 0);

  const basePerOrder = orders > 0 ? shippingSpend / orders : 0;
  const fuelMonthly = (shippingSpend * fuelSurcharge) / 100;
  const packagingMonthly = packagingCost * orders;
  const returnsMonthly = basePerOrder * returns;
  const totalMonthly = shippingSpend + fuelMonthly + packagingMonthly + returnsMonthly + otherFees;
  const fullyLoadedPerOrder = orders > 0 ? totalMonthly / orders : 0;
  const costPerPound = avgWeight > 0 ? basePerOrder / avgWeight : 0;

  return { basePerOrder, fuelMonthly, packagingMonthly, returnsMonthly, totalMonthly, fullyLoadedPerOrder, costPerPound };
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

export default function ShippingCostPerOrderCalculator() {
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
    num(inputs.shippingSpend) < 0 ||
    num(inputs.orders) <= 0 ||
    num(inputs.avgWeight) < 0 ||
    num(inputs.fuelSurcharge) < 0 ||
    num(inputs.packagingCost) < 0 ||
    num(inputs.returns) < 0 ||
    num(inputs.otherFees) < 0;

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
    { label: "Orders Shipped per Month", value: fmt(num(inputs.orders)) },
    { label: "Carrier Shipping Spend", value: fmtMoney(num(inputs.shippingSpend)) },
    { label: `Fuel Surcharge (${fmt(num(inputs.fuelSurcharge), 1)}%)`, value: fmtMoney(result.fuelMonthly) },
    { label: `Packaging (${fmt(num(inputs.packagingCost), 2)}/order)`, value: fmtMoney(result.packagingMonthly) },
    { label: "Return Shipments", value: fmtMoney(result.returnsMonthly) },
    { label: "Other Freight Fees", value: fmtMoney(num(inputs.otherFees)) },
    { label: "Total Monthly Shipping Cost", value: fmtMoney(result.totalMonthly), total: true },
    { label: "Base Cost per Order", value: "$" + fmt(result.basePerOrder, 2) },
    { label: "Fully Loaded Cost per Order", value: "$" + fmt(result.fullyLoadedPerOrder, 2), highlight: true },
    { label: "Cost per Pound Shipped", value: "$" + fmt(result.costPerPound, 2) },
  ];

  const summaryStats = [
    { label: "Orders / Month", value: fmt(num(inputs.orders)) },
    { label: "Avg Package Weight", value: fmt(num(inputs.avgWeight), 1) + " lb" },
    { label: "Carrier Spend", value: fmtMoney(num(inputs.shippingSpend)) },
    { label: "Fuel Surcharge", value: fmtMoney(result.fuelMonthly) },
    { label: "Packaging Cost", value: fmtMoney(result.packagingMonthly) },
    { label: "Return Shipments", value: fmtMoney(result.returnsMonthly) },
    { label: "Total Monthly Cost", value: fmtMoney(result.totalMonthly), bold: true },
    { label: "Base Cost / Order", value: "$" + fmt(result.basePerOrder, 2) },
    { label: "Fully Loaded / Order", value: "$" + fmt(result.fullyLoadedPerOrder, 2) },
    { label: "Cost / Pound", value: "$" + fmt(result.costPerPound, 2) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Shipping Cost per Order Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Shipping Cost per Order Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="ship-spend" label="Monthly Shipping Spend" value={inputs.shippingSpend} onChange={set("shippingSpend")} prefix="$" />
              <NumInput id="ship-orders" label="Orders Shipped per Month" value={inputs.orders} onChange={set("orders")} suffix="orders" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="ship-weight" label="Average Package Weight" value={inputs.avgWeight} onChange={set("avgWeight")} suffix="lb" />
              <NumInput id="ship-fuel" label="Average Fuel Surcharge" value={inputs.fuelSurcharge} onChange={set("fuelSurcharge")} suffix="%" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Packaging & Returns</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="ship-packaging" label="Packaging Cost per Order" value={inputs.packagingCost} onChange={set("packagingCost")} prefix="$" />
                    <NumInput id="ship-returns" label="Returns Shipped per Month" value={inputs.returns} onChange={set("returns")} suffix="orders" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="ship-other" label="Other Monthly Freight Fees" value={inputs.otherFees} onChange={set("otherFees")} prefix="$" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                Orders shipped must be greater than zero; all costs and rates must be non-negative.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Fully Loaded Cost per Order</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">${fmt(result.fullyLoadedPerOrder, 2)}</div>
              <div className="text-sm text-muted-foreground font-medium">${fmt(result.basePerOrder, 2)} carrier cost plus fuel, packaging, returns & fees</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Base Cost / Order</span>
                <span className="font-extrabold text-emerald-600">${fmt(result.basePerOrder, 2)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Fuel Surcharge / Mo</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.fuelMonthly)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Monthly Cost</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.totalMonthly)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Shipping Cost Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Shipping Cost per Order Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A shipping cost per order calculator works out the true average cost of shipping a single order, including every cost that attaches to the shipment and not just the carrier invoice. For e-commerce and direct-to-consumer businesses, shipping is usually the second largest operating cost after product cost, and it is also the one most likely to be underestimated, because the carrier bill is only part of the story. On top of the base freight charge there are fuel surcharges, packaging materials, the cost of shipping returns back to the warehouse, and assorted fees from carriers and marketplaces. This calculator adds all of those layers to the monthly carrier spend and divides by the number of orders shipped, producing a fully loaded cost per order that reflects what shipping actually costs the business. That single number is what pricing, free shipping thresholds, and profitability analysis should be built on.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The calculator starts with the monthly carrier shipping spend, the total paid to shipping carriers for the month, and the number of orders shipped, and the base cost per order is simply the spend divided by the order count. The average package weight and the fuel surcharge rate complete the core inputs: the fuel surcharge, which carriers add as a percentage of the freight charge to track diesel prices, is applied to the monthly carrier spend to produce the monthly fuel cost. The average package weight is used to express the base cost per order on a per-pound basis, which is a useful benchmark when comparing carriers or negotiating rates, because per-pound pricing removes the confusion of order size.</p>
              <p className="text-muted-foreground leading-relaxed mt-4">The Advanced Options section adds the costs that hide outside the carrier invoice. The packaging cost per order covers boxes, poly mailers, void fill, tape, and labels, and is multiplied by the order count. The returns shipped per month captures the cost of shipping returned items back to the warehouse, priced at the base cost per order. Other monthly freight fees catch pickup charges, address correction fees, residential surcharges, and marketplace fees. Summing the carrier spend, fuel, packaging, returns, and other fees gives the total monthly shipping cost, and dividing by the order count gives the fully loaded cost per order, the headline number this calculator produces. With the default inputs, a business spending $45,000 a month on carrier freight across 6,000 orders, with a 6% fuel surcharge, $1.20 of packaging per order, and 450 returns, carries a fully loaded cost of about $10.30 per order against a base of $7.50.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The primary result is the fully loaded cost per order, and the gap between it and the base cost per order is the amount of shipping cost that hides in surcharges, packaging, and returns. If the gap is wide, it is usually worth attacking in order: negotiate the fuel surcharge cap in your carrier contract, switch to lighter or smaller packaging, and reduce return volume through better size guides and product photos. The cost per pound is the metric to use when comparing carrier rate cards, because it normalizes for package size and lets you check whether your negotiated discounts are actually better than the standard rates. Watch the total monthly cost trend, because shipping is one of the first line items to inflate as fuel prices rise and as average order weight creeps up with bigger product bundles. Re-run the calculator after any carrier contract renewal or packaging change, and use the fully loaded figure to set free shipping thresholds that preserve margin rather than silently giving it away.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/shipping-cost-per-order-calculator" />
        </div>
      </div>
    </>
  );
}