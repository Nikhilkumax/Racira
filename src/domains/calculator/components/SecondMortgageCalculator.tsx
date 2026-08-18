"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, ChevronDown } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface SecondMortgageInputs {
  homeValue: number;
  firstBalance: number;
  secondAmount: number;
  secondApr: number;
  termYears: number;
  firstPayment: number;
}

interface SecondMortgageResult {
  cltv: number;
  firstLtv: number;
  secondPayment: number;
  totalInterest: number;
  totalCost: number;
  equityRemaining: number;
  equityPct: number;
  combinedPayment: number;
  chartData: { name: string; value: number; color: string }[];
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

function calcSecondMortgage(inputs: SecondMortgageInputs): SecondMortgageResult {
  const n = inputs.termYears * 12;
  const r = inputs.secondApr / 100 / 12;
  const secondPayment = r > 0 ? (inputs.secondAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : inputs.secondAmount / n;
  const totalInterest = secondPayment * n - inputs.secondAmount;
  const totalCost = inputs.secondAmount + totalInterest;
  const totalDebt = inputs.firstBalance + inputs.secondAmount;
  const cltv = inputs.homeValue > 0 ? (totalDebt / inputs.homeValue) * 100 : 0;
  const firstLtv = inputs.homeValue > 0 ? (inputs.firstBalance / inputs.homeValue) * 100 : 0;
  const equityRemaining = Math.max(0, inputs.homeValue - totalDebt);
  const equityPct = inputs.homeValue > 0 ? (equityRemaining / inputs.homeValue) * 100 : 0;
  const combinedPayment = inputs.firstPayment + secondPayment;

  const chartData = [
    { name: "First Mortgage", value: inputs.firstBalance, color: "hsl(var(--primary))" },
    { name: "Second Mortgage", value: inputs.secondAmount, color: "#f59e0b" },
    { name: "Remaining Equity", value: equityRemaining, color: "#10b981" },
  ].filter((d) => d.value > 0);

  const breakdown: { label: string; value: string; highlight?: boolean }[] = [
    { label: "Home Value", value: `$${inputs.homeValue.toLocaleString()}` },
    { label: "First Mortgage Balance", value: `$${inputs.firstBalance.toLocaleString()}` },
    { label: "Second Mortgage Amount", value: `$${inputs.secondAmount.toLocaleString()}` },
    { label: "First Mortgage LTV", value: `${firstLtv.toFixed(1)}%` },
    { label: "Combined LTV (CLTV)", value: `${cltv.toFixed(1)}%`, highlight: true },
    { label: "Remaining Equity", value: `$${equityRemaining.toLocaleString()} (${equityPct.toFixed(1)}%)` },
    { label: "Second Mortgage Payment", value: `$${secondPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, highlight: true },
    { label: "Total Interest on Second", value: `$${totalInterest.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Combined Monthly Payment", value: `$${combinedPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
  ];

  const summaryStats = [
    { label: "Second Mortgage Payment", value: `$${secondPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: "Combined LTV (CLTV)", value: `${cltv.toFixed(1)}%` },
    { label: "Remaining Equity", value: `$${equityRemaining.toLocaleString()}` },
    { label: "Total Interest on Second", value: `$${totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Cost of Second", value: `$${totalCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Combined Monthly Payment", value: `$${combinedPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
  ];

  return { cltv, firstLtv, secondPayment, totalInterest, totalCost, equityRemaining, equityPct, combinedPayment, chartData, breakdown, summaryStats };
}

const DEFAULTS: SecondMortgageInputs = { homeValue: 400000, firstBalance: 250000, secondAmount: 60000, secondApr: 7.5, termYears: 15, firstPayment: 1600 };

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
}

const CompactInput = ({ id, label, value, onChange, prefix, suffix }: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium text-foreground mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground shrink-0">{prefix}</span>}
      <input id={id} type="number" step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground shrink-0">{suffix}</span>}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload }: any) => active && payload?.length ? (
  <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold">
    <p className="font-bold text-muted-foreground mb-0.5">{payload[0].name}</p>
    <p className="text-primary font-extrabold text-sm">${payload[0].value.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
  </div>
) : null;

export default function SecondMortgageCalculator() {
  const [homeValue, setHomeValue] = useState("400000");
  const [firstBalance, setFirstBalance] = useState("250000");
  const [secondAmount, setSecondAmount] = useState("60000");
  const [secondApr, setSecondApr] = useState("7.5");
  const [termYears, setTermYears] = useState("15");
  const [firstPayment, setFirstPayment] = useState("1600");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<SecondMortgageResult | null>(null);

  const calculate = () =>
    setResult(calcSecondMortgage({
      homeValue: parseFloat(homeValue) || 0,
      firstBalance: parseFloat(firstBalance) || 0,
      secondAmount: parseFloat(secondAmount) || 0,
      secondApr: parseFloat(secondApr) || 0,
      termYears: parseFloat(termYears) || 0,
      firstPayment: parseFloat(firstPayment) || 0,
    }));
  const reset = () => { setHomeValue(DEFAULTS.homeValue.toString()); setFirstBalance(DEFAULTS.firstBalance.toString()); setSecondAmount(DEFAULTS.secondAmount.toString()); setSecondApr(DEFAULTS.secondApr.toString()); setTermYears(DEFAULTS.termYears.toString()); setFirstPayment(DEFAULTS.firstPayment.toString()); setShowAdvanced(false); calculate(); };
  useEffect(() => { calculate(); }, []);

  const cltvColor = result ? (result.cltv > 80 ? "text-amber-600" : "text-emerald-600") : "";

  const faqs = [
    { question: "What is a second mortgage?", answer: "A second mortgage is a loan secured by your home that sits behind your first mortgage. Because the first lender has priority on the property, the second loan carries more risk for the lender and therefore a higher rate. Common forms are fixed home equity loans and HELOCs." },
    { question: "What is combined loan-to-value (CLTV)?", answer: "CLTV adds all loans against the home — first and second mortgage together — divided by the property's value. Lenders typically cap CLTV at 80–90% for a second mortgage, so your first balance directly limits how large a second loan you can take." },
    { question: "How much can I borrow with a second mortgage?", answer: "Most lenders cap combined debt at 80% of the home's value. With a $400,000 home and a $250,000 first mortgage, you could carry up to $320,000 total, leaving about $70,000 of capacity for a second loan before hitting the cap." },
    { question: "Second mortgage or cash-out refinance?", answer: "A cash-out refinance replaces your first mortgage at one combined rate, often lower than a second-loan rate, but it resets your first mortgage's rate and term. A second mortgage keeps your first loan untouched and may be cheaper if your first rate is already low." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator/finance" }, { label: "Second Mortgage Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Second Mortgage Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="home-value" label="Home Value" value={homeValue} onChange={setHomeValue} prefix="$" />
              <CompactInput id="first-balance" label="First Mortgage Balance" value={firstBalance} onChange={setFirstBalance} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="second-amount" label="Second Mortgage Amount" value={secondAmount} onChange={setSecondAmount} prefix="$" />
              <CompactInput id="second-apr" label="Second Mortgage APR" value={secondApr} onChange={setSecondApr} suffix="%" />
            </div>
            <CompactInput id="term" label="Second Mortgage Term" value={termYears} onChange={setTermYears} suffix="years" />

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
                Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-background mt-3">
                  <div>
                    <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block font-medium">First Mortgage Payment</label>
                    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
                      <span className="pl-3 pr-1 text-sm text-muted-foreground shrink-0">$</span>
                      <input type="number" step="any" value={firstPayment} onChange={(e) => setFirstPayment(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-1">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Second Mortgage Monthly Payment</div>
                <div className="text-4xl font-extrabold mb-1 tracking-tight text-foreground">${result.secondPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="text-sm text-muted-foreground font-medium">for {termYears} years · total interest ${result.totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
              </div>

              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Combined LTV (CLTV)", `${result.cltv.toFixed(1)}%`], ["Remaining Equity", `$${result.equityRemaining.toLocaleString()}`], ["Combined Monthly Payment", `$${result.combinedPayment.toLocaleString("en-US", { maximumFractionDigits: 0 })}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>

              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 px-3 ${r.highlight ? "text-amber-700 font-semibold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 px-3 text-right font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center min-h-[280px]">
                <h3 className="text-base font-bold mb-2 w-full text-left">Where the Home's Value Is Held</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPieChart>
                    <Pie data={result.chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={2} dataKey="value">
                      {result.chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2 w-full">
                  {result.chartData.map((d, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                      <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }} />{d.name}
                    </div>
                  ))}
                </div>
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
            <h2 className="text-2xl font-bold mb-3">How a Second Mortgage Works</h2>
            <p>A second mortgage lets you borrow against the equity you have built while leaving your first mortgage intact. Because the second lender stands behind the first in a foreclosure, rates run higher and the amount you can borrow is capped by your combined loan-to-value. This <strong>second mortgage calculator</strong> models the whole position at once.</p>
            <h2 className="text-2xl font-bold mb-3">The CLTV Ceiling</h2>
            <p>Most lenders stop at 80–90% combined LTV. On a $400,000 home with a $250,000 first mortgage, the 80% ceiling leaves roughly $70,000 of theoretical second-loan capacity. The calculator's CLTV figure shows exactly how close a proposed second loan brings you to that ceiling.</p>
            <h2 className="text-2xl font-bold mb-3">Second Mortgage vs. HELOC</h2>
            <p>A fixed-rate second mortgage gives predictable payments but higher starting rates; a HELOC offers variable-rate flexibility and interest-only options during the draw period. Both add a monthly obligation to your existing first-mortgage payment — the combined-payment row in this calculator is what your full housing cash flow really looks like.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/second-mortgage-calculator" />
          <PopularCalculators exclude="/calculator/second-mortgage-calculator" />
        </div>
      </div>
    </>
  );
}
