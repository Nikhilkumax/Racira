"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, Baby } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceDot } from "recharts";

interface GrowthResult {
  percentile: number;
  status: string;
  recommendation: string;
  chartData: { month: number; p3: number; p50: number; p97: number }[];
  summaryStats: { label: string; value: string }[];
}

// Simplified WHO Growth Standard data (Boys weight-for-age, 0-24 months) in kg
const boysWeightWHO: Record<number, { p3: number, p50: number, p97: number }> = {
  0: { p3: 2.5, p50: 3.3, p97: 4.4 },
  1: { p3: 3.4, p50: 4.5, p97: 5.8 },
  2: { p3: 4.3, p50: 5.6, p97: 7.1 },
  3: { p3: 5.0, p50: 6.4, p97: 8.0 },
  4: { p3: 5.6, p50: 7.0, p97: 8.7 },
  5: { p3: 6.0, p50: 7.5, p97: 9.3 },
  6: { p3: 6.4, p50: 7.9, p97: 9.8 },
  9: { p3: 7.1, p50: 8.9, p97: 11.0 },
  12: { p3: 7.7, p50: 9.6, p97: 12.0 },
  18: { p3: 8.8, p50: 10.9, p97: 13.7 },
  24: { p3: 9.7, p50: 12.2, p97: 15.3 }
};

// Simplified WHO Growth Standard data (Girls weight-for-age, 0-24 months) in kg
const girlsWeightWHO: Record<number, { p3: number, p50: number, p97: number }> = {
  0: { p3: 2.4, p50: 3.2, p97: 4.2 },
  1: { p3: 3.2, p50: 4.2, p97: 5.5 },
  2: { p3: 3.9, p50: 5.1, p97: 6.6 },
  3: { p3: 4.5, p50: 5.8, p97: 7.5 },
  4: { p3: 5.0, p50: 6.4, p97: 8.2 },
  5: { p3: 5.4, p50: 6.9, p97: 8.8 },
  6: { p3: 5.7, p50: 7.3, p97: 9.3 },
  9: { p3: 6.5, p50: 8.2, p97: 10.5 },
  12: { p3: 7.0, p50: 8.9, p97: 11.5 },
  18: { p3: 8.1, p50: 10.2, p97: 13.2 },
  24: { p3: 9.0, p50: 11.5, p97: 14.8 }
};

function calcGrowth(
  gender: string, ageMonths: number, weightLbs: number, weightOz: number
): GrowthResult {
  const dataset = gender === "male" ? boysWeightWHO : girlsWeightWHO;
  
  // Convert input to kg
  const totalOz = (weightLbs * 16) + weightOz;
  const weightKg = totalOz * 0.0283495;

  let closestData = dataset[ageMonths];
  if (!closestData) {
    const nearestMonth = Object.keys(dataset).reduce((prev, curr) => Math.abs(Number(curr) - ageMonths) < Math.abs(Number(prev) - ageMonths) ? curr : prev);
    closestData = dataset[Number(nearestMonth)];
  }

  let percentile = 50;

  if (weightKg <= closestData.p3) {
    percentile = 3;
  } else if (weightKg >= closestData.p97) {
    percentile = 97;
  } else {
    // Interpolation
    if (weightKg < closestData.p50) {
      const range = closestData.p50 - closestData.p3;
      const diff = weightKg - closestData.p3;
      percentile = 3 + (diff / range) * 47;
    } else {
      const range = closestData.p97 - closestData.p50;
      const diff = weightKg - closestData.p50;
      percentile = 50 + (diff / range) * 47;
    }
  }

  percentile = Math.round(Math.max(1, Math.min(99, percentile)));

  let status = "Average Growth";
  let recommendation = "Your baby's weight is tracking near the average for their age and gender.";

  if (percentile < 10) {
    status = "Low Percentile";
    recommendation = `Tracking at the ${percentile}th percentile. While some babies are naturally small, your pediatrician will monitor to ensure they are staying on their own growth curve and gaining steadily.`;
  } else if (percentile > 90) {
    status = "High Percentile";
    recommendation = `Tracking at the ${percentile}th percentile. Your baby is larger than most. Pediatricians focus mostly on ensuring the growth curve stays relatively consistent over time.`;
  } else if (percentile >= 10 && percentile <= 30) {
    status = "Below Average";
    recommendation = `Tracking at the ${percentile}th percentile. This is within the normal range.`;
  } else if (percentile >= 70 && percentile <= 90) {
    status = "Above Average";
    recommendation = `Tracking at the ${percentile}th percentile. This is within the normal range.`;
  }

  const chartData = Object.keys(dataset).map(m => ({
    month: Number(m),
    p3: Number((dataset[Number(m)].p3 * 2.20462).toFixed(1)), // convert back to lbs for display
    p50: Number((dataset[Number(m)].p50 * 2.20462).toFixed(1)),
    p97: Number((dataset[Number(m)].p97 * 2.20462).toFixed(1))
  }));

  const inputWeightDecimalLbs = weightLbs + (weightOz / 16);

  const summaryStats = [
    { label: "Current Weight", value: `${weightLbs} lbs ${weightOz} oz` },
    { label: "Weight Percentile", value: `${percentile}th Percentile` },
    { label: "Age Group", value: `${ageMonths} Months` },
    { label: "Average 50th %ile Weight", value: `${Math.round(closestData.p50 * 2.20462)} lbs` },
  ];

  return { percentile, status, recommendation, chartData, summaryStats };
}

