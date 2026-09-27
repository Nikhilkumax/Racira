"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface UtilizationInputs {
  balances: number[];
  limits: number[];
  targetA: number;
  targetB: number;
}

const DEFAULTS: UtilizationInputs = {
  balances: [3400, 1800, 900],
  limits: [8000, 5000, 3000],
  targetA: 30,
  targetB: 10,
};

const fmt = (v: number, d = 1) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) => (Number.isFinite(v) ? "$" + v.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "—");

function band(pct: number): { label: string; tone: string } {
  if (pct < 10) return { label: "Excellent", tone: "text-emerald-600" };
  if (pct < 30) return { label: "Good", tone: "text-emerald-600" };
  if (pct < 50) return { label: "Fair", tone: "text-amber-600" };
  if (pct < 75) return { label: "High", tone: "text-orange-600" };
  return { label: "Very High", tone: "text-destructive" };
}

interface CardRow {
  index: number;
  balance: number;
  limit: number;
  utilization: number;
  band: string;
  tone: string;
}

interface UtilizationResult {
  totalBalance: number;
  totalLimit: number;
  overall: number;
  overallBand: string;
  overallTone: string;
  cards: CardRow[];
  worst: CardRow | null;
  payToA: number;
  payToB: number;
  available: number;
  valid: boolean;
  errorMsg: string;
}

