"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Home, Calculator } from "lucide-react";

const MortgageAffordabilityCalculator = () => {
  const [annualIncome, setAnnualIncome] = useState("100000");
  const [monthlyDebts, setMonthlyDebts] = useState("500");
  const [downPayment, setDownPayment] = useState("60000");
  const [interestRate, setInterestRate] = useState("6.5");
  const [loanTerm, setLoanTerm] = useState("30"); // years
  const [propertyTax, setPropertyTax] = useState("1.2"); // percent of home value annually
  const [homeInsurance, setHomeInsurance] = useState("1200"); // annual
  const [hoaFees, setHoaFees] = useState("0"); // monthly

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const income = parseFloat(annualIncome);
    const debts = parseFloat(monthlyDebts);
    const down = parseFloat(downPayment);
    const rate = parseFloat(interestRate) / 100 / 12;
    const months = parseFloat(loanTerm) * 12;
    const taxRate = parseFloat(propertyTax) / 100 / 12; // monthly tax rate
    const insurance = parseFloat(homeInsurance) / 12; // monthly
    const hoa = parseFloat(hoaFees);

    if (income <= 0) return;

    const monthlyIncome = income / 12;

    // Lender rules:
    // Front-end ratio (housing costs / income): max 28%
    // Back-end ratio (total debts + housing / income): max 36% (we will use 36% for conservative, up to 43% for max)
    
    // Max monthly payment allowed by back-end ratio (36%)
    const maxTotalDebtPayment = monthlyIncome * 0.36;
    let maxHousingPayment = maxTotalDebtPayment - debts;

    // Front-end constraint (28%)
    const maxHousingByFrontEnd = monthlyIncome * 0.28;
    if (maxHousingByFrontEnd < maxHousingPayment) {
      maxHousingPayment = maxHousingByFrontEnd;
    }

    if (maxHousingPayment <= 0) {
      setResults({ error: "Your debt-to-income ratio is too high to qualify for a mortgage." });
      return;
    }

    // Now we must reverse-engineer the home price from maxHousingPayment
    // Housing payment = (HomePrice - DownPayment) * (rate * (1+rate)^months) / ((1+rate)^months - 1) 
    //                   + HomePrice * taxRate + insurance + hoa
    //
    // Let M_factor = (rate * (1+rate)^months) / ((1+rate)^months - 1)
    // Payment = (HomePrice - DownPayment) * M_factor + HomePrice * taxRate + insurance + hoa
    // Payment = HomePrice * M_factor - DownPayment * M_factor + HomePrice * taxRate + insurance + hoa
    // Payment + DownPayment * M_factor - insurance - hoa = HomePrice * (M_factor + taxRate)
    // HomePrice = (Payment + DownPayment * M_factor - insurance - hoa) / (M_factor + taxRate)

    const M_factor = (rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
    
    let affordableHomePrice = (maxHousingPayment + (down * M_factor) - insurance - hoa) / (M_factor + taxRate);
    
    if (affordableHomePrice < down) {
        affordableHomePrice = down; // Can't afford a loan, only cash
    }

    const maxLoanAmount = affordableHomePrice - down;
    const actualPITI = (maxLoanAmount * M_factor) + (affordableHomePrice * taxRate) + insurance + hoa;

    setResults({
      homePrice: Math.round(affordableHomePrice),
      maxLoanAmount: Math.max(0, Math.round(maxLoanAmount)),
      monthlyPayment: Math.round(actualPITI),
      principalAndInterest: Math.round(maxLoanAmount * M_factor),
      taxes: Math.round(affordableHomePrice * taxRate),
      insurance: Math.round(insurance),
      hoa: Math.round(hoa)
    });
  };

  const reset = () => {
    setShowResults(false); 
    setAnnualIncome("100000"); setMonthlyDebts("500"); setDownPayment("60000"); 
    setInterestRate("6.5"); setLoanTerm("30"); setPropertyTax("1.2"); 
    setHomeInsurance("1200"); setHoaFees("0"); setResults(null); 
  };

  const faqs = [
    { question: "What is the 28/36 rule?", answer: "The 28/36 rule is a standard used by mortgage lenders to determine how much you can borrow. It states that a household should spend a maximum of 28% of its gross monthly income on total housing expenses, and no more than 36% on total debt service (housing + car loans + student loans + credit cards)." },
    { question: "Can I get approved for more than this calculator says?", answer: "Yes. While 36% is the conservative benchmark for the back-end ratio, many lenders will approve Conventional loans up to 43% DTI, and FHA loans up to 50% DTI if you have excellent credit. However, borrowing the absolute maximum puts you at high risk of being 'house poor'." },
    { question: "Why do property taxes affect how much I can borrow?", answer: "Lenders look at your total housing payment (PITI: Principal, Interest, Taxes, and Insurance). If you buy in an area with very high property taxes, a large portion of your allowed monthly housing budget is eaten up by taxes, leaving less money to pay the actual loan principal." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Mortgage Affordability Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Mortgage Affordability Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <InputField id="income" label="Annual Gross Income ($)" value={annualIncome} onChange={setAnnualIncome} />
                <InputField id="debts" label="Monthly Debts ($)" value={monthlyDebts} onChange={setMonthlyDebts} />
                <InputField id="down" label="Down Payment ($)" value={downPayment} onChange={setDownPayment} />
                <InputField id="rate" label="Interest Rate (%)" value={interestRate} onChange={setInterestRate} />
                <InputField id="term" label="Loan Term (Years)" value={loanTerm} onChange={setLoanTerm} />
                <InputField id="tax" label="Property Tax Rate (%)" value={propertyTax} onChange={setPropertyTax} />
                <InputField id="ins" label="Annual Home Insurance ($)" value={homeInsurance} onChange={setHomeInsurance} />
                <InputField id="hoa" label="Monthly HOA Fees ($)" value={hoaFees} onChange={setHoaFees} />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button>
                <button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {results && results.error && (
              <>
                {results.error}
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2>Being "House Poor"</h2>
              <p>Just because a bank approves you for a massive loan does not mean you should take it. Lenders look at your gross income (before taxes) when calculating your Debt-to-Income (DTI) ratio. They do not factor in your groceries, childcare, retirement savings, or lifestyle costs.</p>
              <h3>The 28/36 Rule</h3>
              <p>Financial experts widely recommend keeping your housing costs below 28% of your gross income, and your total debts (housing + everything else) below 36%. If you push your DTI to the absolute maximum allowed by lenders (43-50%), you will likely struggle to afford everyday emergencies or basic vacations.</p>
              <h3>Interest Rates Dictate Affordability</h3>
              <p>Your purchasing power is highly sensitive to interest rates. A 1% increase in mortgage rates can decrease your maximum affordable home price by tens of thousands of dollars, because more of your allowed monthly budget goes straight to interest.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/mortgage-affordability" />
          <PopularCalculators exclude="/calculator/mortgage-affordability-calculator" />
        </div>
      </div>
    </>
  );
};
export default MortgageAffordabilityCalculator;

