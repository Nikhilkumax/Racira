"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, TrendingUp, Users, ArrowUpRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceLine, ErrorBar } from "recharts";

interface HeightResult {
  projectedHeightInches: number;
  projectedHeightStr: string;
  minHeightStr: string;
  maxHeightStr: string;
  chartData: any[];
  summaryStats: { label: string; value: string }[];
}

function formatInches(totalInches: number): string {
  const ft = Math.floor(totalInches / 12);
  const inc = Math.round(totalInches % 12);
  return `${ft}'${inc}"`;
}

function calcHeight(sex: string, momInches: number, dadInches: number): HeightResult | null {
  if (momInches <= 0 || dadInches <= 0) return null;

  // Mid-Parental Height Formula (Tanner Method)
  let projected = 0;
  if (sex === "boy") {
    projected = (momInches + dadInches + 5) / 2;
  } else {
    projected = (momInches + dadInches - 5) / 2;
  }

  // Clinical range is typically +/- 4 inches (representing 3rd to 97th percentile)
  const minHeight = projected - 4;
  const maxHeight = projected + 4;

  const chartData = [
    { 
      name: "Mother", 
      height: momInches,
      fill: "#ec4899" // Pink
    },
    { 
      name: "Father", 
      height: dadInches,
      fill: "#3b82f6" // Blue
    },
    { 
      name: "Child (Predicted)", 
      height: projected,
      // We use error bars to show the +/- 4 inch range, so we need min/max relative to the bar
      errorData: [4, 4],
      fill: "#10b981" // Green
    }
  ];

  const summaryStats = [
    { label: "Minimum Target", value: formatInches(minHeight) },
    { label: "Maximum Target", value: formatInches(maxHeight) }
  ];

  return {
    projectedHeightInches: projected,
    projectedHeightStr: formatInches(projected),
    minHeightStr: formatInches(minHeight),
    maxHeightStr: formatInches(maxHeight),
    chartData,
    summaryStats
  };
}

