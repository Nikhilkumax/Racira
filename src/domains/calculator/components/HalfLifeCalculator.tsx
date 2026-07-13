"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HalfLifeResult {
  initialAmount: number;
  finalAmount: number;
  halfLife: number;
  elapsedTime: number;
  numHalfLives: number;
  decayRate: number;
  chartData: { time: number; amount: number }[];
  isError: boolean;
  errorMsg?: string;
}

const calculateHalfLife = (
  mode: "find_final" | "find_time" | "find_halflife" | "find_initial",
  initialStr: string,
  finalStr: string,
  halfLifeStr: string,
  timeStr: string
): HalfLifeResult | null => {
  const n0 = parseFloat(initialStr);
  const nt = parseFloat(finalStr);
  const h = parseFloat(halfLifeStr);
  const t = parseFloat(timeStr);

  try {
    let finalN0 = n0;
    let finalNt = nt;
    let finalH = h;
    let finalT = t;

    // Formula: N(t) = N0 * (1/2)^(t/h)
    if (mode === "find_final") {
      if (isNaN(n0) || isNaN(h) || isNaN(t) || n0 <= 0 || h <= 0 || t < 0) return null;
      finalNt = n0 * Math.pow(0.5, t / h);
    } else if (mode === "find_time") {
      if (isNaN(n0) || isNaN(nt) || isNaN(h) || n0 <= 0 || nt <= 0 || h <= 0 || nt > n0) return { initialAmount: 0, finalAmount: 0, halfLife: 0, elapsedTime: 0, numHalfLives: 0, decayRate: 0, chartData: [], isError: true, errorMsg: "Final amount must be less than initial amount." };
      finalT = h * (Math.log(nt / n0) / Math.log(0.5));
    } else if (mode === "find_halflife") {
      if (isNaN(n0) || isNaN(nt) || isNaN(t) || n0 <= 0 || nt <= 0 || t <= 0 || nt > n0) return { initialAmount: 0, finalAmount: 0, halfLife: 0, elapsedTime: 0, numHalfLives: 0, decayRate: 0, chartData: [], isError: true, errorMsg: "Final amount must be less than initial amount." };
      finalH = t / (Math.log(nt / n0) / Math.log(0.5));
    } else if (mode === "find_initial") {
      if (isNaN(nt) || isNaN(h) || isNaN(t) || nt <= 0 || h <= 0 || t < 0) return null;
      finalN0 = nt / Math.pow(0.5, t / h);
    }

    const numHalfLives = finalT / finalH;
    const decayConstant = Math.log(2) / finalH;

    // Generate Chart Data (up to 5 half lives or the requested time, whichever is greater)
    const maxTime = Math.max(finalT, finalH * 5);
    const steps = 10;
    const stepSize = maxTime / steps;
    const chartData = [];

    for (let i = 0; i <= steps; i++) {
      const currentTime = i * stepSize;
      const currentAmount = finalN0 * Math.pow(0.5, currentTime / finalH);
      chartData.push({
        time: parseFloat(currentTime.toFixed(2)),
        amount: parseFloat(currentAmount.toFixed(4))
      });
    }

    return {
      initialAmount: finalN0,
      finalAmount: finalNt,
      halfLife: finalH,
      elapsedTime: finalT,
      numHalfLives,
      decayRate: decayConstant,
      chartData,
      isError: false
    };

  } catch (err) {
    return { initialAmount: 0, finalAmount: 0, halfLife: 0, elapsedTime: 0, numHalfLives: 0, decayRate: 0, chartData: [], isError: true, errorMsg: "Calculation error." };
  }
};

