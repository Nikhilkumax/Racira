"use client";
import { RotateCcw, Trees, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface Species {
  id: number;
  name: string;
  count: number;
}

interface BioResult {
  totalN: number;
  richness: number;
  d: number;
  diversityIndex: number;
  reciprocalIndex: number;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

const DEFAULT_SPECIES: Species[] = [
  { id: 1, name: "Species A", count: 15 },
  { id: 2, name: "Species B", count: 8 },
  { id: 3, name: "Species C", count: 3 },
];

const COLORS = ["#2563eb", "#0891b2", "#7c3aed", "#db2777", "#ea580c", "#16a34a", "#ca8a04", "#4f46e5"];

function calcBiodiversity(list: Species[]): BioResult {
  let totalN = 0;
  let sumNnMinus1 = 0;
  list.forEach(s => {
    const n = Number(s.count) || 0;
    totalN += n;
    sumNnMinus1 += n * (n - 1);
  });

  const d = totalN > 1 ? sumNnMinus1 / (totalN * (totalN - 1)) : 1;
  const diversityIndex = 1 - d;
  const reciprocalIndex = d > 0 ? 1 / d : 0;
  const richness = list.filter(s => (Number(s.count) || 0) > 0).length;

  return {
    totalN,
    richness,
    d,
    diversityIndex,
    reciprocalIndex,
    chartData: list.filter(s => (Number(s.count) || 0) > 0).map(s => ({ name: s.name, value: Number(s.count) || 0 })),
    breakdown: [
      { label: "Total Individuals (N)", value: `${totalN}` },
      { label: "Species Richness", value: `${richness}` },
      { label: "Σ n(n−1)", value: `${sumNnMinus1}` },
      { label: "Simpson's Index (D)", value: d.toFixed(4) },
      { label: "Index of Diversity (1−D)", value: diversityIndex.toFixed(4) },
      { label: "Reciprocal Index (1/D)", value: reciprocalIndex > 0 ? reciprocalIndex.toFixed(2) : "—" },
    ],
    summaryStats: [
      { label: "Simpson's D", value: d.toFixed(4) },
      { label: "Diversity (1−D)", value: diversityIndex.toFixed(4) },
      { label: "Reciprocal 1/D", value: reciprocalIndex > 0 ? reciprocalIndex.toFixed(2) : "—" },
      { label: "Total Individuals", value: `${totalN}` },
      { label: "Species Richness", value: `${richness}` },
      { label: "Evenness (D/Dmax)", value: richness > 1 ? (d / ((1 / richness) || 1)).toFixed(4) : "1.0000" },
    ],
  };
}

const BiodiversityIndexCalculator = () => {
  const [speciesList, setSpeciesList] = useState<Species[]>(DEFAULT_SPECIES);
  const [results, setResults] = useState<BioResult>(() => calcBiodiversity(DEFAULT_SPECIES));

  const addSpecies = () => {
    setSpeciesList([...speciesList, { id: Date.now(), name: `Species ${String.fromCharCode(65 + speciesList.length)}`, count: 0 }]);
  };

  const updateSpecies = (id: number, field: "name" | "count", value: string | number) => {
    setSpeciesList(speciesList.map(s => s.id === id ? { ...s, [field]: field === "count" ? (parseInt(String(value)) || 0) : String(value) } : s));
  };

  const removeSpecies = (id: number) => {
    if (speciesList.length > 1) {
      setSpeciesList(speciesList.filter(s => s.id !== id));
    }
  };

  const calculate = () => setResults(calcBiodiversity(speciesList));

  const reset = () => {
    setSpeciesList(DEFAULT_SPECIES);
    setResults(calcBiodiversity(DEFAULT_SPECIES));
  };

  useEffect(() => { setResults(calcBiodiversity(DEFAULT_SPECIES)); }, []);

  const faqs = [
    { question: "What is Simpson's Diversity Index?", answer: "It is a mathematical measure that characterizes species diversity in a community. The index accounts for both the number of species present (richness) and the relative abundance of each species (evenness)." },
    { question: "What is the difference between D, 1−D, and 1/D?", answer: "Simpson's Index (D) measures the probability that two randomly selected individuals belong to the same species (0 to 1, where 0 is infinite diversity and 1 is no diversity). The Index of Diversity (1−D) flips this, so 1 represents infinite diversity. The Reciprocal Index (1/D) has a lowest value of 1 (a community with only one species) and a maximum value equal to the number of species." },
    { question: "Why is biodiversity important?", answer: "High biodiversity increases ecosystem stability and resilience. It ensures natural sustainability for all life forms and provides essential resources and services, from food to clean water and medicine." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Environment", href: "/calculator#environment" }, { label: "Biodiversity Index Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Biodiversity Index Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-5 shadow-sm border border-border bg-card">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Trees className="h-5 w-5 text-primary" /> Species Data
              </h2>
              <button onClick={addSpecies} className="text-xs font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 flex items-center gap-1 transition-colors">
                <Plus className="h-3 w-3" /> Add
              </button>
            </div>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
              {speciesList.map((species, index) => (
                <div key={species.id} className="flex gap-2 items-center bg-secondary/10 p-2 rounded-xl border border-border">
                  <span className="text-xs font-bold text-muted-foreground w-6 text-center">{index + 1}</span>
                  <input
                    type="text"
                    value={species.name}
                    onChange={(e) => updateSpecies(species.id, "name", e.target.value)}
                    className="flex-1 input-calc py-2 text-sm"
                    placeholder="Species Name"
                  />
                  <input
                    type="number"
                    value={species.count === 0 ? "" : species.count}
                    onChange={(e) => updateSpecies(species.id, "count", parseInt(e.target.value) || 0)}
                    className="w-24 input-calc py-2 text-sm text-center"
                    placeholder="Count"
                    min="0"
                  />
                  <button onClick={() => removeSpecies(species.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" disabled={speciesList.length <= 1} aria-label="Remove species">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2.5">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Index of Diversity (1−D)</div>
              <div className="text-4xl font-extrabold text-primary">{results.diversityIndex.toFixed(4)}</div>
              <div className="text-sm text-muted-foreground mt-1">0 = No diversity · 1 = Infinite diversity</div>
            </div>

            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Total Individuals", `${results.totalN}`], ["Species Richness", `${results.richness}`], ["Simpson's D", results.d.toFixed(4)]].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold">{v}</div>
                </div>
              ))}
            </div>

            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Diversity Breakdown</h3>
              <table className="w-full text-base"><tbody>
                {results.breakdown.map((r, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-2.5 text-muted-foreground">{r.label}</td>
                    <td className="py-2.5 text-right font-semibold">{r.value}</td>
                  </tr>
                ))}
              </tbody></table>
            </div>

            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Species Abundance</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={results.chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" nameKey="name">
                    {results.chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v} individuals`]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {results.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding Biodiversity Indices</h2>
            <p>In ecology, a diversity index is a quantitative measure that reflects how many different types (such as species) there are in a dataset, and simultaneously takes into account how evenly the basic entities (such as individuals) are distributed among those types.</p>
            <h3>Richness vs. Evenness</h3>
            <p><strong>Species Richness</strong> is simply the number of different species present in a community. A forest with 50 species is 'richer' than one with 10.</p>
            <p><strong>Species Evenness</strong> compares the similarity of the population size of each species present. If one species dominates 90% of the forest, the evenness is low. If all species have roughly equal populations, the evenness is high.</p>
            <h3>How Simpson's Index Works</h3>
            <p>Simpson's Index takes both richness and evenness into account. The formula calculates the probability that two individuals randomly selected from a sample will belong to the same species. A highly diverse ecosystem will have a low probability (a low D value), which is why we often use 1 − D to represent the final score, where a higher score means higher diversity.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/biodiversity-index-calculator" />
          <PopularCalculators exclude="/calculator/biodiversity-index-calculator" />
        </div>
      </div>
    </>
  );
};

export default BiodiversityIndexCalculator;
