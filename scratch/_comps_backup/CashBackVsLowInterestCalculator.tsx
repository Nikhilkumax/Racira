"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";

interface CBResult {
  cashBackSavings: number;
  lowInterestSavings: number;
  cashBackTotalInterest: number;
  lowInterestTotalInterest: number;
  cashBackMonthly: number;
  lowInterestMonthly: number;
  breakEvenMonths: number;
  winner: "cashback" | "lowinterest" | "tie";
  netAdvantage: number;
  standardTotalInterest: number;
}

const DEFAULTS = {
  price: "35000",
  standardRate: "7.9",
  lowRate: "1.9",
  cashBackPct: "2",
  term: "60",
  downPayment: "3500",
};

function calculate(d: typeof DEFAULTS): CBResult {
  const price = parseFloat(d.price) || 0;
  const standardRate = parseFloat(d.standardRate) || 0;
  const lowRate = parseFloat(d.lowRate) || 0;
  const cashBackPct = parseFloat(d.cashBackPct) || 0;
  const term = parseInt(d.term) || 60;
  const down = parseFloat(d.downPayment) || 0;

  const loanAmount = price - down;
  const cashBack = price * (cashBackPct / 100);

  // Standard rate loan
  const r1 = standardRate / 100 / 12;
  const stdPayment = r1 > 0 ? loanAmount * (r1 * Math.pow(1 + r1, term)) / (Math.pow(1 + r1, term) - 1) : loanAmount / term;
  const stdTotalInterest = stdPayment * term - loanAmount;

  // Cash-back option: take cash rebate, finance at standard rate
  const cbLoanAfterRebate = loanAmount - cashBack;
  const cbPayment = r1 > 0 ? cbLoanAfterRebate * (r1 * Math.pow(1 + r1, term)) / (Math.pow(1 + r1, term) - 1) : cbLoanAfterRebate / term;
  const cbTotalInterest = cbPayment * term - cbLoanAfterRebate;
  const cashBackSavings = stdTotalInterest - cbTotalInterest;

  // Low-interest option: no rebate, finance at low rate
  const r2 = lowRate / 100 / 12;
  const liPayment = r2 > 0 ? loanAmount * (r2 * Math.pow(1 + r2, term)) / (Math.pow(1 + r2, term) - 1) : loanAmount / term;
  const liTotalInterest = liPayment * term - loanAmount;
  const lowInterestSavings = stdTotalInterest - liTotalInterest;

  const netAdvantage = Math.abs(cashBackSavings - lowInterestSavings);
  let winner: CBResult["winner"] = "tie";
  if (cashBackSavings > lowInterestSavings + 1) winner = "cashback";
  else if (lowInterestSavings > cashBackSavings + 1) winner = "lowinterest";

  const breakEvenMonths = cashBack > 0 ? Math.round(cashBack / ((liPayment - cbPayment) || 1)) : 0;

  return {
    cashBackSavings,
    lowInterestSavings,
    cashBackTotalInterest: cbTotalInterest,
    lowInterestTotalInterest: liTotalInterest,
    cashBackMonthly: cbPayment,
    lowInterestMonthly: liPayment,
    breakEvenMonths,
    winner,
    netAdvantage,
    standardTotalInterest: stdTotalInterest,
  };
}

const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
const fmt2 = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

