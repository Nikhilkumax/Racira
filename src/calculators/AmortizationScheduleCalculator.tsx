"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const AmortizationScheduleCalculator = () => {
  const DEFAULTS = { principal: "250000", rate: "6.5", term: "30" };
  const [principal, setPrincipal] = useState(DEFAULTS.principal);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [term, setTerm] = useState(DEFAULTS.term);
  const [viewMode, setViewMode] = useState<"monthly" | "yearly">("yearly");
  const [result, setResult] = useState<any>(null);

  const calculate = (p = principal, r = rate, t = term) => {
    const P = parseFloat(p), annualRate = parseFloat(r), years = parseInt(t);
    if (!P || !annualRate || !years || P <= 0 || annualRate <= 0 || years <= 0) return;
    const mr = annualRate / 100 / 12;
    const n = years * 12;
    const M = (P * mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1);
    const totalPaid = M * n;
    const totalInterest = totalPaid - P;
    const rows: any[] = [];
    let balance = P;
    for (let i = 1; i <= n; i++) {
      const interest = balance * mr;
      const princ = M - interest;
      balance = Math.max(0, balance - princ);
      rows.push({ month: i, year: Math.ceil(i / 12), payment: M, principal: princ, interest, balance });
    }
    const yearlyRows: any[] = [];
    for (let y = 1; y <= years; y++) {
      const sl = rows.filter((r) => r.year === y);
      yearlyRows.push({
        year: y,
        totalPayment: sl.reduce((s, r) => s + r.payment, 0),
        totalPrincipal: sl.reduce((s, r) => s + r.principal, 0),
        totalInterest: sl.reduce((s, r) => s + r.interest, 0),
        endBalance: sl[sl.length - 1]?.balance ?? 0,
      });
    }
    const chartData = yearlyRows.map((y) => ({
      name: `Yr ${y.year}`,
      Principal: parseFloat(y.totalPrincipal.toFixed(0)),
      Interest: parseFloat(y.totalInterest.toFixed(0)),
    }));
    setResult({ M, totalPaid, totalInterest, P, rows, yearlyRows, chartData, years, n });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => { setPrincipal(DEFAULTS.principal); setRate(DEFAULTS.rate); setTerm(DEFAULTS.term); calculate(DEFAULTS.principal, DEFAULTS.rate, DEFAULTS.term); };

  const faqs = [
    { question: "What is an amortization schedule?", answer: "An amortization schedule is a complete table showing each loan payment broken down into principal and interest components, along with the remaining balance after each payment. It helps borrowers understand how their debt decreases over time." },
    { question: "Why do early payments have more interest?", answer: "Interest is calculated on the outstanding balance. At the start of a loan the balance is highest, so more of each payment goes to interest. As principal decreases, less interest accrues and more of each payment reduces principal." },
    { question: "How is the monthly payment calculated?", answer: "M = P × [r(1+r)^n] / [(1+r)^n – 1], where P = principal, r = monthly interest rate (annual rate / 12), and n = total number of payments (years × 12)." },
    { question: "What happens if I make extra payments?", answer: "Extra payments reduce your principal balance faster, causing less interest to accrue each subsequent month. This shortens the loan term and reduces total interest paid — often saving tens of thousands on a 30-year mortgage." },
    { question: "What is the difference between amortization and depreciation?", answer: "Amortization (in lending) refers to paying off a debt through regular payments over time. Depreciation refers to the accounting reduction in value of a tangible asset. Both spread a cost over time but apply to different contexts." },
    { question: "Can I use this for any loan type?", answer: "Yes. This amortization schedule calculator works for mortgages, auto loans, personal loans, student loans, and any fixed-rate installment loan. Simply enter your loan amount, interest rate, and term." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Financial", href: "/calculator#financial" }, { label: "Amortization Schedule Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Amortization Schedule Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px] mx-auto">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Loan Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} className="h-10 w-full pl-7 pr-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="250000" min="1" />
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Annual Interest Rate</label>
              <div className="relative">
                <input type="number" value={rate} onChange={(e) => setRate(e.target.value)} className="h-10 w-full pl-3 pr-8 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="6.5" step="0.1" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Loan Term</label>
              <div className="relative">
                <input type="number" value={term} onChange={(e) => setTerm(e.target.value)} className="h-10 w-full pl-3 pr-16 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="30" min="1" max="50" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">years</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => calculate()} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">
                <Calculator className="w-4 h-4" /> Calculate
              </button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Monthly Payment</div>
                <div className="text-4xl font-bold text-primary">${fmt(result.M)}</div>
                <div className="text-sm text-muted-foreground mt-1">Total paid: ${fmt(result.totalPaid)} · Total interest: ${fmt(result.totalInterest)}</div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold">Amortization Schedule</h3>
                  <div className="flex rounded-md border border-input overflow-hidden h-8">
                    <button onClick={() => setViewMode("yearly")} className={`px-3 text-sm font-semibold transition-colors ${viewMode === "yearly" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>Yearly</button>
                    <button onClick={() => setViewMode("monthly")} className={`px-3 text-sm font-semibold border-l border-input transition-colors ${viewMode === "monthly" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>Monthly</button>
                  </div>
                </div>
                <div className="overflow-auto max-h-72 rounded border border-border">
                  <table className="w-full text-sm text-left">
                    <thead className="sticky top-0 bg-secondary/60 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="p-2">{viewMode === "yearly" ? "Year" : "Month"}</th>
                        <th className="p-2 text-right">Payment</th>
                        <th className="p-2 text-right">Principal</th>
                        <th className="p-2 text-right">Interest</th>
                        <th className="p-2 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {viewMode === "yearly"
                        ? result.yearlyRows.map((r: any) => (
                            <tr key={r.year} className="hover:bg-secondary/20">
                              <td className="p-2 font-medium">{r.year}</td>
                              <td className="p-2 text-right">${fmt(r.totalPayment)}</td>
                              <td className="p-2 text-right text-green-600 dark:text-green-400">${fmt(r.totalPrincipal)}</td>
                              <td className="p-2 text-right text-orange-500">${fmt(r.totalInterest)}</td>
                              <td className="p-2 text-right font-medium">${fmt(r.endBalance)}</td>
                            </tr>
                          ))
                        : result.rows.map((r: any) => (
                            <tr key={r.month} className="hover:bg-secondary/20">
                              <td className="p-2 font-medium">{r.month}</td>
                              <td className="p-2 text-right">${fmt(r.payment)}</td>
                              <td className="p-2 text-right text-green-600 dark:text-green-400">${fmt(r.principal)}</td>
                              <td className="p-2 text-right text-orange-500">${fmt(r.interest)}</td>
                              <td className="p-2 text-right font-medium">${fmt(r.balance)}</td>
                            </tr>
                          ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Principal vs Interest Over Time</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={Math.max(0, Math.floor(result.years / 6) - 1)} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: any) => `$${Number(v).toLocaleString("en-US", { maximumFractionDigits: 0 })}`} />
                    <Legend />
                    <Area type="monotone" dataKey="Principal" stackId="1" stroke="#10b981" fill="#10b98133" />
                    <Area type="monotone" dataKey="Interest" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-base font-semibold mb-4">Loan Summary</h3>
                <div className="space-y-3">
                  {[
                    { label: "Loan Amount", value: `$${fmt(result.P)}` },
                    { label: "Annual Interest Rate", value: `${rate}%` },
                    { label: "Loan Term", value: `${term} years (${result.n} payments)` },
                    { label: "Monthly Payment", value: `$${fmt(result.M)}` },
                    { label: "Total Principal Paid", value: `$${fmt(result.P)}` },
                    { label: "Total Interest Paid", value: `$${fmt(result.totalInterest)}` },
                    { label: "Interest as % of Principal", value: `${((result.totalInterest / result.P) * 100).toFixed(1)}%` },
                    { label: "Total Cost of Loan", value: `$${fmt(result.totalPaid)}`, border: true, bold: true },
                  ].map((s, i) => (
                    <div key={i} className={`flex justify-between text-base ${s.border ? "border-t pt-3" : ""}`}>
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className={s.bold ? "font-bold text-primary" : "font-medium"}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto mt-10">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
            <h2>What Is an Amortization Schedule Calculator?</h2>
            <p>An amortization schedule calculator generates a complete, payment-by-payment table showing exactly how a fixed-rate loan is repaid over time. For each payment, it breaks down how much goes toward reducing the principal balance versus paying interest. Pre-filled with $250,000 at 6.5% for 30 years, the monthly payment is $1,580.17 and total interest paid is $318,862 — more than the original loan amount itself.</p>
            <p>Lenders, homebuyers, and financial planners use amortization schedules to understand the true cost of a loan, plan extra payments, and see exactly when the loan will be paid off. This amortization schedule calculator works for mortgages, auto loans, personal loans, and any fixed-rate installment loan.</p>
            <h2>How the Amortization Formula Works</h2>
            <p><strong>M = P × [r(1+r)^n] / [(1+r)^n – 1]</strong></p>
            <p>Where M = monthly payment, P = principal, r = monthly interest rate (annual rate ÷ 12), n = total payments. Each month: Interest = Balance × r. Principal = M – Interest. In month 1 of our $250,000 example: Interest = $1,354.17, Principal = $226.00. By year 15 (halfway), over $900 of each payment finally goes to principal — showing the front-loaded nature of amortization.</p>
            <h2>Understanding Your Results</h2>
            <p>The yearly view condenses 12 monthly payments into annual totals for easy progress tracking. Switch to monthly view for individual payment detail. The area chart stacks principal and interest — watch the principal area widen each year as interest shrinks. The crossover point (where you pay more principal than interest) on a 30-year, 6.5% loan occurs around month 198.</p>
            <h2>Key Factors in Your Amortization Schedule</h2>
            <p><strong>Loan Amount:</strong> Directly proportional to monthly payment and total interest. A $500,000 loan at the same rate and term costs $637,724 in total interest. <strong>Interest Rate:</strong> The difference between 6% and 7% on $250,000 over 30 years is $60,204 in total interest. <strong>Loan Term:</strong> A 15-year term saves $159,803 in interest vs 30 years, but requires $630 more per month. <strong>Extra Payments:</strong> Adding $200/month to a 30-year loan at 6.5% cuts the payoff by 6.5 years and saves over $80,000.</p>
            <h2>Practical Examples</h2>
            <p><strong>Home Mortgage:</strong> $350,000, 7%, 30yr → $2,328/mo, $488,274 total interest. By year 5: only $23,103 of principal paid. <strong>Auto Loan:</strong> $35,000, 6%, 5yr → $677/mo, $5,599 total interest. <strong>Personal Loan:</strong> $10,000, 12%, 3yr → $332/mo, $1,957 total interest.</p>
            <h2>Tips for Using Amortization Schedules</h2>
            <p>Always request an amortization schedule before signing any loan. Compare total interest cost across term lengths — not just monthly payments. For flexibility, choose a longer term but commit to extra principal payments when cash flow allows. Use the yearly summary to track equity milestones, such as reaching 20% equity to eliminate PMI.</p>
            <h2>Benefits of This Calculator</h2>
            <p>Manual amortization calculations require spreadsheet skills for 30-year schedules (360 rows). Our amortization schedule calculator instantly generates the complete table, letting you compare scenarios in seconds. See also: <a href="/calculator/mortgage-calculator">mortgage calculator</a>, <a href="/calculator/loan-calculator">loan calculator</a>, and <a href="/calculator/biweekly-mortgage-calculator">biweekly mortgage calculator</a>.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/amortization-schedule-calculator" />
          <PopularCalculators exclude="/calculator/amortization-schedule-calculator" />
        </div>
      </div>
    </>
  );
};

export default AmortizationScheduleCalculator;
