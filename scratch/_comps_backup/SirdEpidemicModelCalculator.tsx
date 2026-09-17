"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface SirdInput {
  population: number;
  initialInfected: number;
  transmissionRate: number; // beta
  recoveryRate: number; // gamma
  fatalityRate: number; // CFR as %
  days: number;
}

interface SirdResult {
  r0: number;
  herdImmunity: number;
  peakInfected: number;
  peakDay: number;
  totalInfected: number;
  totalRecovered: number;
  totalDeceased: number;
  finalSusceptible: number;
  chartData: { day: number; infected: number; recovered: number; deceased: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcSird(input: SirdInput): SirdResult {
  const pop = Math.max(1, input.population);
  const cfr = Math.min(1, Math.max(0, input.fatalityRate / 100));
  let S = Math.max(0, pop - input.initialInfected);
  let I = Math.min(pop, input.initialInfected);
  let R = 0;
  let D = 0;

  const r0 = input.recoveryRate > 0 ? input.transmissionRate / input.recoveryRate : 0;
  const herdImmunity = r0 > 1 ? (1 - 1 / r0) * 100 : 0;

  let peakInfected = I;
  let peakDay = 0;
  const chartData: { day: number; infected: number; recovered: number; deceased: number }[] = [];

  for (let day = 1; day <= input.days; day++) {
    const newInfections = (input.transmissionRate * S * I) / pop;
    const newRecoveries = input.recoveryRate * I;
    const deaths = newRecoveries * cfr;
    const recoveries = newRecoveries - deaths;

    S = Math.max(0, S - newInfections);
    I = Math.max(0, I + newInfections - newRecoveries);
    R += recoveries;
    D += deaths;

    if (I > peakInfected) {
      peakInfected = I;
      peakDay = day;
    }
    if (day % Math.ceil(input.days / 60) === 0 || day === input.days) {
      chartData.push({ day, infected: Math.round(I), recovered: Math.round(R), deceased: Math.round(D) });
    }
  }

  const totalInfected = R + D;
  const totalDeceased = D;

  const breakdown = [
    { label: "Population", value: pop.toLocaleString() },
    { label: "Initial Infected", value: input.initialInfected.toLocaleString() },
    { label: "Transmission Rate (β)", value: input.transmissionRate.toFixed(2) },
    { label: "Recovery Rate (γ)", value: input.recoveryRate.toFixed(2) },
    { label: "Basic Reproduction Number (R₀)", value: r0.toFixed(2) },
    { label: "Herd Immunity Threshold", value: `${herdImmunity.toFixed(1)}%` },
    { label: "Peak Active Infections", value: `${Math.round(peakInfected).toLocaleString()} (day ${peakDay})` },
    { label: "Total Infected", value: `${Math.round(totalInfected).toLocaleString()}` },
    { label: "Recovered", value: `${Math.round(R).toLocaleString()}` },
    { label: "Deceased (CFR ${(cfr * 100).toFixed(0)}%)", value: `${Math.round(totalDeceased).toLocaleString()}` },
  ];

  const summaryStats = [
    { label: "R₀ (Basic Rep. Number)", value: r0.toFixed(2) },
    { label: "Peak Active Infections", value: `${Math.round(peakInfected).toLocaleString()}` },
    { label: "Peak Day", value: `${peakDay}` },
    { label: "Total Infected", value: `${Math.round(totalInfected).toLocaleString()}` },
    { label: "Recovered", value: `${Math.round(R).toLocaleString()}` },
    { label: "Deceased", value: `${Math.round(totalDeceased).toLocaleString()}` },
  ];

  return { r0, herdImmunity, peakInfected, peakDay, totalInfected, totalRecovered: R, totalDeceased, finalSusceptible: S, chartData, breakdown, summaryStats };
}

const DEFAULTS: SirdInput = { population: 100000, initialInfected: 100, transmissionRate: 0.3, recoveryRate: 0.1, fatalityRate: 2, days: 180 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function SirdEpidemicModelCalculator() {
  const [population, setPopulation] = useState(String(DEFAULTS.population));
  const [initialInfected, setInitialInfected] = useState(String(DEFAULTS.initialInfected));
  const [beta, setBeta] = useState(String(DEFAULTS.transmissionRate));
  const [gamma, setGamma] = useState(String(DEFAULTS.recoveryRate));
  const [cfr, setCfr] = useState(String(DEFAULTS.fatalityRate));
  const [days, setDays] = useState(String(DEFAULTS.days));
  const [result, setResult] = useState<SirdResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcSird({
      population: parse(population, DEFAULTS.population),
      initialInfected: parse(initialInfected, DEFAULTS.initialInfected),
      transmissionRate: parse(beta, DEFAULTS.transmissionRate),
      recoveryRate: parse(gamma, DEFAULTS.recoveryRate),
      fatalityRate: parse(cfr, DEFAULTS.fatalityRate),
      days: Math.max(1, parse(days, DEFAULTS.days)),
    }));
  const reset = () => {
    setPopulation(String(DEFAULTS.population));
    setInitialInfected(String(DEFAULTS.initialInfected));
    setBeta(String(DEFAULTS.transmissionRate));
    setGamma(String(DEFAULTS.recoveryRate));
    setCfr(String(DEFAULTS.fatalityRate));
    setDays(String(DEFAULTS.days));
    setResult(calcSird(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcSird(DEFAULTS));
  }, []);

  const faqs = [
    { question: "What is the SIRD model?", answer: "SIRD is a compartmental epidemiological model that divides a population into Susceptible, Infected, Recovered, and Deceased compartments. Each day, susceptible people become infected at rate β, and infected people recover or die at rate γ, with a case fatality rate applied to recoveries." },
    { question: "What is R₀?", answer: "The basic reproduction number R₀ = β ÷ γ is the average number of people one infected person infects in a fully susceptible population. R₀ above 1 grows an outbreak; below 1, it fades. Herd immunity is reached when roughly 1 − 1/R₀ of the population is immune." },
    { question: "How accurate is this simulation?", answer: "It is a simplified deterministic model. Real epidemics have age structure, heterogeneous contact, seasonality, and behavior change (lockdowns, masks, vaccination), none of which are included. Use it to explore dynamics and relative effects, not to forecast real outbreaks." },
    { question: "How do I choose β and γ?", answer: "γ is the inverse of the average infectious period (γ = 1/10 days ≈ 0.1). β = R₀ × γ, so for R₀ = 3 with γ = 0.1, use β = 0.3. Higher CFR (e.g., 2%) models a more severe disease; 0% models a non-fatal one." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "SIRD Epidemic Model Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">SIRD Epidemic Model Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Population</label>
                <div className={inp}><input type="number" value={population} onChange={(e) => setPopulation(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Initial Infected</label>
                <div className={inp}><input type="number" value={initialInfected} onChange={(e) => setInitialInfected(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Transmission Rate (β)</label>
                <div className={inp}><input type="number" value={beta} onChange={(e) => setBeta(e.target.value)} step={0.01} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Recovery Rate (γ)</label>
                <div className={inp}><input type="number" value={gamma} onChange={(e) => setGamma(e.target.value)} step={0.01} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Case Fatality Rate</label>
                <div className={inp}><input type="number" value={cfr} onChange={(e) => setCfr(e.target.value)} step={0.1} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Simulation Days</label>
                <div className={inp}><input type="number" value={days} onChange={(e) => setDays(e.target.value)} className={ci} /></div>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Peak Active Infections</div>
                  <div className="text-4xl font-extrabold tracking-tight text-primary">{Math.round(result.peakInfected).toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground mt-1">on day {result.peakDay} · R₀ = {result.r0.toFixed(2)} · herd immunity at {result.herdImmunity.toFixed(1)}%</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["R₀", result.r0.toFixed(2)], ["Total Infected", `${Math.round(result.totalInfected).toLocaleString()}`], ["Deceased", `${Math.round(result.totalDeceased).toLocaleString()}`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Model Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 6 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Epidemic Curve</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
                      <Tooltip formatter={(v: number) => [v.toLocaleString(), ""]} labelFormatter={(l) => `Day ${l}`} />
                      <Legend />
                      <Line type="monotone" dataKey="infected" name="Infected" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="recovered" name="Recovered" stroke="#10b981" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="deceased" name="Deceased" stroke="#ef4444" strokeWidth={2} dot={false} />
                    </LineChart>
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
            <h2 className="text-2xl font-bold mb-3">The Compartmental Approach</h2>
            <p>The SIRD model tracks four compartments — Susceptible, Infected, Recovered, Deceased — with two daily flows: susceptible → infected at rate β·S·I/N, and infected → recovered or deceased at rate γ. Simple as it is, it reproduces the classic epidemic curve: exponential growth, a peak, then decay as the susceptible pool depletes.</p>
            <h2 className="text-2xl font-bold mb-3">R₀ and Herd Immunity</h2>
            <p>R₀ = β ÷ γ tells you whether an outbreak grows (R₀ {'>'} 1) or dies out (R₀ {'<'} 1). Herd immunity — the share of the population that must be immune to stop spread — is approximately 1 − 1/R₀. For R₀ = 3 that is 67%; for R₀ = 2, 50%.</p>
            <h2 className="text-2xl font-bold mb-3">What This Model Omits</h2>
            <p>Real outbreaks include age structure, spatial spread, seasonality, and — most importantly — behavior change and intervention. This calculator is a teaching tool for understanding dynamics (why flattening the curve works, what CFR changes do). It is not a real-outbreak forecast.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/sird-epidemic-model-calculator" />
          <PopularCalculators exclude="/calculator/sird-epidemic-model-calculator" />
        </div>
      </div>
    </>
  );
}
