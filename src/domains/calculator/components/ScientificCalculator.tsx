"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type AngleMode = "deg" | "rad";

interface ScientificInputs {
  expression: string;
  angleMode: AngleMode;
  decimals: number;
}

const DEFAULTS: ScientificInputs = {
  expression: "sin(30) + 2^3 * sqrt(16)",
  angleMode: "deg",
  decimals: 6,
};

const FUNCTIONS = ["sin", "cos", "tan", "asin", "acos", "atan", "ln", "log", "sqrt", "cbrt", "abs", "exp"];

const fmt = (v: number, d = 6) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const fmtNum = (v: number, d: number) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: d }) : "—";

interface Token {
  kind: "num" | "op" | "func" | "lparen" | "rparen" | "fact" | "const";
  value: string;
}

interface ParseResult {
  ok: boolean;
  error: string;
  tokens: Token[];
  rpn: Token[];
  value: number;
  functionsUsed: string[];
}

function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n > 170) return Infinity;
  let out = 1;
  for (let i = 2; i <= n; i++) out *= i;
  return out;
}

function tokenize(src: string): { tokens: Token[]; error: string } {
  const tokens: Token[] = [];
  let i = 0;
  const s = src.replace(/\s+/g, "");
  if (s.length === 0) return { tokens, error: "Enter an expression to evaluate." };

  while (i < s.length) {
    const ch = s[i];

    if (/[0-9.]/.test(ch)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      const literal = s.slice(i, j);
      if ((literal.match(/\./g) || []).length > 1) {
        return { tokens: [], error: `Invalid number "${literal}" — a decimal point can appear only once.` };
      }
      tokens.push({ kind: "num", value: literal });
      i = j;
      continue;
    }

    if (/[a-zA-Z]/.test(ch)) {
      let j = i;
      while (j < s.length && /[a-zA-Z]/.test(s[j])) j++;
      const word = s.slice(i, j).toLowerCase();
      if (word === "pi") {
        tokens.push({ kind: "const", value: "pi" });
      } else if (word === "e") {
        tokens.push({ kind: "const", value: "e" });
      } else if (FUNCTIONS.includes(word)) {
        tokens.push({ kind: "func", value: word });
      } else {
        return { tokens: [], error: `Unknown name "${word}". Supported functions are ${FUNCTIONS.join(", ")}, plus pi and e.` };
      }
      i = j;
      continue;
    }

    if (ch === "(") {
      tokens.push({ kind: "lparen", value: ch });
      i++;
      continue;
    }
    if (ch === ")") {
      tokens.push({ kind: "rparen", value: ch });
      i++;
      continue;
    }
    if (ch === "!") {
      tokens.push({ kind: "fact", value: ch });
      i++;
      continue;
    }
    if ("+-*/^%".includes(ch)) {
      const prev = tokens[tokens.length - 1];
      const isUnary =
        ch === "-" &&
        (tokens.length === 0 ||
          prev?.kind === "op" ||
          prev?.kind === "lparen" ||
          prev?.kind === "func");
      tokens.push({ kind: "op", value: isUnary ? "u-" : ch });
      i++;
      continue;
    }

    return { tokens: [], error: `Unexpected character "${ch}". Use numbers, + − × ÷ ^ !, parentheses and function names.` };
  }

  return { tokens, error: "" };
}

const PRECEDENCE: Record<string, number> = {
  "+": 1,
  "-": 1,
  "*": 2,
  "/": 2,
  "%": 2,
  "^": 3,
  "u-": 4,
};