export default function CashBackVsLowInterestCalculator() {
  const [f, setF] = useState(DEFAULTS);
  const [result, setResult] = useState<CBResult>(() => calculate(DEFAULTS));

  const set = (k: keyof typeof DEFAULTS) => (v: string) => setF(prev => ({ ...prev, [k]: v }));
  const handleCalc = () => setResult(calculate(f));
  const handleReset = () => { setF(DEFAULTS); setResult(calculate(DEFAULTS)); };

  const onKey = (e: React.KeyboardEvent) => { if (e.key === "Enter") handleCalc(); };

  const barData = [
    { name: "Cash Back Option", interest: Math.round(result.cashBackTotalInterest), fill: result.winner === "cashback" ? "hsl(var(--primary))" : "#94a3b8" },
    { name: "Low Interest Option", interest: Math.round(result.lowInterestTotalInterest), fill: result.winner === "lowinterest" ? "hsl(var(--primary))" : "#94a3b8" },
  ];

  const faqs = [
    { question: "What is a cash-back vs low-interest calculator?", answer: "It compares two dealer financing incentives: a cash rebate (applied to reduce your loan principal) versus a low promotional interest rate. Both reduce your cost, but the better option depends on loan amount, term, and rates." },
    { question: "How does the cash-back option work?", answer: "The manufacturer gives you a lump-sum cash rebate (e.g., 2% of the vehicle price) that reduces your down payment or loan principal. You then finance the remainder at the standard market rate." },
    { question: "How does the low-interest option work?", answer: "You forgo the rebate but receive a subsidized interest rate (e.g., 0% or 1.9%) on the full loan amount. The lower rate reduces total interest paid over the loan term." },
    { question: "Which option is usually better for short loan terms?", answer: "For shorter terms (24-36 months), cash back often wins because there is less time for the rate difference to compound. For longer terms (60-72 months), low interest usually saves more total money." },
    { question: "Can I negotiate both at the same time?", answer: "Typically not — these are mutually exclusive incentives offered by the manufacturer. You must choose one at the time of purchase. Dealers may not allow combining them with other offers either." },
    { question: "What if I plan to pay off the loan early?", answer: "If you plan to pay off early, cash back is often better since the interest savings from the low rate diminish with a shorter effective term. Use our break-even months figure to guide your decision." },
    { question: "Does the calculator account for taxes and fees?", answer: "This calculator focuses on the financing decision itself. Taxes and fees are typically the same regardless of which financing option you choose, so they do not affect the comparison." },
    { question: "What is the break-even point?", answer: "The break-even is the number of months at which the total cost of both options becomes equal. If you keep the loan longer than the break-even, one option becomes superior." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Cash Back vs Low Interest Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Cash Back vs Low Interest Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">

          {/* LEFT */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-foreground mb-1">Vehicle Price</label>
                <div className="flex items-center rounded-md border border-input bg-background h-9 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
                  <span className="pl-3 pr-1 text-sm text-muted-foreground">$</span>
                  <input type="number" value={f.price} onChange={e => set("price")(e.target.value)} onKeyDown={onKey} className="w-full h-full px-2 text-base bg-transparent outline-none border-none text-foreground" />
                </div>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-foreground mb-1">Down Payment</label>
                <div className="flex items-center rounded-md border border-input bg-background h-9 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
                  <span className="pl-3 pr-1 text-sm text-muted-foreground">$</span>
                  <input type="number" value={f.downPayment} onChange={e => set("downPayment")(e.target.value)} onKeyDown={onKey} className="w-full h-full px-2 text-base bg-transparent outline-none border-none text-foreground" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-foreground mb-1">Standard Rate (%)</label>
                <div className="flex items-center rounded-md border border-input bg-background h-9 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
                  <input type="number" value={f.standardRate} onChange={e => set("standardRate")(e.target.value)} onKeyDown={onKey} className="w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground" />
                  <span className="pr-3 pl-1 text-sm text-muted-foreground">%</span>
                </div>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-foreground mb-1">Low Interest Rate (%)</label>
                <div className="flex items-center rounded-md border border-input bg-background h-9 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
                  <input type="number" value={f.lowRate} onChange={e => set("lowRate")(e.target.value)} onKeyDown={onKey} className="w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground" />
                  <span className="pr-3 pl-1 text-sm text-muted-foreground">%</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-foreground mb-1">Cash Back (%)</label>
                <div className="flex items-center rounded-md border border-input bg-background h-9 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
                  <input type="number" value={f.cashBackPct} onChange={e => set("cashBackPct")(e.target.value)} onKeyDown={onKey} className="w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground" />
                  <span className="pr-3 pl-1 text-sm text-muted-foreground">%</span>
                </div>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-foreground mb-1">Loan Term (months)</label>
                <select value={f.term} onChange={e => set("term")(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20">
                  {[24, 36, 48, 60, 72, 84].map(t => <option key={t} value={t}>{t} months</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-1">
              <button onClick={handleCalc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 text-base transition-all">Calculate</button>
              <button onClick={handleReset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-9 flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-3">
            {/* Winner Card */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">
                {result.winner === "tie" ? "It's a Tie" : "Better Option"}
              </div>
              <div className={`text-4xl font-bold ${result.winner === "cashback" ? "text-primary" : result.winner === "lowinterest" ? "text-emerald-600" : "text-foreground"}`}>
                {result.winner === "cashback" ? "Cash Back Wins" : result.winner === "lowinterest" ? "Low Interest Wins" : "Nearly Equal"}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {result.winner !== "tie" ? `Net advantage: ${fmt(result.netAdvantage)} in total interest` : "Both options cost nearly the same"}
              </div>
            </div>

            {/* 3-stat bar */}
            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="grid grid-cols-3 divide-x divide-border">
                <div className="p-3 text-center">
                  <div className="text-xs uppercase text-muted-foreground font-medium mb-1">Cash Back Saved</div>
                  <div className="text-lg font-bold text-primary">{fmt(result.cashBackSavings)}</div>
                </div>
                <div className="p-3 text-center">
                  <div className="text-xs uppercase text-muted-foreground font-medium mb-1">Low Rate Saved</div>
                  <div className="text-lg font-bold text-emerald-600">{fmt(result.lowInterestSavings)}</div>
                </div>
                <div className="p-3 text-center">
                  <div className="text-xs uppercase text-muted-foreground font-medium mb-1">Break-even</div>
                  <div className="text-lg font-bold text-foreground">{result.breakEvenMonths > 0 ? `${result.breakEvenMonths} mo` : "N/A"}</div>
                </div>
              </div>
            </div>

            {/* Breakdown Table */}
            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="bg-secondary/50 px-4 py-2.5 border-b border-border/50">
                <h3 className="font-bold text-foreground text-sm">Side-by-Side Comparison</h3>
              </div>
              <div className="divide-y divide-border/50 text-base">
                {[
                  { label: "Cash Back Amount", cb: fmt(parseFloat(f.price) * parseFloat(f.cashBackPct) / 100), li: "—" },
                  { label: "Effective Loan Amount", cb: fmt(parseFloat(f.price) - parseFloat(f.downPayment) - parseFloat(f.price) * parseFloat(f.cashBackPct) / 100), li: fmt(parseFloat(f.price) - parseFloat(f.downPayment)) },
                  { label: "Interest Rate", cb: `${f.standardRate}%`, li: `${f.lowRate}%` },
                  { label: "Monthly Payment", cb: fmt2(result.cashBackMonthly), li: fmt2(result.lowInterestMonthly), highlight: true },
                  { label: "Total Interest Paid", cb: fmt(result.cashBackTotalInterest), li: fmt(result.lowInterestTotalInterest), highlight: true },
                  { label: "Savings vs. Standard Rate", cb: fmt(result.cashBackSavings), li: fmt(result.lowInterestSavings) },
                ].map((row, i) => (
                  <div key={i} className={`grid grid-cols-3 px-4 py-2.5 ${row.highlight ? "bg-primary/5" : "hover:bg-secondary/20"}`}>
                    <div className="text-muted-foreground">{row.label}</div>
                    <div className="font-semibold text-center">{row.cb}</div>
                    <div className="font-semibold text-center text-emerald-600">{row.li}</div>
                  </div>
                ))}
                <div className="grid grid-cols-3 px-4 py-2.5 bg-secondary/20 font-bold border-t-2 border-border">
                  <div className="text-foreground">Option</div>
                  <div className="text-center text-primary">Cash Back</div>
                  <div className="text-center text-emerald-600">Low Interest</div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="card-calculator !p-4 border border-border bg-card shadow-sm">
              <h3 className="font-semibold text-foreground text-sm mb-3">Total Interest Paid Comparison</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} barGap={20}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                    <RechartsTooltip formatter={(v: number) => fmt(v)} contentStyle={{ borderRadius: "8px", fontSize: "13px" }} />
                    <Bar dataKey="interest" radius={[4, 4, 0, 0]}>
                      {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-muted/30 rounded-lg p-5 border border-border">
              <h3 className="text-base font-semibold text-foreground mb-3">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-base">
                <div className="text-muted-foreground">Vehicle Price</div><div className="font-semibold text-right">{fmt(parseFloat(f.price))}</div>
                <div className="text-muted-foreground">Down Payment</div><div className="font-semibold text-right">{fmt(parseFloat(f.downPayment))}</div>
                <div className="text-muted-foreground">Loan Term</div><div className="font-semibold text-right">{f.term} months</div>
                <div className="text-muted-foreground">CB Monthly Payment</div><div className="font-semibold text-right">{fmt2(result.cashBackMonthly)}</div>
                <div className="text-muted-foreground">LI Monthly Payment</div><div className="font-semibold text-right">{fmt2(result.lowInterestMonthly)}</div>
                <div className="text-muted-foreground">CB Total Interest</div><div className="font-semibold text-right">{fmt(result.cashBackTotalInterest)}</div>
                <div className="text-muted-foreground">LI Total Interest</div><div className="font-semibold text-right">{fmt(result.lowInterestTotalInterest)}</div>
              </div>
              <div className="border-t border-border pt-3 mt-3 font-bold text-primary text-base flex justify-between">
                <span>Net Advantage ({result.winner === "cashback" ? "Cash Back" : "Low Interest"})</span>
                <span>{fmt(result.netAdvantage)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is the Cash Back vs Low Interest Calculator?</h2>
            <p>When financing a vehicle purchase, dealers often offer two mutually exclusive incentives: a cash rebate or a subsidized interest rate. This cash back vs low interest calculator helps you determine which incentive saves you more money over the life of your loan. The right choice depends on the loan amount, term length, rate differential, and how long you plan to keep the financing in place.</p>
            <p>This tool is used by car buyers, fleet managers, and personal finance planners who want to make an informed financing decision rather than relying on the dealer's recommendation.</p>

            <h2 className="text-2xl font-bold mb-3">How It Works — The Formulas</h2>
            <p>Both options are compared using the standard amortization formula: M = P × [r(1+r)^n] / [(1+r)^n − 1], where P is the principal, r is the monthly interest rate, and n is the number of payments.</p>
            <p><strong>Cash Back Option:</strong> The rebate reduces your loan principal. You finance (Vehicle Price − Down Payment − Cash Rebate) at the standard market rate. Total interest = (Monthly Payment × n) − Reduced Principal.</p>
            <p><strong>Low Interest Option:</strong> No rebate is applied; you finance the full (Vehicle Price − Down Payment) at the promotional rate. Total interest = (Monthly Payment × n) − Full Principal.</p>
            <p>The <strong>break-even point</strong> is calculated by dividing the cash rebate by the monthly payment difference between the two options. If you plan to pay off the loan before the break-even, cash back is likely better.</p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>The primary result card highlights the winning option — the one that results in lower total interest paid. The savings figures represent how much each option saves compared to financing at the full standard rate with no incentive. The break-even months indicate when the two options are equivalent in total cost.</p>

            <h2 className="text-2xl font-bold mb-3">Key Factors Explained</h2>
            <p><strong>Vehicle Price:</strong> The MSRP or negotiated purchase price. Both rebate and interest savings scale with this number.</p>
            <p><strong>Standard Rate:</strong> The benchmark financing rate without any incentives, typically 6–9% for new vehicles. This is what you would pay if you took the cash-back option.</p>
            <p><strong>Low Interest Rate:</strong> The promotional rate offered by the manufacturer, ranging from 0% to 3.9% in typical campaigns.</p>
            <p><strong>Cash Back Percentage:</strong> The rebate expressed as a percentage of the vehicle price. Common rebates range from 1% to 5%.</p>
            <p><strong>Loan Term:</strong> Longer terms (72 months) favor low interest because the rate difference compounds over more periods. Short terms (24 months) often favor cash back.</p>

            <h2 className="text-2xl font-bold mb-3">Practical Examples</h2>
            <p><strong>Example 1 — Short Term:</strong> $35,000 vehicle, 36-month term, 7.9% vs 1.9% with 2% cash back ($700). Cash back wins because the short term limits interest accumulation.</p>
            <p><strong>Example 2 — Long Term:</strong> Same vehicle at 72 months. The low interest rate saves far more total interest, making 1.9% financing the clear winner.</p>
            <p><strong>Example 3 — High Rebate:</strong> A 5% cash back on a $40,000 vehicle ($2,000 rebate) at 60 months may beat a 0.9% rate if the standard rate is high enough to create large interest savings on the reduced balance.</p>

            <h2 className="text-2xl font-bold mb-3">Tips and Best Practices</h2>
            <p>Always negotiate the vehicle price before discussing financing — dealers sometimes inflate prices when buyers focus on the monthly payment. Check if the promotional rate has income or credit score requirements. In some cases, a bank loan at a competitive rate combined with the cash rebate beats both dealer options. If you plan to refinance early, lean toward cash back. Consider the opportunity cost: cash back is immediate value, while interest savings accrue over time.</p>

            <h2 className="text-2xl font-bold mb-3">Benefits of Using This Calculator</h2>
            <p>This calculator eliminates guesswork from one of the most common automotive financing decisions. It performs precise amortization math in real time, calculates your break-even point, and delivers a clear winner with a quantified advantage — giving you negotiating confidence at the dealership.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cash-back-vs-low-interest-calculator" />
          <PopularCalculators exclude="/calculator/cash-back-vs-low-interest-calculator" />
        </div>
      </div>
    </>
  );
}
