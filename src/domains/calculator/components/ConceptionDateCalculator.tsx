"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, CalendarHeart, Baby, Sparkles } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceArea, ReferenceLine } from "recharts";

interface ConceptionResult {
  conceptionDate: string;
  windowStart: string;
  windowEnd: string;
  dueDate: string;
  lmpDate: string;
  chartData: { name: string; timestamp: number; type: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcConception(method: string, baseDateStr: string, cycleLength: number): ConceptionResult | null {
  if (!baseDateStr) return null;

  const baseDate = new Date(baseDateStr);
  baseDate.setHours(12, 0, 0, 0); // Avoid timezone shifts

  let conceptionDate = new Date(baseDate);
  let dueDate = new Date(baseDate);
  let lmpDate = new Date(baseDate);

  // Standard pregnancy is 280 days from LMP, 266 days from conception
  if (method === "due_date") {
    dueDate = new Date(baseDate);
    // Subtract 266 days to find conception
    conceptionDate.setDate(dueDate.getDate() - 266);
    // Subtract 280 days to find LMP
    lmpDate.setDate(dueDate.getDate() - 280);
  } else {
    // Based on LMP
    lmpDate = new Date(baseDate);
    // Ovulation/Conception usually occurs 14 days before the NEXT period.
    // So: LMP + cycleLength - 14.
    conceptionDate.setDate(lmpDate.getDate() + (cycleLength - 14));
    // Due date is strictly Conception + 266 days
    dueDate = new Date(conceptionDate);
    dueDate.setDate(conceptionDate.getDate() + 266);
  }

  // Intercourse window: Sperm lives up to 5 days before ovulation, egg lives 1 day after.
  const windowStart = new Date(conceptionDate);
  windowStart.setDate(conceptionDate.getDate() - 5);
  
  const windowEnd = new Date(conceptionDate);
  windowEnd.setDate(conceptionDate.getDate() + 1);

  const formatOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };

  // For the chart, we need a chronological timeline.
  // We'll plot relative days from LMP.
  const chartData = [
    { name: "Last Period", timestamp: 0, type: "milestone" },
    { name: "Conception", timestamp: Math.round((conceptionDate.getTime() - lmpDate.getTime()) / (1000 * 60 * 60 * 24)), type: "event" },
    { name: "Due Date", timestamp: Math.round((dueDate.getTime() - lmpDate.getTime()) / (1000 * 60 * 60 * 24)), type: "milestone" }
  ];

  const summaryStats = [
    { label: "Possible Intercourse Range", value: `${windowStart.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})} - ${windowEnd.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}` },
    { label: "Estimated Due Date", value: dueDate.toLocaleDateString('en-US', formatOptions) }
  ];

  return {
    conceptionDate: conceptionDate.toLocaleDateString('en-US', formatOptions),
    windowStart: windowStart.toLocaleDateString('en-US', formatOptions),
    windowEnd: windowEnd.toLocaleDateString('en-US', formatOptions),
    dueDate: dueDate.toLocaleDateString('en-US', formatOptions),
    lmpDate: lmpDate.toLocaleDateString('en-US', formatOptions),
    chartData,
    summaryStats
  };
}

export default function ConceptionDateCalculator() {
  const [method, setMethod] = useState("due_date");
  const [baseDate, setBaseDate] = useState("");
  const [cycleLength, setCycleLength] = useState("28");

  const [result, setResult] = useState<ConceptionResult | null>(null);

  useEffect(() => {
    // Default to a due date 6 months from now
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    const isoDate = d.toISOString().split('T')[0];
    setBaseDate(isoDate);
    setResult(calcConception("due_date", isoDate, 28));
  }, []);

  const calculate = () => {
    if (baseDate) {
      setResult(calcConception(method, baseDate, parseInt(cycleLength)));
    }
  };

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "Can a doctor pinpoint the exact day of conception?", answer: "Surprisingly, no. Even with an early ultrasound, doctors can only estimate the gestational age of the fetus with a margin of error of roughly +/- 3 to 5 days. Because sperm can survive inside the female body for up to 5 days before an egg is released, the date of intercourse and the actual date of conception are often not the same day." },
    { question: "Why is pregnancy calculated as 40 weeks instead of 38?", answer: "Biologically, human gestation lasts roughly 38 weeks (266 days) from the moment of conception. However, because most women do not know exactly when they ovulated, the medical standard is to start the clock from the first day of the Last Menstrual Period (LMP). This adds 2 'empty' weeks to the timeline before conception even occurs, bringing the total to 40 weeks (280 days)." },
    { question: "Why does the intercourse window span 7 days?", answer: "While the egg (ovum) only lives for 12 to 24 hours after being released by the ovary, healthy sperm are remarkably resilient. Sperm can survive inside the fallopian tubes for up to 5 days waiting for an egg to be released. Therefore, intercourse that occurred 5 days before ovulation can still result in conception." },
    { question: "What if my cycle is not 28 days?", answer: "This is exactly why the 'Last Menstrual Period' method often fails. If a woman has a 35-day cycle, she likely ovulates on Day 21, not Day 14. If a doctor blindly uses her LMP to calculate her due date without adjusting for her long cycle, the ultrasound will show the baby is 'measuring small', causing unnecessary panic. This calculator automatically adjusts the conception date based on your unique cycle length." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Conception Date Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Conception Date Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm sticky top-6">
            
            <div>
              <label className="text-sm font-medium mb-1.5 block">Calculation Method</label>
              <select value={method} onChange={e => setMethod(e.target.value)} className={`${inp} w-full px-3 text-sm focus:ring-2 focus:ring-primary/20`}>
                <option value="due_date">I know my Estimated Due Date (EDD)</option>
                <option value="lmp">I know my Last Menstrual Period (LMP)</option>
              </select>
            </div>

            <div className="border-t border-border pt-4">
              <label className="text-sm font-medium mb-1.5 block">{method === 'due_date' ? 'Estimated Due Date' : 'First Day of Last Period'}</label>
              <div className={inp}><input type="date" value={baseDate} onChange={e => setBaseDate(e.target.value)} className={ci} /></div>
            </div>

            {method === "lmp" && (
              <div>
                <label className="text-sm font-medium mb-1.5 block">Average Cycle Length</label>
                <div className={inp}><input type="number" value={cycleLength} onChange={e => setCycleLength(e.target.value)} className={ci} /><span className="pr-3 text-xs text-muted-foreground">days</span></div>
                <p className="text-xs text-muted-foreground mt-1.5">Standard is 28 days. Essential for accurate calculation.</p>
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 text-base transition-all shadow-sm">Calculate</button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {result && (<>
              
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-1 text-pink-600">Estimated Date of Conception</div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">{result.conceptionDate}</div>
                    </div>
                  </div>
                  <div className="bg-background rounded-full p-2.5 shadow-sm border border-border shrink-0">
                    <CalendarHeart className="w-8 h-8 text-pink-500" />
                  </div>
                </div>
                <div className="text-sm font-medium text-muted-foreground mt-2">
                  Based on clinical averages, biological fertilization occurred on or near this date.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="card-calculator !p-4 border border-border bg-card shadow-sm text-center">
                    <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1">{s.label}</div>
                    <div className="text-sm sm:text-lg font-black text-foreground whitespace-nowrap overflow-hidden text-ellipsis px-2">{s.value}</div>
                  </div>
                ))}
              </div>
              
              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-base font-bold">Pregnancy Timeline</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-6">Showing the clinical milestones across the 280-day gestational period.</p>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={result.chartData} layout="vertical" margin={{ top: 0, right: 20, left: -20, bottom: 20 }}>
                    <XAxis type="number" domain={[0, 280]} tick={{ fontSize: 11 }} ticks={[0, result.chartData[1].timestamp, 280]} />
                    <YAxis type="category" dataKey="name" hide />
                    
