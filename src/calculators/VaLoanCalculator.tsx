"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Shield } from "lucide-react";

const VaLoanCalculator = () => {
  const [price, setPrice] = useState("350000");
  const [downPayment, setDownPayment] = useState("0");
  const [rate, setRate] = useState("6.25");
  const [term, setTerm] = useState("30");
  const [fundingFee, setFundingFee] = useState("2.15"); // First time, 0% down

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const p = parseFloat(price);
    const d = parseFloat(downPayment);
    const baseLoan = p - d;
    const feeAmount = baseLoan * (parseFloat(fundingFee) / 100);
    const totalLoan = baseLoan + feeAmount;
    
    const r = parseFloat(rate) / 100 / 12;
    const n = parseFloat(term) * 12;

    if (totalLoan <= 0 || r < 0 || n <= 0) return;

    const monthlyPI = r > 0 
      ? (totalLoan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
      : totalLoan / n;

    setResults({
      totalLoan,
      feeAmount,
      monthlyPI,
      totalInterest: (monthlyPI * n) - totalLoan
    });
  };

  const reset = () => {
    setShowResults(false);
    setPrice("350000"); setDownPayment("0"); setRate("6.25");
    setTerm("30"); setFundingFee("2.15");
    setResults(null);
  };

  const faqs = [
    { question: "Who qualifies for a VA loan?", answer: "VA loans are available to active-duty service members, veterans, and eligible surviving spouses. You must obtain a Certificate of Eligibility (COE) from the VA." },
    { question: "Is there a down payment for VA loans?", answer: "One of the biggest benefits of VA loans is the 0% down payment requirement, allowing eligible borrowers to finance 100% of the home's value." },
    { question: "What is the VA Funding Fee?", answer: "The VA Funding Fee is a one-time payment made to the Department of Veterans Affairs to help sustain the program. It varies based on your service type, down payment amount, and whether it's your first or subsequent VA loan." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "VA Loan Calculator" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">VA Loan Calculator</h1>
            <p className="text-muted-foreground mb-8 text-lg">Calculate your monthly VA mortgage payments with 0% down payment and VA funding fee analysis.</p>

            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="price" label="Home Price ($)" value={price} onChange={setPrice} />
                <InputField id="down" label="Down Payment ($)" value={downPayment} onChange={setDownPayment} />
                <InputField id="rate" label="Interest Rate (%)" value={rate} onChange={setRate} />
                <InputField id="term" label="Term (Years)" value={term} onChange={setTerm} />
                <InputField id="fee" label="VA Funding Fee (%)" value={fundingFee} onChange={setFundingFee} tooltip="Usually 2.15% for first-time buyers with 0% down." />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Shield className="h-5 w-5" /> Calculate VA Payment
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
            </div>

            {showResults && results && (
              <div className="card-calculator mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold mb-6">VA Loan Analysis</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Monthly P&I Payment</p>
                    <p className="text-5xl font-black text-foreground">${results.monthlyPI.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Funding Fee Amount</p>
                    <p className="text-3xl font-black text-foreground">${results.feeAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Total Loan Amount", value: 0, textValue: "$" + results.totalLoan.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  { label: "Total Interest Paid", value: 0, textValue: "$" + results.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  { label: "Mortgage Insurance", value: 0, textValue: "$0 (VA loans have no PMI)" },
                ]} />
              </div>
            )}

            <AdPlaceholder className="mb-8" />
            <article className="prose-finance">
              <h2>Exclusive Benefits for Veterans</h2>
              <p>VA loans are part of the GI Bill and provide a path to homeownership for those who have served in the US military. They offer some of the most favorable terms available in the mortgage market.</p>
              <h3>No Down Payment Required</h3>
              <p>The primary advantage of a VA loan is the ability to finance 100% of the home's purchase price. This eliminates one of the biggest barriers to homeownership — saving for a large down payment.</p>
              <h3>No Monthly Mortgage Insurance</h3>
              <p>Unlike FHA or conventional loans with low down payments, VA loans do not require monthly private mortgage insurance (PMI). This can save you hundreds of dollars every single month.</p>
              <h3>The VA Funding Fee</h3>
              <p>While there is no monthly insurance, there is a one-time <strong>VA Funding Fee</strong>. This fee can be paid at closing or, more commonly, added to the total loan amount. The fee is waived for veterans with service-connected disabilities.</p>
            </article>
            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/va-loan" />
            <PopularCalculators exclude="/calculator/va-loan-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[600px]" label="Sticky Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default VaLoanCalculator;

