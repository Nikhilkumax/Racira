"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Dog } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// 1. TypeScript Interfaces
interface DogPregnancyInputs {
  matingDate: string; // YYYY-MM-DD
}

interface DogPregnancyResults {
  avgDueDate: string;
  minDueDate: string;
  maxDueDate: string;
  
  daysPregnant: number;
  daysRemaining: number;
  progressPct: number;

  milestones: { name: string; date: string; past: boolean; desc: string }[];
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string; colorClass?: string }[];
}

// 2. Pure Calculation Function
const calculateDogPregnancy = (inputs: DogPregnancyInputs): DogPregnancyResults | null => {
  if (!inputs.matingDate) return null;

  const base = new Date(inputs.matingDate);
  base.setMinutes(base.getMinutes() + base.getTimezoneOffset());
  
  // Standard dog gestation is 58-68 days. Average 63 from ovulation/mating.
  const minDate = new Date(base);
  minDate.setDate(base.getDate() + 58);

  const avgDate = new Date(base);
  avgDate.setDate(base.getDate() + 63);

  const maxDate = new Date(base);
  maxDate.setDate(base.getDate() + 68);

  const today = new Date();
  today.setHours(0,0,0,0);

  let diffTime = today.getTime() - base.getTime();
  let daysPregnant = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (daysPregnant < 0) daysPregnant = 0;
  if (daysPregnant > 70) daysPregnant = 70; // Hard cap

  let progressPct = (daysPregnant / 63) * 100;
  if (progressPct > 100) progressPct = 100;

  const daysRemaining = Math.max(0, 63 - daysPregnant);

  // Milestones
  // Day 14-21: Embryos attach
  // Day 28-30: Heartbeats visible on ultrasound, palpable
  // Day 45: Skeletons calcify, visible on X-ray
  // Day 50: Fetal movement visible, nesting behavior
  // Day 58+: Safe delivery window opens
  
  const mDay20 = new Date(base); mDay20.setDate(base.getDate() + 20);
  const mDay28 = new Date(base); mDay28.setDate(base.getDate() + 28);
  const mDay45 = new Date(base); mDay45.setDate(base.getDate() + 45);
  const mDay50 = new Date(base); mDay50.setDate(base.getDate() + 50);

  const milestones = [
    { name: "Embryo Implantation", date: mDay20.toLocaleDateString(), past: today >= mDay20, desc: "Embryos attach to the uterine wall." },
    { name: "Ultrasound & Palpation", date: mDay28.toLocaleDateString(), past: today >= mDay28, desc: "Heartbeats visible via ultrasound. Vet can palpate the abdomen." },
    { name: "Skeletons Calcify (X-Ray)", date: mDay45.toLocaleDateString(), past: today >= mDay45, desc: "Puppy skeletons harden. Best time for an X-ray to count the litter." },
    { name: "Nesting & Movement", date: mDay50.toLocaleDateString(), past: today >= mDay50, desc: "Mother seeks a quiet place. Puppy movement may be visible." },
    { name: "Safe Delivery Window", date: minDate.toLocaleDateString(), past: today >= minDate, desc: "Whelping can safely occur anytime from this date forward." }
  ];

  const currentStage = daysPregnant < 21 ? "Early Gestation" : daysPregnant < 45 ? "Mid Gestation" : "Late Gestation / Whelping Prep";

  const chartData = [
    { name: "Early Gestation", value: 21, color: daysPregnant >= 21 ? "hsl(var(--primary))" : daysPregnant > 0 ? "hsl(var(--primary)/0.5)" : "#e2e8f0" },
    { name: "Mid Gestation", value: 24, color: daysPregnant >= 45 ? "#10b981" : daysPregnant > 21 ? "#10b98150" : "#e2e8f0" },
    { name: "Late Gestation", value: 18, color: daysPregnant >= 63 ? "#f59e0b" : daysPregnant > 45 ? "#f59e0b50" : "#e2e8f0" }
  ];

  const summaryStats = [
    { label: "Estimated Due Date", value: avgDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }), colorClass: "text-primary font-bold" },
    { label: "Delivery Window", value: `${minDate.toLocaleDateString()} - ${maxDate.toLocaleDateString()}` },
    { label: "Current Progress", value: `Day ${daysPregnant} of 63` },
    { label: "Days Remaining", value: `${daysRemaining} days` },
    { label: "Current Stage", value: currentStage }
  ];

  return {
    avgDueDate: avgDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    minDueDate: minDate.toLocaleDateString(),
    maxDueDate: maxDate.toLocaleDateString(),
    daysPregnant,
    daysRemaining,
    progressPct,
    milestones,
    chartData,
    summaryStats
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  matingDate: ""
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold mb-0.5">{payload[0].name}</p>
        <p className="text-muted-foreground">{payload[0].value} Days Duration</p>
      </div>
    );
  }
  return null;
};

