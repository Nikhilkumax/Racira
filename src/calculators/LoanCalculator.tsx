"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1.5">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
        {...props}
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const LoanCalculator = () => {
  const DEFAULTS = { principal: "25000", rate: "6.5", years: "5" };
  const [principal, setPrincipal] = useState(DEFAULTS.principal);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [years, setYears] = useState(DEFAULTS.years);
  const [result, setResult] = useState<any>(null);

  const calculate = (pV = principal, rV = rate, yV = years) => {
    const P = parseFloat(pV), r = parseFloat(rV) / 100 / 12, n = parseFloat(yV) * 12;
    if (isNaN(P) || isNaN(r) || isNaN(n) || P <= 0 || n <= 0) return;
    let monthly: number;
    if (r === 0) { monthly = P / n; } else {
      monthly = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }
    const totalPaid = monthly * n;
    const totalInterest = totalPaid - P;

    let balance = P;
    const chartData: { name: string; balance: number; principal: number; interest: number }[] = [];
    for (let yr = 0; yr <= parseFloat(yV); yr++) {
      chartData.push({ name: `Yr ${yr}`, balance: parseFloat(balance.toFixed(2)), principal: parseFloat(P.toFixed(0)), interest: parseFloat((totalInterest * (yr / parseFloat(yV))).toFixed(0)) });
      for (let m = 0; m < 12 && balance > 0; m++) {
        const intPmt = balance * r;
        const prinPmt = monthly - intPmt;
        balance = Math.max(0, balance - prinPmt);
      }
    }

    setResult({
      primary: `$${monthly.toFixed(2)}/mo`,
      subtitle: `$${P.toLocaleString()} loan at ${rV}% APR over ${yV} years`,
      rows: [
        { label: "Loan Amount", value: `$${P.toLocaleString()}` },
        { label: "Annual Interest Rate", value: `${rV}%` },
        { label: "Loan Term", value: `${yV} years (${n} payments)` },
        { label: "Monthly Payment", value: `$${monthly.toFixed(2)}` },
        { label: "Total Amount Paid", value: `$${totalPaid.toFixed(2)}` },
        { label: "Total Interest", value: `$${totalInterest.toFixed(2)}` },
        { label: "Interest % of Total", value: `${((totalInterest / totalPaid) * 100).toFixed(1)}%` },
      ],
      chartData,
      summary: [
        { label: "Monthly Payment", value: `$${monthly.toFixed(2)}` },
        { label: "Total Paid", value: `$${totalPaid.toFixed(2)}` },
        { label: "Total Interest", value: `$${totalInterest.toFixed(2)}` },
        { label: "Principal", value: `$${P.toLocaleString()}`, border: true, bold: true },
      ],
    });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => { setPrincipal(DEFAULTS.principal); setRate(DEFAULTS.rate); setYears(DEFAULTS.years); calculate(DEFAULTS.principal, DEFAULTS.rate, DEFAULTS.years); };

  const faqs = [
    { question: "What is the loan payment formula?", answer: "Monthly Payment = P × [r(1+r)^n] / [(1+r)^n − 1], where P = loan amount, r = monthly interest rate (annual rate / 12), n = total number of payments." },
    { question: "How does loan term affect total interest?", answer: "Longer terms mean lower monthly payments but much more total interest. A $25,000 loan at 6.5% for 3 years: $766/mo, $2,577 interest. For 7 years: $375/mo, $6,430 interest — 2.5× more interest for fewer monthly dollars." },
    { question: "What is APR vs interest rate?", answer: "The interest rate is the cost of borrowing the principal. APR (Annual Percentage Rate) includes the interest rate plus fees (origination, points, closing costs). APR gives a truer cost of the loan. This calculator uses APR/interest rate interchangeably for simplicity." },
    { question: "What happens if I make extra payments?", answer: "Extra payments go directly toward the principal, reducing the balance faster and cutting total interest significantly. Even one extra payment per year can shorten a 5-year loan by several months." },
    { question: "What is an amortization schedule?", answer: "An amortization schedule shows each monthly payment broken down into principal and interest. Early payments are mostly interest; later payments are mostly principal. The balance decreases slowly at first, then accelerates — this is why paying off early saves so much interest." },
    { question: "What credit score do I need for a good loan rate?", answer: "Typically: 760+ = excellent rates (prime). 720–759 = good rates. 680–719 = fair rates (1–2% higher). Below 680 = subprime rates (3–5% higher or denial). A 1% rate difference on a $25,000 loan over 5 years = ~$650 extra in interest." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Loan Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Loan Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            
            <CompactInput id="principal" label="Loan Amount" value={principal} onChange={setPrincipal} prefix="$" />
            <CompactInput id="rate" label="Annual Interest Rate (APR)" value={rate} onChange={setRate} suffix="%" />
            <CompactInput id="years" label="Loan Term" value={years} onChange={setYears} suffix="years" />

            <div className="flex gap-3">
              <button onClick={() => calculate()} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">
                <Calculator className="w-4 h-4" /> Calculate
              </button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Monthly Payment</div>
                <div className="text-4xl font-bold text-primary">{result.primary}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.subtitle}</div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Loan Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.rows?.map((r: any, i: number) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              {result.chartData && (
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-semibold mb-3">Remaining Balance Over Time</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={result.chartData}>
                      <defs>
                        <linearGradient id="loanGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, "Balance"]} />
                      <Area type="monotone" dataKey="balance" stroke="hsl(var(--primary))" fill="url(#loanGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-base font-semibold mb-4">Summary</h3>
                <div className="space-y-3">
                  {result.summary?.map((s: any, i: number) => (
                    <div key={i} className={`flex justify-between text-base ${s.border ? "border-t pt-3" : ""}`}>
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className={`font-medium ${s.bold ? "font-bold text-primary" : ""}`}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Loan Calculator?</h2>
            <p>A loan calculator computes your monthly payment for any installment loan using the amortization formula — the same math used by banks for auto loans, personal loans, and student loans. Pre-filled with a $25,000 loan at 6.5% APR over 5 years, it shows the exact monthly payment, total amount paid, total interest cost, and a declining balance chart showing how your loan balance reduces month by month.</p>
            <p>Whether you are financing a car, consolidating debt, taking a personal loan, or comparing different loan offers, this calculator gives you the full picture instantly — empowering you to negotiate better terms and understand the true cost of borrowing.</p>
            <h2 className="text-2xl font-bold mb-3">The Loan Payment Formula</h2>
            <p><strong>M = P × [r(1+r)^n] / [(1+r)^n − 1]</strong></p>
            <p>Where M = monthly payment, P = loan principal, r = monthly interest rate (annual rate ÷ 12), n = total number of monthly payments. For $25,000 at 6.5% for 5 years: r = 0.065/12 ≈ 0.005417, n = 60. M = 25000 × [0.005417 × (1.005417)^60] / [(1.005417)^60 − 1] ≈ $489.15/month. Total paid: $29,349. Total interest: $4,349.</p>
            <h2 className="text-2xl font-bold mb-3">How Amortization Works</h2>
            <p>Each monthly payment is split between interest and principal. In early payments, most goes to interest; as the balance drops, more goes to principal. For the $25,000 loan: Payment 1 = $135.42 interest + $353.73 principal. Payment 60 = $2.64 interest + $486.51 principal. This is why paying extra in the early months is so powerful — you reduce the principal faster, decreasing the interest base for all future payments.</p>
            <h2 className="text-2xl font-bold mb-3">Comparing Loan Terms</h2>
            <p>The term length dramatically affects both monthly payment and total interest. For a $25,000 loan at 6.5%: 3 years: $766/mo, $2,577 total interest. 5 years: $489/mo, $4,349 total interest. 7 years: $375/mo, $6,430 total interest. Choosing the 7-year term saves $114/month versus the 5-year but costs $2,081 more in interest. The right choice depends on your cash flow needs versus total cost priority.</p>
            <h2 className="text-2xl font-bold mb-3">The Impact of Interest Rate</h2>
            <p>A 1% difference in rate on a $25,000 5-year loan: at 5.5%, payment = $478/mo, interest = $3,706. At 6.5%, payment = $489/mo, interest = $4,349. At 7.5%, payment = $501/mo, interest = $5,006. The 2% spread costs $1,300 over the life of the loan — worth shopping multiple lenders. On a $400,000 mortgage, the same 2% difference means $180,000+ extra in interest over 30 years.</p>
            <h2 className="text-2xl font-bold mb-3">Tips for Reducing Loan Costs</h2>
            <p>Make bi-weekly payments instead of monthly — you end up making 26 half-payments (= 13 full payments) instead of 12, knocking years off your loan. Make even small extra principal payments — $50/month extra on a 5-year loan saves hundreds in interest and pays it off faster. Compare APR (not just interest rate) across lenders — origination fees can make a "lower rate" loan more expensive. If you have good credit, refinance when rates drop. Use the <a href="/calculator/compound-interest-calculator">compound interest calculator</a> to see how investing the monthly savings from a shorter term builds wealth.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/loan-calculator" />
          <PopularCalculators exclude="/calculator/loan-calculator" />
        </div>
      </div>
    </>
  );
};
export default LoanCalculator;

