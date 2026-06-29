"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface UnitResult {
  units: number;
  ethanolG: number;
  bac: number;
  drinkTime: string;
  calPerUnit: number;
  totalCal: number;
  breakdown: { label: string; value: string }[];
  chartData: { name: string; value: number; color: string }[];
}

const calcUnits = (abv: number, mlOrFlOz: number, isML: boolean): number => {
  const ml = isML ? mlOrFlOz : mlOrFlOz * 29.5735;
  return (abv / 100) * ml / 10;
};

const calculateUnits = (
  abv: number, vol: number, isML: boolean, qty: number, weightKg: number, hoursN: number
): UnitResult => {
  const units = calcUnits(abv, vol, isML) * qty;
  const ml = isML ? vol : vol * 29.5735;
  const ethanolG = (abv / 100) * ml * 0.789 * qty;
  const bac = Math.max(0, (ethanolG / (weightKg * 1000 * 0.55)) * 100 - 0.015 * hoursN);
  const hrsToClear = units / 1; 
  const h = Math.floor(hrsToClear), m = Math.round((hrsToClear - h) * 60);
  const totalCal = Math.round(ethanolG * 7.1);
  const breakdown = [
    { label: "UK Units", value: units.toFixed(1) },
    { label: "Pure Ethanol", value: `${ethanolG.toFixed(1)}g` },
    { label: "Estimated BAC", value: `${bac.toFixed(3)}%` },
    { label: "Time to Clear", value: `${h}h ${m}m` },
    { label: "Calories", value: `${totalCal} Cal` },
    { label: "Total Volume", value: isML ? `${(vol * qty).toFixed(0)}ml` : `${(vol * qty).toFixed(1)} fl oz` },
  ];
  const PRESETS = [
    { name: "Wine (175ml, 13%)", u: calcUnits(13, 175, true) },
    { name: "Beer (568ml, 5%)", u: calcUnits(5, 568, true) },
    { name: "Shot (25ml, 40%)", u: calcUnits(40, 25, true) },
    { name: "Your Drink", u: units },
  ];
  const COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#ef4444"];
  const chartData = PRESETS.map((p, i) => ({ name: p.name, value: parseFloat(p.u.toFixed(1)), color: COLORS[i] }));
  return { units, ethanolG, bac, drinkTime: `${h}h ${m}m`, calPerUnit: Math.round(totalCal / Math.max(units, 1)), totalCal, breakdown, chartData };
};

