"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface ToxicityResult {
  dogWeightKg: number;
  amountGrams: number;
  theobromineMg: number;
  doseMgKg: number;
  riskLevel: string;
  riskColor: string;
  advice: string;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

type ChocolateType = "milk" | "dark" | "baking" | "cocoa" | "white";

const CHOCO_MG: Record<ChocolateType, number> = { milk: 60, dark: 450, baking: 1300, cocoa: 2600, white: 3.5 };
const CHOCO_LABELS: Record<ChocolateType, string> = { milk: "Milk Chocolate", dark: "Dark Chocolate (70%)", baking: "Baking Chocolate", cocoa: "Cocoa Powder", white: "White Chocolate" };

function calcToxicity(weightLb: number, type: ChocolateType, amountOz: number): ToxicityResult {
  const dogWeightKg = weightLb * 0.453592;
  const amountGrams = amountOz * 28.3495;
  const theobromineMg = (amountGrams * CHOCO_MG[type]) / 100; // values are mg per 100 g
  const doseMgKg = dogWeightKg > 0 ? theobromineMg / dogWeightKg : 0;

  let riskLevel: string, riskColor: string, advice: string;
  if (doseMgKg >= 200) { riskLevel = "Severe — Emergency"; riskColor = "text-red-500"; advice = "Call your veterinarian or the Pet Poison Helpline (855-764-7661) immediately. 200 mg/kg can cause seizures and heart arrhythmias."; }
  else if (doseMgKg >= 100) { riskLevel = "Toxic — Vet Required"; riskColor = "text-orange-500"; advice = "100 mg/kg is the toxic threshold. Contact a vet now — symptoms can appear within hours and treatment is most effective early."; }
  else if (doseMgKg >= 20) { riskLevel = "Mild Risk — Monitor"; riskColor = "text-amber-500"; advice = "Vomiting and restlessness are possible. Monitor closely and call your vet if any symptoms appear."; }
  else { riskLevel = "Low Risk"; riskColor = "text-emerald-600"; advice = "Dose is below the typical concern threshold, but watch for vomiting or restlessness and contact your vet if symptoms develop."; }

  const breakdown = [
    { label: "Dog Weight", value: `${weightLb} lb (${dogWeightKg.toFixed(1)} kg)` },
    { label: `Chocolate (${CHOCO_LABELS[type]})`, value: `${amountOz} oz (${amountGrams.toFixed(1)} g)` },
    { label: "Theobromine Content", value: `${CHOCO_MG[type]} mg per 100 g` },
    { label: "Total Theobromine Ingested", value: `${Math.round(theobromineMg)} mg` },
    { label: "Dose per kg Body Weight", value: `${doseMgKg.toFixed(1)} mg/kg` },
    { label: "Risk Level", value: riskLevel },
    { label: "Toxic Threshold (100 mg/kg)", value: doseMgKg >= 100 ? "EXCEEDED" : "not reached" },
    { label: "Severe Threshold (200 mg/kg)", value: doseMgKg >= 200 ? "EXCEEDED" : "not reached" },
  ];
  const summaryStats = [
    { label: "Dose", value: `${doseMgKg.toFixed(1)} mg/kg` },
    { label: "Risk", value: riskLevel },
    { label: "Theobromine", value: `${Math.round(theobromineMg)} mg` },
    { label: "Dog Weight", value: `${dogWeightKg.toFixed(1)} kg` },
    { label: "Chocolate Eaten", value: `${amountOz} oz` },
    { label: "Type", value: CHOCO_LABELS[type] },
    { label: "Mild Threshold (20)", value: doseMgKg >= 20 ? "reached" : "not reached" },
    { label: "Toxic Threshold (100)", value: doseMgKg >= 100 ? "reached" : "not reached" },
  ];
  const chartData = [
    { name: "Dose", value: Math.round(doseMgKg), fill: "hsl(var(--primary))" },
    { name: "Mild (20)", value: 20, fill: "#f59e0b" },
    { name: "Toxic (100)", value: 100, fill: "#ef4444" },
    { name: "Severe (200)", value: 200, fill: "#7f1d1d" },
  ];
  return { dogWeightKg, amountGrams, theobromineMg, doseMgKg, riskLevel, riskColor, advice, breakdown, summaryStats, chartData };
}

const DEFAULTS = { weight: "40", type: "milk" as ChocolateType, amount: "2" };

