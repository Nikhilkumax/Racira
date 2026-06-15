"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";

interface IVFResult {
  edd: Date;
  gestationalAgeWeeks: number;
  gestationalAgeDays: number;
  retrievalDate: Date;
  conceptionDate: Date;
  trimester: number;
  milestones: { label: string; date: Date; description: string }[];
  chartData: { name: string; days: number; fill: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcIVF(
  transferDateStr: string, transferType: string
): IVFResult {
  const transferDate = new Date(transferDateStr);
  const today = new Date();
  today.setHours(0,0,0,0);
  
  let edd = new Date();
  let conceptionDate = new Date(); // Essentially ovulation date / fertilization date
  
  // Standard gestation from conception is 266 days (38 weeks)
  if (transferType === "day3") {
    // Embryo is 3 days old at transfer
    edd = new Date(transferDate.getTime() + 263 * 24 * 60 * 60 * 1000);
    conceptionDate = new Date(transferDate.getTime() - 3 * 24 * 60 * 60 * 1000);
  } else if (transferType === "day5") {
    // Embryo is 5 days old at transfer
    edd = new Date(transferDate.getTime() + 261 * 24 * 60 * 60 * 1000);
    conceptionDate = new Date(transferDate.getTime() - 5 * 24 * 60 * 60 * 1000);
  } else if (transferType === "day6") {
    // Treat Day 6 blastocyst same as Day 5 for gestational age purposes
    edd = new Date(transferDate.getTime() + 261 * 24 * 60 * 60 * 1000);
    conceptionDate = new Date(transferDate.getTime() - 5 * 24 * 60 * 60 * 1000);
  }

  // Artificial LMP (always 14 days before conception/retrieval in a textbook 28-day cycle)
  const lmpDate = new Date(conceptionDate.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Calculate Gestational Age based on artificial LMP
  const diffTime = today.getTime() - lmpDate.getTime();
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Safeguard against future transfer dates or negative dates
  const gaSafeguarded = Math.max(0, Math.min(300, totalDays));
  
  const gestationalAgeWeeks = Math.floor(gaSafeguarded / 7);
  const gestationalAgeDays = gaSafeguarded % 7;

  // Trimester
  let trimester = 1;
  if (gestationalAgeWeeks >= 13 && gestationalAgeWeeks < 27) trimester = 2;
  else if (gestationalAgeWeeks >= 27) trimester = 3;
  if (gaSafeguarded === 0) trimester = 0; // Pre-pregnancy

  // Milestones
  const t1End = new Date(lmpDate.getTime() + 13 * 7 * 24 * 60 * 60 * 1000);
  const t2End = new Date(lmpDate.getTime() + 27 * 7 * 24 * 60 * 60 * 1000);

  const milestones = [
    { label: "Artificial LMP", date: lmpDate, description: "Start of Gestational Week 1" },
    { label: "Conception / Retrieval", date: conceptionDate, description: "When fertilization occurred" },
    { label: "Embryo Transfer", date: transferDate, description: "Blastocyst returned to uterus" },
    { label: "First Trimester Ends", date: t1End, description: "Week 13 completed" },
    { label: "Anatomy Scan Window", date: new Date(lmpDate.getTime() + 20 * 7 * 24 * 60 * 60 * 1000), description: "Detailed 20-week ultrasound" },
    { label: "Viability Milestone", date: new Date(lmpDate.getTime() + 24 * 7 * 24 * 60 * 60 * 1000), description: "Week 24 completed" },
    { label: "Third Trimester Begins", date: t2End, description: "Week 27 completed" },
    { label: "Estimated Due Date", date: edd, description: "40 Weeks (Full Term)" }
  ];

  const summaryStats = [
    { label: "Current Week", value: `Week ${gestationalAgeWeeks}` },
    { label: "Days Pregnant", value: `${gaSafeguarded} days` },
    { label: "Days Until Due", value: `${Math.max(0, 280 - gaSafeguarded)} days` },
    { label: "Est. Trimester", value: `Trimester ${trimester}` },
  ];

  // Chart: Days spent in each trimester vs total remaining
  const daysInT1 = Math.min(13 * 7, gaSafeguarded);
  const daysInT2 = Math.min(14 * 7, Math.max(0, gaSafeguarded - 13 * 7));
  const daysInT3 = Math.min(13 * 7, Math.max(0, gaSafeguarded - 27 * 7));
  const totalCompleted = daysInT1 + daysInT2 + daysInT3;
  const remaining = Math.max(0, 280 - totalCompleted);

  const chartData = [
    { name: "Tri 1", days: daysInT1, fill: "#3b82f6" },
    { name: "Tri 2", days: daysInT2, fill: "#8b5cf6" },
    { name: "Tri 3", days: daysInT3, fill: "#ec4899" },
    { name: "Remaining", days: remaining, fill: "#e2e8f0" },
  ];

  return { edd, gestationalAgeWeeks, gestationalAgeDays, retrievalDate: conceptionDate, conceptionDate, trimester, milestones, chartData, summaryStats };
}

export default function IvfDueDateCalculator() {
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() - 30); // ~1 month ago
  const defaultDateStr = defaultDate.toISOString().split('T')[0];

  const [transferDate, setTransferDate] = useState(defaultDateStr);
  const [transferType, setTransferType] = useState("day5");
  const [result, setResult] = useState<IVFResult | null>(null);

  const calculate = () => {
    setResult(calcIVF(transferDate, transferType));
  };

  useEffect(() => { setResult(calcIVF(defaultDateStr, "day5")); }, [defaultDateStr]);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "Why is the IVF calculation more accurate than LMP?", answer: "In a standard, unassisted pregnancy, a woman calculates her due date using the first day of her Last Menstrual Period (LMP). This standard assumes she ovulated exactly on day 14 of her cycle, which is rarely true. In IVF (In Vitro Fertilization), doctors know the precise day the egg was fertilized and exactly how many days it developed in the lab before transfer. This removes all guesswork." },
    { question: "What is an 'Artificial LMP'?", answer: "The entire medical system dates pregnancies based on LMP, starting Gestational Week 1 two weeks before ovulation ever occurs. To make your IVF pregnancy fit into standard medical charts, ultrasound systems, and pregnancy apps, doctors calculate an 'Artificial LMP' by taking your retrieval/fertilization date and subtracting exactly 14 days." },
    { question: "Does a Day 6 transfer change my due date?", answer: "No. A Day 6 blastocyst simply took slightly longer in the lab to reach the blastocyst stage. However, it is developmentally considered a Day 5 embryo when transferred. You calculate the due date identically to a Day 5 transfer." },
    { question: "Am I considered 'pregnant' on the day of transfer?", answer: "Yes and no. Once the embryo is transferred, the IVF community considers you 'Pregnant Until Proven Otherwise' (PUPO). However, in terms of clinical gestational age, on the morning of a Day 5 transfer, you are mathematically already considered 2 weeks and 5 days pregnant." },
    { question: "Will the doctor change my due date at the dating ultrasound?", answer: "Rarely. Because the exact fertilization date is absolutely known in IVF pregnancies, doctors almost never change the due date based on an early ultrasound measurement. An IVF due date is considered absolute, whereas an LMP due date is just an estimate." },
    { question: "What if I used frozen embryos (FET)?", answer: "The calculation is exactly the same! Whether the embryo was frozen for two months or ten years, the only thing that matters for the due date calculation is the age of the embryo (Day 3 vs Day 5) and the calendar date it was transferred into the uterus." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "IVF Due Date Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">IVF Due Date Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Embryo Transfer Date</label>
              <div className={inp}><input type="date" value={transferDate} onChange={e => setTransferDate(e.target.value)} className={ci} /></div>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">The exact calendar date the embryo was transferred to the uterus.</p>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1.5 block">Transfer Type (Embryo Age)</label>
              <select value={transferType} onChange={e => setTransferType(e.target.value)} className={`${inp} w-full px-3 text-base`}>
                <option value="day3">Day 3 Embryo (Cleavage Stage)</option>
                <option value="day5">Day 5 Blastocyst</option>
                <option value="day6">Day 6 Blastocyst</option>
              </select>
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">
                <Calculator className="h-4 w-4" /> Calculate Milestones
              </button>
              <button onClick={() => { setTransferDate(defaultDateStr); setTransferType("day5"); setResult(calcIVF(defaultDateStr, "day5")); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-5 shadow-sm">
                <div className="text-xs font-bold uppercase tracking-wider mb-1 text-primary">Estimated Due Date (EDD)</div>
                <div className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight mb-2">
                  {result.edd.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'})}
                </div>
                {result.trimester > 0 ? (
                  <div className="text-base font-medium mt-1">You are currently <span className="font-bold text-primary">{result.gestationalAgeWeeks} Weeks, {result.gestationalAgeDays} Days</span> pregnant.</div>
                ) : (
                  <div className="text-base text-muted-foreground mt-1 font-medium">Transfer date is in the future.</div>
                )}
              </div>
              
              <div className="card-calculator !p-0 border border-border bg-card overflow-hidden shadow-sm">
                <div className="p-4 bg-muted/50 border-b border-border font-bold flex items-center gap-2 text-base">
                  <Calendar className="w-5 h-5 text-primary" /> Pregnancy Timeline
                </div>
                <div className="flex flex-col">
                  {result.milestones.map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row border-b border-border/50 last:border-0 p-4 hover:bg-muted/20 transition-colors">
                      <div className="w-full sm:w-36 font-bold text-primary shrink-0 mb-1 sm:mb-0 text-base mt-0.5">
                        {item.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-foreground mb-1 text-base">{item.label}</div>
                        <div className="text-sm text-muted-foreground leading-relaxed">{item.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                <h3 className="text-base font-bold mb-4">Gestation Progress (Days)</h3>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={result.chartData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" domain={[0, 280]} hide />
                    <YAxis type="category" dataKey="name" hide />
                    <Tooltip cursor={{ fill: 'transparent' }} formatter={(v: number) => [`${v} days`, "Duration"]} />
                    <Bar dataKey="days" stackId="a" radius={[0, 0, 0, 0]}>
                      {result.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex justify-between text-xs text-muted-foreground mt-2 px-2 font-medium">
                  <span>Conception (0)</span>
                  <span>Trimester 2</span>
                  <span>Trimester 3</span>
                  <span>Birth (280)</span>
                </div>
              </div>

              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Pregnancy Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mx-auto mt-12">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance max-w-none">
            <h2>The Unmatched Precision of IVF Pregnancy Dating</h2>
            <p>In a standard, unassisted pregnancy, a woman must calculate her Estimated Due Date (EDD) using the first day of her Last Menstrual Period (LMP). This biological dating standard assumes that every woman operates on a perfect 28-day cycle and ovulates exactly on day 14. Because this is rarely true, natural pregnancy due dates are, at best, highly educated guesses.</p>
            <p>In Vitro Fertilization (IVF) fundamentally changes this. Because medical embryologists know the precise moment the egg was fertilized in the laboratory, and exactly how many hours it developed before being transferred into the uterus, IVF offers absolute mathematical precision. There is no guesswork regarding ovulation. Your Estimated Due Date is anchored to exact scientific events.</p>

            <h2>Understanding the "Artificial LMP"</h2>
            <p>If IVF is so precise, why do reproductive endocrinologists still talk about your "LMP"?</p>
            <p>The entire global obstetrics system—from ultrasound machines and fetal growth charts to standard pregnancy tracking apps—is hardwired to date pregnancies based on the Last Menstrual Period. To make your high-tech IVF pregnancy fit neatly into this standard medical framework, your doctor will calculate an <strong>Artificial LMP</strong>.</p>
            <p>They do this by taking your exact retrieval/fertilization date and subtracting exactly 14 days. This artificially forces your pregnancy into a perfect 28-day cycle model. Because of this artificial dating system, on the morning of a Day 5 embryo transfer, you are already clinically considered to be <strong>2 weeks and 5 days pregnant</strong>, even though the embryo is only just entering your body.</p>

            <h2>Day 3 vs. Day 5 Embryo Transfers</h2>
            <p>The math behind your due date shifts slightly depending on how long the embryo was allowed to grow in the laboratory before the transfer occurred.</p>
            
            <h3>Day 3 Transfers (Cleavage Stage)</h3>
            <p>If you transfer an embryo on Day 3, the embryo has had three days to grow. The formula to calculate your due date is: <strong>Transfer Date + 266 days - 3 days</strong>. (266 days is the standard human gestation length from the exact moment of conception).</p>

            <h3>Day 5 Transfers (Blastocyst Stage)</h3>
            <p>By Day 5, the embryo has reached the blastocyst stage, meaning it has grown and divided significantly more than a Day 3 embryo. Because it has spent two additional days developing outside the womb, your due date will be exactly two days earlier than if you had transferred a Day 3 embryo on the exact same calendar date. The formula is: <strong>Transfer Date + 266 days - 5 days</strong>.</p>

            <h3>What about a Day 6 Transfer?</h3>
            <p>Occasionally, an embryo takes slightly longer to reach the blastocyst stage and is transferred on Day 6. Do you subtract 6 days from the calculation? No. A Day 6 blastocyst is developmentally identical to a Day 5 blastocyst; it was simply a "slow grower" in the lab. Therefore, for clinical dating purposes, a Day 6 transfer is calculated identically to a Day 5 transfer.</p>

            <h2>Fresh vs. Frozen Embryo Transfers (FET)</h2>
            <p>Many patients wonder if the calculation changes if they freeze their embryos and wait months (or years) before transferring them. The answer is no. The gestational clock pauses entirely while the embryo is cryopreserved. The only variables that matter for the due date calculation are the age of the embryo when it was frozen (Day 3 vs. Day 5) and the calendar date the Frozen Embryo Transfer (FET) actually takes place.</p>

            <h2>Will the Doctor Change My Due Date Later?</h2>
            <p>In a standard pregnancy, a doctor will often adjust a woman's due date after her 8-week dating ultrasound if the fetus is measuring larger or smaller than the LMP calculation suggests. <strong>This rarely happens in an IVF pregnancy.</strong></p>
            <p>Because the exact fertilization date is absolutely known, an IVF due date is considered absolute. If an early ultrasound shows the fetus measuring a few days ahead or behind the IVF calculated date, doctors usually attribute this to natural growth variations or slight measurement errors by the ultrasound technician, rather than changing the due date itself.</p>

            <h2>Tracking Your Critical IVF Milestones</h2>
            <p>An IVF pregnancy comes with unique milestones that differ slightly from a standard pregnancy timeline:</p>
            <ul>
              <li><strong>The Wait (PUPO):</strong> Once the transfer is complete, you are considered "Pregnant Until Proven Otherwise" (PUPO). You will wait roughly 9 to 14 days for a Beta hCG blood test to confirm implantation.</li>
              <li><strong>Viability Scan:</strong> At roughly 6.5 to 7 weeks pregnant (which is only 4 weeks after a Day 5 transfer), you will have your first ultrasound to confirm a fetal heartbeat.</li>
              <li><strong>Graduation:</strong> Most IVF patients "graduate" from their specialized fertility clinic and transition to a standard OB/GYN around week 8 to 10 of the pregnancy.</li>
              <li><strong>Second Trimester:</strong> The first trimester officially ends upon the completion of Week 13. The risk of miscarriage drops exponentially at this stage.</li>
              <li><strong>Anatomy Scan:</strong> At 20 weeks, you will undergo a comprehensive ultrasound to measure all fetal organs and confirm structural development.</li>
            </ul>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ivf-due-date-calculator" />
          <PopularCalculators exclude="/calculator/ivf-due-date-calculator" />
        </div>
      </div>
    </>
  );
}
