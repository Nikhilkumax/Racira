"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, RotateCcw, Calculator, HeartPulse } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

interface QtcInputs {
  qtInterval: number;
  qtUnit: "msec" | "sec";
  rateType: "hr" | "rr";
  heartRate: number;
  rrInterval: number;
  rrUnit: "msec" | "sec";
  gender: "male" | "female";
}

interface QtcResult {
  bazett: number;
  fridericia: number;
  framingham: number;
  hodges: number;
  riskLevel: string;
  chartData: { name: string; value: number; fill: string }[];
  isProlonged: boolean;
  threshold: number;
}

const DEFAULTS = {
  qtInterval: "400",
  qtUnit: "msec" as const,
  rateType: "hr" as const,
  heartRate: "60",
  rrInterval: "1000",
  rrUnit: "msec" as const,
  gender: "male" as const,
};

const calculateQtc = (inputs: QtcInputs): QtcResult => {
  // Convert QT to seconds for calculation
  const qtSec = inputs.qtUnit === "msec" ? inputs.qtInterval / 1000 : inputs.qtInterval;
  
  // Determine RR in seconds and HR
  let rrSec = 0;
  let hr = 0;

  if (inputs.rateType === "hr") {
    hr = inputs.heartRate;
    rrSec = hr > 0 ? 60 / hr : 0;
  } else {
    rrSec = inputs.rrUnit === "msec" ? inputs.rrInterval / 1000 : inputs.rrInterval;
    hr = rrSec > 0 ? 60 / rrSec : 0;
  }

  // Formulas
  let bazett = 0;
  let fridericia = 0;
  let framingham = 0;
  let hodges = 0;

  if (rrSec > 0 && qtSec > 0) {
    bazett = qtSec / Math.sqrt(rrSec);
    fridericia = qtSec / Math.cbrt(rrSec);
    framingham = qtSec + 0.154 * (1 - rrSec);
    hodges = qtSec + 1.75 * ((hr / 60) - 1); // Hodges uses HR, usually expressed as qtSec + 0.00175 * (HR - 60) if QT in ms. 1.75 assumes sec. Wait.
    // Let's use the standard msec version for hodges, then convert to sec.
    // Hodges (msec) = QT(msec) + 1.75 * (HR - 60)
    const qtMsec = qtSec * 1000;
    hodges = (qtMsec + 1.75 * (hr - 60)) / 1000;
  }

  // Convert all to msec for display
  const bazettMs = Math.round(bazett * 1000);
  const fridericiaMs = Math.round(fridericia * 1000);
  const framinghamMs = Math.round(framingham * 1000);
  const hodgesMs = Math.round(hodges * 1000);

  // Thresholds (Commonly >440ms for men, >460ms for women is prolonged)
  // >500ms is high risk for Torsades de Pointes
  const threshold = inputs.gender === "male" ? 440 : 460;
  const isProlonged = bazettMs > threshold;
  
  let riskLevel = "Normal";
  let fillStatus = "#10b981"; // green
  if (bazettMs > 500) {
    riskLevel = "High Risk (>500ms)";
    fillStatus = "#ef4444"; // red
  } else if (bazettMs > threshold) {
    riskLevel = "Prolonged";
    fillStatus = "#f59e0b"; // yellow
  }

  const chartData = [
    { name: "Bazett", value: bazettMs, fill: fillStatus },
    { name: "Fridericia", value: fridericiaMs, fill: "#3b82f6" },
    { name: "Framingham", value: framinghamMs, fill: "#8b5cf6" },
    { name: "Hodges", value: hodgesMs, fill: "#6366f1" },
  ];

  return {
    bazett: bazettMs,
    fridericia: fridericiaMs,
    framingham: framinghamMs,
    hodges: hodgesMs,
    riskLevel,
    chartData,
    isProlonged,
    threshold
  };
};

