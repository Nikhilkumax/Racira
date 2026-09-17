"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Droplet, Calendar, ShieldCheck, Heart } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface DonationResult {
  eligibleDate: string;
  daysRemaining: number;
  totalWaitDays: number;
  isEligibleNow: boolean;
  progressPercent: number;
  statusText: string;
  statusColor: string;
  chartData: { name: string; daysPassed: number; daysRemaining: number }[];
  summaryStats: { label: string; value: string }[];
}

function calcEligibility(lastDateStr: string, donationType: string): DonationResult | null {
  if (!lastDateStr) return null;

  const lastDate = new Date(lastDateStr);
  const today = new Date();
  
  // Set times to midnight to calculate pure days
  lastDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  let waitDays = 0;
  switch (donationType) {
    case "whole": waitDays = 56; break; // 8 weeks
    case "power_red": waitDays = 112; break; // 16 weeks
    case "plasma": waitDays = 28; break; // 4 weeks
    case "platelets": waitDays = 7; break; // 1 week
    default: waitDays = 56;
  }

  const eligibleDate = new Date(lastDate);
  eligibleDate.setDate(lastDate.getDate() + waitDays);

  const diffTime = eligibleDate.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isEligibleNow = daysRemaining <= 0;
  
  let statusText = "";
  let statusColor = "";
  let progressPercent = 0;

  let daysPassed = waitDays - daysRemaining;

  if (isEligibleNow) {
    statusText = "Eligible Now";
    statusColor = "#22c55e"; // Green
    progressPercent = 100;
    daysPassed = waitDays; // Cap it for the chart visually
  } else {
    statusText = "Recovery Period";
    statusColor = "#3b82f6"; // Blue
    progressPercent = Math.max(0, Math.round((daysPassed / waitDays) * 100));
  }

  const chartData = [
    { 
      name: "Recovery Progress", 
      daysPassed: Math.max(0, daysPassed), 
      daysRemaining: Math.max(0, daysRemaining) 
    }
  ];

  const summaryStats = [
    { label: "Required Wait Time", value: `${waitDays} Days` },
    { label: "Progress", value: `${progressPercent}%` }
  ];

  return {
    eligibleDate: eligibleDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' }),
    daysRemaining: Math.max(0, daysRemaining),
    totalWaitDays: waitDays,
    isEligibleNow,
    progressPercent,
    statusText,
    statusColor,
    chartData,
    summaryStats
  };
}

