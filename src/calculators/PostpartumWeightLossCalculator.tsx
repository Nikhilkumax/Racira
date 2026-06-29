"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from "recharts";

const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

const PostpartumWeightLossCalculator = () => {
  const DEFAULTS = { preWeight: "165", deliveryWeight: "195", currentWeight: "180", weeksPostpartum: "6", unit: "lbs", breastfeeding: true };
  const [preWeight, setPreWeight] = useState(DEFAULTS.preWeight);
  const [deliveryWeight, setDeliveryWeight] = useState(DEFAULTS.deliveryWeight);
  const [currentWeight, setCurrentWeight] = useState(DEFAULTS.currentWeight);
  const [weeksPostpartum, setWeeksPostpartum] = useState(DEFAULTS.weeksPostpartum);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [breastfeeding, setBreastfeeding] = useState(DEFAULTS.breastfeeding);
  const [result, setResult] = useState<any>(null);

  const calculate = (pw = preWeight, dw = deliveryWeight, cw = currentWeight, wk = weeksPostpartum, u = unit, bf = breastfeeding) => {
    const PW = parseFloat(pw) || 0;
    const DW = parseFloat(dw) || 0;
    const CW = parseFloat(cw) || 0;
    const WK = parseFloat(wk) || 0;
    if (!PW || !DW || !CW || !WK || WK <= 0 || DW < PW) return;
    const pregnancyGain = DW - PW;
    const lostSoFar = DW - CW;
    const remainingToPrePreg = CW - PW;
    const pctLost = pregnancyGain > 0 ? (lostSoFar / pregnancyGain) * 100 : 0;
    // Typical expected loss: 10-15 lbs in first 2 weeks (baby, placenta, fluid), then ~1-2 lbs/week
    const immediateImmediateLoss = 10; // typical immediate birth loss
    const immediateFluidLoss = 5; // typical fluid loss in first 2 weeks
    const weeklyRate = lostSoFar > 0 && WK > 0 ? lostSoFar / WK : 0;
    const bfBonus = bf ? 300 : 0; // kcal/day extra burned by breastfeeding
    // Project weeks to pre-pregnancy weight at current rate (safe max 1 lb/week)
    const safeWeeklyRate = Math.min(weeklyRate, bf ? 1.0 : 1.5);
    const weeksToGoal = remainingToPrePreg > 0 && safeWeeklyRate > 0 ? Math.ceil(remainingToPrePreg / safeWeeklyRate) : 0;
    // Build chart: projected weight over 52 weeks
    const chartData: { week: number; weight: number }[] = [];
    for (let w = 0; w <= 52; w += 4) {
      const projected = Math.max(PW, DW - (lostSoFar + safeWeeklyRate * (w - WK)));
      chartData.push({ week: w, weight: parseFloat(projected.toFixed(1)) });
    }
    setResult({ PW, DW, CW, WK, pregnancyGain, lostSoFar, remainingToPrePreg, pctLost, weeklyRate, bfBonus, weeksToGoal, safeWeeklyRate, chartData, u, bf });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => {
    setPreWeight(DEFAULTS.preWeight); setDeliveryWeight(DEFAULTS.deliveryWeight);
    setCurrentWeight(DEFAULTS.currentWeight); setWeeksPostpartum(DEFAULTS.weeksPostpartum);
    setUnit(DEFAULTS.unit); setBreastfeeding(DEFAULTS.breastfeeding);
    calculate(DEFAULTS.preWeight, DEFAULTS.deliveryWeight, DEFAULTS.currentWeight, DEFAULTS.weeksPostpartum, DEFAULTS.unit, DEFAULTS.breastfeeding);
  };

  const u = unit;

  const faqs = [
    { question: "How much weight is normal to lose after delivery?", answer: "Most women lose 10–14 lbs immediately after delivery from the baby (7–8 lbs), placenta (1–2 lbs), and amniotic fluid. An additional 5–8 lbs of fluid is typically lost in the first two weeks as the body expels excess blood volume and water retained during pregnancy. The remaining pregnancy weight (fat stores) is lost over the following months through diet and activity." },
    { question: "How quickly should I lose postpartum weight?", answer: "The American College of Obstetricians and Gynecologists (ACOG) recommends waiting until 6 weeks postpartum before actively dieting, and then aiming for no more than 1–1.5 lbs per week. For breastfeeding mothers, the recommendation is even more conservative: 0.5–1 lb/week to protect milk supply and ensure adequate nutrition for both mother and baby." },
    { question: "Does breastfeeding help with postpartum weight loss?", answer: "Breastfeeding burns approximately 300–500 extra calories per day, which can accelerate weight loss by about 0.5 lb/week compared to formula feeding. However, breastfeeding mothers should NOT aggressively restrict calories, as this can reduce milk supply, decrease milk quality, and deplete maternal nutritional stores. Many breastfeeding mothers find they lose weight more easily once they wean." },
    { question: "When should I reach my pre-pregnancy weight?", answer: "Most healthcare providers consider returning to pre-pregnancy weight within 6–12 months to be a healthy goal. Research shows that retaining more than 5 kg (11 lbs) of pregnancy weight at 6 months postpartum is associated with long-term obesity risk. However, individual factors — breastfeeding, cesarean recovery, thyroid function, sleep deprivation, and stress — all significantly affect postpartum weight loss rate." },
    { question: "Is it safe to exercise postpartum?", answer: "Light walking can begin within days of an uncomplicated vaginal delivery. More intense exercise should wait until the 6-week postpartum check-up. Women who had cesarean sections typically need to wait 8–12 weeks before resuming strenuous exercise. Pelvic floor exercises (Kegels) can begin within days of delivery. Core exercises should be cleared by a healthcare provider to avoid worsening diastasis recti." },
    { question: "What is a healthy postpartum calorie intake?", answer: "Non-breastfeeding women can safely reduce caloric intake to 1,500–1,800 kcal/day starting at 6 weeks postpartum. Breastfeeding women should not go below 1,800–2,000 kcal/day to protect milk supply. Adequate protein (1.2–1.6 g/kg), iron, calcium, and essential fatty acids are especially important postpartum. Avoid very low calorie diets — these are counterproductive for hormonal recovery and milk production." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Postpartum Weight Loss Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Postpartum Weight Loss Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px] mx-auto">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Unit</label>
              <div className="flex gap-2">
                {["lbs", "kg"].map((un) => (
                  <button key={un} onClick={() => { setUnit(un); calculate(preWeight, deliveryWeight, currentWeight, weeksPostpartum, un, breastfeeding); }}
                    className={`flex-1 h-9 rounded-md border text-sm font-medium transition-colors ${unit === un ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>
                    {un === "lbs" ? "Imperial (lbs)" : "Metric (kg)"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Pre-Pregnancy Weight ({u})</label>
              <div className="relative">
                <input type="number" value={preWeight} onChange={(e) => setPreWeight(e.target.value)} className="h-10 w-full px-3 pr-10 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder={u === "lbs" ? "165" : "75"} min="1" step="0.1" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{u}</span>
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Weight at Delivery ({u})</label>
              <div className="relative">
                <input type="number" value={deliveryWeight} onChange={(e) => setDeliveryWeight(e.target.value)} className="h-10 w-full px-3 pr-10 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder={u === "lbs" ? "195" : "89"} min="1" step="0.1" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{u}</span>
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Current Weight ({u})</label>
              <div className="relative">
                <input type="number" value={currentWeight} onChange={(e) => setCurrentWeight(e.target.value)} className="h-10 w-full px-3 pr-10 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder={u === "lbs" ? "180" : "82"} min="1" step="0.1" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{u}</span>
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Weeks Since Delivery</label>
              <input type="number" value={weeksPostpartum} onChange={(e) => setWeeksPostpartum(e.target.value)} className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="6" min="0" max="104" />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input type="checkbox" checked={breastfeeding} onChange={(e) => setBreastfeeding(e.target.checked)} className="rounded" />
              Currently breastfeeding (+~300 kcal/day burn)
            </label>
            <div className="flex gap-3">
              <button onClick={() => calculate(preWeight, deliveryWeight, currentWeight, weeksPostpartum, unit, breastfeeding)} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">Calculate</button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Postpartum Weight Progress</div>
                <div className="text-4xl font-bold text-primary">{fmt(result.pctLost, 0)}% <span className="text-2xl font-semibold">lost</span></div>
                <div className="text-sm text-muted-foreground mt-1">
                  Lost <span className="font-semibold text-foreground">{fmt(result.lostSoFar, 1)} {u}</span> of {fmt(result.pregnancyGain, 1)} {u} pregnancy gain
                </div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Weight Loss Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {[
                    { label: "Pre-Pregnancy Weight", value: `${fmt(result.PW)} ${u}` },
                    { label: "Weight at Delivery", value: `${fmt(result.DW)} ${u}` },
                    { label: "Total Pregnancy Gain", value: `${fmt(result.pregnancyGain, 1)} ${u}` },
                    { label: "Current Weight", value: `${fmt(result.CW)} ${u}` },
                    { label: "Lost Since Delivery", value: `${fmt(result.lostSoFar, 1)} ${u}` },
                    { label: "Remaining to Pre-Pregnancy", value: result.remainingToPrePreg > 0 ? `${fmt(result.remainingToPrePreg, 1)} ${u}` : "Goal achieved! ✓" },
                    { label: "Average Weekly Loss Rate", value: `${fmt(result.weeklyRate, 2)} ${u}/week` },
                    { label: `Estimated Weeks to Goal (≤${fmt(result.safeWeeklyRate, 1)} ${u}/wk)`, value: result.weeksToGoal > 0 ? `~${result.weeksToGoal} weeks` : "Goal reached ✓" },
                    ...(result.bf ? [{ label: "Breastfeeding Calorie Bonus", value: "~+300 kcal/day" }] : []),
                  ].map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground text-sm">{r.label}</td>
                      <td className="text-right font-medium text-sm">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Projected Weight Loss Timeline</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={result.chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="week" tickFormatter={(v) => `W${v}`} tick={{ fontSize: 11 }} />
                    <YAxis domain={["auto", "auto"]} tickFormatter={(v) => `${v}`} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: any) => `${v} ${u}`} labelFormatter={(l) => `Week ${l}`} />
                    <ReferenceLine y={result.PW} stroke="#10b981" strokeDasharray="4 2" label={{ value: `Goal ${result.PW}`, position: "insideTopRight", fontSize: 10, fill: "#10b981" }} />
                    <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-base font-semibold mb-4">Progress Summary</h3>
                <div className="space-y-3">
                  {[
                    { label: "Progress", value: `${fmt(result.pctLost, 0)}% of pregnancy weight lost` },
                    { label: "Current vs Pre-Pregnancy", value: result.remainingToPrePreg > 0 ? `${fmt(result.remainingToPrePreg, 1)} ${u} to go` : "Pre-pregnancy weight reached!" },
                    { label: "Weeks Postpartum", value: `${result.WK} weeks` },
                    { label: "Est. Timeline to Goal", value: result.weeksToGoal > 0 ? `~${result.weeksToGoal} more weeks` : "Goal achieved!", border: true, bold: true },
                  ].map((s: any, i) => (
                    <div key={i} className={`flex justify-between text-base ${s.border ? "border-t pt-3" : ""}`}>
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className={s.bold ? "font-bold text-primary" : "font-medium"}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is a Postpartum Weight Loss Calculator?</h2>
            <p>A postpartum weight loss calculator tracks your progress from delivery weight back to your pre-pregnancy weight, estimates your weekly loss rate, and projects a realistic timeline to reach your goal. Pre-filled with 165 lbs pre-pregnancy, 195 lbs at delivery (30 lbs gained), and 180 lbs at 6 weeks postpartum (15 lbs lost), the calculator shows 50% of pregnancy weight already lost — right on track with typical postpartum progression.</p>
            <h2>Normal Postpartum Weight Loss Timeline</h2>
            <p>Week 0–1: Immediate loss of 10–14 lbs from baby, placenta, and amniotic fluid. Weeks 1–6: Additional 5–8 lbs lost as excess blood volume and retained fluid are expelled. Week 6–6 months: Fat stores are gradually lost through diet, activity, and (for breastfeeding mothers) the caloric demands of milk production. Most women reach their pre-pregnancy weight between 6–12 months postpartum, though individual variation is enormous.</p>
            <h2>Breastfeeding and Weight Loss</h2>
            <p>Breastfeeding burns approximately 300–500 extra calories per day, equivalent to 45–70 minutes of walking. However, many breastfeeding mothers experience increased hunger that partially offsets this caloric expenditure. The net effect varies widely. Crucially, breastfeeding mothers should not restrict calories below 1,800 kcal/day — severe restriction reduces milk supply, decreases milk fat content, and can release environmental toxins stored in adipose tissue into breast milk. Conservative, sustainable weight loss of 0.5–1 lb/week is the recommended approach.</p>
            <h2>Safe Postpartum Weight Loss Rate</h2>
            <p>ACOG recommends: Wait until 6 weeks postpartum to begin intentional weight loss. Target no more than 1–1.5 lbs per week (non-breastfeeding). For breastfeeding mothers: 0.5–1 lb per week. Avoid skipping meals, very low calorie diets, or eliminating entire food groups. Adequate nutrition is essential for postpartum recovery, hormonal regulation, and mental health. Postpartum depression and anxiety, which affect 10–15% of new mothers, are worsened by severe caloric restriction and excessive exercise stress.</p>
            <h2>Exercise After Delivery</h2>
            <p>Exercise recommendations by delivery type: Vaginal delivery: Light walking within days 1–3. Gentle yoga and swimming after 2–3 weeks (if comfortable). Full exercise clearance typically at 6-week appointment. Cesarean section: Walking only for 4–6 weeks. No lifting above 15 lbs. Full activity clearance typically at 8–12 weeks. All mothers: Pelvic floor exercises (Kegels) can begin within 24 hours. Core exercises should be approved by a provider to avoid worsening diastasis recti — a separation of the abdominal muscles affecting up to 60% of women postpartum.</p>
            <h2>Realistic Goal Setting</h2>
            <p>Research shows that retaining more than 11 lbs (5 kg) of pregnancy weight at 6 months postpartum is associated with long-term obesity risk. However, "bouncing back" quickly is not a health goal — it's a cultural pressure. The most important health metric is sustainable, gradual progress toward your pre-pregnancy weight within the 6–18 month postpartum window, while maintaining energy for infant care, work, and recovery. Many women find their body composition changes permanently after pregnancy, with muscle and fat redistribution that doesn't fully revert — and this is entirely normal and healthy.</p>
            <h2>Nutrition Priorities Postpartum</h2>
            <p>Key nutrients for postpartum recovery: Iron (lost during delivery; found in lean red meat, lentils, fortified cereals). Calcium (essential for bone density during breastfeeding). Omega-3 DHA (critical for infant brain development; found in fatty fish, algae-based supplements). Protein (1.2–1.7 g/kg body weight to support muscle recovery and satiety). Continue taking a prenatal vitamin or postnatal supplement during breastfeeding. Hydration is especially critical during breastfeeding — breast milk is ~87% water.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/postpartum-weight-loss-calculator" />
          <PopularCalculators exclude="/calculator/postpartum-weight-loss-calculator" />
        </div>
      </div>
    </>
  );
};

export default PostpartumWeightLossCalculator;
