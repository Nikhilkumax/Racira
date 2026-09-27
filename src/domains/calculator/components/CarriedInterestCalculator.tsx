"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type CatchUp = "full" | "half" | "none";

interface CarriedInputs {
  capital: number;
  exitValue: number;
  preferredReturn: number;
  years: number;
  carryRate: number;
  gpCommit: number;
  catchUp: CatchUp;
  feeRate: number;
}

const DEFAULTS: CarriedInputs = {
  capital: 100000000,
  exitValue: 260000000,
  preferredReturn: 8,
  years: 6,
  carryRate: 20,
  gpCommit: 2,
  catchUp: "full",
  feeRate: 1.5,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "—";

const money2 = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";

const multiple = (v: number) => (Number.isFinite(v) ? fmt(v, 2) + "x" : "—");

const CATCH_UP_LABEL: Record<CatchUp, string> = {
  full: "Full catch-up (100%)",
  half: "Half catch-up (50%)",
  none: "No catch-up",
};

const CATCH_UP_RATE: Record<CatchUp, number> = { full: 1, half: 0.5, none: 0 };

interface TierRow {
  tier: string;
  amount: number;
  toLp: number;
  toGp: number;
  note: string;
}

interface CarriedResult {
  valid: boolean;
  errorMsg: string;
  managementFees: number;
  netProceeds: number;
  totalProfit: number;
  preferredTotal: number;
  catchUpPool: number;
  catchUpPaid: number;
  residualProfit: number;
  gpCarry: number;
  gpCapital: number;
  lpCapital: number;
  gpProceeds: number;
  lpProceeds: number;
  gpMultiple: number;
  lpMultiple: number;
  effectiveCarry: number;
  rows: TierRow[];
  summary: { label: string; value: string; tone?: string }[];
}

function compute(i: CarriedInputs): CarriedResult {
  const capital = Math.max(0, i.capital);
  const years = Math.max(0.25, i.years);
  const carry = Math.min(0.5, Math.max(0, i.carryRate / 100));
  const hurdle = Math.max(0, i.preferredReturn) / 100;
  const gpShare = Math.min(1, Math.max(0, i.gpCommit / 100));
  const feeRate = Math.max(0, i.feeRate) / 100;
  const catchRate = CATCH_UP_RATE[i.catchUp];

  const managementFees = capital * feeRate * years;
  const netProceeds = Math.max(0, i.exitValue - managementFees);
  const totalProfit = Math.max(0, netProceeds - capital);

  const preferredTotal = capital * (Math.pow(1 + hurdle, years) - 1);
  const profitAbovePref = Math.max(0, totalProfit - preferredTotal);

  // The GP catches up to its carry share of (preferred + catch-up). Let D be the
  // profit distributed during the catch-up phase. Solving catchRate x D =
  // carry x (preferred + D) gives D = carry x preferred / (catchRate - carry),
  // valid whenever the phase distributes faster than the carry rate. If the deal
  // does not generate enough profit to finish the phase, the available profit P
  // is distributed at the catchRate instead and nothing is left for the residual.
  const catchUpPool =
    catchRate > 0 && catchRate > carry ? (carry * preferredTotal) / (catchRate - carry) : 0;
  const catchUpPaid = Math.min(profitAbovePref, catchUpPool);
  const catchUpToGp = catchUpPaid * catchRate;
  const residualProfit = Math.max(0, profitAbovePref - catchUpPaid);
  const residualToGp = residualProfit * carry;

  const gpCapital = capital * gpShare;
  const lpCapital = capital - gpCapital;
  const preferredToGp = preferredTotal * gpShare;
  const preferredToLp = preferredTotal - preferredToGp;

  const gpCarry = catchUpToGp + residualToGp;
  const gpProceeds = gpCapital + preferredToGp + gpCarry;
  const lpProceeds =
    lpCapital + preferredToLp + (catchUpPaid - catchUpToGp) + (residualProfit - residualToGp);

  const rows: TierRow[] = [
    {
      tier: "Return of capital",
      amount: capital,
      toLp: lpCapital,
      toGp: gpCapital,
      note: "Each partner receives its contributed capital back first.",
    },
    {
      tier: "Preferred return",
      amount: preferredTotal,
      toLp: preferredToLp,
      toGp: preferredToGp,
      note: `${fmt(i.preferredReturn, 2)}% a year compounded over ${fmt(years, 2)} years, pro rata to capital.`,
    },
    {
      tier: "GP catch-up",
      amount: catchUpPaid,
      toLp: catchUpPaid - catchUpToGp,
      toGp: catchUpToGp,
      note: CATCH_UP_LABEL[i.catchUp] + " until the GP reaches its carry share of preferred plus catch-up.",
    },
    {
      tier: "Residual split",
      amount: residualProfit,
      toLp: residualProfit - residualToGp,
      toGp: residualToGp,
      note: `Profit above the hurdle is split ${fmt(100 - i.carryRate, 2)}% to LPs and ${fmt(i.carryRate, 2)}% to the GP.`,
    },
  ];

  const valid =
    i.capital > 0 &&
    i.exitValue >= 0 &&
    i.preferredReturn >= 0 &&
    i.years > 0 &&
    i.carryRate >= 0 &&
    i.carryRate <= 50 &&
    i.gpCommit >= 0 &&
    i.gpCommit <= 20 &&
    i.feeRate >= 0 &&
    i.feeRate <= 5;
  const errorMsg = valid
    ? ""
    : "Enter a positive fund capital and holding period, a non-negative exit value, preferred return and fee rate, carry between 0% and 50%, and a GP commitment between 0% and 20%.";

  return {
    valid,
    errorMsg,
    managementFees,
    netProceeds,
    totalProfit,
    preferredTotal,
    catchUpPool,
    catchUpPaid,
    residualProfit,
    gpCarry,
    gpCapital,
    lpCapital,
    gpProceeds,
    lpProceeds,
    gpMultiple: gpCapital > 0 ? gpProceeds / gpCapital : 0,
    lpMultiple: lpCapital > 0 ? lpProceeds / lpCapital : 0,
    effectiveCarry: totalProfit > 0 ? (gpCarry / totalProfit) * 100 : 0,
    rows,
    summary: [
      { label: "Fund Capital", value: money(capital) },
      { label: "Exit Equity Value", value: money(i.exitValue) },
      { label: "Management Fees", value: money(managementFees), tone: "text-destructive" },
      { label: "Net Proceeds", value: money(netProceeds) },
      { label: "Total Profit", value: money(totalProfit), tone: "text-emerald-600" },
      { label: "Preferred Return", value: money(preferredTotal) },
      { label: "Profit Above Hurdle", value: money(Math.max(0, totalProfit - preferredTotal)) },
      { label: "GP Carried Interest", value: money(gpCarry), tone: "text-primary" },
      { label: "GP Total Proceeds", value: money(gpProceeds) },
      { label: "LP Total Proceeds", value: money(lpProceeds), tone: "text-emerald-600" },
      { label: "LP Multiple", value: multiple(lpCapital > 0 ? lpProceeds / lpCapital : 0) },
      { label: "GP Multiple", value: multiple(gpCapital > 0 ? gpProceeds / gpCapital : 0) },
      { label: "Effective Carry", value: fmt(totalProfit > 0 ? (gpCarry / totalProfit) * 100 : 0, 2) + "%" },
      { label: "GP Commitment", value: fmt((gpProceeds / Math.max(capital, 1)) * 100, 2) + "% of fund" },
      { label: "Catch-Up Mode", value: CATCH_UP_LABEL[i.catchUp] },
      { label: "LP Profit", value: money(lpProceeds - lpCapital) },
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

export default function CarriedInterestCalculator() {
  const [capital, setCapital] = useState(String(DEFAULTS.capital));
  const [exitValue, setExitValue] = useState(String(DEFAULTS.exitValue));
  const [preferredReturn, setPreferredReturn] = useState(String(DEFAULTS.preferredReturn));
  const [years, setYears] = useState(String(DEFAULTS.years));
  const [carryRate, setCarryRate] = useState(String(DEFAULTS.carryRate));
  const [gpCommit, setGpCommit] = useState(String(DEFAULTS.gpCommit));
  const [catchUp, setCatchUp] = useState<CatchUp>(DEFAULTS.catchUp);
  const [feeRate, setFeeRate] = useState(String(DEFAULTS.feeRate));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): CarriedInputs => ({
    capital: parseFloat(capital) || 0,
    exitValue: parseFloat(exitValue) || 0,
    preferredReturn: parseFloat(preferredReturn) || 0,
    years: parseFloat(years) || 0,
    carryRate: parseFloat(carryRate) || 0,
    gpCommit: parseFloat(gpCommit) || 0,
    catchUp,
    feeRate: parseFloat(feeRate) || 0,
  });

  const [results, setResults] = useState<CarriedResult>(() => compute(DEFAULTS));

  const runCalculate = () => setResults(compute(getInputs()));

  const reset = () => {
    setCapital(String(DEFAULTS.capital));
    setExitValue(String(DEFAULTS.exitValue));
    setPreferredReturn(String(DEFAULTS.preferredReturn));
    setYears(String(DEFAULTS.years));
    setCarryRate(String(DEFAULTS.carryRate));
    setGpCommit(String(DEFAULTS.gpCommit));
    setCatchUp(DEFAULTS.catchUp);
    setFeeRate(String(DEFAULTS.feeRate));
    setResults(compute(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is carried interest?",
      answer:
        "Carried interest is the share of a fund's profits paid to the general partner as compensation for managing the money, typically 20% of gains above a preferred return. It is called carried because the GP's share is carried by the LPs' capital: the GP usually contributes only a small percentage of the fund itself, so most of the capital at risk belongs to the investors.",
    },
    {
      question: "What is a preferred return or hurdle rate?",
      answer:
        "The preferred return, also called the hurdle, is the minimum annual return LPs receive before the GP takes any carried interest. If the hurdle is 8%, the fund must return all capital plus 8% a year compounded to investors before the profit split begins. It exists to align interests: the GP only shares in genuine outperformance, not in the mere recovery of the investors' own money.",
    },
    {
      question: "What is a catch-up provision?",
      answer:
        "A catch-up lets the GP collect a disproportionate share of profits after the hurdle is cleared so that it quickly reaches its full carry percentage of cumulative profit. With a full catch-up the GP takes 100% of distributions until it holds 20% of all profit above the return of capital; with a half catch-up it takes 50% and reaches the same point more slowly. This calculator models full, half and no catch-up.",
    },
    {
      question: "How do management fees affect the waterfall?",
      answer:
        "Management fees are charged on committed or invested capital regardless of performance, so they reduce the pool of profit before the waterfall is run. In this model fees are deducted from the exit value, which lowers total profit, the preferred return and the carried interest in that order. A fund that returns 2.6 times gross can return materially less net once six years of a 1.5% fee are counted.",
    },
    {
      question: "Why does the effective carry differ from the headline rate?",
      answer:
        "The headline carry applies only to profit above the hurdle. Because the preferred return must be paid first, and because the catch-up and residual split apply to different slices of profit, the GP's carried interest as a percentage of total profit is usually lower than the headline rate. The effective carry figure shows what the GP actually earned per dollar of gain created.",
    },
    {
      question: "Does this calculator model loss carryforwards?",
      answer:
        "No. This is a single-deal waterfall. Real funds calculate carry across the whole portfolio, so losses on one investment offset gains on another before any carry is paid. A full fund-level model would also track recycling of fees and the timing of each realisation; those features are outside the scope of this tool.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Carried Interest Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Carried Interest Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Fund Deal">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="capital"
                  label="Fund Capital"
                  value={capital}
                  onChange={setCapital}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  step="1000000"
                  tooltip="Total equity contributed by all partners."
                />
                <CompactInput
                  id="exit-value"
                  label="Exit Equity Value"
                  value={exitValue}
                  onChange={setExitValue}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  step="1000000"
                  tooltip="Gross proceeds from selling the investments, before fees."
                />
                <CompactInput
                  id="preferred-return"
                  label="Preferred Return"
                  value={preferredReturn}
                  onChange={setPreferredReturn}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  max="30"
                  step="0.5"
                  tooltip="Annual hurdle that must be paid to investors before the GP shares in profit."
                />
                <CompactInput
                  id="years"
                  label="Holding Period"
                  value={years}
                  onChange={setYears}
                  onEnter={runCalculate}
                  suffix="yr"
                  min="0.25"
                  max="15"
                  step="0.25"
                  tooltip="How long capital was invested; drives both the hurdle and the fees."
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
                  <SubSection title="Carry Terms">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="carry-rate"
                        label="Carry Rate"
                        value={carryRate}
                        onChange={setCarryRate}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        max="50"
                        step="1"
                        tooltip="The GP's share of profit above the hurdle; 20% is the market standard."
                      />
                      <CompactInput
                        id="gp-commit"
                        label="GP Commitment"
                        value={gpCommit}
                        onChange={setGpCommit}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        max="20"
                        step="0.5"
                        tooltip="Percentage of fund capital contributed by the GP; it shares in the return of capital and hurdle pro rata."
                      />
                      <CompactInput
                        id="fee-rate"
                        label="Management Fee"
                        value={feeRate}
                        onChange={setFeeRate}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        max="5"
                        step="0.1"
                        tooltip="Annual fee on invested capital, deducted from proceeds before the waterfall."
                      />
                      <div className="flex flex-col">
                        <label htmlFor="catch-up" className="flex items-center text-sm font-semibold text-foreground mb-1">
                          Catch-Up
                        </label>
                        <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                          <select
                            id="catch-up"
                            value={catchUp}
                            onChange={(e) => setCatchUp(e.target.value as CatchUp)}
                            className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
                          >
                            <option value="full">Full catch-up (100%)</option>
                            <option value="half">Half catch-up (50%)</option>
                            <option value="none">No catch-up</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </SubSection>
                  <SubSection title="Waterfall Order">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Capital is returned first, then the preferred return is paid pro rata to contributed capital, then the GP
                      catches up to its carry share of preferred plus catch-up if the terms include one, and finally everything
                      above the hurdle is split between LPs and the GP at the carry rate.
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">GP Carried Interest</div>
              <div className="text-4xl font-extrabold mb-1 tracking-tight text-foreground">{money(results.gpCarry)}</div>
              <div className="text-sm text-muted-foreground font-medium">
                {fmt(results.effectiveCarry, 2)}% of the {money(results.totalProfit)} gain · LP keeps {money(results.lpProceeds)}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Profit Above Hurdle</span>
                <span className="font-extrabold text-foreground">{money(Math.max(0, results.totalProfit - results.preferredTotal))}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">LP Multiple</span>
                <span className="font-extrabold text-foreground">{multiple(results.lpMultiple)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Profit</span>
                <span className="font-extrabold text-emerald-600">{money(results.totalProfit)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Waterfall Tier</th>
                    <th className="p-2.5 text-right w-[130px]">Pool</th>
                    <th className="p-2.5 text-right w-[130px]">To LPs</th>
                    <th className="p-2.5 pr-3 text-right w-[130px]">To GP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.rows.map((row) => (
                    <tr key={row.tier} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3">
                        <div className="font-semibold text-foreground">{row.tier}</div>
                        <div className="text-[11px] text-muted-foreground leading-snug">{row.note}</div>
                      </td>
                      <td className="p-2.5 text-right text-foreground">{money(row.amount)}</td>
                      <td className="p-2.5 text-right text-emerald-600">{money(row.toLp)}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{money(row.toGp)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Total distributed</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.netProceeds)}</td>
                    <td className="p-2.5 text-right text-emerald-600">{money(results.lpProceeds)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{money(results.gpProceeds)}</td>
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
            <h2 className="text-2xl font-bold mb-3">What Is a Carried Interest Calculator?</h2>
            <p>
              A carried interest calculator runs the profit waterfall that sits at the heart of every private equity, venture
              capital and hedge fund agreement. Investors commit capital, the manager invests it, and when the investments are
              sold the proceeds are distributed in a strict order: capital first, then the preferred return, then the manager's
              catch-up if the terms include one, and finally a split of what remains. The calculator turns that legal language
              into numbers so both sides can see who receives what.
            </p>
            <p>
              The tool models a single deal simply and transparently. It is most useful for understanding how the pieces
              interact: how a higher hurdle shifts money from the GP to the LPs, how a full catch-up restores the GP's share,
              and how many millions of dollars of management fees are paid before the performance split is ever considered.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The model deducts management fees, charged on invested capital for the length of the holding period, from the
              exit value. The remaining proceeds are reduced by the original capital to give total profit. The preferred return
              is computed by compounding the hurdle rate annually over the holding period and is allocated pro rata to each
              partner's contribution.
            </p>
            <p>
              Anything left above the hurdle enters the catch-up calculation. The GP's goal is to hold the carry rate times the
              sum of the preferred return and the catch-up amount. With a 100% catch-up, each dollar of profit during the phase
              goes to the GP until that target is reached, which requires a catch-up pool of the carry rate times the preferred
              return divided by one minus the carry rate. A 50% catch-up takes twice as large a pool because the GP receives
              only half of each dollar distributed. With no catch-up the GP proceeds straight to the residual split.
            </p>
            <p>
              Once the catch-up target is met — or the available profit is exhausted — everything further is split at the carry
              rate: typically 20% to the GP and 80% to the LPs. The final figures show what each side receives, what multiple
              of its capital each side earned, and what percentage of the total gain the GP actually captured as carried
              interest.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the GP's carried interest with the effective carry percentage, which is often well below
              the headline rate because the hurdle is paid out of the same profit pool. The three statistics beside it show the
              profit above the hurdle, the LPs' multiple, and total profit created. The waterfall table walks each tier in
              order, showing the size of the pool and how it was divided.
            </p>
            <p>
              In the default scenario a $100 million fund exits at $260 million after six years. Fees absorb $9 million, leaving
              $251 million and $151 million of profit. An 8% hurdle requires roughly $58.7 million of preferred return, and a
              full catch-up then hands the GP about $14.7 million before the residual is split. The GP's carried interest lands
              near $33 million, or roughly 22% of the profit — slightly above the headline rate only because the GP also earns
              preferred return on its own commitment. Summary Statistics breaks out each element, including the effective carry
              and the LP profit, so you can test alternative terms before signing anything.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/carried-interest-calculator" />
          <PopularCalculators exclude="/calculator/carried-interest-calculator" />
        </div>
      </div>
    </>
  );
}
