"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const R_GAS = 8.314; // J/(mol·K)

const toKelvin = (val: number, unit: string): number => {
  if (unit === "C") return val + 273.15;
  if (unit === "F") return (val - 32) * 5 / 9 + 273.15;
  return val;
};

const TIME_FACTORS: Record<string, number> = {
  sec: 1, min: 60, hr: 3600, day: 86400, wk: 604800, mo: 2629800, yr: 31557600,
};
const toPerSec = (val: number, unit: string) => val / (TIME_FACTORS[unit] ?? 1);
const fromPerSec = (val: number, unit: string) => val * (TIME_FACTORS[unit] ?? 1);

const ENERGY_FACTORS: Record<string, number> = { J: 1, kJ: 1000, MJ: 1_000_000, cal: 4.184, kcal: 4184 };
const toJoules = (val: number, unit: string) => val * (ENERGY_FACTORS[unit] ?? 1);
const fromJoules = (val: number, unit: string) => val / (ENERGY_FACTORS[unit] ?? 1);

const ENERGY_UNITS = ["J", "kJ", "MJ", "cal", "kcal"];
const ENERGY_LABELS: Record<string, string> = {
  J: "joules (J)", kJ: "kilojoules (kJ)", MJ: "megajoules (MJ)",
  cal: "calories (cal)", kcal: "kilocalories (kcal)",
};
const TEMP_UNITS = [
  { v: "C", l: "Celsius (°C)" },
  { v: "F", l: "Fahrenheit (°F)" },
  { v: "K", l: "kelvins (K)" },
];
const TIME_UNITS = [
  { v: "sec", l: "second (sec)" }, { v: "min", l: "minute (min)" }, { v: "hr", l: "hour (hr)" },
  { v: "day", l: "day (day)" }, { v: "wk", l: "week (wk)" }, { v: "mo", l: "month (mo)" }, { v: "yr", l: "year (yr)" },
];

const fmt = (n: number, d = 4) => n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: d });

