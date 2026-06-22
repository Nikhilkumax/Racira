"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Activity, ShieldAlert, ShieldCheck } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceLine } from "recharts";

interface BishopResult {
  totalScore: number;
  statusText: string;
  statusColor: string;
  recommendation: string;
  chartData: { subject: string; score: number; max: number }[];
  summaryStats: { label: string; value: string }[];
}

function calcBishop(dilation: number, effacement: number, station: number, consistency: number, position: number): BishopResult {
  const totalScore = dilation + effacement + station + consistency + position;

  let statusText = "";
  let statusColor = "";
  let recommendation = "";

  if (totalScore >= 8) {
    statusText = "Favorable Cervix";
    statusColor = "#22c55e"; // Green
    recommendation = "High probability of successful labor induction. The cervix is ripe and ready, and the chances of a successful vaginal delivery are similar to those of spontaneous labor.";
  } else if (totalScore >= 6) {
    statusText = "Intermediate";
    statusColor = "#f59e0b"; // Yellow
    recommendation = "Moderate probability of successful induction. Medical intervention (like Pitocin) may be effective, but cervical ripening agents might still be considered by the physician.";
  } else {
    statusText = "Unfavorable Cervix";
    statusColor = "#ef4444"; // Red
    recommendation = "Low probability of successful induction without prior cervical ripening. If induction is medically necessary, the doctor will likely use a medication (like Misoprostol/Cytotec) or a Foley bulb to ripen the cervix first.";
  }

  const chartData = [
    { subject: "Dilation", score: dilation, max: 3 },
    { subject: "Effacement", score: effacement, max: 3 },
    { subject: "Station", score: station, max: 3 },
    { subject: "Consistency", score: consistency, max: 2 },
    { subject: "Position", score: position, max: 2 }
  ];

  const summaryStats = [
    { label: "Target Score", value: "≥ 8" },
    { label: "Clinical Status", value: statusText }
  ];

  return {
    totalScore,
    statusText,
    statusColor,
    recommendation,
    chartData,
    summaryStats
  };
}

