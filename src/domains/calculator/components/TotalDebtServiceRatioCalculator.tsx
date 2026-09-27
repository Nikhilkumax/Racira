"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface TdsInputs {
  annualIncome: number;
  housingCost: number;
  otherDebt: number;
  gdsLimitPct: number;
  tdsLimitPct: number;
}

const DEFAULTS: TdsInputs = {
  annualIncome: 78000,
  housingCost: 2100,
  otherDebt: 650,
  gdsLimitPct: 32,
  tdsLimitPct: 44,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface TdsResult {
  monthlyIncome: number;
  gds: number;
  tds: number;
  maxHousing: number;
  maxTotalDebt: number;
  housingHeadroom: number;
  otherDebtHeadroom: number;
  remainingIncome: number;
  qualifies: boolean;
  gdsOk: boolean;
  tdsOk: boolean;
  valid: boolean;
  errorMsg: string;
}

function computeTds(i: TdsInputs): TdsResult {
  const invalid =
    i.annualIncome <= 0 ||
    i.housingCost < 0 ||
    i.otherDebt < 0 ||
    i.gdsLimitPct <= 0 ||
    i.gdsLimitPct > 100 ||
    i.tdsLimitPct <= 0 ||
    i.tdsLimitPct > 100;

  const monthlyIncome = i.annualIncome / 12;
  const gds = monthlyIncome > 0 ? (i.housingCost / monthlyIncome) * 100 : 0;
  const tds = monthlyIncome > 0 ? ((i.housingCost + i.otherDebt) / monthlyIncome) * 100 : 0;
  const maxHousing = monthlyIncome * (i.gdsLimitPct / 100);
  const maxTotalDebt = monthlyIncome * (i.tdsLimitPct / 100);

  return {
    monthlyIncome,
    gds,
    tds,
    maxHousing,
    maxTotalDebt,
    housingHeadroom: maxHousing - i.housingCost,
    otherDebtHeadroom: maxTotalDebt - i.housingCost - i.otherDebt,
    remainingIncome: monthlyIncome - i.housingCost - i.otherDebt,
    qualifies: gds <= i.gdsLimitPct && tds <= i.tdsLimitPct,
    gdsOk: gds <= i.gdsLimitPct,
    tdsOk: tds <= i.tdsLimitPct,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter an annual income above zero, non-negative costs, and guideline limits between 0% and 100%."
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

export default function TotalDebtServiceRatioCalculator() {
  const [annualIncome, setAnnualIncome] = useState(String(DEFAULTS.annualIncome));
  const [housingCost, setHousingCost] = useState(String(DEFAULTS.housingCost));
  const [otherDebt, setOtherDebt] = useState(String(DEFAULTS.otherDebt));
  const [gdsLimitPct, setGdsLimitPct] = useState(String(DEFAULTS.gdsLimitPct));
  const [tdsLimitPct, setTdsLimitPct] = useState(String(DEFAULTS.tdsLimitPct));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): TdsInputs => ({
    annualIncome: parseFloat(annualIncome) || 0,
    housingCost: parseFloat(housingCost) || 0,
    otherDebt: parseFloat(otherDebt) || 0,
    gdsLimitPct: parseFloat(gdsLimitPct) || 0,
    tdsLimitPct: parseFloat(tdsLimitPct) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<TdsInputs>(() => DEFAULTS);
  const [results, setResults] = useState<TdsResult>(() => computeTds(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeTds(inputs));
  };

  const reset = () => {
    setAnnualIncome(String(DEFAULTS.annualIncome));
    setHousingCost(String(DEFAULTS.housingCost));
    setOtherDebt(String(DEFAULTS.otherDebt));
    setGdsLimitPct(String(DEFAULTS.gdsLimitPct));
    setTdsLimitPct(String(DEFAULTS.tdsLimitPct));
    setCalcInputs(DEFAULTS);
    setResults(computeTds(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is the difference between GDS and TDS?",
      answer:
        "Gross Debt Service (GDS) is housing costs alone — mortgage principal and interest, property taxes, heating and half of condo fees — divided by gross annual income. Total Debt Service (TDS) adds every other debt payment: car loans, student loans, credit card minimums and personal loans. Lenders underwrite to both, and TDS is usually the binding constraint because it captures the whole debt load rather than the housing line alone.",
    },
    {
      question: "What are typical TDS and GDS limits?",
      answer:
        "The classic Canadian guideline is 32% for GDS and 40% for TDS, and the federal stress test now generally permits up to 39% GDS and 44% TDS, with mortgage insurance sometimes allowing 44% TDS. In the United States, conventional underwriting tends to cap the back-end ratio at 36%, with automated approvals stretching to 43% to 50% for strong borrowers. Limits move with regulation and lender policy, so the calculator lets you set both thresholds yourself.",
    },
    {
      question: "Why do lenders stress-test my ratios?",
      answer:
        "Because a loan has to survive rate changes, not just today's payment. The stress test qualifies borrowers at a higher rate — commonly two percentage points above the contract rate, or a floor rate — so that a family is not pushed into default when they renew. The same logic is worth applying to your own budget: if the ratios only work at today's rate, they do not work under stress, which is why the calculator reports headroom rather than just a pass or fail.",
    },
    {
      question: "How is housing cost counted for TDS?",
      answer:
        "Housing cost in a TDS calculation includes principal and interest on the mortgage, property taxes, heating costs and 50% of condo or maintenance fees. Renting counts as the actual rent payment. If you own a property with other costs such as a monthly HOA fee on a freehold, check with the lender how it will treat them — treatments vary, and small inclusions can push a borderline application over the limit.",
    },
    {
      question: "How can I lower my TDS ratio quickly?",
      answer:
        "Three ways, in order of speed: pay off or pay down the smallest instalment debts to reduce monthly payments, consolidate higher-payment debt into a lower monthly obligation, or increase income through a documented raise or secondary income. Refinancing a car loan over a longer term also lowers the monthly payment, though it raises total interest — a trade-off that can be worth making when the goal is qualifying for a mortgage.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Total Debt Service Ratio Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Total Debt Service Ratio Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Income">
              <CompactInput
                id="annual-income"
                label="Gross Annual Income"
                value={annualIncome}
                onChange={setAnnualIncome}
                onEnter={runCalculate}
                prefix="$"
                tooltip="Total household income before tax, per year."
              />
            </SubSection>

            <SubSection title="Monthly Debt Payments">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="housing-cost"
                  label="Housing Costs"
                  value={housingCost}
                  onChange={setHousingCost}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Mortgage P&I, taxes, heating and half of condo fees — or rent."
                />
                <CompactInput
                  id="other-debt"
                  label="Other Debt Payments"
                  value={otherDebt}
                  onChange={setOtherDebt}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Car loans, student loans, credit card minimums and personal loans."
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
                  <SubSection title="Lender Limits">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="gds-limit"
                        label="GDS Limit"
                        value={gdsLimitPct}
                        onChange={setGdsLimitPct}
                        onEnter={runCalculate}
                        suffix="%"
                        step="0.5"
                        tooltip="Housing-only limit, commonly 32% to 39%."
                      />
                      <CompactInput
                        id="tds-limit"
                        label="TDS Limit"
                        value={tdsLimitPct}
                        onChange={setTdsLimitPct}
                        onEnter={runCalculate}
                        suffix="%"
                        step="0.5"
                        tooltip="All-debt limit, commonly 40% to 44%."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">
                Total Debt Service Ratio
              </div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{fmt(results.tds, 1)}%</div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.qualifies ? "Within both lender limits" : "Outside at least one lender limit"} · GDS{" "}
                {fmt(results.gds, 1)}%
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Monthly Income
                </span>
                <span className="font-extrabold text-foreground">${fmt(results.monthlyIncome, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Housing</span>
                <span className="font-extrabold text-foreground">${fmt(calcInputs.housingCost, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Other Debt
                </span>
                <span className="font-extrabold text-foreground">${fmt(calcInputs.otherDebt, 0)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Component</th>
                    <th className="p-2.5 text-right w-[130px]">Amount</th>
                    <th className="p-2.5 pr-3 text-right w-[110px]">Ratio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Housing costs (GDS)</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(calcInputs.housingCost, 0)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{fmt(results.gds, 1)}%</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Other debt payments</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(calcInputs.otherDebt, 0)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">
                      {fmt(results.tds - results.gds, 1)}%
                    </td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Total debt service (TDS)</td>
                    <td className="p-2.5 text-right text-foreground">
                      ${fmt(calcInputs.housingCost + calcInputs.otherDebt, 0)}
                    </td>
                    <td className="p-2.5 pr-3 text-right text-muted-foreground">{fmt(results.tds, 1)}%</td>
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
                    GDS vs Limit ({fmt(calcInputs.gdsLimitPct, 0)}%)
                  </span>
                  <span className={`text-base font-bold ${results.gdsOk ? "text-emerald-600" : "text-red-600"}`}>
                    {results.gdsOk ? "Within limit" : "Over limit"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    TDS vs Limit ({fmt(calcInputs.tdsLimitPct, 0)}%)
                  </span>
                  <span className={`text-base font-bold ${results.tdsOk ? "text-emerald-600" : "text-red-600"}`}>
                    {results.tdsOk ? "Within limit" : "Over limit"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Max Housing at GDS Limit
                  </span>
                  <span className="text-base font-bold text-foreground">${fmt(results.maxHousing, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Max Total Debt at TDS Limit
                  </span>
                  <span className="text-base font-bold text-foreground">${fmt(results.maxTotalDebt, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Housing Headroom
                  </span>
                  <span
                    className={`text-base font-bold ${results.housingHeadroom >= 0 ? "text-primary" : "text-red-600"}`}
                  >
                    ${fmt(results.housingHeadroom, 0)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Debt Headroom
                  </span>
                  <span
                    className={`text-base font-bold ${results.otherDebtHeadroom >= 0 ? "text-primary" : "text-red-600"}`}
                  >
                    ${fmt(results.otherDebtHeadroom, 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Total Debt Service Ratio Calculator?</h2>
            <p>
              A total debt service ratio calculator divides all of your monthly debt payments by your gross monthly
              income and expresses the result as a percentage — the number lenders use to decide how much debt you can
              safely carry. It comes in two forms. The Gross Debt Service (GDS) ratio counts housing costs alone:
              mortgage principal and interest, property taxes, heating and half of condo fees. The Total Debt Service
              (TDS) ratio adds every other obligation — car loans, student loans, credit cards, personal lines — and is
              the tougher test because it reflects your whole debt load rather than the mortgage line by itself.
            </p>
            <p>
              The ratio matters because lending decisions are made against hard thresholds. In Canada the long-standing
              guidelines are 32% GDS and 40% TDS, with the federal stress test generally allowing up to 39% and 44%. In
              the United States, conventional lending often caps the back-end ratio near 36%, with automated approvals
              reaching 43% to 50% for strong credit. Knowing both ratios before you apply — and how much headroom you
              have under each limit — turns a binary approval decision into a modelling exercise you control.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The calculator converts gross annual income to a monthly figure by dividing by twelve. It divides housing
              costs by that monthly income for the GDS ratio, and housing plus all other debt payments by the same income
              for the TDS ratio. It then works each limit in reverse: the maximum housing payment is income multiplied by
              the GDS limit, and the maximum total debt service is income multiplied by the TDS limit.
            </p>
            <p>
              Subtracting your actual payments from those maximums produces headroom on both lines — the amount by which
              you are inside or outside the guideline. The remaining income figure is what is left of gross income after
              housing and debt payments, before tax and living costs. When a hypothetical purchase or refinance is on the
              table, re-running the numbers with the new payment shows immediately whether the ratios still clear the
              lender&apos;s thresholds.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports the TDS ratio with a pass or fail against both limits, and the GDS ratio beneath
              it. The three-stat bar shows the monthly income and the two payment components, while the breakdown table
              separates the housing contribution to GDS from the additional debt contribution that makes up TDS, so the
              two ratios are visible as parts of one picture.
            </p>
            <p>
              Summary Statistics adds each ratio&apos;s standing against its limit, the maximum housing and total debt
              payments the income supports, and the headroom on both lines. Treat the limits you enter as policy inputs,
              not constants: lenders differ, insured and uninsured mortgages are treated differently, and the stress test
              rate changes with the market. The most reliable use of the calculator is to keep a buffer — if a payment
              clears the limit by a comfortable margin, a              rate rise at renewal will not turn a qualified borrower into a
              strained one. Re-run the numbers after any rate change, income change or new loan, and keep the two ratios
              together — housing comfort and total debt capacity rarely move in the same direction at the same time.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/total-debt-service-ratio-calculator" />
          <PopularCalculators exclude="/calculator/total-debt-service-ratio-calculator" />
        </div>
      </div>
    </>
  );
}
