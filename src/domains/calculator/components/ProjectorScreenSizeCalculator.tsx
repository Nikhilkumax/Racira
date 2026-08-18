"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, ChevronDown, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const M_TO_IN = 39.3700787;

function fmt(n: number, digits = 1): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(n);
}

const ASPECTS = [
  { id: "16:9", label: "16:9 (widescreen HDTV)", w: 16, h: 9 },
  { id: "16:10", label: "16:10 (widescreen PC)", w: 16, h: 10 },
  { id: "4:3", label: "4:3 (standard)", w: 4, h: 3 },
  { id: "2.35:1", label: "2.35:1 (anamorphic cinema)", w: 2.35, h: 1 },
  { id: "1:1", label: "1:1 (square)", w: 1, h: 1 },
];

interface Inputs {
  distance: string;
  aspect: string;
  throwRatio: string;
  minRatio: string;
  maxRatio: string;
  seatFactor: string;
}

interface Result {
  widthIn: number;
  heightIn: number;
  diagonalIn: number;
  widthM: number;
  heightM: number;
  minDiag: number;
  maxDiag: number;
  seatingM: number;
  seatingFt: number;
  aspectLabel: string;
  throwRatio: number;
  distanceM: number;
}

function calculate(i: Inputs): Result {
  const distanceM = Math.max(0, parseFloat(i.distance) || 0);
  const aspect = ASPECTS.find(a => a.id === i.aspect) || ASPECTS[0];
  const throwRatio = Math.max(0.1, parseFloat(i.throwRatio) || 1.2);
  const minRatio = Math.max(0.1, parseFloat(i.minRatio) || 1.2);
  const maxRatio = Math.max(0.1, parseFloat(i.maxRatio) || 1.6);
  const seatFactor = Math.max(0.5, parseFloat(i.seatFactor) || 2);
  const widthM = distanceM / throwRatio;
  const heightM = widthM * (aspect.h / aspect.w);
  const widthIn = widthM * M_TO_IN;
  const heightIn = heightM * M_TO_IN;
  const diagonalIn = Math.sqrt(widthIn * widthIn + heightIn * heightIn);
  const minDiag = (distanceM / maxRatio) * M_TO_IN * Math.sqrt(1 + (aspect.h / aspect.w) ** 2);
  const maxDiag = (distanceM / minRatio) * M_TO_IN * Math.sqrt(1 + (aspect.h / aspect.w) ** 2);
  const seatingM = heightM * seatFactor;
  return { widthIn, heightIn, diagonalIn, widthM, heightM, minDiag, maxDiag, seatingM, seatingFt: seatingM * 3.280839895, aspectLabel: aspect.label, throwRatio, distanceM };
}

const DEFAULTS: Inputs = { distance: "3.5", aspect: "16:9", throwRatio: "1.2", minRatio: "1.2", maxRatio: "1.6", seatFactor: "2" };

function validate(i: Inputs): string[] {
  const errors: string[] = [];
  const d = parseFloat(i.distance);
  const tr = parseFloat(i.throwRatio);
  if (i.distance.trim() === "" || isNaN(d)) errors.push("Enter a valid throw distance.");
  else if (d <= 0) errors.push("Throw distance must be greater than zero.");
  if (i.throwRatio.trim() === "" || isNaN(tr) || tr <= 0) errors.push("Throw ratio must be greater than zero.");
  return errors;
}

