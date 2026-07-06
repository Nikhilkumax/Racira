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

interface TotalLoanInputs {
  principal: number;
  aprPct: number;
  termYears: number;
  originationFee: number;
  docFee: number;
}

interface TotalLoanResults {
  monthlyPayment: number;
  totalPrincipal: number;
  totalInterest: number;
  totalFees: number;
  totalCost: number;
  totalPayments: number;
  aprEffective: number;
  rows: AmortRow[];
}

const DEFAULTS: TotalLoanInputs = {
  principal: 25000,
  aprPct: 8.4,
  termYears: 5,
  originationFee: 250,
  docFee: 150,
};

function calculate(input: TotalLoanInputs): TotalLoanResults {
  const principal = Math.max(0, input.principal);
  const apr = Math.max(0, input.aprPct);
  const term = Math.max(0.083, input.termYears); // min ~1 month
  const fees = Math.max(0, input.originationFee) + Math.max(0, input.docFee);

  const monthlyPayment = pmt(principal, apr, term);
  const rows = amortize(principal, apr, term);
  const ti = totalInterest(rows);
  const totalPayments = rows.reduce((s, r) => s + r.payment + (r.extraPayment ?? 0), 0);
  const totalCost = totalPayments + fees;
  const aprEffective = principal > 0 ? ((ti + fees) / principal / Math.max(1, term)) * 100 : 0;

  return {
    monthlyPayment,
    totalPrincipal: principal,
    totalInterest: ti,
    totalFees: fees,
    totalCost,
    totalPayments,
    aprEffective,
    rows,
  };
}

