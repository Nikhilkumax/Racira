"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface ConcentrationInputs {
  portfolio: number;
  largest: number;
  second: number;
  third: number;
  remainingCount: number;
  largestVol: number;
  portfolioVol: number;
  targetWeight: number;
}

const DEFAULTS: ConcentrationInputs = {
  portfolio: 500000,
  largest: 120000,
  second: 70000,
  third: 45000,
  remainingCount: 12,
  largestVol: 45,
  portfolioVol: 16,
  targetWeight: 10,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "—";

const money2 = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";

interface PositionRow {
  name: string;
  value: number;
  weight: number;
  hhiContribution: number;
  dropImpact: number;
}

interface ConcentrationResult {
  valid: boolean;
  errorMsg: string;
  topWeight: number;
  topThreeWeight: number;
  remainingWeight: number;
  remainingValue: number;
  hhi: number;
  effectivePositions: number;
  verdict: string;
  verdictTone: string;
  drawdownImpact: number;
  drawdownDollars: number;
  riskContribution: number;
  trimAmount: number;
  targetValue: number;
  largestShareOfRisk: number;
  rows: PositionRow[];
  summary: { label: string; value: string; tone?: string }[];
}

function compute(i: ConcentrationInputs): ConcentrationResult {
  const portfolio = Math.max(1, i.portfolio);
  const positions = [Math.max(0, i.largest), Math.max(0, i.second), Math.max(0, i.third)];
  const topSum = positions.reduce((a, b) => a + b, 0);
  const remainingValue = Math.max(0, portfolio - topSum);
  const remainingCount = Math.max(0, Math.round(i.remainingCount));
  const w1 = positions[0] / portfolio;
  const w2 = positions[1] / portfolio;
  const w3 = positions[2] / portfolio;
  const restWeight = remainingValue / portfolio;

  const hhi = w1 * w1 + w2 * w2 + w3 * w3 + (remainingCount > 0 ? (restWeight * restWeight) / remainingCount : restWeight * restWeight);
  const effectivePositions = hhi > 0 ? 1 / hhi : 0;
  const topThreeWeight = w1 + w2 + w3;

  const verdict =
    hhi >= 0.25 ? "Highly concentrated" : hhi >= 0.15 ? "Moderately concentrated" : hhi >= 0.08 ? "Broadly diversified" : "Very diversified";
  const verdictTone =
    hhi >= 0.25 ? "text-destructive" : hhi >= 0.15 ? "text-foreground" : "text-emerald-600";

  const drawdownImpact = 0.5 * w1 * 100;
  const drawdownDollars = 0.5 * positions[0];
  // Volatility contribution of the largest holding assuming it moves with the
  // portfolio (correlation 1) — an upper bound on its share of portfolio risk.
  const riskContribution = i.portfolioVol > 0 ? (w1 * i.largestVol) / i.portfolioVol : 0;
  const targetWeight = Math.max(0, i.targetWeight) / 100;
  const targetValue = targetWeight * portfolio;
  const trimAmount = Math.max(0, positions[0] - targetValue);

  const rows: PositionRow[] = [
    { name: "Largest position", value: positions[0], weight: w1, hhiContribution: w1 * w1, dropImpact: 0.5 * positions[0] },
    { name: "Second position", value: positions[1], weight: w2, hhiContribution: w2 * w2, dropImpact: 0.5 * positions[1] },
    { name: "Third position", value: positions[2], weight: w3, hhiContribution: w3 * w3, dropImpact: 0.5 * positions[2] },
    {
      name: remainingCount > 0 ? `Remaining ${remainingCount} positions` : "Remaining positions",
      value: remainingValue,
      weight: restWeight,
      hhiContribution: remainingCount > 0 ? (restWeight * restWeight) / remainingCount : restWeight * restWeight,
      dropImpact: 0.5 * remainingValue,
    },
  ];

  const valid =
    i.portfolio > 0 &&
    i.largest >= 0 &&
    i.second >= 0 &&
    i.third >= 0 &&
    topSum <= portfolio &&
    i.remainingCount >= 0 &&
    i.largestVol >= 0 &&
    i.portfolioVol >= 0 &&
    i.targetWeight >= 0 &&
    i.targetWeight <= 100;
  const errorMsg = valid
    ? ""
    : "Enter a positive portfolio value, non-negative position values that together do not exceed the portfolio, and valid counts, volatilities and target weight.";

  return {
    valid,
    errorMsg,
    topWeight: w1 * 100,
    topThreeWeight: topThreeWeight * 100,
    remainingWeight: restWeight * 100,
    remainingValue,
    hhi,
    effectivePositions,
    verdict,
    verdictTone,
    drawdownImpact,
    drawdownDollars,
    riskContribution: riskContribution * 100,
    trimAmount,
    targetValue,
    largestShareOfRisk: topThreeWeight > 0 ? (w1 / topThreeWeight) * 100 : 0,
    rows,
    summary: [
      { label: "Portfolio Value", value: money(portfolio) },
      { label: "Largest Position", value: money(positions[0]) },
      { label: "Largest Weight", value: fmt(w1 * 100, 2) + "%", tone: w1 > 0.2 ? "text-destructive" : "text-foreground" },
      { label: "Top Three Weight", value: fmt(topThreeWeight * 100, 1) + "%" },
      { label: "Remaining Positions", value: `${remainingCount} worth ${money(remainingValue)}` },
      { label: "Herfindahl Index", value: fmt(hhi, 4) },
      { label: "Effective Number of Positions", value: fmt(effectivePositions, 1), tone: "text-primary" },
      { label: "Concentration Verdict", value: verdict, tone: verdictTone },
      { label: "Largest Position Down 50%", value: fmt(drawdownImpact, 2) + "% of portfolio", tone: "text-destructive" },
      { label: "Dollar Impact of That Drop", value: money(drawdownDollars), tone: "text-destructive" },
      { label: "Largest Share of Portfolio Risk", value: fmt(riskContribution * 100, 1) + "%" },
      { label: "Target Weight", value: fmt(i.targetWeight, 2) + "%" },
      { label: "Trim Needed to Target", value: money(trimAmount), tone: trimAmount > 0 ? "text-primary" : "text-emerald-600" },
      { label: "Target Position Value", value: money(targetValue) },
      { label: "Remaining Weight", value: fmt(restWeight * 100, 2) + "%" },
      { label: "Largest Share of Top Three", value: fmt(topThreeWeight > 0 ? (w1 / topThreeWeight) * 100 : 0, 1) + "%" },
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

export default function InvestmentConcentrationRiskCalculator() {
  const [portfolio, setPortfolio] = useState(String(DEFAULTS.portfolio));
  const [largest, setLargest] = useState(String(DEFAULTS.largest));
  const [second, setSecond] = useState(String(DEFAULTS.second));
  const [third, setThird] = useState(String(DEFAULTS.third));
  const [remainingCount, setRemainingCount] = useState(String(DEFAULTS.remainingCount));
  const [largestVol, setLargestVol] = useState(String(DEFAULTS.largestVol));
  const [portfolioVol, setPortfolioVol] = useState(String(DEFAULTS.portfolioVol));
  const [targetWeight, setTargetWeight] = useState(String(DEFAULTS.targetWeight));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): ConcentrationInputs => ({
    portfolio: parseFloat(portfolio) || 0,
    largest: parseFloat(largest) || 0,
    second: parseFloat(second) || 0,
    third: parseFloat(third) || 0,
    remainingCount: parseFloat(remainingCount) || 0,
    largestVol: parseFloat(largestVol) || 0,
    portfolioVol: parseFloat(portfolioVol) || 0,
    targetWeight: parseFloat(targetWeight) || 0,
  });

  const [results, setResults] = useState<ConcentrationResult>(() => compute(DEFAULTS));

  const runCalculate = () => setResults(compute(getInputs()));

  const reset = () => {
    setPortfolio(String(DEFAULTS.portfolio));
    setLargest(String(DEFAULTS.largest));
    setSecond(String(DEFAULTS.second));
    setThird(String(DEFAULTS.third));
    setRemainingCount(String(DEFAULTS.remainingCount));
    setLargestVol(String(DEFAULTS.largestVol));
    setPortfolioVol(String(DEFAULTS.portfolioVol));
    setTargetWeight(String(DEFAULTS.targetWeight));
    setResults(compute(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is concentration risk?",
      answer:
        "Concentration risk is the danger that a single holding is large enough to determine your outcome. Diversification works by spreading capital across many independent risks so that no single failure is decisive; concentration reverses that, and the portfolio's fate becomes the fate of one company, sector or property. It is not automatically bad — concentrated investors are deliberately accepting idiosyncratic risk in exchange for the chance of a large gain — but it should be a choice, not an accident of an old position growing.",
    },
    {
      question: "What is the Herfindahl-Hirschman Index?",
      answer:
        "The HHI is the sum of the squared weights of every position in the portfolio. Squaring punishes large weights disproportionately: a portfolio of twenty equal positions has an HHI of 0.05, while one with a single 60% position and the rest spread evenly has an HHI above 0.36. The index is used by competition regulators for market concentration and transferred directly to portfolio analysis because the arithmetic is identical.",
    },
    {
      question: "What does the effective number of positions mean?",
      answer:
        "It is one divided by the HHI, and it answers the question a position count cannot: how many genuinely independent, equally sized bets does this portfolio resemble? A portfolio with forty holdings where the top three are 60% of the value may have an effective count of five or six. It is the honest measure of diversification, because a hundred tiny positions do nothing to offset one dominant one.",
    },
    {
      question: "Why does a 50% fall in the largest position matter so much?",
      answer:
        "Because the dollar loss scales with the weight. A position at 24% of a $500,000 portfolio losing half its value costs $60,000 — 12% of the entire portfolio — and that is a single stock behaving normally, not a crash. Concentrated positions are also usually more volatile than the portfolio average, which is why the risk-contribution figure can exceed the weight itself.",
    },
    {
      question: "How do I reduce concentration without triggering a large tax bill?",
      answer:
        "Options include trimming gradually over several tax years to stay inside lower brackets, donating appreciated shares to a donor-advised fund, using the position as collateral for a loan rather than selling, and directing new contributions to other holdings so the weight declines naturally. Each has different costs; the practical sequence is usually to stop adding, then trim in tranches, then consider charitable or estate strategies for the remainder.",
    },
    {
      question: "Is concentration always a mistake?",
      answer:
        "No. Owners of a business, founders with equity compensation and investors with genuine information advantages all concentrate deliberately, and many have built large fortunes that way. The risks are real but so is the opportunity. What the calculator provides is the arithmetic: how much of a drawdown the portfolio absorbs, how many independent bets it actually holds, and how much would have to be sold to reach a target weight.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Investment Concentration Risk Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Investment Concentration Risk Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Portfolio & Positions">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="portfolio"
                  label="Total Portfolio"
                  value={portfolio}
                  onChange={setPortfolio}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  step="10000"
                  tooltip="Market value of the whole portfolio, including cash."
                />
                <CompactInput
                  id="largest"
                  label="Largest Position"
                  value={largest}
                  onChange={setLargest}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  step="5000"
                  tooltip="Value of the single biggest holding."
                />
                <CompactInput
                  id="second"
                  label="Second Position"
                  value={second}
                  onChange={setSecond}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  step="5000"
                  tooltip="Value of the second biggest holding."
                />
                <CompactInput
                  id="third"
                  label="Third Position"
                  value={third}
                  onChange={setThird}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  step="5000"
                  tooltip="Value of the third biggest holding."
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
                  <SubSection title="Remainder & Risk">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="remaining-count"
                        label="Remaining Positions"
                        value={remainingCount}
                        onChange={setRemainingCount}
                        onEnter={runCalculate}
                        min="0"
                        max="500"
                        step="1"
                        tooltip="Number of other holdings, assumed equal in weight for the index calculation."
                      />
                      <CompactInput
                        id="largest-vol"
                        label="Largest Position Volatility"
                        value={largestVol}
                        onChange={setLargestVol}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        max="200"
                        step="1"
                        tooltip="Annualised volatility of the biggest holding; single stocks commonly run 30–60%."
                      />
                      <CompactInput
                        id="portfolio-vol"
                        label="Portfolio Volatility"
                        value={portfolioVol}
                        onChange={setPortfolioVol}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        max="100"
                        step="0.5"
                        tooltip="Annualised volatility of the whole portfolio, used to estimate the largest position's share of risk."
                      />
                      <CompactInput
                        id="target-weight"
                        label="Target Weight"
                        value={targetWeight}
                        onChange={setTargetWeight}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        max="100"
                        step="1"
                        tooltip="The weight you would like the largest position to carry; the calculator shows the sale needed."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Reading the Index">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      The Herfindahl index sums the squared weight of every holding. Below 0.08 is broadly diversified,
                      0.08–0.15 is acceptable, 0.15–0.25 is moderately concentrated and above 0.25 is highly concentrated.
                      Its reciprocal is the effective number of positions — the count of equal-sized bets the portfolio
                      really resembles. The risk contribution assumes the largest holding moves with the portfolio, so it is
                      an upper bound.
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Effective Number of Positions</div>
              <div className="text-4xl font-extrabold mb-1 tracking-tight text-foreground">{fmt(results.effectivePositions, 1)}</div>
              <div className="text-sm text-muted-foreground font-medium">
                HHI {fmt(results.hhi, 4)} · {results.verdict} · largest position {fmt(results.topWeight, 1)}% of the portfolio
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Top Three Weight</span>
                <span className="font-extrabold text-foreground">{fmt(results.topThreeWeight, 1)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">50% Drop Impact</span>
                <span className="font-extrabold text-destructive">{fmt(results.drawdownImpact, 2)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Trim to Target</span>
                <span className="font-extrabold text-primary">{money(results.trimAmount)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Holding</th>
                    <th className="p-2.5 text-right w-[115px]">Value</th>
                    <th className="p-2.5 text-right w-[90px]">Weight</th>
                    <th className="p-2.5 text-right w-[105px]">HHI Share</th>
                    <th className="p-2.5 pr-3 text-right w-[120px]">50% Drop Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.rows.map((row) => (
                    <tr key={row.name} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.name}</td>
                      <td className="p-2.5 text-right text-foreground">{money(row.value)}</td>
                      <td className="p-2.5 text-right text-foreground">{fmt(row.weight * 100, 2)}%</td>
                      <td className="p-2.5 text-right text-foreground">{fmt(row.hhiContribution, 4)}</td>
                      <td className="p-2.5 pr-3 text-right text-destructive">{money(row.dropImpact)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Portfolio total</td>
                    <td className="p-2.5 text-right text-foreground">
                      {money(results.rows.reduce((acc, r) => acc + r.value, 0))}
                    </td>
                    <td className="p-2.5 text-right text-foreground">100%</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(results.hhi, 4)}</td>
                    <td className="p-2.5 pr-3 text-right text-destructive">
                      {money(results.rows.reduce((acc, r) => acc + r.dropImpact, 0))}
                    </td>
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
            <h2 className="text-2xl font-bold mb-3">What Is an Investment Concentration Risk Calculator?</h2>
            <p>
              An investment concentration risk calculator measures how much of your outcome depends on a handful of holdings.
              Position counts flatter a portfolio — forty holdings sounds diversified until you notice that three of them
              account for most of the value. The tool computes the Herfindahl index, converts it into the effective number of
              positions, and translates concentration into the two quantities that concentrate investors actually care about:
              the drawdown one bad holding would cause, and how much would have to be sold to bring the weight back to a
              target.
            </p>
            <p>
              Concentration is normal. It is created by employee stock, by shares inherited or held for decades, by a founder
              who never sold, and by an old position that simply grew faster than everything around it. The risk is not that
              concentration exists, but that it exists without anyone having decided to accept it.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The Herfindahl index sums the squared weight of each holding. Squaring is what makes the index superior to a
              simple weight count: a 25% position contributes 0.0625, four times as much as a 12.5% position even though it is
              only twice as large. The reciprocal of the index is the effective number of positions — the number of
              equally-sized, independent bets the portfolio genuinely resembles. In the default example the largest position
              is 24% of the portfolio, the top three are 47%, and the effective count is about 9.2 out of the fifteen
              holdings listed.
            </p>
            <p>
              The drawdown figures follow directly from the weights. A 50% fall in the largest position costs 12% of the
              portfolio in the default example, and the table shows the same arithmetic for the second, third and remaining
              holdings. The trim figure compares the current weight with your target: selling the excess and reinvesting it
              elsewhere leaves the portfolio value unchanged, so the calculation is simply the current position minus the
              target weight multiplied by the total.
            </p>
            <p>
              Risk contribution adds a second dimension. A concentrated holding is usually more volatile than the portfolio
              as a whole, and dividing the largest position&apos;s weighted volatility by the portfolio&apos;s volatility
              gives an upper-bound estimate of its share of total risk. When a holding is 24% of the value but roughly
              two-thirds of the risk, the portfolio is far more exposed than the weight suggests.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the effective number of positions with the index, the verdict and the largest weight. The
              three statistics beside it give the top-three weight, the portfolio impact of a 50% fall in the largest holding,
              and the amount that would need to be sold to reach your target weight. Summary Statistics adds the dollar loss
              from that fall, the largest position&apos;s estimated share of portfolio risk, the remaining weight and the
              largest position&apos;s share of the top three.
            </p>
            <p>
              A practical way to use the tool is to test reductions before making them: enter a lower target weight and watch
              the trim figure, then re-enter the portfolio as if the sale had happened to see the new effective count. The
              remaining decision is tax and timing rather than arithmetic — spreading sales across tax years, using
              charitable giving, or directing new contributions away from the concentrated holding so the weight declines
              without a sale.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/investment-concentration-risk-calculator" />
          <PopularCalculators exclude="/calculator/investment-concentration-risk-calculator" />
        </div>
      </div>
    </>
  );
}
