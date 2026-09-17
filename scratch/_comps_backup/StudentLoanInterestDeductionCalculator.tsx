"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ReferenceDot } from "recharts";

type Filing = "single" | "mfj";

interface Inputs {
  interestPaid: number;
  magi: number;
  filing: Filing;
  marginalRate: number;
}

interface Row {
  label: string;
  value: string;
  highlight?: boolean;
  isTotal?: boolean;
  sum?: boolean;
}

interface Result {
  deduction: number;
  reductionPct: number;
  taxSavings: number;
  phaseFloor: number;
  phaseCeiling: number;
  fullDeduction: boolean;
  chartData: { magi: number; deduction: number }[];
  breakdown: Row[];
  summaryStats: { label: string; value: string }[];
}

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

function calc(inp: Inputs): Result {
  const floor = inp.filing === "mfj" ? 175000 : 85000;
  const ceiling = inp.filing === "mfj" ? 205000 : 100000;
  const cappedInterest = Math.min(inp.interestPaid, 2500);

  let reductionPct = 0;
  if (inp.magi > floor) {
    if (inp.magi >= ceiling) reductionPct = 1;
    else reductionPct = (inp.magi - floor) / (ceiling - floor);
  }
  const deduction = Math.max(0, cappedInterest * (1 - reductionPct));
  const taxSavings = deduction * (inp.marginalRate / 100);
  const fullDeduction = reductionPct <= 0;

  const chartData: { magi: number; deduction: number }[] = [];
  if (inp.filing === "mfj") {
    for (let g = 160000; g <= 210000; g += 5000) {
      const red = g <= floor ? 0 : g >= ceiling ? 1 : (g - floor) / (ceiling - floor);
      chartData.push({ magi: g, deduction: Math.round(cappedInterest * (1 - red)) });
    }
  } else {
    for (let g = 75000; g <= 105000; g += 5000) {
      const red = g <= floor ? 0 : g >= ceiling ? 1 : (g - floor) / (ceiling - floor);
      chartData.push({ magi: g, deduction: Math.round(cappedInterest * (1 - red)) });
    }
  }

  const filingLabel = inp.filing === "mfj" ? "Married Filing Jointly" : "Single";
  const phaseLabel = inp.filing === "mfj" ? "$175,000 – $205,000" : "$85,000 – $100,000";

  const breakdown: Row[] = [
    { label: "Student Loan Interest Paid", value: money(inp.interestPaid), sum: true },
    { label: "Deduction Cap", value: "$2,500" },
    { label: "MAGI", value: money(inp.magi), sum: true },
    { label: "Filing Status", value: filingLabel, sum: true },
    { label: "Phase-Out Range", value: phaseLabel },
    {
      label: "Phase-Out Reduction",
      value: reductionPct <= 0 ? "None — below the threshold" : reductionPct >= 1 ? "Fully phased out" : Math.round(reductionPct * 100) + "%",
      highlight: reductionPct > 0,
      sum: true,
    },
    { label: "Deductible Interest", value: money(deduction), highlight: true, sum: true },
    { label: "Marginal Tax Rate", value: inp.marginalRate.toFixed(0) + "%" },
    { label: "Estimated Tax Savings", value: money(taxSavings), isTotal: true, sum: true },
  ];

  const summaryStats = breakdown.filter((row) => row.sum).map((row) => ({ label: row.label, value: row.value }));

  return {
    deduction,
    reductionPct,
    taxSavings,
    phaseFloor: floor,
    phaseCeiling: ceiling,
    fullDeduction,
    chartData,
    breakdown,
    summaryStats,
  };
}

const DEFAULTS: Inputs = { interestPaid: 2500, magi: 60000, filing: "single", marginalRate: 22 };

