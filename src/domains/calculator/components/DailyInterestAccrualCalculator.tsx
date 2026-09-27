"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type Basis = "365" | "360";
type Method = "simple" | "compound";

interface AccrualInputs {
  balance: number;
  apr: number;
  days: number;
  basis: Basis;
  method: Method;
}

const DEFAULTS: AccrualInputs = {
  balance: 25000,
  apr: 6.5,
  days: 30,
  basis: "365",
  method: "simple",
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface AccrualResult {
  dailyRate: number;
  dailyInterest: number;
  interest: number;
  monthlyEquivalent: number;
  effectiveAnnualPct: number;
  annualInterest: number;
  valid: boolean;
  errorMsg: string;
}

function computeAccrual(i: AccrualInputs): AccrualResult {
  const invalid = i.balance <= 0 || i.apr < 0 || i.days < 0;

  const divisor = i.basis === "360" ? 360 : 365;
  const dailyRate = i.apr / 100 / divisor;
  const dailyInterest = i.balance * dailyRate;
  const interest = i.method === "compound" ? i.balance * (Math.pow(1 + dailyRate, i.days) - 1) : dailyInterest * i.days;
  const effectiveAnnualPct = (Math.pow(1 + dailyRate, divisor) - 1) * 100;

  return {
    dailyRate,
    dailyInterest,
    interest,
    monthlyEquivalent: (i.balance * i.apr) / 100 / 12,
    effectiveAnnualPct,
    annualInterest: i.balance * (Math.pow(1 + dailyRate, divisor) - 1),
    valid: !invalid,
    errorMsg: invalid ? "Enter a positive balance, a non-negative rate, and a non-negative number of days." : "",
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

export default function DailyInterestAccrualCalculator() {
  const [balance, setBalance] = useState(String(DEFAULTS.balance));
  const [apr, setApr] = useState(String(DEFAULTS.apr));
  const [days, setDays] = useState(String(DEFAULTS.days));
  const [basis, setBasis] = useState<Basis>(DEFAULTS.basis);
  const [method, setMethod] = useState<Method>(DEFAULTS.method);
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): AccrualInputs => ({
    balance: parseFloat(balance) || 0,
    apr: parseFloat(apr) || 0,
    days: parseFloat(days) || 0,
    basis,
    method,
  });

  const [calcInputs, setCalcInputs] = useState<AccrualInputs>(() => DEFAULTS);
  const [results, setResults] = useState<AccrualResult>(() => computeAccrual(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeAccrual(inputs));
  };

  const reset = () => {
    setBalance(String(DEFAULTS.balance));
    setApr(String(DEFAULTS.apr));
    setDays(String(DEFAULTS.days));
    setBasis(DEFAULTS.basis);
    setMethod(DEFAULTS.method);
    setCalcInputs(DEFAULTS);
    setResults(computeAccrual(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is daily interest accrual?",
      answer:
        "Daily accrual means interest is calculated each day on the outstanding balance rather than once a month. The annual rate is divided by the day-count basis to produce a daily periodic rate, and that rate is applied to the balance for every day it remains outstanding. Because the interest is recalculated and charged daily, making a payment mid-cycle immediately reduces the balance that interest is charged on for every remaining day.",
    },
    {
      question: "How is the daily periodic rate calculated?",
      answer:
        "Divide the annual percentage rate by the day-count basis. Using a 365-day basis, an 8% rate produces a daily periodic rate of about 0.0219%; using a 360-day basis the same rate produces about 0.0222%. The 360-day convention is the older and slightly more expensive one, and some lenders still use it, so always check the basis stated in your agreement when comparing costs.",
    },
    {
      question: "What is the difference between simple and compound daily accrual?",
      answer:
        "Simple daily accrual charges the same daily amount on the original balance and never charges interest on interest, so the total is simply the daily interest multiplied by the number of days. Compound daily accrual adds each day's interest to the balance, so the next day's interest is charged on a slightly larger amount. Over short periods the difference is tiny, but across a year it becomes visible, and the calculator reports the effective annual rate to quantify it.",
    },
    {
      question: "Why does the monthly equivalent differ from the daily figure times thirty?",
      answer:
        "Because months are not thirty days, and the basis matters. A month has 28 to 31 days, so using daily interest multiplied by thirty is only an approximation. The monthly equivalent here applies the annual rate divided by twelve, which is how most consumer loans quote monthly interest, giving a fair comparison against a daily-accrual figure that would depend on the exact number of days in the month.",
    },
    {
      question: "Where does daily accrual matter most?",
      answer:
        "It matters most on revolving balances, student loans, and any loan where you plan to pay early or make irregular payments. Because interest is charged on the actual balance each day, paying partway through a cycle saves interest immediately, and paying a lump sum early saves more than the same amount paid near the due date. On level-payment instalment loans the difference is smaller, since the schedule already accounts for interest month by month.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Daily Interest Accrual Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Daily Interest Accrual Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Balance & Rate">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="balance"
                  label="Principal Balance"
                  value={balance}
                  onChange={setBalance}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Outstanding balance interest accrues on."
                />
                <CompactInput
                  id="apr"
                  label="Interest Rate (APR)"
                  value={apr}
                  onChange={setApr}
                  onEnter={runCalculate}
                  suffix="%"
                  step="0.01"
                  tooltip="Annual percentage rate applied to the balance."
                />
              </div>
            </SubSection>

            <SubSection title="Period">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="days"
                  label="Days"
                  value={days}
                  onChange={setDays}
                  onEnter={runCalculate}
                  suffix="days"
                  tooltip="Number of days interest accrues."
                />
                <div className="flex flex-col justify-end">
                  <div className="h-9 rounded-md border border-input bg-secondary/40 px-3 flex items-center text-sm text-muted-foreground font-medium">
                    {method === "compound" ? "Compounding" : "Simple"} &middot; {basis}-day basis
                  </div>
                </div>
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
                  <SubSection title="Day-Count & Method">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col">
                        <label htmlFor="basis" className="flex items-center text-sm font-semibold text-foreground mb-1">
                          Day-Count Basis
                        </label>
                        <div className="relative h-9">
                          <select
                            id="basis"
                            value={basis}
                            onChange={(e) => setBasis(e.target.value as Basis)}
                            className="w-full h-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground transition-all cursor-pointer font-medium"
                          >
                            <option value="365">365-day basis</option>
                            <option value="360">360-day basis</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <label htmlFor="method" className="flex items-center text-sm font-semibold text-foreground mb-1">
                          Accrual Method
                        </label>
                        <div className="relative h-9">
                          <select
                            id="method"
                            value={method}
                            onChange={(e) => setMethod(e.target.value as Method)}
                            className="w-full h-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground transition-all cursor-pointer font-medium"
                          >
                            <option value="simple">Simple (no compounding)</option>
                            <option value="compound">Compound daily</option>
                          </select>
                        </div>
                      </div>
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Interest Accrued</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">${fmt(results.interest)}</div>
              <div className="text-sm text-muted-foreground font-medium">
                Over {fmt(calcInputs.days, 0)} days at {fmt(calcInputs.apr, 2)}% on a {calcInputs.basis}-day basis
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Daily Interest</span>
                <span className="font-extrabold text-foreground">${fmt(results.dailyInterest, 3)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Monthly Equivalent</span>
                <span className="font-extrabold text-foreground">${fmt(results.monthlyEquivalent)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Effective Annual</span>
                <span className="font-extrabold text-foreground">{fmt(results.effectiveAnnualPct, 3)}%</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Accrual Input</th>
                    <th className="p-2.5 text-right w-[140px]">Value</th>
                    <th className="p-2.5 pr-3">Basis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Daily Periodic Rate</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(results.dailyRate * 100, 5)}%</td>
                    <td className="p-2.5 pr-3 text-muted-foreground">APR ÷ {calcInputs.basis}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Balance</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(calcInputs.balance, 0)}</td>
                    <td className="p-2.5 pr-3 text-muted-foreground">Principal outstanding</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Days Charged</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(calcInputs.days, 0)}</td>
                    <td className="p-2.5 pr-3 text-muted-foreground">{calcInputs.method === "compound" ? "Compounded" : "Simple"}</td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Interest</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.interest)}</td>
                    <td className="p-2.5 pr-3 text-foreground">Total accrued</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Principal Balance</span>
                  <span className="text-base font-bold text-foreground">${fmt(calcInputs.balance, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Annual Rate</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.apr, 3)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Daily Periodic Rate</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.dailyRate * 100, 5)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interest Accrued</span>
                  <span className="text-base font-bold text-primary">${fmt(results.interest)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Annual Interest</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.annualInterest, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Effective Annual Rate</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.effectiveAnnualPct, 3)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Daily Interest Accrual Calculator?</h2>
            <p>
              A daily interest accrual calculator works out how much interest builds up on a balance over a specific
              number of days, using the daily periodic rate rather than a monthly one. Credit cards, student loans,
              margin accounts and many lines of credit accrue interest this way: instead of charging a flat monthly
              amount, they divide the annual rate by the day-count basis and apply it to the balance for every day it is
              outstanding. The result is that interest is far more sensitive to the exact timing of payments than a
              monthly schedule would suggest.
            </p>
            <p>
              Because interest is charged on the actual balance each day, a payment made early in a cycle saves more than
              the same payment made late, and a balance that sits untouched for a long period grows by an amount that
              depends on the precise number of days, not the number of months. This calculator makes those daily mechanics
              explicit and reports the effective annual rate so you can compare a daily-accrual product against one quoted
              on a monthly basis.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The calculator divides the annual percentage rate by the day-count basis you select, either 365 or 360, to
              obtain the daily periodic rate. It then multiplies that rate by the balance and by the number of days. In
              simple mode the same daily amount is charged throughout, so the total is the daily interest multiplied by
              the days; in compound mode each day&apos;s interest is added to the balance, so the next day&apos;s charge is
              calculated on a slightly larger amount, using the familiar growth formula balance multiplied by
              (1 + daily rate) to the power of the days minus one.
            </p>
            <p>
              Because the two day-count bases produce different daily rates, the calculator also reports the effective
              annual rate implied by each basis: the daily rate compounded across a full year. That figure is what makes a
              daily-accrual product directly comparable to a nominal rate quoted elsewhere, since it captures the effect of
              compounding within the year.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the interest accrued over the period you entered, with its subtext stating the days,
              the annual rate and the day-count basis so the assumption is always visible. The three statistics beside it
              give the daily interest amount, the monthly equivalent using the annual rate divided by twelve, and the
              effective annual rate, which together let you translate between daily and monthly views of the same cost.
            </p>
            <p>
              The breakdown table lists the daily periodic rate, the balance, the days charged and the accrual method, so
              you can verify each step of the calculation. Summary Statistics adds the annual interest and repeats the
              effective annual rate, which is the number to use when comparing a daily-accrual loan against a product
              quoted on a different basis. Treat the results as an estimate for a single, stable balance; if the balance
              changes during the period, interest is charged on each day&apos;s actual balance, so divide the period into
              segments and add the results for the most accurate figure.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/daily-interest-accrual-calculator" />
          <PopularCalculators exclude="/calculator/daily-interest-accrual-calculator" />
        </div>
      </div>
    </>
  );
}
