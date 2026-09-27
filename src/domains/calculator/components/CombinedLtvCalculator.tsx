"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface CltvInputs {
  value: number;
  firstMortgage: number;
  secondDrawn: number;
  secondLimit: number;
}

const DEFAULTS: CltvInputs = {
  value: 500000,
  firstMortgage: 400000,
  secondDrawn: 50000,
  secondLimit: 75000,
};

const fmt = (v: number, d = 1) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) => (Number.isFinite(v) ? "$" + v.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "—");

interface CltvResult {
  firstLtv: number;
  cltv: number;
  hcltv: number;
  totalLiens: number;
  equity: number;
  equityPercent: number;
  maxAt80: number;
  maxAt85: number;
  maxAt90: number;
  availableAt80: number;
  availableAt85: number;
  availableAt90: number;
  pmiLikely: boolean;
  highLtv: boolean;
  verdict: string;
  verdictTone: string;
  valid: boolean;
  errorMsg: string;
}

function computeCltv(i: CltvInputs): CltvResult {
  const invalid =
    i.value <= 0 || i.firstMortgage < 0 || i.secondDrawn < 0 || i.secondLimit < 0 || i.secondDrawn > i.secondLimit;

  const firstLtv = i.value > 0 ? (i.firstMortgage / i.value) * 100 : 0;
  const totalLiens = i.firstMortgage + i.secondDrawn;
  const cltv = i.value > 0 ? (totalLiens / i.value) * 100 : 0;
  const hcltv = i.value > 0 ? ((i.firstMortgage + Math.max(i.secondLimit, i.secondDrawn)) / i.value) * 100 : 0;
  const equity = i.value - totalLiens;
  const equityPercent = i.value > 0 ? (equity / i.value) * 100 : 0;

  const maxAt80 = i.value * 0.8;
  const maxAt85 = i.value * 0.85;
  const maxAt90 = i.value * 0.9;

  let verdict = "High leverage";
  let verdictTone = "text-destructive";
  if (cltv <= 80) {
    verdict = "Within conventional limit";
    verdictTone = "text-emerald-600";
  } else if (cltv <= 90) {
    verdict = "Above conventional limit";
    verdictTone = "text-amber-600";
  }

  return {
    firstLtv,
    cltv,
    hcltv,
    totalLiens,
    equity,
    equityPercent,
    maxAt80,
    maxAt85,
    maxAt90,
    availableAt80: Math.max(0, maxAt80 - totalLiens),
    availableAt85: Math.max(0, maxAt85 - totalLiens),
    availableAt90: Math.max(0, maxAt90 - totalLiens),
    pmiLikely: firstLtv > 80,
    highLtv: hcltv > 80,
    verdict,
    verdictTone,
    valid: !invalid,
    errorMsg: invalid ? "Enter a positive property value and non-negative balances, with the drawn amount at or below the limit." : "",
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

export default function CombinedLtvCalculator() {
  const [value, setValue] = useState(String(DEFAULTS.value));
  const [firstMortgage, setFirstMortgage] = useState(String(DEFAULTS.firstMortgage));
  const [secondDrawn, setSecondDrawn] = useState(String(DEFAULTS.secondDrawn));
  const [secondLimit, setSecondLimit] = useState(String(DEFAULTS.secondLimit));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): CltvInputs => ({
    value: parseFloat(value) || 0,
    firstMortgage: parseFloat(firstMortgage) || 0,
    secondDrawn: parseFloat(secondDrawn) || 0,
    secondLimit: parseFloat(secondLimit) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<CltvInputs>(() => DEFAULTS);
  const [results, setResults] = useState<CltvResult>(() => computeCltv(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeCltv(inputs));
  };

  const reset = () => {
    setValue(String(DEFAULTS.value));
    setFirstMortgage(String(DEFAULTS.firstMortgage));
    setSecondDrawn(String(DEFAULTS.secondDrawn));
    setSecondLimit(String(DEFAULTS.secondLimit));
    setCalcInputs(DEFAULTS);
    setResults(computeCltv(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is combined loan-to-value?",
      answer:
        "Combined loan-to-value, or CLTV, divides all mortgages secured by a property by its appraised value. It includes the first mortgage, any second mortgage and the drawn balance on a home equity line. Lenders use it because the first loan alone understates the risk when a second lien sits behind it.",
    },
    {
      question: "How does HCLTV differ from CLTV?",
      answer:
        "HCLTV uses the full credit limit on a home equity line rather than the amount currently drawn. Because the borrower can draw the remaining limit at any time, the potential lien is larger than the current one. Lenders price and approve on the high combined figure for exactly that reason, so an undrawn line can still constrain further borrowing.",
    },
    {
      question: "What CLTV limits do lenders apply?",
      answer:
        "Conventional first mortgages generally top out at eighty percent combined, and many programs allow up to ninety or ninety-five percent with mortgage insurance. Home equity lines commonly require a combined figure at or below eighty-five percent. Above those thresholds, pricing rises and approval becomes more dependent on credit score and reserves.",
    },
    {
      question: "How much can I borrow against my equity?",
      answer:
        "Subtract existing liens from the maximum combined loan the lender allows. At an eighty percent ceiling on a five hundred thousand dollar property, the total liens cannot exceed four hundred thousand dollars, so existing debt of four hundred and fifty thousand would leave nothing available, and any amount below that ceiling becomes the room to borrow.",
    },
    {
      question: "Can I avoid mortgage insurance with a second mortgage?",
      answer:
        "Yes, and it is a common structure. A piggyback arrangement pairs a first mortgage at eighty percent with a second for part of the remainder, keeping the first loan below the insurance threshold. The trade-off is that the second mortgage usually carries a higher rate, so the comparison is between an insurance premium and a higher rate on a smaller balance.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Combined LTV Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Combined LTV Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Property & First Lien">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="value"
                  label="Property Value"
                  value={value}
                  onChange={setValue}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Appraised value or most recent market estimate."
                />
                <CompactInput
                  id="first"
                  label="First Mortgage"
                  value={firstMortgage}
                  onChange={setFirstMortgage}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Outstanding balance on the first lien."
                />
              </div>
            </SubSection>

            <SubSection title="Second Lien">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="drawn"
                  label="Second / HELOC Balance"
                  value={secondDrawn}
                  onChange={setSecondDrawn}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Amount currently drawn on the second mortgage or line."
                />
                <CompactInput
                  id="limit"
                  label="HELOC Credit Limit"
                  value={secondLimit}
                  onChange={setSecondLimit}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Total credit available, used for the high combined ratio."
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
                  <SubSection title="Equity Ceilings">
                    <p className="text-[11px] text-muted-foreground mb-2">
                      The results panel reports borrowing room at combined limits of 80%, 85% and 90% so you can compare
                      lender programs at a glance.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-semibold text-foreground mb-1">First Lien LTV</span>
                        <span className="text-base font-bold text-primary">{fmt(results.firstLtv, 1)}%</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-semibold text-foreground mb-1">High Combined LTV</span>
                        <span className="text-base font-bold text-primary">{fmt(results.hcltv, 1)}%</span>
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Combined Loan-to-Value</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{fmt(results.cltv, 1)}%</div>
              <div className="text-sm text-muted-foreground font-medium">
                {money(results.totalLiens)} of liens on {money(calcInputs.value)} &middot;{" "}
                <span className={results.verdictTone}>{results.verdict}</span>
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">First LTV</span>
                <span className="font-extrabold text-foreground">{fmt(results.firstLtv, 1)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">HCLTV</span>
                <span className={`font-extrabold ${results.highLtv ? "text-amber-600" : "text-emerald-600"}`}>
                  {fmt(results.hcltv, 1)}%
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Equity</span>
                <span className="font-extrabold text-foreground">{money(results.equity)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Item</th>
                    <th className="p-2.5 text-right w-[130px]">Amount</th>
                    <th className="p-2.5 pr-3 text-right w-[100px]">% of Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Property Value</td>
                    <td className="p-2.5 text-right text-foreground">{money(calcInputs.value)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">100.0%</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">First Mortgage</td>
                    <td className="p-2.5 text-right text-foreground">{money(calcInputs.firstMortgage)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{fmt(results.firstLtv, 1)}%</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Second / HELOC Drawn</td>
                    <td className="p-2.5 text-right text-foreground">{money(calcInputs.secondDrawn)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">
                      {fmt(calcInputs.value > 0 ? (calcInputs.secondDrawn / calcInputs.value) * 100 : 0, 1)}%
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Undrawn Line Limit</td>
                    <td className="p-2.5 text-right text-foreground">
                      {money(Math.max(0, calcInputs.secondLimit - calcInputs.secondDrawn))}
                    </td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">
                      {fmt(calcInputs.value > 0 ? ((Math.max(0, calcInputs.secondLimit - calcInputs.secondDrawn)) / calcInputs.value) * 100 : 0, 1)}%
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Equity Remaining</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.equity)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{fmt(results.equityPercent, 1)}%</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Room to Borrow at 80%</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.availableAt80)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">80.0% cap</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Room to Borrow at 85%</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.availableAt85)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">85.0% cap</td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Room to Borrow at 90%</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.availableAt90)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">90.0% cap</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Property Value</span>
                  <span className="text-base font-bold text-foreground">{money(calcInputs.value)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Liens</span>
                  <span className="text-base font-bold text-foreground">{money(results.totalLiens)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Combined LTV</span>
                  <span className={`text-base font-bold ${results.verdictTone}`}>{fmt(results.cltv, 1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">High Combined LTV</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.hcltv, 1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Equity</span>
                  <span className="text-base font-bold text-emerald-600">{money(results.equity)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Equity Share</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.equityPercent, 1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Max Total Liens at 80%</span>
                  <span className="text-base font-bold text-foreground">{money(results.maxAt80)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Max Total Liens at 90%</span>
                  <span className="text-base font-bold text-foreground">{money(results.maxAt90)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Combined LTV Calculator?</h2>
            <p>
              A combined loan-to-value calculator adds every mortgage secured by a property and divides the total by the
              property's value. The result, known as CLTV, is the figure lenders use when a second lien sits behind a first
              mortgage. It captures leverage that the first loan alone conceals, and it drives both approval and pricing for
              home equity borrowing and refinancing.
            </p>
            <p>
              A closely related measure, the high combined ratio or HCLTV, substitutes the full credit limit on a home
              equity line for the amount currently drawn. Because an undrawn limit can be accessed at any time, lenders
              underwrite against the potential lien rather than the present one. That distinction explains why an untouched
              credit line can still limit how much additional borrowing a property supports.
            </p>

            <h2 className="text-2xl font-bold mb-3">How Combined LTV Is Calculated</h2>
            <p>
              The combined ratio adds the first mortgage balance to the drawn balance on the second mortgage or line, then
              divides by the property value and multiplies by one hundred. The high combined version adds the first mortgage
              to the full credit limit instead. Equity is the property value less all liens, and it can be expressed either
              in dollars or as a percentage of value.
            </p>
            <p>
              Borrowing capacity follows from the ceilings lenders apply. Multiplying the property value by eighty, eighty-
              five or ninety percent gives the maximum total lien at each threshold, and subtracting existing liens shows
              how much additional borrowing each threshold permits. Where those results are zero or negative, the property is
              already at or beyond the limit on a combined basis.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports the combined ratio with a verdict banded around the conventional eighty percent line,
              and the three statistics beside it give the first-lien ratio, the high combined ratio and remaining equity. The
              breakdown table lists the value, each lien, the undrawn limit, equity and the borrowing room at eighty, eighty-
              five and ninety percent combined.
            </p>
            <p>
              Summary Statistics collects the same figures together with the maximum total liens at each threshold. One
              structural point is worth remembering: a piggyback structure keeps the first mortgage at eighty percent to
              avoid mortgage insurance, but the second lien typically carries a higher rate, so the comparison is between a
              recurring insurance premium and a higher rate on a smaller balance. Run both scenarios through a payment
              calculator before choosing, and remember that a lower appraised value raises every ratio at once.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/combined-ltv-calculator" />
          <PopularCalculators exclude="/calculator/combined-ltv-calculator" />
        </div>
      </div>
    </>
  );
}
