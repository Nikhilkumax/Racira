"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface TermVsWholeResult {
  termPremium: number;
  wholePremium: number;
  termTotalCost: number;
  wholeTotalCost: number;
  investmentValue: number;
  netWholeCost: number;
  recommendation: string;
  savings: number;
  breakdown: { label: string; value: string }[];
  chartData: { year: number; termCost: number; wholeCost: number; investmentVal: number }[];
  summaryStats: { label: string; value: string }[];
}

function calcTermVsWhole(
  age: number, sex: string, coverageAmount: number,
  termYears: number, investmentReturn: number, healthClass: string
): TermVsWholeResult {
  // Simplified premium estimates per $1M coverage
  const BASE_TERM_RATE = sex === "male" ? 0.0008 : 0.0006; // per dollar per year
  const BASE_WHOLE_RATE = sex === "male" ? 0.012 : 0.010;

  const ageFactor = age < 30 ? 0.7 : age < 40 ? 1.0 : age < 50 ? 1.6 : age < 60 ? 2.8 : 4.5;
  const healthFactor = healthClass === "preferred" ? 0.8 : healthClass === "standard" ? 1.0 : 1.4;

  const termPremium = coverageAmount * BASE_TERM_RATE * ageFactor * healthFactor;
  const wholePremium = coverageAmount * BASE_WHOLE_RATE * ageFactor * healthFactor;
  const termTotalCost = termPremium * termYears;
  const wholeTotalCost = wholePremium * termYears;

  // "Buy term, invest the difference" calculation
  const monthlyDifference = (wholePremium - termPremium) / 12;
  const monthlyRate = investmentReturn / 100 / 12;
  const months = termYears * 12;
  const investmentValue = monthlyDifference > 0
    ? monthlyDifference * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
    : 0;
  const netWholeCost = wholeTotalCost - investmentValue;

  const recommendation = termTotalCost < netWholeCost ? "Term Life Insurance" : "Whole Life Insurance";
  const savings = Math.abs(netWholeCost - termTotalCost);

  const breakdown = [
    { label: "Coverage Amount", value: `$${(coverageAmount / 1000000).toFixed(1)}M` },
    { label: "Policy Term", value: `${termYears} years` },
    { label: "Annual Term Premium", value: `$${termPremium.toFixed(2)}` },
    { label: "Annual Whole Premium", value: `$${wholePremium.toFixed(2)}` },
    { label: "Term: Total Premiums Paid", value: `$${termTotalCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Whole: Total Premiums Paid", value: `$${wholeTotalCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "\"Buy Term, Invest Diff\" Growth", value: `$${investmentValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Whole Net Cost (after invest val)", value: `$${netWholeCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Recommendation", value: recommendation },
  ];

  const chartData = Array.from({ length: Math.min(termYears, 30) }, (_, i) => {
    const yr = i + 1;
    const tCost = termPremium * yr;
    const wCost = wholePremium * yr;
    const mo = yr * 12;
    const inv = monthlyDifference > 0 ? monthlyDifference * ((Math.pow(1 + monthlyRate, mo) - 1) / monthlyRate) : 0;
    return { year: yr, termCost: parseFloat(tCost.toFixed(0)), wholeCost: parseFloat(wCost.toFixed(0)), investmentVal: parseFloat(inv.toFixed(0)) };
  });

  const summaryStats = [
    { label: "Term Annual Premium", value: `$${termPremium.toFixed(2)}` },
    { label: "Whole Annual Premium", value: `$${wholePremium.toFixed(2)}` },
    { label: "Term Total Cost", value: `$${termTotalCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Whole Net Cost", value: `$${netWholeCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Invest-the-Diff Value", value: `$${investmentValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Best Choice", value: recommendation },
  ];

  return { termPremium, wholePremium, termTotalCost, wholeTotalCost, investmentValue, netWholeCost, recommendation, savings, breakdown, chartData, summaryStats };
}

export default function TermLifeVsWholeLifeCalculator() {
  const [age, setAge] = useState("35");
  const [sex, setSex] = useState("male");
  const [coverage, setCoverage] = useState("500000");
  const [termYears, setTermYears] = useState("20");
  const [investReturn, setInvestReturn] = useState("8");
  const [health, setHealth] = useState("standard");
  const [result, setResult] = useState<TermVsWholeResult | null>(null);

  const calculate = () => {
    const a = parseInt(age) || 35, c = parseFloat(coverage) || 500000;
    const t = parseInt(termYears) || 20, r = parseFloat(investReturn) || 8;
    setResult(calcTermVsWhole(a, sex, c, t, r, health));
  };

  useEffect(() => { setResult(calcTermVsWhole(35, "male", 500000, 20, 8, "standard")); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const suf = "pr-3 text-sm text-muted-foreground shrink-0";

  const faqs = [
    { question: "What is the difference between term and whole life insurance?", answer: "Term life insurance provides coverage for a fixed period (10, 20, or 30 years) and pays a death benefit only if you die during the term. It has no cash value and is much cheaper. Whole life insurance provides permanent coverage (your entire life) and builds a guaranteed cash value component. Whole life premiums are 5–15× higher than equivalent term coverage. Most financial experts recommend term life for income-replacement protection." },
    { question: "What does 'buy term and invest the difference' mean?", answer: "This strategy compares purchasing cheaper term life insurance and investing the premium savings vs. buying more expensive whole life insurance (which has an investment/savings component). Example: If term costs $500/year and whole costs $4,000/year for the same coverage, you invest the $3,500 annual difference. At 8% annual returns over 20 years, that $3,500/year grows to approximately $173,000 — often significantly more than the whole life policy's cash value." },
    { question: "When does whole life insurance make sense?", answer: "Whole life can be beneficial when: you have a permanent insurance need (estate planning, final expenses), you've maxed out all tax-advantaged accounts (401k, IRA, HSA), you're a high-net-worth individual using it for estate tax planning, or you need the guaranteed cash value for financial planning certainty. For the average person with dependents needing income replacement, term life is almost always the more cost-effective choice." },
    { question: "How much life insurance do I need?", answer: "Common rules of thumb: 10–12× your annual income. DIME method: Debt + Income replacement + Mortgage + Education. More precise calculation: (Years until retirement × Annual income) + Debts + Final expenses − Existing savings. A 35-year-old earning $80,000/year with a mortgage might need $800,000–$1,200,000 in coverage. Factor in any employer-provided coverage (typically 1–2× salary)." },
    { question: "What is the best term life insurance length?", answer: "Match the term to your financial obligations: 20-year term is most popular — covers peak earning years, mortgage payoff, and children reaching adulthood. 30-year term if you have young children or a long mortgage. 10-year term if coverage needs are short-term (specific debt, until retirement). Rule: coverage should last until dependents are self-sufficient and retirement assets are large enough to self-insure." },
    { question: "Does term life insurance pay out if you don't die?", answer: "Standard term life insurance does not pay out if you outlive the policy term — the premiums are simply gone. This is why term insurance is so much cheaper than whole life. Some policies offer a 'return of premium' (ROP) rider that refunds all premiums paid if you survive the term, but this significantly increases the premium cost (typically 2–3× standard term). Most financial planners view ROP as a poor value." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Term vs. Whole Life Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Term Life vs. Whole Life Insurance Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-base font-medium mb-1.5 block">Sex</label>
              <div className="grid grid-cols-2 gap-2">
                {["male", "female"].map(s => (
                  <button key={s} onClick={() => setSex(s)} className={`h-10 rounded-md border text-base font-medium capitalize transition-colors ${sex === s ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background hover:bg-secondary"}`}>{s}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-base font-medium mb-1.5 block">Age</label>
                <div className={inp}><input type="number" value={age} onChange={e => setAge(e.target.value)} min={18} max={70} className={ci} /><span className={suf}>yrs</span></div>
              </div>
              <div>
                <label className="text-base font-medium mb-1.5 block">Coverage</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={coverage} onChange={e => setCoverage(e.target.value)} className={ci} /></div>
              </div>
            </div>
            <div>
              <label className="text-base font-medium mb-1.5 block">Health Class</label>
              <div className="grid grid-cols-3 gap-2">
                {[["preferred", "Preferred"], ["standard", "Standard"], ["substandard", "Substandard"]].map(([v, l]) => (
                  <button key={v} onClick={() => setHealth(v)} className={`h-10 rounded-md border text-xs font-medium transition-colors ${health === v ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background hover:bg-secondary"}`}>{l}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-base font-medium mb-1.5 block">Term Length</label>
                <div className={inp}><input type="number" value={termYears} onChange={e => setTermYears(e.target.value)} min={5} max={30} className={ci} /><span className={suf}>yrs</span></div>
              </div>
              <div>
                <label className="text-base font-medium mb-1.5 block">Investment Return</label>
                <div className={inp}><input type="number" value={investReturn} onChange={e => setInvestReturn(e.target.value)} step={0.5} className={ci} /><span className={suf}>%/yr</span></div>
              </div>
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">
                <Calculator className="h-4 w-4" /> Compare Plans
              </button>
              <button onClick={() => { setAge("35"); setSex("male"); setCoverage("500000"); setTermYears("20"); setInvestReturn("8"); setHealth("standard"); setResult(calcTermVsWhole(35, "male", 500000, 20, 8, "standard")); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className={`border-l-4 rounded-lg p-5 ${result.recommendation === "Term Life Insurance" ? "bg-primary/10 border-primary" : "bg-amber-500/10 border-amber-500"}`}>
                <div className={`text-sm font-bold uppercase tracking-wider mb-1 ${result.recommendation === "Term Life Insurance" ? "text-primary" : "text-amber-600"}`}>Better Choice</div>
                <div className="text-3xl font-extrabold text-foreground tracking-tight">{result.recommendation}</div>
                <div className="text-base text-muted-foreground mt-1">Saves ~${result.savings.toLocaleString("en-US", { maximumFractionDigits: 0 })} over {termYears} years vs. alternative</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Term Annual", `$${result.termPremium.toFixed(0)}`], ["Whole Annual", `$${result.wholePremium.toFixed(0)}`], ["Invest Growth", `$${(result.investmentValue / 1000).toFixed(0)}K`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Comparison Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.label === "Recommendation" ? "font-bold border-t-2 border-border text-primary" : ""}`}>
                      <td className="py-2.5 text-muted-foreground">{r.label}</td>
                      <td className="py-2.5 text-right font-semibold">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Cost Over Time</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData.filter((_, i) => i % 5 === 4 || i === 0)} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} tickFormatter={v => `Yr ${v}`} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, ""]} />
                    <Bar dataKey="termCost" name="Term Cost" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="wholeCost" name="Whole Cost" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="investmentVal" name="Invest Value" fill="#22c55e" radius={[2, 2, 0, 0]} />
                  </BarChart>
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
        <div className="max-w-[1180px] mx-auto mt-12">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance max-w-none">
            <h2>Term Life vs. Whole Life: The Core Difference</h2>
            <p>This <strong>term life vs. whole life calculator</strong> compares the true total cost of both insurance types using the "buy term and invest the difference" methodology — the gold standard approach recommended by most fee-only financial planners. Term life provides pure insurance with no cash value at dramatically lower premiums. Whole life combines insurance with a savings component but at 5–15× the cost of equivalent term coverage.</p>
            <h2>The "Buy Term, Invest the Difference" Strategy</h2>
            <p>The strategy: buy cheap term insurance for the coverage amount you need, then invest the annual premium difference in a diversified index fund portfolio. Annual whole life premium − Annual term premium = Annual investment difference. At 8% annual returns over 20 years, $3,000/year invested grows to approximately $148,000. This typically far exceeds the cash value accumulation inside a whole life policy, which often grows at only 2–4% after fees.</p>
            <h2>When Whole Life Can Be Valuable</h2>
            <p>Whole life makes sense for: (1) high-net-worth estate planning — life insurance death benefits pass tax-free to heirs; (2) special needs planning for a dependent who will need lifelong care; (3) business succession planning (key person insurance, buy-sell agreements); (4) when all tax-advantaged accounts are maximized. For the average middle-income family needing income replacement for 20–30 years, term life almost always wins the cost comparison.</p>
            <h2>How Premiums Are Determined</h2>
            <p>Life insurance premiums depend on: age (younger = cheaper), sex (females live longer = lower rates), health class (preferred, standard, substandard), coverage amount, and policy type. A 35-year-old male in standard health can expect: 20-year term at $500K ≈ $25–40/month; whole life at $500K ≈ $300–500/month. Medical underwriting (blood tests, health history) determines your final health classification. Related tools: <a href="/calculator/health-insurance-calculator">Health Insurance Calculator</a>, <a href="/calculator/disability-insurance-calculator">Disability Insurance Calculator</a>.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/term-life-vs-whole-life-calculator" />
          <PopularCalculators exclude="/calculator/term-life-vs-whole-life-calculator" />
        </div>
      </div>
    </>
  );
}