function computeUtilization(i: UtilizationInputs): UtilizationResult {
  const cards: CardRow[] = i.balances.map((balance, index) => {
    const limit = i.limits[index] || 0;
    const utilization = limit > 0 ? (balance / limit) * 100 : 0;
    const b = band(utilization);
    return { index, balance, limit, utilization, band: b.label, tone: b.tone };
  });

  const active = cards.filter((c) => c.limit > 0 || c.balance > 0);
  const totalBalance = cards.reduce((s, c) => s + c.balance, 0);
  const totalLimit = cards.reduce((s, c) => s + c.limit, 0);
  const overall = totalLimit > 0 ? (totalBalance / totalLimit) * 100 : 0;
  const overallB = band(overall);

  const payFor = (target: number) => Math.max(0, totalBalance - (target / 100) * totalLimit);

  const invalid = totalLimit <= 0 || i.targetA < 0 || i.targetB < 0 || i.targetA > 100 || i.targetB > 100;

  return {
    totalBalance,
    totalLimit,
    overall,
    overallBand: overallB.label,
    overallTone: overallB.tone,
    cards: active,
    worst: active.length ? active.reduce((a, b) => (b.utilization > a.utilization ? b : a)) : null,
    payToA: payFor(i.targetA),
    payToB: payFor(i.targetB),
    available: Math.max(0, totalLimit - totalBalance),
    valid: !invalid,
    errorMsg: invalid
      ? "Enter at least one credit limit above zero and keep your target utilization percentages between 0 and 100."
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

export default function RevolvingCreditUtilizationCalculator() {
  const [b0, setB0] = useState(String(DEFAULTS.balances[0]));
  const [l0, setL0] = useState(String(DEFAULTS.limits[0]));
  const [b1, setB1] = useState(String(DEFAULTS.balances[1]));
  const [l1, setL1] = useState(String(DEFAULTS.limits[1]));
  const [b2, setB2] = useState(String(DEFAULTS.balances[2]));
  const [l2, setL2] = useState(String(DEFAULTS.limits[2]));
  const [targetA, setTargetA] = useState(String(DEFAULTS.targetA));
  const [targetB, setTargetB] = useState(String(DEFAULTS.targetB));
  const [showAdv, setShowAdv] = useState(false);

  const num = (v: string) => parseFloat(v) || 0;

  const getInputs = (): UtilizationInputs => ({
    balances: [num(b0), num(b1), num(b2)],
    limits: [num(l0), num(l1), num(l2)],
    targetA: num(targetA),
    targetB: num(targetB),
  });

  const [calcInputs, setCalcInputs] = useState<UtilizationInputs>(() => DEFAULTS);
  const [results, setResults] = useState<UtilizationResult>(() => computeUtilization(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeUtilization(inputs));
  };

  const reset = () => {
    setB0(String(DEFAULTS.balances[0]));
    setL0(String(DEFAULTS.limits[0]));
    setB1(String(DEFAULTS.balances[1]));
    setL1(String(DEFAULTS.limits[1]));
    setB2(String(DEFAULTS.balances[2]));
    setL2(String(DEFAULTS.limits[2]));
    setTargetA(String(DEFAULTS.targetA));
    setTargetB(String(DEFAULTS.targetB));
    setCalcInputs(DEFAULTS);
    setResults(computeUtilization(DEFAULTS));
  };

  const faqs = [
    {
      question: "Why does credit utilization matter so much?",
      answer:
        "Utilization is the second-largest factor in most credit scores, after payment history, and it is the one factor you can change quickly. It is calculated on both your overall utilization across all revolving accounts and the utilization on each individual card, so a single maxed-out card can drag a score down even when total balances look modest.",
    },
    {
      question: "Is it better to carry a small balance?",
      answer:
        "No. The common belief that you should carry a balance to build credit is a myth. Utilization counts the statement balance reported to the bureaus, so paying a card in full each month and letting a small balance report occasionally keeps utilization low without paying a cent of interest. Carrying a balance only adds interest cost and raises utilization.",
    },
    {
      question: "What utilization percentage should I target?",
      answer:
        "Under 30% is the widely published threshold and under 10% is where the strongest scores cluster. The calculator shows the exact dollar amount required to reach both targets across your cards, which is more useful than a percentage because you can plan a specific payment. Reducing utilization from above 50% to below 10% can move a score noticeably within one or two statement cycles.",
    },
    {
      question: "Should I pay down the highest-utilization card first?",
      answer:
        "Usually yes. Because individual card utilization matters as well as the overall figure, clearing the card with the highest percentage is the fastest way to improve both numbers at once. The breakdown table identifies that card, and the Summary calls it out directly so you know where the next dollar of principal does the most good.",
    },
    {
      question: "Do I need to close cards to lower utilization?",
      answer:
        "No, and closing a card usually hurts, because it removes available credit from the denominator and raises your utilization. Keep older accounts open even if unused; the extra available credit lowers your overall percentage and lengthens your credit history at the same time.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Revolving Credit Utilization Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Revolving Credit Utilization Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Card 1">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="c1-balance"
                  label="Balance"
                  value={b0}
                  onChange={setB0}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Current balance on the first revolving account."
                />
                <CompactInput
                  id="c1-limit"
                  label="Credit Limit"
                  value={l0}
                  onChange={setL0}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Credit limit on the first account."
                />
              </div>
            </SubSection>

            <SubSection title="Card 2">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="c2-balance"
                  label="Balance"
                  value={b1}
                  onChange={setB1}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Current balance on the second revolving account."
                />
                <CompactInput
                  id="c2-limit"
                  label="Credit Limit"
                  value={l1}
                  onChange={setL1}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Credit limit on the second account."
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
                  <SubSection title="Card 3">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="c3-balance"
                        label="Balance"
                        value={b2}
                        onChange={setB2}
                        onEnter={runCalculate}
                        prefix="$"
                        tooltip="Current balance on a third revolving account."
                      />
                      <CompactInput
                        id="c3-limit"
                        label="Credit Limit"
                        value={l2}
                        onChange={setL2}
                        onEnter={runCalculate}
                        prefix="$"
                        tooltip="Credit limit on the third account."
                      />
                    </div>
                  </SubSection>

                  <SubSection title="Target Utilization">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="target-a"
                        label="Primary Target"
                        value={targetA}
                        onChange={setTargetA}
                        onEnter={runCalculate}
                        suffix="%"
                        step="1"
                        tooltip="The utilization threshold you want to reach first (30% is the common guide)."
                      />
                      <CompactInput
                        id="target-b"
                        label="Stretch Target"
                        value={targetB}
                        onChange={setTargetB}
                        onEnter={runCalculate}
                        suffix="%"
                        step="1"
                        tooltip="The best-practice threshold where top scores cluster (typically 10%)."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Overall Utilization</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {fmt(results.overall, 1)}%
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {money(results.totalBalance)} of {money(results.totalLimit)} used &middot;{" "}
                <span className={results.overallTone}>{results.overallBand}</span>
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Balance</span>
                <span className="font-extrabold text-foreground">{money(results.totalBalance)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Available</span>
                <span className="font-extrabold text-foreground">{money(results.available)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Pay to {fmt(calcInputs.targetA, 0)}%
                </span>
                <span className="font-extrabold text-foreground">{money(results.payToA)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Account</th>
                    <th className="p-2.5 text-right w-[110px]">Balance</th>
                    <th className="p-2.5 text-right w-[110px]">Limit</th>
                    <th className="p-2.5 text-right w-[90px]">Util.</th>
                    <th className="p-2.5 pr-3 text-right w-[100px]">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.cards.map((card) => (
                    <tr key={card.index} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">Card {card.index + 1}</td>
                      <td className="p-2.5 text-right text-foreground">{money(card.balance)}</td>
                      <td className="p-2.5 text-right text-foreground">{money(card.limit)}</td>
                      <td className="p-2.5 text-right font-semibold text-foreground">{fmt(card.utilization, 1)}%</td>
                      <td className={`p-2.5 pr-3 text-right font-semibold ${card.tone}`}>{card.band}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Overall</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.totalBalance)}</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.totalLimit)}</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(results.overall, 1)}%</td>
                    <td className={`p-2.5 pr-3 text-right ${results.overallTone}`}>{results.overallBand}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Overall Utilization</span>
                  <span className={`text-base font-bold ${results.overallTone}`}>{fmt(results.overall, 1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Accounts Counted</span>
                  <span className="text-base font-bold text-foreground">{results.cards.length}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Pay to Reach {fmt(calcInputs.targetA, 0)}%
                  </span>
                  <span className="text-base font-bold text-primary">{money(results.payToA)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Pay to Reach {fmt(calcInputs.targetB, 0)}%
                  </span>
                  <span className="text-base font-bold text-foreground">{money(results.payToB)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Highest-Utilization Card</span>
                  <span className="text-base font-bold text-foreground">
                    {results.worst ? `Card ${results.worst.index + 1} (${fmt(results.worst.utilization, 1)}%)` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Available Credit</span>
                  <span className="text-base font-bold text-foreground">{money(results.available)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Revolving Credit Utilization Calculator?</h2>
            <p>
              Credit utilization is the share of your available revolving credit that you are currently using. It is
              calculated two ways, overall across all cards and individually per card, and both versions feed into credit
              scoring models. This calculator adds up your balances and limits, reports the combined and per-account
              percentages, and tells you the exact dollar amount needed to bring utilization down to a target level. It
              is one of the few levers that can move a credit score within a single statement cycle, because the figures
              are recomputed every time a lender reports a balance.
            </p>
            <p>
              Because utilization is a ratio, it can improve in two different ways: by shrinking the numerator through
              repayment, or by enlarging the denominator when a credit limit is raised. Understanding that relationship
              is what makes this tool more useful than a simple percentage, since it shows how far a payment or a limit
              increase has to go before the ratio crosses a scoring threshold.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The maths is deliberately simple, which is exactly why it is so powerful. Per-card utilization is the card
              balance divided by the card limit; overall utilization is the sum of every balance divided by the sum of
              every limit. The calculator also maps each percentage onto the conventional scoring bands: below 10% is
              excellent, below 30% is good, below 50% is fair, below 75% is high, and at or above 75% is very high. Those
              bands are planning guides rather than published cut-offs, but they reflect how lenders and scoring models
              tend to treat different levels of revolving debt.
            </p>
            <p>
              To show what action is required, the calculator multiplies your chosen target by your total available
              limit to find the balance that would hit that ratio, then subtracts it from your current balance. The
              difference is the amount you would need to pay down, ignoring interest and any new spending, to reach the
              target. It performs that calculation for two targets at once, a primary threshold like 30% and a stretch
              threshold like 10%.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows your overall utilization and labels it with the matching scoring band, while the
              three statistics beneath it give your total balance, remaining available credit, and the payment needed to
              hit your primary target. The breakdown table lists each account side by side so you can spot the card that
              is doing the most damage; a single maxed-out card can keep an otherwise healthy profile in a weaker band,
              which is why individual utilization matters as much as the combined figure.
            </p>
            <p>
              Summary Statistics adds the count of accounts, the amounts required for both targets, and names the
              highest-utilization card. A common strategy is to leave older accounts open to keep their limits in the
              denominator, spread balances across cards so none sits above 30%, and pay down the worst card first.
              Utilization responds quickly, so a meaningful reduction often shows up on the next statement cycle, though
              the exact timing depends on when your lenders report to the credit bureaus.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/revolving-credit-utilization-calculator" />
          <PopularCalculators exclude="/calculator/revolving-credit-utilization-calculator" />
        </div>
      </div>
    </>
  );
}
