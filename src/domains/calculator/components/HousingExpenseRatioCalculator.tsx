"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface HousingInputs {
  grossIncome: number;
  housingCost: number;
  otherDebts: number;
  targetHousingPct: number;
  maxTotalDebtPct: number;
}

const DEFAULTS: HousingInputs = {
  grossIncome: 6500,
  housingCost: 2000,
  otherDebts: 450,
  targetHousingPct: 28,
  maxTotalDebtPct: 36,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

function housingBand(ratio: number): { label: string; tone: string } {
  if (ratio <= 28) return { label: "Affordable", tone: "text-emerald-600" };
  if (ratio <= 36) return { label: "Stretched", tone: "text-amber-600" };
  return { label: "Risky", tone: "text-red-600" };
}

interface HousingResult {
  housingRatio: number;
  totalDebtRatio: number;
  maxHousing: number;
  maxHousingAtTotal: number;
  housingHeadroom: number;
  otherDebtHeadroom: number;
  leftoverIncome: number;
  housingShare: number;
  otherShare: number;
  leftoverShare: number;
  valid: boolean;
  errorMsg: string;
}

function computeHousing(i: HousingInputs): HousingResult {
  const invalid =
    i.grossIncome <= 0 ||
    i.housingCost < 0 ||
    i.otherDebts < 0 ||
    i.targetHousingPct <= 0 ||
    i.targetHousingPct > 100 ||
    i.maxTotalDebtPct <= 0 ||
    i.maxTotalDebtPct > 100;

  const housingRatio = i.grossIncome > 0 ? (i.housingCost / i.grossIncome) * 100 : 0;
  const totalDebtRatio = i.grossIncome > 0 ? ((i.housingCost + i.otherDebts) / i.grossIncome) * 100 : 0;
  const maxHousing = i.grossIncome * (i.targetHousingPct / 100);
  const maxHousingAtTotal = Math.max(0, i.grossIncome * (i.maxTotalDebtPct / 100) - i.otherDebts);

  return {
    housingRatio,
    totalDebtRatio,
    maxHousing,
    maxHousingAtTotal,
    housingHeadroom: maxHousing - i.housingCost,
    otherDebtHeadroom: Math.max(0, i.grossIncome * (i.maxTotalDebtPct / 100) - i.housingCost - i.otherDebts),
    leftoverIncome: i.grossIncome - i.housingCost - i.otherDebts,
    housingShare: i.grossIncome > 0 ? (i.housingCost / i.grossIncome) * 100 : 0,
    otherShare: i.grossIncome > 0 ? (i.otherDebts / i.grossIncome) * 100 : 0,
    leftoverShare: i.grossIncome > 0 ? ((i.grossIncome - i.housingCost - i.otherDebts) / i.grossIncome) * 100 : 0,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a gross monthly income above zero, non-negative costs, and guideline percentages between 0% and 100%."
      : "",
  };
}

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  prefix?: string;
  suffix?: string;
  tooltip?: string;
  hint?: string;
  type?: string;
  min?: string;
  step?: string;
}

const CompactInput = ({
  id,
  label,
  value,
  onChange,
  onEnter,
  prefix,
  suffix,
  tooltip,
  hint,
  type = "number",
  min,
  step,
}: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1" title={tooltip}>
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && (
        <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>
      )}
      <input
        id={id}
        type={type}
        value={value}
        min={min}
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
    {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
  </div>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">{title}</div>
    {children}
  </div>
);

