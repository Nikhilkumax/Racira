"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ArrowLeftRight, Printer, RotateCcw, AlertTriangle, Pill } from "lucide-react";

// 1. TypeScript Interfaces
interface SteroidData {
  name: string;
  equivalentDose: number; // in mg, relative to hydrocortisone 20mg
  antiInflammatoryPotency: number;
  mineralocorticoidPotency: number;
  halfLife: string; // Biological half-life duration
  type: "Short-acting" | "Intermediate-acting" | "Long-acting";
}

interface SteroidInputs {
  fromSteroid: string;
  fromDose: number;
  toSteroid: string;
}

interface SteroidResults {
  convertedDose: number;
  fromData: SteroidData;
  toData: SteroidData;
  allConversions: { name: string; dose: number; type: string }[];
}

// Medical data reference for systemic corticosteroids
const STEROID_DB: Record<string, SteroidData> = {
  "hydrocortisone": { name: "Hydrocortisone", equivalentDose: 20, antiInflammatoryPotency: 1, mineralocorticoidPotency: 1, halfLife: "8-12 hours", type: "Short-acting" },
  "cortisone": { name: "Cortisone", equivalentDose: 25, antiInflammatoryPotency: 0.8, mineralocorticoidPotency: 0.8, halfLife: "8-12 hours", type: "Short-acting" },
  "prednisone": { name: "Prednisone", equivalentDose: 5, antiInflammatoryPotency: 4, mineralocorticoidPotency: 0.8, halfLife: "18-36 hours", type: "Intermediate-acting" },
  "prednisolone": { name: "Prednisolone", equivalentDose: 5, antiInflammatoryPotency: 4, mineralocorticoidPotency: 0.8, halfLife: "18-36 hours", type: "Intermediate-acting" },
  "methylprednisolone": { name: "Methylprednisolone", equivalentDose: 4, antiInflammatoryPotency: 5, mineralocorticoidPotency: 0.5, halfLife: "18-36 hours", type: "Intermediate-acting" },
  "triamcinolone": { name: "Triamcinolone", equivalentDose: 4, antiInflammatoryPotency: 5, mineralocorticoidPotency: 0, halfLife: "18-36 hours", type: "Intermediate-acting" },
  "dexamethasone": { name: "Dexamethasone", equivalentDose: 0.75, antiInflammatoryPotency: 25, mineralocorticoidPotency: 0, halfLife: "36-54 hours", type: "Long-acting" },
  "betamethasone": { name: "Betamethasone", equivalentDose: 0.6, antiInflammatoryPotency: 25, mineralocorticoidPotency: 0, halfLife: "36-54 hours", type: "Long-acting" }
};

// 2. Pure Calculation Function
const calculateSteroid = (inputs: SteroidInputs): SteroidResults | null => {
  const { fromSteroid, fromDose, toSteroid } = inputs;
  
  if (fromDose <= 0 || !STEROID_DB[fromSteroid] || !STEROID_DB[toSteroid]) return null;

  const fromData = STEROID_DB[fromSteroid];
  const toData = STEROID_DB[toSteroid];

  // Logic: (FromDose / FromEq) * ToEq
  const convertedDose = (fromDose / fromData.equivalentDose) * toData.equivalentDose;

  const allConversions = Object.values(STEROID_DB).map(steroid => ({
    name: steroid.name,
    type: steroid.type,
    dose: (fromDose / fromData.equivalentDose) * steroid.equivalentDose
  }));

  return {
    convertedDose,
    fromData,
    toData,
    allConversions
  };
};

