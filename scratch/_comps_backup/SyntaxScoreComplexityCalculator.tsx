"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { ChevronDown, Printer, RotateCcw, Activity, Plus, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";

// 1. TypeScript Interfaces
interface Lesion {
  id: string;
  segmentId: string;
  isTotalOcclusion: boolean;
  isBifurcation: boolean;
  severeTortuosity: boolean;
  heavyCalcification: boolean;
  thrombus: boolean;
  diffuseDisease: boolean;
}

interface SyntaxInputs {
  dominance: "right" | "left";
  lesions: Lesion[];
}

interface SyntaxResults {
  totalScore: number;
  riskCategory: "Low Complexity" | "Intermediate Complexity" | "High Complexity";
  recommendation: string;
  lesionScores: { id: string; name: string; score: number }[];
  chartData: { name: string; score: number; color: string }[];
  breakdown: { label: string; value: string; colorClass?: string }[];
  summaryStats: { label: string; value: string; colorClass?: string }[];
}

// Coronary Segments and Weighting
// Standard SYNTAX weighting (approximate simplified logic for general use)
const SEGMENTS = {
  right: [
    { id: "1", name: "RCA proximal", weight: 1.0 },
    { id: "2", name: "RCA mid", weight: 1.0 },
    { id: "3", name: "RCA distal", weight: 1.0 },
    { id: "4", name: "PDA", weight: 1.0 },
    { id: "5", name: "LM", weight: 5.0 },
    { id: "6", name: "LAD proximal", weight: 3.5 },
    { id: "7", name: "LAD mid", weight: 2.5 },
    { id: "8", name: "LAD apical", weight: 1.0 },
    { id: "11", name: "LCX proximal", weight: 1.5 },
    { id: "13", name: "LCX mid", weight: 1.0 },
  ],
  left: [
    { id: "1", name: "RCA proximal", weight: 0.0 }, // non-dominant
    { id: "2", name: "RCA mid", weight: 0.0 },
    { id: "3", name: "RCA distal", weight: 0.0 },
    { id: "5", name: "LM", weight: 6.0 },
    { id: "6", name: "LAD proximal", weight: 3.5 },
    { id: "7", name: "LAD mid", weight: 2.5 },
    { id: "8", name: "LAD apical", weight: 1.0 },
    { id: "11", name: "LCX proximal", weight: 2.5 }, // heavier in left dominant
    { id: "13", name: "LCX mid", weight: 1.5 },
    { id: "15", name: "L-PDA", weight: 1.0 },
  ]
};

// 2. Pure Calculation Function
const calculateSyntaxScore = (inputs: SyntaxInputs): SyntaxResults | null => {
  const { dominance, lesions } = inputs;
  const segmentsMap = dominance === "right" ? SEGMENTS.right : SEGMENTS.left;
  
  let totalScore = 0;
  const lesionScores: { id: string; name: string; score: number }[] = [];

  lesions.forEach((lesion, index) => {
    const segment = segmentsMap.find(s => s.id === lesion.segmentId);
    if (!segment) return;

    let score = 0;
    
    // Base weight modifier
    let baseWeight = segment.weight;

    // 1. Lesion Factor
    if (lesion.isTotalOcclusion) {
      score += (baseWeight * 5); // Total occlusion multiplier
      score += 1; // +1 for blunt stump
      score += 1; // +1 for bridging collaterals
    } else {
      score += (baseWeight * 2); // Significant lesion multiplier
    }

    // 2. Morphological Features
    if (lesion.isBifurcation) score += 1;
    if (lesion.severeTortuosity) score += 2;
    if (lesion.heavyCalcification) score += 2;
    if (lesion.thrombus) score += 1;
    if (lesion.diffuseDisease) score += 1;

    totalScore += score;
    lesionScores.push({ id: lesion.id, name: `Lesion ${index + 1}: ${segment.name}`, score });
  });

  let riskCategory: "Low Complexity" | "Intermediate Complexity" | "High Complexity" = "Low Complexity";
  let recommendation = "PCI is generally recommended over CABG for low complexity cases.";
  let color = "hsl(var(--primary))";

  if (totalScore >= 33) {
    riskCategory = "High Complexity";
    recommendation = "CABG is traditionally recommended over PCI for high SYNTAX scores to improve long-term survival.";
    color = "#ef4444"; // red
  } else if (totalScore >= 23) {
    riskCategory = "Intermediate Complexity";
    recommendation = "Heart Team discussion recommended. PCI and CABG may both be viable options depending on patient comorbidities.";
    color = "#f59e0b"; // amber
  }

  const chartData = lesionScores.map(ls => ({
    name: ls.name,
    score: ls.score,
    color: "#3b82f6"
  }));

  const summaryStats = [
    { label: "Total SYNTAX Score", value: totalScore.toFixed(1), colorClass: `text-[${color}] font-black` },
    { label: "Risk Category", value: riskCategory, colorClass: `text-[${color}]` },
    { label: "Dominance", value: dominance.toUpperCase() }
  ];

  const breakdown = lesionScores.map(ls => ({
    label: ls.name,
    value: ls.score.toFixed(1)
  }));
  breakdown.push({ label: "Total SYNTAX Score", value: totalScore.toFixed(1) });

  return {
    totalScore,
    riskCategory,
    recommendation,
    lesionScores,
    chartData,
    breakdown,
    summaryStats
  };
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold mb-0.5">{payload[0].payload.name}</p>
        <p className="text-primary font-extrabold text-sm">Score: {payload[0].value.toFixed(1)}</p>
      </div>
    );
  }
  return null;
};

