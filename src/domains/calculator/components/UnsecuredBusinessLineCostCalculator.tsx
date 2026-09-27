"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface LineInputs {
  lineAmount: number;
  drawn: number;
  rate: number;
  months: number;
  annualFee: number;
  drawPct: number;
  unusedPct: number;
  minMonthlyInterest: number;
}

const DEFAULTS: LineInputs = {
  lineAmount: 150000,
  drawn: 90000,
  rate: 11.5,
  months: 12,
  annualFee: 500,
  drawPct: 1,
  unusedPct: 0.35,
  minMonthlyInterest: 250,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface LineResult {
  years: number;
  interestCost: number;
  monthlyInterest: number;
  minimumApplied: boolean;
  annualFeeTotal: number;
  drawFee: number;
  unusedFee: number;
  totalFees: number;
  totalCost: number;
  effectiveAnnualPct: number;
  costPerHundred: number;
  valid: boolean;
  errorMsg: string;
}

function computeLine(i: LineInputs): LineResult {
  const invalid =
    i.lineAmount <= 0 || i.drawn < 0 || i.drawn > i.lineAmount * 1.0001 || i.rate < 0 || i.months <= 0;

  const years = i.months / 12;
  const rawMonthlyInterest = (i.drawn * i.rate) / 100 / 12;
  const minimumApplied = i.minMonthlyInterest > rawMonthlyInterest;
  const monthlyInterest = Math.max(rawMonthlyInterest, i.minMonthlyInterest);
  const interestCost = monthlyInterest * i.months;

  const annualFeeTotal = i.annualFee * years;
  const drawFee = (i.drawn * i.drawPct) / 100;
  const unusedFee = ((i.lineAmount - i.drawn) * i.unusedPct) / 100 * years;
  const totalFees = annualFeeTotal + drawFee + unusedFee;
  const totalCost = interestCost + totalFees;

  return {
    years,
    interestCost,
    monthlyInterest,
    minimumApplied,
    annualFeeTotal,
    drawFee,
    unusedFee,
    totalFees,
    totalCost,
    effectiveAnnualPct: i.drawn > 0 && years > 0 ? (totalCost / i.drawn / years) * 100 : 0,
    costPerHundred: i.drawn > 0 ? (totalCost / i.drawn) * 100 : 0,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a positive line amount and term, a drawn balance no larger than the line, and a non-negative rate."
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

export default function UnsecuredBusinessLineCostCalculator() {
  const [lineAmount, setLineAmount] = useState(String(DEFAULTS.lineAmount));
  const [drawn, setDrawn] = useState(String(DEFAULTS.drawn));
  const [rate, setRate] = useState(String(DEFAULTS.rate));
  const [months, setMonths] = useState(String(DEFAULTS.months));
  const [annualFee, setAnnualFee] = useState(String(DEFAULTS.annualFee));
  const [drawPct, setDrawPct] = useState(String(DEFAULTS.drawPct));
  const [unusedPct, setUnusedPct] = useState(String(DEFAULTS.unusedPct));
  const [minMonthlyInterest, setMinMonthlyInterest] = useState(String(DEFAULTS.minMonthlyInterest));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): LineInputs => ({
    lineAmount: parseFloat(lineAmount) || 0,
    drawn: parseFloat(drawn) || 0,
    rate: parseFloat(rate) || 0,
    months: parseFloat(months) || 0,
    annualFee: parseFloat(annualFee) || 0,
    drawPct: parseFloat(drawPct) || 0,
    unusedPct: parseFloat(unusedPct) || 0,
    minMonthlyInterest: parseFloat(minMonthlyInterest) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<LineInputs>(() => DEFAULTS);
  const [results, setResults] = useState<LineResult>(() => computeLine(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeLine(inputs));
  };

  const reset = () => {
    setLineAmount(String(DEFAULTS.lineAmount));
    setDrawn(String(DEFAULTS.drawn));
    setRate(String(DEFAULTS.rate));
    setMonths(String(DEFAULTS.months));
    setAnnualFee(String(DEFAULTS.annualFee));
    setDrawPct(String(DEFAULTS.drawPct));
    setUnusedPct(String(DEFAULTS.unusedPct));
    setMinMonthlyInterest(String(DEFAULTS.minMonthlyInterest));
    setCalcInputs(DEFAULTS);
    setResults(computeLine(DEFAULTS));
  };

  const faqs = [
    {
      question: "How is an unsecured business line of credit priced?",
      answer:
        "An unsecured line carries an interest rate on the amount you actually draw, plus a set of fees that are often the larger surprise. A typical structure includes an annual or monthly account fee, a draw fee each time you advance funds, and sometimes a minimum interest requirement regardless of usage. Because nothing is pledged as collateral, the rate itself sits well above a secured facility, and the fees are the price of the flexibility to draw, repay and redraw.",
    },
    {
      question: "Why does my effective cost exceed the quoted rate?",
      answer:
        "Because fees are charged against the drawn balance alongside interest. A draw fee of one percent is charged on the full amount advanced even if you repay it quickly, and an annual fee applies whether or not you use the line. When those charges are divided by the drawn balance and annualised, the effective cost climbs above the nominal rate. This calculator reports the blended figure, which is the number to compare against a term loan or a secured line.",
    },
    {
      question: "What is a minimum interest requirement?",
      answer:
        "Some lenders require a minimum monthly interest charge whether or not you have drawn funds, to guarantee a return on the facility they have reserved for you. If your actual interest for the month falls below the floor, the lender charges the floor instead. The calculator applies that minimum automatically and flags when it is binding, because it is a common clause that borrowers overlook until the first statement arrives.",
    },
    {
      question: "Should I draw the full line or only what I need?",
      answer:
        "Only what you need, in general, since interest is charged on the drawn balance. There are exceptions: if a draw fee applies each time you advance, drawing larger amounts less often reduces fee frequency, and if a minimum interest requirement is binding, drawing more may cost little extra until the floor is exceeded. Enter different drawn balances to see how the effective cost changes across the range you realistically expect to use.",
    },
    {
      question: "Is an unsecured line better than a term loan?",
      answer:
        "It depends on how you will use the money. A line of credit is designed for fluctuating working capital, letting you draw and repay as cash flow moves, and you pay interest only on what is outstanding. A term loan provides a fixed amount at a lower rate, amortised over a set schedule, and suits a defined investment. The line is more flexible and more expensive; the term loan is cheaper and less flexible. Compare this calculator&apos;s effective annual cost against the term loan rate to see the price of that flexibility.",
    },
  ];

  const breakdownRows = [
    { label: "Interest", amount: `$${fmt(results.interestCost, 0)}`, basis: `$${fmt(results.monthlyInterest, 0)}/mo` },
    { label: "Annual Account Fee", amount: `$${fmt(results.annualFeeTotal, 0)}`, basis: `${fmt(results.years, 2)} yr` },
    { label: "Draw Fee", amount: `$${fmt(results.drawFee, 0)}`, basis: `${fmt(calcInputs.drawPct, 2)}% one-off` },
    {
      label: "Unused Line Fee",
      amount: `$${fmt(results.unusedFee, 0)}`,
      basis: `${fmt(calcInputs.unusedPct, 2)}% on undrawn ${fmt(calcInputs.lineAmount - calcInputs.drawn, 0)}`,
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Unsecured Business Line Cost Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Unsecured Business Line Cost Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Facility">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="line"
                  label="Line Amount"
                  value={lineAmount}
                  onChange={setLineAmount}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Maximum credit approved on the line."
                />
                <CompactInput
                  id="drawn"
                  label="Average Drawn Balance"
                  value={drawn}
                  onChange={setDrawn}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Typical amount outstanding during the period."
                />
              </div>
            </SubSection>

            <SubSection title="Rate & Term">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="rate"
                  label="Interest Rate"
                  value={rate}
                  onChange={setRate}
                  onEnter={runCalculate}
                  suffix="%"
                  step="0.1"
                  tooltip="Annual rate charged on the drawn balance."
                />
                <CompactInput
                  id="months"
                  label="Term"
                  value={months}
                  onChange={setMonths}
                  onEnter={runCalculate}
                  suffix="months"
                  tooltip="Period over which you expect to use the line."
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
                  <SubSection title="Fees">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="annual"
                        label="Annual Account Fee"
                        value={annualFee}
                        onChange={setAnnualFee}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Yearly fee charged for maintaining the line."
                      />
                      <CompactInput
                        id="draw-fee"
                        label="Draw Fee"
                        value={drawPct}
                        onChange={setDrawPct}
                        onEnter={runCalculate}
                        suffix="%"
                        step="0.1"
                        min="0"
                        tooltip="Fee charged each time funds are advanced."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <CompactInput
                        id="unused"
                        label="Unused Line Fee"
                        value={unusedPct}
                        onChange={setUnusedPct}
                        onEnter={runCalculate}
                        suffix="%/yr"
                        step="0.05"
                        min="0"
                        tooltip="Annual fee on the undrawn portion of the line."
                      />
                      <CompactInput
                        id="min-interest"
                        label="Minimum Monthly Interest"
                        value={minMonthlyInterest}
                        onChange={setMinMonthlyInterest}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Interest floor charged regardless of usage."
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

            {results.valid && results.minimumApplied && (
              <div className="bg-amber-500/10 border-l-4 border-amber-500 rounded-lg p-5">
                <div className="text-sm font-bold text-amber-700 mb-1 uppercase tracking-wider">Minimum interest binding</div>
                <div className="text-sm font-medium text-foreground">
                  Your calculated monthly interest is below the floor, so the minimum of $
                  {fmt(calcInputs.minMonthlyInterest, 0)} is being charged instead.
                </div>
              </div>
            )}

            {/* PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Effective Annual Cost</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {fmt(results.effectiveAnnualPct, 2)}%
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                All-in on the drawn balance vs a {fmt(calcInputs.rate, 2)}% stated rate
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Interest Cost</span>
                <span className="font-extrabold text-foreground">${fmt(results.interestCost, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Fees</span>
                <span className="font-extrabold text-foreground">${fmt(results.totalFees, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Cost</span>
                <span className="font-extrabold text-foreground">${fmt(results.totalCost, 0)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Cost Component</th>
                    <th className="p-2.5 text-right w-[130px]">Total</th>
                    <th className="p-2.5 pr-3">Basis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdownRows.map((row) => (
                    <tr key={row.label} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                      <td className="p-2.5 text-right text-foreground">{row.amount}</td>
                      <td className="p-2.5 pr-3 text-muted-foreground">{row.basis}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Total Cost of the Line</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.totalCost, 0)}</td>
                    <td className="p-2.5 pr-3 text-foreground">${fmt(results.costPerHundred)} per $100 drawn</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Line Amount</span>
                  <span className="text-base font-bold text-foreground">${fmt(calcInputs.lineAmount, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Average Drawn</span>
                  <span className="text-base font-bold text-foreground">${fmt(calcInputs.drawn, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Utilisation</span>
                  <span className="text-base font-bold text-foreground">
                    {fmt(calcInputs.lineAmount > 0 ? (calcInputs.drawn / calcInputs.lineAmount) * 100 : 0, 1)}%
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Stated Rate</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.rate, 2)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Effective Annual Cost</span>
                  <span className="text-base font-bold text-primary">{fmt(results.effectiveAnnualPct, 2)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Monthly Interest</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.monthlyInterest, 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is an Unsecured Business Line Cost Calculator?</h2>
            <p>
              An unsecured business line cost calculator works out the true cost of a revolving credit facility that is
              not backed by collateral. Unsecured lines are attractive because approval does not require pledging
              receivables, inventory or equipment, and because you can draw, repay and redraw as cash flow demands. The
              price of that convenience is a higher interest rate than a secured facility and, more importantly, a set of
              fees that borrowers routinely underestimate when comparing offers.
            </p>
            <p>
              The quoted rate is only part of the cost. Annual account fees, one-off draw fees, unused line fees on the
              portion you leave untouched, and minimum interest requirements all add to the true expense. When these are
              divided by the balance you actually draw and annualised, the effective cost can sit several points above the
              headline rate. This calculator produces that blended figure so the line can be judged against a term loan, an
              asset-based facility or a merchant advance.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Interest is charged on the average drawn balance at the stated annual rate, pro-rated for the term, and is
              subject to any minimum monthly interest you enter: if the calculated monthly charge falls below the floor,
              the floor applies and the calculator flags it. Fees are then added. The annual account fee is pro-rated for
              the term, the draw fee is a one-off percentage of the drawn balance, and the unused line fee is the annual
              percentage applied to the undrawn portion, which is the line amount minus the drawn balance.
            </p>
            <p>
              The total cost is the sum of interest and every fee, and the effective annual cost divides that total by the
              drawn balance and by the term in years. Expressing the result per hundred dollars drawn gives an intuitive
              sense of the price, and comparing it with the stated rate shows precisely how much of the cost is fee rather
              than interest.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the effective annual cost with the stated rate beneath it for contrast. The three
              statistics beside it give the interest cost, the total of all fees, and the total cost of the facility. A
              warning panel appears whenever the minimum interest requirement is binding, since that clause silently raises
              the cost of lightly used lines. The breakdown table itemises interest, the account fee, the draw fee and the
              unused line fee with their bases.
            </p>
            <p>
              Summary Statistics adds the line amount, average drawn balance, utilisation percentage and the monthly
              interest charge. Two practical points follow from the numbers. First, utilisation matters: a lightly used
              line spreads fixed fees over a smaller balance and raises the effective rate, so the true cost depends on how
              you actually use the facility, not just its terms. Second, fee structures vary widely, and some lenders waive
              draw or unused fees above a usage threshold. Treat the output as a comparison tool and confirm the fee
              schedule with the lender before committing.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/unsecured-business-line-cost-calculator" />
          <PopularCalculators exclude="/calculator/unsecured-business-line-cost-calculator" />
        </div>
      </div>
    </>
  );
}
