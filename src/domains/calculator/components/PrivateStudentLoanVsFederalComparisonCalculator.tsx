"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface Inputs {
  loanAmount: number;
  federalRate: number;
  privateRate: number;
  termYears: number;
  federalFeePct: number;
}

interface Result {
  paymentFederal: number;
  paymentPrivate: number;
  monthlyDifference: number;
  interestFederal: number;
  interestPrivate: number;
  interestSaved: number;
  feeAmount: number;
  totalFederal: number;
  totalPrivate: number;
  totalSaved: number;
  chartData: { name: string; federal: number; private: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

function pmt(p: number, r: number, n: number): number {
  if (r <= 0) return p / n;
  return (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function calc(inp: Inputs): Result {
  const rF = inp.federalRate / 100 / 12;
  const rP = inp.privateRate / 100 / 12;
  const n = inp.termYears * 12;
  const paymentFederal = pmt(inp.loanAmount, rF, n);
  const paymentPrivate = pmt(inp.loanAmount, rP, n);
  const monthlyDifference = Math.max(0, paymentPrivate - paymentFederal);
  const interestFederal = paymentFederal * n - inp.loanAmount;
  const interestPrivate = paymentPrivate * n - inp.loanAmount;
  const interestSaved = Math.max(0, interestPrivate - interestFederal);
  const feeAmount = (inp.loanAmount * inp.federalFeePct) / 100;
  const totalFederal = inp.loanAmount + interestFederal + feeAmount;
  const totalPrivate = inp.loanAmount + interestPrivate;
  const totalSaved = Math.max(0, totalPrivate - totalFederal);

  const chartData = [
    { name: "Federal", federal: Math.round(paymentFederal), private: 0 },
    { name: "Private", federal: 0, private: Math.round(paymentPrivate) },
  ];

  const fmt = (x: number) => "$" + Math.round(x).toLocaleString("en-US");
  const fmtD = (x: number) => "$" + x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const breakdown = [
    { label: "Loan Amount", value: fmt(inp.loanAmount) },
    { label: "Repayment Term", value: inp.termYears + " years" },
    { label: "Federal Rate (Fixed)", value: inp.federalRate + "%" },
    { label: "Private Rate (Usually Variable)", value: inp.privateRate + "%" },
    { label: "Federal Origination Fee", value: fmt(feeAmount) },
    { label: "Federal Payment", value: fmtD(paymentFederal), highlight: true },
    { label: "Private Payment", value: fmtD(paymentPrivate), highlight: true },
    { label: "Monthly Savings (Federal)", value: fmtD(monthlyDifference) },
    { label: "Interest — Federal", value: fmt(interestFederal) },
    { label: "Interest — Private", value: fmt(interestPrivate) },
    { label: "Interest Saved (Federal)", value: fmt(interestSaved), isTotal: true },
    { label: "Total Cost — Federal", value: fmt(totalFederal), isTotal: true },
    { label: "Total Cost — Private", value: fmt(totalPrivate), isTotal: true },
  ];

  const summaryStats = [
    { label: "Federal Payment", value: fmtD(paymentFederal) + "/mo" },
    { label: "Private Payment", value: fmtD(paymentPrivate) + "/mo" },
    { label: "Monthly Savings", value: fmtD(monthlyDifference) + "/mo" },
    { label: "Interest Saved", value: fmt(interestSaved) },
    { label: "Origination Fee", value: fmt(feeAmount) },
    { label: "Total Cost — Federal", value: fmt(totalFederal) },
    { label: "Total Cost — Private", value: fmt(totalPrivate) },
    { label: "Total Savings (Federal)", value: fmt(totalSaved) },
  ];

  return { paymentFederal, paymentPrivate, monthlyDifference, interestFederal, interestPrivate, interestSaved, feeAmount, totalFederal, totalPrivate, totalSaved, chartData, breakdown, summaryStats };
}

const DEFAULTS: Inputs = { loanAmount: 30000, federalRate: 6.53, privateRate: 9, termYears: 10, federalFeePct: 1.057 };

export default function PrivateStudentLoanVsFederalComparisonCalculator() {
  const [loanAmount, setLoanAmount] = useState(String(DEFAULTS.loanAmount));
  const [federalRate, setFederalRate] = useState(String(DEFAULTS.federalRate));
  const [privateRate, setPrivateRate] = useState(String(DEFAULTS.privateRate));
  const [termYears, setTermYears] = useState(String(DEFAULTS.termYears));
  const [federalFeePct, setFederalFeePct] = useState(String(DEFAULTS.federalFeePct));
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    loanAmount: parseFloat(loanAmount) || 0,
    federalRate: parseFloat(federalRate) || 0,
    privateRate: parseFloat(privateRate) || 0,
    termYears: parseInt(termYears) || 0,
    federalFeePct: parseFloat(federalFeePct) || 0,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setLoanAmount(String(DEFAULTS.loanAmount));
    setFederalRate(String(DEFAULTS.federalRate));
    setPrivateRate(String(DEFAULTS.privateRate));
    setTermYears(String(DEFAULTS.termYears));
    setFederalFeePct(String(DEFAULTS.federalFeePct));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const amt = parseFloat(loanAmount) || 0;
  const rF = parseFloat(federalRate) || 0;
  const rP = parseFloat(privateRate) || 0;
  const term = parseInt(termYears) || 0;
  const fee = parseFloat(federalFeePct) || 0;

  const valErrors: Record<string, string> = {};
  if (!loanAmount || amt <= 0) valErrors.loanAmount = "Loan amount must be greater than $0";
  if (rF <= 0 || rF > 20) valErrors.federalRate = "Federal rate must be 0–20%";
  if (rP <= 0 || rP > 25) valErrors.privateRate = "Private rate must be 0–25%";
  if (!termYears || term <= 0) valErrors.termYears = "Term must be greater than 0 years";
  else if (term > 30) valErrors.termYears = "Term must be 30 years or less";
  if (fee < 0 || fee > 5) valErrors.federalFeePct = "Origination fee must be 0–5%";
  const hasErrors = Object.keys(valErrors).length > 0;

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Private Student Loan vs Federal Comparison" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Private Student Loan vs Federal Comparison</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Loan Amount ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} className={c} /></div>{valErrors.loanAmount && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.loanAmount}</p>}</div>
            <div><label className="text-sm font-medium mb-1 block">Federal Rate (%)</label><div className={i}><input type="number" value={federalRate} onChange={e => setFederalRate(e.target.value)} step="0.05" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.federalRate && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.federalRate}</p>}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Private Rate (%)</label><div className={i}><input type="number" value={privateRate} onChange={e => setPrivateRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.privateRate && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.privateRate}</p>}</div>
            <div><label className="text-sm font-medium mb-1 block">Repayment Term (Years)</label><div className={i}><input type="number" value={termYears} onChange={e => setTermYears(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div>{valErrors.termYears && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.termYears}</p>}</div>
          </div>
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline self-start mt-1">
              Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdv ? "rotate-180" : ""}`} />
            </button>
          </div>
          {showAdv && (
            <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1 animate-fade-in-up">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Loan Details</div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium mb-1 block">Federal Origination Fee (%)</label><div className={i}><input type="number" value={federalFeePct} onChange={e => setFederalFeePct(e.target.value)} step="0.01" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.federalFeePct && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.federalFeePct}</p>}</div>
                </div>
              </div>
            </div>
          )}
          <div className="flex gap-3 mt-1">
            <button type="button" disabled={hasErrors} onClick={calc_} className={`flex-1 flex items-center justify-center gap-2 rounded-md h-10 text-base font-bold transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground"}`}>Calculate</button>
            <button type="button" onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0 text-muted-foreground"><RotateCcw className="h-4 w-4" /></button>
          </div>
          {hasErrors && <p className="text-xs text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2 rounded-md">Please fix the highlighted inputs before calculating.</p>}
        </div>
        <div className="flex flex-col gap-4">
          {result && (<>
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Federal Loan Payment (Fixed)</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">{result.paymentFederal.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</div>
              <div className="text-sm text-muted-foreground mt-1">vs {result.paymentPrivate.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}/mo private — you'd save {result.monthlyDifference.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}/mo and {result.totalSaved.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })} overall</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Private Payment", result.paymentPrivate.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) + "/mo", "text-primary"],
                ["Interest Saved", "$" + Math.round(result.interestSaved).toLocaleString("en-US"), "text-emerald-600"],
                ["Origination Fee", "$" + Math.round(result.feeAmount).toLocaleString("en-US"), "text-amber-600"],
              ].map(([l, v, color], idx) => (
                <div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className={`text-base font-bold ${color}`}>{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Monthly Payment: Federal vs Private</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + Math.round(Number(v) / 10) + "0"} />
                  <Tooltip formatter={(v: number) => ["Payment", "$" + Math.round(v).toLocaleString("en-US")]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="federal" name="Federal" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="private" name="Private" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Full Breakdown</h3>
              <table className="w-full text-base">
                <tbody>
                  {result.breakdown.map((r, idx) => (
                    <tr key={idx} className={`border-b border-border/50 last:border-0 ${r.isTotal ? "border-t-2 font-bold" : ""} ${r.highlight ? "bg-primary/5" : ""}`}>
                      <td className={`py-2.5 px-3 ${r.highlight || r.isTotal ? "font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 px-3 text-right ${r.highlight || r.isTotal ? "font-bold text-primary" : "font-semibold"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, idx) => (
                  <div key={idx} className="flex justify-between gap-2"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold text-right">{s.value}</span></div>
                ))}
              </div>
            </div>
          </>)}
        </div>
      </div>
      <div className="max-w-[1180px] mt-8">
        <AdPlaceholder className="mb-10" />
        <section className="prose-finance text-[15.75px]">
          <h2 className="text-2xl font-bold mb-3">Federal First, Private Only When You Must</h2>
          <p>Federal student loans are priced the same for every borrower in their category — the rate is set by Congress, not your credit history — and they carry protections private loans rarely match: income-driven repayment plans, generous deferment and forbearance, and forgiveness programs like Public Service Loan Forgiveness. Private loans, by contrast, price you individually: strong co-signers can land rates below federal, but most borrowers face variable rates that start higher and can keep climbing. This calculator compares the straightforward numbers — payment, interest, and total cost on the same term — but the gap it can't show is the safety net. If you might need flexibility later, the federal loan's protections are worth real money even when the rate is higher.</p>
        </section>
        <FAQSection faqs={[
          { question: "Are federal or private loans cheaper?", answer: "For most borrowers, federal: fixed rates are set by Congress and comparable to good private offers, plus no credit check and built-in protections. Private loans can win only for the strongest credit profiles, and usually lose that edge when you add the cost of the safety nets you give up." },
          { question: "What protections do private loans lack?", answer: "Income-driven repayment, student loan forgiveness, and most deferment options. Private lenders offer limited forbearance and little flexibility if your income drops — and private loans generally can't be discharged in bankruptcy without a separate lawsuit." },
          { question: "What if I need a private loan anyway?", answer: "Max out federal loans first, then borrow the smallest private amount needed with a co-signer and the shortest term you can afford. Compare variable vs fixed carefully, and check the lender's forbearance policy before signing." },
        ]} pageUrl="https://racira.com/calculator/private-student-loan-vs-federal-comparison" />
        <PopularCalculators exclude="/calculator/private-student-loan-vs-federal-comparison" />
      </div>
    </div>
  </>);
}