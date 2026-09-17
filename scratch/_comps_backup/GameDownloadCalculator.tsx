"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Gamepad2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const SIZE_UNITS = [
  { id: "MB", label: "Megabytes (MB)", bytes: 1024 ** 2 },
  { id: "GB", label: "Gigabytes (GB)", bytes: 1024 ** 3 },
  { id: "TB", label: "Terabytes (TB)", bytes: 1024 ** 4 },
] as const;

const SPEED_UNITS = [
  { id: "Mbps", label: "Megabits/s (Mbps)", bps: 1000 ** 2 },
  { id: "Gbps", label: "Gigabits/s (Gbps)", bps: 1000 ** 3 },
] as const;

interface DownloadResult {
  gameSize: number;
  gameUnit: string;
  speed: number;
  speedUnit: string;
  readyToPlay: number;
  totalSeconds: number;
  fullSeconds: number;
  readySeconds: number;
  hours: number;
  minutes: number;
  seconds: number;
  chartData: { name: string; value: number }[];
}

function fmtDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function calcDownload(gameSize: number, gameUnitId: string, speed: number, speedUnitId: string, readyToPlay: number): DownloadResult {
  const su = SIZE_UNITS.find((u) => u.id === gameUnitId) ?? SIZE_UNITS[1];
  const sp = SPEED_UNITS.find((u) => u.id === speedUnitId) ?? SPEED_UNITS[0];
  const sizeInBytes = gameSize * su.bytes;
  const speedInBps = speed * sp.bps;
  const effectiveBps = speedInBps * 0.95; // ~5% network overhead
  const fullSeconds = (sizeInBytes * 8) / effectiveBps;
  const readySeconds = (sizeInBytes * 8 * (readyToPlay / 100)) / effectiveBps;
  const totalSeconds = fullSeconds;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const chartData = [
    { name: "Full", value: Number((fullSeconds / 60).toFixed(1)) },
    { name: "Playable", value: Number((readySeconds / 60).toFixed(1)) },
  ];
  return { gameSize, gameUnit: gameUnitId, speed, speedUnit: speedUnitId, readyToPlay, totalSeconds, fullSeconds, readySeconds, hours, minutes, seconds, chartData };
}

const DEFAULTS = { size: "80", sizeUnit: "GB", speed: "100", speedUnit: "Mbps", ready: "20" };

const faqs = [
  { question: "Why does my download take longer than the advertised speed suggests?", answer: "Advertised speeds are theoretical maximums. Real-world throughput loses 5–15% to TCP/IP overhead, Wi-Fi interference, and server-side limits. This calculator applies a 5% overhead to the connection speed." },
  { question: "Why is there a MB vs Mb confusion?", answer: "Megabytes (MB) measure file size; megabits (Mb) measure connection speed. There are 8 bits per byte, so a 100 Mbps connection downloads at most 12.5 MB/s. Note that storage uses 1024-based units while network speeds use 1000-based." },
  { question: "What is 'ready to play'?", answer: "Most platforms let you launch a game once a fraction (often 10–30%) has downloaded, then stream the rest in the background. This calculator shows the time until the playable threshold and the full download." },
];

