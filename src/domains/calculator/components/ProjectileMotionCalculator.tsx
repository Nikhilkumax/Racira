"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, ChevronDown, Printer } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function fmt(n: number, digits = 2): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(n);
}

const DEG = Math.PI / 180;

interface Inputs {
  velocity: string;
  angle: string;
  height: string;
  gravity: string;
}

interface Result {
  vx: number;
  vy: number;
  tApex: number;
  maxHeight: number;
  tFlight: number;
  range: number;
  impactSpeed: number;
  impactAngle: number;
  g: number;
  v0: number;
  theta: number;
  h0: number;
  trajectory: { x: number; y: number }[];
}

function calculate(i: Inputs): Result {
  const v0 = Math.max(0, parseFloat(i.velocity) || 0);
  const theta = Math.min(90, Math.max(0, parseFloat(i.angle) || 0));
  const h0 = Math.max(0, parseFloat(i.height) || 0);
  const g = Math.max(0.01, parseFloat(i.gravity) || 9.81);
  const vx = v0 * Math.cos(theta * DEG);
  const vy = v0 * Math.sin(theta * DEG);
  const tApex = vy / g;
  const maxHeight = h0 + (vy * vy) / (2 * g);
  const tFlight = (vy + Math.sqrt(vy * vy + 2 * g * h0)) / g;
  const range = vx * tFlight;
  const vyImpact = vy - g * tFlight;
  const impactSpeed = Math.sqrt(vx * vx + vyImpact * vyImpact);
  const impactAngle = -Math.atan(vyImpact / Math.max(1e-9, vx)) / DEG;
  const trajectory = Array.from({ length: 61 }, (_, i) => {
    const t = (tFlight * i) / 60;
    return { x: vx * t, y: Math.max(0, h0 + vy * t - 0.5 * g * t * t) };
  });
  return { vx, vy, tApex, maxHeight, tFlight, range, impactSpeed, impactAngle, g, v0, theta, h0, trajectory };
}

const DEFAULTS: Inputs = { velocity: "20", angle: "45", height: "0", gravity: "9.81" };

function validate(i: Inputs): string[] {
  const errors: string[] = [];
  const v = parseFloat(i.velocity);
  const a = parseFloat(i.angle);
  const h = parseFloat(i.height);
  const g = parseFloat(i.gravity);
  if (i.velocity.trim() === "" || isNaN(v)) errors.push("Enter a valid initial velocity.");
  else if (v < 0) errors.push("Initial velocity cannot be negative.");
  if (i.angle.trim() === "" || isNaN(a)) errors.push("Enter a valid launch angle.");
  else if (a < 0 || a > 90) errors.push("Launch angle must be between 0° and 90°.");
  if (i.height.trim() !== "" && (isNaN(h) || h < 0)) errors.push("Initial height must be zero or greater.");
  if (i.gravity.trim() !== "" && (isNaN(g) || g <= 0)) errors.push("Gravity must be greater than zero.");
  return errors;
}