export default function SteroidEquivalenceCalculator() {
  const [fromSteroid, setFromSteroid] = useState<string>("prednisone");
  const [fromDose, setFromDose] = useState<string>("40");
  const [toSteroid, setToSteroid] = useState<string>("dexamethasone");
  
  const [results, setResults] = useState<SteroidResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    const d = parseFloat(fromDose);
    if (isNaN(d) || d <= 0) {
      setResults(null);
      return;
    }
    const inputs: SteroidInputs = { fromSteroid, fromDose: d, toSteroid };
    setResults(calculateSteroid(inputs));
  };

  const handleReset = () => {
    setFromSteroid("prednisone");
    setFromDose("40");
    setToSteroid("dexamethasone");
    setTimeout(handleCalculate, 10);
  };

  const handleSwap = () => {
    if (results) {
      setFromDose(results.convertedDose.toFixed(2).replace(/\.00$/, ''));
    }
    const temp = fromSteroid;
    setFromSteroid(toSteroid);
    setToSteroid(temp);
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromSteroid, fromDose, toSteroid]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Steroid Equivalence</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "Why do we need to calculate steroid equivalence?", answer: "Different corticosteroids have vastly different potencies. For example, 1mg of Dexamethasone is over 25 times more powerful at reducing inflammation than 1mg of Hydrocortisone. If a patient is switching from one drug to another (e.g., from an IV hospital dose to an oral home dose), doctors must calculate the exact equivalent to avoid dangerous under-dosing (causing disease flare-ups) or over-dosing (causing severe side effects)." },
    { question: "What is the difference between Anti-Inflammatory and Mineralocorticoid potency?", answer: "Anti-inflammatory potency measures how well the drug suppresses the immune system and reduces swelling. Mineralocorticoid potency measures how much the drug mimics Aldosterone, a hormone that causes the body to retain salt and water. Drugs like Prednisone have high anti-inflammatory effects but still cause fluid retention. Drugs like Dexamethasone have massive anti-inflammatory effects but zero mineralocorticoid effects (no fluid retention)." },
    { question: "Why does biological half-life matter?", answer: "Half-life dictates how long the drug remains active in your tissues. Short-acting steroids (Hydrocortisone) last 8-12 hours and often require multiple doses a day. Long-acting steroids (Dexamethasone) can suppress the immune system for up to 54 hours with a single dose. When switching from short to long-acting, patients must be monitored carefully to prevent HPA-axis suppression." },
    { question: "Does this apply to topical or inhaled steroids?", answer: "No. This calculator is strictly for systemic (oral or intravenous) corticosteroids. Topical creams and inhaled asthma steroids are absorbed differently by the body and have their own distinct potency classifications that cannot be directly converted using these systemic ratios." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Steroid Equivalence Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Steroid Equivalence Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start max-w-[1100px] mx-auto">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-amber-500/10 border-l-4 border-amber-500 rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-amber-600 font-bold mb-1 text-sm">
                <AlertTriangle className="h-4 w-4" /> Clinical Warning
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">This tool provides theoretical pharmacokinetic conversions for systemic corticosteroids based on standard clinical tables. It is for educational purposes and should not override a physician's clinical judgment regarding patient-specific absorption or tapering schedules.</p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="p-4 border border-border rounded-lg bg-secondary/20">
                <label className="flex items-center text-sm font-semibold text-foreground mb-1.5">Convert From</label>
                <select
                  value={fromSteroid}
                  onChange={(e) => setFromSteroid(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 h-10 text-base outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground mb-3"
                >
                  {Object.entries(STEROID_DB).map(([key, data]) => (
                    <option key={key} value={key}>{data.name}</option>
                  ))}
                </select>
                
                <label className="flex items-center text-sm font-semibold text-foreground mb-1.5">Current Dose</label>
                <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                  <input
                    type="number"
                    value={fromDose}
                    onChange={(e) => setFromDose(e.target.value)}
                    className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground"
                  />
                  <span className="pr-3 pl-1 text-sm font-bold text-muted-foreground select-none pointer-events-none shrink-0">mg</span>
                </div>
              </div>

              <div className="flex justify-center -my-6 relative z-10">
                <button onClick={handleSwap} type="button" className="bg-background border border-border p-2 rounded-full shadow-sm hover:bg-secondary transition-colors text-primary" aria-label="Swap steroids">
                  <ArrowLeftRight className="h-4 w-4 rotate-90" />
                </button>
              </div>

              <div className="p-4 border border-border rounded-lg bg-primary/5">
                <label className="flex items-center text-sm font-semibold text-foreground mb-1.5 text-primary">Convert To</label>
                <select
                  value={toSteroid}
                  onChange={(e) => setToSteroid(e.target.value)}
                  className="w-full rounded-md border border-primary/30 bg-background px-3 h-10 text-base outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                >
                  {Object.entries(STEROID_DB).map(([key, data]) => (
                    <option key={key} value={key}>{data.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={handleReset} className="w-full rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center font-bold text-sm">
                <RotateCcw className="h-4 w-4 mr-2" /> Reset
              </button>
            </div>
          </div>

          {/* RIGHT: Results */}
          <div className="flex flex-col gap-4">
            {results ? (
              <div ref={printRef} className="flex flex-col gap-4 animate-fade-in-up">
                
                {/* 1. Primary Result Card */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-6 relative overflow-hidden shadow-sm">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors print:hidden z-10" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="relative z-10">
                    <div className="text-sm font-bold text-muted-foreground mb-1">
                      Equivalent Dose for <span className="text-foreground">{results.toData.name}</span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <div className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary">
                        {results.convertedDose % 1 === 0 ? results.convertedDose : results.convertedDose.toFixed(2)}
                      </div>
                      <div className="text-xl font-bold text-primary/80">mg</div>
                    </div>
                    <div className="text-xs font-semibold text-muted-foreground mt-3 pt-3 border-t border-primary/20">
                      Based on {fromDose}mg of {results.fromData.name}
                    </div>
                  </div>
                  <Pill className="absolute -bottom-6 -right-6 h-40 w-40 opacity-5 text-primary" />
                </div>

                {/* 2. Pharmacological Profile Comparison */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
                    <div className="text-xs font-bold uppercase tracking-wider mb-3 pb-2 border-b border-border text-foreground">{results.fromData.name} Profile</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Class:</span> <span className="font-semibold">{results.fromData.type}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Half-life:</span> <span className="font-semibold">{results.fromData.halfLife}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Anti-Inflam Potency:</span> <span className="font-semibold">{results.fromData.antiInflammatoryPotency}x</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Mineralocorticoid:</span> <span className="font-semibold">{results.fromData.mineralocorticoidPotency}x</span></div>
                    </div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
                    <div className="text-xs font-bold uppercase tracking-wider mb-3 pb-2 border-b border-border text-primary">{results.toData.name} Profile</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Class:</span> <span className="font-semibold">{results.toData.type}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Half-life:</span> <span className="font-semibold">{results.toData.halfLife}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Anti-Inflam Potency:</span> <span className="font-semibold">{results.toData.antiInflammatoryPotency}x</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Mineralocorticoid:</span> <span className="font-semibold">{results.toData.mineralocorticoidPotency}x</span></div>
                    </div>
                  </div>
                </div>

                {/* 3. Global Equivalence Table */}
                <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
                  <div className="bg-muted/50 p-4 border-b border-border">
                    <h3 className="text-sm font-bold text-foreground">Complete Systemic Equivalents</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-secondary/30">
                          <th className="py-2.5 px-4 text-left font-bold text-muted-foreground text-xs uppercase tracking-wider">Steroid Name</th>
                          <th className="py-2.5 px-4 text-left font-bold text-muted-foreground text-xs uppercase tracking-wider">Classification</th>
                          <th className="py-2.5 px-4 text-right font-bold text-muted-foreground text-xs uppercase tracking-wider">Equivalent Dose</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.allConversions.map((conv, i) => (
                          <tr key={i} className={`border-b border-border/50 last:border-0 ${conv.name.toLowerCase() === toSteroid.toLowerCase() ? 'bg-primary/5 font-bold text-primary' : ''}`}>
                            <td className="py-2.5 px-4">{conv.name}</td>
                            <td className="py-2.5 px-4 text-xs text-muted-foreground">{conv.type}</td>
                            <td className="py-2.5 px-4 text-right tabular-nums">
                              {conv.dose % 1 === 0 ? conv.dose : conv.dose.toFixed(2)} mg
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            ) : null}
          </div>
        </div>

        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding the Steroid Equivalence Calculator</h2>
            <p>Corticosteroids are powerful, life-saving medications used to treat severe inflammation, autoimmune diseases, asthma exacerbations, and severe allergic reactions. However, not all steroids are created equal. The <strong>Steroid Equivalence Calculator</strong> is a vital pharmacological tool used by physicians, pharmacists, and medical students to safely convert a patient's dose from one specific systemic corticosteroid to another.</p>
            <p>Switching steroid types is incredibly common in medicine. A patient might be admitted to the emergency room and given a massive dose of intravenous Methylprednisolone. When they are discharged three days later, they need a prescription for oral Prednisone. If the doctor simply writes the same milligram number on the prescription, it could result in a dangerous overdose or a failure to control the disease. This calculator ensures the anti-inflammatory potency remains perfectly matched across different drug molecules.</p>

            <h2>The Concept of Relative Potency</h2>
            <p>To calculate equivalence, medical science uses a baseline standard. In endocrinology, <strong>Hydrocortisone</strong> is the gold standard because it most closely mimics the natural cortisol produced by the human adrenal glands. We assign Hydrocortisone an "Anti-Inflammatory Potency" score of 1. All other synthetic steroids are measured against this baseline.</p>
            <ul>
              <li><strong>Prednisone & Prednisolone:</strong> These are 4 times more potent than Hydrocortisone. Therefore, 5mg of Prednisone is equal in anti-inflammatory power to 20mg of Hydrocortisone.</li>
              <li><strong>Methylprednisolone:</strong> This is slightly stronger, sitting at 5 times the potency of Hydrocortisone. 4mg of Methylprednisolone equals 20mg of Hydrocortisone.</li>
              <li><strong>Dexamethasone:</strong> This is a powerhouse synthetic steroid. It is 25 to 30 times more potent than Hydrocortisone. A mere 0.75mg of Dexamethasone provides the exact same anti-inflammatory effect as 20mg of Hydrocortisone.</li>
            </ul>

            <h2>Anti-Inflammatory vs. Mineralocorticoid Effects</h2>
            <p>When converting steroids, it is crucial to understand that they impact the body in two distinct ways. Anti-inflammatory effects reduce swelling and suppress the immune system. <strong>Mineralocorticoid effects</strong> dictate how much the drug causes the kidneys to retain sodium (salt) and excrete potassium, which directly leads to fluid retention, swelling (edema), and high blood pressure.</p>
            <p>If a patient has severe congestive heart failure and cannot tolerate fluid buildup in their lungs, a doctor cannot prescribe Hydrocortisone (which has high mineralocorticoid effects). Instead, they use our calculator to find the equivalent dose of Dexamethasone or Methylprednisolone. These synthetic modifications have been chemically engineered to have massive anti-inflammatory power but virtually <em>zero</em> mineralocorticoid effects, keeping the patient's fluid levels safe.</p>

            <h2>Biological Half-Life: Duration of Action</h2>
            <p>The half-life of a steroid dictates how long the drug actively suppresses the immune system after a single dose. Our calculator categorizes steroids into three distinct classes based on their duration of action:</p>
            <ul>
              <li><strong>Short-Acting (8-12 hours):</strong> Hydrocortisone and Cortisone. These clear the body quickly and often require dosing two or three times a day. They are frequently used for patients with Adrenal Insufficiency (Addison's Disease) to mimic the body's natural daily cortisol rhythm.</li>
              <li><strong>Intermediate-Acting (18-36 hours):</strong> Prednisone, Prednisolone, and Methylprednisolone. These are the most commonly prescribed outpatient steroids. They typically require only once-daily dosing.</li>
              <li><strong>Long-Acting (36-54 hours):</strong> Dexamethasone and Betamethasone. These linger in the tissues for days. They are often used in neurosurgery to reduce brain swelling or administered as a single injection that continues working for days without requiring the patient to swallow pills.</li>
            </ul>

            <h2>The Danger of HPA Axis Suppression</h2>
            <p>When you take external (exogenous) steroids, your brain senses the high hormone levels and signals your adrenal glands to stop producing natural cortisol. This is known as Hypothalamic-Pituitary-Adrenal (HPA) axis suppression. If you abruptly stop taking the medication, your adrenal glands cannot wake up fast enough to produce cortisol, leading to an adrenal crisis—a potentially fatal medical emergency involving severe low blood pressure and shock.</p>
            <p>This is why doctors use "steroid tapers," slowly reducing the dose over weeks. When converting a patient from a long-acting steroid like Dexamethasone to a short-acting one like Hydrocortisone to begin a taper, precise mathematical equivalence is non-negotiable. If the conversion is incorrect and the dose drops too sharply, the patient will suffer an adrenal crisis.</p>

            <h2>Clinical Limitations</h2>
            <p>While this calculator uses universally accepted pharmacological tables, clinical medicine is not always perfectly mathematical. Individual patient factors—such as liver function (which is required to metabolize Prednisone into its active form, Prednisolone), kidney function, and concurrent medications—can alter how a steroid behaves in the body.</p>
            <p>Furthermore, these equivalence ratios apply strictly to <strong>systemic</strong> steroids (oral tablets, IV, or IM injections). They cannot be used to calculate equivalent doses for topical steroid creams (used for eczema) or inhaled corticosteroids (used for asthma), as those delivery methods have entirely different absorption profiles and safety metrics.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/steroid-equivalence-calculator" />
          <PopularCalculators exclude="/calculator/steroid-equivalence-calculator" />
        </div>
      </div>
    </>
  );
}