export default function BishopScoreCalculator() {
  const [dilation, setDilation] = useState<number>(0);
  const [effacement, setEffacement] = useState<number>(0);
  const [station, setStation] = useState<number>(0);
  const [consistency, setConsistency] = useState<number>(0);
  const [position, setPosition] = useState<number>(0);

  const [result, setResult] = useState<BishopResult | null>(null);

  useEffect(() => {
    setResult(calcBishop(dilation, effacement, station, consistency, position));
  }, [dilation, effacement, station, consistency, position]);

  const reset = () => {
    setDilation(0);
    setEffacement(0);
    setStation(0);
    setConsistency(0);
    setPosition(0);
  };

  const selCls = "w-full p-2.5 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none";

  const faqs = [
    { question: "What is the Bishop Score used for?", answer: "The Bishop Score is a clinical system used by obstetricians to predict how likely a woman is to have a successful labor induction (meaning she will deliver vaginally instead of requiring a C-section). It assesses how 'ripe' or ready the cervix is for labor." },
    { question: "What does an 'Unfavorable' score mean?", answer: "A score of 5 or lower means the cervix is still closed, thick, and positioned far back. If a doctor simply starts an IV of Pitocin with an unfavorable cervix, the induction is highly likely to fail and end in an emergency C-section. In this case, the doctor must first use 'cervical ripening' methods (like a Foley balloon or prostaglandin medications) to prepare the cervix before starting contractions." },
    { question: "What is Effacement?", answer: "Effacement refers to the thinning of the cervix. During pregnancy, the cervix is roughly 4 centimeters long and very thick to keep the baby secure. Before it can dilate (open), it must thin out. This is measured in percentages. 0% means the cervix is thick and completely unaffected; 100% means the cervix is paper-thin." },
    { question: "What does Fetal Station mean?", answer: "Station measures how far the baby's head has descended into the mother's pelvis. The 'zero' station refers to the baby's head being exactly level with the mother's ischial spines (the narrowest part of the pelvis). Negative numbers (-3, -2) mean the baby is still high up in the abdomen. Positive numbers (+1, +2) mean the baby has descended into the birth canal." },
    { question: "How is Consistency and Position evaluated?", answer: "These are physical characteristics evaluated during a manual cervical exam. The cervix starts out feeling firm (like the tip of a nose) and pointing backward (posterior). As the body prepares for labor, the tissue softens dramatically (feeling like the lips of a mouth) and rotates forward (anterior) to align with the birth canal." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Bishop Score Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Bishop Score Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-5 !p-5 border border-border bg-card shadow-sm sticky top-6">
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold mb-1.5 flex justify-between">
                  <span>Dilation (Opening)</span>
                  <span className="text-primary bg-primary/10 px-2 py-0.5 rounded text-xs">{dilation} pts</span>
                </label>
                <select value={dilation} onChange={e => setDilation(Number(e.target.value))} className={selCls}>
                  <option value={0}>0 - Closed (0 cm)</option>
                  <option value={1}>1 - Slightly open (1 to 2 cm)</option>
                  <option value={2}>2 - Moderately open (3 to 4 cm)</option>
                  <option value={3}>3 - Very open (5+ cm)</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-bold mb-1.5 flex justify-between">
                  <span>Effacement (Thinning)</span>
                  <span className="text-primary bg-primary/10 px-2 py-0.5 rounded text-xs">{effacement} pts</span>
                </label>
                <select value={effacement} onChange={e => setEffacement(Number(e.target.value))} className={selCls}>
                  <option value={0}>0 - Thick (0 to 30%)</option>
                  <option value={1}>1 - Moderate thinning (40 to 50%)</option>
                  <option value={2}>2 - Mostly thin (60 to 70%)</option>
                  <option value={3}>3 - Paper thin (80% or more)</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-bold mb-1.5 flex justify-between">
                  <span>Fetal Station (Descent)</span>
                  <span className="text-primary bg-primary/10 px-2 py-0.5 rounded text-xs">{station} pts</span>
                </label>
                <select value={station} onChange={e => setStation(Number(e.target.value))} className={selCls}>
                  <option value={0}>0 - High (-3)</option>
                  <option value={1}>1 - Descending (-2)</option>
                  <option value={2}>2 - Engaged (-1 or 0)</option>
                  <option value={3}>3 - Low (+1 or +2)</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-bold mb-1.5 flex justify-between">
                  <span>Cervical Consistency</span>
                  <span className="text-primary bg-primary/10 px-2 py-0.5 rounded text-xs">{consistency} pts</span>
                </label>
                <select value={consistency} onChange={e => setConsistency(Number(e.target.value))} className={selCls}>
                  <option value={0}>0 - Firm (Feels like the tip of a nose)</option>
                  <option value={1}>1 - Medium</option>
                  <option value={2}>2 - Soft (Feels like the lips of a mouth)</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-bold mb-1.5 flex justify-between">
                  <span>Cervical Position</span>
                  <span className="text-primary bg-primary/10 px-2 py-0.5 rounded text-xs">{position} pts</span>
                </label>
                <select value={position} onChange={e => setPosition(Number(e.target.value))} className={selCls}>
                  <option value={0}>0 - Posterior (Pointing backward)</option>
                  <option value={1}>1 - Midposition</option>
                  <option value={2}>2 - Anterior (Pointing forward)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-2 border-t border-border pt-4">
              <button onClick={reset} className="w-full flex items-center justify-center gap-2 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold h-11 text-sm transition-all shadow-sm">
                <RotateCcw className="h-4 w-4" /> Reset Score
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {result && (<>
              
              <div className="border-l-4 rounded-lg p-5 shadow-sm" style={{ backgroundColor: `${result.statusColor}10`, borderColor: result.statusColor }}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: result.statusColor }}>Total Bishop Score</div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-5xl sm:text-6xl font-extrabold text-foreground tracking-tight">{result.totalScore}</div>
                      <div className="text-2xl font-bold text-muted-foreground">/ 13</div>
                    </div>
                  </div>
                  <div className="bg-background rounded-full p-3 shadow-sm border border-border shrink-0">
                    {result.totalScore >= 8 ? <ShieldCheck className="w-8 h-8" style={{ color: result.statusColor }} /> : <ShieldAlert className="w-8 h-8" style={{ color: result.statusColor }} />}
                  </div>
                </div>
                <div className="text-base font-bold mt-2" style={{ color: result.statusColor }}>
                  {result.statusText}
                </div>
                <div className="text-sm font-medium text-foreground mt-2 leading-relaxed">
                  {result.recommendation}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="card-calculator !p-4 border border-border bg-card shadow-sm text-center">
                    <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1">{s.label}</div>
                    <div className="text-sm sm:text-lg font-black text-foreground">{s.value}</div>
                  </div>
                ))}
              </div>
              
              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-base font-bold">Cervical Ripeness Profile</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-6">Visualizing the 5 factors relative to their maximum possible clinical score.</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                    <XAxis type="number" domain={[0, 3]} tick={{ fontSize: 11 }} ticks={[0, 1, 2, 3]} />
                    <YAxis type="category" dataKey="subject" tick={{ fontSize: 11, fontWeight: 600 }} />
                    <Tooltip cursor={{ fill: '#f1f5f9' }} 
                      formatter={(value: number, name: string, props: any) => [`${value} / ${props.payload.max}`, 'Score']} 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} 
                    />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]} maxBarSize={20}>
                      {result.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={result.statusColor} />
                      ))}
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
            <h2>Understanding Labor Induction</h2>
            <p>Labor induction is the medical process of artificially stimulating uterine contractions to achieve a vaginal birth before labor begins on its own. While inductions are common, they are not always successful. If an induction fails to progress, the mother is often rushed into an unplanned Cesarean section (C-section).</p>
            <p>In the 1960s, Dr. Edward Bishop recognized that the primary reason inductions fail is that the mother's body simply isn't physically prepared to give birth yet. He developed the <strong>Bishop Score</strong> to quantify exactly how "ripe" or ready the cervix is, allowing doctors to predict the success rate of the procedure.</p>

            <h2>The Danger of an Unfavorable Cervix</h2>
            <p>During the 40 weeks of pregnancy, the cervix is designed to be a rigid, thick, closed vault that keeps the baby safely inside the uterus. For a baby to be born, that vault must undergo a massive physical transformation. It must soften entirely, thin out like a piece of paper (effacement), and stretch open to 10 centimeters (dilation).</p>
            <p>If a doctor attempts to induce labor by administering Pitocin (a synthetic hormone that causes contractions) while the cervix is still rigid and closed (a Bishop score of 5 or less), the uterus will contract violently against a locked door. This causes extreme pain for the mother, cuts off oxygen to the baby, and almost inevitably results in a C-section.</p>

            <h2>Cervical Ripening: Preparing for Induction</h2>
            <p>If a mother requires a medically necessary induction (due to high blood pressure, gestational diabetes, or being two weeks past her due date) but has an <strong>unfavorable Bishop score</strong>, the doctor must first perform "cervical ripening."</p>
            <p>This is typically done by inserting a medication containing prostaglandins (such as Cervidil or Cytotec) directly against the cervix, or by mechanically stretching it using a Foley balloon catheter. This process can take 12 to 24 hours. Once the cervical tissue softens and the Bishop score increases to an 8 or higher, the doctor can safely begin administering Pitocin to stimulate the actual contractions.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/bishop-score-calculator" />
          <PopularCalculators exclude="/calculator/bishop-score-calculator" />
        </div>
      </div>
    </>
  );
}
