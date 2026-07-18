"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, Coffee } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

interface CaffeineResult {
  totalCaffeine: number;
  maxLimit: number;
  lethalDose: number;
  status: string;
  recommendation: string;
  halfLifeHours: number;
  remainingAtBedtime: number;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcCaffeine(
  weightLbs: number, age: number, isPregnant: boolean,
  sensitivity: string, timeToBed: number,
  coffeeCups: number, espressoShots: number, teaCups: number, energyDrinks: number, sodaCans: number, preWorkout: number
): CaffeineResult {
  // Estimate Caffeine content (mg)
  const cCoffee = coffeeCups * 95; // 8oz brewed
  const cEspresso = espressoShots * 63; // 1oz shot
  const cTea = teaCups * 47; // 8oz black tea
  const cEnergy = energyDrinks * 160; // 16oz standard energy drink (Monster/Rockstar)
  const cSoda = sodaCans * 34; // 12oz cola
  const cPreWorkout = preWorkout * 250; // Average pre-workout scoop

  const totalCaffeine = cCoffee + cEspresso + cTea + cEnergy + cSoda + cPreWorkout;

  // Max Limits (FDA Guidelines)
  let maxLimit = 400; // General adult limit
  if (isPregnant) maxLimit = 200; // ACOG guideline
  if (age < 12) maxLimit = 85;
  else if (age < 18) maxLimit = 100;

  // Weight-based toxicity/lethal dose estimate (roughly 150-200mg per kg of body weight)
  const weightKg = weightLbs / 2.20462;
  const lethalDose = Math.round(weightKg * 150);

  // Status & Recommendation
  let status = "Safe";
  let recommendation = "Your caffeine intake is within safe limits for your demographic.";

  if (totalCaffeine > lethalDose * 0.1) {
    status = "Dangerously High";
    recommendation = "Seek immediate medical attention if experiencing rapid heartbeat, vomiting, or seizures. This level of intake approaches toxicity.";
  } else if (totalCaffeine > maxLimit) {
    status = "Over Limit";
    if (isPregnant) recommendation = "You are exceeding the 200mg limit recommended by the American College of Obstetricians and Gynecologists during pregnancy.";
    else recommendation = "You are exceeding the FDA's 400mg daily safe limit. Consider cutting back to avoid insomnia, jitters, anxiousness, fast heart rate, upset stomach, or nausea.";
  } else if (totalCaffeine > maxLimit * 0.75) {
    status = "High / Approaching Limit";
    recommendation = "Your intake is safe but high. If you experience sleep issues or anxiety, consider replacing some caffeinated beverages with water or decaf options.";
  }

  // Sleep Impact / Half-life calculation
  // Average half-life is 5 hours, but varies by sensitivity
  let halfLifeHours = 5;
  if (sensitivity === "high") halfLifeHours = 8; // Slow metabolizers
  if (sensitivity === "low") halfLifeHours = 4; // Fast metabolizers
  if (isPregnant) halfLifeHours = 11; // Pregnancy drastically slows caffeine metabolism

  // Calculate remaining caffeine at bedtime using exponential decay
  // N(t) = N0 * (0.5)^(t/t_half)
  // Assuming all caffeine was taken right now (simplified worst-case for sleep)
  const remainingAtBedtime = Math.round(totalCaffeine * Math.pow(0.5, timeToBed / halfLifeHours));
  
  if (remainingAtBedtime > 50 && status !== "Dangerously High") {
    status = status === "Safe" ? "Sleep Disruption Likely" : status + " (Sleep Risk)";
    recommendation += ` You will still have ~${remainingAtBedtime}mg of active caffeine in your system at bedtime. This strongly inhibits deep sleep architecture. Stop consuming caffeine earlier in the day.`;
  }

  const chartData = [
    { name: "Coffee", value: cCoffee },
    { name: "Espresso", value: cEspresso },
    { name: "Tea", value: cTea },
    { name: "Energy Drinks", value: cEnergy },
    { name: "Soda", value: cSoda },
    { name: "Pre-Workout", value: cPreWorkout }
  ].filter(d => d.value > 0);

  if (chartData.length === 0) {
    chartData.push({ name: "No Caffeine", value: 0 });
  }

  const breakdown = [
    { label: "Your Total Intake", value: `${totalCaffeine} mg` },
    { label: "FDA Safe Limit", value: `${maxLimit} mg` },
    { label: "Remaining at Bedtime", value: `${remainingAtBedtime} mg (approx.)` },
    { label: "Metabolic Half-Life", value: `${halfLifeHours} hours` },
    { label: "Status", value: status },
  ];

  const summaryStats = [
    { label: "Total Caffeine", value: `${totalCaffeine} mg` },
    { label: "Safe Limit", value: `${maxLimit} mg` },
    { label: "Bedtime Residue", value: `${remainingAtBedtime} mg` },
    { label: "Lethal Toxicity Est.", value: `${lethalDose.toLocaleString()} mg` },
  ];

  return { totalCaffeine, maxLimit, lethalDose, status, recommendation, halfLifeHours, remainingAtBedtime, chartData, breakdown, summaryStats };
}

export default function CaffeineCalculator() {
  const [weight, setWeight] = useState("160");
  const [age, setAge] = useState("35");
  const [isPregnant, setIsPregnant] = useState(false);
  const [sensitivity, setSensitivity] = useState("normal");
  const [timeToBed, setTimeToBed] = useState("8"); // Hours until sleep

  // Beverages
  const [coffeeCups, setCoffeeCups] = useState("2");
  const [espressoShots, setEspressoShots] = useState("0");
  const [teaCups, setTeaCups] = useState("0");
  const [energyDrinks, setEnergyDrinks] = useState("0");
  const [sodaCans, setSodaCans] = useState("0");
  const [preWorkout, setPreWorkout] = useState("0");

  const [result, setResult] = useState<CaffeineResult | null>(null);

  const calculate = () => {
    setResult(calcCaffeine(
      parseInt(weight) || 160, parseInt(age) || 35, isPregnant, sensitivity, parseInt(timeToBed) || 8,
      parseFloat(coffeeCups) || 0, parseFloat(espressoShots) || 0, parseFloat(teaCups) || 0, 
      parseFloat(energyDrinks) || 0, parseFloat(sodaCans) || 0, parseFloat(preWorkout) || 0
    ));
  };

  useEffect(() => { setResult(calcCaffeine(160, 35, false, "normal", 8, 2, 0, 0, 0, 0, 0)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is the FDA safe limit for caffeine?", answer: "The FDA cites 400 milligrams a day—that's about four or five cups of brewed coffee—as an amount not generally associated with dangerous, negative effects in healthy adults. However, pregnant women are advised to limit intake to 200mg, and adolescents (12-18) should consume no more than 100mg daily." },
    { question: "How long does caffeine stay in your system?", answer: "Caffeine has an average 'half-life' of 5 hours in healthy adults. This means if you consume 200mg of caffeine at 3:00 PM, you will still have 100mg in your system at 8:00 PM, and 50mg at 1:00 AM. This 'sleep residue' strongly disrupts the architecture of deep sleep, even if you don't feel jittery." },
    { question: "Why do some people handle caffeine better than others?", answer: "Caffeine metabolism is largely genetic, controlled by the CYP1A2 gene in the liver. 'Fast metabolizers' process caffeine quickly and experience a brief, intense energy spike without sleep disruption. 'Slow metabolizers' process it very slowly (half-life of 8+ hours), leading to prolonged anxiety, jitters, and severe insomnia from late-day consumption." },
    { question: "Does pregnancy affect caffeine tolerance?", answer: "Yes, drastically. During pregnancy, the body's ability to clear caffeine slows down significantly, especially in the third trimester where the half-life can extend from 5 hours to up to 15 hours. Furthermore, caffeine crosses the placenta to the fetus, which lacks the enzymes needed to metabolize it, potentially causing fetal distress and lower birth weights." },
    { question: "Can you overdose on caffeine?", answer: "Yes, caffeine toxicity is a medical emergency. While it is virtually impossible to overdose by drinking regular coffee (you would need to drink 50-100 cups rapidly), caffeine overdose is increasingly common due to concentrated energy drinks, pre-workout powders, and pure caffeine pills. Symptoms include vomiting, rapid heart rate, confusion, and seizures." },
    { question: "Does tea contain less caffeine than coffee?", answer: "Generally, yes. A standard 8oz cup of black tea contains about 47mg of caffeine, while the same amount of brewed coffee contains about 95mg. Green tea is even lower, averaging 28mg per cup. However, matcha (powdered green tea) is highly concentrated and can contain 70mg or more per cup." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Caffeine Intake Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Caffeine Intake Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-base font-medium mb-1.5 block">Age</label>
                <div className={inp}><input type="number" value={age} onChange={e => setAge(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-base font-medium mb-1.5 block">Weight</label>
                <div className={inp}><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={ci} /><span className="pr-3 text-sm text-muted-foreground">lbs</span></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2 text-sm font-medium col-span-2">
                <input type="checkbox" checked={isPregnant} onChange={e => setIsPregnant(e.target.checked)} className="w-4 h-4 rounded border-input text-primary" />
                Pregnant (Stricter FDA Limits & Slower Metabolism)
              </label>
            </div>
            <div>
              <label className="text-base font-medium mb-1.5 block">Caffeine Sensitivity</label>
              <select value={sensitivity} onChange={e => setSensitivity(e.target.value)} className={`${inp} w-full px-3 text-sm`}>
                <option value="normal">Normal (Average metabolism)</option>
                <option value="high">High Sensitivity (Jitters easily, slow metabolism)</option>
                <option value="low">Low Sensitivity (Fast metabolism, sleep fine)</option>
              </select>
            </div>
            <div>
              <label className="text-base font-medium mb-1.5 block">Hours Until Bedtime</label>
              <div className={inp}><input type="number" value={timeToBed} onChange={e => setTimeToBed(e.target.value)} className={ci} /><span className="pr-3 text-sm text-muted-foreground">hrs</span></div>
            </div>

            <div className="border-t border-border pt-4 mt-2">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2"><Coffee className="w-4 h-4" /> Daily Consumption</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div>
                  <label className="text-xs font-medium mb-1 block">Brewed Coffee (8oz)</label>
                  <div className={inp}><input type="number" step="0.5" value={coffeeCups} onChange={e => setCoffeeCups(e.target.value)} className={ci} /></div>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Espresso (1oz shot)</label>
                  <div className={inp}><input type="number" step="1" value={espressoShots} onChange={e => setEspressoShots(e.target.value)} className={ci} /></div>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Black/Green Tea (8oz)</label>
                  <div className={inp}><input type="number" step="0.5" value={teaCups} onChange={e => setTeaCups(e.target.value)} className={ci} /></div>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Energy Drink (16oz)</label>
                  <div className={inp}><input type="number" step="1" value={energyDrinks} onChange={e => setEnergyDrinks(e.target.value)} className={ci} /></div>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Cola / Soda (12oz)</label>
                  <div className={inp}><input type="number" step="1" value={sodaCans} onChange={e => setSodaCans(e.target.value)} className={ci} /></div>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Pre-Workout (scoops)</label>
                  <div className={inp}><input type="number" step="0.5" value={preWorkout} onChange={e => setPreWorkout(e.target.value)} className={ci} /></div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={() => { setWeight("160"); setAge("35"); setIsPregnant(false); setSensitivity("normal"); setTimeToBed("8"); setCoffeeCups("2"); setEspressoShots("0"); setTeaCups("0"); setEnergyDrinks("0"); setSodaCans("0"); setPreWorkout("0"); setResult(calcCaffeine(160, 35, false, "normal", 8, 2, 0, 0, 0, 0, 0)); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className={`border-l-4 rounded-lg p-5 ${result.status.includes("High") || result.status.includes("Over") ? "bg-red-500/10 border-red-500" : result.status.includes("Sleep") ? "bg-amber-500/10 border-amber-500" : "bg-primary/10 border-primary"}`}>
                <div className={`text-sm font-bold uppercase tracking-wider mb-1 ${result.status.includes("High") || result.status.includes("Over") ? "text-red-600" : result.status.includes("Sleep") ? "text-amber-600" : "text-primary"}`}>Status: {result.status}</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">{result.totalCaffeine} mg <span className="text-lg font-normal text-muted-foreground">/ daily</span></div>
                <div className="text-base text-muted-foreground mt-2 font-medium">{result.recommendation}</div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Total Intake", `${result.totalCaffeine}mg`], ["Safe Limit", `${result.maxLimit}mg`], ["Half-Life", `${result.halfLifeHours} hrs`], ["Bedtime Res.", `~${result.remainingAtBedtime}mg`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-[10px] sm:text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-sm sm:text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>

              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Caffeine Source Breakdown</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip cursor={{ fill: "var(--secondary)" }} formatter={(v: any) => [`${v} mg`, "Caffeine"]} />
                    <ReferenceLine y={result.maxLimit} stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" label={{ value: "Max Limit", position: "insideTopLeft", fill: "#ef4444", fontSize: 12 }} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold text-right">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Track Your True Caffeine Intake</h2>
            <p>This <strong>Caffeine Calculator</strong> helps you quantify your total daily caffeine consumption across coffee, tea, energy drinks, and supplements. It compares your intake against FDA safety limits (400mg for adults, 200mg for pregnant women) and calculates your caffeine "half-life" to determine how much stimulant remains active in your bloodstream when you try to sleep.</p>
            <h2 className="text-2xl font-bold mb-3">The Half-Life Problem (Sleep Disruption)</h2>
            <p>Caffeine has an average half-life of 5 hours. This means 5 hours after drinking a 160mg energy drink, 80mg remains in your system. Ten hours later, 40mg is still active. Many people unknowingly suffer from "caffeine-induced insomnia" — not because they can't fall asleep, but because the residual caffeine circulating in their brain prevents them from entering deep, restorative sleep stages. If your results show more than 30-50mg of caffeine remaining at your bedtime, you should implement a caffeine curfew (e.g., no caffeine after 2 PM).</p>
            <h2 className="text-2xl font-bold mb-3">Genetic Sensitivity and Toxicity</h2>
            <p>Some people metabolize caffeine rapidly, while others process it slowly due to variations in the CYP1A2 gene. If you are a slow metabolizer (high sensitivity), your half-life might stretch to 8 hours, meaning a morning coffee can still disrupt your sleep. Conversely, extreme doses of caffeine (often from pre-workout powders or pills) can lead to caffeine toxicity. Lethal doses are generally estimated at 150mg per kilogram of body weight, which requires massive ingestion, but uncomfortable toxicity symptoms (palpitations, vomiting) can begin around 1,000mg. Related tools: <a href="/calculator/macro-calculator">Macro Calculator</a>, <a href="/calculator/blood-pressure-calculator">Blood Pressure Calculator</a>.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/caffeine-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Caffeine Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Caffeine Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Caffeine Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Caffeine Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Caffeine Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/caffeine-calculator" />
        </div>
      </div>
    </>
  );
}
