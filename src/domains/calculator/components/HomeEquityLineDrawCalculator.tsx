"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface HelocDrawInputs {
  limit: number;
  balance: number;
  draw: number;
  apr: number;
  drawMonths: number;
  repayYears: number;
}

const DEFAULTS: HelocDrawInputs = {
  limit: 100000,
  balance: 20000,
  draw: 15000,
  apr: 8.5,
  drawMonths: 84,
  repayYears: 20,
};

const fmt = (v: number, d = 1) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "—";

function payment(principal: number, annualRate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const i = annualRate / 100 / 12;
  if (i <= 0) return principal / months;
  return (principal * i) / (1 - Math.pow(1 + i, -months));
}

interface HelocDrawResult {
  availableBefore: number;
  availableAfter: number;
  newBalance: number;
  utilizationBefore: number;
  utilizationAfter: number;
  drawPayment: number;
  repayPayment: number;
  monthlyIncrease: number;
  drawInterest: number;
  repayInterest: number;
  totalInterest: number;
  totalRepaid: number;
  interestRatio: number;
  totalMonths: number;
  schedule: { label: string; balance: number; interest: number; cumulative: number }[];
  valid: boolean;
  errorMsg: string;
  overLimit: boolean;
}

function computeHelocDraw(i: HelocDrawInputs): HelocDrawResult {
  const drawMonths = Math.max(0, Math.round(i.drawMonths));
  const repayMonths = Math.max(1, Math.round(i.repayYears * 12));
  const iRate = i.apr / 100 / 12;

  const newBalance = i.balance + i.draw;
  const availableBefore = Math.max(0, i.limit - i.balance);
  const availableAfter = i.limit - newBalance;
  const overLimit = newBalance > i.limit;

  // Draw period is interest-only, so the balance is unchanged when repayment begins.
  const drawPayment = newBalance * iRate;
  const repayPayment = payment(newBalance, i.apr, repayMonths);
  const drawInterest = drawPayment * drawMonths;
  const repayInterest = Math.max(0, repayPayment * repayMonths - newBalance);
  const totalInterest = drawInterest + repayInterest;

  let bal = newBalance;
  let cum = drawInterest;
  let bucketInterest = 0;
  const schedule: { label: string; balance: number; interest: number; cumulative: number }[] = [
    { label: "Today", balance: i.balance, interest: 0, cumulative: 0 },
    {
      label: "After draw period",
      balance: newBalance,
      interest: drawInterest,
      cumulative: drawInterest,
    },
  ];
  for (let m = 1; m <= repayMonths; m++) {
    const charge = bal * iRate;
    bal = Math.max(0, bal + charge - repayPayment);
    cum += charge;
    bucketInterest += charge;
    if (m % 60 === 0 && m < repayMonths) {
      schedule.push({
        label: `Repayment yr ${m / 12}`,
        balance: bal,
        interest: bucketInterest,
        cumulative: cum,
      });
      bucketInterest = 0;
    }
  }
  schedule.push({
    label: "Loan repaid",
    balance: 0,
    interest: bucketInterest,
    cumulative: cum,
  });

  const invalid =
    i.limit <= 0 || i.balance < 0 || i.draw <= 0 || i.apr < 0 || i.repayYears <= 0 || overLimit;
  const errorMsg = overLimit
    ? `The draw of ${money(i.draw)} exceeds your available credit of ${money(availableBefore)}.`
    : invalid
      ? "Enter a positive credit limit and draw amount, a non-negative balance and rate, and a repayment term."
      : "";

  return {
    availableBefore,
    availableAfter,
    newBalance,
    utilizationBefore: i.limit > 0 ? (i.balance / i.limit) * 100 : 0,
    utilizationAfter: i.limit > 0 ? (newBalance / i.limit) * 100 : 0,
    drawPayment,
    repayPayment,
    monthlyIncrease: repayPayment - drawPayment,
    drawInterest,
    repayInterest,
    totalInterest,
    totalRepaid: newBalance + totalInterest,
    interestRatio: newBalance > 0 ? (totalInterest / newBalance) * 100 : 0,
    totalMonths: drawMonths + repayMonths,
    schedule,
    valid: !invalid,
    errorMsg,
    overLimit,
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

export default function HomeEquityLineDrawCalculator() {
  const [limit, setLimit] = useState(String(DEFAULTS.limit));
  const [balance, setBalance] = useState(String(DEFAULTS.balance));
  const [draw, setDraw] = useState(String(DEFAULTS.draw));
  const [apr, setApr] = useState(String(DEFAULTS.apr));
  const [drawMonths, setDrawMonths] = useState(String(DEFAULTS.drawMonths));
  const [repayYears, setRepayYears] = useState(String(DEFAULTS.repayYears));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): HelocDrawInputs => ({
    limit: parseFloat(limit) || 0,
    balance: parseFloat(balance) || 0,
    draw: parseFloat(draw) || 0,
    apr: parseFloat(apr) || 0,
    drawMonths: parseFloat(drawMonths) || 0,
    repayYears: parseFloat(repayYears) || 20,
  });

  const [calcInputs, setCalcInputs] = useState<HelocDrawInputs>(() => DEFAULTS);
  const [results, setResults] = useState<HelocDrawResult>(() => computeHelocDraw(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeHelocDraw(inputs));
  };

  const reset = () => {
    setLimit(String(DEFAULTS.limit));
    setBalance(String(DEFAULTS.balance));
    setDraw(String(DEFAULTS.draw));
    setApr(String(DEFAULTS.apr));
    setDrawMonths(String(DEFAULTS.drawMonths));
    setRepayYears(String(DEFAULTS.repayYears));
    setCalcInputs(DEFAULTS);
    setResults(computeHelocDraw(DEFAULTS));
  };

  const faqs = [
    {
      question: "How much can I draw from my home equity line?",
      answer:
        "Your drawing room is the credit limit minus whatever you already owe on the line. If the limit is one hundred thousand dollars and the outstanding balance is twenty thousand, a further eighty thousand is available, and the calculator shows that figure before and after the planned draw.",
    },
    {
      question: "What payment is due during the draw period?",
      answer:
        "Most home equity lines require interest-only payments while you are still drawing. That payment is the outstanding balance multiplied by the annual rate divided by twelve, so it moves with both the balance and the index. It keeps the account current but repays no principal, which is why the balance is unchanged when the repayment period begins.",
    },
    {
      question: "How does the payment change when repayment starts?",
      answer:
        "At the end of the draw period the line converts to a fully amortising loan over the remaining repayment term, commonly fifteen or twenty years. The payment jumps because it must clear principal as well as interest, and because the balance is at its highest point. Adding the new draw raises both the interest-only payment and the later amortising payment.",
    },
    {
      question: "Does drawing more hurt my credit score?",
      answer:
        "Revolving balances on a home equity line count toward credit utilisation, and a line that is close to its limit is treated more harshly than a mortgage balance. Keeping the drawn portion below roughly a third of the limit protects the profile. The calculator reports utilisation before and after the draw so the effect is visible.",
    },
    {
      question: "Should I draw a lump sum or take it in stages?",
      answer:
        "Interest accrues only on the money actually drawn, so taking the line down in stages costs less if the money is not needed immediately. A single large draw is simpler and locks in availability, but if the funds sit idle the interest-only payment is charged on money you are not using. Compare both amounts here before committing.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Home Equity Line Draw Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Home Equity Line Draw Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Line Details">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="limit"
                  label="Credit Limit"
                  value={limit}
                  onChange={setLimit}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="The maximum the lender will advance on the line."
                />
                <CompactInput
                  id="balance"
                  label="Current Balance"
                  value={balance}
                  onChange={setBalance}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="What you already owe on the line today."
                />
              </div>
            </SubSection>

            <SubSection title="New Draw">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="draw"
                  label="Draw Amount"
                  value={draw}
                  onChange={setDraw}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="The amount you plan to take from the line."
                />
                <CompactInput
                  id="apr"
                  label="Interest Rate"
                  value={apr}
                  onChange={setApr}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  step="0.125"
                  tooltip="Current annual rate on the line, usually a prime-based index plus a margin."
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
                  <SubSection title="Periods">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="drawMonths"
                        label="Draw Period Left"
                        value={drawMonths}
                        onChange={setDrawMonths}
                        onEnter={runCalculate}
                        suffix="mo"
                        min="0"
                        tooltip="Months remaining before the line converts to repayment."
                      />
                      <CompactInput
                        id="repayYears"
                        label="Repayment Period"
                        value={repayYears}
                        onChange={setRepayYears}
                        onEnter={runCalculate}
                        suffix="yrs"
                        min="1"
                        tooltip="Term used to amortise the balance once the draw period ends."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">
                Payment When Repayment Starts
              </div>
              <div className="text-4xl font-extrabold mb-1 tracking-tight text-foreground">
                {money(results.repayPayment)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {money(results.drawPayment)} interest-only today &middot; balance would be {money(results.newBalance)}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Available After</span>
                <span className={`font-extrabold ${results.availableAfter < 0 ? "text-destructive" : "text-foreground"}`}>
                  {money(results.availableAfter)}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">New Balance</span>
                <span className="font-extrabold text-foreground">{money(results.newBalance)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Utilization</span>
                <span className="font-extrabold text-primary">{fmt(results.utilizationAfter, 1)}%</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Phase</th>
                    <th className="p-2.5 text-right w-[120px]">Balance</th>
                    <th className="p-2.5 text-right w-[130px]">Interest</th>
                    <th className="p-2.5 pr-3 text-right w-[140px]">Cumulative</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.schedule.map((row) => (
                    <tr key={row.label} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                      <td className="p-2.5 text-right text-foreground">{money(row.balance)}</td>
                      <td className="p-2.5 text-right text-foreground">{money(row.interest)}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{money(row.cumulative)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Total Cost</td>
                    <td className="p-2.5 text-right text-foreground">—</td>
                    <td className="p-2.5 text-right text-destructive">{money(results.totalInterest)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{money(results.totalRepaid)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Credit Limit</span>
                  <span className="text-base font-bold text-foreground">{money(calcInputs.limit)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Current Balance</span>
                  <span className="text-base font-bold text-foreground">{money(calcInputs.balance)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Draw Amount</span>
                  <span className="text-base font-bold text-primary">{money(calcInputs.draw)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Available Now</span>
                  <span className="text-base font-bold text-foreground">{money(results.availableBefore)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Utilization Before</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.utilizationBefore, 1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Utilization After</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.utilizationAfter, 1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Draw-Period Payment</span>
                  <span className="text-base font-bold text-foreground">{money(results.drawPayment)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Payment Increase</span>
                  <span className="text-base font-bold text-destructive">{money(results.monthlyIncrease)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Draw-Period Interest</span>
                  <span className="text-base font-bold text-foreground">{money(results.drawInterest)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Repayment Interest</span>
                  <span className="text-base font-bold text-foreground">{money(results.repayInterest)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Interest</span>
                  <span className="text-base font-bold text-foreground">{money(results.totalInterest)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interest as % Borrowed</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.interestRatio, 1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Home Equity Line Draw Calculator?</h2>
            <p>
              A home equity line draw calculator works out what happens when you take money from a revolving home equity
              line of credit. You enter the credit limit, the balance already drawn, the amount you want to take, the rate
              on the line and the time left before repayment begins. The tool then reports the interest-only payment now,
              the amortising payment you will face when the draw period ends, your remaining availability and how the draw
              changes the utilisation of the line.
            </p>
            <p>
              A line of credit behaves differently from a term loan. Money becomes available again as you repay it, interest
              is charged only on the balance actually outstanding, and the payment during the draw period usually covers
              interest alone. That structure is flexible, but it defers principal repayment, so the balance at the end of the
              draw period is the highest it will ever be and the amortising payment is substantially larger than the
              interest-only payment that preceded it.
            </p>

            <h2 className="text-2xl font-bold mb-3">How the Draw and Payment Figures Are Calculated</h2>
            <p>
              Availability is the difference between the credit limit and the outstanding balance, and the new balance is
              simply the existing balance plus the draw. Utilisation is the balance divided by the limit, expressed as a
              percentage. The interest-only payment during the draw period is the new balance multiplied by the annual rate
              divided by twelve, and because nothing repays principal the balance is unchanged when the repayment phase
              arrives.
            </p>
            <p>
              At the end of the draw period the balance is amortised over the remaining repayment term using the standard
              instalment formula, in which the payment equals the balance multiplied by the monthly rate divided by one minus
              the monthly rate compounded back over the number of months. The calculator then walks the full schedule month
              by month, charging interest on the declining balance and adding the finance charge to a running total, so the
              table distinguishes interest paid during the draw period from interest paid during repayment.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the payment once repayment begins, with the interest-only payment and the resulting
              balance underneath. The three statistics beside it give the availability left after the draw, the new balance
              and the utilisation of the line. The breakdown table follows the journey from today's balance through the draw
              period and each five-year milestone of repayment, with interest added up as it goes.
            </p>
            <p>
              Summary Statistics collects the credit limit, current balance, draw amount, availability, utilisation before
              and after, both payment figures, the increase in the monthly obligation, the interest charged in each phase
              and the interest as a proportion of the amount borrowed. The most useful comparison is between the draw you
              are considering and the payment that follows it: if the amortising payment is uncomfortable, drawing less now
              is far cheaper than discovering the problem when the line converts.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/home-equity-line-draw-calculator" />
          <PopularCalculators exclude="/calculator/home-equity-line-draw-calculator" />
        </div>
      </div>
    </>
  );
}
