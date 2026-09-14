"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, RotateCcw, Printer } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";

// ── 1. TypeScript interfaces ──────────────────────────────────────────────
type FilingStatus = "single" | "married" | "head";

interface TaxInputs {
  grossIncome: number;
  withheld: number;
  filingStatus: FilingStatus;
  dependents: number;
  preTaxDeductions: number;
  itemizedDeductions: number;
  otherCredits: number;
}

interface TaxResult {
  taxableIncome: number;
  taxLiability: number;
  totalCredits: number;
  netTax: number;
  refundAmount: number;
  isRefund: boolean;
  effectiveRate: number;
  marginalRate: number;
  standardDeduction: number;
  deductionUsed: number;
  isItemized: boolean;
}

// ── 2. Pure calculation function ──────────────────────────────────────────
const calculate = (i: TaxInputs): TaxResult => {
  const standardDeduction =
    i.filingStatus === "married" ? 29200 : i.filingStatus === "head" ? 21900 : 14600;
  const deductionUsed = Math.max(standardDeduction, i.itemizedDeductions);
  const isItemized = i.itemizedDeductions > standardDeduction;

  const adjustedGrossIncome = Math.max(0, i.grossIncome - i.preTaxDeductions);
  const taxableIncome = Math.max(0, adjustedGrossIncome - deductionUsed);

  const singleBrackets = [
    { limit: 11600, rate: 0.1 }, { limit: 47150, rate: 0.12 }, { limit: 100525, rate: 0.22 },
    { limit: 191950, rate: 0.24 }, { limit: 243725, rate: 0.32 }, { limit: 609350, rate: 0.35 }, { limit: Infinity, rate: 0.37 },
  ];
  const marriedBrackets = [
    { limit: 23200, rate: 0.1 }, { limit: 94300, rate: 0.12 }, { limit: 201050, rate: 0.22 },
    { limit: 383900, rate: 0.24 }, { limit: 487450, rate: 0.32 }, { limit: 731200, rate: 0.35 }, { limit: Infinity, rate: 0.37 },
  ];
  const headBrackets = [
    { limit: 16550, rate: 0.1 }, { limit: 63100, rate: 0.12 }, { limit: 100500, rate: 0.22 },
    { limit: 191950, rate: 0.24 }, { limit: 243700, rate: 0.32 }, { limit: 609350, rate: 0.35 }, { limit: Infinity, rate: 0.37 },
  ];

  const brackets = i.filingStatus === "married" ? marriedBrackets : i.filingStatus === "head" ? headBrackets : singleBrackets;

  let taxLiability = 0;
  let remaining = taxableIncome;
  let prevLimit = 0;
  let marginalRate = 0;

  for (const b of brackets) {
    if (remaining > 0) {
      marginalRate = b.rate * 100;
      const taxableInBracket = Math.min(remaining, b.limit - prevLimit);
      taxLiability += taxableInBracket * b.rate;
      remaining -= taxableInBracket;
    }
    prevLimit = b.limit;
    if (remaining <= 0) break;
  }

  const totalCredits = i.dependents * 2000 + i.otherCredits;
  const netTax = Math.max(0, taxLiability - totalCredits);
  const refundAmount = Math.abs(i.withheld - netTax);
  const isRefund = i.withheld - netTax >= 0;
  const effectiveRate = i.grossIncome > 0 ? (netTax / i.grossIncome) * 100 : 0;

  return {
    taxableIncome, taxLiability, totalCredits, netTax, refundAmount, isRefund,
    effectiveRate, marginalRate, standardDeduction, deductionUsed, isItemized,
  };
};

// ── 3. DEFAULTS ────────────────────────────────────────────────────────────
const DEFAULTS: TaxInputs = {
  grossIncome: 75000,
  withheld: 10000,
  filingStatus: "single",
  dependents: 0,
  preTaxDeductions: 6000,
  itemizedDeductions: 12000,
  otherCredits: 0,
};

const fmt = (n: number, dec = 0) =>
  n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });

