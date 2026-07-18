"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, HeartPulse } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// 1. TypeScript Interfaces
interface ASCVDInputs {
  age: number; // 20-79
  sex: "male" | "female";
  race: "white" | "aa" | "other";
  totalCholesterol: number; // mg/dL (130-320)
  hdlCholesterol: number; // mg/dL (20-100)
  systolicBP: number; // mmHg (90-200)
  bpTreatment: boolean;
  smoker: boolean;
  diabetes: boolean;
}

interface ASCVDResults {
  tenYearRisk: number; // Percentage
  optimalRisk: number; // Percentage if all factors were optimal
  riskCategory: "Low Risk" | "Borderline Risk" | "Intermediate Risk" | "High Risk";
  recommendation: string;

  chartData: { name: string; Risk: number; color: string }[];
  summaryStats: { label: string; value: string; colorClass?: string }[];
}

// 2. Pure Calculation Function (2013 ACC/AHA Pooled Cohort Equations)
const calculateASCVD = (inputs: ASCVDInputs): ASCVDResults | null => {
  const { age, sex, race, totalCholesterol, hdlCholesterol, systolicBP, bpTreatment, smoker, diabetes } = inputs;
  
  if (age < 20 || age > 79 || totalCholesterol <= 0 || hdlCholesterol <= 0 || systolicBP <= 0) return null;

  const lnAge = Math.log(age);
  const lnTotalChol = Math.log(totalCholesterol);
  const lnHdl = Math.log(hdlCholesterol);
  const lnSbp = Math.log(systolicBP);

  let sum = 0;
  let meanSum = 0;
  let baselineSurvival = 0;
  let optimalSum = 0;

  // PCE Coefficients
  if (sex === "female" && (race === "white" || race === "other")) {
    sum = (-29.799 * lnAge) + (4.884 * lnAge * lnAge) + (13.540 * lnTotalChol) + (-3.114 * lnAge * lnTotalChol) + (-13.578 * lnHdl) + (3.149 * lnAge * lnHdl);
    if (bpTreatment) sum += (2.019 * lnSbp); else sum += (1.957 * lnSbp);
    if (smoker) sum += 7.574 + (-1.665 * lnAge);
    if (diabetes) sum += 0.661;
    meanSum = -29.18;
    baselineSurvival = 0.9665;
    
    // Optimal (Chol=170, HDL=50, SBP=110, untrt, no smoke, no diab)
    optimalSum = (-29.799 * lnAge) + (4.884 * lnAge * lnAge) + (13.540 * Math.log(170)) + (-3.114 * lnAge * Math.log(170)) + (-13.578 * Math.log(50)) + (3.149 * lnAge * Math.log(50)) + (1.957 * Math.log(110));

  } else if (sex === "female" && race === "aa") {
    sum = (17.114 * lnAge) + (0.940 * lnTotalChol) + (-18.920 * lnHdl) + (4.475 * lnAge * lnHdl);
    if (bpTreatment) sum += (29.291 * lnSbp) + (-6.432 * lnAge * lnSbp); else sum += (27.820 * lnSbp) + (-6.087 * lnAge * lnSbp);
    if (smoker) sum += 0.691;
    if (diabetes) sum += 0.874;
    meanSum = 86.61;
    baselineSurvival = 0.9533;

    optimalSum = (17.114 * lnAge) + (0.940 * Math.log(170)) + (-18.920 * Math.log(50)) + (4.475 * lnAge * Math.log(50)) + (27.820 * Math.log(110)) + (-6.087 * lnAge * Math.log(110));

  } else if (sex === "male" && (race === "white" || race === "other")) {
    sum = (12.344 * lnAge) + (11.853 * lnTotalChol) + (-2.664 * lnAge * lnTotalChol) + (-7.990 * lnHdl) + (1.769 * lnAge * lnHdl);
    if (bpTreatment) sum += (1.797 * lnSbp); else sum += (1.764 * lnSbp);
    if (smoker) sum += 7.837 + (-1.795 * lnAge);
    if (diabetes) sum += 0.658;
    meanSum = 61.18;
    baselineSurvival = 0.9144;

    optimalSum = (12.344 * lnAge) + (11.853 * Math.log(170)) + (-2.664 * lnAge * Math.log(170)) + (-7.990 * Math.log(50)) + (1.769 * lnAge * Math.log(50)) + (1.764 * Math.log(110));

  } else if (sex === "male" && race === "aa") {
    sum = (2.469 * lnAge) + (0.302 * lnTotalChol) + (-0.307 * lnHdl);
    if (bpTreatment) sum += (1.916 * lnSbp); else sum += (1.809 * lnSbp);
    if (smoker) sum += 0.549;
    if (diabetes) sum += 0.645;
    meanSum = 19.54;
    baselineSurvival = 0.8954;

    optimalSum = (2.469 * lnAge) + (0.302 * Math.log(170)) + (-0.307 * Math.log(50)) + (1.809 * Math.log(110));
  }

  // Final 10-Year Risk calculation
  const risk = 1 - Math.pow(baselineSurvival, Math.exp(sum - meanSum));
  const tenYearRisk = risk * 100;

  const optRisk = 1 - Math.pow(baselineSurvival, Math.exp(optimalSum - meanSum));
  const optimalRisk = optRisk * 100;

  let riskCategory: ASCVDResults["riskCategory"] = "Low Risk";
  let recommendation = "";
  let colorClass = "text-primary";

  if (tenYearRisk >= 20) {
    riskCategory = "High Risk";
    recommendation = "High-intensity statin therapy is strongly recommended. Immediate lifestyle interventions and close medical monitoring are required.";
    colorClass = "text-red-500 font-bold";
  } else if (tenYearRisk >= 7.5) {
    riskCategory = "Intermediate Risk";
    recommendation = "Moderate-to-high intensity statin therapy should be initiated, alongside structured dietary and exercise modifications.";
    colorClass = "text-amber-500 font-bold";
  } else if (tenYearRisk >= 5) {
    riskCategory = "Borderline Risk";
    recommendation = "Consider statin therapy if risk enhancers are present. Focus heavily on diet, weight management, and smoking cessation.";
    colorClass = "text-yellow-600 font-bold";
  } else {
    riskCategory = "Low Risk";
    recommendation = "Statin therapy is generally not necessary. Maintain a heart-healthy lifestyle and re-assess in 4-6 years.";
    colorClass = "text-green-500 font-bold";
  }

  const chartData = [
    { name: "Your 10-Year Risk", Risk: parseFloat(tenYearRisk.toFixed(1)), color: tenYearRisk >= 20 ? "#ef4444" : tenYearRisk >= 7.5 ? "#f59e0b" : "hsl(var(--primary))" },
    { name: "Optimal Risk (Same Age)", Risk: parseFloat(optimalRisk.toFixed(1)), color: "#10b981" }
  ];

  const summaryStats = [
    { label: "10-Year ASCVD Risk", value: `${tenYearRisk.toFixed(1)}%`, colorClass: colorClass },
    { label: "Risk Classification", value: riskCategory, colorClass: colorClass },
    { label: "Optimal Target Risk", value: `${optimalRisk.toFixed(1)}%`, colorClass: "text-green-500 font-medium" },
    { label: "Relative Risk Multiple", value: `${(tenYearRisk / optimalRisk).toFixed(1)}x higher than optimal` }
  ];

  return {
    tenYearRisk,
    optimalRisk,
    riskCategory,
    recommendation,
    chartData,
    summaryStats
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  age: "55",
  sex: "male" as const,
  race: "white" as const,
  totalCholesterol: "210",
  hdlCholesterol: "45",
  systolicBP: "135",
  bpTreatment: false,
  smoker: false,
  diabetes: false
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold mb-0.5">{payload[0].payload.name}</p>
        <p className="text-muted-foreground">{payload[0].value}% Probability</p>
      </div>
    );
  }
  return null;
};

