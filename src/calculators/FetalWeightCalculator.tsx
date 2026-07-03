"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, Baby } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceDot } from "recharts";

interface FetalWeightResult {
  estimatedWeightGrams: number;
  estimatedWeightLbs: number;
  estimatedWeightOz: number;
  percentile: number;
  status: string;
  recommendation: string;
  chartData: { week: number; p10: number; p50: number; p90: number }[];
  summaryStats: { label: string; value: string }[];
}

// Simplified Hadlock standard growth curve (50th percentile in grams)
// For visual/educational purposes.
const hadlockData: Record<number, { p10: number, p50: number, p90: number }> = {
  14: { p10: 35, p50: 45, p90: 55 },
  16: { p10: 80, p50: 100, p90: 120 },
  18: { p10: 150, p50: 190, p90: 230 },
  20: { p10: 250, p50: 300, p90: 350 },
  22: { p10: 350, p50: 430, p90: 510 },
  24: { p10: 500, p50: 600, p90: 700 },
  26: { p10: 700, p50: 820, p90: 940 },
  28: { p10: 900, p50: 1050, p90: 1200 },
  30: { p10: 1150, p50: 1350, p90: 1550 },
  32: { p10: 1450, p50: 1700, p90: 1950 },
  34: { p10: 1800, p50: 2150, p90: 2500 },
  36: { p10: 2200, p50: 2600, p90: 3000 },
  38: { p10: 2600, p50: 3100, p90: 3600 },
  40: { p10: 3000, p50: 3500, p90: 4000 }
};

function calcFetalWeight(
  hc: number, ac: number, fl: number, bpd: number, week: number
): FetalWeightResult {
  // Hadlock IV Formula:
  // Log10(EFW) = 1.3596 - (0.00386 * AC * FL) + (0.0064 * HC) + (0.00061 * BPD * AC) + (0.0424 * AC) + (0.174 * FL)
  // All measurements in cm.
  
  // Convert mm to cm for the formula if user entered large numbers (standard ultrasound is often mm)
  // We'll ask user to input in mm and convert to cm here for safety since mm is standard on reports
  const hc_cm = hc / 10;
  const ac_cm = ac / 10;
  const fl_cm = fl / 10;
  const bpd_cm = bpd / 10;

  let estimatedWeightGrams = 0;
  let percentile = 50;

  if (hc > 0 && ac > 0 && fl > 0 && bpd > 0) {
    const log10Efw = 1.3596 - (0.00386 * ac_cm * fl_cm) + (0.0064 * hc_cm) + (0.00061 * bpd_cm * ac_cm) + (0.0424 * ac_cm) + (0.174 * fl_cm);
    estimatedWeightGrams = Math.pow(10, log10Efw);

    // Calculate approximate percentile based on the week's p50 and spread
    // (This is a simplified bell curve approximation for educational purposes)
    let closestWeekData = hadlockData[week];
    if (!closestWeekData) {
      // Fallback to closest even week
      const nearest = Object.keys(hadlockData).reduce((prev, curr) => Math.abs(Number(curr) - week) < Math.abs(Number(prev) - week) ? curr : prev);
      closestWeekData = hadlockData[Number(nearest)];
    }

    if (estimatedWeightGrams <= closestWeekData.p10) percentile = 10;
    else if (estimatedWeightGrams >= closestWeekData.p90) percentile = 90;
    else {
      // Linear interpolation between p10/p50 or p50/p90
      if (estimatedWeightGrams < closestWeekData.p50) {
        const range = closestWeekData.p50 - closestWeekData.p10;
        const diff = estimatedWeightGrams - closestWeekData.p10;
        percentile = 10 + (diff / range) * 40;
      } else {
        const range = closestWeekData.p90 - closestWeekData.p50;
        const diff = estimatedWeightGrams - closestWeekData.p50;
        percentile = 50 + (diff / range) * 40;
      }
    }
  } else {
    // If no measurements, just show average for week
    let closestWeekData = hadlockData[week];
    if (!closestWeekData) {
      const nearest = Object.keys(hadlockData).reduce((prev, curr) => Math.abs(Number(curr) - week) < Math.abs(Number(prev) - week) ? curr : prev);
      closestWeekData = hadlockData[Number(nearest)];
    }
    estimatedWeightGrams = closestWeekData.p50;
    percentile = 50;
  }

  estimatedWeightGrams = Math.round(estimatedWeightGrams);
  const totalOz = estimatedWeightGrams * 0.035274;
  const estimatedWeightLbs = Math.floor(totalOz / 16);
  const estimatedWeightOz = Math.round(totalOz % 16);

  let status = "Average Growth";
  let recommendation = "Fetal weight is tracking near the average (50th percentile) for this gestational age.";

  if (percentile < 10) {
    status = "Small for Gestational Age (SGA)";
    recommendation = "Estimated weight is below the 10th percentile. Your doctor may recommend close monitoring or additional ultrasounds to ensure the baby is getting enough nutrients.";
  } else if (percentile > 90) {
    status = "Large for Gestational Age (LGA)";
    recommendation = "Estimated weight is above the 90th percentile (Macrosomia). This can be normal, but your doctor may check for gestational diabetes or plan for delivery options.";
  } else if (percentile >= 10 && percentile <= 30) {
    status = "Below Average";
    recommendation = "Fetal weight is tracking smaller than average but within normal limits. Consistent growth on your personal curve is more important than a single measurement.";
  } else if (percentile >= 70 && percentile <= 90) {
    status = "Above Average";
    recommendation = "Fetal weight is tracking larger than average but within normal limits.";
  }

  const chartData = Object.keys(hadlockData).map(w => ({
    week: Number(w),
    p10: hadlockData[Number(w)].p10,
    p50: hadlockData[Number(w)].p50,
    p90: hadlockData[Number(w)].p90
  }));

  const summaryStats = [
    { label: "Metric Weight", value: `${estimatedWeightGrams} grams` },
    { label: "Imperial Weight", value: `${estimatedWeightLbs} lbs ${estimatedWeightOz} oz` },
    { label: "Growth Percentile", value: `${Math.round(percentile)}th Percentile` },
    { label: "Gestational Age", value: `Week ${week}` },
  ];

  return { estimatedWeightGrams, estimatedWeightLbs, estimatedWeightOz, percentile: Math.round(percentile), status, recommendation, chartData, summaryStats };
}