export default function StudentLoanInterestDeductionCalculator() {
  const [interestPaid, setInterestPaid] = useState(String(DEFAULTS.interestPaid));
  const [magi, setMagi] = useState(String(DEFAULTS.magi));
  const [filing, setFiling] = useState<Filing>(DEFAULTS.filing);
  const [marginalRate, setMarginalRate] = useState(String(DEFAULTS.marginalRate));
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    interestPaid: parseFloat(interestPaid) || 0,
    magi: parseFloat(magi) || 0,
    filing,
    marginalRate: parseFloat(marginalRate) || 0,
  });

  const calcNow = () => setResult(calc(g()));
  const reset = () => {
    setInterestPaid(String(DEFAULTS.interestPaid));
    setMagi(String(DEFAULTS.magi));
    setFiling(DEFAULTS.filing);
    setMarginalRate(String(DEFAULTS.marginalRate));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => {
    setResult(calc(DEFAULTS));
  }, []);

  const intPaid = parseFloat(interestPaid) || 0;
  const mag = parseFloat(magi) || 0;
  const mr = parseFloat(marginalRate) || 0;

  const valErrors: Record<string, string> = {};
  if (interestPaid === "" || isNaN(parseFloat(interestPaid))) valErrors.interestPaid = "Enter interest paid";
  else if (intPaid < 0) valErrors.interestPaid = "Interest paid cannot be negative";
  else if (intPaid > 50000) valErrors.interestPaid = "Interest paid looks too high";
  if (magi === "" || isNaN(parseFloat(magi))) valErrors.magi = "Enter your modified AGI";
  else if (mag < 0) valErrors.magi = "MAGI cannot be negative";
  if (marginalRate === "" || isNaN(parseFloat(marginalRate))) valErrors.marginalRate = "Enter a marginal tax rate";
  else if (mr < 0 || mr > 50) valErrors.marginalRate = "Marginal rate must be between 0% and 50%";
  const hasErrors = Object.keys(valErrors).length > 0;

  const inputCls =
    "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const fieldCls =
    "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const selectCls =
    "w-full h-full rounded-md border border-input bg-background px-3 text-base focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Student Loan Interest Deduction Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Student Loan Interest Deduction Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="si-interest" className="text-sm font-medium mb-1 block">Interest Paid (Annual)</label>
                <div className={inputCls}>
                  <span className="pl-3 pr-1 text-sm text-muted-foreground select-none">$</span>
                  <input id="si-interest" type="number" min="0" value={interestPaid} onChange={(e) => setInterestPaid(e.target.value)} className={fieldCls} />
                </div>
                {valErrors.interestPaid && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.interestPaid}</p>}
              </div>
              <div>
                <label htmlFor="si-magi" className="text-sm font-medium mb-1 block">Modified AGI ($)</label>
                <div className={inputCls}>
                  <span className="pl-3 pr-1 text-sm text-muted-foreground select-none">$</span>
                  <input id="si-magi" type="number" min="0" value={magi} onChange={(e) => setMagi(e.target.value)} className={fieldCls} />
                </div>
                {valErrors.magi && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.magi}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="si-filing" className="text-sm font-medium mb-1 block">Filing Status</label>
                <div className="relative h-10">
                  <select id="si-filing" value={filing} onChange={(e) => setFiling(e.target.value as Filing)} className={selectCls}>
                    <option value="single">Single</option>
                    <option value="mfj">Married Filing Jointly</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="si-marginal" className="text-sm font-medium mb-1 block">Marginal Tax Rate (%)</label>
                <div className={inputCls}>
                  <input id="si-marginal" type="number" min="0" max="50" step="1" value={marginalRate} onChange={(e) => setMarginalRate(e.target.value)} className={fieldCls} />
                  <span className="pr-3 pl-1 text-sm text-muted-foreground select-none">%</span>
                </div>
                {valErrors.marginalRate && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.marginalRate}</p>}
              </div>
            </div>

            <div className="flex gap-3 mt-1">
              <button type="button" disabled={hasErrors} onClick={calcNow} className={`flex-1 flex items-center justify-center gap-2 rounded-md h-10 text-base font-bold transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground"}`}>Calculate</button>
              <button type="button" onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0 text-muted-foreground"><RotateCcw className="h-4 w-4" /></button>
            </div>
            {hasErrors && <p className="text-xs text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2 rounded-md">Please fix the highlighted inputs before calculating.</p>}
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Deductible Student Loan Interest</div>
                  <div className="text-4xl font-extrabold tracking-tight text-foreground">{money(result.deduction)}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    worth {money(result.taxSavings)} at your {(parseFloat(marginalRate) || 0).toFixed(0)}% marginal rate · claimed above the line on Form 1040
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[
                    ["Deductible Interest", money(result.deduction), "text-primary"],
                    ["Reduction Applied", result.reductionPct <= 0 ? "None" : result.reductionPct >= 1 ? "100% (phased out)" : Math.round(result.reductionPct * 100) + "%", "text-amber-600"],
                    ["Estimated Tax Savings", money(result.taxSavings), "text-emerald-600"],
                  ].map(([l, v, color], idx) => (
                    <div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className={`text-base font-bold ${color}`}>{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Deduction as Your Income Grows</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={result.chartData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="magi" tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + Math.round(Number(v) / 1000) + "K"} type="number" domain={["dataMin", "dataMax"]} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + Math.round(Number(v))} />
                      <Tooltip formatter={(v: number) => [money(Number(v)), "Deduction"]} labelFormatter={(l) => "MAGI: $" + Number(l).toLocaleString("en-US")} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line type="stepAfter" dataKey="deduction" name="Deductible amount" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
                      <ReferenceDot x={Math.round(mag)} y={Math.round(result.deduction)} r={6} fill="#f59e0b" stroke="#fff" />
                    </LineChart>
                  </ResponsiveContainer>
                  <p className="text-[11px] text-muted-foreground mt-2">The orange dot marks your current MAGI of {money(mag)}. The deduction phases out entirely at {money(result.phaseCeiling)}.</p>
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
                      <div key={idx} className="flex justify-between gap-2">
                        <span className="text-muted-foreground">{s.label}:</span>
                        <span className="font-semibold text-right">{s.value}</span>
                      </div>
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
            <h2 className="text-2xl font-bold mb-3">A Tax Break You Can Claim Without Itemizing</h2>
            <p>Up to $2,500 of student loan interest is deductible each year — and unlike the mortgage interest deduction, this one is an adjustment to income, so you can claim it even if you take the standard deduction. The deduction is capped at $2,500 and phases out for single filers with modified adjusted gross income between $85,000 and $100,000 (married filing jointly: $175,000 to $205,000). The benefit is worth your marginal tax rate times the deductible amount: a full $2,500 deduction at the 22% rate saves $550. Your lender reports the interest you paid on Form 1098-E, and your tax software or preparer applies the phase-out automatically.</p>
          </section>
          <FAQSection faqs={[
            { question: "Who qualifies for the student loan interest deduction?", answer: "You qualify if you paid interest on a qualified student loan for yourself, your spouse, or a dependent, and your modified adjusted gross income is below the phase-out ceiling — $100,000 for single filers and $205,000 for married couples filing jointly for tax year 2025. You cannot claim it if you are married filing separately or if someone else claims you as a dependent." },
            { question: "How much can I deduct?", answer: "Up to $2,500 of the interest you actually paid. The deduction is reduced proportionally across the phase-out range and disappears entirely once your MAGI reaches the ceiling. Because it is an above-the-line deduction, you do not need to itemize to benefit." },
            { question: "How much is the deduction worth to me?", answer: "Multiply your deductible amount by your marginal tax rate. At the 22% bracket, a full $2,500 deduction reduces your tax by about $550; at 12% it is worth about $300. The calculator applies the phase-out to your MAGI automatically before computing the savings." },
          ]} pageUrl="https://racira.com/calculator/student-loan-interest-deduction-calculator" />
          <PopularCalculators exclude="/calculator/student-loan-interest-deduction-calculator" />
        </div>
      </div>
    </>
  );
}
