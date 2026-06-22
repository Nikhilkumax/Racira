"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Leaf, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// 1. TypeScript Interfaces
interface NetCarbsInputs {
  totalCarbs: number;
  fiber: number;
  sugarAlcohols: number;
  alcoholType: "erythritol" | "maltitol" | "none";
}

interface NetCarbsResults {
  netCarbs: number;
  subtractedFiber: number;
  subtractedAlcohols: number;
  impactCalories: number;
  
  grade: string;
  recommendation: string;

  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string; colorClass?: string }[];
}

// 2. Pure Calculation Function
const calculateNetCarbs = (inputs: NetCarbsInputs): NetCarbsResults | null => {
  const { totalCarbs, fiber, sugarAlcohols, alcoholType } = inputs;
  
  if (totalCarbs < 0 || fiber < 0 || sugarAlcohols < 0) return null;
  if (fiber + sugarAlcohols > totalCarbs) return null; // Mathematically impossible on a real nutrition label

  let subtractedAlcohols = 0;
  
  if (alcoholType === "erythritol") {
    // Erythritol, Xylitol, Allulose have virtually zero glycemic impact. Subtract 100%.
    subtractedAlcohols = sugarAlcohols;
  } else if (alcoholType === "maltitol") {
    // Maltitol, Sorbitol, Isomalt are partially digested. Subtract only 50%.
    subtractedAlcohols = sugarAlcohols / 2;
  } else {
    subtractedAlcohols = 0;
  }

  const subtractedFiber = fiber;
  
  let netCarbs = totalCarbs - subtractedFiber - subtractedAlcohols;
  if (netCarbs < 0) netCarbs = 0; // Prevent negative edge cases

  const impactCalories = netCarbs * 4;

  let grade = "";
  let recommendation = "";
  let colorClass = "";

  if (netCarbs <= 5) {
    grade = "Keto-Friendly / Ultra-Low Impact";
    recommendation = "This food item is highly Keto-compliant. Because the vast majority of its carbohydrates come from indigestible fiber or zero-glycemic sugar alcohols, it will have virtually no impact on your blood sugar or insulin levels.";
    colorClass = "text-purple-500 font-bold";
  } else if (netCarbs <= 15) {
    grade = "Moderate / Low-Carb Compatible";
    recommendation = "This item has a moderate glycemic impact. It can easily fit into a standard low-carb diet, but strict Ketogenic dieters should monitor their portion sizes closely to avoid exceeding their 20-50g daily limit.";
    colorClass = "text-blue-500 font-bold";
  } else {
    grade = "High Glycemic Impact";
    recommendation = "WARNING: Despite containing fiber or sugar alcohols, the Net Carb load of this item is very high. It will cause a significant spike in blood glucose and insulin. This is not recommended for strict low-carb or Keto protocols.";
    colorClass = "text-red-500 font-bold";
  }

  const chartData = [
    { name: "Net Carbs (Absorbed)", value: parseFloat(netCarbs.toFixed(1)), color: "#ef4444" },
    { name: "Fiber (Subtracted)", value: parseFloat(subtractedFiber.toFixed(1)), color: "#10b981" },
    { name: "Alcohols (Subtracted)", value: parseFloat(subtractedAlcohols.toFixed(1)), color: "#3b82f6" }
  ];

  const summaryStats = [
    { label: "Calculated Net Carbs", value: `${netCarbs.toFixed(1)}g`, colorClass: "text-red-500 font-bold text-lg" },
    { label: "Total Digestible Calories", value: `${impactCalories.toFixed(0)} kcal` },
    { label: "Total Subtracted", value: `-${(subtractedFiber + subtractedAlcohols).toFixed(1)}g`, colorClass: "text-muted-foreground italic" },
    { label: "Glycemic Impact Profile", value: grade, colorClass: colorClass }
  ];

  return {
    netCarbs: parseFloat(netCarbs.toFixed(1)),
    subtractedFiber,
    subtractedAlcohols,
    impactCalories,
    grade,
    recommendation,
    chartData,
    summaryStats
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  totalCarbs: "24",
  fiber: "14",
  sugarAlcohols: "6",
  alcoholType: "erythritol" as const
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold mb-1" style={{ color: payload[0].payload.color }}>{payload[0].payload.name}</p>
        <p className="text-muted-foreground"><span className="font-bold text-foreground">{payload[0].value}g</span></p>
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

export default function NetCarbsCalculator() {
  // 4. Component State
  const [totalCarbs, setTotalCarbs] = useState(DEFAULTS.totalCarbs);
  const [fiber, setFiber] = useState(DEFAULTS.fiber);
  const [sugarAlcohols, setSugarAlcohols] = useState(DEFAULTS.sugarAlcohols);
  const [alcoholType, setAlcoholType] = useState<NetCarbsInputs["alcoholType"]>(DEFAULTS.alcoholType);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState<NetCarbsResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const tc = parseFloat(totalCarbs) || 0;
    const f = parseFloat(fiber) || 0;
    const sa = parseFloat(sugarAlcohols) || 0;

    if (tc < 0 || f < 0 || sa < 0) {
      setErrorMsg("Error: Values cannot be negative.");
      setResults(null);
      return;
    }
    
    if (f + sa > tc) {
      setErrorMsg("Error: Fiber + Sugar Alcohols cannot mathematically exceed Total Carbohydrates.");
      setResults(null);
      return;
    }

    const inputs: NetCarbsInputs = {
      totalCarbs: tc,
      fiber: f,
      sugarAlcohols: sa,
      alcoholType
    };
    setResults(calculateNetCarbs(inputs));
  };

  const handleReset = () => {
    setTotalCarbs(DEFAULTS.totalCarbs);
    setFiber(DEFAULTS.fiber);
    setSugarAlcohols(DEFAULTS.sugarAlcohols);
    setAlcoholType(DEFAULTS.alcoholType);
    setErrorMsg("");
    
    setResults(calculateNetCarbs({
      totalCarbs: parseFloat(DEFAULTS.totalCarbs),
      fiber: parseFloat(DEFAULTS.fiber),
      sugarAlcohols: parseFloat(DEFAULTS.sugarAlcohols),
      alcoholType: DEFAULTS.alcoholType
    }));
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalCarbs, fiber, sugarAlcohols, alcoholType]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Net Carbs Calculation</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "What is the difference between Total Carbs and Net Carbs?", answer: "Total Carbs include every single type of carbohydrate in a food item: starches, sugars, fiber, and sugar alcohols. Net Carbs represent only the carbohydrates that your body can physically digest, absorb into the bloodstream, and convert into glucose. Net carbs are the only carbs that spike insulin and disrupt ketosis." },
    { question: "Why do we subtract Dietary Fiber?", answer: "Humans lack the digestive enzymes required to break down dietary fiber into glucose. Because fiber passes through the digestive tract largely intact (or is fermented in the colon by bacteria), it does not raise your blood sugar. Therefore, Keto and low-carb dieters subtract fiber grams from the total carb count." },
    { question: "Are all Sugar Alcohols subtracted 100%?", answer: "No, this is a massive marketing trap used by 'Keto' snack companies. Erythritol, Xylitol, and Allulose have virtually zero glycemic impact and can be safely subtracted 100%. However, Maltitol, Sorbitol, and Isomalt are partially digested. They do raise blood sugar, so you should only subtract half (50%) of their grams to be safe." },
    { question: "Can I eat unlimited Net Carbs if they are zero?", answer: "No. Even if a 'Keto Protein Bar' has 0g Net Carbs because it is packed with fiber and erythritol, it still contains calories from protein and fat. If you eat 3,000 calories of '0g Net Carb' snacks, you will still gain weight. Furthermore, massive amounts of sugar alcohols can cause severe gastrointestinal distress." },
    { question: "How do I calculate Net Carbs in whole foods?", answer: "For whole foods without a nutrition label (like an avocado or spinach), simply look up the Total Carbs and Dietary Fiber online. For example, a medium avocado has about 12g of Total Carbs, but 10g of Fiber. Therefore, it only contains 2g of Net Carbs, making it a perfect Keto food." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Net Carbs Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Net Carbs Calculator</h1>

        {/* KETO TRAP DISCLAIMER */}
        <div className="max-w-[1280px] mx-auto mb-6 bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-lg flex gap-3 items-start">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
          <p className="text-sm font-medium leading-relaxed text-amber-800 dark:text-amber-400">
            <strong>The "Keto Snack" Warning:</strong> Many commercial protein bars claim "2g Net Carbs" by utilizing Maltitol as a sweetener. Maltitol is partially digested and <strong>will</strong> spike your blood sugar. Use this calculator to accurately subtract only 50% of these deceptive sugar alcohols.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px] mx-auto">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Leaf className="h-4 w-4" /> Glycemic Impact Engine
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Deconstruct nutrition labels by mathematically removing indigestible fiber and zero-calorie sweeteners to reveal the true glycemic load.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="tc" label="Total Carbohydrates" value={totalCarbs} onChange={setTotalCarbs} suffix="grams" />
              <CompactInput id="fib" label="Dietary Fiber" value={fiber} onChange={setFiber} suffix="grams" />
              <CompactInput id="sa" label="Sugar Alcohols" value={sugarAlcohols} onChange={setSugarAlcohols} suffix="grams" />
            </div>

            <div className="flex flex-col mb-1 mt-2 border-t border-border pt-4">
              <label className="flex items-center text-sm font-semibold text-foreground mb-1.5">Type of Sugar Alcohol Used</label>
              <select 
                value={alcoholType} 
                onChange={(e) => setAlcoholType(e.target.value as any)}
                className="w-full h-10 px-3 py-1 text-sm font-medium rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all text-foreground"
              >
                <option value="erythritol">Erythritol, Allulose, Stevia, Monk Fruit (Subtract 100%)</option>
                <option value="maltitol">Maltitol, Sorbitol, Isomalt (Subtract 50%)</option>
                <option value="none">Unknown / Not Listed (Subtract 0% to be safe)</option>
              </select>
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-600 text-xs font-bold p-3 rounded-md mt-1">
                {errorMsg}
              </div>
            )}

            <div className="flex gap-3 mt-4 pt-4 border-t border-border">
              <button type="button" onClick={handleReset} className="w-full rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center font-bold text-sm">
                <RotateCcw className="h-4 w-4 mr-2" /> Reset Label
              </button>
            </div>
          </div>

          {/* RIGHT: Results */}
          <div className="flex flex-col gap-4">
            {results ? (
              <div ref={printRef} className="flex flex-col gap-4 animate-fade-in-up">
                
                {/* 1. Primary Result Card */}
                <div className="bg-card border border-border rounded-lg p-5 relative overflow-hidden shadow-sm">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors print:hidden z-10" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="relative z-10">
                    <div className="text-xs font-bold uppercase tracking-wider mb-1 text-red-500">
                      True Absorbed Carbs
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <div className="text-5xl font-extrabold tracking-tight text-foreground">{results.netCarbs}</div>
                      <div className="text-xl font-bold text-muted-foreground">g Net</div>
                    </div>
                    <div className="flex gap-3 text-xs font-bold mb-3 opacity-80">
                      <span className="text-foreground">Total: {totalCarbs}g</span>
                      <span className="text-green-500">- Fiber: {results.subtractedFiber}g</span>
                      <span className="text-blue-500">- Alcohols: {results.subtractedAlcohols}g</span>
                    </div>
                  </div>
                  <Leaf className="absolute -bottom-4 -right-4 h-32 w-32 opacity-5 text-foreground" />
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  {/* 3. Breakdown Table */}
                  <div className="bg-muted/30 border border-border rounded-lg p-5 h-full">
                    <h3 className="text-base font-bold mb-4">Metabolic Analysis</h3>
                    <div className="grid grid-cols-1 gap-y-4 text-sm mb-4">
                      {results.summaryStats.map((stat, i) => (
                        <div key={i} className="flex justify-between items-center border-b border-border/40 pb-2 last:border-0 last:pb-0">
                          <span className="text-muted-foreground">{stat.label}:</span>
                          <span className={`font-semibold ${stat.colorClass || ''}`}>{stat.value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-border/40 text-xs text-muted-foreground leading-relaxed italic">
                      <span className="font-bold">Assessment:</span> {results.recommendation}
                    </div>
                  </div>

                  {/* 4. Chart */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[260px]">
                    <h3 className="text-base font-bold mb-4 w-full text-left">Carbohydrate Deconstruction</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={results.chartData} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                        <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10, fill: 'hsl(var(--foreground))', fontWeight: 600 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={20}>
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <Leaf className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter the Total Carbs, Fiber, and Sugar Alcohols from a nutrition label to calculate the actual glycemic impact.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding the Net Carbs Calculator</h2>
            <p>If you have ever attempted a Ketogenic diet, a strict low-carb diet, or simply tried to manage your blood sugar levels for medical reasons, you have likely run into the massive, confusing wall of modern food labeling. You pick up a "Keto-Friendly" protein bar at the grocery store, flip it over, and see that it contains 25 grams of Total Carbohydrates. How is a 25g carb bar allowed on a diet that strictly limits you to 30g of carbs a day? The answer lies in the physiological difference between <strong>Total Carbs</strong> and <strong>Net Carbs</strong>. The <strong>Net Carbs Calculator</strong> is an essential tool designed to deconstruct nutrition labels, stripping away the indigestible matter to reveal the true, blood-sugar-spiking carbohydrate load of your food.</p>

            <h2>The Physiology of Digestion: Why "Total Carbs" is Misleading</h2>
            <p>By FDA regulations, food manufacturers must list the "Total Carbohydrates" on their nutrition labels. This number represents every single carbohydrate molecule present in the food, regardless of whether the human body can actually process it. However, the human digestive system is not a simple incinerator; it is a complex chemical processing plant that lacks the enzymes to break down certain types of carbohydrates.</p>
            <p>When you consume a carbohydrate that your body <em>can</em> break down (like a potato or a piece of candy), it is converted into glucose in the small intestine, absorbed into the bloodstream, and causes your pancreas to release insulin. This process provides caloric energy and instantly halts ketosis (fat burning). However, if you consume a carbohydrate that your body <em>cannot</em> break down, it simply passes through your system untouched, providing zero calories and causing zero insulin response. Because of this biological reality, strict dieters ignore "Total Carbs" and only count "Net Carbs"—the carbs that actually matter.</p>

            <h2>The Role of Dietary Fiber</h2>
            <p>The single most important component to subtract from your Total Carbs is <strong>Dietary Fiber</strong>. Fiber is a structural carbohydrate found in plants (vegetables, nuts, seeds, and whole grains). Because humans do not possess the necessary digestive enzymes to break the chemical bonds in fiber, it cannot be converted into glucose.</p>
            <p>Instead, fiber travels through the stomach and small intestine entirely intact. When it reaches the large intestine (colon), it is either fermented by gut bacteria (soluble fiber) or passed as waste to aid in digestion (insoluble fiber). Because fiber never enters the bloodstream as glucose, it does not spike blood sugar. Therefore, if an avocado contains 12 grams of Total Carbs, but 10 of those grams are Dietary Fiber, the avocado only contains 2 grams of Net Carbs. You mathematically subtract 100% of the fiber grams from the total.</p>

            <h2>The Sugar Alcohol Deception</h2>
            <p>Subtracting fiber is easy and universally accepted. The real danger of Net Carb math lies in <strong>Sugar Alcohols</strong> (polyols). Food manufacturers love sugar alcohols because they taste sweet like sugar, but have a fraction of the calories. They use them to mass-produce "sugar-free" candies, Keto cookies, and low-carb ice creams. However, unlike fiber, not all sugar alcohols are created equal. Many are partially digested and absolutely will spike your blood sugar.</p>

            <h3>The Safe List: Subtract 100%</h3>
            <p>Some modern sweeteners have virtually zero glycemic index (meaning they do not impact blood sugar at all) and are not fermented in the gut. These can be safely subtracted entirely from the Total Carb count. The most common are:</p>
            <ul>
              <li><strong>Erythritol:</strong> Almost completely absorbed in the small intestine and excreted unchanged in the urine. Zero calories, zero insulin spike.</li>
              <li><strong>Allulose:</strong> A rare sugar that the body cannot metabolize. Zero glycemic impact.</li>
              <li><strong>Stevia & Monk Fruit:</strong> Natural plant extracts containing zero carbohydrates.</li>
            </ul>

            <h3>The Danger List: Subtract 50% (Or Less)</h3>
            <p>Unfortunately, many manufacturers use cheaper, older sugar alcohols to cut costs. These alcohols are partially digested by the body, providing caloric energy and triggering an insulin response. The worst offender is <strong>Maltitol</strong>. Maltitol has a glycemic index of 35 (regular table sugar is 65). It acts very much like a real carbohydrate in the body.</p>
            <p>If a protein bar claims "2g Net Carbs" because it subtracted 15g of Maltitol, that label is lying to you biologically. In reality, about half of that Maltitol is digested. Therefore, our calculator forces you to identify the sweetener type. If you select Maltitol, the algorithm only allows you to subtract 50% of the sugar alcohol grams, exposing the true "hidden" Net Carbs that will wreck your diet.</p>

            <h2>The FDA Labeling Trap</h2>
            <p>It is important to note that the FDA does not legally recognize the term "Net Carbs." You will never see "Net Carbs" listed as an official bolded line item on a Nutrition Facts panel alongside Fat and Protein. It is a completely unregulated marketing term. Food companies are allowed to plaster "Only 3g Net Carbs!" on the front of their packaging in giant letters, while using their own highly questionable math to arrive at that number. You cannot trust the front of the box. You must always flip the package over, read the actual Total Carbs, Fiber, and specific Sugar Alcohols, and run the math yourself using a reliable Net Carbs Calculator.</p>

            <h2>Conclusion: Empowering Your Diet</h2>
            <p>Navigating the grocery aisles while on a strict low-carb or Ketogenic diet can feel like walking through a minefield of deceptive marketing. By understanding the biological mechanics of digestion—knowing that fiber is free, erythritol is safe, and maltitol is dangerous—you take the power back from the food manufacturers. Use the Net Carbs Calculator to deconstruct every label before you buy it. This ensures your blood sugar remains flat, your insulin remains low, and your body remains locked in a state of fat-burning ketosis.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/net-carbs-calculator" />
          <PopularCalculators exclude="/calculator/net-carbs-calculator" />
        </div>
      </div>
    </>
  );
}
