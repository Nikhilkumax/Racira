"use client";

import { useState, useEffect, useMemo } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import AmortizationTable from "@/domains/calculator/components/ui/AmortizationTable";
import { ChevronDown, RotateCcw, Calculator, Printer } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { pmt, amortize, totalInterest, type AmortRow } from "@/lib/auto/autoFinance";

interface FinancingInputs {
  loanAmount: number;
  aprPct: number;
  termMonths: number;
  downPayment: number;
  salesTaxPct: number;
}

interface FinancingResults {
  totalInterest: number;
  totalPayments: number;
  totalCost: number;
  monthlyPayment: number;
  principal: number;
  interestRatio: number;
  dailyInterestAvg: number;
  firstYearInterest: number;
  firstYearPrincipal: number;
  lastYearInterest: number;
  lastYearPrincipal: number;
  rows: AmortRow[];
}

const DEFAULTS: FinancingInputs = {
  loanAmount: 28000,
  aprPct: 7.5,
  termMonths: 60,
  downPayment: 5000,
  salesTaxPct: 7,
};

function calculate(input: FinancingInputs): FinancingResults {
  const principal = Math.max(0, input.loanAmount);
  const apr = Math.max(0, input.aprPct);
  const term = Math.max(1, Math.round(input.termMonths));
  const years = term / 12;

  const monthlyPayment = pmt(principal, apr, years);
  const rows = amortize(principal, apr, years);
  const ti = totalInterest(rows);
  const totalPayments = rows.reduce((s, r) => s + r.payment + (r.extraPayment ?? 0), 0);
  const totalCost = totalPayments + Math.max(0, input.downPayment);
  const interestRatio = totalPayments > 0 ? ti / totalPayments : 0;
  const dailyInterestAvg = ti / Math.max(1, term * 30);

  const firstYearRows = rows.filter((r) => r.period <= 12);
  const firstYearInterest = firstYearRows.reduce((s, r) => s + r.interest, 0);
  const firstYearPrincipal = firstYearRows.reduce((s, r) => s + r.principal, 0);

  const lastYear = Math.max(1, Math.ceil(term / 12));
  const lastYearRows = rows.filter((r) => r.period > (lastYear - 1) * 12);
  const lastYearInterest = lastYearRows.reduce((s, r) => s + r.interest, 0);
  const lastYearPrincipal = lastYearRows.reduce((s, r) => s + r.principal, 0);

  return {
    totalInterest: ti, totalPayments, totalCost, monthlyPayment,
    principal, interestRatio, dailyInterestAvg,
    firstYearInterest, firstYearPrincipal,
    lastYearInterest, lastYearPrincipal,
    rows,
  };
}