export default function ProjectorScreenSizeCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));
  const [showAdv, setShowAdv] = useState(false);
  useEffect(() => { setResult(calculate(inputs)); }, []);

  const errors = validate(inputs);
  const valid = errors.length === 0;
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));
  const calc = () => { if (valid) setResult(calculate(inputs)); };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const chartData = [
    { name: "Width", value: result.widthIn, fill: "hsl(var(--primary))" },
    { name: "Height", value: result.heightIn, fill: "#f59e0b" },
    { name: "Diagonal", value: result.diagonalIn, fill: "#10b981" },
  ];

  const faqs = [
    { question: "What is a throw ratio?", answer: "The throw ratio is the projector's lens characteristic: throw distance divided by image width. A 1.2:1 lens needs 1.2 meters of distance per meter of screen width. Lower ratios mean shorter throw — the projector can sit closer to the screen for the same image size." },
    { question: "How big will my screen be?", answer: "Screen width = throw distance ÷ throw ratio, and height follows from the aspect ratio. A 3.5 m throw with a 1.2 ratio and 16:9 image yields a 2.92 m wide, 132-inch diagonal picture — a typical home-theater size." },
    { question: "What is the zoom range?", answer: "Most projector lenses zoom: at the wide end (smallest throw ratio) the image is largest, at the tele end (largest ratio) it is smallest. The calculator shows both extremes so you know the biggest and smallest images a given mount position can produce." },
    { question: "How far should seating be?", answer: "Industry guidance is 1.2–2.4 screen heights for full immersion, with 2.0× a good compromise for mixed 1080p and 4K content. Multiply your screen height by that factor to find the ideal viewing distance in the same units." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Projector Screen Size Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Projector Screen Size Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Throw distance (m)</label>
                <input type="number" min={0} step="any" value={inputs.distance} onChange={e => set("distance")(e.target.value)} className={inp} placeholder="3.5" />
              </div>
              <div>
                <label className={lbl}>Aspect ratio</label>
                <select value={inputs.aspect} onChange={e => set("aspect")(e.target.value)} className={inp}>
                  {ASPECTS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={lbl}>Throw ratio</label>
              <input type="number" min={0.1} step="any" value={inputs.throwRatio} onChange={e => set("throwRatio")(e.target.value)} className={inp} placeholder="1.2" />
            </div>
            <div>
              <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdv ? "rotate-180" : ""}`} />
              </button>
              {showAdv && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up !overflow-visible">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Zoom Range</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-foreground mb-1">Minimum throw ratio (wide)</label>
                        <input type="number" min={0.1} step="any" value={inputs.minRatio} onChange={e => set("minRatio")(e.target.value)} className={inp} placeholder="1.2" />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-foreground mb-1">Maximum throw ratio (tele)</label>
                        <input type="number" min={0.1} step="any" value={inputs.maxRatio} onChange={e => set("maxRatio")(e.target.value)} className={inp} placeholder="1.6" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Seating</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-foreground mb-1">Viewing distance (× screen height)</label>
                        <input type="number" min={0.5} step="any" value={inputs.seatFactor} onChange={e => set("seatFactor")(e.target.value)} className={inp} placeholder="2" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {!valid && (
              <div className="space-y-1">
                {errors.map((e, i) => <p key={i} className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">{e}</p>)}
              </div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calc} disabled={!valid} className="flex-1 rounded-md font-bold h-10 text-base transition-all shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed">Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">Throw distance ÷ throw ratio gives image width; the aspect ratio turns that into height and diagonal.</p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="flex justify-end absolute top-3 right-3">
                <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
              </div>
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Screen Diagonal</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{fmt(result.diagonalIn, 0)}″</div>
              <div className="text-sm text-muted-foreground font-medium">{fmt(result.widthIn, 1)}″ × {fmt(result.heightIn, 1)}″ · {result.aspectLabel} · {fmt(result.widthM, 2)} m wide</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Width</span>
                <span className="font-extrabold text-foreground">{fmt(result.widthIn, 1)}″</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Height</span>
                <span className="font-extrabold text-foreground">{fmt(result.heightIn, 1)}″</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Zoom Range</span>
                <span className="font-extrabold text-foreground">{fmt(result.minDiag, 0)}″–{fmt(result.maxDiag, 0)}″</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Seating</span>
                <span className="font-extrabold text-foreground">{fmt(result.seatingM, 1)} m</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Measurement</th>
                    <th className="p-2.5 pr-3 text-right w-[140px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors bg-amber-500/10">
                    <td className="p-2.5 pl-3 font-semibold text-amber-700">Diagonal</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-amber-700">{fmt(result.diagonalIn, 0)}″</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Width</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{fmt(result.widthIn, 1)}″ ({fmt(result.widthM, 2)} m)</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Height</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{fmt(result.heightIn, 1)}″ ({fmt(result.heightM, 2)} m)</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Throw distance</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{fmt(result.distanceM, 2)} m</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Throw ratio</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{fmt(result.throwRatio, 2)}:1</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Zoom range (diagonal)</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{fmt(result.minDiag, 0)}″–{fmt(result.maxDiag, 0)}″</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Recommended seating</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{fmt(result.seatingM, 1)} m ({fmt(result.seatingFt, 0)} ft)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Screen Dimensions</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v: number) => `${fmt(Number(v), 0)}″`} />
                  <Tooltip formatter={(v: number) => [`${fmt(Number(v), 1)}″`, ""]} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-center text-sm text-muted-foreground mt-1">Width and height from the aspect ratio; the diagonal is what projector specs quote</p>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Projection Summary</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                <div className="flex justify-between"><span className="text-muted-foreground">Diagonal:</span><span className="font-semibold">{fmt(result.diagonalIn, 0)}″</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Width:</span><span className="font-semibold">{fmt(result.widthIn, 1)}″</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Height:</span><span className="font-semibold">{fmt(result.heightIn, 1)}″</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Aspect ratio:</span><span className="font-semibold">{result.aspectLabel}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Throw distance:</span><span className="font-semibold">{fmt(result.distanceM, 2)} m</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Throw ratio:</span><span className="font-semibold">{fmt(result.throwRatio, 2)}:1</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Zoom range:</span><span className="font-semibold">{fmt(result.minDiag, 0)}″–{fmt(result.maxDiag, 0)}″</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Seating distance:</span><span className="font-semibold">{fmt(result.seatingM, 1)} m</span></div>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Distance and Lens Decide the Image</h2>
            <p>The size of a projected image is determined before you even turn the projector on: throw distance divided by the lens throw ratio gives the image width, and the aspect ratio fills in the height. This <strong>projector screen size calculator</strong> converts those numbers into the diagonal you actually shop by.</p>
            <h2 className="text-2xl font-bold mb-3">The Zoom Range Gives You Room</h2>
            <p>Most projectors zoom, so a fixed mount position still offers a range of image sizes. Enter the lens's minimum and maximum throw ratios and you'll see the smallest and largest diagonals available from that spot — essential before drilling mounting holes.</p>
            <h2 className="text-2xl font-bold mb-3">Sizing the Room Around the Screen</h2>
            <p>A good home theater places seating at 1.2 to 2.4 screen heights. The seating estimate closes the loop: from your chosen mount position, the calculator tells you both how big the image will be and where the best seats are.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/projector-screen-size-calculator" />
          <PopularCalculators exclude="/calculator/projector-screen-size-calculator" />
        </div>
      </div>
    </>
  );
}
