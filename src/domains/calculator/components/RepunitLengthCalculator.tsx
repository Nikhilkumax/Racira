"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface RepunitInputs {
  base: number;
  length: number;
  divisor: number;
  exactLimit: number;
  decimals: number;
}

const DEFAULTS: RepunitInputs = {
  base: 10,
  length: 19,
  divisor: 7,
  exactLimit: 40,
  decimals: 0,
};

const fmt = (v: number, d = 0) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

/** Reference base-10 lengths whose repunits are prime, for the quick-pick control. */
const PRESET_LENGTHS = [
  { value: "2", label: "2 (prime repunit)" },
  { value: "19", label: "19 (prime repunit)" },
  { value: "23", label: "23 (prime repunit)" },
  { value: "317", label: "317 (prime repunit)" },
  { value: "1031", label: "1031 (prime repunit)" },
];

/** Exact value returned to the UI, capped so a huge number is never rendered. */
const EXACT_CAP = 200;

/** Known repunit prime exponents, from the Cunningham tables and the PrimePages records. */
const REPUNIT_PRIMES_BASE10 = [2, 19, 23, 317, 1031, 49081, 86453, 109297, 270343];
/** Base 2 repunits are Mersenne numbers, so the exponents are the known Mersenne primes. */
const REPUNIT_PRIMES_BASE2 = [2, 3, 5, 7, 13, 17, 19, 31, 61, 89, 107, 127, 521, 607, 1279, 2203, 2281, 3217, 4253, 4423, 9689, 9941, 11213, 19937, 21701, 23209, 44497, 86243, 110503, 132049, 216091, 756839, 859433, 1257787, 1398269, 2976221, 3021377, 6972593, 13466917, 20996011, 24036583, 25964951, 30402457, 32582657, 37156667, 42643801, 43112609, 57885161, 74207281, 77232917, 82589933];

