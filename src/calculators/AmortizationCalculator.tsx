"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, CalendarDays } from "lucide-react";

const AmortizationCalculator = () => {
  const [loanAmount, setLoanAmount] = useState("300000");
  const [interestRate, setInterestRate] = useState("6.5");
  const [loanTerm, setLoanTerm] = useState("30"); // years

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const P = parseFloat(loanAmount);
    const r = parseFloat(interestRate) / 100 / 12;
    const n = parseFloat(loanTerm) * 12;

    if (P <= 0 || n <= 0) return;

    let M = 0;
    if (r > 0) {
      M = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    } else {
      M = P / n;
    }

    const totalPaid = M * n;
    const totalInterest = totalPaid - P;

    // We can generate just the first year, last year, or a summary, but a full schedule is too long to display cleanly without pagination. We will provide a summary of the first 5 years and the final payoff.
    const scheduleSummary = [];
    let balance = P;
    let cumInterest = 0;

    for (let year = 1; year <= parseFloat(loanTerm); year++) {
      let principalThisYear = 0;
      let interestThisYear = 0;

      for (let month = 1; month <= 12; month++) {
        const interest = balance * r;
        const principal = M - interest;
        balance -= principal;
        interestThisYear += interest;
        principalThisYear += principal;
        cumInterest += interest;
      }

      if (year <= 5 || year === parseFloat(loanTerm)) {
        scheduleSummary.push({
          year,
          principalPaid: principalThisYear,
          interestPaid: interestThisYear,
          remainingBalance: Math.max(0, balance)
        });
      }
    }

    setResults({
      monthlyPayment: M,
      totalInterest,
      totalPaid,
      scheduleSummary
    });
  };

  const reset = () => {
    setShowResults(false); setLoanAmount("300000"); setInterestRate("6.5"); setLoanTerm("30"); setResults(null); };

  const faqs = [
    { question: "What is an amortization schedule?", answer: "An amortization schedule is a complete table of periodic loan payments, showing the amount of principal and the amount of interest that comprise each payment until the loan is paid off at the end of its term." },
    { question: "Why is most of my payment going to interest early on?", answer: "Because interest is calculated on the remaining balance. Early in the loan, the balance is at its highest, so the interest portion is at its highest. As you slowly pay down the principal, the interest portion decreases, and the principal portion accelerates." },
    { question: "How can I reduce total interest paid?", answer: "You can reduce interest by making extra payments toward the principal, making bi-weekly payments instead of monthly, or refinancing to a shorter term or lower interest rate." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Amortization Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Amortization Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Calculate your monthly loan payment and view a summary of your principal and interest over the life of the loan.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-3 gap-6 mb-6">
                <InputField id="amount" label="Loan Amount ($)" value={loanAmount} onChange={setLoanAmount} />
                <InputField id="rate" label="Interest Rate (%)" value={interestRate} onChange={setInterestRate} />
                <InputField id="term" label="Loan Term (Years)" value={loanTerm} onChange={setLoanTerm} />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2"><CalendarDays className="h-5 w-5" /> Calculate Schedule</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-xl font-bold mb-6">Loan Summary</h2>
                <div className="grid sm:grid-cols-3 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Monthly Payment</p>
                    <p className="text-3xl font-black text-foreground">${results.monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Interest</p>
                    <p className="text-3xl font-black text-foreground">${results.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Paid</p>
                    <p className="text-3xl font-black text-foreground">${results.totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                </div>

                <h3 className="text-lg font-bold mb-4">Amortization Schedule (Summary)</h3>
                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-secondary/20">
                      <tr>
                        <th className="px-4 py-3 rounded-tl-lg">Year</th>
                        <th className="px-4 py-3">Principal Paid</th>
                        <th className="px-4 py-3">Interest Paid</th>
                        <th className="px-4 py-3 rounded-tr-lg">Remaining Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.scheduleSummary.map((row: any, i: number) => (
                        <tr key={i} className="border-b border-border/50">
                          <td className="px-4 py-3 font-semibold">{row.year}</td>
                          <td className="px-4 py-3">${row.principalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="px-4 py-3">${row.interestPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="px-4 py-3 font-medium text-primary">${row.remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parseFloat(loanTerm) > 6 && (
                    <p className="text-xs text-center text-muted-foreground mt-2">Showing Years 1-5 and Final Year</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>How Amortization Works</h2>
              <p>Amortization is the process of spreading out a loan into a series of fixed payments. While the payment amount remains identical every month, the mathematical breakdown of that payment changes drastically over time.</p>
              <h3>The Principal-Interest Shift</h3>
              <p>Because interest is calculated against the remaining balance of the loan, your first payment consists mostly of interest. For example, on a 30-year mortgage at 6.5%, over 80% of your first year's payments go directly to the bank as interest. As the balance slowly drops, the interest charge drops, and more of your payment is applied to the principal.</p>
              <h3>Why Extra Payments Are Powerful</h3>
              <p>Because early payments are heavily weighted toward interest, making a single extra principal payment in Year 1 can save you exponentially more money than making an extra payment in Year 25. Extra principal payments skip the interest queue entirely.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/amortization" />
          <PopularCalculators exclude="/calculator/amortization-calculator" />
        </div>
      </div>
    </>
  );
};
export default AmortizationCalculator;

