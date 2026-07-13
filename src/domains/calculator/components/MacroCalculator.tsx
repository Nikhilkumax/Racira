"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

interface CarbResult { totalCalories: number; proteinCals: number; carbCals: number; fatCals: number; proteinG: number; carbG: number; fatG: number; goal: string; }
const DEFAULTS = { calories: "2200", proteinPct: "30", carbPct: "40", fatPct: "30" };

function calculate(d: typeof DEFAULTS): CarbResult {
  const total = parseFloat(d.calories)||0;
  const pp = parseFloat(d.proteinPct)||0, cp = parseFloat(d.carbPct)||0, fp = parseFloat(d.fatPct)||0;
  const sum = pp + cp + fp;
  const pAdj = sum > 0 ? pp/sum : 0, cAdj = sum > 0 ? cp/sum : 0, fAdj = sum > 0 ? fp/sum : 0;
  const proteinCals = total * pAdj, carbCals = total * cAdj, fatCals = total * fAdj;
  return {
    totalCalories: total, proteinCals: Math.round(proteinCals), carbCals: Math.round(carbCals), fatCals: Math.round(fatCals),
    proteinG: Math.round(proteinCals/4), carbG: Math.round(carbCals/4), fatG: Math.round(fatCals/9),
    goal: cp >= 50 ? "High-Carb / Endurance" : cp <= 20 ? "Low-Carb / Ketogenic" : pp >= 35 ? "High-Protein / Recomp" : "Balanced",
  };
}

