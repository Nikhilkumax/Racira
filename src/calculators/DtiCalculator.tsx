"use client";
import { RotateCcw, CreditCard, Wallet, PieChart } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import InputField from "@/components/calculator/InputField";
const DtiCalculator = () => {
  const [grossIncome, setGrossIncome] = useState("6000");
  const [mortgage, setMortgage] = useState("1800");
  const [carLoan, setCarLoan] = useState("400");
  const [studentLoan, setStudentLoan] = useState("200");
  const [creditCard, setCreditCard] = useState("150");
  const [otherDebt, setOtherDebt] = useState("0");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const income = parseFloat(grossIncome) || 0;
    const house = parseFloat(mortgage) || 0;
    const car = parseFloat(carLoan) || 0;
    const student = parseFloat(studentLoan) || 0;
    const card = parseFloat(creditCard) || 0;
    const other = parseFloat(otherDebt) || 0;

    const totalMonthlyDebt = house + car + student + card + other;
    const dti = income > 0 ? (totalMonthlyDebt / income) * 100 : 0;
    const frontEndDti = income > 0 ? (house / income) * 100 : 0;

    setResults({
      totalMonthlyDebt,
      dti,
      frontEndDti,
      remainingIncome: income - totalMonthlyDebt
    });
  };

  const reset = () => {
    setGrossIncome("6000");
    setMortgage("1800");
    setCarLoan("400");
    setStudentLoan("200");
    setCreditCard("150");
    setOtherDebt("0");
  };

  const getDtiStatus = (ratio: number) => {
    if (ratio <= 20) return { label: "Excellent", color: "text-emerald-500" };
    if (ratio <= 36) return { label: "Good", color: "text-emerald-400" };
    if (ratio <= 43) return { label: "Acceptable", color: "text-amber-500" };
    return { label: "High", color: "text-red-500" };
  };

  const faqs = [
    {
      question: "What is Debt-to-Income (DTI) ratio?",
      answer: "The DTI ratio is a percentage that shows how much of your gross monthly income goes toward paying your monthly debt obligations. Lenders use this to measure your ability to manage monthly payments and repay the money you plan to borrow."
    },
    {
      question: "What is a good DTI ratio?",
      answer: "Generally, a DTI ratio of 36% or less is considered good. Most mortgage lenders prefer a back-end DTI (all debts included) of 43% or lower to qualify for a qualified mortgage, though some programs allow up to 50%."
    },
    {
      question: "What is the difference between front-end and back-end DTI?",
      answer: "Front-end DTI only includes your housing expenses (mortgage, taxes, insurance). Back-end DTI includes your housing expenses plus all other monthly debt obligations like car loans, credit cards, and student loans."
    },
    {
      question: "How can I lower my DTI ratio?",
      answer: "You can lower your DTI by either increasing your gross monthly income or, more commonly, by paying off existing debts or consolidating them into lower monthly payments."
    }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Debt-to-Income Ratio Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Debt-to-Income (DTI) Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-8">
                <section className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <Wallet className="h-5 w-5 text-primary" /> Monthly Income
                  </h2>
                  <InputField id="income" label="Gross Monthly Income" value={grossIncome} onChange={setGrossIncome} prefix="$" tooltip="Your total pre-tax income per month." />
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 mt-4">
                    <p className="text-xs text-primary font-bold uppercase mb-1">Total Monthly Income</p>
                    <p className="text-3xl font-black">${parseFloat(grossIncome).toLocaleString()}</p>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <CreditCard className="h-5 w-5 text-primary" /> Monthly Debts
                  </h2>
                  <InputField id="mortgage" label="Housing (PITI)" value={mortgage} onChange={setMortgage} prefix="$" tooltip="Principal, Interest, Taxes, and Insurance." />
                  <InputField id="car" label="Car Loans" value={carLoan} onChange={setCarLoan} prefix="$" />
                  <InputField id="student" label="Student Loans" value={studentLoan} onChange={setStudentLoan} prefix="$" />
                  <InputField id="card" label="Credit Card Min. Payments" value={creditCard} onChange={setCreditCard} prefix="$" />
                  <InputField id="other" label="Other Monthly Debts" value={otherDebt} onChange={setOtherDebt} prefix="$" />
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
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Back-End DTI Ratio</p>
                    <p className="text-6xl font-black text-foreground">{results.dti.toFixed(1)}%</p>
                    <p className={`text-sm font-bold mt-2 ${getDtiStatus(results.dti).color}`}>
                      Status: {getDtiStatus(results.dti).label}
                    </p>
                  </div>
                  <div className="card-calculator bg-secondary/30 border-border text-center flex flex-col justify-center py-8">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Monthly Debt</p>
                    <p className="text-6xl font-black text-foreground">${Math.round(results.totalMonthlyDebt).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-2 font-medium">Remaining: ${Math.round(results.remainingIncome).toLocaleString()}/mo</p>
                  </div>
                </div>

                <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                    <PieChart className="h-5 w-5 text-primary" /> Ratio Breakdown
                  </h2>
                  <div className="mb-8">
                     <div className="flex justify-between text-sm font-bold mb-2">
                        <span>Total Debt Usage</span>
                        <span>{results.dti.toFixed(1)}%</span>
                     </div>
                     <div className="h-4 bg-secondary rounded-full overflow-hidden flex">
                        <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (parseFloat(mortgage) / parseFloat(grossIncome)) * 100)}%` }}></div>
                        <div className="h-full bg-indigo-500" style={{ width: `${Math.min(100, (parseFloat(carLoan) / parseFloat(grossIncome)) * 100)}%` }}></div>
                        <div className="h-full bg-violet-500" style={{ width: `${Math.min(100, (parseFloat(studentLoan) / parseFloat(grossIncome)) * 100)}%` }}></div>
                        <div className="h-full bg-purple-500" style={{ width: `${Math.min(100, (parseFloat(creditCard) / parseFloat(grossIncome)) * 100)}%` }}></div>
                     </div>
                     <div className="flex gap-4 mt-2 flex-wrap">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Housing</div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Car</div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase"><div className="w-2 h-2 rounded-full bg-violet-500"></div> Student</div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Cards</div>
                     </div>
                  </div>
                  <ResultDisplay items={[
                    { label: "Front-End DTI (Housing Only)", value: 0, textValue: `${results.frontEndDti.toFixed(1)}%` },
                    { label: "Gross Monthly Income", value: parseFloat(grossIncome) },
                    { label: "Total Non-Housing Debt", value: results.totalMonthlyDebt - parseFloat(mortgage) },
                    { label: "Ideal Debt Target (36%)", value: parseFloat(grossIncome) * 0.36 },
                  ]} />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>Understanding Your Debt-to-Income Ratio</h2>
              <p>Your Debt-to-Income (DTI) ratio is one of the most important numbers in personal finance, especially when you are applying for a mortgage or a large loan. It is a simple mathematical comparison between how much money you earn and how much money you owe each month.</p>

              <h3>Why DTI Matters to Lenders</h3>
              <p>Lenders use DTI as a measure of risk. If a large portion of your income is already spoken for by existing debts, you may struggle to make payments if you face a financial emergency or if your income drops. A low DTI ratio signals to lenders that you have a healthy balance between debt and income and are a reliable borrower.</p>

              <h3>The Two Types of DTI</h3>
              <ol>
                <li><strong>Front-End Ratio:</strong> Also known as the housing ratio, this calculates how much of your gross income goes strictly toward housing costs (mortgage principal, interest, taxes, and insurance). Lenders typically like to see this under 28%.</li>
                <li><strong>Back-End Ratio:</strong> This is the more comprehensive 'total' ratio. It includes your housing costs plus all other recurring debt payments like car loans, credit cards, student loans, and child support. Most lenders look for this to be 43% or lower.</li>
              </ol>

              <h3>What is the 'Magic Number' for a Mortgage?</h3>
              <p>While requirements vary by loan program, the <strong>43% DTI ratio</strong> is a significant threshold. It is the maximum ratio allowed for a 'Qualified Mortgage' under many federal guidelines. However, some programs like FHA loans may allow ratios as high as 50% or even 57% in certain circumstances if the borrower has high credit scores or significant cash reserves.</p>

              <h3>Strategies to Improve Your DTI</h3>
              <p>If your DTI is too high to qualify for the loan you want, there are two levers you can pull:</p>
              <ul>
                <li><strong>Increase Your Income:</strong> This is the harder lever to pull in the short term, but getting a raise or starting a side hustle directly reduces the ratio.</li>
                <li><strong>Pay Down Debt:</strong> Focus on paying off small loans entirely. Even a small $150/month car payment or credit card bill can have a significant impact on your DTI percentage.</li>
                <li><strong>Avoid New Debt:</strong> If you are planning to buy a home, avoid taking out new car loans or opening new credit cards, as these will immediately spike your DTI.</li>
              </ul>

              <h3>DTI vs. Disposable Income</h3>
              <p>It is important to remember that DTI only looks at pre-tax (gross) income and debt payments. It does not account for taxes, groceries, utilities, or entertainment. Even with a 'good' DTI, you should perform your own budget analysis to ensure you are comfortable with your monthly cash flow.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/dti-calculator" />
          <PopularCalculators exclude="/calculator/dti-calculator" />
        </div>
      </div>
    </>
  );
};

export default DtiCalculator;

