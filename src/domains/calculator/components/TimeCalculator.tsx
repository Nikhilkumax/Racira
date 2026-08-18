"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface TimeResult {
  totalSeconds: number;
  totalMinutes: number;
  totalHours: number;
  totalDays: number;
  resultString: string;
  isError: boolean;
  errorMsg?: string;
}

const calculateTime = (
  op: "add" | "sub",
  d1: string, h1: string, m1: string, s1: string,
  d2: string, h2: string, m2: string, s2: string
): TimeResult | null => {
  const days1 = parseFloat(d1 || "0");
  const hours1 = parseFloat(h1 || "0");
  const mins1 = parseFloat(m1 || "0");
  const secs1 = parseFloat(s1 || "0");

  const days2 = parseFloat(d2 || "0");
  const hours2 = parseFloat(h2 || "0");
  const mins2 = parseFloat(m2 || "0");
  const secs2 = parseFloat(s2 || "0");

  if (isNaN(days1) || isNaN(hours1) || isNaN(mins1) || isNaN(secs1) ||
      isNaN(days2) || isNaN(hours2) || isNaN(mins2) || isNaN(secs2)) {
    return null;
  }

  try {
    // Convert to total seconds
    const totalSecs1 = (days1 * 86400) + (hours1 * 3600) + (mins1 * 60) + secs1;
    const totalSecs2 = (days2 * 86400) + (hours2 * 3600) + (mins2 * 60) + secs2;

    let finalSecs = 0;
    if (op === "add") {
      finalSecs = totalSecs1 + totalSecs2;
    } else {
      finalSecs = totalSecs1 - totalSecs2;
    }

    const isNeg = finalSecs < 0;
    const absSecs = Math.abs(finalSecs);

    const rDays = Math.floor(absSecs / 86400);
    const rHours = Math.floor((absSecs % 86400) / 3600);
    const rMins = Math.floor((absSecs % 3600) / 60);
    const rSecs = absSecs % 60;

    let resStr = isNeg ? "-" : "";
    if (rDays > 0) resStr += `${rDays} Days, `;
    if (rHours > 0 || rDays > 0) resStr += `${rHours} Hours, `;
    if (rMins > 0 || rHours > 0 || rDays > 0) resStr += `${rMins} Minutes, `;
    resStr += `${rSecs} Seconds`;

    // Clean up trailing comma if needed (though format above won't have it at the end)
    
    return {
      totalSeconds: finalSecs,
      totalMinutes: parseFloat((finalSecs / 60).toFixed(4)),
      totalHours: parseFloat((finalSecs / 3600).toFixed(4)),
      totalDays: parseFloat((finalSecs / 86400).toFixed(4)),
      resultString: resStr,
      isError: false
    };

  } catch (err) {
    return { totalSeconds: 0, totalMinutes: 0, totalHours: 0, totalDays: 0, resultString: "", isError: true, errorMsg: "Calculation error." };
  }
};

