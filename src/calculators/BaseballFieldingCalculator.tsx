"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Printer, RotateCcw, ActivitySquare, AlertTriangle, Shield, Crosshair, Zap } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { Button } from "@/components/ui/button";

// 1. TypeScript Interfaces
interface FieldingInputs {
  putouts: number;
  assists: number;
  errors: number;
}

interface FieldingResults {
  fieldingPercentage: string; // formatted as ".985"
  totalChances: number;
  successfulPlays: number;
  classification: "Elite (Gold Glove Level)" | "Great" | "Average" | "Below Average" | "Poor";
  colorClass: string;
  chartData: { name: string; value: number }[];
}

// 2. Pure Calculation Function
const calculateFielding = (inputs: FieldingInputs): FieldingResults | null => {
  const { putouts, assists, errors } = inputs;
  
  if (putouts < 0 || assists < 0 || errors < 0) return null;

  const successfulPlays = putouts + assists;
  const totalChances = successfulPlays + errors;

  if (totalChances === 0) return null;

  const fpRaw = successfulPlays / totalChances;

  // Format to standard 3 decimal places without leading zero
  let fpString = fpRaw.toFixed(3).toString();
  if (fpString.startsWith("0")) {
    fpString = fpString.substring(1);
  } else if (fpRaw === 1) {
    fpString = "1.000"; // Perfect fielding
  }

  // Classifications (Modern MLB standards - highly dependent on position, but generalized here)
  let classification: FieldingResults["classification"] = "Average";
  let colorClass = "#3b82f6";

  if (fpRaw >= 0.990) {
    classification = "Elite (Gold Glove Level)";
    colorClass = "#8b5cf6"; // Purple
  } else if (fpRaw >= 0.980) {
    classification = "Great";
    colorClass = "#10b981"; // Emerald
  } else if (fpRaw >= 0.970) {
    classification = "Average";
    colorClass = "#3b82f6"; // Blue
  } else if (fpRaw >= 0.950) {
    classification = "Below Average";
    colorClass = "#f59e0b"; // Amber
  } else {
    classification = "Poor";
    colorClass = "#ef4444"; // Red
  }

  // Generate Chart Data
  const chartData = [
    { name: "Successful Plays (PO + A)", value: successfulPlays },
    { name: "Errors (E)", value: errors }
  ];

  return {
    fieldingPercentage: fpString,
    totalChances,
    successfulPlays,
    classification,
    colorClass,
    chartData
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  putouts: "250",
  assists: "120",
  errors: "8"
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground min-w-[150px]">
        <div className="flex justify-between items-center mb-1">
          <span className="text-muted-foreground mr-3">{data.name}:</span>
          <span className="font-bold">{data.value}</span>
        </div>
      </div>
    );
  }
  return null;
};

// Input Component
const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1.5">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
        {...props}
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

