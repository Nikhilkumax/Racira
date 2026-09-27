"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface IdrInputs {
  agi: number;
  familySize: number;
  balance: number;
  rate: number;
  sharePercent: number;
  forgivenessTerm: number;
  guidelineBase: number;
  perPerson: number;
}

const DEFAULTS: IdrInputs = {
  agi: 55000,
  familySize: 1,
  balance: 40000,
  rate: 6,
  sharePercent: 10,
  forgivenessTerm: 240,
  guidelineBase: 15650,
  perPerson: 5500,
};

const fmt = (v: number, d = 1) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) => (Number.isFinite(v) ? "$" + v.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "—");

interface IdrResult {
  povertyLine: number;
  threshold: number;
  discretionary: number;
  monthlyPayment: number;
  totalPaid: number;
  monthsToEvent: number;
  eventIsForgiveness: boolean;
  forgivenAmount: number;
  finalBalance: number;
  negativeAmortisation: boolean;
  schedule: { year: number; balance: number; paid: number; cumulative: number }[];
  valid: boolean;
  errorMsg: string;
}

function computeIdr(i: IdrInputs): IdrResult {
  const invalid =
    i.agi < 0 || i.familySize < 1 || i.balance <= 0 || i.rate < 0 || i.sharePercent < 0 || i.forgivenessTerm <= 0;

  const povertyLine = i.guidelineBase + i.perPerson * (Math.max(1, Math.round(i.familySize)) - 1);
  const threshold = povertyLine * 1.5;
  const discretionary = Math.max(0, i.agi - threshold);
  const monthlyPayment = (discretionary * (i.sharePercent / 100)) / 12;

  const iRate = i.rate / 100 / 12;
  const term = Math.round(i.forgivenessTerm);
  let bal = i.balance;
  let paid = 0;
  let month = 0;
  let forgiven = 0;
  let eventIsForgiveness = false;
  let negative = false;

  while (month < term && bal > 0.005) {
    const charge = bal * iRate;
    if (monthlyPayment < charge) negative = true;
    month++;
    paid += monthlyPayment;
    const growth = bal + charge;
    bal = Math.max(0, growth - monthlyPayment);
  }

  if (bal > 0.005) {
    forgiven = bal;
    eventIsForgiveness = true;
    bal = 0;
  }

  const schedule: { year: number; balance: number; paid: number; cumulative: number }[] = [];
  const years = Math.min(Math.ceil(term / 12), 12);
  let b = i.balance;
  let cum = 0;
  for (let y = 1; y <= years; y++) {
    let yearPaid = 0;
    for (let m = 0; m < 12; m++) {
      const monthsDone = (y - 1) * 12 + m;
      if (monthsDone >= month) break;
      const charge = b * iRate;
      b = Math.max(0, b + charge - monthlyPayment);
      yearPaid += monthlyPayment;
    }
    cum += yearPaid;
    schedule.push({ year: y, balance: b, paid: yearPaid, cumulative: cum });
  }

  return {
    povertyLine,
    threshold,
    discretionary,
    monthlyPayment,
    totalPaid: paid,
    monthsToEvent: month,
    eventIsForgiveness,
    forgivenAmount: forgiven,
    finalBalance: bal,
    negativeAmortisation: negative,
    schedule,
    valid: !invalid,
    errorMsg: invalid ? "Enter a non-negative income, a family size of at least one, and a positive balance and term." : "",
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

export default function IncomeDrivenRepaymentIdrEstimator() {
  const [agi, setAgi] = useState(String(DEFAULTS.agi));
  const [familySize, setFamilySize] = useState(String(DEFAULTS.familySize));
  const [balance, setBalance] = useState(String(DEFAULTS.balance));
  const [rate, setRate] = useState(String(DEFAULTS.rate));
  const [sharePercent, setSharePercent] = useState(String(DEFAULTS.sharePercent));
  const [forgivenessTerm, setForgivenessTerm] = useState(String(DEFAULTS.forgivenessTerm));
  const [guidelineBase, setGuidelineBase] = useState(String(DEFAULTS.guidelineBase));
  const [perPerson, setPerPerson] = useState(String(DEFAULTS.perPerson));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): IdrInputs => ({
    agi: parseFloat(agi) || 0,
    familySize: parseFloat(familySize) || 1,
    balance: parseFloat(balance) || 0,
    rate: parseFloat(rate) || 0,
    sharePercent: parseFloat(sharePercent) || 0,
    forgivenessTerm: parseFloat(forgivenessTerm) || 0,
    guidelineBase: parseFloat(guidelineBase) || 0,
    perPerson: parseFloat(perPerson) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<IdrInputs>(() => DEFAULTS);
  const [results, setResults] = useState<IdrResult>(() => computeIdr(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeIdr(inputs));
  };

  const reset = () => {
    setAgi(String(DEFAULTS.agi));
    setFamilySize(String(DEFAULTS.familySize));
    setBalance(String(DEFAULTS.balance));
    setRate(String(DEFAULTS.rate));
    setSharePercent(String(DEFAULTS.sharePercent));
    setForgivenessTerm(String(DEFAULTS.forgivenessTerm));
    setGuidelineBase(String(DEFAULTS.guidelineBase));
    setPerPerson(String(DEFAULTS.perPerson));
    setCalcInputs(DEFAULTS);
    setResults(computeIdr(DEFAULTS));
  };

  const faqs = [
    {
      question: "How is the income-driven payment calculated?",
      answer:
        "The payment is a percentage of discretionary income, which is your adjusted gross income minus one hundred and fifty percent of the federal poverty guideline for your family size. The percentage is set by the plan, ranging from five to twenty percent, and the annual amount is divided by twelve to give the monthly payment.",
    },
    {
      question: "What percentage does each plan use?",
      answer:
        "Undergraduate borrowers on the newest income-driven plans pay five percent of discretionary income, while plans such as PAYE and IBR generally use ten percent. The older IBR variant and the income-contingent option use fifteen and twenty percent respectively. Entering ten percent in this calculator approximates the most widely used plans.",
    },
    {
      question: "Can the balance grow under an income-driven plan?",
      answer:
        "Yes. If the calculated payment is less than the interest accruing each month, the balance rises even though payments are being made. That is expected under these plans, because the design deliberately caps the payment as a share of income. The balance simply becomes the amount that may be forgiven at the end of the term.",
    },
    {
      question: "Is forgiven student debt taxable?",
      answer:
        "Federal income tax on student loan forgiveness has been suspended for a defined window, but the treatment can change and some states tax it independently. The forgiven amount is also reported on a tax document, so a large balance discharged in one year can create a substantial unexpected liability. Confirm the current rules before relying on forgiveness in your planning.",
    },
    {
      question: "Does marrying change my income-driven payment?",
      answer:
        "It can, and substantially. Spouses who file jointly typically have both incomes counted in the payment calculation, which can more than double the required amount. Filing separately can keep a spouse's income out of the calculation under some plans, but it forfeits other joint tax benefits, so the two effects need to be compared directly.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Income-Driven Repayment (IDR) Estimator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Income-Driven Repayment (IDR) Estimator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Income & Household">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="agi"
                  label="Adjusted Gross Income"
                  value={agi}
                  onChange={setAgi}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Income figure used for the payment calculation."
                />
                <CompactInput
                  id="family"
                  label="Family Size"
                  value={familySize}
                  onChange={setFamilySize}
                  onEnter={runCalculate}
                  min="1"
                  tooltip="Household size, which sets the poverty guideline."
                />
              </div>
            </SubSection>

            <SubSection title="Student Loan">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="balance"
                  label="Loan Balance"
                  value={balance}
                  onChange={setBalance}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Current balance across eligible loans."
                />
                <CompactInput
                  id="rate"
                  label="Interest Rate"
                  value={rate}
                  onChange={setRate}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  step="0.25"
                  tooltip="Average rate across the loans."
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
                  <SubSection title="Plan Parameters">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="share"
                        label="Share of Discretionary"
                        value={sharePercent}
                        onChange={setSharePercent}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        step="1"
                        tooltip="Plan percentage: 5% newer plans, 10% PAYE and IBR, 15-20% older plans."
                      />
                      <CompactInput
                        id="term"
                        label="Forgiveness Term"
                        value={forgivenessTerm}
                        onChange={setForgivenessTerm}
                        onEnter={runCalculate}
                        suffix="mo"
                        min="1"
                        tooltip="Months until any remaining balance is forgiven."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <CompactInput
                        id="base"
                        label="Poverty Guideline"
                        value={guidelineBase}
                        onChange={setGuidelineBase}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Annual guideline for a household of one in your region."
                      />
                      <CompactInput
                        id="per"
                        label="Per Extra Person"
                        value={perPerson}
                        onChange={setPerPerson}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Additional guideline amount for each person beyond one."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Estimated Monthly Payment</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {money(results.monthlyPayment)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {fmt(calcInputs.sharePercent, 1)}% of {money(results.discretionary)} discretionary income &middot;{" "}
                {results.eventIsForgiveness ? "balance forgiven at term end" : "loan repaid in full"}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Paid</span>
                <span className="font-extrabold text-foreground">{money(results.totalPaid)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Forgiven</span>
                <span className="font-extrabold text-primary">{money(results.forgivenAmount)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Months to End</span>
                <span className="font-extrabold text-foreground">{results.monthsToEvent}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Year</th>
                    <th className="p-2.5 text-right w-[130px]">Balance</th>
                    <th className="p-2.5 text-right w-[110px]">Paid</th>
                    <th className="p-2.5 pr-3 text-right w-[130px]">Cumulative</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.schedule.map((row) => (
                    <tr key={row.year} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">Year {row.year}</td>
                      <td className="p-2.5 text-right text-foreground">{money(row.balance)}</td>
                      <td className="p-2.5 text-right text-foreground">{money(row.paid)}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{money(row.cumulative)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">
                      {results.eventIsForgiveness ? "Forgiveness" : "Paid in full"}
                    </td>
                    <td className="p-2.5 text-right text-foreground">
                      {results.eventIsForgiveness ? money(results.forgivenAmount) : money(0)}
                    </td>
                    <td className="p-2.5 text-right text-foreground">{money(results.totalPaid)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{money(results.totalPaid)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Poverty Guideline</span>
                  <span className="text-base font-bold text-foreground">{money(results.povertyLine)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">150% Threshold</span>
                  <span className="text-base font-bold text-foreground">{money(results.threshold)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Discretionary Income</span>
                  <span className="text-base font-bold text-foreground">{money(results.discretionary)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Monthly Payment</span>
                  <span className="text-base font-bold text-primary">{money(results.monthlyPayment)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Starting Balance</span>
                  <span className="text-base font-bold text-foreground">{money(calcInputs.balance)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Paid</span>
                  <span className="text-base font-bold text-foreground">{money(results.totalPaid)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Amount Forgiven</span>
                  <span className="text-base font-bold text-emerald-600">{money(results.forgivenAmount)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Balance Grows</span>
                  <span className="text-base font-bold text-foreground">{results.negativeAmortisation ? "Yes" : "No"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is an Income-Driven Repayment Estimator?</h2>
            <p>
              An income-driven repayment estimator calculates the monthly payment a federal student loan borrower would owe
              under a plan that scales payments to income rather than to the balance. Every such plan starts from the same
              building block: discretionary income, defined as adjusted gross income above one hundred and fifty percent of
              the federal poverty guideline for the household size. A plan-specific percentage of that figure becomes the
              annual payment.
            </p>
            <p>
              The estimator answers the two questions borrowers actually ask. The first is what the payment will be, which
              determines whether the plan is affordable. The second, and often more consequential, is what happens over the
              full term: whether the loan is repaid in full or whether a residual balance is forgiven after twenty or
              twenty-five years, and how much has been paid by then.
            </p>

            <h2 className="text-2xl font-bold mb-3">How the Payment Is Derived</h2>
            <p>
              The poverty guideline is scaled by household size, using a base figure for one person plus an increment for
              each additional member, and then multiplied by one and a half. That threshold is subtracted from adjusted
              gross income, and the remainder is floored at zero so a low earner owes nothing. The plan percentage is
              applied to discretionary income and the result divided by twelve. Because the payment is recalculated annually
              from tax data, a rising salary raises the payment on the same schedule.
            </p>
            <p>
              The loan itself is then amortised month by month against that payment. Interest accrues at the stated rate and
              the payment is applied to the resulting balance. Where the payment is smaller than the interest charge the
              balance grows, which is a normal feature of these plans rather than an error. The simulation runs to the end of
              the forgiveness term, and whatever remains becomes the forgiven amount.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the estimated monthly payment with the discretionary income it is based on, and states
              whether the loan would be repaid or forgiven. The three statistics beside it give the total paid, the amount
              forgiven and the number of months to the end of the plan. The breakdown table projects the balance, the annual
              payments and the cumulative cost year by year, so the arc of the loan is visible rather than just its
              endpoint.
            </p>
            <p>
              Summary Statistics adds the poverty guideline, the one hundred and fifty percent threshold, the discretionary
              income figure, the starting balance and whether the balance grows at all. Two cautions apply. Forgiveness is
              typically a taxable event, so a large discharge can create a tax bill in the year it lands, and the current
              federal exclusion is time-limited. And a very low payment means the balance compounds rather than shrinks, so
              compare the total paid under the plan against what a shorter, higher payment schedule would cost.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/income-driven-repayment-idr-estimator" />
          <PopularCalculators exclude="/calculator/income-driven-repayment-idr-estimator" />
        </div>
      </div>
    </>
  );
}
