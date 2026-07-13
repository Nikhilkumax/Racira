"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, Delete } from "lucide-react";

const BasicCalculator = () => {
  const [display, setDisplay] = useState("0");
  const [equation, setEquation] = useState("");
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);
  const [history, setHistory] = useState<{ eq: string; res: string }[]>([]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      if (/[0-9]/.test(key)) handleNumber(key);
      if (key === ".") handleDecimal();
      if (key === "+" || key === "-" || key === "*" || key === "/") {
        e.preventDefault();
        const opMap: Record<string, string> = { "+": "+", "-": "−", "*": "×", "/": "÷" };
        handleOperator(opMap[key]);
      }
      if (key === "Enter" || key === "=") {
        e.preventDefault();
        handleEqual();
      }
      if (key === "Backspace") handleBackspace();
      if (key === "Escape") handleClear();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [display, prevValue, operator, waitingForNewValue]);

  const handleNumber = (numStr: string) => {
    if (waitingForNewValue) {
      setDisplay(numStr);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === "0" ? numStr : display + numStr);
    }
  };

  const handleDecimal = () => {
    if (waitingForNewValue) {
      setDisplay("0.");
      setWaitingForNewValue(false);
      return;
    }
    if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const performCalculation = (op: string, a: number, b: number): number => {
    switch (op) {
      case "+": return a + b;
      case "−": return a - b;
      case "×": return a * b;
      case "÷": return b === 0 ? NaN : a / b;
      default: return b;
    }
  };

  const formatResult = (val: number) => {
    if (Number.isNaN(val)) return "Error";
    const resStr = val.toString();
    if (resStr.length > 12) return val.toPrecision(10);
    return resStr;
  };

  const handleOperator = (nextOp: string) => {
    const inputValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(inputValue);
      setEquation(`${inputValue} ${nextOp}`);
    } else if (operator) {
      if (waitingForNewValue) {
        // Change operator without calculating
        setOperator(nextOp);
        setEquation(`${prevValue} ${nextOp}`);
        return;
      }
      
      const currentValue = inputValue || 0;
      const newValue = performCalculation(operator, prevValue, currentValue);
      
      setPrevValue(newValue);
      setDisplay(formatResult(newValue));
      setEquation(`${newValue} ${nextOp}`);
    }

    setWaitingForNewValue(true);
    setOperator(nextOp);
  };

  const handleEqual = () => {
    if (!operator || prevValue === null) return;
    
    const inputValue = parseFloat(display);
    const newValue = performCalculation(operator, prevValue, inputValue);
    
    const formattedResult = formatResult(newValue);
    
    // Add to history
    const newHistoryEntry = { eq: `${prevValue} ${operator} ${inputValue} =`, res: formattedResult };
    setHistory(prev => [newHistoryEntry, ...prev].slice(0, 5));

    setDisplay(formattedResult);
    setEquation("");
    setPrevValue(null);
    setOperator(null);
    setWaitingForNewValue(true);
  };

  const handleClear = () => {
    setDisplay("0");
    setEquation("");
    setPrevValue(null);
    setOperator(null);
    setWaitingForNewValue(false);
  };

  const handleBackspace = () => {
    if (waitingForNewValue) return;
    setDisplay(display.length > 1 ? display.slice(0, -1) : "0");
  };

  const handleToggleSign = () => {
    if (waitingForNewValue) return;
    setDisplay(display.startsWith("-") ? display.slice(1) : "-" + display);
  };

  const handlePercent = () => {
    if (waitingForNewValue) return;
    const val = parseFloat(display) / 100;
    setDisplay(formatResult(val));
  };

  const btnClass = "h-14 md:h-16 flex items-center justify-center text-xl font-medium rounded-xl transition-all active:scale-[0.96] shadow-sm select-none";
  const numBtn = `${btnClass} bg-card border border-border hover:bg-secondary text-foreground`;
  const opBtn = `${btnClass} bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground font-bold`;
  const actionBtn = `${btnClass} bg-secondary border border-border text-foreground hover:bg-secondary/80`;

  const faqs = [
    { question: "What operations does this basic calculator support?", answer: "This is a standard four-function calculator that supports addition (+), subtraction (-), multiplication (×), and division (÷). It also includes a percentage (%) function and the ability to toggle positive/negative numbers." },
    { question: "Can I use my keyboard with this calculator?", answer: "Yes, full keyboard support is integrated. You can use the number pad or the number row on your keyboard. Use the + - * / keys for operations, Enter or = for equals, Backspace to delete the last digit, and Escape to clear the calculator." },
    { question: "How does the percentage button work?", answer: "The percentage button quickly divides the current number on the screen by 100. For example, if you type 50 and press %, the screen will show 0.5. This is useful for quickly calculating discounts or tax." },
    { question: "What happens if I divide by zero?", answer: "In mathematics, division by zero is undefined. If you attempt to divide any number by zero using this calculator, the screen will output 'Error' to indicate an invalid mathematical operation." },
    { question: "How large of a number can it calculate?", answer: "The calculator can handle very large numbers, but to keep the display readable, results exceeding 12 digits will be automatically formatted into scientific notation (e.g., 1.5e+15) or rounded to 10 precision digits." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Basic Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Basic Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
          {/* Calculator Interface */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-muted/20">
            
            {/* Display Area */}
            <div className="bg-card border border-border rounded-xl p-4 flex flex-col items-end justify-end shadow-inner h-28 md:h-32 mb-2 relative overflow-hidden">
              <div className="text-muted-foreground text-sm font-medium h-6 mb-1 truncate w-full text-right">
                {equation}
              </div>
              <div className="text-4xl md:text-5xl font-bold text-foreground truncate w-full text-right tracking-tight font-mono">
                {display}
              </div>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-4 gap-2 md:gap-3">
              <button onClick={handleClear} className={`${actionBtn} text-destructive hover:text-destructive hover:bg-destructive/10`}>C</button>
              <button onClick={handleToggleSign} className={actionBtn}>+/-</button>
              <button onClick={handlePercent} className={actionBtn}>%</button>
              <button onClick={() => handleOperator("÷")} className={opBtn}>÷</button>

              <button onClick={() => handleNumber("7")} className={numBtn}>7</button>
              <button onClick={() => handleNumber("8")} className={numBtn}>8</button>
              <button onClick={() => handleNumber("9")} className={numBtn}>9</button>
              <button onClick={() => handleOperator("×")} className={opBtn}>×</button>

              <button onClick={() => handleNumber("4")} className={numBtn}>4</button>
              <button onClick={() => handleNumber("5")} className={numBtn}>5</button>
              <button onClick={() => handleNumber("6")} className={numBtn}>6</button>
              <button onClick={() => handleOperator("−")} className={opBtn}>−</button>

              <button onClick={() => handleNumber("1")} className={numBtn}>1</button>
              <button onClick={() => handleNumber("2")} className={numBtn}>2</button>
              <button onClick={() => handleNumber("3")} className={numBtn}>3</button>
              <button onClick={() => handleOperator("+")} className={opBtn}>+</button>

              <button onClick={handleBackspace} className={`${numBtn} flex items-center justify-center`}><Delete className="h-5 w-5" /></button>
              <button onClick={() => handleNumber("0")} className={numBtn}>0</button>
              <button onClick={handleDecimal} className={numBtn}>.</button>
              <button onClick={handleEqual} className={`${btnClass} bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-md`}>=</button>
            </div>
          </div>

          {/* Results & History Area */}
          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="flex items-center gap-2 text-primary font-bold mb-2 uppercase tracking-wider text-sm">
                <Calculator className="h-4 w-4" /> Current Output
              </div>
              <div className="text-4xl font-extrabold text-foreground tracking-tight font-mono break-all">
                {display}
              </div>
            </div>

            <div className="card-calculator !p-5 border border-border bg-card shadow-sm h-full min-h-[300px]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-foreground">Recent History</h3>
                {history.length > 0 && (
                  <button onClick={() => setHistory([])} className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                    <RotateCcw className="h-3 w-3" /> Clear History
                  </button>
                )}
              </div>
              
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm italic opacity-60">
                  <Calculator className="h-8 w-8 mb-2 opacity-50" />
                  Your calculation history will appear here.
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-md bg-secondary/30 border border-border/50">
                      <span className="text-muted-foreground font-mono text-sm">{item.eq}</span>
                      <span className="font-bold text-foreground font-mono text-lg">{item.res}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Basic Four-Function Calculator</h2>
            <p>Our <strong>online basic calculator</strong> provides a clean, distraction-free interface for standard arithmetic operations. It is designed to function exactly like a traditional physical desktop calculator, supporting the "Big Four" mathematical operations: addition, subtraction, multiplication, and division.</p>
            <p>Whether you are balancing a checkbook, splitting a dinner bill, or helping with elementary school homework, a fast, reliable basic calculator is an essential everyday tool.</p>

            <h2 className="text-2xl font-bold mb-3">How to Use This Calculator</h2>
            <p>This calculator was built with desktop and mobile efficiency in mind. You can interact with it using your mouse, touchscreen, or computer keyboard.</p>
            <ul>
              <li><strong>Keyboard Integration:</strong> Seamlessly type numbers using your numpad or number row. The <code>+</code>, <code>-</code>, <code>*</code>, and <code>/</code> keys map perfectly to their respective operations. Press <code>Enter</code> to calculate the result, and <code>Esc</code> to clear the board.</li>
              <li><strong>Continuous Calculation:</strong> You can chain operations together. For example, pressing <code>5 + 5 +</code> will automatically calculate the first 10, then queue up the next addition.</li>
              <li><strong>History Log:</strong> Unlike a standard physical calculator, this digital version keeps a running tape of your last 5 calculations on the right side of the screen, so you never lose track of your work.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Order of Operations Note</h2>
            <p>It is important to note that <em>basic</em> calculators generally do not follow the standard mathematical order of operations (PEMDAS/BODMAS). They calculate sequentially based on user input. For example, if you type <code>2 + 3 × 4</code> on this calculator, it will first add 2 and 3 (getting 5), and then multiply by 4, resulting in 20. A scientific calculator following strict PEMDAS would calculate the multiplication first (3 × 4 = 12), then add 2, resulting in 14. If you need complex expression evaluation with parentheses and exponents, please use our <a href="/calculator/scientific-calculator">Scientific Calculator</a>.</p>

            <h2 className="text-2xl font-bold mb-3">Understanding the Memory and Clear Functions</h2>
            <p>The <strong>C (Clear)</strong> button completely wipes the current session—it resets the display to zero and forgets any pending mathematical operations. The <strong>Backspace</strong> icon (located to the left of the zero) allows you to delete the last single digit you typed without clearing the entire number, preventing frustration during long entries.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/basic-calculator" />
          <PopularCalculators exclude="/calculator/basic-calculator" />
        </div>
      </div>
    </>
  );
};
export default BasicCalculator;
