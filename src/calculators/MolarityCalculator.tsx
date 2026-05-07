"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FAQSection from "@/components/FAQSection";

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
    { question: "What is the dilution equation?", answer: "C₁V₁ = C₂V₂, where C is concentration and V is volume. It calculates the new concentration or volume when diluting a solution." },
    { question: "How do I calculate moles from mass?", answer: "Moles = mass (g) / molar mass (g/mol). For example, 36 g of water (molar mass 18 g/mol) = 2 moles." },
  ];

  return (
    <>
<Breadcrumb items={[
        { label: "Home", href: "/" },
        { label: "Science & Engineering", href: "/calculator" },
        { label: "Molarity Calculator" }
      ]} />

      <div className="calculator-container">
        <h1 className="calculator-title">Molarity Calculator</h1>
        <p className="calculator-subtitle">Calculate solution concentration and dilution.</p>

        <Card className="calculator-card">
          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Mode</label>
              <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
                    <label htmlFor="massG" className="text-sm font-medium text-foreground mb-1.5 block">Mass of Solute</label>
                    <div className="relative">
                      <input id="massG" type="number" value={massG} onChange={e => setMassG(e.target.value)} className="input-calc pr-10" placeholder="0" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">g</span>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="molarMass" className="text-sm font-medium text-foreground mb-1.5 block">Molar Mass</label>
                    <div className="relative">
                      <input id="molarMass" type="number" value={molarMass} onChange={e => setMolarMass(e.target.value)} className="input-calc pr-16" placeholder="0" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">g/mol</span>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="moles" className="text-sm font-medium text-foreground mb-1.5 block">Moles (or calculated)</label>
                    <div className="relative">
                      <input id="moles" type="number" value={moles} onChange={e => setMoles(e.target.value)} className="input-calc pr-14" placeholder="0" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">mol</span>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="volumeL" className="text-sm font-medium text-foreground mb-1.5 block">Volume of Solution</label>
                    <div className="relative">
                      <input id="volumeL" type="number" value={volumeL} onChange={e => setVolumeL(e.target.value)} className="input-calc pr-10" placeholder="0" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">L</span>
                    </div>
                  </div>
                </div>

                {molRes && (
                  <div className="grid sm:grid-cols-2 gap-3 mt-4">
                    <div className="result-card">
                      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Molarity</p>
                      <p className="text-xl font-bold text-[hsl(217,91%,40%)] dark:text-primary">{molRes.molarity.toFixed(4)} M</p>
                    </div>
                    <div className="result-card">
                      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Moles</p>
                      <p className="text-xl font-bold text-foreground">{molRes.moles.toFixed(4)} mol</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {mode === "dilution" && (
              <>
                <p className="text-xs text-muted-foreground">Leave one field empty to solve for it.</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="c1" className="text-sm font-medium text-foreground mb-1.5 block">C₁ (Initial Concentration)</label>
                    <div className="relative">
                      <input id="c1" type="number" value={c1} onChange={e => setC1(e.target.value)} className="input-calc pr-10" placeholder="?" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">M</span>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="v1" className="text-sm font-medium text-foreground mb-1.5 block">V₁ (Initial Volume)</label>
                    <div className="relative">
                      <input id="v1" type="number" value={v1} onChange={e => setV1(e.target.value)} className="input-calc pr-10" placeholder="?" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">L</span>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="c2" className="text-sm font-medium text-foreground mb-1.5 block">C₂ (Final Concentration)</label>
                    <div className="relative">
                      <input id="c2" type="number" value={c2} onChange={e => setC2(e.target.value)} className="input-calc pr-10" placeholder="?" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">M</span>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="v2" className="text-sm font-medium text-foreground mb-1.5 block">V₂ (Final Volume)</label>
                    <div className="relative">
                      <input id="v2" type="number" value={v2} onChange={e => setV2(e.target.value)} className="input-calc pr-10" placeholder="?" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">L</span>
                    </div>
                  </div>
                </div>

                {dilRes && (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                    <div className="result-card">
                      <p className="text-xs text-muted-foreground mb-1 uppercase">C₁</p>
                      <p className={`text-xl font-bold ${dilRes.solved === "c1" ? "text-[hsl(217,91%,40%)] dark:text-primary" : "text-foreground"}`}>{dilRes.c1.toFixed(4)} M</p>
                    </div>
                    <div className="result-card">
                      <p className="text-xs text-muted-foreground mb-1 uppercase">V₁</p>
                      <p className={`text-xl font-bold ${dilRes.solved === "v1" ? "text-[hsl(217,91%,40%)] dark:text-primary" : "text-foreground"}`}>{dilRes.v1.toFixed(4)} L</p>
                    </div>
                    <div className="result-card">
                      <p className="text-xs text-muted-foreground mb-1 uppercase">C₂</p>
                      <p className={`text-xl font-bold ${dilRes.solved === "c2" ? "text-[hsl(217,91%,40%)] dark:text-primary" : "text-foreground"}`}>{dilRes.c2.toFixed(4)} M</p>
                    </div>
                    <div className="result-card">
                      <p className="text-xs text-muted-foreground mb-1 uppercase">V₂</p>
                      <p className={`text-xl font-bold ${dilRes.solved === "v2" ? "text-[hsl(217,91%,40%)] dark:text-primary" : "text-foreground"}`}>{dilRes.v2.toFixed(4)} L</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>

        <FAQSection faqs={faqs} pageUrl="https://raciracalculator.lovable.app/molarity-calculator" />
      </div>
    </>
  );
};

export default MolarityCalculator;