const ActivationEnergyCalculator = () => {
  const [T, setT] = useState("25");
  const [Tunit, setTunit] = useState("C");
  const [k, setK] = useState("0.001");
  const [kUnit, setKUnit] = useState("sec");
  const [A, setA] = useState("1e13");
  const [AUnit, setAUnit] = useState("sec");
  const [EaUnit, setEaUnit] = useState("kJ");
  const [result, setResult] = useState<any>(null);

  const calculate = (
    rT = T, rTu = Tunit, rk = k, rku = kUnit,
    rA = A, rAu = AUnit, rEu = EaUnit,
  ) => {
    const nT = parseFloat(rT);
    const nk = parseFloat(rk);
    const nA = parseFloat(rA);
    if ([nT, nk, nA].some(isNaN) || nk <= 0 || nA <= 0) return;

    const T_K = toKelvin(nT, rTu);
    if (T_K <= 0) return;

    const k_ps = toPerSec(nk, rku);
    const A_ps = toPerSec(nA, rAu);
    if (k_ps <= 0 || A_ps <= 0 || k_ps >= A_ps) return;

    // Ea = -R·T·ln(k/A)
    const Ea_J = -R_GAS * T_K * Math.log(k_ps / A_ps);
    const EaDisplay = fromJoules(Ea_J, rEu);
    const EaAll = Object.fromEntries(ENERGY_UNITS.map(u => [u, fromJoules(Ea_J, u)]));

    // Q10
    const k_at_T10 = A_ps * Math.exp(-Ea_J / (R_GAS * (T_K + 10)));
    const Q10 = k_at_T10 / k_ps;

    // Half-life (first-order)
    const hl_sec = Math.log(2) / k_ps;
    const hlStr = hl_sec < 60 ? `${fmt(hl_sec, 2)} s`
      : hl_sec < 3600 ? `${fmt(hl_sec / 60, 2)} min`
      : hl_sec < 86400 ? `${fmt(hl_sec / 3600, 2)} hr`
      : `${fmt(hl_sec / 86400, 2)} days`;

    // Chart: k vs T (°C), show in user's k time unit
    const TcBase = T_K - 273.15;
    const chartData: { T: number; k: number }[] = [];
    for (let dT = -40; dT <= 60; dT += 5) {
      const Tc = TcBase + dT;
      const Tk = Tc + 273.15;
      if (Tk <= 0) continue;
      const kc = A_ps * Math.exp(-Ea_J / (R_GAS * Tk));
      chartData.push({ T: parseFloat(Tc.toFixed(1)), k: parseFloat(fromPerSec(kc, rku).toPrecision(4)) });
    }

    setResult({ T_K, nT, rTu, nk, k_ps, nA, A_ps, Ea_J, EaDisplay, EaAll, Q10, hlStr, chartData, rku });
  };

  useEffect(() => { calculate(); }, []);

  const reset = () => {
    setT("25"); setTunit("C"); setK("0.001"); setKUnit("sec");
    setA("1e13"); setAUnit("sec"); setEaUnit("kJ");
    calculate("25", "C", "0.001", "sec", "1e13", "sec", "kJ");
  };

  const sel = "h-10 px-2 rounded-md border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20 text-sm";
  const inp = "flex-1 h-10 px-3 text-lg rounded-md border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20";

  const faqs = [
    { question: "What is the Arrhenius equation?", answer: "k = A × e^(−Ea/RT), where k = rate constant, A = frequency factor, Ea = activation energy (J/mol), R = 8.314 J/(mol·K), T = temperature (K). Rearranged for Ea: Ea = −R·T·ln(k/A) = R·T·ln(A/k). This single-point form requires knowing k, A, and T simultaneously." },
    { question: "What are typical activation energy values?", answer: "Diffusion-controlled reactions: 10–20 kJ/mol. Enzyme-catalyzed reactions: 20–60 kJ/mol. Typical organic reactions: 40–200 kJ/mol. Combustion: 100–200 kJ/mol. The default (T=25°C, k=0.001/s, A=10¹³/s) gives ~75 kJ/mol — typical for moderate organic chemistry." },
    { question: "Why must k be less than A?", answer: "In k = A·e^(−Ea/RT), the Boltzmann factor e^(−Ea/RT) is always between 0 and 1 for Ea > 0. So k ≤ A always. A is the theoretical maximum rate constant at infinite temperature. If you enter k ≥ A, Ea would be zero or negative — physically impossible for thermally activated reactions." },
    { question: "How do I convert between energy units?", answer: "1 kJ = 1000 J. 1 MJ = 10⁶ J. 1 cal = 4.184 J. 1 kcal = 4184 J. Chemistry typically uses kJ/mol; biochemistry uses kcal/mol. Example: 75 kJ/mol = 75,000 J/mol = 17.92 kcal/mol = 0.075 MJ/mol." },
    { question: "What is the Q10 temperature coefficient?", answer: "Q10 = k(T+10°C) / k(T). For biological reactions Q10 ≈ 2–3. High Q10 means strongly temperature-sensitive. For Ea = 75 kJ/mol at 25°C, Q10 ≈ 2.5, meaning the reaction rate increases 2.5× per 10°C. This explains why food spoils faster at room temperature than in the fridge." },
    { question: "How do rate constant time units affect results?", answer: "First-order k has units of 1/time. 1/sec = 60/min = 3600/hr. If your measurement is k = 0.06/min, that equals 0.001/sec. Both k and A must be in the same time units before applying the Arrhenius equation — this calculator handles conversion automatically." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Activation Energy Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Activation Energy Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[480px_1fr] gap-6 items-start max-w-[1200px]">
          {/* ── Inputs ── */}
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
              Single-point Arrhenius: <code className="font-mono font-semibold">Eₐ = −R · T · ln(k / A)</code>
            </div>

            {/* Temperature */}
            <div>
              <label className="text-base font-medium block mb-1.5">Temperature (T)</label>
              <div className="flex gap-2">
                <input type="number" value={T} onChange={e => setT(e.target.value)} className={inp} placeholder="e.g. 25" />
                <select value={Tunit} onChange={e => setTunit(e.target.value)} className={sel}>
                  {TEMP_UNITS.map(u => <option key={u.v} value={u.v}>{u.l}</option>)}
                </select>
              </div>
              {result && <div className="text-xs text-muted-foreground mt-1">= {fmt(result.T_K, 4)} K</div>}
            </div>

            {/* Rate coefficient k */}
            <div>
              <label className="text-base font-medium block mb-1.5">
                Reaction Rate Coefficient (k)
                <span className="ml-1 text-muted-foreground text-xs font-normal">1/[time]</span>
              </label>
              <div className="flex gap-2">
                <input type="number" value={k} onChange={e => setK(e.target.value)} className={inp} placeholder="e.g. 0.001" />
                <select value={kUnit} onChange={e => setKUnit(e.target.value)} className={sel}>
                  {TIME_UNITS.map(u => <option key={u.v} value={u.v}>{u.l}</option>)}
                </select>
              </div>
            </div>

            {/* Frequency factor A */}
            <div>
              <label className="text-base font-medium block mb-1.5">
                Frequency Factor (A)
                <span className="ml-1 text-muted-foreground text-xs font-normal">1/[time]</span>
              </label>
              <div className="flex gap-2">
                <input type="number" value={A} onChange={e => setA(e.target.value)} className={inp} placeholder="e.g. 1e13" />
                <select value={AUnit} onChange={e => setAUnit(e.target.value)} className={sel}>
                  {TIME_UNITS.map(u => <option key={u.v} value={u.v}>{u.l}</option>)}
                </select>
              </div>
              <div className="text-xs text-muted-foreground mt-1">Must be greater than k (A = theoretical max rate)</div>
            </div>

            {/* Ea output unit */}
            <div>
              <label className="text-base font-medium block mb-1.5">
                Activation Energy (Eₐ) — Output Unit
                <span className="ml-1 text-muted-foreground text-xs font-normal">/mol (fixed)</span>
              </label>
              <select value={EaUnit} onChange={e => setEaUnit(e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20 text-base">
                {ENERGY_UNITS.map(u => <option key={u} value={u}>{ENERGY_LABELS[u]}</option>)}
              </select>
            </div>

            <div className="flex gap-3">
              <button onClick={() => calculate()} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">Calculate</button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── Results ── */}
          <div className="space-y-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Activation Energy (Eₐ)</div>
                <div className="text-4xl font-bold text-primary">{fmt(result.EaDisplay, 4)} {EaUnit}/mol</div>
                <div className="text-sm text-muted-foreground mt-1">
                  = −8.314 × {fmt(result.T_K, 2)} × ln({result.k_ps.toExponential(3)}/{result.A_ps.toExponential(3)})
                </div>
              </div>

              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Eₐ in All Units (/mol)</h3>
                <table className="w-full text-base"><tbody>
                  {ENERGY_UNITS.map((u, i) => (
                    <tr key={i} className={`border-b last:border-0 ${u === EaUnit ? "bg-primary/5" : ""}`}>
                      <td className="py-2 text-muted-foreground">{ENERGY_LABELS[u]}/mol</td>
                      <td className="text-right font-medium font-mono">
                        {result.EaAll[u] >= 1e6 ? result.EaAll[u].toExponential(4) : fmt(result.EaAll[u], 4)}
                      </td>
                    </tr>
                  ))}
                </tbody></table>
              </div>

              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Arrhenius Parameters</h3>
                <table className="w-full text-base"><tbody>
                  {[
                    { label: "Temperature (T)", value: `${result.nT} ${result.rTu === "C" ? "°C" : result.rTu === "F" ? "°F" : "K"} = ${fmt(result.T_K, 4)} K` },
                    { label: "Rate constant k (/sec)", value: result.k_ps.toExponential(4) },
                    { label: "Frequency factor A (/sec)", value: result.A_ps.toExponential(4) },
                    { label: "k / A", value: (result.k_ps / result.A_ps).toExponential(4) },
                    { label: "ln(k / A)", value: fmt(Math.log(result.k_ps / result.A_ps), 6) },
                    { label: "Q10 (rate × per 10°C↑)", value: fmt(result.Q10, 4) },
                    { label: "Half-life (first-order)", value: result.hlStr },
                    { label: "Gas constant (R)", value: "8.314 J/(mol·K)" },
                  ].map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>

              {result.chartData.length > 1 && (
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-semibold mb-3">Rate Constant k vs Temperature (°C)</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={result.chartData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="T" tick={{ fontSize: 9 }} label={{ value: "T (°C)", position: "insideBottom", offset: -2, fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 9 }} />
                      <Tooltip formatter={(v: any) => [v, `k (1/${result.rku})`]} labelFormatter={(l) => `${l}°C`} />
                      <Line type="monotone" dataKey="k" stroke="#3b82f6" dot={false} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>)}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding Activation Energy in Chemical Kinetics</h2>
            <p>In the study of physical chemistry and chemical kinetics, activation energy is one of the most critical concepts governing how and why chemical reactions occur. At its core, activation energy represents the absolute minimum amount of extra energy required by a reacting molecule to get converted into a product. You can visualize it as a massive physical hill or a barrier that reactant molecules must successfully climb over before they can roll down the other side to become products. Even if a chemical reaction is thermodynamically favorable and releases a massive amount of energy (an exothermic reaction), it will not occur spontaneously if the reactant molecules do not possess enough kinetic energy to overcome this initial activation barrier. This explains why a piece of paper, which contains vast amounts of stored chemical energy, does not spontaneously burst into flames at room temperature; it requires the initial activation energy provided by a match or a lighter to begin the combustion process.</p>
            
            <p>Our activation energy calculator is designed to help students, researchers, and chemical engineers easily compute this critical energy barrier using the single-point form of the famous Arrhenius equation. By simply inputting the absolute temperature of the environment, the observed rate constant of the reaction, and the theoretical frequency factor (also known as the pre-exponential factor), this tool instantly computes the activation energy. It completely eliminates the tedious manual math and unit conversions that traditionally plague students in physical chemistry courses, allowing for rapid analysis of reaction kinetics under varying thermal conditions.</p>
            
            <h2 className="text-2xl font-bold mb-3">The Mathematics of the Arrhenius Equation</h2>
            <p>The mathematical foundation of this calculator is the Arrhenius equation, formulated by the Swedish chemist Svante Arrhenius in 1889. The equation elegantly links the rate constant of a chemical reaction to the absolute temperature of the system and the activation energy. The standard form of the equation is k = A × e^(−Eₐ/RT). In this equation, "k" represents the rate constant, which dictates how fast the reaction proceeds. "A" represents the frequency factor, which essentially measures how often molecules collide with the correct physical orientation to potentially react. The term "e" is Euler's number, the base of the natural logarithm. "Eₐ" is the activation energy we are trying to find. "R" is the universal gas constant, precisely valued at 8.314 Joules per mole-Kelvin. Finally, "T" represents the absolute temperature of the system measured strictly in Kelvin.</p>
            
            <p>To isolate and solve for the activation energy (Eₐ), we must manipulate this equation using natural logarithms. By taking the natural log of both sides, the equation transforms into a linear format: ln(k) = ln(A) − Eₐ/(RT). Through basic algebraic rearrangement, we can solve directly for the activation energy, yielding the formula: Eₐ = −R · T · ln(k / A). Alternatively, this can be written as Eₐ = R · T · ln(A / k) to avoid negative signs, since the frequency factor A must always be physically larger than the rate constant k. This rearranged, single-point formula is precisely what our calculator executes in the background. It takes your inputs, meticulously standardizes the time units, converts the temperature to Kelvin, applies the universal gas constant, and computes the exact energy barrier in Joules per mole before translating it into your preferred energy units.</p>
            
            <h2 className="text-2xl font-bold mb-3">The Significance of Temperature and Q10</h2>
            <p>Temperature plays a dominant, exponential role in chemical kinetics. Because the temperature variable (T) sits in the denominator of the negative exponent in the Arrhenius equation, even a tiny increase in absolute temperature can result in a massive, exponential increase in the rate constant (k). This occurs because increasing the thermal energy of a system vastly increases the fraction of molecules that possess enough kinetic energy to successfully overcome the activation energy barrier. As a general historical rule of thumb in organic chemistry, raising the temperature of a reaction by just 10 degrees Celsius will roughly double the speed of the reaction.</p>
            
            <p>This phenomenon is formally quantified by the Q10 temperature coefficient, which our calculator automatically computes for you. The Q10 value represents the precise factor by which the reaction rate increases when the temperature is raised by exactly 10 degrees Celsius. In biological systems and enzyme kinetics, the Q10 value typically hovers between 2.0 and 3.0. A higher Q10 value indicates a reaction that is hyper-sensitive to temperature changes, meaning it has a very high activation energy. This extreme temperature sensitivity explains a multitude of everyday phenomena, from why cold-blooded reptiles become sluggish in winter, to why placing fresh food in a cold refrigerator drastically slows down the bacterial metabolic reactions that cause spoilage.</p>
            
            <h2 className="text-2xl font-bold mb-3">Understanding the Frequency Factor (A)</h2>
            <p>A common point of confusion for students using the Arrhenius equation is the frequency factor, A. Also known as the pre-exponential factor, this variable represents the absolute theoretical maximum rate at which the reaction could occur if the activation energy was exactly zero, or if the temperature was infinitely high. In practical terms, it accounts for both the frequency of molecular collisions and the probability that those collisions occur with the correct geometric orientation to break existing bonds and form new ones.</p>
            
            <p>Because the frequency factor represents the maximum possible rate, it is a strict physical law that the observed rate constant (k) can never be larger than the frequency factor (A). The term e^(−Eₐ/RT) acts as a penalty fraction, always falling between zero and one, which scales down the maximum theoretical rate to the actual observed rate based on the temperature and energy barrier. If you attempt to enter a rate constant that is larger than your frequency factor into our calculator, the system will reject the calculation because it implies a negative activation energy, which violates the fundamental laws of thermodynamics for thermally activated reactions.</p>
            
            <h2 className="text-2xl font-bold mb-3">Navigating Units and Conversions</h2>
            <p>One of the primary benefits of using a dedicated activation energy calculator is avoiding the treacherous pitfalls of unit mismatch. The universal gas constant (R) is fixed at 8.314 J/(mol·K). Because this constant uses Joules and Kelvin, the temperature must always be converted to Kelvin before any math occurs, and the resulting activation energy will always be calculated initially in Joules per mole. Our calculator handles this seamlessly, allowing you to input temperature in Celsius or Fahrenheit while automatically performing the necessary +273.15 conversion to Kelvin in the background.</p>
            
            <p>Furthermore, the calculator provides the final activation energy in all standard scientific units simultaneously. While physicists and mechanical engineers typically prefer Joules (J) or kilojoules (kJ) per mole, biochemists and nutritionists often work exclusively in calories (cal) or kilocalories (kcal) per mole. By displaying the result across all formats—including megajoules (MJ) for highly energetic reactions like combustion—the calculator serves as an interdisciplinary tool bridging the gap between different scientific fields.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/activation-energy-calculator" />
          <PopularCalculators exclude="/calculator/activation-energy-calculator" />
        </div>
      </div>
    </>
  );
};

export default ActivationEnergyCalculator;
