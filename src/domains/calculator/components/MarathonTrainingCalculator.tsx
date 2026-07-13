"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, Activity, Flag } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

interface MarathonResult {
  racePaceSeconds: number;
  racePaceStr: string;
  finishTimeStr: string;
  easyPaceStr: string;
  longPaceStr: string;
  tempoPaceStr: string;
  intervalPaceStr: string;
  chartData: { type: string; paceMin: number }[];
  breakdown: { label: string; pace: string; desc: string }[];
}

function parseTimeToSeconds(timeStr: string): number {
  const parts = timeStr.split(':');
  if (parts.length === 3) {
    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
  } else if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }
  return 0;
}

function formatPace(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')} /mi`;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function calcMarathonPaces(
  goalTimeStr: string
): MarathonResult {
  const marathonDistance = 26.2188;
  const finishTimeSecs = parseTimeToSeconds(goalTimeStr);
  
  if (finishTimeSecs === 0) {
    return {
      racePaceSeconds: 0, racePaceStr: "0:00 /mi", finishTimeStr: "0:00:00",
      easyPaceStr: "0:00 /mi", longPaceStr: "0:00 /mi", tempoPaceStr: "0:00 /mi", intervalPaceStr: "0:00 /mi",
      chartData: [], breakdown: []
    };
  }

  // Calculate strict race pace
  const racePaceSeconds = finishTimeSecs / marathonDistance;

  // Training pace formulas (standard accepted generalized formulas based on race pace)
  // Easy Pace: Race Pace + ~60-120 seconds
  const easyPaceSec = racePaceSeconds * 1.25; 
  // Long Run Pace: Race Pace + ~45-90 seconds
  const longPaceSec = racePaceSeconds * 1.15;
  // Tempo Pace: Race Pace - ~10-20 seconds (Roughly half marathon to 10k pace)
  const tempoPaceSec = racePaceSeconds * 0.93;
  // Interval Pace: Race Pace - ~30-50 seconds (Roughly 5k pace)
  const intervalPaceSec = racePaceSeconds * 0.85;

  const chartData = [
    { type: "Intervals", paceMin: Number((intervalPaceSec / 60).toFixed(2)) },
    { type: "Tempo", paceMin: Number((tempoPaceSec / 60).toFixed(2)) },
    { type: "Marathon (Target)", paceMin: Number((racePaceSeconds / 60).toFixed(2)) },
    { type: "Long Run", paceMin: Number((longPaceSec / 60).toFixed(2)) },
    { type: "Easy Run", paceMin: Number((easyPaceSec / 60).toFixed(2)) },
  ];

  const breakdown = [
    { label: "Target Marathon Pace", pace: formatPace(racePaceSeconds), desc: "The exact pace required on race day." },
    { label: "Easy Run Pace", pace: `${formatPace(easyPaceSec - 15)} - ${formatPace(easyPaceSec + 15)}`, desc: "Conversational pace. Builds aerobic base. Should make up 80% of your weekly miles." },
    { label: "Long Run Pace", pace: `${formatPace(longPaceSec - 15)} - ${formatPace(longPaceSec + 15)}`, desc: "Used for weekend long runs. Teaches the body to burn fat and resist fatigue." },
    { label: "Tempo / Threshold", pace: formatPace(tempoPaceSec), desc: "Comfortably hard. Improves lactate threshold. Usually run for 3-6 miles." },
    { label: "Interval / VO2 Max", pace: formatPace(intervalPaceSec), desc: "Hard, short bursts (400m - 1 mile). Improves speed and running economy." },
  ];

  return {
    racePaceSeconds,
    racePaceStr: formatPace(racePaceSeconds),
    finishTimeStr: formatTime(finishTimeSecs),
    easyPaceStr: formatPace(easyPaceSec),
    longPaceStr: formatPace(longPaceSec),
    tempoPaceStr: formatPace(tempoPaceSec),
    intervalPaceStr: formatPace(intervalPaceSec),
    chartData,
    breakdown
  };
}

