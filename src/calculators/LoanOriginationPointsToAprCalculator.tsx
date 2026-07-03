"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Target, ChevronDown } from "lucide-react";

interface AprResult {
  monthlyPayment: number;
  totalFees: number;
  effectiveLoanAmount: number;
  trueApr: number;
  aprDifference: number;
  summaryStats: { label: string; value: string }[];
}

function calcApr(loanAmount: number, interestRate: number, loanTermYears: number, originationPoints: number, discountPoints: number, otherFees: number): AprResult {
  const r = interestRate / 100 / 12;
  const n = loanTermYears * 12;

  // Monthly payment based on nominal rate and full loan amount
  const monthlyPayment = loanAmount > 0 && n > 0
    ? (r > 0 ? loanAmount * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1) : loanAmount / n)
    : 0;

  const originationFeeAmt = loanAmount * (originationPoints / 100);
  const discountFeeAmt = loanAmount * (discountPoints / 100);
  const totalFees = originationFeeAmt + discountFeeAmt + otherFees;

  // Effective loan amount is the principal minus the fees paid upfront
  const effectiveLoanAmount = loanAmount - totalFees;

  // Calculate True APR using Newton-Raphson to find the internal rate of return
  let trueAprMonthly = r;
  if (effectiveLoanAmount > 0 && monthlyPayment > 0) {
    // Starting guess
    let guess = r;
    for (let i = 0; i < 20; i++) {
      const f = effectiveLoanAmount - monthlyPayment * ((1 - Math.pow(1 + guess, -n)) / guess);
      const fPrime = monthlyPayment * ((1 - Math.pow(1 + guess, -n)) / (guess * guess) - (n * Math.pow(1 + guess, -n - 1)) / guess);
      const newGuess = guess - f / fPrime;
      if (Math.abs(newGuess - guess) < 1e-7) {
        guess = newGuess;
        break;
      }
      guess = newGuess;
    }
    trueAprMonthly = guess;
  }
  const trueApr = trueAprMonthly * 12 * 100;
  const aprDifference = trueApr - interestRate;

  const summaryStats = [
    { label: "Nominal Interest Rate", value: `${interestRate.toFixed(3)}%` },
    { label: "Origination Fees", value: `$${originationFeeAmt.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Discount Points Cost", value: `$${discountFeeAmt.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Other Upfront Fees", value: `$${otherFees.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Upfront Costs", value: `$${totalFees.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  return { monthlyPayment, totalFees, effectiveLoanAmount, trueApr, aprDifference, summaryStats };
}

const DEFAULTS = { loanAmount: "300000", interestRate: "6.5", loanTermYears: "30", originationPoints: "1.0", discountPoints: "0.5", otherFees: "1500" };

const CompactInput = ({ id, label, value, onChange, prefix, suffix }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1.5">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground shrink-0">{prefix}</span>}
      <input id={id} type="number" value={value} onChange={e => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground shrink-0">{suffix}</span>}
    </div>
  </div>
);

export default function LoanOriginationPointsToAprCalculator() {
  const [loanAmount, setLoanAmount] = useState(DEFAULTS.loanAmount);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [loanTermYears, setLoanTermYears] = useState(DEFAULTS.loanTermYears);
  const [originationPoints, setOriginationPoints] = useState(DEFAULTS.originationPoints);
  const [discountPoints, setDiscountPoints] = useState(DEFAULTS.discountPoints);
  const [otherFees, setOtherFees] = useState(DEFAULTS.otherFees);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState<AprResult | null>(null);

  const calc = () => setResults(calcApr(parseFloat(loanAmount)||0, parseFloat(interestRate)||0, parseFloat(loanTermYears)||30, parseFloat(originationPoints)||0, parseFloat(discountPoints)||0, parseFloat(otherFees)||0));
  const reset = () => { setLoanAmount(DEFAULTS.loanAmount); setInterestRate(DEFAULTS.interestRate); setLoanTermYears(DEFAULTS.loanTermYears); setOriginationPoints(DEFAULTS.originationPoints); setDiscountPoints(DEFAULTS.discountPoints); setOtherFees(DEFAULTS.otherFees); setShowAdvanced(false); };
  useEffect(() => { calc(); }, []);

  const faqs = [
    { question: "What is the difference between APR and Interest Rate?", answer: "The interest rate is the percentage of the principal that the lender charges annually to borrow money. The Annual Percentage Rate (APR) goes further by reflecting the true cost of borrowing, incorporating both the interest rate and all upfront fees (like origination points, discount points, and underwriter fees) spread over the life of the loan." },
    { question: "What are origination points?", answer: "Origination points are fees charged by the lender to process, underwrite, and close your loan. One point equals 1% of the total loan amount. On a $300,000 loan, 1 origination point costs $3,000. These points do not lower your interest rate; they are simply the cost of doing business with that lender." },
    { question: "What are discount points?", answer: "Discount points are optional upfront fees paid directly to the lender at closing to permanently reduce your interest rate. Like origination points, one discount point equals 1% of the loan amount. Paying for discount points lowers your monthly payment, but increases your upfront closing costs." },
    { question: "Why does the APR go up when I pay points?", answer: "APR measures the total cost of credit. When you pay upfront fees (points), you effectively receive less useable money from the loan, but you are still making payments based on the full loan amount. This mathematical dynamic forces the effective Annual Percentage Rate (APR) higher than the nominal interest rate." },
    { question: "Is a lower APR always better?", answer: "Not necessarily. The APR calculation assumes you will keep the loan for the entire term (e.g., 30 years). If you sell the home or refinance after just 5 years, the heavy upfront fees that drove the APR calculation will actually cost you much more in the short term. Always compare the upfront costs against your expected time in the home." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator/finance" }, { label: "Loan Origination Points to APR Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Loan Origination Points to APR Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="loan" label="Loan Amount" value={loanAmount} onChange={setLoanAmount} prefix="$" />
              <CompactInput id="rate" label="Interest Rate" value={interestRate} onChange={setInterestRate} suffix="%" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="orig-pts" label="Origination Points" value={originationPoints} onChange={setOriginationPoints} suffix="pts" />
              <CompactInput id="term" label="Loan Term" value={loanTermYears} onChange={setLoanTermYears} suffix="years" />
            </div>
            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1">
                Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <CompactInput id="disc-pts" label="Discount Points" value={discountPoints} onChange={setDiscountPoints} suffix="pts" />
                  <CompactInput id="other" label="Other Closing Fees" value={otherFees} onChange={setOtherFees} prefix="$" />
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-2">
              <button type="button" onClick={calc} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="w-12 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {results && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">True Annual Percentage Rate (APR)</div>
                <div className="text-4xl font-bold text-foreground">{results.trueApr.toFixed(3)}%</div>
                <div className="text-sm text-muted-foreground mt-1 font-medium">This is {results.aprDifference.toFixed(3)}% higher than your nominal interest rate.</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Total Upfront Fees", `$${results.totalFees.toLocaleString("en-US",{maximumFractionDigits:0})}`], ["Monthly Payment", `$${results.monthlyPayment.toFixed(2)}`], ["Effective Loan", `$${results.effectiveLoanAmount.toLocaleString("en-US",{maximumFractionDigits:0})}`]].map(([l,v],i) => (
                  <div key={i} className={`p-4 text-center ${i>0?"border-l border-border":""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className={`text-lg font-bold ${i===0?"text-amber-600":""}`}>{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Fee Breakdown</h3>
                <div className="space-y-2.5">
                  {results.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-border/40 pb-2 last:border-0">
                      <span className="text-sm text-muted-foreground">{s.label}:</span>
                      <span className="text-sm font-semibold">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-secondary/30 border border-border rounded-lg p-4 text-sm text-muted-foreground">
                <p><strong>Note on Effective Loan Amount:</strong> To calculate APR, the total upfront fees are deducted from the principal to determine the "effective" loan amount you actually receive. The APR is the mathematical rate that equates this effective loan amount to your actual monthly payments over the full term.</p>
              </div>
            </>)}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding APR vs. Interest Rate</h2>
            <p>When shopping for a mortgage or business loan, the interest rate is often the headline number that catches your attention. However, federal law requires lenders to also display the Annual Percentage Rate (APR). While the interest rate represents the annual cost of the principal, the APR represents the true total cost of borrowing by factoring in upfront fees, origination points, and discount points over the life of the loan. A lender offering a rock-bottom interest rate may actually be the most expensive option if they charge excessive origination fees—the APR reveals this hidden cost.</p>
            
            <h2 className="text-2xl font-bold mb-3">What Are Points?</h2>
            <p>In mortgage lending, a "point" is equal to exactly 1% of your total loan amount. There are two distinct types of points that affect your APR differently. <strong>Origination points</strong> are fees the lender charges simply to process, underwrite, and close your loan. They do not lower your interest rate. <strong>Discount points</strong> are optional fees you pay upfront to permanently lower ("buy down") your interest rate over the life of the loan. Both types of points require cash at closing and both push your effective APR higher than your nominal interest rate.</p>

            <h2 className="text-2xl font-bold mb-3">How APR is Calculated</h2>
            <p>The math behind APR is complex, but the concept is straightforward. To find the true cost of credit, the calculation subtracts all upfront, non-refundable fees (points, underwriting fees, processing fees) from your loan amount to find the "effective loan amount" you actually receive. It then looks at the monthly payments you are required to make based on the full nominal loan amount. The APR is the mathematical internal rate of return that makes your stream of monthly payments equal to the effective loan amount you walked away with.</p>
            <p>For example, if you borrow $300,000 but pay $6,000 in upfront fees, you effectively only received $294,000. But you are still making monthly payments based on a $300,000 principal. This dynamic is why your APR is always higher than your interest rate when upfront fees are involved.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/loan-origination-points-to-apr-calculator" />
          <PopularCalculators exclude="/calculator/loan-origination-points-to-apr-calculator" />
        </div>
      </div>
    </>
  );
}
