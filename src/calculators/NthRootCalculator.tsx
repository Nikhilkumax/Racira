"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";

const CompactInput = ({
  id, label, value, onChange, prefix, suffix, type = "number", ...props
}: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  prefix?: string; suffix?: string; type?: string; [key: string]: any;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none shrink-0">{prefix}</span>}
      <input
        id={id} type={type} value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-lg bg-transparent outline-none border-none text-foreground"
        {...props}
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

interface NthRootResult {
  root: number;
  error: string | null;
  chartData: { name: string; rootVal: number; highlight: boolean }[];
  isPerfectRoot: boolean;
  verification: number;
  absError: number;
}

export default function NthRootCalculator() {
  const [radicand, setRadicand] = useState("64");
  const [degree, setDegree] = useState("3");
  const [res, setRes] = useState<NthRootResult | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); calc(); }, []);

  const calc = () => {
    const x = parseFloat(radicand);
    const n = parseFloat(degree);

    if (isNaN(x) || isNaN(n)) { setRes(null); return; }

    if (n === 0) {
      setRes({ root: 0, error: "Degree of the root cannot be zero.", chartData: [], isPerfectRoot: false, verification: 0, absError: 0 });
      return;
    }
    if (x < 0 && n % 2 === 0) {
      setRes({ root: 0, error: "Even roots of negative numbers are not real (imaginary result).", chartData: [], isPerfectRoot: false, verification: 0, absError: 0 });
      return;
    }

    const root = x >= 0 ? Math.pow(x, 1 / n) : -Math.pow(Math.abs(x), 1 / n);
    const verification = x >= 0 ? Math.pow(root, n) : -Math.pow(Math.abs(root), n);
    const absError = Math.abs(verification - x);
    const isPerfectRoot = absError < 1e-9;

    const maxDeg = Math.max(10, Math.ceil(n + 3));
    const chartData: { name: string; rootVal: number; highlight: boolean }[] = [];
    for (let d = 2; d <= maxDeg; d++) {
      if (x < 0 && d % 2 === 0) continue;
      const v = x >= 0 ? Math.pow(x, 1 / d) : -Math.pow(Math.abs(x), 1 / d);
      chartData.push({
        name: `n=${d}`,
        rootVal: parseFloat(v.toFixed(6)),
        highlight: d === n,
      });
    }

    setRes({ root, error: null, chartData, isPerfectRoot, verification, absError });
  };

  const reset = () => { setRadicand("64"); setDegree("3"); };

  const fmt = (n: number, digits = 6) => n.toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: 0 });

  const ordinal = (n: number) => {
    if (n === 2) return "Square";
    if (n === 3) return "Cube";
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
  };

  const degN = parseFloat(degree) || 1;
  const radX = parseFloat(radicand) || 0;

  const faqs = [
    { question: "What is an nth root?", answer: "The nth root of a number x is a value r such that r raised to the power n equals x (rⁿ = x). The 2nd root is the square root, the 3rd root is the cube root, and so on. For example, the 4th root of 81 is 3 because 3⁴ = 81." },
    { question: "How is the nth root calculated?", answer: "The nth root of x is computed using the exponent formula: x^(1/n). For example, the cube root of 64 is 64^(1/3) = 4. Calculators and computers use this exponential form internally for all root calculations." },
    { question: "Can I take the nth root of a negative number?", answer: "Yes, but only for odd values of n. For odd degrees (3, 5, 7...), the nth root of a negative number is negative. For example, the cube root of -8 is -2 because (-2)³ = -8. For even degrees (2, 4, 6...), the nth root of a negative number is imaginary, meaning it does not exist in the set of real numbers." },
    { question: "What is the principal nth root?", answer: "The principal nth root is the non-negative real root for positive radicands, or the negative real root for negative numbers when n is odd. For example, while both 3 and -3 are square roots of 9 (since 3² = (-3)² = 9), the principal square root is +3. This calculator returns the principal root." },
    { question: "How does the nth root relate to fractional exponents?", answer: "The nth root and fractional exponents are mathematically identical: ⁿ√x = x^(1/n). This relationship is fundamental in algebra and is why scientific calculators can compute roots using the exponent key. For example, ∛64 = 64^(1/3) ≈ 4." },
    { question: "What is a perfect nth root?", answer: "A perfect nth root occurs when the radicand x is exactly an integer raised to the nth power. For example, 64 is a perfect cube root (4³ = 64), 81 is a perfect fourth root (3⁴ = 81), and 32 is a perfect fifth root (2⁵ = 32). This calculator checks whether the result is a perfect root automatically." },
    { question: "How does root degree affect the result?", answer: "As the root degree increases for a fixed positive radicand greater than 1, the root value decreases and approaches 1. For example, the 2nd root of 100 is 10, the 3rd root is ~4.64, the 4th root is ~3.16, and the 10th root is ~1.58. The chart in this calculator visualizes exactly this relationship for your input." },
    { question: "What are practical uses of nth roots?", answer: "Nth roots appear in many real-world applications: compound interest (finding equivalent annual rate), geometry (computing side lengths of n-dimensional hypercubes), physics (wave equations and dimensional analysis), engineering (signal processing and frequency scaling), and statistics (geometric mean calculation). The geometric mean of n values is computed using the nth root." },
  ];

  return (
    <>
      <Breadcrumb items={[
        { label: "Home", href: "/" },
        { label: "Calculators", href: "/calculator" },
        { label: "Math", href: "/calculator#math" },
        { label: "Nth Root Calculator" },
      ]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Nth Root Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-lg font-bold text-foreground pb-2 border-b border-border">Radical Parameters</h2>

            <CompactInput
              id="radicand"
              label="Radicand (x) — number inside root"
              value={radicand}
              onChange={setRadicand}
              step="any"
            />
            <CompactInput
              id="degree"
              label="Root Degree (n)"
              value={degree}
              onChange={setDegree}
              min="1"
              step="1"
            />

            <div className="flex gap-2.5 mt-2">
              <button
                type="button"
                onClick={calc}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm"
              >
                <Calculator className="h-4 w-4" /> Calculate Root
              </button>
              <button
                type="button"
                onClick={reset}
                className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center"
                aria-label="Reset to default values"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {res && (
              <>
                {res.error ? (
                  <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-red-500/20 bg-red-500/5">
                    <p className="text-sm font-bold text-red-600">{res.error}</p>
                  </div>
                ) : (
                  <>
                    <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                      <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">
                        {ordinal(degN)} Root of {radX}
                        {res.isPerfectRoot && (
                          <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-green-500/15 text-green-700 dark:text-green-400">
                            Perfect Root
                          </span>
                        )}
                      </p>
                      <p className="text-5xl font-black text-foreground">{fmt(res.root)}</p>
                      <p className="text-sm text-muted-foreground">Verification: {fmt(res.root)}^{degN} = {fmt(res.verification)}</p>
                    </div>
                    {mounted && res.chartData.length > 1 && (
                      <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                        <h2 className="text-sm font-bold text-foreground mb-2">Root Value vs. Degree (x = {radX})</h2>
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={res.chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="rootVal" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                            <ReferenceLine x={`n=${degN}`} stroke="hsl(var(--primary))" strokeDasharray="4 4" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is an Nth Root Calculator?</h2>
            <p>
              An nth root calculator finds the value r such that r raised to the power n equals a given number x. Written mathematically: ⁿ√x = r, which means rⁿ = x. The most familiar examples are the square root (n = 2) and the cube root (n = 3), but the operation generalizes to any positive integer — or even fractional and decimal — root degree.
            </p>
            <p>
              This calculator computes the <strong>principal nth root</strong> for any real number radicand and any positive root degree. It handles negative radicands with odd root degrees (producing a negative real result), detects perfect roots with full floating-point precision, and visualizes how root values change as the degree n increases.
            </p>

            <h2>The Nth Root Formula</h2>
            <p>
              The nth root of x is defined by the exponential relationship:
            </p>
            <p><strong>ⁿ√x = x^(1/n)</strong></p>
            <p>Where:</p>
            <ul>
              <li><strong>x</strong> is the radicand (the number you are taking the root of)</li>
              <li><strong>n</strong> is the root degree (2 for square root, 3 for cube root, etc.)</li>
              <li><strong>r = x^(1/n)</strong> is the principal nth root</li>
            </ul>
            <p>
              This formula works because (x^(1/n))^n = x^(n/n) = x^1 = x, which satisfies the definition. The fractional exponent form is fundamental in algebra and is the method used by all digital calculators and computer systems.
            </p>

            <h2>Square Root vs Cube Root vs Nth Root</h2>
            <p>
              The square root (n=2) is the most commonly used radical operation. It finds a number that, when multiplied by itself once, gives x. The cube root (n=3) finds a number that, when multiplied by itself twice, gives x. Higher roots follow the same pattern:
            </p>
            <ul>
              <li><strong>Square Root (n=2):</strong> √100 = 10, since 10² = 100</li>
              <li><strong>Cube Root (n=3):</strong> ∛27 = 3, since 3³ = 27</li>
              <li><strong>4th Root (n=4):</strong> ⁴√256 = 4, since 4⁴ = 256</li>
              <li><strong>5th Root (n=5):</strong> ⁵√32 = 2, since 2⁵ = 32</li>
              <li><strong>10th Root (n=10):</strong> ¹⁰√1024 ≈ 2, since 2¹⁰ = 1024</li>
            </ul>

            <h2>Negative Radicands and Even vs Odd Roots</h2>
            <p>
              Whether an nth root of a negative number is real depends on whether n is odd or even:
            </p>
            <ul>
              <li>
                <strong>Odd root degree (n = 1, 3, 5, 7...):</strong> The nth root of a negative number is a negative real number. Example: ∛(−8) = −2, because (−2)³ = −8. This works because multiplying a negative number an odd number of times always produces a negative result.
              </li>
              <li>
                <strong>Even root degree (n = 2, 4, 6, 8...):</strong> The nth root of a negative number is imaginary (a complex number). Example: √(−9) = 3i, where i is the imaginary unit. This is because any real number raised to an even power is always non-negative.
              </li>
            </ul>

            <h2>Perfect Roots — When the Result Is Exact</h2>
            <p>
              A <strong>perfect nth root</strong> occurs when x is exactly an integer raised to the nth power, producing an exact integer result. Examples include:
            </p>
            <ul>
              <li>Perfect square roots: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100...</li>
              <li>Perfect cube roots: 1, 8, 27, 64, 125, 216, 343, 512...</li>
              <li>Perfect 4th roots: 1, 16, 81, 256, 625, 1296...</li>
              <li>Perfect 5th roots: 1, 32, 243, 1024, 3125...</li>
            </ul>
            <p>
              When the root is not a perfect root (e.g., √2 ≈ 1.41421356...), the result is an <strong>irrational number</strong> — its decimal expansion is infinite and non-repeating.
            </p>

            <h2>Fractional and Decimal Root Degrees</h2>
            <p>
              Root degree n does not have to be an integer. Fractional roots like the 1.5th root (equivalent to raising to the power 2/3) or the 2.5th root are valid mathematical operations. For example:
            </p>
            <ul>
              <li>8^(1/1.5) = 8^(2/3) = (8^2)^(1/3) = 64^(1/3) = 4</li>
              <li>27^(1/2.5) = 27^(2/5) ≈ 3.738</li>
            </ul>

            <h2>Real-World Applications of Nth Roots</h2>
            <p>Nth roots appear across science, engineering, finance, and everyday mathematics:</p>
            <ul>
              <li>
                <strong>Finance — Compound Annual Growth Rate (CAGR):</strong> CAGR = (End Value / Start Value)^(1/Years) − 1. The "1/Years" exponent is an nth root where n is the number of years. This lets investors calculate the equivalent annual rate of return over multi-year periods.
              </li>
              <li>
                <strong>Engineering — Signal processing:</strong> RMS (root mean square) values use square roots to express the effective power of alternating current signals and audio waveforms.
              </li>
              <li>
                <strong>Statistics — Geometric Mean:</strong> The geometric mean of n values is computed as the nth root of their product. It is the correct average for rates of growth, ratios, and percentages.
              </li>
              <li>
                <strong>Physics — Dimensional Analysis:</strong> Many physics equations involve nth roots, such as the period of a pendulum (involves square root of length), stress-strain relationships, and wave equations.
              </li>
              <li>
                <strong>Computer Science — Algorithm Complexity:</strong> Time complexity expressions frequently use roots, such as O(n^(1/3)) for certain cube-root algorithms or O(√n) for primality testing.
              </li>
              <li>
                <strong>Geometry — Hypercube Side Lengths:</strong> If a hypercube has n-dimensional volume V, its side length is V^(1/n) — the nth root of V. For 3D, this is the familiar cube root for finding the edge length of a cube given its volume.
              </li>
            </ul>

            <h2>Computing Nth Roots by Hand</h2>
            <p>
              While most nth root calculations require a calculator or computer, there are methods for hand computation:
            </p>
            <ul>
              <li>
                <strong>Newton's Method (iterative):</strong> Start with an initial guess r₀, then iterate: rₙ₊₁ = ((n−1)rₙ + x/rₙⁿ⁻¹) / n. This converges rapidly to the correct answer.
              </li>
              <li>
                <strong>Logarithms:</strong> Use the identity ⁿ√x = e^(ln(x)/n). Compute the natural log of x, divide by n, then take the exponential. This converts a root into exponent arithmetic.
              </li>
              <li>
                <strong>Binary search:</strong> For perfect roots, check midpoints between known bounds until converging to the answer to desired precision.
              </li>
            </ul>

            <h2>How Root Value Changes with Degree</h2>
            <p>
              As the root degree n increases for a fixed positive radicand x &gt; 1:
            </p>
            <ul>
              <li>The root value <strong>decreases</strong> monotonically toward 1</li>
              <li>At n = 1: ¹√x = x (identity)</li>
              <li>As n → ∞: ⁿ√x → 1</li>
              <li>At n = 2: standard square root</li>
            </ul>
            <p>
              For 0 &lt; x &lt; 1, the opposite happens: higher degree roots produce larger values (still approaching 1). For x = 1, every root is exactly 1. The chart in this calculator visualizes exactly this relationship for your input value.
            </p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/nth-root-calculator" />
          <PopularCalculators exclude="/calculator/nth-root-calculator" />
        </div>
      </div>
    </>
  );
}
