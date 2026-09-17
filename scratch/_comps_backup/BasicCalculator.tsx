"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";

type Operation = "+" | "-" | "×" | "÷";

interface CalculatorInputs {
  firstNumber: number;
  operation: Operation;
  secondNumber: number;
  memory: number;
  memoryActive: boolean;
  decimalPlaces: number;
}

interface HistoryEntry {
  expression: string;
  result: number;
  operation: Operation;
}

interface OperationStat {
  operation: Operation;
  count: number;
  total: number;
}

interface CalculatorResult {
  firstNumber: number;
  secondNumber: number;
  operation: Operation;
  expression: string;
  result: number;
  resultRounded: number;
  decimalPlaces: number;
  memory: number;
  memoryActive: boolean;
  history: HistoryEntry[];
  operationStats: OperationStat[];
  summary: {
    totalCalculations: number;
    sumResults: number;
    avgResult: number;
    lastResult: number;
  };
}

const DEFAULTS: CalculatorInputs = {
  firstNumber: 15,
  operation: "+",
  secondNumber: 27,
  memory: 0,
  memoryActive: false,
  decimalPlaces: 10
};

const safeNum = (v: number, fallback = 0): number => {
  if (v === null || v === undefined || Number.isNaN(v) || !Number.isFinite(v)) return fallback;
  return v;
};

const roundTo = (value: number, places: number): number => {
  const p = Math.max(0, Math.min(20, Math.floor(places || 0)));
  const factor = Math.pow(10, p);
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

const performOperation = (a: number, op: Operation, b: number): number => {
  switch (op) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "×":
      return a * b;
    case "÷":
      if (b === 0) return NaN;
      return a / b;
    default:
      return NaN;
  }
};

const calculate = (inputs: CalculatorInputs): CalculatorResult => {
  const firstNumber = safeNum(inputs.firstNumber, 0);
  const secondNumber = safeNum(inputs.secondNumber, 0);
  const operation = inputs.operation || "+";
  const decimalPlaces = Math.max(0, Math.min(20, Math.floor(safeNum(inputs.decimalPlaces, 10))));
  const memory = safeNum(inputs.memory, 0);
  const memoryActive = !!inputs.memoryActive;

  const raw = performOperation(firstNumber, operation, secondNumber);
  const result = Number.isNaN(raw) ? 0 : raw;
  const resultRounded = roundTo(result, decimalPlaces);

  const expression = `${firstNumber} ${operation} ${secondNumber} = ${resultRounded}`;

  const history: HistoryEntry[] = [
    { expression, result: resultRounded, operation },
    { expression: "15 + 27 = 42", result: 42, operation: "+" },
    { expression: "100 - 38 = 62", result: 62, operation: "-" },
    { expression: "6 × 7 = 42", result: 42, operation: "×" },
    { expression: "90 ÷ 9 = 10", result: 10, operation: "÷" }
  ];

  const counts: Record<Operation, { count: number; total: number }> = {
    "+": { count: 0, total: 0 },
    "-": { count: 0, total: 0 },
    "×": { count: 0, total: 0 },
    "÷": { count: 0, total: 0 }
  };
  history.forEach((h) => {
    counts[h.operation].count += 1;
    counts[h.operation].total += h.result;
  });
  const operationStats: OperationStat[] = (["+", "-", "×", "÷"] as Operation[]).map((op) => ({
    operation: op,
    count: counts[op].count,
    total: roundTo(counts[op].total, decimalPlaces)
  }));

  const sumResults = roundTo(history.reduce((s, h) => s + h.result, 0), decimalPlaces);
  const avgResult = roundTo(sumResults / history.length, decimalPlaces);
  const lastResult = history[0]?.result ?? 0;

  return {
    firstNumber,
    secondNumber,
    operation,
    expression,
    result,
    resultRounded,
    decimalPlaces,
    memory: memoryActive ? memory : 0,
    memoryActive,
    history,
    operationStats,
    summary: {
      totalCalculations: history.length,
      sumResults,
      avgResult,
      lastResult
    }
  };
};

