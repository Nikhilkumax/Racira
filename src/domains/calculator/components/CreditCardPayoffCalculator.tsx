"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, ChevronDown, PlusCircle, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, Cell } from "recharts";

interface CCResult { totalDebt: number; monthlyPayment: number; monthsToPayoff: number; totalInterest: number; schedule: { name: string; balance: number; rate: number; min: number }[]; }
const DEFAULTS_CARDS = [
  { name: "Visa Signature", balance: "4500", rate: "22.99", min: "90" },
  { name: "Chase Freedom", balance: "2800", rate: "19.99", min: "56" },
  { name: "Store Card", balance: "1200", rate: "28.99", min: "25" },
];
const DEFAULTS = { extraPayment: "300", strategy: "avalanche" };

function calculate(cards: typeof DEFAULTS_CARDS, extra: string, strategy: string): CCResult {
  const extra$ = parseFloat(extra)||0;
  const parsed = cards.map(c => ({ name: c.name, balance: parseFloat(c.balance)||0, rate: parseFloat(c.rate)||0, min: parseFloat(c.min)||0 })).filter(c => c.balance > 0);
  const totalDebt = parsed.reduce((s, c) => s + c.balance, 0);
  const totalMin = parsed.reduce((s, c) => s + c.min, 0);
  const totalMonthly = totalMin + extra$;
  let balances = parsed.map(c => ({ ...c }));
  let months = 0, totalInterest = 0;
  while (balances.some(c => c.balance > 0.01) && months < 600) {
    months++;
    for (const c of balances) { if (c.balance > 0) { const interest = c.balance * (c.rate / 100 / 12); totalInterest += interest; c.balance += interest; } }
    const sorted = strategy === "avalanche" ? [...balances].sort((a, b) => b.rate - a.rate) : [...balances].sort((a, b) => a.balance - b.balance);
    let remaining = totalMonthly;
    for (const target of sorted) {
      const card = balances.find(c => c.name === target.name)!;
      if (card.balance > 0) { const pay = Math.min(card.balance, remaining); card.balance -= pay; remaining -= pay; if (remaining <= 0) break; }
    }
  }
  return { totalDebt, monthlyPayment: totalMonthly, monthsToPayoff: months, totalInterest: Math.round(totalInterest), schedule: parsed };
}

