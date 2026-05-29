"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

const ACTIVITY_LEVELS = [
  { val: "bmr",       label: "Basal Metabolic Rate (BMR)", multiplier: 1.0 },
  { val: "sedentary", label: "Sedentary: little or no exercise", multiplier: 1.2 },
  { val: "light",     label: "Light: exercise 1–3 times/week", multiplier: 1.375 },
  { val: "moderate",  label: "Moderate: exercise 4–5 times/week", multiplier: 1.55 },
  { val: "active",    label: "Active: daily exercise or intense 3–4×/week", multiplier: 1.725 },
  { val: "very",      label: "Very Active: intense exercise 6–7×/week", multiplier: 1.9 },
  { val: "extra",     label: "Extra Active: very intense daily, or physical job", multiplier: 2.0 },
];

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

const CalorieCalculator = () => {
  // Unit system
  const [unitSystem, setUnitSystem] = useState<"metric" | "us">("metric");
  // Inputs
  const [age, setAge] = useState("25");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [heightCm, setHeightCm] = useState("180");
  const [heightFt, setHeightFt] = useState("5");
  const [heightIn, setHeightIn] = useState("10");
  const [weightKg, setWeightKg] = useState("65");
  const [weightLbs, setWeightLbs] = useState("165");
  const [activity, setActivity] = useState("moderate");
  // Advanced
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [resultUnit, setResultUnit] = useState<"cal" | "kj">("cal");
  const [formula, setFormula] = useState<"mifflin" | "harris" | "katch">("mifflin");
  const [bodyFat, setBodyFat] = useState("20");
  // Result
  const [result, setResult] = useState<any>(null);

  const [error, setError] = useState("");

  const runCalc = (
    sys = unitSystem, ag = age, gen = gender,
    hcm = heightCm, hft = heightFt, hin = heightIn,
    wkg = weightKg, wlbs = weightLbs, act = activity,
    ru = resultUnit, fm = formula, bf = bodyFat
  ) => {
    setError("");
    const nAge = parseInt(ag);
    const nBf = parseFloat(bf);
    let W = sys === "metric" ? parseFloat(wkg) : parseFloat(wlbs) * 0.453592;
    let H = sys === "metric" ? parseFloat(hcm) : parseFloat(hft) * 30.48 + parseFloat(hin) * 2.54;
    if (isNaN(nAge) || nAge < 15 || nAge > 80) { setError("Age must be between 15 and 80."); return; }
    if (isNaN(W) || W <= 0) { setError("Please enter a valid weight."); return; }
    if (isNaN(H) || H <= 0) { setError("Please enter a valid height."); return; }
    let bmr = 0;
    if (fm === "mifflin") {
      bmr = gen === "male" ? 10*W + 6.25*H - 5*nAge + 5 : 10*W + 6.25*H - 5*nAge - 161;
    } else if (fm === "harris") {
      bmr = gen === "male" ? 13.397*W + 4.799*H - 5.677*nAge + 88.362 : 9.247*W + 3.098*H - 4.330*nAge + 447.593;
    } else if (fm === "katch") {
      if (isNaN(nBf) || nBf <= 0 || nBf >= 100) { setError("Body fat % must be between 1–99."); return; }
      bmr = 370 + 21.6 * W * (1 - nBf / 100);
    }
    if (bmr <= 0) return;
    const actObj = ACTIVITY_LEVELS.find(a => a.val === act) || ACTIVITY_LEVELS[3];
    const tdee = bmr * actObj.multiplier;
    const factor = ru === "kj" ? 4.184 : 1;
    const unit = ru === "kj" ? "kJ" : "Cal";
    const goals = [
      { label: "Extreme Loss (2 lb/wk)", cal: tdee - 1000, color: "#ef4444", type: "loss" },
      { label: "Weight Loss (1 lb/wk)",  cal: tdee - 500,  color: "#f97316", type: "loss" },
      { label: "Mild Loss (0.5 lb/wk)",  cal: tdee - 250,  color: "#f59e0b", type: "loss" },
      { label: "Maintain Weight",         cal: tdee,         color: "#3b82f6", type: "maintain" },
      { label: "Mild Gain (0.5 lb/wk)",  cal: tdee + 250,  color: "#10b981", type: "gain" },
      { label: "Weight Gain (1 lb/wk)",  cal: tdee + 500,  color: "#6366f1", type: "gain" },
      { label: "Fast Gain (2 lb/wk)",    cal: tdee + 1000, color: "#8b5cf6", type: "gain" },
    ];
    const chartData = goals.map(g => ({ label: g.label.split(" (")[0], value: Math.round(Math.max(0, g.cal) * factor), color: g.color }));
    const allLevels = ACTIVITY_LEVELS.map(l => ({ label: l.label.split(":")[0], value: Math.round(bmr * l.multiplier * factor) }));
    setResult({ bmr: bmr * factor, tdee: tdee * factor, goals: goals.map(g => ({ ...g, cal: g.cal * factor })), chartData, allLevels, unit, actObj });
  };

  const calculate = () => runCalc();

  useEffect(() => { runCalc(); }, []);

  const reset = () => {
    setUnitSystem("metric"); setAge("25"); setGender("male");
    setHeightCm("180"); setHeightFt("5"); setHeightIn("10");
    setWeightKg("65"); setWeightLbs("165"); setActivity("moderate");
    setResultUnit("cal"); setFormula("mifflin"); setBodyFat("20"); setError("");
    runCalc("metric","25","male","180","5","10","65","165","moderate","cal","mifflin","20");
  };

  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const wrap = "flex items-center rounded-md border border-input bg-background h-9 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const suf = "pr-3 text-sm text-muted-foreground shrink-0";
  const handleKey = (e: React.KeyboardEvent) => { if (e.key === "Enter") calculate(); };

  const faqs = [
    { question: "Is the Losertown calorie calculator accurate?", answer: "Yes — the Losertown calorie calculator uses the clinically validated Mifflin-St Jeor formula, which estimates TDEE within 10% for ~82% of people in controlled studies. For athletes, switching to Katch-McArdle (with body fat %) improves accuracy further. No online tool matches a metabolic chamber test, but the Losertown calorie calculator is as accurate as any non-invasive method available." },
    { question: "How many calories should I burn daily to lose weight?", answer: "A 500 Cal/day deficit produces ~1 lb/week of fat loss (3,500 Cal ≈ 1 lb fat). For 0.5 lb/week, use a 250 Cal deficit. The maximum safe deficit is ~1,000 Cal/day (~2 lb/week). Never go below 1,200 Cal/day (women) or 1,500 Cal/day (men) without medical supervision. Use the Losertown calorie calculator to find your TDEE, then subtract your target deficit." },
    { question: "Does sauna burn calories?", answer: "Yes. A 30-minute traditional sauna session burns approximately 100–200 calories above resting rate. The infrared sauna calories calculator estimates slightly more (150–250 Cal/session) due to deeper heat penetration. However, most immediate post-sauna weight loss is water weight, not fat. Use the calories burned in sauna calculator alongside your Losertown calorie calculator total for a complete daily picture." },
    { question: "What is the best calorie calculator online?", answer: "The best online calorie calculators use Mifflin-St Jeor for general users and Katch-McArdle for athletes. Our Losertown calorie calculator supports all three BMR formulas, US and Metric units, seven calorie goal levels, and Calories/Kilojoules output — making it one of the most comprehensive free tools available. No login required." },
    { question: "How does a calorie deficit work?", answer: "A calorie deficit means you consume fewer calories than you burn. Since 1 lb of fat stores ~3,500 Calories, a daily deficit of 500 Cal creates a 3,500 Cal weekly deficit — resulting in approximately 1 lb of fat loss per week. Use your TDEE from the Losertown calorie calculator as the baseline, then subtract your chosen deficit target from the calorie goals table." },
    { question: "What is BMR and how is it calculated?", answer: "Basal Metabolic Rate (BMR) is the calories your body burns at complete rest to maintain vital functions — breathing, circulation, cell repair. Mifflin-St Jeor (male): BMR = 10W + 6.25H − 5A + 5. Female: BMR = 10W + 6.25H − 5A − 161. W = weight (kg), H = height (cm), A = age (years). BMR typically accounts for 60–75% of total daily calorie burn." },
    { question: "What is the difference between the deskcycle calorie calculator and TDEE?", answer: "The deskcycle calorie calculator estimates calories burned during under-desk pedaling sessions (typically 150–300 Cal/hour). TDEE (from the Losertown calorie calculator) estimates your total all-day calorie burn. To incorporate DeskCycle into your TDEE, either add session calories manually or upgrade your activity multiplier from Sedentary to Light — the latter approach is more accurate for consistent daily DeskCycle use." },
    { question: "How does pickleball affect my calorie calculations?", answer: "The pickleball calories burned calculator estimates 400–600 Cal/hour for recreational play and 600–700 Cal/hour for competitive singles. Regular pickleball (3–4 sessions/week) qualifies as Light to Moderate activity in the Losertown calorie calculator, pushing your activity multiplier from 1.2 to 1.375–1.55 and increasing TDEE by 200–400 Cal/day compared to a sedentary baseline." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Losertown Calorie Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Losertown Calorie Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* LEFT */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">


            {/* Unit tabs */}
            <div className="flex rounded-md border border-input overflow-hidden h-9">
              {(["metric","us"] as const).map((u,i)=>(
                <button key={u} type="button" onClick={()=>setUnitSystem(u)}
                  className={`flex-1 text-sm font-semibold transition-colors ${unitSystem===u?"bg-primary text-primary-foreground":"bg-secondary text-muted-foreground hover:bg-secondary/80"} ${i>0?"border-l border-input":""}` }>
                  {u==="metric"?"Metric":"US Units"}
                </button>
              ))}
            </div>

            {error&&<div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-1.5">{error}</div>}

            {/* Age + Gender */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-foreground mb-1">Age <span className="text-xs font-normal text-muted-foreground">(15–80)</span></label>
                <div className={wrap}>
                  <input type="number" value={age} onChange={e=>setAge(e.target.value)} onKeyDown={handleKey} min={15} max={80} className={ci}/>
                  <span className={suf}>yrs</span>
                </div>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-foreground mb-1">Gender</label>
                <div className="flex rounded-md border border-input overflow-hidden h-9">
                  {(["male","female"] as const).map((g,i)=>(
                    <button key={g} type="button" onClick={()=>setGender(g)}
                      className={`flex-1 text-sm font-semibold capitalize transition-colors ${gender===g?"bg-primary text-primary-foreground":"bg-secondary text-muted-foreground hover:bg-secondary/80"} ${i>0?"border-l border-input":""}` }>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Height + Weight */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-foreground mb-1">Height</label>
                {unitSystem==="metric"?(
                  <div className={wrap}>
                    <input type="number" value={heightCm} onChange={e=>setHeightCm(e.target.value)} onKeyDown={handleKey} className={ci}/>
                    <span className={suf}>cm</span>
                  </div>
                ):(
                  <div className="flex gap-1.5">
                    <div className={wrap+" flex-1"}>
                      <input type="number" value={heightFt} onChange={e=>setHeightFt(e.target.value)} onKeyDown={handleKey} className={ci}/>
                      <span className={suf}>ft</span>
                    </div>
                    <div className={wrap+" flex-1"}>
                      <input type="number" value={heightIn} onChange={e=>setHeightIn(e.target.value)} onKeyDown={handleKey} className={ci}/>
                      <span className={suf}>in</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-foreground mb-1">Weight</label>
                <div className={wrap}>
                  {unitSystem==="metric"?(
                    <><input type="number" value={weightKg} onChange={e=>setWeightKg(e.target.value)} onKeyDown={handleKey} className={ci}/><span className={suf}>kg</span></>
                  ):(
                    <><input type="number" value={weightLbs} onChange={e=>setWeightLbs(e.target.value)} onKeyDown={handleKey} className={ci}/><span className={suf}>lbs</span></>
                  )}
                </div>
              </div>
            </div>

            {/* Activity */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-foreground mb-1">Activity Level</label>
              <select value={activity} onChange={e=>setActivity(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 text-foreground">
                {ACTIVITY_LEVELS.map(l=>(<option key={l.val} value={l.val}>{l.label}</option>))}
              </select>
            </div>

            {/* Advanced — text link like Mortgage */}
            <div>
              <button type="button" onClick={()=>setShowAdvanced(v=>!v)}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced?"rotate-180":""}`}/>
              </button>
              {showAdvanced&&(
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div className="col-span-2">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Results Unit</div>
                    <div className="flex gap-4">
                      {([["cal","Calories"],["kj","Kilojoules"]] as const).map(([v,l])=>(
                        <label key={v} className="flex items-center gap-1.5 text-sm cursor-pointer">
                          <input type="radio" className="w-4 h-4 accent-primary" checked={resultUnit===v} onChange={()=>setResultUnit(v)}/>{l}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">BMR Formula</div>
                    <div className="flex flex-col gap-1.5">
                      {([["mifflin","Mifflin St Jeor"],["harris","Revised Harris-Benedict"],["katch","Katch-McArdle"]] as const).map(([v,l])=>(
                        <label key={v} className="flex items-center gap-1.5 text-sm cursor-pointer">
                          <input type="radio" className="w-4 h-4 accent-primary" checked={formula===v} onChange={()=>setFormula(v)}/>{l}
                        </label>
                      ))}
                    </div>
                    {formula==="katch"&&(
                      <div className="flex items-center gap-2 mt-2.5">
                        <label className="text-sm font-medium whitespace-nowrap">Body Fat:</label>
                        <div className={wrap+" w-24"}>
                          <input type="number" value={bodyFat} onChange={e=>setBodyFat(e.target.value)} min={1} max={60} className={ci}/>
                          <span className={suf}>%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-2.5 mt-2.5">
              <button type="button" onClick={calculate}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-9 text-base transition-all active:scale-[0.98] shadow-sm">
                <Calculator className="h-4 w-4"/> Calculate
              </button>
              <button type="button" onClick={reset}
                className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-9 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4"/>
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-3">
            {result&&(
              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">


                {/* TDEE hero */}
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Maintenance Calories (TDEE)</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{fmt(result.tdee)} {result.unit}</div>
                  <div className="text-sm text-muted-foreground font-medium">BMR {fmt(result.bmr)} {result.unit} × {result.actObj.multiplier} — {result.actObj.label.split(":")[0]}</div>
                </div>

                {/* Goals table */}
                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-2.5 pl-3">Goal</th>
                      <th className="p-2.5 text-right">Daily {result.unit}</th>
                      <th className="p-2.5 pr-3 text-right">Weekly Δ</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50">
                      {result.goals.map((g:any,i:number)=>(
                        <tr key={i} className={`hover:bg-secondary/20 transition-colors ${g.type==="maintain"?"font-bold bg-secondary/30 text-foreground border-t border-border":"text-muted-foreground"}`}>
                          <td className="p-2.5 pl-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor:g.color}}/>
                            <span className="font-semibold text-foreground text-xs">{g.label}</span>
                          </td>
                          <td className="p-2.5 text-right text-foreground font-semibold">{g.cal>0?fmt(g.cal):"—"}</td>
                          <td className="p-2.5 pr-3 text-right text-xs">{g.type==="loss"?"-":"+"}{g.type==="maintain"?"0":(g.type==="loss"?fmt(Math.abs(g.cal-result.tdee)):fmt(g.cal-result.tdee))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Chart */}
                <div>
                  <div className="text-sm font-semibold text-foreground mb-2">Calorie Goals Chart ({result.unit}/day)</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={result.chartData} margin={{top:4,right:10,left:0,bottom:55}}>
                      <XAxis dataKey="label" tick={{fontSize:8}} angle={-30} textAnchor="end" interval={0}/>
                      <YAxis tick={{fontSize:10}}/>
                      <Tooltip formatter={(v:any)=>[`${Number(v).toLocaleString()} ${result.unit}`,""]}/>
                      <ReferenceLine y={Math.round(result.tdee)} stroke="#3b82f6" strokeDasharray="4 2"/>
                      <Bar dataKey="value" radius={[4,4,0,0]}>
                        {result.chartData.map((e:any,i:number)=>(<Cell key={i} fill={e.color}/>))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Activity breakdown */}
                <div>
                  <div className="text-sm font-semibold text-foreground mb-2">Calories by Activity Level</div>
                  <table className="w-full text-sm"><tbody>
                    {result.allLevels.map((l:any,i:number)=>(
                      <tr key={i} className="border-b border-border/50 last:border-0">
                        <td className="py-1.5 text-muted-foreground">{l.label}</td>
                        <td className="text-right font-medium text-foreground">{l.value.toLocaleString()} {result.unit}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto mt-10">
          {/* JSON-LD: FAQ + BreadcrumbList schema */}
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "BreadcrumbList",
                "itemListElement": [
                  { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://racira.com" },
                  { "@type": "ListItem", "position": 2, "name": "Calculators", "item": "https://racira.com/calculator" },
                  { "@type": "ListItem", "position": 3, "name": "Losertown Calorie Calculator", "item": "https://racira.com/calculator/calorie-calculator" },
                ],
              },
              {
                "@type": "FAQPage",
                "mainEntity": [
                  { "@type": "Question", "name": "Is the Losertown calorie calculator accurate?", "acceptedAnswer": { "@type": "Answer", "text": "The Losertown calorie calculator uses the same clinically validated Mifflin-St Jeor formula as top calorie tools. It estimates within 10% of actual TDEE for ~82% of people. For best accuracy, use Katch-McArdle if you know your body fat percentage." } },
                  { "@type": "Question", "name": "How many calories should I burn daily to lose weight?", "acceptedAnswer": { "@type": "Answer", "text": "A 500 Cal/day deficit produces ~1 lb/week weight loss. For 0.5 lb/week, aim for a 250 Cal/day deficit. Never exceed a 1,000 Cal/day deficit without medical supervision." } },
                  { "@type": "Question", "name": "Does sauna burn calories?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. A 30-minute sauna session burns approximately 100–200 extra calories above resting rate. Infrared saunas may burn slightly more. Most of the immediate weight loss is water, not fat." } },
                  { "@type": "Question", "name": "What is the best calorie calculator online?", "acceptedAnswer": { "@type": "Answer", "text": "The best calorie calculators use Mifflin-St Jeor for general users and Katch-McArdle for athletes. Our Losertown calorie calculator supports all three BMR formulas, US and Metric units, and outputs results in both Calories and Kilojoules." } },
                  { "@type": "Question", "name": "How does a calorie deficit work?", "acceptedAnswer": { "@type": "Answer", "text": "A calorie deficit means burning more calories than you consume. 3,500 Calories = ~1 lb of fat. A daily deficit of 500 Cal creates a 3,500 Cal weekly deficit, resulting in approximately 1 lb of fat loss per week." } },
                ],
              },
            ],
          }) }} />

          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
            <h2>What Is the Losertown Calorie Calculator?</h2>
            <p>The <strong>Losertown calorie calculator</strong> is a free, science-backed tool that estimates how many calories you need each day to lose weight, maintain your current weight, or build muscle. It calculates your <strong>Basal Metabolic Rate (BMR)</strong> — the energy your body burns at complete rest — then multiplies it by an activity factor to produce your Total Daily Energy Expenditure (TDEE). Pre-filled with a 25-year-old male, 180 cm, 65 kg, moderate activity: TDEE ≈ 2,510 Cal/day.</p>
            <p>Unlike generic "2,000 Cal/day" guidance, the <strong>Losertown calculator calorie</strong> approach gives you a personalized target based on your actual body and lifestyle. Whether you're cutting, bulking, or just trying to understand your energy balance, this tool gives you the numbers you need in seconds — in Calories or Kilojoules, Metric or US units.</p>

            <h2>How the Losertown Calorie Calculator Works</h2>
            <p>The <strong>Losertown calorie calculator</strong> uses a two-step formula. First, it calculates your BMR — the calories burned just staying alive (breathing, circulation, organ function). Three validated formulas are supported:</p>
            <ul>
              <li><strong>Mifflin-St Jeor (1990):</strong> Male BMR = 10W + 6.25H − 5A + 5. Female BMR = 10W + 6.25H − 5A − 161. Most accurate for the general population.</li>
              <li><strong>Revised Harris-Benedict (1984):</strong> A slightly older formula that tends to overestimate BMR by ~5%. Still widely used in clinical settings.</li>
              <li><strong>Katch-McArdle:</strong> BMR = 370 + 21.6 × LBM (kg). Uses lean body mass — most accurate for athletes who know their body fat percentage.</li>
            </ul>
            <p>Second, your BMR is multiplied by an activity factor ranging from 1.2 (sedentary) to 2.0 (extra active) to produce your TDEE. The result is your maintenance calorie level — eat below it to lose weight, above it to gain.</p>

            <h2>How Accurate Is the Losertown Calorie Calculator?</h2>
            <p>Yes — within the expected range of any population-level formula. The Mifflin-St Jeor equation (the default in our <strong>Losertown calorie calculator</strong>) estimates TDEE within 10% for ~82% of tested subjects in controlled studies. That's as accurate as any non-invasive method gets without metabolic chamber testing.</p>
            <p>Where variance creeps in: individual metabolic differences, hormonal factors, gut microbiome, and muscle-to-fat ratio. If the calculator's output isn't producing expected weight change after 3–4 weeks of consistent tracking, adjust by ±100–200 Cal/day. Use the <a href="/calculator/bmr-calculator">BMR Calculator</a> and the <a href="/calculator/calorie-deficit-calculator">Calorie Deficit Calculator</a> together for a complete picture.</p>
            <p>Compared with other tools: Cronometer, MyFitnessPal, and calculator.net all use the same underlying Mifflin-St Jeor equation. The difference between tools is UX, not math. Our <strong>Losertown calorie calculator</strong> adds multi-formula support and real-time kJ conversion that most competitors lack.</p>

            <h2>Calories Burned in Different Activities</h2>
            <p>Your TDEE is only one side of the equation. Understanding how many calories specific activities burn helps you build a smarter deficit strategy.</p>
            <h3>Cycling Calories Burned</h3>
            <p>Cycling is one of the most efficient calorie-burning exercises. The <strong>most accurate cycling calorie calculator</strong> factors in body weight, speed, terrain, and duration. At a moderate pace (12–14 mph), a 70 kg person burns approximately 400–600 Cal/hour. At intense race pace (20+ mph), this jumps to 800–1,000+ Cal/hour. Use your <a href="/calculator/calorie-calculator">Losertown calorie calculator</a> baseline alongside cycling estimates to set an accurate daily target.</p>
            <h3>Pickleball Calories Burned</h3>
            <p>Pickleball is surging in popularity, and the <strong>pickleball calories burned calculator</strong> estimates 400–600 Cal/hour for recreational play and up to 700 Cal/hour for competitive matches. Because it combines cardio bursts with rest periods, it's similar to HIIT in metabolic demand — excellent for older adults managing calorie deficits without high injury risk.</p>
            <h3>Sauna Calories Burned</h3>
            <p>The <strong>calories burned in sauna calculator</strong> and <strong>calories burned in a sauna calculator</strong> are popular tools for people who use sauna sessions for recovery and weight management. A 30-minute traditional sauna session burns approximately 100–200 calories above resting rate. The <strong>infrared sauna calories calculator</strong> shows slightly higher estimates (150–250 Cal/30 min) because infrared heat penetrates deeper, raising core temperature more efficiently. Use the <a href="/calculator/calorie-calculator">Losertown calorie calculator</a> to <strong>calculate calories burned in sauna</strong> alongside your workout totals for an accurate daily picture.</p>
            <h3>DeskCycle Calories Burned</h3>
            <p>The <strong>deskcycle calorie calculator</strong> estimates 150–300 Cal/hour depending on resistance and pedaling speed. DeskCycles (under-desk pedal machines) are ideal for sedentary office workers who want to increase daily TDEE without traditional workouts. Adding a DeskCycle session to your workday could shift your activity multiplier from Sedentary (×1.2) to Light (×1.375), adding ~275 Cal/day to your TDEE without setting foot in a gym.</p>

            <h2>How Sauna Calorie Calculators Work</h2>
            <p>When you use a <strong>calories burned in a sauna calculator</strong>, the estimate is based on elevated heart rate during heat exposure. Saunas raise core body temperature, triggering cardiovascular responses similar to light exercise (heart rate 100–150 bpm). The formula used to <strong>calculate calories burned in sauna</strong> is derived from MET (Metabolic Equivalent of Task) values: sauna MET ≈ 1.5–2.0, versus rest at MET 1.0.</p>
            <p>The <strong>infrared sauna calories calculator</strong> assigns slightly higher MET values because far-infrared wavelengths cause deeper tissue heating, maintaining elevated metabolic demand longer post-session. However, most immediate weight loss in a sauna is water weight — not fat. To count sauna calories in your <strong>Losertown calorie calculator</strong> total, add them only to weekly activity burn, not daily TDEE, since sessions are irregular.</p>
            <p>Also see: <a href="/calculator/bmr-calculator">BMR Calculator</a> and <a href="/calculator/protein-calculator">Protein Calculator</a> for a complete weight management toolkit.</p>

            <h2>Tips to Improve Weight Loss Accuracy</h2>
            <p><strong>1. Track food consistently.</strong> TDEE estimates are meaningless if calorie intake isn't logged. Use a food scale and an app for at least 2 weeks to calibrate your real intake vs. your estimate. Studies show people underestimate intake by 20–40% on average.</p>
            <p><strong>2. Be honest about activity level.</strong> The single biggest error in using the <strong>Losertown calorie calculator</strong> is selecting "Active" when real-world behavior is "Light." When in doubt, go one level down and adjust after 2–3 weeks of data.</p>
            <p><strong>3. Prioritize sleep.</strong> Poor sleep elevates ghrelin (hunger hormone) and suppresses leptin (satiety hormone), causing 20–30% higher calorie intake on sleep-deprived days. Even a perfectly calculated calorie deficit is undermined by chronic poor sleep.</p>
            <p><strong>4. Stay hydrated.</strong> Dehydration is often misread as hunger. Drinking 2–3 litres of water daily can reduce unnecessary calorie intake by 100–200 Cal/day. Also, adequate hydration improves the accuracy of body weight measurements used in the <strong>Losertown calculator calorie</strong> formula.</p>
            <p><strong>5. Recalculate regularly.</strong> TDEE decreases as you lose weight. For every 10 lbs lost, your TDEE drops by approximately 50–100 Cal/day. Run the <strong>Losertown calorie calculator</strong> again at every significant milestone to keep your deficit on track. Use the <a href="/calculator/tdee-calculator">TDEE Calculator</a> for ongoing monitoring.</p>

            <h2>Comparison: Losertown Calorie Calculator vs Other Tools</h2>
            <table className="w-full text-sm border-collapse mt-2 mb-4">
              <thead><tr className="bg-muted/40">
                <th className="text-left p-2 border border-border">Feature</th>
                <th className="text-center p-2 border border-border">Losertown Calculator</th>
                <th className="text-center p-2 border border-border">calculator.net</th>
                <th className="text-center p-2 border border-border">MyFitnessPal</th>
              </tr></thead>
              <tbody>
                {[["📊 3 BMR Formulas","✅","✅","❌"],["Calories + kJ","✅","❌","❌"],["Metric + US Units","✅","✅","✅"],["Katch-McArdle","✅","✅","❌"],["Goal Calorie Table","✅","❌","✅"],["No Login Required","✅","✅","❌"]].map(([f,a,b,c],i)=>(
                  <tr key={i} className="border-b border-border">
                    <td className="p-2 border border-border">{f}</td>
                    <td className="text-center p-2 border border-border">{a}</td>
                    <td className="text-center p-2 border border-border">{b}</td>
                    <td className="text-center p-2 border border-border">{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h2>Benefits of Using the Losertown Calorie Calculator</h2>
            <p>Using the <strong>Losertown calorie calculator</strong> removes guesswork from your nutrition strategy. Instead of following one-size-fits-all advice, you get a number calibrated to your body size, age, gender, and actual activity. This is the same methodology used by registered dietitians in clinical settings — just packaged as a free, instant online tool.</p>
            <p>Whether your goal is fat loss, muscle gain, or simply understanding your energy balance, the <strong>Losertown calculator calorie</strong> output gives you an actionable starting point. Pair it with the <a href="/calculator/protein-calculator">Protein Calculator</a> and <a href="/calculator/calorie-deficit-calculator">Calorie Deficit Calculator</a> to build a complete, data-driven nutrition plan.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/calorie-calculator" />
          <PopularCalculators exclude="/calculator/calorie-calculator" />
        </div>
      </div>
    </>
  );
};

export default CalorieCalculator;
