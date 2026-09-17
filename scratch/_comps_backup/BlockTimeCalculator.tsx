"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface BlockResult {
  totalMinutes: number;
  workMinutes: number;
  breakMinutes: number;
  efficiency: number;
  hoursFormatted: string;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcBlock(blocks: number, timePerBlock: number, breakMinutes: number): BlockResult {
  const b = Math.max(0, Math.round(blocks));
  const t = Math.max(0, timePerBlock);
  const br = Math.max(0, breakMinutes);
  const workMinutes = b * t;
  const totalMinutes = workMinutes + br;
  const efficiency = totalMinutes > 0 ? (workMinutes / totalMinutes) * 100 : 0;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const hoursFormatted = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return {
    totalMinutes,
    workMinutes,
    breakMinutes: br,
    efficiency,
    hoursFormatted,
    chartData: [
      { name: "Work", value: workMinutes },
      { name: "Break", value: br },
    ],
    breakdown: [
      { label: "Number of Blocks", value: `${b}` },
      { label: "Time per Block", value: `${t} min` },
      { label: "Total Work Time", value: `${workMinutes} min (${(workMinutes / 60).toFixed(1)} h)` },
      { label: "Total Break Time", value: `${br} min` },
      { label: "Total Duration", value: `${totalMinutes} min (${hoursFormatted})` },
      { label: "Efficiency", value: `${efficiency.toFixed(1)}%` },
    ],
    summaryStats: [
      { label: "Total Duration", value: hoursFormatted },
      { label: "Total Work", value: `${workMinutes} min` },
      { label: "Total Break", value: `${br} min` },
      { label: "Efficiency", value: `${efficiency.toFixed(1)}%` },
      { label: "Blocks", value: `${b}` },
      { label: "Avg per Block", value: `${t} min` },
    ],
  };
}

const DEFAULTS = { blocks: "5", timePerBlock: "30", breakTime: "10" };

export default function BlockTimeCalculator() {
  const [blocks, setBlocks] = useState(DEFAULTS.blocks);
  const [timePerBlock, setTimePerBlock] = useState(DEFAULTS.timePerBlock);
  const [breakTime, setBreakTime] = useState(DEFAULTS.breakTime);
  const [result, setResult] = useState<BlockResult>(() => calcBlock(5, 30, 10));

  const calculate = () => setResult(calcBlock(parseInt(blocks) || 0, parseFloat(timePerBlock) || 0, parseFloat(breakTime) || 0));
  const reset = () => { setBlocks(DEFAULTS.blocks); setTimePerBlock(DEFAULTS.timePerBlock); setBreakTime(DEFAULTS.breakTime); setResult(calcBlock(5, 30, 10)); };
  useEffect(() => { setResult(calcBlock(5, 30, 10)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is block time?", answer: "Block time is a time-management technique where you divide your day into dedicated blocks, each focused on a single task or type of work. Instead of switching contexts constantly, you group related work — deep work, meetings, email — into uninterrupted sessions." },
    { question: "How many blocks should I plan per day?", answer: "Most people can sustain 4–6 focused blocks a day before quality degrades. The calculator lets you model any number, but if your schedule exceeds 6–8 blocks, consider whether you are over-allocating your energy." },
    { question: "What is a good block length?", answer: "25–30 minutes (Pomodoro-style) suits shallow tasks, while 60–90 minutes works best for deep work. The right length depends on your role and attention span — experiment and use the efficiency metric to compare schedules." },
    { question: "How do breaks affect efficiency?", answer: "Breaks are not wasted time — they prevent burnout and restore focus. This calculator shows work time as a percentage of total time, so you can see how much of your scheduled day is actually productive." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Productivity", href: "/calculator#productivity" }, { label: "Block Time Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Block Time Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Number of Blocks</label>
              <div className={inp}><input type="number" value={blocks} onChange={e => setBlocks(e.target.value)} className={ci} min={0} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Minutes per Block</label>
                <div className={inp}><input type="number" value={timePerBlock} onChange={e => setTimePerBlock(e.target.value)} className={ci} min={0} /><span className="pr-3 text-muted-foreground text-sm">min</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Break per Day</label>
                <div className={inp}><input type="number" value={breakTime} onChange={e => setBreakTime(e.target.value)} className={ci} min={0} /><span className="pr-3 text-muted-foreground text-sm">min</span></div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total Duration</div>
              <div className="text-4xl font-extrabold text-primary">{result.hoursFormatted}</div>
              <div className="text-sm text-muted-foreground mt-1">{result.workMinutes} min work + {result.breakMinutes} min break</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Work Time", `${result.workMinutes} min`], ["Break Time", `${result.breakMinutes} min`], ["Efficiency", `${result.efficiency.toFixed(1)}%`]].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold">{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Schedule Breakdown</h3>
              <table className="w-full text-base"><tbody>
                {result.breakdown.map((r, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-2.5 text-muted-foreground">{r.label}</td>
                    <td className="py-2.5 text-right font-semibold">{r.value}</td>
                  </tr>
                ))}
              </tbody></table>
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Work vs Break Time</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${v}m`} />
                  <Tooltip formatter={(v: number) => [`${v} min`, "Time"]} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={70}>
                    {result.chartData.map((_, i) => <Cell key={i} fill={i === 0 ? "hsl(var(--primary))" : "hsl(var(--primary)/0.35)"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is Block Time?</h2>
            <p>A <strong>block time calculator</strong> helps you plan a day built from focused work sessions. Rather than reacting to interruptions, you decide in advance how many blocks of deep work you will do, how long each one lasts, and how much break time you need between them. The result is the total duration of your schedule plus the percentage of that time that is genuinely productive.</p>
            <h2 className="text-2xl font-bold mb-3">The Calculation</h2>
            <p>Total work time is the number of blocks multiplied by the minutes per block. Adding break time gives the full schedule duration, and dividing work time by that total yields efficiency — the share of your planned day spent actually working. This makes it easy to compare schedules: five 60-minute blocks with a 30-minute lunch is very different from six 45-minute blocks with ten 5-minute breaks.</p>
            <h2 className="text-2xl font-bold mb-3">Applying It to Your Day</h2>
            <p>Start by blocking your most demanding work in the morning, when focus is highest, and schedule lighter tasks later. Always include real breaks — they restore attention and are part of a sustainable plan, not a failure of it. Review your efficiency number weekly and adjust block length and break frequency to match how you actually work.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/block-time-calculator" />
          <PopularCalculators exclude="/calculator/block-time-calculator" />
        </div>
      </div>
    </>
  );
}
