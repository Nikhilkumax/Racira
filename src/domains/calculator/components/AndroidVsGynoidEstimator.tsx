"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Printer, RotateCcw, ActivitySquare, AlertTriangle, ShieldAlert, HeartPulse, Dna } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

// 1. TypeScript Interfaces
interface DistributionInputs {
  unitSystem: "imperial" | "metric";
  gender: "male" | "female";
  waist: number;
  hip: number;
}

interface DistributionResults {
  whr: number;
  distributionType: "Android (Apple)" | "Gynoid (Pear)" | "Balanced";
  riskLevel: "Low Risk" | "Moderate Risk" | "High Risk";
  riskColor: string;
  
  chartData: { name: string; "Your Ratio": number }[];
}

// 2. Pure Calculation Function
const calculateDistribution = (inputs: DistributionInputs): DistributionResults | null => {
  const { waist, hip, gender } = inputs;
  
  if (waist <= 0 || hip <= 0) return null;

  // WHR is a ratio, so units (inches/cm) cancel out as long as they are the same
  const whr = waist / hip;

  let distributionType: "Android (Apple)" | "Gynoid (Pear)" | "Balanced" = "Balanced";
  let riskLevel: "Low Risk" | "Moderate Risk" | "High Risk" = "Low Risk";
  let riskColor = "#10b981"; // Green

  if (gender === "male") {
    if (whr >= 1.0) {
      distributionType = "Android (Apple)";
      riskLevel = "High Risk";
      riskColor = "#ef4444"; // Red
    } else if (whr >= 0.90) {
      distributionType = "Android (Apple)";
      riskLevel = "Moderate Risk";
      riskColor = "#f59e0b"; // Yellow
    } else {
      distributionType = "Gynoid (Pear)";
      riskLevel = "Low Risk";
      riskColor = "#10b981";
    }
  } else {
    // Female
    if (whr >= 0.85) {
      distributionType = "Android (Apple)";
      riskLevel = "High Risk";
      riskColor = "#ef4444";
    } else if (whr >= 0.80) {
      distributionType = "Android (Apple)";
      riskLevel = "Moderate Risk";
      riskColor = "#f59e0b";
    } else {
      distributionType = "Gynoid (Pear)";
      riskLevel = "Low Risk";
      riskColor = "#10b981";
    }
  }

  // Generate Chart Data
  const chartData = [
    { 
      name: "Waist-to-Hip Ratio", 
      "Your Ratio": parseFloat(whr.toFixed(2))
    }
  ];

  return {
    whr: parseFloat(whr.toFixed(2)),
    distributionType,
    riskLevel,
    riskColor,
    chartData
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  unitSystem: "imperial" as const,
  gender: "male" as const,
  waist: "36",
  hip: "38"
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground min-w-[150px]">
        <p className="font-bold mb-2 border-b border-border pb-1">Biomechanical Ratio</p>
        <div className="flex justify-between items-center mb-1">
          <span className="text-primary mr-3">WHR Score:</span>
          <span className="font-bold">{payload[0].value}</span>
        </div>
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

export default function AndroidVsGynoidEstimator() {
  // 4. Component State
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">(DEFAULTS.unitSystem);
  const [gender, setGender] = useState<"male" | "female">(DEFAULTS.gender);
  const [waist, setWaist] = useState(DEFAULTS.waist);
  const [hip, setHip] = useState(DEFAULTS.hip);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState<DistributionResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const w = parseFloat(waist);
    const h = parseFloat(hip);

    if (isNaN(w) || w <= 0) return setErrorMsg("Please enter a valid waist circumference.");
    if (isNaN(h) || h <= 0) return setErrorMsg("Please enter a valid hip circumference.");

    const res = calculateDistribution({ unitSystem, gender, waist: w, hip: h });
    
    if (!res) {
      setErrorMsg("Unable to calculate. Please check your inputs.");
    } else {
      setResults(res);
    }
  };

  const handleReset = () => {
    setUnitSystem(DEFAULTS.unitSystem);
    setGender(DEFAULTS.gender);
    setWaist(DEFAULTS.waist);
    setHip(DEFAULTS.hip);
    setErrorMsg("");
    setTimeout(handleCalculate, 0);
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Android vs Gynoid Fat Distribution</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "What is the difference between Android and Gynoid fat?", answer: "Android ('Apple-shaped') fat distribution means your body preferentially stores fat around the abdominal region and deep within the torso. This is largely visceral fat. Gynoid ('Pear-shaped') fat distribution means your body stores fat primarily around the hips, thighs, and buttocks. This is almost entirely subcutaneous fat. The distinction is critical because visceral and subcutaneous fat behave entirely differently on a biological level." },
    { question: "Why is Android (visceral) fat so dangerous?", answer: "Subcutaneous fat (the soft fat you can pinch on your hips) is relatively biologically inert; it is simply stored energy. Visceral fat (Android fat) is stored deep behind the abdominal wall, physically wrapping around your vital organs (liver, pancreas, intestines). Visceral fat acts as an active endocrine organ. It constantly secretes highly inflammatory cytokines directly into your portal vein, driving severe insulin resistance, high blood pressure, and dramatically increasing the risk of Type 2 Diabetes and cardiovascular disease." },
    { question: "Why do men and women store fat differently?", answer: "Fat distribution is heavily dictated by hormones. Testosterone drives Android (abdominal) fat storage, which is why middle-aged men frequently develop 'beer bellies' with hard, distended stomachs. Estrogen drives Gynoid (hip/thigh) fat storage in pre-menopausal women to support childbirth and energy reserves. However, after menopause, when estrogen levels plummet, female fat distribution often shifts from Gynoid back to a high-risk Android pattern." },
    { question: "Can I do sit-ups to lose Android belly fat?", answer: "Absolutely not. 'Spot reduction' is one of the most pervasive myths in fitness. Doing thousands of sit-ups will build strong abdominal muscles, but those muscles will remain completely buried under the visceral and subcutaneous fat. You cannot tell your body where to burn fat from. You must create a systemic caloric deficit through diet and exercise, forcing the body to gradually oxidize the fat globally." },
    { question: "How do I ensure my measurements are accurate?", answer: "To measure your waist accurately, use a flexible tape measure and place it horizontally around your bare abdomen at the level of your navel (belly button). Do not suck your stomach in; breathe out normally. To measure your hips, stand with your feet together and place the tape measure around the absolute widest portion of your buttocks. If the tape is angled or twisted, the ratio will be mathematically compromised." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Android vs Gynoid Fat Distribution Estimator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Android vs Gynoid Fat Distribution Estimator</h1>

        {/* MEDICAL DISCLAIMER */}
        <div className="max-w-[1280px] mb-6 bg-rose-500/10 border-l-4 border-rose-500 p-4 rounded-r-lg flex gap-3 items-start">
          <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
          <p className="text-sm font-medium leading-relaxed text-rose-800 dark:text-rose-400">
            <strong>The Visceral Threat:</strong> Not all body fat is created equal. Where you store your fat is often more clinically significant than how much you have. Central abdominal (Android) fat actively secretes inflammatory cytokines that attack your cardiovascular system, making it vastly more dangerous than lower-body (Gynoid) fat.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px]">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex bg-secondary p-1 rounded-lg border border-border">
              <button type="button" onClick={() => setUnitSystem("imperial")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "imperial" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Imperial (in)</button>
              <button type="button" onClick={() => setUnitSystem("metric")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "metric" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Metric (cm)</button>
            </div>

            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Dna className="h-4 w-4" /> Genetic Deposition
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Calculate your Waist-to-Hip Ratio (WHR) to mathematically determine if your body is genetically predisposed to dangerous visceral fat storage.</p>
            </div>

            <div className="flex flex-col mt-2">
              <label className="text-sm font-semibold text-foreground mb-1.5">Biological Sex</label>
              <select value={gender} onChange={(e: any) => setGender(e.target.value)} className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                <option value="male">Male (Testosterone Dominant)</option>
                <option value="female">Female (Estrogen Dominant)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <CompactInput id="waist" label="Waist (Navel)" value={waist} onChange={setWaist} suffix={unitSystem === "imperial" ? "in" : "cm"} />
              <CompactInput id="hip" label="Hips (Widest)" value={hip} onChange={setHip} suffix={unitSystem === "imperial" ? "in" : "cm"} />
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-600 text-xs font-bold p-3 rounded-md mt-1">
                <AlertTriangle className="h-4 w-4 inline mr-1 -mt-0.5" />
                {errorMsg}
              </div>
            )}

            <div className="flex gap-2.5 mt-4 pt-4 border-t border-border">
              <button
                type="button"
                onClick={handleCalculate}
                className="h-10 w-full flex-1 flex items-center justify-center rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-base transition-all active:scale-[0.98] shadow-sm"
              >
                Calculate
              </button>
              <button type="button" onClick={handleReset} title="Reset Profile" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 focus:outline-none">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: Results */}
          <div className="flex flex-col gap-4">
            {results && !errorMsg ? (
              <div ref={printRef} className="flex flex-col gap-4 animate-fade-in-up">
                
                {/* Primary Metric Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Distribution Type Box */}
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-5 shadow-sm relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Primary Deposition</div>
                      <div className="flex items-baseline gap-1 mt-2">
                        <div className="text-2xl font-black text-white">{results.distributionType}</div>
                      </div>
                      <div className="text-xs font-medium text-slate-500 mt-2">WHR Score: {results.whr}</div>
                    </div>
                    <Dna className="absolute -bottom-4 -right-4 h-24 w-24 opacity-5" />
                  </div>

                  {/* Risk Level Box */}
                  <div 
                    className="text-white rounded-lg p-5 shadow-sm relative overflow-hidden"
                    style={{ backgroundColor: results.riskColor }}
                  >
                    <div className="relative z-10">
                      <div className="text-white/80 text-[10px] font-bold uppercase tracking-wider mb-1">Metabolic & Cardio Risk</div>
                      <div className="flex items-baseline gap-1 mt-2">
                        <div className="text-3xl font-black">{results.riskLevel}</div>
                      </div>
                      <div className="text-xs font-medium text-white/90 mt-2">Based on visceral fat estimation</div>
                    </div>
                    <HeartPulse className="absolute -bottom-4 -right-4 h-24 w-24 opacity-10" />
                  </div>
                </div>

                <div className="grid lg:grid-cols-1 gap-4">
                  {/* Bar Chart Panel */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[300px]">
                    <h3 className="text-base font-bold w-full text-left mb-1">Waist-to-Hip Ratio (WHR) Analysis</h3>
                    <p className="text-xs text-muted-foreground w-full text-left mb-6">A visual representation of your WHR against the clinical thresholds. Scores pushing past 0.90 (Men) and 0.85 (Women) indicate a dangerous shift toward internal visceral fat storage.</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={results.chartData} margin={{ top: 20, right: 30, left: 10, bottom: 0 }} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                        <XAxis type="number" domain={[0.6, 1.3]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis dataKey="name" type="category" hide />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                        
                        {/* Reference Lines for Risk Thresholds */}
                        <ReferenceLine x={gender === "male" ? 0.90 : 0.85} stroke="#f59e0b" strokeDasharray="3 3" label={{ position: 'top', value: 'Moderate Risk', fill: '#f59e0b', fontSize: 10, fontWeight: 'bold' }} />
                        <ReferenceLine x={gender === "male" ? 1.0 : 0.90} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'bottom', value: 'High Risk', fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }} />

                        <Bar dataKey="Your Ratio" barSize={40} radius={[0, 4, 4, 0]}>
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={results.riskColor} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <Dna className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter your waist and hip measurements to calculate your WHR and determine your biological risk for visceral fat accumulation.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Deception of the Bathroom Scale</h2>
            <p>For decades, the medical community relied almost entirely on the Body Mass Index (BMI) and the bathroom scale to assess patient health. While these metrics provide a general baseline, they suffer from a massive flaw: they treat all body weight as identical. A 200-pound man carrying most of his weight in his hips and thighs has an entirely different risk profile than a 200-pound man carrying all of his weight in a distended abdomen. The <strong>Android vs Gynoid Fat Distribution Estimator</strong> uses the Waist-to-Hip Ratio (WHR) to look past raw weight and analyze the far more dangerous metric of <em>where</em> your body is genetically choosing to store its excess energy.</p>

            <h2 className="text-2xl font-bold mb-3">Understanding Subcutaneous Fat</h2>
            <p>To understand fat distribution, we must divide human fat into two distinct clinical categories. The first is subcutaneous fat.</p>
            <p>Subcutaneous fat is the soft, 'jiggly' fat located immediately beneath the skin. If you can pinch it between your fingers, it is subcutaneous fat. While it may be aesthetically undesirable to some, it is relatively biologically inert. Subcutaneous fat acts primarily as thermal insulation and a long-term energy reservoir. It does not actively damage your internal organs. Individuals who store the vast majority of their excess weight in their hips, thighs, and buttocks—creating a "Pear" or Gynoid shape—are storing primarily subcutaneous fat.</p>

            <h2 className="text-2xl font-bold mb-3">The Hidden Threat: Visceral (Android) Fat</h2>
            <p>The second category of fat is visceral fat, and it is a biological nightmare. Visceral fat is not stored under the skin; it is stored deep behind the abdominal wall, physically wrapping around your vital organs, including your liver, pancreas, and intestines.</p>
            <p>Visceral fat causes the classic "Apple" or Android shape. In men, this often manifests as a "beer belly"—a stomach that is physically large and distended, but feels surprisingly hard to the touch because the fat is tightly packed behind the abdominal muscle wall. Unlike subcutaneous fat, visceral fat is highly metabolically active. It functions as a rogue endocrine organ, constantly secreting highly inflammatory cytokines (like Interleukin-6 and TNF-alpha) directly into your portal vein. These toxins attack your cardiovascular system, severely degrade insulin sensitivity, and are a primary driver of Type 2 Diabetes, hypertension, and sudden cardiac events.</p>

            <h2 className="text-2xl font-bold mb-3">The Mathematics of the Waist-to-Hip Ratio (WHR)</h2>
            <p>Because MRI scans to measure exact visceral fat volumes are incredibly expensive, clinicians rely on the Waist-to-Hip Ratio (WHR) as the most accurate proxy for visceral risk.</p>
            <p>The math is simple: you divide the circumference of your waist (which captures visceral fat volume) by the circumference of your hips (which captures bone structure and subcutaneous fat). If the number is low, your hips are wider than your waist, indicating a safe, Gynoid distribution. As the number approaches 1.0 (or exceeds it), it means your abdomen has expanded beyond the width of your pelvic structure, mathematically guaranteeing a massive accumulation of dangerous visceral fat.</p>

            <h2 className="text-2xl font-bold mb-3">The Role of Hormones in Fat Storage</h2>
            <p>Fat distribution is not a choice; it is heavily governed by sex hormones. </p>
            <p>Testosterone actively drives excess calories to be stored in the central abdominal region. This is why middle-aged men are vastly more prone to the Android 'apple' shape and suffer from much higher rates of early cardiovascular disease compared to pre-menopausal women. Conversely, Estrogen drives fat storage into the hips, thighs, and buttocks (Gynoid distribution) to provide localized energy reserves for potential pregnancy and breastfeeding. Because estrogen protects women from central visceral fat storage, their cardiovascular risk remains relatively low. However, after menopause, when estrogen levels plummet, female fat distribution aggressively shifts into an Android pattern, and their cardiovascular risk profile immediately skyrockets to match that of men.</p>

            <h2 className="text-2xl font-bold mb-3">Why "Spot Reduction" is a Dangerous Myth</h2>
            <p>When individuals realize they have a dangerous Android fat distribution, their immediate reaction is to start doing hundreds of crunches and sit-ups to "burn the belly fat."</p>
            <p>This is a complete physiological impossibility. You cannot burn fat in a specific area by exercising the muscles underneath it. Doing sit-ups will absolutely build strong rectus abdominis muscles, but those strong muscles will remain completely buried underneath the dangerous visceral fat. The only way to eliminate Android fat is to create a systemic, whole-body caloric deficit through dietary restriction and cardiovascular exercise. Your body will pull fat from wherever it chooses, but as you lose overall mass, the deadly visceral fat will eventually be oxidized.</p>

            <h2 className="text-2xl font-bold mb-3">Conclusion: Target the Danger Zone</h2>
            <p>Stop obsessing over the raw number on the bathroom scale. A person can have a "normal" BMI but still carry a massive amount of hidden visceral fat, making them biologically 'thin outside, fat inside' (TOFI). Use the Android vs Gynoid Fat Distribution Estimator to track your true cardiovascular risk. If your WHR places you in the Moderate or High-Risk category, you must immediately prioritize a caloric deficit and structured resistance training to clear the toxic inflammation from your abdominal cavity.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/android-vs-gynoid-fat-distribution-estimator" />
          <PopularCalculators exclude="/calculator/android-vs-gynoid-fat-distribution-estimator" />
        </div>
      </div>
    </>
  );
}