function groupDigits(s: string): string {
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function primeFactors(n: number): number[] {
  const factors: number[] = [];
  let x = n;
  for (let p = 2; p * p <= x; p++) {
    while (x % p === 0) {
      factors.push(p);
      x /= p;
    }
  }
  if (x > 1) factors.push(x);
  return factors;
}

function isPrime(n: number): boolean {
  if (!Number.isInteger(n) || n < 2) return false;
  if (n % 2 === 0) return n === 2;
  for (let p = 3; p * p <= n; p += 2) if (n % p === 0) return false;
  return true;
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
}

/**
 * The exact repunit is built with little-endian decimal digit arrays rather than
 * BigInt, because the project targets ES2018 where BigInt literals are not available.
 */
function multiplyDigits(digits: number[], factor: number): void {
  let carry = 0;
  for (let i = 0; i < digits.length; i++) {
    const next = digits[i] * factor + carry;
    digits[i] = next % 10;
    carry = Math.floor(next / 10);
  }
  while (carry > 0) {
    digits.push(carry % 10);
    carry = Math.floor(carry / 10);
  }
}

function subtractOne(digits: number[]): void {
  let i = 0;
  while (i < digits.length) {
    if (digits[i] > 0) {
      digits[i] -= 1;
      break;
    }
    digits[i] = 9;
    i += 1;
  }
  while (digits.length > 1 && digits[digits.length - 1] === 0) digits.pop();
}

/** Long division of a little-endian digit array by a small divisor. */
function divideDigits(digits: number[], divisor: number): number[] {
  const quotient: number[] = new Array(digits.length).fill(0);
  let remainder = 0;
  for (let i = digits.length - 1; i >= 0; i--) {
    const current = remainder * 10 + digits[i];
    quotient[i] = Math.floor(current / divisor);
    remainder = current % divisor;
  }
  while (quotient.length > 1 && quotient[quotient.length - 1] === 0) quotient.pop();
  return quotient;
}

/** Decimal expansion of R_n(b) = (b^n − 1) / (b − 1). */
function repunitDigits(base: number, n: number): string {
  const digits = [1];
  for (let i = 0; i < n; i++) multiplyDigits(digits, base);
  subtractOne(digits);
  return divideDigits(digits, base - 1)
    .reverse()
    .join("");
}

/**
 * Modular exponentiation with plain numbers. The divisor is capped at 10^6, so the
 * modulus never exceeds about 3.5 × 10^7 and every product stays inside the exact
 * range of a double.
 */
function modPow(base: number, exp: number, mod: number): number {
  let result = 1;
  let b = base % mod;
  let e = exp;
  while (e > 0) {
    if (e % 2 === 1) result = (result * b) % mod;
    b = (b * b) % mod;
    e = Math.floor(e / 2);
  }
  return result;
}

interface BreakdownRow {
  label: string;
  value: string;
  highlight?: boolean;
}

interface RepunitResult {
  valid: boolean;
  errorMsg: string;
  exactValue: string;
  exactValueShown: boolean;
  decimalDigits: number;
  digitSum: number | null;
  scientific: string;
  lengthPrime: boolean;
  lengthFactors: number[];
  divisorsOfLength: number[];
  divisorDivides: boolean;
  divisorOrder: number | null;
  divisorPossible: boolean;
  orderCap: number;
  primeCandidate: boolean;
  knownRepunitPrime: boolean;
  verdict: string;
  verdictColor: string;
  breakdown: BreakdownRow[];
}

const ORDER_CAP = 200000;

function calculateRepunit(input: RepunitInputs): RepunitResult {
  const blank = (errorMsg: string): RepunitResult => ({
    valid: false,
    errorMsg,
    exactValue: "",
    exactValueShown: false,
    decimalDigits: 0,
    digitSum: null,
    scientific: "",
    lengthPrime: false,
    lengthFactors: [],
    divisorsOfLength: [],
    divisorDivides: false,
    divisorOrder: null,
    divisorPossible: false,
    orderCap: ORDER_CAP,
    primeCandidate: false,
    knownRepunitPrime: false,
    verdict: "",
    verdictColor: "text-muted-foreground",
    breakdown: [],
  });

  const nums = [input.base, input.length, input.divisor, input.exactLimit, input.decimals];
  if (!nums.every((v) => Number.isFinite(v))) return blank("Enter a number in every field to test the repunit.");
  if (!Number.isInteger(input.base) || input.base < 2 || input.base > 36) return blank("Use a base between 2 and 36.");
  if (!Number.isInteger(input.length) || input.length < 1) return blank("The repunit length must be a whole number of at least 1.");
  if (input.length > 500000) return blank("Keep the length at 500,000 or below — longer repunits are outside the useful range of this tool.");
  if (!Number.isInteger(input.divisor) || input.divisor < 2) return blank("The test divisor must be a whole number of at least 2.");
  if (input.divisor > 1000000) return blank("Keep the test divisor at 1,000,000 or below so the modular arithmetic stays exact.");

  const d = Math.max(0, Math.min(2, input.decimals));
  const n = input.length;

  // R_n(b) = (b^n − 1) / (b − 1): the repunit of length n in base b.
  const exactString = n <= EXACT_CAP ? repunitDigits(input.base, n) : null;
  const exactValue = exactString !== null ? groupDigits(exactString) : "";
  const exactValueShown = exactString !== null && input.length <= input.exactLimit;
  const decimalDigits = exactString !== null ? exactString.length : 0;
  const digitSum = exactString !== null ? exactString.split("").reduce((sum, ch) => sum + Number(ch), 0) : null;

  // Log-length of b^n − 1 is n·log10(b) to within a rounding error that matters only
  // for one- and two-digit values, which the exact branch already covers.
  const log10Value = n * Math.log10(input.base) - Math.log10(input.base - 1);
  const exponent = Math.floor(log10Value);
  const mantissa = Math.pow(10, log10Value - exponent);
  const scientific = `${fmt(mantissa, 3)} × 10^${exponent}`;

  const lengthPrime = isPrime(n);
  const lengthFactors = primeFactors(n);
  const divisorsOfLength = lengthFactors.length
    ? Array.from(new Set(lengthFactors)).sort((a, z) => a - z)
    : [];

  // m divides R_n(b) exactly when m·(b − 1) divides b^n − 1, which needs the modulus
  // to be coprime with the base. The smallest such n is the multiplicative order.
  const modulus = input.divisor * (input.base - 1);
  const divisorPossible = gcd(modulus, input.base) === 1;
  const divisorDivides = divisorPossible ? modPow(input.base, n, modulus) === 1 : false;

  let divisorOrder: number | null = null;
  if (divisorPossible) {
    // The order divides λ(modulus), so the walk stops as soon as the residue is 1.
    let residue = 1;
    const cap = Math.min(ORDER_CAP, modulus);
    for (let k = 1; k <= cap; k++) {
      residue = (residue * input.base) % modulus;
      if (residue === 1) {
        divisorOrder = k;
        break;
      }
    }
  }

  const knownList = input.base === 10 ? REPUNIT_PRIMES_BASE10 : input.base === 2 ? REPUNIT_PRIMES_BASE2 : [];
  const knownRepunitPrime = knownList.includes(n);
  const primeCandidate = lengthPrime && input.base >= 2;

  const verdict = !lengthPrime
    ? `Length ${fmt(n, 0)} is composite, so R_${n}(${input.base}) factors into at least the smaller repunits whose lengths divide ${fmt(n, 0)}`
    : knownRepunitPrime
      ? `R_${n}(${input.base}) is one of the known prime repunits in this base`
      : `Length ${fmt(n, 0)} is prime, which is necessary but not sufficient for R_${n}(${input.base}) to be prime`;
  const verdictColor = !lengthPrime ? "text-orange-600" : knownRepunitPrime ? "text-emerald-600" : "text-foreground";

  const breakdown: BreakdownRow[] = [
    { label: "Repunit formula", value: `R_${n}(${input.base}) = (${input.base}^${n} − 1) / (${input.base} − 1)` },
    { label: "Exact value", value: exactString !== null ? exactValue.slice(0, 400) + (exactValue.length > 400 ? " …" : "") : "beyond the exact display range" },
    { label: "Magnitude", value: scientific, highlight: true },
    { label: "Digits in base 10", value: exactString !== null ? `${fmt(decimalDigits, 0)}` : `${fmt(Math.floor(log10Value) + 1, 0)} by logarithm` },
    { label: "Digits in the working base", value: `${fmt(n, 0)} — one leading 1 followed by ${fmt(n - 1, 0)} more` },
    {
      label: "Digit sum in base 10",
      value: digitSum !== null ? `${fmt(digitSum, 0)}` : "only computed for repunits of 200 digits or fewer",
    },
    { label: `Is the length ${fmt(n, 0)} prime?`, value: lengthPrime ? "yes" : "no", highlight: true },
    { label: "Prime factors of the length", value: lengthFactors.length ? lengthFactors.map((f) => fmt(f, 0)).join(" × ") : `${fmt(n, 0)}` },
    {
      label: "Repunit factorisation rule",
      value: divisorsOfLength.length
        ? `R_${n} is divisible by every R_d where d divides ${fmt(n, 0)}: lengths ${divisorsOfLength.map((x) => fmt(x, 0)).join(", ")}`
        : "no proper divisor, so no trivial repunit factor",
    },
    {
      label: `Does ${fmt(input.divisor, 0)} divide R_${n}(${input.base})?`,
      value: divisorPossible ? (divisorDivides ? "yes" : "no") : "impossible — the divisor shares a factor with the base",
      highlight: true,
    },
    {
      label: `Smallest length whose repunit is divisible by ${fmt(input.divisor, 0)}`,
      value: !divisorPossible
        ? "none — no length works"
        : divisorOrder !== null
          ? `${fmt(divisorOrder, 0)}`
          : `not found below ${fmt(ORDER_CAP, 0)}`,
    },
    {
      label: "Test modulus used",
      value: `${fmt(input.divisor * (input.base - 1), 0)} = ${fmt(input.divisor, 0)} × ${fmt(input.base - 1, 0)}`,
    },
    {
      label: "Prime repunit candidate",
      value: primeCandidate
        ? knownRepunitPrime
          ? `confirmed prime in this base (exponent ${fmt(n, 0)} is on the known list)`
          : "possible — primality of the repunit itself has to be proved separately"
        : "no — a composite length gives a composite repunit",
    },
    {
      label: "Known prime exponents in this base",
      value: knownList.length ? knownList.slice(0, 12).map((x) => fmt(x, 0)).join(", ") + (knownList.length > 12 ? ", …" : "") : "no short published list for this base",
    },
  ];

  return {
    valid: true,
    errorMsg: "",
    exactValue,
    exactValueShown,
    decimalDigits: exactString !== null ? decimalDigits : Math.floor(log10Value) + 1,
    digitSum,
    scientific,
    lengthPrime,
    lengthFactors,
    divisorsOfLength,
    divisorDivides,
    divisorOrder,
    divisorPossible,
    orderCap: ORDER_CAP,
    primeCandidate,
    knownRepunitPrime,
    verdict,
    verdictColor,
    breakdown,
  };
}

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  hint?: string;
  error?: string;
  type?: string;
  min?: string;
  max?: string;
  step?: string;
  suffix?: string;
  tooltip?: string;
}

