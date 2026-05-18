"use client";
import { RotateCcw, Briefcase, Info, Calculator } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import InputField from "@/components/calculator/InputField";
const SelfEmploymentTaxCalculator = () => {
  const [netIncome, setNetIncome] = useState("75000");
  const [taxYear, setTaxYear] = useState("2024");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const income = parseFloat(netIncome) || 0;
    
    // Self-employment tax is calculated on 92.35% of net earnings
    const taxableEarnings = income * 0.9235;

    // 2024 Social Security Wage Base: $168,600
    const ssWageBase = 168600;
    const ssRate = 0.124;
    const medicareRate = 0.029;

    const ssTax = Math.min(taxableEarnings, ssWageBase) * ssRate;
    const medicareTax = taxableEarnings * medicareRate;
    const totalSeTax = ssTax + medicareTax;

    setResults({
      taxableEarnings,
      ssTax,
      medicareTax,
      totalSeTax,
      halfSeTax: totalSeTax / 2, // Tax deduction
      effectiveRate: (totalSeTax / income) * 100
    });
  };

  const reset = () => {
    setNetIncome("75000");
    setTaxYear("2024");
  };

  const faqs = [
    {
      question: "What is self-employment tax?",
      answer: "Self-employment tax is a tax consisting of Social Security and Medicare taxes primarily for individuals who work for themselves. It is similar to the FICA taxes withheld from the pay of most wage earners."
    },
    {
      question: "Why is the tax calculated on only 92.35% of my net income?",
      answer: "The IRS allows you to subtract the 'employer' portion of the self-employment tax from your net earnings before calculating the tax. This is mathematically equivalent to multiplying your net profit by 0.9235."
    },
    {
      question: "Can I deduct self-employment tax?",
      answer: "Yes. You can deduct 50% of your self-employment tax when calculating your adjusted gross income (AGI). This deduction only affects your income tax, not the self-employment tax itself."
    },
    {
      question: "What is the Social Security wage base?",
      answer: "The wage base is the maximum amount of earnings subject to the Social Security tax each year. For 2024, the wage base is $168,600. Any earnings above this amount are only subject to the 2.9% Medicare tax."
    }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Self-Employment Tax Calculator" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">Self-Employment Tax Calculator</h1>
            <p className="text-muted-foreground mb-8 text-lg">Calculate your estimated Social Security and Medicare tax obligations as a freelancer or small business owner.</p>

            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-2 gap-8">
                <section className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <Briefcase className="h-5 w-5 text-primary" /> Earnings
                  </h2>
                  <InputField id="net-income" label="Net Self-Employment Income" value={netIncome} onChange={setNetIncome} prefix="$" tooltip="Your total revenue minus business expenses." />
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Tax Year</label>
                    <select value={taxYear} onChange={(e) => setTaxYear(e.target.value)} className="w-full bg-secondary/50 border border-border p-3 rounded-xl outline-none focus:border-primary transition-all font-medium">
                      <option value="2024">2024 (Wage Base $168,600)</option>
                      <option value="2023">2023 (Wage Base $160,200)</option>
                    </select>
                  </div>
                </section>

                <section className="space-y-6 bg-primary/5 p-6 rounded-2xl border border-primary/10">
                   <h3 className="font-bold text-primary flex items-center gap-2"><Info className="h-4 w-4" /> Quick Summary</h3>
                   <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Estimated Total SE Tax</p>
                        <p className="text-3xl font-black text-foreground">${results ? Math.round(results.totalSeTax).toLocaleString() : '0'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Effective Tax Rate</p>
                        <p className="text-xl font-bold text-primary">{results ? results.effectiveRate.toFixed(1) : '0'}%</p>
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
                  <div className="card-calculator bg-indigo-500/5 border-indigo-500/20 text-center flex flex-col justify-center py-8">
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">Social Security Tax</p>
                    <p className="text-5xl font-black text-foreground">${Math.round(results.ssTax).toLocaleString()}</p>
                    <p className="text-[10px] text-indigo-500 mt-2 font-bold uppercase tracking-widest">12.4% rate</p>
                  </div>
                  <div className="card-calculator bg-emerald-500/5 border-emerald-500/20 text-center flex flex-col justify-center py-8">
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Medicare Tax</p>
                    <p className="text-5xl font-black text-foreground">${Math.round(results.medicareTax).toLocaleString()}</p>
                    <p className="text-[10px] text-emerald-500 mt-2 font-bold uppercase tracking-widest">2.9% rate</p>
                  </div>
                </div>

                <div className="card-calculator mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                    <Calculator className="h-5 w-5 text-primary" /> Detailed Calculation
                  </h2>
                  <ResultDisplay items={[
                    { label: "Taxable Net Earnings (92.35%)", value: results.taxableEarnings },
                    { label: "Adjusted Gross Income Deduction", value: results.halfSeTax },
                    { label: "Annual Total Tax Liability", value: results.totalSeTax },
                    { label: "Estimated Quarterly Payment", value: results.totalSeTax / 4 },
                  ]} />
                </div>
              </div>
            )}

            <AdPlaceholder className="my-8" />

            <article className="prose-finance">
              <h2>The Freelancer's Guide to Self-Employment Tax</h2>
              <p>When you work as an employee, your employer pays half of your Social Security and Medicare taxes (FICA), and you pay the other half. When you are self-employed, you are both the employer and the employee, meaning you are responsible for the full 15.3% tax rate. This is known as the self-employment (SE) tax.</p>

              <h3>Breaking Down the 15.3% Rate</h3>
              <p>The self-employment tax is composed of two distinct parts:</p>
              <ul>
                <li><strong>Social Security (12.4%):</strong> This funds the Social Security system. It only applies to your earnings up to a certain limit ($168,600 in 2024).</li>
                <li><strong>Medicare (2.9%):</strong> This funds the Medicare system. Unlike Social Security, there is no income cap for Medicare tax; you pay 2.9% on every dollar you earn.</li>
              </ul>

              <h3>The 0.9235 Multiplier Explained</h3>
              <p>If you were an employee, your employer's half of the tax wouldn't be included in your gross income. To mimic this benefit for the self-employed, the IRS only taxes 92.35% of your net business profit. This adjustment prevents you from paying self-employment tax on the tax itself.</p>

              <h3>Quarterly Estimated Payments</h3>
              <p>The U.S. tax system is "pay-as-you-go." Since freelancers don't have taxes withheld from their paychecks, they are usually required to make <strong>Estimated Tax Payments</strong> four times a year. Failure to pay at least 90% of your total tax liability throughout the year can result in underpayment penalties from the IRS.</p>

              <h3>Maximizing Your Deductions</h3>
              <p>The best way to lower your self-employment tax is to accurately track and deduct all legitimate business expenses. Common deductions include:</p>
              <ul>
                <li><strong>Home Office:</strong> A portion of your rent/mortgage and utilities if you have a dedicated workspace.</li>
                <li><strong>Equipment:</strong> Computers, software, and furniture used for work.</li>
                <li><strong>Marketing:</strong> Website hosting, advertising, and business cards.</li>
                <li><strong>Health Insurance:</strong> Premiums paid for yourself and your family are often 100% deductible.</li>
              </ul>

              <h2>Next Steps After Calculating</h2>
              <p>Once you have your estimated tax amount, we recommend:</p>
              <ol>
                <li><strong>Open a Tax Savings Account:</strong> Transfer 25-30% of every payment you receive into a separate high-yield savings account so you aren't scrambling at tax time.</li>
                <li><strong>Use an Accounting Software:</strong> Tools like QuickBooks or Wave can help you track expenses in real-time.</li>
                <li><strong>Consult a CPA:</strong> If your net income exceeds $50,000, a tax professional may suggest forming an S-Corp to reduce your self-employment tax liability.</li>
              </ol>
            </article>

            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/self-employment-tax-calculator" />
            <PopularCalculators exclude="/calculator/self-employment-tax-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[600px]" label="Sticky Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default SelfEmploymentTaxCalculator;