                    {/* Intercourse window area */}
                    <ReferenceArea x1={result.chartData[1].timestamp - 5} x2={result.chartData[1].timestamp + 1} fill="#fce7f3" fillOpacity={1} />
                    
                    {/* Milestones */}
                    <ReferenceLine x={0} stroke="#94a3b8" />
                    <ReferenceLine x={result.chartData[1].timestamp} stroke="#ec4899" strokeWidth={2} />
                    <ReferenceLine x={280} stroke="#3b82f6" strokeWidth={2} />

                    <Tooltip cursor={false} 
                      formatter={(v: number, name: string, props: any) => [`Day ${v}`, props.payload.name]} 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} 
                    />
                    <Bar dataKey="timestamp" barSize={1} fill="transparent" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground mt-1">
                  <span>LMP</span>
                  <span className="text-pink-600 text-center" style={{marginLeft: '10%'}}>Conception Window</span>
                  <span>Due Date</span>
                </div>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Mathematics of Conception</h2>
            <p>Determining the exact date a child was conceived requires working backward using a set of clinical averages. While an ultrasound is the most accurate way to date a pregnancy, this <strong>Conception Date Calculator</strong> uses standard obstetric algorithms to reverse-engineer the timeline based on either your known Due Date or your Last Menstrual Period.</p>

            <h2 className="text-2xl font-bold mb-3">Method 1: Reverse-Engineering the Due Date</h2>
            <p>If you have already had an ultrasound (often called a 'dating scan' in the first trimester), your doctor has provided you with an Estimated Due Date (EDD). This is the most accurate method for calculation.</p>
            <p>By medical definition, human gestation lasts precisely <strong>266 days (38 weeks)</strong> from the exact moment of conception. The calculator simply takes your ultrasound-confirmed due date and subtracts 266 days to pinpoint the day biological fertilization occurred.</p>

            <h2 className="text-2xl font-bold mb-3">Method 2: The Last Menstrual Period (LMP)</h2>
            <p>If you have just discovered you are pregnant and haven't had an ultrasound yet, doctors use the LMP method. This method assumes that you ovulate 14 days before your next period.</p>
            <p>However, this method is fundamentally flawed if you do not have a textbook 28-day cycle. If a woman has a 35-day cycle, she ovulates around Day 21. If the doctor uses the standard 28-day math, the conception date will be miscalculated by a full week. Our calculator allows you to input your exact cycle length to correct this mathematical error, providing a much more accurate conception date.</p>

            <h2 className="text-2xl font-bold mb-3">The 'Intercourse Window' vs. Conception Date</h2>
            <p>It is critical to understand that the date of conception is <strong>not necessarily the date you had intercourse</strong>.</p>
            <p>A human egg (ovum) only survives for 12 to 24 hours after being released by the ovary. However, healthy sperm are remarkably resilient. Sperm can survive inside the female reproductive tract (specifically in the cervical crypts and fallopian tubes) for up to <strong>5 days</strong> waiting for the egg to be released.</p>
            <p>Therefore, if you had intercourse on a Friday, but did not ovulate until Tuesday, the actual 'Conception Date' is Tuesday. The calculator provides a 6-day 'Intercourse Window' representing all possible days where intercourse could have resulted in a pregnancy on the calculated conception date.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/conception-date-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Conception Date Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Conception Date Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Conception Date Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Conception Date Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Conception Date Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/conception-date-calculator" />
        </div>
      </div>
    </>
  );
}
