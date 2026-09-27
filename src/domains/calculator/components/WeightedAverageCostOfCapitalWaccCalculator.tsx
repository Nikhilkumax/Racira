"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface WaccInputs {
  equityValue: number;
  debtValue: number;
  preferredValue: number;
  costOfEquity: number;
  costOfDebt: number;
  costOfPreferred: number;
  taxRate: number;
  freeCashFlow: number;
}

const DEFAULTS: WaccInputs = {
  equityValue: 600000,
  debtValue: 300000,
  preferredValue: 100000,
  costOfEquity: 11,
  costOfDebt: 6.5,
  costOfPreferred: 8.5,
  taxRate: 21,
  freeCashFlow: 85000,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

function waccBand(wacc: number): { label: string; tone: string } {
  if (wacc <= 8) return { label: "Low-cost capital", tone: "text-emerald-600" };
  if (wacc <= 12) return { label: "Moderate capital cost", tone: "text-emerald-600" };
  if (wacc <= 16) return { label: "High capital cost", tone: "text-amber-600" };
  return { label: "Very high capital cost", tone: "text-red-600" };
}

interface WaccResult {
  totalCapital: number;
  equityWeight: number;
  debtWeight: number;
  preferredWeight: number;
  afterTaxCostOfDebt: number;
  equityContribution: number;
  debtContribution: number;
  preferredContribution: number;
  wacc: number;
  impliedEnterpriseValue: number;
  debtToCapitalPct: number;
  band: string;
  bandTone: string;
  valid: boolean;
  errorMsg: string;
}

function computeWacc(i: WaccInputs): WaccResult {
  const invalid =
    i.equityValue < 0 ||
    i.debtValue < 0 ||
    i.preferredValue < 0 ||
    i.costOfEquity < 0 ||
    i.costOfDebt < 0 ||
    i.costOfPreferred < 0 ||
    i.taxRate < 0 ||
    i.taxRate > 100 ||
    i.freeCashFlow < 0 ||
    i.equityValue + i.debtValue + i.preferredValue <= 0;

  const totalCapital = i.equityValue + i.debtValue + i.preferredValue;
  const equityWeight = totalCapital > 0 ? i.equityValue / totalCapital : 0;
  const debtWeight = totalCapital > 0 ? i.debtValue / totalCapital : 0;
  const preferredWeight = totalCapital > 0 ? i.preferredValue / totalCapital : 0;

  const afterTaxCostOfDebt = i.costOfDebt * (1 - i.taxRate / 100);
  const equityContribution = equityWeight * i.costOfEquity;
  const debtContribution = debtWeight * afterTaxCostOfDebt;
  const preferredContribution = preferredWeight * i.costOfPreferred;
  const wacc = equityContribution + debtContribution + preferredContribution;
  const band = waccBand(wacc);

  return {
    totalCapital,
    equityWeight,
    debtWeight,
    preferredWeight,
    afterTaxCostOfDebt,
    equityContribution,
    debtContribution,
    preferredContribution,
    wacc,
    impliedEnterpriseValue: wacc > 0 ? i.freeCashFlow / (wacc / 100) : 0,
    debtToCapitalPct: debtWeight * 100,
    band: band.label,
    bandTone: band.tone,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter non-negative capital amounts, costs and tax, and at least one positive capital value."
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

export default function WeightedAverageCostOfCapitalWaccCalculator() {
  const [equityValue, setEquityValue] = useState(String(DEFAULTS.equityValue));
  const [debtValue, setDebtValue] = useState(String(DEFAULTS.debtValue));
  const [preferredValue, setPreferredValue] = useState(String(DEFAULTS.preferredValue));
  const [costOfEquity, setCostOfEquity] = useState(String(DEFAULTS.costOfEquity));
  const [costOfDebt, setCostOfDebt] = useState(String(DEFAULTS.costOfDebt));
  const [costOfPreferred, setCostOfPreferred] = useState(String(DEFAULTS.costOfPreferred));
  const [taxRate, setTaxRate] = useState(String(DEFAULTS.taxRate));
  const [freeCashFlow, setFreeCashFlow] = useState(String(DEFAULTS.freeCashFlow));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): WaccInputs => ({
    equityValue: parseFloat(equityValue) || 0,
    debtValue: parseFloat(debtValue) || 0,
    preferredValue: parseFloat(preferredValue) || 0,
    costOfEquity: parseFloat(costOfEquity) || 0,
    costOfDebt: parseFloat(costOfDebt) || 0,
    costOfPreferred: parseFloat(costOfPreferred) || 0,
    taxRate: parseFloat(taxRate) || 0,
    freeCashFlow: parseFloat(freeCashFlow) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<WaccInputs>(() => DEFAULTS);
  const [results, setResults] = useState<WaccResult>(() => computeWacc(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeWacc(inputs));
  };

  const reset = () => {
    setEquityValue(String(DEFAULTS.equityValue));
    setDebtValue(String(DEFAULTS.debtValue));
    setPreferredValue(String(DEFAULTS.preferredValue));
    setCostOfEquity(String(DEFAULTS.costOfEquity));
    setCostOfDebt(String(DEFAULTS.costOfDebt));
    setCostOfPreferred(String(DEFAULTS.costOfPreferred));
    setTaxRate(String(DEFAULTS.taxRate));
    setFreeCashFlow(String(DEFAULTS.freeCashFlow));
    setCalcInputs(DEFAULTS);
    setResults(computeWacc(DEFAULTS));
  };

  const faqs = [
    {
      question: "What does the weighted average cost of capital measure?",
      answer:
        "It is the blended rate a company pays for the money that funds its operations — a weighted average of the return equity investors expect, the after-tax interest on debt, and the yield on any preferred shares. Every capital source is weighted by its share of total capital. The result is the minimum return a project must earn to create value rather than destroy it.",
    },
    {
      question: "Why is the cost of debt adjusted for tax?",
      answer:
        "Interest is generally deductible, so each dollar of interest reduces the tax the company owes. A six and a half percent loan with a twenty-one percent tax rate costs about five and a quarter percent after that benefit. Equity distributions receive no comparable deduction, which is a large reason debt is cheaper than equity on an after-tax basis and why the weights must be applied to after-tax costs consistently.",
    },
    {
      question: "How is the cost of equity estimated?",
      answer:
        "Most often with the capital asset pricing model: the risk-free rate plus a beta measuring the stock's volatility relative to the market, multiplied by a market risk premium. Comparable-company betas and adjusted versions are common refinements. The estimate is inherently judgmental, which is why sensitivity analysis — checking how much the result moves when the equity cost changes by a point — matters as much as the point estimate itself.",
    },
    {
      question: "How is WACC used in valuation?",
      answer:
        "It is the discount rate in a discounted cash flow model. Projected free cash flows are discounted back at the WACC to estimate enterprise value, so a higher WACC produces a lower valuation. The calculator derives an implied enterprise value from your free cash flow input to make that relationship concrete: the same cash flow is worth noticeably less at a higher cost of capital.",
    },
  ];


  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Weighted Average Cost of Capital (WACC) Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Weighted Average Cost of Capital (WACC) Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Capital Structure">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="equity-value"
                  label="Market Value of Equity"
                  value={equityValue}
                  onChange={setEquityValue}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Market capitalization of common shares."
                />
                <CompactInput
                  id="debt-value"
                  label="Market Value of Debt"
                  value={debtValue}
                  onChange={setDebtValue}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Total interest-bearing debt at market value."
                />
              </div>
              <div className="mt-3">
                <CompactInput
                  id="preferred-value"
                  label="Preferred Equity"
                  value={preferredValue}
                  onChange={setPreferredValue}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Market value of preferred shares, if any."
                />
              </div>
            </SubSection>

            <SubSection title="Costs of Capital">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="cost-of-equity"
                  label="Cost of Equity"
                  value={costOfEquity}
                  onChange={setCostOfEquity}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  tooltip="Return equity investors require, often from CAPM."
                />
                <CompactInput
                  id="cost-of-debt"
                  label="Pre-Tax Cost of Debt"
                  value={costOfDebt}
                  onChange={setCostOfDebt}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  tooltip="Interest rate on the company borrowing."
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
                  <SubSection title="Preferred, Tax & Cash Flow">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="cost-of-preferred"
                        label="Cost of Preferred"
                        value={costOfPreferred}
                        onChange={setCostOfPreferred}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        tooltip="Dividend yield on preferred stock."
                      />
                      <CompactInput
                        id="tax-rate"
                        label="Marginal Tax Rate"
                        value={taxRate}
                        onChange={setTaxRate}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        tooltip="Corporate rate that shelters interest."
                      />
                    </div>
                    <div className="mt-3">
                      <CompactInput
                        id="free-cash-flow"
                        label="Annual Free Cash Flow"
                        value={freeCashFlow}
                        onChange={setFreeCashFlow}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Used to derive an implied enterprise value at this WACC."
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
                Weighted Average Cost of Capital
              </div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {fmt(results.wacc, 2)}%
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {`Blended after-tax cost across $${fmt(results.totalCapital, 0)} of capital`}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Capital</span>
                <span className="font-extrabold text-foreground">${fmt(results.totalCapital, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">After-Tax Cost of Debt</span>
                <span className="font-extrabold text-foreground">{fmt(results.afterTaxCostOfDebt, 2)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Implied Enterprise Value</span>
                <span className="font-extrabold text-foreground">${fmt(results.impliedEnterpriseValue, 0)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Capital Source</th>
                    <th className="p-2.5 text-right w-[90px]">Weight</th>
                    <th className="p-2.5 text-right w-[110px]">Cost</th>
                    <th className="p-2.5 pr-3 text-right w-[130px]">Contribution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Common equity</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(results.equityWeight * 100, 1)}%</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(calcInputs.costOfEquity, 2)}%</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{fmt(results.equityContribution, 2)}%</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Debt (after tax)</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(results.debtWeight * 100, 1)}%</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(results.afterTaxCostOfDebt, 2)}%</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{fmt(results.debtContribution, 2)}%</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Preferred equity</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(results.preferredWeight * 100, 1)}%</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(calcInputs.costOfPreferred, 2)}%</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{fmt(results.preferredContribution, 2)}%</td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Weighted average (WACC)</td>
                    <td className="p-2.5 text-right text-foreground">100.0%</td>
                    <td className="p-2.5 text-right text-foreground">—</td>
                    <td className="p-2.5 pr-3 text-right text-emerald-600">{fmt(results.wacc, 2)}%</td>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Equity Weight</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.equityWeight * 100, 1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Debt Weight</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.debtWeight * 100, 1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Debt-to-Capital</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.debtToCapitalPct, 1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Tax Shield on Debt</span>
                  <span className="text-base font-bold text-foreground">
                    {fmt(calcInputs.costOfDebt - results.afterTaxCostOfDebt, 2)}%
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Free Cash Flow</span>
                  <span className="text-base font-bold text-foreground">${fmt(calcInputs.freeCashFlow, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Capital Cost Band</span>
                  <span className={`text-base font-bold ${results.bandTone}`}>{results.band}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Weighted Average Cost of Capital (WACC) Calculator?</h2>
            <p>
              A WACC calculator blends the costs of every source of business funding into a single rate. Common equity
              carries an expected return, debt carries an interest rate, and preferred shares carry a dividend yield; each
              is weighted by its share of total capital. The result is the average rate the company must earn on its
              investments to satisfy everyone who financed it.
            </p>
            <p>
              That single number does a great deal of work. It is the hurdle rate for new projects, the discount rate in
              most valuation models, and the benchmark for judging whether returns on capital are creating or destroying
              value. Because it sits at the center of so many decisions, small changes in the inputs can have outsized
              consequences.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Each source of capital is converted to a weight by dividing its market value by total capital. The cost of
              equity is used as stated, the cost of debt is reduced by the tax shield — multiplying it by one minus the
              marginal tax rate — and the cost of preferred is taken at its yield. Each cost is multiplied by its weight,
              and the products are summed to produce the weighted average.
            </p>
            <p>
              The after-tax adjustment is what makes debt attractive and equity expensive. Interest is deductible, so
              the government absorbs part of the cost; dividends and capital gains are not, so equity investors bear the
              full cost themselves. That asymmetry is why the mix of debt and equity a company chooses changes its cost of
              capital, and why the weightings can matter as much as the individual rates.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports the blended WACC. The three-stat bar shows total capital, the after-tax cost of
              debt and an implied enterprise value derived from your free cash flow input, while the table breaks the
              calculation into each source with its weight, cost and contribution to the final rate.
            </p>
            <p>
              Read the table as a sensitivity map. If the equity contribution dominates, the estimate rests mostly on the
              cost-of-equity assumption, which is the hardest input to pin down; try a range rather than a single number.
              The implied enterprise value makes the stakes clear, since dividing the same cash flow by a higher WACC
              produces a materially lower valuation.
            </p>
            <p>
              Finally, remember that WACC is a snapshot of a moving target. Market values shift daily, rates change with
              credit conditions, and the tax rate depends on jurisdiction and profitability. Recalculate periodically and
              use the result as a range for decision-making rather than a precise cost to the basis point.
            </p>
            <p>
              A practical habit is to build the calculation with market values rather than book values, since the cost of
              capital is about what investors require today, not what was recorded when the capital was raised. Book
              equity in particular can look very different from market capitalization, and using it can distort the
              weights badly. Once the weighted cost is set, compare it with the return on the projects actually being
              funded: any initiative expected to earn less than the WACC reduces the value of the company even if it looks
              profitable in accounting terms.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/weighted-average-cost-of-capital-wacc-calculator" />
          <PopularCalculators exclude="/calculator/weighted-average-cost-of-capital-wacc-calculator" />
        </div>
      </div>
    </>
  );
}
