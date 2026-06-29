"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
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
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Credit Card Payoff Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
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
            <div className="flex flex-col"><label className="text-sm font-semibold mb-1">Extra Monthly Payment ($)</label>
              <div className="flex items-center rounded-md border border-input bg-background h-9 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
                <span className="pl-3 pr-1 text-sm text-muted-foreground">$</span>
                <input type="number" value={f.extraPayment} onChange={e => setF(p => ({ ...p, extraPayment: e.target.value }))} className="w-full h-full px-2 text-base bg-transparent outline-none border-none text-foreground" />
              </div></div>
            <div className="flex flex-col"><label className="text-sm font-semibold mb-1">Payoff Strategy</label>
              <select value={f.strategy} onChange={e => setF(p => ({ ...p, strategy: e.target.value }))} className="h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground outline-none">
                <option value="avalanche">Avalanche (Highest Rate First)</option>
                <option value="snowball">Snowball (Lowest Balance First)</option>
              </select></div>
            <div className="flex gap-2 mt-1">
              <button onClick={calc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 transition-all">Calculate</button>
              <button onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-9 flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
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
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>Credit Card Debt Payoff Strategies</h2>
            <p>This calculator models both the Debt Avalanche and Debt Snowball strategies across multiple credit cards simultaneously. Enter your cards&apos; balances, APRs, and minimum payments, then add any extra monthly payment you can allocate. The calculator shows exact payoff timelines, total interest cost, and compares your chosen strategy against minimum-payment-only (revealing exactly how much you save by being aggressive).</p>
            <h2>Debt Avalanche — The Mathematically Optimal Method</h2>
            <p>The avalanche method directs all extra payments to the card with the highest interest rate. After that card is paid off, its payment is added to the next-highest-rate card (the &quot;avalanche&quot; effect). This minimizes total interest paid and total time in debt. For high-rate credit cards (20–30% APR), the interest savings are substantial — often thousands of dollars over minimum payments alone.</p>
            <h2>Debt Snowball — The Motivational Method</h2>
            <p>The snowball method targets the smallest balance first. Each paid-off card provides a psychological win that maintains motivation for the longer journey. Research by behavioral economists (Haisley et al.) shows many people successfully pay off debt faster using snowball because motivation and consistency outweigh mathematical efficiency. Choose the method you will actually stick with.</p>
            <h2>Balance Transfer and Consolidation</h2>
            <p>0% APR balance transfer cards can dramatically accelerate payoff by eliminating interest for 15–21 months. Key considerations: transfer fee (typically 3–5% of balance), must pay off before the promotional period ends (or interest often applies retroactively), and requires good credit to qualify (700+ typically). A personal loan consolidation at 10–15% APR can save 10–15 percentage points vs. credit card rates while simplifying to a single payment with a definite payoff date.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/credit-card-payoff-calculator" />
          <PopularCalculators exclude="/calculator/credit-card-payoff-calculator" />
        </div>
      </div>
    </>
  );
}
