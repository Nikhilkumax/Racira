"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface QuadraticInputs {
  a: number;
  b: number;
  c: number;
  decimals: number;
}

const DEFAULTS: QuadraticInputs = {
  a: 1,
  b: -3,
  c: -10,
  decimals: 4,
};

const fmt = (v: number, d = 4) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface QuadraticResult {
  valid: boolean;
  errorMsg: string;
  discriminant: number;
  root1Real: number;
  root1Imag: number;
  root2Real: number;
  root2Imag: number;
  complex: boolean;
  doubleRoot: boolean;
  rootSum: number;
  rootProduct: number;
  vertexX: number;
  vertexY: number;
  opensUp: boolean;
  yIntercept: number;
  nature: string;
  factored: string;
}

function computeQuadratic(input: QuadraticInputs): QuadraticResult {
  const { a, b, c } = input;

  const blank: QuadraticResult = {
    valid: false,
    errorMsg: "",
    discriminant: 0,
    root1Real: 0,
    root1Imag: 0,
    root2Real: 0,
    root2Imag: 0,
    complex: false,
    doubleRoot: false,
    rootSum: 0,
    rootProduct: 0,
    vertexX: 0,
    vertexY: 0,
    opensUp: true,
    yIntercept: 0,
    nature: "",
    factored: "",
  };

  if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c)) {
    return { ...blank, errorMsg: "Enter a number for each of the three coefficients." };
  }
  if (a === 0) {
    return {
      ...blank,
      errorMsg: "The coefficient a cannot be zero, because the equation would be linear rather than quadratic. Solve it as a straight line instead.",
    };
  }

  const discriminant = b * b - 4 * a * c;
  const twoA = 2 * a;
  const complex = discriminant < 0;
  const doubleRoot = discriminant === 0;

  let root1Real = 0;
  let root1Imag = 0;
  let root2Real = 0;
  let root2Imag = 0;

  if (complex) {
    root1Real = -b / twoA;
    root2Real = -b / twoA;
    const imagMagnitude = Math.sqrt(-discriminant) / Math.abs(twoA);
    root1Imag = imagMagnitude;
    root2Imag = -imagMagnitude;
  } else {
    const sqrtD = Math.sqrt(discriminant);
    root1Real = (-b + sqrtD) / twoA;
    root2Real = (-b - sqrtD) / twoA;
  }

  const vertexX = -b / twoA;
  const vertexY = a * vertexX * vertexX + b * vertexX + c;
  const nature =
    discriminant > 0
      ? "Two distinct real roots"
      : discriminant === 0
        ? "One repeated real root"
        : discriminant < 0
          ? "Two complex conjugate roots"
          : "Unknown";

  const factored = complex
    ? "Cannot be factored over the real numbers"
    : doubleRoot
      ? `a(x − ${fmt(root1Real, 4)})²`
      : `a(x − ${fmt(root1Real, 4)})(x − ${fmt(root2Real, 4)})`;

  return {
    valid: true,
    errorMsg: "",
    discriminant: Number(discriminant.toFixed(6)),
    root1Real: Number(root1Real.toFixed(6)),
    root1Imag: Number(root1Imag.toFixed(6)),
    root2Real: Number(root2Real.toFixed(6)),
    root2Imag: Number(root2Imag.toFixed(6)),
    complex,
    doubleRoot,
    rootSum: Number((-b / a).toFixed(6)),
    rootProduct: Number((c / a).toFixed(6)),
    vertexX: Number(vertexX.toFixed(6)),
    vertexY: Number(vertexY.toFixed(6)),
    opensUp: a > 0,
    yIntercept: Number(c.toFixed(6)),
    nature,
    factored,
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

export default function QuadraticFormulaCalculator() {
  const [a, setA] = useState(String(DEFAULTS.a));
  const [b, setB] = useState(String(DEFAULTS.b));
  const [c, setC] = useState(String(DEFAULTS.c));
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): QuadraticInputs => ({
    a: parseFloat(a) || 0,
    b: parseFloat(b) || 0,
    c: parseFloat(c) || 0,
    decimals: Math.max(0, Math.min(8, parseFloat(decimals) || 4)),
  });

  const [calcInputs, setCalcInputs] = useState<QuadraticInputs>(() => DEFAULTS);
  const [results, setResults] = useState<QuadraticResult>(() => computeQuadratic(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeQuadratic(inputs));
  };

  const reset = () => {
    setA(String(DEFAULTS.a));
    setB(String(DEFAULTS.b));
    setC(String(DEFAULTS.c));
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(computeQuadratic(DEFAULTS));
  };

  const root1Text = () => {
    if (!results.valid) return "—";
    if (!results.complex) return fmt(results.root1Real, calcInputs.decimals);
    return `${fmt(results.root1Real, calcInputs.decimals)} + ${fmt(results.root1Imag, calcInputs.decimals)}i`;
  };

  const root2Text = () => {
    if (!results.valid) return "—";
    if (!results.complex) return fmt(results.root2Real, calcInputs.decimals);
    return `${fmt(results.root2Real, calcInputs.decimals)} − ${fmt(Math.abs(results.root2Imag), calcInputs.decimals)}i`;
  };

  const faqs = [
    {
      question: "What is the quadratic formula?",
      answer:
        "For an equation written as ax² + bx + c = 0, the solutions are x = (−b ± √(b² − 4ac)) ÷ 2a. The formula comes from completing the square on the general quadratic and it works for every case, whether the roots are whole numbers, awkward decimals or complex values that have no points on an ordinary graph.",
    },
    {
      question: "What does the discriminant tell me?",
      answer:
        "The discriminant is the part under the square root, b² − 4ac. A positive value means two distinct real roots and a parabola that crosses the x-axis twice, zero means one repeated root where the curve just touches the axis, and a negative value means the roots are complex and the curve never reaches the axis at all.",
    },
    {
      question: "Can I solve a quadratic without the formula?",
      answer:
        "Sometimes. Simple equations factor neatly, as in x² − 5x + 6 = (x − 2)(x − 3), and completing the square always works but takes longer. Factoring only helps when the roots are rational, so the formula remains the reliable method whenever the numbers are awkward or you do not want to hunt for factors.",
    },
    {
      question: "What is the vertex of the parabola?",
      answer:
        "The vertex sits on the axis of symmetry at x = −b ÷ 2a, and its y value comes from substituting that x back into the original expression. For a positive leading coefficient the vertex is the lowest point of the curve, and for a negative one it is the highest. The summary panel reports both coordinates together with the y-intercept.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Math", href: "/calculator#math" },
          { label: "Quadratic Formula Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Quadratic Formula Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="ax² + bx + c = 0">
              <div className="grid grid-cols-3 gap-3">
                <CompactInput
                  id="coeff-a"
                  label="a"
                  value={a}
                  onChange={setA}
                  onEnter={runCalculate}
                  tooltip="Coefficient of x squared. It cannot be zero."
                />
                <CompactInput
                  id="coeff-b"
                  label="b"
                  value={b}
                  onChange={setB}
                  onEnter={runCalculate}
                  tooltip="Coefficient of x."
                />
                <CompactInput
                  id="coeff-c"
                  label="c"
                  value={c}
                  onChange={setC}
                  onEnter={runCalculate}
                  tooltip="Constant term."
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
                    <CompactInput
                      id="decimals"
                      label="Decimal Places"
                      value={decimals}
                      onChange={setDecimals}
                      onEnter={runCalculate}
                      min="0"
                      tooltip="How many digits to show after the decimal point."
                    />
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Roots</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? (results.doubleRoot ? root1Text() : `x₁ = ${root1Text()}`) : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? results.doubleRoot
                    ? `Double root: x = ${root1Text()}`
                    : `x₂ = ${root2Text()}`
                  : "Fix the highlighted inputs to see an answer"}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Discriminant</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? fmt(results.discriminant, calcInputs.decimals) : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Root Sum</span>
                <span className="font-extrabold text-foreground">{results.valid ? fmt(results.rootSum, calcInputs.decimals) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Root Product</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? fmt(results.rootProduct, calcInputs.decimals) : "—"}
                </span>
              </div>
            </div>

            {/* STEP TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Term</th>
                    <th className="p-2.5 pr-3 text-right w-[190px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Discriminant b² − 4ac</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{fmt(results.discriminant, calcInputs.decimals)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Nature of the roots</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{results.nature}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">First root x₁</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{root1Text()}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Second root x₂</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{root2Text()}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Factored form</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{results.factored}</td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Equation form</td>
                    <td className="p-2.5 pr-3 text-right text-emerald-600">
                      {`${fmt(calcInputs.a, 4)}x² ${calcInputs.b >= 0 ? "+" : "−"} ${fmt(Math.abs(calcInputs.b), 4)}x ${calcInputs.c >= 0 ? "+" : "−"} ${fmt(Math.abs(calcInputs.c), 4)} = 0`}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* PARABOLA TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Parabola Feature</th>
                    <th className="p-2.5 pr-3 text-right w-[190px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Opens</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">
                      {results.opensUp ? "Upward (minimum)" : "Downward (maximum)"}
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Axis of symmetry</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{`x = ${fmt(results.vertexX, calcInputs.decimals)}`}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Vertex</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">
                      {`(${fmt(results.vertexX, calcInputs.decimals)}, ${fmt(results.vertexY, calcInputs.decimals)})`}
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">y-intercept</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{fmt(results.yIntercept, calcInputs.decimals)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Sum of roots (−b / a)</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{fmt(results.rootSum, calcInputs.decimals)}</td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Product of roots (c / a)</td>
                    <td className="p-2.5 pr-3 text-right text-emerald-600">{fmt(results.rootProduct, calcInputs.decimals)}</td>
                  </tr>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Coefficient a</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.a, 4)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Coefficient b</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.b, 4)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Coefficient c</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.c, 4)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Root Type</span>
                  <span className="text-base font-bold text-foreground">
                    {results.complex ? "Complex" : results.doubleRoot ? "Repeated" : "Real"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Vertex Y</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.vertexY, calcInputs.decimals)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Real Intercepts</span>
                  <span className="text-base font-bold text-foreground">
                    {results.complex ? "None" : results.doubleRoot ? "1" : "2"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Quadratic Formula Calculator?</h2>
            <p>
              A quadratic formula calculator solves any equation written as ax² + bx + c = 0 and reports the roots together
              with the discriminant that determines their type. Enter the three coefficients and the tool returns real roots,
              a repeated root, or a complex conjugate pair, plus the vertex and intercepts of the matching parabola so the
              algebra and the graph agree.
            </p>
            <p>
              Quadratics appear wherever something changes at a constant rate of change: projectile trajectories, profit and
              revenue curves, braking distances and the area problems that fill school textbooks. Being able to read the
              roots, the vertex and the sign of the leading coefficient from one calculation covers almost every question a
              graph of the curve could answer.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The calculator evaluates b² − 4ac, the discriminant, before anything else, because its sign decides the shape of
              the answer. A positive value gives two real roots, zero gives a single repeated root and a negative value turns
              the square root into an imaginary number, producing a conjugate pair that no real graph can cross.
            </p>
            <p>
              With the discriminant known, each root comes from substituting the coefficients into x = (−b ± √(b² − 4ac)) ÷ 2a.
              Dividing by twice the leading coefficient is where most slips happen, so the results table shows the equation in
              standard form alongside the roots as a check. The vertex sits at x = −b ÷ 2a and its y value comes from
              substituting that x back into the original expression.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows both roots, or the single repeated value when the discriminant is zero, and the
              three-stat bar reports the discriminant, the sum of the roots and their product. The first table lists the
              working, including the factored form where one exists, and the second describes the parabola: which way it
              opens, where the axis of symmetry lies, the vertex coordinates and the y-intercept.
            </p>
            <p>
              The sum and product of the roots are a fast way to verify an answer without redoing the formula. Because the
              roots always add to −b ÷ a and multiply to c ÷ a, a quick mental check catches sign errors and arithmetic slips
              immediately. In the default example the roots add to three and multiply to minus ten, which matches the
              coefficients exactly.
            </p>
            <p>
              A negative discriminant does not mean the equation is unsolvable; it means the solutions are complex numbers of
              the form p ± qi. Those answers are still exact and appear in electrical impedance, signal processing and control
              theory, but the parabola they describe never touches the horizontal axis, so any real-world interpretation has
              to be handled carefully.
            </p>
            <p>
              Finally, expect awkward-looking decimals whenever the discriminant is not a perfect square. The roots are then
              irrational, and any printed value is a rounded approximation of an exact surd. For homework, keep the square
              root in the answer and simplify it, and use the decimal form only when a numeric estimate is genuinely what the
              question needs.
            </p>
            <p>
              When a word problem turns into a quadratic, the two roots rarely both make sense, so interpret them before
              answering. A negative length or a time before the event started has to be discarded even though the algebra is
              correct, and that step is where most marks are lost. Keep the calculator handy for the arithmetic and spend the
              saved effort on deciding which solution the situation actually allows.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/quadratic-formula-calculator" />
          <PopularCalculators exclude="/calculator/quadratic-formula-calculator" />
        </div>
      </div>
    </>
  );
}
