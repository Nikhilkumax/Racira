"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type Op = "+" | "-" | "×" | "÷";

const gcd = (a: number, b: number): number => {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y > 0) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x || 1;
};

const lcm = (a: number, b: number): number => {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / gcd(a, b);
};

interface FractionInputs {
  n1: number;
  d1: number;
  n2: number;
  d2: number;
  op: Op;
  decimalPlaces: number;
  equivLevels: number;
}

const DEFAULTS: FractionInputs = {
  n1: 1,
  d1: 2,
  n2: 1,
  d2: 3,
  op: "+",
  decimalPlaces: 6,
  equivLevels: 5,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const fmtNum = (v: number, d: number) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: d }) : "—";

interface EquivalentRow {
  factor: number;
  num: number;
  den: number;
  decimal: number;
}

interface FractionResult {
  valid: boolean;
  errorMsg: string;
  op: Op;
  n1: number;
  d1: number;
  n2: number;
  d2: number;
  rawNum: number;
  rawDen: number;
  num: number;
  den: number;
  decimal: number;
  percent: number;
  whole: number;
  mixedNum: number;
  mixedDen: number;
  isImproper: boolean;
  gcdUsed: number;
  lcd: number;
  steps: string[];
  equivalents: EquivalentRow[];
  terminating: boolean;
  simplified: boolean;
}

function terminates(den: number): boolean {
  let n = Math.abs(den);
  if (n === 0) return false;
  while (n % 2 === 0) n /= 2;
  while (n % 5 === 0) n /= 5;
  return n === 1;
}

