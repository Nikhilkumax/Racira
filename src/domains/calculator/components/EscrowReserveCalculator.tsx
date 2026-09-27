"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface EscrowInputs {
  tax: number;
  taxMonth: number;
  insurance: number;
  insuranceMonth: number;
  pmi: number;
  hoa: number;
  other: number;
  cushionMonths: number;
  opening: number;
}

const DEFAULTS: EscrowInputs = {
  tax: 4800,
  taxMonth: 11,
  insurance: 1650,
  insuranceMonth: 6,
  pmi: 720,
  hoa: 0,
  other: 0,
  cushionMonths: 2,
  opening: 900,
};

// 12 CFR 1024.17(c)(1)(ii): a servicer may require a cushion of no more than
// two months of escrow payments at the low point of the account.
const RESPA_CUSHION_CAP = 2;

const fmt = (v: number, d = 1) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "—";

interface EscrowItem {
  label: string;
  annual: number;
  monthly: number;
  share: number;
}

interface EscrowResult {
  annualCharges: number;
  baseMonthly: number;
  monthlyEscrow: number;
  cushionRequired: number;
  cushionUsed: number;
  aggregateAdjustment: number;
  lowPoint: number;
  lowPointMonth: number;
  lowPointShortfall: number;
  paymentForFullCushion: number;
  endingBalance: number;
  surplus: number;
  shortage: number;
  opening: number;
  totalIn: number;
  totalOut: number;
  items: EscrowItem[];
  schedule: { month: number; paidIn: number; paidOut: number; balance: number }[];
  valid: boolean;
  errorMsg: string;
}