export default function MarathonTrainingCalculator() {
  const [goalTime, setGoalTime] = useState("03:30:00");

  const [result, setResult] = useState<MarathonResult | null>(null);

  const calculate = () => {
    setResult(calcMarathonPaces(goalTime));
  };

  useEffect(() => { setResult(calcMarathonPaces("03:30:00")); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground text-center font-mono";

  const faqs = [
    { question: "Why is my 'Easy Pace' so slow?", answer: "This is the #1 mistake new marathoners make. To build a massive aerobic engine, you must run your easy runs truly easy (conversational pace). Running your easy runs too fast causes excessive fatigue, prevents recovery, and guarantees you will fail to hit your fast paces during Tempo and Interval workouts. 80% of your weekly mileage should be at this slow, easy pace." },
    { question: "Should I run 26 miles before race day?", answer: "No. The vast majority of marathon training plans max out the 'Long Run' at 20 or 22 miles. Running a full 26.2 miles in training requires too much recovery time and increases the risk of injury. The adrenaline of race day, the taper period, and the crowds will carry you those final 4 miles." },
    { question: "What is a Tempo Run?", answer: "A tempo run (or lactate threshold run) is run at a 'comfortably hard' pace—usually a pace you could hold for exactly one hour in a race (roughly between your 10k and Half Marathon pace). These runs teach your body to clear blood lactate faster than it accumulates, delaying the burning sensation in your legs." },
    { question: "What does it mean to 'Hit the Wall'?", answer: "Your body can only store about 2,000 calories worth of glycogen (carbohydrates) in your muscles and liver. A marathon requires roughly 3,000 calories. Around mile 18-20, your glycogen stores completely deplete. If you haven't fueled with gels/carbs during the race, your body switches to burning fat, which requires more oxygen and drastically slows you down. This complete loss of energy is 'the wall.'" },
    { question: "How accurate are these pace predictions?", answer: "These formulas provide standard physiological training zones. However, marathon success relies heavily on total weekly mileage and endurance. You might be able to run the required Tempo pace easily, but if your weekly mileage is only 20 miles, your legs will still fail on race day regardless of your speed." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Marathon Training Pace Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Marathon Training Pace Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-base font-medium mb-1.5 block text-center">Goal Marathon Finish Time</label>
              <div className="flex justify-center mb-1">
                <div className={`${inp} w-40`}><input type="text" value={goalTime} onChange={e => setGoalTime(e.target.value)} placeholder="HH:MM:SS" className={ci} /></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 text-center">Format: HH:MM:SS (e.g. 03:30:00 or 04:00:00)</p>
            </div>

            <div className="border-t border-border pt-4 mt-2">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2"><Flag className="w-4 h-4" /> Common Boston Qualifiers (BQ)</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <button onClick={() => {setGoalTime("03:00:00"); setResult(calcMarathonPaces("03:00:00"));}} className="p-2 border border-border rounded hover:bg-secondary transition-colors text-center">Men 18-34: <span className="font-bold">3:00</span></button>
                <button onClick={() => {setGoalTime("03:30:00"); setResult(calcMarathonPaces("03:30:00"));}} className="p-2 border border-border rounded hover:bg-secondary transition-colors text-center">Women 18-34: <span className="font-bold">3:30</span></button>
                <button onClick={() => {setGoalTime("03:10:00"); setResult(calcMarathonPaces("03:10:00"));}} className="p-2 border border-border rounded hover:bg-secondary transition-colors text-center">Men 40-44: <span className="font-bold">3:10</span></button>
                <button onClick={() => {setGoalTime("03:40:00"); setResult(calcMarathonPaces("03:40:00"));}} className="p-2 border border-border rounded hover:bg-secondary transition-colors text-center">Women 40-44: <span className="font-bold">3:40</span></button>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={() => { setGoalTime("03:30:00"); setResult(calcMarathonPaces("03:30:00")); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-sm font-bold uppercase tracking-wider mb-1 text-primary">Required Race Pace</div>
                <div className="text-5xl font-extrabold text-foreground tracking-tight font-mono">{result.racePaceStr}</div>
                <div className="text-base text-muted-foreground mt-2">
                  To finish a full marathon (26.2 miles) in <span className="font-medium text-foreground">{result.finishTimeStr}</span>, you must hold this average pace.
                </div>
              </div>
              
              <div className="card-calculator !p-0 border border-border bg-card overflow-hidden">
                <div className="p-4 bg-muted border-b border-border font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" /> Training Paces
                </div>
                <div className="flex flex-col">
                  {result.breakdown.map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row border-b border-border/50 last:border-0 p-4">
                      <div className="w-full sm:w-40 font-bold text-primary shrink-0 mb-1 sm:mb-0 text-lg font-mono">
                        {item.pace}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-foreground mb-0.5">{item.label}</div>
                        <div className="text-sm text-muted-foreground">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Pace Curve (Minutes/Mile)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={result.chartData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 12 }} reversed={false} domain={['dataMin - 1', 'dataMax + 1']} tickFormatter={(v) => `${Math.floor(v)}:${Math.round((v % 1)*60).toString().padStart(2,'0')}`} />
                    <Tooltip cursor={{ stroke: 'var(--border)', strokeWidth: 2 }} formatter={(v: number) => [`${Math.floor(v)}:${Math.round((v % 1)*60).toString().padStart(2,'0')} /mi`, "Pace"]} />
                    <ReferenceLine y={result.racePaceSeconds / 60} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'Race Target', fill: '#ef4444', fontSize: 10 }} />
                    <Line type="monotone" dataKey="paceMin" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6, fill: "#3b82f6", strokeWidth: 2, stroke: "var(--background)" }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Mastering Marathon Training Paces</h2>
            <p>This <strong>Marathon Training Pace Calculator</strong> takes your goal finish time and reverse-engineers the exact paces you need to run during your weekly training blocks. Whether you are aiming for a sub-3 hour Boston Qualifier or looking to finish your first race under 4 hours, strictly adhering to these varied training zones is the key to preventing injury and building endurance.</p>
            <h2 className="text-2xl font-bold mb-3">The 80/20 Rule of Distance Running</h2>
            <p>The biggest mistake amateur runners make is running their easy runs too fast and their hard runs too slow, creating a "junk mile" gray zone. Elite athletes follow the 80/20 rule (polarized training): 80% of your weekly mileage should be run at an incredibly slow, conversational <strong>Easy Pace</strong>. This builds your aerobic base, increases mitochondrial density, and allows your legs to recover. Only 20% of your miles should be run at the strenuous <strong>Tempo</strong> or <strong>Interval</strong> paces.</p>
            <h2 className="text-2xl font-bold mb-3">Why Your Easy Pace Must Be Slow</h2>
            <p>If your marathon goal is 3:30:00 (an 8:00/mile pace), this calculator will suggest an Easy Pace of roughly 10:00/mile. For many, this feels agonizingly slow. However, if you run your easy miles at an 8:45 pace, you are generating excess lactic acid and residual fatigue. When Wednesday's Tempo workout arrives, your legs will be too heavy to hit the required speeds. Slow down on your easy days so you can actually run fast on your hard days. Related tools: <a href="/calculator/calories-burned-walking">Walking Calorie Calculator</a>, <a href="/calculator/cycling-calories-calculator">Cycling Calculator</a>.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/marathon-training-calculator" />
          <PopularCalculators exclude="/calculator/marathon-training-calculator" />
        </div>
      </div>
    </>
  );
}