export default function ChildHeightPredictor() {
  const [sex, setSex] = useState("boy");
  const [momFt, setMomFt] = useState("5");
  const [momIn, setMomIn] = useState("4");
  const [dadFt, setDadFt] = useState("5");
  const [dadIn, setDadIn] = useState("10");

  const [result, setResult] = useState<HeightResult | null>(null);

  useEffect(() => {
    setResult(calcHeight("boy", (5 * 12) + 4, (5 * 12) + 10));
  }, []);

  const calculate = () => {
    const mf = parseInt(momFt) || 0;
    const mi = parseInt(momIn) || 0;
    const df = parseInt(dadFt) || 0;
    const di = parseInt(dadIn) || 0;
    
    const momTotal = (mf * 12) + mi;
    const dadTotal = (df * 12) + di;

    if (momTotal > 0 && dadTotal > 0) {
      setResult(calcHeight(sex, momTotal, dadTotal));
    }
  };

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "How does the Mid-Parental Height method work?", answer: "The Mid-Parental Height (Tanner) method is a widely accepted clinical formula used by pediatricians. It relies on the biological fact that approximately 70-80% of human height is determined purely by genetics. By averaging the heights of both biological parents and adding 5 inches for boys (or subtracting 5 inches for girls to account for standard sexual dimorphism), doctors can accurately predict a child's target adult height." },
    { question: "Why is the predicted range so wide (+/- 4 inches)?", answer: "The +/- 4 inch window represents the 3rd to 97th percentiles of genetic probability. While a child inherits genes from their parents, they do not inherit an exact replica. They inherit a random shuffling of alleles. One child might inherit all the 'tall' genes present in the parents' DNA, while their sibling inherits the 'short' genes, resulting in two brothers who have a 6-inch height difference despite having the exact same parents." },
    { question: "Can nutrition affect my child's final height?", answer: "Yes, significantly. While genetics dictate the 'maximum possible ceiling' for a child's height, environment dictates whether they actually reach it. Severe chronic malnutrition, calcium/vitamin D deficiencies, or frequent childhood illnesses can stunt growth, causing a child to end up shorter than their genetic potential. Conversely, a perfect diet cannot make a child grow taller than their DNA allows." },
    { question: "Are there more accurate methods than this one?", answer: "Yes. The Khamis-Roche method and the Greulich-Pyle method (which requires taking an X-ray of the child's left hand to measure 'bone age') are more accurate. However, they require the child to be older than 4 years old, and the bone-age method exposes the child to unnecessary radiation, so it is usually reserved for children with suspected endocrine/growth hormone disorders." },
    { question: "When do children stop growing?", answer: "Growth is driven by puberty. Girls typically hit their peak growth spurt around age 11 to 12, and their growth plates fuse (stopping all upward growth) roughly 2 to 3 years after their first menstrual period (usually around age 14 or 15). Boys hit their growth spurt later, around age 13 to 14, and their growth plates typically fuse between ages 17 and 19." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Child Height Predictor" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Child Height Predictor</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm sticky top-6">
            
            <div>
              <label className="text-sm font-medium mb-1.5 block">Child's Biological Sex</label>
              <select value={sex} onChange={e => setSex(e.target.value)} className={`${inp} w-full px-3 text-sm focus:ring-2 focus:ring-primary/20`}>
                <option value="boy">Boy</option>
                <option value="girl">Girl</option>
              </select>
            </div>

            <div className="border-t border-border pt-4">
              <label className="text-sm font-bold mb-1.5 block">Mother's Height</label>
              <div className="grid grid-cols-2 gap-4">
                <div className={inp}><input type="number" value={momFt} onChange={e => setMomFt(e.target.value)} className={ci} /><span className="pr-3 text-xs text-muted-foreground">ft</span></div>
                <div className={inp}><input type="number" value={momIn} onChange={e => setMomIn(e.target.value)} className={ci} /><span className="pr-3 text-xs text-muted-foreground">in</span></div>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <label className="text-sm font-bold mb-1.5 block">Father's Height</label>
              <div className="grid grid-cols-2 gap-4">
                <div className={inp}><input type="number" value={dadFt} onChange={e => setDadFt(e.target.value)} className={ci} /><span className="pr-3 text-xs text-muted-foreground">ft</span></div>
                <div className={inp}><input type="number" value={dadIn} onChange={e => setDadIn(e.target.value)} className={ci} /><span className="pr-3 text-xs text-muted-foreground">in</span></div>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 text-base transition-all shadow-sm">
                <TrendingUp className="h-5 w-5" /> Predict Height
              </button>
              <button onClick={() => { setSex("boy"); setMomFt("5"); setMomIn("4"); setDadFt("5"); setDadIn("10"); setResult(calcHeight("boy", 64, 70)); }} className="w-11 h-11 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {result && (<>
              
              <div className="border-l-4 rounded-lg p-5 shadow-sm bg-emerald-500/10 border-emerald-500">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-1 text-emerald-700">Projected Adult Height</div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">{result.projectedHeightStr}</div>
                    </div>
                  </div>
                  <div className="bg-background rounded-full p-2.5 shadow-sm border border-border shrink-0">
                    <ArrowUpRight className="w-8 h-8 text-emerald-600" />
                  </div>
                </div>
                <div className="text-sm font-medium text-muted-foreground mt-2">
                  This is the exact statistical average based on your entered genetics.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="card-calculator !p-4 border border-border bg-card shadow-sm text-center">
                    <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1">{s.label}</div>
                    <div className="text-xl sm:text-2xl font-black text-foreground">{s.value}</div>
                  </div>
                ))}
              </div>
              
              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-base font-bold">Family Height Comparison</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-6">The black error bar indicates the full 8-inch window of genetic probability for the child.</p>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={result.chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis 
                      domain={['dataMin - 10', 'dataMax + 10']} 
                      tickFormatter={(inches) => formatInches(inches)}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip cursor={{ fill: '#f1f5f9' }} 
                      formatter={(value: number, name: string, props: any) => {
                        if (name === "height") return [formatInches(value), props.payload.name];
                        return [value, name];
                      }} 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} 
                    />
                    <Bar dataKey="height" radius={[4, 4, 0, 0]} maxBarSize={60}>
                      {result.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                      <ErrorBar dataKey="errorData" width={10} strokeWidth={2} stroke="#0f172a" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>The Genetics of Human Growth</h2>
            <p>Predicting exactly how tall a child will be is one of the most common questions pediatricians face. Human height is considered a "polygenic trait"—meaning it is controlled by hundreds of different genes interacting together. However, extensive clinical research has shown that approximately <strong>80% of a person's adult height is determined solely by genetics</strong>.</p>
            <p>Because genetics play such a dominant role, doctors use a mathematical shortcut known as the <strong>Mid-Parental Height (Tanner) Method</strong> to quickly establish a child's growth target.</p>

            <h2>Understanding the "Target Window"</h2>
            <p>While the calculator provides a single, precise number (e.g., 5'9"), this is merely the statistical center. In genetics, there is a concept known as "Regression to the Mean."</p>
            <p>If two parents are both extraordinarily tall, their child will likely be tall, but statistically, the child will be closer to the population average than the parents are. Conversely, very short parents will typically have children who are slightly taller than they are. The calculator provides a wide <strong>8-inch target window</strong> (4 inches above and below the predicted number) which captures 95% of all genetic outcomes. If your child's predicted height is 5'9", it is perfectly biologically normal for them to end up anywhere between 5'5" and 6'1".</p>

            <h2>Why Nutrition is the Missing 20%</h2>
            <p>If genetics control 80% of height, what controls the other 20%? Environmental factors, with <strong>childhood nutrition</strong> being the most critical.</p>
            <p>Your child's DNA provides the architectural blueprint for their maximum possible height. However, building that skeleton requires raw materials. If a child suffers from severe malnutrition, chronic calorie deficits, or specific vitamin deficiencies (especially Vitamin D and Calcium) during their critical growth spurts, their body will literally halt bone growth to conserve energy. This is known as "stunting." Once the growth plates in the long bones fuse at the end of puberty, that lost growth can never be recovered.</p>

            <h2>Growth Plates and Puberty</h2>
            <p>A child's height increases because of specialized cartilage at the ends of their long bones (like the femur), known as <strong>epiphyseal plates</strong>. During childhood, these plates rapidly produce new bone tissue, pushing the bones longer.</p>
            <p>When a child enters puberty, the massive surge of sex hormones (estrogen and testosterone) triggers a final, explosive "growth spurt." However, these same hormones also signal the cartilage to begin turning into solid bone. Once this ossification process is complete (typically around age 15 for girls and 18 for boys), the growth plates are considered "fused." After fusion, no further upward growth is biologically possible, regardless of diet, stretching, or supplements.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/child-height-predictor" />
          <PopularCalculators exclude="/calculator/child-height-predictor" />
        </div>
      </div>
    </>
  );
}
