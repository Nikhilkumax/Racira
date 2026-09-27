"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface WaccInputs {
  equity: number;
  debt: number;
  costOfEquity: number;
  costOfDebt: number;
  taxRate: number;
  preferred: number;
  costOfPreferred: number;
  riskFree: number;
  beta: number;
  equityPremium: number;
}

const DEFAULTS: WaccInputs = {
  equity: 300000000,
  debt: 150000000,
  costOfEquity: 11,
  costOfDebt: 6,
  taxRate: 21,
  preferred: 20000000,
  costOfPreferred: 8,
  riskFree: 4,
  beta: 1.2,
  equityPremium: 5.5,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "—";

const money2 = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";

interface ComponentRow {
  component: string;
  value: number;
  weight: number;
  cost: number;
  afterTaxCost: number;
  contribution: number;
  note: string;
}

interface WaccResult {
  valid: boolean;
  errorMsg: string;
  totalCapital: number;
  equityWeight: number;
  debtWeight: number;
  preferredWeight: number;
  afterTaxCostDebt: number;
  wacc: number;
  capmEquityCost: number;
  capitalCharge: number;
  equityCharge: number;
  debtCharge: number;
  leveredBeta: number;
  rows: ComponentRow[];
  summary: { label: string; value: string; tone?: string }[];
}

function compute(i: WaccInputs): WaccResult {
  const equity = Math.max(0, i.equity);
  const debt = Math.max(0, i.debt);
  const preferred = Math.max(0, i.preferred);
  const totalCapital = Math.max(0.01, equity + debt + preferred);
  const taxRate = Math.max(0, Math.min(60, i.taxRate)) / 100;

  const equityWeight = equity / totalCapital;
  const debtWeight = debt / totalCapital;
  const preferredWeight = preferred / totalCapital;
  const afterTaxCostDebt = i.costOfDebt * (1 - taxRate);

  const wacc = equityWeight * i.costOfEquity + debtWeight * afterTaxCostDebt + preferredWeight * i.costOfPreferred;
  const capmEquityCost = i.riskFree + i.beta * i.equityPremium;
  const capitalCharge = (wacc / 100) * totalCapital;
  const leveredBeta = i.beta * (1 + (1 - taxRate) * (debt / Math.max(equity, 1)));

  const rows: ComponentRow[] = [
    {
      component: "Equity",
      value: equity,
      weight: equityWeight,
      cost: i.costOfEquity,
      afterTaxCost: i.costOfEquity,
      contribution: equityWeight * i.costOfEquity,
      note: "Common shareholders' required return; the most expensive component because it is last in line.",
    },
    {
      component: "Debt",
      value: debt,
      weight: debtWeight,
      cost: i.costOfDebt,
      afterTaxCost: afterTaxCostDebt,
      contribution: debtWeight * afterTaxCostDebt,
      note: "Interest is tax-deductible, so the effective cost is the coupon reduced by the tax shield.",
    },
    {
      component: "Preferred stock",
      value: preferred,
      weight: preferredWeight,
      cost: i.costOfPreferred,
      afterTaxCost: i.costOfPreferred,
      contribution: preferredWeight * i.costOfPreferred,
      note: "Dividends are paid from after-tax profit, so there is no tax shield on this component.",
    },
  ];

  const valid =
    i.equity >= 0 &&
    i.debt >= 0 &&
    i.preferred >= 0 &&
    i.equity + i.debt + i.preferred > 0 &&
    i.costOfEquity >= 0 &&
    i.costOfEquity <= 40 &&
    i.costOfDebt >= 0 &&
    i.costOfDebt <= 30 &&
    i.taxRate >= 0 &&
    i.taxRate <= 60 &&
    i.costOfPreferred >= 0 &&
    i.costOfPreferred <= 40 &&
    i.riskFree >= 0 &&
    i.beta >= 0 &&
    i.equityPremium >= 0;
  const errorMsg = valid
    ? ""
    : "Enter non-negative equity, debt and preferred values with a positive total, costs within their ranges, and non-negative CAPM inputs.";

  return {
    valid,
    errorMsg,
    totalCapital,
    equityWeight: equityWeight * 100,
    debtWeight: debtWeight * 100,
    preferredWeight: preferredWeight * 100,
    afterTaxCostDebt,
    wacc,
    capmEquityCost,
    capitalCharge,
    equityCharge: (i.costOfEquity / 100) * equity,
    debtCharge: ((afterTaxCostDebt / 100) * debt),
    leveredBeta,
    rows,
    summary: [
      { label: "Equity Value", value: money(equity) },
      { label: "Debt Value", value: money(debt) },
      { label: "Preferred Value", value: money(preferred) },
      { label: "Total Capital", value: money(totalCapital) },
      { label: "Equity Weight", value: fmt(equityWeight * 100, 2) + "%" },
      { label: "Debt Weight", value: fmt(debtWeight * 100, 2) + "%" },
      { label: "Preferred Weight", value: fmt(preferredWeight * 100, 2) + "%" },
      { label: "Cost of Equity", value: fmt(i.costOfEquity, 2) + "%" },
      { label: "Cost of Debt", value: fmt(i.costOfDebt, 2) + "%" },
      { label: "After-Tax Cost of Debt", value: fmt(afterTaxCostDebt, 2) + "%" },
      { label: "WACC", value: fmt(wacc, 2) + "%", tone: "text-primary" },
      { label: "CAPM Cost of Equity", value: fmt(capmEquityCost, 2) + "%" },
      { label: "Annual Capital Charge", value: money(capitalCharge), tone: "text-destructive" },
      { label: "Equity Charge", value: money((i.costOfEquity / 100) * equity) },
      { label: "Levered Beta", value: fmt(leveredBeta, 2) },
      { label: "Debt-to-Equity", value: fmt(debt / Math.max(equity, 1), 3) + "x" },
    ],
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
  type?: string;
  min?: string;
  max?: string;
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
  type = "number",
  min,
  max,
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
  </div>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">{title}</div>
    {children}
  </div>
);

export default function WeightedAverageCostOfCapitalCalculator() {
  const [equity, setEquity] = useState(String(DEFAULTS.equity));
  const [debt, setDebt] = useState(String(DEFAULTS.debt));
  const [costOfEquity, setCostOfEquity] = useState(String(DEFAULTS.costOfEquity));
  const [costOfDebt, setCostOfDebt] = useState(String(DEFAULTS.costOfDebt));
  const [taxRate, setTaxRate] = useState(String(DEFAULTS.taxRate));
  const [preferred, setPreferred] = useState(String(DEFAULTS.preferred));
  const [costOfPreferred, setCostOfPreferred] = useState(String(DEFAULTS.costOfPreferred));
  const [riskFree, setRiskFree] = useState(String(DEFAULTS.riskFree));
  const [beta, setBeta] = useState(String(DEFAULTS.beta));
  const [equityPremium, setEquityPremium] = useState(String(DEFAULTS.equityPremium));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): WaccInputs => ({
    equity: parseFloat(equity) || 0,
    debt: parseFloat(debt) || 0,
    costOfEquity: parseFloat(costOfEquity) || 0,
    costOfDebt: parseFloat(costOfDebt) || 0,
    taxRate: parseFloat(taxRate) || 0,
    preferred: parseFloat(preferred) || 0,
    costOfPreferred: parseFloat(costOfPreferred) || 0,
    riskFree: parseFloat(riskFree) || 0,
    beta: parseFloat(beta) || 0,
    equityPremium: parseFloat(equityPremium) || 0,
  });

  const [results, setResults] = useState<WaccResult>(() => compute(DEFAULTS));

  const runCalculate = () => setResults(compute(getInputs()));

  const reset = () => {
    setEquity(String(DEFAULTS.equity));
    setDebt(String(DEFAULTS.debt));
    setCostOfEquity(String(DEFAULTS.costOfEquity));
    setCostOfDebt(String(DEFAULTS.costOfDebt));
    setTaxRate(String(DEFAULTS.taxRate));
    setPreferred(String(DEFAULTS.preferred));
    setCostOfPreferred(String(DEFAULTS.costOfPreferred));
    setRiskFree(String(DEFAULTS.riskFree));
    setBeta(String(DEFAULTS.beta));
    setEquityPremium(String(DEFAULTS.equityPremium));
    setResults(compute(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is the weighted average cost of capital?",
      answer:
        "WACC is the blended rate a company pays for the capital it uses, weighted by how much of each type it has. Equity is the most expensive component because shareholders bear the residual risk, debt is cheaper because interest is tax-deductible, and preferred stock sits between the two. The weighted average is the minimum return the business must earn on its investments to be worth operating as it is.",
    },
    {
      question: "Why is the cost of debt adjusted for tax?",
      answer:
        "Because interest payments are deductible from taxable profit, the government effectively subsidises part of the interest bill. A 6% coupon with a 21% tax rate has an after-tax cost of 4.74%, since every dollar of interest reduces the tax owed by 21 cents. Preferred dividends and common dividends receive no such treatment, which is why only the debt component is reduced by one minus the tax rate.",
    },
    {
      question: "How is the cost of equity estimated?",
      answer:
        "The standard method is the capital asset pricing model: the risk-free rate plus beta times the equity risk premium. A company with a beta of 1.2, a 4% risk-free rate and a 5.5% equity premium has a required return of 10.6%. The CAPM figure and the cost of equity you enter are both shown, so the two can be compared — if they diverge materially, one of the inputs deserves a second look.",
    },
    {
      question: "Should I use book values or market values for the weights?",
      answer:
        "Market values, whenever they are available, because WACC measures the cost of capital as investors currently price it. Book equity reflects historical accounting contributions rather than what shareholders could sell their stake for today. For private companies without a market price, book values are often the only practical option, and the resulting WACC should be treated as an approximation.",
    },
    {
      question: "What does the capital charge mean?",
      answer:
        "It converts WACC into dollars: the annual cost of all the capital employed. A company with $470 million of capital and an 8.87% WACC must generate about $41.7 million of operating profit after tax simply to cover its capital costs. Anything less destroys value, even if the income statement shows an accounting profit — which is the insight behind economic profit and EVA measures.",
    },
    {
      question: "Why is the levered beta higher than the beta I entered?",
      answer:
        "Because adding debt increases the risk borne by equity holders: interest must be paid before dividends, so the same operating volatility translates into larger swings in the return on equity. The Hamada relationship shown here re-levers the beta you enter by one plus the after-tax debt-to-equity ratio. This is also why a company's WACC can fall with modest leverage — cheaper debt replaces expensive equity — before rising again as risk becomes material.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Weighted Average Cost of Capital Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Weighted Average Cost of Capital Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Capital Structure">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="equity"
                  label="Equity Value"
                  value={equity}
                  onChange={setEquity}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  step="1000000"
                  tooltip="Market value of common equity; book value if no market price exists."
                />
                <CompactInput
                  id="debt"
                  label="Debt Value"
                  value={debt}
                  onChange={setDebt}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  step="1000000"
                  tooltip="Interest-bearing borrowings at market value where possible."
                />
                <CompactInput
                  id="cost-of-equity"
                  label="Cost of Equity"
                  value={costOfEquity}
                  onChange={setCostOfEquity}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  max="40"
                  step="0.25"
                  tooltip="Required return on equity; compare it with the CAPM figure in the results."
                />
                <CompactInput
                  id="cost-of-debt"
                  label="Cost of Debt"
                  value={costOfDebt}
                  onChange={setCostOfDebt}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  max="30"
                  step="0.25"
                  tooltip="Pre-tax borrowing rate, reduced by the tax shield in the WACC calculation."
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
                  <SubSection title="Tax & Preferred Stock">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="tax-rate"
                        label="Tax Rate"
                        value={taxRate}
                        onChange={setTaxRate}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        max="60"
                        step="0.5"
                        tooltip="Marginal corporate rate used for the debt tax shield."
                      />
                      <CompactInput
                        id="preferred"
                        label="Preferred Stock"
                        value={preferred}
                        onChange={setPreferred}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        step="1000000"
                        tooltip="Value of preferred shares; dividends are paid after tax."
                      />
                      <CompactInput
                        id="cost-of-preferred"
                        label="Cost of Preferred"
                        value={costOfPreferred}
                        onChange={setCostOfPreferred}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        max="40"
                        step="0.25"
                        tooltip="Preferred dividend yield, with no tax shield applied."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="CAPM Cross-Check">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="risk-free"
                        label="Risk-Free Rate"
                        value={riskFree}
                        onChange={setRiskFree}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        max="20"
                        step="0.1"
                        tooltip="Yield on long-term government debt."
                      />
                      <CompactInput
                        id="beta"
                        label="Beta"
                        value={beta}
                        onChange={setBeta}
                        onEnter={runCalculate}
                        min="0"
                        max="4"
                        step="0.05"
                        tooltip="Equity beta used for the CAPM cost of equity and the levered beta figure."
                      />
                      <CompactInput
                        id="equity-premium"
                        label="Equity Risk Premium"
                        value={equityPremium}
                        onChange={setEquityPremium}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        max="15"
                        step="0.1"
                        tooltip="Expected excess return of the market over the risk-free rate; 4–6% is typical."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Method Notes">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      WACC weights each component by its share of total capital. Debt is costed after tax because interest is
                      deductible; preferred and common equity are not. The capital charge converts the percentage into the
                      annual dollars of profit required to cover the cost of capital, and the levered beta re-levers the
                      market beta for the company&apos;s debt-to-equity ratio.
                    </p>
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Weighted Average Cost of Capital</div>
              <div className="text-4xl font-extrabold mb-1 tracking-tight text-foreground">{fmt(results.wacc, 2)}%</div>
              <div className="text-sm text-muted-foreground font-medium">
                minimum return on {money(results.totalCapital)} of capital · {money(results.capitalCharge)} a year in charges
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Equity Weight</span>
                <span className="font-extrabold text-foreground">{fmt(results.equityWeight, 1)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">After-Tax Debt</span>
                <span className="font-extrabold text-foreground">{fmt(results.afterTaxCostDebt, 2)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">CAPM Equity Cost</span>
                <span className="font-extrabold text-primary">{fmt(results.capmEquityCost, 2)}%</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Component</th>
                    <th className="p-2.5 text-right w-[110px]">Value</th>
                    <th className="p-2.5 text-right w-[80px]">Weight</th>
                    <th className="p-2.5 text-right w-[90px]">Cost</th>
                    <th className="p-2.5 pr-3 text-right w-[105px]">Contribution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.rows.map((row) => (
                    <tr key={row.component} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3">
                        <div className="font-semibold text-foreground">{row.component}</div>
                        <div className="text-[11px] text-muted-foreground leading-snug">{row.note}</div>
                      </td>
                      <td className="p-2.5 text-right text-foreground">{money(row.value)}</td>
                      <td className="p-2.5 text-right text-foreground">{fmt(row.weight * 100, 2)}%</td>
                      <td className="p-2.5 text-right text-foreground">{fmt(row.afterTaxCost, 2)}%</td>
                      <td className="p-2.5 pr-3 text-right text-primary">{fmt(row.contribution, 2)} pp</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">WACC</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.totalCapital)}</td>
                    <td className="p-2.5 text-right text-foreground">100%</td>
                    <td className="p-2.5 text-right text-foreground">—</td>
                    <td className="p-2.5 pr-3 text-right text-primary">{fmt(results.wacc, 2)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                {results.summary.map((item) => (
                  <div key={item.label} className="flex flex-col">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">{item.label}</span>
                    <span className={`text-base font-bold ${item.tone || "text-foreground"}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is the Weighted Average Cost of Capital?</h2>
            <p>
              The weighted average cost of capital is the blended rate a company pays for the money it uses, whether that
              money came from shareholders or lenders. Each source of capital has its own required return — shareholders
              demand more because they bear the residual risk, lenders demand less because they are paid first and hold
              collateral — and WACC weights those requirements by how much of each the company actually uses.
            </p>
            <p>
              WACC matters because it is the hurdle every investment must clear. A project earning 9% when the company&apos;s
              WACC is 8.9% creates almost no value; the same project earning 14% creates a great deal. Without a WACC figure,
              &quot;profitable&quot; is a meaningless word — a company can report accounting profits while destroying value if
              it fails to cover the cost of the capital it employs.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The formula multiplies each component&apos;s cost by its share of total capital and adds the results. Equity
              cost is used as-is, because dividends are not deductible. Debt cost is reduced by one minus the tax rate, because
              interest payments are deducted from taxable profit, so the government absorbs part of the bill: a 6% coupon with
              a 21% tax rate costs 4.74% after tax. Preferred stock sits in between — it is a preferred claim but its dividends
              receive no tax shield.
            </p>
            <p>
              In the default example, $300 million of equity at 11%, $150 million of debt at 6% pre-tax and $20 million of
              preferred at 8% give weights of 63.8%, 31.9% and 4.3%. Equity contributes 7.02 points, debt 1.51 points after
              tax and preferred 0.34 points, producing a WACC of about 8.87%. The annual capital charge — WACC multiplied by
              total capital — is roughly $41.7 million, the operating profit needed simply to cover the cost of the money.
            </p>
            <p>
              The cross-check panel estimates the cost of equity independently using CAPM: risk-free rate plus beta times the
              equity risk premium. Comparing that figure with the cost of equity you entered is a useful sanity check, because
              a large gap usually means one of the inputs — beta, the premium, or the company&apos;s cost of equity — is out
              of line with the others.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the WACC with the dollar value of the annual capital charge. The three statistics beside
              it give the equity weight, the after-tax cost of debt and the CAPM equity estimate. The table breaks the
              calculation into components, showing each one&apos;s value, weight, cost and contribution to the final rate —
              which makes it obvious which component is driving the result.
            </p>
            <p>
              Summary Statistics adds the capital mix, the debt-to-equity ratio, the levered beta and the split of the capital
              charge between equity and debt. Two experiments are worth running. First, increase debt and watch WACC fall
              initially, as cheaper debt replaces expensive equity, before risk considerations push the equity cost up again.
              Second, change the tax rate and watch only the debt component move, which demonstrates exactly how much of the
              debt subsidy comes from the tax code.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/weighted-average-cost-of-capital-calculator" />
          <PopularCalculators exclude="/calculator/weighted-average-cost-of-capital-calculator" />
        </div>
      </div>
    </>
  );
}
