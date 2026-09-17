"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Crosshair } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

type GameKey = "csgo" | "valorant" | "overwatch";

const GAMES: Record<GameKey, { label: string; yaw: number }> = {
  csgo: { label: "CS:GO / CS2", yaw: 0.066 },
  valorant: { label: "Valorant", yaw: 0.07 },
  overwatch: { label: "Overwatch 2", yaw: 0.0066 },
};

interface EdpiResult {
  dpi: number;
  sensitivity: number;
  game: GameKey;
  yaw: number;
  edpi: number;
  in360: number;
  cm360: number;
  chartData: { name: string; value: number }[];
}

function calcEdpi(dpi: number, sensitivity: number, game: GameKey): EdpiResult {
  const yaw = GAMES[game].yaw;
  const edpi = dpi * sensitivity;
  const in360 = yaw > 0 ? 360 / (yaw * sensitivity * dpi) : 0;
  const cm360 = in360 * 2.54;
  const chartData = [
    { name: "DPI", value: dpi },
    { name: "eDPI", value: edpi },
  ];
  return { dpi, sensitivity, game, yaw, edpi, in360, cm360, chartData };
}

const DEFAULTS = { dpi: "800", sens: "1.5", game: "csgo" as GameKey };

const faqs = [
  { question: "What is eDPI?", answer: "Effective DPI multiplies your mouse's hardware DPI by the in-game sensitivity: eDPI = DPI × sensitivity. It is the true measure of aim speed — 800 DPI at 1.5 and 1600 DPI at 0.75 feel identical." },
  { question: "What is cm/360?", answer: "Centimeters of mouse movement for a full 360° turn. It is calculated from the game's yaw constant: cm/360 = 2.54 × 360 ÷ (yaw × sensitivity × DPI). Lower cm/360 means faster, twitchier aim." },
  { question: "Why does the game matter?", answer: "Each game scales sensitivity differently. CS:GO uses yaw 0.066 degrees per count, Valorant 0.07, Overwatch 0.0066 — so the same DPI and number give different actual turn speed in each game." },
];

export default function EdpiCalculator() {
  const [dpi, setDpi] = useState(DEFAULTS.dpi);
  const [sens, setSens] = useState(DEFAULTS.sens);
  const [game, setGame] = useState<GameKey>(DEFAULTS.game);
  const [result, setResult] = useState<EdpiResult>(() => calcEdpi(800, 1.5, "csgo"));

  useEffect(() => {
    const d = parseFloat(dpi);
    const s = parseFloat(sens);
    if (!isNaN(d) && !isNaN(s) && d > 0 && s > 0) setResult(calcEdpi(d, s, game));
  }, []);

  const reset = () => { setDpi(DEFAULTS.dpi); setSens(DEFAULTS.sens); setGame(DEFAULTS.game); setResult(calcEdpi(parseFloat(DEFAULTS.dpi), parseFloat(DEFAULTS.sens), DEFAULTS.game)); };
  const invalid = isNaN(parseFloat(dpi)) || isNaN(parseFloat(sens)) || parseFloat(dpi) <= 0 || parseFloat(sens) <= 0;

  const breakdown = [
    { label: "Mouse DPI", value: `${result.dpi.toLocaleString()}` },
    { label: "In-Game Sensitivity", value: `${result.sensitivity}` },
    { label: "Game", value: `${GAMES[result.game].label} (yaw ${result.yaw})` },
    { label: "eDPI (DPI × Sens)", value: `${result.edpi.toLocaleString()}`, highlight: true },
    { label: "cm / 360°", value: `${result.cm360.toFixed(2)} cm` },
    { label: "in / 360°", value: `${result.in360.toFixed(2)} in` },
    { label: "Aim Style", value: result.cm360 < 15 ? "Very fast / wrist aim" : result.cm360 < 30 ? "Fast / wrist-forearm" : result.cm360 < 45 ? "Medium / forearm" : "Slow / precision arm aim" },
  ];

  const summaryStats = [
    { label: "eDPI", value: `${result.edpi.toLocaleString()}` },
    { label: "cm/360", value: `${result.cm360.toFixed(2)} cm` },
    { label: "in/360", value: `${result.in360.toFixed(2)} in` },
    { label: "DPI", value: `${result.dpi.toLocaleString()}` },
    { label: "Sensitivity", value: `${result.sensitivity}` },
    { label: "Yaw", value: `${result.yaw}` },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "eDPI Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">eDPI Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="edpi-dpi" className="block text-sm font-medium mb-1 text-foreground">Mouse DPI</label>
                <input id="edpi-dpi" type="number" min="100" step="50" value={dpi} onChange={(e) => setDpi(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="edpi-sens" className="block text-sm font-medium mb-1 text-foreground">Sensitivity</label>
                <input id="edpi-sens" type="number" min="0.01" step="0.05" value={sens} onChange={(e) => setSens(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div>
              <label htmlFor="edpi-game" className="block text-sm font-medium mb-1 text-foreground">Game</label>
              <select id="edpi-game" value={game} onChange={(e) => setGame(e.target.value as GameKey)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20">
                {Object.entries(GAMES).map(([key, g]) => <option key={key} value={key}>{g.label}</option>)}
              </select>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Crosshair className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter positive DPI and sensitivity.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Effective DPI (eDPI)</div>
              <div className="text-4xl font-extrabold text-primary">{result.edpi.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground mt-1">{result.dpi.toLocaleString()} DPI × {result.sensitivity} sens · {result.cm360.toFixed(1)} cm/360</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">cm / 360°</div>
                <div className="text-lg font-bold text-primary">{result.cm360.toFixed(2)} cm</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">in / 360°</div>
                <div className="text-lg font-bold text-primary">{result.in360.toFixed(2)} in</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Game Yaw</div>
                <div className="text-lg font-bold text-primary">{result.yaw}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Metric</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdown.map((row) => (
                    <tr key={row.label} className={row.highlight ? "bg-primary/10 font-bold" : ""}>
                      <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">DPI vs Effective DPI</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v.toLocaleString()}`, ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={70} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {summaryStats.map((s) => (
                  <div key={s.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the eDPI Calculator</h2>
            <p>Hardware DPI and in-game sensitivity are just two factors of the same equation. eDPI = DPI × sensitivity collapses them into one number: 800 × 1.5 = 1200 is the same aim speed as 1600 × 0.75. When you change mouse DPI, divide sensitivity by the same factor to keep aim identical.</p>
            <h3>From eDPI to Physical Distance</h3>
            <p>The game's yaw constant converts mouse counts to degrees. In CS:GO (yaw 0.066), 800 DPI at 1.5 rotates the view 800 × 1.5 × 0.066 ≈ 79.2° per inch of mouse travel, so a full 360° turn needs 360 ÷ 79.2 ≈ 4.5 inches ≈ 11.5 cm — a fast, wrist-dominated sensitivity. Slower pros often sit near 30 cm/360.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/edpi-calculator" />
          <PopularCalculators exclude="/calculator/edpi-calculator" />
        </div>
      </div>
    </>
  );
}
