"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Calculator } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

interface BiweeklyMortgageInputs {
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  extraBiWeeklyPayment: number;
}

interface BiweeklyMortgageResults {
  monthlyPayment: number;
  biWeeklyPayment: number;
  standardTotalInterest: number;
  biWeeklyTotalInterest: number;
  interestSaved: number;
  timeSavedYears: number;
  payoffYears: number;
  standardTotalPaid: number;
  biWeeklyTotalPaid: number;
}

const DEFAULTS = {
  loanAmount: "300000",
  interestRate: "6.5",
  loanTerm: "30",
  extraBiWeeklyPayment: "0",
};

const calculateBiweeklyMortgage = (inputs: BiweeklyMortgageInputs): BiweeklyMortgageResults => {
  const { loanAmount: P, interestRate, loanTerm, extraBiWeeklyPayment } = inputs;
  
  if (P <= 0 || interestRate <= 0 || loanTerm <= 0) {
    return {
      monthlyPayment: 0, biWeeklyPayment: 0, standardTotalInterest: 0,
      biWeeklyTotalInterest: 0, interestSaved: 0, timeSavedYears: 0, payoffYears: 0,
      standardTotalPaid: 0, biWeeklyTotalPaid: 0
    };
  }

  const monthlyRate = (interestRate / 100) / 12;
  const totalMonths = loanTerm * 12;

  // Standard Monthly Payment
  const M = P * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
  const standardTotalInterest = (M * totalMonths) - P;
  const standardTotalPaid = M * totalMonths;

  // Bi-Weekly Payment
  const baseBiWeeklyPayment = M / 2;
  const totalBiWeeklyPayment = baseBiWeeklyPayment + extraBiWeeklyPayment;

  // Exact bi-weekly simulation
  const dailyRate = (interestRate / 100) / 365;
  let balance = P;
  let totalInterestBiWeekly = 0;
  let biWeeklyPaymentsCount = 0;

  while (balance > 0.01 && biWeeklyPaymentsCount < 10000) {
    biWeeklyPaymentsCount++;
    // Interest accrues over 14 days
    const interestForPeriod = balance * dailyRate * 14;
    totalInterestBiWeekly += interestForPeriod;
    
    let principalPaid = totalBiWeeklyPayment - interestForPeriod;
    if (principalPaid > balance) principalPaid = balance;
    
    balance -= principalPaid;
  }

  const payoffYears = (biWeeklyPaymentsCount * 14) / 365;
  const timeSavedYears = Math.max(0, loanTerm - payoffYears);
  const interestSaved = Math.max(0, standardTotalInterest - totalInterestBiWeekly);
  const biWeeklyTotalPaid = P + totalInterestBiWeekly;

  return {
    monthlyPayment: M,
    biWeeklyPayment: totalBiWeeklyPayment,
    standardTotalInterest,
    biWeeklyTotalInterest: totalInterestBiWeekly,
    interestSaved,
    timeSavedYears,
    payoffYears,
    standardTotalPaid,
    biWeeklyTotalPaid
  };
};

