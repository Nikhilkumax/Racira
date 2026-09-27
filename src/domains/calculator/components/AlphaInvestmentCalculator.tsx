"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface AlphaInputs {
  portfolioReturn: number;
  marketReturn: number;
  riskFree: number;
  beta: number;
  portfolioValue: number;
  volatility: number;
  trackingError: number;
}

const DEFAULTS: AlphaInputs = {
  portfolioReturn: 12,
  marketReturn: 10,
  riskFree: 4,
  beta: 1.1,
  portfolioValue: 100000,
  volatility: 18,
  trackingError: 4,
};

const BETA_LADDER = [0.6, 0.8, 1.0, 1.2, 1.4, 1.6];

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "—";

interface BetaRow {
  beta: number;
  required: number;
  alpha: number;
  verdict: string;
}

interface AlphaResult {
  valid: boolean;
  errorMsg: string;
  expectedReturn: number;
  portfolioValue: number;
  alpha: number;
  alphaDollars: number;
  activeReturn: number;
  excessOverRiskFree: number;
  sharpe: number;
  treynor: number;
  informationRatio: number;
  downsideCaptureNote: string;
  rows: BetaRow[];
  summary: { label: string; value: string; tone?: string }[];
}

function compute(i: AlphaInputs): AlphaResult {
  const rf = i.riskFree;
  const marketPremium = i.marketReturn - rf;
  const expectedReturn = rf + i.beta * marketPremium;
  const alpha = i.portfolioReturn - expectedReturn;
  const alphaDollars = (alpha / 100) * Math.max(0, i.portfolioValue);
  const activeReturn = i.portfolioReturn - i.marketReturn;
  const excessOverRiskFree = i.portfolioReturn - rf;
  const sharpe = i.volatility > 0 ? excessOverRiskFree / i.volatility : 0;
  const treynor = i.beta !== 0 ? excessOverRiskFree / i.beta : 0;
  const informationRatio = i.trackingError > 0 ? activeReturn / i.trackingError : 0;

  const rows: BetaRow[] = BETA_LADDER.map((beta) => {
    const required = rf + beta * marketPremium;
    const a = i.portfolioReturn - required;
    return {
      beta,
      required,
      alpha: a,
      verdict: a > 0.5 ? "Outperformed" : a < -0.5 ? "Underperformed" : "In line",
    };
  });

  const valid =
    i.portfolioReturn > -100 &&
    i.portfolioReturn < 200 &&
    i.marketReturn > -100 &&
    i.marketReturn < 200 &&
    i.riskFree > -20 &&
    i.riskFree < 30 &&
    i.beta >= 0 &&
    i.beta <= 4 &&
    i.portfolioValue >= 0 &&
    i.volatility >= 0 &&
    i.trackingError >= 0;
  const errorMsg = valid
    ? ""
    : "Enter returns between -100% and 200%, a risk-free rate between -20% and 30%, a beta between 0 and 4, and non-negative portfolio value, volatility and tracking error.";

  return {
    valid,
    errorMsg,
    expectedReturn,
    portfolioValue: Math.max(0, i.portfolioValue),
    alpha,
    alphaDollars,
    activeReturn,
    excessOverRiskFree,
    sharpe,
    treynor,
    informationRatio,
    downsideCaptureNote:
      alpha > 0
        ? "The portfolio beat the return its beta required, so the manager added skill or took unrewarded risk that paid off."
        : alpha < 0
        ? "The portfolio fell short of the return its beta required — the risk taken was not compensated."
        : "The portfolio delivered exactly the return its beta implied.",
    rows,
    summary: [
      { label: "Portfolio Return", value: fmt(i.portfolioReturn, 2) + "%" },
      { label: "Market Return", value: fmt(i.marketReturn, 2) + "%" },
      { label: "Risk-Free Rate", value: fmt(rf, 2) + "%" },
      { label: "Beta", value: fmt(i.beta, 2) },
      { label: "Market Risk Premium", value: fmt(marketPremium, 2) + "%" },
      { label: "CAPM Expected Return", value: fmt(expectedReturn, 2) + "%" },
      { label: "Jensen's Alpha", value: fmt(alpha, 2) + " pp", tone: alpha >= 0 ? "text-emerald-600" : "text-destructive" },
      { label: "Alpha in Dollars", value: money(alphaDollars), tone: alpha >= 0 ? "text-emerald-600" : "text-destructive" },
      { label: "Active Return vs Market", value: fmt(activeReturn, 2) + " pp" },
      { label: "Excess Over Risk-Free", value: fmt(excessOverRiskFree, 2) + " pp" },
      { label: "Volatility", value: fmt(i.volatility, 2) + "%" },
      { label: "Sharpe Ratio", value: fmt(sharpe, 3), tone: "text-primary" },
      { label: "Treynor Ratio", value: fmt(treynor, 2) + "%" },
      { label: "Tracking Error", value: fmt(i.trackingError, 2) + "%" },
      { label: "Information Ratio", value: fmt(informationRatio, 3) },
      { label: "Alpha per $10,000", value: money((alpha / 100) * 10000) },
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

export default function AlphaInvestmentCalculator() {
  const [portfolioReturn, setPortfolioReturn] = useState(String(DEFAULTS.portfolioReturn));
  const [marketReturn, setMarketReturn] = useState(String(DEFAULTS.marketReturn));
  const [riskFree, setRiskFree] = useState(String(DEFAULTS.riskFree));
  const [beta, setBeta] = useState(String(DEFAULTS.beta));
  const [portfolioValue, setPortfolioValue] = useState(String(DEFAULTS.portfolioValue));
  const [volatility, setVolatility] = useState(String(DEFAULTS.volatility));
  const [trackingError, setTrackingError] = useState(String(DEFAULTS.trackingError));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): AlphaInputs => ({
    portfolioReturn: parseFloat(portfolioReturn) || 0,
    marketReturn: parseFloat(marketReturn) || 0,
    riskFree: parseFloat(riskFree) || 0,
    beta: parseFloat(beta) || 0,
    portfolioValue: parseFloat(portfolioValue) || 0,
    volatility: parseFloat(volatility) || 0,
    trackingError: parseFloat(trackingError) || 0,
  });

  const [results, setResults] = useState<AlphaResult>(() => compute(DEFAULTS));

  const runCalculate = () => setResults(compute(getInputs()));

  const reset = () => {
    setPortfolioReturn(String(DEFAULTS.portfolioReturn));
    setMarketReturn(String(DEFAULTS.marketReturn));
    setRiskFree(String(DEFAULTS.riskFree));
    setBeta(String(DEFAULTS.beta));
    setPortfolioValue(String(DEFAULTS.portfolioValue));
    setVolatility(String(DEFAULTS.volatility));
    setTrackingError(String(DEFAULTS.trackingError));
    setResults(compute(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is alpha in investing?",
      answer:
        "Alpha is the return left over after adjusting for the risk taken. The capital asset pricing model says a portfolio with a beta of 1.1 should earn the risk-free rate plus 1.1 times the market risk premium; anything above that is positive alpha, anything below is negative. It is the standard way to judge whether a manager added value or simply took more risk and got paid for it.",
    },
    {
      question: "What is beta?",
      answer:
        "Beta measures how much a portfolio moves relative to the market. A beta of 1.0 means it moves with the market, 1.5 means it amplifies market moves by half again, and 0.5 means it moves half as much. Beta is the risk that diversification cannot remove, and it is the only risk that CAPM compensates, which is why alpha is measured against the beta-adjusted benchmark rather than the raw index.",
    },
    {
      question: "How is Jensen's alpha calculated?",
      answer:
        "Subtract the CAPM expected return from the actual return. The expected return is the risk-free rate plus beta times the market risk premium, where the premium is the market return minus the risk-free rate. If the risk-free rate is 4%, the market returns 10% and the portfolio has a beta of 1.1, the expected return is 10.6%; an actual return of 12% leaves 1.4 percentage points of alpha.",
    },
    {
      question: "What is the difference between alpha and the Sharpe ratio?",
      answer:
        "Alpha measures performance relative to a benchmark at a given beta; the Sharpe ratio measures return per unit of total volatility. A portfolio can have positive alpha but a mediocre Sharpe ratio, or vice versa, because total volatility includes risk that is diversified away and not rewarded. Reporting both prevents a manager from being credited twice for the same risk taking.",
    },
    {
      question: "Why does alpha shrink over long periods?",
      answer:
        "Because alpha is measured per period and compounds against a benchmark that also compounds. A 1% annual edge sounds small, but it accumulates into a meaningful cumulative advantage; conversely, costs of 1–2% a year can erase alpha entirely. Studies repeatedly find that most active funds deliver negative alpha after fees, which is why the tool shows alpha in dollars as well as percentage points — the dollar figure is what a fee of the same size would consume.",
    },
    {
      question: "What is a good information ratio?",
      answer:
        "The information ratio divides active return by tracking error, measuring how efficiently a manager deviates from the benchmark. Above 0.5 is respectable, above 0.75 is strong, and above 1.0 sustained over many years is exceptional. A high active return with a huge tracking error produces a low ratio, which signals that the outperformance came from taking large bets rather than from repeatable skill.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Alpha (Investment) Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Alpha (Investment) Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Performance">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="portfolio-return"
                  label="Portfolio Return"
                  value={portfolioReturn}
                  onChange={setPortfolioReturn}
                  onEnter={runCalculate}
                  suffix="%"
                  min="-100"
                  max="200"
                  step="0.1"
                  tooltip="Annualised return actually earned over the period being measured."
                />
                <CompactInput
                  id="market-return"
                  label="Market Return"
                  value={marketReturn}
                  onChange={setMarketReturn}
                  onEnter={runCalculate}
                  suffix="%"
                  min="-100"
                  max="200"
                  step="0.1"
                  tooltip="Return of the benchmark index over the same period."
                />
                <CompactInput
                  id="risk-free"
                  label="Risk-Free Rate"
                  value={riskFree}
                  onChange={setRiskFree}
                  onEnter={runCalculate}
                  suffix="%"
                  min="-20"
                  max="30"
                  step="0.1"
                  tooltip="Yield on short-term government debt; typically 3–5%."
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
                  tooltip="Sensitivity to the market. 1.0 moves with the index; above 1 amplifies it."
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
                  <SubSection title="Risk Details">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="portfolio-value"
                        label="Portfolio Value"
                        value={portfolioValue}
                        onChange={setPortfolioValue}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        step="1000"
                        tooltip="Used to express alpha in dollars, which is what fees and withdrawals actually consume."
                      />
                      <CompactInput
                        id="volatility"
                        label="Volatility"
                        value={volatility}
                        onChange={setVolatility}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        max="80"
                        step="0.5"
                        tooltip="Annualised standard deviation of portfolio returns, needed for the Sharpe ratio."
                      />
                      <CompactInput
                        id="tracking-error"
                        label="Tracking Error"
                        value={trackingError}
                        onChange={setTrackingError}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        max="40"
                        step="0.5"
                        tooltip="Volatility of the difference between portfolio and benchmark returns, needed for the information ratio."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Reading Alpha">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Alpha is measured against the return your beta required, not against the raw index. The sensitivity table
                      re-runs the same portfolio return at betas from 0.6 to 1.6: if the sign of alpha flips across plausible
                      beta estimates, the outperformance depends more on the risk assumption than on manager skill.
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Jensen's Alpha</div>
              <div className={`text-4xl font-extrabold mb-1 tracking-tight ${results.alpha >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                {fmt(results.alpha, 2)} pp
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {money(results.alphaDollars)} on {money(results.portfolioValue)} of value · CAPM required {fmt(results.expectedReturn, 2)}%
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Sharpe Ratio</span>
                <span className="font-extrabold text-foreground">{fmt(results.sharpe, 3)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Information Ratio</span>
                <span className="font-extrabold text-foreground">{fmt(results.informationRatio, 3)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Active Return</span>
                <span className="font-extrabold text-foreground">{fmt(results.activeReturn, 2)} pp</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Assumed Beta</th>
                    <th className="p-2.5 text-right w-[150px]">Required Return</th>
                    <th className="p-2.5 text-right w-[110px]">Alpha</th>
                    <th className="p-2.5 pr-3 text-right w-[130px]">Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.rows.map((row) => (
                    <tr key={row.beta} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{fmt(row.beta, 1)}</td>
                      <td className="p-2.5 text-right text-foreground">{fmt(row.required, 2)}%</td>
                      <td className={`p-2.5 text-right font-semibold ${row.alpha >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                        {fmt(row.alpha, 2)} pp
                      </td>
                      <td className="p-2.5 pr-3 text-right text-muted-foreground">{row.verdict}</td>
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
            <h2 className="text-2xl font-bold mb-3">What Is an Alpha Calculator?</h2>
            <p>
              An alpha calculator measures whether an investment beat the return that its risk level required. Raw return is
              not enough to judge performance, because a portfolio holding volatile small caps should be expected to earn more
              than one holding treasury bills. Alpha isolates the part of the return that is not explained by that risk
              exposure, which is the part an investor is actually paying a manager to produce.
            </p>
            <p>
              The tool implements the capital asset pricing model, the standard framework used across the industry. It also
              reports the other risk-adjusted measures practitioners rely on — the Sharpe and Treynor ratios and the
              information ratio — because each answers a slightly different question about how efficiently the return was
              generated.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              CAPM states that the return an investment should earn equals the risk-free rate plus beta times the market risk
              premium, where the premium is the market return minus the risk-free rate. Beta measures how much the portfolio
              moves when the market moves: a beta of 1.2 means the portfolio is expected to gain 20% more than the market in
              up moves and lose 20% more in down moves. The difference between the actual return and this required return is
              Jensen&apos;s alpha.
            </p>
            <p>
              The supporting metrics use the same inputs differently. The Sharpe ratio divides the return above the risk-free
              rate by total volatility and measures reward per unit of total risk. The Treynor ratio divides the same excess
              return by beta and measures reward per unit of market risk. The information ratio divides active return — the
              difference from the benchmark — by tracking error, which shows how consistently the manager deviates from the
              index.
            </p>
            <p>
              The sensitivity table is the tool&apos;s reality check. It recomputes the required return and alpha at betas
              from 0.6 to 1.6. If alpha is comfortably positive at a beta of 1.1 but turns negative at 1.4, the outperformance
              cannot be separated from the choice of risk assumption — which is exactly the ambiguity that makes alpha
              estimates fragile in practice.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows alpha in percentage points with its dollar equivalent, which is the figure that competes
              directly with management fees. The three statistics beside it report the Sharpe ratio, the information ratio
              and the active return versus the market. In the default example — a 12% portfolio return against a 10% market
              with a 4% risk-free rate and a beta of 1.1 — the required return is 10.6% and alpha is +1.4 points, or $1,400
              on a $100,000 portfolio.
            </p>
            <p>
              Summary Statistics collects the return inputs, the market risk premium, alpha in dollars and per $10,000
              invested, the excess return over cash, and the Treynor ratio alongside the Sharpe ratio. A reasonable rule of
              thumb: alpha below 1 point a year rarely survives the fees and taxes needed to pursue it, so a positive number
              should be read together with the expense ratio before concluding that skill was on display.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/alpha-investment-calculator" />
          <PopularCalculators exclude="/calculator/alpha-investment-calculator" />
        </div>
      </div>
    </>
  );
}
