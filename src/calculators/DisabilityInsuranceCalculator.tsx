"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface DisabilityResult {
  monthlyBenefit: number;
  annualBenefit: number;
  monthlyPremium: number;
  annualPremium: number;
  coverageRatio: number;
  replacementRatio: number;
  yearsOfBenefit: number;
  totalBenefitValue: number;
  breakdown: { label: string; value: string }[];
  scenarioData: { scenario: string; benefit: number; color: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcDisability(
  monthlyIncome: number, coveragePct: number, age: number,
  occupationClass: number, benefitPeriod: string, eliminationDays: number
): DisabilityResult {
  const monthlyBenefit = monthlyIncome * (coveragePct / 100);
  const annualBenefit = monthlyBenefit * 12;

  // Premium estimate: base rate per $1 of monthly benefit
  // Occupation class: 1 (high risk) to 5A (low risk professional)
  const occupationRate = occupationClass === 5 ? 0.018 : occupationClass === 4 ? 0.022 : occupationClass === 3 ? 0.028 : occupationClass === 2 ? 0.035 : 0.045;
  const ageFactor = age < 30 ? 0.7 : age < 40 ? 1.0 : age < 50 ? 1.4 : 1.8;
  const eliminationFactor = eliminationDays === 30 ? 1.3 : eliminationDays === 60 ? 1.15 : eliminationDays === 90 ? 1.0 : eliminationDays === 180 ? 0.85 : 0.75;

  const monthlyPremium = monthlyBenefit * occupationRate * ageFactor * eliminationFactor;
  const annualPremium = monthlyPremium * 12;
  const coverageRatio = (monthlyPremium / monthlyBenefit) * 100;
  const replacementRatio = coveragePct;

  const retirementAge = 65;
  const yearsOfBenefit = benefitPeriod === "2year" ? 2 : benefitPeriod === "5year" ? 5 : benefitPeriod === "10year" ? 10 : Math.max(0, retirementAge - age);
  const totalBenefitValue = monthlyBenefit * 12 * yearsOfBenefit;

  const breakdown = [
    { label: "Monthly Income", value: `$${monthlyIncome.toLocaleString()}` },
    { label: "Coverage Percentage", value: `${coveragePct}%` },
    { label: "Monthly Benefit", value: `$${monthlyBenefit.toFixed(2)}` },
    { label: "Annual Benefit", value: `$${annualBenefit.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Elimination Period", value: `${eliminationDays} days` },
    { label: "Benefit Period", value: benefitPeriod === "toAge65" ? "To age 65" : benefitPeriod.replace("year", " years") },
    { label: "Monthly Premium (est.)", value: `$${monthlyPremium.toFixed(2)}` },
    { label: "Annual Premium (est.)", value: `$${annualPremium.toFixed(2)}` },
    { label: "Maximum Benefit Payout", value: `$${totalBenefitValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Premium as % of Benefit", value: `${coverageRatio.toFixed(1)}%` },
  ];

  const scenarioData = [
    { scenario: "3-Month Disability", benefit: monthlyBenefit * 3, color: "#22c55e" },
    { scenario: "1-Year Disability", benefit: monthlyBenefit * 12, color: "#f59e0b" },
    { scenario: "5-Year Disability", benefit: monthlyBenefit * 60, color: "#ef4444" },
    { scenario: "To Retirement", benefit: totalBenefitValue, color: "hsl(var(--primary))" },
  ];

  const summaryStats = [
    { label: "Monthly Benefit", value: `$${monthlyBenefit.toFixed(2)}` },
    { label: "Monthly Premium", value: `$${monthlyPremium.toFixed(2)}` },
    { label: "Income Replaced", value: `${replacementRatio}%` },
    { label: "Elimination Period", value: `${eliminationDays} days` },
    { label: "Max Benefit Value", value: `$${(totalBenefitValue / 1000).toFixed(0)}K` },
    { label: "Premium % of Benefit", value: `${coverageRatio.toFixed(1)}%` },
  ];

  return { monthlyBenefit, annualBenefit, monthlyPremium, annualPremium, coverageRatio, replacementRatio, yearsOfBenefit, totalBenefitValue, breakdown, scenarioData, summaryStats };
}

export default function DisabilityInsuranceCalculator() {
  const [income, setIncome] = useState("6000");
  const [coverage, setCoverage] = useState("60");
  const [age, setAge] = useState("35");
  const [occupationClass, setOccupationClass] = useState("4");
  const [benefitPeriod, setBenefitPeriod] = useState("toAge65");
  const [elimination, setElimination] = useState("90");
  const [result, setResult] = useState<DisabilityResult | null>(null);

  const calculate = () => {
    const m = parseFloat(income) || 6000, c = parseFloat(coverage) || 60;
    const a = parseInt(age) || 35, oc = parseInt(occupationClass) || 4;
    const ed = parseInt(elimination) || 90;
    setResult(calcDisability(m, c, a, oc, benefitPeriod, ed));
  };

  useEffect(() => { setResult(calcDisability(6000, 60, 35, 4, "toAge65", 90)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const suf = "pr-3 text-sm text-muted-foreground shrink-0";

  const faqs = [
    { question: "What is disability insurance?", answer: "Disability insurance (DI) replaces a portion of your income (typically 60–80%) if you become unable to work due to illness or injury. It is one of the most overlooked but critical forms of insurance — the Social Security Administration estimates that 1 in 4 workers will become disabled before reaching retirement age. Short-term DI covers 3–6 months; long-term DI covers years or until retirement. Employer-sponsored group DI often covers only 60% of base salary and excludes bonuses." },
    { question: "How much disability insurance do I need?", answer: "The standard recommendation is to replace 60–80% of pre-disability income. Most DI policies cap at 60–70% of income because: (1) DI benefits are tax-free if you pay premiums with after-tax dollars, so 60% tax-free ≈ 80% pre-tax income; (2) work-related expenses decrease when disabled; (3) insuring 100% of income would reduce incentive to return to work. Add up essential monthly expenses (housing, food, utilities, insurance, minimum debt payments) to find your true coverage need." },
    { question: "What is the elimination period in disability insurance?", answer: "The elimination period is the waiting period from disability onset until benefits begin — essentially a deductible measured in time rather than money. Common periods: 30, 60, 90, 180, or 365 days. The 90-day elimination period is the most common sweet spot — benefits are meaningful for long-term disabilities while keeping premiums reasonable. Ensure you have 3–6 months of emergency savings to cover the elimination period." },
    { question: "What is an own-occupation disability policy?", answer: "Own-occupation (own-occ) is the most favorable definition: you receive benefits if you cannot perform the specific duties of YOUR occupation, even if you can work in another field. Example: a surgeon who loses hand dexterity due to injury would receive full benefits even if they can still work as a medical professor. Any-occupation is stricter — you must be unable to perform any job for which you're reasonably suited. Own-occ policies cost more but provide vastly superior protection for high-income professionals." },
    { question: "What occupation class am I in?", answer: "Occupation classes affect premiums significantly: Class 5A/4A (lowest risk, lowest premiums): doctors, attorneys, CPAs, engineers, managers. Class 3A: teachers, nurses, accountants, most office workers. Class 2A: skilled tradespeople, chefs, sales workers. Class 1A (highest risk, highest premiums): manual laborers, construction workers, miners. Some high-risk occupations are uninsurable privately and rely on workers' compensation." },
    { question: "Is employer-provided disability insurance enough?", answer: "Employer group DI is often insufficient because: it typically only covers 60% of base salary (excludes bonuses, commissions); benefits are taxable if the employer pays premiums; coverage ends when you leave the job; and group policies often use the 'any-occupation' definition after 2 years. Supplemental individual DI is portable, often tax-free (if you pay premiums), and provides own-occupation protection for professionals. Most financial planners recommend 6–12 months of emergency savings + comprehensive individual DI for income protection." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Disability Insurance Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Disability Insurance Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-base font-medium mb-1.5 block">Monthly Income</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={income} onChange={e => setIncome(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-base font-medium mb-1.5 block">Coverage %</label>
                <div className={inp}><input type="number" value={coverage} onChange={e => setCoverage(e.target.value)} min={40} max={80} className={ci} /><span className={suf}>%</span></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-base font-medium mb-1.5 block">Age</label>
                <div className={inp}><input type="number" value={age} onChange={e => setAge(e.target.value)} min={18} max={64} className={ci} /><span className={suf}>yrs</span></div>
              </div>
              <div>
                <label className="text-base font-medium mb-1.5 block">Occupation Class</label>
                <div className={inp}><select value={occupationClass} onChange={e => setOccupationClass(e.target.value)} className={ci} style={{ appearance: "none" }}>
                  <option value="5">5A — Professional</option>
                  <option value="4">4A — White Collar</option>
                  <option value="3">3A — Skilled Office</option>
                  <option value="2">2A — Skilled Trade</option>
                  <option value="1">1A — Manual Labor</option>
                </select></div>
              </div>
            </div>
            <div>
              <label className="text-base font-medium mb-1.5 block">Elimination Period</label>
              <div className="grid grid-cols-4 gap-2">
                {[["30", "30d"], ["60", "60d"], ["90", "90d"], ["180", "180d"]].map(([v, l]) => (
                  <button key={v} onClick={() => setElimination(v)} className={`h-10 rounded-md border text-sm font-medium transition-colors ${elimination === v ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background hover:bg-secondary"}`}>{l}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-base font-medium mb-1.5 block">Benefit Period</label>
              <div className="grid grid-cols-2 gap-2">
                {[["2year", "2 Years"], ["5year", "5 Years"], ["10year", "10 Years"], ["toAge65", "To Age 65"]].map(([v, l]) => (
                  <button key={v} onClick={() => setBenefitPeriod(v)} className={`h-10 rounded-md border text-sm font-medium transition-colors ${benefitPeriod === v ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background hover:bg-secondary"}`}>{l}</button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={() => { setIncome("6000"); setCoverage("60"); setAge("35"); setOccupationClass("4"); setBenefitPeriod("toAge65"); setElimination("90"); setResult(calcDisability(6000, 60, 35, 4, "toAge65", 90)); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-sm font-bold text-primary uppercase tracking-wider mb-1">Monthly Benefit</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">${result.monthlyBenefit.toFixed(2)}</div>
                <div className="text-base text-muted-foreground mt-1">Est. premium: ${result.monthlyPremium.toFixed(2)}/mo · Replaces {result.replacementRatio}% of income · Max payout: ${(result.totalBenefitValue / 1000).toFixed(0)}K</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Annual Benefit", `$${result.annualBenefit.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Annual Premium", `$${result.annualPremium.toFixed(0)}`], ["Max Payout", `$${(result.totalBenefitValue / 1000).toFixed(0)}K`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Coverage Details</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className="border-b border-border/50 last:border-0">
                      <td className="py-2.5 text-muted-foreground">{r.label}</td>
                      <td className="py-2.5 text-right font-semibold">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Potential Benefit by Disability Duration</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={result.scenarioData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="scenario" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, "Benefit"]} />
                    <Bar dataKey="benefit" radius={[4, 4, 0, 0]}>{result.scenarioData.map((d, i) => <Cell key={i} fill={d.color} />)}</Bar>
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
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Why Disability Insurance Matters</h2>
            <p>This <strong>disability insurance calculator</strong> estimates your monthly benefit, premium costs, and total potential payout from a long-term disability policy. The Social Security Administration reports that 1 in 4 of today's 20-year-olds will become disabled before retirement. Despite this, disability insurance is the most commonly overlooked form of protection — many working professionals have life insurance but no individual DI. Your ability to earn income is your most valuable financial asset.</p>
            <h2 className="text-2xl font-bold mb-3">How Disability Premiums Are Determined</h2>
            <p>Premiums depend on: (1) Benefit amount — higher monthly benefit = higher premium; (2) Occupation class — professional knowledge workers (class 5A) pay significantly less than manual laborers (class 1A); (3) Age — younger age = lower premium for same coverage; (4) Elimination period — longer wait = lower premium; (5) Benefit period — to-age-65 costs more than 2-year benefit; (6) Definition of disability (own-occ vs. any-occ); (7) Optional riders (COLA, future increase, residual benefits). Expected premiums for individual long-term DI are typically 2–4% of annual income.</p>
            <h2 className="text-2xl font-bold mb-3">Key Policy Features to Understand</h2>
            <p>Non-cancellable and guaranteed renewable: the insurer cannot cancel your policy or raise premiums as long as you pay. Own-occupation definition: you receive benefits if unable to perform your specific occupation — critical for specialists and high earners. Residual/partial disability: provides partial benefits if you can work reduced hours or earn less than pre-disability income. COLA rider: benefits increase with inflation during a claim. Future increase option (FIO): lets you increase coverage as income grows without new underwriting. Related tools: <a href="/calculator/term-life-vs-whole-life-calculator">Term vs. Whole Life Calculator</a>, <a href="/calculator/health-insurance-calculator">Health Insurance Calculator</a>.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/disability-insurance-calculator" />
          <PopularCalculators exclude="/calculator/disability-insurance-calculator" />
        </div>
      </div>
    </>
  );
}
