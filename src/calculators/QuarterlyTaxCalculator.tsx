"use client";
import { RotateCcw, Calculator, Calendar, ShieldCheck } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import InputField from "@/components/calculator/InputField";
const QuarterlyTaxCalculator = () => {
  const [expectedIncome, setExpectedIncome] = useState("100000");
  const [estimatedExpenses, setEstimatedExpenses] = useState("20000");
  const [lastYearTax, setLastYearTax] = useState("12000");
  const [filingStatus, setFilingStatus] = useState("single");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const income = parseFloat(expectedIncome) || 0;
    const expenses = parseFloat(estimatedExpenses) || 0;
    const prevTax = parseFloat(lastYearTax) || 0;
    const netProfit = Math.max(0, income - expenses);

    // 1. Calculate Self-Employment Tax
    const taxableSeEarnings = netProfit * 0.9235;
    const ssTax = Math.min(taxableSeEarnings, 168600) * 0.124;
    const medicareTax = taxableSeEarnings * 0.029;
    const totalSeTax = ssTax + medicareTax;

    // 2. Calculate Estimated Income Tax (Simplified)
    const standardDeduction = filingStatus === "single" ? 14600 : 29200;
    const taxableIncome = Math.max(0, netProfit - (totalSeTax / 2) - standardDeduction);
    
    // Simplified 20% average income tax rate for estimation
    const estimatedIncomeTax = taxableIncome * 0.18; 
    const totalCurrentLiability = totalSeTax + estimatedIncomeTax;

    // 3. Safe Harbor Rules
    // Rule 1: 90% of current year
    const rule90 = totalCurrentLiability * 0.9;
    // Rule 2: 100% of last year (110% if income > $150k)
    const rule100 = prevTax * (prevTax > 150000 ? 1.1 : 1.0);

    const requiredAnnualPayment = Math.min(rule90, rule100);
    const quarterlyPayment = requiredAnnualPayment / 4;

    setResults({
      netProfit,
      totalSeTax,
      estimatedIncomeTax,
      totalCurrentLiability,
      requiredAnnualPayment,
      quarterlyPayment
    });
  };

  const reset = () => {
    setExpectedIncome("100000");
    setEstimatedExpenses("20000");
    setLastYearTax("12000");
    setFilingStatus("single");
  };

  const faqs = [
    {
      question: "Who needs to pay quarterly estimated taxes?",
      answer: "Generally, you must pay estimated taxes if you expect to owe at least $1,000 in tax for the current year after subtracting your withholding and credits, and your withholding and credits will be less than the smaller of 90% of your current year's tax or 100% of your previous year's tax."
    },
    {
      question: "When are quarterly taxes due?",
      answer: "Estimated tax payments are typically due on April 15, June 15, September 15, and January 15 of the following year. If these dates fall on a weekend or holiday, the deadline is moved to the next business day."
    },
    {
      question: "What is the 'Safe Harbor' rule?",
      answer: "Safe harbor rules protect you from underpayment penalties. You generally won't owe a penalty if you pay at least 90% of the tax you owe for the current year, or 100% of the tax shown on your return for the prior year (110% if your adjusted gross income was more than $150,000)."
    },
    {
      question: "What happens if I don't pay quarterly taxes?",
      answer: "If you don't pay enough tax through withholding and estimated tax payments, you may be charged an underpayment penalty by the IRS when you file your annual return. The penalty is calculated based on how much you underpaid and for how long."
    }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Quarterly Estimated Tax Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Quarterly Estimated Tax Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-8">
                <section className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <Calendar className="h-5 w-5 text-primary" /> Current Year Projection
                  </h2>
                  <InputField id="income" label="Expected Annual Revenue" value={expectedIncome} onChange={setExpectedIncome} prefix="$" tooltip="Your total projected gross income for the year." />
                  <InputField id="expenses" label="Estimated Business Expenses" value={estimatedExpenses} onChange={setEstimatedExpenses} prefix="$" tooltip="Deductible expenses like supplies, software, and home office." />
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Filing Status</label>
                    <select value={filingStatus} onChange={(e) => setFilingStatus(e.target.value)} className="w-full bg-secondary/50 border border-border p-3 rounded-xl outline-none focus:border-primary transition-all font-medium">
                      <option value="single">Single</option>
                      <option value="married">Married Filing Jointly</option>
                    </select>
                  </div>
                </section>

                <section className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <ShieldCheck className="h-5 w-5 text-primary" /> Safe Harbor Data
                  </h2>
                  <InputField id="last-tax" label="Total Tax Paid Last Year" value={lastYearTax} onChange={setLastYearTax} prefix="$" tooltip="Found on your previous year's Form 1040 (Line 24)." />
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 mt-4">
                    <p className="text-[10px] font-bold text-primary uppercase mb-1">Projected Net Profit</p>
                    <p className="text-3xl font-black text-foreground">${results ? results.netProfit.toLocaleString() : '0'}</p>
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
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="card-calculator bg-primary/5 border-solid border-primary/20 text-center flex flex-col justify-center py-8">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Recommended Quarterly Payment</p>
                    <p className="text-5xl font-black text-foreground">${Math.round(results.quarterlyPayment).toLocaleString()}</p>
                    <p className="text-[10px] text-primary mt-2 font-bold uppercase tracking-widest">Next Due: June 15, 2024</p>
                  </div>
                  <div className="card-calculator bg-emerald-500/5 border-emerald-500/20 text-center flex flex-col justify-center py-8">
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Total Annual Liability</p>
                    <p className="text-5xl font-black text-foreground">${Math.round(results.totalCurrentLiability).toLocaleString()}</p>
                    <p className="text-xs text-emerald-500 mt-2 font-bold uppercase tracking-widest">SE Tax + Income Tax</p>
                  </div>
                </div>

                <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                    <Calculator className="h-5 w-5 text-primary" /> Payment Breakdown
                  </h2>
                  <ResultDisplay items={[
                    { label: "Estimated Self-Employment Tax", value: results.totalSeTax },
                    { label: "Estimated Federal Income Tax", value: results.estimatedIncomeTax },
                    { label: "Required Annual Payment (90%)", value: results.requiredAnnualPayment },
                    { label: "Remaining Balance at Year-End", value: results.totalCurrentLiability - results.requiredAnnualPayment },
                  ]} />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2>Mastering Your Quarterly Estimated Taxes</h2>
              <p>For freelancers, solopreneurs, and business owners, tax season happens four times a year. Because no employer is withholding taxes from your income, the IRS requires you to calculate and pay your own taxes as you earn them. This is known as "Estimated Tax."</p>

              <h3>Why Quarterly Payments Are Required</h3>
              <p>The U.S. has a "pay-as-you-go" tax system. This means the government wants its share of your income in real-time, not just once a year in April. If you wait until the end of the year to pay everything, the IRS will likely hit you with underpayment penalties, even if you pay your full balance on time.</p>

              <h3>Understanding the 'Safe Harbor' Rules</h3>
              <p>The IRS provides two 'safe harbors' that protect you from penalties. You won't be penalized if you pay at least:</p>
              <ul>
                <li><strong>90% of Your Current Year's Tax:</strong> This is a good option if your income is lower than last year.</li>
                <li><strong>100% of Your Prior Year's Tax:</strong> Known as the 'Prior Year Safe Harbor,' this is the safest and easiest method if your income has increased. If your adjusted gross income (AGI) last year was over $150,000, you must pay 110% of last year's tax instead.</li>
              </ul>

              <h3>How to Pay Your Estimated Taxes</h3>
              <p>You can pay your quarterly taxes in several ways:</p>
              <ol>
                <li><strong>IRS Direct Pay:</strong> The easiest way, allowing you to pay directly from your bank account for free on the IRS website.</li>
                <li><strong>EFTPS:</strong> The Electronic Federal Tax Payment System, usually used by businesses.</li>
                <li><strong>Payment Vouchers:</strong> You can mail a check with Form 1040-ES, though this is slower and less secure than electronic methods.</li>
              </ol>

              <h3>Strategies for Managing Tax Cash Flow</h3>
              <p>The biggest challenge for the self-employed is having the cash ready when the quarterly deadline hits. Here are three tips for managing your tax funds:</p>
              <ul>
                <li><strong>The 'Percentage' Method:</strong> Set aside 25-30% of every client payment into a dedicated savings account.</li>
                <li><strong>Pay Monthly:</strong> You don't have to wait for the quarterly deadline. You can make payments every month through IRS Direct Pay to smooth out your cash flow.</li>
                <li><strong>Track Your Expenses:</strong> The more business expenses you track, the lower your net profit and the less tax you will owe. Ensure you are capturing every deductible dollar.</li>
              </ul>

              <h2>Common Deadlines</h2>
              <p>Mark these dates on your calendar. If the 15th falls on a weekend or holiday, the payment is due the next business day:</p>
              <ul>
                <li><strong>Q1 (Jan 1 - Mar 31):</strong> Due April 15</li>
                <li><strong>Q2 (Apr 1 - May 31):</strong> Due June 15</li>
                <li><strong>Q3 (Jun 1 - Aug 31):</strong> Due September 15</li>
                <li><strong>Q4 (Sep 1 - Dec 31):</strong> Due January 15 (following year)</li>
              </ul>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/quarterly-tax-calculator" />
          <PopularCalculators exclude="/calculator/quarterly-tax-calculator" />
        </div>
      </div>
    </>
  );
};

export default QuarterlyTaxCalculator;

