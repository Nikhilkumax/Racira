"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface StopLossInputs {
  entryPrice: number;
  stopPercent: number;
  accountSize: number;
  riskPercent: number;
  recentHigh: number;
  targetR: number;
  commission: number;
  gapPercent: number;
}

const DEFAULTS: StopLossInputs = {
  entryPrice: 60,
  stopPercent: 8,
  accountSize: 50000,
  riskPercent: 1.5,
  recentHigh: 67,
  targetR: 2,
  commission: 5,
  gapPercent: 2,
};

const STOP_LADDER = [4, 6, 8, 10, 12];

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "—";

const money2 = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";

interface LadderRow {
  stopPercent: number;
  stopPrice: number;
  riskPerShare: number;
  shares: number;
  capital: number;
  target: number;
}

interface StopLossResult {
  valid: boolean;
  errorMsg: string;
  entryPrice: number;
  stopPrice: number;
  riskPerShare: number;
  riskBudget: number;
  shares: number;
  capitalRequired: number;
  capitalShare: number;
  actualRisk: number;
  targetPrice: number;
  trailingStop: number;
  gapLoss: number;
  commissionCost: number;
  breakevenWinRate: number;
  rewardRisk: number;
  rows: LadderRow[];
  summary: { label: string; value: string; tone?: string }[];
}

