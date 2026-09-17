"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface IdealWeightResult {
  inches: number;
  sex: string;
  devineKg: number;
  robinsonKg: number;
  millerKg: number;
  hamwiKg: number;
  averageKg: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function calcIdealWeight(inches: number, sex: string): IdealWeightResult {
  const over60 = inches - 60;
  let devineKg: number, robinsonKg: number, millerKg: number, hamwiKg: number;
  if (sex === "male") {
    devineKg = 50 + 2.3 * over60;
    robinsonKg = 52 + 1.9 * over60;
    millerKg = 56.2 + 1.41 * over60;
    hamwiKg = 48 + 2.7 * over60;
  } else {
    devineKg = 45.5 + 2.3 * over60;
    robinsonKg = 49 + 1.7 * over60;
    millerKg = 53.1 + 1.36 * over60;
    hamwiKg = 45.5 + 2.2 * over60;
  }
  const averageKg = (devineKg + robinsonKg + millerKg + hamwiKg) / 4;

  const fmtW = (kg: number): string => `${(kg * 2.20462).toFixed(1)} lb (${kg.toFixed(1)} kg)`;
  const breakdown = [
    { label: "Height", value: `${Math.floor(inches / 12)}′${inches % 12}″ (${Math.round(inches * 2.54)} cm)` },
    { label: "Sex", value: sex === "male" ? "Male" : "Female" },
    { label: "Devine (1974)", value: fmtW(devineKg) },
    { label: "Robinson (1983)", value: fmtW(robinsonKg) },
    { label: "Miller (1983)", value: fmtW(millerKg) },
    { label: "Hamwi (1964)", value: fmtW(hamwiKg) },
    { label: "Average of Formulas", value: fmtW(averageKg) },
    { label: "Method", value: "Devine / Robinson / Miller / Hamwi" },
  ];
  const summaryStats = [
    { label: "Devine", value: `${(devineKg * 2.20462).toFixed(1)} lb` },
    { label: "Robinson", value: `${(robinsonKg * 2.20462).toFixed(1)} lb` },
    { label: "Miller", value: `${(millerKg * 2.20462).toFixed(1)} lb` },
    { label: "Hamwi", value: `${(hamwiKg * 2.20462).toFixed(1)} lb` },
    { label: "Average", value: `${(averageKg * 2.20462).toFixed(1)} lb` },
    { label: "Height", value: `${Math.floor(inches / 12)}′${inches % 12}″` },
    { label: "Sex", value: sex === "male" ? "Male" : "Female" },
    { label: "Range", value: `${(Math.min(devineKg, robinsonKg, millerKg, hamwiKg) * 2.20462).toFixed(1)} – ${(Math.max(devineKg, robinsonKg, millerKg, hamwiKg) * 2.20462).toFixed(1)} lb` },
  ];
  const chartData = [
    { name: "Devine", value: Math.round(devineKg * 2.20462), fill: "hsl(var(--primary))" },
    { name: "Robinson", value: Math.round(robinsonKg * 2.20462), fill: "#8b5cf6" },
    { name: "Miller", value: Math.round(millerKg * 2.20462), fill: "#f59e0b" },
    { name: "Hamwi", value: Math.round(hamwiKg * 2.20462), fill: "#10b981" },
  ];
  return { inches, sex, devineKg, robinsonKg, millerKg, hamwiKg, averageKg, breakdown, summaryStats, chartData };
}

const DEFAULTS = { feet: "5", inches: "10", sex: "male" };

export default function IdealWeightCalculator() {
  const [feet, setFeet] = useState(DEFAULTS.feet);
  const [inches, setInches] = useState(DEFAULTS.inches);
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [result, setResult] = useState<IdealWeightResult | null>(null);

  const ft = parseInt(feet) || 0;
  const inch = parseInt(inches) || 0;
  const totalInches = ft * 12 + inch;
  const errs: string[] = [];
  if (ft < 3 || ft > 8) errs.push("Height (feet) must be between 3 and 8.");
  if (inch < 0 || inch > 11) errs.push("Height (inches) must be between 0 and 11.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcIdealWeight(totalInches, sex)); };
  const reset = () => {
    setFeet(DEFAULTS.feet); setInches(DEFAULTS.inches); setSex(DEFAULTS.sex);
    setResult(calcIdealWeight(70, "male"));
  };
  useEffect(() => { setResult(calcIdealWeight(70, "male")); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "Where do these formulas come from?", answer: "Devine (1974), Robinson (1983), Miller (1983), and Hamwi (1964) are classic height-based ideal weight formulas used in clinical dosing. They start from 100–112 lb at 5 ft and add 1.4–2.7 lb per inch above." },
    { question: "Why do they disagree?", answer: "Each uses a different base weight and per-inch coefficient, so results span a few pounds. The average is a reasonable compromise; the range shows the spread." },
    { question: "Are these better than BMI?", answer: "They are older and simpler than BMI and assume medium frame — none accounts for muscle mass. Use them as rough targets, with BMI ranges and body composition as the fuller picture." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Ideal Weight Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Ideal Weight Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Height (Feet)</label>
                <div className={inp}><input type="number" value={feet} onChange={e => setFeet(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">ft</span></div>
              </div>
              <div>
                <label className={lbl}>Height (Inches)</label>
                <div className={inp}><input type="number" value={inches} onChange={e => setInches(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">in</span></div>
              </div>
              <div>
                <label className={lbl}>Sex</label>
                <select value={sex} onChange={e => setSex(e.target.value)} className={sel}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Ideal Weight (Devine)</div>
                <div className="text-4xl font-extrabold tracking-tight">{(result.devineKg * 2.20462).toFixed(1)} lb</div>
                <div className="text-sm text-muted-foreground mt-1">{result.devineKg.toFixed(1)} kg · range {(Math.min(result.devineKg, result.robinsonKg, result.millerKg, result.hamwiKg) * 2.20462).toFixed(1)}–{(Math.max(result.devineKg, result.robinsonKg, result.millerKg, result.hamwiKg) * 2.20462).toFixed(1)} lb across formulas</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Robinson`, `${(result.robinsonKg * 2.20462).toFixed(1)} lb`], ["Miller", `${(result.millerKg * 2.20462).toFixed(1)} lb`], ["Hamwi", `${(result.hamwiKg * 2.20462).toFixed(1)} lb`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Formula Comparison</h3>
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
                <h3 className="text-base font-bold mb-4">Ideal Weight by Formula</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v} lb`} />
                    <Tooltip formatter={(v: number) => [`${v} lb`, ""]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
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
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Classic Ideal Weight Formulas</h2>
            <p>This <strong>ideal weight calculator</strong> applies the four classical height-based formulas — Devine, Robinson, Miller, and Hamwi. Each assumes a base weight at five feet (about 100–112 lb depending on sex) plus a per-inch coefficient, so the four answers cluster within a few pounds.</p>
            <h2 className="text-2xl font-bold mb-3">Clinical Origins</h2>
            <p>The Devine formula was developed to estimate gentamicin dosing weights and remains the default in most medical calculators. Robinson and Miller refined the coefficients, and Hamwi provides the simplest rule of thumb — all are still quoted in dosing references today.</p>
            <h2 className="text-2xl font-bold mb-3">Use with Judgment</h2>
            <p>None of these formulas accounts for frame size or muscle mass, so treat the result as one input among many. Combine with BMI range, body-fat measurement, and your own history rather than treating any single number as a target.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ideal-weight-calculator" />
          <PopularCalculators exclude="/calculator/ideal-weight-calculator" />
        </div>
      </div>
    </>
  );
}
