"use client";
import { RotateCcw, Calculator, DollarSign, BarChart3 } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import InputField from "@/components/calculator/InputField";
const TaxBracketCalculator = () => {
  const [income, setIncome] = useState("85000");
  const [filingStatus, setFilingStatus] = useState("single");
  const [taxYear, setTaxYear] = useState("2024");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const totalIncome = parseFloat(income) || 0;
    
    // 2024 Standard Deductions
    const standardDeduction = filingStatus === "single" ? 14600 : 29200;
    const taxableIncome = Math.max(0, totalIncome - standardDeduction);

    // 2024 Brackets
    const singleBrackets = [
      { min: 0, max: 11600, rate: 10 },
      { min: 11601, max: 47150, rate: 12 },
      { min: 47151, max: 100525, rate: 22 },
      { min: 100526, max: 191950, rate: 24 },
      { min: 191951, max: 243725, rate: 32 },
      { min: 243726, max: 609350, rate: 35 },
      { min: 609351, max: Infinity, rate: 37 },
    ];

    const marriedBrackets = [
      { min: 0, max: 23200, rate: 10 },
      { min: 23201, max: 94300, rate: 12 },
      { min: 94301, max: 201050, rate: 22 },
      { min: 201051, max: 383900, rate: 24 },
      { min: 383901, max: 487450, rate: 32 },
      { min: 487451, max: 731200, rate: 35 },
      { min: 731201, max: Infinity, rate: 37 },
    ];

    const brackets = filingStatus === "single" ? singleBrackets : marriedBrackets;
    let totalTax = 0;
    let marginalRate = 0;
    const bracketBreakdown: any[] = [];

    for (const bracket of brackets) {
      if (taxableIncome > bracket.min) {
        const taxableInThisBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
        const taxInThisBracket = taxableInThisBracket * (bracket.rate / 100);
        totalTax += taxInThisBracket;
        marginalRate = bracket.rate;
        
        bracketBreakdown.push({
           rate: bracket.rate,
           amount: taxableInThisBracket,
           tax: taxInThisBracket,
           isUserBracket: taxableIncome <= bracket.max
        });
      }
    }

    setResults({
      taxableIncome,
      totalTax,
      marginalRate,
      effectiveRate: totalIncome > 0 ? (totalTax / totalIncome) * 100 : 0,
      standardDeduction,
      bracketBreakdown
    });
  };

  const reset = () => {
    setIncome("85000");
    setFilingStatus("single");
    setTaxYear("2024");
  };

  const faqs = [
    {
      question: "What is a marginal tax rate?",
      answer: "A marginal tax rate is the percentage of tax applied to your last dollar of income. Because the U.S. uses a progressive tax system, you don't pay one single rate on your entire income; instead, different portions of your income are taxed at different rates as you move up the brackets."
    },
    {
      question: "What is an effective tax rate?",
      answer: "Your effective tax rate is the actual percentage of your total income that you pay in taxes. It is calculated by dividing your total tax liability by your total gross income. It is always lower than your marginal tax rate because of deductions and lower tax brackets."
    },
    {
      question: "How do tax brackets work for married couples?",
      answer: "Married couples filing jointly have different income thresholds for each tax bracket compared to single filers. Typically, the income limits for married couples are double those of single filers for the lower brackets, though this 'doubling' effect disappears at the highest income levels."
    },
    {
      question: "Does moving into a higher tax bracket mean I take home less money?",
      answer: "No. This is a common myth. Only the money earned above the threshold for the new bracket is taxed at the higher rate. You will always take home more total money if you earn a higher gross salary, even if you move into a higher tax bracket."
    }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Tax Bracket Calculator" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">Tax Bracket Calculator</h1>
            <p className="text-muted-foreground mb-8 text-lg">Determine your marginal tax bracket and see exactly how your income is distributed across the progressive tax system.</p>

            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-2 gap-8">
                <section className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <DollarSign className="h-5 w-5 text-primary" /> Your Income
                  </h2>
                  <InputField id="income" label="Total Annual Income" value={income} onChange={setIncome} prefix="$" tooltip="Your gross annual salary before any deductions." />
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Tax Year</label>
                    <select value={taxYear} onChange={(e) => setTaxYear(e.target.value)} className="w-full bg-secondary/50 border border-border p-3 rounded-xl outline-none focus:border-primary transition-all font-medium">
                      <option value="2024">2024 Tax Year</option>
                      <option value="2023">2023 Tax Year</option>
                    </select>
                  </div>
                </section>

                <section className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <Calculator className="h-5 w-5 text-primary" /> Filing Details
                  </h2>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Filing Status</label>
                    <div className="grid grid-cols-1 gap-2">
                      <button onClick={() => setFilingStatus("single")} className={`p-3 rounded-xl border font-bold text-sm text-left px-5 transition-all ${filingStatus === 'single' ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary/50 border-border text-muted-foreground hover:bg-secondary'}`}>
                        Single
                        <span className="block text-[10px] font-medium opacity-80">Standard Deduction: $14,600</span>
                      </button>
                      <button onClick={() => setFilingStatus("married")} className={`p-3 rounded-xl border font-bold text-sm text-left px-5 transition-all ${filingStatus === 'married' ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary/50 border-border text-muted-foreground hover:bg-secondary'}`}>
                        Married Filing Jointly
                        <span className="block text-[10px] font-medium opacity-80">Standard Deduction: $29,200</span>
                      </button>
                    </div>
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

            {showResults && results && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-8">
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="card-calculator bg-primary/5 border-solid border-primary/20 text-center flex flex-col justify-center py-8">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Marginal Tax Bracket</p>
                    <p className="text-7xl font-black text-foreground">{results.marginalRate}%</p>
                    <p className="text-xs text-primary mt-2 font-bold uppercase tracking-widest">Highest rate applied</p>
                  </div>
                  <div className="card-calculator bg-emerald-500/5 border-emerald-500/20 text-center flex flex-col justify-center py-8">
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Effective Tax Rate</p>
                    <p className="text-7xl font-black text-foreground">{results.effectiveRate.toFixed(1)}%</p>
                    <p className="text-xs text-emerald-500 mt-2 font-bold uppercase tracking-widest">Your actual average tax</p>
                  </div>
                </div>

                <div className="card-calculator mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                    <BarChart3 className="h-5 w-5 text-primary" /> Progressive Breakdown
                  </h2>
                  <div className="space-y-4 mb-8">
                    {results.bracketBreakdown.map((b: any, i: number) => (
                      <div key={i} className={`p-4 rounded-2xl border transition-all ${b.isUserBracket ? 'bg-primary/5 border-primary/20 ring-1 ring-primary/20 shadow-lg' : 'bg-secondary/30 border-border opacity-60'}`}>
                        <div className="flex justify-between items-center mb-2">
                           <span className="font-black text-lg">{b.rate}% Bracket</span>
                           {b.isUserBracket && <span className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Current Bracket</span>}
                        </div>
                        <div className="flex justify-between text-sm">
                           <span className="text-muted-foreground">Income in this bracket:</span>
                           <span className="font-bold">${Math.round(b.amount).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                           <span className="text-muted-foreground">Tax from this bracket:</span>
                           <span className="font-bold text-primary">${Math.round(b.tax).toLocaleString()}</span>
                        </div>
                        <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
                           <div className="h-full bg-primary" style={{ width: `${(b.amount / (results.taxableIncome || 1)) * 100}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <ResultDisplay items={[
                    { label: "Total Federal Tax", value: results.totalTax },
                    { label: "Taxable Income After Deduction", value: results.taxableIncome },
                    { label: "Standard Deduction Used", value: results.standardDeduction },
                    { label: "Annual Take-Home (Federal Only)", value: parseFloat(income) - results.totalTax },
                  ]} />
                </div>
              </div>
            )}

            <AdPlaceholder className="my-8" />

            <article className="prose-finance">
              <h2>How U.S. Tax Brackets Really Work</h2>
              <p>One of the most common misconceptions about personal finance is how tax brackets work. Many people believe that moving into a higher bracket means their entire income is suddenly taxed at that higher rate. This is false. The United States uses a <strong>progressive tax system</strong>, which means your income is divided into "buckets," and each bucket is taxed at its own specific rate.</p>

              <h3>The Bucket Analogy</h3>
              <p>Imagine you have several buckets. The first bucket holds about $11,000. No matter how much you earn, that first $11,000 is always taxed at 10%. Once that bucket is full, the next dollar you earn goes into the 12% bucket. This continues until you reach the last dollar of your income. Your "tax bracket" is simply the rate of the very last bucket your money reached.</p>

              <h3>Marginal vs. Effective Rate</h3>
              <p>Because you pay 10%, 12%, and 22% on different parts of your income, your overall average tax rate (the effective rate) will always be lower than your highest tax bracket (the marginal rate). For example, if you are in the 24% bracket, your effective rate might only be 16%.</p>

              <h3>The Power of Deductions</h3>
              <p>Ductions like the <strong>Standard Deduction</strong> act like a "shield" for your income. For a single filer earning $85,000, the first $14,600 is completely untaxed. This means you aren't actually taxed on $85,000; you are taxed on $70,400. This is why contributing to a 401(k) or traditional IRA is so effective—it lowers your taxable income and can even push you down into a lower tax bracket.</p>

              <h3>Common Tax Brackets for 2024</h3>
              <p>While brackets are adjusted annually for inflation, the seven rates remain consistent: 10%, 12%, 22%, 24%, 32%, 35%, and 37%. As you earn more, each new dollar is taxed more heavily. This system is designed to place a larger relative tax burden on higher earners while protecting the basic living expenses of lower earners.</p>

              <h2>Strategies for Tax Bracket Management</h2>
              <p>If you find yourself at the very bottom of a higher bracket (e.g., earning $105,000 when the 24% bracket starts at $100,525), you can use tax-deferred investments to drop your taxable income back into the 22% bracket. This is a common strategy for high-earners to maximize their long-term wealth.</p>
            </article>

            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/tax-bracket-calculator" />
            <PopularCalculators exclude="/calculator/tax-bracket-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[600px]" label="Sticky Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default TaxBracketCalculator;