export default function DogChocolateToxicityCalculator() {
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [type, setType] = useState<ChocolateType>("milk");
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [result, setResult] = useState<ToxicityResult | null>(null);

  const w = parseFloat(weight) || 0;
  const a = parseFloat(amount) || 0;
  const errs: string[] = [];
  if (w <= 0) errs.push("Dog weight must be greater than 0.");
  if (w > 300) errs.push("Dog weight looks unrealistic — enter pounds.");
  if (a <= 0) errs.push("Amount eaten must be greater than 0.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcToxicity(w, type, a)); };
  const reset = () => {
    setWeight(DEFAULTS.weight); setType("milk"); setAmount(DEFAULTS.amount);
    setResult(calcToxicity(40, "milk", 2));
  };
  useEffect(() => { setResult(calcToxicity(40, "milk", 2)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "Why is chocolate toxic to dogs?", answer: "Chocolate contains theobromine and caffeine (methylxanthines). Dogs metabolize theobromine very slowly, so it accumulates. Theobromine stimulates the heart and nervous system; at high doses it causes seizures, arrhythmias, and can be fatal." },
    { question: "How much chocolate is dangerous?", answer: "The toxic threshold is about 100 mg of theobromine per kg of body weight; severe symptoms start around 200 mg/kg. Because baking chocolate has ~20× more theobromine than milk chocolate, an ounce of baking chocolate can be as dangerous as a pound of milk chocolate for a small dog." },
    { question: "What are the symptoms of chocolate poisoning?", answer: "Vomiting, diarrhea, restlessness, hyperactivity, rapid heart rate, tremors, and seizures — typically appearing 1–4 hours after ingestion and lasting up to 24 hours. If you see any of these after chocolate ingestion, get veterinary help immediately." },
    { question: "What should I do if my dog ate chocolate?", answer: "Determine the type and amount, weigh your dog, and calculate the dose. If the dose is at or above 20 mg/kg, contact your vet or Pet Poison Helpline (855-764-7661). Do NOT induce vomiting unless instructed — it can be unsafe in some cases." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Dog Chocolate Toxicity Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Dog Chocolate Toxicity Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Dog Weight</label>
                <div className={inp}><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">lb</span></div>
              </div>
              <div>
                <label className={lbl}>Chocolate Type</label>
                <select value={type} onChange={e => setType(e.target.value as ChocolateType)} className={sel}>
                  {Object.entries(CHOCO_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={lbl}>Amount Eaten</label>
              <div className={inp}><input type="number" value={amount} onChange={e => setAmount(e.target.value)} step="0.25" className={ci} /><span className="pr-3 text-muted-foreground text-sm">oz</span></div>
            </div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Theobromine Dose</div>
                <div className="text-4xl font-extrabold tracking-tight">{result.doseMgKg.toFixed(1)} <span className="text-2xl text-muted-foreground">mg/kg</span></div>
                <div className={`text-sm mt-1 font-semibold ${result.riskColor}`}>{result.riskLevel}</div>
              </div>
              <div className={`rounded-lg p-4 border text-sm ${result.doseMgKg >= 100 ? "bg-red-500/10 border-red-500/30 text-red-600" : "bg-amber-500/10 border-amber-500/30 text-amber-600"}`}>
                {result.advice}
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Total Theobromine", `${Math.round(result.theobromineMg)} mg`], ["Dog Weight", `${result.dogWeightKg.toFixed(1)} kg`], ["Risk", result.riskLevel.split(" — ")[0], result.riskColor]].map(([l, v, color], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className={`text-base font-bold ${color || ""}`}>{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Toxicity Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 4 ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 ${i === 4 ? "text-amber-700 font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 4 ? "text-amber-700" : i === 6 || i === 7 ? (r.value === "EXCEEDED" ? "text-red-500" : "text-emerald-600") : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Dose vs Danger Thresholds</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v}`} />
                    <Tooltip formatter={(v: number) => [`${v} mg/kg`, ""]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
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
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Theobromine and Dogs</h2>
            <p>Dogs clear theobromine from their systems far slower than humans, so even modest amounts accumulate to toxic levels. Theobromine content per 100 g: white chocolate ~3.5 mg, milk ~60 mg, dark (70%) ~450 mg, baking ~1,300 mg, cocoa powder ~2,600 mg. This <strong>dog chocolate toxicity calculator</strong> converts what your dog ate into a mg/kg dose against published thresholds.</p>
            <h2 className="text-2xl font-bold mb-3">Risk Thresholds</h2>
            <p>Below 20 mg/kg: unlikely to cause symptoms. 20–100 mg/kg: mild risk (vomiting, restlessness). 100–200 mg/kg: toxic — veterinary treatment needed. Above 200 mg/kg: severe — seizures and arrhythmias possible. Dose = theobromine ingested ÷ body weight in kg.</p>
            <h2 className="text-2xl font-bold mb-3">If Ingestion Happens</h2>
            <p>Stay calm, record the type and amount, and call your vet or Pet Poison Helpline (855-764-7661) with the calculated dose. Induced vomiting within 1–2 hours helps if instructed. This tool is a screening aid — it does not replace professional veterinary judgment.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/dog-chocolate-toxicity-calculator" />
          <PopularCalculators exclude="/calculator/dog-chocolate-toxicity-calculator" />
        </div>
      </div>
    </>
  );
}