export default function GameDownloadCalculator() {
  const [gameSize, setGameSize] = useState(DEFAULTS.size);
  const [gameUnit, setGameUnit] = useState(DEFAULTS.sizeUnit);
  const [speed, setSpeed] = useState(DEFAULTS.speed);
  const [speedUnit, setSpeedUnit] = useState(DEFAULTS.speedUnit);
  const [readyToPlay, setReadyToPlay] = useState(DEFAULTS.ready);
  const [result, setResult] = useState<DownloadResult>(() => calcDownload(80, "GB", 100, "Mbps", 20));

  const handleCalculate = () => {
    const gs = parseFloat(gameSize);
    const sp = parseFloat(speed);
    const rp = parseFloat(readyToPlay);
    if (isNaN(gs) || isNaN(sp) || isNaN(rp) || gs <= 0 || sp <= 0) return;
    setResult(calcDownload(gs, gameUnit, sp, speedUnit, rp));
  };

  const reset = () => {
    setGameSize(DEFAULTS.size); setGameUnit(DEFAULTS.sizeUnit);
    setSpeed(DEFAULTS.speed); setSpeedUnit(DEFAULTS.speedUnit);
    setReadyToPlay(DEFAULTS.ready);
    setResult(calcDownload(80, "GB", 100, "Mbps", 20));
  };

  const breakdown = [
    { label: "Game Size", value: `${result.gameSize} ${result.gameUnit}`, highlight: false },
    { label: "Connection Speed", value: `${result.speed} ${result.speedUnit} (5% overhead applied)`, highlight: false },
    { label: "Ready to Play at", value: `${result.readyToPlay}%`, highlight: false },
    { label: `Time to Playable (${result.readyToPlay}%)`, value: fmtDuration(result.readySeconds), highlight: true },
    { label: "Full Download Time", value: fmtDuration(result.fullSeconds), highlight: false },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Game Download Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Game Download Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <Gamepad2 className="w-4 h-4" /> Download Time Estimate
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1 block">Game Size</label>
                  <input type="number" value={gameSize} onChange={(e) => setGameSize(e.target.value)} className="input-calc" placeholder="80" min={0} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1 block">Unit</label>
                  <select value={gameUnit} onChange={(e) => setGameUnit(e.target.value)} className="input-calc">
                    {SIZE_UNITS.map((u) => (
                      <option key={u.id} value={u.id}>{u.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1 block">Download Speed</label>
                  <input type="number" value={speed} onChange={(e) => setSpeed(e.target.value)} className="input-calc" placeholder="100" min={0} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1 block">Speed Unit</label>
                  <select value={speedUnit} onChange={(e) => setSpeedUnit(e.target.value)} className="input-calc">
                    {SPEED_UNITS.map((u) => (
                      <option key={u.id} value={u.id}>{u.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Ready-to-Play Threshold (%)</label>
                <input type="number" value={readyToPlay} onChange={(e) => setReadyToPlay(e.target.value)} className="input-calc" placeholder="20" min={0} max={100} />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
              <button onClick={reset} className="px-4 py-2 rounded-lg border border-border hover:bg-secondary text-sm font-medium transition-colors">Reset</button>
            </div>
          </div>

          <div className="flex flex-col gap-4 min-w-0">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground mb-1">
                <Gamepad2 className="w-4 h-4 text-primary" /> TIME TO PLAY
              </div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-3xl md:text-4xl font-bold text-primary">{fmtDuration(result.readySeconds)}</span>
                <span className="text-sm text-muted-foreground">until {result.readyToPlay}% — ready to launch</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Full download completes in {fmtDuration(result.fullSeconds)} at {result.speed} {result.speedUnit}.
              </p>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Result Breakdown</h3>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Quantity</th>
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
              <h3 className="text-base font-bold mb-3">Download Time (minutes)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v.toFixed(1)} min`, ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {[
                  { label: "Effective Throughput", value: `${(result.speed * 0.95).toFixed(1)} ${result.speedUnit}` },
                  { label: "Max Transfer Rate", value: `${(result.speed * 0.95 / 8 / (result.speedUnit === "Mbps" ? 1e6 : 1e9) * (result.speedUnit === "Mbps" ? 1 : 1000)).toFixed(1)} MB/s` },
                  { label: "Data Transferred (full)", value: `${result.gameSize} ${result.gameUnit}` },
                  { label: "Overhead Loss", value: "5% of bandwidth" },
                ].map((s) => (
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
            <h2 className="text-2xl font-bold mb-3">About the Game Download Calculator</h2>
            <p>Modern games ship as tens of gigabytes, so download time is a real planning problem. The math: convert the game size to bytes (using 1024-based storage units), convert the connection speed to bits per second (using 1000-based network units), then divide. A 100 Mbps connection theoretically transfers 12.5 MB/s — with 5% overhead, an 80 GB game takes about 1 hour 53 minutes.</p>
            <h3>Playing before the download finishes</h3>
            <p>Steam, PlayStation, and Xbox let you launch most games once a small fraction is downloaded — often 10–30% — then stream the rest while you play the first section. The calculator reports both the playable threshold time and the full-download time, so you know whether to wait for coffee or start the campaign immediately.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/game-download-calculator" />
          <PopularCalculators exclude="/calculator/game-download-calculator" />
        </div>
      </div>
    </>
  );
}