function computeEscrow(i: EscrowInputs): EscrowResult {
  const tax = Math.max(0, i.tax);
  const insurance = Math.max(0, i.insurance);
  const pmi = Math.max(0, i.pmi);
  const hoa = Math.max(0, i.hoa);
  const other = Math.max(0, i.other);
  const annualCharges = tax + insurance + pmi + hoa + other;
  const baseMonthly = annualCharges / 12;

  const cushionUsed = Math.min(Math.max(0, Math.floor(i.cushionMonths)), RESPA_CUSHION_CAP);
  const cushionRequired = baseMonthly * cushionUsed;
  const opening = Math.max(0, i.opening);

  // First-year collection: the account must cover every disbursement and finish
  // with the cushion intact, so the annual charges plus the cushion, less whatever
  // the borrower pays in at closing, is spread over twelve monthly payments.
  const monthlyEscrow = Math.max(0, (annualCharges + cushionRequired - opening) / 12);
  const aggregateAdjustment = monthlyEscrow - baseMonthly;

  const taxMonth = Math.min(12, Math.max(1, Math.round(i.taxMonth || 1)));
  const insuranceMonth = Math.min(12, Math.max(1, Math.round(i.insuranceMonth || 1)));
  const monthlyPmi = pmi / 12;
  const monthlyHoa = hoa / 12;
  const monthlyOther = other / 12;

  let bal = opening;
  const schedule: { month: number; paidIn: number; paidOut: number; balance: number }[] = [];
  let lowPoint = bal;
  let lowPointMonth = 0;
  let totalIn = 0;
  let totalOut = 0;

  for (let m = 1; m <= 12; m++) {
    const paidIn = monthlyEscrow;
    let paidOut = monthlyPmi + monthlyHoa + monthlyOther;
    if (m === taxMonth) paidOut += tax;
    if (m === insuranceMonth) paidOut += insurance;
    bal = bal + paidIn - paidOut;
    totalIn += paidIn;
    totalOut += paidOut;
    schedule.push({ month: m, paidIn, paidOut, balance: bal });
    if (bal < lowPoint) {
      lowPoint = bal;
      lowPointMonth = m;
    }
  }

  const surplus = Math.max(0, bal - cushionRequired);
  const shortage = Math.max(0, cushionRequired - bal);

  // The binding regulatory test is the low point, not the year-end balance: the
  // cushion must still be intact when the account is at its thinnest. When grouped
  // bills pull the low point under the cushion the servicer has to collect more,
  // so the payment that would hold the cushion is worked out from the low month.
  const lowPointShortfall = Math.max(0, cushionRequired - lowPoint);
  let disbursedToLowPoint = 0;
  for (const row of schedule) {
    disbursedToLowPoint += row.paidOut;
    if (row.month === lowPointMonth) break;
  }
  const paymentForFullCushion =
    lowPointMonth > 0 ? Math.max(0, (cushionRequired + disbursedToLowPoint - opening) / lowPointMonth) : monthlyEscrow;

  const items: EscrowItem[] = [
    { label: "Property Tax", annual: tax, monthly: tax / 12, share: 0 },
    { label: "Home Insurance", annual: insurance, monthly: insurance / 12, share: 0 },
    { label: "Mortgage Insurance (MIP)", annual: pmi, monthly: monthlyPmi, share: 0 },
    { label: "HOA Dues", annual: hoa, monthly: monthlyHoa, share: 0 },
    { label: "Flood & Other Charges", annual: other, monthly: monthlyOther, share: 0 },
  ]
    .filter((x) => x.annual > 0.004)
    .map((x) => ({ ...x, share: annualCharges > 0 ? (x.annual / annualCharges) * 100 : 0 }));

  const invalid =
    i.tax < 0 ||
    i.insurance < 0 ||
    i.pmi < 0 ||
    i.hoa < 0 ||
    i.other < 0 ||
    i.cushionMonths < 0 ||
    i.opening < 0 ||
    annualCharges <= 0 ||
    i.taxMonth < 1 ||
    i.taxMonth > 12 ||
    i.insuranceMonth < 1 ||
    i.insuranceMonth > 12;
  const errorMsg = invalid
    ? "Enter non-negative annual charges and disbursement months between 1 and 12, with at least one escrowed item."
    : "";

  return {
    annualCharges,
    baseMonthly,
    monthlyEscrow,
    cushionRequired,
    cushionUsed,
    aggregateAdjustment,
    lowPoint,
    lowPointMonth,
    lowPointShortfall,
    paymentForFullCushion,
    endingBalance: bal,
    surplus,
    shortage,
    opening,
    totalIn,
    totalOut,
    items,
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

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function EscrowReserveCalculator() {
  const [tax, setTax] = useState(String(DEFAULTS.tax));
  const [insurance, setInsurance] = useState(String(DEFAULTS.insurance));
  const [other, setOther] = useState(String(DEFAULTS.other));
  const [cushionMonths, setCushionMonths] = useState(String(DEFAULTS.cushionMonths));
  const [taxMonth, setTaxMonth] = useState(String(DEFAULTS.taxMonth));
  const [insuranceMonth, setInsuranceMonth] = useState(String(DEFAULTS.insuranceMonth));
  const [pmi, setPmi] = useState(String(DEFAULTS.pmi));
  const [hoa, setHoa] = useState(String(DEFAULTS.hoa));
  const [opening, setOpening] = useState(String(DEFAULTS.opening));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): EscrowInputs => ({
    tax: parseFloat(tax) || 0,
    taxMonth: parseFloat(taxMonth) || 1,
    insurance: parseFloat(insurance) || 0,
    insuranceMonth: parseFloat(insuranceMonth) || 1,
    pmi: parseFloat(pmi) || 0,
    hoa: parseFloat(hoa) || 0,
    other: parseFloat(other) || 0,
    cushionMonths: parseFloat(cushionMonths) || 0,
    opening: parseFloat(opening) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<EscrowInputs>(() => DEFAULTS);
  const [results, setResults] = useState<EscrowResult>(() => computeEscrow(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeEscrow(inputs));
  };

  const reset = () => {
    setTax(String(DEFAULTS.tax));
    setInsurance(String(DEFAULTS.insurance));
    setOther(String(DEFAULTS.other));
    setCushionMonths(String(DEFAULTS.cushionMonths));
    setTaxMonth(String(DEFAULTS.taxMonth));
    setInsuranceMonth(String(DEFAULTS.insuranceMonth));
    setPmi(String(DEFAULTS.pmi));
    setHoa(String(DEFAULTS.hoa));
    setOpening(String(DEFAULTS.opening));
    setCalcInputs(DEFAULTS);
    setResults(computeEscrow(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is an escrow reserve?",
      answer:
        "An escrow reserve is the pool of money your mortgage servicer holds to pay bills that protect the property, most commonly property tax and hazard insurance. You pay into it every month as part of your mortgage payment, and the servicer disburses the full amount when each bill falls due. The reserve exists because those bills arrive once or twice a year while the household budget is monthly.",
    },
    {
      question: "How much of a cushion can the servicer require?",
      answer:
        "Under the Real Estate Settlement Procedures Act, a servicer may require a cushion of no more than two months of escrow payments at the low point of the account in a twelve month period. That low point is the moment just after the largest annual bill has been paid and before the following month's deposit has built the balance back up.",
    },
    {
      question: "Why is my escrow payment more than a twelfth of my annual bills?",
      answer:
        "Because the account also has to finish the year holding the cushion, and because the bills are grouped rather than spread evenly. The monthly payment collects the annual charges plus the cushion, less whatever you paid in at closing, across twelve months. When the opening balance is small the shortfall has to be made up inside the year, which lifts the payment above the simple twelfth.",
    },
    {
      question: "What are an escrow shortage and a surplus?",
      answer:
        "If the account cannot reach the required cushion by the end of the computational year, the servicer reports a shortage and either collects it in a lump sum or spreads it across the next twelve payments. If the balance finishes above the cushion, the excess is a surplus, which is refunded above a small threshold or credited to future payments.",
    },
    {
      question: "Can I cancel my escrow account?",
      answer:
        "Once your loan-to-value ratio is low enough, most conventional servicers will waive escrow on request, and you then pay the tax and insurance bills directly. Government-backed and high-loan-to-value loans usually require escrow for a set period. Paying the bills yourself removes the cushion from your monthly payment but also means budgeting the full annual premium yourself.",
    },
  ];

  const maxBalance = Math.max(...results.schedule.map((r) => r.balance), 1);

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Escrow Reserve Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Escrow Reserve Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Annual Escrowed Bills">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="tax"
                  label="Property Tax (Annual)"
                  value={tax}
                  onChange={setTax}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="The full annual tax bill the servicer will pay on your behalf."
                />
                <CompactInput
                  id="insurance"
                  label="Home Insurance (Annual)"
                  value={insurance}
                  onChange={setInsurance}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="The full annual hazard insurance premium."
                />
                <CompactInput
                  id="other"
                  label="Flood & Other (Annual)"
                  value={other}
                  onChange={setOther}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Any other annual charge the servicer escrows, such as flood cover or a condominium master policy."
                />
                <CompactInput
                  id="cushion"
                  label="Escrow Cushion"
                  value={cushionMonths}
                  onChange={setCushionMonths}
                  onEnter={runCalculate}
                  suffix="mo"
                  min="0"
                  max="2"
                  step="1"
                  tooltip="Months of payments the servicer may hold in reserve. Federal rules cap this at two."
                />
              </div>
            </SubSection>

            {results.cushionUsed < Math.max(0, Math.floor(parseFloat(cushionMonths) || 0)) && (
              <p className="text-[11px] text-amber-600 font-semibold">
                Cushion capped at {RESPA_CUSHION_CAP} months — 12 CFR 1024.17(c)(1)(ii) allows no more than two months of
                escrow payments at the low point.
              </p>
            )}

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
                  <SubSection title="Disbursement Timing">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="tax-month"
                        label="Tax Bill Month"
                        value={taxMonth}
                        onChange={setTaxMonth}
                        onEnter={runCalculate}
                        min="1"
                        max="12"
                        step="1"
                        tooltip="Month of the year the tax bill is disbursed, 1 for January through 12 for December."
                      />
                      <CompactInput
                        id="insurance-month"
                        label="Insurance Renewal"
                        value={insuranceMonth}
                        onChange={setInsuranceMonth}
                        onEnter={runCalculate}
                        min="1"
                        max="12"
                        step="1"
                        tooltip="Month of the year the insurance premium is disbursed."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Other Escrowed Charges">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="pmi"
                        label="Mortgage Insurance"
                        value={pmi}
                        onChange={setPmi}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Annual mortgage insurance or FHA mortgage insurance premium, if the servicer collects it monthly."
                      />
                      <CompactInput
                        id="hoa"
                        label="HOA Dues (Annual)"
                        value={hoa}
                        onChange={setHoa}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Annual association dues if your servicer escrows them. Leave at zero when you pay the association directly."
                      />
                      <CompactInput
                        id="opening"
                        label="Opening Deposit"
                        value={opening}
                        onChange={setOpening}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Money already in escrow, typically the cushion collected at closing. Leave at zero for a fresh account."
                      />
                    </div>
                  </SubSection>

                  <SubSection title="Method Notes">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      The projection covers a single twelve month cycle using the aggregate method: the monthly payment
                      collects the annual charges plus the cushion, less the opening balance, and every item is disbursed in
                      full on the month you specify. Changing a disbursement month moves the low point of the account and so
                      moves the payment.
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Monthly Escrow Payment</div>
              <div className="text-4xl font-extrabold mb-1 tracking-tight text-foreground">
                {money(results.monthlyEscrow)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {money(results.annualCharges)} of annual bills &middot; {money(results.cushionRequired)} cushion target
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Low Point</span>
                <span className="font-extrabold text-foreground">{money(results.lowPoint)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cushion Held</span>
                <span className="font-extrabold text-foreground">
                  {results.baseMonthly > 0 ? fmt(results.lowPoint / results.baseMonthly, 1) : "0.0"} mo
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Year-End Surplus</span>
                <span className={`font-extrabold ${results.shortage > 0.5 ? "text-destructive" : "text-emerald-600"}`}>
                  {results.shortage > 0.5 ? money(-results.shortage) : money(results.surplus)}
                </span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Escrow Item</th>
                    <th className="p-2.5 text-right w-[105px]">Annual</th>
                    <th className="p-2.5 text-right w-[105px]">Monthly</th>
                    <th className="p-2.5 pr-3 text-right w-[85px]">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.items.map((row) => (
                    <tr key={row.label} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                      <td className="p-2.5 text-right text-foreground">{money(row.annual)}</td>
                      <td className="p-2.5 text-right text-foreground">{money(row.monthly)}</td>
                      <td className="p-2.5 pr-3 text-right text-muted-foreground">{fmt(row.share, 1)}%</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Total Escrowed</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.annualCharges)}</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.baseMonthly)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">100.0%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 12-MONTH PROJECTION */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-bold text-foreground mb-3">Projected Balance by Month</h3>
              <div className="grid grid-cols-6 gap-2">
                {results.schedule.map((row) => (
                  <div
                    key={row.month}
                    className={`flex flex-col items-center rounded-md px-1 py-1.5 border text-center ${
                      row.month === results.lowPointMonth
                        ? "border-primary bg-primary/10"
                        : "border-border bg-secondary/20"
                    }`}
                    title={`${MONTH_LABELS[row.month - 1]}: collected ${money(row.paidIn)}, disbursed ${money(row.paidOut)}`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {MONTH_LABELS[row.month - 1]}
                    </span>
                    <span
                      className="text-[11px] font-extrabold text-foreground"
                      style={{ opacity: row.balance >= 0 ? 1 : 0.85 }}
                    >
                      {money(row.balance)}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                Peak balance {money(maxBalance)} · lowest balance {money(results.lowPoint)} in{" "}
                {MONTH_LABELS[Math.max(0, results.lowPointMonth - 1)]}. Cushion target {money(results.cushionRequired)}.
              </p>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Annual Escrowed Bills</span>
                  <span className="text-base font-bold text-foreground">{money(results.annualCharges)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">One-Twelfth of Bills</span>
                  <span className="text-base font-bold text-foreground">{money(results.baseMonthly)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Monthly Escrow</span>
                  <span className="text-base font-bold text-primary">{money(results.monthlyEscrow)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">First-Year Adjustment</span>
                  <span className={`text-base font-bold ${results.aggregateAdjustment > 0.5 ? "text-destructive" : "text-emerald-600"}`}>
                    {results.aggregateAdjustment >= 0 ? "+" : "−"}
                    {money(Math.abs(results.aggregateAdjustment))}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cushion Months Used</span>
                  <span className="text-base font-bold text-foreground">{results.cushionUsed}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cushion Target</span>
                  <span className="text-base font-bold text-foreground">{money(results.cushionRequired)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Opening Deposit</span>
                  <span className="text-base font-bold text-foreground">{money(results.opening)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Year-End Balance</span>
                  <span className="text-base font-bold text-foreground">{money(results.endingBalance)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Low Point</span>
                  <span className="text-base font-bold text-foreground">
                    {money(results.lowPoint)} in {MONTH_LABELS[Math.max(0, results.lowPointMonth - 1)]}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cushion at Low Point</span>
                  <span className="text-base font-bold text-foreground">
                    {results.baseMonthly > 0 ? fmt(results.lowPoint / results.baseMonthly, 1) : "0.0"} months
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Shortfall at Low Point</span>
                  <span
                    className={`text-base font-bold ${
                      results.lowPointShortfall > 0.5 ? "text-amber-600" : "text-emerald-600"
                    }`}
                  >
                    {money(results.lowPointShortfall)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Payment to Hold Cushion</span>
                  <span className="text-base font-bold text-foreground">{money(results.paymentForFullCushion)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Collected in Year</span>
                  <span className="text-base font-bold text-foreground">{money(results.totalIn)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Disbursed in Year</span>
                  <span className="text-base font-bold text-foreground">{money(results.totalOut)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Surplus</span>
                  <span className="text-base font-bold text-emerald-600">{money(results.surplus)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Shortage</span>
                  <span className={`text-base font-bold ${results.shortage > 0.5 ? "text-destructive" : "text-foreground"}`}>
                    {money(results.shortage)}
                  </span>
                </div>
                <div className="flex flex-col col-span-2">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Tax Bill Month</span>
                  <span className="text-base font-bold text-foreground">
                    {MONTH_LABELS[Math.max(0, Math.min(11, Math.round(calcInputs.taxMonth) - 1))]} · Insurance in{" "}
                    {MONTH_LABELS[Math.max(0, Math.min(11, Math.round(calcInputs.insuranceMonth) - 1))]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is an Escrow Reserve Calculator?</h2>
            <p>
              An escrow reserve calculator works out how much your mortgage servicer needs to collect each month to pay the
              bills that protect the property, and how much cash the account has to hold in reserve while it does so. Property
              tax and hazard insurance arrive as single annual bills, but they are funded by a monthly payment inside your
              mortgage, so the servicer holds the money on your behalf until each bill falls due.
            </p>
            <p>
              The reserve matters because of timing rather than totals. Money collected in January may sit untouched until a
              tax bill in November, and the balance then drops sharply before the following deposits rebuild it. The lowest
              point of that cycle, not the year-end figure, decides whether an account is adequately funded, which is why a
              calculator that only divides the annual bills by twelve can understate what a servicer actually has to collect.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The tool adds every escrowed annual charge, then divides by twelve for the underlying monthly share. Federal
              rules made under the Real Estate Settlement Procedures Act allow the servicer a cushion of up to two months of
              escrow payments at the low point of the twelve month cycle, so the cushion target is that monthly share
              multiplied by the cushion you enter, capped at two.
            </p>
            <p>
              The monthly collection is set so the account can pay every bill in full and still close the year holding the
              cushion. That means adding the annual charges and the cushion, subtracting any opening deposit such as the
              cushion collected at closing, and dividing the result by twelve. The difference between this figure and the plain
              one-twelfth share is the first-year adjustment that covers grouped bills and an insufficient starting balance.
            </p>
            <p>
              With the payment fixed, the calculator walks the twelve months in order: it adds the payment, disburses the full
              tax bill, insurance premium and any other escrowed item in the month you chose, and records the closing balance.
              The lowest balance in that sequence is the account low point, and the months it represents of the monthly share
              is how much cushion the account actually holds when it is at its thinnest. Any balance above the cushion at year
              end is a surplus; anything below it is a shortage the servicer will recover in the following cycle.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card is the monthly escrow payment, with the total annual bills and the cushion target underneath.
              The three statistics beside it show the projected low point of the account, the cushion that low point represents
              in months, and the year-end surplus, which turns negative when the account finishes short. The breakdown table
              lists each escrowed item with its annual amount, its monthly share and its percentage of the total, while the
              monthly projection shows the closing balance for all twelve months and highlights the low point.
            </p>
            <p>
              Summary Statistics collects the annual bills, the one-twelfth share, the recommended monthly payment, the
              first-year adjustment, the cushion months used and the cushion target, the opening deposit, the year-end
              balance, the low point and the cushion it represents, the shortfall at that low point, the payment that would hold
              the cushion all year, the annual collections and disbursements, and the closing surplus or shortage. Because the
              low point is the test that matters, a shortfall there is reported separately from the year-end figure: moving the
              tax bill month, paying more in at closing, or raising the payment to the "payment to hold cushion" figure are the
              three ways to close it.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/escrow-reserve-calculator" />
          <PopularCalculators exclude="/calculator/escrow-reserve-calculator" />
        </div>
      </div>
    </>
  );
}

// Figures follow the escrow accounting rules of Regulation X, 12 CFR 1024.17 (aggregate
// accounting, two-month cushion cap). Tax and insurance amounts are whatever the user enters;
// no jurisdiction-specific rates are assumed.