// Input Component
const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1.5">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
        {...props}
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

export default function CardiovascularRiskScoreCalculator() {
  // 4. Component State
  const [age, setAge] = useState(DEFAULTS.age);
  const [sex, setSex] = useState<"male" | "female">(DEFAULTS.sex);
  const [race, setRace] = useState<"white" | "aa" | "other">(DEFAULTS.race);
  const [totalCholesterol, setTotalCholesterol] = useState(DEFAULTS.totalCholesterol);
  const [hdlCholesterol, setHdlCholesterol] = useState(DEFAULTS.hdlCholesterol);
  const [systolicBP, setSystolicBP] = useState(DEFAULTS.systolicBP);
  const [bpTreatment, setBpTreatment] = useState(DEFAULTS.bpTreatment);
  const [smoker, setSmoker] = useState(DEFAULTS.smoker);
  const [diabetes, setDiabetes] = useState(DEFAULTS.diabetes);
  
  const [results, setResults] = useState<ASCVDResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    const inputs: ASCVDInputs = {
      age: parseInt(age) || 0,
      sex,
      race,
      totalCholesterol: parseInt(totalCholesterol) || 0,
      hdlCholesterol: parseInt(hdlCholesterol) || 0,
      systolicBP: parseInt(systolicBP) || 0,
      bpTreatment,
      smoker,
      diabetes
    };
    setResults(calculateASCVD(inputs));
  };

  const handleReset = () => {
    setAge(DEFAULTS.age);
    setSex(DEFAULTS.sex);
    setRace(DEFAULTS.race);
    setTotalCholesterol(DEFAULTS.totalCholesterol);
    setHdlCholesterol(DEFAULTS.hdlCholesterol);
    setSystolicBP(DEFAULTS.systolicBP);
    setBpTreatment(DEFAULTS.bpTreatment);
    setSmoker(DEFAULTS.smoker);
    setDiabetes(DEFAULTS.diabetes);
    
    setResults(calculateASCVD({
      age: parseInt(DEFAULTS.age),
      sex: DEFAULTS.sex,
      race: DEFAULTS.race,
      totalCholesterol: parseInt(DEFAULTS.totalCholesterol),
      hdlCholesterol: parseInt(DEFAULTS.hdlCholesterol),
      systolicBP: parseInt(DEFAULTS.systolicBP),
      bpTreatment: DEFAULTS.bpTreatment,
      smoker: DEFAULTS.smoker,
      diabetes: DEFAULTS.diabetes
    }));
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [age, sex, race, totalCholesterol, hdlCholesterol, systolicBP, bpTreatment, smoker, diabetes]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>ASCVD Risk Assessment</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "What is an ASCVD Risk Score?", answer: "ASCVD stands for Atherosclerotic Cardiovascular Disease. The 10-year risk score calculates the percentage probability that you will suffer from a major cardiovascular event (such as a heart attack or a stroke) within the next 10 years." },
    { question: "Why is an ASCVD score of 7.5% important?", answer: "Current medical guidelines from the American College of Cardiology and the American Heart Association state that a 10-year risk score of 7.5% or higher is the primary threshold for prescribing statin therapy to lower cholesterol and mitigate risk." },
    { question: "What is the difference between Total Cholesterol and HDL?", answer: "Total cholesterol is the total amount of lipid in your blood. HDL (High-Density Lipoprotein) is known as the 'good' cholesterol because it acts like a scavenger, carrying bad cholesterol away from your arteries and back to the liver. A higher HDL score actually lowers your ASCVD risk." },
    { question: "Why is 'Receiving Blood Pressure Treatment' a negative factor?", answer: "If your systolic blood pressure is 130 mmHg while you are taking medication, your natural unmedicated blood pressure is much higher. The medication is masking the true severity of the cardiovascular stress, meaning your overall risk profile is worse than someone whose natural, unmedicated blood pressure is 130 mmHg." },
    { question: "Can I lower my risk score?", answer: "Absolutely. While you cannot change your age, sex, or race, you can drastically alter the other variables. Quitting smoking, managing your diabetes, losing weight to lower your systolic blood pressure, and eating a Mediterranean diet to improve your cholesterol ratio will significantly plummet your 10-year risk." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Cardiovascular Risk Score Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">10-Year ASCVD Risk Score Calculator</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[560px_1fr] gap-6 items-start max-w-[1280px]">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <HeartPulse className="h-4 w-4" /> ACC/AHA Risk Estimator
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Calculate your 10-year probability of suffering a heart attack or stroke using the official Pooled Cohort Equations.</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <CompactInput id="age" label="Age (20-79)" value={age} onChange={setAge} />
              
              <div className="flex flex-col col-span-2">
                <label className="flex items-center text-sm font-semibold text-foreground mb-1.5">Biological Sex</label>
                <div className="flex p-1 bg-secondary rounded-lg border border-border">
                  <button type="button" onClick={() => setSex("male")} className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${sex === "male" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}>Male</button>
                  <button type="button" onClick={() => setSex("female")} className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${sex === "female" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}>Female</button>
                </div>
              </div>
            </div>

            <div className="flex flex-col mb-1">
              <label className="flex items-center text-sm font-semibold text-foreground mb-1.5">Race / Ethnicity</label>
              <div className="flex p-1 bg-secondary rounded-lg border border-border">
                <button type="button" onClick={() => setRace("white")} className={`flex-1 py-1.5 text-xs sm:text-sm font-bold rounded-md transition-all ${race === "white" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}>White</button>
                <button type="button" onClick={() => setRace("aa")} className={`flex-1 py-1.5 text-xs sm:text-sm font-bold rounded-md transition-all ${race === "aa" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}>African American</button>
                <button type="button" onClick={() => setRace("other")} className={`flex-1 py-1.5 text-xs sm:text-sm font-bold rounded-md transition-all ${race === "other" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}>Other</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <CompactInput id="tc" label="Total Cholesterol" value={totalCholesterol} onChange={setTotalCholesterol} suffix="mg/dL" />
              <CompactInput id="hdl" label="HDL (Good) Chol" value={hdlCholesterol} onChange={setHdlCholesterol} suffix="mg/dL" />
            </div>

            <div className="grid grid-cols-1 gap-4 mt-1">
              <CompactInput id="sbp" label="Systolic Blood Pressure (Top Number)" value={systolicBP} onChange={setSystolicBP} suffix="mmHg" />
            </div>

            <div className="h-px bg-border my-2"></div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Treatment Checkbox */}
              <label className={`flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${bpTreatment ? 'bg-primary/5 border-primary text-primary' : 'bg-background border-border text-foreground hover:border-primary/50'}`}>
                <input type="checkbox" className="sr-only" checked={bpTreatment} onChange={(e) => setBpTreatment(e.target.checked)} />
                <span className="text-xs font-bold text-center leading-tight mb-1">On BP Meds?</span>
                <span className="text-sm font-black">{bpTreatment ? "YES" : "NO"}</span>
              </label>

              {/* Diabetes Checkbox */}
              <label className={`flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${diabetes ? 'bg-amber-500/10 border-amber-500 text-amber-600' : 'bg-background border-border text-foreground hover:border-amber-500/50'}`}>
                <input type="checkbox" className="sr-only" checked={diabetes} onChange={(e) => setDiabetes(e.target.checked)} />
                <span className="text-xs font-bold text-center leading-tight mb-1">Diabetic?</span>
                <span className="text-sm font-black">{diabetes ? "YES" : "NO"}</span>
              </label>

              {/* Smoker Checkbox */}
              <label className={`flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${smoker ? 'bg-red-500/10 border-red-500 text-red-600' : 'bg-background border-border text-foreground hover:border-red-500/50'}`}>
                <input type="checkbox" className="sr-only" checked={smoker} onChange={(e) => setSmoker(e.target.checked)} />
                <span className="text-xs font-bold text-center leading-tight mb-1">Smoker?</span>
                <span className="text-sm font-black">{smoker ? "YES" : "NO"}</span>
              </label>
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
            {results ? (
              <div ref={printRef} className="flex flex-col gap-4">
                
                {/* 1. Primary Result Card */}
                <div className={`border-l-4 rounded-lg p-5 relative ${
                  results.riskCategory === "High Risk" ? "bg-red-500/10 border-red-500" :
                  results.riskCategory === "Intermediate Risk" ? "bg-amber-500/10 border-amber-500" :
                  results.riskCategory === "Borderline Risk" ? "bg-yellow-500/10 border-yellow-500" :
                  "bg-green-500/10 border-green-500"
                }`}>
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: results.chartData[0].color }}>
                    10-Year ASCVD Risk Probability
                  </div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <div className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">{results.tenYearRisk.toFixed(1)}</div>
                    <div className="text-xl font-bold text-muted-foreground">%</div>
                  </div>
                  <p className="text-sm font-medium text-foreground/80 leading-relaxed max-w-md">
                    <strong>Medical Action:</strong> {results.recommendation}
                  </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  {/* 3. Breakdown Table */}
                  <div className="bg-muted/30 border border-border rounded-lg p-5 h-full">
                    <h3 className="text-base font-bold mb-4">Risk Profile Analysis</h3>
                    <div className="grid grid-cols-1 gap-y-4 text-sm">
                      {results.summaryStats.map((stat, i) => (
                        <div key={i} className="flex justify-between items-center border-b border-border/40 pb-2 last:border-0 last:pb-0">
                          <span className="text-muted-foreground">{stat.label}:</span>
                          <span className={`font-semibold ${stat.colorClass || ''}`}>{stat.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. Chart */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[260px]">
                    <h3 className="text-base font-bold mb-4 w-full text-left">Your Risk vs Optimal Risk</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={results.chartData} margin={{ top: 20, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickMargin={8} tickFormatter={(val) => `${val}%`} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                        <Bar dataKey="Risk" radius={[4, 4, 0, 0]} maxBarSize={60}>
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <HeartPulse className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium">Enter your clinical lipid and blood pressure metrics to calculate your 10-year risk of cardiovascular disease.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding Your ASCVD Risk Score</h2>
            <p>Atherosclerotic Cardiovascular Disease (ASCVD) remains the leading cause of death globally. It is an umbrella term that encompasses conditions caused by the buildup of cholesterol plaque in the arteries, most notably leading to acute myocardial infarctions (heart attacks) and ischemic strokes. Because atherosclerosis is a silent disease that progresses over decades without symptoms, physicians cannot rely on how a patient "feels" to assess their danger. Instead, they rely on mathematics.</p>
            <p>The <strong>10-Year ASCVD Risk Score Calculator</strong> implements the official Pooled Cohort Equations developed by the American College of Cardiology (ACC) and the American Heart Association (AHA) in 2013. By inputting your age, sex, race, lipid profile, and medical history, this algorithm calculates the exact percentage probability that you will suffer a fatal or non-fatal cardiovascular event within the next ten years.</p>

            <h2 className="text-2xl font-bold mb-3">Why is 7.5% the Magic Number?</h2>
            <p>When you calculate your results, you will notice that the medical recommendations change drastically once your score crosses the 7.5% threshold. In the medical community, a 10-year risk score of &ge; 7.5% is classified as <strong>Intermediate Risk</strong>.</p>
            <p>Clinical trials involving hundreds of thousands of patients have proven that once a person crosses the 7.5% threshold, the statistical benefits of taking a statin medication (such as Atorvastatin or Rosuvastatin) heavily outweigh the potential risks or side effects. If your score is above 7.5%, current clinical guidelines strongly recommend initiating moderate-to-high intensity statin therapy to artificially lower your cholesterol and stabilize the plaque inside your arteries.</p>
            <p>If your score exceeds <strong>20% (High Risk)</strong>, you are in immediate danger. High-intensity statin therapy is virtually mandatory, alongside aggressive lifestyle interventions and potentially additional medications to lower blood pressure or manage diabetes.</p>

            <h2 className="text-2xl font-bold mb-3">Breaking Down the Variables: Age, Sex, and Race</h2>
            <p>The ASCVD algorithm is heavily weighted by demographics. Age is the single strongest predictor of cardiovascular disease. The older you get, the longer your arteries have been exposed to cholesterol, oxidative stress, and blood pressure shear forces. Consequently, an 80-year-old with perfect cholesterol will almost always have a higher risk score than a 30-year-old with terrible cholesterol.</p>
            <p>Biological sex is also a massive factor. Premenopausal women are significantly protected against ASCVD due to the presence of estrogen, which keeps blood vessels flexible and promotes higher levels of HDL (good) cholesterol. Men, lacking this protective effect, generally develop heart disease a full decade earlier than women. However, after menopause, a woman's risk accelerates rapidly to match a man's risk.</p>
            <p>Finally, race is included in the equation because massive epidemiological studies (such as the Atherosclerosis Risk in Communities study) demonstrated that African Americans have a higher baseline risk of hypertension and stroke compared to non-Hispanic Whites, even when lipid numbers are identical.</p>

            <h2 className="text-2xl font-bold mb-3">The Lipid Profile: Total Cholesterol vs. HDL</h2>
            <p>Your blood test results (lipid panel) provide the raw fuel for the ASCVD equation. The calculator requires two numbers: Total Cholesterol and HDL Cholesterol.</p>
            <p><strong>Total Cholesterol:</strong> This measures the total amount of lipid circulating in your blood. A higher number increases your risk because it indicates there is more raw material available to form plaque.</p>
            <p><strong>HDL (High-Density Lipoprotein):</strong> This is the "good" cholesterol. Think of HDL as the garbage trucks of your circulatory system. HDL particles travel through your arteries, pick up excess bad cholesterol, and transport it back to the liver to be disposed of. Therefore, a higher HDL number actively <em>lowers</em> your ASCVD risk score. The optimal HDL target is generally above 50 mg/dL for women and above 40 mg/dL for men.</p>

            <h2 className="text-2xl font-bold mb-3">The Silent Killer: Systolic Blood Pressure</h2>
            <p>Systolic blood pressure is the "top number" on your blood pressure reading. It measures the physical force that blood exerts against the walls of your arteries when your heart beats. Normal systolic pressure is strictly defined as less than 120 mmHg.</p>
            <p>When systolic pressure remains elevated (hypertension), the excessive force physically damages the delicate inner lining of the arteries (the endothelium). This damage creates microscopic tears where cholesterol plaque can easily become embedded. Even a small drop in systolic blood pressure—such as moving from 140 mmHg to 130 mmHg—can massively reduce your 10-year risk of suffering a stroke.</p>
            <p>Interestingly, the calculator asks if you are <em>treated</em> for high blood pressure. If you input a blood pressure of 130 mmHg, the algorithm will generate a higher risk score if you checked "Yes" to medication. Why? Because if medication is keeping your pressure at 130, your natural biological pressure is likely 150 or 160. The presence of the medication indicates underlying cardiovascular pathology that increases your baseline risk.</p>

            <h2 className="text-2xl font-bold mb-3">The Risk Multipliers: Smoking and Diabetes</h2>
            <p>Checking the box for either Smoking or Diabetes acts as a massive multiplier to your ASCVD risk score.</p>
            <ul>
              <li><strong>Smoking:</strong> Combustible tobacco smoke introduces thousands of toxic chemicals into the bloodstream that cause massive oxidative stress, immediately hardening the arteries and promoting blood clots. A smoker's 10-year risk is often double or triple that of a non-smoker with identical lipid numbers.</li>
              <li><strong>Diabetes:</strong> Type 2 Diabetes is classified as a "cardiovascular risk equivalent." Chronic high blood sugar damages blood vessels over time, making them stiff and highly susceptible to plaque buildup. If you are a diabetic between the ages of 40 and 75, medical guidelines recommend statin therapy regardless of what your actual cholesterol numbers are.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Comparing Your Risk to 'Optimal' Risk</h2>
            <p>One of the most psychologically impactful features of this calculator is the bar chart comparing your actual risk to an "Optimal Risk." The Optimal Risk represents a theoretical patient who is exactly your age, sex, and race, but possesses perfect clinical numbers: a Total Cholesterol of 170, an HDL of 50, a Systolic BP of 110, untreated, non-smoking, and non-diabetic.</p>
            <p>If your actual risk is 15% and the optimal risk for your age is 3%, the calculator will inform you that your risk is 5x higher than it should be. This "Relative Risk Multiple" is a powerful tool to understand how much your lifestyle choices are impacting your longevity.</p>

            <h2 className="text-2xl font-bold mb-3">Conclusion: Reversing the Trajectory</h2>
            <p>An ASCVD risk score is not a death sentence; it is a roadmap. If your score places you in the Borderline, Intermediate, or High-Risk categories, you have the power to intervene. You cannot change your age, but you can quit smoking today. You can adopt a Mediterranean-style diet to lower your Total Cholesterol and raise your HDL. You can begin a cardiovascular exercise routine to drop your systolic blood pressure.</p>
            <p>By making these changes and partnering with a physician to initiate statin or anti-hypertensive therapy, you can force the mathematics in your favor, drastically lowering your risk and protecting your heart for decades to come.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cardiovascular-risk-score-calculator" />
          <PopularCalculators exclude="/calculator/cardiovascular-risk-score-calculator" />
        </div>
      </div>
    </>
  );
}
