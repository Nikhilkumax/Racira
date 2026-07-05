"use client";
import { RotateCcw, Calendar, Info, Home } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import InputField from "@/components/calculator/InputField";
import AmortizationTable, { type AmortRow } from "@/components/calculator/AmortizationTable";
const InterestOnlyMortgageCalculator = () => {
  const [loanAmount, setLoanAmount] = useState("350000");
  const [interestRate, setInterestRate] = useState("6.8");
  const [ioPeriod, setIoPeriod] = useState("10");
  const [totalTerm, setTotalTerm] = useState("30");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const principal = parseFloat(loanAmount) || 0;
    const rate = (parseFloat(interestRate) || 0) / 100 / 12;
    const ioMonths = (parseFloat(ioPeriod) || 0) * 12;
    const totalMonths = (parseFloat(totalTerm) || 0) * 12;
    const amortMonths = totalMonths - ioMonths;

    if (principal <= 0 || rate <= 0 || totalMonths <= 0 || ioMonths >= totalMonths) return;

    // Payment during IO period
    const ioPayment = principal * rate;

    // Payment after IO period (amortizing)
    const amortPayment = (principal * rate * Math.pow(1 + rate, amortMonths)) / (Math.pow(1 + rate, amortMonths) - 1);

    const monthlyRows: AmortRow[] = [];
    const yearlyRows: AmortRow[] = [];

    let currentBalance = principal;
    let totalInterest = 0;
    let yearInterest = 0;
    let yearPrincipal = 0;

    for (let m = 1; m <= totalMonths; m++) {
      const isIO = m <= ioMonths;
      const payment = isIO ? ioPayment : amortPayment;
      const interestPayment = currentBalance * rate;
      const principalPayment = payment - interestPayment;
      
      currentBalance -= principalPayment;
      totalInterest += interestPayment;
      yearInterest += interestPayment;
      yearPrincipal += principalPayment;

      monthlyRows.push({
        period: m,
        payment,
        interest: interestPayment,
        principal: principalPayment,
        balance: Math.max(0, currentBalance),
      });

      if (m % 12 === 0) {
        yearlyRows.push({
          period: m / 12,
          payment: (m <= ioMonths ? ioPayment : amortPayment) * 12,
          interest: yearInterest,
          principal: yearPrincipal,
          balance: Math.max(0, currentBalance),
        });
        yearInterest = 0;
        yearPrincipal = 0;
      }
    }

    setResults({
      ioPayment,
      amortPayment,
      totalInterest,
      totalPaid: totalInterest + principal,
      monthlyRows,
      yearlyRows,
    });
  };

  const reset = () => {
    setLoanAmount("350000");
    setInterestRate("6.8");
    setIoPeriod("10");
    setTotalTerm("30");
  };

  const faqs = [
    {
      question: "What is an interest-only mortgage?",
      answer: "An interest-only mortgage is a loan where the borrower is only required to pay the interest on the principal for a set period (the interest-only period). After this period ends, the loan converts to a standard amortizing loan, and the monthly payments increase significantly to pay off the principal."
    },
    {
      question: "How much will my payment increase after the interest-only period?",
      answer: "The increase can be substantial. For example, on a $350,000 loan at 6.8% interest, a 10-year interest-only payment might be around $1,983. When the 20-year amortization period begins, the payment would jump to approximately $2,672 — a 35% increase."
    },
    {
      question: "Can I pay principal during the interest-only period?",
      answer: "Yes, most interest-only mortgages allow you to make extra payments toward the principal at any time. This will reduce your future amortizing payments and the total interest you pay over the life of the loan."
    },
    {
      question: "What are the risks of an interest-only mortgage?",
      answer: "The main risks are payment shock when the amortizing period begins and the lack of equity growth in the early years. If home values drop, you could end up owing more than the home is worth since you haven't been paying down the principal."
    }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Interest-Only Mortgage Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Interest-Only Mortgage Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-8">
                <section className="space-y-6">
                  <h2 className="text-2xl font-bold mb-3">
                    <Home className="h-5 w-5 text-primary" /> Loan Details
                  </h2>
                  <InputField id="loan-amount" label="Loan Amount" value={loanAmount} onChange={setLoanAmount} prefix="$" tooltip="Total amount of the mortgage loan." />
                  <InputField id="interest-rate" label="Interest Rate (Annual %)" value={interestRate} onChange={setInterestRate} suffix="%" step="0.1" tooltip="The annual interest rate." />
                </section>

                <section className="space-y-6">
                  <h2 className="text-2xl font-bold mb-3">
                    <Calendar className="h-5 w-5 text-primary" /> Terms
                  </h2>
                  <InputField id="io-period" label="Interest-Only Period" value={ioPeriod} onChange={setIoPeriod} suffix="yrs" tooltip="The number of years you only pay interest." />
                  <InputField id="total-term" label="Total Loan Term" value={totalTerm} onChange={setTotalTerm} suffix="yrs" tooltip="The total length of the mortgage (e.g., 30 years)." />
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
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="card-calculator bg-primary/5 border-solid border-primary/20 text-center flex flex-col justify-center py-8">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Initial IO Payment</p>
                    <p className="text-5xl font-black text-foreground">${Math.round(results.ioPayment).toLocaleString()}</p>
                    <p className="text-[10px] text-primary mt-2 font-bold uppercase underline">Years 1–{ioPeriod}</p>
                  </div>
                  <div className="card-calculator bg-orange-500/5 border-orange-500/20 text-center flex flex-col justify-center py-8">
                    <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-1">Future Amortized Payment</p>
                    <p className="text-5xl font-black text-foreground">${Math.round(results.amortPayment).toLocaleString()}</p>
                    <p className="text-[10px] text-orange-500 mt-2 font-bold uppercase underline tracking-tighter">Years {parseInt(ioPeriod) + 1}–{totalTerm}</p>
                  </div>
                </div>

                <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                  <h2 className="text-2xl font-bold mb-3">
                    <Info className="h-5 w-5 text-primary" /> Payment Shock Analysis
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <div className="text-center">
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Payment Increase</p>
                      <p className="text-2xl font-bold text-red-600">${Math.round(results.amortPayment - results.ioPayment).toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Percentage Jump</p>
                      <p className="text-2xl font-bold text-red-600">{(((results.amortPayment / results.ioPayment) - 1) * 100).toFixed(1)}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Total Interest</p>
                      <p className="text-2xl font-bold text-foreground">${Math.round(results.totalInterest).toLocaleString()}</p>
                    </div>
                  </div>
                  <ResultDisplay items={[
                    { label: "Total Loan Cost", value: results.totalPaid },
                    { label: "Principal Balance After IO", value: parseFloat(loanAmount) },
                    { label: "Monthly Interest (IO)", value: results.ioPayment },
                  ]} />
                </div>

                <AmortizationTable rows={results.yearlyRows} yearly={true} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Understanding Interest-Only Mortgages</h2>
              <p>An interest-only (IO) mortgage is a specialized home loan that provides flexibility in the early years of homeownership. For a predetermined period, usually 5 to 10 years, you are not required to pay down any of the loan's principal. Instead, your monthly payments cover only the interest charges.</p>

              <h3>How the Payment Structure Works</h3>
              <p>The life of an interest-only mortgage is divided into two distinct phases:</p>
              <ol>
                <li><strong>The Interest-Only Phase:</strong> During this time (e.g., the first 10 years of a 30-year loan), your payment is calculated as (Loan Balance × Interest Rate) ÷ 12. Because you aren't paying principal, the balance remains the same every month.</li>
                <li><strong>The Amortization Phase:</strong> Once the IO period ends, the loan must be fully paid off within the remaining time (e.g., the final 20 years). The lender recalculates your payment to include both principal and interest, causing a sharp increase in your monthly obligation.</li>
              </ol>

              <h3>Pros and Cons of Interest-Only Loans</h3>
              <div className="grid sm:grid-cols-2 gap-6 my-6">
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                  <h4 className="text-emerald-700 font-bold mb-2">Advantages</h4>
                  <ul className="text-sm space-y-1">
                    <li>Lower initial monthly payments</li>
                    <li>Increased cash flow for other investments</li>
                    <li>Ability to qualify for a more expensive home</li>
                    <li>Ideal for homeowners who expect income to rise</li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                  <h4 className="text-red-700 font-bold mb-2">Disadvantages</h4>
                  <ul className="text-sm space-y-1">
                    <li>No equity growth from payments</li>
                    <li>Massive 'payment shock' after IO period</li>
                    <li>Total interest paid is much higher</li>
                    <li>Risk of being 'underwater' if home values fall</li>
                  </ul>
                </div>
              </div>

              <h3>Who Should Consider an IO Mortgage?</h3>
              <p>Interest-only loans are generally considered advanced financial products and are best suited for:</p>
              <ul>
                <li><strong>High Net Worth Individuals:</strong> Who want to keep their cash liquid for high-yield investments.</li>
                <li><strong>Commission-Based Earners:</strong> Who have fluctuating monthly income but receive large annual bonuses.</li>
                <li><strong>Short-Term Owners:</strong> Who plan to sell the home before the amortizing phase begins.</li>
              </ul>

              <h3>Important Considerations</h3>
              <p>Before choosing an interest-only mortgage, it is vital to have a clear "exit strategy." This might include plans to sell the property, refinance into a traditional mortgage, or a guaranteed increase in household income to handle the future payment jump. Without a plan, the transition to the amortization phase can cause significant financial distress.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/interest-only-mortgage-calculator" />
          <PopularCalculators exclude="/calculator/interest-only-mortgage-calculator" />
        </div>
      </div>
    </>
  );
};

export default InterestOnlyMortgageCalculator;

