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
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Alcohol Unit Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
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
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative mb-4">
                <p className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Total UK Units</p>
                <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{result.units.toFixed(1)} units</div>
                <p className="text-base text-muted-foreground font-medium mt-2">Clears in approx. {result.drinkTime} · {result.totalCal} Cal</p>
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
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding the Medical Science Behind Alcohol Units</h2>
            <p>An alcohol unit is a standardized metric designed primarily by the United Kingdom's medical authorities to help the general population accurately track, monitor, and moderate their systemic consumption of ethanol. Because alcoholic beverages violently fluctuate in strength, measuring consumption simply by counting the number of drinks is scientifically useless. A pint of an aggressive, heavy craft India Pale Ale contains drastically more ethanol than a pint of a standard, light mass-market lager. To solve this critical public health problem, medical scientists established that one UK alcohol unit equates precisely to ten milliliters, or approximately eight grams, of pure, undiluted ethanol. The UK National Health Service, alongside the Chief Medical Officers, strongly recommends that adult men and women consume no more than fourteen units of alcohol per week to minimize the severe cardiovascular, neurological, and hepatic risks associated with long-term ethanol consumption.</p>
            
            <h2 className="text-2xl font-bold mb-3">The Mathematical Equation for Alcohol Units</h2>
            <p>The standard mathematical formula utilized by healthcare professionals to calculate UK alcohol units is highly precise but relatively straightforward to apply. To determine the exact unit count of any beverage, you multiply the total volume of the liquid in milliliters by the stated Alcohol by Volume percentage, and then divide that final product by one thousand. Alternatively, you can divide the ABV by one hundred first, multiply by the volume in milliliters, and then divide by ten. For instance, if you purchase a standard five hundred and sixty-eight milliliter pint of four percent lager, the calculation is four divided by one hundred, multiplied by five hundred and sixty-eight, and divided by ten, yielding exactly two point two seven units. A one hundred and seventy-five milliliter glass of thirteen percent wine yields exactly two point two eight units. A twenty-five milliliter single shot of forty percent whiskey yields exactly one unit. Our proprietary calculator instantly executes this exact medical equation for absolute precision, while simultaneously utilizing the renowned Widmark formula to estimate your Blood Alcohol Content based on your precise physiological body weight.</p>
            
            <h2 className="text-2xl font-bold mb-3">Interpreting Your Physiological Data</h2>
            <p>When you utilize our calculator, the primary result unequivocally displays the absolute total UK units contained within your selected beverage. However, the calculator also provides critical secondary data points. The pure ethanol metric, measured strictly in grams, represents the absolute mass of the chemical compound entering your bloodstream. The estimated Blood Alcohol Content represents a theoretical projection of your systemic intoxication, heavily dependent on your entered body weight. Perhaps most crucially, the calculator provides an estimated time to clear metric. This specific data point tells you approximately how many hours your liver will require to completely eliminate the ethanol from your physiological system, which is absolutely critical information for anyone considering operating a motor vehicle or heavy machinery after consuming beverages.</p>
            
            <h2 className="text-2xl font-bold mb-3">Analyzing the Fourteen Unit Weekly Threshold</h2>
            <p>The United Kingdom's Chief Medical Officers aggressively updated their low-risk drinking guidelines to recommend consuming absolutely no more than fourteen total units per week for both genders. To visualize this abstract number in practical terms, fourteen units equates to approximately six pints of average-strength beer, ten small glasses of low-strength wine, or fourteen single shots of standard-strength spirits. The medical guidelines strongly advise against consuming this allowance in a single session, a dangerous practice medically defined as binge drinking. Instead, individuals are instructed to spread their consumption evenly over a minimum of three days, while proactively integrating several completely alcohol-free days into their weekly schedule to allow the hepatic system sufficient time to recover from the chemical stress.</p>
            
            <h2 className="text-2xl font-bold mb-3">The Biological Kinetics of Alcohol Metabolism</h2>
            <p>The human liver operates under strict biological constraints when processing ethanol. On average, a healthy adult liver can only metabolize and eliminate approximately one single unit of alcohol per hour. This metabolic rate is a rigid physiological ceiling; it cannot be significantly accelerated by consuming massive amounts of black coffee, eating heavy, carbohydrate-rich meals, or drinking gallons of water. While these actions may alleviate the subjective symptoms of a hangover by addressing systemic dehydration or reactive hypoglycemia, they do absolutely nothing to increase the speed at which your liver oxidizes ethanol. Therefore, if you consume four units of alcohol, you must wait a minimum of four full hours for the chemical to clear your system. Consuming an entire bottle of wine, which contains approximately ten units, requires a ten-hour recovery period.</p>
            
            <h2 className="text-2xl font-bold mb-3">The Hidden Dangers of High-ABV Craft Beverages</h2>
            <p>In recent years, the explosive popularity of independent craft breweries and artisanal distilleries has fundamentally broken the traditional public understanding of alcohol units. Historically, a standard pint of pub ale hovered around four percent ABV. Today, it is incredibly common for a patron to order a heavily hopped double IPA that boasts an ABV of eight, nine, or even ten percent. Consuming a single pint of a nine percent IPA delivers over five units of alcohol directly into your bloodstream. Drinking just three of these highly concentrated beverages in a single evening results in fifteen units, immediately breaching the entire recommended weekly medical allowance in just a few hours. This is why strictly monitoring the ABV percentage is vastly more important than simply counting the physical number of glasses you consume.</p>
            
            <h2 className="text-2xl font-bold mb-3">The Long-Term Medical Benefits of Unit Tracking</h2>
            <p>Consistent, mathematically rigorous tracking with an alcohol unit calculator is the most effective method for maintaining strict awareness of your long-term consumption patterns. Human psychology is inherently flawed when estimating casual behavior; a habit of having two large glasses of wine every evening can rapidly and silently escalate into a severe medical liability. Consistently drinking significantly beyond the fourteen-unit weekly threshold exponentially increases your statistical risk of developing severe hepatic cirrhosis, cardiovascular disease, hypertension, and various aggressive forms of cancer, including breast and bowel malignancies. By transforming vague drink counts into hard, actionable numerical data, you empower yourself to make highly informed, mathematically sound decisions regarding your long-term physiological health and longevity.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/alcohol-unit-calculator" />
          <PopularCalculators exclude="/calculator/alcohol-unit-calculator" />
        </div>
      </div>
    </>
  );
};
export default AlcoholUnitCalculator;
