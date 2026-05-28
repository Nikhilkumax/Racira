"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import PieChart from "@/components/calculator/PieChart";
import AmortizationTable, { type AmortRow } from "@/components/calculator/AmortizationTable";
import { ChevronDown, Printer, RotateCcw, Calculator } from "lucide-react";

const AutoLoanCalculator = () => {
  const [vehiclePrice, setVehiclePrice] = useState("35000");
  const [downPayment, setDownPayment] = useState("5000");
  const [tradeIn, setTradeIn] = useState("0");
  const [salesTax, setSalesTax] = useState("7");
  const [titleFees, setTitleFees] = useState("500");
  const [loanTerm, setLoanTerm] = useState("60");
  const [interestRate, setInterestRate] = useState("5.9");
  const [cashIncentives, setCashIncentives] = useState("0");

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [includeTaxInLoan, setIncludeTaxInLoan] = useState(true);
  const [result, setResult] = useState<{
    monthlyPayment: number;
    totalLoan: number;
    totalInterest: number;
    totalCost: number;
    salesTaxAmt: number;
    rows: AmortRow[];
  } | null>(null);
  const [viewMode, setViewMode] = useState<"monthly" | "yearly">("monthly");
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => { handleCalculate(); }, []);

  const handleCalculate = () => {
    const price = parseFloat(vehiclePrice) || 0;
    const dp = parseFloat(downPayment) || 0;
    const ti = parseFloat(tradeIn) || 0;
    const taxPct = (parseFloat(salesTax) || 0) / 100;
    const fees = parseFloat(titleFees) || 0;
    const incentives = parseFloat(cashIncentives) || 0;
    const n = parseFloat(loanTerm) || 0;
    const r = (parseFloat(interestRate) || 0) / 100 / 12;

    const taxableAmount = price - ti;
    const salesTaxAmt = taxableAmount * taxPct;
    let loanAmount = price - dp - ti - incentives + fees;
    if (includeTaxInLoan) loanAmount += salesTaxAmt;

    if (loanAmount <= 0 || r <= 0 || n <= 0) return;

    const M = loanAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

    let balance = loanAmount;
    const rows: AmortRow[] = [];
    let totalPaid = 0;

    for (let m = 1; m <= n && balance > 0.01; m++) {
      const interest = balance * r;
      let principal = M - interest;
      if (principal > balance) principal = balance;
      balance -= principal;
      totalPaid += interest + principal;
      rows.push({ period: m, payment: interest + principal, principal, interest, balance: Math.max(0, balance) });
    }

    setResult({
      monthlyPayment: M,
      totalLoan: loanAmount,
      totalInterest: totalPaid - loanAmount,
      totalCost: totalPaid + dp + (includeTaxInLoan ? 0 : salesTaxAmt),
      salesTaxAmt,
      rows,
    });
  };

  const reset = () => {
    setVehiclePrice("35000"); setDownPayment("5000"); setTradeIn("0");
    setSalesTax("7"); setTitleFees("500"); setLoanTerm("60");
    setInterestRate("5.9"); setCashIncentives("0");
    setResult(null);
    setTimeout(() => handleCalculate(), 0);
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Auto Loan – RaciraCalculator</title>
      <style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:13px}
      th,td{border:1px solid #ddd;padding:6px 10px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  // Yearly aggregation
  const yearlyRows: AmortRow[] = result ? (() => {
    const yr: AmortRow[] = [];
    for (let y = 0; y < Math.ceil(result.rows.length / 12); y++) {
      const slice = result.rows.slice(y * 12, (y + 1) * 12);
      if (!slice.length) break;
      yr.push({
        period: y + 1,
        payment: slice.reduce((s, r) => s + r.payment, 0),
        principal: slice.reduce((s, r) => s + r.principal, 0),
        interest: slice.reduce((s, r) => s + r.interest, 0),
        balance: slice[slice.length - 1].balance,
      });
    }
    return yr;
  })() : [];

  const faqs = [
    { question: "How is an auto loan payment calculated?", answer: "Auto loan payments use the standard amortization formula: M = P × r(1+r)^n / [(1+r)^n - 1], where P is the loan amount, r is the monthly interest rate, and n is the number of payments. Our calculator also factors in trade-in value, sales tax, and fees." },
    { question: "Should I include sales tax in the loan?", answer: "Including sales tax in the loan means you pay interest on the tax amount over the loan term. Paying tax upfront saves interest but requires more cash at purchase. Our calculator lets you toggle this option to compare both scenarios." },
    { question: "How does a trade-in affect my loan?", answer: "A trade-in reduces the amount you need to finance, lowering your monthly payment and total interest paid. The trade-in value is subtracted from the vehicle price before calculating the loan amount." },
    { question: "What is a good auto loan interest rate?", answer: "Interest rates vary based on credit score, loan term, and vehicle age. As of 2024, excellent credit may qualify for 3-5% on new cars. Used car rates are typically 1-2% higher. Always shop multiple lenders for the best rate." },
    { question: "Is a longer or shorter loan term better?", answer: "Shorter terms (36-48 months) have higher monthly payments but much lower total interest. Longer terms (60-84 months) are more affordable monthly but cost significantly more overall. We recommend the shortest term you can comfortably afford." },
    { question: "What fees are included in an auto loan?", answer: "Common fees include title fees, registration, documentation fees, and dealer fees. Our calculator includes a field for title and registration fees, which are added to the loan amount. Some states also require additional fees." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Auto Loan Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Auto Loan Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
                <InputField id="price" label="Vehicle Price" value={vehiclePrice} onChange={setVehiclePrice} prefix="$" />
                <InputField id="down" label="Down Payment" value={downPayment} onChange={setDownPayment} prefix="$" />
                <InputField id="rate" label="Interest Rate (APR)" value={interestRate} onChange={setInterestRate} suffix="%" />
                <InputField id="term" label="Loan Term (Months)" value={loanTerm} onChange={setLoanTerm} />
              </div>

              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 text-sm font-medium text-primary hover:underline mb-4">
                Advanced Options
                <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>

              {showAdvanced && (<>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6 p-4 rounded-lg bg-secondary/30 border border-border">
                  <InputField id="trade" label="Trade-in Value" value={tradeIn} onChange={setTradeIn} prefix="$" />
                  <InputField id="tax" label="Sales Tax Rate" value={salesTax} onChange={setSalesTax} suffix="%" />
                  <InputField id="fees" label="Title & Registration" value={titleFees} onChange={setTitleFees} prefix="$" />
                  <InputField id="incentives" label="Cash Incentives" value={cashIncentives} onChange={setCashIncentives} prefix="$" />
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <input
                      type="checkbox"
                      id="tax-in-loan"
                      checked={includeTaxInLoan}
                      onChange={(e) => setIncludeTaxInLoan(e.target.checked)}
                      className="h-4 w-4 rounded border-input text-primary"
                    />
                    <label htmlFor="tax-in-loan" className="text-sm text-foreground">Include sales tax in loan</label>
                  </div>
                </div>
              
</>)}

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {result && (<>

              <div className="card-calculator mb-8" ref={printRef}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Loan Results</h2>
                  <button onClick={handlePrint} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                    <Printer className="h-4 w-4" /> Print
                  </button>
                </div>

                <ResultDisplay items={[
                  { label: "Monthly Payment", value: result.monthlyPayment, highlight: true },
                  { label: "Total Loan Amount", value: result.totalLoan },
                  { label: "Total Interest", value: result.totalInterest },
                  { label: "Sales Tax", value: result.salesTaxAmt },
                  { label: "Total Cost", value: result.totalCost },
                ]} />

                <div className="mt-6 flex justify-center">
                  <PieChart
                    segments={[
                      { label: "Principal", value: result.totalLoan, color: "hsl(211, 100%, 50%)" },
                      { label: "Interest", value: result.totalInterest, color: "hsl(220, 60%, 20%)" },
                      { label: "Tax & Fees", value: result.salesTaxAmt, color: "hsl(210, 30%, 75%)" },
                    ]}
                    size={180}
                  />
                </div>

                <div className="mt-6">
                  <div className="flex gap-2 mb-2">
                    <button onClick={() => setViewMode("monthly")} className={`px-3 py-1 rounded-md text-sm ${viewMode === "monthly" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Monthly</button>
                    <button onClick={() => setViewMode("yearly")} className={`px-3 py-1 rounded-md text-sm ${viewMode === "yearly" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Yearly</button>
                  </div>
                  <AmortizationTable rows={viewMode === "yearly" ? yearlyRows : result.rows} yearly={viewMode === "yearly"} />
                </div>
              </div>
            
</>)}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance">
              <h2>What Is an Auto Loan Calculator?</h2>
              <p>An auto loan calculator helps you estimate your monthly car payment based on the vehicle price, down payment, interest rate, and loan term. Our advanced calculator goes further by including trade-in value, sales tax, title and registration fees, and manufacturer incentives for the most accurate estimate possible.</p>
              <p>Whether you're buying a new or used vehicle, understanding the true cost of your auto loan is essential for making a smart financial decision. This calculator shows not just the monthly payment but the total cost of ownership including all interest paid over the life of the loan.</p>

              <h2>How Auto Loan Payments Are Calculated</h2>
              <p>Auto loans use the standard amortizing loan formula. Your monthly payment is determined by the loan amount (vehicle price minus down payment and trade-in, plus applicable taxes and fees), the interest rate, and the number of months in the loan term.</p>
              <p>For example, a $35,000 vehicle with $5,000 down, 7% sales tax, and 5.9% APR for 60 months would have a monthly payment of approximately $607. Over the full term, you'd pay about $6,400 in interest.</p>

              <h2>Understanding Sales Tax on Vehicle Purchases</h2>
              <p>Most states charge sales tax on vehicle purchases, calculated on the price minus trade-in value in many states. You can choose to pay the tax upfront or roll it into the loan. Rolling tax into the loan reduces your upfront cost but means you pay interest on the tax amount over the loan term.</p>

              <h2>The Role of Trade-In Value</h2>
              <p>Your trade-in vehicle reduces the amount you need to finance. In many states, the trade-in value also reduces the taxable amount, providing additional savings. Make sure to research your vehicle's trade-in value using resources like Kelley Blue Book or NADA before negotiating with the dealer.</p>

              <h2>Choosing the Right Loan Term</h2>
              <ul>
                <li><strong>36 months:</strong> Highest payment but lowest total interest. Best if you can afford it.</li>
                <li><strong>48 months:</strong> Good balance of affordability and interest savings.</li>
                <li><strong>60 months:</strong> Most popular term, reasonable monthly payments.</li>
                <li><strong>72-84 months:</strong> Lowest payments but highest total cost. Risk of being "upside down" on the loan.</li>
              </ul>

              <h2>Tips for Getting the Best Auto Loan</h2>
              <ul>
                <li><strong>Check your credit score:</strong> Higher scores qualify for significantly lower rates.</li>
                <li><strong>Get pre-approved:</strong> Shop rates from banks and credit unions before visiting the dealer.</li>
                <li><strong>Negotiate the price first:</strong> Focus on the total vehicle price, not just the monthly payment.</li>
                <li><strong>Consider a larger down payment:</strong> 20% down prevents being upside-down on the loan.</li>
                <li><strong>Avoid unnecessary add-ons:</strong> Extended warranties and dealer accessories inflate your loan amount.</li>
              </ul>

              <p className="text-xs mt-8 p-3 bg-secondary rounded-lg"><strong>Disclaimer:</strong> This calculator provides estimates for educational purposes only. Actual payments may vary based on lender terms, credit qualifications, and specific fees. This is not financial advice.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/auto-loan-calculator" />
          <PopularCalculators exclude="/auto-loan-calculator" />
        </div>
      </div>
    </>
  );
};

export default AutoLoanCalculator;



