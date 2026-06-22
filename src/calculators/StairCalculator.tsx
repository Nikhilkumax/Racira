"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, ArrowUpRight } from "lucide-react";

interface StairResult {
  stepCount: number;
  exactRise: number;
  exactRun: number;
  totalRunLength: number;
  stringerLength: number;
  isError: boolean;
  errorMsg?: string;
}

const calculateStairs = (
  unit: string,
  totalRiseStr: string, // inches or cm
  targetRiseStr: string, // inches or cm
  targetRunStr: string // inches or cm
): StairResult | null => {
  const totalRise = parseFloat(totalRiseStr);
  const targetRise = parseFloat(targetRiseStr);
  const targetRun = parseFloat(targetRunStr);

  if (isNaN(totalRise) || isNaN(targetRise) || isNaN(targetRun) || totalRise <= 0 || targetRise <= 0 || targetRun <= 0) return null;

  try {
    // 1. Calculate number of steps (risers) required
    const exactStepsRaw = totalRise / targetRise;
    const stepCount = Math.round(exactStepsRaw);

    if (stepCount <= 0) return { stepCount: 0, exactRise: 0, exactRun: 0, totalRunLength: 0, stringerLength: 0, isError: true, errorMsg: "Total rise is too small." };

    // 2. Calculate the exact mathematical rise per step to make them all perfectly equal
    const exactRise = totalRise / stepCount;

    // The run (tread depth) is usually fixed by the user, but we'll use their target as exact.
    const exactRun = targetRun;

    // 3. Calculate total horizontal run length of the staircase
    // A standard staircase always has one less tread (run) than riser, because the top floor acts as the final tread.
    const numTreads = stepCount - 1;
    let totalRunLength = 0;
    
    if (numTreads > 0) {
      totalRunLength = numTreads * exactRun;
    }

    // 4. Calculate Stringer Length (the diagonal board that holds the stairs)
    // Pythagorean theorem: c^2 = a^2 + b^2
    const stringerLengthRaw = Math.sqrt(Math.pow(totalRise, 2) + Math.pow(totalRunLength, 2));
    
    // Add 15% extra to stringer length for waste and mounting cuts
    const stringerLength = stringerLengthRaw * 1.15;

    return {
      stepCount: stepCount,
      exactRise: parseFloat(exactRise.toFixed(2)),
      exactRun: parseFloat(exactRun.toFixed(2)),
      totalRunLength: parseFloat(totalRunLength.toFixed(2)),
      stringerLength: parseFloat(stringerLength.toFixed(2)),
      isError: false
    };

  } catch (err) {
    return { stepCount: 0, exactRise: 0, exactRun: 0, totalRunLength: 0, stringerLength: 0, isError: true, errorMsg: "Calculation error." };
  }
};

