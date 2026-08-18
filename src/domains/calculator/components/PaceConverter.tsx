"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface PcResult {
  secPerKm: number;
  secPerMi: number;
  kmh: number;
  mph: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmtPace(sec: number): string {
  const total = Math.round(sec);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

function fmt(v: number, d = 2): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function calcPc(unit: string, value: number): PcResult {
  let secPerKm = 0;
  if (unit === "kmh") secPerKm = 3600 / value;
  else if (unit === "mph") secPerKm = 3600 / (value * 1.60934);
  else if (unit === "minmi") secPerKm = (value * 60) / 1.60934;
  else secPerKm = value * 60;
  const secPerMi = secPerKm * 1.60934;
  const kmh = 3600 / secPerKm;
  const mph = kmh / 1.60934;
  const breakdown = [
    { label: "Input", value: unit === "kmh" ? `${fmt(value)} km/h` : unit === "mph" ? `${fmt(value)} mph` : unit === "minmi" ? `${fmtPace(value * 60)} /mi` : `${fmtPace(value * 60)} /km` },
    { label: "Pace (per km)", value: `${fmtPace(secPerKm)} /km` },
    { label: "Pace (per mile)", value: `${fmtPace(secPerMi)} /mi` },
    { label: "Speed", value: `${fmt(kmh)} km/h` },
    { label: "Speed (mph)", value: `${fmt(mph)} mph` },
  ];
  const summaryStats = [
    { label: "Pace /km", value: `${fmtPace(secPerKm)}` },
    { label: "Pace /mi", value: `${fmtPace(secPerMi)}` },
    { label: "km/h", value: `${fmt(kmh)}` },
    { label: "mph", value: `${fmt(mph)}` },
  ];
  const chartData = [
    { name: "s/km", value: Number(secPerKm.toFixed(0)), fill: "hsl(var(--primary))" },
    { name: "s/mi", value: Number(secPerMi.toFixed(0)), fill: "#f59e0b" },
    { name: "km/h", value: Number(kmh.toFixed(1)), fill: "#10b981" },
  ];
  return { secPerKm, secPerMi, kmh, mph, breakdown, summaryStats, chartData };
}

const DEFAULTS = { unit: "minkm", value: "4:30" };

function parsePace(s: string): number | null {
  const parts = s.trim().split(":").map(Number);
  if (parts.some((v) => isNaN(v)) || parts.length > 2) return null;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] * 60;
}

export default function PaceConverter() {
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [value, setValue] = useState(DEFAULTS.value);
  const [result, setResult] = useState<PcResult | null>(null);

  let v = parseFloat(value);
  if (unit === "minkm" || unit === "minmi") {
    const parsed = parsePace(value);
    v = parsed ?? NaN;
  }
  const errs: string[] = [];
  if (isNaN(v) || v <= 0) errs.push("Enter a valid pace (e.g. 4:30) or speed (e.g. 13.3).");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcPc(unit, v)); };
  const reset = () => {
    setUnit(DEFAULTS.unit); setValue(DEFAULTS.value);
    setResult(calcPc("minkm", 270));
  };
  const changeUnit = (u: string) => {
    setUnit(u);
    const defs: Record<string, string> = { minkm: "4:30", minmi: "7:15", kmh: "13.3", mph: "8.3" };
    setValue(defs[u]);
    const nv = u === "minkm" || u === "minmi" ? parsePace(defs[u])! : parseFloat(defs[u]);
    setResult(calcPc(u, nv));
  };
  useEffect(() => { setResult(calcPc("minkm", 270)); }, []);

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What pace units are supported?", answer: "Minutes per kilometer, minutes per mile, km/h, and mph — the four ways runners and cyclists quote pace. Enter any one and the converter returns all four." },
    { question: "How are paces converted?", answer: "A mile is 1.60934 km, so pace per mile = pace per km × 1.60934, and speed = 3600 ÷ seconds-per-km. 4:30/km becomes 7:14/mi and 13.3 km/h — the same effort in different units." },
    { question: "Which unit should I use?", answer: "Use what your training plans and races use — kilometers and minutes/km in most of the world, miles and minutes/mi in the US and UK. Speed in km/h or mph suits cyclists and treadmills." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Pace Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Pace Converter</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className={lbl}>Unit</label>
              <select value={unit} onChange={e => changeUnit(e.target.value)} className={inp}>
                <option value="minkm">Minutes per km</option>
                <option value="minmi">Minutes per mile</option>
                <option value="kmh">km/h</option>
                <option value="mph">mph</option>
              </select>
            </div>
            <div>
              <label className={lbl}>Value</label>
              <input type="text" value={value} onChange={e => setValue(e.target.value)} className={inp} placeholder="4:30" />
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Equivalent Pace</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmtPace(result.secPerKm)} /km</div>
                <div className="text-sm text-muted-foreground mt-1">{fmtPace(result.secPerMi)} /mi · {fmt(result.kmh)} km/h · {fmt(result.mph)} mph</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["/mi", `${fmtPace(result.secPerMi)}`], ["km/h", `${fmt(result.kmh)}`], ["mph", `${fmt(result.mph)}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Conversion Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 1 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 1 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 1 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">The Same Effort, Four Units</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [fmt(v), ""]} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Seconds per unit fall as speed rises — the reciprocal view</p>
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
            <h2 className="text-2xl font-bold mb-3">One Pace, Every Unit</h2>
            <p>A 4:30/km runner in Berlin and a 7:15/mi runner in Boston are moving at the same speed — they just quote it differently. This <strong>pace converter</strong> translates between minutes/km, minutes/mile, km/h, and mph in one step.</p>
            <h2 className="text-2xl font-bold mb-3">The Conversion Math</h2>
            <p>Since a mile equals 1.60934 km, per-mile pace is per-km pace scaled by that factor, and speed is 3600 divided by the seconds-per-km figure. The converter works in every direction: enter a pace, get a speed; enter a speed, get both paces.</p>
            <h2 className="text-2xl font-bold mb-3">Speaking Everyone's Language</h2>
            <p>Race calculators, training plans, and treadmill displays each pick their own units. Convert before the race, not during it — and when a pace feels unfamiliar, the converter is the fastest way to know whether it is easy, steady, or a PR attempt.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/pace-converter" />
          <PopularCalculators exclude="/calculator/pace-converter" />
        </div>
      </div>
    </>
  );
}