export default function ProjectileMotionCalculator() {
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

  const faqs = [
    { question: "What is projectile motion?", answer: "Projectile motion is the curved path an object follows when launched with an initial velocity and then acted on only by gravity (and, in reality, air resistance). Horizontally the motion is constant-velocity; vertically it accelerates downward at g, which combines into a parabola." },
    { question: "Why is 45° the maximum range angle?", answer: "On level ground the range is R = v²sin(2θ)/g, which peaks when sin(2θ) = 1, i.e. θ = 45°. Launching steeper trades horizontal speed for extra airtime; launching shallower gives more speed but less time. Only at 45° is the trade-off optimal." },
    { question: "How is flight time computed from a height?", answer: "The object must climb, then fall from its apex to the ground. Total time is t = (v·sinθ + √((v·sinθ)² + 2gh₀))/g — the plus root of the quadratic h₀ + v·sinθ·t − ½gt² = 0, which is the moment it lands." },
    { question: "What is the impact speed?", answer: "Horizontal speed never changes (no air resistance), while vertical speed at impact is v·sinθ − gt. The impact speed is the vector sum of the two, and the impact angle is how steeply the object strikes the ground below horizontal." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Projectile Motion Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Projectile Motion Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Initial velocity (m/s)</label>
                <input type="number" min={0} step="any" value={inputs.velocity} onChange={e => set("velocity")(e.target.value)} className={inp} placeholder="20" />
              </div>
              <div>
                <label className={lbl}>Launch angle (°)</label>
                <input type="number" min={0} max={90} step="any" value={inputs.angle} onChange={e => set("angle")(e.target.value)} className={inp} placeholder="45" />
              </div>
            </div>
            <div>
              <label className={lbl}>Initial height (m)</label>
              <input type="number" min={0} step="any" value={inputs.height} onChange={e => set("height")(e.target.value)} className={inp} placeholder="0" />
            </div>
            <div>
              <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdv ? "rotate-180" : ""}`} />
              </button>
              {showAdv && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up !overflow-visible">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Environment</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-foreground mb-1">Gravity (m/s²)</label>
                        <input type="number" min={0.01} step="any" value={inputs.gravity} onChange={e => set("gravity")(e.target.value)} className={inp} placeholder="9.81" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-2">9.81 on Earth, 1.62 on the Moon, 3.71 on Mars.</p>
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
            <p className="text-xs text-muted-foreground leading-relaxed">Ignores air resistance — a standard ideal-projectile model from the launch point to first ground contact.</p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="flex justify-end absolute top-3 right-3">
                <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
              </div>
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Range</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{fmt(result.range)} m</div>
              <div className="text-sm text-muted-foreground font-medium">at {fmt(result.theta, 1)}° launch from {fmt(result.h0, 1)} m with v₀ = {fmt(result.v0, 1)} m/s</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Max Height</span>
                <span className="font-extrabold text-foreground">{fmt(result.maxHeight)} m</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Flight Time</span>
                <span className="font-extrabold text-foreground">{fmt(result.tFlight)} s</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Impact Speed</span>
                <span className="font-extrabold text-foreground">{fmt(result.impactSpeed)} m/s</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Impact Angle</span>
                <span className="font-extrabold text-foreground">{fmt(result.impactAngle, 1)}°</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Quantity</th>
                    <th className="p-2.5 pr-3 text-right w-[140px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors bg-amber-500/10">
                    <td className="p-2.5 pl-3 font-semibold text-amber-700">Range</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-amber-700">{fmt(result.range)} m</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Horizontal velocity (vₓ)</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{fmt(result.vx)} m/s</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Vertical velocity (vᵧ)</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{fmt(result.vy)} m/s</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Time to apex</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{fmt(result.tApex)} s</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Maximum height</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{fmt(result.maxHeight)} m</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Total flight time</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{fmt(result.tFlight)} s</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Impact speed</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{fmt(result.impactSpeed)} m/s</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Impact angle below horizontal</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{fmt(result.impactAngle, 1)}°</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Trajectory</h3>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={result.trajectory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="x" type="number" domain={[0, "dataMax"]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" label={{ value: "Horizontal distance (m)", position: "insideBottom", offset: -4, fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis type="number" domain={[0, "dataMax"]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" label={{ value: "Height (m)", angle: -90, position: "insideLeft", offset: 10, fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip formatter={(v: number, name: string) => [fmt(Number(v), 2), name === "y" ? "Height" : "Distance"]} labelFormatter={(l: number) => `x = ${fmt(l, 1)} m`} />
                  <Line type="monotone" dataKey="y" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-center text-sm text-muted-foreground mt-1">Ideal parabolic path from launch to landing, ignoring air resistance</p>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Projectile Summary</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                <div className="flex justify-between"><span className="text-muted-foreground">Range:</span><span className="font-semibold">{fmt(result.range)} m</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Max height:</span><span className="font-semibold">{fmt(result.maxHeight)} m</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Flight time:</span><span className="font-semibold">{fmt(result.tFlight)} s</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Impact speed:</span><span className="font-semibold">{fmt(result.impactSpeed)} m/s</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Impact angle:</span><span className="font-semibold">{fmt(result.impactAngle, 1)}°</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Horizontal velocity:</span><span className="font-semibold">{fmt(result.vx)} m/s</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Vertical velocity:</span><span className="font-semibold">{fmt(result.vy)} m/s</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Gravity:</span><span className="font-semibold">{fmt(result.g, 2)} m/s²</span></div>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">A Parabola from Two Simple Rules</h2>
            <p>A projectile's flight is a combination of two independent motions: constant horizontal velocity and constant vertical acceleration. This <strong>projectile motion calculator</strong> combines them into the classic parabolic path — computing where the object lands, how high it climbs, and how long it flies.</p>
            <h2 className="text-2xl font-bold mb-3">Velocity, Angle, and Height</h2>
            <p>The launch velocity splits into vₓ = v·cosθ and vᵧ = v·sinθ. Time to apex is vᵧ/g, maximum height adds vᵧ²/2g to the starting height, and flight time is the full solution of the vertical position equation. Range is simply horizontal speed times that total time.</p>
            <h2 className="text-2xl font-bold mb-3">Why 45 Degrees Is the Sweet Spot</h2>
            <p>On level ground, range follows v²sin(2θ)/g, which is largest at exactly 45°. The chart shows why: shallower launches have less airtime, steeper ones less horizontal speed. Adjusting gravity in Advanced Options lets you compare the same throw on Earth, the Moon, or Mars.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/projectile-motion-calculator" />
          <PopularCalculators exclude="/calculator/projectile-motion-calculator" />
        </div>
      </div>
    </>
  );
}
