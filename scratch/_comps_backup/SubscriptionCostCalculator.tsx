"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, RefreshCw, Plus, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Sub {
  id: number;
  name: string;
  cost: number;
  yearly: boolean;
}

function fmt(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

let nextId = 100;

export default function SubscriptionCostCalculator() {
  const [subs, setSubs] = useState<Sub[]>([
    { id: 1, name: "Netflix", cost: 15.99, yearly: false },
    { id: 2, name: "Spotify", cost: 10.99, yearly: false },
    { id: 3, name: "Amazon Prime", cost: 139, yearly: true },
  ]);
  const [showResults, setShowResults] = useState(false);

  let annual = 0;
  const rows = subs.map((s) => {
    const perYear = s.cost * (s.yearly ? 1 : 12);
    annual += perYear;
    return { ...s, perYear };
  });
  const monthlyAvg = annual / 12;
  const fiveYear = annual * 5;
  const tenYear = annual * 10;
  const biggest = rows.length > 0 ? rows.slice().sort((a, b) => b.perYear - a.perYear)[0] : null;

  const chartData = rows
    .filter((r) => r.cost > 0)
    .map((r) => ({ name: r.name, value: Math.round(r.perYear * 100) / 100 }));

  const handleCalculate = () => setShowResults(true);

  const reset = () => {
    setSubs([
      { id: 1, name: "Netflix", cost: 15.99, yearly: false },
      { id: 2, name: "Spotify", cost: 10.99, yearly: false },
      { id: 3, name: "Amazon Prime", cost: 139, yearly: true },
    ]);
    setShowResults(false);
  };

  const faqs = [
    { question: "What is subscription creep?", answer: "The slow accumulation of small recurring charges — streaming, software, gym, cloud storage — that individually feel trivial but collectively drain hundreds or thousands of dollars a year. It is the most common hidden line item in modern household budgets." },
    { question: "How do I calculate the real cost of a subscription?", answer: "Normalize everything to a yearly figure: monthly price × 12, or the yearly price as-is. Sum them all. The total is often 2–3× what people guess from memory — which is exactly why tracking beats estimating." },
    { question: "Why is yearly billing cheaper than monthly?", answer: "Providers discount annual plans because upfront payment removes churn risk and reduces billing overhead — Amazon Prime, Spotify, and most SaaS offer 15–25% off for yearly prepayment. The catch: an annual charge is easier to forget, so audit it each renewal." },
    { question: "How many subscriptions does the average person have?", answer: "US households average roughly 5–7 active subscriptions, with streaming alone often totaling $40–80/month. The count creeps up over time as free trials convert and new services launch. An annual audit typically finds 20–30% that are unused." },
    { question: "How do I cut subscription costs?", answer: "Audit the list, cancel anything unused in the last 30 days, switch infrequent users to annual plans or shared family plans, and rotate services instead of stacking them. A 10-year projection like this calculator's makes the cumulative impact vivid enough to act on." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Subscription Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Subscription Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <RefreshCw className="w-4 h-4" /> Your Subscriptions
            </div>
            <div className="space-y-2">
              {rows.map((s) => (
                <div key={s.id} className="grid grid-cols-[2fr_1fr_1fr_40px] gap-3 items-center">
                  <input
                    type="text"
                    value={s.name}
                    onChange={(e) => setSubs(subs.map((x) => (x.id === s.id ? { ...x, name: e.target.value } : x)))}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  />
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                    <input
                      type="number"
                      value={Number.isFinite(s.cost) ? s.cost : ""}
                      min={0}
                      step={0.01}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        setSubs(subs.map((x) => (x.id === s.id ? { ...x, cost: Number.isNaN(v) ? 0 : v } : x)));
                      }}
                      className="h-10 w-full rounded-md border border-input bg-background pl-7 pr-3 text-sm"
                    />
                  </div>
                  <select
                    value={s.yearly ? "yearly" : "monthly"}
                    onChange={(e) => setSubs(subs.map((x) => (x.id === s.id ? { ...x, yearly: e.target.value === "yearly" } : x)))}
                    className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                  <button
                    onClick={() => setSubs(subs.filter((x) => x.id !== s.id))}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setSubs([...subs, { id: nextId++, name: "New Subscription", cost: 0, yearly: false }])}
              className="mt-1 flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors"
            >
              <Plus className="h-4 w-4" /> Add Subscription
            </button>

            <div className="flex gap-3 mt-1">
              <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
              <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults ? (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-xl p-5">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Total Annual Cost</p>
                  <p className="text-4xl font-bold text-primary mt-1">{fmt(annual)}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {fmt(monthlyAvg)}/month average across {rows.length} service(s)
                  </p>
                </div>

                <div className="grid grid-cols-3 divide-x divide-border rounded-lg border bg-card">
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Monthly Avg</p>
                    <p className="text-2xl font-bold text-primary">{fmt(monthlyAvg)}</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">5-Year Projection</p>
                    <p className="text-2xl font-bold text-orange-500">{fmt(fiveYear)}</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">10-Year Projection</p>
                    <p className="text-2xl font-bold text-green-600">{fmt(tenYear)}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-base">
                    <thead>
                      <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="py-2.5 px-3 font-medium">Service</th>
                        <th className="py-2.5 px-3 font-medium text-right">Per Period</th>
                        <th className="py-2.5 px-3 font-medium text-right">Per Year</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => (
                        <tr className={i === rows.length - 1 ? "" : "border-b"} key={r.id}>
                          <td className="py-2.5 px-3">
                            {r.name}
                            {biggest && r.id === biggest.id && <span className="text-primary font-semibold"> (largest)</span>}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {fmt(r.cost)}/{r.yearly ? "yr" : "mo"}
                          </td>
                          <td className="py-2.5 px-3 text-right">{fmt(r.perYear)}</td>
                        </tr>
                      ))}
                      <tr className="border-t-2 font-bold">
                        <td className="py-2.5 px-3">Total</td>
                        <td className="py-2.5 px-3 text-right" />
                        <td className="py-2.5 px-3 text-right">{fmt(annual)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm font-medium mb-3">Annual Cost by Service</p>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(v: number) => fmt(v)} />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <p className="text-sm font-medium mb-3">Summary</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Services</span>
                      <span className="font-medium">{rows.length}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Largest Cost</span>
                      <span className="font-medium">{biggest ? `${biggest.name} (${fmt(biggest.perYear)}/yr)` : "—"}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Annual Total</span>
                      <span className="font-medium">{fmt(annual)}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Monthly Average</span>
                      <span className="font-medium">{fmt(monthlyAvg)}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">5-Year Total</span>
                      <span className="font-medium">{fmt(fiveYear)}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">10-Year Total</span>
                      <span className="font-medium">{fmt(tenYear)}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="card-calculator border border-border bg-card !p-5 text-center text-muted-foreground">
                Add your subscriptions, then click <strong className="text-foreground">Calculate</strong> to see the annual total and 5- and 10-year projections.
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Subscription Costs Add Up</h2>
            <p>Every subscription is normalized to a yearly figure — monthly cost × 12, or the yearly cost as-is — and summed. The monthly average, 5-year, and 10-year projections are simple multiples of that annual total, making "subscription creep" visible in hard numbers.</p>
            <h3>Worked Example</h3>
            <p>Netflix ($15.99/mo), Spotify ($10.99/mo), and Amazon Prime ($139/yr) come to $462.76/year — $38.56/month. Over 10 years that's $4,627.60, enough to fund a vacation or a small portfolio.</p>
            <h3>The Opportunity Cost</h3>
            <p>That $462/year is not just spent — it is money that never compounds. Invested at a 7% average return for 10 years, the same monthly amount grows to roughly $6,600. The 10-year projection here shows the raw cost; the real price of subscription creep is what the money could have become.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/subscription-cost-calculator" />
          <PopularCalculators exclude="/calculator/subscription-cost-calculator" />
        </div>
      </div>
    </>
  );
}
