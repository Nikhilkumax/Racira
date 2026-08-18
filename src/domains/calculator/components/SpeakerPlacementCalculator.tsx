"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface PlacementInput {
  roomWidth: number;
  roomLength: number;
  listenerDistance: number;
  speakerType: "bookshelf" | "floorstanding";
}

interface PlacementResult {
  speakerSeparation: number;
  frontWallDistance: number;
  sideWallClearance: number;
  toeInAngle: number;
  tweeterHeight: number;
  chartData: { name: string; distance: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcPlacement(input: PlacementInput): PlacementResult {
  // Equilateral triangle rule: listener-to-speaker distance = speaker-to-speaker separation
  const speakerSeparation = Math.max(2, input.listenerDistance);
  const frontWallDistance = input.roomLength / 3;
  const sideWallClearance = Math.max(0.5, (input.roomWidth - speakerSeparation) / 2);
  const toeInAngle = Math.max(0, Math.min(30, Math.round((30 * 2) / Math.max(4, input.listenerDistance))));
  const tweeterHeight = input.speakerType === "floorstanding" ? 36 : 42; // inches, ear level

  const chartData = [
    { name: "Speaker Separation", distance: Number(speakerSeparation.toFixed(1)), fill: "hsl(var(--primary))" },
    { name: "Side Wall Clearance", distance: Number(sideWallClearance.toFixed(1)), fill: "#10b981" },
    { name: "Front Wall Distance", distance: Number(frontWallDistance.toFixed(1)), fill: "#f59e0b" },
  ];

  const breakdown = [
    { label: "Room Width", value: `${input.roomWidth.toFixed(1)} ft` },
    { label: "Room Length", value: `${input.roomLength.toFixed(1)} ft` },
    { label: "Listener Distance", value: `${input.listenerDistance.toFixed(1)} ft` },
    { label: "Speaker Type", value: input.speakerType === "floorstanding" ? "Floorstanding" : "Bookshelf" },
    { label: "Speaker Separation (equilateral)", value: `${speakerSeparation.toFixed(1)} ft` },
    { label: "Distance from Front Wall", value: `${frontWallDistance.toFixed(1)} ft` },
    { label: "Side Wall Clearance (each)", value: `${sideWallClearance.toFixed(1)} ft` },
    { label: "Recommended Toe-In", value: `${toeInAngle}°` },
    { label: "Tweeter Height", value: `${tweeterHeight} in` },
  ];

  const summaryStats = [
    { label: "Speaker Separation", value: `${speakerSeparation.toFixed(1)} ft` },
    { label: "Front Wall Distance", value: `${frontWallDistance.toFixed(1)} ft` },
    { label: "Side Clearance", value: `${sideWallClearance.toFixed(1)} ft` },
    { label: "Toe-In Angle", value: `${toeInAngle}°` },
    { label: "Tweeter Height", value: `${tweeterHeight} in` },
    { label: "Room Ratio", value: `${(input.roomLength / Math.max(1, input.roomWidth)).toFixed(2)}:1` },
  ];

  return { speakerSeparation, frontWallDistance, sideWallClearance, toeInAngle, tweeterHeight, chartData, breakdown, summaryStats };
}

const DEFAULTS: PlacementInput = { roomWidth: 12, roomLength: 16, listenerDistance: 8, speakerType: "bookshelf" };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function SpeakerPlacementCalculator() {
  const [width, setWidth] = useState(String(DEFAULTS.roomWidth));
  const [length, setLength] = useState(String(DEFAULTS.roomLength));
  const [distance, setDistance] = useState(String(DEFAULTS.listenerDistance));
  const [type, setType] = useState<PlacementInput["speakerType"]>(DEFAULTS.speakerType);
  const [result, setResult] = useState<PlacementResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcPlacement({ roomWidth: parse(width, DEFAULTS.roomWidth), roomLength: parse(length, DEFAULTS.roomLength), listenerDistance: parse(distance, DEFAULTS.listenerDistance), speakerType: type }));
  const reset = () => {
    setWidth(String(DEFAULTS.roomWidth));
    setLength(String(DEFAULTS.roomLength));
    setDistance(String(DEFAULTS.listenerDistance));
    setType(DEFAULTS.speakerType);
    setResult(calcPlacement(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcPlacement(DEFAULTS));
  }, []);

  const faqs = [
    { question: "What is the equilateral triangle rule?", answer: "The standard starting point for stereo imaging: the listening position and the two speakers should form an equilateral triangle. The distance from each speaker to your ears equals the distance between the speakers. For an 8 ft listening distance, speakers sit 8 ft apart." },
    { question: "How far should speakers be from the wall?", answer: "Start at one-third of the room length from the front wall. Rear-ported speakers need extra breathing room — at least 1–2 ft from the wall behind them — to avoid boomy, uncontrolled bass. Move them closer for more bass, farther for cleaner mids." },
    { question: "How much side-wall clearance do I need?", answer: "Keep speakers at least 1–2 ft from side walls to reduce early reflections that smear imaging. The calculation uses (room width − speaker separation) ÷ 2. If clearance comes out under 1 ft, consider narrower speaker placement or acoustic treatment on the side walls." },
    { question: "Should I toe speakers in?", answer: "Toe-in aims the tweeters at the listening position. Bookshelf speakers typically need more toe-in (15–30°); floorstanders with wide dispersion may sound better nearly straight ahead. Start at the angle this calculator suggests, then fine-tune by ear — imaging should sharpen without the center collapsing." },
    { question: "What height should speakers be?", answer: "Tweeters should sit at ear level when seated — about 36–42 inches depending on your seating. Bookshelf speakers usually need stands to reach this; floorstanders are engineered to place the tweeter near ear height. If tweeters sit higher, tilt the speakers down toward the listening position." },
    { question: "Does room shape matter?", answer: "Yes. Square rooms (1:1) create strong standing waves and bass nulls. Aim for a length-to-width ratio around 1.2–1.5:1 if you can choose the room. Avoid placing the listening position at the exact midpoint of the room length — that's where the worst bass cancellation occurs." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Speaker Placement Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Speaker Placement Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Room Width</label>
                <div className={inp}><input type="number" value={width} onChange={(e) => setWidth(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">ft</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Room Length</label>
                <div className={inp}><input type="number" value={length} onChange={(e) => setLength(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">ft</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Listener-to-Speaker Distance</label>
                <div className={inp}><input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">ft</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Speaker Type</label>
                <select value={type} onChange={(e) => setType(e.target.value as PlacementInput["speakerType"])} className="w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground">
                  <option value="bookshelf">Bookshelf</option>
                  <option value="floorstanding">Floorstanding</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Speaker Separation</div>
                  <div className="text-4xl font-extrabold tracking-tight">{result.speakerSeparation.toFixed(1)} ft</div>
                  <div className="text-sm text-muted-foreground mt-1">Equilateral triangle placement · Toe-in: {result.toeInAngle}° · Tweeter height: {result.tweeterHeight} in</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Front Wall", `${result.frontWallDistance.toFixed(1)} ft`], ["Side Clearance", `${result.sideWallClearance.toFixed(1)} ft`], ["Toe-In", `${result.toeInAngle}°`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Placement Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 4 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Key Distances (ft)</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [`${v.toFixed(1)} ft`, ""]} />
                      <Bar dataKey="distance" radius={[4, 4, 0, 0]}>
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
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Start with the Equilateral Triangle</h2>
            <p>Correct speaker placement is the single cheapest upgrade to any stereo system. The starting point is an equilateral triangle: your head and the two speakers form equal sides, with the speakers aimed at your ears. From there, distance from walls controls bass balance, and toe-in controls imaging precision.</p>
            <h2 className="text-2xl font-bold mb-3">Room Interaction</h2>
            <p>Walls act as bass reinforcement and early-reflection sources. Placing speakers one-third of the room length from the front wall provides a balanced starting point; rear-ported designs need additional clearance behind them. Side walls within a foot of a driver create strong early reflections that blur stereo separation — pull speakers inward or treat the reflection points.</p>
            <h2 className="text-2xl font-bold mb-3">Fine-Tuning by Ear</h2>
            <p>Use the numbers here as a starting grid, then move in small increments — a few inches at a time. Adjust toe-in until the center image is solid and vocals lock in place. If bass sounds boomy, move speakers farther from walls; if it's thin, move them closer. Trust your ears over any calculator once the starting point is established.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/speaker-placement-calculator" />
          <PopularCalculators exclude="/calculator/speaker-placement-calculator" />
        </div>
      </div>
    </>
  );
}
