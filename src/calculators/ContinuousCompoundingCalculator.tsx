"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, Infinity } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface CCResults {
  finalAmount: number;
  totalInterest: number;
  effectiveRate: number;
  doublingTime: number;
  periodicResults: {
    years: number;
    continuous: number;
    daily: number;
    monthly: number;
    annually: number;
  }[];
}

const CompactInput = ({
  id, label, value, onChange, prefix, suffix, type = "number", ...props
}: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  prefix?: string; suffix?: string; type?: string; [key: string]: any;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative flex items-center rounded-md border border-input bg-background h-9 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none shrink-0">{prefix}</span>}
      <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" {...props} />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const fmt = (n: number, decimals = 2) =>
  n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

function calcContinuous({ principal, rate, years, additionalContribution, contributionFreq }: {
  principal: number; rate: number; years: number; additionalContribution: number; contributionFreq: string;
}): CCResults {
  const r = rate / 100;
  const finalAmount = principal * Math.exp(r * years);
  const totalInterest = finalAmount - principal;
  const effectiveRate = (Math.exp(r) - 1) * 100;
  const doublingTime = Math.log(2) / r;

  const periodicResults = Array.from({ length: years }, (_, i) => {
    const y = i + 1;
    return {
      years: y,
      continuous: parseFloat((principal * Math.exp(r * y)).toFixed(2)),
      daily: parseFloat((principal * Math.pow(1 + r / 365, 365 * y)).toFixed(2)),
      monthly: parseFloat((principal * Math.pow(1 + r / 12, 12 * y)).toFixed(2)),
      annually: parseFloat((principal * Math.pow(1 + r, y)).toFixed(2)),
    };
  });

  return { finalAmount, totalInterest, effectiveRate, doublingTime, periodicResults };
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs">
        <p className="font-bold text-muted-foreground mb-1">Year {label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.stroke }} className="font-semibold">{p.name}: ${fmt(p.value, 0)}</p>
        ))}
      </div>
    );
  }
  return null;
};

const COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#ef4444"];

