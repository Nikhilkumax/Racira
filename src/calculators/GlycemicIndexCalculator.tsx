"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, Droplet } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine, CartesianGrid } from "recharts";

interface GlycemicResult {
  glycemicLoad: number;
  category: string;
  categoryColor: string;
  categoryDesc: string;
  breakdown: { label: string; value: string }[];
  chartData: { category: string; span: number; min: number; max: number; color: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcGlycemicLoad(gi: number, netCarbsGrams: number): GlycemicResult {
  // Glycemic Load formula: GL = (GI * Net Carbs) / 100
  const gl = (gi * netCarbsGrams) / 100;
  
  let category = "", categoryColor = "", categoryDesc = "";

  if (gl <= 10) {
    category = "Low GL";
    categoryColor = "#22c55e"; // Green
    categoryDesc = "Produces a slow, steady rise in blood sugar.";
  } else if (gl <= 19) {
    category = "Medium GL";
    categoryColor = "#f59e0b"; // Orange
    categoryDesc = "Produces a moderate rise in blood sugar.";
  } else {
    category = "High GL";
    categoryColor = "#ef4444"; // Red
    categoryDesc = "Causes a rapid spike in blood sugar and insulin.";
  }

  const breakdown = [
    { label: "Food Glycemic Index (GI)", value: `${gi}` },
    { label: "Net Carbs in Serving", value: `${netCarbsGrams} g` },
    { label: "Calculated Glycemic Load", value: gl.toFixed(1) },
    { label: "GL Classification", value: category },
    { label: "Physiological Impact", value: categoryDesc.replace('.', '') },
  ];

  const summaryStats = [
    { label: "Glycemic Load", value: gl.toFixed(1) },
    { label: "Status", value: category.split(" ")[0] },
    { label: "Input GI", value: `${gi}` },
    { label: "Net Carbs", value: `${netCarbsGrams}g` },
  ];

  const chartData = [
    { category: "Low", min: 0, max: 10, span: 10, color: "#22c55e" },
    { category: "Med", min: 10, max: 19, span: 9, color: "#f59e0b" },
    { category: "High", min: 19, max: 40, span: 21, color: "#ef4444" },
  ];

  return { glycemicLoad: gl, category, categoryColor, categoryDesc, breakdown, chartData, summaryStats };
}

export default function GlycemicIndexCalculator() {
  const [gi, setGi] = useState("73"); // e.g. Watermelon
  const [carbs, setCarbs] = useState("15"); // e.g. 1 cup diced watermelon
  const [result, setResult] = useState<GlycemicResult | null>(null);

  const calculate = () => {
    const g = parseFloat(gi), c = parseFloat(carbs);
    if (g >= 0 && g <= 100 && c >= 0) {
      setResult(calcGlycemicLoad(g, c));
    }
  };

  useEffect(() => { setResult(calcGlycemicLoad(73, 15)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const suf = "pr-3 text-sm text-muted-foreground shrink-0";

  const faqs = [
    { question: "What is the difference between Glycemic Index and Glycemic Load?", answer: "The Glycemic Index (GI) measures how quickly a carbohydrate-containing food spikes your blood sugar, on a scale of 0 to 100. However, GI ignores portion size. Glycemic Load (GL) combines the GI with the actual amount of carbohydrates in a standard serving, providing a much more accurate real-world picture of how a specific meal will affect your blood sugar." },
    { question: "Why is Glycemic Load a better metric for diets?", answer: "Watermelon is the classic example. Watermelon has a very high Glycemic Index (72-80), which makes it look unhealthy on paper. However, watermelon is mostly water. A standard serving only contains about 6 grams of carbohydrates. When you calculate the Glycemic Load, it comes out to a very low 4.3. Relying only on GI would cause you to unnecessarily avoid a perfectly healthy fruit." },
    { question: "What are the standard Glycemic Load categories?", answer: "Medical and nutritional guidelines categorize Glycemic Load into three brackets: Low GL is 10 or less, Medium GL is 11 to 19, and High GL is 20 or greater. To maintain steady blood sugar and insulin levels throughout the day, diabetics and individuals aiming for fat loss should primarily consume meals with a Low or Medium GL." },
    { question: "How do I find the GI of a food?", answer: "Because GI must be tested in clinical laboratories using human subjects, you cannot calculate it from a nutrition label. You must look it up in established clinical databases, such as the official database maintained by the University of Sydney. Once you have the GI, you can use this calculator with the carbohydrate data from your nutrition label to find the Glycemic Load." },
    { question: "What are 'Net Carbs'?", answer: "Net Carbs equal the Total Carbohydrates minus Dietary Fiber. Because the human body cannot digest dietary fiber, fiber does not convert to glucose and does not spike blood sugar. Therefore, when calculating Glycemic Load, you should always use the Net Carb amount to get the most accurate physiological prediction." },
    { question: "Does adding protein or fat change the Glycemic Load?", answer: "Yes! The GI of a food is tested in isolation. If you eat a high-GI carbohydrate (like white rice) alongside protein (like chicken) and healthy fats (like olive oil), the digestion process slows down significantly. This blunts the glucose spike, effectively lowering the overall Glycemic Load of the meal compared to eating the rice by itself." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Glycemic Index Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Glycemic Index & Load Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-sm font-medium mb-1.5 block flex justify-between">
                <span>Food's Glycemic Index (GI)</span>
                <span className="text-xs text-muted-foreground font-normal">Scale: 0-100</span>
              </label>
              <div className={inp}><input type="number" value={gi} onChange={e => setGi(e.target.value)} min={0} max={100} className={ci} placeholder="e.g. 73" /></div>
              <p className="text-xs text-muted-foreground mt-1">Found in clinical GI databases.</p>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1.5 block">Net Carbohydrates in Serving</label>
              <div className={inp}><input type="number" value={carbs} onChange={e => setCarbs(e.target.value)} min={0} className={ci} placeholder="e.g. 15" /><span className={suf}>grams</span></div>
              <p className="text-xs text-muted-foreground mt-1">Total Carbs minus Dietary Fiber.</p>
            </div>
            
            <div className="flex gap-3 mt-4">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={() => { setGi("73"); setCarbs("15"); setResult(calcGlycemicLoad(73, 15)); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="rounded-lg p-5 shadow-sm border-l-4" style={{ backgroundColor: `${result.categoryColor}15`, borderColor: result.categoryColor }}>
                <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: result.categoryColor }}>Estimated Glycemic Load (GL)</div>
                <div className="flex items-baseline gap-2">
                  <div className="text-4xl font-extrabold text-foreground tracking-tight">{result.glycemicLoad.toFixed(1)}</div>
                </div>
                <div className="text-sm font-semibold mt-1" style={{ color: result.categoryColor }}>{result.category}: {result.categoryDesc}</div>
              </div>
              
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card shadow-sm">
                {[["Input GI", `${gi}`], ["Net Carbs", `${carbs}g`], ["GL Status", result.category.split(" ")[0]]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-lg font-bold">{v}</div>
                  </div>
                ))}
              </div>
              
              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold mb-4">Metabolic Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 2 ? "font-bold text-foreground border-t-2 border-border" : ""}`}>
                      <td className="py-2.5 text-muted-foreground">{r.label}</td>
                      <td className="py-2.5 text-right font-semibold">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold mb-4">Glycemic Load Spectrum</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={result.chartData} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" domain={[0, 40]} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} width={50} />
                    <Tooltip formatter={(v: any, n: any, p: any) => [`${p.payload.min} – ${p.payload.max} GL`, "Range"]} />
                    <ReferenceLine x={result.glycemicLoad > 40 ? 40 : result.glycemicLoad} stroke="#6366f1" strokeWidth={2} strokeDasharray="4 4" label={{ value: `You: ${result.glycemicLoad.toFixed(1)}`, position: "insideTopRight", fontSize: 11, fill: "#6366f1" }} />
                    <Bar dataKey="span" radius={[0, 4, 4, 0]}>{result.chartData.map((e, i) => <Cell key={i} fill={e.color} fillOpacity={0.85} />)}</Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground mt-3 text-center">Lower GL numbers correlate to steadier, healthier blood sugar levels.</p>
              </div>

              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding the Glycemic Index (GI) vs. Glycemic Load (GL)</h2>
            <p>If you are managing diabetes, dealing with insulin resistance, or attempting to lose body fat, you have likely been told to "watch your glycemic index." While this is excellent advice, the Glycemic Index (GI) alone is actually a flawed, incomplete metric. To truly understand how a meal will impact your body, you must calculate the <strong>Glycemic Load (GL)</strong>.</p>
            <p>The <strong>Glycemic Index (GI)</strong> is a laboratory measurement on a scale of 0 to 100 that dictates how quickly the carbohydrates in a specific food break down into glucose and enter your bloodstream. Pure table sugar has a GI of 100. A food with a high GI digests rapidly, causing a massive spike in blood sugar. A food with a low GI digests slowly, providing a steady trickle of energy.</p>
            <p>The problem? <strong>GI completely ignores portion size.</strong> It tells you the <em>speed</em> of the carbohydrate, but not the <em>volume</em> of the carbohydrate you are actually eating.</p>

            <h2>Why You Must Calculate the Glycemic Load</h2>
            <p>The <strong>Glycemic Load (GL)</strong> solves the portion size problem. It combines the speed of the carbohydrate (the GI) with the actual amount of carbohydrate in your specific serving.</p>
            <p>The classic, textbook example of why GL is superior is watermelon. If you look up watermelon in a clinical database, you will see it has a shockingly high Glycemic Index of 72 to 80. On paper, it looks as dangerous for a diabetic as eating a donut. However, watermelon is essentially just flavored water; it is incredibly sparse in actual carbohydrates. A standard cup of diced watermelon only contains about 6 grams of net carbs.</p>
            <p>When you plug those numbers into the Glycemic Load formula—<code>(72 GI × 6g Carbs) ÷ 100</code>—the resulting Glycemic Load is a mere <strong>4.3</strong>. Despite the high GI, the actual impact on your blood sugar is minuscule because the volume of carbohydrates is so low. If you only looked at the GI, you would avoid a perfectly healthy, hydrating fruit.</p>
            <p>Conversely, a dense food like a large bagel might have a lower or moderate GI (e.g., 65), but because it contains a massive 50 grams of carbohydrates, the Glycemic Load spikes to <strong>32.5</strong>, which will heavily impact your blood sugar.</p>

            <h2>How The Calculations Work</h2>
            <p>Calculating your Glycemic Load requires two pieces of data:</p>
            <p><strong>1. The Glycemic Index of the Food:</strong> Because GI is determined by how complex the molecular structure of the food is, you cannot calculate it yourself. It must be tested in a lab on human subjects. You must look this number up in a reputable GI database (such as the official University of Sydney database).</p>
            <p><strong>2. The Net Carbohydrates:</strong> You can find this on the food's nutrition label. You must calculate "Net Carbs" by taking the Total Carbohydrates and subtracting the Dietary Fiber. The human body lacks the enzymes to digest fiber, so it passes through the system without converting to glucose. Therefore, fiber does not contribute to your blood sugar spike.</p>
            <p>The core mathematical formula is simple: <strong>GL = (GI × Net Carbs) ÷ 100</strong>.</p>

            <h2>Interpreting Your Glycemic Load Score</h2>
            <p>Medical professionals and dietitians use a standardized 3-tier bracket system to classify Glycemic Load results.</p>
            
            <h3>Low GL (10 or less)</h3>
            <p>A score of 10 or below is excellent. These foods are slowly digested and absorbed, producing a gentle, gradual rise in blood sugar and insulin levels. This steady energy prevents the "sugar crash" that causes afternoon fatigue, keeps you feeling full longer, and prevents the body from aggressively storing fat. Examples include most non-starchy vegetables, lentils, beans, and small portions of fruit.</p>

            <h3>Medium GL (11 to 19)</h3>
            <p>A score in this range will produce a moderate rise in blood sugar. These foods are perfectly acceptable in a balanced diet, especially if consumed around periods of physical activity where the muscles can quickly absorb the circulating glucose. Examples include a slice of whole-wheat bread, brown rice, or a large apple.</p>

            <h3>High GL (20 or greater)</h3>
            <p>A score of 20 or higher acts as a red flag. These meals flood the bloodstream with glucose faster than the body's cells can utilize it. In response, the pancreas must pump out massive amounts of insulin to clear the toxic glucose from the blood. This insulin spike aggressively forces the excess energy into your fat cells for storage, and the subsequent rapid drop in blood sugar triggers intense hunger cravings shortly after eating. Frequent high GL meals are the primary dietary driver of insulin resistance and Type 2 Diabetes. Examples include large servings of pasta, white rice, sugary cereals, and sodas.</p>

            <h2>Advanced Strategies: Lowering Your Meal's GL</h2>
            <p>The Glycemic Index of a food is tested in absolute isolation—meaning the test subject eats the carbohydrate entirely by itself on an empty stomach. However, nobody eats like that in the real world. You can actively lower the Glycemic Load of a carbohydrate by changing how you eat it.</p>
            <p><strong>Add Fiber, Fat, and Protein:</strong> If you eat a high-GI food (like a white potato) completely by itself, it digests rapidly. If you eat that exact same potato with a piece of steak (protein) and butter (fat), the digestion process in your stomach slows to a crawl. The fat and protein physically delay gastric emptying, which means the carbohydrates are released into the small intestine much more slowly. This blunts the glucose spike, effectively lowering the overall Glycemic Load of the meal.</p>
            <p><strong>Use Acidic Dressings:</strong> Acids slow down carbohydrate digestion. Adding vinegar-based dressings to a salad or squeezing lemon juice over a carbohydrate-heavy meal can noticeably reduce the subsequent blood sugar spike.</p>
            <p><strong>Cool Your Starches:</strong> When you cook and then cool starches like potatoes, rice, or pasta, the molecular structure changes, forming "resistant starch." Resistant starch acts like fiber—your body cannot digest it. Even if you reheat the food later, the resistant starch remains, meaning the meal will have a lower Net Carb count and a lower Glycemic Load than when it was freshly cooked.</p>

            <h2>Who Benefits Most From This Calculator?</h2>
            <p>While everyone benefits from maintaining stable blood sugar, tracking Glycemic Load is absolutely critical for three specific populations:</p>
            <p><strong>1. Diabetics & Pre-diabetics:</strong> For individuals with impaired insulin sensitivity, preventing massive glucose spikes is the primary focus of disease management. Calculating the GL of a meal ensures the carbohydrate load will not overwhelm their compromised insulin response.</p>
            <p><strong>2. Individuals Seeking Fat Loss:</strong> High insulin levels actively block the body from burning stored fat (lipolysis). By keeping meals in the Low or Medium GL range, you keep insulin levels low, allowing your body to access and burn stored body fat for fuel between meals.</p>
            <p><strong>3. Endurance Athletes:</strong> Athletes utilize Glycemic Load strategically. Hours before a race, they consume Low GL meals for sustained, slow-release energy. Immediately after a grueling workout, they intentionally consume High GL meals to rapidly spike insulin and shove glucose back into depleted muscle cells to speed up recovery.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/glycemic-index-calculator" />
          <PopularCalculators exclude="/calculator/glycemic-index-calculator" />
        </div>
      </div>
    </>
  );
}
