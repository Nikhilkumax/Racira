"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown, Printer, Home, Shield, Wallet } from "lucide-react";
import { PieChart as RPie, Pie, Cell, Tooltip as RTooltip, ResponsiveContainer } from "recharts";

type UseType = "first" | "subsequent";

interface VaInputs {
  homePrice: number;
  downPayment: number;
  interestRate: number;
  loanTermYears: number;
  useType: UseType;
  exempt: boolean;
  financeFee: boolean;
  propertyTaxAnnual: number;
  homeInsuranceAnnual: number;
  hoaMonthly: number;
  proMode: boolean;
  extraMonthly: number;
  grossMonthlyIncome: number;
  otherMonthlyDebts: number;
}

interface ChartSlice {
  name: string;
  value: number;
  percent: number;
  color: string;
}

interface TableRow {
  label: string;
  value: string;
  key?: boolean;
}

interface VaResult {
  fundingFeeRate: number;
  fundingFeeAmount: number;
  baseLoanAmount: number;
  totalLoanAmount: number;
  principalAndInterest: number;
  monthlyTax: number;
  monthlyInsurance: number;
  monthlyHoa: number;
  totalMonthlyPayment: number;
  totalInterest: number;
  totalOfPayments: number;
  downPaymentPercent: number;
  loanToValue: number;
  cashDueAtClosing: number;
  pmiSavedMonthly: number;
  chartData: ChartSlice[];
  rows: TableRow[];
  // Professional mode
  payoffMonths: number;
  monthsSaved: number;
  interestSaved: number;
  frontEndDti: number;
  backEndDti: number;
  dtiVerdict: string;
}

// VA funding fee schedule for purchase loans (Public Law 116-23, rates effective 2023 onward).
function fundingFeeRate(useType: UseType, downPercent: number, exempt: boolean): number {
  if (exempt) return 0;
  if (downPercent >= 10) return 1.25;
  if (downPercent >= 5) return 1.5;
  return useType === "first" ? 2.15 : 3.3;
}

// Conventional loans of comparable LTV typically carry 0.5%-1.1% annual PMI. VA loans carry none.
const PMI_BENCHMARK_RATE = 0.0075;

const DEFAULTS: VaInputs = {
  homePrice: 400000,
  downPayment: 0,
  interestRate: 6.25,
  loanTermYears: 30,
  useType: "first",
  exempt: false,
  financeFee: true,
  propertyTaxAnnual: 4800,
  homeInsuranceAnnual: 1800,
  hoaMonthly: 0,
  proMode: false,
  extraMonthly: 0,
  grossMonthlyIncome: 8000,
  otherMonthlyDebts: 600,
};

function amortize(principal: number, monthlyRate: number, payment: number, maxMonths: number): { months: number; interest: number } {
  if (principal <= 0 || payment <= 0) return { months: 0, interest: 0 };
  let balance = principal;
  let interest = 0;
  let months = 0;
  while (balance > 0.01 && months < maxMonths) {
    const monthInterest = balance * monthlyRate;
    let principalPaid = payment - monthInterest;
    if (principalPaid <= 0) return { months: maxMonths, interest: interest + monthInterest * (maxMonths - months) };
    if (principalPaid > balance) principalPaid = balance;
    balance -= principalPaid;
    interest += monthInterest;
    months += 1;
  }
  return { months, interest };
}

