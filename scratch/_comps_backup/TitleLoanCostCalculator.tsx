"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, ChevronDown } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface TitleLoanInputs {
  amount: number;
  apr: number;
  termMonths: number;
  originationFee: number;
  installment: boolean;
}

interface TitleLoanResult {
  financeCharge: number;
  totalRepayment: number;
  totalCost: number;
  monthlyPayment: number | null;
  effectiveApr: number;
  chartData: { name: string; value: number; color: string }[];
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

function calcTitleLoan(inputs: TitleLoanInputs): TitleLoanResult {
  const monthlyRate = inputs.apr / 100 / 12;
  const financeCharge = inputs.amount * monthlyRate * inputs.termMonths;
  const totalRepayment = inputs.amount + financeCharge;
  const totalCost = totalRepayment + inputs.originationFee;
  const monthlyPayment = inputs.installment && inputs.termMonths > 0 ? totalRepayment / inputs.termMonths : null;
  const effectiveApr = inputs.amount > 0 ? ((financeCharge + inputs.originationFee) / inputs.amount) * (12 / Math.max(1, inputs.termMonths)) * 100 : 0;

  const chartData = [
    { name: "Principal", value: inputs.amount, color: "hsl(var(--primary))" },
    { name: "Finance Charge", value: financeCharge, color: "#ef4444" },
    { name: "Fees", value: inputs.originationFee, color: "#f59e0b" },
  ].filter((d) => d.value > 0);

  const breakdown: { label: string; value: string; highlight?: boolean }[] = [
    { label: "Loan Amount", value: `$${inputs.amount.toLocaleString()}` },
    { label: "Annual Percentage Rate", value: `${inputs.apr}%` },
    { label: "Monthly Rate", value: `${(inputs.apr / 12).toFixed(1)}%` },
    { label: "Loan Term", value: `${inputs.termMonths} months` },
    { label: "Finance Charge", value: `$${financeCharge.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, highlight: true },
    { label: "Origination Fee", value: `$${inputs.originationFee.toLocaleString()}` },
    { label: "Total Repayment (P + Charge)", value: `$${totalRepayment.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Total Cost to Repay", value: `$${totalCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, highlight: true },
  ];

  const summaryStats = [
    { label: "Total Cost to Repay", value: `$${totalCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Finance Charge", value: `$${financeCharge.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Monthly Payment", value: monthlyPayment ? `$${monthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Lump sum at end" },
    { label: "Effective APR", value: `${effectiveApr.toFixed(0)}%` },
    { label: "Charge as % of Loan", value: inputs.amount > 0 ? `${((financeCharge / inputs.amount) * 100).toFixed(0)}%` : "—" },
    { label: "Repayment Structure", value: inputs.installment ? "Monthly installments" : "Lump sum at end" },
  ];

  return { financeCharge, totalRepayment, totalCost, monthlyPayment, effectiveApr, chartData, breakdown, summaryStats };
}

const DEFAULTS: TitleLoanInputs = { amount: 1000, apr: 300, termMonths: 6, originationFee: 50, installment: true };

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
}

const CompactInput = ({ id, label, value, onChange, prefix, suffix }: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium text-foreground mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground shrink-0">{prefix}</span>}
      <input id={id} type="number" step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground shrink-0">{suffix}</span>}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload }: any) => active && payload?.length ? (
  <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold">
    <p className="font-bold text-muted-foreground mb-0.5">{payload[0].name}</p>
    <p className="text-primary font-extrabold text-sm">${payload[0].value.toLocaleString("en-US", { maximumFractionDigits: 2 })}</p>
  </div>
) : null;

export default function TitleLoanCostCalculator() {
  const [amount, setAmount] = useState("1000");
  const [apr, setApr] = useState("300");
  const [termMonths, setTermMonths] = useState("6");
  const [originationFee, setOriginationFee] = useState("50");
  const [installment, setInstallment] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<TitleLoanResult | null>(null);

  const calculate = () =>
    setResult(calcTitleLoan({
      amount: parseFloat(amount) || 0,
      apr: parseFloat(apr) || 0,
      termMonths: parseFloat(termMonths) || 0,
      originationFee: parseFloat(originationFee) || 0,
      installment,
    }));
  const reset = () => { setAmount(DEFAULTS.amount.toString()); setApr(DEFAULTS.apr.toString()); setTermMonths(DEFAULTS.termMonths.toString()); setOriginationFee(DEFAULTS.originationFee.toString()); setInstallment(DEFAULTS.installment); setShowAdvanced(false); calculate(); };
  useEffect(() => { calculate(); }, []);

  const faqs = [
    { question: "How do title loans work?", answer: "A title loan uses your vehicle's title as collateral. The lender holds the title while you keep driving the car. Title loans are short-term, high-cost loans — monthly finance fees of 15–30% are common, which translates to annual rates of 200–400% or more." },
    { question: "Why are title loan APRs so high?", answer: "Title lenders underwrite quickly with minimal credit checks, so they price in high default risk. The true cost is also hidden by quoting a 'monthly fee' instead of an annual rate. A 25% monthly fee on a $1,000 loan adds $250 every single month — $1,500 over six months." },
    { question: "What happens if I cannot repay?", answer: "The lender can repossess your vehicle. Some states allow rollovers, where you pay only the fee to extend the loan — this keeps the debt alive and rapidly increases what you owe. Rolling a $1,000 title loan for a year at 25%/month costs about $3,000 in fees alone." },
    { question: "What are cheaper alternatives?", answer: "Credit union personal loans, credit card cash advances, 0% balance transfers, payment plans with creditors, or borrowing from family. Even a payday-adjacent small personal loan at 36% APR is dramatically cheaper than a typical title loan on the same principal." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator/finance" }, { label: "Title Loan Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Title Loan Cost Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="amount" label="Loan Amount" value={amount} onChange={setAmount} prefix="$" />
              <CompactInput id="apr" label="Annual Percentage Rate" value={apr} onChange={setApr} suffix="%" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="term" label="Loan Term" value={termMonths} onChange={setTermMonths} suffix="mo" />
              <CompactInput id="fee" label="Origination Fee" value={originationFee} onChange={setOriginationFee} prefix="$" />
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
                Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-background mt-3">
                  <div>
                    <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block font-medium">Repayment Structure</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setInstallment(true)} className={`h-10 rounded-md border text-xs font-medium transition-colors ${installment ? "bg-primary text-primary-foreground border-primary" : "border-input bg-background hover:bg-secondary"}`}>Monthly Installments</button>
                      <button type="button" onClick={() => setInstallment(false)} className={`h-10 rounded-md border text-xs font-medium transition-colors ${!installment ? "bg-primary text-primary-foreground border-primary" : "border-input bg-background hover:bg-secondary"}`}>Lump Sum at End</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-1">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Total Cost to Repay</div>
                <div className="text-4xl font-extrabold mb-1 tracking-tight text-foreground">${result.totalCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="text-sm text-muted-foreground font-medium">That is {parseFloat(amount) > 0 ? ((result.totalCost / parseFloat(amount)) * 100).toFixed(0) : 0}% of your ${amount} loan</div>
              </div>

              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Finance Charge", `$${result.financeCharge.toLocaleString("en-US", { maximumFractionDigits: 2 })}`], ["Monthly Payment", result.monthlyPayment ? `$${result.monthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Lump sum"], ["Effective APR", `${result.effectiveApr.toFixed(0)}%`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>

              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 px-3 ${r.highlight ? "text-amber-700 font-semibold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 px-3 text-right font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center min-h-[280px]">
                <h3 className="text-base font-bold mb-2 w-full text-left">Where Your Money Goes</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPieChart>
                    <Pie data={result.chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={2} dataKey="value">
                      {result.chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2 w-full">
                  {result.chartData.map((d, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                      <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }} />{d.name}
                    </div>
                  ))}
                </div>
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
            <h2 className="text-2xl font-bold mb-3">The Real Cost of a Title Loan</h2>
            <p>Title loans are marketed as fast cash against your car, but the pricing is built on monthly fees rather than conventional interest. A typical 25% monthly fee on $1,000 adds $250 every month. This <strong>title loan cost calculator</strong> converts those fees into the number that matters: the total you will actually repay.</p>
            <h2 className="text-2xl font-bold mb-3">Why the APR Is Misleading</h2>
            <p>Because title loans are short-term, the same $250 monthly fee on $1,000 works out to roughly 300% APR when annualized. The calculator shows both views — the monthly structure you are quoted and the effective annual rate — so the comparison with a credit card or personal loan is honest.</p>
            <h2 className="text-2xl font-bold mb-3">Before You Sign</h2>
            <p>Check the total cost against your ability to repay within the term. If you can only afford the monthly fee, you will be rolling the loan — the single most expensive outcome. Every state caps title loan rates differently, so verify your state's usury limit and compare with a credit union personal loan before committing your title.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/title-loan-cost-calculator" />
          <PopularCalculators exclude="/calculator/title-loan-cost-calculator" />
        </div>
      </div>
    </>
  );
}
