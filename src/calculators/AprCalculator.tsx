"use client";

import React, { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import { Calculator, RotateCcw, ChevronDown, ChevronUp, Printer } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

// 1. TypeScript Interfaces
interface AprInputs {
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  originationFee: number;
  otherFees: number;
}

interface AprResults {
  monthlyPayment: number;
  apr: number;
  totalInterest: number;
  totalPaid: number;
  fees: number;
  netAmount: number;
  chartData: Array<{ name: string; value: number }>;
}

// 2. Pure Calculation Function
const calculateApr = (inputs: AprInputs): AprResults => {
  const p = inputs.loanAmount;
  const nomRate = inputs.interestRate / 100 / 12;
  const n = inputs.loanTerm;
  const fees = inputs.originationFee + inputs.otherFees;

  if (p <= 0 || inputs.interestRate < 0 || n <= 0) {
    return {
      monthlyPayment: 0,
      apr: 0,
      totalInterest: 0,
      totalPaid: 0,
      fees,
      netAmount: 0,
      chartData: []
    };
  }

  // Stated monthly payment
  const monthlyPayment = nomRate > 0
    ? (p * nomRate * Math.pow(1 + nomRate, n)) / (Math.pow(1 + nomRate, n) - 1)
    : p / n;

  // Net amount received (principal minus fees)
  const netAmount = p - fees;

  // Find APR using Newton-Raphson
  let aprMonthly = nomRate || 0.001;
  for (let i = 0; i < 100; i++) {
    const pv = monthlyPayment * (1 - Math.pow(1 + aprMonthly, -n)) / aprMonthly;
    const f = pv - netAmount;
    const df = monthlyPayment * (n * Math.pow(1 + aprMonthly, -(n + 1)) / aprMonthly - (1 - Math.pow(1 + aprMonthly, -n)) / (aprMonthly * aprMonthly));
    aprMonthly = aprMonthly - f / df;
    if (Math.abs(f) < 0.0001) break;
  }

  const apr = aprMonthly * 12 * 100;
  const totalPaid = monthlyPayment * n;
  const totalInterest = totalPaid - p;

  const chartData = [
    { name: "Principal", value: p - fees },
    { name: "Total Interest", value: totalInterest },
    { name: "Total Fees", value: fees }
  ];

  return {
    monthlyPayment,
    apr,
    totalInterest,
    totalPaid,
    fees,
    netAmount,
    chartData
  };
};

// 3. Realistic Industry Standard Defaults
const DEFAULTS = {
  loanAmount: "10000",
  interestRate: "8",
  loanTerm: "36",
  originationFee: "200",
  otherFees: "50"
};

const AprCalculator = () => {
  const [loanAmount, setLoanAmount] = useState(DEFAULTS.loanAmount);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [loanTerm, setLoanTerm] = useState(DEFAULTS.loanTerm);
  const [originationFee, setOriginationFee] = useState(DEFAULTS.originationFee);
  const [otherFees, setOtherFees] = useState(DEFAULTS.otherFees);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState<AprResults | null>(null);

  const performCalculation = () => {
    const inputs: AprInputs = {
      loanAmount: parseFloat(loanAmount) || 0,
      interestRate: parseFloat(interestRate) || 0,
      loanTerm: parseFloat(loanTerm) || 0,
      originationFee: parseFloat(originationFee) || 0,
      otherFees: parseFloat(otherFees) || 0,
    };
    setResults(calculateApr(inputs));
  };

  useEffect(() => {
    performCalculation();
  }, []);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    performCalculation();
  };

  const reset = () => {
    setLoanAmount(DEFAULTS.loanAmount);
    setInterestRate(DEFAULTS.interestRate);
    setLoanTerm(DEFAULTS.loanTerm);
    setOriginationFee(DEFAULTS.originationFee);
    setOtherFees(DEFAULTS.otherFees);
    setShowAdvanced(false);
    setTimeout(() => {
      setResults(calculateApr({
        loanAmount: parseFloat(DEFAULTS.loanAmount),
        interestRate: parseFloat(DEFAULTS.interestRate),
        loanTerm: parseFloat(DEFAULTS.loanTerm),
        originationFee: parseFloat(DEFAULTS.originationFee),
        otherFees: parseFloat(DEFAULTS.otherFees)
      }));
    }, 0);
  };

  const COLORS = ['#2563eb', '#f59e0b', '#ef4444'];

  const faqs = [
    { question: "What is APR vs interest rate?", answer: "The interest rate is the base cost of borrowing the principal, expressed as a percentage. The APR (Annual Percentage Rate) includes the interest rate PLUS mandatory fees (like origination fees), giving you the true, higher annual cost of the loan." },
    { question: "Why is APR always higher than the interest rate?", answer: "Because APR incorporates upfront fees into the effective rate. Since you pay these fees out of the principal but are charged interest on the full amount, your true cost of borrowing is higher than the stated interest rate alone." },
    { question: "How do I use APR to compare loans?", answer: "Always compare APRs of loans with identical terms. A loan with a lower interest rate but high fees might have a higher APR (and cost more overall) than a loan with a slightly higher rate but zero fees." },
    { question: "Does a 0% APR mean the loan is completely free?", answer: "A true 0% APR means no interest and no fees. However, many '0% APR' credit card offers only apply to the interest. They may still charge a 3-5% balance transfer fee, which actually increases the effective cost." },
    { question: "Can the APR change during my loan?", answer: "If you have a fixed-rate loan, the APR will remain the same for the entire term. If you have an adjustable-rate or variable-rate loan, the APR will fluctuate as the underlying index rate changes." },
    { question: "What fees are included in APR?", answer: "Standard fees included in APR are origination fees, discount points, processing fees, and underwriting fees. Things generally NOT included are late fees, appraisal fees, or credit report fees." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Finance", href: "/finance" }, { label: "APR Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-1 tracking-tight text-foreground">APR Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          
          {/* LEFT COLUMN - INPUTS */}
          <div className="card-calculator flex flex-col gap-4 p-5 shadow-sm border border-border bg-card rounded-xl">
            <form onSubmit={handleCalculate} className="flex flex-col gap-4">
              <InputField id="amount" label="Loan Amount ($)" value={loanAmount} onChange={setLoanAmount} type="number" />
              <InputField id="rate" label="Stated Interest Rate (%)" value={interestRate} onChange={setInterestRate} type="number" />
              <InputField id="term" label="Loan Term (Months)" value={loanTerm} onChange={setLoanTerm} type="number" />

              <div className="border-t pt-3 mt-1">
                <button 
                  type="button" 
                  onClick={() => setShowAdvanced(!showAdvanced)} 
                  className="flex items-center justify-between w-full text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  Advanced Options (Fees)
                  {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {showAdvanced && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <InputField id="origfee" label="Origination Fee ($)" value={originationFee} onChange={setOriginationFee} type="number" />
                    <InputField id="otherfee" label="Other Fees ($)" value={otherFees} onChange={setOtherFees} type="number" />
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-2">
                <button type="submit" className="h-10 w-full bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">Calculate</button>
                <button type="button" onClick={reset} className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-lg border border-border hover:bg-secondary transition-colors text-muted-foreground" aria-label="Reset">
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN - RESULTS */}
          <div className="flex flex-col gap-4">
            {results && results.monthlyPayment > 0 && (
              <>
                {/* 1. Primary Result Card */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">True Annual Percentage Rate (APR)</p>
                  <p className="text-4xl font-bold text-primary mt-1">{results.apr.toFixed(3)}%</p>
                  <p className="text-sm text-muted-foreground mt-1">Compared to your stated rate of {interestRate}%</p>
                  <button className="absolute top-4 right-4 p-2 rounded-md hover:bg-primary/10 text-primary transition-colors" title="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-3 gap-0 bg-card border border-border rounded-lg overflow-hidden divide-x divide-border">
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase text-muted-foreground mb-1">Monthly Payment</p>
                    <p className="text-lg font-bold">${results.monthlyPayment.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase text-muted-foreground mb-1">Net Received</p>
                    <p className="text-lg font-bold">${results.netAmount.toLocaleString()}</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase text-muted-foreground mb-1">Total Interest</p>
                    <p className="text-lg font-bold text-red-500">${results.totalInterest.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* 3. Breakdown Table */}
                  <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <div className="bg-muted/50 px-4 py-2 border-b border-border">
                      <h3 className="text-sm font-semibold uppercase text-muted-foreground">Cost Breakdown</h3>
                    </div>
                    <div className="p-0">
                      <table className="w-full text-sm">
                        <tbody>
                          <tr className="border-b border-border/50">
                            <td className="py-2.5 px-4 text-muted-foreground">Loan Amount</td>
                            <td className="py-2.5 px-4 text-right font-medium">${parseFloat(loanAmount).toLocaleString()}</td>
                          </tr>
                          <tr className="border-b border-border/50">
                            <td className="py-2.5 px-4 text-muted-foreground">Upfront Fees</td>
                            <td className="py-2.5 px-4 text-right font-medium text-amber-500">${results.fees.toLocaleString()}</td>
                          </tr>
                          <tr className="border-b border-border/50">
                            <td className="py-2.5 px-4 font-semibold">Net Disbursed</td>
                            <td className="py-2.5 px-4 text-right font-bold text-green-600">${results.netAmount.toLocaleString()}</td>
                          </tr>
                          <tr className="border-b border-border/50">
                            <td className="py-2.5 px-4 text-muted-foreground">Total Interest Paid</td>
                            <td className="py-2.5 px-4 text-right font-medium text-red-500">${results.totalInterest.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                          </tr>
                          <tr className="bg-muted/10 border-t-2 border-border">
                            <td className="py-3 px-4 font-bold">Total Cost of Loan</td>
                            <td className="py-3 px-4 text-right font-bold text-primary">${results.totalPaid.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 4. Chart */}
                  <div className="bg-card border border-border rounded-lg p-4 flex flex-col items-center justify-center">
                    <h3 className="text-sm font-semibold text-muted-foreground w-full text-center mb-2">Total Payment Distribution</h3>
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={results.chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {results.chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `$${value.toLocaleString(undefined, {maximumFractionDigits: 0})}`} />
                          <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* 5. Summary Statistics */}
                <div className="bg-muted/30 border border-border rounded-lg p-5">
                  <h3 className="text-base font-semibold mb-3">Key Takeaways</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div className="text-muted-foreground">Total Payments:</div>
                    <div className="font-medium text-right">{loanTerm} payments</div>
                    <div className="text-muted-foreground">Fee Percentage:</div>
                    <div className="font-medium text-right">
                      {((results.fees / parseFloat(loanAmount)) * 100).toFixed(2)}% of loan
                    </div>
                    <div className="text-muted-foreground">Interest to Principal Ratio:</div>
                    <div className="font-medium text-right">
                      {((results.totalInterest / parseFloat(loanAmount)) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mx-auto mt-12">
          <AdPlaceholder className="mb-8" />
          <article className="prose prose-slate max-w-none lg:prose-lg dark:prose-invert">
            <h2>What Is an APR Calculator?</h2>
            <p>
              An <strong>APR Calculator</strong> (Annual Percentage Rate Calculator) is a financial tool designed to reveal the true cost of borrowing money. While most lenders advertise an attractive "interest rate," this number rarely tells the whole story. The interest rate only accounts for the base cost of borrowing the principal amount. The APR, however, encompasses both the interest rate <em>and</em> any mandatory upfront fees, providing a standardized, mathematically accurate annualized cost.
            </p>
            <p>
              By using an APR calculator, consumers can pierce through marketing jargon to compare loan offers on an apples-to-apples basis. Whether you are applying for a mortgage, an auto loan, or a personal loan, understanding your true APR ensures you aren't blindsided by hidden origination fees, closing costs, or processing charges that dramatically inflate your overall financial burden.
            </p>

            <h2>How the APR Formula Works</h2>
            <p>
              Unlike a simple interest calculation, computing APR requires solving for the internal rate of return (IRR) of a series of cash flows. In a standard installment loan, the borrower receives a lump sum upfront (the principal minus fees) and repays it in equal monthly installments over a specific term.
            </p>
            <p>
              The formula for determining the monthly payment (PMT) is standard: 
              <br />
              <strong>PMT = P * [ r * (1 + r)^n ] / [ (1 + r)^n - 1 ]</strong>
              <br />
              Where <strong>P</strong> is the principal loan amount, <strong>r</strong> is the monthly nominal interest rate, and <strong>n</strong> is the number of months.
            </p>
            <p>
              To find the APR, we must adjust the Principal (P) to the <em>Net Amount Received</em> (Principal - Fees). We then use a numerical method, typically the Newton-Raphson method, to iterate and find the new monthly rate (r_apr) that makes the present value of all monthly payments exactly equal to the Net Amount Received. Once r_apr is found, we multiply it by 12 and by 100 to get the annualized percentage. This mathematical complexity is why an automated APR calculator is essential.
            </p>

            <h2>Understanding Your Results</h2>
            <p>
              When you input your loan details into our calculator, the results panel provides several critical metrics. Understanding how to interpret each one is vital for making an informed financial decision:
            </p>
            <ul>
              <li><strong>True APR:</strong> The headline number. If your APR is significantly higher than your stated interest rate, it means the lender is charging heavy upfront fees.</li>
              <li><strong>Monthly Payment:</strong> Your actual out-of-pocket cash requirement every month. Note that the monthly payment is calculated using the stated interest rate and full principal, <em>not</em> the APR.</li>
              <li><strong>Net Disbursed:</strong> The actual cash you will receive in your bank account after the lender deducts origination fees or processing charges.</li>
              <li><strong>Total Interest Paid:</strong> The total amount of money you will pay purely in interest charges over the life of the loan.</li>
              <li><strong>Total Cost of Loan:</strong> The sum of your total interest and all upfront fees. This represents the absolute dollar amount it cost you to borrow the money.</li>
            </ul>

            <h2>Key Factors That Influence APR</h2>
            <p>
              Several variables directly impact your final Annual Percentage Rate. Changing any of these factors will alter the true cost of your loan:
            </p>
            <p>
              <strong>1. The Nominal Interest Rate:</strong> This is the baseline. A higher interest rate mathematically guarantees a higher APR, all else being equal. Your interest rate is heavily dependent on your credit score, market conditions, and loan type.
            </p>
            <p>
              <strong>2. Origination Fees:</strong> Often charged by personal loan providers and mortgage lenders, these are fees taken directly out of your loan proceeds before you receive the money. A $10,000 loan with a 5% origination fee means you only receive $9,500, but you pay interest as if you received $10,000. This causes the APR to spike.
            </p>
            <p>
              <strong>3. Loan Term:</strong> The length of the loan has a counterintuitive effect on APR. Because upfront fees are amortized over the life of the loan, a shorter loan term will cause the same flat fee to result in a <em>higher</em> APR compared to a longer term loan. However, shorter terms still result in less total interest paid overall.
            </p>

            <h2>Advanced Features: Handling Multiple Fees</h2>
            <p>
              Our calculator includes an Advanced Options toggle to account for complex loan structures. While some lenders only charge a flat "origination fee," mortgages and auto loans often feature a barrage of line-item costs: processing fees, document preparation fees, underwriting fees, and broker fees. By summing these up and inputting them into the "Other Fees" field, the calculator accurately bundles the total friction cost of the loan into the final APR equation.
            </p>

            <h2>Practical Examples of APR in Action</h2>
            <p>
              To illustrate why APR matters, let's look at two competing $10,000 personal loan offers with a 36-month term:
            </p>
            <p>
              <strong>Offer A:</strong> 8.0% Interest Rate with a $500 Origination Fee.<br/>
              <strong>Offer B:</strong> 10.0% Interest Rate with No Fees.
            </p>
            <p>
              At first glance, Offer A seems vastly superior because of the 8.0% rate. However, using the APR calculator, we see that Offer A has an APR of 11.53% because you are only receiving $9,500 while paying interest on $10,000. Offer B has an APR of 10.0% (equal to its interest rate because there are no fees). 
              <br/>
              By comparing APRs, it becomes mathematically obvious that Offer B is actually the cheaper loan, saving you money over the 3-year term.
            </p>

            <h2>Tips & Best Practices for Borrowers</h2>
            <p>
              <strong>Always Ask for the APR:</strong> Lenders are legally required by the Truth in Lending Act (TILA) to disclose the APR. Never accept a loan quote based solely on the monthly payment or nominal interest rate.
            </p>
            <p>
              <strong>Compare Identical Terms:</strong> Only use APR to compare loans that have the exact same duration. Comparing the APR of a 15-year mortgage against a 30-year mortgage will be misleading, as the amortization of upfront fees differs wildly over those two timeframes.
            </p>
            <p>
              <strong>Beware of 'Zero Percent' Tricks:</strong> Retailers and credit card companies frequently offer 0% APR promotions. Read the fine print to ensure there aren't hidden deferred interest clauses or balance transfer fees that retroactively apply a massive APR if the balance isn't paid in full before the promotional period ends.
            </p>

            <h2>Benefits of Using Our Calculator</h2>
            <p>
              Calculating APR by hand requires advanced calculus and iterative mathematical solving. Our tool performs thousands of calculations instantly, providing you with a high-fidelity look at your true borrowing costs. By leveraging the visual breakdowns, pie charts, and amortization summaries, you can confidently navigate lending offers, negotiate away junk fees, and secure the best possible financial terms for your future.
            </p>
          </article>

          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/apr" />
          <PopularCalculators exclude="/calculator/apr-calculator" />
        </div>
      </div>
    </>
  );
};

export default AprCalculator;
