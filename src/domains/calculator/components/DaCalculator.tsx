"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { PieChart as RPie, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface DaResult {
  monthlyDa: number;
  annualDa: number;
  grossMonthly: number;
  daPctOfGross: number;
  arrears: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number }[];
}

const INR = (v: number) => `₹${v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function calcDa(basic: number, ratePct: number, arrearsMonths: number): DaResult {
  const monthlyDa = basic * (ratePct / 100);
  const annualDa = monthlyDa * 12;
  const grossMonthly = basic + monthlyDa;
  const daPctOfGross = grossMonthly > 0 ? (monthlyDa / grossMonthly) * 100 : 0;
  const arrears = monthlyDa * arrearsMonths;

  const breakdown = [
    { label: "Basic Pay", value: INR(basic) },
    { label: "DA Rate", value: `${ratePct}%` },
    { label: "Monthly DA", value: INR(monthlyDa) },
    { label: "Annual DA", value: INR(annualDa) },
    { label: "DA Arrears", value: `${arrearsMonths} months` },
    { label: "Arrears Amount", value: INR(arrears) },
    { label: "Gross Monthly Pay", value: INR(grossMonthly) },
    { label: "DA Share of Gross", value: `${daPctOfGross.toFixed(1)}%` },
  ];
  const summaryStats = [
    { label: "Monthly DA", value: INR(monthlyDa) },
    { label: "Annual DA", value: INR(annualDa) },
    { label: "Gross Monthly", value: INR(grossMonthly) },
    { label: "DA Rate", value: `${ratePct}%` },
    { label: "Arrears", value: `${arrearsMonths} months` },
    { label: "Arrears Amount", value: INR(arrears) },
    { label: "DA Share", value: `${daPctOfGross.toFixed(1)}%` },
    { label: "Basic Pay", value: INR(basic) },
  ];
  const chartData = [
    { name: "Basic Pay", value: basic },
    { name: "Monthly DA", value: monthlyDa },
  ];
  return { monthlyDa, annualDa, grossMonthly, daPctOfGross, arrears, breakdown, summaryStats, chartData };
}

const DEFAULTS = { basic: "45000", rate: "50", arrears: "6" };

export default function DaCalculator() {
  const [basic, setBasic] = useState(DEFAULTS.basic);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [arrears, setArrears] = useState(DEFAULTS.arrears);
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<DaResult | null>(null);

  const b = parseFloat(basic) || 0;
  const r = parseFloat(rate) || 0;
  const a = Math.max(0, parseInt(arrears) || 0);
  const errs: string[] = [];
  if (b <= 0) errs.push("Basic pay must be greater than 0.");
  if (r < 0 || r > 100) errs.push("DA rate must be between 0% and 100%.");
  if (a > 60) errs.push("Arrears months must be 60 or fewer.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcDa(b, r, a)); };
  const reset = () => {
    setBasic(DEFAULTS.basic); setRate(DEFAULTS.rate); setArrears(DEFAULTS.arrears);
    setResult(calcDa(45000, 50, 6));
  };
  useEffect(() => { setResult(calcDa(45000, 50, 6)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";
  const PIE_COLORS = ["hsl(var(--primary))", "#10b981"];

  const faqs = [
    { question: "What is Dearness Allowance (DA)?", answer: "DA is an allowance paid by the Indian government and public sector employers to offset the impact of inflation on the cost of living. It is calculated as a percentage of basic pay and revised periodically based on the All-India Consumer Price Index (CPI-IW)." },
    { question: "How is DA calculated?", answer: "Monthly DA = Basic Pay × DA Rate ÷ 100. For central government employees, the DA rate is set by the Department of Expenditure — it reached 50% of basic pay in January 2024, a milestone that also merged DA into basic pay for future calculations." },
    { question: "What is DA arrears?", answer: "Arrears are the accumulated DA difference for the months between the date a new DA rate took effect and the date it was actually paid. For example, six months of arrears equals six times your current monthly DA." },
    { question: "Is DA taxable?", answer: "Yes, DA is fully taxable as part of salary income. It also counts toward your basic pay for computing retirement benefits — Provident Fund contributions and gratuity are typically based on basic pay plus DA." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "DA Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">DA Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Basic Pay</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">₹</span><input type="number" value={basic} onChange={e => setBasic(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>DA Rate</label>
                <div className={inp}><input type="number" value={rate} onChange={e => setRate(e.target.value)} step="1" className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAdv(o => !o)}
              className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1 self-start"
            >
              Advanced Options
              <span className={`transition-transform ${showAdv ? "rotate-180" : ""}`}>▼</span>
            </button>
            {showAdv && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Arrears</div>
                  <div>
                    <label className={lbl}>Arrears Period</label>
                    <div className={inp}><input type="number" value={arrears} onChange={e => setArrears(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">months</span></div>
                  </div>
                </div>
              </div>
            )}
            {errs.length > 0 && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">{errs[0]}</div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} disabled={!valid} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${valid ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Monthly DA</div>
                <div className="text-4xl font-extrabold tracking-tight">{INR(result.monthlyDa)}</div>
                <div className="text-sm text-muted-foreground mt-1">{rate}% of basic · Gross monthly {INR(result.grossMonthly)}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Annual DA", INR(result.annualDa)], ["DA Rate", `${rate}%`], ["DA Share of Gross", `${result.daPctOfGross.toFixed(1)}%`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Allowance Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 2 ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 ${i === 2 ? "text-amber-700 font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 2 ? "text-amber-700" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Pay Composition</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <RPie>
                    <Pie data={result.chartData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {result.chartData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [INR(v), ""]} />
                  </RPie>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-2">
                  {result.chartData.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[i] }} />
                      <span className="text-muted-foreground">{d.name}</span>
                      <span className="font-semibold">{((d.value / (result.chartData[0].value + result.chartData[1].value)) * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is Dearness Allowance?</h2>
            <p>Dearness Allowance (DA) is an inflation-linked component of salary paid to Indian government employees, public sector workers, and pensioners. It is expressed as a percentage of basic pay and is revised every six months (January and July) based on the All-India Consumer Price Index for Industrial Workers (CPI-IW).</p>
            <h2 className="text-2xl font-bold mb-3">The Calculation</h2>
            <p>Monthly DA = Basic Pay × DA Rate ÷ 100. At the 50% rate effective January 2024, an employee with ₹45,000 basic pay receives ₹22,500 monthly DA — ₹2,70,000 annually. DA merges into basic pay when it crosses 50%, which then raises the base for future DA, HRA, and pension calculations.</p>
            <h2 className="text-2xl font-bold mb-3">DA Arrears</h2>
            <p>When the government announces a DA revision, the increase is often paid with arrears covering the months since the effective date. This calculator includes an arrears estimate so you can see the lump-sum you may receive with your next salary.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/da-calculator" />
          <PopularCalculators exclude="/calculator/da-calculator" />
        </div>
      </div>
    </>
  );
}
