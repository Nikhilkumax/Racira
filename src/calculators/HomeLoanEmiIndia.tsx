"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, IndianRupee } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const fmtINR = (n: number) => {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
};
const fmt = (n: number, d = 0) => n.toLocaleString("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d });

const Inp = ({ id, label, value, onChange, prefix, suffix }: { id: string; label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string }) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none shrink-0">{prefix}</span>}
      <input id={id} type="number" step="any" value={value} onChange={e => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

interface EMIResult {
  emi: number; totalPayment: number; totalInterest: number; principal: number;
  yearlyData: { year: number; principal: number; interest: number; balance: number }[];
  pieData: { name: string; value: number }[];
}

export default function HomeLoanEmiIndia() {
  const [loanAmount, setLoanAmount] = useState("5000000");
  const [interestRate, setInterestRate] = useState("8.5");
  const [tenure, setTenure] = useState("20");
  const [tenureUnit, setTenureUnit] = useState<"years" | "months">("years");
  const [res, setRes] = useState<EMIResult | null>(null);

  useEffect(() => { calculate(); }, []);

  const calculate = () => {
    const P = parseFloat(loanAmount) || 5000000;
    const r = parseFloat(interestRate) / 100 / 12 || 0.085 / 12;
    const n = tenureUnit === "years" ? (parseInt(tenure) || 20) * 12 : (parseInt(tenure) || 240);

    const emi = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - P;

    // Yearly schedule
    let balance = P;
    const yearlyData: { year: number; principal: number; interest: number; balance: number }[] = [];
    const totalYears = Math.ceil(n / 12);
    for (let yr = 1; yr <= totalYears; yr++) {
      let yearPrincipal = 0, yearInterest = 0;
      const months = yr === totalYears ? n % 12 || 12 : 12;
      for (let m = 0; m < months; m++) {
        const intPayment = balance * r;
        const prinPayment = emi - intPayment;
        yearPrincipal += prinPayment;
        yearInterest += intPayment;
        balance = Math.max(0, balance - prinPayment);
      }
      yearlyData.push({ year: yr, principal: Math.round(yearPrincipal), interest: Math.round(yearInterest), balance: Math.round(balance) });
    }

    const pieData = [
      { name: "Principal", value: Math.round(P) },
      { name: "Total Interest", value: Math.round(totalInterest) },
    ];

    setRes({ emi, totalPayment, totalInterest, principal: P, yearlyData, pieData });
  };

  const COLORS = ["#6366f1", "#ef4444"];

  const faqs = [
    { question: "What is an EMI?", answer: "EMI (Equated Monthly Installment) is the fixed monthly payment a borrower makes to repay a loan. Each EMI consists of two components: the principal repayment and the interest charged for that month. In the early months, a larger portion of the EMI goes toward interest; over time, the principal component increases and interest decreases. This is called an amortizing loan structure." },
    { question: "What is the EMI formula?", answer: "EMI = P × r × (1+r)^n / [(1+r)^n − 1], where P is the principal loan amount, r is the monthly interest rate (annual rate ÷ 12 ÷ 100), and n is the number of monthly installments. For a ₹50 lakh loan at 8.5% for 20 years: r = 8.5/12/100 = 0.00708, n = 240. EMI = ₹43,391 approximately." },
    { question: "Which bank offers the lowest home loan interest rate in India?", answer: "Home loan interest rates in India vary by lender, credit score, and loan amount. As of 2024-25, rates start around 8.35-8.50% for public sector banks (SBI, PNB, Bank of Baroda) for those with excellent credit (CIBIL 750+). Private banks (HDFC, ICICI, Axis) typically charge 8.5-9.5%. Housing finance companies may charge 8.7-10%+. Always compare the APR (Annual Percentage Rate) inclusive of processing fees rather than just the headline interest rate." },
    { question: "How does prepayment reduce my home loan burden?", answer: "Making lump-sum prepayments on your principal dramatically reduces total interest paid. For a ₹50L loan at 8.5% over 20 years, paying ₹2L extra in year 3 can save ₹4-5L in interest and reduce tenure by 2-3 years. RBI regulations require floating-rate home loans from banks to have no prepayment penalty. You can make partial prepayments (part-prepayment) or full foreclosure. Even small regular prepayments compound into significant savings over a 20-year term." },
    { question: "What is the maximum home loan I can get?", answer: "Home loan eligibility is primarily based on your income and existing EMI obligations. Banks typically allow EMIs to consume up to 40-50% of net monthly income. For a ₹1 lakh net monthly salary, maximum EMI might be ₹40,000-50,000. At 8.5% for 20 years, this translates to a loan of approximately ₹46L-58L. Other factors: age (loan must close before 60-65 for salaried, 65-70 for self-employed), credit score, employment stability, and property value (banks typically fund 75-90% of property value)." },
    { question: "Should I choose a fixed or floating rate home loan?", answer: "Floating-rate loans move with the RBI repo rate and MCLR/EBLR benchmarks. When rates fall, your EMI or tenure decreases. Fixed rates lock in a specific rate for a period (typically 2-5 years), providing EMI certainty. Historically, floating rates have been lower than fixed rates over long periods in India. Fixed rates suit those who need predictable cash flows; floating rates suit those who can absorb variation and expect rates to fall. Most home loans in India are floating rate." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Home Loan EMI Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Home Loan EMI Calculator (India)</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Loan Details</h2>
            <div className="flex flex-col gap-4">
              <Inp id="loan" label="Loan Amount" value={loanAmount} onChange={setLoanAmount} prefix="₹" />

              {/* Quick amount buttons */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick Select</span>
                <div className="flex flex-wrap gap-1.5">
                  {[["25L", "2500000"], ["50L", "5000000"], ["75L", "7500000"], ["1Cr", "10000000"], ["1.5Cr", "15000000"]].map(([label, val]) => (
                    <button key={label} type="button" onClick={() => setLoanAmount(val)} className={`px-2.5 py-1 text-xs font-bold rounded-md border transition-colors ${loanAmount === val ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background hover:bg-secondary text-muted-foreground"}`}>
                      ₹{label}
                    </button>
                  ))}
                </div>
              </div>

              <Inp id="ir" label="Annual Interest Rate" value={interestRate} onChange={setInterestRate} suffix="%" />

              {/* Common rates */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bank Rates (2024-25)</span>
                <div className="flex flex-wrap gap-1.5">
                  {[["SBI", "8.5"], ["HDFC", "8.7"], ["ICICI", "8.75"], ["Axis", "8.75"], ["Kotak", "8.65"]].map(([bank, rate]) => (
                    <button key={bank} type="button" onClick={() => setInterestRate(rate)} className={`px-2.5 py-1 text-xs font-bold rounded-md border transition-colors ${interestRate === rate ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background hover:bg-secondary text-muted-foreground"}`}>
                      {bank} {rate}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-foreground">Loan Tenure</span>
                <div className="flex gap-2">
                  <div className="relative flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm flex-1">
                    <input type="number" value={tenure} onChange={e => setTenure(e.target.value)} className="w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground" />
                  </div>
                  <div className="flex rounded-md border border-border overflow-hidden">
                    {(["years", "months"] as const).map(u => (
                      <button key={u} type="button" onClick={() => setTenureUnit(u)} className={`px-3 text-sm font-semibold h-10 transition-colors ${tenureUnit === u ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-secondary"}`}>
                        {u === "years" ? "Yrs" : "Mo"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={() => { setLoanAmount("5000000"); setInterestRate("8.5"); setTenure("20"); setTenureUnit("years"); setTimeout(calculate, 0); }} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {res && (
              <>
                <>

              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h2 className="text-2xl font-bold mb-3">EMI Breakdown</h2>
                  <IndianRupee className="h-5 w-5 text-primary" />
                </div>

                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Monthly EMI</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">₹{fmt(Math.round(res.emi))}</div>
                  <div className="text-sm text-muted-foreground font-medium">Total Interest: {fmtINR(Math.round(res.totalInterest))}</div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-2.5 pl-3">Detail</th><th className="p-2.5 pr-3 text-right">Amount</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50 text-base">
                      {[
                        { label: "Monthly EMI", value: `₹${fmt(Math.round(res.emi))}` },
                        { label: "Principal Loan Amount", value: fmtINR(res.principal) },
                        { label: "Total Interest Payable", value: fmtINR(Math.round(res.totalInterest)) },
                        { label: "Total Amount Payable", value: fmtINR(Math.round(res.totalPayment)) },
                        { label: "Interest to Principal Ratio", value: `${((res.totalInterest / res.principal) * 100).toFixed(1)}%` },
                      ].map(row => (
                        <tr key={row.label} className="hover:bg-secondary/20">
                          <td className="p-2.5 pl-3 font-medium text-foreground">{row.label}</td>
                          <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-border bg-card">
                    <h3 className="text-sm font-bold text-foreground mb-3">Principal vs Interest</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={res.pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                          {res.pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                        </Pie>
                        <Tooltip formatter={(v: any, n: string) => [fmtINR(v), n]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-card">
                    <h3 className="text-sm font-bold text-foreground mb-3">Year-wise Payment Breakdown</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={res.yearlyData.slice(0, 20)} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="year" tick={{ fontSize: 9 }} />
                        <YAxis tick={{ fontSize: 9 }} tickFormatter={v => `₹${(v / 1e5).toFixed(0)}L`} />
                        <Tooltip formatter={(v: any, n: string) => [fmtINR(v), n === "principal" ? "Principal" : "Interest"]} labelFormatter={l => `Year ${l}`} />
                        <Legend />
                        <Bar dataKey="principal" name="Principal" stackId="a" fill="#6366f1" />
                        <Bar dataKey="interest" name="Interest" stackId="a" fill="#ef4444" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl border border-border bg-muted/30">
                  {[
                    { label: "Monthly EMI", value: `₹${fmt(Math.round(res.emi))}` },
                    { label: "Principal", value: fmtINR(res.principal) },
                    { label: "Total Interest", value: fmtINR(Math.round(res.totalInterest)) },
                    { label: "Total Payable", value: fmtINR(Math.round(res.totalPayment)) },
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

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Home Loan EMI Calculator?</h2>
            <p>A home loan EMI (Equated Monthly Installment) calculator is an essential tool for anyone considering or managing a home loan in India. It instantly calculates your fixed monthly payment, total interest outgo, and repayment schedule based on your loan amount, interest rate, and tenure. Whether you're comparing offers from SBI, HDFC, ICICI, or any other bank or NBFC, understanding your EMI before applying is crucial for financial planning.</p>
            <p>In India, home loans are typically available for tenures of 5 to 30 years, with amounts ranging from a few lakhs to several crores. The current (2024-25) home loan interest rate range is approximately 8.35% to 10.5% depending on the lender, your credit profile, and whether you choose a floating or fixed rate product. Even a 0.5% difference in interest rate on a ₹50 lakh loan over 20 years can mean a difference of ₹3-4 lakhs in total interest outgo.</p>

            <h2 className="text-2xl font-bold mb-3">Understanding the EMI Formula</h2>
            <p>The EMI is calculated using the formula: <strong>EMI = P × r × (1+r)^n / [(1+r)^n − 1]</strong>, where P = principal loan amount, r = monthly interest rate (annual rate ÷ 12 ÷ 100), and n = total number of monthly installments. For example, for a ₹50 lakh loan at 8.5% for 20 years: r = 8.5/12/100 = 0.00708, n = 240. EMI = ₹43,391 per month approximately.</p>
            <p>Over 20 years, you'd pay approximately ₹1.04 crore in total — ₹54.1 lakhs in interest on top of ₹50 lakhs principal. This is why longer tenures, while reducing monthly EMI, dramatically increase total interest cost. Conversely, a shorter tenure of 15 years at the same rate raises EMI to ₹49,238 but reduces total interest to ₹38.6 lakhs — a saving of ₹15.5 lakhs.</p>

            <h2 className="text-2xl font-bold mb-3">Tips to Reduce Your Home Loan Interest Burden</h2>
            <p><strong>Make regular prepayments:</strong> Even paying one extra EMI per year can reduce your tenure significantly. RBI mandates that banks charge no prepayment penalty on floating-rate home loans. Small prepayments in early years save disproportionately large amounts in interest since you're reducing the principal on which all future interest is calculated.</p>
            <p><strong>Maintain a high CIBIL score:</strong> Borrowers with CIBIL scores of 750+ qualify for the lowest interest rates. A difference of 50 basis points (0.5%) on a ₹75 lakh loan over 25 years can save ₹7-8 lakhs in interest. Check your credit report before applying and resolve any errors.</p>
            <p><strong>Choose the right tenure:</strong> Opt for the shortest tenure your cash flow allows. While a 30-year tenure minimizes monthly EMI, it maximizes total interest. A 15-20 year tenure offers a balanced approach — manageable EMI with significantly less total interest. Consider your age — ideally, the loan should close before retirement age.</p>

            <h2 className="text-2xl font-bold mb-3">Tax Benefits on Home Loans in India</h2>
            <p>Home loan borrowers can claim significant tax deductions. Under <strong>Section 80C</strong>, principal repayment is eligible for deduction up to ₹1.5 lakh per year (shared with other 80C investments). Under <strong>Section 24(b)</strong>, interest paid on a home loan is deductible up to ₹2 lakh per year for a self-occupied property (unlimited for let-out properties). First-time homebuyers can claim an additional ₹1.5 lakh deduction under <strong>Section 80EEA</strong> if the property value doesn't exceed ₹45 lakhs (subject to conditions). These deductions make home loans one of the most tax-efficient instruments available to salaried individuals in India.</p>

            <h2 className="text-2xl font-bold mb-3">Home Loan Comparison: Bank vs HFC vs NBFC</h2>
            <p>Public sector banks (SBI, Bank of Baroda, PNB) typically offer the lowest interest rates and are benchmarked to the RBI repo rate. Private banks (HDFC Bank, ICICI, Axis) offer convenience, digital processing, and fast approvals but at slightly higher rates. Housing Finance Companies (HDFC Ltd, LIC Housing Finance, Bajaj Housing Finance) specialize in home loans and often have more flexible eligibility criteria. NBFCs may approve borrowers with non-traditional income but typically charge higher rates. Always compare the all-in cost including processing fees, legal charges, technical valuation fees, and insurance requirements.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/home-loan-emi-calculator-india" />
          <PopularCalculators exclude="/calculator/home-loan-emi-calculator-india" />
        </div>
      </div>
    </>
  );
}
