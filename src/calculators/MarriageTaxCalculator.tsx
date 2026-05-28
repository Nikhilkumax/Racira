"use client";
import { RotateCcw, Calculator, Users, TrendingDown } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import InputField from "@/components/calculator/InputField";
const MarriageTaxCalculator = () => {
  const [income1, setIncome1] = useState("85000");
  const [income2, setIncome2] = useState("45000");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const i1 = parseFloat(income1) || 0;
    const i2 = parseFloat(income2) || 0;

    // 2024 Standard Deductions
    const singleDed = 14600;
    const jointDed = 29200;

    // Calculate Joint Tax
    const jointTaxable = Math.max(0, i1 + i2 - jointDed);
    const jointTax = calculateFederalTax(jointTaxable, "joint");

    // Calculate Separate Tax
    const p1Taxable = Math.max(0, i1 - singleDed);
    const p1Tax = calculateFederalTax(p1Taxable, "single");
    
    const p2Taxable = Math.max(0, i2 - singleDed);
    const p2Tax = calculateFederalTax(p2Taxable, "single");
    
    const totalSeparateTax = p1Tax + p2Tax;
    const difference = totalSeparateTax - jointTax;

    setResults({
      jointTax,
      totalSeparateTax,
      p1Tax,
      p2Tax,
      difference,
      isJointBetter: difference > 0,
      savingsPercentage: Math.abs(difference / (jointTax || 1)) * 100
    });
  };

  const calculateFederalTax = (taxable: number, status: string) => {
    const singleBrackets = [
      { limit: 11600, rate: 0.10 },
      { limit: 47150, rate: 0.12 },
      { limit: 100525, rate: 0.22 },
      { limit: 191950, rate: 0.24 },
      { limit: 243725, rate: 0.32 },
      { limit: 609350, rate: 0.35 },
      { limit: Infinity, rate: 0.37 },
    ];
    const jointBrackets = [
      { limit: 23200, rate: 0.10 },
      { limit: 94300, rate: 0.12 },
      { limit: 201050, rate: 0.22 },
      { limit: 383900, rate: 0.24 },
      { limit: 487450, rate: 0.32 },
      { limit: 731200, rate: 0.35 },
      { limit: Infinity, rate: 0.37 },
    ];
    const brackets = status === "single" ? singleBrackets : jointBrackets;
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

  const reset = () => {
    setIncome1("85000");
    setIncome2("45000");
  };

  const faqs = [
    {
      question: "What is the 'marriage penalty'?",
      answer: "The marriage penalty occurs when a couple's total tax bill is higher when filing jointly than it would be if they were single. This typically happens when both spouses have high, similar incomes. However, for most couples, marriage results in a 'bonus' or a lower total tax bill."
    },
    {
      question: "Why is filing jointly usually better?",
      answer: "Filing jointly is usually better because it provides a higher standard deduction and wider tax brackets. If one spouse earns significantly more than the other, the higher earner's income can be 'pushed down' into the lower earner's tax brackets, resulting in substantial savings."
    },
    {
      question: "When should a couple file separately?",
      answer: "Filing separately may be beneficial if one spouse has very high out-of-pocket medical expenses or other itemized deductions that are subject to an AGI threshold. It can also be used if one spouse has student loans on an income-driven repayment plan, as it may lower their monthly payments."
    },
    {
      question: "Does this calculator include state taxes?",
      answer: "No, this calculator only estimates Federal Income Tax. State tax laws vary significantly; some states follow federal filing status rules, while others have completely different systems."
    }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Marriage Tax Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Marriage Tax Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Compare your tax liability for 'Married Filing Jointly' vs 'Married Filing Separately' to find your optimal strategy.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-8">
                <section className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-primary" /> Spouses' Income
                  </h2>
                  <InputField id="income1" label="Spouse 1 Gross Income" value={income1} onChange={setIncome1} prefix="$" />
                  <InputField id="income2" label="Spouse 2 Gross Income" value={income2} onChange={setIncome2} prefix="$" />
                </section>

                <section className="space-y-4">
                   <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <TrendingDown className="h-5 w-5 text-primary" /> Quick Summary
                  </h2>
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                    <p className="text-[10px] font-bold text-primary uppercase mb-1">Total Combined Income</p>
                    <p className="text-3xl font-black text-foreground">${(parseFloat(income1) + parseFloat(income2)).toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-xl border border-border">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Standard Deduction (Joint)</p>
                    <p className="text-xl font-bold">$29,200</p>
                  </div>
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
                <div className="card-calculator border-solid border-2 py-12 text-center mb-8" style={{ borderColor: results.isJointBetter ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', backgroundColor: results.isJointBetter ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)' }}>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">{results.isJointBetter ? 'Potential Marriage Bonus' : 'Potential Marriage Penalty'}</p>
                  <p className={`text-8xl font-black mb-2 ${results.isJointBetter ? 'text-emerald-600' : 'text-red-600'}`}>${Math.abs(Math.round(results.difference)).toLocaleString()}</p>
                  <p className={`text-xl font-bold uppercase ${results.isJointBetter ? 'text-emerald-500' : 'text-red-500'}`}>{results.isJointBetter ? 'Saved by Filing Jointly' : 'Extra Cost of Filing Jointly'}</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="card-calculator">
                    <h3 className="font-bold flex items-center gap-2 mb-6">
                      <Calculator className="h-4 w-4 text-primary" /> Filing Jointly
                    </h3>
                    <div className="space-y-4">
                       <div className="flex justify-between items-center text-sm font-medium">
                          <span className="text-muted-foreground">Total Joint Tax</span>
                          <span className="text-lg font-black text-emerald-600">${Math.round(results.jointTax).toLocaleString()}</span>
                       </div>
                       <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${(results.jointTax / (results.totalSeparateTax || 1)) * 100}%` }}></div>
                       </div>
                    </div>
                  </div>

                  <div className="card-calculator">
                    <h3 className="font-bold flex items-center gap-2 mb-6">
                      <Calculator className="h-4 w-4 text-primary" /> Filing Separately
                    </h3>
                    <div className="space-y-3 text-sm">
                       <div className="flex justify-between">
                          <span className="text-muted-foreground">Spouse 1 Tax</span>
                          <span className="font-bold">${Math.round(results.p1Tax).toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between">
                          <span className="text-muted-foreground">Spouse 2 Tax</span>
                          <span className="font-bold">${Math.round(results.p2Tax).toLocaleString()}</span>
                       </div>
                       <div className="pt-2 border-t border-border flex justify-between font-black text-foreground">
                          <span>Total Separate Tax</span>
                          <span>${Math.round(results.totalSeparateTax).toLocaleString()}</span>
                       </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>Marriage and the IRS: How Your Filing Status Affects Your Taxes</h2>
              <p>For most couples, getting married is a significant financial event. The "marriage bonus" or "marriage penalty" is the difference between what a couple pays in taxes as a married unit versus what they would have paid as two single individuals. Understanding how these calculations work can help you choose the best filing status every year.</p>

              <h3>What is a Marriage Bonus?</h3>
              <p>A marriage bonus occurs when a couple's total tax bill is lower after they marry. This is most common when one spouse earns much more than the other. When they file jointly, the higher earner's income is spread across the lower brackets of both spouses, effectively pulling some of the income out of higher tax brackets. This can save couples thousands of dollars annually.</p>

              <h3>What is a Marriage Penalty?</h3>
              <p>A marriage penalty happens when a couple pays more in taxes together than they would have separately. This typically occurs when both spouses are high earners with similar incomes. Because the income thresholds for the highest tax brackets (32%, 35%, and 37%) for married couples are not always exactly double the single thresholds, combining two large incomes can push more of their money into a higher bracket.</p>

              <h3>Married Filing Jointly (MFJ) vs. Married Filing Separately (MFS)</h3>
              <p>Almost all married couples file jointly because it offers the most tax advantages. However, there are specific scenarios where filing separately might be beneficial:</p>
              <ul>
                <li><strong>Income-Driven Repayment (IDR) Plans:</strong> If one spouse has significant student loans, filing separately may keep their monthly payments lower by excluding the other spouse's income from the calculation.</li>
                <li><strong>Itemized Deductions:</strong> If one spouse has very high medical expenses (which must exceed 7.5% of AGI to be deductible), filing separately might allow them to meet that threshold more easily.</li>
                <li><strong>Legal/Financial Separation:</strong> If you are in the process of a divorce or have concerns about your spouse's tax compliance, filing separately protects you from "joint and several liability" for any errors on the return.</li>
              </ul>

              <h3>Loss of Credits when Filing Separately</h3>
              <p>It is important to note that filing separately (MFS) makes you ineligible for several valuable tax breaks, including:</p>
              <ol>
                <li>Student loan interest deduction.</li>
                <li>Earned Income Tax Credit (EITC).</li>
                <li>Education credits (AOTC and Lifetime Learning Credit).</li>
                <li>The Credit for the Elderly or the Disabled.</li>
              </ol>

              <h2>Planning Your Strategy</h2>
              <p>For the vast majority of taxpayers, the "Married Filing Jointly" status is the clear winner. This calculator provides a high-level estimate of the federal tax impact, but we recommend running your actual numbers through professional tax software before making a final decision, especially if you have significant deductions, credits, or state tax considerations.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/marriage-tax-calculator" />
          <PopularCalculators exclude="/calculator/marriage-tax-calculator" />
        </div>
      </div>
    </>
  );
};

export default MarriageTaxCalculator;

