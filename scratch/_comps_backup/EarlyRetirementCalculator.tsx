"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface EarlyRetirementResult {
  neededPortfolio: number;
  currentShortfall: number;
  yearsToFIRE: number;
  safeWithdrawal: number;
  annualExpenses: number;
  fireNumber: number;
  savingsRate: number;
  projectionData: { year: number; portfolio: number; target: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcEarlyRetirement(
  currentAge: number, currentSavings: number, annualIncome: number,
  annualExpenses: number, investReturn: number, withdrawalRate: number,
  inflationRate: number
): EarlyRetirementResult {
  const fireNumber = annualExpenses / (withdrawalRate / 100);
  const annualSavings = annualIncome - annualExpenses;
  const savingsRate = annualIncome > 0 ? (annualSavings / annualIncome) * 100 : 0;
  const safeWithdrawal = fireNumber * (withdrawalRate / 100);
  const currentShortfall = Math.max(0, fireNumber - currentSavings);

  // Calculate years to FIRE with compound growth
  let portfolio = currentSavings;
  let yearsToFIRE = 0;
  const realReturn = (investReturn - inflationRate) / 100;

  if (annualSavings > 0 || currentSavings > 0) {
    for (let y = 0; y <= 60; y++) {
      if (portfolio >= fireNumber) {
        yearsToFIRE = y;
        break;
      }
      portfolio = portfolio * (1 + realReturn) + annualSavings;
      yearsToFIRE = y + 1;
    }
  }

  // Build projection data
  const maxYears = Math.min(Math.ceil(yearsToFIRE) + 5, 50);
  let pVal = currentSavings;
  const projectionData = Array.from({ length: maxYears + 1 }, (_, i) => {
    const result = { year: currentAge + i, portfolio: parseFloat(Math.max(0, pVal).toFixed(0)), target: parseFloat(fireNumber.toFixed(0)) };
    pVal = pVal * (1 + realReturn) + annualSavings;
    return result;
  });

  const retirementAge = currentAge + yearsToFIRE;

  const breakdown = [
    { label: "Annual Expenses", value: `$${annualExpenses.toLocaleString()}` },
    { label: "Withdrawal Rate", value: `${withdrawalRate}%` },
    { label: "FIRE Number", value: `$${fireNumber.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Current Savings", value: `$${currentSavings.toLocaleString()}` },
    { label: "Current Shortfall", value: `$${currentShortfall.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Annual Savings", value: `$${annualSavings.toLocaleString()}` },
    { label: "Savings Rate", value: `${savingsRate.toFixed(1)}%` },
    { label: "Real Investment Return", value: `${(investReturn - inflationRate).toFixed(1)}% (inflation-adjusted)` },
    { label: "Years to FIRE", value: `${yearsToFIRE.toFixed(1)} years` },
    { label: "Projected Retirement Age", value: `${retirementAge.toFixed(1)}` },
  ];

  const summaryStats = [
    { label: "FIRE Number", value: `$${(fireNumber / 1000).toFixed(0)}K` },
    { label: "Savings Rate", value: `${savingsRate.toFixed(1)}%` },
    { label: "Years to FIRE", value: yearsToFIRE.toFixed(1) },
    { label: "Retirement Age", value: retirementAge.toFixed(0) },
    { label: "Annual Withdrawal", value: `$${safeWithdrawal.toLocaleString()}` },
    { label: "Shortfall", value: `$${(currentShortfall / 1000).toFixed(0)}K` },
  ];

  return { neededPortfolio: fireNumber, currentShortfall, yearsToFIRE, safeWithdrawal, annualExpenses, fireNumber, savingsRate, projectionData, breakdown, summaryStats };
}

export default function EarlyRetirementCalculator() {
  const [currentAge, setCurrentAge] = useState("30");
  const [currentSavings, setCurrentSavings] = useState("50000");
  const [annualIncome, setAnnualIncome] = useState("80000");
  const [annualExpenses, setAnnualExpenses] = useState("40000");
  const [investReturn, setInvestReturn] = useState("7");
  const [withdrawalRate, setWithdrawalRate] = useState("4");
  const [inflation, setInflation] = useState("3");
  const [result, setResult] = useState<EarlyRetirementResult | null>(null);

  const calculate = () => {
    setResult(calcEarlyRetirement(
      parseInt(currentAge) || 30,
      parseFloat(currentSavings) || 0,
      parseFloat(annualIncome) || 0,
      parseFloat(annualExpenses) || 0,
      parseFloat(investReturn) || 7,
      parseFloat(withdrawalRate) || 4,
      parseFloat(inflation) || 3
    ));
  };

  useEffect(() => { setResult(calcEarlyRetirement(30, 50000, 80000, 40000, 7, 4, 3)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const suf = "pr-3 text-sm text-muted-foreground shrink-0";

  const faqs = [
    { question: "What is FIRE and how does it work?", answer: "FIRE (Financial Independence, Retire Early) is a movement centered on saving and investing aggressively to accumulate a portfolio large enough to fund living expenses indefinitely. The math: FIRE Number = Annual Expenses ÷ Safe Withdrawal Rate. The most common safe withdrawal rate is 4% (the 'Trinity Study' finding). Example: $40,000/year expenses ÷ 4% = $1,000,000 FIRE number. Once your portfolio reaches this number, you can retire and withdraw 4% annually, theoretically indefinitely." },
    { question: "What is the 4% safe withdrawal rate?", answer: "The 4% rule comes from the 1994 Trinity Study (updated multiple times), which analyzed 30-year portfolio survival rates using historical stock and bond returns. A 4% withdrawal rate from a 50/50 stock-bond portfolio had a ~95% success rate over any 30-year period in historical data. However, for early retirees with 40–60 year retirements, many FIRE researchers recommend 3–3.5% to increase safety. A 3.5% rate requires 28.6× expenses instead of 25×." },
    { question: "What savings rate do I need to retire early?", answer: "Savings rate largely determines time to retirement: 10% savings rate → ~40 years to retirement. 25% savings rate → ~27 years. 50% savings rate → ~17 years. 65% savings rate → ~10.5 years. 75% savings rate → ~7 years. These assume 5% real returns (after inflation) and starting from zero savings. Each percentage point increase in savings rate meaningfully accelerates your FIRE timeline." },
    { question: "What is the difference between FIRE types?", answer: "LeanFIRE: retire on $25,000–$40,000/year, extreme frugality required. Regular FIRE: retire on $40,000–$80,000/year, the mainstream approach. FatFIRE: retire on $80,000–$200,000+/year, comfortable lifestyle. BaristaFIRE: retire from full-time work but earn part-time income ($10,000–$20,000/year) to reduce portfolio withdrawals. CoastFIRE: accumulate enough that compound interest alone will reach the FIRE number by traditional retirement age, without more contributions." },
    { question: "How do I calculate my FIRE number?", answer: "Step 1: Calculate annual expenses including housing, food, healthcare, travel, hobbies, and all other costs. Include healthcare (a major variable for early retirees — before Medicare at 65). Step 2: Multiply by 25 (4% rule) or 28.6 (3.5% rule) or 33 (3% rule). Step 3: Add any large one-time future expenses (children's education, vehicle replacements). Step 4: Subtract any guaranteed income you'll receive (Social Security at 62+, rental income, part-time work)." },
    { question: "What are the biggest risks to early retirement?", answer: "1. Sequence of returns risk: a market downturn in the first 5 years of retirement is devastating — consider flexible spending or part-time income as buffer. 2. Healthcare costs: pre-65 health insurance averages $400–$800/month for individuals under ACA. 3. Lifestyle inflation: expenses may grow faster than expected. 4. Longevity: planning for 60 years of retirement is very different from 30 years. 5. Social inflation: keeping up with working peers who continue earning. 6. Tax planning: tax-efficient withdrawal sequencing (Roth conversion ladder) is essential." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Early Retirement / FIRE Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Early Retirement / FIRE Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-base font-medium mb-1.5 block">Current Age</label>
                <div className={inp}><input type="number" value={currentAge} onChange={e => setCurrentAge(e.target.value)} min={18} max={70} className={ci} /><span className={suf}>yrs</span></div>
              </div>
              <div>
                <label className="text-base font-medium mb-1.5 block">Current Savings</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={currentSavings} onChange={e => setCurrentSavings(e.target.value)} className={ci} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-base font-medium mb-1.5 block">Annual Income</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={annualIncome} onChange={e => setAnnualIncome(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-base font-medium mb-1.5 block">Annual Expenses</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={annualExpenses} onChange={e => setAnnualExpenses(e.target.value)} className={ci} /></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-semibold mb-1 block">Return %</label>
                <div className={inp}><input type="number" value={investReturn} onChange={e => setInvestReturn(e.target.value)} step={0.5} className={ci} /><span className={suf}>%</span></div>
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">Withdrawal</label>
                <div className={inp}><input type="number" value={withdrawalRate} onChange={e => setWithdrawalRate(e.target.value)} step={0.25} className={ci} /><span className={suf}>%</span></div>
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">Inflation</label>
                <div className={inp}><input type="number" value={inflation} onChange={e => setInflation(e.target.value)} step={0.5} className={ci} /><span className={suf}>%</span></div>
              </div>
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={() => { setCurrentAge("30"); setCurrentSavings("50000"); setAnnualIncome("80000"); setAnnualExpenses("40000"); setInvestReturn("7"); setWithdrawalRate("4"); setInflation("3"); setResult(calcEarlyRetirement(30, 50000, 80000, 40000, 7, 4, 3)); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-sm font-bold text-primary uppercase tracking-wider mb-1">FIRE Number</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">${result.fireNumber.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                <div className="text-base text-muted-foreground mt-1">
                  {result.yearsToFIRE.toFixed(1)} years to retire · Age {(parseInt(currentAge) + result.yearsToFIRE).toFixed(0)} · Savings rate: {result.savingsRate.toFixed(1)}%
                </div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Years to FIRE", result.yearsToFIRE.toFixed(1)], ["Savings Rate", `${result.savingsRate.toFixed(1)}%`], ["Annual Withdrawal", `$${result.safeWithdrawal.toLocaleString()}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">FIRE Calculation Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.label === "FIRE Number" ? "font-bold text-primary" : ""}`}>
                      <td className="py-2.5 text-muted-foreground">{r.label}</td>
                      <td className="py-2.5 text-right font-semibold">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Portfolio Growth to FIRE</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={result.projectionData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} label={{ value: "Age", position: "insideBottom", offset: -2, fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, ""]} />
                    <Legend />
                    <Line type="monotone" dataKey="portfolio" name="Portfolio" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="target" name="FIRE Target" stroke="#22c55e" strokeWidth={2} strokeDasharray="6 3" dot={false} />
                  </LineChart>
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
            <h2 className="text-2xl font-bold mb-3">What Is the FIRE Movement?</h2>
            <p>FIRE (Financial Independence, Retire Early) is a personal finance strategy based on extreme savings and disciplined investing to achieve financial independence decades before traditional retirement age. This <strong>FIRE calculator</strong> determines your FIRE number (portfolio needed to sustain your lifestyle) and projects how long it will take to get there based on your current savings rate and investment returns.</p>
            <h2 className="text-2xl font-bold mb-3">The Math Behind FIRE</h2>
            <p>FIRE Number = Annual Expenses ÷ Safe Withdrawal Rate. The 4% rule (from the Trinity Study) means: if your portfolio equals 25× your annual expenses, you can withdraw 4% annually and historically have a 95%+ chance of the portfolio lasting 30 years. For 50+ year retirements common in early retirement, many FIRE practitioners use 3–3.5% withdrawal rates (33–40× expenses). Your savings rate is the single biggest lever — each percentage point increase in savings rate meaningfully accelerates your FIRE timeline.</p>
            <h2 className="text-2xl font-bold mb-3">Sequence of Returns Risk</h2>
            <p>The most dangerous risk in early retirement is a market crash in the first few years of withdrawals. Withdrawing from a declining portfolio locks in losses and permanently impairs long-term recovery. Mitigation strategies: Keep 1–2 years of expenses in cash; use flexible spending (spend less in down markets); maintain part-time income; consider the "rising equity glidepath" — start with more bonds and gradually increase equity allocation. Related tools: <a href="/calculator/retirement-calculator">Retirement Calculator</a>, <a href="/calculator/investment-calculator">Investment Calculator</a>, <a href="/calculator/compound-interest-calculator">Compound Interest Calculator</a>.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/early-retirement-calculator" />
          <PopularCalculators exclude="/calculator/early-retirement-calculator" />
        </div>
      </div>
    </>
  );
}
