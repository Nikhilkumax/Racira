"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Activity, ShieldAlert } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";

// 1. TypeScript Interfaces
interface RadiationInputs {
  totalDose: number; // Gy
  fractions: number;
  alphaBetaRatioTumor: number; // typically 10
  alphaBetaRatioNormal: number; // typically 3
}

interface RadiationResults {
  dosePerFraction: number;
  tumorBED: number;
  tumorEQD2: number;
  normalBED: number;
  normalEQD2: number;
  chartData: { name: string; bed: number; eqd2: number }[];
}

// 2. Pure Calculation Function
const calculateRadiation = (inputs: RadiationInputs): RadiationResults | null => {
  const { totalDose, fractions, alphaBetaRatioTumor, alphaBetaRatioNormal } = inputs;
  
  if (totalDose <= 0 || fractions <= 0 || alphaBetaRatioTumor <= 0 || alphaBetaRatioNormal <= 0) return null;

  const dosePerFraction = totalDose / fractions;

  // BED = D * (1 + d / (a/b))
  const tumorBED = totalDose * (1 + (dosePerFraction / alphaBetaRatioTumor));
  const normalBED = totalDose * (1 + (dosePerFraction / alphaBetaRatioNormal));

  // EQD2 = D * [(d + a/b) / (2 + a/b)]
  const tumorEQD2 = totalDose * ((dosePerFraction + alphaBetaRatioTumor) / (2 + alphaBetaRatioTumor));
  const normalEQD2 = totalDose * ((dosePerFraction + alphaBetaRatioNormal) / (2 + alphaBetaRatioNormal));

  const chartData = [
    { name: "Tumor Tissue", bed: parseFloat(tumorBED.toFixed(1)), eqd2: parseFloat(tumorEQD2.toFixed(1)) },
    { name: "Normal Tissue", bed: parseFloat(normalBED.toFixed(1)), eqd2: parseFloat(normalEQD2.toFixed(1)) }
  ];

  return {
    dosePerFraction,
    tumorBED,
    tumorEQD2,
    normalBED,
    normalEQD2,
    chartData
  };
};

