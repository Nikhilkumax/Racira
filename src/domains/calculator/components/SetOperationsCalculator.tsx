"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface SetResult {
  a: string[];
  b: string[];
  union: string[];
  intersection: string[];
  diffAB: string[];
  diffBA: string[];
  symDiff: string[];
  chartData: { name: string; count: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function parseSet(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    )
  );
}

function calcSets(rawA: string, rawB: string): SetResult {
  const a = parseSet(rawA);
  const b = parseSet(rawB);
  const union = Array.from(new Set([...a, ...b]));
  const intersection = a.filter((x) => b.includes(x));
  const diffAB = a.filter((x) => !b.includes(x));
  const diffBA = b.filter((x) => !a.includes(x));
  const symDiff = [...diffAB, ...diffBA];

  const chartData = [
    { name: "|A|", count: a.length, fill: "hsl(var(--primary))" },
    { name: "|B|", count: b.length, fill: "#10b981" },
    { name: "|A ∪ B|", count: union.length, fill: "#f59e0b" },
    { name: "|A ∩ B|", count: intersection.length, fill: "#8b5cf6" },
  ];

  const breakdown = [
    { label: "Set A", value: a.length > 0 ? `{ ${a.join(", ")} }` : "∅ (empty)" },
    { label: "Set B", value: b.length > 0 ? `{ ${b.join(", ")} }` : "∅ (empty)" },
    { label: "Union (A ∪ B)", value: union.length > 0 ? `{ ${union.join(", ")} }` : "∅ (empty)" },
    { label: "Intersection (A ∩ B)", value: intersection.length > 0 ? `{ ${intersection.join(", ")} }` : "∅ (empty)" },
    { label: "Difference (A − B)", value: diffAB.length > 0 ? `{ ${diffAB.join(", ")} }` : "∅ (empty)" },
    { label: "Difference (B − A)", value: diffBA.length > 0 ? `{ ${diffBA.join(", ")} }` : "∅ (empty)" },
    { label: "Symmetric Difference (A △ B)", value: symDiff.length > 0 ? `{ ${symDiff.join(", ")} }` : "∅ (empty)" },
  ];

  const summaryStats = [
    { label: "|A|", value: `${a.length}` },
    { label: "|B|", value: `${b.length}` },
    { label: "|A ∪ B|", value: `${union.length}` },
    { label: "|A ∩ B|", value: `${intersection.length}` },
    { label: "|A − B|", value: `${diffAB.length}` },
    { label: "|B − A|", value: `${diffBA.length}` },
    { label: "|A △ B|", value: `${symDiff.length}` },
    { label: "Identity Check", value: `|A ∪ B| + |A ∩ B| = ${union.length + intersection.length} = |A| + |B| = ${a.length + b.length}${union.length + intersection.length === a.length + b.length ? " ✓" : " ✗"}` },
  ];

  return { a, b, union, intersection, diffAB, diffBA, symDiff, chartData, breakdown, summaryStats };
}

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function SetOperationsCalculator() {
  const [setA, setSetA] = useState("1, 2, 3, 4");
  const [setB, setSetB] = useState("3, 4, 5, 6");
  const [result, setResult] = useState<SetResult | null>(null);

  const calculate = () => setResult(calcSets(setA, setB));
  const reset = () => {
    setSetA("1, 2, 3, 4");
    setSetB("3, 4, 5, 6");
    setResult(calcSets("1, 2, 3, 4", "3, 4, 5, 6"));
  };
  useEffect(() => {
    setResult(calcSets("1, 2, 3, 4", "3, 4, 5, 6"));
  }, []);

  const faqs = [
    { question: "What is a set?", answer: "A set is a collection of distinct objects (elements) with no order and no duplicates. The set {1, 2, 3} is identical to {3, 2, 1} and to {1, 1, 2, 3}. Set operations combine and compare such collections." },
    { question: "What are the main set operations?", answer: "Union (A ∪ B) collects every element from either set; intersection (A ∩ B) keeps only elements in both; difference (A − B) keeps elements of A not in B; symmetric difference (A △ B) keeps elements in exactly one of the two sets." },
    { question: "How do I enter my sets?", answer: "Type the elements separated by commas — for example '1, 2, 3, 4' or 'apple, banana, cherry'. Spaces and duplicates are handled automatically; order does not matter." },
    { question: "What is the inclusion–exclusion identity?", answer: "For two sets, |A ∪ B| = |A| + |B| − |A ∩ B|, so |A ∪ B| + |A ∩ B| = |A| + |B|. The summary panel checks this identity on your data as a built-in correctness proof." },
    { question: "What can set operations be used for?", answer: "Set theory is the foundation of databases (SQL UNION and INTERSECT), search engines (term matching), probability (sample spaces and events), and logic. Understanding the four operations here covers most everyday applications." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Set Operations Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Set Operations Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-sm font-medium mb-1 block">Set A (comma-separated)</label>
              <div className={inp}><input type="text" value={setA} onChange={(e) => setSetA(e.target.value)} className={ci} /></div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Set B (comma-separated)</label>
              <div className={inp}><input type="text" value={setB} onChange={(e) => setSetB(e.target.value)} className={ci} /></div>
              <p className="text-xs text-muted-foreground mt-1">Elements can be numbers or words; duplicates are removed.</p>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Union Size |A ∪ B|</div>
                  <div className="text-4xl font-extrabold tracking-tight">{result.union.length}</div>
                  <div className="text-sm text-muted-foreground mt-1">Intersection |A ∩ B| = {result.intersection.length} · elements: {result.union.slice(0, 6).join(", ")}{result.union.length > 6 ? "…" : ""}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["|A ∪ B|", `${result.union.length}`], ["|A ∩ B|", `${result.intersection.length}`], ["|A △ B|", `${result.symDiff.length}`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Result Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 2 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground align-top">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold break-all">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Set Sizes</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                      <Tooltip formatter={(v: number) => [v, "Elements"]} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-muted-foreground mt-2">The union is always at least as large as either set and at least as large as the intersection.</p>
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
            <h2 className="text-2xl font-bold mb-3">The Four Core Set Operations</h2>
            <p>Given two sets A and B, the four fundamental operations answer every question about how their elements relate. The <strong>union</strong> A ∪ B is everything in either set; the <strong>intersection</strong> A ∩ B is what they share; the <strong>difference</strong> A − B is what belongs only to A; and the <strong>symmetric difference</strong> A △ B is everything in exactly one of them.</p>
            <h2 className="text-2xl font-bold mb-3">Set Sizes and the Inclusion–Exclusion Principle</h2>
            <p>Counting the union naively — adding |A| and |B| — double-counts the shared elements, so the correct formula subtracts them once: <strong>|A ∪ B| = |A| + |B| − |A ∩ B|</strong>. This calculator verifies that identity on your own sets in the summary panel, turning the result into a self-checking calculation.</p>
            <h2 className="text-2xl font-bold mb-3">Where Sets Appear in Practice</h2>
            <p>Database queries (UNION, INTERSECT, EXCEPT), spreadsheet filters, tagging systems, and probability all run on set operations under the hood. Because a set discards order and duplicates, it is also the natural model for 'which customers bought X or Y' style analytics — exactly what this tool computes in one pass.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/set-operations-calculator" />
          <PopularCalculators exclude="/calculator/set-operations-calculator" />
        </div>
      </div>
    </>
  );
}
