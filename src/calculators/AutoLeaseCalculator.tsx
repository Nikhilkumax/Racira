"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Car } from "lucide-react";

const AutoLeaseCalculator = () => {
  const [vehiclePrice, setVehiclePrice] = useState("35000");
  const [downPayment, setDownPayment] = useState("2000");
  const [tradeInValue, setTradeInValue] = useState("0");
  const [leaseTerm, setLeaseTerm] = useState("36"); // months
  const [moneyFactor, setMoneyFactor] = useState("0.0025");
  const [residualValuePct, setResidualValuePct] = useState("55"); // percentage
  const [salesTaxRate, setSalesTaxRate] = useState("7"); // percentage

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const price = parseFloat(vehiclePrice);
    const down = parseFloat(downPayment);
    const tradeIn = parseFloat(tradeInValue);
    const term = parseFloat(leaseTerm);
    const mf = parseFloat(moneyFactor);
    const residualPct = parseFloat(residualValuePct) / 100;
    const taxRate = parseFloat(salesTaxRate) / 100;

    if (price <= 0 || term <= 0) return;

    // Capitalized Cost (Amount being financed)
    const capCost = price - down - tradeIn;
    
    // Residual Value (What the car is worth at end of lease)
    const residualValue = price * residualPct;

    // Depreciation Fee
    // (Cap Cost - Residual) / Term
    const depreciationFee = (capCost - residualValue) / term;

    // Finance Fee (Interest)
    // (Cap Cost + Residual) * Money Factor
    const financeFee = (capCost + residualValue) * mf;

    // Base Monthly Payment
    const basePayment = depreciationFee + financeFee;

    // Monthly Taxes
    const monthlyTax = basePayment * taxRate;

    // Total Monthly Payment
    const totalPayment = basePayment + monthlyTax;

    const totalCost = (totalPayment * term) + down + tradeIn;

    // Equivalent APR
    const equivalentApr = mf * 2400;

    setResults({
      monthlyPayment: totalPayment,
      basePayment,
      monthlyTax,
      depreciationFee,
      financeFee,
      totalCost,
      residualValue,
      equivalentApr
    });
  };

  const reset = () => {
    setShowResults(false); 
    setVehiclePrice("35000"); setDownPayment("2000"); setTradeInValue("0"); 
    setLeaseTerm("36"); setMoneyFactor("0.0025"); setResidualValuePct("55"); setSalesTaxRate("7");
    setResults(null); 
  };

  const faqs = [
    { question: "What is a Money Factor?", answer: "The money factor determines the interest rate on your lease. To find the equivalent APR (Annual Percentage Rate), simply multiply the money factor by 2,400. For example, a money factor of 0.0025 is a 6.0% APR." },
    { question: "What is Residual Value?", answer: "Residual value is the estimated wholesale value of the vehicle at the end of the lease term. It is set by the leasing company and expressed as a percentage of the MSRP. Higher residual values mean lower monthly payments because you are paying for less depreciation." },
    { question: "Should I put money down on a lease?", answer: "Most financial experts advise against putting a large down payment (cap cost reduction) on a lease. If the car is totaled or stolen, insurance pays the leasing company, and you lose your down payment. It is safer to keep that cash in the bank and make slightly higher monthly payments." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Auto Lease Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Auto Lease Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Calculate your exact monthly car lease payment by breaking down depreciation, rent charges, and taxes.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="price" label="Vehicle MSRP/Price ($)" value={vehiclePrice} onChange={setVehiclePrice} />
                <InputField id="down" label="Down Payment ($)" value={downPayment} onChange={setDownPayment} />
                <InputField id="trade" label="Trade-In Value ($)" value={tradeInValue} onChange={setTradeInValue} />
                <InputField id="term" label="Lease Term (Months)" value={leaseTerm} onChange={setLeaseTerm} />
                <InputField id="mf" label="Money Factor (e.g. 0.0025)" value={moneyFactor} onChange={setMoneyFactor} />
                <InputField id="res" label="Residual Value (%)" value={residualValuePct} onChange={setResidualValuePct} />
                <InputField id="tax" label="Sales Tax Rate (%)" value={salesTaxRate} onChange={setSalesTaxRate} />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2"><Car className="h-5 w-5" /> Calculate Lease Payment</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-xl font-bold mb-6">Lease Payment Details</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Monthly Payment (Inc. Tax)</p>
                    <p className="text-4xl font-black text-foreground">${results.monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Lease Cost</p>
                    <p className="text-3xl font-black text-foreground">${results.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className="text-sm text-muted-foreground mt-1">Over {leaseTerm} months</p>
                  </div>
                </div>

                <h3 className="text-lg font-bold mb-4">Payment Breakdown</h3>
                <ResultDisplay items={[
                  { label: "Monthly Depreciation Fee", value: 0, textValue: `$${results.depreciationFee.toFixed(2)}` },
                  { label: "Monthly Finance Fee (Rent Charge)", value: 0, textValue: `$${results.financeFee.toFixed(2)}` },
                  { label: "Monthly Taxes", value: 0, textValue: `$${results.monthlyTax.toFixed(2)}` },
                  { label: "Base Monthly Payment (Pre-Tax)", value: 0, textValue: `$${results.basePayment.toFixed(2)}` },
                ]} />
                
                <h3 className="text-lg font-bold mt-8 mb-4">Lease Variables</h3>
                <ResultDisplay items={[
                  { label: "Equivalent Interest Rate (APR)", value: 0, textValue: `${results.equivalentApr.toFixed(2)}%` },
                  { label: "Estimated Residual Value", value: 0, textValue: `$${results.residualValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>How a Car Lease is Calculated</h2>
              <p>Unlike an auto loan where you are paying for the entire cost of the car over time, a lease only charges you for the value the car loses while you drive it, plus interest and fees.</p>
              <h3>The Three Components of Your Payment</h3>
              <ol>
                <li><strong>Depreciation:</strong> This is the difference between the MSRP and the Residual Value, divided by the number of months.</li>
                <li><strong>Finance Fee:</strong> Leasing companies charge you rent for borrowing the vehicle. This is calculated using a Money Factor.</li>
                <li><strong>Taxes:</strong> Unlike buying a car where tax is paid on the entire purchase price upfront, in most states, lease sales tax is charged monthly on your base lease payment.</li>
              </ol>
              <h3>How to Negotiate a Better Lease</h3>
              <p>You cannot negotiate the Residual Value, as it is set by the bank. However, you can negotiate the initial Vehicle Price (Capitalized Cost) just as you would if buying it. You can also ask the dealer if they have marked up the base Money Factor, as this is a common hidden profit center.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/auto-lease" />
          <PopularCalculators exclude="/calculator/auto-lease-calculator" />
        </div>
      </div>
    </>
  );
};
export default AutoLeaseCalculator;

