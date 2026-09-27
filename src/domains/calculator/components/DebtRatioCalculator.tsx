"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface DebtRatioInputs {
  totalDebt: number;
  totalAssets: number;
  monthlyIncome: number;
  monthlyPayments: number;
}

const DEFAULTS: DebtRatioInputs = {
  totalDebt: 185000,
  totalAssets: 420000,
  monthlyIncome: 6500,
  monthlyPayments: 1900,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

function leverageBand(ratio: number): { label: string; tone: string } {
  if (ratio <= 40) return { label: "Conservative", tone: "text-emerald-600" };
  if (ratio <= 60) return { label: "Moderate", tone: "text-amber-600" };
  return { label: "High leverage", tone: "text-red-600" };
}

interface DebtRatioResult {
  debtRatio: number;
  equity: number;
  equityRatio: number;
  dti: number;
  debtPerDollar: number;
  annualDebtService: number;
  debtShare: number;
  equityShare: number;
  valid: boolean;
  errorMsg: string;
}

function computeDebtRatio(i: DebtRatioInputs): DebtRatioResult {
  const invalid =
    i.totalDebt < 0 || i.totalAssets <= 0 || i.monthlyIncome < 0 || i.monthlyPayments < 0;

  const debtRatio = i.totalAssets > 0 ? (i.totalDebt / i.totalAssets) * 100 : 0;
  const equity = i.totalAssets - i.totalDebt;

  return {
    debtRatio,
    equity,
    equityRatio: i.totalAssets > 0 ? (equity / i.totalAssets) * 100 : 0,
    dti: i.monthlyIncome > 0 ? (i.monthlyPayments / i.monthlyIncome) * 100 : 0,
    debtPerDollar: i.totalAssets > 0 ? i.totalDebt / i.totalAssets : 0,
    annualDebtService: i.monthlyPayments * 12,
    debtShare: i.totalAssets > 0 ? (i.totalDebt / i.totalAssets) * 100 : 0,
    equityShare: i.totalAssets > 0 ? (equity / i.totalAssets) * 100 : 0,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter non-negative debt, total assets above zero, and non-negative income and payments."
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

export default function DebtRatioCalculator() {
  const [totalDebt, setTotalDebt] = useState(String(DEFAULTS.totalDebt));
  const [totalAssets, setTotalAssets] = useState(String(DEFAULTS.totalAssets));
  const [monthlyIncome, setMonthlyIncome] = useState(String(DEFAULTS.monthlyIncome));
  const [monthlyPayments, setMonthlyPayments] = useState(String(DEFAULTS.monthlyPayments));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): DebtRatioInputs => ({
    totalDebt: parseFloat(totalDebt) || 0,
    totalAssets: parseFloat(totalAssets) || 0,
    monthlyIncome: parseFloat(monthlyIncome) || 0,
    monthlyPayments: parseFloat(monthlyPayments) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<DebtRatioInputs>(() => DEFAULTS);
  const [results, setResults] = useState<DebtRatioResult>(() => computeDebtRatio(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeDebtRatio(inputs));
  };

  const reset = () => {
    setTotalDebt(String(DEFAULTS.totalDebt));
    setTotalAssets(String(DEFAULTS.totalAssets));
    setMonthlyIncome(String(DEFAULTS.monthlyIncome));
    setMonthlyPayments(String(DEFAULTS.monthlyPayments));
    setCalcInputs(DEFAULTS);
    setResults(computeDebtRatio(DEFAULTS));
  };

  const band = leverageBand(results.debtRatio);

  const faqs = [
    {
      question: "What is a debt ratio?",
      answer:
        "A debt ratio compares what you owe with what you own: total debt divided by total assets, expressed as a percentage. A household with $185,000 of debt — mortgage, car loan, student loans, cards — against $420,000 of assets has a debt ratio of 44%, meaning 44 cents of every dollar of assets is financed by borrowing. It is a balance-sheet measure, not a payment measure, and it belongs alongside debt-to-income when judging overall financial health.",
    },
    {
      question: "What is a healthy debt ratio?",
      answer:
        "There is no official threshold, but the same bands used in business analysis are a useful guide: below 40% is conservative, 40% to 60% is moderate leverage, and above 60% is high. The composition matters as much as the number: a mortgage secured against an appreciating property is different from credit card debt at 24% APR, even when the two produce the same ratio. Track the trend over time — a ratio that rises because of asset purchases is healthier than one that rises because of consumption.",
    },
    {
      question: "How is debt ratio different from debt-to-income?",
      answer:
        "Debt ratio measures the stock of debt against the stock of assets — a snapshot of the balance sheet. Debt-to-income measures the monthly flow of payments against monthly income — a measure of affordability. A household can have a high debt ratio but a low DTI if the debt is a long-term, low-payment mortgage, and a low debt ratio with a punishing DTI if it carries small but expensive balances. Use both together: the ratio shows capacity, the DTI shows comfort.",
    },
    {
      question: "Should I include my mortgage in total debt?",
      answer:
        "Yes, a mortgage is debt, and excluding it produces a misleadingly low ratio for most homeowners. The fair comparison is against the market value of the property it finances, which belongs in total assets. The same logic applies to a car loan against a car: count the loan in debt and the vehicle's value in assets. Consistency in both directions is what makes the ratio meaningful over time.",
    },
    {
      question: "How can I improve my debt ratio?",
      answer:
        "Two ways: reduce debt or grow assets. On the debt side, prioritise the highest-rate balances, which also improves the DTI fastest, and consider whether consolidating lowers the effective cost. On the asset side, regular saving, debt-free contributions to retirement accounts and paying down the mortgage all raise net equity. Remember that consumer goods depreciate, so borrowing for them raises the ratio immediately and permanently until the loan is repaid — one of the clearest signals of whether borrowing is improving your position or eroding it.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Debt Ratio Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Debt Ratio Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Balance Sheet">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="total-debt"
                  label="Total Debt"
                  value={totalDebt}
                  onChange={setTotalDebt}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Mortgages, loans, cards and any other balances owed."
                />
                <CompactInput
                  id="total-assets"
                  label="Total Assets"
                  value={totalAssets}
                  onChange={setTotalAssets}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Home value, investments, retirement accounts, cash and vehicles."
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
                  <SubSection title="Income & Payments">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="monthly-income"
                        label="Gross Monthly Income"
                        value={monthlyIncome}
                        onChange={setMonthlyIncome}
                        onEnter={runCalculate}
                        prefix="$"
                        tooltip="Used for the debt-to-income comparison."
                      />
                      <CompactInput
                        id="monthly-payments"
                        label="Monthly Debt Payments"
                        value={monthlyPayments}
                        onChange={setMonthlyPayments}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Total paid towards debt each month."
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
            {results.valid && results.equity < 0 && (
              <div className="bg-amber-500/10 border-l-4 border-amber-500 rounded-lg p-5">
                <div className="text-sm font-bold text-amber-600 mb-1 uppercase tracking-wider">Negative equity</div>
                <div className="text-base font-medium text-foreground">
                  Debt exceeds assets by ${fmt(Math.abs(results.equity), 0)} — the balance sheet is underwater.
                </div>
              </div>
            )}

            {/* PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Debt Ratio</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {fmt(results.debtRatio, 1)}%
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                Band: <span className={`font-bold ${band.tone}`}>{band.label}</span> — the share of assets financed by
                debt
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Debt</span>
                <span className="font-extrabold text-foreground">${fmt(calcInputs.totalDebt, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Total Assets
                </span>
                <span className="font-extrabold text-foreground">${fmt(calcInputs.totalAssets, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Net Equity</span>
                <span className={`font-extrabold ${results.equity >= 0 ? "text-foreground" : "text-red-600"}`}>
                  ${fmt(results.equity, 0)}
                </span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Component</th>
                    <th className="p-2.5 text-right w-[130px]">Amount</th>
                    <th className="p-2.5 pr-3 text-right w-[110px]">% of Assets</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Debt (liabilities)</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(calcInputs.totalDebt, 0)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{fmt(results.debtShare, 1)}%</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Net equity</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.equity, 0)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{fmt(results.equityShare, 1)}%</td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Total Assets</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(calcInputs.totalAssets, 0)}</td>
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
                    Debt-to-Income Ratio
                  </span>
                  <span className="text-base font-bold text-foreground">{fmt(results.dti, 1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Equity Ratio</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.equityRatio, 1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Debt per $1 of Assets
                  </span>
                  <span className="text-base font-bold text-foreground">${fmt(results.debtPerDollar, 2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Annual Debt Service
                  </span>
                  <span className="text-base font-bold text-foreground">${fmt(results.annualDebtService, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Monthly Payments</span>
                  <span className="text-base font-bold text-foreground">${fmt(calcInputs.monthlyPayments, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Leverage Band</span>
                  <span className={`text-base font-bold ${band.tone}`}>{band.label}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Debt Ratio Calculator?</h2>
            <p>
              A debt ratio calculator compares what you owe with what you own. It divides total debt — mortgages, car
              loans, student loans, credit cards and any other balances — by total assets, including your home value,
              investments, retirement accounts, cash and vehicles, and expresses the result as a percentage. That
              percentage is the share of your assets financed by borrowing, and it is one of the clearest single measures
              of a household&apos;s financial position.
            </p>
            <p>
              The measure comes from business analysis, where it describes how leveraged a company is, and it translates
              naturally to personal finances. A low ratio means most of what you own is genuinely yours; a high ratio
              means a large share is still owed to lenders, and the equity can evaporate quickly if asset values fall. It
              is a stock measure — a snapshot of the balance sheet — so it complements rather than replaces
              debt-to-income, which measures the monthly flow of payments against income.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The calculation is a single division: total debt over total assets, multiplied by one hundred. Net equity
              is the difference between assets and debt — what would remain if every balance were settled at today&apos;s
              values. The equity ratio is net equity divided by assets, the mirror image of the debt ratio, and the two
              always sum to one hundred percent.
            </p>
            <p>
              The calculator also reports the debt-to-income ratio from the monthly figures you enter, the amount of debt
              per one dollar of assets, and the annual debt service — twelve times the monthly payments — so the
              balance-sheet view and the cash-flow view can be read together. That combination matters: a household with
              a high debt ratio but manageable payments is in a very different position from one with the same ratio and
              payments that consume most of its income.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports the debt ratio with a practical band — below 40% conservative, 40% to 60% moderate,
              above 60% high leverage — and the three-stat bar shows total debt, total assets and net equity, flagging
              the underwater case where debt exceeds assets. The breakdown table splits the asset base between the debt
              share and the equity share, which makes the ratio visible as a proportion of everything owned.
            </p>
            <p>
              Summary Statistics adds the debt-to-income ratio, the equity ratio, debt per dollar of assets, the annual
              debt service and the monthly payment load. Treat the bands as guidance rather than rules, and track the
              trend: a ratio rising because of appreciating assets purchased with mortgage debt is very different from
              one rising because of consumption financed on cards. The most durable way to improve the ratio is to reduce
              debt while continuing to build assets — and to remember that borrowing for goods that depreciate raises the
              ratio immediately and keeps it elevated until the loan is repaid. Update the figures at least once a year,
              using conservative asset values, so the trend line — not a single snapshot — drives your decisions. Then
              pair the result with a payment-level check like debt-to-income before making any new borrowing decision.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/debt-ratio-calculator" />
          <PopularCalculators exclude="/calculator/debt-ratio-calculator" />
        </div>
      </div>
    </>
  );
}