export default function RadiationDoseFractionationCalculator() {
  const [totalDose, setTotalDose] = useState<string>("60");
  const [fractions, setFractions] = useState<string>("30");
  const [alphaBetaTumor, setAlphaBetaTumor] = useState<string>("10");
  const [alphaBetaNormal, setAlphaBetaNormal] = useState<string>("3");
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [results, setResults] = useState<RadiationResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    const d = parseFloat(totalDose);
    const f = parseFloat(fractions);
    const at = parseFloat(alphaBetaTumor);
    const an = parseFloat(alphaBetaNormal);

    if (isNaN(d) || isNaN(f) || isNaN(at) || isNaN(an)) {
      setResults(null);
      return;
    }

    const inputs: RadiationInputs = { 
      totalDose: d, 
      fractions: f, 
      alphaBetaRatioTumor: at, 
      alphaBetaRatioNormal: an 
    };
    setResults(calculateRadiation(inputs));
  };

  const handleReset = () => {
    setTotalDose("60");
    setFractions("30");
    setAlphaBetaTumor("10");
    setAlphaBetaNormal("3");
    setShowAdvanced(false);
    setTimeout(handleCalculate, 10);
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalDose, fractions, alphaBetaTumor, alphaBetaNormal]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Radiation Dose Fractionation</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
          <p className="font-bold text-muted-foreground mb-1 border-b border-border pb-1">{payload[0].payload.name}</p>
          <div className="flex flex-col gap-1 mt-1">
            <p className="text-primary font-bold">EQD2: {payload[0].payload.eqd2} Gy</p>
            <p className="text-amber-500 font-bold">BED: {payload[0].payload.bed} Gy</p>
          </div>
        </div>
      );
    }
    return null;
  };

  const faqs = [
    { question: "What is the Linear-Quadratic (LQ) Model?", answer: "The LQ model is the fundamental radiobiological mathematical model used to predict how cells respond to radiation. It assumes cell death happens via two mechanisms: a 'linear' component (alpha) where a single radiation track breaks both DNA strands, and a 'quadratic' component (beta) where two separate tracks break the strands. The ratio between these two (Alpha/Beta) dictates how sensitive the tissue is to the size of the daily radiation dose (fraction)." },
    { question: "What is an Alpha/Beta Ratio?", answer: "This ratio determines a tissue's sensitivity to dose fractionation. An alpha/beta ratio of 10 Gy is typical for 'early-responding' tissues and most tumors, meaning they are less sensitive to changes in fraction size and more dependent on total dose. An alpha/beta ratio of 3 Gy is typical for 'late-responding' normal tissues (like the spinal cord or brain), meaning they are highly sensitive to the size of the daily dose and easily damaged by large single fractions." },
    { question: "What is Biologically Effective Dose (BED)?", answer: "BED is a theoretical number used to compare different radiation schedules. It represents the true biological 'weight' of a radiation course. Because 60 Gy delivered in 30 days has a vastly different biological effect than 60 Gy delivered in 3 days, BED provides a universal currency to compare them." },
    { question: "What is EQD2?", answer: "EQD2 stands for 'Equivalent Dose in 2 Gy fractions.' Because a 2 Gy daily fraction has historically been the standard in radiotherapy, clinicians are very comfortable understanding the side effects of regimens delivered at 2 Gy/day. EQD2 converts any weird or experimental fractionation schedule (like 8 Gy x 3 fractions) back into the 'standard 2 Gy' language, making it much easier for doctors to understand if the dose is safe or toxic." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Radiation Dose Fractionation Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Radiation Dose Fractionation (BED & EQD2)</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start max-w-[1100px]">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1 text-sm">
                <Activity className="h-4 w-4" /> Linear-Quadratic Model
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Calculate Biologically Effective Dose (BED) and Equivalent Dose in 2 Gy fractions (EQD2) to compare altered radiotherapy schedules.</p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col">
                <label className="flex items-center text-sm font-semibold text-foreground mb-1.5">Total Physical Dose (D)</label>
                <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                  <input
                    type="number"
                    value={totalDose}
                    onChange={(e) => setTotalDose(e.target.value)}
                    className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground"
                  />
                  <span className="pr-3 pl-1 text-sm font-bold text-muted-foreground select-none pointer-events-none shrink-0">Gy</span>
                </div>
              </div>

              <div className="flex flex-col">
                <label className="flex items-center text-sm font-semibold text-foreground mb-1.5">Number of Fractions (n)</label>
                <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                  <input
                    type="number"
                    value={fractions}
                    onChange={(e) => setFractions(e.target.value)}
                    className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground"
                  />
                </div>
              </div>

              <div>
                <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                  Alpha/Beta Ratios (α/β) <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
                </button>
                {showAdvanced && (
                  <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                    <div className="flex flex-col">
                      <label className="text-[10px] font-bold text-foreground mb-1 uppercase tracking-wider">Tumor (Acute)</label>
                      <input
                        type="number"
                        value={alphaBetaTumor}
                        onChange={(e) => setAlphaBetaTumor(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm outline-none focus:border-primary transition-all"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[10px] font-bold text-foreground mb-1 uppercase tracking-wider">Normal (Late)</label>
                      <input
                        type="number"
                        value={alphaBetaNormal}
                        onChange={(e) => setAlphaBetaNormal(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm outline-none focus:border-primary transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-4 pt-4 border-t border-border">
              <button type="button" onClick={handleReset} className="w-full rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center font-bold text-sm">
                <RotateCcw className="h-4 w-4 mr-2" /> Reset Schedule
              </button>
            </div>
          </div>

          {/* RIGHT: Results */}
          <div className="flex flex-col gap-4">
            {results ? (
              <div ref={printRef} className="flex flex-col gap-4 animate-fade-in-up">
                
                {/* 1. Primary Result Card (Tumor) */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-6 relative overflow-hidden shadow-sm">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors print:hidden z-10" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="relative z-10">
                    <div className="text-xs font-bold uppercase tracking-wider mb-1 text-primary">
                      Standardized Tumor EQD2 (α/β = {alphaBetaTumor})
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <div className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                        {results.tumorEQD2.toFixed(1)}
                      </div>
                      <div className="text-xl font-bold text-muted-foreground">Gy</div>
                    </div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold mt-2 bg-background/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border">
                       Dose per fraction: {results.dosePerFraction.toFixed(2)} Gy
                    </div>
                  </div>
                  <Activity className="absolute -bottom-4 -right-4 h-32 w-32 opacity-5 text-primary" />
                </div>

                {/* 2. Detailed Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                      <ShieldAlert className="h-4 w-4 text-amber-500" />
                      <div className="text-xs font-bold uppercase tracking-wider text-foreground">Tumor / Acute Tissue</div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">EQD2</div>
                        <div className="text-2xl font-bold text-primary">{results.tumorEQD2.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">Gy</span></div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">BED</div>
                        <div className="text-lg font-bold text-foreground">{results.tumorBED.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">Gy</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                      <ShieldAlert className="h-4 w-4 text-green-500" />
                      <div className="text-xs font-bold uppercase tracking-wider text-foreground">Normal / Late Tissue</div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">EQD2</div>
                        <div className="text-2xl font-bold text-primary">{results.normalEQD2.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">Gy</span></div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">BED</div>
                        <div className="text-lg font-bold text-foreground">{results.normalBED.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">Gy</span></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm min-h-[300px] flex flex-col">
                  <h3 className="text-sm font-bold mb-4">Biological vs Physical Dose Comparison</h3>
                  <div className="flex-grow">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                        <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.2)' }} />
                        <Bar dataKey="eqd2" name="EQD2" radius={[4, 4, 0, 0]} maxBarSize={40} fill="hsl(var(--primary))" />
                        <Bar dataKey="bed" name="BED" radius={[4, 4, 0, 0]} maxBarSize={40} fill="#f59e0b" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-4 mt-4 text-xs font-semibold">
                    <div className="flex items-center gap-1.5 text-muted-foreground"><span className="w-3 h-3 rounded-sm bg-primary"></span> EQD2</div>
                    <div className="flex items-center gap-1.5 text-muted-foreground"><span className="w-3 h-3 rounded-sm bg-amber-500"></span> BED</div>
                  </div>
                </div>

              </div>
            ) : null}
          </div>
        </div>

        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding Radiation Dose Fractionation (BED & EQD2)</h2>
            <p>In modern oncology, radiation therapy is a cornerstone of cancer treatment. However, prescribing radiation is not as simple as giving a patient a total physical dose (e.g., 60 Gray) all at once. Delivering massive amounts of radiation in a single burst causes catastrophic damage to healthy, normal tissues. To protect the patient, radiation oncologists use "fractionation"—splitting the total dose into small daily treatments (fractions) delivered over several weeks. Our <strong>Radiation Dose Fractionation Calculator</strong> uses the Linear-Quadratic (LQ) model to calculate the true biological effect of these altered schedules, generating the Biologically Effective Dose (BED) and the Equivalent Dose in 2 Gy fractions (EQD2).</p>

            <h2 className="text-2xl font-bold mb-3">Why We Fractionate Radiation</h2>
            <p>The success of radiotherapy relies on a biological loophole known as the "therapeutic index." Normal, healthy cells possess highly efficient DNA repair mechanisms. If you give a small dose of radiation (like 2 Gray), both the tumor and the surrounding healthy tissue will suffer DNA damage. However, within 24 hours, the healthy tissue will largely repair its sublethal DNA damage. The chaotic, rapidly dividing tumor cells have defective repair mechanisms, and the damage becomes permanent.</p>
            <p>By delivering small fractions of radiation every single day (typically Monday through Friday), we exploit this difference. The healthy tissue continually recovers, while the tumor accumulates lethal, unrepairable damage until it is eradicated.</p>

            <h2 className="text-2xl font-bold mb-3">The Linear-Quadratic (LQ) Model</h2>
            <p>The LQ model is the mathematical foundation of modern radiobiology. It states that radiation causes cell death via two distinct mechanisms:</p>
            <ul>
              <li><strong>Alpha (Linear) Kill:</strong> A single, high-energy particle cleanly breaks both strands of DNA simultaneously. This is unrepairable and is directly proportional to the total dose, regardless of the fraction size.</li>
              <li><strong>Beta (Quadratic) Kill:</strong> Two separate, lower-energy particles break one strand each, close together in space and time, creating a double-strand break. This mechanism is highly dependent on the "density" or size of the daily dose fraction.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">The Alpha/Beta Ratio (α/β)</h2>
            <p>The ratio of these two mechanisms (Alpha divided by Beta) is known as the α/β ratio, expressed in Grays (Gy). It tells us how sensitive a specific type of tissue is to the size of the daily fraction.</p>
            <p><strong>Tumors & Early Responding Tissues (α/β ≈ 10 Gy):</strong> Skin, mucous membranes, and most aggressive tumors have a high ratio. This means their cell death is driven mostly by the alpha mechanism. They are highly dependent on the total physical dose but are relatively insensitive to the size of the daily fraction.</p>
            <p><strong>Late Responding Normal Tissues (α/β ≈ 3 Gy):</strong> Spinal cord, brain, kidneys, and connective tissue have a low ratio. Their cell death is heavily dependent on the beta mechanism. These tissues are incredibly sensitive to the size of the daily dose. If you deliver large fractions (hypofractionation), these tissues will suffer massive, catastrophic late-stage damage (like paralysis or fibrosis) months or years after treatment.</p>

            <h2 className="text-2xl font-bold mb-3">Biologically Effective Dose (BED)</h2>
            <p>Because physical dose (total Gy) does not account for the biological repair between fractions, we use BED to compare the true "weight" of different schedules. For example, 60 Gy delivered in 30 fractions (2 Gy/day) has a BED of 72 Gy for a tumor. But if you try to deliver 60 Gy in just 3 massive fractions (20 Gy/day), the tumor BED skyrockets to 180 Gy. BED allows oncologists to mathematically ensure that a new, shorter treatment schedule will actually kill the tumor without exceeding the toxic limits of the surrounding organs.</p>

            <h2 className="text-2xl font-bold mb-3">Equivalent Dose in 2 Gy Fractions (EQD2)</h2>
            <p>While BED is useful, the numbers are theoretical and abstract. For decades, the global standard for radiotherapy has been delivering 2 Gy per day. Therefore, oncologists know intuitively that a spinal cord can tolerate 50 Gy (delivered in 2 Gy fractions) before risking paralysis. But what if you are treating a patient with 8 Gy fractions? How do you know if the spinal cord is safe?</p>
            <p>The EQD2 formula translates any bizarre or hypofractionated schedule back into the familiar "2 Gy equivalent" language. By using our calculator, if a hypofractionated regimen yields an EQD2 of 45 Gy for normal tissue, the doctor knows immediately that the spinal cord is safe, because 45 is less than the known 50 Gy threshold.</p>

            <h2 className="text-2xl font-bold mb-3">Clinical Uses: Hypofractionation and SBRT</h2>
            <p>In the past, patients had to come to the clinic 5 days a week for 8 weeks (40 fractions) for prostate cancer. Today, using advanced imaging and robotics, we use Stereotactic Body Radiotherapy (SBRT) to deliver massive doses (like 8 Gy per day) in just 5 days. Our BED and EQD2 calculator is the exact mathematical tool physicists use to prove that these ultra-short, highly convenient 5-day schedules deliver the exact same biological tumor-killing power as the old 8-week regimens, fundamentally transforming modern cancer care.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/radiation-dose-fractionation-calculator" />
          <PopularCalculators exclude="/calculator/radiation-dose-fractionation-calculator" />
        </div>
      </div>
    </>
  );
}
