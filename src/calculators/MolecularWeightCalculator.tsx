"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, Beaker } from "lucide-react";

// Simplified Periodic Table for Molecular Weight
// Element Symbol -> Atomic Mass (g/mol)
const periodicTable: Record<string, number> = {
  "H": 1.008, "He": 4.0026, "Li": 6.94, "Be": 9.0122, "B": 10.81, "C": 12.011, "N": 14.007, "O": 15.999,
  "F": 18.998, "Ne": 20.180, "Na": 22.990, "Mg": 24.305, "Al": 26.982, "Si": 28.085, "P": 30.974, "S": 32.06,
  "Cl": 35.45, "Ar": 39.95, "K": 39.098, "Ca": 40.078, "Sc": 44.956, "Ti": 47.867, "V": 50.942, "Cr": 51.996,
  "Mn": 54.938, "Fe": 55.845, "Co": 58.933, "Ni": 58.693, "Cu": 63.546, "Zn": 65.38, "Ga": 69.723, "Ge": 72.630,
  "As": 74.922, "Se": 78.971, "Br": 79.904, "Kr": 83.798, "Rb": 85.468, "Sr": 87.62, "Y": 88.906, "Zr": 91.224,
  "Nb": 92.906, "Mo": 95.95, "Ru": 101.07, "Rh": 102.91, "Pd": 106.42, "Ag": 107.87, "Cd": 112.41, "In": 114.82,
  "Sn": 118.71, "Sb": 121.76, "Te": 127.60, "I": 126.90, "Xe": 131.29, "Cs": 132.91, "Ba": 137.33, "La": 138.91,
  "Ce": 140.12, "Pr": 140.91, "Nd": 144.24, "Sm": 150.36, "Eu": 151.96, "Gd": 157.25, "Tb": 158.93, "Dy": 162.50,
  "Ho": 164.93, "Er": 167.26, "Tm": 168.93, "Yb": 173.05, "Lu": 174.97, "Hf": 178.49, "Ta": 180.95, "W": 183.84,
  "Re": 186.21, "Os": 190.23, "Ir": 192.22, "Pt": 195.08, "Au": 196.97, "Hg": 200.59, "Tl": 204.38, "Pb": 207.2,
  "Bi": 208.98, "Th": 232.04, "Pa": 231.04, "U": 238.03
};

interface ElementBreakdown {
  symbol: string;
  count: number;
  massPerMole: number;
  totalMass: number;
  percentage: number;
}

interface MolWeightResult {
  formula: string;
  totalWeight: number;
  breakdown: ElementBreakdown[];
  isError: boolean;
  errorMsg?: string;
}

const parseFormula = (formulaStr: string): MolWeightResult | null => {
  const formula = formulaStr.replace(/\s+/g, "");
  if (!formula) return null;

  try {
    const breakdownMap: Record<string, number> = {};
    
    // Parse formula using regex
    // Looks for an element (uppercase followed by optional lowercase)
    // followed by an optional number (count)
    const regex = /([A-Z][a-z]?)([0-9]*)/g;
    let match;
    let validFormulaLength = 0;
    
    // Check for invalid characters (anything not A-Z, a-z, 0-9)
    if (/[^A-Za-z0-9]/.test(formula)) {
      return { formula, totalWeight: 0, breakdown: [], isError: true, errorMsg: "Invalid characters in formula. Do not use parentheses." };
    }

    while ((match = regex.exec(formula)) !== null) {
      validFormulaLength += match[0].length;
      const symbol = match[1];
      const count = match[2] === "" ? 1 : parseInt(match[2], 10);

      if (!periodicTable[symbol]) {
        return { formula, totalWeight: 0, breakdown: [], isError: true, errorMsg: `Unknown element symbol: '${symbol}'` };
      }

      breakdownMap[symbol] = (breakdownMap[symbol] || 0) + count;
    }

    if (validFormulaLength !== formula.length) {
      return { formula, totalWeight: 0, breakdown: [], isError: true, errorMsg: "Invalid formula format." };
    }

    let totalWeight = 0;
    const breakdownArray: ElementBreakdown[] = [];

    for (const [symbol, count] of Object.entries(breakdownMap)) {
      const massPerMole = periodicTable[symbol];
      const totalElementMass = massPerMole * count;
      totalWeight += totalElementMass;
      breakdownArray.push({
        symbol,
        count,
        massPerMole,
        totalMass: totalElementMass,
        percentage: 0 // Will calc after total is known
      });
    }

    breakdownArray.forEach(el => {
      el.percentage = (el.totalMass / totalWeight) * 100;
    });

    // Sort by mass contribution descending
    breakdownArray.sort((a, b) => b.totalMass - a.totalMass);

    return {
      formula,
      totalWeight,
      breakdown: breakdownArray,
      isError: false
    };

  } catch (err) {
    return { formula, totalWeight: 0, breakdown: [], isError: true, errorMsg: "Error parsing formula." };
  }
};

