"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, CalendarHeart, Clock, Baby } from "lucide-react";

// 1. TypeScript Interfaces
interface PregnancyInputs {
  calculationMethod: "lmp" | "ultrasound" | "ivf3" | "ivf5";
  referenceDate: string; // YYYY-MM-DD
}

interface PregnancyResults {
  estimatedDueDate: string; // EDD
  conceptionDate: string;
  currentGestationalAgeWeeks: number;
  currentGestationalAgeDays: number;
  trimester: 1 | 2 | 3;
  daysRemaining: number;
  progressPct: number;
  milestones: { label: string; date: string; isPast: boolean }[];
}

// 2. Pure Calculation Function
const calculatePregnancy = (inputs: PregnancyInputs): PregnancyResults | null => {
  const { calculationMethod, referenceDate } = inputs;
  
  if (!referenceDate) return null;

  const refDate = new Date(referenceDate);
  refDate.setHours(12, 0, 0, 0); // Normalize to noon to avoid timezone shift issues
  
  let edd = new Date(refDate);
  let conception = new Date(refDate);

  if (calculationMethod === "lmp") {
    // Naegele's rule: EDD = LMP + 280 days. Conception = LMP + 14 days
    edd.setDate(edd.getDate() + 280);
    conception.setDate(conception.getDate() + 14);
  } else if (calculationMethod === "ultrasound") {
    // If ultrasound date is used, usually user enters the calculated EDD directly, 
    // or they enter the date of ultrasound and GA. For simplicity, we assume referenceDate IS the EDD.
    // So EDD = referenceDate. Conception = EDD - 266 days.
    edd = new Date(refDate);
    conception = new Date(refDate);
    conception.setDate(conception.getDate() - 266);
  } else if (calculationMethod === "ivf3") {
    // IVF 3-day transfer: EDD = Transfer Date + 266 days - 3 days. Conception = Transfer - 3 days.
    edd.setDate(edd.getDate() + 263);
    conception.setDate(conception.getDate() - 3);
  } else if (calculationMethod === "ivf5") {
    // IVF 5-day transfer: EDD = Transfer Date + 266 days - 5 days. Conception = Transfer - 5 days.
    edd.setDate(edd.getDate() + 261);
    conception.setDate(conception.getDate() - 5);
  }

  const today = new Date();
  today.setHours(12, 0, 0, 0);

  // LMP conceptually is 280 days before EDD
  const conceptualLmp = new Date(edd);
  conceptualLmp.setDate(conceptualLmp.getDate() - 280);

  // Current Gestational Age = today - conceptualLmp
  const diffTime = today.getTime() - conceptualLmp.getTime();
  const diffDaysTotal = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  let currentGestationalAgeWeeks = Math.floor(diffDaysTotal / 7);
  let currentGestationalAgeDays = diffDaysTotal % 7;

  // Bound GA between 0 and 42 weeks
  if (diffDaysTotal < 0) {
    currentGestationalAgeWeeks = 0;
    currentGestationalAgeDays = 0;
  } else if (diffDaysTotal > 294) {
    currentGestationalAgeWeeks = 42;
    currentGestationalAgeDays = 0;
  }

  let trimester: 1 | 2 | 3 = 1;
  if (currentGestationalAgeWeeks >= 28) {
    trimester = 3;
  } else if (currentGestationalAgeWeeks >= 13) {
    trimester = 2;
  }

  const daysRemaining = Math.max(0, 280 - diffDaysTotal);
  let progressPct = (diffDaysTotal / 280) * 100;
  if (progressPct < 0) progressPct = 0;
  if (progressPct > 100) progressPct = 100;

  // Format dates
  const formatDate = (d: Date) => d.toLocaleDateString("en-US", { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' });

  // Calculate milestones based on EDD
  const getMilestoneDate = (weeks: number) => {
    const d = new Date(conceptualLmp);
    d.setDate(d.getDate() + weeks * 7);
    return d;
  };

  const milestones = [
    { label: "End of First Trimester (13 Weeks)", date: formatDate(getMilestoneDate(13)), isPast: today > getMilestoneDate(13) },
    { label: "Second Trimester Anatomy Scan (18-22 Weeks)", date: formatDate(getMilestoneDate(20)), isPast: today > getMilestoneDate(20) },
    { label: "Viability (24 Weeks)", date: formatDate(getMilestoneDate(24)), isPast: today > getMilestoneDate(24) },
    { label: "Third Trimester Begins (28 Weeks)", date: formatDate(getMilestoneDate(28)), isPast: today > getMilestoneDate(28) },
    { label: "Early Term (37 Weeks)", date: formatDate(getMilestoneDate(37)), isPast: today > getMilestoneDate(37) },
    { label: "Estimated Due Date (40 Weeks)", date: formatDate(edd), isPast: today > edd },
  ];

  return {
    estimatedDueDate: formatDate(edd),
    conceptionDate: formatDate(conception),
    currentGestationalAgeWeeks,
    currentGestationalAgeDays,
    trimester,
    daysRemaining,
    progressPct,
    milestones
  };
};

export default function PregnancyCalculator() {
  const getTodayStr = () => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  };

  const [calculationMethod, setCalculationMethod] = useState<"lmp" | "ultrasound" | "ivf3" | "ivf5">("lmp");
  const [referenceDate, setReferenceDate] = useState<string>(getTodayStr());
  
  const [results, setResults] = useState<PregnancyResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    const inputs: PregnancyInputs = { calculationMethod, referenceDate };
    setResults(calculatePregnancy(inputs));
  };

  const handleReset = () => {
    setCalculationMethod("lmp");
    setReferenceDate(getTodayStr());
    setTimeout(handleCalculate, 10);
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calculationMethod, referenceDate]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Pregnancy Timeline</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "Why is the Estimated Due Date (EDD) 40 weeks?", answer: "Historically, pregnancy length was calculated from the first day of the Last Menstrual Period (LMP), which assumes conception happens roughly 2 weeks later. Thus, a full-term pregnancy is considered 280 days (40 weeks) from the LMP, even though the fetus is only 38 weeks old at birth." },
    { question: "How accurate is the Estimated Due Date?", answer: "Only about 4% to 5% of babies are actually born precisely on their estimated due date. The EDD is merely a statistical anchor. A baby is considered 'full term' anytime between 39 weeks and 40 weeks and 6 days." },
    { question: "What if my cycles are irregular?", answer: "If your cycles are longer or shorter than the standard 28 days, the LMP method might be inaccurate. In these cases, an early dating ultrasound (usually performed between 8 and 12 weeks) is the most accurate way to establish gestational age and your true EDD." },
    { question: "How does IVF change the calculation?", answer: "With In Vitro Fertilization (IVF), the exact date of conception is known. We calculate the EDD by adding 266 days to the embryo transfer date, and then subtracting the age of the embryo (usually 3 or 5 days) at the time of transfer." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Pregnancy Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Pregnancy Calculator & Timeline</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start max-w-[1100px]">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="flex items-center text-sm font-semibold text-foreground mb-1.5">Calculation Method</label>
              <select
                value={calculationMethod}
                onChange={(e) => setCalculationMethod(e.target.value as any)}
                className="w-full rounded-md border border-input bg-background px-3 h-10 text-base outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
              >
                <option value="lmp">First Day of Last Period (LMP)</option>
                <option value="ultrasound">Known Due Date (Ultrasound)</option>
                <option value="ivf5">IVF Transfer (5-Day Embryo)</option>
                <option value="ivf3">IVF Transfer (3-Day Embryo)</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label htmlFor="date" className="flex items-center text-sm font-semibold text-foreground mb-1.5">
                {calculationMethod === "lmp" ? "Date of Last Period" : calculationMethod === "ultrasound" ? "Estimated Due Date" : "Date of Embryo Transfer"}
              </label>
              <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                <input
                  id="date"
                  type="date"
                  value={referenceDate}
                  onChange={(e) => setReferenceDate(e.target.value)}
                  className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4 pt-4 border-t border-border">
              <button type="button" onClick={handleReset} className="w-full rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center font-bold text-sm">
                <RotateCcw className="h-4 w-4 mr-2" /> Reset Dates
              </button>
            </div>
          </div>

          {/* RIGHT: Results */}
          <div className="flex flex-col gap-4">
            {results ? (
              <div ref={printRef} className="flex flex-col gap-4 animate-fade-in-up">
                
                {/* 1. Primary Result Card */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-6 relative overflow-hidden shadow-sm">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors print:hidden z-10" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="relative z-10">
                    <div className="text-xs font-bold uppercase tracking-wider mb-2 text-primary">Estimated Due Date</div>
                    <div className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">{results.estimatedDueDate}</div>
                    <div className="flex items-center gap-4 mt-4 text-sm font-semibold text-muted-foreground">
                       <span className="flex items-center gap-1.5"><CalendarHeart className="h-4 w-4 text-pink-500" /> Conception: {results.conceptionDate}</span>
                    </div>
                  </div>
                  <Baby className="absolute -bottom-4 -right-4 h-32 w-32 opacity-5 text-foreground" />
                </div>

                {/* 2. Gestational Age & Trimester */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs font-bold uppercase tracking-wider mb-1 text-muted-foreground">Gestational Age</div>
                    <div className="text-2xl font-bold text-foreground">
                      {results.currentGestationalAgeWeeks}<span className="text-sm font-normal text-muted-foreground ml-1">wks</span> {results.currentGestationalAgeDays}<span className="text-sm font-normal text-muted-foreground ml-1">days</span>
                    </div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs font-bold uppercase tracking-wider mb-1 text-muted-foreground">Current Trimester</div>
                    <div className="text-2xl font-bold text-foreground">
                      Trimester {results.trimester}
                    </div>
                  </div>
                </div>

                {/* 3. Progress Bar */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                  <div className="flex justify-between items-end mb-2">
                    <h3 className="text-sm font-bold text-foreground">Pregnancy Progress</h3>
                    <span className="text-xs font-bold text-muted-foreground">{results.daysRemaining} days remaining</span>
                  </div>
                  <div className="h-4 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${results.progressPct}%` }}></div>
                  </div>
                  <div className="flex justify-between mt-1 text-[10px] text-muted-foreground font-semibold px-1">
                    <span>0 Wks</span>
                    <span>13 Wks</span>
                    <span>28 Wks</span>
                    <span>40 Wks</span>
                  </div>
                </div>

                {/* 4. Milestones */}
                <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
                  <div className="bg-muted/50 p-4 border-b border-border">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><Clock className="h-4 w-4" /> Important Milestones</h3>
                  </div>
                  <div className="p-0">
                    <table className="w-full text-sm">
                      <tbody>
                        {results.milestones.map((ms, i) => (
                          <tr key={i} className={`border-b border-border last:border-0 ${ms.isPast ? 'bg-secondary/20 text-muted-foreground opacity-70' : 'text-foreground'}`}>
                            <td className="py-3 px-4 font-semibold">{ms.label}</td>
                            <td className="py-3 px-4 text-right tabular-nums">{ms.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            ) : null}
          </div>
        </div>

        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding Your Pregnancy Timeline</h2>
            <p>Finding out you are pregnant is an incredibly exciting and life-changing moment. However, the medical math used to determine exactly how far along you are can often feel confusing. Our <strong>Pregnancy Calculator</strong> is designed to cut through the clinical jargon, providing you with a highly accurate Estimated Due Date (EDD), your exact current gestational age, and a customized timeline of crucial developmental milestones for your baby.</p>
            <p>Obstetricians and midwives use standard clinical formulas to track pregnancy progress. By understanding the methodology behind these calculations, you can better follow along with your medical charts, know when to schedule vital ultrasounds, and prepare for the physical changes occurring in each trimester.</p>

            <h2 className="text-2xl font-bold mb-3">Why is Pregnancy Calculated as 40 Weeks?</h2>
            <p>One of the most common questions newly expectant mothers ask is: "Why does my doctor say I'm 6 weeks pregnant when I know I conceived only 4 weeks ago?"</p>
            <p>The discrepancy lies in historical medical practices. Before the invention of modern ultrasound technology or ovulation tracking, doctors had no reliable way of knowing exactly when a woman ovulated or conceived. However, they could rely on a highly visible biological marker: the first day of a woman's Last Menstrual Period (LMP).</p>
            <p>Therefore, medical convention established that "gestational age" begins on the first day of the LMP. Because ovulation typically occurs roughly 14 days after the LMP in a standard 28-day cycle, the first two weeks of your official "pregnancy" occur before you have even conceived. A full-term human gestation is approximately 266 days from the moment of conception. When you add the two-week (14 days) pre-conception window, you arrive at the standard 280 days, or exactly 40 weeks.</p>

            <h2 className="text-2xl font-bold mb-3">Calculation Methods Explained</h2>
            <p>Depending on your unique reproductive circumstances, our calculator offers several methods to determine your due date:</p>

            <h3>1. Last Menstrual Period (LMP)</h3>
            <p>This is the standard Naegele's rule method used universally in clinical practice. You simply input the first day of your last period. The formula adds 280 days to that date. This method is highly accurate for women with regular, 28-day menstrual cycles. If your cycles are significantly longer or shorter, this method may artificially inflate or deflate your true gestational age.</p>

            <h3>2. Known Due Date (Ultrasound Dating)</h3>
            <p>If you have irregular cycles, or if your doctor performed an early "dating ultrasound" (typically between 8 and 12 weeks), they will measure the Crown-Rump Length (CRL) of the fetus. This measurement is incredibly precise and is considered the gold standard for dating a pregnancy. If your ultrasound generates a due date that differs from your LMP date by more than 5-7 days, your doctor will likely officially change your EDD to match the ultrasound. You can select this method in the calculator to map out your milestones based on this confirmed date.</p>

            <h3>3. In Vitro Fertilization (IVF)</h3>
            <p>For mothers undergoing fertility treatments, the exact moment of fertilization is known in a laboratory. Therefore, LMP is completely irrelevant. For IVF transfers, the EDD is calculated based on the embryo transfer date and the age of the embryo at transfer (usually a Day-3 cleavage stage embryo or a Day-5 blastocyst). The formula adds 266 days to the transfer date, and then subtracts the 3 or 5 days the embryo spent developing outside the womb.</p>

            <h2 className="text-2xl font-bold mb-3">The Three Trimesters</h2>
            <p>A full-term pregnancy is divided into three distinct phases, known as trimesters, each characterized by specific fetal developments and maternal symptoms.</p>
            <ul>
              <li><strong>First Trimester (Weeks 1 to 13):</strong> This is the period of rapid organogenesis. The fertilized egg transforms from a microscopic cluster of cells into a fetus with a beating heart, brain waves, and developing limbs. Because this developmental phase is so complex, it carries the highest risk of miscarriage. Mothers often experience intense fatigue and morning sickness during these weeks.</li>
              <li><strong>Second Trimester (Weeks 14 to 27):</strong> Often referred to as the "honeymoon phase" of pregnancy, nausea typically subsides, and maternal energy returns. The baby grows rapidly, and mothers usually begin to feel the first fetal movements (quickening) between 18 and 22 weeks. The critical anatomy scan ultrasound occurs during this trimester.</li>
              <li><strong>Third Trimester (Weeks 28 to 40+):</strong> The final stretch is focused on weight gain and lung maturation for the baby. The fetus plumps up with fat to regulate body temperature after birth. For the mother, the physical burden of the growing uterus often causes backaches, shortness of breath, and frequent urination. The baby descends into the pelvis in preparation for labor.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Understanding Milestones and "Viability"</h2>
            <p>Our calculator generates a timeline of essential milestones. One of the most emotionally significant milestones is the point of <strong>viability</strong>, generally recognized at 24 weeks gestation. This marks the threshold at which a prematurely born infant has a fighting chance of survival outside the womb with intensive neonatal care (NICU support). Reaching 24 weeks provides immense psychological relief for many expectant parents.</p>
            <p>Another crucial milestone is <strong>Early Term</strong> (37 weeks). By 37 weeks, fetal lung development is usually complete. If you were to go into labor at this point, doctors would not attempt to stop it, as the baby is considered mature enough to breathe independently.</p>

            <h2 className="text-2xl font-bold mb-3">Conclusion</h2>
            <p>While the Estimated Due Date is a vital clinical tool, it is important to remember that it is merely an estimate. Babies are not governed by calendars. Only about 4% to 5% of babies arrive exactly on their EDD. The vast majority are born perfectly healthy sometime within the two weeks before or the week after that date. Use our Pregnancy Calculator to stay informed, track your baby's remarkable journey, and prepare for the joyous arrival of your little one.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/pregnancy-calculator" />
          <PopularCalculators exclude="/calculator/pregnancy-calculator" />
        </div>
      </div>
    </>
  );
}
