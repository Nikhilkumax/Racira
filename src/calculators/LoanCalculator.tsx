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
import { ChevronDown, Printer, RotateCcw } from "lucide-react";

interface LoanResults {
  emi: number;
  totalInterest: number;
  totalPayment: number;
  effectiveRate: number;
  processingFeeAmt: number;
  prepaymentSavings: number;
  timeSavedMonths: number;
  monthlyRows: AmortRow[];
  yearlyRows: AmortRow[];
}

const LoanCalculator = () => {
  const [loanAmount, setLoanAmount] = useState("500000");
  const [interestRate, setInterestRate] = useState("8.5");
  const [loanTerm, setLoanTerm] = useState("5");
  const [termUnit, setTermUnit] = useState<"years" | "months">("years");

  // Advanced
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [processingFee, setProcessingFee] = useState("1");
  const [feeType, setFeeType] = useState<"percent" | "flat">("percent");
  const [prepaymentAmount, setPrepaymentAmount] = useState("0");
  const [prepaymentMonth, setPrepaymentMonth] = useState("12");
  const [emiFreq, setEmiFreq] = useState<"monthly" | "quarterly">("monthly");

  const [results, setResults] = useState<LoanResults | null>(null);
  const [viewMode, setViewMode] = useState<"monthly" | "yearly">("yearly");
  const printRef = useRef<HTMLDivElement>(null);

  const calculate = () => {
    const P = parseFloat(loanAmount) || 0;
    const annualRate = parseFloat(interestRate) || 0;
    const termVal = parseFloat(loanTerm) || 0;
    const n = termUnit === "years" ? termVal * 12 : termVal;
    const r = annualRate / 100 / 12;
    const prepay = parseFloat(prepaymentAmount) || 0;
    const prepayMonth = parseInt(prepaymentMonth) || 0;

    if (P <= 0 || r <= 0 || n <= 0) return;

    // Processing fee
    let feeAmt = 0;
    if (feeType === "percent") feeAmt = P * ((parseFloat(processingFee) || 0) / 100);
    else feeAmt = parseFloat(processingFee) || 0;

    const EMI = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalWithoutPrepay = EMI * n;
    const totalInterestBase = totalWithoutPrepay - P;

    // Build amortization with prepayment
    let balance = P;
    const monthlyRows: AmortRow[] = [];
    let totalPaid = 0;
    let month = 0;

    while (balance > 0.01 && month < n * 2) {
      month++;
      const intPayment = balance * r;
      let prinPayment = EMI - intPayment;
      let extra = 0;
      if (prepay > 0 && month === prepayMonth) {
        extra = Math.min(prepay, balance - prinPayment);
        prinPayment += extra;
      }
      if (prinPayment > balance) prinPayment = balance;
      balance -= prinPayment;
      const payment = intPayment + prinPayment;
      totalPaid += payment;
      monthlyRows.push({
        period: month,
        payment,
        principal: prinPayment,
        interest: intPayment,
        balance: Math.max(0, balance),
      });
    }

    // Yearly
    const yearlyRows: AmortRow[] = [];
    for (let y = 0; y < Math.ceil(monthlyRows.length / 12); y++) {
      const slice = monthlyRows.slice(y * 12, (y + 1) * 12);
      if (!slice.length) break;
      yearlyRows.push({
        period: y + 1,
        payment: slice.reduce((s, r) => s + r.payment, 0),
        principal: slice.reduce((s, r) => s + r.principal, 0),
        interest: slice.reduce((s, r) => s + r.interest, 0),
        balance: slice[slice.length - 1].balance,
      });
    }

    // Effective rate includes processing fee
    const totalCostWithFee = totalPaid + feeAmt;
    const effectiveRate = feeAmt > 0 ? ((totalCostWithFee / P - 1) / (n / 12)) * 100 : annualRate;

    setResults({
      emi: EMI,
      totalInterest: totalPaid - P,
      totalPayment: totalPaid,
      effectiveRate,
      processingFeeAmt: feeAmt,
      prepaymentSavings: prepay > 0 ? totalInterestBase - (totalPaid - P) : 0,
      timeSavedMonths: prepay > 0 ? n - month : 0,
      monthlyRows,
      yearlyRows,
    });
  };

  const reset = () => {
    setLoanAmount("500000"); setInterestRate("8.5"); setLoanTerm("5");
    setProcessingFee("1"); setPrepaymentAmount("0"); setPrepaymentMonth("12");
    setResults(null);
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Loan Amortization – RaciraCalculator</title>
      <style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:13px}
      th,td{border:1px solid #ddd;padding:6px 10px;text-align:right}th{background:#f5f5f5;text-align:left}
      h2{margin-bottom:1rem}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "What is an EMI calculator?", answer: "An EMI (Equated Monthly Installment) calculator helps you determine the fixed monthly payment for a loan based on the principal amount, interest rate, and tenure. It uses the standard reducing balance formula to give you an accurate estimate of your monthly obligation." },
    { question: "How is EMI calculated?", answer: "EMI is calculated using the formula: EMI = P × r × (1+r)^n / [(1+r)^n – 1], where P is the principal loan amount, r is the monthly interest rate, and n is the total number of monthly installments." },
    { question: "What is the difference between flat rate and reducing balance?", answer: "In a flat rate, interest is calculated on the entire principal throughout the tenure. In reducing balance (used in our calculator), interest is calculated on the remaining principal, resulting in lower total interest paid." },
    { question: "What is a processing fee?", answer: "A processing fee is a one-time charge by the lender for processing your loan application. It typically ranges from 0.5% to 2% of the loan amount. Our calculator shows how this affects your effective interest rate." },
    { question: "How do prepayments help?", answer: "Making a lump-sum prepayment reduces your outstanding principal, which means less interest accrues in future months. This can significantly reduce both your total interest paid and the remaining loan tenure." },
    { question: "What is the effective interest rate?", answer: "The effective interest rate accounts for all costs of borrowing, including processing fees. It gives you the true cost of the loan as a percentage, which is always higher than the nominal rate when fees are included." },
  ];

  return (
    <>
<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Loan EMI Calculator" }]} />

      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Loan EMI Calculator</h1>
            <p className="text-muted-foreground mb-8">Calculate your equated monthly installments, total interest, effective rate, and view a detailed amortization schedule.</p>

            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="loan-amount" label="Loan Amount" value={loanAmount} onChange={setLoanAmount} prefix="$" tooltip="Total principal amount you wish to borrow." />
                <InputField id="interest-rate" label="Interest Rate" value={interestRate} onChange={setInterestRate} suffix="%" tooltip="Annual interest rate charged by the lender." />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Loan Term</label>
                  <div className="flex gap-2">
                    <input type="number" value={loanTerm} onChange={(e) => setLoanTerm(e.target.value)} className="input-calc flex-1" aria-label="Loan term" />
                    <div className="flex rounded-lg border border-input overflow-hidden">
                      <button type="button" onClick={() => setTermUnit("years")} className={`px-3 py-2 text-xs font-medium ${termUnit === "years" ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}>Years</button>
                      <button type="button" onClick={() => setTermUnit("months")} className={`px-3 py-2 text-xs font-medium ${termUnit === "months" ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}>Months</button>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">EMI Frequency</label>
                  <div className="flex rounded-lg border border-input overflow-hidden">
                    <button type="button" onClick={() => setEmiFreq("monthly")} className={`flex-1 py-3 text-sm font-medium ${emiFreq === "monthly" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Monthly</button>
                    <button type="button" onClick={() => setEmiFreq("quarterly")} className={`flex-1 py-3 text-sm font-medium ${emiFreq === "quarterly" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Quarterly</button>
                  </div>
                </div>
              </div>

              {/* Advanced */}
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 text-sm font-medium text-accent hover:underline mb-4">
                Advanced Options
                <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>

              {showAdvanced && (
                <div className="grid sm:grid-cols-2 gap-5 mb-6 p-4 rounded-lg bg-secondary/30 border border-border">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm font-medium text-foreground">Processing Fee</label>
                      <div className="flex rounded-md border border-input overflow-hidden text-xs">
                        <button type="button" onClick={() => setFeeType("percent")} className={`px-2 py-0.5 ${feeType === "percent" ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}>%</button>
                        <button type="button" onClick={() => setFeeType("flat")} className={`px-2 py-0.5 ${feeType === "flat" ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}>$</button>
                      </div>
                    </div>
                    <input type="number" value={processingFee} onChange={(e) => setProcessingFee(e.target.value)} className="input-calc" aria-label="Processing fee" />
                  </div>
                  <InputField id="prepay-amount" label="Prepayment Amount" value={prepaymentAmount} onChange={setPrepaymentAmount} prefix="$" tooltip="Lump-sum payment to reduce principal at a specific month." />
                  <InputField id="prepay-month" label="Prepayment at Month #" value={prepaymentMonth} onChange={setPrepaymentMonth} tooltip="The month number at which the prepayment is applied." />
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={calculate} className="btn-calculate flex-1">Calculate EMI</button>
                <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Results */}
            {results && (
              <div className="card-calculator mb-8" ref={printRef}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">EMI Results</h2>
                  <button onClick={handlePrint} className="flex items-center gap-1.5 text-sm text-accent hover:underline">
                    <Printer className="h-4 w-4" /> Print
                  </button>
                </div>

                <ResultDisplay items={[
                  { label: "Monthly EMI", value: results.emi, highlight: true },
                  { label: "Total Interest", value: results.totalInterest },
                  { label: "Total Payment", value: results.totalPayment },
                  { label: "Processing Fee", value: results.processingFeeAmt },
                  { label: "Effective Rate", value: 0, textValue: `${results.effectiveRate.toFixed(2)}%` },
                  ...(results.prepaymentSavings > 0 ? [
                    { label: "Prepayment Savings", value: Math.max(0, results.prepaymentSavings), highlight: true },
                  ] : []),
                ]} />

                {results.timeSavedMonths > 0 && (
                  <div className="mt-3 p-3 rounded-lg bg-accent/5 border border-accent/20 text-sm text-accent font-medium text-center">
                    Prepayment saves {Math.floor(results.timeSavedMonths / 12)}y {results.timeSavedMonths % 12}m on your loan term
                  </div>
                )}

                <div className="mt-6 flex justify-center">
                  <PieChart
                    segments={[
                      { label: "Principal", value: parseFloat(loanAmount) || 0, color: "hsl(211, 100%, 50%)" },
                      { label: "Interest", value: results.totalInterest, color: "hsl(220, 60%, 20%)" },
                      ...(results.processingFeeAmt > 0 ? [{ label: "Processing Fee", value: results.processingFeeAmt, color: "hsl(210, 30%, 75%)" }] : []),
                    ]}
                    size={180}
                  />
                </div>

                <div className="mt-6">
                  <div className="flex gap-2 mb-2">
                    <button onClick={() => setViewMode("yearly")} className={`px-3 py-1 rounded-md text-sm ${viewMode === "yearly" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Yearly</button>
                    <button onClick={() => setViewMode("monthly")} className={`px-3 py-1 rounded-md text-sm ${viewMode === "monthly" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Monthly</button>
                  </div>
                  <AmortizationTable rows={viewMode === "yearly" ? results.yearlyRows : results.monthlyRows} yearly={viewMode === "yearly"} />
                </div>
              </div>
            )}

            <AdPlaceholder className="mb-10" label="Ad Space – In Content" />

            <article className="prose-finance">
              <h2>What Is a Loan EMI Calculator?</h2>
              <p>An EMI (Equated Monthly Installment) calculator is a financial tool that helps you determine the fixed monthly payment required to repay a loan over a specified period. It accounts for the loan principal, interest rate, and tenure to compute your exact monthly obligation using the reducing balance method.</p>
              <p>Our professional-grade calculator goes beyond basic EMI computation. It includes processing fee analysis to show your effective interest rate, prepayment modeling to demonstrate potential savings, and a detailed amortization schedule so you can track your loan balance month by month.</p>

              <h2>How EMI Is Calculated</h2>
              <p>EMI uses the standard amortization formula: EMI = P × r × (1+r)^n / [(1+r)^n – 1], where P is the principal, r is the monthly interest rate (annual rate divided by 12), and n is the total number of monthly installments.</p>
              <p>For example, a $500,000 loan at 8.5% annual interest for 5 years (60 months) would have a monthly EMI of approximately $10,245. Over the full term, you'd pay about $114,727 in total interest, bringing the total repayment to $614,727.</p>

              <h2>Understanding Processing Fees</h2>
              <p>Most lenders charge a one-time processing fee when disbursing a loan, typically ranging from 0.5% to 3% of the loan amount. While this doesn't change your EMI, it increases the total cost of borrowing. Our calculator computes the effective interest rate — the true annual cost of the loan including all fees — so you can make accurate comparisons between lenders.</p>
              <p>For example, a $500,000 loan at 8.5% with a 1% processing fee ($5,000) has an effective cost higher than the stated rate. This difference matters most on shorter-term loans where the fee is amortized over fewer payments.</p>

              <h2>The Power of Prepayment</h2>
              <p>Making a lump-sum prepayment reduces your outstanding principal, which decreases the interest charged on all future EMIs. Even a single prepayment early in the loan term can save thousands in total interest and reduce your tenure by several months.</p>
              <p>Our calculator lets you specify both the amount and timing of a prepayment. Try different scenarios to see how a year-end bonus or tax refund could accelerate your debt freedom. Remember to check with your lender about prepayment penalties — some loans charge a fee for early repayment.</p>

              <h3>Example Prepayment Scenario</h3>
              <p>On a $500,000 loan at 8.5% for 5 years, making a $50,000 prepayment at month 12 could save approximately $15,000 in interest and shorten the term by 6 months. The earlier you make the prepayment, the greater the savings due to the compounding effect of interest reduction.</p>

              <h2>Flat Rate vs. Reducing Balance</h2>
              <p>There are two common methods of interest calculation. In the flat rate method, interest is calculated on the original loan amount for the entire tenure, resulting in a higher effective rate. In the reducing balance method (used in our calculator), interest is calculated on the remaining principal, which is fairer and results in lower total interest.</p>
              <p>When comparing loan offers, always check whether the quoted rate is flat or reducing. A 5% flat rate is roughly equivalent to a 9-10% reducing balance rate. Our calculator uses the reducing balance method, which is the standard for most bank loans worldwide.</p>

              <h2>Tips for Getting the Best Loan</h2>
              <ul>
                <li><strong>Compare effective rates:</strong> Don't just look at the stated interest rate. Factor in processing fees, insurance requirements, and any other charges.</li>
                <li><strong>Choose the right tenure:</strong> A shorter tenure means higher EMIs but significantly less total interest. A longer tenure keeps payments manageable but costs more overall.</li>
                <li><strong>Maintain good credit:</strong> A higher credit score typically qualifies you for lower interest rates, saving thousands over the life of the loan.</li>
                <li><strong>Plan for prepayment:</strong> If your loan allows penalty-free prepayment, plan to make lump-sum payments whenever possible to reduce your interest burden.</li>
              </ul>
            </article>

            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/loan" />
            <PopularCalculators exclude="/calculator/loan" />
          </div>

          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[250px]" label="Ad Space – Sidebar" />
            <AdPlaceholder className="min-h-[250px]" label="Ad Space – Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default LoanCalculator;

