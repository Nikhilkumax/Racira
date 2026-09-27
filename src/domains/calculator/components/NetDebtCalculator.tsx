"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface NetDebtInputs {
  cash: number;
  investments: number;
  propertyValue: number;
  otherAssets: number;
  creditCards: number;
  autoLoans: number;
  studentLoans: number;
  mortgage: number;
  otherDebts: number;
}

const DEFAULTS: NetDebtInputs = {
  cash: 12500,
  investments: 32000,
  propertyValue: 310000,
  otherAssets: 8000,
  creditCards: 6800,
  autoLoans: 11500,
  studentLoans: 18000,
  mortgage: 225000,
  otherDebts: 2000,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

function leverageBand(pct: number): { label: string; tone: string } {
  if (pct <= 30) return { label: "Conservative", tone: "text-emerald-600" };
  if (pct <= 50) return { label: "Moderate", tone: "text-emerald-600" };
  if (pct <= 70) return { label: "Elevated", tone: "text-amber-600" };
  return { label: "Highly leveraged", tone: "text-red-600" };
}

interface NetDebtResult {
  liquidAssets: number;
  totalAssets: number;
  totalDebt: number;
  netDebt: number;
  netWorth: number;
  debtToAssetsPct: number;
  assetCoverage: number;
  liquidCoveragePct: number;
  nonMortgageDebt: number;
  homeEquity: number;
  band: string;
  bandTone: string;
  netCash: boolean;
  valid: boolean;
  errorMsg: string;
}

function computeNetDebt(i: NetDebtInputs): NetDebtResult {
  const invalid =
    i.cash < 0 ||
    i.investments < 0 ||
    i.propertyValue < 0 ||
    i.otherAssets < 0 ||
    i.creditCards < 0 ||
    i.autoLoans < 0 ||
    i.studentLoans < 0 ||
    i.mortgage < 0 ||
    i.otherDebts < 0 ||
    i.cash + i.investments + i.propertyValue + i.otherAssets <= 0;

  const liquidAssets = i.cash;
  const totalAssets = i.cash + i.investments + i.propertyValue + i.otherAssets;
  const totalDebt = i.creditCards + i.autoLoans + i.studentLoans + i.mortgage + i.otherDebts;
  const netDebt = totalDebt - liquidAssets;
  const netWorth = totalAssets - totalDebt;
  const debtToAssetsPct = totalAssets > 0 ? (totalDebt / totalAssets) * 100 : 0;
  const band = leverageBand(debtToAssetsPct);

  return {
    liquidAssets,
    totalAssets,
    totalDebt,
    netDebt,
    netWorth,
    debtToAssetsPct,
    assetCoverage: totalDebt > 0 ? totalAssets / totalDebt : Infinity,
    liquidCoveragePct: totalDebt > 0 ? (liquidAssets / totalDebt) * 100 : 0,
    nonMortgageDebt: totalDebt - i.mortgage,
    homeEquity: i.propertyValue - i.mortgage,
    band: band.label,
    bandTone: band.tone,
    netCash: netDebt <= 0,
    valid: !invalid,
    errorMsg: invalid ? "Enter non-negative amounts and at least one positive asset value." : "",
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

export default function NetDebtCalculator() {
  const [cash, setCash] = useState(String(DEFAULTS.cash));
  const [investments, setInvestments] = useState(String(DEFAULTS.investments));
  const [propertyValue, setPropertyValue] = useState(String(DEFAULTS.propertyValue));
  const [otherAssets, setOtherAssets] = useState(String(DEFAULTS.otherAssets));
  const [creditCards, setCreditCards] = useState(String(DEFAULTS.creditCards));
  const [autoLoans, setAutoLoans] = useState(String(DEFAULTS.autoLoans));
  const [studentLoans, setStudentLoans] = useState(String(DEFAULTS.studentLoans));
  const [mortgage, setMortgage] = useState(String(DEFAULTS.mortgage));
  const [otherDebts, setOtherDebts] = useState(String(DEFAULTS.otherDebts));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): NetDebtInputs => ({
    cash: parseFloat(cash) || 0,
    investments: parseFloat(investments) || 0,
    propertyValue: parseFloat(propertyValue) || 0,
    otherAssets: parseFloat(otherAssets) || 0,
    creditCards: parseFloat(creditCards) || 0,
    autoLoans: parseFloat(autoLoans) || 0,
    studentLoans: parseFloat(studentLoans) || 0,
    mortgage: parseFloat(mortgage) || 0,
    otherDebts: parseFloat(otherDebts) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<NetDebtInputs>(() => DEFAULTS);
  const [results, setResults] = useState<NetDebtResult>(() => computeNetDebt(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeNetDebt(inputs));
  };

  const reset = () => {
    setCash(String(DEFAULTS.cash));
    setInvestments(String(DEFAULTS.investments));
    setPropertyValue(String(DEFAULTS.propertyValue));
    setOtherAssets(String(DEFAULTS.otherAssets));
    setCreditCards(String(DEFAULTS.creditCards));
    setAutoLoans(String(DEFAULTS.autoLoans));
    setStudentLoans(String(DEFAULTS.studentLoans));
    setMortgage(String(DEFAULTS.mortgage));
    setOtherDebts(String(DEFAULTS.otherDebts));
    setCalcInputs(DEFAULTS);
    setResults(computeNetDebt(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is the difference between net debt and net worth?",
      answer:
        "Net worth subtracts every liability from every asset, so it includes the full value of your home, retirement accounts and car. Net debt is narrower and more liquid-minded: it subtracts only cash and near-cash assets from total debt, answering how much borrowing survives once immediately available money is used up. You can have a healthy positive net worth and still carry a large net debt if most of your assets are illiquid, such as home equity.",
    },
    {
      question: "Why exclude investments from net debt?",
      answer:
        "Investments could be sold to repay debt, but doing so usually triggers taxes, penalties or a permanent loss of compounding, so they are not treated as available cash. Keeping them out of the net debt figure prevents an inflated sense of safety. If you want an aggressive view, add the investment balance into the cash field and watch how the metric moves — just remember that a portfolio liquidation is a plan, not a buffer.",
    },
    {
      question: "What is a good debt-to-assets ratio?",
      answer:
        "There is no universal line, because a mortgage is long-term, secured and tax-advantaged while credit card debt is none of those. As a rough frame: below 30% is conservative, 30% to 50% is moderate, 50% to 70% is elevated, and above 70% is highly leveraged. What matters more than the headline ratio is its composition — secured, appreciating debt behaves very differently from revolving, depreciating debt at the same total.",
    },
    {
      question: "Is net cash the same as net worth?",
      answer:
        "No. Net cash means cash and savings alone cover all outstanding debt, so the net debt figure turns negative. That is a strong liquidity position, but a household can also be net cash because it holds no mortgage and rents. Net debt and net worth are best read together: one describes flexibility, the other describes accumulated wealth.",
    },
  ];


  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Net Debt Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Net Debt Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Assets">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="cash"
                  label="Cash & Savings"
                  value={cash}
                  onChange={setCash}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Checking, savings and money market balances."
                />
                <CompactInput
                  id="investments"
                  label="Investments"
                  value={investments}
                  onChange={setInvestments}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Taxable and retirement accounts at market value."
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <CompactInput
                  id="property"
                  label="Property Value"
                  value={propertyValue}
                  onChange={setPropertyValue}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Market value of real estate you own."
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

            <SubSection title="Debts">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="credit-cards"
                  label="Credit Cards"
                  value={creditCards}
                  onChange={setCreditCards}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Revolving balances across all cards."
                />
                <CompactInput
                  id="auto-loans"
                  label="Auto Loans"
                  value={autoLoans}
                  onChange={setAutoLoans}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Outstanding vehicle loan balances."
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
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
                <CompactInput
                  id="mortgage"
                  label="Mortgage"
                  value={mortgage}
                  onChange={setMortgage}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Remaining balance on property loans."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Net Debt</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                ${fmt(results.netDebt, 0)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.netCash
                  ? "Cash and savings cover every outstanding balance"
                  : `Total debt of $${fmt(results.totalDebt, 0)} less $${fmt(results.liquidAssets, 0)} in cash and savings`}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Assets</span>
                <span className="font-extrabold text-foreground">${fmt(results.totalAssets, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
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
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Cash & savings</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(calcInputs.cash, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">
                      {fmt(results.totalAssets > 0 ? (calcInputs.cash / results.totalAssets) * 100 : 0, 1)}%
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Investments</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(calcInputs.investments, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">
                      {fmt(results.totalAssets > 0 ? (calcInputs.investments / results.totalAssets) * 100 : 0, 1)}%
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Property & other assets</td>
                    <td className="p-2.5 text-right text-foreground">
                      ${fmt(calcInputs.propertyValue + calcInputs.otherAssets, 0)}
                    </td>
                    <td className="p-2.5 pr-3 text-right text-foreground">
                      {fmt(results.totalAssets > 0 ? ((calcInputs.propertyValue + calcInputs.otherAssets) / results.totalAssets) * 100 : 0, 1)}%
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Secured debt (mortgage)</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(calcInputs.mortgage, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">
                      {fmt(results.totalDebt > 0 ? (calcInputs.mortgage / results.totalDebt) * 100 : 0, 1)}%
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Other debt</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.nonMortgageDebt, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">
                      {fmt(results.totalDebt > 0 ? (results.nonMortgageDebt / results.totalDebt) * 100 : 0, 1)}%
                    </td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Net debt (debt less cash)</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.netDebt, 0)}</td>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Debt-to-Assets Ratio</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.debtToAssetsPct, 1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Asset Coverage</span>
                  <span className="text-base font-bold text-foreground">
                    {Number.isFinite(results.assetCoverage) ? fmt(results.assetCoverage, 2) + "x" : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cash Covering Debt</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.liquidCoveragePct, 1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Non-Mortgage Debt</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.nonMortgageDebt, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Home Equity</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.homeEquity, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Leverage Band</span>
                  <span className={`text-base font-bold ${results.bandTone}`}>{results.band}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Net Debt Calculator?</h2>
            <p>
              A net debt calculator subtracts your cash and savings from the total you owe, producing a single figure for
              how much borrowing remains after immediately available money is spent. It is a liquidity metric rather than
              a wealth metric. Where net worth asks what you own minus what you owe, net debt asks how much of your debt
              would survive if every dollar of accessible cash were thrown at it today.
            </p>
            <p>
              The distinction matters because a household can look wealthy on paper and still be fragile. Home equity and
              retirement balances cannot pay next month&apos;s car payment without a sale, a loan against the account or
              a tax consequence. Looking at the two numbers side by side separates the appearance of strength from the
              reality of cash on hand.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Total assets combine cash and savings, investments, property value and other assets such as vehicles or
              business interests. Total debt combines credit cards, auto loans, student loans, a mortgage and any other
              obligations. Net debt is total debt minus cash and savings alone; net worth is total assets minus total
              debt. The calculator then derives the debt-to-assets ratio, asset coverage, and the share of debt that cash
              alone would clear.
            </p>
            <p>
              Debt is grouped into secured and unsecured for a reason. A mortgage is secured by an appreciating asset
              and is usually the last balance to attack, while a revolving card balance at a high rate is unsecured and
              costly. Two households with identical debt-to-assets ratios can deserve very different readings of risk,
              because one is carrying a low-rate home loan and the other a pile of revolving debt. Read the ratio together
              with the composition, never in isolation.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports net debt, with the underlying total debt and liquid assets shown beneath it. The
              three-stat bar sets total assets against total debt and finishes with net worth, while the balance-sheet
              table lists each asset and liability line with its share of the total, so you can see exactly which
              balances are driving the outcome.
            </p>
            <p>
              Watch the cash-coverage figure closely. If cash clears only a small percentage of total debt, your buffer
              is thin relative to obligations, which makes an emergency fund a higher priority than extra payments. When
              the same figure approaches or passes 100%, you are effectively net cash and can redirect surplus toward
              investments or a mortgage payoff. Recheck the numbers after any refinance, bonus or large purchase, and
              keep an eye on the non-mortgage total, since that is the debt that usually carries the highest rates.
            </p>
            <p>
              Two habits keep the figure honest over time. Update property value conservatively rather than at a
              peak-market estimate, because overstating a home inflates asset coverage and hides leverage. And count only
              cash you can reach within days — a certificate of deposit inside its term or a retirement account still
              years from withdrawal behaves like an investment, not a buffer. A modest net debt with a thick cash cushion
              is a stronger position than a thinner net debt held together by money you cannot actually spend.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/net-debt-calculator" />
          <PopularCalculators exclude="/calculator/net-debt-calculator" />
        </div>
      </div>
    </>
  );
}
