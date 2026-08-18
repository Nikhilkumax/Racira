"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface HpResult {
  torque: number;
  rpm: number;
  crankHp: number;
  lossPct: number;
  wheelHp: number;
  weightLb: number;
  hpPerTon: number;
  curve: { rpm: number; hp: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { rpm: number; hp: number }[];
}

function fmtHp(v: number): string {
  return `${v.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} hp`;
}

function calcHp(torque: number, rpm: number, lossPct: number, weightLb: number): HpResult {
  const crankHp = (torque * rpm) / 5252;
  const wheelHp = crankHp * (1 - lossPct / 100);
  const hpPerTon = weightLb > 0 ? (crankHp / (weightLb / 2000)) : 0;

  const curve: { rpm: number; hp: number }[] = [];
  for (let r = 1000; r <= 7000; r += 500) {
    curve.push({ rpm: r, hp: Math.round(((torque * r) / 5252) * 10) / 10 });
  }

  const breakdown = [
    { label: "Engine Torque", value: `${torque.toLocaleString()} lb-ft` },
    { label: "RPM at Peak Torque", value: `${rpm.toLocaleString()} rpm` },
    { label: "Crank Horsepower (HP = T×RPM÷5252)", value: fmtHp(crankHp) },
    { label: "Drivetrain Loss", value: `${lossPct}%` },
    { label: "Wheel Horsepower", value: fmtHp(wheelHp) },
    { label: "Power Lost to Drivetrain", value: `${(crankHp - wheelHp).toLocaleString("en-US", { maximumFractionDigits: 1 })} hp` },
    { label: "Vehicle Weight", value: `${weightLb.toLocaleString()} lb` },
    { label: "Power-to-Weight", value: `${hpPerTon.toFixed(1)} hp/ton` },
  ];
  const summaryStats = [
    { label: "Crank HP", value: fmtHp(crankHp) },
    { label: "Wheel HP", value: fmtHp(wheelHp) },
    { label: "Drivetrain Loss", value: `${lossPct}%` },
    { label: "Torque", value: `${torque.toLocaleString()} lb-ft` },
    { label: "RPM", value: `${rpm.toLocaleString()}` },
    { label: "Weight", value: `${weightLb.toLocaleString()} lb` },
    { label: "Power-to-Weight", value: `${hpPerTon.toFixed(1)} hp/ton` },
    { label: "Loss", value: `${(crankHp - wheelHp).toFixed(1)} hp` },
  ];
  return { torque, rpm, crankHp, lossPct, wheelHp, weightLb, hpPerTon, curve, breakdown, summaryStats, chartData: curve };
}

const DEFAULTS = { torque: "350", rpm: "4000", loss: "15", weight: "3500" };

export default function EngineHorsepowerCalculator() {
  const [torque, setTorque] = useState(DEFAULTS.torque);
  const [rpm, setRpm] = useState(DEFAULTS.rpm);
  const [loss, setLoss] = useState(DEFAULTS.loss);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<HpResult | null>(null);

  const tq = parseFloat(torque) || 0;
  const rp = parseFloat(rpm) || 0;
  const ls = parseFloat(loss) || 0;
  const wt = parseFloat(weight) || 0;
  const errs: string[] = [];
  if (tq <= 0) errs.push("Engine torque must be greater than 0.");
  if (rp < 500 || rp > 12000) errs.push("RPM must be between 500 and 12,000.");
  if (ls < 0 || ls > 50) errs.push("Drivetrain loss must be between 0% and 50%.");
  if (wt <= 0) errs.push("Vehicle weight must be greater than 0.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcHp(tq, rp, ls, wt)); };
  const reset = () => {
    setTorque(DEFAULTS.torque); setRpm(DEFAULTS.rpm); setLoss(DEFAULTS.loss); setWeight(DEFAULTS.weight);
    setResult(calcHp(350, 4000, 15, 3500));
  };
  useEffect(() => { setResult(calcHp(350, 4000, 15, 3500)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "Why is 5,252 in the horsepower formula?", answer: "Horsepower and torque are mathematically equal at 5,252 RPM by definition. HP = torque × RPM ÷ 5,252 converts rotational force at an engine speed into a power rate." },
    { question: "What is drivetrain loss?", answer: "Power is consumed by the transmission, driveshaft, differential, and tires before reaching the wheels. Manual and automatic cars typically lose 12–20%; the loss is higher for AWD and older automatics." },
    { question: "Dyno numbers: crank or wheel?", answer: "Manufacturers quote crank horsepower (engine output). Chassis dynamometers measure wheel horsepower, which is always lower. Adding back the estimated loss approximates the factory figure." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Engine Horsepower Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Engine Horsepower Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Engine Torque</label>
                <div className={inp}><input type="number" value={torque} onChange={e => setTorque(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">lb-ft</span></div>
              </div>
              <div>
                <label className={lbl}>RPM at Peak Torque</label>
                <div className={inp}><input type="number" value={rpm} onChange={e => setRpm(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">rpm</span></div>
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Drivetrain</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={lbl}>Drivetrain Loss</label>
                      <div className={inp}><input type="number" value={loss} onChange={e => setLoss(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
                    </div>
                    <div>
                      <label className={lbl}>Vehicle Weight</label>
                      <div className={inp}><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">lb</span></div>
                    </div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Crank Horsepower</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmtHp(result.crankHp)}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.torque.toLocaleString()} lb-ft @ {result.rpm.toLocaleString()} rpm · {result.wheelHp.toFixed(1)} hp at wheels</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Wheel Horsepower`, fmtHp(result.wheelHp)], ["Drivetrain Loss", `${result.lossPct}%`], ["Power-to-Weight", `${result.hpPerTon.toFixed(1)} hp/ton`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Horsepower Details</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 2 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 2 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 2 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Horsepower Curve (constant torque)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="rpm" tick={{ fontSize: 11 }} tickFormatter={v => `${v / 1000}k`} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v} hp`} />
                    <Tooltip formatter={(v: number) => [`${v} hp`, "Power"]} labelFormatter={(l: number) => `${l.toLocaleString()} rpm`} />
                    <Line type="monotone" dataKey="hp" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">HP rises linearly with RPM while torque stays constant</p>
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
            <h2 className="text-2xl font-bold mb-3">Horsepower from Torque</h2>
            <p>This <strong>engine horsepower calculator</strong> applies the standard dynamometer equation: HP = torque (lb-ft) × RPM ÷ 5,252. At 5,252 RPM the two curves cross by definition — torque and horsepower are numerically equal there, which is why the constant appears in every dyno formula.</p>
            <h2 className="text-2xl font-bold mb-3">Crank vs Wheel Power</h2>
            <p>Manufacturers rate engines at the crankshaft, before the transmission and differential consume energy. This calculator estimates wheel horsepower by subtracting a drivetrain loss percentage typical for the layout — roughly 10–15% for RWD manuals and 15–20% for AWD or automatic cars.</p>
            <h2 className="text-2xl font-bold mb-3">Reading the Curve</h2>
            <p>With constant torque, horsepower rises linearly with RPM. Real engines have a torque peak and a falling torque curve at high RPM, so the true power curve peaks and drops — the shape tells you where the engine likes to run for maximum acceleration.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/engine-horsepower-calculator" />
          <PopularCalculators exclude="/calculator/engine-horsepower-calculator" />
        </div>
      </div>
    </>
  );
}
