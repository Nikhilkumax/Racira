"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Car } from "lucide-react";

const LeaseVsBuyCalculator = () => {
  const [carPrice, setCarPrice] = useState("35000");
  const [downPayment, setDownPayment] = useState("5000");
  const [leaseTerm, setLeaseTerm] = useState("36");
  const [leaseMonthly, setLeaseMonthly] = useState("450");
  const [leaseResidual, setLeaseResidual] = useState("20000");
  const [loanInterest, setLoanInterest] = useState("6");
  const [expectedResale, setExpectedResale] = useState("22000");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const price = parseFloat(carPrice) || 0;
    const down = parseFloat(downPayment) || 0;
    const term = parseFloat(leaseTerm) || 0;
    const lMonthly = parseFloat(leaseMonthly) || 0;
    const residual = parseFloat(leaseResidual) || 0;
    const interest = (parseFloat(loanInterest) || 0) / 100 / 12;
    const resale = parseFloat(expectedResale) || 0;

    if (price <= 0 || term <= 0) return;

    // LEASE COST
    const totalLeaseCost = down + (lMonthly * term);

    // BUY COST
    const loanAmount = price - down;
    const bMonthly = interest > 0 
      ? (loanAmount * interest * Math.pow(1 + interest, term)) / (Math.pow(1 + interest, term) - 1)
      : loanAmount / term;
    
    const totalLoanCost = down + (bMonthly * term);
    const netBuyCost = totalLoanCost - resale;

    setResults({
      totalLeaseCost,
      totalBuyCost: totalLoanCost,
      netBuyCost,
      buyMonthly: bMonthly,
      difference: Math.abs(totalLeaseCost - netBuyCost),
      betterOption: netBuyCost < totalLeaseCost ? "Buy" : "Lease"
    });
  };

  const reset = () => {
    setShowResults(false);
    setCarPrice("35000"); setDownPayment("5000"); setLeaseTerm("36");
    setLeaseMonthly("450"); setLeaseResidual("20000"); setLoanInterest("6");
    setExpectedResale("22000");
    setResults(null);
  };

  const faqs = [
    { question: "Is it better to lease or buy a car?", answer: "Buying is generally cheaper in the long run because you own an asset at the end. Leasing is often better for those who want a new car every few years and lower monthly payments without the hassle of selling." },
    { question: "What is a car's residual value?", answer: "The residual value is the estimated value of the car at the end of the lease term. This is the price you can pay to buy the car if you choose to keep it after the lease." },
    { question: "Does leasing have mileage limits?", answer: "Yes, most leases limit you to 10,000 to 15,000 miles per year. Exceeding these limits can result in expensive per-mile fees at the end of the lease." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Lease vs Buy Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Lease vs Buy Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="carPrice" label="Vehicle Price" value={carPrice} onChange={setCarPrice} prefix="$" />
                <InputField id="downPayment" label="Down Payment" value={downPayment} onChange={setDownPayment} prefix="$" />
                <InputField id="leaseTerm" label="Term (Months)" value={leaseTerm} onChange={setLeaseTerm} />
                <InputField id="leaseMonthly" label="Lease Monthly Payment" value={leaseMonthly} onChange={setLeaseMonthly} prefix="$" />
                <InputField id="loanInterest" label="Loan Interest Rate" value={loanInterest} onChange={setLoanInterest} suffix="%" />
                <InputField id="resale" label="Expected Resale Value" value={expectedResale} onChange={setExpectedResale} prefix="$" tooltip="What you could sell the car for after the term." />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Car className="h-5 w-5" /> Compare Options
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-xl font-bold mb-6">Comparison Analysis</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className={`p-6 rounded-2xl border text-center flex flex-col justify-center ${results.betterOption === "Lease" ? "bg-primary/5 border-primary/10" : "bg-secondary/5 border-secondary/10"}`}>
                    <p className="text-sm font-bold uppercase tracking-widest mb-1 opacity-70">Total Lease Cost</p>
                    <p className="text-4xl font-black text-foreground">${results.totalLeaseCost.toLocaleString()}</p>
                  </div>
                  <div className={`p-6 rounded-2xl border text-center flex flex-col justify-center ${results.betterOption === "Buy" ? "bg-primary/5 border-primary/10" : "bg-secondary/5 border-secondary/10"}`}>
                    <p className="text-sm font-bold uppercase tracking-widest mb-1 opacity-70">Net Buy Cost</p>
                    <p className="text-4xl font-black text-foreground">${results.netBuyCost.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">(Total cost minus resale value)</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Loan Monthly Payment", value: 0, textValue: "$" + results.buyMonthly.toFixed(2) },
                  { label: "Financial Winner", value: 0, textValue: results.betterOption },
                  { label: "Total Savings", value: 0, textValue: "$" + results.difference.toLocaleString() },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2>Lease or Buy: Which is Right for You?</h2>
              <p>Choosing between leasing and buying a car is one of the most common financial dilemmas. While buying is often the "smarter" financial move in the long term, leasing offers flexibility and lower upfront costs.</p>
              <h3>When Leasing Makes Sense</h3>
              <p>Leasing is ideal if you enjoy driving a new car every few years, want the latest technology and safety features, and prefer lower monthly payments. Since you only pay for the car's depreciation during the lease term, your payments are typically lower than a loan for the full purchase price.</p>
              <h3>The Benefits of Ownership</h3>
              <p>When you buy a car, you are building equity. Once the loan is paid off, you own an asset that you can sell or trade in later. There are no mileage restrictions, and you have the freedom to customize the vehicle however you like.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/lease-vs-buy" />
          <PopularCalculators exclude="/calculator/lease-vs-buy-calculator" />
        </div>
      </div>
    </>
  );
};

export default LeaseVsBuyCalculator;

