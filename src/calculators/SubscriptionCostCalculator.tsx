"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Plus, Trash2 } from "lucide-react";
import ResultDisplay from "@/components/calculator/ResultDisplay";

const SubscriptionCostCalculator = () => {
  const [subs, setSubs] = useState([
    { id: 1, name: "Netflix", cost: "15.99", interval: "monthly" },
    { id: 2, name: "Spotify", cost: "10.99", interval: "monthly" },
    { id: 3, name: "Amazon Prime", cost: "139", interval: "yearly" },
  ]);

  const [results, setResults] = useState<any>(null);
  const addSub = () => {
    setSubs([...subs, { id: Date.now(), name: "New Sub", cost: "", interval: "monthly" }]);
  };

  const removeSub = (id: number) => {
    setSubs(subs.filter(s => s.id !== id));
  };

  const updateSub = (id: number, field: string, value: string) => {
    setSubs(subs.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  useEffect(() => { handleCalculate(); }, []);

  const handleCalculate = () => {
    let annualTotal = 0;
    subs.forEach(s => {
      const cost = parseFloat(s.cost) || 0;
      annualTotal += s.interval === "monthly" ? cost * 12 : cost;
    });

    setResults({
      annualTotal,
      monthlyAvg: annualTotal / 12,
      fiveYearTotal: annualTotal * 5,
      tenYearTotal: annualTotal * 10
    });
  };

  const reset = () => {
    setSubs([
      { id: 1, name: "Netflix", cost: "15.99", interval: "monthly" },
    ]);
    setResults(null);
    setTimeout(() => handleCalculate(), 0);
  };

  const faqs = [
    { question: "What is subscription creep?", answer: "Subscription creep occurs when you sign up for many small monthly services (streaming, apps, gym) and forget about them. Individually they seem cheap ($10-15), but collectively they can cost thousands per year." },
    { question: "Is it cheaper to pay annually?", answer: "Most services offer a 10-20% discount if you pay for a full year upfront. If you are certain you will use the service for the full year, paying annually is almost always the better financial move." },
    { question: "How can I find hidden subscriptions?", answer: "The best way is to review your bank and credit card statements for the last 3 months. Look for recurring small charges that you don't recognize or haven't used recently." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Subscription Cost" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Subscription Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="space-y-4 mb-6">
                <div className="grid grid-cols-[2fr_1fr_1fr_40px] gap-3 px-1 text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  <span>Service Name</span>
                  <span>Cost ($)</span>
                  <span>Interval</span>
                  <span></span>
                </div>
                {subs.map((s) => (
                  <div key={s.id} className="grid grid-cols-[2fr_1fr_1fr_40px] gap-3 items-center">
                    <input 
                      type="text" 
                      value={s.name} 
                      onChange={(e) => updateSub(s.id, "name", e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <input 
                      type="number" 
                      value={s.cost} 
                      onChange={(e) => updateSub(s.id, "cost", e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <select 
                      value={s.interval} 
                      onChange={(e) => updateSub(s.id, "interval", e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                    <button 
                      onClick={() => removeSub(s.id)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <button onClick={addSub} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors">
                  <Plus className="h-4 w-4" /> Add Subscription
                </button>
                <div className="flex-1" />
                <button onClick={handleCalculate} className="btn-calculate px-8">Calculate</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {results && (<>

              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-3">Total Annual Cost</h2>
                  <p className="text-5xl font-extrabold mb-2 text-red-500">${results.annualTotal.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Monthly Average: ${results.monthlyAvg.toFixed(2)}</p>
                </div>

                <ResultDisplay items={[
                  { label: "Annual Total Cost", value: results.annualTotal, highlight: true },
                  { label: "5-Year Projection", value: results.fiveYearTotal, highlight: true },
                  { label: "10-Year Projection", value: results.tenYearTotal },
                  { label: "Number of Services", value: 0, textValue: subs.length.toString() },
                ]} />
              
              </div>
            
</>)}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
              <h2>The Hidden Cost of 'Small' Monthly Fees</h2>
              <p>In the digital economy, everything has moved to a subscription model. While $10 or $20 a month feels insignificant, these recurring costs act like a 'leak' in your bucket of wealth. Over 10 years, a simple $15/mo Netflix subscription costs you $1,800—and that's without considering what that money could have earned if invested.</p>
              <h3>Auditing Your Subscriptions</h3>
              <p>We recommend a 'Subscription Audit' every 6 months. Cancel anything you haven't used in the last 30 days. Most services allow you to restart your subscription instantly if you ever need it again, so there is no risk in pausing unused accounts.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/subscription-cost-calculator" />
          <PopularCalculators exclude="/calculator/subscription-cost-calculator" />
        </div>
      </div>
    </>
  );
};

export default SubscriptionCostCalculator;


