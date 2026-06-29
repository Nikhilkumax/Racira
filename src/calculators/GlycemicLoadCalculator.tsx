"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, Apple } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  prefix?: string; suffix?: string; type?: string; [key: string]: any;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none shrink-0">{prefix}</span>}
      <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" {...props} />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const FOODS = [
  { name: "White Rice (1 cup)", gi: 73, carbs: 45 },
  { name: "Brown Rice (1 cup)", gi: 50, carbs: 38 },
  { name: "White Bread (2 slices)", gi: 75, carbs: 26 },
  { name: "Whole Wheat Bread (2 slices)", gi: 57, carbs: 24 },
  { name: "Banana (1 medium)", gi: 51, carbs: 27 },
  { name: "Apple (1 medium)", gi: 36, carbs: 21 },
  { name: "Orange (1 medium)", gi: 43, carbs: 15 },
  { name: "Oatmeal (1 cup cooked)", gi: 55, carbs: 27 },
  { name: "Cornflakes (1 cup)", gi: 81, carbs: 25 },
  { name: "Pasta (1 cup cooked)", gi: 49, carbs: 38 },
  { name: "Sweet Potato (1 medium)", gi: 70, carbs: 27 },
  { name: "Watermelon (1 cup)", gi: 76, carbs: 12 },
  { name: "Lentils (1 cup)", gi: 32, carbs: 40 },
  { name: "Chickpeas (1 cup)", gi: 10, carbs: 45 },
  { name: "Potato (1 medium, boiled)", gi: 78, carbs: 33 },
];

function glCategory(gl: number) {
  if (gl <= 10) return { label: "Low GL", color: "text-emerald-600", bg: "from-emerald-500/10 to-emerald-500/5", border: "border-emerald-500/20" };
  if (gl <= 19) return { label: "Medium GL", color: "text-amber-600", bg: "from-amber-500/10 to-amber-500/5", border: "border-amber-500/20" };
  return { label: "High GL", color: "text-red-600", bg: "from-red-500/10 to-red-500/5", border: "border-red-500/20" };
}

