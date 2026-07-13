"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Home, ChevronDown } from "lucide-react";
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from "recharts";

interface EligResult {
  maxLoanAmount: number;
  maxEMI: number;
  loanToIncomeRatio: number;
  isEligible: boolean;
  foir: number;
  requiredAnnualIncome: number;
  eligibilityScore: number;
  summaryStats: { label: string; value: string }[];
  recommendations: string[];
}

function calcEligibility(monthlyIncome: number, existingEMI: number, interestRate: number, loanTermYears: number, creditScore: number, employmentType: string): EligResult {
  // FOIR - Fixed Obligation to Income Ratio (typically max 40-50%)
  const maxFOIR = creditScore >= 750 ? 0.50 : creditScore >= 700 ? 0.45 : creditScore >= 650 ? 0.40 : 0.35;
  const maxTotalEMI = monthlyIncome * maxFOIR;
  const maxEMI = Math.max(0, maxTotalEMI - existingEMI);

  const r = interestRate / 100 / 12;
  const n = loanTermYears * 12;
  // Reverse-engineer loan amount from max EMI
  const maxLoanAmount = maxEMI > 0 && n > 0
    ? (r > 0 ? maxEMI * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n)) : maxEMI * n)
    : 0;

  const foir = ((existingEMI + maxEMI) / monthlyIncome) * 100;
  const loanToIncomeRatio = (maxLoanAmount / (monthlyIncome * 12));
  const requiredAnnualIncome = (maxLoanAmount / loanToIncomeRatio) / 12;
  const isEligible = maxLoanAmount > 0 && creditScore >= 600;

  // Eligibility score 0-100
  const creditFactor = Math.min(100, Math.max(0, (creditScore - 550) / (800 - 550) * 40));
  const foirFactor = Math.min(40, Math.max(0, (1 - foir / 100) * 40));
  const empFactor = employmentType === "salaried" ? 20 : employmentType === "self-employed" ? 15 : 10;
  const eligibilityScore = Math.round(creditFactor + foirFactor + empFactor);

  const recommendations: string[] = [];
  if (creditScore < 700) recommendations.push("Improve credit score to 700+ for better loan terms and higher eligibility.");
  if (existingEMI > monthlyIncome * 0.3) recommendations.push("Reduce existing debt obligations to improve FOIR ratio.");
  if (loanTermYears < 20) recommendations.push("Extending the loan term to 20-30 years can increase your eligible loan amount.");
  if (creditScore >= 750 && existingEMI === 0) recommendations.push("Excellent profile — negotiate for the lowest available interest rate.");

  const summaryStats = [
    { label: "Maximum Loan Amount", value: `$${maxLoanAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Max Affordable EMI", value: `$${maxEMI.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo` },
    { label: "Current FOIR", value: `${foir.toFixed(1)}%` },
    { label: "Max FOIR Allowed", value: `${(maxFOIR * 100).toFixed(0)}%` },
    { label: "Loan-to-Income Ratio", value: `${loanToIncomeRatio.toFixed(1)}x annual income` },
    { label: "Eligibility Score", value: `${eligibilityScore}/100` },
  ];

  return { maxLoanAmount, maxEMI, loanToIncomeRatio, isEligible, foir, requiredAnnualIncome, eligibilityScore, summaryStats, recommendations };
}

const DEFAULTS = { monthlyIncome: "8000", existingEMI: "500", interestRate: "6.5", loanTermYears: "30", creditScore: "720", employmentType: "salaried" };

const CompactInput = ({ id, label, value, onChange, prefix, suffix }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1.5">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground shrink-0">{prefix}</span>}
      <input id={id} type="number" value={value} onChange={e => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground shrink-0">{suffix}</span>}
    </div>
  </div>
);

export default function HomeLoanEligibilityCalculator() {
  const [monthlyIncome, setMonthlyIncome] = useState(DEFAULTS.monthlyIncome);
  const [existingEMI, setExistingEMI] = useState(DEFAULTS.existingEMI);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [loanTermYears, setLoanTermYears] = useState(DEFAULTS.loanTermYears);
  const [creditScore, setCreditScore] = useState(DEFAULTS.creditScore);
  const [employmentType, setEmploymentType] = useState(DEFAULTS.employmentType);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState<EligResult | null>(null);

  const calc = () => setResults(calcEligibility(parseFloat(monthlyIncome)||0, parseFloat(existingEMI)||0, parseFloat(interestRate)||0, parseFloat(loanTermYears)||30, parseFloat(creditScore)||0, employmentType));
  const reset = () => { setMonthlyIncome(DEFAULTS.monthlyIncome); setExistingEMI(DEFAULTS.existingEMI); setInterestRate(DEFAULTS.interestRate); setLoanTermYears(DEFAULTS.loanTermYears); setCreditScore(DEFAULTS.creditScore); setEmploymentType(DEFAULTS.employmentType); setShowAdvanced(false); };
  useEffect(() => { calc(); }, []);

  const faqs = [
    { question: "How is home loan eligibility calculated?", answer: "Lenders use multiple criteria: your Gross Monthly Income, Fixed Obligation to Income Ratio (FOIR), credit score, employment stability, age, and existing liabilities. The FOIR is the most critical metric—most lenders allow total EMI obligations (including the new loan) to be no more than 40-50% of gross monthly income." },
    { question: "What credit score is needed for a home loan?", answer: "Most traditional lenders require a minimum credit score of 620-640 for approval. FHA loans accept scores as low as 580 with 3.5% down. Scores above 700 qualify for standard rates, while 740+ scores unlock the best available rates and the highest LTV ratios." },
    { question: "What is FOIR (Fixed Obligation to Income Ratio)?", answer: "FOIR measures the percentage of your gross income already committed to fixed monthly obligations (existing loan EMIs, credit card minimums). Most lenders allow a maximum FOIR of 40-50%, meaning if you earn $8,000/month and already pay $1,000 in EMIs, you have $2,200 of EMI capacity remaining (at 40% FOIR)." },
    { question: "How can I increase my home loan eligibility?", answer: "The most effective methods are: clearing existing debt to reduce FOIR, improving your credit score, increasing your income or adding a co-applicant with income, choosing a longer loan tenure (30 years vs 15 years), and making a larger down payment to reduce the required loan amount." },
    { question: "Does employment type affect eligibility?", answer: "Yes. Salaried employees with stable employment history are viewed most favorably by lenders. Self-employed borrowers typically need 2-3 years of consistent income documentation and may face slightly stricter FOIR caps. Seasonal or contract workers may face additional scrutiny around income stability." },
  ];

  const scoreColor = results ? (results.eligibilityScore >= 70 ? "#10b981" : results.eligibilityScore >= 45 ? "#f59e0b" : "#ef4444") : "hsl(var(--primary))";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator/finance" }, { label: "Home Loan Eligibility Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Home Loan Eligibility Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="income" label="Monthly Income" value={monthlyIncome} onChange={setMonthlyIncome} prefix="$" />
              <CompactInput id="emi" label="Existing Monthly EMI" value={existingEMI} onChange={setExistingEMI} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="rate" label="Interest Rate" value={interestRate} onChange={setInterestRate} suffix="%" />
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-foreground mb-1.5">Loan Term</label>
                <div className="grid grid-cols-3 gap-1">
                  {[["15","15yr"],["20","20yr"],["30","30yr"]].map(([v,l]) => (
                    <button key={v} onClick={() => setLoanTermYears(v)} className={`h-10 rounded-md border text-xs font-medium transition-colors ${loanTermYears===v?"bg-primary text-primary-foreground border-primary":"border-input bg-background hover:bg-secondary"}`}>{l}</button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1">
                Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <CompactInput id="credit" label="Credit Score" value={creditScore} onChange={setCreditScore} />
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-foreground mb-1.5">Employment Type</label>
                    <select value={employmentType} onChange={e => setEmploymentType(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20">
                      <option value="salaried">Salaried</option>
                      <option value="self-employed">Self-Employed</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-2">
              <button type="button" onClick={calc} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">
                <Home className="h-4 w-4" /> Check Eligibility
              </button>
              <button type="button" onClick={reset} className="w-12 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {results && (<>
              <div className={`border-l-4 rounded-lg p-5 ${results.isEligible ? "bg-primary/10 border-primary" : "bg-destructive/10 border-destructive"}`}>
                <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${results.isEligible ? "text-primary" : "text-destructive"}`}>Maximum Loan Amount</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">${results.maxLoanAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                <div className="text-sm text-muted-foreground mt-1 font-medium">Max monthly EMI: ${results.maxEMI.toFixed(2)} · FOIR: {results.foir.toFixed(1)}%</div>
              </div>
              <div className="grid lg:grid-cols-2 gap-4">
                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Eligibility Details</h3>
                  <div className="space-y-2.5">
                    {results.summaryStats.map((s, i) => (
                      <div key={i} className="flex justify-between items-center border-b border-border/40 pb-2 last:border-0">
                        <span className="text-sm text-muted-foreground">{s.label}:</span>
                        <span className="text-sm font-semibold">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center">
                  <h3 className="text-base font-bold mb-2 w-full text-left">Eligibility Score</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[{ name: "Score", value: results.eligibilityScore, fill: scoreColor }]} startAngle={90} endAngle={-270}>
                      <RadialBar dataKey="value" cornerRadius={6} background={{ fill: "hsl(var(--muted))" }} />
                      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground font-bold text-2xl" style={{ fontSize: 28, fontWeight: 700 }}>{results.eligibilityScore}</text>
                      <text x="50%" y="62%" textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-xs" style={{ fontSize: 12 }}>/100</text>
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <p className="text-sm text-muted-foreground text-center">{results.eligibilityScore >= 70 ? "Strong Eligibility" : results.eligibilityScore >= 45 ? "Moderate Eligibility" : "Low Eligibility"}</p>
                </div>
              </div>
              {results.recommendations.length > 0 && (
                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-3">Recommendations to Improve Eligibility</h3>
                  <div className="space-y-2">
                    {results.recommendations.map((r, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary mt-0.5">→</span><span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>)}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Home Loan Eligibility Is Determined</h2>
            <p>Lenders do not arbitrarily approve or deny home loan applications. They use a systematic framework to assess your ability to repay. The <strong>Home Loan Eligibility Calculator</strong> replicates this framework, giving you a transparent view of how a lender evaluates your financial profile before you ever submit an application. Understanding your eligibility in advance allows you to make strategic improvements, negotiate from a position of strength, and avoid the credit score damage of rejected applications.</p>
            <p>The two primary pillars of eligibility assessment are your <strong>income-based repayment capacity</strong> and your <strong>creditworthiness</strong>. The first determines how large a monthly payment you can safely afford without defaulting. The second determines the lender's confidence in your willingness to repay based on your historical behavior with credit.</p>

            <h2 className="text-2xl font-bold mb-3">The FOIR Framework</h2>
            <p>The Fixed Obligation to Income Ratio (FOIR) is the most important quantitative metric in loan eligibility. It measures what percentage of your gross monthly income is already committed to fixed monthly payments—existing loan EMIs, car payments, and minimum credit card payments. Most lenders enforce a hard ceiling of 40% to 50% FOIR, depending on your credit profile. If you earn $8,000 per month and already pay $1,200 in existing EMIs, your remaining EMI capacity is only $2,000 (at 40% FOIR). This directly caps the maximum loan amount you can qualify for at any given interest rate and term.</p>

            <h2 className="text-2xl font-bold mb-3">The Credit Score's Role</h2>
            <p>Your credit score is a lender's shorthand assessment of your repayment reliability. Scores above 740 represent near-perfect credit history and unlock the lowest rates and most flexible terms. Scores between 670 and 739 are "good" and receive standard approval. Scores between 620 and 669 are considered "fair"—approval is possible but at higher rates with stricter conditions. Below 620, most conventional lenders decline, though FHA programs accept lower scores with compensating factors.</p>
            <p>The credit score also affects your FOIR ceiling. Borrowers with excellent credit (750+) are typically allowed a higher FOIR (up to 50%) because their track record demonstrates disciplined debt management. Borrowers with lower scores face more conservative FOIR caps.</p>

            <h2 className="text-2xl font-bold mb-3">Strategies to Increase Eligibility</h2>
            <p><strong>Add a co-applicant:</strong> Adding a spouse or family member with income to the application combines your incomes, dramatically increasing the maximum eligible loan amount. Both applicants' credit scores are considered, so ensure the co-applicant has a strong credit profile.</p>
            <p><strong>Reduce existing debt:</strong> Paying off a car loan, personal loan, or credit card balance before applying can significantly lower your FOIR, creating more room for a new mortgage payment. Prioritize eliminating loans with the largest monthly payment relative to their remaining balance.</p>
            <p><strong>Extend the loan tenure:</strong> Choosing a 30-year term instead of a 15-year term reduces the required monthly payment for any given loan amount, effectively increasing the maximum loan you qualify for. The trade-off is substantially more total interest paid over the loan life.</p>
            <p><strong>Build a larger down payment:</strong> A larger down payment reduces the required loan amount, which reduces the required monthly payment. This can bring an otherwise ineligible loan amount into the range your income can support.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/home-loan-eligibility-calculator" />
          <PopularCalculators exclude="/calculator/home-loan-eligibility-calculator" />
        </div>
      </div>
    </>
  );
}
