"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer } from "recharts";

interface PermResult { permutation: string; combination: string; nFact: string; rFact: string; nrFact: string; }
const DEFAULTS = { n: "10", r: "3" };

function factBig(n: number): bigint {
  if (n < 0 || n > 20) return BigInt(0);
  let r = BigInt(1);
  for (let i = 2; i <= n; i++) r *= BigInt(i);
  return r;
}
function calculate(d: typeof DEFAULTS): PermResult {
  const n = parseInt(d.n)||0, r = parseInt(d.r)||0;
  if (n < 0 || r < 0 || r > n || n > 20) return { permutation: "—", combination: "—", nFact: "—", rFact: "—", nrFact: "—" };
  const nf = factBig(n), rf = factBig(r), nrf = factBig(n - r);
  const perm = nrf > 0 ? nf / nrf : BigInt(0);
  const comb = rf > 0 && nrf > 0 ? nf / (rf * nrf) : BigInt(0);
  return {
    permutation: perm.toString(),
    combination: comb.toString(),
    nFact: nf.toString(),
    rFact: rf.toString(),
    nrFact: nrf.toString(),
  };
}

export default function PermutationCombinationCalculator() {
  const [f, setF] = useState(DEFAULTS);
  const [r, setR] = useState<PermResult>(() => calculate(DEFAULTS));
  const set = (k: keyof typeof DEFAULTS) => (v: string) => setF(p => ({ ...p, [k]: v }));
  const calc = () => setR(calculate(f));
  const reset = () => { setF(DEFAULTS); setR(calculate(DEFAULTS)); };

  const n = parseInt(f.n)||0, rVal = parseInt(f.r)||0;
  const barData = Array.from({ length: Math.min(n+1, 12) }, (_, k) => {
    const res = calculate({ n: f.n, r: k.toString() });
    return { k, comb: parseInt(res.combination)||0, perm: parseInt(res.permutation)||0 };
  });

  const faqs = [
    { question: "What is the difference between permutations and combinations?", answer: "Permutations count ordered arrangements (order matters). P(n,r) = n!/(n−r)!. Combinations count unordered selections (order doesn't matter). C(n,r) = n!/(r!(n−r)!). Example: selecting 3 from {A,B,C}: ABC, ACB, BAC, BCA, CAB, CBA are 6 permutations but only 1 combination." },
    { question: "When does order matter?", answer: "Order matters when the arrangement itself is meaningful: passwords/PINs, race placements (1st/2nd/3rd), seating arrangements, scheduling. Order doesn't matter when you're selecting a group/set: lottery numbers, committee selection, card hands." },
    { question: "What is n! (factorial)?", answer: "n! = n × (n−1) × (n−2) × ... × 2 × 1. 0! = 1 by definition. 5! = 120. 10! = 3,628,800. Factorials grow extraordinarily fast — 20! = 2.4 quintillion, which is why probabilities for large selections become astronomically small." },
    { question: "What is the formula for combinations?", answer: "C(n,r) = n! / (r! × (n−r)!) — also written as 'n choose r' or ⁿCᵣ. This is the binomial coefficient that appears in Pascal's triangle, the binomial theorem, and throughout probability theory." },
    { question: "How many possible poker hands are there?", answer: "C(52,5) = 2,598,960 possible 5-card poker hands from a 52-card deck. Royal flush: 4 possible hands. Straight flush: 36. Four of a kind: 624. Full house: 3,744. Probability of a royal flush = 4/2,598,960 ≈ 0.000154%." },
    { question: "How is this used in probability?", answer: "Counting principles are fundamental to probability: P(event) = favorable outcomes / total outcomes. Permutations and combinations calculate these counts precisely. Used in: lottery odds, poker hand probabilities, DNA sequence analysis, cryptography, quality control sampling, and statistical experimental design." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Permutation & Combination Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Permutation & Combination Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 border border-border bg-card shadow-sm">
            <p className="text-xs text-muted-foreground">Enter n (total items) and r (selected items). Max n = 20.</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col"><label className="text-sm font-semibold mb-1">n (total items)</label>
                <input type="number" min="0" max="20" value={f.n} onChange={e => set("n")(e.target.value)} className="h-9 px-3 rounded-md border border-input bg-background text-base outline-none focus:ring-2 focus:ring-primary/20 text-foreground" /></div>
              <div className="flex flex-col"><label className="text-sm font-semibold mb-1">r (selected)</label>
                <input type="number" min="0" value={f.r} onChange={e => set("r")(e.target.value)} className="h-9 px-3 rounded-md border border-input bg-background text-base outline-none focus:ring-2 focus:ring-primary/20 text-foreground" /></div>
            </div>
            <div className="flex gap-2 mt-1">
              <button onClick={calc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 transition-all">Calculate</button>
              <button onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-9 flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
            <div className="mt-2 rounded-lg bg-secondary/40 p-3 text-sm space-y-1">
              <div>P({n},{rVal}) = {n}! / ({n}−{rVal})! = <strong>{r.permutation}</strong></div>
              <div>C({n},{rVal}) = {n}! / ({rVal}! × ({n}−{rVal})!) = <strong>{r.combination}</strong></div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4 text-center">
                <div className="text-xs font-bold text-primary uppercase tracking-wide mb-1">Permutations P({n},{rVal})</div>
                <div className="text-3xl font-extrabold text-foreground break-all">{r.permutation}</div>
                <div className="text-xs text-muted-foreground mt-1">Ordered arrangements</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 text-center">
                <div className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-1">Combinations C({n},{rVal})</div>
                <div className="text-3xl font-extrabold text-foreground break-all">{r.combination}</div>
                <div className="text-xs text-muted-foreground mt-1">Unordered selections</div>
              </div>
            </div>
            <div className="card-calculator !p-4 border border-border bg-card shadow-sm">
              <h3 className="font-semibold text-sm mb-3">Combinations for each r (from 0 to {Math.min(n,11)})</h3>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} barSize={20}>
                    <XAxis dataKey="k" tick={{ fontSize: 10 }} label={{ value: "r", position: "insideRight", fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <RTooltip formatter={(v: number, name: string) => [v.toLocaleString(), name === "comb" ? "Combinations" : "Permutations"]} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                    <Bar dataKey="comb" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="comb" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="bg-secondary/50 px-4 py-2.5 border-b border-border/50"><h3 className="font-bold text-sm">Factorial Values</h3></div>
              {[
                { label: `n! = ${n}!`, val: r.nFact, bold: true },
                { label: `r! = ${rVal}!`, val: r.rFact },
                { label: `(n−r)! = ${n - rVal}!`, val: r.nrFact },
                { label: `P(${n},${rVal}) = n! / (n−r)!`, val: r.permutation, bold: true, highlight: true },
                { label: `C(${n},${rVal}) = n! / (r!×(n−r)!)`, val: r.combination, bold: true },
                { label: "P / C ratio (r!)", val: r.rFact },
              ].map((row, i) => (
                <div key={i} className={`grid grid-cols-2 px-4 py-2 border-b border-border/30 last:border-0 ${row.highlight ? "bg-primary/5" : "hover:bg-secondary/20"}`}>
                  <span className="text-muted-foreground text-sm">{row.label}</span>
                  <span className={`text-right text-sm break-all ${row.bold ? "font-bold text-foreground" : ""}`}>{row.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>Permutations vs. Combinations</h2>
            <p>The fundamental distinction in counting: permutations count ordered selections; combinations count unordered selections. If you select 3 letters from {"{A, B, C}"}: Permutations = 6 (ABC, ACB, BAC, BCA, CAB, CBA). Combinations = 1 ({"{A, B, C}"}). The ratio between permutations and combinations is always r! — the number of ways to arrange the selected items.</p>
            <h2>Permutation Formula: P(n, r) = n! / (n−r)!</h2>
            <p>Read as &quot;n permute r.&quot; Represents the number of ways to arrange r items chosen from n distinct items where order matters. Example: How many 3-digit PINs from digits 1–9 with no repetition? P(9,3) = 9!/6! = 504.</p>
            <h2>Combination Formula: C(n, r) = n! / (r! × (n−r)!)</h2>
            <p>Read as &quot;n choose r.&quot; The binomial coefficient appears throughout mathematics. Pascal&apos;s Triangle: each entry is the sum of the two above, and every entry is C(n,r). The Binomial Theorem: (a+b)ⁿ = Σ C(n,k) × aᵏ × b^(n-k). These appear in probability, calculus, combinatorics, and algebra throughout secondary and university mathematics.</p>
            <h2>Real-World Examples</h2>
            <p>Lottery odds: In a 6/49 lottery, C(49,6) = 13,983,816 possible combinations — odds of winning ≈ 1 in 14 million. Committee selection: Choosing a 5-person committee from 20 candidates = C(20,5) = 15,504 ways. Race outcomes: Number of possible 1st/2nd/3rd place finishes in a 10-horse race = P(10,3) = 720 ways. Password security: A 4-digit numeric PIN = 10⁴ = 10,000 (with repetition, not permutation since digits can repeat).</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/permutation-combination-calculator" />
          <PopularCalculators exclude="/calculator/permutation-combination-calculator" />
        </div>
      </div>
    </>
  );
}