export function calculateVaMortgage(i: VaInputs): VaResult {
  const homePrice = Math.max(0, i.homePrice);
  const downPayment = Math.min(Math.max(0, i.downPayment), homePrice);
  const downPaymentPercent = homePrice > 0 ? (downPayment / homePrice) * 100 : 0;

  const baseLoanAmount = homePrice - downPayment;
  const feeRate = fundingFeeRate(i.useType, downPaymentPercent, i.exempt);
  const fundingFeeAmount = baseLoanAmount * (feeRate / 100);
  const totalLoanAmount = i.financeFee ? baseLoanAmount + fundingFeeAmount : baseLoanAmount;

  const n = Math.max(1, Math.round(i.loanTermYears * 12));
  const r = i.interestRate / 100 / 12;

  const principalAndInterest =
    totalLoanAmount > 0
      ? r > 0
        ? (totalLoanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
        : totalLoanAmount / n
      : 0;

  const monthlyTax = Math.max(0, i.propertyTaxAnnual) / 12;
  const monthlyInsurance = Math.max(0, i.homeInsuranceAnnual) / 12;
  const monthlyHoa = Math.max(0, i.hoaMonthly);
  const totalMonthlyPayment = principalAndInterest + monthlyTax + monthlyInsurance + monthlyHoa;

  const totalOfPayments = principalAndInterest * n;
  const totalInterest = Math.max(0, totalOfPayments - totalLoanAmount);
  const loanToValue = homePrice > 0 ? (totalLoanAmount / homePrice) * 100 : 0;
  const cashDueAtClosing = downPayment + (i.financeFee ? 0 : fundingFeeAmount);
  const pmiSavedMonthly = (baseLoanAmount * PMI_BENCHMARK_RATE) / 12;

  const chartRaw: { name: string; value: number; color: string }[] = [
    { name: "Principal & Interest", value: principalAndInterest, color: "#2563EB" },
    { name: "Property Tax", value: monthlyTax, color: "#F59E0B" },
    { name: "Home Insurance", value: monthlyInsurance, color: "#10B981" },
    { name: "HOA Dues", value: monthlyHoa, color: "#8B5CF6" },
  ].filter((s) => s.value > 0);

  const chartTotal = chartRaw.reduce((sum, s) => sum + s.value, 0);
  const chartData: ChartSlice[] = chartRaw.map((s) => ({
    ...s,
    value: Number(s.value.toFixed(2)),
    percent: chartTotal > 0 ? (s.value / chartTotal) * 100 : 0,
  }));

  const money = (v: number) =>
    `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const whole = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`;

  const rows: TableRow[] = [
    { label: "Home Purchase Price", value: whole(homePrice) },
    { label: `Down Payment (${downPaymentPercent.toFixed(1)}%)`, value: whole(downPayment) },
    { label: "Base Loan Amount", value: whole(baseLoanAmount) },
    { label: `VA Funding Fee (${feeRate.toFixed(2)}%)`, value: whole(fundingFeeAmount) },
    { label: "Total Financed Amount", value: whole(totalLoanAmount), key: true },
    { label: "Principal & Interest", value: money(principalAndInterest) },
    { label: "Property Tax (monthly)", value: money(monthlyTax) },
    { label: "Home Insurance (monthly)", value: money(monthlyInsurance) },
    { label: "HOA Dues (monthly)", value: money(monthlyHoa) },
    { label: "Mortgage Insurance (VA loans carry none)", value: money(0) },
  ];

  // Professional mode outputs
  const scheduled = amortize(totalLoanAmount, r, principalAndInterest, n);
  const accelerated = amortize(totalLoanAmount, r, principalAndInterest + Math.max(0, i.extraMonthly), n);
  const payoffMonths = accelerated.months;
  const monthsSaved = Math.max(0, scheduled.months - accelerated.months);
  const interestSaved = Math.max(0, scheduled.interest - accelerated.interest);

  const income = Math.max(0, i.grossMonthlyIncome);
  const frontEndDti = income > 0 ? (totalMonthlyPayment / income) * 100 : 0;
  const backEndDti = income > 0 ? ((totalMonthlyPayment + Math.max(0, i.otherMonthlyDebts)) / income) * 100 : 0;
  const dtiVerdict =
    backEndDti <= 41 ? "Within VA guideline" : backEndDti <= 50 ? "Requires residual income offset" : "Above typical VA limits";

  return {
    fundingFeeRate: feeRate,
    fundingFeeAmount,
    baseLoanAmount,
    totalLoanAmount,
    principalAndInterest,
    monthlyTax,
    monthlyInsurance,
    monthlyHoa,
    totalMonthlyPayment,
    totalInterest,
    totalOfPayments,
    downPaymentPercent,
    loanToValue,
    cashDueAtClosing,
    pmiSavedMonthly,
    chartData,
    rows,
    payoffMonths,
    monthsSaved,
    interestSaved,
    frontEndDti,
    backEndDti,
    dtiVerdict,
  };
}

const inp =
  "w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20";
const lbl = "text-sm font-medium text-foreground mb-1 block";
const groupLabel = "text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold flex items-center gap-1.5";

export default function VaMortgagePaymentCalculator() {
  const [inputs, setInputs] = useState<VaInputs>(DEFAULTS);
  const [result, setResult] = useState<VaResult>(calculateVaMortgage(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculateVaMortgage(inputs));
  }, []);

  const calculate = () => setResult(calculateVaMortgage(inputs));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculateVaMortgage(DEFAULTS));
    setShowAdvanced(false);
  };

  const setNum = (key: keyof VaInputs, raw: string) => {
    const parsed = parseFloat(raw);
    setInputs((prev) => ({ ...prev, [key]: isNaN(parsed) ? 0 : parsed }));
  };

  const money = (v: number) => `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const whole = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`;

  const faqs = [
    {
      question: "Do VA loans require private mortgage insurance?",
      answer:
        "No. This is the single largest ongoing advantage of a VA loan. Conventional borrowers who put down less than 20% typically pay private mortgage insurance of roughly 0.5% to 1.1% of the loan balance each year, which on a $400,000 loan is $167 to $367 every month. VA loans replace that recurring charge with a one-time funding fee, so nothing is added to your monthly payment for mortgage insurance no matter how small your down payment is.",
    },
    {
      question: "How much is the VA funding fee?",
      answer:
        "For a purchase loan with no down payment, the fee is 2.15% of the loan amount for first-time use and 3.30% for subsequent use. Putting down 5% or more drops the fee to 1.50%, and 10% or more drops it to 1.25% regardless of whether it is your first use. Veterans receiving compensation for a service-connected disability, surviving spouses receiving dependency and indemnity compensation, and Purple Heart recipients on active duty are exempt from the fee entirely.",
    },
    {
      question: "Should I finance the funding fee or pay it at closing?",
      answer:
        "Financing the fee rolls it into your loan balance so you bring less cash to closing, but you then pay interest on it for the life of the loan. On a $400,000 loan at 6.25% over 30 years, financing a 2.15% fee of $8,600 adds about $53 to your monthly payment and roughly $10,500 in total interest. If you have the cash available and no better use for it, paying the fee upfront is the cheaper choice.",
    },
    {
      question: "Can I buy a home with no money down using a VA loan?",
      answer:
        "Yes, provided the purchase price does not exceed the appraised value and you have full entitlement. VA loans are one of the only remaining zero-down programs, which is why the loan-to-value ratio on this calculator can exceed 100% when the funding fee is financed. Note that a zero-down purchase means you start with no equity, so if home values dip you may be underwater for the first few years.",
    },
    {
      question: "What debt-to-income ratio does the VA allow?",
      answer:
        "The VA uses 41% as its benchmark back-end ratio, counting your full housing payment plus all other monthly debt obligations. Unlike most programs, the VA will approve loans above 41% if you clear the residual income test, which measures the discretionary income left after all obligations are paid and varies by region and family size. Turn on Professional Mode above to see both your front-end and back-end ratios.",
    },
    {
      question: "Is the VA funding fee refundable?",
      answer:
        "It can be. If you paid the funding fee and are later awarded VA disability compensation with an effective date retroactive to before your loan closed, you are entitled to a refund of the fee. This happens fairly often when a disability claim is pending at the time of purchase, so it is worth following up with your lender and the VA Regional Loan Center once a claim is decided.",
    },
    {
      question: "Can I use a VA loan more than once?",
      answer:
        "Yes. VA entitlement is a reusable benefit, not a one-time voucher. Once a previous VA loan is paid off and the property sold, your full entitlement is restored and you can use it again. The only difference is the funding fee, which rises from 2.15% to 3.30% on subsequent zero-down uses. You can also hold two VA loans at once if you have sufficient remaining entitlement.",
    },
    {
      question: "Do I still pay property taxes and homeowners insurance?",
      answer:
        "Yes. The VA guaranty affects only the loan itself, not the ongoing costs of owning property. Your lender will normally collect one twelfth of your annual property tax and insurance premiums with each payment and hold them in an escrow account. These escrow amounts often change every year as assessments and premiums are updated, which is why this calculator breaks them out separately from principal and interest.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator/finance" },
          { label: "VA Mortgage Payment Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">VA Mortgage Payment Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT - Inputs */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card rounded-xl">
            {/* Tier 1 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="homePrice" className={lbl}>Home Price</label>
                <input id="homePrice" type="number" min="0" step="1000" className={inp} value={inputs.homePrice}
                  onChange={(e) => setNum("homePrice", e.target.value)} />
              </div>
              <div>
                <label htmlFor="downPayment" className={lbl}>Down Payment</label>
                <input id="downPayment" type="number" min="0" step="1000" className={inp} value={inputs.downPayment}
                  onChange={(e) => setNum("downPayment", e.target.value)} />
              </div>
              <div>
                <label htmlFor="interestRate" className={lbl}>Interest Rate (%)</label>
                <input id="interestRate" type="number" min="0" step="0.01" className={inp} value={inputs.interestRate}
                  onChange={(e) => setNum("interestRate", e.target.value)} />
              </div>
              <div>
                <label htmlFor="loanTermYears" className={lbl}>Loan Term</label>
                <select id="loanTermYears" className={inp} value={inputs.loanTermYears}
                  onChange={(e) => setNum("loanTermYears", e.target.value)}>
                  <option value="30">30 years</option>
                  <option value="25">25 years</option>
                  <option value="20">20 years</option>
                  <option value="15">15 years</option>
                  <option value="10">10 years</option>
                </select>
              </div>
            </div>

            {/* Tier 2 */}
            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>

              {showAdvanced && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div>
                    <div className={groupLabel}>
                      <Shield className="h-3.5 w-3.5" /> VA Entitlement &amp; Funding Fee
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="useType" className={lbl}>Entitlement Use</label>
                        <select id="useType" className={inp} value={inputs.useType}
                          onChange={(e) => setInputs((p) => ({ ...p, useType: e.target.value as UseType }))}>
                          <option value="first">First-time use</option>
                          <option value="subsequent">Subsequent use</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="exempt" className={lbl}>Fee Exemption</label>
                        <select id="exempt" className={inp} value={inputs.exempt ? "yes" : "no"}
                          onChange={(e) => setInputs((p) => ({ ...p, exempt: e.target.value === "yes" }))}>
                          <option value="no">Not exempt</option>
                          <option value="yes">Exempt (disability)</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label htmlFor="financeFee" className={lbl}>Funding Fee Handling</label>
                        <select id="financeFee" className={inp} value={inputs.financeFee ? "finance" : "cash"}
                          onChange={(e) => setInputs((p) => ({ ...p, financeFee: e.target.value === "finance" }))}>
                          <option value="finance">Roll into loan balance</option>
                          <option value="cash">Pay in cash at closing</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className={groupLabel}>
                      <Home className="h-3.5 w-3.5" /> Escrow &amp; Ownership Costs
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="propertyTaxAnnual" className={lbl}>Property Tax / yr</label>
                        <input id="propertyTaxAnnual" type="number" min="0" step="100" className={inp}
                          value={inputs.propertyTaxAnnual} onChange={(e) => setNum("propertyTaxAnnual", e.target.value)} />
                      </div>
                      <div>
                        <label htmlFor="homeInsuranceAnnual" className={lbl}>Insurance / yr</label>
                        <input id="homeInsuranceAnnual" type="number" min="0" step="100" className={inp}
                          value={inputs.homeInsuranceAnnual} onChange={(e) => setNum("homeInsuranceAnnual", e.target.value)} />
                      </div>
                      <div className="col-span-2">
                        <label htmlFor="hoaMonthly" className={lbl}>HOA Dues / month</label>
                        <input id="hoaMonthly" type="number" min="0" step="10" className={inp}
                          value={inputs.hoaMonthly} onChange={(e) => setNum("hoaMonthly", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className={groupLabel}>
                      <Wallet className="h-3.5 w-3.5" /> Professional Mode
                    </div>
                    <label htmlFor="proMode" className="flex items-center gap-2 text-sm font-medium text-foreground mb-3 cursor-pointer">
                      <input id="proMode" type="checkbox" className="h-4 w-4 accent-primary" checked={inputs.proMode}
                        onChange={(e) => setInputs((p) => ({ ...p, proMode: e.target.checked }))} />
                      Unlock payoff acceleration and DTI analysis
                    </label>
                    {inputs.proMode ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="extraMonthly" className={lbl}>Extra Payment / mo</label>
                          <input id="extraMonthly" type="number" min="0" step="25" className={inp}
                            value={inputs.extraMonthly} onChange={(e) => setNum("extraMonthly", e.target.value)} />
                        </div>
                        <div>
                          <label htmlFor="grossMonthlyIncome" className={lbl}>Gross Income / mo</label>
                          <input id="grossMonthlyIncome" type="number" min="0" step="100" className={inp}
                            value={inputs.grossMonthlyIncome} onChange={(e) => setNum("grossMonthlyIncome", e.target.value)} />
                        </div>
                        <div className="col-span-2">
                          <label htmlFor="otherMonthlyDebts" className={lbl}>Other Monthly Debts</label>
                          <input id="otherMonthlyDebts" type="number" min="0" step="50" className={inp}
                            value={inputs.otherMonthlyDebts} onChange={(e) => setNum("otherMonthlyDebts", e.target.value)} />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2.5 mt-2.5">
              <button type="button" onClick={calculate}
                className="h-10 w-full flex-1 flex items-center justify-center rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-base transition-all active:scale-[0.98] shadow-sm">
                Calculate
              </button>
              <button type="button" onClick={reset} aria-label="Reset"
                className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 focus:outline-none">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT - Results */}
          <div className="flex flex-col gap-4">
            {/* 1. Primary Result Card */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
              <div className="flex justify-end absolute top-3 right-3">
                <button type="button" onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
              </div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Total Monthly Payment</div>
              <div className="text-4xl font-bold text-primary my-1">{money(result.totalMonthlyPayment)}</div>
              <div className="text-sm text-muted-foreground">
                {money(result.principalAndInterest)} principal &amp; interest, no mortgage insurance
              </div>
            </div>

            {/* 2. 3-Stat Bar */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              <div className="p-4 text-center">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Financed Amount</div>
                <div className="text-lg font-bold text-foreground">{whole(result.totalLoanAmount)}</div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Funding Fee</div>
                <div className={`text-lg font-bold ${result.fundingFeeRate === 0 ? "text-emerald-600" : result.fundingFeeRate >= 3 ? "text-red-600" : "text-amber-600"}`}>
                  {whole(result.fundingFeeAmount)}
                </div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">PMI Avoided</div>
                <div className="text-lg font-bold text-emerald-600">{money(result.pmiSavedMonthly)}/mo</div>
              </div>
            </div>

            {/* 3. Breakdown Table */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Loan Component</th>
                    <th className="p-2.5 pr-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {result.rows.map((row) => (
                    <tr key={row.label} className={row.key ? "bg-primary/5" : ""}>
                      <td className={`text-base py-2.5 px-3 ${row.key ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{row.label}</td>
                      <td className={`text-base py-2.5 px-3 text-right font-medium ${row.key ? "text-primary font-bold" : "text-foreground"}`}>{row.value}</td>
                    </tr>
                  ))}
                  <tr className="font-bold border-t-2 border-border">
                    <td className="text-base py-2.5 px-3 text-foreground">Total Monthly Payment</td>
                    <td className="text-base py-2.5 px-3 text-right text-primary">{money(result.totalMonthlyPayment)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. Chart */}
            {mounted ? (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground mb-3">Monthly Payment Composition</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <RPie>
                    <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}>
                      {result.chartData.map((slice) => (
                        <Cell key={slice.name} fill={slice.color} />
                      ))}
                    </Pie>
                    <RTooltip formatter={(value: number) => money(value)} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  </RPie>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
                  {result.chartData.map((slice) => (
                    <div key={slice.name} className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                      <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: slice.color }} />
                      {slice.name} — {slice.percent.toFixed(1)}%
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Professional Mode sections */}
            {inputs.proMode ? (
              <>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="text-sm font-bold text-foreground mb-3">Payoff Acceleration</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Payoff Time</div>
                      <div className="text-base font-bold text-foreground">
                        {Math.floor(result.payoffMonths / 12)} yr {result.payoffMonths % 12} mo
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Time Saved</div>
                      <div className="text-base font-bold text-emerald-600">
                        {Math.floor(result.monthsSaved / 12)} yr {result.monthsSaved % 12} mo
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interest Saved</div>
                      <div className="text-base font-bold text-emerald-600">{whole(result.interestSaved)}</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="text-sm font-bold text-foreground mb-3">Debt-to-Income Analysis</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Front-End DTI</div>
                      <div className="text-base font-bold text-foreground">{result.frontEndDti.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Back-End DTI</div>
                      <div className={`text-base font-bold ${result.backEndDti <= 41 ? "text-emerald-600" : result.backEndDti <= 50 ? "text-amber-600" : "text-red-600"}`}>
                        {result.backEndDti.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">VA Guideline</div>
                      <div className="text-base font-bold text-foreground">{result.dtiVerdict}</div>
                    </div>
                  </div>
                </div>
              </>
            ) : null}

            {/* 5. Summary Statistics */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="grid grid-cols-2 gap-4">
                {result.rows.map((row) => (
                  <div key={row.label} className="flex flex-col">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">{row.label}</span>
                    <span className={`text-base font-bold ${row.key ? "text-primary" : "text-foreground"}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How a VA Mortgage Payment Is Built</h2>
            <p className="mb-4">
              A VA mortgage payment is assembled from the same parts as any other home loan, with one conspicuous omission.
              You have principal and interest calculated from the financed balance, one twelfth of your annual property tax,
              one twelfth of your homeowners insurance premium, and any homeowners association dues. What you do not have is
              mortgage insurance. On a conventional loan with a small down payment, private mortgage insurance of roughly
              0.5% to 1.1% of the balance per year is bolted onto the payment until you reach 20% equity. The VA program
              removes that line item permanently and replaces it with a single up-front funding fee, which is the trade at
              the heart of the benefit.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding the Funding Fee</h2>
            <p className="mb-4">
              The funding fee is what keeps the VA loan program running without taxpayer subsidy, and its rate depends on
              two things: how much you put down and whether you have used your entitlement before. A first-time buyer
              putting nothing down pays 2.15% of the loan amount. A repeat user in the same position pays 3.30%. Putting
              down 5% cuts the fee to 1.50% for everyone, and 10% cuts it to 1.25%. Veterans receiving compensation for a
              service-connected disability pay nothing at all. Because the fee is charged on the base loan amount, a larger
              down payment reduces it twice over, once through the lower rate and once through the smaller balance it is
              applied to.
            </p>

            <h2 className="text-2xl font-bold mb-3">Financing the Fee Versus Paying Cash</h2>
            <p className="mb-4">
              Most borrowers roll the funding fee into the loan, which is why the loan-to-value ratio on a zero-down VA
              purchase routinely exceeds 100%. This preserves cash at closing but converts a one-time charge into thirty
              years of interest. On a $400,000 purchase at 6.25%, financing an $8,600 fee adds roughly $53 per month and
              about $10,500 in lifetime interest. Paying it in cash is the cheaper path if the money is available and not
              needed for reserves or immediate repairs. Toggle the funding fee handling in Advanced Options to see both
              scenarios side by side.
            </p>

            <h2 className="text-2xl font-bold mb-3">Qualifying and Residual Income</h2>
            <p>
              The VA benchmarks debt-to-income at 41%, counting your full housing payment plus car loans, student loans,
              credit card minimums, and any other recurring obligation. Unlike most loan programs, exceeding that ratio is
              not automatically disqualifying. The VA also applies a residual income test measuring what is actually left
              over each month after every obligation is paid, with thresholds that vary by family size and region of the
              country. A borrower at 45% back-end DTI with strong residual income is often approved where a conventional
              underwriter would decline. Enable Professional Mode above to see both ratios alongside a payoff acceleration
              schedule showing how extra monthly principal shortens the loan.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/va-mortgage-payment-calculator" />
          <PopularCalculators exclude="/calculator/va-mortgage-payment-calculator" />
        </div>
      </div>
    </>
  );
}