// Checkbox Component
const CheckboxInput = ({ label, checked, onChange }: any) => (
  <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer group p-2 rounded-md hover:bg-secondary/50 transition-colors">
    <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${checked ? 'bg-primary border-primary text-primary-foreground' : 'border-input bg-background group-hover:border-primary/50'}`}>
      {checked && <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
    </div>
    <span className="select-none">{label}</span>
  </label>
);

export default function SyntaxScoreComplexityCalculator() {
  // 4. Component State
  const [dominance, setDominance] = useState<"right" | "left">("right");
  const [lesions, setLesions] = useState<Lesion[]>([
    { id: "1", segmentId: "6", isTotalOcclusion: false, isBifurcation: false, severeTortuosity: false, heavyCalcification: false, thrombus: false, diffuseDisease: false }
  ]);
  
  const [results, setResults] = useState<SyntaxResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateSyntaxScore({ dominance, lesions }));
  };

  const handleReset = () => {
    setDominance("right");
    setLesions([{ id: "1", segmentId: "6", isTotalOcclusion: false, isBifurcation: false, severeTortuosity: false, heavyCalcification: false, thrombus: false, diffuseDisease: false }]);
    setResults(null);
  };

  const addLesion = () => {
    if (lesions.length >= 10) return; // Prevent infinite
    const newId = Date.now().toString();
    setLesions([...lesions, { id: newId, segmentId: "1", isTotalOcclusion: false, isBifurcation: false, severeTortuosity: false, heavyCalcification: false, thrombus: false, diffuseDisease: false }]);
  };

  const removeLesion = (id: string) => {
    if (lesions.length <= 1) return;
    setLesions(lesions.filter(l => l.id !== id));
  };

  const updateLesion = (id: string, field: keyof Lesion, value: any) => {
    setLesions(lesions.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dominance, lesions]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>SYNTAX Score Results</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const activeSegments = dominance === "right" ? SEGMENTS.right : SEGMENTS.left;

  const faqs = [
    { question: "What is the SYNTAX Score?", answer: "The SYNTAX Score is an angiographic grading tool to determine the complexity of coronary artery disease. It was developed to help cardiology teams decide between Percutaneous Coronary Intervention (PCI/Stenting) and Coronary Artery Bypass Grafting (CABG) for patients with multi-vessel disease." },
    { question: "What does a score > 33 mean?", answer: "A SYNTAX score of 33 or higher indicates 'High Complexity' coronary artery disease. Based on major clinical trials, CABG surgery is generally recommended over PCI for these patients as it provides a significant survival benefit and fewer repeat revascularizations." },
    { question: "What is an intermediate score?", answer: "A score between 23 and 32 is considered 'Intermediate Complexity'. In these cases, a 'Heart Team' consisting of an interventional cardiologist and a cardiac surgeon should discuss the best approach, taking into account the patient's age, diabetes status, and other comorbidities." },
    { question: "How does dominance affect the score?", answer: "Coronary dominance determines which artery supplies the posterior descending artery (PDA). In right-dominant hearts, the RCA segments receive higher weighting. In left-dominant hearts, the LCX segments are weighted heavier because they supply a larger portion of the myocardium." },
    { question: "Is this calculator diagnostic?", answer: "No. This tool provides a simplified estimation of the SYNTAX score for educational and planning purposes. A formal SYNTAX score must be calculated by an interventional cardiologist analyzing a continuous coronary angiogram." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "SYNTAX Score Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">SYNTAX Score Complexity Calculator</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[560px_1fr] gap-6 items-start max-w-[1280px]">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Activity className="h-4 w-4" /> Coronary Complexity Estimator
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">This tool estimates the complexity of coronary artery disease based on segment weighting and morphological features. Intended for educational use.</p>
            </div>

            <div className="flex flex-col">
              <label className="flex items-center text-sm font-semibold text-foreground mb-1.5">Coronary Dominance</label>
              <div className="flex p-1 bg-secondary rounded-lg border border-border">
                <button type="button" onClick={() => setDominance("right")} className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${dominance === "right" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}>Right Dominant</button>
                <button type="button" onClick={() => setDominance("left")} className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${dominance === "left" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}>Left Dominant</button>
              </div>
            </div>

            <div className="h-px bg-border my-2"></div>

            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">Identified Lesions ({lesions.length})</h3>
              <button onClick={addLesion} disabled={lesions.length >= 10} className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50">
                <Plus className="h-3 w-3" /> Add Lesion
              </button>
            </div>

            <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {lesions.map((lesion, index) => (
                <div key={lesion.id} className="border border-border rounded-xl p-4 bg-secondary/10 relative animate-fade-in-up">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-bold text-foreground">Lesion {index + 1}</h4>
                    {lesions.length > 1 && (
                      <button onClick={() => removeLesion(lesion.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col mb-4">
                    <label className="flex items-center text-xs font-semibold text-muted-foreground mb-1.5">Primary Segment Involved</label>
                    <select
                      value={lesion.segmentId}
                      onChange={(e) => updateLesion(lesion.id, "segmentId", e.target.value)}
                      className="w-full h-10 px-3 py-1 text-sm bg-background border border-input rounded-md outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground cursor-pointer"
                    >
                      {activeSegments.map(s => (
                        <option key={s.id} value={s.id}>{s.name} (x{s.weight})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                    <CheckboxInput label="Total Occlusion" checked={lesion.isTotalOcclusion} onChange={() => updateLesion(lesion.id, "isTotalOcclusion", !lesion.isTotalOcclusion)} />
                    <CheckboxInput label="Bifurcation" checked={lesion.isBifurcation} onChange={() => updateLesion(lesion.id, "isBifurcation", !lesion.isBifurcation)} />
                    <CheckboxInput label="Severe Tortuosity" checked={lesion.severeTortuosity} onChange={() => updateLesion(lesion.id, "severeTortuosity", !lesion.severeTortuosity)} />
                    <CheckboxInput label="Heavy Calcification" checked={lesion.heavyCalcification} onChange={() => updateLesion(lesion.id, "heavyCalcification", !lesion.heavyCalcification)} />
                    <CheckboxInput label="Thrombus Visible" checked={lesion.thrombus} onChange={() => updateLesion(lesion.id, "thrombus", !lesion.thrombus)} />
                    <CheckboxInput label="Diffuse Disease" checked={lesion.diffuseDisease} onChange={() => updateLesion(lesion.id, "diffuseDisease", !lesion.diffuseDisease)} />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-4 pt-4 border-t border-border">
              <button type="button" onClick={handleCalculate} className="flex-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-10 transition-colors flex items-center justify-center font-bold text-sm">
                Calculate
              </button>
              <button type="button" onClick={handleReset} className="w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: Results */}
          <div className="flex flex-col gap-4">
            {results && (
              <div ref={printRef} className="flex flex-col gap-4">
                
                {/* 1. Primary Result Card */}
                <div className={`border-l-4 rounded-lg p-5 relative ${
                  results.riskCategory === "High Complexity" ? "bg-destructive/10 border-destructive" :
                  results.riskCategory === "Intermediate Complexity" ? "bg-amber-500/10 border-amber-500" :
                  "bg-primary/10 border-primary"
                }`}>
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: results.riskCategory === "High Complexity" ? "#ef4444" : results.riskCategory === "Intermediate Complexity" ? "#f59e0b" : "hsl(var(--primary))" }}>
                    Total SYNTAX Score
                  </div>
                  <div className="text-5xl font-black text-foreground tracking-tight mb-2">
                    {results.totalScore.toFixed(1)}
                  </div>
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-background shadow-sm border border-border mb-3">
                    {results.riskCategory}
                  </div>
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                    <strong>Guidelines Recommendation:</strong> {results.recommendation}
                  </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  {/* 3. Breakdown Table */}
                  <div className="card-calculator !p-5 border border-border bg-card">
                    <h3 className="text-base font-bold mb-4">Lesion Breakdown</h3>
                    <table className="w-full text-sm">
                      <tbody>
                        {results.breakdown.map((row, i) => (
                          <tr key={i} className={`border-b border-border/50 last:border-0 ${row.label === "Total SYNTAX Score" ? "font-bold border-t-2 border-border" : ""}`}>
                            <td className="py-2.5">
                              {row.label}
                            </td>
                            <td className="py-2.5 text-right font-semibold">{row.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* 4. Chart */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[280px]">
                    <h3 className="text-base font-bold mb-2 w-full text-left">Score by Lesion</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={results.chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={false} stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickMargin={8} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding the SYNTAX Score Calculator</h2>
            <p>Coronary artery disease (CAD) is not uniform. The complexity of blockages within the heart's blood vessels varies immensely from patient to patient. To create a standardized, objective method for evaluating this complexity, cardiovascular researchers developed the <strong>SYNTAX Score</strong>. Our SYNTAX Score Complexity Calculator is an educational tool designed to help medical professionals, students, and patients understand how this vital metric is calculated and how it influences major treatment decisions.</p>
            <p>The score analyzes the coronary anatomy based on a diagnostic angiogram. It weighs the location, severity, and morphological characteristics of every significant lesion (blockage) to generate a single number. This number is then used by the Heart Team to decide whether the patient would benefit more from Percutaneous Coronary Intervention (PCI, commonly known as stenting) or Coronary Artery Bypass Grafting (CABG, commonly known as open-heart bypass surgery).</p>

            <h2 className="text-2xl font-bold mb-3">The Origin of the SYNTAX Score</h2>
            <p>The SYNTAX Score was derived from the landmark <strong>SYNTAX trial</strong> (Synergy Between Percutaneous Coronary Intervention with TAXUS and Cardiac Surgery). This massive clinical trial aimed to answer a pivotal question: for patients with severe multi-vessel disease or Left Main disease, is it better to place stents or perform bypass surgery?</p>
            <p>The researchers realized they needed a way to mathematically grade the "hostility" of the coronary anatomy. They created an algorithmic tool that assigned points to various anatomical features. The trial's results fundamentally changed cardiology: they proved that for patients with highly complex anatomy (high SYNTAX scores), CABG offered significantly better long-term survival and fewer repeat procedures than PCI.</p>

            <h2 className="text-2xl font-bold mb-3">How is the Score Calculated?</h2>
            <p>Calculating a formal SYNTAX score is a complex process typically performed by an interventional cardiologist reviewing moving x-ray images (fluoroscopy). Our calculator approximates this process using the following core principles:</p>
            <p><strong>1. Coronary Dominance:</strong> The heart has two main arteries (Right and Left). Dominance refers to which artery supplies the posterior aspect of the heart. If a patient is Right Dominant, the right coronary artery (RCA) is given more anatomical weight. If they are Left Dominant, the circumflex artery (LCX) is weighted more heavily.</p>
            <p><strong>2. Segment Weighting:</strong> The coronary tree is divided into 16 distinct segments. Not all blockages are equal. A blockage in the Left Main (LM) coronary artery—the "widowmaker" that supplies 70% of the heart muscle—is assigned a massive baseline multiplier (e.g., x5 or x6). A blockage in a tiny, distal branch receives a much lower multiplier (e.g., x1).</p>
            <p><strong>3. Lesion Severity:</strong> A standard significant lesion (typically &gt;50% narrowing) receives a baseline multiplier of 2. However, a Total Occlusion (100% blockage) receives a multiplier of 5, representing the immense technical difficulty of reopening a completely blocked vessel.</p>
            <p><strong>4. Morphological Modifiers:</strong> The calculator then adds specific penalty points for anatomical features that make stenting difficult or dangerous. These include:</p>
            <ul>
              <li><strong>Bifurcations:</strong> A blockage located exactly where an artery splits into two branches (+1 or +2 points).</li>
              <li><strong>Severe Tortuosity:</strong> An artery with multiple sharp, 90-degree bends (+2 points).</li>
              <li><strong>Heavy Calcification:</strong> Plaque that has hardened into bone-like calcium, resisting balloon expansion (+2 points).</li>
              <li><strong>Thrombus:</strong> A visible blood clot within the artery (+1 point).</li>
              <li><strong>Diffuse Disease:</strong> Disease that stretches continuously over a long segment of the artery (+1 point).</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Interpreting the Results: The Three Tiers</h2>
            <p>Once all lesions are analyzed and the points are summed, the patient is placed into one of three risk categories based on the original SYNTAX trial guidelines:</p>
            <p><strong>Low Complexity (Score 0-22):</strong> The anatomy is relatively straightforward. For these patients, clinical data shows that PCI (stenting) provides excellent outcomes that are generally equivalent to CABG. Given that PCI is less invasive, it is usually the preferred method.</p>
            <p><strong>Intermediate Complexity (Score 23-32):</strong> The anatomy is challenging. In this "gray zone," a multidisciplinary Heart Team (cardiologist and surgeon) must review the case. The decision between PCI and CABG will depend heavily on the patient's individual factors, particularly whether they have diabetes (diabetics often do better with CABG) or if they are too frail for open-heart surgery.</p>
            <p><strong>High Complexity (Score 33+):</strong> The anatomy is extremely complex, often involving total occlusions, heavy calcification, and left main disease. For these patients, the data is clear: CABG provides a superior mortality benefit and a much lower rate of needing repeat procedures in the future. PCI is generally avoided unless the patient is completely inoperable.</p>

            <h2 className="text-2xl font-bold mb-3">The Role of the Heart Team</h2>
            <p>It is vital to understand that the SYNTAX Score is just one piece of the puzzle. It measures <em>anatomical</em> complexity, but it completely ignores <em>clinical</em> complexity. A patient might have a very high SYNTAX score of 45 (favoring surgery), but if they are 88 years old with severe lung disease and kidney failure, they may not survive the surgical operation. In that scenario, PCI might still be the only viable option.</p>
            <p>This is why modern cardiology guidelines mandate a "Heart Team" approach. The anatomical data (SYNTAX Score) is combined with clinical data (like the STS Score, which calculates surgical mortality risk) to make a tailored, patient-specific recommendation.</p>

            <h2 className="text-2xl font-bold mb-3">Evolution: The SYNTAX Score II</h2>
            <p>Recognizing the limitations of relying purely on anatomy, researchers developed the SYNTAX Score II. This updated algorithmic model combines the original anatomical score with clinical variables such as Age, Creatinine Clearance (kidney function), Left Ventricular Ejection Fraction (heart pumping strength), presence of unprotected Left Main disease, peripheral vascular disease, female sex, and COPD.</p>
            <p>The SYNTAX Score II provides personalized 4-year mortality predictions for both CABG and PCI, offering a much more nuanced view than the rigid 33-point cutoff of the original score.</p>

            <h2 className="text-2xl font-bold mb-3">Educational Value and Limitations</h2>
            <p>Our online SYNTAX Score Complexity Calculator is an excellent tool for medical students and residents learning about coronary anatomy, or for patients trying to understand why their cardiologist recommended surgery over stenting.</p>
            <p>However, it is strictly an estimation tool. The exact interpretation of whether an artery is "severely tortuous" or "heavily calcified" requires clinical judgment and advanced imaging. Do not use this calculator to make diagnostic or treatment decisions. Always consult with a board-certified cardiovascular specialist regarding the management of coronary artery disease.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/syntax-score-complexity-calculator" />
          <PopularCalculators exclude="/calculator/syntax-score-complexity-calculator" />
        </div>
      </div>
    </>
  );
}