export default function BabyGrowthPercentileCalculator() {
  const [gender, setGender] = useState("male");
  const [months, setMonths] = useState("6");
  const [lbs, setLbs] = useState("17");
  const [oz, setOz] = useState("8");

  const [result, setResult] = useState<GrowthResult | null>(null);

  const calculate = () => {
    setResult(calcGrowth(
      gender, parseInt(months) || 0, parseInt(lbs) || 0, parseInt(oz) || 0
    ));
  };

  useEffect(() => { setResult(calcGrowth("male", 6, 17, 8)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What do baby growth percentiles mean?", answer: "Percentiles compare your baby's weight, height, or head circumference with other children of the same age and sex. If your 6-month-old is in the 75th percentile for weight, it means they weigh more than 75% of 6-month-old babies and weigh less than 25% of them." },
    { question: "Is a higher percentile better?", answer: "No. A baby in the 90th percentile is not 'healthier' than a baby in the 20th percentile. Just like adults, babies come in all shapes and sizes. What pediatricians look for is a consistent trend. If your baby is always around the 15th percentile, they are growing perfectly fine. If they suddenly drop from the 80th to the 20th, that signals a potential issue." },
    { question: "Does this use WHO or CDC charts?", answer: "For children under 2 years old, the American Academy of Pediatrics (AAP) and the CDC recommend using the World Health Organization (WHO) growth charts. WHO charts are based on the growth of healthy, breastfed infants from multiple countries and describe how children *should* grow under optimal conditions. CDC charts are generally used for children over 2." },
    { question: "Why do breastfed and formula-fed babies grow differently?", answer: "Studies show that breastfed and formula-fed babies grow at different rates. Breastfed babies tend to gain weight more rapidly in the first 2-3 months of life and then gain more slowly from 3-12 months. Formula-fed babies usually gain weight more steadily throughout the first year, often making them slightly heavier by their first birthday." },
    { question: "What is 'Failure to Thrive'?", answer: "Failure to thrive (FTT) is a clinical term used when a baby's weight falls below the 3rd or 5th percentile, or if their growth drops across two major percentile lines (e.g., from the 50th down past the 10th). It indicates the baby is not getting or absorbing enough calories to support normal growth and development." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Baby Growth Percentile Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Baby Growth Percentile Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-base font-medium mb-1.5 block">Biological Sex</label>
                <div className="grid grid-cols-2 gap-2">
                  {[["male", "Boy"], ["female", "Girl"]].map(([v, l]) => (
                    <button key={v} onClick={() => setGender(v)} className={`h-10 rounded-md border text-sm font-medium transition-colors ${gender === v ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background hover:bg-secondary"}`}>{l}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-base font-medium mb-1.5 block">Age (Months)</label>
                <div className={inp}><input type="number" min="0" max="24" value={months} onChange={e => setMonths(e.target.value)} className={ci} /></div>
              </div>
            </div>
            
            <div className="space-y-4 border-t border-border pt-4 mt-2">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2"><Baby className="w-4 h-4" /> Current Weight</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium mb-1 block">Pounds (lbs)</label>
                  <div className={inp}><input type="number" value={lbs} onChange={e => setLbs(e.target.value)} className={ci} /></div>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Ounces (oz)</label>
                  <div className={inp}><input type="number" max="15" value={oz} onChange={e => setOz(e.target.value)} className={ci} /></div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={() => { setGender("male"); setMonths("6"); setLbs("17"); setOz("8"); setResult(calcGrowth("male", 6, 17, 8)); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className={`border-l-4 rounded-lg p-5 ${result.percentile < 10 || result.percentile > 90 ? "bg-amber-500/10 border-amber-500" : "bg-primary/10 border-primary"}`}>
                <div className={`text-sm font-bold uppercase tracking-wider mb-1 ${result.percentile < 10 || result.percentile > 90 ? "text-amber-600" : "text-primary"}`}>Status: {result.status}</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">{result.percentile}th <span className="text-xl font-normal text-muted-foreground">Percentile</span></div>
                <div className="text-base text-muted-foreground mt-2">{result.recommendation}</div>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">WHO Growth Standard (Weight)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={result.chartData} margin={{ top: 10, right: 30, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v: any, name: string) => [`${v} lbs`, name === 'p50' ? 'Average (50th)' : name === 'p3' ? '3rd %ile' : '97th %ile']} />
                    <Area type="monotone" dataKey="p97" stroke="none" fill="var(--secondary)" />
                    <Area type="monotone" dataKey="p50" stroke="#3b82f6" strokeWidth={2} fill="none" />
                    <Area type="monotone" dataKey="p3" stroke="none" fill="var(--background)" />
                    <ReferenceDot x={parseInt(months) || 0} y={parseInt(lbs) + (parseInt(oz) / 16)} r={6} fill="#ef4444" stroke="none" />
                  </AreaChart>
                </ResponsiveContainer>
                <p className="text-xs text-center mt-3 text-muted-foreground"><span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1 translate-y-0.5"></span> Red dot represents your baby's weight</p>
              </div>

              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between border-b border-border/50 pb-1 last:border-0"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold text-right">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>Tracking Your Baby's Growth</h2>
            <p>This <strong>Baby Growth Percentile Calculator</strong> compares your infant's weight against the World Health Organization (WHO) Child Growth Standards. The WHO charts are the gold standard recommended by pediatricians for babies ages 0 to 24 months because they depict how children <em>should</em> grow under optimal conditions (e.g., breastfed as the norm), rather than just describing how children <em>do</em> grow.</p>
            <h2>Busting the Percentile Myth</h2>
            <p>One of the most common mistakes new parents make is assuming that a higher percentile means a healthier baby. If your baby is in the 80th percentile, it simply means they are heavier than 80 out of 100 babies their age. A baby in the 20th percentile is just as healthy as a baby in the 80th. Pediatricians are rarely concerned with the exact number; instead, they are looking for the <strong>curve</strong>. A baby should establish their own personal percentile curve and stay roughly on it month after month. A sudden, sharp drop across two major percentile lines is when doctors investigate.</p>
            <h2>Weight Loss After Birth</h2>
            <p>It is perfectly normal for newborns to lose up to 10% of their birth weight in the first few days of life, primarily due to fluid loss and the transition to drinking milk. A baby born in the 50th percentile might drop to the 25th percentile by day four. However, they should regain their birth weight by 10 to 14 days old and resume steady climbing. Related calculators: <a href="/calculator/fetal-weight-calculator">Fetal Weight Calculator</a>, <a href="/calculator/breastfeeding-calorie-calculator">Breastfeeding Calorie Calculator</a>.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/baby-growth-percentile-calculator" />
          <PopularCalculators exclude="/calculator/baby-growth-percentile-calculator" />
        </div>
      </div>
    </>
  );
}