const TimeCalculator = () => {
  const [op, setOp] = useState<"add" | "sub">("add");
  const [d1, setD1] = useState("0");
  const [h1, setH1] = useState("5");
  const [m1, setM1] = useState("30");
  const [s1, setS1] = useState("0");

  const [d2, setD2] = useState("0");
  const [h2, setH2] = useState("2");
  const [m2, setM2] = useState("45");
  const [s2, setS2] = useState("0");

  const [result, setResult] = useState<TimeResult | null>(null);

  const calculate = () => {
    setResult(calculateTime(op, d1, h1, m1, s1, d2, h2, m2, s2));
  };

  useEffect(() => { calculate(); }, [op, d1, h1, m1, s1, d2, h2, m2, s2]);

  const wrap = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground font-mono text-center";

  const faqs = [
    { question: "Why is time math so difficult?", answer: "Humans naturally think in the decimal system (Base-10) where numbers cleanly roll over at 10, 100, and 1000. Time uses the Sexagesimal system (Base-60), invented by the ancient Sumerians. Because minutes and seconds roll over at 60 instead of 100, you cannot simply add '1.30' and '2.45' together on a standard calculator to get 4 hours and 15 minutes." },
    { question: "How does this calculator handle subtraction?", answer: "If you subtract a larger amount of time from a smaller amount of time, the calculator will return a negative time value. For example, 1 hour minus 3 hours equals -2 hours. This is highly useful for payroll calculations when attempting to calculate how many hours a project fell behind schedule." },
    { question: "Are decimals supported?", answer: "Yes. You can enter '1.5' into the Hours box, and the calculator will correctly interpret it as 1 hour and 30 minutes. The calculator converts all inputs into a massive pool of raw seconds, performs the mathematics, and then re-packages the seconds into days, hours, and minutes." },
    { question: "Why does Base-60 exist?", answer: "The Sumerians and Babylonians loved the number 60 because it is a highly composite number. It can be divided evenly by 1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30, and 60. This made early fractional mathematics incredibly easy for ancient astronomers and navigators before the invention of the decimal point." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Time Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Time Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
          <div className="card-calculator flex flex-col gap-5 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-base font-medium text-primary mb-1.5 font-bold">Time 1</label>
              <div className="grid grid-cols-4 gap-2">
                <div><div className="text-xs text-muted-foreground text-center mb-1 font-bold">Days</div><div className={wrap}><input type="number" value={d1} onChange={e => setD1(e.target.value)} className={ci} step="any" /></div></div>
                <div><div className="text-xs text-muted-foreground text-center mb-1 font-bold">Hours</div><div className={wrap}><input type="number" value={h1} onChange={e => setH1(e.target.value)} className={ci} step="any" /></div></div>
                <div><div className="text-xs text-muted-foreground text-center mb-1 font-bold">Mins</div><div className={wrap}><input type="number" value={m1} onChange={e => setM1(e.target.value)} className={ci} step="any" /></div></div>
                <div><div className="text-xs text-muted-foreground text-center mb-1 font-bold">Secs</div><div className={wrap}><input type="number" value={s1} onChange={e => setS1(e.target.value)} className={ci} step="any" /></div></div>
              </div>
            </div>

            <div className="flex justify-center my-1">
              <div className="flex rounded-md border border-input overflow-hidden h-10 w-48 shadow-sm">
                <button type="button" onClick={() => setOp("add")} className={`flex-1 text-sm font-bold transition-colors ${op === "add" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>+ Add</button>
                <button type="button" onClick={() => setOp("sub")} className={`flex-1 text-sm font-bold transition-colors border-l border-input ${op === "sub" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>- Subtract</button>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-base font-medium text-orange-500 mb-1.5 font-bold">Time 2</label>
              <div className="grid grid-cols-4 gap-2">
                <div><div className="text-xs text-muted-foreground text-center mb-1 font-bold">Days</div><div className={wrap}><input type="number" value={d2} onChange={e => setD2(e.target.value)} className={ci} step="any" /></div></div>
                <div><div className="text-xs text-muted-foreground text-center mb-1 font-bold">Hours</div><div className={wrap}><input type="number" value={h2} onChange={e => setH2(e.target.value)} className={ci} step="any" /></div></div>
                <div><div className="text-xs text-muted-foreground text-center mb-1 font-bold">Mins</div><div className={wrap}><input type="number" value={m2} onChange={e => setM2(e.target.value)} className={ci} step="any" /></div></div>
                <div><div className="text-xs text-muted-foreground text-center mb-1 font-bold">Secs</div><div className={wrap}><input type="number" value={s2} onChange={e => setS2(e.target.value)} className={ci} step="any" /></div></div>
              </div>
            </div>

            <div className="flex gap-2.5 mt-4">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={() => { setOp("add"); setD1("0"); setH1("5"); setM1("30"); setS1("0"); setD2("0"); setH2("2"); setM2("45"); setS2("0"); }} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && result.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5 flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Input Error</div>
                  <div className="text-base font-medium text-foreground">Please check your inputs and try again.</div>
                </div>
              </div>
            ) : result && (<>
              
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Resulting Time Span</div>
                <div className="text-4xl font-extrabold text-primary tracking-tight">{result.resultString}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {op === "add" ? "Time 1 + Time 2" : "Time 1 − Time 2"} · {Math.abs(result.totalSeconds).toLocaleString()} seconds
                </div>
              </div>

              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[
                  ["Total Hours", `${result.totalHours}`],
                  ["Total Minutes", `${result.totalMinutes}`],
                  ["Total Seconds", `${result.totalSeconds.toLocaleString()}`],
                ].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold text-foreground font-mono">{v}</div>
                  </div>
                ))}
              </div>

              <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
                <div className="bg-secondary/50 p-4 border-b border-border/50">
                  <h3 className="font-bold text-foreground">Decimal Equivalents</h3>
                </div>
                <div className="divide-y divide-border/50">
                  <div className="grid grid-cols-2 p-4 items-center">
                    <div className="text-sm font-bold text-foreground uppercase">Total Days</div>
                    <div className="text-right font-mono text-muted-foreground">{result.totalDays}</div>
                  </div>
                  <div className="grid grid-cols-2 p-4 items-center">
                    <div className="text-sm font-bold text-foreground uppercase">Total Hours</div>
                    <div className="text-right font-mono text-muted-foreground">{result.totalHours}</div>
                  </div>
                  <div className="grid grid-cols-2 p-4 items-center bg-secondary/10">
                    <div className="text-sm font-bold text-foreground uppercase">Total Minutes</div>
                    <div className="text-right font-mono text-primary font-bold">{result.totalMinutes.toLocaleString()}</div>
                  </div>
                  <div className="grid grid-cols-2 p-4 items-center">
                    <div className="text-sm font-bold text-foreground uppercase">Total Seconds</div>
                    <div className="text-right font-mono text-muted-foreground">{result.totalSeconds.toLocaleString()}</div>
                  </div>
                </div>
              </div>

            </>)}
            {result && !result.isError && (
              <>
                <div className="rounded-lg border border-border bg-card p-5">
                  <h3 className="text-base font-bold mb-4">Result Components</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[{ name: "Days", value: Math.floor(Math.abs(result.totalSeconds) / 86400) }, { name: "Hours", value: Math.floor((Math.abs(result.totalSeconds) % 86400) / 3600) }, { name: "Minutes", value: Math.floor((Math.abs(result.totalSeconds) % 3600) / 60) }, { name: "Seconds", value: Math.abs(result.totalSeconds) % 60 }]} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
                      <Tooltip formatter={(v: number) => `${v}`} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-muted-foreground mt-2 text-center">The result re-packaged from seconds into days, hours, minutes, and seconds.</p>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                    {[
                      ["Time Span", result.resultString],
                      ["Total Seconds", result.totalSeconds.toLocaleString()],
                      ["Total Minutes", `${result.totalMinutes}`],
                      ["Total Hours", `${result.totalHours}`],
                      ["Total Days", `${result.totalDays}`],
                      ["Operation", op === "add" ? "Addition" : "Subtraction"],
                    ].map(([l, v]) => (
                      <div key={l} className="flex justify-between">
                        <span className="text-muted-foreground">{l}:</span>
                        <span className="font-semibold text-foreground font-mono">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Base-60 Problem</h2>
            <p>If you try to add 2 hours and 45 minutes to 3 hours and 30 minutes using a standard desk calculator, you might type <code>2.45 + 3.30</code>. The calculator will output <code>5.75</code>. This is mathematically correct in the Base-10 decimal system, but it is entirely incorrect for calculating time. 5.75 hours is not 5 hours and 75 minutes. Because time rolls over at 60, the correct answer is 6 hours and 15 minutes.</p>

            <h2 className="text-2xl font-bold mb-3">Why do we use Base-60?</h2>
            <p>The modern world uses the metric system (Base-10) for almost every scientific measurement: length, weight, and volume. The major exception is Time. The division of hours into 60 minutes, and minutes into 60 seconds, is a remnant of the Sexagesimal numeral system invented by the ancient Sumerians roughly 5,000 years ago, and later passed down to the Babylonians.</p>
            <p>Why did they choose 60? The number 60 is a "highly composite" number. It can be divided evenly into whole numbers by 1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30, and 60. Before the invention of the decimal point, ancient astronomers and mathematicians needed a system that allowed them to easily break things into simple fractions. A third of an hour is a clean 20 minutes. A quarter of an hour is a clean 15 minutes. Try dividing 100 into a clean third, and you will see the genius of the Babylonian system.</p>

            <h2 className="text-2xl font-bold mb-3">How Time Addition Works</h2>
            <p>To accurately add or subtract time, computers bypass the Base-60 problem entirely by converting everything into a single, massive pool of <strong>Seconds</strong>. For example, 1 hour and 1 minute is converted into 3,660 seconds. The computer then adds the seconds together using standard decimal math. Once the final number of seconds is calculated, the computer physically packages those seconds back up, dividing them into blocks of 86,400 to find days, blocks of 3,600 to find hours, and blocks of 60 to find minutes.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/time-calculator" />
          <PopularCalculators exclude="/calculator/time-calculator" />
        </div>
      </div>
    </>
  );
};
export default TimeCalculator;