function toRpn(tokens: Token[]): { rpn: Token[]; error: string; functionsUsed: string[] } {
  const output: Token[] = [];
  const stack: Token[] = [];
  const functionsUsed: string[] = [];
  let prev: Token | undefined;

  for (const token of tokens) {
    if (token.kind === "num" || token.kind === "const") {
      output.push(token);
    } else if (token.kind === "func") {
      stack.push(token);
    } else if (token.kind === "fact") {
      output.push(token);
    } else if (token.kind === "op") {
      while (
        stack.length > 0 &&
        stack[stack.length - 1].kind === "op" &&
        PRECEDENCE[stack[stack.length - 1].value] > PRECEDENCE[token.value]
      ) {
        output.push(stack.pop() as Token);
      }
      while (
        stack.length > 0 &&
        stack[stack.length - 1].kind === "op" &&
        PRECEDENCE[stack[stack.length - 1].value] === PRECEDENCE[token.value] &&
        token.value !== "^" &&
        token.value !== "u-"
      ) {
        output.push(stack.pop() as Token);
      }
      stack.push(token);
    } else if (token.kind === "lparen") {
      stack.push(token);
    } else {
      let matched = false;
      while (stack.length > 0) {
        const top = stack.pop() as Token;
        if (top.kind === "lparen") {
          matched = true;
          break;
        }
        output.push(top);
      }
      if (!matched) return { rpn: [], error: "There is a closing parenthesis without a matching opening one.", functionsUsed };
      if (stack.length > 0 && stack[stack.length - 1].kind === "func") {
        const fn = stack.pop() as Token;
        functionsUsed.push(fn.value);
        output.push(fn);
      }
    }
    prev = token;
  }

  void prev;

  while (stack.length > 0) {
    const top = stack.pop() as Token;
    if (top.kind === "lparen") return { rpn: [], error: "An opening parenthesis was never closed.", functionsUsed };
    output.push(top);
  }

  return { rpn: output, error: "", functionsUsed };
}

function evalRpn(rpn: Token[], angleMode: AngleMode): { value: number; error: string } {
  const stack: number[] = [];
  const toRad = (v: number) => (angleMode === "deg" ? (v * Math.PI) / 180 : v);
  const fromRad = (v: number) => (angleMode === "deg" ? (v * 180) / Math.PI : v);

  for (const token of rpn) {
    if (token.kind === "num") {
      stack.push(parseFloat(token.value));
      continue;
    }
    if (token.kind === "const") {
      stack.push(token.value === "pi" ? Math.PI : Math.E);
      continue;
    }
    if (token.kind === "fact") {
      const a = stack.pop();
      if (a === undefined) return { value: NaN, error: "The factorial operator has no number in front of it." };
      const f = factorial(a);
      if (!Number.isFinite(f)) return { value: NaN, error: "Factorial needs a whole number between 0 and 170." };
      stack.push(f);
      continue;
    }
    if (token.kind === "func") {
      const a = stack.pop();
      if (a === undefined) return { value: NaN, error: `The function ${token.value} is missing its argument.` };
      let r: number;
      switch (token.value) {
        case "sin":
          r = Math.sin(toRad(a));
          break;
        case "cos":
          r = Math.cos(toRad(a));
          break;
        case "tan":
          r = Math.tan(toRad(a));
          break;
        case "asin":
          if (a < -1 || a > 1) return { value: NaN, error: "asin only accepts values between −1 and 1." };
          r = fromRad(Math.asin(a));
          break;
        case "acos":
          if (a < -1 || a > 1) return { value: NaN, error: "acos only accepts values between −1 and 1." };
          r = fromRad(Math.acos(a));
          break;
        case "atan":
          r = fromRad(Math.atan(a));
          break;
        case "ln":
          if (a <= 0) return { value: NaN, error: "The natural logarithm needs a positive argument." };
          r = Math.log(a);
          break;
        case "log":
          if (a <= 0) return { value: NaN, error: "The base-ten logarithm needs a positive argument." };
          r = Math.log10(a);
          break;
        case "sqrt":
          if (a < 0) return { value: NaN, error: "The square root needs a value of zero or more." };
          r = Math.sqrt(a);
          break;
        case "cbrt":
          r = Math.cbrt(a);
          break;
        case "abs":
          r = Math.abs(a);
          break;
        case "exp":
          r = Math.exp(a);
          break;
        default:
          return { value: NaN, error: `Unknown function ${token.value}.` };
      }
      stack.push(r);
      continue;
    }

    const b = stack.pop();
    const a = stack.pop();
    if (token.value === "u-") {
      if (a === undefined) return { value: NaN, error: "A minus sign has no number after it." };
      stack.push(-a);
      continue;
    }
    if (a === undefined || b === undefined) {
      return { value: NaN, error: `The operator ${token.value} is missing an operand.` };
    }
    switch (token.value) {
      case "+":
        stack.push(a + b);
        break;
      case "-":
        stack.push(a - b);
        break;
      case "*":
        stack.push(a * b);
        break;
      case "/":
        if (b === 0) return { value: NaN, error: "Division by zero is not defined." };
        stack.push(a / b);
        break;
      case "%":
        if (b === 0) return { value: NaN, error: "The remainder operator cannot divide by zero." };
        stack.push(a % b);
        break;
      case "^":
        stack.push(Math.pow(a, b));
        break;
      default:
        return { value: NaN, error: `Unsupported operator ${token.value}.` };
    }
  }

  if (stack.length !== 1) {
    return { value: NaN, error: "The expression could not be reduced to a single value. Check the operators." };
  }
  return { value: stack[0], error: "" };
}