export default function GlycemicLoadCalculator() {
  const [mode, setMode] = useState<"preset" | "custom">("preset");
  const [selectedFood, setSelectedFood] = useState(FOODS[0].name);
  const [servingSize, setServingSize] = useState("1");
  const [customGi, setCustomGi] = useState("72");
  const [customCarbs, setCustomCarbs] = useState("45");
  const [res, setRes] = useState<{ gl: number; gi: number; carbs: number; category: ReturnType<typeof glCategory>; comparison: { food: string; gl: number }[] } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); calc(); }, []);

  const calc = () => {
    let gi: number, carbs: number;
    const serving = parseFloat(servingSize) || 1;

    if (mode === "preset") {
      const food = FOODS.find(f => f.name === selectedFood) || FOODS[0];
      gi = food.gi;
      carbs = food.carbs * serving;
    } else {
      gi = parseFloat(customGi) || 0;
      carbs = (parseFloat(customCarbs) || 0) * serving;
    }

    const gl = Math.round((gi * carbs) / 100 * 10) / 10;
    const category = glCategory(gl);

    const comparison = FOODS.slice(0, 8).map(f => ({
      food: f.name.split(" (")[0],
      gl: Math.round((f.gi * f.carbs * serving) / 100 * 10) / 10,
    }));

    setRes({ gl, gi, carbs, category, comparison });
  };

  const reset = () => { setMode("preset"); setSelectedFood(FOODS[0].name); setServingSize("1"); setCustomGi("72"); setCustomCarbs("45"); };

  const faqs = [
    { question: "What is Glycemic Load (GL)?", answer: "Glycemic Load (GL) measures both the quality (Glycemic Index) and quantity (grams of carbohydrates) of a food's impact on blood sugar. GL = (GI × grams of carbs) ÷ 100. Unlike GI alone, GL accounts for serving size, making it a more practical tool for managing blood sugar." },
    { question: "How does GL differ from GI?", answer: "Glycemic Index (GI) ranks foods by how quickly they raise blood sugar per 100g serving. Glycemic Load adjusts for the actual amount of carbohydrates consumed. For example, watermelon has a high GI (76) but a low GL (4) because a typical serving contains very few carbs." },
    { question: "What are low, medium, and high GL values?", answer: "GL values: Low = 10 or less (safe for blood sugar), Medium = 11–19 (moderate impact), High = 20 or more (significant blood sugar spike). For a full day of eating, a total GL below 80 is considered low-GL diet, 80–120 is medium, and above 120 is high." },
    { question: "Who benefits most from tracking Glycemic Load?", answer: "People with type 2 diabetes, prediabetes, insulin resistance, or polycystic ovary syndrome (PCOS) benefit most. Athletes use GL to time carbohydrate intake around training. It is also useful for anyone managing weight, energy levels, or hunger control." },
    { question: "Can I eat high-GI foods on a low-GL diet?", answer: "Yes — serving size is everything. Watermelon has a high GI but you would need to eat over a kilogram to get a high GL. Conversely, eating a large bowl of even moderate-GI foods like oatmeal can produce a high overall GL. Focus on total carbohydrates × GI, not GI alone." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Glycemic Load Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Glycemic Load (GL) Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Food Glycemic Load</h2>
            <div className="flex gap-2">
              {(["preset", "custom"] as const).map(m => (
                <button key={m} type="button" onClick={() => setMode(m)} className={`flex-1 h-9 rounded-md text-sm font-semibold transition-all ${mode === m ? "bg-primary text-primary-foreground shadow-sm" : "border border-border bg-background text-muted-foreground hover:bg-secondary"}`}>{m === "preset" ? "Food Presets" : "Custom Entry"}</button>
              ))}
            </div>
            {mode === "preset" ? (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-foreground">Select Food</label>
                <select value={selectedFood} onChange={e => setSelectedFood(e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                  {FOODS.map(f => <option key={f.name} value={f.name}>{f.name} (GI: {f.gi})</option>)}
                </select>
              </div>
            ) : (
              <>
                <CompactInput id="gi" label="Glycemic Index (GI)" value={customGi} onChange={setCustomGi} min="0" max="100" />
                <CompactInput id="carbs" label="Net Carbs per Serving" value={customCarbs} onChange={setCustomCarbs} suffix="g" />
              </>
            )}
            <CompactInput id="serving" label="Number of Servings" value={servingSize} onChange={setServingSize} min="0.25" step="0.25" />
            <div className="flex gap-2.5 mt-2">
              <button type="button" onClick={calc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {res && (
              <>
                <>

              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h2 className="text-2xl font-bold mb-3">Glycemic Load Result</h2>
                  <Apple className="h-5 w-5 text-primary" />
                </div>
                <div className={`bg-gradient-to-br ${res.category.bg} border ${res.category.border} rounded-xl p-5 text-center`}>
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Glycemic Load</div>
                  <div className="text-5xl font-extrabold text-foreground mb-1 tracking-tight">{res.gl}</div>
                  <div className={`text-sm font-bold ${res.category.color}`}>{res.category.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">Low ≤10 | Medium 11–19 | High ≥20</div>
                </div>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left text-sm">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-2.5 pl-3">Detail</th><th className="p-2.5 pr-3 text-right">Value</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { label: "Glycemic Index (GI)", value: res.gi.toString() },
                        { label: "Net Carbohydrates", value: `${res.carbs.toFixed(1)} g` },
                        { label: "Glycemic Load (GL)", value: res.gl.toFixed(1), bold: true },
                        { label: "Category", value: res.category.label },
                        { label: "Formula", value: `(${res.gi} × ${res.carbs.toFixed(1)}) ÷ 100` },
                      ].map(r => (
                        <tr key={r.label} className={`hover:bg-secondary/20 ${r.bold ? "font-bold bg-secondary/30" : ""}`}>
                          <td className="p-2.5 pl-3 font-semibold text-muted-foreground">{r.label}</td>
                          <td className="p-2.5 pr-3 text-right font-bold text-foreground">{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {mounted && (<>

                  <div className="p-4 rounded-xl border border-border bg-card">
                    <h3 className="text-sm font-bold text-foreground mb-3">GL Comparison by Food</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={res.comparison} margin={{ top: 4, right: 8, left: 0, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="food" tick={{ fontSize: 9 }} angle={-35} textAnchor="end" interval={0} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip formatter={(v: any) => [Number(v).toFixed(1), "GL"]} />
                        <ReferenceLine y={10} stroke="#10b981" strokeDasharray="4 4" label={{ value: "Low GL", position: "right", fontSize: 9, fill: "#10b981" }} />
                        <ReferenceLine y={20} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "High GL", position: "right", fontSize: 9, fill: "#ef4444" }} />
                        <Bar dataKey="gl" fill="hsl(var(--primary) / 0.7)" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                
</>)}
              </div>
            
</>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding Glycemic Load</h2>
            <p>Glycemic Load (GL) is a nutritional measure that combines the Glycemic Index (GI) of a food with the actual amount of carbohydrates consumed. While GI ranks how rapidly a carbohydrate food raises blood glucose compared to pure glucose, it doesn't account for portion size. GL corrects this limitation by incorporating both the quality and quantity of carbohydrates in a meal or food item.</p>
            <p>The formula is simple: GL = (GI × grams of net carbohydrates) ÷ 100. A GL of 10 or below is low, 11–19 is medium, and 20 or above is high. When looking at an entire day's eating, most nutrition experts recommend keeping total daily GL below 80 for optimal blood sugar management.</p>

            <h2>Practical Application</h2>
            <p>Glycemic Load is most useful for people managing diabetes, insulin resistance, or metabolic syndrome, as well as anyone focused on sustained energy, weight management, or athletic performance. High-GL diets are associated with increased risk of type 2 diabetes, cardiovascular disease, and obesity. Low-GL eating patterns have been shown to improve insulin sensitivity, reduce inflammation, and support healthy weight maintenance.</p>
            <p>A key insight from GL research is that many high-GI foods can fit into a healthy diet if consumed in moderate portions. Conversely, eating large quantities of even moderate-GI foods can produce a substantial glycemic response. This is why GL is considered a superior practical tool compared to GI alone for everyday food decision-making.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/glycemic-load-calculator" />
          <PopularCalculators exclude="/calculator/glycemic-load-calculator" />
        </div>
      </div>
    </>
  );
}
