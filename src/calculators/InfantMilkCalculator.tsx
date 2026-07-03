"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Baby, Droplet, CheckCircle2, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceArea, ReferenceLine } from "recharts";

interface MilkResult {
  dailyOz: number;
  dailyMl: number;
  perFeedingOz: number;
  perFeedingMl: number;
  feedingsCount: number;
  statusText: string;
  statusColor: string;
  chartData: { name: string; ounces: number; ml: number }[];
  summaryStats: { label: string; value: string }[];
}

function calcInfantMilk(weightLbs: number, weightOz: number, feedingsCount: number, ageMonths: number): MilkResult | null {
  if (feedingsCount <= 0) return null;

  const totalWeightLbs = weightLbs + (weightOz / 16);
  if (totalWeightLbs <= 0) return null;

  // Clinical guideline: 2.5 ounces of milk per pound of body weight per day
  let dailyOz = totalWeightLbs * 2.5;

  let statusText = "Normal Target Range";
  let statusColor = "#22c55e"; // Green

  // Caps and clinical warnings
  // Infants generally shouldn't exceed 32-36 oz per day. If they need more, they likely need solid foods.
  if (dailyOz > 32) {
    if (ageMonths >= 6) {
      statusText = "Solid Foods Recommended";
      statusColor = "#3b82f6"; // Blue
      dailyOz = 32; // Cap it clinically
    } else {
      statusText = "High Volume (Consult Pediatrician)";
      statusColor = "#f59e0b"; // Yellow
      dailyOz = 32; // Cap it clinically to prevent overfeeding
    }
  }

  const perFeedingOz = dailyOz / feedingsCount;
  
  // Convert to mL (1 US fluid ounce = 29.5735 mL)
  const dailyMl = dailyOz * 29.5735;
  const perFeedingMl = perFeedingOz * 29.5735;

  const chartData = [];
  for (let i = 1; i <= feedingsCount; i++) {
    chartData.push({
      name: `Feed ${i}`,
      ounces: Number(perFeedingOz.toFixed(1)),
      ml: Number(perFeedingMl.toFixed(0))
    });
  }

  const summaryStats = [
    { label: "Total Daily Requirement", value: `${dailyOz.toFixed(1)} oz` },
    { label: "Target Per Bottle", value: `${perFeedingOz.toFixed(1)} oz` }
  ];

  return {
    dailyOz: Number(dailyOz.toFixed(1)),
    dailyMl: Number(dailyMl.toFixed(0)),
    perFeedingOz: Number(perFeedingOz.toFixed(1)),
    perFeedingMl: Number(perFeedingMl.toFixed(0)),
    feedingsCount,
    statusText,
    statusColor,
    chartData,
    summaryStats
  };
}

