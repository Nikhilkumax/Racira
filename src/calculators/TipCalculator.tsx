"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const TipCalculator = () => {
  const DEFAULTS = { bill: "85", tipPct: "18", people: "4" };
  const [bill, setBill] = useState(DEFAULTS.bill);
  const [tipPct, setTipPct] = useState(DEFAULTS.tipPct);
  const [people, setPeople] = useState(DEFAULTS.people);
  const [result, setResult] = useState<any>(null);

  const calculate = (bV = bill, tV = tipPct, pV = people) => {
    const b = parseFloat(bV), t = parseFloat(tV), p = parseFloat(pV);
    if (isNaN(b) || isNaN(t) || isNaN(p) || b <= 0 || p < 1) return;
    const tipAmt = b * (t / 100);
    const total = b + tipAmt;
    const perPerson = total / p;
    const tipPerPerson = tipAmt / p;
    const billPerPerson = b / p;
    const chartData = [
      { name: "Bill", value: parseFloat(b.toFixed(2)) },
      { name: "Tip", value: parseFloat(tipAmt.toFixed(2)) },
    ];
    setResult({
      primary: `$${total.toFixed(2)}`,
      subtitle: `$${b.toFixed(2)} bill + $${tipAmt.toFixed(2)} tip (${t}%) for ${p} ${p === 1 ? "person" : "people"}`,
      rows: [
        { label: "Bill Amount", value: `$${b.toFixed(2)}` },
        { label: "Tip Percentage", value: `${t}%` },
        { label: "Tip Amount", value: `$${tipAmt.toFixed(2)}` },
        { label: "Total Bill", value: `$${total.toFixed(2)}` },
        { label: "Number of People", value: p },
        { label: "Bill per Person", value: `$${billPerPerson.toFixed(2)}` },
        { label: "Tip per Person", value: `$${tipPerPerson.toFixed(2)}` },
        { label: "Total per Person", value: `$${perPerson.toFixed(2)}` },
      ],
      chartData,
      summary: [
        { label: "Tip Amount", value: `$${tipAmt.toFixed(2)}` },
        { label: "Total Bill", value: `$${total.toFixed(2)}` },
        { label: "Per Person", value: `$${perPerson.toFixed(2)}`, border: true, bold: true },
      ],
    });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => { setBill(DEFAULTS.bill); setTipPct(DEFAULTS.tipPct); setPeople(DEFAULTS.people); calculate(DEFAULTS.bill, DEFAULTS.tipPct, DEFAULTS.people); };

  const COLORS = ["hsl(var(--primary))", "#10b981"];
  const quickTips = [10, 15, 18, 20, 25];

  const faqs = [
    { question: "How do I calculate a tip?", answer: "Tip Amount = Bill × (Tip% / 100). Total = Bill + Tip. For 18% on $85: Tip = $85 × 0.18 = $15.30. Total = $100.30." },
    { question: "What is a standard tip percentage?", answer: "Standard restaurant tips: 15% = adequate service, 18% = good service, 20% = great service, 25%+ = exceptional service. For takeout, 10–15% is customary. Tip before tax in most guidance." },
    { question: "Should I tip on the pre-tax or post-tax amount?", answer: "Etiquette guides suggest tipping on the pre-tax bill, as servers don't benefit from the taxes. However, many people find it simpler to tip on the total. The difference is small — on a $100 pre-tax bill with 8% tax, the tip difference is about $1.60." },
    { question: "How do I split a bill evenly?", answer: "Per person = (Bill + Tip) / Number of People. This calculator shows both the total per person and the breakdown of bill vs tip per person for transparency when splitting." },
    { question: "Is there a quick mental math trick for tips?", answer: "For 20%: move the decimal left one place then double it. $85 → $8.50 × 2 = $17. For 15%: find 10% ($8.50) and add half ($4.25) = $12.75. For 18%: find 20% and subtract 10% of that: $17 − $1.70 = $15.30." },
    { question: "How much do I tip for different services?", answer: "Restaurants: 15–25%. Delivery: 10–20% (minimum $3–5). Hair/beauty: 15–20%. Taxi/rideshare: 15–20%. Hotel housekeeping: $2–5/night. Bartender: $1–2/drink or 15–20%." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Tip Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Tip Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px] mx-auto">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Bill Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input type="number" value={bill} onChange={e => setBill(e.target.value)}
                  className="h-10 w-full pl-7 pr-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="85" min="0" step="0.01" />
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Tip Percentage</label>
              <div className="flex gap-2 mb-2">
                {quickTips.map(t => (
                  <button key={t} onClick={() => { setTipPct(String(t)); calculate(bill, String(t), people); }}
                    className={`flex-1 h-9 rounded-md border text-sm font-medium transition-colors ${tipPct === String(t) ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>
                    {t}%
                  </button>
                ))}
              </div>
              <div className="relative">
                <input type="number" value={tipPct} onChange={e => setTipPct(e.target.value)}
                  className="h-10 w-full pl-3 pr-8 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="18" min="0" step="1" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Number of People</label>
              <input type="number" value={people} onChange={e => setPeople(e.target.value)}
                className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="4" min="1" step="1" />
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
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Total Bill</div>
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
                  <h3 className="text-base font-semibold mb-3">Bill vs Tip Split</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={result.chartData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                        label={({ name, value }: any) => `${name}: $${value}`}>
                        {result.chartData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
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
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is a Tip Calculator?</h2>
            <p>A tip calculator instantly computes the tip amount and total bill for any service, with easy bill splitting for groups. Pre-filled with an $85 restaurant bill at 18% tip split 4 ways, it shows a $15.30 tip ($100.30 total) with each person paying $25.08. Quick-select buttons for 10%, 15%, 18%, 20%, and 25% match the most common tipping conventions, and you can enter any custom percentage.</p>
            <p>Tip calculators are essential for dining out, managing group expenses, calculating service charges for delivery and rideshare, and understanding tipping conventions across different service industries. This calculator also shows the per-person breakdown of bill and tip separately — useful when some people in a group ordered more expensive dishes and want to split proportionally.</p>
            <h2>The Tip Formula</h2>
            <p><strong>Tip Amount = Bill × (Tip% / 100)</strong></p>
            <p><strong>Total = Bill + Tip Amount</strong></p>
            <p><strong>Per Person = Total / Number of People</strong></p>
            <p>For $85 at 18%: Tip = $85 × 0.18 = $15.30. Total = $100.30. For 4 people: $100.30 / 4 = $25.08 each. Each person contributes $21.25 toward the bill and $3.83 toward the tip.</p>
            <h2>Standard Tipping Guidelines</h2>
            <p>Tipping customs vary significantly by country and service type. In the US, restaurant tipping is expected and forms a substantial part of server income. <strong>10%:</strong> Below expectations — typically for poor service. <strong>15%:</strong> Adequate service minimum. <strong>18%:</strong> Standard for good service — the most common benchmark. <strong>20%:</strong> Excellent service — increasingly considered the standard minimum. <strong>25%+:</strong> Exceptional service or high-end establishments.</p>
            <h2>Mental Math Tip Tricks</h2>
            <p><strong>20% tip:</strong> Move the decimal left one place, then double. $85 → $8.50 × 2 = $17.00. <strong>15% tip:</strong> Find 10% then add half. $85: 10% = $8.50, half = $4.25, total = $12.75. <strong>18% tip:</strong> Find 20% then subtract 10% of that. $85: 20% = $17, 10% of $17 = $1.70, subtract: $15.30. These mental shortcuts work for any bill amount once you get comfortable with decimal movement.</p>
            <h2>Tipping for Different Services</h2>
            <p><strong>Sit-down restaurants:</strong> 15–25% on the pre-tax amount. <strong>Delivery:</strong> 10–20% with a $3–5 minimum. <strong>Rideshare (Uber/Lyft):</strong> 15–20%, especially for long rides or great service. <strong>Hair salons:</strong> 15–20% for stylists, $5–10 for assistants. <strong>Hotel housekeeping:</strong> $2–5 per night, left daily. <strong>Bartenders:</strong> $1–2 per drink or 15–20% of tab. <strong>Pizza delivery:</strong> $3–5 minimum or 10–15%.</p>
            <h2>Should You Tip on Pre- or Post-Tax?</h2>
            <p>Etiquette traditionally recommends tipping on the pre-tax bill. Servers provide service on the food and drink, not the government's portion. However, for simplicity many people tip on the total including tax. On a $100 pre-tax bill with 8% tax ($108 total), the difference between 20% on $100 ($20) versus 20% on $108 ($21.60) is $1.60 — a minor difference that you can resolve based on the quality of service.</p>
            <h2>Tips for Using This Calculator</h2>
            <p>Use the quick-select buttons to instantly switch between standard percentages. The pie chart shows the bill-to-tip ratio at a glance. For unequal splits (where people ordered different amounts), use the per-person breakdown to settle the difference. Combine with the <a href="/calculator/sales-tax-calculator">sales tax calculator</a> to compute the full pre-tax amount if you only know the total, or with the <a href="/calculator/percentage-calculator">percentage calculator</a> for other service charge needs.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/tip-calculator" />
          <PopularCalculators exclude="/calculator/tip-calculator" />
        </div>
      </div>
    </>
  );
};
export default TipCalculator;
