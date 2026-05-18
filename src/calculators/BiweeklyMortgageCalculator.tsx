"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, CalendarSync } from "lucide-react";

const BiWeeklyMortgageCalculator = () => {
  const [loanAmount, setLoanAmount] = useState("300000");
  const [interestRate, setInterestRate] = useState("6.5");
  const [loanTerm, setLoanTerm] = useState("30"); // years

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const P = parseFloat(loanAmount);
    const r = parseFloat(interestRate) / 100 / 12; // monthly rate
    const totalMonths = parseFloat(loanTerm) * 12;

    if (P <= 0 || totalMonths <= 0) return;

    // Standard Monthly Payment
    const M = P * (r * Math.pow(1 + r, totalMonths)) / (Math.pow(1 + r, totalMonths) - 1);
    
    const standardTotalInterest = (M * totalMonths) - P;

    // Bi-Weekly Payment
    const biWeeklyPayment = M / 2;

    // Calculate payoff for bi-weekly
    // Bi-weekly means 26 payments a year = 13 full monthly payments a year.
    // So annual payment is M * 13 instead of M * 12
    // We simulate this by applying the bi-weekly payments exactly as they would fall, 
    // but a common approximation that banks use is applying the extra full payment once a year.
    // For precision, we will do a loop: every 2 weeks, charge interest on the period and apply payment.
    
    // Exact bi-weekly simulation:
    const dailyRate = (parseFloat(interestRate) / 100) / 365;
    let balance = P;
    let daysPassed = 0;
    let totalInterestBiWeekly = 0;
    let biWeeklyPaymentsCount = 0;

    while (balance > 0 && biWeeklyPaymentsCount < 10000) { // safety limit
      biWeeklyPaymentsCount++;
      // Interest accrues over 14 days
      const interestForPeriod = balance * dailyRate * 14;
      totalInterestBiWeekly += interestForPeriod;
      
      const principalPaid = biWeeklyPayment - interestForPeriod;
      balance -= principalPaid;

      if (balance < 0) {
        totalInterestBiWeekly += (balance * dailyRate * 14); // adjust overpayment
      }
    }

    const biWeeklyYearsToPayoff = (biWeeklyPaymentsCount * 14) / 365;

    const timeSaved = parseFloat(loanTerm) - biWeeklyYearsToPayoff;
    const interestSaved = standardTotalInterest - totalInterestBiWeekly;

    setResults({
      monthlyPayment: M,
      biWeeklyPayment,
      standardTotalInterest,
      biWeeklyTotalInterest: totalInterestBiWeekly,
      interestSaved,
      biWeeklyYearsToPayoff: biWeeklyYearsToPayoff.toFixed(1),
      timeSaved: timeSaved.toFixed(1)
    });
  };

  const reset = () => {
    setShowResults(false); setLoanAmount("300000"); setInterestRate("6.5"); setLoanTerm("30"); setResults(null); };

  const faqs = [
    { question: "How does a bi-weekly mortgage save money?", answer: "There are 52 weeks in a year, which equals 26 bi-weekly periods. If you pay half your monthly mortgage payment every two weeks, you make 26 half-payments. This equals 13 full payments in a year, instead of the standard 12. That one extra payment goes entirely toward the principal, dramatically accelerating payoff." },
    { question: "Do I need a special bi-weekly loan?", answer: "No. You can manually achieve the exact same mathematical result by taking your normal monthly payment, dividing it by 12, and adding that amount as 'extra principal' to your regular monthly payment." },
    { question: "Should I sign up for my bank's bi-weekly program?", answer: "Be careful. Many banks charge setup fees ($200-$400) or monthly transaction fees for their official bi-weekly programs. It is almost always better to just manually send one extra payment per year, or add 1/12th extra to each monthly check, for free." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Bi-Weekly Mortgage Calculator" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">Bi-Weekly Mortgage Calculator</h1>
            <p className="text-muted-foreground mb-8 text-lg">See how much time and interest you can save by splitting your monthly payment into bi-weekly half-payments.</p>
            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-3 gap-6 mb-6">
                <InputField id="amount" label="Loan Amount ($)" value={loanAmount} onChange={setLoanAmount} />
                <InputField id="rate" label="Interest Rate (%)" value={interestRate} onChange={setInterestRate} />
                <InputField id="term" label="Loan Term (Years)" value={loanTerm} onChange={setLoanTerm} />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2"><CalendarSync className="h-5 w-5" /> Calculate Savings</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"><RotateCcw className="h-5 w-5" /></button>
              </div>
            </div>
            {showResults && results && (
              <div className="card-calculator mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold mb-6">Your Savings Breakdown</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/20 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-green-600 uppercase tracking-widest mb-1">Interest Saved</p>
                    <p className="text-4xl font-black text-foreground">${results.interestSaved.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-1">Time Saved</p>
                    <p className="text-3xl font-black text-foreground">{results.timeSaved} Years</p>
                    <p className="text-sm font-medium mt-1">Paid off in {results.biWeeklyYearsToPayoff} years</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center p-4 rounded-xl border border-border bg-card">
                    <div>
                      <p className="font-bold">Standard Monthly Payment</p>
                      <p className="text-sm text-muted-foreground">12 payments a year</p>
                    </div>
                    <div className="font-bold text-lg">${results.monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo</div>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl border border-border bg-card">
                    <div>
                      <p className="font-bold">Bi-Weekly Payment</p>
                      <p className="text-sm text-muted-foreground">26 payments a year</p>
                    </div>
                    <div className="font-bold text-lg text-primary">${results.biWeeklyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/2wks</div>
                  </div>
                </div>

                <ResultDisplay items={[
                  { label: "Total Interest (Standard)", value: 0, textValue: `$${results.standardTotalInterest.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` },
                  { label: "Total Interest (Bi-Weekly)", value: 0, textValue: `$${results.biWeeklyTotalInterest.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` },
                ]} />
              </div>
            )}
            <AdPlaceholder className="mb-8" />
            <article className="prose-finance">
              <h2>The Math Behind Bi-Weekly Payments</h2>
              <p>When you switch to a bi-weekly payment schedule, you aren't just paying earlier in the month—you are actually making one extra full monthly payment per year without feeling the pinch.</p>
              <h3>Why It Works</h3>
              <p>Since there are 52 weeks in a year, paying every two weeks results in 26 half-payments (which is equal to 13 full payments). Because this 13th payment is an "overpayment," 100% of it is applied directly to the principal balance.</p>
              <h3>The Compounding Effect</h3>
              <p>Because mortgage interest is calculated on the remaining balance, violently reducing the principal balance early in the loan's life causes a cascading effect. You owe less principal, so next month's interest charge is smaller, which means more of next month's standard payment goes to principal, reducing the balance even faster.</p>
            </article>
            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/bi-weekly-mortgage" />
            <PopularCalculators exclude="/calculator/bi-weekly-mortgage-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6"><AdPlaceholder className="min-h-[600px]" label="Sticky Sidebar" /></aside>
        </div>
      </div>
    </>
  );
};
export default BiWeeklyMortgageCalculator;

