"use client";
import { RotateCcw, TrendingUp, Info, Calculator, AlertCircle } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import InputField from "@/domains/calculator/components/ui/InputField";
const W4WithholdingCalculator = () => {
  const [annualSalary, setAnnualSalary] = useState("75000");
  const [currentWithholding, setCurrentWithholding] = useState("450"); // per paycheck
  const [payFrequency, setPayFrequency] = useState("biweekly");
  const [filingStatus, setFilingStatus] = useState("single");
  const [dependents, setDependents] = useState("0");
  const [otherIncome, setOtherIncome] = useState("0");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const salary = parseFloat(annualSalary) || 0;
    const income = salary + (parseFloat(otherIncome) || 0);
    const withholding = parseFloat(currentWithholding) || 0;
    const freq = getFrequencyMultiplier(payFrequency);
    const numDeps = parseInt(dependents) || 0;

    // 1. Estimate Annual Tax Liability
    const standardDeduction = filingStatus === "single" ? 14600 : 29200;
    const taxableIncome = Math.max(0, income - standardDeduction);
    
    // Federal Tax Calculation (2024 Simplified)
    const annualTaxLiability = calculateAnnualTax(taxableIncome, filingStatus);
    const childCredits = numDeps * 2000;
    const netAnnualTax = Math.max(0, annualTaxLiability - childCredits);

    // 2. Compare to Annual Withholding
    const annualWithholding = withholding * freq;
    const difference = annualWithholding - netAnnualTax;

    setResults({
      netAnnualTax,
      annualWithholding,
      difference,
      isOverpaying: difference > 0,
      monthlyAdjustment: Math.abs(difference) / 12,
      paycheckAdjustment: Math.abs(difference) / freq
    });
  };

  const calculateAnnualTax = (taxable: number, status: string) => {
    const brackets = status === "single" ? [
      { limit: 11600, rate: 0.10 },
      { limit: 47150, rate: 0.12 },
      { limit: 100525, rate: 0.22 },
      { limit: 191950, rate: 0.24 },
      { limit: Infinity, rate: 0.32 },
    ] : [
      { limit: 23200, rate: 0.10 },
      { limit: 94300, rate: 0.12 },
      { limit: 201050, rate: 0.22 },
      { limit: 383900, rate: 0.24 },
      { limit: Infinity, rate: 0.32 },
    ];

    let tax = 0;
    let prevLimit = 0;
    for (const b of brackets) {
      const taxableInBracket = Math.min(taxable, b.limit - prevLimit);
      tax += taxableInBracket * b.rate;
      taxable -= taxableInBracket;
      prevLimit = b.limit;
      if (taxable <= 0) break;
    }
    return tax;
  };

  const getFrequencyMultiplier = (freq: string) => {
    if (freq === "weekly") return 52;
    if (freq === "biweekly") return 26;
    if (freq === "semimonthly") return 24;
    return 12;
  };

  const reset = () => {
    setAnnualSalary("75000");
    setCurrentWithholding("450");
    setPayFrequency("biweekly");
    setFilingStatus("single");
    setDependents("0");
    setOtherIncome("0");
  };

  const faqs = [
    {
      question: "What is Form W-4?",
      answer: "Form W-4, Employee's Withholding Certificate, is an IRS form you complete for your employer to determine the amount of federal income tax to withhold from your paycheck. Accurate withholding ensures you don't owe a large amount or receive a massive refund at tax time."
    },
    {
      question: "Should I aim for a $0 tax refund?",
      answer: "Ideally, yes. A large tax refund means you overpaid the government throughout the year, essentially giving them an interest-free loan. Aiming for a $0 refund (or a very small one) puts more money in your monthly paychecks for saving, investing, or paying off debt."
    },
    {
      question: "What happens if I under-withhold my taxes?",
      answer: "If you don't withhold enough tax throughout the year, you will owe a balance when you file your return. If you owe more than $1,000 and haven't met certain 'safe harbor' rules, the IRS may also charge an underpayment penalty."
    },
    {
      question: "When should I update my W-4?",
      answer: "You should update your W-4 whenever you experience a major life event, such as marriage, divorce, the birth of a child, a significant change in income, or if you start a second job or side business."
    }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "W-4 Withholding Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">W-4 Withholding Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-8">
                <section className="space-y-6">
                  <h2 className="text-2xl font-bold mb-3">
                    <TrendingUp className="h-5 w-5 text-primary" /> Current Situation
                  </h2>
                  <InputField id="salary" label="Annual Gross Salary" value={annualSalary} onChange={setAnnualSalary} prefix="$" />
                  <InputField id="withholding" label="Current Federal Withholding" value={currentWithholding} onChange={setCurrentWithholding} prefix="$" tooltip="Found on your most recent paystub." />
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Pay Frequency</label>
                    <select value={payFrequency} onChange={(e) => setPayFrequency(e.target.value)} className="w-full bg-secondary/50 border border-border p-3 rounded-xl outline-none focus:border-primary transition-all font-medium">
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-Weekly</option>
                      <option value="semimonthly">Semi-Monthly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </section>

                <section className="space-y-6">
                  <h2 className="text-2xl font-bold mb-3">
                    <Info className="h-5 w-5 text-primary" /> Adjustments
                  </h2>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Filing Status</label>
                    <select value={filingStatus} onChange={(e) => setFilingStatus(e.target.value)} className="w-full bg-secondary/50 border border-border p-3 rounded-xl outline-none focus:border-primary transition-all font-medium">
                      <option value="single">Single</option>
                      <option value="married">Married Filing Jointly</option>
                    </select>
                  </div>
                  <InputField id="dependents" label="Number of Dependents" value={dependents} onChange={setDependents} suffix="kids" />
                  <InputField id="other-income" label="Other Annual Income" value={otherIncome} onChange={setOtherIncome} prefix="$" tooltip="Investment income or side hustle profits." />
                </section>
              </div>
              <div className="mt-8 flex gap-3 items-center">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
<button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground flex items-center gap-2 font-bold text-sm">
                  <RotateCcw className="h-4 w-4" /> Reset 
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card" style={{ borderColor: results.isOverpaying ? 'rgba(59, 130, 246, 0.2)' : 'rgba(239, 68, 68, 0.2)', backgroundColor: results.isOverpaying ? 'rgba(59, 130, 246, 0.05)' : 'rgba(239, 68, 68, 0.05)' }}>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">{results.isOverpaying ? 'Projected Over-Withholding' : 'Projected Under-Withholding'}</p>
                  <p className={`text-7xl font-black mb-4 ${results.isOverpaying ? 'text-blue-600' : 'text-red-600'}`}>${Math.round(results.difference).toLocaleString()}</p>
                  
                  <div className="max-w-md px-6 py-4 bg-white/50 backdrop-blur rounded-2xl border border-border shadow-sm">
                     <p className="text-sm font-medium text-foreground mb-1">
                        {results.isOverpaying 
                          ? `You are overpaying by $${Math.round(results.paycheckAdjustment)} per paycheck.` 
                          : `You may owe $${Math.round(results.paycheckAdjustment)} more per paycheck.`}
                     </p>
                     <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider italic">Recommendation: Adjust Form W-4 Step 3 or 4</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                   <div className="card-calculator">
                      <h3 className="font-bold flex items-center gap-2 mb-4"><Calculator className="h-4 w-4 text-primary" /> Annual Totals</h3>
                      <ResultDisplay items={[
                        { label: "Estimated Tax Liability", value: results.netAnnualTax },
                        { label: "Projected Annual Withholding", value: results.annualWithholding },
                        { label: "Difference", value: results.difference },
                      ]} />
                   </div>
                   <div className="card-calculator flex flex-col justify-center">
                      <div className="flex items-start gap-3 mb-4">
                        <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                        <p className="text-xs text-muted-foreground leading-relaxed italic">Adjusting your withholding allows you to control your cash flow. If you are over-withholding, you could be using that extra money to pay off high-interest debt or invest in your 401(k).</p>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (results.annualWithholding / (results.netAnnualTax || 1)) * 100)}%` }}></div>
                      </div>
                      <p className="text-[10px] font-bold text-muted-foreground mt-2 uppercase text-center">Goal: 100% Alignment</p>
                   </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">How to Use This W-4 Calculator</h2>
              <p>The goal of tax withholding is to pay exactly what you owe to the government—no more and no less. This calculator helps you see if your current paycheck withholding is on track to meet your annual tax liability or if you need to make an adjustment to avoid a surprise bill in April.</p>

              <h3>Step-by-Step Optimization</h3>
              <ol>
                <li><strong>Check Your Paystub:</strong> Find the line labeled "Federal Income Tax" to see how much is currently being withheld from every paycheck.</li>
                <li><strong>Estimate Annual Taxes:</strong> Our calculator uses current 2024 tax brackets and the standard deduction to estimate what you will actually owe at the end of the year.</li>
                <li><strong>Analyze the Gap:</strong> If you are projected to overpay by thousands of dollars, you are giving the government an interest-free loan. If you are underpaying, you could face underpayment penalties.</li>
              </ol>

              <h3>How to Adjust Form W-4</h3>
              <p>If this calculator shows you need to change your withholding, you'll need to submit a new Form W-4 to your employer. Here is how the most common adjustments work:</p>
              <ul>
                <li><strong>To Decrease Withholding (Get more money now):</strong> Use <strong>Step 3 (Claim Dependents)</strong>. You can enter a dollar amount here even if you don't have children; it serves as a general credit to lower your withholding.</li>
                <li><strong>To Increase Withholding (Avoid owing later):</strong> Use <strong>Step 4(c) (Extra Withholding)</strong>. This tells your employer to take a specific additional dollar amount from every paycheck. This is common for people with side income or investment gains.</li>
              </ul>

              <h3>Why Accuracy Matters</h3>
              <p>The IRS requires you to pay at least 90% of your current year's tax or 100% of last year's tax (the "Safe Harbor" rule) throughout the year. If you fall short, you may be charged an underpayment penalty. On the other hand, the average tax refund is around $2,800. For many people, that $230 per month would be better served paying down a credit card or funding an emergency savings account.</p>

              <h3>Life Changes and the W-4</h3>
              <p>You should review your withholding every time you experience a major change:</p>
              <ul>
                <li><strong>Marriage:</strong> Combining incomes can sometimes push a couple into a higher tax bracket.</li>
                <li><strong>New Child:</strong> You gain a $2,000 tax credit per child, which should be reflected on your W-4 to increase your take-home pay.</li>
                <li><strong>Bonus/Raise:</strong> A large bonus might be withheld at a flat 22% rate, which could be higher or lower than your actual marginal rate.</li>
              </ul>

              <h2 className="text-2xl font-bold mb-3">Final Recommendation</h2>
              <p>Aim for a slight over-withholding (a refund of $100-$300). This provides a small safety margin for unexpected income while ensuring you keep the majority of your hard-earned money in your own pocket throughout the year.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/w4-withholding-calculator" />
          <PopularCalculators exclude="/calculator/w4-withholding-calculator" />
        </div>
      </div>
    </>
  );
};

export default W4WithholdingCalculator;