const CI = ({ id, label, value, onChange, prefix, suffix }: { id: string; label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string; }) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input id={id} type="number" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const CarFinancingInterestCalculator = () => {
  const [loanAmount, setLoanAmount] = useState(String(DEFAULTS.loanAmount));
  const [aprPct, setAprPct] = useState(String(DEFAULTS.aprPct));
  const [termMonths, setTermMonths] = useState(String(DEFAULTS.termMonths));
  const [downPayment, setDownPayment] = useState(String(DEFAULTS.downPayment));
  const [salesTaxPct, setSalesTaxPct] = useState(String(DEFAULTS.salesTaxPct));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState<FinancingResults | null>(null);

  const inputs: FinancingInputs = useMemo(() => ({
    loanAmount: parseFloat(loanAmount) || 0,
    aprPct: parseFloat(aprPct) || 0,
    termMonths: parseFloat(termMonths) || 0,
    downPayment: parseFloat(downPayment) || 0,
    salesTaxPct: parseFloat(salesTaxPct) || 0,
  }), [loanAmount, aprPct, termMonths, downPayment, salesTaxPct]);

  useEffect(() => { setResults(calculate(DEFAULTS)); }, []);

  const handleCalculate = () => setResults(calculate(inputs));
  const reset = () => {
    setLoanAmount(String(DEFAULTS.loanAmount));
    setAprPct(String(DEFAULTS.aprPct));
    setTermMonths(String(DEFAULTS.termMonths));
    setDownPayment(String(DEFAULTS.downPayment));
    setSalesTaxPct(String(DEFAULTS.salesTaxPct));
    setShowAdvanced(false);
    setResults(calculate(DEFAULTS));
  };

  const yearlyRows = useMemo(() => {
    if (!results) return [];
    const out: AmortRow[] = [];
    for (let i = 0; i < results.rows.length; i += 12) {
      const s = results.rows.slice(i, i + 12);
      out.push({ period: Math.floor(i / 12) + 1, payment: s.reduce((a, r) => a + r.payment, 0), principal: s.reduce((a, r) => a + r.principal, 0), interest: s.reduce((a, r) => a + r.interest, 0), balance: s[s.length - 1]?.balance ?? 0 });
    }
    return out;
  }, [results]);

  const pieData = results ? [
    { name: "Principal", value: Math.round(results.principal), color: "#3b82f6" },
    { name: "Interest", value: Math.round(results.totalInterest), color: "#f59e0b" },
  ] : [];
  const activePieData = pieData.filter((d) => d.value > 0);

  const faqs = [
    { question: "How is car financing interest calculated?", answer: "Interest accrues monthly on the remaining principal balance. The standard amortization formula M = P × r(1+r)^n / ((1+r)^n − 1) ensures a level payment where early payments are mostly interest and later payments are mostly principal." },
    { question: "Why is so much interest paid in the first year?", answer: "Because the balance is highest in year 1. Interest = balance × monthly rate, so when the balance is largest (right after you borrow), interest consumes the biggest share of each payment." },
    { question: "How can I reduce total financing interest?", answer: "Lower the APR (shop multiple lenders), shorten the term, make a larger down payment, or make extra principal payments. Every dollar of extra principal reduces the balance that accrues interest in all future months." },
    { question: "What is a good interest-to-principal ratio?", answer: "Lower is better. A ratio under 15% is excellent (short term, low rate). 15–25% is typical for a 5-year loan at market rates. Above 30% means you are paying heavily for financing — consider a shorter term or larger down payment." },
    { question: "Does a 0% APR deal really cost zero interest?", answer: "Yes, the financing cost is zero. However, dealers often raise the vehicle price or reduce the trade-in value to compensate. Always compare the total out-of-door cost of a 0% deal versus a cash/negotiated deal with a standard rate." },
    { question: "What is the daily cost of interest?", answer: "Divide total interest by the number of days in the loan term (months × 30). This figure shows the daily cost of borrowing and makes the total interest easier to understand in tangible terms — for example, $9/day is about the cost of a premium coffee." },
    { question: "How does refinancing affect total interest?", answer: "Refinancing to a lower APR on the remaining balance reduces future interest. The key metric is whether the new rate is low enough and the remaining term long enough to offset any refinancing fees. Use the calculator with the new rate and remaining balance to compare." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Transportation", href: "/calculator/transportation" }, { label: "Car Financing Interest" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Car Financing Interest Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CI id="amount" label="Loan Amount" value={loanAmount} onChange={setLoanAmount} prefix="$" />
              <CI id="apr" label="Interest Rate" value={aprPct} onChange={setAprPct} suffix="%" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CI id="term" label="Loan Term" value={termMonths} onChange={setTermMonths} suffix="months" />
              <CI id="down" label="Down Payment" value={downPayment} onChange={setDownPayment} prefix="$" />
            </div>
            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CI id="tax" label="Sales Tax Rate" value={salesTaxPct} onChange={setSalesTaxPct} suffix="%" />
                  <div className="flex flex-col justify-end">
                    <p className="text-xs text-muted-foreground leading-relaxed">Sales tax applies to financed amount in most states.</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2.5 mt-2.5">
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-9 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-9 transition-colors flex items-center justify-center focus:outline-none" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {results && (
              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                <div className="flex justify-end">
                  <button className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus:outline-none"><Printer className="h-3.5 w-3.5" /> Print</button>
                </div>

                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Total Financing Interest</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">${Math.round(results.totalInterest).toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground font-medium">${(results.interestRatio * 100).toFixed(1)}% of total payments · ~${results.dailyInterestAvg.toFixed(2)}/day</div>
                </div>

                <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden">
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Principal</div>
                    <div className="text-lg font-bold text-foreground">${Math.round(results.principal).toLocaleString()}</div>
                  </div>
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Interest</div>
                    <div className="text-lg font-bold text-amber-600">${Math.round(results.totalInterest).toLocaleString()}</div>
                  </div>
                  <div className="p-3 text-center">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Monthly Pmt</div>
                    <div className="text-lg font-bold text-foreground">${results.monthlyPayment.toFixed(0)}</div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Period</th>
                        <th className="p-2.5 text-right w-[110px]">Interest</th>
                        <th className="p-2.5 text-right w-[110px]">Principal</th>
                        <th className="p-2.5 pr-3 text-right w-[100px]">I / P Ratio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      <tr className="text-muted-foreground hover:bg-secondary/20 transition-colors">
                        <td className="p-2.5 pl-3 font-semibold text-foreground">Year 1</td>
                        <td className="p-2.5 text-right text-red-600 font-medium">${Math.round(results.firstYearInterest).toLocaleString()}</td>
                        <td className="p-2.5 text-right text-foreground">${Math.round(results.firstYearPrincipal).toLocaleString()}</td>
                        <td className="p-2.5 pr-3 text-right text-foreground">{(results.firstYearInterest / Math.max(1, results.firstYearPrincipal)).toFixed(1)}×</td>
                      </tr>
                      <tr className="text-muted-foreground hover:bg-secondary/20 transition-colors">
                        <td className="p-2.5 pl-3 font-semibold text-foreground">Final Year</td>
                        <td className="p-2.5 text-right text-emerald-600 font-medium">${Math.round(results.lastYearInterest).toLocaleString()}</td>
                        <td className="p-2.5 text-right text-foreground">${Math.round(results.lastYearPrincipal).toLocaleString()}</td>
                        <td className="p-2.5 pr-3 text-right text-foreground">{(results.lastYearInterest / Math.max(1, results.lastYearPrincipal)).toFixed(2)}×</td>
                      </tr>
                      <tr className="font-bold bg-secondary/30 text-foreground text-base border-t border-border">
                        <td className="p-2.5 pl-3">Total Over Term</td>
                        <td className="p-2.5 text-right text-amber-600">${Math.round(results.totalInterest).toLocaleString()}</td>
                        <td className="p-2.5 text-right">${Math.round(results.principal).toLocaleString()}</td>
                        <td className="p-2.5 pr-3 text-right">${(results.interestRatio * 100).toFixed(1)}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl border border-border bg-card">
                  <div className="w-full sm:w-1/2 flex justify-center shrink-0">
                    {activePieData.length > 0 && (
                      <div className="w-[200px] h-[200px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie data={activePieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value">
                              {activePieData.map((entry, i) => <Cell key={`c-${i}`} fill={entry.color} />)}
                            </Pie>
                            <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">I / P</span>
                          <span className="text-lg font-extrabold text-foreground">{(results.interestRatio * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="w-full sm:w-1/2 flex flex-col gap-2">
                    {activePieData.map((d) => {
                      const pct = results.totalPayments > 0 ? (d.value / results.totalPayments) * 100 : 0;
                      return (
                        <div key={d.name} className="flex items-center gap-2 text-sm">
                          <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: d.color }} />
                          <span className="text-foreground font-medium flex-1">{d.name}</span>
                          <span className="text-muted-foreground tabular-nums">{pct.toFixed(1)}%</span>
                          <span className="font-bold text-foreground tabular-nums">${d.value.toLocaleString()}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <AmortizationTable rows={yearlyRows} yearly currency="$" />

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-semibold text-foreground mb-3">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-base">
                    <div className="flex justify-between"><span className="text-muted-foreground">Loan amount:</span><span className="font-medium text-foreground">${Math.round(inputs.loanAmount).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">APR:</span><span className="font-medium text-foreground">{inputs.aprPct.toFixed(2)}%</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Term:</span><span className="font-medium text-foreground">{Math.round(inputs.termMonths)} months</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Down payment:</span><span className="font-medium text-foreground">${Math.round(inputs.downPayment).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Total payments:</span><span className="font-medium text-foreground">${Math.round(results.totalPayments).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Avg daily interest:</span><span className="font-medium text-foreground">${results.dailyInterestAvg.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Year 1 interest:</span><span className="font-medium text-foreground">${Math.round(results.firstYearInterest).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Year 1 principal:</span><span className="font-medium text-foreground">${Math.round(results.firstYearPrincipal).toLocaleString()}</span></div>
                  </div>
                  <div className="border-t border-border mt-3 pt-3 flex justify-between text-base">
                    <span className="font-semibold text-foreground">Total interest cost:</span>
                    <span className="font-bold text-primary">${Math.round(results.totalInterest).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is the Car Financing Interest Calculator?</h2>
            <p>The Car Financing Interest Calculator shows you exactly how much interest you will pay over the life of an auto loan, how the interest-to-principal ratio changes from year to year, and what the daily cost of borrowing really is. It provides a year-by-year amortization schedule and a first-year versus final-year comparison that makes the front-loaded nature of loan interest easy to understand.</p>
            <p>Whether you are comparing two loan offers, evaluating a refinance, or simply trying to understand the true cost of dealer financing, this tool gives you a clear, mathematically precise picture of every dollar of interest you will pay and when it accrues.</p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>Auto loans use simple interest amortization. Each month, interest = balance × (APR ÷ 12). The remaining portion of your fixed payment goes to principal. Because the balance shrinks over time, the interest portion shrinks and the principal portion grows. The standard level-payment formula is:</p>
            <p><strong>M = P × r(1+r)<sup>n</sup> / ((1+r)<sup>n</sup> − 1)</strong></p>
            <p>where P is the loan principal, r is the monthly rate (APR ÷ 12), and n is the total number of payments. This calculator runs the full schedule, then extracts first-year and final-year figures, daily interest averages, and the overall interest-to-principal ratio.</p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>The primary card shows total interest in dollars plus the percentage of total payments that goes to interest and the equivalent daily cost. The 3-stat bar compares principal, interest, and monthly payment. The breakdown table highlights the dramatic difference between year 1 (where interest dominates) and the final year (where principal dominates). The pie chart shows the principal/interest split, and the yearly amortization table provides the full schedule.</p>

            <h2 className="text-2xl font-bold mb-3">Key Factors That Affect Financing Interest</h2>
            <ul>
              <li><strong>APR:</strong> The single biggest factor. A 1% drop on a $28,000 five-year loan saves about $770 in total interest. Shop multiple lenders.</li>
              <li><strong>Loan term:</strong> Longer terms mean more months of interest accrual. A 72-month loan on $28,000 at 7.5% costs $2,600+ more in interest than a 48-month loan.</li>
              <li><strong>Down payment:</strong> A larger down payment reduces the principal, which reduces every future interest calculation proportionally.</li>
              <li><strong>Loan amount:</strong> Interest scales linearly with principal. Borrowing less is the most direct way to pay less interest.</li>
              <li><strong>Credit score:</strong> Higher credit scores unlock lower APRs. A score above 750 typically gets the best rates; below 650 means subprime rates of 12–20%+.</li>
              <li><strong>New vs used:</strong> Used-car loans typically carry 1–3% higher APRs than new-car loans, reflecting the lender's higher risk on a depreciating asset.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Advanced Features</h2>
            <p>The Advanced Options panel exposes the sales tax rate. In most states, sales tax on a financed vehicle is either paid upfront or rolled into the loan amount. Either way, if the tax is financed, you pay interest on it — which this calculator captures by applying the tax to the loan principal.</p>

            <h2 className="text-2xl font-bold mb-3">Practical Examples</h2>
            <h3>Example 1: Typical mid-range auto loan</h3>
            <p>A $28,000 loan at 7.5% APR for 60 months carries a monthly payment of about $561 and total interest of $5,660. Interest is 16.8% of total payments, averaging $3.10/day. In year 1, you pay $1,960 in interest versus $4,770 in principal. By the final year, the ratio flips to $530 interest versus $6,195 principal.</p>
            <h3>Example 2: High-rate subprime loan</h3>
            <p>The same $28,000 at 15% APR for 60 months has a payment of $666 and total interest of $11,960 — more than double the interest at 7.5%. Interest consumes 30% of total payments, costing $6.60/day. Year 1 interest is $3,910, nearly matching the principal paid.</p>
            <h3>Example 3: Short term, low rate</h3>
            <p>A $28,000 loan at 4.9% for 36 months has a payment of $836 and total interest of $2,100. Interest is just 7.5% of total payments, averaging $1.94/day. Short terms with low rates are the cheapest financing available.</p>

            <h2 className="text-2xl font-bold mb-3">Tips & Best Practices</h2>
            <ul>
              <li><strong>Pre-qualify with at least 3 lenders</strong> before visiting the dealer. Credit unions, online banks, and your personal bank may beat the dealer rate.</li>
              <li><strong>Make extra principal payments</strong> when possible. Even small extras early in the loan compound into significant interest savings.</li>
              <li><strong>Keep the term at 60 months or less</strong> if possible. Longer terms increase total interest and risk negative equity during early depreciation.</li>
              <li><strong>Improve your credit score</strong> before applying. A 100-point improvement can save 2–4% on APR, translating to thousands over the loan.</li>
              <li><strong>Avoid rolling add-ons into the loan.</strong> Extended warranties, gap insurance, and dealer add-ons are cheaper purchased separately than financed with interest.</li>
              <li><strong>Consider refinancing</strong> if rates drop significantly after you purchase. Use this calculator with the new rate and remaining balance to compare.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Benefits of Using This Calculator</h2>
            <p>This tool demystifies car loan interest by showing exactly when and how much interest accrues over the loan term. It makes the hidden cost of long terms and high rates tangible with the daily-interest metric, helps you compare offers on total interest rather than just monthly payment, and provides the amortization schedule you need to plan extra payments for maximum savings.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/car-financing-interest-calculator" />
          <PopularCalculators exclude="/calculator/car-financing-interest-calculator" />
        </div>
      </div>
    </>
  );
};

export default CarFinancingInterestCalculator;
