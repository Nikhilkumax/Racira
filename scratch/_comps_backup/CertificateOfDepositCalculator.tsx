"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface CdResult {
  maturityValue: number;
  totalInterest: number;
  apy: number;
  effectiveYield: number;
  monthlyInterest: number;
  penalty: number;
  netAfterPenalty: number;
  taxOnInterest: number;
  afterTaxInterest: number;
  maturityDate: string;
  yearRows: { year: number; beginning: number; interest: number; ending: number }[];
  chartData: { year: number; balance: number; principal: number }[];
  summaryStats: { label: string; value: string }[];
}

function calcCd(deposit: number, ratePct: number, termYears: number, freq: number, penaltyMonths: number, taxPct: number): CdResult {
  const r = ratePct / 100;
  const n = freq;
  const t = termYears;
  const maturityValue = deposit * Math.pow(1 + r / n, n * t);
  const totalInterest = maturityValue - deposit;
  const apy = Math.pow(1 + r / n, n) - 1;
  const monthlyInterest = totalInterest / (t * 12);
  const penalty = Math.min(penaltyMonths * monthlyInterest, totalInterest);
  const taxOnInterest = totalInterest * (taxPct / 100);
  const afterTaxInterest = totalInterest - taxOnInterest;
  const netAfterPenalty = deposit + totalInterest - penalty;

  const now = new Date();
  const mat = new Date(now.getFullYear() + t, now.getMonth(), 1);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const maturityDate = `${months[mat.getMonth()]} ${mat.getFullYear()}`;

  const yearRows: CdResult["yearRows"] = [];
  const chartData: CdResult["chartData"] = [];
  for (let y = 1; y <= t; y++) {
    const ending = deposit * Math.pow(1 + r / n, n * y);
    const beginning = y === 1 ? deposit : deposit * Math.pow(1 + r / n, n * (y - 1));
    const interest = ending - beginning;
    yearRows.push({ year: y, beginning, interest, ending });
    chartData.push({ year: y, balance: ending, principal: deposit });
  }

  const fmt = (v: number) => `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const summaryStats = [
    { label: "Initial Deposit", value: fmt(deposit) },
    { label: "Total Interest", value: fmt(totalInterest) },
    { label: "Maturity Value", value: fmt(maturityValue) },
    { label: "APY", value: `${(apy * 100).toFixed(2)}%` },
    { label: "Maturity Date", value: maturityDate },
    { label: "Tax on Interest", value: fmt(taxOnInterest) },
    { label: "After-Tax Interest", value: fmt(afterTaxInterest) },
    { label: "Net if Withdrawn Early", value: fmt(netAfterPenalty) },
  ];

  return { maturityValue, totalInterest, apy, effectiveYield: apy, monthlyInterest, penalty, netAfterPenalty, taxOnInterest, afterTaxInterest, maturityDate, yearRows, chartData, summaryStats };
}

const DEFAULTS = { deposit: "10000", rate: "4.5", term: "5", freq: "12", penaltyMonths: "3", tax: "24" };

const FREQ_LABELS: Record<string, string> = { "1": "Annually", "2": "Semi-Annually", "4": "Quarterly", "12": "Monthly", "365": "Daily" };

export default function CertificateOfDepositCalculator() {
  const [deposit, setDeposit] = useState(DEFAULTS.deposit);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [term, setTerm] = useState(DEFAULTS.term);
  const [freq, setFreq] = useState(DEFAULTS.freq);
  const [penaltyMonths, setPenaltyMonths] = useState(DEFAULTS.penaltyMonths);
  const [tax, setTax] = useState(DEFAULTS.tax);
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<CdResult | null>(null);

  const d = parseFloat(deposit) || 0;
  const r = parseFloat(rate) || 0;
  const t = parseFloat(term) || 0;
  const errs: string[] = [];
  if (d <= 0) errs.push("Initial deposit must be greater than 0.");
  if (r <= 0) errs.push("Interest rate must be greater than 0.");
  if (t <= 0 || t > 50) errs.push("Term must be between 1 and 50 years.");
  const valid = errs.length === 0;

  const calculate = () => {
    if (!valid) return;
    setResult(calcCd(d, r, t, parseInt(freq), Math.max(0, parseFloat(penaltyMonths) || 0), Math.max(0, Math.min(100, parseFloat(tax) || 0))));
  };
  const reset = () => {
    setDeposit(DEFAULTS.deposit); setRate(DEFAULTS.rate); setTerm(DEFAULTS.term); setFreq(DEFAULTS.freq);
    setPenaltyMonths(DEFAULTS.penaltyMonths); setTax(DEFAULTS.tax);
    setResult(calcCd(10000, 4.5, 5, 12, 3, 24));
  };
  useEffect(() => { setResult(calcCd(10000, 4.5, 5, 12, 3, 24)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is a certificate of deposit (CD)?", answer: "A CD is a savings product offered by banks and credit unions that pays a fixed interest rate for a set term. In exchange for locking your money away for the term, CDs typically pay higher rates than standard savings accounts." },
    { question: "How is CD interest calculated?", answer: "Most CDs compound interest on a schedule — daily, monthly, quarterly, or annually. The maturity value uses the compound interest formula A = P(1 + r/n)^(nt), where P is the deposit, r is the annual rate, n is the compounding frequency, and t is the term in years." },
    { question: "What is the difference between APR and APY?", answer: "APR is the stated annual rate. APY (annual percentage yield) accounts for compounding: APY = (1 + r/n)^n − 1. A CD with a 4.5% APR compounded monthly earns an APY of about 4.59%." },
    { question: "What happens if I withdraw early?", answer: "Most CDs charge an early-withdrawal penalty, commonly 3–6 months of interest. The penalty reduces your earnings and can even eat into principal if the account is young. This calculator subtracts your selected penalty from the interest earned." },
  ];

  const statColor = result ? (result.apy >= 0.05 ? "text-emerald-600" : result.apy >= 0.03 ? "text-amber-500" : "text-red-500") : "";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Certificate of Deposit Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Certificate of Deposit Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Initial Deposit</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={deposit} onChange={e => setDeposit(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>Annual Interest Rate</label>
                <div className={inp}><input type="number" value={rate} onChange={e => setRate(e.target.value)} step="0.1" className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Term</label>
                <div className={inp}><input type="number" value={term} onChange={e => setTerm(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div>
              </div>
              <div>
                <label className={lbl}>Compounding</label>
                <select value={freq} onChange={e => setFreq(e.target.value)} className={sel}>
                  {Object.entries(FREQ_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAdv(o => !o)}
              className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1 self-start"
            >
              Advanced Options
              <span className={`transition-transform ${showAdv ? "rotate-180" : ""}`}>▼</span>
            </button>
            {showAdv && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Penalties &amp; Taxes</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lbl}>Early-Withdrawal Penalty</label>
                      <div className={inp}><input type="number" value={penaltyMonths} onChange={e => setPenaltyMonths(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">mo</span></div>
                    </div>
                    <div>
                      <label className={lbl}>Tax Rate</label>
                      <div className={inp}><input type="number" value={tax} onChange={e => setTax(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                <button onClick={() => window.print()} className="absolute top-3 right-3 flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Maturity Value</div>
                <div className="text-4xl font-extrabold tracking-tight">${result.maturityValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="text-sm text-muted-foreground mt-1">Matures {result.maturityDate} · Total interest ${result.totalInterest.toLocaleString("en-US", { maximumFractionDigits: 2 })}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Total Interest", `$${result.totalInterest.toLocaleString("en-US", { maximumFractionDigits: 2 })}`], ["APY", `${(result.apy * 100).toFixed(2)}%`, statColor], ["Maturity Date", result.maturityDate]].map(([l, v, color], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className={`text-base font-bold ${color || ""}`}>{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Annual Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.yearRows.slice(0, 12).map((row, i) => (
                    <tr key={i} className="border-b border-border/50 last:border-0">
                      <td className="py-2.5 text-muted-foreground">Year {row.year}</td>
                      <td className="py-2.5 text-right text-muted-foreground">${row.beginning.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                      <td className="py-2.5 text-right font-semibold text-emerald-600">+${row.interest.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                      <td className="py-2.5 text-right font-bold">${row.ending.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                    </tr>
                  ))}
                  {result.yearRows.length > 12 && (
                    <tr><td colSpan={4} className="py-2 text-xs text-muted-foreground italic">Showing first 12 of {result.yearRows.length} years</td></tr>
                  )}
                  <tr className="bg-amber-500/10 border-t-2 border-amber-500/40">
                    <td className="py-2.5 text-amber-700 font-bold">Total Interest</td>
                    <td className="py-2.5 text-right text-amber-700 font-bold" colSpan={3}>${result.totalInterest.toLocaleString("en-US", { maximumFractionDigits: 2 })}</td>
                  </tr>
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Balance Growth</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} label={{ value: "Year", position: "insideBottom", offset: -2, fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: number, name: string) => [`$${Math.round(v).toLocaleString()}`, name === "balance" ? "Balance" : "Principal"]} />
                    <Area type="monotone" dataKey="balance" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.15)" strokeWidth={2} />
                  </AreaChart>
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
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Certificate of Deposit?</h2>
            <p>A certificate of deposit (CD) is a time deposit offered by banks and credit unions. You agree to leave a lump sum untouched for a fixed term — from a few months to several years — and in exchange the institution pays a guaranteed interest rate, typically higher than a standard savings account. This <strong>CD calculator</strong> projects your maturity value using the compound interest formula.</p>
            <h2 className="text-2xl font-bold mb-3">CD Formula</h2>
            <p>Maturity Value = P × (1 + r/n)^(n×t), where P is the initial deposit, r is the annual interest rate, n is the number of compounding periods per year, and t is the term in years. APY = (1 + r/n)^n − 1 measures the true annual return after compounding.</p>
            <h2 className="text-2xl font-bold mb-3">CD Laddering Strategy</h2>
            <p>Instead of one large CD, many savers build a ladder: split funds across 6-month, 1-year, 2-year, and 5-year CDs so a portion matures at regular intervals. As each rung matures, reinvest at the then-current rate — capturing higher long-term rates while keeping liquidity.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/certificate-of-deposit-calculator" />
          <PopularCalculators exclude="/calculator/certificate-of-deposit-calculator" />
        </div>
      </div>
    </>
  );
}
