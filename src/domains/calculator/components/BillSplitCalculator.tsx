"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface SplitResult {
  perPerson: number;
  totalTip: number;
  totalWithTip: number;
  billPerPerson: number;
  tipPerPerson: number;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcSplit(totalBill: number, numPeople: number, tipPct: number): SplitResult {
  const people = Math.max(1, numPeople);
  const tip = (tipPct || 0) / 100;
  const totalTip = totalBill * tip;
  const totalWithTip = totalBill + totalTip;
  const perPerson = totalWithTip / people;
  const billPerPerson = totalBill / people;
  const tipPerPerson = totalTip / people;

  return {
    perPerson,
    totalTip,
    totalWithTip,
    billPerPerson,
    tipPerPerson,
    chartData: [
      { name: "Bill", value: Math.max(0, totalBill) },
      { name: "Tip", value: Math.max(0, totalTip) },
    ],
    breakdown: [
      { label: "Original Bill", value: `$${totalBill.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
      { label: `Tip (${tipPct}%)`, value: `$${totalTip.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
      { label: "Total with Tip", value: `$${totalWithTip.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
      { label: "People Splitting", value: `${people}` },
      { label: "Bill per Person", value: `$${billPerPerson.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
      { label: "Tip per Person", value: `$${tipPerPerson.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
      { label: "Per-Person Share", value: `$${perPerson.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    ],
    summaryStats: [
      { label: "Per-Person Share", value: `$${perPerson.toFixed(2)}` },
      { label: "Total Tip", value: `$${totalTip.toFixed(2)}` },
      { label: "Total with Tip", value: `$${totalWithTip.toFixed(2)}` },
      { label: "Bill per Person", value: `$${billPerPerson.toFixed(2)}` },
      { label: "Tip per Person", value: `$${tipPerPerson.toFixed(2)}` },
      { label: "Effective Rate", value: `${tipPct}%` },
    ],
  };
}

const DEFAULTS = { bill: "120", people: "4", tip: "15" };
const COLORS = ["#2563eb", "#f59e0b"];

export default function BillSplitCalculator() {
  const [bill, setBill] = useState(DEFAULTS.bill);
  const [people, setPeople] = useState(DEFAULTS.people);
  const [tip, setTip] = useState(DEFAULTS.tip);
  const [result, setResult] = useState<SplitResult>(() => calcSplit(120, 4, 15));

  const calculate = () => setResult(calcSplit(parseFloat(bill) || 0, parseInt(people) || 1, parseFloat(tip) || 0));
  const reset = () => { setBill(DEFAULTS.bill); setPeople(DEFAULTS.people); setTip(DEFAULTS.tip); setResult(calcSplit(120, 4, 15)); };
  useEffect(() => { setResult(calcSplit(120, 4, 15)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "How do you split a bill with different tips?", answer: "This calculator applies one tip percentage to the whole bill and splits the total evenly. If people want to pay different amounts, calculate the total with tip first, then divide the final sum manually or use the per-person share as a baseline." },
    { question: "Is tip calculated before or after tax?", answer: "In most countries it is customary to tip on the pre-tax amount, though many modern POS systems suggest tips on the after-tax total. Choose whichever method matches local custom — this calculator applies the percentage to whatever total you enter." },
    { question: "What is a standard tip for large groups?", answer: "For groups of 6 or more, many restaurants automatically add an 18–20% gratuity. Always check your receipt before adding an extra tip to avoid double-tipping." },
    { question: "What if I want uneven splits?", answer: "This tool assumes an even split. For uneven amounts, calculate each person's itemized subtotal plus their share of the tip, or use the per-person figures as a starting point and adjust." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Bill Split Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Bill Split Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Total Bill</label>
              <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={bill} onChange={e => setBill(e.target.value)} className={ci} min={0} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Number of People</label>
                <div className={inp}><input type="number" value={people} onChange={e => setPeople(e.target.value)} className={ci} min={1} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Tip Percentage</label>
                <div className={inp}><input type="number" value={tip} onChange={e => setTip(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Per-Person Share</div>
              <div className="text-4xl font-extrabold text-primary">${result.perPerson.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="text-sm text-muted-foreground mt-1">Total with tip: ${result.totalWithTip.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} · Split {people} ways</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Total Bill", `$${result.totalWithTip.toFixed(2)}`], ["Tip", `$${result.totalTip.toFixed(2)}`], ["Bill Only", `$${(parseFloat(bill) || 0).toFixed(2)}`]].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold">{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Split Breakdown</h3>
              <table className="w-full text-base"><tbody>
                {result.breakdown.map((r, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-2.5 text-muted-foreground">{r.label}</td>
                    <td className="py-2.5 text-right font-semibold">{r.value}</td>
                  </tr>
                ))}
              </tbody></table>
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Bill vs Tip</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={result.chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                    {result.chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-2 text-sm">
                <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-[#2563eb]" />Bill ({Math.round((result.chartData[0].value / (result.chartData[0].value + result.chartData[1].value)) * 100)}%)</div>
                <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-[#f59e0b]" />Tip ({Math.round((result.chartData[1].value / (result.chartData[0].value + result.chartData[1].value)) * 100)}%)</div>
              </div>
            </div>
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Sharing Expenses Without the Stress</h2>
            <p>Dining out or traveling with friends is fun until the bill arrives. A <strong>bill split calculator</strong> removes the awkwardness and the math errors, ensuring everyone pays their fair share. Enter the total, the number of people, and the tip percentage, and the tool instantly computes the per-person share plus a full breakdown of tip and bill amounts.</p>
            <h2 className="text-2xl font-bold mb-3">How the Split Is Calculated</h2>
            <p>The tip amount is the bill multiplied by the tip percentage, and the grand total is the bill plus the tip. Dividing that total by the number of people gives the per-person share. This matches the standard even-split convention used by most dining groups.</p>
            <h2 className="text-2xl font-bold mb-3">When to Split Evenly</h2>
            <p>Even splitting works best for meals where everyone ordered similar items, or for shared costs such as a vacation rental, utilities, or catering. If one person ordered significantly more expensive items, calculate individual subtotals first and tip accordingly.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/bill-split-calculator" />
          <PopularCalculators exclude="/calculator/bill-split-calculator" />
        </div>
      </div>
    </>
  );
}
