"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface GoodDebtInputs {
  balance: number;
  apr: number;
  expectedReturn: number;
  deductibleShare: number;
  marginalTaxRate: number;
  years: number;
}

const DEFAULTS: GoodDebtInputs = {
  balance: 12000,
  apr: 5.5,
  expectedReturn: 7,
  deductibleShare: 0,
  marginalTaxRate: 24,
  years: 10,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

function verdictBand(spread: number): { label: string; tone: string } {
  if (spread >= 2) return { label: "Good debt", tone: "text-emerald-600" };
  if (spread >= 0) return { label: "Neutral", tone: "text-amber-600" };
  return { label: "Bad debt", tone: "text-red-600" };
}

interface GoodDebtResult {
  afterTaxApr: number;
  taxBenefit: number;
  spread: number;
  annualInterest: number;
  totalInterest: number;
  valueCreated: number;
  netBenefit: number;
  valid: boolean;
  errorMsg: string;
}

function computeGoodDebt(i: GoodDebtInputs): GoodDebtResult {
  const invalid =
    i.balance <= 0 ||
    i.apr < 0 ||
    i.expectedReturn < 0 ||
    i.deductibleShare < 0 ||
    i.deductibleShare > 100 ||
    i.marginalTaxRate < 0 ||
    i.marginalTaxRate > 100 ||
    i.years <= 0;

  // Tax benefit = deductible share x marginal rate; it reduces the effective cost.
  const taxBenefit = i.apr * (i.deductibleShare / 100) * (i.marginalTaxRate / 100);
  const afterTaxApr = Math.max(0, i.apr - taxBenefit);
  const spread = i.expectedReturn - afterTaxApr;
  const annualInterest = i.balance * (afterTaxApr / 100);
  const totalInterest = annualInterest * i.years;
  const valueCreated = i.balance * (i.expectedReturn / 100) * i.years;

  return {
    afterTaxApr,
    taxBenefit,
    spread,
    annualInterest,
    totalInterest,
    valueCreated,
    netBenefit: valueCreated - totalInterest,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a balance and horizon above zero, non-negative rates, and a deductible share between 0% and 100%."
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

export default function GoodDebtVsBadDebtCalculator() {
  const [balance, setBalance] = useState(String(DEFAULTS.balance));
  const [apr, setApr] = useState(String(DEFAULTS.apr));
  const [expectedReturn, setExpectedReturn] = useState(String(DEFAULTS.expectedReturn));
  const [deductibleShare, setDeductibleShare] = useState(String(DEFAULTS.deductibleShare));
  const [marginalTaxRate, setMarginalTaxRate] = useState(String(DEFAULTS.marginalTaxRate));
  const [years, setYears] = useState(String(DEFAULTS.years));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): GoodDebtInputs => ({
    balance: parseFloat(balance) || 0,
    apr: parseFloat(apr) || 0,
    expectedReturn: parseFloat(expectedReturn) || 0,
    deductibleShare: parseFloat(deductibleShare) || 0,
    marginalTaxRate: parseFloat(marginalTaxRate) || 0,
    years: parseFloat(years) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<GoodDebtInputs>(() => DEFAULTS);
  const [results, setResults] = useState<GoodDebtResult>(() => computeGoodDebt(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeGoodDebt(inputs));
  };

  const reset = () => {
    setBalance(String(DEFAULTS.balance));
    setApr(String(DEFAULTS.apr));
    setExpectedReturn(String(DEFAULTS.expectedReturn));
    setDeductibleShare(String(DEFAULTS.deductibleShare));
    setMarginalTaxRate(String(DEFAULTS.marginalTaxRate));
    setYears(String(DEFAULTS.years));
    setCalcInputs(DEFAULTS);
    setResults(computeGoodDebt(DEFAULTS));
  };

  const faqs = [
    {
      question: "What makes debt good or bad?",
      answer:
        "The conventional labels are about what the money buys and what it costs. Good debt is low-cost, long-term and tied to something that holds or grows in value or income — a mortgage, a student loan that raises earnings, a business loan that funds growth. Bad debt is high-cost, short-term and funds consumption or depreciating assets, most obviously credit card balances on discretionary spending. The labels are useful shorthand, but the real test is arithmetic: does the return the borrowing enables exceed the after-tax cost of the borrowing?",
    },
    {
      question: "How should tax deductibility be treated?",
      answer:
        "Interest that is tax-deductible — most commonly mortgage interest within the deduction limits, some student loan interest and business borrowing — costs less after tax than the headline rate suggests. If 100% of the interest is deductible at a 24% marginal rate, a 5.5% loan costs 4.18% after tax. The calculator takes a deductible share and a marginal rate and reduces the effective rate accordingly. Keep the share realistic: not all mortgage interest is deductible, and the standard deduction means many households get no benefit at all.",
    },
    {
      question: "What is a good spread between return and borrowing cost?",
      answer:
        "As a rule of thumb, a positive spread of two percentage points or more is comfortably good, a spread between zero and two points is neutral and depends on risk and liquidity, and a negative spread is bad debt — the borrowing destroys value every year it is carried. The spread model is deliberately simple: it assumes the borrowed money earns the expected return every year and the debt is carried, not amortized, which is a fair approximation for a mortgage-sized balance over a long horizon but not for a car loan paid off in five years.",
    },
    {
      question: "Does leverage change the answer?",
      answer:
        "It can, in both directions. Borrowing to invest amplifies returns when the investment outperforms the cost of the debt and amplifies losses when it does not, so the spread test must be paired with a tolerance for volatility: a portfolio that returns 7% on average with 15% annual swings can still produce a negative few years while the interest bill arrives every month without fail. Leveraged investing is only appropriate when the cash flow to service the debt is secure independently of the investment itself.",
    },
    {
      question: "Should I pay off good debt early?",
      answer:
        "Not necessarily. If the after-tax cost of the debt is well below what the money could earn elsewhere, prepaying voluntarily gives up the spread. Paying down a 3% mortgage while holding cash earning 4% in a money market account is value-destroying, even though a paid-off house feels safer. The calculation changes if the comparison is against risky returns: repaying debt is a guaranteed return equal to the after-tax rate, which is why risk-averse households often prefer it even when the arithmetic favours investing.",
    },
  ];

  const band = verdictBand(results.spread);

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Good Debt vs Bad Debt Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Good Debt vs Bad Debt Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Borrowing & Return">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="balance"
                  label="Debt Balance"
                  value={balance}
                  onChange={setBalance}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Balance being evaluated."
                />
                <CompactInput
                  id="apr"
                  label="Debt APR"
                  value={apr}
                  onChange={setApr}
                  onEnter={runCalculate}
                  suffix="%"
                  step="0.01"
                  tooltip="Interest rate on the debt."
                />
              </div>
              <div className="mt-3">
                <CompactInput
                  id="expected-return"
                  label="Expected Return on Borrowed Funds"
                  value={expectedReturn}
                  onChange={setExpectedReturn}
                  onEnter={runCalculate}
                  suffix="%"
                  step="0.1"
                  tooltip="What the borrowed money is expected to earn or the asset is expected to appreciate."
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
                  <SubSection title="Tax & Horizon">
                    <div className="grid grid-cols-3 gap-3">
                      <CompactInput
                        id="deductible-share"
                        label="Interest Deductible"
                        value={deductibleShare}
                        onChange={setDeductibleShare}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        tooltip="Share of the interest that is tax-deductible."
                      />
                      <CompactInput
                        id="marginal-rate"
                        label="Marginal Tax Rate"
                        value={marginalTaxRate}
                        onChange={setMarginalTaxRate}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        tooltip="Tax rate that applies to the deduction."
                      />
                      <CompactInput
                        id="years"
                        label="Years to Hold"
                        value={years}
                        onChange={setYears}
                        onEnter={runCalculate}
                        suffix="yrs"
                        min="1"
                        tooltip="Horizon over which the comparison is made."
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
                Net Benefit Over {fmt(calcInputs.years, 0)} Years
              </div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                ${fmt(results.netBenefit, 0)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                Verdict: <span className={`font-bold ${band.tone}`}>{band.label}</span> — spread of {fmt(results.spread, 2)} pts
                per year
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  After-Tax Cost
                </span>
                <span className="font-extrabold text-foreground">{fmt(results.afterTaxApr, 2)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Expected Return
                </span>
                <span className="font-extrabold text-foreground">{fmt(calcInputs.expectedReturn, 2)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Annual Interest
                </span>
                <span className="font-extrabold text-foreground">${fmt(results.annualInterest, 0)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Component</th>
                    <th className="p-2.5 text-right w-[130px]">Over Horizon</th>
                    <th className="p-2.5 pr-3 text-right w-[110px]">Per Year</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">After-tax interest cost</td>
                    <td className="p-2.5 text-right text-foreground">−${fmt(results.totalInterest, 0)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">${fmt(results.annualInterest, 0)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Value created by borrowed funds</td>
                    <td className="p-2.5 text-right text-foreground">+${fmt(results.valueCreated, 0)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">
                      ${fmt(results.valueCreated / Math.max(1, calcInputs.years), 0)}
                    </td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Net benefit</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.netBenefit, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-muted-foreground">
                      ${fmt(results.netBenefit / Math.max(1, calcInputs.years), 0)}
                    </td>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Debt APR</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.apr, 2)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    After-Tax APR
                  </span>
                  <span className="text-base font-bold text-foreground">{fmt(results.afterTaxApr, 2)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Tax Benefit</span>
                  <span className="text-base font-bold text-primary">{fmt(results.taxBenefit, 2)} pts</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Break-Even Return
                  </span>
                  <span className="text-base font-bold text-foreground">{fmt(results.afterTaxApr, 2)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Balance</span>
                  <span className="text-base font-bold text-foreground">${fmt(calcInputs.balance, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Verdict</span>
                  <span className={`text-base font-bold ${band.tone}`}>{band.label}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Good Debt vs Bad Debt Calculator?</h2>
            <p>
              A good debt vs bad debt calculator replaces the folk labels with arithmetic. The idea that a mortgage is
              good debt and a credit card balance is bad debt is useful shorthand, but the labels confuse the product
              with the price. What actually separates them is a single comparison: the after-tax cost of the borrowing
              against the return the borrowed money produces. When the return exceeds the cost, the debt creates value
              each year it is carried; when it does not, it destroys value, and the label is irrelevant.
            </p>
            <p>
              Framing debt this way also exposes the cases the labels get wrong. A low-rate mortgage financing an
              appreciating home can still be bad debt for a household that cannot carry it through a downturn, while a
              student loan at a modest rate becomes good debt only if the degree raises earnings by more than the
              interest. High-rate consumer debt is almost always bad in the arithmetic sense, because few safe
              investments clear a 20%-plus hurdle after tax.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The calculator reduces the debt&apos;s rate for any tax benefit: the deductible share of the interest
              multiplied by your marginal tax rate gives the percentage-point subsidy, which is subtracted from the
              headline APR. That produces the after-tax cost of the debt. It then compares it with the expected return on
              the borrowed funds — the investment yield, or the appreciation rate of the asset the borrowing financed —
              to produce the annual spread.
            </p>
            <p>
              Over the horizon you set, the calculator totals the after-tax interest paid and the value created by the
              borrowed money on a straight-line basis, and reports the difference as the net benefit. The spread drives
              the verdict: two percentage points or more is good debt, between zero and two is neutral, and a negative
              spread is bad debt — borrowing that costs more than it earns every year.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports the net benefit over the horizon with the verdict and the annual spread. The
              three-stat bar shows the after-tax cost of the debt, the expected return and the annual interest bill, and
              the breakdown table separates the two flows — interest paid and value created — so the net figure can be
              audited line by line. Summary Statistics adds the tax benefit in percentage points and the break-even
              return: the rate the borrowed money must earn for the debt to be value-neutral.
            </p>
            <p>
              Treat the model as a first-order screen, not a guarantee. It assumes the borrowed money earns its expected
              return every year and that the debt is carried rather than amortized, which fits a long-horizon mortgage
              comparison better than a five-year car loan. Risk cuts both ways under leverage: volatile investments can
              lose money for years while the interest arrives monthly without fail, so test the spread against a
              worst-case return as well as an average one. If the debt only works at optimistic returns, it is not good
              debt — it is a bet. Review the spread whenever rates move at renewal, because a quarter-point change in
              either direction can flip the verdict on a marginal balance.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/good-debt-vs-bad-debt-calculator" />
          <PopularCalculators exclude="/calculator/good-debt-vs-bad-debt-calculator" />
        </div>
      </div>
    </>
  );
}