const CompactInput = ({
  id,
  label,
  value,
  onChange,
  prefix,
  suffix,
  type = "number",
  ...props
}: {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  prefix?: string;
  suffix?: string;
  type?: string;
  [key: string]: unknown;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && (
        <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">
          {prefix}
        </span>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
        {...props}
      />
      {suffix && (
        <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">
          {suffix}
        </span>
      )}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold text-muted-foreground mb-0.5">{payload[0].name}</p>
        <p className="text-primary font-extrabold text-sm">${payload[0].value.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

const BiWeeklyMortgageCalculator = () => {
  const [loanAmount, setLoanAmount] = useState(DEFAULTS.loanAmount);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [loanTerm, setLoanTerm] = useState(DEFAULTS.loanTerm);
  const [extraBiWeeklyPayment, setExtraBiWeeklyPayment] = useState(DEFAULTS.extraBiWeeklyPayment);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState<BiweeklyMortgageResults | null>(null);

  // Initial calculation on mount
  useEffect(() => {
    handleCalculate();
  }, []);

  const handleCalculate = () => {
    const inputs: BiweeklyMortgageInputs = {
      loanAmount: parseFloat(loanAmount) || 0,
      interestRate: parseFloat(interestRate) || 0,
      loanTerm: parseFloat(loanTerm) || 0,
      extraBiWeeklyPayment: parseFloat(extraBiWeeklyPayment) || 0,
    };
    setResults(calculateBiweeklyMortgage(inputs));
  };

  const reset = () => {
    setLoanAmount(DEFAULTS.loanAmount);
    setInterestRate(DEFAULTS.interestRate);
    setLoanTerm(DEFAULTS.loanTerm);
    setExtraBiWeeklyPayment(DEFAULTS.extraBiWeeklyPayment);
    setShowAdvanced(false);
    
    setResults(calculateBiweeklyMortgage({
      loanAmount: parseFloat(DEFAULTS.loanAmount),
      interestRate: parseFloat(DEFAULTS.interestRate),
      loanTerm: parseFloat(DEFAULTS.loanTerm),
      extraBiWeeklyPayment: parseFloat(DEFAULTS.extraBiWeeklyPayment)
    }));
  };

  const pieData = results ? [
    { name: "Principal", value: parseFloat(loanAmount) || 0, color: "hsl(var(--primary))" },
    { name: "Interest", value: results.biWeeklyTotalInterest, color: "#10b981" },
  ] : [];

  const faqs = [
    { question: "How does a bi-weekly mortgage save money?", answer: "There are 52 weeks in a year, which equals 26 bi-weekly periods. If you pay half your monthly mortgage payment every two weeks, you make 26 half-payments. This equals 13 full payments in a year, instead of the standard 12. That one extra payment goes entirely toward the principal, dramatically accelerating payoff." },
    { question: "Do I need a special bi-weekly loan?", answer: "No. You can manually achieve the exact same mathematical result by taking your normal monthly payment, dividing it by 12, and adding that amount as 'extra principal' to your regular monthly payment." },
    { question: "Should I sign up for my bank's bi-weekly program?", answer: "Be careful. Many banks charge setup fees ($200-$400) or monthly transaction fees for their official bi-weekly programs. It is almost always better to just manually send one extra payment per year, or add 1/12th extra to each monthly check, for free." },
    { question: "Can I add extra payments to a bi-weekly schedule?", answer: "Yes! Using the advanced options, you can add an extra amount to each of your 26 bi-weekly payments. This will pay off your loan even faster and save more in interest." },
    { question: "How is bi-weekly different from semi-monthly?", answer: "Bi-weekly means paying every 14 days (26 payments per year). Semi-monthly means paying twice a month, usually on the 1st and 15th (24 payments per year). Semi-monthly does not result in an extra yearly payment, so it doesn't offer the same massive interest savings as bi-weekly." },
    { question: "Does my lender apply the payment immediately?", answer: "This depends on your lender. Some lenders hold the bi-weekly payments in a suspense account and only apply them once a month. To get the maximum benefit, ensure your lender applies partial payments immediately to reduce your daily average balance." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Bi-Weekly Mortgage Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Bi-Weekly Mortgage Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT COLUMN: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            {/* Normal Tier */}
            <div className="flex flex-col gap-4">
              <CompactInput
                id="loan-amount"
                label="Loan Amount"
                value={loanAmount}
                onChange={setLoanAmount}
                prefix="$"
              />
              <CompactInput
                id="interest-rate"
                label="Interest Rate"
                value={interestRate}
                onChange={setInterestRate}
                suffix="%"
              />
              <CompactInput
                id="loan-term"
                label="Loan Term"
                value={loanTerm}
                onChange={setLoanTerm}
                suffix="years"
              />
            </div>

            {/* Advanced Tier */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>

              {showAdvanced && (
                <div className="grid grid-cols-1 gap-3 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Extra Payments</div>
                  <CompactInput
                    id="extra-payment"
                    label="Extra Bi-Weekly Payment"
                    value={extraBiWeeklyPayment}
                    onChange={setExtraBiWeeklyPayment}
                    prefix="$"
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 mt-2">
              <button
                type="button"
                onClick={handleCalculate}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={reset}
                className="w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center focus:outline-none"
                aria-label="Reset"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: RESULTS */}
          <div className="flex flex-col gap-4">
            {results && (
              <>
                {/* 1. Primary Result Card */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-1">Total Interest Saved</p>
                  <p className="text-4xl font-black text-primary">${results.interestSaved.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    By switching to bi-weekly payments, you'll pay off your loan <strong>{results.timeSavedYears.toFixed(1)} years</strong> earlier.
                  </p>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card divide-x divide-border">
                  <div className="p-4 flex flex-col items-center justify-center text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Time Saved</p>
                    <p className="text-lg font-bold text-green-600">{results.timeSavedYears.toFixed(1)} yrs</p>
                  </div>
                  <div className="p-4 flex flex-col items-center justify-center text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Bi-Weekly Pmt</p>
                    <p className="text-lg font-bold">${results.biWeeklyPayment.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="p-4 flex flex-col items-center justify-center text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Payoff Time</p>
                    <p className="text-lg font-bold text-primary">{results.payoffYears.toFixed(1)} yrs</p>
                  </div>
                </div>

                {/* 3. Breakdown Table */}
                <div className="border border-border rounded-lg overflow-hidden bg-card">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <th className="text-left font-semibold text-muted-foreground px-4 py-3 uppercase text-xs tracking-wide">Metric</th>
                        <th className="text-right font-semibold text-muted-foreground px-4 py-3 uppercase text-xs tracking-wide">Standard Monthly</th>
                        <th className="text-right font-semibold text-muted-foreground px-4 py-3 uppercase text-xs tracking-wide">Bi-Weekly</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr>
                        <td className="px-4 py-3 font-medium text-foreground">Payment Amount</td>
                        <td className="px-4 py-3 text-right">${results.monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo</td>
                        <td className="px-4 py-3 text-right">${results.biWeeklyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/2wks</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-foreground">Total Payments/Year</td>
                        <td className="px-4 py-3 text-right">12</td>
                        <td className="px-4 py-3 text-right">26</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-foreground">Years to Payoff</td>
                        <td className="px-4 py-3 text-right">{parseFloat(loanTerm).toFixed(1)}</td>
                        <td className="px-4 py-3 text-right text-green-600 font-bold">{results.payoffYears.toFixed(1)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-foreground">Total Interest Paid</td>
                        <td className="px-4 py-3 text-right">${results.standardTotalInterest.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                        <td className="px-4 py-3 text-right text-green-600 font-bold">${results.biWeeklyTotalInterest.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                      </tr>
                      <tr className="bg-muted/20 font-bold">
                        <td className="px-4 py-3 text-foreground">Total Cost of Loan</td>
                        <td className="px-4 py-3 text-right">${results.standardTotalPaid.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                        <td className="px-4 py-3 text-right text-primary">${results.biWeeklyTotalPaid.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* 4. Chart - Recharts */}
                  <div className="border border-border rounded-lg bg-card p-4 flex flex-col">
                    <p className="text-sm font-semibold text-foreground mb-4 text-center">Bi-Weekly Payment Breakdown</p>
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 mt-2">
                      {pieData.map((entry, index) => (
                        <div key={index} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: entry.color }}></div>
                          {entry.name}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 5. Summary Statistics */}
                  <div className="bg-muted/30 rounded-lg p-5">
                    <h3 className="text-base font-semibold mb-4">Loan Summary</h3>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Loan Amt</span>
                        <span className="text-sm font-medium">${parseFloat(loanAmount).toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Interest Rate</span>
                        <span className="text-sm font-medium">{interestRate}%</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Standard Int</span>
                        <span className="text-sm font-medium">${results.standardTotalInterest.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Bi-Weekly Int</span>
                        <span className="text-sm font-medium">${results.biWeeklyTotalInterest.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border flex justify-between items-center">
                      <span className="text-sm font-bold text-foreground">Interest Saved</span>
                      <span className="text-base font-black text-primary">${results.interestSaved.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                    </div>
                  </div>
                </div>

              </>
            )}
          </div>
        </div>

        {/* SEO CONTENT SECTION */}
        <div className="max-w-[1180px] mt-12">
          <AdPlaceholder className="mb-10" />
          
          <article className="prose-finance text-[15.75px]">
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-3">What Is a Bi-Weekly Mortgage Calculator?</h2>
              <p>
                A bi-weekly mortgage calculator is a financial tool designed to show you exactly how much money and time you can save by altering your mortgage payment schedule. Instead of making one standard payment per month, a bi-weekly schedule splits that monthly payment in half, requiring you to make payments every 14 days. 
              </p>
              <p>
                Because there are 52 weeks in a calendar year, paying every two weeks results in 26 half-payments. This perfectly equals 13 full payments over the course of the year. This calculator is primarily used by homeowners who want to pay off their mortgages years early and save tens of thousands of dollars in interest without significantly changing their monthly budget.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-3">How It Works (The Math Behind It)</h2>
              <p>
                The underlying math of this strategy relies on the standard amortization formula combined with accelerated principal reduction. The standard monthly payment <code>M</code> is calculated as:
              </p>
              <p>
                <code>M = P[r(1+r)^n] / [(1+r)^n - 1]</code>
              </p>
              <p>
                Where <code>P</code> is the principal loan amount, <code>r</code> is the monthly interest rate, and <code>n</code> is the total number of months in the loan term.
              </p>
              <p>
                When you switch to a bi-weekly schedule, your payment is exactly <code>M / 2</code>. However, because you make this payment 26 times a year, the total amount paid annually is <code>13 * M</code> instead of <code>12 * M</code>. The extra full payment is applied entirely to the principal balance, which violently decreases the balance upon which future interest is calculated, triggering a compounding savings effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p>
                The primary result card displays your <strong>Total Interest Saved</strong>. This is the difference between the total interest you would pay over the standard 30-year (or 15-year) schedule and the interest paid on the accelerated bi-weekly schedule. 
              </p>
              <p>
                The <strong>Time Saved</strong> metric indicates how many years early you will burn your mortgage documents. The breakdown table provides a side-by-side comparison of the standard vs. bi-weekly approach, clearly outlining your total cost of loan in both scenarios. Remember that the "extra" money isn't lost; it goes directly into your home equity.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-3">Key Factors & Inputs</h2>
              <p>
                The Normal tier inputs are the basics needed to calculate your amortization:
                <p><strong>Loan Amount:</strong> The remaining principal balance of your mortgage.</p>
                <p><strong>Interest Rate:</strong> Your annual percentage rate (APR).</p>
                <p><strong>Loan Term:</strong> The original (or remaining) length of the loan in years.</p>
              </p>
              <p>
                The <strong>Advanced Options</strong> tier allows for more precise power-user forecasting.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-3">Advanced Features</h2>
              <p>
                Our Advanced Options include the ability to add an <strong>Extra Bi-Weekly Payment</strong>. This is crucial for borrowers who not only want to leverage the 13th payment effect but also have extra cash flow to aggressively attack the debt. By adding even $50 extra every two weeks, you can shave additional years off the mortgage and compound the interest savings exponentially.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-3">Practical Examples</h2>
              <p>
                <strong>Scenario A: Standard 30-Year Loan.</strong> Assume a $300,000 mortgage at 6.5% interest. The standard monthly payment is $1,896.20. Over 30 years, you will pay $382,633 in interest alone.
              </p>
              <p>
                <strong>Scenario B: Bi-Weekly Power.</strong> Taking that same $300,000 loan, you pay $948.10 every two weeks. You will pay off the loan in just 23.4 years and save $96,000 in interest. 
              </p>
              <p>
                <strong>Scenario C: Advanced Options.</strong> You use the bi-weekly schedule ($948.10) but add an extra $50 to each payment ($998.10 total). You now pay off the loan in 21.2 years and save over $120,000 in interest!
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-3">Tips & Best Practices</h2>
              <p>
                Never pay a third-party company or your bank a setup fee to enroll in a bi-weekly program. You can easily achieve this yourself by simply dividing your monthly payment by 12, and adding that amount to your principal payment each month. Alternatively, you can set up automated transfers from your checking to a separate savings account every time you get paid (bi-weekly), and then make one massive extra principal payment at the end of the year.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">Benefits of Using This Calculator</h2>
              <p>
                This calculator provides an exact, mathematically sound comparison of your payment options. It allows you to visualize the massive long-term benefits of minor short-term cash flow adjustments. By making informed decisions today, you can guarantee a debt-free future decades ahead of schedule.
              </p>
            </section>
          </article>

          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/bi-weekly-mortgage" />
          <PopularCalculators exclude="/calculator/biweekly-mortgage-calculator" />
        </div>
      </div>
    </>
  );
};

export default BiWeeklyMortgageCalculator;
