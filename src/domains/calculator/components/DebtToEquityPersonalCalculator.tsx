"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface EquityInputs {
  cash: number;
  investments: number;
  homeValue: number;
  otherAssets: number;
  mortgage: number;
  creditCards: number;
  autoLoan: number;
  studentLoans: number;
  otherDebts: number;
}

const DEFAULTS: EquityInputs = {
  cash: 18000,
  investments: 65000,
  homeValue: 340000,
  otherAssets: 12000,
  mortgage: 240000,
  creditCards: 5200,
  autoLoan: 14000,
  studentLoans: 22000,
  otherDebts: 1500,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

function equityBand(liabilitiesToAssets: number): { label: string; tone: string } {
  if (liabilitiesToAssets <= 40) return { label: "Healthy", tone: "text-emerald-600" };
  if (liabilitiesToAssets <= 60) return { label: "Moderate", tone: "text-emerald-600" };
  if (liabilitiesToAssets <= 80) return { label: "Elevated", tone: "text-amber-600" };
  return { label: "Stretched", tone: "text-red-600" };
}

interface EquityResult {
  totalAssets: number;
  totalDebt: number;
  netWorth: number;
  debtToEquity: number;
  liabilitiesToAssetsPct: number;
  homeEquity: number;
  nonMortgageDebt: number;
  equityBacking: number;
  band: string;
  bandTone: string;
  negativeEquity: boolean;
  valid: boolean;
  errorMsg: string;
}

function computeEquity(i: EquityInputs): EquityResult {
  const invalid =
    i.cash < 0 ||
    i.investments < 0 ||
    i.homeValue < 0 ||
    i.otherAssets < 0 ||
    i.mortgage < 0 ||
    i.creditCards < 0 ||
    i.autoLoan < 0 ||
    i.studentLoans < 0 ||
    i.otherDebts < 0 ||
    i.cash + i.investments + i.homeValue + i.otherAssets <= 0;

  const totalAssets = i.cash + i.investments + i.homeValue + i.otherAssets;
  const totalDebt = i.mortgage + i.creditCards + i.autoLoan + i.studentLoans + i.otherDebts;
  const netWorth = totalAssets - totalDebt;
  const liabilitiesToAssetsPct = totalAssets > 0 ? (totalDebt / totalAssets) * 100 : 0;
  const band = equityBand(liabilitiesToAssetsPct);

  return {
    totalAssets,
    totalDebt,
    netWorth,
    debtToEquity: netWorth > 0 ? (totalDebt / netWorth) * 100 : Infinity,
    liabilitiesToAssetsPct,
    homeEquity: i.homeValue - i.mortgage,
    nonMortgageDebt: totalDebt - i.mortgage,
    equityBacking: totalDebt > 0 ? netWorth / totalDebt : Infinity,
    band: band.label,
    bandTone: band.tone,
    negativeEquity: netWorth <= 0,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter non-negative amounts and at least one positive asset value."
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

export default function DebtToEquityPersonalCalculator() {
  const [cash, setCash] = useState(String(DEFAULTS.cash));
  const [investments, setInvestments] = useState(String(DEFAULTS.investments));
  const [homeValue, setHomeValue] = useState(String(DEFAULTS.homeValue));
  const [otherAssets, setOtherAssets] = useState(String(DEFAULTS.otherAssets));
  const [mortgage, setMortgage] = useState(String(DEFAULTS.mortgage));
  const [creditCards, setCreditCards] = useState(String(DEFAULTS.creditCards));
  const [autoLoan, setAutoLoan] = useState(String(DEFAULTS.autoLoan));
  const [studentLoans, setStudentLoans] = useState(String(DEFAULTS.studentLoans));
  const [otherDebts, setOtherDebts] = useState(String(DEFAULTS.otherDebts));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): EquityInputs => ({
    cash: parseFloat(cash) || 0,
    investments: parseFloat(investments) || 0,
    homeValue: parseFloat(homeValue) || 0,
    otherAssets: parseFloat(otherAssets) || 0,
    mortgage: parseFloat(mortgage) || 0,
    creditCards: parseFloat(creditCards) || 0,
    autoLoan: parseFloat(autoLoan) || 0,
    studentLoans: parseFloat(studentLoans) || 0,
    otherDebts: parseFloat(otherDebts) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<EquityInputs>(() => DEFAULTS);
  const [results, setResults] = useState<EquityResult>(() => computeEquity(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeEquity(inputs));
  };

  const reset = () => {
    setCash(String(DEFAULTS.cash));
    setInvestments(String(DEFAULTS.investments));
    setHomeValue(String(DEFAULTS.homeValue));
    setOtherAssets(String(DEFAULTS.otherAssets));
    setMortgage(String(DEFAULTS.mortgage));
    setCreditCards(String(DEFAULTS.creditCards));
    setAutoLoan(String(DEFAULTS.autoLoan));
    setStudentLoans(String(DEFAULTS.studentLoans));
    setOtherDebts(String(DEFAULTS.otherDebts));
    setCalcInputs(DEFAULTS);
    setResults(computeEquity(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is a personal debt-to-equity ratio?",
      answer:
        "It compares everything you owe with the net worth you have built, expressed as a percentage. It is the household version of the ratio analysts apply to companies: total debt divided by equity. A reading of 100% means your debts equal your net worth; above that, you owe more than you own free and clear. It is a leverage measure, not a verdict, because the composition of the debt matters as much as the total.",
    },
    {
      question: "How is this different from the debt-to-assets ratio?",
      answer:
        "Debt-to-assets divides liabilities by gross assets, so it always sits below 100%. Debt-to-equity divides liabilities by net worth, so it can exceed 100% and grows non-linearly as equity shrinks. Two measures answer slightly different questions: debt-to-assets describes how much of your property is financed, while debt-to-equity describes how much of your ownership is leveraged. The calculator reports both so you can read the position from each angle.",
    },
    {
      question: "What counts as equity in a household balance sheet?",
      answer:
        "Equity is total assets minus total debt — cash, investments, property and other assets less mortgages, cards, auto loans, student loans and other obligations. It is the value you actually own after settling what you owe. When equity is negative, the ratio is undefined and the calculator reports that condition instead of a misleading number, because dividing debt by a negative cushion produces a result with no usable meaning.",
    },
    {
      question: "When does a debt-to-equity ratio become a problem?",
      answer:
        "A ratio elevated by a single amortizing mortgage is very different from one driven by revolving balances. Mortgage debt is secured, low-rate and repaid on a fixed schedule; card debt is unsecured, expensive and renewable. The calculator therefore reports non-mortgage debt separately, since that figure usually reveals the real pressure. As a rough guide, liabilities below 40% of assets is healthy, and readings above 80% leave little margin for a drop in income.",
    },
  ];


  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Debt to Equity Personal Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Debt to Equity Personal Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="What You Own">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="cash"
                  label="Cash & Savings"
                  value={cash}
                  onChange={setCash}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Checking, savings and cash equivalents."
                />
                <CompactInput
                  id="investments"
                  label="Investments"
                  value={investments}
                  onChange={setInvestments}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Brokerage and retirement accounts at market value."
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <CompactInput
                  id="home-value"
                  label="Home Value"
                  value={homeValue}
                  onChange={setHomeValue}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Current market value of your primary residence."
                />
                <CompactInput
                  id="other-assets"
                  label="Other Assets"
                  value={otherAssets}
                  onChange={setOtherAssets}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Vehicles, business interests, valuables."
                />
              </div>
            </SubSection>

            <SubSection title="What You Owe">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="mortgage"
                  label="Mortgage Balance"
                  value={mortgage}
                  onChange={setMortgage}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Remaining principal on property loans."
                />
                <CompactInput
                  id="credit-cards"
                  label="Credit Cards"
                  value={creditCards}
                  onChange={setCreditCards}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Total revolving balances."
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <CompactInput
                  id="auto-loan"
                  label="Auto Loans"
                  value={autoLoan}
                  onChange={setAutoLoan}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Outstanding vehicle financing."
                />
                <CompactInput
                  id="student-loans"
                  label="Student Loans"
                  value={studentLoans}
                  onChange={setStudentLoans}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Federal and private education debt."
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
                  <SubSection title="Other Obligations">
                    <CompactInput
                      id="other-debts"
                      label="Other Debts"
                      value={otherDebts}
                      onChange={setOtherDebts}
                      onEnter={runCalculate}
                      prefix="$"
                      min="0"
                      tooltip="Personal loans, medical balances, family loans."
                    />
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
                Personal Debt-to-Equity Ratio
              </div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {Number.isFinite(results.debtToEquity) ? `${fmt(results.debtToEquity, 1)}%` : "Not meaningful"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.negativeEquity
                  ? "Net worth is zero or negative — build equity before drawing leverage conclusions"
                  : `$${fmt(results.totalDebt, 0)} of debt against $${fmt(results.netWorth, 0)} of net worth`}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Debt</span>
                <span className="font-extrabold text-foreground">${fmt(results.totalDebt, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Net Worth</span>
                <span className={`font-extrabold ${results.netWorth >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  ${fmt(results.netWorth, 0)}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Liabilities / Assets</span>
                <span className="font-extrabold text-foreground">{fmt(results.liabilitiesToAssetsPct, 1)}%</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Balance Sheet Line</th>
                    <th className="p-2.5 text-right w-[130px]">Amount</th>
                    <th className="p-2.5 pr-3 text-right w-[120px]">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Cash & investments</td>
                    <td className="p-2.5 text-right text-foreground">
                      ${fmt(calcInputs.cash + calcInputs.investments, 0)}
                    </td>
                    <td className="p-2.5 pr-3 text-right text-foreground">
                      {fmt(results.totalAssets > 0 ? ((calcInputs.cash + calcInputs.investments) / results.totalAssets) * 100 : 0, 1)}%
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Home & other property</td>
                    <td className="p-2.5 text-right text-foreground">
                      ${fmt(calcInputs.homeValue + calcInputs.otherAssets, 0)}
                    </td>
                    <td className="p-2.5 pr-3 text-right text-foreground">
                      {fmt(results.totalAssets > 0 ? ((calcInputs.homeValue + calcInputs.otherAssets) / results.totalAssets) * 100 : 0, 1)}%
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Mortgage debt</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(calcInputs.mortgage, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">
                      {fmt(results.totalDebt > 0 ? (calcInputs.mortgage / results.totalDebt) * 100 : 0, 1)}%
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Non-mortgage debt</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.nonMortgageDebt, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">
                      {fmt(results.totalDebt > 0 ? (results.nonMortgageDebt / results.totalDebt) * 100 : 0, 1)}%
                    </td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Net worth (assets less debt)</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.netWorth, 0)}</td>
                    <td className={`p-2.5 pr-3 text-right ${results.bandTone}`}>{results.band}</td>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Liabilities-to-Assets</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.liabilitiesToAssetsPct, 1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Equity per $1 of Debt</span>
                  <span className="text-base font-bold text-foreground">
                    {Number.isFinite(results.equityBacking) ? "$" + fmt(results.equityBacking, 2) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Home Equity</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.homeEquity, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Non-Mortgage Debt</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.nonMortgageDebt, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Assets</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.totalAssets, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Equity Band</span>
                  <span className={`text-base font-bold ${results.bandTone}`}>{results.band}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Personal Debt-to-Equity Calculator?</h2>
            <p>
              A personal debt-to-equity calculator compares everything you owe with the net worth you have built, giving
              a single leverage figure for the household. It is the same idea analysts apply to companies, adapted to a
              balance sheet of cash, investments, a home and the loans behind them. The result answers a direct question:
              how many dollars of borrowing stand behind every dollar of ownership?
            </p>
            <p>
              The reading is a lens on financial resilience rather than a grade. A household that owes twice its net worth
              is not automatically in trouble — it may simply be thirty years into a mortgage on an appreciating home. A
              household with a lower ratio can be in worse shape if its debt is revolving, high-rate and growing. Context,
              not the headline number, decides what the ratio means.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Total assets add cash, investments, home value and other property. Total debt adds the mortgage, credit
              cards, auto loans, student loans and any other obligations. Net worth is assets minus debt, and the
              debt-to-equity ratio divides total debt by net worth and expresses it as a percentage. The calculator also
              reports liabilities as a share of gross assets, which always stays below 100% and describes how much of
              what you own is financed with borrowed money.
            </p>
            <p>
              Both measures appear because they respond differently to change. Paying down a mortgage raises net worth
              and lowers debt at the same time, improving both readings twice. Taking on new car financing raises debt
              while the vehicle depreciates, so both measures worsen quickly. When net worth is zero or negative, the
              ratio has no usable meaning, and the calculator says so rather than returning a number that invites the
              wrong conclusion.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports the personal debt-to-equity ratio with total debt and net worth beneath it. The
              three-stat bar adds the liabilities-to-assets reading, while the balance sheet table lists each group of
              assets and debts with its share of the total, so you can see which lines drive the ratio.
            </p>
            <p>
              Pay particular attention to the non-mortgage debt line. Mortgage debt is secured, long-dated and usually
              low-rate, so it behaves like a controlled obligation. Everything else — cards, personal loans, vehicle
              financing — is typically unsecured or depreciating, and it is this portion that most often turns a
              comfortable ratio into a fragile one.
            </p>
            <p>
              Use the ratio as a trend rather than a snapshot. Record it every few months and watch its direction. A ratio
              that falls because you are paying down principal and building savings is progress; one that falls only
              because asset markets rose while borrowing kept climbing is not. The most durable improvement comes from
              shrinking the highest-cost debt and redirecting the freed payment into long-term assets. A useful habit is
              to pair every new obligation with a plan for the payment that clears it, since the ratio only improves when
              debt falls faster than equity rises, and that gap is              where household leverage actually shrinks over the long run.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/debt-to-equity-personal-calculator" />
          <PopularCalculators exclude="/calculator/debt-to-equity-personal-calculator" />
        </div>
      </div>
    </>
  );
}