export default function InfantMilkCalculator() {
  const [weightLbs, setWeightLbs] = useState("12");
  const [weightOz, setWeightOz] = useState("8");
  const [feedings, setFeedings] = useState("6");
  const [age, setAge] = useState("3");

  const [result, setResult] = useState<MilkResult | null>(null);

  useEffect(() => {
    setResult(calcInfantMilk(12, 8, 6, 3));
  }, []);

  const calculate = () => {
    const lbs = parseInt(weightLbs) || 0;
    const oz = parseInt(weightOz) || 0;
    const f = parseInt(feedings) || 0;
    const a = parseInt(age) || 0;

    if ((lbs > 0 || oz > 0) && f > 0) {
      const res = calcInfantMilk(lbs, oz, f, a);
      if (res) setResult(res);
    }
  };

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "How does this calculator determine the milk requirement?", answer: "This calculator uses the standard pediatric formula of 2.5 ounces of breastmilk or formula per pound of body weight per day. For example, a 10-pound baby will typically require 25 ounces of milk over a 24-hour period." },
    { question: "Why is the total daily volume capped at 32 ounces?", answer: "Pediatricians generally recommend that an infant's milk intake should not exceed 32 ounces in a 24-hour period. If a baby is consistently demanding more than 32 ounces, it is usually a biological signal that they have outgrown an all-liquid diet and are ready to begin eating pureed solid foods (typically around 4 to 6 months of age)." },
    { question: "Does this apply to both breastmilk and formula?", answer: "Yes. In the first few months of life, breastmilk and standard infant formulas are highly regulated to contain a nearly identical caloric density (approximately 20 calories per ounce). Therefore, the required volume is the same regardless of what the baby is drinking." },
    { question: "How many feedings should a newborn have?", answer: "Newborns have incredibly small stomachs (about the size of a cherry at birth). They cannot hold large volumes of milk. Therefore, a newborn usually requires 8 to 12 small feedings per day. As the baby grows and their stomach expands, they will drink more milk per feeding, allowing the number of daily feedings to drop to 6 or 5." },
    { question: "What if my baby drinks more or less than this estimate?", answer: "This calculator provides a clinical average, but every baby is different. Growth spurts will cause temporary spikes in appetite. As long as your baby is producing 5 to 6 wet diapers a day, seems satisfied after eating, and is steadily gaining weight on their pediatrician's growth chart, they are getting exactly the right amount." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Infant Milk Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Infant Milk Requirement Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm sticky top-6">
            
            <div>
              <label className="text-sm font-medium mb-1.5 block">Baby's Age</label>
              <select value={age} onChange={e => setAge(e.target.value)} className={`${inp} w-full px-3 text-sm focus:ring-2 focus:ring-primary/20`}>
                <option value="0">0 - 1 Month</option>
                <option value="1">1 - 2 Months</option>
                <option value="2">2 - 3 Months</option>
                <option value="3">3 - 4 Months</option>
                <option value="4">4 - 5 Months</option>
                <option value="5">5 - 6 Months</option>
                <option value="6">6+ Months (Solids Started)</option>
              </select>
            </div>

            <div className="border-t border-border pt-4">
              <label className="text-sm font-bold mb-1.5 block">Baby's Weight</label>
              <div className="grid grid-cols-2 gap-4">
                <div className={inp}><input type="number" value={weightLbs} onChange={e => setWeightLbs(e.target.value)} className={ci} /><span className="pr-3 text-xs text-muted-foreground">lbs</span></div>
                <div className={inp}><input type="number" value={weightOz} onChange={e => setWeightOz(e.target.value)} className={ci} /><span className="pr-3 text-xs text-muted-foreground">oz</span></div>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <label className="text-sm font-bold mb-1.5 block">Number of Feedings per Day</label>
              <div className={inp}><input type="number" value={feedings} onChange={e => setFeedings(e.target.value)} className={ci} /></div>
              <p className="text-xs text-muted-foreground mt-1.5">Newborns: 8-12. Older babies: 5-6.</p>
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={() => { setWeightLbs("12"); setWeightOz("8"); setFeedings("6"); setAge("3"); setResult(calcInfantMilk(12, 8, 6, 3)); }} className="w-11 h-11 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {result && (<>
              
              <div className="border-l-4 rounded-lg p-5 shadow-sm" style={{ backgroundColor: `${result.statusColor}10`, borderColor: result.statusColor }}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: result.statusColor }}>Clinical Status</div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">{result.statusText}</div>
                    </div>
                  </div>
                  <div className="bg-background rounded-full p-2.5 shadow-sm border border-border shrink-0">
                    {result.statusColor === "#22c55e" ? <CheckCircle2 className="w-8 h-8" style={{ color: result.statusColor }} /> : <AlertTriangle className="w-8 h-8" style={{ color: result.statusColor }} />}
                  </div>
                </div>
                <div className="text-sm font-medium text-muted-foreground mt-2">
                  Based on a target volume of 2.5 oz per pound of body weight.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="card-calculator !p-4 border border-border bg-card shadow-sm text-center">
                    <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1">{s.label}</div>
                    <div className="text-xl sm:text-2xl font-black text-foreground">{s.value}</div>
                    <div className="text-xs text-muted-foreground mt-1">({i === 0 ? result.dailyMl : result.perFeedingMl} mL)</div>
                  </div>
                ))}
              </div>
              
              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-base font-bold">Daily Feeding Schedule Visualization</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-6">Equally divided volume across {result.feedingsCount} feedings in a 24-hour period.</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={result.chartData} margin={{ top: 20, right: 0, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip cursor={{ fill: '#f1f5f9' }} 
                      formatter={(value: number, name: string) => [`${value} oz`, "Bottle Volume"]} 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} 
                    />
                    <Bar dataKey="ounces" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50}>
                      {result.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="#3b82f6" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>The Mathematics of Infant Nutrition</h2>
            <p>During the first year of life, an infant's brain and body grow at a faster rate than at any other point in human development. Because their caloric needs are so massive relative to their tiny size, pediatricians use weight-based clinical formulas to ensure they are receiving adequate nutrition without over-stretching their stomachs.</p>
            <p>The universal clinical standard for infant nutrition is <strong>2.5 ounces of milk per pound of body weight per day</strong>. This 2.5x multiplier ensures the baby receives roughly 50 calories per pound, which is the precise amount required to fuel both basic metabolic functions and rapid cellular growth.</p>

            <h2>Why is the Volume Capped at 32 Ounces?</h2>
            <p>If a baby weighs 15 pounds, the math (15 x 2.5) indicates they need 37.5 ounces of milk per day. However, this calculator intentionally triggers a clinical warning and caps the recommendation at 32 ounces. Why?</p>
            <p>The human stomach is only designed to hold a certain volume of liquid. Pushing 38 to 40 ounces of liquid through a baby's digestive tract in 24 hours often leads to severe acid reflux, vomiting, and discomfort. When a baby's caloric demand exceeds what can be reasonably provided by 32 ounces of liquid (which typically happens around 4 to 6 months of age), it is a biological signal that their digestive tract has matured enough to handle denser, more calorically concentrated foods. This is exactly why pediatricians recommend introducing pureed solid foods at this stage.</p>

            <h2>Breastmilk vs. Formula</h2>
            <p>A common misconception is that breastfed babies require different volumes of milk than formula-fed babies. In the early months, this is false. Standard infant formulas are strictly regulated by the FDA to mimic the exact caloric density of mature human breastmilk—which is precisely <strong>20 calories per fluid ounce</strong>.</p>
            <p>Because the caloric density is identical, the physical volume required to keep the baby alive and growing is identical. The only difference is that breastmilk is often digested slightly faster than formula, meaning a breastfed baby might demand to be fed every 2 hours, whereas a formula-fed baby might comfortably wait 3 hours between feedings.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/infant-milk-calculator" />
          <PopularCalculators exclude="/calculator/infant-milk-calculator" />
        </div>
      </div>
    </>
  );
}
