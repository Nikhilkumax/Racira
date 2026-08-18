"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface IoMortgageResult {
  principal: number;
  ratePct: number;
  ioYears: number;
  totalYears: number;
  ioPayment: number;
  amortPayment: number;
  interestDuringIo: number;
  principalAfterIo: number;
  totalInterest: number;
  totalPayments: number;
  balanceCurve: { year: number; balance: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function fmt$(v: number): string {
  return `$${v.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

function fmtPct(v: number): string {
  return `${v.toFixed(2)}%`;
}

function pmt(principal: number, rMonthly: number, n: number): number {
  const g = Math.pow(1 + rMonthly, n);
  return (principal * rMonthly * g) / (g - 1);
}

function calcIoMortgage(principal: number, ratePct: number, ioYears: number, totalYears: number): IoMortgageResult {
  const rMonthly = ratePct / 100 / 12;
  const ioMonths = ioYears * 12;
  const amortMonths = Math.max(1, (totalYears - ioYears) * 12);
  const ioPayment = principal * rMonthly;
  const amortPayment = pmt(principal, rMonthly, amortMonths);
  const interestDuringIo = ioPayment * ioMonths;
  const principalAfterIo = principal;
  const totalPayments = interestDuringIo + amortPayment * amortMonths;
  const totalInterest = totalPayments - principal;

  // Balance curve: flat during IO period, then amortizes.
  const curve: { year: number; balance: number }[] = [];
  const years = Math.max(1, Math.ceil(totalYears));
  for (let yr = 0; yr <= years; yr++) {
    const months = yr * 12;
    if (months <= ioMonths) {
      curve.push({ year: yr, balance: Math.round(principal) });
    } else {
      const m = months - ioMonths;
      let bal = principal;
      for (let i = 0; i < m; i++) bal = bal * (1 + rMonthly) - amortPayment;
      curve.push({ year: yr, balance: Math.round(Math.max(0, bal)) });
    }
  }

  const breakdown = [
    { label: "Loan Amount", value: fmt$(principal) },
    { label: "Interest Rate", value: fmtPct(ratePct) },
    { label: "Interest-Only Period", value: `${ioYears} years` },
    { label: "Total Term", value: `${totalYears} years` },
    { label: "Interest-Only Payment", value: fmt$(ioPayment) },
    { label: "Payment After IO Period", value: fmt$(amortPayment) },
    { label: "Interest During IO Period", value: fmt$(interestDuringIo) },
    { label: "Total Interest (Full Loan)", value: fmt$(totalInterest) },
  ];
  const summaryStats = [
    { label: "Interest-Only Payment", value: fmt$(ioPayment) },
    { label: "Payment After IO Period", value: fmt$(amortPayment) },
    { label: "Payment Increase", value: fmt$(amortPayment - ioPayment) },
    { label: "Interest During IO Period", value: fmt$(interestDuringIo) },
    { label: "Principal After IO Period", value: fmt$(principalAfterIo) },
    { label: "Total Interest", value: fmt$(totalInterest) },
    { label: "Total Payments", value: fmt$(totalPayments) },
    { label: "Amortization Length", value: `${totalYears - ioYears} years` },
  ];
  return { principal, ratePct, ioYears, totalYears, ioPayment, amortPayment, interestDuringIo, principalAfterIo, totalInterest, totalPayments, balanceCurve: curve, breakdown, summaryStats };
}

const DEFAULTS = { principal: "400000", rate: "6.5", io: "5", total: "30" };

export default function InterestOnlyMortgageCalculator() {
  const [principal, setPrincipal] = useState(DEFAULTS.principal);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [io, setIo] = useState(DEFAULTS.io);
  const [total, setTotal] = useState(DEFAULTS.total);
  const [result, setResult] = useState<IoMortgageResult | null>(null);

  const p = parseFloat(principal) || 0;
  const r = parseFloat(rate) || 0;
  const ioY = parseFloat(io) || 0;
  const totY = parseFloat(total) || 0;
  const errs: string[] = [];
  if (p <= 0) errs.push("Loan amount must be greater than 0.");
  if (r <= 0) errs.push("Interest rate must be greater than 0.");
  if (ioY <= 0 || totY <= 0) errs.push("Both the interest-only period and total term must be positive.");
  if (ioY >= totY) errs.push("The interest-only period must be shorter than the total term.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcIoMortgage(p, r, ioY, totY)); };
  const reset = () => {
    setPrincipal(DEFAULTS.principal); setRate(DEFAULTS.rate); setIo(DEFAULTS.io); setTotal(DEFAULTS.total);
    setResult(calcIoMortgage(400000, 6.5, 5, 30));
  };
  useEffect(() => { setResult(calcIoMortgage(400000, 6.5, 5, 30)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is an interest-only mortgage?", answer: "During the interest-only period you pay only the monthly interest — the principal balance stays flat. Once the period ends, the loan must be repaid over the remaining term, so the payment jumps to a fully amortizing amount that also reduces principal." },
    { question: "Why does the payment jump after the IO period?", answer: "The remaining amortization is compressed into fewer years on the full original balance. With a 5-year IO period on a 30-year mortgage, the principal that was untouched for 5 years must be repaid in the remaining 25, raising the payment substantially." },
    { question: "Who should consider an interest-only mortgage?", answer: "They suit borrowers with irregular income who expect higher earnings later, or investors who plan to sell or refinance before amortization begins. The trade-off is payment shock and zero equity buildup during the IO period." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Interest-Only Mortgage Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Interest-Only Mortgage Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Loan Amount</label>
                <div className={inp}><input type="number" value={principal} onChange={e => setPrincipal(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$</span></div>
              </div>
              <div>
                <label className={lbl}>Interest Rate (Annual)</label>
                <div className={inp}><input type="number" value={rate} onChange={e => setRate(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
              <div>
                <label className={lbl}>Interest-Only Period (Years)</label>
                <div className={inp}><input type="number" value={io} onChange={e => setIo(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>Total Term (Years)</label>
                <div className={inp}><input type="number" value={total} onChange={e => setTotal(e.target.value)} className={ci} /></div>
              </div>
            </div>
            {errs.length > 0 && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">{errs[0]}</div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} disabled={!valid} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${valid ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Interest-Only Monthly Payment</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt$(result.ioPayment)}</div>
                <div className="text-sm text-muted-foreground mt-1">for {result.ioYears} years, then {fmt$(result.amortPayment)}/month for {result.totalYears - result.ioYears} years</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`IO Payment`, fmt$(result.ioPayment)], ["After IO Period", fmt$(result.amortPayment)], ["Interest During IO", fmt$(result.interestDuringIo)]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Payment Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 4 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 4 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 4 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Principal Balance Over Time</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={result.balanceCurve} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`} />
                    <Tooltip formatter={(v: number) => [fmt$(v), "Balance"]} />
                    <Line type="monotone" dataKey="balance" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Balance stays flat during the IO period, then amortizes to zero</p>
              </div>
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
            <h2 className="text-2xl font-bold mb-3">How Interest-Only Mortgages Work</h2>
            <p>During the interest-only period, each monthly payment covers only the interest accrued on the full balance — principal never declines. The payment equals the loan amount times the monthly rate. When the period ends, the full balance must be repaid over the remaining years, so the payment jumps to the fully amortizing amount shown here.</p>
            <h2 className="text-2xl font-bold mb-3">Payment Shock</h2>
            <p>The gap between the IO payment and the later amortized payment is the payment shock. With a 30-year mortgage and a 5-year IO period, the difference can be hundreds of dollars a month — plan for it before the amortization clock starts.</p>
            <h2 className="text-2xl font-bold mb-3">Interest Cost</h2>
            <p>Interest-only terms almost always cost more in total interest than a conventional amortizing loan of the same term, because principal repayment is postponed. Compare both scenarios before choosing.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/interest-only-mortgage-calculator" />
          <PopularCalculators exclude="/calculator/interest-only-mortgage-calculator" />
        </div>
      </div>
    </>
  );
}
