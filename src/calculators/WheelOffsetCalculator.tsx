"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Maximize2, RotateCcw, ShieldAlert, CheckCircle2 } from "lucide-react";

// 1. TypeScript interfaces
interface OffsetResults {
  innerClearanceMm: number;
  outerPositionMm: number;
  innerClearanceDesc: string;
  outerPositionDesc: string;
  trackWidthChangeMm: number;
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateOffset = (inputs: typeof DEFAULTS): OffsetResults => {
  // Wheel width is usually in inches, offset in mm
  const w1 = parseFloat(inputs.w1) || 0;
  const o1 = parseFloat(inputs.o1) || 0;
  const w2 = parseFloat(inputs.w2) || 0;
  const o2 = parseFloat(inputs.o2) || 0;

  if (w1 <= 0 || w2 <= 0) {
    return {
      innerClearanceMm: 0, outerPositionMm: 0, innerClearanceDesc: "", outerPositionDesc: "", trackWidthChangeMm: 0,
      isError: true, errorMsg: "Wheel widths must be greater than zero."
    };
  }

  // Convert width from inches to mm
  const w1Mm = w1 * 25.4;
  const w2Mm = w2 * 25.4;

  // Calculate inner and outer position for Current Wheel relative to mounting hub
  // Backspace (inner) = (Width / 2) + Offset
  // Frontspace (outer) = (Width / 2) - Offset
  const inner1 = (w1Mm / 2) + o1;
  const outer1 = (w1Mm / 2) - o1;

  // New Wheel
  const inner2 = (w2Mm / 2) + o2;
  const outer2 = (w2Mm / 2) - o2;

  // Differences
  const innerClearanceMm = inner2 - inner1;
  const outerPositionMm = outer2 - outer1;

  let innerClearanceDesc = "";
  if (innerClearanceMm > 0) {
    innerClearanceDesc = `${innerClearanceMm.toFixed(1)}mm LESS clearance on the strut side.`;
  } else if (innerClearanceMm < 0) {
    innerClearanceDesc = `${Math.abs(innerClearanceMm).toFixed(1)}mm MORE clearance on the strut side.`;
  } else {
    innerClearanceDesc = "Identical inner clearance.";
  }

  let outerPositionDesc = "";
  if (outerPositionMm > 0) {
    outerPositionDesc = `Extends ${outerPositionMm.toFixed(1)}mm FARTHER out toward the fender.`;
  } else if (outerPositionMm < 0) {
    outerPositionDesc = `Retracts ${Math.abs(outerPositionMm).toFixed(1)}mm INWARD away from the fender.`;
  } else {
    outerPositionDesc = "Identical outer position.";
  }

  // Track width change is purely based on offset difference. 
  // If offset decreases (e.g. +45 to +35), track width increases by 10mm per side = 20mm total.
  const trackWidthChangeMm = (o1 - o2) * 2;

  return {
    innerClearanceMm,
    outerPositionMm,
    innerClearanceDesc,
    outerPositionDesc,
    trackWidthChangeMm,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  w1: "8.0",
  o1: "45",
  w2: "9.5",
  o2: "35"
};

const CompactInput = ({ id, label, value, onChange, placeholder, suffix }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input id={id} type="number" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-sm bg-transparent outline-none border-none text-foreground font-medium" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{suffix}</span>}
    </div>
  </div>
);

// 4. Component
export default function WheelOffsetCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<OffsetResults>(calculateOffset(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    const newInputs = { ...inputs, [key]: val };
    setInputs(newInputs);
    // Auto calculate on change
    const r = calculateOffset(newInputs);
    if (!r.isError) setResults(r);
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateOffset(DEFAULTS));
  };

  const faqs = [
    { question: "What is wheel offset?", answer: "Wheel offset is the distance from the wheel's absolute center line to the wheel's mounting hub pad (where it bolts to the car). It is measured in millimeters. A positive offset means the mounting pad is closer to the outside (street side) of the wheel. A negative offset means the pad is deeper inside the wheel." },
    { question: "What happens if my new wheels have LESS offset?", answer: "If you move from a +45 offset to a +35 offset (a decrease of 10mm), the entire wheel assembly is pushed OUTWARD away from the suspension by 10mm. This gives you a wider track width and a more 'flush' stance, but increases the risk of the tire rubbing against the outer fender lip." },
    { question: "What happens if my new wheels have MORE offset?", answer: "If you move from a +35 offset to a +45 offset (an increase of 10mm), the entire wheel assembly is sucked INWARD toward the center of the car by 10mm. This creates a 'tucked' look, but drastically increases the risk of the inner edge of the wheel or tire crashing into your brake calipers, struts, or suspension arms." },
    { question: "How does wheel width affect offset calculations?", answer: "Changing the width of the wheel complicates offset. If you keep the exact same +40 offset but buy a wheel that is 1 inch wider, that extra inch is split evenly down the middle. The wheel will stick out half an inch further toward the fender AND reach half an inch deeper toward the suspension. You must account for both." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Wheel Offset Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Wheel Offset Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <p className="text-sm text-muted-foreground mb-2">Compare your current wheel specifications to a new aftermarket setup to check for strut or fender clearance issues.</p>

            <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2 text-primary">Current Setup</div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="w1" label="Wheel Width" value={inputs.w1} onChange={(v: string) => handleChange("w1", v)} suffix="in" />
              <CompactInput id="o1" label="Offset (ET)" value={inputs.o1} onChange={(v: string) => handleChange("o1", v)} suffix="mm" />
            </div>

            <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2 mt-4 text-emerald-600 dark:text-emerald-500">New Setup</div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="w2" label="Wheel Width" value={inputs.w2} onChange={(v: string) => handleChange("w2", v)} suffix="in" />
              <CompactInput id="o2" label="Offset (ET)" value={inputs.o2} onChange={(v: string) => handleChange("o2", v)} suffix="mm" />
            </div>

            <div className="flex gap-2.5 mt-4">
              <button type="button" onClick={handleReset} className="w-full rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold h-11 transition-colors flex items-center justify-center gap-2 focus:outline-none shadow-sm">
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
            </div>
          </div>

          {/* RIGHT fluid */}
          <div id="results-section" className="flex flex-col gap-4">
            {results.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Error</div>
                <div className="text-base font-medium text-foreground">{results.errorMsg}</div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Inner Clearance Card */}
                  <div className={`border-l-4 rounded-lg p-6 relative overflow-hidden shadow-sm ${results.innerClearanceMm > 0 ? 'bg-orange-500/10 border-orange-500' : 'bg-card border-border'}`}>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Inner Clearance (Strut Side)</div>
                    <div className="flex items-center gap-3 mb-2">
                      {results.innerClearanceMm > 0 ? (
                        <ShieldAlert className="h-8 w-8 text-orange-500" />
                      ) : (
                        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                      )}
                      <div className={`text-4xl font-black tracking-tighter ${results.innerClearanceMm > 0 ? 'text-orange-500' : 'text-foreground'}`}>
                        {Math.abs(results.innerClearanceMm).toFixed(1)} mm
                      </div>
                    </div>
                    <div className="text-sm font-medium mt-1 text-foreground">
                      {results.innerClearanceDesc}
                    </div>
                  </div>

                  {/* Outer Position Card */}
                  <div className={`border-l-4 rounded-lg p-6 relative overflow-hidden shadow-sm ${results.outerPositionMm > 0 ? 'bg-blue-500/10 border-blue-500' : 'bg-card border-border'}`}>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Outer Position (Fender Side)</div>
                    <div className="flex items-center gap-3 mb-2">
                      {results.outerPositionMm > 0 ? (
                        <Maximize2 className="h-8 w-8 text-blue-500" />
                      ) : (
                        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                      )}
                      <div className={`text-4xl font-black tracking-tighter ${results.outerPositionMm > 0 ? 'text-blue-500' : 'text-foreground'}`}>
                        {Math.abs(results.outerPositionMm).toFixed(1)} mm
                      </div>
                    </div>
                    <div className="text-sm font-medium mt-1 text-foreground">
                      {results.outerPositionDesc}
                    </div>
                  </div>
                </div>

                {/* Track Width */}
                <div className="bg-card border border-border rounded-lg p-5 shadow-sm mt-2 text-center">
                  <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Total Track Width Change</div>
                  <div className="text-2xl font-bold text-foreground">
                    {results.trackWidthChangeMm > 0 ? '+' : ''}{results.trackWidthChangeMm.toFixed(1)} mm
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {results.trackWidthChangeMm > 0 ? "Your car's footprint is wider." : results.trackWidthChangeMm < 0 ? "Your car's footprint is narrower." : "Track width remains identical."}
                  </div>
                </div>

              </>
            )}
          </div>
        </div>
        
        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>Why Use a Wheel Offset Calculator?</h2>
            <p>Buying aftermarket wheels is one of the most popular and transformative modifications you can make to a vehicle. However, ensuring those new wheels actually fit without destroying your suspension or fenders is a mathematical headache. A Wheel Offset Calculator takes your factory wheel width and offset, compares it against your desired aftermarket specifications, and instantly tells you exactly how the new wheel will sit in the wheel well.</p>

            <h2>Understanding Wheel Offset (ET)</h2>
            <p>Offset (often stamped on wheels with the German abbreviation "ET" for <em>Einpresstiefe</em>) is the distance in millimeters from the absolute center line of the wheel barrel to the mounting pad where the wheel bolts to your car's hub.</p>
            <ul>
              <li><strong>Positive Offset (+):</strong> The mounting pad is closer to the outside of the wheel (the street side). This is standard for almost all modern front-wheel-drive and all-wheel-drive vehicles. It tucks the wheel deep under the fender.</li>
              <li><strong>Zero Offset (0):</strong> The mounting pad is exactly in the center of the wheel.</li>
              <li><strong>Negative Offset (-):</strong> The mounting pad is closer to the inside of the wheel (the suspension side). This creates a "deep dish" look and pushes the wheel far out past the fenders. This is common on lifted off-road trucks.</li>
            </ul>

            <h2>The Danger of Inner Clearance Loss</h2>
            <p>If our calculator warns you of "LESS clearance on the strut side," pay close attention. Your suspension struts, control arms, and brake calipers live directly behind your wheels. If your new wheel pushes inward by 15mm and you only had 10mm of physical gap from the factory, your new wheel will violently crash into your suspension the moment you lower the car off the jack. You would need to add wheel spacers to correct this.</p>

            <h2>The Risk of Fender Rubbing</h2>
            <p>If the calculator shows that your new setup "Extends FARTHER out," you are pushing the wheel toward the outer fender lip. A moderate increase (10-15mm) is often highly desirable in the car community to achieve a "flush" fitment where the wheel perfectly aligns with the fender line. However, push it too far (e.g., 30mm+), and your tires will smash into your metal fenders every time you hit a bump or turn the steering wheel sharply.</p>

            <h2>How Wheel Width Complicates Offset</h2>
            <p>Offset is not an absolute measurement; it is relative to the width of the wheel. You cannot assume a +40 offset wheel will fit just because your factory wheels are +40 offset. If your factory wheels are 8 inches wide and your new wheels are 10 inches wide, the new wheels are 2 inches wider overall. Even with the exact same +40 offset, the new wheel will stick out 1 inch further toward the fender AND reach 1 inch deeper toward the suspension. Our calculator handles this complex math automatically.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/wheel-offset-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
