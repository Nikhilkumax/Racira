"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface AngelInputs {
  initialInvestment: number;
  totalRoundSize: number;
  preMoneyValuation: number;
  expectedExitValuation: number;
  timeToExitYears: number;
  futureDilution: number;
  targetMoic: number;
}

const DEFAULTS: AngelInputs = {
  initialInvestment: 50000,
  totalRoundSize: 1000000,
  preMoneyValuation: 4000000,
  expectedExitValuation: 50000000,
  timeToExitYears: 7,
  futureDilution: 20,
  targetMoic: 10,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface PathStep {
  label: string;
  year: number;
  value: number;
  multiple: number;
  isExit: boolean;
}

interface AngelResult {
  postMoneyValuation: number;
  ownershipAtInvestment: number;
  ownershipAtExit: number;
  exitProceeds: number;
  netProfit: number;
  roi: number;
  moic: number;
  irr: number;
  yearsToExit: number;
  requiredExitForTarget: number;
  exitShortfallVsTarget: number;
  dilutionPct: number;
  valuePerDollarAtExit: number;
  path: PathStep[];
  valid: boolean;
  errorMsg: string;
}

function computeAngel(i: AngelInputs): AngelResult {
  const invalid =
    i.initialInvestment <= 0 ||
    i.totalRoundSize <= 0 ||
    i.preMoneyValuation < 0 ||
    i.expectedExitValuation <= 0 ||
    i.timeToExitYears <= 0 ||
    i.futureDilution < 0 ||
    i.futureDilution >= 100 ||
    i.targetMoic <= 0 ||
    i.initialInvestment > i.totalRoundSize;

  const postMoneyValuation = i.preMoneyValuation + i.totalRoundSize;
  const ownershipAtInvestment = postMoneyValuation > 0 ? (i.initialInvestment / postMoneyValuation) * 100 : 0;
  const ownershipAtExit = ownershipAtInvestment * (1 - i.futureDilution / 100);
  const exitProceeds = i.expectedExitValuation * (ownershipAtExit / 100);
  const netProfit = exitProceeds - i.initialInvestment;
  const moic = i.initialInvestment > 0 ? exitProceeds / i.initialInvestment : 0;
  const roi = i.initialInvestment > 0 ? (netProfit / i.initialInvestment) * 100 : 0;
  const irr = i.timeToExitYears > 0 && moic > 0 ? (Math.pow(moic, 1 / i.timeToExitYears) - 1) * 100 : 0;

  const requiredExitForTarget =
    ownershipAtExit > 0 ? (i.targetMoic * i.initialInvestment) / (ownershipAtExit / 100) : 0;

  // Value path at the implied IRR, from entry to exit.
  const years = Math.max(1, Math.round(i.timeToExitYears));
  const marks = Array.from(new Set([0, Math.round(years * 0.25), Math.round(years * 0.5), Math.round(years * 0.75), years]));
  const path: PathStep[] = marks.map((year) => {
    const value = i.initialInvestment * Math.pow(1 + irr / 100, year);
    return {
      label: year === 0 ? "Entry" : year === years ? "Exit" : `Year ${year}`,
      year,
      value,
      multiple: i.initialInvestment > 0 ? value / i.initialInvestment : 0,
      isExit: year === years,
    };
  });

  return {
    postMoneyValuation,
    ownershipAtInvestment,
    ownershipAtExit,
    exitProceeds,
    netProfit,
    roi,
    moic,
    irr,
    yearsToExit: i.timeToExitYears,
    requiredExitForTarget,
    exitShortfallVsTarget: requiredExitForTarget - i.expectedExitValuation,
    dilutionPct: i.futureDilution,
    valuePerDollarAtExit: moic,
    path,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter an investment and exit valuation above zero, a round size at least as large as the investment, dilution below 100%, and an exit horizon above zero."
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

export default function AngelInvestmentReturnCalculator() {
  const [initialInvestment, setInitialInvestment] = useState(String(DEFAULTS.initialInvestment));
  const [totalRoundSize, setTotalRoundSize] = useState(String(DEFAULTS.totalRoundSize));
  const [preMoneyValuation, setPreMoneyValuation] = useState(String(DEFAULTS.preMoneyValuation));
  const [expectedExitValuation, setExpectedExitValuation] = useState(String(DEFAULTS.expectedExitValuation));
  const [timeToExitYears, setTimeToExitYears] = useState(String(DEFAULTS.timeToExitYears));
  const [futureDilution, setFutureDilution] = useState(String(DEFAULTS.futureDilution));
  const [targetMoic, setTargetMoic] = useState(String(DEFAULTS.targetMoic));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): AngelInputs => ({
    initialInvestment: parseFloat(initialInvestment) || 0,
    totalRoundSize: parseFloat(totalRoundSize) || 0,
    preMoneyValuation: parseFloat(preMoneyValuation) || 0,
    expectedExitValuation: parseFloat(expectedExitValuation) || 0,
    timeToExitYears: parseFloat(timeToExitYears) || 0,
    futureDilution: parseFloat(futureDilution) || 0,
    targetMoic: parseFloat(targetMoic) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<AngelInputs>(() => DEFAULTS);
  const [results, setResults] = useState<AngelResult>(() => computeAngel(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeAngel(inputs));
  };

  const reset = () => {
    setInitialInvestment(String(DEFAULTS.initialInvestment));
    setTotalRoundSize(String(DEFAULTS.totalRoundSize));
    setPreMoneyValuation(String(DEFAULTS.preMoneyValuation));
    setExpectedExitValuation(String(DEFAULTS.expectedExitValuation));
    setTimeToExitYears(String(DEFAULTS.timeToExitYears));
    setFutureDilution(String(DEFAULTS.futureDilution));
    setTargetMoic(String(DEFAULTS.targetMoic));
    setCalcInputs(DEFAULTS);
    setResults(computeAngel(DEFAULTS));
  };

  const faqs = [
    {
      question: "How is angel investment ownership calculated?",
      answer:
        "Ownership is the cheque divided by the post-money valuation, which is the pre-money valuation plus the size of the round. Writing a fifty thousand dollar cheque into a one million dollar round on a four million dollar pre-money values the company at five million post-money, so the stake is one percent. Everything else in the return calculation flows from that figure.",
    },
    {
      question: "Why does dilution matter so much?",
      answer:
        "Because later rounds sell new shares and shrink your percentage without taking anything from you directly. A one percent stake diluted twenty percent before exit becomes eight tenths of one percent, which cuts the exit proceeds by a fifth even if the company succeeds exactly as planned. Realistic modelling therefore applies expected dilution to the stake before calculating returns, not after.",
    },
    {
      question: "What is a good MOIC for an angel investment?",
      answer:
        "Conventional targets run from ten times invested capital for a single early-stage cheque to considerably more when accounting for the failures that never return anything. Because most early-stage investments return little or nothing, the winners have to carry the portfolio, which is why professionals underwrite each deal against a high target multiple rather than a market average.",
    },
    {
      question: "Is the IRR meaningful for a single deal?",
      answer:
        "It is useful for comparing a deal with other uses of the same money, because it converts a lump-sum multiple into an annual rate. A ten times return in seven years is about thirty-nine percent a year, and a five times return over the same period is about twenty-six percent. What IRR cannot do is capture the probability of failure, so pair it with how likely the exit valuation actually is.",
    },
  ];


  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Angel Investment Return Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Angel Investment Return Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="The Round">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="initial-investment"
                  label="Your Investment"
                  value={initialInvestment}
                  onChange={setInitialInvestment}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="The cheque you are writing in this round."
                />
                <CompactInput
                  id="round-size"
                  label="Total Round Size"
                  value={totalRoundSize}
                  onChange={setTotalRoundSize}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Total capital raised in the round."
                />
              </div>
              <div className="mt-3">
                <CompactInput
                  id="pre-money"
                  label="Pre-Money Valuation"
                  value={preMoneyValuation}
                  onChange={setPreMoneyValuation}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Company value agreed before the new money arrives."
                />
              </div>
            </SubSection>

            <SubSection title="The Exit">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="exit-valuation"
                  label="Exit Valuation"
                  value={expectedExitValuation}
                  onChange={setExpectedExitValuation}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Expected company value at exit."
                />
                <CompactInput
                  id="years"
                  label="Years to Exit"
                  value={timeToExitYears}
                  onChange={setTimeToExitYears}
                  onEnter={runCalculate}
                  suffix="yr"
                  tooltip="Expected holding period before liquidity."
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
                  <SubSection title="Dilution & Target">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="dilution"
                        label="Future Dilution"
                        value={futureDilution}
                        onChange={setFutureDilution}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        tooltip="Expected ownership lost to later rounds before exit."
                      />
                      <CompactInput
                        id="target-moic"
                        label="Target MOIC"
                        value={targetMoic}
                        onChange={setTargetMoic}
                        onEnter={runCalculate}
                        suffix="x"
                        tooltip="Multiple you need to justify the risk of the cheque."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Multiple on Invested Capital</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {fmt(results.moic, 2)}x
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {`About ${fmt(results.irr, 1)}% a year over ${fmt(results.yearsToExit, 0)} years at the modelled exit`}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Exit Proceeds</span>
                <span className="font-extrabold text-foreground">${fmt(results.exitProceeds, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Net Profit</span>
                <span className="font-extrabold text-emerald-600">${fmt(results.netProfit, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">IRR</span>
                <span className="font-extrabold text-foreground">{fmt(results.irr, 1)}%</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Return Line</th>
                    <th className="p-2.5 text-right w-[150px]">Value</th>
                    <th className="p-2.5 pr-3 text-right w-[150px]">Basis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Post-money valuation</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.postMoneyValuation, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">pre-money plus round</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Ownership at investment</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(results.ownershipAtInvestment, 3)}%</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">cheque over post-money</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Ownership at exit</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(results.ownershipAtExit, 3)}%</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{fmt(results.dilutionPct, 0)}% dilution</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Exit proceeds</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.exitProceeds, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">at modelled valuation</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Return on investment</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(results.roi, 1)}%</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">net profit over cost</td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Target exit valuation</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.requiredExitForTarget, 0)}</td>
                    <td className={`p-2.5 pr-3 text-right ${results.exitShortfallVsTarget <= 0 ? "text-emerald-600" : "text-amber-600"}`}>
                      {results.exitShortfallVsTarget <= 0 ? "target met" : "target short"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* VALUE PATH */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Milestone</th>
                    <th className="p-2.5 text-right w-[100px]">Year</th>
                    <th className="p-2.5 text-right w-[140px]">Implied Value</th>
                    <th className="p-2.5 pr-3 text-right w-[110px]">Multiple</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.path.map((p) => (
                    <tr key={p.label} className={p.isExit ? "bg-secondary/20" : "hover:bg-secondary/20 transition-colors"}>
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{p.label}</td>
                      <td className="p-2.5 text-right text-foreground">{fmt(p.year, 0)}</td>
                      <td className="p-2.5 text-right text-foreground">${fmt(p.value, 0)}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{fmt(p.multiple, 2)}x</td>
                    </tr>
                  ))}
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Investment</span>
                  <span className="text-base font-bold text-foreground">${fmt(calcInputs.initialInvestment, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Dilution Applied</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.dilutionPct, 1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Exit Valuation</span>
                  <span className="text-base font-bold text-foreground">${fmt(calcInputs.expectedExitValuation, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Target Multiple</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.targetMoic, 1)}x</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Value per Dollar</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.valuePerDollarAtExit, 2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Deal Signal</span>
                  <span className={`text-base font-bold ${results.moic >= calcInputs.targetMoic ? "text-emerald-600" : "text-amber-600"}`}>
                    {results.moic >= calcInputs.targetMoic ? "Meets target" : "Below target"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is an Angel Investment Return Calculator?</h2>
            <p>
              An angel investment return calculator models what a single early-stage cheque returns if the company exits at
              a given valuation. It converts the round terms into an ownership percentage, applies the dilution expected
              from later financing rounds, and multiplies the surviving stake by the exit value. The result is expressed as
              a multiple on invested capital, with the equivalent annual rate beside it.
            </p>
            <p>
              The value of doing this arithmetic before writing a cheque is that it exposes how demanding early-stage
              outcomes really are. A stake that sounds generous at entry often survives to exit as a fraction of the
              original percentage, and a valuation that sounds enormous can still produce a modest multiple once dilution
              and time are accounted for.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The round&apos;s post-money valuation is the pre-money figure plus the total raised. Dividing your cheque by
              that post-money value gives ownership at entry. Future dilution is then subtracted, because subsequent rounds
              issue new shares and reduce your proportion without changing the number of shares you hold. What remains is
              the stake that participates in the exit.
            </p>
            <p>
              Multiplying that stake by the expected exit valuation produces proceeds, and the difference from your cheque
              is the profit. Dividing proceeds by cost gives the multiple, and raising the multiple to the power of one over
              the holding period converts it into an annual rate. The calculator also solves the reverse question, showing
              the exit valuation required to hit a target multiple, which is often the more useful number when deciding
              whether a deal is worth doing at all.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports the multiple with the implied annual rate beneath it. The three-stat bar sets exit
              proceeds against net profit and the internal rate of return, while the first table walks from the post-money
              valuation through ownership at entry and exit to the required exit valuation for your target multiple.
            </p>
            <p>
              The second table shows the value path the multiple implies, and it is worth studying because it makes the
              shape of the return tangible. Early-stage value does not grow evenly — it typically sits near entry for years
              and then reprices sharply at a successful financing or acquisition. That pattern is why the annual rate can
              look impressive even when the multiple was earned in a single event late in the holding period.
            </p>
            <p>
              Finally, keep the failure rate in view. A portfolio of ten cheques where nine return nothing and one returns
              ten times is a good outcome, not a disappointment — but it means each deal has to be underwritten against a
              high target multiple rather than a blended average. Use the calculator to test the exit valuation honestly,
              including the scenarios where the company raises more money at a flat or lower price and your stake is
              diluted without any improvement in value. Save the numbers for each deal you review so you can compare the
              implied annual rate, ownership percentage and required exit across the whole portfolio instead of judging
              one offer in isolation.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/angel-investment-return-calculator" />
          <PopularCalculators exclude="/calculator/angel-investment-return-calculator" />
        </div>
      </div>
    </>
  );
}
