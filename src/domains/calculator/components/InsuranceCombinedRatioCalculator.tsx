"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface RatioInputs {
  earnedPremium: number;
  writtenPremium: number;
  incurredLosses: number;
  underwritingExpenses: number;
  alae: number;
  ulae: number;
  development: number;
  dividends: number;
  commissions: number;
  taxesAndFees: number;
  investmentIncome: number;
  expenseBasis: string;
}

const DEFAULTS: RatioInputs = {
  earnedPremium: 12000000,
  writtenPremium: 12600000,
  incurredLosses: 8150000,
  underwritingExpenses: 3100000,
  alae: 560000,
  ulae: 280000,
  development: 150000,
  dividends: 180000,
  commissions: 1450000,
  taxesAndFees: 320000,
  investmentIncome: 900000,
  expenseBasis: "written",
};

const fmt = (v: number, d = 0) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const usd = (v: number) => (Number.isFinite(v) ? "$" + fmt(v, 0) : "—");

const pct = (v: number) => (Number.isFinite(v) ? fmt(v, 2) + "%" : "—");

interface RatioResult {
  ok: boolean;
  lossRatio: number;
  laeRatio: number;
  expenseRatio: number;
  commissionRatio: number;
  taxRatio: number;
  dividendRatio: number;
  combined: number;
  combinedAfterDividends: number;
  tradeRatio: number;
  investmentIncomeRatio: number;
  operatingRatio: number;
  underwritingResult: number;
  operatingResult: number;
  breakEvenLossRatio: number;
  lossRatioHeadroom: number;
  adjustedLosses: number;
  totalLae: number;
  expenseBase: number;
  lossReserveLoad: number;
  breakdown: { label: string; value: string; highlight?: boolean }[];
}

