"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Building } from "lucide-react";

const LoanAgainstPropertyCalculator = () => {
  const [value, setValue] = useState("500000");
  const [amount, setAmount] = useState("200000");
  const [rate, setRate] = useState("9.5");
  const [term, setTerm] = useState("15");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const v = parseFloat(value);
    const p = parseFloat(amount);
    const r = parseFloat(rate) / 100 / 12;
    const n = parseFloat(term) * 12;

    if (v <= 0 || p <= 0 || r < 0 || n <= 0) return;

    const monthly = r > 0 
      ? (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
      : p / n;

    const totalInterest = (monthly * n) - p;
    const ltv = (p / v) * 100;

    setResults({
      monthly,
      totalInterest,
      ltv,
      totalPayback: monthly * n
    });
  };

  const reset = () => {
    setShowResults(false);
    setValue("500000"); setAmount("200000"); setRate("9.5"); setTerm("15");
    setResults(null);
  };

  const faqs = [
    { question: "What is a Loan Against Property (LAP)?", answer: "A Loan Against Property is a secured loan where you use your residential or commercial property as collateral. It typically offers lower interest rates than personal loans and longer repayment terms." },
    { question: "How much can I borrow against my property?", answer: "Lenders typically offer 40% to 70% of the property's market value, depending on the property type (residential usually gets higher LTV than commercial) and your repayment capacity." },
    { question: "Can I use the loan for any purpose?", answer: "Yes, unlike a home loan which must be used to buy a house, a LAP can be used for business expansion, weddings, medical emergencies, or any other legitimate financial need." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Loan Against Property Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Loan Against Property Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Calculate monthly EMI and total interest for secured loans using your property as collateral.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="value" label="Property Market Value ($)" value={value} onChange={setValue} />
                <InputField id="amount" label="Loan Amount Requested ($)" value={amount} onChange={setAmount} />
                <InputField id="rate" label="Interest Rate (%)" value={rate} onChange={setRate} />
                <InputField id="term" label="Loan Term (Years)" value={term} onChange={setTerm} />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Building className="h-5 w-5" /> Calculate LAP EMI
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-xl font-bold mb-6">Loan Analysis</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Monthly EMI</p>
                    <p className="text-5xl font-black text-foreground">${results.monthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">LTV Ratio</p>
                    <p className="text-3xl font-black text-foreground">{results.ltv.toFixed(1)}%</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Total Interest Paid", value: 0, textValue: "$" + results.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  { label: "Total Payback", value: 0, textValue: "$" + results.totalPayback.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  { label: "Collateral Type", value: 0, textValue: "Residential/Commercial Property" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>Leveraging Your Real Estate</h2>
              <p>A Loan Against Property (LAP) is one of the most cost-effective ways to raise large amounts of capital. By using your property as security, you provide the lender with safety, which in turn leads to better borrowing terms for you.</p>
              <h3>LAP vs. Personal Loan</h3>
              <p>While a personal loan is unsecured and usually limited to smaller amounts with 12-18% interest, a LAP can provide millions of dollars at rates closer to 8-10%. The repayment term for a LAP can also be as long as 15-20 years, compared to the 5-year maximum typical of personal loans.</p>
              <h3>Understanding the LTV Ratio</h3>
              <p>The <strong>Loan-to-Value (LTV)</strong> ratio is the percentage of the property's value that the lender is willing to lend. If your house is worth $500,000 and the lender has a 60% LTV cap, the maximum you can borrow is $300,000. Lenders keep this margin to protect themselves against fluctuations in real estate prices.</p>
              <h3>Property Valuation</h3>
              <p>Before approving the loan, the lender will send a professional appraiser to determine the current market value of your property. They will also verify the legal titles to ensure the property is free of disputes and can be legally used as collateral.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/loan-against-property" />
          <PopularCalculators exclude="/calculator/loan-against-property-calculator" />
        </div>
      </div>
    </>
  );
};

export default LoanAgainstPropertyCalculator;

