"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Gift } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface GiftResult {
  total: number;
  people: number;
  perPerson: number;
  rounded: number;
  leftover: number;
  chartData: { name: string; value: number }[];
}

function calcGift(total: number, people: number): GiftResult {
  const perPerson = people > 0 ? total / people : 0;
  const rounded = Math.ceil(perPerson);
  const leftover = rounded * people - total;
  const chartData = [
    { name: "Exact Share", value: Number(perPerson.toFixed(2)) },
    { name: "Rounded Up", value: Number(rounded.toFixed(2)) },
  ];
  return { total, people, perPerson, rounded, leftover, chartData };
}

const DEFAULTS = { total: "150", people: "5" };

const faqs = [
  { question: "How do I split a group gift fairly?", answer: "Divide the total cost (including tax, shipping, and gift wrap) by the number of contributors. For a $150 gift among 5 people, each contributes $30. Rounding up to the nearest dollar covers any surprise fees." },
  { question: "What should be included in the total?", answer: "The gift price plus sales tax, shipping, gift wrapping, and a card. Decide upfront whether the organizer's convenience costs (e.g., parking to pick it up) are included or absorbed by the organizer." },
  { question: "What if someone wants to contribute more?", answer: "Optional: allow uneven contributions. The simplest approach is equal shares, but for big-ticket gifts (like a vacation or appliance), letting each person choose their amount while the organizer tops up the difference works well." },
];

export default function GiftCostPerPersonCalculator() {
  const [total, setTotal] = useState(DEFAULTS.total);
  const [people, setPeople] = useState(DEFAULTS.people);
  const [result, setResult] = useState<GiftResult>(() => calcGift(150, 5));

  const handleCalculate = () => {
    const t = parseFloat(total);
    const p = parseInt(people, 10);
    if (isNaN(t) || isNaN(p) || p <= 0) return;
    setResult(calcGift(t, p));
  };

  const reset = () => {
    setTotal(DEFAULTS.total);
    setPeople(DEFAULTS.people);
    setResult(calcGift(150, 5));
  };

  const breakdown = [
    { label: "Total Gift Cost", value: `$${result.total.toFixed(2)}`, highlight: false },
    { label: "Contributors", value: `${result.people}`, highlight: false },
    { label: "Exact Share Per Person", value: `$${result.perPerson.toFixed(2)}`, highlight: true },
    { label: "Rounded Up (nearest $)", value: `$${result.rounded.toFixed(2)}`, highlight: false },
    { label: "Surplus After Rounding", value: `$${result.leftover.toFixed(2)}`, highlight: false },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Gift Cost Per Person Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Gift Cost Per Person Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <Gift className="w-4 h-4" /> Group Gift Split
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Total Gift Cost ($)</label>
                <input type="number" value={total} onChange={(e) => setTotal(e.target.value)} className="input-calc" placeholder="150" min={0} />
                <p className="text-xs text-muted-foreground mt-1">Include tax, shipping, and gift wrap.</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Number of Contributors</label>
                <input type="number" value={people} onChange={(e) => setPeople(e.target.value)} className="input-calc" placeholder="5" min={1} />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
              <button type="button" onClick={reset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4 min-w-0">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground mb-1">
                <Gift className="w-4 h-4 text-primary" /> COST PER PERSON
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-bold text-primary">${result.perPerson.toFixed(2)}</span>
                <span className="text-sm text-muted-foreground">per person</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                ${result.total.toFixed(2)} split {result.people} ways — ${result.rounded.toFixed(2)} rounded up covers it with ${result.leftover.toFixed(2)} spare.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Total Gift", `$${result.total.toFixed(2)}`],
                ["Contributors", `${result.people}`],
                ["Exact Share", `$${result.perPerson.toFixed(2)}`],
              ].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold text-foreground">{v}</div>
                </div>
              ))}
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Result Breakdown</h3>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Quantity</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdown.map((row) => (
                    <tr key={row.label} className={row.highlight ? "bg-primary/10 font-bold" : ""}>
                      <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="text-base font-bold mb-4">Exact vs Rounded Share</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={50} />
                  <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">Rounding each share up leaves ${result.leftover.toFixed(2)} surplus to cover the card or wrapping.</p>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {[
                  { label: "Per Person (rounded)", value: `$${result.rounded.toFixed(2)}` },
                  { label: "Surplus Fund", value: `$${result.leftover.toFixed(2)}` },
                  { label: "Surplus Suggestion", value: "Card, wrap, or tip the organizer" },
                  { label: "Rule of Thumb", value: "Include every cost, then round up" },
                ].map((s) => (
                  <div key={s.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the Gift Cost Per Person Calculator</h2>
            <p>Group gifting is simple in concept — one gift, many wallets — but the details matter. The total must include tax, shipping, and wrapping, and the split should be decided before anyone contributes. Dividing the total by the number of people gives the exact share; rounding up to the nearest dollar creates a small surplus that covers rounding errors or the organizer's card purchase.</p>
            <h3>Making it painless</h3>
            <p>Set a clear collection deadline and use a payment app so the organizer isn't fronting the full cost. If contributions are uneven, track them separately and treat the organizer's payment as the balancing item. For recurring group gifts — teacher appreciation, office birthdays — a standing split avoids renegotiating every time.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/gift-cost-per-person-calculator" />
          <PopularCalculators exclude="/calculator/gift-cost-per-person-calculator" />
        </div>
      </div>
    </>
  );
}