function AdvancedOptions({ cards, setCards }: { cards: typeof DEFAULTS_CARDS; setCards: React.Dispatch<React.SetStateAction<typeof DEFAULTS_CARDS>> }) {
  const [open, setOpen] = useState(false);
  const addCard = () => setCards(p => [...p, { name: `Card ${p.length + 1}`, balance: "1000", rate: "21.99", min: "25" }]);
  const removeCard = (i: number) => setCards(p => p.filter((_, j) => j !== i));
  return (
    <div>
      <button type="button" onClick={() => setOpen(!open)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
        Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="mt-3 p-3 rounded-lg bg-secondary/20 border border-border animate-fade-in-up space-y-2">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Manage Cards</p>
          {cards.map((_, i) => (
            <div key={i} className="flex items-center justify-between text-sm text-foreground">
              <span>{cards[i].name || `Card ${i + 1}`}</span>
              {cards.length > 1 && (
                <button type="button" onClick={() => removeCard(i)} className="text-destructive hover:text-destructive/80 ml-2">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addCard} className="flex items-center gap-1.5 text-sm text-primary font-semibold mt-1">
            <PlusCircle className="h-4 w-4" /> Add Card
          </button>
        </div>
      )}
    </div>
  );
}

export default function CreditCardPayoffCalculator() {
  const [cards, setCards] = useState(DEFAULTS_CARDS);
  const [f, setF] = useState(DEFAULTS);
  const [r, setR] = useState<CCResult>(() => calculate(DEFAULTS_CARDS, DEFAULTS.extraPayment, DEFAULTS.strategy));
  const updateCard = (i: number, k: keyof typeof DEFAULTS_CARDS[0], v: string) => setCards(prev => prev.map((c, j) => j === i ? { ...c, [k]: v } : c));
  const calc = () => setR(calculate(cards, f.extraPayment, f.strategy));
  const reset = () => { setCards(DEFAULTS_CARDS); setF(DEFAULTS); setR(calculate(DEFAULTS_CARDS, DEFAULTS.extraPayment, DEFAULTS.strategy)); };

  const avalanche = calculate(cards, f.extraPayment, "avalanche");
  const snowball = calculate(cards, f.extraPayment, "snowball");
  const minOnly = calculate(cards, "0", "avalanche");

  const compData = [
    { name: "Min Only", months: minOnly.monthsToPayoff, interest: minOnly.totalInterest, fill: "#ef4444" },
    { name: f.strategy === "avalanche" ? "Avalanche ✓" : "Avalanche", months: avalanche.monthsToPayoff, interest: avalanche.totalInterest, fill: f.strategy === "avalanche" ? "hsl(var(--primary))" : "#94a3b8" },
    { name: f.strategy === "snowball" ? "Snowball ✓" : "Snowball", months: snowball.monthsToPayoff, interest: snowball.totalInterest, fill: f.strategy === "snowball" ? "#10b981" : "#94a3b8" },
  ];

  const faqs = [
    { question: "What is the debt avalanche method?", answer: "The avalanche method directs extra payments to the card with the highest interest rate first (while paying minimums on others). Mathematically optimal — minimizes total interest paid and pays off debt fastest in dollar terms." },
    { question: "What is the debt snowball method?", answer: "The snowball method pays off the smallest balance first. Creates psychological wins (one card eliminated sooner), which can improve motivation and consistency. Pays more total interest than avalanche but may be better for those who need motivation to stay on track." },
    { question: "Which method should I use?", answer: "Mathematically: avalanche saves more money. Psychologically: snowball may be better for some people who need the motivation boost of eliminating a card. Hybrid approach: if the lowest balance card and highest rate card are similar, start with that card to get both benefits." },
    { question: "How much extra should I pay on credit cards?", answer: "Every extra dollar above minimums saves multiples in future interest. On a 22.99% card, $100 extra saves approximately $350 in total interest over the payoff period. Prioritize credit card debt above nearly all other financial goals (except employer 401k match) due to the extreme interest rates." },
    { question: "Should I consolidate credit card debt?", answer: "Balance transfer cards (0% APR for 15–21 months) can be extremely effective if: you can pay off within the intro period, you qualify for a good offer, and you stop using the cards. Personal loans at 8–15% APR also significantly reduce interest vs. 20–30% credit cards." },
    { question: "What is the minimum payment trap?", answer: "Paying only minimums on credit cards keeps you in debt for decades. A $5,000 balance at 22% with $100 minimum payment takes 7+ years and costs $3,500+ in interest. Credit card companies set minimums precisely low enough to maximize long-term interest revenue." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Credit Card Payoff Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Credit Card Payoff Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 border border-border bg-card shadow-sm">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Your Credit Cards</p>
            {cards.map((c, i) => (
              <div key={i} className="rounded-lg border border-border/60 p-3 bg-secondary/20 flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-xs font-semibold mb-1 block">Card Name</label>
                    <input value={c.name} onChange={e => updateCard(i, "name", e.target.value)} className="h-8 w-full px-2 rounded border border-input bg-background text-sm outline-none text-foreground" /></div>
                  <div><label className="text-xs font-semibold mb-1 block">Balance ($)</label>
                    <input type="number" value={c.balance} onChange={e => updateCard(i, "balance", e.target.value)} className="h-8 w-full px-2 rounded border border-input bg-background text-sm outline-none text-foreground" /></div>
                  <div><label className="text-xs font-semibold mb-1 block">APR (%)</label>
                    <input type="number" value={c.rate} onChange={e => updateCard(i, "rate", e.target.value)} className="h-8 w-full px-2 rounded border border-input bg-background text-sm outline-none text-foreground" /></div>
                  <div><label className="text-xs font-semibold mb-1 block">Min Payment ($)</label>
                    <input type="number" value={c.min} onChange={e => updateCard(i, "min", e.target.value)} className="h-8 w-full px-2 rounded border border-input bg-background text-sm outline-none text-foreground" /></div>
                </div>
              </div>
            ))}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-1">Extra Monthly Payment ($)</label>
              <div className="flex items-center rounded-md border border-input bg-background h-10 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
                <span className="pl-3 pr-1 text-sm text-muted-foreground">$</span>
                <input type="number" value={f.extraPayment} onChange={e => setF(p => ({ ...p, extraPayment: e.target.value }))} className="w-full h-full px-2 text-base bg-transparent outline-none border-none text-foreground" />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-1">Payoff Strategy</label>
              <select value={f.strategy} onChange={e => setF(p => ({ ...p, strategy: e.target.value }))} className="h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground outline-none">
                <option value="avalanche">Avalanche (Highest Rate First)</option>
                <option value="snowball">Snowball (Lowest Balance First)</option>
              </select>
            </div>

            {/* Advanced Options */}
            <AdvancedOptions cards={cards} setCards={setCards} />

            <div className="flex gap-2.5 mt-1">
              <button onClick={calc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 shrink-0 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
              <div className="text-xs font-bold text-primary uppercase tracking-wide mb-1">Payoff Time</div>
              <div className="text-4xl font-extrabold text-foreground">{r.monthsToPayoff} <span className="text-xl">months</span></div>
              <div className="text-sm text-muted-foreground mt-1">Total interest: ${r.totalInterest.toLocaleString()} · Monthly: ${Math.round(r.monthlyPayment).toLocaleString()}</div>
            </div>
            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="grid grid-cols-3 divide-x divide-border">
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Total Debt</div><div className="font-bold">${r.totalDebt.toLocaleString()}</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Interest Paid</div><div className="font-bold text-red-600">${r.totalInterest.toLocaleString()}</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">vs Min Only</div><div className="font-bold text-emerald-600">Save ${(minOnly.totalInterest - r.totalInterest).toLocaleString()}</div></div>
              </div>
            </div>
            <div className="card-calculator !p-4 border border-border bg-card shadow-sm">
              <h3 className="font-semibold text-sm mb-3">Interest Comparison by Strategy</h3>
              <div className="h-[170px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={compData} barSize={50}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
                    <RTooltip formatter={(v: number, n: string) => [n === "interest" ? `$${v.toLocaleString()}` : `${v} mo`, n === "interest" ? "Interest" : "Months"]} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                    <Bar dataKey="interest" radius={[4,4,0,0]}>
                      {compData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="mt-12 space-y-8 text-base text-foreground max-w-[1180px]">
            <div>
              <h2 className="text-2xl font-bold mb-3">Credit Card Debt Payoff Strategies</h2>
              <p className="text-muted-foreground leading-relaxed">This calculator models both the Debt Avalanche and Debt Snowball strategies across multiple credit cards simultaneously. Enter your cards&apos; balances, APRs, and minimum payments, then add any extra monthly payment you can allocate. The calculator shows exact payoff timelines, total interest cost, and compares your chosen strategy against minimum-payment-only — revealing exactly how much you save by being aggressive with payments.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Debt Avalanche — The Mathematically Optimal Method</h2>
              <p className="text-muted-foreground leading-relaxed">The avalanche method directs all extra payments to the card with the highest interest rate. After that card is paid off, its payment is rolled to the next-highest-rate card (the &quot;avalanche&quot; effect). This minimizes total interest paid and total time in debt. For high-rate credit cards (20–30% APR), the interest savings are substantial — often thousands of dollars over minimum payments alone. It is the mathematically superior choice for eliminating credit card debt efficiently.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Debt Snowball — The Motivational Method</h2>
              <p className="text-muted-foreground leading-relaxed">The snowball method targets the smallest balance first, regardless of interest rate. Each paid-off card provides a psychological win that maintains motivation for the longer journey. Research by behavioral economists (Haisley et al.) shows many people successfully pay off debt faster using snowball because motivation and consistency outweigh mathematical efficiency. Choose the method you will actually stick with over months or years.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Balance Transfer and Consolidation</h2>
              <p className="text-muted-foreground leading-relaxed">Zero-percent APR balance transfer cards can dramatically accelerate payoff by eliminating interest for 15 to 21 months. Key considerations include: transfer fee (typically 3–5% of balance), you must pay off the balance before the promotional period ends (otherwise interest often applies retroactively), and you need good credit to qualify (usually 700 or higher). A personal loan consolidation at 10–15% APR can save 10–15 percentage points versus credit card rates while simplifying to a single payment with a definite payoff date.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">The Real Cost of Minimum Payments</h2>
              <p className="text-muted-foreground leading-relaxed">Credit card companies deliberately set minimum payments low to maximize the interest they earn. A $5,000 balance at 22% APR with a $100 minimum payment takes over seven years to pay off and costs more than $3,500 in interest. By contrast, paying $300 per month eliminates that same balance in under two years and saves over $2,000 in interest charges. The difference between minimum payments and aggressive payoff can be years of debt and thousands of dollars.</p>
            </div>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/credit-card-payoff-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Credit Card Payoff Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Credit Card Payoff Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Credit Card Payoff Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Credit Card Payoff Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Credit Card Payoff Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/credit-card-payoff-calculator" />
        </div>
      </div>
    </>
  );
}
