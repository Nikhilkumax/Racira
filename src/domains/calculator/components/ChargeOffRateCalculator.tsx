"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface ChargeOffInputs {
  chargeOffs: number;
  avgReceivables: number;
  recoveries: number;
  priorYearRate: number;
  peerRate: number;
}

const DEFAULTS: ChargeOffInputs = {
  chargeOffs: 120000,
  avgReceivables: 2400000,
  recoveries: 30000,
  priorYearRate: 4.2,
  peerRate: 5.1,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface ChargeOffResult {
  grossRate: number;
  netRate: number;
  recoveryRate: number;
  netChargeOffs: number;
  yoyChange: number;
  vsPeer: number;
  lossPer100: number;
  valid: boolean;
  errorMsg: string;
}

function computeChargeOff(i: ChargeOffInputs): ChargeOffResult {
  const invalid =
    i.chargeOffs < 0 ||
    i.avgReceivables <= 0 ||
    i.recoveries < 0 ||
    i.recoveries > i.chargeOffs + 0.0001 ||
    i.priorYearRate < 0 ||
    i.peerRate < 0;

  const grossRate = i.avgReceivables > 0 ? (i.chargeOffs / i.avgReceivables) * 100 : 0;
  const netChargeOffs = i.chargeOffs - i.recoveries;
  const netRate = i.avgReceivables > 0 ? (netChargeOffs / i.avgReceivables) * 100 : 0;

  return {
    grossRate,
    netRate,
    recoveryRate: i.chargeOffs > 0 ? (i.recoveries / i.chargeOffs) * 100 : 0,
    netChargeOffs,
    yoyChange: grossRate - i.priorYearRate,
    vsPeer: grossRate - i.peerRate,
    lossPer100: netRate,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter non-negative charge-offs and recoveries (recoveries cannot exceed charge-offs), receivables above zero, and non-negative benchmark rates."
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

export default function ChargeOffRateCalculator() {
  const [chargeOffs, setChargeOffs] = useState(String(DEFAULTS.chargeOffs));
  const [avgReceivables, setAvgReceivables] = useState(String(DEFAULTS.avgReceivables));
  const [recoveries, setRecoveries] = useState(String(DEFAULTS.recoveries));
  const [priorYearRate, setPriorYearRate] = useState(String(DEFAULTS.priorYearRate));
  const [peerRate, setPeerRate] = useState(String(DEFAULTS.peerRate));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): ChargeOffInputs => ({
    chargeOffs: parseFloat(chargeOffs) || 0,
    avgReceivables: parseFloat(avgReceivables) || 0,
    recoveries: parseFloat(recoveries) || 0,
    priorYearRate: parseFloat(priorYearRate) || 0,
    peerRate: parseFloat(peerRate) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<ChargeOffInputs>(() => DEFAULTS);
  const [results, setResults] = useState<ChargeOffResult>(() => computeChargeOff(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeChargeOff(inputs));
  };

  const reset = () => {
    setChargeOffs(String(DEFAULTS.chargeOffs));
    setAvgReceivables(String(DEFAULTS.avgReceivables));
    setRecoveries(String(DEFAULTS.recoveries));
    setPriorYearRate(String(DEFAULTS.priorYearRate));
    setPeerRate(String(DEFAULTS.peerRate));
    setCalcInputs(DEFAULTS);
    setResults(computeChargeOff(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is a charge-off rate?",
      answer:
        "A charge-off rate measures the share of a loan or receivable portfolio written off as uncollectible during a period, usually a year. It is calculated by dividing charge-offs — the face value of accounts the lender has declared uncollectible — by average outstanding receivables over the same period. A $120,000 charge-off against $2.4 million of average receivables is a 5% gross charge-off rate, a common figure for consumer credit portfolios.",
    },
    {
      question: "What is the difference between gross and net charge-off rates?",
      answer:
        "The gross rate counts everything written off. The net rate subtracts recoveries — money later collected on accounts that had already been charged off — from the charge-offs before dividing by receivables. Recoveries commonly run 15% to 35% of charge-offs on consumer portfolios, so the net rate can be a full percentage point lower than the gross rate. Lenders report both because the net figure is what the portfolio actually loses.",
    },
    {
      question: "Why do lenders charge off debt instead of collecting it?",
      answer:
        "Accounting rules and regulation require it. Under US rules, an unsecured consumer account that is 180 days past due generally must be charged off, at which point it becomes a loss on the income statement even though collection efforts may continue. Charging off keeps reported assets honest and triggers the collections process. It does not cancel the debt — the borrower still owes it, and the charge-off appears on their credit report.",
    },
    {
      question: "What charge-off rate is normal?",
      answer:
        "It varies enormously by product. Prime credit card portfolios often run 2% to 4% net charge-offs in normal conditions; subprime portfolios can exceed 10%. Auto loans typically run below 2%, and secured mortgages far lower. The right comparison is against your own history and against peers in the same product and risk band, which is why this calculator includes both a prior-year rate and a peer benchmark. A rising rate against stable peers signals underwriting or servicing problems.",
    },
    {
      question: "How do recoveries affect the true loss rate?",
      answer:
        "Recoveries reduce the eventual loss but arrive later, so timing matters as well as amount. A portfolio with a 5% gross rate and one-third recovery rate has a 3.33% net rate — the difference is real money at scale. When comparing vendors or strategies, the recovery rate on charged-off balances is one of the few levers management controls, and sales of charged-off debt to buyers are priced mainly on the expected recovery.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Charge-Off Rate Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Charge-Off Rate Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Portfolio">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="charge-offs"
                  label="Charge-Offs"
                  value={chargeOffs}
                  onChange={setChargeOffs}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Face value of accounts written off during the period."
                />
                <CompactInput
                  id="avg-receivables"
                  label="Average Receivables"
                  value={avgReceivables}
                  onChange={setAvgReceivables}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Average outstanding balance across the period."
                />
              </div>
              <div className="mt-3">
                <CompactInput
                  id="recoveries"
                  label="Recoveries"
                  value={recoveries}
                  onChange={setRecoveries}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Amounts collected later on accounts already charged off."
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
                  <SubSection title="Benchmarks">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="prior-year"
                        label="Prior Year Rate"
                        value={priorYearRate}
                        onChange={setPriorYearRate}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        step="0.01"
                        tooltip="Last year's gross charge-off rate, for the year-over-year comparison."
                      />
                      <CompactInput
                        id="peer-rate"
                        label="Peer Benchmark"
                        value={peerRate}
                        onChange={setPeerRate}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        step="0.01"
                        tooltip="Typical gross charge-off rate for comparable portfolios."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Charge-Off Rate</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {fmt(results.grossRate, 2)}%
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                Net of recoveries: {fmt(results.netRate, 2)}%
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Charge-Offs
                </span>
                <span className="font-extrabold text-foreground">${fmt(calcInputs.chargeOffs, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Recoveries</span>
                <span className="font-extrabold text-foreground">${fmt(calcInputs.recoveries, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Net Rate</span>
                <span className="font-extrabold text-primary">{fmt(results.netRate, 2)}%</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Component</th>
                    <th className="p-2.5 text-right w-[130px]">Amount</th>
                    <th className="p-2.5 pr-3 text-right w-[110px]">% of Receivables</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Gross charge-offs</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(calcInputs.chargeOffs, 0)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{fmt(results.grossRate, 2)}%</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Recoveries</td>
                    <td className="p-2.5 text-right text-foreground">−${fmt(calcInputs.recoveries, 0)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">
                      −{fmt(results.grossRate - results.netRate, 2)}%
                    </td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Net charge-offs</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.netChargeOffs, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-muted-foreground">{fmt(results.netRate, 2)}%</td>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Recovery Rate</span>
                  <span className="text-base font-bold text-primary">{fmt(results.recoveryRate, 1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Net Loss per $100
                  </span>
                  <span className="text-base font-bold text-foreground">${fmt(results.lossPer100, 2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    vs Prior Year
                  </span>
                  <span className={`text-base font-bold ${results.yoyChange <= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {results.yoyChange >= 0 ? "+" : ""}
                    {fmt(results.yoyChange, 2)} pts
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">vs Peer Benchmark</span>
                  <span className={`text-base font-bold ${results.vsPeer <= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {results.vsPeer >= 0 ? "+" : ""}
                    {fmt(results.vsPeer, 2)} pts
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Average Receivables
                  </span>
                  <span className="text-base font-bold text-foreground">${fmt(calcInputs.avgReceivables, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Net Charge-Offs
                  </span>
                  <span className="text-base font-bold text-foreground">${fmt(results.netChargeOffs, 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Charge-Off Rate Calculator?</h2>
            <p>
              A charge-off rate calculator measures the share of a lending portfolio written off as uncollectible in a
              period. Charge-offs are accounts the lender has declared a loss — under US rules an unsecured consumer
              account is generally charged off once it is 180 days past due — and the rate is those write-offs divided by
              the average outstanding receivables for the same period. The figure is one of the core health metrics for
              any credit portfolio, and it feeds directly into pricing, provisioning and underwriting decisions.
            </p>
            <p>
              Two versions matter. The gross charge-off rate counts every dollar written off. The net rate subtracts
              recoveries — amounts collected later on accounts already charged off — because recoveries reduce the
              eventual loss. Consumer portfolios often recover between 15% and 35% of charged-off balances, so the gap
              between the two rates is material. Comparing your rate against last year and against peers in the same
              product tells you whether a change reflects the market or your own book.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The calculator divides charge-offs by average receivables and multiplies by one hundred to produce the
              gross rate. It then subtracts recoveries from charge-offs to produce net charge-offs, and divides that
              figure by the same receivables base for the net rate. The difference between the two rates is the recovery
              benefit expressed in percentage points.
            </p>
            <p>
              It also computes the recovery rate — recoveries divided by charge-offs — the net loss per $100 of
              receivables, and two comparisons: the change against the prior-year rate and the gap against a peer
              benchmark. A negative year-over-year change means losses are improving; a negative gap against peers means
              the portfolio is performing better than comparable books. Both comparisons are only as good as the inputs,
              so use rates from the same product, risk band and reporting period.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports the gross charge-off rate with the net rate beneath it, and the three-stat bar
              shows charge-offs, recoveries and the net rate side by side. The breakdown table sets the gross figure
              against the recovery deduction and the resulting net charge-offs, each expressed as a percentage of
              receivables, which makes the arithmetic of the loss rate visible in three lines.
            </p>
            <p>
              Summary Statistics adds the recovery rate, the net loss per hundred dollars of receivables, the
              year-over-year movement and the comparison against peers. Treat the result as a period measure: annualise
              quarterly or monthly figures before comparing them, and keep the receivables base consistent — an average
              balance, not an end-of-period snapshot, so that growth or shrinkage in the portfolio does not distort the
              rate. A rising charge-off rate against a stable peer benchmark is the clearest early warning that
              underwriting standards or servicing practices need attention. Keep in mind that charge-offs lag
              delinquency by design: accounts are written off months after they stop performing, so a charge-off spike
              in one quarter usually reflects lending decisions made a year or more              earlier, and any fix takes time to
              show up in the rate. Track the metric monthly and alongside delinquency rates for the full picture.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/charge-off-rate-calculator" />
          <PopularCalculators exclude="/calculator/charge-off-rate-calculator" />
        </div>
      </div>
    </>
  );
}
