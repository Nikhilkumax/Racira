"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const AccelerationCalculator = () => {
  const DEFAULTS = { vf: "30", vi: "0", t: "6" };
  const [vf, setVf] = useState(DEFAULTS.vf);
  const [vi, setVi] = useState(DEFAULTS.vi);
  const [t, setT] = useState(DEFAULTS.t);
  const [result, setResult] = useState<any>(null);

  const calculate = (vfV = vf, viV = vi, tV = t) => {
    const vfN = parseFloat(vfV), viN = parseFloat(viV), tN = parseFloat(tV);
    if (isNaN(vfN) || isNaN(viN) || isNaN(tN) || tN === 0) return;
    const a = (vfN - viN) / tN;
    const deltaV = vfN - viN;
    const dist = viN * tN + 0.5 * a * tN * tN;
    const chartData = Array.from({ length: Math.min(Math.ceil(tN) + 1, 12) }, (_, i) => ({
      name: `t=${i}s`,
      velocity: parseFloat((viN + a * i).toFixed(2)),
    }));
    setResult({
      primary: `${a.toFixed(4)} m/s²`,
      subtitle: `${a > 0 ? "Acceleration" : a < 0 ? "Deceleration" : "Constant velocity"} over ${tN}s`,
      rows: [
        { label: "Initial Velocity (vi)", value: `${viN} m/s` },
        { label: "Final Velocity (vf)", value: `${vfN} m/s` },
        { label: "Time (t)", value: `${tN} s` },
        { label: "Change in Velocity (Δv)", value: `${deltaV.toFixed(4)} m/s` },
        { label: "Acceleration (a)", value: `${a.toFixed(4)} m/s²` },
        { label: "Distance covered", value: `${dist.toFixed(2)} m` },
      ],
      chartData,
      summary: [
        { label: "Acceleration", value: `${a.toFixed(4)} m/s²` },
        { label: "Type", value: a > 0 ? "Positive (speeding up)" : a < 0 ? "Negative (slowing down)" : "Zero (constant)" },
        { label: "Distance covered", value: `${dist.toFixed(2)} m` },
        { label: "In g-force", value: `${(a / 9.81).toFixed(3)} g`, border: true, bold: true },
      ],
    });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => { setVf(DEFAULTS.vf); setVi(DEFAULTS.vi); setT(DEFAULTS.t); calculate(DEFAULTS.vf, DEFAULTS.vi, DEFAULTS.t); };

  const faqs = [
    { question: "What is the formula for acceleration?", answer: "Acceleration = (Final Velocity − Initial Velocity) / Time, or a = (vf − vi) / t. The SI unit is meters per second squared (m/s²)." },
    { question: "What is the difference between acceleration and deceleration?", answer: "Deceleration (also called negative acceleration or retardation) is simply acceleration with a negative value — the object is slowing down. Acceleration covers both speeding up and slowing down." },
    { question: "What is 1g of acceleration?", answer: "1g = 9.81 m/s², the acceleration due to Earth's gravity. A car accelerating from 0 to 100 km/h in 5 seconds experiences about 5.7 m/s² ≈ 0.58g." },
    { question: "Can acceleration be negative?", answer: "Yes. Negative acceleration means the velocity is decreasing. For example, if vi = 30 m/s and vf = 0 m/s over 6 seconds, a = −5 m/s²." },
    { question: "What is the distance formula under constant acceleration?", answer: "Distance = vi × t + ½ × a × t². This is one of the kinematic equations of motion. This calculator computes distance automatically." },
    { question: "What units does this calculator use?", answer: "This calculator uses SI units: velocity in m/s, time in seconds, and acceleration in m/s². Convert km/h to m/s by dividing by 3.6." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Acceleration Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Acceleration Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px]">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Final Velocity (vf)</label>
              <div className="relative">
                <input type="number" value={vf} onChange={e => setVf(e.target.value)}
                  className="h-10 w-full pl-3 pr-14 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="30" step="any" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">m/s</span>
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Initial Velocity (vi)</label>
              <div className="relative">
                <input type="number" value={vi} onChange={e => setVi(e.target.value)}
                  className="h-10 w-full pl-3 pr-14 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="0" step="any" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">m/s</span>
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Time (t)</label>
              <div className="relative">
                <input type="number" value={t} onChange={e => setT(e.target.value)}
                  className="h-10 w-full pl-3 pr-10 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="6" step="any" min="0.001" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">s</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => calculate()} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">Calculate</button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Acceleration</div>
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
                  <h3 className="text-base font-semibold mb-3">Velocity Over Time</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={result.chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <ReferenceLine y={0} stroke="#666" />
                      <Bar dataKey="velocity" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
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
            <h2 className="text-2xl font-bold mb-3">Understanding the Physics of Acceleration</h2>
            <p>Acceleration is one of the most fundamental concepts in classical mechanics and physics, describing the exact rate at which an object changes its velocity over a specific period of time. Unlike speed, which simply measures how fast an object is moving, acceleration measures how quickly that speed is changing. Furthermore, because velocity is a vector quantity—meaning it has both a magnitude (speed) and a direction—acceleration is also a vector quantity. This means you can experience acceleration by speeding up, by slowing down, or simply by changing the direction of your movement while maintaining a constant speed, such as a car driving in a continuous circle. Our acceleration calculator focuses on linear acceleration, computing the rate of change in speed along a straight path using the fundamental kinematic equations of motion established by Sir Isaac Newton centuries ago.</p>
            
            <p>In everyday language, people often use the word "acceleration" to strictly mean speeding up, while using "deceleration" to mean slowing down. In physics, however, both scenarios are simply referred to as acceleration. When an object speeds up, its acceleration points in the same direction as its velocity, resulting in a positive value. When an object slows down, its acceleration points in the opposite direction of its velocity, resulting in a negative value. This calculator handles both scenarios seamlessly. By inputting your initial velocity, your final velocity, and the time it took to transition between those two states, the calculator will instantly compute the acceleration rate in meters per second squared (m/s²). It also computes the total physical distance covered during that specific time interval, assuming the acceleration remained constant throughout the motion.</p>
            
            <h2 className="text-2xl font-bold mb-3">The Core Mathematical Formula</h2>
            <p>The primary formula used by this calculator to determine the average acceleration of an object is incredibly straightforward and forms the basis of introductory kinematics. The formula states that acceleration (a) is equal to the change in velocity (denoted as delta v) divided by the change in time (denoted as t). In mathematical notation, this is written as: a = (vf − vi) / t. In this equation, "vf" represents the final velocity of the object at the end of the time period, "vi" represents the initial velocity of the object at the very beginning of the time period, and "t" represents the total duration of time in seconds.</p>
            
            <p>To put this formula into practical perspective, imagine you are driving a sports car that accelerates from a standstill (initial velocity of zero) to a speed of 30 meters per second (approximately 108 kilometers per hour or 67 miles per hour) in exactly 6 seconds. To find the acceleration, you subtract the initial velocity (0) from the final velocity (30), which gives you a change in velocity of 30 meters per second. You then divide this change by the time it took (6 seconds). The result is 5 meters per second squared. This means that for every single second that passes, the car's velocity increases by exactly 5 meters per second. After one second, the car is moving at 5 m/s. After two seconds, it is moving at 10 m/s, and so on until it hits 30 m/s at the 6-second mark.</p>
            
            <h2 className="text-2xl font-bold mb-3">Calculating Distance Under Constant Acceleration</h2>
            <p>Beyond simply finding the rate of acceleration, it is often critical to know exactly how much physical distance the object covered while it was accelerating. For example, if you are designing a runway for an airplane, or calculating the stopping distance of a freight train, knowing the acceleration alone is not enough; you must know the distance required. This calculator automatically computes this distance using the second major kinematic equation of motion, which applies specifically to scenarios involving constant, uniform acceleration.</p>
            
            <p>The formula for distance (d) under constant acceleration is: d = vi × t + ½ × a × t². This equation states that the total distance traveled is equal to the initial velocity multiplied by the time, plus one-half of the acceleration multiplied by the square of the time. Using our previous sports car example (vi = 0, a = 5 m/s², t = 6s), the first part of the equation becomes zero because the initial velocity is zero. The second part becomes one-half times 5 times 36 (since 6 squared is 36). One-half of 5 is 2.5, and 2.5 multiplied by 36 equals 90. Therefore, the car traveled exactly 90 meters during those 6 seconds of acceleration. This calculation is performed instantly in the background and displayed in the breakdown table of our results panel.</p>
            
            <h2 className="text-2xl font-bold mb-3">Understanding G-Force and Real-World Context</h2>
            <p>While meters per second squared (m/s²) is the standard SI unit for acceleration used by scientists and engineers globally, it can be difficult for the average person to intuitively grasp. To provide a more relatable real-world context, our calculator automatically converts your resulting acceleration into "g-force" equivalents. A single "g" is defined as the standard acceleration due to Earth's gravity at sea level, which is approximately 9.81 meters per second squared. This is the exact rate at which a dropped object will accelerate downwards in a vacuum.</p>
            
            <p>By dividing your calculated acceleration by 9.81, you can express it in terms of g-force. For example, if a roller coaster accelerates at 19.6 m/s², it is pulling exactly 2g. This means a passenger on that ride would feel a force pushing them back into their seat equal to twice their normal body weight. A typical passenger car under heavy braking might experience around -0.8g to -1.0g of deceleration. Fighter pilots in high-performance jets can experience up to 9g during aggressive turning maneuvers, which requires specialized pressure suits and intense physical training to prevent the blood from rushing out of their brain and causing them to lose consciousness. By providing this g-force conversion, the calculator bridges the gap between abstract physics equations and visceral human experience.</p>
            
            <h2 className="text-2xl font-bold mb-3">Applications in Engineering and Safety Analysis</h2>
            <p>The principles of acceleration calculation are critical in almost every branch of engineering, particularly in safety analysis and vehicle dynamics. Automotive engineers use these exact formulas to design crumple zones and airbag deployment systems. During a car crash, a vehicle undergoes a massive, violent deceleration over a fraction of a second. By measuring the initial speed of the vehicle prior to impact and the extremely short time it takes for the car to come to a complete stop, engineers can calculate the exact negative acceleration experienced by the vehicle's frame and the passengers inside. According to Newton's Second Law of Motion (Force = mass × acceleration), higher rates of acceleration or deceleration result in exponentially higher forces being applied to the human body.</p>
            
            <p>Similarly, civil engineers rely on acceleration calculations when designing highway on-ramps and off-ramps. An on-ramp must be physically long enough to give a heavily loaded commercial truck sufficient distance to accelerate from surface street speeds to highway speeds before merging into high-speed traffic. If the ramp is too short, the truck's maximum acceleration rate won't be enough to reach a safe merging velocity, creating a hazardous traffic situation. By utilizing the time, velocity, and distance formulas processed by this calculator, infrastructure can be designed to match the physical realities of motion.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/acceleration-calculator" />
          <PopularCalculators exclude="/calculator/acceleration-calculator" />
        </div>
      </div>
    </>
  );
};
export default AccelerationCalculator;
