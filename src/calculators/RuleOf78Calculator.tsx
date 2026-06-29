"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, TrendingDown } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface R78Results {
  totalInterest: number;
  monthlyPayment: number;
  totalPayments: number;
  earlyPayoffMonth: number;
  rebate: number;
  interestPaid: number;
  remainingBalance: number;
  penaltyVsSimple: number;
  schedule: { month: number; interestFraction: number; interestAmount: number; cumulativeInterest: number }[];
}

const CompactInput = ({
  id, label, value, onChange, prefix, suffix, type = "number", ...props
}: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  prefix?: string; suffix?: string; type?: string; [key: string]: any;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative flex items-center rounded-md border border-input bg-background h-9 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none shrink-0">{prefix}</span>}
      <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" {...props} />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const fmt = (n: number, decimals = 2) =>
  n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

function calcR78({ principal, annualRate, termMonths, payoffMonth }: {
  principal: number; annualRate: number; termMonths: number; payoffMonth: number;
}): R78Results {
  const monthlyRate = annualRate / 100 / 12;
  let monthlyPayment = 0;
  if (monthlyRate > 0) {
    monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
      (Math.pow(1 + monthlyRate, termMonths) - 1);
  } else {
    monthlyPayment = principal / termMonths;
  }
  const totalPayments = monthlyPayment * termMonths;
  const totalInterest = totalPayments - principal;

  // Rule of 78 sum of digits
  const sumAll = (termMonths * (termMonths + 1)) / 2;

  // Build schedule
  const schedule: R78Results["schedule"] = [];
  let cumulative = 0;
  for (let m = 1; m <= termMonths; m++) {
    const weight = termMonths - m + 1;
    const fraction = weight / sumAll;
    const amount = fraction * totalInterest;
    cumulative += amount;
    schedule.push({ month: m, interestFraction: fraction * 100, interestAmount: amount, cumulativeInterest: cumulative });
  }

  // Payoff at specific month
  const pm = Math.max(1, Math.min(payoffMonth, termMonths - 1));
  const sumRemaining = ((termMonths - pm) * (termMonths - pm + 1)) / 2;
  const rebate = (sumRemaining / sumAll) * totalInterest;
  const paidSoFar = pm * monthlyPayment;
  const interestPaid = schedule.slice(0, pm).reduce((s, r) => s + r.interestAmount, 0);
  const principalPaid = paidSoFar - interestPaid;
  const remainingBalance = principal - principalPaid - rebate;

  // vs simple interest
  const simpleInterest = principal * (annualRate / 100 / 12) * termMonths;
  const penaltyVsSimple = totalInterest - simpleInterest;

  return {
    totalInterest, monthlyPayment, totalPayments, earlyPayoffMonth: pm,
    rebate, interestPaid, remainingBalance: Math.max(0, remainingBalance),
    penaltyVsSimple, schedule,
  };
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs">
        <p className="font-bold text-muted-foreground mb-1">Month {label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.fill }} className="font-semibold">{p.name}: ${fmt(p.value)}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function RuleOf78Calculator() {
  const [principal, setPrincipal] = useState("15000");
  const [annualRate, setAnnualRate] = useState("9.5");
  const [termMonths, setTermMonths] = useState("48");
  const [payoffMonth, setPayoffMonth] = useState("24");

  const [results, setResults] = useState<R78Results | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); calculate(); }, []);

  const calculate = () => {
    const r = calcR78({
      principal: parseFloat(principal) || 15000,
      annualRate: parseFloat(annualRate) || 9.5,
      termMonths: parseInt(termMonths) || 48,
      payoffMonth: parseInt(payoffMonth) || 24,
    });
    setResults(r);
  };

  const reset = () => {
    setPrincipal("15000"); setAnnualRate("9.5"); setTermMonths("48"); setPayoffMonth("24");
    setResults(calcR78({ principal: 15000, annualRate: 9.5, termMonths: 48, payoffMonth: 24 }));
  };

  const chartData = results ? results.schedule.slice(0, parseInt(termMonths) || 48).map(s => ({
    month: s.month, "Interest": parseFloat(s.interestAmount.toFixed(2)),
  })) : [];

  const faqs = [
    { question: "What is the Rule of 78?", answer: "The Rule of 78 (also called the Sum of the Digits method) is a method lenders use to calculate the interest rebate when a borrower pays off a loan early. The name comes from the sum of the digits 1–12, which equals 78, representing a 12-month loan." },
    { question: "How is the Rule of 78 calculated?", answer: "Interest is weighted toward the early months of the loan. The lender assigns a digit to each month (12, 11, 10…1 for a 12-month loan) and your share of total interest is proportional to these digits. Paying off early means you've already paid a higher proportion of interest." },
    { question: "Is the Rule of 78 legal?", answer: "In the US, the Rule of 78 is banned for loans over 61 months under the Truth in Lending Act. Some states also restrict its use for shorter loans. It tends to benefit lenders at the expense of borrowers who prepay, so always check your loan agreement." },
    { question: "How does Rule of 78 compare to simple interest?", answer: "With simple interest, the rebate is proportional to remaining time. With Rule of 78, you've already paid a larger share of interest early, so your rebate is smaller. This means prepayment is more costly under Rule of 78." },
    { question: "What is the interest rebate?", answer: "The interest rebate is the portion of pre-computed interest the lender returns when you pay off the loan early. Under Rule of 78, the rebate decreases significantly the closer you are to the loan's end." },
    { question: "Should I pay off a Rule of 78 loan early?", answer: "It depends. In the first few months, early payoff under Rule of 78 is heavily penalized since you've already paid most of the interest. In the last quarter of the loan, the interest saved is minimal, so early payoff gains are small." },
    { question: "What types of loans use Rule of 78?", answer: "Rule of 78 is commonly found in auto loans, personal loans, and consumer finance agreements, particularly from sub-prime or in-house lenders. Mortgages and most bank loans use simple interest (actuarial) methods instead." },
  ];

  return (
    <>
      <Breadcrumb items={[
        { label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" },
        { label: "Financial", href: "/calculator#financial" }, { label: "Rule of 78 Calculator" }
      ]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Rule of 78 Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Loan Details</h2>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="principal" label="Loan Amount" value={principal} onChange={setPrincipal} prefix="$" />
              <CompactInput id="rate" label="Annual Interest Rate" value={annualRate} onChange={setAnnualRate} suffix="%" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="term" label="Loan Term" value={termMonths} onChange={setTermMonths} suffix="months" />
              <CompactInput id="payoff" label="Early Payoff Month" value={payoffMonth} onChange={setPayoffMonth} suffix="month" />
            </div>

            {/* Buttons */}
            <div className="flex gap-2.5 mt-2">
              <button type="button" onClick={calculate}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset}
                className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-9 transition-colors flex items-center justify-center"
                aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {results && (
              <>
                <>

              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h2 className="text-2xl font-bold mb-3">Results</h2>
                  <TrendingDown className="h-5 w-5 text-primary" />
                </div>

                {/* Component 1: Primary Result */}
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Interest Rebate at Month {results.earlyPayoffMonth}</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                    ${fmt(results.rebate)}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Remaining Balance: ${fmt(results.remainingBalance)}
                  </div>
                </div>

                {/* Component 2: Breakdown Table */}
                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Description</th>
                        <th className="p-2.5 pr-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { label: "Monthly Payment", value: `$${fmt(results.monthlyPayment)}` },
                        { label: "Total Interest (Full Term)", value: `$${fmt(results.totalInterest)}` },
                        { label: "Interest Paid (Months 1–" + results.earlyPayoffMonth + ")", value: `$${fmt(results.interestPaid)}` },
                        { label: "Interest Rebate (Rule of 78)", value: `$${fmt(results.rebate)}` },
                        { label: "Penalty vs Simple Interest", value: `$${fmt(Math.abs(results.penaltyVsSimple))}` },
                        { label: "Total Payments to Date", value: `$${fmt(results.earlyPayoffMonth * results.monthlyPayment)}`, isTotal: true },
                      ].map(row => (
                        <tr key={row.label} className={`hover:bg-secondary/20 transition-colors ${row.isTotal ? "font-bold bg-secondary/30 text-foreground border-t border-border" : "text-muted-foreground"}`}>
                          <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                          <td className="p-2.5 pr-3 text-right text-foreground">{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Component 3: Chart */}
                <div className="p-4 rounded-xl border border-border bg-card">
                  <h3 className="text-sm font-bold text-foreground mb-3">Monthly Interest Distribution (Rule of 78)</h3>
                  {mounted && chartData.length > 0 && (<>

                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={chartData.slice(0, 24)} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} label={{ value: "Month", position: "insideBottom", offset: -2, fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v.toFixed(0)}`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="Interest" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  
</>)}
                  <p className="text-xs text-muted-foreground mt-2 text-center">First 24 months shown. Notice higher interest in early months.</p>
                </div>

                {/* Component 4: Summary Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-border bg-card">
                  {[
                    { label: "Loan Amount", value: `$${fmt(parseFloat(principal) || 0)}` },
                    { label: "Loan Term", value: `${termMonths} months` },
                    { label: "Annual Rate", value: `${annualRate}%` },
                    { label: "Monthly Payment", value: `$${fmt(results.monthlyPayment)}` },
                    { label: "Total Interest", value: `$${fmt(results.totalInterest)}` },
                    { label: "Total Cost", value: `$${fmt(results.totalPayments)}` },
                  ].map(item => (
                    <div key={item.label} className="flex flex-col">
                      <span className="text-[12px] font-bold uppercase text-muted-foreground tracking-wider mb-0.5">{item.label}</span>
                      <span className="text-base font-extrabold text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            
</>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is the Rule of 78 Calculator?</h2>
            <p>The Rule of 78 Calculator is a specialized financial tool that helps borrowers understand how pre-computed interest loans work and quantifies the true cost of paying off a loan early. Unlike standard amortization loans where interest is calculated daily or monthly on the remaining balance, Rule of 78 loans front-load the interest — assigning more of the total interest to the early months and less to the later months. This creates a hidden financial trap: the earlier you pay off the loan, the less interest rebate you receive.</p>
            <p>This calculator is essential for anyone who has taken out a consumer loan — particularly from a car dealership, furniture store, or sub-prime lender — and is considering making an early payoff. By entering your loan amount, interest rate, term, and intended payoff month, you immediately see your exact interest rebate and remaining balance, often revealing a significant penalty compared to a simple interest loan.</p>

            <h2>How the Rule of 78 Works</h2>
            <p>The method gets its name from the sum of the digits 1 through 12, which equals 78, representing a 12-month loan. For any loan term, the lender calculates a "sum of digits" by adding all the month numbers from 1 to the term length. For a 48-month loan, that sum is (48 × 49) / 2 = 1,176.</p>
            <p>The lender then assigns interest weights to each month in reverse order. Month 1 receives the highest weight (48/1,176 of total interest for a 48-month loan), and Month 48 receives the lowest weight (1/1,176). The result is that in the first month alone, you pay 48 times more interest than in the last month.</p>
            <p>When you pay off early, the lender calculates the sum of the remaining digits and uses that to determine your interest rebate. If you're paying off at Month 24 of a 48-month loan, the remaining digit sum is (24 × 25) / 2 = 300 out of 1,176 — meaning you get a rebate of only 25.5% of remaining interest, while a simple interest loan would give you a 50% rebate (half the term remaining).</p>

            <h2>Understanding Your Results</h2>
            <p>The calculator provides several critical outputs. The <strong>Interest Rebate</strong> shows exactly how much pre-computed interest the lender will credit back upon early payoff. The <strong>Remaining Balance</strong> is what you'd actually owe at your chosen payoff month — principal remaining minus the rebate. The <strong>Penalty vs Simple Interest</strong> quantifies how much extra interest you'd pay compared to a standard amortizing loan, which is often the most eye-opening number for borrowers.</p>
            <p>The bar chart visualizes the front-loaded nature of Rule of 78 interest, clearly showing how early months carry disproportionately high interest charges. This visualization makes it immediately clear why early payoff offers so little savings under this method.</p>

            <h2>Key Factors Explained</h2>
            <p><strong>Loan Amount (Principal):</strong> The initial balance on which all interest calculations are based. Higher principal means higher absolute interest in all periods.</p>
            <p><strong>Annual Interest Rate:</strong> The stated rate used to compute total pre-calculated interest. In Rule of 78 loans, this rate determines the total interest pool, which is then distributed using the sum-of-digits method.</p>
            <p><strong>Loan Term:</strong> The total number of months in the loan agreement. Longer terms create a larger sum-of-digits denominator, which affects how interest is front-loaded. A 60-month loan has a digit sum of 1,830.</p>
            <p><strong>Early Payoff Month:</strong> The month in which you intend to make a full payoff. This is the critical variable — your rebate depends entirely on how many months remain. Paying off in Month 12 of 48 yields a much smaller rebate than paying off in Month 6.</p>

            <h2>Advanced Features</h2>
            <p>The Rule of 78 Calculator includes a complete month-by-month interest distribution schedule, allowing you to see precisely how much interest is assigned to each period. This is particularly valuable when comparing loan offers or negotiating with lenders. The calculator also quantifies the "penalty" compared to a simple interest equivalent — an important metric for determining whether refinancing makes financial sense.</p>

            <h2>Practical Examples</h2>
            <p><strong>Example 1: Auto Loan Early Payoff.</strong> Consider a $15,000 auto loan at 9.5% APR for 48 months. Monthly payment is $377.17, total interest is $1,104.16. If you pay off at Month 24, the digit sum rebate is 25.5% of remaining interest. Under simple interest you'd get ~50% back. The Rule of 78 costs you an extra ~$140 in this scenario.</p>
            <p><strong>Example 2: Near-End Payoff.</strong> Paying off the same loan at Month 42 of 48 yields a rebate of only 1/1,176 × total interest = essentially nothing. The last 6 months of a Rule of 78 loan carry almost no rebate value, so paying off in the final stretch saves very little interest.</p>
            <p><strong>Example 3: Very Early Payoff.</strong> Paying off at Month 6 of 48 yields a digit sum of (42 × 43)/2 = 903 remaining, so rebate = 903/1,176 × total interest ≈ 76.8% of remaining interest. Early payoff still penalizes vs simple interest but by less in absolute dollar terms because the loan balance itself is large.</p>

            <h2>Tips and Best Practices</h2>
            <p>Always read your loan contract before signing to determine whether it uses Rule of 78 or simple interest (actuarial) calculations. Ask the lender explicitly — by law they must disclose the prepayment method. If you anticipate paying off your loan early, seek a simple interest loan rather than a pre-computed interest loan. The earlier you anticipate paying off, the more important this distinction becomes. If you already have a Rule of 78 loan, consider whether refinancing to a simple interest loan — even at a similar rate — saves money given the rebate penalty.</p>

            <h2>Benefits of Using This Calculator</h2>
            <p>This calculator eliminates the complex arithmetic of the sum-of-digits method and gives you an instant, accurate picture of your true payoff cost. It empowers borrowers to make informed decisions about early loan payoffs, refinancing, and loan selection. Understanding the Rule of 78 before signing can save hundreds to thousands of dollars over the life of a consumer loan.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/rule-of-78-calculator" />
          <PopularCalculators exclude="/calculator/rule-of-78-calculator" />
        </div>
      </div>
    </>
  );
}
