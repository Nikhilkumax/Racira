"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Home, Calculator } from "lucide-react";

const UsdaLoanCalculator = () => {
  const [price, setPrice] = useState("250000");
  const [downPayment, setDownPayment] = useState("0");
  const [rate, setRate] = useState("6.25");
  const [term, setTerm] = useState("30");
  const [upfrontFee, setUpfrontFee] = useState("1.0");
  const [annualFee, setAnnualFee] = useState("0.35");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const p = parseFloat(price);
    const d = parseFloat(downPayment);
    const baseLoan = p - d;
    const upfrontAmount = baseLoan * (parseFloat(upfrontFee) / 100);
    const totalLoan = baseLoan + upfrontAmount;
    
    const r = parseFloat(rate) / 100 / 12;
    const n = parseFloat(term) * 12;
    const annualRate = parseFloat(annualFee) / 100 / 12;

    if (totalLoan <= 0 || r < 0 || n <= 0) return;

    const monthlyPI = r > 0 
      ? (totalLoan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
      : totalLoan / n;

    const monthlyFee = totalLoan * annualRate;
    const totalMonthly = monthlyPI + monthlyFee;

    setResults({
      totalLoan,
      upfrontAmount,
      monthlyPI,
      monthlyFee,
      totalMonthly,
      totalInterest: (monthlyPI * n) - totalLoan
    });
  };

  const reset = () => {
    setShowResults(false);
    setPrice("250000"); setDownPayment("0"); setRate("6.25");
    setTerm("30"); setUpfrontFee("1.0"); setAnnualFee("0.35");
    setResults(null);
  };

  const faqs = [
    { question: "What is a USDA loan?", answer: "A USDA loan is a zero-down-payment mortgage for rural and suburban homebuyers. It is sponsored by the U.S. Department of Agriculture and is designed to promote development in less populated areas." },
    { question: "Are USDA loans only for farms?", answer: "No. While they are intended for rural and suburban areas, you do not need to operate a farm to qualify. Many suburban neighborhoods are actually in USDA-eligible zones." },
    { question: "What are the income limits for USDA loans?", answer: "USDA loans are designed for low-to-moderate-income families. The income limit varies by location and household size, but generally, your household income cannot exceed 115% of the area's median income." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "USDA Loan Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">USDA Loan Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Estimate monthly USDA mortgage payments with 0% down and rural housing guarantee fee analysis.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="price" label="Home Price ($)" value={price} onChange={setPrice} />
                <InputField id="down" label="Down Payment ($)" value={downPayment} onChange={setDownPayment} />
                <InputField id="rate" label="Interest Rate (%)" value={rate} onChange={setRate} />
                <InputField id="term" label="Term (Years)" value={term} onChange={setTerm} />
                <InputField id="upfront" label="Upfront Fee (%)" value={upfrontFee} onChange={setUpfrontFee} />
                <InputField id="annual" label="Annual Fee (%)" value={annualFee} onChange={setAnnualFee} />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Home className="h-5 w-5" /> Calculate USDA Payment
                </button>
                <button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-xl font-bold mb-6">USDA Loan Analysis</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Total Monthly Payment</p>
                    <p className="text-5xl font-black text-foreground">${results.totalMonthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Monthly Guarantee Fee</p>
                    <p className="text-3xl font-black text-foreground">${results.monthlyFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Total Loan Amount", value: 0, textValue: "$" + results.totalLoan.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  { label: "Upfront Fee Financed", value: 0, textValue: "$" + results.upfrontAmount.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  { label: "Total Interest Paid", value: 0, textValue: "$" + results.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>Affordable Rural Housing</h2>
              <p>The USDA Rural Development Single Family Housing Guaranteed Loan Program is designed to make homeownership a reality for those living in rural and suburban areas.</p>
              <h3>100% Financing</h3>
              <p>Like VA loans, USDA loans allow for 0% down payment. This makes them an incredible option for families with moderate income who may not have significant savings but have stable employment and good credit.</p>
              <h3>USDA Fees</h3>
              <p>To fund the program, the USDA charges two fees:</p>
              <ul>
                <li><strong>Upfront Guarantee Fee:</strong> Currently 1.0% of the loan amount. This can be financed into the loan balance.</li>
                <li><strong>Annual Guarantee Fee:</strong> Currently 0.35% of the loan balance, paid monthly. This is significantly lower than FHA mortgage insurance (MIP).</li>
              </ul>
              <h3>Eligibility Requirements</h3>
              <p>To qualify for a USDA loan, both the property and the borrower must meet certain criteria. The property must be located in a USDA-eligible area, and the borrower's household income must be within the limits set for that specific county.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/usda-loan" />
          <PopularCalculators exclude="/calculator/usda-loan-calculator" />
        </div>
      </div>
    </>
  );
};

export default UsdaLoanCalculator;