const AlcoholUnitCalculator = () => {
  const [abv, setAbv] = useState("13");
  const [vol, setVol] = useState("175");
  const [isML, setIsML] = useState(true);
  const [qty, setQty] = useState("2");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [weightKg, setWeightKg] = useState("70");
  const [hours, setHours] = useState("1");
  const [result, setResult] = useState<UnitResult | null>(null);

  const calculate = () => {
    const a = parseFloat(abv) || 0, v = parseFloat(vol) || 0;
    const q = parseFloat(qty) || 1, w = parseFloat(weightKg) || 70, h = parseFloat(hours) || 0;
    if (a <= 0 || v <= 0) return;
    setResult(calculateUnits(a, v, isML, q, w, h));
  };

  useEffect(() => { calculate(); }, []);

  const reset = () => {
    setAbv("13"); setVol("175"); setIsML(true); setQty("2"); setWeightKg("70"); setHours("1");
    setResult(calculateUnits(13, 175, true, 2, 70, 1));
  };

  const wrap = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const suf = "pr-3 text-sm text-muted-foreground shrink-0";

  const faqs = [
    { question: "What is an alcohol unit?", answer: "One UK alcohol unit equals 10ml (8g) of pure ethanol. The formula is: Units = (ABV% ÷ 100) × volume_in_ml ÷ 10. A 175ml glass of 13% wine contains 2.3 units. UK guidelines recommend no more than 14 units per week for both men and women, spread over at least 3 days." },
    { question: "How many units is a bottle of wine?", answer: "A standard 750ml bottle of wine at 13% ABV contains 9.75 units. At 14% ABV, that rises to 10.5 units. The UK's 14-unit weekly limit is equivalent to just under 1.5 bottles of average-strength wine per week." },
    { question: "How long does it take to clear alcohol units?", answer: "The liver processes approximately 1 unit of alcohol per hour for most adults. So 4 units (roughly 2 pints of beer) takes about 4 hours to clear. Age, weight, liver health, food intake, and genetics all affect this rate. This calculator uses the standard 1-unit-per-hour guideline." },
    { question: "How do you calculate alcohol units?", answer: "Units = (ABV% ÷ 100) × volume (ml) ÷ 10. For example: a 568ml pint of 4% beer = (4 ÷ 100) × 568 ÷ 10 = 2.3 units. For fl oz: multiply fluid ounces by 29.5735 to get ml first." },
    { question: "What is a safe weekly alcohol limit?", answer: "UK NHS guidelines recommend no more than 14 units per week for both men and women, with several alcohol-free days. The risk of health problems increases significantly beyond this level. 14 units ≈ 6 pints of 4% beer ≈ 10 small glasses of 13% wine ≈ 14 single shots of 40% spirits." },
    { question: "Can I drive after 2 units?", answer: "The UK drink-drive limit is 80mg of alcohol per 100ml of blood (BAC 0.08%). Two units in a 70kg person approximately equates to 0.03–0.05% BAC depending on how quickly they were consumed. However, individual variation is significant, and even small amounts of alcohol impair reaction time. Never drive after drinking." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Alcohol Unit Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Alcohol Unit Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-base font-medium text-foreground mb-1.5">ABV %</label>
                <div className={wrap}><input type="number" value={abv} onChange={e => setAbv(e.target.value)} min={0} max={96} step={0.1} className={ci} /><span className={suf}>%</span></div>
              </div>
              <div className="flex flex-col">
                <label className="text-base font-medium text-foreground mb-1.5">Volume</label>
                <div className={wrap}><input type="number" value={vol} onChange={e => setVol(e.target.value)} min={1} step={1} className={ci} />
                  <button onClick={() => setIsML(v => !v)} className="px-3 text-sm font-bold border-l border-input h-full bg-secondary text-muted-foreground hover:bg-secondary/80 transition-colors">{isML ? "ml" : "oz"}</button>
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5">Number of Drinks</label>
              <div className={wrap}><input type="number" value={qty} onChange={e => setQty(e.target.value)} min={1} max={30} step={1} className={ci} /><span className={suf}>drinks</span></div>
            </div>
            <div>
              <button type="button" onClick={() => setShowAdvanced(v => !v)} className="flex items-center gap-1.5 text-base font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-foreground mb-1">Body Weight</label>
                    <div className={wrap}><input type="number" value={weightKg} onChange={e => setWeightKg(e.target.value)} min={40} max={200} className={ci} /><span className={suf}>kg</span></div>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-foreground mb-1">Hours Drinking</label>
                    <div className={wrap}><input type="number" value={hours} onChange={e => setHours(e.target.value)} min={0} max={12} step={0.5} className={ci} /><span className={suf}>hrs</span></div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-2">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-sm font-bold text-primary mb-1 uppercase tracking-wider">Total UK Units</div>
                <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{result.units.toFixed(1)} units</div>
                <div className="text-base text-muted-foreground font-medium mt-2">Clears in approx. {result.drinkTime} · {result.totalCal} Cal</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card shadow-sm">
                {[["Ethanol", `${result.ethanolG.toFixed(1)}g`], ["Est. BAC", `${result.bac.toFixed(3)}%`], ["Calories", `${result.totalCal}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-xl font-bold text-foreground">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-4">Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className="border-b border-border/50 last:border-0">
                      <td className="py-3 text-muted-foreground font-medium">{r.label}</td>
                      <td className="py-3 text-right font-bold text-foreground">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-4">Units Comparison</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                    <Tooltip formatter={(v: any) => [`${v} units`, ""]} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>{result.chartData.map((e, i) => <Cell key={i} fill={e.color} />)}</Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4 text-foreground">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-base">
                  {[["ABV", `${abv}%`], ["Volume", `${vol}${isML ? "ml" : " fl oz"}`], ["Drinks", qty], ["Units/Drink", (result.units / Math.max(parseFloat(qty), 1)).toFixed(1)], ["Weekly Limit", "14 units (UK)"], ["Cal/Unit", `${result.calPerUnit}`]].map(([k, v], i) => (
                    <div key={i} className="flex justify-between items-center"><span className="text-muted-foreground">{k}:</span><span className="font-semibold text-foreground">{v}</span></div>
                  ))}
                  <div className="col-span-2 flex justify-between items-center border-t border-border pt-4 text-lg font-bold text-primary">
                    <span>Total Units</span><span>{result.units.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is an Alcohol Unit Calculator?</h2>
            <p>An <strong>alcohol unit calculator</strong> measures alcohol consumption in standardized "units" — a system used primarily in the United Kingdom to help people track and moderate their drinking. One UK alcohol unit equals 10ml (approximately 8 grams) of pure ethanol. The UK National Health Service (NHS) recommends that both men and women drink no more than 14 units per week, spread over at least 3 days, to minimize health risks. This calculator instantly converts any drink's ABV and volume into units, making it easy to stay within recommended guidelines.</p>
            
            <h2>How Alcohol Units Are Calculated</h2>
            <p>The standard formula for calculating UK alcohol units is: <strong>Units = (ABV% ÷ 100) × Volume (ml) ÷ 10</strong>. For example, a 568ml pint of 4% lager: (4 ÷ 100) × 568 ÷ 10 = 2.27 units. A 175ml glass of 13% wine: (13 ÷ 100) × 175 ÷ 10 = 2.28 units. A 25ml shot of 40% spirits: (40 ÷ 100) × 25 ÷ 10 = 1 unit exactly. Our calculator uses this exact equation for precision. The estimated BAC uses the Widmark formula, and time-to-clear assumes 1 unit metabolized per hour.</p>
            
            <h2>Understanding Your Results</h2>
            <p>The primary result shows total UK units for your drinks. Pure ethanol in grams is the mass of alcohol consumed. The estimated BAC (Blood Alcohol Content) uses your body weight via the Widmark formula. The "time to clear" tells you approximately how long until alcohol is fully eliminated from your system — critical for safe driving decisions. Calories come from alcohol's 7.1 Cal/g energy content.</p>
            
            <h2>UK Weekly Alcohol Limits Explained</h2>
            <p>The UK Chief Medical Officers' low-risk guidelines (updated in 2016) recommend consuming no more than 14 units per week for both men and women. This equals approximately: 6 pints of average-strength beer (4%), or 10 small (125ml) glasses of low-strength wine (11%), or 14 single shots of spirits. The guidelines also strongly advise spreading drinking over 3 or more days, having several alcohol-free days each week, and avoiding binge drinking (defined as more than 6 units in a single session for women, and 8 for men).</p>
            
            <h2>How Long Does Alcohol Stay in Your System?</h2>
            <p>The average human liver processes approximately 1 unit of alcohol per hour. This rate is relatively fixed and cannot be significantly sped up by drinking coffee, eating food, or drinking water — though these may make you feel better by addressing dehydration or low blood sugar. For 4 units (roughly 2 pints of beer): expect it to take about 4 hours to clear. For 8 units (a standard bottle of wine): approximately 8 hours. Age, liver health, genetic variations in alcohol metabolism enzymes (like ADH and ALDH), and body composition all affect individual rates.</p>
            
            <h2>Practical Examples of Unit Calculations</h2>
            <p><strong>Friday night scenario:</strong> 3 pints of 5% IPA (568ml each) = 3 × (5 ÷ 100) × 568 ÷ 10 = 8.52 units total. Add 2 standard glasses of 13% wine (175ml): 2 × 2.28 = 4.55 units. Total evening: 13.07 units — nearly an entire week's recommended allowance in one single session. Saturday recovery: alcohol is still clearing from the system up to 13 hours after the last drink was consumed.</p>
            
            <h2>Tips for Tracking Alcohol Units</h2>
            <p>Use this calculator before you start drinking to plan your session. Track units on your phone throughout the evening. Alternate alcoholic drinks with water or soft drinks to slow consumption. Choose lower-ABV options — choosing a 3.5% session ale versus a 6% IPA cuts your units nearly in half for the exact same volume of liquid. Be acutely aware that home-poured measures are consistently larger than standard bar measures. Knowing your weekly total helps contextualize single-session risks.</p>
            
            <h2>Benefits of Monitoring Alcohol Units</h2>
            <p>Regular tracking with an alcohol unit calculator helps maintain awareness of consumption patterns that can easily creep upward over time. Health risks escalate significantly when routinely drinking above 14 units per week, including an increased risk of liver disease, certain cancers (like breast cancer and bowel cancer), heart disease, and mental health problems. Having concrete unit numbers — rather than vague "drink counts" — creates more actionable data for health decisions. For more related insights, try our <a href="/calculator/bac-calculator">BAC Calculator</a> or the <a href="/calculator/alcohol-calories-calculator">Alcohol Calories Calculator</a>.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/alcohol-unit-calculator" />
          <PopularCalculators exclude="/calculator/alcohol-unit-calculator" />
        </div>
      </div>
    </>
  );
};
export default AlcoholUnitCalculator;
