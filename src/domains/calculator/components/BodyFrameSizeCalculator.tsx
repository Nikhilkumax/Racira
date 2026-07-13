"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine, CartesianGrid } from "recharts";

interface FrameResult {
  rValue: number;
  frameSize: string;
  frameColor: string;
  categoryDesc: string;
  idealWeightAdjustment: string;
  breakdown: { label: string; value: string }[];
  chartData: { category: string; span: number; min: number; max: number; color: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcFrameSize(heightCm: number, wristCm: number, sex: string): FrameResult {
  const rValue = heightCm / wristCm;
  let frameSize = "";
  let frameColor = "";
  let categoryDesc = "";
  let idealWeightAdjustment = "";

  if (sex === "male") {
    if (rValue > 10.4) {
      frameSize = "Small"; frameColor = "#3b82f6"; categoryDesc = "Ectomorphic tendencies, lighter skeletal structure."; idealWeightAdjustment = "-10% from standard ideal weight tables.";
    } else if (rValue >= 9.6) {
      frameSize = "Medium"; frameColor = "#22c55e"; categoryDesc = "Average skeletal build, standard proportions."; idealWeightAdjustment = "No adjustment needed.";
    } else {
      frameSize = "Large"; frameColor = "#f59e0b"; categoryDesc = "Endomorphic/Mesomorphic tendencies, heavy skeletal structure."; idealWeightAdjustment = "+10% from standard ideal weight tables.";
    }
  } else {
    if (rValue > 11.0) {
      frameSize = "Small"; frameColor = "#3b82f6"; categoryDesc = "Ectomorphic tendencies, lighter skeletal structure."; idealWeightAdjustment = "-10% from standard ideal weight tables.";
    } else if (rValue >= 10.1) {
      frameSize = "Medium"; frameColor = "#22c55e"; categoryDesc = "Average skeletal build, standard proportions."; idealWeightAdjustment = "No adjustment needed.";
    } else {
      frameSize = "Large"; frameColor = "#f59e0b"; categoryDesc = "Endomorphic/Mesomorphic tendencies, heavy skeletal structure."; idealWeightAdjustment = "+10% from standard ideal weight tables.";
    }
  }

  const breakdown = [
    { label: "Height to Wrist Ratio (r)", value: rValue.toFixed(2) },
    { label: "Determined Frame Size", value: `${frameSize} Frame` },
    { label: "Biological Sex", value: sex === "male" ? "Male" : "Female" },
    { label: "Input Height", value: `${heightCm} cm` },
    { label: "Input Wrist", value: `${wristCm} cm` },
    { label: "Ideal Weight Adjustment", value: idealWeightAdjustment },
  ];

  const summaryStats = [
    { label: "r-Value", value: rValue.toFixed(2) },
    { label: "Frame", value: frameSize },
    { label: "Bone Density", value: frameSize === "Small" ? "Light" : frameSize === "Large" ? "Heavy" : "Average" },
    { label: "Weight Adj.", value: idealWeightAdjustment },
  ];

  // For the chart, smaller r-value = larger frame. 
  // Let's create a range visualization mapping to r-values.
  // We'll reverse it so Large is on the right visually if we map it, but let's just lay it out by r-value.
  let chartData;
  if (sex === "male") {
    chartData = [
      { category: "Large", min: 7.0, max: 9.6, span: 2.6, color: "#f59e0b" },
      { category: "Medium", min: 9.6, max: 10.4, span: 0.8, color: "#22c55e" },
      { category: "Small", min: 10.4, max: 13.0, span: 2.6, color: "#3b82f6" },
    ];
  } else {
    chartData = [
      { category: "Large", min: 7.5, max: 10.1, span: 2.6, color: "#f59e0b" },
      { category: "Medium", min: 10.1, max: 11.0, span: 0.9, color: "#22c55e" },
      { category: "Small", min: 11.0, max: 13.5, span: 2.5, color: "#3b82f6" },
    ];
  }

  return { rValue, frameSize, frameColor, categoryDesc, idealWeightAdjustment, breakdown, chartData, summaryStats };
}

export default function BodyFrameSizeCalculator() {
  const [height, setHeight] = useState("175");
  const [wrist, setWrist] = useState("16.5");
  const [sex, setSex] = useState("male");
  const [result, setResult] = useState<FrameResult | null>(null);

  const calculate = () => {
    const h = parseFloat(height), w = parseFloat(wrist);
    if (h > 0 && w > 0) setResult(calcFrameSize(h, w, sex));
  };

  useEffect(() => { setResult(calcFrameSize(175, 16.5, "male")); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const suf = "pr-3 text-sm text-muted-foreground shrink-0";

  const faqs = [
    { question: "How do I correctly measure my wrist for this calculator?", answer: "To get an accurate measurement, take a flexible measuring tape and wrap it around the wrist of your dominant hand. Measure just distal to the styloid process—which is right over the knobby bone on the outside of your wrist, where a watch would normally sit. Ensure the tape is snug but not constricting." },
    { question: "What is the formula for calculating body frame size?", answer: "The calculator uses the 'r-value' ratio, which is calculated simply as: Height / Wrist Circumference. The resulting number is then compared against clinical charts that differ by biological sex. For men, an r-value greater than 10.4 is a small frame. For women, an r-value greater than 11.0 is a small frame. A lower r-value indicates a larger frame size." },
    { question: "Why does biological sex matter for frame size?", answer: "Men and women naturally possess different skeletal structures and bone densities due to differing hormonal profiles during puberty and adulthood. A wrist circumference of 16 cm might indicate a 'medium' frame on a 170 cm tall woman, but that exact same measurement would indicate a 'small' frame on a 170 cm tall man." },
    { question: "How does frame size affect my ideal body weight?", answer: "Most standard ideal body weight charts (like the BMI table or the Devine formula) are calibrated for a 'medium' frame. If you have a small frame, clinicians typically recommend subtracting 10% from your calculated ideal weight. If you have a large frame, you should add 10% to account for the extra bone mass and muscle density your skeleton naturally carries." },
    { question: "Can I change my body frame size by losing weight?", answer: "No. Your frame size is dictated by the density and thickness of your skeletal structure, which is determined entirely by genetics and cannot be altered through diet or exercise. Because the wrist stores virtually no adipose tissue (fat), wrist circumference remains incredibly stable even if you lose or gain a significant amount of body weight." },
    { question: "Is wrist measurement the only way to determine frame size?", answer: "While wrist circumference is the most common and practical method for general populations, clinical dietitians sometimes use 'Elbow Breadth'. This involves bending the elbow at a 90-degree angle and using calipers to measure the exact distance between the two prominent bones on either side of the elbow joint. Both methods yield highly correlated results." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Body Frame Size Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Body Frame Size Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Biological Sex</label>
              <div className="grid grid-cols-2 gap-2">
                {["male", "female"].map(s => (
                  <button key={s} onClick={() => setSex(s)} className={`h-10 rounded-md border text-base font-medium capitalize transition-colors ${sex === s ? "bg-primary text-primary-foreground border-primary shadow-sm" : "border-border bg-background hover:bg-secondary"}`}>{s}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Height</label>
                <div className={inp}><input type="number" value={height} onChange={e => setHeight(e.target.value)} className={ci} /><span className={suf}>cm</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Wrist Size</label>
                <div className={inp}><input type="number" value={wrist} onChange={e => setWrist(e.target.value)} step={0.5} className={ci} /><span className={suf}>cm</span></div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Measure your wrist just past the wrist bone, where a watch sits.</p>
            
            <div className="flex gap-3 mt-4">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={() => { setHeight("175"); setWrist("16.5"); setSex("male"); setResult(calcFrameSize(175, 16.5, "male")); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className={`border-l-4 rounded-lg p-5 shadow-sm`} style={{ backgroundColor: `${result.frameColor}15`, borderColor: result.frameColor }}>
                <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: result.frameColor }}>Calculated Frame Size</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">{result.frameSize}</div>
                <div className="text-sm font-medium mt-1 text-muted-foreground">{result.categoryDesc}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card shadow-sm">
                {[["r-Value", result.rValue.toFixed(2)], ["Ideal Wt. Adj", result.idealWeightAdjustment.replace('from standard ideal weight tables.', '').trim()], ["Sex", sex === 'male' ? 'Male' : 'Female']].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-lg font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold mb-4">Metric Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 5 ? "font-bold text-foreground border-t-2 border-border" : ""}`}>
                      <td className="py-2.5 text-muted-foreground">{r.label}</td>
                      <td className="py-2.5 text-right font-semibold">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold mb-4">r-Value Spectrum</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={result.chartData} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" domain={[sex === "male" ? 7 : 7.5, sex === "male" ? 13 : 13.5]} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} width={60} />
                    <Tooltip formatter={(v: any, n: any, p: any) => [`${p.payload.min} – ${p.payload.max} r-value`, "Frame Range"]} />
                    <ReferenceLine x={result.rValue} stroke="#6366f1" strokeWidth={2} strokeDasharray="4 4" label={{ value: `You: ${result.rValue.toFixed(2)}`, position: "insideTopRight", fontSize: 11, fill: "#6366f1" }} />
                    <Bar dataKey="span" radius={[0, 4, 4, 0]}>{result.chartData.map((e, i) => <Cell key={i} fill={e.color} fillOpacity={0.85} />)}</Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground mt-3 text-center">Lower r-values indicate larger skeletal frames.</p>
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
            <h2 className="text-2xl font-bold mb-3">What Is a Body Frame Size Calculator?</h2>
            <p>A Body Frame Size Calculator is a clinical tool used in physical anthropometry to categorize the mass and density of a person's skeletal structure. In the fitness and medical communities, individuals are generally classified into three frame sizes: Small, Medium, or Large. Determining your frame size is crucial because it heavily influences your baseline ideal body weight, your natural propensity to gain muscle mass, and how certain BMI thresholds apply to your specific physique.</p>
            <p>While height and weight provide a general overview of your body, two people who are both 180 cm tall and weigh 80 kg can look entirely different. One might look incredibly skinny (small frame, low muscle mass, high body fat), while the other looks powerfully built (large frame, high bone density, high muscle mass). Frame size provides the vital context that simple BMI calculations lack.</p>

            <h2 className="text-2xl font-bold mb-3">How The Calculations Work (The r-Value)</h2>
            <p>Because bones do not shrink or expand based on caloric intake, we can determine frame size by measuring areas of the body that store virtually no fat. The most common and accessible location is the wrist.</p>
            <p>The calculator determines your frame size by computing the <strong>Height-to-Wrist Ratio (also known as the r-value)</strong>. The mathematical formula is simple: <code>Height / Wrist Circumference</code>. Both measurements must use the same unit (e.g., centimeters or inches).</p>
            <p>For example, if a man is 180 cm tall and has a wrist circumference of 17 cm, his r-value is 180 / 17 = 10.58. Because the wrist acts as the denominator, <strong>a smaller wrist produces a larger r-value</strong>, and a larger wrist produces a smaller r-value.</p>
            
            <h3>Clinical Thresholds by Biological Sex</h3>
            <p>Because males and females undergo different hormonal changes during puberty—specifically the presence of testosterone vs estrogen—men naturally develop denser, thicker bones. Therefore, the clinical thresholds differ by sex:</p>
            <ul>
              <li><strong>Males:</strong> Small Frame (r &gt; 10.4), Medium Frame (r between 9.6 and 10.4), Large Frame (r &lt; 9.6).</li>
              <li><strong>Females:</strong> Small Frame (r &gt; 11.0), Medium Frame (r between 10.1 and 11.0), Large Frame (r &lt; 10.1).</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">The Three Frame Sizes Explained</h2>
            
            <h3>Small Frame (Ectomorphic Tendencies)</h3>
            <p>Individuals with a small frame possess a lighter, narrower skeletal structure. They typically have long limbs, narrow shoulders, and delicate bone features. Genetically, they often align with the "Ectomorph" somatotype, meaning they naturally possess a faster metabolism and struggle to gain significant amounts of muscle mass or body fat. A person with a small frame will generally look much thinner than their BMI suggests.</p>

            <h3>Medium Frame (Mesomorphic Tendencies)</h3>
            <p>A medium frame represents the statistical average of the population. Individuals with this frame size have a proportionate, standard skeletal build. Most public health guidelines, BMI charts, and generic ideal body weight tables (such as the Devine formula) are automatically calibrated for individuals with a medium frame. They typically gain muscle and lose fat at an average, predictable rate.</p>

            <h3>Large Frame (Endomorphic/Mesomorphic Tendencies)</h3>
            <p>Individuals with a large frame have a heavy, dense skeletal structure. They generally feature broad shoulders, a wide rib cage, and thick joints. Genetically, they are built to carry significant amounts of weight—whether that is muscle (Mesomorph) or body fat (Endomorph). Because their bones literally weigh more, they can easily trigger "Overweight" on a standard BMI chart even when they possess a completely healthy, low body fat percentage.</p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>When you execute a calculation, this tool provides five distinct analytical sections to help you interpret your skeletal genetics.</p>
            <p><strong>Primary Result Card:</strong> Highlights your definitive frame size (Small, Medium, or Large) and provides a brief summary of the physical tendencies associated with that skeletal structure.</p>
            <p><strong>3-Stat Diagnostic Bar:</strong> Displays your precise r-value, confirms your biological sex input, and provides the exact percentage adjustment you should apply to standard ideal weight tables.</p>
            <p><strong>Metric Breakdown Table:</strong> A transparent, line-by-line accounting of your inputs and the resulting ratio, ending with a clear directive on how to adjust your target weight goals.</p>
            <p><strong>r-Value Spectrum Chart:</strong> A visual horizontal bar chart that maps the clinical thresholds (Large, Medium, Small) for your specific sex, placing a marker precisely where your r-value sits on the spectrum. This shows you how close you are to the boundaries of the next frame size.</p>
            <p><strong>Summary Statistics:</strong> A fast, readable grid aggregating your data, perfect for screenshotting or sharing with a personal trainer or dietitian.</p>

            <h2 className="text-2xl font-bold mb-3">How to Adjust Your Ideal Body Weight</h2>
            <p>The primary medical purpose of determining your frame size is to accurately adjust your Ideal Body Weight (IBW) targets. Because generic IBW formulas assume a medium frame, they can set dangerous or impossible targets for outliers.</p>
            <p><strong>If you have a Medium Frame:</strong> No adjustment is necessary. You can use standard BMI charts and ideal weight formulas exactly as they are written.</p>
            <p><strong>If you have a Small Frame:</strong> You must subtract 10% from standard ideal weight charts. If a generic formula says a woman of your height should weigh 60 kg, your true ideal weight is closer to 54 kg. If a small-framed person weighs 60 kg, they may actually be carrying excess adipose tissue despite the chart saying they are "healthy."</p>
            <p><strong>If you have a Large Frame:</strong> You must add 10% to standard ideal weight charts. If a formula says a man of your height should weigh 80 kg, your true ideal weight is closer to 88 kg. Large-framed individuals who attempt to reach generic weight targets often engage in extreme, dangerous dieting and lose significant amounts of muscle mass because their skeleton simply wasn't designed to be that light.</p>

            <h2 className="text-2xl font-bold mb-3">Tips for Accurate Measurement</h2>
            <p>To ensure this calculator provides accurate results, you must measure your wrist correctly. Do not guess. Follow these simple steps:</p>
            <p>1. Use a flexible, soft measuring tape (like those used for sewing). If you do not have one, wrap a piece of string around your wrist, mark it with a pen, and then measure the string with a rigid ruler.</p>
            <p>2. Measure the wrist of your dominant hand. (If you are right-handed, measure your right wrist). The dominant arm is typically slightly thicker due to increased muscle and bone density from lifelong use.</p>
            <p>3. Wrap the tape just distal to the styloid process. This means you should measure exactly over the knobby bone on the outside of your wrist—precisely where you would secure a wristwatch.</p>
            <p>4. Pull the tape so it is snug against the skin, but do not pull so hard that it compresses the tissue or causes discomfort.</p>

            <h2 className="text-2xl font-bold mb-3">Benefits of Knowing Your Frame Size</h2>
            <p>Understanding your skeletal frame size provides immense psychological relief and practical direction for your fitness journey. It allows you to stop fighting your genetics. A large-framed person will never look like a runway model, and a small-framed person will struggle immensely to look like an NFL linebacker. By identifying your baseline skeletal structure, you can set realistic, healthy goals that align with your body's natural architecture, leading to a much more sustainable and satisfying approach to health and fitness.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/body-frame-size-calculator" />
          <PopularCalculators exclude="/calculator/body-frame-size-calculator" />
        </div>
      </div>
    </>
  );
}
