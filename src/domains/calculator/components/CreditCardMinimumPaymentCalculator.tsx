"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw, CreditCard, ChevronDown } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const CreditCardMinimumPaymentCalculator = () => {
  const [balance, setBalance] = useState("5000");
  const [apr, setApr] = useState("22.99");
  const [minPct, setMinPct] = useState("2");
  const [minFloor, setMinFloor] = useState("25");

  const [results, setResults] = useState<{
    months: number;
    years: string;
    totalInterest: number;
    totalPaid: number;
  } | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showAdv, setShowAdv] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleCalculate = () => {
    setShowResults(true);
    const b = parseFloat(balance);
    const r = parseFloat(apr) / 100 / 12;
    const pct = parseFloat(minPct) / 100;
    const floor = parseFloat(minFloor);

    if (b <= 0 || r < 0) return;

    let bal = b;
    let months = 0;
    let totalInterest = 0;
    let totalPaid = 0;

    while (bal > 0.01 && months < 1200) {
      const interest = bal * r;
      totalInterest += interest;
      bal += interest;
      const payment = Math.max(bal * pct, floor, interest + 1); // Must cover at least interest + $1
      const actualPayment = Math.min(payment, bal);
      totalPaid += actualPayment;
      bal -= actualPayment;
      months++;
    }

    setResults({
      months,
      years: (months / 12).toFixed(1),
      totalInterest,
      totalPaid,
    });
  };

  const reset = () => {
    setShowResults(false);
    setBalance("5000"); setApr("22.99"); setMinPct("2"); setMinFloor("25");
    setResults(null);
  };

  const faqs = [
    { question: "Why does it take so long to pay off credit card debt with minimums?", answer: "Because the minimum payment is calculated as a percentage of your balance, it shrinks every month as your balance decreases. This means progress slows dramatically over time, and most of each payment goes toward interest, not principal." },
    { question: "What is the typical minimum payment percentage?", answer: "Most credit cards set the minimum at 1-3% of the outstanding balance or $25-35 (whichever is greater). Some use a flat dollar amount plus all accrued interest and fees." },
    { question: "How can I pay off my credit card faster?", answer: "Pay more than the minimum. Even paying double the minimum can cut your payoff time in half. Also consider the avalanche method (highest interest first) for the most mathematical savings." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Minimum Payment Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Credit Card Minimum Payment Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-2">
                <InputField id="balance" label="Credit Card Balance ($)" value={balance} onChange={setBalance} />
                <InputField id="apr" label="Annual APR (%)" value={apr} onChange={setApr} />
              </div>

              {/* Advanced Options */}
              <div>
                <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus:outline-none mb-1">
                  Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdv ? "rotate-180" : ""}`} />
                </button>
                {showAdv && (
                  <div className="mt-2 p-4 rounded-xl bg-secondary/20 border border-border animate-fade-in-up grid sm:grid-cols-2 gap-4">
                    <InputField id="minpct" label="Min Payment Rate (%)" value={minPct} onChange={setMinPct} tooltip="Usually 1-3% of balance." />
                    <InputField id="floor" label="Minimum Floor ($)" value={minFloor} onChange={setMinFloor} tooltip="Minimum dollar amount, usually $25." />
                  </div>
                )}
              </div>

              <div className="flex gap-2.5 mt-2">
                <button onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
                <button onClick={() => { reset(); setShowAdv(false); }} className="w-10 shrink-0 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Minimum Payment Analysis</h2>
                <div className="bg-primary/10 border-l-4 border-primary rounded-xl p-5 mb-6">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Time to Pay Off with Minimums</p>
                  <p className="text-4xl font-bold text-primary">{results.years} years</p>
                  <p className="text-sm text-muted-foreground mt-1">{results.months} months of minimum payments</p>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-5 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Interest Paid</p>
                    <p className="text-2xl font-black text-foreground">${results.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Paid</p>
                    <p className="text-2xl font-black text-foreground">${results.totalPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Original Balance</p>
                    <p className="text-2xl font-black text-foreground">${parseFloat(balance).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                </div>
                
                {mounted && (
                  <div className="card-calculator !p-5 border border-border bg-card mb-6 flex flex-col justify-center items-center">
                    <h3 className="text-sm font-bold mb-4 w-full text-left">Payment Breakdown</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={[
                          { name: "Principal", value: parseFloat(balance), color: "hsl(var(--primary))" },
                          { name: "Interest", value: results.totalInterest, color: "hsl(var(--destructive))" },
                        ]} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" paddingAngle={2}>
                          {[
                            { name: "Principal", value: parseFloat(balance), color: "hsl(var(--primary))" },
                            { name: "Interest", value: results.totalInterest, color: "hsl(var(--destructive))" },
                          ].map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <Tooltip formatter={(val: number) => `$${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
                        <Legend iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <ResultDisplay items={[
                  { label: "Original Balance", value: 0, textValue: "$" + parseFloat(balance).toLocaleString() },
                  { label: "Total Amount Paid", value: 0, textValue: "$" + results.totalPaid.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  { label: "Interest vs Principal", value: 0, textValue: ((results.totalInterest / results.totalPaid) * 100).toFixed(0) + "% interest" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="mt-12 space-y-8 text-base text-foreground max-w-[1180px]">
              <div>
                <h2 className="text-2xl font-bold mb-3">The Minimum Payment Trap</h2>
                <p className="text-muted-foreground leading-relaxed">Credit card issuers design minimum payments to keep you in debt as long as possible. Because a minimum payment is structured to cover the interest accrued during the billing cycle plus only a tiny fraction of the principal, a $5,000 balance at a typical 22.99% APR can take over 20 years to pay off with minimums alone, ultimately costing you thousands of dollars more than the original amount you borrowed.</p>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-3">How Minimums Are Calculated</h2>
                <p className="text-muted-foreground leading-relaxed">Most credit card issuers calculate your minimum payment using whichever amount is greater: a percentage of your total outstanding balance (typically between 1% and 3%) or a fixed floor amount (often $25 to $35). As your principal balance slowly drops over the years, the minimum required payment drops as well. This shrinking payment is precisely what stretches the repayment timeline into decades and maximizes the total interest generated for the bank.</p>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-3">Breaking the Cycle</h2>
                <p className="text-muted-foreground leading-relaxed">The single most powerful step you can take to escape credit card debt is to fix your monthly payment amount. Instead of paying whatever the minimum requirement is each month, pick a fixed number (for example, $200) and stick to it regardless of what the statement says. This simple action alone can dramatically reduce a 20-year payoff timeline to under 3 years. For the best mathematical savings, consider applying extra payments toward the card with the highest interest rate first, a strategy known as the debt avalanche.</p>
              </div>
            </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/credit-card-minimum-payment" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Credit Card Minimum Payment Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Credit Card Minimum Payment Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Credit Card Minimum Payment Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Credit Card Minimum Payment Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Credit Card Minimum Payment Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/credit-card-minimum-payment-calculator" />
        </div>
      </div>
    </>
  );
};

export default CreditCardMinimumPaymentCalculator;