function computeFraction(input: FractionInputs): FractionResult {
  const { n1, d1, n2, d2, op, decimalPlaces, equivLevels } = input;

  const blank: FractionResult = {
    valid: false,
    errorMsg: "",
    op,
    n1,
    d1,
    n2,
    d2,
    rawNum: 0,
    rawDen: 1,
    num: 0,
    den: 1,
    decimal: 0,
    percent: 0,
    whole: 0,
    mixedNum: 0,
    mixedDen: 1,
    isImproper: false,
    gcdUsed: 1,
    lcd: 0,
    steps: [],
    equivalents: [],
    terminating: true,
    simplified: false,
  };

  if (!Number.isFinite(n1) || !Number.isFinite(d1) || !Number.isFinite(n2) || !Number.isFinite(d2)) {
    return { ...blank, errorMsg: "Enter a whole number for every numerator and denominator." };
  }
  if (d1 === 0 || d2 === 0) {
    return { ...blank, errorMsg: "A denominator cannot be zero. Give both fractions a non-zero bottom number." };
  }
  if (op === "÷" && n2 === 0) {
    return { ...blank, errorMsg: "You cannot divide by a fraction whose numerator is zero." };
  }

  const steps: string[] = [];
  let rawNum = 0;
  let rawDen = 1;

  if (op === "+" || op === "-") {
    const sign = op === "+" ? 1 : -1;
    const commonDen = d1 * d2;
    const scaledA = n1 * d2;
    const scaledB = n2 * d1;
    rawNum = scaledA + sign * scaledB;
    rawDen = commonDen;
    steps.push(`Make the denominators match: ${d1} × ${d2} = ${commonDen}`);
    steps.push(
      `Rewrite both fractions over ${commonDen}: ${scaledA}/${commonDen} ${op} ${scaledB}/${commonDen}`,
    );
    steps.push(
      `Combine the numerators: ${scaledA} ${op === "+" ? "+" : "−"} ${scaledB} = ${rawNum}, so the raw answer is ${rawNum}/${commonDen}`,
    );
  } else if (op === "×") {
    rawNum = n1 * n2;
    rawDen = d1 * d2;
    steps.push(`Multiply the numerators: ${n1} × ${n2} = ${rawNum}`);
    steps.push(`Multiply the denominators: ${d1} × ${d2} = ${rawDen}`);
    steps.push(`The raw answer is ${rawNum}/${rawDen}`);
  } else {
    rawNum = n1 * d2;
    rawDen = d1 * n2;
    steps.push(`Invert the divisor: ${n2}/${d2} becomes ${d2}/${n2}`);
    steps.push(`Multiply straight across: ${n1} × ${d2} = ${rawNum} on top and ${d1} × ${n2} = ${rawDen} on the bottom`);
    steps.push(`The raw answer is ${rawNum}/${rawDen}`);
  }

  const g = gcd(rawNum, rawDen);
  let num = rawNum / g;
  let den = rawDen / g;
  if (den < 0) {
    num = -num;
    den = -den;
  }
  const simplified = g > 1;
  if (simplified) {
    steps.push(`Divide top and bottom by their greatest common divisor, ${g}: ${num}/${den}`);
  } else {
    steps.push("No common factor above 1, so the answer is already in lowest terms");
  }

  const decimal = num / den;
  const percent = decimal * 100;
  const isImproper = Math.abs(num) >= Math.abs(den) && den !== 0;
  const whole = Math.trunc(num / den);
  const mixedNum = Math.abs(num % den);
  const mixedDen = den;

  const equivalents: EquivalentRow[] = [];
  const levels = Math.max(1, Math.min(10, Math.round(equivLevels)));
  for (let k = 2; k <= levels + 1; k++) {
    equivalents.push({
      factor: k,
      num: num * k,
      den: den * k,
      decimal: den === 0 ? 0 : (num * k) / (den * k),
    });
  }

  return {
    valid: true,
    errorMsg: "",
    op,
    n1,
    d1,
    n2,
    d2,
    rawNum,
    rawDen,
    num,
    den,
    decimal: Number(decimal.toFixed(Math.max(0, Math.min(12, Math.round(decimalPlaces))))),
    percent,
    whole,
    mixedNum,
    mixedDen,
    isImproper,
    gcdUsed: g,
    lcd: op === "+" || op === "-" ? lcm(d1, d2) : 0,
    steps,
    equivalents,
    terminating: terminates(den),
    simplified,
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

export default function FractionCalculator() {
  const [n1, setN1] = useState(String(DEFAULTS.n1));
  const [d1, setD1] = useState(String(DEFAULTS.d1));
  const [n2, setN2] = useState(String(DEFAULTS.n2));
  const [d2, setD2] = useState(String(DEFAULTS.d2));
  const [op, setOp] = useState<Op>(DEFAULTS.op);
  const [decimalPlaces, setDecimalPlaces] = useState(String(DEFAULTS.decimalPlaces));
  const [equivLevels, setEquivLevels] = useState(String(DEFAULTS.equivLevels));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): FractionInputs => ({
    n1: parseFloat(n1) || 0,
    d1: parseFloat(d1) || 0,
    n2: parseFloat(n2) || 0,
    d2: parseFloat(d2) || 0,
    op,
    decimalPlaces: parseFloat(decimalPlaces) || DEFAULTS.decimalPlaces,
    equivLevels: parseFloat(equivLevels) || DEFAULTS.equivLevels,
  });

  const [calcInputs, setCalcInputs] = useState<FractionInputs>(() => DEFAULTS);
  const [results, setResults] = useState<FractionResult>(() => computeFraction(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeFraction(inputs));
  };

  const reset = () => {
    setN1(String(DEFAULTS.n1));
    setD1(String(DEFAULTS.d1));
    setN2(String(DEFAULTS.n2));
    setD2(String(DEFAULTS.d2));
    setOp(DEFAULTS.op);
    setDecimalPlaces(String(DEFAULTS.decimalPlaces));
    setEquivLevels(String(DEFAULTS.equivLevels));
    setCalcInputs(DEFAULTS);
    setResults(computeFraction(DEFAULTS));
  };

  const OPS: Op[] = ["+", "-", "×", "÷"];

  const faqs = [
    {
      question: "How do I add or subtract fractions?",
      answer:
        "Rewrite both fractions over a common denominator, then combine the numerators and simplify. The fastest common denominator is the product of the two bottom numbers, which is what this calculator does before reducing the answer by the greatest common divisor of the result.",
    },
    {
      question: "How do I divide fractions?",
      answer:
        "Multiply by the reciprocal: flip the second fraction and multiply straight across. For example 1/2 ÷ 1/3 becomes 1/2 × 3/1 = 3/2. That single rule replaces the whole idea of dividing fractions, and it is why dividing by a fraction can produce a larger number.",
    },
    {
      question: "What is an improper fraction?",
      answer:
        "An improper fraction has a numerator at least as large as its denominator, so it is worth one whole or more, such as 7/4. Rewriting it as a mixed number pulls the whole parts out front, giving 1 and 3/4, which is usually easier to picture but harder to use in further arithmetic.",
    },
    {
      question: "Why do some fractions give repeating decimals?",
      answer:
        "A fraction converts to a terminating decimal only when its denominator, once reduced, is built entirely from factors of two and five. Denominators containing three, seven or eleven produce digits that repeat forever, so any printed decimal is necessarily a rounded approximation of the exact fraction.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Math", href: "/calculator#math" },
          { label: "Fraction Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Fraction Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="First Fraction">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="numerator-1"
                  label="Numerator"
                  value={n1}
                  onChange={setN1}
                  onEnter={runCalculate}
                  tooltip="Top number of the first fraction."
                />
                <CompactInput
                  id="denominator-1"
                  label="Denominator"
                  value={d1}
                  onChange={setD1}
                  onEnter={runCalculate}
                  tooltip="Bottom number of the first fraction. It cannot be zero."
                />
              </div>
            </SubSection>

            <SubSection title="Operation">
              <div className="grid grid-cols-4 gap-2">
                {OPS.map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => setOp(o)}
                    aria-pressed={op === o}
                    className={
                      op === o
                        ? "h-9 rounded-md bg-primary text-primary-foreground font-bold text-lg shadow-sm transition-all active:scale-[0.98]"
                        : "h-9 rounded-md border border-border bg-background hover:bg-secondary text-foreground font-bold text-lg transition-colors"
                    }
                  >
                    {o}
                  </button>
                ))}
              </div>
            </SubSection>

            <SubSection title="Second Fraction">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="numerator-2"
                  label="Numerator"
                  value={n2}
                  onChange={setN2}
                  onEnter={runCalculate}
                  tooltip="Top number of the second fraction."
                />
                <CompactInput
                  id="denominator-2"
                  label="Denominator"
                  value={d2}
                  onChange={setD2}
                  onEnter={runCalculate}
                  tooltip="Bottom number of the second fraction. It cannot be zero."
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
                  <SubSection title="Output Detail">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="decimal-places"
                        label="Decimal Places"
                        value={decimalPlaces}
                        onChange={setDecimalPlaces}
                        onEnter={runCalculate}
                        min="0"
                        tooltip="How many digits to show after the decimal point."
                      />
                      <CompactInput
                        id="equiv-levels"
                        label="Equivalent Rows"
                        value={equivLevels}
                        onChange={setEquivLevels}
                        onEnter={runCalculate}
                        min="1"
                        tooltip="How many equivalent fractions to list under the answer."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Simplified Result</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? `${results.num}/${results.den}` : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${fmtNum(results.num, 6)} ÷ ${fmtNum(results.den, 6)} = ${fmt(results.decimal, 6)}`
                  : "Fix the highlighted inputs to see an answer"}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Decimal</span>
                <span className="font-extrabold text-foreground">{results.valid ? fmt(results.decimal, 6) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Percent</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmtNum(results.percent, 4)}%` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Reduced By</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `GCD ${fmtNum(results.gcdUsed, 6)}` : "—"}
                </span>
              </div>
            </div>

            {/* STEP TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Step</th>
                    <th className="p-2.5 pr-3">Working</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.steps.map((s, i) => (
                    <tr key={i} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground w-[70px]">Step {i + 1}</td>
                      <td className="p-2.5 pr-3 text-foreground">{s}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Answer</td>
                    <td className="p-2.5 pr-3 text-emerald-600">
                      {results.valid ? `${results.num}/${results.den} = ${fmt(results.decimal, 6)}` : "—"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* EQUIVALENT FRACTIONS */}
            {results.equivalents.length > 0 && (
              <div className="overflow-x-auto rounded-lg border border-border bg-card">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-2.5 pl-3">Equivalent Fraction</th>
                      <th className="p-2.5 text-right w-[110px]">Multiply By</th>
                      <th className="p-2.5 pr-3 text-right w-[130px]">Decimal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {results.equivalents.map((e) => (
                      <tr key={e.factor} className="hover:bg-secondary/20 transition-colors">
                        <td className="p-2.5 pl-3 font-semibold text-foreground">
                          {e.num}/{e.den}
                        </td>
                        <td className="p-2.5 text-right text-foreground">{e.factor}×</td>
                        <td className="p-2.5 pr-3 text-right text-foreground">{fmt(e.decimal, 6)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">
                Summary Statistics
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Expression</span>
                  <span className="text-base font-bold text-foreground">
                    {`${results.n1}/${results.d1} ${results.op} ${results.n2}/${results.d2}`}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Raw Result</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${results.rawNum}/${results.rawDen}` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Mixed Number</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid
                      ? results.isImproper
                        ? `${results.whole} ${results.mixedNum}/${results.mixedDen}`
                        : "Proper fraction"
                      : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Least Common Denominator</span>
                  <span className="text-base font-bold text-foreground">
                    {results.lcd > 0 ? fmtNum(results.lcd, 6) : "Not needed"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Decimal Type</span>
                  <span className="text-base font-bold text-foreground">
                    {results.terminating ? "Terminating" : "Repeating"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Already Simplified</span>
                  <span className="text-base font-bold text-foreground">
                    {results.simplified ? "No, reduced by GCD" : "Yes"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Fraction Calculator?</h2>
            <p>
              A fraction calculator performs the four basic operations on fractions and returns the answer in lowest terms.
              Fractions are exact numbers, so unlike a decimal entry of 0.333 the fraction 1/3 keeps its full value through
              every step. That matters whenever a result has to be reused, because rounding errors compound quickly when
              several rounded decimals are multiplied together.
            </p>
            <p>
              The tool also reports what the fraction means in other forms. The same quantity can be written as an improper
              fraction, a mixed number, a decimal or a percentage, and each of those views is useful in a different setting.
              Carpentry and cooking usually want the mixed number, measurement and engineering work usually want the decimal,
              and reporting or grading usually wants the percentage.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Addition and subtraction first put both fractions over a common denominator, usually by multiplying the two
              denominators together, then combine the numerators while leaving the shared bottom number alone. Multiplication
              is the simplest case: multiply numerator by numerator and denominator by denominator. Division flips the second
              fraction into its reciprocal and then multiplies, which is why dividing by a fraction smaller than one makes
              the answer larger.
            </p>
            <p>
              After the arithmetic the raw result is reduced by dividing the top and bottom by their greatest common divisor.
              Six and eight share a factor of two, so 6/8 becomes 3/4, and the calculator prints the divisor it used so you
              can check the step yourself. Rewriting a denominator as the least common multiple instead of the product of the
              two denominators keeps the numbers smaller and is the method most teachers expect to see.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the simplified fraction with its decimal equivalent beneath it, and the three-stat bar
              reports the decimal, the percentage and the greatest common divisor that reduced the answer. The first table
              walks through the operation one line at a time so the working can be checked or copied into homework, and the
              second lists equivalent fractions that all describe the same quantity.
            </p>
            <p>
              Watch the decimal type. A reduced denominator built only from factors of two and five gives a terminating
              decimal, which means the printed digits are complete. Denominators containing a three, seven or eleven produce
              a repeating decimal, so every printed value is a rounded approximation and the fraction form remains the exact
              answer. For further arithmetic, keep the fraction rather than the rounded decimal.
            </p>
            <p>
              A negative result simply means the quantity is below zero, and the calculator keeps the sign on the numerator
              for consistency. Improper fractions are reported both as they are and as a mixed number, since 7/4 and 1¾ are
              identical: the first version is easier to multiply, the second easier to picture. If the denominators entered
              are zero, the tool stops and explains the problem instead of printing an infinity. Comparing two offers, recipes
              or measurements is far easier once every value sits in the same form, so convert all of them to fractions or
              all of them to decimals before you decide which is larger.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/fraction-calculator" />
          <PopularCalculators exclude="/calculator/fraction-calculator" />
        </div>
      </div>
    </>
  );
}
