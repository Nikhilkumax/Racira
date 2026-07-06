"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const SpeedDistanceTimeCalculator = () => {
  const DEFAULTS = { distance: "150", time: "2", mode: "speed" };
  const [distance, setDistance] = useState(DEFAULTS.distance);
  const [time, setTime] = useState(DEFAULTS.time);
  const [speed, setSpeed] = useState("75");
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [distUnit, setDistUnit] = useState("km");
  const [result, setResult] = useState<any>(null);

  const calculate = (dV = distance, tV = time, sV = speed, mV = mode, du = distUnit) => {
    const d = parseFloat(dV), t = parseFloat(tV), s = parseFloat(sV);
    let calcSpeed = s, calcDist = d, calcTime = t;
    if (mV === "speed") {
      if (isNaN(d) || isNaN(t) || t === 0) return;
      calcSpeed = d / t;
    } else if (mV === "distance") {
      if (isNaN(s) || isNaN(t)) return;
      calcDist = s * t;
    } else {
      if (isNaN(d) || isNaN(s) || s === 0) return;
      calcTime = d / s;
    }
    const mph = du === "km" ? calcSpeed * 0.621371 : calcSpeed;
    const kph = du === "km" ? calcSpeed : calcSpeed * 1.60934;
    const mps = kph / 3.6;
    const hh = Math.floor(calcTime);
    const mm = Math.round((calcTime - hh) * 60);
    const chartData = [1, 2, 3, 4, 5].map(i => ({
      name: `${i}h`, value: parseFloat((calcSpeed * i).toFixed(2)),
    }));
    setResult({
      primary: mV === "speed" ? `${calcSpeed.toFixed(2)} ${du}/h`
        : mV === "distance" ? `${calcDist.toFixed(2)} ${du}`
        : `${hh}h ${mm}m`,
      subtitle: `Speed: ${calcSpeed.toFixed(2)} ${du}/h | Distance: ${calcDist.toFixed(2)} ${du} | Time: ${hh}h ${mm}m`,
      rows: [
        { label: "Speed", value: `${calcSpeed.toFixed(4)} ${du}/h` },
        { label: "Distance", value: `${calcDist.toFixed(4)} ${du}` },
        { label: "Time", value: `${hh}h ${mm}m (${calcTime.toFixed(4)} hrs)` },
        { label: du === "km" ? "Speed in mph" : "Speed in km/h", value: `${(du === "km" ? mph : kph).toFixed(2)} ${du === "km" ? "mph" : "km/h"}` },
        { label: "Speed in m/s", value: `${mps.toFixed(4)} m/s` },
        { label: "Distance in 5 hours", value: `${(calcSpeed * 5).toFixed(2)} ${du}` },
      ],
      chartData,
      summary: [
        { label: "Speed", value: `${calcSpeed.toFixed(2)} ${du}/h` },
        { label: "Distance", value: `${calcDist.toFixed(2)} ${du}` },
        { label: "Time", value: `${hh}h ${mm}m` },
        { label: du === "km" ? "In mph" : "In km/h", value: `${(du === "km" ? mph : kph).toFixed(2)}`, border: true, bold: true },
      ],
    });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => { setDistance(DEFAULTS.distance); setTime(DEFAULTS.time); setSpeed("75"); setMode(DEFAULTS.mode); calculate(DEFAULTS.distance, DEFAULTS.time, "75", DEFAULTS.mode, distUnit); };

  const faqs = [
    { question: "What is the speed distance time formula?", answer: "Speed = Distance / Time. Distance = Speed × Time. Time = Distance / Speed. Use consistent units throughout — if speed is km/h, distance must be in km and time in hours." },
    { question: "How do I convert km/h to mph?", answer: "Multiply km/h by 0.621371 to get mph. Or divide mph by 0.621371 to get km/h. Example: 100 km/h × 0.621371 = 62.14 mph." },
    { question: "How do I convert km/h to m/s?", answer: "Divide km/h by 3.6. Example: 90 km/h ÷ 3.6 = 25 m/s. To convert m/s to km/h, multiply by 3.6." },
    { question: "What is average speed?", answer: "Average speed = Total Distance / Total Time. Note that this differs from the average of two speeds — if you drive 60 km/h for 1 hour then 120 km/h for 1 hour, average speed = 180 km / 2 hrs = 90 km/h, which equals the arithmetic mean here but won't always." },
    { question: "If I drive at 150 km and it takes 2 hours, what is my speed?", answer: "Speed = 150 km / 2 h = 75 km/h — exactly the pre-filled example in this calculator." },
    { question: "How do I calculate travel time for a road trip?", answer: "Time = Distance / Speed. For 600 km at 100 km/h: 600/100 = 6 hours. Add buffer for stops, traffic, and rest — typically 10–20% extra time for real road trips." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Speed Distance Time Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Speed Distance Time Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px]">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Solve For</label>
              <div className="grid grid-cols-3 gap-2">
                {[["speed", "Speed"], ["distance", "Distance"], ["time", "Time"]].map(([v, l]) => (
                  <button key={v} onClick={() => setMode(v)}
                    className={`h-10 rounded-md border text-sm font-medium transition-colors ${mode === v ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Units</label>
              <div className="flex gap-2">
                {[["km", "Kilometres"], ["mi", "Miles"]].map(([v, l]) => (
                  <button key={v} onClick={() => { setDistUnit(v); calculate(distance, time, speed, mode, v); }}
                    className={`flex-1 h-10 rounded-md border text-sm font-medium transition-colors ${distUnit === v ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            {mode !== "speed" && (
              <div>
                <label className="text-base font-medium block mb-1.5">Speed ({distUnit}/h)</label>
                <div className="relative">
                  <input type="number" value={speed} onChange={e => setSpeed(e.target.value)}
                    className="h-10 w-full pl-3 pr-16 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="75" step="any" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{distUnit}/h</span>
                </div>
              </div>
            )}
            {mode !== "distance" && (
              <div>
                <label className="text-base font-medium block mb-1.5">Distance ({distUnit})</label>
                <div className="relative">
                  <input type="number" value={distance} onChange={e => setDistance(e.target.value)}
                    className="h-10 w-full pl-3 pr-12 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="150" step="any" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{distUnit}</span>
                </div>
              </div>
            )}
            {mode !== "time" && (
              <div>
                <label className="text-base font-medium block mb-1.5">Time (hours)</label>
                <div className="relative">
                  <input type="number" value={time} onChange={e => setTime(e.target.value)}
                    className="h-10 w-full pl-3 pr-12 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="2" step="any" min="0" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">hrs</span>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => calculate()} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">Calculate</button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">{mode === "speed" ? "Speed" : mode === "distance" ? "Distance" : "Time"}</div>
                <div className="text-4xl font-bold text-primary">{result.primary}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.subtitle}</div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.rows?.map((r: any, i: number) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              {result.chartData && (
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-semibold mb-3">Distance Covered Per Hour</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: any) => [`${v} ${distUnit}`, "Distance"]} />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-base font-semibold mb-4">Summary</h3>
                <div className="space-y-3">
                  {result.summary?.map((s: any, i: number) => (
                    <div key={i} className={`flex justify-between text-base ${s.border ? "border-t pt-3" : ""}`}>
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className={`font-medium ${s.bold ? "font-bold text-primary" : ""}`}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Speed Distance Time Calculator?</h2>
            <p>A speed distance time calculator solves for any one of the three variables — speed, distance, or time — given the other two. Based on the fundamental kinematic relationship Speed = Distance ÷ Time, this calculator handles both metric (km) and imperial (miles) units and includes automatic unit conversions between km/h, mph, and m/s. Pre-filled with 150 km over 2 hours, it instantly shows the speed is 75 km/h (46.6 mph) and projects the distance covered at each hour mark.</p>
            <p>This tool is used by drivers planning road trips, runners tracking pace, cyclists computing split times, students solving physics problems, and pilots calculating flight time estimates. The three-mode toggle means you never need to rearrange the formula manually.</p>
            <h2 className="text-2xl font-bold mb-3">The Speed Distance Time Formula</h2>
            <p><strong>Speed = Distance / Time</strong> | <strong>Distance = Speed × Time</strong> | <strong>Time = Distance / Speed</strong></p>
            <p>All three are derived from the same relationship. Key rule: units must be consistent throughout. If speed is km/h, distance must be in km and time in hours. Mixing units (e.g., speed in mph, distance in km) produces incorrect results. This calculator handles the conversion automatically when you switch unit modes.</p>
            <h2 className="text-2xl font-bold mb-3">Unit Conversions</h2>
            <p><strong>km/h to mph:</strong> multiply by 0.621371. <strong>mph to km/h:</strong> multiply by 1.60934. <strong>km/h to m/s:</strong> divide by 3.6. <strong>m/s to km/h:</strong> multiply by 3.6. Common benchmarks: 100 km/h = 62.14 mph. 60 mph = 96.56 km/h. 30 m/s = 108 km/h. The speed of light: 299,792 km/s = 1,079,252,848 km/h.</p>
            <h2 className="text-2xl font-bold mb-3">Road Trip Planning</h2>
            <p>For 600 km at 100 km/h: Time = 600/100 = 6 hours driving. Real-world road trips add 20–30% buffer for rest stops, fuel, traffic, and detours — so plan for 7–8 hours. For interstate driving at 65 mph (104.6 km/h): 400 miles takes approximately 6.15 hours (6h 9m). The bar chart in this calculator shows cumulative distance at each hour mark, making it easy to plan rest stop timing.</p>
            <h2 className="text-2xl font-bold mb-3">Average vs Instantaneous Speed</h2>
            <p>This calculator computes average speed (total distance ÷ total time). Instantaneous speed is what your speedometer shows at any given moment. For a non-uniform journey where you accelerate, brake, and cruise, average speed will differ from the average of your instantaneous speeds. Example: driving 30 km/h for 1 hour then 90 km/h for 1 hour: average speed = 120 km / 2 h = 60 km/h — not the arithmetic mean of (30+90)/2 = 60 km/h (happens to be equal here but not always).</p>
            <h2 className="text-2xl font-bold mb-3">Physics Applications</h2>
            <p>In kinematics, this is the simplest motion formula — applicable to uniform (constant speed) motion. For accelerating objects, use the kinematic equations with the <a href="/calculator/acceleration-calculator">acceleration calculator</a>. For wave motion, sound travels at ~343 m/s in air (1234.8 km/h) and light at 299,792 km/s. Enter these into this calculator to find how far sound or light travels in a given time.</p>
            <h2 className="text-2xl font-bold mb-3">Tips for This Calculator</h2>
            <p>Toggle the "Solve For" selector to pick which unknown you need. Use decimal hours (1.5 = 1h 30m, 0.25 = 15 minutes) for fractional time inputs. Switch between km and miles — values auto-convert. The cumulative distance chart helps visualize long journeys: at 75 km/h for 5 hours, you cover 375 km total. Pair with the <a href="/calculator/fuel-cost-calculator">fuel cost calculator</a> for complete road trip planning.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/speed-distance-time-calculator" />
          <PopularCalculators exclude="/calculator/speed-distance-time-calculator" />
        </div>
      </div>
    </>
  );
};
export default SpeedDistanceTimeCalculator;