export default function HousingExpenseRatioCalculator() {
  const [grossIncome, setGrossIncome] = useState(String(DEFAULTS.grossIncome));
  const [housingCost, setHousingCost] = useState(String(DEFAULTS.housingCost));
  const [otherDebts, setOtherDebts] = useState(String(DEFAULTS.otherDebts));
  const [targetHousingPct, setTargetHousingPct] = useState(String(DEFAULTS.targetHousingPct));
  const [maxTotalDebtPct, setMaxTotalDebtPct] = useState(String(DEFAULTS.maxTotalDebtPct));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): HousingInputs => ({
    grossIncome: parseFloat(grossIncome) || 0,
    housingCost: parseFloat(housingCost) || 0,
    otherDebts: parseFloat(otherDebts) || 0,
    targetHousingPct: parseFloat(targetHousingPct) || 0,
    maxTotalDebtPct: parseFloat(maxTotalDebtPct) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<HousingInputs>(() => DEFAULTS);
  const [results, setResults] = useState<HousingResult>(() => computeHousing(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeHousing(inputs));
  };

  const reset = () => {
    setGrossIncome(String(DEFAULTS.grossIncome));
    setHousingCost(String(DEFAULTS.housingCost));
    setOtherDebts(String(DEFAULTS.otherDebts));
    setTargetHousingPct(String(DEFAULTS.targetHousingPct));
    setMaxTotalDebtPct(String(DEFAULTS.maxTotalDebtPct));
    setCalcInputs(DEFAULTS);
    setResults(computeHousing(DEFAULTS));
  };

  const band = housingBand(results.housingRatio);
  const debtBand = housingBand(results.totalDebtRatio);

  const faqs = [
    {
      question: "What is a good housing expense ratio?",
      answer:
        "Lenders conventionally treat housing costs of 28% or less of gross monthly income as affordable, 28% to 36% as stretched, and above 36% as risky. The 28% figure comes from the long-standing 28/36 rule used in mortgage underwriting. It is a guideline, not a law: in expensive metros many buyers exceed it, and lenders themselves often approve front-end ratios up to 31% or more for strong borrowers.",
    },
    {
      question: "Does the housing expense ratio include utilities?",
      answer:
        "For mortgage qualification, the front-end ratio includes principal and interest, property taxes, homeowners insurance and any HOA dues — the PITI components. Utilities are usually excluded from underwriting but belong in a realistic household budget. If you want a true affordability picture, add average monthly utilities and maintenance to the housing cost you enter, because those costs persist whether or not the lender counts them.",
    },
    {
      question: "What is the difference between the front-end and back-end ratio?",
      answer:
        "The front-end ratio is housing costs alone divided by gross income. The back-end ratio is all debt payments — housing plus car loans, student loans, credit card minimums and personal loans — divided by gross income. Lenders weigh both, with the back-end ratio usually the binding constraint; most conventional loans want a back-end ratio at or below 36%, though automated underwriting can approve up to 43% to 50% with compensating factors.",
    },
    {
      question: "Should I use gross or take-home income for this calculation?",
      answer:
        "Lenders use gross income, so use gross for any calculation you intend to compare against lending guidelines. For personal budgeting, though, take-home pay is the more honest base, because taxes are not available to pay a mortgage. A useful approach is to run the ratio both ways: if housing exceeds 28% of gross but also exceeds 35% of take-home, the budget is tighter than the guideline suggests.",
    },
    {
      question: "How can I lower my housing expense ratio?",
      answer:
        "Three levers: increase income, reduce housing cost, or reduce other debt. Refinancing to a lower rate reduces the payment directly; challenging property taxes or shopping insurance lowers the escrow portion; paying down other debts clears the back-end ratio and improves loan terms. If you are house-hunting, the ratio is most useful in reverse — it tells you the maximum housing payment your income supports before you fall in love with a listing above it.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Housing Expense Ratio Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Housing Expense Ratio Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Income & Housing">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="gross-income"
                  label="Gross Monthly Income"
                  value={grossIncome}
                  onChange={setGrossIncome}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Total household income before taxes, per month."
                />
                <CompactInput
                  id="housing-cost"
                  label="Monthly Housing Cost"
                  value={housingCost}
                  onChange={setHousingCost}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Mortgage or rent plus taxes, insurance, HOA and utilities."
                />
              </div>
            </SubSection>

            <SubSection title="Other Debt">
              <CompactInput
                id="other-debts"
                label="Other Monthly Debt Payments"
                value={otherDebts}
                onChange={setOtherDebts}
                onEnter={runCalculate}
                prefix="$"
                min="0"
                tooltip="Car loans, student loans, credit card minimums and personal loans."
              />
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
                  <SubSection title="Guideline Targets">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="target-housing"
                        label="Target Housing Ratio"
                        value={targetHousingPct}
                        onChange={setTargetHousingPct}
                        onEnter={runCalculate}
                        suffix="%"
                        step="0.5"
                        tooltip="Front-end guideline, conventionally 28% of gross income."
                      />
                      <CompactInput
                        id="max-total-debt"
                        label="Max Total Debt Ratio"
                        value={maxTotalDebtPct}
                        onChange={setMaxTotalDebtPct}
                        onEnter={runCalculate}
                        suffix="%"
                        step="0.5"
                        tooltip="Back-end guideline, conventionally 36% including all debt."
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
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm"
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

          {/* RIGHT: RESULTS PANEL */}
          <div className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start">
            {!results.valid && (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Check your inputs</div>
                <div className="text-base font-medium text-foreground">{results.errorMsg}</div>
              </div>
            )}

            {/* PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Housing Expense Ratio</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {fmt(results.housingRatio, 1)}%
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                Band: <span className={`font-bold ${band.tone}`}>{band.label}</span> — the classic guideline is 28% or
                less
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Housing Cost
                </span>
                <span className="font-extrabold text-foreground">${fmt(results.housingShare > 0 ? calcInputs.housingCost : 0, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Income</span>
                <span className="font-extrabold text-foreground">${fmt(calcInputs.grossIncome, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Other Debts
                </span>
                <span className="font-extrabold text-foreground">${fmt(calcInputs.otherDebts, 0)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Monthly Outflow</th>
                    <th className="p-2.5 text-right w-[130px]">Amount</th>
                    <th className="p-2.5 pr-3 text-right w-[110px]">% of Income</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Housing</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(calcInputs.housingCost, 0)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">
                      {fmt(results.housingShare, 1)}%
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Other Debt Payments</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(calcInputs.otherDebts, 0)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{fmt(results.otherShare, 1)}%</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Remaining Income</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.leftoverIncome, 0)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">
                      {fmt(results.leftoverShare, 1)}%
                    </td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Gross Monthly Income</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(calcInputs.grossIncome, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-muted-foreground">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">
                Summary Statistics
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Total Debt-to-Income
                  </span>
                  <span className={`text-base font-bold ${debtBand.tone}`}>
                    {fmt(results.totalDebtRatio, 1)}% ({debtBand.label})
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Max Housing at {fmt(calcInputs.targetHousingPct, 0)}%
                  </span>
                  <span className="text-base font-bold text-foreground">${fmt(results.maxHousing, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Housing Headroom
                  </span>
                  <span className={`text-base font-bold ${results.housingHeadroom >= 0 ? "text-primary" : "text-red-600"}`}>
                    ${fmt(results.housingHeadroom, 0)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Max Housing incl. Debts
                  </span>
                  <span className="text-base font-bold text-foreground">${fmt(results.maxHousingAtTotal, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Other Debt Headroom
                  </span>
                  <span className="text-base font-bold text-foreground">${fmt(results.otherDebtHeadroom, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Left After Housing & Debts
                  </span>
                  <span className="text-base font-bold text-foreground">${fmt(results.leftoverIncome, 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Housing Expense Ratio Calculator?</h2>
            <p>
              A housing expense ratio calculator divides your monthly housing cost by your gross monthly income and
              expresses the result as a percentage — the front-end ratio that mortgage underwriters have used for
              decades. Housing costs mean everything that keeps a roof over your head: mortgage principal and interest,
              property taxes, homeowners insurance, HOA dues, and, in a realistic budget, utilities and maintenance. The
              ratio answers a simple question — how much of every dollar you earn is committed before any other spending.
            </p>
            <p>
              It also computes the back-end ratio, which adds all other debt payments — car loans, student loans, credit
              card minimums — to the same base. The two figures are the standard affordability tests used in lending,
              and they are just as useful in reverse: knowing the maximum housing payment your income supports tells you
              what price range to shop in before emotion gets involved. The traditional yardstick is 28% for housing
              alone and 36% for all debt combined.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The calculator divides housing cost by gross monthly income for the front-end ratio, and housing cost plus
              other debt by gross income for the back-end ratio. It then works the guideline in reverse: the maximum
              housing payment at your target percentage is simply income multiplied by that percentage, and the housing
              budget implied by the total-debt guideline is the debt limit minus the payments you already carry.
            </p>
            <p>
              Subtracting your current housing cost from the target gives the housing headroom — the amount by which you
              are under or over the line — while the other-debt headroom shows how much additional debt capacity remains
              under the combined limit. The leftover income figure is the arithmetic residue: what remains of gross
              income after housing and debt payments, before taxes and living costs are considered.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports the housing expense ratio with its band — affordable at 28% or less, stretched
              between 28% and 36%, risky above that. The three-stat bar shows the raw inputs, and the breakdown table
              splits gross income between housing, other debt and what remains, so the ratio is visible as a share of
              every dollar earned rather than an abstract percentage.
            </p>
            <p>
              Summary Statistics adds the total debt-to-income ratio, the maximum housing payment at your target
              percentage, your housing headroom, the housing budget implied by the combined debt limit and the remaining
              debt capacity. A negative housing headroom is the signal to act: it means current housing costs already
              exceed the guideline, and the same income would support the target payment only in a cheaper home. Treat
              the ratios as guidelines rather than verdicts: lenders apply flexibility for strong
              credit and reserves, and the 28/36 rule ignores taxes, childcare and other realities of a household budget.
              The most useful way to apply the numbers is at the decision boundary — if the ratio sits above 28%, the
              same income supports a cheaper house, and every dollar of other debt you retire moves the housing budget up
              by a dollar. Run the calculation again after any raise, refinance or debt payoff — the ratios move more
              than most households expect, and each run takes only a moment.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/housing-expense-ratio-calculator" />
          <PopularCalculators exclude="/calculator/housing-expense-ratio-calculator" />
        </div>
      </div>
    </>
  );
}
