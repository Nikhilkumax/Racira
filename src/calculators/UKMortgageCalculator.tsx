"use client";

import { useState, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import PieChart from "@/components/calculator/PieChart";
import AmortizationTable, { type AmortRow } from "@/components/calculator/AmortizationTable";
import { ChevronDown, Printer, RotateCcw, Calculator } from "lucide-react";
import FinancialTooltip from "@/components/calculator/FinancialTooltip";

interface UKMortgageResults {
  monthlyPayment: number;
  totalInterest: number;
  totalRepayment: number;
  stampDuty: number;
  ltv: number;
  loanAmount: number;
  monthlyRows: AmortRow[];
  yearlyRows: AmortRow[];
}

const UKMortgageCalculator = () => {
  const [propertyPrice, setPropertyPrice] = useState("350000");
  const [deposit, setDeposit] = useState("70000");
  const [interestRate, setInterestRate] = useState("4.5");
  const [term, setTerm] = useState("25");
  const [buyerType, setBuyerType] = useState<"standard" | "firstTime" | "additional">("standard");
  const [paymentType, setPaymentType] = useState<"repayment" | "interestOnly">("repayment");

  const [results, setResults] = useState<UKMortgageResults | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [viewMode, setViewMode] = useState<"monthly" | "yearly">("yearly");
  const printRef = useRef<HTMLDivElement>(null);

  const calculateSDLT = (price: number, type: string) => {
    let tax = 0;
    if (type === "firstTime") {
      if (price <= 625000) {
        if (price > 425000) {
          tax = (price - 425000) * 0.05;
        }
      } else {
        // Standard rates apply if price > 625k
        tax = calculateSDLT(price, "standard");
      }
    } else if (type === "standard") {
      if (price > 1500000) {
        tax += (price - 1500000) * 0.12;
        tax += (1500000 - 925000) * 0.10;
        tax += (925000 - 250000) * 0.05;
      } else if (price > 925000) {
        tax += (price - 925000) * 0.10;
        tax += (925000 - 250000) * 0.05;
      } else if (price > 250000) {
        tax += (price - 250000) * 0.05;
      }
    } else if (type === "additional") {
      // 3% surcharge on each tier
      if (price > 1500000) {
        tax += (price - 1500000) * 0.15;
        tax += (1500000 - 925000) * 0.13;
        tax += (925000 - 250000) * 0.08;
        tax += 250000 * 0.03;
      } else if (price > 925000) {
        tax += (price - 925000) * 0.13;
        tax += (925000 - 250000) * 0.08;
        tax += 250000 * 0.03;
      } else if (price > 250000) {
        tax += (price - 250000) * 0.08;
        tax += 250000 * 0.03;
      } else {
        tax += price * 0.03;
      }
    }
    return tax;
  };

  const handleCalculate = () => {
    setShowResults(true);
    const price = parseFloat(propertyPrice) || 0;
    const dep = parseFloat(deposit) || 0;
    const P = price - dep;
    const annualRate = parseFloat(interestRate) || 0;
    const years = parseFloat(term) || 0;

    if (P <= 0 || annualRate < 0 || years <= 0) return;

    const r = annualRate / 100 / 12;
    const n = years * 12;

    let M = 0;
    if (paymentType === "repayment") {
      M = r > 0 ? P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : P / n;
    } else {
      M = P * r;
    }

    const stampDuty = calculateSDLT(price, buyerType);
    const ltv = (P / price) * 100;

    // Amortization logic
    let balance = P;
    const monthlyRows: AmortRow[] = [];
    let totalInterest = 0;

    for (let i = 1; i <= n; i++) {
      const intPayment = balance * r;
      let prinPayment = 0;
      if (paymentType === "repayment") {
        prinPayment = M - intPayment;
      }
      
      if (prinPayment > balance) prinPayment = balance;
      balance -= prinPayment;
      totalInterest += intPayment;

      monthlyRows.push({
        period: i,
        payment: M,
        principal: prinPayment,
        interest: intPayment,
        balance: Math.max(0, balance),
      });
    }

    const yearlyRows: AmortRow[] = [];
    for (let y = 0; y < Math.ceil(monthlyRows.length / 12); y++) {
      const yearSlice = monthlyRows.slice(y * 12, (y + 1) * 12);
      yearlyRows.push({
        period: y + 1,
        payment: yearSlice.reduce((s, r) => s + r.payment, 0),
        principal: yearSlice.reduce((s, r) => s + r.principal, 0),
        interest: yearSlice.reduce((s, r) => s + r.interest, 0),
        balance: yearSlice[yearSlice.length - 1].balance,
      });
    }

    setResults({
      monthlyPayment: M,
      totalInterest,
      totalRepayment: paymentType === "repayment" ? P + totalInterest : totalInterest + P, // interest only means you still owe P at end
      stampDuty,
      ltv,
      loanAmount: P,
      monthlyRows,
      yearlyRows,
    });
  };

  const reset = () => {
    setShowResults(false);
    setPropertyPrice("350000"); setDeposit("70000"); setInterestRate("4.5");
    setTerm("25"); setBuyerType("standard"); setPaymentType("repayment");
    setResults(null);
  };

  const faqs = [
    { question: "How does a UK mortgage calculator work?", answer: "A UK mortgage calculator uses the loan amount (property price minus deposit), the interest rate, and the term to estimate your monthly repayments. It follows UK lending standards and can include Stamp Duty Land Tax (SDLT) estimates based on current government thresholds." },
    { question: "What is Stamp Duty (SDLT)?", answer: "Stamp Duty Land Tax is a tax paid when you buy property or land over a certain price in England and Northern Ireland. The amount depends on the property price and whether you are a first-time buyer, moving home, or buying an additional property." },
    { question: "What is LTV (Loan-to-Value)?", answer: "LTV is the ratio of the loan amount to the property value, expressed as a percentage. For example, if you have a £50,000 deposit on a £250,000 home, your mortgage is £200,000, and your LTV is 80%. Generally, lower LTVs qualify for better interest rates." },
    { question: "Should I choose Repayment or Interest Only?", answer: "With a Repayment mortgage, you pay back both the interest and a portion of the loan every month, meaning you will own the home outright at the end of the term. With Interest Only, you only pay the interest, so the original loan amount remains due at the end." },
    { question: "Can I get a mortgage with a 5% deposit?", answer: "Yes, many UK lenders offer 95% LTV mortgages, often supported by government schemes like the Mortgage Guarantee Scheme. However, these typically carry higher interest rates than mortgages with larger deposits (like 15% or 20%)." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "UK Mortgage Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">UK Mortgage Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Professional UK mortgage planning with Stamp Duty estimates, LTV tracking, and repayment schedules.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <InputField id="price" label="Property Price" value={propertyPrice} onChange={setPropertyPrice} prefix="£" tooltip="The total purchase price of the property." />
                  <InputField id="deposit" label="Deposit" value={deposit} onChange={setDeposit} prefix="£" tooltip="The cash you are paying upfront." />
                  <div className="p-3 rounded-lg bg-secondary/20 border border-border">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Loan-to-Value (LTV)</p>
                    <p className="text-lg font-bold text-primary">
                      {propertyPrice && deposit ? (100 - (parseFloat(deposit)/parseFloat(propertyPrice)*100)).toFixed(1) : 0}%
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <InputField id="rate" label="Interest Rate" value={interestRate} onChange={setInterestRate} suffix="%" tooltip="Annual interest rate (APR)." />
                  <InputField id="term" label="Mortgage Term" value={term} onChange={setTerm} suffix="Years" tooltip="Usually 25 or 30 years." />
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Buyer Type</label>
                    <select value={buyerType} onChange={(e) => setBuyerType(e.target.value as any)} className="input-calc">
                      <option value="standard">Home Mover (Standard)</option>
                      <option value="firstTime">First-Time Buyer</option>
                      <option value="additional">Additional Property / BTL</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-foreground mb-2">Repayment Type</label>
                <div className="flex p-1 bg-secondary rounded-xl border border-border">
                  <button onClick={() => setPaymentType("repayment")} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${paymentType === "repayment" ? "bg-white shadow-sm text-primary" : "text-muted-foreground"}`}>Repayment</button>
                  <button onClick={() => setPaymentType("interestOnly")} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${paymentType === "interestOnly" ? "bg-white shadow-sm text-primary" : "text-muted-foreground"}`}>Interest Only</button>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate Mortgage</button><button onClick={reset} className="p-4 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Monthly Repayment</h2>
                  <button onClick={() => window.print()} className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors"><Printer className="h-5 w-5" /></button>
                </div>

                <div className="text-center py-8 mb-8 bg-primary/5 rounded-3xl border border-primary/10">
                    <p className="text-6xl font-black text-foreground mb-2">
                        £{results.monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Estimated Monthly Cost</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                    <div className="p-4 rounded-2xl bg-secondary/30 border border-border text-center">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Stamp Duty (SDLT)</p>
                        <p className="text-xl font-bold">£{results.stampDuty.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-secondary/30 border border-border text-center">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Loan Amount</p>
                        <p className="text-xl font-bold">£{results.loanAmount.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-secondary/30 border border-border text-center col-span-2 sm:col-span-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Total Interest</p>
                        <p className="text-xl font-bold">£{results.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>
                </div>

                <ResultDisplay items={[
                    { label: "Total Repayment", value: results.totalRepayment, highlight: true },
                    { label: "Property Price", value: parseFloat(propertyPrice) },
                    { label: "Loan-to-Value (LTV)", value: 0, textValue: results.ltv.toFixed(1) + "%" },
                ]} />

                <div className="mt-8">
                  <div className="flex gap-2 mb-4">
                    <button onClick={() => setViewMode("yearly")} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === "yearly" ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}>Yearly</button>
                    <button onClick={() => setViewMode("monthly")} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === "monthly" ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}>Monthly</button>
                  </div>
                  <AmortizationTable rows={viewMode === "yearly" ? results.yearlyRows : results.monthlyRows} yearly={viewMode === "yearly"} currency="£" />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="UK Mortgage Content Ad" />
          <article className="prose-finance max-w-none">
              <h2>Navigating the UK Mortgage Market</h2>
              <p>Buying a home in the United Kingdom is a complex journey involving lenders, solicitors, surveyors, and the taxman. Our UK Mortgage Calculator is designed to provide clarity on the financial aspects of this journey, helping you understand not just your monthly repayments, but also the significant upfront costs like Stamp Duty Land Tax (SDLT).</p>
              
              <h2>The Importance of Your Deposit</h2>
              <p>In the UK, the size of your deposit is the primary factor determining your mortgage interest rate. Lenders group their products by Loan-to-Value (LTV) bands, typically at 60%, 75%, 80%, 85%, 90%, and 95%. The lower your LTV (i.e., the larger your deposit), the lower the risk to the lender and the better the interest rate you can secure. For example, a borrower with a 40% deposit (60% LTV) will almost always pay significantly less interest than someone with a 5% deposit (95% LTV).</p>

              <h2>Understanding Stamp Duty (SDLT) in England and NI</h2>
              <p>Stamp Duty is a progressive tax, meaning you pay different rates on different portions of the property price. As of late 2024, the thresholds for standard home movers are:</p>
              <ul>
                <li>£0 - £250,000: 0%</li>
                <li>£250,001 - £925,000: 5%</li>
                <li>£925,001 - £1,500,000: 10%</li>
                <li>Above £1,500,000: 12%</li>
              </ul>
              <p><strong>First-Time Buyer Relief:</strong> If you are buying your first home, you pay 0% Stamp Duty on the first £425,000 and 5% on the portion between £425,001 and £625,000. If the property price exceeds £625,000, you unfortunately do not qualify for any first-time buyer relief and pay standard rates on the whole amount.</p>

              <h2>Repayment vs. Interest Only</h2>
              <p>Most residential mortgages in the UK are <strong>Repayment</strong> (Capital & Interest). Every month, you pay back a portion of the original loan plus interest. By the end of the term, you own the property 100% debt-free.</p>
              <p><strong>Interest Only</strong> mortgages were common in the past but are now harder to obtain for residential use. You only pay the interest each month, so your monthly cost is lower, but the original debt remains exactly the same. You must provide a credible "repayment strategy" (like an investment or sale of another asset) to the lender to qualify.</p>

              <h2>Fixed vs. Variable Rates</h2>
              <p>The UK market is dominated by short-term fixed-rate deals, typically for 2, 3, or 5 years. During this period, your monthly payment remains exactly the same. When the fix ends, you usually move to the lender's Standard Variable Rate (SVR), which is often much higher. Most UK homeowners choose to "remortgage" (switch to a new deal) every few years to keep their rate low.</p>

              <h2>Additional Costs to Budget For</h2>
              <p>Your mortgage repayment is just one part of the cost. When planning your move, ensure you have set aside funds for:</p>
              <ul>
                <li><strong>Solicitor/Conveyancing Fees:</strong> £800 - £2,000 depending on complexity.</li>
                <li><strong>Surveyor Fees:</strong> £300 - £1,000 to check the property's condition.</li>
                <li><strong>Lender Arrangement Fees:</strong> Often £999, which can sometimes be added to the loan.</li>
                <li><strong>Valuation Fee:</strong> Some lenders charge this to verify the property value (often free in modern deals).</li>
                <li><strong>Removal Costs:</strong> £500 - £2,000 depending on how much furniture you have.</li>
              </ul>

              <h2>Mortgage Stress Testing</h2>
              <p>Since the 2014 Mortgage Market Review, UK lenders must "stress test" your finances. They don't just check if you can afford the mortgage at today's rates; they check if you could still afford it if interest rates rose to 6% or 7%. Using our calculator to see how your payment changes at different interest rates can help you understand your own financial resilience.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/uk-mortgage-calculator" />
          <PopularCalculators exclude="/calculator/uk-mortgage-calculator" />
        </div>
      </div>
    </>
  );
};

export default UKMortgageCalculator;

