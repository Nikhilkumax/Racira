"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown, Building2, Percent, LineChart } from "lucide-react";
import { PieChart as RPie, Pie, Cell, Tooltip as RTooltip, ResponsiveContainer } from "recharts";

interface ProFormaInputs {
  purchasePrice: number;
  grossRentMonthly: number;
  vacancyRate: number;
  operatingExpenseRatio: number;
  downPaymentPercent: number;
  interestRate: number;
  loanTermYears: number;
  otherIncomeMonthly: number;
  closingCostPercent: number;
  proMode: boolean;
  holdYears: number;
  rentGrowthRate: number;
  expenseGrowthRate: number;
  exitCapRate: number;
  sellingCostPercent: number;
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

interface ProFormaResult {
  grossPotentialIncome: number;
  vacancyLoss: number;
  effectiveGrossIncome: number;
  operatingExpenses: number;
  netOperatingIncome: number;
  annualDebtService: number;
  monthlyDebtService: number;
  cashFlowAnnual: number;
  cashFlowMonthly: number;
  loanAmount: number;
  downPayment: number;
  closingCosts: number;
  totalCashInvested: number;
  capRate: number;
  cashOnCashReturn: number;
  debtServiceCoverageRatio: number;
  grossRentMultiplier: number;
  operatingExpenseRatioActual: number;
  breakEvenOccupancy: number;
  onePercentRuleValue: number;
  chartData: ChartSlice[];
  rows: TableRow[];
  // Professional mode
  exitValue: number;
  netSaleProceeds: number;
  totalCashFlowOverHold: number;
  equityMultiple: number;
  irr: number;
  averageAnnualReturn: number;
}

const DEFAULTS: ProFormaInputs = {
  purchasePrice: 450000,
  grossRentMonthly: 4200,
  vacancyRate: 5,
  operatingExpenseRatio: 40,
  downPaymentPercent: 25,
  interestRate: 7.0,
  loanTermYears: 30,
  otherIncomeMonthly: 150,
  closingCostPercent: 2.5,
  proMode: false,
  holdYears: 5,
  rentGrowthRate: 3,
  expenseGrowthRate: 2.5,
  exitCapRate: 6.0,
  sellingCostPercent: 6,
};

// Newton-Raphson on the NPV function; falls back to bisection-free bounds if it
// fails to converge, which happens when cash flows never change sign.
function computeIrr(cashFlows: number[]): number {
  const hasPositive = cashFlows.some((c) => c > 0);
  const hasNegative = cashFlows.some((c) => c < 0);
  if (!hasPositive || !hasNegative) return 0;

  let rate = 0.1;
  for (let iter = 0; iter < 100; iter += 1) {
    let npv = 0;
    let derivative = 0;
    for (let t = 0; t < cashFlows.length; t += 1) {
      const denom = Math.pow(1 + rate, t);
      npv += cashFlows[t] / denom;
      if (t > 0) derivative -= (t * cashFlows[t]) / Math.pow(1 + rate, t + 1);
    }
    if (Math.abs(npv) < 0.01) return rate * 100;
    if (derivative === 0) break;
    const next = rate - npv / derivative;
    if (!isFinite(next) || next <= -0.99) break;
    rate = next;
  }
  return isFinite(rate) ? rate * 100 : 0;
}

export function calculateProForma(i: ProFormaInputs): ProFormaResult {
  const price = Math.max(0, i.purchasePrice);

  // Income statement, standard appraisal order.
  const grossPotentialIncome = (Math.max(0, i.grossRentMonthly) + Math.max(0, i.otherIncomeMonthly)) * 12;
  const vacancyLoss = grossPotentialIncome * (Math.max(0, i.vacancyRate) / 100);
  const effectiveGrossIncome = grossPotentialIncome - vacancyLoss;
  const operatingExpenses = effectiveGrossIncome * (Math.max(0, i.operatingExpenseRatio) / 100);
  const netOperatingIncome = effectiveGrossIncome - operatingExpenses;

  // Financing
  const downPaymentPct = Math.min(Math.max(0, i.downPaymentPercent), 100) / 100;
  const downPayment = price * downPaymentPct;
  const loanAmount = price - downPayment;
  const closingCosts = price * (Math.max(0, i.closingCostPercent) / 100);
  const totalCashInvested = downPayment + closingCosts;

  const n = Math.max(1, Math.round(i.loanTermYears * 12));
  const r = Math.max(0, i.interestRate) / 100 / 12;
  const monthlyDebtService =
    loanAmount > 0 ? (r > 0 ? (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : loanAmount / n) : 0;
  const annualDebtService = monthlyDebtService * 12;

  const cashFlowAnnual = netOperatingIncome - annualDebtService;
  const cashFlowMonthly = cashFlowAnnual / 12;

  // Standard investment ratios.
  const capRate = price > 0 ? (netOperatingIncome / price) * 100 : 0;
  const cashOnCashReturn = totalCashInvested > 0 ? (cashFlowAnnual / totalCashInvested) * 100 : 0;
  const debtServiceCoverageRatio = annualDebtService > 0 ? netOperatingIncome / annualDebtService : 0;
  const grossRentMultiplier = grossPotentialIncome > 0 ? price / grossPotentialIncome : 0;
  const operatingExpenseRatioActual = effectiveGrossIncome > 0 ? (operatingExpenses / effectiveGrossIncome) * 100 : 0;
  const breakEvenOccupancy =
    grossPotentialIncome > 0 ? ((operatingExpenses + annualDebtService) / grossPotentialIncome) * 100 : 0;
  const onePercentRuleValue = price > 0 ? (Math.max(0, i.grossRentMonthly) / price) * 100 : 0;

  const chartRaw: { name: string; value: number; color: string }[] = [
    { name: "Operating Expenses", value: operatingExpenses, color: "#F59E0B" },
    { name: "Debt Service", value: annualDebtService, color: "#EF4444" },
    { name: "Vacancy Loss", value: vacancyLoss, color: "#8B5CF6" },
    { name: "Net Cash Flow", value: Math.max(0, cashFlowAnnual), color: "#10B981" },
  ].filter((s) => s.value > 0);

  const chartTotal = chartRaw.reduce((sum, s) => sum + s.value, 0);
  const chartData: ChartSlice[] = chartRaw.map((s) => ({
    ...s,
    value: Number(s.value.toFixed(2)),
    percent: chartTotal > 0 ? (s.value / chartTotal) * 100 : 0,
  }));

  const whole = (v: number) => `${v < 0 ? "-" : ""}$${Math.round(Math.abs(v)).toLocaleString("en-US")}`;

  const rows: TableRow[] = [
    { label: "Gross Potential Income", value: whole(grossPotentialIncome) },
    { label: `Vacancy & Credit Loss (${i.vacancyRate}%)`, value: `-${whole(vacancyLoss).replace("-", "")}` },
    { label: "Effective Gross Income", value: whole(effectiveGrossIncome) },
    { label: `Operating Expenses (${i.operatingExpenseRatio}%)`, value: `-${whole(operatingExpenses).replace("-", "")}` },
    { label: "Net Operating Income (NOI)", value: whole(netOperatingIncome), key: true },
    { label: "Annual Debt Service", value: `-${whole(annualDebtService).replace("-", "")}` },
    { label: "Annual Cash Flow", value: whole(cashFlowAnnual) },
    { label: "Monthly Cash Flow", value: whole(cashFlowMonthly) },
    { label: "Total Cash Invested", value: whole(totalCashInvested) },
    { label: "Cap Rate", value: `${capRate.toFixed(2)}%` },
    { label: "Cash-on-Cash Return", value: `${cashOnCashReturn.toFixed(2)}%` },
    { label: "Debt Service Coverage Ratio", value: debtServiceCoverageRatio.toFixed(2) },
  ];

  // Professional mode: multi-year projection with reversion.
  const hold = Math.max(1, Math.round(i.holdYears));
  const rentGrowth = Math.max(0, i.rentGrowthRate) / 100;
  const expenseGrowth = Math.max(0, i.expenseGrowthRate) / 100;

  const cashFlows: number[] = [-totalCashInvested];
  let totalCashFlowOverHold = 0;
  let finalYearNoi = netOperatingIncome;

  for (let year = 1; year <= hold; year += 1) {
    const grownEgi = effectiveGrossIncome * Math.pow(1 + rentGrowth, year);
    const grownExpenses = operatingExpenses * Math.pow(1 + expenseGrowth, year);
    const yearNoi = grownEgi - grownExpenses;
    finalYearNoi = yearNoi;
    const yearCashFlow = yearNoi - annualDebtService;
    totalCashFlowOverHold += yearCashFlow;
    cashFlows.push(yearCashFlow);
  }

  // Reversion value from the exit cap rate applied to the final-year NOI.
  const exitCap = Math.max(0.01, i.exitCapRate) / 100;
  const exitValue = finalYearNoi / exitCap;
  const sellingCosts = exitValue * (Math.max(0, i.sellingCostPercent) / 100);

  // Remaining loan balance after the hold period.
  const monthsElapsed = hold * 12;
  let remainingBalance = loanAmount;
  if (r > 0 && monthsElapsed < n) {
    remainingBalance =
      loanAmount * Math.pow(1 + r, monthsElapsed) -
      monthlyDebtService * ((Math.pow(1 + r, monthsElapsed) - 1) / r);
  } else if (monthsElapsed >= n) {
    remainingBalance = 0;
  } else {
    remainingBalance = Math.max(0, loanAmount - monthlyDebtService * monthsElapsed);
  }
  remainingBalance = Math.max(0, remainingBalance);

  const netSaleProceeds = exitValue - sellingCosts - remainingBalance;
  cashFlows[cashFlows.length - 1] += netSaleProceeds;

  const totalReturned = totalCashFlowOverHold + netSaleProceeds;
  const equityMultiple = totalCashInvested > 0 ? totalReturned / totalCashInvested : 0;
  const irr = computeIrr(cashFlows);
  const averageAnnualReturn = totalCashInvested > 0 ? (totalReturned / totalCashInvested / hold) * 100 : 0;

  return {
    grossPotentialIncome,
    vacancyLoss,
    effectiveGrossIncome,
    operatingExpenses,
    netOperatingIncome,
    annualDebtService,
    monthlyDebtService,
    cashFlowAnnual,
    cashFlowMonthly,
    loanAmount,
    downPayment,
    closingCosts,
    totalCashInvested,
    capRate,
    cashOnCashReturn,
    debtServiceCoverageRatio,
    grossRentMultiplier,
    operatingExpenseRatioActual,
    breakEvenOccupancy,
    onePercentRuleValue,
    chartData,
    rows,
    exitValue,
    netSaleProceeds,
    totalCashFlowOverHold,
    equityMultiple,
    irr,
    averageAnnualReturn,
  };
}

const inp =
  "w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20";
const lbl = "text-sm font-medium text-foreground mb-1 block";
const groupLabel = "text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold flex items-center gap-1.5";

export default function ProFormaRealEstateAnalysisCalculator() {
  const [inputs, setInputs] = useState<ProFormaInputs>(DEFAULTS);
  const [result, setResult] = useState<ProFormaResult>(calculateProForma(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculateProForma(inputs));
  }, []);

  const calculate = () => setResult(calculateProForma(inputs));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculateProForma(DEFAULTS));
    setShowAdvanced(false);
  };

  const setNum = (key: keyof ProFormaInputs, raw: string) => {
    const parsed = parseFloat(raw);
    setInputs((prev) => ({ ...prev, [key]: isNaN(parsed) ? 0 : parsed }));
  };

  const whole = (v: number) => `${v < 0 ? "-" : ""}$${Math.round(Math.abs(v)).toLocaleString("en-US")}`;

  const capColor = result.capRate >= 7 ? "text-emerald-600" : result.capRate >= 5 ? "text-amber-600" : "text-red-600";
  const cocColor =
    result.cashOnCashReturn >= 8 ? "text-emerald-600" : result.cashOnCashReturn >= 4 ? "text-amber-600" : "text-red-600";
  const dscrColor =
    result.debtServiceCoverageRatio >= 1.25 ? "text-emerald-600" : result.debtServiceCoverageRatio >= 1.0 ? "text-amber-600" : "text-red-600";

  const faqs = [
    {
      question: "What is net operating income and why does it exclude the mortgage?",
      answer:
        "Net operating income is effective gross income minus all operating expenses, calculated before any debt service. It is deliberately financing-agnostic because it measures the property's performance rather than the buyer's loan terms. Two investors can pay the same price for the same building and have wildly different cash flow depending on their down payment and rate, but the NOI is identical. That is what makes NOI the basis for cap rate and for appraised value.",
    },
    {
      question: "What is a good cap rate?",
      answer:
        "Cap rate is NOI divided by purchase price, and a good one depends entirely on market and asset class. Prime multifamily in a supply-constrained coastal market may trade at 4% to 5%, while secondary-market small apartments or older commercial product might yield 7% to 9%. A high cap rate is not automatically a better deal, because it usually reflects higher perceived risk, weaker tenant credit, or deferred capital expenditure that will bite later.",
    },
    {
      question: "What debt service coverage ratio do lenders require?",
      answer:
        "Most commercial lenders want a DSCR of at least 1.25, meaning NOI covers debt service with 25% to spare. Below 1.0 the property does not generate enough income to pay its own mortgage, and you are funding the shortfall from other sources. Between 1.0 and 1.25 you are technically solvent but have almost no cushion for a vacancy, a roof, or a rate reset. DSCR is often the binding constraint on how much a lender will advance, more than loan-to-value.",
    },
    {
      question: "How reliable is the 1% rule?",
      answer:
        "The 1% rule says monthly rent should be at least 1% of purchase price. It is a screening heuristic, not an analysis, and it has become difficult to satisfy in most appreciating markets. Its real value is speed: it lets you discard obviously unworkable listings in seconds. Never buy on the 1% rule alone, because it ignores expense ratios, financing terms, capital expenditure, and local tax burdens entirely.",
    },
    {
      question: "What operating expense ratio should I assume?",
      answer:
        "For residential rental property, 35% to 45% of effective gross income is the realistic range once you include taxes, insurance, maintenance, management, and reserves. New investors routinely underestimate this by assuming only the bills they can see, which is how a deal that pencils at 25% expenses turns into negative cash flow in year two. If the seller's numbers show a ratio under 30%, ask specifically what has been left out.",
    },
    {
      question: "What is the difference between cash-on-cash return and IRR?",
      answer:
        "Cash-on-cash return divides one year of cash flow by the cash you invested, ignoring time value and ignoring the eventual sale. IRR accounts for the full sequence: your initial outlay, every year of cash flow, and the net proceeds at exit, all discounted for timing. A deal can show a modest 5% cash-on-cash and still produce a 15% IRR if appreciation and loan amortization do the heavy lifting. Both matter, and they answer different questions.",
    },
    {
      question: "What is break-even occupancy?",
      answer:
        "Break-even occupancy is the percentage of gross potential income you must actually collect to cover operating expenses plus debt service. If it computes to 85%, you can afford 15% vacancy before the property stops paying for itself. This is one of the most useful risk metrics in a pro forma because it translates abstract leverage into a concrete question: how many empty units can I survive?",
    },
    {
      question: "Why does the exit cap rate matter so much?",
      answer:
        "The exit cap rate converts your final-year NOI into a sale price, so it drives most of the projected return in a five to ten year hold. Underwriting an exit cap equal to or slightly above your entry cap is the conservative convention, because it does not assume the market will pay more for the same income later. Assuming cap rate compression is the single most common way an optimistic pro forma manufactures returns that never arrive.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator/finance" },
          { label: "Pro-Forma Real Estate Analysis Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Pro-Forma Real Estate Analysis Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card rounded-xl">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="purchasePrice" className={lbl}>Purchase Price</label>
                <input id="purchasePrice" type="number" min="0" step="5000" className={inp} value={inputs.purchasePrice}
                  onChange={(e) => setNum("purchasePrice", e.target.value)} />
              </div>
              <div>
                <label htmlFor="grossRentMonthly" className={lbl}>Gross Rent / mo</label>
                <input id="grossRentMonthly" type="number" min="0" step="50" className={inp} value={inputs.grossRentMonthly}
                  onChange={(e) => setNum("grossRentMonthly", e.target.value)} />
              </div>
              <div>
                <label htmlFor="operatingExpenseRatio" className={lbl}>Operating Expenses (%)</label>
                <input id="operatingExpenseRatio" type="number" min="0" max="100" step="1" className={inp}
                  value={inputs.operatingExpenseRatio} onChange={(e) => setNum("operatingExpenseRatio", e.target.value)} />
              </div>
              <div>
                <label htmlFor="downPaymentPercent" className={lbl}>Down Payment (%)</label>
                <input id="downPaymentPercent" type="number" min="0" max="100" step="1" className={inp}
                  value={inputs.downPaymentPercent} onChange={(e) => setNum("downPaymentPercent", e.target.value)} />
              </div>
            </div>

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
                      <Building2 className="h-3.5 w-3.5" /> Income Assumptions
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="otherIncomeMonthly" className={lbl}>Other Income / mo</label>
                        <input id="otherIncomeMonthly" type="number" min="0" step="25" className={inp}
                          value={inputs.otherIncomeMonthly} onChange={(e) => setNum("otherIncomeMonthly", e.target.value)} />
                      </div>
                      <div>
                        <label htmlFor="vacancyRate" className={lbl}>Vacancy Rate (%)</label>
                        <input id="vacancyRate" type="number" min="0" max="100" step="0.5" className={inp}
                          value={inputs.vacancyRate} onChange={(e) => setNum("vacancyRate", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className={groupLabel}>
                      <Percent className="h-3.5 w-3.5" /> Financing &amp; Acquisition
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="interestRate" className={lbl}>Interest Rate (%)</label>
                        <input id="interestRate" type="number" min="0" step="0.01" className={inp} value={inputs.interestRate}
                          onChange={(e) => setNum("interestRate", e.target.value)} />
                      </div>
                      <div>
                        <label htmlFor="loanTermYears" className={lbl}>Amortization</label>
                        <select id="loanTermYears" className={inp} value={inputs.loanTermYears}
                          onChange={(e) => setNum("loanTermYears", e.target.value)}>
                          <option value="30">30 years</option>
                          <option value="25">25 years</option>
                          <option value="20">20 years</option>
                          <option value="15">15 years</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label htmlFor="closingCostPercent" className={lbl}>Closing Costs (% of price)</label>
                        <input id="closingCostPercent" type="number" min="0" step="0.5" className={inp}
                          value={inputs.closingCostPercent} onChange={(e) => setNum("closingCostPercent", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className={groupLabel}>
                      <LineChart className="h-3.5 w-3.5" /> Professional Mode
                    </div>
                    <label htmlFor="proMode" className="flex items-center gap-2 text-sm font-medium text-foreground mb-3 cursor-pointer">
                      <input id="proMode" type="checkbox" className="h-4 w-4 accent-primary" checked={inputs.proMode}
                        onChange={(e) => setInputs((p) => ({ ...p, proMode: e.target.checked }))} />
                      Unlock hold-period IRR and reversion analysis
                    </label>
                    {inputs.proMode ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="holdYears" className={lbl}>Hold Period (yrs)</label>
                          <input id="holdYears" type="number" min="1" step="1" className={inp} value={inputs.holdYears}
                            onChange={(e) => setNum("holdYears", e.target.value)} />
                        </div>
                        <div>
                          <label htmlFor="exitCapRate" className={lbl}>Exit Cap Rate (%)</label>
                          <input id="exitCapRate" type="number" min="0.5" step="0.1" className={inp} value={inputs.exitCapRate}
                            onChange={(e) => setNum("exitCapRate", e.target.value)} />
                        </div>
                        <div>
                          <label htmlFor="rentGrowthRate" className={lbl}>Rent Growth / yr (%)</label>
                          <input id="rentGrowthRate" type="number" min="0" step="0.5" className={inp} value={inputs.rentGrowthRate}
                            onChange={(e) => setNum("rentGrowthRate", e.target.value)} />
                        </div>
                        <div>
                          <label htmlFor="expenseGrowthRate" className={lbl}>Expense Growth / yr (%)</label>
                          <input id="expenseGrowthRate" type="number" min="0" step="0.5" className={inp}
                            value={inputs.expenseGrowthRate} onChange={(e) => setNum("expenseGrowthRate", e.target.value)} />
                        </div>
                        <div className="col-span-2">
                          <label htmlFor="sellingCostPercent" className={lbl}>Selling Costs (% of exit price)</label>
                          <input id="sellingCostPercent" type="number" min="0" step="0.5" className={inp}
                            value={inputs.sellingCostPercent} onChange={(e) => setNum("sellingCostPercent", e.target.value)} />
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

          {/* RIGHT */}
          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Net Operating Income</div>
              <div className="text-4xl font-bold text-primary my-1">{whole(result.netOperatingIncome)}</div>
              <div className="text-sm text-muted-foreground">
                {whole(result.cashFlowMonthly)} monthly cash flow after debt service
              </div>
            </div>

            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              <div className="p-4 text-center">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Cap Rate</div>
                <div className={`text-lg font-bold ${capColor}`}>{result.capRate.toFixed(2)}%</div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Cash-on-Cash</div>
                <div className={`text-lg font-bold ${cocColor}`}>{result.cashOnCashReturn.toFixed(2)}%</div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">DSCR</div>
                <div className={`text-lg font-bold ${dscrColor}`}>{result.debtServiceCoverageRatio.toFixed(2)}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Pro-Forma Line Item</th>
                    <th className="p-2.5 pr-3 text-right">Annual Amount</th>
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
                    <td className="text-base py-2.5 px-3 text-foreground">Annual Cash Flow Before Tax</td>
                    <td className={`text-base py-2.5 px-3 text-right ${result.cashFlowAnnual >= 0 ? "text-primary" : "text-red-600"}`}>
                      {whole(result.cashFlowAnnual)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {mounted ? (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground mb-3">Where Gross Income Goes</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <RPie>
                    <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}>
                      {result.chartData.map((slice) => (
                        <Cell key={slice.name} fill={slice.color} />
                      ))}
                    </Pie>
                    <RTooltip formatter={(value: number) => whole(value)} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
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

            {inputs.proMode ? (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-bold text-foreground mb-3">{inputs.holdYears}-Year Hold &amp; Exit Analysis</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Projected Exit Value</div>
                    <div className="text-base font-bold text-foreground">{whole(result.exitValue)}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Net Sale Proceeds</div>
                    <div className="text-base font-bold text-foreground">{whole(result.netSaleProceeds)}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cumulative Cash Flow</div>
                    <div className="text-base font-bold text-foreground">{whole(result.totalCashFlowOverHold)}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Equity Multiple</div>
                    <div className="text-base font-bold text-foreground">{result.equityMultiple.toFixed(2)}x</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Internal Rate of Return</div>
                    <div className={`text-base font-bold ${result.irr >= 12 ? "text-emerald-600" : result.irr >= 7 ? "text-amber-600" : "text-red-600"}`}>
                      {result.irr.toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Average Annual Return</div>
                    <div className="text-base font-bold text-foreground">{result.averageAnnualReturn.toFixed(2)}%</div>
                  </div>
                </div>
              </div>
            ) : null}

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

            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-bold text-foreground mb-3">Screening Ratios</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Gross Rent Multiplier</div>
                  <div className="text-base font-bold text-foreground">{result.grossRentMultiplier.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">1% Rule Test</div>
                  <div className={`text-base font-bold ${result.onePercentRuleValue >= 1 ? "text-emerald-600" : "text-amber-600"}`}>
                    {result.onePercentRuleValue.toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Break-Even Occupancy</div>
                  <div className={`text-base font-bold ${result.breakEvenOccupancy <= 85 ? "text-emerald-600" : result.breakEvenOccupancy <= 95 ? "text-amber-600" : "text-red-600"}`}>
                    {result.breakEvenOccupancy.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Expense Ratio</div>
                  <div className="text-base font-bold text-foreground">{result.operatingExpenseRatioActual.toFixed(1)}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What a Real Estate Pro Forma Actually Does</h2>
            <p className="mb-4">
              A pro forma is a structured projection of a property's income and expenses, built in a fixed order that
              appraisers, lenders, and brokers all recognize. You begin with gross potential income, subtract vacancy and
              credit loss to reach effective gross income, subtract operating expenses to reach net operating income, and
              only then subtract debt service to arrive at cash flow. The order matters because each intermediate figure
              answers a different question, and mixing them together is how bad deals get mistaken for good ones.
            </p>

            <h2 className="text-2xl font-bold mb-3">Why NOI Ignores Your Mortgage</h2>
            <p className="mb-4">
              Net operating income is deliberately calculated before financing. Two buyers can pay the same price for the
              same building and end up with completely different cash flow depending on down payment and interest rate, but
              the property's NOI is identical in both cases. That independence is what makes NOI the foundation of value:
              divide it by the purchase price and you get the cap rate, the market's shorthand for what a stream of property
              income is worth. It also means a low cap rate cannot be fixed with clever financing, only disguised by it.
            </p>

            <h2 className="text-2xl font-bold mb-3">The Ratios Lenders and Investors Watch</h2>
            <p className="mb-4">
              Four numbers carry most of the decision. Cap rate measures unleveraged yield. Cash-on-cash return measures
              first-year cash flow against the cash you actually put in, including closing costs. Debt service coverage
              ratio, NOI divided by annual debt service, is usually the binding lending constraint, with 1.25 the common
              floor. Break-even occupancy tells you what share of gross potential income you must collect just to cover
              expenses and the mortgage, which translates leverage into the practical question of how much vacancy you can
              absorb before the property stops paying for itself.
            </p>

            <h2 className="text-2xl font-bold mb-3">Projecting Forward and the Exit Assumption</h2>
            <p>
              Single-year metrics miss most of the return on a leveraged asset, because appreciation and loan amortization
              accumulate quietly. Professional Mode above projects income and expenses forward at separate growth rates,
              computes the reversion value by applying an exit cap rate to final-year NOI, deducts selling costs and the
              remaining loan balance, and solves for internal rate of return and equity multiple across the full hold. Be
              disciplined about the exit cap: underwriting it equal to or slightly above your entry cap is the conservative
              convention, because assuming cap rate compression is the most common way an optimistic pro forma manufactures
              returns that never actually materialize.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/pro-forma-real-estate-analysis-calculator" />
          <PopularCalculators exclude="/calculator/pro-forma-real-estate-analysis-calculator" />
        </div>
      </div>
    </>
  );
}