const HalfLifeCalculator = () => {
  const [mode, setMode] = useState<"find_final" | "find_time" | "find_halflife" | "find_initial">("find_final");
  const [initial, setInitial] = useState("100");
  const [final, setFinal] = useState("25");
  const [halfLife, setHalfLife] = useState("10");
  const [time, setTime] = useState("20");

  const [result, setResult] = useState<HalfLifeResult | null>(null);

  const calculate = () => {
    setResult(calculateHalfLife(mode, initial, final, halfLife, time));
  };

  useEffect(() => { calculate(); }, [mode, initial, final, halfLife, time]);

  const handleModeChange = (newMode: "find_final" | "find_time" | "find_halflife" | "find_initial") => {
    setMode(newMode);
    if (newMode === "find_final") { setInitial("100"); setHalfLife("10"); setTime("20"); }
    if (newMode === "find_time") { setInitial("100"); setFinal("25"); setHalfLife("10"); }
    if (newMode === "find_halflife") { setInitial("100"); setFinal("25"); setTime("20"); }
    if (newMode === "find_initial") { setFinal("25"); setHalfLife("10"); setTime("20"); }
  };

  const wrap = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is a Half-Life?", answer: "Half-life is the time required for a quantity to reduce to half of its initial value. It is most commonly used in physics to describe radioactive decay (how long it takes for a radioactive material to become less radioactive) and in pharmacology (how long it takes for a drug to lose half its concentration in the bloodstream)." },
    { question: "Does the material ever completely disappear?", answer: "Mathematically, no. If you keep dividing a number by 2, you will never reach absolute zero. You will just get smaller and smaller fractions. In reality, however, you eventually get down to a single atom, which will eventually decay, meaning it does technically disappear, but the mathematical curve approaches zero infinitely." },
    { question: "What is Carbon Dating?", answer: "Carbon-14 is a radioactive isotope present in all living things. When an organism dies, it stops absorbing Carbon-14, and the existing Carbon-14 begins to decay with a half-life of 5,730 years. By measuring how much Carbon-14 is left in a fossil compared to how much it started with, scientists can calculate exactly how long ago it died." },
    { question: "What is the Decay Constant (λ)?", answer: "The decay constant (lambda) represents the probability of decay per unit of time. It is directly related to the half-life. The faster the half-life, the higher the decay constant. The formula is λ = ln(2) / Half-Life." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Half-Life Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Half-Life Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
          <div className="card-calculator flex flex-col gap-5 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5">What are you trying to find?</label>
              <div className="flex flex-col gap-2 rounded-md border border-input p-1 bg-background">
                <button type="button" onClick={() => handleModeChange("find_final")} className={`py-2 px-3 text-sm font-bold rounded transition-colors text-left ${mode === "find_final" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Find Final Amount</button>
                <button type="button" onClick={() => handleModeChange("find_time")} className={`py-2 px-3 text-sm font-bold rounded transition-colors text-left ${mode === "find_time" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Find Elapsed Time</button>
                <button type="button" onClick={() => handleModeChange("find_halflife")} className={`py-2 px-3 text-sm font-bold rounded transition-colors text-left ${mode === "find_halflife" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Find Half-Life</button>
                <button type="button" onClick={() => handleModeChange("find_initial")} className={`py-2 px-3 text-sm font-bold rounded transition-colors text-left ${mode === "find_initial" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Find Initial Amount</button>
              </div>
            </div>

            <div className="h-px w-full bg-border/50"></div>

            {mode !== "find_initial" && (
              <div className="flex flex-col">
                <label className="text-base font-medium text-foreground mb-1.5">Initial Amount (N₀)</label>
                <div className={wrap}><input type="number" value={initial} onChange={e => setInitial(e.target.value)} className={ci} min="0" step="any" placeholder="e.g. 100" /></div>
              </div>
            )}

            {mode !== "find_final" && (
              <div className="flex flex-col">
                <label className="text-base font-medium text-foreground mb-1.5">Final Amount (Nₜ)</label>
                <div className={wrap}><input type="number" value={final} onChange={e => setFinal(e.target.value)} className={ci} min="0" step="any" placeholder="e.g. 25" /></div>
              </div>
            )}

            {mode !== "find_halflife" && (
              <div className="flex flex-col">
                <label className="text-base font-medium text-foreground mb-1.5">Half-Life Time (t½)</label>
                <div className={wrap}><input type="number" value={halfLife} onChange={e => setHalfLife(e.target.value)} className={ci} min="0" step="any" placeholder="e.g. 10" /></div>
              </div>
            )}

            {mode !== "find_time" && (
              <div className="flex flex-col">
                <label className="text-base font-medium text-foreground mb-1.5">Elapsed Time (t)</label>
                <div className={wrap}><input type="number" value={time} onChange={e => setTime(e.target.value)} className={ci} min="0" step="any" placeholder="e.g. 20" /></div>
              </div>
            )}

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-12 text-lg transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={() => { handleModeChange(mode); }} className="w-12 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-12 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && result.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5 flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Input Error</div>
                  <div className="text-base font-medium text-foreground">{result.errorMsg}</div>
                </div>
              </div>
            ) : result && (<>
              
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-6">
                <div className="text-sm font-bold text-primary mb-2 uppercase tracking-wider">
                  {mode === "find_final" && "Final Remaining Amount"}
                  {mode === "find_time" && "Total Elapsed Time"}
                  {mode === "find_halflife" && "Half-Life Duration"}
                  {mode === "find_initial" && "Initial Starting Amount"}
                </div>
                <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                  <span className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight font-mono">
                    {mode === "find_final" && result.finalAmount.toPrecision(6)}
                    {mode === "find_time" && result.elapsedTime.toPrecision(6)}
                    {mode === "find_halflife" && result.halfLife.toPrecision(6)}
                    {mode === "find_initial" && result.initialAmount.toPrecision(6)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="card-calculator !p-4 border border-border bg-card shadow-sm text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Total Half-Lives</div>
                  <div className="text-2xl font-bold text-foreground font-mono">{result.numHalfLives.toFixed(2)}</div>
                </div>
                <div className="card-calculator !p-4 border border-border bg-card shadow-sm text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Decay Constant (λ)</div>
                  <div className="text-2xl font-bold text-foreground font-mono">{result.decayRate.toExponential(2)}</div>
                </div>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-4">Decay Curve</h3>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={result.chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.2} />
                      <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(val) => `${val}t`} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))', borderRadius: '0.5rem', fontWeight: 'bold' }}
                        formatter={(value: number) => [value, "Amount"]}
                        labelFormatter={(label) => `Time: ${label}`}
                      />
                      <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Mathematics of Decay</h2>
            <p>In science, <strong>Exponential Decay</strong> describes a process where a quantity decreases at a rate proportional to its current value. Because the rate of decay slows down as the quantity shrinks, the material theoretically never reaches absolute zero. Instead, scientists measure the decay using a concept called the <strong>Half-Life</strong>.</p>
            <p>A half-life (denoted as t½) is exactly what it sounds like: the amount of time it takes for half of the original substance to decay or disappear. If you start with 100 grams of a substance that has a half-life of 10 years:</p>
            <ul>
              <li>At 0 years: 100 grams</li>
              <li>At 10 years (1 half-life): 50 grams</li>
              <li>At 20 years (2 half-lives): 25 grams</li>
              <li>At 30 years (3 half-lives): 12.5 grams</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Real World Applications</h2>
            <h3>1. Radiometric Dating</h3>
            <p>The most famous application of the half-life formula is <strong>Carbon Dating</strong>. Carbon-14 is a radioactive isotope that all living plants and animals absorb from the atmosphere while alive. When they die, they stop absorbing it. Carbon-14 decays into Nitrogen-14 with a known half-life of 5,730 years. By measuring the ratio of Carbon-14 to stable Carbon-12 in a fossil, archaeologists can calculate the exact "Elapsed Time" since the organism died.</p>
            
            <h3>2. Medical Pharmacology</h3>
            <p>When you take a pill, your liver and kidneys immediately begin filtering it out of your bloodstream. The biological half-life of a drug dictates how often you need to take it. For example, Ibuprofen has a half-life of about 2 hours. If you take 400mg, only 200mg remains active in your blood after 2 hours. After 4 hours, only 100mg remains, which is why the bottle tells you to take another dose every 4 to 6 hours to maintain effectiveness.</p>

            <h3>3. Nuclear Physics</h3>
            <p>Radioactive waste from nuclear power plants is highly dangerous. Knowing the half-life of the isotopes produced (such as Plutonium-239, which has a half-life of 24,100 years) tells scientists exactly how long the waste must be securely contained before it decays into safe, stable lead.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/half-life-calculator" />
          <PopularCalculators exclude="/calculator/half-life-calculator" />
        </div>
      </div>
    </>
  );
};
export default HalfLifeCalculator;
