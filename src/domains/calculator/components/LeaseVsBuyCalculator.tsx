"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface LvbInput {
  purchasePrice: number;
  buyDownPayment: number;
  loanRate: number;
  loanTermMonths: number;
  leasePayment: number;
  leaseTermMonths: number;
  leaseDownPayment: number;
  resaleValuePct: number;
}

interface LvbResult {
  monthlyLoanPayment: number;
  buyTotalPaid: number;
  buyRemainingBalance: number;
  buyResaleValue: number;
  buyNetCost: number;
  leaseTotalCost: number;
  difference: number;
  cheaper: string;
  chartData: { name: string; cost: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcLeaseVsBuy(input: LvbInput): LvbResult {
  // Loan payment
  const loanAmount = input.purchasePrice - input.buyDownPayment;
  const r = input.loanRate / 12 / 100;
  const n = input.loanTermMonths;
  const monthlyLoanPayment = r > 0 && n > 0 ? (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : loanAmount / n;

  // Buy over the lease term: payments made + down payment, then subtract equity (resale − remaining balance)
  const term = input.leaseTermMonths;
  const paymentsMade = monthlyLoanPayment * term;
  const balanceAfterTerm = r > 0 ? loanAmount * Math.pow(1 + r, term) - (monthlyLoanPayment * (Math.pow(1 + r, term) - 1)) / r : loanAmount - (monthlyLoanPayment * term);
  const buyResaleValue = input.purchasePrice * (input.resaleValuePct / 100);
  const equity = Math.max(0, buyResaleValue - balanceAfterTerm);
  const buyNetCost = input.buyDownPayment + paymentsMade - equity;

  // Lease cost over its term
  const leaseTotalCost = input.leaseDownPayment + input.leasePayment * term;

  const difference = Math.abs(buyNetCost - leaseTotalCost);
  const cheaper = buyNetCost <= leaseTotalCost ? "Buying" : "Leasing";

  const chartData = [
    { name: `Buy (${term} mo)`, cost: Number(buyNetCost.toFixed(0)), fill: "hsl(var(--primary))" },
    { name: `Lease (${term} mo)`, cost: Number(leaseTotalCost.toFixed(0)), fill: "#f59e0b" },
  ];

  const breakdown = [
    { label: "Purchase Price", value: `$${input.purchasePrice.toLocaleString()}` },
    { label: "Buy Down Payment", value: `$${input.buyDownPayment.toLocaleString()}` },
    { label: "Loan Payment / Month", value: `$${monthlyLoanPayment.toFixed(0)}` },
    { label: "Buy: Paid over Term", value: `$${(input.buyDownPayment + paymentsMade).toLocaleString()}` },
    { label: "Buy: Remaining Balance", value: `$${balanceAfterTerm.toLocaleString()}` },
    { label: "Buy: Resale Value", value: `$${buyResaleValue.toLocaleString()}` },
    { label: "Buy: Net Cost", value: `$${buyNetCost.toLocaleString()}` },
    { label: "Lease: Total Cost", value: `$${leaseTotalCost.toLocaleString()}` },
    { label: "Difference", value: `$${difference.toLocaleString()} (${cheaper} wins)` },
  ];

  const summaryStats = [
    { label: "Buy Net Cost", value: `$${buyNetCost.toLocaleString()}` },
    { label: "Lease Total Cost", value: `$${leaseTotalCost.toLocaleString()}` },
    { label: "Cheaper Option", value: cheaper },
    { label: "Loan Payment", value: `$${monthlyLoanPayment.toFixed(0)}/mo` },
    { label: "Lease Payment", value: `$${input.leasePayment.toFixed(0)}/mo` },
    { label: "Equity After Term", value: `$${equity.toLocaleString()}` },
  ];

  return { monthlyLoanPayment, buyTotalPaid: input.buyDownPayment + paymentsMade, buyRemainingBalance: balanceAfterTerm, buyResaleValue, buyNetCost, leaseTotalCost, difference, cheaper, chartData, breakdown, summaryStats };
}

const DEFAULTS: LvbInput = { purchasePrice: 35000, buyDownPayment: 5000, loanRate: 6, loanTermMonths: 60, leasePayment: 450, leaseTermMonths: 36, leaseDownPayment: 2000, resaleValuePct: 60 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function LeaseVsBuyCalculator() {
  const [price, setPrice] = useState(String(DEFAULTS.purchasePrice));
  const [buyDown, setBuyDown] = useState(String(DEFAULTS.buyDownPayment));
  const [loanRate, setLoanRate] = useState(String(DEFAULTS.loanRate));
  const [loanTerm, setLoanTerm] = useState(String(DEFAULTS.loanTermMonths));
  const [leasePayment, setLeasePayment] = useState(String(DEFAULTS.leasePayment));
  const [leaseTerm, setLeaseTerm] = useState(String(DEFAULTS.leaseTermMonths));
  const [leaseDown, setLeaseDown] = useState(String(DEFAULTS.leaseDownPayment));
  const [resalePct, setResalePct] = useState(String(DEFAULTS.resaleValuePct));
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [result, setResult] = useState<LvbResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcLeaseVsBuy({ purchasePrice: parse(price, DEFAULTS.purchasePrice), buyDownPayment: parse(buyDown, DEFAULTS.buyDownPayment), loanRate: parse(loanRate, DEFAULTS.loanRate), loanTermMonths: Math.max(1, Math.round(parse(loanTerm, DEFAULTS.loanTermMonths))), leasePayment: parse(leasePayment, DEFAULTS.leasePayment), leaseTermMonths: Math.max(1, Math.round(parse(leaseTerm, DEFAULTS.leaseTermMonths))), leaseDownPayment: parse(leaseDown, DEFAULTS.leaseDownPayment), resaleValuePct: parse(resalePct, DEFAULTS.resaleValuePct) }));
  const reset = () => {
    setPrice(String(DEFAULTS.purchasePrice));
    setBuyDown(String(DEFAULTS.buyDownPayment));
    setLoanRate(String(DEFAULTS.loanRate));
    setLoanTerm(String(DEFAULTS.loanTermMonths));
    setLeasePayment(String(DEFAULTS.leasePayment));
    setLeaseTerm(String(DEFAULTS.leaseTermMonths));
    setLeaseDown(String(DEFAULTS.leaseDownPayment));
    setResalePct(String(DEFAULTS.resaleValuePct));
    setResult(calcLeaseVsBuy(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcLeaseVsBuy(DEFAULTS));
  }, []);

  const faqs = [
    { question: "Is it cheaper to lease or buy a car?", answer: "Over a 3-year term, leasing usually has lower monthly payments and lower total cash outlay, but you own nothing at the end. Buying costs more per month but builds equity — after the loan is paid you own a depreciating asset outright. The comparison depends on resale value, interest rate, and how long you keep the car." },
    { question: "How is the buy cost calculated?", answer: "Buying cost over the lease term = down payment + loan payments made − equity gained. Equity = resale value − remaining loan balance after the term. This captures the true cost of ownership: what you paid minus what you keep." },
    { question: "What are the advantages of leasing?", answer: "Lower monthly payments, lower down payment, always driving a new car under warranty, no resale risk — the residual value is the leasing company's problem. Leasing suits people who want a new vehicle every 2–3 years and drive within mileage limits." },
    { question: "What are the advantages of buying?", answer: "You build equity and own the car after the loan term. There are no mileage penalties, no wear-and-tear charges, and you can drive the car for 10+ years at near-zero financing cost. Over the long run — 5+ years — buying is almost always cheaper." },
    { question: "What is a money factor and residual?", answer: "Leases are priced with a money factor (the interest rate expressed as a decimal, e.g. 0.0025 = 6% APR) and a residual value (the car's predicted value at lease end, typically 50–65%). Higher residuals mean lower monthly payments. Always ask for the money factor — dealers prefer to hide it." },
    { question: "What about the mileage limit?", answer: "Standard leases allow 10,000–12,000 miles per year, with excess-mileage charges of $0.15–$0.25 per mile. If you drive 15,000 miles a year, add those costs to the lease total. Buyers face no such constraint — total mileage only affects resale value, which this calculator captures." },
  ];

  const cheaperColor = result ? (result.cheaper === "Buying" ? "text-emerald-600" : "text-amber-500") : "";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Lease vs Buy Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Lease vs Buy Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Vehicle Purchase Price</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Buy Down Payment</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={buyDown} onChange={(e) => setBuyDown(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Loan Interest Rate</label>
                <div className={inp}><input type="number" value={loanRate} onChange={(e) => setLoanRate(e.target.value)} step={0.1} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Loan Term</label>
                <div className={inp}><input type="number" value={loanTerm} onChange={(e) => setLoanTerm(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">mo</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Monthly Lease Payment</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={leasePayment} onChange={(e) => setLeasePayment(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Lease Term</label>
                <div className={inp}><input type="number" value={leaseTerm} onChange={(e) => setLeaseTerm(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">mo</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Lease Down Payment</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={leaseDown} onChange={(e) => setLeaseDown(e.target.value)} className={ci} /></div>
              </div>
            </div>

            <button onClick={() => setAdvancedOpen(!advancedOpen)} className="text-sm text-primary font-medium text-left self-start">
              Advanced Options {advancedOpen ? "▲" : "▼"}
            </button>
            {advancedOpen && (
              <div className="border border-border rounded-lg p-4 flex flex-col gap-3">
                <div>
                  <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">Ownership Assumptions</label>
                  <label className="text-sm font-medium mb-1 block">Resale Value After Term</label>
                  <div className={inp}><input type="number" value={resalePct} onChange={(e) => setResalePct(e.target.value)} step={1} className={ci} /><span className="pr-3 text-muted-foreground text-sm">% of price</span></div>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Cheaper Option</div>
                  <div className={`text-4xl font-extrabold tracking-tight ${cheaperColor}`}>{result.cheaper}</div>
                  <div className="text-sm text-muted-foreground mt-1">Buy: ${result.buyNetCost.toLocaleString()} vs Lease: ${result.leaseTotalCost.toLocaleString()} · ${result.difference.toLocaleString()} apart</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Buy Net Cost", `$${result.buyNetCost.toLocaleString()}`], ["Lease Total", `$${result.leaseTotalCost.toLocaleString()}`], ["Loan Payment", `$${result.monthlyLoanPayment.toFixed(0)}/mo`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Cost Comparison</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 6 || i === 7 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Cost over {leaseTerm} Months</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} />
                      <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} />
                      <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
                        {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                    {result.summaryStats.map((s, i) => (
                      <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Real Cost of Each Path</h2>
            <p>Leasing and buying are different products, not just different payments. Leasing pays for the car's depreciation over the lease term plus financing — you walk away with nothing. Buying pays the full price minus what the car is still worth when you sell. This calculator nets both against the same 3-year horizon so the comparison is apples to apples.</p>
            <h2 className="text-2xl font-bold mb-3">When Leasing Wins</h2>
            <p>Leasing wins when you change cars frequently, want minimum monthly outlay, or drive a car with strong residual values. The lease payment reflects only the portion of value you consume. For business owners, lease payments are often fully deductible, which can flip the math in leasing's favor.</p>
            <h2 className="text-2xl font-bold mb-3">When Buying Wins</h2>
            <p>Buying wins over the long run — after 5+ years the loan is gone and you own the car outright. It also wins for high-mileage drivers (no per-mile penalties) and for anyone who values the equity. If you keep cars 7–10 years, buying typically saves tens of thousands of dollars versus repeated leasing.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/lease-vs-buy-calculator" />
          <PopularCalculators exclude="/calculator/lease-vs-buy-calculator" />
        </div>
      </div>
    </>
  );
}