function evaluate(expression: string, angleMode: AngleMode): ParseResult {
  const { tokens, error } = tokenize(expression);
  if (error) return { ok: false, error, tokens: [], rpn: [], value: NaN, functionsUsed: [] };
  const { rpn, error: rpnError, functionsUsed } = toRpn(tokens);
  if (rpnError) return { ok: false, error: rpnError, tokens, rpn: [], value: NaN, functionsUsed };
  const { value, error: evalError } = evalRpn(rpn, angleMode);
  if (evalError) return { ok: false, error: evalError, tokens, rpn, value: NaN, functionsUsed };
  if (!Number.isFinite(value)) {
    return { ok: false, error: "The result is not a finite number — check for very large powers or logarithms.", tokens, rpn, value: NaN, functionsUsed };
  }
  return { ok: true, error: "", tokens, rpn, value, functionsUsed };
}

function computeScientific(input: ScientificInputs): ParseResult {
  return evaluate(input.expression, input.angleMode);
}

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  hint?: string;
  type?: string;
  min?: string;
  suffix?: string;
  tooltip?: string;
}

const CompactInput = ({ id, label, value, onChange, onEnter, hint, type = "number", min, suffix, tooltip }: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1" title={tooltip}>
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input
        id={id}
        type={type}
        value={value}
        min={min}
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

export default function ScientificCalculator() {
  const [expression, setExpression] = useState(DEFAULTS.expression);
  const [angleMode, setAngleMode] = useState<AngleMode>(DEFAULTS.angleMode);
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [memory, setMemory] = useState("0");
  const [showAdv, setShowAdv] = useState(false);
  const [history, setHistory] = useState<{ expression: string; result: string; mode: string }[]>([]);

  const [calcInputs, setCalcInputs] = useState<ScientificInputs>(() => DEFAULTS);
  const [results, setResults] = useState<ParseResult>(() => computeScientific(DEFAULTS));

  const getInputs = (): ScientificInputs => ({
    expression,
    angleMode,
    decimals: Math.max(0, Math.min(12, parseFloat(decimals) || 6)),
  });

  const runCalculate = () => {
    const inputs = getInputs();
    const parsed = computeScientific(inputs);
    setCalcInputs(inputs);
    setResults(parsed);
    if (parsed.ok) {
      setHistory((prev) =>
        [
          {
            expression: inputs.expression,
            result: fmtNum(parsed.value, inputs.decimals),
            mode: inputs.angleMode === "deg" ? "Degrees" : "Radians",
          },
          ...prev,
        ].slice(0, 8),
      );
    }
  };

  const reset = () => {
    setExpression(DEFAULTS.expression);
    setAngleMode(DEFAULTS.angleMode);
    setDecimals(String(DEFAULTS.decimals));
    setMemory("0");
    setHistory([]);
    setCalcInputs(DEFAULTS);
    setResults(computeScientific(DEFAULTS));
  };

  const append = (text: string) => {
    setExpression((prev) => (prev === "0" ? text : `${prev}${text}`));
  };

  const backspace = () => {
    setExpression((prev) => prev.slice(0, Math.max(0, prev.length - 1)));
  };

  const KEYS: { label: string; insert: string }[] = [
    { label: "sin", insert: "sin(" },
    { label: "cos", insert: "cos(" },
    { label: "tan", insert: "tan(" },
    { label: "asin", insert: "asin(" },
    { label: "acos", insert: "acos(" },
    { label: "atan", insert: "atan(" },
    { label: "ln", insert: "ln(" },
    { label: "log", insert: "log(" },
    { label: "sqrt", insert: "sqrt(" },
    { label: "cbrt", insert: "cbrt(" },
    { label: "abs", insert: "abs(" },
    { label: "exp", insert: "exp(" },
    { label: "π", insert: "pi" },
    { label: "e", insert: "e" },
    { label: "x²", insert: "^2" },
    { label: "xʸ", insert: "^" },
    { label: "!", insert: "!" },
    { label: "(", insert: "(" },
    { label: ")", insert: ")" },
    { label: "7", insert: "7" },
    { label: "8", insert: "8" },
    { label: "9", insert: "9" },
    { label: "÷", insert: "/" },
    { label: "4", insert: "4" },
    { label: "5", insert: "5" },
    { label: "6", insert: "6" },
    { label: "×", insert: "*" },
    { label: "1", insert: "1" },
    { label: "2", insert: "2" },
    { label: "3", insert: "3" },
    { label: "−", insert: "-" },
    { label: "0", insert: "0" },
    { label: ".", insert: "." },
    { label: "mod", insert: "%" },
    { label: "+", insert: "+" },
  ];

  const primaryText = () => {
    if (!results.ok) return "Error";
    return fmtNum(results.value, calcInputs.decimals);
  };

  const scientificNotation = () => {
    if (!results.ok) return "—";
    return results.value.toExponential(Math.min(10, calcInputs.decimals));
  };

  const rpnText = results.rpn.map((t) => t.value).join(" ") || "—";

  const faqs = [
    {
      question: "Does the calculator work in degrees or radians?",
      answer:
        "Both. Degree mode treats the argument of sin, cos and tan as an angle measured out of three hundred and sixty, while radians measure it in multiples of pi. The two modes give completely different answers for the same input, so check the toggle before trusting a trigonometric result.",
    },
    {
      question: "What order of operations is used?",
      answer:
        "Powers are evaluated first, then multiplication, division and remainder, then addition and subtraction, with parentheses overriding everything. Unary minus binds tighter than the binary operators, and the exponent operator is right-associative, so two to the power of three to the power of two is evaluated from the top down.",
    },
    {
      question: "Which functions are supported?",
      answer:
        "Trigonometry with sine, cosine and tangent and their inverses; logarithms with natural log and base ten; square and cube roots; absolute value; the exponential function; factorials; the constants pi and e; and the usual arithmetic operators including remainder. Function names can be typed directly or inserted with the keypad.",
    },
    {
      question: "Why does the factorial return an error for large numbers?",
      answer:
        "Factorials grow extraordinarily fast, and beyond one hundred and seventy they exceed the largest number a standard double can hold. The calculator therefore limits factorials to whole numbers up to that point rather than returning an infinity. The same limit explains why the result of a huge power can be reported as not finite.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Math", href: "/calculator#math" },
          { label: "Scientific Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Scientific Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Expression">
              <CompactInput
                id="expression"
                label="Type or Paste"
                value={expression}
                onChange={setExpression}
                onEnter={runCalculate}
                type="text"
                hint="Example: sin(30) + 2^3 * sqrt(16)"
              />
            </SubSection>

            <SubSection title="Angle Mode">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAngleMode("deg")}
                  aria-pressed={angleMode === "deg"}
                  className={
                    angleMode === "deg"
                      ? "h-9 rounded-md bg-primary text-primary-foreground font-semibold text-sm shadow-sm transition-all active:scale-[0.98]"
                      : "h-9 rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold text-sm transition-colors"
                  }
                >
                  Degrees
                </button>
                <button
                  type="button"
                  onClick={() => setAngleMode("rad")}
                  aria-pressed={angleMode === "rad"}
                  className={
                    angleMode === "rad"
                      ? "h-9 rounded-md bg-primary text-primary-foreground font-semibold text-sm shadow-sm transition-all active:scale-[0.98]"
                      : "h-9 rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold text-sm transition-colors"
                  }
                >
                  Radians
                </button>
              </div>
            </SubSection>

            <SubSection title="Keypad">
              <div className="grid grid-cols-6 gap-1.5">
                {KEYS.map((key) => (
                  <button
                    key={key.label}
                    type="button"
                    onClick={() => append(key.insert)}
                    className="h-8 rounded-md border border-border bg-background hover:bg-secondary text-foreground text-xs font-semibold transition-colors"
                  >
                    {key.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                <button
                  type="button"
                  onClick={backspace}
                  className="h-8 rounded-md border border-border bg-background hover:bg-secondary text-foreground text-xs font-semibold transition-colors"
                >
                  Backspace
                </button>
                <button
                  type="button"
                  onClick={() => setExpression("")}
                  className="h-8 rounded-md border border-border bg-background hover:bg-secondary text-foreground text-xs font-semibold transition-colors"
                >
                  Clear
                </button>
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
                  <SubSection title="Precision & Memory">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="decimals"
                        label="Decimal Places"
                        value={decimals}
                        onChange={setDecimals}
                        onEnter={runCalculate}
                        min="0"
                        tooltip="How many digits to show after the decimal point."
                      />
                      <CompactInput
                        id="memory"
                        label="Memory Value"
                        value={memory}
                        onChange={setMemory}
                        onEnter={runCalculate}
                        tooltip="A stored number you can drop into an expression from the keypad area."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setMemory(results.ok ? String(results.value) : memory)}
                        className="h-8 rounded-md border border-border bg-background hover:bg-secondary text-foreground text-xs font-semibold transition-colors"
                      >
                        Store Result
                      </button>
                      <button
                        type="button"
                        onClick={() => append(memory)}
                        className="h-8 rounded-md border border-border bg-background hover:bg-secondary text-foreground text-xs font-semibold transition-colors"
                      >
                        Insert Memory
                      </button>
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
            {!results.ok && (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Cannot evaluate</div>
                <div className="text-base font-medium text-foreground">{results.error}</div>
              </div>
            )}

            {/* PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Result</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight break-all">{primaryText()}</div>
              <div className="text-sm text-muted-foreground font-medium break-all">
                {calcInputs.expression} · {calcInputs.angleMode === "deg" ? "degrees" : "radians"}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Angle Mode</span>
                <span className="font-extrabold text-foreground">
                  {calcInputs.angleMode === "deg" ? "Degrees" : "Radians"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Functions Used</span>
                <span className="font-extrabold text-foreground">{results.functionsUsed.length}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Tokens</span>
                <span className="font-extrabold text-foreground">{results.tokens.length}</span>
              </div>
            </div>

            {/* PARSE TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Stage</th>
                    <th className="p-2.5 pr-3">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Expression as typed</td>
                    <td className="p-2.5 pr-3 text-foreground break-all">{calcInputs.expression || "—"}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Order of operations</td>
                    <td className="p-2.5 pr-3 text-foreground break-all">{rpnText}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Functions recognised</td>
                    <td className="p-2.5 pr-3 text-foreground">
                      {results.functionsUsed.length > 0 ? results.functionsUsed.join(", ") : "None"}
                    </td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Evaluated result</td>
                    <td className="p-2.5 pr-3 text-emerald-600 break-all">{primaryText()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* HISTORY TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Recent Calculation</th>
                    <th className="p-2.5 text-right">Result</th>
                    <th className="p-2.5 pr-3 text-right w-[120px]">Mode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {history.length === 0 && (
                    <tr>
                      <td className="p-2.5 pl-3 text-muted-foreground" colSpan={3}>
                        Press Calculate to start a history list.
                      </td>
                    </tr>
                  )}
                  {history.map((row, index) => (
                    <tr key={`${row.expression}-${index}`} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground break-all">{row.expression}</td>
                      <td className="p-2.5 text-right text-foreground break-all">{row.result}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{row.mode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">
                Summary Statistics
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Decimal</span>
                  <span className="text-base font-bold text-foreground break-all">{primaryText()}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Scientific Notation</span>
                  <span className="text-base font-bold text-foreground break-all">{scientificNotation()}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Square</span>
                  <span className="text-base font-bold text-foreground break-all">
                    {results.ok ? fmtNum(results.value * results.value, calcInputs.decimals) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Reciprocal</span>
                  <span className="text-base font-bold text-foreground break-all">
                    {results.ok && results.value !== 0 ? fmtNum(1 / results.value, calcInputs.decimals) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Absolute Value</span>
                  <span className="text-base font-bold text-foreground break-all">
                    {results.ok ? fmtNum(Math.abs(results.value), calcInputs.decimals) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Number Type</span>
                  <span className="text-base font-bold text-foreground">
                    {results.ok
                      ? Number.isInteger(results.value)
                        ? "Whole number"
                        : "Decimal"
                      : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Memory</span>
                  <span className="text-base font-bold text-foreground break-all">{memory}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Rounded to 4 Places</span>
                  <span className="text-base font-bold text-foreground break-all">
                    {results.ok ? fmt(results.value, 4) : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Scientific Calculator?</h2>
            <p>
              A scientific calculator evaluates a written expression rather than a sequence of button presses, so the whole
              calculation stays visible and can be checked or corrected before it is run. It supports trigonometry, logarithms,
              roots, powers, factorials, the constants pi and e, and the usual arithmetic operators, with a keypad for quick
              entry and a text field for typing or pasting longer expressions.
            </p>
            <p>
              Entering a complete expression is more reliable than chaining operations, because the true order of operations is
              applied instead of whatever order the buttons were pressed. It also makes the working easy to copy into notes,
              homework or a spreadsheet, and the history table keeps the last few results within reach for comparison.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The expression is first split into numbers, operators, function names and parentheses. A shunting-yard pass then
              reorders everything into a sequence where each operator follows its own operands, which encodes the precedence
              rules: powers bind tightest, then multiplication, division and remainder, then addition and subtraction, with
              parentheses overriding the default order.
            </p>
            <p>
              Evaluated in that order, the expression collapses to a single value. Trigonometric functions respect the angle
              mode, so sine of thirty means one half in degree mode and a very different number in radians. Inverse functions
              return their results in the same units, logarithms reject non-positive arguments, and division by zero stops the
              calculation with an explanation instead of an infinity.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the value, with the angle mode, the number of functions recognised and the token count in
              the three-stat bar. The first table records the expression as typed, the reordered sequence used to evaluate it,
              which functions were called and the final result, which together make the working auditable line by line.
            </p>
            <p>
              The summary panel reports the same number in several forms: full decimal, scientific notation, square,
              reciprocal and absolute value, plus a note on whether it is whole or fractional. Scientific notation is the
              clearest way to read very large or very small results, where a decimal expansion runs out of meaningful digits.
            </p>
            <p>
              Memory is useful for multi-step work. Store the current result, build the next expression, then insert the stored
              value wherever it is needed, and repeat. Because the token count and function list update with every calculation,
              a mistyped expression is usually obvious from the breakdown before the answer is trusted.
            </p>
            <p>
              Keep precision realistic. A displayed result of six decimal places does not mean six digits are accurate: input
              values rounded to two places limit the reliability of everything downstream. For engineering and scientific work,
              carry more digits through intermediate steps than you intend to report, and              round only at the end.
            </p>
            <p>
              Percentages and angles are the two inputs people most often mix up. A percentage entered as a plain number is
              not divided by one hundred automatically, and an angle entered without checking the mode can be out by a factor
              of nearly fifty-seven. Turning both into habits of the first glance saves a lot of rework later.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/scientific-calculator" />
          <PopularCalculators exclude="/calculator/scientific-calculator" />
        </div>
      </div>
    </>
  );
}
