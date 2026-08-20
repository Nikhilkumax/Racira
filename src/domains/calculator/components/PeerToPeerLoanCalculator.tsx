"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell } from "recharts";

/* ─── Interfaces ─────────────────────────────────────────────────────────── */

interface P2PInputs {
  loanAmount: number;
  interestRate: number;
  loanTermYears: number;
  originationFeePct: number;
  lateFee: number;
  latePaymentsExpected: number;
  bankRate: number;
}

interface P2PResult {
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  originationFee: number;
  effectiveAmount: number;
  aprEstimate: number;
  bankMonthlyPayment: number;
  bankTotalCost: number;
  savingsVsBank: number;
  amortization: { year: number; principal: number; interest: number; balance: number }[];
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; p2p: number; bank: number }[];
}

/* ─── Pure Calculation ───────────────────────────────────────────────────── */

function calcP2P(inp: P2PInputs): P2PResult {
  const r = inp.interestRate / 100 / 12;
  const n = inp.loanTermYears * 12;
  const P = inp.loanAmount;

  // PMT formula
  const monthlyPayment = r > 0 ? (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : P / n;
  const totalInterest = monthlyPayment * n - P;
  const originationFee = P * (inp.originationFeePct / 100);
  const effectiveAmount = P - originationFee;
  const totalCost = monthlyPayment * n + originationFee;
  const lateCosts = inp.lateFee * inp.latePaymentsExpected * inp.loanTermYears;
  const totalCostWithLate = totalCost + lateCosts;

  // Rough APR estimate (simple: total interest + fees over loan amount)
  const aprEstimate = P > 0 ? ((totalInterest + originationFee) / P / (inp.loanTermYears)) * 2 * 100 : 0;

  // Bank comparison
  const bankR = inp.bankRate / 100 / 12;
  const bankMonthlyPayment = bankR > 0 ? (P * bankR * Math.pow(1 + bankR, n)) / (Math.pow(1 + bankR, n) - 1) : P / n;
  const bankTotalCost = bankMonthlyPayment * n;
  const savingsVsBank = bankTotalCost - totalCostWithLate;

  // Amortization schedule
  let balance = P;
  const amortization: P2PResult["amortization"] = [];
  for (let yr = 1; yr <= inp.loanTermYears; yr++) {
    let yearPrincipal = 0;
    let yearInterest = 0;
    for (let m = 0; m < 12; m++) {
      if (balance <= 0) break;
      const interestPart = balance * r;
      const principalPart = Math.min(monthlyPayment - interestPart, balance);
      yearPrincipal += principalPart;
      yearInterest += interestPart;
      balance -= principalPart;
    }
    amortization.push({ year: yr, principal: Math.round(yearPrincipal), interest: Math.round(yearInterest), balance: Math.max(0, Math.round(balance)) });
  }

  const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
  const fmtD = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const breakdown = [
    { label: "Loan Amount", value: `$${fmt(P)}` },
    { label: "Origination Fee", value: `$${fmt(originationFee)} (${inp.originationFeePct}%)` },
    { label: "Effective Amount Received", value: `$${fmt(effectiveAmount)}` },
    { label: "Interest Rate", value: `${inp.interestRate}%/yr` },
    { label: "Loan Term", value: `${inp.loanTermYears} years (${n} months)` },
    { label: "Monthly Payment", value: `$${fmtD(monthlyPayment)}`, highlight: true },
    { label: "Total Interest", value: `$${fmt(totalInterest)}` },
    { label: "Total Cost (incl. fees)", value: `$${fmt(totalCostWithLate)}`, highlight: true },
    { label: "Bank Comparison Total", value: `$${fmt(bankTotalCost)}` },
    { label: "Savings vs Bank", value: savingsVsBank > 0 ? `$${fmt(savingsVsBank)}` : `−$${fmt(Math.abs(savingsVsBank))}` },
  ];

  const summaryStats = [
    { label: "Monthly Payment", value: `$${fmtD(monthlyPayment)}` },
    { label: "Total Cost", value: `$${fmt(totalCostWithLate)}` },
    { label: "Total Interest", value: `$${fmt(totalInterest)}` },
    { label: "Origination Fee", value: `$${fmt(originationFee)}` },
    { label: "Effective APR (est.)", value: `${aprEstimate.toFixed(2)}%` },
    { label: "Bank Monthly", value: `$${fmtD(bankMonthlyPayment)}` },
    { label: "Bank Total Cost", value: `$${fmt(bankTotalCost)}` },
    { label: "Savings vs Bank", value: savingsVsBank > 0 ? `$${fmt(savingsVsBank)}` : `−$${fmt(Math.abs(savingsVsBank))}` },
  ];

  const chartData = [
    { name: "Monthly Payment", p2p: Math.round(monthlyPayment), bank: Math.round(bankMonthlyPayment) },
    { name: "Total Interest", p2p: Math.round(totalInterest), bank: Math.round(bankTotalCost - P) },
    { name: "Total Cost", p2p: Math.round(totalCostWithLate), bank: Math.round(bankTotalCost) },
    { name: "Origination Fee", p2p: Math.round(originationFee), bank: 0 },
  ];

  return { monthlyPayment, totalInterest, totalCost: totalCostWithLate, originationFee, effectiveAmount, aprEstimate, bankMonthlyPayment, bankTotalCost, savingsVsBank, amortization, breakdown, summaryStats, chartData };
}

/* ─── Defaults ───────────────────────────────────────────────────────────── */

const DEFAULTS: P2PInputs = { loanAmount: 10000, interestRate: 12, loanTermYears: 3, originationFeePct: 3, lateFee: 25, latePaymentsExpected: 0, bankRate: 9 };

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function PeerToPeerLoanCalculator() {
  const [loanAmount, setLoanAmount] = useState(String(DEFAULTS.loanAmount));
  const [interestRate, setInterestRate] = useState(String(DEFAULTS.interestRate));
  const [loanTermYears, setLoanTermYears] = useState(String(DEFAULTS.loanTermYears));
  const [originationFeePct, setOriginationFeePct] = useState(String(DEFAULTS.originationFeePct));
  const [lateFee, setLateFee] = useState(String(DEFAULTS.lateFee));
  const [latePayments, setLatePayments] = useState(String(DEFAULTS.latePaymentsExpected));
  const [bankRate, setBankRate] = useState(String(DEFAULTS.bankRate));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<P2PResult | null>(null);

  const getInputs = (): P2PInputs => ({
    loanAmount: parseFloat(loanAmount) || 0, interestRate: parseFloat(interestRate) || 0,
    loanTermYears: parseInt(loanTermYears) || 1, originationFeePct: parseFloat(originationFeePct) || 0,
    lateFee: parseFloat(lateFee) || 0, latePaymentsExpected: parseInt(latePayments) || 0,
    bankRate: parseFloat(bankRate) || 0,
  });

  const calculate = () => setResult(calcP2P(getInputs()));
  const reset = () => {
    setLoanAmount(String(DEFAULTS.loanAmount)); setInterestRate(String(DEFAULTS.interestRate));
    setLoanTermYears(String(DEFAULTS.loanTermYears)); setOriginationFeePct(String(DEFAULTS.originationFeePct));
    setLateFee(String(DEFAULTS.lateFee)); setLatePayments(String(DEFAULTS.latePaymentsExpected));
    setBankRate(String(DEFAULTS.bankRate));
    setResult(calcP2P(DEFAULTS));
  };

  useEffect(() => { setResult(calcP2P(DEFAULTS)); }, []);

  const faqs = [
    { question: "What is a peer-to-peer loan?", answer: "A peer-to-peer (P2P) loan is funded by individual investors through an online platform rather than a traditional bank. Platforms like LendingClub, Prosper, and Funding Circle connect borrowers directly with investors. P2P loans often have faster approval, but may carry higher interest rates and origination fees than bank loans." },
    { question: "What is an origination fee?", answer: "An origination fee is an upfront charge deducted from your loan amount — typically 1%–8% of the loan. On a $10,000 loan with a 3% origination fee, you receive $9,700 but repay based on the full $10,000. This effectively increases your APR beyond the stated interest rate." },
    { question: "How does P2P compare to bank loans?", answer: "P2P loans typically have higher interest rates (8%–36%) than bank personal loans (6%–15%), but are easier to qualify for with fair or poor credit. Banks require good credit (670+), while P2P platforms may accept scores as low as 580. The trade-off: higher rate for easier access." },
    { question: "Are P2P loan interest payments tax-deductible?", answer: "Generally no — personal loan interest is not tax-deductible. However, if you use a P2P loan for business purposes, the interest may be deductible as a business expense. Consult a tax professional for your specific situation." },
  ];

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Peer-to-Peer Loan Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Peer-to-Peer Loan Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Loan Amount ($)</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Interest Rate (%)</label>
                <div className={inp}><input type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} step="0.1" className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Loan Term</label>
                <div className={inp}><input type="number" value={loanTermYears} onChange={e => setLoanTermYears(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">years</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Origination Fee (%)</label>
                <div className={inp}><input type="number" value={originationFeePct} onChange={e => setOriginationFeePct(e.target.value)} step="0.1" className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus:outline-none">
                Advanced Options
                <svg className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-3 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Fees & Comparison</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Late Fee ($)</label>
                      <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={lateFee} onChange={e => setLateFee(e.target.value)} className={ci} /></div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Late Payments Expected</label>
                      <div className={inp}><input type="number" value={latePayments} onChange={e => setLatePayments(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">total</span></div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Bank Loan Rate (for comparison, %)</label>
                    <div className={inp}><input type="number" value={bankRate} onChange={e => setBankRate(e.target.value)} step="0.1" className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Monthly Payment</div>
                <div className="text-4xl font-extrabold tracking-tight text-foreground">${result.monthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="text-sm text-muted-foreground mt-1">Total Cost: ${result.totalCost.toLocaleString("en-US", { maximumFractionDigits: 0 })} · APR (est.): {result.aprEstimate.toFixed(2)}%</div>
              </div>

              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[
                  ["Origination Fee", `$${result.originationFee.toLocaleString("en-US", { maximumFractionDigits: 0 })}`],
                  ["Total Interest", `$${result.totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}`],
                  ["Savings vs Bank", `${result.savingsVsBank >= 0 ? "" : "−"}$${Math.abs(result.savingsVsBank).toLocaleString("en-US", { maximumFractionDigits: 0 })}`],
                ].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>

              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Loan Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight ? "bg-primary/5" : ""}`}>
                      <td className={`py-2.5 ${r.highlight ? "font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right ${r.highlight ? "font-bold" : "font-semibold"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">P2P vs Bank Comparison</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="p2p" fill="hsl(var(--primary))" name="P2P Loan" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="bank" fill="#10b981" name="Bank Loan" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {result.amortization.length > 0 && (
                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Year-by-Year Amortization</h3>
                  <table className="w-full text-base">
                    <thead><tr className="border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="py-2 text-left">Year</th><th className="py-2 text-right">Principal</th><th className="py-2 text-right">Interest</th><th className="py-2 text-right">Balance</th>
                    </tr></thead>
                    <tbody>
                      {result.amortization.map(row => (
                        <tr key={row.year} className="border-b border-border/50 last:border-0">
                          <td className="py-2.5 text-muted-foreground">{row.year}</td>
                          <td className="py-2.5 text-right font-semibold">${row.principal.toLocaleString()}</td>
                          <td className="py-2.5 text-right font-semibold">${row.interest.toLocaleString()}</td>
                          <td className="py-2.5 text-right font-semibold">${row.balance.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Peer-to-Peer Loan?</h2>
            <p>A peer-to-peer (P2P) loan is a personal loan funded by individual investors through an online platform rather than a bank or credit union. Platforms like LendingClub, Prosper, and Funding Circle match borrowers with investors willing to fund their loans in exchange for interest payments.</p>
            <h2 className="text-2xl font-bold mb-3">P2P Loans vs Traditional Bank Loans</h2>
            <p>P2P loans typically have higher interest rates (8%–36%) than bank personal loans (6%–15%), but offer faster approval, more flexible credit requirements, and a simpler application process. The trade-off is clear: easier access comes at a higher cost. Always compare the total cost including origination fees.</p>
            <h2 className="text-2xl font-bold mb-3">Understanding the True Cost</h2>
            <p>The stated interest rate doesn&apos;t tell the full story. An origination fee of 3% on a $10,000 loan means you receive $9,700 but repay interest on $10,000 — effectively raising your APR. Our calculator computes both the monthly payment and the estimated APR to give you the complete picture.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/peer-to-peer-loan-calculator" />
          <PopularCalculators exclude="/calculator/peer-to-peer-loan-calculator" />
        </div>
      </div>
    </>
  );
}
