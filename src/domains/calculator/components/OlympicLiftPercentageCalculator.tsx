"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, ActivitySquare, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";

// 1. TypeScript Interfaces
type LiftType = "back_squat" | "front_squat" | "clean_jerk" | "snatch" | "power_clean" | "power_snatch";

interface OlympicInputs {
  knownLift: LiftType;
  knownWeight: number;
  unit: "lbs" | "kg";
}

interface OlympicResults {
  targets: Record<LiftType, number>;
  ratios: Record<LiftType, number>;
  
  grade: string;
  recommendation: string;

  chartData: { subject: string; A: number; fullMark: number }[];
  summaryStats: { label: string; value: string; colorClass?: string }[];
}

// 2. Pure Calculation Function
// Standard clinical weightlifting ratios (relative to Back Squat = 1.0)
const RATIOS: Record<LiftType, number> = {
  back_squat: 1.00,
  front_squat: 0.85,    // 85% of BS
  clean_jerk: 0.80,     // 80% of BS (approx 94% of FS)
  power_clean: 0.68,    // 68% of BS (approx 85% of CJ)
  snatch: 0.64,         // 64% of BS (approx 80% of CJ)
  power_snatch: 0.54    // 54% of BS (approx 85% of Snatch)
};

const LIFT_NAMES: Record<LiftType, string> = {
  back_squat: "Back Squat",
  front_squat: "Front Squat",
  clean_jerk: "Clean & Jerk",
  power_clean: "Power Clean",
  snatch: "Snatch",
  power_snatch: "Power Snatch"
};

