"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, ChevronDown } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface LoanToIncomeInputs {
  income: number;
  loanPayment: number;
  otherDebts: number;
  loanType: "mortgage" | "personal" | "auto" | "student";
}

interface LoanToIncomeResult {
  ltiRatio: number;
  totalMonthlyPayments: number;
  totalAnnualPayments: number;
  maxAffordableMonthly: number;
  threshold: number;
  status: "Healthy" | "Moderate" | "High";
  chartData: { name: string; value: number; color: string }[];
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

const THRESHOLDS: Record<LoanToIncomeInputs["loanType"], number> = {
  mortgage: 43,
  personal: 36,
  auto: 20,
  student: 10,
};

function calcLti(inputs: LoanToIncomeInputs): LoanToIncomeResult {
  const totalMonthlyPayments = inputs.loanPayment + inputs.otherDebts;
  const totalAnnualPayments = totalMonthlyPayments * 12;
  const ltiRatio = inputs.income > 0 ? (totalAnnualPayments / inputs.income) * 100 : 0;
  const threshold = THRESHOLDS[inputs.loanType];
  const maxAffordableMonthly = (inputs.income * (threshold / 100)) / 12;
  const status: LoanToIncomeResult["status"] = ltiRatio < threshold ? "Healthy" : ltiRatio <= threshold + 7 ? "Moderate" : "High";

  const remainingMonthly = Math.max(0, inputs.income / 12 - totalMonthlyPayments);
  const chartData = [
    { name: "Loan Payments", value: inputs.loanPayment, color: "hsl(var(--primary))" },
    { name: "Other Debts", value: inputs.otherDebts, color: "#f59e0b" },
    { name: "Remaining Income", value: remainingMonthly, color: "#10b981" },
  ].filter((d) => d.value > 0);

  const breakdown: { label: string; value: string; highlight?: boolean }[] = [
    { label: "Gross Annual Income", value: `$${inputs.income.toLocaleString()}` },
    { label: "Monthly Loan Payment", value: `$${inputs.loanPayment.toLocaleString()}` },
    { label: "Other Monthly Debts", value: `$${inputs.otherDebts.toLocaleString()}` },
    { label: "Total Monthly Payments", value: `$${totalMonthlyPayments.toLocaleString()}` },
    { label: "Total Annual Payments", value: `$${totalAnnualPayments.toLocaleString()}` },
    { label: "Loan-to-Income Ratio", value: `${ltiRatio.toFixed(1)}%`, highlight: true },
    { label: `Lender Threshold (${inputs.loanType})`, value: `${threshold}%` },
    { label: "Status", value: status, highlight: true },
  ];

  const summaryStats = [
    { label: "Loan-to-Income Ratio", value: `${ltiRatio.toFixed(1)}%` },
    { label: "Total Monthly Payments", value: `$${totalMonthlyPayments.toLocaleString()}` },
    { label: "Total Annual Payments", value: `$${totalAnnualPayments.toLocaleString()}` },
    { label: "Max Affordable Monthly", value: `$${maxAffordableMonthly.toLocaleString()}` },
    { label: "Lender Threshold", value: `${threshold}%` },
    { label: "Status", value: status },
  ];

  return { ltiRatio, totalMonthlyPayments, totalAnnualPayments, maxAffordableMonthly, threshold, status, chartData, breakdown, summaryStats };
}

const DEFAULTS: LoanToIncomeInputs = { income: 75000, loanPayment: 1200, otherDebts: 400, loanType: "mortgage" };

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
    <p className="text-primary font-extrabold text-sm">${payload[0].value.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
  </div>
) : null;

export default function LoanToIncomeRatioCalculator() {
  const [income, setIncome] = useState("75000");
  const [loanPayment, setLoanPayment] = useState("1200");
  const [otherDebts, setOtherDebts] = useState("400");
  const [loanType, setLoanType] = useState<LoanToIncomeInputs["loanType"]>("mortgage");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<LoanToIncomeResult | null>(null);

  const calculate = () =>
    setResult(calcLti({
      income: parseFloat(income) || 0,
      loanPayment: parseFloat(loanPayment) || 0,
      otherDebts: parseFloat(otherDebts) || 0,
      loanType,
    }));
  const reset = () => { setIncome(DEFAULTS.income.toString()); setLoanPayment(DEFAULTS.loanPayment.toString()); setOtherDebts(DEFAULTS.otherDebts.toString()); setLoanType(DEFAULTS.loanType); setShowAdvanced(false); calculate(); };
  useEffect(() => { calculate(); }, []);

  const statusColor = result?.status === "Healthy" ? "text-emerald-600" : result?.status === "Moderate" ? "text-amber-600" : "text-red-500";

  const faqs = [
    { question: "What is a loan-to-income ratio?", answer: "The loan-to-income (LTI) ratio measures your total debt payments relative to your gross income. It is calculated by dividing your total annual debt payments by your gross annual income. Lenders use it to judge whether you can comfortably afford new debt on top of your existing obligations." },
    { question: "What is a good loan-to-income ratio?", answer: "For mortgages, most lenders want your total debt-to-income picture at or below 43% (the CFPB Qualified Mortgage ceiling), with 36% as the traditional conservative target. Auto lenders typically look for 20% or less, and student loans are often evaluated against a 10% guideline." },
    { question: "How is this different from debt-to-income (DTI)?", answer: "DTI and LTI describe the same idea but are framed differently. DTI usually refers to all debts (including your proposed mortgage) versus gross income. This calculator treats the loan payment you enter as the loan in question and any other payments as existing debts — the sum over income is your LTI." },
    { question: "What happens if my ratio is too high?", answer: "A ratio above the lender's threshold typically means you will be offered a smaller loan, a higher interest rate, or a co-signer requirement. It can also signal that you should pay down existing debts before applying for new credit." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator/finance" }, { label: "Loan-to-Income Ratio Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Loan-to-Income Ratio Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="income" label="Gross Annual Income" value={income} onChange={setIncome} prefix="$" />
              <CompactInput id="loan-payment" label="Monthly Loan Payment" value={loanPayment} onChange={setLoanPayment} prefix="$" />
            </div>
            <CompactInput id="other-debts" label="Other Monthly Debt Payments" value={otherDebts} onChange={setOtherDebts} prefix="$" />

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
                Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-background mt-3">
                  <div>
                    <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block font-medium">Loan Type</label>
                    <select value={loanType} onChange={(e) => setLoanType(e.target.value as LoanToIncomeInputs["loanType"])} className="w-full h-10 px-3 text-base border border-input rounded-md bg-background outline-none focus:ring-2 focus:ring-primary/20">
                      <option value="mortgage">Mortgage (43% max)</option>
                      <option value="personal">Personal Loan (36% max)</option>
                      <option value="auto">Auto Loan (20% max)</option>
                      <option value="student">Student Loan (10% max)</option>
                    </select>
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
                <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Loan-to-Income Ratio</div>
                <div className={`text-4xl font-extrabold mb-1 tracking-tight ${statusColor}`}>{result.ltiRatio.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground font-medium">Status: {result.status} — {result.ltiRatio < result.threshold ? "within" : "above"} the {result.threshold}% {loanType} threshold</div>
              </div>

              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Total Annual Payments", `$${result.totalAnnualPayments.toLocaleString()}`], ["Total Monthly Payments", `$${result.totalMonthlyPayments.toLocaleString()}`], ["Max Affordable Monthly", `$${result.maxAffordableMonthly.toLocaleString()}`]].map(([l, v], i) => (
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
                <h3 className="text-base font-bold mb-2 w-full text-left">Monthly Income Allocation</h3>
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
            <h2 className="text-2xl font-bold mb-3">What Is the Loan-to-Income Ratio?</h2>
            <p>The loan-to-income ratio tells lenders how much of your gross income is already committed to debt payments. It is calculated as total annual debt payments divided by gross annual income, expressed as a percentage. This <strong>loan-to-income ratio calculator</strong> makes it easy to see where you stand before you apply for a mortgage, personal loan, auto loan, or student loan.</p>
            <h2 className="text-2xl font-bold mb-3">Why Lenders Care About LTI</h2>
            <p>A lower ratio means a larger safety margin between your income and your obligations, which makes you a lower-risk borrower. Mortgage lenders commonly cap the ratio at 43% — the Qualified Mortgage ceiling set by the CFPB — while many prefer 36% or less. Keeping your LTI comfortably under the threshold improves your chances of approval and can qualify you for better rates.</p>
            <h2 className="text-2xl font-bold mb-3">Improving Your Ratio</h2>
            <p>Because the ratio divides debt by income, you can improve it by paying down balances, consolidating higher payments, or increasing income. Even small changes move the number: reducing $200 in monthly payments on a $75,000 income lowers your LTI by about 3.2 percentage points.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/loan-to-income-ratio-calculator" />
          <PopularCalculators exclude="/calculator/loan-to-income-ratio-calculator" />
        </div>
      </div>
    </>
  );
}
