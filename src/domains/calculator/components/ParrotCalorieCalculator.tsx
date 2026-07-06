"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Bird } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// 1. TypeScript Interfaces
interface AvianInputs {
  weightGrams: number;
  activityLevel: "inactive" | "moderate" | "active";
  birdType: "non_passerine" | "passerine";
}

interface AvianResults {
  ber: number; // Basal Energy Requirement
  dailyCalories: number; // Maintenance Energy Requirement
  
  pelletCalories: number; // 70%
  freshVegCalories: number; // 20%
  treatCalories: number; // 10%

  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string; colorClass?: string }[];
}

// 2. Pure Calculation Function
const calculateAvianDiet = (inputs: AvianInputs): AvianResults | null => {
  const { weightGrams, activityLevel, birdType } = inputs;
  
  if (weightGrams <= 0) return null;

  const weightKg = weightGrams / 1000;

  // Avian Basal Energy Requirement (BER)
  // Non-Passerines (Parrots, Macaws, Cockatiels): 78 * W^0.75
  // Passerines (Canaries, Finches): 129 * W^0.75
  const kFactor = birdType === "passerine" ? 129 : 78;
  const ber = kFactor * Math.pow(weightKg, 0.75);

  // Activity Multipliers (Maintenance Energy Requirement)
  const multipliers = {
    inactive: 1.5, // Cage-bound, rarely flies, clipped wings
    moderate: 2.0, // Out of cage time, short flights
    active: 3.0    // Free flight, breeding, highly active
  };

  const dailyCalories = ber * multipliers[activityLevel];

  // Avian Diet Rule of Thumb (approximate ideal for most parrots):
  // 70% high-quality pellets
  // 20% fresh vegetables / greens
  // 10% seeds / nuts / fruit (treats)
  const pelletCalories = dailyCalories * 0.70;
  const freshVegCalories = dailyCalories * 0.20;
  const treatCalories = dailyCalories * 0.10;

  const chartData = [
    { name: "Formulated Pellets", value: pelletCalories, color: "hsl(var(--primary))" },
    { name: "Fresh Vegetables", value: freshVegCalories, color: "#10b981" },
    { name: "Seeds / Nuts / Fruit", value: treatCalories, color: "#f59e0b" }
  ];

  let speciesSize = "Small";
  if (weightGrams > 600) speciesSize = "Extra Large (Macaw/Cockatoo)";
  else if (weightGrams > 300) speciesSize = "Large (African Grey/Amazon)";
  else if (weightGrams > 100) speciesSize = "Medium (Conure/Quaker)";
  else speciesSize = "Small (Budgie/Cockatiel/Finch)";

  const summaryStats = [
    { label: "Total Daily Calories", value: `${dailyCalories.toFixed(1)} kcal`, colorClass: "text-primary font-bold" },
    { label: "Basal Metabolism", value: `${ber.toFixed(1)} kcal` },
    { label: "Pellet Allocation (70%)", value: `${pelletCalories.toFixed(1)} kcal` },
    { label: "Veggie Allocation (20%)", value: `${freshVegCalories.toFixed(1)} kcal` },
    { label: "Max Treat Allocation (10%)", value: `${treatCalories.toFixed(1)} kcal`, colorClass: "text-amber-500 font-medium" },
    { label: "Size Category", value: speciesSize }
  ];

  return {
    ber,
    dailyCalories,
    pelletCalories,
    freshVegCalories,
    treatCalories,
    chartData,
    summaryStats
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  weightGrams: "400", // Average African Grey
  activityLevel: "moderate" as const,
  birdType: "non_passerine" as const
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold mb-0.5" style={{ color: payload[0].payload.color }}>{payload[0].name}</p>
        <p className="text-muted-foreground">{payload[0].value.toFixed(1)} kcal / day</p>
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

export default function ParrotCalorieCalculator() {
  // 4. Component State
  const [weightGrams, setWeightGrams] = useState(DEFAULTS.weightGrams);
  const [activityLevel, setActivityLevel] = useState<"inactive" | "moderate" | "active">(DEFAULTS.activityLevel);
  const [birdType, setBirdType] = useState<"non_passerine" | "passerine">(DEFAULTS.birdType);
  
  const [results, setResults] = useState<AvianResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    const inputs: AvianInputs = {
      weightGrams: parseFloat(weightGrams) || 0,
      activityLevel,
      birdType
    };
    setResults(calculateAvianDiet(inputs));
  };

  const handleReset = () => {
    setWeightGrams(DEFAULTS.weightGrams);
    setActivityLevel(DEFAULTS.activityLevel);
    setBirdType(DEFAULTS.birdType);
    
    setResults(calculateAvianDiet({
      weightGrams: parseFloat(DEFAULTS.weightGrams),
      activityLevel: DEFAULTS.activityLevel,
      birdType: DEFAULTS.birdType
    }));
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weightGrams, activityLevel, birdType]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Avian Diet Results</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "Why is a seed-only diet dangerous for parrots?", answer: "Seeds are incredibly high in fat and low in essential vitamins, particularly Vitamin A and Calcium. Feeding a parrot a 100% seed diet is the equivalent of feeding a human a diet composed entirely of fast food. It leads to obesity, fatty liver disease, and severely shortened lifespans." },
    { question: "What is a Non-Passerine vs Passerine?", answer: "Non-passerines include all parrots, macaws, cockatoos, budgies, and conures. They have a slightly lower basal metabolic rate. Passerines are 'perching birds' like canaries and finches. They have extremely fast metabolisms and require significantly more calories per gram of body weight." },
    { question: "What is the 70/20/10 Rule?", answer: "Avian veterinarians generally recommend a diet consisting of 70% formulated high-quality pellets, 20% fresh vegetables (like kale, carrots, and bell peppers), and only 10% seeds, nuts, or high-sugar fruits." },
    { question: "How do I transition my bird to pellets?", answer: "Never remove a bird's seed abruptly; birds will stubbornly starve themselves rather than eat an unfamiliar food. Transition slowly over weeks by mixing pellets with seeds, moistening the pellets with a tiny bit of unsweetened fruit juice, or pretending to eat the pellets yourself to trigger their flock-foraging instinct." },
    { question: "Why is my bird losing weight?", answer: "Weight loss in birds is an extreme medical emergency. Birds hide their illnesses instinctively to avoid predators. By the time you notice weight loss or fluffed feathers, the bird is often critically ill. Seek an avian veterinarian immediately." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Parrot & Avian Calorie Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Parrot & Avian Diet Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
          {/* LEFT 460px: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Bird className="h-4 w-4" /> Avian Dietitian
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Calculate exact daily caloric requirements and ideal dietary distribution for your parrot, macaw, or finch.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="weight" label="Bird's Weight" value={weightGrams} onChange={setWeightGrams} suffix="grams" />
            </div>

            <div className="flex flex-col">
              <label htmlFor="birdType" className="flex items-center text-sm font-semibold text-foreground mb-1.5">
                Avian Classification
              </label>
              <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                <select
                  id="birdType"
                  value={birdType}
                  onChange={(e) => setBirdType(e.target.value as any)}
                  className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground cursor-pointer font-medium"
                >
                  <option value="non_passerine">Parrots, Macaws, Cockatiels, Budgies</option>
                  <option value="passerine">Passerines (Canaries, Finches)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col mb-1">
              <label htmlFor="activity" className="flex items-center text-sm font-semibold text-foreground mb-1.5">
                Flight Activity Level
              </label>
              <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                <select
                  id="activity"
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value as any)}
                  className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground cursor-pointer font-medium"
                >
                  <option value="inactive">Cage-Bound / Clipped Wings / Inactive</option>
                  <option value="moderate">Moderate (Out of cage, short flights)</option>
                  <option value="active">Free Flight / Highly Active / Breeding</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button type="button" onClick={handleReset} className="w-full rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center font-bold text-sm">
                <RotateCcw className="h-4 w-4 mr-2" /> Reset Values
              </button>
            </div>
          </div>

          {/* RIGHT fluid: Results */}
          <div className="flex flex-col gap-4">
            {results ? (
              <div ref={printRef} className="flex flex-col gap-4 animate-fade-in-up">
                
                {/* 1. Primary Result Card */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative overflow-hidden">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden z-10" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="relative z-10">
                    <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total Daily Maintenance Calories</div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <div className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">{results.dailyCalories.toFixed(1)}</div>
                      <div className="text-xl font-bold text-muted-foreground">kcal</div>
                    </div>
                    <div className="text-sm font-medium text-foreground/80 leading-relaxed max-w-sm">
                      Distribute these calories utilizing the veterinary recommended 70/20/10 protocol to prevent malnutrition.
                    </div>
                  </div>
                  <Bird className="absolute -bottom-4 -right-4 h-32 w-32 text-primary/10" />
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  {/* 3. Summary Statistics */}
                  <div className="bg-muted/30 border border-border rounded-lg p-5 h-full">
                    <h3 className="text-base font-bold mb-4">Nutritional Distribution</h3>
                    <div className="grid grid-cols-1 gap-y-4 text-base">
                      {results.summaryStats.map((stat, i) => (
                        <div key={i} className="flex justify-between items-center border-b border-border/40 pb-2 last:border-0 last:pb-0">
                          <span className="text-muted-foreground">{stat.label}:</span>
                          <span className={`font-semibold ${stat.colorClass || ''}`}>{stat.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. Chart / Visualization */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[260px]">
                    <h3 className="text-base font-bold mb-2 w-full text-left">The 70/20/10 Protocol</h3>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie
                          data={results.chartData}
                          cx="50%" cy="50%"
                          innerRadius={50} outerRadius={70}
                          paddingAngle={3} dataKey="value"
                        >
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-col gap-2 mt-2 w-full">
                      {results.chartData.map((d, i) => (
                        <div key={i} className="flex justify-between items-center text-xs font-medium">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }}></span>
                            {d.name}
                          </div>
                          <span className="font-bold">{d.value.toFixed(1)} kcal</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <Bird className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium">Enter your bird's weight in grams to calculate their exact basal and maintenance metabolic requirements.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding Avian Metabolism and Nutrition</h2>
            <p>Parrots, macaws, and finches are incredibly complex animals with a metabolism vastly different from the domestic dogs and cats we are used to caring for. A bird's metabolic engine runs incredibly hot; their core body temperature is higher, their heart rate is significantly faster, and their respiratory system is highly specialized for the immense physical demands of flight. The <strong>Parrot & Avian Calorie Calculator</strong> utilizes veterinary allometric scaling equations to pinpoint exactly how much energy your bird needs to maintain this high-performance biology.</p>
            <p>Unfortunately, malnutrition is the leading cause of premature death in captive exotic birds. Many owners inadvertently feed their birds diets that are too high in fat, too low in calcium, and devoid of Vitamin A. By understanding your bird's precise daily caloric limit, you can transition them to a medically sound 70/20/10 diet plan, ensuring vibrant plumage, a strong immune system, and a lifespan that can stretch for decades.</p>

            <h2 className="text-2xl font-bold mb-3">The Mathematics of Avian Basal Energy Requirements</h2>
            <p>To calculate a bird's daily caloric needs, avian veterinarians must first determine their Basal Energy Requirement (BER)—the amount of energy needed simply to keep the bird alive while at rest in a neutral temperature environment.</p>
            <p>Birds are divided into two main categories, which scale differently:</p>
            <ul>
              <li><strong>Non-Passerines (Parrots, Macaws, Cockatoos, Doves):</strong> These birds are highly efficient. Their formula is <code>BER = 78 × (Weight in kg)^0.75</code>.</li>
              <li><strong>Passerines (Canaries, Finches, Songbirds):</strong> These tiny 'perching birds' have a furiously fast metabolism. Their formula requires a much higher constant: <code>BER = 129 × (Weight in kg)^0.75</code>.</li>
            </ul>
            <p>Once the basal requirement is calculated, an <strong>Activity Multiplier</strong> must be applied to determine the Maintenance Energy Requirement (MER)—the actual calories they need to consume daily. A fully flighted macaw flying around a house requires significantly more energy (up to 3x BER) than a cage-bound, wing-clipped budgie (1.5x BER). Our calculator automatically applies these multipliers based on your selected activity level.</p>

            <h2 className="text-2xl font-bold mb-3">The Dangers of the All-Seed Diet</h2>
            <p>For decades, the standard pet trade narrative was that parrots should eat seeds. This is perhaps the most dangerous myth in avian care. Feeding a parrot a 100% seed diet is the nutritional equivalent of feeding a human child nothing but potato chips and donuts for their entire life.</p>
            <p>Commercial seed mixes are primarily composed of sunflower and safflower seeds. These are incredibly high in fat and devastatingly low in essential vitamins and minerals. Because seeds are tasty, birds will quickly become "seed junkies," refusing to eat anything else. Over years, this leads to:</p>
            <ul>
              <li><strong>Fatty Liver Disease (Hepatic Lipidosis):</strong> The liver becomes overwhelmed by the high-fat diet, eventually failing completely.</li>
              <li><strong>Vitamin A Deficiency (Hypovitaminosis A):</strong> Leading to respiratory infections, poor feather quality, and lesions in the mouth.</li>
              <li><strong>Calcium Deficiency:</strong> Causing weak bones, seizures, and fatal egg-binding in female birds.</li>
              <li><strong>Severe Obesity:</strong> Leading to arthritis and cardiovascular failure.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">The 70/20/10 Protocol</h2>
            <p>To reverse these statistics, board-certified avian veterinarians strongly advocate for the 70/20/10 protocol. Our calculator breaks down your bird's daily caloric limit into these three specific buckets:</p>
            <p><strong>1. Formulated Pellets (70%):</strong> The vast majority of your bird's calories must come from a high-quality, extruded pellet (brands like Harrison's, Roudybush, or ZuPreem). Pellets are scientifically engineered so that every single bite contains the exact ratio of protein, calcium, vitamins, and minerals required. Because it is uniform, the bird cannot "pick out" the unhealthy bits as they do with seed mixes.</p>
            <p><strong>2. Fresh Vegetables & Greens (20%):</strong> To provide phytonutrients and psychological foraging enrichment, one-fifth of the diet should be fresh, bird-safe vegetables. Dark leafy greens (kale, spinach, mustard greens), orange vegetables (carrots, sweet potatoes, butternut squash), and bell peppers are excellent choices. Avocado is highly toxic and must never be fed.</p>
            <p><strong>3. Seeds, Nuts, and Fruits (10% max):</strong> Seeds and nuts should be treated strictly as training rewards. They are excellent high-value tools for teaching your bird tricks or step-up commands, but they must not exceed 10% of their daily caloric intake. Fruits, while natural, are very high in fructose and should be limited as well.</p>

            <h2 className="text-2xl font-bold mb-3">How to Transition a Seed-Junkie to Pellets</h2>
            <p>If you realize your bird has been living on an unhealthy seed diet, do not simply replace their seeds with pellets overnight. Birds are neophobic (fearful of new things). If they do not recognize a pellet as food, they will stubbornly starve themselves to death rather than eat it.</p>
            <p>Transitioning requires time and patience. Start by mixing 90% seed and 10% pellets. Slowly increase the pellet ratio over four to six weeks. You can encourage curiosity by pretending to eat the pellets yourself; parrots are flock animals, and seeing you (their flock leader) eat something will often trigger them to try it. Another trick is slightly moistening the pellets with a tiny drop of unsweetened apple juice to make them smell sweeter, gradually reducing the juice over time.</p>

            <h2 className="text-2xl font-bold mb-3">Weight Monitoring and Avian Health</h2>
            <p>A digital gram scale is the most important medical tool an avian owner can possess. In the wild, a sick bird is quickly targeted by predators. To survive, birds have evolved to mask symptoms of illness perfectly. By the time a parrot looks sick (sitting at the bottom of the cage, fluffed feathers, lethargy), they are usually within hours of death.</p>
            <p>The only reliable early warning sign of avian illness is rapid weight loss. You should weigh your bird on a digital scale every single week at the exact same time of day (preferably in the morning before they eat). A loss of 5% of their body weight over a few days is a major red flag; a 10% loss is a critical emergency requiring an immediate trip to an exotic veterinarian.</p>

            <h2 className="text-2xl font-bold mb-3">Hydration and Caloric Intake</h2>
            <p>While the focus is often on food, hydration is equally critical. Unlike mammals, birds produce uric acid instead of liquid urea, which is why their droppings have a white, chalky component. While this is water-efficient, they still require constant access to fresh, clean water. A general rule of thumb is that a bird requires roughly 1 milliliter of water for every kilocalorie of energy consumed. A bird eating 100 kcal per day will generally drink about 100 mL of water, though much of this can come from the moisture content in their fresh vegetables.</p>

            <h2 className="text-2xl font-bold mb-3">Conclusion</h2>
            <p>Feeding a parrot is more akin to feeding a highly specialized human athlete than an ordinary house pet. Their brilliant minds and delicate biologies require exact nutritional inputs to thrive. By utilizing the Parrot & Avian Diet Calculator, converting their diet to a pellet-based protocol, and vigilantly monitoring their weight on a gram scale, you can protect your feathered companion from the silent epidemic of avian malnutrition.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/parrot-calorie-calculator" />
          <PopularCalculators exclude="/calculator/parrot-calorie-calculator" />
        </div>
      </div>
    </>
  );
}
