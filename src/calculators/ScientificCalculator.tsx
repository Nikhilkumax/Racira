"use client";
import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, Delete } from "lucide-react";

const ScientificCalculator = () => {
  const [display, setDisplay] = useState("0");
  const [equation, setEquation] = useState("");
  const [isRad, setIsRad] = useState(true); // Radians vs Degrees
  const [isInv, setIsInv] = useState(false); // Inverse functions (arcsin, arccos, etc)
  const [history, setHistory] = useState<{ eq: string; res: string }[]>([]);
  
  // Safe eval using Function constructor, but extremely limited
  const evaluateMath = (expr: string) => {
    try {
      // Replace symbols with JS Math equivalents safely
      let parsed = expr
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/−/g, "-")
        .replace(/\^/g, "**")
        .replace(/π/g, "Math.PI")
        .replace(/e/g, "Math.E");

      // Replace functions: sin, cos, tan, log, ln, sqrt
      // We need regex to find numbers/expressions inside parens if possible, 
      // but a standard scientific calculator usually builds the string.
      // For a simple robust implementation, we will use math.js or a simple parser if available.
      // Since we don't have math.js, we'll write a simple regex replacer.
      
      const mathFuncs = ["sin", "cos", "tan", "asin", "acos", "atan", "log10", "log", "sqrt"];
      mathFuncs.forEach(fn => {
        const regex = new RegExp(`${fn}\\(`, "g");
        parsed = parsed.replace(regex, `Math.${fn}(`);
      });

      // Special handling for factorial!
      // This simple regex handles only basic integers before the !
      parsed = parsed.replace(/(\d+)!/g, "factorial($1)");

      // If degree mode is on, we need to convert args to radians for trig functions
      if (!isRad) {
        parsed = parsed.replace(/Math\.(sin|cos|tan)\(([^)]+)\)/g, "Math.$1(($2) * Math.PI / 180)");
        parsed = parsed.replace(/Math\.(asin|acos|atan)\(([^)]+)\)/g, "(Math.$1($2) * 180 / Math.PI)");
      }

      // eslint-disable-next-line no-new-func
      const result = new Function("factorial", `return ${parsed}`)(
        (n: number): number => (n <= 1 ? 1 : n * new Function("factorial", "return factorial")(n - 1)(n - 1)) // hacky but safe internal factorial
      );

      if (Number.isNaN(result) || !isFinite(result)) return "Error";
      
      // Fix tiny precision issues
      const cleanResult = parseFloat(result.toPrecision(12));
      return cleanResult.toString();

    } catch (e) {
      return "Error";
    }
  };

  const handleInput = (val: string) => {
    if (display === "0" || display === "Error") {
      if (val === "." || ["+", "−", "×", "÷", "^"].includes(val)) {
        setDisplay("0" + val);
      } else {
        setDisplay(val);
      }
    } else {
      setDisplay(display + val);
    }
  };

  const handleFunction = (fnName: string) => {
    if (display === "0" || display === "Error") {
      setDisplay(`${fnName}(`);
    } else {
      // If the last char is a number, we multiply it
      const lastChar = display.slice(-1);
      if (/\d|\)/.test(lastChar)) {
        setDisplay(`${display}×${fnName}(`);
      } else {
        setDisplay(`${display}${fnName}(`);
      }
    }
  };

  const handleEqual = () => {
    if (!display || display === "Error") return;
    
    // Balance parentheses
    let openParens = (display.match(/\(/g) || []).length;
    let closeParens = (display.match(/\)/g) || []).length;
    let evalStr = display;
    while (openParens > closeParens) {
      evalStr += ")";
      closeParens++;
    }

    setEquation(evalStr + " =");
    const result = evaluateMath(evalStr);
    setDisplay(result);

    if (result !== "Error") {
      setHistory(prev => [{ eq: evalStr + " =", res: result }, ...prev].slice(0, 5));
    }
  };

  const handleClear = () => {
    setDisplay("0");
    setEquation("");
  };

  const handleBackspace = () => {
    if (display === "Error") {
      setDisplay("0");
      return;
    }
    // Delete functions as whole words if possible, but simple character slice is standard
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay("0");
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      if (/[0-9]/.test(key)) handleInput(key);
      if (key === ".") handleInput(key);
      if (key === "(" || key === ")") handleInput(key);
      if (key === "^") handleInput("^");
      if (key === "+") handleInput("+");
      if (key === "-") handleInput("−");
      if (key === "*") handleInput("×");
      if (key === "/") handleInput("÷");
      
      if (key === "Enter" || key === "=") {
        e.preventDefault();
        handleEqual();
      }
      if (key === "Backspace") handleBackspace();
      if (key === "Escape") handleClear();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [display, isRad]);

  const btnBase = "h-10 sm:h-12 flex items-center justify-center text-sm sm:text-base font-medium rounded-lg transition-all active:scale-[0.96] shadow-sm select-none border";
  const numBtn = `${btnBase} bg-card border-border hover:bg-secondary text-foreground`;
  const opBtn = `${btnBase} bg-primary/10 border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground font-bold`;
  const funcBtn = `${btnBase} bg-secondary/50 border-border text-foreground hover:bg-secondary/80`;
  const ctrlBtn = `${btnBase} bg-destructive/10 border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground`;

  const faqs = [
    { question: "How do I switch between Radians and Degrees?", answer: "Use the RAD / DEG toggle button located in the top left of the calculator keypad. When calculating trigonometric functions like sine (sin) or cosine (cos), ensuring you are in the correct mode is critical. For example, sin(90) in degrees is 1, but in radians, it is approximately 0.894." },
    { question: "How does the INV button work?", answer: "The INV (Inverse) button toggles secondary functions. When pressed, standard trigonometric functions change to their inverse counterparts: sin becomes arcsin (sin⁻¹), cos becomes arccos (cos⁻¹), and tan becomes arctan (tan⁻¹). Press INV again to switch back." },
    { question: "How does the calculator handle the order of operations?", answer: "Unlike a basic desk calculator, this scientific calculator strictly follows standard mathematical order of operations (PEMDAS/BODMAS). It evaluates parentheses first, then exponents/roots, followed by multiplication/division, and finally addition/subtraction." },
    { question: "Can I use parenthesis?", answer: "Yes, you can use nested parentheses to group parts of your equation. If you press equals without closing all opened parentheses, the calculator will automatically close them for you at the end of the equation to prevent syntax errors." },
    { question: "How does the factorial (!) function work?", answer: "The factorial of a non-negative integer n is the product of all positive integers less than or equal to n. For example, 5! = 5 × 4 × 3 × 2 × 1 = 120. Simply type a number followed by the ! button." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Scientific Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Scientific Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start max-w-[1000px] mx-auto">
          
          <div className="card-calculator flex flex-col gap-4 !p-4 sm:!p-5 shadow-sm border border-border bg-muted/20">
            
            {/* Display Area */}
            <div className="bg-card border border-border rounded-xl p-4 flex flex-col items-end justify-end shadow-inner h-24 sm:h-28 mb-1 relative overflow-hidden">
              <div className="absolute top-3 left-3 flex gap-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${isRad ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>RAD</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${!isRad ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>DEG</span>
              </div>
              <div className="text-muted-foreground text-sm font-medium h-6 mb-1 truncate w-full text-right font-mono mt-4">
                {equation}
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-foreground truncate w-full text-right tracking-tight font-mono">
                {display}
              </div>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {/* Row 1 - Scientific controls */}
              <button onClick={() => setIsRad(!isRad)} className={funcBtn}>{isRad ? "RAD" : "DEG"}</button>
              <button onClick={() => setIsInv(!isInv)} className={`${funcBtn} ${isInv ? 'bg-primary/20 text-primary border-primary/30' : ''}`}>INV</button>
              <button onClick={() => handleFunction(isInv ? "asin" : "sin")} className={funcBtn}>{isInv ? "sin⁻¹" : "sin"}</button>
              <button onClick={() => handleFunction(isInv ? "acos" : "cos")} className={funcBtn}>{isInv ? "cos⁻¹" : "cos"}</button>
              <button onClick={() => handleFunction(isInv ? "atan" : "tan")} className={funcBtn}>{isInv ? "tan⁻¹" : "tan"}</button>

              {/* Row 2 */}
              <button onClick={() => handleInput("π")} className={funcBtn}>π</button>
              <button onClick={() => handleInput("e")} className={funcBtn}>e</button>
              <button onClick={() => handleFunction("log")} className={funcBtn}>ln</button>
              <button onClick={() => handleFunction("log10")} className={funcBtn}>log</button>
              <button onClick={() => handleInput("!")} className={funcBtn}>x!</button>

              {/* Row 3 */}
              <button onClick={() => handleInput("(")} className={funcBtn}>(</button>
              <button onClick={() => handleInput(")")} className={funcBtn}>)</button>
              <button onClick={() => handleFunction("sqrt")} className={funcBtn}>√</button>
              <button onClick={() => handleInput("^")} className={funcBtn}>x^y</button>
              <button onClick={handleClear} className={ctrlBtn}>AC</button>

              {/* Standard Num Pad Section - Grid within grid effectively */}
              <button onClick={() => handleInput("7")} className={numBtn}>7</button>
              <button onClick={() => handleInput("8")} className={numBtn}>8</button>
              <button onClick={() => handleInput("9")} className={numBtn}>9</button>
              <button onClick={handleBackspace} className={`${funcBtn} flex items-center justify-center`}><Delete className="h-4 w-4" /></button>
              <button onClick={() => handleInput("÷")} className={opBtn}>÷</button>

              <button onClick={() => handleInput("4")} className={numBtn}>4</button>
              <button onClick={() => handleInput("5")} className={numBtn}>5</button>
              <button onClick={() => handleInput("6")} className={numBtn}>6</button>
              <button onClick={() => handleInput("×")} className={opBtn}>×</button>
              <button onClick={() => handleInput("−")} className={opBtn}>−</button>

              <button onClick={() => handleInput("1")} className={numBtn}>1</button>
              <button onClick={() => handleInput("2")} className={numBtn}>2</button>
              <button onClick={() => handleInput("3")} className={numBtn}>3</button>
              <button onClick={() => handleInput("+")} className={`${opBtn} row-span-2 h-full`}>+</button>
              <button onClick={handleEqual} className={`${opBtn} row-span-2 h-full !bg-primary !text-primary-foreground shadow-md`}>=</button>

              <button onClick={() => handleInput("0")} className={`${numBtn} col-span-2`}>0</button>
              <button onClick={() => handleInput(".")} className={numBtn}>.</button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="card-calculator !p-5 border border-border bg-card shadow-sm h-full min-h-[300px]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-foreground">History</h3>
                {history.length > 0 && (
                  <button onClick={() => setHistory([])} className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                    <RotateCcw className="h-3 w-3" /> Clear
                  </button>
                )}
              </div>
              
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm italic opacity-60 text-center">
                  <Calculator className="h-8 w-8 mb-2 opacity-50" />
                  No calculation history yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item, idx) => (
                    <div key={idx} className="flex flex-col p-3 rounded-md bg-secondary/30 border border-border/50">
                      <span className="text-muted-foreground font-mono text-xs mb-1 break-all">{item.eq}</span>
                      <span className="font-bold text-foreground font-mono text-base break-all text-right">{item.res}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="max-w-[1000px] mx-auto mt-12">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance max-w-none">
            <h2>The Online Scientific Calculator</h2>
            <p>A <strong>scientific calculator</strong> goes far beyond the capabilities of a basic arithmetic tool. It is engineered to solve complex mathematical, engineering, and scientific problems. Unlike basic calculators that process equations linearly as you type them, a scientific calculator strictly adheres to the mathematical order of operations (PEMDAS/BODMAS), allowing you to input complex, multi-layered equations exactly as they appear in a textbook.</p>

            <h2>Key Scientific Functions Explained</h2>
            <p>This calculator includes a comprehensive suite of advanced mathematical functions:</p>
            <ul>
              <li><strong>Trigonometry (sin, cos, tan):</strong> Crucial for geometry and physics. The calculator supports both Degrees and Radians. Use the RAD/DEG toggle to match your specific problem's requirements.</li>
              <li><strong>Inverse Trigonometry (sin⁻¹, cos⁻¹, tan⁻¹):</strong> Used to find the angle when the sides of a right triangle are known. Access these by tapping the <strong>INV</strong> button first.</li>
              <li><strong>Logarithms (log, ln):</strong> <code>log</code> calculates the base-10 logarithm, widely used in acoustics (decibels) and chemistry (pH). <code>ln</code> calculates the natural logarithm (base e), essential for compound interest and exponential decay models.</li>
              <li><strong>Constants (π, e):</strong> Instant access to Pi (3.14159...) and Euler's number (2.71828...), ensuring maximum precision in geometric and calculus calculations without manual typing.</li>
              <li><strong>Exponents and Roots (x^y, √):</strong> Easily calculate squares, cubes, specific powers, and square roots.</li>
              <li><strong>Factorials (!):</strong> Instantly calculate the product of an integer and all the integers below it, frequently used in probability and combinatorics.</li>
            </ul>

            <h2>Why Order of Operations Matters</h2>
            <p>One of the primary reasons to use a scientific calculator over a basic one is its ability to parse an entire expression before solving. If you input <code>5 + 2 × 3</code>, this scientific calculator will correctly identify the multiplication and solve it first, yielding <code>11</code>. A basic sequential calculator would read it as <code>(5 + 2) × 3</code> and yield <code>21</code>.</p>
            <p>Furthermore, the inclusion of parentheses <code>()</code> allows you to manually override the standard order of operations when necessary, creating complex nested equations like <code>3 × (4 + (2^3))</code>.</p>

            <h2>Tips for Efficient Use</h2>
            <p>For students and professionals working rapidly, this tool supports full physical keyboard integration. You can type numbers directly and use standard keyboard symbols (like <code>^</code> for exponents). The calculator will dynamically build your equation string on the screen, allowing you to review the entire formula for syntax errors before hitting equals.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/scientific-calculator" />
          <PopularCalculators exclude="/calculator/scientific-calculator" />
        </div>
      </div>
    </>
  );
};
export default ScientificCalculator;
