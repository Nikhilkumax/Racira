"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, Calendar } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface GestationResult {
  edd: Date;
  gestationalAgeDays: number;
  gestationalAgeWeeks: number;
  gestationalAgeRemainingDays: number;
  trimester: number;
  daysRemaining: number;
  percentComplete: number;
  status: string;
  recommendation: string;
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcGestation(
  method: string, dateStr: string, cycleLength: number
): GestationResult {
  const inputDate = new Date(dateStr);
  const today = new Date();
  
  // Standard pregnancy length is 280 days from LMP
  // Or 266 days from conception/ovulation
  let edd = new Date();
  let lmpDate = new Date();

  if (method === "lmp") {
    // Naegele's rule adjusted for cycle length:
    // EDD = LMP + 280 days + (cycle length - 28)
    const offset = cycleLength - 28;
    edd = new Date(inputDate.getTime() + (280 + offset) * 24 * 60 * 60 * 1000);
    lmpDate = inputDate;
  } else if (method === "conception") {
    // EDD = Conception + 266 days
    edd = new Date(inputDate.getTime() + 266 * 24 * 60 * 60 * 1000);
    lmpDate = new Date(inputDate.getTime() - 14 * 24 * 60 * 60 * 1000);
  } else if (method === "ultrasound") {
    // If ultrasound gave an EDD
    edd = inputDate;
    lmpDate = new Date(edd.getTime() - 280 * 24 * 60 * 60 * 1000);
  } else if (method === "ivf_3") {
    // IVF Day 3 transfer: EDD = Transfer Date + 266 days - 3 days
    edd = new Date(inputDate.getTime() + 263 * 24 * 60 * 60 * 1000);
    lmpDate = new Date(edd.getTime() - 280 * 24 * 60 * 60 * 1000);
  } else if (method === "ivf_5") {
    // IVF Day 5 transfer: EDD = Transfer Date + 266 days - 5 days
    edd = new Date(inputDate.getTime() + 261 * 24 * 60 * 60 * 1000);
    lmpDate = new Date(edd.getTime() - 280 * 24 * 60 * 60 * 1000);
  }

  // Calculate Gestational Age
  const diffTime = today.getTime() - lmpDate.getTime();
  const gestationalAgeDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Cap it at 0 and 300 (post-term)
  const gaSafeguarded = Math.max(0, Math.min(300, gestationalAgeDays));
  
  const gestationalAgeWeeks = Math.floor(gaSafeguarded / 7);
  const gestationalAgeRemainingDays = gaSafeguarded % 7;

  // Days remaining
  const daysRemaining = Math.max(0, Math.floor((edd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  
  // Percent complete
  const percentComplete = Math.min(100, Math.round((gaSafeguarded / 280) * 100));

  // Trimester
  let trimester = 1;
  if (gestationalAgeWeeks >= 13 && gestationalAgeWeeks < 27) trimester = 2;
  else if (gestationalAgeWeeks >= 27) trimester = 3;

  let status = "First Trimester";
  let recommendation = "Fetal organs are rapidly forming. Focus on taking your prenatal vitamins (especially folic acid) and avoiding harmful substances.";

  if (trimester === 2) {
    status = "Second Trimester";
    recommendation = "Often called the 'honeymoon phase'. You may start feeling fetal movement (quickening) soon. Your anatomy scan typically happens around week 20.";
  } else if (trimester === 3) {
    status = "Third Trimester";
    recommendation = "The home stretch. Fetal weight increases rapidly. Speak with your provider about birth plans, kick counts, and signs of labor.";
    if (gestationalAgeWeeks >= 37) {
      status = "Early Term";
      recommendation = "You are considered 'early term.' The baby is fully developed and could arrive at any time. Keep your hospital bag packed.";
    }
    if (gestationalAgeWeeks >= 39) {
      status = "Full Term";
      recommendation = "You are officially full term! Labor is imminent.";
    }
    if (gestationalAgeWeeks >= 41) {
      status = "Post Term";
      recommendation = "You are past your due date. Your provider will likely discuss induction options and monitor amniotic fluid levels.";
    }
  }

  const chartData = [
    { name: "Completed", value: percentComplete, color: "#3b82f6" },
    { name: "Remaining", value: 100 - percentComplete, color: "#f1f5f9" } // using a light slate for the remaining chunk
  ];

  const summaryStats = [
    { label: "Gestational Age", value: `${gestationalAgeWeeks}w ${gestationalAgeRemainingDays}d` },
    { label: "Trimester", value: `Trimester ${trimester}` },
    { label: "Days Elapsed", value: `${gaSafeguarded} days` },
    { label: "Days Until Due Date", value: `${daysRemaining} days` },
  ];

  return { edd, gestationalAgeDays: gaSafeguarded, gestationalAgeWeeks, gestationalAgeRemainingDays, trimester, daysRemaining, percentComplete, status, recommendation, chartData, summaryStats };
}

export default function GestationalAgeCalculator() {
  // Setup default state to today's date minus 12 weeks for a nice demo
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() - 84); // ~12 weeks ago
  const defaultDateStr = defaultDate.toISOString().split('T')[0];

  const [method, setMethod] = useState("lmp");
  const [dateStr, setDateStr] = useState(defaultDateStr);
  const [cycleLength, setCycleLength] = useState("28");

  const [result, setResult] = useState<GestationResult | null>(null);

  const calculate = () => {
    setResult(calcGestation(method, dateStr, parseInt(cycleLength) || 28));
  };

  useEffect(() => { setResult(calcGestation("lmp", defaultDateStr, 28)); }, [defaultDateStr]);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "How is Gestational Age calculated?", answer: "Clinically, gestational age is not calculated from the date of conception. It is calculated from the first day of the mother's Last Menstrual Period (LMP). This means that during the first two weeks of 'pregnancy' (Gestational Weeks 1 and 2), you are not actually pregnant yet—your body is preparing to ovulate." },
    { question: "Why do doctors change my due date?", answer: "If you have irregular periods, the LMP calculation can be wildly inaccurate. Doctors will perform an early dating ultrasound (usually between 7 and 12 weeks) to measure the 'Crown Rump Length' (CRL) of the fetus. If the ultrasound estimates an age that differs from the LMP estimate by more than 5-7 days, the doctor will legally change your official due date to match the ultrasound." },
    { question: "Is my baby fully developed at 37 weeks?", answer: "Yes, 37 weeks is considered 'Early Term.' While it is best for the baby to stay in until 39 weeks ('Full Term') to maximize brain and lung development, babies born at 37 weeks are generally healthy and do not typically require NICU stays for lung immaturity." },
    { question: "What if I know my exact conception date?", answer: "If you used an ovulation predictor kit or temperature tracking, you can use the 'Conception Date' method. The calculator will simply add 266 days to that date to find your due date, which is far more accurate than using LMP if you have long or irregular menstrual cycles." },
    { question: "How does IVF change the calculation?", answer: "In IVF, the exact date of conception is known precisely. If you had a Day 5 blastocyst transfer, the embryo is already 5 days old at the time of transfer. The calculator adds 261 days to your transfer date to get the EDD (266 total gestation days minus 5 days already developed in the lab)." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Gestational Age Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Gestational Age Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-base font-medium mb-1.5 block">Calculation Method</label>
              <select value={method} onChange={e => setMethod(e.target.value)} className={`${inp} w-full px-3 text-sm`}>
                <option value="lmp">First Day of Last Period (LMP)</option>
                <option value="conception">Known Conception / Ovulation Date</option>
                <option value="ultrasound">Due Date from Ultrasound</option>
                <option value="ivf_5">IVF: Day 5 Transfer</option>
                <option value="ivf_3">IVF: Day 3 Transfer</option>
              </select>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-base font-medium mb-1.5 block">
                  {method === "lmp" ? "First Day of Last Period" : method === "conception" ? "Conception Date" : method === "ultrasound" ? "Estimated Due Date" : "Transfer Date"}
                </label>
                <div className={inp}><input type="date" value={dateStr} onChange={e => setDateStr(e.target.value)} className={ci} /></div>
              </div>
              
              {method === "lmp" && (
                <div>
                  <label className="text-base font-medium mb-1.5 block">Average Cycle Length (Days)</label>
                  <div className={inp}><input type="number" min="20" max="45" value={cycleLength} onChange={e => setCycleLength(e.target.value)} className={ci} /></div>
                  <p className="text-xs text-muted-foreground mt-1.5">Standard is 28 days. Adjusting alters the due date.</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={() => { setMethod("lmp"); setDateStr(defaultDateStr); setCycleLength("28"); setResult(calcGestation("lmp", defaultDateStr, 28)); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-sm font-bold uppercase tracking-wider mb-1 text-primary">Current Gestational Age</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">{result.gestationalAgeWeeks} <span className="text-xl">weeks,</span> {result.gestationalAgeRemainingDays} <span className="text-xl">days</span></div>
                <div className="text-base text-muted-foreground mt-2">{result.recommendation}</div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[
                  ["Trimester", `Trimester ${result.trimester}`], 
                  ["Status", result.status], 
                  ["Estimated Due", result.edd.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})], 
                  ["Days Left", `${result.daysRemaining}`]
                ].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-[10px] sm:text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-sm sm:text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>

              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Pregnancy Timeline Progress</h3>
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-full md:w-1/2 h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={result.chartData} cx="50%" cy="50%" startAngle={180} endAngle={0} innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                          {result.chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
                        </Pie>
                        <Tooltip formatter={(v: any) => [`${v}%`, "Progress"]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="text-center -mt-8 font-bold text-xl">{result.percentComplete}%</div>
                  </div>
                  <div className="w-full md:w-1/2 space-y-4">
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div><span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-primary/20 text-primary">T1</span></div>
                        <div className="text-right"><span className="text-xs font-semibold inline-block text-primary">Weeks 1-13</span></div>
                      </div>
                    </div>
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div><span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-primary/20 text-primary">T2</span></div>
                        <div className="text-right"><span className="text-xs font-semibold inline-block text-primary">Weeks 14-26</span></div>
                      </div>
                    </div>
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div><span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-primary/20 text-primary">T3</span></div>
                        <div className="text-right"><span className="text-xs font-semibold inline-block text-primary">Weeks 27-40+</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Pregnancy Milestones</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between border-b border-border/50 pb-1 last:border-0"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold text-right">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding Your Gestational Age</h2>
            <p>This <strong>Gestational Age Calculator</strong> precisely tracks how far along you are in your pregnancy based on multiple clinical dating methods. It determines your exact week and day count (e.g., 20 weeks, 3 days), calculates your Estimated Due Date (EDD), and tracks your progress through the three trimesters.</p>
            <h2>The Medical "Two Week" Oddity</h2>
            <p>The most confusing aspect of gestational age is how the medical community counts it. Your pregnancy is not dated from the moment of conception. Instead, it is dated from the first day of your Last Menstrual Period (LMP). This means that during the first two weeks of "pregnancy" (Gestational Weeks 1 and 2), you are not actually pregnant yet—your body is merely preparing to ovulate. When an embryo implants at Gestational Week 3, the embryo itself is only 1 week old.</p>
            <h2>Why Adjusting for Cycle Length Matters</h2>
            <p>Standard pregnancy wheels assume every woman has a perfect 28-day cycle with ovulation occurring exactly on day 14. If you have a longer cycle (e.g., 35 days), you likely ovulate around day 21. If you use a standard 28-day calculator, your baby will incorrectly measure a week "behind" at the first ultrasound, causing unnecessary panic. This calculator dynamically adjusts Naegele's rule based on your actual cycle length, preventing this false lag.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/gestational-age-calculator" />
          <PopularCalculators exclude="/calculator/gestational-age-calculator" />
        </div>
      </div>
    </>
  );
}
