"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, Flame } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  prefix?: string; suffix?: string; type?: string; [key: string]: any;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none shrink-0">{prefix}</span>}
      <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" {...props} />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const fmtVal = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

export default function EarlyRetirementCalculator() {
  const [currentAge, setCurrentAge] = useState("30");
  const [annualIncome, setAnnualIncome] = useState("80000");
  const [savingsRate, setSavingsRate] = useState("40");
  const [currentNetWorth, setCurrentNetWorth] = useState("50000");
  const [investmentReturn, setInvestmentReturn] = useState("7.0");
  const [swr, setSwr] = useState("4.0");

  const [res, setRes] = useState<{
    targetFireNumber: number;
    annualExpenses: number;
    yearsToFire: number;
    ageAtFire: number;
    chartData: { name: string; balance: number; target: number }[];
  } | null>(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); calc(); }, []);

  const calc = () => {
    const age = parseInt(currentAge) || 30;
    const inc = parseFloat(annualIncome) || 0;
    const rate = (parseFloat(savingsRate) || 0) / 100;
    const nw = parseFloat(currentNetWorth) || 0;
    const ret = (parseFloat(investmentReturn) || 0) / 100;
    const s = (parseFloat(swr) || 0) / 100;

    const annualSavings = inc * rate;
    const annualExpenses = Math.max(0, inc - annualSavings);

    // Target FIRE Number = Expenses / SWR
    const targetFireNumber = s > 0 ? annualExpenses / s : 0;

    const chartData: { name: string; balance: number; target: number }[] = [];
    let bal = nw;
    let years = 0;

    chartData.push({ name: `Age ${age}`, balance: Math.round(bal), target: Math.round(targetFireNumber) });

    // Simulate for up to 50 years to find target
    while (bal < targetFireNumber && years < 50) {
      bal = bal * (1 + ret) + annualSavings;
      years++;
      chartData.push({ name: `Age ${age + years}`, balance: Math.round(bal), target: Math.round(targetFireNumber) });
    }

    setRes({
      targetFireNumber,
      annualExpenses,
      yearsToFire: years,
      ageAtFire: age + years,
      chartData,
    });
  };

  const reset = () => {
    setCurrentAge("30");
    setAnnualIncome("80000");
    setSavingsRate("40");
    setCurrentNetWorth("50000");
    setInvestmentReturn("7.0");
    setSwr("4.0");
  };

  const faqs = [
    { question: "What is FIRE?", answer: "FIRE stands for Financial Independence, Retire Early. It is a movement defined by frugality, high savings rates (often 50% to 70% of income), and smart investing to build a retirement nest egg that allows you to retire decades earlier than the standard age of 65." },
    { question: "What is the FIRE Number?", answer: "Your FIRE Number is the total investment portfolio size you need to reach to be financially independent. It is typically calculated as 25 times your annual expenses (which corresponds to a 4% safe withdrawal rate). Formula: FIRE Number = Annual Expenses ÷ Safe Withdrawal Rate." },
    { question: "How does the savings rate affect years to retirement?", answer: "Your savings rate is the single most powerful factor determining how fast you can retire. If you save 10% of your income, it takes about 51 years to retire. If you save 50% of your income, it takes about 17 years. At a 70% savings rate, you can achieve financial independence in less than 10 years." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Early Retirement Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Early Retirement (FIRE) Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-lg font-bold text-foreground pb-2 border-b border-border">Your Financial Details</h2>
            <CompactInput id="age" label="Current Age" value={currentAge} onChange={setCurrentAge} />
            <CompactInput id="inc" label="Annual After-Tax Income" value={annualIncome} onChange={setAnnualIncome} prefix="$" />
            <CompactInput id="sr" label="Savings Rate" value={savingsRate} onChange={setSavingsRate} suffix="%" />
            <CompactInput id="nw" label="Current Net Worth / Portfolio" value={currentNetWorth} onChange={setCurrentNetWorth} prefix="$" />
            
            <div className="border-t border-border pt-4 flex flex-col gap-3">
              <span className="text-sm font-semibold text-foreground">Growth assumptions</span>
              <CompactInput id="ir" label="Annual Investment Return" value={investmentReturn} onChange={setInvestmentReturn} suffix="%" />
              <CompactInput id="sw" label="Safe Withdrawal Rate (SWR)" value={swr} onChange={setSwr} suffix="%" />
            </div>

            <div className="flex gap-2.5 mt-2">
              <button type="button" onClick={calc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">
                <Calculator className="h-4 w-4" /> Calculate FIRE Timeline
              </button>
              <button type="button" onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {res && (
              <>
                <>

              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h2 className="text-lg font-bold text-foreground">FIRE Goals & Timeline</h2>
                  <Flame className="h-5 w-5 text-orange-500 animate-pulse" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4 text-center">
                    <div className="text-[11px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">Target FIRE Number</div>
                    <div className="text-2xl font-extrabold text-foreground">{fmtVal(res.targetFireNumber)}</div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 text-center">
                    <div className="text-[11px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">Years to Retirement</div>
                    <div className="text-2xl font-extrabold text-foreground">{res.yearsToFire} Years (Age {res.ageAtFire})</div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left text-sm">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-2.5 pl-3">Metric</th><th className="p-2.5 pr-3 text-right">Value</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { label: "Annual After-Tax Income", value: fmtVal(parseFloat(annualIncome) || 0) },
                        { label: "Annual Savings Amount", value: fmtVal((parseFloat(annualIncome) || 0) * (parseFloat(savingsRate) || 0) / 100) },
                        { label: "Annual Expenses", value: fmtVal(res.annualExpenses) },
                        { label: "Target FIRE Number", value: fmtVal(res.targetFireNumber), bold: true },
                        { label: "Retirement Age", value: `Age ${res.ageAtFire}`, bold: true },
                      ].map(r => (
                        <tr key={r.label} className={`hover:bg-secondary/20 ${r.bold ? "font-bold bg-secondary/30" : ""}`}>
                          <td className="p-2.5 pl-3 font-semibold text-muted-foreground">{r.label}</td>
                          <td className="p-2.5 pr-3 text-right font-bold text-foreground">{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {mounted && (<>

                  <div className="p-4 rounded-xl border border-border bg-card">
                    <h3 className="text-sm font-bold text-foreground mb-3">Portfolio Balance vs FIRE Target</h3>
                    <ResponsiveContainer width="100%" height={190}>
                      <AreaChart data={res.chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                        <defs>
                          <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(v: any) => fmtVal(v)} />
                        <ReferenceLine y={res.targetFireNumber} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: `FIRE: ${fmtVal(res.targetFireNumber)}`, position: "top", fontSize: 10, fill: "#f59e0b" }} />
                        <Area type="monotone" dataKey="balance" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorBal)" name="Portfolio Balance" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                
</>)}
              </div>
            
</>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance">
            <h2>Understanding early retirement & FIRE</h2>
            <p>Retiring early is no longer a privilege reserved only for the ultra-wealthy. Under the FIRE (Financial Independence, Retire Early) movement, anyone who can maintain a high savings rate and invest in income-generating assets can build a portfolio large enough to cover their living costs indefinitely.</p>
            
            <h2>How the Math Works</h2>
            <p>The mathematics of financial independence are incredibly simple. Your timeline to retirement depends entirely on one variable: your savings rate. This represents the percentage of your net income that you save and invest. If you earn $100k and spend $100k, your savings rate is 0%, and you will never retire. If you save 50%, you save 1 year of expenses for every 1 year you work, bringing your retirement timeline to under 20 years.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/early-retirement-calculator" />
          <PopularCalculators exclude="/calculator/early-retirement-calculator" />
        </div>
      </div>
    </>
  );
}