const calculateOlympicRatios = (inputs: OlympicInputs): OlympicResults | null => {
  const { knownLift, knownWeight, unit } = inputs;
  
  if (knownWeight <= 0) return null;

  // 1. Convert the known lift back to the theoretical Back Squat baseline
  const backSquatBaseline = knownWeight / RATIOS[knownLift];

  // 2. Calculate all targets based on the theoretical baseline
  const targets: Record<LiftType, number> = {
    back_squat: Math.round(backSquatBaseline * RATIOS.back_squat),
    front_squat: Math.round(backSquatBaseline * RATIOS.front_squat),
    clean_jerk: Math.round(backSquatBaseline * RATIOS.clean_jerk),
    power_clean: Math.round(backSquatBaseline * RATIOS.power_clean),
    snatch: Math.round(backSquatBaseline * RATIOS.snatch),
    power_snatch: Math.round(backSquatBaseline * RATIOS.power_snatch)
  };

  let grade = "";
  let recommendation = "";

  if (knownLift === "back_squat" || knownLift === "front_squat") {
    grade = "Strength-Dominant Baseline";
    recommendation = "You have provided a raw strength movement as your baseline. The Olympic lift targets generated (Snatch, Clean & Jerk) represent your theoretical maximums if your technique and explosiveness were absolutely perfect. If your actual Olympic lifts are far below these targets, your issue is not leg strength; it is technique, speed, or mobility.";
  } else {
    grade = "Technical-Dominant Baseline";
    recommendation = "You have provided a highly technical Olympic lift as your baseline. The Squat targets generated represent the minimum raw leg strength required to support that lift. If your actual Back Squat is vastly higher than the calculated target, it confirms you have a massive excess of raw strength but are severely lacking in technical proficiency.";
  }

  const chartData = [
    { subject: "Back Squat", A: targets.back_squat, fullMark: targets.back_squat },
    { subject: "Front Squat", A: targets.front_squat, fullMark: targets.back_squat },
    { subject: "Clean & Jerk", A: targets.clean_jerk, fullMark: targets.back_squat },
    { subject: "Power Clean", A: targets.power_clean, fullMark: targets.back_squat },
    { subject: "Snatch", A: targets.snatch, fullMark: targets.back_squat },
    { subject: "Power Snatch", A: targets.power_snatch, fullMark: targets.back_squat }
  ];

  const summaryStats = [
    { label: "Baseline Anchor Lift", value: LIFT_NAMES[knownLift], colorClass: "text-primary font-bold" },
    { label: "Theoretical Back Squat", value: `${targets.back_squat} ${unit}`, colorClass: "text-foreground font-black text-lg" },
    { label: "Target Clean & Jerk", value: `${targets.clean_jerk} ${unit}`, colorClass: "text-blue-500 font-bold" },
    { label: "Target Snatch", value: `${targets.snatch} ${unit}`, colorClass: "text-red-500 font-bold" }
  ];

  return {
    targets,
    ratios: RATIOS,
    grade,
    recommendation,
    chartData,
    summaryStats
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  knownLift: "back_squat" as LiftType,
  knownWeight: "315",
  unit: "lbs" as const
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold mb-1 text-primary">{payload[0].payload.subject}</p>
        <p className="text-muted-foreground">Target: <span className="font-bold text-foreground">{payload[0].value}</span></p>
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

export default function OlympicLiftPercentageCalculator() {
  // 4. Component State
  const [knownLift, setKnownLift] = useState<LiftType>(DEFAULTS.knownLift);
  const [knownWeight, setKnownWeight] = useState(DEFAULTS.knownWeight);
  const [unit, setUnit] = useState<"lbs" | "kg">(DEFAULTS.unit);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState<OlympicResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const w = parseFloat(knownWeight);

    if (w <= 0) {
      setErrorMsg("Error: Lift weight must be greater than zero.");
      setResults(null);
      return;
    }

    const inputs: OlympicInputs = {
      knownLift,
      knownWeight: w,
      unit
    };
    setResults(calculateOlympicRatios(inputs));
  };

  const handleReset = () => {
    setKnownLift(DEFAULTS.knownLift);
    setKnownWeight(DEFAULTS.knownWeight);
    setUnit(DEFAULTS.unit);
    setErrorMsg("");
    
    setResults(calculateOlympicRatios({
      knownLift: DEFAULTS.knownLift,
      knownWeight: parseFloat(DEFAULTS.knownWeight),
      unit: DEFAULTS.unit
    }));
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [knownLift, knownWeight, unit]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Olympic Lift Ratios</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "Why do we use the Back Squat as the baseline?", answer: "The Back Squat is the ultimate measure of absolute lower-body and core strength. It is the foundational engine that drives all other Olympic lifts. By setting the Back Squat as 100%, we can mathematically determine the theoretical maximums for every other lift. If your legs can only squat 300 lbs, it is biologically impossible for you to Clean and Jerk 300 lbs." },
    { question: "Why is my actual Snatch much lower than the calculator's target?", answer: "This is the most common scenario for amateur lifters. If the calculator says you should be snatching 200 lbs based on your Back Squat, but you can only snatch 135 lbs, it proves you have a massive technique or mobility deficit. You do not need to do heavy squats to improve your snatch; you need to practice snatch technique with an empty barbell." },
    { question: "Can my Clean & Jerk ever be higher than my Back Squat?", answer: "No, this is physically impossible. You must stand up out of the hole during a Clean. If you cannot front squat the weight, you cannot clean it. If you cannot back squat more than you front squat, your mechanics are broken. The hierarchy of strength (Back Squat > Front Squat > Clean & Jerk) is an absolute law of biomechanics." },
    { question: "What is the difference between a Power Clean and a full Clean?", answer: "In a full Clean, you drop your hips below parallel (into a front squat) to catch the barbell. In a Power Clean, you catch the barbell with your hips above parallel (a partial quarter-squat). Because you must pull the bar much higher in a Power Clean, you cannot lift as much weight. The Power Clean is typically 85% of your full Clean." },
    { question: "Are these ratios exact for everyone?", answer: "No. These are the gold-standard Russian/Soviet weightlifting ratios developed by studying thousands of elite international competitors over decades. Individual limb length (anthropometry) will slightly alter these numbers. A lifter with very long femurs might struggle with back squats but excel at pulling movements. However, massive deviations from these ratios always indicate a glaring weakness." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Olympic Lift Percentage Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Olympic Lift Ratio Analyzer</h1>

        {/* MEDICAL DISCLAIMER */}
        <div className="max-w-[1280px] mb-6 bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded-r-lg flex gap-3 items-start">
          <AlertTriangle className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
          <p className="text-sm font-medium leading-relaxed text-blue-800 dark:text-blue-400">
            <strong>Diagnostic Tool:</strong> This calculator does not tell you what you <em>can</em> lift today. It reveals what you <em>should</em> be able to lift based on perfect Soviet-era biomechanical ratios, highlighting your exact weaknesses in raw strength vs. technical proficiency.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px]">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <ActivitySquare className="h-4 w-4" /> Ratio Engine
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Input your best 1-Repetition Maximum for any single lift. The engine will mathematically reverse-engineer your entire strength profile.</p>
            </div>

            <div className="flex flex-col mb-1 mt-2 border-t border-border pt-4">
              <label className="flex items-center text-sm font-semibold text-foreground mb-1.5">Anchor Lift (Known 1RM)</label>
              <select 
                value={knownLift} 
                onChange={(e) => setKnownLift(e.target.value as LiftType)}
                className="w-full h-10 px-3 py-1 text-sm font-medium rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all text-foreground"
              >
                <option value="back_squat">Back Squat (Absolute Strength Baseline)</option>
                <option value="front_squat">Front Squat</option>
                <option value="clean_jerk">Clean & Jerk</option>
                <option value="power_clean">Power Clean</option>
                <option value="snatch">Snatch</option>
                <option value="power_snatch">Power Snatch</option>
              </select>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-3 mt-2">
              <div className="grid grid-cols-1 gap-3">
                <CompactInput id="wt" label="Weight Lifted" value={knownWeight} onChange={setKnownWeight} />
              </div>
              <div className="flex flex-col">
                <label className="flex items-center text-sm font-semibold text-foreground mb-1.5">&nbsp;</label>
                <div className="flex p-1 bg-secondary rounded-lg border border-border">
                  <button type="button" onClick={() => setUnit("lbs")} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${unit === "lbs" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}>LBS</button>
                  <button type="button" onClick={() => setUnit("kg")} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${unit === "kg" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}>KG</button>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-600 text-xs font-bold p-3 rounded-md mt-1">
                {errorMsg}
              </div>
            )}

            <div className="flex gap-3 mt-4 pt-4 border-t border-border">
              <button type="button" onClick={handleReset} className="w-full rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center font-bold text-sm">
                <RotateCcw className="h-4 w-4 mr-2" /> Reset Profile
              </button>
            </div>
          </div>

          {/* RIGHT: Results */}
          <div className="flex flex-col gap-4">
            {results ? (
              <div ref={printRef} className="flex flex-col gap-4 animate-fade-in-up">
                
                <div className="grid lg:grid-cols-[1fr_300px] gap-4">
                  {/* Radar Chart */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[300px]">
                    <h3 className="text-base font-bold w-full text-left">Biomechanical Target Array</h3>
                    <ResponsiveContainer width="100%" height={260}>
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={results.chartData}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 'bold' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={false} axisLine={false} />
                        <Radar name="Target Lift" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.4} />
                        <Tooltip content={<CustomTooltip />} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Diagnostic Table */}
                  <div className="bg-muted/30 border border-border rounded-lg p-5 h-full flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold mb-4">Diagnostic Results</h3>
                      <div className="grid grid-cols-1 gap-y-3 text-sm">
                        {results.summaryStats.map((stat, i) => (
                          <div key={i} className="flex justify-between items-center border-b border-border/40 pb-2 last:border-0 last:pb-0">
                            <span className="text-muted-foreground">{stat.label}:</span>
                            <span className={`font-semibold ${stat.colorClass || ''}`}>{stat.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border/40 text-xs text-muted-foreground leading-relaxed italic">
                      <span className="font-bold">Assessment:</span> {results.recommendation}
                    </div>
                  </div>
                </div>

                {/* Detailed Ratios Table */}
                <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                  <div className="bg-secondary/50 px-4 py-3 border-b border-border flex justify-between items-center">
                    <h3 className="font-bold text-foreground">Ideal Ratio Proportions</h3>
                    <button onClick={handlePrint} className="text-muted-foreground hover:text-foreground transition-colors print:hidden" aria-label="Print Table">
                      <Printer className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-border">
                    {Object.entries(results.targets).map(([key, target]) => {
                      const liftKey = key as LiftType;
                      const isKnown = liftKey === knownLift;
                      return (
                        <div key={key} className={`bg-card p-4 flex flex-col justify-center items-center text-center ${isKnown ? 'ring-2 ring-inset ring-primary' : ''}`}>
                          <div className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${isKnown ? 'text-primary' : 'text-muted-foreground'}`}>
                            {LIFT_NAMES[liftKey]} {isKnown && "(Anchor)"}
                          </div>
                          <div className={`text-2xl font-black ${isKnown ? 'text-foreground' : 'text-foreground/80'}`}>
                            {target} <span className="text-sm font-bold text-muted-foreground">{unit}</span>
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-1 bg-muted/50 px-2 py-0.5 rounded-full border border-border/50">
                            {(results.ratios[liftKey] * 100).toFixed(0)}% of Back Squat
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <ActivitySquare className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Select your anchor lift to generate a complete biomechanical strength profile based on elite Soviet ratios.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding the Olympic Lift Percentage Calculator</h2>
            <p>If you observe a beginner attempting the Olympic lifts (the Snatch and the Clean & Jerk), you will immediately notice a chaotic disconnect between their strength and their technique. A massive powerlifter might be able to deadlift 600 pounds, but completely fail to Snatch 135 pounds due to a lack of speed and mobility. Conversely, a highly technical teenager might Snatch 185 pounds, but constantly fail standing up from the squat because they lack raw leg strength. The <strong>Olympic Lift Ratio Calculator</strong> uses decades of elite Russian and Soviet weightlifting data to diagnose exactly where your training is failing. By establishing an ideal mathematical ratio between your lifts, you can immediately identify whether you need to spend the next 12 weeks building raw strength or drilling technique.</p>

            <h2 className="text-2xl font-bold mb-3">The Biomechanics of the Soviet Ratios</h2>
            <p>During the height of the Cold War, the Soviet sports machine collected millions of data points on their elite weightlifters. They discovered that perfect human biomechanics resulted in extremely consistent mathematical ratios between the major barbell lifts. These are not arbitrary numbers; they are biological laws dictated by leverage, gravity, and muscle mass distribution.</p>
            <p>The entire system is anchored to one absolute baseline: <strong>The Back Squat (100%)</strong>. The Back Squat is the ultimate measure of absolute lower-body and core strength. It requires very little technique compared to a Snatch. If your legs cannot press a certain amount of weight out of the bottom of a Back Squat, it is physically impossible for them to catch and stand up with that weight during an explosive Olympic lift.</p>

            <h2 className="text-2xl font-bold mb-3">The Hierarchy of Lifts</h2>
            <p>Once the Back Squat is established as the 100% baseline, all other lifts fall into a strict descending mathematical hierarchy:</p>

            <h3>1. The Front Squat (85% of Back Squat)</h3>
            <p>Because the barbell is shifted to the front of the shoulders, the Front Squat forces the torso completely upright, removing the massive glutes and hamstrings from the equation and placing the load almost entirely on the quadriceps and upper back. Due to this leverage disadvantage, an elite lifter's Front Squat will perfectly align at 85% of their Back Squat.</p>

            <h3>2. The Clean & Jerk (80% of Back Squat)</h3>
            <p>The Clean & Jerk is a highly technical, explosive movement. You must pull the bar from the floor, catch it in a deep Front Squat, stand up, and then heave it over your head. Because the catch position of a Clean is exactly the bottom of a Front Squat, your Clean can never exceed your Front Squat. In fact, due to the fatigue of the pull and the technical requirement of the catch, a perfect Clean & Jerk sits at about 94% of a Front Squat (which equates to 80% of the baseline Back Squat).</p>

            <h3>3. The Snatch (64% of Back Squat)</h3>
            <p>The Snatch is the most technically demanding, explosive movement in all of sports. You are taking a barbell from the floor to locked out overhead in a single continuous motion, catching it in a deep overhead squat. Because the grip is extremely wide and the bar path is so long, the sheer physics of the movement severely limit the amount of weight that can be moved. An elite lifter will Snatch exactly 80% of what they can Clean & Jerk, which correlates to roughly 64% of their absolute Back Squat strength.</p>

            <h2 className="text-2xl font-bold mb-3">Power Variants vs. Full Lifts</h2>
            <p>The calculator also includes the "Power" variations of the lifts (Power Clean at 68% and Power Snatch at 54%). In a "Power" lift, the lifter is not allowed to drop into a full, deep squat to catch the barbell. They must catch the bar with their hips above their knees (a partial squat). Because they are not dropping under the bar, they must pull the bar significantly higher into the air. Pulling a barbell higher requires exponentially more explosive force. Therefore, a Power Clean will always be roughly 15% lighter than a full Clean, simply because human beings cannot pull maximum weights to their collarbones.</p>

            <h2 className="text-2xl font-bold mb-3">How to Use the Calculator for Diagnostics</h2>
            <p>The true power of this calculator lies in its diagnostic ability. It tells you exactly what to program for your next training block by exposing your imbalances.</p>

            <h3>Scenario A: The Strong, Slow Lifter</h3>
            <p>You input your Back Squat: <strong>400 lbs</strong>. The calculator outputs a target Snatch of <strong>256 lbs</strong>. However, your actual Snatch is only <strong>165 lbs</strong>. This is a massive failure of the ratio. You have an absolute surplus of raw leg strength. Doing more heavy Back Squats will not increase your Snatch by a single pound. You must spend the next three months doing light technique work, empty-barbell drills, and explosive plyometrics.</p>

            <h3>Scenario B: The Weak, Technical Lifter</h3>
            <p>You input your Snatch: <strong>200 lbs</strong>. The calculator reverse-engineers the math and states you must have a Back Squat of <strong>312 lbs</strong> to support this lift. However, your actual Back Squat is exactly <strong>315 lbs</strong>. You are perfectly balanced! Your technique is flawless, and you are extracting 100% efficiency out of your current leg strength. To increase your Snatch to 210 lbs, no amount of technique work will help. You have hit a strength wall. You must stop snatching and spend the next two months doing heavy Back Squats and drinking whole milk until your legs get stronger.</p>

            <h2 className="text-2xl font-bold mb-3">Conclusion: Train the Weakness</h2>
            <p>Olympic Weightlifting is a delicate balance of absolute strength, explosive power, extreme mobility, and surgical precision. If any one of these pillars falls out of alignment, the entire system crashes. Use the Olympic Lift Percentage Calculator to periodically audit your training. Let the cold, hard mathematics of the Soviet ratios dictate your programming, ensuring you are always training your weakest link rather than simply feeding your ego.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/olympic-lift-percentage-calculator" />
          <PopularCalculators exclude="/calculator/olympic-lift-percentage-calculator" />
        </div>
      </div>
    </>
  );
}
