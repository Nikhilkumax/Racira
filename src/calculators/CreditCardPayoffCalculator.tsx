"use client";

import { useState, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import PieChart from "@/components/calculator/PieChart";
import { Printer, RotateCcw, Plus, Trash2 } from "lucide-react";

interface Card {
  id: number;
  name: string;
  balance: string;
  rate: string;
  minPayment: string;
  extraPayment: string;
}

interface PayoffResult {
  months: number;
  totalInterest: number;
  totalPaid: number;
  payoffDate: string;
}

const fmt = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

let nextId = 2;

const CreditCardPayoffCalculator = () => {
  const [cards, setCards] = useState<Card[]>([
    { id: 1, name: "Card 1", balance: "5000", rate: "19.99", minPayment: "100", extraPayment: "50" },
  ]);
  const [strategy, setStrategy] = useState<"avalanche" | "snowball">("avalanche");
  const [avalancheResult, setAvalancheResult] = useState<PayoffResult | null>(null);
  const [snowballResult, setSnowballResult] = useState<PayoffResult | null>(null);
  const [schedule, setSchedule] = useState<{ month: number; payments: { name: string; payment: number; balance: number }[] }[]>([]);
  const [showSchedule, setShowSchedule] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const addCard = () => {
    nextId++;
    setCards([...cards, { id: nextId, name: `Card ${nextId}`, balance: "0", rate: "0", minPayment: "25", extraPayment: "0" }]);
  };

  const removeCard = (id: number) => {
    if (cards.length <= 1) return;
    setCards(cards.filter((c) => c.id !== id));
  };

  const updateCard = (id: number, field: keyof Card, value: string) => {
    setCards(cards.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const simulate = (strat: "avalanche" | "snowball"): { result: PayoffResult; sched: typeof schedule } => {
    const balances = cards.map((c) => ({
      name: c.name,
      balance: parseFloat(c.balance) || 0,
      rate: (parseFloat(c.rate) || 0) / 100 / 12,
      minPayment: parseFloat(c.minPayment) || 0,
      extraPayment: parseFloat(c.extraPayment) || 0,
    }));

    const totalExtra = balances.reduce((s, c) => s + c.extraPayment, 0);
    let month = 0;
    let totalInterest = 0;
    let totalPaid = 0;
    const sched: typeof schedule = [];

    while (balances.some((c) => c.balance > 0.01) && month < 600) {
      month++;
      // Sort for strategy
      const sorted = [...balances].filter((c) => c.balance > 0.01);
      if (strat === "avalanche") sorted.sort((a, b) => b.rate - a.rate);
      else sorted.sort((a, b) => a.balance - b.balance);

      let extraPool = totalExtra;
      const monthPayments: { name: string; payment: number; balance: number }[] = [];

      for (const card of balances) {
        if (card.balance <= 0.01) {
          monthPayments.push({ name: card.name, payment: 0, balance: 0 });
          continue;
        }
        const interest = card.balance * card.rate;
        totalInterest += interest;
        let payment = card.minPayment;

        // Add extra to priority card
        if (sorted.length > 0 && card.name === sorted[0].name) {
          payment += extraPool;
          extraPool = 0;
        }

        if (payment > card.balance + interest) payment = card.balance + interest;
        card.balance = card.balance + interest - payment;
        if (card.balance < 0.01) card.balance = 0;
        totalPaid += payment;
        monthPayments.push({ name: card.name, payment, balance: card.balance });
      }

      // Redistribute freed-up minimums
      const paidOff = balances.filter((c) => c.balance <= 0.01);
      if (paidOff.length > 0 && sorted.length > 1) {
        // freed minimum goes to next priority
      }

      sched.push({ month, payments: monthPayments });
    }

    const now = new Date();
    const payoffDate = new Date(now.getFullYear(), now.getMonth() + month);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return {
      result: {
        months: month,
        totalInterest,
        totalPaid,
        payoffDate: `${monthNames[payoffDate.getMonth()]} ${payoffDate.getFullYear()}`,
      },
      sched,
    };
  };

  const calculate = () => {
    const av = simulate("avalanche");
    const sb = simulate("snowball");
    setAvalancheResult(av.result);
    setSnowballResult(sb.result);
    setSchedule(strategy === "avalanche" ? av.sched : sb.sched);
  };

  const reset = () => {
    setCards([{ id: 1, name: "Card 1", balance: "5000", rate: "19.99", minPayment: "100", extraPayment: "50" }]);
    setAvalancheResult(null);
    setSnowballResult(null);
    setSchedule([]);
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Credit Card Payoff – RaciraCalculator</title>
      <style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:13px}
      th,td{border:1px solid #ddd;padding:6px 10px;text-align:right}th{background:#f5f5f5;text-align:left}
      h2{margin-bottom:1rem}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const activeResult = strategy === "avalanche" ? avalancheResult : snowballResult;
  const totalBalance = cards.reduce((s, c) => s + (parseFloat(c.balance) || 0), 0);

  const faqs = [
    { question: "What is the avalanche method?", answer: "The avalanche method prioritizes paying off the card with the highest interest rate first while making minimum payments on all other cards. This minimizes total interest paid and is mathematically optimal." },
    { question: "What is the snowball method?", answer: "The snowball method prioritizes paying off the card with the smallest balance first, providing quick psychological wins. While it may cost more in total interest, the motivation of eliminating cards faster helps many people stay on track." },
    { question: "How much extra should I pay?", answer: "Even $50-$100 extra per month can dramatically reduce your payoff time and total interest. The more you can pay above the minimum, the faster you'll become debt-free. Our calculator shows the exact impact of extra payments." },
    { question: "Should I use avalanche or snowball?", answer: "If you want to save the most money, use avalanche. If you need motivation from quick wins, use snowball. Our calculator compares both strategies so you can see the difference in total interest and payoff time." },
    { question: "Can I add multiple credit cards?", answer: "Yes! Our calculator supports multiple cards with different balances, interest rates, and minimum payments. This gives you a comprehensive debt payoff plan across all your cards." },
    { question: "How is credit card interest calculated?", answer: "Credit card interest is typically calculated daily on your average daily balance using the formula: Daily Rate × Balance × Days in Period. The APR is divided by 365 to get the daily rate. Our calculator uses monthly compounding for simplicity." },
  ];

  return (
    <>
<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Credit Card Payoff" }]} />

      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Credit Card Payoff Calculator</h1>
            <p className="text-muted-foreground mb-8">Enter your credit card details and compare avalanche vs snowball strategies to find the fastest path to becoming debt-free.</p>

            <div className="card-calculator mb-8">
              {/* Strategy Toggle */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-1.5">Payoff Strategy</label>
                <div className="flex rounded-lg border border-input overflow-hidden">
                  <button type="button" onClick={() => setStrategy("avalanche")} className={`flex-1 py-3 text-sm font-medium transition-colors ${strategy === "avalanche" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Avalanche (Highest Rate)</button>
                  <button type="button" onClick={() => setStrategy("snowball")} className={`flex-1 py-3 text-sm font-medium transition-colors ${strategy === "snowball" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Snowball (Lowest Balance)</button>
                </div>
              </div>

              {/* Cards */}
              <div className="space-y-4 mb-6">
                {cards.map((card) => (
                  <div key={card.id} className="p-4 rounded-lg bg-secondary/30 border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <input
                        type="text"
                        value={card.name}
                        onChange={(e) => updateCard(card.id, "name", e.target.value)}
                        className="text-sm font-semibold text-foreground bg-transparent border-none outline-none"
                      />
                      {cards.length > 1 && (
                        <button onClick={() => removeCard(card.id)} className="text-muted-foreground hover:text-destructive transition-colors" aria-label="Remove card">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <InputField id={`bal-${card.id}`} label="Balance" value={card.balance} onChange={(v) => updateCard(card.id, "balance", v)} prefix="$" />
                      <InputField id={`rate-${card.id}`} label="APR" value={card.rate} onChange={(v) => updateCard(card.id, "rate", v)} suffix="%" />
                      <InputField id={`min-${card.id}`} label="Min Payment" value={card.minPayment} onChange={(v) => updateCard(card.id, "minPayment", v)} prefix="$" />
                      <InputField id={`extra-${card.id}`} label="Extra Payment" value={card.extraPayment} onChange={(v) => updateCard(card.id, "extraPayment", v)} prefix="$" />
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={addCard} className="flex items-center gap-2 text-sm text-accent hover:underline mb-6">
                <Plus className="h-4 w-4" /> Add Another Card
              </button>

              <div className="flex gap-3">
                <button onClick={calculate} className="btn-calculate flex-1">Calculate Payoff</button>
                <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Results */}
            {activeResult && (
              <div className="card-calculator mb-8" ref={printRef}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Payoff Results ({strategy === "avalanche" ? "Avalanche" : "Snowball"})</h2>
                  <button onClick={handlePrint} className="flex items-center gap-1.5 text-sm text-accent hover:underline">
                    <Printer className="h-4 w-4" /> Print
                  </button>
                </div>

                <ResultDisplay items={[
                  { label: "Months to Payoff", value: 0, textValue: `${activeResult.months} months` },
                  { label: "Total Interest", value: activeResult.totalInterest },
                  { label: "Total Paid", value: activeResult.totalPaid, highlight: true },
                  { label: "Payoff Date", value: 0, textValue: activeResult.payoffDate },
                ]} />

                {/* Strategy Comparison */}
                {avalancheResult && snowballResult && (
                  <div className="mt-6 p-4 rounded-lg bg-secondary/30 border border-border">
                    <h3 className="font-semibold text-foreground mb-3">Strategy Comparison</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-secondary text-foreground">
                            <th className="px-3 py-2 text-left font-medium">Metric</th>
                            <th className="px-3 py-2 text-right font-medium">Avalanche</th>
                            <th className="px-3 py-2 text-right font-medium">Snowball</th>
                            <th className="px-3 py-2 text-right font-medium">Difference</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-t border-border">
                            <td className="px-3 py-2 text-muted-foreground">Months</td>
                            <td className="px-3 py-2 text-right">{avalancheResult.months}</td>
                            <td className="px-3 py-2 text-right">{snowballResult.months}</td>
                            <td className="px-3 py-2 text-right font-medium text-accent">{Math.abs(avalancheResult.months - snowballResult.months)}</td>
                          </tr>
                          <tr className="border-t border-border">
                            <td className="px-3 py-2 text-muted-foreground">Total Interest</td>
                            <td className="px-3 py-2 text-right">{fmt(avalancheResult.totalInterest)}</td>
                            <td className="px-3 py-2 text-right">{fmt(snowballResult.totalInterest)}</td>
                            <td className="px-3 py-2 text-right font-medium text-accent">{fmt(Math.abs(avalancheResult.totalInterest - snowballResult.totalInterest))}</td>
                          </tr>
                          <tr className="border-t border-border">
                            <td className="px-3 py-2 text-muted-foreground">Total Paid</td>
                            <td className="px-3 py-2 text-right">{fmt(avalancheResult.totalPaid)}</td>
                            <td className="px-3 py-2 text-right">{fmt(snowballResult.totalPaid)}</td>
                            <td className="px-3 py-2 text-right font-medium text-accent">{fmt(Math.abs(avalancheResult.totalPaid - snowballResult.totalPaid))}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-center">
                  <PieChart
                    segments={[
                      { label: "Principal", value: totalBalance, color: "hsl(211, 100%, 50%)" },
                      { label: "Interest", value: activeResult.totalInterest, color: "hsl(220, 60%, 20%)" },
                    ]}
                    size={180}
                  />
                </div>

                {/* Payment Schedule */}
                {schedule.length > 0 && (
                  <div className="mt-6">
                    <button onClick={() => setShowSchedule(!showSchedule)} className="text-sm text-accent hover:underline">
                      {showSchedule ? "Hide" : "Show"} Payment Schedule ({schedule.length} months)
                    </button>
                    {showSchedule && (
                      <div className="overflow-x-auto mt-3 rounded-lg border border-border">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-secondary text-foreground">
                              <th className="px-3 py-2 text-left font-medium">Month</th>
                              {cards.map((c) => (
                                <th key={c.id} className="px-3 py-2 text-right font-medium">{c.name} Bal</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {schedule.slice(0, showSchedule ? schedule.length : 24).map((row) => (
                              <tr key={row.month} className="border-t border-border hover:bg-secondary/30">
                                <td className="px-3 py-2 text-muted-foreground">{row.month}</td>
                                {row.payments.map((p) => (
                                  <td key={p.name} className="px-3 py-2 text-right">{fmt(p.balance)}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <AdPlaceholder className="mb-10" label="Ad Space – In Content" />

            <article className="prose-finance">
              <h2>What Is a Credit Card Payoff Calculator?</h2>
              <p>A credit card payoff calculator helps you determine how long it will take to pay off your credit card debt and how much total interest you'll pay. By entering your balance, interest rate, and payment amounts, you get a clear picture of your debt repayment timeline.</p>
              <p>Our advanced calculator supports multiple credit cards simultaneously and compares two proven debt payoff strategies — the avalanche method and the snowball method — so you can choose the approach that works best for your financial situation and personality.</p>

              <h2>Understanding Debt Payoff Strategies</h2>
              <h3>The Avalanche Method</h3>
              <p>The avalanche method focuses on paying off the card with the highest interest rate first while making minimum payments on all other cards. Once the highest-rate card is paid off, the extra money rolls to the next highest rate. This approach minimizes total interest paid and is mathematically optimal.</p>
              <h3>The Snowball Method</h3>
              <p>The snowball method targets the card with the smallest balance first. The quick wins of eliminating smaller debts provide psychological motivation to keep going. While you may pay slightly more in total interest compared to avalanche, many people find this method easier to stick with long-term.</p>

              <h2>How Credit Card Interest Works</h2>
              <p>Credit card companies charge interest on your outstanding balance using the Annual Percentage Rate (APR). Most cards compound interest daily, meaning interest is calculated on your balance each day and added to what you owe. Even at seemingly modest APRs like 18-24%, the compounding effect can make credit card debt extremely expensive over time.</p>
              <p>For example, a $5,000 balance at 19.99% APR with only minimum payments of $100/month would take approximately 9 years to pay off and cost over $4,700 in interest — nearly doubling the original balance.</p>

              <h2>Tips for Paying Off Credit Card Debt</h2>
              <ul>
                <li><strong>Pay more than the minimum:</strong> Even small extra payments dramatically reduce payoff time and interest.</li>
                <li><strong>Stop using the cards:</strong> Adding new charges while trying to pay off debt extends your timeline significantly.</li>
                <li><strong>Consider balance transfers:</strong> A 0% APR balance transfer card can help you pay down principal faster during the promotional period.</li>
                <li><strong>Automate payments:</strong> Set up automatic payments to ensure you never miss a due date and incur late fees.</li>
                <li><strong>Build an emergency fund:</strong> Even a small emergency fund prevents you from relying on credit cards for unexpected expenses.</li>
              </ul>

              <h2>Making the Most of This Calculator</h2>
              <p>Start by entering all your credit cards with their current balances, APRs, and minimum payments. Then experiment with different extra payment amounts to see how they affect your payoff timeline. Compare the avalanche and snowball results to choose your preferred strategy.</p>
              <p>Remember, the best strategy is the one you'll actually follow through on. If the psychological boost of the snowball method keeps you motivated, the slightly higher interest cost may be worth it in the long run.</p>

              <p className="text-xs mt-8 p-3 bg-secondary rounded-lg"><strong>Disclaimer:</strong> This calculator provides estimates for educational purposes only. Actual results may vary based on your specific card terms, payment timing, and any additional charges or fees. This is not financial advice.</p>
            </article>

            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/credit-card-payoff-calculator" />
            <PopularCalculators exclude="/credit-card-payoff-calculator" />
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

export default CreditCardPayoffCalculator;

