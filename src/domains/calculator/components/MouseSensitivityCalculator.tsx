"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface MsResult {
  edpi: number;
  inches360: number;
  cm360: number;
  yaw: number;
  dpi: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmt(v: number, d = 2): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function calcMs(dpi: number, sens: number, yaw: number): MsResult {
  const edpi = dpi * sens;
  const inches360 = yaw > 0 ? 360 / (sens * dpi * yaw) : Infinity;
  const cm360 = inches360 === Infinity ? Infinity : inches360 * 2.54;
  const breakdown = [
    { label: "Mouse DPI", value: `${fmt(dpi, 0)} DPI` },
    { label: "In-Game Sensitivity", value: `${fmt(sens, 3)}` },
    { label: "Game Yaw Constant", value: `${fmt(yaw, 4)}` },
    { label: "eDPI (DPI × Sensitivity)", value: `${fmt(edpi, 0)}` },
    { label: "360° Turn Distance", value: cm360 === Infinity ? "— (yaw is zero)" : `${fmt(inches360, 2)} in / ${fmt(cm360, 2)} cm` },
    { label: "Distance per Pixel", value: cm360 === Infinity ? "—" : `${fmt((inches360 / 360) * 2.54, 4)} cm` },
  ];
  const summaryStats = [
    { label: "eDPI", value: `${fmt(edpi, 0)}` },
    { label: "cm/360°", value: cm360 === Infinity ? "—" : `${fmt(cm360, 2)} cm` },
    { label: "in/360°", value: cm360 === Infinity ? "—" : `${fmt(inches360, 2)} in` },
    { label: "DPI", value: `${fmt(dpi, 0)}` },
  ];
  const chartData = [
    { name: "eDPI", value: Number(edpi.toFixed(0)), fill: "hsl(var(--primary))" },
    { name: "cm/360°", value: cm360 === Infinity ? 0 : Number(cm360.toFixed(1)), fill: "#f59e0b" },
    { name: "DPI", value: Number(dpi.toFixed(0)), fill: "#10b981" },
  ];
  return { edpi, inches360, cm360, yaw, dpi, breakdown, summaryStats, chartData };
}

const DEFAULTS = { dpi: "800", sens: "1.2", yaw: "0.022" };

export default function MouseSensitivityCalculator() {
  const [dpi, setDpi] = useState(DEFAULTS.dpi);
  const [sens, setSens] = useState(DEFAULTS.sens);
  const [yaw, setYaw] = useState(DEFAULTS.yaw);
  const [result, setResult] = useState<MsResult | null>(null);

  const d = parseFloat(dpi);
  const s = parseFloat(sens);
  const y = parseFloat(yaw);
  const errs: string[] = [];
  if (!d || d <= 0) errs.push("DPI must be greater than 0.");
  if (!s || s <= 0) errs.push("Sensitivity must be greater than 0.");
  if (isNaN(y) || y < 0) errs.push("Yaw constant must be 0 or greater.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcMs(d, s, y)); };
  const reset = () => {
    setDpi(DEFAULTS.dpi); setSens(DEFAULTS.sens); setYaw(DEFAULTS.yaw);
    setResult(calcMs(800, 1.2, 0.022));
  };
  useEffect(() => { setResult(calcMs(800, 1.2, 0.022)); }, []);

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const presets = [
    { label: "CS:GO / CS2", y: "0.022" },
    { label: "Valorant", y: "0.07" },
    { label: "Apex Legends", y: "0.022" },
    { label: "Fortnite", y: "0.022" },
    { label: "Overwatch", y: "0.0066" },
  ];

  const faqs = [
    { question: "What is eDPI?", answer: "Effective DPI — the product of your mouse DPI and in-game sensitivity. It is the true measure of aim speed because it is independent of the mouse's hardware resolution: 800 DPI × 1.2 = 1600 eDPI, same as 1600 DPI × 1.0." },
    { question: "What is cm/360?", answer: "The physical distance — in centimeters — you must move the mouse to turn 360° in game. It converts sensitivity into muscle memory: players aiming with their arm prefer 30–60 cm/360; wrist aimers often use 15–30. The formula uses the game's yaw constant, the degrees of turn per mouse count." },
    { question: "Which yaw constant should I use?", answer: "It depends on the game engine. CS:GO/CS2 and Apex use ~0.022, Valorant ~0.07, Overwatch ~0.0066. Using the wrong one makes the cm/360 figure wrong even though eDPI is unaffected. The presets cover the common titles." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Technology", href: "/calculator#technology" }, { label: "Mouse Sensitivity Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Mouse Sensitivity Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className={lbl}>Game Preset (yaw)</label>
              <div className="flex flex-wrap gap-2">
                {presets.map((p) => (
                  <button key={p.label} onClick={() => setYaw(p.y)} className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${yaw === p.y ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-accent"}`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={lbl}>Mouse DPI</label>
                <input type="number" value={dpi} onChange={e => setDpi(e.target.value)} className={inp} placeholder="800" />
              </div>
              <div>
                <label className={lbl}>Sensitivity</label>
                <input type="number" step="0.01" value={sens} onChange={e => setSens(e.target.value)} className={inp} placeholder="1.2" />
              </div>
              <div>
                <label className={lbl}>Yaw Constant</label>
                <input type="number" step="0.001" value={yaw} onChange={e => setYaw(e.target.value)} className={inp} placeholder="0.022" />
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Effective DPI (eDPI)</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt(result.edpi, 0)}</div>
                <div className="text-sm text-muted-foreground mt-1">360° turn: {result.cm360 === Infinity ? "—" : `${fmt(result.inches360, 2)} in / ${fmt(result.cm360, 2)} cm`}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["eDPI", `${fmt(result.edpi, 0)}`], ["cm/360°", result.cm360 === Infinity ? "—" : `${fmt(result.cm360, 2)} cm`], ["DPI", `${fmt(result.dpi, 0)}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Calculation Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 3 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 3 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 3 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Sensitivity Profile</h3>
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
                <p className="text-center text-sm text-muted-foreground mt-1">Higher eDPI = faster turning; higher cm/360 = slower, finer control</p>
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
            <h2 className="text-2xl font-bold mb-3">Two Numbers That Define Your Aim</h2>
            <p>Mouse DPI is hardware; in-game sensitivity is software. Their product — <strong>eDPI</strong> — is the number that actually describes how fast your crosshair moves. This <strong>mouse sensitivity calculator</strong> computes it along with the physical distance for a full 360° turn.</p>
            <h2 className="text-2xl font-bold mb-3">From eDPI to Muscle Memory</h2>
            <p>The yaw constant is how many degrees of turn each mouse count produces in a given engine. cm/360 = 360 ÷ (DPI × sensitivity × yaw) × 2.54 converts the whole setup into centimeters on your desk — the unit your arm actually remembers.</p>
            <h2 className="text-2xl font-bold mb-3">Tuning Your Setup</h2>
            <p>Competitive shooters cluster around 1600–3200 eDPI for wrist aimers and 800–1600 for arm aimers, with cm/360 roughly 20–50. If you switch mice or games, matching eDPI (not raw sensitivity) keeps your aim transferable — that is what makes this calculation useful.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/mouse-sensitivity-calculator" />
          <PopularCalculators exclude="/calculator/mouse-sensitivity-calculator" />
        </div>
      </div>
    </>
  );
}