// Input Component
const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1.5">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
        {...props}
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

export default function DogPregnancyDurationCalculator() {
  // 4. Component State
  const [matingDate, setMatingDate] = useState(DEFAULTS.matingDate);
  const [results, setResults] = useState<DogPregnancyResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateDogPregnancy({ matingDate }));
  };

  const handleReset = () => {
    setMatingDate(DEFAULTS.matingDate);
    setResults(null);
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Dog Pregnancy Timeline</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "How long is a dog pregnant?", answer: "The normal gestation period for a dog is 58 to 68 days, with an average of exactly 63 days (nine weeks) from the date of ovulation." },
    { question: "When should I take my dog to the vet for a pregnancy check?", answer: "The ideal time for a first ultrasound is between days 28 and 35. At this point, the vet can confirm pregnancy and check fetal heartbeats, though it is difficult to accurately count the puppies." },
    { question: "How can I know exactly how many puppies she will have?", answer: "The only highly accurate way to count the litter is an X-ray (radiograph). This should be performed around day 45 to 55, after the fetal skeletons have calcified and are visible on the scan." },
    { question: "What is a whelping box?", answer: "A whelping box is a safe, enclosed area where the mother will deliver and nurse her puppies. It should have low sides so the mother can step in and out, but high enough to keep the puppies safely inside." },
    { question: "How do I know labor is starting?", answer: "A dog's normal body temperature is 101-102.5°F. About 12-24 hours before whelping, her rectal temperature will drop below 99°F. She will also likely refuse food, pant heavily, and exhibit nesting behavior." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Dog Pregnancy Duration Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Dog Pregnancy Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          
          {/* LEFT 460px: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Dog className="h-4 w-4" /> Canine Gestation Tracker
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Enter the date of mating or ovulation to calculate your dog's estimated whelping date and track critical developmental milestones.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="mdate" label="Date of Mating / Ovulation" type="date" value={matingDate} onChange={setMatingDate} />
            </div>

            <div className="flex gap-3 mt-4">
              <button type="button" onClick={handleCalculate} disabled={!matingDate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm disabled:opacity-50">Calculate</button>
              <button type="button" onClick={handleReset} className="w-12 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center focus:outline-none" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT fluid: Results */}
          <div className="flex flex-col gap-4">
            {results ? (
              <div ref={printRef} className="flex flex-col gap-4 animate-fade-in-up">
                
                {/* 1. Primary Result Card */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative overflow-hidden">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden z-10" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="relative z-10">
                    <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Whelping Date</div>
                    <div className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">{results.avgDueDate}</div>
                    <div className="text-sm text-muted-foreground mt-2 font-medium">
                      Based on an average 63-day gestation. Normal delivery window: {results.minDueDate} to {results.maxDueDate}.
                    </div>
                  </div>
                  <Dog className="absolute -bottom-4 -right-4 h-32 w-32 text-primary/10" />
                </div>

                {/* 2. Progress Bar */}
                <div className="card-calculator !p-5 border border-border bg-card">
                  <div className="flex justify-between items-end mb-2">
                    <div className="text-sm font-bold uppercase text-muted-foreground tracking-wider">Pregnancy Progress</div>
                    <div className="text-2xl font-bold text-primary">Day {results.daysPregnant}</div>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-4 overflow-hidden shadow-inner">
                    <div 
                      className="bg-primary h-full rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${results.progressPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs font-semibold text-muted-foreground">
                    <span>Day 0</span>
                    <span>Day 63</span>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  {/* 3. Summary Statistics */}
                  <div className="bg-muted/30 border border-border rounded-lg p-5 h-full">
                    <h3 className="text-base font-bold mb-4">Pregnancy Details</h3>
                    <div className="grid grid-cols-1 gap-y-4 text-base">
                      {results.summaryStats.map((stat, i) => (
                        <div key={i} className="flex justify-between items-center border-b border-border/40 pb-2 last:border-0 last:pb-0">
                          <span className="text-muted-foreground">{stat.label}:</span>
                          <span className={`font-semibold ${stat.colorClass || ''}`}>{stat.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. Chart / Visualization */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[220px]">
                    <h3 className="text-base font-bold mb-2 w-full text-left">Gestation Phases</h3>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie
                          data={results.chartData}
                          cx="50%" cy="50%"
                          startAngle={180} endAngle={0}
                          innerRadius={50} outerRadius={70}
                          paddingAngle={2} dataKey="value"
                        >
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="text-center -mt-8">
                      <div className="text-xl font-black text-foreground">{results.progressPct.toFixed(0)}%</div>
                    </div>
                  </div>
                </div>

                {/* 5. Milestones Table */}
                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Developmental Milestones</h3>
                  <div className="flex flex-col gap-4">
                    {results.milestones.map((milestone, i) => (
                      <div key={i} className={`flex gap-4 p-3 rounded-lg border border-border/50 ${milestone.past ? "bg-secondary/30 opacity-70" : "bg-card"}`}>
                        <div className="flex flex-col items-center justify-start mt-1">
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${milestone.past ? "bg-muted-foreground" : "bg-primary"}`}></div>
                          {i !== results.milestones.length - 1 && <div className="w-px h-full bg-border mt-2"></div>}
                        </div>
                        <div className="flex flex-col flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <span className={`font-bold ${milestone.past ? "line-through text-muted-foreground" : ""}`}>{milestone.name}</span>
                            <span className={`text-sm ${milestone.past ? "text-muted-foreground" : "font-bold"}`}>{milestone.date}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{milestone.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <Dog className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium">Enter the mating date and click Calculate to view your dog's pregnancy timeline and developmental milestones.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding Canine Gestation</h2>
            <p>If you are a dog breeder or have an intact female dog that recently mated, knowing the exact timeline of her pregnancy is critical for ensuring the health of both the mother (dam) and her puppies. The <strong>Dog Pregnancy Calculator</strong> takes the guesswork out of canine reproduction. By simply inputting the date of mating or ovulation, our algorithm generates a precise timeline outlining the estimated whelping date, safe delivery windows, and key fetal developmental milestones.</p>
            <p>Canine pregnancy is remarkably short compared to humans, meaning physiological changes happen rapidly. Proper nutrition, timely veterinary care, and adequate whelping preparation are required at very specific intervals to prevent life-threatening complications like eclampsia or dystocia.</p>

            <h2>How Long is a Dog Pregnant?</h2>
            <p>The standard gestation period for a domestic dog is <strong>63 days</strong> (exactly 9 weeks) from the date of ovulation. However, unlike humans, the exact date of conception can be difficult to pinpoint because a female dog's eggs are not immediately mature upon ovulation, and sperm can live inside the female tract for up to a week.</p>
            <p>Because of this biological variable, the actual length of pregnancy measured from the date of mating can range anywhere from <strong>58 to 68 days</strong>. Our calculator uses the 63-day average to determine the primary Estimated Whelping Date, but it also provides a safe delivery window. If your dog surpasses day 68 without going into labor, it is considered a medical emergency and requires immediate veterinary intervention.</p>

            <h2>Early Gestation (Days 1 to 21)</h2>
            <p>During the first three weeks of pregnancy, you will likely notice no physical or behavioral changes in your dog. The fertilized embryos are spending this time floating down the fallopian tubes toward the uterus. Around Day 16, they finally embed into the uterine lining.</p>
            <p>It is crucial during this phase to feed the mother her normal, high-quality maintenance diet. Do not increase her food intake or switch to puppy food yet. Overfeeding in the first three weeks can cause unnecessary weight gain, which actually increases the risk of dystocia (difficult labor) later on. Keep her exercise routine normal, but avoid extremely strenuous activities or high-stress environments.</p>

            <h2>Mid-Gestation and Veterinary Checks (Days 22 to 45)</h2>
            <p>By Week 4, the pregnancy becomes medically detectable. At this stage, the fetuses are developing vital organs and facial features. Between Day 28 and Day 35, you should schedule your first prenatal veterinary visit.</p>
            <p>During this visit, the vet has two primary ways to confirm the pregnancy. First, they can perform abdominal palpation, feeling the uterus for amniotic sacs that feel roughly the size of ping-pong balls. Second, they can perform an ultrasound to visually detect the fetal heartbeats. While an ultrasound is excellent for confirming viability, it is highly inaccurate for counting the total number of puppies, as fetuses can easily hide behind one another.</p>

            <h2>Late Gestation and Fetal Counting (Days 46 to 63)</h2>
            <p>The final phase of pregnancy is focused on rapid fetal weight gain. The mother's abdomen will swell significantly, and her caloric needs will double or even triple. You must slowly transition her diet to a high-calorie, calcium-rich puppy formulation to support the rapid growth.</p>
            <p>Around Day 45 to Day 50, the fetal skeletons calcify. This is the optimal time to return to the vet for an abdominal X-ray (radiograph). Counting the fetal skulls and spines on the X-ray is the only accurate way to determine litter size. Knowing exactly how many puppies are inside the mother is critical; if the X-ray shows 6 puppies but she stops labor after delivering 5, you know she needs emergency veterinary help.</p>

            <h2>Preparing the Whelping Box</h2>
            <p>About two weeks before the estimated whelping date, you must introduce the mother to her <strong>Whelping Box</strong>. This is a secure, quiet, and warm enclosure where she will give birth and nurse the puppies. The box should have low sides to allow the mother to easily step over, but high enough to prevent the blind, deaf newborn puppies from crawling out.</p>
            <p>Line the box with several layers of clean newspaper or washable whelping pads. Place it in a quiet, low-traffic area of your home, away from other pets and loud noises. If the mother is not comfortable with the location, she may attempt to move the puppies after birth, which is highly dangerous.</p>

            <h2>Recognizing the Signs of Labor</h2>
            <p>As the whelping window opens, you should begin taking the mother's rectal temperature twice a day. A dog's normal temperature is between 101°F and 102.5°F. The single most reliable indicator that labor is imminent is a sudden temperature drop. When her temperature drops below 99°F, Stage 1 labor will commence within 12 to 24 hours.</p>
            <p>During Stage 1 labor, the cervix dilates. The mother will appear restless, pant heavily, shiver, and begin nesting—digging at the blankets in the whelping box. She will likely refuse all food and may vomit. This phase can last anywhere from 6 to 12 hours.</p>

            <h2>The Delivery (Stage 2 Labor)</h2>
            <p>Stage 2 labor involves strong abdominal contractions and the actual delivery of the puppies. Puppies can be born head-first or tail-first; both are completely normal in dogs. Typically, a puppy is born every 45 to 60 minutes, though the mother may rest for a few hours halfway through the litter.</p>
            <p>Normally, the mother will instinctively break the amniotic sac, sever the umbilical cord with her teeth, and vigorously lick the puppy to stimulate its breathing. If she fails to do this within the first minute, you must immediately step in. Tear the sac open near the puppy's head, clear the fluid from its nose and mouth with a bulb syringe, and rub the puppy vigorously with a warm towel until it cries.</p>

            <h2>When to Call the Emergency Veterinarian</h2>
            <p>Whelping is a natural process, but complications can turn fatal very quickly. You must contact an emergency veterinarian immediately if you observe any of the following:</p>
            <ul>
              <li>The mother experiences strong, active contractions for over 30 minutes without producing a puppy.</li>
              <li>More than two hours have passed since the previous puppy, and you know there are more inside based on the X-ray count.</li>
              <li>The mother exhibits extreme lethargy, tremors, or muscle spasms (a sign of eclampsia, or 'milk fever').</li>
              <li>You observe significant amounts of bright red blood or foul-smelling green discharge before any puppies are born.</li>
            </ul>
            <p>By utilizing the Dog Pregnancy Calculator and strictly adhering to this timeline of veterinary checks, you maximize the chances of a smooth delivery and a healthy litter of puppies.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/dog-pregnancy-duration-calculator" />
          <PopularCalculators exclude="/calculator/dog-pregnancy-duration-calculator" />
        </div>
      </div>
    </>
  );
}
