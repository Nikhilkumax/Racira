"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Cat } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// 1. TypeScript Interfaces
interface CatPregnancyInputs {
  matingDate: string; // YYYY-MM-DD
}

interface CatPregnancyResults {
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
const calculateCatPregnancy = (inputs: CatPregnancyInputs): CatPregnancyResults | null => {
  if (!inputs.matingDate) return null;

  const base = new Date(inputs.matingDate);
  base.setMinutes(base.getMinutes() + base.getTimezoneOffset());
  
  // Standard cat gestation is 63-65 days. Average 64.
  const minDate = new Date(base);
  minDate.setDate(base.getDate() + 63);

  const avgDate = new Date(base);
  avgDate.setDate(base.getDate() + 64);

  const maxDate = new Date(base);
  maxDate.setDate(base.getDate() + 65);

  const today = new Date();
  today.setHours(0,0,0,0);

  let diffTime = today.getTime() - base.getTime();
  let daysPregnant = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (daysPregnant < 0) daysPregnant = 0;
  if (daysPregnant > 70) daysPregnant = 70; // Hard cap

  let progressPct = (daysPregnant / 64) * 100;
  if (progressPct > 100) progressPct = 100;

  const daysRemaining = Math.max(0, 64 - daysPregnant);

  // Milestones
  // Wk 2 (Day 14): Embryos implant
  // Wk 3 (Day 21): Heartbeats visible on ultrasound, pinking up
  // Wk 4 (Day 28): Vet can palpate kittens
  // Wk 6 (Day 42): Skeletons calcify, visible on X-ray
  // Wk 8 (Day 56): Fetal movement visible, nesting behavior
  
  const mDay14 = new Date(base); mDay14.setDate(base.getDate() + 14);
  const mDay21 = new Date(base); mDay21.setDate(base.getDate() + 21);
  const mDay28 = new Date(base); mDay28.setDate(base.getDate() + 28);
  const mDay42 = new Date(base); mDay42.setDate(base.getDate() + 42);
  const mDay56 = new Date(base); mDay56.setDate(base.getDate() + 56);

  const milestones = [
    { name: "Embryo Implantation", date: mDay14.toLocaleDateString(), past: today >= mDay14, desc: "Embryos implant in the uterine wall." },
    { name: "'Pinking Up' & Ultrasound", date: mDay21.toLocaleDateString(), past: today >= mDay21, desc: "Nipples enlarge and turn pink. Heartbeats visible via ultrasound." },
    { name: "Physical Palpation", date: mDay28.toLocaleDateString(), past: today >= mDay28, desc: "A vet can carefully feel the kittens in the abdomen." },
    { name: "Skeletons Calcify (X-Ray)", date: mDay42.toLocaleDateString(), past: today >= mDay42, desc: "Kitten skeletons calcify and can be counted on an X-ray." },
    { name: "Nesting Behavior", date: mDay56.toLocaleDateString(), past: today >= mDay56, desc: "Mother begins looking for a safe, quiet place to give birth." },
    { name: "Due Date Window Opens", date: minDate.toLocaleDateString(), past: today >= minDate, desc: "Labor can safely begin anytime from this date." }
  ];

  const currentStage = daysPregnant < 21 ? "Early Gestation" : daysPregnant < 42 ? "Mid Gestation" : "Late Gestation / Queening Prep";

  const chartData = [
    { name: "Early Gestation (Wk 1-3)", value: 21, color: daysPregnant >= 21 ? "hsl(var(--primary))" : daysPregnant > 0 ? "hsl(var(--primary)/0.5)" : "#e2e8f0" },
    { name: "Mid Gestation (Wk 4-6)", value: 21, color: daysPregnant >= 42 ? "#10b981" : daysPregnant > 21 ? "#10b98150" : "#e2e8f0" },
    { name: "Late Gestation (Wk 7-9)", value: 22, color: daysPregnant >= 64 ? "#f59e0b" : daysPregnant > 42 ? "#f59e0b50" : "#e2e8f0" }
  ];

  const summaryStats = [
    { label: "Estimated Due Date", value: avgDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }), colorClass: "text-primary font-bold" },
    { label: "Delivery Window", value: `${minDate.toLocaleDateString()} - ${maxDate.toLocaleDateString()}` },
    { label: "Current Progress", value: `Day ${daysPregnant} of 64` },
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

export default function CatPregnancyDurationCalculator() {
  // 4. Component State
  const [matingDate, setMatingDate] = useState(DEFAULTS.matingDate);
  const [results, setResults] = useState<CatPregnancyResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateCatPregnancy({ matingDate }));
  };

  const handleReset = () => {
    setMatingDate(DEFAULTS.matingDate);
    setResults(null);
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Cat Pregnancy Timeline</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "How long is a cat pregnant?", answer: "The average gestation period for a cat (queen) is 63 to 65 days, which is roughly 9 weeks. However, anything between 60 and 69 days can be considered within the realm of normal depending on the breed and individual cat." },
    { question: "How do I know if my cat is pregnant?", answer: "Early signs include 'pinking up' (nipples becoming enlarged and pink around 3 weeks), increased appetite, and weight gain. Around 4 weeks, a veterinarian can confirm pregnancy via ultrasound or abdominal palpation." },
    { question: "How can I tell how many kittens she will have?", answer: "An ultrasound at 3-4 weeks can confirm pregnancy but is often inaccurate for counting kittens. The gold standard for counting is an X-ray (radiograph) performed after day 42-45, once the fetal skeletons have calcified." },
    { question: "What is nesting behavior?", answer: "About a week before giving birth (queening), your cat will likely start seeking out a quiet, dark, and safe place to deliver her kittens. You should provide a whelping box lined with soft blankets in a secluded area of your home to accommodate this instinct." },
    { question: "When should I take my pregnant cat to the vet?", answer: "You should schedule an initial prenatal checkup around day 21-28 for an ultrasound. A follow-up visit around day 45-50 for an X-ray to count the kittens is highly recommended so you know exactly how many to expect during delivery." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Cat Pregnancy Duration Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Cat Pregnancy Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          
          {/* LEFT 460px: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Cat className="h-4 w-4" /> Feline Gestation Tracker
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Enter the date of mating to calculate your cat's estimated due date and track critical developmental milestones.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="mdate" label="Date of Mating / Conception" type="date" value={matingDate} onChange={setMatingDate} />
            </div>

            <div className="flex gap-3 mt-4">
              <button type="button" onClick={handleCalculate} disabled={!matingDate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm disabled:opacity-50">
                Calculate Timeline
              </button>
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
                    <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Queening Date</div>
                    <div className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">{results.avgDueDate}</div>
                    <div className="text-sm text-muted-foreground mt-2 font-medium">
                      Based on an average 64-day gestation. Normal delivery window: {results.minDueDate} to {results.maxDueDate}.
                    </div>
                  </div>
                  <Cat className="absolute -bottom-4 -right-4 h-32 w-32 text-primary/10" />
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
                    <span>Day 64</span>
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
                <Cat className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium">Enter the mating date and click Calculate to view your cat's pregnancy timeline and developmental milestones.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding the Feline Gestation Period</h2>
            <p>If you suspect your cat is expecting, understanding the timeline of feline gestation is critical for her health and the survival of the kittens. The <strong>Cat Pregnancy Calculator</strong> is designed to remove the guesswork from this 9-week journey. By simply inputting the date of mating, the calculator algorithm maps out a precise timeline, giving you an estimated due date, a safe delivery window, and a week-by-week breakdown of essential fetal developmental milestones.</p>
            <p>A queen (an unspayed female cat) can become pregnant relatively easily. Cats are "induced ovulators," meaning the act of mating stimulates the release of eggs from the ovaries. Because of this biological mechanism, if mating occurs, the chance of conception is exceptionally high.</p>

            <h2>How Long is a Cat Pregnant?</h2>
            <p>The standard gestation period for a domestic cat is roughly <strong>63 to 65 days</strong> (or about 9 weeks). However, normal biological variance means that any delivery between 60 and 69 days can be considered within the healthy range. Our calculator uses an average of 64 days to determine the primary Estimated Queening Date, while also providing you with the full min-max delivery window.</p>
            <p>If your cat reaches day 69 and has not gone into labor, it is imperative to contact a veterinarian immediately. Prolonged gestation can be a sign of fetal distress, a single oversized kitten blocking the birth canal, or an underlying maternal health issue that requires emergency intervention (such as a C-section).</p>

            <h2>Early Signs of Feline Pregnancy (Weeks 1 to 3)</h2>
            <p>During the first two to three weeks of pregnancy, you will likely notice zero physical or behavioral changes in your cat. This is because the fertilized eggs are still traveling down the fallopian tubes and implanting into the uterine lining.</p>
            <p>The first reliable physical sign of pregnancy occurs around Day 21. This phenomenon is known as <strong>"pinking up."</strong> The queen's nipples will become slightly enlarged, protrude more, and turn a distinct rosy-pink color. Around this same time, the queen may experience a brief period of "morning sickness" characterized by a slight loss of appetite or occasional vomiting. If you take your cat to the vet at the end of Week 3, an experienced practitioner can perform an ultrasound and visibly detect the fetal heartbeats.</p>

            <h2>Mid-Gestation Development (Weeks 4 to 6)</h2>
            <p>As the pregnancy enters its second phase, the kittens begin to develop rapidly. By Week 4 (Day 28), the fetuses are roughly the size of large grapes. At this stage, a veterinarian can often perform abdominal palpation—carefully feeling the cat's belly from the outside to detect the amniotic sacs. <em>(Note: Never attempt to palpate the abdomen yourself, as improper technique can damage the fetuses or cause a miscarriage).</em></p>
            <p>During Weeks 5 and 6, the queen's abdomen will noticeably swell. Her appetite will increase dramatically; she will require high-quality kitten food to provide the massive amount of calories and calcium needed to grow the kittens' bones. By Day 42 (Week 6), the fetal skeletons have calcified enough to show up on an X-ray. This is the optimal time to ask your vet for a radiograph, as it is the only accurate method to count exactly how many kittens to expect.</p>

            <h2>Late Gestation and Queening Prep (Weeks 7 to 9)</h2>
            <p>In the final weeks of pregnancy, the kittens are fully formed and are primarily gaining weight and developing their lung capacity. You may be able to feel or see the kittens moving if you gently place your hand on the mother's abdomen while she rests.</p>
            <p>Behaviorally, the queen will enter the <strong>Nesting Phase</strong>. She will become restless, seeking out dark, quiet, and secluded areas of the house—such as the back of a closet or under a bed. To prevent her from giving birth in an undesirable location, you must introduce a <strong>Whelping Box</strong>. This should be a clean, low-sided cardboard or wooden box lined with soft, washable towels or puppy pads, placed in a warm, low-traffic room.</p>

            <h2>Signs That Labor is Imminent</h2>
            <p>As the Estimated Queening Date approaches, you must monitor the queen closely for the following signs that labor (Stage 1) has begun:</p>
            <ul>
              <li><strong>Temperature Drop:</strong> A cat's normal body temperature is around 101.5°F. About 12 to 24 hours before labor begins, her rectal temperature will drop below 100°F.</li>
              <li><strong>Refusal of Food:</strong> The queen will likely stop eating 24 hours before giving birth.</li>
              <li><strong>Restlessness and Vocalization:</strong> She will pace in and out of the whelping box, pant heavily, and may meow or yowl frequently.</li>
              <li><strong>Licking:</strong> She will excessively groom her genital area as the cervical plug dissolves and fluid is released.</li>
            </ul>

            <h2>The Delivery Process (Queening)</h2>
            <p>Feline labor is generally a natural process that requires zero human intervention. Stage 2 labor involves active abdominal contractions and the delivery of the kittens. Typically, a kitten is born every 30 to 60 minutes, though the queen may take a "rest period" of several hours halfway through the litter.</p>
            <p>The mother will instinctively tear the amniotic sac off the kitten's face to allow it to breathe, bite the umbilical cord to sever it, and vigorously lick the kitten to stimulate respiration. Your job is simply to observe from a distance. If the mother ignores a newborn kitten and fails to remove the sac, you must step in immediately to clear the airway with a clean towel.</p>

            <h2>When to Call the Emergency Vet</h2>
            <p>While most cats queen without complications, dystocia (difficult birth) requires immediate veterinary intervention. You must rush the cat to an emergency clinic if:</p>
            <ul>
              <li>She has been actively pushing with strong contractions for over 30 minutes without producing a kitten.</li>
              <li>More than two hours have passed since the previous kitten, and you know there are more inside (based on the Day 45 X-ray).</li>
              <li>A kitten is stuck in the birth canal.</li>
              <li>There is significant, bright red bleeding.</li>
            </ul>
            <p>By using the Cat Pregnancy Calculator, ensuring proper veterinary care, and understanding the biological timeline of gestation, you ensure the safest possible outcome for both the mother and her new litter.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cat-pregnancy-duration-calculator" />
          <PopularCalculators exclude="/calculator/cat-pregnancy-duration-calculator" />
        </div>
      </div>
    </>
  );
}