export default function ContinuousCompoundingCalculator() {
  const [principal, setPrincipal] = useState("10000");
  const [rate, setRate] = useState("7");
  const [years, setYears] = useState("20");

  const [results, setResults] = useState<CCResults | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); calculate(); }, []);

  const calculate = () => {
    setResults(calcContinuous({
      principal: parseFloat(principal) || 10000,
      rate: parseFloat(rate) || 7,
      years: parseInt(years) || 20,
      additionalContribution: 0,
      contributionFreq: "monthly",
    }));
  };

  const reset = () => {
    setPrincipal("10000"); setRate("7"); setYears("20");
    setResults(calcContinuous({ principal: 10000, rate: 7, years: 20, additionalContribution: 0, contributionFreq: "monthly" }));
  };

  const faqs = [
    { question: "What is continuous compounding?", answer: "Continuous compounding is the theoretical limit of compound interest where interest is calculated and added to the principal an infinite number of times per year. The formula is A = Pe^(rt), where e is Euler's number (≈2.718), P is principal, r is the annual rate, and t is time in years." },
    { question: "What is the formula for continuous compounding?", answer: "A = Pe^(rt). Where A = final amount, P = initial principal, e = Euler's number (2.71828...), r = annual interest rate (as a decimal), and t = time in years. This differs from standard compounding, which uses A = P(1 + r/n)^(nt)." },
    { question: "What is the effective annual rate under continuous compounding?", answer: "The effective annual rate (EAR) under continuous compounding is e^r - 1. For a 7% nominal rate, EAR = e^0.07 - 1 ≈ 7.251%. This is slightly higher than daily compounding (7.250%) showing how close daily compounding is to the theoretical continuous limit." },
    { question: "How do I calculate the doubling time for continuous compounding?", answer: "Under continuous compounding, the doubling time is ln(2) / r, where ln(2) ≈ 0.693. At 7% annual rate: 0.693 / 0.07 ≈ 9.9 years. This is the exact equivalent of the 'Rule of 70' approximation used for simpler calculations." },
    { question: "What's the difference between continuous and daily compounding?", answer: "The difference is extremely small. For a $10,000 investment at 7% over 20 years: continuous gives $40,447 while daily gives $40,440 — a difference of only $7. The practical difference is negligible, but continuous compounding simplifies many financial mathematics formulas." },
    { question: "Do any real financial products use continuous compounding?", answer: "Most real products use daily or monthly compounding. However, continuous compounding is the standard framework in options pricing (Black-Scholes model), risk management, and financial mathematics because it leads to simpler differential equations and closed-form solutions." },
  ];

  return (
    <>
      <Breadcrumb items={[
        { label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" },
        { label: "Financial", href: "/calculator#financial" }, { label: "Continuous Compounding Calculator" }
      ]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Continuous Compounding Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-lg font-bold text-foreground pb-2 border-b border-border">Investment Parameters</h2>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="principal" label="Initial Principal" value={principal} onChange={setPrincipal} prefix="$" />
              <CompactInput id="rate" label="Annual Interest Rate" value={rate} onChange={setRate} suffix="%" />
            </div>
            <CompactInput id="years" label="Investment Period" value={years} onChange={setYears} suffix="years" />



            <div className="flex gap-2.5 mt-2">
              <button type="button" onClick={calculate}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 text-base transition-all active:scale-[0.98] shadow-sm">
                <Calculator className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset}
                className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-9 transition-colors flex items-center justify-center"
                aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {results && (
              <>
                <>

              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h2 className="text-lg font-bold text-foreground">Results</h2>
                  <Infinity className="h-5 w-5 text-primary" />
                </div>

                {/* Component 1: Primary Result */}
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Final Amount (Continuous)</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                    ${fmt(results.finalAmount)}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Interest Earned: ${fmt(results.totalInterest)}
                  </div>
                </div>

                {/* Component 2: Breakdown Table */}
                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Compounding Method</th>
                        <th className="p-2.5 pr-3 text-right">Final Amount</th>
                        <th className="p-2.5 pr-3 text-right">Interest</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {(() => {
                        const last = results.periodicResults[results.periodicResults.length - 1];
                        const p = parseFloat(principal) || 10000;
                        return [
                          { label: "Continuous (e^rt)", final: last.continuous, interest: last.continuous - p, isTop: true },
                          { label: "Daily (365×/year)", final: last.daily, interest: last.daily - p },
                          { label: "Monthly (12×/year)", final: last.monthly, interest: last.monthly - p },
                          { label: "Annually (1×/year)", final: last.annually, interest: last.annually - p },
                        ].map(row => (
                          <tr key={row.label} className={`hover:bg-secondary/20 transition-colors ${row.isTop ? "font-bold bg-secondary/30 text-foreground" : "text-muted-foreground"}`}>
                            <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                            <td className="p-2.5 pr-3 text-right text-foreground">${fmt(row.final)}</td>
                            <td className="p-2.5 pr-3 text-right text-foreground">${fmt(row.interest)}</td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Component 3: Chart */}
                <div className="p-4 rounded-xl border border-border bg-card">
                  <h3 className="text-sm font-bold text-foreground mb-3">Growth Over Time — Compounding Comparison</h3>
                  {mounted && (<>

                    <ResponsiveContainer width="100%" height={210}>
                      <LineChart data={results.periodicResults} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="years" tick={{ fontSize: 11 }} label={{ value: "Years", position: "insideBottom", offset: -2, fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                        <Line type="monotone" dataKey="continuous" stroke={COLORS[0]} name="Continuous" strokeWidth={2.5} dot={false} />
                        <Line type="monotone" dataKey="daily" stroke={COLORS[1]} name="Daily" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                        <Line type="monotone" dataKey="monthly" stroke={COLORS[2]} name="Monthly" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                        <Line type="monotone" dataKey="annually" stroke={COLORS[3]} name="Annually" strokeWidth={1.5} dot={false} strokeDasharray="2 2" />
                      </LineChart>
                    </ResponsiveContainer>
                  
</>)}
                </div>

                {/* Component 4: Summary Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-border bg-card">
                  {[
                    { label: "Principal", value: `$${fmt(parseFloat(principal) || 0)}` },
                    { label: "Nominal Rate", value: `${rate}%` },
                    { label: "Time Period", value: `${years} years` },
                    { label: "Effective Rate", value: `${fmt(results.effectiveRate, 3)}%` },
                    { label: "Doubling Time", value: `${fmt(results.doublingTime, 1)} yrs` },
                    { label: "Total Return", value: `${fmt((results.totalInterest / (parseFloat(principal) || 10000)) * 100, 1)}%` },
                  ].map(item => (
                    <div key={item.label} className="flex flex-col">
                      <span className="text-[12px] font-bold uppercase text-muted-foreground tracking-wider mb-0.5">{item.label}</span>
                      <span className="text-base font-extrabold text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            
</>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is Continuous Compounding?</h2>
            <p>Continuous compounding represents the mathematical limit of compound interest—the result when interest is compounded an infinite number of times per unit time. It is the most aggressive form of compounding, producing the maximum possible growth for a given interest rate and time period. The formula A = Pe^(rt) uses Euler's number e (approximately 2.71828) to capture this exponential growth.</p>
            <p>This calculator goes beyond the standard formula by comparing continuous compounding against daily, monthly, and annual compounding. This allows investors and students of financial mathematics to see both the theoretical maximum and how close common compounding frequencies come to achieving it.</p>

            <h2>The Mathematics of Continuous Compounding</h2>
            <p>Standard compound interest uses A = P(1 + r/n)^(nt), where n is the compounding frequency. As n approaches infinity, this expression converges to Pe^(rt). The key insight is that beyond daily compounding, each additional compounding frequency yields diminishing returns — the practical difference between daily and continuous compounding is often less than 0.01% per year.</p>
            <p>The effective annual rate (EAR) under continuous compounding is e^r − 1. At 7% nominal rate, the EAR is 7.2508%. Compare this to daily compounding at 7.2501% — a difference of 0.0007%. This mathematically demonstrates why continuous compounding is largely theoretical in consumer finance but foundational in financial mathematics.</p>

            <h2>Where Continuous Compounding Is Used</h2>
            <p>While no bank literally compounds continuously, the formula has immense practical importance. The Black-Scholes options pricing model uses continuous compounding to calculate discount factors. Risk-neutral pricing in derivatives, bond duration calculations, and the mathematics of Brownian motion all use the continuous compounding framework because it produces cleaner, differentiable functions.</p>
            <p>FOREX traders and fixed-income analysts also use continuously compounded rates to convert between yield conventions across different markets. Central banks and academic economists express real interest rates using continuous compounding for consistency in dynamic models.</p>

            <h2>Key Metrics Explained</h2>
            <p><strong>Doubling Time:</strong> Under continuous compounding, the time to double your money is ln(2) / r = 0.6931 / r. At 7%, money doubles every 9.9 years. This is more precise than the "Rule of 72" approximation. <strong>Effective Annual Rate:</strong> The EAR represents what you'd actually earn in one year after continuous compounding—always slightly above the nominal rate. <strong>Total Return %:</strong> Shows the percentage gain on your initial investment over the full period.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/continuous-compounding-calculator" />
          <PopularCalculators exclude="/calculator/continuous-compounding-calculator" />
        </div>
      </div>
    </>
  );
}
