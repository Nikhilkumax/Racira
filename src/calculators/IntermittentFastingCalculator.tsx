"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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

const PROTOCOLS = [
  { name: "16:8 (Leangains)", fast: 16, eat: 8, description: "Fast for 16 hours, eat within an 8-hour window." },
  { name: "18:6", fast: 18, eat: 6, description: "Fast for 18 hours, eat within a 6-hour window." },
  { name: "20:4 (Warrior Diet)", fast: 20, eat: 4, description: "Fast for 20 hours, eat within a 4-hour window." },
  { name: "14:10", fast: 14, eat: 10, description: "Gentle approach - Fast for 14 hours, eat in a 10-hour window." },
  { name: "12:12", fast: 12, eat: 12, description: "Circadian rhythm fasting - Equal split." },
];

export default function IntermittentFastingCalculator() {
  const [protocolIndex, setProtocolIndex] = useState(0);
  const [fastStartTime, setFastStartTime] = useState("20:00");
  const [res, setRes] = useState<{
    fastHours: number;
    eatHours: number;
    fastEnd: string;
    eatEnd: string;
    chartData: { name: string; hours: number; fill: string }[];
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); calc(); }, []);

  const calc = () => {
    const selected = PROTOCOLS[protocolIndex];
    const fastH = selected.fast;
    const eatH = selected.eat;

    const [startH, startM] = fastStartTime.split(":").map(Number);
    
    // Fast end time (Eating window starts)
    const fastEndHour = (startH + fastH) % 24;
    const fastEndStr = `${fastEndHour.toString().padStart(2, "0")}:${startM.toString().padStart(2, "0")}`;

    // Eating window ends (Next fasting starts)
    const eatEndHour = (fastEndHour + eatH) % 24;
    const eatEndStr = `${eatEndHour.toString().padStart(2, "0")}:${startM.toString().padStart(2, "0")}`;

    const chartData = [
      { name: "Fasting Window", hours: fastH, fill: "hsl(var(--primary))" },
      { name: "Eating Window", hours: eatH, fill: "hsl(var(--primary) / 0.3)" },
    ];

    setRes({
      fastHours: fastH,
      eatHours: eatH,
      fastEnd: fastEndStr,
      eatEnd: eatEndStr,
      chartData,
    });
  };

  const reset = () => {
    setProtocolIndex(0);
    setFastStartTime("20:00");
  };

  const format12Hour = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
  };

  const faqs = [
    { question: "What is Intermittent Fasting?", answer: "Intermittent fasting is an eating pattern that cycles between periods of fasting and eating. It does not specify which foods you should eat, but rather when you should eat them." },
    { question: "What is the most popular intermittent fasting schedule?", answer: "The 16:8 method is the most popular, involving a daily 16-hour fast and an 8-hour eating window (e.g., eating between 12 PM and 8 PM, and fasting from 8 PM to 12 PM the next day)." },
    { question: "Can I drink liquids while fasting?", answer: "Yes. Water, black coffee, and plain unsweetened tea are allowed and will not break your fast. Avoid sugar, milk, creamer, or sweeteners." },
    { question: "How does intermittent fasting help with weight loss?", answer: "Fasting limits your eating window, which naturally tends to reduce overall calorie intake. It also lowers insulin levels and increases human growth hormone (HGH), promoting fat breakdown." },
    { question: "Is intermittent fasting safe for everyone?", answer: "It is generally safe for most healthy adults, but not recommended for pregnant/breastfeeding women, individuals with a history of eating disorders, or those under 18. People with diabetes should consult a doctor first." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Intermittent Fasting Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Intermittent Fasting Schedule Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Fasting Setup</h2>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">Fasting Protocol</label>
              <select value={protocolIndex} onChange={e => setProtocolIndex(Number(e.target.value))} className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                {PROTOCOLS.map((p, idx) => <option key={p.name} value={idx}>{p.name}</option>)}
              </select>
              <p className="text-xs text-muted-foreground mt-1">{PROTOCOLS[protocolIndex].description}</p>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label htmlFor="start" className="text-sm font-semibold text-foreground">Fasting Start Time</label>
              <input id="start" type="time" value={fastStartTime} onChange={e => setFastStartTime(e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>

            <div className="flex gap-2.5 mt-2">
              <button type="button" onClick={calc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
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
                  <h2 className="text-2xl font-bold mb-3">Daily Schedule</h2>
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4 text-center">
                    <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Fast Starts</div>
                    <div className="text-2xl font-extrabold text-foreground">{format12Hour(fastStartTime)}</div>
                    <div className="text-[11px] text-muted-foreground mt-1">Duration: {res.fastHours}h</div>
                  </div>
                  <div className="bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 rounded-xl p-4 text-center">
                    <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Eat Starts (Fast Ends)</div>
                    <div className="text-2xl font-extrabold text-foreground">{format12Hour(res.fastEnd)}</div>
                    <div className="text-[11px] text-muted-foreground mt-1">Duration: {res.eatHours}h</div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left text-sm">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-2.5 pl-3">Phase</th><th className="p-2.5">Time Interval</th><th className="p-2.5 pr-3 text-right">Duration</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { name: "Fasting Window", interval: `${format12Hour(fastStartTime)} - ${format12Hour(res.fastEnd)}`, duration: `${res.fastHours} Hours`, bold: true },
                        { name: "Eating Window", interval: `${format12Hour(res.fastEnd)} - ${format12Hour(res.eatEnd)}`, duration: `${res.eatHours} Hours` },
                      ].map(r => (
                        <tr key={r.name} className={`hover:bg-secondary/20 ${r.bold ? "font-bold bg-secondary/30" : ""}`}>
                          <td className="p-2.5 pl-3 font-semibold text-muted-foreground">{r.name}</td>
                          <td className="p-2.5 text-foreground">{r.interval}</td>
                          <td className="p-2.5 pr-3 text-right font-bold text-foreground">{r.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {mounted && (<>

                  <div className="p-4 rounded-xl border border-border bg-card">
                    <h3 className="text-sm font-bold text-foreground mb-3">Daily Split Visualization</h3>
                    <ResponsiveContainer width="100%" height={150}>
                      <BarChart data={res.chartData} layout="vertical" margin={{ top: 4, right: 8, left: 40, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" tick={{ fontSize: 10 }} domain={[0, 24]} tickFormatter={v => `${v}h`} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v: any) => [`${v} Hours`]} />
                        <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]}>
                          {res.chartData.map((entry, index) => (
                            <rect key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
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
            <h2>Understanding Intermittent Fasting Schedules</h2>
            <p>Intermittent fasting (IF) is an eating framework centered on cyclic periods of voluntary abstinence from food and caloric beverages. Instead of limiting the kinds of food you eat, it restricts the hours in which you eat them, aligning your intake with metabolic and biological cycles.</p>
            <p>Popular protocols include the 16:8 model (sixteen hours of fasting followed by an eight-hour eating window), the 18:6 and 20:4 variations, and alternative schedules like the 5:2 diet (normal eating for five days, restriction for two non-consecutive days). Selecting the right start and end times ensures the fasting window fits seamlessly into your lifestyle, sleep schedule, and work commitments.</p>

            <h2>Scientific Benefits of Fasting</h2>
            <p>During fasting, the body undergoes several physiological changes to optimize health and energy conversion. Insulin levels drop significantly, allowing the body to access stored fat more easily. Cellular repair processes, such as autophagy (where cells clear out damaged components and proteins), are accelerated. Additionally, human growth hormone (HGH) levels increase, which supports fat loss and muscle preservation.</p>
            <p>Clinical studies show that intermittent fasting can support sustainable weight loss, improve insulin resistance, reduce oxidative stress, and lower cardiovascular risk markers. Consistent fasting windows help optimize circadian rhythms, leading to better sleep quality and cognitive focus throughout the day.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/intermittent-fasting-calculator" />
          <PopularCalculators exclude="/calculator/intermittent-fasting-calculator" />
        </div>
      </div>
    </>
  );
}
