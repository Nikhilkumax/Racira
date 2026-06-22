"use client";
import { RotateCcw, Calculator, Receipt, UserPlus } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import InputField from "@/components/calculator/InputField";
const TaxRefundCalculator = () => {
  const [grossIncome, setGrossIncome] = useState("75000");
  const [withheld, setWithheld] = useState("10000");
  const [filingStatus, setFilingStatus] = useState("single");
  const [dependents, setDependents] = useState("0");
  const [taxYear, setTaxYear] = useState("2024");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const income = parseFloat(grossIncome) || 0;
    const taxWithheld = parseFloat(withheld) || 0;
    const numDeps = parseInt(dependents) || 0;

    // 2024 Standard Deductions
    const standardDeduction = filingStatus === "single" ? 14600 : 29200;
    const taxableIncome = Math.max(0, income - standardDeduction);

    // 2024 Brackets (Single)
    const singleBrackets = [
      { limit: 11600, rate: 0.10 },
      { limit: 47150, rate: 0.12 },
      { limit: 100525, rate: 0.22 },
      { limit: 191950, rate: 0.24 },
      { limit: 243725, rate: 0.32 },
      { limit: 609350, rate: 0.35 },
      { limit: Infinity, rate: 0.37 },
    ];

    // 2024 Brackets (Married Joint)
    const marriedBrackets = [
      { limit: 23200, rate: 0.10 },
      { limit: 94300, rate: 0.12 },
      { limit: 201050, rate: 0.22 },
      { limit: 383900, rate: 0.24 },
      { limit: 487450, rate: 0.32 },
      { limit: 731200, rate: 0.35 },
      { limit: Infinity, rate: 0.37 },
    ];

    const brackets = filingStatus === "single" ? singleBrackets : marriedBrackets;
    let taxLiability = 0;
    let remainingTaxable = taxableIncome;
    let prevLimit = 0;

    for (const bracket of brackets) {
      const taxableInBracket = Math.min(remainingTaxable, bracket.limit - prevLimit);
      taxLiability += taxableInBracket * bracket.rate;
      remainingTaxable -= taxableInBracket;
      prevLimit = bracket.limit;
      if (remainingTaxable <= 0) break;
    }

    // Credits (Simplified Child Tax Credit: $2,000 per dependent)
    const totalCredits = numDeps * 2000;
    const netTax = Math.max(0, taxLiability - totalCredits);
    const refundAmount = taxWithheld - netTax;

    setResults({
      taxableIncome,
      taxLiability,
      totalCredits,
      netTax,
      refundAmount: Math.abs(refundAmount),
      isRefund: refundAmount >= 0,
      effectiveRate: income > 0 ? (netTax / income) * 100 : 0,
      standardDeduction
    });
  };

  const reset = () => {
    setGrossIncome("75000");
    setWithheld("10000");
    setFilingStatus("single");
    setDependents("0");
    setTaxYear("2024");
  };

  const faqs = [
    {
      question: "What is the standard deduction for 2024?",
      answer: "For the 2024 tax year, the standard deduction is $14,600 for single filers and $29,200 for married couples filing jointly. This amount is subtracted from your gross income to determine your taxable income."
    },
    {
      question: "How does the Child Tax Credit affect my refund?",
      answer: "The Child Tax Credit provides up to $2,000 per qualifying child. It is a 'credit,' which means it reduces your tax liability dollar-for-dollar. If the credit reduces your tax to zero, you may be eligible for a partial refund of the remaining credit (the Additional Child Tax Credit)."
    },
    {
      question: "Why did I owe money instead of getting a refund?",
      answer: "You owe money if your total tax liability for the year is greater than the amount of tax withheld from your paychecks. This often happens if you have multiple jobs, significant investment income, or if you didn't adjust your W-4 properly after a life change (like a marriage or raise)."
    },
    {
      question: "How long does it take to get a tax refund?",
      answer: "Most taxpayers receive their refund within 21 days of filing electronically with direct deposit. Paper returns can take 6 to 12 weeks to process."
    }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Tax Refund Estimator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Tax Refund Estimator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-8">
                <section className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <Receipt className="h-5 w-5 text-primary" /> Income & Withholding
                  </h2>
                  <InputField id="income" label="Annual Gross Income" value={grossIncome} onChange={setGrossIncome} prefix="$" tooltip="Your total salary before taxes." />
                  <InputField id="withheld" label="Federal Tax Withheld" value={withheld} onChange={setWithheld} prefix="$" tooltip="Total federal income tax already paid (from your paystubs or W-2)." />
                </section>

                <section className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <UserPlus className="h-5 w-5 text-primary" /> Filing & Family
                  </h2>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Filing Status</label>
                    <select value={filingStatus} onChange={(e) => setFilingStatus(e.target.value)} className="w-full bg-secondary/50 border border-border p-3 rounded-xl outline-none focus:border-primary transition-all font-medium">
                      <option value="single">Single</option>
                      <option value="married">Married Filing Jointly</option>
                    </select>
                  </div>
                  <InputField id="dependents" label="Number of Dependents" value={dependents} onChange={setDependents} suffix="kids" tooltip="Number of qualifying children under age 17." />
                </section>
              </div>
              <div className="mt-8 flex gap-3 items-center">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate Tax</button>
<button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground flex items-center gap-2 font-bold text-sm">
                  <RotateCcw className="h-4 w-4" /> Reset 
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <div className="card-calculator py-12 text-center relative overflow-hidden border-solid border-2 mb-8" style={{ backgroundColor: results.isRefund ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)', borderColor: results.isRefund ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)' }}>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">{results.isRefund ? 'Estimated Refund' : 'Estimated Tax Owed'}</p>
                  <p className={`text-8xl font-black mb-2 ${results.isRefund ? 'text-emerald-600' : 'text-red-600'}`}>${Math.round(results.refundAmount).toLocaleString()}</p>
                  <p className={`text-xl font-bold uppercase ${results.isRefund ? 'text-emerald-500' : 'text-red-500'}`}>{results.isRefund ? 'Money Back' : 'Balance Due'}</p>
                </div>

                <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                    <Calculator className="h-5 w-5 text-primary" /> Tax Summary
                  </h2>
                  <ResultDisplay items={[
                    { label: "Standard Deduction", value: results.standardDeduction },
                    { label: "Taxable Income", value: results.taxableIncome },
                    { label: "Total Tax Liability", value: results.taxLiability },
                    { label: "Total Tax Credits", value: results.totalCredits },
                    { label: "Effective Tax Rate", value: 0, textValue: `${results.effectiveRate.toFixed(1)}%` },
                  ]} />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2>How to Estimate Your Tax Refund</h2>
              <p>Understanding how your tax refund is calculated can help you manage your finances better and avoid surprises in April. A tax refund is not "free money" from the government; it is simply the return of money that you overpaid throughout the year.</p>

              <h3>The Basic Formula</h3>
              <p>The IRS uses a specific sequence to determine your final tax bill:</p>
              <ol>
                <li><strong>Calculate Gross Income:</strong> The total of all money earned from work, investments, and other sources.</li>
                <li><strong>Subtract Deductions:</strong> Most people take the <strong>Standard Deduction</strong>, which is a fixed dollar amount that reduces your taxable income. If you have significant expenses like mortgage interest or charitable gifts, you might choose to "itemize" instead.</li>
                <li><strong>Apply Tax Brackets:</strong> Your taxable income is put into brackets, where different portions are taxed at different rates (ranging from 10% to 37%).</li>
                <li><strong>Subtract Credits:</strong> Tax credits, like the Child Tax Credit, are subtracted directly from the tax you owe.</li>
                <li><strong>Compare to Withholding:</strong> Finally, the IRS compares your total tax bill to the amount you've already paid through your paychecks.</li>
              </ol>

              <h3>Credits vs. Deductions</h3>
              <p>It's important to know the difference between these two tax-lowering tools:</p>
              <ul>
                <li><strong>Deductions:</strong> Lower the amount of income you are taxed on. A $1,000 deduction saves you $220 if you are in the 22% tax bracket.</li>
                <li><strong>Credits:</strong> Lower your tax bill dollar-for-dollar. A $1,000 credit saves you exactly $1,000, regardless of your bracket.</li>
              </ul>

              <h3>Why Large Refunds Aren't Always Good</h3>
              <p>While a big check in the mail feels good, a large refund means you gave the government an interest-free loan all year. If you received a $3,000 refund, that's $250 a month that could have been in your paycheck to pay down debt or invest in your retirement account. You can adjust your withholding by submitting a new <strong>Form W-4</strong> to your employer.</p>

              <h3>Common Mistakes to Avoid</h3>
              <ul>
                <li><strong>Missing Dependents:</strong> Ensure you include all qualifying children under age 17.</li>
                <li><strong>Ignoring Other Income:</strong> Don't forget to include side hustle income, unemployment benefits, or gambling winnings.</li>
                <li><strong>Not Including Pre-Tax Deductions:</strong> Money put into a 401(k) or HSA reduces your gross income and should be subtracted before using this calculator.</li>
              </ul>

              <h2>Preparing for Tax Season</h2>
              <p>To get the most accurate estimate, gather your most recent paystub, which will show your "Year-to-Date" (YTD) earnings and federal tax withheld. If you expect your income to remain stable for the rest of the year, this calculator will provide a very close approximation of your final tax situation.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/tax-refund-calculator" />
          <PopularCalculators exclude="/calculator/tax-refund-calculator" />
        </div>
      </div>
    </>
  );
};

export default TaxRefundCalculator;

