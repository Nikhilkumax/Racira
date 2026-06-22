"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, Dumbbell, Search } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine, CartesianGrid } from "recharts";

interface MetResult {
  caloriesBurned: number;
  caloriesPerHour: number;
  selectedMet: number;
  totalOxygen: number;
  activityName: string;
  chartData: any[];
}

// Representative sample of the Compendium of Physical Activities
const MET_DATABASE = [
  { category: "Resting / Light", name: "Sleeping", met: 0.95 },
  { category: "Resting / Light", name: "Sitting quietly (watching TV, reading)", met: 1.3 },
  { category: "Resting / Light", name: "Standing quietly", met: 1.5 },
  { category: "Walking", name: "Walking, slow (2.0 mph)", met: 2.8 },
  { category: "Walking", name: "Walking, moderate (3.0 mph)", met: 3.5 },
  { category: "Walking", name: "Walking, brisk (4.0 mph)", met: 5.0 },
  { category: "Walking", name: "Walking upstairs", met: 8.0 },
  { category: "Running", name: "Jogging (5.0 mph / 12 min mile)", met: 8.3 },
  { category: "Running", name: "Running (6.0 mph / 10 min mile)", met: 9.8 },
  { category: "Running", name: "Running (8.0 mph / 7.5 min mile)", met: 11.8 },
  { category: "Running", name: "Running (10.0 mph / 6 min mile)", met: 14.5 },
  { category: "Gym / Fitness", name: "Weight lifting (light/moderate)", met: 3.5 },
  { category: "Gym / Fitness", name: "Weight lifting (vigorous/powerlifting)", met: 6.0 },
  { category: "Gym / Fitness", name: "Stationary cycling (moderate)", met: 6.8 },
  { category: "Gym / Fitness", name: "Stationary cycling (vigorous)", met: 8.8 },
  { category: "Gym / Fitness", name: "Calisthenics (pushups, situps, vigorous)", met: 8.0 },
  { category: "Gym / Fitness", name: "Yoga (Hatha)", met: 2.5 },
  { category: "Sports", name: "Basketball (game)", met: 8.0 },
  { category: "Sports", name: "Tennis (singles)", met: 7.3 },
  { category: "Sports", name: "Swimming (freestyle, moderate)", met: 8.3 },
  { category: "Sports", name: "Swimming (freestyle, vigorous)", met: 9.8 },
  { category: "Sports", name: "Soccer (competitive)", met: 10.0 },
  { category: "Home / Yard", name: "Vacuuming / Sweeping", met: 3.3 },
  { category: "Home / Yard", name: "Mowing lawn (push mower)", met: 5.5 },
  { category: "Home / Yard", name: "Shoveling snow (moderate)", met: 7.5 }
];

function calcMET(
  weightLbs: number, durationMins: number, metValue: number, activityName: string
): MetResult {
  const weightKg = weightLbs / 2.20462;
  
  // Clinical standard: Calories/min = (MET * 3.5 * weightKg) / 200
  const calPerMin = (metValue * 3.5 * weightKg) / 200;
  const caloriesBurned = calPerMin * durationMins;
  const caloriesPerHour = calPerMin * 60;

  // Total oxygen consumed (1 MET = 3.5 ml O2/kg/min)
  const totalOxygen = (metValue * 3.5 * weightKg * durationMins) / 1000;

  // Build chart comparing selected activity against benchmarks
  const chartData = [
    { name: "Sleeping", met: 0.95, fill: "#e2e8f0" },
    { name: "Walking", met: 3.5, fill: "#94a3b8" },
    { name: "Selected", met: metValue, fill: "#3b82f6" },
    { name: "Jogging", met: 8.3, fill: "#94a3b8" },
    { name: "Running", met: 14.5, fill: "#e2e8f0" },
  ];

  // Sort by MET so it looks like a clean progression
  chartData.sort((a, b) => a.met - b.met);

  return { 
    caloriesBurned: Math.round(caloriesBurned), 
    caloriesPerHour: Math.round(caloriesPerHour), 
    selectedMet: metValue,
    totalOxygen: Number(totalOxygen.toFixed(1)),
    activityName,
    chartData
  };
}

