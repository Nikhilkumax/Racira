"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface ConstructionDrawInputs {
  loanAmount: number;
  rate: number;
  months: number;
  draws: number;
  bufferPercent: number;
}

const DEFAULTS: ConstructionDrawInputs = {
  loanAmount: 400000,
  rate: 9,
  months: 12,
  draws: 4,
  bufferPercent: 10,
};

const fmt = (v: number, d = 1) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "—";

const drawMonthsFor = (months: number, draws: number): number[] => {
  const n = Math.max(1, Math.min(Math.round(draws), Math.round(months)));
  const interval = months / n;
  const out: number[] = [];
  for (let k = 1; k <= n; k++) {
    out.push(Math.max(1, Math.min(months, Math.round(k * interval - interval + 1))));
  }
  return out;
};

interface ConstructionDrawResult {
  drawAmount: number;
  drawMonths: number[];
  totalInterest: number;
  reserveRequired: number;
  averageBalance: number;
  peakBalance: number;
  effectiveAnnualCost: number;
  interestAsPercentOfLoan: number;
  monthsWithoutDraw: number;
  schedule: { month: number; draw: number; balance: number; interest: number; cumulative: number }[];
  valid: boolean;
  errorMsg: string;
}

function computeConstructionDraw(i: ConstructionDrawInputs): ConstructionDrawResult {
  const months = Math.max(1, Math.round(i.months));
  const draws = Math.max(1, Math.round(i.draws));
  const iRate = i.rate / 100 / 12;
  const drawMonths = drawMonthsFor(months, draws);
  const drawAmount = i.loanAmount / draws;

  let bal = 0;
  let cum = 0;
  const schedule: { month: number; draw: number; balance: number; interest: number; cumulative: number }[] = [];

  // Interest is charged on the average balance for the month, since draws land mid-period.
  for (let m = 1; m <= months; m++) {
    const drawNow = drawMonths.includes(m) ? drawAmount : 0;
    const averageBalance = bal + drawNow / 2;
    const charge = averageBalance * iRate;
    bal += drawNow;
    cum += charge;
    schedule.push({ month: m, draw: drawNow, balance: bal, interest: charge, cumulative: cum });
  }

  const totalInterest = cum;
  const averageBalance = months > 0 ? schedule.reduce((s, r) => s + r.balance, 0) / months : 0;
  const perMonthInterest = schedule.map((r) => r.interest);
  const avgMonthlyInterest = months > 0 ? perMonthInterest.reduce((s, v) => s + v, 0) / months : 0;

  const invalid =
    i.loanAmount <= 0 ||
    i.rate < 0 ||
    i.months <= 0 ||
    i.draws < 1 ||
    i.draws > i.months + 0.5 ||
    i.bufferPercent < 0;
  const errorMsg = invalid
    ? "Enter a positive loan amount and construction term, at least one draw, and a non-negative rate and buffer."
    : "";

  return {
    drawAmount,
    drawMonths,
    totalInterest,
    reserveRequired: totalInterest * (1 + Math.max(0, i.bufferPercent) / 100),
    averageBalance,
    peakBalance: bal,
    effectiveAnnualCost: averageBalance > 0 ? (avgMonthlyInterest / averageBalance) * 12 * 100 : 0,
    interestAsPercentOfLoan: i.loanAmount > 0 ? (totalInterest / i.loanAmount) * 100 : 0,
    monthsWithoutDraw: months - drawMonths.length,
    schedule,
    valid: !invalid,
    errorMsg,
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
  </div>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">{title}</div>
    {children}
  </div>
);

export default function ConstructionDrawScheduleCalculator() {
  const [loanAmount, setLoanAmount] = useState(String(DEFAULTS.loanAmount));
  const [rate, setRate] = useState(String(DEFAULTS.rate));
  const [months, setMonths] = useState(String(DEFAULTS.months));
  const [draws, setDraws] = useState(String(DEFAULTS.draws));
  const [bufferPercent, setBufferPercent] = useState(String(DEFAULTS.bufferPercent));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): ConstructionDrawInputs => ({
    loanAmount: parseFloat(loanAmount) || 0,
    rate: parseFloat(rate) || 0,
    months: parseFloat(months) || 0,
    draws: parseFloat(draws) || 1,
    bufferPercent: parseFloat(bufferPercent) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<ConstructionDrawInputs>(() => DEFAULTS);
  const [results, setResults] = useState<ConstructionDrawResult>(() => computeConstructionDraw(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeConstructionDraw(inputs));
  };

  const reset = () => {
    setLoanAmount(String(DEFAULTS.loanAmount));
    setRate(String(DEFAULTS.rate));
    setMonths(String(DEFAULTS.months));
    setDraws(String(DEFAULTS.draws));
    setBufferPercent(String(DEFAULTS.bufferPercent));
    setCalcInputs(DEFAULTS);
    setResults(computeConstructionDraw(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is a construction draw schedule?",
      answer:
        "A construction draw schedule is the timetable on which a lender releases money from a building loan. The lender does not hand over the whole amount at once: each draw is released after an inspection confirms the previous stage is complete, usually following a standard sequence such as foundation, framing, roofing and mechanical, then finishes.",
    },
    {
      question: "How is interest charged during construction?",
      answer:
        "Interest accrues only on the money that has actually been drawn, not on the full commitment, which is why a construction loan costs far less during the build than the headline rate applied to the whole amount would suggest. Interest is commonly calculated on the average outstanding balance for the month, so a draw released mid-month is charged for roughly half of that period.",
    },
    {
      question: "What is an interest reserve?",
      answer:
        "An interest reserve is a portion of the loan set aside to pay the interest that accrues during construction. Because the property generates no income while it is being built, the lender funds the interest from the loan itself, holding back enough to cover the expected charge plus a cushion against delays and rate movement.",
    },
    {
      question: "Why do construction loans cost more than mortgages?",
      answer:
        "Construction lending carries more risk: the collateral does not exist in finished form, draw inspections add administrative cost, and the borrower has no rental or sale proceeds until completion. Lenders price that with a higher rate plus origination and inspection fees, and often a personal guarantee if the project is not pre-sold.",
    },
    {
      question: "How can I reduce the interest on a construction loan?",
      answer:
        "Ask for draws at longer intervals rather than smaller amounts every month, since fewer, larger draws mean less time with cash outstanding. Keeping the build on schedule avoids extension fees and additional reserve, and paying the interest from your own funds instead of capitalising it keeps the permanent loan balance lower when the build converts.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Construction Draw Schedule Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Construction Draw Schedule Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Loan Details">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="loanAmount"
                  label="Loan Amount"
                  value={loanAmount}
                  onChange={setLoanAmount}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Total construction budget being financed by the draws."
                />
                <CompactInput
                  id="rate"
                  label="Interest Rate"
                  value={rate}
                  onChange={setRate}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  step="0.125"
                  tooltip="Annual rate charged on the drawn balance."
                />
              </div>
            </SubSection>

            <SubSection title="Draw Schedule">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="months"
                  label="Build Period"
                  value={months}
                  onChange={setMonths}
                  onEnter={runCalculate}
                  suffix="mo"
                  min="1"
                  tooltip="Expected number of months from first draw to completion."
                />
                <CompactInput
                  id="draws"
                  label="Number of Draws"
                  value={draws}
                  onChange={setDraws}
                  onEnter={runCalculate}
                  min="1"
                  tooltip="How many staged releases the lender schedules."
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
                  <SubSection title="Interest Reserve">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="buffer"
                        label="Reserve Buffer"
                        value={bufferPercent}
                        onChange={setBufferPercent}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        tooltip="Cushion added to the interest reserve for delays and rate movement."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Interest Reserve</div>
              <div className="text-4xl font-extrabold mb-1 tracking-tight text-foreground">
                {money(results.reserveRequired)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {money(results.totalInterest)} of interest over {calcInputs.months} months &middot; {money(results.drawAmount)} per draw
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Interest</span>
                <span className="font-extrabold text-foreground">{money(results.totalInterest)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Avg Drawn</span>
                <span className="font-extrabold text-foreground">{money(results.averageBalance)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Effective Cost</span>
                <span className="font-extrabold text-primary">{fmt(results.interestAsPercentOfLoan, 2)}%</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Month</th>
                    <th className="p-2.5 text-right w-[110px]">Draw</th>
                    <th className="p-2.5 text-right w-[120px]">Drawn</th>
                    <th className="p-2.5 text-right w-[105px]">Interest</th>
                    <th className="p-2.5 pr-3 text-right w-[115px]">Cumulative</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.schedule.map((row) => (
                    <tr key={row.month} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">Month {row.month}</td>
                      <td className={`p-2.5 text-right ${row.draw > 0 ? "font-semibold text-primary" : "text-muted-foreground"}`}>
                        {row.draw > 0 ? money(row.draw) : "—"}
                      </td>
                      <td className="p-2.5 text-right text-foreground">{money(row.balance)}</td>
                      <td className="p-2.5 text-right text-destructive">{money(row.interest)}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{money(row.cumulative)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Total</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.peakBalance)}</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.averageBalance)}</td>
                    <td className="p-2.5 text-right text-destructive">{money(results.totalInterest)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{money(results.reserveRequired)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Loan Amount</span>
                  <span className="text-base font-bold text-foreground">{money(calcInputs.loanAmount)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interest Rate</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.rate, 2)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Build Period</span>
                  <span className="text-base font-bold text-foreground">{calcInputs.months} months</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Number of Draws</span>
                  <span className="text-base font-bold text-foreground">{results.drawMonths.length}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Draw Each</span>
                  <span className="text-base font-bold text-primary">{money(results.drawAmount)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">First Draw</span>
                  <span className="text-base font-bold text-foreground">Month {results.drawMonths[0]}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Last Draw</span>
                  <span className="text-base font-bold text-foreground">
                    Month {results.drawMonths[results.drawMonths.length - 1]}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Months With No Draw</span>
                  <span className="text-base font-bold text-foreground">{results.monthsWithoutDraw}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Interest</span>
                  <span className="text-base font-bold text-destructive">{money(results.totalInterest)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Reserve Buffer</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.bufferPercent, 0)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interest Reserve</span>
                  <span className="text-base font-bold text-primary">{money(results.reserveRequired)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interest as % of Loan</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.interestAsPercentOfLoan, 2)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Peak Drawn Balance</span>
                  <span className="text-base font-bold text-foreground">{money(results.peakBalance)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Effective Annual Cost</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.effectiveAnnualCost, 2)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Construction Draw Schedule Calculator?</h2>
            <p>
              A construction draw schedule calculator shows how a building loan is released in stages and what that staging
              costs in interest. You enter the total amount being financed, the rate, the expected build period and the number
              of draws. The tool spreads the draws evenly across the schedule, charges interest on the cash actually
              outstanding each month, and reports the total interest and the reserve a lender would hold back to cover it.
            </p>
            <p>
              Construction finance works differently from a normal mortgage. The loan is a commitment that is drawn down as
              work is completed, so for most of the build the borrower owes far less than the approved amount. That is why the
              interest bill during construction is modest even at a rate that looks high, and why the pace of draws matters
              more than the headline rate.
            </p>

            <h2 className="text-2xl font-bold mb-3">How the Draw Schedule Is Calculated</h2>
            <p>
              The draw months are spaced evenly across the build period, so four draws over twelve months land in months one,
              four, seven and ten, and the loan amount is divided equally between them. Each month the calculator charges
              interest on the average outstanding balance, which is the opening drawn balance plus half of any draw released
              in that month, multiplied by the annual rate divided by twelve.
            </p>
            <p>
              Charges accumulate on the drawn balance until completion, when the full amount has been advanced and the loan
              converts to permanent finance. The interest reserve is that accumulated charge plus the buffer percentage you
              choose, and it is normally withheld from the loan itself because the project generates no income while it is
              being built. Comparing the reserve with the total loan shows how much of the budget is consumed by financing
              cost before the property is finished.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports the interest reserve, with the total interest and the amount advanced per draw
              underneath. The three statistics beside it give total interest, the average drawn balance and the interest as a
              proportion of the loan. The breakdown table is the draw schedule itself: each month shows whether money was
              released, the cumulative drawn balance, the interest charged and the running total.
            </p>
            <p>
              Summary Statistics collects the loan amount, rate, build period, number of draws, the amount of each draw, the
              first and last draw months, the months with no advance, total interest, the reserve buffer, the reserve itself,
              the interest as a share of the loan, the peak drawn balance and the effective annual cost on the average balance.
              Fewer draws with longer gaps between them reduce both the interest and the reserve, so moving from monthly draws
              to quarterly releases is the simplest way to lower the cost of the facility.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/construction-draw-schedule-calculator" />
          <PopularCalculators exclude="/calculator/construction-draw-schedule-calculator" />
        </div>
      </div>
    </>
  );
}
