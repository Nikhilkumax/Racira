"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, Briefcase } from "lucide-react";

interface HoursResult {
  totalHours: number; // decimal hours
  timeFormatted: string; // "8h 30m"
  grossPay: number;
  isError: boolean;
  errorMsg?: string;
}

const calculateHours = (
  startH: string, startM: string, startAmPm: string,
  endH: string, endM: string, endAmPm: string,
  breakM: string,
  wageStr: string
): HoursResult | null => {
  const sh = parseInt(startH, 10);
  const sm = parseInt(startM, 10);
  const eh = parseInt(endH, 10);
  const em = parseInt(endM, 10);
  const bm = parseInt(breakM, 10);
  const wage = parseFloat(wageStr);

  if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em) || isNaN(bm) || isNaN(wage) ||
      sh < 1 || sh > 12 || sm < 0 || sm > 59 ||
      eh < 1 || eh > 12 || em < 0 || em > 59 || bm < 0 || wage < 0) {
    return null;
  }

  try {
    // Convert times to military minutes from midnight
    let startTotalMins = (sh === 12 ? 0 : sh * 60) + sm;
    if (startAmPm === "PM") startTotalMins += 12 * 60;

    let endTotalMins = (eh === 12 ? 0 : eh * 60) + em;
    if (endAmPm === "PM") endTotalMins += 12 * 60;

    // Handle overnight shift
    if (endTotalMins < startTotalMins) {
      endTotalMins += 24 * 60;
    }

    const workedMins = endTotalMins - startTotalMins - bm;

    if (workedMins < 0) {
      return { totalHours: 0, timeFormatted: "0h 0m", grossPay: 0, isError: true, errorMsg: "Break time is longer than total shift time." };
    }

    const hours = Math.floor(workedMins / 60);
    const mins = workedMins % 60;
    const decimalHours = workedMins / 60;

    const grossPay = decimalHours * wage;

    return {
      totalHours: parseFloat(decimalHours.toFixed(4)),
      timeFormatted: `${hours}h ${mins}m`,
      grossPay: parseFloat(grossPay.toFixed(2)),
      isError: false
    };

  } catch (err) {
    return { totalHours: 0, timeFormatted: "0h 0m", grossPay: 0, isError: true, errorMsg: "Calculation error." };
  }
};

