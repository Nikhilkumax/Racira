"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, ChevronDown } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface HomeImprovementInputs {
  amount: number;
  apr: number;
  termYears: number;
  originationFee: number;
  extraPayment: number;
}

interface HomeImprovementResult {
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  totalMonths: number;
  interestYear1: number;
  payoffMonths: number;
  payoffInterest: number;
  interestSaved: number;
  timeSavedMonths: number;
  chartData: { name: string; value: number; color: string }[];
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

function calcHomeImprovement(inputs: HomeImprovementInputs): HomeImprovementResult {
  const n = inputs.termYears * 12;
  const r = inputs.apr / 100 / 12;
  const monthlyPayment = r > 0 ? (inputs.amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : inputs.amount / n;
  const totalInterest = monthlyPayment * n - inputs.amount;
  const totalCost = inputs.amount + totalInterest + inputs.originationFee;

  // Interest paid in the first 12 months
  let balance = inputs.amount;
  let interestYear1 = 0;
  for (let m = 0; m < 12 && m < n; m++) {
    const interest = balance * r;
    interestYear1 += interest;
    balance -= monthlyPayment - interest;
  }

  // With extra monthly payment
  let payoffMonths = 0;
  let payoffInterest = 0;
  if (inputs.extraPayment > 0) {
    let bal = inputs.amount;
    const totalPayment = monthlyPayment + inputs.extraPayment;
    while (bal > 0 && payoffMonths < 600) {
      const interest = bal * r;
      payoffInterest += interest;
      bal -= totalPayment - interest;
      payoffMonths++;
    }
  } else {
    payoffMonths = n;
    payoffInterest = totalInterest;
  }
  const interestSaved = Math.max(0, totalInterest - payoffInterest);
  const timeSavedMonths = Math.max(0, n - payoffMonths);

  const chartData = [
    { name: "Principal", value: inputs.amount, color: "hsl(var(--primary))" },
    { name: "Total Interest", value: totalInterest, color: "#f59e0b" },
  ].filter((d) => d.value > 0);

  const breakdown: { label: string; value: string; highlight?: boolean }[] = [
    { label: "Loan Amount", value: `$${inputs.amount.toLocaleString()}` },
    { label: "Annual Rate", value: `${inputs.apr}%` },
    { label: "Loan Term", value: `${inputs.termYears} years (${n} months)` },
    { label: "Monthly Payment", value: `$${monthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, highlight: true },
    { label: "Total Interest", value: `$${totalInterest.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Interest Paid in Year 1", value: `$${interestYear1.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Origination Fee", value: `$${inputs.originationFee.toLocaleString()}` },
    { label: "Total Cost", value: `$${totalCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, highlight: true },
    { label: "Payoff with Extra $/mo", value: inputs.extraPayment > 0 ? `${payoffMonths} mo · ${payoffInterest.toLocaleString("en-US", { maximumFractionDigits: 2 })} interest` : "—" },
    { label: "Interest Saved", value: inputs.extraPayment > 0 ? `$${interestSaved.toLocaleString("en-US", { maximumFractionDigits: 2 })}` : "—" },
  ];

  const summaryStats = [
    { label: "Monthly Payment", value: `$${monthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: "Total Interest", value: `$${totalInterest.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Total Cost", value: `$${totalCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Interest in Year 1", value: `$${interestYear1.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Payoff Time", value: `${n} months` },
    { label: "With Extra Payment", value: inputs.extraPayment > 0 ? `${payoffMonths} months` : "Not set" },
  ];

  return { monthlyPayment, totalInterest, totalCost, totalMonths: n, interestYear1, payoffMonths, payoffInterest, interestSaved, timeSavedMonths, chartData, breakdown, summaryStats };
}

const DEFAULTS: HomeImprovementInputs = { amount: 25000, apr: 8, termYears: 5, originationFee: 250, extraPayment: 50 };

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
    <p className="text-primary font-extrabold text-sm">${payload[0].value.toLocaleString("en-US", { maximumFractionDigits: 2 })}</p>
  </div>
) : null;

export default function HomeImprovementLoanCalculator() {
  const [amount, setAmount] = useState("25000");
  const [apr, setApr] = useState("8");
  const [termYears, setTermYears] = useState("5");
  const [originationFee, setOriginationFee] = useState("250");
  const [extraPayment, setExtraPayment] = useState("50");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<HomeImprovementResult | null>(null);

  const calculate = () =>
    setResult(calcHomeImprovement({
      amount: parseFloat(amount) || 0,
      apr: parseFloat(apr) || 0,
      termYears: parseFloat(termYears) || 0,
      originationFee: parseFloat(originationFee) || 0,
      extraPayment: parseFloat(extraPayment) || 0,
    }));
  const reset = () => { setAmount(DEFAULTS.amount.toString()); setApr(DEFAULTS.apr.toString()); setTermYears(DEFAULTS.termYears.toString()); setOriginationFee(DEFAULTS.originationFee.toString()); setExtraPayment(DEFAULTS.extraPayment.toString()); setShowAdvanced(false); calculate(); };
  useEffect(() => { calculate(); }, []);

  const faqs = [
    { question: "What is a home improvement loan?", answer: "A home improvement loan is an unsecured personal loan used to finance renovations. You borrow a fixed amount, receive it as a lump sum, and repay it in equal monthly installments over a set term. Because it is unsecured, approval is based on credit, not home equity." },
    { question: "Home improvement loan or home equity loan?", answer: "Unsecured home improvement loans have faster approval, no appraisal, and no risk to your home — but higher rates. Home equity loans and HELOCs offer lower rates because your home secures them, plus interest may be tax deductible, but you put the property at risk." },
    { question: "What is a good rate for a home improvement loan?", answer: "Rates depend on credit: excellent credit can see 7–10%, good credit roughly 10–15%, and fair credit 15% or more. Comparing the total cost, not just the payment, matters — a longer term lowers the payment but increases total interest." },
    { question: "Does paying extra really help?", answer: "Yes. Because amortized loans front-load interest, an extra $50/month on a $25,000, 8%, 5-year loan saves roughly $700 in interest and shortens the payoff by about 6 months. The calculator shows your exact savings." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator/finance" }, { label: "Home Improvement Loan Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Home Improvement Loan Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="amount" label="Loan Amount" value={amount} onChange={setAmount} prefix="$" />
              <CompactInput id="apr" label="Annual Rate" value={apr} onChange={setApr} suffix="%" />
            </div>
            <CompactInput id="term" label="Loan Term" value={termYears} onChange={setTermYears} suffix="years" />

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
                Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-background mt-3">
                  <div>
                    <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block font-medium">Fees & Extra Payments</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="fee" className="text-sm font-medium text-foreground mb-1 block">Origination Fee</label>
                        <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
                          <span className="pl-3 pr-1 text-sm text-muted-foreground shrink-0">$</span>
                          <input id="fee" type="number" step="any" value={originationFee} onChange={(e) => setOriginationFee(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="extra" className="text-sm font-medium text-foreground mb-1 block">Extra Monthly Payment</label>
                        <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
                          <span className="pl-3 pr-1 text-sm text-muted-foreground shrink-0">$</span>
                          <input id="extra" type="number" step="any" value={extraPayment} onChange={(e) => setExtraPayment(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
                        </div>
                      </div>
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
                <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Monthly Payment</div>
                <div className="text-4xl font-extrabold mb-1 tracking-tight text-foreground">${result.monthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="text-sm text-muted-foreground font-medium">for {result.totalMonths} months · total cost ${result.totalCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
              </div>

              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Total Interest", `$${result.totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Total Cost", `$${result.totalCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Interest in Year 1", `$${result.interestYear1.toLocaleString("en-US", { maximumFractionDigits: 0 })}`]].map(([l, v], i) => (
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
                <h3 className="text-base font-bold mb-2 w-full text-left">Loan Cost Distribution</h3>
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
            <h2 className="text-2xl font-bold mb-3">Financing Your Renovation</h2>
            <p>Home improvement loans let you spread the cost of a renovation over several years with fixed monthly payments. This <strong>home improvement loan calculator</strong> shows the full picture: your payment, total interest, the surprisingly large share of interest paid in year one, and what an extra payment each month would save.</p>
            <h2 className="text-2xl font-bold mb-3">The Front-Loaded Interest Problem</h2>
            <p>Amortized loans charge interest on the remaining balance, which is largest at the start. On a 5-year loan, more than 40% of the total interest is typically paid in the first year. That makes the interest-in-year-one figure one of the most useful numbers on this page — it is what an early payoff truly saves you.</p>
            <h2 className="text-2xl font-bold mb-3">Renovation ROI</h2>
            <p>Bathroom and kitchen remodels typically recoup 50–70% of their cost at resale, while energy-efficient upgrades can pay back faster through utility savings. Compare your projected interest cost against the expected value added before choosing the loan term — a shorter term costs more per month but far less overall.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/home-improvement-loan-calculator" />
          <PopularCalculators exclude="/calculator/home-improvement-loan-calculator" />
        </div>
      </div>
    </>
  );
}
