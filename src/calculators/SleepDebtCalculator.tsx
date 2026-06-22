"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, Moon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  prefix?: string; suffix?: string; type?: string; [key: string]: any;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none shrink-0">{prefix}</span>}
      <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" {...props} />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function SleepDebtCalculator() {
  const [sleepGoal, setSleepGoal] = useState("8");
  const [mon, setMon] = useState("7");
  const [tue, setTue] = useState("6.5");
  const [wed, setWed] = useState("6");
  const [thu, setThu] = useState("7");
  const [fri, setFri] = useState("6");
  const [sat, setSat] = useState("8.5");
  const [sun, setSun] = useState("9");
  
  const [res, setRes] = useState<{
    totalDebt: number;
    avgSleep: number;
    recoveryWeeks: number;
    chartData: { name: string; actual: number; goal: number }[];
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); calc(); }, []);

  const calc = () => {
    const goal = parseFloat(sleepGoal) || 8;
    const sleeps = [
      parseFloat(mon) || 0,
      parseFloat(tue) || 0,
      parseFloat(wed) || 0,
      parseFloat(thu) || 0,
      parseFloat(fri) || 0,
      parseFloat(sat) || 0,
      parseFloat(sun) || 0,
    ];

    const totalActual = sleeps.reduce((a, b) => a + b, 0);
    const totalGoal = goal * 7;
    const totalDebt = Math.max(0, totalGoal - totalActual);
    const avgSleep = totalActual / 7;

    // Safe recovery plan: catch up no more than 1-2 hours per night to preserve circadian cycle
    const recoveryWeeks = totalDebt > 0 ? Math.ceil(totalDebt / 10) : 0; // assuming catching up ~1.4h/day (10h/week max)

    const chartData = DAYS.map((d, idx) => ({
      name: d.substring(0, 3),
      actual: sleeps[idx],
      goal,
    }));

    setRes({
      totalDebt,
      avgSleep,
      recoveryWeeks,
      chartData,
    });
  };

  const reset = () => {
    setSleepGoal("8");
    setMon("7");
    setTue("6.5");
    setWed("6");
    setThu("7");
    setFri("6");
    setSat("8.5");
    setSun("9");
  };

  const faqs = [
    { question: "What is sleep debt?", answer: "Sleep debt (or sleep deficit) is the cumulative difference between the amount of sleep you should be getting (your baseline requirement) and the amount you actually get." },
    { question: "Can you recover from sleep debt by sleeping in on weekends?", answer: "Sleeping in on weekends helps reduce immediate fatigue but does not completely reverse chronic sleep deprivation. It can also disrupt your circadian rhythm, leading to social jetlag." },
    { question: "What is a healthy weekly recovery plan?", answer: "To pay off sleep debt safely, add 1 to 2 hours of extra sleep per night (either by going to bed earlier or taking short 20-minute afternoon naps) rather than sleeping in for 4+ hours on weekends." },
    { question: "What are the health risks of chronic sleep debt?", answer: "Chronic sleep deficit increases the risk of weight gain, diabetes, cardiovascular disease, weakened immunity, impaired concentration, and mood disturbances." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Sleep Debt Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Sleep Debt & Deficit Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-lg font-bold text-foreground pb-2 border-b border-border">Sleep Goal & Weekly Log</h2>
            <CompactInput id="goal" label="Daily Sleep Goal" value={sleepGoal} onChange={setSleepGoal} suffix="hours" min="4" max="12" step="0.5" />
            
            <div className="grid grid-cols-2 gap-4 mt-2">
              <CompactInput id="mon" label="Monday Sleep" value={mon} onChange={setMon} suffix="h" min="0" max="24" step="0.5" />
              <CompactInput id="tue" label="Tuesday Sleep" value={tue} onChange={setTue} suffix="h" min="0" max="24" step="0.5" />
              <CompactInput id="wed" label="Wednesday Sleep" value={wed} onChange={setWed} suffix="h" min="0" max="24" step="0.5" />
              <CompactInput id="thu" label="Thursday Sleep" value={thu} onChange={setThu} suffix="h" min="0" max="24" step="0.5" />
              <CompactInput id="fri" label="Friday Sleep" value={fri} onChange={setFri} suffix="h" min="0" max="24" step="0.5" />
              <CompactInput id="sat" label="Saturday Sleep" value={sat} onChange={setSat} suffix="h" min="0" max="24" step="0.5" />
              <CompactInput id="sun" label="Sunday Sleep" value={sun} onChange={setSun} suffix="h" min="0" max="24" step="0.5" />
            </div>

            <div className="flex gap-2.5 mt-2">
              <button type="button" onClick={calc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">
                <Calculator className="h-4 w-4" /> Calculate Deficit
              </button>
              <button type="button" onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {res && (
              <>
                <>

              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h2 className="text-lg font-bold text-foreground">Deficit Summary</h2>
                  <Moon className="h-5 w-5 text-primary" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4 text-center">
                    <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Weekly Sleep Debt</div>
                    <div className="text-4xl font-extrabold text-foreground">{res.totalDebt.toFixed(1)}</div>
                    <div className="text-[11px] text-muted-foreground mt-1">hours deficit</div>
                  </div>
                  <div className="bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 rounded-xl p-4 text-center">
                    <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Avg. Sleep / Night</div>
                    <div className="text-4xl font-extrabold text-foreground">{res.avgSleep.toFixed(1)}</div>
                    <div className="text-[11px] text-muted-foreground mt-1">hours</div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left text-sm">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-2.5 pl-3">Metric</th><th className="p-2.5 pr-3 text-right">Value</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { label: "Daily Goal", value: `${sleepGoal} hours` },
                        { label: "Total Target Weekly", value: `${parseFloat(sleepGoal) * 7} hours` },
                        { label: "Total Actual Slept", value: `${(res.avgSleep * 7).toFixed(1)} hours` },
                        { label: "Sleep Debt Status", value: res.totalDebt > 0 ? `${res.totalDebt.toFixed(1)} Hours Behind` : "No Debt (Optimal)", bold: true },
                        { label: "Est. Recovery Timeline", value: res.totalDebt > 0 ? `~${res.recoveryWeeks} Week(s) to catch up` : "Fully Rested" },
                      ].map(r => (
                        <tr key={r.label} className={`hover:bg-secondary/20 ${r.bold ? "font-bold bg-secondary/30" : ""}`}>
                          <td className="p-2.5 pl-3 font-semibold text-muted-foreground">{r.label}</td>
                          <td className="p-2.5 pr-3 text-right font-bold text-foreground">{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {mounted && (<>

                  <div className="p-4 rounded-xl border border-border bg-card">
                    <h3 className="text-sm font-bold text-foreground mb-3">Actual vs. Target Sleep</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={res.chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                        <YAxis tick={{ fontSize: 10 }} domain={[0, 12]} />
                        <Tooltip formatter={(v: any) => [`${v} hours`]} />
                        <ReferenceLine y={parseFloat(sleepGoal)} stroke="#ef4444" strokeDasharray="3 3" />
                        <Bar dataKey="actual" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Slept" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                
</>)}
              </div>
            
</>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding Your Sleep Deficit</h2>
            <p>Sleep debt is the cumulative difference between the amount of sleep your body requires and the amount you actually obtain. Just like financial debt, sleep debt accumulates over days of deficit. If you need 8 hours of sleep per night but only obtain 6, you build a sleep debt of 2 hours daily, totaling 14 hours by the end of a single week.</p>
            <p>Chronic sleep deficit impairs cognitive performance, response times, memory retrieval, and emotional regulation. Over time, it contributes to metabolic imbalances, immune suppression, and elevated risks of cardiovascular complications.</p>

            <h2>Safe Sleep Recovery Protocol</h2>
            <p>Recovering from sleep debt cannot be accomplished simply by sleeping for 12 hours on the weekend. Massive shifts in sleep times disrupt circadian synchronization, causing "social jetlag" and making it harder to fall asleep on Sunday night.</p>
            <p>To safely erase sleep debt, aim to add no more than 1 to 2 hours of sleep per night. This can be achieved by moving your bedtime earlier or taking a structured 20-minute nap during the mid-afternoon. Consistently matching or slightly exceeding your baseline goal over several weeks is the healthiest path to cognitive restoration.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/sleep-debt-calculator" />
          <PopularCalculators exclude="/calculator/sleep-debt-calculator" />
        </div>
      </div>
    </>
  );
}
