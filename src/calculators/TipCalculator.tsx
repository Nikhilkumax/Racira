"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import PieChart from "@/components/calculator/PieChart";
import { RotateCcw } from "lucide-react";

const TipCalculator = () => {
  const [billAmount, setBillAmount] = useState("85.00");
  const [tipPercent, setTipPercent] = useState("18");
  const [numPeople, setNumPeople] = useState("2");
  const [roundUp, setRoundUp] = useState(false);

  const [results, setResults] = useState<{
    tipAmount: number;
    totalBill: number;
    perPersonBill: number;
    perPersonTip: number;
    roundedTotal: number;
    roundedTip: number;
  } | null>(null);
  const [showResults, setShowResults] = useState(false);

  const tipPresets = [10, 15, 18, 20, 25];

  const handleCalculate = () => {
    setShowResults(true);
    const bill = parseFloat(billAmount) || 0;
    const tip = parseFloat(tipPercent) || 0;
    const people = Math.max(1, parseInt(numPeople) || 1);

    const tipAmount = bill * (tip / 100);
    const totalBill = bill + tipAmount;
    const perPersonBill = totalBill / people;
    const perPersonTip = tipAmount / people;
    const roundedTotal = Math.ceil(totalBill / people) * people;
    const roundedTip = roundedTotal - bill;

    setResults({ tipAmount, totalBill, perPersonBill, perPersonTip, roundedTotal, roundedTip });
  };

  const reset = () => {
    setShowResults(false);
    setBillAmount("85.00");
    setTipPercent("18");
    setNumPeople("2");
    setRoundUp(false);
    setResults(null);
  };

  const faqs = [
    { question: "What is the standard tip percentage in the US?", answer: "The standard tip in the US ranges from 15% to 20% for restaurant service. 15% is considered the minimum for acceptable service, 18% is standard, 20% is good, and 25% or more is for exceptional service. For other services like taxis and hotel staff, 10–15% is typical." },
    { question: "How is a tip calculated?", answer: "A tip is calculated by multiplying the pre-tax bill amount by the tip percentage. For example, if your bill is $80 and you want to tip 20%, multiply $80 × 0.20 = $16 tip. Add the tip to the bill for a total of $96." },
    { question: "Should I tip on the pre-tax or post-tax amount?", answer: "Tipping on the pre-tax amount is technically correct, but most people tip on the total (post-tax) amount for simplicity. The difference is minimal — on a $100 bill with 8% tax, you'd tip $0.80 more by tipping on the post-tax amount at 15%." },
    { question: "How do I split a bill evenly with a tip?", answer: "Add the tip to the bill total first, then divide by the number of people. For example, a $120 bill with 20% tip = $144 total ÷ 4 people = $36 per person. Our calculator handles all of this automatically." },
    { question: "What if some people ordered more expensive items?", answer: "For unequal orders, it's fairest to split the bill based on what each person ordered. Add each person's items, apply tip proportionally, and have each person pay their share. Our calculator handles even splits; for unequal splits, calculate each person's share individually." },
    { question: "Do I tip on alcohol?", answer: "Yes, tip applies to the full bill including alcoholic beverages. Bartenders typically expect 15–20% on drink orders as well. If someone is just having drinks at a bar, $1–2 per drink or 20% of the tab is standard." },
    { question: "How much do I tip for food delivery?", answer: "For food delivery, tip 15–20% of the order total or at least $3–5 minimum. Larger orders, bad weather, or long distances warrant higher tips. The delivery driver relies on tips as a significant portion of their income." },
    { question: "Is tip calculated before or after discounts?", answer: "Tip should be calculated on the original (pre-discount) bill amount to properly compensate the server for their full service. If you have a coupon or discount card, the tip should reflect what the meal would have cost without the discount." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Tip Calculator" }]} />

      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Tip Calculator</h1>
            <p className="text-muted-foreground mb-8">Calculate tip amount, total bill, and per-person split instantly. Choose from preset tip percentages or enter a custom amount.</p>

            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="bill-amount" label="Bill Amount" value={billAmount} onChange={setBillAmount} prefix="$" tooltip="Enter the subtotal before tax and tip." />
                <div>
                  <label className="flex items-center text-sm font-medium text-foreground mb-1.5">Tip Percentage</label>
                  <div className="flex gap-2 mb-2">
                    {tipPresets.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setTipPercent(String(p))}
                        className={`flex-1 py-2 text-xs font-medium rounded-md border transition-colors ${tipPercent === String(p) ? "bg-accent text-accent-foreground border-accent" : "border-border text-muted-foreground hover:bg-secondary"}`}
                      >
                        {p}%
                      </button>
                    ))}
                  </div>
                  <input
                    id="tip-percent"
                    type="number"
                    value={tipPercent}
                    onChange={(e) => setTipPercent(e.target.value)}
                    className="input-calc"
                    placeholder="Custom %"
                    aria-label="Tip percentage"
                  />
                </div>
                <InputField id="num-people" label="Number of People" value={numPeople} onChange={setNumPeople} tooltip="Number of people splitting the bill." min="1" step="1" />
                <div className="flex items-center gap-3 pt-6">
                  <input
                    id="round-up"
                    type="checkbox"
                    checked={roundUp}
                    onChange={(e) => setRoundUp(e.target.checked)}
                    className="h-4 w-4 rounded border-border"
                  />
                  <label htmlFor="round-up" className="text-sm font-medium text-foreground">Round up per person</label>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate Tip</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
            </div>

            {showResults && results && (
              <div className="card-calculator mb-8">
                <h2 className="text-xl font-bold mb-4">Tip Results</h2>

                <ResultDisplay items={[
                  { label: "Tip Amount", value: results.tipAmount, highlight: true },
                  { label: "Total Bill", value: results.totalBill, highlight: true },
                  { label: "Per Person", value: results.perPersonBill },
                  { label: "Tip Per Person", value: results.perPersonTip },
                ]} />

                {roundUp && (
                  <div className="mt-4 p-4 rounded-lg bg-accent/5 border border-accent/20">
                    <h3 className="font-semibold text-foreground mb-2">Rounded Up Per Person</h3>
                    <ResultDisplay items={[
                      { label: "Per Person (Rounded)", value: Math.ceil(results.perPersonBill), highlight: true },
                      { label: "Total Tip (Rounded)", value: results.roundedTip },
                    ]} />
                  </div>
                )}

                <div className="mt-6 flex justify-center">
                  <PieChart
                    segments={[
                      { label: "Bill", value: parseFloat(billAmount) || 0, color: "hsl(211, 100%, 50%)" },
                      { label: "Tip", value: results.tipAmount, color: "hsl(220, 60%, 30%)" },
                    ]}
                    size={180}
                  />
                </div>

                {/* Tip Reference Table */}
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Tip Reference Table</h3>
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-secondary text-foreground">
                          <th className="px-3 py-2 text-left font-medium">Tip %</th>
                          <th className="px-3 py-2 text-right font-medium">Tip Amount</th>
                          <th className="px-3 py-2 text-right font-medium">Total</th>
                          <th className="px-3 py-2 text-right font-medium">Per Person</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[10, 15, 18, 20, 25].map((p) => {
                          const bill = parseFloat(billAmount) || 0;
                          const people = Math.max(1, parseInt(numPeople) || 1);
                          const t = bill * (p / 100);
                          const total = bill + t;
                          return (
                            <tr key={p} className={`border-t border-border hover:bg-secondary/30 ${p === parseFloat(tipPercent) ? "bg-accent/10" : ""}`}>
                              <td className="px-3 py-2 text-muted-foreground font-medium">{p}%</td>
                              <td className="px-3 py-2 text-right">${t.toFixed(2)}</td>
                              <td className="px-3 py-2 text-right">${total.toFixed(2)}</td>
                              <td className="px-3 py-2 text-right font-medium">${(total / people).toFixed(2)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            <AdPlaceholder className="mb-10" label="Ad Space – In Content" />

            <article className="prose-finance">
              <h2>What Is a Tip Calculator?</h2>
              <p>A tip calculator is a simple but essential tool that helps you determine the appropriate gratuity to add to a bill at restaurants, bars, salons, hotels, and other service establishments. Instead of doing mental math or guessing, you can input the bill total, select a tip percentage, and instantly see how much to tip — along with the split-per-person amount when dining in groups.</p>
              <p>Our advanced tip calculator goes beyond the basics by offering preset tip percentages (10%, 15%, 18%, 20%, 25%), a reference table showing all common tip amounts simultaneously, and a rounding feature for easy cash payments when splitting bills.</p>

              <h2>How Is a Tip Calculated?</h2>
              <p>The tip calculation formula is straightforward:</p>
              <ul>
                <li><strong>Tip Amount</strong> = Bill Amount × (Tip Percentage ÷ 100)</li>
                <li><strong>Total Bill</strong> = Bill Amount + Tip Amount</li>
                <li><strong>Per Person</strong> = Total Bill ÷ Number of People</li>
              </ul>
              <p>For example, if your restaurant bill is $95.00 and you want to leave an 18% tip: Tip = $95.00 × 0.18 = $17.10. Total = $95.00 + $17.10 = $112.10. Split between 3 people = $37.37 each.</p>

              <h2>How to Use This Tip Calculator</h2>
              <p>Using our tip calculator takes just seconds. Enter the bill amount, select your desired tip percentage (or enter a custom percentage), specify how many people are splitting the bill, and click Calculate. You'll instantly see the tip amount, total bill, and per-person share. The reference table also shows you all standard tip percentages at once for easy comparison.</p>

              <h2>Tipping Etiquette by Service Type</h2>
              <p>Tipping customs vary significantly by service type and location. In the United States, tipping is customary and expected in most service industries:</p>
              <ul>
                <li><strong>Restaurants:</strong> 15–20% for table service; 15% minimum for acceptable service</li>
                <li><strong>Bars:</strong> $1–2 per drink or 15–20% of the tab</li>
                <li><strong>Food delivery:</strong> 15–20%, minimum $3–5</li>
                <li><strong>Taxis and rideshares:</strong> 15–20% of the fare</li>
                <li><strong>Hair salons and spas:</strong> 15–20% of the service cost</li>
                <li><strong>Hotel housekeeping:</strong> $2–5 per night</li>
                <li><strong>Valet parking:</strong> $2–5 when retrieving your car</li>
              </ul>

              <h2>Example Scenario</h2>
              <p>You and three friends go out for dinner. The bill comes to $168.40 before tax. You decide to tip 20% for excellent service. Tip = $168.40 × 0.20 = $33.68. Total = $168.40 + $33.68 = $202.08. Split four ways = $50.52 per person. If you want to round up for easy payment, each person pays $51, making the total $204 and the effective tip rate about 21.2%.</p>

              <h2>Tips for Splitting the Bill Fairly</h2>
              <p>When dining with a group, consider these approaches for fair bill splitting. For similar orders, splitting evenly (with our calculator) is simplest. For significantly different orders, ask your server to split the check. If someone ordered alcohol and others didn't, calculate separately. Some groups use apps like Splitwise to track shared expenses. Always round up rather than down — it's better for the server and avoids awkward change.</p>
            </article>

            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/tip-calculator" />
            <PopularCalculators exclude="/calculator/tip-calculator" />
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

export default TipCalculator;