function compute(i: StopLossInputs): StopLossResult {
  const entry = Math.max(0.01, i.entryPrice);
  const stopPercent = Math.min(50, Math.max(0.1, i.stopPercent));
  const riskPerShare = entry * (stopPercent / 100);
  const stopPrice = entry - riskPerShare;
  const riskBudget = Math.max(0, (i.accountSize * i.riskPercent) / 100);
  const shares = Math.max(0, Math.floor(riskBudget / riskPerShare));
  const capitalRequired = shares * entry;
  const actualRisk = shares * riskPerShare;
  const targetR = Math.max(0.5, i.targetR);
  const targetPrice = entry + targetR * riskPerShare;
  const trailingStop = Math.max(0, i.recentHigh) * (1 - stopPercent / 100);
  const gapLoss = shares * (entry - stopPrice * (1 - Math.max(0, i.gapPercent) / 100));
  const commissionCost = shares > 0 ? Math.max(0, i.commission) * 2 : 0;

  const rows: LadderRow[] = STOP_LADDER.map((pct) => {
    const risk = entry * (pct / 100);
    const count = Math.max(0, Math.floor(riskBudget / risk));
    return {
      stopPercent: pct,
      stopPrice: entry - risk,
      riskPerShare: risk,
      shares: count,
      capital: count * entry,
      target: entry + targetR * risk,
    };
  });

  const rewardRisk = stopPercent > 0 ? targetR : 0;
  // With R multiples the break-even hit rate is 1/(1+R), before commissions.
  const breakevenWinRate = (1 / (1 + rewardRisk)) * 100;

  const valid =
    i.entryPrice > 0 &&
    i.stopPercent > 0 &&
    i.stopPercent < 50 &&
    i.accountSize > 0 &&
    i.riskPercent > 0 &&
    i.riskPercent <= 20 &&
    i.recentHigh >= 0 &&
    i.targetR > 0 &&
    i.commission >= 0 &&
    i.gapPercent >= 0;
  const errorMsg = valid
    ? ""
    : "Enter a positive entry price, account size and risk percentage (up to 20%), a stop between 0% and 50%, and non-negative high price, target, commission and gap inputs.";

  return {
    valid,
    errorMsg,
    entryPrice: entry,
    stopPrice,
    riskPerShare,
    riskBudget,
    shares,
    capitalRequired,
    capitalShare: i.accountSize > 0 ? (capitalRequired / i.accountSize) * 100 : 0,
    actualRisk,
    targetPrice,
    trailingStop,
    gapLoss,
    commissionCost,
    breakevenWinRate,
    rewardRisk,
    rows,
    summary: [
      { label: "Entry Price", value: money2(entry) },
      { label: "Stop Price", value: money2(stopPrice), tone: "text-destructive" },
      { label: "Stop Distance", value: fmt(stopPercent, 2) + "%" },
      { label: "Risk per Share", value: money2(riskPerShare) },
      { label: "Risk Budget", value: money(riskBudget), tone: "text-primary" },
      { label: "Max Shares", value: shares.toLocaleString("en-US") },
      { label: "Capital Required", value: money(capitalRequired) },
      { label: "Capital as % of Account", value: fmt((capitalRequired / Math.max(i.accountSize, 1)) * 100, 2) + "%" },
      { label: "Risk Taken", value: money(actualRisk), tone: "text-destructive" },
      { label: "Risk as % of Account", value: fmt((actualRisk / Math.max(i.accountSize, 1)) * 100, 2) + "%" },
      { label: "Target Price", value: money2(targetPrice), tone: "text-emerald-600" },
      { label: "Reward:Risk", value: fmt(rewardRisk, 2) + " : 1" },
      { label: "Break-Even Win Rate", value: fmt(breakevenWinRate, 1) + "%" },
      { label: "Trailing Stop From High", value: money2(trailingStop) },
      { label: "Loss If Gapped Below Stop", value: money(gapLoss), tone: "text-destructive" },
      { label: "Round-Trip Commissions", value: money2(commissionCost) },
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

export default function StopLossPercentageCalculator() {
  const [entryPrice, setEntryPrice] = useState(String(DEFAULTS.entryPrice));
  const [stopPercent, setStopPercent] = useState(String(DEFAULTS.stopPercent));
  const [accountSize, setAccountSize] = useState(String(DEFAULTS.accountSize));
  const [riskPercent, setRiskPercent] = useState(String(DEFAULTS.riskPercent));
  const [recentHigh, setRecentHigh] = useState(String(DEFAULTS.recentHigh));
  const [targetR, setTargetR] = useState(String(DEFAULTS.targetR));
  const [commission, setCommission] = useState(String(DEFAULTS.commission));
  const [gapPercent, setGapPercent] = useState(String(DEFAULTS.gapPercent));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): StopLossInputs => ({
    entryPrice: parseFloat(entryPrice) || 0,
    stopPercent: parseFloat(stopPercent) || 0,
    accountSize: parseFloat(accountSize) || 0,
    riskPercent: parseFloat(riskPercent) || 0,
    recentHigh: parseFloat(recentHigh) || 0,
    targetR: parseFloat(targetR) || 0,
    commission: parseFloat(commission) || 0,
    gapPercent: parseFloat(gapPercent) || 0,
  });

  const [results, setResults] = useState<StopLossResult>(() => compute(DEFAULTS));

  const runCalculate = () => setResults(compute(getInputs()));

  const reset = () => {
    setEntryPrice(String(DEFAULTS.entryPrice));
    setStopPercent(String(DEFAULTS.stopPercent));
    setAccountSize(String(DEFAULTS.accountSize));
    setRiskPercent(String(DEFAULTS.riskPercent));
    setRecentHigh(String(DEFAULTS.recentHigh));
    setTargetR(String(DEFAULTS.targetR));
    setCommission(String(DEFAULTS.commission));
    setGapPercent(String(DEFAULTS.gapPercent));
    setResults(compute(DEFAULTS));
  };

  const faqs = [
    {
      question: "How do you convert a stop-loss percentage into a position size?",
      answer:
        "First work out the dollar risk per share: the entry price multiplied by the stop percentage. Then decide the maximum you are willing to lose on the trade, usually a small percentage of the account. Divide that risk budget by the risk per share to get the maximum number of shares. The stop sets the loss per share; the position size sets how many shares that loss is multiplied by, and together they cap the damage from any single trade.",
    },
    {
      question: "Why not just invest a fixed dollar amount in every trade?",
      answer:
        "Because a fixed dollar amount gives every trade a different level of risk. A $5,000 position in a quiet utility with a 4% stop risks $200, while the same $5,000 in a volatile small cap with a 15% stop risks $750. Sizing from the stop makes risk, not capital, the constant, so no single bad trade can undo months of good ones.",
    },
    {
      question: "What is a trailing stop?",
      answer:
        "A trailing stop moves the exit level up as the price advances, typically staying a fixed percentage below the highest price reached. It converts an open profit into a protected one without requiring a judgement call. The calculator shows the trailing stop implied by the most recent high you enter, using the same percentage as the initial stop.",
    },
    {
      question: "What is gap risk and why does it matter?",
      answer:
        "A stop order is not a guarantee of the stop price. If a stock gaps down overnight below your stop — on an earnings miss or bad news — you are filled at the next available price, which can be materially lower. The gap-risk field models exactly that: it shows the loss if the exit fills the gap percentage below the stop, which is the realistic worst case for a long position.",
    },
    {
      question: "What win rate do I need for a 2:1 reward-to-risk trade?",
      answer:
        "A third. With a 2R target you win twice your risk on winners and lose one unit on losers, so the break-even hit rate is one divided by one plus the reward-to-risk ratio — 33.3% at 2R, 25% at 3R, and 50% at 1R. Commissions and slippage push the required rate slightly higher, which is why the calculator also reports the round-trip commission cost.",
    },
    {
      question: "Should the stop percentage depend on the stock's volatility?",
      answer:
        "Yes. A fixed 8% stop is far too tight for a stock that routinely moves 6% a day and unnecessarily wide for a stable dividend payer. Traders often set the stop from average true range or recent support levels and then read the resulting percentage off the tool: enter the price where the stop actually belongs, and the calculator will tell you the percentage and the position size that fits your risk budget.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Stop-Loss Percentage Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Stop-Loss Percentage Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Trade Setup">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="entry-price"
                  label="Entry Price"
                  value={entryPrice}
                  onChange={setEntryPrice}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0.01"
                  step="0.1"
                  tooltip="The price you pay per share, or the planned entry."
                />
                <CompactInput
                  id="stop-percent"
                  label="Stop-Loss"
                  value={stopPercent}
                  onChange={setStopPercent}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0.1"
                  max="49"
                  step="0.5"
                  tooltip="How far below entry the stop sits, as a percentage of the entry price."
                />
                <CompactInput
                  id="account-size"
                  label="Account Size"
                  value={accountSize}
                  onChange={setAccountSize}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  step="1000"
                  tooltip="Total trading capital, used to convert the risk percentage into dollars."
                />
                <CompactInput
                  id="risk-percent"
                  label="Risk per Trade"
                  value={riskPercent}
                  onChange={setRiskPercent}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0.1"
                  max="20"
                  step="0.1"
                  tooltip="The share of the account you are willing to lose if the stop is hit; 0.5% to 2% is the common range."
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
                  <SubSection title="Exit Planning">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="recent-high"
                        label="Recent High"
                        value={recentHigh}
                        onChange={setRecentHigh}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        step="0.5"
                        tooltip="The highest price reached since entry, used to compute the trailing stop level."
                      />
                      <CompactInput
                        id="target-r"
                        label="Target (R Multiple)"
                        value={targetR}
                        onChange={setTargetR}
                        onEnter={runCalculate}
                        suffix="R"
                        min="0.5"
                        max="10"
                        step="0.5"
                        tooltip="Profit target expressed as a multiple of the risk per share."
                      />
                      <CompactInput
                        id="commission"
                        label="Commission per Order"
                        value={commission}
                        onChange={setCommission}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        step="0.5"
                        tooltip="Broker fee per order; the calculator counts a round trip of two orders."
                      />
                      <CompactInput
                        id="gap-percent"
                        label="Gap Risk"
                        value={gapPercent}
                        onChange={setGapPercent}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        max="20"
                        step="0.5"
                        tooltip="How far below the stop the exit might fill in a fast market, turning the stop into a larger loss."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Risk Rules">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      The position size is capped so that the total loss at the stop equals the risk budget, rounded down to
                      whole shares. Capital required is what the position costs at the entry price, which can exceed the risk
                      budget several times over — a tight stop buys more shares for the same risk. Gaps below the stop are the
                      one risk no stop order can eliminate.
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Position Size</div>
              <div className="text-4xl font-extrabold mb-1 tracking-tight text-foreground">
                {results.shares.toLocaleString("en-US")} shares
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {money2(results.capitalRequired)} at {money2(results.entryPrice)} · risk {money(results.actualRisk)} (
                {fmt((results.actualRisk / Math.max(results.riskBudget, 1)) * 100, 1)}% of budget)
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Stop Price</span>
                <span className="font-extrabold text-destructive">{money2(results.stopPrice)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Target Price</span>
                <span className="font-extrabold text-emerald-600">{money2(results.targetPrice)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Risk Budget</span>
                <span className="font-extrabold text-foreground">{money(results.riskBudget)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Stop</th>
                    <th className="p-2.5 text-right w-[95px]">Stop Price</th>
                    <th className="p-2.5 text-right w-[105px]">Risk/Share</th>
                    <th className="p-2.5 text-right w-[95px]">Shares</th>
                    <th className="p-2.5 text-right w-[105px]">Capital</th>
                    <th className="p-2.5 pr-3 text-right w-[95px]">Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.rows.map((row) => (
                    <tr key={row.stopPercent} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">-{fmt(row.stopPercent, 1)}%</td>
                      <td className="p-2.5 text-right text-foreground">{money2(row.stopPrice)}</td>
                      <td className="p-2.5 text-right text-destructive">{money2(row.riskPerShare)}</td>
                      <td className="p-2.5 text-right text-foreground">{row.shares.toLocaleString("en-US")}</td>
                      <td className="p-2.5 text-right text-foreground">{money(row.capital)}</td>
                      <td className="p-2.5 pr-3 text-right text-emerald-600">{money2(row.target)}</td>
                    </tr>
                  ))}
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
            <h2 className="text-2xl font-bold mb-3">What Is a Stop-Loss Percentage Calculator?</h2>
            <p>
              A stop-loss percentage calculator turns two decisions — where to place the stop and how much to buy — into
              one. The stop percentage defines the loss per share; your risk budget defines the total loss you are prepared
              to accept. Dividing one by the other gives the position size. Traders use the tool to answer the question that
              actually governs survival: not &quot;how much can I afford to buy&quot; but &quot;how many shares can I own
              before a normal loss becomes a meaningful one&quot;.
            </p>
            <p>
              It also converts the level into the prices that matter after entry: the trailing stop as the position
              advances, the profit target implied by a chosen reward-to-risk multiple, and the loss if the market gaps
              straight through the stop. Together they describe a complete trade plan rather than a single exit price.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The stop price is the entry price reduced by the stop percentage. The difference between entry and stop is the
              risk per share. Your risk budget is the account size multiplied by the risk percentage — the dollars you accept
              losing on this trade. The maximum position is the risk budget divided by the risk per share, rounded down to a
              whole number of shares. Capital required is that share count times the entry price, and it is often several
              times the risk budget: a 5% stop means each dollar of risk controls twenty dollars of stock, while a 20% stop
              controls only five.
            </p>
            <p>
              The target price comes from the reward-to-risk multiple. At 2R the target sits two risk units above entry, so
              a winner returns twice what a loser costs. That ratio determines the minimum win rate that avoids losing money:
              the break-even hit rate is one divided by one plus the ratio, which is 33.3% at 2R and 25% at 3R. The
              calculator shows it alongside the round-trip commissions, because costs raise the bar slightly above the
              theoretical figure.
            </p>
            <p>
              Gap risk is the honest caveat. A stop order becomes a market order once it is triggered, so a price that jumps
              from above the stop to well below it — an earnings gap, a halt, a takeover headline — fills at whatever the
              next trade is. The gap field models the loss in that case, and it is normally the largest number in the
              summary.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card gives the position size and the capital it ties up, with the dollar risk underneath. The three
              statistics beside it show the stop price, the target price and the risk budget. The ladder table is the part
              worth studying: it recomputes the trade at 4%, 6%, 8%, 10% and 12% stops so you can see the trade-off directly.
              Tighter stops buy more shares for the same risk but are hit more often; wider stops need fewer shares and less
              capital but expose more to a gap.
            </p>
            <p>
              Summary Statistics adds the stop distance, risk per share, the risk as a percentage of the account, the
              capital as a percentage of the account, the break-even win rate, the trailing stop from the recent high, the
              gapped loss and the commission cost. A practical use: keep the risk budget fixed at 1% of the account and watch
              how the required capital changes as you tighten the stop. If the capital figure exceeds what your account can
              actually fund, the trade is too large regardless of the risk maths — cash constraints bind before risk does.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/stop-loss-percentage-calculator" />
          <PopularCalculators exclude="/calculator/stop-loss-percentage-calculator" />
        </div>
      </div>
    </>
  );
}
