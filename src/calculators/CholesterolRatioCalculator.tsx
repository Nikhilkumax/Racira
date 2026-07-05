"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Heart, AlertCircle, Droplet } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceLine } from "recharts";

interface CholesterolResult {
  totalHdlRatio: number;
  totalHdlCategory: string;
  totalHdlColor: string;
  
  ldlHdlRatio: number;
  ldlHdlCategory: string;
  ldlHdlColor: string;

  tgHdlRatio: number;
  tgHdlCategory: string;
  tgHdlColor: string;

  nonHdl: number;
  
  chartData: { name: string; ratio: number; optimal: number; fill: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcCholesterol(
  total: number, hdl: number, ldl: number, tg: number, unit: string
): CholesterolResult {
  
  // Calculate Ratios (Ratios are identical whether using mg/dL or mmol/L because units cancel out)
  const totalHdlRatio = total / hdl;
  const ldlHdlRatio = ldl / hdl;
  const tgHdlRatio = tg / hdl;

  // Non-HDL Cholesterol
  const nonHdl = total - hdl;

  // Categorize Total/HDL Ratio (AHA Guidelines)
  let totalHdlCategory = "";
  let totalHdlColor = "";
  if (totalHdlRatio <= 3.5) { totalHdlCategory = "Optimal"; totalHdlColor = "#22c55e"; }
  else if (totalHdlRatio <= 5.0) { totalHdlCategory = "Average / Borderline"; totalHdlColor = "#eab308"; }
  else { totalHdlCategory = "High Risk"; totalHdlColor = "#ef4444"; }

  // Categorize LDL/HDL Ratio
  let ldlHdlCategory = "";
  let ldlHdlColor = "";
  if (ldlHdlRatio <= 2.5) { ldlHdlCategory = "Optimal"; ldlHdlColor = "#22c55e"; }
  else if (ldlHdlRatio <= 3.3) { ldlHdlCategory = "Average / Borderline"; ldlHdlColor = "#eab308"; }
  else { ldlHdlCategory = "High Risk"; ldlHdlColor = "#ef4444"; }

  // Categorize TG/HDL Ratio (Marker for Insulin Resistance / Pattern B LDL)
  let tgHdlCategory = "";
  let tgHdlColor = "";
  if (tgHdlRatio <= 2.0) { tgHdlCategory = "Optimal (Insulin Sensitive)"; tgHdlColor = "#22c55e"; }
  else if (tgHdlRatio <= 3.0) { tgHdlCategory = "Borderline Insulin Resistance"; tgHdlColor = "#eab308"; }
  else { tgHdlCategory = "High Risk (Severe Insulin Resistance)"; tgHdlColor = "#ef4444"; }

  const chartData = [
    { name: "Total/HDL", ratio: Number(totalHdlRatio.toFixed(1)), optimal: 3.5, fill: totalHdlColor },
    { name: "LDL/HDL", ratio: Number(ldlHdlRatio.toFixed(1)), optimal: 2.5, fill: ldlHdlColor },
    { name: "TG/HDL", ratio: Number(tgHdlRatio.toFixed(1)), optimal: 2.0, fill: tgHdlColor },
  ];

  const summaryStats = [
    { label: "Total Cholesterol", value: `${total} ${unit}` },
    { label: "HDL (Good)", value: `${hdl} ${unit}` },
    { label: "LDL (Bad)", value: `${ldl} ${unit}` },
    { label: "Triglycerides", value: `${tg} ${unit}` }
  ];

  return {
    totalHdlRatio: Number(totalHdlRatio.toFixed(1)), totalHdlCategory, totalHdlColor,
    ldlHdlRatio: Number(ldlHdlRatio.toFixed(1)), ldlHdlCategory, ldlHdlColor,
    tgHdlRatio: Number(tgHdlRatio.toFixed(1)), tgHdlCategory, tgHdlColor,
    nonHdl: Number(nonHdl.toFixed(1)),
    chartData, summaryStats
  };
}

export default function CholesterolRatioCalculator() {
  const [total, setTotal] = useState("200");
  const [hdl, setHdl] = useState("50");
  const [ldl, setLdl] = useState("120");
  const [tg, setTg] = useState("150");
  const [unit, setUnit] = useState("mg/dL");

  const [result, setResult] = useState<CholesterolResult | null>(null);

  const calculate = () => {
    const t = parseFloat(total), h = parseFloat(hdl), l = parseFloat(ldl), tr = parseFloat(tg);
    if (t > 0 && h > 0 && l > 0 && tr > 0) {
      setResult(calcCholesterol(t, h, l, tr, unit));
    }
  };

  useEffect(() => { setResult(calcCholesterol(200, 50, 120, 150, "mg/dL")); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "Why are ratios more important than Total Cholesterol?", answer: "Total Cholesterol is an outdated metric that is rarely useful on its own. For example, if your Total Cholesterol is high solely because your HDL ('good' cholesterol) is incredibly high, you are actually at very low risk for heart disease. Ratios provide a much clearer picture of the mathematical balance between protective particles and dangerous particles in your bloodstream." },
    { question: "What is a 'good' Total/HDL ratio?", answer: "According to the American Heart Association (AHA), your Total Cholesterol to HDL ratio should be below 5.0. However, the 'optimal' target for ideal cardiovascular health is a ratio of 3.5 or lower." },
    { question: "Why is the Triglyceride / HDL ratio so critical?", answer: "The TG/HDL ratio is widely considered by modern cardiologists to be the strongest lipid predictor of heart attacks. It is a highly accurate surrogate marker for insulin resistance. A ratio under 2.0 indicates you are insulin sensitive and have large, buoyant (safe) LDL particles. A ratio over 3.0 strongly indicates you have small, dense (dangerous) LDL particles and severe insulin resistance." },
    { question: "Does the measurement unit (mg/dL vs mmol/L) change the ratio?", answer: "No. A ratio is simply one number divided by another. If both your Total Cholesterol and HDL are measured in mg/dL (the US standard), dividing them yields the exact same ratio as if they were both measured in mmol/L (the UK/EU standard). The mathematical units completely cancel each other out." },
    { question: "What is Non-HDL Cholesterol?", answer: "Non-HDL cholesterol is simply your Total Cholesterol minus your HDL. It represents the sum total of every single atherogenic (plaque-causing) particle in your blood, including LDL, VLDL, and IDL. Many modern lipidologists prefer tracking Non-HDL rather than standard LDL because it is a more comprehensive measure of risk." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Cholesterol Ratio Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Cholesterol Ratio Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Measurement Unit</label>
              <select value={unit} onChange={e => setUnit(e.target.value)} className={`${inp} w-full px-3 text-base`}>
                <option value="mg/dL">mg/dL (US Standard)</option>
                <option value="mmol/L">mmol/L (UK / EU Standard)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 mt-1">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Total Cholesterol</label>
                <div className={inp}><input type="number" step="0.1" value={total} onChange={e => setTotal(e.target.value)} className={ci} /><span className="pr-3 text-xs text-muted-foreground whitespace-nowrap">{unit}</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block flex items-center gap-1">HDL <span className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Good</span></label>
                <div className={inp}><input type="number" step="0.1" value={hdl} onChange={e => setHdl(e.target.value)} className={ci} /><span className="pr-3 text-xs text-muted-foreground whitespace-nowrap">{unit}</span></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block flex items-center gap-1">LDL <span className="text-[10px] bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Bad</span></label>
                <div className={inp}><input type="number" step="0.1" value={ldl} onChange={e => setLdl(e.target.value)} className={ci} /><span className="pr-3 text-xs text-muted-foreground whitespace-nowrap">{unit}</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Triglycerides</label>
                <div className={inp}><input type="number" step="0.1" value={tg} onChange={e => setTg(e.target.value)} className={ci} /><span className="pr-3 text-xs text-muted-foreground whitespace-nowrap">{unit}</span></div>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">
                <Heart className="h-4 w-4" /> Analyze Ratios
              </button>
              <button onClick={() => { setTotal("200"); setHdl("50"); setLdl("120"); setTg("150"); setResult(calcCholesterol(200, 50, 120, 150, unit)); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="border-l-4 rounded-lg p-5 shadow-sm" style={{ backgroundColor: `${result.totalHdlColor}10`, borderColor: result.totalHdlColor }}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: result.totalHdlColor }}>Primary Total/HDL Ratio</div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-5xl font-extrabold text-foreground tracking-tight">{result.totalHdlRatio}</div>
                      <div className="text-sm font-semibold text-muted-foreground uppercase">: 1</div>
                    </div>
                  </div>
                  <div className="bg-background rounded-full p-3 shadow-sm border border-border">
                    <Droplet className="w-8 h-8" style={{ color: result.totalHdlColor }} />
                  </div>
                </div>
                <div className="inline-block px-3 py-1 mt-3 text-sm font-bold uppercase tracking-widest rounded-full text-white shadow-sm" style={{ backgroundColor: result.totalHdlColor }}>
                  {result.totalHdlCategory}
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card shadow-sm">
                {[
                  ["LDL / HDL", result.ldlHdlRatio, result.ldlHdlCategory, result.ldlHdlColor], 
                  ["TG / HDL", result.tgHdlRatio, result.tgHdlCategory, result.tgHdlColor],
                  ["Non-HDL (Total - HDL)", result.nonHdl, "Atherogenic Load", "#94a3b8"]
                ].map(([l, v, cat, col], i) => (
                  <div key={i} className={`p-4 text-center flex flex-col justify-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-2">{l}</div>
                    <div className="text-xl font-bold text-foreground leading-tight" style={{ color: col as string }}>{v}</div>
                    <div className="text-[10px] font-semibold text-muted-foreground mt-1 uppercase">{cat}</div>
                  </div>
                ))}
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold mb-1">Ratio Analysis vs Optimal Targets</h3>
                <p className="text-xs text-muted-foreground mb-4">Values exceeding the grey markers indicate elevated cardiovascular risk.</p>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={result.chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 500 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip cursor={{ fill: 'transparent' }} formatter={(v: number) => [v, "Your Ratio"]} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <Bar dataKey="ratio" radius={[4, 4, 0, 0]} maxBarSize={60}>
                      {result.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                    <ReferenceLine y={3.5} stroke="#94a3b8" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Opt. Total/HDL', fill: '#94a3b8', fontSize: 10 }} />
                    <ReferenceLine y={2.0} stroke="#94a3b8" strokeDasharray="3 3" label={{ position: 'insideTopRight', value: 'Opt. TG/HDL', fill: '#94a3b8', fontSize: 10 }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Why "Total Cholesterol" is a Flawed Metric</h2>
            <p>For decades, physicians focused almost entirely on a patient's Total Cholesterol number, pushing patients to aggressively lower it below 200 mg/dL. Modern lipidology has revealed that Total Cholesterol is actually a relatively poor predictor of cardiovascular events when viewed in isolation.</p>
            <p>Cholesterol is not an inherently dangerous toxin; it is a vital structural component of every cell membrane in your body and the precursor to essential hormones like testosterone and estrogen. It travels through your bloodstream inside protein "boats" known as lipoproteins. The clinical danger arises not from having cholesterol, but from the <em>type</em> of lipoproteins carrying it.</p>
            <p>Your Total Cholesterol is simply a mathematical sum: <code>HDL + LDL + (Triglycerides ÷ 5)</code>. If your Total Cholesterol is "high" strictly because you have massive amounts of highly protective HDL, you are actually at a very low risk of heart disease. To understand your true risk profile, you must calculate the mathematical ratios between these different particles using this <strong>Cholesterol Ratio Calculator</strong>.</p>

            <h2 className="text-2xl font-bold mb-3">1. The Total / HDL Ratio</h2>
            <p>This is the primary ratio utilized by the American Heart Association (AHA). It compares your total lipid load against your protective, "garbage-collecting" HDL particles. HDL works via a process called <em>Reverse Cholesterol Transport</em>, actively pulling dangerous plaque out of the arterial walls and returning it to the liver for disposal.</p>
            <p>If your ratio is 5.0, it means you have 5 atherogenic (plaque-forming) particles for every 1 protective HDL particle trying to clean them up. This indicates the "garbage" is accumulating faster than the trucks can haul it away.</p>
            <ul>
              <li><strong>Optimal:</strong> Less than 3.5</li>
              <li><strong>Borderline:</strong> 3.6 to 5.0</li>
              <li><strong>High Risk:</strong> Greater than 5.0</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">2. The Triglyceride / HDL Ratio (Insulin Resistance Marker)</h2>
            <p>Many modern cardiologists consider the TG/HDL ratio to be the single most powerful predictor of a future heart attack on a standard lipid panel. This ratio is a highly accurate surrogate marker for <strong>Insulin Resistance</strong> and <strong>Pattern B LDL</strong>.</p>
            <p>Triglycerides are fat particles floating in your blood, heavily driven by your consumption of refined carbohydrates, sugars, and alcohol. If you have high triglycerides and low HDL, your ratio will skyrocket. A high ratio strongly correlates with having small, dense LDL particles ("Pattern B"). These microscopic particles easily burrow through the endothelial lining of your arteries to form hard plaque. Conversely, a low ratio correlates with large, buoyant LDL particles ("Pattern A") that bounce harmlessly off the arterial walls.</p>
            <ul>
              <li><strong>Optimal (Insulin Sensitive):</strong> Less than 2.0 (Ideally ~1.0)</li>
              <li><strong>Borderline:</strong> 2.1 to 3.0</li>
              <li><strong>High Risk (Severe Insulin Resistance):</strong> Greater than 3.0</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">3. Understanding Non-HDL Cholesterol</h2>
            <p>Standard LDL is often called the "bad" cholesterol. However, there are other plaque-forming particles in your blood that a standard LDL test misses, such as VLDL (Very Low-Density Lipoprotein) and IDL (Intermediate-Density Lipoprotein).</p>
            <p>To get a complete picture of your cardiovascular risk load, doctors calculate <strong>Non-HDL Cholesterol</strong> by simply subtracting your HDL from your Total. The resulting number represents the sum total of <em>every single</em> atherogenic, plaque-forming particle circulating in your bloodstream. Current clinical guidelines suggest keeping Non-HDL at least 30 points lower than your Total Cholesterol target.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cholesterol-ratio-calculator" />
          <PopularCalculators exclude="/calculator/cholesterol-ratio-calculator" />
        </div>
      </div>
    </>
  );
}