const CompactInput = ({
  id, label, value, onChange, prefix, suffix,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input id={id} type="number" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const TotalLoanCostCalculator = () => {
  const [principal, setPrincipal] = useState(String(DEFAULTS.principal));
  const [aprPct, setAprPct] = useState(String(DEFAULTS.aprPct));
  const [termYears, setTermYears] = useState(String(DEFAULTS.termYears));
  const [originationFee, setOriginationFee] = useState(String(DEFAULTS.originationFee));
  const [docFee, setDocFee] = useState(String(DEFAULTS.docFee));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState<TotalLoanResults | null>(null);

  const inputs: TotalLoanInputs = useMemo(() => ({
    principal: parseFloat(principal) || 0,
    aprPct: parseFloat(aprPct) || 0,
    termYears: parseFloat(termYears) || 0,
    originationFee: parseFloat(originationFee) || 0,
    docFee: parseFloat(docFee) || 0,
  }), [principal, aprPct, termYears, originationFee, docFee]);

  useEffect(() => { setResults(calculate(DEFAULTS)); }, []);

  const handleCalculate = () => setResults(calculate(inputs));
  const reset = () => {
    setPrincipal(String(DEFAULTS.principal));
    setAprPct(String(DEFAULTS.aprPct));
    setTermYears(String(DEFAULTS.termYears));
    setOriginationFee(String(DEFAULTS.originationFee));
    setDocFee(String(DEFAULTS.docFee));
    setShowAdvanced(false);
    setResults(calculate(DEFAULTS));
  };

  const yearlyRows = useMemo(() => {
    if (!results) return [];
    const yearly: AmortRow[] = [];
    for (let i = 0; i < results.rows.length; i += 12) {
      const slice = results.rows.slice(i, i + 12);
      yearly.push({
        period: Math.floor(i / 12) + 1,
        payment: slice.reduce((s, r) => s + r.payment, 0),
        principal: slice.reduce((s, r) => s + r.principal, 0),
        interest: slice.reduce((s, r) => s + r.interest, 0),
        balance: slice[slice.length - 1]?.balance ?? 0,
      });
    }
    return yearly;
  }, [results]);

  const pieData = results ? [
    { name: "Principal", value: Math.round(results.totalPrincipal), color: "#3b82f6" },
    { name: "Interest", value: Math.round(results.totalInterest), color: "#f59e0b" },
    { name: "Fees", value: Math.round(results.totalFees), color: "#8b5cf6" },
  ] : [];
  const activePieData = pieData.filter((d) => d.value > 0);

  const faqs = [
    { question: "What is the total cost of a loan?", answer: "The total cost of a loan is the sum of every dollar you pay over the life of the loan: the principal (the amount borrowed), all interest charges, and any fees such as origination, documentation, or application fees. It is the true price tag of borrowing." },
    { question: "How is interest calculated on a loan?", answer: "Interest accrues monthly on the outstanding principal balance using your APR. The standard amortization formula M = P×r(1+r)^n / ((1+r)^n − 1) computes the level monthly payment, where P is the principal, r is the monthly rate (APR ÷ 12), and n is the number of months." },
    { question: "What is the difference between APR and effective APR?", answer: "The stated APR is the annual interest rate your lender charges on the principal. The effective APR (or all-in cost rate) folds in fees and expresses the total cost as an annualized percentage of the principal. The effective APR is always higher than the stated APR when fees are charged." },
    { question: "Does a longer loan term reduce the total cost?", answer: "No — a longer term reduces the monthly payment but increases the total cost. Interest accrues for more months, so the same principal generates more total interest. Use this calculator to compare a 4-year vs 6-year term on the same loan to see the difference." },
    { question: "Should I include fees in the loan amount?", answer: "If your lender lets you finance fees (roll them into the principal), you pay interest on those fees too. We show fees as a separate line item so you can see how much they add to the total. Paying fees upfront at signing is cheaper than financing them." },
    { question: "Can I use this for any loan type?", answer: "Yes. This calculator works for any fixed-rate amortizing loan: auto, personal, student, mortgage, RV, or business. For variable-rate loans, the total cost estimate holds only if the rate stays constant — real results will differ." },
    { question: "What is amortization and why does it matter?", answer: "Amortization is the process of splitting each payment between principal and interest. Early payments are mostly interest; later payments are mostly principal. The schedule below shows exactly how each payment is split, helping you see how slowly the balance drops in the early years." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Transportation", href: "/calculator/transportation" }, { label: "Total Loan Cost" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Total Loan Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="principal" label="Loan Amount" value={principal} onChange={setPrincipal} prefix="$" />
              <CompactInput id="apr" label="Interest Rate" value={aprPct} onChange={setAprPct} suffix="%" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="term" label="Loan Term" value={termYears} onChange={setTermYears} suffix="years" />
              <div className="flex flex-col justify-end">
                <div className="text-xs text-muted-foreground leading-relaxed">Estimated payment: <span className="font-semibold text-foreground">{results ? `$${results.monthlyPayment.toFixed(0)}` : "—"}/mo</span></div>
              </div>
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CompactInput id="orig-fee" label="Origination Fee" value={originationFee} onChange={setOriginationFee} prefix="$" />
                  <CompactInput id="doc-fee" label="Doc / Application Fee" value={docFee} onChange={setDocFee} prefix="$" />
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
                  <button className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus:outline-none">
                    <Printer className="h-3.5 w-3.5" /> Print
                  </button>
                </div>

                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Total Cost of Loan</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">${Math.round(results.totalCost).toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground font-medium">Over {Math.round(inputs.termYears * 12)} payments at {inputs.aprPct.toFixed(2)}% APR</div>
                </div>

                <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden">
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Principal</div>
                    <div className="text-lg font-bold text-foreground">${Math.round(results.totalPrincipal).toLocaleString()}</div>
                  </div>
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Interest</div>
                    <div className="text-lg font-bold text-amber-600">${Math.round(results.totalInterest).toLocaleString()}</div>
                  </div>
                  <div className="p-3 text-center">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Fees</div>
                    <div className="text-lg font-bold text-violet-600">${Math.round(results.totalFees).toLocaleString()}</div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Cost Component</th>
                        <th className="p-2.5 text-right w-[110px]">Per Month</th>
                        <th className="p-2.5 pr-3 text-right w-[140px]">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      <tr className="text-muted-foreground hover:bg-secondary/20 transition-colors">
                        <td className="p-2.5 pl-3 font-semibold text-foreground">Principal Repayment</td>
                        <td className="p-2.5 text-right text-foreground">${(results.totalPrincipal / Math.max(1, Math.round(inputs.termYears * 12))).toFixed(0)}</td>
                        <td className="p-2.5 pr-3 text-right text-foreground font-semibold">${Math.round(results.totalPrincipal).toLocaleString()}</td>
                      </tr>
                      <tr className="text-muted-foreground hover:bg-secondary/20 transition-colors">
                        <td className="p-2.5 pl-3 font-semibold text-foreground">Interest Charges</td>
                        <td className="p-2.5 text-right text-foreground">${(results.totalInterest / Math.max(1, Math.round(inputs.termYears * 12))).toFixed(0)}</td>
                        <td className="p-2.5 pr-3 text-right text-amber-600 font-semibold">${Math.round(results.totalInterest).toLocaleString()}</td>
                      </tr>
                      <tr className="text-muted-foreground hover:bg-secondary/20 transition-colors">
                        <td className="p-2.5 pl-3 font-semibold text-foreground">Fees (one-time)</td>
                        <td className="p-2.5 text-right text-foreground">—</td>
                        <td className="p-2.5 pr-3 text-right text-violet-600 font-semibold">${Math.round(results.totalFees).toLocaleString()}</td>
                      </tr>
                      <tr className="font-bold bg-secondary/30 text-foreground text-base border-t border-border">
                        <td className="p-2.5 pl-3">Total Loan Cost</td>
                        <td className="p-2.5 text-right">${results.monthlyPayment.toFixed(0)}</td>
                        <td className="p-2.5 pr-3 text-right text-primary">${Math.round(results.totalCost).toLocaleString()}</td>
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
                              {activePieData.map((entry, i) => <Cell key={`cell-${i}`} fill={entry.color} />)}
                            </Pie>
                            <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">Total</span>
                          <span className="text-lg font-extrabold text-foreground">${Math.round(results.totalCost).toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="w-full sm:w-1/2 flex flex-col gap-2">
                    {activePieData.map((d) => {
                      const pct = results.totalCost > 0 ? (d.value / results.totalCost) * 100 : 0;
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
                    <div className="flex justify-between"><span className="text-muted-foreground">Loan amount:</span><span className="font-medium text-foreground">${Math.round(inputs.principal).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">APR:</span><span className="font-medium text-foreground">{inputs.aprPct.toFixed(2)}%</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Term:</span><span className="font-medium text-foreground">{inputs.termYears} years</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Monthly payment:</span><span className="font-medium text-foreground">${results.monthlyPayment.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Total payments:</span><span className="font-medium text-foreground">${Math.round(results.totalPayments).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Effective APR:</span><span className="font-medium text-foreground">{results.aprEffective.toFixed(2)}%</span></div>
                  </div>
                  <div className="border-t border-border mt-3 pt-3 flex justify-between text-base">
                    <span className="font-semibold text-foreground">Total loan cost:</span>
                    <span className="font-bold text-primary">${Math.round(results.totalCost).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is the Total Loan Cost Calculator?</h2>
            <p>The Total Loan Cost Calculator reveals the true, all-in price of borrowing. Instead of focusing only on the monthly payment, it sums every dollar you will pay across the life of a loan — the principal, all interest charges, and any fees — so you can compare loans on equal footing and understand what borrowing really costs you.</p>
            <p>Borrowers often fixate on the monthly payment and discover too late that a longer term doubled their interest cost. This calculator makes the full cost obvious up front, with a per-component breakdown, an annual amortization schedule, and an effective APR that includes fees. It works for any fixed-rate amortizing loan.</p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>The monthly payment on a fixed-rate loan follows the standard amortization formula:</p>
            <p><strong>M = P × r(1+r)<sup>n</sup> / ((1+r)<sup>n</sup> − 1)</strong></p>
            <p>where P is the principal, r is the monthly interest rate (APR ÷ 12), and n is the total number of monthly payments. Multiplying that payment by n gives the total of all scheduled payments. The principal portion of those payments equals P (you pay back exactly what you borrowed), and the remainder is interest. Adding any upfront fees produces the total loan cost.</p>
            <p>The effective APR expresses (interest + fees) as an annualized percentage of the principal, giving you an apples-to-apples comparison rate that includes the cost of fees. A loan with a low stated APR but high fees can have a surprisingly high effective APR.</p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>The primary result card shows the total loan cost in dollars. The 3-stat bar splits that figure into principal, interest, and fees so you can see which component dominates. The breakdown table expresses each component as a per-month and total figure, then totals everything. The donut chart visualizes the share of each component in the total. The yearly amortization schedule shows how each year's payments split between principal and interest — useful for understanding why the balance drops slowly early in the loan.</p>

            <h2 className="text-2xl font-bold mb-3">Key Factors That Drive the Total Cost</h2>
            <ul>
              <li><strong>Principal:</strong> The amount you borrow. Every additional dollar borrowed accrues interest, so borrow only what you need.</li>
              <li><strong>APR:</strong> The annual interest rate. Lower APRs dramatically reduce total cost. Even a 1% difference on a $25,000 five-year loan can change the total cost by $700+.</li>
              <li><strong>Term:</strong> Longer terms lower the monthly payment but raise the total cost — more months mean more interest. Compare 48 vs 60 vs 72 month terms to see the trade-off.</li>
              <li><strong>Origination fees:</strong> One-time fees charged at funding. These add directly to total cost and push the effective APR above the stated rate.</li>
              <li><strong>Documentation / application fees:</strong> Sometimes optional and negotiable. Paying these upfront rather than financing them avoids paying interest on the fees themselves.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Advanced Features</h2>
            <p>The Advanced Options panel exposes origination and documentation fees. Lenders quote these in different ways — flat dollar amounts, percentages of the loan, or both — so the calculator accepts dollar figures for flexibility. If your lender charges a percentage, multiply it by the loan amount and enter the dollar equivalent.</p>

            <h2 className="text-2xl font-bold mb-3">Practical Examples</h2>
            <h3>Example 1: A typical auto loan</h3>
            <p>A $25,000 auto loan at 8.4% APR for 60 months has a monthly payment of about $512. Over five years you pay $30,720 in total payments — $5,720 of interest on top of the $25,000 principal. Adding a $400 documentation fee brings the total cost to $31,120, with an effective APR of about 8.7%.</p>
            <h3>Example 2: Term comparison</h3>
            <p>That same $25,000 at 8.4% stretched to 72 months drops the payment to $443 but raises total interest from $5,720 to $6,910. You save $69/month but pay $1,190 more over the life of the loan. The shorter term is cheaper in total but demands a higher monthly payment.</p>
            <h3>Example 3: Fee-heavy personal loan</h3>
            <p>A $10,000 personal loan at 11% APR for 36 months with a 6% origination fee ($600) plus a $75 documentation fee has a stated APR of 11% but an effective APR closer to 14.6% once fees are annualized. The total cost climbs from roughly $11,770 (no fees) to $12,445 with fees included.</p>

            <h2 className="text-2xl font-bold mb-3">Tips & Best Practices</h2>
            <ul>
              <li><strong>Compare total cost, not just monthly payment.</strong> A lower payment often hides a higher total cost via a longer term.</li>
              <li><strong>Negotiate or avoid fees.</strong> Origination and documentation fees are sometimes waived, especially at credit unions.</li>
              <li><strong>Pay fees upfront.</strong> Financing fees means paying interest on them, raising both total cost and effective APR.</li>
              <li><strong>Shop multiple lenders.</strong> A 1% APR difference compounds significantly. Get at least three quotes.</li>
              <li><strong>Round down the loan amount.</strong> Borrowing $24,500 instead of $25,000 saves interest across every remaining month.</li>
              <li><strong>Pre-qualify to compare rates without dinging your credit.</strong> Soft-pull pre-qualification lets you see real offers before committing.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Benefits of Using This Calculator</h2>
            <p>By surfacing the full lifetime cost of borrowing, this calculator protects you from payment-focused marketing traps. It lets you compare loans on equal footing (effective APR), see how term and fees change the bottom line, and decide confidently whether a given loan fits your budget and goals. Combined with the Early Loan Payoff Calculator, it gives you a complete picture of both the cost of taking a loan and the savings of paying it off early.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/total-loan-cost-calculator" />
          <PopularCalculators exclude="/calculator/total-loan-cost-calculator" />
        </div>
      </div>
    </>
  );
};

export default TotalLoanCostCalculator;