const CompactInput = ({
  id, label, value, onChange, prefix, suffix, type = "number", ...props
}: {
  id: string; label: string; value: string; onChange: (val: string) => void;
  prefix?: string; suffix?: string; type?: string; [key: string]: unknown;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none shrink-0">{prefix}</span>}
      <input
        id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground"
        {...props}
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

interface TooltipProps {
  active?: boolean;
  payload?: { name: string; value: number }[];
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold text-muted-foreground mb-0.5">{payload[0].name}</p>
        <p className="text-primary font-extrabold text-sm">{payload[0].value} ms</p>
      </div>
    );
  }
  return null;
};

export default function CorrectedQtIntervalCalculator() {
  const [qtInterval, setQtInterval] = useState(DEFAULTS.qtInterval);
  const [qtUnit, setQtUnit] = useState<"msec" | "sec">(DEFAULTS.qtUnit);
  const [rateType, setRateType] = useState<"hr" | "rr">(DEFAULTS.rateType);
  const [heartRate, setHeartRate] = useState(DEFAULTS.heartRate);
  const [rrInterval, setRrInterval] = useState(DEFAULTS.rrInterval);
  const [rrUnit, setRrUnit] = useState<"msec" | "sec">(DEFAULTS.rrUnit);
  const [gender, setGender] = useState<"male" | "female">(DEFAULTS.gender);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<QtcResult | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    handleCalculate();
  }, []);

  const handleCalculate = () => {
    const inputs: QtcInputs = {
      qtInterval: parseFloat(qtInterval) || 0,
      qtUnit,
      rateType,
      heartRate: parseFloat(heartRate) || 0,
      rrInterval: parseFloat(rrInterval) || 0,
      rrUnit,
      gender,
    };
    setResult(calculateQtc(inputs));
  };

  const reset = () => {
    setQtInterval(DEFAULTS.qtInterval);
    setQtUnit(DEFAULTS.qtUnit);
    setRateType(DEFAULTS.rateType);
    setHeartRate(DEFAULTS.heartRate);
    setRrInterval(DEFAULTS.rrInterval);
    setRrUnit(DEFAULTS.rrUnit);
    setGender(DEFAULTS.gender);
    setShowAdvanced(false);

    setResult(calculateQtc({
      qtInterval: parseFloat(DEFAULTS.qtInterval),
      qtUnit: DEFAULTS.qtUnit,
      rateType: DEFAULTS.rateType,
      heartRate: parseFloat(DEFAULTS.heartRate),
      rrInterval: parseFloat(DEFAULTS.rrInterval),
      rrUnit: DEFAULTS.rrUnit,
      gender: DEFAULTS.gender,
    }));
  };

  const faqs = [
    { question: "What is the Corrected QT Interval (QTc)?", answer: "The QT interval represents the time it takes for the heart's ventricles to depolarize and repolarize (contract and recover) during a heartbeat. Because the QT interval naturally shortens when the heart rate increases and lengthens when it slows down, it must be 'corrected' (QTc) to a standardized heart rate of 60 beats per minute to determine if it is truly abnormally prolonged." },
    { question: "What is considered a normal QTc?", answer: "A normal QTc interval is generally considered to be under 440 milliseconds for men and under 460 milliseconds for women. A QTc over 500 milliseconds in either gender is considered highly prolonged and carries a significantly increased risk of life-threatening arrhythmias, specifically Torsades de Pointes." },
    { question: "Why are there different QTc formulas?", answer: "The Bazett formula is the most widely used clinically and is built into most ECG machines. However, it is known to overcorrect at high heart rates (&gt;90 bpm) and undercorrect at low heart rates (&lt;50 bpm). To address this, other formulas like Fridericia (cube root), Framingham (linear regression), and Hodges were developed. Fridericia and Framingham are often preferred when the patient has severe tachycardia or bradycardia." },
    { question: "What causes a prolonged QTc interval?", answer: "A prolonged QTc can be congenital (Long QT Syndrome) or acquired. Acquired causes are much more common and include electrolyte imbalances (especially low potassium, low magnesium, or low calcium) and medications. Hundreds of common drugs—including certain antibiotics, antidepressants, antipsychotics, and antiarrhythmics—can prolong the QTc." },
    { question: "What is Torsades de Pointes?", answer: "Torsades de Pointes (TdP) is a specific, dangerous type of polymorphic ventricular tachycardia associated with a prolonged QTc interval. It can cause palpitations, dizziness, syncope (fainting), and in severe cases, it can degenerate into ventricular fibrillation, leading to sudden cardiac death." },
    { question: "How do I measure the QT interval?", answer: "The QT interval is measured on an ECG from the beginning of the QRS complex to the end of the T wave. It is best measured in leads II or V5-V6. The end of the T wave is defined by the intersection of the tangent to the steepest descending slope of the T wave and the isoelectric baseline." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Corrected QT Interval (QTc) Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Corrected QT Interval (QTc) Calculator</h1>
        
        <div className="bg-destructive/10 border-l-4 border-destructive text-destructive p-4 rounded-r-lg text-sm mb-6 max-w-[1180px]">
          <strong>Disclaimer:</strong> This tool is for educational and informational purposes only and is not intended to provide medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional.
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT COLUMN: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            {/* Normal Tier */}
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <CompactInput
                    id="qt-interval"
                    label="QT Interval"
                    value={qtInterval}
                    onChange={setQtInterval}
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="flex items-center text-sm font-semibold text-foreground mb-1">Unit</label>
                  <select
                    value={qtUnit}
                    onChange={(e) => setQtUnit(e.target.value as "msec" | "sec")}
                    className="w-full h-10 px-3 py-1 text-sm bg-background border border-input rounded-md shadow-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                  >
                    <option value="msec">msec</option>
                    <option value="sec">sec</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col">
                <label className="flex items-center text-sm font-semibold text-foreground mb-1">
                  Calculation Method
                </label>
                <div className="flex rounded-md border border-input overflow-hidden h-10 w-full mb-3">
                  <button
                    type="button"
                    onClick={() => setRateType("hr")}
                    className={`flex-1 text-sm font-semibold transition-colors ${
                      rateType === "hr"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    }`}
                  >
                    Heart Rate
                  </button>
                  <button
                    type="button"
                    onClick={() => setRateType("rr")}
                    className={`flex-1 text-sm font-semibold transition-colors border-l border-input ${
                      rateType === "rr"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    }`}
                  >
                    R-R Interval
                  </button>
                </div>

                {rateType === "hr" ? (
                  <CompactInput
                    id="heart-rate"
                    label="Heart Rate"
                    value={heartRate}
                    onChange={setHeartRate}
                    suffix="bpm"
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <CompactInput
                      id="rr-interval"
                      label="R-R Interval"
                      value={rrInterval}
                      onChange={setRrInterval}
                    />
                    <div>
                      <label className="flex items-center text-sm font-semibold text-foreground mb-1">Unit</label>
                      <select
                        value={rrUnit}
                        onChange={(e) => setRrUnit(e.target.value as "msec" | "sec")}
                        className="w-full h-10 px-3 py-1 text-sm bg-background border border-input rounded-md shadow-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                      >
                        <option value="msec">msec</option>
                        <option value="sec">sec</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Advanced Tier */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none"
              >
                Patient Details
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>

              {showAdvanced && (
                <div className="grid grid-cols-1 gap-3 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <div className="flex flex-col">
                    <label className="flex items-center text-sm font-semibold text-foreground mb-1">
                      Biological Sex (determines thresholds)
                    </label>
                    <div className="flex rounded-md border border-input overflow-hidden h-10 w-full">
                      <button
                        type="button"
                        onClick={() => setGender("male")}
                        className={`flex-1 text-sm font-semibold transition-colors ${
                          gender === "male"
                            ? "bg-primary text-primary-foreground"
                            : "bg-background text-muted-foreground hover:bg-secondary/80"
                        }`}
                      >
                        Male (&le;440ms)
                      </button>
                      <button
                        type="button"
                        onClick={() => setGender("female")}
                        className={`flex-1 text-sm font-semibold transition-colors border-l border-input ${
                          gender === "female"
                            ? "bg-primary text-primary-foreground"
                            : "bg-background text-muted-foreground hover:bg-secondary/80"
                        }`}
                      >
                        Female (&le;460ms)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 mt-2">
              <button
                type="button"
                onClick={handleCalculate}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm"
              >Calculate</button>
              <button
                type="button"
                onClick={reset}
                className="w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center focus:outline-none"
                aria-label="Reset"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: RESULTS */}
          <div className="flex flex-col gap-4">
            {result && (
              <>
                {/* 1. Primary Result Card */}
                <div className={`border-l-4 rounded-lg p-5 ${result.isProlonged ? 'bg-destructive/10 border-destructive' : 'bg-primary/10 border-primary'}`}>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-1">QTc (Bazett's Formula)</p>
                  <p className={`text-4xl font-black ${result.isProlonged ? 'text-destructive' : 'text-primary'}`}>{result.bazett} ms</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Assessment: <strong className={result.isProlonged ? 'text-destructive' : 'text-green-600'}>{result.riskLevel}</strong>
                  </p>
                </div>

                {/* 2. 4-Stat Bar */}
                <div className="grid grid-cols-4 gap-0 border border-border rounded-lg overflow-hidden bg-card divide-x divide-border">
                  <div className="p-4 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Bazett</p>
                    <p className={`text-base font-bold ${result.bazett > result.threshold ? 'text-destructive' : 'text-foreground'}`}>{result.bazett}</p>
                  </div>
                  <div className="p-4 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Fridericia</p>
                    <p className={`text-base font-bold ${result.fridericia > result.threshold ? 'text-destructive' : 'text-foreground'}`}>{result.fridericia}</p>
                  </div>
                  <div className="p-4 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Framingham</p>
                    <p className={`text-base font-bold ${result.framingham > result.threshold ? 'text-destructive' : 'text-foreground'}`}>{result.framingham}</p>
                  </div>
                  <div className="p-4 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Hodges</p>
                    <p className={`text-base font-bold ${result.hodges > result.threshold ? 'text-destructive' : 'text-foreground'}`}>{result.hodges}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* 3. Bar Chart */}
                  {mounted && (
                    <div className="border border-border rounded-lg bg-card p-4 flex flex-col">
                      <p className="text-sm font-semibold text-foreground mb-4 text-center">Formula Comparison</p>
                      <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={result.chartData} barCategoryGap="20%" margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={{ stroke: "hsl(var(--border))" }} />
                            <YAxis domain={[300, 600]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                            <RechartsTooltip cursor={{ fill: "hsl(var(--secondary))" }} content={<CustomTooltip />} />
                            <ReferenceLine y={result.threshold} stroke="hsl(var(--destructive))" strokeDasharray="3 3" label={{ position: 'top', value: 'Threshold', fill: 'hsl(var(--destructive))', fontSize: 10 }} />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                              {result.chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* 4. Table Summary */}
                  <div className="bg-card border border-border rounded-lg p-0 flex flex-col overflow-hidden">
                    <p className="text-sm font-semibold text-foreground p-4 pb-2 text-center border-b border-border">Reference Thresholds</p>
                    <div className="overflow-y-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 border-b border-border">
                          <tr>
                            <th className="font-semibold text-muted-foreground px-4 py-2 uppercase text-[10px] tracking-wide">Category</th>
                            <th className="font-semibold text-muted-foreground px-4 py-2 uppercase text-[10px] tracking-wide">Male</th>
                            <th className="font-semibold text-muted-foreground px-4 py-2 uppercase text-[10px] tracking-wide">Female</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-xs">
                          <tr className="hover:bg-muted/30">
                            <td className="px-4 py-2 font-medium text-green-600">Normal</td>
                            <td className="px-4 py-2">&le; 430 ms</td>
                            <td className="px-4 py-2">&le; 450 ms</td>
                          </tr>
                          <tr className="hover:bg-muted/30">
                            <td className="px-4 py-2 font-medium text-yellow-600">Borderline</td>
                            <td className="px-4 py-2">431 - 450 ms</td>
                            <td className="px-4 py-2">451 - 470 ms</td>
                          </tr>
                          <tr className="hover:bg-muted/30">
                            <td className="px-4 py-2 font-medium text-orange-600">Prolonged</td>
                            <td className="px-4 py-2">451 - 499 ms</td>
                            <td className="px-4 py-2">471 - 499 ms</td>
                          </tr>
                          <tr className="bg-destructive/5 hover:bg-destructive/10">
                            <td className="px-4 py-2 font-bold text-destructive">High Risk</td>
                            <td className="px-4 py-2 font-bold">&ge; 500 ms</td>
                            <td className="px-4 py-2 font-bold">&ge; 500 ms</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

              </>
            )}
          </div>
        </div>

        {/* SEO CONTENT SECTION */}
        <div className="max-w-[1180px] mt-12">
          <AdPlaceholder className="mb-10" />
          
          <div className="bg-card rounded-xl border border-border p-8 mb-12 shadow-sm">
            <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Complete Clinical Guide to the QTc Interval</h2>
            </div>

            <div className="prose prose-slate max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary">
              <section className="mb-8">
                <h3 className="text-xl font-semibold mb-3">Understanding the QT Interval</h3>
                <p>
                  The electrocardiogram (ECG or EKG) records the electrical activity of the heart. The QT interval is measured from the beginning of the QRS complex to the end of the T wave. Physiologically, it represents the time required for ventricular depolarization (contraction) and subsequent repolarization (recovery). It is a critical marker of the heart's electrical stability.
                </p>
                <p>
                  However, the uncorrected QT interval is clinically useless in isolation because it is inversely proportional to the heart rate. When the heart beats faster (tachycardia), the QT interval naturally shortens. When the heart beats slower (bradycardia), the QT interval lengthens. To determine if a patient's repolarization is truly delayed and pathological, we must calculate the <strong>Corrected QT Interval (QTc)</strong>, which normalizes the measurement to a standard heart rate of 60 beats per minute.
                </p>
              </section>

              <section className="mb-8">
                <h3 className="text-xl font-semibold mb-3">Why a Prolonged QTc is Dangerous</h3>
                <p>
                  A prolonged QTc interval indicates delayed ventricular repolarization. This electrical instability creates a vulnerable window during which an early afterdepolarization (a premature heartbeat) can trigger a life-threatening polymorphic ventricular tachycardia known as <strong>Torsades de Pointes (TdP)</strong>.
                </p>
                <p>
                  Torsades de Pointes can cause symptoms ranging from palpitations, dizziness, and syncope (fainting) to sudden cardiac arrest and death if the arrhythmia degenerates into ventricular fibrillation. The risk of TdP increases exponentially as the QTc interval lengthens, particularly when the QTc exceeds 500 milliseconds.
                </p>
              </section>

              <section className="mb-8">
                <h3 className="text-xl font-semibold mb-3">The Four Main Correction Formulas</h3>
                <p>
                  Because the relationship between heart rate and the QT interval is complex and non-linear, several mathematical formulas have been developed over the last century to correct it. Our calculator provides results for all four major formulas simultaneously:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-2">
                  <li><strong>Bazett's Formula (QTc = QT / &radic;RR):</strong> The oldest (1920) and most widely used clinically. It is the default on almost all automated ECG machines. However, it is fundamentally flawed at extremes of heart rate. It overcorrects (falsely prolongs the QTc) at high heart rates (&gt;90 bpm) and undercorrects at low heart rates (&lt;50 bpm).</li>
                  <li><strong>Fridericia's Formula (QTc = QT / &#8731;RR):</strong> Uses a cube root rather than a square root. It provides a much more accurate correction at heart rates above 90 bpm and is increasingly preferred by electrophysiologists and the FDA in drug safety trials.</li>
                  <li><strong>Framingham Formula (QTc = QT + 0.154 &times; (1 - RR)):</strong> Developed from the Framingham Heart Study using linear regression data from thousands of patients. It is highly accurate across a wide range of normal heart rates.</li>
                  <li><strong>Hodges Formula (QTc = QT + 1.75 &times; (HR - 60)):</strong> A linear formula that uses Heart Rate rather than the RR interval. Like Fridericia, it is highly accurate at faster heart rates and avoids the extreme overcorrection seen with Bazett's formula.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h3 className="text-xl font-semibold mb-3">Normal Values and Clinical Thresholds</h3>
                <p>
                  Thresholds for a normal QTc vary slightly by biological sex due to hormonal influences on cardiac repolarization (estrogen prolongs the QT, testosterone shortens it). General guidelines dictate:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-2">
                  <li><strong>Normal:</strong> &le;430 ms (Adult Males) / &le;450 ms (Adult Females)</li>
                  <li><strong>Borderline:</strong> 431-450 ms (Adult Males) / 451-470 ms (Adult Females)</li>
                  <li><strong>Prolonged:</strong> &gt;450 ms (Adult Males) / &gt;470 ms (Adult Females)</li>
                  <li><strong>High Risk:</strong> &ge;500 ms (Both sexes). A QTc over 500 ms is a critical finding requiring immediate clinical intervention and medication review.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h3 className="text-xl font-semibold mb-3">Causes of QTc Prolongation</h3>
                <p>
                  QTc prolongation can be congenital or acquired. Acquired prolongation is vastly more common in clinical practice. The primary culprits are:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-2">
                  <li><strong>Electrolyte Abnormalities:</strong> Hypokalemia (low potassium), hypomagnesemia (low magnesium), and hypocalcemia (low calcium).</li>
                  <li><strong>Medications:</strong> Hundreds of drugs block the hERG potassium channels in the heart. Common offenders include macrolide antibiotics (Azithromycin), fluoroquinolones (Ciprofloxacin), antipsychotics (Haloperidol, Quetiapine), antidepressants (Citalopram, Amitriptyline), antiarrhythmics (Amiodarone, Sotalol), and antiemetics (Ondansetron).</li>
                  <li><strong>Cardiac Ischemia:</strong> Acute myocardial infarction or severe coronary artery disease.</li>
                  <li><strong>Neurological Events:</strong> Acute subarachnoid hemorrhage or massive stroke.</li>
                  <li><strong>Congenital Long QT Syndrome (LQTS):</strong> Genetic mutations affecting cardiac ion channels.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">How to Manually Measure the QT Interval</h3>
                <p>
                  To use this calculator accurately, you must first measure the raw QT interval from the ECG printout. Use leads II or V5/V6, as they typically display the clearest T wave. Measure from the very first deflection of the QRS complex to the end of the T wave. 
                </p>
                <p>
                  The end of the T wave is defined by the "tangent method": draw a line along the steepest descending slope of the T wave. Where this line intersects the isoelectric baseline is the end of the QT interval. Do not include prominent U waves unless they are fused to the T wave and cannot be separated. Measure 3-5 consecutive beats and calculate the average QT interval for the highest accuracy.
                </p>
              </section>
            </div>
          </div>

          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/corrected-qt-interval-calculator" />
          <PopularCalculators exclude="/calculator/corrected-qt-interval-calculator" />
        </div>
      </div>
    </>
  );
}