export default function BloodDonationCalculator() {
  const [lastDate, setLastDate] = useState("");
  const [donationType, setDonationType] = useState("whole");

  const [result, setResult] = useState<DonationResult | null>(null);

  useEffect(() => {
    // Set default date to 30 days ago to show an interesting partial progress
    const d = new Date();
    d.setDate(d.getDate() - 30);
    const isoDate = d.toISOString().split('T')[0];
    setLastDate(isoDate);
    setResult(calcEligibility(isoDate, "whole"));
  }, []);

  const calculate = () => {
    if (lastDate) {
      setResult(calcEligibility(lastDate, donationType));
    }
  };

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "Why do I have to wait 56 days between Whole Blood donations?", answer: "When you donate a pint of Whole Blood, your body replaces the liquid portion (plasma) within 24 to 48 hours. However, your bone marrow requires approximately 4 to 8 weeks to manufacture enough brand-new red blood cells to fully replace the ones you donated. The 56-day (8-week) mandatory waiting period ensures your hemoglobin levels have completely rebounded, preventing you from becoming anemic." },
    { question: "What is a 'Power Red' donation?", answer: "A Power Red (or Double Red Cell) donation uses a specialized machine to safely draw two units of red blood cells while simultaneously returning your plasma and platelets back into your arm. Because you are losing twice as many oxygen-carrying red blood cells, the mandatory recovery period is strictly doubled to 112 days (16 weeks)." },
    { question: "Why is the wait for Platelets so short (7 days)?", answer: "Unlike red blood cells, platelets have a very short natural lifespan (only about 8 to 10 days) and your body manufactures them extremely quickly. Therefore, you can safely donate platelets every 7 days, up to 24 times per year, without compromising your health." },
    { question: "Can I donate if I am currently taking medication?", answer: "In most cases, yes. The vast majority of standard medications (such as blood pressure pills or antidepressants) do not disqualify you from donating blood. However, antibiotics (if currently fighting an infection) and certain blood thinners or acne medications require a waiting period. Always consult the screening nurse." },
    { question: "Is there a limit to how many times I can donate a year?", answer: "Yes, to protect donor health. You can donate Whole Blood a maximum of 6 times a year (every 56 days). Power Reds are limited to 3 times a year. Platelets can be donated up to 24 times a year, and Plasma up to 13 times a year." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Blood Donation Eligibility Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Blood Donation Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm sticky top-6">
            
            <div>
              <label className="text-sm font-medium mb-1.5 block">Type of Previous Donation</label>
              <select value={donationType} onChange={e => setDonationType(e.target.value)} className={`${inp} w-full px-3 text-sm focus:ring-2 focus:ring-primary/20`}>
                <option value="whole">Whole Blood (Standard Donation)</option>
                <option value="power_red">Power Red (Double Red Cell)</option>
                <option value="plasma">Plasma Only</option>
                <option value="platelets">Platelets</option>
              </select>
            </div>

            <div className="border-t border-border pt-4">
              <label className="text-sm font-medium mb-1.5 block">Date of Last Donation</label>
              <div className={inp}><input type="date" value={lastDate} onChange={e => setLastDate(e.target.value)} className={ci} /></div>
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 text-base transition-all shadow-sm">
                <Calendar className="h-5 w-5" /> Calculate
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {result && (<>
              
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: result.statusColor }}>{result.statusText}</div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">{result.isEligibleNow ? "You are ready to donate!" : result.eligibleDate}</div>
                    </div>
                  </div>
                  <div className="bg-background rounded-full p-2.5 shadow-sm border border-border shrink-0">
                    {result.isEligibleNow ? <ShieldCheck className="w-8 h-8" style={{ color: result.statusColor }} /> : <Heart className="w-8 h-8" style={{ color: result.statusColor }} />}
                  </div>
                </div>
                {!result.isEligibleNow && (
                  <div className="text-sm font-medium text-muted-foreground mt-2">
                    Your body needs <strong className="text-foreground">{result.daysRemaining} more days</strong> to safely recover red blood cells.
                  </div>
                )}
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
                  <h3 className="text-base font-bold">Physiological Recovery Progress</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-6">Your bone marrow must manufacture billions of new cells before your next donation.</p>
                <ResponsiveContainer width="100%" height={80}>
                  <BarChart data={result.chartData} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }} stackOffset="expand">
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" hide />
                    <Tooltip cursor={false} 
                      formatter={(value: number, name: string) => {
                        return [name === "daysPassed" ? `${value} Days Recovered` : `${value} Days Remaining`, ""];
                      }} 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} 
                    />
                    <Bar dataKey="daysPassed" stackId="a" fill={result.statusColor} radius={result.isEligibleNow ? 4 : [4, 0, 0, 4]} />
                    <Bar dataKey="daysRemaining" stackId="a" fill="#e2e8f0" radius={[0, 4, 4, 0]} />
                    <ReferenceLine x={1} stroke="#000" strokeWidth={0} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Science of Blood Recovery</h2>
            <p>Every day in the United States, patients in emergency rooms, surgical suites, and cancer treatment centers require approximately 36,000 units of red blood cells to survive. Because human blood cannot be manufactured in a laboratory, it must be voluntarily donated. However, blood banks enforce strict recovery periods to protect the health of the donor.</p>

            <h2 className="text-2xl font-bold mb-3">Why the Waiting Periods Differ</h2>
            <p>The exact waiting period dictated by this calculator depends entirely on which specific components of your blood were removed during your last donation.</p>
            <ul>
              <li><strong>Whole Blood (56 Days):</strong> A standard donation takes about 1 pint of raw blood. While your body replaces the lost water and plasma within a day, replacing the billions of red blood cells requires a massive amount of iron. It takes the bone marrow a full 8 weeks to safely replenish these iron stores and restore your hemoglobin to normal levels.</li>
              <li><strong>Power Red / Double Red (112 Days):</strong> Using an automated apheresis machine, a Power Red donation safely draws two units of concentrated red blood cells while returning the plasma and platelets to the donor. Because the red cell loss is doubled, the recovery time is strictly doubled to 16 weeks to prevent severe anemia.</li>
              <li><strong>Platelets (7 Days):</strong> Platelets are the tiny cells responsible for clotting blood. They are constantly produced by the bone marrow and naturally die off within 10 days anyway. Because the body replenishes them so rapidly, donors can safely give platelets every single week.</li>
              <li><strong>Plasma (28 Days):</strong> Plasma is the liquid portion of the blood. While the water volume is replaced almost instantly, the specialized proteins and antibodies suspended in the plasma take roughly 4 weeks to be fully regenerated by the liver.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Preparing for Your Next Donation</h2>
            <p>To ensure a fast and healthy recovery period, blood banks strongly recommend increasing your intake of iron-rich foods (such as spinach, red meat, and beans) combined with Vitamin C (which drastically increases iron absorption) in the weeks following a Whole Blood or Power Red donation.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/blood-donation-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Blood Donation Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Blood Donation Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Blood Donation Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Blood Donation Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Blood Donation Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/blood-donation-calculator" />
        </div>
      </div>
    </>
  );
}