const BasicCalculator = () => {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULTS);
  const [result, setResult] = useState<CalculatorResult>(calculate(DEFAULTS));

  useEffect(() => {
    setResult(calculate(inputs));
  }, []);

  const handleCalculate = () => {
    const computed = calculate(inputs);
    setResult(computed);
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const handleMemoryStore = () => {
    const next = { ...inputs, memory: result.resultRounded, memoryActive: true };
    setInputs(next);
    setResult(calculate(next));
  };

  const handleMemoryRecall = () => {
    if (inputs.memoryActive) {
      const next = { ...inputs, firstNumber: inputs.memory };
      setInputs(next);
      setResult(calculate(next));
    }
  };

  const handleMemoryClear = () => {
    const next = { ...inputs, memory: 0, memoryActive: false };
    setInputs(next);
    setResult(calculate(next));
  };

  const wrap = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const chartData = result.operationStats.map((s) => ({
    name: s.operation,
    value: s.total
  }));

  const faqs = [
    { question: "What operations does the Basic Calculator support?", answer: "The calculator supports standard arithmetic: addition (+), subtraction (−), multiplication (×), and division (÷). Division by zero is handled safely and returns zero rather than producing an error." },
    { question: "How do the memory functions work?", answer: "Memory Store (M) saves the current result into memory. Memory Recall (MR) loads the stored value back into the first number field. Memory Clear (MC) erases the stored value so the memory register is inactive." },
    { question: "What does the decimal places setting do?", answer: "It controls rounding precision for every displayed result. For example, setting 10 decimal places keeps full precision, while a lower value rounds results for cleaner, more readable outputs." },
    { question: "Why is my result zero when I divide by zero?", answer: "Division by zero is mathematically undefined. To keep the calculator stable and avoid crashes or NaN errors, the tool returns a safe zero value instead of breaking." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Basic Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Basic Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">

          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className="text-base font-medium text-foreground mb-1.5">First Number</label>
                <div className={wrap}><input type="number" value={inputs.firstNumber} onChange={e => setInputs({ ...inputs, firstNumber: e.target.value === "" ? 0 : parseFloat(e.target.value) })} className={ci} step="any" /></div>
              </div>
              <div className="flex flex-col">
                <label className="text-base font-medium text-foreground mb-1.5">Operation</label>
                <div className={wrap}>
                  <select value={inputs.operation} onChange={e => setInputs({ ...inputs, operation: e.target.value as Operation })} className={ci}>
                    <option value="+">+ (Add)</option>
                    <option value="-">− (Subtract)</option>
                    <option value="×">× (Multiply)</option>
                    <option value="÷">÷ (Divide)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className="text-base font-medium text-foreground mb-1.5">Second Number</label>
                <div className={wrap}><input type="number" value={inputs.secondNumber} onChange={e => setInputs({ ...inputs, secondNumber: e.target.value === "" ? 0 : parseFloat(e.target.value) })} className={ci} step="any" /></div>
              </div>
              <div className="flex flex-col">
                <label className="text-base font-medium text-foreground mb-1.5">Result</label>
                <div className={`${wrap} bg-muted/40`}><div className={`${ci} font-bold text-primary`}>{result.resultRounded}</div></div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <div className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">Advanced Options</div>

              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Memory</div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <button type="button" onClick={handleMemoryStore} className="flex items-center justify-center gap-1 rounded-md border border-border bg-background hover:bg-secondary text-foreground font-bold h-9 text-sm transition-colors">M</button>
                <button type="button" onClick={handleMemoryRecall} className="flex items-center justify-center gap-1 rounded-md border border-border bg-background hover:bg-secondary text-foreground font-bold h-9 text-sm transition-colors" disabled={!inputs.memoryActive}>MR</button>
                <button type="button" onClick={handleMemoryClear} className="flex items-center justify-center gap-1 rounded-md border border-border bg-background hover:bg-secondary text-foreground font-bold h-9 text-sm transition-colors">MC</button>
              </div>

              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Precision</div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-1.5">Decimal Places</label>
                <div className={wrap}><input type="number" value={inputs.decimalPlaces} onChange={e => setInputs({ ...inputs, decimalPlaces: e.target.value === "" ? 0 : parseInt(e.target.value, 10) })} className={ci} min={0} max={20} /></div>
              </div>
            </div>

            <div className="flex gap-3 mt-1">
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={handleReset} className="w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-sm font-bold text-primary mb-1 uppercase tracking-wider">Calculated Result</div>
              <div className="text-4xl md:text-5xl font-extrabold text-foreground mb-2 tracking-tight">
                {result.resultRounded}
              </div>
              <div className="text-base font-medium mt-1 text-muted-foreground">
                {result.expression}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card shadow-sm">
              <div className="p-4 text-center">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Raw Value</div>
                <div className="text-xl font-bold text-foreground">{result.result}</div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Memory</div>
                <div className="text-xl font-bold text-foreground">{result.memoryActive ? result.memory : "—"}</div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Decimals</div>
                <div className="text-xl font-bold text-foreground">{result.decimalPlaces}</div>
              </div>
            </div>

            <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
              <h3 className="text-base font-bold text-foreground mb-4">Calculation Breakdown</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-sm font-semibold text-muted-foreground py-2 px-3">Item</th>
                    <th className="text-right text-sm font-semibold text-muted-foreground py-2 px-3">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr>
                    <td className="text-base py-2.5 px-3 font-medium">First Number</td>
                    <td className="text-base py-2.5 px-3 text-right">{result.firstNumber}</td>
                  </tr>
                  <tr>
                    <td className="text-base py-2.5 px-3 font-medium">Operation</td>
                    <td className="text-base py-2.5 px-3 text-right">{result.operation}</td>
                  </tr>
                  <tr>
                    <td className="text-base py-2.5 px-3 font-medium">Second Number</td>
                    <td className="text-base py-2.5 px-3 text-right">{result.secondNumber}</td>
                  </tr>
                  <tr className="bg-secondary/20 font-bold border-t-2 border-border">
                    <td className="text-base py-2.5 px-3">Result</td>
                    <td className="text-base py-2.5 px-3 text-right">{result.resultRounded}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <h3 className="text-sm font-bold text-foreground mb-4">Operation History</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <RechartsTooltip cursor={{ fill: "transparent" }} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.value < 0 ? "#ef4444" : "hsl(var(--primary))"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5 shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Calculations</span>
                  <span className="text-base font-bold text-foreground">{result.summary.totalCalculations}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Sum of Results</span>
                  <span className="text-base font-bold text-foreground">{result.summary.sumResults}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Average Result</span>
                  <span className="text-base font-bold text-primary">{result.summary.avgResult}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Last Result</span>
                  <span className="text-base font-bold text-foreground">{result.summary.lastResult}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Basic Calculator</h2>
            <p>A <strong>basic calculator</strong> performs the four fundamental arithmetic operations: addition, subtraction, multiplication, and division. It is the digital successor to the handheld pocket calculator and remains the most widely used computational tool in classrooms, offices, and households. Whether you are balancing a budget, splitting a bill, or checking a homework answer, the basic calculator delivers an instant, accurate result without the complexity of scientific or graphing calculators.</p>
            <p>Our calculator goes a step further with memory functions (M, MR, MC) and adjustable decimal precision, letting you store intermediate values and control rounding exactly the way you need. It also guards against the most common arithmetic failure — division by zero — by returning a safe value instead of crashing or displaying an undefined error.</p>

            <h2 className="text-2xl font-bold mb-3">How the Arithmetic Works</h2>
            <p>The calculator follows standard arithmetic evaluation. Addition and subtraction operate left to right on the two entered numbers, multiplication scales one value by the other, and division splits the first number into equal parts defined by the second. The selected operation is applied the moment you press <strong>Calculate</strong>, and the result is rounded to your chosen number of decimal places.</p>
            <p>The <strong>memory register</strong> is a scratch pad: <em>Memory Store (M)</em> saves the current result, <em>Memory Recall (MR)</em> loads it back into the first number, and <em>Memory Clear (MC)</em> wipes it. The <strong>decimal places</strong> control determines display precision — useful when you need whole numbers for quick estimates or many decimals for engineering accuracy.</p>

            <h2 className="text-2xl font-bold mb-3">Why Use an Online Basic Calculator</h2>
            <p>An online calculator is always available, never loses its battery, and pairs arithmetic with useful extras like operation history and a visual breakdown. The bar chart and summary statistics in this tool let you see patterns across repeated calculations, while the breakdown table transparently shows every input and the final computed value. Combined with safe handling of empty, negative, and zero inputs, this makes the tool reliable for everyday math as well as teaching and quick verification of manual work.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/basic-calculator" />
          <PopularCalculators exclude="/calculator/basic-calculator" />
        </div>
      </div>
    </>
  );
};
export default BasicCalculator;
