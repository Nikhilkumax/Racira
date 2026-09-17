"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Printer, RotateCcw, ActivitySquare, AlertTriangle, Calendar, Baby } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

// 1. TypeScript Interfaces
interface DueDateInputs {
  lmpDate: string;
  cycleLength: number;
}

interface DueDateResults {
  dueDate: string;
  dueDateStr: string;
  gestationalAgeWeeks: number;
  gestationalAgeDays: number;
  trimester: 1 | 2 | 3 | 0; // 0 if past due
  progressPercentage: number;
  
  milestones: { name: string; date: string }[];
  chartData: { week: number; progress: number }[];
  error?: string;
}

// 2. Pure Calculation Function
const calculateDueDate = (inputs: DueDateInputs): DueDateResults | null => {
  const { lmpDate, cycleLength } = inputs;
  
  if (!lmpDate) return null;

  const lmp = new Date(lmpDate);
  if (isNaN(lmp.getTime())) return null;

  // Naegele's Rule adjusted for cycle length:
  // Due Date = LMP + 280 days + (CycleLength - 28)
  const cycleAdjustment = cycleLength - 28;
  const totalDaysToAdd = 280 + cycleAdjustment;
  
  const due = new Date(lmp.getTime() + totalDaysToAdd * 24 * 60 * 60 * 1000);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Calculate Gestational Age
  const diffTime = today.getTime() - lmp.getTime();
  const diffDaysTotal = Math.floor(diffTime / (1000 * 60 * 60 * 24)) - cycleAdjustment; // adjust for cycle

  let gestationalAgeWeeks = 0;
  let gestationalAgeDays = 0;
  let progressPercentage = 0;
  let trimester: 1 | 2 | 3 | 0 = 1;

  if (diffDaysTotal >= 0) {
    gestationalAgeWeeks = Math.floor(diffDaysTotal / 7);
    gestationalAgeDays = diffDaysTotal % 7;
    progressPercentage = Math.min(100, Math.max(0, (diffDaysTotal / 280) * 100));
    
    if (gestationalAgeWeeks < 14) trimester = 1;
    else if (gestationalAgeWeeks < 28) trimester = 2;
    else if (gestationalAgeWeeks <= 42) trimester = 3;
    else trimester = 0; // Past due
  }

  // Milestones
  const addDays = (date: Date, days: number) => {
    const res = new Date(date);
    res.setDate(res.getDate() + days);
    return res.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const milestones = [
    { name: "First Trimester Ends (Week 13)", date: addDays(lmp, (13 * 7) + cycleAdjustment) },
    { name: "Second Trimester Ends (Week 27)", date: addDays(lmp, (27 * 7) + cycleAdjustment) },
    { name: "Full Term Reached (Week 37)", date: addDays(lmp, (37 * 7) + cycleAdjustment) },
    { name: "Estimated Due Date (Week 40)", date: due.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", weekday: "long" }) }
  ];

  // Chart Data: 0 to 40 weeks
  const chartData = [];
  for (let w = 0; w <= 40; w += 2) {
    chartData.push({ week: w, progress: w <= gestationalAgeWeeks ? w : 0 });
  }

  return {
    dueDate: due.toISOString().split("T")[0],
    dueDateStr: due.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", weekday: "long" }),
    gestationalAgeWeeks,
    gestationalAgeDays,
    trimester,
    progressPercentage: Math.round(progressPercentage),
    milestones,
    chartData
  };
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold text-pink-500 mb-1">Week {payload[0].payload.week}</p>
        {payload[0].payload.progress > 0 ? (
          <p className="text-muted-foreground">Completed</p>
        ) : (
          <p className="text-muted-foreground">Upcoming</p>
        )}
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

export default function PregnancyDueDateCalculator() {
  const today = new Date();
  const defaultLMP = new Date(today.getTime() - (8 * 7 * 24 * 60 * 60 * 1000)); // default 8 weeks ago
  
  // 4. Component State
  const [lmpDate, setLmpDate] = useState(defaultLMP.toISOString().split("T")[0]);
  const [cycleLength, setCycleLength] = useState("28");
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState<DueDateResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const cycle = parseInt(cycleLength);

    if (!lmpDate) {
      setErrorMsg("Please select the date of your Last Menstrual Period.");
      return;
    }
    if (isNaN(cycle) || cycle < 20 || cycle > 45) {
      setErrorMsg("Cycle length must be between 20 and 45 days.");
      return;
    }

    const res = calculateDueDate({ lmpDate, cycleLength: cycle });
    if (!res) {
      setErrorMsg("Unable to calculate. Please check your inputs.");
    } else {
      setResults(res);
    }
  };

  const handleReset = () => {
    setLmpDate(defaultLMP.toISOString().split("T")[0]);
    setCycleLength("28");
    setErrorMsg("");
    setTimeout(handleCalculate, 0);
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lmpDate, cycleLength]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Pregnancy Timeline & Due Date</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "How does the Naegele's Rule work?", answer: "Naegele's Rule is the standard medical formula used by obstetricians globally to estimate a due date. It calculates the Estimated Date of Delivery (EDD) by adding 280 days (40 weeks) to the first day of your Last Menstrual Period (LMP). Mathematically, it is often calculated as: LMP + 7 days - 3 months + 1 year." },
    { question: "Why do you need my cycle length?", answer: "Naegele's Rule assumes a perfect 28-day menstrual cycle where ovulation occurs exactly on day 14. If your cycle is longer (e.g., 32 days), you likely ovulate later in the month. The calculator adjusts your due date by adding those extra 4 days to ensure clinical accuracy." },
    { question: "Am I really pregnant for 10 months?", answer: "Technically, yes. A full-term pregnancy is exactly 40 weeks, which equates to 280 days, or roughly 9.2 calendar months. However, the first two weeks of that 40-week count include the time before conception actually occurs (starting from your LMP). The actual embryonic development period is about 38 weeks." },
    { question: "How accurate is an Estimated Due Date?", answer: "It is strictly an estimate. According to the American College of Obstetricians and Gynecologists (ACOG), only about 4% to 5% of babies are actually born on their exact due date. A pregnancy is considered 'full term' anywhere between 37 weeks and 42 weeks, giving a 5-week safe window for delivery." },
    { question: "Should I change my due date after an ultrasound?", answer: "If your early dating ultrasound (typically performed between 8 and 12 weeks) shows an estimated due date that is more than 5 to 7 days different from your LMP calculation, your obstetrician will likely change your official due date to match the ultrasound, as early fetal measurements are highly accurate." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Pregnancy Due Date Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Pregnancy Due Date Calculator</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px]">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Calendar className="h-4 w-4" /> Gestational Timeline
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Calculate your estimated due date, current gestational age, and upcoming trimester milestones based on your last menstrual cycle.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-2">
              <CompactInput id="lmp" label="First day of Last Menstrual Period (LMP)" type="date" value={lmpDate} onChange={setLmpDate} />
              
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-foreground mb-1.5 flex justify-between">
                  <span>Average Cycle Length</span>
                  <span className="text-muted-foreground font-normal">{cycleLength} Days</span>
                </label>
                <input
                  type="range"
                  min="20"
                  max="45"
                  step="1"
                  value={cycleLength}
                  onChange={(e) => setCycleLength(e.target.value)}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">The global average cycle length is 28 days. Adjust this slider if your cycles are consistently longer or shorter, as it shifts your estimated ovulation date.</p>
              </div>
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-600 text-xs font-bold p-3 rounded-md mt-1">
                <AlertTriangle className="h-4 w-4 inline mr-1 -mt-0.5" />
                {errorMsg}
              </div>
            )}

            <div className="flex gap-3 mt-4 pt-4 border-t border-border">
                            <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={handleReset} className="flex-1 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center font-bold text-sm">
                <RotateCcw className="h-4 w-4 mr-2" /> Reset Profile
              </button>
            </div>
          </div>

          {/* RIGHT: Results */}
          <div className="flex flex-col gap-4">
            {results && !errorMsg ? (
              <div ref={printRef} className="flex flex-col gap-4 animate-fade-in-up">
                
                {/* 1. Primary Result Card */}
                <div className="bg-pink-500 text-white rounded-lg p-6 relative overflow-hidden shadow-sm">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-pink-200 hover:text-white transition-colors print:hidden z-10" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="text-pink-100 text-sm font-bold uppercase tracking-wider mb-1">
                        Estimated Due Date (EDD)
                      </div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">{results.dueDateStr}</div>
                      </div>
                      <div className="text-sm font-medium text-pink-100 mt-3 bg-pink-600/50 inline-block px-3 py-1.5 rounded-full flex items-center gap-2">
                        <Baby className="h-4 w-4" /> You are currently {results.gestationalAgeWeeks} Weeks and {results.gestationalAgeDays} Days pregnant
                      </div>
                    </div>
                  </div>
                  <Calendar className="absolute -bottom-6 -right-6 h-40 w-40 opacity-10" />
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  {/* 2. Milestones Panel */}
                  <div className="bg-card border border-border rounded-lg p-5 h-full flex flex-col gap-4">
                    <h3 className="text-base font-bold">Important Milestones</h3>
                    <div className="flex flex-col">
                      {results.milestones.map((m, i) => (
                        <div key={i} className="flex justify-between items-center py-3 border-b border-border/40 last:border-0 last:pb-0">
                          <div>
                            <p className={`text-sm font-bold ${i === 3 ? 'text-pink-500' : 'text-foreground'}`}>{m.name}</p>
                          </div>
                          <span className={`font-semibold text-sm ${i === 3 ? 'text-pink-500 font-black' : 'text-muted-foreground'}`}>{m.date}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-border">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-foreground">Current Trimester</span>
                        <span className="bg-primary/10 text-primary font-black px-3 py-1 rounded-full text-sm">
                          {results.trimester === 0 ? "Past Due" : `Trimester ${results.trimester}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3. Progress Chart */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[260px]">
                    <div className="w-full flex justify-between items-center mb-4">
                      <h3 className="text-base font-bold">Pregnancy Progress</h3>
                      <span className="text-xs font-bold text-muted-foreground">{results.progressPercentage}% Complete</span>
                    </div>
                    
                    <ResponsiveContainer width="100%" height={160}>
                      <AreaChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} hide />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="progress" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorProgress)" />
                        <ReferenceLine x={results.gestationalAgeWeeks} stroke="#3b82f6" strokeDasharray="3 3" label={{ position: 'top', value: 'Today', fill: '#3b82f6', fontSize: 10, fontWeight: 'bold' }} />
                      </AreaChart>
                    </ResponsiveContainer>
                    
                    <div className="w-full mt-4 bg-secondary h-3 rounded-full overflow-hidden">
                      <div 
                        className="bg-pink-500 h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${results.progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <Calendar className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter the first day of your last menstrual period to calculate your estimated due date and pregnancy milestones.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding the Pregnancy Due Date Calculator</h2>
            <p>Discovering you are pregnant is one of the most monumental moments in a woman's life. Almost instantly, the single most pressing question becomes: "When is the baby arriving?" For decades, modern obstetrics has relied on a specific mathematical algorithm to predict exactly when a full-term pregnancy will reach its natural conclusion. The <strong>Pregnancy Due Date Calculator</strong> utilizes this globally accepted medical standard—the Modified Naegele's Rule—to provide you with an incredibly precise Estimated Date of Delivery (EDD), alongside a comprehensive timeline of your gestational milestones.</p>

            <h2 className="text-2xl font-bold mb-3">The Mathematics of Naegele's Rule</h2>
            <p>In the early 19th century, a German obstetrician named Franz Karl Naegele formulated the standard rule for calculating pregnancy duration. A standard, healthy, full-term human pregnancy lasts exactly 280 days (or precisely 40 weeks) calculated from the first day of the Last Menstrual Period (LMP).</p>
            <p>The original, and still widely used, formula is devastatingly simple:</p>
            <ul>
              <li>Determine the exact date of the first day of your Last Menstrual Period.</li>
              <li>Add exactly 7 days to that date.</li>
              <li>Subtract exactly 3 months from that date.</li>
              <li>Add 1 year.</li>
            </ul>
            <p>For example, if your LMP was July 1st, 2024: Add 7 days (July 8th). Subtract 3 months (April 8th). Add 1 year. Your Estimated Due Date is April 8th, 2025. This mathematical sequence is simply a shortcut for adding exactly 280 days to a calendar.</p>

            <h2 className="text-2xl font-bold mb-3">Why is the Menstrual Cycle Length Important?</h2>
            <p>The standard Naegele's Rule operates on one massive assumption: that the woman has a perfectly regimented 28-day menstrual cycle and ovulates exactly on Day 14. In reality, human biology is vastly more diverse. Many healthy women have cycles lasting 32 days, while others have rapid 24-day cycles.</p>
            <p>If you have a 32-day cycle, you likely ovulate around Day 18, not Day 14. This means conception actually occurred 4 days later than the standard formula assumes. If a doctor blindly uses the 28-day rule on a woman with a 32-day cycle, her due date will be calculated 4 days too early. This leads to massive anxiety and unnecessary medical interventions (such as chemical inductions) when the baby is incorrectly deemed "past due."</p>
            <p>The Racira Pregnancy Due Date Calculator utilizes the <strong>Modified Naegele's Rule</strong>. By inputting your actual, average cycle length, the algorithm mathematically adjusts the 280-day constant, shifting your due date forward or backward to align with your true biological ovulation window. This yields a far more accurate clinical timeline.</p>

            <h2 className="text-2xl font-bold mb-3">Understanding Gestational Age vs. Fetal Age</h2>
            <p>One of the most confusing aspects of early pregnancy is understanding how doctors date the pregnancy. When your doctor tells you that you are "4 weeks pregnant," the embryo itself is actually only 2 weeks old.</p>
            <p>This discrepancy exists because the exact date of conception (when the sperm fertilizes the egg) is notoriously difficult to pinpoint. However, the first day of a woman's Last Menstrual Period is a highly objective, easily recordable physical event. Therefore, the medical community universally decided to start the "Pregnancy Clock" on the first day of the LMP. During the first two weeks of your "pregnancy," you are not actually pregnant—your body is simply preparing the uterine lining and maturing the egg that is about to be fertilized.</p>
            <p>This is why a full-term pregnancy is considered 40 weeks of <em>Gestational Age</em>, even though the <em>Fetal Age</em> (the actual age of the baby) is only 38 weeks.</p>

            <h2 className="text-2xl font-bold mb-3">The Three Trimesters of Pregnancy</h2>
            <p>A full-term 40-week pregnancy is divided into three distinct phases, known as trimesters. The calculator automatically projects the dates when you will cross these critical thresholds:</p>
            <ul>
              <li><strong>First Trimester (Weeks 1 through 13):</strong> This is the period of rapid embryonic development. Major organ systems, the neural tube, and the heartbeat are formed. It is also the period where maternal symptoms (nausea, fatigue) are typically most severe due to massive surges in Human Chorionic Gonadotropin (hCG) and progesterone.</li>
              <li><strong>Second Trimester (Weeks 14 through 27):</strong> Often referred to as the "honeymoon phase" of pregnancy. The placenta takes over hormone production, morning sickness generally subsides, and maternal energy returns. The mother will begin to feel fetal movement (quickening) during this phase.</li>
              <li><strong>Third Trimester (Weeks 28 through 40):</strong> The period of rapid fetal weight gain and brain maturation. The maternal body prepares for labor and delivery. Physical discomfort, back pain, and shortness of breath increase as the rapidly growing uterus displaces maternal organs.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">When Are You Actually Considered "Full Term"?</h2>
            <p>Despite the heavy emphasis placed on the exact due date, only roughly 4% to 5% of babies are born on that exact day. The "Due Date" is simply the 40-week median mark.</p>
            <p>The American College of Obstetricians and Gynecologists (ACOG) classifies a pregnancy as <strong>Early Term</strong> between 37 weeks and 38 weeks and 6 days. It is considered <strong>Full Term</strong> between 39 weeks and 40 weeks and 6 days. Finally, it is <strong>Late Term</strong> up to 41 weeks and 6 days. Therefore, a baby born at 38 weeks is perfectly healthy, completely developed, and not considered premature. Do not fixate on the exact day; instead, prepare for the 5-week "delivery window."</p>

            <h2 className="text-2xl font-bold mb-3">LMP Dating vs. Ultrasound Dating</h2>
            <p>While the LMP calculation is the gold standard for initiating prenatal care, modern obstetrics relies heavily on ultrasound technology to verify the due date. During the first trimester (typically between 8 and 12 weeks), the doctor will perform an early dating ultrasound to measure the Crown-Rump Length (CRL) of the fetus.</p>
            <p>During the first trimester, embryos grow at a shockingly uniform, predictable rate across all human genetics. If the ultrasound measurement indicates a due date that is more than 5 to 7 days different from your LMP-calculated due date, your obstetrician will likely discard the LMP date entirely and make the Ultrasound Date your new, official Estimated Date of Delivery. This is highly common for women with irregular cycles who may have ovulated much later than they realized.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/pregnancy-due-date-calculator" />
          <PopularCalculators exclude="/calculator/pregnancy-due-date-calculator" />
        </div>
      </div>
    </>
  );
}
