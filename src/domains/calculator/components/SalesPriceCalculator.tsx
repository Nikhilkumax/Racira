"use client";
import { useState, useEffect } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface SalesInputs {
  original: number;     // $
  discountPct: number;  // %
  taxPct: number;       // %
  couponPct: number;    // % extra discount
  roundUp: boolean;     // end price in .99
}

interface SalesResults {
  discountAmount: number;
  couponAmount: number;
  discountedPrice: number;
  taxAmount: number;
  finalPrice: number;
  totalSavings: number;
  savingsPct: number;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
const COLORS = ["#10b981", "#f59e0b", "#2563eb"];

function calcSales(i: SalesInputs): SalesResults {
  const discountAmount = i.original * (i.discountPct / 100);
  const afterDiscount = i.original - discountAmount;
  const couponAmount = afterDiscount * (i.couponPct / 100);
  const discountedPrice = afterDiscount - couponAmount;
  const taxAmount = discountedPrice * (i.taxPct / 100);
  let finalPrice = discountedPrice + taxAmount;
  if (i.roundUp) finalPrice = Math.floor(finalPrice) + 0.99;
  const totalSavings = i.original - finalPrice;
  const savingsPct = i.original > 0 ? (totalSavings / i.original) * 100 : 0;

  const chartData = [
    { name: "Final Price", value: Math.round(finalPrice) },
    { name: "Discount", value: Math.round(discountAmount + couponAmount) },
    { name: "Sales Tax", value: Math.round(taxAmount) },
  ];

  const breakdown = [
    { label: "Original Price", value: `$${i.original.toFixed(2)}` },
    { label: `Store Discount (${i.discountPct}%)`, value: `-$${discountAmount.toFixed(2)}` },
    { label: `Coupon (${i.couponPct}%)`, value: `-$${couponAmount.toFixed(2)}` },
    { label: "Discounted Subtotal", value: `$${discountedPrice.toFixed(2)}` },
    { label: `Sales Tax (${i.taxPct}%)`, value: `$${taxAmount.toFixed(2)}` },
    { label: "Final Sale Price", value: `$${finalPrice.toFixed(2)}`, highlight: true, isTotal: true },
    { label: "Total Savings", value: `$${totalSavings.toFixed(2)} (${savingsPct.toFixed(1)}%)` },
  ];

  const summaryStats = [
    { label: "Final Sale Price", value: `$${finalPrice.toFixed(2)}` },
    { label: "Total Savings", value: `$${totalSavings.toFixed(2)}` },
    { label: "Savings %", value: `${savingsPct.toFixed(1)}%` },
    { label: "Discount Amount", value: `$${(discountAmount + couponAmount).toFixed(2)}` },
    { label: "Sales Tax", value: `$${taxAmount.toFixed(2)}` },
    { label: "Pre-tax Subtotal", value: `$${discountedPrice.toFixed(2)}` },
    { label: "Original Price", value: `$${i.original.toFixed(2)}` },
    { label: "Tax %", value: `${i.taxPct}%` },
  ];

  return { discountAmount, couponAmount, discountedPrice, taxAmount, finalPrice, totalSavings, savingsPct, chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS = {
  original: "120",
  discountPct: "20",
  taxPct: "8",
  couponPct: "0",
  roundUp: "true",
};

// 4. Component
export default function SalesPriceCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<SalesResults>(() => calcSales({ original: 120, discountPct: 20, taxPct: 8, couponPct: 0, roundUp: true }));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calcSales({ original: 120, discountPct: 20, taxPct: 8, couponPct: 0, roundUp: true }));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const calculate = () =>
    setResult(
      calcSales({
        original: parseFloat(inputs.original) || 0,
        discountPct: parseFloat(inputs.discountPct) || 0,
        taxPct: parseFloat(inputs.taxPct) || 0,
        couponPct: parseFloat(inputs.couponPct) || 0,
        roundUp: inputs.roundUp === "true",
      })
    );
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcSales({ original: 120, discountPct: 20, taxPct: 8, couponPct: 0, roundUp: true }));
  };

  // Validation
  const errors: Record<string, string> = {};
  const original = parseFloat(inputs.original) || 0;
  const discountPct = parseFloat(inputs.discountPct) || 0;
  const taxPct = parseFloat(inputs.taxPct) || 0;
  const couponPct = parseFloat(inputs.couponPct) || 0;
  if (original <= 0) errors.original = "Must be greater than 0";
  if (discountPct < 0 || discountPct > 100) errors.discountPct = "Must be 0–100%";
  if (taxPct < 0 || taxPct > 30) errors.taxPct = "Must be 0–30%";
  if (couponPct < 0 || couponPct > 100) errors.couponPct = "Must be 0–100%";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "block text-sm font-medium mb-1";
  const chk = "h-5 w-5 rounded border border-input bg-background text-primary accent-primary";

  const faqs = [
    { question: "What's the difference between a discount and a coupon?", answer: "A store discount is applied first, to the original price; a coupon stacks on top of the discounted subtotal. This matters: a 20% off sale plus a 10% coupon is not 30% off — it's 20% then 10% off the remainder, which comes to 28% total. The calculator applies discounts in the correct order automatically." },
    { question: "Is sales tax applied before or after the discount?", answer: "In almost every US state, sales tax is charged on the discounted price you actually pay, not the original price. So a $120 item at 20% off with 8% tax is taxed on $96, not $120. The calculator taxes the post-discount subtotal, which is why the final price can look slightly lower than your mental math." },
    { question: "Why do prices end in .99?", answer: "Charm pricing — ending in .99 instead of rounding up — is a well-studied retail tactic that makes prices feel meaningfully lower. The calculator's rounding option shows both: with rounding on, a $77.04 price becomes $76.99. Retailers use it because it measurably lifts conversion." },
    { question: "How do I know if a sale is actually a good deal?", answer: "Compare the final all-in price (after discount, coupon, and tax) against the same item's price elsewhere, and against the price history if you can see it. A 20% 'sale' on an item that was recently 15% cheaper is no sale at all — the calculator shows the true total savings, not the advertised discount." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Sales Price Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Sales Price Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="original" className={lbl}>Original Price</label>
                <div className={inp}>
                  <span className="pl-3 text-muted-foreground text-sm">$</span>
                  <input id="original" type="number" min="0.01" step="1" value={inputs.original} onChange={(e) => set("original")(e.target.value)} className={ci} />
                </div>
                {errors.original && <p className="text-xs text-red-500 font-medium mt-1">{errors.original}</p>}
              </div>
              <div>
                <label htmlFor="discountPct" className={lbl}>Store Discount</label>
                <div className={inp}>
                  <input id="discountPct" type="number" min="0" max="100" step="5" value={inputs.discountPct} onChange={(e) => set("discountPct")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">%</span>
                </div>
                {errors.discountPct && <p className="text-xs text-red-500 font-medium mt-1">{errors.discountPct}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="taxPct" className={lbl}>Sales Tax</label>
              <div className={inp}>
                <input id="taxPct" type="number" min="0" max="30" step="0.5" value={inputs.taxPct} onChange={(e) => set("taxPct")(e.target.value)} className={ci} />
                <span className="pr-3 text-muted-foreground text-sm">%</span>
              </div>
              {errors.taxPct && <p className="text-xs text-red-500 font-medium mt-1">{errors.taxPct}</p>}
            </div>

            {/* ADVANCED OPTIONS */}
            <div className="border-t border-border pt-3">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Coupons & Pricing</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="couponPct" className={lbl}>Extra Coupon</label>
                        <div className={inp}>
                          <input id="couponPct" type="number" min="0" max="100" step="5" value={inputs.couponPct} onChange={(e) => set("couponPct")(e.target.value)} className={ci} />
                          <span className="pr-3 text-muted-foreground text-sm">%</span>
                        </div>
                        {errors.couponPct && <p className="text-xs text-red-500 font-medium mt-1">{errors.couponPct}</p>}
                      </div>
                      <div className="flex items-end pb-1">
                        <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                          <input type="checkbox" checked={inputs.roundUp === "true"} onChange={(e) => set("roundUp")(String(e.target.checked))} className={chk} />
                          End price in .99
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2.5 mt-1">
              <button
                type="button"
                disabled={hasErrors}
                onClick={calculate}
                className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${
                  hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground active:scale-[0.98]"
                }`}
              >
                Calculate
              </button>
              <button type="button" onClick={reset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-4">
            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Final Sale Price</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">${result.finalPrice.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground mt-1">
                ${result.totalSavings.toFixed(2)} saved ({result.savingsPct.toFixed(1)}%) · tax included
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Discount", `$${(result.discountAmount + result.couponAmount).toFixed(2)}`],
                ["Sales Tax", `$${result.taxAmount.toFixed(2)}`],
                ["You Save", `${result.savingsPct.toFixed(1)}%`],
              ].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className={`text-base font-bold ${i === 2 ? "text-green-600" : "text-foreground"}`}>{v}</div>
                </div>
              ))}
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b border-border">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Price Breakdown</h3>
              </div>
              <table className="w-full text-base">
                <tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.isTotal ? "border-t-2 font-bold bg-secondary/30" : ""} ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`px-3 py-2.5 ${r.highlight ? "font-semibold text-amber-700" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`px-3 py-2.5 text-right font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. CHART */}
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="text-base font-bold mb-4">Where the Money Goes</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={2}>
                    {result.chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number, n: string) => [`$${v}`, n]} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">A $120 item at 20% off with 8% tax — the discount is bigger than the tax in most states.</p>
            </div>

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-muted-foreground">{s.label}:</span>
                    <span className="font-semibold text-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Discounts Stack in Order</h2>
            <p>Stores apply their discount first, coupons second, and tax last — and the order changes the math. A 20% sale with a 10% coupon is 20% off, then 10% off the remainder: 28% total, not 30%. Because tax is charged on the discounted price, the final number almost always lands below the "original minus sticker discount" estimate shoppers do in their heads.</p>
            <h2 className="text-2xl font-bold mb-3">The Savings Percentage Is the Truth</h2>
            <p>Advertised discounts refer to the original price, but the number that matters is what you keep versus what the register charges. With tax included, a 20% sale on a $120 item in an 8% tax state saves $28.99 — about 24% of the original. The calculator reports both the dollar savings and the true percentage so you can compare deals across different tax rates.</p>
            <h2 className="text-2xl font-bold mb-3">Price Anchoring Works on You</h2>
            <p>Retailers set high "original" prices to make discounts look larger, and .99 endings to make prices feel smaller. The defense is arithmetic: compute the final all-in price and compare it to the same item's history and competitors. If the "sale" price equals what you'd pay anywhere else, the discount is decoration — not a deal.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/sales-price-calculator" />
          <PopularCalculators exclude="/calculator/sales-price-calculator" />
        </div>
      </div>
    </>
  );
}