export default function MetsCalculator() {
  const [weight, setWeight] = useState("160");
  const [duration, setDuration] = useState("45");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedActivity, setSelectedActivity] = useState(MET_DATABASE[4]); // Walking moderate

  const [result, setResult] = useState<MetResult | null>(null);

  const calculate = () => {
    const w = parseInt(weight), d = parseInt(duration);
    if (w > 0 && d > 0) {
      setResult(calcMET(w, d, selectedActivity.met, selectedActivity.name));
    }
  };

  useEffect(() => { setResult(calcMET(160, 45, MET_DATABASE[4].met, MET_DATABASE[4].name)); }, []);

  const filteredActivities = MET_DATABASE.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.category.toLowerCase().includes(searchQuery.toLowerCase()));

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What exactly is a MET?", answer: "MET stands for Metabolic Equivalent of Task. It is a physiological measure expressing the energy cost of physical activities. One MET is defined as the exact amount of energy your body burns while sitting quietly on the couch (your resting metabolic rate). Therefore, an activity with a MET value of 5 means your body is working 5 times harder and burning 5 times as many calories as it would if you were just sitting still." },
    { question: "How does body weight affect MET calorie burn?", answer: "Heavier individuals physically burn more calories performing the exact same activity as lighter individuals. This is pure physics: it takes more energy (and more oxygen) to move a larger mass across a distance. The MET formula accounts for this by directly multiplying the MET value by your body weight in kilograms. If you weigh 200 lbs, you will burn significantly more calories running a mile than someone who weighs 150 lbs." },
    { question: "Are METs more accurate than fitness trackers?", answer: "Yes, in many specific scenarios. Commercial fitness trackers (like Apple Watches or Fitbits) rely heavily on an optical heart rate sensor to estimate calorie burn. This causes them to drastically overestimate the calories burned during weightlifting or high-stress situations (which spike your heart rate but do not require massive oxygen consumption). Because METs rely on clinical measurements of oxygen consumption (VO2), they are the gold standard for nutritional planning." },
    { question: "Why do some activities have a range of METs?", answer: "Because intensity changes everything. Walking slowly at 2 mph is only 2.8 METs, but power walking at 4 mph jumps to 5.0 METs. Weightlifting can range from 3.5 METs (light lifting with long rest periods) to 6.0 METs (vigorous powerlifting or circuit training). If you are unsure of your intensity, it is always best to choose a moderate MET value so you don't accidentally overestimate your caloric deficit." },
    { question: "What is the exact mathematical formula used?", answer: "The clinical formula utilized by dietitians is: Calories Burned per Minute = (METs × 3.5 × Body Weight in kg) ÷ 200. This specific formula is derived from the biological fact that 1 MET equals the physiological consumption of exactly 3.5 milliliters of oxygen per kilogram of body weight per minute." },
    { question: "Can I use METs to calculate my total daily calorie burn?", answer: "No, METs are only used to calculate the active calories burned during a specific period of physical exertion. To find your total daily burn, you need to calculate your Total Daily Energy Expenditure (TDEE), which takes your Basal Metabolic Rate (BMR) and adds your active MET calories on top of it." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "METs Activity Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">METs Activity Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Your Body Weight</label>
                <div className={inp}><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={ci} /><span className="pr-3 text-sm text-muted-foreground">lbs</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Duration of Activity</label>
                <div className={inp}><input type="number" value={duration} onChange={e => setDuration(e.target.value)} className={ci} /><span className="pr-3 text-sm text-muted-foreground">mins</span></div>
              </div>
            </div>
            
            <div className="border-t border-border pt-4 mt-2">
              <label className="text-sm font-bold mb-2 flex items-center justify-between">
                <span>Select Physical Activity</span>
                <span className="text-xs px-2.5 py-1 bg-primary/10 text-primary font-bold rounded-md border border-primary/20">{selectedActivity.met.toFixed(1)} METs</span>
              </label>
              
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search activities (e.g. running, yoga...)" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 text-base rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm transition-shadow"
                />
              </div>

              <div className="h-[240px] overflow-y-auto border border-input rounded-md bg-background divide-y divide-border shadow-inner">
                {filteredActivities.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">No activities found matching your search.</div>
                ) : (
                  filteredActivities.map((act, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => setSelectedActivity(act)}
                      className={`w-full text-left px-3 py-2.5 text-sm transition-colors flex justify-between items-center ${selectedActivity.name === act.name ? "bg-primary/5 border-l-4 border-l-primary" : "border-l-4 border-l-transparent hover:bg-secondary"}`}
                    >
                      <span className="truncate pr-2 font-medium">{act.name}</span>
                      <span className="font-mono text-xs font-bold text-muted-foreground shrink-0">{act.met.toFixed(1)}</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">
                <Calculator className="h-4 w-4" /> Calculate Energy Burn
              </button>
              <button onClick={() => { setWeight("160"); setDuration("45"); setSearchQuery(""); setSelectedActivity(MET_DATABASE[4]); setResult(calcMET(160, 45, MET_DATABASE[4].met, MET_DATABASE[4].name)); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-5 shadow-sm">
                <div className="text-xs font-bold uppercase tracking-wider mb-1 text-primary">Total Calories Burned</div>
                <div className="flex items-baseline gap-2">
                  <div className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">{result.caloriesBurned}</div>
                  <div className="text-xl font-semibold text-muted-foreground">kcal</div>
                </div>
                <div className="text-sm font-medium text-muted-foreground mt-2 leading-relaxed">
                  Burning {result.caloriesBurned} calories doing <span className="font-bold text-foreground">{result.activityName}</span> for {duration} minutes.
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-0 border border-border rounded-lg overflow-hidden bg-card shadow-sm">
                {[
                  ["Metabolic Equivalent", `${result.selectedMet.toFixed(1)} METs`], 
                  ["Burn Rate", `${result.caloriesPerHour} kcal/hr`],
                  ["Oxygen Consumed", `${result.totalOxygen} Liters`],
                  ["Body Weight Input", `${weight} lbs`]
                ].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i % 2 !== 0 ? "border-l border-border" : ""} ${i > 1 ? "border-t border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-sm sm:text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold mb-4">MET Intensity Comparison</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip cursor={{ fill: 'transparent' }} formatter={(v: number) => [`${v.toFixed(1)}`, "METs"]} />
                    <Bar dataKey="met" radius={[4, 4, 0, 0]} maxBarSize={50}>
                      {result.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground mt-3 text-center">Comparing your selected activity against standardized clinical benchmarks.</p>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold mb-3 flex items-center gap-2"><Dumbbell className="w-5 h-5 text-primary" /> Physiological Breakdown</h3>
                <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                  <p>
                    You selected an activity with a clinical value of <strong className="text-foreground">{result.selectedMet.toFixed(1)} METs</strong>. 
                    This biologically means that while performing this specific activity, your body requires exactly <strong className="text-foreground">{result.selectedMet.toFixed(1)} times</strong> the amount of energy (and oxygen) than it would if you were just resting quietly.
                  </p>
                  <p>
                    During this {duration}-minute session, your cardiovascular system pumped and your muscles consumed an estimated <strong className="text-foreground">{result.totalOxygen} liters of oxygen</strong> to generate the ATP (cellular energy) required to sustain the physical movement.
                  </p>
                </div>
              </div>
            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>The Science of METs (Metabolic Equivalents)</h2>
            <p>If you are attempting to lose body fat or track your daily energy expenditure, calculating exactly how many calories you burn during a workout is critical. However, most commercial fitness trackers provide highly inaccurate data. To get clinical-grade accuracy, nutritionists and sports scientists rely on the <strong>Metabolic Equivalent of Task (MET)</strong>.</p>
            <p>A MET is a standardized physiological measure expressing the energy cost (or caloric burn rate) of physical activities. <strong>One MET is defined as the exact amount of energy your body burns while sitting completely still on the couch.</strong> This baseline is your resting metabolic rate.</p>
            <p>The system is incredibly intuitive. If you perform an activity with a MET value of 5.0 (like brisk walking), it means your body is working exactly 5 times harder, and burning 5 times as many calories per minute, than it would if you were just sitting down. If you run at a speed of 10 mph (14.5 METs), you are forcing your body to work 14.5 times harder than its resting baseline.</p>

            <h2>Why METs Are More Accurate Than Smartwatches</h2>
            <p>Millions of people rely on their Apple Watches, Fitbits, or Garmin devices to tell them how many calories they burned during a workout. Unfortunately, these devices are notoriously inaccurate, often overestimating caloric burn by 20% to 40%.</p>
            <p>Why? Because fitness trackers rely almost entirely on an optical <strong>Heart Rate Sensor</strong> to estimate calories. While heart rate is a decent proxy for cardiovascular exercise like running or cycling, it completely falls apart in other scenarios.</p>
            <p>For example, if you are lifting heavy weights, your heart rate will spike dramatically due to central nervous system stress and blood pressure changes, but your body is not actually consuming massive amounts of oxygen. Your smartwatch will see the 160 BPM heart rate and incorrectly tell you that you burned 600 calories in an hour of weightlifting, when the clinical reality is closer to 250 calories.</p>
            <p>METs solve this problem because they are not based on heart rate. METs are based on clinical laboratory measurements of actual <strong>oxygen consumption (VO2)</strong>. Biologically, the only way your body can burn a calorie is by combining fuel (food) with oxygen. By measuring exactly how much oxygen an activity requires, METs provide the gold standard for caloric burn accuracy.</p>

            <h2>The Compendium of Physical Activities</h2>
            <p>You cannot calculate a MET value yourself. It must be tested in a laboratory using respiratory masks that measure a subject's oxygen inhalation and carbon dioxide exhalation. The values used in this calculator are drawn directly from the <strong>Compendium of Physical Activities</strong>.</p>
            <p>Developed in the late 1980s by Dr. Bill Ainsworth and continuously updated by sports researchers, the Compendium is a massive database that standardizes the MET values for hundreds of human movements. It covers everything from sleeping (0.95 METs) to competitive soccer (10.0 METs) to shoveling heavy snow (7.5 METs).</p>

            <h2>How The Calculator Determines Your Calorie Burn</h2>
            <p>To determine your exact caloric expenditure, the calculator requires three specific variables: the MET value of the activity, your body weight, and the duration of the activity.</p>
            
            <h3>1. The Weight Multiplier</h3>
            <p>Body weight is a critical factor in the equation. This is pure physics: it takes more energy (and more oxygen) to move a larger, heavier mass across a distance than a lighter mass. Heavier individuals physically burn more calories performing the exact same activity as lighter individuals.</p>
            <p>The standard MET formula accounts for this by directly multiplying the MET value by your body weight in kilograms. If a 150 lb person and a 200 lb person both jog at 5 mph (8.3 METs) for 30 minutes, the 200 lb person will burn significantly more calories because their cardiovascular system had to work harder to move the extra 50 lbs.</p>

            <h3>2. The Clinical Formula</h3>
            <p>The precise mathematical formula utilized by this calculator (and registered dietitians) is:</p>
            <p><code>Calories Burned per Minute = (METs × 3.5 × Body Weight in kg) ÷ 200</code></p>
            <p>Why the number 3.5? Because clinical testing has proven that 1 MET mathematically equals the physiological consumption of exactly 3.5 milliliters of oxygen per kilogram of body weight per minute. The formula calculates your total oxygen consumption and converts it into heat energy (calories).</p>

            <h2>Limitations of the MET System</h2>
            <p>While the MET system is the clinical gold standard, it is not flawless. Its primary limitation is that it assumes every person has the exact same mechanical efficiency. </p>
            <p>For example, a professional marathon runner has highly efficient running mechanics. They do not bounce, they do not waste kinetic energy, and their stride is perfect. If they run at 8 mph alongside an amateur runner with terrible form who bounces and thrashes, the amateur runner will actually burn more calories (require more oxygen) to maintain that speed because they are mechanically inefficient. The MET tables provide a population average, but individual biomechanics can cause minor deviations in the final caloric burn.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/mets-calculator" />
          <PopularCalculators exclude="/calculator/mets-calculator" />
        </div>
      </div>
    </>
  );
}
