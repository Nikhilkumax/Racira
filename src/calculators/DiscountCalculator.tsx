"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const DiscountCalculator = () => {
  const DEFAULTS = { original: "120", discount: "25" };
  const [original, setOriginal] = useState(DEFAULTS.original);
  const [discount, setDiscount] = useState(DEFAULTS.discount);
  const [result, setResult] = useState<any>(null);

  const calculate = (origV = original, discV = discount) => {
    const orig = parseFloat(origV), disc = parseFloat(discV);
    if (isNaN(orig) || isNaN(disc) || orig <= 0 || disc < 0 || disc > 100) return;
    const saved = orig * (disc / 100);
    const finalPrice = orig - saved;
    const multiplier = 1 - disc / 100;
    const chartData = [
      { name: "You Pay", value: parseFloat(finalPrice.toFixed(2)) },
      { name: "You Save", value: parseFloat(saved.toFixed(2)) },
    ];
    setResult({
      primary: `$${finalPrice.toFixed(2)}`,
      subtitle: `Save $${saved.toFixed(2)} (${disc}% off $${orig.toFixed(2)})`,
      rows: [
        { label: "Original Price", value: `$${orig.toFixed(2)}` },
        { label: "Discount", value: `${disc}%` },
        { label: "Amount Saved", value: `$${saved.toFixed(2)}` },
        { label: "Final Price", value: `$${finalPrice.toFixed(2)}` },
        { label: "Price Multiplier", value: multiplier.toFixed(4) },
        { label: "Savings Percentage", value: `${disc.toFixed(2)}%` },
      ],
      chartData,
      summary: [
        { label: "Original Price", value: `$${orig.toFixed(2)}` },
        { label: "You Save", value: `$${saved.toFixed(2)} (${disc}%)` },
        { label: "You Pay", value: `$${finalPrice.toFixed(2)}`, border: true, bold: true },
      ],
    });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => { setOriginal(DEFAULTS.original); setDiscount(DEFAULTS.discount); calculate(DEFAULTS.original, DEFAULTS.discount); };

  const COLORS = ["hsl(var(--primary))", "#10b981"];

  const faqs = [
    { question: "How do I calculate a discount?", answer: "Discount amount = Original Price × (Discount % / 100). Final price = Original Price − Discount Amount. For 25% off $120: save $30, pay $90." },
    { question: "What is a price multiplier?", answer: "The price multiplier = 1 − (discount/100). Multiply the original price by this to get the final price. For 25% off: 0.75 × $120 = $90." },
    { question: "How do I calculate the original price from a discounted price?", answer: "Original Price = Final Price / (1 − discount/100). If an item costs $90 after a 25% discount: $90 / 0.75 = $120." },
    { question: "How do I stack multiple discounts?", answer: "Apply them sequentially, not additively. A 20% discount then a 10% discount = 1 − (0.8 × 0.9) = 28% total, not 30%. The order doesn't matter, but stacking is not simply additive." },
    { question: "What is the difference between markdown and discount?", answer: "A markdown reduces the retail price permanently. A discount is typically a temporary price reduction or coupon. Both use the same percentage-off calculation." },
    { question: "How does sales tax interact with discounts?", answer: "Apply the discount first, then add sales tax on the discounted price. For $120 with 25% discount and 8% tax: $90 × 1.08 = $97.20 final price." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Discount Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Discount Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px] mx-auto">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Original Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input type="number" value={original} onChange={e => setOriginal(e.target.value)}
                  className="h-10 w-full pl-7 pr-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="120" min="0" step="any" />
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Discount Percentage</label>
              <div className="relative">
                <input type="number" value={discount} onChange={e => setDiscount(e.target.value)}
                  className="h-10 w-full pl-3 pr-8 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="25" min="0" max="100" step="any" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => calculate()} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">
                <Calculator className="w-4 h-4" /> Calculate
              </button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Final Price</div>
                <div className="text-4xl font-bold text-primary">{result.primary}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.subtitle}</div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.rows?.map((r: any, i: number) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              {result.chartData && (
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-semibold mb-3">Price Split</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={result.chartData} cx="50%" cy="50%" outerRadius={85} dataKey="value"
                        label={({ name, value }: any) => `${name}: $${value}`}>
                        {result.chartData.map((_: any, i: number) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: any) => [`$${v}`, ""]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-base font-semibold mb-4">Summary</h3>
                <div className="space-y-3">
                  {result.summary?.map((s: any, i: number) => (
                    <div key={i} className={`flex justify-between text-base ${s.border ? "border-t pt-3" : ""}`}>
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className={`font-medium ${s.bold ? "font-bold text-primary" : ""}`}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto mt-10">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
            <h2>What Is a Discount Calculator?</h2>
            <p>A discount calculator computes the final price after applying a percentage discount to an original price. Enter the original price and discount percentage — the calculator instantly shows how much you save and what you actually pay. Pre-filled with a $120 item at 25% off, you immediately see the $30 savings and $90 final price, plus a pie chart showing the split between what you pay and what you save.</p>
            <p>Discount calculations are used everywhere: retail shopping, wholesale pricing, coupon redemption, seasonal sales, restaurant tipping (reverse), contractor pricing, and eCommerce. This calculator also shows the price multiplier — a quick way to mentally compute discounts on any price at the same percentage.</p>
            <h2>How Discount Is Calculated</h2>
            <p><strong>Discount Amount = Original Price × (Discount % / 100)</strong></p>
            <p><strong>Final Price = Original Price − Discount Amount</strong></p>
            <p><strong>Price Multiplier = 1 − (Discount % / 100)</strong></p>
            <p>For 25% off $120: Discount = $120 × 0.25 = $30. Final Price = $120 − $30 = $90. Multiplier = 0.75. So any item at 25% off costs exactly 75% of the original price. Once you know the multiplier, you can mentally calculate any price: $200 × 0.75 = $150.</p>
            <h2>Reverse Discount: Finding Original Price</h2>
            <p>If you know the discounted price and the percentage off, find the original: Original = Final Price / (1 − Discount%). If a jacket costs $75 after a 40% discount: $75 / 0.60 = $125 original price. This is useful when a "sale tag" shows the final price but you want to verify the claimed discount.</p>
            <h2>Stacking Multiple Discounts</h2>
            <p>Multiple discounts do not add up linearly. A 20% discount followed by a 10% discount results in a 28% total discount, not 30%. The math: (1 − 0.20) × (1 − 0.10) = 0.80 × 0.90 = 0.72, meaning you pay 72% of the original (28% off). Retailers often advertise "20% off, plus an extra 10% off" to make the deal sound better than it is — the actual total is less than 30%.</p>
            <h2>Discount with Sales Tax</h2>
            <p>Apply the discount before calculating tax. For $120 at 25% off with 8% sales tax: Final Price = ($120 × 0.75) × 1.08 = $90 × 1.08 = $97.20. If tax is applied to the original price first: $120 × 1.08 = $129.60, then 25% off = $97.20. In practice, tax is applied to the post-discount price in most jurisdictions — the results are identical mathematically but the order matters for clarity.</p>
            <h2>Common Discount Percentages Reference</h2>
            <p>10% off: pay 90%, multiply by 0.90. 15% off: pay 85%, multiply by 0.85. 20% off: pay 80%, multiply by 0.80. 25% off: pay 75%, multiply by 0.75. 30% off: pay 70%, multiply by 0.70. 50% off: pay 50%, multiply by 0.50. 75% off: pay 25%, multiply by 0.25.</p>
            <h2>Tips for Using This Calculator</h2>
            <p>The pie chart visually splits the original price into "you pay" and "you save" segments — useful for quickly seeing the proportion at a glance. For markup instead of discount (increasing a price by a percentage), use the <a href="/calculator/markup-calculator">markup calculator</a>. To calculate sales tax on top of a discounted price, use the <a href="/calculator/sales-tax-calculator">sales tax calculator</a>.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/discount-calculator" />
          <PopularCalculators exclude="/calculator/discount-calculator" />
        </div>
      </div>
    </>
  );
};
export default DiscountCalculator;
