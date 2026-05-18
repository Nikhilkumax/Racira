"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

type CalcMode = "discount" | "reverse" | "compare";

const DiscountCalculator = () => {
  const [mode, setMode] = useState<CalcMode>("discount");

  // Mode 1: Standard Discount
  const [originalPrice, setOriginalPrice] = useState("100");
  const [discountPercent, setDiscountPercent] = useState("20");

  // Mode 2: Reverse (find original price)
  const [salePrice, setSalePrice] = useState("80");
  const [reverseDiscount, setReverseDiscount] = useState("20");

  // Mode 3: Compare two discounts
  const [comparePrice, setComparePrice] = useState("100");
  const [discount1, setDiscount1] = useState("20");
  const [discount2, setDiscount2] = useState("30");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    if (mode === "discount") {
      const orig = parseFloat(originalPrice) || 0;
      const pct = parseFloat(discountPercent) || 0;
      const savings = orig * (pct / 100);
      const final = orig - savings;
      setResults({
        mode,
        savings,
        finalPrice: final,
        originalPrice: orig,
        discountPercent: pct,
        taxAt8: final * 1.08,
        taxAt10: final * 1.10,
      });
    } else if (mode === "reverse") {
      const sale = parseFloat(salePrice) || 0;
      const pct = parseFloat(reverseDiscount) || 0;
      const orig = pct < 100 ? sale / (1 - pct / 100) : 0;
      const savings = orig - sale;
      setResults({ mode, originalPrice: orig, salePrice: sale, savings, discountPercent: pct });
    } else {
      const price = parseFloat(comparePrice) || 0;
      const d1 = parseFloat(discount1) || 0;
      const d2 = parseFloat(discount2) || 0;
      const final1 = price * (1 - d1 / 100);
      const final2 = price * (1 - d2 / 100);
      const savings1 = price - final1;
      const savings2 = price - final2;
      setResults({ mode, price, d1, d2, final1, final2, savings1, savings2, diff: Math.abs(savings2 - savings1) });
    }
  };

  const reset = () => {
    setShowResults(false);
    setOriginalPrice("100"); setDiscountPercent("20");
    setSalePrice("80"); setReverseDiscount("20");
    setComparePrice("100"); setDiscount1("20"); setDiscount2("30");
    setResults(null);
  };

  const faqs = [
    { question: "How is a discount calculated?", answer: "A discount is calculated by multiplying the original price by the discount percentage (divided by 100). For example, a 25% discount on a $200 item = $200 × 0.25 = $50 savings. The final price is $200 − $50 = $150. Our calculator also shows taxes on the discounted price." },
    { question: "What does 'original price before discount' mean?", answer: "The original price (before discount) is the full retail or list price of an item before any markdown is applied. The discounted price (sale price) is what you actually pay after the discount is subtracted. Our reverse calculator can find the original price if you only know the sale price and discount percentage." },
    { question: "How do I calculate the original price from a sale price?", answer: "If you know the sale price and the discount percentage, the original price = Sale Price ÷ (1 − Discount/100). For example, if an item is on sale for $75 after a 25% discount, the original price = $75 ÷ 0.75 = $100. Our reverse mode handles this automatically." },
    { question: "What is the difference between a 30% discount and a 30% markup?", answer: "A 30% discount reduces the original price by 30%. A 30% markup increases the cost price by 30%. They are not equivalent — a 30% markup followed by a 30% discount does NOT return you to the original price. The markup is applied to cost; the discount is applied to the marked-up (retail) price." },
    { question: "Are stacked discounts additive?", answer: "Stacked discounts are multiplicative, not additive. A 20% discount followed by an additional 10% discount is NOT the same as a 30% discount. If an item costs $100, after 20% off you get $80, then 10% off $80 = $72. This is equivalent to a 28% total discount, not 30%." },
    { question: "How do I calculate the discount percentage from two prices?", answer: "Discount % = ((Original Price − Sale Price) ÷ Original Price) × 100. If an item was $150 and is now $105, the discount = (($150 − $105) ÷ $150) × 100 = ($45 ÷ $150) × 100 = 30%." },
    { question: "What is a good discount percentage?", answer: "What constitutes a 'good' discount depends on the product category. For clothing, 20–40% off is common during sales. Electronics rarely drop below 10–15% from retail. Furniture and appliances often see 25–40% discounts. Flash sales can offer 50–80% off, though the 'original' price may be inflated." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Discount Calculator" }]} />

      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Discount Calculator</h1>
            <p className="text-muted-foreground mb-8">Calculate sale price, savings amount, and original price before discount. Supports reverse calculation and discount comparison.</p>

            <div className="card-calculator mb-8">
              {/* Mode Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-1.5">Calculation Mode</label>
                <div className="flex rounded-lg border border-input overflow-hidden">
                  {(["discount", "reverse", "compare"] as CalcMode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => { setMode(m); setResults(null); }}
                      className={`flex-1 py-3 text-sm font-medium transition-colors capitalize ${mode === m ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"}`}
                    >
                      {m === "discount" ? "Standard" : m === "reverse" ? "Find Original" : "Compare"}
                    </button>
                  ))}
                </div>
              </div>

              {mode === "discount" && (
                <div className="grid sm:grid-cols-2 gap-5 mb-6">
                  <InputField id="orig-price" label="Original Price" value={originalPrice} onChange={setOriginalPrice} prefix="$" tooltip="The full retail price before the discount." />
                  <InputField id="disc-pct" label="Discount Percentage" value={discountPercent} onChange={setDiscountPercent} suffix="%" tooltip="The percentage off the original price." />
                </div>
              )}

              {mode === "reverse" && (
                <div className="grid sm:grid-cols-2 gap-5 mb-6">
                  <InputField id="sale-price" label="Sale Price (You Pay)" value={salePrice} onChange={setSalePrice} prefix="$" tooltip="The discounted price you pay." />
                  <InputField id="rev-disc" label="Discount Applied" value={reverseDiscount} onChange={setReverseDiscount} suffix="%" tooltip="The discount percentage that was applied." />
                </div>
              )}

              {mode === "compare" && (
                <div className="grid sm:grid-cols-3 gap-5 mb-6">
                  <InputField id="cmp-price" label="Original Price" value={comparePrice} onChange={setComparePrice} prefix="$" tooltip="The full price before either discount." />
                  <InputField id="disc1" label="Discount 1" value={discount1} onChange={setDiscount1} suffix="%" tooltip="First discount percentage to compare." />
                  <InputField id="disc2" label="Discount 2" value={discount2} onChange={setDiscount2} suffix="%" tooltip="Second discount percentage to compare." />
                </div>
              )}

              {/* Quick Discount Presets */}
              {mode === "discount" && (
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="text-xs text-muted-foreground self-center">Quick:</span>
                  {[5, 10, 15, 20, 25, 30, 40, 50].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setDiscountPercent(String(p))}
                      className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${discountPercent === String(p) ? "bg-accent text-accent-foreground border-accent" : "border-border text-muted-foreground hover:bg-secondary"}`}
                    >
                      {p}% off
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
            </div>

            {showResults && results && (
              <div className="card-calculator mb-8">
                <h2 className="text-xl font-bold mb-4">Results</h2>

                {results.mode === "discount" && (
                  <>
                    <ResultDisplay items={[
                      { label: "You Save", value: results.savings, highlight: true },
                      { label: "Sale Price", value: results.finalPrice, highlight: true },
                      { label: "Original Price", value: results.originalPrice },
                      { label: "Sale + 8% Tax", value: results.taxAt8 },
                      { label: "Sale + 10% Tax", value: results.taxAt10 },
                    ]} />

                    {/* Savings breakdown table */}
                    <div className="mt-6">
                      <h3 className="text-sm font-semibold text-foreground mb-3">Savings at Different Discounts</h3>
                      <div className="overflow-x-auto rounded-lg border border-border">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-secondary text-foreground">
                              <th className="px-3 py-2 text-left font-medium">Discount</th>
                              <th className="px-3 py-2 text-right font-medium">You Save</th>
                              <th className="px-3 py-2 text-right font-medium">You Pay</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[5, 10, 15, 20, 25, 30, 40, 50].map((p) => {
                              const savings = results.originalPrice * (p / 100);
                              const final = results.originalPrice - savings;
                              return (
                                <tr key={p} className={`border-t border-border hover:bg-secondary/30 ${p === results.discountPercent ? "bg-accent/10 font-semibold" : ""}`}>
                                  <td className="px-3 py-2 text-muted-foreground">{p}% off</td>
                                  <td className="px-3 py-2 text-right text-primary">${savings.toFixed(2)}</td>
                                  <td className="px-3 py-2 text-right">${final.toFixed(2)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}

                {results.mode === "reverse" && (
                  <ResultDisplay items={[
                    { label: "Original Price", value: results.originalPrice, highlight: true },
                    { label: "Sale Price", value: results.salePrice },
                    { label: "Amount Saved", value: results.savings, highlight: true },
                    { label: "Discount Applied", value: 0, textValue: `${results.discountPercent}%` },
                  ]} />
                )}

                {results.mode === "compare" && (
                  <>
                    <div className="overflow-x-auto rounded-lg border border-border mb-4">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-secondary text-foreground">
                            <th className="px-3 py-2 text-left font-medium">Metric</th>
                            <th className="px-3 py-2 text-right font-medium">{results.d1}% Discount</th>
                            <th className="px-3 py-2 text-right font-medium">{results.d2}% Discount</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-t border-border">
                            <td className="px-3 py-2 text-muted-foreground">Final Price</td>
                            <td className="px-3 py-2 text-right">${results.final1.toFixed(2)}</td>
                            <td className="px-3 py-2 text-right font-semibold text-primary">${results.final2.toFixed(2)}</td>
                          </tr>
                          <tr className="border-t border-border">
                            <td className="px-3 py-2 text-muted-foreground">You Save</td>
                            <td className="px-3 py-2 text-right">${results.savings1.toFixed(2)}</td>
                            <td className="px-3 py-2 text-right font-semibold text-primary">${results.savings2.toFixed(2)}</td>
                          </tr>
                          <tr className="border-t border-border bg-accent/5">
                            <td className="px-3 py-2 font-medium text-foreground">Extra Savings</td>
                            <td className="px-3 py-2 text-right" colSpan={2}>
                              <span className="font-bold text-primary">${results.diff.toFixed(2)}</span> more with {results.d2}% discount
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}

            <AdPlaceholder className="mb-10" label="Ad Space – In Content" />

            <article className="prose-finance">
              <h2>What Is a Discount Calculator?</h2>
              <p>A discount calculator helps you quickly determine the sale price of an item after a percentage discount is applied, how much money you save, and — in reverse mode — what the original price was before a discount. Whether you're shopping online, comparing sales prices, or doing retail math, this calculator handles all the arithmetic instantly.</p>
              <p>Our advanced discount calculator offers three modes: standard discount (original price + percentage off = sale price), reverse calculation (find original price from sale price and discount), and comparison mode to evaluate two different discount offers side by side.</p>

              <h2>How Discounts Are Calculated</h2>
              <p>The standard discount formula is: <strong>Sale Price = Original Price × (1 − Discount Rate)</strong>, where the discount rate is the percentage divided by 100. The savings amount = Original Price × Discount Rate.</p>
              <p>For reverse calculation (finding the original price): <strong>Original Price = Sale Price ÷ (1 − Discount Rate)</strong>. This is useful when you see a "20% off" sale price and want to verify the original cost.</p>

              <h2>How to Use This Calculator</h2>
              <p>Select Standard mode to calculate the final price and savings from an original price and discount percentage. Use Find Original mode when you know only the sale price and discount applied. Compare mode lets you evaluate two discount amounts simultaneously to find the better deal. Quick preset buttons allow single-click selection of common discount rates like 10%, 20%, 30%, or 50% off.</p>

              <h2>Understanding Stacked Discounts</h2>
              <p>When retailers offer stacked discounts (e.g., "20% off, plus an additional 10% off"), the discounts are applied sequentially, not additively. A 20% discount followed by 10% off is NOT a 30% discount. Starting at $100: after 20% off = $80, then 10% off $80 = $72. This is a 28% total discount, not 30%. Our calculator shows each discount level's exact savings for comparison.</p>

              <h2>Example Scenario</h2>
              <p>You're buying a jacket originally priced at $250. The store is offering 35% off. Discount amount = $250 × 0.35 = $87.50. Sale price = $250 − $87.50 = $162.50. With 8% sales tax, you'd pay $162.50 × 1.08 = $175.50 total. Compared to a nearby store offering 25% off the same jacket ($187.50 before tax), you save an additional $25 by going with the 35% off deal.</p>

              <h2>Tips for Getting the Best Deal</h2>
              <p>Always verify the "original" price before assuming a discount is genuine — some retailers inflate the original price to make the discount appear larger than it is. Compare across multiple stores using our calculator. Look for seasonal sales (Black Friday, end-of-season) for the deepest legitimate discounts. Stack coupons with existing sales where stores allow it. Use cashback credit cards on top of discounts for maximum savings.</p>
            </article>

            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/discount-calculator" />
            <PopularCalculators exclude="/calculator/discount-calculator" />
          </div>

          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[250px]" label="Ad Space – Sidebar" />
            <AdPlaceholder className="min-h-[250px]" label="Ad Space – Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default DiscountCalculator;