const MolecularWeightCalculator = () => {
  const [inputVal, setInputVal] = useState("C6H12O6"); // Glucose
  const [result, setResult] = useState<MolWeightResult | null>(null);

  const calculate = () => {
    setResult(parseFormula(inputVal));
  };

  useEffect(() => { calculate(); }, []);

  const reset = () => {
    setInputVal("C6H12O6");
    setResult(parseFormula("C6H12O6"));
  };

  const wrap = "flex items-center rounded-md border border-input bg-background h-12 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-4 text-lg bg-transparent outline-none border-none text-foreground font-mono tracking-wider";

  const faqs = [
    { question: "What is Molecular Weight?", answer: "Molecular weight (also called molar mass) is the mass of one mole of a specific molecule. It is calculated by adding up the atomic masses of all the individual atoms that make up the molecule." },
    { question: "What is the unit g/mol?", answer: "g/mol stands for Grams per Mole. A 'Mole' is a standard scientific unit that represents exactly 6.022 × 10²³ atoms or molecules (Avogadro's Number). So, if the molecular weight of Water (H2O) is 18.01 g/mol, it means that 6.022 × 10²³ molecules of water weigh exactly 18.01 grams." },
    { question: "How is it calculated?", answer: "Look at the chemical formula, like H2O (Water). It has 2 Hydrogen atoms and 1 Oxygen atom. The atomic mass of Hydrogen is 1.008, and Oxygen is 15.999. You multiply the mass of each element by its count, then add them together: (2 × 1.008) + (1 × 15.999) = 18.015 g/mol." },
    { question: "Does case matter in the formula?", answer: "Yes, case is critically important in chemistry. 'Co' is Cobalt (one element), whereas 'CO' is Carbon Monoxide (one Carbon, one Oxygen). Always capitalize the first letter of an element, and use lowercase for the second letter if it has one." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Molecular Weight Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Molecular Weight Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5 flex justify-between">
                <span>Chemical Formula</span>
              </label>
              <div className={wrap}><input type="text" value={inputVal} onChange={e => setInputVal(e.target.value)} className={ci} placeholder="e.g. H2O, C6H12O6" /></div>
              <div className="text-xs text-muted-foreground mt-2 space-y-1">
                <p>• Case matters (e.g. use <strong>Na</strong> not <strong>NA</strong> or <strong>na</strong>).</p>
                <p>• Do not use parentheses/brackets.</p>
                <p>• Numbers specify the atom count (e.g. O2 = 2 Oxygen).</p>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-12 text-lg transition-all active:scale-[0.98] shadow-sm">
                <Beaker className="h-5 w-5" /> Calculate Mass
              </button>
              <button type="button" onClick={reset} className="w-12 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-12 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && result.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5 flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Formula Error</div>
                  <div className="text-base font-medium text-foreground">{result.errorMsg}</div>
                </div>
              </div>
            ) : result && (<>
              
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-6">
                <div className="text-sm font-bold text-primary mb-2 uppercase tracking-wider">Molar Mass / Molecular Weight</div>
                <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                  <span className="text-5xl md:text-6xl font-extrabold text-foreground tracking-tight font-mono">{result.totalWeight.toFixed(4)}</span>
                  <span className="text-2xl font-bold text-muted-foreground font-mono">g/mol</span>
                </div>
                <div className="mt-2 text-sm text-foreground font-mono tracking-widest">{result.formula}</div>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-4">Elemental Composition Breakdown</h3>
                
                <div className="overflow-x-auto rounded-lg border border-border/50">
                  <table className="w-full text-sm text-left font-mono">
                    <thead className="text-xs uppercase bg-secondary/50 text-muted-foreground border-b border-border/50">
                      <tr>
                        <th className="px-4 py-3">Element</th>
                        <th className="px-4 py-3 text-right">Count</th>
                        <th className="px-4 py-3 text-right">Atomic Mass</th>
                        <th className="px-4 py-3 text-right">Total Mass</th>
                        <th className="px-4 py-3 text-right">Mass %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.breakdown.map((el, idx) => (
                        <tr key={idx} className="border-b border-border/20 last:border-0 bg-background">
                          <td className="px-4 py-3 font-bold text-primary">{el.symbol}</td>
                          <td className="px-4 py-3 text-right">{el.count}</td>
                          <td className="px-4 py-3 text-right text-muted-foreground">{el.massPerMole.toFixed(4)}</td>
                          <td className="px-4 py-3 text-right font-medium text-foreground">{el.totalMass.toFixed(4)}</td>
                          <td className="px-4 py-3 text-right font-bold">{el.percentage.toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {result.breakdown.map((el, idx) => (
                    <div key={idx} className="flex-1 min-w-[60px] h-3 rounded-full" style={{ 
                      backgroundColor: `hsl(${(idx * 137.5) % 360}, 70%, 50%)`,
                      width: `${el.percentage}%`
                    }} title={`${el.symbol}: ${el.percentage.toFixed(2)}%`}></div>
                  ))}
                </div>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mx-auto mt-12">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance max-w-none">
            <h2>Understanding Molecular Weight (Molar Mass)</h2>
            <p><strong>Molecular weight</strong> (more accurately called molar mass in modern chemistry) is a measure of the total mass of a single molecule or compound. It is a foundational metric in chemistry used to determine how much of a physical substance you need to measure out to ensure a reaction happens perfectly without leftover waste.</p>

            <h2>The Concept of the "Mole"</h2>
            <p>Atoms are incomprehensibly small, making it impossible to weigh just one in a lab. To bridge the gap between atomic physics and real-world chemistry, scientists created the <strong>Mole</strong>. One Mole is exactly 6.022 × 10²³ particles (Avogadro's Number).</p>
            <p>The beauty of the Mole is that it directly links the atomic mass scale to standard grams. If you look at a Periodic Table, Carbon (C) has an atomic mass of roughly 12. This means that exactly one Mole of Carbon atoms weighs exactly 12 grams in the real world. The unit used for molecular weight is therefore <strong>g/mol</strong> (Grams per Mole).</p>

            <h2>How to Calculate It</h2>
            <p>To calculate the molecular weight of a compound, you simply add up the atomic weights of all the constituent atoms, multiplying by the quantity of each atom present in the formula.</p>
            <ul>
              <li><strong>Find the weight of Water (H2O):</strong></li>
              <li>The formula tells us there are 2 Hydrogen atoms and 1 Oxygen atom.</li>
              <li>Atomic mass of Hydrogen = 1.008 g/mol.</li>
              <li>Atomic mass of Oxygen = 15.999 g/mol.</li>
              <li>Calculation: <code>(2 × 1.008) + (1 × 15.999) = 18.015 g/mol</code>.</li>
            </ul>

            <h2>Why is this calculation important?</h2>
            <p>In a chemical reaction, molecules react with each other based on their quantity (count), not their physical weight. For example, to make Water (H2O), you need exactly two Hydrogen atoms for every one Oxygen atom. However, Oxygen atoms are much heavier than Hydrogen atoms.</p>
            <p>If you walked into a lab and mixed 10 grams of Hydrogen with 10 grams of Oxygen, you wouldn't get a perfect reaction. You would have a massive amount of Hydrogen leftover, because 10 grams of Hydrogen contains vastly more atoms than 10 grams of Oxygen. By using Molar Mass, chemists know exactly how many grams of each substance to weigh out so the atom counts match the reaction requirements perfectly.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/molecular-weight-calculator" />
          <PopularCalculators exclude="/calculator/molecular-weight-calculator" />
        </div>
      </div>
    </>
  );
};
export default MolecularWeightCalculator;