const CompactInput = ({
  id,
  label,
  value,
  onChange,
  onEnter,
  hint,
  error,
  type = "number",
  min,
  max,
  step,
  suffix,
  tooltip,
}: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1" title={tooltip}>
      {label}
    </label>
    <div
      className={`relative w-full flex items-center rounded-md border bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all ${
        error ? "border-destructive" : "border-input"
      }`}
    >
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
    {hint && !error && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
    {error && <p className="text-[11px] text-destructive mt-1">{error}</p>}
  </div>
);

const CompactSelect = ({
  id,
  label,
  value,
  onChange,
  options,
  tooltip,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  tooltip?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1" title={tooltip}>
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-background outline-none focus:outline-none border-none text-foreground"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">{title}</div>
    {children}
  </div>
);

export default function RepunitLengthCalculator() {
  const [base, setBase] = useState(String(DEFAULTS.base));
  const [length, setLength] = useState(String(DEFAULTS.length));
  const [divisor, setDivisor] = useState(String(DEFAULTS.divisor));
  const [exactLimit, setExactLimit] = useState(String(DEFAULTS.exactLimit));
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): RepunitInputs => ({
    base: parseInt(base) || 0,
    length: parseInt(length) || 0,
    divisor: parseInt(divisor) || 0,
    exactLimit: parseInt(exactLimit) || 0,
    decimals: parseFloat(decimals),
  });

  const [calcInputs, setCalcInputs] = useState<RepunitInputs>(() => DEFAULTS);
  const [results, setResults] = useState<RepunitResult>(() => calculateRepunit(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculateRepunit(inputs));
  };

  const reset = () => {
    setBase(String(DEFAULTS.base));
    setLength(String(DEFAULTS.length));
    setDivisor(String(DEFAULTS.divisor));
    setExactLimit(String(DEFAULTS.exactLimit));
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(calculateRepunit(DEFAULTS));
  };

  const baseNum = parseInt(base);
  const lengthNum = parseInt(length);
  const divisorNum = parseInt(divisor);

  // Reference lengths that give a prime repunit in base 10; the current length is
  // offered first when it is not one of them, so the control always shows a value.
  const presetOptions = PRESET_LENGTHS.some((p) => p.value === length)
    ? PRESET_LENGTHS.map((p) => ({ value: p.value, label: p.label }))
    : [{ value: length, label: `${length} (current)` }, ...PRESET_LENGTHS.map((p) => ({ value: p.value, label: p.label }))];

  const errors = {
    base: !Number.isInteger(baseNum) || baseNum < 2 || baseNum > 36 ? "Use a base from 2 to 36" : "",
    length: !Number.isInteger(lengthNum) || lengthNum < 1 || lengthNum > 500000 ? "Length must be 1 to 500,000" : "",
    divisor: !Number.isInteger(divisorNum) || divisorNum < 2 || divisorNum > 1000000 ? "Use a whole number from 2 to 1,000,000" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const faqs = [
    {
      question: "What is a repunit?",
      answer:
        "A repunit is a number written with nothing but repeated ones — 1, 11, 111, 1,111 — so its name comes from repeated unit. In base b the repunit of length n is (bⁿ − 1) / (b − 1), which is 1 for n = 1 and then a string of n ones when it is written in base b. In base 2 every repunit is all ones in binary, so it equals 2ⁿ − 1, which is exactly a Mersenne number.",
    },
    {
      question: "When is a repunit divisible by a smaller number?",
      answer:
        "A whole number m divides R_n(b) exactly when m × (b − 1) divides bⁿ − 1, which is the same as saying bⁿ leaves a remainder of 1 when divided by m × (b − 1). The smallest length n that works is the multiplicative order of b modulo that modulus, and every other length that works is a multiple of it. This calculator finds that smallest length for the divisor you enter and tells you whether your chosen length is one of them.",
    },
    {
      question: "Why does a composite length always give a composite repunit?",
      answer:
        "Because R_n(b) is divisible by R_d(b) whenever d divides n. R_21 in base 10, for example, is divisible by R_3 = 111 and by R_7 = 1,111,111, which is why anyone hunting for prime repunits tests only prime lengths. A prime length is necessary but far from sufficient: in base 10 the lengths 2, 19, 23, 317 and 1031 give primes, while most other prime lengths such as 3, 5, 7, 11 and 13 do not, since 111 = 3 × 37 and 11,111 = 41 × 271.",
    },
    {
      question: "What are the known prime repunits?",
      answer:
        "In base 10 the exponents 2, 19, 23, 317, 1031, 49081, 86453, 109297 and 270343 give repunits that have been proved prime, with the 270,343-digit entry found in 2023 and reported as the largest known. In base 2 the repunits are Mersenne numbers and the prime exponents are the Mersenne prime exponents, so R_n(2) is prime exactly when 2ⁿ − 1 is prime. This calculator flags a length as a known prime exponent when it appears on the published list for the base you are testing.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Math", href: "/calculator#math" },
          { label: "Repunit Length Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Repunit Length Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="The Repunit">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="base"
                  label="Base"
                  value={base}
                  onChange={setBase}
                  onEnter={runCalculate}
                  min="2"
                  max="36"
                  step="1"
                  error={errors.base}
                  hint="10 gives 1, 11, 111 …"
                  tooltip="Number base for the repunit; 2 gives Mersenne numbers."
                />
                <CompactInput
                  id="length"
                  label="Length (n)"
                  value={length}
                  onChange={setLength}
                  onEnter={runCalculate}
                  min="1"
                  max="500000"
                  step="1"
                  suffix="digits"
                  error={errors.length}
                  tooltip="How many ones make up the repunit."
                />
              </div>
            </SubSection>

            <SubSection title="Divisibility Test">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="divisor"
                  label="Test Divisor"
                  value={divisor}
                  onChange={setDivisor}
                  onEnter={runCalculate}
                  min="2"
                  step="1"
                  error={errors.divisor}
                  hint="7, 11, 37, 101 …"
                  tooltip="Find the smallest repunit length that this number divides."
                />
                <CompactInput
                  id="decimals"
                  label="Decimals"
                  value={decimals}
                  onChange={setDecimals}
                  onEnter={runCalculate}
                  min="0"
                  max="2"
                  step="1"
                  tooltip="Decimal places used for the scientific-notation mantissa."
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
                  <SubSection title="Display">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="exact-limit"
                        label="Show Exact Digits Up To"
                        value={exactLimit}
                        onChange={setExactLimit}
                        onEnter={runCalculate}
                        min="1"
                        max="200"
                        step="1"
                        suffix="digits"
                        tooltip="The exact value is always computed up to 200 digits; this only limits what is printed."
                      />
                      <CompactSelect
                        id="length-preset"
                        label="Quick Lengths"
                        value={length}
                        onChange={(v) => setLength(v)}
                        options={presetOptions}
                        tooltip="Fills the length field with a reference value that gives a prime repunit in base 10."
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
                disabled={hasErrors}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start">
            {!results.valid && (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Check your inputs</div>
                <div className="text-base font-medium text-foreground">{results.errorMsg}</div>
              </div>
            )}

            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">
                R_{calcInputs.length}({calcInputs.base})
              </div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight break-all">
                {results.valid ? (results.exactValueShown ? results.exactValue : results.scientific) : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${fmt(results.decimalDigits, 0)} digits in base 10 — a repunit of length ${fmt(calcInputs.length, 0)} has ${fmt(
                      calcInputs.length,
                      0,
                    )} ones in base ${fmt(calcInputs.base, 0)}`
                  : "Fix the highlighted inputs to test the repunit"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Length Prime</span>
                <span className={`font-extrabold ${results.lengthPrime ? "text-emerald-600" : "text-orange-600"}`}>
                  {results.valid ? (results.lengthPrime ? "yes" : "no") : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Digit Sum</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? (results.digitSum !== null ? fmt(results.digitSum, 0) : "—") : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Divisor Order
                </span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? (results.divisorOrder !== null ? fmt(results.divisorOrder, 0) : "none") : "—"}
                </span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Repunit Property</th>
                    <th className="p-2.5 pr-3 text-right w-[240px]">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.valid ? (
                    results.breakdown.map((row) => (
                      <tr key={row.label} className={row.highlight ? "bg-secondary/20" : "hover:bg-secondary/20 transition-colors"}>
                        <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                        <td className="p-2.5 pr-3 text-right text-foreground break-all">{row.value}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-2.5 pl-3 text-muted-foreground" colSpan={2}>
                        Enter a base and a length to inspect the repunit.
                      </td>
                    </tr>
                  )}
                  {results.valid && (
                    <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                      <td className="p-2.5 pl-3 text-foreground">R_{calcInputs.length}({calcInputs.base})</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">
                        {`${fmt(results.decimalDigits, 0)} digits · ${results.lengthPrime ? "prime length" : "composite length"}`}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 4. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Base</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.base, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Length</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.length, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Decimal digits</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? fmt(results.decimalDigits, 0) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Magnitude</span>
                  <span className="text-base font-bold text-foreground break-all">{results.valid ? results.scientific : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Smallest divisible length</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? (results.divisorOrder !== null ? fmt(results.divisorOrder, 0) : "none") : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Divisor divides this repunit</span>
                  <span className={`text-base font-bold ${results.divisorDivides ? "text-emerald-600" : "text-foreground"}`}>
                    {results.valid ? (results.divisorDivides ? "yes" : "no") : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Factors of the length</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid && results.lengthFactors.length ? results.lengthFactors.join(" × ") : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Prime repunit in this base</span>
                  <span className={`text-base font-bold ${results.knownRepunitPrime ? "text-emerald-600" : "text-foreground"}`}>
                    {results.valid ? (results.knownRepunitPrime ? "known prime" : "not on the known list") : "—"}
                  </span>
                </div>
              </div>
              {results.valid && <p className={`text-[11px] mt-3 font-semibold ${results.verdictColor}`}>{results.verdict}.</p>}
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Repunit Length Calculator?</h2>
            <p>
              A repunit length calculator takes a base and a length and reports the repunit those two numbers define — the integer
              written as a run of ones in that base, whose value is (bⁿ − 1) / (b − 1). It then answers the questions that come up
              whenever repunits appear in a problem: how many digits the value has in base 10, whether the length is prime, which
              smaller repunits divide it, and what the smallest length is whose repunit a chosen divisor can divide.
            </p>
            <p>
              Repunits sit at the meeting point of two classical ideas. In base 10 they are the all-ones numbers that turn up in
              repeating-decimal arithmetic — 1/7 has a period of six digits and 7 divides 111,111 — while in base 2 they are the
              Mersenne numbers 2ⁿ − 1, which is where the search for the largest known primes has historically lived.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The value is computed from the geometric-series identity. A repunit of length n in base b equals 1 + b + b² + … + bⁿ⁻¹,
              which sums to (bⁿ − 1) / (b − 1). The calculator builds the exact integer while that is cheap, up to 200 digits, and
              switches to a magnitude estimate after that, because a repunit of length 270,343 has 270,343 digits and no display is
              better off printing them.
            </p>
            <p>
              Divisibility comes from the same identity. A number m divides R_n(b) exactly when m(b − 1) divides bⁿ − 1, which is true
              when bⁿ leaves a remainder of 1 modulo m(b − 1). Modular exponentiation checks whether your chosen length satisfies
              that, and a walk that multiplies the residue by the base one step at a time finds the smallest length n that works — the
              multiplicative order of b modulo the modulus. Every length that works is a multiple of that smallest one, so a single
              number in the results explains the whole pattern.
            </p>
            <p>
              The factorisation rule follows too. R_n(b) is divisible by R_d(b) whenever d divides n, so a composite length always
              produces a composite repunit and prime-length repunits are the only interesting cases. The calculator lists the prime
              factors of the length, names the divisor lengths they imply, and flags whether the length appears on the published list
              of exponents that give a prime repunit in the base being tested.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card is the repunit itself: exact digits when the length is short enough, scientific notation otherwise. The
              three-stat bar shows whether the length is prime, the sum of the decimal digits when the value was computed exactly, and
              the smallest length whose repunit your test divisor can divide.
            </p>
            <p>
              The breakdown table carries the formula, the exact or truncated value, the digit counts in both bases, the digit sum,
              the primality and factorisation of the length, the divisibility verdict for your divisor, the modulus that was tested
              and the known prime exponents for that base. The summary panel collects the headline numbers, including the verdict line
              that says whether the length can possibly give a prime repunit at all.
            </p>
            <p>
              Treat the primality flags carefully. A prime length is necessary for a prime repunit but nowhere near sufficient — R_3 in
              base 10 is 111 = 3 × 37 and R_5 is 11,111 = 41 × 271 — and proving a long repunit prime needs either algebraic
              factorisation work or a probabilistic primality test on a number with hundreds of thousands of digits. The known lists
              quoted here are the published exponents, not a claim that shorter lengths have been ignored.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/repunit-length-calculator" />
          <PopularCalculators exclude="/calculator/repunit-length-calculator" />
        </div>
      </div>
    </>
  );
}
