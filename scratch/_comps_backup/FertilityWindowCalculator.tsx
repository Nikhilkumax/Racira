"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Baby, CalendarDays, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceLine } from "recharts";

interface MonthProjection {
  monthName: string;
  fertileStartStr: string;
  fertileEndStr: string;
  peakDayStr: string;
  nextPeriodStr: string;
}

interface FertilityResult {
  projections: MonthProjection[];
  chartData: { name: string; probability: number; fill: string; desc: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcFertility(lmpStr: string, cycleLength: number): FertilityResult {
  const lmp = new Date(lmpStr);
  const projections: MonthProjection[] = [];

  const addDays = (date: Date, days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  };

  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const formatMonth = (d: Date) => d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Generate 3 months of projections
  let currentLmp = new Date(lmp);

  for (let i = 0; i < 3; i++) {
    const nextPeriod = addDays(currentLmp, cycleLength);
    const ovulation = addDays(nextPeriod, -14); // Luteal phase is ~14 days
    const fertileStart = addDays(ovulation, -5);
    const fertileEnd = addDays(ovulation, 1);

    projections.push({
      monthName: formatMonth(ovulation),
      fertileStartStr: formatDate(fertileStart),
      fertileEndStr: formatDate(fertileEnd),
      peakDayStr: formatDate(ovulation),
      nextPeriodStr: formatDate(nextPeriod)
    });

    currentLmp = nextPeriod; // Roll forward
  }

  // Clinical Probability of Conception by Day relative to Ovulation (Wilcox et al. NEJM)
  // O-5: 10%, O-4: 16%, O-3: 14%, O-2: 27%, O-1: 31%, O: 33%, O+1: 11%
  const chartData = [
    { name: "O-5", probability: 10, fill: "#e2e8f0", desc: "5 Days Before" },
    { name: "O-4", probability: 16, fill: "#cbd5e1", desc: "4 Days Before" },
    { name: "O-3", probability: 14, fill: "#cbd5e1", desc: "3 Days Before" },
    { name: "O-2", probability: 27, fill: "#a78bfa", desc: "2 Days Before (Peak)" },
    { name: "O-1", probability: 31, fill: "#8b5cf6", desc: "1 Day Before (Peak)" },
    { name: "Ovulation", probability: 33, fill: "#7c3aed", desc: "Day of Ovulation" },
    { name: "O+1", probability: 11, fill: "#e2e8f0", desc: "1 Day After" }
  ];

  const summaryStats = [
    { label: "Cycle Length", value: `${cycleLength} Days` },
    { label: "Luteal Phase", value: "14 Days" },
    { label: "Fertile Window", value: "6 Days" }
  ];

  return {
    projections,
    chartData,
    summaryStats
  };
}

export default function FertilityWindowCalculator() {
  const today = new Date();
  const formatForInput = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const [lmpDate, setLmpDate] = useState(formatForInput(today));
  const [cycleLength, setCycleLength] = useState("28");
  const [result, setResult] = useState<FertilityResult | null>(null);

  const calculate = () => {
    const cl = parseInt(cycleLength);
    if (lmpDate && cl >= 20 && cl <= 45) {
      setResult(calcFertility(lmpDate, cl));
    } else if (cl < 20 || cl > 45) {
      alert("Cycle length must be between 20 and 45 days.");
    }
  };

  useEffect(() => { setResult(calcFertility(formatForInput(today), 28)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "When is the absolute best time to have intercourse?", answer: "Clinical studies show that the highest probability of conception occurs if you have intercourse 1 to 2 days BEFORE you ovulate, as well as on the day of ovulation itself. This ensures sperm are already waiting in the fallopian tubes when the egg is released." },
    { question: "Why is the fertile window 6 days long?", answer: "An unfertilized egg only lives for 12 to 24 hours after it is released. However, healthy sperm can survive inside the female reproductive tract for up to 5 days, waiting for the egg. Therefore, the biological 'window' opens 5 days before ovulation and closes 1 day after." },
    { question: "Can I use this as birth control?", answer: "No. Relying solely on a calendar to calculate your fertile window is known as the 'Rhythm Method' and it is notoriously unreliable for preventing pregnancy. Women's cycles can fluctuate randomly due to stress, travel, or illness, causing ovulation to occur earlier or later than expected." },
    { question: "How do I confirm I am actually ovulating?", answer: "While this calculator provides an excellent mathematical estimate, the only way to confirm ovulation at home is by using Ovulation Predictor Kits (OPKs) to detect the Luteinizing Hormone (LH) surge, tracking your Basal Body Temperature (BBT) every morning, or tracking cervical mucus changes." },
    { question: "What if my cycle is irregular?", answer: "If your cycle varies by more than a week from month to month (e.g., 28 days one month, 40 days the next), this mathematical calendar will not be accurate. You will need to rely on daily OPK strips or BBT tracking to identify your unique ovulation window." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Fertility Window Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Fertility Window & Ovulation Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm sticky top-6">
            
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 mb-2">
              <p className="text-sm font-medium text-foreground">For maximum accuracy, use your average cycle length over the past 3-6 months.</p>
            </div>

            <div>
              <label className="text-sm font-bold mb-1.5 block">First Day of Last Period (LMP)</label>
              <div className={inp}><input type="date" value={lmpDate} onChange={e => setLmpDate(e.target.value)} className={ci} /></div>
              <p className="text-xs text-muted-foreground mt-1.5">The exact date your most recent bleeding started.</p>
            </div>

            <div className="border-t border-border pt-4">
              <label className="text-sm font-bold mb-1.5 block">Average Cycle Length</label>
              <div className={inp}><input type="number" min="20" max="45" value={cycleLength} onChange={e => setCycleLength(e.target.value)} className={ci} /><span className="pr-3 text-sm text-muted-foreground">Days</span></div>
              <p className="text-[11px] text-muted-foreground mt-1.5">Typically 28 days.</p>
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 text-base transition-all shadow-sm">Calculate</button>
            </div>
            
            {result && (
              <div className="mt-2 pt-4 border-t border-border">
                <div className="space-y-3">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between items-center text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0">
                      <span className="text-muted-foreground font-medium">{s.label}</span>
                      <span className="font-bold text-foreground">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            {result && (<>
              
              <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
                <div className="bg-purple-100 dark:bg-purple-900/30 px-5 py-3 border-b border-border flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-purple-700 dark:text-purple-400" />
                  <h3 className="text-base font-bold text-purple-800 dark:text-purple-300">Upcoming Fertility Projections</h3>
                </div>
                
                <div className="p-0">
                  {result.projections.map((p, i) => (
                    <div key={i} className="p-5 border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{p.monthName}</h4>
                        <div className="text-[10px] font-bold uppercase px-2 py-1 bg-secondary rounded-md">Cycle {i + 1}</div>
                      </div>

                      <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4 mb-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs uppercase tracking-wide text-muted-foreground">Estimated Peak Ovulation</span>
                        </div>
                        <div className="text-2xl font-black text-primary">{p.peakDayStr}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-background border border-border rounded-lg p-3">
                          <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Fertile Window</span>
                          <span className="block text-sm font-bold text-foreground">{p.fertileStartStr} <br className="hidden sm:block" /><span className="text-muted-foreground font-medium text-xs">to</span> {p.fertileEndStr}</span>
                        </div>
                        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-lg p-3">
                          <span className="block text-[10px] font-bold text-rose-500 uppercase tracking-wider mb-1">Next Period</span>
                          <span className="block text-sm font-bold text-rose-600 dark:text-rose-400">{p.nextPeriodStr}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-bold flex items-center gap-2"><TrendingUp className="w-5 h-5 text-muted-foreground" /> Conception Probability by Day</h3>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 500 }} angle={-25} textAnchor="end" interval={0} />
                    <YAxis tick={{ fontSize: 11 }} domain={[0, 40]} />
                    <Tooltip cursor={{ fill: 'transparent' }} formatter={(v: number, n: string, props: any) => [`${v}% chance`, props.payload.desc]} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <Bar dataKey="probability" radius={[4, 4, 0, 0]} maxBarSize={40}>
                      {result.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-[10px] text-muted-foreground text-center mt-1">Based on clinical studies of conception likelihood relative to the day of ovulation (Wilcox et al.).</p>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Mathematics of Conception</h2>
            <p>If you are Trying to Conceive (TTC), timing is absolutely everything. The human reproductive window is surprisingly narrow. Even young, healthy couples having well-timed intercourse only have about a 25% to 30% chance of successfully conceiving in any given cycle.</p>
            <p>This <strong>Fertility Window Calculator</strong> uses the clinical "Standard Days Method" to project exactly when your ovaries will release a mature egg, and maps out the 6-day biological window where intercourse can actually lead to pregnancy.</p>

            <h2 className="text-2xl font-bold mb-3">Why is the Fertile Window Exactly 6 Days?</h2>
            <p>The fertile window is a biological intersection of two lifespans: the sperm and the egg.</p>
            <ul>
              <li><strong>The Egg:</strong> Once ovulation occurs and the egg is released from the ovary into the fallopian tube, it begins to rapidly degrade. An unfertilized egg only survives for <strong>12 to 24 hours</strong>. If it is not fertilized within this incredibly short timeframe, it dissolves, and conception is biologically impossible until the next month.</li>
              <li><strong>The Sperm:</strong> Conversely, healthy sperm are highly resilient. In the presence of fertile cervical mucus (which the body produces right before ovulation), sperm can survive inside the female reproductive tract for up to <strong>5 days</strong>.</li>
            </ul>
            <p>Because sperm can "wait" in the fallopian tubes for the egg to arrive, the fertile window technically opens 5 days before ovulation, and completely closes 24 hours after ovulation.</p>

            <h2 className="text-2xl font-bold mb-3">The Peak Days for Intercourse</h2>
            <p>While the window is 6 days long, not all days are equal. Massive clinical studies analyzing thousands of pregnancies have proven that the highest probability of conception occurs if you have intercourse <strong>1 to 2 days before ovulation</strong>. Having intercourse on the day of ovulation itself actually carries a slightly lower probability, because the egg may degrade before the sperm can travel all the way up the reproductive tract.</p>
            <p>If you are actively trying to conceive, reproductive endocrinologists generally recommend having intercourse every other day starting at the beginning of your fertile window, and every day during your two peak days.</p>

            <h2 className="text-2xl font-bold mb-3">Confirming Your Calendar Math</h2>
            <p>It is vital to understand that this calculator provides a mathematical estimate based on averages. The human body is not a clock. High stress, poor sleep, travel, or minor illness can all cause the brain to delay the hormonal surge required to trigger ovulation.</p>
            <p>If you want to absolutely confirm that the dates provided by this calculator are correct for your unique body, you should pair this calendar with at-home tracking methods:</p>
            <ol>
              <li><strong>Ovulation Predictor Kits (OPKs):</strong> These are cheap urine test strips that detect the Luteinizing Hormone (LH) surge that happens 24-36 hours before the egg is released. When the test line is as dark as the control line, you are in your peak window.</li>
              <li><strong>Basal Body Temperature (BBT):</strong> By taking your temperature the exact moment you wake up every morning with a highly sensitive thermometer, you can confirm ovulation has occurred. The hormone progesterone, released immediately after the egg drops, causes a sustained spike in your resting body temperature.</li>
            </ol>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/fertility-window-calculator" />
          <PopularCalculators exclude="/calculator/fertility-window-calculator" />
        </div>
      </div>
    </>
  );
}