const HoursCalculator = () => {
  const [sh, setSh] = useState("9");
  const [sm, setSm] = useState("0");
  const [sampm, setSampm] = useState("AM");

  const [eh, setEh] = useState("5");
  const [em, setEm] = useState("30");
  const [eampm, setEampm] = useState("PM");

  const [bm, setBm] = useState("30"); // Unpaid break in minutes
  const [wage, setWage] = useState("20");

  const [result, setResult] = useState<HoursResult | null>(null);

  const calculate = () => {
    setResult(calculateHours(sh, sm, sampm, eh, em, eampm, bm, wage));
  };

  useEffect(() => { calculate(); }, [sh, sm, sampm, eh, em, eampm, bm, wage]);

  const wrap = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-2 text-base bg-transparent outline-none border-none text-foreground text-center font-mono";

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const faqs = [
    { question: "What is an 'overnight shift' calculation?", answer: "If you clock in at 10:00 PM and clock out at 6:00 AM, standard subtraction (6 minus 10) results in a negative number. This calculator automatically detects overnight shifts (when the end time is mathematically earlier than the start time) and correctly adds 24 hours to the end time to calculate the true duration of the shift." },
    { question: "Why is 8 hours and 30 minutes written as 8.5?", answer: "To calculate payroll, human resources departments must multiply your total hours by your hourly wage. You cannot mathematically multiply $20 by '8 hours and 30 minutes'. The time must be converted into a decimal. Because 30 minutes is exactly half of an hour (30/60 = 0.5), it becomes 8.5 decimal hours." },
    { question: "Do unpaid breaks subtract from my total?", answer: "Yes. Federal labor laws generally require employers to provide a 30-minute unpaid meal break for shifts over a certain length. This time belongs to you, not the employer, meaning it must be subtracted from the total time between your clock-in and clock-out stamps." },
    { question: "Is this my take-home pay?", answer: "No. This calculator provides your Gross Pay (the total amount you physically earned). Before you see a paycheck, your employer is legally required to withhold federal income tax, state income tax, Social Security (6.2%), and Medicare (1.45%). Your actual take-home pay (Net Pay) will be lower." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Hours Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Hours & Payroll Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
          <div className="card-calculator flex flex-col gap-5 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-base font-medium text-emerald-600 dark:text-emerald-400 mb-1.5 font-bold">Clock In (Start Time)</label>
              <div className="flex gap-2">
                <div className="flex-1"><div className="text-xs text-muted-foreground text-center mb-1 font-bold">Hour</div><div className={wrap}><input type="number" value={sh} onChange={e => setSh(e.target.value)} className={ci} min="1" max="12" /></div></div>
                <div className="flex flex-col justify-end pb-2 font-bold text-lg">:</div>
                <div className="flex-1"><div className="text-xs text-muted-foreground text-center mb-1 font-bold">Minute</div><div className={wrap}><input type="number" value={sm} onChange={e => setSm(e.target.value)} className={ci} min="0" max="59" /></div></div>
                <div className="w-24 flex items-end">
                  <div className={`${wrap} w-full`}>
                    <select value={sampm} onChange={e => setSampm(e.target.value)} className={ci}>
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-base font-medium text-orange-500 mb-1.5 font-bold">Clock Out (End Time)</label>
              <div className="flex gap-2">
                <div className="flex-1"><div className="text-xs text-muted-foreground text-center mb-1 font-bold">Hour</div><div className={wrap}><input type="number" value={eh} onChange={e => setEh(e.target.value)} className={ci} min="1" max="12" /></div></div>
                <div className="flex flex-col justify-end pb-2 font-bold text-lg">:</div>
                <div className="flex-1"><div className="text-xs text-muted-foreground text-center mb-1 font-bold">Minute</div><div className={wrap}><input type="number" value={em} onChange={e => setEm(e.target.value)} className={ci} min="0" max="59" /></div></div>
                <div className="w-24 flex items-end">
                  <div className={`${wrap} w-full`}>
                    <select value={eampm} onChange={e => setEampm(e.target.value)} className={ci}>
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px w-full bg-border/50"></div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-1.5">Unpaid Break</label>
                <div className={wrap}><input type="number" value={bm} onChange={e => setBm(e.target.value)} className={ci} min="0" /><span className="pr-3 text-muted-foreground text-sm">mins</span></div>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-1.5">Hourly Wage</label>
                <div className={wrap}><span className="pl-3 text-muted-foreground font-bold">$</span><input type="number" value={wage} onChange={e => setWage(e.target.value)} className={ci} min="0" step="any" /></div>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-12 text-lg transition-all active:scale-[0.98] shadow-sm">Calculate</button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && result.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5 flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Input Error</div>
                  <div className="text-base font-medium text-foreground">{result.errorMsg}</div>
                </div>
              </div>
            ) : result && (<>
              
              <div className="bg-emerald-500/10 border-l-4 border-emerald-500 rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-wider">Gross Shift Pay</div>
                  <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                    <span className="text-5xl md:text-6xl font-extrabold text-foreground tracking-tight font-mono leading-tight">
                      {formatCurrency(result.grossPay)}
                    </span>
                  </div>
                </div>
                <div className="bg-background border border-border/50 rounded-lg p-3 text-center md:w-40 shrink-0">
                  <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Time on Clock</div>
                  <div className="text-2xl font-bold text-foreground font-mono">{result.timeFormatted}</div>
                </div>
              </div>

              <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden mt-2">
                <div className="bg-secondary/50 p-4 border-b border-border/50">
                  <h3 className="font-bold text-foreground">Payroll Conversion</h3>
                </div>
                <div className="p-6 text-center">
                  <div className="text-sm font-bold text-muted-foreground uppercase mb-2">Decimal Hours for Payroll</div>
                  <div className="text-4xl font-extrabold text-primary font-mono">{result.totalHours}</div>
                  <p className="text-sm text-muted-foreground mt-4 leading-relaxed max-w-xs">
                    To calculate your paycheck, HR multiplies this exact decimal number by your hourly wage.
                  </p>
                </div>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Mathematics of Payroll</h2>
            <p>Tracking time for payroll is notoriously frustrating because clocks operate on a Base-60 mathematical system (60 minutes in an hour), but financial currency operates on a Base-10 system (100 cents in a dollar).</p>
            <p>If you work 8 hours and 15 minutes, and your wage is $20 an hour, you cannot simply multiply 8.15 * 20. The answer you get ($163) is legally incorrect, and doing so will result in massive payroll violations. You must first convert the sexagesimal time into a standardized decimal format.</p>

            <h2 className="text-2xl font-bold mb-3">Converting Minutes to Decimals</h2>
            <p>To convert time for payroll, you must take the number of minutes you worked and divide it by 60. For example, 15 minutes divided by 60 equals 0.25. Therefore, a shift of 8 hours and 15 minutes is mathematically <strong>8.25 Decimal Hours</strong>.</p>
            <p>Now, you can perform the financial calculation: 8.25 * $20 = $165. By properly converting to decimal time, you ensure you are paid the correct amount. This calculator handles the entire conversion automatically, subtracting your unpaid breaks and outputting the exact decimal format required by Human Resources.</p>

            <h2 className="text-2xl font-bold mb-3">Overnight Shifts</h2>
            <p>Another common issue with time calculation is the "graveyard" shift. If a nurse clocks in at 10:00 PM and clocks out at 6:00 AM, a basic subtraction formula (6 minus 10) results in a negative number (-4 hours). To solve this, payroll algorithms must detect that the end time is numerically smaller than the start time, and artificially add 24 hours to the end time to represent the next day. This calculator automatically detects overnight shifts and adjusts the math behind the scenes.</p>

            <h2 className="text-2xl font-bold mb-3">Gross Pay vs Net Pay</h2>
            <p>It is important to remember that this calculator outputs your <strong>Gross Pay</strong>. This is the raw value of the time you sold to your employer. However, you will never see this full amount in your bank account. In the United States, employers are legally required to act as tax collectors for the federal government. Before writing your paycheck, they will automatically deduct 6.2% for Social Security, 1.45% for Medicare, and a sliding percentage for Federal and State Income Tax. Your final take-home amount is known as your <strong>Net Pay</strong>.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/hours-calculator" />
          <PopularCalculators exclude="/calculator/hours-calculator" />
        </div>
      </div>
    </>
  );
};
export default HoursCalculator;
