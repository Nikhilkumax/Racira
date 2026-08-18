"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const M_PROTON = 1.007276466621; // u
const M_NEUTRON = 1.008664916; // u
const MEV_PER_U = 931.49410242; // MeV/u

interface MdResult {
  massDefect: number;
  bindingEnergyMeV: number;
  bindingEnergyPerNucleon: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmt(v: number, d = 4): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function calcMd(a: number, z: number, atomMass: number): MdResult {
  const n = a - z;
  const constituentMass = z * M_PROTON + n * M_NEUTRON;
  const massDefect = constituentMass - atomMass;
  const bindingEnergyMeV = massDefect * MEV_PER_U;
  const bindingEnergyPerNucleon = a > 0 ? bindingEnergyMeV / a : 0;
  const breakdown = [
    { label: "Atomic Mass Number (A)", value: `${a}` },
    { label: "Atomic Number (Z)", value: `${z}` },
    { label: "Neutron Count (N = A − Z)", value: `${n}` },
    { label: "Mass of Constituents (Z·mp + N·mn)", value: `${fmt(constituentMass, 6)} u` },
    { label: "Measured Atomic Mass", value: `${fmt(atomMass, 6)} u` },
    { label: "Mass Defect (Δm)", value: `${fmt(massDefect, 6)} u` },
    { label: "Binding Energy (E = Δm·c²)", value: `${fmt(bindingEnergyMeV)} MeV` },
    { label: "Binding Energy per Nucleon", value: `${fmt(bindingEnergyPerNucleon)} MeV/nucleon` },
  ];
  const summaryStats = [
    { label: "Mass Defect", value: `${fmt(massDefect, 6)} u` },
    { label: "Binding Energy", value: `${fmt(bindingEnergyMeV)} MeV` },
    { label: "Per Nucleon", value: `${fmt(bindingEnergyPerNucleon)} MeV` },
    { label: "Protons / Neutrons", value: `${z} / ${a - z}` },
  ];
  const chartData = [
    { name: "Constituents", value: Number(constituentMass.toFixed(5)), fill: "#f59e0b" },
    { name: "Nucleus (measured)", value: Number(atomMass.toFixed(5)), fill: "hsl(var(--primary))" },
  ];
  return { massDefect, bindingEnergyMeV, bindingEnergyPerNucleon, breakdown, summaryStats, chartData };
}

const DEFAULTS = { a: "4", z: "2", mass: "4.00260325413" };

export default function MassDefectCalculator() {
  const [a, setA] = useState(DEFAULTS.a);
  const [z, setZ] = useState(DEFAULTS.z);
  const [mass, setMass] = useState(DEFAULTS.mass);
  const [result, setResult] = useState<MdResult | null>(null);

  const aNum = parseFloat(a);
  const zNum = parseFloat(z);
  const massNum = parseFloat(mass);
  const errs: string[] = [];
  if (!aNum || aNum < 1 || !Number.isInteger(aNum)) errs.push("Atomic mass number A must be a positive integer.");
  if (zNum < 0 || zNum > aNum || !Number.isInteger(zNum)) errs.push("Atomic number Z must be an integer between 0 and A.");
  if (!massNum || massNum <= 0) errs.push("Measured atomic mass (u) must be greater than 0.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcMd(aNum, zNum, massNum)); };
  const reset = () => {
    setA(DEFAULTS.a); setZ(DEFAULTS.z); setMass(DEFAULTS.mass);
    setResult(calcMd(4, 2, 4.00260325413));
  };
  useEffect(() => { setResult(calcMd(4, 2, 4.00260325413)); }, []);

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is mass defect?", answer: "The mass of an atomic nucleus is always slightly less than the sum of its protons and neutrons. That missing mass, Δm, is the mass defect — the amount converted into binding energy when the nucleus formed, per E = mc²." },
    { question: "Why does the nucleus weigh less than its parts?", answer: "Binding the nucleons together releases energy, and because energy and mass are equivalent, the bound nucleus loses mass. The stronger the binding, the bigger the defect — which is why iron (highest binding energy per nucleon) is the fusion/fission endpoint." },
    { question: "How is binding energy calculated?", answer: "Multiply the mass defect in atomic mass units by the conversion factor 931.494 MeV/u. Dividing by the mass number A gives binding energy per nucleon, the standard metric for nuclear stability." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Mass Defect Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Mass Defect Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={lbl}>Mass Number (A)</label>
                <input type="number" value={a} onChange={e => setA(e.target.value)} className={inp} placeholder="4" />
              </div>
              <div>
                <label className={lbl}>Atomic Number (Z)</label>
                <input type="number" value={z} onChange={e => setZ(e.target.value)} className={inp} placeholder="2" />
              </div>
              <div>
                <label className={lbl}>Atomic Mass (u)</label>
                <input type="number" step="any" value={mass} onChange={e => setMass(e.target.value)} className={inp} placeholder="4.00260" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Helium-4: A=4, Z=2, mass 4.00260 u. Carbon-12: 12, 6, 12.00000 u.</p>
            {errs.length > 0 && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">{errs[0]}</div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} disabled={!valid} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${valid ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Binding Energy</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt(result.bindingEnergyMeV)} MeV</div>
                <div className="text-sm text-muted-foreground mt-1">Mass defect {fmt(result.massDefect, 6)} u · {fmt(result.bindingEnergyPerNucleon)} MeV/nucleon</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Mass Defect", `${fmt(result.massDefect, 6)} u`], ["Per Nucleon", `${fmt(result.bindingEnergyPerNucleon)} MeV`], ["Nucleons", `${result.breakdown[0].value.split(" ")[0]}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Calculation Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 5 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 5 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 5 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Constituents vs Nucleus</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [fmt(v, 6) + " u", ""]} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">The gap between the bars is the mass converted to binding energy</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Where Does Nuclear Energy Come From?</h2>
            <p>Weigh a nucleus and weigh its parts separately, and the nucleus always comes up short. That shortfall is the <strong>mass defect</strong> — mass that became binding energy when the protons and neutrons were fused together. This <strong>mass defect calculator</strong> finds it and converts it to energy.</p>
            <h2 className="text-2xl font-bold mb-3">The Numbers</h2>
            <p>Protons weigh 1.007276466621 u and neutrons 1.008664916 u. Sum the constituents, subtract the measured atomic mass, and multiply the difference by 931.494 MeV/u — the energy locked in each atomic mass unit. Dividing by A gives the binding energy per nucleon, the curve that peaks at iron-56.</p>
            <h2 className="text-2xl font-bold mb-3">Why It Matters</h2>
            <p>Nuclei lighter than iron gain energy by fusing (stars), heavier ones by splitting (reactors). The mass defect quantifies both: it is the exact energy released, and it explains why fission and fusion dwarf any chemical reaction.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/mass-defect-calculator" />
          <PopularCalculators exclude="/calculator/mass-defect-calculator" />
        </div>
      </div>
    </>
  );
}
