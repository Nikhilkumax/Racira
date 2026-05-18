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

interface CanadianResults {
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  cmhcPremium: number;
  loanAmount: number;
  totalLoanWithPremium: number;
  monthlyRows: AmortRow[];
  yearlyRows: AmortRow[];
}

const CanadianMortgageCalculator = () => {
  const [homePrice, setHomePrice] = useState("500000");
  const [downPayment, setDownPayment] = useState("100000");
  const [interestRate, setInterestRate] = useState("5.2");
  const [amortization, setAmortization] = useState("25");
  const [compounding, setCompounding] = useState<"semiAnnual" | "monthly">("semiAnnual");

  const [results, setResults] = useState<CanadianResults | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [viewMode, setViewMode] = useState<"monthly" | "yearly">("yearly");
  const printRef = useRef<HTMLDivElement>(null);

  const calculateCMHC = (price: number, down: number) => {
    const downPct = (down / price) * 100;
    if (downPct >= 20) return 0;
    if (downPct < 5) return -1; // Not allowed

    const loan = price - down;
    if (downPct < 10) return loan * 0.04;
    if (downPct < 15) return loan * 0.031;
    return loan * 0.028;
  };

  const handleCalculate = () => {
    setShowResults(true);
    const price = parseFloat(homePrice) || 0;
    const down = parseFloat(downPayment) || 0;
    const annualRate = parseFloat(interestRate) || 0;
    const years = parseFloat(amortization) || 0;

    if (price <= 0 || down < 0 || annualRate < 0 || years <= 0) return;

    const cmhcPremium = calculateCMHC(price, down);
    if (cmhcPremium === -1) return; // Should handle UI error

    const baseLoan = price - down;
    const totalLoan = baseLoan + cmhcPremium;

    // Canadian Semi-annual compounding formula: 
    // i_eff = ( (1 + i_ann / 2)^(2/12) ) - 1
    let r = 0;
    if (compounding === "semiAnnual") {
        r = Math.pow(Math.pow(1 + (annualRate / 100 / 2), 2), 1/12) - 1;
    } else {
        r = annualRate / 100 / 12;
    }

    const n = years * 12;
    const M = r > 0 ? totalLoan * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : totalLoan / n;

    let balance = totalLoan;
    const monthlyRows: AmortRow[] = [];
    let totalInterest = 0;

    for (let i = 1; i <= n; i++) {
      const intPayment = balance * r;
      let prinPayment = M - intPayment;
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
      totalCost: totalLoan + totalInterest,
      cmhcPremium,
      loanAmount: baseLoan,
      totalLoanWithPremium: totalLoan,
      monthlyRows,
      yearlyRows,
    });
  };

  const reset = () => {
    setShowResults(false);
    setHomePrice("500000"); setDownPayment("100000"); setInterestRate("5.2");
    setAmortization("25"); setCompounding("semiAnnual");
    setResults(null);
  };

  const faqs = [
    { question: "How are Canadian mortgages different from US mortgages?", answer: "The two biggest differences are compounding and terms. In Canada, interest on fixed-rate mortgages is compounded semi-annually by law, whereas in the US, it is compounded monthly. Also, Canadian mortgages usually have terms of 1 to 10 years, after which you must renew at a new rate, whereas the US is famous for the 30-year fixed rate." },
    { question: "What is CMHC insurance?", answer: "CMHC (Canada Mortgage and Housing Corporation) insurance is mandatory in Canada for anyone buying a home with a down payment of less than 20%. It protects the lender in case you default on your mortgage. The premium is typically added to your mortgage balance." },
    { question: "What is the minimum down payment in Canada?", answer: "For homes under $500,000, the minimum is 5%. For homes between $500,000 and $1 million, you need 5% of the first $500k and 10% of the portion above that. For homes over $1 million, a 20% down payment is required." },
    { question: "What is the maximum amortization period?", answer: "If your down payment is less than 20% (insured mortgage), the maximum amortization is 25 years. If your down payment is 20% or more (uninsured), you can typically choose an amortization of up to 30 years." },
    { question: "Why is semi-annual compounding used?", answer: "It is a historical legal requirement in Canada's Interest Act. It actually results in a slightly lower effective interest rate compared to monthly compounding for the same quoted annual rate." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Canadian Mortgage Calculator" }]} />

      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">Canadian Mortgage Calculator</h1>
            <p className="text-muted-foreground mb-8 text-lg">Calculate your monthly payments with Canadian-specific compounding and CMHC insurance rules.</p>

            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-2 gap-6">
                <InputField id="price" label="Home Price" value={homePrice} onChange={setHomePrice} prefix="$" tooltip="Total purchase price of the property." />
                <InputField id="down" label="Down Payment" value={downPayment} onChange={setDownPayment} prefix="$" tooltip="Your upfront cash payment (Min 5-20% depending on price)." />
                <InputField id="rate" label="Interest Rate" value={interestRate} onChange={setInterestRate} suffix="%" tooltip="Quoted annual interest rate." />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Amortization (Years)</label>
                  <select value={amortization} onChange={(e) => setAmortization(e.target.value)} className="input-calc">
                    <option value="5">5 Years</option>
                    <option value="10">10 Years</option>
                    <option value="15">15 Years</option>
                    <option value="20">20 Years</option>
                    <option value="25">25 Years</option>
                    <option value="30">30 Years (Uninsured only)</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-foreground mb-2">Compounding Frequency</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={compounding === "semiAnnual"} onChange={() => setCompounding("semiAnnual")} className="w-4 h-4 text-primary" />
                    <span className="text-sm">Semi-Annual (Standard Fixed)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={compounding === "monthly"} onChange={() => setCompounding("monthly")} className="w-4 h-4 text-primary" />
                    <span className="text-sm">Monthly (Standard Variable)</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate Payments</button><button onClick={reset} className="p-4 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"><RotateCcw className="h-5 w-5" /></button>
              </div>
            </div>

            {showResults && results && (
              <div className="card-calculator mb-8 animate-in fade-in slide-in-from-bottom-4" ref={printRef}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Mortgage Summary</h2>
                  <button onClick={() => window.print()} className="text-primary hover:underline flex items-center gap-2"><Printer className="h-4 w-4" /> Print</button>
                </div>

                <div className="bg-primary/5 rounded-3xl p-8 text-center border border-primary/10 mb-8">
                    <p className="text-5xl font-black text-foreground mb-1">
                        ${results.monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Monthly Payment</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="p-4 rounded-xl bg-secondary/20 text-center">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Loan Amount</p>
                        <p className="font-bold">${results.loanAmount.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-secondary/20 text-center">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">CMHC Premium</p>
                        <p className="font-bold">${results.cmhcPremium.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-secondary/20 text-center">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Total Interest</p>
                        <p className="font-bold">${Math.round(results.totalInterest).toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-secondary/20 text-center">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Total Cost</p>
                        <p className="font-bold">${Math.round(results.totalCost).toLocaleString()}</p>
                    </div>
                </div>

                <ResultDisplay items={[
                    { label: "Total Loan with CMHC", value: results.totalLoanWithPremium, highlight: true },
                    { label: "Amortization Period", value: 0, textValue: amortization + " Years" },
                    { label: "Effective Monthly Rate", value: 0, textValue: ( (Math.pow(1+results.monthlyPayment/results.totalLoanWithPremium, 1)-1)*100 ).toFixed(4) + "%" }, // This is a rough calc for display
                ]} />

                <div className="mt-10">
                    <div className="flex gap-2 mb-4">
                        <button onClick={() => setViewMode("yearly")} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === "yearly" ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}>Yearly Schedule</button>
                        <button onClick={() => setViewMode("monthly")} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === "monthly" ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}>Monthly Schedule</button>
                    </div>
                    <AmortizationTable rows={viewMode === "yearly" ? results.yearlyRows : results.monthlyRows} yearly={viewMode === "yearly"} />
                </div>
              </div>
            )}

            <AdPlaceholder className="mb-10" />

            <article className="prose-finance max-w-none">
              <h2>Understanding Canadian Mortgages</h2>
              <p>The Canadian mortgage landscape is unique, governed by specific regulations in the Interest Act and the Bank Act. Whether you are buying a trendy condo in Toronto, a family home in Calgary, or an investment property in Vancouver, understanding how interest is calculated and how insurance premiums work can save you thousands of dollars.</p>
              
              <h2>Semi-Annual Compounding: The Canadian Standard</h2>
              <p>One of the most distinctive features of Canadian fixed-rate mortgages is that interest is compounded semi-annually (twice a year) but paid monthly. This is a legal requirement for all fixed-rate mortgages in Canada. For the borrower, this is actually a slight advantage; it means the effective interest rate is slightly lower than if the same annual rate were compounded monthly (the US standard).</p>
              <p>Variable-rate mortgages in Canada, however, are typically compounded monthly, matching the frequency of the payments.</p>

              <h2>CMHC Insurance and the 20% Rule</h2>
              <p>In Canada, if your down payment is less than 20% of the home's purchase price, you must obtain mortgage default insurance. While there are private providers like Sagen and Canada Guaranty, this is most commonly provided by the <strong>Canada Mortgage and Housing Corporation (CMHC)</strong>.</p>
              <p>The insurance premium is a one-time fee calculated as a percentage of your loan amount. It decreases as your down payment increases:</p>
              <ul>
                <li><strong>5.0% to 9.99% Down:</strong> 4.00% Premium</li>
                <li><strong>10.0% to 14.99% Down:</strong> 3.10% Premium</li>
                <li><strong>15.0% to 19.99% Down:</strong> 2.80% Premium</li>
                <li><strong>20% or More Down:</strong> 0% Premium (Insurance not required)</li>
              </ul>
              <p>Most buyers choose to "roll" this premium into their mortgage balance rather than paying it upfront in cash.</p>

              <h2>Minimum Down Payment Requirements</h2>
              <p>Canada has a tiered system for minimum down payments designed to ensure housing market stability:</p>
              <ul>
                <li><strong>Price up to $500,000:</strong> 5% of the total price.</li>
                <li><strong>Price $500,001 to $999,999:</strong> 5% on the first $500k, and 10% on the remaining balance.</li>
                <li><strong>Price $1,000,000 or more:</strong> A flat 20% minimum is required (no CMHC insurance available for homes over $1M).</li>
              </ul>

              <h2>Amortization vs. Term</h2>
              <p>It is crucial to distinguish between the **amortization period** and the **mortgage term**.</p>
              <p>The <strong>Amortization Period</strong> is the total length of time it would take to pay off the mortgage in full (e.g., 25 years). For insured mortgages, the maximum amortization is 25 years. For uninsured mortgages (20% down or more), 30-year amortizations are common.</p>
              <p>The <strong>Mortgage Term</strong> is the length of your current contract with the lender (e.g., 5 years). At the end of the term, you must either pay off the remaining balance or "renew" your mortgage for a new term at the then-current market interest rates.</p>

              <h2>Closing Costs in Canada</h2>
              <p>In addition to your down payment, you should budget 1.5% to 4% of the purchase price for closing costs, which include:</p>
              <ul>
                <li><strong>Land Transfer Tax:</strong> Varies by province (and city, in Toronto's case).</li>
                <li><strong>Legal Fees:</strong> Usually $1,000 - $2,500.</li>
                <li><strong>Title Insurance:</strong> $250 - $500.</li>
                <li><strong>Appraisal Fee:</strong> $300 - $500.</li>
                <li><strong>PST on CMHC Premium:</strong> In provinces like Ontario, Quebec, and Saskatchewan, you must pay provincial sales tax on the insurance premium upfront, even if the premium itself is rolled into the loan.</li>
              </ul>
            </article>

            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/canadian-mortgage-calculator" />
            <PopularCalculators exclude="/calculator/canadian-mortgage-calculator" />
          </div>

          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[250px]" label="Canada Sidebar Ad" />
            <AdPlaceholder className="min-h-[600px]" label="Sticky Canada Ad" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default CanadianMortgageCalculator;

