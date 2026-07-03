"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Mode = "molarity" | "dilution";

const MolarityCalculator = () => {
  const [mode, setMode] = useState<Mode>("molarity");

  // Molarity mode
  const [moles, setMoles] = useState("");
  const [volumeL, setVolumeL] = useState("");
  const [massG, setMassG] = useState("");
  const [molarMass, setMolarMass] = useState("");

  // Dilution mode (C1V1 = C2V2)
  const [c1, setC1] = useState("");
  const [v1, setV1] = useState("");
  const [c2, setC2] = useState("");
  const [v2, setV2] = useState("");

  const molarityResult = () => {
    if (massG && molarMass && volumeL) {
      const m = parseFloat(massG);
      const mm = parseFloat(molarMass);
      const v = parseFloat(volumeL);
      if (mm > 0 && v > 0) {
        const mol = m / mm;
        const M = mol / v;
        return { molarity: M, moles: mol };
      }
    }
    if (moles && volumeL) {
      const n = parseFloat(moles);
      const v = parseFloat(volumeL);
      if (v > 0) return { molarity: n / v, moles: n };
    }
    return null;
  };

  const dilutionResult = () => {
    const vals = [parseFloat(c1), parseFloat(v1), parseFloat(c2), parseFloat(v2)];
    const missing = vals.map((v, i) => isNaN(v) ? i : -1).filter(i => i !== -1);
    if (missing.length !== 1) return null;

    const [C1, V1, C2, V2] = vals;
    switch (missing[0]) {
      case 0: return { c1: (C2 * V2) / V1, v1: V1, c2: C2, v2: V2, solved: "c1" };
      case 1: return { c1: C1, v1: (C2 * V2) / C1, c2: C2, v2: V2, solved: "v1" };
      case 2: return { c1: C1, v1: V1, c2: (C1 * V1) / V2, v2: V2, solved: "c2" };
      case 3: return { c1: C1, v1: V1, c2: C2, v2: (C1 * V1) / C2, solved: "v2" };
    }
    return null;
  };

  const molRes = mode === "molarity" ? molarityResult() : null;
  const dilRes = mode === "dilution" ? dilutionResult() : null;

  const faqs = [
    { question: "What is molarity?", answer: "Molarity (M) is the number of moles of solute per liter of solution. It is the most common measure of solution concentration in chemistry." },
    { question: "What is the dilution equation?", answer: "C\u2081V\u2081 = C\u2082V\u2082, where C is concentration and V is volume. It calculates the new concentration or volume when diluting a solution." },
    { question: "How do I calculate moles from mass?", answer: "Moles = mass (g) / molar mass (g/mol). For example, 36 g of water (molar mass 18 g/mol) = 2 moles." },
  ];

  return (
    <>
      <Breadcrumb items={[
        { label: "Home", href: "/" },
        { label: "Calculators", href: "/calculator" },
        { label: "Molarity Calculator" }
      ]} />

      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Molarity Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* Inputs */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div>
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Mode</label>
              <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
                <SelectTrigger className="input-calc"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="molarity">Molarity (M = n / V)</SelectItem>
                  <SelectItem value="dilution">Dilution (C₁V₁ = C₂V₂)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {mode === "molarity" && (
              <>
                <p className="text-xs text-muted-foreground">Enter moles + volume, or mass + molar mass + volume.</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="massG" className="text-sm font-medium text-foreground mb-1 block">Mass of Solute</label>
                    <div className="relative">
                      <input id="massG" type="number" value={massG} onChange={e => setMassG(e.target.value)} className="input-calc pr-10" placeholder="0" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">g</span>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="molarMass" className="text-sm font-medium text-foreground mb-1 block">Molar Mass</label>
                    <div className="relative">
                      <input id="molarMass" type="number" value={molarMass} onChange={e => setMolarMass(e.target.value)} className="input-calc pr-16" placeholder="0" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">g/mol</span>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="moles" className="text-sm font-medium text-foreground mb-1 block">Moles</label>
                    <div className="relative">
                      <input id="moles" type="number" value={moles} onChange={e => setMoles(e.target.value)} className="input-calc pr-14" placeholder="0" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">mol</span>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="volumeL" className="text-sm font-medium text-foreground mb-1 block">Volume of Solution</label>
                    <div className="relative">
                      <input id="volumeL" type="number" value={volumeL} onChange={e => setVolumeL(e.target.value)} className="input-calc pr-10" placeholder="0" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">L</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {mode === "dilution" && (
              <>
                <p className="text-xs text-muted-foreground">Leave one field empty to solve for it.</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="c1" className="text-sm font-medium text-foreground mb-1 block">C₁ (Initial Conc.)</label>
                    <div className="relative">
                      <input id="c1" type="number" value={c1} onChange={e => setC1(e.target.value)} className="input-calc pr-10" placeholder="?" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">M</span>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="v1" className="text-sm font-medium text-foreground mb-1 block">V₁ (Initial Volume)</label>
                    <div className="relative">
                      <input id="v1" type="number" value={v1} onChange={e => setV1(e.target.value)} className="input-calc pr-10" placeholder="?" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">L</span>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="c2" className="text-sm font-medium text-foreground mb-1 block">C₂ (Final Conc.)</label>
                    <div className="relative">
                      <input id="c2" type="number" value={c2} onChange={e => setC2(e.target.value)} className="input-calc pr-10" placeholder="?" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">M</span>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="v2" className="text-sm font-medium text-foreground mb-1 block">V₂ (Final Volume)</label>
                    <div className="relative">
                      <input id="v2" type="number" value={v2} onChange={e => setV2(e.target.value)} className="input-calc pr-10" placeholder="?" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">L</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Results */}
          <div className="flex flex-col gap-3">
            {molRes && (
              <>
                <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                  <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Molarity</p>
                  <p className="text-5xl font-black text-foreground">{molRes.molarity.toFixed(4)} <span className="text-2xl">M</span></p>
                </div>
                <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Moles of Solute</p>
                  <p className="text-3xl font-black text-foreground">{molRes.moles.toFixed(4)} mol</p>
                </div>
              </>
            )}
            {dilRes && (
              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Dilution Result (C₁V₁ = C₂V₂)</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-3 rounded-xl border ${dilRes.solved === "c1" ? "bg-primary/10 border-primary/30" : "bg-secondary/30 border-border"}`}>
                    <p className="text-xs text-muted-foreground uppercase">C₁</p>
                    <p className="text-xl font-bold text-foreground">{dilRes.c1.toFixed(4)} M</p>
                  </div>
                  <div className={`p-3 rounded-xl border ${dilRes.solved === "v1" ? "bg-primary/10 border-primary/30" : "bg-secondary/30 border-border"}`}>
                    <p className="text-xs text-muted-foreground uppercase">V₁</p>
                    <p className="text-xl font-bold text-foreground">{dilRes.v1.toFixed(4)} L</p>
                  </div>
                  <div className={`p-3 rounded-xl border ${dilRes.solved === "c2" ? "bg-primary/10 border-primary/30" : "bg-secondary/30 border-border"}`}>
                    <p className="text-xs text-muted-foreground uppercase">C₂</p>
                    <p className="text-xl font-bold text-foreground">{dilRes.c2.toFixed(4)} M</p>
                  </div>
                  <div className={`p-3 rounded-xl border ${dilRes.solved === "v2" ? "bg-primary/10 border-primary/30" : "bg-secondary/30 border-border"}`}>
                    <p className="text-xs text-muted-foreground uppercase">V₂</p>
                    <p className="text-xl font-bold text-foreground">{dilRes.v2.toFixed(4)} L</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding Molarity and Solution Chemistry</h2>
            <p>Molarity is the most widely used measure of concentration in chemistry. It tells you how many moles of a dissolved substance (solute) are present in exactly one liter of solution.</p>
            <h3>The Molarity Formula</h3>
            <p>Molarity (M) = moles of solute / liters of solution. If you know the mass and molar mass of the solute, you can first convert: moles = mass (g) / molar mass (g/mol).</p>
            <h3>Dilution Equation (C₁V₁ = C₂V₂)</h3>
            <p>When you dilute a solution, the amount of solute stays constant even though the volume increases. This relationship is captured by C₁V₁ = C₂V₂. Leave any one variable unknown and this calculator will solve for it.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/molarity-calculator" />
          <PopularCalculators exclude="/calculator/molarity-calculator" />
        </div>
      </div>
    </>
  );
};

export default MolarityCalculator;