function calculateRatios(i: RatioInputs): RatioResult {
  const blank = (): RatioResult => ({
    ok: false,
    lossRatio: 0,
    laeRatio: 0,
    expenseRatio: 0,
    commissionRatio: 0,
    taxRatio: 0,
    dividendRatio: 0,
    combined: 0,
    combinedAfterDividends: 0,
    tradeRatio: 0,
    investmentIncomeRatio: 0,
    operatingRatio: 0,
    underwritingResult: 0,
    operatingResult: 0,
    breakEvenLossRatio: 0,
    lossRatioHeadroom: 0,
    adjustedLosses: 0,
    totalLae: 0,
    expenseBase: 0,
    lossReserveLoad: 0,
    breakdown: [],
  });

  const nums = [
    i.earnedPremium,
    i.writtenPremium,
    i.incurredLosses,
    i.underwritingExpenses,
    i.alae,
    i.ulae,
    i.development,
    i.dividends,
    i.commissions,
    i.taxesAndFees,
    i.investmentIncome,
  ];
  if (!nums.every((v) => Number.isFinite(v))) return blank();
  if (i.earnedPremium <= 0 || i.earnedPremium > 1e12) return blank();
  if (i.writtenPremium <= 0 || i.writtenPremium > 1e12) return blank();
  if (nums.some((v) => v < 0)) return blank();

  // Statutory accounting: losses and LAE run against earned premium, the
  // underwriting expense ratio runs against written premium (SAP), which is the
  // convention in the annual statement's underwriting exhibit.
  const onEarned = i.earnedPremium;
  const expenseBase = i.expenseBasis === "earned" ? i.earnedPremium : i.writtenPremium;

  const adjustedLosses = i.incurredLosses + i.development;
  const totalLae = i.alae + i.ulae;

  const lossRatio = (adjustedLosses / onEarned) * 100;
  const laeRatio = (totalLae / onEarned) * 100;
  const expenseRatio = (i.underwritingExpenses / expenseBase) * 100;
  const commissionRatio = (i.commissions / expenseBase) * 100;
  const taxRatio = (i.taxesAndFees / expenseBase) * 100;
  const dividendRatio = (i.dividends / onEarned) * 100;

  const combined = lossRatio + laeRatio + expenseRatio;
  const combinedAfterDividends = combined + dividendRatio;
  const tradeRatio = ((adjustedLosses + totalLae) / i.writtenPremium) * 100;
  const investmentIncomeRatio = (i.investmentIncome / onEarned) * 100;
  const operatingRatio = combinedAfterDividends - investmentIncomeRatio;

  // Statutory underwriting result: earned premium less incurred losses, LAE and
  // underwriting expenses. Policyholder dividends are a separate deduction.
  const underwritingResult = onEarned * (1 - combined / 100);
  const operatingResult = underwritingResult + i.investmentIncome - i.dividends;

  const breakEvenLossRatio = 100 - laeRatio - expenseRatio;
  const lossRatioHeadroom = breakEvenLossRatio - lossRatio;
  const lossReserveLoad = adjustedLosses - i.incurredLosses;

  const breakdown = [
    { label: "Earned premium", value: usd(i.earnedPremium) },
    { label: "Written premium", value: usd(i.writtenPremium) },
    { label: "Incurred losses (as entered)", value: usd(i.incurredLosses) },
    { label: "Prior-year reserve development (adverse +)", value: usd(i.development) },
    { label: "Incurred losses after development", value: usd(adjustedLosses), highlight: true },
    { label: "Allocated loss adjustment expense", value: usd(i.alae) },
    { label: "Unallocated loss adjustment expense", value: usd(i.ulae) },
    { label: "Loss ratio — losses / earned premium", value: pct(lossRatio) },
    { label: "LAE ratio — LAE / earned premium", value: pct(laeRatio) },
    {
      label: `Expense ratio — expenses / ${i.expenseBasis === "earned" ? "earned" : "written"} premium`,
      value: pct(expenseRatio),
    },
    { label: "Combined ratio", value: pct(combined), highlight: true },
    { label: "Policyholder dividend ratio", value: pct(dividendRatio) },
    { label: "Combined ratio after dividends", value: pct(combinedAfterDividends) },
    { label: "Trade ratio — losses and LAE / written premium", value: pct(tradeRatio) },
    { label: "Investment income ratio", value: pct(investmentIncomeRatio) },
    { label: "Operating ratio after investment income", value: pct(operatingRatio), highlight: true },
  ];

  return {
    ok: true,
    lossRatio,
    laeRatio,
    expenseRatio,
    commissionRatio,
    taxRatio,
    dividendRatio,
    combined,
    combinedAfterDividends,
    tradeRatio,
    investmentIncomeRatio,
    operatingRatio,
    underwritingResult,
    operatingResult,
    breakEvenLossRatio,
    lossRatioHeadroom,
    adjustedLosses,
    totalLae,
    expenseBase,
    lossReserveLoad,
    breakdown,
  };
}

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  hint?: string;
  error?: string;
  type?: string;
  min?: string;
  max?: string;
  step?: string;
  suffix?: string;
  tooltip?: string;
}

const CompactInput = ({
  id,
  label,
  value,
  onChange,
  onEnter,
  hint,
  error,
  type = "number",
  min,
  max,
  step,
  suffix,
  tooltip,
}: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1" title={tooltip}>
      {label}
    </label>
    <div
      className={`relative w-full flex items-center rounded-md border bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all ${
        error ? "border-destructive" : "border-input"
      }`}
    >
      <input
        id={id}
        type={type}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onEnter) onEnter();
        }}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
      />
      {suffix && (
        <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>
      )}
    </div>
    {hint && !error && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
    {error && <p className="text-[11px] text-destructive mt-1">{error}</p>}
  </div>
);