const parse = (v: string, fallback: number) => {
  const n = parseFloat(v);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

const CompactInput = ({
  id,
  label,
  value,
  onChange,
  prefix,
  suffix,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  prefix?: string;
  suffix?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium text-foreground mb-1">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && (
        <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">
          {prefix}
        </span>
      )}
      <input
        id={id}
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
      />
      {suffix && (
        <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">
          {suffix}
        </span>
      )}
    </div>
  </div>
);

// ── 4. Component ───────────────────────────────────────────────────────────
export default function TaxRefundCalculator() {
  const [inputs, setInputs] = useState({
    grossIncome: String(DEFAULTS.grossIncome),
    withheld: String(DEFAULTS.withheld),
    filingStatus: DEFAULTS.filingStatus,
    dependents: String(DEFAULTS.dependents),
    preTaxDeductions: String(DEFAULTS.preTaxDeductions),
    itemizedDeductions: String(DEFAULTS.itemizedDeductions),
    otherCredits: String(DEFAULTS.otherCredits),
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<TaxResult>(() => calculate(DEFAULTS));
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResult(calculate(DEFAULTS));
  }, []);

  const parsed: TaxInputs = {
    grossIncome: parse(inputs.grossIncome, 0),
    withheld: parse(inputs.withheld, 0),
    filingStatus: inputs.filingStatus as FilingStatus,
    dependents: parseInt(inputs.dependents) || 0,
    preTaxDeductions: parse(inputs.preTaxDeductions, 0),
    itemizedDeductions: parse(inputs.itemizedDeductions, 0),
    otherCredits: parse(inputs.otherCredits, 0),
  };

  const valErrors: Record<string, string> = {};
  if (parsed.grossIncome <= 0) valErrors.grossIncome = "Gross income must be greater than 0";
  if (parsed.withheld <= 0) valErrors.withheld = "Withheld amount must be greater than 0";
  if (parsed.preTaxDeductions > parsed.grossIncome) valErrors.preTaxDeductions = "Pre-tax deductions cannot exceed gross income";
  const hasErrors = Object.keys(valErrors).length > 0;

  const handleCalculate = () => {
    setResult(calculate(parsed));
  };

  const reset = () => {
    setInputs({
      grossIncome: String(DEFAULTS.grossIncome),
      withheld: String(DEFAULTS.withheld),
      filingStatus: DEFAULTS.filingStatus,
      dependents: String(DEFAULTS.dependents),
      preTaxDeductions: String(DEFAULTS.preTaxDeductions),
      itemizedDeductions: String(DEFAULTS.itemizedDeductions),
      otherCredits: String(DEFAULTS.otherCredits),
    });
    setShowAdvanced(false);
    setResult(calculate(DEFAULTS));
  };

  const handlePrint = () => {
    window.print();
  };

  const r = result;

  const faqs = [
    {
      question: "What is the standard deduction for 2024?",
      answer:
        "For the 2024 tax year the standard deduction is $14,600 for single filers, $29,200 for married couples filing jointly, and $21,900 for heads of household. This amount is subtracted from adjusted gross income to arrive at taxable income.",
    },
    {
      question: "How does the Child Tax Credit affect my refund?",
      answer:
        "The Child Tax Credit provides up to $2,000 per qualifying child under age 17. As a credit it reduces tax liability dollar-for-dollar, making it far more powerful than a deduction of the same size.",
    },
    {
      question: "Why did I owe money instead of getting a refund?",
      answer:
        "You owe when your total tax liability exceeds the tax withheld from your paychecks. This often happens with multiple jobs, investment income, or a W-4 that was never updated after marriage, a new baby, or a raise.",
    },
    {
      question: "How long does it take to get a tax refund?",
      answer:
        "Most taxpayers receive refunds within 21 days of e-filing with direct deposit. Paper returns take 6 to 12 weeks. EITC and Additional Child Tax Credit claims cannot be issued before mid-February by law.",
    },
  ];

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-section, .print-section * { visibility: visible; }
          .print-section { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
        }
      `}</style>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator/finance" }, { label: "Tax Refund Estimator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Tax Refund Estimator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div
            className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible"
            onKeyDown={(e) => { if (e.key === "Enter") handleCalculate(); }}
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <CompactInput id="gross-income" label="Annual Gross Income" value={inputs.grossIncome} onChange={(v) => setInputs({ ...inputs, grossIncome: v })} prefix="$" />
                {valErrors.grossIncome && <p className="text-xs text-red-500 font-medium mt-1">{valErrors.grossIncome}</p>}
              </div>
              <div className="flex flex-col">
                <CompactInput id="withheld" label="Federal Tax Withheld" value={inputs.withheld} onChange={(v) => setInputs({ ...inputs, withheld: v })} prefix="$" />
                {valErrors.withheld && <p className="text-xs text-red-500 font-medium mt-1">{valErrors.withheld}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label htmlFor="filing-status" className="text-sm font-medium text-foreground mb-1">
                  Filing Status
                </label>
                <div className="relative">
                  <select
                    id="filing-status"
                    value={inputs.filingStatus}
                    onChange={(e) => setInputs({ ...inputs, filingStatus: e.target.value as FilingStatus })}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground transition-all cursor-pointer font-medium appearance-none pr-8"
                  >
                    <option value="single">Single</option>
                    <option value="married">Married Filing Jointly</option>
                    <option value="head">Head of Household</option>
                  </select>
                  <ChevronDown className="h-4 w-4 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              <CompactInput id="dependents" label="Dependents (Kids < 17)" value={inputs.dependents} onChange={(v) => setInputs({ ...inputs, dependents: v })} suffix="kids" />
            </div>

            {/* ADVANCED OPTIONS */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1 focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up !overflow-visible">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Retirement & Benefits</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <CompactInput id="pretax" label="Pre-Tax Deductions (401k, HSA, etc.)" value={inputs.preTaxDeductions} onChange={(v) => setInputs({ ...inputs, preTaxDeductions: v })} prefix="$" />
                        {valErrors.preTaxDeductions && <p className="text-xs text-red-500 font-medium mt-1">{valErrors.preTaxDeductions}</p>}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Deductions</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <CompactInput id="itemized" label="Itemized Deductions (overrides standard)" value={inputs.itemizedDeductions} onChange={(v) => setInputs({ ...inputs, itemizedDeductions: v })} prefix="$" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Credits</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <CompactInput id="other-credits" label="Other Tax Credits" value={inputs.otherCredits} onChange={(v) => setInputs({ ...inputs, otherCredits: v })} prefix="$" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                disabled={hasErrors}
                onClick={handleCalculate}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-md font-bold h-10 text-base transition-all shadow-sm ${
                  hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground active:scale-[0.98]"
                }`}
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

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-4 print-section" ref={printRef}>
            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="flex justify-end absolute top-3 right-3">
                <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
              </div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{r.isRefund ? "Estimated Tax Refund" : "Estimated Amount Owed"}</div>
              <div className="text-4xl font-bold text-primary">${fmt(r.refundAmount)}</div>
              <div className="text-sm text-muted-foreground">
                {r.isRefund
                  ? "You overpaid through withholding — this is your money coming back."
                  : "You underpaid — this is the balance due with your return."}
              </div>
            </div>

            {/* 2. THREE-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Effective Rate</span>
                <span className="font-extrabold text-foreground">{fmt(r.effectiveRate, 1)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Marginal Bracket</span>
                <span className="font-extrabold text-orange-500">{fmt(r.marginalRate, 0)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Deduction Used</span>
                <span className={`font-extrabold ${r.isItemized ? "text-emerald-600" : "text-emerald-600"}`}>{r.isItemized ? "Itemized" : "Standard"}</span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-base">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-3 pl-4">Line Item</th>
                    <th className="p-3 pr-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="py-2.5 px-4">Gross Income</td>
                    <td className="py-2.5 px-4 text-right font-semibold">${fmt(parsed.grossIncome)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="py-2.5 px-4">Pre-Tax Deductions</td>
                    <td className="py-2.5 px-4 text-right text-emerald-600">−${fmt(parsed.preTaxDeductions)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="py-2.5 px-4">{r.isItemized ? "Itemized Deductions" : "Standard Deduction"}</td>
                    <td className="py-2.5 px-4 text-right text-emerald-600">−${fmt(r.deductionUsed)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors border-t-2 border-border font-bold">
                    <td className="py-2.5 px-4">Taxable Income</td>
                    <td className="py-2.5 px-4 text-right">${fmt(r.taxableIncome)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="py-2.5 px-4">Estimated Tax Liability</td>
                    <td className="py-2.5 px-4 text-right text-muted-foreground">${fmt(r.taxLiability)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="py-2.5 px-4">Total Tax Credits</td>
                    <td className="py-2.5 px-4 text-right text-emerald-600">−${fmt(r.totalCredits)}</td>
                  </tr>
                  <tr className="bg-amber-500/10 border-t-2 border-border font-bold">
                    <td className="py-2.5 px-4 text-amber-700">Net Tax Due</td>
                    <td className="py-2.5 px-4 text-right text-amber-700">${fmt(r.netTax)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                <div className="flex justify-between"><span className="text-muted-foreground">Refund / Owed:</span><span className="font-semibold">{r.isRefund ? "Refund" : "Owed"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Amount:</span><span className="font-semibold">${fmt(r.refundAmount)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Effective Rate:</span><span className="font-semibold">{fmt(r.effectiveRate, 1)}%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Marginal Bracket:</span><span className="font-semibold">{fmt(r.marginalRate, 0)}%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Deduction Used:</span><span className="font-semibold">{r.isItemized ? "Itemized" : "Standard"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Taxable Income:</span><span className="font-semibold">${fmt(r.taxableIncome)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tax Liability:</span><span className="font-semibold">${fmt(r.taxLiability)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tax Credits:</span><span className="font-semibold">${fmt(r.totalCredits)}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="mt-12 space-y-8 text-base text-foreground">
            <div>
              <h2 className="text-2xl font-bold mb-3">What Is a Tax Refund Estimator?</h2>
              <p className="text-muted-foreground leading-relaxed">
                A tax refund estimator projects whether you will receive a refund or owe a balance when you file, based on your income, withholding, filing status, and deductions. It applies the official IRS standard deductions and progressive tax brackets to your gross income, subtracts any credits, and compares the resulting tax bill against what your employer already withheld from your paychecks. A refund is not a bonus — it is simply the return of money you overpaid during the year. Understanding the mechanics lets you plan ahead, adjust your W-4 if your refund is consistently large, and avoid the surprise of an unexpected balance due in April.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">
                The calculation follows the IRS sequence. Start with gross income and subtract pre-tax deductions such as 401(k) or HSA contributions to reach adjusted gross income. Subtract the standard deduction — $14,600 for single filers, $29,200 for married filing jointly, and $21,900 for heads of household for the 2024 tax year — or your itemized deductions when they are larger. The result is taxable income, which is pushed through the seven progressive brackets so each slice of income is taxed at its own rate. Tax credits, including $2,000 per qualifying dependent child, then reduce the liability dollar-for-dollar. Finally, the net tax is compared with federal tax withheld: more withheld means a refund, less means a balance due. The calculator's Advanced Options let you add pre-tax deductions, itemized deductions, and other credits for a closer estimate.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">
                Check the effective rate — your true average tax on total income — against the marginal bracket, which is the rate applied to your next dollar of earnings. The gap between them is normal: progressive brackets tax only the top slice at the highest rate. If your refund is large, you are giving the government an interest-free loan; adjusting your W-4 puts that money in your paycheck instead. If you owe, increase withholding or make estimated payments. Treat this estimate as a planning tool, not a filing substitute — dividends, capital gains, self-employment tax, and state taxes are outside its scope, and the IRS's official withholding calculator is the authority for W-4 decisions.
              </p>
            </div>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/tax-refund-calculator" />
          <PopularCalculators exclude="/calculator/tax-refund-calculator" />
        </div>
      </div>
    </>
  );
}