const StairCalculator = () => {
  const [unit, setUnit] = useState("imperial");
  const [totalRise, setTotalRise] = useState("108"); // 9 feet floor-to-floor (in inches)
  const [targetRise, setTargetRise] = useState("7.5"); // standard 7.5 inch rise
  const [targetRun, setTargetRun] = useState("10"); // standard 10 inch tread

  const [result, setResult] = useState<StairResult | null>(null);

  const calculate = () => {
    setResult(calculateStairs(unit, totalRise, targetRise, targetRun));
  };

  useEffect(() => { calculate(); }, [unit, totalRise, targetRise, targetRun]);

  const handleUnitChange = (newUnit: "imperial" | "metric") => {
    setUnit(newUnit);
    if (newUnit === "imperial") {
      setTotalRise("108"); setTargetRise("7.5"); setTargetRun("10");
    } else {
      setTotalRise("274"); setTargetRise("19"); setTargetRun("25"); // cm
    }
  };

  const wrap = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is Rise and Run?", answer: "The 'Rise' is the vertical height of a single step. The 'Run' is the horizontal depth of a single step (where you put your foot). The 'Total Rise' is the absolute vertical measurement from the surface of the bottom floor to the surface of the top floor." },
    { question: "Why must every step be exactly identical?", answer: "Building codes strictly mandate that every step in a staircase must have the exact same rise, with a maximum variance of less than 3/8 of an inch between the largest and smallest step. The human brain runs on autopilot when climbing stairs; if just one step is half an inch taller than the rest, you will almost certainly trip and fall." },
    { question: "What is a Stringer?", answer: "A stringer is the heavy diagonal board (usually a 2x12) that runs underneath the staircase. The zig-zag shape of the stairs is physically cut out of the stringer to support the treads and risers. You usually need at least three stringers for a standard width staircase." },
    { question: "Why is the Total Run not simply (Steps * Run)?", answer: "A staircase always has one less tread (run) than riser (step). When you walk up a set of stairs, the very last 'step' you take lands on the upper floor itself. Therefore, the upper floor acts as the final tread, so you do not add a run length for it." },
  ];

  // Helper for Imperial display
  const formatFeetAndInches = (inches: number) => {
    const feet = Math.floor(inches / 12);
    const remainingInches = (inches % 12).toFixed(1);
    if (feet === 0) return `${remainingInches}"`;
    return `${feet}' - ${remainingInches}"`;
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Stair Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Stair Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          
          <div className="card-calculator flex flex-col gap-5 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5">Measurement System</label>
              <div className="flex rounded-md border border-input overflow-hidden h-10 w-full">
                <button type="button" onClick={() => handleUnitChange("imperial")} className={`flex-1 text-sm font-bold transition-colors ${unit === "imperial" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>Imperial (Inches)</button>
                <button type="button" onClick={() => handleUnitChange("metric")} className={`flex-1 text-sm font-bold transition-colors border-l border-input ${unit === "metric" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>Metric (cm)</button>
              </div>
            </div>

            <div className="h-px w-full bg-border/50"></div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between">
                <span>Total Floor-to-Floor Height</span>
                <span className="text-xs text-muted-foreground self-end">{unit === "imperial" ? "Inches" : "Centimeters"}</span>
              </label>
              <div className={wrap}><input type="number" value={totalRise} onChange={e => setTotalRise(e.target.value)} className={ci} min="1" step="any" /></div>
              <p className="text-xs text-muted-foreground mt-1.5">Measure from the finished bottom floor to the finished top floor.</p>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between">
                <span>Target Step Height (Rise)</span>
                <span className="text-xs text-muted-foreground self-end">{unit === "imperial" ? "Inches" : "Centimeters"}</span>
              </label>
              <div className={wrap}><input type="number" value={targetRise} onChange={e => setTargetRise(e.target.value)} className={ci} min="1" step="any" /></div>
              <p className="text-xs text-muted-foreground mt-1.5">Standard is ~7.5 inches (~19 cm).</p>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between">
                <span>Target Step Depth (Run)</span>
                <span className="text-xs text-muted-foreground self-end">{unit === "imperial" ? "Inches" : "Centimeters"}</span>
              </label>
              <div className={wrap}><input type="number" value={targetRun} onChange={e => setTargetRun(e.target.value)} className={ci} min="1" step="any" /></div>
              <p className="text-xs text-muted-foreground mt-1.5">Standard is ~10 inches (~25 cm).</p>
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-12 text-lg transition-all active:scale-[0.98] shadow-sm">
                <ArrowUpRight className="h-5 w-5" /> Calculate Stairs
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && result.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5 flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Input Error</div>
                  <div className="text-base font-medium text-foreground">{result.errorMsg}</div>
                </div>
              </div>
            ) : result && (<>
              
              <div className="bg-emerald-500/10 border-l-4 border-emerald-500 rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-wider">Exact Steps Required</div>
                  <div className="text-5xl md:text-6xl font-extrabold text-foreground tracking-tight font-mono leading-tight">
                    {result.stepCount}
                  </div>
                  <div className="text-sm text-muted-foreground font-bold uppercase mt-1">Total Risers</div>
                </div>
                <div className="bg-background border border-border/50 rounded-lg p-3 text-center md:w-40 shrink-0">
                  <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Exact Rise per Step</div>
                  <div className="text-2xl font-bold text-foreground font-mono">{result.exactRise} <span className="text-sm font-normal text-muted-foreground">{unit === "imperial" ? "in" : "cm"}</span></div>
                </div>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-4">Staircase Profile</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="p-4 bg-secondary/30 rounded-lg border border-border/50">
                    <div className="text-xs text-muted-foreground font-bold uppercase mb-1">Total Horizontal Run Length</div>
                    <div className="text-2xl font-bold text-foreground font-mono">{result.totalRunLength} <span className="text-sm font-normal text-muted-foreground">{unit === "imperial" ? "in" : "cm"}</span></div>
                    {unit === "imperial" && <div className="text-sm text-muted-foreground mt-1 font-mono">({formatFeetAndInches(result.totalRunLength)})</div>}
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-lg border border-border/50">
                    <div className="text-xs text-muted-foreground font-bold uppercase mb-1">Diagonal Stringer Length</div>
                    <div className="text-2xl font-bold text-foreground font-mono">{result.stringerLength} <span className="text-sm font-normal text-muted-foreground">{unit === "imperial" ? "in" : "cm"}</span></div>
                    {unit === "imperial" && <div className="text-sm text-muted-foreground mt-1 font-mono">({formatFeetAndInches(result.stringerLength)})</div>}
                  </div>
                </div>

                <div className="text-sm text-muted-foreground leading-relaxed p-4 border border-blue-500/20 bg-blue-500/5 rounded-lg">
                  <strong className="text-blue-500 dark:text-blue-400">Important Builder Notes:</strong>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>The stringer length includes a 15% safety/waste margin for mounting cuts.</li>
                    <li>Because the top floor acts as the final step, there are <strong>{result.stepCount - 1} treads</strong> and <strong>{result.stepCount} risers</strong>.</li>
                    <li>Always verify local building codes. In the US, the maximum allowed rise is typically 7.75 inches, and the minimum allowed run is 10 inches.</li>
                  </ul>
                </div>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>The Mathematics of Stairs</h2>
            <p>Building stairs is arguably one of the most mathematically demanding tasks in carpentry. It requires absolute precision. If you simply divide the height by the number of stairs and round off the decimal, your staircase will fail building code inspections and present a massive tripping hazard.</p>

            <h2>Why Exact Uniformity is Critical</h2>
            <p>Building codes strictly mandate that every single step in a staircase must have the exact same vertical rise. The maximum allowed variance between the tallest step and the shortest step is usually <strong>less than 3/8 of an inch</strong> over the entire flight of stairs.</p>
            <p>Why so strict? The human brain operates on "muscle memory" when climbing stairs. After your foot hits the first two steps, your brain calculates the exact height required and puts your legs on autopilot. If the 7th step is half an inch taller than the rest, your foot will catch the lip of the tread, and you will almost certainly trip and fall. <strong>You cannot simply make the bottom step smaller to "make the math work." Every step must be identical.</strong></p>

            <h2>How the Calculation Works</h2>
            <p>To calculate a staircase, you must first determine the <strong>Total Rise</strong>. This is the absolute vertical measurement from the <em>finished</em> surface of the bottom floor to the <em>finished</em> surface of the top floor. (Do not measure from subfloor to subfloor if one floor is getting thick hardwood and the other is getting thin vinyl; the difference will ruin the math).</p>
            <ol>
              <li>Divide the Total Rise by your "Target Rise" (usually 7.5 inches in the US).</li>
              <li>This will give you a decimal (e.g., 108" ÷ 7.5" = 14.4 steps).</li>
              <li>You cannot have 0.4 of a step. You must round to the nearest whole number (14 steps).</li>
              <li>Finally, divide the Total Rise by the whole number of steps to get the <strong>Exact Mathematical Rise</strong> (e.g., 108" ÷ 14 = 7.71 inches).</li>
            </ol>
            <p>You must then physically cut every single notch in your wooden stringer to exactly 7.71 inches tall.</p>

            <h2>The Tread Rule (Runs vs Risers)</h2>
            <p>A staircase always has one less tread (horizontal run) than riser (vertical step). When you walk up a set of stairs, the very last vertical step you take lands you on the upper floor itself. Therefore, the upper floor acts as the final tread. If your staircase has 14 vertical risers, you will only physically cut and install 13 wooden treads.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/stair-calculator" />
          <PopularCalculators exclude="/calculator/stair-calculator" />
        </div>
      </div>
    </>
  );
};
export default StairCalculator;
