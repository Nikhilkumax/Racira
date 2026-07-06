"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const AbsoluteValueCalculator = () => {
  const DEFAULTS = { number: "-47.5" };
  const [number, setNumber] = useState(DEFAULTS.number);
  const [result, setResult] = useState<{abs: number; original: number; isNeg: boolean} | null>(null);

  const calculate = (n = number) => {
    const v = parseFloat(n);
    if (isNaN(v)) return;
    setResult({ abs: Math.abs(v), original: v, isNeg: v < 0 });
  };

  useEffect(() => { calculate(); }, []);

  const reset = () => { setNumber(DEFAULTS.number); calculate(DEFAULTS.number); };

  const chartData = result ? [
    { name: "Original", value: result.original },
    { name: "Absolute Value", value: result.abs },
  ] : [];

  const faqs = [
    { question: "What is the absolute value of a number?", answer: "The absolute value of a number is its distance from zero on the number line, always non-negative. |5| = 5 and |-5| = 5." },
    { question: "Can the absolute value be negative?", answer: "No. Absolute value is always zero or positive, by definition." },
    { question: "What is |-47.5|?", answer: "|-47.5| = 47.5. The absolute value strips the negative sign." },
    { question: "How is absolute value used in real life?", answer: "Absolute value is used in error calculations, distance computations, signal processing, and financial risk analysis." },
    { question: "What is the absolute value of 0?", answer: "|0| = 0. Zero is its own absolute value." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Absolute Value Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Absolute Value Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px]">
          {/* LEFT */}
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Number</label>
              <input type="number" value={number} onChange={e => setNumber(e.target.value)}
                className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="-47.5" step="any" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => calculate()} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">Calculate</button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-4">
            {result && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                  <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Absolute Value</div>
                  <div className="text-4xl font-bold text-primary">|{result.original}| = {result.abs}</div>
                  <div className="text-sm text-muted-foreground mt-1">{result.isNeg ? "Negative number → positive result" : "Already non-negative"}</div>
                </div>
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-semibold mb-3">Breakdown</h3>
                  <table className="w-full text-base">
                    <tbody>
                      <tr className="border-b"><td className="py-2 text-muted-foreground">Original Number</td><td className="text-right font-medium">{result.original}</td></tr>
                      <tr className="border-b"><td className="py-2 text-muted-foreground">Absolute Value</td><td className="text-right font-medium">{result.abs}</td></tr>
                      <tr className="border-b"><td className="py-2 text-muted-foreground">Sign</td><td className="text-right font-medium">{result.original < 0 ? "Negative" : result.original > 0 ? "Positive" : "Zero"}</td></tr>
                      <tr><td className="py-2 text-muted-foreground">Distance from zero</td><td className="text-right font-bold">{result.abs} units</td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-semibold mb-3">Visual Comparison</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <ReferenceLine y={0} stroke="#666" />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-muted/30 rounded-lg p-6">
                  <h3 className="text-base font-semibold mb-4">Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-base"><span className="text-muted-foreground">Input:</span><span className="font-medium">{result.original}</span></div>
                    <div className="flex justify-between text-base"><span className="text-muted-foreground">|Input|:</span><span className="font-medium">{result.abs}</span></div>
                    <div className="flex justify-between text-base border-t pt-3"><span className="text-muted-foreground font-semibold">Negation (-x):</span><span className="font-bold">{-result.original}</span></div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding the Absolute Value of a Number</h2>
            <p>The concept of absolute value is one of the most fundamental and universally applied principles in all of mathematics, forming the bedrock for advanced topics ranging from complex algebra to calculus, statistics, and engineering. At its most basic level, the absolute value of a number represents its physical distance from zero on a standard number line, regardless of which direction you travel. Because distance in the physical world cannot be negative, the absolute value of any real number is always non-negative. This means that whether a number is initially positive or negative, its absolute value will be a positive number or zero. For instance, if you move five steps to the right of zero, you are at positive five, and your distance from zero is five. If you move five steps to the left of zero, you are at negative five, but your physical distance from zero remains exactly five. This simple yet profound realization is why the absolute value is such a critical tool in measuring magnitude without being influenced by direction or sign. It strips away the negative sign and leaves you only with the pure numerical magnitude of the value.</p>
            
            <p>Our absolute value calculator is designed to instantly compute the absolute magnitude of any real number, whether it is a simple integer, a complex decimal, or a highly precise fractional value. When working through complex algebraic equations, evaluating statistical variance, or programming logic gates in computer science, having a reliable tool to instantly determine the non-negative magnitude of a variable saves time and prevents cascading sign errors that can ruin entire calculations. The calculator accepts any input, applies the mathematical modulus function, and outputs the absolute distance from zero, complete with a visual bar chart comparison that helps students and professionals visually grasp the transformation from a negative input to a positive output.</p>
            
            <h2 className="text-2xl font-bold mb-3">The Mathematical Definition and Notation</h2>
            <p>In mathematics, the absolute value of a number is denoted by enclosing the number or expression within two vertical bars. For a variable x, the absolute value is written as |x|. The formal mathematical definition of absolute value is a piecewise function that depends entirely on the sign of the input. If the input x is greater than or equal to zero, then the absolute value of x is simply x. If the input x is strictly less than zero, then the absolute value of x is defined as negative x. Because multiplying a negative number by another negative sign results in a positive number, this piecewise definition mathematically guarantees that the output will always be non-negative. For example, to find the absolute value of negative forty-seven point five, you apply the second part of the piecewise function. Since negative forty-seven point five is less than zero, you negate it. The negation of a negative number is a positive number, resulting in exactly forty-seven point five.</p>
            
            <p>This piecewise definition is not just a theoretical construct; it is the exact logic used by computer processors and programming languages when evaluating the absolute value function, typically called "abs()" in languages like Python, JavaScript, and C++. Understanding this underlying logic is crucial for students learning how to graph absolute value functions, which famously produce a V-shaped graph on a Cartesian coordinate plane because the negative x-values are perfectly reflected across the x-axis to become positive y-values.</p>
            
            <h2 className="text-2xl font-bold mb-3">Key Properties and Mathematical Rules</h2>
            <p>The absolute value operation obeys several strict mathematical properties that are universally true for all real numbers. The first and most obvious property is non-negativity, which dictates that the absolute value of any real number x is always greater than or equal to zero. The second property is positive definiteness, which states that the absolute value of x is exactly equal to zero if and only if x itself is exactly zero. There is no other number in existence that has an absolute value of zero. The third property is symmetry, which states that the absolute value of x is perfectly equal to the absolute value of negative x. This means that |5| and |-5| are mathematically identical in value.</p>
            
            <p>Beyond these basic rules, absolute value interacts with multiplication and division in very predictable ways. The multiplicativity property states that the absolute value of a product is equal to the product of the absolute values. In other words, the absolute value of x times y is exactly the same as the absolute value of x multiplied by the absolute value of y. This property is incredibly useful when simplifying complex algebraic expressions. Similarly, the absolute value of a quotient is equal to the quotient of the absolute values, provided the denominator is not zero. However, when it comes to addition, absolute value follows the famous triangle inequality theorem. This theorem states that the absolute value of the sum of two numbers is always less than or equal to the sum of their individual absolute values. It is never greater. This inequality is a foundational pillar of mathematical analysis and is used extensively in proving limits and convergence in calculus.</p>
            
            <h2 className="text-2xl font-bold mb-3">Real-World Applications Across Disciplines</h2>
            <p>While absolute value might seem like a purely academic concept taught in middle school algebra, it is actually deployed continuously in almost every quantitative field. In statistics and data science, absolute value is the core component of calculating the Mean Absolute Error (MAE) and Mean Absolute Deviation (MAD). When a data scientist evaluates the accuracy of a predictive machine learning model, they need to know how far off the predictions are from the actual values. If the model predicts a value that is five units too high, the error is positive five. If it predicts a value that is five units too low, the error is negative five. If you simply average these errors, the positive and negative values would perfectly cancel each other out, falsely suggesting the model has zero error. By taking the absolute value of every single error before averaging them, statisticians obtain a true measure of the model's magnitude of inaccuracy.</p>
            
            <p>In physics and engineering, absolute value is used to denote the magnitude of vector quantities. While a velocity vector might have a negative sign to indicate that an object is moving backwards or falling downwards relative to a specific coordinate system, the absolute value of that velocity vector represents the object's physical speed. Speed cannot be negative. Similarly, in electrical engineering, alternating current (AC) voltage oscillates between positive and negative peaks. When engineers need to calculate the total power dissipation in a resistor, the negative voltage values are just as effective at generating heat as the positive values. By analyzing the absolute magnitude of the signal, engineers can properly design circuits and specify components that won't overheat.</p>
            
            <h2 className="text-2xl font-bold mb-3">Solving Equations Involving Absolute Values</h2>
            <p>One of the most common reasons students search for an absolute value calculator is to verify their work when solving algebraic equations that feature absolute value expressions. Solving an equation like |x - 5| = 10 requires understanding that the expression inside the vertical bars could have originally been either positive ten or negative ten, since both numbers have an absolute value of ten. Therefore, to solve the equation, you must branch it into two separate linear equations: x - 5 = 10, and x - 5 = -10. Solving these individually reveals that x can be either 15 or -5. Both solutions are completely valid and will satisfy the original absolute value equation.</p>
            
            <p>Inequalities involving absolute values are slightly more complex but follow a similar logic. An inequality like |x| less than 5 means that the distance from x to zero is strictly less than 5 units. This translates to the compound inequality where x is greater than negative 5 and strictly less than positive 5. Conversely, if the inequality states that |x| is greater than 5, it means the distance from zero is more than 5 units in either direction, meaning x must be less than negative 5 or x must be greater than positive 5. Mastering these branched logic paths is essential for success in pre-calculus and advanced algebra courses.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/absolute-value-calculator" />
          <PopularCalculators exclude="/calculator/absolute-value-calculator" />
        </div>
      </div>
    </>
  );
};
export default AbsoluteValueCalculator;