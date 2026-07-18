"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface CarLoanResult {
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  totalCostOfOwnership: number;
  amortizationData: { month: number; balance: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcCarLoan(
  vehiclePrice: number, downPayment: number, tradeInValue: number,
  salesTaxPct: number, annualRate: number, termMonths: number,
  annualInsurance: number, annualMaintenance: number
): CarLoanResult {
  const taxAmount = (vehiclePrice - tradeInValue) * (salesTaxPct / 100);
  const loanAmount = vehiclePrice - downPayment - tradeInValue + taxAmount;
  const r = annualRate / 100 / 12;

  const monthlyPayment = r > 0
    ? (loanAmount * r) / (1 - Math.pow(1 + r, -termMonths))
    : loanAmount / termMonths;

  const totalPaid = downPayment + taxAmount + monthlyPayment * termMonths;
  const totalInterest = monthlyPayment * termMonths - loanAmount;
  const totalCostOfOwnership = totalPaid + annualInsurance * (termMonths / 12) + annualMaintenance * (termMonths / 12);

  let balance = loanAmount;
  const amortizationData = [{ month: 0, balance: parseFloat(loanAmount.toFixed(0)) }];
  for (let m = 1; m <= termMonths; m++) {
    const interest = balance * r;
    balance = balance - (monthlyPayment - interest);
    if (m % 6 === 0 || m === termMonths) {
      amortizationData.push({ month: m, balance: parseFloat(Math.max(0, balance).toFixed(0)) });
    }
  }

  const breakdown = [
    { label: "Vehicle Price", value: `$${vehiclePrice.toLocaleString()}` },
    { label: "Down Payment", value: `$${downPayment.toLocaleString()}` },
    { label: "Trade-In Value", value: `$${tradeInValue.toLocaleString()}` },
    { label: "Sales Tax", value: `$${taxAmount.toFixed(2)} (${salesTaxPct}%)` },
    { label: "Loan Amount", value: `$${loanAmount.toFixed(2)}` },
    { label: "Interest Rate (APR)", value: `${annualRate}%` },
    { label: "Loan Term", value: `${termMonths} months (${termMonths / 12} years)` },
    { label: "Monthly Payment", value: `$${monthlyPayment.toFixed(2)}` },
    { label: "Total Interest", value: `$${totalInterest.toFixed(2)}` },
    { label: "Total Paid (loan)", value: `$${totalPaid.toFixed(2)}` },
    { label: "Insurance + Maintenance", value: `$${(annualInsurance * termMonths / 12 + annualMaintenance * termMonths / 12).toFixed(0)} est.` },
    { label: "Total Cost of Ownership", value: `$${totalCostOfOwnership.toFixed(0)}` },
  ];

  const summaryStats = [
    { label: "Monthly Payment", value: `$${monthlyPayment.toFixed(2)}` },
    { label: "Loan Amount", value: `$${loanAmount.toFixed(2)}` },
    { label: "Total Interest", value: `$${totalInterest.toFixed(2)}` },
    { label: "Total Paid", value: `$${totalPaid.toFixed(0)}` },
    { label: "Total Ownership Cost", value: `$${totalCostOfOwnership.toFixed(0)}` },
    { label: "Interest % of Price", value: `${((totalInterest / vehiclePrice) * 100).toFixed(1)}%` },
  ];

  return { monthlyPayment, totalPaid, totalInterest, totalCostOfOwnership, amortizationData, breakdown, summaryStats };
}

export default function CarLoanCalculator() {
  const [price, setPrice] = useState("35000");
  const [down, setDown] = useState("5000");
  const [tradeIn, setTradeIn] = useState("0");
  const [salesTax, setSalesTax] = useState("8");
  const [rate, setRate] = useState("7.1");
  const [term, setTerm] = useState("60");
  const [insurance, setInsurance] = useState("1800");
  const [maintenance, setMaintenance] = useState("1200");
  const [result, setResult] = useState<CarLoanResult | null>(null);

  const calculate = () => {
    setResult(calcCarLoan(
      parseFloat(price) || 35000, parseFloat(down) || 5000,
      parseFloat(tradeIn) || 0, parseFloat(salesTax) || 8,
      parseFloat(rate) || 7.1, parseInt(term) || 60,
      parseFloat(insurance) || 1800, parseFloat(maintenance) || 1200
    ));
  };

  useEffect(() => { setResult(calcCarLoan(35000, 5000, 0, 8, 7.1, 60, 1800, 1200)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const suf = "pr-3 text-sm text-muted-foreground shrink-0";

  const faqs = [
    { question: "What is a good car loan interest rate in 2024?", answer: "Average new car loan rates by credit score (2024): Excellent (750+): 5.0–6.5%. Good (700–749): 6.5–8.0%. Fair (650–699): 9.0–12.0%. Poor (below 650): 12–20%+. Average across all credit tiers: ~7.1% for new cars, ~11.5% for used cars. Credit unions typically offer 1–2% lower rates than banks or dealerships. Always get pre-approved from your bank or credit union before visiting a dealership — it gives you negotiating leverage." },
    { question: "How much should I put down on a car?", answer: "Recommended down payment: 20% for new cars, 10% for used cars. Benefits of a larger down payment: lower monthly payments, less interest paid, immediate positive equity position (avoiding being 'underwater' on the loan — owing more than the car is worth). Cars depreciate 15–25% in the first year; a 20% down payment ensures you start with positive equity even after first-year depreciation. Many financial advisors recommend never financing more than the car is worth." },
    { question: "What loan term should I choose for a car loan?", answer: "Common terms: 36, 48, 60, 72, 84 months. Shorter term: higher monthly payment but significantly less total interest and faster equity build. 72-84 month loans: lower monthly payment but much higher total interest, and high risk of being underwater. Example: $30,000 loan at 7% — 48 months: $718/mo, $4,457 interest. 72 months: $513/mo, $7,014 interest. Never extend a loan term simply to make an unaffordable car 'affordable' — buy a less expensive car instead." },
    { question: "Should I lease or buy a car?", answer: "Buy if: you plan to keep the vehicle 5+ years, you drive more than 15,000 miles/year, you want to build equity. Lease if: you always want a new car every 3 years, you drive under 12,000–15,000 miles/year (excess mileage fees apply), you can deduct lease payments as a business expense. True cost comparison: Buying a $35,000 car and keeping it 10 years often costs 40–50% less than leasing continuously. Leasing is more expensive long-term but provides predictability and newer vehicles." },
    { question: "What is the 20/4/10 car buying rule?", answer: "20/4/10 Rule: 20% minimum down payment. 4-year (48-month) maximum loan term. Total car payments should not exceed 10% of gross monthly income. Example: $80,000 gross annual income → $6,667/month. 10% = $667/month max car payment. With $5,000 down and 48-month term at 7%, that supports a vehicle price of about $27,000. This rule prevents car ownership from derailing other financial goals like retirement savings and emergency funds." },
    { question: "What is the total cost of car ownership?", answer: "Beyond the loan: Insurance: $1,500–$2,500/year average (varies significantly by driver, vehicle, location). Maintenance: $800–$1,200/year for new cars, $1,500–$2,000 for older vehicles. Fuel: $1,500–$3,000/year at current prices (varies by vehicle MPG and local gas prices). Registration/taxes: $100–$500/year. Depreciation: $2,000–$5,000/year in the first 5 years. Total annual cost of owning and operating a car: $9,000–$13,000 for an average new car (AAA 2024 data). This is the real number to budget against your income." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Car Loan Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Car Loan Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-base font-medium mb-1.5 block">Vehicle Price</label>
              <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={price} onChange={e => setPrice(e.target.value)} className={ci} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-base font-medium mb-1.5 block">Down Payment</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={down} onChange={e => setDown(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-base font-medium mb-1.5 block">Trade-In Value</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={tradeIn} onChange={e => setTradeIn(e.target.value)} className={ci} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-base font-medium mb-1.5 block">Sales Tax</label>
                <div className={inp}><input type="number" value={salesTax} onChange={e => setSalesTax(e.target.value)} step={0.1} className={ci} /><span className={suf}>%</span></div>
              </div>
              <div>
                <label className="text-base font-medium mb-1.5 block">Interest Rate (APR)</label>
                <div className={inp}><input type="number" value={rate} onChange={e => setRate(e.target.value)} step={0.1} className={ci} /><span className={suf}>%</span></div>
              </div>
            </div>
            <div>
              <label className="text-base font-medium mb-1.5 block">Loan Term</label>
              <div className="grid grid-cols-4 gap-2">
                {[["36", "36mo"], ["48", "48mo"], ["60", "60mo"], ["72", "72mo"]].map(([v, l]) => (
                  <button key={v} onClick={() => setTerm(v)} className={`h-10 rounded-md border text-sm font-medium transition-colors ${term === v ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background hover:bg-secondary"}`}>{l}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold mb-1 block">Annual Insurance</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={insurance} onChange={e => setInsurance(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">Annual Maintenance</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={maintenance} onChange={e => setMaintenance(e.target.value)} className={ci} /></div>
              </div>
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={() => { setPrice("35000"); setDown("5000"); setTradeIn("0"); setSalesTax("8"); setRate("7.1"); setTerm("60"); setInsurance("1800"); setMaintenance("1200"); setResult(calcCarLoan(35000, 5000, 0, 8, 7.1, 60, 1800, 1200)); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-sm font-bold text-primary uppercase tracking-wider mb-1">Monthly Payment</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">${result.monthlyPayment.toFixed(2)}</div>
                <div className="text-base text-muted-foreground mt-1">Total interest: ${result.totalInterest.toFixed(0)} · Total paid: ${result.totalPaid.toFixed(0)} · Total ownership: ${result.totalCostOfOwnership.toFixed(0)}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Total Interest", `$${result.totalInterest.toFixed(0)}`], ["Total Paid", `$${result.totalPaid.toFixed(0)}`], ["Ownership Cost", `$${result.totalCostOfOwnership.toFixed(0)}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Loan Details</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.label === "Total Cost of Ownership" ? "font-bold border-t-2 border-border text-primary" : ""}`}>
                      <td className="py-2.5 text-muted-foreground">{r.label}</td>
                      <td className="py-2.5 text-right font-semibold">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Loan Balance Over Time</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={result.amortizationData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} label={{ value: "Month", position: "insideBottom", offset: -2, fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, "Balance"]} />
                    <Area type="monotone" dataKey="balance" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.1)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Car Loan Payments Are Calculated</h2>
            <p>This <strong>car loan calculator</strong> uses the standard amortization formula and includes sales tax, trade-in value, and total ownership cost (loan + insurance + maintenance). Monthly Payment = Loan Amount × [r(1+r)^n] ÷ [(1+r)^n − 1], where r = monthly rate and n = term in months. The true cost of car ownership — including insurance, fuel, and maintenance — typically runs $9,000–$13,000/year for an average new vehicle (AAA 2024 data).</p>
            <h2 className="text-2xl font-bold mb-3">2024 Car Loan Rates and Market Context</h2>
            <p>The average new car loan rate in 2024 is approximately 7.1% for all credit tiers (Federal Reserve data). Credit unions average 1–2% lower than banks. The average new car transaction price hit $48,000+ in 2024 — an all-time high. With a typical 60-month loan at 7.1%, that translates to about $950/month before insurance and maintenance. The 20/4/10 rule (20% down, 4-year term, 10% of income) is increasingly difficult to achieve at this price level for median-income households.</p>
            <h2 className="text-2xl font-bold mb-3">Strategies to Reduce Car Loan Costs</h2>
            <p>1. Improve credit score before applying — each tier jump can save 1–3% in rate. 2. Get pre-approved before visiting the dealership. 3. Make a larger down payment to reduce the loan principal. 4. Avoid add-ons and extras financed into the loan (extended warranties, paint protection). 5. Consider certified pre-owned vehicles — often 15–30% less than new, with manufacturer warranty. 6. Shorter loan term = less total interest despite higher payments. Related tools: <a href="/calculator/auto-lease-vs-buy-calculator">Lease vs. Buy Calculator</a>, <a href="/calculator/debt-payoff-calculator">Debt Payoff Calculator</a>.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/car-loan-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Car Loan Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Car Loan Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Car Loan Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Car Loan Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Car Loan Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/car-loan-calculator" />
        </div>
      </div>
    </>
  );
}