export default function BaseballFieldingCalculator() {
  // 4. Component State
  const [putouts, setPutouts] = useState(DEFAULTS.putouts);
  const [assists, setAssists] = useState(DEFAULTS.assists);
  const [errors, setErrors] = useState(DEFAULTS.errors);
  
  const [errorMsg, setErrorMsg] = useState("");
  const [results, setResults] = useState<FieldingResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const po = parseInt(putouts, 10);
    const a = parseInt(assists, 10);
    const e = parseInt(errors, 10);

    if (isNaN(po) || po < 0) return setErrorMsg("Please enter valid Putouts.");
    if (isNaN(a) || a < 0) return setErrorMsg("Please enter valid Assists.");
    if (isNaN(e) || e < 0) return setErrorMsg("Please enter valid Errors.");

    const res = calculateFielding({ putouts: po, assists: a, errors: e });
    
    if (!res) {
      setErrorMsg("Unable to calculate. Ensure total chances > 0.");
    } else {
      setResults(res);
    }
  };

  const handleReset = () => {
    setPutouts(DEFAULTS.putouts);
    setAssists(DEFAULTS.assists);
    setErrors(DEFAULTS.errors);
    setErrorMsg("");
    setTimeout(handleCalculate, 0);
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [putouts, assists, errors]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Baseball Fielding Percentage Analysis</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const COLORS = ["#10b981", "#ef4444"]; // Emerald for Success, Red for Errors

  const faqs = [
    { question: "What exactly is a 'Putout' and an 'Assist'?", answer: "In baseball, a Putout (PO) is awarded to the fielder who physically records the out. For example, if a batter hits a ground ball to the shortstop, and the shortstop throws the ball to the first baseman, the first baseman catches it for the out. The first baseman gets the Putout. An Assist (A) is awarded to any fielder who touched the ball prior to the putout and contributed to the play. In the previous example, the shortstop who fielded the grounder and made the throw receives the Assist." },
    { question: "What qualifies as an 'Error'?", answer: "An Error (E) is charged to a fielder if they fail to make a play that a fielder of 'ordinary effort' should have made, which results in the batter safely reaching base, or a baserunner advancing. The critical factor is 'ordinary effort'. If a third baseman dives 15 feet to their left and the ball barely deflects off their glove, it is not an error; it is ruled a Hit, because an ordinary fielder would never have reached the ball in the first place." },
    { question: "Why is Fielding Percentage considered a flawed statistic by modern sabermetricians?", answer: "Modern baseball analytics heavily criticize Fielding Percentage because it punishes range and athleticism. If a slow shortstop with terrible range just stands still, they will never reach difficult ground balls. Those balls will pass them as 'Hits', and they will never be charged with an Error. Their Fielding Percentage will look perfect (1.000). A fast, athletic shortstop who dives for everything will reach those difficult balls, but occasionally fumble them and get charged with an Error, lowering their percentage. Thus, traditional Fielding Percentage rewards players who don't try to make difficult plays." },
    { question: "If it's flawed, why is it still used?", answer: "Despite its massive flaws regarding player range, Fielding Percentage remains the most universally recognized baseline for measuring 'sure-handedness'. If an infielder has a high Fielding Percentage, it guarantees that when the ball is hit directly at them, they do not make catastrophic mistakes. It is still heavily utilized at the high school and collegiate levels where advanced optical tracking cameras are not available to measure true defensive range." },
    { question: "Do different positions have different Fielding Percentage expectations?", answer: "Yes, absolutely. A first baseman is expected to have an incredibly high Fielding Percentage (usually around .990 to .995) because the vast majority of their chances are simply catching accurately thrown balls. A shortstop or third baseman is expected to have a lower percentage (around .970) because they are constantly fielding wildly spinning ground balls and making off-balance throws across the diamond." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Sports", href: "/calculator#sports" }, { label: "Baseball Fielding Percentage Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Baseball Fielding Percentage Calculator</h1>
        <p className="text-sm text-muted-foreground mt-1">The Range Paradox: Traditional Fielding Percentage is an excellent measure of sure-handedness, but it possesses a massive analytical flaw: it cannot measure defensive range. A slow fielder who cannot reach the ball will never be charged with an error, resulting in an artificially high Fielding Percentage.</p>

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px] mx-auto mt-4">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Shield className="h-4 w-4" /> Defensive Statistics
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Enter the player's seasonal defensive metrics to calculate their mathematical reliability when engaging the baseball.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <CompactInput id="po" label="Putouts (PO)" value={putouts} onChange={setPutouts} />
              <CompactInput id="a" label="Assists (A)" value={assists} onChange={setAssists} />
            </div>

            <div className="grid grid-cols-1 gap-3 mt-1 pt-4 border-t border-border">
              <CompactInput id="e" label="Errors (E)" value={errors} onChange={setErrors} />
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-600 text-xs font-bold p-3 rounded-md mt-1">
                <AlertTriangle className="h-4 w-4 inline mr-1 -mt-0.5" />
                {errorMsg}
              </div>
            )}

            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
              <Button
                onClick={handleCalculate}
                className="flex-1 h-10 bg-primary text-primary-foreground font-bold"
              >
                Calculate
              </Button>

              <Button
                onClick={handleReset}
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0"
                aria-label="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* RIGHT: Results */}
          <div className="flex flex-col gap-4">
            {results && !errorMsg ? (
              <div ref={printRef} className="flex flex-col gap-4 animate-fade-in-up">
                
                {/* Primary Metric Box */}
                <div 
                  className="text-white rounded-lg p-6 shadow-sm relative overflow-hidden"
                  style={{ backgroundColor: results.colorClass }}
                >
                  <div className="relative z-10">
                    <div className="text-white/80 text-[10px] font-bold uppercase tracking-wider mb-1">Fielding Percentage (FPCT)</div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <div className="text-6xl font-black">{results.fieldingPercentage}</div>
                    </div>
                    <div className="text-sm font-bold text-white mt-3 bg-black/20 border border-white/20 inline-block px-3 py-1.5 rounded-full flex items-center gap-2">
                      <Shield className="h-4 w-4" /> {results.classification}
                    </div>
                  </div>
                  <Shield className="absolute -bottom-4 -right-4 h-32 w-32 opacity-10" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-4 shadow-sm flex flex-col justify-center">
                    <div className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1">Total Chances</div>
                    <div className="text-3xl font-black text-white">{results.totalChances}</div>
                    <div className="text-[10px] text-slate-500 mt-1">Denominator: PO + A + E</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-4 shadow-sm flex flex-col justify-center">
                    <div className="text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-1">Successful Plays</div>
                    <div className="text-3xl font-black text-white">{results.successfulPlays}</div>
                    <div className="text-[10px] text-slate-500 mt-1">Numerator: PO + A</div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-1 gap-4">
                  {/* Chart Panel */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[300px]">
                    <h3 className="text-base font-bold w-full text-left mb-1">Defensive Reliability Profile</h3>
                    <p className="text-xs text-muted-foreground w-full text-left mb-6">A visual breakdown of the player's interactions with the baseball. The green sector represents flawless execution, while the red sector represents given-away bases.</p>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={results.chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <Shield className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter a player's putouts, assists, and errors to calculate their true mathematical reliability when fielding the baseball.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>The Mathematics of Defense</h2>
            <p>For over a century, the sport of baseball has relied on one fundamental metric to evaluate the defensive prowess of a player: the Fielding Percentage. While offensive statistics focus on generating runs, defensive statistics focus on preventing them. The <strong>Baseball Fielding Percentage Calculator</strong> isolates a player's raw ability to handle the baseball without making mistakes. It is a pure measurement of sure-handedness, calculating exactly how often a player executes a defensive play flawlessly when given the opportunity.</p>

            <h2>Decoding the Defensive Variables</h2>
            <p>To understand Fielding Percentage, you must understand the three specific variables that comprise it: Putouts, Assists, and Errors.</p>
            <p>A <strong>Putout (PO)</strong> is awarded to the specific fielder who physically records the out. If a center fielder catches a fly ball, they get the putout. If the shortstop throws a grounder to the first baseman who steps on the bag, the first baseman gets the putout.</p>
            <p>An <strong>Assist (A)</strong> is awarded to any fielder who touched the ball and contributed to the out before the putout occurred. In the previous ground-ball example, the shortstop who fielded the ball and threw it across the diamond receives the Assist.</p>
            <p>An <strong>Error (E)</strong> is a negative mark given when a fielder fails to make a play that a fielder of "ordinary effort" should have made, directly resulting in an opposing player reaching base safely or advancing. The formula simply adds Putouts and Assists (the successes) and divides them by the Total Chances (Putouts + Assists + Errors) to generate the final percentage.</p>

            <h2>The 'Ordinary Effort' Caveat</h2>
            <p>The entire concept of an Error rests upon the subjective judgment of the official scorekeeper regarding "ordinary effort." This introduces a fascinating human element into the cold mathematics of the statistic.</p>
            <p>If a third baseman dives 15 feet to his left, extending his body to the absolute physiological limit, and the ball deflects off the very tip of his glove, it is almost never ruled an Error. It is ruled a Hit. Why? Because the scorekeeper determines that an "ordinary" third baseman would never have reached the ball in the first place. You cannot be penalized with an Error for attempting a superhuman play and failing. Errors are strictly reserved for routine ground balls that are fumbled, or routine throws that are sailed over the first baseman's head.</p>

            <h2>The Range Paradox: The Flaw in Fielding Percentage</h2>
            <p>While Fielding Percentage is an excellent measure of sure-handedness, modern sabermetricians despise it because of a massive analytical blind spot known as the Range Paradox. Fielding Percentage brutally punishes athletic range while mathematically rewarding slow, unathletic players.</p>
            <p>Imagine a very slow shortstop with terrible lateral range. When a hard ground ball is hit into the gap, the slow shortstop just stands still. He doesn't even try to dive. The ball rolls into the outfield for a Hit. Because the shortstop didn't touch the ball, he is not charged with an Error. His Fielding Percentage remains a perfect 1.000. Now imagine an elite, lightning-fast shortstop. He dives for that same ball, miraculously reaches it, but fumbles the transfer from his glove to his hand. He is charged with an Error, and his Fielding Percentage drops. The elite athlete is mathematically punished for having the speed to reach the ball, while the slow player is mathematically rewarded for being terrible.</p>

            <h2>The Modern Solution: Range Factor and UZR</h2>
            <p>Because of the Range Paradox, modern Major League Baseball front offices rarely use Fielding Percentage in isolation. They combine it with advanced metrics like Ultimate Zone Rating (UZR) and Defensive Runs Saved (DRS).</p>
            <p>These advanced metrics use high-speed optical tracking cameras to measure exactly how much ground a fielder covers. They divide the field into mathematical zones and track how often a player successfully intercepts a ball hit into a difficult zone. However, for amateur baseball, high school, and college teams that do not have access to million-dollar optical tracking arrays, traditional Fielding Percentage remains the most accessible and reliable baseline metric for evaluating defensive consistency.</p>

            <h2>Positional Expectations</h2>
            <p>You cannot compare the Fielding Percentage of a center fielder to a third baseman. Different positions carry vastly different mathematical expectations.</p>
            <p>A First Baseman is expected to have an elite Fielding Percentage (routinely over .990) because the vast majority of their defensive chances involve simply catching a cleanly thrown ball while standing on the base. A Shortstop or Third Baseman (the "Hot Corner") is expected to have a significantly lower percentage (around .970) because their defensive chances are exponentially more difficult. They are required to sprint laterally, field violently spinning ground balls on unpredictable dirt surfaces, and throw the ball 120 feet with pinpoint accuracy while running off-balance.</p>

            <h2>Conclusion: The Foundation of Defense</h2>
            <p>Despite its flaws regarding athletic range, Fielding Percentage remains the bedrock of defensive analytics. If a player has a terrible Fielding Percentage, no amount of speed or range will save them—if they cannot securely catch the ball when it comes to them, they are a defensive liability. Use the Baseball Fielding Percentage Calculator to establish the baseline sure-handedness of your players, ensuring your team isn't mathematically giving away bases through sloppy execution.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/baseball-fielding-percentage-calculator" />
          <PopularCalculators exclude="/calculator/baseball-fielding-percentage-calculator" />
        </div>
      </div>
    </>
  );
}
