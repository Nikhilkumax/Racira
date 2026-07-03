"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const sci = (n: number) => Math.abs(n) < 0.01 || Math.abs(n) > 99999 ? n.toExponential(3) : fmt(n);
const AMU = 931.494; // MeV per amu

const ELEMENTS: Record<string, { Z: number; A: number; mass: number }> = {
  "Hydrogen-1": { Z: 1, A: 1, mass: 1.007825 },
  "Helium-4": { Z: 2, A: 4, mass: 4.002602 },
  "Carbon-12": { Z: 6, A: 12, mass: 12.000000 },
  "Nitrogen-14": { Z: 7, A: 14, mass: 14.003074 },
  "Oxygen-16": { Z: 8, A: 16, mass: 15.994915 },
  "Iron-56": { Z: 26, A: 56, mass: 55.934937 },
  "Uranium-235": { Z: 92, A: 235, mass: 235.043930 },
  "Uranium-238": { Z: 92, A: 238, mass: 238.050788 },
};

const MP = 1.007276; // proton mass in amu
const MN = 1.008665; // neutron mass in amu

const BindingEnergyCalculator = () => {
  const DEFAULTS = { element: "Helium-4" };
  const [element, setElement] = useState(DEFAULTS.element);
  const [customZ, setCustomZ] = useState("");
  const [customA, setCustomA] = useState("");
  const [customMass, setCustomMass] = useState("");
  const [result, setResult] = useState<any>(null);

  const calculate = (el = element, cz = customZ, ca = customA, cm = customMass) => {
    let Z: number, A: number, atomicMass: number;
    if (el === "Custom") {
      Z = parseInt(cz) || 0;
      A = parseInt(ca) || 0;
      atomicMass = parseFloat(cm) || 0;
      if (Z <= 0 || A <= 0 || A < Z || atomicMass <= 0) return;
    } else {
      const e = ELEMENTS[el];
      if (!e) return;
      Z = e.Z; A = e.A; atomicMass = e.mass;
    }
    const N = A - Z;
    const constituentMass = Z * MP + N * MN;
    const massDefect = constituentMass - atomicMass;
    const totalBE = massDefect * AMU;
    const bePerNucleon = totalBE / A;
    const chartData = Object.entries(ELEMENTS).map(([name, e]) => {
      const n = e.A - e.Z;
      const md = e.Z * MP + n * MN - e.mass;
      return { name: name.split("-")[0], bePerA: parseFloat((md * AMU / e.A).toFixed(3)) };
    });
    setResult({ Z, A, N, atomicMass, constituentMass, massDefect, totalBE, bePerNucleon, chartData, el });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => { setElement(DEFAULTS.element); setCustomZ(""); setCustomA(""); setCustomMass(""); calculate(DEFAULTS.element); };

  const faqs = [
    { question: "What is nuclear binding energy?", answer: "Nuclear binding energy is the energy required to disassemble a nucleus into its constituent protons and neutrons. It arises from the mass defect — the nucleus weighs less than its separate components. This 'missing' mass is converted to binding energy via E = mc². Higher binding energy per nucleon means a more stable nucleus." },
    { question: "What is the binding energy formula?", answer: "BE = Δm × 931.494 MeV/amu, where Δm = (Z × m_proton + N × m_neutron) − m_nucleus. For Helium-4: Δm = (2 × 1.007276 + 2 × 1.008665) − 4.002602 = 0.030280 amu. BE = 0.030280 × 931.494 = 28.22 MeV. Per nucleon: 28.22/4 = 7.06 MeV." },
    { question: "What is the mass defect?", answer: "Mass defect is the difference between the total mass of individual nucleons and the actual nuclear mass. It represents the mass converted to energy (E = mc²) when nucleons bind together. For Helium-4: Δm = 0.03028 amu — about 0.7% of the total mass is 'missing,' converted to 28.22 MeV of binding energy." },
    { question: "Which nucleus has the highest binding energy per nucleon?", answer: "Iron-56 and Nickel-62 have the highest binding energy per nucleon (~8.79 MeV). This is why iron is the endpoint of stellar nucleosynthesis — fusing heavier elements requires energy input rather than releasing it. Elements lighter than iron release energy by fusion; elements heavier release energy by fission." },
    { question: "How does binding energy relate to nuclear power?", answer: "Nuclear fission (splitting heavy nuclei like U-235) and fusion (combining light nuclei like H into He) both move nuclei toward the iron peak of the binding energy curve. Fission of U-235 releases ~200 MeV per event. Fusion of 4H → He releases ~26.7 MeV. Both processes convert mass defect into usable energy." },
    { question: "What is the semi-empirical mass formula?", answer: "The Bethe-Weizsäcker formula approximates nuclear binding energy: BE = a_V×A − a_S×A^(2/3) − a_C×Z²/A^(1/3) − a_A×(A−2Z)²/A ± δ. Terms represent: volume energy (strong force), surface energy (surface nucleons have fewer neighbors), Coulomb repulsion (protons repel), asymmetry energy (N≈Z is optimal), and pairing energy." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Binding Energy Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Nuclear Binding Energy Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px]">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Element / Isotope</label>
              <select value={element} onChange={(e) => { setElement(e.target.value); calculate(e.target.value, customZ, customA, customMass); }} className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                {Object.keys(ELEMENTS).map((el) => <option key={el} value={el}>{el}</option>)}
                <option value="Custom">Custom Isotope</option>
              </select>
            </div>
            {element === "Custom" && (<>
              <div>
                <label className="text-base font-medium block mb-1.5">Proton Number (Z)</label>
                <input type="number" value={customZ} onChange={(e) => setCustomZ(e.target.value)} className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="2" min="1" />
              </div>
              <div>
                <label className="text-base font-medium block mb-1.5">Mass Number (A)</label>
                <input type="number" value={customA} onChange={(e) => setCustomA(e.target.value)} className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="4" min="1" />
              </div>
              <div>
                <label className="text-base font-medium block mb-1.5">Atomic Mass (amu)</label>
                <input type="text" value={customMass} onChange={(e) => setCustomMass(e.target.value)} className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="4.002602" />
              </div>
            </>)}
            <div className="flex gap-3">
              <button onClick={() => calculate(element, customZ, customA, customMass)} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">Calculate</button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Total Binding Energy — {result.el}</div>
                <div className="text-4xl font-bold text-primary">{fmt(result.totalBE, 2)} <span className="text-xl">MeV</span></div>
                <div className="text-sm text-muted-foreground mt-1">{fmt(result.bePerNucleon, 3)} MeV/nucleon • Z={result.Z}, N={result.N}, A={result.A}</div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Nuclear Data</h3>
                <table className="w-full text-base"><tbody>
                  {[
                    { label: "Protons (Z)", value: String(result.Z) },
                    { label: "Neutrons (N)", value: String(result.N) },
                    { label: "Mass Number (A)", value: String(result.A) },
                    { label: "Atomic Mass", value: `${fmt(result.atomicMass, 6)} amu` },
                    { label: "Constituent Mass", value: `${fmt(result.constituentMass, 6)} amu` },
                    { label: "Mass Defect (Δm)", value: `${fmt(result.massDefect, 6)} amu` },
                    { label: "Total Binding Energy", value: `${fmt(result.totalBE, 2)} MeV` },
                    { label: "BE per Nucleon", value: `${fmt(result.bePerNucleon, 3)} MeV` },
                  ].map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Binding Energy per Nucleon — Elements</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} label={{ value: "MeV/A", angle: -90, position: "insideLeft", fontSize: 10 }} />
                    <Tooltip formatter={(v: any) => `${Number(v).toFixed(3)} MeV/nucleon`} />
                    <Bar dataKey="bePerA" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-base font-semibold mb-4">Summary</h3>
                <div className="space-y-3">
                  {[
                    { label: "Mass Defect", value: `${fmt(result.massDefect, 6)} amu` },
                    { label: "Total BE", value: `${fmt(result.totalBE, 2)} MeV` },
                    { label: "BE/Nucleon", value: `${fmt(result.bePerNucleon, 3)} MeV`, border: true, bold: true },
                  ].map((s: any, i) => (
                    <div key={i} className={`flex justify-between text-base ${s.border ? "border-t pt-3" : ""}`}>
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className={s.bold ? "font-bold text-primary" : "font-medium"}>{s.value}</span>
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
            <h2>What Is a Binding Energy Calculator?</h2>
            <p>A nuclear binding energy calculator computes the energy holding a nucleus together — the energy required to completely separate all protons and neutrons. Pre-filled with Helium-4 (the alpha particle), the total binding energy is 28.22 MeV with 7.06 MeV per nucleon. This calculator uses precise atomic masses and {"Einstein's"} mass-energy equivalence (E = mc²) to derive binding energies for 8 common isotopes plus custom inputs.</p>
            <h2>Mass-Energy Equivalence</h2>
            <p><strong>E = Δm × c²</strong>, where Δm is the mass defect in atomic mass units (amu). 1 amu = 931.494 MeV/c². The mass defect is the difference between the sum of individual nucleon masses and the actual nuclear mass. This {"'missing'"} mass has been converted to binding energy — the {"'glue'"} holding the nucleus together via the strong nuclear force.</p>
            <h2>The Binding Energy Curve</h2>
            <p>The binding energy per nucleon curve peaks at Iron-56/Nickel-62 (~8.79 MeV/nucleon). Light nuclei (H, He, Li) have lower BE/nucleon and release energy through fusion (moving up the curve). Heavy nuclei (U, Pu) also have lower BE/nucleon and release energy through fission (moving down toward iron). This curve explains why iron is the endpoint of stellar nucleosynthesis and the most abundant heavy element in the universe.</p>
            <h2>Nuclear Fusion</h2>
            <p>Fusion combines light nuclei to form heavier, more tightly bound nuclei. The most energetically favorable reaction: 4¹H → ⁴He + 2e⁺ + 2ν + 26.7 MeV. This powers the Sun and all main-sequence stars. Hydrogen bombs use the D-T reaction: ²H + ³H → ⁴He + n + 17.6 MeV. Controlled fusion reactors (ITER, tokamaks) aim to harness this reaction for clean energy production.</p>
            <h2>Nuclear Fission</h2>
            <p>Fission splits heavy nuclei into lighter, more tightly bound fragments. U-235 + n → fission products + 2-3n + ~200 MeV. The released neutrons can trigger chain reactions — the basis of nuclear reactors and weapons. Each U-235 fission releases ~200 MeV vs ~4 eV per chemical reaction — nuclear energy is ~50 million times more energy-dense than chemical energy per atom.</p>
            <h2>Stellar Nucleosynthesis</h2>
            <p>Stars fuse progressively heavier elements: H → He (main sequence), He → C,O (red giant), then C → Ne → O → Si → Fe in massive stars. Each stage releases energy because BE/nucleon increases. Fusion beyond iron requires energy input, so iron accumulates in the core. When the iron core exceeds the Chandrasekhar limit (~1.4 solar masses), it collapses — triggering a supernova that synthesizes all elements heavier than iron via rapid neutron capture (r-process).</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/binding-energy-calculator" />
          <PopularCalculators exclude="/calculator/binding-energy-calculator" />
        </div>
      </div>
    </>
  );
};

export default BindingEnergyCalculator;
