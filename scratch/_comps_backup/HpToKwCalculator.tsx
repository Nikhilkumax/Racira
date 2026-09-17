"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface HpKwResult {
  hp: number;
  type: string;
  wattsPerHp: number;
  kw: number;
  ps: number;
  btuHr: number;
  ftLbS: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

const HP_WATTS: Record<string, number> = { mechanical: 745.699872, metric: 735.49875, electric: 746 };

function fmtKw(v: number): string {
  return `${v.toLocaleString("en-US", { maximumFractionDigits: 3 })} kW`;
}

function calcHpKw(hp: number, type: string): HpKwResult {
  const wattsPerHp = HP_WATTS[type];
  const kw = (hp * wattsPerHp) / 1000;
  const ps = (hp * wattsPerHp) / 735.49875;
  const btuHr = hp * wattsPerHp * 3.412141633;
  const ftLbS = hp * wattsPerHp * 0.737562149;

  const typeLabel = type === "mechanical" ? "Mechanical (imperial)" : type === "metric" ? "Metric (PS)" : "Electric";
  const breakdown = [
    { label: "Horsepower", value: `${hp} hp (${typeLabel})` },
    { label: "Watts per hp", value: `${wattsPerHp} W` },
    { label: "Kilowatts (kW)", value: fmtKw(kw) },
    { label: "Metric Horsepower (PS)", value: `${ps.toLocaleString("en-US", { maximumFractionDigits: 3 })} PS` },
    { label: "BTU per Hour", value: `${Math.round(btuHr).toLocaleString("en-US")} BTU/hr` },
    { label: "Foot-Pounds per Second", value: `${Math.round(ftLbS).toLocaleString("en-US")} ft·lb/s` },
    { label: "Megawatts (MW)", value: `${(kw / 1000).toFixed(4)} MW` },
    { label: "Conversion Factor", value: type === "mechanical" ? "1 hp = 0.7457 kW" : type === "metric" ? "1 PS = 0.7355 kW" : "1 hp = 0.746 kW" },
  ];
  const summaryStats = [
    { label: "Kilowatts", value: fmtKw(kw) },
    { label: "PS", value: `${ps.toFixed(2)}` },
    { label: "BTU/hr", value: `${Math.round(btuHr).toLocaleString()}` },
    { label: "ft·lb/s", value: `${Math.round(ftLbS).toLocaleString()}` },
    { label: "Horsepower", value: `${hp} hp` },
    { label: "Type", value: typeLabel },
    { label: "Watts", value: `${(kw * 1000).toLocaleString()} W` },
    { label: "MW", value: `${(kw / 1000).toFixed(4)}` },
  ];
  const chartData = [
    { name: "kW", value: Math.round(kw * 100) / 100, fill: "hsl(var(--primary))" },
    { name: "PS", value: Math.round(ps * 100) / 100, fill: "#8b5cf6" },
    { name: "BTU/hr", value: Math.round(btuHr / 100) / 100, fill: "#f59e0b" },
  ];
  return { hp, type, wattsPerHp, kw, ps, btuHr, ftLbS, breakdown, summaryStats, chartData };
}

const DEFAULTS = { hp: "250", type: "mechanical" };

export default function HpToKwCalculator() {
  const [hp, setHp] = useState(DEFAULTS.hp);
  const [type, setType] = useState(DEFAULTS.type);
  const [result, setResult] = useState<HpKwResult | null>(null);

  const h = parseFloat(hp) || 0;
  const errs: string[] = [];
  if (h <= 0) errs.push("Horsepower must be greater than 0.");
  if (h > 100000) errs.push("Horsepower looks unrealistic.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcHpKw(h, type)); };
  const reset = () => {
    setHp(DEFAULTS.hp); setType(DEFAULTS.type);
    setResult(calcHpKw(250, "mechanical"));
  };
  useEffect(() => { setResult(calcHpKw(250, "mechanical")); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "How many kilowatts is one horsepower?", answer: "One mechanical horsepower is exactly 745.699872 watts, so 1 hp ≈ 0.7457 kW. Metric horsepower (PS) is slightly smaller at 735.5 W." },
    { question: "Why are there different horsepower units?", answer: "James Watt defined the imperial unit from draft horses; Europe standardized the metric Pferdestärke (PS); and electric motors use a 746 W unit. They differ by only 1–2%." },
    { question: "How do I convert the other way?", answer: "Divide kilowatts by the same factor: kW ÷ 0.7457 gives mechanical horsepower. Electric vehicle outputs are usually quoted in kW directly." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Horsepower to Kilowatts Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Horsepower to Kilowatts Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Horsepower</label>
                <div className={inp}><input type="number" value={hp} onChange={e => setHp(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">hp</span></div>
              </div>
              <div>
                <label className={lbl}>Horsepower Type</label>
                <select value={type} onChange={e => setType(e.target.value)} className={sel}>
                  <option value="mechanical">Mechanical (imperial)</option>
                  <option value="metric">Metric (PS)</option>
                  <option value="electric">Electric</option>
                </select>
              </div>
            </div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Kilowatts</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmtKw(result.kw)}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.hp} hp × {result.wattsPerHp} W/hp</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Metric PS`, `${result.ps.toFixed(2)} PS`], ["BTU/hr", `${Math.round(result.btuHr).toLocaleString()}`], ["ft·lb/s", `${Math.round(result.ftLbS).toLocaleString()}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Power Conversion</h3>
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
                <h3 className="text-base font-bold mb-4">Same Power, Different Units</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: number) => [`${v}`, ""]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">BTU/hr scaled by 1/100 for display</p>
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
            <h2 className="text-2xl font-bold mb-3">Converting Horsepower to Kilowatts</h2>
            <p>This <strong>horsepower to kilowatts calculator</strong> converts using the exact definitions: mechanical hp at 745.699872 W, metric PS at 735.49875 W, and electric hp at 746 W. Multiply horsepower by the watts-per-unit and divide by 1,000 for kilowatts.</p>
            <h2 className="text-2xl font-bold mb-3">The Three Horsepower Standards</h2>
            <p>Imperial horsepower was calibrated against draft horses pulling a mill wheel; the metric Pferdestärke approximates the same idea with round metric numbers; and electric motors standardized on 746 W. The 1–2% differences matter when comparing spec sheets across regions.</p>
            <h2 className="text-2xl font-bold mb-3">Why kW Is Replacing hp</h2>
            <p>Kilowatts are the SI unit and appear on every electric vehicle, motor, and generator nameplate. The horsepower-to-kW conversion is becoming the one most buyers need as automotive marketing shifts to metric power figures.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/horsepower-to-kilowatts-calculator" />
          <PopularCalculators exclude="/calculator/horsepower-to-kilowatts-calculator" />
        </div>
      </div>
    </>
  );
}