export default function FetalWeightCalculator() {
  const [week, setWeek] = useState("20");
  const [bpd, setBpd] = useState("46"); // mm
  const [hc, setHc] = useState("175"); // mm
  const [ac, setAc] = useState("150"); // mm
  const [fl, setFl] = useState("32"); // mm
  const [useMeasurements, setUseMeasurements] = useState(false);

  const [result, setResult] = useState<FetalWeightResult | null>(null);

  const calculate = () => {
    setResult(calcFetalWeight(
      useMeasurements ? parseFloat(hc) || 0 : 0,
      useMeasurements ? parseFloat(ac) || 0 : 0,
      useMeasurements ? parseFloat(fl) || 0 : 0,
      useMeasurements ? parseFloat(bpd) || 0 : 0,
      parseInt(week) || 20
    ));
  };

  useEffect(() => { setResult(calcFetalWeight(0, 0, 0, 0, 20)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "How accurate are ultrasound weight estimates?", answer: "Ultrasound estimates of fetal weight are mathematically derived from 2D measurements (head, abdomen, femur). They have a margin of error of about 10% to 15%. This means a baby estimated at 7 lbs could actually weigh anywhere from 6 lbs to 8 lbs. Accuracy decreases slightly in the third trimester." },
    { question: "What do the acronyms BPD, HC, AC, and FL mean?", answer: "These are standard ultrasound measurements. BPD (Biparietal Diameter) is the width of the baby's head. HC (Head Circumference) is the distance around the baby's head. AC (Abdominal Circumference) is the distance around the baby's belly. FL (Femur Length) is the length of the thigh bone." },
    { question: "What does 'Small for Gestational Age' (SGA) mean?", answer: "SGA generally refers to a fetus or baby whose estimated weight is below the 10th percentile for their gestational age. While some babies are naturally small and perfectly healthy, SGA can sometimes indicate intrauterine growth restriction (IUGR), prompting doctors to monitor the pregnancy more closely." },
    { question: "What does 'Macrosomia' mean?", answer: "Fetal macrosomia is used to describe a newborn who's significantly larger than average—typically diagnosed if birth weight is over 8 pounds, 13 ounces (4,000 grams). In utero, a baby tracking above the 90th percentile is considered Large for Gestational Age (LGA). It's frequently associated with maternal gestational diabetes." },
    { question: "Why is Abdominal Circumference (AC) so important?", answer: "AC is the single most important measurement for estimating fetal weight because it reflects the size of the fetal liver and subcutaneous fat volume. If a baby is not getting enough nutrition, the liver size shrinks to send blood to the brain, making the abdomen smaller. A lagging AC is often the first sign of growth restriction." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Fetal Weight Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Fetal Weight Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-base font-medium mb-1.5 block">Gestational Age (Weeks)</label>
              <div className={inp}><input type="number" min="14" max="42" value={week} onChange={e => setWeek(e.target.value)} className={ci} /></div>
              <p className="text-xs text-muted-foreground mt-1.5">Valid for weeks 14 through 42.</p>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-3 p-3 border border-border rounded-md bg-secondary/30 cursor-pointer">
                <input type="checkbox" checked={useMeasurements} onChange={e => setUseMeasurements(e.target.checked)} className="w-5 h-5 rounded border-input text-primary" />
                <div>
                  <span className="block font-semibold">I have ultrasound measurements</span>
                  <span className="block text-xs text-muted-foreground mt-0.5">Use BPD, HC, AC, and FL from your report.</span>
                </div>
              </label>
            </div>

            {useMeasurements && (
              <div className="space-y-4 border-l-2 border-primary pl-4 ml-1">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2"><Baby className="w-4 h-4" /> Enter in Millimeters (mm)</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium mb-1 block" title="Biparietal Diameter">BPD (Head Width)</label>
                    <div className={inp}><input type="number" value={bpd} onChange={e => setBpd(e.target.value)} className={ci} /></div>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block" title="Head Circumference">HC (Head Circ.)</label>
                    <div className={inp}><input type="number" value={hc} onChange={e => setHc(e.target.value)} className={ci} /></div>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block" title="Abdominal Circumference">AC (Belly Circ.)</label>
                    <div className={inp}><input type="number" value={ac} onChange={e => setAc(e.target.value)} className={ci} /></div>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block" title="Femur Length">FL (Thigh Bone)</label>
                    <div className={inp}><input type="number" value={fl} onChange={e => setFl(e.target.value)} className={ci} /></div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-2">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={() => { setWeek("20"); setBpd("46"); setHc("175"); setAc("150"); setFl("32"); setUseMeasurements(false); setResult(calcFetalWeight(0, 0, 0, 0, 20)); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className={`border-l-4 rounded-lg p-5 ${result.status.includes("Small") || result.status.includes("Large") ? "bg-amber-500/10 border-amber-500" : "bg-primary/10 border-primary"}`}>
                <div className={`text-sm font-bold uppercase tracking-wider mb-1 ${result.status.includes("Small") || result.status.includes("Large") ? "text-amber-600" : "text-primary"}`}>Status: {result.status}</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">{result.estimatedWeightLbs} <span className="text-xl">lbs</span> {result.estimatedWeightOz} <span className="text-xl">oz</span></div>
                <div className="text-base text-muted-foreground mt-2">{result.recommendation}</div>
              </div>
              
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Standard Growth Curve (Hadlock)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={result.chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} domain={[0, 'dataMax']} />
                    <Tooltip formatter={(v: any, name: string) => [`${v}g`, name === 'p50' ? 'Average (50th)' : name === 'p10' ? '10th %ile' : '90th %ile']} />
                    <Area type="monotone" dataKey="p90" stroke="none" fill="var(--secondary)" />
                    <Area type="monotone" dataKey="p50" stroke="#3b82f6" strokeWidth={2} fill="none" />
                    <Area type="monotone" dataKey="p10" stroke="none" fill="var(--background)" />
                    {useMeasurements && (
                      <ReferenceDot x={parseInt(week) || 20} y={result.estimatedWeightGrams} r={5} fill="#ef4444" stroke="none" />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
                {useMeasurements && <p className="text-xs text-center mt-3 text-muted-foreground"><span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1 translate-y-0.5"></span> Red dot represents your estimated fetal weight</p>}
              </div>

              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between border-b border-border/50 pb-1 last:border-0"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold text-right">{s.value}</span></div>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground text-center mt-4">
                  *This tool uses the standard Hadlock IV formula. Medical decisions should only be made based on official ultrasound reports reviewed by a physician.
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>How Is Fetal Weight Estimated?</h2>
            <p>This <strong>Fetal Weight Calculator</strong> uses the Hadlock IV mathematical formula, the global clinical standard for estimating fetal weight from ultrasound measurements. During your anatomy scan or third-trimester growth scan, the sonographer takes four primary measurements: Biparietal Diameter (BPD), Head Circumference (HC), Abdominal Circumference (AC), and Femur Length (FL). These 2-dimensional measurements are plugged into the formula to estimate the baby's 3-dimensional mass.</p>
            <h2>Understanding Percentiles</h2>
            <p>The calculator outputs your baby's weight and places it on a growth curve (percentile). If your baby is in the 50th percentile, they weigh more than 50% of babies at that specific gestational week. Anything between the 10th and 90th percentile is generally considered "normal," though doctors look for a steady growth curve over multiple scans rather than focusing on a single number. A drop from the 70th to the 20th percentile is more concerning than consistently tracking at the 15th percentile.</p>
            <h2>Margin of Error</h2>
            <p>It's vital to remember that ultrasound weight estimates are exactly that—estimates. The formula has an inherent margin of error of roughly 10% to 15%. This means an estimate of 4,000 grams (about 8.8 lbs) could actually be a baby weighing 3,400 grams or 4,600 grams. Accuracy tends to decrease in the late third trimester as the baby drops lower into the pelvis, making accurate head measurements difficult. Related tools: <a href="/calculator/pregnancy-calculator">Pregnancy Calculator</a>.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/fetal-weight-calculator" />
          <PopularCalculators exclude="/calculator/fetal-weight-calculator" />
        </div>
      </div>
    </>
  );
}
