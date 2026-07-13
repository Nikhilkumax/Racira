"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const SimpleInterestCalculator = () => {
  const DEFAULTS = { principal: "5000", rate: "8", time: "3" };
  const [principal, setPrincipal] = useState(DEFAULTS.principal);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [time, setTime] = useState(DEFAULTS.time);
  const [result, setResult] = useState<any>(null);

  const calculate = (pV = principal, rV = rate, tV = time) => {
    const P = parseFloat(pV), r = parseFloat(rV) / 100, t = parseFloat(tV);
    if (isNaN(P) || isNaN(r) || isNaN(t) || P <= 0 || t <= 0) return;
    const interest = P * r * t;
    const total = P + interest;
    const chartData = Array.from({ length: Math.ceil(t) + 1 }, (_, i) => ({
      name: `Yr ${i}`,
      balance: parseFloat((P + P * r * i).toFixed(2)),
      interest: parseFloat((P * r * i).toFixed(2)),
    }));
    setResult({
      primary: `$${interest.toFixed(2)}`,
      subtitle: `Simple Interest on $${P.toLocaleString()} at ${(r * 100).toFixed(2)}% for ${t} years`,
      rows: [
        { label: "Principal (P)", value: `$${P.toLocaleString()}` },
        { label: "Annual Rate (r)", value: `${(r * 100).toFixed(2)}%` },
        { label: "Time (t)", value: `${t} years` },
        { label: "Simple Interest (I = Prt)", value: `$${interest.toFixed(2)}` },
        { label: "Total Amount (P + I)", value: `$${total.toFixed(2)}` },
        { label: "Interest per year", value: `$${(P * r).toFixed(2)}` },
        { label: "Interest per month", value: `$${(P * r / 12).toFixed(2)}` },
      ],
      chartData,
      summary: [
        { label: "Principal", value: `$${P.toLocaleString()}` },
        { label: "Interest Earned", value: `$${interest.toFixed(2)}` },
        { label: "Rate × Time", value: `${(r * t * 100).toFixed(2)}%` },
        { label: "Total Amount", value: `$${total.toFixed(2)}`, border: true, bold: true },
      ],
    });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => { setPrincipal(DEFAULTS.principal); setRate(DEFAULTS.rate); setTime(DEFAULTS.time); calculate(DEFAULTS.principal, DEFAULTS.rate, DEFAULTS.time); };

  const faqs = [
    { question: "What is the simple interest formula?", answer: "I = P × r × t, where P = principal, r = annual interest rate (as decimal), t = time in years. Total amount A = P + I = P(1 + rt)." },
    { question: "What is the difference between simple and compound interest?", answer: "Simple interest is calculated only on the original principal. Compound interest is calculated on principal plus accumulated interest, producing faster growth. For short periods and small amounts, the difference is small; over decades it becomes enormous." },
    { question: "When is simple interest used?", answer: "Simple interest is used in short-term loans (payday loans, auto loans), US Treasury bills, some savings bonds, and as an approximation for quick calculations. Most long-term financial products use compound interest." },
    { question: "How do I calculate monthly simple interest?", answer: "Monthly rate = Annual rate / 12. Monthly interest = P × (r/12). For $5,000 at 8% annually: monthly interest = $5,000 × (0.08/12) = $33.33/month." },
    { question: "What is the Rule of 72 for simple interest?", answer: "For simple interest, the doubling time = 1/r years. At 8%, it takes exactly 1/0.08 = 12.5 years to double. Note: the Rule of 72 (72/r) applies to compound interest — the simple interest formula is exact." },
    { question: "What is APR?", answer: "APR (Annual Percentage Rate) is the simple interest rate expressed annually, including fees. For a loan, APR = (Interest + Fees) / (Principal × Term). This calculator uses straightforward simple interest without fees." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Simple Interest Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Simple Interest Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px]">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Principal (P)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input type="number" value={principal} onChange={e => setPrincipal(e.target.value)}
                  className="h-10 w-full pl-7 pr-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="5000" min="0" step="any" />
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Annual Interest Rate (r)</label>
              <div className="relative">
                <input type="number" value={rate} onChange={e => setRate(e.target.value)}
                  className="h-10 w-full pl-3 pr-8 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="8" min="0" step="0.1" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Time Period (t)</label>
              <div className="relative">
                <input type="number" value={time} onChange={e => setTime(e.target.value)}
                  className="h-10 w-full pl-3 pr-16 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="3" min="0" step="0.5" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">years</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => calculate()} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">Calculate</button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Simple Interest Earned</div>
                <div className="text-4xl font-bold text-primary">{result.primary}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.subtitle}</div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Breakdown</h3>
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
                  <h3 className="text-base font-semibold mb-3">Balance Growth (Linear)</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, ""]} />
                      <Bar dataKey="balance" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Total Balance" />
                    </BarChart>
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
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Simple Interest Calculator?</h2>
            <p>A simple interest calculator computes the interest earned or paid on a principal amount using the formula I = Prt, where interest grows linearly — the same fixed amount each year. Unlike compound interest, simple interest does not earn interest on accumulated interest. Pre-filled with $5,000 at 8% for 3 years, the result is $1,200 in interest ($400/year) for a total of $6,200.</p>
            <p>Simple interest is used for short-term personal loans, some auto financing, US Treasury bills, pawnshop loans, and as a baseline for comparing more complex financial products. Understanding simple interest is the first step toward mastering personal finance math.</p>
            <h2 className="text-2xl font-bold mb-3">The Simple Interest Formula</h2>
            <p><strong>I = P × r × t</strong> (Interest = Principal × Rate × Time)</p>
            <p><strong>A = P + I = P(1 + rt)</strong> (Total Amount)</p>
            <p>For $5,000 at 8% for 3 years: I = 5000 × 0.08 × 3 = $1,200. Total = $5,000 + $1,200 = $6,200. The interest grows at exactly $400 per year — this linear growth is the key characteristic of simple interest.</p>
            <h2 className="text-2xl font-bold mb-3">Simple vs Compound Interest</h2>
            <p>The same $5,000 at 8% for 3 years under monthly compounding: A = 5000 × (1 + 0.08/12)^36 = $6,348.67 — $148.67 more than simple interest. Over longer periods, the gap widens dramatically. Over 30 years: simple interest A = $5,000 × (1 + 2.4) = $17,000. Monthly compound: $5,000 × (1.00667)^360 = $54,911. The compound result is more than 3× the simple interest result. See the <a href="/calculator/compound-interest-calculator">compound interest calculator</a> for direct comparison.</p>
            <h2 className="text-2xl font-bold mb-3">Real-World Applications</h2>
            <p><strong>Auto loans:</strong> Many auto loans use simple interest — interest is charged daily on the outstanding balance. Making early or extra payments reduces the principal faster, directly reducing the total interest paid. <strong>Treasury bills:</strong> US T-bills are sold at a discount and mature at face value; the return is computed as simple interest on the purchase price. <strong>Short-term loans:</strong> A 90-day bridge loan at 12% annual simple interest charges: 12% × (90/365) = 2.96% for the period.</p>
            <h2 className="text-2xl font-bold mb-3">Solving for Other Variables</h2>
            <p>The simple interest formula can be rearranged: <strong>P = I / (rt)</strong> — find how much you need to invest to earn a target interest amount. <strong>r = I / (Pt)</strong> — find the rate given principal, interest, and time. <strong>t = I / (Pr)</strong> — find how long it takes to earn a target amount.</p>
            <h2 className="text-2xl font-bold mb-3">Tips for Using This Calculator</h2>
            <p>Enter fractional years for partial-year calculations (e.g., 0.5 for 6 months, 0.25 for a quarter). The bar chart shows the linearly growing balance — compare this visually to the exponential curve in the compound interest calculator to see the dramatic difference. For borrowing, simple interest is usually better; for investing, compound interest is always preferable.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/simple-interest-calculator" />
          <PopularCalculators exclude="/calculator/simple-interest-calculator" />
        </div>
      </div>
    </>
  );
};
export default SimpleInterestCalculator;