const CompactSelect = ({
  id,
  label,
  value,
  onChange,
  options,
  tooltip,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  tooltip?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1" title={tooltip}>
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-background outline-none focus:outline-none border-none text-foreground"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">{title}</div>
    {children}
  </div>
);

export default function InsuranceCombinedRatioCalculator() {
  const [earnedPremium, setEarnedPremium] = useState(String(DEFAULTS.earnedPremium));
  const [writtenPremium, setWrittenPremium] = useState(String(DEFAULTS.writtenPremium));
  const [incurredLosses, setIncurredLosses] = useState(String(DEFAULTS.incurredLosses));
  const [underwritingExpenses, setUnderwritingExpenses] = useState(String(DEFAULTS.underwritingExpenses));
  const [alae, setAlae] = useState(String(DEFAULTS.alae));
  const [ulae, setUlae] = useState(String(DEFAULTS.ulae));
  const [development, setDevelopment] = useState(String(DEFAULTS.development));
  const [dividends, setDividends] = useState(String(DEFAULTS.dividends));
  const [commissions, setCommissions] = useState(String(DEFAULTS.commissions));
  const [taxesAndFees, setTaxesAndFees] = useState(String(DEFAULTS.taxesAndFees));
  const [investmentIncome, setInvestmentIncome] = useState(String(DEFAULTS.investmentIncome));
  const [expenseBasis, setExpenseBasis] = useState(DEFAULTS.expenseBasis);
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): RatioInputs => ({
    earnedPremium: parseFloat(earnedPremium) || 0,
    writtenPremium: parseFloat(writtenPremium) || 0,
    incurredLosses: parseFloat(incurredLosses) || 0,
    underwritingExpenses: parseFloat(underwritingExpenses) || 0,
    alae: parseFloat(alae) || 0,
    ulae: parseFloat(ulae) || 0,
    development: parseFloat(development) || 0,
    dividends: parseFloat(dividends) || 0,
    commissions: parseFloat(commissions) || 0,
    taxesAndFees: parseFloat(taxesAndFees) || 0,
    investmentIncome: parseFloat(investmentIncome) || 0,
    expenseBasis,
  });

  const [calcInputs, setCalcInputs] = useState<RatioInputs>(() => DEFAULTS);
  const [results, setResults] = useState<RatioResult>(() => calculateRatios(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculateRatios(inputs));
  };

  const reset = () => {
    setEarnedPremium(String(DEFAULTS.earnedPremium));
    setWrittenPremium(String(DEFAULTS.writtenPremium));
    setIncurredLosses(String(DEFAULTS.incurredLosses));
    setUnderwritingExpenses(String(DEFAULTS.underwritingExpenses));
    setAlae(String(DEFAULTS.alae));
    setUlae(String(DEFAULTS.ulae));
    setDevelopment(String(DEFAULTS.development));
    setDividends(String(DEFAULTS.dividends));
    setCommissions(String(DEFAULTS.commissions));
    setTaxesAndFees(String(DEFAULTS.taxesAndFees));
    setInvestmentIncome(String(DEFAULTS.investmentIncome));
    setExpenseBasis(DEFAULTS.expenseBasis);
    setCalcInputs(DEFAULTS);
    setResults(calculateRatios(DEFAULTS));
  };

  const earnedNum = parseFloat(earnedPremium);
  const writtenNum = parseFloat(writtenPremium);
  const lossesNum = parseFloat(incurredLosses);

  const errors = {
    earned: !Number.isFinite(earnedNum) || earnedNum <= 0 ? "Enter earned premium above zero" : "",
    written: !Number.isFinite(writtenNum) || writtenNum <= 0 ? "Enter written premium above zero" : "",
    losses: !Number.isFinite(lossesNum) || lossesNum < 0 ? "Losses cannot be negative" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const underwritingProfitable = results.combined < 100;
  const verdictText = underwritingProfitable
    ? `Underwriting profit of ${usd(results.underwritingResult)} at a ${pct(results.combined)} combined ratio`
    : `Underwriting loss of ${usd(Math.abs(results.underwritingResult))} at a ${pct(results.combined)} combined ratio`;
  const operationsProfitable = results.operatingResult >= 0;

  const faqs = [
    {
      question: "What is a good combined ratio for an insurance company?",
      answer:
        "Anything below 100 means the carrier made an underwriting profit before investment income; anything above 100 means it paid out more in losses and expenses than it collected in premium. The US property and casualty industry as a whole ran around 103.4 in 2023 and 105.2 in 2022, so most years the industry underwrites at a small loss and earns its return on the float. Personal lines typically run higher than commercial lines, and workers compensation and surety often run far lower. Read your own ratio against the segment benchmark rather than against 100 alone — a specialty carrier at 98 can be performing worse than a homeowners writer at 104 if its segment norm is 95.",
    },
    {
      question: "Why is the expense ratio calculated on written premium and not earned premium?",
      answer:
        "Because that is what statutory accounting prescribes: underwriting expenses such as commissions, premium taxes and general expenses are incurred when the policy is written, while the premium is only earned as coverage is provided. Dividing written-basis expenses by earned premium would understate or overstate the ratio whenever premium volume is growing or shrinking, so the annual statement's underwriting exhibit pairs written premium with written-basis expenses. This calculator uses the statutory convention by default but lets you switch to an earned-premium basis, which is closer to the GAAP presentation some analysts prefer. The difference matters in a fast-growing book: here written premium exceeds earned premium, so the statutory expense ratio is lower than the earned-basis one.",
    },
    {
      question: "What is the difference between the combined ratio and the operating ratio?",
      answer:
        "The combined ratio measures underwriting alone — losses, loss adjustment expense and underwriting expenses as a percentage of premium. The operating ratio subtracts investment income, which is the return the insurer earns on the float between collecting premium and paying claims. It is entirely normal for a well-run carrier to post a combined ratio just above 100 and still report a healthy operating profit, because investment income is a real and recurring part of the business model. Policyholder dividends also sit outside the combined ratio and are added back as a separate line before arriving at the operating ratio, which is why this calculator shows the combined ratio after dividends as an intermediate step.",
    },
    {
      question: "How do prior-year reserve development and LAE affect the combined ratio?",
      answer:
        "Adverse development means the claims you thought were settled for a given accident year are costing more than reserved, so it increases incurred losses in the current period and pushes the loss ratio up; favourable development does the opposite. Loss adjustment expense is split into the allocated side, which is claim-specific work like independent adjusters, and the unallocated side, which covers the internal claim department, and both are customarily expressed against earned premium on the loss side of the combined ratio rather than on the expense side. Together they often add seven to twelve points to the combined ratio, which is why a loss ratio that looks comfortable on its own can still produce an underwriting loss.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Insurance Combined Ratio Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Insurance Combined Ratio Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Premium & Losses">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="earned"
                  label="Earned Premium"
                  value={earnedPremium}
                  onChange={setEarnedPremium}
                  onEnter={runCalculate}
                  min="1"
                  step="10000"
                  suffix="$"
                  error={errors.earned}
                  hint="Premium earned in the period."
                  tooltip="Premium earned over the reporting period, from the statutory income statement."
                />
                <CompactInput
                  id="incurred"
                  label="Incurred Losses"
                  value={incurredLosses}
                  onChange={setIncurredLosses}
                  onEnter={runCalculate}
                  min="0"
                  step="10000"
                  suffix="$"
                  error={errors.losses}
                  hint="Paid plus change in reserves."
                  tooltip="Incurred losses for the period: paid losses plus the change in loss reserves."
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <CompactInput
                  id="written"
                  label="Written Premium"
                  value={writtenPremium}
                  onChange={setWrittenPremium}
                  onEnter={runCalculate}
                  min="1"
                  step="10000"
                  suffix="$"
                  error={errors.written}
                  hint="Direct and assumed premium written."
                  tooltip="Net premium written during the period. Statutory practice pairs this with underwriting expenses."
                />
                <CompactInput
                  id="expenses"
                  label="Underwriting Expenses"
                  value={underwritingExpenses}
                  onChange={setUnderwritingExpenses}
                  onEnter={runCalculate}
                  min="0"
                  step="10000"
                  suffix="$"
                  tooltip="Commissions, premium taxes, licences, fees and general underwriting overhead."
                />
              </div>
            </SubSection>

            {/* ADVANCED OPTIONS */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdv(!showAdv)}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdv ? "rotate-180" : ""}`} />
              </button>

              {showAdv && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up !overflow-visible">
                  <SubSection title="Loss Adjustment & Reserves">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="alae"
                        label="Allocated LAE"
                        value={alae}
                        onChange={setAlae}
                        onEnter={runCalculate}
                        min="0"
                        step="5000"
                        suffix="$"
                        tooltip="Claim-specific expense: independent adjusters, experts, legal defence."
                      />
                      <CompactInput
                        id="ulae"
                        label="Unallocated LAE"
                        value={ulae}
                        onChange={setUlae}
                        onEnter={runCalculate}
                        min="0"
                        step="5000"
                        suffix="$"
                        tooltip="Internal claim department cost that cannot be assigned to an individual claim."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <CompactInput
                        id="development"
                        label="Reserve Development"
                        value={development}
                        onChange={setDevelopment}
                        onEnter={runCalculate}
                        min="0"
                        step="5000"
                        suffix="$"
                        hint="Adverse development, leave 0 if none."
                        tooltip="Prior-year adverse development, added to incurred losses. Use 0 when reserves developed favourably."
                      />
                      <CompactInput
                        id="dividends"
                        label="Policyholder Dividends"
                        value={dividends}
                        onChange={setDividends}
                        onEnter={runCalculate}
                        min="0"
                        step="5000"
                        suffix="$"
                        tooltip="Dividends paid or declared to policyholders, carried outside the combined ratio."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Expense Detail & Investment Income">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="commission"
                        label="Commission & Brokerage"
                        value={commissions}
                        onChange={setCommissions}
                        onEnter={runCalculate}
                        min="0"
                        step="5000"
                        suffix="$"
                        tooltip="Acquisition cost paid to agents and brokers, a subset of underwriting expenses."
                      />
                      <CompactInput
                        id="taxes"
                        label="Taxes, Licences & Fees"
                        value={taxesAndFees}
                        onChange={setTaxesAndFees}
                        onEnter={runCalculate}
                        min="0"
                        step="5000"
                        suffix="$"
                        tooltip="Premium taxes, guaranty fund assessments and state licensing fees."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <CompactInput
                        id="investment"
                        label="Net Investment Income"
                        value={investmentIncome}
                        onChange={setInvestmentIncome}
                        onEnter={runCalculate}
                        min="0"
                        step="5000"
                        suffix="$"
                        hint="Earned on the float."
                        tooltip="Net investment income earned in the period, used to derive the operating ratio."
                      />
                      <CompactSelect
                        id="basis"
                        label="Expense Ratio Basis"
                        value={expenseBasis}
                        onChange={setExpenseBasis}
                        options={[
                          { value: "written", label: "Written premium (statutory)" },
                          { value: "earned", label: "Earned premium (GAAP style)" },
                        ]}
                        tooltip="Statutory practice divides underwriting expenses by written premium; analysts sometimes use earned premium instead."
                      />
                    </div>
                  </SubSection>
                </div>
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2.5 mt-2">
              <button
                type="button"
                onClick={runCalculate}
                disabled={hasErrors}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={reset}
                aria-label="Reset"
                className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start">
            {!results.ok && (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Check your inputs</div>
                <div className="text-base font-medium text-foreground">
                  Enter earned and written premium above zero, with no negative expenses.
                </div>
              </div>
            )}

            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Combined Ratio</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.ok ? pct(results.combined) : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.ok ? verdictText : "Fill in premium and loss figures to run the ratio"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Loss Ratio</span>
                <span className="font-extrabold text-foreground">{pct(results.lossRatio)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Expense Ratio</span>
                <span className="font-extrabold text-foreground">{pct(results.expenseRatio)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Operating Ratio</span>
                <span className={`font-extrabold ${operationsProfitable ? "text-emerald-600" : "text-destructive"}`}>
                  {pct(results.operatingRatio)}
                </span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Underwriting Exhibit</th>
                    <th className="p-2.5 pr-3 text-right w-[220px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.breakdown.map((row) => (
                    <tr key={row.label} className={row.highlight ? "bg-secondary/20" : "hover:bg-secondary/20 transition-colors"}>
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{row.value}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                    <td className="p-2.5 pl-3 text-foreground">Underwriting result</td>
                    <td className={`p-2.5 pr-3 text-right ${underwritingProfitable ? "text-emerald-600" : "text-destructive"}`}>
                      {results.ok
                        ? (results.underwritingResult >= 0 ? "" : "−") + usd(Math.abs(results.underwritingResult))
                        : "—"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Loss ratio</span>
                  <span className="text-base font-bold text-foreground">{pct(results.lossRatio)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">LAE ratio</span>
                  <span className="text-base font-bold text-foreground">{pct(results.laeRatio)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Expense ratio</span>
                  <span className="text-base font-bold text-foreground">{pct(results.expenseRatio)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Commission ratio</span>
                  <span className="text-base font-bold text-foreground">{pct(results.commissionRatio)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Taxes and fees ratio</span>
                  <span className="text-base font-bold text-foreground">{pct(results.taxRatio)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Trade ratio</span>
                  <span className="text-base font-bold text-foreground">{pct(results.tradeRatio)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Break-even loss ratio</span>
                  <span className="text-base font-bold text-foreground">{pct(results.breakEvenLossRatio)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Loss ratio headroom</span>
                  <span
                    className={`text-base font-bold ${
                      results.lossRatioHeadroom >= 0 ? "text-emerald-600" : "text-destructive"
                    }`}
                  >
                    {pct(results.lossRatioHeadroom)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Investment income ratio</span>
                  <span className="text-base font-bold text-foreground">{pct(results.investmentIncomeRatio)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Operating result</span>
                  <span className={`text-base font-bold ${operationsProfitable ? "text-emerald-600" : "text-destructive"}`}>
                    {(results.operatingResult >= 0 ? "" : "−") + usd(Math.abs(results.operatingResult))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is an Insurance Combined Ratio Calculator?</h2>
            <p>
              An insurance combined ratio calculator takes premium, loss and expense figures from an underwriting period and expresses
              them as the ratio insurers use to judge whether the business made money on the insurance itself. It adds the loss ratio, the
              loss adjustment expense ratio and the underwriting expense ratio into a single percentage, then extends the analysis to
              policyholder dividends and investment income so the statutory underwriting result and the operating result can both be read
              off the same page. Total expenses of 98, 101 or 106 on 100 of premium mean very different things to an underwriter, and the
              ratio is the fastest way to see which side of break-even a book of business is sitting on.
            </p>
            <p>
              The measure matters because insurance is a business of two profits: the underwriting margin and the investment return earned
              on the float between collecting premium and paying claims. A carrier can run a combined ratio above 100 and still be
              profitable, which is exactly why almost every annual report pairs the combined ratio with an operating ratio. This
              calculator keeps the statutory convention where it matters — losses and loss adjustment expense against earned premium,
              underwriting expenses against written premium — and states the basis explicitly so the result can be compared with a real
              annual statement exhibit.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The loss ratio is incurred losses divided by earned premium, after adding any prior-year reserve development to the losses as
              entered. Development matters because it is where reserving quality shows up: a book that keeps posting adverse development
              is quietly repricing last year's business. The loss adjustment expense ratio adds allocated and unallocated LAE together and
              divides by earned premium, following the standard practice of putting claim-handling cost on the loss side of the ratio
              rather than the expense side. Those three lines — losses, LAE and underwriting expenses — sum to the combined ratio.
            </p>
            <p>
              The expense ratio is the one line with a choice of basis. Statutory accounting divides underwriting expenses by written
              premium, because commissions and premium taxes are incurred when the policy is written even though the revenue is earned
              over the policy term. Selecting the earned-premium basis instead gives a figure closer to a GAAP-style presentation, and the
              two diverge sharply in a growing book: when written premium exceeds earned premium, the written basis produces the lower of
              the two ratios. The trade ratio, which divides losses and LAE by written premium, is shown as well because some regulators
              and reinsurers test the loss side on the written basis in a fast-growing or shrinking book.
            </p>
            <p>
              The underwriting result converts the combined ratio back into money: earned premium multiplied by one minus the ratio, which
              is negative whenever the ratio exceeds 100. Policyholder dividends are added as a separate ratio to give the combined ratio
              after dividends, and net investment income is expressed as a percentage of earned premium and subtracted to produce the
              operating ratio. The break-even loss ratio is the loss ratio at which the combined ratio would hit exactly 100 given the
              expense structure, and the difference between it and the actual loss ratio is the headroom the book has before it stops
              paying for itself.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The headline is the combined ratio with the underwriting result in currency underneath. Below 100 is an underwriting profit,
              above 100 is a loss, and the distance from 100 tells you the size of the margin rather than just its direction. The
              three-stat bar shows the loss ratio, the expense ratio and the operating ratio together, which separates the two levers a
              management team actually controls: claims performance on one side and acquisition and overhead cost on the other.
            </p>
            <p>
              Compare your figures with the segment rather than with an absolute threshold. The US property and casualty industry as a
              whole ran about 103.4 in 2023 and 105.2 in 2022, so a ratio of 101 can be strong performance in a badly priced market and
              poor performance in a soft one. Watch the headroom figure in the summary panel: when it is a point or two, a single large
              claim or a modest uptick in severity wipes it out, and when it is negative the book is already relying on investment income
              to post a profit. Read the commission and tax ratios to see whether distribution cost or claims cost is doing the damage,
              since the two call for completely different responses.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/insurance-combined-ratio-calculator" />
          <PopularCalculators exclude="/calculator/insurance-combined-ratio-calculator" />
        </div>
      </div>
    </>
  );
}
