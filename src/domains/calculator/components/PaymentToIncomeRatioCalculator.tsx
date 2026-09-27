"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface RatioInputs {
  grossIncome: number;
  housingPayment: number;
  existingDebts: number;
  propertyTax: number;
  insurance: number;
  hoa: number;
  creditCardMinimums: number;
  otherIncome: number;
}

const DEFAULTS: RatioInputs = {
  grossIncome: 8500,
  housingPayment: 1900,
  existingDebts: 450,
  propertyTax: 350,
  insurance: 125,
  hoa: 0,
  creditCardMinimums: 150,
  otherIncome: 0,
};

const fmt = (v: number, d = 1) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) => (Number.isFinite(v) ? "$" + v.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "—");

interface RatioResult {
  income: number;
  totalHousing: number;
  totalDebt: number;
  housingRatio: number;
  dti: number;
  maxHousing28: number;
  maxTotal36: number;
  maxPaymentAtThreshold: number;
  incomeRemaining: number;
  verdict: string;
  verdictTone: string;
  valid: boolean;
  errorMsg: string;
}

function computeRatio(i: RatioInputs): RatioResult {
  const invalid = i.grossIncome <= 0 || i.housingPayment < 0 || i.existingDebts < 0;

  const income = i.grossIncome + i.otherIncome;
  const totalHousing = i.housingPayment + i.propertyTax + i.insurance + i.hoa;
  const totalDebt = totalHousing + i.existingDebts + i.creditCardMinimums;
  const housingRatio = income > 0 ? (totalHousing / income) * 100 : 0;
  const dti = income > 0 ? (totalDebt / income) * 100 : 0;

  const maxHousing28 = income * 0.28;
  const maxTotal36 = income * 0.36;
  const maxPaymentAtThreshold = Math.max(0, maxTotal36 - i.existingDebts - i.creditCardMinimums);

  let verdict = "High Risk";
  let verdictTone = "text-destructive";
  if (housingRatio <= 28 && dti <= 36) {
    verdict = "Strong";
    verdictTone = "text-emerald-600";
  } else if (dti <= 43) {
    verdict = "Acceptable";
    verdictTone = "text-amber-600";
  }

  return {
    income,
    totalHousing,
    totalDebt,
    housingRatio,
    dti,
    maxHousing28,
    maxTotal36,
    maxPaymentAtThreshold,
    incomeRemaining: income - totalDebt,
    verdict,
    verdictTone,
    valid: !invalid,
    errorMsg: invalid ? "Enter a positive gross income and non-negative payment and debt figures." : "",
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

export default function PaymentToIncomeRatioCalculator() {
  const [grossIncome, setGrossIncome] = useState(String(DEFAULTS.grossIncome));
  const [housingPayment, setHousingPayment] = useState(String(DEFAULTS.housingPayment));
  const [existingDebts, setExistingDebts] = useState(String(DEFAULTS.existingDebts));
  const [propertyTax, setPropertyTax] = useState(String(DEFAULTS.propertyTax));
  const [insurance, setInsurance] = useState(String(DEFAULTS.insurance));
  const [hoa, setHoa] = useState(String(DEFAULTS.hoa));
  const [creditCardMinimums, setCreditCardMinimums] = useState(String(DEFAULTS.creditCardMinimums));
  const [otherIncome, setOtherIncome] = useState(String(DEFAULTS.otherIncome));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): RatioInputs => ({
    grossIncome: parseFloat(grossIncome) || 0,
    housingPayment: parseFloat(housingPayment) || 0,
    existingDebts: parseFloat(existingDebts) || 0,
    propertyTax: parseFloat(propertyTax) || 0,
    insurance: parseFloat(insurance) || 0,
    hoa: parseFloat(hoa) || 0,
    creditCardMinimums: parseFloat(creditCardMinimums) || 0,
    otherIncome: parseFloat(otherIncome) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<RatioInputs>(() => DEFAULTS);
  const [results, setResults] = useState<RatioResult>(() => computeRatio(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeRatio(inputs));
  };

  const reset = () => {
    setGrossIncome(String(DEFAULTS.grossIncome));
    setHousingPayment(String(DEFAULTS.housingPayment));
    setExistingDebts(String(DEFAULTS.existingDebts));
    setPropertyTax(String(DEFAULTS.propertyTax));
    setInsurance(String(DEFAULTS.insurance));
    setHoa(String(DEFAULTS.hoa));
    setCreditCardMinimums(String(DEFAULTS.creditCardMinimums));
    setOtherIncome(String(DEFAULTS.otherIncome));
    setCalcInputs(DEFAULTS);
    setResults(computeRatio(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is a payment-to-income ratio?",
      answer:
        "The payment-to-income ratio, also called the front-end ratio or housing ratio, is your proposed monthly housing payment divided by your gross monthly income. Lenders use it to judge whether a mortgage payment leaves enough room in your budget for everything else. The conventional guideline is that housing should not exceed twenty-eight percent of gross income, though many programmes allow more when the rest of your finances are strong.",
    },
    {
      question: "What is the difference between the front-end and back-end ratio?",
      answer:
        "The front-end ratio counts only the housing payment: principal, interest, property taxes, insurance and any association dues, which together are known as PITI. The back-end ratio, or debt-to-income ratio, adds every other recurring debt payment such as car loans, student loans, personal loans and minimum credit card payments. Lenders look at both, and the back-end figure is usually the binding constraint.",
    },
    {
      question: "What ratios do lenders actually require?",
      answer:
        "For a conventional loan, the long-standing guideline is twenty-eight percent on the front-end and thirty-six percent on the back-end, though automated underwriting often approves higher back-end ratios when credit scores and reserves are strong. FHA loans commonly allow around thirty-one and forty-three percent, and the qualified mortgage framework has generally capped the back-end ratio near forty-three percent. The thresholds are guidelines, not guarantees, and each lender applies its own overlay.",
    },
    {
      question: "Does the ratio use gross or net income?",
      answer:
        "Gross income, before taxes and deductions. Lenders underwrite against gross monthly income because net pay varies with withholding and benefits elections, and because the debt obligations being measured are themselves gross. That is why a ratio that looks comfortable on gross income can still feel tight once taxes, retirement contributions and everyday living costs are subtracted from actual take-home pay.",
    },
    {
      question: "How can I improve my ratio if it is too high?",
      answer:
        "Three levers move it. Reduce the proposed housing payment by buying less house or making a larger down payment, which lowers the loan and the payment. Reduce existing debt by paying down car loans, student loans or card balances, which lowers the back-end ratio. Or increase qualifying income, whether through a raise, a documented side income, or adding a co-borrower. The calculator reports the maximum payment you can carry at each threshold so you can see how far you have to go.",
    },
  ];

  const breakdownRows = [
    { label: "Principal & Interest", monthly: `$${fmt(calcInputs.housingPayment, 0)}`, ratio: `${fmt(results.income > 0 ? (calcInputs.housingPayment / results.income) * 100 : 0, 1)}%` },
    { label: "Property Tax", monthly: `$${fmt(calcInputs.propertyTax, 0)}`, ratio: `${fmt(results.income > 0 ? (calcInputs.propertyTax / results.income) * 100 : 0, 1)}%` },
    { label: "Home Insurance", monthly: `$${fmt(calcInputs.insurance, 0)}`, ratio: `${fmt(results.income > 0 ? (calcInputs.insurance / results.income) * 100 : 0, 1)}%` },
    { label: "HOA / Other Housing", monthly: `$${fmt(calcInputs.hoa, 0)}`, ratio: `${fmt(results.income > 0 ? (calcInputs.hoa / results.income) * 100 : 0, 1)}%` },
    { label: "Other Monthly Debts", monthly: `$${fmt(calcInputs.existingDebts, 0)}`, ratio: `${fmt(results.income > 0 ? (calcInputs.existingDebts / results.income) * 100 : 0, 1)}%` },
    { label: "Credit Card Minimums", monthly: `$${fmt(calcInputs.creditCardMinimums, 0)}`, ratio: `${fmt(results.income > 0 ? (calcInputs.creditCardMinimums / results.income) * 100 : 0, 1)}%` },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Payment-to-Income Ratio Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Payment-to-Income Ratio Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Income & Payment">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="income"
                  label="Gross Monthly Income"
                  value={grossIncome}
                  onChange={setGrossIncome}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Income before tax and deductions."
                />
                <CompactInput
                  id="housing"
                  label="Proposed Housing Payment"
                  value={housingPayment}
                  onChange={setHousingPayment}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Principal and interest you expect to pay each month."
                />
              </div>
            </SubSection>

            <SubSection title="Existing Debt">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="debts"
                  label="Other Monthly Debts"
                  value={existingDebts}
                  onChange={setExistingDebts}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Auto, student and personal loan payments."
                />
                <CompactInput
                  id="cards"
                  label="Credit Card Minimums"
                  value={creditCardMinimums}
                  onChange={setCreditCardMinimums}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Total minimum payments across all cards."
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
                  <SubSection title="Escrow Housing Costs">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="tax"
                        label="Property Tax / mo"
                        value={propertyTax}
                        onChange={setPropertyTax}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Monthly property tax escrowed with the payment."
                      />
                      <CompactInput
                        id="insurance"
                        label="Insurance / mo"
                        value={insurance}
                        onChange={setInsurance}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Monthly homeowners insurance."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <CompactInput
                        id="hoa"
                        label="HOA / Other / mo"
                        value={hoa}
                        onChange={setHoa}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Monthly association dues or other housing charges."
                      />
                      <CompactInput
                        id="other-income"
                        label="Additional Income"
                        value={otherIncome}
                        onChange={setOtherIncome}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Co-borrower or documented side income."
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
                Payment-to-Income (Front-End) Ratio
              </div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {fmt(results.housingRatio, 1)}%
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {money(results.totalHousing)} housing on {money(results.income)} income &middot;{" "}
                <span className={results.verdictTone}>{results.verdict}</span>
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Debt-to-Income</span>
                <span className={`font-extrabold ${results.verdictTone}`}>{fmt(results.dti, 1)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Max at 36% DTI</span>
                <span className="font-extrabold text-foreground">{money(results.maxPaymentAtThreshold)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Income Left</span>
                <span className="font-extrabold text-foreground">{money(results.incomeRemaining)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Monthly Obligation</th>
                    <th className="p-2.5 text-right w-[110px]">Amount</th>
                    <th className="p-2.5 pr-3 text-right w-[90px]">% Income</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdownRows.map((row) => (
                    <tr key={row.label} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                      <td className="p-2.5 text-right text-foreground">{row.monthly}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{row.ratio}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Total</td>
                    <td className="p-2.5 text-right text-foreground">{money(results.totalDebt)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{fmt(results.dti, 1)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Gross Monthly Income</span>
                  <span className="text-base font-bold text-foreground">{money(results.income)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Housing (PITI+)</span>
                  <span className="text-base font-bold text-foreground">{money(results.totalHousing)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Front-End Ratio</span>
                  <span className="text-base font-bold text-primary">{fmt(results.housingRatio, 1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Back-End Ratio (DTI)</span>
                  <span className={`text-base font-bold ${results.verdictTone}`}>{fmt(results.dti, 1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Housing Cap at 28%</span>
                  <span className="text-base font-bold text-foreground">{money(results.maxHousing28)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Debt Cap at 36%</span>
                  <span className="text-base font-bold text-foreground">{money(results.maxTotal36)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Payment-to-Income Ratio Calculator?</h2>
            <p>
              A payment-to-income ratio calculator measures a proposed housing payment against gross monthly income, and
              then extends the same logic to every other debt obligation to produce a debt-to-income ratio. The first
              figure, called the front-end ratio, answers whether the home itself is affordable. The second, the back-end
              ratio, answers whether the household as a whole carries too much debt. Lenders assess both before approving a
              mortgage, and borrowers use them to decide how much house they can genuinely afford.
            </p>
            <p>
              The distinction between the two ratios matters because they fail in different ways. A household can pass the
              front-end test comfortably and still be declined because of car loans, student debt and credit card minimums,
              and the reverse is possible for a borrower with almost no other obligations but an aggressive housing
              payment. Reporting both side by side shows which one is actually constraining the purchase.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The total housing payment is the principal and interest plus property taxes, homeowners insurance and any
              association dues, which is the standard PITI structure. The front-end ratio is that total divided by gross
              monthly income. The back-end ratio adds all remaining recurring debts, including car, student and personal
              loan payments and the minimums due on credit cards, and divides the larger total by the same income. Gross
              income is used throughout because that is the basis lenders underwrite against.
            </p>
            <p>
              From the ratios the calculator derives the affordability ceilings. The maximum housing payment at the common
              twenty-eight percent guideline is income multiplied by 0.28, and the maximum total obligation at the
              thirty-six percent guideline is income multiplied by 0.36. Subtracting existing debts from that ceiling gives
              the largest housing payment the household could carry while staying inside the limit, which is the most
              actionable number the tool produces.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the front-end ratio with a plain-language verdict, and the three statistics beside it
              give the back-end ratio, the maximum payment available at the thirty-six percent ceiling, and the income
              remaining after all obligations. The breakdown table lists every monthly obligation with its share of income,
              so it is immediately clear which commitments are consuming the budget and by how much.
            </p>
            <p>
              Summary Statistics collects the income, total housing cost, both ratios, and the caps at twenty-eight and
              thirty-six percent. Treat the verdict as a rule-of-thumb guide rather than a lending decision: conventional
              automated underwriting can approve higher ratios when credit scores and cash reserves are strong, while FHA
              and qualified-mortgage frameworks use their own thresholds, and every lender layers its own requirements on
              top. If the ratios are above the guidelines, the three levers available are buying less house, paying down
              existing debt, or increasing documented income.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/payment-to-income-ratio-calculator" />
          <PopularCalculators exclude="/calculator/payment-to-income-ratio-calculator" />
        </div>
      </div>
    </>
  );
}