export default function MacroCalculator() {
  const [f, setF] = useState(DEFAULTS);
  const [r, setR] = useState<CarbResult>(() => calculate(DEFAULTS));
  const set = (k: keyof typeof DEFAULTS) => (v: string) => setF(p => ({ ...p, [k]: v }));
  const calc = () => setR(calculate(f));
  const reset = () => { setF(DEFAULTS); setR(calculate(DEFAULTS)); };

  const macroData = [
    { name: "Protein", grams: r.proteinG, cals: r.proteinCals, fill: "hsl(var(--primary))" },
    { name: "Carbs", grams: r.carbG, cals: r.carbCals, fill: "#10b981" },
    { name: "Fat", grams: r.fatG, cals: r.fatCals, fill: "#f59e0b" },
  ];

  const presets = [
    { name: "Balanced", p: 25, c: 45, f: 30 },
    { name: "High-Protein", p: 40, c: 35, f: 25 },
    { name: "Low-Carb", p: 35, c: 20, f: 45 },
    { name: "Keto", p: 25, c: 5, f: 70 },
    { name: "Endurance", p: 20, c: 55, f: 25 },
  ];

  const faqs = [
    { question: "What is a macro calculator?", answer: "A macro calculator determines how many grams of protein, carbohydrates, and fat you should eat daily based on your total calorie goal and chosen macro split. Macros (macronutrients) are the three primary energy-providing nutrients: protein (4 kcal/g), carbohydrates (4 kcal/g), and fat (9 kcal/g)." },
    { question: "What macro ratio should I use to lose weight?", answer: "For fat loss: High-protein ratios (35–40% protein) preserve muscle during calorie deficit. 30P/35C/35F or 35P/35C/30F are popular fat loss splits. Research shows protein above 1.6g/kg is most important for body recomposition — the protein percentage matters less than the absolute gram amount." },
    { question: "What macros are best for building muscle?", answer: "For muscle gain: Protein 30–35% of calories (at least 1.6–2.2g/kg bodyweight). Carbohydrates 40–50% (fuel training and glycogen replenishment). Fat 20–30% (testosterone production and fat-soluble vitamins). Total calorie surplus of 200–500 kcal above maintenance is required for muscle growth." },
    { question: "What is the ketogenic macro ratio?", answer: "Classic ketogenic diet: Fat 70–75%, Protein 20–25%, Carbs 5% (typically <50g total, <25g net carbs). This ratio induces nutritional ketosis — a metabolic state where fat is the primary fuel. Modified keto allows higher protein (30%) with lower fat (65%) and the same carb restriction." },
    { question: "Does it matter when I eat my macros?", answer: "Meal timing is secondary to total daily intake for most people. However, consuming 20–40g protein within 2 hours post-workout maximizes muscle protein synthesis. Carbohydrates before and after training are optimal for performance and glycogen replenishment. Total daily macro goals are the primary driver of results." },
    { question: "How do I track macros?", answer: "Use a food tracking app (MyFitnessPal, Cronometer, MacroFactor) to log all food and monitor macro targets. Weigh food with a kitchen scale for accuracy — volume measurements are 20–40% less accurate for calorie-dense foods. Track consistently for at least 4 weeks before evaluating results and adjusting targets." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Macro Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Macro Calculator — Protein, Carbs & Fat</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 border border-border bg-card shadow-sm">
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-1">Daily Calorie Goal (kcal)</label>
              <div className="flex items-center rounded-md border border-input bg-background h-9 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
                <input type="number" value={f.calories} onChange={e => set("calories")(e.target.value)} className="w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground" />
                <span className="pr-3 text-sm text-muted-foreground">kcal</span>
              </div>
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Macro Split (%)</p>
            {([
              { label: "Protein %", key: "proteinPct" },
              { label: "Carbohydrates %", key: "carbPct" },
              { label: "Fat %", key: "fatPct" },
            ] as const).map(({ label, key }) => (
              <div key={key} className="flex flex-col">
                <label className="text-sm font-semibold mb-1">{label}</label>
                <div className="flex items-center rounded-md border border-input bg-background h-9 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
                  <input type="number" value={f[key]} onChange={e => set(key)(e.target.value)} className="w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground" />
                  <span className="pr-3 text-sm text-muted-foreground">%</span>
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground text-right">Total: {(parseFloat(f.proteinPct)||0)+(parseFloat(f.carbPct)||0)+(parseFloat(f.fatPct)||0)}%</p>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide -mb-1">Quick Presets</p>
            <div className="flex flex-wrap gap-2">
              {presets.map(p => (
                <button key={p.name} onClick={() => { setF(prev => ({ ...prev, proteinPct: p.p.toString(), carbPct: p.c.toString(), fatPct: p.f.toString() })); setR(calculate({ ...f, proteinPct: p.p.toString(), carbPct: p.c.toString(), fatPct: p.f.toString() })); }} className="px-2.5 py-1 rounded-full border border-border text-xs font-semibold hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">{p.name} ({p.p}/{p.c}/{p.f})</button>
              ))}
            </div>
            <div className="flex gap-2 mt-1">
              <button onClick={calc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 transition-all">Calculate</button>
              <button onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-9 flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
              <div className="text-xs font-bold text-primary uppercase tracking-wide mb-1">Daily Target</div>
              <div className="text-4xl font-extrabold text-foreground">{r.totalCalories.toLocaleString()} kcal</div>
              <div className="text-sm text-muted-foreground mt-1">{r.goal}</div>
            </div>
            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="grid grid-cols-3 divide-x divide-border">
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-0.5">Protein</div><div className="font-extrabold text-xl text-primary">{r.proteinG}g</div><div className="text-xs text-muted-foreground">{r.proteinCals} kcal</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-0.5">Carbs</div><div className="font-extrabold text-xl text-emerald-600">{r.carbG}g</div><div className="text-xs text-muted-foreground">{r.carbCals} kcal</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-0.5">Fat</div><div className="font-extrabold text-xl text-amber-600">{r.fatG}g</div><div className="text-xs text-muted-foreground">{r.fatCals} kcal</div></div>
              </div>
            </div>
            <div className="card-calculator !p-4 border border-border bg-card shadow-sm">
              <h3 className="font-semibold text-sm mb-3">Calorie Distribution by Macro</h3>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={macroData} barSize={55}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} unit=" cal" />
                    <RTooltip formatter={(v: number, n: string) => [n === "grams" ? `${v}g` : `${v} kcal`, n]} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                    <ReferenceLine y={r.totalCalories / 3} stroke="#94a3b8" strokeDasharray="4 2" label={{ value: "Equal split", fontSize: 9 }} />
                    <Bar dataKey="cals" radius={[4,4,0,0]}>
                      {macroData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="bg-secondary/50 px-4 py-2.5 border-b border-border/50"><h3 className="font-bold text-sm">Per Meal Targets (3 meals/day)</h3></div>
              {[
                { label: "Protein per meal", val: `${Math.round(r.proteinG/3)}g` },
                { label: "Carbs per meal", val: `${Math.round(r.carbG/3)}g` },
                { label: "Fat per meal", val: `${Math.round(r.fatG/3)}g` },
                { label: "Calories per meal", val: `${Math.round(r.totalCalories/3)} kcal`, bold: true },
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-2 px-4 py-2.5 border-b border-border/30 last:border-0 hover:bg-secondary/20">
                  <span className="text-muted-foreground text-sm">{row.label}</span>
                  <span className={`text-right text-sm ${row.bold ? "font-bold text-foreground" : ""}`}>{row.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Macro Calculator?</h2>
            <p>A macro calculator converts your total daily calorie goal into specific gram targets for protein, carbohydrates, and fat based on your chosen percentage split. Macronutrients are the three classes of nutrients that provide energy: protein and carbohydrates each provide 4 kcal per gram; fat provides 9 kcal per gram. Tracking macros (not just calories) allows precision nutrition for specific body composition goals.</p>
            <h2 className="text-2xl font-bold mb-3">How to Choose Your Macro Split</h2>
            <p><strong>For Fat Loss:</strong> High protein (35–40%) to preserve muscle during deficit. Moderate carbs (30–35%) for training fuel. Lower fat (25–30%). <strong>For Muscle Building:</strong> Moderate protein (25–30%), high carbs (45–55%) for training performance and recovery, moderate fat (20–25%). <strong>For General Health:</strong> Balanced macros: 25–30% protein, 45–50% carbs, 25–30% fat — aligns with most dietary guidelines. <strong>Ketogenic:</strong> Very low carb (5%), high fat (70%), moderate protein (25%) — induces fat-burning ketosis.</p>
            <h2 className="text-2xl font-bold mb-3">Protein: The Most Important Macro</h2>
            <p>Protein is uniquely important because it is the only macronutrient that directly supports muscle synthesis and preservation. Minimum recommendation: 0.8g/kg (sedentary). For body composition goals: 1.6–2.2g/kg of bodyweight. High protein intake increases satiety (reduces hunger), has the highest thermic effect (20–30% of calories burned in digestion vs. 5–10% for carbs/fat), and protects muscle mass during calorie restriction. Prioritize hitting protein targets; fill remaining calories with carbs and fat based on preference and training demands.</p>
            <h2 className="text-2xl font-bold mb-3">Carbohydrates and Exercise Performance</h2>
            <p>Carbohydrates are the primary fuel for moderate-to-high intensity exercise. Muscle glycogen (stored carbs) is depleted within 60–90 minutes of intense training. Athletes and regular gym-goers perform better with adequate carbohydrate intake (5–7g/kg for moderate exercise; 7–10g/kg for endurance). Low-carb approaches can work for fat loss but may impair performance at high exercise intensities. Match carb intake to training volume and intensity.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/macro-calculator" />
          <PopularCalculators exclude="/calculator/macro-calculator" />
        </div>
      </div>
    </>
  );
}
