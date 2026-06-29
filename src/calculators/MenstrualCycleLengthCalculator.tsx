"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, CalendarHeart, Sparkles } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceLine } from "recharts";

interface CycleResult {
  cycleLength: number;
  nextPeriodStr: string;
  ovulationStr: string;
  fertileStartStr: string;
  fertileEndStr: string;
  isIrregular: boolean;
  chartData: { name: string; days: number; fill: string; desc: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcCycle(
  currentStartStr: string, previousStartStr: string
): CycleResult {
  const currentStart = new Date(currentStartStr);
  const prevStart = new Date(previousStartStr);
  
  // Calculate cycle length in days (difference between the two start dates)
  const diffTime = Math.abs(currentStart.getTime() - prevStart.getTime());
  const cycleLength = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Determine if irregular
  const isIrregular = cycleLength < 21 || cycleLength > 35;

  // Project next period
  const nextPeriod = new Date(currentStart);
  nextPeriod.setDate(currentStart.getDate() + cycleLength);

  // Estimate Ovulation (standard luteal phase is consistently 14 days prior to next period)
  const ovulation = new Date(nextPeriod);
  ovulation.setDate(nextPeriod.getDate() - 14);

  // Fertile Window (sperm can live 5 days inside, egg lives 24 hours)
  const fertileStart = new Date(ovulation);
  fertileStart.setDate(ovulation.getDate() - 5);
  
  const fertileEnd = new Date(ovulation);
  fertileEnd.setDate(ovulation.getDate() + 1);

  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  // Cycle phases for chart visualization
  const menses = 5; // average menses
  const follicular = Math.max(0, cycleLength - 14 - menses); // from end of menses to ovulation
  const luteal = 14;

  const chartData = [
    { name: "Menstruation", days: menses, fill: "#f43f5e", desc: "Shedding of uterine lining" },
    { name: "Follicular", days: follicular, fill: "#3b82f6", desc: "Egg maturation" },
    { name: "Ovulation Window", days: 6, fill: "#8b5cf6", desc: "Fertile window including ovulation" },
    { name: "Luteal Phase", days: Math.max(0, luteal - 6), fill: "#10b981", desc: "Preparation for pregnancy" }
  ];

  const summaryStats = [
    { label: "Cycle Length", value: `${cycleLength} Days` },
    { label: "Clinical Status", value: isIrregular ? "Irregular" : "Normal" },
    { label: "Luteal Phase", value: "14 Days (Est)" }
  ];

  return {
    cycleLength,
    nextPeriodStr: formatDate(nextPeriod),
    ovulationStr: formatDate(ovulation),
    fertileStartStr: formatDate(fertileStart),
    fertileEndStr: formatDate(fertileEnd),
    isIrregular,
    chartData,
    summaryStats
  };
}

export default function MenstrualCycleLengthCalculator() {
  // Setup default dates: Current = Today, Previous = Today - 28 days
  const today = new Date();
  const prevDate = new Date();
  prevDate.setDate(today.getDate() - 28);
  
  const formatDateForInput = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const [currentDate, setCurrentDate] = useState(formatDateForInput(today));
  const [previousDate, setPreviousDate] = useState(formatDateForInput(prevDate));

  const [result, setResult] = useState<CycleResult | null>(null);

  const calculate = () => {
    if (currentDate && previousDate) {
      // Ensure previous is before current
      const c = new Date(currentDate);
      const p = new Date(previousDate);
      if (p >= c) {
        alert("The 'Previous Period' date must be before the 'Last Period' date.");
        return;
      }
      setResult(calcCycle(currentDate, previousDate));
    }
  };

  useEffect(() => { setResult(calcCycle(formatDateForInput(today), formatDateForInput(prevDate))); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "How exactly do I count my cycle length?", answer: "A menstrual cycle length is the total number of days from the FIRST day of your previous period up to (but not including) the FIRST day of your next period. It is not the number of days between the end of one period and the start of another." },
    { question: "What is a 'Normal' cycle length?", answer: "Clinical guidelines define a normal menstrual cycle as lasting anywhere from 21 to 35 days. The global average is roughly 28 days, but cycle lengths within the 21-35 day window are completely healthy. If your cycle is consistently shorter than 21 days or longer than 35 days, you should consult an OB-GYN." },
    { question: "Why is the Luteal phase always estimated at 14 days?", answer: "While the first half of a woman's cycle (the Follicular phase) can vary wildly in length depending on stress, illness, or travel, the second half (the Luteal phase) is incredibly stable. Medically, ovulation almost always occurs exactly 14 days before the start of the next period, regardless of whether a woman's total cycle is 25 days or 32 days long." },
    { question: "Can I get pregnant outside the 'Fertile Window'?", answer: "Technically yes, but the chances are exceptionally low. An unfertilized egg only survives for 12 to 24 hours after ovulation. However, healthy sperm can survive inside the female reproductive tract for up to 5 days. Therefore, the biological 'fertile window' begins 5 days before ovulation and ends 24 hours after ovulation." },
    { question: "Why is my cycle suddenly irregular?", answer: "Cycle irregularities are very common. They can be triggered by high stress levels, extreme weight loss, intense exercise, thyroid disorders, Polycystic Ovary Syndrome (PCOS), or simply entering perimenopause. If you miss three periods in a row, seek medical advice." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Menstrual Cycle Length Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Menstrual Cycle Length Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 mb-2">
              <p className="text-sm font-medium text-foreground">Select the <strong>first day of bleeding</strong> for your two most recent periods.</p>
            </div>

            <div>
              <label className="text-sm font-bold mb-1.5 block">1. First Day of Previous Period</label>
              <div className={inp}><input type="date" value={previousDate} onChange={e => setPreviousDate(e.target.value)} className={ci} /></div>
              <p className="text-xs text-muted-foreground mt-1.5">The start date of the period before your most recent one.</p>
            </div>
            
            <div className="border-t border-border pt-4">
              <label className="text-sm font-bold mb-1.5 block">2. First Day of Last Period (LMP)</label>
              <div className={inp}><input type="date" value={currentDate} onChange={e => setCurrentDate(e.target.value)} className={ci} /></div>
              <p className="text-xs text-muted-foreground mt-1.5">The start date of your most recent period.</p>
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="border-l-4 rounded-lg p-5 shadow-sm" style={{ backgroundColor: `${result.isIrregular ? "#f59e0b10" : "#22c55e10"}`, borderColor: result.isIrregular ? "#f59e0b" : "#22c55e" }}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: result.isIrregular ? "#d97706" : "#16a34a" }}>Calculated Cycle Length</div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-5xl font-extrabold text-foreground tracking-tight">{result.cycleLength}</div>
                      <div className="text-xl font-bold text-muted-foreground">Days</div>
                    </div>
                  </div>
                </div>
                {result.isIrregular ? (
                  <div className="text-sm font-medium text-amber-700 dark:text-amber-400 mt-3 leading-relaxed">
                    A {result.cycleLength}-day cycle falls outside the normal clinical range of 21 to 35 days. If this is a persistent pattern, please consult a healthcare provider.
                  </div>
                ) : (
                  <div className="text-sm font-medium text-green-700 dark:text-green-400 mt-3 leading-relaxed">
                    A {result.cycleLength}-day cycle is considered perfectly normal and healthy (clinical range: 21-35 days).
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card-calculator !p-4 border border-border bg-card shadow-sm">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1">Projected Next Period</p>
                  <p className="text-xl font-bold text-rose-500">{result.nextPeriodStr}</p>
                </div>
                <div className="card-calculator !p-4 border border-border bg-card shadow-sm">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1 flex items-center gap-1"><Sparkles className="w-3 h-3 text-purple-500" /> Est. Peak Ovulation</p>
                  <p className="text-xl font-bold text-purple-500">{result.ovulationStr}</p>
                </div>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-bold">Your Fertile Window</h3>
                  <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-bold px-2 py-1 rounded">High Chance of Conception</div>
                </div>
                <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-lg border border-border/50">
                  <div className="flex-1 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Starts</p>
                    <p className="font-bold text-foreground">{result.fertileStartStr}</p>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex-1 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Ends</p>
                    <p className="font-bold text-foreground">{result.fertileEndStr}</p>
                  </div>
                </div>
              </div>
              
              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold mb-4">Cycle Phase Breakdown (Estimation)</h3>
                <ResponsiveContainer width="100%" height={100}>
                  <BarChart data={result.chartData} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" hide />
                    <Tooltip cursor={{ fill: 'transparent' }} formatter={(v: number, n: string, props: any) => [`${v} Days`, props.payload.desc]} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <Bar dataKey="days" stackId="a">
                      {result.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 mt-3 justify-center">
                  {result.chartData.map((phase, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: phase.fill }}></div>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase">{phase.name}</span>
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
            <h2>Understanding Your Menstrual Cycle Length</h2>
            <p>The female menstrual cycle is a complex, continuous sequence of hormonal shifts designed to prepare the body for a potential pregnancy. Understanding the exact length of your cycle is the foundation of reproductive health, whether you are trying to conceive (TTC), practicing natural family planning, or simply monitoring for hormonal imbalances.</p>
            <p>This <strong>Menstrual Cycle Length Calculator</strong> determines the exact biological length of your cycle and utilizes retrograde clinical tracking to estimate your upcoming ovulation date, fertile window, and next period.</p>

            <h2>How to Properly Count Cycle Days</h2>
            <p>A very common mistake women make is counting the days <em>between</em> their periods (from the day bleeding stops to the day it starts again). This is medically incorrect.</p>
            <p>In gynecology, <strong>Cycle Day 1 (CD1)</strong> is officially defined as the very first day of full, bright red menstrual flow (not light spotting). The total length of your cycle is the number of days from CD1 of your previous period up to (but not including) CD1 of your current period. For example, if you start bleeding on January 1st, and you start bleeding again on January 29th, you have a 28-day cycle.</p>

            <h2>The Four Phases of the Cycle</h2>
            <p>While we casually refer to a "28-day cycle," it is actually broken down into four distinct, hormonally driven phases. Because the Luteal Phase is mathematically rigid, we can use your total cycle length to estimate the other phases.</p>

            <h3>1. The Menstrual Phase (Days 1-5)</h3>
            <p>This is your period. Because an egg was not fertilized in the previous cycle, estrogen and progesterone levels plummet. This withdrawal of hormones triggers the shedding of the thickened uterine lining (endometrium).</p>

            <h3>2. The Follicular Phase (Days 1-13)</h3>
            <p>Technically overlapping with menstruation, this phase begins on CD1. The pituitary gland releases Follicle Stimulating Hormone (FSH), prompting the ovaries to prepare several follicles. The dominant follicle begins producing massive amounts of estrogen, which thickens the uterine lining again. This phase is highly variable; stress, illness, or travel can significantly extend the Follicular Phase, delaying ovulation.</p>

            <h3>3. Ovulation (Day 14)</h3>
            <p>As estrogen peaks, it triggers a massive surge of Luteinizing Hormone (LH). This surge causes the dominant follicle to rupture and release a mature egg into the fallopian tube. The egg survives for only 12 to 24 hours.</p>

            <h3>4. The Luteal Phase (Days 15-28)</h3>
            <p>Unlike the unpredictable Follicular Phase, <strong>the Luteal Phase is biologically rigid, almost always lasting exactly 14 days</strong>. The ruptured follicle transforms into the corpus luteum, pumping out progesterone to keep the uterine lining thick. If pregnancy does not occur, the corpus luteum degrades after exactly 14 days, progesterone drops, and the cycle starts over.</p>

            <h2>Calculating the Fertile Window</h2>
            <p>Because the Luteal Phase is fixed at 14 days, the calculator estimates your ovulation date by projecting your next period and counting backward exactly 14 days. This is known as the "Rhythm Method" or retrograde tracking.</p>
            <p>However, your "Fertile Window" is longer than just the day of ovulation. While an egg only lives for 24 hours, healthy sperm can survive inside the cervical crypts of the female reproductive tract for up to 5 days, waiting for the egg to drop. Therefore, the biological window for conception opens 5 days prior to ovulation and completely closes 24 hours after ovulation.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/menstrual-cycle-length-calculator" />
          <PopularCalculators exclude="/calculator/menstrual-cycle-length-calculator" />
        </div>
      </div>
    </>
  );
}
